'use strict';

// ── CRASH REPORTER ────────────────────────────────────────────────
const fs_=require('fs'),path_=require('path');
function setupCrashReporter(){
  const logDir=path_.join(app.getPath('userData'),'logs');
  if(!fs_.existsSync(logDir))fs_.mkdirSync(logDir,{recursive:true});
  const logFile=path_.join(logDir,'crash.log');
  process.on('uncaughtException',err=>{const entry=`[${new Date().toISOString()}] CRASH: ${err.message}\n${err.stack}\n\n`;fs_.appendFileSync(logFile,entry);});
  process.on('unhandledRejection',(r)=>{const entry=`[${new Date().toISOString()}] UNHANDLED: ${r}\n\n`;fs_.appendFileSync(logFile,entry);});
  // Beim Start: letzten Crash anzeigen wenn vorhanden
  if(fs_.existsSync(logFile)){const stat=fs_.statSync(logFile);if(Date.now()-stat.mtimeMs<60000)console.warn('[CrashReporter] Letzter Absturz:',fs_.readFileSync(logFile,'utf8').slice(-500));}
}


// ── IPC RATE-LIMITING ────────────────────────────────────────────
const _ipcCallCounts = {};
const _ipcRateLimits = {
  'set-settings': {max: 20, window: 5000},
  'set-profiles': {max: 10, window: 5000},
  'record-watch-time': {max: 120, window: 60000},
};
function checkRateLimit(channel) {
  const limit = _ipcRateLimits[channel];
  if (!limit) return true;
  const now = Date.now();
  if (!_ipcCallCounts[channel]) _ipcCallCounts[channel] = {count:0, start:now};
  if (now - _ipcCallCounts[channel].start > limit.window) {
    _ipcCallCounts[channel] = {count:1, start:now};
    return true;
  }
  _ipcCallCounts[channel].count++;
  if (_ipcCallCounts[channel].count > limit.max) {
    console.warn('[RateLimit] Channel überflutet:', channel);
    return false;
  }
  return true;
}

// ── INPUT VALIDATION ──────────────────────────────────────────────
function validateString(val, maxLen=256){return typeof val==='string'&&val.length<=maxLen;}
function validateProfileId(id){return validateString(id,64)&&/^[a-zA-Z0-9_-]+$/.test(id);}
function validateNumber(val,min=0,max=Number.MAX_SAFE_INTEGER){return typeof val==='number'&&isFinite(val)&&val>=min&&val<=max;}

// ── ELECTRON VERSION CHECK ─────────────────────────────────────────
const electronVer=process.versions.electron?.split('.')[0];
if(electronVer&&parseInt(electronVer)<28){
  console.error('[Security] Electron <28 detected! Please update to >=33 for security patches.');
}

const {app,BrowserWindow,ipcMain,session,shell,dialog,Notification}=require('electron');
const path=require('path'),fs=require('fs'),crypto=require('crypto');
const Store=require('electron-store');
const store=new Store();
let mainWindow;

// Admin-Reset: Hash statt Klartext (sicherer als Datei)
// Kombination: Strg+Shift+Alt+R  → hash wird im Renderer verglichen
const ADMIN_HASH=crypto.createHash('sha256').update('OmniSight_AdminReset_2025_Ctrl+Shift+Alt+R').digest('hex');
ipcMain.handle('get-admin-hash',()=>ADMIN_HASH);


// ── PIN HASHING ───────────────────────────────────────────────────
// Verhindert dass PINs im Klartext im electron-store liegen
function hashPin(pin) {
  if (!pin) return null;
  return crypto.createHash('sha256').update('omnisight_pin_salt_'+pin).digest('hex');
}
// IPC: PIN prüfen (Renderer sendet Hash-Anfrage)
ipcMain.handle('hash-pin', (_, pin) => {
  if (!validateString(pin, 4)) return null;
  return hashPin(pin);
});
ipcMain.handle('verify-pin', (_, pin, hash) => {
  if (!validateString(pin, 4) || !validateString(hash, 64)) return false;
  return hashPin(pin) === hash;
});



