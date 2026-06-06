// Achievements: 50 Stück, rein abgeleitet aus Favoriten, Watchlist und Streamzeit.
// Freischalt-Meldungen laufen über In-App-Toasts (keine Windows-Benachrichtigungen).
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';
import { favorites } from './providers';
import { watchlist } from './watchlist';
import { totalWatchMs, openCount, distinctProvidersWatched } from './tracking';
import { settings } from './settings';
import { pushNotification } from './toasts';

export interface Achievement {
	id: string;
	name: string;
	desc: string;
	icon: string;
	metric: 'opens' | 'distinct' | 'favs' | 'wl' | 'hours';
	value: number;
	goal: number;
	progress: number;
	unlocked: boolean;
}

type Tier = { goal: number; name: string; en: string };

const OPENS: Tier[] = [
	{ goal: 1, name: 'Erstes Mal', en: 'First time' }, { goal: 5, name: 'Reinschnuppern', en: 'First taste' }, { goal: 10, name: 'Stammgast', en: 'Regular' },
	{ goal: 25, name: 'Vielnutzer', en: 'Frequent user' }, { goal: 50, name: 'Power-User', en: 'Power user' }, { goal: 100, name: 'Dauergast', en: 'Frequent guest' },
	{ goal: 200, name: 'Klick-König', en: 'Click king' }, { goal: 500, name: 'Klick-Profi', en: 'Click pro' }, { goal: 1000, name: 'Klick-Legende', en: 'Click legend' }
];
const DISTINCT: Tier[] = [
	{ goal: 2, name: 'Neugierig', en: 'Curious' }, { goal: 3, name: 'Entdecker', en: 'Explorer' }, { goal: 5, name: 'Wanderer', en: 'Wanderer' },
	{ goal: 8, name: 'Vielseitig', en: 'Versatile' }, { goal: 10, name: 'Allesseher', en: 'All-seer' }, { goal: 15, name: 'Dienste-Sammler', en: 'Service collector' },
	{ goal: 20, name: 'Kenner', en: 'Connoisseur' }, { goal: 24, name: 'Komplettist', en: 'Completionist' }
];
const FAVS: Tier[] = [
	{ goal: 1, name: 'Erster Favorit', en: 'First favorite' }, { goal: 2, name: 'Zwei Lieblinge', en: 'Two favorites' }, { goal: 3, name: 'Lieblinge', en: 'Favorites' },
	{ goal: 5, name: 'Treue Auswahl', en: 'Loyal picks' }, { goal: 8, name: 'Großer Fan', en: 'Big fan' }, { goal: 10, name: 'Fan-Club', en: 'Fan club' },
	{ goal: 15, name: 'Super-Fan', en: 'Super fan' }, { goal: 20, name: 'Maximal-Fan', en: 'Ultimate fan' }
];
const WL: Tier[] = [
	{ goal: 1, name: 'Erster Merker', en: 'First bookmark' }, { goal: 3, name: 'Kleine Liste', en: 'Small list' }, { goal: 5, name: 'Sammler', en: 'Collector' },
	{ goal: 10, name: 'Listen-Freund', en: 'List friend' }, { goal: 20, name: 'Listen-Profi', en: 'List pro' }, { goal: 35, name: 'Vielmerker', en: 'Heavy saver' },
	{ goal: 50, name: 'Listen-Meister', en: 'List master' }, { goal: 75, name: 'Mega-Liste', en: 'Mega list' }, { goal: 100, name: 'Listen-Legende', en: 'List legend' }
];
const HOURS: Tier[] = [
	{ goal: 0.5, name: 'Erste Minuten', en: 'First minutes' }, { goal: 1, name: 'Couch-Potato', en: 'Couch potato' }, { goal: 2, name: 'Warmgelaufen', en: 'Warmed up' },
	{ goal: 5, name: 'Serien-Snack', en: 'Series snack' }, { goal: 10, name: 'Marathon-Starter', en: 'Marathon starter' }, { goal: 15, name: 'Marathon', en: 'Marathon' },
	{ goal: 25, name: 'Vielseher', en: 'Heavy viewer' }, { goal: 50, name: 'Halbtags-Streamer', en: 'Part-time streamer' }, { goal: 75, name: 'Dauerseher', en: 'Constant viewer' },
	{ goal: 100, name: 'Hundert Stunden', en: 'Hundred hours' }, { goal: 150, name: 'Bingewatcher', en: 'Binge-watcher' }, { goal: 200, name: 'Profi-Seher', en: 'Pro viewer' },
	{ goal: 300, name: 'Couch-Veteran', en: 'Couch veteran' }, { goal: 500, name: 'Streaming-Meister', en: 'Streaming master' }, { goal: 750, name: 'Streaming-Halbgott', en: 'Streaming demigod' },
	{ goal: 1000, name: 'Streaming-Legende', en: 'Streaming legend' }
];

