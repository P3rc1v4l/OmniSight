'use strict';

// ════════════════════════════════
// PROVIDERS & CONFIG
// ════════════════════════════════
const PROVIDERS = {
  apple:        { name:'Apple TV+',      tag:'Apple Originals',          url:'https://tv.apple.com',                    color:'#555555', partition:'persist:apple',        quality:'4K' },
  ard:          { name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.ardmediathek.de',             color:'#003D6B', partition:'persist:ard',          quality:'HD' },
  burning:      { name:'BurningSeries',  tag:'Serien & Anime',            url:'https://bs.to',                           color:'#C0392B', partition:'persist:burning',      quality:'HD' },
  cineto:       { name:'Cine.to',        tag:'Filme & Serien',            url:'https://cine.to',                         color:'#8B5CF6', partition:'persist:cineto',       quality:'HD' },
  crunchyroll:  { name:'Crunchyroll',    tag:'Anime & Manga',             url:'https://www.crunchyroll.com',             color:'#F47521', partition:'persist:crunchyroll',  quality:'4K' },
  dazn:         { name:'DAZN',           tag:'Sport Live-Streams',        url:'https://www.dazn.com',                    color:'#F8D200', partition:'persist:dazn',         quality:'4K' },
  disney:       { name:'Disney+',        tag:'Marvel, Star Wars & mehr',  url:'https://www.disneyplus.com',              color:'#113CCF', partition:'persist:disney',       quality:'4K' },
  hbomax:       { name:'Max (HBO)',       tag:'HBO Originals & mehr',      url:'https://www.max.com',                     color:'#0031DB', partition:'persist:hbomax',      quality:'4K' },
  joyn:         { name:'Joyn',           tag:'Kostenlos streamen',        url:'https://www.joyn.de',                     color:'#E4001B', partition:'persist:joyn',         quality:'HD' },
  mubi:         { name:'MUBI',           tag:'Arthouse & Kino',           url:'https://mubi.com',                        color:'#213F5E', partition:'persist:mubi',         quality:'HD' },
  netflix:      { name:'Netflix',        tag:'Filme & Serien',            url:'https://www.netflix.com',                 color:'#E50914', partition:'persist:netflix',      quality:'4K' },
  paramountplus:{ name:'Paramount+',     tag:'Paramount Originals',       url:'https://www.paramountplus.com',           color:'#0064FF', partition:'persist:paramountplus',quality:'4K' },
  prime:        { name:'Prime Video',    tag:'Amazon Originals',          url:'https://www.primevideo.com',              color:'#00A8E1', partition:'persist:prime',        quality:'4K' },
  rtl:          { name:'RTL+',           tag:'RTL Serien & Shows',        url:'https://plus.rtl.de',                     color:'#FF6B00', partition:'persist:rtl',          quality:'HD' },
  skygo:        { name:'Sky Go',         tag:'Sky Serien & Sport',        url:'https://www.sky.de/entertainment/sky-go', color:'#00205B', partition:'persist:skygo',        quality:'HD' },
  twitch:       { name:'Twitch',         tag:'Live-Streams & Gaming',     url:'https://www.twitch.tv',                   color:'#9146FF', partition:'persist:twitch',       quality:'1080p' },
  youtube:      { name:'YouTube',        tag:'Videos & Streams',          url:'https://www.youtube.com',                 color:'#FF0000', partition:'persist:youtube',      quality:'4K' },
  zdf:          { name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.zdf.de',                      color:'#163A6A', partition:'persist:zdf',          quality:'HD' },
};

const SEARCH_URLS = {
  netflix:      t=>`https://www.netflix.com/search?q=${enc(t)}`,
  prime:        t=>`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${enc(t)}`,
  disney:       t=>`https://www.disneyplus.com/search/${enc(t)}`,
  crunchyroll:  t=>`https://www.crunchyroll.com/search?q=${enc(t)}`,
  youtube:      t=>`https://www.youtube.com/results?search_query=${enc(t)}`,
  twitch:       t=>`https://www.twitch.tv/search?term=${enc(t)}`,
  hbomax:       t=>`https://www.max.com/search?q=${enc(t)}`,
  apple:        t=>`https://tv.apple.com/search?term=${enc(t)}`,
  joyn:         t=>`https://www.joyn.de/serien?search=${enc(t)}`,
  ard:          t=>`https://www.ardmediathek.de/suche/${enc(t)}`,
  zdf:          t=>`https://www.zdf.de/suche?q=${enc(t)}`,
  rtl:          t=>`https://plus.rtl.de/suche?q=${enc(t)}`,
  mubi:         t=>`https://mubi.com/de/films?q=${enc(t)}`,
};

const PLUGIN_PRESETS = [
  { id:'easylist',   name:'EasyList',           desc:'Standard Ad-Blocker (2M+ Domains)', url:'https://easylist.to/easylist/easylist.txt' },
  { id:'easylist-de',name:'EasyList Germany',   desc:'Deutsche Werbung blockieren',       url:'https://easylist.to/easylistgermany/easylistgermany.txt' },
  { id:'easyprivacy',name:'EasyPrivacy',         desc:'Tracking & Analytics blockieren',   url:'https://easylist.to/easylist/easyprivacy.txt' },
  { id:'ublock',     name:'uBlock Origin Filter',desc:'uBlock Origin Filterliste',         url:'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt' },
  { id:'fanboy',     name:'Fanboy Annoyance',    desc:'Cookie-Banner & Popups blockieren', url:'https://easylist.to/easylist/fanboy-annoyance.txt' },
  { id:'adguard',    name:'AdGuard Base',        desc:'AdGuard Basisliste',                url:'https://filters.adtidy.org/extension/chromium/filters/2.txt' },
  { id:'malware',    name:'Malware Filter',      desc:'Schädliche Seiten blockieren',      url:'https://raw.githubusercontent.com/nickcoutsos/netblock/master/blocklist.txt' },
  { id:'youtube-ads',name:'YouTube Ad-Skip',     desc:'YouTube Pre-Roll Ads blockieren',   url:'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt' },
  // Chrome-Extensions-Links (öffnen im Browser)
  { id:'ublock-crx', name:'uBlock Origin (Chrome)', desc:'Im Chrome Web Store installieren', chromeUrl:'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm' },
  { id:'adguard-crx',name:'AdGuard (Chrome)',    desc:'Im Chrome Web Store installieren',  chromeUrl:'https://chrome.google.com/webstore/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg' },
];

const I18N = {
  de: { overview:'Übersicht', favorites:'Favoriten', watchlist:'Gemerkt', news:'Neuigkeiten', upcoming:'Upcoming', providers:'Anbieter', settings:'Einstellungen', watchingNow:'Schaut gerade', noStream:'Kein Stream aktiv', back:'Zurück', fullscreen:'Vollbild', miniPlayer:'Miniplayer', stop:'Stop', logout:'Abmelden', search:'Film, Serie, YouTube oder Anbieter suchen…', trending:'Trending', newTab:'Neu', trendingMovies:'🔥 Trending Filme', trendingShows:'🔥 Trending Serien' },
  en: { overview:'Overview', favorites:'Favorites', watchlist:'Watchlist', news:'What\'s New', upcoming:'Upcoming', providers:'Providers', settings:'Settings', watchingNow:'Now Watching', noStream:'No stream active', back:'Back', fullscreen:'Fullscreen', miniPlayer:'Mini Player', stop:'Stop', logout:'Sign out', search:'Search movies, shows, YouTube or providers…', trending:'Trending', newTab:'New', trendingMovies:'🔥 Trending Movies', trendingShows:'🔥 Trending Shows' },
};

function getFavicon(id){
  const d={apple:'tv.apple.com',ard:'ardmediathek.de',burning:'bs.to',cineto:'cine.to',crunchyroll:'crunchyroll.com',dazn:'dazn.com',disney:'disneyplus.com',hbomax:'max.com',joyn:'joyn.de',mubi:'mubi.com',netflix:'netflix.com',paramountplus:'paramountplus.com',prime:'primevideo.com',rtl:'plus.rtl.de',skygo:'sky.de',twitch:'twitch.tv',youtube:'youtube.com',zdf:'zdf.de'};
  return `https://www.google.com/s2/favicons?sz=64&domain=${d[id]||'example.com'}`;
}

const TMDB_IMG='https://image.tmdb.org/t/p/w300';
const TMDB_BACKDROP='https://image.tmdb.org/t/p/w1280';
function enc(s){return encodeURIComponent(s);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

// ════════════════════════════════
// STATE
// ════════════════════════════════
let currentProvider  = null;
let currentWebview   = null;
let currentProviderUrl= null;
let pipProviderId    = null;
let isFullscreen     = false;
let fsHoverTimer     = null;
let fsAutoHide       = null;
let clockInterval    = null;
let clockDragging    = false;
let settings         = {};
let profiles         = [];
let activeProfileId  = 'default';
let imgEditorState   = {providerId:null,url:'',x:0,y:0};
let extraAdDomains   = [];
let searchTimer      = null;
let searchPage       = 1;
let lastQuery        = '';
let installedPlugins = new Set();
let hiddenItems      = {news:{movies:{},shows:{}},upcoming:{movies:{},shows:{}}};
let watchlist        = [];
let searchHistory    = [];
let viewHistory      = [];
let providerOrder    = [];
let lang             = 'de';
let particlesAnim    = null;
let customCSS        = '';
let clockUnsaved     = false; // nur für Drag

const slideshows = {
  movies:    {items:[],idx:0,timer:null,tab:'trending',type:'movies',ns:'news'},
  shows:     {items:[],idx:0,timer:null,tab:'trending',type:'shows',ns:'news'},
  upmovies:  {items:[],idx:0,timer:null,tab:'upcoming',type:'movies',ns:'upcoming'},
  upshows:   {items:[],idx:0,timer:null,tab:'upcoming',type:'shows',ns:'upcoming'},
};

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.clock            = settings.clock            || {enabled:false,position:{x:16,y:52},color:'#ffffff',opacity:0.85,size:22};
  settings.fontSize         = settings.fontSize         || 14;
  settings.accentColor      = settings.accentColor      || '#30c5bb';
  settings.hiddenItems      = settings.hiddenItems      || {news:{movies:{},shows:{}},upcoming:{movies:{},shows:{}}};
  settings.watchlist        = settings.watchlist        || [];
  settings.searchHistory    = settings.searchHistory    || [];
  settings.viewHistory      = settings.viewHistory      || [];
  settings.providerOrder    = settings.providerOrder    || [];
  settings.language         = settings.language         || 'de';
  settings.particlesEnabled = settings.particlesEnabled || false;
  settings.customCSS        = settings.customCSS        || '';

  hiddenItems   = settings.hiddenItems;
  watchlist     = settings.watchlist;
  searchHistory = settings.searchHistory;
  viewHistory   = settings.viewHistory;
  providerOrder = settings.providerOrder;
  lang          = settings.language;
  customCSS     = settings.customCSS;

  applyFontSize(settings.fontSize);
  applySettings(settings, false);
  applyLanguage(lang);
  applyCustomCSS(customCSS);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  extraAdDomains = await window.electronAPI.getExtraAdDomains();

  // Profiles
  profiles = await window.electronAPI.getProfiles();
  activeProfileId = await window.electronAPI.getActiveProfile();
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
  setupImageEditor();
  setupPluginsTab();
  setupClockContextMenu();
  setupParticles();
  setupUpdateBanner();
  checkOnlineStatus();

  window.electronAPI.onFullscreenChange(v=>{isFullscreen=v;updateFullscreenUI();});
  window.electronAPI.onSessionsCleared(()=>buildSettingsAccountTab());

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();

  // Offline-Check alle 30s
  setInterval(checkOnlineStatus, 30000);
  // Watchlist-Notifications prüfen
  setTimeout(checkWatchlistNotifications, 5000);
}

// ════════════════════════════════
// LANGUAGE
// ════════════════════════════════
function t(key){return I18N[lang]?.[key]||I18N['de'][key]||key;}
function applyLanguage(l){lang=l;}

// ════════════════════════════════
// THEME
// ════════════════════════════════
function setTheme(th,save=true){
  document.documentElement.setAttribute('data-theme',th);
  const tog=document.getElementById('theme-toggle');
  if(tog) tog.checked=(th==='light');
  if(save) window.electronAPI.setTheme(th);
}
function setupThemeToggle(){
  document.getElementById('theme-toggle')?.addEventListener('change',e=>setTheme(e.target.checked?'light':'dark'));
}

// ════════════════════════════════
// FONT SIZE
// ════════════════════════════════
function applyFontSize(px){
  document.documentElement.style.setProperty('--fs',px+'px');
}

// ════════════════════════════════
// CUSTOM CSS
// ════════════════════════════════
function applyCustomCSS(css){
  let el=document.getElementById('custom-css-style');
  if(!el){el=document.createElement('style');el.id='custom-css-style';document.head.appendChild(el);}
  el.textContent=css||'';
}

// ════════════════════════════════
// PARTICLES
// ════════════════════════════════
function setupParticles(){
  const canvas=document.getElementById('particles-canvas');
  if(!canvas) return;
  const enabled=settings.particlesEnabled;
  canvas.style.display=enabled?'block':'none';
  if(!enabled){if(particlesAnim){cancelAnimationFrame(particlesAnim);particlesAnim=null;}return;}
  const ctx=canvas.getContext('2d');
  let w=canvas.width=window.innerWidth,h=canvas.height=window.innerHeight;
  const particles=Array.from({length:60},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.5,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,op:Math.random()*.4+.1}));
  window.addEventListener('resize',()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;});
  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(48,197,187,${p.op})`;ctx.fill();
    });
    particlesAnim=requestAnimationFrame(tick);
  }
  tick();
}

// ════════════════════════════════
// ONLINE CHECK
// ════════════════════════════════
async function checkOnlineStatus(){
  const online=await window.electronAPI.checkOnline();
  const banner=document.getElementById('offline-banner');
  if(banner) banner.style.display=online?'none':'flex';
}

// ════════════════════════════════
// UPDATE BANNER
// ════════════════════════════════
function setupUpdateBanner(){
  const banner=document.getElementById('update-banner');
  const dlBtn=document.getElementById('btn-download-update');
  const installBtn=document.getElementById('btn-install-update');
  const dismissBtn=document.getElementById('btn-dismiss-update');

  window.electronAPI.onUpdateAvailable(info=>{
    if(banner){banner.style.display='flex';banner.querySelector('span').textContent=`🚀 Update v${info.version} verfügbar!`;}
  });
  window.electronAPI.onUpdateDownloaded(()=>{
    if(dlBtn) dlBtn.style.display='none';
    if(installBtn) installBtn.style.display='block';
  });
  dlBtn?.addEventListener('click',()=>{dlBtn.textContent='Wird heruntergeladen…';dlBtn.disabled=true;});
  installBtn?.addEventListener('click',()=>window.electronAPI.installUpdate());
  dismissBtn?.addEventListener('click',()=>{if(banner)banner.style.display='none';});
}

// ════════════════════════════════
// PROFILES
// ════════════════════════════════
function buildProfileSelect(){
  const sel=document.getElementById('profile-select');
  if(!sel) return;
  sel.innerHTML='';
  profiles.forEach(p=>{
    const opt=document.createElement('option');
    opt.value=p.id; opt.textContent=p.name;
    if(p.id===activeProfileId) opt.selected=true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change',()=>switchProfile(sel.value));
}

function switchProfile(id){
  // Aktuelles Profil-Data speichern
  const cur=profiles.find(p=>p.id===activeProfileId);
  if(cur){cur.favorites=settings.favorites;cur.watchlist=watchlist;cur.searchHistory=searchHistory;cur.viewHistory=viewHistory;}
  // Neues Profil laden
  const next=profiles.find(p=>p.id===id);
  if(next){
    activeProfileId=id;
    settings.favorites=next.favorites||[];
    watchlist=next.watchlist||[];
    searchHistory=next.searchHistory||[];
    viewHistory=next.viewHistory||[];
    window.electronAPI.setActiveProfile(id);
    window.electronAPI.setProfiles(profiles);
    buildProviderGrid();buildSidebarSubMenus();buildWatchlist();
  }
}

document.getElementById('btn-add-profile')?.addEventListener('click',()=>{
  const name=prompt('Name für das neue Profil:');
  if(!name) return;
  const id=`profile_${Date.now()}`;
  profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});
  window.electronAPI.setProfiles(profiles);
  buildProfileSelect();
  switchProfile(id);
});

// ════════════════════════════════
// SETTINGS APPLY
// ════════════════════════════════
function applySettings(s,save=true){
  const root=document.documentElement;
  const mc=document.getElementById('main-content');
  if(s.appBgImage){
    if(mc){mc.style.backgroundImage=`url("${s.appBgImage}")`;mc.style.backgroundSize='cover';mc.style.backgroundPosition='center';mc.classList.add('has-bg');}
    root.style.setProperty('--bgs','rgba(10,10,20,0.75)');
  }else{
    if(mc){mc.style.backgroundImage='';mc.classList.remove('has-bg');}
    root.style.removeProperty('--bgs');
  }
  const acc=s.accentColor||'#30c5bb';
  root.style.setProperty('--acc',acc);
  const rgb=hexToRgb(acc);
  if(rgb) root.style.setProperty('--accg',`rgba(${rgb},.18)`);
  const li=document.getElementById('logo-img');
  if(li) li.src='assets/icon.png';
  Object.entries(s.cardImages||{}).forEach(([id,url])=>{
    const el=document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
    if(!el) return;
    if(url){const off=(s.cardImageOffsets||{})[id]||{x:0,y:0};el.style.backgroundImage=`url("${url}")`;el.style.backgroundPosition=`calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;el.style.opacity='1';}
    else{el.style.backgroundImage='';el.style.opacity='0';}
  });
  setupClock();
  if(save) window.electronAPI.setSettings(s);
}

