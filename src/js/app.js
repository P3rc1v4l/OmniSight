'use strict';

// ════════════════════════════════
// PROVIDERS
// ════════════════════════════════
const PROVIDERS = {
  apple:        { name:'Apple TV+',     tag:'Apple Originals',          url:'https://tv.apple.com',                    color:'#555555', partition:'persist:apple',        quality:'4K' },
  ard:          { name:'ARD Mediathek', tag:'Öffentlich-rechtlich',      url:'https://www.ardmediathek.de',             color:'#003D6B', partition:'persist:ard',          quality:'HD' },
  burning:      { name:'BurningSeries', tag:'Serien & Anime',            url:'https://bs.to',                           color:'#C0392B', partition:'persist:burning',      quality:'HD', multiTab:true },
  cineto:       { name:'Cine.to',       tag:'Filme & Serien',            url:'https://cine.to',                         color:'#8B5CF6', partition:'persist:cineto',       quality:'HD', multiTab:true },
  crunchyroll:  { name:'Crunchyroll',   tag:'Anime & Manga',             url:'https://www.crunchyroll.com',             color:'#F47521', partition:'persist:crunchyroll',  quality:'4K' },
  dazn:         { name:'DAZN',          tag:'Sport Live-Streams',        url:'https://www.dazn.com',                    color:'#F8D200', partition:'persist:dazn',         quality:'4K' },
  disney:       { name:'Disney+',       tag:'Marvel, Star Wars & mehr',  url:'https://www.disneyplus.com',              color:'#113CCF', partition:'persist:disney',       quality:'4K' },
  hbomax:       { name:'Max (HBO)',      tag:'HBO Originals & mehr',      url:'https://www.max.com',                     color:'#0031DB', partition:'persist:hbomax',      quality:'4K' },
  joyn:         { name:'Joyn',          tag:'Kostenlos streamen',        url:'https://www.joyn.de',                     color:'#E4001B', partition:'persist:joyn',         quality:'HD' },
  mubi:         { name:'MUBI',          tag:'Arthouse & Kino',           url:'https://mubi.com',                        color:'#213F5E', partition:'persist:mubi',         quality:'HD' },
  netflix:      { name:'Netflix',       tag:'Filme & Serien',            url:'https://www.netflix.com',                 color:'#E50914', partition:'persist:netflix',      quality:'4K' },
  paramountplus:{ name:'Paramount+',    tag:'Paramount Originals',       url:'https://www.paramountplus.com',           color:'#0064FF', partition:'persist:paramountplus',quality:'4K' },
  prime:        { name:'Prime Video',   tag:'Amazon Originals',          url:'https://www.primevideo.com',              color:'#00A8E1', partition:'persist:prime',        quality:'4K' },
  rtl:          { name:'RTL+',          tag:'RTL Serien & Shows',        url:'https://plus.rtl.de',                     color:'#FF6B00', partition:'persist:rtl',          quality:'HD' },
  skygo:        { name:'Sky Go',        tag:'Sky Serien & Sport',        url:'https://www.sky.de/entertainment/sky-go', color:'#00205B', partition:'persist:skygo',        quality:'HD' },
  twitch:       { name:'Twitch',        tag:'Live-Streams & Gaming',     url:'https://www.twitch.tv',                   color:'#9146FF', partition:'persist:twitch',       quality:'1080p' },
  youtube:      { name:'YouTube',       tag:'Videos & Streams',          url:'https://www.youtube.com',                 color:'#FF0000', partition:'persist:youtube',      quality:'4K' },
  zdf:          { name:'ZDF Mediathek', tag:'Öffentlich-rechtlich',      url:'https://www.zdf.de',                      color:'#163A6A', partition:'persist:zdf',          quality:'HD' },
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
  { id:'adblock',    name:'AdBlock',             desc:'Von ADBLOCK, Inc. – getadblock.com',         url:'https://easylist.to/easylist/easylist.txt' },
  { id:'easyprivacy',name:'EasyPrivacy',          desc:'Tracking & Analytics blockieren',            url:'https://easylist.to/easylist/easyprivacy.txt' },
  { id:'fanboy',     name:'Fanboy Annoyance',     desc:'Cookie-Banner & Popups blockieren',          url:'https://easylist.to/easylist/fanboy-annoyance.txt' },
  { id:'adguard',    name:'AdGuard Base',         desc:'AdGuard Basisliste',                         url:'https://filters.adtidy.org/extension/chromium/filters/2.txt' },
  { id:'buster',     name:'Buster: Captcha Solver',desc:'Löst CAPTCHA automatisch',                 url:'https://raw.githubusercontent.com/nicehash/electron-widevinecdm/master/README.md', note:'Hinweis: Buster ist eine Browser-Extension, kein Domain-Filter. Öffnet Chrome Store.' },
  { id:'betterttv',  name:'BetterTTV',            desc:'Twitch-Verbesserungen & Emotes',             url:'', note:'BetterTTV ist eine Browser-Extension. Für Electron nicht direkt verfügbar.' },
  { id:'icloud',     name:'iCloud-Passwörter',    desc:'Safari-Passwörter auf Windows',              url:'', note:'Nur über Apple iCloud für Windows App verfügbar.' },
];

const I18N = {
  de:{ overview:'Übersicht', favorites:'Favoriten', watchlist:'Gemerkt', news:'Neuigkeiten', upcoming:'Upcoming', providers:'Anbieter', settings:'Einstellungen', watchingNow:'Schaut gerade', noStream:'Kein Stream aktiv', back:'Zurück', fullscreen:'Vollbild', miniPlayer:'Miniplayer', stop:'Stop', logout:'Abmelden', search:'Film, Serie, YouTube oder Anbieter suchen…', trending:'Trending', newTab:'Neu', stats:'Statistiken' },
  en:{ overview:'Overview', favorites:'Favorites', watchlist:'Watchlist', news:'What\'s New', upcoming:'Upcoming', providers:'Providers', settings:'Settings', watchingNow:'Now Watching', noStream:'No stream active', back:'Back', fullscreen:'Fullscreen', miniPlayer:'Mini Player', stop:'Stop', logout:'Sign out', search:'Search movies, shows, YouTube or providers…', trending:'Trending', newTab:'New', stats:'Statistics' },
};

const TMDB_IMG     = 'https://image.tmdb.org/t/p/w300';
const TMDB_BACKDROP= 'https://image.tmdb.org/t/p/w1280';
function enc(s){ return encodeURIComponent(s); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function getFavicon(id){ const d={apple:'tv.apple.com',ard:'ardmediathek.de',burning:'bs.to',cineto:'cine.to',crunchyroll:'crunchyroll.com',dazn:'dazn.com',disney:'disneyplus.com',hbomax:'max.com',joyn:'joyn.de',mubi:'mubi.com',netflix:'netflix.com',paramountplus:'paramountplus.com',prime:'primevideo.com',rtl:'plus.rtl.de',skygo:'sky.de',twitch:'twitch.tv',youtube:'youtube.com',zdf:'zdf.de'}; return `https://www.google.com/s2/favicons?sz=64&domain=${d[id]||'example.com'}`; }

// ════════════════════════════════
// STATE
// ════════════════════════════════
let currentProvider   = null;
let currentWebview    = null;
let currentProvUrl    = null;
let pipProviderId     = null;
let isFullscreen      = false;
let fsHoverTimer      = null;
let fsAutoHide        = null;
let clockInterval     = null;
let clockDragEnabled  = false;
let settings          = {};
let profiles          = [];
let activeProfileId   = 'default';
let imgEditorState    = { providerId:null, url:'', x:0, y:0 };
let extraAdDomains    = [];
let installedPlugins  = new Set();
let searchTimer       = null;
let searchPage        = 1;
let lastQuery         = '';
let watchlist         = [];
let searchHistory     = [];
let viewHistory       = [];
let providerOrder     = [];
let lang              = 'de';
let customCSS         = '';
let watchTimeTimer    = null;
let watchStartTime    = null;
let hiddenItems       = { news:{}, upcoming:{} };
let sessionCache      = {};
let sessionRefreshTimer = null;

// Slideshow state – single slideshow per view
const slideshows = {
  news:     { items:[], idx:0, timer:null, mediaType:'movies', tab:'trending' },
  upcoming: { items:[], idx:0, timer:null, mediaType:'movies', months:1 },
};

// Tabs für bs.to / cine.to
let streamTabs = []; // { id, title, url, webview }
let activeTabId = null;

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  // Defaults sicherstellen
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.clock            = settings.clock            || { enabled:false, position:{x:16,y:52}, color:'#cfcfcf', opacity:0.85, size:22 };
  settings.fontSize         = settings.fontSize         || 14;
  settings.accentColor      = settings.accentColor      || '#30c5bb';
  settings.hiddenItems      = settings.hiddenItems      || { news:{}, upcoming:{} };
  settings.watchlist        = settings.watchlist        || [];
  settings.searchHistory    = settings.searchHistory    || [];
  settings.viewHistory      = settings.viewHistory      || [];
  settings.providerOrder    = settings.providerOrder    || [];
  settings.language         = settings.language         || 'de';
  settings.particlesEnabled = settings.particlesEnabled || false;
  settings.customCSS        = settings.customCSS        || '';
  settings.newsLastTab      = settings.newsLastTab      || 'movies';
  settings.upcomingLastTab  = settings.upcomingLastTab  || 'movies';
  settings.cardLayout       = settings.cardLayout       || 'normal';

  hiddenItems   = settings.hiddenItems;
  watchlist     = settings.watchlist;
  searchHistory = settings.searchHistory;
  viewHistory   = settings.viewHistory;
  providerOrder = settings.providerOrder;
  lang          = settings.language;
  customCSS     = settings.customCSS;
  slideshows.news.mediaType     = settings.newsLastTab;
  slideshows.upcoming.mediaType = settings.upcomingLastTab;

  applyFontSize(settings.fontSize);
  applyAccent(settings.accentColor);
  applyLanguage(lang);
  applyCustomCSS(customCSS);
  applySettings(settings, false);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  extraAdDomains = await window.electronAPI.getExtraAdDomains();
  installedPlugins = new Set(JSON.parse(localStorage.getItem('installedPlugins')||'[]'));

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
  setupStatsView();
  setupLayoutButtons();
  checkOnlineStatus();
  startSessionAutoRefresh();

  window.electronAPI.onFullscreenChange(v => { isFullscreen=v; updateFullscreenUI(); });
  window.electronAPI.onSessionsCleared(() => buildSettingsAccountTab());
  window.electronAPI.onSessionsUpdated(result => { sessionCache=result; if(document.getElementById('stab-account')?.classList.contains('active')) renderSessionList(result); });

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();

  setInterval(checkOnlineStatus, 30000);
}

// ════════════════════════════════
// LANGUAGE
// ════════════════════════════════
function applyLanguage(l) {
  lang = l;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (I18N[l]?.[key]) el.textContent = I18N[l][key];
  });
  const si = document.getElementById('search-input');
  if (si) si.placeholder = I18N[l]?.search || I18N.de.search;
}

