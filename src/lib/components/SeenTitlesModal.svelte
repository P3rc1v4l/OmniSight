<script lang="ts">
	// Übersicht aller als gesehen markierten Titel – als In-App-Fenster (wie die Einstellungen).
	import { watchlist } from '$lib/stores/watchlist';
	import { openTitleInfo } from '$lib/tmdb';
	import { t } from '$lib/i18n';
	import type { WatchlistItem } from '$lib/types';

	let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props();

	const seenTitles = $derived($watchlist.filter((w) => w.seen));

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
	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="overlay" role="presentation" onclick={onClose}>
		<div
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-label={$t('stats.seenList')}
			onclick={(e) => e.stopPropagation()}
		>
			<header>
				<h2>{$t('stats.seenList')} <span class="count">{seenTitles.length}</span></h2>
				<button class="x" onclick={onClose} aria-label={$t('common.close')}>×</button>
			</header>
			<div class="body">
				{#if seenTitles.length}
					<div class="grid">
						{#each seenTitles as w (w.mediaType + '-' + w.tmdbId)}
							<button class="card" onclick={() => openInfo(w)} title={w.title}>
								{#if w.poster}<img src={w.poster} alt={w.title} loading="lazy" decoding="async" />{:else}<div class="noimg">?</div>{/if}
								<span class="cn">{w.title}</span>
							</button>
						{/each}
					</div>
				{:else}
					<p class="empty">{$t('stats.seenNone')}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay { position: fixed; inset: 0; z-index: 900; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: grid; place-items: center; padding: 24px; }
	.modal { width: min(820px, 96vw); max-height: 86vh; display: flex; flex-direction: column; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 28px 70px -20px rgba(0, 0, 0, 0.8); overflow: hidden; }
	header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
	header h2 { margin: 0; font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
	.count { font-size: 12px; font-weight: 700; color: var(--accent-text); background: var(--accent); border-radius: 999px; padding: 2px 9px; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 24px; cursor: pointer; line-height: 1; }
	.x:hover { color: var(--text); }
	.body { padding: 18px 20px; overflow-y: auto; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(108px, 1fr)); gap: 14px; }
	.card { background: none; border: 0; padding: 0; cursor: pointer; display: flex; flex-direction: column; gap: 6px; text-align: left; font-family: inherit; color: var(--text); }
	.card img { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 10px; display: block; transition: transform 0.15s ease; }
	.card:hover img { transform: scale(1.04); }
	.noimg { width: 100%; aspect-ratio: 2/3; border-radius: 10px; background: var(--bg-card-2); display: grid; place-items: center; color: var(--text-muted); font-size: 24px; }
	.cn { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.empty { color: var(--text-muted); text-align: center; padding: 30px; }
</style>
