'use strict';
const { app, BrowserWindow, ipcMain, session, shell, dialog, Notification, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// ══════════════════════════════════════════════
// WIDEVINE
// ══════════════════════════════════════════════
function setupWidevine() {
  const possible = [
    path.join(app.getPath('userData'), 'WidevineCdm'),
    path.join(app.getPath('userData'), 'WidevineCdm', '_platform_specific', 'win_x64'),
    path.join(process.resourcesPath || '', 'WidevineCdm'),
  ];
  for (const cdmPath of possible) {
    if (fs.existsSync(cdmPath)) {
      try {
        app.commandLine.appendSwitch('widevine-cdm-path', cdmPath);
        app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2662.0');
      } catch {}
      break;
    }
  }
  app.commandLine.appendSwitch('enable-features', 'PlatformEncryptedDolbyVision');
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
}
setupWidevine();

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ══════════════════════════════════════════════
// AD-BLOCK
// ══════════════════════════════════════════════
const DEFAULT_AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','googletagmanager.com',
  'googletagservices.com','google-analytics.com','adnxs.com',
  'adsrvr.org','advertising.com','scorecardresearch.com','quantserve.com',
  'outbrain.com','taboola.com','pubmatic.com','rubiconproject.com',
  'openx.net','criteo.com','casalemedia.com','moatads.com',
  'adtech.de','spotxchange.com','smartadserver.com','adsafeprotected.com',
  'doubleverify.com','imasdk.googleapis.com','pagead2.googlesyndication.com',
  'adservice.google.com','securepubads.g.doubleclick.net',
  'ads.crunchyroll.com','fundingchoicesmessages.google.com',
  'amazon-adsystem.com','media.net','revcontent.com','mgid.com',
  'bidswitch.net','rlcdn.com','33across.com','sharethrough.com',
  'indexww.com','appnexus.com','contextweb.com','emxdgt.com','sovrn.com',
];

function getAdDomains() {
  return [...new Set([...DEFAULT_AD_DOMAINS, ...store.get('extraAdDomains', [])])];
}
function isAd(url) {
  try { const h = new URL(url).hostname; return getAdDomains().some(d => h === d || h.endsWith('.' + d)); }
  catch { return false; }
}

// ══════════════════════════════════════════════
// SESSION SETUP
// ══════════════════════════════════════════════
function setupSession(ses) {
  ses.setCertificateVerifyProc((_, cb) => cb(0));
  ses.setUserAgent(CHROME_UA);
  try {
    ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (d, cb) => cb({ cancel: isAd(d.url) }));
  } catch {}
  try {
    ses.webRequest.onBeforeSendHeaders({ urls: ['<all_urls>'] }, (d, cb) => {
      const h = d.requestHeaders;
      h['User-Agent']         = CHROME_UA;
      h['Accept-Language']    = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
      h['Sec-Ch-Ua']          = '"Chromium";v="124","Google Chrome";v="124","Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']   = '?0';
      h['Sec-Ch-Ua-Platform'] = '"Windows"';
      if (d.url.includes('crunchyroll.com')) {
        h['Origin']  = 'https://www.crunchyroll.com';
        h['Referer'] = 'https://www.crunchyroll.com/';
      }
      delete h['X-Frame-Options'];
      cb({ requestHeaders: h });
    });
  } catch {}
  try {
    ses.webRequest.onHeadersReceived({ urls: ['<all_urls>'] }, (d, cb) => {
      const h = d.responseHeaders || {};
      for (const k of Object.keys(h)) {
        if (['x-frame-options','content-security-policy','x-content-type-options'].includes(k.toLowerCase())) delete h[k];
      }
      cb({ responseHeaders: h });
    });
  } catch {}
}

