const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window
  minimize:           () => ipcRenderer.send('window-minimize'),
  maximize:           () => ipcRenderer.send('window-maximize'),
  close:              () => ipcRenderer.send('window-close'),
  setFullscreen:      (f) => ipcRenderer.send('window-fullscreen', f),
  isFullscreen:       () => ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange: (cb) => ipcRenderer.on('fullscreen-change', (_, v) => cb(v)),
  onSessionsCleared:  (cb) => ipcRenderer.on('sessions-cleared', cb),

  // Theme
  getTheme:  () => ipcRenderer.invoke('get-theme'),
  setTheme:  (v) => ipcRenderer.send('set-theme', v),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (v) => ipcRenderer.send('set-settings', v),

  // Bild auswählen
  pickImage: (dest) => ipcRenderer.invoke('pick-image', dest),

  // Sessions
  getAllSessions:        () => ipcRenderer.invoke('get-all-sessions'),
  setProviderLoggedIn:  (id, v) => ipcRenderer.send('set-provider-logged-in', { providerId:id, loggedIn:v }),
  clearAllSessions:     () => ipcRenderer.send('clear-all-sessions'),
  clearProviderSession: (id) => ipcRenderer.send('clear-provider-session', id),

  // Webview Session
  setupWebviewSession: (p) => ipcRenderer.send('setup-webview-session', p),

  // Diagnose
  checkUrl: (url) => ipcRenderer.invoke('check-url', url),

  // Extern
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