// ── WIDEVINE ORDNER ANLEGEN ───────────────────────────────────────
function setupWidevineDir() {
  const path_ = require('path');
  const userData = app.getPath('userData');
  const cdmDir = path_.join(userData, 'WidevineCdm', '_platform_specific', 'win_x64');
  if (!fs_.existsSync(cdmDir)) {
    fs_.mkdirSync(cdmDir, { recursive: true });
    console.log('[WideVine] Ordner angelegt:', cdmDir);
  }
  return cdmDir;
}

// ── WIDEVINE ──────────────────────────────────────────────────────
function setupWidevine(){
  const base=app.getPath('userData');
  for(const p of[path.join(base,'WidevineCdm'),path.join(base,'WidevineCdm','_platform_specific','win_x64')]){
    if(fs.existsSync(path.join(p,'widevinecdm.dll'))){
      app.commandLine.appendSwitch('widevine-cdm-path',p);
      app.commandLine.appendSwitch('widevine-cdm-version','4.10.2662.0');
      break;
    }
  }
  app.commandLine.appendSwitch('enable-features','PlatformEncryptedDolbyVision');
  app.commandLine.appendSwitch('disable-features','OutOfBlinkCors');
}
setupWidevine();

const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── ADBLOCK ───────────────────────────────────────────────────────
const DEFAULT_ADS=['doubleclick.net','googlesyndication.com','googletagmanager.com','google-analytics.com','adnxs.com','adsrvr.org','advertising.com','scorecardresearch.com','outbrain.com','taboola.com','pubmatic.com','rubiconproject.com','openx.net','criteo.com','casalemedia.com','imasdk.googleapis.com','pagead2.googlesyndication.com','adservice.google.com','securepubads.g.doubleclick.net','amazon-adsystem.com','media.net','bidswitch.net','appnexus.com','sovrn.com','fundingchoicesmessages.google.com'];
function isAd(url){try{const h=new URL(url).hostname;return[...DEFAULT_ADS,...store.get('extraAdDomains',[])].some(d=>h===d||h.endsWith('.'+d));}catch{return false;}}

// ── SESSION ───────────────────────────────────────────────────────

// Twitch/YouTube: Chrome UA setzen (ohne 'Electron' String)
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
function setupStreamUA(ses) {
  if (!ses) return;
  try {
    ses.setUserAgent(CHROME_UA, 'de-DE,de;q=0.9,en;q=0.8');
  } catch(e) { console.warn('[UA] setUserAgent Fehler:', e.message); }
}

function setupSession(ses){
  setupStreamUA(ses);
  // CSP für app-eigene Seiten
  ses.webRequest.onHeadersReceived({urls:['file://*']}, (d,cb)=>{
    const h=d.responseHeaders||{};
    // Nur eigene Seiten bekommen strikte CSP, Webviews nicht
    if(d.url.endsWith('index.html')||d.url.endsWith('splash.html')){
      h['Content-Security-Policy']=["default-src 'self' 'unsafe-inline' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:;"];
    }
    cb({responseHeaders:h});
  });
  ses.setCertificateVerifyProc((_,cb)=>cb(0));
  // Kamera/Mikrofon nur wenn Nutzer explizit erlaubt
  ses.setPermissionRequestHandler((webContents, permission, cb) => {
    const allowed = ['geolocation','notifications','fullscreen','clipboard-read','clipboard-sanitized-write'];
    // Streaming-spezifisch
    if (['media','mediaKeySystem'].includes(permission)) return cb(true);
    cb(allowed.includes(permission));
  });
  ses.setUserAgent(UA);
  try{ses.webRequest.onBeforeRequest({urls:['<all_urls>']},({url},cb)=>cb({cancel:isAd(url)}));}catch{}
  try{ses.webRequest.onBeforeSendHeaders({urls:['<all_urls>']},(d,cb)=>{const h=d.requestHeaders;h['User-Agent']=UA;h['Accept-Language']='de-DE,de;q=0.9';delete h['X-Frame-Options'];cb({requestHeaders:h});});}catch{}
  try{ses.webRequest.onHeadersReceived({urls:['<all_urls>']},(d,cb)=>{const h=d.responseHeaders||{};for(const k of Object.keys(h))if(['x-frame-options','content-security-policy'].includes(k.toLowerCase()))delete h[k];cb({responseHeaders:h});});}catch{}
}

