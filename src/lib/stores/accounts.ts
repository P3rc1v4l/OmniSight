// „Accounts": merkt sich pro Profil, welche Anbieter geöffnet/genutzt wurden, und
// erlaubt das Abmelden. Abmelden löscht (nativ) das WebView2-Daten-Verzeichnis je
// Anbieter bzw. das ganze Profil-Verzeichnis (Cookies/Login/Speicher).
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { loadState, saveState } from '$lib/persistence';

export const usedProviders = writable<string[]>([]);

let pid: string | null = null;
let ready = false;

export async function loadAccountsForProfile(profileId: string): Promise<void> {
	pid = profileId;
	usedProviders.set(await loadState<string[]>(`usedproviders:${profileId}`, []));
	ready = true;
}

if (browser) {
	usedProviders.subscribe(($u) => {
		if (ready && pid) void saveState(`usedproviders:${pid}`, $u);
	});
}

export function markProviderUsed(providerId: string): void {
	usedProviders.update((u) => (u.includes(providerId) ? u : [...u, providerId]));
}

// Zugehöriges Stream-Fenster schließen (sonst ist der Daten-Ordner gesperrt).
async function closeWindowFor(providerId: string): Promise<void> {
	if (!browser) return;
	try {
		const { activeProfileId } = await import('$lib/stores/profiles');
		const profileId = get(activeProfileId) ?? 'default';
		const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
		const w = await WebviewWindow.getByLabel(`stream-${profileId}-${providerId}`);
		if (w) await w.close();
	} catch {
		/* egal */
	}
}

export async function logoutProvider(providerId: string): Promise<{ ok: boolean; error?: string }> {
	if (!browser) return { ok: false };
	const { activeProfileId } = await import('$lib/stores/profiles');
	const profileId = get(activeProfileId) ?? 'default';
	await closeWindowFor(providerId);
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('logout_provider', { profileId, providerId });
		usedProviders.update((u) => u.filter((x) => x !== providerId));
		return { ok: true };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}

export async function logoutAllProviders(): Promise<{ ok: boolean; error?: string }> {
	if (!browser) return { ok: false };
	const { activeProfileId } = await import('$lib/stores/profiles');
	const profileId = get(activeProfileId) ?? 'default';
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('logout_all_providers', { profileId });
		usedProviders.set([]);
		return { ok: true };
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}
