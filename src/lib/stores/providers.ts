import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_PROVIDERS } from '$lib/data/providers';
import { loadState, saveState } from '$lib/persistence';
import type { Provider, Quality, ProviderCollection } from '$lib/types';

// Katalog = global (welche Anbieter existieren, URL, Farbe, sichtbar/versteckt).
export const providers = writable<Provider[]>([]);
// Favoriten & "zuletzt geöffnet" = PRO PROFIL (nur IDs).
export const favorites = writable<string[]>([]);
export const recentProviderIds = writable<string[]>([]);
// Eigene Kartenreihenfolge je Profil (Liste von IDs). Leer = alphabetisch.
export const providerOrder = writable<string[]>([]);

// Benutzerdefinierte Sammlungen ("Ordner") – pro Profil.
export const collections = writable<ProviderCollection[]>([]);

export function addCollection(name: string): string {
	const id = `col-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
	collections.update((c) => [...c, { id, name: name.trim() || 'Sammlung', providerIds: [], collapsed: false }]);
	return id;
}
export function renameCollection(id: string, name: string): void {
	collections.update((c) => c.map((x) => (x.id === id ? { ...x, name: name.trim() || x.name } : x)));
}
export function deleteCollection(id: string): void {
	collections.update((c) => c.filter((x) => x.id !== id));
}
export function toggleCollectionProvider(id: string, providerId: string): void {
	collections.update((c) =>
		c.map((x) =>
			x.id === id
				? {
						...x,
						providerIds: x.providerIds.includes(providerId)
							? x.providerIds.filter((p) => p !== providerId)
							: [...x.providerIds, providerId]
					}
				: x
		)
	);
}
export function toggleCollectionCollapsed(id: string): void {
	collections.update((c) => c.map((x) => (x.id === id ? { ...x, collapsed: !x.collapsed } : x)));
}

export function setProviderOrder(ids: string[]): void {
	providerOrder.set(ids);
}

export const visibleProviders = derived(providers, ($p) => $p.filter((x) => !x.hidden));
export const favoriteProviders = derived([providers, favorites], ([$p, $f]) =>
	$f.map((id) => $p.find((x) => x.id === id)).filter((x): x is Provider => !!x && !x.hidden)
);
export const recentProviders = derived([providers, recentProviderIds], ([$p, $ids]) =>
	($ids.map((id) => $p.find((x) => x.id === id)).filter(Boolean) as Provider[])
);

export function resetProviders(): void {
	providers.set(structuredClone(DEFAULT_PROVIDERS));
}

export function toggleFavorite(id: string): void {
	favorites.update(($f) => ($f.includes(id) ? $f.filter((x) => x !== id) : [...$f, id]));
}

// Anbieter aus-/einblenden (bleibt im Katalog, nur aus den sichtbaren Listen entfernt).
export function toggleProviderHidden(id: string): void {
	providers.update(($p) => $p.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)));
}
// Sicheres Einblenden (z. B. aus der „Ausgeblendet"-Liste).
export function unhideProvider(id: string): void {
	providers.update(($p) => $p.map((x) => (x.id === id ? { ...x, hidden: false } : x)));
}

export function setFavoritesOrder(ids: string[]): void {
	favorites.set(ids);
}

export function markOpened(id: string): void {
	recentProviderIds.update(($r) => [id, ...$r.filter((x) => x !== id)].slice(0, 5));
}

export function addCustomProvider(data: {
	name: string; url: string; subtitle?: string; color?: string; quality?: Quality;
}): void {
	const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	const id = `custom-${slug || 'anbieter'}-${Date.now().toString(36)}`;
	let url = data.url.trim();
	if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
	const color = data.color || '#30c5bb';
	const colorManual = !!(data.color && data.color !== '#30c5bb');
	providers.update(($p) => [
		...$p,
		{
			id, name: data.name.trim() || 'Eigener Anbieter',
			subtitle: (data.subtitle || 'Eigener Anbieter').trim(),
			url, category: 'eigene', color, color2: color, colorManual,
			quality: data.quality || 'HD', custom: true
		}
	]);
}

export function removeCustomProvider(id: string): void {
	providers.update(($p) => $p.filter((x) => x.id !== id));
}

// Welche Karte wird gerade im Karteneditor bearbeitet (null = Editor zu).
export const editingProvider = writable<Provider | null>(null);
// Aktuell für die Detailseite (/provider) ausgewählter Anbieter.
export const detailProviderId = writable<string | null>(null);

// Bearbeitet eine bestehende Karte (Standard ODER eigener Anbieter).
export function updateProvider(id: string, patch: Partial<Provider>): void {
	providers.update(($p) => $p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

// Setzt eine Standard-Karte wieder auf ihre Werkseinstellungen zurück.
export function resetProviderToDefault(id: string): void {
	const def = DEFAULT_PROVIDERS.find((d) => d.id === id);
	if (!def) return; // eigene Anbieter haben keinen Standard
	providers.update(($p) => $p.map((x) => (x.id === id ? { ...structuredClone(def), hidden: x.hidden } : x)));
}

// --- Katalog (global) ---
let catalogReady = false;
export async function hydrateCatalog(): Promise<void> {
	if (catalogReady || !browser) return;
	catalogReady = true;
	const saved = await loadState<Provider[] | null>('providers', null);
	if (saved && Array.isArray(saved) && saved.length) {
		// Gespeicherte Karten-Bearbeitungen übernehmen (Name/Farbe/URL/Logo …),
		// dabei NEUE Felder künftiger Versionen aus dem Standard ergänzen.
		const merged = DEFAULT_PROVIDERS.map((def) => {
			const old = saved.find((x) => x.id === def.id);
			return old ? { ...def, ...old } : def;
		});
		const customs = saved.filter((x) => x.custom);
		providers.set([...merged, ...customs]);
	} else {
		providers.set(structuredClone(DEFAULT_PROVIDERS));
	}
}

// --- Profilbezogene Daten (Favoriten / zuletzt geöffnet) ---
let pid: string | null = null;
let profReady = false;
export async function loadProviderProfileData(profileId: string): Promise<void> {
	pid = profileId;
	favorites.set(await loadState<string[]>(`favorites:${profileId}`, []));
	recentProviderIds.set(await loadState<string[]>(`recent:${profileId}`, []));
	providerOrder.set(await loadState<string[]>(`order:${profileId}`, []));
	collections.set(await loadState<ProviderCollection[]>(`collections:${profileId}`, []));
	profReady = true;
}

if (browser) {
	providers.subscribe(($p) => { if (catalogReady) void saveState('providers', $p); });
	favorites.subscribe(($f) => { if (profReady && pid) void saveState(`favorites:${pid}`, $f); });
	recentProviderIds.subscribe(($r) => { if (profReady && pid) void saveState(`recent:${pid}`, $r); });
	providerOrder.subscribe(($o) => { if (profReady && pid) void saveState(`order:${pid}`, $o); });
	collections.subscribe(($c) => { if (profReady && pid) void saveState(`collections:${pid}`, $c); });
}

export const activeStream = writable<Provider | null>(null);
