// Öffnet einen Anbieter in einem ECHTEN WebviewWindow (kein iframe).
// Das umgeht X-Frame-Options/CSP-Sperren und nutzt das native Edge WebView,
// das auch DRM (Netflix, Disney+ …) ohne extra Setup beherrscht.
import { browser } from '$app/environment';
import type { Provider } from '$lib/types';
import { startSession, endSession, incrementOpenCount } from '$lib/stores/tracking';

export async function openInWindow(p: Provider): Promise<void> {
	if (!browser) return;
	try {
		const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
		const label = `stream-${p.id}`;

		// Existiert das Fenster schon -> nur fokussieren (Session läuft bereits).
		const existing = await WebviewWindow.getByLabel(label);
		if (existing) {
			await existing.show();
			await existing.setFocus();
			return;
		}

		const win = new WebviewWindow(label, {
			url: p.url,
			title: `${p.name} – OmniHub`,
			width: 1280,
			height: 800,
			resizable: true,
			decorations: true,
			focus: true
		});

		// Streamzeit-Tracking: Session beim Erstellen starten, beim Schließen beenden.
		win.once('tauri://created', () => {
			incrementOpenCount();
			startSession(p.id);
		});
		win.once('tauri://destroyed', () => endSession(p.id));
		win.once('tauri://error', (e: unknown) =>
			console.error(`[stream-window] ${p.name}:`, e)
		);
	} catch (e) {
		// Browser-Vorschau (kein Tauri): Fallback in neuem Tab, Tracking simulieren
		incrementOpenCount();
		startSession(p.id);
		window.open(p.url, '_blank', 'noopener');
	}
}
