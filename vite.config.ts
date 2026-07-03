import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// @tauri-apps/cli setzt die ENV-Variable TAURI_DEV_HOST (z.B. für mobile/LAN).
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	// Damit Tauri sich sauber mit dem Vite-Dev-Server verbindet:
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? { protocol: 'ws', host, port: 1421 }
			: undefined,
		watch: {
			// src-tauri wird von Rust gewatcht, nicht von Vite.
			ignored: ['**/src-tauri/**']
		}
	},

	// Vitest: testet reine Logik (Krypto/Hashing, Parser, Auth-Kern) in Node-Umgebung.
	// Bewusst KEIN Component-Testing (bräuchte jsdom + @testing-library/svelte) – der
	// Fokus liegt auf sicherheits-/datenkritischer Logik, die keinen Browser braucht.
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts', 'server/**/*.test.mjs']
	}
});
