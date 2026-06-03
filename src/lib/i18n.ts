import { derived } from 'svelte/store';
import { settings } from './stores/settings';

export type Lang = 'de' | 'en';

// Wörterbuch: pro Schlüssel die deutsche und englische Fassung.
// Neue Texte einfach hier ergänzen – Komponenten nutzen $t('schlüssel').
const dict: Record<string, { de: string; en: string }> = {
	// --- Navigation / Sidebar ---
	'nav.home': { de: 'Übersicht', en: 'Overview' },
	'nav.watchlist': { de: 'Gemerkt', en: 'Saved' },
	'nav.news': { de: 'Neuigkeiten', en: 'News' },
	'nav.upcoming': { de: 'Upcoming', en: 'Upcoming' },
	'nav.watchingNow': { de: 'Schaut gerade', en: 'Now playing' },
	'nav.crCalendar': { de: 'CR Kalender', en: 'CR Calendar' },
	'nav.stats': { de: 'Statistiken', en: 'Statistics' },
	'nav.settings': { de: 'Einstellungen', en: 'Settings' },
	'sidebar.background': { de: 'Im Hintergrund', en: 'In background' },

	// --- Hintergrund-Streams ---
	'bg.toForeground': { de: 'In den Vordergrund holen', en: 'Bring to foreground' },
	'bg.closeStream': { de: 'Stream schließen', en: 'Close stream' },
	'bg.volume': { de: 'Lautstärke', en: 'Volume' },
	'bg.allLoud': { de: 'Alle laut', en: 'Unmute all' },
	'bg.allMute': { de: 'Alle stumm', en: 'Mute all' },
	'bg.closeAll': { de: 'Alle schließen', en: 'Close all' },

	// --- Allgemein ---
	'common.mute': { de: 'Stummschalten', en: 'Mute' },
	'common.unmute': { de: 'Ton einschalten', en: 'Unmute' },
	'common.themeToggle': { de: 'Hell/Dunkel', en: 'Light/Dark' },
	'common.notifications': { de: 'Benachrichtigungen', en: 'Notifications' },
	'common.back': { de: 'Zurück', en: 'Back' },
	'common.next': { de: 'Weiter', en: 'Next' },
	'common.done': { de: 'Fertig', en: 'Done' },
	'common.remove': { de: 'Entfernen', en: 'Remove' },
	'common.dragSort': { de: 'Zum Sortieren ziehen', en: 'Drag to sort' },

	// --- Kategorien (Anbieter-Einordnung) ---
	'cat.all': { de: 'Alle', en: 'All' },
	'cat.film-serien': { de: 'Filme & Serien', en: 'Movies & Shows' },
	'cat.anime': { de: 'Anime', en: 'Anime' },
	'cat.live-tv': { de: 'Live-TV', en: 'Live TV' },
	'cat.mediathek': { de: 'Mediatheken', en: 'Catch-up TV' },
	'cat.sport': { de: 'Sport', en: 'Sports' },
	'cat.musik': { de: 'Musik', en: 'Music' },
	'cat.video': { de: 'Video', en: 'Video' },
	'cat.eigene': { de: 'Eigene', en: 'Custom' },

	// --- Startseite ---
	'home.searchPh': { de: 'Anbieter, Film, Serie, YouTube-URL…', en: 'Provider, movie, show, YouTube URL…' },
	'home.surprise': { de: 'Überrasch mich – zufälligen Anbieter öffnen', en: 'Surprise me – open a random provider' },
	'home.surpriseAria': { de: 'Zufälligen Anbieter öffnen', en: 'Open a random provider' },
	'home.sortAZ': { de: 'Wieder alphabetisch sortieren (eigene Reihenfolge verwerfen)', en: 'Sort alphabetically again (discard custom order)' },
	'home.add': { de: 'Eigenen Anbieter hinzufügen', en: 'Add custom provider' },
	'home.grid': { de: 'Raster', en: 'Grid' },
	'home.gridAria': { de: 'Rasteransicht', en: 'Grid view' },
	'home.list': { de: 'Liste', en: 'List' },
	'home.listAria': { de: 'Listenansicht', en: 'List view' },
	'home.recentSearch': { de: 'Zuletzt gesucht', en: 'Recent searches' },
	'home.searchAgain': { de: 'Erneut nach „{term}" suchen', en: 'Search for “{term}” again' },
	'home.removeFromHistory': { de: 'Aus Suchverlauf entfernen', en: 'Remove from search history' },
	'home.resume': { de: 'Weiterschauen', en: 'Continue watching' },
	'home.resumeTitle': { de: '„{label}" fortsetzen', en: 'Resume “{label}”' },
	'home.favorites': { de: 'Favoriten', en: 'Favorites' },
	'home.dragToSort': { de: 'ziehen zum Sortieren', en: 'drag to sort' },
	'home.allProviders': { de: 'Alle Anbieter', en: 'All providers' },
	'home.dragCards': { de: 'Karten zum Sortieren ziehen', en: 'drag cards to sort' },
	'home.openTitle': { de: '{name} öffnen', en: 'Open {name}' },
	'home.favorite': { de: 'Favorit', en: 'Favorite' },
	'home.toFavorites': { de: 'Zu Favoriten', en: 'Add to favorites' },
	'home.toggleFavorite': { de: 'Favorit umschalten', en: 'Toggle favorite' },
	'home.addProvider': { de: 'Anbieter', en: 'Provider' },

	// --- Onboarding ---
	'ob.welcomeTitle': { de: 'Willkommen bei OmniHub', en: 'Welcome to OmniHub' },
	'ob.tagline': { de: 'OmniHub bündelt deine Streaming-Dienste in einem Fenster.', en: 'OmniHub brings your streaming services together in one window.' },
	'ob.intro': { de: 'In den nächsten Schritten richten wir kurz Sprache, Profil, Design und die sichtbaren Anbieter ein. Du kannst alles später in den Einstellungen ändern.', en: "In the next steps we'll quickly set up language, profile, design and visible providers. You can change everything later in settings." },
	'ob.langTitle': { de: 'Wähle deine Sprache', en: 'Choose your language' },
	'ob.langHint': { de: 'Du kannst die Sprache später jederzeit in den Einstellungen ändern.', en: 'You can change the language any time later in settings.' },
	'ob.profileTitle': { de: 'Wie soll dein erstes Profil heißen?', en: 'What should your first profile be called?' },
	'ob.profilePh': { de: 'Profil 1', en: 'Profile 1' },
	'ob.profileHint': { de: 'Du kannst später bis zu 5 Profile mit eigener Watchlist und Statistik anlegen.', en: 'You can later create up to 5 profiles with their own watchlist and statistics.' },
	'ob.accentTitle': { de: 'Wähle deine Akzentfarbe', en: 'Choose your accent color' },
	'ob.accentHint': { de: 'Beeinflusst Buttons, Hervorhebungen und die aktive Sidebar-Auswahl.', en: 'Affects buttons, highlights and the active sidebar item.' },
	'ob.provTitle': { de: 'Welche Anbieter sollen in der Übersicht erscheinen?', en: 'Which providers should appear on the overview?' }
};

function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
	const entry = dict[key];
	let s = entry ? entry[lang] ?? entry.de : key;
	if (params) for (const k of Object.keys(params)) s = s.split(`{${k}}`).join(String(params[k]));
	return s;
}

/** Reaktiver Übersetzer: `$t('schlüssel')` bzw. `$t('schlüssel', { name })`. */
export const t = derived(settings, ($s) => {
	const lang: Lang = ($s.appearance.language as Lang) === 'en' ? 'en' : 'de';
	return (key: string, params?: Record<string, string | number>) => translate(lang, key, params);
});

/** Nicht-reaktiver Helfer (für Code außerhalb von Komponenten). */
export function tr(lang: Lang, key: string, params?: Record<string, string | number>): string {
	return translate(lang, key, params);
}