function iconFor(metric: Achievement['metric'], goal: number): string {
	if (metric === 'hours') return goal >= 500 ? '👑' : goal >= 100 ? '🏆' : '🛋️';
	if (metric === 'opens') return goal >= 500 ? '👑' : '🎬';
	if (metric === 'distinct') return '🧭';
	if (metric === 'favs') return goal >= 15 ? '💛' : '⭐';
	return goal >= 75 ? '📚' : '🔖';
}
function descFor(metric: Achievement['metric'], goal: number, lang: 'de' | 'en'): string {
	if (lang === 'en') {
		switch (metric) {
			case 'opens': return `${goal} streams started`;
			case 'distinct': return `${goal} different providers used`;
			case 'favs': return `${goal} favorites marked`;
			case 'wl': return `${goal} titles on the watchlist`;
			case 'hours': return goal < 1 ? `${goal * 60} minutes streamed` : `${goal} hours streamed`;
		}
	}
	switch (metric) {
		case 'opens': return `${goal} Streams gestartet`;
		case 'distinct': return `${goal} verschiedene Anbieter genutzt`;
		case 'favs': return `${goal} Favoriten markiert`;
		case 'wl': return `${goal} Titel auf der Watchlist`;
		case 'hours': return goal < 1 ? `${goal * 60} Minuten gestreamt` : `${goal} Stunden gestreamt`;
	}
}

function build(metric: Achievement['metric'], tiers: Tier[], value: number, lang: 'de' | 'en'): Achievement[] {
	return tiers.map((t, i) => ({
		id: `${metric}-${i}`,
		name: lang === 'en' ? t.en : t.name,
		desc: descFor(metric, t.goal, lang),
		icon: iconFor(metric, t.goal),
		metric,
		value,
		goal: t.goal,
		progress: Math.max(0, Math.min(1, value / t.goal)),
		unlocked: value >= t.goal
	}));
}

export const achievements = derived(
	[favorites, watchlist, totalWatchMs, openCount, distinctProvidersWatched, settings],
	([$fav, $wl, $total, $opens, $distinct, $settings]) => {
		const hours = $total / 3_600_000;
		const lang: 'de' | 'en' = $settings.appearance.language === 'en' ? 'en' : 'de';
		return [
			...build('opens', OPENS, $opens, lang),
			...build('distinct', DISTINCT, $distinct, lang),
			...build('favs', FAVS, $fav.length, lang),
			...build('wl', WL, $wl.length, lang),
			...build('hours', HOURS, hours, lang)
		];
	}
);

export const unlockedCount = derived(achievements, ($a) => $a.filter((x) => x.unlocked).length);

// --- Freischalt-Meldungen pro Profil (nur In-App-Toast) ---
export const celebrated = writable<string[]>([]);
let pid: string | null = null;
let celebReady = false;

export async function loadCelebratedForProfile(profileId: string, currentlyUnlockedIds: string[]): Promise<void> {
	pid = profileId;
	let saved = await loadState<string[] | null>(`celebrated:${profileId}`, null);
	if (saved == null) saved = currentlyUnlockedIds; // Baseline: keine Flut beim Profilwechsel
	celebrated.set(saved);
	celebReady = true;
}

export function maybeNotify(list: Achievement[], enabled: boolean): void {
	if (!celebReady || !browser) return;
	const seen = get(celebrated);
	const newly = list.filter((a) => a.unlocked && !seen.includes(a.id));
	if (newly.length === 0) return;
	celebrated.update((c) => [...c, ...newly.map((a) => a.id)]);
	if (!enabled) return;
	for (const a of newly) {
		pushNotification('🏆 Achievement freigeschaltet', `${a.name} – ${a.desc}`, a.icon);
	}
}

if (browser) {
	celebrated.subscribe(($c) => { if (celebReady && pid) void saveState(`celebrated:${pid}`, $c); });
}
