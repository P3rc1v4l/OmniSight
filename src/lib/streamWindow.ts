// Öffnet einen Anbieter in einem ECHTEN WebviewWindow (kein iframe).
// - Umgeht X-Frame-Options/CSP-Sperren, nutzt das native Edge WebView (inkl. DRM).
// - Pro Profil ein eigenes dataDirectory -> getrennte Cookies/Logins je Profil.
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import type { Provider } from '$lib/types';
import { startSession, endSession, incrementOpenCount } from '$lib/stores/tracking';
import { activeProfileId } from '$lib/stores/profiles';
import { markProviderUsed } from '$lib/stores/accounts';

export async function openInWindow(p: Provider): Promise<void> {
	if (!browser) return;
	const pid = get(activeProfileId) ?? 'default';
	try {
		const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
		// Fenster-Label enthält das Profil -> jedes Profil hat sein eigenes Fenster.
		const label = `stream-${pid}-${p.id}`;

		const existing = await WebviewWindow.getByLabel(label);
		if (existing) {
			await existing.show();
			await existing.setFocus();
			return;
		}

		// Erzeugung in Rust: eigenes Daten-Verzeichnis pro Profil, Navigations-/
		// Download-Schutz, optional Werbeblocker-Erweiterung und Passwort-Autofill.
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('open_stream_window', {
			label,
			url: p.url,
			title: `${p.name} – OmniSight`,
			adblock: !!p.adblock,
			profileId: pid,
			providerId: p.id
		});
		markProviderUsed(p.id);
		incrementOpenCount();
		startSession(p.id);

		// endSession, wenn das Fenster geschlossen wird.
		const w = await WebviewWindow.getByLabel(label);
		w?.once('tauri://destroyed', () => endSession(p.id));
	} catch (e) {
		// Browser-Vorschau (kein Tauri): Fallback in neuem Tab, Tracking simulieren.
		console.warn('[stream-window]', e);
		incrementOpenCount();
		startSession(p.id);
		window.open(p.url, '_blank', 'noopener');
	}
}
