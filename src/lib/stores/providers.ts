import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_PROVIDERS } from '$lib/data/providers';
import type { Provider } from '$lib/types';

// Aktive Anbieterliste (Defaults + eigene). Profilgebunden – später persistiert.
export const providers = writable<Provider[]>(browser ? structuredClone(DEFAULT_PROVIDERS) : []);

// Nur sichtbare Anbieter für die Übersicht.
export const visibleProviders = derived(providers, ($p) => $p.filter((x) => !x.hidden));

/** Stellt das Standard-Set wieder her (Button in Einstellungen > Mehr). */
export function resetProviders(): void {
	providers.set(structuredClone(DEFAULT_PROVIDERS));
}

/** Der gerade aktive Stream (für die "Schaut gerade"-Seite). null = keiner. */
export const activeStream = writable<Provider | null>(null);