function hexToRgb(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null;}

// ════════════════════════════════
// TITLEBAR
// ════════════════════════════════
function setupTitlebar(){
  document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',()=>window.electronAPI.close());
}

// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation(){
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v=btn.dataset.view;
      if(v==='home'){maybeMoveToPip();showView('home');}
      else if(v==='stream'){if(!currentProvider&&!pipProviderId)showView('nothing');else if(currentProvider)showView('stream');else restoreFromPip();}
      else if(v==='news'){showView('news');loadNews();}
      else if(v==='upcoming'){showView('upcoming');loadUpcoming(1);}
      else if(v==='watchlist'){showView('watchlist');buildWatchlist();}
      else showView(v);
    });
  });
  setupToggle('nav-fav-toggle','nav-sub-favorites');
  setupToggle('nav-providers-toggle','nav-sub-providers');
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));

  // Upcoming range change
  document.getElementById('upcoming-range')?.addEventListener('change',e=>loadUpcoming(parseInt(e.target.value)));

  // Sidebar search filter
  document.getElementById('fav-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-favorites-list',e.target.value));
  document.getElementById('prov-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-providers-list',e.target.value));
}

function setupToggle(btnId,subId){
  const btn=document.getElementById(btnId),sub=document.getElementById(subId);
  btn?.addEventListener('click',()=>{btn.classList.toggle('open');sub?.classList.toggle('open');});
}

