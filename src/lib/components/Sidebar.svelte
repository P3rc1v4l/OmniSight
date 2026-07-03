<script lang="ts">
	import { page } from '$app/stores';
	import { activeStream } from '$lib/stores/providers';
	import { settings } from '$lib/stores/settings';
	import { notifCenterOpen } from '$lib/stores/toasts';
	import { backgroundStreams, bringToForeground, closeBackgroundStream, setBackgroundMuted, setBackgroundVolume, setBackgroundPaused, setAllBackgroundMuted, closeAllBackgroundStreams } from '$lib/embedded';
	import { t } from '$lib/i18n';
	import Logo from './Logo.svelte';
	import ProfileSwitcher from './ProfileSwitcher.svelte';
	import SleepCountdown from './SleepCountdown.svelte';
	import { House, Bookmark, Rss, CalendarDays, Play, Pause, Volume2, VolumeX, Maximize2, X, ChevronDown, ChevronRight, Sparkles, BarChart3, Settings as SettingsIcon, Bell, Sun, Moon } from '@lucide/svelte';

	export let openSettings: () => void;
	export let openProfiles: () => void;

	let bgOpen = true;
	$: allMuted = $backgroundStreams.length > 0 && $backgroundStreams.every((s) => s.muted);

	const nav = [
		{ href: '/', key: 'nav.home', icon: House },
		{ href: '/watchlist', key: 'nav.watchlist', icon: Bookmark },
		{ href: '/news', key: 'nav.news', icon: Rss },
		{ href: '/upcoming', key: 'nav.upcoming', icon: CalendarDays }
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
				<svelte:component this={item.icon} size={18} class="ic" /><span>{$t(item.key)}</span>
			</a>
		{/each}
		{#if $activeStream}
			<a href="/stream" class="nav-item" class:active={path === '/stream'}>
				<Play size={18} class="ic" /><span>{$t('nav.watchingNow')}</span>
			</a>
		{/if}
	</nav>

	{#if $backgroundStreams.length}
		<div class="bg-streams">
			<button class="bg-head" onclick={() => (bgOpen = !bgOpen)} aria-expanded={bgOpen}>
				<span class="bg-dot" aria-hidden="true"></span>
				<span class="bg-title">{$t('sidebar.background')}</span>
				<span class="bg-count">{$backgroundStreams.length}</span>
				{#if bgOpen}<ChevronDown size={14} class="bg-chev" />{:else}<ChevronRight size={14} class="bg-chev" />{/if}
			</button>
			{#if bgOpen}
				<div class="bg-list">
					{#each $backgroundStreams as s (s.streamId)}
						<div class="bg-row" class:muted={s.muted} class:paused={s.paused}>
							<div class="bg-top">
								<Logo provider={s.provider} size={18} />
								<span class="bg-name" title={s.provider.name}>{s.provider.name}</span>
								<button class="bg-ic" onclick={() => setBackgroundPaused(s.streamId, !s.paused)} title={s.paused ? $t('bg.resume') : $t('bg.pause')} aria-label={s.paused ? $t('bg.resume') : $t('bg.pause')}>{#if s.paused}<Play size={13} />{:else}<Pause size={13} />{/if}</button>
								<button class="bg-ic" onclick={() => setBackgroundMuted(s.streamId, !s.muted)} title={s.muted ? $t('common.unmute') : $t('common.mute')} aria-label={s.muted ? $t('common.unmute') : $t('common.mute')}>{#if s.muted}<VolumeX size={13} />{:else}<Volume2 size={13} />{/if}</button>
								<button class="bg-ic" onclick={() => bringToForeground(s.streamId)} title={$t('bg.toForeground')} aria-label={$t('bg.toForeground')}><Maximize2 size={13} /></button>
								<button class="bg-ic close" onclick={() => closeBackgroundStream(s.streamId)} title={$t('bg.closeStream')} aria-label={$t('bg.closeStream')}><X size={13} /></button>
							</div>
							<input
								class="bg-vol"
								type="range"
								min="0"
								max="100"
								value={s.volume}
								disabled={s.muted}
								oninput={(e) => setBackgroundVolume(s.streamId, +(e.currentTarget as HTMLInputElement).value)}
								title={`${$t('bg.volume')}: ${s.volume}%`}
								aria-label={$t('bg.volume')}
							/>
						</div>
					{/each}
				</div>
				{#if $backgroundStreams.length > 1}
					<div class="bg-actions">
						<button onclick={() => setAllBackgroundMuted(!allMuted)}>{allMuted ? $t('bg.allLoud') : $t('bg.allMute')}</button>
						<button class="warn" onclick={() => closeAllBackgroundStreams()}>{$t('bg.closeAll')}</button>
					</div>
				{/if}
			{/if}
		</div>
	{/if}

	<div class="bottom">
		<SleepCountdown />
		<a href="/cr-calendar" class="nav-item" class:active={path === '/cr-calendar'}>
			<Sparkles size={18} class="ic" /><span>{$t('nav.crCalendar')}</span>
		</a>

		<div class="controls">
			<button class="ctrl" onclick={toggleTheme} title={$t('common.themeToggle')} aria-label={$t('common.themeToggle')}>
				{#if $settings.appearance.theme === 'dark'}<Moon size={16} />{:else}<Sun size={16} />{/if}
			</button>
			<button class="ctrl" onclick={() => notifCenterOpen.update((v) => !v)} title={$t('common.notifications')} aria-label={$t('common.notifications')}><Bell size={16} /></button>
		</div>

		<ProfileSwitcher {openProfiles} />

		<a href="/stats" class="nav-item" class:active={path === '/stats'}>
			<BarChart3 size={18} class="ic" /><span>{$t('nav.stats')}</span>
		</a>
		<button class="nav-item as-link" onclick={openSettings}>
			<SettingsIcon size={18} class="ic" /><span>{$t('nav.settings')}</span>
		</button>
	</div>
</aside>

<style>
	.sidebar {
		height: 100%;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
		-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.2);
		border-right: 1px solid var(--glass-brd);
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
	:global(.sidebar svg) { flex-shrink: 0; }
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
	.bg-list { display: flex; flex-direction: column; gap: 2px; padding: 0 6px 6px; max-height: 260px; overflow-y: auto; }
	.bg-row { display: flex; flex-direction: column; gap: 5px; padding: 6px 4px; border-radius: 8px; }
	.bg-row:hover { background: var(--bg-elev); }
	.bg-row.muted { opacity: 0.62; }
	.bg-row.paused .bg-name { color: var(--text-dim); }
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
