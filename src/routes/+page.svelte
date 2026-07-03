<script lang="ts">
	import { browser } from '$app/environment';
	import { Star, Dices, LoaderCircle, RefreshCw, ArrowDownAZ, FolderOpen, Plus, LayoutGrid, List, ChevronDown, ChevronRight, ChevronUp, EyeOff } from '@lucide/svelte';
	import { visibleProviders, favoriteProviders, favorites, toggleFavorite, providerOrder, setProviderOrder, setFavoritesOrder, collections, toggleCollectionCollapsed, providers as allProviders, unhideProvider } from '$lib/stores/providers';
	import { settings } from '$lib/stores/settings';
	import ProviderCard from '$lib/components/ProviderCard.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AddProviderModal from '$lib/components/AddProviderModal.svelte';
	import CollectionsModal from '$lib/components/CollectionsModal.svelte';
	import type { Provider } from '$lib/types';
	import { tmdb, openTitleInfo } from '$lib/tmdb';
	import { addToWatchlist, watchlist, isInWatchlist } from '$lib/stores/watchlist';
	import type { TmdbItem } from '$lib/types';
	import { openProvider, openUrlInApp } from '$lib/embedded';
	import { continueList, type ContinueEntry } from '$lib/stores/continue';
	import { searchHistory, addSearch, removeSearch, clearSearchHistory } from '$lib/stores/searchHistory';
	import { t } from '$lib/i18n';
	import { extractWatchProviders } from '$lib/watchProviders';
	import { pushToast } from '$lib/stores/toasts';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { refreshAll } from '$lib/stores/reachability';

	// Erreichbarkeit: bei Wiederverbindung und periodisch (alle 5 Min) auffrischen.
	function refreshReach(force = false) {
		if (get(settings).appearance.showReachability) refreshAll(get(visibleProviders), force);
	}
	onMount(() => {
		const onOnline = () => refreshReach(true);
		const onOffline = () => refreshReach(false);
		window.addEventListener('online', onOnline);
		window.addEventListener('offline', onOffline);
		const id = setInterval(() => refreshReach(false), 5 * 60 * 1000);
		return () => {
			window.removeEventListener('online', onOnline);
			window.removeEventListener('offline', onOffline);
			clearInterval(id);
		};
	});

	let search = $state('');
	let searchFocused = $state(false);
	let view: 'grid' | 'list' = $state('grid');
	// Ausgeblendete Anbieter (zum Wieder-Einblenden am Seitenende).
	let showHidden = $state(false);
	const hiddenList = $derived($allProviders.filter((p) => p.hidden));
	const CAT_KEY = 'omnisight:categoryFilter';
	const OLD_CAT_KEY = 'omnihub:categoryFilter';
	let categoryFilter = $state(browser ? (localStorage.getItem(CAT_KEY) ?? localStorage.getItem(OLD_CAT_KEY)) || 'all' : 'all');
	// Zuletzt gewählten Kategorie-Filter merken.
	$effect(() => {
		if (browser) {
			try { localStorage.setItem(CAT_KEY, categoryFilter); } catch { /* ignore */ }
		}
	});
	let showAdd = $state(false);
	let showCollections = $state(false);

	// Sammlungen mit aufgelösten (existierenden, sichtbaren) Anbietern; leere werden ausgeblendet.
	const collectionViews = $derived.by(() => {
		const provs = $visibleProviders;
		return $collections
			.map((c) => ({
				...c,
				items: c.providerIds.map((id) => provs.find((p) => p.id === id)).filter((p): p is Provider => !!p)
			}))
			.filter((c) => c.items.length > 0);
	});
	let tmdbResults = $state<TmdbItem[]>([]);
	let searching = $state(false);
	let searchToken = 0;
	let dragId = $state<string | null>(null);

	function reopenContinue(c: ContinueEntry) {
		openUrlInApp(c.label, c.url, c.id, c.subtitle, c.color, c.color2, c.poster);
	}

	// "Alle Anbieter": ohne Suche werden Favoriten ausgeblendet (sie stehen oben in
	// der Favoriten-Reihe). Reihenfolge: eigene (Drag&Drop) sonst alphabetisch.
	const sortedFiltered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		let list = $visibleProviders.filter((p) =>
			!q || p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
		);
		if (!q) list = list.filter((p) => !$favorites.includes(p.id));
		const order = $providerOrder;
		if (order.length) {
			list = [...list].sort((a, b) => {
				const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
				if (ia === -1 && ib === -1) return a.name.localeCompare(b.name, 'de');
				if (ia === -1) return 1;
				if (ib === -1) return -1;
				return ia - ib;
			});
		} else {
			list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'de'));
		}
		return list;
	});

	const CAT_ORDER = ['film-serien', 'anime', 'live-tv', 'mediathek', 'sport', 'musik', 'video', 'eigene'];
	const availableCats = $derived(CAT_ORDER.filter((c) => $visibleProviders.some((p) => p.category === c)));
	// Anzahl Anbieter je Kategorie (für die Zahl am Filter-Chip).
	const catCounts = $derived.by(() => {
		const m: Record<string, number> = {};
		for (const p of $visibleProviders) m[p.category] = (m[p.category] ?? 0) + 1;
		return m;
	});
	// „Überrasch mich" – zufälligen Anbieter wählen UND einen zufälligen Titel,
	// der bei genau diesem Anbieter (DE) läuft, direkt dort öffnen.
	// Findet sich kein passender Titel (z.B. Nische/keine TMDB-Daten), wird der
	// Anbieter normal geöffnet (ehrlicher Fallback).
	let surprising = $state(false);
	async function surprise() {
		const list = $visibleProviders;
		if (!list.length || surprising) return;
		const p = list[Math.floor(Math.random() * list.length)];
		surprising = true;
		try {
			const pool = (await tmdb.trending()) ?? [];
			const shuffled = [...pool].sort(() => Math.random() - 0.5);
			let tries = 0;
			for (const item of shuffled) {
				if (tries >= 8) break;
				tries++;
				const mt = item.media_type === 'tv' ? 'tv' : 'movie';
				const d = await tmdb.details(mt, item.id);
				const match = extractWatchProviders(d, item.title).find((w) => w.id === p.id);
				if (match) {
					const art = item.poster ?? null;
					openUrlInApp(item.title, match.url, p.id, p.name, p.color, p.color2 ?? p.color, art);
					pushToast(get(t)('home.surpriseHit', { title: item.title, provider: p.name }), undefined, '🎲', 3200);
					return;
				}
			}
		} catch (e) {
			console.warn('[surprise] TMDB-Abgleich fehlgeschlagen:', e);
		} finally {
			surprising = false;
		}
		// Fallback: Anbieter ohne konkreten Titel öffnen.
		openProvider(p);
	}
	// Gemerkte Kategorie ohne Anbieter? -> zurück auf „Alle" (sonst leere Ansicht).
	$effect(() => {
		if (categoryFilter !== 'all' && availableCats.length > 0 && !availableCats.includes(categoryFilter)) {
			categoryFilter = 'all';
		}
	});
	// Anzeige = volle (sortierte) Liste, danach nach Kategorie gefiltert. Das Drag&Drop
	// arbeitet weiter auf der vollen Liste (sortedFiltered), damit die globale
	// Reihenfolge auch bei aktivem Filter nicht durcheinanderkommt.
	const displayed = $derived(
		sortedFiltered.filter((p) => categoryFilter === 'all' || p.category === categoryFilter)
	);

	let dragOverId = $state<string | null>(null);
	function startDrag(e: DragEvent, id: string) {
		dragId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			try {
				e.dataTransfer.setData('text/plain', id);
			} catch {
				/* ignore */
			}
		}
	}
	function endDrag() {
		dragId = null;
		dragOverId = null;
	}
	function onDrop(targetId: string) {
		dragOverId = null;
		if (!dragId || dragId === targetId) { dragId = null; return; }
		const ids = sortedFiltered.map((p) => p.id);
		const from = ids.indexOf(dragId), to = ids.indexOf(targetId);
		if (from === -1 || to === -1) { dragId = null; return; }
		ids.splice(to, 0, ids.splice(from, 1)[0]);
		setProviderOrder(ids);
		dragId = null;
	}

	// Eigene Drag-Zustände für die Favoriten-Reihe (nicht mit „Alle Anbieter" vermischen).
	let favDragId = $state<string | null>(null);
	let favDragOverId = $state<string | null>(null);
	function favStart(e: DragEvent, id: string) {
		favDragId = id;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			try {
				e.dataTransfer.setData('text/plain', id);
			} catch {
				/* ignore */
			}
		}
	}
	function favEnd() {
		favDragId = null;
		favDragOverId = null;
	}
	function onFavDrop(targetId: string) {
		favDragOverId = null;
		const dId = favDragId;
		favDragId = null;
		if (!dId || dId === targetId) return;
		const visible = $favoriteProviders.map((p) => p.id);
		const from = visible.indexOf(dId), to = visible.indexOf(targetId);
		if (from === -1 || to === -1) return;
		visible.splice(to, 0, visible.splice(from, 1)[0]);
		// evtl. ausgeblendete Favoriten (nicht in der Reihe sichtbar) hinten anhängen.
		const others = $favorites.filter((id) => !visible.includes(id));
		setFavoritesOrder([...visible, ...others]);
	}

	// Wenn die Suche keine Anbieter findet -> TMDB anfragen (mit Debounce)
	$effect(() => {
		const q = search.trim();
		if (q.length < 3) { tmdbResults = []; return; }
		const token = ++searchToken;
		const t = setTimeout(async () => {
			searching = true;
			const res = (await tmdb.search(q)) ?? [];
			if (token === searchToken) { tmdbResults = res.slice(0, 12); searching = false; }
		}, 350);
		return () => clearTimeout(t);
	});
