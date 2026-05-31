<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchWeekSchedule, type AiringItem } from '$lib/anilist';
	import { openUrlInApp } from '$lib/embedded';

	let items = $state<AiringItem[]>([]);
	let loading = $state(true);
	let failed = $state(false);
	let onlyCrunchyroll = $state(true);
	let range = $state<'next' | 'last'>('next');

	async function load() {
		loading = true;
		failed = false;
		try {
			items = await fetchWeekSchedule(range);
		} catch {
			failed = true;
		}
		loading = false;
	}
	onMount(load);

	function setRange(r: 'next' | 'last') {
		if (range === r) return;
		range = r;
		void load();
	}

	const filtered = $derived(onlyCrunchyroll ? items.filter((i) => i.crunchyrollUrl) : items);
	const crCount = $derived(items.filter((i) => i.crunchyrollUrl).length);

	function dayLabel(d: Date): string {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const dd = new Date(d);
		dd.setHours(0, 0, 0, 0);
		const diff = Math.round((dd.getTime() - today.getTime()) / 86400000);
		if (diff === 0) return 'Heute';
		if (diff === 1) return 'Morgen';
		if (diff === -1) return 'Gestern';
		return dd.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
	}
	function timeLabel(ts: number): string {
		return new Date(ts * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	}

	const groups = $derived.by(() => {
		const m = new Map<string, { label: string; isToday: boolean; sort: number; items: AiringItem[] }>();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		for (const it of filtered) {
			const d = new Date(it.airingAt * 1000);
			const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
			if (!m.has(key)) {
				const dd = new Date(d);
				dd.setHours(0, 0, 0, 0);
				m.set(key, { label: dayLabel(d), isToday: dd.getTime() === today.getTime(), sort: dd.getTime(), items: [] });
			}
			m.get(key)!.items.push(it);
		}
		const arr = [...m.values()].sort((a, b) => (range === 'last' ? b.sort - a.sort : a.sort - b.sort));
		for (const g of arr) g.items.sort((a, b) => a.airingAt - b.airingAt);
		return arr;
	});

	function openCrunchyroll(it: AiringItem) {
		if (it.crunchyrollUrl) openUrlInApp(it.title, it.crunchyrollUrl, 'crunchyroll', 'Crunchyroll', '#f47521', '#7a3210');
	}
	function openInfo(it: AiringItem) {
		if (it.siteUrl) openUrlInApp(it.title, it.siteUrl, 'web-info', 'AniList', '#2b2d42', '#1f2233');
	}
</script>

<div class="page">
	<header class="head">
		<div class="head-title">
			<span class="ico">⛩️</span>
			<div>
				<h1>CR&nbsp;Kalender</h1>
				<p class="sub">Anime-Ausstrahlung der {range === 'last' ? 'letzten' : 'nächsten'} 7&nbsp;Tage · Quelle: AniList</p>
			</div>
		</div>
		<div class="controls">
			<div class="range">
				<button class:on={range === 'next'} onclick={() => setRange('next')}>Nächste 7 Tage</button>
				<button class:on={range === 'last'} onclick={() => setRange('last')}>Letzte 7 Tage</button>
			</div>
			<button class="seg" class:on={onlyCrunchyroll} onclick={() => (onlyCrunchyroll = !onlyCrunchyroll)} title="Nur Crunchyroll-Titel zeigen">
				<span class="dot"></span>Nur Crunchyroll
			</button>
			<button class="refresh" onclick={load} disabled={loading} title="Aktualisieren" aria-label="Aktualisieren">↻</button>
		</div>
	</header>

	{#if loading}
		<div class="grid">
			{#each Array(6) as _, i (i)}
				<div class="card skeleton" style="--i:{i}">
					<div class="sk-cover"></div>
					<div class="sk-lines"><span></span><span></span><span></span></div>
				</div>
			{/each}
		</div>
	{:else if failed}
		<div class="state">
			<span class="emoji">⚠️</span>
			<p>Konnte den Plan nicht laden.</p>
			<button class="retry" onclick={load}>Erneut versuchen</button>
		</div>
	{:else if groups.length === 0}
		<div class="state">
			<span class="emoji">⛩️</span>
			<p>{onlyCrunchyroll ? 'Diese Woche keine als Crunchyroll markierten Titel.' : 'Diese Woche keine anstehenden Anime.'}</p>
			{#if onlyCrunchyroll}<button class="retry" onclick={() => (onlyCrunchyroll = false)}>Alle Anime anzeigen</button>{/if}
		</div>
	{:else}
		{#each groups as g (g.label)}
			<section class="day">
				<div class="day-head" class:today={g.isToday}>
					<span class="day-name">{g.label}</span>
					<span class="rule"></span>
					<span class="count">{g.items.length}</span>
				</div>
				<div class="grid">
					{#each g.items as it, i (it.id + '-' + it.episode)}
						<article class="card" class:cr={it.crunchyrollUrl} style="--i:{i}">
							<div class="cover-wrap">
								{#if it.cover}
									<img class="cover" src={it.cover} alt="" loading="lazy" />
								{:else}
									<div class="cover ph">{it.title.slice(0, 1)}</div>
								{/if}
								<span class="time">{timeLabel(it.airingAt)}</span>
							</div>
							<div class="body">
								<div class="title" title={it.title}>{it.title}</div>
								<div class="ep">Episode {it.episode}</div>
								<div class="actions">
									{#if it.crunchyrollUrl}
										<button class="btn cr-btn" onclick={() => openCrunchyroll(it)}>▶ Auf Crunchyroll</button>
									{:else}
										<button class="btn info-btn" onclick={() => openInfo(it)}>Infos ansehen</button>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/each}
		<p class="foot">„Auf Crunchyroll" öffnet den Titel direkt in OmniHub. Die Crunchyroll-Markierung stammt aus AniList und kann unvollständig sein{#if crCount === 0 && !onlyCrunchyroll} (aktuell keine markiert){/if}.</p>
	{/if}
</div>

<style>
	.page { padding: 24px 30px 44px; }

	/* Kopf */
	.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-bottom: 26px; }
	.head-title { display: flex; align-items: center; gap: 14px; }
	.ico {
		font-size: 26px; width: 52px; height: 52px; display: grid; place-items: center; flex-shrink: 0;
		border-radius: 15px; background: linear-gradient(150deg, color-mix(in srgb, #f47521 26%, transparent), color-mix(in srgb, var(--accent) 22%, transparent));
		box-shadow: inset 0 0 0 1px var(--border);
	}
	h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
	.sub { color: var(--text-muted); margin: 3px 0 0; font-size: 13.5px; }
	.controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
	.range { display: inline-flex; background: var(--bg-card); border: 1px solid var(--border); border-radius: 999px; padding: 3px; }
	.range button { background: transparent; border: 0; color: var(--text-muted); font-family: inherit; font-size: 12.5px; font-weight: 600; padding: 6px 13px; border-radius: 999px; cursor: pointer; transition: background 0.15s, color 0.15s; }
	.range button.on { background: var(--accent); color: var(--accent-text); }
	.seg {
		display: inline-flex; align-items: center; gap: 9px; cursor: pointer; font-family: inherit;
		font-size: 13px; font-weight: 600; color: var(--text-muted);
		background: var(--bg-elev); border: 1px solid var(--border); border-radius: 999px; padding: 8px 15px;
		transition: all 0.18s ease;
	}
	.seg .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--text-muted); transition: all 0.18s ease; }
	.seg.on { color: #fff; border-color: color-mix(in srgb, #f47521 60%, transparent); background: color-mix(in srgb, #f47521 16%, var(--bg-elev)); }
	.seg.on .dot { background: #f47521; box-shadow: 0 0 9px #f47521; }
	.refresh {
		width: 38px; height: 38px; border-radius: 10px; cursor: pointer; font-size: 17px;
		background: var(--bg-elev); border: 1px solid var(--border); color: var(--text); transition: all 0.18s ease;
	}
	.refresh:hover:not(:disabled) { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 55%, transparent); transform: rotate(35deg); }
	.refresh:disabled { opacity: 0.45; cursor: default; }

	/* Tages-Überschrift */
	.day { margin-bottom: 30px; }
	.day-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
	.day-name { font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
	.day-head.today .day-name { color: #f47521; text-shadow: 0 0 18px color-mix(in srgb, #f47521 55%, transparent); }
	.rule { flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }
	.count { font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--bg-elev); border: 1px solid var(--border); border-radius: 999px; padding: 2px 9px; }

	/* Karten-Raster */
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
	.card {
		display: flex; gap: 13px; padding: 12px; border-radius: 16px;
		background: linear-gradient(160deg, color-mix(in srgb, var(--bg-card) 92%, #fff 3%), var(--bg-card));
		border: 1px solid var(--border); position: relative; overflow: hidden;
		animation: fadeUp 0.4s ease both; animation-delay: calc(var(--i) * 0.045s);
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent); opacity: 0; transition: opacity 0.2s ease; }
	.card.cr::before { background: #f47521; }
	.card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--accent) 40%, var(--border)); box-shadow: 0 14px 30px -16px rgba(0,0,0,0.7); }
	.card.cr:hover { border-color: color-mix(in srgb, #f47521 50%, var(--border)); box-shadow: 0 14px 32px -15px color-mix(in srgb, #f47521 45%, transparent); }
	.card:hover::before { opacity: 1; }

	.cover-wrap { position: relative; flex-shrink: 0; }
	.cover { width: 62px; height: 88px; object-fit: cover; border-radius: 9px; display: block; box-shadow: 0 4px 12px -4px rgba(0,0,0,0.6); transition: transform 0.25s ease; }
	.card:hover .cover { transform: scale(1.04); }
	.cover.ph { display: grid; place-items: center; font-size: 26px; font-weight: 800; color: var(--text-muted); background: var(--bg-elev); }
	.time {
		position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
		font-size: 11px; font-weight: 700; color: #fff; background: rgba(0,0,0,0.72); backdrop-filter: blur(4px);
		padding: 2px 7px; border-radius: 6px; white-space: nowrap;
	}

	.body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
	.title { font-weight: 700; font-size: 14.5px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.ep { font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }
	.actions { margin-top: auto; padding-top: 10px; }
	.btn { width: 100%; border: none; border-radius: 9px; padding: 8px 12px; font-family: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: filter 0.15s ease, transform 0.1s ease; }
	.btn:active { transform: scale(0.98); }
	.cr-btn { background: linear-gradient(135deg, #f47521, #e0590a); color: #fff; box-shadow: 0 4px 14px -6px #f47521; }
	.cr-btn:hover { filter: brightness(1.08); }
	.info-btn { background: var(--bg-elev); color: var(--text-muted); box-shadow: inset 0 0 0 1px var(--border); }
	.info-btn:hover { color: var(--text); }

	/* Skeleton */
	.skeleton { animation: fadeUp 0.4s ease both; animation-delay: calc(var(--i) * 0.05s); }
	.sk-cover { width: 62px; height: 88px; border-radius: 9px; flex-shrink: 0; background: var(--bg-elev); position: relative; overflow: hidden; }
	.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 9px; padding-top: 4px; }
	.sk-lines span { height: 12px; border-radius: 6px; background: var(--bg-elev); }
	.sk-lines span:nth-child(1) { width: 85%; } .sk-lines span:nth-child(2) { width: 50%; } .sk-lines span:nth-child(3) { width: 100%; height: 30px; margin-top: auto; }
	.sk-cover::after, .sk-lines span::after {
		content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, color-mix(in srgb, #fff 8%, transparent), transparent);
		transform: translateX(-100%); animation: shimmer 1.3s infinite;
	}
	.sk-lines span { position: relative; overflow: hidden; }

	/* Zustände */
	.state { padding: 64px 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; }
	.emoji { font-size: 42px; display: block; margin-bottom: 12px; }
	.retry { margin-top: 14px; background: var(--accent); color: #00110f; border: none; border-radius: 9px; padding: 9px 18px; font-family: inherit; font-weight: 700; cursor: pointer; }
	.foot { color: var(--text-muted); font-size: 12px; margin-top: 22px; line-height: 1.5; }

	@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
	@keyframes shimmer { to { transform: translateX(100%); } }
</style>
