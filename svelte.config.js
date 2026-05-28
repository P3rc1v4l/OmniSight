import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Tauri kann keine Server-Komponenten ausführen -> statische Ausgabe (SPA).
		adapter: adapter({
			fallback: 'index.html' // SPA-Modus: alle Routen landen in index.html
		})
	}
};

export default config;
