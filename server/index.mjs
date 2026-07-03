// OmniSight Web-Server – dient die gebaute App (build/) hinter Login + 2FA aus und
// stellt die TMDB-Kommandos als HTTP-API bereit (gleiche Namen wie die Tauri-Commands,
// der TMDB-Key bleibt ausschließlich auf dem Server: Umgebungsvariable TMDB_API_KEY).
// Nur Node-Standardbibliothek – keine Abhängigkeiten. Start: node server/index.mjs
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import qrcodegen from 'qrcode-generator';
import {
	findUser, userById, createUser, deleteUser, resetPassword, listUsers, adminExists,
	verifyPassword, newTotpSecret, verifyTotp, setTotp, changeOwnPassword,
	generateBackupCodes, verifyBackupCode, backupCodesRemaining,
	createSession, getSession, upgradeSession, destroySession,
	rateLimited, noteFailure, noteSuccess
} from './auth.mjs';

const PORT = Number(process.env.PORT || 8480);
// Version aus package.json lesen statt hartzukodieren (sonst veraltet sie bei jedem Release).
const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_VERSION = (() => {
	try { return JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version; }
	catch { return 'unknown'; }
})();
const BUILD_DIR = process.env.BUILD_DIR || './build';
const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = (p, size = 'w500') => (p ? `https://image.tmdb.org/t/p/${size}${p}` : null);

const MIME = {
	'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
	'.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
	'.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain'
};

