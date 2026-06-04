// Zwischenspeicher für Favicons: holt sie einmal über das Rust-Backend, legt sie
// als Daten-URL ab (offline verfügbar) und liest die dominante Farbe per Canvas aus
// (für die Kartenfarbe). Persistiert via localStorage (sofort) + tauri-store.
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export interface FaviconEntry {
	dataUrl: string;
	color: string;
}

export const faviconCache = writable<Record<string, FaviconEntry>>({});

const LS = 'omnisight:favicons';
const OLD_LS = 'omnihub:favicons';
let loaded = false;

if (browser) {
	(async () => {
		let init: Record<string, FaviconEntry> = {};
		try {
			const raw = window.localStorage.getItem(LS) ?? window.localStorage.getItem(OLD_LS);
			if (raw) init = JSON.parse(raw);
		} catch {
			/* ignore */
		}
		if (Object.keys(init).length === 0) {
			try {
				init = (await loadState<Record<string, FaviconEntry>>('favicons', {})) || {};
			} catch {
				/* ignore */
			}
		}
		faviconCache.set(init);
		loaded = true;
	})();

	faviconCache.subscribe((v) => {
		if (!loaded) return;
		try {
			window.localStorage.setItem(LS, JSON.stringify(v));
		} catch {
			/* ignore */
		}
		void saveState('favicons', v);
	});
}

const inflight = new Set<string>();

export async function ensureFavicon(domain: string): Promise<void> {
	if (!browser || !domain) return;
	if (get(faviconCache)[domain] || inflight.has(domain)) return;
	inflight.add(domain);
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		const liveUrl = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
		const dataUrl = await invoke<string>('fetch_favicon', { url: liveUrl });
		if (!dataUrl) return;
		let color = '';
		try {
			color = await dominantColor(dataUrl);
		} catch {
			color = '';
		}
		faviconCache.update((c) => ({ ...c, [domain]: { dataUrl, color: color || '#2a2a33' } }));
	} catch (e) {
		console.warn('[favicon] konnte nicht geladen werden:', domain, e);
	} finally {
		inflight.delete(domain);
	}
}

// Dominante (kräftige, nicht weiße/schwarze) Farbe aus einer Bild-Daten-URL.
function dominantColor(dataUrl: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			try {
				const s = 32;
				const canvas = document.createElement('canvas');
				canvas.width = s;
				canvas.height = s;
				const ctx = canvas.getContext('2d');
				if (!ctx) return reject(new Error('kein canvas'));
				ctx.drawImage(img, 0, 0, s, s);
				const { data } = ctx.getImageData(0, 0, s, s);
				const buckets: Record<string, { n: number; r: number; g: number; b: number }> = {};
				let bestKey = '';
				let bestN = 0;
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
					if (a < 128) continue;
					if (r > 238 && g > 238 && b > 238) continue; // fast weiß
					if (r < 16 && g < 16 && b < 16) continue; // fast schwarz
					const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
					const bk = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
					bk.n++; bk.r += r; bk.g += g; bk.b += b;
					if (bk.n > bestN) { bestN = bk.n; bestKey = key; }
				}
				if (!bestKey) return resolve('');
				const bk = buckets[bestKey];
				let r = Math.round(bk.r / bk.n), g = Math.round(bk.g / bk.n), b = Math.round(bk.b / bk.n);
				// Nie zu hell -> leicht abdunkeln (für lesbaren weißen Text auf der Karte).
				const lum = 0.299 * r + 0.587 * g + 0.114 * b;
				if (lum > 200) {
					const f = 200 / lum;
					r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
				}
				const hex = '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
				resolve(hex);
			} catch (e) {
				reject(e as Error);
			}
		};
		img.onerror = () => reject(new Error('Bild-Ladefehler'));
		img.src = dataUrl;
	});
}
