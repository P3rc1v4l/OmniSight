'use strict';
// OmniSight – Preload Script (Context Bridge)
// Stellt window.electronAPI im Renderer zur Verfügung

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Fenster ──────────────────────────────────────────────────────
  minimize:                 ()    => ipcRenderer.send('window-minimize'),
  maximize:                 ()    => ipcRenderer.send('window-maximize'),
  close:                    ()    => ipcRenderer.send('window-close'),
  setFullscreen:            (f)   => ipcRenderer.send('window-fullscreen', f),
  isFullscreen:             ()    => ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange:       (cb)  => ipcRenderer.on('fullscreen-change', (_, v) => cb(v)),

  // ── Auto-Update ─────────────────────────────────────────────────
  checkForUpdates:          ()    => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate:           ()    => ipcRenderer.send('download-update'),
  installUpdate:            ()    => ipcRenderer.send('install-update'),
  onUpdateAvailable:        (cb)  => ipcRenderer.on('update-available',         (_, v) => cb(v)),
  onUpdateNotAvailable:     (cb)  => ipcRenderer.on('update-not-available',     ()     => cb()),
  onUpdateDownloaded:       (cb)  => ipcRenderer.on('update-downloaded',        (_, v) => cb(v)),
  onUpdateDownloadProgress: (cb)  => ipcRenderer.on('update-download-progress', (_, v) => cb(v)),
  onUpdateError:            (cb)  => ipcRenderer.on('update-error',             (_, v) => cb(v)),

  // ── Crash-Log ───────────────────────────────────────────────────
  onCrashLogFound:          (cb)  => ipcRenderer.on('crash-log-found', (_, v) => cb(v)),
  clearCrashLog:            ()    => ipcRenderer.send('clear-crash-log'),

  // ── Einstellungen ───────────────────────────────────────────────
  getTheme:                 ()    => ipcRenderer.invoke('get-theme'),
  setTheme:                 (v)   => ipcRenderer.send('set-theme', v),
  getSettings:              ()    => ipcRenderer.invoke('get-settings'),
  setSettings:              (v)   => ipcRenderer.send('set-settings', v),
  getProfiles:              ()    => ipcRenderer.invoke('get-profiles'),
  setProfiles:              (v)   => ipcRenderer.send('set-profiles', v),
  getActiveProfile:         ()    => ipcRenderer.invoke('get-active-profile'),
  setActiveProfile:         (id)  => ipcRenderer.send('set-active-profile', id),
  getAppVersion:            ()    => ipcRenderer.invoke('get-app-version'),

  // ── Benachrichtigungen ──────────────────────────────────────────
  showNotification:         (t,b) => ipcRenderer.send('show-notification', { title:t, body:b }),
  getNotifications:         (p)   => ipcRenderer.invoke('get-notifications', p),
  setNotifications:         (p,l) => ipcRenderer.send('set-notifications', { profileId:p, list:l }),

  // ── Bild-Picker ─────────────────────────────────────────────────
  pickImage:                (d)   => ipcRenderer.invoke('pick-image', d),

  // ── Sessions ────────────────────────────────────────────────────
  getAllSessions:            (p)   => ipcRenderer.invoke('get-all-sessions', p),
  refreshSessionsNow:       (p)   => ipcRenderer.send('refresh-sessions-now', p),
  setupWebviewSession:      (p)   => ipcRenderer.send('setup-webview-session', p),
  onSessionsUpdated:        (cb)  => ipcRenderer.on('sessions-updated', (_, v) => cb(v)),
  onSessionsCleared:        (cb)  => ipcRenderer.on('sessions-cleared', () => cb()),
  clearAllSessions:         (p)   => ipcRenderer.send('clear-all-sessions', p),
  clearProviderSession:     (p,id)=> ipcRenderer.send('clear-provider-session', p, id),
  clearProvidersSessions:   (p,ids)=> ipcRenderer.send('clear-providers-sessions', p, ids),
  openGoogleAuthBrowser:    (p)   => ipcRenderer.send('open-google-auth-browser', p),
  onGoogleAuthDone:         (cb)  => ipcRenderer.on('google-auth-done', () => cb()),

  // ── Statistiken ─────────────────────────────────────────────────
  recordWatchTime:          (id,s,p) => ipcRenderer.send('record-watch-time',
                                          { providerId:id, seconds:s, profileId:p }),
  getStreamStats:           (p)   => ipcRenderer.invoke('get-stream-stats', p),
  getWatchedContent:        (p)   => ipcRenderer.invoke('get-watched-content', p),
  setWatchedContent:        (p,l) => ipcRenderer.send('set-watched-content',
                                          { profileId:p, list:l }),

  // ── Multi-Window ────────────────────────────────────────────────
  openSecondWindow:         (p)   => ipcRenderer.invoke('open-second-window', p),

  // ── TMDB ────────────────────────────────────────────────────────
  getTrending:              ()    => ipcRenderer.invoke('get-trending'),
  getNewReleases:           ()    => ipcRenderer.invoke('get-new-releases'),
  getUpcoming:              (m)   => ipcRenderer.invoke('get-upcoming', m),
  getTmdbDetail:            (p)   => ipcRenderer.invoke('get-tmdb-detail', p),
  searchTmdb:               (q)   => ipcRenderer.invoke('search-tmdb', q),
  getStreamingProviders:    (p)   => ipcRenderer.invoke('get-streaming-providers', p),
  getWatchlistReleases:     (ids) => ipcRenderer.invoke('get-watchlist-releases', ids),
  getProvidersList:         ()    => ipcRenderer.invoke('get-providers-list'),

  // ── Ad-Block ────────────────────────────────────────────────────
  fetchAdblockList:         (u)   => ipcRenderer.invoke('fetch-adblock-list', u),
  applyExtraAdDomains:      (d)   => ipcRenderer.send('apply-extra-ad-domains', d),
  getExtraAdDomains:        ()    => ipcRenderer.invoke('get-extra-ad-domains'),

  // ── WideVine ────────────────────────────────────────────────────
  getWidevineStatus:        ()    => ipcRenderer.invoke('get-widevine-status'),

  // ── Sicherheit ──────────────────────────────────────────────────
  getAdminHash:             ()    => ipcRenderer.invoke('get-admin-hash'),
  hashPin:                  (pin) => ipcRenderer.invoke('hash-pin', pin),
  verifyPin:                (p,h) => ipcRenderer.invoke('verify-pin', p, h),

  // ── Export / Import ─────────────────────────────────────────────
  exportSettings:           ()    => ipcRenderer.invoke('export-settings'),
  importSettings:           ()    => ipcRenderer.invoke('import-settings'),

  // ── Sonstiges ───────────────────────────────────────────────────
  getAchievements:          (p)   => ipcRenderer.invoke('get-achievements', p),
  setAchievements:          (p,l) => ipcRenderer.send('set-achievements', { profileId:p, list:l }),
  getAchievementMeta:       (p)   => ipcRenderer.invoke('get-achievement-meta', p),
  setAchievementMeta:       (p,m) => ipcRenderer.send('set-achievement-meta', { profileId:p, meta:m }),
  getSystemTheme:           ()    => ipcRenderer.invoke('get-system-theme'),
  setThemeSource:           (s)   => ipcRenderer.send('set-theme-source', s),
  onSystemThemeChanged:     (cb)  => ipcRenderer.on('system-theme-changed', (_, v) => cb(v)),
  checkOnline:              ()    => ipcRenderer.invoke('check-online'),
  checkUrl:                 (u)   => ipcRenderer.invoke('check-url', u),
  checkVpn:                 ()    => ipcRenderer.invoke('check-vpn'),
  openExternal:             (u)   => ipcRenderer.send('open-external', u),
});