// ══════════════════════════════════════════════
// MAIN WINDOW
// ══════════════════════════════════════════════
function createMainWindow() {
  // Gespeicherte Fensterposition
  const savedBounds = store.get('windowBounds', null);
  const opts = {
    width: savedBounds?.width || 1400,
    height: savedBounds?.height || 900,
    minWidth: 820, minHeight: 520,
    frame: false, backgroundColor: '#0a0a0f',
    show: false,  // Verhindert kurzes Aufblitzen vor Splash
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, webSecurity: false,
      allowRunningInsecureContent: true,
    },
  };
  if (savedBounds?.x !== undefined) { opts.x = savedBounds.x; opts.y = savedBounds.y; }

  mainWindow = new BrowserWindow(opts);

  // Position beim Schließen speichern
  mainWindow.on('close', () => {
    const isMax = mainWindow.isMaximized();
    if (!isMax) store.set('windowBounds', mainWindow.getBounds());
    else store.set('windowBounds', { ...store.get('windowBounds', {}), maximized: true });
  });

  setupSession(session.defaultSession);

  // Splash-Screen
  const splash = new BrowserWindow({
    width: 420, height: 280, frame: false, alwaysOnTop: true,
    transparent: true, backgroundColor: '#00000000',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: { nodeIntegration: false },
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));

  // Hauptfenster laden
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Splash nach 2.5s schließen, Hauptfenster zeigen
  // did-finish-load ist zuverlässiger als ready-to-show bei show:false
  let splashDone = false;
  function showMain() {
    if (splashDone) return;
    splashDone = true;
    try { splash.destroy(); } catch {}
    mainWindow.show();
    mainWindow.focus();
    if (savedBounds?.maximized) mainWindow.maximize();
  }

  // Mindestens 2.5s Splash, dann zeigen sobald geladen
  const splashTimer = setTimeout(showMain, 2500);
  mainWindow.webContents.once('did-finish-load', () => {
    // Warte mind. 2.5s, aber nicht ewig
    if (!splashDone) {
      // Timer läuft noch → nichts tun, showMain() wird nach 2.5s aufgerufen
      // Falls did-finish-load nach dem Timer kommt → showMain() ist schon fertig
    }
  });
  // Fallback: nach 5s auf jeden Fall zeigen
  setTimeout(showMain, 5000);

  mainWindow.on('closed', () => { mainWindow = null; app.quit(); });
  mainWindow.on('enter-full-screen', () => mainWindow?.webContents.send('fullscreen-change', true));
  mainWindow.on('leave-full-screen',  () => mainWindow?.webContents.send('fullscreen-change', false));

  // Auto-Updater
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.setFeedURL({ provider: 'github', owner: 'P3rc1v4l', repo: 'OmniSight' });
    autoUpdater.on('update-available',     info => mainWindow?.webContents.send('update-available', info));
    autoUpdater.on('update-not-available', ()   => mainWindow?.webContents.send('update-not-available'));
    autoUpdater.on('update-downloaded',    ()   => mainWindow?.webContents.send('update-downloaded'));
    autoUpdater.on('error', err => {
      const msg = err.message || '';
      if (!msg.includes('app-update.yml') && !msg.includes('404')) {
        mainWindow?.webContents.send('update-error', msg);
      }
    });
    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 5000);
  } catch (e) { console.warn('[AutoUpdater]', e.message); }
}

