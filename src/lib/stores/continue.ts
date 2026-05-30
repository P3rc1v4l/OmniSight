// "Weiterschauen": merkt sich zuletzt geöffnete Titel/Anbieter inkl. der echten
// Anbieter-URL, damit man per Klick wieder genau dort landet (gleiche Anmeldung).
// Persistiert (localStorage + tauri-store).
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export interface ContinueEntry {
	key: string; // Dedupe (i.d.R. die URL)
	label: string; // Titel oder Anbietername
	subtitle: string; // z.B. Anbietername
	url: string;
	id: string; // Anbieter-id (für geteilte Anmeldung)
	color: string;
	color2: string;
	poster: string | null;
	ts: number;
}

export const continueList = writable<ContinueEntry[]>([]);

const LS = 'omnihub:continue';
const MAX = 12;
let loaded = false;

if (browser) {
	(async () => {
		let init: ContinueEntry[] = [];
		try {
			const raw = window.localStorage.getItem(LS);
			if (raw) init = JSON.parse(raw);
		} catch {
			/* ignore */
		}
		if (init.length === 0) {
			try {
				init = (await loadState<ContinueEntry[]>('continue', [])) || [];
			} catch {
				/* ignore */
			}
		}
		continueList.set(init);
		loaded = true;
	})();

	continueList.subscribe((v) => {
		if (!loaded) return;
		try {
			window.localStorage.setItem(LS, JSON.stringify(v));
		} catch {
			/* ignore */
		}
		void saveState('continue', v);
	});
}

export function recordOpen(e: {
	label: string;
	subtitle?: string;
	url: string;
	id: string;
	color?: string;
	color2?: string;
	poster?: string | null;
	key?: string;
}): void {
	if (!browser || !e.url) return;
	const key = e.key ?? e.url;
	const entry: ContinueEntry = {
		key,
		label: e.label || 'Titel',
		subtitle: e.subtitle ?? '',
		url: e.url,
		id: e.id,
		color: e.color ?? '#30c5bb',
		color2: e.color2 ?? e.color ?? '#1f6f6a',
		poster: e.poster ?? null,
		ts: Date.now()
	};
	continueList.update((l) => [entry, ...l.filter((x) => x.key !== key)].slice(0, MAX));
}

export function removeContinue(key: string): void {
	continueList.update((l) => l.filter((x) => x.key !== key));
}

export function clearContinue(): void {
	continueList.set([]);
}