function filterSubMenu(listId,q){
  const list=document.getElementById(listId);
  if(!list) return;
  list.querySelectorAll('.nav-sub-btn').forEach(btn=>{
    btn.style.display=btn.textContent.toLowerCase().includes(q.toLowerCase())?'flex':'none';
  });
}

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
    if(e.key==='Escape'&&isFullscreen) window.electronAPI.setFullscreen(false);
  });
}

// ════════════════════════════════
// WATCHLIST NOTIFICATIONS
// ════════════════════════════════
async function checkWatchlistNotifications(){
  if(!watchlist.length) return;
  const today=new Date().toISOString().split('T')[0];
  watchlist.forEach(item=>{
    if(item.releaseDate&&item.releaseDate>=today&&item.releaseDate<=today){
      window.electronAPI.showNotification('OmniSight',`🎬 ${item.title} ist heute erschienen!`);
    }
  });
}

// ════════════════════════════════
// WATCHLIST BUILD
// ════════════════════════════════
function buildWatchlist(){
  const content=document.getElementById('watchlist-content');
  if(!content) return;
  const cat=document.getElementById('wl-category-filter')?.value||'all';
  const sort=document.getElementById('wl-sort')?.value||'alpha';

  let items=watchlist.filter(i=>cat==='all'||i.mediaType===cat);
  if(sort==='alpha') items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
  else items=[...items].sort((a,b)=>{if(!a.releaseDate)return 1;if(!b.releaseDate)return -1;return a.releaseDate.localeCompare(b.releaseDate);});

  content.innerHTML='';
  if(!items.length){content.innerHTML='<div class="wl-empty">Noch nichts gemerkt.<br>Klicke bei Filmen und Serien auf das + Symbol.</div>';return;}

  const grid=document.createElement('div');grid.className='watchlist-grid';
  items.forEach(item=>{
    const card=document.createElement('div');card.className='wl-card';
    const poster=item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy" onerror="this.style.display='none'"/>`:`<div class="wl-card-poster-ph">🎬</div>`;
    const dateStr=item.releaseDate?new Date(item.releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${esc(item.title)}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}</div><button class="wl-card-remove" title="Entfernen">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();removeFromWatchlist(item.id);});
    card.addEventListener('click',()=>showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title));
    grid.appendChild(card);
  });
  content.appendChild(grid);
}

function addToWatchlist(item){
  if(watchlist.find(w=>w.id===item.id)) return;
  watchlist.unshift(item);
  settings.watchlist=watchlist;
  window.electronAPI.setSettings(settings);
  showToast(`${item.title} zur Merkliste hinzugefügt`);
}

function removeFromWatchlist(id){
  watchlist=watchlist.filter(w=>w.id!==id);
  settings.watchlist=watchlist;
  window.electronAPI.setSettings(settings);
  buildWatchlist();
}

document.getElementById('wl-category-filter')?.addEventListener('change',buildWatchlist);
document.getElementById('wl-sort')?.addEventListener('change',buildWatchlist);

// ════════════════════════════════
// DETAIL POPUP
// ════════════════════════════════
async function showDetailPopup(tmdbId,tmdbType,title){
  const overlay=document.getElementById('detail-overlay');
  if(!overlay) return;
  overlay.style.display='flex';

  document.getElementById('detail-title').textContent=title||'Lädt…';
  document.getElementById('detail-overview').textContent='Wird geladen…';
  document.getElementById('detail-poster').src='';
  document.getElementById('detail-backdrop').style.backgroundImage='';
  document.getElementById('detail-meta').innerHTML='';
  document.getElementById('detail-providers').innerHTML='';
  document.getElementById('detail-badges').innerHTML='';
  document.getElementById('detail-actions').innerHTML='';
  const twrap=document.getElementById('detail-trailer-wrap');
  if(twrap) twrap.style.display='none';

  const data=await window.electronAPI.getTmdbDetail({id:tmdbId,type:tmdbType}).catch(()=>null);
  if(!data||data.error) return;

  const {detail,videos,providers}=data;
  if(!detail) return;

  const t=detail.title||detail.name||title;
  const overview=detail.overview||'Keine Beschreibung verfügbar.';
  const poster=detail.poster_path?`${TMDB_IMG}${detail.poster_path}`:'';
  const backdrop=detail.backdrop_path?`${TMDB_BACKDROP}${detail.backdrop_path}`:'';
  const year=(detail.release_date||detail.first_air_date||'').substring(0,4);
  const runtime=detail.runtime?`${detail.runtime} Min.`:detail.episode_run_time?.[0]?`~${detail.episode_run_time[0]} Min./Episode`:'';
  const rating=detail.vote_average?detail.vote_average.toFixed(1):null;
  const genres=(detail.genres||[]).map(g=>g.name).join(', ');

  document.getElementById('detail-title').textContent=t;
  document.getElementById('detail-overview').textContent=overview;
  const pEl=document.getElementById('detail-poster');
  if(pEl&&poster){pEl.src=poster;pEl.alt=t;}
  const bEl=document.getElementById('detail-backdrop');
  if(bEl&&backdrop) bEl.style.backgroundImage=`url("${backdrop}")`;

  // Badges
  const badges=document.getElementById('detail-badges');
  if(badges){
    const parts=[];
    if(year) parts.push(year);
    if(runtime) parts.push(runtime);
    if(rating) parts.push(`★ ${rating}`);
    if(tmdbType==='tv') parts.push('Serie');else parts.push('Film');
    badges.innerHTML=parts.map(p=>`<span class="detail-badge">${esc(p)}</span>`).join('');
  }

  // Meta
  const meta=document.getElementById('detail-meta');
  if(meta){
    const rows=[];
    if(genres) rows.push(`<div class="detail-meta-item"><span class="detail-meta-label">Genre: </span>${esc(genres)}</div>`);
    if(detail.vote_count) rows.push(`<div class="detail-meta-item"><span class="detail-meta-label">Bewertungen: </span>${detail.vote_count.toLocaleString('de')}</div>`);
    if(detail.original_language) rows.push(`<div class="detail-meta-item"><span class="detail-meta-label">Sprache: </span>${detail.original_language.toUpperCase()}</div>`);
    meta.innerHTML=rows.join('');
  }

  // Trailer
  const trailer=videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
  if(trailer&&twrap){
    twrap.style.display='block';
    const wv=document.getElementById('detail-trailer-wv');
    if(wv) wv.setAttribute('src',`https://www.youtube.com/embed/${trailer.key}?autoplay=0`);
  }

  // Providers
  const provWrap=document.getElementById('detail-providers');
  if(provWrap){
    provWrap.innerHTML='';
    if(providers){
      const all=[...(providers.flatrate||[]),(providers.rent||[]),(providers.buy||[])];
      const unique=all.filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i).slice(0,8);
      if(unique.length){
        unique.forEach(p=>{
          const chip=document.createElement('div');chip.className='detail-provider-chip';
          chip.innerHTML=`<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}`;
          chip.title=p.provider_name;
          provWrap.appendChild(chip);
        });
      }else{
        provWrap.innerHTML='<span style="font-size:11px;color:var(--tx3)">Keine Streaming-Daten</span>';
      }
    }
  }

  // Actions
  const actions=document.getElementById('detail-actions');
  if(actions){
    const wseUrl=`https://www.werstreamt.es/?q=${enc(t)}`;
    const googleUrl=`https://www.google.com/search?q=${enc(t+' stream deutsch')}`;
    actions.innerHTML=`
      <button class="detail-action-btn primary" onclick="openProviderAtUrl('','${esc(wseUrl)}','werstreamt.es','persist:werstreamt')">↗ Wo streamen?</button>
      <button class="detail-action-btn secondary" onclick="window.electronAPI.openExternal('${esc(googleUrl)}')">🔍 Google</button>
      <button class="detail-action-btn secondary" id="wl-add-btn">+ Merken</button>
    `;
    document.getElementById('wl-add-btn')?.addEventListener('click',()=>{
      addToWatchlist({
        id:`${tmdbType}_${tmdbId}`,tmdbId,tmdbType,title:t,
        poster,releaseDate:detail.release_date||detail.first_air_date||'',
        mediaType:tmdbType==='tv'?(detail.genres?.some(g=>g.id===16)?'anime':'tv'):'movie',
      });
    });
  }

  // Close
  const closeBtn=document.getElementById('detail-close');
  closeBtn?.addEventListener('click',closeDetailPopup);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeDetailPopup();});
}

function closeDetailPopup(){
  const overlay=document.getElementById('detail-overlay');
  if(overlay) overlay.style.display='none';
  const wv=document.getElementById('detail-trailer-wv');
  if(wv) wv.setAttribute('src','about:blank');
}

