<script lang="ts">
	import { onMount } from 'svelte';
	import { settings, clockEditing } from '$lib/stores/settings';

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const c = $derived($settings.clock);
	const editing = $derived($clockEditing);
	const realOpacity = $derived(Math.max(0, Math.min(1, (100 - c.transparency) / 100)));
	// Beim Bearbeiten immer sichtbar (Live-Vorschau der Transparenz, nie ganz weg → greifbar).
	const visible = $derived(editing || (c.enabled && c.transparency < 100));
	const opacity = $derived(editing ? Math.max(0.15, realOpacity) : realOpacity);

	const timeStr = $derived.by(() => {
		const h24 = now.getHours();
		const m = String(now.getMinutes()).padStart(2, '0');
		const s = String(now.getSeconds()).padStart(2, '0');
		if (c.hour12) {
			const ampm = h24 < 12 ? 'AM' : 'PM';
			const h12 = String(((h24 + 11) % 12) + 1).padStart(2, '0');
			return c.showSeconds ? `${h12}:${m}:${s} ${ampm}` : `${h12}:${m} ${ampm}`;
		}
		const h = String(h24).padStart(2, '0');
		return c.showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
	});

	const angles = $derived.by(() => {
		const sec = now.getSeconds(), min = now.getMinutes(), hr = now.getHours() % 12;
		return { s: sec * 6, m: min * 6 + sec * 0.1, h: hr * 30 + min * 0.5 };
	});

	// Position: gespeicherte x/y, sonst Standard oben rechts
	const posStyle = $derived(
		c.x != null && c.y != null
			? `left:${c.x}px; top:${c.y}px; right:auto;`
			: `right:18px; top:56px; left:auto;`
	);

	// Drag (nur im Bearbeiten-Modus)
	let dragging = false;
	let offX = 0, offY = 0;
	function onDown(e: PointerEvent) {
		if (!editing) return;
		dragging = true;
		const el = e.currentTarget as HTMLElement;
		const r = el.getBoundingClientRect();
		offX = e.clientX - r.left;
		offY = e.clientY - r.top;
		el.setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function onMove(e: PointerEvent) {
		if (!dragging) return;
		const x = Math.max(0, e.clientX - offX);
		const y = Math.max(0, e.clientY - offY);
		settings.update((s) => ({ ...s, clock: { ...s.clock, x, y } }));
	}
	function onUp() { dragging = false; }
</script>

{#if visible}
	<div
		class="clock"
		class:editing
		style="{posStyle} opacity: {opacity}; color: {c.color};"
		onpointerdown={onDown}
		onpointermove={onMove}
		onpointerup={onUp}
		role="presentation"
	>
		{#if editing}<span class="grip" title="Zum Verschieben ziehen">⠿</span>{/if}
		{#if c.type === 'digital'}
			<span class="digital" style="font-size: {c.size}px;">{timeStr}</span>
		{:else}
			<svg viewBox="0 0 100 100" style="width: {c.size * 2.4}px; height: {c.size * 2.4}px;">
				<circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5" />
				{#each Array(12) as _, i}
					<line x1="50" y1="6" x2="50" y2="12" stroke="currentColor" stroke-width="1.5" transform="rotate({i * 30} 50 50)" opacity="0.6" />
				{/each}
				<line x1="50" y1="50" x2="50" y2="27" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" transform="rotate({angles.h} 50 50)" />
				<line x1="50" y1="50" x2="50" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" transform="rotate({angles.m} 50 50)" />
				{#if c.showSeconds}
					<line x1="50" y1="55" x2="50" y2="14" stroke="currentColor" stroke-width="1" stroke-linecap="round" transform="rotate({angles.s} 50 50)" opacity="0.8" />
				{/if}
				<circle cx="50" cy="50" r="2.5" fill="currentColor" />
			</svg>
		{/if}
	</div>
{/if}

<style>
	.clock {
		position: fixed;
		z-index: 30;
		pointer-events: none;
		user-select: none;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
		display: flex; align-items: center; gap: 8px;
	}
	/* Im Bearbeiten-Modus ganz nach vorne + greifbar */
	.clock.editing {
		z-index: 300;
		pointer-events: auto;
		cursor: grab;
		padding: 8px 10px;
		border: 1px dashed currentColor;
		border-radius: 10px;
		background: rgba(0, 0, 0, 0.25);
	}
	.clock.editing:active { cursor: grabbing; }
	.grip { font-size: 14px; opacity: 0.8; }
	.digital { font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }
</style>
