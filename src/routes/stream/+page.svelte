<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { activeStream } from '$lib/stores/providers';
	import { watchTime, sessionStart, formatDuration } from '$lib/stores/tracking';
	import { showEmbedded, hideEmbedded, repositionEmbedded, closeEmbedded, streamMode, immersive, setImmersive, type Rect } from '$lib/embedded';
	import { openInWindow } from '$lib/streamWindow';
	import Logo from '$lib/components/Logo.svelte';

	let host = $state<HTMLDivElement | null>(null);
	let now = $state(Date.now());

	function rectOf(): Rect | null {
		if (!host) return null;
		const r = host.getBoundingClientRect();
		return { x: r.left, y: r.top, width: r.width, height: r.height };
	}

	async function refresh() {
		await tick();
		requestAnimationFrame(() => {
			const r = rectOf();
			const p = $activeStream;
			if (r && p) showEmbedded(p, r);
		});
	}

	function onResize() {
		const r = rectOf();
		if (r) repositionEmbedded(r);
	}

	onMount(() => {
		const timer = setInterval(() => (now = Date.now()), 1000);
		window.addEventListener('resize', onResize);
		return () => {
			clearInterval(timer);
			window.removeEventListener('resize', onResize);
		};
	});

	onDestroy(() => {
		hideEmbedded();
		void setImmersive(false);
	});

	// Beim Mounten und bei Anbieterwechsel einbetten (läuft nur, solange die Seite offen ist).
	$effect(() => {
		if ($activeStream) refresh();
	});

	// Immersiv-Wechsel: Oberfläche blendet sich aus/ein -> Webview an die neue
	// (größere/kleinere) Fläche anpassen, sobald das Layout neu gezeichnet ist.
	$effect(() => {
		$immersive;
		if (!$activeStream) return;
		tick().then(() => requestAnimationFrame(() => onResize()));
	});

	const liveMs = $derived.by(() => {
		const p = $activeStream;
		if (!p) return 0;
		const stored = $watchTime[p.id] ?? 0;
		const start = sessionStart(p.id);
		return stored + (start ? now - start : 0);
	});

	async function close() {
		await closeEmbedded();
		activeStream.set(null);
		goto('/');
	}
</script>

<div class="page">
	{#if !$activeStream}
		<div class="empty">
			<h1>Schaut gerade</h1>
			<p class="muted">Aktuell ist kein Stream geöffnet. Öffne einen Anbieter über die Übersicht.</p>
		</div>
	{:else}
		<div class="bar">
			<Logo provider={$activeStream} size={26} />
			<div class="info">
				<span class="nm">{$activeStream.name}</span>
				<span class="sub">{$activeStream.subtitle}</span>
			</div>
			<span class="timer">⏱ {formatDuration(liveMs)}</span>
			{#if $streamMode === 'window'}
				<button class="btn" onclick={() => $activeStream && openInWindow($activeStream)}>Fenster zeigen</button>
			{:else}
				<button class="btn" onclick={() => setImmersive(!$immersive)} title={$immersive ? 'Vollbild beenden (Esc-Knopf hier)' : 'Stream auf Vollbild'}>
					{$immersive ? '⤡ Vollbild beenden' : '⛶ Vollbild'}
				</button>
			{/if}
			<button class="btn danger" onclick={close}>Schließen</button>
		</div>

		{#if $streamMode === 'window'}
			<div class="hostnote">
				<p>Dieser Anbieter wird in einem separaten Fenster angezeigt (Einbetten war auf diesem System nicht möglich).</p>
			</div>
		{:else}
			<div class="host" bind:this={host}>
				<span class="loading">Anbieter wird geladen…</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; height: 100%; }
	.empty { padding: 22px 28px; }
	.empty h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
	.muted { color: var(--text-muted); }
	.bar {
		display: flex; align-items: center; gap: 12px;
		padding: 10px 18px; border-bottom: 1px solid var(--border);
		background: var(--bg-elev); flex-shrink: 0;
	}
	.info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
	.nm { font-weight: 700; font-size: 14px; }
	.sub { color: var(--text-muted); font-size: 12px; }
	.timer { color: var(--accent); font-weight: 700; font-variant-numeric: tabular-nums; font-size: 13px; }
	.btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 9px; cursor: pointer; font-size: 13px; }
	.btn:hover { border-color: var(--border-strong); }
	.btn.danger:hover { color: #f87171; border-color: #f87171; }
	.host { flex: 1; position: relative; display: grid; place-items: center; background: var(--bg); }
	.loading { color: var(--text-dim); font-size: 13px; }
	.hostnote { flex: 1; display: grid; place-items: center; padding: 40px; }
	.hostnote p { color: var(--text-muted); max-width: 420px; text-align: center; }
</style>
