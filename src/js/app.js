'use strict';

// ════════════════════════════════
// PROVIDERS
// ════════════════════════════════
const PROVIDERS_BASE = {
  apple:        {name:'Apple TV+',     tag:'Apple Originals',         url:'https://tv.apple.com',                    color:'#555555',quality:'4K',   partition:'apple'},
  ard:          {name:'ARD Mediathek', tag:'Öffentlich-rechtlich',     url:'https://www.ardmediathek.de',             color:'#003D6B',quality:'HD',   partition:'ard'},
  burning:      {name:'BurningSeries', tag:'Serien & Anime',           url:'https://bs.to',                           color:'#C0392B',quality:'HD',   partition:'burning',  multiTab:true},
  cineto:       {name:'Cine.to',       tag:'Filme & Serien',           url:'https://cine.to',                         color:'#8B5CF6',quality:'HD',   partition:'cineto',   multiTab:true},
  crunchyroll:  {name:'Crunchyroll',   tag:'Anime & Manga',            url:'https://www.crunchyroll.com',             color:'#F47521',quality:'4K',   partition:'crunchyroll'},
  dazn:         {name:'DAZN',          tag:'Sport Live-Streams',       url:'https://www.dazn.com',                    color:'#F8D200',quality:'4K',   partition:'dazn'},
  disney:       {name:'Disney+',       tag:'Marvel, Star Wars & mehr', url:'https://www.disneyplus.com',              color:'#113CCF',quality:'4K',   partition:'disney'},
  hbomax:       {name:'Max (HBO)',      tag:'HBO Originals & mehr',     url:'https://www.max.com',                     color:'#0031DB',quality:'4K',   partition:'hbomax'},
  joyn:         {name:'Joyn',          tag:'Kostenlos streamen',       url:'https://www.joyn.de',                     color:'#E4001B',quality:'HD',   partition:'joyn'},
  mubi:         {name:'MUBI',          tag:'Arthouse & Kino',          url:'https://mubi.com',                        color:'#213F5E',quality:'HD',   partition:'mubi'},
  netflix:      {name:'Netflix',       tag:'Filme & Serien',           url:'https://www.netflix.com',                 color:'#E50914',quality:'4K',   partition:'netflix'},
  paramountplus:{name:'Paramount+',    tag:'Paramount Originals',      url:'https://www.paramountplus.com',           color:'#0064FF',quality:'4K',   partition:'paramountplus'},
  prime:        {name:'Prime Video',   tag:'Amazon Originals',         url:'https://www.primevideo.com',              color:'#00A8E1',quality:'4K',   partition:'prime'},
  rtl:          {name:'RTL+',          tag:'RTL Serien & Shows',       url:'https://plus.rtl.de',                     color:'#FF6B00',quality:'HD',   partition:'rtl'},
  skygo:        {name:'Sky Go',        tag:'Sky Serien & Sport',       url:'https://www.sky.de/entertainment/sky-go', color:'#00205B',quality:'HD',   partition:'skygo'},
  spotify:      {name:'Spotify',       tag:'Musik & Podcasts',         url:'https://open.spotify.com',                color:'#1DB954',quality:'–',    partition:'spotify',  bgAudio:true},
  twitch:       {name:'Twitch',        tag:'Live-Streams & Gaming',    url:'https://www.twitch.tv',                   color:'#9146FF',quality:'1080p',partition:'twitch',   multiTab:true},
  youtube:      {name:'YouTube',       tag:'Videos & Streams',         url:'https://www.youtube.com',                 color:'#FF0000',quality:'4K',   partition:'youtube',  multiTab:true},
  zdf:          {name:'ZDF Mediathek', tag:'Öffentlich-rechtlich',     url:'https://www.zdf.de',                      color:'#163A6A',quality:'HD',   partition:'zdf'},
};

// TMDB Provider-ID Mapping für Streaming-Chips
const TMDB_PROVIDER_MAP = {
  8:'netflix',9:'prime',337:'disney',384:'hbomax',531:'paramountplus',
  283:'crunchyroll',350:'apple',207:'mubi',36:'mubi',
};

const I18N = {
  de:{overview:'Übersicht',favorites:'Favoriten',watchlist:'Gemerkt',news:'Neuigkeiten',upcoming:'Upcoming',providers:'Anbieter',settings:'Einstellungen',watchingNow:'Schaut gerade',search:'Film, Serie, YouTube oder Anbieter suchen…'},
  en:{overview:'Overview',favorites:'Favorites',watchlist:'Watchlist',news:"What's New",upcoming:'Upcoming',providers:'Providers',settings:'Settings',watchingNow:'Now Watching',search:'Search movies, shows, YouTube or providers…'},
};

const PLUGIN_PRESETS = [
  {id:'adblock',   name:'AdBlock',            desc:'Von ADBLOCK, Inc. – getadblock.com',        url:'https://easylist.to/easylist/easylist.txt'},
  {id:'easyprivacy',name:'EasyPrivacy',         desc:'Tracking & Analytics blockieren',           url:'https://easylist.to/easylist/easyprivacy.txt'},
  {id:'fanboy',    name:'Fanboy Annoyance',    desc:'Cookie-Banner & Popups blockieren',          url:'https://easylist.to/easylist/fanboy-annoyance.txt'},
  {id:'adguard',   name:'AdGuard Base',        desc:'AdGuard Basisliste',                         url:'https://filters.adtidy.org/extension/chromium/filters/2.txt'},
  {id:'buster',    name:'Buster: Captcha Solver',desc:'CAPTCHA-Solver (Browser-Extension)',       url:'',  note:'Buster ist eine Browser-Extension und läuft nicht direkt in Electron. Tipp: In bs.to/cine.to Tabs tritt es häufig auf – die App versucht CAPTCHAs automatisch zu überspringen.'},
  {id:'betterttv', name:'BetterTTV',           desc:'Twitch-Emotes & Verbesserungen',             url:'',  note:'BetterTTV ist eine Browser-Extension. In OmniSight wird es für Twitch-Tabs als Userscript injiziert (experimentell).', inject:'twitch'},
  {id:'icloud',    name:'iCloud-Passwörter',   desc:'Passwörter aus Safari (Windows App)',        url:'',  note:'iCloud-Passwörter funktionieren nur über die iCloud für Windows-App. Tipp: Passwörter im Browser speichern und dann in OmniSight eingeben.'},
];

const ACHIEVEMENTS = [
  {id:'first_stream',  name:'Erster Stream',     icon:'🎬', desc:'Ersten Stream gestartet',          check:(s)=>Object.values(s).some(v=>v.total>0)},
  {id:'hour_1',        name:'1 Stunde',           icon:'⏰', desc:'1 Stunde insgesamt gestreamt',     check:(s)=>totalSecs(s)>=3600},
  {id:'hour_10',       name:'10 Stunden',         icon:'🕐', desc:'10 Stunden insgesamt gestreamt',  check:(s)=>totalSecs(s)>=36000},
  {id:'hour_100',      name:'100 Stunden',        icon:'💯', desc:'100 Stunden insgesamt gestreamt', check:(s)=>totalSecs(s)>=360000},
  {id:'netflix_1h',    name:'Netflix Fan',        icon:'🍿', desc:'1h Netflix gestreamt',            check:(s)=>(s.netflix?.total||0)>=3600},
  {id:'youtube_5h',    name:'YouTube Addict',     icon:'▶️', desc:'5h YouTube gestreamt',            check:(s)=>(s.youtube?.total||0)>=18000},
  {id:'multi_provider',name:'Viel-Streamer',      icon:'🌐', desc:'5 verschiedene Anbieter genutzt', check:(s)=>Object.values(s).filter(v=>v.total>0).length>=5},
  {id:'night_owl',     name:'Nachteule',          icon:'🦉', desc:'Samstag oder Sonntag gestreamt',  check:(s)=>Object.values(s).some(v=>(v.byDay?.[0]||0)+(v.byDay?.[6]||0)>0)},
];
function totalSecs(s){return Object.values(s).reduce((a,v)=>a+(v.total||0),0);}

const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function enc(s){return encodeURIComponent(s);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function getFavicon(id,p){const d={apple:'tv.apple.com',ard:'ardmediathek.de',burning:'bs.to',cineto:'cine.to',crunchyroll:'crunchyroll.com',dazn:'dazn.com',disney:'disneyplus.com',hbomax:'max.com',joyn:'joyn.de',mubi:'mubi.com',netflix:'netflix.com',paramountplus:'paramountplus.com',prime:'primevideo.com',rtl:'plus.rtl.de',skygo:'sky.de',spotify:'open.spotify.com',twitch:'twitch.tv',youtube:'youtube.com',zdf:'zdf.de'};const domain=d[id]||(p?.url?new URL(p.url).hostname:'example.com');return`https://www.google.com/s2/favicons?sz=64&domain=${domain}`;}
function pad(n){return String(n).padStart(2,'0');}

// ════════════════════════════════
// STATE
// ════════════════════════════════
let settings={};
let profiles=[];
let activeProfileId='default';
let currentProvider=null, currentWebview=null, currentProvUrl=null;
let pipProviderId=null;
let isFullscreen=false;
let fsHoverTimer=null, fsAutoHide=null;
let clockInterval=null, clockDragEnabled=false;
let clockDragHandlers=null;
let extraAdDomains=[];
let installedPlugins=new Set();
let watchlist=[], searchHistory=[], viewHistory=[], providerOrder=[];
let customProviders={};
let lang='de';
let customCSS='';
let watchTimeTimer=null;
let sessionRefreshTimerId=null;
let streamTabs=[], activeTabId=null;
let hiddenItems={news:{},upcoming:{}};
let partitionCache={};
let particlesConfig={count:80,size:1.5,shape:'circle'};
let particlesAnimId=null;
let pendingAchievements=new Set();
let autoSaveTimerId=null;

const slideshows={
  news:    {items:[],idx:0,timer:null,mediaType:'movies',tab:'trending'},
  upcoming:{items:[],idx:0,timer:null,mediaType:'movies',months:1},
};

// ════════════════════════════════
// HELPERS
// ════════════════════════════════
function PROVIDERS(){return{...PROVIDERS_BASE,...customProviders};}
function getProfilePartition(providerId){return`${activeProfileId}_${PROVIDERS()[providerId]?.partition||providerId}`;}

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init(){
  settings=await window.electronAPI.getSettings();
  // Defaults
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.cardBgColors     = settings.cardBgColors     || {};
  settings.cardBgOpacity    = settings.cardBgOpacity    || {};
  settings.clock            = settings.clock            || {enabled:false,position:{x:16,y:52},color:'#ff3b30',opacity:0.85,size:22};
  settings.fontSize         = settings.fontSize         || 14;
  settings.accentColor      = settings.accentColor      || '#30c5bb';
  settings.hiddenItems      = settings.hiddenItems      || {news:{},upcoming:{}};
  settings.watchlist        = settings.watchlist        || [];
  settings.searchHistory    = settings.searchHistory    || [];
  settings.viewHistory      = settings.viewHistory      || [];
  settings.providerOrder    = settings.providerOrder    || [];
  settings.language         = settings.language         || 'de';
  settings.particlesEnabled = settings.particlesEnabled || false;
  settings.particlesConfig  = settings.particlesConfig  || {count:80,size:1.5,shape:'circle'};
  settings.customCSS        = settings.customCSS        || '';
  settings.customProviders  = settings.customProviders  || {};
  settings.newsLastTab      = settings.newsLastTab      || 'movies';
  settings.upcomingLastTab  = settings.upcomingLastTab  || 'movies';
  settings.cardLayout       = settings.cardLayout       || 'normal';

  hiddenItems        = settings.hiddenItems;
  watchlist          = settings.watchlist;
  searchHistory      = settings.searchHistory;
  viewHistory        = settings.viewHistory;
  providerOrder      = settings.providerOrder;
  lang               = settings.language;
  customCSS          = settings.customCSS;
  customProviders    = settings.customProviders;
  particlesConfig    = settings.particlesConfig;
  slideshows.news.mediaType     = settings.newsLastTab;
  slideshows.upcoming.mediaType = settings.upcomingLastTab;

  applyFontSize(settings.fontSize);
  applyAccent(settings.accentColor);
  applyLanguage(lang);
  applyCustomCSS(customCSS);
  applyBgImage(settings.appBgImage);

  const theme=await window.electronAPI.getTheme();
  setTheme(theme,false);

  extraAdDomains=await window.electronAPI.getExtraAdDomains();
  installedPlugins=new Set(JSON.parse(localStorage.getItem('installedPlugins')||'[]'));

  profiles=await window.electronAPI.getProfiles();
  activeProfileId=await window.electronAPI.getActiveProfile();
  buildProfileSelect();

  buildProviderGrid();
  buildSidebarSubMenus();
  setupClock();
  setupTitlebar();
  setupThemeToggle();
  setupNavigation();
  setupStreamControls();
  setupSettingsPanel();
  setupFullscreenExit();
  setupESCKey();
  setupKeyboardShortcuts();
  setupPip();
  setupSearch();
  setupCardEditor();
  setupPluginsTab();
  setupClockContextMenu();
  setupParticles();
  setupUpdateBanner();
  setupHiddenPanel();
  setupCustomProviderModal();
  setupProfileModal();
  setupVPNPanel();
  setupCSSEditor();
  checkOnlineStatus();
  startSessionAutoRefresh();
  checkWidevineStatus();

  window.electronAPI.onFullscreenChange(v=>{isFullscreen=v;updateFullscreenUI();});
  window.electronAPI.onSessionsUpdated(r=>{renderSessionList(r);});
  window.electronAPI.onGoogleAuthDone(()=>{showToast('✓ Google-Login erkannt!');window.electronAPI.refreshSessionsNow(activeProfileId);});

  isFullscreen=await window.electronAPI.isFullscreen();
  updateFullscreenUI();
  setInterval(checkOnlineStatus,30000);
}

// ════════════════════════════════
// LANGUAGE
// ════════════════════════════════
function applyLanguage(l){
  lang=l;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[l]?.[k])el.textContent=I18N[l][k];});
  const si=document.getElementById('search-input');
  if(si) si.placeholder=I18N[l]?.search||I18N.de.search;
}

