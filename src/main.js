const { app, BrowserWindow, ipcMain, session, shell, dialog, Notification, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// ══════════════════════════════════════════════
// WIDEVINE / DRM HINWEIS:
// Electron enthält standardmäßig KEIN Widevine CDM.
// Für Netflix, Disney+, Amazon Prime etc. wird es benötigt.
// Lösung: electron-widevinecdm oder castLabs electron-releases verwenden.
// Diese Builds enthalten Widevine lizenziert.
// Info: https://github.com/nicehash/electron-widevinecdm
// Für dieses Projekt: --enable-widevine Flag + CDM-Pfad setzen.
// ══════════════════════════════════════════════

// Widevine CDM automatisch registrieren (falls vorhanden)
function setupWidevine() {
  const cdmPath = path.join(app.getPath('userData'), 'WidevineCdm');
  if (fs.existsSync(cdmPath)) {
    try {
      app.commandLine.appendSwitch('widevine-cdm-path', cdmPath);
      app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2662.0');
    } catch {}
  }
  // Flags für bessere Kompatibilität mit DRM
  app.commandLine.appendSwitch('enable-features', 'PlatformEncryptedDolbyVision');
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
}

setupWidevine();

// ══════════════════════════════════════════════
// CHROME UA (täuschend echter Browser)
// ══════════════════════════════════════════════
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
// Spezieller UA für Google-Login (YouTube)
const GOOGLE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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
      // Google-Dienste brauchen spezielle Header damit Login funktioniert
      const isGoogle = d.url.includes('google.com') || d.url.includes('youtube.com') || d.url.includes('accounts.google');
      h['User-Agent']         = isGoogle ? GOOGLE_UA : CHROME_UA;
      h['Accept-Language']    = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
      h['Accept']             = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
      h['Sec-Ch-Ua']          = '"Chromium";v="124","Google Chrome";v="124","Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']   = '?0';
      h['Sec-Ch-Ua-Platform'] = '"Windows"';
      // Für Crunchyroll: spezielle Header
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
        const l = k.toLowerCase();
        if (['x-frame-options','content-security-policy','x-content-type-options',
             'strict-transport-security','x-xss-protection'].includes(l)) delete h[k];
      }
      cb({ responseHeaders: h });
    });
  } catch {}
}

// ══════════════════════════════════════════════
// MAIN WINDOW
// ══════════════════════════════════════════════
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 820, minHeight: 520,
    frame: false, backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; app.quit(); });
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('fullscreen-change', true));
  mainWindow.on('leave-full-screen',  () => mainWindow.webContents.send('fullscreen-change', false));

  // Auto-Updater
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = false;
    autoUpdater.on('update-available', info => mainWindow?.webContents.send('update-available', info));
    autoUpdater.on('update-downloaded', () => mainWindow?.webContents.send('update-downloaded'));
    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 3000);
  } catch {}
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

// ══════════════════════════════════════════════
// IPC: SETTINGS / PROFILES
// ══════════════════════════════════════════════
const DEFAULT_SETTINGS = {
  appBgImage: '', accentColor: '#30c5bb', cardImages: {}, cardImageOffsets: {},
  favorites: [], fontSize: 14, cardLayout: 'normal',
  customCSS: '', language: 'de', particlesEnabled: false,
  clock: { enabled: false, position: { x: 16, y: 52 }, color: '#cfcfcf', opacity: 0.85, size: 22 },
  plugins: [], hiddenItems: { news: {}, upcoming: {} },
  watchlist: [], searchHistory: [], viewHistory: [],
  streamStats: {}, providerOrder: [],
  newsLastTab: 'movies', upcomingLastTab: 'movies',
  traktToken: null,
};

ipcMain.handle('get-theme',    () => store.get('theme', 'dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme', v));
ipcMain.handle('get-settings', () => { const s = store.get('settings', DEFAULT_SETTINGS); return { ...DEFAULT_SETTINGS, ...s }; });
ipcMain.on('set-settings',     (_, v) => store.set('settings', v));

ipcMain.handle('get-profiles',       () => store.get('profiles', [{ id: 'default', name: 'Standardkonto', favorites: [], watchlist: [], searchHistory: [], viewHistory: [], streamStats: {}, settings: {} }]));
ipcMain.on('set-profiles',           (_, v) => store.set('profiles', v));
ipcMain.handle('get-active-profile', () => store.get('activeProfile', 'default'));
ipcMain.on('set-active-profile',     (_, id) => store.set('activeProfile', id));

