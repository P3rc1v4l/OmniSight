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

// Einfacher In-Memory-Cache für Detail-Abrufe: derselbe Titel wird oft mehrfach
// geöffnet (Titel-Info, Empfehlungen, Serien-Tracker) – das spart Anfragen und Zeit.
const detailsCache = new Map<string, { t: number; v: Record<string, unknown> }>();
const seasonCache = new Map<string, { t: number; v: Record<string, unknown> }>();
const DETAILS_TTL = 6 * 60 * 60 * 1000; // 6 Stunden

export const tmdb = {
	search: (query: string) => call<TmdbItem[]>('tmdb_search', { query }),
	trending: () => call<TmdbItem[]>('tmdb_trending'),
	upcoming: () => call<TmdbItem[]>('tmdb_upcoming'),
	list: (path: string, params: [string, string][], mediaFallback: 'movie' | 'tv') =>
		call<TmdbItem[]>('tmdb_list', { path, params, mediaFallback }),
	details: async (mediaType: 'movie' | 'tv', id: number): Promise<Record<string, unknown> | null> => {
		const key = `${mediaType}-${id}`;
		const hit = detailsCache.get(key);
		if (hit && Date.now() - hit.t < DETAILS_TTL) return hit.v;
		const v = await call<Record<string, unknown>>('tmdb_details', { mediaType, id });
		if (v) detailsCache.set(key, { t: Date.now(), v });
		return v;
	},
	season: async (id: number, season: number): Promise<Record<string, unknown> | null> => {
		const key = `${id}-${season}`;
		const hit = seasonCache.get(key);
		if (hit && Date.now() - hit.t < DETAILS_TTL) return hit.v;
		const v = await call<Record<string, unknown>>('tmdb_season', { id, season });
		if (v) seasonCache.set(key, { t: Date.now(), v });
		return v;
	}
};