// ════════════════════════════════
// THEME / ACCENT / FONT / CSS
// ════════════════════════════════
function setTheme(t,save=true){
  document.documentElement.setAttribute('data-theme',t);
  const tog=document.getElementById('theme-toggle');if(tog)tog.checked=(t==='light');
  if(save){window.electronAPI.setTheme(t);autoSave();}
}
function setupThemeToggle(){document.getElementById('theme-toggle')?.addEventListener('change',e=>setTheme(e.target.checked?'light':'dark'));}
function applyFontSize(px){document.documentElement.style.setProperty('--fs',px+'px');}
function applyAccent(hex){
  document.documentElement.style.setProperty('--acc',hex||'#30c5bb');
  const rgb=hexToRgb(hex||'#30c5bb');
  if(rgb)document.documentElement.style.setProperty('--accg',`rgba(${rgb},.18)`);
}
function applyCustomCSS(css){let el=document.getElementById('custom-css-style');if(!el){el=document.createElement('style');el.id='custom-css-style';document.head.appendChild(el);}el.textContent=css||'';}
function applyBgImage(url){
  const mc=document.getElementById('main-content');if(!mc)return;
  if(url){mc.style.backgroundImage=`url("${url}")`;mc.style.backgroundSize='cover';mc.style.backgroundPosition='center';mc.classList.add('has-bg');document.documentElement.style.setProperty('--bgs','rgba(10,10,20,0.75)');}
  else{mc.style.backgroundImage='';mc.classList.remove('has-bg');document.documentElement.style.removeProperty('--bgs');}
}
function hexToRgb(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null;}

// AUTO-SAVE
function autoSave(force=false){
  clearTimeout(autoSaveTimerId);
  autoSaveTimerId=setTimeout(()=>{
    window.electronAPI.setSettings(settings);
  },force?0:800);
}
function autoSaveAndToast(){autoSave(true);showSaveToast();}
function showSaveToast(){
  const t=document.getElementById('save-toast');if(!t)return;
  t.style.display='block';
  setTimeout(()=>{t.style.display='none';},2800);
}

// ════════════════════════════════
// PARTICLES
// ════════════════════════════════
function setupParticles(){
  const canvas=document.getElementById('particles-canvas');if(!canvas)return;
  if(particlesAnimId){cancelAnimationFrame(particlesAnimId);particlesAnimId=null;}
  canvas.style.display=settings.particlesEnabled?'block':'none';
  if(!settings.particlesEnabled)return;
  const ctx=canvas.getContext('2d');
  let w=canvas.width=window.innerWidth,h=canvas.height=window.innerHeight;
  const cfg=particlesConfig||{count:80,size:1.5,shape:'circle'};
  const pts=Array.from({length:cfg.count||80},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*(cfg.size||1.5)+.3,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,op:Math.random()*.5+.1,rot:Math.random()*Math.PI*2}));
  window.addEventListener('resize',()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;});
  function drawShape(ctx,p){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot||0);
    ctx.fillStyle=`rgba(48,197,187,${p.op})`;ctx.strokeStyle=`rgba(48,197,187,${p.op})`;ctx.lineWidth=.8;
    const r=p.r;const s=cfg.shape||'circle';
    if(s==='circle'){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}
    else if(s==='triangle'){ctx.beginPath();ctx.moveTo(0,-r*1.2);ctx.lineTo(r,r*.8);ctx.lineTo(-r,r*.8);ctx.closePath();ctx.fill();}
    else if(s==='diamond'){ctx.beginPath();ctx.moveTo(0,-r*1.5);ctx.lineTo(r,0);ctx.lineTo(0,r*1.5);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();}
    else if(s==='star'){ctx.beginPath();for(let i=0;i<5;i++){ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*r,Math.sin((18+i*72)*Math.PI/180)*-r);ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*r*.5,Math.sin((54+i*72)*Math.PI/180)*-r*.5);}ctx.closePath();ctx.fill();}
    else if(s==='line'){ctx.beginPath();ctx.moveTo(-r*2,0);ctx.lineTo(r*2,0);ctx.stroke();}
    ctx.restore();
  }
  function tick(){ctx.clearRect(0,0,w,h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot=(p.rot||0)+.005;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;drawShape(ctx,p);});particlesAnimId=requestAnimationFrame(tick);}
  tick();
}

// ════════════════════════════════
// ONLINE CHECK / UPDATE BANNER
// ════════════════════════════════
async function checkOnlineStatus(){
  const on=await window.electronAPI.checkOnline();
  const b=document.getElementById('offline-banner');if(b)b.style.display=on?'none':'flex';
}
function setupUpdateBanner(){
  const banner=document.getElementById('update-banner');
  window.electronAPI.onUpdateAvailable(info=>{if(banner){banner.style.display='flex';document.getElementById('update-text').textContent=`🚀 Update v${info.version} verfügbar!`;}});
  window.electronAPI.onUpdateDownloaded(()=>{document.getElementById('btn-download-update').style.display='none';document.getElementById('btn-install-update').style.display='block';});
  document.getElementById('btn-download-update')?.addEventListener('click',e=>{e.target.textContent='Lädt…';e.target.disabled=true;});
  document.getElementById('btn-install-update')?.addEventListener('click',()=>window.electronAPI.installUpdate());
  document.getElementById('btn-dismiss-update')?.addEventListener('click',()=>{if(banner)banner.style.display='none';});
}

// ════════════════════════════════
// SESSION AUTO-REFRESH
// ════════════════════════════════
function startSessionAutoRefresh(){
  window.electronAPI.refreshSessionsNow(activeProfileId);
  clearInterval(sessionRefreshTimerId);
  sessionRefreshTimerId=setInterval(()=>window.electronAPI.refreshSessionsNow(activeProfileId),60000);
}

// ════════════════════════════════
// PROFILES
// ════════════════════════════════
function buildProfileSelect(){
  const sel=document.getElementById('profile-select');if(!sel)return;
  sel.innerHTML='';
  profiles.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name;if(p.id===activeProfileId)opt.selected=true;sel.appendChild(opt);});
  sel.addEventListener('change',()=>switchProfile(sel.value));
}

function switchProfile(id){
  // PiP schließen
  const pip=document.getElementById('pip-window');if(pip)pip.style.display='none';
  document.getElementById('pip-content').innerHTML='';pipProviderId=null;

  // Aktuellen Stream stoppen
  if(currentWebview){const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';currentWebview=null;currentProvider=null;}

  // Daten des aktuellen Profils sichern
  const cur=profiles.find(p=>p.id===activeProfileId);
  if(cur){cur.favorites=settings.favorites;cur.watchlist=watchlist;cur.searchHistory=searchHistory;cur.viewHistory=viewHistory;}

  // Neues Profil laden
  const next=profiles.find(p=>p.id===id);
  if(next){
    activeProfileId=id;
    settings.favorites    = next.favorites    || [];
    watchlist             = next.watchlist    || [];
    searchHistory         = next.searchHistory|| [];
    viewHistory           = next.viewHistory  || [];
    window.electronAPI.setActiveProfile(id);
    window.electronAPI.setProfiles(profiles);
    startSessionAutoRefresh();
    buildProviderGrid();buildSidebarSubMenus();
    showView('home');
  }
}

document.getElementById('btn-add-profile')?.addEventListener('click',()=>{document.getElementById('profile-modal').style.display='flex';document.getElementById('new-profile-name').value='';document.getElementById('new-profile-name').focus();});
function setupProfileModal(){
  document.getElementById('btn-create-profile')?.addEventListener('click',()=>{
    const name=document.getElementById('new-profile-name').value.trim();if(!name)return;
    const id=`profile_${Date.now()}`;
    profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});
    window.electronAPI.setProfiles(profiles);buildProfileSelect();switchProfile(id);
    document.getElementById('profile-modal').style.display='none';
  });
  document.getElementById('btn-cancel-profile')?.addEventListener('click',()=>document.getElementById('profile-modal').style.display='none');
}

// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn[data-view], .sidebar-icon-btn[data-view]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation(){
  document.querySelectorAll('[data-view]').forEach(btn=>{
    if(!btn.matches('.nav-btn, .sidebar-icon-btn, .goto-home-btn')) return;
    btn.addEventListener('click',()=>{
      const v=btn.dataset.view;
      if(v==='home'){maybeMoveToPip();showView('home');}
      else if(v==='stream'){if(!currentProvider&&!pipProviderId)showView('nothing');else if(currentProvider)showView('stream');else restoreFromPip();}
      else if(v==='news'){showView('news');loadNews(slideshows.news.mediaType,slideshows.news.tab);}
      else if(v==='upcoming'){showView('upcoming');loadUpcoming(slideshows.upcoming.mediaType,slideshows.upcoming.months);}
      else if(v==='watchlist'){showView('watchlist');buildWatchlist();}
      else if(v==='stats'){showView('stats');buildStatsView();}
      else showView(v);
    });
  });

  setupToggle('nav-fav-toggle','nav-sub-favorites');

  // Anbieter öffnet nach oben + schließt bei Außenklick
  const provBtn=document.getElementById('nav-providers-toggle'),provSub=document.getElementById('nav-sub-providers');
  provBtn?.addEventListener('click',()=>{provBtn.classList.toggle('open');provSub?.classList.toggle('open');});
  document.addEventListener('mousedown',e=>{
    if(provSub?.classList.contains('open')&&!provSub.contains(e.target)&&!provBtn?.contains(e.target)){provSub.classList.remove('open');provBtn?.classList.remove('open');}
    const favSub=document.getElementById('nav-sub-favorites'),favBtn=document.getElementById('nav-fav-toggle');
    if(favSub?.classList.contains('open')&&!favSub.contains(e.target)&&!favBtn?.contains(e.target)){favSub.classList.remove('open');favBtn?.classList.remove('open');}
    const dd=document.getElementById('search-dropdown');
    if(dd&&dd.style.display!=='none'){const wrap=document.getElementById('search-bar')?.closest('.search-bar-wrap');if(wrap&&!wrap.contains(e.target))dd.style.display='none';}
  });

  // Suche-Filter
  document.getElementById('fav-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-favorites-list',e.target.value));
  document.getElementById('prov-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-providers-list',e.target.value));

  // News Typ-Switcher
  document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');const mt=btn.dataset.media;
      slideshows.news.mediaType=mt;settings.newsLastTab=mt;autoSave();
      loadNews(mt,slideshows.news.tab);
    });
  });
  // News Tab-Buttons
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(tab=>{
    tab.addEventListener('click',async()=>{
      document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');const which=tab.dataset.newsTab;
      slideshows.news.tab=which;loadNews(slideshows.news.mediaType,which);
    });
  });
  // Upcoming Typ
  document.querySelectorAll('#upcoming-switcher .media-type-text-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#upcoming-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');const mt=btn.dataset.media;
      slideshows.upcoming.mediaType=mt;settings.upcomingLastTab=mt;autoSave();
      loadUpcoming(mt,slideshows.upcoming.months);
    });
  });
  // Upcoming Range
  document.querySelectorAll('.range-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');const months=parseInt(btn.dataset.months);
      slideshows.upcoming.months=months;loadUpcoming(slideshows.upcoming.mediaType,months);
    });
  });
  // Watchlist Switcher
  document.querySelectorAll('#wl-switcher .media-type-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{document.querySelectorAll('#wl-switcher .media-type-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');buildWatchlist(btn.dataset.wlCat);});
  });
  document.getElementById('wl-sort')?.addEventListener('change',()=>buildWatchlist());
}