// ══════════════════════════════════════════════
// IPC: NOTIFICATIONS
// ══════════════════════════════════════════════
ipcMain.on('show-notification', (_, { title, body, icon: iconPath }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, icon: iconPath || path.join(__dirname, 'assets', 'icon.png') }).show();
  }
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
// IPC: SESSIONS – mit 1-Minuten-Auto-Refresh
// ══════════════════════════════════════════════
const LOGIN_CHECKS = {
  netflix:      { url: 'https://www.netflix.com',           name: 'NetflixId' },
  prime:        { url: 'https://www.amazon.de',             name: 'session-id' },
  disney:       { url: 'https://www.disneyplus.com',        name: 'BAMAccountToken' },
  crunchyroll:  { url: 'https://www.crunchyroll.com',       name: 'etp_rt' },
  burning:      { url: 'https://bs.to',                     name: '_token' },
  cineto:       { url: 'https://cine.to',                   name: 'PHPSESSID' },
  youtube:      { url: 'https://www.youtube.com',           name: 'LOGIN_INFO' },
  twitch:       { url: 'https://www.twitch.tv',             name: 'auth-token' },
  dazn:         { url: 'https://www.dazn.com',              name: 'usr' },
  hbomax:       { url: 'https://www.max.com',               name: 'hbo_session' },
  joyn:         { url: 'https://www.joyn.de',               name: 'joyn_session' },
  ard:          { url: 'https://www.ardmediathek.de',       name: 'ard_sso_session' },
  zdf:          { url: 'https://www.zdf.de',                name: 'sso' },
  paramountplus:{ url: 'https://www.paramountplus.com',     name: 'PVFW' },
  skygo:        { url: 'https://www.sky.de',                name: 'skySession' },
  mubi:         { url: 'https://mubi.com',                  name: '_session' },
  apple:        { url: 'https://tv.apple.com',              name: 'myacinfo' },
  rtl:          { url: 'https://plus.rtl.de',               name: 'rtl_token' },
};

async function checkAllSessions() {
  const result = {};
  for (const [id, check] of Object.entries(LOGIN_CHECKS)) {
    try {
      const ses = session.fromPartition(`persist:${id}`);
      // Disney+ spezielle Cookie-Namen
      let cookieNames = [check.name];
      if (id === 'disney') cookieNames = ['BAMAccountToken', 'DisneyId', 'access_token', 'id_token', 'BAMSDK'];
      let found = false;
      for (const name of cookieNames) {
        const cookies = await ses.cookies.get({ url: check.url, name });
        if (cookies.length > 0) { found = true; break; }
      }
      result[id] = found;
    } catch { result[id] = false; }
  }
  return result;
}

ipcMain.handle('get-all-sessions', async () => checkAllSessions());

// Auto-Refresh alle 60s
let sessionRefreshInterval = null;
app.whenReady().then(() => {
  sessionRefreshInterval = setInterval(async () => {
    const result = await checkAllSessions();
    mainWindow?.webContents.send('sessions-updated', result);
  }, 60000);
});

ipcMain.on('refresh-sessions-now', async () => {
  const result = await checkAllSessions();
  mainWindow?.webContents.send('sessions-updated', result);
});

ipcMain.on('clear-all-sessions', async () => {
  for (const id of Object.keys(LOGIN_CHECKS)) {
    try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
  }
  mainWindow?.webContents.send('sessions-cleared');
});

ipcMain.on('clear-provider-session', async (_, id) => {
  try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
});

ipcMain.on('setup-webview-session', (_, partition) => setupSession(session.fromPartition(partition)));

