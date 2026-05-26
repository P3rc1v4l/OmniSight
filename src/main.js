'use strict';

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Main Process
// Electron 34 | Node.js 20
// ═══════════════════════════════════════════════════════════════════

const { app, BrowserWindow, ipcMain, session, shell, dialog, Notification } =
  require('electron');
const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');
const Store  = require('electron-store');

const store = new Store();
let mainWindow = null;

// ── CONSTANTS ─────────────────────────────────────────────────────
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

const TMDB_KEY  = '2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const DEFAULT_AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','googletagmanager.com',
  'google-analytics.com','adnxs.com','adsrvr.org','advertising.com',
  'scorecardresearch.com','outbrain.com','taboola.com','pubmatic.com',
  'rubiconproject.com','openx.net','criteo.com','casalemedia.com',
  'imasdk.googleapis.com','pagead2.googlesyndication.com',
  'adservice.google.com','securepubads.g.doubleclick.net',
  'amazon-adsystem.com','media.net','bidswitch.net','appnexus.com',
  'sovrn.com','fundingchoicesmessages.google.com',
];

const SESSION_COOKIES = {
  netflix:       { url: 'https://www.netflix.com',        names: ['NetflixId','nfvdid'] },
  prime:         { url: 'https://www.amazon.de',          names: ['session-id','ubid-acbde'] },
  disney:        { url: 'https://www.disneyplus.com',     names: ['BAMAccountToken','BAMSDK','access_token'] },
  crunchyroll:   { url: 'https://www.crunchyroll.com',    names: ['etp_rt','akamai_a2_res'] },
  burning:       { url: 'https://bs.to',                  names: ['_token','laravel_session'] },
  cineto:        { url: 'https://cine.to',                names: ['PHPSESSID'] },
  youtube:       { url: 'https://www.youtube.com',        names: ['LOGIN_INFO','SAPISID'] },
  twitch:        { url: 'https://www.twitch.tv',          names: ['auth-token','persistent'] },
  dazn:          { url: 'https://www.dazn.com',           names: ['usr','__Secure-authToken'] },
  hbomax:        { url: 'https://www.max.com',            names: ['hbo_session','profile_type'] },
  joyn:          { url: 'https://www.joyn.de',            names: ['joyn_session','JSESSIONID'] },
  ard:           { url: 'https://www.ardmediathek.de',    names: ['ard_sso_session'] },
  zdf:           { url: 'https://www.zdf.de',             names: ['sso','zdf_session'] },
  paramountplus: { url: 'https://www.paramountplus.com',  names: ['PVFW','PV_FW_SESSION'] },
  skygo:         { url: 'https://www.sky.de',             names: ['skySession'] },
  mubi:          { url: 'https://mubi.com',               names: ['_session'] },
  apple:         { url: 'https://tv.apple.com',           names: ['myacinfo'] },
  rtl:           { url: 'https://plus.rtl.de',            names: ['rtl_token'] },
  spotify:       { url: 'https://open.spotify.com',       names: ['sp_dc','sp_key'] },
  waipu:         { url: 'https://www.waipu.tv',           names: ['waipu_auth'] },
  wow:           { url: 'https://www.wowtv.de',           names: ['wow_session'] },
  magenta:       { url: 'https://www.magentatv.de',       names: ['TelekomAccount'] },
  movie2k:       { url: 'https://movie2k.ch',             names: ['PHPSESSID','cf_clearance'] },
  arte:          { url: 'https://www.arte.tv',            names: ['arte_profile_session'] },
  adn:           { url: 'https://www.animedigitalnetwork.de', names: ['access_token'] },
};

const SETTINGS_DEFAULTS = {
  appBgImage: '', accentColor: '#30c5bb',
  cardImages: {}, cardImageOffsets: {}, cardBgColors: {}, cardBgOpacity: {},
  cardCustomNames: {}, cardCustomTags: {}, cardLogos: {},
  favorites: [], fontSize: 14, cardLayout: 'normal',
  sortAlpha: false, sortDir: 'asc', language: 'de',
  particlesEnabled: false,
  particlesConfig: { count: 80, size: 1.5, speed: 1, color: '#30c5bb', shapes: ['circle'], opacity: 0.6 },
  clock: { enabled: false, position: { x: 16, y: 52 }, color: '#cfcfcf', opacity: 0.5, size: 36, type: 'digital', showSeconds: false },
  hiddenItems: { news: {}, upcoming: {} },
  watchedItems: { news: {}, upcoming: {} },
  watchlist: [], searchHistory: [], viewHistory: [], providerOrder: [],
  newsLastTab: 'movies', upcomingLastTab: 'movies',
  designOptions: { cardRadius: 14, sidebarWidth: 200, cardShadow: true, glass: false, fontFamily: 'DM Sans' },
  customProviders: {}, deletedProviders: [],
  notificationsConfig: { streamBreak: true },
  watchedContentList: [], onboardingDone: false,
  providerCategories: {}, providerGroups: {}, activeCategory: 'all',
};