function setupToggle(btnId,subId){
  const btn=document.getElementById(btnId),sub=document.getElementById(subId);
  btn?.addEventListener('click',()=>{btn.classList.toggle('open');sub?.classList.toggle('open');});
}
function filterSubMenu(listId,q){document.getElementById(listId)?.querySelectorAll('.nav-sub-btn').forEach(b=>{b.style.display=b.textContent.toLowerCase().includes(q.toLowerCase())?'flex':'none';});}

// ════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════
function setupKeyboardShortcuts(){
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey){
      if(e.key==='f'){e.preventDefault();document.getElementById('search-input')?.focus();}
      if(e.key==='m'){e.preventDefault();if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');}}
    }
    if(e.key==='F11'){e.preventDefault();window.electronAPI.setFullscreen(!isFullscreen);}
  });
}

// ════════════════════════════════
// NEWS LOAD
// ════════════════════════════════
async function loadNews(mediaType='movies',tab='trending'){
  slideshows.news.mediaType=mediaType;slideshows.news.tab=tab;
  document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(b=>b.classList.toggle('active',b.dataset.media===mediaType));
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.toggle('active',t.dataset.newsTab===tab));
  let data;
  if(tab==='trending')data=await window.electronAPI.getTrending().catch(()=>({}));
  else data=await window.electronAPI.getNewReleases().catch(()=>({}));
  const raw=mediaType==='movies'?(data.movies||[]):mediaType==='shows'?(data.shows||[]):(data.anime||[]);
  slideshows.news.items=raw.filter(i=>!hiddenItems.news?.[i.id]);
  buildFullSlideshow('news');
}