</script>

<AddProviderModal open={showAdd} close={() => (showAdd = false)} />
{#if showCollections}
	<CollectionsModal onClose={() => (showCollections = false)} />
{/if}

<div class="page">
	<header class="top">
		<div class="search">
			<span class="ic">🔎</span>
			<input
				data-omni-search
				type="text"
				placeholder={$t('home.searchPh')}
				bind:value={search}
				onfocus={() => (searchFocused = true)}
				onblur={() => setTimeout(() => (searchFocused = false), 150)}
				onkeydown={(e) => { if (e.key === 'Enter') addSearch(search); }}
			/>
		</div>
		<div class="tools">
			<button class="tool" class:busy={surprising} title={$t('home.surprise')} onclick={surprise} aria-label={$t('home.surpriseAria')} disabled={surprising}>{#if surprising}<LoaderCircle size={16} class="spin" />{:else}<Dices size={16} />{/if}</button>
			{#if $settings.appearance.showReachability}
				<button class="tool" title={$t('reach.refresh')} aria-label={$t('reach.refresh')} onclick={() => refreshReach(true)}><RefreshCw size={16} /></button>
			{/if}
			<button class="tool" title={$t('home.sortAZ')} onclick={() => setProviderOrder([])}><ArrowDownAZ size={16} /></button>
			<button class="tool" title={$t('home.collections')} onclick={() => (showCollections = true)} aria-label={$t('home.collections')}><FolderOpen size={16} /></button>
			<button class="primary" onclick={() => (showAdd = true)}><Plus size={16} /> {$t('home.addProvider')}</button>
			<div class="view">
				<button class:active={view === 'grid'} onclick={() => (view = 'grid')} aria-label={$t('home.gridAria')} title={$t('home.grid')}><LayoutGrid size={15} /></button>
				<button class:active={view === 'list'} onclick={() => (view = 'list')} aria-label={$t('home.listAria')} title={$t('home.list')}><List size={15} /></button>
			</div>
		</div>
	</header>

	{#if searchFocused && !search.trim() && $searchHistory.length}
		<div class="searchhist">
			<span class="sh-label">{$t('home.recentSearch')}</span>
			{#each $searchHistory as term (term)}
				<span class="sh-chip">
					<button class="sh-term" onclick={() => (search = term)} title={$t('home.searchAgain', { term })}>{term}</button>
					<button class="sh-x" onclick={() => removeSearch(term)} title={$t('common.remove')} aria-label={$t('home.removeFromHistory')}>✕</button>
				</span>
			{/each}
			<button class="sh-clear" onclick={() => clearSearchHistory()}>leeren</button>
		</div>
	{/if}

	{#if $continueList.length && !search && $settings.plugins.continueWatching}
		{@const c = $continueList[0]}
		<button class="cont-resume" onclick={() => reopenContinue(c)} title={$t('home.resumeTitle', { label: c.label })} style="--c1: {c.color}; --c2: {c.color2}">
			{#if c.poster}<img class="cr-poster" src={c.poster} alt={c.label} />{:else}<span class="cr-logo">▶</span>{/if}
			<span class="cr-meta">
				<span class="cr-kicker">▶ {$t('home.resume')}</span>
				<span class="cr-title">{c.label}</span>
				{#if c.subtitle}<span class="cr-sub">{c.subtitle}</span>{/if}
			</span>
			<span class="cr-cta">{$t('home.resumeCta')} ▶</span>
		</button>
	{/if}

	{#if $favoriteProviders.length && !search}
		<div class="section-label"><Star size={15} /> {$t('home.favorites')} <span class="hint-inline">· {$t('home.dragToSort')}</span></div>
		<div class="grid favs">
			{#each $favoriteProviders as p (p.id)}
				<div
					class="dragwrap"
					class:dragging={favDragId === p.id}
					class:dragover={favDragOverId === p.id && favDragId !== p.id}
					role="listitem"
					draggable="true"
					ondragstart={(e) => favStart(e, p.id)}
					ondragend={favEnd}
					ondragover={(e) => e.preventDefault()}
					ondragenter={() => (favDragOverId = p.id)}
					ondrop={(e) => { e.preventDefault(); onFavDrop(p.id); }}
				>
					<ProviderCard provider={p} />
				</div>
			{/each}
		</div>
	{/if}

	{#if collectionViews.length && !search}
		{#each collectionViews as col (col.id)}
			<div class="section-label col-label">
				<button class="col-toggle" onclick={() => toggleCollectionCollapsed(col.id)}>
					<span class="chev">{#if col.collapsed}<ChevronRight size={13} />{:else}<ChevronDown size={13} />{/if}</span> <FolderOpen size={14} /> {col.name}
					<span class="hint-inline">· {col.items.length}</span>
				</button>
			</div>
			{#if !col.collapsed}
				<div class="grid favs">
					{#each col.items as p (p.id)}
						<ProviderCard provider={p} />
					{/each}
				</div>
			{/if}
		{/each}
	{/if}

	<div class="section-label">{$t('home.allProviders')} <span class="hint-inline">· {$t('home.dragCards')}</span></div>
	{#if availableCats.length > 1}
		<div class="catbar">
			<button class="cat" class:on={categoryFilter === 'all'} onclick={() => (categoryFilter = 'all')}>{$t('cat.all')} <span class="cnt">{$visibleProviders.length}</span></button>
			{#each availableCats as c (c)}
				<button class="cat" class:on={categoryFilter === c} onclick={() => (categoryFilter = c)}>{$t('cat.' + c)} <span class="cnt">{catCounts[c] ?? 0}</span></button>
			{/each}
		</div>
	{/if}
	{#if displayed.length === 0}
		<p class="empty-cat">{$t('home.emptyCat')}</p>
	{:else if view === 'grid'}
		<div class="grid all">
			{#each displayed as p (p.id)}
				<div
					class="dragwrap"
					class:dragging={dragId === p.id}
					class:dragover={dragOverId === p.id && dragId !== p.id}
					role="listitem"
					draggable="true"
					ondragstart={(e) => startDrag(e, p.id)}
					ondragend={endDrag}
					ondragover={(e) => e.preventDefault()}
					ondragenter={() => (dragOverId = p.id)}
					ondrop={(e) => { e.preventDefault(); onDrop(p.id); }}
				>
					<ProviderCard provider={p} size="large" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="list">
			{#each displayed as p (p.id)}
				<div
					class="lrow"
					class:dragging={dragId === p.id}
					class:dragover={dragOverId === p.id && dragId !== p.id}
					draggable="true"
					ondragstart={(e) => startDrag(e, p.id)}
					ondragend={endDrag}
					ondragover={(e) => e.preventDefault()}
					ondragenter={() => (dragOverId = p.id)}
					ondrop={(e) => { e.preventDefault(); onDrop(p.id); }}
					style="--c1: {p.color}; --c2: {p.color2 ?? p.color}"
				>
					<span class="lgrip" title={$t('common.dragSort')}>⠿</span>
					<button class="lopen" onclick={() => openProvider(p)} title={$t('home.openTitle', { name: p.name })}>
						<Logo provider={p} size={34} />
						<span class="lname">{p.name}</span>
						<span class="lsub">{p.subtitle}</span>
					</button>
					<span class="lq">{p.quality}</span>
					<button
						class="lfav"
						class:on={$favorites.includes(p.id)}
						onclick={() => toggleFavorite(p.id)}
						aria-label={$t('home.toggleFavorite')}
						title={$favorites.includes(p.id) ? $t('home.favorite') : $t('home.toFavorites')}
					>{$favorites.includes(p.id) ? '★' : '☆'}</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if search.trim().length >= 3}
		<div class="section-label" style="margin-top: 26px">{$t('home.tmdbSection')}</div>
		{#if searching}
			<p class="muted">Suche läuft…</p>
		{:else if tmdbResults.length === 0}
			<p class="muted">Keine TMDB-Treffer. Ist der API-Key in <code>src-tauri/src/tmdb.rs</code> eingetragen?</p>
		{:else}
			<div class="tmdb">
				{#each tmdbResults as t (t.media_type + '-' + t.id)}
					<div class="tcard omni-card">
						<button class="thumb" onclick={() => openTitleInfo(t)} aria-label={`Infos zu ${t.title}`}>
							{#if t.poster}
								<img src={t.poster} alt={t.title} loading="lazy" decoding="async" />
							{:else}
								<div class="noimg">?</div>
							{/if}
						</button>
						<div class="tmeta">
							<button class="tt tt-btn" onclick={() => openTitleInfo(t)}>{t.title}</button>
							<div class="ts">{t.media_type === 'tv' ? 'Serie' : 'Film'}{t.release_date ? ' · ' + t.release_date.slice(0, 4) : ''}</div>
							<button
								class="add"
								disabled={isInWatchlist($watchlist, t.id, t.media_type)}
								onclick={() => addToWatchlist(t)}
							>
								{isInWatchlist($watchlist, t.id, t.media_type) ? '✓ gemerkt' : '+ Watchlist'}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
	{#if hiddenList.length}
		<div class="section-label" style="margin-top: 26px">
			<EyeOff size={15} /> {$t('home.hiddenSection')} ({hiddenList.length})
			<button class="hidden-toggle" onclick={() => (showHidden = !showHidden)} aria-expanded={showHidden}>{#if showHidden}<ChevronUp size={14} />{:else}<ChevronDown size={14} />{/if}</button>
		</div>
		{#if showHidden}
			<div class="hidden-list">
				{#each hiddenList as p (p.id)}
					<div class="hidden-chip">
						<Logo provider={p} size={22} />
						<span class="hc-name">{p.name}</span>
						<button class="hc-show" onclick={() => unhideProvider(p.id)}>{$t('home.unhide')}</button>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { padding: 22px 28px 36px; max-width: none; width: 100%; box-sizing: border-box; }
	.hint-inline { font-size: 11px; font-weight: 500; color: var(--text-dim); }
	.hidden-toggle { background: none; border: 0; color: var(--text-muted); cursor: pointer; font-size: 11px; padding: 2px 6px; }
	.hidden-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
	.hidden-chip { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card); }
	.hc-name { font-size: 13px; font-weight: 600; color: var(--text-muted); }
	.hc-show { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
	.hc-show:hover { background: color-mix(in srgb, var(--accent) 26%, transparent); }
	.dragwrap { position: relative; cursor: grab; }
	.dragwrap:active { cursor: grabbing; }
	.dragwrap.dragging, .lrow.dragging { opacity: 0.4; }
	.dragwrap.dragover { outline: 2px dashed var(--accent); outline-offset: 3px; border-radius: 18px; }
	.lrow.dragover { outline: 2px dashed var(--accent); outline-offset: -2px; }
	/* Bilder/Logos nicht einzeln ziehbar – so wird die ganze Karte gezogen. */
	.dragwrap :global(img), .dragwrap :global(svg), .lrow :global(img), .lrow :global(svg) { -webkit-user-drag: none; }
	.top { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; flex-wrap: wrap; }
	.searchhist { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: -8px 0 20px; }
	.sh-label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-right: 2px; }
	.sh-chip { display: inline-flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 999px; overflow: hidden; transition: border-color 0.14s; }
	.sh-chip:hover { border-color: var(--border-strong); }
	.sh-term { background: transparent; border: 0; color: var(--text); font-family: inherit; font-size: 12.5px; font-weight: 500; padding: 5px 4px 5px 12px; cursor: pointer; }
	.sh-x { background: transparent; border: 0; color: var(--text-muted); cursor: pointer; font-size: 10px; padding: 5px 9px 5px 5px; }
	.sh-x:hover { color: var(--text); }
	.sh-clear { background: transparent; border: 0; color: var(--text-muted); font-family: inherit; font-size: 12px; cursor: pointer; padding: 4px 6px; text-decoration: underline; }
	.sh-clear:hover { color: var(--text); }
	.search { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 16px; }
	.search input { flex: 1; background: transparent; border: 0; outline: 0; color: var(--text); font-size: 14px; font-family: inherit; }
	.ic { color: var(--text-muted); font-size: 14px; }
	.tools { display: flex; gap: 8px; align-items: center; }
	.tool, .view button, .primary {
		background: var(--bg-card); border: 1px solid var(--border);
		color: var(--text-muted); padding: 9px 14px; border-radius: 12px;
		cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600;
		display: inline-flex; align-items: center; justify-content: center; gap: 6px;
	}
	.primary { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); display: inline-flex; gap: 6px; align-items: center; }
	.view { display: flex; gap: 4px; }
	.view button { padding: 8px 12px; }
	.view button.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }

	.cont-resume {
		display: flex; align-items: center; gap: 16px; width: 100%; text-align: left;
		background: linear-gradient(100deg, color-mix(in srgb, var(--c1, var(--accent)) 28%, var(--bg-elev)), var(--bg-elev) 72%);
		border: 1px solid color-mix(in srgb, var(--c1, var(--accent)) 35%, var(--border));
		border-radius: 16px; padding: 14px 18px; margin: 4px 0 24px; cursor: pointer;
		font-family: inherit; transition: transform 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease;
	}
	.cont-resume:hover { transform: translateY(-2px); border-color: var(--c1, var(--accent)); box-shadow: 0 10px 28px -12px color-mix(in srgb, var(--c1, var(--accent)) 60%, transparent); }
	.cr-poster { width: 52px; height: 78px; object-fit: cover; border-radius: 9px; flex-shrink: 0; }
	.cr-logo { width: 52px; height: 78px; border-radius: 9px; background: var(--c1, var(--accent)); color: #fff; display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }
	.cr-meta { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
	.cr-kicker { font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; color: var(--c1, var(--accent)); }
	.cr-title { font-size: 18px; font-weight: 800; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.cr-sub { font-size: 12.5px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.cr-cta { flex-shrink: 0; background: var(--accent); color: var(--accent-text); font-weight: 700; font-size: 13px; padding: 9px 16px; border-radius: 10px; white-space: nowrap; }
	.col-label { padding: 0; }
	.col-toggle { display: inline-flex; align-items: center; gap: 7px; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; font-family: inherit; font-size: inherit; font-weight: inherit; color: inherit; }
	.col-toggle .chev { color: var(--text-muted); width: 14px; display: inline-flex; align-items: center; }
	.col-toggle:hover { color: var(--accent); }
	.catbar { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 16px; }
	.cat { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 600; padding: 6px 13px; border-radius: 999px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
	.cat:hover { border-color: var(--border-strong); color: var(--text); }
	.cat.on { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
	.cat .cnt { font-size: 11px; font-weight: 700; opacity: 0.7; margin-left: 2px; }
	.cat.on .cnt { opacity: 0.85; }
	.empty-cat { color: var(--text-muted); padding: 8px 2px 20px; }

	.grid.favs { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; margin-bottom: 22px; }
	.grid.all { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }

	.list { display: flex; flex-direction: column; gap: 8px; }
	.lrow {
		display: flex; align-items: center; gap: 14px;
		background: var(--bg-card); border: 1px solid var(--border);
		border-radius: 12px; padding: 8px 14px 8px 8px;
		border-left: 3px solid var(--c1);
	}
	.lrow:hover { border-color: var(--border-strong); }
	.lgrip { color: var(--text-dim); font-size: 14px; cursor: grab; padding: 0 2px; user-select: none; }
	.lgrip:active { cursor: grabbing; }
	.lopen {
		display: flex; align-items: center; gap: 12px; flex: 1;
		background: transparent; border: 0; color: var(--text); cursor: pointer;
		text-align: left; font-family: inherit; min-width: 0;
	}
	.lname { font-weight: 700; font-size: 14px; }
	.lsub { color: var(--text-muted); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.lq { font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--bg-card-2); padding: 3px 8px; border-radius: 999px; }
	.lfav { background: transparent; border: 0; color: var(--text-dim); font-size: 18px; cursor: pointer; }
	.lfav.on { color: #facc15; }

	.tmdb { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
	.tcard { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
	.thumb { padding: 0; border: 0; background: none; cursor: pointer; display: block; width: 100%; }
	.tcard img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; transition: transform 0.25s ease, filter 0.25s ease; }
	.thumb:hover img { transform: scale(1.04); filter: brightness(1.06); }
	.noimg { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); color: var(--text-dim); font-size: 32px; }
	.tmeta { padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
	.tt { font-weight: 600; font-size: 13px; line-height: 1.25; }
	.tt-btn { padding: 0; border: 0; background: none; color: var(--text); text-align: left; cursor: pointer; font-family: inherit; }
	.tt-btn:hover { color: var(--accent); }
	.ts { color: var(--text-muted); font-size: 11.5px; }
	.add {
		margin-top: 6px; background: var(--accent-soft); color: var(--accent);
		border: 1px solid var(--accent); padding: 6px 10px; border-radius: 8px;
		cursor: pointer; font-size: 12px; font-weight: 600;
	}
	.add:disabled { opacity: 0.6; cursor: default; }
	.muted { color: var(--text-muted); font-size: 13px; }
	code { background: var(--bg-card); padding: 1px 6px; border-radius: 5px; }
</style>
