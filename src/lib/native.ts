// Brücke zu den nativen Funktionen (Autostart-Plugin + Tray-Verhalten).
// Alles fehlertolerant: in der Web-Vorschau (kein Tauri) passiert nichts.
import { browser } from '$app/environment';

// „Beim Schließen in den Tray" an Rust melden (Laufzeit-Schalter).
export async function applyCloseToTray(enabled: boolean): Promise<void> {
	if (!browser) return;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('set_close_to_tray', { enabled });
	} catch {
		/* kein Tauri */
	}
}

// Autostart mit dem System ein-/ausschalten.
export async function setAutostart(enabled: boolean): Promise<void> {
	if (!browser) return;
	try {
		const m = await import('@tauri-apps/plugin-autostart');
		if (enabled) await m.enable();
		else await m.disable();
	} catch (e) {
		console.warn('[autostart] nicht verfügbar:', e);
	}
}

// Tatsächlichen Autostart-Status vom System lesen (oder null).
export async function isAutostartEnabled(): Promise<boolean | null> {
	if (!browser) return null;
	try {
		const m = await import('@tauri-apps/plugin-autostart');
		return await m.isEnabled();
	} catch {
		return null;
	}
}
