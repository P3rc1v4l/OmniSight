const { app, BrowserWindow, ipcMain, session, shell, dialog, Notification, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

// ── Auto-Updater ──────────────────────────────────────────────────
let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', info);
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded');
  });
} catch {}

// ── UA ────────────────────────────────────────────────────────────
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── Ad-block ──────────────────────────────────────────────────────
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
  'ad.doubleclick.net','amazon-adsystem.com','media.net',
  'revcontent.com','mgid.com','bidswitch.net','rlcdn.com',
  '33across.com','sharethrough.com','indexww.com','appnexus.com',
  'contextweb.com','emxdgt.com','sovrn.com','lijit.com',
];

function getAdDomains() {
  return [...new Set([...DEFAULT_AD_DOMAINS, ...store.get('extraAdDomains',[])])];
}

function isAd(url) {
  try { const h=new URL(url).hostname; return getAdDomains().some(d=>h===d||h.endsWith('.'+d)); }
  catch { return false; }
}

// ── Session setup ─────────────────────────────────────────────────
function setupSession(ses) {
  ses.setCertificateVerifyProc((_,cb)=>cb(0));
  ses.setUserAgent(CHROME_UA);
  try { ses.webRequest.onBeforeRequest({urls:['<all_urls>']}, (d,cb)=>cb({cancel:isAd(d.url)})); } catch {}
  try {
    ses.webRequest.onBeforeSendHeaders({urls:['<all_urls>']}, (d,cb)=>{
      const h=d.requestHeaders;
      h['User-Agent']=CHROME_UA; h['Accept-Language']='de-DE,de;q=0.9,en-US;q=0.8';
      h['Accept']='text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
      h['Sec-Ch-Ua']='"Chromium";v="124","Google Chrome";v="124","Not-A.Brand";v="99"';
      h['Sec-Ch-Ua-Mobile']='?0'; h['Sec-Ch-Ua-Platform']='"Windows"';
      delete h['X-Frame-Options'];
      cb({requestHeaders:h});
    });
  } catch {}
  try {
    ses.webRequest.onHeadersReceived({urls:['<all_urls>']}, (d,cb)=>{
      const h=d.responseHeaders||{};
      for (const k of Object.keys(h)) {
        const l=k.toLowerCase();
        if(['x-frame-options','content-security-policy','x-content-type-options','strict-transport-security','x-xss-protection'].includes(l)) delete h[k];
      }
      cb({responseHeaders:h});
    });
  } catch {}
}

// ── Window ────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:1380, height:880, minWidth:820, minHeight:520,
    frame:false, backgroundColor:'#0a0a0f',
    icon: path.join(__dirname,'assets','icon.png'),
    webPreferences:{
      nodeIntegration:false, contextIsolation:true,
      preload:path.join(__dirname,'preload.js'),
      webviewTag:true, webSecurity:false, allowRunningInsecureContent:true,
    },
  });
  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname,'index.html'));
  mainWindow.on('closed',()=>{mainWindow=null;app.quit();});
  mainWindow.on('enter-full-screen',()=>mainWindow.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen', ()=>mainWindow.webContents.send('fullscreen-change',false));
  // Auto-Update check nach 3s
  setTimeout(()=>{ try{autoUpdater?.checkForUpdates();}catch{} },3000);
}