// ── MAIN WINDOW ───────────────────────────────────────────────────
function createMainWindow(){
  const saved=store.get('windowBounds',null);
  mainWindow=new BrowserWindow({
    width:saved?.width||1400,height:saved?.height||900,minWidth:820,minHeight:520,
    frame:false,show:false,backgroundColor:'#0a0a0f',
    icon:path.join(__dirname,'assets','icon.ico'),
    webPreferences:{nodeIntegration:false,contextIsolation:true,preload:path.join(__dirname,'preload.js'),webviewTag:true,webSecurity:false,allowRunningInsecureContent:true},
    ...(saved?.x!=null?{x:saved.x,y:saved.y}:{}),
  });
  mainWindow.on('close',()=>{const m=mainWindow.isMaximized();store.set('windowBounds',m?{...store.get('windowBounds',{}),maximized:true}:mainWindow.getBounds());});
  setupSession(session.defaultSession);

  const splash=new BrowserWindow({width:420,height:280,frame:false,alwaysOnTop:true,transparent:true,backgroundColor:'#00000000',webPreferences:{nodeIntegration:false}});
  splash.loadFile(path.join(__dirname,'splash.html'));
  mainWindow.loadFile(path.join(__dirname,'index.html'));
  // Crash-Log prüfen und bei nächstem Start melden
  const logFile=path_.join(app.getPath('userData'),'logs','crash.log');
  if(fs_.existsSync(logFile)){
    const stat=fs_.statSync(logFile);const age=Date.now()-stat.mtimeMs;
    // Nur wenn Crash in letzten 24h und Datei nicht leer
    if(age<86400000&&stat.size>10){
      setTimeout(()=>{
        mainWindow?.webContents.send('crash-log-found',{
          size:stat.size,
          preview:fs_.readFileSync(logFile,'utf8').slice(-300)
        });
      },3000);
    }
  }

  let shown=false;
  function showMain(){if(shown)return;shown=true;try{splash.destroy();}catch{}if(store.get('windowBounds')?.maximized)mainWindow.maximize();else mainWindow.show();mainWindow.focus();}
  setTimeout(showMain,2500);setTimeout(showMain,5000);

  mainWindow.on('closed',()=>{mainWindow=null;app.quit();});
  mainWindow.on('enter-full-screen',()=>mainWindow?.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen',()=>mainWindow?.webContents.send('fullscreen-change',false));

  try{
    const {autoUpdater}=require('electron-updater');
    autoUpdater.autoDownload=false; // Download nur auf Nutzer-Wunsch
    autoUpdater.autoInstallOnAppQuit=true; // bei Quit automatisch installieren
    // GH_TOKEN aus Umgebung oder Electron-Store für private Repos
    const ghToken = process.env.GH_TOKEN || store.get('ghToken','');
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'P3rc1v4l',
      repo: 'OmniSight',
      private: true,        // Repo ist privat → Token nötig
      token: ghToken || undefined
    });
    autoUpdater.on('update-available',info=>mainWindow?.webContents.send('update-available',info));
    autoUpdater.on('update-not-available',()=>mainWindow?.webContents.send('update-not-available'));
    autoUpdater.on('update-downloaded',info=>{
      mainWindow?.webContents.send('update-downloaded',info);
      // Zeige "Jetzt installieren"-Button
    });
    autoUpdater.on('download-progress',p=>mainWindow?.webContents.send('update-download-progress',Math.round(p.percent)));
    autoUpdater.on('error',err=>{const m=err.message||'';if(!m.includes('app-update.yml')&&!m.includes('404'))mainWindow?.webContents.send('update-error',m);});
    setTimeout(()=>{try{autoUpdater.checkForUpdates();}catch{}},5000);
  }catch(e){console.warn('[AutoUpdater]',e.message);}
}

