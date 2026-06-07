<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Titlebar from '$lib/components/Titlebar.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import ShortcutsModal from '$lib/components/ShortcutsModal.svelte';
	import OnboardingModal from '$lib/components/OnboardingModal.svelte';
	import CardEditorModal from '$lib/components/CardEditorModal.svelte';
	import SleepTimer from '$lib/components/SleepTimer.svelte';
	import MiniPlayer from '$lib/components/MiniPlayer.svelte';
	import DiscordPresence from '$lib/components/DiscordPresence.svelte';
	import TitleInfoModal from '$lib/components/TitleInfoModal.svelte';
	import HiddenTitlesModal from '$lib/components/HiddenTitlesModal.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import Particles from '$lib/components/Particles.svelte';
	import UpdateBanner from '$lib/components/UpdateBanner.svelte';
	import NotificationCenter from '$lib/components/NotificationCenter.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import YearReviewBanner from '$lib/components/YearReviewBanner.svelte';
	import WrappedModal from '$lib/components/WrappedModal.svelte';
	import { checkForUpdate } from '$lib/stores/updater';
	import { hideEmbedded, unhideEmbedded, immersive, openProvider, streamMode, backgroundStreams } from '$lib/embedded';
	import { settings, hydrateSettings, applySettings, onboardingOpen } from '$lib/stores/settings';
	import { browser } from '$app/environment';
	import { applyCloseToTray, isAutostartEnabled } from '$lib/native';
	import { hydrateCatalog, favoriteProviders, visibleProviders } from '$lib/stores/providers';
	import { hydrateProfiles, loadProfileData, activeProfileId, profiles } from '$lib/stores/profiles';
	import { achievements, maybeNotify } from '$lib/stores/achievements';
	import { watchlist, maybeNotifyReleases, maybeNotifyEpisodes } from '$lib/stores/watchlist';
	import { get } from 'svelte/store';

	let { children } = $props();

	let showSettings = $state(false);
	let settingsTab = $state('appearance');
	let showShortcuts = $state(false);
	let showPalette = $state(false);
	let showWrapped = $state(false);
	let updateTimer: ReturnType<typeof setInterval>;

	// Hell/Dunkel umschalten (von Strg+D und der Befehlspalette genutzt).
	function toggleTheme() {
		settings.update(($s) => ({
			...$s,
			appearance: {
				...$s.appearance,
				theme: $s.appearance.theme === 'dark' ? 'light' : 'dark',
				themePreset: 'default'
			}
		}));
	}

	// Akzentfarbe: aktives Profil überschreibt die globale Farbe (ohne sie zu ändern).
	// Setzt --accent, --accent-text und das abgeleitete --accent-soft.
	$effect(() => {
		const prof = $profiles.find((p) => p.id === $activeProfileId);
		const color = prof?.accent || $settings.appearance.accentColor;
		const text = $settings.appearance.accentText;
		const root = document.documentElement;
		root.style.setProperty('--accent', color);
		root.style.setProperty('--accent-text', text);
		root.style.setProperty('--accent-soft', `color-mix(in srgb, ${color} 16%, transparent)`);
	});

	function openSettings(tab = 'appearance') {
		settingsTab = tab;
		showSettings = true;
		// Eingebetteter Stream liegt als natives Webview über dem HTML – fürs
		// Einstellungsfenster kurz ausblenden, danach wieder einblenden.
		void hideEmbedded();
	}
	function closeSettings() {
		showSettings = false;
		void unhideEmbedded();
	}

	// Befehlspalette: beim Öffnen den eingebetteten Stream ausblenden (liegt sonst darüber),
	// beim Schließen wieder einblenden.
	function openPalette() {
		showPalette = true;
		void hideEmbedded();
	}
	function closePalette() {
		showPalette = false;
		void unhideEmbedded();
	}

	onMount(async () => {
		// Settings, Profile und Katalog sind voneinander unabhängig und werden parallel
		// geladen (schnellerer Start). applySettings läuft direkt nach den Settings.
		// Erst danach die profilbezogenen Daten (brauchen das aktive Profil).
		await Promise.all([
			hydrateSettings().then(() => applySettings(get(settings))).catch((e) => console.error('[init] settings', e)),
			hydrateProfiles().catch((e) => console.error('[init] profiles', e)),
			hydrateCatalog().catch((e) => console.error('[init] catalog', e))
		]);
		// Update-Prüfung zügig nach dem Laden der Einstellungen anstoßen – läuft parallel
		// zu den Profildaten und blockiert das Rendern nicht; danach einmal pro Stunde.
		setTimeout(() => { void checkForUpdate(false); }, 800);
		updateTimer = setInterval(() => { void checkForUpdate(false); }, 60 * 60 * 1000);

		try {
			const pid = get(activeProfileId);
			if (pid) await loadProfileData(pid);
		} catch (e) { console.error('[init] profileData', e); }

		// Serien-Tracker: einmal pro Sitzung prüfen, ob heute neue Folgen erschienen sind.
		void maybeNotifyEpisodes(get(watchlist), get(settings).notifications.episodeReminder);

		if (!get(settings).onboardingDone) onboardingOpen.set(true);
		window.addEventListener('keydown', onKey);

		// Native: Tray-Schließverhalten an Rust melden; Autostart-Status mit dem System abgleichen.
		void applyCloseToTray(get(settings).plugins.closeToTray);
		void isAutostartEnabled().then((on) => {
			if (on !== null && on !== get(settings).plugins.autostart) {
				settings.update((s) => ({ ...s, plugins: { ...s.plugins, autostart: on } }));
			}
		});
	});

	// Neu freigeschaltete Achievements melden (nur einmal je Achievement).
	$effect(() => {
		const list = $achievements;
		void maybeNotify(list, $settings.notifications.achievementUnlocked);
	});

	// Watchlist-Hinweise: meldet Titel, die heute erscheinen (einmal je Titel, je nach Einstellung).
	$effect(() => {
		maybeNotifyReleases($watchlist, $settings.notifications.watchlistReminder);
	});

	// Onboarding immer ganz im Vordergrund: eingebetteten Stream ausblenden, solange es offen ist.
	$effect(() => {
		void ($onboardingOpen ? hideEmbedded() : unhideEmbedded());
	});

	function onKey(e: KeyboardEvent) {
		const inField = (e.target as HTMLElement)?.matches?.('input,textarea,select');
		if (e.key === 'Escape') { if (showPalette) closePalette(); if (showSettings) closeSettings(); showShortcuts = false; return; }
		if (inField) return;
		if (e.key === 'F1' || e.key === '?') { e.preventDefault(); showShortcuts = true; }
		else if (e.key === ',' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openSettings(); }
		else if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			openPalette();
		} else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			toggleTheme();
		} else if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			// Zifferntasten: Favorit (sonst sichtbaren Anbieter) Nr. n direkt starten.
			if (showSettings || showShortcuts || get(onboardingOpen)) return;
			const list = get(favoriteProviders).length ? get(favoriteProviders) : get(visibleProviders);
			const p = list[Number(e.key) - 1];
			if (p) { e.preventDefault(); openProvider(p); }
		}
	}

	// Performance-Modus: Effekte aus, solange ein Stream läuft (Vordergrund oder Hintergrund).
	const perfActive = $derived(
		$settings.appearance.performanceMode && ($streamMode !== null || $backgroundStreams.length > 0)
	);
	$effect(() => {
		if (browser) document.documentElement.setAttribute('data-perf', perfActive ? 'true' : 'false');
	});
