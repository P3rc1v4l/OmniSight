<script lang="ts">
	import { settings, clockEditing, DEFAULT_SETTINGS, onboardingOpen } from '$lib/stores/settings';
	import { resetProviders } from '$lib/stores/providers';
	import {
		profiles, activeProfileId, addProfile, renameProfile, setProfileAvatar, setProfileAccent, deleteProfile,
		setPin, clearPin, verifyPin, MAX_PROFILES, MIN_PROFILES,
		mainProfileId, setMainProfile, adminCodeHash, setAdminCode, verifyAdminCode, clearAdminCode, resetPinWithAdmin
	} from '$lib/stores/profiles';
	import { APP_VERSION, APP_NAME, LINKS, DEFAULT_DISCORD_CLIENT_ID } from '$lib/version';
	import { updateState, checkForUpdate } from '$lib/stores/updater';
	import { downloadBackup, parseBackup, applyBackup, type BackupFile } from '$lib/backup';
	import { pushToast } from '$lib/stores/toasts';
	import { t } from '$lib/i18n';
	import { THEME_PRESETS } from '$lib/themes';
	import { get } from 'svelte/store';

	let { open = false, initialTab = 'appearance', close }: { open?: boolean; initialTab?: string; close: () => void } = $props();

	// Backup/Restore
	let backupFileInput = $state<HTMLInputElement | null>(null);
	let pendingBackup = $state<BackupFile | null>(null);
	let backupErr = $state('');
	async function onBackupExport() {
		try { await downloadBackup(); pushToast($t('set.adv.backupDone'), $t('set.adv.backupDoneDesc'), '💾'); }
		catch (e) { pushToast('Fehler', String(e), '⚠️'); }
	}
	async function onBackupFile(e: Event) {
		backupErr = '';
		pendingBackup = null;
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		try {
			pendingBackup = parseBackup(await f.text());
		} catch (err) {
			backupErr = err instanceof Error ? err.message : String(err);
		}
		(e.currentTarget as HTMLInputElement).value = '';
	}
	async function confirmRestore() {
		if (!pendingBackup) return;
		try {
			await applyBackup(pendingBackup);
			pushToast($t('set.adv.restoreDone'), $t('set.adv.restoreDoneDesc'), '✅');
			setTimeout(() => location.reload(), 600);
		} catch (e) {
			backupErr = String(e);
		}
	}

	// WebView2-Diagnose: Version einmalig holen, sobald die Einstellungen offen sind.
	let wv2Ver = $state<string | null>(null);
	let wv2Failed = $state(false);
	$effect(() => {
		if (open && wv2Ver === null && !wv2Failed) {
			void (async () => {
				try {
					const { invoke } = await import('@tauri-apps/api/core');
					wv2Ver = await invoke<string>('webview2_version');
				} catch {
					wv2Failed = true;
				}
			})();
		}
	});

	async function restartApp() {
		try {
			const { relaunch } = await import('@tauri-apps/plugin-process');
			await relaunch();
		} catch (e) {
			console.error('[restart]', e);
			pushToast(get(t)('set.toast.restartFailTitle'), get(t)('set.toast.restartFailBody'), '⚠️', 6000);
		}
	}

	const tabs = [
		{ id: 'appearance', key: 'set.tab.appearance', icon: '🎨' },
		{ id: 'account', key: 'set.tab.account', icon: '🔑' },
		{ id: 'clock', key: 'set.tab.clock', icon: '🕐' },
		{ id: 'notifications', key: 'set.tab.notifications', icon: '🔔' },
		{ id: 'plugins', key: 'set.tab.plugins', icon: '🧩' },
		{ id: 'advanced', key: 'set.tab.advanced', icon: '⚙️' }
	];
	let active = $state('appearance');
	let tabSearch = $state('');

	const PARTICLE_SHAPES = [
		{ id: 'circle', key: 'set.shape.circle' },
		{ id: 'square', key: 'set.shape.square' },
		{ id: 'triangle', key: 'set.shape.triangle' },
		{ id: 'star', key: 'set.shape.star' }
	];

	// Theme-Vorlagen (fertige Farbschemata). Sinnvolle Reihenfolge (neutral -> farbig),
	// gruppiert nach Dunkel/Hell für die Anzeige.
	const PRESET_ORDER = ['default', 'midnight', 'graphite', 'nord', 'amethyst', 'forest', 'sunset', 'paper', 'contrast'];
	const sortedPresets = [...THEME_PRESETS].sort((a, b) => PRESET_ORDER.indexOf(a.id) - PRESET_ORDER.indexOf(b.id));
	const darkPresets = sortedPresets.filter((p) => p.mode === 'dark');
	const lightPresets = sortedPresets.filter((p) => p.mode === 'light');

	function pickPreset(p: (typeof THEME_PRESETS)[number]) {
		settings.update((s) => {
			const ap = { ...s.appearance, themePreset: p.id };
			if (p.id !== 'default') {
				ap.theme = p.mode;
				if (p.accent) {
					ap.accentColor = p.accent;
					ap.accentText = p.accentText ?? ap.accentText;
				}
			}
			return { ...s, appearance: ap };
		});
	}
	function pickMode(m: 'light' | 'dark') {
		settings.update((s) => ({ ...s, appearance: { ...s.appearance, theme: m, themePreset: 'default' } }));
	}

	// Schnellauswahl-Akzentfarben.
	const ACCENT_PRESETS = ['#30c5bb', '#6c8cff', '#f0a020', '#e0556b', '#9b6cff', '#28c76f', '#ff7a45', '#22d3ee'];
	// Avatar-Auswahl je Profil.
	const PROFILE_AVATARS = ['👤', '🦊', '🐼', '🐱', '🐯', '🐸', '🦉', '🦁', '🐲', '👾', '🤖', '🎮', '🍿', '⭐', '🔥', '🌙'];
	function toggleShape(id: string) {
		settings.update((s) => {
			const cur = s.appearance.particleShapes ?? ['circle'];
			let next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
			if (next.length === 0) next = ['circle']; // mind. eine Form
			return { ...s, appearance: { ...s.appearance, particleShapes: next } };
		});
	}

	function onBgFile(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (!f) return;
		const reader = new FileReader();
		reader.onload = () =>
			settings.update((s) => ({ ...s, appearance: { ...s.appearance, backgroundImage: reader.result as string } }));
		reader.readAsDataURL(f);
	}
	function clearBg() {
		settings.update((s) => ({ ...s, appearance: { ...s.appearance, backgroundImage: null } }));
	}

	function resetAppearance() {
		if (!confirm('Alle Design-Einstellungen auf Standard zurücksetzen?')) return;
		settings.update((s) => ({ ...s, appearance: structuredClone(DEFAULT_SETTINGS.appearance) }));
		pushToast(get(t)('set.toast.designResetTitle'), get(t)('set.toast.designResetBody'), '↩️', 2500);
	}

	// Profilverwaltung – PIN-Bearbeitung mit Abfrage des alten PINs
	let pinEditFor = $state<string | null>(null);
	let avatarPickFor = $state<string | null>(null);
	let accentPickFor = $state<string | null>(null);
	let oldPinInput = $state('');
	let newPinInput = $state('');
	let pinError = $state('');

	function openPinPanel(id: string) {
		pinEditFor = id; oldPinInput = ''; newPinInput = ''; pinError = '';
	}
	function closePinPanel() {
		pinEditFor = null; oldPinInput = ''; newPinInput = ''; pinError = '';
	}

	// Beim Öffnen den gewünschten Tab aktivieren.
	$effect(() => { if (open) active = initialTab; });
	// Uhr verschiebbar machen, solange der Uhr-Tab offen ist.
	$effect(() => { clockEditing.set(open && active === 'clock'); });

	const filteredTabs = $derived(
		tabs.filter((tab) => $t(tab.key).toLowerCase().includes(tabSearch.toLowerCase()))
	);

	async function savePin(p: { id: string; pinHash: string | null }) {
		if (p.pinHash && !(await verifyPin(oldPinInput, p.pinHash))) { pinError = 'Alter PIN ist falsch.'; return; }
		if (newPinInput.trim().length < 4) { pinError = 'Neuer PIN braucht mindestens 4 Zeichen.'; return; }
		await setPin(p.id, newPinInput.trim());
		closePinPanel();
	}
	async function removePin(p: { id: string; pinHash: string | null }) {
		if (p.pinHash && !(await verifyPin(oldPinInput, p.pinHash))) { pinError = 'Alter PIN ist falsch.'; return; }
		clearPin(p.id);
		closePinPanel();
	}

	// --- Admin-Code (für PIN-Zurücksetzen) ---
	let adminInput = $state('');
	let oldAdminInput = $state('');
	let adminMsg = $state('');
	async function saveAdminCode() {
		// Bestehenden Code nur mit Kenntnis des alten ändern.
		if ($adminCodeHash && !(await verifyAdminCode(oldAdminInput.trim()))) { adminMsg = 'Alter Admin-Code ist falsch.'; return; }
		if (adminInput.trim().length < 4) { adminMsg = 'Admin-Code braucht mindestens 4 Zeichen.'; return; }
		await setAdminCode(adminInput.trim());
		adminInput = ''; oldAdminInput = '';
		adminMsg = 'Admin-Code gespeichert.';
		pushToast(get(t)('set.toast.adminSaved'), undefined, '🛡️', 2200);
	}
	async function removeAdminCode() {
		if ($adminCodeHash && !(await verifyAdminCode(oldAdminInput.trim()))) { adminMsg = 'Alter Admin-Code ist falsch.'; return; }
		clearAdminCode();
		oldAdminInput = '';
		adminMsg = 'Admin-Code entfernt.';
	}

	// --- Haupt-Profil ändern (nur mit Admin-Code, sofern gesetzt) ---
	let mainChangeFor = $state<string | null>(null);
	let mainAdminInput = $state('');
	let mainMsg = $state('');
	function requestSetMain(id: string) {
		if (!$adminCodeHash) { setMainProfile(id); pushToast(get(t)('set.toast.mainChanged'), undefined, '★', 2000); return; }
		mainChangeFor = id; mainAdminInput = ''; mainMsg = '';
	}
	async function confirmSetMain(id: string) {
		if (!(await verifyAdminCode(mainAdminInput.trim()))) { mainMsg = 'Admin-Code ist falsch.'; return; }
		setMainProfile(id);
		pushToast(get(t)('set.toast.mainChanged'), undefined, '★', 2000);
		mainChangeFor = null; mainAdminInput = '';
	}
	function cancelSetMain() { mainChangeFor = null; mainAdminInput = ''; mainMsg = ''; }

	// --- PIN per Admin-Code zurücksetzen ---
	let resetPinFor = $state<string | null>(null);
	let resetAdminInput = $state('');
	let resetMsg = $state('');
	function openResetPanel(id: string) { resetPinFor = id; resetAdminInput = ''; resetMsg = ''; }
	function closeResetPanel() { resetPinFor = null; resetAdminInput = ''; resetMsg = ''; }
	async function doResetPin(id: string) {
		const ok = await resetPinWithAdmin(id, resetAdminInput.trim());
		if (ok) { pushToast(get(t)('set.toast.pinResetTitle'), get(t)('set.toast.pinResetBody'), '🔓', 2600); closeResetPanel(); }
		else resetMsg = 'Admin-Code ist falsch.';
	}

	// Versteckte Wiederherstellungs-Kombination: Tippt man im Profile-Tab exakt diese
	// Zeichenfolge, wird der Admin-Code sofort zurückgesetzt (für den Fall, dass er
	// vergessen wurde). Während des Tippens ist nichts sichtbar.
	const SECRET_RESET = 'p34o%+wn9/';
	let secretBuf = '';
	async function onSecretKey(e: KeyboardEvent) {
		if (!open || active !== 'account') { secretBuf = ''; return; }
		if (e.key.length !== 1) return; // nur druckbare Einzelzeichen sammeln
		secretBuf = (secretBuf + e.key).slice(-SECRET_RESET.length);
		if (secretBuf === SECRET_RESET) {
			secretBuf = '';
			await clearAdminCode();
			adminMsg = 'Admin-Code wurde zurückgesetzt.';
			pushToast(get(t)('set.toast.adminPinResetTitle'), get(t)('set.toast.adminPinResetBody'), '🔑', 4000);
		}
	}
	$effect(() => {
		if (!open) { secretBuf = ''; return; }
		window.addEventListener('keydown', onSecretKey);
		return () => window.removeEventListener('keydown', onSecretKey);
	});

	// Beim Schließen Hinweis zeigen (Einstellungen werden automatisch gespeichert).
	function doClose() {
		pushToast(get(t)('set.toast.settingsSaved'), undefined, '✅', 2200);
		close();
	}

	function onBackdrop(e: MouseEvent) { if (e.target === e.currentTarget) doClose(); }
