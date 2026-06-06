// Anbieter IM Hauptfenster als echtes eingebettetes Webview (kein iframe).
//
// Mehr-Stream-Modell:
// - EIN Vordergrund-Stream (wird auf /stream bzw. als Mini-Player gezeigt).
// - BELIEBIG VIELE Hintergrund-Streams (laufen weiter, versteckt; in der Streams-Leiste
//   gelistet; einzeln stummschaltbar). Über "In den Hintergrund" wandert der aktuelle
//   Vordergrund-Stream dorthin.
// - Anbieter in MULTI_PROVIDERS (z.B. Twitch) dürfen mehrfach laufen (eigene Webviews).
//
// Defensiv: Klappt das Einbetten nicht, wird ein separates Fenster geöffnet.
import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { goto } from '$app/navigation';
import type { Provider } from '$lib/types';
import { activeStream, markOpened } from '$lib/stores/providers';
import { recordOpen } from '$lib/stores/continue';
import { activeProfileId } from '$lib/stores/profiles';
import { markProviderUsed } from '$lib/stores/accounts';
import { settings } from '$lib/stores/settings';
import { startSession, endSession, incrementOpenCount } from '$lib/stores/tracking';
import { openInWindow } from '$lib/streamWindow';

export interface Rect { x: number; y: number; width: number; height: number; }

// Anbieter, die mehrfach gleichzeitig laufen dürfen.
const MULTI_PROVIDERS = ['twitch'];

// Zeigt der Stream-Seite, ob der Anbieter eingebettet läuft oder (Fallback) als Fenster.
export const streamMode = writable<'embedded' | 'window' | null>(null);

// Vollbild-/Immersiv-Modus.
export const immersive = writable(false);

// Mini-Player (Bild-in-Bild) beim Verlassen der Stream-Seite.
export const miniPlayer = writable(false);

// Fehlerzustand des Vordergrund-Streams (z.B. Webview-Erstellung fehlgeschlagen / abgestürzt).
export const streamError = writable(false);
export const MINI = { w: 340, vidH: 191, bar: 28, margin: 16 };
export function miniVideoRect(): Rect {
	const W = browser ? window.innerWidth : 1280;
	const H = browser ? window.innerHeight : 720;
	const x = W - MINI.w - MINI.margin;
	const y = H - (MINI.bar + MINI.vidH) - MINI.margin;
	return { x, y: y + MINI.bar, width: MINI.w, height: MINI.vidH };
}
export function goMini(): void {
	miniPlayer.set(true);
	void repositionEmbedded(miniVideoRect());
}

// Hintergrund-Streams (laufen weiter, versteckt).
export interface BgStream {
	streamId: string;
	label: string;
	provider: Provider;
	muted: boolean;
	volume: number; // 0–100
	paused: boolean;
}
export const backgroundStreams = writable<BgStream[]>([]);

let currentLabel: string | null = null;     // Label des Vordergrund-Webviews
let currentProviderId: string | null = null;
let foregroundLabel: string | null = null;  // gewünschtes Vordergrund-Label (beim Öffnen vergeben)
let usingFallback = false;
let creatingLabel: string | null = null;
let streamCounter = 0;

// Stabiles Label je (Profil, Anbieter) -> WebView2-Datenverzeichnis bleibt erhalten
// (dauerhafte Logins) UND ist pro Profil getrennt (Profil-ID steckt im Label).
// Ist das stabile Label gerade belegt (z.B. zweiter Twitch-Stream), wird ein
// eindeutiges Instanz-Label vergeben.
function chooseLabel(providerId: string): string {
	const pid = get(activeProfileId) ?? 'default';
	const stable = `embed-${pid}-${providerId}`;
	const taken =
		currentLabel === stable ||
		foregroundLabel === stable ||
		get(backgroundStreams).some((b) => b.label === stable);
	return taken ? `embed-${pid}-${providerId}-${++streamCounter}` : stable;
}

