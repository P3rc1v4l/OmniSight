// Achievements: rein abgeleiteter Zustand aus Anbietern, Watchlist und
// Streamzeit. "celebrated" merkt sich, welche bereits gemeldet wurden, damit
// eine Freischalt-Benachrichtigung nur EINMAL erscheint (und nicht bei jedem Start).
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';
import { providers } from './providers';
import { watchlist } from './watchlist';
import { totalWatchMs, openCount, distinctProvidersWatched } from './tracking';

export interface Achievement {
	id: string;
	name: string;
	desc: string;
	icon: string;
	value: number;
	goal: number;
	progress: number; // 0..1
	unlocked: boolean;
}

export const achievements = derived(
	[providers, watchlist, totalWatchMs, openCount, distinctProvidersWatched],
	([$p, $wl, $total, $opens, $distinct]) => {
		const favs = $p.filter((x) => x.favorite).length;
		const hours = $total / 3_600_000;
		const defs = [
			{ id: 'first-open',   name: 'Erstes Mal',    desc: 'Ersten Anbieter geöffnet',          icon: '🎬', value: $opens,    goal: 1 },
			{ id: 'explorer-5',   name: 'Entdecker',     desc: '5 verschiedene Anbieter genutzt',    icon: '🧭', value: $distinct, goal: 5 },
			{ id: 'fav-3',        name: 'Lieblinge',     desc: '3 Favoriten markiert',               icon: '⭐', value: favs,      goal: 3 },
			{ id: 'fav-10',       name: 'Großer Fan',    desc: '10 Favoriten markiert',              icon: '💛', value: favs,      goal: 10 },
			{ id: 'wl-5',         name: 'Sammler',       desc: '5 Titel auf der Watchlist',          icon: '🔖', value: $wl.length, goal: 5 },
			{ id: 'wl-20',        name: 'Listen-Profi',  desc: '20 Titel auf der Watchlist',         icon: '📚', value: $wl.length, goal: 20 },
			{ id: 'streamer-1',   name: 'Couch-Potato',  desc: '1 Stunde gestreamt',                 icon: '🛋️', value: hours,     goal: 1 },
			{ id: 'streamer-10',  name: 'Marathon',      desc: '10 Stunden gestreamt',               icon: '🏃', value: hours,     goal: 10 },
			{ id: 'streamer-100', name: 'Connaisseur',   desc: '100 Stunden gestreamt',              icon: '🏆', value: hours,     goal: 100 }
		];
		return defs.map((d) => ({
			...d,
			progress: Math.max(0, Math.min(1, d.value / d.goal)),
			unlocked: d.value >= d.goal
		})) as Achievement[];
	}
);

export const unlockedCount = derived(achievements, ($a) => $a.filter((x) => x.unlocked).length);

// --- Freischalt-Benachrichtigungen (nur einmal je Achievement) ---
export const celebrated = writable<string[]>([]);
let celebLoaded = false;

export async function hydrateAchievements(currentlyUnlockedIds: string[]): Promise<void> {
	if (celebLoaded || !browser) return;
	celebLoaded = true;
	let saved = await loadState<string[] | null>('celebratedAchievements', null);
	if (saved == null) {
		// Erster Lauf: bereits erfüllte Achievements als "gesehen" markieren,
		// damit beim ersten Öffnen keine Flut an Meldungen kommt.
		saved = currentlyUnlockedIds;
	}
	celebrated.set(saved);
}

export async function maybeNotify(list: Achievement[], enabled: boolean): Promise<void> {
	if (!celebLoaded || !browser || !enabled) return;
	const seen = get(celebrated);
	const newly = list.filter((a) => a.unlocked && !seen.includes(a.id));
	if (newly.length === 0) return;
	celebrated.update((c) => [...c, ...newly.map((a) => a.id)]);
	try {
		const { isPermissionGranted, requestPermission, sendNotification } =
			await import('@tauri-apps/plugin-notification');
		let granted = await isPermissionGranted();
		if (!granted) granted = (await requestPermission()) === 'granted';
		if (granted) {
			for (const a of newly) {
				sendNotification({ title: '🏆 Achievement freigeschaltet', body: `${a.name} – ${a.desc}` });
			}
		}
	} catch {
		/* Browser-Vorschau: keine native Benachrichtigung */
	}
}

if (browser) {
	celebrated.subscribe(($c) => { if (celebLoaded) void saveState('celebratedAchievements', $c); });
}
