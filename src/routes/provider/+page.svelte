<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import { t } from '$lib/i18n';
	import { settings } from '$lib/stores/settings';
	import { providers, detailProviderId, favorites, toggleFavorite } from '$lib/stores/providers';
	import { openProvider, openUrlInApp } from '$lib/embedded';
	import { tmdb } from '$lib/tmdb';
	import { extractWatchProviders } from '$lib/watchProviders';
	import { watchTime, watchLog, totalWatchMs, rangeWatch, formatDuration } from '$lib/stores/tracking';
	import { watchlist } from '$lib/stores/watchlist';
	import { pushToast } from '$lib/stores/toasts';

	$: prov = $providers.find((p) => p.id === $detailProviderId) ?? null;
	$: fav = prov ? $favorites.includes(prov.id) : false;

	// Lokales Datum YYYY-MM-DD.
	function ymd(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	// Aktuelle Kalenderwoche (Mo–So).
	$: weekStart = (() => { const d = new Date(); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return ymd(d); })();
	$: weekEnd = (() => { const d = new Date(); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() + (6 - dow)); return ymd(d); })();

	$: ms = prov ? ($watchTime[prov.id] ?? 0) : 0;
	$: total = $totalWatchMs;
	$: share = total > 0 ? Math.round((ms / total) * 100) : 0;
	$: weekMs = prov ? (rangeWatch($watchLog, weekStart, weekEnd).byProvider[prov.id] ?? 0) : 0;
	$: ranked = Object.entries($watchTime).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k);
	$: rank = prov ? ranked.indexOf(prov.id) : -1;

	// „Aus deiner Watchlist hier verfügbar" (TMDB-Abgleich, nur auf dieser Seite).
	type HereItem = { title: string; poster: string | null; url: string };
	let here: HereItem[] = [];
	let loadingHere = true;

	let surprising = false;
	async function surprise() {
		if (!prov || surprising) return;
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
				const match = extractWatchProviders(d, item.title).find((w) => w.id === prov!.id);
				if (match) {
					openUrlInApp(item.title, match.url, prov!.id, prov!.name, prov!.color, prov!.color2 ?? prov!.color, item.poster ?? null);
					pushToast(get(t)('home.surpriseHit', { title: item.title, provider: prov!.name }), undefined, '🎲', 3200);
					return;
				}
			}
		} catch (e) {
			console.warn('[provider-surprise] TMDB fehlgeschlagen:', e);
		} finally {
			surprising = false;
		}
		openProvider(prov);
	}

	onMount(async () => {
		if (!prov) { goto('/'); return; }
		const items = get(watchlist);
		const out: HereItem[] = [];
		for (const it of items) {
			const mt = it.mediaType === 'tv' ? 'tv' : 'movie';
			try {
				const d = await tmdb.details(mt, it.tmdbId);
				const match = extractWatchProviders(d as Record<string, unknown>, it.title).find((w) => w.id === prov!.id);
				if (match) out.push({ title: it.title, poster: it.poster ?? null, url: match.url });
			} catch { /* ignore */ }
		}
		here = out;
		loadingHere = false;
	});
</script>

<svelte:head><title>{prov ? prov.name : 'Anbieter'} · OmniSight</title></svelte:head>