// ── IPC: Window ───────────────────────────────────────────────────
ipcMain.on('window-minimize',   ()=>mainWindow?.minimize());
ipcMain.on('window-maximize',   ()=>mainWindow?.isMaximized()?mainWindow.unmaximize():mainWindow?.maximize());
ipcMain.on('window-close',      ()=>mainWindow?.close());
ipcMain.on('window-fullscreen', (_,f)=>mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', ()=>mainWindow?.isFullScreen()??false);
ipcMain.on('install-update',    ()=>autoUpdater?.quitAndInstall());

// ── IPC: Settings & Profiles ─────────────────────────────────────
const DEFAULT_SETTINGS = {
  appBgImage:'', accentColor:'#30c5bb', cardImages:{}, cardImageOffsets:{},
  logoImage:'', favorites:[], fontSize:14, cardLayout:'normal',
  customCSS:'', language:'de', particlesEnabled:false,
  clock:{enabled:false,position:{x:16,y:52},color:'#ffffff',opacity:0.85,size:22},
  plugins:[], hiddenItems:{news:{},upcoming:{}},
  watchlist:[], searchHistory:[], viewHistory:[],
  profiles:[{id:'default',name:'Standard',favorites:[],watchlist:[],searchHistory:[],viewHistory:[]}],
  activeProfile:'default',
  providerOrder:[],
};

ipcMain.handle('get-theme',    ()=>store.get('theme','dark'));
ipcMain.on('set-theme',        (_,v)=>store.set('theme',v));
ipcMain.handle('get-settings', ()=>store.get('settings',DEFAULT_SETTINGS));
ipcMain.on('set-settings',     (_,v)=>store.set('settings',v));

// Profiles
ipcMain.handle('get-profiles', ()=>store.get('profiles',[{id:'default',name:'Standard',favorites:[],watchlist:[],searchHistory:[],viewHistory:[]}]));
ipcMain.on('set-profiles',     (_,v)=>store.set('profiles',v));
ipcMain.handle('get-active-profile', ()=>store.get('activeProfile','default'));
ipcMain.on('set-active-profile',     (_,id)=>store.set('activeProfile',id));

// ── IPC: Notifications ────────────────────────────────────────────
ipcMain.on('show-notification', (_,{title,body})=>{
  if (Notification.isSupported()) {
    new Notification({title,body,icon:path.join(__dirname,'assets','icon.png')}).show();
  }
});

// ── IPC: Pick image ───────────────────────────────────────────────
ipcMain.handle('pick-image', async (_,dest)=>{
  const r=await dialog.showOpenDialog(mainWindow,{title:'Bild auswählen',filters:[{name:'Bilder',extensions:['jpg','jpeg','png','gif','webp','svg']}],properties:['openFile']});
  if(r.canceled||!r.filePaths.length) return null;
  const src=r.filePaths[0]; const dir=path.join(app.getPath('userData'),'userImages');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const fn=`${dest}_${Date.now()}${path.extname(src)}`, dp=path.join(dir,fn);
  fs.copyFileSync(src,dp); return `file://${dp.replace(/\\/g,'/')}`;
});

// ── IPC: Sessions ─────────────────────────────────────────────────
const LOGIN_CHECKS = {
  netflix:{url:'https://www.netflix.com',name:'NetflixId'},
  prime:{url:'https://www.amazon.de',name:'session-id'},
  disney:{url:'https://www.disneyplus.com',name:'BAMAccountToken'},
  crunchyroll:{url:'https://www.crunchyroll.com',name:'etp_rt'},
  burning:{url:'https://bs.to',name:'_token'},
  cineto:{url:'https://cine.to',name:'PHPSESSID'},
  youtube:{url:'https://www.youtube.com',name:'LOGIN_INFO'},
  twitch:{url:'https://www.twitch.tv',name:'auth-token'},
  dazn:{url:'https://www.dazn.com',name:'usr'},
  hbomax:{url:'https://www.max.com',name:'hbo_session'},
  joyn:{url:'https://www.joyn.de',name:'joyn_session'},
  ard:{url:'https://www.ardmediathek.de',name:'ard_sso_session'},
  zdf:{url:'https://www.zdf.de',name:'sso'},
  paramountplus:{url:'https://www.paramountplus.com',name:'PVFW'},
  skygo:{url:'https://www.sky.de',name:'skySession'},
  mubi:{url:'https://mubi.com',name:'_session'},
  apple:{url:'https://tv.apple.com',name:'myacinfo'},
  rtl:{url:'https://plus.rtl.de',name:'rtl_token'},
};

ipcMain.handle('get-all-sessions', async()=>{
  const res={};
  for(const [id,c] of Object.entries(LOGIN_CHECKS)){
    try{ const ses=session.fromPartition(`persist:${id}`); const cookies=await ses.cookies.get({url:c.url,name:c.name}); res[id]=cookies.length>0; }
    catch{ res[id]=false; }
  }
  return res;
});

// Verbesserte Session-Prüfung: Seiteninhalt checken
ipcMain.handle('check-session-content', async(_,{id,url,selector})=>{
  try {
    const ses=session.fromPartition(`persist:${id}`);
    const r=await ses.fetch(url,{headers:{'User-Agent':CHROME_UA,'Cookie':''}});
    const html=await r.text();
    // Einfacher Heuristik: Check auf Login-Indikatoren im HTML
    const loggedInIndicators=['sign-out','logout','mein konto','my account','account','profile','profilbild'];
    const loggedOutIndicators=['sign-in','anmelden','login','log in','register','registrieren'];
    const lower=html.toLowerCase();
    const hasIn=loggedInIndicators.some(s=>lower.includes(s));
    const hasOut=loggedOutIndicators.some(s=>lower.includes(s));
    if(hasIn&&!hasOut) return 'logged-in';
    if(hasOut&&!hasIn) return 'logged-out';
    return 'unknown';
  } catch(e){ return 'error'; }
});

ipcMain.on('clear-all-sessions',async()=>{
  for(const id of Object.keys(LOGIN_CHECKS)) try{await session.fromPartition(`persist:${id}`).clearStorageData();}catch{}
  mainWindow?.webContents.send('sessions-cleared');
});
ipcMain.on('clear-provider-session',async(_,id)=>{ try{await session.fromPartition(`persist:${id}`).clearStorageData();}catch{}; });
ipcMain.on('setup-webview-session',(_,p)=>setupSession(session.fromPartition(p)));

// ── IPC: Connectivity ─────────────────────────────────────────────
ipcMain.handle('check-url',async(_,url)=>{
  try{const r=await session.defaultSession.fetch(url,{method:'HEAD',headers:{'User-Agent':CHROME_UA}});return{ok:true,status:r.status};}
  catch(e){return{ok:false,error:e.message};}
});
ipcMain.handle('check-online',async()=>{
  try{await session.defaultSession.fetch('https://www.google.com',{method:'HEAD',headers:{'User-Agent':CHROME_UA}});return true;}
  catch{return false;}
});

// ── IPC: OMDB ────────────────────────────────────────────────────
const OMDB='trilogy';
ipcMain.handle('search-title',async(_,q)=>{
  try{const r=await session.defaultSession.fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB}`,{headers:{'User-Agent':CHROME_UA}});return await r.json();}
  catch(e){return{Error:e.message};}
});
ipcMain.handle('search-title-detail',async(_,id)=>{
  try{const r=await session.defaultSession.fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB}&plot=full`,{headers:{'User-Agent':CHROME_UA}});return await r.json();}
  catch(e){return{Error:e.message};}
});