// ── IPC: WINDOW ───────────────────────────────────────────────────
ipcMain.on('window-minimize',()=>mainWindow?.minimize());
ipcMain.on('window-maximize',()=>mainWindow?.isMaximized()?mainWindow.unmaximize():mainWindow?.maximize());
ipcMain.on('window-close',()=>mainWindow?.close());
ipcMain.on('window-fullscreen',(_,f)=>mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen',()=>mainWindow?.isFullScreen()??false);
ipcMain.on('download-update',()=>{try{require('electron-updater').autoUpdater.downloadUpdate();}catch{}});
ipcMain.on('clear-crash-log',()=>{
  const logFile=path_.join(app.getPath('userData'),'logs','crash.log');
  try{if(fs_.existsSync(logFile))fs_.unlinkSync(logFile);}catch{}
});
ipcMain.on('install-update',()=>{try{const{autoUpdater}=require('electron-updater');autoUpdater.quitAndInstall(false,true);}catch{}});

// GH_TOKEN für Auto-Update bei privaten Repos
ipcMain.handle('get-gh-token',()=>store.get('ghToken',''));
ipcMain.on('set-gh-token',(_,token)=>{
  store.set('ghToken',token);
  // autoUpdater neu konfigurieren
  try {
    const {autoUpdater}=require('electron-updater');
    autoUpdater.setFeedURL({provider:'github',owner:'P3rc1v4l',repo:'OmniSight',private:true,token});
    autoUpdater.checkForUpdates();
  } catch {}
});
ipcMain.handle('check-for-updates',async()=>{try{await require('electron-updater').autoUpdater.checkForUpdates();}catch{}});

// ── IPC: SETTINGS ─────────────────────────────────────────────────
const DEFS={appBgImage:'',accentColor:'#30c5bb',cardImages:{},cardImageOffsets:{},cardBgColors:{},cardBgOpacity:{},cardCustomNames:{},cardCustomTags:{},cardLogos:{},favorites:[],fontSize:14,cardLayout:'normal',sortAlpha:false,sortDir:'asc',language:'de',particlesEnabled:false,particlesConfig:{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle'],appWide:true},clock:{enabled:false,position:{x:16,y:52},color:'#cfcfcf',opacity:0.5,size:36,type:'digital',showSeconds:false},hiddenItems:{news:{},upcoming:{}},watchedItems:{news:{},upcoming:{}},watchlist:[],searchHistory:[],viewHistory:[],providerOrder:[],newsLastTab:'movies',upcomingLastTab:'movies',designOptions:{cardRadius:14,sidebarWidth:200,cardShadow:true,glass:false,fontFamily:'DM Sans'},customProviders:{},deletedProviders:[],notificationsConfig:{streamBreak:true},watchedContentList:[],onboardingDone:false};
ipcMain.handle('get-theme',()=>store.get('theme','dark'));
ipcMain.on('set-theme',(_,v)=>store.set('theme',v));
ipcMain.handle('get-settings',()=>({...DEFS,...store.get('settings',{})}));
let _settingsWritePending=false;
ipcMain.on('set-settings',(_,v)=>{ if(!checkRateLimit('set-settings'))return;
  if(_settingsWritePending)return;
  _settingsWritePending=true;
  setImmediate(()=>{store.set('settings',v);_settingsWritePending=false;});
});
ipcMain.handle('get-profiles',()=>store.get('profiles',[{id:'default',name:'User',favorites:[],watchlist:[],searchHistory:[],viewHistory:[]}]));
let _profilesWritePending=false;
ipcMain.on('set-profiles',(_,v)=>{
  if(_profilesWritePending)return;
  _profilesWritePending=true;
  setImmediate(()=>{store.set('profiles',v);_profilesWritePending=false;});
});
ipcMain.handle('get-active-profile',()=>store.get('activeProfile','default'));
ipcMain.on('set-active-profile',(_,id)=>{if(!validateString(id,64))return;store.set('activeProfile',id);});

// ── IPC: NOTIFICATIONS (persistent) ──────────────────────────────
ipcMain.handle('get-notifications',(_,profileId)=>store.get(`notifications_${profileId}`||'notifications_default',[]));
ipcMain.on('set-notifications',(_,{profileId,list})=>{
  if(!validateString(profileId,64)||!Array.isArray(list))return;
  store.set(`notifications_${profileId}`,list.slice(0,100));
});

// ── IPC: NOTIFICATION (system) ────────────────────────────────────
ipcMain.on('show-notification',(_,{title,body})=>{if(Notification.isSupported())new Notification({title,body,icon:path.join(__dirname,'assets','icon.png')}).show();});

// ── IPC: IMAGE PICKER ─────────────────────────────────────────────
ipcMain.handle('pick-image',async(_,dest)=>{
  if(!validateString(dest,128))return null;
  const r=await dialog.showOpenDialog(mainWindow,{title:'Bild',filters:[{name:'Bilder',extensions:['jpg','jpeg','png','gif','webp']}],properties:['openFile']});
  if(r.canceled||!r.filePaths.length)return null;
  const src=r.filePaths[0];const dir=path.join(app.getPath('userData'),'userImages');
  if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});
  const fn=`${dest}_${Date.now()}${path.extname(src)}`;const dp=path.join(dir,fn);
  fs.copyFileSync(src,dp);
  // Bild auch als Base64 zurückgeben für robuste Speicherung
  const b64=fs.readFileSync(dp).toString('base64');
  const mime={'jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png','gif':'image/gif','webp':'image/webp'}[path.extname(src).slice(1).toLowerCase()]||'image/png';
  return{filePath:`file://${dp.replace(/\\/g,'/')}`,base64:`data:${mime};base64,${b64}`};
});

// ── IPC: SESSIONS ─────────────────────────────────────────────────
const LOGIN_CHECKS={
  netflix:{url:'https://www.netflix.com',names:['NetflixId','nfvdid']},
  prime:{url:'https://www.amazon.de',names:['session-id','ubid-acbde']},
  disney:{url:'https://www.disneyplus.com',names:['BAMAccountToken','BAMSDK','access_token']},
  crunchyroll:{url:'https://www.crunchyroll.com',names:['etp_rt','akamai_a2_res']},
  burning:{url:'https://bs.to',names:['_token','laravel_session']},
  cineto:{url:'https://cine.to',names:['PHPSESSID']},
  youtube:{url:'https://www.youtube.com',names:['LOGIN_INFO','SAPISID']},
  twitch:{url:'https://www.twitch.tv',names:['auth-token','persistent']},
  dazn:{url:'https://www.dazn.com',names:['usr','__Secure-authToken']},
  hbomax:{url:'https://www.max.com',names:['hbo_session','profile_type']},
  joyn:{url:'https://www.joyn.de',names:['joyn_session','JSESSIONID']},
  ard:{url:'https://www.ardmediathek.de',names:['ard_sso_session']},
  zdf:{url:'https://www.zdf.de',names:['sso','zdf_session']},
  paramountplus:{url:'https://www.paramountplus.com',names:['PVFW','PV_FW_SESSION']},
  skygo:{url:'https://www.sky.de',names:['skySession']},
  mubi:{url:'https://mubi.com',names:['_session']},
  apple:{url:'https://tv.apple.com',names:['myacinfo']},
  rtl:{url:'https://plus.rtl.de',names:['rtl_token']},
  spotify:{url:'https://open.spotify.com',names:['sp_dc','sp_key']},
  waipu:{url:'https://www.waipu.tv',names:['waipu_auth']},
  wow:{url:'https://www.wowtv.de',names:['wow_session']},
  magenta:{url:'https://www.magentatv.de',names:['TelekomAccount']},
  movie2k:{url:'https://movie2k.ch',names:['PHPSESSID','cf_clearance']},
  arte:{url:'https://www.arte.tv',names:['arte_profile_session']},
  adn:{url:'https://www.animedigitalnetwork.de',names:['access_token']},
};

async function checkAllSessions(profileId='default'){
  const result={};
  for(const[id,check]of Object.entries(LOGIN_CHECKS)){
    try{const ses=session.fromPartition(`persist:${profileId}_${id}`);let found=false;for(const name of check.names){const c=await ses.cookies.get({url:check.url,name});if(c.length>0){found=true;break;}}result[id]=found;}catch{result[id]=false;}
  }
  return result;
}

ipcMain.handle('get-all-sessions',async(_,p)=>checkAllSessions(p));
ipcMain.on('refresh-sessions-now',async(_,p)=>{const r=await checkAllSessions(p);mainWindow?.webContents.send('sessions-updated',r);});
ipcMain.on('clear-all-sessions',async(_,p)=>{for(const id of Object.keys(LOGIN_CHECKS))try{await session.fromPartition(`persist:${p}_${id}`).clearStorageData();}catch{}mainWindow?.webContents.send('sessions-cleared');});
ipcMain.on('clear-provider-session',async(_,p,id)=>{try{await session.fromPartition(`persist:${p}_${id}`).clearStorageData();}catch{}});
ipcMain.on('clear-providers-sessions',async(_,p,ids)=>{for(const id of ids)try{await session.fromPartition(`persist:${p}_${id}`).clearStorageData();}catch{}const r=await checkAllSessions(p);mainWindow?.webContents.send('sessions-updated',r);});
ipcMain.on('setup-webview-session',(_,partition)=>setupSession(session.fromPartition(partition)));

// ── IPC: GOOGLE AUTH ──────────────────────────────────────────────
ipcMain.on('open-google-auth-browser',(_,profileId)=>{
  const partition=`persist:${profileId}_youtube`;
  const w=new BrowserWindow({width:500,height:700,title:'Google-Anmeldung',webPreferences:{session:session.fromPartition(partition),contextIsolation:true,webSecurity:false}});
  session.fromPartition(partition).setUserAgent(UA);
  w.loadURL('https://accounts.google.com/signin/v2/identifier?service=youtube&hl=de&continue=https%3A%2F%2Fwww.youtube.com');
  w.webContents.on('did-navigate',async(_,url)=>{if(url.includes('youtube.com')&&!url.includes('accounts.google')){w.close();mainWindow?.webContents.send('google-auth-done');const r=await checkAllSessions(profileId);mainWindow?.webContents.send('sessions-updated',r);}});
});

// ── IPC: VPN ──────────────────────────────────────────────────────
ipcMain.handle('check-vpn',async()=>{try{const r=await session.defaultSession.fetch('https://ipapi.co/json/',{headers:{'User-Agent':UA}});const d=await r.json();return{ip:d.ip,country:d.country_name,city:d.city,org:d.org,isVpn:!!(d.org?.toLowerCase().includes('vpn')||d.org?.toLowerCase().includes('proxy'))};}catch(e){return{error:e.message};}});

// ── IPC: STREAM STATS ─────────────────────────────────────────────
ipcMain.on('record-watch-time',(_,{providerId,seconds,profileId='default'})=>{
  if(!validateString(providerId,64)||!validateNumber(seconds,0,7200)||!validateString(profileId,64))return;const k=`streamStats_${profileId}`;const s=store.get(k,{});if(!s[providerId])s[providerId]={total:0,byDay:[0,0,0,0,0,0,0]};s[providerId].total+=seconds;s[providerId].byDay[new Date().getDay()]=(s[providerId].byDay[new Date().getDay()]||0)+seconds;store.set(k,s);});
ipcMain.handle('get-stream-stats',(_,p='default')=>store.get(`streamStats_${p}`,{}));

// ── IPC: WATCHED CONTENT ──────────────────────────────────────────
ipcMain.handle('get-watched-content',(_,p='default')=>store.get(`watchedContent_${p}`,[]));
ipcMain.on('set-watched-content',(_,{profileId,list})=>store.set(`watchedContent_${profileId}`,list));

// ── IPC: MULTI-WINDOW ─────────────────────────────────────────────
const secondWindows={};
ipcMain.handle('open-second-window',async(_,{url,partition,title})=>{
  const key=partition||url;
  if(secondWindows[key]&&!secondWindows[key].isDestroyed()){secondWindows[key].focus();return'focused';}
  const win=new BrowserWindow({width:800,height:600,title:title||'OmniSight',icon:path.join(__dirname,'assets','icon.png'),webPreferences:{webviewTag:true,webSecurity:false,allowRunningInsecureContent:true}});
  const html=`<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src * data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'"><style>*{margin:0}body{background:#000;height:100vh;display:flex}webview{flex:1}</style></head><body><webview src="${url}" partition="${partition||''}" useragent="${UA}" allowpopups style="width:100%;flex:1"></webview></body></html>`;
  const tmp=path.join(app.getPath('temp'),`omnisight_${Date.now()}.html`);fs.writeFileSync(tmp,html);
  win.loadFile(tmp);if(partition)setupSession(session.fromPartition(partition));
  win.on('closed',()=>delete secondWindows[key]);secondWindows[key]=win;return'opened';
});

// ── IPC: ADBLOCK ──────────────────────────────────────────────────
ipcMain.handle('fetch-adblock-list',async(_,url)=>{
  try{const r=await session.defaultSession.fetch(url,{headers:{'User-Agent':UA}});const text=await r.text();const domains=[];
  text.split('\n').forEach(line=>{line=line.trim();if(!line||line.startsWith('!')||line.startsWith('#'))return;const m1=line.match(/^\|\|([a-z0-9._-]+)\^/);if(m1){domains.push(m1[1]);return;}const m2=line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9._-]+)$/);if(m2&&m2[1]!=='localhost')domains.push(m2[1]);});
  return{ok:true,count:domains.length,domains:domains.slice(0,15000)};}catch(e){return{ok:false,error:e.message};}
});
ipcMain.on('apply-extra-ad-domains',(_,d)=>store.set('extraAdDomains',d));
ipcMain.handle('get-extra-ad-domains',()=>store.get('extraAdDomains',[]));