</script>

{#if open}
	<div class="backdrop" onclick={onBackdrop} role="presentation">
		<div class="dialog" role="dialog" aria-modal="true" aria-label="Einstellungen">
			<aside class="side">
				<div class="head">
					<span class="emoji">⚙️</span><h2>Einstellungen</h2>
				</div>
				<div class="search">
					<input type="text" placeholder={$t('set.searchPh')} bind:value={tabSearch} />
				</div>
				<nav>
					{#each filteredTabs as tab}
						<button class:active={active === tab.id} onclick={() => (active = tab.id)}>
							<span class="i">{tab.icon}</span><span>{$t(tab.key)}</span>
						</button>
					{/each}
				</nav>
				<div class="version">v{APP_VERSION}</div>
			</aside>

			<section class="main">
				<div class="main-head">
					<h3>{tabs.find((tab) => tab.id === active)?.icon} {$t(tabs.find((tab) => tab.id === active)?.key ?? '')}</h3>
					<button class="x" onclick={doClose} aria-label={$t('common.close')}>×</button>
				</div>

				<div class="content">
					{#if active === 'appearance'}
						<div class="look-head">
							<div class="look-card">
								<div class="look-label">{$t('set.mode')}</div>
								<div class="seg2">
									<button class:on={$settings.appearance.theme === 'light' && $settings.appearance.themePreset === 'default'} onclick={() => pickMode('light')}>{$t('set.light')}</button>
									<button class:on={$settings.appearance.theme === 'dark' && $settings.appearance.themePreset === 'default'} onclick={() => pickMode('dark')}>{$t('set.dark')}</button>
								</div>
							</div>
							<div class="look-card">
								<div class="look-label">{$t('set.accent')}</div>
								<div class="swatches">
									{#each ACCENT_PRESETS as c (c)}
										<button
											class="swatch"
											class:on={$settings.appearance.accentColor?.toLowerCase() === c}
											style="--sw: {c}"
											onclick={() => ($settings.appearance.accentColor = c)}
											title={c}
											aria-label={`Akzentfarbe ${c}`}
										></button>
									{/each}
									<label class="swatch custom" title={$t('set.customColor')}>
										<input type="color" bind:value={$settings.appearance.accentColor} />
										<span>+</span>
									</label>
								</div>
							</div>
						</div>

						<div class="block">
							<div class="block-label">{$t('set.themePreset')}</div>
							<div class="tp-group-label">{$t('set.dark')}</div>
							<div class="theme-presets">
								{#each darkPresets as p (p.id)}
									<button
										class="tp"
										class:on={$settings.appearance.themePreset === p.id}
										onclick={() => pickPreset(p)}
										style="--c1: {p.vars ? p.vars.bg : '#0b0c10'}; --c2: {p.vars ? p.vars.bgCard2 : '#1a1d26'}; --ca: {p.accent ?? $settings.appearance.accentColor}; --cb: {p.vars ? p.vars.border : '#1f222b'}"
										title={$settings.appearance.language === 'en' ? p.name.en : p.name.de}
									>
										<span class="tp-prev"><span class="tp-dot"></span></span>
										<span class="tp-name">{$settings.appearance.language === 'en' ? p.name.en : p.name.de}</span>
									</button>
								{/each}
							</div>
							<div class="tp-group-label">{$t('set.light')}</div>
							<div class="theme-presets">
								{#each lightPresets as p (p.id)}
									<button
										class="tp"
										class:on={$settings.appearance.themePreset === p.id}
										onclick={() => pickPreset(p)}
										style="--c1: {p.vars ? p.vars.bg : '#0b0c10'}; --c2: {p.vars ? p.vars.bgCard2 : '#1a1d26'}; --ca: {p.accent ?? $settings.appearance.accentColor}; --cb: {p.vars ? p.vars.border : '#1f222b'}"
										title={$settings.appearance.language === 'en' ? p.name.en : p.name.de}
									>
										<span class="tp-prev"><span class="tp-dot"></span></span>
										<span class="tp-name">{$settings.appearance.language === 'en' ? p.name.en : p.name.de}</span>
									</button>
								{/each}
							</div>
							<p class="hint">{$t('set.themePresetHint')}</p>
						</div>

						<div class="grid">
							<div class="field">
								<label>{$t('set.bgImage')}</label>
								<div class="row">
									<label class="filebtn">
										Bild wählen
										<input type="file" accept="image/*" onchange={onBgFile} hidden />
									</label>
									{#if $settings.appearance.backgroundImage}
										<button class="ghost" onclick={clearBg}>{$t('common.remove')}</button>
									{/if}
								</div>
								{#if $settings.appearance.backgroundImage}
									<label style="margin-top:8px">{$t('set.bgOpacity')}: {$settings.appearance.backgroundOpacity}%</label>
									<input type="range" min="10" max="100" bind:value={$settings.appearance.backgroundOpacity} />
								{/if}
							</div>
							<div class="field">
								<label>{$t('set.font')}</label>
								<select bind:value={$settings.appearance.fontFamily}>
									<option value="'DM Sans', ui-sans-serif, system-ui, sans-serif">DM Sans</option>
									<option value="ui-sans-serif, system-ui, sans-serif">System</option>
									<option value="'Segoe UI', sans-serif">Segoe UI</option>
									<option value="Verdana, sans-serif">Verdana</option>
									<option value="Tahoma, sans-serif">Tahoma</option>
									<option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
									<option value="Georgia, serif">Georgia (Serif)</option>
									<option value="'Times New Roman', serif">Times New Roman</option>
									<option value="'Courier New', ui-monospace, monospace">Courier (Mono)</option>
									<option value="'Comic Sans MS', cursive">Comic Sans</option>
								</select>
							</div>

							<div class="field">
								<label>{$t('set.fontSize')}: {$settings.appearance.fontSize}px</label>
								<input type="range" min="12" max="22" bind:value={$settings.appearance.fontSize} />
							</div>
							<div class="field">
								<label>{$t('set.radius')}: {$settings.appearance.radius}px</label>
								<input type="range" min="0" max="28" bind:value={$settings.appearance.radius} />
							</div>
							<div class="field">
								<label>{$t('set.sidebarWidth')}: {$settings.appearance.sidebarWidth}px</label>
								<input type="range" min="180" max="320" bind:value={$settings.appearance.sidebarWidth} />
							</div>

							<div class="field">
								<label>{$t('set.glass')}</label>
								<input type="checkbox" bind:checked={$settings.appearance.glassmorphism} />
							</div>
							<div class="field">
								<label>{$t('set.particles')}</label>
								<input type="checkbox" bind:checked={$settings.appearance.particles} />
							</div>
							<div class="field">
								<label>{$t('set.language')}</label>
								<div class="row">
									<button class:active={$settings.appearance.language === 'de'} onclick={() => ($settings.appearance.language = 'de')}>DE</button>
									<button class:active={$settings.appearance.language === 'en'} onclick={() => ($settings.appearance.language = 'en')}>EN</button>
								</div>
							</div>
						</div>

						<div class="block">
							<div class="block-label">{$t('set.moreVisual')}</div>
							<div class="row3">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.appearance.cardShadow}/> Karten-Schatten</label>
								<label class="toggle"><input type="checkbox" bind:checked={$settings.appearance.cardHoverZoom}/> Karten-Hover-Zoom</label>
								<label class="toggle"><input type="checkbox" bind:checked={$settings.appearance.animations}/> Animationen</label>
								<label class="toggle"><input type="checkbox" bind:checked={$settings.appearance.showReachability}/> {$t('set.app.reachability')}</label>
								<label class="toggle"><input type="checkbox" bind:checked={$settings.appearance.performanceMode}/> {$t('set.app.perfMode')}</label>
							</div>
							<p class="hint">
								<b>{$t('set.shadowLabel')}</b> {$t('set.shadowDesc')}
								<b>{$t('set.zoomLabel')}</b> {$t('set.zoomDesc')}
								<b>{$t('set.animLabel')}</b> {$t('set.animDesc')}
							</p>
						</div>

						{#if $settings.appearance.particles}
							<div class="block">
								<div class="block-label">{$t('set.particleOpts')}</div>
								<div class="grid">
									<div class="field">
										<label>{$t('set.count')}: {$settings.appearance.particleCount}</label>
										<input type="range" min="10" max="150" bind:value={$settings.appearance.particleCount} />
									</div>
									<div class="field">
										<label>{$t('set.speed')}: {$settings.appearance.particleSpeed.toFixed(1)}</label>
										<input type="range" min="0" max="1" step="0.1" bind:value={$settings.appearance.particleSpeed} />
									</div>
									<div class="field">
										<label>{$t('set.size')}: {$settings.appearance.particleSize}</label>
										<input type="range" min="1" max="8" step="1" bind:value={$settings.appearance.particleSize} />
									</div>
									<div class="field">
										<label>{$t('set.particleColor')}</label>
										<div class="row">
											<input type="color" bind:value={$settings.appearance.particleColor} />
											<input type="text" class="hex" bind:value={$settings.appearance.particleColor} />
										</div>
									</div>
								</div>
								<div class="field" style="margin-top:6px">
									<label>{$t('set.shapes')}</label>
									<div class="row3">
										{#each PARTICLE_SHAPES as sh}
											<label class="toggle">
												<input
													type="checkbox"
													checked={$settings.appearance.particleShapes?.includes(sh.id)}
													onchange={() => toggleShape(sh.id)}
												/> {$t(sh.key)}
											</label>
										{/each}
									</div>
								</div>
							</div>
						{/if}

						<div class="block">
							<div class="block-label">{$t('set.openAs')}</div>
							<div class="row">
								<button class:active={$settings.appearance.streamMode === 'embedded'} onclick={() => ($settings.appearance.streamMode = 'embedded')}>{$t('set.embedded')}</button>
								<button class:active={$settings.appearance.streamMode === 'window'} onclick={() => ($settings.appearance.streamMode = 'window')}>{$t('set.ownWindow')}</button>
							</div>
							<p class="hint">{$t('set.openAsHint')}</p>
						</div>

						<div class="block">
							<button class="ghost danger" onclick={resetAppearance}>{$t('set.resetDesign')}</button>
						</div>
					{:else if active === 'notifications'}
						<div class="grid">
							<label class="toggle"><input type="checkbox" bind:checked={$settings.notifications.pauseReminder}/> {$t('set.notif.pause')}</label>
							<label class="toggle"><input type="checkbox" bind:checked={$settings.notifications.sound}/> {$t('set.notif.sound')}</label>
							<label class="toggle"><input type="checkbox" bind:checked={$settings.notifications.updateHint}/> {$t('set.notif.update')}</label>
							<label class="toggle"><input type="checkbox" bind:checked={$settings.notifications.achievementUnlocked}/> {$t('set.notif.achievement')}</label>
							<label class="toggle"><input type="checkbox" bind:checked={$settings.notifications.watchlistReminder}/> {$t('set.notif.watchlist')}</label>
						</div>
					{:else if active === 'clock'}
						<div class="look-card" style="margin-bottom:16px">
							<label class="toggle big"><input type="checkbox" bind:checked={$settings.clock.enabled}/> <b>{$t('set.clock.show')}</b></label>
						</div>
						{#if $settings.clock.enabled}
							<div class="look-head">
								<div class="look-card">
									<div class="look-label">{$t('set.clock.type')}</div>
									<div class="seg2">
										<button class:on={$settings.clock.type === 'digital'} onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, type: 'digital' } }))}>{$t('set.clock.digital')}</button>
										<button class:on={$settings.clock.type === 'analog'} onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, type: 'analog' } }))}>{$t('set.clock.analog')}</button>
									</div>
								</div>
								{#if $settings.clock.type === 'digital'}
									<div class="look-card">
										<div class="look-label">{$t('set.clock.format')}</div>
										<div class="seg2">
											<button class:on={!$settings.clock.hour12} onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, hour12: false } }))}>{$t('set.clock.24h')}</button>
											<button class:on={$settings.clock.hour12} onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, hour12: true } }))}>{$t('set.clock.12h')}</button>
										</div>
									</div>
								{/if}
								<div class="look-card">
									<div class="look-label">{$t('set.clock.color')}</div>
									<div class="swatches">
										{#each ['#ffffff', '#30c5bb', '#6c8cff', '#f0a020', '#e0556b', '#000000'] as cc (cc)}
											<button class="swatch" class:on={$settings.clock.color?.toLowerCase() === cc} style="--sw: {cc}" onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, color: cc } }))} title={cc} aria-label={`Uhrfarbe ${cc}`}></button>
										{/each}
										<label class="swatch custom" title={$t('set.customColor')}><input type="color" bind:value={$settings.clock.color}/><span>+</span></label>
									</div>
								</div>
							</div>

							<div class="grid">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.clock.showSeconds}/> {$t('set.clock.seconds')}</label>
								<div class="field">
									<label>{$t('set.clock.transparency')}: {$settings.clock.transparency}%</label>
									<input type="range" min="0" max="100" bind:value={$settings.clock.transparency}/>
								</div>
								<div class="field">
									<label>{$t('set.clock.size')}: {$settings.clock.size}px</label>
									<input type="range" min="20" max="96" bind:value={$settings.clock.size}/>
								</div>
							</div>

							<div class="block">
								<button class="ghost" onclick={() => settings.update((s) => ({ ...s, clock: { ...s.clock, x: null, y: null } }))}>{$t('set.clock.resetPos')}</button>
								<p class="hint">{$t('set.clock.hintEditing')}</p>
							</div>
						{:else}
							<p class="hint">{$t('set.clock.hintOff')}</p>
						{/if}
					{:else if active === 'advanced'}
						<div class="about">
							<div class="about-logo">👁️</div>
							<div class="about-tx">
								<div class="about-name">{APP_NAME}</div>
								<div class="about-ver">{$t('set.adv.version')} {APP_VERSION}</div>
							</div>
							{#if $updateState.available}<span class="up-pill">Update v{$updateState.version}</span>{/if}
						</div>

						<div class="opt-group">
							<div class="opt-group-title">{$t('set.adv.sysWebview')}</div>
							{#if wv2Failed}
								<div class="opt">
									<div class="opt-ic">⚠️</div>
									<div class="opt-tx2"><div class="opt-t">{$t('set.adv.wv2NotFound')}</div><div class="opt-d">{$t('set.adv.wv2NotFoundDesc')}</div></div>
								</div>
								<a class="opt" href="https://developer.microsoft.com/en-us/microsoft-edge/webview2/" target="_blank" rel="noreferrer">
									<div class="opt-ic">⬇️</div>
									<div class="opt-tx2"><div class="opt-t">{$t('set.adv.wv2Download')}</div><div class="opt-d">{$t('set.adv.wv2DownloadDesc')}</div></div>
									<span class="opt-btn ghosty">Öffnen ↗</span>
								</a>
							{:else}
								<div class="opt">
									<div class="opt-ic">🧩</div>
									<div class="opt-tx2"><div class="opt-t">{$t('set.adv.wv2Runtime')}</div><div class="opt-d">{$t('set.adv.wv2RuntimeDesc')}</div></div>
									<span class="opt-btn ghosty">{wv2Ver ?? 'Prüfe…'}</span>
								</div>
							{/if}
						</div>

						<div class="opt-group">
							<div class="opt-group-title">{$t('set.adv.updates')}</div>
							<div class="opt">
								<div class="opt-ic">🛤️</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.channel')}</div><div class="opt-d">{$t('set.adv.channelDesc')}</div></div>
								<select class="opt-select" bind:value={$settings.updateChannel}>
									<option value="stable">{$t('set.adv.channelStable')}</option>
									<option value="beta">{$t('set.adv.channelBeta')}</option>
								</select>
							</div>
							<div class="opt">
								<div class="opt-ic">⬆️</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.checkUpdates')}</div><div class="opt-d">{$t('set.adv.checkUpdatesDesc')}</div></div>
								<button class="opt-btn" disabled={$updateState.checking} onclick={() => checkForUpdate(true)}>{$updateState.checking ? 'Prüfe…' : 'Suchen'}</button>
							</div>
							<a class="opt" href={LINKS.githubReleases} target="_blank" rel="noreferrer">
								<div class="opt-ic">🗒️</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.allVersions')}</div><div class="opt-d">{$t('set.adv.allVersionsDesc')}</div></div>
								<span class="opt-btn ghosty">Öffnen ↗</span>
							</a>
							{#if $updateState.available}
								<p class="hint">{$t('set.adv.updateAvail', { n: $updateState.version })}</p>
							{/if}
						</div>

						<div class="opt-group">
							<div class="opt-group-title">{$t('set.adv.backup')}</div>
							<div class="opt">
								<div class="opt-ic">💾</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.backupExport')}</div><div class="opt-d">{$t('set.adv.backupExportDesc')}</div></div>
								<button class="opt-btn" onclick={onBackupExport}>{$t('set.adv.backupExportBtn')}</button>
							</div>
							<div class="opt">
								<div class="opt-ic">📥</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.backupImport')}</div><div class="opt-d">{$t('set.adv.backupImportDesc')}</div></div>
								<button class="opt-btn" onclick={() => backupFileInput?.click()}>{$t('set.adv.backupImportBtn')}</button>
								<input bind:this={backupFileInput} type="file" accept="application/json,.json" onchange={onBackupFile} hidden />
							</div>
							{#if backupErr}<p class="hint err">{backupErr}</p>{/if}
							{#if pendingBackup}
								<div class="restore-confirm">
									<div class="rc-tx">{$t('set.adv.restoreConfirm', { date: new Date(pendingBackup.exportedAt).toLocaleString($settings.appearance.language === 'en' ? 'en-US' : 'de-DE'), version: pendingBackup.version })}</div>
									<div class="rc-actions">
										<button class="opt-btn danger" onclick={confirmRestore}>{$t('set.adv.restoreConfirmBtn')}</button>
										<button class="opt-btn ghosty" onclick={() => (pendingBackup = null)}>{$t('common.cancel')}</button>
									</div>
								</div>
							{/if}
						</div>

						<div class="opt-group">
							<div class="opt-group-title">{$t('set.adv.dataView')}</div>
							<div class="opt">
								<div class="opt-ic">🎴</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.resetCards')}</div><div class="opt-d">{$t('set.adv.resetCardsDesc')}</div></div>
								<button class="opt-btn" onclick={resetProviders}>{$t('common.reset')}</button>
							</div>
							<div class="opt">
								<div class="opt-ic">👋</div>
								<div class="opt-tx2"><div class="opt-t">{$t('set.adv.redoOnboarding')}</div><div class="opt-d">{$t('set.adv.redoOnboardingDesc')}</div></div>
								<button class="opt-btn" onclick={() => { close(); onboardingOpen.set(true); }}>{$t('set.adv.start')}</button>
							</div>
						</div>

						<div class="opt-group">
							<div class="opt-group-title">{$t('set.adv.helpFeedback')}</div>
							<a class="opt" href={LINKS.discord} target="_blank" rel="noreferrer">
								<div class="opt-ic">💬</div>
								<div class="opt-tx2"><div class="opt-t">Discord</div><div class="opt-d">{$t('set.adv.discordDesc')}</div></div>
								<span class="opt-btn ghosty">{$t('set.adv.join')}</span>
							</a>
						</div>

						<p class="copyright">© 2026 Luka Kalinka · {APP_NAME}</p>
					{:else if active === 'account'}
						<p class="acc-intro">{$t('set.acc.intro')}</p>
						<div class="plist">
							{#each $profiles as p (p.id)}
								<div class="prow">
									<button class="pav" onclick={() => { avatarPickFor = avatarPickFor === p.id ? null : p.id; accentPickFor = null; }} title={$t('set.acc.avatarTitle')} aria-label={$t('set.acc.avatarTitle')}>{p.avatar ?? '👤'}</button>
									<button class="pacc" style="--pc: {p.accent || 'var(--accent)'}" onclick={() => { accentPickFor = accentPickFor === p.id ? null : p.id; avatarPickFor = null; }} title="Akzentfarbe dieses Profils" aria-label="Akzentfarbe wählen"></button>
									<input class="pname-in" value={p.name} oninput={(e) => renameProfile(p.id, (e.currentTarget as HTMLInputElement).value)} />
									{#if p.id === $mainProfileId}<span class="pbadge main">{$t('set.acc.mainBadge')}</span>{/if}
									{#if p.id === $activeProfileId}<span class="pbadge">{$t('set.acc.activeBadge')}</span>{/if}
									{#if p.id !== $mainProfileId}
										<button class="mini" onclick={() => requestSetMain(p.id)} title={$t('set.acc.setMainTitle')}>{$t('set.acc.mainBadge')}</button>
									{/if}
									<button class="mini" onclick={() => openPinPanel(p.id)}>{p.pinHash ? $t('set.acc.pinChange') : $t('set.acc.pinSet')}</button>
									{#if p.pinHash}
										<button class="mini" onclick={() => openResetPanel(p.id)} title={$t('set.acc.pinForgotTitle')}>{$t('set.acc.pinForgot')}</button>
									{/if}
									<button
										class="mini danger"
										disabled={$profiles.length <= MIN_PROFILES || p.id === $mainProfileId}
										onclick={() => deleteProfile(p.id)}
										title={p.id === $mainProfileId ? $t('set.acc.delMain') : ($profiles.length <= MIN_PROFILES ? $t('set.acc.delMin') : $t('set.acc.delOk'))}
									>🗑</button>

									{#if avatarPickFor === p.id}
										<div class="avatar-panel">
											{#each PROFILE_AVATARS as em (em)}
												<button class="av-opt" class:on={(p.avatar ?? '👤') === em} onclick={() => { setProfileAvatar(p.id, em); avatarPickFor = null; }} aria-label={`Avatar ${em}`}>{em}</button>
											{/each}
										</div>
									{/if}

									{#if accentPickFor === p.id}
										<div class="avatar-panel accent">
											{#each ACCENT_PRESETS as c (c)}
												<button class="swatch" class:on={p.accent?.toLowerCase() === c} style="--sw: {c}" onclick={() => { setProfileAccent(p.id, c); accentPickFor = null; }} title={c} aria-label={`Akzent ${c}`}></button>
											{/each}
											<label class="swatch custom" title={$t('set.customColor')}><input type="color" value={p.accent || '#30c5bb'} oninput={(e) => setProfileAccent(p.id, (e.currentTarget as HTMLInputElement).value)} /><span>+</span></label>
											<button class="mini" onclick={() => { setProfileAccent(p.id, ''); accentPickFor = null; }} title={$t('set.acc.useGlobalAccent')}>{$t('set.acc.standard')}</button>
										</div>
									{/if}

									{#if pinEditFor === p.id}
										<div class="pin-panel">
											{#if p.pinHash}
												<input class="pin-in" type="password" inputmode="numeric" placeholder={$t('set.acc.oldPin')} bind:value={oldPinInput} />
											{/if}
											<input class="pin-in" type="password" inputmode="numeric" placeholder={$t('set.acc.newPin')} bind:value={newPinInput} onkeydown={(e) => e.key === 'Enter' && savePin(p)} />
											<button class="mini primary" onclick={() => savePin(p)}>{$t('common.save')}</button>
											{#if p.pinHash}<button class="mini danger" onclick={() => removePin(p)}>{$t('set.acc.removePin')}</button>{/if}
											<button class="mini" onclick={closePinPanel}>{$t('common.cancel')}</button>
											{#if pinError}<span class="pin-err">{pinError}</span>{/if}
										</div>
									{/if}

									{#if resetPinFor === p.id}
										<div class="pin-panel">
											<input class="pin-in" type="password" placeholder={$t('set.acc.adminCode')} bind:value={resetAdminInput} onkeydown={(e) => e.key === 'Enter' && doResetPin(p.id)} />
											<button class="mini primary" onclick={() => doResetPin(p.id)}>{$t('set.acc.resetPin')}</button>
											<button class="mini" onclick={closeResetPanel}>{$t('common.cancel')}</button>
											{#if resetMsg}<span class="pin-err">{resetMsg}</span>{/if}
											{#if !$adminCodeHash}<span class="pin-err">{$t('set.acc.noAdminYet')}</span>{/if}
										</div>
									{/if}

									{#if mainChangeFor === p.id}
										<div class="pin-panel">
											<input class="pin-in" type="password" placeholder={$t('set.acc.adminCode')} bind:value={mainAdminInput} onkeydown={(e) => e.key === 'Enter' && confirmSetMain(p.id)} />
											<button class="mini primary" onclick={() => confirmSetMain(p.id)}>{$t('set.acc.confirmMain')}</button>
											<button class="mini" onclick={cancelSetMain}>{$t('common.cancel')}</button>
											{#if mainMsg}<span class="pin-err">{mainMsg}</span>{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
						{#if $profiles.length < MAX_PROFILES}
							<button class="ghost" onclick={() => addProfile(`Profil ${$profiles.length + 1}`)}>
								＋ Profil hinzufügen
							</button>
						{/if}

						<div class="block" style="margin-top:18px">
							<div class="block-label">🛡️ Admin-Code (für vergessene PINs)</div>
							<p class="hint" style="margin-top:0">{$t('set.acc.adminIntro')}</p>
							<div class="admin-row">
								{#if $adminCodeHash}
									<input class="pin-in wide" type="password" placeholder={$t('set.acc.oldAdminCode')} bind:value={oldAdminInput} />
								{/if}
								<input class="pin-in wide" type="password" placeholder={$adminCodeHash ? $t('set.acc.newAdminCode') : $t('set.acc.setAdminCode')} bind:value={adminInput} onkeydown={(e) => e.key === 'Enter' && saveAdminCode()} />
								<button class="mini primary" onclick={saveAdminCode}>{$adminCodeHash ? $t('set.acc.change') : $t('set.acc.set')}</button>
								{#if $adminCodeHash}<button class="mini danger" onclick={removeAdminCode}>{$t('common.remove')}</button>{/if}
							</div>
							<div class="admin-status">{$t('set.acc.statusPrefix')} {$adminCodeHash ? $t('set.acc.adminStatusSet') : $t('set.acc.adminStatusNone')}{#if adminMsg} · {adminMsg}{/if}</div>
						</div>

						<p class="hint">{$t('set.acc.switchHint')}</p>
					{:else if active === 'plugins'}
						<p class="acc-intro">{$t('set.plug.intro')}</p>

						<div class="plugin">
							<div class="plugin-head">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.continueWatching}/> <b>{$t('set.plug.continue')}</b></label>
							</div>
							<p class="hint">{$t('set.plug.continueHint')}</p>
						</div>

						<div class="plugin">
							<div class="plugin-head">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.miniPlayerEnabled}/> <b>{$t('set.plug.mini')}</b></label>
							</div>
							<p class="hint">{$t('set.plug.miniHint')}</p>
						</div>

						<div class="plugin">
							<div class="plugin-head">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.sleepTimerEnabled}/> <b>{$t('set.plug.sleep')}</b></label>
							</div>
							<p class="hint">{$t('set.plug.sleepHint')}</p>
							{#if $settings.plugins.sleepTimerEnabled}
								<div class="plugin-opts">
									<div class="quick">
										{#each [30, 60, 90] as m (m)}
											<button class="qbtn" class:on={$settings.plugins.sleepTimerMinutes === m} onclick={() => ($settings.plugins.sleepTimerMinutes = m)}>{m} Min</button>
										{/each}
									</div>
									<label>{$t('set.plug.duration')}
										<select bind:value={$settings.plugins.sleepTimerMinutes}>
											<option value={15}>{$t('set.plug.min15')}</option>
											<option value={30}>{$t('set.plug.min30')}</option>
											<option value={60}>{$t('set.plug.min60')}</option>
											<option value={90}>{$t('set.plug.min90')}</option>
											<option value={120}>{$t('set.plug.h2')}</option>
										</select>
									</label>
									<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.sleepTimerCloseStream}/> {$t('set.plug.sleepClose')}</label>
								</div>
							{/if}
						</div>

						<div class="plugin">
							<div class="plugin-head">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.discordEnabled}/> <b>{$t('set.plug.discord')}</b></label>
							</div>
							<p class="hint">{$t('set.plug.discordHint')}</p>
							{#if $settings.plugins.discordEnabled}
								<div class="plugin-opts">
									{#if DEFAULT_DISCORD_CLIENT_ID}
										<p class="hint" style="margin:0">✅ Es ist eine eingebaute OmniHub-Kennung hinterlegt – du musst nichts weiter eintragen.</p>
									{:else}
										<p class="hint" style="margin:0">ℹ️ Es ist noch keine eingebaute OmniHub-Kennung hinterlegt. Bis dahin bleibt der Status leer – oder du trägst unten eine eigene Application-ID ein.</p>
									{/if}
									<details style="flex-basis:100%; margin-top:8px">
										<summary style="cursor:pointer; color:var(--text-muted); font-size:13px">{$t('set.plug.discordAdvanced')}</summary>
										<input class="pin-in wide" style="display:block; margin-top:8px" type="text" inputmode="numeric" placeholder={$t('set.plug.discordIdPh')} bind:value={$settings.plugins.discordClientId} />
										<p class="hint" style="margin-top:4px">{$t('set.plug.discordIdHint')}</p>
									</details>
								</div>
							{/if}
						</div>

						<div class="plugin">
							<div class="plugin-head">
								<label class="toggle"><input type="checkbox" bind:checked={$settings.plugins.hardwareAcceleration}/> <b>{$t('set.plug.hwAccel')}</b></label>
							</div>
							<p class="hint">{$t('set.plug.hwAccelHint')}</p>
							<div class="plugin-opts">
								<button onclick={restartApp} style="background:var(--accent-soft); border:1px solid color-mix(in srgb, var(--accent) 40%, transparent); color:var(--text); padding:8px 14px; border-radius:9px; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600;">{$t('set.plug.restartNow')}</button>
							</div>
						</div>

						<div class="block" style="margin-top:16px">
							<div class="block-label">{$t('set.plug.extTitle')}</div>
							<p class="hint" style="margin-top:0">
								{$t('set.plug.extBody')}
							</p>
						</div>
					{:else}
						<p class="hint">{$t('set.plug.extOutro')}</p>
					{/if}
				</div>
			</section>
		</div>
	</div>
{/if}

<style>
	.backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.62); display: grid; place-items: center; z-index: 90; animation: bd-in 0.18s ease; }
	@keyframes bd-in { from { opacity: 0; } to { opacity: 1; } }
	.dialog {
		width: min(1180px, 94vw);
		height: min(800px, 92vh);
		background: var(--bg-elev);
		border-radius: calc(var(--radius) + 4px);
		border: 1px solid var(--border);
		display: flex;
		overflow: hidden;
		box-shadow: 0 30px 80px -24px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.02) inset;
		animation: dlg-in 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes dlg-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
	.side {
		width: 240px; flex-shrink: 0;
		border-right: 1px solid var(--border);
		display: flex; flex-direction: column;
		padding: 18px 14px;
		background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent 220px);
	}
	.head { display: flex; align-items: center; gap: 10px; padding: 0 4px 14px; }
	.head .emoji { width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; display: grid; place-items: center; font-size: 17px; background: radial-gradient(circle at 30% 30%, var(--accent), color-mix(in srgb, var(--accent) 45%, #000)); box-shadow: 0 5px 14px -5px var(--accent); }
	.head h2 { margin: 0; font-size: 16px; font-weight: 800; }
	.search input {
		width: 100%; padding: 8px 12px;
		background: var(--bg-card); border: 1px solid var(--border);
		color: var(--text); border-radius: 10px; font-size: 13px;
	}
	nav { display: flex; flex-direction: column; gap: 2px; margin-top: 14px; flex: 1; }
	nav button {
		background: transparent; border: 0; color: var(--text-muted);
		display: flex; align-items: center; gap: 10px; padding: 9px 10px;
		border-radius: 10px; cursor: pointer; text-align: left; font-size: 13.5px;
		transition: background 0.13s, color 0.13s;
	}
	nav button:hover { background: var(--bg-card); color: var(--text); }
	nav button.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; box-shadow: inset 3px 0 0 var(--accent); }
	nav button .i { width: 18px; text-align: center; font-size: 15px; }
	.version { color: var(--text-dim); font-size: 11px; text-align: center; padding-top: 8px; }

	.main { flex: 1; display: flex; flex-direction: column; }
	.main-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; border-bottom: 1px solid var(--border); }
	.main-head h3 { margin: 0; font-weight: 800; font-size: 19px; letter-spacing: -0.01em; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; transition: background 0.13s, color 0.13s; }
	.x:hover { background: var(--bg-card); color: var(--text); }
	.content { padding: 24px 28px; overflow: auto; contain: paint; transform: translateZ(0); }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px 20px; }
	.look-head { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px; }
	.look-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; }
	.look-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 11px; }
	.seg2 { display: flex; gap: 6px; }
	.seg2 button { flex: 1; background: var(--bg-elev); border: 1px solid var(--border); color: var(--text-muted); border-radius: 10px; padding: 9px 10px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
	.seg2 button:hover { border-color: var(--border-strong); color: var(--text); }
	.seg2 button.on { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
	.swatches { display: flex; flex-wrap: wrap; gap: 9px; }
	.swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid transparent; background: var(--sw); cursor: pointer; padding: 0; position: relative; transition: transform 0.12s, box-shadow 0.12s; box-shadow: 0 0 0 1px var(--border) inset; }
	.swatch:hover { transform: scale(1.12); }
	.swatch.on { border-color: var(--text); box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px var(--sw); }
	.swatch.custom { display: grid; place-items: center; background: var(--bg-elev); border: 1px dashed var(--border-strong); color: var(--text-muted); overflow: hidden; }
	.swatch.custom input[type='color'] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
	.swatch.custom span { font-size: 18px; line-height: 1; }
	.field { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.15s, box-shadow 0.15s; }
	.field:hover { border-color: var(--border-strong); }
	.field:hover { border-color: var(--border-strong); }
	.field > label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
	.field input[type='range'] { width: 100%; }
	/* Custom Slider – einheitlicher Look in allen Tabs */
	input[type='range'] {
		-webkit-appearance: none; appearance: none;
		height: 6px; border-radius: 999px; cursor: pointer;
		background: color-mix(in srgb, var(--text-muted) 30%, transparent);
		accent-color: var(--accent);
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none; appearance: none;
		width: 16px; height: 16px; border-radius: 50%;
		background: var(--accent); border: 2px solid var(--bg-elev);
		box-shadow: 0 1px 5px rgba(0,0,0,0.45); transition: transform 0.1s;
	}
	input[type='range']::-webkit-slider-thumb:hover { transform: scale(1.15); }
	/* Custom Schalter (Toggle) */
	input[type='checkbox'] { accent-color: var(--accent); }
	.toggle { gap: 10px; }
	.toggle.big { font-size: 14px; }
	.toggle input[type='checkbox'] {
		-webkit-appearance: none; appearance: none;
		width: 40px; height: 22px; margin: 0; flex-shrink: 0;
		border-radius: 999px; cursor: pointer;
		background-color: color-mix(in srgb, var(--text-muted) 38%, transparent);
		background-image: radial-gradient(circle 8px at 13px 50%, #fff 99%, transparent 100%);
		background-repeat: no-repeat; background-position: 0 0;
		transition: background-color 0.18s ease, background-position 0.18s ease;
	}
	.toggle input[type='checkbox']:checked { background-color: var(--accent); background-position: 17px 0; }
	.toggle input[type='checkbox']:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
	.field select, .field .hex {
		width: 100%; background: var(--bg-elev); color: var(--text);
		border: 1px solid var(--border); padding: 7px 10px; border-radius: 8px; font-size: 13px;
		transition: border-color 0.14s, box-shadow 0.14s;
	}
	.field select {
		-webkit-appearance: none; appearance: none; padding-right: 30px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat; background-position: right 10px center;
	}
	.field select:focus, .field .hex:focus, .search input:focus, .pname-in:focus, .pin-in:focus,
	.plugin-opts select:focus, .content input[type='text']:focus {
		outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.field input[type='color'] { width: 32px; height: 32px; padding: 0; border: 1px solid var(--border); border-radius: 8px; background: transparent; }
	.row { display: flex; gap: 8px; align-items: center; }
	.row button { background: var(--bg-elev); color: var(--text-muted); border: 1px solid var(--border); padding: 6px 12px; border-radius: 8px; cursor: pointer; }
	.row button.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
	.toggle { display: flex; align-items: center; gap: 8px; background: var(--bg-card); padding: 10px 14px; border: 1px solid var(--border); border-radius: 12px; font-size: 13px; cursor: pointer; }
	.block { margin-top: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
	.block-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
	.row3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; }
	.ghost { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 10px; cursor: pointer; text-decoration: none; font-size: 13.5px; display: inline-block; }
	.ghost:hover { border-color: var(--border-strong); }
	.ghost.danger { color: #f87171; border-color: color-mix(in srgb, #f87171 40%, var(--border)); }
	.ghost.danger:hover { border-color: #f87171; }
	.filebtn {
		background: var(--bg-card); border: 1px solid var(--border); color: var(--text);
		padding: 10px 14px; border-radius: 10px; cursor: pointer; font-size: 13.5px;
		display: inline-block; font-family: inherit;
	}
	.filebtn:hover { border-color: var(--border-strong); }
	.hint { color: var(--text-muted); font-size: 13px; }

	/* Profile-Tab */
	.acc-intro { color: var(--text-muted); font-size: 13px; margin: 0 0 14px; }
	.plist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
	.prow { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 8px 10px; flex-wrap: wrap; }
	.pav { width: 30px; height: 30px; border-radius: 50%; background: var(--accent-soft); border: 1px solid var(--border); display: grid; place-items: center; font-size: 15px; flex-shrink: 0; cursor: pointer; transition: transform 0.12s, border-color 0.12s; padding: 0; }
	.pav:hover { transform: scale(1.08); border-color: var(--accent); }
	.avatar-panel { flex-basis: 100%; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; padding: 10px; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 10px; }
	.av-opt { width: 34px; height: 34px; border-radius: 9px; background: var(--bg-card); border: 1px solid var(--border); font-size: 17px; cursor: pointer; display: grid; place-items: center; transition: transform 0.1s, border-color 0.12s, background 0.12s; }
	.av-opt:hover { transform: scale(1.1); border-color: var(--border-strong); }
	.av-opt.on { border-color: var(--accent); background: var(--accent-soft); }
	.pacc { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; cursor: pointer; padding: 0; background: var(--pc); border: 2px solid var(--bg-card); box-shadow: 0 0 0 1px var(--border); transition: transform 0.12s; }
	.pacc:hover { transform: scale(1.12); }
	.avatar-panel.accent { align-items: center; }
	.pname-in { flex: 1; min-width: 120px; background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 7px 10px; font-size: 13.5px; font-family: inherit; }
	.pbadge { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); background: var(--accent-soft); padding: 3px 8px; border-radius: 999px; }
	.pin-in { width: 150px; background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 7px 10px; font-size: 13px; letter-spacing: 3px; font-family: inherit; }
	.pin-panel { flex-basis: 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 6px; padding-top: 8px; border-top: 1px dashed var(--border); }
	.pbadge.main { color: #fbbf24; background: color-mix(in srgb, #fbbf24 18%, transparent); }
	.pin-in.wide { width: 240px; letter-spacing: normal; }
	.admin-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
	.admin-status { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
	.plugin { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
	.plugin-head { display: flex; align-items: center; justify-content: space-between; }
	.plugin .hint { margin: 6px 0 0; }
	.plugin-opts { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); }
	.quick { display: inline-flex; gap: 6px; }
	.qbtn { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text-muted); border-radius: 999px; padding: 6px 12px; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background 0.14s, color 0.14s, border-color 0.14s; }
	.qbtn:hover { border-color: var(--border-strong); color: var(--text); }
	.qbtn.on { background: var(--accent); border-color: transparent; color: var(--accent-text); }
	.plugin-opts select { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 8px; padding: 6px 10px; font-family: inherit; }
	.pin-err { color: #f87171; font-size: 12px; }
	.mini { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text-muted); padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 12.5px; font-family: inherit; }
	.mini:hover { color: var(--text); border-color: var(--border-strong); }
	.mini.primary { background: var(--accent); color: var(--accent-text); border: 0; font-weight: 700; }
	.mini.danger:hover { color: #f87171; border-color: #f87171; }
	.mini:disabled { opacity: 0.4; cursor: not-allowed; }

	/* Mehr-Tab */
	.about { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg, var(--accent-soft), transparent 70%); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; margin-bottom: 20px; }
	.about-logo { width: 46px; height: 46px; flex-shrink: 0; border-radius: 12px; background: radial-gradient(circle at 30% 30%, var(--accent), color-mix(in srgb, var(--accent) 45%, #000)); display: grid; place-items: center; font-size: 24px; box-shadow: 0 6px 18px -6px var(--accent); }
	.about-name { font-size: 18px; font-weight: 800; }
	.about-ver { font-size: 12.5px; color: var(--text-muted); }
	.up-pill { margin-left: auto; background: var(--accent); color: var(--accent-text); font-size: 11.5px; font-weight: 700; padding: 5px 11px; border-radius: 999px; }
	.opt-group { margin-bottom: 18px; }
	.opt-group-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin: 0 2px 8px; }
	.opt { display: flex; align-items: center; gap: 12px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; text-decoration: none; color: var(--text); transition: border-color 0.15s, transform 0.12s; }
	.opt:hover { border-color: var(--border-strong); }
	a.opt:hover { transform: translateY(-1px); }
	.opt-ic { width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; background: var(--bg-elev); display: grid; place-items: center; font-size: 19px; }
	.opt-tx2 { flex: 1; min-width: 0; }
	.opt-t { font-weight: 700; font-size: 14px; }
	.opt-d { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
	.opt-btn { flex-shrink: 0; background: var(--accent); color: var(--accent-text); border: 0; border-radius: 9px; padding: 8px 15px; font-family: inherit; font-weight: 700; font-size: 12.5px; cursor: pointer; }
	.opt-select { flex-shrink: 0; background: var(--bg-elev); color: var(--text); border: 1px solid var(--border); border-radius: 9px; padding: 8px 12px; font-family: inherit; font-size: 12.5px; cursor: pointer; }
	.opt-btn:hover { filter: brightness(1.08); }
	.opt-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.opt-btn.ghosty { background: var(--bg-elev); color: var(--accent); border: 1px solid var(--border); }
	.opt-btn.danger { background: var(--danger, #e0556b); color: #fff; }
	.hint.err { color: var(--danger, #e0556b); }
	.restore-confirm { margin-top: 8px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--danger, #e0556b) 45%, var(--border)); background: color-mix(in srgb, var(--danger, #e0556b) 10%, transparent); border-radius: 10px; }
	.rc-tx { font-size: 13px; margin-bottom: 10px; }
	.rc-actions { display: flex; gap: 8px; }
	.copyright { text-align: center; color: var(--text-dim); font-size: 11.5px; margin-top: 8px; }
	.theme-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
	.tp-group-label { font-size: 11px; font-weight: 700; color: var(--text-dim); margin: 12px 0 2px; }
	.tp { display: flex; align-items: center; gap: 8px; padding: 6px 11px 6px 6px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 600; transition: border-color 0.15s ease, transform 0.1s ease; }
	.tp:hover { border-color: var(--border-strong); transform: translateY(-1px); }
	.tp.on { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
	.tp-prev { width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg, var(--c1) 55%, var(--c2) 55%); border: 1px solid var(--cb); display: grid; place-items: center; flex: 0 0 auto; }
	.tp-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--ca); box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.25); }
	.tp-name { white-space: nowrap; }
</style>
