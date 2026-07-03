// Wrapper für tauri-plugin-store. Vereinheitlicht Lesen/Schreiben und schluckt
// Fehler in der Web-Vorschau (wo Tauri nicht da ist) ohne die App zu blockieren.
import { browser } from '$app/environment';

type StoreLike = {
	get<T = unknown>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown): Promise<void>;
	save(): Promise<void>;
	entries?<T = unknown>(): Promise<[string, T][]>;
};

let storePromise: Promise<StoreLike | null> | null = null;

// localStorage-Store für die Web-Version: gleiche Schnittstelle wie tauri-plugin-store.
function makeLocalStore(): StoreLike {
	const P = 'omnisight:';
	return {
		async get<T = unknown>(key: string): Promise<T | undefined> {
			try {
				const raw = localStorage.getItem(P + key);
				return raw === null ? undefined : (JSON.parse(raw) as T);
			} catch {
				return undefined;
			}
		},
		async set(key: string, value: unknown): Promise<void> {
			try { localStorage.setItem(P + key, JSON.stringify(value)); } catch { /* voll/gesperrt */ }
		},
		async save(): Promise<void> { /* localStorage schreibt sofort */ }
	};
}

async function getStore(): Promise<StoreLike | null> {
	if (!browser) return null;
	if (!storePromise) {
		storePromise = (async () => {
			try {
				const mod = await import('@tauri-apps/plugin-store');
				// In Tauri v2 heißt der Loader "load" und liefert eine Promise.
				const store = await mod.load('omnisight.json', { autoSave: true, defaults: {} });
				return store as unknown as StoreLike;
			} catch {
				// Web-Version/Browser: Persistenz über localStorage (pro Browser-Profil).
				return makeLocalStore();
			}
		})();
	}
	return storePromise;
}

export async function loadState<T>(key: string, fallback: T): Promise<T> {
	const s = await getStore();
	if (!s) return fallback;
	try {
		const v = await s.get<T>(key);
		return v === undefined || v === null ? fallback : v;
	} catch {
		return fallback;
	}
}

export async function saveState<T>(key: string, value: T): Promise<void> {
	const s = await getStore();
	if (!s) return;
	try {
		await s.set(key, value);
	} catch {
		/* ignore */
	}
}

// Alle gespeicherten Schlüssel/Werte aus dem Plugin-Store lesen (für Backups).
export async function exportStore(): Promise<Record<string, unknown>> {
	const s = await getStore();
	if (!s || !s.entries) return {};
	try {
		const out: Record<string, unknown> = {};
		for (const [k, v] of await s.entries()) out[k] = v;
		return out;
	} catch {
		return {};
	}
}

// Schlüssel/Werte in den Plugin-Store schreiben und sichern (für Restore).
export async function importStore(obj: Record<string, unknown>): Promise<void> {
	const s = await getStore();
	if (!s) return;
	try {
		for (const [k, v] of Object.entries(obj)) await s.set(k, v);
		await s.save();
	} catch {
		/* ignore */
	}
}
