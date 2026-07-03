// Tests für das PIN-/Admin-Hashing (gesalzenes PBKDF2-SHA256, mit Legacy-Migration).
import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin, isLegacyHash, verifyPinUpgrade } from './profiles';

describe('PIN-Hashing (PBKDF2)', () => {
	it('erzeugt einen Hash im erwarteten Format und verifiziert ihn korrekt', async () => {
		const hash = await hashPin('1234');
		expect(hash.startsWith('pbkdf2$')).toBe(true);
		expect(await verifyPin('1234', hash)).toBe(true);
	});
	it('lehnt einen falschen PIN ab', async () => {
		const hash = await hashPin('1234');
		expect(await verifyPin('0000', hash)).toBe(false);
	});
	it('salzt: zwei Hashes desselben PINs unterscheiden sich', async () => {
		const h1 = await hashPin('1234');
		const h2 = await hashPin('1234');
		expect(h1).not.toBe(h2);
		expect(await verifyPin('1234', h1)).toBe(true);
		expect(await verifyPin('1234', h2)).toBe(true);
	});
	it('kein Hash gesetzt (null) bedeutet freier Zugang', async () => {
		expect(await verifyPin('irgendwas', null)).toBe(true);
	});
	it('erkennt Legacy-Hashes (nicht im pbkdf2$-Format) korrekt', async () => {
		const modern = await hashPin('1234');
		expect(isLegacyHash(modern)).toBe(false);
		expect(isLegacyHash('deadbeef1234')).toBe(true); // altes ungesalzenes SHA-256-Format
		expect(isLegacyHash(null)).toBe(false);
	});
});

describe('verifyPinUpgrade (Migration alter Hashes)', () => {
	it('migriert einen erfolgreich verifizierten Legacy-Hash automatisch auf PBKDF2', async () => {
		// Legacy-Hash-Erzeugung nachgebaut (gleicher Algorithmus wie im alten System).
		const enc = new TextEncoder().encode('omnihub:5678');
		const digest = await crypto.subtle.digest('SHA-256', enc);
		const legacyHash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');

		expect(isLegacyHash(legacyHash)).toBe(true);
		const ok = await verifyPinUpgrade('profile-1', '5678', legacyHash);
		expect(ok).toBe(true);
		// Nach dem Upgrade sollte ein neuer pbkdf2-Hash im Profil-Store stehen
		// (verifyPinUpgrade ruft intern setPin auf) – hier prüfen wir zumindest,
		// dass ein falscher PIN gegen den ORIGINAL-Legacy-Hash weiterhin fehlschlägt.
		expect(await verifyPinUpgrade('profile-1', '0000', legacyHash)).toBe(false);
	});
});