// Vom Nutzer ausgelöstes Öffnen.
export function openProvider(p: Provider): void {
	markOpened(p.id);
	recordOpen({ label: p.name, subtitle: p.subtitle ?? '', url: p.url, id: p.id, color: p.color, color2: p.color2 ?? p.color, poster: null });

	// Schon im Vordergrund? -> nur hinschalten.
	if (currentProviderId === p.id && foregroundLabel && !usingFallback) {
		goto('/stream');
		return;
	}
	// Gleicher Anbieter im Hintergrund (außer Multi-Anbieter)? -> nach vorne holen.
	if (!MULTI_PROVIDERS.includes(p.id)) {
		const bg = get(backgroundStreams).find((b) => b.provider.id === p.id);
		if (bg) { bringToForeground(bg.streamId); return; }
	}
	activeStream.set(p);
	foregroundLabel = chooseLabel(p.id);
	goto('/stream');
}

// Beliebige URL im Programm öffnen (z.B. Kalender-Titel). Ersetzt den Vordergrund.
export async function openUrlInApp(
	name: string,
	url: string,
	id = 'web-view-cal',
	subtitle = '',
	color = '#30c5bb',
	color2 = '#1f6f6a',
	poster: string | null = null
): Promise<void> {
	await closeEmbedded(); // vorherigen Vordergrund schließen (Hintergrund bleibt)
	if (id === 'crunchyroll') markOpened('crunchyroll');
	recordOpen({ label: name, subtitle, url, id, color, color2, poster });
	activeStream.set({ id, name, subtitle, url, category: 'anime', color, color2, quality: '1080p' });
	foregroundLabel = chooseLabel(id);
	goto('/stream');
}

async function getWebviewApi() {
	const webview = await import('@tauri-apps/api/webview');
	const dpi = await import('@tauri-apps/api/dpi');
	const win = await import('@tauri-apps/api/window');
	return { webview, dpi, win };
}

async function closeLabel(label: string): Promise<void> {
	try {
		const { webview } = await getWebviewApi();
		const wv = await webview.Webview.getByLabel(label);
		if (wv) await wv.close();
	} catch {
		/* ignore */
	}
}
async function hideLabel(label: string): Promise<void> {
	try {
		const { webview } = await getWebviewApi();
		const wv = await webview.Webview.getByLabel(label);
		if (wv) await wv.hide();
	} catch {
		/* ignore */
	}
}

export async function showEmbedded(p: Provider, rect: Rect): Promise<void> {
	if (!browser) return;
	// Werbeblocker-Anbieter UND Twitch (für BetterTTV) laufen im Fenster-Modus –
	// eingebettete Kind-Webviews können keine Erweiterungen laden. Ebenso bei global
	// gewähltem Fenster-Modus.
	if (p.adblock || p.url.includes('twitch.tv') || get(settings).appearance.streamMode === 'window') {
		usingFallback = true;
		streamMode.set('window');
		await openInWindow(p);
		return;
	}
	const label = foregroundLabel ?? chooseLabel(p.id);
	foregroundLabel = label;
	try {
		const { webview, dpi } = await getWebviewApi();
		const { Webview } = webview;
		const { LogicalPosition, LogicalSize } = dpi;

		// Anderer Vordergrund offen? -> schließen (Hintergrund-Streams bleiben unberührt).
		if (currentLabel && currentLabel !== label) {
			await closeLabel(currentLabel);
			if (currentProviderId) endSession(currentProviderId);
			currentLabel = null;
			currentProviderId = null;
		}

		const existing = await Webview.getByLabel(label);
		if (existing) {
			await existing.setPosition(new LogicalPosition(rect.x, rect.y));
			await existing.setSize(new LogicalSize(rect.width, rect.height));
			await existing.show();
			await existing.setFocus();
			currentLabel = label;
			currentProviderId = p.id;
			usingFallback = false;
			streamError.set(false);
			streamMode.set('embedded');
			return;
		}

		if (creatingLabel === label) return;
		creatingLabel = label;
		streamError.set(false);

		// Erzeugung in Rust (mit Navigations-/Download-Schutz). Scheitert das,
		// greift unten der Fallback auf den Fenster-Modus.
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('create_embedded_webview', {
			label,
			url: p.url,
			x: Math.round(rect.x),
			y: Math.round(rect.y),
			width: Math.round(rect.width),
			height: Math.round(rect.height),
			adblock: !!p.adblock
		});
		incrementOpenCount();
		startSession(p.id);
		markProviderUsed(p.id);
		creatingLabel = null;
		currentLabel = label;
		currentProviderId = p.id;
		usingFallback = false;
		streamMode.set('embedded');
	} catch (e) {
		console.warn('[embed] Einbetten fehlgeschlagen, öffne Fenster:', e);
		usingFallback = true;
		creatingLabel = null;
		streamMode.set('window');
		await openInWindow(p);
	}
}

