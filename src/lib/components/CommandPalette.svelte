<script lang="ts">
	// Befehlspalette (Strg+K): durchsuchbare Liste aus Seiten, Aktionen und Anbietern.
	// Tastatur: ↑/↓ wählen, Enter ausführen, Esc schließen. Maus: Hover wählt, Klick führt aus.
	import { goto } from '$app/navigation';
	import { visibleProviders } from '$lib/stores/providers';
	import { openProvider } from '$lib/embedded';
	import { t } from '$lib/i18n';
	import type { Component } from 'svelte';
	import { Search, House, Bookmark, CalendarDays, Rss, Play, Sparkles, BarChart3, Settings as SettingsIcon, SunMoon, Keyboard, Tv } from '@lucide/svelte';
	import type { Provider } from '$lib/types';

	let {
		open = false,
		onClose,
		onOpenSettings,
		onToggleTheme,
		onShowShortcuts,
		onOpenSearch
	}: {
		open?: boolean;
		onClose: () => void;
		onOpenSettings: () => void;
		onToggleTheme: () => void;
		onShowShortcuts: () => void;
		onOpenSearch: () => void;
	} = $props();

	type Cmd = {
		id: string;
		icon: Component;
		label: string;
		hint: string;
		keywords?: string;
		run: () => void;
	};

	let q = $state('');
	let sel = $state(0);
	let inputEl: HTMLInputElement | null = $state(null);

	// Seiten + Aktionen (Labels reaktiv über $t).
	const baseCmds = $derived.by<Cmd[]>(() => {
		const T = $t;
		return [
			{ id: 'act-search', icon: Search, label: T('cmd.search'), hint: T('cmd.action'), keywords: 'suche search find titel film serie', run: () => onOpenSearch() },
			{ id: 'nav-home', icon: House, label: T('nav.home'), hint: T('cmd.page'), run: () => goto('/') },
			{ id: 'nav-watchlist', icon: Bookmark, label: T('nav.watchlist'), hint: T('cmd.page'), run: () => goto('/watchlist') },
			{ id: 'nav-upcoming', icon: CalendarDays, label: T('nav.upcoming'), hint: T('cmd.page'), run: () => goto('/upcoming') },
			{ id: 'nav-news', icon: Rss, label: T('nav.news'), hint: T('cmd.page'), run: () => goto('/news') },
			{ id: 'nav-watching', icon: Play, label: T('nav.watchingNow'), hint: T('cmd.page'), run: () => goto('/stream') },
			{ id: 'nav-cal', icon: Sparkles, label: T('nav.crCalendar'), hint: T('cmd.page'), run: () => goto('/cr-calendar') },
			{ id: 'nav-stats', icon: BarChart3, label: T('nav.stats'), hint: T('cmd.page'), run: () => goto('/stats') },
			{ id: 'act-settings', icon: SettingsIcon, label: T('nav.settings'), hint: T('cmd.action'), run: () => onOpenSettings() },
			{ id: 'act-theme', icon: SunMoon, label: T('cmd.toggleTheme'), hint: T('cmd.action'), run: () => onToggleTheme() },
			{ id: 'act-shortcuts', icon: Keyboard, label: T('cmd.shortcuts'), hint: T('cmd.action'), run: () => onShowShortcuts() }
		];
	});

	// Anbieter öffnen.
	const provCmds = $derived.by<Cmd[]>(() => {
		const T = $t;
		return $visibleProviders.map((p: Provider) => ({
			id: 'prov-' + p.id,
			icon: Tv,
			label: T('cmd.open', { name: p.name }),
			hint: p.category ?? '',
			keywords: p.name,
			run: () => openProvider(p)
		}));
	});

	const all = $derived([...baseCmds, ...provCmds]);

	const filtered = $derived.by<Cmd[]>(() => {
		const needle = q.trim().toLowerCase();
		const list = needle
			? all.filter((c) => (c.label + ' ' + (c.keywords ?? '') + ' ' + c.hint).toLowerCase().includes(needle))
			: all;
		return list.slice(0, 60);
	});

	// Auswahl in Grenzen halten, wenn sich die Trefferliste ändert.
	$effect(() => {
		const n = filtered.length;
		if (sel > n - 1) sel = n > 0 ? n - 1 : 0;
	});

	// Beim Öffnen: Feld leeren, Auswahl zurücksetzen, fokussieren.
	$effect(() => {
		if (open) {
			q = '';
			sel = 0;
			queueMicrotask(() => inputEl?.focus());
		}
	});

	function close() {
		onClose();
	}
	function runAt(i: number) {
		const c = filtered[i];
		if (!c) return;
		close();
		// Nach dem Schließen ausführen, damit Navigation/Modal nicht hinter der Palette landet.
		queueMicrotask(() => c.run());
	}
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			sel = Math.min(sel + 1, filtered.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			sel = Math.max(sel - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			runAt(sel);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}
</script>

{#if open}
	<div class="cmd-backdrop" role="presentation" onclick={close}>
		<div
			class="cmd"
			role="dialog"
			aria-modal="true"
			aria-label={$t('cmd.title')}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="cmd-input">
				<span class="cmd-ico" aria-hidden="true">⌘</span>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					bind:this={inputEl}
					bind:value={q}
					type="text"
					placeholder={$t('cmd.placeholder')}
					aria-label={$t('cmd.placeholder')}
					onkeydown={onKeydown}
				/>
				<kbd>Esc</kbd>
			</div>
			<ul class="cmd-list" role="listbox" aria-label={$t('cmd.title')}>
				{#each filtered as c, i (c.id)}
					{@const Icon = c.icon}
					<li>
						<button
							class="cmd-item"
							class:sel={i === sel}
							role="option"
							aria-selected={i === sel}
							onmouseenter={() => (sel = i)}
							onclick={() => runAt(i)}
						>
							<span class="ci-ico" aria-hidden="true"><Icon size={16} /></span>
							<span class="ci-label">{c.label}</span>
							{#if c.hint}<span class="ci-hint">{c.hint}</span>{/if}
						</button>
					</li>
				{:else}
					<li class="cmd-empty">{$t('cmd.none')}</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style>
	.cmd-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(2px);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 12vh 16px 16px;
	}
	.cmd {
		width: 580px;
		max-width: 94vw;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-elev);
		border: 1px solid var(--border-strong, var(--border));
		border-radius: 14px;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	.cmd-input {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-bottom: 1px solid var(--border);
	}
	.cmd-ico {
		font-size: 15px;
		color: var(--text-muted);
	}
	.cmd-input input {
		flex: 1;
		background: none;
		border: 0;
		outline: none;
		color: var(--text);
		font-family: inherit;
		font-size: 15px;
	}
	.cmd-input kbd {
		font-size: 11px;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 2px 6px;
		background: var(--bg-card-2, transparent);
	}
	.cmd-list {
		list-style: none;
		margin: 0;
		padding: 6px;
		overflow-y: auto;
	}
	.cmd-item {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		text-align: left;
		background: none;
		border: 0;
		border-radius: 9px;
		padding: 9px 11px;
		cursor: pointer;
		font-family: inherit;
		font-size: 14px;
		color: var(--text);
	}
	.cmd-item.sel {
		background: var(--accent-soft);
		color: var(--text);
	}
	.cmd-item.sel .ci-label {
		color: var(--accent);
		font-weight: 600;
	}
	.ci-ico {
		flex: 0 0 auto;
		width: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}
	.ci-label {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ci-hint {
		flex: 0 0 auto;
		font-size: 11px;
		color: var(--text-muted);
		text-transform: capitalize;
		letter-spacing: 0.2px;
	}
	.cmd-empty {
		list-style: none;
		padding: 18px;
		text-align: center;
		color: var(--text-muted);
		font-size: 13px;
	}
</style>
