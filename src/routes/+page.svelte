<script lang="ts">
	import { browser } from '$app/environment';
	import { visibleProviders, favoriteProviders, favorites, toggleFavorite, providerOrder, setProviderOrder, setFavoritesOrder } from '$lib/stores/providers';
	import { settings } from '$lib/stores/settings';
	import ProviderCard from '$lib/components/ProviderCard.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AddProviderModal from '$lib/components/AddProviderModal.svelte';
	import { tmdb, openTitleInfo } from '$lib/tmdb';
	import { addToWatchlist, watchlist, isInWatchlist } from '$lib/stores/watchlist';
	import type { TmdbItem } from '$lib/types';
	import { openProvider, openUrlInApp } from '$lib/embedded';
	import { continueList, type ContinueEntry } from '$lib/stores/continue';
	import { searchHistory, addSearch, removeSearch, clearSearchHistory } from '$lib/stores/searchHistory';

	let search = $state('');
	let searchFocused = $state(false);
	let view: 'grid' | 'list' = $state('grid');
	const CAT_KEY = 'omnihub:categoryFilter';
	let categoryFilter = $state(browser ? localStorage.getItem(CAT_KEY) || 'all' : 'all');
	// Zuletzt gewählten Kategorie-Filter merken.
	$effect(() => {
		if (browser) {
			try { localStorage.setItem(CAT_KEY, categoryFilter); } catch { /* ignore */ }
		}
	});
	let showAdd = $state(false);
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

	const CAT_LABELS: Record<string, string> = {
		'film-serien': 'Filme & Serien',
		anime: 'Anime',
		'live-tv': 'Live-TV',
		mediathek: 'Mediatheken',
		sport: 'Sport',
		musik: 'Musik',
		video: 'Video',
		eigene: 'Eigene'
	};
	const CAT_ORDER = ['film-serien', 'anime', 'live-tv', 'mediathek', 'sport', 'musik', 'video', 'eigene'];
	const availableCats = $derived(CAT_ORDER.filter((c) => $visibleProviders.some((p) => p.category === c)));
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