// ════════════════════════════════
// THEME / FONT / ACCENT / CSS
// ════════════════════════════════
function setTheme(t, save=true) {
  document.documentElement.setAttribute('data-theme', t);
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t==='light');
  if (save) { window.electronAPI.setTheme(t); autoSave(); }
}
function setupThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('change', e => setTheme(e.target.checked?'light':'dark'));
}
function applyFontSize(px) { document.documentElement.style.setProperty('--fs', px+'px'); }
function applyAccent(hex) {
  document.documentElement.style.setProperty('--acc', hex||'#30c5bb');
  const rgb = hexToRgb(hex||'#30c5bb');
  if (rgb) document.documentElement.style.setProperty('--accg', `rgba(${rgb},.18)`);
}
function hexToRgb(hex) { const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null; }
function applyCustomCSS(css) { let el=document.getElementById('custom-css-style'); if(!el){el=document.createElement('style');el.id='custom-css-style';document.head.appendChild(el);} el.textContent=css||''; }

// Auto-Save nach Settings-Änderungen
let autoSaveTimer = null;
function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    window.electronAPI.setSettings(settings);
    showSaveToast();
  }, 600);
}

function showSaveToast() {
  const t = document.getElementById('save-toast');
  if (!t) return;
  t.style.display = 'block';
  setTimeout(() => { t.style.display='none'; }, 2800);
}

// ════════════════════════════════
// SETTINGS APPLY
// ════════════════════════════════
function applySettings(s, save=true) {
  const mc = document.getElementById('main-content');
  if (s.appBgImage) {
    if (mc) { mc.style.backgroundImage=`url("${s.appBgImage}")`; mc.style.backgroundSize='cover'; mc.style.backgroundPosition='center'; mc.classList.add('has-bg'); }
    document.documentElement.style.setProperty('--bgs','rgba(10,10,20,0.75)');
  } else {
    if (mc) { mc.style.backgroundImage=''; mc.classList.remove('has-bg'); }
    document.documentElement.style.removeProperty('--bgs');
  }
  applyAccent(s.accentColor);
  Object.entries(s.cardImages||{}).forEach(([id,url]) => {
    const el = document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
    if (!el) return;
    if (url) { const off=(s.cardImageOffsets||{})[id]||{x:0,y:0}; el.style.backgroundImage=`url("${url}")`; el.style.backgroundPosition=`calc(50% + ${off.x}px) calc(50% + ${off.y}px)`; el.style.opacity='1'; }
    else { el.style.backgroundImage=''; el.style.opacity='0'; }
  });
  setupClock();
  if (save) { window.electronAPI.setSettings(s); showSaveToast(); }
}