// ---------- Hilfen ----------
function send(res, code, body, headers = {}) {
	const isObj = typeof body === 'object' && !(body instanceof Buffer);
	res.writeHead(code, { 'Content-Type': isObj ? 'application/json' : (headers['Content-Type'] || 'text/plain; charset=utf-8'), ...headers });
	res.end(isObj ? JSON.stringify(body) : body);
}
function readBody(req) {
	return new Promise((resolve) => {
		let data = '';
		req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
		req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
	});
}
function cookies(req) {
	const out = {};
	for (const part of String(req.headers.cookie || '').split(';')) {
		const i = part.indexOf('=');
		if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
	}
	return out;
}
function setSession(res, sid) {
	// Hinter Tailscale/Reverse-Proxy meist HTTPS; "Secure" schadet bei HTTP im LAN -> konfigurierbar.
	const secure = process.env.COOKIE_SECURE === '1' ? ' Secure;' : '';
	res.setHeader('Set-Cookie', `osid=${sid}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${30 * 24 * 3600}`);
}
function clearSession(res) {
	res.setHeader('Set-Cookie', 'osid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
}

// ---------- TMDB (spiegelt die Rust-Kommandos) ----------
async function tmdbGet(path, params = []) {
	if (!TMDB_KEY) throw new Error('TMDB_API_KEY fehlt auf dem Server.');
	const url = new URL(TMDB_BASE + path);
	url.searchParams.set('language', 'de-DE');
	for (const [k, v] of params) url.searchParams.set(k, v);
	const headers = {};
	if (TMDB_KEY.startsWith('ey')) headers.Authorization = `Bearer ${TMDB_KEY}`;
	else url.searchParams.set('api_key', TMDB_KEY);
	const r = await fetch(url, { headers });
	if (!r.ok) throw new Error(`TMDB ${r.status}`);
	return r.json();
}
function mapItem(r, fallbackType) {
	const media = r.media_type === 'tv' || r.media_type === 'movie' ? r.media_type : fallbackType;
	return {
		id: r.id,
		media_type: media,
		title: r.title ?? r.name ?? '',
		overview: r.overview ?? '',
		poster: IMG(r.poster_path),
		backdrop: IMG(r.backdrop_path, 'w780'),
		release_date: r.release_date ?? r.first_air_date ?? null,
		vote_average: r.vote_average ?? null
	};
}
const rpc = {
	tmdb_search: async ({ query }) => {
		const d = await tmdbGet('/search/multi', [['query', String(query ?? '')], ['include_adult', 'false']]);
		return (d.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv').map((r) => mapItem(r, 'movie'));
	},
	tmdb_trending: async () => {
		const d = await tmdbGet('/trending/all/week');
		return (d.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv').map((r) => mapItem(r, 'movie'));
	},
	tmdb_upcoming: async () => {
		const d = await tmdbGet('/movie/upcoming', [['region', 'DE']]);
		return (d.results || []).map((r) => mapItem(r, 'movie'));
	},
	tmdb_list: async ({ path, params, mediaFallback }) => {
		const d = await tmdbGet(String(path), Array.isArray(params) ? params : []);
		return (d.results || []).map((r) => mapItem(r, mediaFallback === 'tv' ? 'tv' : 'movie'));
	},
	tmdb_details: async ({ mediaType, id }) =>
		tmdbGet(`/${mediaType === 'tv' ? 'tv' : 'movie'}/${Number(id)}`, [['append_to_response', 'videos,watch/providers']]),
	tmdb_season: async ({ id, season }) => tmdbGet(`/tv/${Number(id)}/season/${Number(season)}`)
};

// ---------- QR-Code (verifiziert per OpenCV-Scan-Test während der Entwicklung) ----------
function qrSvg(text, { moduleSize = 5, quiet = 4, dark = '#0b0c10', light = '#ffffff' } = {}) {
	const qr = qrcodegen(0, 'M'); // typeNumber 0 = automatisch passende Version, EC-Level M
	qr.addData(text);
	qr.make();
	const n = qr.getModuleCount();
	const size = (n + quiet * 2) * moduleSize;
	let rects = '';
	for (let r = 0; r < n; r++) {
		for (let c = 0; c < n; c++) {
			if (qr.isDark(r, c)) {
				rects += `<rect x="${(c + quiet) * moduleSize}" y="${(r + quiet) * moduleSize}" width="${moduleSize}" height="${moduleSize}"/>`;
			}
		}
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="220" height="220" shape-rendering="crispEdges" role="img" aria-label="QR-Code für die Authenticator-App"><rect width="${size}" height="${size}" fill="${light}"/><g fill="${dark}">${rects}</g></svg>`;
}

// ---------- Login-/Setup-Seiten (eigenständig, im App-Design) ----------
function loginPage(msg = '') {
	return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OmniSight – Anmelden</title><style>
:root{--accent:#30c5bb;--bg:#0b0c10;--elev:#0f1015;--text:#f1f3f6;--muted:#8b8f9a;--border:#2a2e3a}
*{box-sizing:border-box}body{margin:0;height:100vh;display:grid;place-items:center;background:radial-gradient(120% 90% at 50% 10%,#10131a 0%,#0b0c10 55%,#07080b 100%);font-family:'DM Sans',system-ui,sans-serif;color:var(--text)}
.card{width:min(380px,92vw);background:color-mix(in srgb,var(--elev) 80%,transparent);backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:18px;padding:30px;box-shadow:0 24px 60px -18px rgba(0,0,0,.75)}
h1{font-size:26px;margin:0 0 4px;text-align:center}h1 b{color:var(--accent);text-shadow:0 0 22px color-mix(in srgb,var(--accent) 60%,transparent)}
p.sub{color:var(--muted);font-size:13px;text-align:center;margin:0 0 22px}
label{display:block;font-size:12px;color:var(--muted);margin:12px 0 5px}
input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid var(--border);background:#14161d;color:var(--text);font-size:14px;outline:none}
input:focus{border-color:var(--accent)}
button{width:100%;margin-top:20px;padding:12px;border:0;border-radius:10px;background:var(--accent);color:#00201e;font-weight:700;font-size:14px;cursor:pointer}
button:hover{filter:brightness(1.08)}
.err{background:#3a1518;color:#fca5a5;border:1px solid #7f1d1d;border-radius:10px;padding:9px 12px;font-size:12.5px;margin-bottom:6px;text-align:center}
.hint{color:var(--muted);font-size:11.5px;text-align:center;margin-top:16px}
code{background:#14161d;padding:2px 6px;border-radius:6px;font-size:12px;word-break:break-all;display:inline-block}
</style></head><body><form class="card" method="post" action="/login">
<h1>Omni<b>Sight</b></h1><p class="sub">Anmelden, um fortzufahren</p>
${msg ? `<div class="err">${msg}</div>` : ''}
<label>Benutzername</label><input name="username" autocomplete="username" required autofocus>
<label>Passwort</label><input name="password" type="password" autocomplete="current-password" required>
<label>2FA-Code (falls eingerichtet)</label><input name="totp" inputmode="numeric" pattern="[0-9 ]*" placeholder="123456" autocomplete="one-time-code">
<button type="submit">Anmelden</button>
<p class="hint">OmniSight Web · Zugang nur für eingeladene Nutzer</p>
</form></body></html>`;
}
function setupPage(secret, username, msg = '') {
	const issuer = encodeURIComponent('OmniSight');
	const otpauth = `otpauth://totp/${issuer}:${encodeURIComponent(username)}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;
	return loginPage().replace(/<form[\s\S]+<\/form>/, `<form class="card" method="post" action="/setup-2fa">
<h1>Omni<b>Sight</b></h1><p class="sub">2-Faktor-Authentifizierung einrichten</p>
${msg ? `<div class="err">${msg}</div>` : ''}
<p class="hint" style="text-align:left;margin:0 0 10px">Scanne diesen Code mit deiner Authenticator-App (Google Authenticator, Aegis, 1Password, ...):</p>
<div style="display:flex;justify-content:center;margin:0 0 10px"><div style="background:#fff;padding:10px;border-radius:10px">${qrSvg(otpauth)}</div></div>
<p class="hint" style="text-align:left;margin:0 0 6px">Geht das Scannen nicht? Schlüssel manuell eingeben:</p>
<code>${secret}</code>
<label>Code aus der App zur Bestätigung</label><input name="totp" inputmode="numeric" pattern="[0-9 ]*" placeholder="123456" required autofocus autocomplete="one-time-code">
<input type="hidden" name="secret" value="${secret}">
<button type="submit">2FA aktivieren</button>
</form>`);
}
function backupCodesPage(codes) {
	const list = codes.map((c) => `<code style="display:block;margin:3px 0;font-size:15px;letter-spacing:0.5px">${c}</code>`).join('');
	return loginPage().replace(/<form[\s\S]+<\/form>/, `<div class="card">
<h1>Omni<b>Sight</b></h1><p class="sub">Backup-Codes – jetzt sichern!</p>
<p class="hint" style="text-align:left;margin:0 0 10px">Diese 10 Codes werden <b>nur dieses eine Mal</b> angezeigt. Jeder Code funktioniert einmalig als Ersatz für deine Authenticator-App, falls du das Gerät verlierst. Speichere sie an einem sicheren Ort (Passwort-Manager, Ausdruck).</p>
<div style="background:#14161d;border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">${list}</div>
<a href="/" style="display:block;margin-top:20px;text-align:center;padding:12px;border-radius:10px;background:var(--accent);color:#00201e;font-weight:700;text-decoration:none;font-size:14px">Verstanden, weiter zur App</a>
</div>`);
}
function parseForm(body) {
	const out = {};
	for (const pair of String(body).split('&')) {
		const i = pair.indexOf('=');
		if (i > 0) out[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
	}
	return out;
}
function readRawBody(req) {
	return new Promise((resolve) => {
		let d = '';
		req.on('data', (c) => { d += c; if (d.length > 1e6) req.destroy(); });
		req.on('end', () => resolve(d));
	});
}

// ---------- Erststart: Admin aus Umgebungsvariablen anlegen ----------
if (!adminExists()) {
	const u = process.env.ADMIN_USER;
	const p = process.env.ADMIN_PASSWORD;
	if (u && p) {
		try { createUser(u, p, true); console.log(`[auth] Admin "${u}" angelegt (2FA-Einrichtung beim ersten Login).`); }
		catch (e) { console.error('[auth] Admin-Anlage fehlgeschlagen:', e.message); }
	} else {
		console.warn('[auth] Kein Admin vorhanden. Setze ADMIN_USER und ADMIN_PASSWORD beim ersten Start.');
	}
}

// ---------- Server ----------
const server = createServer(async (req, res) => {
	const url = new URL(req.url, 'http://x');
	const path = url.pathname;
	const sid = cookies(req).osid;
	const sess = getSession(sid);
	const user = sess ? userById(sess.userId) : null;

	// --- Öffentlich: Health + Login/Setup ---
	if (path === '/api/health') return send(res, 200, { ok: true, version: APP_VERSION });

	if (path === '/login' && req.method === 'GET') return send(res, 200, loginPage(), { 'Content-Type': MIME['.html'] });

	if (path === '/login' && req.method === 'POST') {
		const ip = req.socket.remoteAddress || 'x';
		if (rateLimited(ip)) return send(res, 429, loginPage('Zu viele Versuche. Bitte 5 Minuten warten.'), { 'Content-Type': MIME['.html'] });
		const f = parseForm(await readRawBody(req));
		const u = findUser(f.username);
		if (!u || !verifyPassword(f.password || '', u.passHash)) {
			noteFailure(ip);
			return send(res, 401, loginPage('Benutzername oder Passwort falsch.'), { 'Content-Type': MIME['.html'] });
		}
		if (u.mustSetup || !u.totpSecret) {
			// Passwort ok, 2FA fehlt -> Setup erzwingen (halbe Session, 10 min).
			noteSuccess(ip);
			const half = createSession(u.id, 'setup');
			setSession(res, half);
			return send(res, 200, setupPage(newTotpSecret(), u.username), { 'Content-Type': MIME['.html'] });
		}
		if (!verifyTotp(u.totpSecret, f.totp) && !verifyBackupCode(u.id, f.totp)) {
			noteFailure(ip);
			return send(res, 401, loginPage('2FA-Code falsch oder abgelaufen. (Auch als Backup-Code nutzbar.)'), { 'Content-Type': MIME['.html'] });
		}
		noteSuccess(ip);
		setSession(res, createSession(u.id, 'full'));
		res.writeHead(302, { Location: '/' });
		return res.end();
	}

	if (path === '/setup-2fa' && req.method === 'POST') {
		if (!sess || !user) { res.writeHead(302, { Location: '/login' }); return res.end(); }
		const f = parseForm(await readRawBody(req));
		const secret = String(f.secret || '');
		if (!verifyTotp(secret, f.totp)) {
			return send(res, 400, setupPage(secret, user.username, 'Code falsch – bitte erneut versuchen.'), { 'Content-Type': MIME['.html'] });
		}
		setTotp(user.id, secret);
		const codes = generateBackupCodes(user.id, 10);
		upgradeSession(sid);
		return send(res, 200, backupCodesPage(codes), { 'Content-Type': MIME['.html'] });
	}

	if (path === '/logout') {
		destroySession(sid);
		clearSession(res);
		res.writeHead(302, { Location: '/login' });
		return res.end();
	}

	// --- Ab hier: nur mit vollwertiger Session ---
	if (!sess || sess.stage !== 'full' || !user) {
		if (path.startsWith('/api/')) return send(res, 401, { error: 'Nicht angemeldet' });
		res.writeHead(302, { Location: '/login' });
		return res.end();
	}

	// --- API: TMDB-RPC (gleiche Kommandonamen wie Tauri) ---
	if (path.startsWith('/api/rpc/') && req.method === 'POST') {
		const cmd = decodeURIComponent(path.slice('/api/rpc/'.length));
		const fn = rpc[cmd];
		if (!fn) return send(res, 404, { error: `Unbekanntes Kommando: ${cmd}` });
		try {
			return send(res, 200, await fn(await readBody(req)));
		} catch (e) {
			return send(res, 502, { error: String(e.message || e) });
		}
	}

	// --- API: Benutzerverwaltung (nur Admin) ---
	if (path.startsWith('/api/admin/')) {
		if (!user.isAdmin) return send(res, 403, { error: 'Nur für Admins.' });
		const b = req.method === 'POST' ? await readBody(req) : {};
		try {
			if (path === '/api/admin/users' && req.method === 'GET') return send(res, 200, listUsers());
			if (path === '/api/admin/users' && req.method === 'POST') {
				const nu = createUser(String(b.username || ''), String(b.password || ''), !!b.isAdmin);
				return send(res, 200, { ok: true, id: nu.id });
			}
			if (path === '/api/admin/delete' && req.method === 'POST') {
				if (b.id === user.id) return send(res, 400, { error: 'Du kannst dich nicht selbst löschen.' });
				deleteUser(String(b.id || ''));
				return send(res, 200, { ok: true });
			}
			if (path === '/api/admin/reset' && req.method === 'POST') {
				resetPassword(String(b.id || ''), String(b.password || ''));
				return send(res, 200, { ok: true });
			}
			return send(res, 404, { error: 'Unbekannter Admin-Endpunkt.' });
		} catch (e) {
			return send(res, 400, { error: String(e.message || e) });
		}
	}

	if (path === '/api/me') return send(res, 200, { username: user.username, isAdmin: !!user.isAdmin });

	// --- Mein Konto (Selbstbedienung: eigenes Passwort ändern, Backup-Codes verwalten) ---
	if (path === '/account' && req.method === 'GET') {
		return send(res, 200, accountPage(user, backupCodesRemaining(user.id)), { 'Content-Type': MIME['.html'] });
	}
	if (path === '/account/password' && req.method === 'POST') {
		const f = parseForm(await readRawBody(req));
		try {
			changeOwnPassword(user.id, f.oldPassword || '', f.newPassword || '');
			return send(res, 200, accountPage(user, backupCodesRemaining(user.id), 'Passwort geändert.'), { 'Content-Type': MIME['.html'] });
		} catch (e) {
			return send(res, 400, accountPage(user, backupCodesRemaining(user.id), null, String(e.message || e)), { 'Content-Type': MIME['.html'] });
		}
	}
	if (path === '/account/backup-codes' && req.method === 'POST') {
		const codes = generateBackupCodes(user.id, 10);
		return send(res, 200, backupCodesPage(codes), { 'Content-Type': MIME['.html'] });
	}

	// --- Admin-Oberfläche ---
	if (path === '/admin') {
		if (!user.isAdmin) { res.writeHead(302, { Location: '/' }); return res.end(); }
		return send(res, 200, adminPage(), { 'Content-Type': MIME['.html'] });
	}

	// --- Statische App (build/) ---
	let file = normalize(path).replace(/^\/+/, '');
	if (file === '' || !extname(file)) file = 'index.html'; // SPA-Fallback
	const full = join(BUILD_DIR, file);
	if (!full.startsWith(normalize(BUILD_DIR))) return send(res, 403, 'Verboten');
	if (!existsSync(full) || !statSync(full).isFile()) {
		const fallback = join(BUILD_DIR, 'index.html');
		if (existsSync(fallback)) return send(res, 200, readFileSync(fallback), { 'Content-Type': MIME['.html'], ...secHeaders() });
		return send(res, 404, 'Nicht gefunden');
	}
	const ext = extname(full);
	const cache = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
	return send(res, 200, readFileSync(full), { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ...(ext === '.html' ? secHeaders() : {}) });
});

function secHeaders() {
	return {
		'Content-Security-Policy':
			"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'",
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer'
	};
}

function accountPage(user, codesLeft, okMsg = null, errMsg = null) {
	return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OmniSight – Mein Konto</title><style>
:root{--accent:#30c5bb;--bg:#0b0c10;--elev:#14161d;--text:#f1f3f6;--muted:#8b8f9a;--border:#2a2e3a}
body{margin:0;min-height:100vh;background:#0b0c10;font-family:'DM Sans',system-ui,sans-serif;color:var(--text);padding:40px 16px}
.wrap{max-width:460px;margin:0 auto}h1{font-size:22px}h1 b{color:var(--accent)}
.card{background:var(--elev);border:1px solid var(--border);border-radius:14px;padding:20px;margin-top:16px}
.card h2{font-size:14px;margin:0 0 12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
label{display:block;font-size:12px;color:var(--muted);margin:10px 0 5px}
input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:#0f1015;color:var(--text);font-size:13.5px;box-sizing:border-box}
button{margin-top:14px;padding:10px 16px;border:0;border-radius:8px;background:var(--accent);color:#00201e;font-weight:700;font-size:13px;cursor:pointer}
.ghost{background:transparent;border:1px solid var(--border);color:var(--text)}
.msg{margin:10px 0;font-size:13px;padding:8px 12px;border-radius:8px}
.msg.ok{background:#0f2f27;color:#6ee7c8}.msg.err{background:#3a1518;color:#fca5a5}
.row{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;padding:6px 0}
a{color:var(--muted);font-size:13px}
</style></head><body><div class="wrap">
<h1>Omni<b>Sight</b> – Mein Konto</h1>
${okMsg ? `<div class="msg ok">${okMsg}</div>` : ''}
${errMsg ? `<div class="msg err">${errMsg}</div>` : ''}
<div class="card">
<h2>Übersicht</h2>
<div class="row"><span>Benutzername</span><b>${user.username}</b></div>
<div class="row"><span>Backup-Codes übrig</span><b>${codesLeft} / 10</b></div>
</div>
<div class="card">
<h2>Passwort ändern</h2>
<form method="post" action="/account/password">
<label>Aktuelles Passwort</label><input name="oldPassword" type="password" required autocomplete="current-password">
<label>Neues Passwort (min. 8 Zeichen)</label><input name="newPassword" type="password" required autocomplete="new-password">
<button type="submit">Passwort ändern</button>
</form>
</div>
<div class="card">
<h2>Backup-Codes</h2>
<p style="color:var(--muted);font-size:13px;margin:0 0 10px">Neu erzeugen macht alle bisherigen Codes ungültig – die neuen werden einmalig angezeigt.</p>
<form method="post" action="/account/backup-codes" onsubmit="return confirm('Alte Backup-Codes werden ungültig. Neue erzeugen?')">
<button type="submit" class="ghost">Neue Backup-Codes erzeugen</button>
</form>
</div>
<p style="margin-top:20px"><a href="/">← Zurück zur App</a> · <a href="/logout">Abmelden</a></p>
</div></body></html>`;
}

function adminPage() {
	return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OmniSight – Benutzerverwaltung</title><style>
:root{--accent:#30c5bb;--bg:#0b0c10;--elev:#14161d;--text:#f1f3f6;--muted:#8b8f9a;--border:#2a2e3a}
body{margin:0;min-height:100vh;background:#0b0c10;font-family:'DM Sans',system-ui,sans-serif;color:var(--text);padding:40px 16px}
.wrap{max-width:680px;margin:0 auto}h1{font-size:22px}h1 b{color:var(--accent)}
table{width:100%;border-collapse:collapse;margin:18px 0}
td,th{padding:10px 8px;border-bottom:1px solid var(--border);font-size:13.5px;text-align:left}
th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
button{border:0;border-radius:8px;padding:7px 12px;cursor:pointer;font-weight:600;font-size:12.5px}
.b-acc{background:var(--accent);color:#00201e}.b-red{background:#7f1d1d;color:#fecaca}.b-ghost{background:var(--elev);color:var(--text);border:1px solid var(--border)}
input{padding:9px 11px;border-radius:8px;border:1px solid var(--border);background:var(--elev);color:var(--text);font-size:13px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.badge{font-size:10.5px;padding:2px 8px;border-radius:99px;background:var(--elev);border:1px solid var(--border);color:var(--muted)}
.badge.ok{color:var(--accent);border-color:var(--accent)}
#msg{margin:10px 0;font-size:13px;color:var(--accent)}#msg.err{color:#fca5a5}
a{color:var(--muted);font-size:13px}
</style></head><body><div class="wrap">
<h1>Omni<b>Sight</b> – Benutzerverwaltung</h1>
<p style="color:var(--muted);font-size:13px">Neue Nutzer bekommen ein Startpasswort und richten beim ersten Login ihre eigene 2FA ein.</p>
<div id="msg"></div>
<div class="row">
<input id="nu" placeholder="Benutzername"><input id="np" placeholder="Startpasswort (min. 8)" type="text">
<label style="font-size:12.5px;color:var(--muted)"><input id="na" type="checkbox" style="width:auto"> Admin</label>
<button class="b-acc" onclick="addUser()">Anlegen</button>
</div>
<table><thead><tr><th>Nutzer</th><th>Status</th><th></th></tr></thead><tbody id="list"></tbody></table>
<a href="/">← Zurück zur App</a> · <a href="/logout">Abmelden</a>
</div><script>
const msg=(t,e)=>{const m=document.getElementById('msg');m.textContent=t;m.className=e?'err':''};
async function api(p,b){const r=await fetch(p,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}:{});const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);return j}
async function load(){const us=await api('/api/admin/users');document.getElementById('list').innerHTML=us.map(u=>\`<tr><td>\${u.username}\${u.isAdmin?' <span class="badge ok">Admin</span>':''}</td><td>\${u.totp?'<span class="badge ok">2FA aktiv</span>':'<span class="badge">wartet auf Einrichtung</span>'}</td><td style="text-align:right"><button class="b-ghost" onclick="resetPw('\${u.id}','\${u.username}')">Passwort zurücksetzen</button> <button class="b-red" onclick="del('\${u.id}','\${u.username}')">Löschen</button></td></tr>\`).join('')}
async function addUser(){try{await api('/api/admin/users',{username:nu.value.trim(),password:np.value,isAdmin:na.checked});msg('Nutzer angelegt.');nu.value='';np.value='';na.checked=false;load()}catch(e){msg(e.message,1)}}
async function del(id,n){if(!confirm('Nutzer "'+n+'" wirklich löschen?'))return;try{await api('/api/admin/delete',{id});msg('Gelöscht.');load()}catch(e){msg(e.message,1)}}
async function resetPw(id,n){const p=prompt('Neues Startpasswort für '+n+' (min. 8 Zeichen). 2FA wird zurückgesetzt.');if(!p)return;try{await api('/api/admin/reset',{id,password:p});msg('Zurückgesetzt – Nutzer richtet 2FA neu ein.')}catch(e){msg(e.message,1)}}
load();
</script></body></html>`;
}

server.listen(PORT, () => {
	console.log(`[omnisight-web] läuft auf Port ${PORT} · Build: ${BUILD_DIR} · TMDB-Key: ${TMDB_KEY ? 'gesetzt' : 'FEHLT'}`);
});
