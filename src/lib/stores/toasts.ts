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
export function pushToast(title: string, body?: string, icon = '🔔', timeoutMs = 5000): void {
	const id = ++counter;
	const entry: Toast = { id, title, body, icon, at: Date.now() };
	toasts.update(($t) => [...$t, entry]);
	notifHistory.update(($h) => [entry, ...$h].slice(0, 40));
	if (timeoutMs > 0) {
		setTimeout(() => dismissToast(id), timeoutMs);
	}
}

export function dismissToast(id: number): void {
	toasts.update(($t) => $t.filter((x) => x.id !== id));
}

export function clearNotifHistory(): void {
	notifHistory.set([]);
}