// ════════════════════════════════
// PARTICLES
// ════════════════════════════════
let particlesAnimId = null;
function setupParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  if (particlesAnimId) { cancelAnimationFrame(particlesAnimId); particlesAnimId=null; }
  canvas.style.display = settings.particlesEnabled ? 'block' : 'none';
  if (!settings.particlesEnabled) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
  const pts = Array.from({length:55},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.4,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,op:Math.random()*.35+.08}));
  window.addEventListener('resize',()=>{ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; });
  function tick() {
    ctx.clearRect(0,0,w,h);
    pts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(48,197,187,${p.op})`; ctx.fill(); });
    particlesAnimId = requestAnimationFrame(tick);
  }
  tick();
}

// ════════════════════════════════
// TITLEBAR
// ════════════════════════════════
function setupTitlebar() {
  document.getElementById('btn-minimize')?.addEventListener('click', ()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click', ()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',    ()=>window.electronAPI.close());
}

// ════════════════════════════════
// UPDATE BANNER
// ════════════════════════════════
function setupUpdateBanner() {
  const banner=document.getElementById('update-banner');
  window.electronAPI.onUpdateAvailable(info=>{ if(banner){banner.style.display='flex';document.getElementById('update-text').textContent=`🚀 Update v${info.version} verfügbar!`;} });
  window.electronAPI.onUpdateDownloaded(()=>{ document.getElementById('btn-download-update').style.display='none'; document.getElementById('btn-install-update').style.display='block'; });
  document.getElementById('btn-download-update')?.addEventListener('click',e=>{e.target.textContent='Lädt…';e.target.disabled=true;});
  document.getElementById('btn-install-update')?.addEventListener('click',()=>window.electronAPI.installUpdate());
  document.getElementById('btn-dismiss-update')?.addEventListener('click',()=>{ if(banner)banner.style.display='none'; });
}

// ════════════════════════════════
// ONLINE CHECK
// ════════════════════════════════
async function checkOnlineStatus() {
  const online = await window.electronAPI.checkOnline();
  const b = document.getElementById('offline-banner');
  if (b) b.style.display = online ? 'none' : 'flex';
}

// ════════════════════════════════
// SESSION AUTO-REFRESH
// ════════════════════════════════
function startSessionAutoRefresh() {
  window.electronAPI.refreshSessionsNow(); // sofort einmal
  clearInterval(sessionRefreshTimer);
  sessionRefreshTimer = setInterval(()=>window.electronAPI.refreshSessionsNow(), 60000);
}

// ════════════════════════════════
// PROFILES
// ════════════════════════════════
function buildProfileSelect() {
  const sel = document.getElementById('profile-select');
  if (!sel) return;
  sel.innerHTML = '';
  profiles.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    if (p.id === activeProfileId) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', ()=>switchProfile(sel.value));
}

function switchProfile(id) {
  const cur = profiles.find(p=>p.id===activeProfileId);
  if (cur) { cur.favorites=settings.favorites; cur.watchlist=watchlist; cur.searchHistory=searchHistory; cur.viewHistory=viewHistory; }
  const next = profiles.find(p=>p.id===id);
  if (next) {
    activeProfileId = id;
    settings.favorites = next.favorites||[];
    watchlist = next.watchlist||[];
    searchHistory = next.searchHistory||[];
    viewHistory = next.viewHistory||[];
    window.electronAPI.setActiveProfile(id);
    window.electronAPI.setProfiles(profiles);
    buildProviderGrid(); buildSidebarSubMenus();
  }
}

document.getElementById('btn-add-profile')?.addEventListener('click', ()=>{
  document.getElementById('profile-modal').style.display='flex';
  document.getElementById('new-profile-name').value='';
  document.getElementById('new-profile-name').focus();
});
document.getElementById('btn-create-profile')?.addEventListener('click', ()=>{
  const name = document.getElementById('new-profile-name').value.trim();
  if (!name) return;
  const id = `profile_${Date.now()}`;
  profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});
  window.electronAPI.setProfiles(profiles);
  buildProfileSelect();
  switchProfile(id);
  document.getElementById('profile-modal').style.display='none';
});
document.getElementById('btn-cancel-profile')?.addEventListener('click', ()=>document.getElementById('profile-modal').style.display='none');

// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showView(id) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const v = btn.dataset.view;
      if (v==='home')     { maybeMoveToPip(); showView('home'); }
      else if (v==='stream') {
        if (!currentProvider && !pipProviderId) showView('nothing');
        else if (currentProvider) showView('stream');
        else restoreFromPip();
      }
      else if (v==='news')     { showView('news');     loadNews(slideshows.news.mediaType, slideshows.news.tab); }
      else if (v==='upcoming') { showView('upcoming'); loadUpcoming(slideshows.upcoming.mediaType, slideshows.upcoming.months); }
      else if (v==='watchlist'){ showView('watchlist'); buildWatchlist(); }
      else if (v==='stats')    { showView('stats'); buildStatsView(); }
      else showView(v);
    });
  });

  setupToggle('nav-fav-toggle', 'nav-sub-favorites');
  setupToggle('nav-providers-toggle', 'nav-sub-providers');
  document.getElementById('goto-home-btn')?.addEventListener('click', ()=>showView('home'));

  // Search filter
  document.getElementById('fav-search')?.addEventListener('input', e=>filterSubMenu('nav-sub-favorites-list', e.target.value));
  document.getElementById('prov-search')?.addEventListener('input', e=>filterSubMenu('nav-sub-providers-list', e.target.value));

  // Close dropdowns when clicking outside
  document.addEventListener('mousedown', e=>{
    const favSub  = document.getElementById('nav-sub-favorites');
    const provSub = document.getElementById('nav-sub-providers');
    const favBtn  = document.getElementById('nav-fav-toggle');
    const provBtn = document.getElementById('nav-providers-toggle');
    if (favSub?.classList.contains('open') && !favSub.contains(e.target) && !favBtn?.contains(e.target)) { favSub.classList.remove('open'); favBtn?.classList.remove('open'); }
    if (provSub?.classList.contains('open') && !provSub.contains(e.target) && !provBtn?.contains(e.target)) { provSub.classList.remove('open'); provBtn?.classList.remove('open'); }
  });

  // News media switcher
  document.querySelectorAll('#news-switcher .media-type-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#news-switcher .media-type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const mt = btn.dataset.media;
      slideshows.news.mediaType = mt;
      settings.newsLastTab = mt; autoSave();
      loadNews(mt, slideshows.news.tab);
    });
  });

  // News tab buttons
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(tab=>{
    tab.addEventListener('click', async ()=>{
      document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.newsTab;
      slideshows.news.tab = which;
      loadNews(slideshows.news.mediaType, which);
    });
  });

  // Upcoming switcher
  document.querySelectorAll('#upcoming-switcher .media-type-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('#upcoming-switcher .media-type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const mt = btn.dataset.media;
      slideshows.upcoming.mediaType = mt;
      settings.upcomingLastTab = mt; autoSave();
      loadUpcoming(mt, slideshows.upcoming.months);
    });
  });

  // Upcoming range buttons
  document.querySelectorAll('.range-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const months = parseInt(btn.dataset.months);
      slideshows.upcoming.months = months;
      loadUpcoming(slideshows.upcoming.mediaType, months);
    });
  });

  // Hidden toggles
  document.getElementById('news-show-hidden')?.addEventListener('click', ()=>showHiddenPanel('news', slideshows.news.mediaType));
  document.getElementById('upcoming-show-hidden')?.addEventListener('click', ()=>showHiddenPanel('upcoming', slideshows.upcoming.mediaType));
  document.getElementById('hidden-close')?.addEventListener('click', ()=>document.getElementById('hidden-overlay').style.display='none');
}

function setupToggle(btnId, subId) {
  const btn=document.getElementById(btnId), sub=document.getElementById(subId);
  btn?.addEventListener('click', ()=>{ btn.classList.toggle('open'); sub?.classList.toggle('open'); });
}
function filterSubMenu(listId, q) {
  document.getElementById(listId)?.querySelectorAll('.nav-sub-btn').forEach(b=>{ b.style.display=b.textContent.toLowerCase().includes(q.toLowerCase())?'flex':'none'; });
}

// ════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e=>{
    if (e.ctrlKey||e.metaKey) {
      if (e.key==='f') { e.preventDefault(); document.getElementById('search-input')?.focus(); }
      if (e.key==='m') { e.preventDefault(); if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');} }
    }
    if (e.key==='F11') { e.preventDefault(); window.electronAPI.setFullscreen(!isFullscreen); }
  });
}

// ════════════════════════════════
// NEWS
// ════════════════════════════════
async function loadNews(mediaType='movies', tab='trending') {
  slideshows.news.mediaType = mediaType;
  slideshows.news.tab = tab;

  // Sync switcher UI
  document.querySelectorAll('#news-switcher .media-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.media===mediaType));
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.toggle('active',t.dataset.newsTab===tab));

  let data;
  if (tab==='trending') data = await window.electronAPI.getTrending().catch(()=>({}));
  else                  data = await window.electronAPI.getNewReleases().catch(()=>({}));

  const raw = mediaType==='movies' ? (data.movies||[]) : (data.shows||[]);
  const ns = 'news';
  slideshows.news.items = raw.filter(i => !hiddenItems[ns]?.[i.id]);
  buildFullSlideshow('news');
}

// ════════════════════════════════
// UPCOMING
// ════════════════════════════════
async function loadUpcoming(mediaType='movies', months=1) {
  slideshows.upcoming.mediaType = mediaType;
  slideshows.upcoming.months    = months;

  document.querySelectorAll('#upcoming-switcher .media-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.media===mediaType));
  document.querySelectorAll('.range-btn').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.months)===months));

  const data = await window.electronAPI.getUpcoming(months).catch(()=>({}));
  const raw  = mediaType==='movies' ? (data.movies||[]) : (data.shows||[]);
  slideshows.upcoming.items = raw.filter(i => !hiddenItems['upcoming']?.[i.id]);
  buildFullSlideshow('upcoming');
}

// ════════════════════════════════
// BUILD FULL SLIDESHOW
// ════════════════════════════════
function buildFullSlideshow(key) {
  const ss     = slideshows[key];
  const track  = document.getElementById(`${key}-track`);
  const dots   = document.getElementById(`${key}-dots`);
  const bgEl   = document.getElementById(`${key}-bg`);
  const items  = ss.items;

  clearInterval(ss.timer);
  ss.idx = 0;

  if (!track||!dots) return;
  track.innerHTML = ''; dots.innerHTML = '';

  if (!items.length) {
    track.innerHTML = '<div style="color:rgba(255,255,255,.4);padding:20px;font-size:13px">Keine Daten verfügbar.</div>';
    return;
  }

  items.forEach((item,i)=>{
    const title  = item.title||item.name||'Unbekannt';
    const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
    const rd     = item.release_date||item.first_air_date||'';
    const year   = rd.substring(0,4);
    const fmtDate= rd && key==='upcoming' ? new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}) : null;
    const tmdbType = item.title ? 'movie' : 'tv';
    const isInWl = !!watchlist.find(w=>w.id===`${tmdbType}_${item.id}`);

    const card = document.createElement('div');
    card.className = 'slide-card' + (i===0?' active-slide':'');
    card.dataset.idx = i;
    card.innerHTML = `
      <div class="slide-card-inner">
        ${poster ? `<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">` : `<div class="slide-card-poster-ph"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
        <div class="slide-card-body">
          <div class="slide-card-title">${esc(title)}</div>
          <div class="slide-card-meta">
            ${year ? `<span class="slide-card-year">${year}</span>` : ''}
            ${fmtDate ? `<span style="color:var(--acc);font-weight:600">📅 ${fmtDate}</span>` : ''}
            ${rating ? `<span class="slide-card-rating">★ ${rating}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="slide-card-actions">
        <button class="slide-bookmark-btn ${isInWl?'bookmarked':''}" title="${isInWl?'Aus Merkliste entfernen':'Merken'}">🔖</button>
        <button class="slide-hide-btn" title="Ausblenden">✕</button>
      </div>
    `;

    // Bookmark
    card.querySelector('.slide-bookmark-btn').addEventListener('click', e=>{
      e.stopPropagation();
      const wlId = `${tmdbType}_${item.id}`;
      if (watchlist.find(w=>w.id===wlId)) {
        watchlist = watchlist.filter(w=>w.id!==wlId);
        e.target.classList.remove('bookmarked');
        e.target.title = 'Merken';
        showToast(`${title} aus Merkliste entfernt`);
      } else {
        watchlist.unshift({ id:wlId, tmdbId:item.id, tmdbType, title, poster:poster||'', releaseDate:rd, mediaType:tmdbType==='tv'?'tv':'movie' });
        e.target.classList.add('bookmarked');
        e.target.title = 'Aus Merkliste entfernen';
        showToast(`${title} gemerkt`);
      }
      settings.watchlist = watchlist; autoSave();
    });

    // Hide with fade
    card.querySelector('.slide-hide-btn').addEventListener('click', e=>{
      e.stopPropagation();
      card.classList.add('fading');
      card.addEventListener('animationend', ()=>{
        const ns = key==='news'?'news':'upcoming';
        if (!hiddenItems[ns]) hiddenItems[ns]={};
        hiddenItems[ns][item.id] = { title, poster:poster||'', tmdbId:item.id, tmdbType, releaseDate:rd };
        settings.hiddenItems = hiddenItems; autoSave();
        ss.items = ss.items.filter(it=>it.id!==item.id);
        buildFullSlideshow(key);
      }, { once:true });
    });

    // Click → Detail
    card.querySelector('.slide-card-inner').addEventListener('click', ()=>showDetailPopup(item.id, tmdbType, title));
    track.appendChild(card);

    // Dot
    const dot = document.createElement('button');
    dot.className = 'slide-dot'+(i===0?' active':'');
    dot.addEventListener('click', ()=>goToSlide(key,i));
    dots.appendChild(dot);
  });

  // Arrows
  const prev = document.getElementById(`${key}-prev`), next = document.getElementById(`${key}-next`);
  if (prev) prev.onclick = ()=>goToSlide(key, ss.idx-1);
  if (next) next.onclick = ()=>goToSlide(key, ss.idx+1);

  // Initial BG
  updateSlideshowBg(key, items[0]);

  ss.timer = setInterval(()=>goToSlide(key, ss.idx+1), 5000);
}

function goToSlide(key, idx) {
  const ss = slideshows[key];
  if (!ss.items.length) return;
  idx = ((idx % ss.items.length) + ss.items.length) % ss.items.length;
  ss.idx = idx;

  const track = document.getElementById(`${key}-track`);
  const dots  = document.getElementById(`${key}-dots`);
  if (!track||!dots) return;

  track.querySelectorAll('.slide-card').forEach((c,i)=>c.classList.toggle('active-slide',i===idx));
  const active = track.querySelectorAll('.slide-card')[idx];
  if (active) active.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
  dots.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));

  updateSlideshowBg(key, ss.items[idx]);

  clearInterval(ss.timer);
  ss.timer = setInterval(()=>goToSlide(key, ss.idx+1), 5000);
}

function updateSlideshowBg(key, item) {
  const bgEl = document.getElementById(`${key}-bg`);
  if (!bgEl||!item) return;
  const backdrop = item.backdrop_path ? `${TMDB_BACKDROP}${item.backdrop_path}` : '';
  if (backdrop) bgEl.style.backgroundImage = `url("${backdrop}")`;
}

// ════════════════════════════════
// HIDDEN PANEL
// ════════════════════════════════
function showHiddenPanel(ns, mediaType) {
  const hidden = hiddenItems[ns] || {};
  const overlay = document.getElementById('hidden-overlay');
  const grid    = document.getElementById('hidden-grid');
  if (!overlay||!grid) return;
  grid.innerHTML = '';
  const ids = Object.keys(hidden);
  if (!ids.length) { showToast('Keine ausgeblendeten Einträge.'); return; }
  ids.forEach(id=>{
    const item = hidden[id];
    const card = document.createElement('div');
    card.className = 'hidden-card'; card.id = `hidden-card-${id}`;
    card.innerHTML = `
      ${item.poster ? `<img class="hidden-card-poster" src="${item.poster}" loading="lazy"/>` : '<div class="hidden-card-poster" style="aspect-ratio:2/3;background:var(--bg2);display:flex;align-items:center;justify-content:center;opacity:.4">🎬</div>'}
      <div class="hidden-card-body"><div class="hidden-card-title">${esc(item.title||id)}</div></div>
      <button class="hidden-restore-btn">Einblenden</button>
    `;
    card.querySelector('.hidden-restore-btn').addEventListener('click', ()=>{
      card.classList.add('restoring');
      card.addEventListener('transitionend', ()=>{
        delete hidden[id];
        settings.hiddenItems = hiddenItems; autoSave();
        card.remove();
        if (ns==='news') loadNews(slideshows.news.mediaType, slideshows.news.tab);
        else loadUpcoming(slideshows.upcoming.mediaType, slideshows.upcoming.months);
      }, { once:true });
    });
    grid.appendChild(card);
  });
  overlay.style.display = 'flex';
}

// ════════════════════════════════
// DETAIL POPUP
// ════════════════════════════════
async function showDetailPopup(tmdbId, tmdbType, title) {
  const overlay = document.getElementById('detail-overlay');
  if (!overlay) return;
  overlay.style.display='flex';
  document.getElementById('detail-title').textContent=title||'Lädt…';
  document.getElementById('detail-overview').textContent='';
  document.getElementById('detail-poster').src='';
  document.getElementById('detail-backdrop').style.backgroundImage='';
  document.getElementById('detail-meta').innerHTML='';
  document.getElementById('detail-providers').innerHTML='';
  document.getElementById('detail-badges').innerHTML='';
  document.getElementById('detail-actions').innerHTML='';
  document.getElementById('detail-trailer-wrap').style.display='none';

  const data = await window.electronAPI.getTmdbDetail({id:tmdbId,type:tmdbType}).catch(()=>null);
  if (!data||data.error) return;
  const { detail, videos, providers } = data;
  if (!detail) return;

  const t       = detail.title||detail.name||title;
  const poster  = detail.poster_path ? `${TMDB_IMG}${detail.poster_path}` : '';
  const backdrop= detail.backdrop_path ? `${TMDB_BACKDROP}${detail.backdrop_path}` : '';
  const year    = (detail.release_date||detail.first_air_date||'').substring(0,4);
  const runtime = detail.runtime?`${detail.runtime} Min.`:detail.episode_run_time?.[0]?`~${detail.episode_run_time[0]} Min./Ep.`:'';
  const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : null;
  const genres  = (detail.genres||[]).map(g=>g.name).join(', ');
  const overview= detail.overview||'Keine Beschreibung verfügbar.';

  document.getElementById('detail-title').textContent = t;
  document.getElementById('detail-overview').textContent = overview;
  const pEl = document.getElementById('detail-poster'); if(pEl&&poster){pEl.src=poster;pEl.alt=t;}
  const bEl = document.getElementById('detail-backdrop'); if(bEl&&backdrop) bEl.style.backgroundImage=`url("${backdrop}")`;

  const badges = document.getElementById('detail-badges');
  if(badges) badges.innerHTML=[year,runtime,rating?`★ ${rating}`:null,tmdbType==='tv'?'Serie':'Film'].filter(Boolean).map(p=>`<span class="detail-badge">${esc(p)}</span>`).join('');

  const meta = document.getElementById('detail-meta');
  if(meta) meta.innerHTML=[genres?`<div class="detail-meta-item"><span class="detail-meta-label">Genre: </span>${esc(genres)}</div>`:'',detail.vote_count?`<div class="detail-meta-item"><span class="detail-meta-label">Bewertungen: </span>${detail.vote_count.toLocaleString('de')}</div>`:''].filter(Boolean).join('');

  // Trailer
  const trailer = videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
  if (trailer) {
    document.getElementById('detail-trailer-wrap').style.display='block';
    document.getElementById('detail-trailer-wv').setAttribute('src',`https://www.youtube.com/embed/${trailer.key}?autoplay=0`);
  }

  // Providers
  const provWrap = document.getElementById('detail-providers');
  if(provWrap&&providers) {
    const all=[...(providers.flatrate||[]),(providers.rent||[]),(providers.buy||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i).slice(0,8);
    provWrap.innerHTML = all.length
      ? all.map(p=>`<div class="detail-provider-chip"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`).join('')
      : '<span style="font-size:11px;color:var(--tx3)">Keine Streaming-Daten</span>';
  }

  // Actions
  const actions = document.getElementById('detail-actions');
  if(actions) {
    const wseUrl    = `https://www.werstreamt.es/?q=${enc(t)}`;
    const googleUrl = `https://www.google.com/search?q=${enc(t+' stream deutsch')}`;
    const isInWl    = !!watchlist.find(w=>w.id===`${tmdbType}_${tmdbId}`);
    actions.innerHTML = `
      <button class="detail-action-btn primary" onclick="openProviderAtUrl('werstreamt','${esc(wseUrl)}','Werstreamt.es','persist:werstreamt')">↗ Wo streamen?</button>
      <button class="detail-action-btn secondary" onclick="window.electronAPI.openExternal('${esc(googleUrl)}')">🔍 Google</button>
      <button class="detail-action-btn secondary" id="detail-wl-btn">${isInWl?'🔖 Gemerkt':'🔖 Merken'}</button>
    `;
    document.getElementById('detail-wl-btn')?.addEventListener('click', e=>{
      const wlId = `${tmdbType}_${tmdbId}`;
      if(watchlist.find(w=>w.id===wlId)){ watchlist=watchlist.filter(w=>w.id!==wlId); e.target.textContent='🔖 Merken'; showToast('Aus Merkliste entfernt'); }
      else { watchlist.unshift({id:wlId,tmdbId,tmdbType,title:t,poster,releaseDate:detail.release_date||detail.first_air_date||'',mediaType:tmdbType==='tv'?'tv':'movie'}); e.target.textContent='🔖 Gemerkt'; showToast('Gemerkt!'); }
      settings.watchlist=watchlist; autoSave();
    });
  }

  document.getElementById('detail-close')?.addEventListener('click', closeDetailPopup);
  overlay.addEventListener('click', e=>{ if(e.target===overlay)closeDetailPopup(); });
}

function closeDetailPopup() {
  document.getElementById('detail-overlay').style.display='none';
  const wv=document.getElementById('detail-trailer-wv'); if(wv) wv.setAttribute('src','about:blank');
}

// ════════════════════════════════
// SEARCH
// ════════════════════════════════
function setupSearch() {
  const input=document.getElementById('search-input');
  const clear=document.getElementById('search-clear');
  const dd   =document.getElementById('search-dropdown');

  input?.addEventListener('focus',()=>{
    if (input.value.trim()&&dd.innerHTML) dd.style.display='block';
    else if (!input.value.trim()&&searchHistory.length) showSearchHistory(dd);
  });
  input?.addEventListener('input',()=>{
    const q=input.value.trim();
    clear.style.display=q?'block':'none';
    clearTimeout(searchTimer);
    if(!q){ dd.style.display=searchHistory.length?'block':'none'; if(searchHistory.length)showSearchHistory(dd); else{dd.innerHTML='';dd.style.display='none';} return; }
    lastQuery=q; searchPage=1;
    showInstantSuggestions(q,dd);
    searchTimer=setTimeout(()=>runSearch(q,1),420);
  });
  clear?.addEventListener('click',()=>{ input.value='';clear.style.display='none';dd.style.display='none';dd.innerHTML='';lastQuery=''; });
  document.addEventListener('mousedown',e=>{ const wrap=document.getElementById('search-bar')?.closest('.search-bar-wrap'); if(wrap&&!wrap.contains(e.target)){dd.style.display='none';} });
}

function showSearchHistory(dd) {
  dd.innerHTML=`<div class="search-dd-section">Zuletzt gesucht</div>`;
  searchHistory.slice(0,8).forEach(q=>{ dd.innerHTML+=`<div class="search-dd-history-item" data-q="${esc(q)}">🕐 ${esc(q)}</div>`; });
  dd.querySelectorAll('.search-dd-history-item').forEach(el=>el.addEventListener('click',()=>{ const q=el.dataset.q; document.getElementById('search-input').value=q; document.getElementById('search-input').dispatchEvent(new Event('input')); }));
  dd.style.display='block';
}

function addToSearchHistory(q) {
  if(!q||searchHistory.includes(q)) return;
  searchHistory.unshift(q);
  searchHistory=searchHistory.slice(0,20);
  settings.searchHistory=searchHistory; autoSave();
}

function showInstantSuggestions(q,dd) {
  const ql=q.toLowerCase();
  const provMatches=Object.entries(PROVIDERS).filter(([,p])=>p.name.toLowerCase().includes(ql)).sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
  if(!provMatches.length) return;
  let html=`<div class="search-dd-section">Anbieter</div>`;
  provMatches.slice(0,4).forEach(([id,p])=>{
    html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span> ${esc(p.tag)}</div></div></div>`;
  });
  dd.innerHTML=html;
  dd.querySelectorAll('.search-dd-item[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
  dd.style.display='block';
}

async function runSearch(q, page=1) {
  const dd=document.getElementById('search-dropdown');
  dd.style.display='block';
  const ql=q.toLowerCase();
  const provMatches=Object.entries(PROVIDERS).filter(([,p])=>p.name.toLowerCase().includes(ql)).sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
  const ytId=extractYtId(q);
  let html='';

  if(provMatches.length&&page===1){
    html+=`<div class="search-dd-section">Anbieter</div>`;
    provMatches.slice(0,3).forEach(([id,p])=>{ html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`; });
  }

  if(ytId&&page===1){
    html+=`<div class="search-dd-section">YouTube</div><div class="search-dd-item" data-yt="${ytId}"><img class="search-dd-poster" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">YouTube Video abspielen</div><div class="search-dd-meta">Direkt in OmniSight öffnen</div></div></div>`;
  }

  if(!ytId){
    try{
      const data=await window.electronAPI.searchTitle(q);
      if(data.Search&&data.Search.length){
        const start=(page-1)*5, slice=data.Search.slice(start,start+5);
        const total=parseInt(data.totalResults)||data.Search.length;
        const hasMore=start+5<total;
        if(page===1) html+=`<div class="search-dd-section">Filme &amp; Serien</div>`;
        for(const item of slice){
          let detail=null; try{detail=await window.electronAPI.searchTitleDetail(item.imdbID);}catch{}
          const tl=item.Type==='movie'?'Film':item.Type==='series'?'Serie':item.Type;
          const rt=detail?.Runtime&&detail.Runtime!=='N/A'?detail.Runtime:null;
          const ir=detail?.imdbRating&&detail.imdbRating!=='N/A'?detail.imdbRating:null;
          const rtr=detail?.Ratings?.find(r=>r.Source==='Rotten Tomatoes')?.Value||null;
          const gu=`https://www.google.com/search?q=${enc(item.Title+' wo streamen')}`;
          const chips=Object.entries(SEARCH_URLS).slice(0,4).map(([id,uf])=>`<div class="search-dd-provider-chip" data-prov="${id}" data-purl="${esc(uf(item.Title))}"><img src="${getFavicon(id)}" onerror="this.style.display='none'"/>${esc(PROVIDERS[id]?.name||id)}</div>`).join('');
          html+=`<div class="search-dd-item search-dd-film" data-imdb="${item.imdbID}" data-title="${esc(item.Title)}"><${item.Poster&&item.Poster!=='N/A'?`img class="search-dd-poster" src="${item.Poster}"`:' div class="search-dd-poster-ph"'}>🎬${item.Poster&&item.Poster!=='N/A'?'/>':'</div>'}<div class="search-dd-info"><div class="search-dd-title">${esc(item.Title)}</div><div class="search-dd-meta"><span class="search-dd-badge">${tl}</span>${item.Year?`<span>${item.Year}</span>`:''}${rt?`<span>⏱${rt}</span>`:''}${ir?`<span class="search-dd-rating">IMDb ${ir}</span>`:''}${rtr?`<span class="search-dd-rating">🍅${rtr}</span>`:''}</div><div class="search-dd-providers">${chips}<div class="search-dd-provider-chip" data-gurl="${esc(gu)}">🔍 Google</div></div></div></div>`;
        }
        if(hasMore) html+=`<div class="search-dd-more" id="dd-more-btn">Weitere Ergebnisse ↓</div>`;
        else html+=`<div class="search-dd-no-more">Keine weiteren Ergebnisse.</div>`;
      } else if(!provMatches.length&&!ytId) {
        html+=`<div class="search-dd-empty" style="padding:20px 14px;text-align:center;font-size:13px;color:var(--tx2)">Keine Ergebnisse für „${esc(q)}"</div>`;
      }
    }catch{}
  }

  if(page===1){ dd.innerHTML=html; }
  else {
    const mb=document.getElementById('dd-more-btn'); if(mb)mb.remove();
    const nm=dd.querySelector('.search-dd-no-more'); if(nm)nm.remove();
    const temp=document.createElement('div'); temp.innerHTML=html;
    temp.querySelectorAll('.search-dd-item').forEach(el=>dd.appendChild(el));
    const newMore=temp.querySelector('#dd-more-btn'); if(newMore)dd.appendChild(newMore);
    const newNm=temp.querySelector('.search-dd-no-more'); if(newNm)dd.appendChild(newNm);
    // Scroll down smoothly
    dd.scrollTo({ top: dd.scrollHeight, behavior: 'smooth' });
  }
  dd.style.display='block';

  // Attach events
  dd.querySelectorAll('.search-dd-item[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
  dd.querySelectorAll('.search-dd-item[data-yt]').forEach(el=>el.addEventListener('click',()=>openProviderAtUrl('youtube',`https://www.youtube.com/watch?v=${el.dataset.yt}`,'YouTube','persist:youtube')));
  dd.querySelectorAll('.search-dd-film').forEach(el=>el.addEventListener('click',async e=>{
    if(e.target.closest('.search-dd-provider-chip')) return;
    const imdbId=el.dataset.imdb, title=el.dataset.title;
    // TMDB-Suche via Title
    closeSearchDropdown();
    showDetailPopupByTitle(title, imdbId);
  }));
  dd.querySelectorAll('.search-dd-provider-chip[data-prov]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProviderAtUrl(el.dataset.prov,el.dataset.purl,PROVIDERS[el.dataset.prov]?.name,PROVIDERS[el.dataset.prov]?.partition);}));
  dd.querySelectorAll('.search-dd-provider-chip[data-gurl]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();window.electronAPI.openExternal(el.dataset.gurl);}));
  document.getElementById('dd-more-btn')?.addEventListener('click',()=>{ searchPage++; runSearch(lastQuery,searchPage); });

  addToSearchHistory(q);
}

function closeSearchDropdown() { const dd=document.getElementById('search-dropdown'); if(dd)dd.style.display='none'; }

async function showDetailPopupByTitle(title, imdbId) {
  // OMDB → TMDB ID Suche
  const detail = await window.electronAPI.searchTitleDetail(imdbId).catch(()=>null);
  if (detail && detail.imdbID) {
    // Bestimme Typ
    const type = detail.Type==='movie' ? 'movie' : 'tv';
    // TMDB sucht via External ID
    try {
      const r = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=2dca580c2a14b55200e784d157207b4d&external_source=imdb_id`);
      const d = await r.json();
      const result = d.movie_results?.[0] || d.tv_results?.[0];
      if (result) { showDetailPopup(result.id, result.title?'movie':'tv', result.title||result.name||title); return; }
    } catch {}
  }
  showToast('Detail-Info nicht verfügbar.');
}

function extractYtId(s) {
  const p=[/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/^([a-zA-Z0-9_-]{11})$/];
  for(const r of p){const m=s.match(r);if(m)return m[1];}return null;
}

// ════════════════════════════════
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid() {
  const grid=document.getElementById('providers-grid');
  if(!grid) return;
  grid.innerHTML='';
  const layout=settings.cardLayout||'normal';
  grid.className='providers-grid'+(layout!=='normal'?' '+layout:'');
  document.getElementById('layout-normal')?.classList.toggle('active',layout==='normal');
  document.getElementById('layout-compact')?.classList.toggle('active',layout==='compact');
  document.getElementById('layout-mini')?.classList.toggle('active',layout==='mini');

  const favs=settings.favorites||[];
  let sorted=Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  if(providerOrder.length) sorted=sorted.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai===-1&&bi===-1)return a[1].name.localeCompare(b[1].name);if(ai===-1)return 1;if(bi===-1)return-1;return ai-bi;});
  const favL=sorted.filter(([id])=>favs.includes(id)), rest=sorted.filter(([id])=>!favs.includes(id));
  if(favL.length){addLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}
  setupCardDragDrop(grid);
}

function addLabel(grid,text){const el=document.createElement('div');el.className='grid-section-label';el.textContent=text;grid.appendChild(el);}

function createCard(id,p,isFav){
  const card=document.createElement('div');
  card.className='provider-card'; card.dataset.id=id; card.setAttribute('draggable','true');
  const imgUrl=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const layout=settings.cardLayout||'normal';
  const isMini=layout==='mini';

  card.innerHTML=`
    ${p.quality&&!isMini?`<div class="card-quality-badge">${p.quality}</div>`:''}
    <div class="card-banner">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,${p.color}22 50%,transparent 80%)"></div>
      <div class="card-banner-img" style="${imgUrl?`background-image:url('${imgUrl}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:1;transition:opacity .3s`:'opacity:0;position:absolute;inset:0'}"></div>
      <img class="card-favicon" src="${getFavicon(id)}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="position:relative;z-index:2;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;background:${p.color}33">${p.name.charAt(0)}</div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <span class="card-name">${p.name}</span>
        ${!isMini?`<span class="card-tag">${p.tag}</span>`:''}
      </div>
      ${!isMini?'<span class="card-arrow">→</span>':''}
    </div>
    <!-- Lesezeichen statt Stern -->
    <button class="card-bookmark ${isFav?'active':''}" data-id="${id}" title="${isFav?'Aus Favoriten entfernen':'Favorit'}">
      <svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path class="bookmark-fill" d="M1 1h12v15l-6-4-6 4z" fill="${isFav?'#FFD700':'none'}"/>
      </svg>
    </button>
  `;

  card.querySelector('.card-bookmark').addEventListener('click',e=>{e.stopPropagation();toggleFavorite(id);});
  card.addEventListener('click',e=>{ if(!e.target.closest('.card-bookmark'))openProvider(id); });
  return card;
}

function setupLayoutButtons() {
  ['normal','compact','mini'].forEach(l=>{
    document.getElementById(`layout-${l}`)?.addEventListener('click',()=>{ settings.cardLayout=l; autoSave(); buildProviderGrid(); });
  });
}

function setupCardDragDrop(grid) {
  let dragSrc=null;
  grid.querySelectorAll('.provider-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{dragSrc=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));});
    card.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';if(card!==dragSrc)card.classList.add('drag-over');});
    card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
    card.addEventListener('drop',e=>{
      e.preventDefault();card.classList.remove('drag-over');
      if(!dragSrc||dragSrc===card) return;
      const ids=[...grid.querySelectorAll('.provider-card')].map(c=>c.dataset.id);
      const si=ids.indexOf(dragSrc.dataset.id),di=ids.indexOf(card.dataset.id);
      if(si>-1&&di>-1){ids.splice(si,1);ids.splice(di,0,dragSrc.dataset.id);}
      providerOrder=ids; settings.providerOrder=ids; autoSave(); buildProviderGrid();
    });
  });
}

function toggleFavorite(id) {
  const favs=settings.favorites||[]; const idx=favs.indexOf(id);
  if(idx===-1)favs.push(id);else favs.splice(idx,1);
  settings.favorites=favs; autoSave(); buildProviderGrid(); buildSidebarSubMenus();
}

// ════════════════════════════════
// SIDEBAR
// ════════════════════════════════
function buildSidebarSubMenus() { buildFavSub(); buildProvSub(); }
function buildFavSub() {
  const list=document.getElementById('nav-sub-favorites-list');if(!list)return;list.innerHTML='';
  const favs=settings.favorites||[];
  if(!favs.length){const h=document.createElement('div');h.style.cssText='padding:5px 10px;font-size:11px;color:var(--tx3)';h.textContent='Noch keine Favoriten';list.appendChild(h);return;}
  favs.forEach(id=>{const p=PROVIDERS[id];if(p)list.appendChild(makeSubBtn(id,p));});
}
function buildProvSub() {
  const list=document.getElementById('nav-sub-providers-list');if(!list)return;list.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>list.appendChild(makeSubBtn(id,p)));
}
function makeSubBtn(id,p) {
  const btn=document.createElement('button');btn.className='nav-sub-btn';
  btn.innerHTML=`<img src="${getFavicon(id)}" onerror="this.outerHTML='<span class=\\'dot\\' style=\\'background:${p.color}\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${p.name}`;
  btn.addEventListener('click',()=>openProvider(id));return btn;
}

// ════════════════════════════════
// PROVIDER ÖFFNEN
// ════════════════════════════════
function openProvider(id) { openProviderAtUrl(id, PROVIDERS[id]?.url, PROVIDERS[id]?.name, PROVIDERS[id]?.partition); }

function openProviderAtUrl(id, url, name, partition) {
  const p=PROVIDERS[id]||{url,name:name||id,partition:partition||`persist:${id}`,color:'#333',multiTab:false};
  if(!url) return;

  // Wenn PiP-Provider → restore ohne Reload
  if(pipProviderId===id){ restoreFromPip(); return; }
  // Aktiver Provider ohne Wechsel → einfach View zeigen
  if(currentProvider===id && currentWebview){ showView('stream'); return; }

  if(currentWebview&&currentProvider&&currentProvider!==id){ moveToPip(currentProvider,currentWebview); currentWebview=null; currentProvider=null; }

  currentProvider=id; currentProvUrl=url;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent=p.name;
  document.getElementById('btn-watching').style.display='flex';
  window.electronAPI.setupWebviewSession(p.partition||`persist:${id}`);

  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';

  const wv=document.createElement('webview');
  wv.setAttribute('src',url);
  wv.setAttribute('partition',p.partition||`persist:${id}`);
  wv.setAttribute('allowpopups','');
  // Echter Chrome-UA, speziell für YouTube/Google-Login
  const ua=id==='youtube'?'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  wv.setAttribute('useragent',ua);
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';

  // Multi-Tab für bs.to / cine.to
  if(p.multiTab){
    setupStreamTabs(id, wv, url);
    wv.addEventListener('new-window',e=>{ if(e.url&&e.url.startsWith('http')) addStreamTab(id, e.url); });
  } else {
    document.getElementById('stream-tabs-bar').style.display='none';
    streamTabs=[]; activeTabId=null;
    wv.addEventListener('new-window',e=>{ if(e.url&&(e.url.startsWith('http')||e.url.startsWith('//'))) wv.loadURL(e.url); });
  }

  currentWebview=wv; if(wrap)wrap.appendChild(wv);
  wv.addEventListener('did-start-loading',()=>showLoading(`${p.name}…`));
  wv.addEventListener('did-stop-loading',()=>{
    hideLoading();
    document.getElementById('btn-retry').style.display='none';
    addViewHistory({id,name:p.name,url,time:Date.now()});
    startWatchTimer(id);
    window.electronAPI.refreshSessionsNow();
  });
  wv.addEventListener('did-fail-load',async e=>{
    if(e.errorCode===-3||e.errorCode===0) return;
    hideLoading(); document.getElementById('btn-retry').style.display='flex';
    let diag='';
    try{const r=await window.electronAPI.checkUrl(url);diag=r.ok?`Erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`:`Verbindungsfehler: ${r.error}`;}catch{}
    showWebviewError(p,url,e.errorCode,e.errorDescription,diag);
  });

  closeSearchDropdown();
  showView('stream');
}

window.openProvider=openProvider;
window.openProviderAtUrl=openProviderAtUrl;

// ════════════════════════════════
// STREAM TABS (bs.to / cine.to)
// ════════════════════════════════
function setupStreamTabs(providerId, wv, url) {
  streamTabs = [{ id:'tab_0', title: PROVIDERS[providerId]?.name||providerId, url, webview: wv }];
  activeTabId = 'tab_0';
  renderStreamTabs();
}

function addStreamTab(providerId, url) {
  const id = 'tab_'+Date.now();
  const p = PROVIDERS[providerId];

  const wv = document.createElement('webview');
  wv.setAttribute('src', url);
  wv.setAttribute('partition', p?.partition||`persist:${providerId}`);
  wv.setAttribute('allowpopups','');
  wv.setAttribute('useragent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  wv.addEventListener('new-window',e=>{ if(e.url&&e.url.startsWith('http')) addStreamTab(providerId,e.url); });
  wv.addEventListener('page-title-updated',e=>{ const tab=streamTabs.find(t=>t.id===id); if(tab){tab.title=e.title||url;renderStreamTabs();} });
  window.electronAPI.setupWebviewSession(p?.partition||`persist:${providerId}`);

  streamTabs.push({ id, title: url, url, webview: wv });
  switchToTab(id);
}

function switchToTab(id) {
  activeTabId = id;
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;
  wrap.innerHTML='';
  const tab = streamTabs.find(t=>t.id===id);
  if (tab?.webview) wrap.appendChild(tab.webview);
  currentWebview = tab?.webview||null;
  renderStreamTabs();
}

function closeStreamTab(id) {
  const idx = streamTabs.findIndex(t=>t.id===id);
  if(idx===-1) return;
  streamTabs.splice(idx,1);
  if(streamTabs.length===0){ streamTabs=[]; activeTabId=null; document.getElementById('stream-tabs-bar').style.display='none'; stopStream(); return; }
  const newActive = streamTabs[Math.max(0,idx-1)];
  switchToTab(newActive.id);
}

function renderStreamTabs() {
  const bar = document.getElementById('stream-tabs-bar');
  const cont= document.getElementById('stream-tabs');
  if(!bar||!cont) return;
  bar.style.display = streamTabs.length > 0 ? 'block' : 'none';
  cont.innerHTML='';
  streamTabs.forEach(tab=>{
    const el=document.createElement('div');
    el.className='stream-tab'+(tab.id===activeTabId?' active':'');
    el.innerHTML=`<span class="stream-tab-title">${esc(tab.title.substring(0,30))}</span><button class="stream-tab-close">✕</button>`;
    el.querySelector('.stream-tab-title').addEventListener('click',()=>switchToTab(tab.id));
    el.querySelector('.stream-tab-close').addEventListener('click',e=>{e.stopPropagation();closeStreamTab(tab.id);});
    cont.appendChild(el);
  });
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function stopStream() {
  stopWatchTimer();
  if(isFullscreen) window.electronAPI.setFullscreen(false);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';
  currentWebview=null; currentProvider=null; currentProvUrl=null;
  streamTabs=[]; activeTabId=null;
  document.getElementById('stream-tabs-bar').style.display='none';
  showView('home');
}

function maybeMoveToPip() {
  if(currentWebview&&currentProvider){ moveToPip(currentProvider,currentWebview); currentWebview=null; currentProvider=null; }
}

function setupStreamControls() {
  document.getElementById('back-btn')?.addEventListener('click',()=>{ if(isFullscreen)window.electronAPI.setFullscreen(false); maybeMoveToPip(); showView('home'); });
  document.getElementById('btn-stop')?.addEventListener('click',()=>{ if(!confirm('Stream beenden?'))return; stopStream(); });
  document.getElementById('btn-pip')?.addEventListener('click',()=>{ if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');} });
  document.getElementById('btn-fullscreen')?.addEventListener('click',()=>window.electronAPI.setFullscreen(!isFullscreen));
  document.getElementById('btn-retry')?.addEventListener('click',()=>{ if(currentWebview&&currentProvUrl)currentWebview.loadURL(currentProvUrl); });
  document.getElementById('btn-second-window')?.addEventListener('click',()=>{
    if(!currentProvider||!currentProvUrl) return;
    const p=PROVIDERS[currentProvider];
    window.electronAPI.openSecondWindow({providerId:currentProvider,url:currentProvUrl,partition:p?.partition||`persist:${currentProvider}`});
  });
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{
    if(!currentProvider)return;const p=PROVIDERS[currentProvider];if(!confirm(`Von ${p.name} abmelden?`))return;
    window.electronAPI.clearProviderSession(currentProvider);if(currentWebview)currentWebview.loadURL(p.url);window.electronAPI.refreshSessionsNow();
  });
}

function showWebviewError(p,url,code,desc,diag) {
  const wrap=document.getElementById('webview-wrap');if(!wrap)return;
  const crInfo=code?` Für Crunchyroll: KAT-6005 kann durch DRM-Einschränkungen entstehen. Versuche es über den Browser.`:'';
  wrap.innerHTML=`<div class="webview-error"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>${p.name} konnte nicht geladen werden</h3><p>${diag||'Keine Verbindung.'}${crInfo}</p>${code?`<span class="err-code">Fehlercode: ${code} – ${desc||'?'}</span>`:''}<div class="webview-error-actions"><button class="webview-error-btn primary" onclick="document.getElementById('btn-retry').click()">🔄 Erneut</button><button class="webview-error-btn secondary" onclick="window.electronAPI.openExternal('${url}')">↗ Browser</button></div></div>`;
}

// ════════════════════════════════
// WATCH TIME TRACKER
// ════════════════════════════════
function startWatchTimer(providerId) {
  stopWatchTimer();
  watchStartTime = Date.now();
  watchTimeTimer = setInterval(()=>{
    if(watchStartTime) window.electronAPI.recordWatchTime(providerId, 60);
  }, 60000);
}

function stopWatchTimer() {
  clearInterval(watchTimeTimer); watchTimeTimer=null; watchStartTime=null;
}

function addViewHistory(entry) {
  viewHistory=viewHistory.filter(h=>h.id!==entry.id).slice(0,49);
  viewHistory.unshift(entry); settings.viewHistory=viewHistory; autoSave();
}

// ════════════════════════════════
// PIP
// ════════════════════════════════
function setupPip() {
  const pip=document.getElementById('pip-window');if(!pip)return;
  let drag=false,ox=0,oy=0;
  document.getElementById('pip-topbar')?.addEventListener('mousedown',e=>{drag=true;const r=pip.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();});
  document.addEventListener('mousemove',e=>{if(!drag)return;pip.style.left=Math.max(0,Math.min(window.innerWidth-pip.offsetWidth,e.clientX-ox))+'px';pip.style.top=Math.max(0,Math.min(window.innerHeight-pip.offsetHeight,e.clientY-oy))+'px';pip.style.right='auto';pip.style.bottom='auto';});
  document.addEventListener('mouseup',()=>drag=false);
  document.getElementById('pip-expand')?.addEventListener('click',restoreFromPip);
  document.getElementById('pip-close')?.addEventListener('click',()=>{pip.style.display='none';document.getElementById('pip-content').innerHTML='';pipProviderId=null;stopWatchTimer();});
}

function moveToPip(providerId,wvNode) {
  const pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),title=document.getElementById('pip-title');
  if(!pip||!content)return;
  content.innerHTML='';
  if(wvNode?.parentNode)wvNode.parentNode.removeChild(wvNode);
  if(wvNode){wvNode.style.cssText='width:100%;height:100%;border:none;display:flex';content.appendChild(wvNode);}
  pipProviderId=providerId; if(title)title.textContent=PROVIDERS[providerId]?.name||providerId;
  pip.style.left='auto';pip.style.top='auto';pip.style.right='24px';pip.style.bottom='24px';pip.style.display='flex';
}

function restoreFromPip() {
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
function updateFullscreenUI() {
  const topbar=document.getElementById('stream-topbar'),sidebar=document.getElementById('sidebar'),tb=document.getElementById('titlebar'),tabs=document.getElementById('stream-tabs-bar');
  const wrap=document.getElementById('webview-wrap'),btn=document.getElementById('btn-fullscreen');
  if(isFullscreen){[topbar,sidebar,tb,tabs].forEach(el=>el?.classList.add('hidden'));if(wrap)wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';if(btn)btn.innerHTML=svgMin()+' Beenden';}
  else{[topbar,sidebar,tb,tabs].forEach(el=>el?.classList.remove('hidden'));if(wrap)wrap.style.cssText='';if(btn)btn.innerHTML=svgMax()+' Vollbild';document.getElementById('fs-exit-btn')?.classList.remove('visible');}
}
function svgMax(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;}
function svgMin(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`;}

function setupFullscreenExit() {
  const btn=document.getElementById('fs-exit-btn');if(!btn)return;
  document.addEventListener('mousemove',e=>{
    if(!isFullscreen)return;
    const zone=113,cx=window.innerWidth/2;const inZ=Math.abs(e.clientX-cx)<zone/2&&e.clientY<zone;
    if(inZ){if(!fsHoverTimer)fsHoverTimer=setTimeout(()=>{btn.classList.add('visible');clearTimeout(fsAutoHide);fsAutoHide=setTimeout(()=>btn.classList.remove('visible'),3000);},1000);}
    else{clearTimeout(fsHoverTimer);fsHoverTimer=null;}
  });
  btn.addEventListener('click',()=>{window.electronAPI.setFullscreen(false);btn.classList.remove('visible');});
}
function setupESCKey(){document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isFullscreen)window.electronAPI.setFullscreen(false);});}

// ════════════════════════════════
// CLOCK
// ════════════════════════════════
function setupClock() {
  clearInterval(clockInterval);
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');
  if(!widget||!timeEl)return;
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};
  widget.style.display='block';
  widget.style.left=(pos.x??16)+'px'; widget.style.top=(pos.y??52)+'px';
  widget.style.right='auto'; widget.style.bottom='auto';
  widget.style.color=clk.color||'#cfcfcf';
  widget.style.opacity=String(clk.opacity??0.85);
  widget.style.fontSize=(clk.size||22)+'px';
  // Kein Hintergrund
  widget.style.background='none'; widget.style.backdropFilter='none';
  widget.style.border='none'; widget.style.padding='0';
  const tick=()=>{ const n=new Date(); timeEl.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}`; };
  tick(); clockInterval=setInterval(tick,1000);
}
function pad(n){return String(n).padStart(2,'0');}

function previewClock() {
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const enabled=document.getElementById('clock-enabled')?.checked;
  const color=(document.getElementById('clock-color-text')?.value||'#cfcfcf');
  const opacity=(parseInt(document.getElementById('clock-opacity')?.value)||85)/100;
  const size=parseInt(document.getElementById('clock-size')?.value)||22;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=enabled?'Aktiviert':'Deaktiviert';
  if(!enabled){widget.style.display='none';return;}
  widget.style.display='block';
  widget.style.color=color; widget.style.opacity=String(opacity); widget.style.fontSize=size+'px';
  widget.style.background='none'; widget.style.backdropFilter='none'; widget.style.border='none'; widget.style.padding='0';
}

// Clock Drag – wenn in Uhr-Einstellungen, direkt verschiebbar beim Hover
function enableClockDragMode(enable) {
  clockDragEnabled = enable;
  const widget=document.getElementById('clock-widget');
  const hint=document.getElementById('clock-drag-hint');
  if(!widget) return;
  if(enable) { widget.classList.add('drag-mode'); if(hint)hint.classList.add('visible'); setupClockMouseDrag(); }
  else { widget.classList.remove('drag-mode'); if(hint)hint.classList.remove('visible'); }
}

let clockDragHandlers = null;
function setupClockMouseDrag() {
  const widget=document.getElementById('clock-widget');if(!widget) return;
  if(clockDragHandlers) {
    widget.removeEventListener('mousedown', clockDragHandlers.down);
    document.removeEventListener('mousemove', clockDragHandlers.move);
    document.removeEventListener('mouseup', clockDragHandlers.up);
  }
  let drag=false,ox=0,oy=0;
  function down(e){ if(!clockDragEnabled)return; drag=true; const r=widget.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top; e.preventDefault(); }
  function move(e){ if(!drag||!clockDragEnabled)return; const nx=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox)); const ny=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy)); widget.style.left=nx+'px'; widget.style.top=ny+'px'; widget.style.right='auto'; widget.style.bottom='auto'; }
  function up(){ if(!drag)return; drag=false; const r=widget.getBoundingClientRect(); settings.clock._pendingPos={x:Math.round(r.left),y:Math.round(r.top)}; autoSave(); }
  widget.addEventListener('mousedown',down);
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',up);
  clockDragHandlers={down,move,up};
}

function setupClockContextMenu() {
  const widget=document.getElementById('clock-widget'),ctx=document.getElementById('clock-ctx-menu');
  if(!widget||!ctx)return;
  widget.addEventListener('contextmenu',e=>{e.preventDefault();ctx.style.left=e.clientX+'px';ctx.style.top=e.clientY+'px';ctx.style.display='block';});
  document.addEventListener('click',e=>{if(!ctx.contains(e.target))ctx.style.display='none';});
  document.getElementById('clock-ctx-disable')?.addEventListener('click',()=>{
    settings.clock.enabled=false; autoSave(); setupClock();
    const ce=document.getElementById('clock-enabled');if(ce)ce.checked=false;
    const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Deaktiviert';
    ctx.style.display='none';
  });
}

// ════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════
function setupSettingsPanel() {
  document.getElementById('btn-settings')?.addEventListener('click',openSettings);
  document.getElementById('settings-close')?.addEventListener('click',closeSettings);
  document.getElementById('settings-overlay')?.addEventListener('click',closeSettings);

  document.querySelectorAll('.stab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.stab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active'); document.getElementById(`stab-${tab.dataset.tab}`)?.classList.add('active');
      if(tab.dataset.tab==='account') buildSettingsAccountTab();
      if(tab.dataset.tab==='advanced') buildAdvancedTab();
    });
  });

  linkColor('set-accent-color','set-accent-text');
  linkColor('clock-color','clock-color-text');

  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.dataset.reset;
      if(k==='accentColor'){settings.accentColor='#30c5bb';applyAccent('#30c5bb');}
      else if(k==='appBgImage'){settings.appBgImage='';updatePreview('prev-app-bg',null);const mc=document.getElementById('main-content');if(mc){mc.style.backgroundImage='';mc.classList.remove('has-bg');}}
      else if(k==='clockColor'){settings.clock.color='#cfcfcf';const c=document.getElementById('clock-color'),t=document.getElementById('clock-color-text');if(c)c.value='#cfcfcf';if(t)t.value='#cfcfcf';previewClock();}
      autoSave();
    });
  });

  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn=>btn.addEventListener('click',()=>handlePickImage(btn.dataset.pick)));

  // Font size
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');
  fsr?.addEventListener('input',()=>{ const v=parseInt(fsr.value); if(fsv)fsv.textContent=v+'px'; settings.fontSize=v; applyFontSize(v); autoSave(); });

  // Particles
  document.getElementById('particles-toggle')?.addEventListener('change',e=>{ settings.particlesEnabled=e.target.checked; setupParticles(); autoSave(); });

  // Language
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); const l=btn.dataset.lang;
      settings.language=l; applyLanguage(l); autoSave();
    });
  });

  // Accent color
  document.getElementById('set-accent-text')?.addEventListener('input',e=>{ if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){settings.accentColor=e.target.value;applyAccent(e.target.value);autoSave();} });

  // Clock live
  ['clock-enabled','clock-color','clock-opacity','clock-size'].forEach(id=>{ document.getElementById(id)?.addEventListener('input',previewClock); document.getElementById(id)?.addEventListener('change',()=>{ previewClock(); saveClock(); }); });
  document.getElementById('clock-color-text')?.addEventListener('input',previewClock);
  document.getElementById('clock-opacity')?.addEventListener('input',e=>{ document.getElementById('clock-opacity-val').textContent=e.target.value+'%'; });
  document.getElementById('clock-size')?.addEventListener('input',e=>{ document.getElementById('clock-size-val').textContent=e.target.value+'px'; });

  // Account
  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{ if(!confirm('Von ALLEN Diensten abmelden?'))return; window.electronAPI.clearAllSessions(); buildSettingsAccountTab(); });
  document.getElementById('btn-google-auth')?.addEventListener('click',async()=>{
    document.getElementById('btn-google-auth').textContent='⏳ Warte auf Login…';
    const ok = await window.electronAPI.openGoogleAuth();
    document.getElementById('btn-google-auth').textContent = ok ? '✓ Angemeldet!' : '🔐 Bei Google anmelden (YouTube)';
    if (ok) buildSettingsAccountTab();
  });

  // Card settings panel
  document.getElementById('btn-open-card-settings')?.addEventListener('click',()=>{ buildSettingsCardTab(); document.getElementById('card-settings-panel').style.right='0'; });
  document.getElementById('card-settings-back')?.addEventListener('click',()=>{ document.getElementById('card-settings-panel').style.right='-340px'; });

  syncSettingsUI();
}

