// In-App-Benachrichtigungen (Toasts). Ersetzt die nativen Windows-Meldungen –
// alle Hinweise erscheinen nur innerhalb der App.
import { writable } from 'svelte/store';

export interface Toast {
	id: number;
	title: string;
	body?: string;
	icon?: string;
	at?: number;
}

export const toasts = writable<Toast[]>([]);
// Verlauf für das Benachrichtigungscenter (bleibt, bis App beendet/geleert).
export const notifHistory = writable<Toast[]>([]);
// Steuert, ob das Benachrichtigungscenter offen ist (Glocke in der Sidebar).
export const notifCenterOpen = writable(false);

let counter = 0;
function makeToast(title: string, body?: string, icon = '🔔'): Toast {
	return { id: ++counter, title, body, icon, at: Date.now() };
}

// Kurzer Hinweis (z. B. „Gespeichert"): erscheint nur transient, NICHT im Center-Verlauf.
export function pushToast(title: string, body?: string, icon = '🔔', timeoutMs = 5000): void {
	const entry = makeToast(title, body, icon);
	toasts.update(($t) => [...$t, entry]);
	if (timeoutMs > 0) {
		setTimeout(() => dismissToast(entry.id), timeoutMs);
	}
}

// Wichtige Benachrichtigung (Achievement, Release): erscheint kurz als Toast UND
// bleibt im Center-Verlauf erhalten.
export function pushNotification(title: string, body?: string, icon = '🔔', timeoutMs = 6000): void {
	const entry = makeToast(title, body, icon);
	toasts.update(($t) => [...$t, entry]);
	notifHistory.update(($h) => [entry, ...$h].slice(0, 40));
	if (timeoutMs > 0) {
		setTimeout(() => dismissToast(entry.id), timeoutMs);
	}
}

export function dismissToast(id: number): void {
	toasts.update(($t) => $t.filter((x) => x.id !== id));
}

export function clearNotifHistory(): void {
	notifHistory.set([]);
}
