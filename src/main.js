const { app, BrowserWindow, ipcMain, session, shell, dialog, Notification, net } = require('electron');
const path = require('path');
const fs   = require('fs');
const Store = require('electron-store');
const store = new Store();

let mainWindow;
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ════════════════════════════════════════
// WIDEVINE CDM SETUP
// Lädt Widevine CDM automatisch falls vorhanden.
// Für vollständige DRM-Unterstützung (Netflix/Disney/etc.) wird ein
// Widevine-fähiger Electron-Build benötigt (z.B. castLabs).
// Das CDM kann unter: https://github.com/nicehash/electron-widevinecdm
// heruntergeladen und in userData/WidevineCdm abgelegt werden.
// ════════════════════════════════════════
function setupWidevine() {
  const cdmDir = path.join(app.getPath('userData'), 'WidevineCdm');
  // Suche CDM-Datei in verschiedenen Formaten
  const cdmFiles = ['widevinecdm.dll', 'libwidevinecdm.so', 'libwidevinecdm.dylib'];
  let cdmFound = false;
  for (const f of cdmFiles) {
    const p = path.join(cdmDir, f);
    if (fs.existsSync(p)) {
      try {
        app.commandLine.appendSwitch('widevine-cdm-path', p);
        app.commandLine.appendSwitch('widevine-cdm-version', '4.10.2662.0');
        cdmFound = true;
        console.log('[Widevine] CDM geladen:', p);
      } catch(e) { console.log('[Widevine] Fehler:', e.message); }
      break;
    }
  }
  if (!cdmFound) console.log('[Widevine] CDM nicht gefunden – DRM-Inhalte nicht verfügbar');
  // Allgemeine Flags für bessere Kompatibilität
  app.commandLine.appendSwitch('enable-features', 'PlatformEncryptedDolbyVision,WidevineCdm');
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,BlockInsecurePrivateNetworkRequests');
  app.commandLine.appendSwitch('ignore-certificate-errors');
  app.commandLine.appendSwitch('allow-insecure-localhost');
  app.commandLine.appendSwitch('disable-web-security');
}
setupWidevine();

// ════════════════════════════════════════
// AD-BLOCK
// ════════════════════════════════════════
const DEFAULT_AD_DOMAINS = [
  'doubleclick.net','googlesyndication.com','googletagmanager.com','google-analytics.com',
  'adnxs.com','adsrvr.org','advertising.com','scorecardresearch.com','quantserve.com',
  'outbrain.com','taboola.com','pubmatic.com','rubiconproject.com','openx.net','criteo.com',
  'casalemedia.com','moatads.com','adtech.de','spotxchange.com','smartadserver.com',
  'adsafeprotected.com','doubleverify.com','imasdk.googleapis.com',
  'pagead2.googlesyndication.com','adservice.google.com','securepubads.g.doubleclick.net',
  'ads.crunchyroll.com','fundingchoicesmessages.google.com','amazon-adsystem.com',
  'media.net','revcontent.com','mgid.com','bidswitch.net','appnexus.com',
];
function getAdDomains() { return [...new Set([...DEFAULT_AD_DOMAINS, ...store.get('extraAdDomains',[])])]; }
function isAd(url) { try { const h=new URL(url).hostname; return getAdDomains().some(d=>h===d||h.endsWith('.'+d)); } catch { return false; } }

// ════════════════════════════════════════
// SESSION SETUP
// ════════════════════════════════════════
function setupSession(ses) {
  ses.setCertificateVerifyProc((_,cb)=>cb(0));
  ses.setUserAgent(CHROME_UA);
  try { ses.webRequest.onBeforeRequest({urls:['<all_urls>']}, (d,cb)=>cb({cancel:isAd(d.url)})); } catch {}
  try {
    ses.webRequest.onBeforeSendHeaders({urls:['<all_urls>']}, (d,cb)=>{
      const h=d.requestHeaders;
      h['User-Agent']=CHROME_UA;
      h['Accept-Language']='de-DE,de;q=0.9,en-US;q=0.8';
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
        if(['x-frame-options','content-security-policy','x-content-type-options',
            'strict-transport-security','x-xss-protection'].includes(l)) delete h[k];
      }
      cb({responseHeaders:h});
    });
  } catch {}
}

