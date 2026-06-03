<script lang="ts">
	import { get } from 'svelte/store';
	import { writable } from 'svelte/store';
	import { t, tr } from '$lib/i18n';
	import { settings } from '$lib/stores/settings';
	import { watchlist, removeFromWatchlist, setRating, toggleSeen } from '$lib/stores/watchlist';
	import { visibleProviders } from '$lib/stores/providers';
	import { tmdb, openTitleInfo } from '$lib/tmdb';
	import { extractWatchProviders } from '$lib/watchProviders';
	import { openUrlInApp } from '$lib/embedded';
	import { pushToast } from '$lib/stores/toasts';
	import type { WatchlistItem, TmdbItem } from '$lib/types';

	// „Verfügbar bei dir": je Titel die DE-Anbieter von TMDB holen und auf die
	// eigenen (sichtbaren) Anbieter filtern. Ergebnis wird gecacht.
	type AvailProv = { id: string; name: string; url: string; logo: string };
	const availability = writable<Record<string, AvailProv[]>>({});
	const fetching = new Set<string>();

	async function ensureAvailability(item: WatchlistItem): Promise<void> {
		const key = item.mediaType + '-' + item.tmdbId;
		if (fetching.has(key)) return;
		fetching.add(key);
		const mt = (item.mediaType === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
		const d = await tmdb.details(mt, item.tmdbId);
		const myIds = new Set(get(visibleProviders).map((p) => p.id));
		const provs = extractWatchProviders(d as Record<string, unknown>, item.title).filter((w) => myIds.has(w.id));
		availability.update((a) => ({ ...a, [key]: provs }));
	}

	// Für alle (auch neu hinzugefügten) Watchlist-Titel je einmal abrufen.
	$: for (const it of $watchlist) {
		const k = it.mediaType + '-' + it.tmdbId;
		if (!fetching.has(k)) ensureAvailability(it);
	}

	function openAt(w: WatchlistItem, pv: AvailProv): void {
		const prov = get(visibleProviders).find((p) => p.id === pv.id);
		openUrlInApp(w.title, pv.url, pv.id, pv.name, prov?.color ?? '#30c5bb', prov?.color2 ?? '#1f6f6a', w.poster ?? null);
	}

	// Empfehlungen „Weil du … gemerkt hast": Seeds (bewertet, dann zuletzt) -> TMDB-Empfehlungen.
	const recCache = writable<Record<string, TmdbItem[]>>({});
	const recFetching = new Set<string>();

	$: seeds = [...$watchlist]
		.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.addedAt - a.addedAt)
		.slice(0, 3);

	async function ensureRecs(seed: WatchlistItem): Promise<void> {
		const key = seed.mediaType + '-' + seed.tmdbId;
		if (recFetching.has(key)) return;
		recFetching.add(key);
		const mt = (seed.mediaType === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
		const res = (await tmdb.list(`/${mt}/${seed.tmdbId}/recommendations`, [], mt)) ?? [];
		const have = new Set(get(watchlist).map((w) => w.mediaType + '-' + w.tmdbId));
		const items = res
			.filter((r) => r.poster && !have.has((r.media_type === 'tv' ? 'tv' : 'movie') + '-' + r.id))
			.slice(0, 14);
		recCache.update((c) => ({ ...c, [key]: items }));
	}

	$: for (const s of seeds) {
		const k = s.mediaType + '-' + s.tmdbId;
		if (!recFetching.has(k)) ensureRecs(s);
	}

	// Lokales Datum als YYYY-MM-DD (vermeidet Zeitzonen-Versatz von toISOString).
	function ymd(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	function dayLabel(dateStr: string, lg: 'de' | 'en', loc: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		const t0 = new Date();
		t0.setHours(0, 0, 0, 0);
		const diff = Math.round((date.getTime() - t0.getTime()) / 86400000);
		if (diff <= 0) return tr(lg, 'cal.today');
		if (diff === 1) return tr(lg, 'cal.tomorrow');
		return date.toLocaleDateString(loc, { weekday: 'long' });
	}

	$: lang = ($settings.appearance.language === 'en' ? 'en' : 'de') as 'de' | 'en';
	$: locale = lang === 'en' ? 'en-US' : 'de-DE';
	$: today = ymd(new Date());
	$: weekEnd = (() => { const d = new Date(); d.setDate(d.getDate() + 6); return ymd(d); })();
	$: releasesWeek = $watchlist
		.filter((x) => x.releaseDate && x.releaseDate >= today && x.releaseDate <= weekEnd)
		.sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''));

	let sortBy = 'added-desc';
	let typeFilter: 'all' | 'movie' | 'tv' = 'all';
	let seenFilter: 'all' | 'seen' | 'unseen' = 'all';
	let q = '';

	function sortList(list: WatchlistItem[], by: string): WatchlistItem[] {
		const arr = [...list];
		switch (by) {
			case 'added-asc': return arr.sort((a, b) => a.addedAt - b.addedAt);
			case 'title-asc': return arr.sort((a, b) => a.title.localeCompare(b.title, 'de'));
			case 'title-desc': return arr.sort((a, b) => b.title.localeCompare(a.title, 'de'));
			case 'date-desc': return arr.sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
			case 'date-asc': return arr.sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''));
			case 'rating-desc': return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.addedAt - a.addedAt);
			default: return arr.sort((a, b) => b.addedAt - a.addedAt);
		}
	}
	$: filtered = $watchlist
		.filter((w) => typeFilter === 'all' || w.mediaType === typeFilter)
		.filter((w) => seenFilter === 'all' || (seenFilter === 'seen' ? !!w.seen : !w.seen))
		.filter((w) => !q.trim() || w.title.toLowerCase().includes(q.trim().toLowerCase()));
	$: shown = sortList(filtered, sortBy);
	function resetFilters() { sortBy = 'added-desc'; typeFilter = 'all'; seenFilter = 'all'; q = ''; }

	let fileInput: HTMLInputElement;

	function openInfo(w: WatchlistItem) {
		openTitleInfo({
			id: w.tmdbId,
			media_type: w.mediaType,
			title: w.title,
			overview: w.overview,
			poster: w.poster,
			backdrop: null,
			release_date: w.releaseDate,
			vote_average: null
		});
	}

	function exportWatchlist() {
		const items = get(watchlist);
		if (items.length === 0) {
			pushToast(get(t)('wl.toastNothingTitle'), get(t)('wl.toastNothingBody'), 'ℹ️', 2400);
			return;
		}
		const data = JSON.stringify({ app: 'OmniHub', type: 'watchlist', version: 1, items }, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'omnihub-watchlist.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		pushToast(get(t)('wl.toastExportedTitle'), get(t)('wl.toastExportedBody', { n: items.length }), '📤', 2600);
	}

	function triggerImport() {
		fileInput?.click();
	}

	function normalize(o: any): WatchlistItem | null {
		const tmdbId = o?.tmdbId ?? o?.id;
		const mediaType = o?.mediaType ?? o?.media_type;
		if (!tmdbId || (mediaType !== 'movie' && mediaType !== 'tv')) return null;
		return {
			tmdbId,
			mediaType,
			title: o.title ?? 'Unbekannt',
			poster: o.poster ?? null,
			overview: o.overview ?? '',
			releaseDate: o.releaseDate ?? o.release_date ?? null,
			addedAt: o.addedAt ?? Date.now()
		};
	}

	function onFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const parsed = JSON.parse(String(reader.result));
				const raw = Array.isArray(parsed) ? parsed : parsed.items;
				if (!Array.isArray(raw)) throw new Error('Format');
				const incoming = raw.map(normalize).filter(Boolean) as WatchlistItem[];
				if (incoming.length === 0) throw new Error('Leer');
				let added = 0;
				watchlist.update(($w) => {
					const merged = [...$w];
					for (const it of incoming) {
						if (!merged.some((x) => x.tmdbId === it.tmdbId && x.mediaType === it.mediaType)) {
							merged.unshift(it);
							added++;
						}
					}
					return merged;
				});
				pushToast(get(t)('wl.toastImportedTitle'), get(t)('wl.toastImportedBody', { n: added }), '📥', 2800);
			} catch {
				pushToast(get(t)('wl.toastImportFailTitle'), get(t)('wl.toastImportFailBody'), '⚠️', 3400);
			}
			input.value = '';
		};
		reader.readAsText(file);
	}
