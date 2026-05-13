const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window Controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.send('set-theme', theme),

  // Provider Sessions
  getProviderSession: (providerId) => ipcRenderer.invoke('get-provider-session', providerId),
  setProviderSession: (providerId, data) => ipcRenderer.send('set-provider-session', { providerId, data }),
  clearProviderSession: (providerId) => ipcRenderer.send('clear-provider-session', providerId),

  // Provider öffnen
  openProvider: (providerId, url) => ipcRenderer.send('open-provider', { providerId, url }),
  onShowProvider: (callback) => ipcRenderer.on('show-provider', (_, data) => callback(data)),

  // Extern öffnen
  openExternal: (url) => ipcRenderer.send('open-external', url),
});