function saveClock() {
  const pPos=settings.clock._pendingPos;
  settings.clock={
    enabled:!!document.getElementById('clock-enabled')?.checked,
    position:pPos||settings.clock.position||{x:16,y:52},
    color:document.getElementById('clock-color-text')?.value||'#cfcfcf',
    opacity:(parseInt(document.getElementById('clock-opacity')?.value)||85)/100,
    size:parseInt(document.getElementById('clock-size')?.value)||22,
  };
  delete settings.clock._pendingPos;
  setupClock(); autoSave();
}

function openSettings() {
  document.getElementById('settings-panel')?.classList.add('open');
  document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab(); syncSettingsUI();
  // Uhr-Drag aktivieren
  setTimeout(()=>enableClockDragMode(true), 200);
}
function closeSettings() {
  enableClockDragMode(false);
  saveClock();
  document.getElementById('settings-panel')?.classList.remove('open');
  document.getElementById('settings-overlay')?.classList.remove('open');
  document.getElementById('card-settings-panel').style.right='-340px';
}

async function handlePickImage(dest) {
  const url=await window.electronAPI.pickImage(dest);if(!url)return;
  if(dest==='appBgImage'){ settings.appBgImage=url; updatePreview('prev-app-bg',url); const mc=document.getElementById('main-content');if(mc){mc.style.backgroundImage=`url("${url}")`;mc.style.backgroundSize='cover';mc.style.backgroundPosition='center';mc.classList.add('has-bg');}document.documentElement.style.setProperty('--bgs','rgba(10,10,20,0.75)'); }
  else if(dest.startsWith('card_')){ const id=dest.replace('card_',''); settings.cardImages[id]=url; buildProviderGrid(); buildSettingsCardTab(); openImageEditor(id,url); autoSave(); return; }
  autoSave();
}

