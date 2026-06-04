// Punkt 3: Echter In-App-Updater (Tauri Updater Plugin).
// Prüft beim Start und auf Knopfdruck gegen die GitHub-Releases. Gibt es eine
// neuere, signierte Version, kann sie direkt heruntergeladen und installiert werden.
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { pushToast } from './toasts';
import { APP_VERSION, LINKS } from '$lib/version';

export interface UpdateState {
	checking: boolean;
	available: boolean;
	version: string | null;
	notes: string | null;
	downloading: boolean;
	progress: number; // 0..1
	error: string | null;
	dismissed: boolean;
	manualUrl: string | null; // gesetzt, wenn nur ein manueller Download (GitHub) möglich ist
}

export const updateState = writable<UpdateState>({
	checking: false,
	available: false,
	version: null,
	notes: null,
	downloading: false,
	progress: 0,
	error: null,
	dismissed: false,
	manualUrl: null
});

function parseV(v: string): number[] {
	return v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
}
function isNewer(remote: string, local: string): boolean {
	const a = parseV(remote);
	const b = parseV(local);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const x = a[i] ?? 0;
		const y = b[i] ?? 0;
		if (x !== y) return x > y;
	}
	return false;
}

// Fallback: GitHub-Releases-API abfragen, falls der signierte Updater nichts findet
// (z.B. Release ohne latest.json/Updater-Artefakte). Findet die neueste veröffentlichte
// Version (Entwürfe liefert die API ohnehin nicht) und gibt den Download-Link zurück.
async function githubFallback(): Promise<{ version: string; notes: string | null; url: string } | null> {
	try {
		const repo = LINKS.github.replace('https://github.com/', '').replace(/\/$/, '');
		const ctrl = new AbortController();
		const to = setTimeout(() => ctrl.abort(), 8000);
		const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=15`, {
			headers: { Accept: 'application/vnd.github+json' },
			signal: ctrl.signal
		});
		clearTimeout(to);
		if (!res.ok) return null;
		const list = (await res.json()) as Array<{ tag_name: string; body?: string; html_url: string; draft: boolean }>;
		let best: { version: string; notes: string | null; url: string } | null = null;
		for (const r of list) {
			if (r.draft) continue;
			const ver = (r.tag_name || '').replace(/^v/, '');
			if (!ver) continue;
			if (isNewer(ver, APP_VERSION) && (!best || isNewer(ver, best.version))) {
				best = { version: ver, notes: r.body ?? null, url: r.html_url || LINKS.githubReleases };
			}
		}
		return best;
	} catch {
		return null;
	}
}

// Das vom Plugin gelieferte Update-Objekt (mit downloadAndInstall).
let pending: { version: string; body?: string; downloadAndInstall: (cb?: (e: unknown) => void) => Promise<void> } | null = null;

export async function checkForUpdate(manual = false): Promise<void> {
	if (!browser) return;
	updateState.update((s) => ({ ...s, checking: true, error: null }));
	// 1) Signierter Tauri-Updater (bevorzugt: erlaubt Installation in der App).
	try {
		const { check } = await import('@tauri-apps/plugin-updater');
		const result = await check();
		if (result) {
			pending = result as typeof pending;
			updateState.set({
				checking: false,
				available: true,
				version: result.version,
				notes: result.body ?? null,
				downloading: false,
				progress: 0,
				error: null,
				dismissed: false,
				manualUrl: null
			});
			return;
		}
	} catch (e) {
		console.warn('[updater] Plugin-Check fehlgeschlagen, versuche GitHub-Fallback:', e);
	}
	// 2) Fallback über die GitHub-Releases-API (auch ohne signierte latest.json).
	const gh = await githubFallback();
	if (gh) {
		pending = null;
		updateState.set({
			checking: false,
			available: true,
			version: gh.version,
			notes: gh.notes,
			downloading: false,
			progress: 0,
			error: null,
			dismissed: false,
			manualUrl: gh.url
		});
	} else {
		pending = null;
		updateState.update((s) => ({ ...s, checking: false, available: false, manualUrl: null }));
		if (manual) pushToast('Kein Update verfügbar', 'Du verwendest bereits die neueste Version.', '✅');
	}
}

export async function installUpdate(): Promise<void> {
	if (!browser || !pending) return;
	updateState.update((s) => ({ ...s, downloading: true, progress: 0, error: null }));
	try {
		let total = 0;
		let downloaded = 0;
		await pending.downloadAndInstall((event: unknown) => {
			const e = event as { event: string; data?: { contentLength?: number; chunkLength?: number } };
			if (e.event === 'Started') {
				total = e.data?.contentLength ?? 0;
			} else if (e.event === 'Progress') {
				downloaded += e.data?.chunkLength ?? 0;
				updateState.update((s) => ({ ...s, progress: total ? downloaded / total : 0 }));
			} else if (e.event === 'Finished') {
				updateState.update((s) => ({ ...s, progress: 1 }));
			}
		});
		// Update installiert -> App neu starten.
		const { relaunch } = await import('@tauri-apps/plugin-process');
		await relaunch();
	} catch (e) {
		updateState.update((s) => ({ ...s, downloading: false, error: String(e) }));
		pushToast('Update fehlgeschlagen', String(e), '⚠️');
	}
}

export function dismissUpdate(): void {
	updateState.update((s) => ({ ...s, dismissed: true }));
}
