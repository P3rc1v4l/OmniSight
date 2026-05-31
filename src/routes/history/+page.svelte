<script lang="ts">
	import { continueList, removeContinue, clearContinue, type ContinueEntry } from '$lib/stores/continue';
	import { openUrlInApp } from '$lib/embedded';

	function reopen(c: ContinueEntry) {
		openUrlInApp(c.label, c.url, c.id, c.subtitle, c.color, c.color2, c.poster ?? undefined);
	}

	function rel(ts: number): string {
		const s = Math.floor((Date.now() - ts) / 1000);
		if (s < 45) return 'gerade eben';
		const m = Math.floor(s / 60);
		if (m < 60) return `vor ${m} Min`;
		const h = Math.floor(m / 60);
		if (h < 24) return `vor ${h} Std`;
		const d = Math.floor(h / 24);
		if (d < 7) return `vor ${d} Tg`;
		return new Date(ts).toLocaleDateString('de-DE');
	}
</script>

<div class="page">
	<header>
		<div>
			<h1>Verlauf</h1>
			<p class="sub">Zuletzt geöffnete Titel & Anbieter</p>
		</div>
		{#if $continueList.length}
			<button class="clear" onclick={() => clearContinue()}>Verlauf leeren</button>
		{/if}
	</header>

	{#if !$continueList.length}
		<p class="empty">Noch nichts geschaut. Öffne einen Titel oder Anbieter – er erscheint dann hier.</p>
	{:else}
		<div class="list">
			{#each $continueList as c (c.key)}
				<div class="row" style="--c1: {c.color}; --c2: {c.color2 || c.color}">
					<button class="open" onclick={() => reopen(c)} title={`„${c.label}" öffnen`}>
						{#if c.poster}
							<img class="thumb" src={c.poster} alt="" />
						{:else}
							<span class="thumb ph">{c.label.charAt(0).toUpperCase()}</span>
						{/if}
						<span class="meta">
							<span class="nm">{c.label}</span>
							{#if c.subtitle}<span class="sb">{c.subtitle}</span>{/if}
						</span>
						<span class="time">{rel(c.ts)}</span>
					</button>
					<button class="rm" onclick={() => removeContinue(c.key)} title="Aus Verlauf entfernen" aria-label="Aus Verlauf entfernen">✕</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 26px 30px; max-width: 880px; }
	header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
	h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.01em; }
	.sub { margin: 4px 0 0; color: var(--text-muted); font-size: 13px; }
	.clear { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 9px; cursor: pointer; flex-shrink: 0; transition: border-color 0.14s, color 0.14s; }
	.clear:hover { border-color: #e0566822; color: #f87171; border-color: color-mix(in srgb, #f87171 45%, transparent); }
	.empty { color: var(--text-muted); padding: 28px 4px; }

	.list { display: flex; flex-direction: column; gap: 10px; }
	.row { display: flex; align-items: stretch; gap: 8px; }
	.open {
		flex: 1; display: flex; align-items: center; gap: 13px; text-align: left;
		background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
		padding: 10px 14px; cursor: pointer; color: var(--text); overflow: hidden;
		transition: border-color 0.14s, background 0.14s;
	}
	.open:hover { border-color: var(--border-strong); background: color-mix(in srgb, var(--c1) 12%, var(--bg-card)); }
	.thumb { width: 42px; height: 42px; border-radius: 9px; flex-shrink: 0; object-fit: cover; }
	.ph { display: grid; place-items: center; font-size: 18px; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); }
	.meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
	.nm { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.sb { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.time { font-size: 12px; color: var(--text-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
	.rm { width: 40px; flex-shrink: 0; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); border-radius: 12px; cursor: pointer; font-size: 14px; transition: border-color 0.14s, color 0.14s; }
	.rm:hover { color: #f87171; border-color: color-mix(in srgb, #f87171 45%, transparent); }
</style>
