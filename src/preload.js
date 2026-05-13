const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize:           () => ipcRenderer.send('window-minimize'),
  maximize:           () => ipcRenderer.send('window-maximize'),
  close:              () => ipcRenderer.send('window-close'),
  setFullscreen:      (f) => ipcRenderer.send('window-fullscreen', f),
  isFullscreen:       () => ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange: (cb) => ipcRenderer.on('fullscreen-change', (_, v) => cb(v)),
  onSessionsCleared:  (cb) => ipcRenderer.on('sessions-cleared', cb),

  getTheme:    () => ipcRenderer.invoke('get-theme'),
  setTheme:    (v) => ipcRenderer.send('set-theme', v),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (v) => ipcRenderer.send('set-settings', v),

  getAllSessions:        () => ipcRenderer.invoke('get-all-sessions'),
  setProviderLoggedIn:  (id, v) => ipcRenderer.send('set-provider-logged-in', { providerId: id, loggedIn: v }),
  clearAllSessions:     () => ipcRenderer.send('clear-all-sessions'),
  clearProviderSession: (id) => ipcRenderer.send('clear-provider-session', id),

  setupWebviewSession: (partition) => ipcRenderer.send('setup-webview-session', partition),
  openExternal:        (url) => ipcRenderer.send('open-external', url),
});
