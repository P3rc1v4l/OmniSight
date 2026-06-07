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
	import { hiddenRecs, excludedSeeds, currentRecReason, hideRec } from '$lib/stores/recs';
	import { exportLetterboxd, exportTrakt } from '$lib/watchlistExport';
	import { importWatchlistCsv } from '$lib/watchlistImport';
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
		const seen = new Set<string>();
		const provs = extractWatchProviders(d as Record<string, unknown>, item.title)
			.filter((w) => myIds.has(w.id))
			.filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));
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

	// Empfehlungen: EINE Reihe mit bis zu 10 zufälligen Titeln, gezogen aus den
	// TMDB-Empfehlungen zu (zufällig gewählten) Titeln der eigenen Liste.
	// Wird nur neu berechnet, wenn sich die Titel-Menge ändert (nicht bei Bewertung/Gesehen).
	const recs10 = writable<TmdbItem[]>([]);
	// Merkt sich, aus welchem Seed-Titel eine Empfehlung stammt (für die Begründung).
	let recReasonMap: Record<string, { seedLabel: string; seedKey: string }> = {};
	let recsSig = '';

	async function buildRecs(items: WatchlistItem[]): Promise<void> {
		const have = new Set(items.map((w) => w.mediaType + '-' + w.tmdbId));
		const excluded = new Set(get(excludedSeeds));
		// Ausgeschlossene Seed-Titel nicht als Basis verwenden.
		const usable = items.filter((w) => !excluded.has(w.mediaType + '-' + w.tmdbId));
		const seedTitles = [...usable].sort(() => Math.random() - 0.5).slice(0, 12);
		const pool = new Map<string, TmdbItem>();
		const reasons: Record<string, { seedLabel: string; seedKey: string }> = {};
		for (const s of seedTitles) {
			const mt = (s.mediaType === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
			const seedKey = s.mediaType + '-' + s.tmdbId;
			const res = (await tmdb.list(`/${mt}/${s.tmdbId}/recommendations`, [], mt)) ?? [];
			for (const r of res) {
				const k = (r.media_type === 'tv' ? 'tv' : 'movie') + '-' + r.id;
				if (r.poster && !have.has(k) && !pool.has(k)) {
					pool.set(k, r);
					reasons[k] = { seedLabel: s.title, seedKey };
				}
			}
		}
		recReasonMap = reasons;
		recs10.set([...pool.values()].sort(() => Math.random() - 0.5).slice(0, 24));
	}

	$: {
		const sig = $watchlist.map((w) => w.mediaType + '-' + w.tmdbId).sort().join(',') + '|' + $excludedSeeds.join(',');
		if (sig !== recsSig) {
			recsSig = sig;
			if ($watchlist.length) void buildRecs($watchlist);
			else recs10.set([]);
		}
	}

	function recKey(r: TmdbItem): string { return (r.media_type === 'tv' ? 'tv' : 'movie') + '-' + r.id; }
	// Anzeige: ausgeblendete Empfehlungen herausfiltern (reagiert sofort beim Ausblenden).
	$: shownRecs = $recs10.filter((r) => !$hiddenRecs.includes(recKey(r)));

	function openRecInfo(r: TmdbItem): void {
		const k = recKey(r);
		const reason = recReasonMap[k];
		currentRecReason.set(reason ? { seedLabel: reason.seedLabel, seedKey: reason.seedKey, recKey: k } : null);
		openTitleInfo(r);
	}
	function refreshRecs(): void { if ($watchlist.length) void buildRecs($watchlist); }

	// Lokales Datum als YYYY-MM-DD (vermeidet Zeitzonen-Versatz von toISOString).
	function ymd(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	function dayLabel(dateStr: string, lg: 'de' | 'en', loc: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		const t0 = new Date();
		t0.setHours(0, 0, 0, 0);
		const diff = Math.round((date.getTime() - t0.getTime()) / 86400000);
		if (diff === 0) return tr(lg, 'cal.today');
		if (diff === 1) return tr(lg, 'cal.tomorrow');
		if (diff === -1) return tr(lg, 'cal.yesterday');
		return date.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'short' });
	}

	$: lang = ($settings.appearance.language === 'en' ? 'en' : 'de') as 'de' | 'en';
	$: locale = lang === 'en' ? 'en-US' : 'de-DE';
	$: today = ymd(new Date());
	// Aktuelle Kalenderwoche (Montag–Sonntag), inkl. bereits erschienener Tage dieser Woche.
	$: weekStart = (() => {
		const d = new Date();
		const dow = (d.getDay() + 6) % 7; // Mo=0 … So=6
		d.setDate(d.getDate() - dow);
		return ymd(d);
	})();
	$: weekEnd = (() => {
		const d = new Date();
		const dow = (d.getDay() + 6) % 7;
		d.setDate(d.getDate() + (6 - dow));
		return ymd(d);
	})();
	$: releasesWeek = $watchlist
		.filter((x) => x.releaseDate && x.releaseDate >= weekStart && x.releaseDate <= weekEnd)
		.sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? ''));
	// Schlüssel der Titel mit Release in dieser Woche – zum Hervorheben der Karten.
	$: releasesWeekKeys = new Set(releasesWeek.map((w) => w.mediaType + '-' + w.tmdbId));

	let sortBy = 'added-desc';
	let typeFilter: 'all' | 'movie' | 'tv' = 'all';
	let recRowWidth = 0; // gemessene Breite der Empfehlungs-Leiste -> daraus: wie viele Karten passen
	let importProgress: { done: number; total: number } | null = null; // CSV-Import-Fortschritt
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
		.filter((w) => !w.seen)
		.filter((w) => !q.trim() || w.title.toLowerCase().includes(q.trim().toLowerCase()));
	$: shown = sortList(filtered, sortBy);
	// Wie viele Empfehlungs-Karten passen in eine Reihe (Karte 120 + 12 Abstand = 132)?
	$: recFit = Math.max(1, Math.floor((recRowWidth + 12) / 132));
	function resetFilters() { sortBy = 'added-desc'; typeFilter = 'all'; q = ''; }

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
		const data = JSON.stringify({ app: 'OmniSight', type: 'watchlist', version: 1, items }, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'omnisight-watchlist.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		pushToast(get(t)('wl.toastExportedTitle'), get(t)('wl.toastExportedBody', { n: items.length }), '📤', 2600);
	}

	function doExportLetterboxd() {
		const items = get(watchlist);
		if (!items.length) { pushToast(get(t)('wl.toastNothingTitle'), get(t)('wl.toastNothingBody'), 'ℹ️', 2400); return; }
		const n = exportLetterboxd(items);
		pushToast(get(t)('wl.toastLbTitle'), get(t)('wl.toastLbBody', { n }), '🎬', 3200);
	}
	function doExportTrakt() {
		const items = get(watchlist);
		if (!items.length) { pushToast(get(t)('wl.toastNothingTitle'), get(t)('wl.toastNothingBody'), 'ℹ️', 2400); return; }
		const n = exportTrakt(items);
		pushToast(get(t)('wl.toastTraktTitle'), get(t)('wl.toastTraktBody', { n }), '📺', 3200);
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
		const isCsv = file.name.toLowerCase().endsWith('.csv');
		const reader = new FileReader();
		reader.onload = async () => {
			const text = String(reader.result);
			const looksJson = text.trimStart().startsWith('{') || text.trimStart().startsWith('[');
			if (isCsv || !looksJson) {
				// CSV-Import (Letterboxd/Trakt/generisch) – löst Titel/IDs über TMDB auf.
				importProgress = { done: 0, total: 0 };
				try {
					const res = await importWatchlistCsv(text, (done, total) => { importProgress = { done, total }; });
					importProgress = null;
					if (res.total === 0) pushToast(get(t)('wl.toastImportFailTitle'), get(t)('wl.toastImportFailBody'), '⚠️', 3400);
					else pushToast(get(t)('wl.toastImportedTitle'), get(t)('wl.importCsvDone', { added: res.added, total: res.total, skipped: res.skipped }), '📥', 4500);
				} catch {
					importProgress = null;
					pushToast(get(t)('wl.toastImportFailTitle'), get(t)('wl.toastImportFailBody'), '⚠️', 3400);
				}
				input.value = '';
				return;
			}
			// JSON-Sicherung (eigenes Format)
			try {
				const parsed = JSON.parse(text);
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
	{#if importProgress}
		<div class="import-overlay" role="status" aria-live="polite">
			<div class="import-box omni-card">
				<div class="import-title">{$t('wl.importing')}</div>
				<div class="import-count">{importProgress.done} / {importProgress.total}</div>
				<div class="import-bar"><div class="import-fill" style="width: {importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}%"></div></div>
				<div class="import-hint">{$t('wl.importHint')}</div>
			</div>
		</div>
	{/if}
	<header class="head">
		<div>
			<h1>{$t('wl.title')}</h1>
			<p class="sub">{$t('wl.countSub', { n: $watchlist.length })}</p>
		</div>
		<div class="tools">
			<button class="tool" onclick={exportWatchlist} title={$t('wl.exportTitle')}>📤 {$t('wl.export')}</button>
			<button class="tool" onclick={triggerImport} title={$t('wl.importTitle')}>📥 {$t('wl.import')}</button>
			<button class="tool" onclick={doExportLetterboxd} title={$t('wl.exportLbTitle')}>🎬 Letterboxd</button>
			<button class="tool" onclick={doExportTrakt} title={$t('wl.exportTraktTitle')}>📺 Trakt</button>
			<input bind:this={fileInput} type="file" accept=".json,.csv,application/json,text/csv,text/plain" onchange={onFile} hidden />
		</div>
	</header>

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
					{@const isWeek = releasesWeekKeys.has(w.mediaType + '-' + w.tmdbId)}
					<div class="card omni-card" class:seen={w.seen} class:thisweek={isWeek}>
						<button class="thumb" onclick={() => openInfo(w)} aria-label={$t('wl.infoAria', { title: w.title })}>
							{#if w.poster}<img src={w.poster} alt={w.title} loading="lazy" decoding="async" />
							{:else}<div class="noimg">?</div>{/if}
							{#if isWeek}<span class="week-badge" class:today={w.releaseDate === today}>{w.releaseDate === today ? $t('wl.todayBadge') : dayLabel(w.releaseDate ?? today, lang, locale)}</span>{/if}
							{#if w.seen}<span class="seen-badge">✓ {$t('wl.seen')}</span>{/if}
						</button>
						<div class="meta">
							<button class="t t-btn" onclick={() => openInfo(w)}>{w.title}</button>
							<div class="s">{w.mediaType === 'tv' ? $t('common.series') : $t('common.movie')}{w.releaseDate ? ' · ' + w.releaseDate.slice(0, 4) : ''}</div>
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
							{#if ($availability[w.mediaType + '-' + w.tmdbId] ?? []).length}
								<div class="avail">
									{#each $availability[w.mediaType + '-' + w.tmdbId] as pv (pv.id)}
										<button class="avail-chip" onclick={() => openAt(w, pv)} title={$t('wl.openAt', { provider: pv.name })} aria-label={$t('wl.openAt', { provider: pv.name })}>
											{#if pv.logo}<img src={pv.logo} alt={pv.name} />{:else}<span class="avail-fallback">{pv.name.slice(0, 1)}</span>{/if}
										</button>
									{/each}
								</div>
							{/if}
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

	{#if shownRecs.length}
		<div class="recs">
			<div class="rec-row">
				<div class="rec-head-row">
					<div class="rec-head">{$t('wl.recsTitle')}</div>
					<button class="rec-refresh" onclick={refreshRecs}>🔀 {$t('wl.recsNew')}</button>
				</div>
				<div class="rec-scroller" bind:clientWidth={recRowWidth}>
					{#each shownRecs.slice(0, recFit) as rec (rec.media_type + '-' + rec.id)}
						<div class="rec-card-wrap">
							<button class="rec-hide" onclick={() => hideRec(recKey(rec))} title={$t('wl.recHide')} aria-label={$t('wl.recHide')}>✕</button>
							<button class="rec-card" onclick={() => openRecInfo(rec)} title={rec.title}>
								{#if rec.poster}<img src={rec.poster} alt={rec.title} loading="lazy" decoding="async" />{:else}<div class="rec-noimg">?</div>{/if}
								<span class="rec-name">{rec.title}</span>
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { padding: 22px 28px 36px; }
	.import-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: grid; place-items: center; z-index: 1200; }
	.import-box { width: min(420px, 90vw); padding: 24px; text-align: center; background: var(--bg-elev); }
	.import-title { font-size: 16px; font-weight: 700; }
	.import-count { font-size: 28px; font-weight: 800; margin: 10px 0; color: var(--accent); }
	.import-bar { height: 8px; border-radius: 99px; background: var(--bg-card); overflow: hidden; }
	.import-fill { height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.2s ease; }
	.import-hint { font-size: 12.5px; color: var(--text-muted); margin-top: 12px; }
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
	.card.thisweek { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 6px 20px color-mix(in srgb, var(--accent) 26%, transparent); }
	.week-badge { position: absolute; top: 8px; right: 8px; z-index: 2; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-text); text-transform: capitalize; letter-spacing: 0.2px; box-shadow: 0 2px 6px rgba(0,0,0,0.35); max-width: calc(100% - 16px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.week-badge.today { text-transform: uppercase; letter-spacing: 0.5px; }
	.avail { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin: 4px 0 2px; }
	.avail-chip { width: 28px; height: 28px; flex: 0 0 28px; display: grid; place-items: center; padding: 0; border-radius: 7px; border: 1px solid var(--border); background: var(--bg-elev); cursor: pointer; transition: border-color 0.12s ease, transform 0.12s ease; overflow: hidden; }
	.avail-chip:hover { border-color: var(--accent); transform: translateY(-1px); }
	.avail-chip img { width: 22px; height: 22px; border-radius: 4px; object-fit: cover; display: block; }
	.avail-fallback { font-size: 12px; font-weight: 800; color: var(--text-muted); }
	.empty { padding: 56px; text-align: center; color: var(--text-muted); }
	.emoji { font-size: 40px; display: block; margin-bottom: 10px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
	.card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
	.thumb { padding: 0; border: 0; background: none; cursor: pointer; display: block; width: 100%; position: relative; }
	.card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; transition: transform 0.25s ease, filter 0.25s ease; }
	.thumb:hover img { transform: scale(1.04); filter: brightness(1.06); }
	.noimg { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); font-size: 36px; color: var(--text-dim); }
	.meta { padding: 10px 11px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.t { font-weight: 700; font-size: 13px; line-height: 1.25; }
	.t-btn { padding: 0; border: 0; background: none; color: var(--text); text-align: left; cursor: pointer; font-family: inherit; }
	.t-btn:hover { color: var(--accent); }
	.s { color: var(--text-muted); font-size: 12px; }
	.o { color: var(--text-muted); font-size: 11.5px; line-height: 1.35; margin: 5px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.rm { margin-top: 8px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 5px 8px; border-radius: 7px; cursor: pointer; font-size: 11.5px; }
	.card.seen img { opacity: 0.5; }
	.seen-badge { position: absolute; top: 6px; left: 6px; background: var(--accent); color: var(--accent-text); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
	.stars { display: flex; gap: 1px; margin: 2px 0; }
	.star { background: none; border: 0; padding: 0 1px; cursor: pointer; font-size: 16px; line-height: 1; color: var(--text-dim); transition: color 0.1s ease, transform 0.1s ease; }
	.star.lit { color: #f5b301; }
	.star:hover { transform: scale(1.18); }
	.card-actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: auto; padding-top: 8px; }
	.card-actions .rm { margin-top: 0; }
	.seen-btn { background: transparent; border: 1px solid var(--border-strong); color: var(--text); padding: 5px 8px; border-radius: 7px; font-size: 11.5px; cursor: pointer; font-family: inherit; white-space: nowrap; }
	.seen-btn.on { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
	.rm:hover { color: #f87171; border-color: #f87171; }
	.recs {
		position: sticky;
		bottom: 0;
		margin-top: 30px;
		padding: 14px 0 6px;
		background: linear-gradient(to top, var(--bg) 70%, transparent);
		display: flex;
		flex-direction: column;
		gap: 24px;
		z-index: 5;
	}
	.rec-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
	.rec-head { font-size: 15px; font-weight: 700; }
	.rec-refresh { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); border-radius: 8px; padding: 6px 12px; font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
	.rec-refresh:hover { border-color: var(--accent); color: var(--accent); }
	.rec-scroller { display: flex; gap: 12px; overflow: hidden; padding-bottom: 4px; }
	.rec-card-wrap { flex: 0 0 120px; width: 120px; position: relative; }
	.rec-hide { position: absolute; top: 6px; right: 6px; z-index: 2; width: 24px; height: 24px; border-radius: 999px; border: 0; background: rgba(0, 0, 0, 0.65); color: #fff; font-size: 11px; cursor: pointer; opacity: 0; transition: opacity 0.12s ease; display: grid; place-items: center; }
	.rec-card-wrap:hover .rec-hide { opacity: 1; }
	.rec-hide:hover { background: #e23b3b; }
	.rec-card { width: 100%; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; font-family: inherit; color: var(--text); }
	.rec-card img { width: 100%; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 10px; display: block; border: 1px solid var(--border); transition: transform 0.15s ease; }
	.rec-card:hover img { transform: translateY(-3px); }
	.rec-noimg { width: 100%; aspect-ratio: 2 / 3; border-radius: 10px; background: var(--bg-card-2); display: grid; place-items: center; color: var(--text-dim); font-size: 24px; }
	.rec-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; margin-top: 6px; line-height: 1.25; }
</style>
