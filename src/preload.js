const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize:             () => ipcRenderer.send('window-minimize'),
  maximize:             () => ipcRenderer.send('window-maximize'),
  close:                () => ipcRenderer.send('window-close'),
  setFullscreen:        (f) => ipcRenderer.send('window-fullscreen', f),
  isFullscreen:         () => ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange:   (cb) => ipcRenderer.on('fullscreen-change', (_, v) => cb(v)),
  onSessionsCleared:    (cb) => ipcRenderer.on('sessions-cleared', cb),

  getTheme:             () => ipcRenderer.invoke('get-theme'),
  setTheme:             (v) => ipcRenderer.send('set-theme', v),
  getSettings:          () => ipcRenderer.invoke('get-settings'),
  setSettings:          (v) => ipcRenderer.send('set-settings', v),
  pickImage:            (d) => ipcRenderer.invoke('pick-image', d),

  getAllSessions:        () => ipcRenderer.invoke('get-all-sessions'),
  clearAllSessions:     () => ipcRenderer.send('clear-all-sessions'),
  clearProviderSession: (id) => ipcRenderer.send('clear-provider-session', id),
  setupWebviewSession:  (p)  => ipcRenderer.send('setup-webview-session', p),
  checkUrl:             (url) => ipcRenderer.invoke('check-url', url),

  searchTitle:          (q)  => ipcRenderer.invoke('search-title', q),
  searchTitleDetail:    (id) => ipcRenderer.invoke('search-title-detail', id),

  getTrending:          () => ipcRenderer.invoke('get-trending'),
  getNewReleases:       () => ipcRenderer.invoke('get-new-releases'),
  getUpcoming:          () => ipcRenderer.invoke('get-upcoming'),

  // Plugins
  installPlugin:        () => ipcRenderer.invoke('install-plugin'),
  getPlugins:           () => ipcRenderer.invoke('get-plugins'),
  removePlugin:         (name) => ipcRenderer.send('remove-plugin', name),
  fetchAdblockList:     (url) => ipcRenderer.invoke('fetch-adblock-list', url),
  applyExtraAdDomains:  (domains) => ipcRenderer.send('apply-extra-ad-domains', domains),
  getExtraAdDomains:    () => ipcRenderer.invoke('get-extra-ad-domains'),

  openExternal:         (url) => ipcRenderer.send('open-external', url),
});