// ════════════════════════════════
// UPCOMING LOAD
// ════════════════════════════════
async function loadUpcoming(mediaType='movies',months=1){
  slideshows.upcoming.mediaType=mediaType;slideshows.upcoming.months=months;
  document.querySelectorAll('#upcoming-switcher .media-type-text-btn').forEach(b=>b.classList.toggle('active',b.dataset.media===mediaType));
  document.querySelectorAll('.range-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.months)===months));
  const data=await window.electronAPI.getUpcoming(months).catch(()=>({}));
  const raw=mediaType==='movies'?(data.movies||[]):mediaType==='shows'?(data.shows||[]):(data.anime||[]);
  slideshows.upcoming.items=raw.filter(i=>!hiddenItems.upcoming?.[i.id]);
  buildFullSlideshow('upcoming');
}

// ════════════════════════════════
// BUILD FULL SLIDESHOW
// ════════════════════════════════
function buildFullSlideshow(key){
  const ss=slideshows[key];
  const track=document.getElementById(`${key}-track`);
  const dots=document.getElementById(`${key}-dots`);
  const bgEl=document.getElementById(`${key}-bg`);
  const titleEl=document.getElementById(`${key}-current-title`);
  clearInterval(ss.timer);ss.idx=0;
  if(!track||!dots)return;
  track.innerHTML='';dots.innerHTML='';
  const items=ss.items;
  if(!items.length){track.innerHTML='<div style="color:rgba(255,255,255,.4);padding:20px;font-size:13px">Keine Daten.</div>';if(titleEl)titleEl.textContent='';return;}

  items.forEach((item,i)=>{
    const title=item.title||item.name||'Unbekannt';
    const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:null;
    const rating=item.vote_average?item.vote_average.toFixed(1):null;
    const rd=item.release_date||item.first_air_date||'';
    const year=rd.substring(0,4);
    const fmtDate=rd&&key==='upcoming'?new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):null;
    const tmdbType=item.title?'movie':'tv';
    const isInWl=!!watchlist.find(w=>w.id===`${tmdbType}_${item.id}`);

    const card=document.createElement('div');
    card.className='slide-card'+(i===0?' active-slide':'');
    card.dataset.idx=i;
    card.innerHTML=`
      <div class="slide-card-inner">
        ${poster?`<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">`:
          `<div class="slide-card-poster-ph"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
        <div class="slide-card-body">
          <div class="slide-card-title">${esc(title)}</div>
          <div class="slide-card-meta">
            ${year?`<span class="slide-card-year">${year}</span>`:''}
            ${fmtDate?`<span style="color:var(--acc);font-weight:600">📅 ${fmtDate}</span>`:''}
            ${rating?`<span class="slide-card-rating">★ ${rating}</span>`:''}
          </div>
        </div>
      </div>
      <div class="slide-card-actions">
        <button class="slide-bookmark-btn${isInWl?' bookmarked':''}" title="Merken">🔖</button>
        <button class="slide-hide-btn" title="Ausblenden">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.slide-bookmark-btn').addEventListener('click',e=>{
      e.stopPropagation();const wlId=`${tmdbType}_${item.id}`;
      if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.classList.remove('bookmarked');showToast(`${title} entfernt`);}
      else{watchlist.unshift({id:wlId,tmdbId:item.id,tmdbType,title,poster:poster||'',releaseDate:rd,mediaType:tmdbType==='tv'?'tv':'movie'});e.target.classList.add('bookmarked');showToast(`${title} gemerkt`);}
      settings.watchlist=watchlist;autoSave();
    });

    card.querySelector('.slide-hide-btn').addEventListener('click',e=>{
      e.stopPropagation();card.classList.add('fading');
      card.addEventListener('animationend',()=>{
        const ns=key==='news'?'news':'upcoming';
        if(!hiddenItems[ns])hiddenItems[ns]={};
        hiddenItems[ns][item.id]={title,poster:poster||'',tmdbId:item.id,tmdbType,releaseDate:rd};
        settings.hiddenItems=hiddenItems;autoSave();
        ss.items=ss.items.filter(it=>it.id!==item.id);
        buildFullSlideshow(key);
      },{once:true});
    });

    card.querySelector('.slide-card-inner').addEventListener('click',()=>showDetailPopup(item.id,tmdbType,title));
    track.appendChild(card);

    const dot=document.createElement('button');dot.className='slide-dot'+(i===0?' active':'');
    dot.addEventListener('click',()=>goToSlide(key,i));
    dots.appendChild(dot);
  });

  document.getElementById(`${key}-prev`).onclick=()=>goToSlide(key,ss.idx-1);
  document.getElementById(`${key}-next`).onclick=()=>goToSlide(key,ss.idx+1);
  updateSlideshowBg(key,items[0]);
  if(titleEl)titleEl.textContent=items[0]?.title||items[0]?.name||'';
  ss.timer=setInterval(()=>goToSlide(key,ss.idx+1),5000);
}

function goToSlide(key,idx){
  const ss=slideshows[key];if(!ss.items.length)return;
  idx=((idx%ss.items.length)+ss.items.length)%ss.items.length;ss.idx=idx;
  const track=document.getElementById(`${key}-track`),dots=document.getElementById(`${key}-dots`);
  if(!track||!dots)return;
  track.querySelectorAll('.slide-card').forEach((c,i)=>c.classList.toggle('active-slide',i===idx));
  const active=track.querySelectorAll('.slide-card')[idx];
  if(active)active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  dots.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  updateSlideshowBg(key,ss.items[idx]);
  const titleEl=document.getElementById(`${key}-current-title`);
  if(titleEl)titleEl.textContent=ss.items[idx]?.title||ss.items[idx]?.name||'';
  clearInterval(ss.timer);ss.timer=setInterval(()=>goToSlide(key,ss.idx+1),5000);
}

function updateSlideshowBg(key,item){
  const el=document.getElementById(`${key}-bg`);if(!el||!item)return;
  const bd=item.backdrop_path?`${TMDB_BACKDROP}${item.backdrop_path}`:'';
  if(bd)el.style.backgroundImage=`url("${bd}")`;
}

// ════════════════════════════════
// HIDDEN PANEL
// ════════════════════════════════
function setupHiddenPanel(){
  document.getElementById('news-show-hidden')?.addEventListener('click',()=>showHiddenPanel('news',slideshows.news.mediaType));
  document.getElementById('upcoming-show-hidden')?.addEventListener('click',()=>showHiddenPanel('upcoming',slideshows.upcoming.mediaType));
  const overlay=document.getElementById('hidden-overlay');
  document.getElementById('hidden-close')?.addEventListener('click',()=>{overlay.style.display='none';});
  overlay?.addEventListener('click',e=>{if(e.target===overlay)overlay.style.display='none';});
}

function showHiddenPanel(ns,mediaType){
  const overlay=document.getElementById('hidden-overlay'),grid=document.getElementById('hidden-grid');
  if(!overlay||!grid)return;
  const hidden=hiddenItems[ns]||{};
  const ids=Object.keys(hidden);
  if(!ids.length){showToast('Keine ausgeblendeten Einträge.');return;}
  grid.innerHTML='';
  ids.forEach(id=>{
    const item=hidden[id];
    const card=document.createElement('div');card.className='hidden-card';card.id=`hc_${id}`;
    card.innerHTML=`${item.poster?`<img class="hidden-card-poster" src="${item.poster}" loading="lazy"/>`:'<div class="hidden-card-poster" style="aspect-ratio:2/3;background:var(--bg2);display:flex;align-items:center;justify-content:center;opacity:.4">🎬</div>'}<div class="hidden-card-body"><div class="hidden-card-title">${esc(item.title||id)}</div></div><button class="hidden-restore-btn">Einblenden</button>`;
    card.querySelector('.hidden-restore-btn').addEventListener('click',()=>{
      card.classList.add('restoring');
      card.addEventListener('transitionend',()=>{
        delete hidden[id];settings.hiddenItems=hiddenItems;autoSave();card.remove();
        if(ns==='news')loadNews(slideshows.news.mediaType,slideshows.news.tab);
        else loadUpcoming(slideshows.upcoming.mediaType,slideshows.upcoming.months);
        if(Object.keys(hidden).length===0)overlay.style.display='none';
      },{once:true});
    });
    grid.appendChild(card);
  });
  overlay.style.display='flex';
}

// ════════════════════════════════
// DETAIL POPUP
// ════════════════════════════════
async function showDetailPopup(tmdbId,tmdbType,title){
  const overlay=document.getElementById('detail-overlay');if(!overlay)return;
  overlay.style.display='flex';
  // Reset
  ['detail-title','detail-overview'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=id==='detail-title'?(title||'Lädt…'):''});
  document.getElementById('detail-poster').src='';
  document.getElementById('detail-backdrop').style.backgroundImage='';
  document.getElementById('detail-meta').innerHTML='';
  document.getElementById('detail-providers').innerHTML='';
  document.getElementById('detail-badges').innerHTML='';
  document.getElementById('detail-actions').innerHTML='';
  document.getElementById('detail-trailer-wrap').style.display='none';
  document.getElementById('detail-trailer-wv').setAttribute('src','about:blank');

  const data=await window.electronAPI.getTmdbDetail({id:tmdbId,type:tmdbType}).catch(()=>null);
  if(!data||data.error)return;
  const{detail,videos,providers}=data;if(!detail)return;

  const t=detail.title||detail.name||title;
  const poster=detail.poster_path?`${TMDB_IMG}${detail.poster_path}`:'';
  const backdrop=detail.backdrop_path?`${TMDB_BACKDROP}${detail.backdrop_path}`:'';
  const year=(detail.release_date||detail.first_air_date||'').substring(0,4);
  const runtime=detail.runtime?`${detail.runtime} Min.`:detail.episode_run_time?.[0]?`~${detail.episode_run_time[0]} Min./Ep.`:'';
  const rating=detail.vote_average?detail.vote_average.toFixed(1):null;
  const genres=(detail.genres||[]).map(g=>g.name).join(', ');

  document.getElementById('detail-title').textContent=t;
  document.getElementById('detail-overview').textContent=detail.overview||'Keine Beschreibung verfügbar.';
  const pEl=document.getElementById('detail-poster');if(pEl&&poster){pEl.src=poster;pEl.alt=t;}
  const bEl=document.getElementById('detail-backdrop');if(bEl&&backdrop)bEl.style.backgroundImage=`url("${backdrop}")`;

  document.getElementById('detail-badges').innerHTML=[year,runtime,rating?`★ ${rating}`:null,tmdbType==='tv'?'Serie':'Film'].filter(Boolean).map(p=>`<span class="detail-badge">${esc(p)}</span>`).join('');
  document.getElementById('detail-meta').innerHTML=[genres?`<div class="detail-meta-item"><span class="detail-meta-label">Genre: </span>${esc(genres)}</div>`:'',detail.vote_count?`<div class="detail-meta-item"><span class="detail-meta-label">Stimmen: </span>${detail.vote_count.toLocaleString('de')}</div>`:''].filter(Boolean).join('');

  // Trailer (YouTube embed ohne autoplay)
  const trailer=videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
  if(trailer){
    document.getElementById('detail-trailer-wrap').style.display='block';
    document.getElementById('detail-trailer-wv').setAttribute('src',`https://www.youtube-nocookie.com/embed/${trailer.key}?rel=0&modestbranding=1`);
  }

  // Provider – NUR tatsächlich verfügbare Dienste anzeigen
  const provWrap=document.getElementById('detail-providers');
  if(provWrap&&providers){
    const allProviders=[...(providers.flatrate||[]),(providers.rent||[]),(providers.buy||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i).slice(0,8);
    if(allProviders.length){
      provWrap.innerHTML=allProviders.map(p=>{
        const ourId=TMDB_PROVIDER_MAP[p.provider_id];
        const prov=ourId?PROVIDERS()[ourId]:null;
        const click=ourId&&prov?`onclick="openProvider('${ourId}')"`:ourId?'':'' ;
        return`<div class="detail-provider-chip" ${click} title="${esc(p.provider_name)}" style="${ourId?'cursor:pointer':''}"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;
      }).join('');
    }else{
      provWrap.innerHTML='<span style="font-size:11px;color:var(--tx3)">Nicht verfügbar in DE</span>';
    }
  }

  const actions=document.getElementById('detail-actions');
  if(actions){
    const wseUrl=`https://www.werstreamt.es/?q=${enc(t)}`;
    const googleUrl=`https://www.google.com/search?q=${enc(t+' stream deutsch')}`;
    const isInWl=!!watchlist.find(w=>w.id===`${tmdbType}_${tmdbId}`);
    actions.innerHTML=`
      <button class="detail-action-btn primary" id="detail-wse-btn">↗ Wo streamen?</button>
      <button class="detail-action-btn secondary" id="detail-google-btn">🔍 Google</button>
      <button class="detail-action-btn secondary" id="detail-wl-btn">${isInWl?'🔖 Gemerkt':'🔖 Merken'}</button>
    `;
    document.getElementById('detail-wse-btn').addEventListener('click',()=>openProviderAtUrl('werstreamt',wseUrl,'Werstreamt.es','persist:werstreamt'));
    document.getElementById('detail-google-btn').addEventListener('click',()=>window.electronAPI.openExternal(googleUrl));
    document.getElementById('detail-wl-btn').addEventListener('click',e=>{
      const wlId=`${tmdbType}_${tmdbId}`;
      if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.textContent='🔖 Merken';showToast('Entfernt');}
      else{watchlist.unshift({id:wlId,tmdbId,tmdbType,title:t,poster,releaseDate:detail.release_date||detail.first_air_date||'',mediaType:tmdbType==='tv'?'tv':'movie'});e.target.textContent='🔖 Gemerkt';showToast('Gemerkt!');}
      settings.watchlist=watchlist;autoSave();
    });
  }

  document.getElementById('detail-close').addEventListener('click',closeDetailPopup);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeDetailPopup();});
}

function closeDetailPopup(){
  document.getElementById('detail-overlay').style.display='none';
  document.getElementById('detail-trailer-wv').setAttribute('src','about:blank');
}
window.openProvider=id=>openProvider(id);
window.openProviderAtUrl=(id,url,name,part)=>openProviderAtUrl(id,url,name,part);

// ════════════════════════════════
// SEARCH
// ════════════════════════════════
function setupSearch(){
  const input=document.getElementById('search-input'),clear=document.getElementById('search-clear'),dd=document.getElementById('search-dropdown');
  let searchTimer=null,searchPage=1,lastQuery='';

  input?.addEventListener('focus',()=>{
    if(input.value.trim()&&dd.innerHTML)dd.style.display='block';
    else if(!input.value.trim()&&searchHistory.length)showSearchHistory(dd);
  });
  input?.addEventListener('input',()=>{
    const q=input.value.trim();clear.style.display=q?'block':'none';
    clearTimeout(searchTimer);
    if(!q){dd.style.display=searchHistory.length?'block':'none';if(searchHistory.length)showSearchHistory(dd);else{dd.innerHTML='';dd.style.display='none';}return;}
    lastQuery=q;searchPage=1;
    // Sofortige Anbieter-Vorschläge (kein Delay)
    showInstantSuggestions(q,dd);
    // TMDB-Suche mit kurzem Delay (200ms statt 420ms)
    searchTimer=setTimeout(()=>runSearch(q,1,dd),200);
  });
  clear?.addEventListener('click',()=>{input.value='';clear.style.display='none';dd.style.display='none';dd.innerHTML='';lastQuery='';});

  function showSearchHistory(dd){
    let html=`<div class="search-dd-section">Zuletzt gesucht <button class="search-dd-clear-history" id="dd-clear-all">Alle löschen</button></div>`;
    searchHistory.slice(0,8).forEach((q,i)=>{html+=`<div class="search-dd-history-item"><span class="search-dd-history-text" data-q="${esc(q)}">🕐 ${esc(q)}</span><button class="search-dd-history-del" data-i="${i}">✕</button></div>`;});
    dd.innerHTML=html;dd.style.display='block';
    dd.querySelector('#dd-clear-all')?.addEventListener('click',()=>{searchHistory=[];settings.searchHistory=[];autoSave();dd.style.display='none';});
    dd.querySelectorAll('.search-dd-history-text').forEach(el=>el.addEventListener('click',()=>{input.value=el.dataset.q;input.dispatchEvent(new Event('input'));}));
    dd.querySelectorAll('.search-dd-history-del').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();const i=parseInt(el.dataset.i);searchHistory.splice(i,1);settings.searchHistory=searchHistory;autoSave();showSearchHistory(dd);}));
  }

  function showInstantSuggestions(q,dd){
    const ql=q.toLowerCase();
    const provMatches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql)).sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
    if(!provMatches.length)return;
    let html=`<div class="search-dd-section">Anbieter</div>`;
    provMatches.slice(0,4).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span> ${esc(p.tag)}</div></div></div>`;});
    dd.innerHTML=html;dd.style.display='block';
    dd.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
  }

  async function runSearch(q,page=1,dd){
    dd.style.display='block';
    const ql=q.toLowerCase();
    const provMatches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql)).sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
    const ytId=extractYtId(q);
    let html='';

    if(provMatches.length&&page===1){html+=`<div class="search-dd-section">Anbieter</div>`;provMatches.slice(0,3).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`; });}
    if(ytId&&page===1){html+=`<div class="search-dd-section">YouTube</div><div class="search-dd-item" data-yt="${ytId}"><img class="search-dd-poster" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">YouTube Video abspielen</div><div class="search-dd-meta">Direkt öffnen</div></div></div>`;}

    if(!ytId){
      try{
        // TMDB-Suche (relevanter als OMDB)
        const tmdbData=await window.electronAPI.searchTmdb({query:q,page});
        const results=(tmdbData.results||[]).filter(r=>r.media_type!=='person'&&r.poster_path).slice(0,8);
        if(results.length){
          if(page===1)html+=`<div class="search-dd-section">Filme &amp; Serien</div>`;
          for(const item of results){
            const title=item.title||item.name||'Unbekannt';
            const year=(item.release_date||item.first_air_date||'').substring(0,4);
            const rating=item.vote_average?item.vote_average.toFixed(1):null;
            const type=item.media_type==='movie'?'Film':'Serie';
            const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';
            // Streaming-Provider für diesen Titel laden (parallel, nicht blockierend)
            html+=`<div class="search-dd-item search-dd-film" data-tmdb="${item.id}" data-type="${item.media_type}" data-title="${esc(title)}">
              ${poster?`<img class="search-dd-poster" src="${poster}" onerror="this.className='search-dd-poster-ph';this.outerHTML='<div class=search-dd-poster-ph>🎬</div>'"/>`:` <div class="search-dd-poster-ph">🎬</div>`}
              <div class="search-dd-info"><div class="search-dd-title">${esc(title)}</div>
              <div class="search-dd-meta"><span class="search-dd-badge">${type}</span>${year?`<span>${year}</span>`:''}${rating?`<span class="search-dd-rating">★ ${rating}</span>`:''}</div>
              <div class="search-dd-providers" id="chips_${item.id}" style="margin-top:4px"><span style="font-size:10px;color:var(--tx3)">Lädt…</span></div>
              </div></div>`;
          }
          const total=tmdbData.total_results||results.length;
          const hasMore=total>page*8;
          if(hasMore)html+=`<div class="search-dd-more" id="dd-more-btn">Weitere Ergebnisse ↓</div>`;
          else html+=`<div class="search-dd-no-more">Keine weiteren Ergebnisse.</div>`;
        }else if(!provMatches.length&&!ytId){html+=`<div style="padding:20px;text-align:center;font-size:13px;color:var(--tx2)">Keine Ergebnisse für „${esc(q)}"</div>`;}
      }catch{}
    }

    if(page===1)dd.innerHTML=html;
    else{const mb=document.getElementById('dd-more-btn');if(mb)mb.remove();const nm=dd.querySelector('.search-dd-no-more');if(nm)nm.remove();const temp=document.createElement('div');temp.innerHTML=html;temp.querySelectorAll('.search-dd-item').forEach(el=>dd.appendChild(el));const newMore=temp.querySelector('#dd-more-btn');if(newMore)dd.appendChild(newMore);const newNm=temp.querySelector('.search-dd-no-more');if(newNm)dd.appendChild(newNm);dd.scrollTo({top:dd.scrollHeight,behavior:'smooth'});}
    dd.style.display='block';

    // Events
    dd.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
    dd.querySelectorAll('[data-yt]').forEach(el=>el.addEventListener('click',()=>openProviderAtUrl('youtube',`https://www.youtube.com/watch?v=${el.dataset.yt}`,'YouTube',`persist:${getProfilePartition('youtube')}`)));
    dd.querySelectorAll('.search-dd-film').forEach(el=>{
      el.addEventListener('click',e=>{if(e.target.closest('.search-dd-provider-chip'))return;closeSearchDropdown();showDetailPopup(parseInt(el.dataset.tmdb),el.dataset.type,el.dataset.title);});
      // Streaming-Anbieter laden
      loadSearchProviderChips(parseInt(el.dataset.tmdb),el.dataset.type,el.dataset.title,`chips_${el.dataset.tmdb}`);
    });
    dd.querySelector('#dd-more-btn')?.addEventListener('click',()=>{searchPage++;runSearch(lastQuery,searchPage,dd);});
    addToSearchHistory(q);
  }

  function addToSearchHistory(q){if(!q||searchHistory.includes(q))return;searchHistory.unshift(q);searchHistory=searchHistory.slice(0,20);settings.searchHistory=searchHistory;autoSave();}
}