function updatePreview(id,url){const el=document.getElementById(id);if(!el)return;if(url)el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;else el.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;}
function linkColor(cId,tId){const c=document.getElementById(cId),t=document.getElementById(tId);if(!c||!t)return;c.addEventListener('input',()=>t.value=c.value);t.addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test(t.value))c.value=t.value;});}

function syncSettingsUI() {
  const acc=settings.accentColor||'#30c5bb';const ca=document.getElementById('set-accent-color'),ta=document.getElementById('set-accent-text');if(ca)ca.value=acc;if(ta)ta.value=acc;
  if(settings.appBgImage) updatePreview('prev-app-bg',settings.appBgImage);
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');const fs=settings.fontSize||14;if(fsr)fsr.value=fs;if(fsv)fsv.textContent=fs+'px';
  const pt=document.getElementById('particles-toggle');if(pt)pt.checked=!!settings.particlesEnabled;
  // Language
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===(settings.language||'de')));
  // Clock
  const clk=settings.clock||{};
  const ce=document.getElementById('clock-enabled');if(ce)ce.checked=!!clk.enabled;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const hint=document.getElementById('clock-drag-hint');if(hint)hint.classList.toggle('visible',!!clk.enabled);
  const col=clk.color||'#cfcfcf';const cc=document.getElementById('clock-color'),ct=document.getElementById('clock-color-text');if(cc)cc.value=col;if(ct)ct.value=col;
  const op=Math.round((clk.opacity??0.85)*100);const co=document.getElementById('clock-opacity'),cv=document.getElementById('clock-opacity-val');if(co)co.value=op;if(cv)cv.textContent=op+'%';
  const sz=clk.size||22;const cs=document.getElementById('clock-size'),csv=document.getElementById('clock-size-val');if(cs)cs.value=sz;if(csv)csv.textContent=sz+'px';
}

