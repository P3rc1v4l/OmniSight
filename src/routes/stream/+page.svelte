<script lang="ts">
	import { activeStream } from '$lib/stores/providers';
	import { goto } from '$app/navigation';

	// Wenn kein Stream aktiv ist, zurück zur Übersicht.
	$effect(() => {
		if (!$activeStream) goto('/');
	});
</script>

{#if $activeStream}
	<div class="stream-wrap">
		<div class="bar">
			<button class="back" onclick={() => activeStream.set(null)}>← Übersicht</button>
			<span class="title">Schaut gerade: <strong>{$activeStream.name}</strong></span>
		</div>
		<!--
			Im echten Tauri-Build wird hier statt iframe ein zweites WebView-Fenster
			(WebView2) eingebettet, das DRM via Edge WebView nativ kann. Das iframe ist
			nur die Web-Vorschau für `npm run dev` im Browser.
		-->
		<iframe src={$activeStream.url} title={$activeStream.name} allow="autoplay; encrypted-media; fullscreen"></iframe>
	</div>
{/if}

<style>
	.stream-wrap { display: flex; flex-direction: column; height: 100vh; }
	.bar {
		display: flex; align-items: center; gap: 16px;
		padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg-elev);
	}
	.back {
		background: var(--bg-card); border: 1px solid var(--border);
		color: var(--text); padding: 6px 12px; border-radius: 10px; cursor: pointer;
	}
	.title { color: var(--text-muted); }
	iframe { flex: 1; width: 100%; border: 0; background: #000; }
</style>