// ══════════════════════════════════════════════
// IPC: WINDOW
// ══════════════════════════════════════════════
ipcMain.on('window-minimize',   () => mainWindow?.minimize());
ipcMain.on('window-maximize',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',      () => mainWindow?.close());
ipcMain.on('window-fullscreen', (_, f) => mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen() ?? false);
ipcMain.on('install-update', () => { try { require('electron-updater').autoUpdater.quitAndInstall(); } catch {} });
ipcMain.handle('check-for-updates', async () => { try { await require('electron-updater').autoUpdater.checkForUpdates(); } catch {} });

// ══════════════════════════════════════════════
// IPC: SETTINGS / PROFILES
// ══════════════════════════════════════════════
const DEFAULT_SETTINGS = {
  appBgImage: '', accentColor: '#30c5bb', cardImages: {}, cardImageOffsets: {},
  cardBgColors: {}, cardBgOpacity: {}, cardCustomNames: {}, cardCustomTags: {}, cardLogos: {},
  favorites: [], fontSize: 14, cardLayout: 'normal', sortAlpha: false,
  customCSS: '', language: 'de', particlesEnabled: false,
  particlesConfig: { count: 80, size: 1.5, speed: 1, color: '#30c5bb', shapes: ['circle'] },
  clock: { enabled: false, position: { x: 16, y: 52 }, color: '#ff3b30', opacity: 0.5, size: 22, type: 'digital', showSeconds: false },
  hiddenItems: { news: {}, upcoming: {} },
  watchlist: [], searchHistory: [], viewHistory: [], providerOrder: [],
  newsLastTab: 'movies', upcomingLastTab: 'movies',
  designOptions: { cardRadius: 14, sidebarWidth: 200, cardShadow: true, glass: false },
  customProviders: {}, deletedProviders: [],
};

ipcMain.handle('get-theme',    () => store.get('theme', 'dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme', v));
ipcMain.handle('get-settings', () => { const s = store.get('settings', DEFAULT_SETTINGS); return { ...DEFAULT_SETTINGS, ...s }; });
ipcMain.on('set-settings',     (_, v) => store.set('settings', v));
ipcMain.handle('get-profiles',       () => store.get('profiles', [{ id: 'default', name: 'Standardkonto', favorites: [], watchlist: [], searchHistory: [], viewHistory: [] }]));
ipcMain.on('set-profiles',           (_, v) => store.set('profiles', v));
ipcMain.handle('get-active-profile', () => store.get('activeProfile', 'default'));
ipcMain.on('set-active-profile',     (_, id) => store.set('activeProfile', id));

// ══════════════════════════════════════════════
// IPC: NOTIFICATIONS
// ══════════════════════════════════════════════
ipcMain.on('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body, icon: path.join(__dirname, 'assets', 'icon.png') }).show();
});