export async function repositionEmbedded(rect: Rect): Promise<void> {
	if (!browser || !currentLabel || usingFallback) return;
	try {
		const { webview, dpi } = await getWebviewApi();
		const wv = await webview.Webview.getByLabel(currentLabel);
		if (wv) {
			await wv.setPosition(new dpi.LogicalPosition(rect.x, rect.y));
			await wv.setSize(new dpi.LogicalSize(rect.width, rect.height));
		}
	} catch {
		/* ignore */
	}
}

export async function hideEmbedded(): Promise<void> {
	if (!browser || !currentLabel || usingFallback) return;
	await hideLabel(currentLabel);
}

export async function unhideEmbedded(): Promise<void> {
	if (!browser || !currentLabel || usingFallback) return;
	try {
		const { webview } = await getWebviewApi();
		const wv = await webview.Webview.getByLabel(currentLabel);
		if (wv) {
			await wv.show();
			await wv.setFocus();
		}
	} catch {
		/* ignore */
	}
}

async function registerEscExit(): Promise<void> {
	if (!browser) return;
	try {
		const gs = await import('@tauri-apps/plugin-global-shortcut');
		if (!(await gs.isRegistered('Escape'))) {
			await gs.register('Escape', (e: { state?: string }) => {
				if (!e || e.state === 'Pressed') void setImmersive(false);
			});
		}
	} catch {
		/* ignore */
	}
}
async function unregisterEscExit(): Promise<void> {
	if (!browser) return;
	try {
		const gs = await import('@tauri-apps/plugin-global-shortcut');
		if (await gs.isRegistered('Escape')) await gs.unregister('Escape');
	} catch {
		/* ignore */
	}
}

export async function setImmersive(on: boolean): Promise<void> {
	immersive.set(on);
	if (!browser) return;
	try {
		const { win } = await getWebviewApi();
		await win.getCurrentWindow().setFullscreen(on);
	} catch {
		/* ignore */
	}
	if (on) await registerEscExit();
	else await unregisterEscExit();
}

// Schließt NUR den Vordergrund-Stream. Hintergrund-Streams bleiben erhalten.
export async function closeEmbedded(): Promise<void> {
	if (!browser) return;
	void setImmersive(false);
	miniPlayer.set(false);
	if (currentLabel && !usingFallback) await closeLabel(currentLabel);
	if (currentProviderId) endSession(currentProviderId);
	currentLabel = null;
	currentProviderId = null;
	foregroundLabel = null;
	usingFallback = false;
	creatingLabel = null;
	streamMode.set(null);
}

// Schiebt den aktuellen Vordergrund-Stream in den Hintergrund (läuft weiter, versteckt).
export function pushForegroundToBackground(): void {
	const p = get(activeStream);
	if (!p || !foregroundLabel || usingFallback) return;
	const label = foregroundLabel;
	void hideLabel(label);
	backgroundStreams.update((l) => [...l, { streamId: `s${++streamCounter}`, label, provider: p, muted: false, volume: 100, paused: false }]);
	currentLabel = null;
	currentProviderId = null;
	foregroundLabel = null;
	miniPlayer.set(false);
	streamMode.set(null);
	activeStream.set(null);
}