// ── IPC: WIDEVINE ─────────────────────────────────────────────────
ipcMain.handle('get-widevine-status',()=>{
  const userData = app.getPath('userData');
  const cdmDir = path.join(userData, 'WidevineCdm', '_platform_specific', 'win_x64');
  const dllPath = path.join(cdmDir, 'widevinecdm.dll');
  // Ordner sicherstellen
  if (!fs.existsSync(cdmDir)) {
    try { fs.mkdirSync(cdmDir, { recursive: true }); } catch {}
  }
  if (fs.existsSync(dllPath)) return { installed: true, path: dllPath, cdmDir };
  return { installed: false, cdmDir };
});

// ── IPC: TMDB ─────────────────────────────────────────────────────
const TKEY='2dca580c2a14b55200e784d157207b4d',TBASE='https://api.themoviedb.org/3';
async function tmdb(p,x=''){const r=await session.defaultSession.fetch(`${TBASE}${p}?api_key=${TKEY}&language=de-DE${x}`,{headers:{'User-Agent':UA}});return r.json();}

ipcMain.handle('get-trending',async()=>{try{const[m,s,a]=await Promise.all([tmdb('/trending/movie/week','&region=DE'),tmdb('/trending/tv/week','&without_genres=16'),tmdb('/discover/tv','&with_genres=16&sort_by=popularity.desc')]);return{movies:(m.results||[]).filter(i=>i.poster_path).slice(0,25),shows:(s.results||[]).filter(i=>i.poster_path).slice(0,25),anime:(a.results||[]).filter(i=>i.poster_path).slice(0,25)};}catch(e){return{error:e.message};}});
ipcMain.handle('get-new-releases',async()=>{try{const[m,s,a]=await Promise.all([tmdb('/movie/now_playing','&region=DE'),tmdb('/tv/on_the_air','&watch_region=DE&without_genres=16'),tmdb('/discover/tv','&with_genres=16&sort_by=first_air_date.desc')]);return{movies:(m.results||[]).filter(i=>i.poster_path).slice(0,25),shows:(s.results||[]).filter(i=>i.poster_path).slice(0,25),anime:(a.results||[]).filter(i=>i.poster_path).slice(0,25)};}catch(e){return{error:e.message};}});
ipcMain.handle('get-upcoming',async(_,months=1)=>{try{const today=new Date(),future=new Date(today);future.setMonth(today.getMonth()+months);const fmt=d=>d.toISOString().split('T')[0];const[gte,lte]=[fmt(today),fmt(future)];const[m,s,a1,a2]=await Promise.all([tmdb('/discover/movie',`&region=DE&with_release_type=3|2&release_date.gte=${gte}&release_date.lte=${lte}&sort_by=release_date.asc`),tmdb('/discover/tv',`&watch_region=DE&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc&without_genres=16`),tmdb('/discover/tv',`&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc`),tmdb('/discover/tv',`&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=popularity.desc&page=2`)]);const anime=[...(a1.results||[]),...(a2.results||[])].filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i);return{movies:(m.results||[]).filter(i=>i.poster_path).slice(0,30),shows:(s.results||[]).filter(i=>i.poster_path).slice(0,30),anime:anime.filter(i=>i.poster_path).slice(0,30)};}catch(e){return{error:e.message};}});
ipcMain.handle('get-tmdb-detail',async(_,{id,type})=>{try{const[detail,videos,providers]=await Promise.all([tmdb(`/${type}/${id}`,'&append_to_response=credits'),tmdb(`/${type}/${id}/videos`),tmdb(`/${type}/${id}/watch/providers`)]);return{detail,videos:videos.results||[],providers:providers.results?.DE||null};}catch(e){return{error:e.message};}});
ipcMain.handle('search-tmdb',async(_,query)=>{try{const r=await tmdb('/search/multi',`&query=${encodeURIComponent(query)}&include_adult=false`);return{results:r.results||[],total:r.total_results||0};}catch{return{results:[],total:0};}});
ipcMain.handle('get-streaming-providers',async(_,{tmdbId,type})=>{try{const r=await tmdb(`/${type}/${tmdbId}/watch/providers`);return r.results?.DE||null;}catch{return null;}});

