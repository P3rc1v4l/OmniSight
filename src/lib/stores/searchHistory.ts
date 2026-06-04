import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'omnisight:searchHistory';
const OLD_KEY = 'omnihub:searchHistory';
const MAX = 8;

function load(): string[] {
	if (!browser) return [];
	try {
		const v = JSON.parse(localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY) ?? '[]');
		return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
	} catch {
		return [];
	}
}

export const searchHistory = writable<string[]>(load());

if (browser) {
	searchHistory.subscribe((v) => {
		try {
			localStorage.setItem(KEY, JSON.stringify(v));
		} catch {
			/* ignore */
		}
	});
}

/** Begriff vorne einfügen, Duplikate (case-insensitive) entfernen, auf MAX kürzen. */
export function addSearch(term: string): void {
	const t = term.trim();
	if (t.length < 2) return;
	searchHistory.update((l) => [t, ...l.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
}

export function removeSearch(term: string): void {
	searchHistory.update((l) => l.filter((x) => x !== term));
}

export function clearSearchHistory(): void {
	searchHistory.set([]);
}
