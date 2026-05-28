// ═══════════════════════════════════════════════════════════════════
// OmniHub – Tauri API Bridge  v0.2.0
// Ersetzt Electron's preload.js / contextBridge
// ═══════════════════════════════════════════════════════════════════

import { invoke }       from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

// ── Hilfsfunktionen ─────────────────────────────────────────────────
function noop()    { return Promise.resolve(); }
function noopObj() { return Promise.resolve({}); }
function noopArr() { return Promise.resolve([]); }
function noopBool(v = false) { return () => Promise.resolve(v); }

// ── Globale API ──────────────────────────────────────────────────────
window.electronAPI = {

  // ── Settings ──────────────────────────────────────────────────────
  getSettings:            ()          => invoke('get_settings'),
  setSettings:            (s)         => invoke('set_settings', { settings: s }),
  getTheme:               ()          => invoke('get_theme'),
  setTheme:               (t)         => invoke('set_theme', { theme: t }),
  setThemeSource:         (t)         => invoke('set_theme', { theme: t }),

  // ── Profile ───────────────────────────────────────────────────────
  getProfiles:            ()          => invoke('get_profiles'),
  setProfiles:            (p)         => invoke('set_profiles', { profiles: p }),
  getActiveProfile:       ()          => invoke('get_active_profile'),
  setActiveProfile:       (id)        => invoke('set_active_profile', { profileId: id }),
  hashPin:                (pin)       => invoke('hash_pin', { pin }),
  verifyPin:              (pin, hash) => invoke('verify_pin', { pin, hash }),

  // ── Streaming & Stats ─────────────────────────────────────────────
  getStreamStats:         (pid)       => invoke('get_stream_stats', { profileId: pid }),
  setStreamStats:         (pid, s)    => invoke('set_stream_stats', { profileId: pid, stats: s }),
  getWatchedContent:      (pid)       => invoke('get_watched_content', { profileId: pid }),
  setWatchedContent:      (pid, c)    => invoke('set_watched_content', { profileId: pid, content: c }),
  recordWatchTime:        (id, secs, pid) =>
                            invoke('record_watch_time', { providerId: id, seconds: secs, profileId: pid }),

  // ── Achievements ──────────────────────────────────────────────────
  getAchievements:        (pid)       => invoke('get_achievements', { profileId: pid }),
  setAchievements:        (pid, l)    => invoke('set_achievements', { profileId: pid, list: l }),
  getAchievementMeta:     (pid)       => invoke('get_achievement_meta', { profileId: pid }),
  setAchievementMeta:     (pid, m)    => invoke('set_achievement_meta', { profileId: pid, meta: m }),

  // ── Notifications ─────────────────────────────────────────────────
  getNotifications:       (pid)       => invoke('get_notifications', { profileId: pid }),
  setNotifications:       (pid, n)    => invoke('set_notifications', { profileId: pid, notifs: n }),
  showNotification: async (title, body) => {
    try {
      const { isPermissionGranted, requestPermission, sendNotification } =
        await import('@tauri-apps/plugin-notification');
      let granted = await isPermissionGranted();
      if (!granted) {
        const perm = await requestPermission();
        granted = perm === 'granted';
      }
      if (granted) sendNotification({ title, body });
    } catch { /* Stille Fehler – Benachrichtigungen optional */ }
  },

  // ── TMDB ──────────────────────────────────────────────────────────
  searchTmdb:             (q)         => invoke('search_tmdb', { query: q }),
  getTrending:            ()          => invoke('get_trending'),
  getNewReleases:         ()          => invoke('get_new_releases'),
  getUpcoming:            (page)      => invoke('get_upcoming', { page: page || 1 }),
  getStreamingProviders:  (opts)      => invoke('get_streaming_providers', opts),
  getTmdbDetail:          (opts)      => invoke('get_tmdb_detail', opts),
  getWatchlistReleases:   (items)     => invoke('get_watchlist_releases', { items }),

  // ── System ────────────────────────────────────────────────────────
  openExternal:           (url)       => invoke('open_external', { url }),
  getAppVersion:          ()          => invoke('get_app_version'),
  checkOnline:            ()          => invoke('check_online'),
  getSystemTheme:         ()          => invoke('get_system_theme'),
  pickImage:              ()          => invoke('pick_image'),

  // ── Window-Steuerung (Tauri v2) ───────────────────────────────────
  minimize:               ()          => appWindow.minimize(),
  maximize:               ()          => appWindow.toggleMaximize(),
  close:                  ()          => appWindow.close(),

  setFullscreen: async (on) => {
    try {
      await appWindow.setFullscreen(on);
      await emit('fullscreen-changed', on);
    } catch (e) {
      console.warn('[OmniHub] setFullscreen:', e);
    }
  },
  isFullscreen: async () => {
    try { return await appWindow.isFullscreen(); }
    catch { return false; }
  },

  // Zweites Fenster öffnen (Stub – für spätere Implementierung)
  openSecondWindow: async (opts) => {
    try {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const label = 'secondary_' + Date.now();
      new WebviewWindow(label, {
        url:       opts.url || 'about:blank',
        title:     opts.title || 'OmniHub – Stream',
        width:     1280,
        height:    800,
        center:    true,
        decorations: true,
      });
    } catch (e) {
      console.warn('[OmniHub] openSecondWindow:', e);
    }
  },

  // ── Events (Tauri Event-System) ───────────────────────────────────
  onUpdateAvailable:      (cb) => listen('update-available',      e => cb(e.payload)),
  onUpdateNotAvailable:   (cb) => listen('update-not-available',  () => cb()),
  onUpdateDownloaded:     (cb) => listen('update-downloaded',     () => cb()),
  onUpdateDownloadProgress:(cb)=> listen('update-download-progress', e => cb(e.payload)),
  onUpdateError:          (cb) => listen('update-error',          e => cb(e.payload)),
  onSystemThemeChanged:   (cb) => listen('system-theme-changed',  e => cb(e.payload)),
  onSessionsUpdated:      (cb) => listen('sessions-updated',      e => cb(e.payload)),
  onFullscreenChange:     (cb) => listen('fullscreen-changed',    e => cb(e.payload)),
  onCrashLogFound:        (cb) => listen('crash-log-found',       e => cb(e.payload)),

  // ── Updater ───────────────────────────────────────────────────────
  checkForUpdates: async () => {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      if (update) {
        await emit('update-available', { version: update.version });
      } else {
        await emit('update-not-available', null);
      }
    } catch (e) {
      await emit('update-error', e?.message || String(e));
    }
  },

  downloadUpdate: async () => {
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();
      if (!update) return;
      let downloaded = 0;
      let total = 0;
      await update.downloadAndInstall(event => {
        switch (event.event) {
          case 'Started':
            total = event.data?.contentLength || 0;
            break;
          case 'Progress':
            downloaded += event.data?.chunkLength || 0;
            if (total > 0) {
              const pct = Math.round((downloaded / total) * 100);
              emit('update-download-progress', pct);
            }
            break;
          case 'Finished':
            emit('update-downloaded', null);
            break;
        }
      });
    } catch (e) {
      await emit('update-error', e?.message || String(e));
    }
  },

  installUpdate: async () => {
    try {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch { /* Stille Fehler */ }
  },

  // ── Settings Export/Import (Stub) ─────────────────────────────────
  exportSettings: async () => {
    // Wird über Frontend-Download gelöst
    return { ok: false, error: 'Verwende Einstellungen → Mehr → Watchlist Export' };
  },
  importSettings: async () => {
    return { ok: false, error: 'Verwende Einstellungen → Mehr → Watchlist Import' };
  },

  // ── Google Auth (Stub – Webview übernimmt das) ───────────────────
  openGoogleAuthBrowser: (pid) => {
    console.log('[OmniHub] Google Auth – wird über Webview gehandhabt');
    return Promise.resolve();
  },

  // ── Crash Log (Stub) ──────────────────────────────────────────────
  clearCrashLog: noop,

  // ── WideVine – Edge WebView hat es eingebaut! ─────────────────────
  getWidevineStatus: async () => ({
    installed:     true,
    dllExists:     true,
    sigExists:     true,
    manifestExists:true,
    version:       'Edge WebView (eingebaut)',
    cdmDir:        'Edge WebView – kein manueller Setup nötig',
    isBuiltIn:     true,
  }),

  // ── Session Management (Stubs – WebView verwaltet Sessions) ───────
  refreshSessionsNow:       (pid)         => Promise.resolve(),
  setupWebviewSession:      (partition)   => Promise.resolve(),
  getAllSessions:            (pid)         => Promise.resolve({}),
  clearAllSessions:         (pid)         => Promise.resolve(),
  clearProviderSession:     (pid, id)     => Promise.resolve(),
  clearProvidersSessions:   (pid, ids)    => Promise.resolve(),

  // ── AdBlock (Stub – kein separater Proxy-Prozess) ─────────────────
  getExtraAdDomains:        ()            => Promise.resolve([]),
  fetchAdblockList:         (url)         => Promise.resolve({ ok: false, domains: [] }),
  applyExtraAdDomains:      (domains)     => Promise.resolve(),

  // ── Weiteres ──────────────────────────────────────────────────────
  setFullscreenMode:        (on)          => appWindow.setFullscreen(on),
};

console.log('[OmniHub] Tauri Bridge v0.2.0 geladen ✓ – WideVine via Edge WebView eingebaut');