// ════════════════════════════════
// NEWS
// ════════════════════════════════
async function loadNews(){
  const data=await window.electronAPI.getTrending().catch(()=>({}));
  slideshows.movies.items=(data.movies||[]).filter(m=>!hiddenItems.news?.movies?.[m.id]);
  slideshows.shows.items =(data.shows ||[]).filter(s=>!hiddenItems.news?.shows ?.[s.id]);
  slideshows.movies.tab='trending';
  slideshows.shows.tab='trending';
  buildSlideshow('movies');
  buildSlideshow('shows');

  document.querySelectorAll('.news-tab[data-news-tab]').forEach(tab=>{
    tab.replaceWith(tab.cloneNode(true));
  });
  document.querySelectorAll('.news-tab[data-news-tab]').forEach(tab=>{
    tab.addEventListener('click',async()=>{
      const type=tab.dataset.type,which=tab.dataset.newsTab;
      document.querySelectorAll(`.news-tab[data-type="${type}"]`).forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const label=document.getElementById(`${type==='movies'?'movies':'shows'}-half-title`);
      const labels={movies:{trending:'🔥 Trending Filme',new:'✨ Neue Filme'},shows:{trending:'🔥 Trending Serien',new:'✨ Neue Serien'}};
      if(label) label.textContent=labels[type][which];
      let nd;
      if(which==='trending') nd=await window.electronAPI.getTrending().catch(()=>({}));
      else nd=await window.electronAPI.getNewReleases().catch(()=>({}));
      const raw=type==='movies'?nd.movies||[]:nd.shows||[];
      slideshows[type].items=raw.filter(i=>!hiddenItems.news?.[type]?.[i.id]);
      slideshows[type].tab=which;
      buildSlideshow(type);
    });
  });

  // Hidden-Toggle
  document.getElementById('movies-show-hidden')?.addEventListener('click',()=>showHiddenPanel('news','movies'));
  document.getElementById('shows-show-hidden')?.addEventListener('click',()=>showHiddenPanel('news','shows'));
}

// ════════════════════════════════
// UPCOMING
// ════════════════════════════════
async function loadUpcoming(months=1){
  const data=await window.electronAPI.getUpcoming(months).catch(()=>({}));
  slideshows.upmovies.items=(data.movies||[]).filter(m=>!hiddenItems.upcoming?.movies?.[m.id]);
  slideshows.upshows.items =(data.shows ||[]).filter(s=>!hiddenItems.upcoming?.shows ?.[s.id]);
  buildSlideshow('upmovies');
  buildSlideshow('upshows');
  document.getElementById('upmovies-show-hidden')?.addEventListener('click',()=>showHiddenPanel('upcoming','movies'));
  document.getElementById('upshows-show-hidden')?.addEventListener('click', ()=>showHiddenPanel('upcoming','shows'));
}

