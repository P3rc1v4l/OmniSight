<script lang="ts">
	import type { Provider } from '$lib/types';

	export let provider: Provider;
	export let size: number = 64;

	// Initialen bestimmen: spezielle Vorgaben aus dem Screenshot
	const overrides: Record<string, string> = {
		'prime-video': 'P',
		'disney-plus': 'D+',
		'paramount-plus': 'P+',
		'apple-tv-plus': 'tv',
		'magenta-tv': 'T',
		'sky-go': 'sky',
		'ard-mediathek': '1',
		'zdf-mediathek': 'ZDF',
		'rtl-plus': 'RTL+',
		'kika': 'KiKA',
		'wow': 'W',
		'mubi': 'm',
		'max': 'm',
		'twitch': '◣',
		'youtube': '▶',
		'spotify': '♫',
		'crunchyroll': 'cr',
		'dazn': 'DA',
		'funk': 'f',
		'waipu-tv': 'w',
		'adn': 'A',
		'joyn': 'joyn',
		'netflix': 'N',
		'arte': 'arte'
	};

	$: label = overrides[provider.id] ?? provider.name.slice(0, 2);
	$: fontSize = Math.max(14, size * 0.45);
</script>

<div
	class="logo"
	style="--bg1: {provider.color}; --bg2: {provider.color2 ?? provider.color}; width: {size}px; height: {size}px; font-size: {fontSize}px;"
	aria-hidden="true"
>
	<span>{label}</span>
</div>

<style>
	.logo {
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: radial-gradient(circle at 30% 30%, var(--bg1), var(--bg2));
		color: #fff;
		font-weight: 800;
		font-family: 'DM Sans', system-ui, sans-serif;
		letter-spacing: -0.02em;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
		flex-shrink: 0;
	}
	.logo span { line-height: 1; }
</style>
