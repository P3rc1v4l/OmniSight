// Zentrale Typdefinitionen für OmniSight.

export type Quality = '4K' | '1080p' | 'HD' | 'SD';

export interface Provider {
	id: string;
	name: string;
	subtitle: string;       // z.B. "Anime & Manga", "Live-TV & Mediatheken"
	url: string;
	category: 'film-serien' | 'anime' | 'live-tv' | 'mediathek' | 'sport' | 'musik' | 'video' | 'eigene';
	color: string;          // Markenfarbe, Basis der Karte
	color2?: string;        // optionale 2. Farbe für Verlauf
	colorManual?: boolean;  // true = Farbe vom Nutzer gewählt (nicht aus Logo ableiten)
	quality: Quality;
	icon?: string;          // ID aus icons.ts oder Daten-URL bei eigenen Anbietern
	custom?: boolean;
	hidden?: boolean;
	favorite?: boolean;
}

export interface Profile {
	id: string;
	name: string;
	avatar?: string;
	accent?: string;
	pinHash: string | null;
}

export interface ClockSettings {
	enabled: boolean;
	type: 'digital' | 'analog';
	hour12?: boolean;
	showSeconds: boolean;
	color: string;
	transparency: number;
	size: number;
	x: number | null;
	y: number | null;
}

export interface NotificationSettings {
	pauseReminder: boolean;
	sound: boolean;
	updateHint: boolean;
	achievementUnlocked: boolean;
	watchlistReminder: boolean;
}

export interface ProviderCollection {
	id: string;
	name: string;
	providerIds: string[];
	collapsed?: boolean;
}

export interface AppearanceSettings {
	backgroundImage: string | null;
	accentColor: string;
	accentText: string;
	theme: 'dark' | 'light' | 'system';
	themePreset: string;
	fontFamily: string;
	fontSize: number;
	radius: number;
	sidebarWidth: number;
	glassmorphism: boolean;
	particles: boolean;
	particleCount: number;
	particleSpeed: number;
	particleColor: string;
	particleShapes: string[];
	particleSize: number;
	streamMode: 'embedded' | 'window';
	cardShadow: boolean;
	cardHoverZoom: boolean;
	animations: boolean;
	language: 'de' | 'en';
	backgroundOpacity: number;
	showReachability: boolean;
	performanceMode: boolean;
}

export interface PluginSettings {
	sleepTimerEnabled: boolean;
	sleepTimerMinutes: number;
	sleepTimerCloseStream: boolean;
	continueWatching: boolean;
	discordEnabled: boolean;
	discordClientId: string;
	hardwareAcceleration: boolean;
	miniPlayerEnabled: boolean;
	autostart: boolean;
	startMinimized: boolean;
	closeToTray: boolean;
}

export interface Settings {
	appearance: AppearanceSettings;
	clock: ClockSettings;
	notifications: NotificationSettings;
	plugins: PluginSettings;
	updateChannel: 'stable' | 'beta';
	onboardingDone: boolean;
}

export interface WatchlistItem {
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	poster: string | null;
	overview: string;
	releaseDate: string | null;
	addedAt: number;
	rating?: number; // eigene Bewertung 1–5 (0/undefiniert = keine)
	seen?: boolean; // als gesehen markiert
}

export interface TmdbItem {
	id: number;
	media_type: string;
	title: string;
	overview: string;
	poster: string | null;
	backdrop: string | null;
	release_date: string | null;
	vote_average: number | null;
}
