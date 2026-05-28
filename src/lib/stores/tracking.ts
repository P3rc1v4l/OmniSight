// Streamzeit-Tracking.
//
// Modell: Beim Öffnen eines Anbieter-Fensters startet eine "Session". Ein
// Heartbeat alle 15 s schreibt die seither vergangene Zeit fort (so geht bei
// einem Absturz höchstens ~15 s verloren). Beim Schließen des Fensters wird die
// letzte Teilzeit verbucht. Gezählt wird immer (jetzt − zuletzt_gezählt),
// dadurch kann nichts doppelt zählen, egal ob Heartbeat oder Schließen zuerst kommt.
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export const watchTime = writable<Record<string, number>>({}); // Millisekunden je Anbieter-ID
export const openCount = writable<number>(0);

export const totalWatchMs = derived(watchTime, ($w) =>
	Object.values($w).reduce((a, b) => a + b, 0)
);
export const distinctProvidersWatched = derived(watchTime, ($w) =>
	Object.keys($w).filter((k) => $w[k] > 0).length
);

export function addWatchTime(id: string, ms: number): void {
	if (ms <= 0) return;
	watchTime.update(($w) => ({ ...$w, [id]: ($w[id] ?? 0) + ms }));
}

export function incrementOpenCount(): void {
	openCount.update((n) => n + 1);
}

let openSessions: Record<string, number> = {}; // ID -> Zeitpunkt der letzten Verbuchung
let heartbeat: ReturnType<typeof setInterval> | null = null;

export function startSession(id: string): void {
	openSessions[id] = Date.now();
	if (!heartbeat && browser) heartbeat = setInterval(tick, 15000);
}

export function endSession(id: string): void {
	flush(id);
	delete openSessions[id];
	if (Object.keys(openSessions).length === 0 && heartbeat) {
		clearInterval(heartbeat);
		heartbeat = null;
	}
}

function flush(id: string): void {
	const last = openSessions[id];
	if (last == null) return;
	const now = Date.now();
	addWatchTime(id, now - last);
	openSessions[id] = now;
}

function tick(): void {
	for (const id of Object.keys(openSessions)) flush(id);
}

// Laufende Session-Startzeit (für Live-Anzeige auf der "Schaut gerade"-Seite)
export function sessionStart(id: string): number | null {
	return openSessions[id] ?? null;
}

export function formatDuration(ms: number): string {
	const totalMin = Math.floor(ms / 60000);
	const h = Math.floor(totalMin / 60);
	const m = totalMin % 60;
	if (h > 0) return `${h} h ${m} min`;
	if (totalMin > 0) return `${m} min`;
	return `${Math.floor(ms / 1000)} s`;
}

let loaded = false;
export async function hydrateTracking(): Promise<void> {
	if (loaded || !browser) return;
	loaded = true;
	watchTime.set(await loadState<Record<string, number>>('watchTime', {}));
	openCount.set(await loadState<number>('openCount', 0));
}

if (browser) {
	watchTime.subscribe(($w) => { if (loaded) void saveState('watchTime', $w); });
	openCount.subscribe(($n) => { if (loaded) void saveState('openCount', $n); });
}