// ══════════════════════════════════════════════
// IPC: GOOGLE LOGIN WORKAROUND (YouTube)
// ══════════════════════════════════════════════
ipcMain.handle('open-google-auth', async () => {
  // Öffnet Google Login in einem separaten Fenster mit echtem Chrome-UA
  const authWin = new BrowserWindow({
    width: 500, height: 700,
    title: 'Bei Google anmelden',
    webPreferences: {
      session: session.fromPartition('persist:youtube'),
      contextIsolation: true,
      webSecurity: false,
    },
  });
  const ses = session.fromPartition('persist:youtube');
  ses.setUserAgent(GOOGLE_UA);
  // Spezielles Flag: DisableWebRTC-basierte Fingerprinting-Erkennung
  authWin.loadURL('https://accounts.google.com/signin/v2/identifier?service=youtube&hl=de&continue=https%3A%2F%2Fwww.youtube.com');
  return new Promise(resolve => {
    authWin.webContents.on('did-navigate', async (_, url) => {
      if (url.includes('youtube.com') && !url.includes('accounts.google')) {
        // Login erfolgreich – Cookies prüfen
        const cookies = await ses.cookies.get({ url: 'https://www.youtube.com', name: 'LOGIN_INFO' });
        authWin.close();
        // Sofort Session-Refresh
        const result = await checkAllSessions();
        mainWindow?.webContents.send('sessions-updated', result);
        resolve(cookies.length > 0);
      }
    });
    authWin.on('closed', () => resolve(false));
  });
});

// ══════════════════════════════════════════════
// IPC: VPN CHECK
// ══════════════════════════════════════════════
ipcMain.handle('check-vpn', async () => {
  try {
    // IP-API prüft Standort und ob es ein VPN/Proxy ist
    const r = await session.defaultSession.fetch('https://ipapi.co/json/', { headers: { 'User-Agent': CHROME_UA } });
    const d = await r.json();
    return {
      ip:      d.ip,
      country: d.country_name,
      city:    d.city,
      org:     d.org,
      isVpn:   d.org?.toLowerCase().includes('vpn') || d.org?.toLowerCase().includes('proxy') || d.org?.toLowerCase().includes('hosting') || false,
    };
  } catch (e) { return { error: e.message }; }
});

// ══════════════════════════════════════════════
// IPC: STREAM STATS
// ══════════════════════════════════════════════
ipcMain.on('record-watch-time', (_, { providerId, seconds }) => {
  const stats = store.get('streamStats', {});
  stats[providerId] = (stats[providerId] || 0) + seconds;
  store.set('streamStats', stats);
});
ipcMain.handle('get-stream-stats', () => store.get('streamStats', {}));

// ══════════════════════════════════════════════
// IPC: TRAKT.TV
// ══════════════════════════════════════════════
const TRAKT_CLIENT_ID = 'YOUR_TRAKT_CLIENT_ID'; // User muss eintragen
ipcMain.handle('trakt-auth', async () => {
  // Öffnet Trakt OAuth im Browser
  const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
  shell.openExternal(authUrl);
  return { url: authUrl, info: 'Trakt.tv im Browser öffnen, Code eingeben.' };
});
ipcMain.handle('trakt-scrobble', async (_, { title, year, type }) => {
  const token = store.get('traktToken');
  if (!token) return { error: 'Nicht authentifiziert' };
  try {
    const r = await session.defaultSession.fetch('https://api.trakt.tv/scrobble/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'trakt-api-version': '2', 'trakt-api-key': TRAKT_CLIENT_ID },
      body: JSON.stringify({ movie: type === 'movie' ? { title, year } : undefined, show: type === 'show' ? { title, year } : undefined, progress: 0 }),
    });
    return await r.json();
  } catch (e) { return { error: e.message }; }
});

