// Grobe Erreichbarkeits-Anzeige pro Anbieter. Wir fragen server-seitig (Rust) per
// HTTP an: JEDE Antwort -> erreichbar, Verbindungsfehler/Timeout -> nicht erreichbar.
// Das ist KEIN Login-/Service-Status, nur ein Ping. Außerhalb der Desktop-App
// (kein Tauri) liefern wir 'unknown' statt einer Farbe – so wird nichts fälschlich rot.
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// 'no-net' = das Gerät selbst hat keine Verbindung (kein Anbieter-Problem).
export type ReachState = 'unknown' | 'checking' | 'online' | 'offline' | 'no-net';

export const reachability = writable<Record<string, ReachState>>({});
export const reachabilityCheckedAt = writable<Record<string, number>>({});

const lastChecked = new Map<string, number>();
const TTL = 5 * 60 * 1000; // 5 Minuten Cache

function deviceOffline(): boolean {
	return browser && typeof navigator !== 'undefined' && navigator.onLine === false;
}

// HTTP-Erreichbarkeit über den Rust-Befehl. null = unbekannt (kein Tauri / Fehler).
async function probeReachable(url: string): Promise<boolean | null> {
	if (!browser) return null;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		return await invoke<boolean>('check_reachable', { url });
	} catch {
		return null; // kein Tauri -> unbekannt (nicht fälschlich rot)
	}
}

export async function checkProvider(p: { id: string; url: string }, force = false): Promise<void> {
	if (!browser) return;
	const now = Date.now();
	if (!force && now - (lastChecked.get(p.id) ?? 0) < TTL) return;

	// Gerät offline -> nicht jeden Anbieter fälschlich als "rot" markieren.
	if (deviceOffline()) {
		reachability.update((s) => ({ ...s, [p.id]: 'no-net' }));
		return;
	}
	if (!p.url) {
		reachability.update((s) => ({ ...s, [p.id]: 'unknown' }));
		return;
	}
	lastChecked.set(p.id, now);
	const cur = get(reachability)[p.id];
	if (cur !== 'online' && cur !== 'offline') {
		reachability.update((s) => ({ ...s, [p.id]: 'checking' }));
	}
	const ok = await probeReachable(p.url);
	reachability.update((s) => ({
		...s,
		[p.id]: ok === null ? 'unknown' : ok ? 'online' : 'offline'
	}));
	if (ok !== null) {
		reachabilityCheckedAt.update((s) => ({ ...s, [p.id]: Date.now() }));
	}
}

export function checkProviders(list: { id: string; url: string }[], force = false): void {
	for (const p of list) void checkProvider(p, force);
}

// Alle aktualisieren: ist das Gerät offline, sofort alle auf 'no-net' setzen.
export function refreshAll(list: { id: string; url: string }[], force = false): void {
	if (deviceOffline()) {
		lastChecked.clear();
		reachability.update((s) => {
			const out = { ...s };
			for (const p of list) out[p.id] = 'no-net';
			return out;
		});
		return;
	}
	checkProviders(list, force);
}
