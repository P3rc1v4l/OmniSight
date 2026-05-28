<script lang="ts">
	import { onMount } from 'svelte';
	import { activeStream } from '$lib/stores/providers';
	import { openInWindow } from '$lib/streamWindow';
	import { watchTime, sessionStart, formatDuration } from '$lib/stores/tracking';
	import Logo from '$lib/components/Logo.svelte';

	let now = $state(Date.now());
	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	// Gesamtzeit für den aktiven Anbieter (inkl. noch nicht verbuchter laufender Session)
	const liveMs = $derived.by(() => {
		const p = $activeStream;
		if (!p) return 0;
		const stored = $watchTime[p.id] ?? 0;
		const start = sessionStart(p.id);
		const running = start ? now - start : 0;
		return stored + running;
	});
</script>

<div class="page">
	<h1>Schaut gerade</h1>
	{#if $activeStream}
		<div class="card omni-card">
			<div class="head">
				<Logo provider={$activeStream} size={56} />
				<div>
					<div class="big">{$activeStream.name}</div>
					<p class="sub">{$activeStream.subtitle}</p>
				</div>
			</div>
			<div class="timer">
				<span class="tlabel">Streamzeit (Anbieter gesamt)</span>
				<span class="tval">{formatDuration(liveMs)}</span>
			</div>
			<div class="actions">
				<button class="primary" onclick={() => openInWindow($activeStream)}>Fenster in den Vordergrund holen</button>
				<button class="ghost" onclick={() => activeStream.set(null)}>Aus „Schaut gerade" entfernen</button>
			</div>
		</div>
	{:else}
		<p class="muted">Aktuell ist kein Stream geöffnet. Öffne einen Anbieter über die Übersicht.</p>
	{/if}
</div>

<style>
	.page { padding: 22px 28px 36px; }
	h1 { margin: 0 0 18px; font-size: 26px; font-weight: 800; }
	.card { padding: 24px; display: flex; flex-direction: column; gap: 18px; max-width: 520px; }
	.head { display: flex; align-items: center; gap: 16px; }
	.big { font-size: 22px; font-weight: 700; }
	.sub { color: var(--text-muted); margin: 2px 0 0; }
	.timer { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-2); border-radius: 12px; padding: 14px 18px; }
	.tlabel { color: var(--text-muted); font-size: 13px; }
	.tval { font-size: 20px; font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; }
	.actions { display: flex; flex-direction: column; gap: 10px; }
	.muted { color: var(--text-muted); }
	.primary { background: var(--accent); color: var(--accent-text); border: 0; padding: 11px 16px; border-radius: 10px; cursor: pointer; font-weight: 700; }
	.ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 9px 14px; border-radius: 10px; cursor: pointer; }
</style>
