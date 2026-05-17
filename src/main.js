const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Ad-block domains ──────────────────────────────────────────────
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
  'ad.doubleclick.net','ads.youtube.com','static.ads-twitter.com',
  'amazon-adsystem.com','media.net','adsymptotic.com',
  'revcontent.com','mgid.com','bidswitch.net','rlcdn.com',
  'blismedia.com','lijit.com','onetag-sys.com','sovrn.com',
  '33across.com','sharethrough.com','indexww.com','yldbt.com',
  'apnxs.com','appnexus.com','contextweb.com','emxdgt.com',
];

function getAdDomains() {
  const extra = store.get('extraAdDomains', []);
  return [...new Set([...DEFAULT_AD_DOMAINS, ...extra])];
}

function isAd(url) {
  try {
    const h = new URL(url).hostname;
    return getAdDomains().some(d => h === d || h.endsWith('.' + d));
  } catch { return false; }
}

// ── Session setup ─────────────────────────────────────────────────
function setupSession(ses) {
  ses.setCertificateVerifyProc((_, cb) => cb(0));
  ses.setUserAgent(CHROME_UA);

  try {
    ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (d, cb) => {
      cb({ cancel: isAd(d.url) });
    });
  } catch {}

  try {
    ses.webRequest.onBeforeSendHeaders({ urls: ['<all_urls>'] }, (d, cb) => {
      const h = d.requestHeaders;
      h['User-Agent']         = CHROME_UA;
      h['Accept-Language']    = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
      h['Accept']             = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
      h['Sec-Ch-Ua']          = '"Chromium";v="124","Google Chrome";v="124","Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']   = '?0';
      h['Sec-Ch-Ua-Platform'] = '"Windows"';
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

// ── Window ────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1360, height: 860, minWidth: 820, minHeight: 520,
    frame: false, backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, webSecurity: false, allowRunningInsecureContent: true,
    },
  });
  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; app.quit(); });
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('fullscreen-change', true));
  mainWindow.on('leave-full-screen',  () => mainWindow.webContents.send('fullscreen-change', false));
}