// ════════════════════════════════
// ACCOUNT TAB
// ════════════════════════════════
async function buildSettingsAccountTab() {
  const list=document.getElementById('session-list');if(!list)return;
  list.innerHTML='<div class="loading-sessions">Wird geprüft…</div>';
  const res=await window.electronAPI.getAllSessions();
  sessionCache=res; renderSessionList(res);
}

function renderSessionList(res) {
  const list=document.getElementById('session-list');if(!list)return;list.innerHTML='';
  const sorted=Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const on=sorted.filter(([id])=>!!res[id]),off=sorted.filter(([id])=>!res[id]);
  if(on.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Angemeldet';list.appendChild(lbl);on.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,true)));}
  if(off.length){const lbl=document.createElement('div');lbl.className='session-group-label';lbl.textContent='Nicht angemeldet';list.appendChild(lbl);off.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,false)));}
}

function makeSessionItem(id,p,on) {
  const item=document.createElement('div');item.className='session-item';
  item.innerHTML=`<span class="session-dot ${on?'active':''}"></span><span class="session-name">${p.name}</span><span class="session-status">${on?'✓':''}</span>${on?`<button class="session-logout-btn" data-id="${id}">Abmelden</button>`:''}`;
  item.querySelector('.session-logout-btn')?.addEventListener('click',()=>{window.electronAPI.clearProviderSession(id);if(currentProvider===id)stopStream();buildSettingsAccountTab();});
  return item;
}