// ── SECURITY HELPERS ──────────────────────────────────────────────
function validateStr(v, max = 256) {
  return typeof v === 'string' && v.length <= max;
}
function validateNum(v, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return typeof v === 'number' && isFinite(v) && v >= min && v <= max;
}

const _ipcCounts = {};
const _ipcLimits = {
  'set-settings':     { max: 30, window: 5000 },
  'set-profiles':     { max: 10, window: 5000 },
  'record-watch-time':{ max: 120, window: 60000 },
};
function rateOk(channel) {
  const limit = _ipcLimits[channel];
  if (!limit) return true;
  const now = Date.now();
  if (!_ipcCounts[channel] || now - _ipcCounts[channel].start > limit.window)
    _ipcCounts[channel] = { count: 1, start: now };
  else _ipcCounts[channel].count++;
  return _ipcCounts[channel].count <= limit.max;
}

function hashPin(pin) {
  if (!pin) return null;
  return crypto.createHash('sha256')
    .update('omnisight_pin_salt_2025_' + pin).digest('hex');
}

// ── WIDEVINE ──────────────────────────────────────────────────────
// MUSS vor app.ready() aufgerufen werden!
// Electron 34 nutzt --widevine-cdm-path (mit doppeltem Bindestrich)
function setupWidevine() {
  const userData = app.getPath('userData');
  const cdmDir   = path.join(userData, 'WidevineCdm', '_platform_specific', 'win_x64');
  const cdmBase  = path.join(userData, 'WidevineCdm'); // manifest.json liegt hier!

  // Ordner-Struktur anlegen (wird bei Updates NICHT gelöscht)
  for (const dir of [cdmBase, cdmDir]) {
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    }
  }

  const dllPath = path.join(cdmDir, 'widevinecdm.dll');

  if (!fs.existsSync(dllPath)) {
    console.log('[WideVine] DLL nicht gefunden:', dllPath);
    console.log('[WideVine] Bitte Dateien ablegen:');
    console.log('  DLL + .sig → ', cdmDir);
    console.log('  manifest.json →', cdmBase);
    return;
  }

  // manifest.json: Chrome legt sie im übergeordneten WidevineCdm-Ordner ab
  // Wir suchen in beiden Pfaden
  let version = null;
  const manifestPaths = [
    path.join(cdmBase, 'manifest.json'),  // Standard Chrome-Struktur
    path.join(cdmDir, 'manifest.json'),   // Falls User sie direkt reinkopiert hat
  ];
  for (const mp of manifestPaths) {
    if (fs.existsSync(mp)) {
      try {
        const m = JSON.parse(fs.readFileSync(mp, 'utf8'));
        // manifest.json hat verschiedene Versionsfelder je nach Chrome-Version
        version = m.version || m['x-cdm-module-versions'] ||
                  m['x-cdm-codecs'] && m.version || null;
        if (version) { console.log('[WideVine] Version aus', mp, ':', version); break; }
      } catch (e) {
        console.warn('[WideVine] manifest.json Lesefehler:', mp, e.message);
      }
    }
  }

  if (!version) {
    // Fallback: Version aus DLL-Dateiname oder bekannte Version
    console.warn('[WideVine] manifest.json nicht gefunden oder keine Version – nutze Fallback');
    // Versuche Version aus %AppData%\omnisight ermitteln
    version = '4.10.2662.3';
  }

  console.log('[WideVine] Lade CDM:', cdmDir, '| Version:', version);
  console.log('[WideVine] HINWEIS: Für DRM-Streaming (Netflix, Disney+, Crunchyroll)');
  console.log('[WideVine] wird ein castlabs-signiertes Electron-Binary benötigt.');
  console.log('[WideVine] Siehe: https://github.com/castlabs/electron-releases');

  // Chromium Command-Line Switches (MÜSSEN vor app.ready() gesetzt werden)
  app.commandLine.appendSwitch('widevine-cdm-path', cdmDir);
  app.commandLine.appendSwitch('widevine-cdm-version', version);

  // DRM-Features aktivieren – OHNE HardwareSecureDecryption
  // (HardwareSecureDecryption blockiert auf Systemen ohne TPM/SGX)
  app.commandLine.appendSwitch('enable-features',
    'WidevineCdm,EncryptedMediaExtensions,PlatformEncryptedDolbyVision');
  
  // OutOfBlinkCors und HardwareSecureDecryption deaktivieren
  // OutOfBlinkCors blockiert Cross-Origin Requests von Streaming-Sites
  // HardwareSecureDecryption blockiert SW-basiertes DRM (Standard auf normalen PCs)
  app.commandLine.appendSwitch('disable-features',
    'OutOfBlinkCors,HardwareSecureDecryption');

  // GPU und Media-Decoding
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  
  // DRM-Kompatibilität maximieren
  app.commandLine.appendSwitch('enable-features',
    'WidevineCdm,EncryptedMediaExtensions,PlatformEncryptedDolbyVision,' +
    'EnableDrm,MediaDrmPreprovisioning,MediaFoundationClearKeyDecryption');
  
  // Kein Software-Rendering-Fallback blockieren
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
  app.commandLine.appendSwitch('enable-zero-copy');
  
  // Pepper-Plugin-API (für CDM)
  app.commandLine.appendSwitch('enable-pepper-cdm-support');
  
  // Test-Flags für DRM-Kompatibilität
  app.commandLine.appendSwitch('allow-failed-policy-fetch-for-test');
  app.commandLine.appendSwitch('disable-background-media-suspend');
}

