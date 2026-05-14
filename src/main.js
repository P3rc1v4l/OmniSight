const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// ════════════════════════════════
// USER AGENTS
// ════════════════════════════════
const CHROME_UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
// Google akzeptiert nur bestimmte UAs für OAuth – wir emulieren Chrome vollständig
const GOOGLE_UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ════════════════════════════════
// AD-BLOCK
// ════════════════════════════════
const AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','googletagmanager.com',
  'googletagservices.com','google-analytics.com','adnxs.com',
  'adsrvr.org','advertising.com','scorecardresearch.com','quantserve.com',
  'outbrain.com','taboola.com','pubmatic.com','rubiconproject.com',
  'openx.net','criteo.com','casalemedia.com','moatads.com',
  'adtech.de','spotxchange.com','smartadserver.com','adsafeprotected.com',
  'doubleverify.com','imasdk.googleapis.com','pagead2.googlesyndication.com',
  'adservice.google.com','securepubads.g.doubleclick.net',
  'ads.crunchyroll.com','fundingchoicesmessages.google.com',
];

function isAd(url) {
  try {
    const h = new URL(url).hostname;
    return AD_DOMAINS.some(d => h === d || h.endsWith('.'+d));
  } catch { return false; }
}

// ════════════════════════════════
// SESSION SETUP
// ════════════════════════════════
function setupSession(ses) {
  // SSL-Fehler ignorieren (fix für ERR_CERT_COMMON_NAME_INVALID bei bs.to/cine.to)
  ses.setCertificateVerifyProc((req, cb) => cb(0));

  ses.setUserAgent(CHROME_UA);

  try {
    ses.webRequest.onBeforeRequest({ urls:['<all_urls>'] }, (det, cb) => {
      cb({ cancel: isAd(det.url) });
    });
  } catch {}

  try {
    ses.webRequest.onBeforeSendHeaders({ urls:['<all_urls>'] }, (det, cb) => {
      const h = det.requestHeaders;
      h['User-Agent']         = CHROME_UA;
      h['Accept-Language']    = 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7';
      h['Accept']             = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
      h['Sec-Ch-Ua']          = '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']   = '?0';
      h['Sec-Ch-Ua-Platform'] = '"Windows"';
      // Entferne Electron-Identifier
      delete h['X-Frame-Options'];
      cb({ requestHeaders: h });
    });
  } catch {}

  try {
    ses.webRequest.onHeadersReceived({ urls:['<all_urls>'] }, (det, cb) => {
      const h = det.responseHeaders || {};
      for (const key of Object.keys(h)) {
        const low = key.toLowerCase();
        if (['x-frame-options','content-security-policy',
             'x-content-type-options','strict-transport-security'].includes(low)) {
          delete h[key];
        }
      }
      cb({ responseHeaders: h });
    });
  } catch {}
}

// ════════════════════════════════
// MAIN WINDOW
// ════════════════════════════════
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:1360, height:860,
    minWidth:820, minHeight:520,
    frame:false,
    backgroundColor:'#0a0a0f',
    icon: path.join(__dirname,'assets','icon.png'),
    webPreferences:{
      nodeIntegration:false,
      contextIsolation:true,
      preload: path.join(__dirname,'preload.js'),
      webviewTag:true,
      webSecurity:false,
      allowRunningInsecureContent:true,
    },
  });

  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname,'index.html'));

  mainWindow.on('closed', () => { mainWindow=null; app.quit(); });
  mainWindow.on('enter-full-screen', () => mainWindow.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen',  () => mainWindow.webContents.send('fullscreen-change',false));
}

// ════════════════════════════════
// IPC – WINDOW
// ════════════════════════════════
ipcMain.on('window-minimize',   () => mainWindow?.minimize());
ipcMain.on('window-maximize',   () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window-close',      () => mainWindow?.close());
ipcMain.on('window-fullscreen', (_, f) => mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', () => mainWindow?.isFullScreen()??false);

// ════════════════════════════════
// IPC – THEME & SETTINGS
// ════════════════════════════════
ipcMain.handle('get-theme',    () => store.get('theme','dark'));
ipcMain.on('set-theme',        (_, v) => store.set('theme',v));
ipcMain.handle('get-settings', () => store.get('settings', {
  appBg:'', appBgImage:'', cardBg:'', accentColor:'#7c6cff',
  cardImages:{}, cardImageOffsets:{}, logoImage:'',
  favorites:[], clock:{ enabled:false, position:'bottom-right', color:'#ffffff', opacity:0.85 },
}));
ipcMain.on('set-settings', (_, v) => store.set('settings',v));

// ════════════════════════════════
// IPC – BILD WÄHLEN
// ════════════════════════════════
ipcMain.handle('pick-image', async (_, dest) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title:'Bild auswählen',
    filters:[{ name:'Bilder', extensions:['jpg','jpeg','png','gif','webp','svg'] }],
    properties:['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;

  const src      = result.filePaths[0];
  const dir      = path.join(app.getPath('userData'),'userImages');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});

  const ext      = path.extname(src);
  const filename = `${dest}_${Date.now()}${ext}`;
  const destPath = path.join(dir, filename);
  fs.copyFileSync(src, destPath);
  return `file://${destPath.replace(/\\/g,'/')}`;
});