// Holt einen Hintergrund-Stream in den Vordergrund.
export function bringToForeground(streamId: string): void {
	const bg = get(backgroundStreams).find((b) => b.streamId === streamId);
	if (!bg) return;
	pushForegroundToBackground(); // ggf. aktuellen Vordergrund sichern
	backgroundStreams.update((l) => l.filter((b) => b.streamId !== streamId));
	foregroundLabel = bg.label;
	currentLabel = bg.label;
	currentProviderId = bg.provider.id;
	usingFallback = false;
	streamMode.set('embedded');
	activeStream.set(bg.provider);
	goto('/stream');
}

export async function closeBackgroundStream(streamId: string): Promise<void> {
	const bg = get(backgroundStreams).find((b) => b.streamId === streamId);
	if (!bg) return;
	backgroundStreams.update((l) => l.filter((b) => b.streamId !== streamId));
	if (bg.provider.id) endSession(bg.provider.id);
	await closeLabel(bg.label);
}

// Stummschalten/Aktivieren eines Hintergrund-Streams (per Rust-eval im jeweiligen Webview).
export async function setBackgroundMuted(streamId: string, muted: boolean): Promise<void> {
	const bg = get(backgroundStreams).find((b) => b.streamId === streamId);
	if (!bg) return;
	backgroundStreams.update((l) => l.map((b) => (b.streamId === streamId ? { ...b, muted } : b)));
	if (!browser) return;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('webview_set_muted', { label: bg.label, muted });
	} catch (e) {
		console.warn('[mute] fehlgeschlagen:', e);
	}
}

// Lautstärke (0–100) eines Hintergrund-Streams setzen.
export async function setBackgroundVolume(streamId: string, volume: number): Promise<void> {
	const bg = get(backgroundStreams).find((b) => b.streamId === streamId);
	if (!bg) return;
	const v = Math.max(0, Math.min(100, Math.round(volume)));
	backgroundStreams.update((l) => l.map((b) => (b.streamId === streamId ? { ...b, volume: v } : b)));
	if (!browser) return;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('webview_set_volume', { label: bg.label, volume: v / 100 });
	} catch (e) {
		console.warn('[volume] fehlgeschlagen:', e);
	}
}

// Pausieren/Fortsetzen eines Hintergrund-Streams (Medien-Elemente bzw. Spotify-Play/Pause).
export async function setBackgroundPaused(streamId: string, paused: boolean): Promise<void> {
	const bg = get(backgroundStreams).find((b) => b.streamId === streamId);
	if (!bg) return;
	backgroundStreams.update((l) => l.map((b) => (b.streamId === streamId ? { ...b, paused } : b)));
	if (!browser) return;
	try {
		const { invoke } = await import('@tauri-apps/api/core');
		await invoke('webview_set_paused', { label: bg.label, paused });
	} catch (e) {
		console.warn('[pause] fehlgeschlagen:', e);
	}
}

// Sammelaktionen für alle Hintergrund-Streams.
export async function setAllBackgroundMuted(muted: boolean): Promise<void> {
	const ids = get(backgroundStreams).map((b) => b.streamId);
	for (const id of ids) await setBackgroundMuted(id, muted);
}
export async function closeAllBackgroundStreams(): Promise<void> {
	const ids = get(backgroundStreams).map((b) => b.streamId);
	for (const id of ids) await closeBackgroundStream(id);
}

// Vordergrund-Stream neu laden (Webview schließen + frisch erzeugen). Für Crash-Recovery.
export async function reloadEmbedded(rect: Rect): Promise<void> {
	const p = get(activeStream);
	if (!browser || !p || usingFallback) return;
	streamError.set(false);
	if (foregroundLabel) await closeLabel(foregroundLabel);
	currentLabel = null; // erzwingt Neuerstellung mit demselben Label
	await showEmbedded(p, rect);
}

// Aktuellen Stream als eigenes Fenster öffnen (Notlösung, falls Einbetten klemmt).
export async function openCurrentInWindow(): Promise<void> {
	const p = get(activeStream);
	if (!browser || !p) return;
	await closeEmbedded();
	usingFallback = true;
	streamMode.set('window');
	await openInWindow(p);
}
