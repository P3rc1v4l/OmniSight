// Zentrale Typdefinitionen für OmniHub.

export interface Provider {
	/** Eindeutige, stabile ID (Kebab-Case). */
	id: string;
	/** Anzeigename auf der Karte. */
	name: string;
	/** Start-URL, die im WebView geöffnet wird. */
	url: string;
	/** Kategorie für Gruppierung/Filter. */
	category: 'film-serien' | 'anime' | 'live-tv' | 'mediathek' | 'sport' | 'musik' | 'video' | 'eigene';
	/** Markenfarbe (für Karten-Akzent/Fallback-Icon). */
	color: string;
	/** Optionales Icon (Pfad in /static/icons oder Daten-URL bei eigenen Anbietern). */
	icon?: string;
	/** Vom Nutzer selbst angelegt? */
	custom?: boolean;
	/** In der Übersicht ausgeblendet? (Karteneditor: "aus Übersicht löschen") */
	hidden?: boolean;
}

export interface Profile {
	id: string;
	name: string;
	/** Profilbild als Daten-URL oder Pfad. */
	avatar?: string;
	/** 4-stellige PIN (gehasht abgelegt, niemals im Klartext). null = keine PIN. */
	pinHash: string | null;
}

export interface ClockSettings {
	enabled: boolean;
	type: 'digital' | 'analog';
	showSeconds: boolean;
	color: string;
	/** Transparenz in % (0 = sichtbar, 100 = aus). */
	transparency: number;
	size: number;
}

export interface NotificationSettings {
	pauseReminder: boolean;
	sound: boolean;
	updateHint: boolean;
	achievementUnlocked: boolean;
	watchlistReminder: boolean;
}

export interface AppearanceSettings {
	backgroundImage: string | null;
	accentColor: string;
	accentText: string;
	theme: 'dark' | 'light' | 'system';
	fontFamily: string;
	fontSize: number;
	radius: number;
	sidebarWidth: number;
	glassmorphism: boolean;
	particles: boolean;
	cardShadow: boolean;
	cardHoverZoom: boolean;
	animations: boolean;
	language: 'de' | 'en';
}

export interface Settings {
	appearance: AppearanceSettings;
	clock: ClockSettings;
	notifications: NotificationSettings;
}

export interface WatchlistItem {
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	poster: string | null;
	overview: string;
	releaseDate: string | null;
	addedAt: number;
}
