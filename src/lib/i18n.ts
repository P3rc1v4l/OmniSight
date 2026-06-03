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
	'ob.provTitle': { de: 'Welche Anbieter sollen in der Übersicht erscheinen?', en: 'Which providers should appear on the overview?' },

	// --- Allgemein (Phase 2) ---
	'common.movie': { de: 'Film', en: 'Movie' },
	'common.series': { de: 'Serie', en: 'Series' },
	'common.movies': { de: 'Filme', en: 'Movies' },
	'common.seriesPl': { de: 'Serien', en: 'Series' },
	'common.all': { de: 'Alle', en: 'All' },
	'common.refresh': { de: 'Aktualisieren', en: 'Refresh' },
	'common.retry': { de: 'Erneut versuchen', en: 'Try again' },

	// --- Statistiken ---
	'stats.title': { de: 'Statistiken', en: 'Statistics' },
	'stats.sub': { de: 'Deine Nutzung und freigeschalteten Achievements.', en: 'Your usage and unlocked achievements.' },
	'stats.totalTime': { de: 'Gesamte Streamzeit', en: 'Total stream time' },
	'stats.startedStreams': { de: 'Gestartete Streams', en: 'Streams started' },
	'stats.usedProviders': { de: 'Genutzte Anbieter', en: 'Providers used' },
	'stats.favorites': { de: 'Favoriten', en: 'Favorites' },
	'stats.watchlistTitles': { de: 'Watchlist-Titel', en: 'Watchlist titles' },
	'stats.achievements': { de: 'Achievements', en: 'Achievements' },
	'stats.topProviders': { de: 'Meistgenutzte Anbieter', en: 'Most-used providers' },
	'stats.hint': { de: 'Streamzeit wird gemessen, solange ein Anbieter-Fenster offen ist (Aktualisierung alle 15 Sekunden sowie beim Schließen).', en: 'Stream time is measured while a provider window is open (updated every 15 seconds and on close).' },

	// --- Gemerkt / Watchlist ---
	'wl.title': { de: 'Gemerkt', en: 'Saved' },
	'wl.countSub': { de: '{n} Titel auf deiner Liste', en: '{n} titles on your list' },
	'wl.export': { de: 'Export', en: 'Export' },
	'wl.exportTitle': { de: 'Als Datei speichern', en: 'Save as file' },
	'wl.import': { de: 'Import', en: 'Import' },
	'wl.importTitle': { de: 'Aus Datei laden', en: 'Load from file' },
	'wl.bannerSuffix': { de: 'Titel deiner Watchlist erscheinen heute!', en: 'titles from your watchlist release today!' },
	'wl.emptyTitle': { de: 'Noch nichts gemerkt.', en: 'Nothing saved yet.' },
	'wl.emptyHint': { de: 'Suche oben auf der Übersicht nach einem Titel, öffne das Info-Fenster und klicke „＋ Merken". Oder importiere eine Watchlist-Datei.', en: 'Search for a title on the overview, open the info window and click “＋ Save”. Or import a watchlist file.' },
	'wl.searchPh': { de: 'In Watchlist suchen…', en: 'Search watchlist…' },
	'wl.noMatch': { de: 'Keine Treffer für deine Auswahl.', en: 'No matches for your selection.' },
	'wl.resetFilters': { de: 'Filter zurücksetzen', en: 'Reset filters' },
	'wl.sortAria': { de: 'Sortierung', en: 'Sorting' },
	'wl.infoAria': { de: 'Infos zu {title}', en: 'Info about {title}' },
	'wl.sort.addedDesc': { de: 'Zuletzt hinzugefügt', en: 'Recently added' },
	'wl.sort.addedAsc': { de: 'Zuerst hinzugefügt', en: 'First added' },
	'wl.sort.titleAsc': { de: 'Titel A–Z', en: 'Title A–Z' },
	'wl.sort.titleDesc': { de: 'Titel Z–A', en: 'Title Z–A' },
	'wl.sort.dateDesc': { de: 'Erscheinung: neu → alt', en: 'Release: new → old' },
	'wl.sort.dateAsc': { de: 'Erscheinung: alt → neu', en: 'Release: old → new' },
	'wl.toastNothingTitle': { de: 'Nichts zu exportieren', en: 'Nothing to export' },
	'wl.toastNothingBody': { de: 'Deine Watchlist ist leer.', en: 'Your watchlist is empty.' },
	'wl.toastExportedTitle': { de: 'Watchlist exportiert', en: 'Watchlist exported' },
	'wl.toastExportedBody': { de: '{n} Titel als Datei gespeichert.', en: '{n} titles saved to file.' },
	'wl.toastImportedTitle': { de: 'Watchlist importiert', en: 'Watchlist imported' },
	'wl.toastImportedBody': { de: '{n} neue Titel hinzugefügt.', en: '{n} new titles added.' },
	'wl.toastImportFailTitle': { de: 'Import fehlgeschlagen', en: 'Import failed' },
	'wl.toastImportFailBody': { de: 'Das ist keine gültige OmniHub-Watchlist-Datei.', en: 'That is not a valid OmniHub watchlist file.' },

	// --- CR-Kalender ---
	'cal.title': { de: 'CR Kalender', en: 'CR Calendar' },
	'cal.sub': { de: 'Anime-Ausstrahlung der {range} 7 Tage · Quelle: AniList', en: 'Anime broadcasts for the {range} 7 days · Source: AniList' },
	'cal.rangeNext': { de: 'nächsten', en: 'next' },
	'cal.rangeLast': { de: 'letzten', en: 'last' },
	'cal.next7': { de: 'Nächste 7 Tage', en: 'Next 7 days' },
	'cal.last7': { de: 'Letzte 7 Tage', en: 'Last 7 days' },
	'cal.onlyCR': { de: 'Nur Crunchyroll', en: 'Only Crunchyroll' },
	'cal.onlyCRTitle': { de: 'Nur Crunchyroll-Titel zeigen', en: 'Show only Crunchyroll titles' },
	'cal.loadFail': { de: 'Konnte den Plan nicht laden.', en: "Couldn't load the schedule." },
	'cal.emptyCR': { de: 'Diese Woche keine als Crunchyroll markierten Titel.', en: 'No Crunchyroll-tagged titles this week.' },
	'cal.emptyAll': { de: 'Diese Woche keine anstehenden Anime.', en: 'No upcoming anime this week.' },
	'cal.showAll': { de: 'Alle Anime anzeigen', en: 'Show all anime' },
	'cal.today': { de: 'Heute', en: 'Today' },
	'cal.tomorrow': { de: 'Morgen', en: 'Tomorrow' },
	'cal.yesterday': { de: 'Gestern', en: 'Yesterday' },
	'cal.episode': { de: 'Episode {n}', en: 'Episode {n}' },
	'cal.onCR': { de: '▶ Auf Crunchyroll', en: '▶ On Crunchyroll' },
	'cal.viewInfo': { de: 'Infos ansehen', en: 'View info' },

	// --- MediaBrowser (Neuigkeiten / Upcoming) ---
	'mb.news': { de: 'Neuigkeiten', en: 'News' },
	'mb.upcoming': { de: 'Upcoming', en: 'Upcoming' },
	'mb.trending': { de: 'Trending', en: 'Trending' },
	'mb.new': { de: 'Neu', en: 'New' },
	'mb.hiddenTitles': { de: 'Ausgeblendete Titel', en: 'Hidden titles' },
	'mb.loading': { de: 'Lädt…', en: 'Loading…' },
	'mb.noTitles': { de: 'Keine Titel – alle ausgeblendet? Über das Auge oben rechts wieder einblenden.', en: 'No titles – all hidden? Use the eye at the top right to show them again.' },
	'mb.errorNoData': { de: 'Keine Daten von TMDB. Ist der API-Key in src-tauri/src/tmdb.rs eingetragen und besteht eine Internetverbindung?', en: 'No data from TMDB. Is the API key set in src-tauri/src/tmdb.rs and is there an internet connection?' },
	'mb.watchAt': { de: 'Ansehen bei', en: 'Watch on' },
	'mb.details': { de: 'Details ansehen', en: 'View details' },
	'mb.saved': { de: '✓ Gemerkt', en: '✓ Saved' },
	'mb.save': { de: '+ Merken', en: '+ Save' },
	'mb.hide': { de: 'Ausblenden', en: 'Hide' },
	'mb.hideTitle': { de: 'Titel ausblenden', en: 'Hide title' }
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