// Sync timer: movies & shows laufen synchron, manuelles Klicken → 10s Pause dann resync
function buildSlideshow(key){
  const ss=slideshows[key];
  const isUpcoming=key.startsWith('up');
  const trackId=key+'-track', dotsId=key+'-dots';
  const prevId=key+'-prev', nextId=key+'-next';
  const bgId=isUpcoming?(key==='upmovies'?'upcoming-movies-bg':'upcoming-shows-bg'):(key==='movies'?'news-movies-bg':'news-shows-bg');

  clearInterval(ss.timer);
  ss.idx=0;

  const track=document.getElementById(trackId),dots=document.getElementById(dotsId);
  if(!track||!dots) return;
  track.innerHTML=''; dots.innerHTML='';

  const items=ss.items;
  if(!items.length){track.innerHTML='<div style="color:rgba(255,255,255,.5);padding:20px;font-size:13px">Keine Daten.</div>';return;}

  items.forEach((item,i)=>{
    const title=item.title||item.name||'Unbekannt';
    const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:null;
    const rating=item.vote_average?item.vote_average.toFixed(1):null;
    const date=(item.release_date||item.first_air_date||'').substring(0,4);
    const releaseDate=item.release_date||item.first_air_date||'';
    const fmtDate=releaseDate?new Date(releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short'}):null;

    const card=document.createElement('div');
    card.className='slide-card'+(i===0?' active-slide':'');
    card.dataset.idx=i;
    card.innerHTML=`
      ${poster?`<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">`:`<div class="slide-card-poster-ph"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
      <button class="slide-card-hide" title="Ausblenden" onclick="event.stopPropagation();hideItem('${isUpcoming?'upcoming':'news'}','${key.includes('shows')||key.includes('up')&&key==='upshows'?'shows':'movies'}',${item.id})">✕</button>
      <button class="slide-card-add" title="Merken" onclick="event.stopPropagation();addToWatchlist({id:'${key.includes('tv')||key.includes('shows')?'tv':'movie'}_${item.id}',tmdbId:${item.id},tmdbType:'${key.includes('tv')||key.includes('shows')?'tv':'movie'}',title:'${esc(title)}',poster:'${poster||''}',releaseDate:'${releaseDate}',mediaType:'${key.includes('shows')?'tv':'movie'}'})">+</button>
      <div class="slide-card-body">
        <div class="slide-card-title">${esc(title)}</div>
        <div class="slide-card-meta">
          ${fmtDate?`<span>📅 ${fmtDate}</span>`:date?`<span>${date}</span>`:''}
          ${rating?`<span class="slide-card-rating">★ ${rating}</span>`:''}
        </div>
      </div>
    `;
    card.addEventListener('click',()=>{
      const type=key.includes('shows')||key==='upshows'?'tv':'movie';
      showDetailPopup(item.id,type,title);
    });
    track.appendChild(card);

    // Dot
    const dot=document.createElement('button');dot.className='slide-dot'+(i===0?' active':'');
    dot.addEventListener('click',()=>goToSlide(key,i,true));
    dots.appendChild(dot);
  });

  // Arrows (Event-Listener neu setzen)
  const prev=document.getElementById(prevId),next=document.getElementById(nextId);
  if(prev){prev.onclick=()=>goToSlide(key,ss.idx-1,true);}
  if(next){next.onclick=()=>goToSlide(key,ss.idx+1,true);}

  // Hintergrundbild setzen
  updateNewsBg(key,items[0]);

  // Auto-Advance
  ss.timer=setInterval(()=>goToSlide(key,ss.idx+1,false),5000);
}

function goToSlide(key,idx,manual=false){
  const ss=slideshows[key];
  if(!ss.items.length) return;
  idx=((idx%ss.items.length)+ss.items.length)%ss.items.length;
  ss.idx=idx;

  const track=document.getElementById(key+'-track'),dots=document.getElementById(key+'-dots');
  if(!track||!dots) return;

  const cards=track.querySelectorAll('.slide-card');
  cards.forEach((c,i)=>c.classList.toggle('active-slide',i===idx));
  if(cards[idx]) cards[idx].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  dots.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));

  // Hintergrund
  updateNewsBg(key,ss.items[idx]);

  clearInterval(ss.timer);
  // Manuell → 10s, dann sync mit dem anderen Slideshow
  const delay=manual?10000:5000;
  ss.timer=setInterval(()=>goToSlide(key,ss.idx+1,false),delay);

  // Sync: Nach 10s manuellem Klick → gleiche Position wie Partner
  if(manual){
    const partner=key==='movies'?'shows':key==='shows'?'movies':null;
    if(partner){
      setTimeout(()=>{
        const pss=slideshows[partner];
        // Partner auf gleichen relativen Index setzen
        goToSlide(partner,pss.idx,false);
      },10000);
    }
  }
}

function updateNewsBg(key,item){
  const isUpcoming=key.startsWith('up');
  const bgId=isUpcoming?(key==='upmovies'?'upcoming-movies-bg':'upcoming-shows-bg'):(key==='movies'?'news-movies-bg':'news-shows-bg');
  const el=document.getElementById(bgId);
  if(!el||!item) return;
  const backdrop=item.backdrop_path?`${TMDB_BACKDROP}${item.backdrop_path}`:'';
  if(backdrop) el.style.backgroundImage=`url("${backdrop}")`;
}

// ════════════════════════════════
// HIDDEN ITEMS
// ════════════════════════════════
function hideItem(ns,type,id){
  if(!hiddenItems[ns]) hiddenItems[ns]={};
  if(!hiddenItems[ns][type]) hiddenItems[ns][type]={};
  hiddenItems[ns][type][id]=true;
  settings.hiddenItems=hiddenItems;
  window.electronAPI.setSettings(settings);
  if(ns==='news') loadNews();
  else loadUpcoming(parseInt(document.getElementById('upcoming-range')?.value||'1'));
}

function showHiddenPanel(ns,type){
  const hidden=hiddenItems[ns]?.[type]||{};
  const ids=Object.keys(hidden);
  if(!ids.length){showToast('Keine ausgeblendeten Einträge.');return;}
  const html=ids.map(id=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bor)"><span style="flex:1;font-size:13px;color:var(--tx)">${id}</span><button onclick="restoreItem('${ns}','${type}',${id})" style="padding:4px 10px;background:var(--acc);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px">Wiederherstellen</button></div>`).join('');
  // Simple Modal
  const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2000;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML=`<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:14px;padding:24px;width:min(400px,90%);max-height:70vh;overflow-y:auto"><h3 style="font-family:var(--font-d);font-size:16px;color:var(--tx);margin-bottom:16px">Ausgeblendete Einträge</h3>${html}<button onclick="this.closest('[style*=fixed]').remove()" style="margin-top:14px;width:100%;padding:10px;background:var(--bgc);border:1px solid var(--bor);color:var(--tx);border-radius:8px;cursor:pointer">Schließen</button></div>`;
  document.body.appendChild(overlay);
}

window.restoreItem=function(ns,type,id){
  if(hiddenItems[ns]?.[type]) delete hiddenItems[ns][type][id];
  settings.hiddenItems=hiddenItems;
  window.electronAPI.setSettings(settings);
  document.querySelectorAll('[style*="position:fixed"][style*="inset:0"]').forEach(el=>{if(el.style.zIndex==='2000')el.remove();});
  if(ns==='news') loadNews();else loadUpcoming(parseInt(document.getElementById('upcoming-range')?.value||'1'));
};
window.hideItem=hideItem;
window.addToWatchlist=addToWatchlist;

// ════════════════════════════════
// SEARCH
// ════════════════════════════════
function setupSearch(){
  const input=document.getElementById('search-input');
  const clear=document.getElementById('search-clear');
  const dd=document.getElementById('search-dropdown');

  input?.addEventListener('focus',()=>{
    if(input.value.trim()&&dd.innerHTML) dd.style.display='block';
    else if(!input.value.trim()&&searchHistory.length) showSearchHistory(dd);
  });
  input?.addEventListener('input',()=>{
    const q=input.value.trim();
    clear.style.display=q?'block':'none';
    clearTimeout(searchTimer);
    if(!q){dd.style.display=searchHistory.length?'block':'none';if(searchHistory.length)showSearchHistory(dd);else{dd.innerHTML='';dd.style.display='none';}return;}
    lastQuery=q;searchPage=1;
    showInstantSuggestions(q,dd);
    searchTimer=setTimeout(()=>runSearch(q,1),420);
  });
  clear?.addEventListener('click',()=>{
    input.value='';clear.style.display='none';dd.style.display='none';dd.innerHTML='';lastQuery='';
  });
  document.addEventListener('mousedown',e=>{
    const wrap=document.getElementById('search-bar')?.closest('.search-bar-wrap');
    if(wrap&&!wrap.contains(e.target)){dd.style.display='none';}
  });
}

function showSearchHistory(dd){
  dd.innerHTML=`<div class="search-dd-section">Zuletzt gesucht</div>`;
  searchHistory.slice(0,8).forEach(q=>{
    dd.innerHTML+=`<div class="search-dd-history-item" onclick="useHistory('${esc(q)}')">🕐 ${esc(q)}</div>`;
  });
  dd.style.display='block';
}

window.useHistory=function(q){
  const input=document.getElementById('search-input');
  if(input){input.value=q;input.dispatchEvent(new Event('input'));}
};

function addToSearchHistory(q){
  if(!q||searchHistory.includes(q)) return;
  searchHistory.unshift(q);
  searchHistory=searchHistory.slice(0,20);
  settings.searchHistory=searchHistory;
  window.electronAPI.setSettings(settings);
}

function showInstantSuggestions(q,dd){
  const ql=q.toLowerCase();
  const provMatches=Object.entries(PROVIDERS).filter(([,p])=>p.name.toLowerCase().includes(ql))
    .sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
  if(!provMatches.length) return;
  let html=`<div class="search-dd-section">Anbieter</div>`;
  provMatches.slice(0,4).forEach(([id,p])=>{
    html+=`<div class="search-dd-item" onclick="openProvider('${id}')"><img class="search-dd-poster" src="${getFavicon(id)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span> ${esc(p.tag)}</div></div></div>`;
  });
  dd.innerHTML=html;dd.style.display='block';
}

async function runSearch(q,page=1){
  const dd=document.getElementById('search-dropdown');
  dd.style.display='block';
  const ql=q.toLowerCase();
  const provMatches=Object.entries(PROVIDERS).filter(([,p])=>p.name.toLowerCase().includes(ql))
    .sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
  const ytId=extractYtId(q);
  let html='';

  if(provMatches.length&&page===1){
    html+=`<div class="search-dd-section">Anbieter</div>`;
    provMatches.slice(0,3).forEach(([id,p])=>{
      html+=`<div class="search-dd-item" onclick="openProvider('${id}')"><img class="search-dd-poster" src="${getFavicon(id)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span> ${esc(p.tag)}</div></div></div>`;
    });
  }

  if(ytId&&page===1){
    html+=`<div class="search-dd-section">YouTube</div><div class="search-dd-item" onclick="openProviderAtUrl('youtube','https://www.youtube.com/watch?v=${ytId}','YouTube','persist:youtube')"><img class="search-dd-poster" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">YouTube Video abspielen</div><div class="search-dd-meta">Direkt in OmniSight öffnen</div></div></div>`;
  }

  if(!ytId){
    try{
      const data=await window.electronAPI.searchTitle(q);
      if(data.Search&&data.Search.length){
        const start=(page-1)*5,slice=data.Search.slice(start,start+5);
        const total=parseInt(data.totalResults)||data.Search.length;
        const hasMore=start+5<total;
        if(page===1) html+=`<div class="search-dd-section">Filme &amp; Serien</div>`;
        for(const item of slice){
          let detail=null;
          try{detail=await window.electronAPI.searchTitleDetail(item.imdbID);}catch{}
          const typeLabel=item.Type==='movie'?'Film':item.Type==='series'?'Serie':item.Type;
          const runtime=detail?.Runtime&&detail.Runtime!=='N/A'?detail.Runtime:null;
          const imdbR=detail?.imdbRating&&detail.imdbRating!=='N/A'?detail.imdbRating:null;
          const rtR=detail?.Ratings?.find(r=>r.Source==='Rotten Tomatoes')?.Value||null;
          const googleUrl=`https://www.google.com/search?q=${enc(item.Title+' wo streamen')}`;
          const chips=Object.entries(SEARCH_URLS).slice(0,4).map(([id,urlFn])=>
            `<div class="search-dd-provider-chip" onclick="event.stopPropagation();openProviderAtUrl('${id}','${esc(urlFn(item.Title))}','${esc(PROVIDERS[id]?.name||id)}','${PROVIDERS[id]?.partition||'persist:'+id}')"><img src="${getFavicon(id)}" onerror="this.style.display='none'"/>${esc(PROVIDERS[id]?.name||id)}</div>`
          ).join('');
          html+=`<div class="search-dd-item"><${item.Poster&&item.Poster!=='N/A'?`img class="search-dd-poster" src="${item.Poster}" onerror="this.className='search-dd-poster-ph';this.outerHTML='<div class=search-dd-poster-ph>🎬</div>"`:`div class="search-dd-poster-ph">🎬</div`}/><div class="search-dd-info"><div class="search-dd-title">${esc(item.Title)}</div><div class="search-dd-meta"><span class="search-dd-badge">${typeLabel}</span>${item.Year?`<span>${item.Year}</span>`:''}${runtime?`<span>⏱ ${runtime}</span>`:''}${imdbR?`<span class="search-dd-rating">IMDb ${imdbR}</span>`:''}${rtR?`<span class="search-dd-rating">🍅 ${rtR}</span>`:''}</div><div class="search-dd-providers">${chips}<div class="search-dd-provider-chip" onclick="event.stopPropagation();window.electronAPI.openExternal('${esc(googleUrl)}')">🔍 Google</div></div></div></div>`;
        }
        if(hasMore) html+=`<div class="search-dd-more" id="dd-more-btn">Weitere Ergebnisse ↓</div>`;
        else html+=`<div class="search-dd-no-more">Keine weiteren Ergebnisse.</div>`;
      }else if(!provMatches.length&&!ytId){
        html+=`<div class="search-dd-empty">Keine Ergebnisse für „${esc(q)}"</div>`;
      }
    }catch{}
  }

  if(page===1){dd.innerHTML=html;}
  else{
    const mb=document.getElementById('dd-more-btn');if(mb)mb.remove();
    const noMore=dd.querySelector('.search-dd-no-more');if(noMore)noMore.remove();
    const temp=document.createElement('div');temp.innerHTML=html;
    temp.querySelectorAll('.search-dd-item').forEach(el=>dd.insertBefore(el,null));
    const newMore=temp.querySelector('#dd-more-btn');if(newMore)dd.appendChild(newMore);
    const newNoMore=temp.querySelector('.search-dd-no-more');if(newNoMore)dd.appendChild(newNoMore);
  }
  dd.style.display='block';
  document.getElementById('dd-more-btn')?.addEventListener('click',()=>{searchPage++;runSearch(lastQuery,searchPage);});
  addToSearchHistory(q);
}

function extractYtId(s){
  const p=[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/^([a-zA-Z0-9_-]{11})$/];
  for(const r of p){const m=s.match(r);if(m)return m[1];}return null;
}

// ════════════════════════════════
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid(){
  const grid=document.getElementById('providers-grid');
  if(!grid) return;
  grid.innerHTML='';
  const compact=settings.cardLayout==='compact';
  if(compact) grid.classList.add('compact');
  else grid.classList.remove('compact');

  const favs=settings.favorites||[];
  // Reihenfolge aus providerOrder
  let sorted=Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  if(providerOrder.length){
    sorted=sorted.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai===-1&&bi===-1)return a[1].name.localeCompare(b[1].name);if(ai===-1)return 1;if(bi===-1)return-1;return ai-bi;});
  }
  const favL=sorted.filter(([id])=>favs.includes(id));
  const rest=sorted.filter(([id])=>!favs.includes(id));
  if(favL.length){addLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}

  // Drag & Drop
  setupCardDragDrop(grid);
}

function addLabel(grid,text){
  const el=document.createElement('div');el.className='grid-section-label';el.textContent=text;grid.appendChild(el);
}