// ════════════════════════════════════════
// WINDOW
// ════════════════════════════════════════
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:1400, height:900, minWidth:820, minHeight:520,
    frame:false,
    show:false, // erst anzeigen wenn bereit → dann maximiert
    backgroundColor:'#0a0a0f',
    icon: path.join(__dirname,'assets','icon.ico'),
    webPreferences:{
      nodeIntegration:false, contextIsolation:true,
      preload:path.join(__dirname,'preload.js'),
      webviewTag:true, webSecurity:false,
      allowRunningInsecureContent:true,
    },
  });

  setupSession(session.defaultSession);
  mainWindow.loadFile(path.join(__dirname,'index.html'));

  // Maximiert starten
  mainWindow.once('ready-to-show', ()=>{
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', ()=>{ mainWindow=null; app.quit(); });
  mainWindow.on('enter-full-screen', ()=>mainWindow.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen',  ()=>mainWindow.webContents.send('fullscreen-change',false));

  // Auto-Updater
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = false;
    autoUpdater.on('update-available', info=>mainWindow?.webContents.send('update-available',info));
    autoUpdater.on('update-downloaded',    ()=>mainWindow?.webContents.send('update-downloaded'));
    setTimeout(()=>{ try{autoUpdater.checkForUpdates();}catch{} },5000);
  } catch {}
}

// ════════════════════════════════════════
// IPC: WINDOW
// ════════════════════════════════════════
ipcMain.on('window-minimize',   ()=>mainWindow?.minimize());
ipcMain.on('window-maximize',   ()=>mainWindow?.isMaximized()?mainWindow.unmaximize():mainWindow?.maximize());
ipcMain.on('window-close',      ()=>mainWindow?.close());
ipcMain.on('window-fullscreen', (_,f)=>mainWindow?.setFullScreen(f));
ipcMain.handle('window-is-fullscreen', ()=>mainWindow?.isFullScreen()??false);
ipcMain.on('install-update', ()=>{ try{require('electron-updater').autoUpdater.quitAndInstall();}catch{} });
ipcMain.handle('check-for-updates', async ()=>{
  try { const {autoUpdater}=require('electron-updater'); return await autoUpdater.checkForUpdates(); }
  catch(e){ return {error:e.message}; }
});

// ════════════════════════════════════════
// IPC: SETTINGS / PROFILES
// ════════════════════════════════════════
ipcMain.handle('get-theme',    ()=>store.get('theme','dark'));
ipcMain.on('set-theme',        (_,v)=>store.set('theme',v));
ipcMain.handle('get-settings', ()=>store.get('settings',{}));
ipcMain.on('set-settings',     (_,v)=>store.set('settings',v));
ipcMain.handle('get-profiles', ()=>store.get('profiles',[{id:'default',name:'Standardkonto',favorites:[],watchlist:[],searchHistory:[],viewHistory:[],streamStats:{},achievements:[]}]));
ipcMain.on('set-profiles',     (_,v)=>store.set('profiles',v));
ipcMain.handle('get-active-profile', ()=>store.get('activeProfile','default'));
ipcMain.on('set-active-profile',     (_,id)=>store.set('activeProfile',id));

// ════════════════════════════════════════
// IPC: NOTIFICATIONS
// ════════════════════════════════════════
ipcMain.on('show-notification', (_,{title,body})=>{
  if(Notification.isSupported()) new Notification({title,body,icon:path.join(__dirname,'assets','icon.ico')}).show();
});

// ════════════════════════════════════════
// IPC: IMAGE PICKER
// ════════════════════════════════════════
ipcMain.handle('pick-image', async (_,dest)=>{
  const r=await dialog.showOpenDialog(mainWindow,{title:'Bild auswählen',filters:[{name:'Bilder',extensions:['jpg','jpeg','png','gif','webp']}],properties:['openFile']});
  if(r.canceled||!r.filePaths.length) return null;
  const src=r.filePaths[0]; const dir=path.join(app.getPath('userData'),'userImages');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const fn=`${dest}_${Date.now()}${path.extname(src)}`; const dp=path.join(dir,fn);
  fs.copyFileSync(src,dp); return `file://${dp.replace(/\\/g,'/')}`;
});

// ════════════════════════════════════════
// IPC: SESSIONS – pro Profil getrennt
// ════════════════════════════════════════
const LOGIN_CHECKS = {
  netflix:      {url:'https://www.netflix.com',    names:['NetflixId']},
  prime:        {url:'https://www.amazon.de',       names:['session-id']},
  disney:       {url:'https://www.disneyplus.com',  names:['BAMAccountToken','DisneyId','access_token','id_token']},
  crunchyroll:  {url:'https://www.crunchyroll.com', names:['etp_rt']},
  burning:      {url:'https://bs.to',               names:['_token']},
  cineto:       {url:'https://cine.to',             names:['PHPSESSID']},
  youtube:      {url:'https://www.youtube.com',     names:['LOGIN_INFO','SAPISID']},
  twitch:       {url:'https://www.twitch.tv',       names:['auth-token']},
  dazn:         {url:'https://www.dazn.com',        names:['usr']},
  hbomax:       {url:'https://www.max.com',         names:['hbo_session']},
  joyn:         {url:'https://www.joyn.de',         names:['joyn_session']},
  ard:          {url:'https://www.ardmediathek.de', names:['ard_sso_session']},
  zdf:          {url:'https://www.zdf.de',          names:['sso']},
  paramountplus:{url:'https://www.paramountplus.com',names:['PVFW']},
  skygo:        {url:'https://www.sky.de',          names:['skySession']},
  mubi:         {url:'https://mubi.com',            names:['_session']},
  apple:        {url:'https://tv.apple.com',        names:['myacinfo']},
  rtl:          {url:'https://plus.rtl.de',         names:['rtl_token']},
  spotify:      {url:'https://open.spotify.com',    names:['sp_dc']},
};

// Profil-basierte Partition
function getPartition(providerId, profileId) {
  return `persist:${profileId}_${providerId}`;
}

async function checkAllSessions(profileId='default') {
  const res={};
  for(const [id,check] of Object.entries(LOGIN_CHECKS)){
    try{
      const ses=session.fromPartition(getPartition(id,profileId));
      let found=false;
      for(const name of check.names){
        const cookies=await ses.cookies.get({url:check.url,name});
        if(cookies.length>0){found=true;break;}
      }
      res[id]=found;
    }catch{res[id]=false;}
  }
  return res;
}

ipcMain.handle('get-all-sessions', async(_,profileId)=>checkAllSessions(profileId||'default'));
ipcMain.on('refresh-sessions-now', async(_,profileId)=>{
  const result=await checkAllSessions(profileId||'default');
  mainWindow?.webContents.send('sessions-updated',result);
});
ipcMain.on('clear-all-sessions', async(_,profileId)=>{
  const pid=profileId||'default';
  for(const id of Object.keys(LOGIN_CHECKS)){
    try{await session.fromPartition(getPartition(id,pid)).clearStorageData();}catch{}
  }
  mainWindow?.webContents.send('sessions-cleared');
});
ipcMain.on('clear-provider-session', async(_,{providerId,profileId})=>{
  try{await session.fromPartition(getPartition(providerId,profileId||'default')).clearStorageData();}catch{}
});
ipcMain.on('setup-webview-session', (_,partition)=>setupSession(session.fromPartition(partition)));
ipcMain.handle('get-partition', (_,{providerId,profileId})=>getPartition(providerId,profileId||'default'));

// Auto-Refresh alle 60s
let sessionRefreshTimer=null;
app.whenReady().then(()=>{
  sessionRefreshTimer=setInterval(async()=>{
    const pid=store.get('activeProfile','default');
    const result=await checkAllSessions(pid);
    mainWindow?.webContents.send('sessions-updated',result);
  },60000);
});

// ════════════════════════════════════════
// IPC: GOOGLE AUTH via externem Browser
// ════════════════════════════════════════
ipcMain.handle('open-google-auth-browser', async(_,profileId)=>{
  // Öffnet Google Login im Standard-Browser
  // Nach dem Login kann der User zurückkommen und Sessions werden refreshed
  const youtubeUrl='https://accounts.google.com/signin?service=youtube&continue=https%3A%2F%2Fwww.youtube.com';
  await shell.openExternal(youtubeUrl);
  // Warte 30s dann refresh
  setTimeout(async()=>{
    const result=await checkAllSessions(profileId||'default');
    mainWindow?.webContents.send('sessions-updated',result);
    mainWindow?.webContents.send('google-auth-done');
  },30000);
  return true;
});

// ════════════════════════════════════════
// IPC: STREAM STATS
// ════════════════════════════════════════
ipcMain.on('record-watch-time', (_,{providerId,seconds,profileId})=>{
  const key=`streamStats_${profileId||'default'}`;
  const stats=store.get(key,{});
  if(!stats[providerId]) stats[providerId]={total:0,sessions:[]};
  stats[providerId].total=(stats[providerId].total||0)+seconds;
  // Wochentag tracken
  const day=new Date().getDay(); // 0=So, 1=Mo...
  if(!stats[providerId].byDay) stats[providerId].byDay=Array(7).fill(0);
  stats[providerId].byDay[day]=(stats[providerId].byDay[day]||0)+seconds;
  store.set(key,stats);
});
ipcMain.handle('get-stream-stats', (_,profileId)=>store.get(`streamStats_${profileId||'default'}`,{}));

// ════════════════════════════════════════
// IPC: VPN CHECK
// ════════════════════════════════════════
ipcMain.handle('check-vpn', async()=>{
  try{
    const r=await session.defaultSession.fetch('https://ipapi.co/json/',{headers:{'User-Agent':CHROME_UA}});
    const d=await r.json();
    return {ip:d.ip,country:d.country_name,city:d.city,org:d.org,isVpn:!!(d.org?.toLowerCase().includes('vpn')||d.org?.toLowerCase().includes('proxy')||d.org?.toLowerCase().includes('nordvpn'))};
  }catch(e){return{error:e.message};}
});

// ════════════════════════════════════════
// IPC: MULTI-WINDOW
// ════════════════════════════════════════
let secondWindow=null;
ipcMain.handle('open-second-window', async(_,{url,partition,title})=>{
  if(secondWindow&&!secondWindow.isDestroyed()){secondWindow.focus();return 'focused';}
  secondWindow=new BrowserWindow({
    width:800,height:600,minWidth:400,minHeight:300,
    title:title||'OmniSight – Zweiter Stream',
    icon:path.join(__dirname,'assets','icon.ico'),
    webPreferences:{webviewTag:true,webSecurity:false,allowRunningInsecureContent:true},
  });
  setupSession(session.fromPartition(partition||'persist:second'));
  const html=`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;height:100vh;display:flex;flex-direction:column}webview{flex:1;display:flex}</style></head><body><webview src="${url}" partition="${partition}" useragent="${CHROME_UA}" allowpopups style="width:100%;flex:1"></webview></body></html>`;
  const tmp=path.join(app.getPath('temp'),'omnisight_second.html');
  fs.writeFileSync(tmp,html);
  secondWindow.loadFile(tmp);
  secondWindow.maximize();
  secondWindow.on('closed',()=>{secondWindow=null;});
  return 'opened';
});

// ════════════════════════════════════════
// IPC: ADBLOCK LISTS
// ════════════════════════════════════════
ipcMain.handle('fetch-adblock-list', async(_,url)=>{
  try{
    const r=await session.defaultSession.fetch(url,{headers:{'User-Agent':CHROME_UA}});
    const text=await r.text(); const domains=[];
    text.split('\n').forEach(line=>{
      line=line.trim(); if(!line||line.startsWith('!')||line.startsWith('#')) return;
      const m1=line.match(/^\|\|([a-z0-9._-]+)\^/); if(m1){domains.push(m1[1]);return;}
      const m2=line.match(/^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([a-z0-9._-]+)$/); if(m2&&m2[1]!=='localhost') domains.push(m2[1]);
    });
    return{ok:true,count:domains.length,domains:domains.slice(0,15000)};
  }catch(e){return{ok:false,error:e.message};}
});
ipcMain.on('apply-extra-ad-domains', (_,d)=>store.set('extraAdDomains',d));
ipcMain.handle('get-extra-ad-domains', ()=>store.get('extraAdDomains',[]));

// ════════════════════════════════════════
// IPC: TMDB
// ════════════════════════════════════════
const TMDB_KEY='2dca580c2a14b55200e784d157207b4d';
const TMDB_BASE='https://api.themoviedb.org/3';
async function tmdb(p,extra=''){
  const r=await session.defaultSession.fetch(`${TMDB_BASE}${p}?api_key=${TMDB_KEY}&language=de-DE${extra}`,{headers:{'User-Agent':CHROME_UA}});
  return r.json();
}

ipcMain.handle('get-trending', async()=>{
  try{
    const [m,s,a]=await Promise.all([
      tmdb('/trending/movie/week','&region=DE'),
      tmdb('/trending/tv/week','&with_original_language=de|en|fr|es|it|pt'),
      tmdb('/discover/tv','&with_genres=16&sort_by=popularity.desc'),
    ]);
    return{
      movies:(m.results||[]).filter(i=>i.poster_path).slice(0,25),
      shows: (s.results||[]).filter(i=>i.poster_path&&!i.genre_ids?.includes(16)).slice(0,25),
      anime: (a.results||[]).filter(i=>i.poster_path).slice(0,25),
    };
  }catch(e){return{error:e.message};}
});

ipcMain.handle('get-new-releases', async()=>{
  try{
    const [m,s,a]=await Promise.all([
      tmdb('/movie/now_playing','&region=DE'),
      tmdb('/tv/on_the_air','&watch_region=DE'),
      tmdb('/discover/tv','&with_genres=16&sort_by=first_air_date.desc&first_air_date.lte='+new Date().toISOString().split('T')[0]),
    ]);
    return{
      movies:(m.results||[]).filter(i=>i.poster_path).slice(0,25),
      shows: (s.results||[]).filter(i=>i.poster_path&&!i.genre_ids?.includes(16)).slice(0,25),
      anime: (a.results||[]).filter(i=>i.poster_path).slice(0,25),
    };
  }catch(e){return{error:e.message};}
});

ipcMain.handle('get-upcoming', async(_,months=1)=>{
  try{
    const today=new Date();
    const future=new Date(today); future.setMonth(today.getMonth()+months);
    const fmt=d=>d.toISOString().split('T')[0];
    const gte=fmt(today), lte=fmt(future);
    const [m,s,a]=await Promise.all([
      tmdb('/discover/movie',`&region=DE&with_release_type=3|2&release_date.gte=${gte}&release_date.lte=${lte}&sort_by=release_date.asc`),
      tmdb('/discover/tv',`&watch_region=DE&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc&without_genres=16`),
      tmdb('/discover/tv',`&with_genres=16&first_air_date.gte=${gte}&first_air_date.lte=${lte}&sort_by=first_air_date.asc`),
    ]);
    return{
      movies:(m.results||[]).filter(i=>i.poster_path).slice(0,30),
      shows: (s.results||[]).filter(i=>i.poster_path).slice(0,30),
      anime: (a.results||[]).filter(i=>i.poster_path).slice(0,30),
    };
  }catch(e){return{error:e.message};}
});

ipcMain.handle('get-tmdb-detail', async(_,{id,type})=>{
  try{
    const [detail,videos,providers]=await Promise.all([
      tmdb(`/${type}/${id}`,'&append_to_response=credits'),
      tmdb(`/${type}/${id}/videos`),
      tmdb(`/${type}/${id}/watch/providers`),
    ]);
    return{detail,videos:videos.results||[],providers:providers.results?.DE||null};
  }catch(e){return{error:e.message};}
});

// OMDB – sortiert nach Relevanz
const OMDB_KEY='trilogy';
ipcMain.handle('search-title', async(_,q)=>{
  try{const r=await session.defaultSession.fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB_KEY}&type=movie,series`,{headers:{'User-Agent':CHROME_UA}});return await r.json();}
  catch(e){return{Error:e.message};}
});
ipcMain.handle('search-title-detail', async(_,id)=>{
  try{const r=await session.defaultSession.fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB_KEY}&plot=full`,{headers:{'User-Agent':CHROME_UA}});return await r.json();}
  catch(e){return{Error:e.message};}
});
// TMDB-Suche für bessere Ergebnisse (Streaming-Provider)
ipcMain.handle('search-tmdb', async(_,{query,page=1})=>{
  try{
    const r=await session.defaultSession.fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&language=de-DE&query=${encodeURIComponent(query)}&page=${page}&region=DE`,{headers:{'User-Agent':CHROME_UA}});
    return await r.json();
  }catch(e){return{error:e.message};}
});
// Streaming-Verfügbarkeit für einen Titel
ipcMain.handle('get-streaming-providers', async(_,{tmdbId,type})=>{
  try{
    const r=await tmdb(`/${type}/${tmdbId}/watch/providers`);
    return r.results?.DE||null;
  }catch(e){return null;}
});
// TMDB Find by IMDB-ID
ipcMain.handle('find-by-imdb', async(_,imdbId)=>{
  try{
    const r=await session.defaultSession.fetch(`${TMDB_BASE}/find/${imdbId}?api_key=${TMDB_KEY}&language=de-DE&external_source=imdb_id`,{headers:{'User-Agent':CHROME_UA}});
    return await r.json();
  }catch(e){return{error:e.message};}
});

ipcMain.handle('check-url',    async(_,url)=>{try{const r=await session.defaultSession.fetch(url,{method:'HEAD',headers:{'User-Agent':CHROME_UA}});return{ok:true,status:r.status};}catch(e){return{ok:false,error:e.message};}});
ipcMain.handle('check-online', async()=>{try{await session.defaultSession.fetch('https://www.google.com',{method:'HEAD',headers:{'User-Agent':CHROME_UA}});return true;}catch{return false;}});
ipcMain.on('open-external', (_,url)=>shell.openExternal(url));

// ════════════════════════════════════════
// IPC: WIDEVINE INFO
// ════════════════════════════════════════
ipcMain.handle('get-widevine-status', ()=>{
  const cdmDir=path.join(app.getPath('userData'),'WidevineCdm');
  const files=['widevinecdm.dll','libwidevinecdm.so','libwidevinecdm.dylib'];
  for(const f of files){if(fs.existsSync(path.join(cdmDir,f)))return{installed:true,path:path.join(cdmDir,f)};}
  return{installed:false,cdmDir};
});

// ════════════════════════════════════════
app.whenReady().then(createMainWindow);
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