<div class="page">
	<header class="top">
		<div class="search">
			<span class="ic">🔎</span>
			<input
				data-omni-search
				type="text"
				placeholder="Anbieter, Film, Serie, YouTube-URL…"
				bind:value={search}
				onfocus={() => (searchFocused = true)}
				onblur={() => setTimeout(() => (searchFocused = false), 150)}
				onkeydown={(e) => { if (e.key === 'Enter') addSearch(search); }}
			/>
		</div>
		<div class="tools">
			<button class="tool" title="Wieder alphabetisch sortieren (eigene Reihenfolge verwerfen)" onclick={() => setProviderOrder([])}>A↓Z</button>
			<button class="primary" onclick={() => (showAdd = true)}><span>＋</span> Anbieter</button>
			<div class="view">
				<button class:active={view === 'grid'} onclick={() => (view = 'grid')} aria-label="Rasteransicht" title="Raster">▦</button>
				<button class:active={view === 'list'} onclick={() => (view = 'list')} aria-label="Listenansicht" title="Liste">≡</button>
			</div>
		</div>
	</header>

	{#if searchFocused && !search.trim() && $searchHistory.length}
		<div class="searchhist">
			<span class="sh-label">Zuletzt gesucht</span>
			{#each $searchHistory as term (term)}
				<span class="sh-chip">
					<button class="sh-term" onclick={() => (search = term)} title={`Erneut nach „${term}" suchen`}>{term}</button>
					<button class="sh-x" onclick={() => removeSearch(term)} title="Entfernen" aria-label="Aus Suchverlauf entfernen">✕</button>
				</span>
			{/each}
			<button class="sh-clear" onclick={() => clearSearchHistory()}>leeren</button>
		</div>
	{/if}

	{#if $continueList.length && !search && $settings.plugins.continueWatching}
		<button class="cont-resume" onclick={() => reopenContinue($continueList[0])} title={`„${$continueList[0].label}" fortsetzen`}>
			<span class="cr-play">▶</span>
			<span class="cr-label">Weiterschauen</span>
			<span class="cr-title">{$continueList[0].label}</span>
		</button>
	{/if}

	{#if $favoriteProviders.length && !search}
		<div class="section-label">⭐ Favoriten <span class="hint-inline">· ziehen zum Sortieren</span></div>
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

	<div class="section-label">Alle Anbieter <span class="hint-inline">· Karten zum Sortieren ziehen</span></div>
	{#if availableCats.length > 1}
		<div class="catbar">
			<button class="cat" class:on={categoryFilter === 'all'} onclick={() => (categoryFilter = 'all')}>Alle</button>
			{#each availableCats as c (c)}
				<button class="cat" class:on={categoryFilter === c} onclick={() => (categoryFilter = c)}>{CAT_LABELS[c] ?? c}</button>
			{/each}
		</div>
	{/if}
	{#if displayed.length === 0}
		<p class="empty-cat">Keine Anbieter in dieser Kategorie.</p>
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
					<span class="lgrip" title="Zum Sortieren ziehen">⠿</span>
					<button class="lopen" onclick={() => openProvider(p)} title={`${p.name} öffnen`}>
						<Logo provider={p} size={34} />
						<span class="lname">{p.name}</span>
						<span class="lsub">{p.subtitle}</span>
					</button>
					<span class="lq">{p.quality}</span>
					<button
						class="lfav"
						class:on={$favorites.includes(p.id)}
						onclick={() => toggleFavorite(p.id)}
						aria-label="Favorit umschalten"
						title={$favorites.includes(p.id) ? 'Favorit' : 'Zu Favoriten'}
					>{$favorites.includes(p.id) ? '★' : '☆'}</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if search.trim().length >= 3}
		<div class="section-label" style="margin-top: 26px">Filme & Serien (TMDB)</div>
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
</div>

<style>
	.page { padding: 22px 28px 36px; max-width: none; width: 100%; box-sizing: border-box; }
	.hint-inline { font-size: 11px; font-weight: 500; color: var(--text-dim); }
	.dragwrap { position: relative; cursor: grab; }
	.dragwrap:active { cursor: grabbing; }
	.dragwrap.dragging, .lrow.dragging { opacity: 0.4; }
	.dragwrap.dragover { outline: 2px dashed var(--accent); outline-offset: 3px; border-radius: 18px; }
	.lrow.dragover { outline: 2px dashed var(--accent); outline-offset: -2px; }
	/* Bilder/Logos nicht einzeln ziehbar – so wird die ganze Karte gezogen. */
	.dragwrap :global(img), .dragwrap :global(svg), .lrow :global(img), .lrow :global(svg) { -webkit-user-drag: none; }
	.top { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; }
	.searchhist { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: -8px 0 20px; }
	.sh-label { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-right: 2px; }
	.sh-chip { display: inline-flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: 999px; overflow: hidden; transition: border-color 0.14s; }
	.sh-chip:hover { border-color: var(--border-strong); }
	.sh-term { background: transparent; border: 0; color: var(--text); font-family: inherit; font-size: 12.5px; font-weight: 500; padding: 5px 4px 5px 12px; cursor: pointer; }
	.sh-x { background: transparent; border: 0; color: var(--text-muted); cursor: pointer; font-size: 10px; padding: 5px 9px 5px 5px; }
	.sh-x:hover { color: var(--text); }
	.sh-clear { background: transparent; border: 0; color: var(--text-muted); font-family: inherit; font-size: 12px; cursor: pointer; padding: 4px 6px; text-decoration: underline; }
	.sh-clear:hover { color: var(--text); }
	.search { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 9px 16px; }
	.search input { flex: 1; background: transparent; border: 0; outline: 0; color: var(--text); font-size: 14px; font-family: inherit; }
	.ic { color: var(--text-muted); font-size: 14px; }
	.tools { display: flex; gap: 8px; align-items: center; }
	.tool, .view button, .primary {
		background: var(--bg-card); border: 1px solid var(--border);
		color: var(--text-muted); padding: 9px 14px; border-radius: 12px;
		cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600;
	}
	.primary { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); display: inline-flex; gap: 6px; align-items: center; }
	.view { display: flex; gap: 4px; }
	.view button { padding: 8px 12px; }
	.view button.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }

	.cont-resume { display: inline-flex; align-items: center; gap: 9px; background: none; border: 0; padding: 0; margin: 4px 0 12px; cursor: pointer; font-family: inherit; font-size: 13px; }
	.cr-play { width: 24px; height: 24px; border-radius: 999px; background: var(--accent); color: var(--accent-text); display: grid; place-items: center; font-size: 10px; flex-shrink: 0; }
	.cr-label { color: var(--text); font-weight: 700; }
	.cr-title { color: var(--text-muted); max-width: 340px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.cont-resume:hover .cr-label, .cont-resume:hover .cr-title { color: var(--accent); }
	.catbar { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 16px; }
	.cat { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 600; padding: 6px 13px; border-radius: 999px; cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s; }
	.cat:hover { border-color: var(--border-strong); color: var(--text); }
	.cat.on { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
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
