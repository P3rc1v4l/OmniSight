<script lang="ts">
	// Wiederverwendbares Lade-Skelett: eine Reihe schimmernder Poster-Platzhalter.
	let { count = 8 }: { count?: number } = $props();
</script>

<div class="sk-row" aria-hidden="true">
	{#each Array(count) as _, i (i)}
		<div class="sk-cell">
			<div class="sk-poster shimmer"></div>
			<div class="sk-line shimmer"></div>
			<div class="sk-line short shimmer"></div>
		</div>
	{/each}
</div>

<style>
	.sk-row { display: flex; gap: 14px; overflow: hidden; padding: 4px 0; }
	.sk-cell { flex: 0 0 120px; width: 120px; display: flex; flex-direction: column; gap: 8px; }
	.sk-poster { aspect-ratio: 2 / 3; border-radius: 10px; }
	.sk-line { height: 11px; border-radius: 6px; width: 90%; }
	.sk-line.short { width: 55%; }
	.shimmer {
		background: linear-gradient(90deg, var(--bg-card) 25%, var(--border) 37%, var(--bg-card) 63%);
		background-size: 400% 100%;
		animation: sk-shimmer 1.4s ease infinite;
	}
	@keyframes sk-shimmer {
		0% { background-position: 100% 50%; }
		100% { background-position: 0 50%; }
	}
</style>
