// Jahresrückblick: regulär jährlich vom 15.–31. Dezember.
// Zusätzlich ein TEST-Fenster (jetzt aktiv), damit man es vor Dezember ausprobieren kann.
// >>> NACH DEM TESTEN: TEST_FROM und TEST_TO einfach auf '' setzen, dann gilt nur Dezember. <<<
import { browser } from '$app/environment';

const TEST_FROM = '2026-06-06';
const TEST_TO = '2026-06-11';

function todayISO(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Das Jahr, auf das sich der Rückblick bezieht (das aktuelle Kalenderjahr).
export function reviewYear(): number {
	return new Date().getFullYear();
}

// Ist gerade Rückblick-Zeitraum? (Dezember 15.–31. ODER Test-Fenster)
export function isReviewPeriod(): boolean {
	const d = new Date();
	const decWindow = d.getMonth() === 11 && d.getDate() >= 15; // Dezember, ab dem 15.
	const iso = todayISO();
	const testWindow = !!TEST_FROM && !!TEST_TO && iso >= TEST_FROM && iso <= TEST_TO;
	return decWindow || testWindow;
}

// „Dieses Jahr nicht mehr anzeigen" – global gespeichert (nicht pro Profil).
const KEY = 'omni-review-dismissed-year';
export function isReviewDismissed(year: number): boolean {
	if (!browser) return false;
	try {
		return localStorage.getItem(KEY) === String(year);
	} catch {
		return false;
	}
}
export function dismissReviewYear(year: number): void {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, String(year));
	} catch {
		/* ignore */
	}
}