// ── IPC: Window controls ──────────────────────────────────────────
ipcMain.on('window-minimize',   () => mainWindow?.minimize());
ipcMain.on('window-maximize',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',      () => mainWindow?.close());
ipcMain.on('window-fullscreen', (_, f) => mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen() ?? false);

// ── IPC: Theme & Settings ─────────────────────────────────────────
ipcMain.handle('get-theme',    () => store.get('theme', 'dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme', v));
ipcMain.handle('get-settings', () => store.get('settings', {
  appBgImage: '', accentColor: '#30c5bb',
  cardImages: {}, cardImageOffsets: {}, logoImage: '',
  favorites: [], fontSize: 14,
  clock: { enabled: false, position: { x: 16, y: 52 }, color: '#bfbfbf', opacity: 0.85, size: 22 },
  plugins: [],
}));
ipcMain.on('set-settings', (_, v) => store.set('settings', v));

// ── IPC: Pick image ───────────────────────────────────────────────
ipcMain.handle('pick-image', async (_, dest) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Bild auswählen',
    filters: [{ name: 'Bilder', extensions: ['jpg','jpeg','png','gif','webp','svg'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const src = result.filePaths[0];
  const dir = path.join(app.getPath('userData'), 'userImages');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fn  = `${dest}_${Date.now()}${path.extname(src)}`;
  const dp  = path.join(dir, fn);
  fs.copyFileSync(src, dp);
  return `file://${dp.replace(/\\/g, '/')}`;
});

// ── IPC: Plugin install (CRX via file picker) ─────────────────────
ipcMain.handle('install-plugin', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Plugin / Erweiterung installieren (.crx oder .zip)',
    filters: [{ name: 'Plugin', extensions: ['crx','zip','xpi'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const src  = result.filePaths[0];
  const dir  = path.join(app.getPath('userData'), 'plugins');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fn   = path.basename(src);
  const dest = path.join(dir, fn);
  fs.copyFileSync(src, dest);

  // Electron kann .crx nicht direkt laden – wir merken uns den Pfad und zeigen einen Hinweis
  const plugins = store.get('plugins', []);
  const entry   = { name: fn, path: dest, installed: new Date().toISOString() };
  plugins.push(entry);
  store.set('plugins', plugins);
  return entry;
});

ipcMain.handle('get-plugins',    () => store.get('plugins', []));
ipcMain.on('remove-plugin', (_, name) => {
  const plugins = store.get('plugins', []).filter(p => p.name !== name);
  store.set('plugins', plugins);
});

// Empfohlene Adblocker-Quellen (als Domain-Listen)
ipcMain.handle('fetch-adblock-list', async (_, url) => {
  try {
    const r = await session.defaultSession.fetch(url, { headers: { 'User-Agent': CHROME_UA } });
    const text = await r.text();
    // Einfaches Parsen von hosts-/Adblock-Format
    const domains = [];
    text.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('!') || line.startsWith('#')) return;
      // Adblock-Format: ||example.com^
      const m1 = line.match(/^\|\|([a-z0-9._-]+)\^/);
      if (m1) { domains.push(m1[1]); return; }
      // hosts-Format: 0.0.0.0 example.com
      const m2 = line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9._-]+)$/);
      if (m2 && m2[1] !== 'localhost') domains.push(m2[1]);
    });
    return { ok: true, count: domains.length, domains: domains.slice(0, 5000) };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.on('apply-extra-ad-domains', (_, domains) => {
  store.set('extraAdDomains', domains);
});

ipcMain.handle('get-extra-ad-domains', () => store.get('extraAdDomains', []));

// ── IPC: Sessions ─────────────────────────────────────────────────
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

ipcMain.handle('get-all-sessions', async () => {
  const result = {};
  for (const [id, check] of Object.entries(LOGIN_CHECKS)) {
    try {
      const ses     = session.fromPartition(`persist:${id}`);
      const cookies = await ses.cookies.get({ url: check.url, name: check.name });
      result[id] = cookies.length > 0;
    } catch { result[id] = false; }
  }
  return result;
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

ipcMain.on('setup-webview-session', (_, partition) => {
  setupSession(session.fromPartition(partition));
});

// ── IPC: OMDB Search ──────────────────────────────────────────────
const OMDB_KEY = 'trilogy';
ipcMain.handle('search-title', async (_, query) => {
  try {
    const r = await session.defaultSession.fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_KEY}`,
      { headers: { 'User-Agent': CHROME_UA } }
    );
    return await r.json();
  } catch (e) { return { Error: e.message }; }
});

ipcMain.handle('search-title-detail', async (_, imdbId) => {
  try {
    const r = await session.defaultSession.fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}&plot=short`,
      { headers: { 'User-Agent': CHROME_UA } }
    );
    return await r.json();
  } catch (e) { return { Error: e.message }; }
});

// ── IPC: TMDB ─────────────────────────────────────────────────────
const TMDB_KEY = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = `https://api.themoviedb.org/3`;

async function tmdb(path, extra = '') {
  const r = await session.defaultSession.fetch(
    `${TMDB_BASE}${path}?api_key=${TMDB_KEY}&language=de-DE${extra}`,
    { headers: { 'User-Agent': CHROME_UA } }
  );
  return r.json();
}

ipcMain.handle('get-trending', async () => {
  try {
    const [movies, shows] = await Promise.all([
      tmdb('/trending/movie/week', '&region=DE'),
      tmdb('/trending/tv/week'),
    ]);
    return { movies: movies.results?.slice(0, 20) || [], shows: shows.results?.slice(0, 20) || [] };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-new-releases', async () => {
  try {
    const [movies, shows] = await Promise.all([
      tmdb('/movie/now_playing', '&region=DE'),
      tmdb('/tv/on_the_air', '&watch_region=DE'),
    ]);
    return { movies: movies.results?.slice(0, 20) || [], shows: shows.results?.slice(0, 20) || [] };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-upcoming', async () => {
  try {
    // Datumsbereich: heute bis +30 Tage
    const today    = new Date();
    const future   = new Date(today); future.setDate(today.getDate() + 30);
    const fmt = d  => d.toISOString().split('T')[0];

    const [movies, shows] = await Promise.all([
      tmdb('/movie/upcoming', `&region=DE&primary_release_date.gte=${fmt(today)}&primary_release_date.lte=${fmt(future)}`),
      tmdb('/tv/on_the_air', `&watch_region=DE`),
    ]);
    // Filter TV auf Serien, die in den nächsten 30 Tagen eine neue Episode haben
    const filteredShows = (shows.results || []).filter(s => {
      if (!s.first_air_date) return false;
      const d = new Date(s.first_air_date);
      return d >= today;
    });
    return {
      movies: movies.results?.slice(0, 20) || [],
      shows:  filteredShows.slice(0, 20),
    };
  } catch (e) { return { error: e.message }; }
});

// ── IPC: URL check ────────────────────────────────────────────────
ipcMain.handle('check-url', async (_, url) => {
  try {
    const r = await session.defaultSession.fetch(url, { method: 'HEAD', headers: { 'User-Agent': CHROME_UA } });
    return { ok: true, status: r.status };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ── Start ─────────────────────────────────────────────────────────
app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
