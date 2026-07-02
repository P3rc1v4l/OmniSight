<script lang="ts">
	import { t as tt } from '$lib/i18n';
	import { titleInfo, closeTitleInfo, tmdb } from '$lib/tmdb';
	import { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleSeen } from '$lib/stores/watchlist';
	import { currentRecReason, hideRec, excludeSeed } from '$lib/stores/recs';
	import { watchedEpisodes, isEpisodeWatched, toggleEpisode, setSeasonWatched, seasonWatchedCount } from '$lib/stores/episodeProgress';
	import { X, Star, Tv, History } from '@lucide/svelte';
	import { pushToast } from '$lib/stores/toasts';
	import { settings } from '$lib/stores/settings';
	import { openUrlInApp } from '$lib/embedded';
	import { extractWatchProviders } from '$lib/watchProviders';

	let details = $state<Record<string, any> | null>(null);
	let loading = $state(false);
	let loadedId = 0; // nicht-reaktiver Lade-Merker

	$effect(() => {
		const item = $titleInfo;
		if (!item) { details = null; loadedId = 0; return; }
		if (item.id === loadedId) return;
		loadedId = item.id;
		loading = true;
		details = null;
		expandedSeason = null;
		seasonEps = [];
		const mt = (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
		tmdb.details(mt, item.id).then((d) => {
			if ($titleInfo?.id === item.id) {
				details = d as Record<string, any>;
				loading = false;
			}
		});
	});

	const trailerKey = $derived.by(() => {
		const vids: any[] = details?.videos?.results ?? [];
		const yt = vids.filter((v) => v.site === 'YouTube');
		const t = yt.find((v) => v.type === 'Trailer') || yt.find((v) => v.type === 'Teaser') || yt[0];
		return t?.key ?? null;
	});

	// Bekannte Anbieter -> Suche/Startseite (Login-Sitzung wird über die id geteilt,
	// passend zu den Anbieter-Kacheln in OmniSight). Unbekannte -> JustWatch-Link des Titels.
	const providers = $derived(extractWatchProviders(details, $titleInfo?.title ?? ''));

	const IMG = 'https://image.tmdb.org/t/p';
	const poster = $derived($titleInfo?.poster || (details?.poster_path ? `${IMG}/w342${details.poster_path}` : null));
	const backdrop = $derived($titleInfo?.backdrop || (details?.backdrop_path ? `${IMG}/w780${details.backdrop_path}` : null));
	const overview = $derived($titleInfo?.overview || details?.overview || '');
	const year = $derived(($titleInfo?.release_date || details?.release_date || details?.first_air_date || '').slice(0, 4));
	const genres = $derived(((details?.genres ?? []) as any[]).map((g) => g.name).slice(0, 4));
	const runtime = $derived(details?.runtime || details?.episode_run_time?.[0] || null);
	const ratingRaw = $derived($titleInfo?.vote_average ?? details?.vote_average ?? null);

	// Serien: nächste/letzte Folge (kommt aus den TMDB-Details).
	type Ep = { air_date?: string; season_number?: number; episode_number?: number; name?: string };
	const isTv = $derived($titleInfo?.media_type === 'tv');
	const nextEp = $derived.by(() => {
		if (!isTv) return null;
		const e = details?.next_episode_to_air as Ep | undefined;
		return e?.air_date ? e : null;
	});
	const lastEp = $derived.by(() => {
		if (!isTv) return null;
		const e = details?.last_episode_to_air as Ep | undefined;
		return e?.air_date ? e : null;
	});
	const epLocale = $derived($settings.appearance.language === 'en' ? 'en-US' : 'de-DE');
	function epCode(e: Ep): string { return `S${e.season_number}·E${e.episode_number}`; }
	function epDate(e: Ep): string {
		try {
			return new Date((e.air_date ?? '') + 'T00:00:00').toLocaleDateString(epLocale, { day: '2-digit', month: 'short', year: 'numeric' });
		} catch { return e.air_date ?? ''; }
	}
	function epIsToday(e: Ep): boolean {
		const d = new Date(); const t = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		return e.air_date === t;
	}
	// --- Episoden-Fortschritt: Staffeln aufklappen, Folgen einzeln abhaken ---
	type SeasonInfo = { season_number: number; name: string; episode_count: number };
	type SeasonEp = { episode_number: number; name: string; air_date: string | null; overview: string };
	const seasons = $derived.by<SeasonInfo[]>(() => {
		const arr = (details?.seasons ?? []) as any[];
		return arr
			.filter((s) => (s?.episode_count ?? 0) > 0)
			.map((s) => ({
				season_number: s.season_number as number,
				name: (s.name as string) || `${$tt('common.season')} ${s.season_number}`,
				episode_count: s.episode_count as number
			}));
	});
	let expandedSeason = $state<number | null>(null);
	let seasonEps = $state<SeasonEp[]>([]);
	let loadingSeason = $state(false);

	async function toggleSeasonExpand(seasonNumber: number) {
		if (expandedSeason === seasonNumber) { expandedSeason = null; seasonEps = []; return; }
		const id = $titleInfo?.id;
		if (!id) return;
		expandedSeason = seasonNumber;
		seasonEps = [];
		loadingSeason = true;
		const data = await tmdb.season(id, seasonNumber);
		const eps = ((data?.episodes ?? []) as any[]).map((e) => ({
			episode_number: e.episode_number as number,
			name: (e.name as string) || '',
			air_date: (e.air_date as string) || null,
			overview: (e.overview as string) || ''
		}));
		if (expandedSeason === seasonNumber) { seasonEps = eps; loadingSeason = false; }
	}

	function seasonNums(s: SeasonInfo): number[] {
		return Array.from({ length: s.episode_count }, (_, i) => i + 1);
	}
	function seasonProgress(list: string[], s: SeasonInfo): number {
		const id = $titleInfo?.id;
		return id ? seasonWatchedCount(list, id, s.season_number, seasonNums(s)) : 0;
	}
	function toggleWholeSeason(s: SeasonInfo) {
		const id = $titleInfo?.id;
		if (!id) return;
		const done = seasonProgress($watchedEpisodes, s) === s.episode_count;
		setSeasonWatched(id, s.season_number, seasonNums(s), !done);
	}

	const rating = $derived(ratingRaw ? Math.round(ratingRaw * 10) / 10 : null);

	function toggleWatchlist() {
		const item = $titleInfo;
		if (!item) return;
		const mt = (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
		if (isInWatchlist($watchlist, item.id, item.media_type)) removeFromWatchlist(item.id, mt);
		else addToWatchlist(item);
	}

	// Ist der aktuelle Titel als gesehen markiert?
	const curSeen = $derived.by(() => {
		const it = $titleInfo;
		if (!it) return false;
		const mt = it.media_type === 'tv' ? 'tv' : 'movie';
		return !!$watchlist.find((w) => w.tmdbId === it.id && w.mediaType === mt)?.seen;
	});
	// Als gesehen markieren (fügt bei Bedarf zuerst zur Watchlist hinzu).
	function toggleSeenBtn() {
		const item = $titleInfo;
		if (!item) return;
		const mt = (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
		if (!isInWatchlist($watchlist, item.id, item.media_type)) addToWatchlist(item);
		toggleSeen(item.id, mt);
	}
	function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeTitleInfo(); }

	// Empfehlungsgrund: nur anzeigen, wenn dieser Titel die gerade geöffnete Empfehlung ist.
	const recReason = $derived.by(() => {
		const it = $titleInfo;
		const r = $currentRecReason;
		if (!it || !r) return null;
		const key = (it.media_type === 'tv' ? 'tv' : 'movie') + '-' + it.id;
		return r.recKey === key ? r : null;
	});
	function hideThisRec() {
		if (recReason) {
			hideRec(recReason.recKey);
			closeTitleInfo();
		}
	}
	function excludeThisSeed() {
		if (recReason) {
			excludeSeed(recReason.seedKey);
			pushToast($tt('ti.recExcluded', { title: recReason.seedLabel }), undefined, '🚫', 3000);
		}
	}

	function openProviderLink(p: { name: string; url: string; id: string }) {
		const title = $titleInfo?.title ?? '';
		const art = poster;
		closeTitleInfo();
		openUrlInApp(title, p.url, p.id, p.name, '#30c5bb', '#1f6f6a', art);
	}
</script>

<svelte:window onkeydown={onKey} />

{#if $titleInfo}
	{@const item = $titleInfo}
	<div class="overlay" onclick={closeTitleInfo} role="presentation">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<button class="close" onclick={closeTitleInfo} aria-label={$tt('common.close')}><X size={18} /></button>

			<div class="hero">
				{#if backdrop}<img class="backdrop" src={backdrop} alt="" />{/if}
				<div class="hero-fade"></div>
				<div class="hero-row">
					{#if poster}<img class="poster" src={poster} alt="" />{/if}
					<div class="hero-meta">
						<h2>{item.title}</h2>
						<div class="chips">
							<span class="kind">{item.media_type === 'tv' ? $tt('common.series') : $tt('common.movie')}</span>
							{#if year}<span>{year}</span>{/if}
							{#if rating}<span class="star"><Star size={12} fill="currentColor" /> {rating}</span>{/if}
							{#if runtime}<span>{runtime} Min</span>{/if}
						</div>
						{#if genres.length}
							<div class="genres">{#each genres as g}<span class="genre">{g}</span>{/each}</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="content">
				{#if loading}
					<p class="muted">{$tt('ti.loading')}</p>
				{/if}

				{#if overview}
					<p class="overview">{overview}</p>
				{:else if !loading}
					<p class="muted">{$tt('ti.noDesc')}</p>
				{/if}

				{#if nextEp || lastEp}
					<div class="ep-block">
						{#if nextEp}
							<div class="ep-row">
								<span class="ep-label"><Tv size={14} /> {$tt('ti.nextEp')}</span>
								<span class="ep-info">{epCode(nextEp)} · {epDate(nextEp)}{#if epIsToday(nextEp)} · <b class="ep-today">{$tt('ti.epToday')}</b>{/if}{#if nextEp.name} · {nextEp.name}{/if}</span>
							</div>
						{/if}
						{#if lastEp}
							<div class="ep-row">
								<span class="ep-label"><History size={14} /> {$tt('ti.lastEp')}</span>
								<span class="ep-info">{epCode(lastEp)} · {epDate(lastEp)}{#if epIsToday(lastEp)} · <b class="ep-today">{$tt('ti.epToday')}</b>{/if}{#if lastEp.name} · {lastEp.name}{/if}</span>
							</div>
						{/if}
					</div>
				{/if}

				{#if isTv && seasons.length}
					<div class="block">
						<div class="block-label">{$tt('ti.episodes')}</div>
						<div class="seasons">
							{#each seasons as s (s.season_number)}
								{@const prog = seasonProgress($watchedEpisodes, s)}
								<div class="season">
									<div class="season-head">
										<button class="season-toggle" onclick={() => toggleSeasonExpand(s.season_number)} aria-expanded={expandedSeason === s.season_number}>
											<span class="chev">{expandedSeason === s.season_number ? '▾' : '▸'}</span>
											<span class="season-name">{s.name}</span>
											<span class="season-prog" class:done={prog === s.episode_count}>{prog}/{s.episode_count}</span>
										</button>
										<button class="season-all" onclick={() => toggleWholeSeason(s)}>
											{prog === s.episode_count ? $tt('ti.unmarkSeason') : $tt('ti.markSeason')}
										</button>
									</div>
									{#if expandedSeason === s.season_number}
										<div class="eps">
											{#if loadingSeason}
												<div class="eps-loading">{$tt('ti.loadingEps')}</div>
											{:else}
												{#each seasonEps as ep (ep.episode_number)}
													<label class="ep-item">
														<input
															type="checkbox"
															checked={isEpisodeWatched($watchedEpisodes, $titleInfo?.id ?? 0, s.season_number, ep.episode_number)}
															onchange={() => toggleEpisode($titleInfo?.id ?? 0, s.season_number, ep.episode_number)}
														/>
														<span class="ep-num">E{ep.episode_number}</span>
														<span class="ep-title">{ep.name || `${$tt('common.episode')} ${ep.episode_number}`}</span>
													</label>
												{/each}
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				{#if trailerKey}
					<div class="block">
						<div class="block-label">{$tt('ti.trailer')}</div>
						<div class="video">
							<iframe
								src={`https://www.youtube-nocookie.com/embed/${trailerKey}`}
								title={$tt('ti.trailer')}
								loading="lazy"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/if}

				{#if providers.length}
					<div class="block">
						<div class="block-label">{$tt('ti.whereStream')}</div>
						<div class="provs">
							{#each providers as p (p.name)}
								<button class="prov" title={`${p.name} öffnen`} onclick={() => openProviderLink(p)}>
									<img src={p.logo} alt={p.name} loading="lazy" />
								</button>
							{/each}
						</div>
						<p class="src">{$tt('ti.providerNote')}</p>
					</div>
				{:else if !loading}
					<p class="muted small">{$tt('ti.noStream')}</p>
				{/if}

				{#if recReason}
					<div class="rec-reason">
						<p class="rr-text">💡 {$tt('ti.recBecause', { title: recReason.seedLabel })}</p>
						<div class="rr-actions">
							<button class="rr-btn" onclick={hideThisRec}>{$tt('ti.recHideThis')}</button>
							<button class="rr-btn" onclick={excludeThisSeed}>{$tt('ti.recExcludeSeed', { title: recReason.seedLabel })}</button>
						</div>
					</div>
				{/if}

				<div class="footer">
					<button class="wl" class:on={isInWatchlist($watchlist, item.id, item.media_type)} onclick={toggleWatchlist}>
						{isInWatchlist($watchlist, item.id, item.media_type) ? $tt('mb.saved') : $tt('mb.save')}
					</button>
					<button class="seen" class:on={curSeen} onclick={toggleSeenBtn}>
						{curSeen ? $tt('ti.seen') : $tt('ti.markSeen')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.66); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 24px; animation: fade 0.18s ease; }
	.modal {
		width: min(720px, 96vw); max-height: 90vh; overflow-y: auto; position: relative;
		background: var(--bg-elev); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 30px 80px -30px rgba(0,0,0,0.85);
		animation: pop 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
	}
	.modal::-webkit-scrollbar { width: 10px; } .modal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
	.close { position: absolute; top: 12px; right: 12px; z-index: 3; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.18); cursor: pointer; display: grid; place-items: center; backdrop-filter: blur(4px); }
	.close:hover { background: rgba(0,0,0,0.8); }

	.hero { position: relative; }
	.backdrop { width: 100%; height: 240px; object-fit: cover; display: block; opacity: 0.55; }
	.hero-fade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 20%, color-mix(in srgb, var(--bg-elev) 70%, transparent) 70%, var(--bg-elev)); }
	.hero-row { position: absolute; left: 0; right: 0; bottom: 0; display: flex; gap: 18px; padding: 22px; align-items: flex-end; }
	.poster { width: 104px; height: 156px; object-fit: cover; border-radius: 12px; flex-shrink: 0; box-shadow: 0 12px 30px -10px rgba(0,0,0,0.8); border: 1px solid var(--border); }
	.hero-meta { min-width: 0; padding-bottom: 4px; }
	h2 { margin: 0 0 8px; font-size: 24px; font-weight: 800; line-height: 1.15; letter-spacing: -0.02em; }
	.chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--text-muted); }
	.chips .kind { color: var(--accent); font-weight: 700; }
	.chips .star { color: #fbbf24; font-weight: 700; display: inline-flex; align-items: center; gap: 3px; }
	.genres { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
	.genre { font-size: 11px; font-weight: 600; color: var(--text); background: color-mix(in srgb, var(--accent) 14%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); padding: 3px 9px; border-radius: 999px; }

	.content { padding: 6px 22px 22px; }
	.overview { line-height: 1.6; color: var(--text); margin: 6px 0 0; }
	.ep-block { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
	.ep-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; }
	.ep-label { font-size: 12.5px; font-weight: 700; color: var(--text-muted); white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
	.ep-info { font-size: 13.5px; color: var(--text); }
	.seasons { display: flex; flex-direction: column; gap: 6px; }
	.season { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
	.season-head { display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px; }
	.season-toggle { flex: 1; display: flex; align-items: center; gap: 10px; background: transparent; border: none; color: var(--text); cursor: pointer; padding: 8px; text-align: left; border-radius: 8px; }
	.season-toggle:hover { background: var(--bg-card); }
	.chev { width: 14px; color: var(--text-muted); }
	.season-name { flex: 1; font-weight: 600; font-size: 14px; }
	.season-prog { font-size: 12.5px; color: var(--text-muted); background: var(--bg-card); padding: 2px 8px; border-radius: 99px; }
	.season-prog.done { color: #fff; background: var(--accent); }
	.season-all { background: transparent; border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-size: 11.5px; padding: 5px 9px; border-radius: 8px; white-space: nowrap; }
	.season-all:hover { color: var(--text); border-color: var(--accent); }
	.eps { display: flex; flex-direction: column; padding: 4px 8px 8px; gap: 1px; max-height: 280px; overflow-y: auto; }
	.eps-loading { padding: 10px; color: var(--text-muted); font-size: 13px; text-align: center; }
	.ep-item { display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 7px; cursor: pointer; }
	.ep-item:hover { background: var(--bg-card); }
	.ep-item input { accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer; flex: 0 0 auto; }
	.ep-num { font-size: 12px; color: var(--text-muted); min-width: 28px; }
	.ep-title { font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.ep-today { color: var(--accent); }
	.muted { color: var(--text-muted); } .small { font-size: 13px; }
	.block { margin-top: 22px; }
	.block-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
	.video { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid var(--border); }
	.video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
	.provs { display: flex; flex-wrap: wrap; gap: 10px; }
	.prov { padding: 0; border: 0; background: none; cursor: pointer; border-radius: 11px; transition: transform 0.15s ease; }
	.prov:hover { transform: translateY(-2px); }
	.prov img { width: 46px; height: 46px; border-radius: 11px; object-fit: cover; border: 1px solid var(--border); display: block; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
	.prov:hover img { border-color: color-mix(in srgb, var(--accent) 60%, transparent); box-shadow: 0 6px 16px -6px rgba(0,0,0,0.6); }
	.src { font-size: 11px; color: var(--text-muted); margin-top: 10px; }
	.footer { margin-top: 24px; display: flex; gap: 10px; }
	.rec-reason { margin-top: 22px; padding: 14px 16px; border-radius: 12px; background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }
	.rr-text { margin: 0 0 10px; font-size: 13.5px; color: var(--text); line-height: 1.4; }
	.rr-actions { display: flex; flex-wrap: wrap; gap: 8px; }
	.rr-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); border-radius: 8px; padding: 7px 12px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
	.rr-btn:hover { border-color: var(--accent); color: var(--accent); }
	.wl { background: var(--accent); color: #00110f; border: none; border-radius: 10px; padding: 11px 20px; font-family: inherit; font-weight: 700; font-size: 14px; cursor: pointer; transition: filter 0.15s ease; }
	.wl:hover { filter: brightness(1.06); }
	.wl.on { background: color-mix(in srgb, var(--accent) 22%, var(--bg-card)); color: var(--accent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 45%, transparent); }
	.seen { background: var(--bg-card); color: var(--text); border: 1px solid var(--border); border-radius: 10px; padding: 11px 18px; font-family: inherit; font-weight: 700; font-size: 14px; cursor: pointer; transition: filter 0.15s ease, background 0.15s ease; }
	.seen:hover { filter: brightness(1.08); }
	.seen.on { background: color-mix(in srgb, var(--accent) 18%, var(--bg-card)); color: var(--accent); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }

	@keyframes fade { from { opacity: 0; } }
	@keyframes pop { from { opacity: 0; transform: scale(0.96) translateY(10px); } }
</style>
