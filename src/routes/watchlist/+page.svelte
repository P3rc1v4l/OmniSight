<script lang="ts">
	import { watchlist, removeFromWatchlist } from '$lib/stores/watchlist';

	$: today = new Date().toISOString().slice(0, 10);
	$: releasesToday = $watchlist.filter((x) => x.releaseDate === today);
</script>

<div class="page">
	<header class="head">
		<h1>Gemerkt</h1>
		<p class="sub">{$watchlist.length} Titel auf deiner Liste</p>
	</header>

	{#if releasesToday.length}
		<div class="banner">
			🎉 <strong>{releasesToday.length}</strong> Titel deiner Watchlist erscheinen heute!
		</div>
	{/if}

	{#if $watchlist.length === 0}
		<div class="empty omni-card">
			<span class="emoji">🔖</span>
			<p>Noch nichts gemerkt.</p>
			<small>Suche oben auf der Übersicht nach einem Titel und klicke „+ Watchlist".</small>
		</div>
	{:else}
		<div class="grid">
			{#each $watchlist as w (w.mediaType + '-' + w.tmdbId)}
				<div class="card omni-card">
					{#if w.poster}<img src={w.poster} alt={w.title} loading="lazy"/>
					{:else}<div class="noimg">?</div>{/if}
					<div class="meta">
						<div class="t">{w.title}</div>
						<div class="s">{w.mediaType === 'tv' ? 'Serie' : 'Film'}{w.releaseDate ? ' · ' + w.releaseDate.slice(0, 4) : ''}</div>
						<p class="o">{w.overview ? w.overview.slice(0, 110) + (w.overview.length > 110 ? '…' : '') : ''}</p>
						<button class="rm" onclick={() => removeFromWatchlist(w.tmdbId, w.mediaType)}>Entfernen</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 22px 28px 36px; }
	h1 { margin: 0; font-size: 26px; font-weight: 800; }
	.sub { color: var(--text-muted); margin: 4px 0 18px; }
	.banner { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); padding: 12px 16px; border-radius: 12px; margin-bottom: 18px; font-size: 14px; }
	.empty { padding: 56px; text-align: center; color: var(--text-muted); }
	.emoji { font-size: 40px; display: block; margin-bottom: 10px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
	.card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
	.card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; }
	.noimg { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); font-size: 36px; color: var(--text-dim); }
	.meta { padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; }
	.t { font-weight: 700; font-size: 14px; }
	.s { color: var(--text-muted); font-size: 12px; }
	.o { color: var(--text-muted); font-size: 12px; line-height: 1.4; margin: 6px 0 0; }
	.rm { margin-top: 8px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 12px; }
	.rm:hover { color: #f87171; border-color: #f87171; }
</style>
