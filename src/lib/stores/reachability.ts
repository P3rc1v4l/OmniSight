// Grobe Erreichbarkeits-Anzeige pro Anbieter. Wir laden das Favicon der Domain
// (Bilder unterliegen keiner CORS-Beschränkung): lädt es -> erreichbar, Fehler/
// Timeout -> nicht erreichbar. Das ist KEIN Login-/Service-Status, nur ein Ping.
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type ReachState = 'unknown' | 'checking' | 'online' | 'offline';

export const reachability = writable<Record<string, ReachState>>({});

const lastChecked = new Map<string, number>();
const TTL = 5 * 60 * 1000; // 5 Minuten Cache

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
		// Cache-Bust, damit ein zwischenzeitlicher Ausfall erkannt wird.
		img.src = `${origin}/favicon.ico?_omni=${Date.now()}`;
	});
}

export async function checkProvider(p: { id: string; url: string }, force = false): Promise<void> {
	if (!browser) return;
	const now = Date.now();
	if (!force && now - (lastChecked.get(p.id) ?? 0) < TTL) return;
	const origin = originOf(p.url);
	if (!origin) {
		reachability.update((s) => ({ ...s, [p.id]: 'unknown' }));
		return;
	}
	lastChecked.set(p.id, now);
	// Nur auf "checking" setzen, wenn noch kein Ergebnis vorliegt (vermeidet Flackern).
	const cur = get(reachability)[p.id];
	if (cur !== 'online' && cur !== 'offline') {
		reachability.update((s) => ({ ...s, [p.id]: 'checking' }));
	}
	const ok = await pingFavicon(origin);
	reachability.update((s) => ({ ...s, [p.id]: ok ? 'online' : 'offline' }));
}

export function checkProviders(list: { id: string; url: string }[], force = false): void {
	for (const p of list) void checkProvider(p, force);
}