{#if prov}
	<div class="page">
		<button class="back" onclick={() => goto('/')}>← {$t('pd.back')}</button>

		<div class="head" style="--c1: {prov.color}; --c2: {prov.color2 ?? prov.color};">
			<div class="head-logo"><Logo provider={prov} size={64} /></div>
			<div class="head-tx">
				<h1>{prov.name}</h1>
				<div class="head-sub">{prov.subtitle}</div>
				<div class="head-tags">
					<span class="tag">{$t('cat.' + prov.category)}</span>
					<span class="tag">{prov.quality}</span>
				</div>
			</div>
			<div class="head-actions">
				<button class="act primary" onclick={() => openProvider(prov)}>▶ {$t('pd.open')}</button>
				<button class="act" class:on={fav} onclick={() => toggleFavorite(prov.id)} title={fav ? $t('home.favorite') : $t('home.toFavorites')} aria-label={fav ? $t('home.favorite') : $t('home.toFavorites')}>{fav ? '★' : '☆'}</button>
				<button class="act" class:busy={surprising} onclick={surprise} disabled={surprising} title={$t('pd.surprise')}>{surprising ? '⏳' : '🎲'}</button>
			</div>
		</div>

		<div class="section-label">{$t('pd.statsTitle')}</div>
		{#if ms > 0}
			<div class="stat-grid">
				<div class="stat"><div class="stat-v">{formatDuration(ms)}</div><div class="stat-l">{$t('pd.totalTime')}</div></div>
				<div class="stat"><div class="stat-v">{formatDuration(weekMs)}</div><div class="stat-l">{$t('pd.thisWeek')}</div></div>
				<div class="stat"><div class="stat-v">{share}%</div><div class="stat-l">{$t('pd.share')}</div></div>
				{#if rank >= 0}<div class="stat"><div class="stat-v">#{rank + 1}</div><div class="stat-l">{$t('pd.rank')}</div></div>{/if}
			</div>
		{:else}
			<p class="empty">{$t('pd.noData')}</p>
		{/if}

		<div class="section-label">{$t('pd.watchlistHere')}</div>
		{#if loadingHere}
			<p class="empty">{$t('pd.loading')}</p>
		{:else if here.length}
			<div class="here-grid">
				{#each here as h (h.title + h.url)}
					<button class="here-card" onclick={() => openUrlInApp(h.title, h.url, prov.id, prov.name, prov.color, prov.color2 ?? prov.color, h.poster)} title={h.title}>
						{#if h.poster}<img src={h.poster} alt={h.title} loading="lazy" decoding="async" />{:else}<div class="here-noimg">?</div>{/if}
						<span class="here-name">{h.title}</span>
					</button>
				{/each}
			</div>
		{:else}
			<p class="empty">{$t('pd.watchlistHereEmpty')}</p>
		{/if}
	</div>
{/if}

<style>
	.page { max-width: 1100px; margin: 0 auto; padding: 18px 22px 60px; }
	.back { background: transparent; border: 0; color: var(--text-muted); font-family: inherit; font-size: 14px; cursor: pointer; padding: 4px 0; margin-bottom: 12px; }
	.back:hover { color: var(--text); }

	.head { display: flex; align-items: center; gap: 18px; padding: 20px; border-radius: 16px; border: 1px solid var(--border); color: #fff; background: linear-gradient(180deg, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.55) 100%), radial-gradient(120% 120% at 0% 0%, var(--c1), var(--c2)); margin-bottom: 24px; }
	.head-logo { display: grid; place-items: center; width: 72px; height: 72px; background: rgba(0,0,0,0.25); border-radius: 14px; flex-shrink: 0; }
	.head-tx { flex: 1; min-width: 0; }
	.head-tx h1 { margin: 0; font-size: 24px; line-height: 1.1; }
	.head-sub { font-size: 13px; opacity: 0.85; margin-top: 3px; }
	.head-tags { display: flex; gap: 6px; margin-top: 8px; }
	.tag { background: rgba(0,0,0,0.4); backdrop-filter: blur(6px); font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 999px; letter-spacing: 0.04em; }
	.head-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.act { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.18); color: #fff; border-radius: 10px; padding: 9px 12px; font-family: inherit; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.12s; }
	.act:hover { background: rgba(0,0,0,0.6); }
	.act.primary { background: rgba(255,255,255,0.92); color: #111; border-color: transparent; }
	.act.on { color: #facc15; }
	.act.busy { opacity: 0.7; }

	.section-label { font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin: 22px 0 12px; }
	.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
	.stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
	.stat-v { font-size: 22px; font-weight: 800; color: var(--accent); }
	.stat-l { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
	.empty { color: var(--text-muted); font-size: 14px; }

	.here-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
	.here-card { width: 100%; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; font-family: inherit; color: var(--text); }
	.here-card img { width: 100%; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 10px; display: block; border: 1px solid var(--border); transition: transform 0.15s ease; }
	.here-card:hover img { transform: translateY(-3px); }
	.here-noimg { width: 100%; aspect-ratio: 2 / 3; border-radius: 10px; background: var(--bg-card-2); display: grid; place-items: center; color: var(--text-dim); font-size: 24px; }
	.here-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; margin-top: 6px; line-height: 1.25; }
</style>