setupWidevine(); // VOR app.ready()

// ── CRASH REPORTER ─────────────────────────────────────────────────
function setupCrashReporter() {
  const logDir  = path.join(app.getPath('userData'), 'logs');
  const logFile = path.join(logDir, 'crash.log');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  process.on('uncaughtException', err => {
    const entry = `[${new Date().toISOString()}] CRASH: ${err.message}\n${err.stack}\n\n`;
    try { fs.appendFileSync(logFile, entry); } catch {}
    console.error('[CrashReporter]', err.message);
  });
  process.on('unhandledRejection', reason => {
    const entry = `[${new Date().toISOString()}] UNHANDLED: ${reason}\n\n`;
    try { fs.appendFileSync(logFile, entry); } catch {}
  });
}

// ── AD-BLOCKER ─────────────────────────────────────────────────────
function isAd(url) {
  try {
    const hostname = new URL(url).hostname;
    const extra = store.get('extraAdDomains', []);
    return [...DEFAULT_AD_DOMAINS, ...extra].some(d =>
      hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

// ── SESSION SETUP ──────────────────────────────────────────────────
function setupSession(ses) {
  if (!ses) return;

  // Chrome UA für alle Requests (verhindert "Browser nicht unterstützt")
  // Chrome 124 UA – OHNE 'Electron' String (blockiert DRM auf Streaming-Seiten)
  ses.setUserAgent(CHROME_UA, 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7');
  
  // DRM: WideVine für diese Session aktivieren
  const wvDll = path.join(app.getPath('userData'), 'WidevineCdm', '_platform_specific', 'win_x64', 'widevinecdm.dll');
  if (fs.existsSync(wvDll)) {
    try {
      const wvDir = path.dirname(wvDll);
      ses.loadExtension(wvDir, { allowFileAccess: true }).catch(() => {});
    } catch {}
  }

  // Ad-Blocker
  ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, ({ url }, cb) =>
    cb({ cancel: isAd(url) }));

  // Request Headers: UA setzen, X-Frame-Options entfernen
  ses.webRequest.onBeforeSendHeaders({ urls: ['<all_urls>'] }, (details, cb) => {
    const h = details.requestHeaders;
    h['User-Agent']      = CHROME_UA;
    h['Accept-Language'] = 'de-DE,de;q=0.9,en-US;q=0.8';
    delete h['X-Frame-Options'];
    cb({ requestHeaders: h });
  });

  // Response Headers: Frame-Blocking + CSP für Webviews entfernen
  ses.webRequest.onHeadersReceived({ urls: ['<all_urls>'] }, (details, cb) => {
    const h = details.responseHeaders || {};
    // Nur für Streaming-Seiten (nicht für eigene App-Seiten)
    if (!details.url.startsWith('file://')) {
      for (const k of Object.keys(h)) {
        if (['x-frame-options', 'content-security-policy',
             'x-content-type-options'].includes(k.toLowerCase())) {
          delete h[k];
        }
      }
    }
    cb({ responseHeaders: h });
  });

  // SSL-Zertifikat-Fehler ignorieren (für regionale Streaming-Seiten)
  ses.setCertificateVerifyProc((_, cb) => cb(0));

  // WideVine CDM für diese Session registrieren falls vorhanden
  const wvDir = path.join(app.getPath('userData'), 'WidevineCdm', '_platform_specific', 'win_x64');
  if (fs.existsSync(path.join(wvDir, 'widevinecdm.dll'))) {
    try {
      // Für jede neue Session CDM laden (wichtig für Webview-Partitions)
      ses.loadExtension(wvDir, { allowFileAccess: true })
        .catch(() => {}); // Fehler ignorieren - CDM evtl. schon geladen
    } catch {}
  }

  // Berechtigungen: Medien-DRM explizit erlauben
  // Berechtigungen: ALLE erlauben damit WideVine/EME funktioniert
  ses.setPermissionRequestHandler((webContents, permission, cb) => {
    // mediaKeySystem = WideVine/EME - MUSS erlaubt sein!
    console.log('[Permission]', permission, '→ erlaubt');
    cb(true); // Alle Berechtigungen für Streaming-Sessions erlauben
  });

  // setPermissionCheckHandler: auch Checks erlauben
  ses.setPermissionCheckHandler((webContents, permission) => {
    return true; // Alle Checks durchlassen
  });
}

// ── AUTO-UPDATER ──────────────────────────────────────────────────
function setupAutoUpdater() {
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.logger         = null;
    autoUpdater.autoDownload   = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Öffentliche Releases – kein Token nötig wenn Releases public sind
    autoUpdater.setFeedURL({
      provider: 'github',
      owner:    'P3rc1v4l',
      repo:     'OmniSight',
    });

    autoUpdater.on('update-available', info =>
      mainWindow?.webContents.send('update-available', info));
    autoUpdater.on('update-not-available', () =>
      mainWindow?.webContents.send('update-not-available'));
    autoUpdater.on('update-downloaded', info =>
      mainWindow?.webContents.send('update-downloaded', info));
    autoUpdater.on('download-progress', p =>
      mainWindow?.webContents.send('update-download-progress', Math.round(p.percent)));
    autoUpdater.on('error', err => {
      const msg = err.message || '';
      // 404 / ENOENT = kein neues Release vorhanden → kein Fehler
      if (!msg.includes('404') && !msg.includes('ENOENT') && !msg.includes('app-update'))
        mainWindow?.webContents.send('update-error', msg);
      else
        mainWindow?.webContents.send('update-not-available');
    });

    // Automatisch nach 8s beim Start prüfen
    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 8000);
  } catch (e) {
    console.warn('[AutoUpdater] Nicht verfügbar:', e.message);
  }
}

// ── MAIN WINDOW ───────────────────────────────────────────────────
function createMainWindow() {
  const saved = store.get('windowBounds', null);

  mainWindow = new BrowserWindow({
    width:      saved?.width  || 1400,
    height:     saved?.height || 900,
    minWidth:   820,
    minHeight:  520,
    frame:      false,
    show:       false,
    backgroundColor: '#0a0a0f',
    icon:       path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration:          false,
      contextIsolation:         true,
      preload:                  path.join(__dirname, 'preload.js'),
      webviewTag:               true,
      webSecurity:              false,
      allowRunningInsecureContent: true,
      sandbox:                  false,
      // DRM/WideVine
      allowpopups:              true,
      enableBlinkFeatures:      'EncryptedMedia,PictureInPicture',
    },
    ...(saved?.x != null ? { x: saved.x, y: saved.y } : {}),
  });

  // Fenstergröße speichern
  mainWindow.on('close', () => {
    const b = mainWindow.getBounds();
    store.set('windowBounds', {
      ...b,
      maximized: mainWindow.isMaximized(),
    });
  });

  // Session konfigurieren
  setupSession(session.defaultSession);

  // Webview-Partitions: Session konfigurieren wenn angefragt
  // (wird über IPC 'setup-webview-session' ausgelöst)

  // Splash-Screen
  const splash = new BrowserWindow({
    width: 420, height: 280,
    frame: false, alwaysOnTop: true,
    transparent: true, backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: false },
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));

  // Hauptfenster laden
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Crash-Log nach Start prüfen
  const crashLog = path.join(app.getPath('userData'), 'logs', 'crash.log');
  if (fs.existsSync(crashLog)) {
    const stat = fs.statSync(crashLog);
    if (Date.now() - stat.mtimeMs < 86400000 && stat.size > 10) {
      setTimeout(() => {
        mainWindow?.webContents.send('crash-log-found', {
          size:    stat.size,
          preview: fs.readFileSync(crashLog, 'utf8').slice(-400),
        });
      }, 3000);
    }
  }

  // Splash verstecken wenn Main-Fenster bereit
  let shown = false;
  function showMain() {
    if (shown) return;
    shown = true;
    try { splash.destroy(); } catch {}
    if (store.get('windowBounds')?.maximized) mainWindow.maximize();
    else mainWindow.show();
    mainWindow.focus();
  }
  mainWindow.once('ready-to-show', showMain);
  setTimeout(showMain, 3000); // Fallback

  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('enter-full-screen', () =>
    mainWindow?.webContents.send('fullscreen-change', true));
  mainWindow.on('leave-full-screen', () =>
    mainWindow?.webContents.send('fullscreen-change', false));

  setupAutoUpdater();
}