function createCard(id,p,isFav){
  const card=document.createElement('div');
  card.className='provider-card';card.dataset.id=id;
  card.setAttribute('draggable','true');
  const imgUrl=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  card.innerHTML=`
    <button class="card-star ${isFav?'active':''}" data-id="${id}"><svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" ${isFav?'fill="currentColor"':'fill="none"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
    ${p.quality?`<div class="card-quality-badge">${p.quality}</div>`:''}
    <div class="card-banner">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,${p.color}22 50%,transparent 80%)"></div>
      <div class="card-banner-img" style="${imgUrl?`background-image:url('${imgUrl}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:1;transition:opacity .3s`:'opacity:0;position:absolute;inset:0'}"></div>
      <img class="card-favicon" src="${getFavicon(id)}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="position:relative;z-index:2;width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;background:${p.color}33">${p.name.charAt(0)}</div>
    </div>
    <div class="card-body"><div class="card-info"><span class="card-name">${p.name}</span><span class="card-tag">${p.tag}</span></div><span class="card-arrow">→</span></div>
  `;
  card.querySelector('.card-star').addEventListener('click',e=>{e.stopPropagation();toggleFavorite(id);});
  card.addEventListener('click',e=>{if(!e.target.closest('.card-star'))openProvider(id);});
  return card;
}

function setupCardDragDrop(grid){
  let dragSrc=null;
  grid.querySelectorAll('.provider-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{dragSrc=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));});
    card.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';if(card!==dragSrc){card.classList.add('drag-over');}});
    card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
    card.addEventListener('drop',e=>{
      e.preventDefault();card.classList.remove('drag-over');
      if(!dragSrc||dragSrc===card) return;
      const ids=[...grid.querySelectorAll('.provider-card')].map(c=>c.dataset.id);
      const si=ids.indexOf(dragSrc.dataset.id),di=ids.indexOf(card.dataset.id);
      if(si>-1&&di>-1){ids.splice(si,1);ids.splice(di,0,dragSrc.dataset.id);}
      providerOrder=ids;settings.providerOrder=ids;window.electronAPI.setSettings(settings);
      buildProviderGrid();
    });
  });
}

function toggleFavorite(id){
  const favs=settings.favorites||[];const idx=favs.indexOf(id);
  if(idx===-1)favs.push(id);else favs.splice(idx,1);
  settings.favorites=favs;window.electronAPI.setSettings(settings);
  buildProviderGrid();buildSidebarSubMenus();
}

// ════════════════════════════════
// SIDEBAR
// ════════════════════════════════
function buildSidebarSubMenus(){buildFavSub();buildProvSub();}

function buildFavSub(){
  const list=document.getElementById('nav-sub-favorites-list');if(!list) return;list.innerHTML='';
  const favs=settings.favorites||[];
  if(!favs.length){const h=document.createElement('div');h.style.cssText='padding:5px 10px;font-size:11px;color:var(--tx3)';h.textContent='Noch keine Favoriten';list.appendChild(h);return;}
  favs.forEach(id=>{const p=PROVIDERS[id];if(p)list.appendChild(makeSubBtn(id,p));});
}

function buildProvSub(){
  const list=document.getElementById('nav-sub-providers-list');if(!list) return;list.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>list.appendChild(makeSubBtn(id,p)));
}

function makeSubBtn(id,p){
  const btn=document.createElement('button');btn.className='nav-sub-btn';
  btn.innerHTML=`<img src="${getFavicon(id)}" onerror="this.outerHTML='<span class=\\'dot\\' style=\\'background:${p.color}\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${p.name}`;
  btn.addEventListener('click',()=>openProvider(id));return btn;
}

// ════════════════════════════════
// PROVIDER ÖFFNEN
// ════════════════════════════════
function openProvider(id){openProviderAtUrl(id,PROVIDERS[id]?.url,PROVIDERS[id]?.name,PROVIDERS[id]?.partition);}

function openProviderAtUrl(id,url,name,partition){
  const p=PROVIDERS[id]||{url,name:name||id,partition:partition||'persist:'+id,color:'#333'};
  if(!url) return;

  if(currentWebview&&currentProvider&&currentProvider!==id){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}
  if(pipProviderId===id){restoreFromPip();return;}

  currentProvider=id;currentProviderUrl=url;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent=p.name;
  document.getElementById('btn-watching').style.display='flex';

  window.electronAPI.setupWebviewSession(p.partition||`persist:${id}`);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';

  const wv=document.createElement('webview');
  wv.setAttribute('src',url);
  wv.setAttribute('partition',p.partition||`persist:${id}`);
  wv.setAttribute('allowpopups','');
  wv.setAttribute('useragent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  wv.addEventListener('new-window',e=>{if(e.url&&(e.url.startsWith('http')||e.url.startsWith('//')))wv.loadURL(e.url);});
  currentWebview=wv;if(wrap)wrap.appendChild(wv);

  wv.addEventListener('did-start-loading',()=>{showLoading(`${p.name} wird geladen…`);document.getElementById('btn-retry').style.display='none';});
  wv.addEventListener('did-stop-loading',()=>{hideLoading();addViewHistory({id,name:p.name,url,time:Date.now()});});
  wv.addEventListener('did-fail-load',async e=>{
    if(e.errorCode===-3||e.errorCode===0) return;
    hideLoading();
    document.getElementById('btn-retry').style.display='flex';
    let diag='';
    try{const r=await window.electronAPI.checkUrl(url);diag=r.ok?`Erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`:`Verbindungsfehler: ${r.error}`;}catch{}
    showWebviewError(p,url,e.errorCode,e.errorDescription,diag);
  });

  document.getElementById('search-dropdown').style.display='none';
  showView('stream');
}

window.openProvider=openProvider;
window.openProviderAtUrl=openProviderAtUrl;

function addViewHistory(entry){
  viewHistory=viewHistory.filter(h=>h.id!==entry.id).slice(0,49);
  viewHistory.unshift(entry);
  settings.viewHistory=viewHistory;
  window.electronAPI.setSettings(settings);
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function stopStream(){
  if(isFullscreen)window.electronAPI.setFullscreen(false);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';
  currentWebview=null;currentProvider=null;currentProviderUrl=null;showView('home');
}

function maybeMoveToPip(){
  if(currentWebview&&currentProvider){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}
}

function setupStreamControls(){
  document.getElementById('back-btn')?.addEventListener('click',()=>{if(isFullscreen)window.electronAPI.setFullscreen(false);maybeMoveToPip();showView('home');});
  document.getElementById('btn-stop')?.addEventListener('click',()=>{if(!confirm('Stream beenden?'))return;stopStream();});
  document.getElementById('btn-pip')?.addEventListener('click',()=>{if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');}});
  document.getElementById('btn-fullscreen')?.addEventListener('click',()=>window.electronAPI.setFullscreen(!isFullscreen));
  document.getElementById('btn-retry')?.addEventListener('click',()=>{if(currentWebview&&currentProviderUrl)currentWebview.loadURL(currentProviderUrl);});
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{
    if(!currentProvider)return;const p=PROVIDERS[currentProvider];if(!confirm(`Von ${p.name} abmelden?`))return;
    window.electronAPI.clearProviderSession(currentProvider);if(currentWebview)currentWebview.loadURL(p.url);buildSettingsAccountTab();
  });
}

function showWebviewError(p,url,code,desc,diag){
  const wrap=document.getElementById('webview-wrap');if(!wrap)return;
  wrap.innerHTML=`<div class="webview-error"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>${p.name} konnte nicht geladen werden</h3><p>${diag||'Keine Verbindung oder die Seite blockiert den Zugriff.'}</p>${code?`<span class="err-code">Fehlercode: ${code} – ${desc||'Unbekannt'}</span>`:''}<div class="webview-error-actions"><button class="webview-error-btn primary" onclick="document.getElementById('btn-retry').click()">🔄 Erneut versuchen</button><button class="webview-error-btn secondary" onclick="window.electronAPI.openExternal('${url}')">↗ Im Browser öffnen</button></div></div>`;
}

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
  document.getElementById('pip-close')?.addEventListener('click',()=>{pip.style.display='none';document.getElementById('pip-content').innerHTML='';pipProviderId=null;});
}

function moveToPip(providerId,wvNode){
  const pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),title=document.getElementById('pip-title');
  if(!pip||!content)return;
  content.innerHTML='';
  if(wvNode?.parentNode)wvNode.parentNode.removeChild(wvNode);
  if(wvNode){wvNode.style.cssText='width:100%;height:100%;border:none;display:flex';content.appendChild(wvNode);}
  pipProviderId=providerId;
  if(title)title.textContent=PROVIDERS[providerId]?.name||providerId;
  pip.style.left='auto';pip.style.top='auto';pip.style.right='24px';pip.style.bottom='24px';pip.style.display='flex';
}

function restoreFromPip(){
  if(!pipProviderId)return;
  const id=pipProviderId,pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),wrap=document.getElementById('webview-wrap');
  if(!content||!wrap)return;
  const wv=content.querySelector('webview');
  if(wv){wv.parentNode.removeChild(wv);wv.style.cssText='width:100%;height:100%;border:none;display:flex';wrap.innerHTML='';wrap.appendChild(wv);currentWebview=wv;}
  content.innerHTML='';pip.style.display='none';pipProviderId=null;currentProvider=id;
  document.getElementById('stream-title').textContent=PROVIDERS[id]?.name||id;
  document.getElementById('btn-watching').style.display='flex';
  showView('stream');
}

// ════════════════════════════════
// FULLSCREEN
// ════════════════════════════════
function updateFullscreenUI(){
  const topbar=document.getElementById('stream-topbar'),sidebar=document.getElementById('sidebar'),tb=document.getElementById('titlebar');
  const wrap=document.getElementById('webview-wrap'),btn=document.getElementById('btn-fullscreen');
  if(isFullscreen){[topbar,sidebar,tb].forEach(el=>el?.classList.add('hidden'));if(wrap)wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';if(btn)btn.innerHTML=svgMin()+' Beenden';}
  else{[topbar,sidebar,tb].forEach(el=>el?.classList.remove('hidden'));if(wrap)wrap.style.cssText='';if(btn)btn.innerHTML=svgMax()+' Vollbild';document.getElementById('fs-exit-btn')?.classList.remove('visible');}
}
function svgMax(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;}
function svgMin(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`;}

function setupFullscreenExit(){
  const btn=document.getElementById('fs-exit-btn');if(!btn)return;
  document.addEventListener('mousemove',e=>{
    if(!isFullscreen)return;
    const zone=113,cx=window.innerWidth/2;const inZ=Math.abs(e.clientX-cx)<zone/2&&e.clientY<zone;
    if(inZ){if(!fsHoverTimer)fsHoverTimer=setTimeout(()=>{btn.classList.add('visible');clearTimeout(fsAutoHide);fsAutoHide=setTimeout(()=>btn.classList.remove('visible'),3000);},1000);}
    else{clearTimeout(fsHoverTimer);fsHoverTimer=null;}
  });
  btn.addEventListener('click',()=>{window.electronAPI.setFullscreen(false);btn.classList.remove('visible');});
}

function setupESCKey(){
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isFullscreen)window.electronAPI.setFullscreen(false);});
}

// ════════════════════════════════
// CLOCK – überarbeitet
// ════════════════════════════════
function setupClock(){
  clearInterval(clockInterval);
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');
  if(!widget||!timeEl){return;}
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};
  widget.style.display='block';
  widget.style.left=(pos.x??16)+'px';widget.style.top=(pos.y??52)+'px';widget.style.right='auto';widget.style.bottom='auto';
  widget.style.color=clk.color||'#ffffff';
  widget.style.opacity=String(clk.opacity??0.85);
  widget.style.fontSize=(clk.size||22)+'px';
  widget.style.background='none';widget.style.backdropFilter='none';widget.style.border='none';widget.style.padding='0';widget.style.borderRadius='0';
  const tick=()=>{const n=new Date();timeEl.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}`;};
  tick();clockInterval=setInterval(tick,1000);
}

function pad(n){return String(n).padStart(2,'0');}

function previewClock(){
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const enabled=document.getElementById('clock-enabled')?.checked;
  const color=document.getElementById('clock-color-text')?.value||'#ffffff';
  const opacity=(parseInt(document.getElementById('clock-opacity')?.value)||85)/100;
  const size=parseInt(document.getElementById('clock-size')?.value)||22;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=enabled?'Aktiviert':'Deaktiviert';
  if(!enabled){widget.style.display='none';return;}
  widget.style.display='block';widget.style.color=color;widget.style.opacity=String(opacity);widget.style.fontSize=size+'px';
}

function startClockDrag(){
  const widget=document.getElementById('clock-widget');if(!widget)return;
  widget.style.display='block';widget.classList.add('draggable');
  let drag=false,ox=0,oy=0;
  function onDown(e){drag=true;const r=widget.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();}
  function onMove(e){if(!drag)return;widget.style.left=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox))+'px';widget.style.top=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy))+'px';widget.style.right='auto';widget.style.bottom='auto';}
  function onUp(){if(!drag)return;drag=false;const r=widget.getBoundingClientRect();settings.clock._pendingPos={x:Math.round(r.left),y:Math.round(r.top)};clockUnsaved=true;
    const saveBtn=document.getElementById('settings-save');if(saveBtn)saveBtn.classList.add('unsaved');}
  widget.addEventListener('mousedown',onDown);
  document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
  const btn=document.getElementById('clock-drag-mode-btn');
  if(btn){btn.textContent='✓ Fertig';btn.onclick=()=>{widget.classList.remove('draggable');document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);widget.removeEventListener('mousedown',onDown);btn.textContent='✋ Uhr verschieben';btn.onclick=startClockDrag;};}
}

