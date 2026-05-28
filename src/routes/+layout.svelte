<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { onMount } from 'svelte';
	import { settings, applySettings } from '$lib/stores/settings';
	import { get } from 'svelte/store';

	let { children } = $props();

	onMount(() => {
		// Einstellungen beim Start einmalig auf die CSS-Variablen anwenden.
		applySettings(get(settings));
	});
</script>

<div class="shell">
	<Sidebar />
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.shell {
		display: flex;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}
	.content {
		flex: 1;
		height: 100vh;
		overflow-y: auto;
		background: var(--bg);
	}
</style>
