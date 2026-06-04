// Grobe Erreichbarkeits-Anzeige pro Anbieter. Wir laden das Favicon der Domain
// (Bilder unterliegen keiner CORS-Beschränkung): lädt es -> erreichbar, Fehler/
// Timeout -> nicht erreichbar. Das ist KEIN Login-/Service-Status, nur ein Ping.
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

function originOf(url: string): string | null {
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}

function pingFavicon(origin: string, timeoutMs = 6000): Promise<boolean> {
	return new Promise((resolve) => {
		if (typeof Image === 'undefined') {
			resolve(false);
			return;
		}
		const img = new Image();
		let done = false;
		const finish = (ok: boolean) => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			img.onload = null;
			img.onerror = null;
			resolve(ok);
		};
		const timer = setTimeout(() => finish(false), timeoutMs);
		img.onload = () => finish(true);
		img.onerror = () => finish(false);
		img.src = `${origin}/favicon.ico?_omni=${Date.now()}`;
	});
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
	const origin = originOf(p.url);
	if (!origin) {
		reachability.update((s) => ({ ...s, [p.id]: 'unknown' }));
		return;
	}
	lastChecked.set(p.id, now);
	const cur = get(reachability)[p.id];
	if (cur !== 'online' && cur !== 'offline') {
		reachability.update((s) => ({ ...s, [p.id]: 'checking' }));
	}
	const ok = await pingFavicon(origin);
	reachability.update((s) => ({ ...s, [p.id]: ok ? 'online' : 'offline' }));
	reachabilityCheckedAt.update((s) => ({ ...s, [p.id]: Date.now() }));
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
