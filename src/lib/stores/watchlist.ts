import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { WatchlistItem, TmdbItem } from '$lib/types';
import { loadState, saveState } from '$lib/persistence';
import { pushToast } from './toasts';
import { t } from '$lib/i18n';

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

export function setRating(tmdbId: number, mediaType: 'movie' | 'tv', rating: number): void {
	watchlist.update(($w) =>
		$w.map((x) => (x.tmdbId === tmdbId && x.mediaType === mediaType ? { ...x, rating } : x))
	);
}

export function toggleSeen(tmdbId: number, mediaType: 'movie' | 'tv'): void {
	watchlist.update(($w) =>
		$w.map((x) => (x.tmdbId === tmdbId && x.mediaType === mediaType ? { ...x, seen: !x.seen } : x))
	);
}

let pid: string | null = null;
let ready = false;

// Bereits gemeldete Release-Hinweise (pro Profil) – verhindert mehrfache Toasts.
const notified = writable<string[]>([]);
function todayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Meldet Titel der Watchlist, die HEUTE erscheinen – einmal je Titel.
// `enabled` kommt aus den Einstellungen (notifications.watchlistReminder).
export function maybeNotifyReleases(items: WatchlistItem[], enabled: boolean): void {
	if (!browser || !ready) return;
	const today = todayStr();
	const due = items.filter((w) => w.releaseDate === today && !w.seen);
	if (!due.length) return;
	const already = get(notified);
	const fresh = due.filter((w) => !already.includes(w.mediaType + '-' + w.tmdbId));
	if (!fresh.length) return;
	notified.update((n) => [...n, ...fresh.map((w) => w.mediaType + '-' + w.tmdbId)]);
	if (!enabled) return;
	for (const w of fresh) {
		pushToast(get(t)('wl.relNotify', { title: w.title }), undefined, '📅', 6000);
	}
}

export async function loadWatchlistForProfile(profileId: string): Promise<void> {
	pid = profileId;
	watchlist.set(await loadState<WatchlistItem[]>(`watchlist:${profileId}`, []));
	notified.set(await loadState<string[]>(`relnotified:${profileId}`, []));
	ready = true;
}

if (browser) {
	watchlist.subscribe(($w) => { if (ready && pid) void saveState(`watchlist:${pid}`, $w); });
	notified.subscribe(($n) => { if (ready && pid) void saveState(`relnotified:${pid}`, $n); });
}
