// OmniSight Web – Auth-Kern (nur Node-Standardbibliothek, keine Abhängigkeiten).
// Nutzer + Sessions liegen als JSON unter DATA_DIR (Docker-Volume). Passwörter: scrypt
// mit zufälligem Salt. 2FA: TOTP (RFC 6238, SHA-1, 6 Stellen, 30 s) – kompatibel mit
// Google Authenticator, Aegis, 1Password usw.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = process.env.DATA_DIR || './data';
const DB_FILE = join(DATA_DIR, 'auth.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

// ---------- Datei-Store (atomar schreiben) ----------
function load() {
	try {
		return JSON.parse(readFileSync(DB_FILE, 'utf8'));
	} catch {
		return { users: [], sessions: {} };
	}
}
function save(db) {
	mkdirSync(DATA_DIR, { recursive: true });
	const tmp = DB_FILE + '.tmp';
	writeFileSync(tmp, JSON.stringify(db, null, 2));
	renameSync(tmp, DB_FILE);
}
let db = load();

// ---------- Passwörter (scrypt) ----------
export function hashPassword(pw) {
	const salt = randomBytes(16);
	const hash = scryptSync(pw, salt, 32);
	return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export function verifyPassword(pw, stored) {
	try {
		const [, saltB64, hashB64] = stored.split('$');
		const calc = scryptSync(pw, Buffer.from(saltB64, 'base64'), 32);
		return timingSafeEqual(calc, Buffer.from(hashB64, 'base64'));
	} catch {
		return false;
	}
}

// ---------- TOTP (RFC 6238) ----------
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function b32encode(buf) {
	let bits = 0, value = 0, out = '';
	for (const byte of buf) {
		value = (value << 8) | byte; bits += 8;
		while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
	}
	if (bits > 0) out += B32[(value << (5 - bits)) & 31];
	return out;
}
export function b32decode(str) {
	let bits = 0, value = 0; const out = [];
	for (const ch of str.replace(/=+$/, '').toUpperCase()) {
		const idx = B32.indexOf(ch);
		if (idx < 0) continue;
		value = (value << 5) | idx; bits += 5;
		if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
	}
	return Buffer.from(out);
}
export function totpCode(secretB32, timeStepOffset = 0) {
	const key = b32decode(secretB32);
	const counter = Math.floor(Date.now() / 1000 / 30) + timeStepOffset;
	const msg = Buffer.alloc(8);
	msg.writeBigUInt64BE(BigInt(counter));
	const h = createHmac('sha1', key).update(msg).digest();
	const off = h[h.length - 1] & 0x0f;
	const code = ((h[off] & 0x7f) << 24 | h[off + 1] << 16 | h[off + 2] << 8 | h[off + 3]) % 1_000_000;
	return String(code).padStart(6, '0');
}
export function verifyTotp(secretB32, code) {
	const clean = String(code || '').replace(/\s+/g, '');
	if (!/^\d{6}$/.test(clean)) return false;
	// ±1 Zeitschritt Toleranz (Uhrenabweichung).
	return [-1, 0, 1].some((o) => {
		const expect = totpCode(secretB32, o);
		return timingSafeEqual(Buffer.from(expect), Buffer.from(clean));
	});
}
export function newTotpSecret() {
	return b32encode(randomBytes(20));
}

// ---------- Nutzerverwaltung ----------
export function listUsers() {
	return db.users.map((u) => ({
		id: u.id,
		username: u.username,
		isAdmin: !!u.isAdmin,
		totp: !!u.totpSecret,
		mustSetup: !!u.mustSetup,
		backupCodesLeft: Array.isArray(u.backupCodes) ? u.backupCodes.filter((e) => !e.used).length : 0
	}));
}
export function findUser(username) {
	return db.users.find((u) => u.username.toLowerCase() === String(username || '').toLowerCase()) || null;
}
export function userById(id) {
	return db.users.find((u) => u.id === id) || null;
}
export function createUser(username, password, isAdmin = false) {
	if (!/^[a-zA-Z0-9._-]{2,32}$/.test(username)) throw new Error('Ungültiger Benutzername (2–32 Zeichen, a–z 0–9 . _ -).');
	if (findUser(username)) throw new Error('Benutzername existiert bereits.');
	if (String(password).length < 8) throw new Error('Passwort braucht mindestens 8 Zeichen.');
	const user = {
		id: randomBytes(8).toString('hex'),
		username,
		passHash: hashPassword(password),
		totpSecret: null,
		isAdmin,
		mustSetup: true, // erzwingt 2FA-Einrichtung beim ersten Login
		createdAt: new Date().toISOString()
	};
	db.users.push(user);
	save(db);
	return user;
}
export function deleteUser(id) {
	db.users = db.users.filter((u) => u.id !== id);
	for (const [sid, sess] of Object.entries(db.sessions)) if (sess.userId === id) delete db.sessions[sid];
	save(db);
}
export function resetPassword(id, newPw) {
	const u = userById(id);
	if (!u) throw new Error('Nutzer nicht gefunden.');
	if (String(newPw).length < 8) throw new Error('Passwort braucht mindestens 8 Zeichen.');
	u.passHash = hashPassword(newPw);
	u.totpSecret = null;
	u.backupCodes = []; // an das alte 2FA-Secret gebundene Codes werden ungültig
	u.mustSetup = true; // 2FA neu einrichten
	save(db);
}
// Selbstbedienung: Nutzer ändert sein eigenes Passwort (Gegensatz zum Admin-Reset:
// verlangt das aktuelle Passwort, lässt 2FA unangetastet).
export function changeOwnPassword(id, oldPw, newPw) {
	const u = userById(id);
	if (!u) throw new Error('Nutzer nicht gefunden.');
	if (!verifyPassword(oldPw, u.passHash)) throw new Error('Aktuelles Passwort ist falsch.');
	if (String(newPw).length < 8) throw new Error('Neues Passwort braucht mindestens 8 Zeichen.');
	if (oldPw === newPw) throw new Error('Neues Passwort muss sich vom alten unterscheiden.');
	u.passHash = hashPassword(newPw);
	save(db);
}
export function setTotp(id, secret) {
	const u = userById(id);
	if (!u) throw new Error('Nutzer nicht gefunden.');
	u.totpSecret = secret;
	u.mustSetup = false;
	save(db);
}

// ---------- Backup-Codes (Einmal-Codes für den Fall eines verlorenen Authenticators) ----------
// Werden EINMALIG im Klartext zurückgegeben (beim Erzeugen) und danach nur noch gehasht
// gespeichert – wie Passwörter. Format xxxxx-xxxxx (10 Hex-Zeichen, gut lesbar/abtippbar).
export function generateBackupCodes(id, count = 10) {
	const u = userById(id);
	if (!u) throw new Error('Nutzer nicht gefunden.');
	const plain = [];
	const stored = [];
	for (let i = 0; i < count; i++) {
		const raw = randomBytes(5).toString('hex'); // 10 Hex-Zeichen
		const code = `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
		plain.push(code);
		stored.push({ hash: hashPassword(code), used: false });
	}
	u.backupCodes = stored;
	save(db);
	return plain; // NUR hier im Klartext sichtbar – dem Nutzer einmalig anzeigen.
}
export function verifyBackupCode(id, code) {
	const u = userById(id);
	if (!u || !Array.isArray(u.backupCodes)) return false;
	const clean = String(code || '').trim().toLowerCase();
	for (const entry of u.backupCodes) {
		if (!entry.used && verifyPassword(clean, entry.hash)) {
			entry.used = true;
			save(db);
			return true;
		}
	}
	return false;
}
export function backupCodesRemaining(id) {
	const u = userById(id);
	if (!u || !Array.isArray(u.backupCodes)) return 0;
	return u.backupCodes.filter((e) => !e.used).length;
}
export function adminExists() {
	return db.users.some((u) => u.isAdmin);
}

// ---------- Sessions ----------
export function createSession(userId, stage = 'full') {
	const sid = randomBytes(32).toString('base64url');
	db.sessions[sid] = { userId, stage, expires: Date.now() + (stage === 'full' ? SESSION_TTL_MS : 10 * 60 * 1000) };
	save(db);
	return sid;
}
export function getSession(sid) {
	const s = sid ? db.sessions[sid] : null;
	if (!s) return null;
	if (Date.now() > s.expires) { delete db.sessions[sid]; save(db); return null; }
	return s;
}
export function upgradeSession(sid) {
	const s = db.sessions[sid];
	if (!s) return;
	s.stage = 'full';
	s.expires = Date.now() + SESSION_TTL_MS;
	save(db);
}
export function destroySession(sid) {
	if (sid && db.sessions[sid]) { delete db.sessions[sid]; save(db); }
}

// ---------- Login-Rate-Limit (im Speicher) ----------
const attempts = new Map(); // key -> { n, until }
export function rateLimited(key) {
	const a = attempts.get(key);
	return !!(a && a.until > Date.now());
}
export function noteFailure(key) {
	const a = attempts.get(key) || { n: 0, until: 0 };
	a.n += 1;
	if (a.n >= 5) { a.until = Date.now() + 5 * 60 * 1000; a.n = 0; } // 5 Fehlversuche -> 5 min Sperre
	attempts.set(key, a);
}
export function noteSuccess(key) {
	attempts.delete(key);
}