</script>

<div class="root">
	{#if !perfActive}<Particles />{/if}
	{#if !$immersive}
		<Titlebar onHelp={() => (showShortcuts = true)} />
		<UpdateBanner />
		<YearReviewBanner onOpenReview={() => (showWrapped = true)} />
	{/if}
	<div class="below">
		{#if !$immersive}
			<Sidebar openSettings={() => openSettings()} openProfiles={() => openSettings('account')} />
		{/if}
		<main>{@render children()}</main>
	</div>
</div>

<Clock />
<Toasts />
<NotificationCenter />

<SettingsModal open={showSettings} initialTab={settingsTab} close={closeSettings} onOpenReview={() => { closeSettings(); showWrapped = true; }} />
<ShortcutsModal open={showShortcuts} close={() => (showShortcuts = false)} />
{#if showWrapped}
	<WrappedModal onClose={() => (showWrapped = false)} />
{/if}
<CommandPalette
	open={showPalette}
	onClose={closePalette}
	onOpenSettings={() => openSettings()}
	onToggleTheme={toggleTheme}
	onShowShortcuts={() => (showShortcuts = true)}
/>
<OnboardingModal open={$onboardingOpen} close={() => onboardingOpen.set(false)} />
<CardEditorModal />
<SleepTimer />
<MiniPlayer />
<DiscordPresence />
<TitleInfoModal />
<HiddenTitlesModal />

<style>
	.root { display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; position: relative; }
	.below { display: flex; flex: 1; min-height: 0; position: relative; z-index: 1; }
	main { flex: 1; overflow-y: auto; background: transparent; height: 100%; }
</style>
