<script lang="ts">
	import { page } from '$app/stores';
	import { activeStream } from '$lib/stores/providers';
	import { settings } from '$lib/stores/settings';
	import { notifCenterOpen } from '$lib/stores/toasts';
	import { backgroundStreams, bringToForeground, closeBackgroundStream, setBackgroundMuted, setBackgroundVolume, setAllBackgroundMuted, closeAllBackgroundStreams } from '$lib/embedded';
	import Logo from './Logo.svelte';
	import ProfileSwitcher from './ProfileSwitcher.svelte';
	import SleepCountdown from './SleepCountdown.svelte';

	export let openSettings: () => void;
	export let openProfiles: () => void;

	let bgOpen = true;
	$: allMuted = $backgroundStreams.length > 0 && $backgroundStreams.every((s) => s.muted);

	const nav = [
		{ href: '/', label: 'Übersicht', icon: '🏠' },
		{ href: '/watchlist', label: 'Gemerkt', icon: '🔖' },
		{ href: '/news', label: 'Neuigkeiten', icon: '📡' },
		{ href: '/upcoming', label: 'Upcoming', icon: '📅' }
	];

	$: path = $page.url.pathname;

	function toggleTheme() {
		settings.update(($s) => ({
			...$s,
			appearance: { ...$s.appearance, theme: $s.appearance.theme === 'dark' ? 'light' : 'dark' }
		}));
	}
</script>

