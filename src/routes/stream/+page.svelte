<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { activeStream } from '$lib/stores/providers';
	import { settings } from '$lib/stores/settings';
	import { watchTime, sessionStart, formatDuration } from '$lib/stores/tracking';
	import { showEmbedded, hideEmbedded, repositionEmbedded, closeEmbedded, streamMode, immersive, setImmersive, miniPlayer, goMini, pushForegroundToBackground, streamError, reloadEmbedded, openCurrentInWindow, type Rect } from '$lib/embedded';
	import { openInWindow } from '$lib/streamWindow';
	import Logo from '$lib/components/Logo.svelte';

	let host = $state<HTMLDivElement | null>(null);
	let now = $state(Date.now());

	// Vollbild: schmaler Streifen oben zum Einblenden der Leiste; Höhe der Leiste.
	const REVEAL_STRIP = 2;
	const BAR_H = 46;
	let barRevealed = $state(false);

	function rectOf(): Rect | null {
		// Im Vollbild füllt das Webview das ganze Fenster (randlos). Ist die Leiste
		// ausgeblendet, bleibt nur ein winziger Streifen oben frei, damit OmniSight die
		// Maus am oberen Rand erkennen kann; ist sie eingeblendet, beginnt das Video
		// unter der Leiste.
		if (get(immersive)) {
			const W = window.innerWidth;
			const H = window.innerHeight;
			const top = barRevealed ? BAR_H : REVEAL_STRIP;
			return { x: 0, y: top, width: W, height: H - top };
		}
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

	// Im Vollbild die ECHTE Fenster-Innengröße von Tauri verwenden (physische Pixel ->
	// logische über den Skalierungsfaktor). window.innerHeight stimmt während des
	// Vollbild-Übergangs noch nicht, daher hier direkt am Fenster messen.
	async function fullscreenRect(): Promise<Rect> {
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		const w = getCurrentWindow();
		const sz = await w.innerSize();
		const sf = await w.scaleFactor();
		const W = Math.round(sz.width / sf);
		const H = Math.round(sz.height / sf);
		const top = barRevealed ? BAR_H : REVEAL_STRIP;
		return { x: 0, y: top, width: W, height: H - top };
	}

	async function onResize() {
		if (!$activeStream) return;
		if (get(immersive)) {
			try {
				repositionEmbedded(await fullscreenRect());
				return;
			} catch {
				/* Fallback unten */
			}
		}
		const r = rectOf();
		if (r) repositionEmbedded(r);
	}

	let unlistenResized: (() => void) | null = null;

	onMount(() => {
		miniPlayer.set(false); // Vollansicht – kein Mini-Player auf dieser Seite.
		const timer = setInterval(() => (now = Date.now()), 1000);
		window.addEventListener('resize', onResize);
		// Echtes Fenster-Resize-Event von Tauri abonnieren: feuert, wenn der
		// Vollbild-Übergang final ist -> dann exakt nachpositionieren.
		void (async () => {
			try {
				const { getCurrentWindow } = await import('@tauri-apps/api/window');
				unlistenResized = await getCurrentWindow().onResized(() => { void onResize(); });
			} catch {
				/* ignore */
			}
		})();
		return () => {
			clearInterval(timer);
			window.removeEventListener('resize', onResize);
			unlistenResized?.();
		};
	});

	onDestroy(() => {
		void setImmersive(false);
		// Verlässt man die Seite, ohne den Stream zu schließen, läuft er als
		// Mini-Player weiter – sofern in den Einstellungen aktiviert; sonst ausblenden.
		if (get(activeStream) && get(streamMode) === 'embedded' && get(settings).plugins.miniPlayerEnabled) goMini();
		else hideEmbedded();
	});

	// Beim Mounten und bei Anbieterwechsel einbetten (läuft nur, solange die Seite offen ist).
	$effect(() => {
		if ($activeStream) refresh();
	});

	// Immersiv-/Reveal-Wechsel: Oberfläche bzw. Leiste ändert sich -> Webview an die
	// neue Fläche anpassen, sobald das Layout neu gezeichnet ist.
	$effect(() => {
		const imm = $immersive;
		barRevealed;
		if (!$activeStream) return;
		tick().then(() => requestAnimationFrame(() => onResize()));
		// Der Vollbild-Übergang (maximiert -> Vollbild) braucht einen Moment, bis die
		// Fenstergröße final ist. Mehrfach nachpositionieren, sonst bleibt unten ein
		// Streifen (≈ Taskleistenhöhe) frei.
		if (imm) {
			setTimeout(onResize, 120);
			setTimeout(onResize, 350);
			setTimeout(onResize, 700);
		}
	});

	// Verlässt man den Vollbildmodus, die Leiste wieder „normal" zeigen.
	$effect(() => {
		if (!$immersive) barRevealed = false;
	});

	const liveMs = $derived.by(() => {
		const p = $activeStream;
		if (!p) return 0;
		const stored = $watchTime[p.id] ?? 0;
		const start = sessionStart(p.id);
		return stored + (start ? now - start : 0);
	});

	async function close() {
		miniPlayer.set(false);
		await closeEmbedded();
		activeStream.set(null);
		goto('/');
	}

	// Stream in den Hintergrund schieben (läuft weiter, Ton bleibt) und zur Übersicht.
	function toBackground() {
		void setImmersive(false);
		pushForegroundToBackground();
		goto('/');
	}

	// Eingebetteten Stream neu laden (Crash-Recovery).
	async function reload() {
		const r = get(immersive) ? await fullscreenRect() : rectOf();
		if (r) await reloadEmbedded(r);
	}
</script>

<div class="page">
	{#if !$activeStream}
		<div class="empty">
			<h1>Schaut gerade</h1>
			<p class="muted">Aktuell ist kein Stream geöffnet. Öffne einen Anbieter über die Übersicht.</p>
		</div>
	{:else}
		{#if $immersive}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="reveal-strip"
				onmouseenter={() => (barRevealed = true)}
				onmousemove={() => (barRevealed = true)}
			></div>
		{/if}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="bar"
			class:imm={$immersive}
			class:revealed={barRevealed}
			onmouseleave={() => { if ($immersive) barRevealed = false; }}
		>
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
			{#if $streamMode === 'embedded'}
				<button class="btn" onclick={reload} title="Stream neu laden (bei schwarzem Bild / Hängern)">↻ Neu laden</button>
				<button class="btn" onclick={toBackground} title="Stream läuft im Hintergrund weiter – Ton bleibt, bis du ihn stummschaltest">⤓ Hintergrund</button>
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
				{#if $streamError}
					<div class="recovery">
						<span class="rec-ic">⚠️</span>
						<h2>Der Stream konnte nicht geladen werden</h2>
						<p>Das eingebettete Fenster hat nicht reagiert oder wurde unerwartet beendet. Du kannst es neu laden oder den Anbieter in einem eigenen Fenster öffnen.</p>
						<div class="rec-actions">
							<button class="btn primary" onclick={reload}>↻ Erneut versuchen</button>
							<button class="btn" onclick={() => openCurrentInWindow()}>In eigenem Fenster öffnen</button>
						</div>
					</div>
				{/if}
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
	/* Vollbild: Leiste als schwebendes Overlay, das von oben einfährt. */
	.bar.imm {
		position: fixed; top: 0; left: 0; right: 0; z-index: 50;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
		background: color-mix(in srgb, var(--bg-elev) 92%, transparent);
		backdrop-filter: blur(8px);
		transform: translateY(-100%);
		transition: transform 0.18s ease;
		box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.7);
	}
	.bar.imm.revealed { transform: translateY(0); }
	.reveal-strip { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 49; }
	.info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
	.nm { font-weight: 700; font-size: 14px; }
	.sub { color: var(--text-muted); font-size: 12px; }
	.timer { color: var(--accent); font-weight: 700; font-variant-numeric: tabular-nums; font-size: 13px; }
	.btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 9px; cursor: pointer; font-size: 13px; }
	.btn:hover { border-color: var(--border-strong); }
	.btn.danger:hover { color: #f87171; border-color: #f87171; }
	.host { flex: 1; position: relative; display: grid; place-items: center; background: var(--bg); }
	.loading { color: var(--text-dim); font-size: 13px; }
	.recovery { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; background: var(--bg); padding: 32px; text-align: center; z-index: 5; }
	.rec-ic { font-size: 40px; }
	.recovery h2 { margin: 14px 0 8px; font-size: 20px; font-weight: 800; }
	.recovery p { color: var(--text-muted); max-width: 440px; margin: 0 0 18px; line-height: 1.5; }
	.rec-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
	.btn.primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); font-weight: 600; }
	.hostnote { flex: 1; display: grid; place-items: center; padding: 40px; }
	.hostnote p { color: var(--text-muted); max-width: 420px; text-align: center; }
</style>
