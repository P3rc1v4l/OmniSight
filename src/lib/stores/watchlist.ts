import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { WatchlistItem, TmdbItem } from '$lib/types';
import { loadState, saveState } from '$lib/persistence';
import { pushNotification } from './toasts';
import { tmdb } from '$lib/tmdb';
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
		pushNotification(get(t)('wl.relNotify', { title: w.title }), undefined, '📅', 6000);
	}
}

// Prüft für gemerkte Serien, ob heute eine neue Folge erschienen ist (TMDB
// `last_episode_to_air`), und meldet sie einmalig. Läuft 1× pro App-Sitzung (Netzwerk!).
let episodesChecking = false;
export async function maybeNotifyEpisodes(items: WatchlistItem[], enabled: boolean): Promise<void> {
	if (!browser || !ready || episodesChecking) return;
	episodesChecking = true;
	try {
		const today = todayStr();
		const tvItems = items.filter((w) => w.mediaType === 'tv' && !w.seen);
		for (const w of tvItems) {
			let det: Record<string, unknown> | null = null;
			try {
				det = await tmdb.details('tv', w.tmdbId);
			} catch {
				continue;
			}
			const last = det?.['last_episode_to_air'] as
				| { air_date?: string; season_number?: number; episode_number?: number }
				| null
				| undefined;
			if (!last || last.air_date !== today) continue;
			const key = `ep:tv-${w.tmdbId}-s${last.season_number}e${last.episode_number}`;
			if (get(notified).includes(key)) continue;
			notified.update((n) => [...n, key]);
			if (enabled) {
				const ep = `S${last.season_number}·E${last.episode_number}`;
				pushNotification(get(t)('wl.epNotify', { title: w.title, ep }), undefined, '📺', 6000);
			}
		}
	} finally {
		episodesChecking = false;
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