</script>

<div class="page">
	<header class="head">
		<div>
			<h1>{$t('wl.title')}</h1>
			<p class="sub">{$t('wl.countSub', { n: $watchlist.length })}</p>
		</div>
		<div class="tools">
			<button class="tool" onclick={exportWatchlist} title={$t('wl.exportTitle')}>📤 {$t('wl.export')}</button>
			<button class="tool" onclick={triggerImport} title={$t('wl.importTitle')}>📥 {$t('wl.import')}</button>
			<input bind:this={fileInput} type="file" accept=".json,application/json" onchange={onFile} hidden />
		</div>
	</header>

	{#if releasesWeek.length}
		<div class="banner">
			<div class="banner-head">📅 {$t('wl.weekHead')}</div>
			<ul class="rel-list">
				{#each releasesWeek as w (w.tmdbId + '-' + w.mediaType)}
					<li>
						<button class="rel-item" class:today={w.releaseDate === today} onclick={() => openInfo(w)} title={$t('wl.infoAria', { title: w.title })}>
							<span class="rel-day">{dayLabel(w.releaseDate ?? today, lang, locale)}</span>
							<span class="rel-title">{w.title}</span>
							{#if w.releaseDate === today}<span class="rel-badge">{$t('wl.todayBadge')}</span>{/if}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if $watchlist.length === 0}
		<div class="empty omni-card">
			<span class="emoji">🔖</span>
			<p>{$t('wl.emptyTitle')}</p>
			<small>{$t('wl.emptyHint')}</small>
		</div>
	{:else}
		<div class="bar">
			<div class="seg-group">
				<button class="seg" class:on={typeFilter === 'all'} onclick={() => (typeFilter = 'all')}>{$t('common.all')}</button>
				<button class="seg" class:on={typeFilter === 'movie'} onclick={() => (typeFilter = 'movie')}>{$t('common.movies')}</button>
				<button class="seg" class:on={typeFilter === 'tv'} onclick={() => (typeFilter = 'tv')}>{$t('common.seriesPl')}</button>
			</div>
			<div class="seg-group">
				<button class="seg" class:on={seenFilter === 'all'} onclick={() => (seenFilter = 'all')}>{$t('common.all')}</button>
				<button class="seg" class:on={seenFilter === 'unseen'} onclick={() => (seenFilter = 'unseen')}>{$t('wl.filterUnseen')}</button>
				<button class="seg" class:on={seenFilter === 'seen'} onclick={() => (seenFilter = 'seen')}>{$t('wl.filterSeen')}</button>
			</div>
			<select class="sort" bind:value={sortBy} aria-label={$t('wl.sortAria')}>
				<option value="added-desc">{$t('wl.sort.addedDesc')}</option>
				<option value="added-asc">{$t('wl.sort.addedAsc')}</option>
				<option value="title-asc">{$t('wl.sort.titleAsc')}</option>
				<option value="title-desc">{$t('wl.sort.titleDesc')}</option>
				<option value="date-desc">{$t('wl.sort.dateDesc')}</option>
				<option value="date-asc">{$t('wl.sort.dateAsc')}</option>
				<option value="rating-desc">{$t('wl.sort.ratingDesc')}</option>
			</select>
			<input class="search" type="text" placeholder={$t('wl.searchPh')} bind:value={q} />
		</div>

		{#if shown.length === 0}
			<div class="empty omni-card">
				<span class="emoji">🔍</span>
				<p>{$t('wl.noMatch')}</p>
				<button class="reset" onclick={resetFilters}>{$t('wl.resetFilters')}</button>
			</div>
		{:else}
			<div class="grid">
				{#each shown as w (w.mediaType + '-' + w.tmdbId)}
					<div class="card omni-card" class:seen={w.seen}>
						<button class="thumb" onclick={() => openInfo(w)} aria-label={$t('wl.infoAria', { title: w.title })}>
							{#if w.poster}<img src={w.poster} alt={w.title} loading="lazy" decoding="async" />
							{:else}<div class="noimg">?</div>{/if}
							{#if w.seen}<span class="seen-badge">✓ {$t('wl.seen')}</span>{/if}
						</button>
						<div class="meta">
							<button class="t t-btn" onclick={() => openInfo(w)}>{w.title}</button>
							<div class="s">{w.mediaType === 'tv' ? $t('common.series') : $t('common.movie')}{w.releaseDate ? ' · ' + w.releaseDate.slice(0, 4) : ''}</div>
							{#if ($availability[w.mediaType + '-' + w.tmdbId] ?? []).length}
								<div class="avail">
									<span class="avail-label">✓ {$t('wl.availableAt')}</span>
									{#each $availability[w.mediaType + '-' + w.tmdbId] as pv (pv.id)}
										<button class="avail-chip" onclick={() => openAt(w, pv)} title={$t('wl.openAt', { provider: pv.name })}>
											{#if pv.logo}<img src={pv.logo} alt="" />{/if}{pv.name}
										</button>
									{/each}
								</div>
							{/if}
							<div class="stars" role="group" aria-label={$t('wl.rate')}>
								{#each [1, 2, 3, 4, 5] as n}
									<button
										class="star"
										class:lit={(w.rating ?? 0) >= n}
										onclick={() => setRating(w.tmdbId, w.mediaType, (w.rating ?? 0) === n ? 0 : n)}
										title={$t('wl.rateN', { n })}
										aria-label={$t('wl.rateN', { n })}
									>{(w.rating ?? 0) >= n ? '★' : '☆'}</button>
								{/each}
							</div>
							<p class="o">{w.overview ? w.overview.slice(0, 110) + (w.overview.length > 110 ? '…' : '') : ''}</p>
							<div class="card-actions">
								<button class="seen-btn" class:on={w.seen} onclick={() => toggleSeen(w.tmdbId, w.mediaType)}>{w.seen ? '✓ ' + $t('wl.seen') : '👁 ' + $t('wl.markSeen')}</button>
								<button class="rm" onclick={() => removeFromWatchlist(w.tmdbId, w.mediaType)}>{$t('common.remove')}</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	{#if seeds.length}
		<div class="recs">
			{#each seeds as seed (seed.mediaType + '-' + seed.tmdbId)}
				{@const list = $recCache[seed.mediaType + '-' + seed.tmdbId] ?? []}
				{#if list.length}
					<div class="rec-row">
						<div class="rec-head">{$t('wl.becauseSaved', { title: seed.title })}</div>
						<div class="rec-scroller">
							{#each list as rec (rec.media_type + '-' + rec.id)}
								<button class="rec-card" onclick={() => openTitleInfo(rec)} title={rec.title}>
									{#if rec.poster}<img src={rec.poster} alt={rec.title} loading="lazy" decoding="async" />{:else}<div class="rec-noimg">?</div>{/if}
									<span class="rec-name">{rec.title}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 22px 28px 36px; }
	.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
	h1 { margin: 0; font-size: 26px; font-weight: 800; }
	.sub { color: var(--text-muted); margin: 4px 0 0; }
	.tools { display: flex; gap: 10px; }
	.tool { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 9px; padding: 9px 14px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
	.tool:hover { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
	.bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px; }
	.seg-group { display: inline-flex; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 10px; padding: 3px; }
	.seg { border: 0; background: none; color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 7px; cursor: pointer; transition: all 0.15s ease; }
	.seg.on { background: var(--accent); color: #00110f; }
	.sort { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 8px 12px; font-family: inherit; font-size: 13px; cursor: pointer; }
	.search { flex: 1; min-width: 160px; background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 10px; padding: 8px 13px; font-family: inherit; font-size: 13px; }
	.search:focus { outline: none; border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
	.reset { margin-top: 12px; background: var(--accent); color: #00110f; border: none; border-radius: 9px; padding: 9px 18px; font-family: inherit; font-weight: 700; cursor: pointer; }
	.banner { background: var(--accent-soft); color: var(--text); border: 1px solid var(--accent); padding: 12px 14px; border-radius: 12px; margin-bottom: 18px; font-size: 14px; }
	.avail { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 4px 0 2px; }
	.avail-label { font-size: 11.5px; font-weight: 700; color: var(--accent); }
	.avail-chip { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px 3px 4px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border)); background: color-mix(in srgb, var(--accent) 10%, transparent); color: var(--text); font-size: 11.5px; font-weight: 600; cursor: pointer; transition: border-color 0.12s ease; }
	.avail-chip:hover { border-color: var(--accent); }
	.avail-chip img { width: 16px; height: 16px; border-radius: 4px; object-fit: cover; }
	.banner-head { font-weight: 700; color: var(--accent); margin-bottom: 8px; }
	.rel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
	.rel-item { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; background: transparent; border: 0; border-radius: 8px; padding: 6px 8px; cursor: pointer; font-family: inherit; font-size: 13.5px; color: var(--text); }
	.rel-item:hover { background: color-mix(in srgb, var(--accent) 14%, transparent); }
	.rel-day { flex: 0 0 92px; color: var(--text-muted); font-size: 12.5px; text-transform: capitalize; }
	.rel-item.today .rel-day { color: var(--accent); font-weight: 700; }
	.rel-title { flex: 1; min-width: 0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.rel-badge { flex: 0 0 auto; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-text); text-transform: uppercase; letter-spacing: 0.4px; }
	.empty { padding: 56px; text-align: center; color: var(--text-muted); }
	.emoji { font-size: 40px; display: block; margin-bottom: 10px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
	.card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
	.thumb { padding: 0; border: 0; background: none; cursor: pointer; display: block; width: 100%; position: relative; }
	.card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; transition: transform 0.25s ease, filter 0.25s ease; }
	.thumb:hover img { transform: scale(1.04); filter: brightness(1.06); }
	.noimg { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); font-size: 36px; color: var(--text-dim); }
	.meta { padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; }
	.t { font-weight: 700; font-size: 14px; }
	.t-btn { padding: 0; border: 0; background: none; color: var(--text); text-align: left; cursor: pointer; font-family: inherit; }
	.t-btn:hover { color: var(--accent); }
	.s { color: var(--text-muted); font-size: 12px; }
	.o { color: var(--text-muted); font-size: 12px; line-height: 1.4; margin: 6px 0 0; }
	.rm { margin-top: 8px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; }
	.card.seen img { opacity: 0.5; }
	.seen-badge { position: absolute; top: 6px; left: 6px; background: var(--accent); color: var(--accent-text); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
	.stars { display: flex; gap: 1px; margin: 2px 0; }
	.star { background: none; border: 0; padding: 0 1px; cursor: pointer; font-size: 16px; line-height: 1; color: var(--text-dim); transition: color 0.1s ease, transform 0.1s ease; }
	.star.lit { color: #f5b301; }
	.star:hover { transform: scale(1.18); }
	.card-actions { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
	.card-actions .rm { margin-top: 0; }
	.seen-btn { background: transparent; border: 1px solid var(--border-strong); color: var(--text); padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; font-family: inherit; white-space: nowrap; }
	.seen-btn.on { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
	.rm:hover { color: #f87171; border-color: #f87171; }
	.recs { margin-top: 30px; display: flex; flex-direction: column; gap: 24px; }
	.rec-head { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
	.rec-scroller { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }
	.rec-card { flex: 0 0 120px; width: 120px; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; font-family: inherit; color: var(--text); }
	.rec-card img { width: 120px; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 10px; display: block; border: 1px solid var(--border); transition: transform 0.15s ease; }
	.rec-card:hover img { transform: translateY(-3px); }
	.rec-noimg { width: 120px; aspect-ratio: 2 / 3; border-radius: 10px; background: var(--bg-card-2); display: grid; place-items: center; color: var(--text-dim); font-size: 24px; }
	.rec-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; margin-top: 6px; line-height: 1.25; }
</style>
