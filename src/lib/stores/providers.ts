import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_PROVIDERS } from '$lib/data/providers';
import { loadState, saveState } from '$lib/persistence';
import type { Provider } from '$lib/types';

export const providers = writable<Provider[]>([]);
export const recentProviderIds = writable<string[]>([]); // ID-Liste, neueste zuerst, max 5

export const visibleProviders = derived(providers, ($p) => $p.filter((x) => !x.hidden));
export const favoriteProviders = derived(providers, ($p) => $p.filter((x) => x.favorite && !x.hidden));
export const recentProviders = derived(
	[providers, recentProviderIds],
	([$p, $ids]) => $ids.map((id) => $p.find((x) => x.id === id)).filter(Boolean) as Provider[]
);

export function resetProviders(): void {
	providers.set(structuredClone(DEFAULT_PROVIDERS));
}

export function toggleFavorite(id: string): void {
	providers.update(($p) =>
		$p.map((x) => (x.id === id ? { ...x, favorite: !x.favorite } : x))
	);
}

export function markOpened(id: string): void {
	recentProviderIds.update(($r) => [id, ...$r.filter((x) => x !== id)].slice(0, 5));
}

let loaded = false;
export async function hydrateProviders(): Promise<void> {
	if (loaded || !browser) return;
	loaded = true;
	const saved = await loadState<Provider[] | null>('providers', null);
	// Defaults mit eventuell vorhandenen "custom" Anbietern aus dem Speicher mergen.
	if (saved && Array.isArray(saved) && saved.length) {
		// Stelle sicher, dass Standard-Anbieter aktuelle Metadaten haben, aber
		// nutzerseitige Felder (favorite/hidden) übernommen werden.
		const merged = DEFAULT_PROVIDERS.map((def) => {
			const old = saved.find((x) => x.id === def.id);
			return old ? { ...def, favorite: old.favorite, hidden: old.hidden } : def;
		});
		const customs = saved.filter((x) => x.custom);
		providers.set([...merged, ...customs]);
	} else {
		providers.set(structuredClone(DEFAULT_PROVIDERS));
	}
	recentProviderIds.set(await loadState<string[]>('recentProviderIds', []));
}

if (browser) {
	providers.subscribe(($p) => { if (loaded) void saveState('providers', $p); });
	recentProviderIds.subscribe(($r) => { if (loaded) void saveState('recentProviderIds', $r); });
}

export const activeStream = writable<Provider | null>(null);