async function loadSearchProviderChips(tmdbId,type,title,containerId){
  try{
    const providers=await window.electronAPI.getStreamingProviders({tmdbId,type});
    const container=document.getElementById(containerId);if(!container)return;
    const all=[...(providers?.flatrate||[]),(providers?.rent||[]),(providers?.buy||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i).slice(0,4);
    if(all.length){
      container.innerHTML=all.map(p=>{
        const ourId=TMDB_PROVIDER_MAP[p.provider_id];
        return`<div class="search-dd-provider-chip"${ourId?` data-prov="${ourId}" data-url="${esc(PROVIDERS()[ourId]?.url||'')}"`:''}><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;
      }).join('')+`<div class="search-dd-provider-chip" data-google="${esc('https://www.google.com/search?q='+enc(title+' stream deutsch'))}">🔍</div>`;
      container.querySelectorAll('[data-prov]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProvider(el.dataset.prov);}));
      container.querySelectorAll('[data-google]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();window.electronAPI.openExternal(el.dataset.google);}));
    }else{container.innerHTML='<span style="font-size:10px;color:var(--tx3)">Nicht in DE verfügbar</span>';}
  }catch{const c=document.getElementById(containerId);if(c)c.innerHTML='';}
}

function closeSearchDropdown(){const dd=document.getElementById('search-dropdown');if(dd)dd.style.display='none';}
function extractYtId(s){const p=[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/^([a-zA-Z0-9_-]{11})$/];for(const r of p){const m=s.match(r);if(m)return m[1];}return null;}

// ════════════════════════════════
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid(){
  const grid=document.getElementById('providers-grid');if(!grid)return;
  grid.innerHTML='';
  const layout=settings.cardLayout||'normal';
  grid.className='providers-grid'+(layout!=='normal'?' '+layout:'');
  ['normal','compact','mini'].forEach(l=>{document.getElementById(`layout-${l}`)?.classList.toggle('active',l===layout);});

  const favs=settings.favorites||[];
  let sorted=Object.entries(PROVIDERS()).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  if(providerOrder.length)sorted=sorted.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai===-1&&bi===-1)return a[1].name.localeCompare(b[1].name);if(ai===-1)return 1;if(bi===-1)return-1;return ai-bi;});
  const favL=sorted.filter(([id])=>favs.includes(id)),rest=sorted.filter(([id])=>!favs.includes(id));
  if(favL.length){addLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}
  setupCardDragDrop(grid);
}

function addLabel(grid,text){const el=document.createElement('div');el.className='grid-section-label';el.textContent=text;grid.appendChild(el);}

function createCard(id,p,isFav){
  const card=document.createElement('div');card.className='provider-card';card.dataset.id=id;card.setAttribute('draggable','true');
  const imgUrl=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  const bgColor=(settings.cardBgColors||{})[id]||p.color+'33';
  const layout=settings.cardLayout||'normal';
  const isMini=layout==='mini';

  card.innerHTML=`
    ${p.quality&&!isMini?`<div class="card-quality-badge">${p.quality}</div>`:''}
    <button class="card-edit-btn" title="Karte anpassen">✏️</button>
    <div class="card-banner" style="${bgColor?`background:${bgColor}`:''}">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,${p.color}22 50%,transparent 80%)"></div>
      <div class="card-banner-img" style="${imgUrl?`background-image:url('${imgUrl}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:${opacity/100};transition:opacity .3s`:'opacity:0;position:absolute;inset:0'}"></div>
      <img class="card-favicon" src="${getFavicon(id,p)}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="position:relative;z-index:2;width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;background:${p.color}33">${p.name.charAt(0)}</div>
    </div>
    <div class="card-body"><div class="card-info"><span class="card-name">${p.name}</span>${!isMini?`<span class="card-tag">${p.tag}</span>`:''}</div>${!isMini?'<span class="card-arrow">→</span>':''}</div>
    <button class="card-bookmark${isFav?' active':''}" title="${isFav?'Favorit entfernen':'Favorit'}">
      <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path class="bm-fill" d="M1 1h10v15l-5-3.5L1 16z"/></svg>
    </button>
  `;

  card.querySelector('.card-bookmark').addEventListener('click',e=>{e.stopPropagation();toggleFavorite(id);});
  card.querySelector('.card-edit-btn').addEventListener('click',e=>{e.stopPropagation();openCardEditor(id,p);});
  card.addEventListener('click',e=>{if(!e.target.closest('.card-bookmark')&&!e.target.closest('.card-edit-btn'))openProvider(id);});
  return card;
}

function setupLayoutButtons(){['normal','compact','mini'].forEach(l=>{document.getElementById(`layout-${l}`)?.addEventListener('click',()=>{settings.cardLayout=l;autoSave();buildProviderGrid();});});}

function setupCardDragDrop(grid){
  let dragSrc=null,mouseX=0;
  grid.querySelectorAll('.provider-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{dragSrc=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-over-left,.drag-over-right').forEach(el=>{el.classList.remove('drag-over-left','drag-over-right');});});
    card.addEventListener('dragover',e=>{
      e.preventDefault();e.dataTransfer.dropEffect='move';
      if(card===dragSrc)return;
      grid.querySelectorAll('.drag-over-left,.drag-over-right').forEach(el=>{el.classList.remove('drag-over-left','drag-over-right');});
      const rect=card.getBoundingClientRect();const mid=rect.left+rect.width/2;
      if(e.clientX<mid)card.classList.add('drag-over-left');else card.classList.add('drag-over-right');
    });
    card.addEventListener('dragleave',()=>card.classList.remove('drag-over-left','drag-over-right'));
    card.addEventListener('drop',e=>{
      e.preventDefault();card.classList.remove('drag-over-left','drag-over-right');
      if(!dragSrc||dragSrc===card)return;
      const cards=[...grid.querySelectorAll('.provider-card')];
      const ids=cards.map(c=>c.dataset.id);
      const si=ids.indexOf(dragSrc.dataset.id),di=ids.indexOf(card.dataset.id);
      if(si>-1&&di>-1){ids.splice(si,1);const rect=card.getBoundingClientRect();const mid=rect.left+rect.width/2;const insertBefore=e.clientX<mid;ids.splice(insertBefore?di:di+1>ids.length?ids.length:di,0,dragSrc.dataset.id);}
      providerOrder=ids;settings.providerOrder=ids;autoSave();buildProviderGrid();
    });
  });
}

function toggleFavorite(id){
  const favs=settings.favorites||[];const idx=favs.indexOf(id);
  if(idx===-1)favs.push(id);else favs.splice(idx,1);
  settings.favorites=favs;autoSave();buildProviderGrid();buildSidebarSubMenus();
}

// ════════════════════════════════
// CARD EDITOR
// ════════════════════════════════
let cardEditorState={id:null};
function setupCardEditor(){
  document.getElementById('card-editor-close')?.addEventListener('click',()=>{document.getElementById('card-editor-overlay').style.display='none';});
  document.getElementById('card-editor-overlay')?.addEventListener('click',e=>{if(e.target===document.getElementById('card-editor-overlay'))document.getElementById('card-editor-overlay').style.display='none';});
  document.getElementById('card-ed-pick')?.addEventListener('click',async()=>{
    const url=await window.electronAPI.pickImage(`card_${cardEditorState.id}`);
    if(url){settings.cardImages[cardEditorState.id]=url;updateCardEditorPreview();autoSave();}
  });
  document.getElementById('card-ed-remove')?.addEventListener('click',()=>{
    delete settings.cardImages[cardEditorState.id];delete(settings.cardImageOffsets||{})[cardEditorState.id];
    delete(settings.cardBgOpacity||{})[cardEditorState.id];
    updateCardEditorPreview();autoSave();
  });
  ['card-ed-x','card-ed-y','card-ed-opacity'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',e=>{
      const val=parseInt(e.target.value);
      document.getElementById(id+'-val').textContent=(id==='card-ed-opacity'?val+'%':val+'px');
      if(id==='card-ed-x'){settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[cardEditorState.id]={...((settings.cardImageOffsets||{})[cardEditorState.id]||{}),x:val};}
      else if(id==='card-ed-y'){settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[cardEditorState.id]={...((settings.cardImageOffsets||{})[cardEditorState.id]||{}),y:val};}
      else if(id==='card-ed-opacity'){settings.cardBgOpacity=settings.cardBgOpacity||{};settings.cardBgOpacity[cardEditorState.id]=val;}
      updateCardEditorPreview();
    });
  });
  document.getElementById('card-ed-color')?.addEventListener('input',e=>{
    settings.cardBgColors=settings.cardBgColors||{};settings.cardBgColors[cardEditorState.id]=e.target.value+'55';
    document.getElementById('card-ed-color-text').value=e.target.value;updateCardEditorPreview();
  });
  document.getElementById('card-ed-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){document.getElementById('card-ed-color').value=e.target.value;settings.cardBgColors=settings.cardBgColors||{};settings.cardBgColors[cardEditorState.id]=e.target.value+'55';updateCardEditorPreview();}});
  document.getElementById('card-ed-save')?.addEventListener('click',()=>{autoSaveAndToast();buildProviderGrid();document.getElementById('card-editor-overlay').style.display='none';});
}

function openCardEditor(id,p){
  cardEditorState={id,p};
  document.getElementById('card-editor-title').textContent=`Karte: ${p.name}`;
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  document.getElementById('card-ed-x').value=off.x;document.getElementById('card-ed-x-val').textContent=off.x+'px';
  document.getElementById('card-ed-y').value=off.y;document.getElementById('card-ed-y-val').textContent=off.y+'px';
  document.getElementById('card-ed-opacity').value=opacity;document.getElementById('card-ed-opacity-val').textContent=opacity+'%';
  updateCardEditorPreview();
  document.getElementById('card-editor-overlay').style.display='flex';
}

function updateCardEditorPreview(){
  const id=cardEditorState.id;if(!id)return;
  const prev=document.getElementById('card-editor-preview');if(!prev)return;
  const img=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  const bgColor=(settings.cardBgColors||{})[id]||(cardEditorState.p?.color+'33')||'#333';
  prev.style.background=bgColor;
  if(img)prev.style.backgroundImage=`url("${img}")`;prev.style.backgroundSize='cover';prev.style.backgroundPosition=`calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;prev.style.opacity=opacity/100;
}

// ════════════════════════════════
// SIDEBAR SUBMENUS
// ════════════════════════════════
function buildSidebarSubMenus(){buildFavSub();buildProvSub();}
function buildFavSub(){
  const list=document.getElementById('nav-sub-favorites-list');if(!list)return;list.innerHTML='';
  const favs=(settings.favorites||[]).slice().sort((a,b)=>(PROVIDERS()[a]?.name||a).localeCompare(PROVIDERS()[b]?.name||b));
  if(!favs.length){const h=document.createElement('div');h.style.cssText='padding:5px 10px;font-size:11px;color:var(--tx3)';h.textContent='Keine Favoriten';list.appendChild(h);return;}
  favs.forEach(id=>{const p=PROVIDERS()[id];if(p)list.appendChild(makeSubBtn(id,p));});
}
function buildProvSub(){
  const list=document.getElementById('nav-sub-providers-list');if(!list)return;list.innerHTML='';
  Object.entries(PROVIDERS()).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>list.appendChild(makeSubBtn(id,p)));
}
function makeSubBtn(id,p){
  const btn=document.createElement('button');btn.className='nav-sub-btn';
  btn.innerHTML=`<img src="${getFavicon(id,p)}" onerror="this.outerHTML='<span style=\\'width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${esc(p.name)}`;
  btn.addEventListener('click',()=>openProvider(id));return btn;
}

// ════════════════════════════════
// PROVIDER ÖFFNEN
// ════════════════════════════════
function openProvider(id){
  const p=PROVIDERS()[id];if(!p)return;
  openProviderAtUrl(id,p.url,p.name,`persist:${getProfilePartition(id)}`);
}

function openProviderAtUrl(id,url,name,partition){
  const p=PROVIDERS()[id]||{url,name:name||id,partition:id,color:'#333',multiTab:false};
  if(!url)return;
  // Gleicher Provider aktiv → nur View zeigen, KEIN Reload
  if(currentProvider===id&&currentWebview){showView('stream');return;}
  if(pipProviderId===id){restoreFromPip();return;}
  if(currentWebview&&currentProvider&&currentProvider!==id){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}

  currentProvider=id;currentProvUrl=url;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent=p.name;
  document.getElementById('btn-watching').style.display='flex';
  // Hintergrundaudio-Button für Spotify/YouTube
  const bgBtn=document.getElementById('btn-bg-play');
  if(bgBtn)bgBtn.style.display=(p.bgAudio||id==='spotify'||id==='youtube'||id==='twitch')?'flex':'none';

  const part=partition||`persist:${getProfilePartition(id)}`;
  window.electronAPI.setupWebviewSession(part);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';

  const wv=document.createElement('webview');
  wv.setAttribute('src',url);
  wv.setAttribute('partition',part);
  wv.setAttribute('allowpopups','');
  wv.setAttribute('useragent',CHROME_UA);
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';

  if(p.multiTab||id==='twitch'||id==='youtube'){
    setupStreamTabs(id,wv,url,p.name);
    wv.addEventListener('new-window',e=>{if(e.url&&e.url.startsWith('http'))addStreamTab(id,e.url,e.frameName||e.url);});
  }else{
    document.getElementById('stream-tabs-bar').style.display='none';streamTabs=[];activeTabId=null;
    wv.addEventListener('new-window',e=>{if(e.url&&(e.url.startsWith('http')||e.url.startsWith('//')))wv.loadURL(e.url);});
  }

  currentWebview=wv;if(wrap)wrap.appendChild(wv);
  wv.addEventListener('did-start-loading',()=>showLoading(`${p.name}…`));
  wv.addEventListener('did-stop-loading',()=>{hideLoading();document.getElementById('btn-retry').style.display='none';addViewHistory({id,name:p.name,url,time:Date.now()});startWatchTimer(id);window.electronAPI.refreshSessionsNow(activeProfileId);});
  wv.addEventListener('did-fail-load',async e=>{
    if(e.errorCode===-3||e.errorCode===0)return;
    hideLoading();document.getElementById('btn-retry').style.display='flex';
    let diag='';try{const r=await window.electronAPI.checkUrl(url);diag=r.ok?`Erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`:`Fehler: ${r.error}`;}catch{}
    showWebviewError(p,url,e.errorCode,e.errorDescription,diag);
  });

  closeSearchDropdown();showView('stream');
}

// ════════════════════════════════
// STREAM TABS
// ════════════════════════════════
function setupStreamTabs(providerId,wv,url,title){
  streamTabs=[{id:'tab_0',title:title||url,url,webview:wv,muted:false}];
  activeTabId='tab_0';renderStreamTabs();
}
function addStreamTab(providerId,url,title){
  const id='tab_'+Date.now(),p=PROVIDERS()[providerId];
  const wv=document.createElement('webview');
  wv.setAttribute('src',url);wv.setAttribute('partition',`persist:${getProfilePartition(providerId)}`);
  wv.setAttribute('allowpopups','');wv.setAttribute('useragent',CHROME_UA);wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  wv.addEventListener('new-window',e=>{if(e.url&&e.url.startsWith('http'))addStreamTab(providerId,e.url,e.frameName||e.url);});
  wv.addEventListener('page-title-updated',e=>{const tab=streamTabs.find(t=>t.id===id);if(tab){tab.title=e.title;renderStreamTabs();}});
  window.electronAPI.setupWebviewSession(`persist:${getProfilePartition(providerId)}`);
  streamTabs.push({id,title:title||url,url,webview:wv,muted:false});
  switchToTab(id);
}
function switchToTab(id){
  activeTabId=id;const wrap=document.getElementById('webview-wrap');if(!wrap)return;
  wrap.innerHTML='';const tab=streamTabs.find(t=>t.id===id);
  if(tab?.webview){wrap.appendChild(tab.webview);currentWebview=tab.webview;}
  renderStreamTabs();
}
function closeStreamTab(id){
  const idx=streamTabs.findIndex(t=>t.id===id);if(idx===-1)return;
  streamTabs.splice(idx,1);
  if(streamTabs.length===0){document.getElementById('stream-tabs-bar').style.display='none';stopStream();return;}
  switchToTab(streamTabs[Math.max(0,idx-1)].id);
}
function renderStreamTabs(){
  const bar=document.getElementById('stream-tabs-bar'),cont=document.getElementById('stream-tabs');if(!bar||!cont)return;
  bar.style.display=streamTabs.length>0?'block':'none';cont.innerHTML='';
  streamTabs.forEach(tab=>{
    const el=document.createElement('div');el.className='stream-tab'+(tab.id===activeTabId?' active':'');
    el.innerHTML=`<span class="stream-tab-title">${esc(tab.title.substring(0,30))}</span><button class="stream-tab-mute" title="${tab.muted?'Ton an':'Muten'}">${tab.muted?'🔇':'🔊'}</button><button class="stream-tab-close">✕</button>`;
    el.querySelector('.stream-tab-title').addEventListener('click',()=>switchToTab(tab.id));
    el.querySelector('.stream-tab-mute').addEventListener('click',e=>{e.stopPropagation();tab.muted=!tab.muted;try{tab.webview.setAudioMuted(tab.muted);}catch{}renderStreamTabs();});
    el.querySelector('.stream-tab-close').addEventListener('click',e=>{e.stopPropagation();closeStreamTab(tab.id);});
    cont.appendChild(el);
  });
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function stopStream(){
  stopWatchTimer();if(isFullscreen)window.electronAPI.setFullscreen(false);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';
  currentWebview=null;currentProvider=null;currentProvUrl=null;
  streamTabs=[];activeTabId=null;document.getElementById('stream-tabs-bar').style.display='none';
  document.getElementById('btn-watching').style.display='none';showView('home');
}
function maybeMoveToPip(){if(currentWebview&&currentProvider){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}}

function setupStreamControls(){
  document.getElementById('back-btn')?.addEventListener('click',()=>{if(isFullscreen)window.electronAPI.setFullscreen(false);maybeMoveToPip();showView('home');});
  document.getElementById('btn-stop')?.addEventListener('click',()=>{if(!confirm('Stream beenden?'))return;stopStream();});
  document.getElementById('btn-pip')?.addEventListener('click',()=>{if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');}});
  document.getElementById('btn-fullscreen')?.addEventListener('click',()=>window.electronAPI.setFullscreen(!isFullscreen));
  document.getElementById('btn-retry')?.addEventListener('click',()=>{if(currentWebview&&currentProvUrl)currentWebview.loadURL(currentProvUrl);});
  document.getElementById('btn-second-window')?.addEventListener('click',()=>{if(currentProvider&&currentProvUrl)window.electronAPI.openSecondWindow({url:currentProvUrl,partition:`persist:${getProfilePartition(currentProvider)}`,title:PROVIDERS()[currentProvider]?.name});});
  document.getElementById('btn-bg-play')?.addEventListener('click',()=>{maybeMoveToPip();showView('home');});
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{if(!currentProvider)return;const p=PROVIDERS()[currentProvider];if(!confirm(`Von ${p.name} abmelden?`))return;window.electronAPI.clearProviderSession(activeProfileId,currentProvider);if(currentWebview)currentWebview.loadURL(p.url);window.electronAPI.refreshSessionsNow(activeProfileId);});
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));
}

function showWebviewError(p,url,code,desc,diag){
  const wrap=document.getElementById('webview-wrap');if(!wrap)return;
  const cdmNote=code?` Für Crunchyroll KAT-6005: Widevine CDM benötigt (Einstellungen → Mehr → Widevine).`:'';
  wrap.innerHTML=`<div class="webview-error"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>${esc(p.name)} nicht erreichbar</h3><p>${diag||'Keine Verbindung oder Einbettung blockiert.'}${cdmNote}</p>${code?`<span class="err-code">Fehlercode: ${code}</span>`:''}<div class="webview-error-actions"><button class="webview-error-btn primary" onclick="document.getElementById('btn-retry').click()">🔄 Erneut</button><button class="webview-error-btn secondary" onclick="window.electronAPI.openExternal('${url}')">↗ Browser</button></div></div>`;
}

// ════════════════════════════════
// WATCH TIME
// ════════════════════════════════
function startWatchTimer(id){stopWatchTimer();watchTimeTimer=setInterval(()=>window.electronAPI.recordWatchTime(id,60,activeProfileId),60000);}
function stopWatchTimer(){clearInterval(watchTimeTimer);watchTimeTimer=null;}
function addViewHistory(e){viewHistory=viewHistory.filter(h=>h.id!==e.id).slice(0,49);viewHistory.unshift(e);settings.viewHistory=viewHistory;autoSave();}

// ════════════════════════════════
// PIP
// ════════════════════════════════
function setupPip(){
  const pip=document.getElementById('pip-window');if(!pip)return;
  let drag=false,ox=0,oy=0;
  document.getElementById('pip-topbar')?.addEventListener('mousedown',e=>{drag=true;const r=pip.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();});
  document.addEventListener('mousemove',e=>{if(!drag)return;pip.style.left=Math.max(0,Math.min(window.innerWidth-pip.offsetWidth,e.clientX-ox))+'px';pip.style.top=Math.max(0,Math.min(window.innerHeight-pip.offsetHeight,e.clientY-oy))+'px';pip.style.right='auto';pip.style.bottom='auto';});
  document.addEventListener('mouseup',()=>drag=false);
  document.getElementById('pip-expand')?.addEventListener('click',restoreFromPip);
  document.getElementById('pip-close')?.addEventListener('click',()=>{pip.style.display='none';document.getElementById('pip-content').innerHTML='';pipProviderId=null;stopWatchTimer();});
}
function moveToPip(id,wv){
  const pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),title=document.getElementById('pip-title');if(!pip||!content)return;
  content.innerHTML='';if(wv?.parentNode)wv.parentNode.removeChild(wv);
  if(wv){wv.style.cssText='width:100%;height:100%;border:none;display:flex';content.appendChild(wv);}
  pipProviderId=id;if(title)title.textContent=PROVIDERS()[id]?.name||id;
  pip.style.left='auto';pip.style.top='auto';pip.style.right='24px';pip.style.bottom='24px';pip.style.display='flex';
}
function restoreFromPip(){
  if(!pipProviderId)return;
  const id=pipProviderId,pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),wrap=document.getElementById('webview-wrap');
  if(!content||!wrap)return;
  const wv=content.querySelector('webview');
  if(wv){wv.parentNode.removeChild(wv);wv.style.cssText='width:100%;height:100%;border:none;display:flex';wrap.innerHTML='';wrap.appendChild(wv);currentWebview=wv;}
  content.innerHTML='';pip.style.display='none';pipProviderId=null;currentProvider=id;
  document.getElementById('stream-title').textContent=PROVIDERS()[id]?.name||id;
  document.getElementById('btn-watching').style.display='flex';
  showView('stream');
}

// ════════════════════════════════
// FULLSCREEN
// ════════════════════════════════
function updateFullscreenUI(){
  const els=['stream-topbar','sidebar','titlebar','stream-tabs-bar'].map(id=>document.getElementById(id));
  const wrap=document.getElementById('webview-wrap'),btn=document.getElementById('btn-fullscreen');
  if(isFullscreen){els.forEach(el=>el?.classList.add('hidden'));if(wrap)wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';if(btn)btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg> Beenden`;}
  else{els.forEach(el=>el?.classList.remove('hidden'));if(wrap)wrap.style.cssText='';if(btn)btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> Vollbild`;document.getElementById('fs-exit-btn')?.classList.remove('visible');}
}
function setupFullscreenExit(){
  const btn=document.getElementById('fs-exit-btn');if(!btn)return;
  document.addEventListener('mousemove',e=>{if(!isFullscreen)return;const zone=113,cx=window.innerWidth/2;const inZ=Math.abs(e.clientX-cx)<zone/2&&e.clientY<zone;if(inZ){if(!fsHoverTimer)fsHoverTimer=setTimeout(()=>{btn.classList.add('visible');clearTimeout(fsAutoHide);fsAutoHide=setTimeout(()=>btn.classList.remove('visible'),3000);},1000);}else{clearTimeout(fsHoverTimer);fsHoverTimer=null;}});
  btn.addEventListener('click',()=>{window.electronAPI.setFullscreen(false);btn.classList.remove('visible');});
}
function setupESCKey(){document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isFullscreen)window.electronAPI.setFullscreen(false);});}

// ════════════════════════════════
// CLOCK
// ════════════════════════════════
function setupClock(){
  clearInterval(clockInterval);
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};
  widget.style.display='block';widget.style.left=(pos.x??16)+'px';widget.style.top=(pos.y??52)+'px';
  widget.style.right='auto';widget.style.bottom='auto';
  widget.style.color=clk.color||'#ff3b30';widget.style.opacity=String(clk.opacity??0.85);widget.style.fontSize=(clk.size||22)+'px';
  widget.style.background='none';widget.style.border='none';widget.style.padding='0';
  const tick=()=>{const n=new Date();timeEl.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}`;};
  tick();clockInterval=setInterval(tick,1000);
}
function previewClock(){
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const enabled=document.getElementById('clock-enabled')?.checked;
  const color=document.getElementById('clock-color-text')?.value||'#ff3b30';
  const opacity=(parseInt(document.getElementById('clock-opacity')?.value)||85)/100;
  const size=parseInt(document.getElementById('clock-size')?.value)||22;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=enabled?'Aktiviert':'Deaktiviert';
  if(!enabled){widget.style.display='none';return;}
  widget.style.display='block';widget.style.color=color;widget.style.opacity=String(opacity);widget.style.fontSize=size+'px';widget.style.background='none';widget.style.border='none';widget.style.padding='0';
}
function enableClockDragMode(enable){
  clockDragEnabled=enable;const widget=document.getElementById('clock-widget');if(!widget)return;
  if(enable)widget.classList.add('drag-mode');else widget.classList.remove('drag-mode');
  if(clockDragHandlers){widget.removeEventListener('mousedown',clockDragHandlers.down);document.removeEventListener('mousemove',clockDragHandlers.move);document.removeEventListener('mouseup',clockDragHandlers.up);clockDragHandlers=null;}
  if(!enable)return;
  let drag=false,ox=0,oy=0;
  function down(e){if(!clockDragEnabled)return;drag=true;const r=widget.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();}
  function move(e){if(!drag||!clockDragEnabled)return;widget.style.left=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox))+'px';widget.style.top=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy))+'px';widget.style.right='auto';widget.style.bottom='auto';}
  function up(){if(!drag)return;drag=false;const r=widget.getBoundingClientRect();settings.clock._pendingPos={x:Math.round(r.left),y:Math.round(r.top)};autoSave();}
  widget.addEventListener('mousedown',down);document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
  clockDragHandlers={down,move,up};
}
function setupClockContextMenu(){
  const widget=document.getElementById('clock-widget'),ctx=document.getElementById('clock-ctx-menu');if(!widget||!ctx)return;
  widget.addEventListener('contextmenu',e=>{e.preventDefault();ctx.style.left=e.clientX+'px';ctx.style.top=e.clientY+'px';ctx.style.display='block';});
  document.addEventListener('click',e=>{if(!ctx.contains(e.target))ctx.style.display='none';});
  document.getElementById('clock-ctx-disable')?.addEventListener('click',()=>{settings.clock.enabled=false;autoSave();setupClock();const ce=document.getElementById('clock-enabled');if(ce)ce.checked=false;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Deaktiviert';ctx.style.display='none';});
}

// ════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════
function setupSettingsPanel(){
  document.getElementById('btn-settings')?.addEventListener('click',openSettings);
  document.getElementById('settings-close')?.addEventListener('click',closeSettings);
  document.getElementById('settings-overlay')?.addEventListener('click',closeSettings);

  document.querySelectorAll('.stab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.stab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');document.getElementById(`stab-${tab.dataset.tab}`)?.classList.add('active');
      if(tab.dataset.tab==='account')buildSettingsAccountTab();
      if(tab.dataset.tab==='advanced')buildAdvancedTab();
    });
  });

  // Design
  linkColor('set-accent-color','set-accent-text');
  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.dataset.reset;
      if(k==='accentColor'){settings.accentColor='#30c5bb';applyAccent('#30c5bb');const ca=document.getElementById('set-accent-color'),ta=document.getElementById('set-accent-text');if(ca)ca.value='#30c5bb';if(ta)ta.value='#30c5bb';}
      else if(k==='appBgImage'){settings.appBgImage='';updatePreview('prev-app-bg',null);applyBgImage(null);}
      else if(k==='clockColor'){settings.clock.color='#ff3b30';const c=document.getElementById('clock-color'),t=document.getElementById('clock-color-text');if(c)c.value='#ff3b30';if(t)t.value='#ff3b30';previewClock();}
      autoSave();
    });
  });
  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn=>btn.addEventListener('click',()=>handlePickImage(btn.dataset.pick)));
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');
  fsr?.addEventListener('input',()=>{const v=parseInt(fsr.value);if(fsv)fsv.textContent=v+'px';settings.fontSize=v;applyFontSize(v);autoSave();});
  document.getElementById('particles-toggle')?.addEventListener('change',e=>{settings.particlesEnabled=e.target.checked;const sec=document.getElementById('particles-options-section');if(sec)sec.style.display=e.target.checked?'flex':'none';setupParticles();autoSave();});
  // Partikel-Optionen
  document.getElementById('particle-count')?.addEventListener('input',e=>{document.getElementById('particle-count-val').textContent=e.target.value;particlesConfig.count=parseInt(e.target.value);settings.particlesConfig=particlesConfig;setupParticles();autoSave();});
  document.getElementById('particle-size')?.addEventListener('input',e=>{document.getElementById('particle-size-val').textContent=e.target.value;particlesConfig.size=parseFloat(e.target.value);settings.particlesConfig=particlesConfig;setupParticles();autoSave();});
  document.querySelectorAll('[data-particle-shape]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('[data-particle-shape]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');particlesConfig.shape=btn.dataset.particleShape;settings.particlesConfig=particlesConfig;setupParticles();autoSave();});});
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');settings.language=btn.dataset.lang;applyLanguage(btn.dataset.lang);autoSave();});});
  // Accent text
  document.getElementById('set-accent-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){settings.accentColor=e.target.value;applyAccent(e.target.value);autoSave();}});

  // Clock live
  linkColor('clock-color','clock-color-text');
  ['clock-enabled','clock-color','clock-opacity','clock-size'].forEach(id=>{document.getElementById(id)?.addEventListener('input',previewClock);document.getElementById(id)?.addEventListener('change',saveClock);});
  document.getElementById('clock-color-text')?.addEventListener('input',previewClock);
  document.getElementById('clock-opacity')?.addEventListener('input',e=>{document.getElementById('clock-opacity-val').textContent=e.target.value+'%';});
  document.getElementById('clock-size')?.addEventListener('input',e=>{document.getElementById('clock-size-val').textContent=e.target.value+'px';});

  // Account
  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{if(!confirm('Von ALLEN Diensten abmelden?'))return;window.electronAPI.clearAllSessions(activeProfileId);buildSettingsAccountTab();});
  document.getElementById('btn-google-auth')?.addEventListener('click',async()=>{
    const hint=document.getElementById('google-auth-hint');if(hint)hint.style.display='block';
    window.electronAPI.openGoogleAuthBrowser(activeProfileId);
    document.getElementById('btn-google-auth').textContent='⏳ Warte auf Login (30s)…';
    setTimeout(()=>{document.getElementById('btn-google-auth').textContent='🔐 Im Browser bei Google anmelden';if(hint)hint.style.display='none';},32000);
  });

  // Advanced
  document.getElementById('btn-check-updates')?.addEventListener('click',async()=>{
    const res=await window.electronAPI.checkForUpdates().catch(()=>null);
    const el=document.getElementById('update-check-result');
    if(el)el.textContent=res?.error?`Fehler: ${res.error}`:(res?'Update gefunden!':'Keine Updates verfügbar.');
  });
  document.getElementById('btn-vpn-settings')?.addEventListener('click',()=>{document.getElementById('vpn-panel').style.right='0';});
  document.getElementById('btn-rename-profile')?.addEventListener('click',()=>{const name=prompt('Neuer Name:',profiles.find(p=>p.id===activeProfileId)?.name||'');if(name){const p=profiles.find(p=>p.id===activeProfileId);if(p){p.name=name;window.electronAPI.setProfiles(profiles);buildProfileSelect();}}});
  document.getElementById('btn-delete-profile')?.addEventListener('click',()=>{if(profiles.length<=1){showToast('Mindestens ein Profil erforderlich.');return;}if(!confirm('Profil löschen?'))return;window.electronAPI.clearAllSessions(activeProfileId);profiles=profiles.filter(p=>p.id!==activeProfileId);window.electronAPI.setProfiles(profiles);switchProfile(profiles[0].id);buildProfileSelect();});
  document.getElementById('btn-add-custom-provider')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='flex');
  document.getElementById('btn-open-css-editor')?.addEventListener('click',()=>{document.getElementById('css-editor-panel').style.right='0';document.getElementById('custom-css-input').value=customCSS;});
  document.getElementById('widevine-info-link')?.addEventListener('click',e=>{e.preventDefault();window.electronAPI.openExternal('https://github.com/nicehash/electron-widevinecdm');});

  setupLayoutButtons();
  syncSettingsUI();
}