function setupClockContextMenu(){
  const widget=document.getElementById('clock-widget'),ctx=document.getElementById('clock-ctx-menu');
  if(!widget||!ctx)return;
  widget.addEventListener('contextmenu',e=>{
    e.preventDefault();ctx.style.left=e.clientX+'px';ctx.style.top=e.clientY+'px';ctx.style.display='block';
  });
  document.addEventListener('click',()=>{ctx.style.display='none';});
  document.getElementById('clock-ctx-disable')?.addEventListener('click',()=>{
    settings.clock.enabled=false;window.electronAPI.setSettings(settings);setupClock();
    const ce=document.getElementById('clock-enabled');if(ce)ce.checked=false;
    const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Deaktiviert';
    ctx.style.display='none';
  });
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
      if(tab.dataset.tab==='cards')buildSettingsCardTab();
      if(tab.dataset.tab==='clock')syncClockUI();
      if(tab.dataset.tab==='advanced')buildAdvancedTab();
    });
  });

  linkColor('set-accent-color','set-accent-text');
  linkColor('clock-color','clock-color-text');

  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.dataset.reset;
      if(k==='accentColor'){settings.accentColor='#30c5bb';syncAppearanceUI();}
      else if(k==='appBgImage'){settings.appBgImage='';updatePreview('prev-app-bg',null);}
      applySettings(settings);
    });
  });

  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn=>{btn.addEventListener('click',()=>handlePickImage(btn.dataset.pick));});

  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');
  fsr?.addEventListener('input',()=>{const v=parseInt(fsr.value);if(fsv)fsv.textContent=v+'px';settings.fontSize=v;applyFontSize(v);});

  document.getElementById('particles-toggle')?.addEventListener('change',e=>{settings.particlesEnabled=e.target.checked;setupParticles();});
  document.getElementById('lang-select')?.addEventListener('change',e=>{settings.language=e.target.value;applyLanguage(e.target.value);});

  ['clock-enabled','clock-color','clock-opacity','clock-size'].forEach(id=>{document.getElementById(id)?.addEventListener('input',previewClock);document.getElementById(id)?.addEventListener('change',previewClock);});
  document.getElementById('clock-color-text')?.addEventListener('input',previewClock);
  document.getElementById('clock-opacity')?.addEventListener('input',e=>{document.getElementById('clock-opacity-val').textContent=e.target.value+'%';});
  document.getElementById('clock-size')?.addEventListener('input',e=>{document.getElementById('clock-size-val').textContent=e.target.value+'px';});
  document.getElementById('clock-drag-mode-btn')?.addEventListener('click',startClockDrag);

  // Layout toggles
  document.getElementById('layout-normal')?.addEventListener('click',()=>{settings.cardLayout='normal';document.getElementById('layout-normal')?.classList.add('active');document.getElementById('layout-compact')?.classList.remove('active');buildProviderGrid();});
  document.getElementById('layout-compact')?.addEventListener('click',()=>{settings.cardLayout='compact';document.getElementById('layout-compact')?.classList.add('active');document.getElementById('layout-normal')?.classList.remove('active');buildProviderGrid();});

  document.getElementById('settings-save')?.addEventListener('click',()=>{
    settings.accentColor=document.getElementById('set-accent-text')?.value.trim()||'#30c5bb';
    // Clock speichern
    const pPos=settings.clock._pendingPos;
    settings.clock={
      enabled:!!document.getElementById('clock-enabled')?.checked,
      position:pPos||settings.clock.position||{x:16,y:52},
      color:document.getElementById('clock-color-text')?.value||'#ffffff',
      opacity:(parseInt(document.getElementById('clock-opacity')?.value)||85)/100,
      size:parseInt(document.getElementById('clock-size')?.value)||22,
    };
    delete settings.clock._pendingPos;
    settings.customCSS=document.getElementById('custom-css-input')?.value||'';
    customCSS=settings.customCSS;applyCustomCSS(customCSS);
    applySettings(settings);setupClock();
    clockUnsaved=false;
    const saveBtn=document.getElementById('settings-save');if(saveBtn)saveBtn.classList.remove('unsaved');
    closeSettings();
  });

  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{if(!confirm('Von ALLEN Diensten abmelden?'))return;window.electronAPI.clearAllSessions();buildSettingsAccountTab();});
  syncAppearanceUI();
}

function openSettings(){
  document.getElementById('settings-panel')?.classList.add('open');document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();buildSettingsCardTab();syncClockUI();syncAppearanceUI();
}
function closeSettings(){document.getElementById('settings-panel')?.classList.remove('open');document.getElementById('settings-overlay')?.classList.remove('open');}

async function handlePickImage(dest){
  const url=await window.electronAPI.pickImage(dest);if(!url)return;
  if(dest==='appBgImage'){settings.appBgImage=url;updatePreview('prev-app-bg',url);}
  else if(dest.startsWith('card_')){const id=dest.replace('card_','');settings.cardImages[id]=url;applySettings(settings);buildProviderGrid();buildSettingsCardTab();openImageEditor(id,url);return;}
  applySettings(settings);
}

function updatePreview(id,url){const el=document.getElementById(id);if(!el)return;if(url)el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;else el.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;}
function linkColor(cId,tId){const c=document.getElementById(cId),t=document.getElementById(tId);if(!c||!t)return;c.addEventListener('input',()=>t.value=c.value);t.addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test(t.value))c.value=t.value;});}

function syncAppearanceUI(){
  const acc=settings.accentColor||'#30c5bb';const ca=document.getElementById('set-accent-color'),ta=document.getElementById('set-accent-text');if(ca)ca.value=acc;if(ta)ta.value=acc;
  if(settings.appBgImage)updatePreview('prev-app-bg',settings.appBgImage);
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');const fs=settings.fontSize||14;if(fsr)fsr.value=fs;if(fsv)fsv.textContent=fs+'px';
  const pt=document.getElementById('particles-toggle');if(pt)pt.checked=!!settings.particlesEnabled;
  const ls=document.getElementById('lang-select');if(ls)ls.value=settings.language||'de';
}

