<script lang="ts">
	import { onMount } from 'svelte';
	import { tmdb, openTitleInfo } from '$lib/tmdb';
	import { watchlist, isInWatchlist } from '$lib/stores/watchlist';
	import type { TmdbItem } from '$lib/types';

	let items = $state<TmdbItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let bgIndex = $state(0);

	onMount(async () => {
		const res = await tmdb.trending();
		if (!res || res.length === 0) {
			error = 'Keine Daten von TMDB. Ist der API-Key in src-tauri/src/tmdb.rs eingetragen?';
		} else {
			items = res;
		}
		loading = false;

		const id = setInterval(() => {
			if (items.length) bgIndex = (bgIndex + 1) % items.length;
		}, 5000);
		return () => clearInterval(id);
	});

	const bg = $derived(items[bgIndex]?.backdrop);
</script>

<div class="page">
	{#if bg}<div class="bg" style="background-image: url({bg})"></div>{/if}
	<div class="overlay"></div>

	<div class="content">
		<h1>Neuigkeiten</h1>
		<p class="sub">Aktuell im Trend in Deutschland (TMDB)</p>

		{#if loading}<p class="muted">Lädt…</p>
		{:else if error}<p class="muted">{error}</p>
		{:else}
			<div class="rail">
				{#each items as t, i (t.media_type + '-' + t.id)}
					<button class="tcard" class:active={i === bgIndex} onmouseenter={() => (bgIndex = i)} onclick={() => openTitleInfo(t)}>
						{#if t.poster}<img src={t.poster} alt={t.title} loading="lazy"/>
						{:else}<div class="noimg">?</div>{/if}
						<div class="tt">{t.title}</div>
						<div class="ts">
							{t.media_type === 'tv' ? 'Serie' : 'Film'}
							{#if isInWatchlist($watchlist, t.id, t.media_type)} · ✓ gemerkt{/if}
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.page { position: relative; min-height: 100%; padding: 22px 28px 36px; overflow: hidden; }
	.bg { position: absolute; inset: -10%; background-size: cover; background-position: center; filter: blur(28px) saturate(1.1); opacity: 0.55; transition: background-image 0.6s; z-index: 0; }
	.overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,12,16,0.5), rgba(11,12,16,0.9)); z-index: 1; }
	.content { position: relative; z-index: 2; }
	h1 { margin: 0; font-size: 28px; font-weight: 800; }
	.sub { color: var(--text-muted); margin: 4px 0 22px; }
	.muted { color: var(--text-muted); }
	.rail {
		display: flex; gap: 12px; overflow-x: auto; padding: 8px 0 16px;
		scroll-snap-type: x mandatory;
	}
	.tcard {
		flex: 0 0 160px; scroll-snap-align: start;
		background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
		padding: 0; overflow: hidden;
		cursor: pointer; color: var(--text); font-family: inherit;
		transition: transform 0.18s, border-color 0.18s;
		text-align: left;
	}
	.tcard:hover, .tcard.active { transform: translateY(-3px); border-color: var(--accent); }
	.tcard img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; }
	.noimg { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); font-size: 32px; color: var(--text-dim); }
	.tt { padding: 8px 10px 2px; font-weight: 600; font-size: 13px; line-height: 1.25; }
	.ts { padding: 0 10px 10px; color: var(--text-muted); font-size: 11px; }
</style>
