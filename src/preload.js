const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window
  minimize:              ()=>ipcRenderer.send('window-minimize'),
  maximize:              ()=>ipcRenderer.send('window-maximize'),
  close:                 ()=>ipcRenderer.send('window-close'),
  setFullscreen:         (f)=>ipcRenderer.send('window-fullscreen',f),
  isFullscreen:          ()=>ipcRenderer.invoke('window-is-fullscreen'),
  onFullscreenChange:    (cb)=>ipcRenderer.on('fullscreen-change',(_,v)=>cb(v)),
  onSessionsUpdated:     (cb)=>ipcRenderer.on('sessions-updated',(_,v)=>cb(v)),
  onSessionsCleared:     (cb)=>ipcRenderer.on('sessions-cleared',cb),
  onUpdateAvailable:     (cb)=>ipcRenderer.on('update-available',(_,v)=>cb(v)),
  onUpdateDownloaded:    (cb)=>ipcRenderer.on('update-downloaded',cb),
  onGoogleAuthDone:      (cb)=>ipcRenderer.on('google-auth-done',cb),
  installUpdate:         ()=>ipcRenderer.send('install-update'),
  checkForUpdates:       ()=>ipcRenderer.invoke('check-for-updates'),

  // Settings / Profiles
  getTheme:              ()=>ipcRenderer.invoke('get-theme'),
  setTheme:              (v)=>ipcRenderer.send('set-theme',v),
  getSettings:           ()=>ipcRenderer.invoke('get-settings'),
  setSettings:           (v)=>ipcRenderer.send('set-settings',v),
  getProfiles:           ()=>ipcRenderer.invoke('get-profiles'),
  setProfiles:           (v)=>ipcRenderer.send('set-profiles',v),
  getActiveProfile:      ()=>ipcRenderer.invoke('get-active-profile'),
  setActiveProfile:      (id)=>ipcRenderer.send('set-active-profile',id),

  // Notifications
  showNotification:      (t,b)=>ipcRenderer.send('show-notification',{title:t,body:b}),

  // Image
  pickImage:             (d)=>ipcRenderer.invoke('pick-image',d),

  // Sessions (profil-basiert)
  getAllSessions:         (pid)=>ipcRenderer.invoke('get-all-sessions',pid),
  refreshSessionsNow:    (pid)=>ipcRenderer.send('refresh-sessions-now',pid),
  clearAllSessions:      (pid)=>ipcRenderer.send('clear-all-sessions',pid),
  clearProviderSession:  (pid,prov)=>ipcRenderer.send('clear-provider-session',{providerId:prov,profileId:pid}),
  setupWebviewSession:   (p)=>ipcRenderer.send('setup-webview-session',p),
  getPartition:          (prov,pid)=>ipcRenderer.invoke('get-partition',{providerId:prov,profileId:pid}),

  // Google Auth
  openGoogleAuthBrowser: (pid)=>ipcRenderer.invoke('open-google-auth-browser',pid),

  // Stream Stats
  recordWatchTime:       (prov,secs,pid)=>ipcRenderer.send('record-watch-time',{providerId:prov,seconds:secs,profileId:pid}),
  getStreamStats:        (pid)=>ipcRenderer.invoke('get-stream-stats',pid),

  // VPN
  checkVpn:              ()=>ipcRenderer.invoke('check-vpn'),

  // Multi-window
  openSecondWindow:      (p)=>ipcRenderer.invoke('open-second-window',p),

  // TMDB / OMDB / Search
  getTrending:           ()=>ipcRenderer.invoke('get-trending'),
  getNewReleases:        ()=>ipcRenderer.invoke('get-new-releases'),
  getUpcoming:           (m)=>ipcRenderer.invoke('get-upcoming',m),
  getTmdbDetail:         (p)=>ipcRenderer.invoke('get-tmdb-detail',p),
  searchTitle:           (q)=>ipcRenderer.invoke('search-title',q),
  searchTitleDetail:     (id)=>ipcRenderer.invoke('search-title-detail',id),
  searchTmdb:            (p)=>ipcRenderer.invoke('search-tmdb',p),
  getStreamingProviders: (p)=>ipcRenderer.invoke('get-streaming-providers',p),
  findByImdb:            (id)=>ipcRenderer.invoke('find-by-imdb',id),

  // Adblock
  fetchAdblockList:      (url)=>ipcRenderer.invoke('fetch-adblock-list',url),
  applyExtraAdDomains:   (d)=>ipcRenderer.send('apply-extra-ad-domains',d),
  getExtraAdDomains:     ()=>ipcRenderer.invoke('get-extra-ad-domains'),

  // Widevine
  getWidevineStatus:     ()=>ipcRenderer.invoke('get-widevine-status'),

  // Update
  checkUrl:              (url)=>ipcRenderer.invoke('check-url',url),
  checkOnline:           ()=>ipcRenderer.invoke('check-online'),
  openExternal:          (url)=>ipcRenderer.send('open-external',url),
});
