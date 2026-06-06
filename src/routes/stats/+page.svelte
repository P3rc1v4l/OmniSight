<script lang="ts">
	import { watchlist } from '$lib/stores/watchlist';
	import SeenTitlesModal from '$lib/components/SeenTitlesModal.svelte';
	import { watchTime, totalWatchMs, openCount, distinctProvidersWatched, formatDuration } from '$lib/stores/tracking';
	import { achievements, unlockedCount } from '$lib/stores/achievements';
	import { providers, favorites } from '$lib/stores/providers';
	import Logo from '$lib/components/Logo.svelte';
	import { t } from '$lib/i18n';
	import WrappedModal from '$lib/components/WrappedModal.svelte';

	let showWrapped = $state(false);
	let showSeenModal = $state(false);
	// Anzahl gesehener Titel (für die Kennzahl).
	const seenTitles = $derived($watchlist.filter((w) => w.seen));

	const favCount = $derived($favorites.length);

	// Top-Anbieter nach Streamzeit
	const topProviders = $derived.by(() => {
		const entries = Object.entries($watchTime)
			.filter(([, ms]) => ms > 0)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6);
		const max = entries.length ? entries[0][1] : 1;
		return entries.map(([id, ms]) => ({
			provider: $providers.find((p) => p.id === id),
			ms,
			pct: Math.round((ms / max) * 100)
		})).filter((x) => x.provider);
	});
</script>

<div class="page">
	<h1>{$t('stats.title')}</h1>
	<p class="sub">{$t('stats.sub')}</p>
	<div class="top-actions">
		<button class="wrapped-btn" onclick={() => (showWrapped = true)}>{$t('stats.wrapped')}</button>
		<button class="wrapped-btn" onclick={() => (showSeenModal = true)}>👁 {$t('stats.seenList')} ({seenTitles.length})</button>
	</div>

	<div class="cards">
		<div class="stat omni-card"><span class="big">{formatDuration($totalWatchMs)}</span><span>{$t('stats.totalTime')}</span></div>
		<div class="stat omni-card"><span class="big">{$openCount}</span><span>{$t('stats.startedStreams')}</span></div>
		<div class="stat omni-card"><span class="big">{$distinctProvidersWatched}</span><span>{$t('stats.usedProviders')}</span></div>
		<div class="stat omni-card"><span class="big">{favCount}</span><span>{$t('stats.favorites')}</span></div>
		<div class="stat omni-card"><span class="big">{$watchlist.length}</span><span>{$t('stats.watchlistTitles')}</span></div>
		<div class="stat omni-card"><span class="big">{seenTitles.length}</span><span>{$t('stats.seenTitles')}</span></div>
		<div class="stat omni-card"><span class="big">{$unlockedCount} / {$achievements.length}</span><span>{$t('stats.achievements')}</span></div>
	</div>

	{#if topProviders.length}
		<h2>{$t('stats.topProviders')}</h2>
		<div class="bars omni-card">
			{#each topProviders as t}
				<div class="bar-row">
					<div class="bl">
						<Logo provider={t.provider} size={26} />
						<span class="bn">{t.provider?.name}</span>
					</div>
					<div class="track"><div class="fill" style="width: {t.pct}%; background: {t.provider?.color}"></div></div>
					<span class="bt">{formatDuration(t.ms)}</span>
				</div>
			{/each}
		</div>
	{/if}

	<h2>{$t('stats.achievements')}</h2>
	<div class="ach">
		{#each $achievements as a (a.id)}
			<div class="aitem omni-card" class:on={a.unlocked}>
				<div class="badge">{a.unlocked ? a.icon : '🔒'}</div>
				<div class="ainfo">
					<div class="aname">{a.name}</div>
					<div class="adesc">{a.desc}</div>
					{#if !a.unlocked}
						<div class="aprog"><div class="afill" style="width: {a.progress * 100}%"></div></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<p class="hint">{$t('stats.hint')}</p>
</div>

{#if showWrapped}
	<WrappedModal onClose={() => (showWrapped = false)} />
{/if}
<SeenTitlesModal open={showSeenModal} onClose={() => (showSeenModal = false)} />

<style>
	.page { padding: 22px 28px 36px; }
	.wrapped-btn { margin: 4px 0 8px; padding: 9px 16px; border-radius: 10px; border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--text); font-weight: 700; font-size: 13px; cursor: pointer; transition: border-color 0.15s ease, transform 0.1s ease; }
	.wrapped-btn:hover { border-color: var(--accent); transform: translateY(-1px); }
	h1 { margin: 0; font-size: 26px; font-weight: 800; }
	h2 { margin: 28px 0 10px; font-size: 16px; font-weight: 700; }
	.sub { color: var(--text-muted); margin: 4px 0 22px; }
	.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
	.stat { padding: 18px; display: flex; flex-direction: column; gap: 4px; }
	.big { font-size: 22px; font-weight: 800; color: var(--accent); }
	.stat span:last-child { color: var(--text-muted); font-size: 12px; }

	.bars { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
	.bar-row { display: flex; align-items: center; gap: 12px; }
	.bl { display: flex; align-items: center; gap: 10px; width: 180px; flex-shrink: 0; }
	.bn { font-size: 13px; font-weight: 600; }
	.track { flex: 1; height: 10px; background: var(--bg-card-2); border-radius: 999px; overflow: hidden; }
	.fill { height: 100%; border-radius: 999px; }
	.bt { width: 80px; text-align: right; color: var(--text-muted); font-size: 12px; flex-shrink: 0; }

	.ach { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
	.aitem { display: flex; gap: 12px; padding: 12px 14px; align-items: center; opacity: 0.6; }
	.aitem.on { opacity: 1; border-color: var(--accent); }
	.badge { font-size: 22px; flex-shrink: 0; }
	.ainfo { flex: 1; min-width: 0; }
	.aname { font-weight: 700; font-size: 13.5px; }
	.adesc { color: var(--text-muted); font-size: 12px; }
	.aprog { height: 5px; background: var(--bg-card-2); border-radius: 999px; margin-top: 6px; overflow: hidden; }
	.afill { height: 100%; background: var(--accent); border-radius: 999px; }
	.top-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 4px 0 8px; }
	.hint { color: var(--text-muted); font-size: 12.5px; margin-top: 18px; }
</style>
