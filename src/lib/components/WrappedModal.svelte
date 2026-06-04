<script lang="ts">
	import { totalWatchMs, openCount, watchTime, watchLog, openLog, rangeWatch, rangeOpens, formatDuration } from '$lib/stores/tracking';
	import { providers, favorites } from '$lib/stores/providers';
	import { watchlist } from '$lib/stores/watchlist';
	import { achievements } from '$lib/stores/achievements';
	import { settings } from '$lib/stores/settings';
	import { t } from '$lib/i18n';

	let { onClose }: { onClose: () => void } = $props();

	const curYear = new Date().getFullYear().toString();
	let period = $state(curYear); // 'all' oder 'YYYY'

	const years = $derived.by(() => {
		const ys = new Set<string>();
		for (const d of Object.keys($watchLog)) ys.add(d.slice(0, 4));
		if (!ys.has(curYear)) ys.add(curYear);
		return [...ys].sort().reverse();
	});

	const isAll = $derived(period === 'all');
	const from = $derived(isAll ? null : `${period}-01-01`);
	const to = $derived(isAll ? null : `${period}-12-31`);
	const rw = $derived(isAll ? { byProvider: $watchTime, total: $totalWatchMs } : rangeWatch($watchLog, from, to));
	const opens = $derived(isAll ? $openCount : rangeOpens($openLog, from, to));
	const totalMs = $derived(rw.total);
	const distinct = $derived(Object.values(rw.byProvider).filter((ms) => ms > 0).length);
	const empty = $derived(totalMs === 0 && opens === 0);

	const topProviders = $derived.by(() => {
		const provs = $providers;
		const entries = Object.entries(rw.byProvider)
			.filter(([, ms]) => ms > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3);
		const max = entries.length ? entries[0][1] : 1;
		return entries.map(([id, ms]) => {
			const p = provs.find((x) => x.id === id);
			return {
				name: p?.name ?? id,
				color: p?.color ?? '#30c5bb',
				ms,
				pct: Math.max(8, Math.round((ms / max) * 100))
			};
		});
	});

	const ach = $derived.by(() => {
		const a = $achievements;
		return { unlocked: a.filter((x) => x.unlocked).length, total: a.length };
	});

	// Wochen-Heatmap: tägliche Sehzeit (über alle Anbieter summiert).
	const locale = $derived($settings.appearance.language === 'en' ? 'en-US' : 'de-DE');
	const weekdayLabels = $derived($settings.appearance.language === 'en' ? ['Mon', '', 'Wed', '', 'Fri', '', ''] : ['Mo', '', 'Mi', '', 'Fr', '', '']);
	function ymd2(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	const dailyTotals = $derived.by(() => {
		const out: Record<string, number> = {};
		for (const [date, byProv] of Object.entries($watchLog)) {
			let s = 0;
			for (const v of Object.values(byProv)) s += v;
			out[date] = s;
		}
		return out;
	});
	type Cell = { date: string; ms: number; level: number; inRange: boolean };
	const heat = $derived.by(() => {
		const todayStr = ymd2(new Date());
		let startD: Date, endD: Date;
		if (isAll) {
			endD = new Date();
			startD = new Date();
			startD.setDate(startD.getDate() - (26 * 7 - 1)); // letzte 26 Wochen
		} else {
			startD = new Date(`${period}-01-01T00:00:00`);
			endD = new Date(`${period}-12-31T00:00:00`);
		}
		const startStr = ymd2(startD);
		const endStr = ymd2(endD);
		// Gitter auf volle Wochen ausrichten (Mo–So).
		const gridStart = new Date(startD);
		gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));
		const gridEnd = new Date(endD);
		gridEnd.setDate(gridEnd.getDate() + (6 - ((gridEnd.getDay() + 6) % 7)));
		const weeks: { label: string; cells: Cell[] }[] = [];
		const cur = new Date(gridStart);
		let prevMonth = -1;
		while (cur <= gridEnd) {
			const cells: Cell[] = [];
			let label = '';
			for (let i = 0; i < 7; i++) {
				if (i === 0) {
					const mo = cur.getMonth();
					if (mo !== prevMonth) { label = cur.toLocaleDateString(locale, { month: 'short' }); prevMonth = mo; }
				}
				const ds = ymd2(cur);
				const inRange = ds >= startStr && ds <= endStr && ds <= todayStr;
				const ms = inRange ? (dailyTotals[ds] ?? 0) : 0;
				let level = 0;
				if (inRange && ms > 0) { const min = ms / 60000; level = min < 30 ? 1 : min < 60 ? 2 : min < 120 ? 3 : 4; }
				cells.push({ date: ds, ms, level, inRange });
				cur.setDate(cur.getDate() + 1);
			}
			weeks.push({ label, cells });
		}
		return weeks;
	});
	function cellTitle(c: Cell): string {
		if (!c.inRange) return '';
		const d = new Date(c.date + 'T00:00:00').toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
		return c.ms > 0 ? `${d}: ${formatDuration(c.ms)}` : d;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={onKey} />


<div class="overlay" onclick={onClose} role="presentation">
	<div class="card" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
		<button class="close" onclick={onClose} aria-label={$t('common.close')}>✕</button>

		<div class="head">
			<div class="brand"><span class="dot"></span> <span>OmniHub</span></div>
			<h2>{$t('wrapped.title')}</h2>
			<p class="sub">{$t('wrapped.sub')}</p>
			<div class="periods">
				<button class:on={period === 'all'} onclick={() => (period = 'all')}>{$t('wrapped.periodAll')}</button>
				{#each years as y}
					<button class:on={period === y} onclick={() => (period = y)}>{y}</button>
				{/each}
			</div>
		</div>

		{#if empty}
			<div class="empty">{$t('wrapped.empty')}</div>
		{:else}
			<div class="hero">
				<span class="big">{formatDuration(totalMs)}</span>
				<span class="biglbl">{$t('stats.totalTime')}</span>
			</div>

			<div class="stats">
				<div class="stat"><span class="num">{opens}</span><span class="lbl">{$t('stats.startedStreams')}</span></div>
				<div class="stat"><span class="num">{distinct}</span><span class="lbl">{$t('stats.usedProviders')}</span></div>
				<div class="stat"><span class="num">{$favorites.length}</span><span class="lbl">{$t('stats.favorites')}</span></div>
				<div class="stat"><span class="num">{$watchlist.length}</span><span class="lbl">{$t('stats.watchlistTitles')}</span></div>
			</div>

			{#if topProviders.length}
				<div class="block">
					<div class="block-label">{$t('wrapped.topProviders')}</div>
					{#each topProviders as tp, i}
						<div class="prow">
							<span class="rank">{i + 1}</span>
							<div class="pbar-wrap">
								<div class="pname">{tp.name}</div>
								<div class="pbar"><div class="pfill" style="width: {tp.pct}%; background: {tp.color}"></div></div>
							</div>
							<span class="ptime">{formatDuration(tp.ms)}</span>
						</div>
					{/each}
				</div>
			{/if}

			<div class="block">
				<div class="block-label">{$t('wrapped.heatmap')}</div>
				<div class="heat-wrap">
					<div class="heat-days">
						{#each weekdayLabels as wl}<span>{wl}</span>{/each}
					</div>
					<div class="heat-cols">
						<div class="heat-months">
							{#each heat as w}<span class="heat-mo">{w.label}</span>{/each}
						</div>
						<div class="heat-grid">
							{#each heat as w}
								<div class="heat-col">
									{#each w.cells as c}
										<span class="heat-cell" class:out={!c.inRange} data-lv={c.level} title={cellTitle(c)}></span>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>
				<div class="heat-legend">
					<span>{$t('wrapped.heatLess')}</span>
					<span class="heat-cell" data-lv="0"></span>
					<span class="heat-cell" data-lv="1"></span>
					<span class="heat-cell" data-lv="2"></span>
					<span class="heat-cell" data-lv="3"></span>
					<span class="heat-cell" data-lv="4"></span>
					<span>{$t('wrapped.heatMore')}</span>
				</div>
			</div>

			<div class="ach">🏆 {$t('wrapped.achievementsLine', { n: ach.unlocked, total: ach.total })}</div>
		{/if}

		<p class="share">{$t('wrapped.shareHint')}</p>
	</div>
</div>

<style>
	.overlay {
		position: fixed; inset: 0; z-index: 400;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: grid; place-items: center; padding: 24px;
	}
	.card {
		position: relative;
		width: min(440px, 100%);
		max-height: 90vh; overflow-y: auto;
		background: radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 22%, var(--bg-elev)), var(--bg-card) 70%);
		border: 1px solid var(--border-strong);
		border-radius: 20px;
		padding: 26px 24px 18px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
		text-align: center;
	}
	.close {
		position: absolute; top: 12px; right: 12px;
		width: 30px; height: 30px; border-radius: 8px;
		background: var(--bg-card-2); border: 1px solid var(--border);
		color: var(--text); cursor: pointer; font-size: 14px;
	}
	.head .brand { display: inline-flex; align-items: center; gap: 7px; font-weight: 800; letter-spacing: 0.2px; opacity: 0.9; }
	.head .brand .dot { width: 14px; height: 14px; border-radius: 5px; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #000)); }
	.head h2 { margin: 10px 0 2px; font-size: 22px; }
	.sub { color: var(--text-muted); font-size: 13px; margin: 0; }
	.periods { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 12px; }
	.periods button { padding: 5px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-muted); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease; }
	.periods button:hover { border-color: var(--border-strong); }
	.periods button.on { border-color: var(--accent); color: var(--text); background: color-mix(in srgb, var(--accent) 14%, transparent); }
	.empty { padding: 40px 10px; color: var(--text-muted); }
	.hero { margin: 22px 0 18px; display: flex; flex-direction: column; gap: 2px; }
	.big { font-size: 40px; font-weight: 800; color: var(--accent); line-height: 1; }
	.biglbl { color: var(--text-muted); font-size: 13px; }
	.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
	.stat { background: color-mix(in srgb, var(--bg-card) 70%, transparent); border: 1px solid var(--border); border-radius: 12px; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
	.stat .num { font-size: 22px; font-weight: 700; }
	.stat .lbl { color: var(--text-muted); font-size: 11.5px; }
	.block { margin-top: 18px; text-align: left; }
	.block-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
	.prow { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
	.rank { width: 18px; font-weight: 800; color: var(--text-muted); }
	.pbar-wrap { flex: 1; min-width: 0; }
	.pname { font-size: 13px; font-weight: 600; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.pbar { height: 7px; background: var(--bg-card-2); border-radius: 999px; overflow: hidden; }
	.pfill { height: 100%; border-radius: 999px; }
	.ptime { font-size: 12px; color: var(--text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
	.ach { margin-top: 18px; padding: 12px; border-radius: 12px; background: color-mix(in srgb, var(--accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); font-weight: 600; font-size: 14px; }
	.heat-wrap { display: flex; gap: 6px; align-items: flex-start; }
	.heat-days { display: flex; flex-direction: column; gap: 3px; padding-top: 16px; flex-shrink: 0; }
	.heat-days span { height: 11px; line-height: 11px; font-size: 9px; color: var(--text-dim); }
	.heat-cols { overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
	.heat-months { display: flex; height: 13px; }
	.heat-mo { width: 14px; font-size: 9px; color: var(--text-dim); white-space: nowrap; overflow: visible; }
	.heat-grid { display: flex; gap: 3px; }
	.heat-col { display: flex; flex-direction: column; gap: 3px; }
	.heat-cell { width: 11px; height: 11px; border-radius: 2.5px; background: color-mix(in srgb, var(--accent) 0%, var(--bg-card-2)); }
	.heat-cell[data-lv="1"] { background: color-mix(in srgb, var(--accent) 30%, var(--bg-card-2)); }
	.heat-cell[data-lv="2"] { background: color-mix(in srgb, var(--accent) 55%, var(--bg-card-2)); }
	.heat-cell[data-lv="3"] { background: color-mix(in srgb, var(--accent) 78%, var(--bg-card-2)); }
	.heat-cell[data-lv="4"] { background: var(--accent); }
	.heat-cell.out { background: transparent; }
	.heat-legend { display: flex; align-items: center; gap: 4px; margin-top: 10px; font-size: 10px; color: var(--text-dim); }
	.heat-legend .heat-cell { width: 10px; height: 10px; }
	.share { margin: 16px 0 0; color: var(--text-dim); font-size: 12px; }
</style>
