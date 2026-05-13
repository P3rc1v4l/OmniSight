const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// =====================
// AD-BLOCK DOMAINS
// =====================
const AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','googletagmanager.com',
  'googletagservices.com','google-analytics.com','adnxs.com',
  'adsrvr.org','advertising.com','scorecardresearch.com','quantserve.com',
  'outbrain.com','taboola.com','pubmatic.com','rubiconproject.com',
  'openx.net','criteo.com','casalemedia.com','moatads.com',
  'adtech.de','spotxchange.com','smartadserver.com','adsafeprotected.com',
  'doubleverify.com','imasdk.googleapis.com','pagead2.googlesyndication.com',
  'adservice.google.com','securepubads.g.doubleclick.net',
  'ads.crunchyroll.com','static.ads-twitter.com','cdn.branch.io',
  'app.link','trk.pinterest.com','ads.pinterest.com',
];

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function isDomainBlocked(url) {
  try {
    const h = new URL(url).hostname;
    return AD_DOMAINS.some(d => h === d || h.endsWith('.' + d));
  } catch { return false; }
}

function setupSession(ses) {
  ses.setUserAgent(CHROME_UA);

  ses.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, cb) => {
    cb({ cancel: isDomainBlocked(details.url) });
  });

  ses.webRequest.onBeforeSendHeaders({ urls: ['<all_urls>'] }, (details, cb) => {
    const h = details.requestHeaders;
    h['User-Agent'] = CHROME_UA;
    h['Accept-Language'] = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
    delete h['X-Frame-Options'];
    cb({ requestHeaders: h });
  });

  ses.webRequest.onHeadersReceived({ urls: ['<all_urls>'] }, (details, cb) => {
    const h = details.responseHeaders || {};
    // X-Frame-Options & CSP entfernen, damit Webview-Einbettung funktioniert
    delete h['x-frame-options'];
    delete h['X-Frame-Options'];
    delete h['content-security-policy'];
    delete h['Content-Security-Policy'];
    cb({ responseHeaders: h });
  });
}

// =====================
// WINDOW
// =====================
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 800, minHeight: 520,
    frame: false,
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      webSecurity: false,
    },
  });

  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; app.quit(); });

  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('fullscreen-change', true));
  mainWindow.on('leave-full-screen', () => mainWindow.webContents.send('fullscreen-change', false));
}

// =====================
// IPC
// =====================
ipcMain.on('window-minimize',   () => mainWindow?.minimize());
ipcMain.on('window-maximize',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',      () => mainWindow?.close());
ipcMain.on('window-fullscreen', (_, flag) => mainWindow?.setFullScreen(flag));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen() ?? false);

ipcMain.handle('get-theme',    () => store.get('theme', 'dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme', v));

ipcMain.handle('get-settings', () => store.get('settings', { appBg: '', cardBg: '', accentColor: '#7c6cff' }));
ipcMain.on('set-settings',     (_, v) => store.set('settings', v));

ipcMain.handle('get-all-sessions', () => store.get('providerSessions', {}));
ipcMain.on('set-provider-logged-in', (_, { providerId, loggedIn }) => {
  const s = store.get('providerSessions', {});
  s[providerId] = loggedIn;
  store.set('providerSessions', s);
});

ipcMain.on('clear-all-sessions', async () => {
  const providers = ['netflix','prime','disney','crunchyroll','burning','cineto'];
  for (const p of providers) {
    try { await session.fromPartition(`persist:${p}`).clearStorageData(); } catch {}
  }
  store.set('providerSessions', {});
  mainWindow?.webContents.send('sessions-cleared');
});

ipcMain.on('clear-provider-session', async (_, id) => {
  try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
  const s = store.get('providerSessions', {});
  delete s[id];
  store.set('providerSessions', s);
});

// Webview-Session einrichten (Ad-Blocker + UA)
ipcMain.on('setup-webview-session', (_, partition) => {
  setupSession(session.fromPartition(partition));
});

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