// ══════════════════════════════════════════════
// IPC: IMAGE PICKER
// ══════════════════════════════════════════════
ipcMain.handle('pick-image', async (_, dest) => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: 'Bild auswählen',
    filters: [{ name: 'Bilder', extensions: ['jpg','jpeg','png','gif','webp'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths.length) return null;
  const src = r.filePaths[0];
  const dir = path.join(app.getPath('userData'), 'userImages');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fn = `${dest}_${Date.now()}${path.extname(src)}`;
  const dp = path.join(dir, fn);
  fs.copyFileSync(src, dp);
  return `file://${dp.replace(/\\/g, '/')}`;
});

// ══════════════════════════════════════════════
// IPC: SESSIONS (pro Profil)
// ══════════════════════════════════════════════
const LOGIN_CHECKS = {
  netflix:      { url: 'https://www.netflix.com',           names: ['NetflixId'] },
  prime:        { url: 'https://www.amazon.de',             names: ['session-id'] },
  disney:       { url: 'https://www.disneyplus.com',        names: ['BAMAccountToken','DisneyId','access_token','BAMSDK'] },
  crunchyroll:  { url: 'https://www.crunchyroll.com',       names: ['etp_rt'] },
  burning:      { url: 'https://bs.to',                     names: ['_token'] },
  cineto:       { url: 'https://cine.to',                   names: ['PHPSESSID'] },
  youtube:      { url: 'https://www.youtube.com',           names: ['LOGIN_INFO'] },
  twitch:       { url: 'https://www.twitch.tv',             names: ['auth-token'] },
  dazn:         { url: 'https://www.dazn.com',              names: ['usr'] },
  hbomax:       { url: 'https://www.max.com',               names: ['hbo_session'] },
  joyn:         { url: 'https://www.joyn.de',               names: ['joyn_session'] },
  ard:          { url: 'https://www.ardmediathek.de',       names: ['ard_sso_session'] },
  zdf:          { url: 'https://www.zdf.de',                names: ['sso'] },
  paramountplus:{ url: 'https://www.paramountplus.com',     names: ['PVFW'] },
  skygo:        { url: 'https://www.sky.de',                names: ['skySession'] },
  mubi:         { url: 'https://mubi.com',                  names: ['_session'] },
  apple:        { url: 'https://tv.apple.com',              names: ['myacinfo'] },
  rtl:          { url: 'https://plus.rtl.de',               names: ['rtl_token'] },
  spotify:      { url: 'https://open.spotify.com',          names: ['sp_dc'] },
  waipu:        { url: 'https://www.waipu.tv',              names: ['waipu_auth'] },
  wow:          { url: 'https://www.wowtv.de',              names: ['wow_session'] },
  magenta:      { url: 'https://www.magentatv.de',          names: ['TelekomAccount'] },
};

async function checkAllSessions(profileId = 'default') {
  const result = {};
  for (const [id, check] of Object.entries(LOGIN_CHECKS)) {
    try {
      const partition = `persist:${profileId}_${id}`;
      const ses = session.fromPartition(partition);
      let found = false;
      for (const name of check.names) {
        const cookies = await ses.cookies.get({ url: check.url, name });
        if (cookies.length > 0) { found = true; break; }
      }
      result[id] = found;
    } catch { result[id] = false; }
  }
  return result;
}

ipcMain.handle('get-all-sessions', async (_, profileId) => checkAllSessions(profileId));
ipcMain.on('refresh-sessions-now', async (_, profileId) => {
  const result = await checkAllSessions(profileId);
  mainWindow?.webContents.send('sessions-updated', result);
});
ipcMain.on('clear-all-sessions', async (_, profileId) => {
  for (const id of Object.keys(LOGIN_CHECKS)) {
    try { await session.fromPartition(`persist:${profileId}_${id}`).clearStorageData(); } catch {}
  }
  mainWindow?.webContents.send('sessions-cleared');
});
ipcMain.on('clear-provider-session', async (_, profileId, id) => {
  try { await session.fromPartition(`persist:${profileId}_${id}`).clearStorageData(); } catch {}
});
ipcMain.on('setup-webview-session', (_, partition) => setupSession(session.fromPartition(partition)));

// ══════════════════════════════════════════════
// IPC: GOOGLE AUTH (YouTube)
// ══════════════════════════════════════════════
ipcMain.on('open-google-auth-browser', (_, profileId) => {
  const partition = `persist:${profileId}_youtube`;
  const authWin = new BrowserWindow({
    width: 500, height: 700, title: 'Bei Google anmelden',
    webPreferences: { session: session.fromPartition(partition), contextIsolation: true, webSecurity: false },
  });
  session.fromPartition(partition).setUserAgent(CHROME_UA);
  authWin.loadURL('https://accounts.google.com/signin/v2/identifier?service=youtube&hl=de&continue=https%3A%2F%2Fwww.youtube.com');
  authWin.webContents.on('did-navigate', async (_, url) => {
    if (url.includes('youtube.com') && !url.includes('accounts.google')) {
      authWin.close();
      mainWindow?.webContents.send('google-auth-done');
      const result = await checkAllSessions(profileId);
      mainWindow?.webContents.send('sessions-updated', result);
    }
  });
});

// ══════════════════════════════════════════════
// IPC: VPN
// ══════════════════════════════════════════════
ipcMain.handle('check-vpn', async () => {
  try {
    const r = await session.defaultSession.fetch('https://ipapi.co/json/', { headers: { 'User-Agent': CHROME_UA } });
    const d = await r.json();
    return { ip: d.ip, country: d.country_name, city: d.city, org: d.org,
      isVpn: !!(d.org?.toLowerCase().includes('vpn') || d.org?.toLowerCase().includes('proxy') || d.org?.toLowerCase().includes('hosting')) };
  } catch (e) { return { error: e.message }; }
});

// ══════════════════════════════════════════════
// IPC: STREAM STATS (pro Profil)
// ══════════════════════════════════════════════
ipcMain.on('record-watch-time', (_, { providerId, seconds, profileId = 'default' }) => {
  const key = `streamStats_${profileId}`;
  const stats = store.get(key, {});
  if (!stats[providerId]) stats[providerId] = { total: 0, byDay: [0,0,0,0,0,0,0] };
  stats[providerId].total += seconds;
  const dayIdx = new Date().getDay();
  stats[providerId].byDay[dayIdx] = (stats[providerId].byDay[dayIdx] || 0) + seconds;
  store.set(key, stats);
});
ipcMain.handle('get-stream-stats', (_, profileId = 'default') => store.get(`streamStats_${profileId}`, {}));

// ══════════════════════════════════════════════
// IPC: MULTI-WINDOW
// ══════════════════════════════════════════════
let secondWindow = null;
ipcMain.handle('open-second-window', async (_, { url, partition, title }) => {
  if (secondWindow && !secondWindow.isDestroyed()) { secondWindow.focus(); return 'focused'; }
  secondWindow = new BrowserWindow({
    width: 800, height: 600, title: title || 'OmniSight – Stream',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: { webviewTag: true, webSecurity: false, allowRunningInsecureContent: true },
  });
  const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{background:#000;height:100vh;display:flex;flex-direction:column}webview{flex:1;display:flex}</style></head><body><webview src="${url}" partition="${partition}" useragent="${CHROME_UA}" allowpopups style="width:100%;flex:1"></webview></body></html>`;
  const tmp = path.join(app.getPath('temp'), 'omnisight_second.html');
  fs.writeFileSync(tmp, html);
  secondWindow.loadFile(tmp);
  setupSession(session.fromPartition(partition));
  secondWindow.on('closed', () => { secondWindow = null; });
  return 'opened';
});

// ══════════════════════════════════════════════
// IPC: ADBLOCK
// ══════════════════════════════════════════════
ipcMain.handle('fetch-adblock-list', async (_, url) => {
  try {
    const r = await session.defaultSession.fetch(url, { headers: { 'User-Agent': CHROME_UA } });
    const text = await r.text();
    const domains = [];
    text.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('!') || line.startsWith('#')) return;
      const m1 = line.match(/^\|\|([a-z0-9._-]+)\^/);
      if (m1) { domains.push(m1[1]); return; }
      const m2 = line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9._-]+)$/);
      if (m2 && m2[1] !== 'localhost') domains.push(m2[1]);
    });
    return { ok: true, count: domains.length, domains: domains.slice(0, 15000) };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.on('apply-extra-ad-domains', (_, d) => store.set('extraAdDomains', d));
