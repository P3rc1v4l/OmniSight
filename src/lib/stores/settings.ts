import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Settings } from '$lib/types';

export const DEFAULT_SETTINGS: Settings = {
	appearance: {
		backgroundImage: null,
		accentColor: '#ff5d3b',
		accentText: '#ffffff',
		theme: 'dark',
		fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif",
		fontSize: 15,
		radius: 15,
		sidebarWidth: 200,
		glassmorphism: false,
		particles: false,
		cardShadow: true,
		cardHoverZoom: true,
		animations: true,
		language: 'de'
	},
	clock: {
		enabled: false,
		type: 'digital',
		showSeconds: true,
		color: '#ffffff',
		transparency: 50,
		size: 36
	},
	notifications: {
		pauseReminder: true,
		sound: true,
		updateHint: true,
		achievementUnlocked: true,
		watchlistReminder: true
	}
};

export const settings = writable<Settings>(structuredClone(DEFAULT_SETTINGS));

/**
 * Schreibt die relevanten Einstellungen in CSS-Variablen + data-theme.
 * Wird bei jeder Änderung der Einstellungen aufgerufen -> Live-Vorschau.
 */
export function applySettings(s: Settings): void {
	if (!browser) return;
	const root = document.documentElement;
	const a = s.appearance;

	root.style.setProperty('--accent', a.accentColor);
	root.style.setProperty('--accent-text', a.accentText);
	root.style.setProperty('--radius', `${a.radius}px`);
	root.style.setProperty('--font-size', `${a.fontSize}px`);
	root.style.setProperty('--sidebar-width', `${a.sidebarWidth}px`);
	root.style.setProperty('--font-family', a.fontFamily);

	let theme = a.theme;
	if (theme === 'system') {
		theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
	root.setAttribute('data-theme', theme);
}

// Bei jeder Store-Änderung sofort anwenden.
if (browser) {
	settings.subscribe((s) => applySettings(s));
}
