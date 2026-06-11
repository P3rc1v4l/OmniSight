// Jahresrückblick: erscheint jährlich vom 16. bis 31. Dezember.
import { browser } from '$app/environment';

// Das Jahr, auf das sich der Rückblick bezieht (das aktuelle Kalenderjahr).
export function reviewYear(): number {
	return new Date().getFullYear();
}

// Ist gerade Rückblick-Zeitraum? (16.–31. Dezember)
export function isReviewPeriod(): boolean {
	const d = new Date();
	return d.getMonth() === 11 && d.getDate() >= 16; // Dezember (Monat 11), ab dem 16.
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
