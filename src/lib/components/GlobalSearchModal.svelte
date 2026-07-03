<script lang="ts">
	// Globale Titelsuche (Strg+F): durchsucht TMDB nach Filmen/Serien.
	// Ein Treffer öffnet das bestehende TitleInfoModal – dort steht u. a. "Wo streamen".
	import { tmdb, openTitleInfo } from '$lib/tmdb';
	import { searchHistory, addSearch, removeSearch } from '$lib/stores/searchHistory';
	import { t } from '$lib/i18n';
	import type { TmdbItem } from '$lib/types';

	let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props();

	let q = $state('');
	let results = $state<TmdbItem[]>([]);
	let loading = $state(false);
	let inputEl: HTMLInputElement | null = $state(null);
	let seq = 0;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function close() { onClose(); }

	$effect(() => {
		if (open) {
			setTimeout(() => inputEl?.focus(), 30);
		} else {
			q = '';
			results = [];
			loading = false;
		}
	});

	function onInput() {
		if (timer) clearTimeout(timer);
		const query = q.trim();
		if (query.length < 2) { results = []; loading = false; return; }
		loading = true;
		timer = setTimeout(() => runSearch(query), 320);
	}

	async function runSearch(query: string) {
		const my = ++seq;
		const res = (await tmdb.search(query)) ?? [];
		if (my !== seq) return; // veraltete Antwort verwerfen
		results = res.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
		loading = false;
	}

	function pick(item: TmdbItem) {
		addSearch(q);
		openTitleInfo(item);
		close();
	}

	function useHistory(term: string) {
		q = term;
		onInput();
		setTimeout(() => inputEl?.focus(), 0);
	}

	function year(d: string | null | undefined): string {
		return d ? d.slice(0, 4) : '';
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') { e.stopPropagation(); close(); }
	}
</script>

{#if open}
	<div class="ov ov-in" onclick={close} role="presentation">
		<div
			class="modal omni-card glass modal-in"
			role="dialog"
			aria-modal="true"
			aria-label={$t('search.title')}
			onclick={(e) => e.stopPropagation()}
			onkeydown={onKey}
		>
			<div class="bar">
				<span class="ico">🔍</span>
				<input
					bind:this={inputEl}
					bind:value={q}
					oninput={onInput}
					placeholder={$t('search.ph')}
					aria-label={$t('search.ph')}
				/>
				<button class="x" onclick={close} aria-label={$t('common.close')}>✕</button>
			</div>

			{#if q.trim().length < 2}
				{#if $searchHistory.length}
					<div class="section">{$t('search.recent')}</div>
					<div class="hist">
						{#each $searchHistory as term (term)}
							<span class="chip">
								<button class="chip-main" onclick={() => useHistory(term)}>{term}</button>
								<button class="chip-x" onclick={() => removeSearch(term)} aria-label="x">✕</button>
							</span>
						{/each}
					</div>
				{:else}
					<div class="hint">{$t('search.hint')}</div>
				{/if}
			{:else if loading}
				<div class="hint">{$t('search.searching')}</div>
			{:else if results.length === 0}
				<div class="hint">{$t('search.none')}</div>
			{:else}
				<div class="results">
					{#each results as item (item.media_type + '-' + item.id)}
						<button class="res" onclick={() => pick(item)} title={item.title}>
							{#if item.poster}<img src={item.poster} alt={item.title} loading="lazy" />{:else}<div class="noimg">?</div>{/if}
							<div class="meta">
								<div class="rtitle">{item.title}</div>
								<div class="rsub">
									{item.media_type === 'tv' ? $t('common.series') : $t('common.movie')}{year(item.release_date) ? ' · ' + year(item.release_date) : ''}
								</div>
							</div>
						</button>
					{/each}
				</div>
				<div class="foot">{$t('search.foot')}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.ov { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: flex-start; padding-top: 12vh; z-index: 1150; }
	.modal { width: min(620px, 94vw); max-height: 74vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-3); }
	.bar { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--border); }
	.ico { font-size: 16px; opacity: 0.8; }
	.bar input { flex: 1; background: transparent; border: none; outline: none; color: var(--text); font-size: 16px; }
	.x { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 8px; }
	.x:hover { background: var(--bg-card); color: var(--text); }

	.section { padding: 12px 16px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
	.hist { display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 16px 16px; }
	.chip { display: inline-flex; align-items: center; background: var(--bg-card); border-radius: 99px; overflow: hidden; }
	.chip-main { background: transparent; border: none; color: var(--text); cursor: pointer; padding: 7px 4px 7px 12px; font-size: 13px; }
	.chip-x { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 7px 10px 7px 6px; font-size: 11px; }
	.chip-x:hover { color: var(--text); }

	.hint { padding: 26px 16px; text-align: center; color: var(--text-muted); font-size: 13.5px; }

	.results { overflow-y: auto; padding: 8px; }
	.res { display: flex; gap: 12px; align-items: center; width: 100%; text-align: left; background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 10px; }
	.res:hover { background: var(--bg-card); }
	.res img, .res .noimg { width: 46px; height: 69px; object-fit: cover; border-radius: 6px; flex: 0 0 auto; }
	.res .noimg { display: grid; place-items: center; background: var(--bg-card); color: var(--text-muted); }
	.meta { min-width: 0; }
	.rtitle { font-weight: 600; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.rsub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
	.foot { padding: 10px 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); text-align: center; }
</style>