// ════════════════════════════════
// CARD IMAGE LIST
// ════════════════════════════════
function buildSettingsCardTab() {
  const list=document.getElementById('card-image-list');if(!list)return;list.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>{
    const imgUrl=(settings.cardImages||{})[id]||'';
    const item=document.createElement('div');item.className='card-img-item';
    item.innerHTML=`<span class="card-img-dot" style="background:${p.color}"></span><span class="card-img-name">${p.name}</span><div class="img-preview" id="prev-card-${id}">${imgUrl?`<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`:''}</div><button class="pick-btn" style="max-width:58px;font-size:11px" data-card="${id}">Bild</button>${imgUrl?`<button class="pick-btn" style="max-width:46px;font-size:11px;color:var(--acc);border-color:var(--acc)" data-edit="${id}">✎</button><button class="reset-btn" data-card-reset="${id}">↺</button>`:''}`;
    item.querySelector(`[data-card="${id}"]`)?.addEventListener('click',()=>handlePickImage(`card_${id}`));
    item.querySelector(`[data-edit="${id}"]`)?.addEventListener('click',()=>openImageEditor(id,imgUrl));
    item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click',()=>{delete settings.cardImages[id];delete(settings.cardImageOffsets||{})[id];autoSave();buildProviderGrid();buildSettingsCardTab();});
    list.appendChild(item);
  });
}