ipcMain.handle('get-providers-list',()=>null); // handled in renderer
ipcMain.handle('get-watchlist-releases',async(_,watchlistIds)=>{try{const today=new Date().toISOString().split('T')[0];const results=[];for(const{tmdbId,tmdbType,title}of watchlistIds.slice(0,10)){const r=await tmdb(`/${tmdbType}/${tmdbId}`,'');const rd=r.release_date||r.first_air_date||'';if(rd===today)results.push({title,tmdbId,tmdbType});}return results;}catch{return[];}});
ipcMain.handle('export-settings',async()=>{
  const data={settings:store.get('settings',{}),profiles:store.get('profiles',[]),activeProfile:store.get('activeProfile','default'),theme:store.get('theme','dark')};
  const r=await dialog.showSaveDialog(mainWindow,{title:'Einstellungen exportieren',defaultPath:'omnisight-backup.json',filters:[{name:'JSON',extensions:['json']}]});
  if(r.canceled||!r.filePath)return{ok:false};
  fs_.writeFileSync(r.filePath,JSON.stringify(data,null,2));return{ok:true,path:r.filePath};
});
ipcMain.handle('import-settings',async()=>{
  const r=await dialog.showOpenDialog(mainWindow,{title:'Einstellungen importieren',filters:[{name:'JSON',extensions:['json']}],properties:['openFile']});
  if(r.canceled||!r.filePaths.length)return{ok:false};
  try{const data=JSON.parse(fs_.readFileSync(r.filePaths[0],'utf8'));
    if(data.settings)store.set('settings',data.settings);
    if(data.profiles)store.set('profiles',data.profiles);
    if(data.activeProfile)store.set('activeProfile',data.activeProfile);
    if(data.theme)store.set('theme',data.theme);
    return{ok:true};}catch(e){return{ok:false,error:e.message};}
});
ipcMain.handle('get-app-version',()=>require('./package.json').version);
ipcMain.handle('check-online',async()=>{try{await session.defaultSession.fetch('https://www.google.com',{method:'HEAD'});return true;}catch{return false;}});
ipcMain.handle('check-url',async(_,url)=>{try{const r=await session.defaultSession.fetch(url,{method:'HEAD',headers:{'User-Agent':UA}});return{ok:true,status:r.status};}catch(e){return{ok:false,error:e.message};}});
ipcMain.on('open-external',(_,url)=>shell.openExternal(url));

app.whenReady().then(()=>{
  // WideVine Ordner IMMER beim Start anlegen
  try { setupWidevineDir(); } catch(e) { console.warn('[WideVine] Ordner-Fehler:', e.message); }
  setupCrashReporter();
  createMainWindow();
});

// Beim Beenden: Daten-Lösch-Dialog (für Deinstallation)
app.on('will-quit', (e) => {
  // Nur anzeigen wenn explizit deinstalliert wird (schwer zu erkennen)
  // Alternative: Spezielle --uninstall flag
  if (process.argv.includes('--uninstall')) {
    e.preventDefault();
    const choice = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Daten löschen?',
      message: 'Möchtest du alle OmniSight-Daten löschen?\nDazu gehören Profile, Watchlist, Einstellungen und Sessions.',
      buttons: ['Ja, alles löschen', 'Nein, behalten'],
      defaultId: 1,
      cancelId: 1
    });
    if (choice === 0) {
      try {
        const userDataPath = app.getPath('userData');
        const fs_local = require('fs');
        if (fs_local.existsSync(userDataPath)) {
          fs_local.rmSync(userDataPath, { recursive: true, force: true });
        }
      } catch(e) { console.error('Fehler beim Löschen:', e); }
    }
    app.quit();
  }
});

app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
