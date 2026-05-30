// Frontend-Wrapper für die Rust-Commands aus src-tauri/src/tmdb.rs.
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { TmdbItem } from '$lib/types';

// Aktuell im Titel-Info-Fenster geöffneter Titel (oder null).
export const titleInfo = writable<TmdbItem | null>(null);
export function openTitleInfo(item: TmdbItem): void {
	titleInfo.set(item);
}
export function closeTitleInfo(): void {
	titleInfo.set(null);
}

async function call<T>(name: string, args: Record<string, unknown> = {}): Promise<T | null> {
	if (!browser) return null;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		return (await invoke(name, args)) as T;
	} catch (e) {
		console.warn(`[tmdb] ${name} fehlgeschlagen:`, e);
		return null;
	}
}

export const tmdb = {
	search: (query: string) => call<TmdbItem[]>('tmdb_search', { query }),
	trending: () => call<TmdbItem[]>('tmdb_trending'),
	upcoming: () => call<TmdbItem[]>('tmdb_upcoming'),
	list: (path: string, params: [string, string][], mediaFallback: 'movie' | 'tv') =>
		call<TmdbItem[]>('tmdb_list', { path, params, mediaFallback }),
	details: (mediaType: 'movie' | 'tv', id: number) =>
		call<Record<string, unknown>>('tmdb_details', { mediaType, id })
};
