const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize:              ()=>ipcRenderer.send('window-minimize'),
  maximize:              ()=>ipcRenderer.send('window-maximize'),
  close:                 ()=>ipcRenderer.send('window-close'),
  setFullscreen:         (f)=>ipcRenderer.send('window-fullscreen',f),
  isFullscreen:          ()=>ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange:    (cb)=>ipcRenderer.on('fullscreen-change',(_,v)=>cb(v)),
  onSessionsCleared:     (cb)=>ipcRenderer.on('sessions-cleared',cb),
  onUpdateAvailable:     (cb)=>ipcRenderer.on('update-available',(_,v)=>cb(v)),
  onUpdateDownloaded:    (cb)=>ipcRenderer.on('update-downloaded',cb),
  installUpdate:         ()=>ipcRenderer.send('install-update'),

  getTheme:              ()=>ipcRenderer.invoke('get-theme'),
  setTheme:              (v)=>ipcRenderer.send('set-theme',v),
  getSettings:           ()=>ipcRenderer.invoke('get-settings'),
  setSettings:           (v)=>ipcRenderer.send('set-settings',v),

  getProfiles:           ()=>ipcRenderer.invoke('get-profiles'),
  setProfiles:           (v)=>ipcRenderer.send('set-profiles',v),
  getActiveProfile:      ()=>ipcRenderer.invoke('get-active-profile'),
  setActiveProfile:      (id)=>ipcRenderer.send('set-active-profile',id),

  showNotification:      (t,b)=>ipcRenderer.send('show-notification',{title:t,body:b}),

  pickImage:             (d)=>ipcRenderer.invoke('pick-image',d),

  getAllSessions:         ()=>ipcRenderer.invoke('get-all-sessions'),
  checkSessionContent:   (p)=>ipcRenderer.invoke('check-session-content',p),
  clearAllSessions:      ()=>ipcRenderer.send('clear-all-sessions'),
  clearProviderSession:  (id)=>ipcRenderer.send('clear-provider-session',id),
  setupWebviewSession:   (p)=>ipcRenderer.send('setup-webview-session',p),

  checkUrl:              (url)=>ipcRenderer.invoke('check-url',url),
  checkOnline:           ()=>ipcRenderer.invoke('check-online'),

  searchTitle:           (q)=>ipcRenderer.invoke('search-title',q),
  searchTitleDetail:     (id)=>ipcRenderer.invoke('search-title-detail',id),

  getTrending:           ()=>ipcRenderer.invoke('get-trending'),
  getNewReleases:        ()=>ipcRenderer.invoke('get-new-releases'),
  getUpcoming:           (m)=>ipcRenderer.invoke('get-upcoming',m),
  getTmdbDetail:         (p)=>ipcRenderer.invoke('get-tmdb-detail',p),

  fetchAdblockList:      (url)=>ipcRenderer.invoke('fetch-adblock-list',url),
  applyExtraAdDomains:   (d)=>ipcRenderer.send('apply-extra-ad-domains',d),
  getExtraAdDomains:     ()=>ipcRenderer.invoke('get-extra-ad-domains'),

  openChromeExtension:   (url)=>ipcRenderer.send('open-chrome-extension',url),
  openExternal:          (url)=>ipcRenderer.send('open-external',url),
});