function openSettings(){
  document.getElementById('settings-panel')?.classList.add('open');document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();syncSettingsUI();buildAdvancedTab();
  setTimeout(()=>enableClockDragMode(true),200);
}
function closeSettings(){
  enableClockDragMode(false);saveClock();
  document.getElementById('settings-panel')?.classList.remove('open');document.getElementById('settings-overlay')?.classList.remove('open');
  document.getElementById('css-editor-panel').style.right='-440px';document.getElementById('vpn-panel').style.right='-340px';
  autoSaveAndToast();
}
function saveClock(){
  const pPos=settings.clock._pendingPos;
  settings.clock={enabled:!!document.getElementById('clock-enabled')?.checked,position:pPos||settings.clock.position||{x:16,y:52},color:document.getElementById('clock-color-text')?.value||'#ff3b30',opacity:(parseInt(document.getElementById('clock-opacity')?.value)||85)/100,size:parseInt(document.getElementById('clock-size')?.value)||22};
  delete settings.clock._pendingPos;setupClock();autoSave();
}

async function handlePickImage(dest){
  const url=await window.electronAPI.pickImage(dest);if(!url)return;
  if(dest==='appBgImage'){settings.appBgImage=url;updatePreview('prev-app-bg',url);applyBgImage(url);}
  autoSave();
}
function updatePreview(id,url){const el=document.getElementById(id);if(!el)return;if(url)el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;else el.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;}
function linkColor(cId,tId){const c=document.getElementById(cId),t=document.getElementById(tId);if(!c||!t)return;c.addEventListener('input',()=>t.value=c.value);t.addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test(t.value))c.value=t.value;});}

