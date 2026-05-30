<script lang="ts">
	import { hiddenTitles, unhideTitle, showHidden } from '$lib/stores/hidden';
	import { openTitleInfo } from '$lib/tmdb';
	import type { TmdbItem } from '$lib/types';
	import type { HiddenEntry } from '$lib/stores/hidden';

	function close() {
		showHidden.set(false);
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
	function info(h: HiddenEntry) {
		const item: TmdbItem = {
			id: h.id,
			media_type: h.media_type,
			title: h.title,
			overview: '',
			poster: h.poster,
			backdrop: null,
			release_date: null,
			vote_average: null
		};
		openTitleInfo(item);
	}
	function unhide(e: Event, h: HiddenEntry) {
		e.stopPropagation();
		unhideTitle(h.id, h.media_type);
	}
	const typeLabel = (mt: string) => (mt === 'tv' ? 'Serie / Anime' : 'Film');
</script>

<svelte:window onkeydown={onKey} />

{#if $showHidden}
	<div class="back" onclick={close} role="presentation">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="head">
				<h2>Ausgeblendete Titel</h2>
				<button class="x" onclick={close} aria-label="Schließen">×</button>
			</div>

			{#if $hiddenTitles.length === 0}
				<p class="empty">Nichts ausgeblendet. Über das durchgestrichene Auge auf einer Karte legst du Titel hier ab.</p>
			{:else}
				<div class="grid">
					{#each $hiddenTitles as h (h.media_type + '-' + h.id)}
						<div class="cell">
							<button class="pbtn" onclick={() => info(h)} title={h.title} aria-label={`Infos zu ${h.title}`}>
								{#if h.poster}<img src={h.poster} alt={h.title} loading="lazy" />{:else}<div class="noimg">?</div>{/if}
							</button>
							<div class="t">{h.title}</div>
							<div class="s">{typeLabel(h.media_type)}</div>
							<button class="unhide" onclick={(e) => unhide(e, h)}>Einblenden</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.back { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 200; display: grid; place-items: center; padding: 24px; }
	.modal { width: min(820px, 96vw); max-height: 88vh; overflow: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 20px 22px 24px; box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7); }
	.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
	h2 { margin: 0; font-size: 19px; font-weight: 800; }
	.x { background: transparent; border: 0; color: var(--text-muted); font-size: 26px; cursor: pointer; line-height: 1; }
	.empty { color: var(--text-muted); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
	.cell { display: flex; flex-direction: column; }
	.pbtn { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 10px; }
	.pbtn img { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; border-radius: 10px; border: 1px solid var(--border); transition: border-color 0.15s; }
	.pbtn:hover img { border-color: var(--accent); }
	.noimg { width: 100%; aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-card-2); font-size: 28px; color: var(--text-dim); border-radius: 10px; }
	.t { margin-top: 7px; font-size: 12.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.s { font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
	.unhide { margin-top: auto; background: var(--accent); color: #00110f; border: 0; border-radius: 8px; padding: 7px 0; font-family: inherit; font-weight: 700; font-size: 12.5px; cursor: pointer; }
	.unhide:hover { filter: brightness(1.08); }
</style>