// ════════════════════════════════
// ADVANCED TAB
// ════════════════════════════════
function buildAdvancedTab() {
  const cssInput=document.getElementById('custom-css-input');if(cssInput)cssInput.value=customCSS||'';
  cssInput?.addEventListener('input',e=>{ customCSS=e.target.value; applyCustomCSS(customCSS); settings.customCSS=customCSS; autoSave(); });
  const histList=document.getElementById('view-history-list');
  if(histList) histList.innerHTML=viewHistory.slice(0,15).map(h=>`<div style="font-size:12px;padding:3px 0;color:var(--tx2);display:flex;align-items:center;gap:7px"><img src="${getFavicon(h.id)}" width="13" height="13" style="border-radius:2px;object-fit:contain"/>${esc(h.name)}</div>`).join('')||'<div style="font-size:12px;color:var(--tx3)">Kein Verlauf</div>';
  document.getElementById('btn-clear-history')?.addEventListener('click',()=>{viewHistory=[];settings.viewHistory=[];autoSave();buildAdvancedTab();});
}

// ════════════════════════════════
// PLUGINS TAB
// ════════════════════════════════
function setupPluginsTab() {
  buildPluginPresets('');
  document.getElementById('plugin-search')?.addEventListener('input',e=>buildPluginPresets(e.target.value));
  updatePluginDomainCount();
}

function buildPluginPresets(filter) {
  const container=document.getElementById('plugin-presets-list');if(!container)return;
  const filtered=PLUGIN_PRESETS.filter(p=>!filter||p.name.toLowerCase().includes(filter.toLowerCase())||p.desc.toLowerCase().includes(filter.toLowerCase()));
  container.innerHTML='';
  filtered.forEach(preset=>{
    const div=document.createElement('div');div.className='plugin-preset';
    const isInst=installedPlugins.has(preset.id);
    const btnText=preset.note?'Info':isInst?'✓ Aktiv':'Installieren';
    div.innerHTML=`<div style="flex:1"><div class="plugin-preset-name">${preset.name}</div><div class="plugin-preset-desc">${preset.desc}</div></div><button class="plugin-install-btn ${isInst?'installed':''}">${btnText}</button>`;
    const btn=div.querySelector('button');
    if(preset.note){btn.addEventListener('click',()=>showToast(preset.note,5000));}
    else if(!isInst){
      btn.addEventListener('click',async()=>{
        btn.textContent='Lädt…';btn.disabled=true;
        const result=await window.electronAPI.fetchAdblockList(preset.url);
        if(result.ok){extraAdDomains=[...new Set([...extraAdDomains,...result.domains])];window.electronAPI.applyExtraAdDomains(extraAdDomains);installedPlugins.add(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));btn.textContent=`✓ ${result.count} Domains`;btn.classList.add('installed');updatePluginDomainCount();buildPluginList();}
        else{btn.textContent='Fehler';btn.disabled=false;}
      });
    }
    container.appendChild(div);
  });
}

function updatePluginDomainCount(){const el=document.getElementById('plugin-domain-count');if(el)el.textContent=extraAdDomains.length;}

function buildPluginList() {
  const list=document.getElementById('plugin-list');if(!list)return;
  if(!extraAdDomains.length){list.innerHTML='<div style="font-size:12px;color:var(--tx3);padding:6px 0">Keine installiert.</div>';return;}
  [...installedPlugins].forEach(pid=>{
    const preset=PLUGIN_PRESETS.find(p=>p.id===pid);if(!preset) return;
    const item=document.createElement('div');item.className='plugin-item';
    item.innerHTML=`<span class="plugin-item-name">${preset.name}</span><span class="plugin-item-count" title="Domains">Aktiv</span><button class="plugin-remove-btn">Entfernen</button>`;
    item.querySelector('.plugin-remove-btn').addEventListener('click',()=>{installedPlugins.delete(pid);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));extraAdDomains=[];window.electronAPI.applyExtraAdDomains([]);updatePluginDomainCount();buildPluginList();buildPluginPresets(document.getElementById('plugin-search')?.value||'');});
    list.appendChild(item);
  });
}

// ════════════════════════════════
// IMAGE EDITOR
// ════════════════════════════════
function setupImageEditor() {
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val'),imgEl=document.getElementById('img-editor-img');
  px?.addEventListener('input',()=>{imgEditorState.x=parseInt(px.value);if(pvx)pvx.textContent=px.value;if(imgEl)imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;});
  py?.addEventListener('input',()=>{imgEditorState.y=parseInt(py.value);if(pvy)pvy.textContent=py.value;if(imgEl)imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;});
  document.getElementById('img-editor-close')?.addEventListener('click',()=>document.getElementById('img-editor-overlay').style.display='none');
  document.getElementById('img-editor-save')?.addEventListener('click',()=>{const{providerId,url,x,y}=imgEditorState;settings.cardImages[providerId]=url;settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[providerId]={x,y};autoSave();buildProviderGrid();buildSettingsCardTab();document.getElementById('img-editor-overlay').style.display='none';});
  document.getElementById('img-editor-remove')?.addEventListener('click',()=>{const{providerId}=imgEditorState;delete settings.cardImages[providerId];delete(settings.cardImageOffsets||{})[providerId];autoSave();buildProviderGrid();buildSettingsCardTab();document.getElementById('img-editor-overlay').style.display='none';});
}

function openImageEditor(providerId,imgUrl) {
  const overlay=document.getElementById('img-editor-overlay'),imgEl=document.getElementById('img-editor-img'),title=document.getElementById('img-editor-title');
  if(!overlay||!imgEl)return;
  const off=(settings.cardImageOffsets||{})[providerId]||{x:0,y:0};
  imgEditorState={providerId,url:imgUrl,x:off.x,y:off.y};
  if(title)title.textContent=`Banner: ${PROVIDERS[providerId]?.name||providerId}`;
  imgEl.style.cssText=`background-image:url("${imgUrl}");background-size:cover;background-repeat:no-repeat;background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);position:absolute;inset:0`;
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val');
  if(px)px.value=off.x;if(py)py.value=off.y;if(pvx)pvx.textContent=off.x;if(pvy)pvy.textContent=off.y;
  overlay.style.display='flex';
}

// ════════════════════════════════
// STATS VIEW
// ════════════════════════════════
function setupStatsView() {
  document.getElementById('btn-trakt-auth')?.addEventListener('click',async()=>{
    const r=await window.electronAPI.traktAuth();
    document.getElementById('trakt-info').innerHTML=`<p>${r.info||'Trakt.tv öffnet sich im Browser.'}</p>`;
  });
  document.getElementById('btn-check-vpn')?.addEventListener('click',async()=>{
    const r=await window.electronAPI.checkVpn();
    const info=document.getElementById('vpn-info');
    if(r.error){info.innerHTML=`<p style="color:var(--danger)">${r.error}</p>`;return;}
    const badge=document.getElementById('vpn-badge');
    if(badge){badge.textContent=r.isVpn?`🛡 VPN aktiv (${r.org})`:r.ip?`🌍 ${r.country} (${r.ip})`:'';badge.className=`vpn-badge ${r.isVpn?'vpn-on':'vpn-off'}`;badge.style.display='block';}
    info.innerHTML=`<p style="font-size:13px;color:var(--tx2)">IP: ${r.ip} · ${r.city}, ${r.country}<br>Provider: ${r.org}<br>${r.isVpn?'<span style="color:var(--acc)">✓ VPN erkannt</span>':'<span style="color:var(--tx3)">Kein VPN erkannt</span>'}</p>`;
  });
  // Multi-Window Buttons
  const mbWrap=document.getElementById('multiwindow-btns');
  if(mbWrap){
    Object.entries(PROVIDERS).slice(0,8).forEach(([id,p])=>{
      const btn=document.createElement('button');
      btn.className='detail-action-btn secondary';
      btn.style.cssText='font-size:12px;padding:6px 12px;display:flex;align-items:center;gap:6px';
      btn.innerHTML=`<img src="${getFavicon(id)}" width="14" height="14" style="border-radius:2px;object-fit:contain"/>${p.name}`;
      btn.addEventListener('click',()=>window.electronAPI.openSecondWindow({providerId:id,url:p.url,partition:p.partition}));
      mbWrap.appendChild(btn);
    });
  }
}

async function buildStatsView() {
  const stats=await window.electronAPI.getStreamStats();
  const content=document.getElementById('stats-content');
  if(!content)return;
  const entries=Object.entries(stats).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){content.innerHTML='<div style="color:var(--tx2);font-size:13px;padding:10px 0">Noch keine Stream-Daten gesammelt.</div>';return;}
  const maxSecs=Math.max(...entries.map(e=>e[1]),1);
  content.innerHTML='';
  entries.forEach(([id,secs])=>{
    const p=PROVIDERS[id]; if(!p) return;
    const hours=(secs/3600).toFixed(1);
    const pct=Math.round((secs/maxSecs)*100);
    const wrap=document.createElement('div');wrap.className='stats-bar-wrap';
    wrap.innerHTML=`<div class="stats-bar-label"><span>${p.name}</span><span>${hours}h</span></div><div class="stats-bar"><div class="stats-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>`;
    content.appendChild(wrap);
  });
}

// ════════════════════════════════
// WATCHLIST BUILD
// ════════════════════════════════
function buildWatchlist() {
  const content=document.getElementById('watchlist-content');if(!content)return;
  const cat=document.getElementById('wl-category-filter')?.value||'all';
  const sort=document.getElementById('wl-sort')?.value||'alpha';
  let items=watchlist.filter(i=>cat==='all'||i.mediaType===cat);
  if(sort==='alpha') items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
  else items=[...items].sort((a,b)=>{if(!a.releaseDate)return 1;if(!b.releaseDate)return-1;return a.releaseDate.localeCompare(b.releaseDate);});
  content.innerHTML='';
  if(!items.length){content.innerHTML='<div class="wl-empty">Noch nichts gemerkt.<br>Klicke beim Browsen auf das 🔖 Symbol.</div>';return;}
  const grid=document.createElement('div');grid.className='watchlist-grid';
  items.forEach(item=>{
    const card=document.createElement('div');card.className='wl-card';
    const poster=item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy" onerror="this.style.display='none'"/>`:` <div class="wl-card-poster-ph">🎬</div>`;
    const dateStr=item.releaseDate?new Date(item.releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${esc(item.title)}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}</div><button class="wl-card-remove">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();watchlist=watchlist.filter(w=>w.id!==item.id);settings.watchlist=watchlist;autoSave();buildWatchlist();});
    card.addEventListener('click',()=>showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title));
    grid.appendChild(card);
  });
  content.appendChild(grid);
  document.getElementById('wl-category-filter')?.addEventListener('change',buildWatchlist);
  document.getElementById('wl-sort')?.addEventListener('change',buildWatchlist);
}

// ════════════════════════════════
// PARTICLES SETUP (re-check settings)
// ════════════════════════════════
// Already called in init

// ════════════════════════════════
// TOAST
// ════════════════════════════════
let toastTimeout=null;
function showToast(msg,duration=3000){
  const t=document.getElementById('error-toast');if(!t)return;
  t.textContent=msg;t.style.background='rgba(48,197,187,.9)';t.classList.add('show');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),duration);
}

function showLoading(text='Wird geladen…'){document.getElementById('loading-text').textContent=text;document.getElementById('loading-overlay').classList.add('active');}
function hideLoading(){document.getElementById('loading-overlay').classList.remove('active');}

// ════════════════════════════════
// START
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