<aside class="sidebar" style="width: var(--sidebar-width)">
	<nav>
		{#each nav as item}
			<a href={item.href} class="nav-item" class:active={path === item.href}>
				<span class="icon">{item.icon}</span><span>{item.label}</span>
			</a>
		{/each}
		{#if $activeStream}
			<a href="/stream" class="nav-item" class:active={path === '/stream'}>
				<span class="icon">▶️</span><span>Schaut gerade</span>
			</a>
		{/if}
	</nav>

	{#if $backgroundStreams.length}
		<div class="bg-streams">
			<button class="bg-head" onclick={() => (bgOpen = !bgOpen)} aria-expanded={bgOpen}>
				<span class="bg-dot" aria-hidden="true"></span>
				<span class="bg-title">Im Hintergrund</span>
				<span class="bg-count">{$backgroundStreams.length}</span>
				<span class="bg-chev" class:open={bgOpen} aria-hidden="true">▾</span>
			</button>
			{#if bgOpen}
				<div class="bg-list">
					{#each $backgroundStreams as s (s.streamId)}
						<div class="bg-row" class:muted={s.muted}>
							<div class="bg-top">
								<Logo provider={s.provider} size={18} />
								<span class="bg-name" title={s.provider.name}>{s.provider.name}</span>
								<button class="bg-ic" onclick={() => setBackgroundMuted(s.streamId, !s.muted)} title={s.muted ? 'Ton einschalten' : 'Stummschalten'} aria-label={s.muted ? 'Ton einschalten' : 'Stummschalten'}>{s.muted ? '🔇' : '🔊'}</button>
								<button class="bg-ic" onclick={() => bringToForeground(s.streamId)} title="In den Vordergrund holen" aria-label="In den Vordergrund holen">▶</button>
								<button class="bg-ic close" onclick={() => closeBackgroundStream(s.streamId)} title="Stream schließen" aria-label="Stream schließen">✕</button>
							</div>
							<input
								class="bg-vol"
								type="range"
								min="0"
								max="100"
								value={s.volume}
								disabled={s.muted}
								oninput={(e) => setBackgroundVolume(s.streamId, +(e.currentTarget as HTMLInputElement).value)}
								title={`Lautstärke: ${s.volume}%`}
								aria-label="Lautstärke"
							/>
						</div>
					{/each}
				</div>
				{#if $backgroundStreams.length > 1}
					<div class="bg-actions">
						<button onclick={() => setAllBackgroundMuted(!allMuted)}>{allMuted ? 'Alle laut' : 'Alle stumm'}</button>
						<button class="warn" onclick={() => closeAllBackgroundStreams()}>Alle schließen</button>
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	<div class="bottom">
		<SleepCountdown />
		<a href="/cr-calendar" class="nav-item" class:active={path === '/cr-calendar'}>
			<span class="icon">⛩️</span><span>CR Kalender</span>
		</a>

		<div class="controls">
			<button class="ctrl" onclick={toggleTheme} title="Hell/Dunkel" aria-label="Theme">
				{$settings.appearance.theme === 'dark' ? '🌙' : '☀️'}
			</button>
			<button class="ctrl" onclick={() => notifCenterOpen.update((v) => !v)} title="Benachrichtigungen" aria-label="Benachrichtigungen">🔔</button>
		</div>

		<ProfileSwitcher {openProfiles} />

		<a href="/stats" class="nav-item" class:active={path === '/stats'}>
			<span class="icon">📊</span><span>Statistiken</span>
		</a>
		<button class="nav-item as-link" onclick={openSettings}>
			<span class="icon">⚙️</span><span>Einstellungen</span>
		</button>
	</div>
</aside>

<style>
	.sidebar {
		height: 100%;
		background: var(--bg-elev);
		border-right: 1px solid var(--border);
		display: flex; flex-direction: column;
		padding: 14px 12px;
		flex-shrink: 0; box-sizing: border-box;
	}
	nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
	.nav-item, .as-link {
		display: flex; align-items: center; gap: 12px;
		padding: 10px 12px; border-radius: 10px;
		color: var(--text-muted); text-decoration: none;
		font-size: 13.5px;
		background: transparent; border: 0;
		cursor: pointer; text-align: left; font-family: inherit;
		transition: background 0.12s, color 0.12s;
	}
	.nav-item:hover, .as-link:hover { background: var(--bg-card); color: var(--text); }
	.nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
	.icon { width: 18px; text-align: center; font-size: 14px; }
	.bottom { display: flex; flex-direction: column; gap: 2px; }
	.controls { display: flex; gap: 6px; padding: 6px 4px; }
	.ctrl {
		flex: 1; background: var(--bg-card); border: 1px solid var(--border);
		color: var(--text-muted); border-radius: 9px;
		padding: 7px 8px; cursor: pointer; font-size: 14px;
	}
	.ctrl:hover { color: var(--text); border-color: var(--border-strong); }

	.bg-streams { margin: 6px 0; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); overflow: hidden; }
	.bg-head { width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: transparent; border: 0; cursor: pointer; font-family: inherit; color: var(--text); }
	.bg-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); flex-shrink: 0; }
	.bg-title { font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
	.bg-count { margin-left: auto; font-size: 11px; font-weight: 700; color: var(--accent); background: var(--accent-soft); border-radius: 999px; padding: 1px 7px; }
	.bg-chev { font-size: 11px; color: var(--text-muted); transition: transform 0.15s; }
	.bg-chev.open { transform: rotate(180deg); }
	.bg-list { display: flex; flex-direction: column; gap: 2px; padding: 0 6px 6px; max-height: 260px; overflow-y: auto; }
	.bg-row { display: flex; flex-direction: column; gap: 5px; padding: 6px 4px; border-radius: 8px; }
	.bg-row:hover { background: var(--bg-elev); }
	.bg-row.muted { opacity: 0.62; }
	.bg-top { display: flex; align-items: center; gap: 7px; }
	.bg-name { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.bg-vol { width: 100%; height: 4px; accent-color: var(--accent); cursor: pointer; margin: 0; }
	.bg-vol:disabled { opacity: 0.4; cursor: default; }
	.bg-ic { width: 22px; height: 22px; flex-shrink: 0; display: grid; place-items: center; background: transparent; border: 1px solid transparent; border-radius: 6px; cursor: pointer; font-size: 11.5px; line-height: 1; color: var(--text-muted); transition: background 0.12s, color 0.12s, border-color 0.12s; }
	.bg-ic:hover { background: var(--bg-card); color: var(--text); border-color: var(--border); }
	.bg-ic.close:hover { background: rgba(220, 45, 45, 0.85); color: #fff; border-color: transparent; }
	.bg-actions { display: flex; gap: 6px; padding: 6px 6px 7px; }
	.bg-actions button { flex: 1; background: var(--bg-elev); border: 1px solid var(--border); color: var(--text-muted); border-radius: 8px; padding: 6px 4px; font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.12s, color 0.12s, border-color 0.12s; }
	.bg-actions button:hover { color: var(--text); border-color: var(--border-strong); }
	.bg-actions button.warn:hover { background: rgba(220, 45, 45, 0.85); color: #fff; border-color: transparent; }
</style>