function syncSettingsUI(){
  const acc=settings.accentColor||'#30c5bb';const ca=document.getElementById('set-accent-color'),ta=document.getElementById('set-accent-text');if(ca)ca.value=acc;if(ta)ta.value=acc;
  if(settings.appBgImage)updatePreview('prev-app-bg',settings.appBgImage);
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');const fs=settings.fontSize||14;if(fsr)fsr.value=fs;if(fsv)fsv.textContent=fs+'px';
  const pt=document.getElementById('particles-toggle');if(pt){pt.checked=!!settings.particlesEnabled;const sec=document.getElementById('particles-options-section');if(sec)sec.style.display=settings.particlesEnabled?'flex':'none';}
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===(settings.language||'de')));
  document.querySelectorAll('[data-particle-shape]').forEach(b=>b.classList.toggle('active',b.dataset.particleShape===(particlesConfig.shape||'circle')));
  const pc=document.getElementById('particle-count'),pcv=document.getElementById('particle-count-val');if(pc)pc.value=particlesConfig.count||80;if(pcv)pcv.textContent=particlesConfig.count||80;
  const ps=document.getElementById('particle-size'),psv=document.getElementById('particle-size-val');if(ps)ps.value=particlesConfig.size||1.5;if(psv)psv.textContent=particlesConfig.size||1.5;
  // Clock
  const clk=settings.clock||{};const ce=document.getElementById('clock-enabled');if(ce)ce.checked=!!clk.enabled;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const col=clk.color||'#ff3b30';const cc=document.getElementById('clock-color'),ct=document.getElementById('clock-color-text');if(cc)cc.value=col;if(ct)ct.value=col;
  const op=Math.round((clk.opacity??0.85)*100);const co=document.getElementById('clock-opacity'),cv=document.getElementById('clock-opacity-val');if(co)co.value=op;if(cv)cv.textContent=op+'%';
  const sz=clk.size||22;const cs=document.getElementById('clock-size'),csv=document.getElementById('clock-size-val');if(cs)cs.value=sz;if(csv)csv.textContent=sz+'px';
}