// ════════════════════════════════
// IPC – SESSIONS
// Echter Login-Check: schaue ob Cookies vorhanden sind
// ════════════════════════════════
const LOGIN_COOKIE_CHECKS = {
  netflix:     { url:'https://www.netflix.com',    name:'NetflixId' },
  prime:       { url:'https://www.amazon.de',      name:'session-id' },
  disney:      { url:'https://www.disneyplus.com', name:'BAMAccountToken' },
  crunchyroll: { url:'https://www.crunchyroll.com',name:'etp_rt' },
  burning:     { url:'https://bs.to',              name:'_token' },
  cineto:      { url:'https://cine.to',            name:'PHPSESSID' },
  youtube:     { url:'https://www.youtube.com',    name:'LOGIN_INFO' },
  twitch:      { url:'https://www.twitch.tv',      name:'auth-token' },
  dazn:        { url:'https://www.dazn.com',       name:'usr' },
  hbomax:      { url:'https://www.max.com',        name:'hbo_session' },
  joyn:        { url:'https://www.joyn.de',        name:'joyn_session' },
  ard:         { url:'https://www.ardmediathek.de',name:'ard_sso_session' },
  zdf:         { url:'https://www.zdf.de',         name:'sso' },
  paramountplus:{ url:'https://www.paramountplus.com', name:'PVFW' },
  skygo:       { url:'https://www.sky.de',         name:'skySession' },
  mubi:        { url:'https://mubi.com',           name:'_session' },
  apple:       { url:'https://tv.apple.com',       name:'myacinfo' },
  rtl:         { url:'https://plus.rtl.de',        name:'rtl_token' },
};

ipcMain.handle('check-provider-login', async (_, providerId) => {
  const check = LOGIN_COOKIE_CHECKS[providerId];
  if (!check) return false;
  try {
    const ses = session.fromPartition(`persist:${providerId}`);
    const cookies = await ses.cookies.get({ url: check.url, name: check.name });
    return cookies.length > 0;
  } catch { return false; }
});

ipcMain.handle('get-all-sessions', async () => {
  const result = {};
  for (const [id] of Object.entries(LOGIN_COOKIE_CHECKS)) {
    const check = LOGIN_COOKIE_CHECKS[id];
    try {
      const ses = session.fromPartition(`persist:${id}`);
      const cookies = await ses.cookies.get({ url: check.url, name: check.name });
      result[id] = cookies.length > 0;
    } catch { result[id] = false; }
  }
  return result;
});

ipcMain.on('clear-all-sessions', async () => {
  for (const id of Object.keys(LOGIN_COOKIE_CHECKS)) {
    try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
  }
  mainWindow?.webContents.send('sessions-cleared');
});

ipcMain.on('clear-provider-session', async (_, id) => {
  try { await session.fromPartition(`persist:${id}`).clearStorageData(); } catch {}
});

// ════════════════════════════════
// IPC – WEBVIEW SESSION
// ════════════════════════════════
ipcMain.on('setup-webview-session', (_, partition) => {
  setupSession(session.fromPartition(partition));
});

// ════════════════════════════════
// IPC – URL DIAGNOSE
// ════════════════════════════════
ipcMain.handle('check-url', async (_, url) => {
  try {
    const r = await session.defaultSession.fetch(url, {
      method:'HEAD',
      headers:{ 'User-Agent': CHROME_UA },
    });
    return { ok:true, status:r.status };
  } catch(e) { return { ok:false, error:e.message }; }
});

ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ════════════════════════════════
// START
// ════════════════════════════════
app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => { if (process.platform!=='darwin') app.quit(); });