// ── SESSIONS ──────────────────────────────────────────────────────
async function checkAllSessions(profileId = 'default') {
  const result = {};
  await Promise.all(
    Object.entries(SESSION_COOKIES).map(async ([id, check]) => {
      try {
        const ses = session.fromPartition(`persist:${profileId}_${id}`);
        setupSession(ses); // Session konfigurieren falls noch nicht geschehen
        let found = false;
        for (const name of check.names) {
          const cookies = await ses.cookies.get({ url: check.url, name });
          if (cookies.length > 0 && cookies.some(c => c.value.length > 4)) {
            found = true;
            break;
          }
        }
        result[id] = found;
      } catch {
        result[id] = false;
      }
    })
  );
  return result;
}

// ── TMDB ──────────────────────────────────────────────────────────
async function tmdbFetch(endpoint, extra = '') {
  const url = `${TMDB_BASE}${endpoint}?api_key=${TMDB_KEY}&language=de-DE${extra}`;
  const r   = await session.defaultSession.fetch(url, {
    headers: { 'User-Agent': CHROME_UA },
  });
  return r.json();
}

// ═══════════════════════════════════════════════════════════════════
// IPC HANDLERS
// ═══════════════════════════════════════════════════════════════════

// ── Fenster ─────────────────────────────────────────────────────────
ipcMain.on('window-minimize',    () => mainWindow?.minimize());
ipcMain.on('window-maximize',    () =>
  mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',       () => mainWindow?.close());
ipcMain.on('window-fullscreen',  (_, f) => mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen() ?? false);

// ── Update ───────────────────────────────────────────────────────────
ipcMain.handle('check-for-updates', async () => {
  try { await require('electron-updater').autoUpdater.checkForUpdates(); } catch {}
});
ipcMain.on('download-update', () => {
  try { require('electron-updater').autoUpdater.downloadUpdate(); } catch {}
});
ipcMain.on('install-update', () => {
  try {
    // isSilent=true: keine NSIS-Dialoge beim Update
    // isForceRunAfter=true: App startet nach Update automatisch
    require('electron-updater').autoUpdater.quitAndInstall(true, true);
  } catch {}
});

// ── Crash-Log ────────────────────────────────────────────────────────
ipcMain.on('clear-crash-log', () => {
  const f = path.join(app.getPath('userData'), 'logs', 'crash.log');
  try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
});

// ── Einstellungen ────────────────────────────────────────────────────
ipcMain.handle('get-theme',      () => store.get('theme', 'dark'));
ipcMain.on('set-theme',     (_, v) => store.set('theme', v));
ipcMain.handle('get-settings',   () => ({ ...SETTINGS_DEFAULTS, ...store.get('settings', {}) }));

let _settingsPending = false;
ipcMain.on('set-settings', (_, v) => {
  if (!rateOk('set-settings') || _settingsPending) return;
  _settingsPending = true;
  setImmediate(() => { store.set('settings', v); _settingsPending = false; });
});

ipcMain.handle('get-profiles', () =>
  store.get('profiles', [{ id: 'default', name: 'User', avatar: null, pin: null }]));

let _profilesPending = false;
ipcMain.on('set-profiles', (_, v) => {
  if (_profilesPending) return;
  _profilesPending = true;
  setImmediate(() => { store.set('profiles', v); _profilesPending = false; });
});

ipcMain.handle('get-active-profile', () => store.get('activeProfile', 'default'));
ipcMain.on('set-active-profile', (_, id) => {
  if (!validateStr(id, 64)) return;
  store.set('activeProfile', id);
});

// ── Notifications ────────────────────────────────────────────────────
ipcMain.handle('get-notifications', (_, profileId) =>
  store.get(`notifications_${profileId || 'default'}`, []));
ipcMain.on('set-notifications', (_, { profileId, list }) => {
  if (!validateStr(profileId, 64) || !Array.isArray(list)) return;
  store.set(`notifications_${profileId}`, list.slice(0, 100));
});
ipcMain.on('show-notification', (_, { title, body }) => {
  if (Notification.isSupported())
    new Notification({ title, body, icon: path.join(__dirname, 'assets', 'icon.png') }).show();
});

// ── Sicherheit ────────────────────────────────────────────────────────
const ADMIN_HASH = crypto.createHash('sha256')
  .update('OmniSight_AdminReset_2025_Ctrl+Shift+Alt+R').digest('hex');
ipcMain.handle('get-admin-hash', () => ADMIN_HASH);
ipcMain.handle('hash-pin',   (_, pin)       => validateStr(pin, 4)  ? hashPin(pin)  : null);
ipcMain.handle('verify-pin', (_, pin, hash) =>
  validateStr(pin, 4) && validateStr(hash, 64) ? hashPin(pin) === hash : false);

// ── Bild-Picker ───────────────────────────────────────────────────────
ipcMain.handle('pick-image', async (_, dest) => {
  if (!validateStr(dest, 128)) return null;
  const r = await dialog.showOpenDialog(mainWindow, {
    title: 'Bild auswählen',
    filters: [{ name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths.length) return null;

  const src = r.filePaths[0];
  const dir = path.join(app.getPath('userData'), 'userImages');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fn  = `${dest}_${Date.now()}${path.extname(src)}`;
  const dp  = path.join(dir, fn);
  fs.copyFileSync(src, dp);

  const b64  = fs.readFileSync(dp).toString('base64');
  const ext  = path.extname(src).slice(1).toLowerCase();
  const mime = ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
                   gif: 'image/gif', webp: 'image/webp' })[ext] || 'image/png';
  return {
    filePath: `file://${dp.replace(/\\/g, '/')}`,
    base64:   `data:${mime};base64,${b64}`,
  };
});

// ── Sessions ──────────────────────────────────────────────────────────
ipcMain.handle('get-all-sessions',    (_, p) => checkAllSessions(p));
ipcMain.on('refresh-sessions-now', async (_, p) => {
  const r = await checkAllSessions(p);
  mainWindow?.webContents.send('sessions-updated', r);
});
ipcMain.on('setup-webview-session', (_, partition) =>
  setupSession(session.fromPartition(partition)));
ipcMain.on('clear-all-sessions', async (_, p) => {
  await Promise.all(
    Object.keys(SESSION_COOKIES).map(id =>
      session.fromPartition(`persist:${p}_${id}`).clearStorageData().catch(() => {}))
  );
  mainWindow?.webContents.send('sessions-cleared');
});
ipcMain.on('clear-provider-session', async (_, p, id) => {
  try { await session.fromPartition(`persist:${p}_${id}`).clearStorageData(); } catch {}
});
ipcMain.on('clear-providers-sessions', async (_, p, ids) => {
  await Promise.all(ids.map(id =>
    session.fromPartition(`persist:${p}_${id}`).clearStorageData().catch(() => {})));
  const r = await checkAllSessions(p);
  mainWindow?.webContents.send('sessions-updated', r);
});

// ── Google Auth ───────────────────────────────────────────────────────
ipcMain.on('open-google-auth-browser', (_, profileId) => {
  const partition = `persist:${profileId}_youtube`;
  const authWin   = new BrowserWindow({
    width: 500, height: 700,
    title: 'Google-Anmeldung',
    webPreferences: {
      session:         session.fromPartition(partition),
      contextIsolation:true,
      webSecurity:     false,
    },
  });
  session.fromPartition(partition).setUserAgent(CHROME_UA);
  authWin.loadURL(
    'https://accounts.google.com/signin/v2/identifier' +
    '?service=youtube&hl=de&continue=https%3A%2F%2Fwww.youtube.com'
  );
  authWin.webContents.on('did-navigate', async (_, url) => {
    if (url.includes('youtube.com') && !url.includes('accounts.google')) {
      authWin.close();
      mainWindow?.webContents.send('google-auth-done');
      const r = await checkAllSessions(profileId);
      mainWindow?.webContents.send('sessions-updated', r);
    }
  });
});

// ── Stream-Statistiken ────────────────────────────────────────────────
ipcMain.on('record-watch-time', (_, { providerId, seconds, profileId = 'default' }) => {
  if (!validateStr(providerId, 64) || !validateNum(seconds, 0, 7200) ||
      !validateStr(profileId, 64)) return;
  if (!rateOk('record-watch-time')) return;
  const key  = `streamStats_${profileId}`;
  const data = store.get(key, {});
  if (!data[providerId]) data[providerId] = { total: 0, byDay: Array(7).fill(0) };
  data[providerId].total += seconds;
  data[providerId].byDay[new Date().getDay()] =
    (data[providerId].byDay[new Date().getDay()] || 0) + seconds;
  store.set(key, data);
});
ipcMain.handle('get-stream-stats',  (_, p = 'default') => store.get(`streamStats_${p}`, {}));
ipcMain.handle('get-watched-content', (_, p = 'default') => store.get(`watchedContent_${p}`, []));

// ── Achievements (persistent im electron-store, nicht localStorage) ──
ipcMain.handle('get-achievements',  (_, profileId) =>
  store.get(`achievements_${profileId || 'default'}`, []));
ipcMain.on('set-achievements', (_, { profileId, list }) => {
  if (!validateStr(profileId, 64) || !Array.isArray(list)) return;
  store.set(`achievements_${profileId}`, list);
});
ipcMain.handle('get-achievement-meta', (_, profileId) =>
  store.get(`achMeta_${profileId || 'default'}`, {}));
ipcMain.on('set-achievement-meta', (_, { profileId, meta }) => {
  if (!validateStr(profileId, 64)) return;
  store.set(`achMeta_${profileId}`, meta);
});
ipcMain.on('set-watched-content',   (_, { profileId, list }) =>
  store.set(`watchedContent_${profileId}`, list));

// ── Multi-Window ──────────────────────────────────────────────────────
const secondWindows = {};
ipcMain.handle('open-second-window', async (_, { url, partition, title }) => {
  const key = partition || url;
  if (secondWindows[key] && !secondWindows[key].isDestroyed()) {
    secondWindows[key].focus();
    return 'focused';
  }
  const win = new BrowserWindow({
    width: 1280, height: 720,
    title: title || 'OmniSight',
    icon:  path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      webviewTag:               true,
      webSecurity:              false,
      allowRunningInsecureContent: true,
    },
  });
  if (partition) setupSession(session.fromPartition(partition));
  const html = [
    '<!DOCTYPE html><html>',
    '<head><meta http-equiv="Content-Security-Policy"',
    ' content="default-src * data: blob: \'unsafe-inline\' \'unsafe-eval\'">',
    '<style>*{margin:0;padding:0}body{background:#000;height:100vh;display:flex}',
    'webview{flex:1;width:100%;height:100%}</style></head><body>',
    `<webview src="${url}" partition="${partition || ''}"`,
    ` useragent="${CHROME_UA}" allowpopups></webview>`,
    '</body></html>',
  ].join('');
  const tmp = path.join(app.getPath('temp'), `omnisight_${Date.now()}.html`);
  fs.writeFileSync(tmp, html);
  win.loadFile(tmp);
  win.on('closed', () => delete secondWindows[key]);
  secondWindows[key] = win;
  return 'opened';
});

// ── Ad-Block ──────────────────────────────────────────────────────────
ipcMain.handle('fetch-adblock-list', async (_, url) => {
  try {
    const r    = await session.defaultSession.fetch(url, { headers: { 'User-Agent': CHROME_UA } });
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
ipcMain.on('apply-extra-ad-domains', (_, d)  => store.set('extraAdDomains', d));
ipcMain.handle('get-extra-ad-domains',        () => store.get('extraAdDomains', []));

// ── WideVine Status ───────────────────────────────────────────────────
ipcMain.handle('get-widevine-status', () => {
  const userData     = app.getPath('userData');
  const cdmDir       = path.join(userData, 'WidevineCdm', '_platform_specific', 'win_x64');
  const dllPath      = path.join(cdmDir, 'widevinecdm.dll');
  const sigPath      = path.join(cdmDir, 'widevinecdm.dll.sig');
  // manifest.json: Chrome legt es im WidevineCdm-Ordner ab, eine Ebene ÜBER win_x64
  const cdmBase      = path.join(userData, 'WidevineCdm');
  const manifestPath = fs.existsSync(path.join(cdmDir, 'manifest.json'))
    ? path.join(cdmDir, 'manifest.json')    // User hat es direkt reinkopiert
    : path.join(cdmBase, 'manifest.json');  // Standard Chrome-Position

  // Ordner anlegen falls nicht vorhanden
  if (!fs.existsSync(cdmDir)) {
    try { fs.mkdirSync(cdmDir, { recursive: true }); } catch {}
  }

  const dllExists      = fs.existsSync(dllPath);
  const sigExists      = fs.existsSync(sigPath);
  const manifestExists = fs.existsSync(manifestPath);
  const allPresent     = dllExists && sigExists && manifestExists;

  let version = null;
  if (manifestExists) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      version = m.version || m['x-cdm-module-versions'];
    } catch {}
  }

  return {
    installed:      allPresent,
    dllExists,
    sigExists,
    manifestExists,
    version,
    cdmDir,
    cdmBase,
    // Klare Anleitung wo welche Datei hingehört
    paths: {
      dll:      path.join(cdmDir, 'widevinecdm.dll'),
      sig:      path.join(cdmDir, 'widevinecdm.dll.sig'),
      manifest: manifestPath,
    }
  };
});

// ── TMDB ──────────────────────────────────────────────────────────────
ipcMain.handle('get-trending', async () => {
  try {
    const [m, s, a] = await Promise.all([
      tmdbFetch('/trending/movie/week', '&region=DE'),
      tmdbFetch('/trending/tv/week', '&without_genres=16'),
      tmdbFetch('/discover/tv', '&with_genres=16&sort_by=popularity.desc'),
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
      tmdbFetch('/movie/now_playing', '&region=DE'),
      tmdbFetch('/tv/on_the_air', '&watch_region=DE&without_genres=16'),
      tmdbFetch('/discover/tv', '&with_genres=16&sort_by=first_air_date.desc'),
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
    const future = new Date(today);
    future.setMonth(today.getMonth() + months);
    const fmt = d => d.toISOString().split('T')[0];
    const [gte, lte] = [fmt(today), fmt(future)];

    const [m, s, a1, a2] = await Promise.all([
      tmdbFetch('/discover/movie',
        `&region=DE&with_release_type=3|2&release_date.gte=${gte}&release_date.lte=${lte}&sort_by=release_date.asc`),
      tmdbFetch('/discover/tv',
        `&watch_region=DE&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc&without_genres=16`),
      tmdbFetch('/discover/tv',
        `&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc`),
      tmdbFetch('/discover/tv',
        `&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=popularity.desc&page=2`),
    ]);
    const anime = [...(a1.results || []), ...(a2.results || [])]
      .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
    return {
      movies: (m.results || []).filter(i => i.poster_path).slice(0, 30),
      shows:  (s.results || []).filter(i => i.poster_path).slice(0, 30),
      anime:  anime.filter(i => i.poster_path).slice(0, 30),
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('get-tmdb-detail', async (_, { id, type }) => {
  try {
    const [detail, videos, providers] = await Promise.all([
      tmdbFetch(`/${type}/${id}`, '&append_to_response=credits'),
      tmdbFetch(`/${type}/${id}/videos`),
      tmdbFetch(`/${type}/${id}/watch/providers`),
    ]);
    return {
      detail,
      videos:    videos.results || [],
      providers: providers.results?.DE || null,
    };
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('search-tmdb', async (_, query) => {
  try {
    const r = await tmdbFetch('/search/multi',
      `&query=${encodeURIComponent(query)}&include_adult=false`);
    return { results: r.results || [], total: r.total_results || 0 };
  } catch { return { results: [], total: 0 }; }
});

ipcMain.handle('get-streaming-providers', async (_, { tmdbId, type }) => {
  try {
    const r = await tmdbFetch(`/${type}/${tmdbId}/watch/providers`);
    return r.results?.DE || null;
  } catch { return null; }
});

ipcMain.handle('get-watchlist-releases', async (_, items) => {
  try {
    const today   = new Date().toISOString().split('T')[0];
    const results = [];
    for (const { tmdbId, tmdbType, title } of (items || []).slice(0, 10)) {
      const r  = await tmdbFetch(`/${tmdbType}/${tmdbId}`);
      const rd = r.release_date || r.first_air_date || '';
      if (rd === today) results.push({ title, tmdbId, tmdbType });
    }
    return results;
  } catch { return []; }
});

ipcMain.handle('get-providers-list', () => null); // Im Renderer verwaltet

// ── Export / Import ───────────────────────────────────────────────────
ipcMain.handle('export-settings', async () => {
  const data = {
    settings:      store.get('settings', {}),
    profiles:      store.get('profiles', []),
    activeProfile: store.get('activeProfile', 'default'),
    theme:         store.get('theme', 'dark'),
    exportedAt:    new Date().toISOString(),
    version:       app.getVersion(),
  };
  const r = await dialog.showSaveDialog(mainWindow, {
    title:       'Einstellungen exportieren',
    defaultPath: `omnisight-backup-${new Date().toISOString().split('T')[0]}.json`,
    filters:     [{ name: 'JSON', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return { ok: false };
  fs.writeFileSync(r.filePath, JSON.stringify(data, null, 2));
  return { ok: true, path: r.filePath };
});

ipcMain.handle('import-settings', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title:      'Einstellungen importieren',
    filters:    [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths.length) return { ok: false };
  try {
    const data = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
    if (data.settings)      store.set('settings', data.settings);
    if (data.profiles)      store.set('profiles', data.profiles);
    if (data.activeProfile) store.set('activeProfile', data.activeProfile);
    if (data.theme)         store.set('theme', data.theme);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── Sonstiges ─────────────────────────────────────────────────────────
ipcMain.handle('check-online', async () => {
  try {
    await session.defaultSession.fetch('https://www.google.com', { method: 'HEAD' });
    return true;
  } catch { return false; }
});
ipcMain.handle('check-url', async (_, url) => {
  try {
    const r = await session.defaultSession.fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': CHROME_UA },
    });
    return { ok: true, status: r.status };
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('check-vpn', async () => {
  try {
    const r = await session.defaultSession.fetch('https://ipapi.co/json/', {
      headers: { 'User-Agent': CHROME_UA },
    });
    const d = await r.json();
    return {
      ip:      d.ip,
      country: d.country_name,
      city:    d.city,
      org:     d.org,
      isVpn:   !!(d.org?.toLowerCase().includes('vpn') ||
                  d.org?.toLowerCase().includes('proxy')),
    };
  } catch (e) { return { error: e.message }; }
});
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ═══════════════════════════════════════════════════════════════════
// APP LIFECYCLE
// ═══════════════════════════════════════════════════════════════════

app.whenReady().then(async () => {
  setupCrashReporter();
  createMainWindow();

  // WideVine CDM in Default-Session registrieren (Electron 34+)
  const userData = app.getPath('userData');
  const cdmDir   = path.join(userData, 'WidevineCdm', '_platform_specific', 'win_x64');
  if (fs.existsSync(path.join(cdmDir, 'widevinecdm.dll'))) {
    try {
      // Electron 34: CDM als Extension laden
      await session.defaultSession.loadExtension(cdmDir, { allowFileAccess: true })
        .then(() => console.log('[WideVine] CDM Extension geladen ✓'))
        .catch(e => console.log('[WideVine] loadExtension:', e.message, '(normal bei NSIS-Build)'));
    } catch(e) {
      console.log('[WideVine] Extension-Modus nicht verfügbar:', e.message);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// Deinstallations-Dialog (wird von NSIS-Script über Kommandozeilenargument ausgelöst)
app.on('will-quit', e => {
  if (!process.argv.includes('--uninstall')) return;
  e.preventDefault();
  const choice = dialog.showMessageBoxSync({
    type:      'question',
    title:     'OmniSight deinstallieren',
    message:   'Möchtest du alle OmniSight-Daten löschen?\n\n' +
               'Dazu gehören Profile, Watchlist, Einstellungen und Sessions.\n\n' +
               'Wenn du "Nein" wählst, bleiben deine Daten für eine Neuinstallation erhalten.',
    buttons:   ['Ja, alles löschen', 'Nein, behalten'],
    defaultId: 1,
    cancelId:  1,
  });
  if (choice === 0) {
    try {
      const p = app.getPath('userData');
      if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    } catch (err) { console.error('[Uninstall] Fehler:', err.message); }
  }
  app.quit();
});