function syncClockUI(){
  const clk=settings.clock||{};
  const ce=document.getElementById('clock-enabled');if(ce)ce.checked=!!clk.enabled;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const col=clk.color||'#ffffff';const cc=document.getElementById('clock-color'),ct=document.getElementById('clock-color-text');if(cc)cc.value=col;if(ct)ct.value=col;
  const op=Math.round((clk.opacity??0.85)*100);const co=document.getElementById('clock-opacity'),cv=document.getElementById('clock-opacity-val');if(co)co.value=op;if(cv)cv.textContent=op+'%';
  const sz=clk.size||22;const cs=document.getElementById('clock-size'),csv=document.getElementById('clock-size-val');if(cs)cs.value=sz;if(csv)csv.textContent=sz+'px';
}

// ════════════════════════════════
// ACCOUNT TAB
// ════════════════════════════════
async function buildSettingsAccountTab(){
  const list=document.getElementById('session-list');if(!list)return;
  list.innerHTML='<div class="loading-sessions">Wird geprüft…</div>';
  const res=await window.electronAPI.getAllSessions();
  list.innerHTML='';
  const sorted=Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const on=sorted.filter(([id])=>!!res[id]),off=sorted.filter(([id])=>!res[id]);
  if(on.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Angemeldet';list.appendChild(lbl);on.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,true)));}
  if(off.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Nicht angemeldet';list.appendChild(lbl);off.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,false)));}
}

function makeSessionItem(id,p,on){
  const item=document.createElement('div');item.className='session-item';
  item.innerHTML=`<span class="session-dot ${on?'active':''}"></span><span class="session-name">${p.name}</span><span class="session-status">${on?'✓':''}</span>${on?`<button class="session-logout-btn" data-id="${id}">Abmelden</button>`:''}`;
  item.querySelector('.session-logout-btn')?.addEventListener('click',()=>{window.electronAPI.clearProviderSession(id);if(currentProvider===id)stopStream();buildSettingsAccountTab();});
  return item;
}

// ════════════════════════════════
// CARD IMAGE LIST
// ════════════════════════════════
function buildSettingsCardTab(){
  const list=document.getElementById('card-image-list');if(!list)return;list.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>{
    const imgUrl=(settings.cardImages||{})[id]||'';
    const item=document.createElement('div');item.className='card-img-item';
    item.innerHTML=`<span class="card-img-dot" style="background:${p.color}"></span><span class="card-img-name">${p.name}</span><div class="img-preview" id="prev-card-${id}">${imgUrl?`<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`:''}</div><button class="pick-btn" style="max-width:60px;font-size:11px" data-card="${id}">Bild</button>${imgUrl?`<button class="pick-btn" style="max-width:50px;font-size:11px;color:var(--acc);border-color:var(--acc)" data-edit="${id}">✎</button><button class="reset-btn" data-card-reset="${id}">↺</button>`:''}`;
    item.querySelector(`[data-card="${id}"]`)?.addEventListener('click',()=>handlePickImage(`card_${id}`));
    item.querySelector(`[data-edit="${id}"]`)?.addEventListener('click',()=>openImageEditor(id,imgUrl));
    item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click',()=>{delete settings.cardImages[id];delete(settings.cardImageOffsets||{})[id];applySettings(settings);buildProviderGrid();buildSettingsCardTab();});
    list.appendChild(item);
  });
}

// ════════════════════════════════
// ADVANCED TAB
// ════════════════════════════════
function buildAdvancedTab(){
  const cssInput=document.getElementById('custom-css-input');if(cssInput)cssInput.value=customCSS;
  const histList=document.getElementById('view-history-list');
  if(histList){
    histList.innerHTML=viewHistory.slice(0,20).map(h=>`<div style="font-size:12px;padding:4px 0;color:var(--tx2);display:flex;align-items:center;gap:8px"><img src="${getFavicon(h.id)}" width="14" height="14" style="border-radius:2px;object-fit:contain"/>${h.name}</div>`).join('')||'<div style="font-size:12px;color:var(--tx3)">Kein Verlauf</div>';
  }
  document.getElementById('btn-clear-history')?.addEventListener('click',()=>{viewHistory=[];settings.viewHistory=[];window.electronAPI.setSettings(settings);buildAdvancedTab();});
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
    const div=document.createElement('div');div.className='plugin-preset';
    const isInstalled=installedPlugins.has(preset.id);
    if(preset.chromeUrl){
      div.innerHTML=`<div style="flex:1"><div class="plugin-preset-name">${preset.name}</div><div class="plugin-preset-desc">${preset.desc}</div></div><button class="plugin-install-btn" style="background:var(--bgc);color:var(--acc);border:1px solid var(--acc)">↗ Chrome Store</button>`;
      div.querySelector('button').addEventListener('click',()=>window.electronAPI.openChromeExtension(preset.chromeUrl));
    }else{
      div.innerHTML=`<div style="flex:1"><div class="plugin-preset-name">${preset.name}</div><div class="plugin-preset-desc">${preset.desc}</div></div><button class="plugin-install-btn ${isInstalled?'installed':''}">${isInstalled?'✓ Installiert':'Installieren'}</button>`;
      if(!isInstalled){
        div.querySelector('button').addEventListener('click',async()=>{
          const btn=div.querySelector('button');btn.textContent='Lädt…';btn.disabled=true;
          const result=await window.electronAPI.fetchAdblockList(preset.url);
          if(result.ok){extraAdDomains=[...new Set([...extraAdDomains,...result.domains])];window.electronAPI.applyExtraAdDomains(extraAdDomains);installedPlugins.add(preset.id);btn.textContent=`✓ ${result.count} Domains`;btn.classList.add('installed');updatePluginDomainCount();buildPluginList();}
          else{btn.textContent='Fehler';btn.disabled=false;}
        });
      }
    }
    container.appendChild(div);
  });
}

function updatePluginDomainCount(){const el=document.getElementById('plugin-domain-count');if(el)el.textContent=extraAdDomains.length;}

function buildPluginList(){
  const list=document.getElementById('plugin-list');if(!list)return;
  if(!extraAdDomains.length){list.innerHTML='';return;}
  list.innerHTML=`<div class="plugin-item"><span class="plugin-item-name">Installierte Domains</span><span class="plugin-item-count">${extraAdDomains.length}</span><button class="plugin-remove-btn" id="clear-ad-domains">Alle entfernen</button></div>`;
  document.getElementById('clear-ad-domains')?.addEventListener('click',()=>{extraAdDomains=[];installedPlugins.clear();window.electronAPI.applyExtraAdDomains([]);updatePluginDomainCount();buildPluginList();});
}

// ════════════════════════════════
// IMAGE EDITOR
// ════════════════════════════════
function setupImageEditor(){
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val'),imgEl=document.getElementById('img-editor-img');
  px?.addEventListener('input',()=>{imgEditorState.x=parseInt(px.value);if(pvx)pvx.textContent=px.value;if(imgEl)imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;});
  py?.addEventListener('input',()=>{imgEditorState.y=parseInt(py.value);if(pvy)pvy.textContent=py.value;if(imgEl)imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;});
  document.getElementById('img-editor-close')?.addEventListener('click',()=>document.getElementById('img-editor-overlay').style.display='none');
  document.getElementById('img-editor-save')?.addEventListener('click',()=>{const{providerId,url,x,y}=imgEditorState;settings.cardImages[providerId]=url;settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[providerId]={x,y};applySettings(settings);buildProviderGrid();buildSettingsCardTab();document.getElementById('img-editor-overlay').style.display='none';});
  document.getElementById('img-editor-remove')?.addEventListener('click',()=>{const{providerId}=imgEditorState;delete settings.cardImages[providerId];delete(settings.cardImageOffsets||{})[providerId];applySettings(settings);buildProviderGrid();buildSettingsCardTab();document.getElementById('img-editor-overlay').style.display='none';});
}

function openImageEditor(providerId,imgUrl){
  const overlay=document.getElementById('img-editor-overlay'),imgEl=document.getElementById('img-editor-img'),title=document.getElementById('img-editor-title');
  if(!overlay||!imgEl)return;
  const off=(settings.cardImageOffsets||{})[providerId]||{x:0,y:0};
  imgEditorState={providerId,url:imgUrl,x:off.x,y:off.y};
  if(title)title.textContent=`Banner: ${PROVIDERS[providerId]?.name||providerId}`;
  imgEl.style.cssText=`background-image:url("${imgUrl}");background-size:cover;background-repeat:no-repeat;background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);position:absolute;inset:0`;
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val');
  if(px){px.value=off.x;}if(py){py.value=off.y;}if(pvx)pvx.textContent=off.x;if(pvy)pvy.textContent=off.y;
  overlay.style.display='flex';
}

// ════════════════════════════════
// TOAST
// ════════════════════════════════
function showToast(msg,duration=3000){
  const t=document.getElementById('error-toast');if(!t)return;
  t.textContent=msg;t.style.background='var(--acc)';t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),duration);
}

function showLoading(text='Wird geladen…'){document.getElementById('loading-text').textContent=text;document.getElementById('loading-overlay').classList.add('active');}
function hideLoading(){document.getElementById('loading-overlay').classList.remove('active');}

// ════════════════════════════════
// START
// ════════════════════════════════
document.addEventListener('DOMContentLoaded',init);
