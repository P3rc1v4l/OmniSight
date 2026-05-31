<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, sleepTimerEndsAt } from '$lib/stores/settings';

	let now = $state(Date.now());
	onMount(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const remaining = $derived.by(() => {
		const ends = $sleepTimerEndsAt;
		if (!ends) return null;
		const ms = ends - now;
		if (ms <= 0) return null;
		const t = Math.ceil(ms / 1000);
		const h = Math.floor(t / 3600);
		const m = Math.floor((t % 3600) / 60);
		const s = t % 60;
		return h > 0
			? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
			: `${m}:${String(s).padStart(2, '0')}`;
	});

	function cancel() {
		settings.update((st) => ({ ...st, plugins: { ...st.plugins, sleepTimerEnabled: false } }));
	}
</script>

{#if remaining}
	<button class="sleep" onclick={cancel} title="Sleep-Timer abbrechen">
		<span class="z">😴</span>
		<span class="t">{remaining}</span>
		<span class="x">✕</span>
	</button>
{/if}

<style>
	.sleep {
		position: fixed;
		right: 18px;
		bottom: 18px;
		z-index: 60;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 999px;
		padding: 8px 14px;
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.6);
		font-variant-numeric: tabular-nums;
		transition: border-color 0.15s;
	}
	.sleep:hover { border-color: color-mix(in srgb, var(--accent) 55%, transparent); }
	.t { color: var(--accent); }
	.x { font-size: 11px; color: var(--text-muted); opacity: 0; transition: opacity 0.15s; }
	.sleep:hover .x { opacity: 1; }
</style>
