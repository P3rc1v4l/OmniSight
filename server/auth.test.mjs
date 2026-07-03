// Tests für den Web-Auth-Kern: Passwort-Hashing (scrypt), TOTP (RFC 6238),
// Backup-Codes und Selbstbedienungs-Passwortwechsel. Nutzt eine temporäre
// DATA_DIR pro Testlauf, damit Tests sich nie gegenseitig beeinflussen.
import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let auth;

beforeAll(async () => {
	const dir = mkdtempSync(join(tmpdir(), 'omnisight-auth-test-'));
	process.env.DATA_DIR = dir;
	auth = await import('./auth.mjs');
});

describe('Passwort-Hashing (scrypt)', () => {
	it('verifiziert das richtige Passwort', () => {
		const h = auth.hashPassword('correcthorsebattery');
		expect(auth.verifyPassword('correcthorsebattery', h)).toBe(true);
	});
	it('lehnt ein falsches Passwort ab', () => {
		const h = auth.hashPassword('correcthorsebattery');
		expect(auth.verifyPassword('wrongpassword', h)).toBe(false);
	});
	it('salzt: zwei Hashes desselben Passworts unterscheiden sich', () => {
		const h1 = auth.hashPassword('sameSecret123');
		const h2 = auth.hashPassword('sameSecret123');
		expect(h1).not.toBe(h2);
		expect(auth.verifyPassword('sameSecret123', h1)).toBe(true);
		expect(auth.verifyPassword('sameSecret123', h2)).toBe(true);
	});
});

describe('TOTP (RFC 6238)', () => {
	it('generiert einen gültigen 6-stelligen Code, der sich selbst verifiziert', () => {
		const secret = auth.newTotpSecret();
		const code = auth.totpCode(secret);
		expect(code).toMatch(/^\d{6}$/);
		expect(auth.verifyTotp(secret, code)).toBe(true);
	});
	it('lehnt einen falschen Code ab', () => {
		const secret = auth.newTotpSecret();
		expect(auth.verifyTotp(secret, '000000')).toBe(false);
	});
	it('lehnt falsch formatierte Codes ab (nicht 6 Ziffern)', () => {
		const secret = auth.newTotpSecret();
		expect(auth.verifyTotp(secret, '12345')).toBe(false);
		expect(auth.verifyTotp(secret, 'abcdef')).toBe(false);
	});
	it('akzeptiert einen Code aus dem vorherigen Zeitschritt (Uhrenabweichung)', () => {
		const secret = auth.newTotpSecret();
		const prevCode = auth.totpCode(secret, -1);
		expect(auth.verifyTotp(secret, prevCode)).toBe(true);
	});
	it('Base32 Encode/Decode ist ein sauberer Rundgang', () => {
		const original = Buffer.from([1, 2, 3, 250, 251, 252, 253]);
		const encoded = auth.b32encode(original);
		const decoded = auth.b32decode(encoded);
		expect(Buffer.from(decoded)).toEqual(original);
	});
});

describe('Nutzerverwaltung + Backup-Codes', () => {
	it('legt einen Nutzer an und verweigert doppelte Benutzernamen', () => {
		const u = auth.createUser('vitestuser', 'startpassword1', false);
		expect(u.username).toBe('vitestuser');
		expect(() => auth.createUser('vitestuser', 'egalwas12345', false)).toThrow();
	});
	it('lehnt zu kurze Passwörter und ungültige Benutzernamen ab', () => {
		expect(() => auth.createUser('kurz1', 'nur7zei', false)).toThrow();
		expect(() => auth.createUser('a', 'validpassword1', false)).toThrow();
	});
	it('Backup-Codes: 10 Stück, jeder einmalig nutzbar', () => {
		const u = auth.createUser('backupuser', 'startpassword1', false);
		auth.setTotp(u.id, auth.newTotpSecret());
		const codes = auth.generateBackupCodes(u.id, 10);
		expect(codes).toHaveLength(10);
		expect(codes[0]).toMatch(/^[0-9a-f]{5}-[0-9a-f]{5}$/);
		expect(auth.backupCodesRemaining(u.id)).toBe(10);

		expect(auth.verifyBackupCode(u.id, codes[0])).toBe(true);
		expect(auth.backupCodesRemaining(u.id)).toBe(9);
		expect(auth.verifyBackupCode(u.id, codes[0])).toBe(false); // nicht zweimal nutzbar
		expect(auth.verifyBackupCode(u.id, 'nonexistent-code')).toBe(false);
	});
	it('Admin-Reset macht bestehende Backup-Codes ungültig', () => {
		const u = auth.createUser('resetuser', 'startpassword1', false);
		auth.setTotp(u.id, auth.newTotpSecret());
		const codes = auth.generateBackupCodes(u.id, 5);
		auth.resetPassword(u.id, 'ganzneuespasswort1');
		expect(auth.backupCodesRemaining(u.id)).toBe(0);
		expect(auth.verifyBackupCode(u.id, codes[0])).toBe(false);
	});
	it('Selbstbedienungs-Passwortwechsel verlangt korrektes altes Passwort', () => {
		const u = auth.createUser('selfsvcuser', 'altespasswort1', false);
		expect(() => auth.changeOwnPassword(u.id, 'falsches-pw', 'neuespasswort1')).toThrow();
		auth.changeOwnPassword(u.id, 'altespasswort1', 'neuespasswort1');
		expect(auth.verifyPassword('neuespasswort1', auth.userById(u.id).passHash)).toBe(true);
	});
	it('Selbstbedienungs-Passwortwechsel lehnt identisches neues Passwort ab', () => {
		const u = auth.createUser('sameuser', 'einpasswort1', false);
		expect(() => auth.changeOwnPassword(u.id, 'einpasswort1', 'einpasswort1')).toThrow();
	});
});
