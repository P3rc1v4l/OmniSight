// Frontend-Wrapper für die Rust-Commands aus src-tauri/src/tmdb.rs.
import { browser } from '$app/environment';
import type { TmdbItem } from '$lib/types';

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
	details: (mediaType: 'movie' | 'tv', id: number) =>
		call<Record<string, unknown>>('tmdb_details', { mediaType, id })
};
