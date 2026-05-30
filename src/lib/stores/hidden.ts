// Ausgeblendete Titel (global). Werden aus Neuigkeiten/Upcoming herausgefiltert
// und lassen sich über das Auge-Fenster wieder einblenden. Persistiert.
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';
import type { TmdbItem } from '$lib/types';

export interface HiddenEntry {
	id: number;
	media_type: string;
	title: string;
	poster: string | null;
}

export const hiddenTitles = writable<HiddenEntry[]>([]);
export const showHidden = writable(false);

const LS = 'omnihub:hidden';
let loaded = false;

if (browser) {
	(async () => {
		let init: HiddenEntry[] = [];
		try {
			const raw = window.localStorage.getItem(LS);
			if (raw) init = JSON.parse(raw);
		} catch {
			/* ignore */
		}
		if (init.length === 0) {
			try {
				init = (await loadState<HiddenEntry[]>('hidden', [])) || [];
			} catch {
				/* ignore */
			}
		}
		hiddenTitles.set(init);
		loaded = true;
	})();

	hiddenTitles.subscribe((v) => {
		if (!loaded) return;
		try {
			window.localStorage.setItem(LS, JSON.stringify(v));
		} catch {
			/* ignore */
		}
		void saveState('hidden', v);
	});
}

export function isHidden(list: HiddenEntry[], id: number, mt: string): boolean {
	return list.some((x) => x.id === id && x.media_type === mt);
}

export function hideTitle(item: TmdbItem): void {
	hiddenTitles.update((l) =>
		isHidden(l, item.id, item.media_type)
			? l
			: [...l, { id: item.id, media_type: item.media_type, title: item.title, poster: item.poster }]
	);
}

export function unhideTitle(id: number, mt: string): void {
	hiddenTitles.update((l) => l.filter((x) => !(x.id === id && x.media_type === mt)));
}