// ── IPC: TMDB ─────────────────────────────────────────────────────
const TMDB_KEY='2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE='https://api.themoviedb.org/3';
async function tmdb(p,extra=''){
  const r=await session.defaultSession.fetch(`${TMDB_BASE}${p}?api_key=${TMDB_KEY}&language=de-DE${extra}`,{headers:{'User-Agent':CHROME_UA}});
  return r.json();
}

ipcMain.handle('get-trending',async()=>{
  try{
    const [m,s]=await Promise.all([tmdb('/trending/movie/week','&region=DE'),tmdb('/trending/tv/week')]);
    return{movies:m.results?.slice(0,20)||[],shows:s.results?.slice(0,20)||[]};
  }catch(e){return{error:e.message};}
});
ipcMain.handle('get-new-releases',async()=>{
  try{
    const [m,s]=await Promise.all([tmdb('/movie/now_playing','&region=DE'),tmdb('/tv/on_the_air','&watch_region=DE')]);
    return{movies:m.results?.slice(0,20)||[],shows:s.results?.slice(0,20)||[]};
  }catch(e){return{error:e.message};}
});

// Upcoming mit flexiblem Zeitraum
ipcMain.handle('get-upcoming',async(_,months=1)=>{
  try{
    const today=new Date();
    const future=new Date(today); future.setMonth(today.getMonth()+months);
    const fmt=d=>d.toISOString().split('T')[0];
    const [m,s]=await Promise.all([
      tmdb('/discover/movie',`&region=DE&primary_release_date.gte=${fmt(today)}&primary_release_date.lte=${fmt(future)}&sort_by=primary_release_date.asc`),
      tmdb('/discover/tv',`&watch_region=DE&first_air_date.gte=${fmt(today)}&first_air_date.lte=${fmt(future)}&sort_by=first_air_date.asc`),
    ]);
    return{movies:m.results?.slice(0,30)||[],shows:s.results?.slice(0,30)||[]};
  }catch(e){return{error:e.message};}
});

// TMDB Detail (für Popups)
ipcMain.handle('get-tmdb-detail',async(_,{id,type})=>{
  try{
    const [detail,videos,providers]=await Promise.all([
      tmdb(`/${type}/${id}`,'&append_to_response=credits'),
      tmdb(`/${type}/${id}/videos`),
      tmdb(`/${type}/${id}/watch/providers`),
    ]);
    return{detail,videos:videos.results||[],providers:providers.results?.DE||null};
  }catch(e){return{error:e.message};}
});

// ── IPC: Ad-block extra domains ───────────────────────────────────
ipcMain.handle('fetch-adblock-list',async(_,url)=>{
  try{
    const r=await session.defaultSession.fetch(url,{headers:{'User-Agent':CHROME_UA}});
    const text=await r.text(); const domains=[];
    text.split('\n').forEach(line=>{
      line=line.trim(); if(!line||line.startsWith('!')||line.startsWith('#')) return;
      const m1=line.match(/^\|\|([a-z0-9._-]+)\^/); if(m1){domains.push(m1[1]);return;}
      const m2=line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9._-]+)$/); if(m2&&m2[1]!=='localhost') domains.push(m2[1]);
    });
    return{ok:true,count:domains.length,domains:domains.slice(0,10000)};
  }catch(e){return{ok:false,error:e.message};}
});
ipcMain.on('apply-extra-ad-domains',(_,d)=>store.set('extraAdDomains',d));
ipcMain.handle('get-extra-ad-domains',()=>store.get('extraAdDomains',[]));

// ── IPC: Chrome Extensions (Info) ────────────────────────────────
// Electron kann CRX-Extensions nicht direkt laden ohne Spezial-Build.
// Wir öffnen stattdessen die Chrome-Webstore-Seite im Browser.
ipcMain.on('open-chrome-extension',(_,url)=>shell.openExternal(url));

ipcMain.on('open-external',(_,url)=>shell.openExternal(url));

// ── Start ─────────────────────────────────────────────────────────
app.whenReady().then(createMainWindow);
app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit(); });
