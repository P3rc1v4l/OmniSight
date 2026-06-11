// Episoden-Fortschritt pro Profil: welche einzelnen Folgen einer Serie abgehakt sind.
// Gespeichert als Liste von Schlüsseln "tv-{id}-s{staffel}e{episode}".
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export const watchedEpisodes = writable<string[]>([]);

let pid: string | null = null;
let ready = false;

export async function loadEpisodesForProfile(profileId: string): Promise<void> {
	pid = profileId;
	watchedEpisodes.set(await loadState<string[]>(`watchedeps:${profileId}`, []));
	ready = true;
}

if (browser) {
	watchedEpisodes.subscribe(($w) => { if (ready && pid) void saveState(`watchedeps:${pid}`, $w); });
}

export function epKey(id: number, season: number, episode: number): string {
	return `tv-${id}-s${season}e${episode}`;
}

export function isEpisodeWatched(list: string[], id: number, season: number, episode: number): boolean {
	return list.includes(epKey(id, season, episode));
}

export function toggleEpisode(id: number, season: number, episode: number): void {
	const key = epKey(id, season, episode);
	watchedEpisodes.update((w) => (w.includes(key) ? w.filter((x) => x !== key) : [...w, key]));
}

// Ganze Staffel ab-/anhaken (episodeNumbers = alle Episodennummern der Staffel).
export function setSeasonWatched(id: number, season: number, episodeNumbers: number[], watched: boolean): void {
	const keys = episodeNumbers.map((n) => epKey(id, season, n));
	watchedEpisodes.update((w) => {
		if (watched) {
			const set = new Set(w);
			for (const k of keys) set.add(k);
			return [...set];
		}
		const remove = new Set(keys);
		return w.filter((x) => !remove.has(x));
	});
}

// Wie viele der angegebenen Episoden sind abgehakt?
export function seasonWatchedCount(list: string[], id: number, season: number, episodeNumbers: number[]): number {
	let n = 0;
	for (const e of episodeNumbers) if (list.includes(epKey(id, season, e))) n++;
	return n;
}

// Gesamtzahl abgehakter Folgen einer Serie (über alle Staffeln).
export function seriesWatchedTotal(id: number): number {
	const prefix = `tv-${id}-s`;
	return get(watchedEpisodes).filter((k) => k.startsWith(prefix)).length;
}
