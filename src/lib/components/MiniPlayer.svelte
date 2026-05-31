<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { miniPlayer, MINI, miniVideoRect, repositionEmbedded, closeEmbedded, streamMode } from '$lib/embedded';
	import { activeStream } from '$lib/stores/providers';
	import Logo from './Logo.svelte';

	let x = $state(0);
	let y = $state(0);

	function place() {
		x = window.innerWidth - MINI.w - MINI.margin;
		y = window.innerHeight - (MINI.bar + MINI.vidH) - MINI.margin;
	}
	function reposition() {
		place();
		if ($miniPlayer) void repositionEmbedded(miniVideoRect());
	}

	onMount(() => {
		place();
		window.addEventListener('resize', reposition);
		return () => window.removeEventListener('resize', reposition);
	});

	// Wird der Mini-Modus aktiv (oder der Anbieter wechselt), das Webview an die
	// Mini-Position unten rechts setzen.
	$effect(() => {
		if ($miniPlayer && $activeStream && $streamMode === 'embedded') {
			place();
			void repositionEmbedded(miniVideoRect());
		}
	});

	function expand() {
		miniPlayer.set(false);
		void goto('/stream');
	}
	function closeMini() {
		void closeEmbedded();
		activeStream.set(null);
		miniPlayer.set(false);
	}
</script>

{#if $miniPlayer && $activeStream && $streamMode === 'embedded'}
	<div class="mini-bar" style="left:{x}px; top:{y}px; width:{MINI.w}px; height:{MINI.bar}px;">
		<Logo provider={$activeStream} size={16} />
		<span class="mini-name">{$activeStream.name}</span>
		<button class="mini-btn" onclick={expand} title="Großansicht" aria-label="Großansicht">⤢</button>
		<button class="mini-btn" onclick={closeMini} title="Schließen" aria-label="Stream schließen">✕</button>
	</div>
{/if}

<style>
	.mini-bar {
		position: fixed;
		z-index: 70;
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 0 6px 0 9px;
		background: var(--bg-elev);
		border: 1px solid var(--border);
		border-bottom: none;
		border-radius: 10px 10px 0 0;
		box-shadow: 0 -2px 22px -6px rgba(0, 0, 0, 0.55);
	}
	.mini-name { font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
	.mini-btn { background: transparent; border: 0; color: var(--text-muted); cursor: pointer; font-size: 13px; width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; transition: background 0.13s, color 0.13s; }
	.mini-btn:hover { background: var(--bg-card); color: var(--text); }
</style>
