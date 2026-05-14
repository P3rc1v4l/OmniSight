const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// ========================
// USER-AGENT (echter Chrome)
// ========================
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ========================
// AD-BLOCK
// ========================
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
  'app.link','trk.pinterest.com','ads.pinterest.com','fundingchoicesmessages.google.com',
];

function isAdUrl(url) {
  try {
    const h = new URL(url).hostname;
    return AD_DOMAINS.some(d => h === d || h.endsWith('.'+d));
  } catch { return false; }
}

// ========================
// SESSION SETUP
// ========================
function setupSession(ses) {
  ses.setUserAgent(CHROME_UA);

  // Ads blockieren
  try {
    ses.webRequest.onBeforeRequest({ urls:['<all_urls>'] }, (details, cb) => {
      cb({ cancel: isAdUrl(details.url) });
    });
  } catch {}

  // Request-Header: echter Browser, keine Electron-Spuren
  try {
    ses.webRequest.onBeforeSendHeaders({ urls:['<all_urls>'] }, (details, cb) => {
      const h = details.requestHeaders;
      h['User-Agent']      = CHROME_UA;
      h['Accept-Language'] = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
      h['Accept']          = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
      // Entferne Electron-Identifier
      delete h['X-Frame-Options'];
      delete h['Sec-Ch-Ua'];
      // Setze echte Chrome-Hints
      h['Sec-Ch-Ua']          = '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']   = '?0';
      h['Sec-Ch-Ua-Platform'] = '"Windows"';
      cb({ requestHeaders: h });
    });
  } catch {}

  // Response-Header: X-Frame-Options + CSP entfernen (nötig für Webview)
  try {
    ses.webRequest.onHeadersReceived({ urls:['<all_urls>'] }, (details, cb) => {
      const h = details.responseHeaders || {};
      // Case-insensitive entfernen
      for (const key of Object.keys(h)) {
        const low = key.toLowerCase();
        if (low === 'x-frame-options' || low === 'content-security-policy' || low === 'x-content-type-options') {
          delete h[key];
        }
      }
      cb({ responseHeaders: h });
    });
  } catch {}
}

// ========================
// WINDOW
// ========================
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:1320, height:840,
    minWidth:820, minHeight:520,
    frame:false,
    backgroundColor:'#0a0a0f',
    icon: path.join(__dirname,'assets','icon.png'),
    webPreferences:{
      nodeIntegration:false,
      contextIsolation:true,
      preload: path.join(__dirname,'preload.js'),
      webviewTag:true,
      webSecurity:false,        // nötig für cross-origin Webviews
      allowRunningInsecureContent:true,
    },
  });

  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname,'index.html'));

  mainWindow.on('closed', () => { mainWindow=null; app.quit(); });
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen',  () => mainWindow.webContents.send('fullscreen-change',false));
}

// ========================
// IPC – WINDOW
// ========================
ipcMain.on('window-minimize',   () => mainWindow?.minimize());
ipcMain.on('window-maximize',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',      () => mainWindow?.close());
ipcMain.on('window-fullscreen', (_, f) => mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen()??false);

// ESC zum Beenden von Vollbild (wird vom Webview-Preload nicht abgefangen, daher global)
app.whenReady().then(() => {
  // Registriere globalen ESC-Handler nach Fenster-Erstellung
});

// ========================
// IPC – THEME & SETTINGS
// ========================
ipcMain.handle('get-theme',    () => store.get('theme','dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme',v));
ipcMain.handle('get-settings', () => store.get('settings',{
  appBg:'', appBgImage:'', cardBg:'', accentColor:'#7c6cff',
  cardImages:{}, logoImage:'',
}));
ipcMain.on('set-settings', (_, v) => store.set('settings',v));

// ========================
// IPC – BILD AUSWÄHLEN
// ========================
ipcMain.handle('pick-image', async (_, dest) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title:'Bild auswählen',
    filters:[{ name:'Bilder', extensions:['jpg','jpeg','png','gif','webp','svg'] }],
    properties:['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const src = result.filePaths[0];
  // Datei in userData kopieren, damit sie auch nach Verschieben des Originals verfügbar bleibt
  const userDataPath = app.getPath('userData');
  const imagesDir    = path.join(userDataPath,'userImages');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive:true });

  const ext      = path.extname(src);
  const filename = `${dest}_${Date.now()}${ext}`;
  const destPath = path.join(imagesDir, filename);
  fs.copyFileSync(src, destPath);

  // Als file:// URL zurückgeben
  return `file://${destPath.replace(/\\/g,'/')}`;
});

// ========================
// IPC – SESSIONS
// ========================
ipcMain.handle('get-all-sessions', () => store.get('providerSessions',{}));
ipcMain.on('set-provider-logged-in', (_, { providerId, loggedIn }) => {
  const s = store.get('providerSessions',{});
  s[providerId] = loggedIn;
  store.set('providerSessions',s);
});
ipcMain.on('clear-all-sessions', async () => {
  const ids = ['netflix','prime','disney','crunchyroll','burning','cineto','youtube','twitch'];
  for (const p of ids) {
    try { await session.fromPartition(`persist:${p}`).clearStorageData(); } catch {}
  }
  store.set('providerSessions',{});
  mainWindow?.webContents.send('sessions-cleared');
});
ipcMain.on('clear-provider-session', async (_, id) => {
  try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
  const s = store.get('providerSessions',{});
  delete s[id];
  store.set('providerSessions',s);
});

// ========================
// IPC – WEBVIEW SESSION SETUP
// ========================
ipcMain.on('setup-webview-session', (_, partition) => {
  setupSession(session.fromPartition(partition));
});

// ========================
// IPC – DIAGNOSE (für bs.to / cine.to)
// ========================
ipcMain.handle('check-url', async (_, url) => {
  return new Promise(resolve => {
    const ses = session.defaultSession;
    const req = ses.fetch(url, {
      method:'GET',
      headers:{ 'User-Agent': CHROME_UA },
    }).then(r => resolve({ ok:true, status:r.status, url:r.url }))
      .catch(e => resolve({ ok:false, error:e.message }));
  });
});

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ========================
// START
// ========================
app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform!=='darwin') app.quit(); });
