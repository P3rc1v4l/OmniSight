const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window
  minimize:              () => ipcRenderer.send('window-minimize'),
  maximize:              () => ipcRenderer.send('window-maximize'),
  close:                 () => ipcRenderer.send('window-close'),
  setFullscreen:         (f) => ipcRenderer.send('window-fullscreen', f),
  isFullscreen:          () => ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange:    (cb) => ipcRenderer.on('fullscreen-change',  (_, v) => cb(v)),
  onSessionsCleared:     (cb) => ipcRenderer.on('sessions-cleared',   cb),
  onSessionsUpdated:     (cb) => ipcRenderer.on('sessions-updated',   (_, v) => cb(v)),
  onUpdateAvailable:     (cb) => ipcRenderer.on('update-available',   (_, v) => cb(v)),
  onUpdateNotAvailable:  (cb) => ipcRenderer.on('update-not-available', cb),
  onUpdateDownloaded:    (cb) => ipcRenderer.on('update-downloaded',  cb),
  onUpdateError:         (cb) => ipcRenderer.on('update-error',       (_, v) => cb(v)),
  installUpdate:         () => ipcRenderer.send('install-update'),
  checkForUpdates:       () => ipcRenderer.invoke('check-for-updates'),
  onGoogleAuthDone:      (cb) => ipcRenderer.on('google-auth-done',   cb),

  // Settings / Profiles
  getTheme:              () => ipcRenderer.invoke('get-theme'),
  setTheme:              (v) => ipcRenderer.send('set-theme', v),
  getSettings:           () => ipcRenderer.invoke('get-settings'),
  setSettings:           (v) => ipcRenderer.send('set-settings', v),
  getProfiles:           () => ipcRenderer.invoke('get-profiles'),
  setProfiles:           (v) => ipcRenderer.send('set-profiles', v),
  getActiveProfile:      () => ipcRenderer.invoke('get-active-profile'),
  setActiveProfile:      (id) => ipcRenderer.send('set-active-profile', id),

  // Notifications
  showNotification:      (t, b) => ipcRenderer.send('show-notification', { title: t, body: b }),

  // Images
  pickImage:             (d) => ipcRenderer.invoke('pick-image', d),

  // Sessions
  getAllSessions:         (profileId) => ipcRenderer.invoke('get-all-sessions', profileId),
  refreshSessionsNow:    (profileId) => ipcRenderer.send('refresh-sessions-now', profileId),
  clearAllSessions:      (profileId) => ipcRenderer.send('clear-all-sessions', profileId),
  clearProviderSession:  (profileId, id) => ipcRenderer.send('clear-provider-session', profileId, id),
  setupWebviewSession:   (p) => ipcRenderer.send('setup-webview-session', p),

  // Google Auth (YouTube)
  openGoogleAuthBrowser: (profileId) => ipcRenderer.send('open-google-auth-browser', profileId),

  // Connectivity
  checkUrl:              (url) => ipcRenderer.invoke('check-url', url),
  checkOnline:           () => ipcRenderer.invoke('check-online'),
  checkVpn:              () => ipcRenderer.invoke('check-vpn'),

  // Stream Stats
  recordWatchTime:       (id, secs, profileId) => ipcRenderer.send('record-watch-time', { providerId: id, seconds: secs, profileId }),
  getStreamStats:        (profileId) => ipcRenderer.invoke('get-stream-stats', profileId),

  // Multi-window
  openSecondWindow:      (p) => ipcRenderer.invoke('open-second-window', p),

  // TMDB
  getTrending:           () => ipcRenderer.invoke('get-trending'),
  getNewReleases:        () => ipcRenderer.invoke('get-new-releases'),
  getUpcoming:           (m) => ipcRenderer.invoke('get-upcoming', m),
  getTmdbDetail:         (p) => ipcRenderer.invoke('get-tmdb-detail', p),
  searchTmdb:            (p) => ipcRenderer.invoke('search-tmdb', p),
  getStreamingProviders: (p) => ipcRenderer.invoke('get-streaming-providers', p),

  // Adblock
  fetchAdblockList:      (url) => ipcRenderer.invoke('fetch-adblock-list', url),
  applyExtraAdDomains:   (d) => ipcRenderer.send('apply-extra-ad-domains', d),
  getExtraAdDomains:     () => ipcRenderer.invoke('get-extra-ad-domains'),

  // Widevine
  getWidevineStatus:     () => ipcRenderer.invoke('get-widevine-status'),

  openExternal:          (url) => ipcRenderer.send('open-external', url),
});
