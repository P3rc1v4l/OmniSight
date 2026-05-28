import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { WatchlistItem, TmdbItem } from '$lib/types';
import { loadState, saveState } from '$lib/persistence';

export const watchlist = writable<WatchlistItem[]>([]);

export function addToWatchlist(item: TmdbItem): void {
	watchlist.update(($w) => {
		if ($w.some((x) => x.tmdbId === item.id && x.mediaType === item.media_type)) return $w;
		const entry: WatchlistItem = {
			tmdbId: item.id,
			mediaType: item.media_type as 'movie' | 'tv',
			title: item.title,
			poster: item.poster,
			overview: item.overview,
			releaseDate: item.release_date,
			addedAt: Date.now()
		};
		return [entry, ...$w];
	});
}

export function removeFromWatchlist(tmdbId: number, mediaType: 'movie' | 'tv'): void {
	watchlist.update(($w) => $w.filter((x) => !(x.tmdbId === tmdbId && x.mediaType === mediaType)));
}

export function isInWatchlist(items: WatchlistItem[], tmdbId: number, mediaType: string): boolean {
	return items.some((x) => x.tmdbId === tmdbId && x.mediaType === mediaType);
}

let loaded = false;
export async function hydrateWatchlist(): Promise<void> {
	if (loaded || !browser) return;
	loaded = true;
	watchlist.set(await loadState<WatchlistItem[]>('watchlist', []));
}

if (browser) {
	watchlist.subscribe(($w) => { if (loaded) void saveState('watchlist', $w); });
}
