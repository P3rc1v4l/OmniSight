// Empfehlungs-Steuerung pro Profil:
// - hiddenRecs: einzeln ausgeblendete Empfehlungen (tauchen nicht mehr auf)
// - excludedSeeds: Watchlist-Titel, auf deren Basis keine Empfehlungen mehr kommen sollen
// - currentRecReason: Begründung der gerade geöffneten Empfehlung (für die Titel-Info)
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export const hiddenRecs = writable<string[]>([]); // rec keys, z. B. "movie-123"
export const excludedSeeds = writable<string[]>([]); // seed keys, z. B. "tv-456"
export const currentRecReason = writable<{ seedLabel: string; seedKey: string; recKey: string } | null>(null);

let pid: string | null = null;
let ready = false;

export async function loadRecsForProfile(profileId: string): Promise<void> {
	pid = profileId;
	hiddenRecs.set(await loadState<string[]>(`hiddenrecs:${profileId}`, []));
	excludedSeeds.set(await loadState<string[]>(`excludedseeds:${profileId}`, []));
	ready = true;
}

if (browser) {
	hiddenRecs.subscribe(($h) => { if (ready && pid) void saveState(`hiddenrecs:${pid}`, $h); });
	excludedSeeds.subscribe(($e) => { if (ready && pid) void saveState(`excludedseeds:${pid}`, $e); });
}

export function hideRec(recKey: string): void {
	hiddenRecs.update((h) => (h.includes(recKey) ? h : [...h, recKey]));
}
export function excludeSeed(seedKey: string): void {
	excludedSeeds.update((e) => (e.includes(seedKey) ? e : [...e, seedKey]));
}
export function clearExcludedSeed(seedKey: string): void {
	excludedSeeds.update((e) => e.filter((x) => x !== seedKey));
}
