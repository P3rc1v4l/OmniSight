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

  pickImage:            (dest) => ipcRenderer.invoke('pick-image', dest),

  getAllSessions:        () => ipcRenderer.invoke('get-all-sessions'),
  clearAllSessions:     () => ipcRenderer.send('clear-all-sessions'),
  clearProviderSession: (id) => ipcRenderer.send('clear-provider-session', id),

  setupWebviewSession:  (p) => ipcRenderer.send('setup-webview-session', p),
  checkUrl:             (url) => ipcRenderer.invoke('check-url', url),

  searchTitle:          (q) => ipcRenderer.invoke('search-title', q),
  searchTitleDetail:    (id) => ipcRenderer.invoke('search-title-detail', id),

  getTrending:          () => ipcRenderer.invoke('get-trending'),
  getNewReleases:       () => ipcRenderer.invoke('get-new-releases'),

  openExternal:         (url) => ipcRenderer.send('open-external', url),
});
