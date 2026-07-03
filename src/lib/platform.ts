// Plattform-Abstraktion: läuft OmniSight als Tauri-Desktop-App oder im Browser (Web-Version)?
// Desktop: native Rust-Commands via Tauri-invoke.
// Web: gleiche Funktionen über die HTTP-API des OmniSight-Servers (/api/...).
import { browser } from '$app/environment';

// Tauri v2 injiziert __TAURI_INTERNALS__ ins Hauptfenster.
export const isTauri: boolean =
	browser && typeof (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ !== 'undefined';

// Web-Ersatz für Tauri-invoke: POST /api/rpc/{command} mit JSON-Argumenten.
// Der Server implementiert die TMDB-Kommandos serverseitig (Key bleibt auf dem Server).
export async function webRpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
	const res = await fetch(`/api/rpc/${encodeURIComponent(name)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(args)
	});
	if (res.status === 401) {
		// Session abgelaufen -> zurück zum Login.
		window.location.href = '/login';
		throw new Error('Nicht angemeldet');
	}
	if (!res.ok) throw new Error(`API-Fehler ${res.status}`);
	return (await res.json()) as T;
}