ipcMain.handle('get-extra-ad-domains', () => store.get('extraAdDomains', []));

// ══════════════════════════════════════════════
// IPC: WIDEVINE STATUS
// ══════════════════════════════════════════════
ipcMain.handle('get-widevine-status', () => {
  const cdmDir = path.join(app.getPath('userData'), 'WidevineCdm');
  const paths = [
    path.join(cdmDir, 'widevinecdm.dll'),
    path.join(cdmDir, '_platform_specific', 'win_x64', 'widevinecdm.dll'),
    path.join(cdmDir, 'libwidevinecdm.dylib'),
    path.join(cdmDir, 'libwidevinecdm.so'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return { installed: true, path: p, cdmDir };
  }
  return { installed: false, cdmDir };
});

// ══════════════════════════════════════════════
// IPC: TMDB
// ══════════════════════════════════════════════
const TMDB_KEY  = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const DE_ANIME  = '16'; // Genre-ID für Animation

async function tmdb(p, extra = '') {
  const r = await session.defaultSession.fetch(
    `${TMDB_BASE}${p}?api_key=${TMDB_KEY}&language=de-DE${extra}`,
    { headers: { 'User-Agent': CHROME_UA } }
  );
  return r.json();
}

ipcMain.handle('get-trending', async () => {
  try {
    const [m, s, a] = await Promise.all([
      tmdb('/trending/movie/week', '&region=DE'),
      tmdb('/trending/tv/week', '&without_genres=16'),
      tmdb('/discover/tv', '&with_genres=16&sort_by=popularity.desc&watch_region=DE'),
    ]);
    return {
      movies: (m.results || []).filter(i => i.poster_path).slice(0, 25),
      shows:  (s.results || []).filter(i => i.poster_path).slice(0, 25),
      anime:  (a.results || []).filter(i => i.poster_path).slice(0, 25),
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-new-releases', async () => {
  try {
    const [m, s, a] = await Promise.all([
      tmdb('/movie/now_playing', '&region=DE'),
      tmdb('/tv/on_the_air', '&watch_region=DE&without_genres=16'),
      tmdb('/discover/tv', '&with_genres=16&sort_by=first_air_date.desc&watch_region=DE'),
    ]);
    return {
      movies: (m.results || []).filter(i => i.poster_path).slice(0, 25),
      shows:  (s.results || []).filter(i => i.poster_path).slice(0, 25),
      anime:  (a.results || []).filter(i => i.poster_path).slice(0, 25),
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-upcoming', async (_, months = 1) => {
  try {
    const today  = new Date();
    const future = new Date(today); future.setMonth(today.getMonth() + months);
    const fmt = d => d.toISOString().split('T')[0];
    const gte = fmt(today), lte = fmt(future);
    const [m, s, a1, a2] = await Promise.all([
      tmdb('/discover/movie', `&region=DE&with_release_type=3|2&release_date.gte=${gte}&release_date.lte=${lte}&sort_by=release_date.asc`),
      tmdb('/discover/tv',    `&watch_region=DE&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc&without_genres=16`),
      tmdb('/discover/tv',    `&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc`),
      tmdb('/discover/tv',    `&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=popularity.desc&page=2`),
    ]);
    const animeAll = [...(a1.results||[]), ...(a2.results||[])].filter((v,i,a) => a.findIndex(x=>x.id===v.id)===i);
    return {
      movies: (m.results || []).filter(i => i.poster_path).slice(0, 30),
      shows:  (s.results || []).filter(i => i.poster_path).slice(0, 30),
      anime:  animeAll.filter(i => i.poster_path).slice(0, 30),
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-tmdb-detail', async (_, { id, type }) => {
  try {
    const [detail, videos, providers] = await Promise.all([
      tmdb(`/${type}/${id}`, '&append_to_response=credits'),
      tmdb(`/${type}/${id}/videos`),
      tmdb(`/${type}/${id}/watch/providers`),
    ]);
    return { detail, videos: videos.results || [], providers: providers.results?.DE || null };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('search-tmdb', async (_, { query, page = 1 }) => {
  try {
    const r = await tmdb('/search/multi', `&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`);
    return r;
  } catch (e) { return { results: [], total_results: 0 }; }
});

ipcMain.handle('get-streaming-providers', async (_, { tmdbId, type }) => {
  try {
    const r = await tmdb(`/${type}/${tmdbId}/watch/providers`);
    return r.results?.DE || null;
  } catch { return null; }
});

// URL / Online check
ipcMain.handle('check-url',    async (_, url) => { try { const r = await session.defaultSession.fetch(url, { method: 'HEAD', headers: { 'User-Agent': CHROME_UA } }); return { ok: true, status: r.status }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('check-online', async ()        => { try { await session.defaultSession.fetch('https://www.google.com', { method: 'HEAD', headers: { 'User-Agent': CHROME_UA } }); return true; } catch { return false; } });
ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ══════════════════════════════════════════════
// START
// ══════════════════════════════════════════════
app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
