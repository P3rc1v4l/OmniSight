<script lang="ts">
	import { watchlist, removeFromWatchlist } from '$lib/stores/watchlist';
	import { openTitleInfo } from '$lib/tmdb';
	import { pushToast } from '$lib/stores/toasts';
	import { get } from 'svelte/store';
	import type { WatchlistItem } from '$lib/types';

	$: today = new Date().toISOString().slice(0, 10);
	$: releasesToday = $watchlist.filter((x) => x.releaseDate === today);

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
			pushToast('Nichts zu exportieren', 'Deine Watchlist ist leer.', 'ℹ️', 2400);
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
		pushToast('Watchlist exportiert', `${items.length} Titel als Datei gespeichert.`, '📤', 2600);
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
				pushToast('Watchlist importiert', `${added} neue Titel hinzugefügt.`, '📥', 2800);
			} catch {
				pushToast('Import fehlgeschlagen', 'Das ist keine gültige OmniHub-Watchlist-Datei.', '⚠️', 3400);
			}
			input.value = '';
		};
		reader.readAsText(file);
	}
</script>

<div class="page">
	<header class="head">
		<div>
			<h1>Gemerkt</h1>
			<p class="sub">{$watchlist.length} Titel auf deiner Liste</p>
		</div>
		<div class="tools">
			<button class="tool" onclick={exportWatchlist} title="Als Datei speichern">📤 Export</button>
			<button class="tool" onclick={triggerImport} title="Aus Datei laden">📥 Import</button>
			<input bind:this={fileInput} type="file" accept=".json,application/json" onchange={onFile} hidden />
		</div>
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
			<small>Suche oben auf der Übersicht nach einem Titel, öffne das Info-Fenster und klicke „＋ Merken". Oder importiere eine Watchlist-Datei.</small>
		</div>
	{:else}
		<div class="grid">
			{#each $watchlist as w (w.mediaType + '-' + w.tmdbId)}
				<div class="card omni-card">
					<button class="thumb" onclick={() => openInfo(w)} aria-label={`Infos zu ${w.title}`}>
						{#if w.poster}<img src={w.poster} alt={w.title} loading="lazy" />
						{:else}<div class="noimg">?</div>{/if}
					</button>
					<div class="meta">
						<button class="t t-btn" onclick={() => openInfo(w)}>{w.title}</button>
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
	.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
	h1 { margin: 0; font-size: 26px; font-weight: 800; }
	.sub { color: var(--text-muted); margin: 4px 0 0; }
	.tools { display: flex; gap: 10px; }
	.tool { background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); border-radius: 9px; padding: 9px 14px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; }
	.tool:hover { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
	.banner { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent); padding: 12px 16px; border-radius: 12px; margin-bottom: 18px; font-size: 14px; }
	.empty { padding: 56px; text-align: center; color: var(--text-muted); }
	.emoji { font-size: 40px; display: block; margin-bottom: 10px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
	.card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
	.thumb { padding: 0; border: 0; background: none; cursor: pointer; display: block; width: 100%; }
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
	.rm:hover { color: #f87171; border-color: #f87171; }
</style>