// ════════════════════════════════
// ACCOUNT TAB
// ════════════════════════════════
async function buildSettingsAccountTab(){
  const list=document.getElementById('session-list');if(!list)return;
  list.innerHTML='<div class="loading-sessions">Wird geprüft…</div>';
  const res=await window.electronAPI.getAllSessions(activeProfileId);
  renderSessionList(res);
}
function renderSessionList(res){
  const list=document.getElementById('session-list');if(!list)return;list.innerHTML='';
  const sorted=Object.entries(PROVIDERS()).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const on=sorted.filter(([id])=>!!res[id]),off=sorted.filter(([id])=>!res[id]);
  if(on.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Angemeldet';list.appendChild(lbl);on.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,true)));}
  if(off.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Nicht angemeldet';list.appendChild(lbl);off.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,false)));}
}
function makeSessionItem(id,p,on){
  const item=document.createElement('div');item.className='session-item';
  item.innerHTML=`<span class="session-dot ${on?'active':''}"></span><span class="session-name">${esc(p.name)}</span><span class="session-status">${on?'✓':''}</span>${on?`<button class="session-logout-btn">Abmelden</button>`:''}`;
  item.querySelector('.session-logout-btn')?.addEventListener('click',()=>{window.electronAPI.clearProviderSession(activeProfileId,id);if(currentProvider===id)stopStream();buildSettingsAccountTab();});
  return item;
}

// ════════════════════════════════
// ADVANCED TAB
// ════════════════════════════════
function buildAdvancedTab(){
  // Verlauf
  const histList=document.getElementById('view-history-list');
  if(histList)histList.innerHTML=viewHistory.slice(0,12).map(h=>`<div style="font-size:12px;padding:3px 0;color:var(--tx2);display:flex;align-items:center;gap:7px"><img src="${getFavicon(h.id)}" width="13" height="13" style="border-radius:2px;object-fit:contain"/>${esc(h.name)}</div>`).join('')||'<div style="font-size:12px;color:var(--tx3)">Kein Verlauf</div>';
  document.getElementById('btn-clear-history')?.addEventListener('click',()=>{viewHistory=[];settings.viewHistory=[];autoSave();buildAdvancedTab();});
  // Custom providers
  buildCustomProviderList();
  // Widevine Status
  checkWidevineStatus();
}

async function checkWidevineStatus(){
  const el=document.getElementById('widevine-status');if(!el)return;
  const status=await window.electronAPI.getWidevineStatus().catch(()=>null);
  if(status?.installed)el.innerHTML=`<span style="color:var(--acc)">✓ CDM installiert: ${status.path}</span>`;
  else el.innerHTML=`<span style="color:var(--tx3)">✗ CDM nicht gefunden. Pfad: ${status?.cdmDir||'userData/WidevineCdm'}</span>`;
}

// ════════════════════════════════
// CSS EDITOR
// ════════════════════════════════
function setupCSSEditor(){
  document.getElementById('css-editor-back')?.addEventListener('click',()=>{document.getElementById('css-editor-panel').style.right='-440px';});
  document.getElementById('custom-css-input')?.addEventListener('input',e=>{customCSS=e.target.value;applyCustomCSS(customCSS);settings.customCSS=customCSS;autoSave();});
  document.getElementById('css-reset-btn')?.addEventListener('click',()=>{customCSS='';applyCustomCSS('');settings.customCSS='';if(document.getElementById('custom-css-input'))document.getElementById('custom-css-input').value='';autoSave();});
}

// ════════════════════════════════
// VPN PANEL
// ════════════════════════════════
function setupVPNPanel(){
  document.getElementById('vpn-panel-back')?.addEventListener('click',()=>{document.getElementById('vpn-panel').style.right='-340px';});
  document.getElementById('btn-check-vpn-panel')?.addEventListener('click',async()=>{
    const el=document.getElementById('vpn-status-result');if(el)el.textContent='Prüfe…';
    const r=await window.electronAPI.checkVpn();
    const badge=document.getElementById('vpn-badge');
    if(r.error){if(el)el.textContent=`Fehler: ${r.error}`;return;}
    if(badge){badge.textContent=r.isVpn?`🛡 VPN (${r.org})`:r.ip?`🌍 ${r.country}`:'' ;badge.className=`vpn-badge ${r.isVpn?'vpn-on':'vpn-off'}`;badge.style.display='block';}
    if(el)el.innerHTML=`IP: <b>${r.ip}</b><br>${r.city}, ${r.country}<br>${r.org}<br>${r.isVpn?'<span style="color:var(--acc)">✓ VPN aktiv</span>':'<span style="color:var(--tx3)">Kein VPN</span>'}`;
  });
  document.getElementById('btn-nordvpn')?.addEventListener('click',()=>window.electronAPI.openExternal('https://nordvpn.com/'));
  document.getElementById('btn-vpn-connect')?.addEventListener('click',()=>{const host=document.getElementById('custom-vpn-host').value.trim();if(!host){showToast('Bitte Host eingeben.');return;}window.electronAPI.openExternal(`https://${host}`);showToast('Öffne VPN-Seite im Browser…');});
}

// ════════════════════════════════
// PLUGINS TAB
// ════════════════════════════════
function setupPluginsTab(){
  buildPluginPresets('');
  document.getElementById('plugin-search')?.addEventListener('input',e=>buildPluginPresets(e.target.value));
  updatePluginDomainCount();
}

function buildPluginPresets(filter){
  const container=document.getElementById('plugin-presets-list');if(!container)return;
  const filtered=PLUGIN_PRESETS.filter(p=>!filter||p.name.toLowerCase().includes(filter.toLowerCase())||p.desc.toLowerCase().includes(filter.toLowerCase()));
  container.innerHTML='';
  filtered.forEach(preset=>{
    const isInst=installedPlugins.has(preset.id);
    const div=document.createElement('div');div.className='plugin-preset';
    div.innerHTML=`<div class="plugin-preset-info"><div class="plugin-preset-name">${esc(preset.name)}</div><div class="plugin-preset-desc">${esc(preset.desc)}</div></div>`;
    let btn;
    if(preset.note){btn=document.createElement('button');btn.className='plugin-preset-btn info';btn.textContent='Info';btn.addEventListener('click',()=>showToast(preset.note,6000));}
    else if(isInst){btn=document.createElement('button');btn.className='plugin-preset-btn remove';btn.textContent='Entfernen';btn.addEventListener('click',()=>{installedPlugins.delete(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));extraAdDomains=[];window.electronAPI.applyExtraAdDomains([]);updatePluginDomainCount();buildPluginPresets(filter);});}
    else{btn=document.createElement('button');btn.className='plugin-preset-btn install';btn.textContent='Installieren';btn.addEventListener('click',async()=>{btn.textContent='Lädt…';btn.disabled=true;const r=await window.electronAPI.fetchAdblockList(preset.url);if(r.ok){extraAdDomains=[...new Set([...extraAdDomains,...r.domains])];window.electronAPI.applyExtraAdDomains(extraAdDomains);installedPlugins.add(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));updatePluginDomainCount();buildPluginPresets(filter);}else{btn.textContent='Fehler';btn.disabled=false;}});}
    div.appendChild(btn);container.appendChild(div);
  });
}

function updatePluginDomainCount(){const el=document.getElementById('plugin-domain-count');if(el)el.textContent=extraAdDomains.length;}

// ════════════════════════════════
// WATCHLIST BUILD
// ════════════════════════════════
function buildWatchlist(cat='all'){
  const sort=document.getElementById('wl-sort')?.value||'alpha';
  let items=watchlist.filter(i=>cat==='all'||i.mediaType===cat);
  if(sort==='alpha')items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
  else items=[...items].sort((a,b)=>{if(!a.releaseDate)return 1;if(!b.releaseDate)return-1;return a.releaseDate.localeCompare(b.releaseDate);});
  const content=document.getElementById('watchlist-content');if(!content)return;content.innerHTML='';
  if(!items.length){content.innerHTML='<div class="wl-empty">Noch nichts gemerkt.<br>Klicke bei Filmen/Serien auf 🔖</div>';return;}
  const grid=document.createElement('div');grid.className='watchlist-grid';
  items.forEach(item=>{
    const card=document.createElement('div');card.className='wl-card';
    const poster=item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy" onerror="this.style.display='none'"/>`:'<div class="wl-card-poster-ph">🎬</div>';
    const dateStr=item.releaseDate?new Date(item.releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${esc(item.title)}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}</div><button class="wl-card-remove">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();watchlist=watchlist.filter(w=>w.id!==item.id);settings.watchlist=watchlist;autoSave();buildWatchlist(cat);});
    card.addEventListener('click',()=>showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title));
    grid.appendChild(card);
  });
  content.appendChild(grid);
}

// ════════════════════════════════
// STATS VIEW
// ════════════════════════════════
async function buildStatsView(){
  const stats=await window.electronAPI.getStreamStats(activeProfileId);
  const content=document.getElementById('stats-content');if(!content)return;
  const entries=Object.entries(stats).filter(([,v])=>v.total>0).sort((a,b)=>b[1].total-a[1].total);
  if(!entries.length){content.innerHTML='<div style="color:var(--tx2);font-size:13px">Noch keine Stream-Daten.</div>';return;}
  const maxSecs=Math.max(...entries.map(e=>e[1].total),1);
  // Top 3
  const top3=entries.slice(0,3);
  content.innerHTML=`<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">⏱ Meiste Streamzeit</h3>`;
  top3.forEach(([id,data])=>{
    const p=PROVIDERS()[id];if(!p)return;
    const hours=(data.total/3600).toFixed(1);const pct=Math.round((data.total/maxSecs)*100);
    const wrap=document.createElement('div');wrap.className='stats-bar-wrap';
    wrap.innerHTML=`<div class="stats-bar-label"><span>${esc(p.name)}</span><span>${hours}h</span></div><div class="stats-bar"><div class="stats-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>`;
    content.appendChild(wrap);
  });
  // Wochentage
  const days=['So','Mo','Di','Mi','Do','Fr','Sa'];
  const dayTotals=Array(7).fill(0);
  entries.forEach(([,data])=>{if(data.byDay)data.byDay.forEach((s,i)=>dayTotals[i]+=s);});
  const maxDay=Math.max(...dayTotals,1);
  const dayWrap=document.createElement('div');dayWrap.style.cssText='margin-top:20px';
  dayWrap.innerHTML=`<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">📅 Wochentage</h3>`+
    days.map((d,i)=>`<div class="stats-bar-wrap"><div class="stats-bar-label"><span>${d}</span><span>${(dayTotals[i]/3600).toFixed(1)}h</span></div><div class="stats-bar"><div class="stats-bar-fill" style="width:${Math.round((dayTotals[i]/maxDay)*100)}%;background:var(--acc)"></div></div></div>`).join('');
  content.appendChild(dayWrap);
  // Achievements
  buildAchievements(stats);
}

function buildAchievements(stats){
  const content=document.getElementById('achievements-content');if(!content)return;
  content.innerHTML=`<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">🏆 Achievements</h3>`;
  const earnedIds=new Set(JSON.parse(localStorage.getItem(`achievements_${activeProfileId}`)||'[]'));
  ACHIEVEMENTS.forEach(ach=>{
    const earned=ach.check(stats);
    if(earned&&!earnedIds.has(ach.id)){earnedIds.add(ach.id);localStorage.setItem(`achievements_${activeProfileId}`,JSON.stringify([...earnedIds]));setTimeout(()=>{window.electronAPI.showNotification('🏆 Achievement freigeschaltet!',`${ach.icon} ${ach.name}: ${ach.desc}`);},500);}
    const card=document.createElement('div');card.className=`achievement-card${earned?' earned':''}`;
    card.innerHTML=`${ach.icon} <div><div style="font-weight:600;font-size:13px">${esc(ach.name)}</div><div style="font-size:11px;opacity:.7">${esc(ach.desc)}</div></div>`;
    content.appendChild(card);
  });
}

// ════════════════════════════════
// CUSTOM PROVIDERS
// ════════════════════════════════
function setupCustomProviderModal(){
  document.getElementById('cp-save')?.addEventListener('click',()=>{
    const name=document.getElementById('cp-name').value.trim();
    const url=document.getElementById('cp-url').value.trim();
    const color=document.getElementById('cp-color').value;
    if(!name||!url){showToast('Name und URL erforderlich.');return;}
    const id=`custom_${Date.now()}`;
    customProviders[id]={name,tag:'Eigener Anbieter',url,color,partition:id,quality:'–'};
    settings.customProviders=customProviders;autoSave();
    buildProviderGrid();buildSidebarSubMenus();buildCustomProviderList();
    document.getElementById('custom-provider-modal').style.display='none';
  });
  document.getElementById('cp-cancel')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='none');
}

function buildCustomProviderList(){
  const list=document.getElementById('custom-providers-list');if(!list)return;list.innerHTML='';
  Object.entries(customProviders).forEach(([id,p])=>{
    const item=document.createElement('div');item.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bor);font-size:13px;color:var(--tx)';
    item.innerHTML=`<span style="flex:1">${esc(p.name)}</span><button class="settings-danger-btn" style="width:auto;padding:4px 10px;font-size:11px">✕</button>`;
    item.querySelector('button').addEventListener('click',()=>{delete customProviders[id];settings.customProviders=customProviders;autoSave();buildProviderGrid();buildSidebarSubMenus();buildCustomProviderList();});
    list.appendChild(item);
  });
}

// ════════════════════════════════
// TOAST / LOADING
// ════════════════════════════════
let toastTimeout=null;
function showToast(msg,duration=3000){const t=document.getElementById('error-toast');if(!t)return;t.textContent=msg;t.style.background='rgba(48,197,187,.9)';t.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),duration);}
function showLoading(text='Wird geladen…'){document.getElementById('loading-text').textContent=text;document.getElementById('loading-overlay').classList.add('active');}
function hideLoading(){document.getElementById('loading-overlay').classList.remove('active');}

// ════════════════════════════════
// TITLEBAR
// ════════════════════════════════
function setupTitlebar(){
  document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',()=>window.electronAPI.close());
}

// ════════════════════════════════
// START
// ════════════════════════════════
document.addEventListener('DOMContentLoaded',init);