// ══════════════════════════════════════════════
// IPC: MULTI-WINDOW (zwei Streams gleichzeitig)
// ══════════════════════════════════════════════
let secondWindow = null;
ipcMain.handle('open-second-window', async (_, { providerId, url, partition }) => {
  if (secondWindow && !secondWindow.isDestroyed()) {
    secondWindow.focus();
    return 'focused';
  }
  secondWindow = new BrowserWindow({
    width: 800, height: 600, minWidth: 400, minHeight: 300,
    title: 'OmniSight – Zweiter Stream',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      webviewTag: true, webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;display:flex;flex-direction:column;height:100vh;font-family:sans-serif}webview{flex:1;display:flex}</style></head><body><webview src="${url}" partition="${partition}" useragent="${CHROME_UA}" allowpopups style="width:100%;flex:1"></webview></body></html>`;
  const tmpPath = path.join(app.getPath('temp'), 'omnisight_second.html');
  fs.writeFileSync(tmpPath, html);
  secondWindow.loadFile(tmpPath);
  setupSession(session.fromPartition(partition));
  secondWindow.on('closed', () => { secondWindow = null; });
  return 'opened';
});

// ══════════════════════════════════════════════
// IPC: ADBLOCK LISTS
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
ipcMain.on('apply-extra-ad-domains',  (_, d) => store.set('extraAdDomains', d));
ipcMain.handle('get-extra-ad-domains', () => store.get('extraAdDomains', []));

// ══════════════════════════════════════════════
// IPC: TMDB
// ══════════════════════════════════════════════
const TMDB_KEY  = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdb(p, extra = '') {
  const r = await session.defaultSession.fetch(
    `${TMDB_BASE}${p}?api_key=${TMDB_KEY}&language=de-DE${extra}`,
    { headers: { 'User-Agent': CHROME_UA } }
  );
  return r.json();
}

ipcMain.handle('get-trending',    async () => {
  try {
    const [m, s] = await Promise.all([tmdb('/trending/movie/week', '&region=DE'), tmdb('/trending/tv/week')]);
    return { movies: (m.results || []).filter(i => i.poster_path).slice(0, 20), shows: (s.results || []).filter(i => i.poster_path).slice(0, 20) };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-new-releases', async () => {
  try {
    const [m, s] = await Promise.all([tmdb('/movie/now_playing', '&region=DE'), tmdb('/tv/on_the_air', '&watch_region=DE')]);
    return { movies: (m.results || []).filter(i => i.poster_path).slice(0, 20), shows: (s.results || []).filter(i => i.poster_path).slice(0, 20) };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-upcoming', async (_, months = 1) => {
  try {
    const today  = new Date();
    const future = new Date(today); future.setMonth(today.getMonth() + months);
    const fmt = d => d.toISOString().split('T')[0];
    const [m, s] = await Promise.all([
      tmdb('/discover/movie', `&region=DE&with_release_type=3|2&release_date.gte=${fmt(today)}&release_date.lte=${fmt(future)}&sort_by=release_date.asc`),
      tmdb('/discover/tv',   `&watch_region=DE&first_air_date.gte=${fmt(today)}&first_air_date.lte=${fmt(future)}&sort_by=first_air_date.asc`),
    ]);
    return {
      movies: (m.results || []).filter(i => i.poster_path && (i.release_date || '').substring(0, 4) > new Date().getFullYear() - 1).slice(0, 30),
      shows:  (s.results || []).filter(i => i.poster_path).slice(0, 30),
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-tmdb-detail', async (_, { id, type }) => {
  try {
    const [detail, videos, providers, similar] = await Promise.all([
      tmdb(`/${type}/${id}`, '&append_to_response=credits,similar'),
      tmdb(`/${type}/${id}/videos`),
      tmdb(`/${type}/${id}/watch/providers`),
      tmdb(`/${type}/${id}/similar`),
    ]);
    return { detail, videos: videos.results || [], providers: providers.results?.DE || null, similar: (similar.results || []).slice(0, 6) };
  } catch (e) { return { error: e.message }; }
});

// OMDB
const OMDB_KEY = 'trilogy';
ipcMain.handle('search-title',       async (_, q) => { try { const r = await session.defaultSession.fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB_KEY}`, { headers: { 'User-Agent': CHROME_UA } }); return await r.json(); } catch (e) { return { Error: e.message }; } });
ipcMain.handle('search-title-detail',async (_, id) => { try { const r = await session.defaultSession.fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB_KEY}&plot=full`,        { headers: { 'User-Agent': CHROME_UA } }); return await r.json(); } catch (e) { return { Error: e.message }; } });

// URL / Online check
ipcMain.handle('check-url',    async (_, url) => { try { const r = await session.defaultSession.fetch(url, { method: 'HEAD', headers: { 'User-Agent': CHROME_UA } }); return { ok: true, status: r.status }; } catch (e) { return { ok: false, error: e.message }; } });
ipcMain.handle('check-online', async ()        => { try { await session.defaultSession.fetch('https://www.google.com', { method: 'HEAD', headers: { 'User-Agent': CHROME_UA } }); return true; } catch { return false; } });

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ══════════════════════════════════════════════
// START
// ══════════════════════════════════════════════
app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
