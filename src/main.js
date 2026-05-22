'use strict';
const {app,BrowserWindow,ipcMain,session,shell,dialog,Notification}=require('electron');
const path=require('path'),fs=require('fs'),crypto=require('crypto');
const Store=require('electron-store');
const store=new Store();
let mainWindow;

// Admin-Reset: Hash statt Klartext (sicherer als Datei)
// Kombination: Strg+Shift+Alt+R  → hash wird im Renderer verglichen
const ADMIN_HASH=crypto.createHash('sha256').update('OmniSight_AdminReset_2025_Ctrl+Shift+Alt+R').digest('hex');
ipcMain.handle('get-admin-hash',()=>ADMIN_HASH);

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
function setupSession(ses){
  ses.setCertificateVerifyProc((_,cb)=>cb(0));
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

  let shown=false;
  function showMain(){if(shown)return;shown=true;try{splash.destroy();}catch{}if(store.get('windowBounds')?.maximized)mainWindow.maximize();else mainWindow.show();mainWindow.focus();}
  setTimeout(showMain,2500);setTimeout(showMain,5000);

  mainWindow.on('closed',()=>{mainWindow=null;app.quit();});
  mainWindow.on('enter-full-screen',()=>mainWindow?.webContents.send('fullscreen-change',true));
  mainWindow.on('leave-full-screen',()=>mainWindow?.webContents.send('fullscreen-change',false));

  try{
    const {autoUpdater}=require('electron-updater');
    autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;
    autoUpdater.setFeedURL({provider:'github',owner:'P3rc1v4l',repo:'OmniSight'});
    autoUpdater.on('update-available',info=>mainWindow?.webContents.send('update-available',info));
    autoUpdater.on('update-not-available',()=>mainWindow?.webContents.send('update-not-available'));
    autoUpdater.on('update-downloaded',()=>mainWindow?.webContents.send('update-downloaded'));
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
ipcMain.on('install-update',()=>{try{require('electron-updater').autoUpdater.quitAndInstall();}catch{}});
ipcMain.handle('check-for-updates',async()=>{try{await require('electron-updater').autoUpdater.checkForUpdates();}catch{}});

// ── IPC: SETTINGS ─────────────────────────────────────────────────
const DEFS={appBgImage:'',accentColor:'#30c5bb',cardImages:{},cardImageOffsets:{},cardBgColors:{},cardBgOpacity:{},cardCustomNames:{},cardCustomTags:{},cardLogos:{},favorites:[],fontSize:14,cardLayout:'normal',sortAlpha:false,sortDir:'asc',language:'de',particlesEnabled:false,particlesConfig:{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle'],appWide:true},clock:{enabled:false,position:{x:16,y:52},color:'#cfcfcf',opacity:0.5,size:36,type:'digital',showSeconds:false},hiddenItems:{news:{},upcoming:{}},watchedItems:{news:{},upcoming:{}},watchlist:[],searchHistory:[],viewHistory:[],providerOrder:[],newsLastTab:'movies',upcomingLastTab:'movies',designOptions:{cardRadius:14,sidebarWidth:200,cardShadow:true,glass:false,fontFamily:'DM Sans'},customProviders:{},deletedProviders:[],notificationsConfig:{streamBreak:true},watchedContentList:[],onboardingDone:false};
ipcMain.handle('get-theme',()=>store.get('theme','dark'));
ipcMain.on('set-theme',(_,v)=>store.set('theme',v));
ipcMain.handle('get-settings',()=>({...DEFS,...store.get('settings',{})}));
ipcMain.on('set-settings',(_,v)=>store.set('settings',v));
ipcMain.handle('get-profiles',()=>store.get('profiles',[{id:'default',name:'User',favorites:[],watchlist:[],searchHistory:[],viewHistory:[]}]));
ipcMain.on('set-profiles',(_,v)=>store.set('profiles',v));
ipcMain.handle('get-active-profile',()=>store.get('activeProfile','default'));
ipcMain.on('set-active-profile',(_,id)=>store.set('activeProfile',id));

// ── IPC: NOTIFICATIONS (persistent) ──────────────────────────────
ipcMain.handle('get-notifications',(_,profileId)=>store.get(`notifications_${profileId}`||'notifications_default',[]));
ipcMain.on('set-notifications',(_,{profileId,list})=>store.set(`notifications_${profileId}`,list));

// ── IPC: NOTIFICATION (system) ────────────────────────────────────
ipcMain.on('show-notification',(_,{title,body})=>{if(Notification.isSupported())new Notification({title,body,icon:path.join(__dirname,'assets','icon.png')}).show();});

// ── IPC: IMAGE PICKER ─────────────────────────────────────────────
ipcMain.handle('pick-image',async(_,dest)=>{
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
ipcMain.on('record-watch-time',(_,{providerId,seconds,profileId='default'})=>{const k=`streamStats_${profileId}`;const s=store.get(k,{});if(!s[providerId])s[providerId]={total:0,byDay:[0,0,0,0,0,0,0]};s[providerId].total+=seconds;s[providerId].byDay[new Date().getDay()]=(s[providerId].byDay[new Date().getDay()]||0)+seconds;store.set(k,s);});
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
  const html=`<!DOCTYPE html><html><head><style>*{margin:0}body{background:#000;height:100vh;display:flex}webview{flex:1}</style></head><body><webview src="${url}" partition="${partition||''}" useragent="${UA}" allowpopups style="width:100%;flex:1"></webview></body></html>`;
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
  const cdmDir=path.join(app.getPath('userData'),'WidevineCdm');
  const paths=[path.join(cdmDir,'widevinecdm.dll'),path.join(cdmDir,'_platform_specific','win_x64','widevinecdm.dll'),path.join(cdmDir,'libwidevinecdm.dylib')];
  for(const p of paths)if(fs.existsSync(p))return{installed:true,path:p,cdmDir};
  return{installed:false,cdmDir};
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

ipcMain.handle('check-online',async()=>{try{await session.defaultSession.fetch('https://www.google.com',{method:'HEAD'});return true;}catch{return false;}});
ipcMain.handle('check-url',async(_,url)=>{try{const r=await session.defaultSession.fetch(url,{method:'HEAD',headers:{'User-Agent':UA}});return{ok:true,status:r.status};}catch(e){return{ok:false,error:e.message};}});
ipcMain.on('open-external',(_,url)=>shell.openExternal(url));

app.whenReady().then(createMainWindow);
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
