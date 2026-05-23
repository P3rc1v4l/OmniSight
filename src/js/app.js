'use strict';
// ════════ PROVIDERS ════════════════════════════════════════════════
const PROVIDERS_BASE = {
  apple:        {name:'Apple TV+',      tag:'Apple Originals',          url:'https://tv.apple.com',                    color:'#555555',quality:'4K'},
  adn:          {name:'ADN',            tag:'Anime Digital Network',    url:'https://www.animedigitalnetwork.de',       color:'#0077CC',quality:'HD'},
  ard:          {name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',     url:'https://www.ardmediathek.de',             color:'#003D6B',quality:'HD'},
  arte:         {name:'ARTE',           tag:'Kultur & Dokumentation',   url:'https://www.arte.tv/de',                  color:'#F00000',quality:'HD'},
  burning:      {name:'BurningSeries',  tag:'Serien & Anime',           url:'https://bs.to',                           color:'#C0392B',quality:'HD',multiTab:true},
  cineto:       {name:'Cine.to',        tag:'Filme & Serien',           url:'https://cine.to',                         color:'#8B5CF6',quality:'HD',multiTab:true},
  crunchyroll:  {name:'Crunchyroll',    tag:'Anime & Manga',            url:'https://www.crunchyroll.com',             color:'#F47521',quality:'4K'},
  dazn:         {name:'DAZN',           tag:'Sport Live-Streams',       url:'https://www.dazn.com',                    color:'#F8D200',quality:'4K'},
  disney:       {name:'Disney+',        tag:'Marvel, Star Wars & mehr', url:'https://www.disneyplus.com',              color:'#113CCF',quality:'4K'},
  funk:         {name:'Funk',           tag:'Content Creator Network',  url:'https://www.funk.net',                    color:'#111111',quality:'HD'},
  hbomax:       {name:'Max (HBO)',       tag:'HBO Originals & mehr',     url:'https://www.max.com',                     color:'#0031DB',quality:'4K'},
  joyn:         {name:'Joyn',           tag:'Kostenlos streamen',       url:'https://www.joyn.de',                     color:'#E4001B',quality:'HD'},
  kika:         {name:'KiKA',           tag:'Kinder & Familie',         url:'https://www.kika.de',                     color:'#00A859',quality:'HD'},
  magenta:      {name:'MagentaTV',      tag:'Telekom Streaming',        url:'https://www.magentatv.de',                color:'#E20074',quality:'4K'},
  movie2k:      {name:'Movie2k',        tag:'Filme & Serien',           url:'https://movie2k.ch/',                     color:'#FF6B35',quality:'HD'},
  mubi:         {name:'MUBI',           tag:'Arthouse & Kino',          url:'https://mubi.com',                        color:'#213F5E',quality:'HD'},
  netflix:      {name:'Netflix',        tag:'Filme & Serien',           url:'https://www.netflix.com',                 color:'#E50914',quality:'4K'},
  paramountplus:{name:'Paramount+',     tag:'Paramount Originals',      url:'https://www.paramountplus.com',           color:'#0064FF',quality:'4K'},
  prime:        {name:'Prime Video',    tag:'Amazon Originals',         url:'https://www.primevideo.com',              color:'#00A8E1',quality:'4K'},
  rtl:          {name:'RTL+',           tag:'RTL Serien & Shows',       url:'https://plus.rtl.de',                     color:'#FF6B00',quality:'HD'},
  skygo:        {name:'Sky Go',         tag:'Sky Serien & Sport',       url:'https://www.sky.de/entertainment/sky-go', color:'#00205B',quality:'HD'},
  spotify:      {name:'Spotify',        tag:'Musik & Podcasts',         url:'https://open.spotify.com',                color:'#1DB954',quality:'–',bgAudio:true},
  twitch:       {name:'Twitch',         tag:'Live-Streams & Gaming',    url:'https://www.twitch.tv',                   color:'#9146FF',quality:'1080p',multiTab:true},
  waipu:        {name:'Waipu.tv',       tag:'Live-TV & Mediathek',      url:'https://www.waipu.tv',                    color:'#00B4D8',quality:'HD'},
  wow:          {name:'WOW',            tag:'Sky ohne Abo',             url:'https://www.wowtv.de',                    color:'#00A3E0',quality:'HD'},
  youtube:      {name:'YouTube',        tag:'Videos & Streams',         url:'https://www.youtube.com',                 color:'#FF0000',quality:'4K',multiTab:true},
  zdf:          {name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',     url:'https://www.zdf.de',                      color:'#163A6A',quality:'HD'},
};
const TMDB_PMAP={8:'netflix',9:'prime',337:'disney',384:'hbomax',531:'paramountplus',283:'crunchyroll',350:'apple',207:'mubi',29:'waipu'};
let customProviders={};
function PROVIDERS(){return {...PROVIDERS_BASE,...customProviders};}
function getFavicon(id,p){
  const d={apple:'tv.apple.com',adn:'animedigitalnetwork.de',ard:'ardmediathek.de',arte:'arte.tv',burning:'bs.to',cineto:'cine.to',crunchyroll:'crunchyroll.com',dazn:'dazn.com',disney:'disneyplus.com',funk:'funk.net',hbomax:'max.com',joyn:'joyn.de',kika:'kika.de',magenta:'magentatv.de',movie2k:'movie2k.ch',mubi:'mubi.com',netflix:'netflix.com',paramountplus:'paramountplus.com',prime:'primevideo.com',rtl:'plus.rtl.de',skygo:'sky.de',spotify:'open.spotify.com',twitch:'twitch.tv',waipu:'waipu.tv',wow:'wowtv.de',youtube:'youtube.com',zdf:'zdf.de'};
  let domain=d[id];if(!domain&&p?.url){try{domain=new URL(p.url).hostname;}catch{}}
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain||'example.com'}`;
}

// ════════ I18N ═════════════════════════════════════════════════════
const I18N={
  de:{overview:'Übersicht',favorites:'Favoriten',watchlist:'Gemerkt',news:'Neuigkeiten',upcoming:'Upcoming',crCalendar:'CR Kalender',stats:'Statistiken',settings:'Einstellungen',search:'Film, Serie, Anbieter suchen…',moviesTab:'Filme',showsTab:'Serien',animeTab:'Anime',all:'Alle',defaultProfile:'Standardkonto',days:['So','Mo','Di','Mi','Do','Fr','Sa']},
  en:{overview:'Overview',favorites:'Favorites',watchlist:'Watchlist',news:"What's New",upcoming:'Upcoming',crCalendar:'CR Calendar',stats:'Statistics',settings:'Settings',search:'Search movies, shows, providers…',moviesTab:'Movies',showsTab:'Shows',animeTab:'Anime',all:'All',defaultProfile:'Default Account',days:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']},
};

// ════════ ACHIEVEMENTS ═════════════════════════════════════════════
const ACH_CATS={stream:{de:'⏱ Streamzeit',en:'⏱ Streaming Time'},provider:{de:'📺 Anbieter',en:'📺 Providers'},special:{de:'✨ Besonders',en:'✨ Special'},hidden:{de:'🔒 Versteckt',en:'🔒 Hidden'}};
const ACHIEVEMENTS=[
  {id:'first_stream',cat:'stream', icon:'🎬',name:{de:'Erster Stream',     en:'First Stream'},   desc:{de:'Ersten Stream gestartet',     en:'Started first stream'},  check:s=>Object.values(s).some(v=>(v.total||0)>0)},
  {id:'hour_1',      cat:'stream', icon:'⏰',name:{de:'1 Stunde',          en:'1 Hour'},          desc:{de:'1h gestreamt',               en:'Streamed 1h'},           check:s=>tot(s)>=3600},
  {id:'hour_5',      cat:'stream', icon:'🕔',name:{de:'5 Stunden',         en:'5 Hours'},         desc:{de:'5h gestreamt',               en:'Streamed 5h'},           check:s=>tot(s)>=18000},
  {id:'hour_10',     cat:'stream', icon:'🕐',name:{de:'10 Stunden',        en:'10 Hours'},        desc:{de:'10h gestreamt',              en:'Streamed 10h'},          check:s=>tot(s)>=36000},
  {id:'hour_50',     cat:'stream', icon:'🏅',name:{de:'50 Stunden',        en:'50 Hours'},        desc:{de:'50h gestreamt',              en:'Streamed 50h'},          check:s=>tot(s)>=180000},
  {id:'hour_100',    cat:'stream', icon:'💯',name:{de:'100 Stunden',       en:'100 Hours'},       desc:{de:'100h gestreamt',             en:'Streamed 100h'},         check:s=>tot(s)>=360000},
  {id:'hour_500',    cat:'stream', icon:'🏆',name:{de:'500 Stunden',       en:'500 Hours'},       desc:{de:'500h gestreamt',             en:'Streamed 500h'},         check:s=>tot(s)>=1800000},
  {id:'night_owl',   cat:'stream', icon:'🦉',name:{de:'Nachteule',         en:'Night Owl'},       desc:{de:'Am Wochenende gestreamt',    en:'Streamed on weekend'},   check:s=>Object.values(s).some(v=>(v.byDay?.[0]||0)+(v.byDay?.[6]||0)>0)},
  {id:'monday',      cat:'stream', icon:'📅',name:{de:'Wochenstart',       en:'Week Starter'},    desc:{de:'Montags gestreamt',          en:'Streamed on Monday'},    check:s=>Object.values(s).some(v=>(v.byDay?.[1]||0)>0)},
  {id:'netflix_1h',  cat:'provider',icon:'🍿',name:{de:'Netflix Fan',      en:'Netflix Fan'},     desc:{de:'1h Netflix',                 en:'1h on Netflix'},         check:s=>(s.netflix?.total||0)>=3600},
  {id:'yt_5h',       cat:'provider',icon:'▶️', name:{de:'YouTube Addict',   en:'YouTube Addict'}, desc:{de:'5h YouTube',                 en:'5h on YouTube'},         check:s=>(s.youtube?.total||0)>=18000},
  {id:'anime_fan',   cat:'provider',icon:'⛩️',name:{de:'Anime-Fan',        en:'Anime Fan'},       desc:{de:'1h Crunchyroll',             en:'1h on Crunchyroll'},     check:s=>(s.crunchyroll?.total||0)>=3600},
  {id:'anime_master',cat:'provider',icon:'🐉',name:{de:'Anime-Meister',    en:'Anime Master'},    desc:{de:'10h Crunchyroll',            en:'10h on Crunchyroll'},    check:s=>(s.crunchyroll?.total||0)>=36000},
  {id:'multi5',      cat:'provider',icon:'🌐',name:{de:'Viel-Streamer',    en:'Multi-Streamer'},  desc:{de:'5 Anbieter genutzt',         en:'Used 5 providers'},      check:s=>Object.values(s).filter(v=>(v.total||0)>0).length>=5},
  {id:'multi10',     cat:'provider',icon:'🎯',name:{de:'Komplett-Streamer',en:'Full Streamer'},   desc:{de:'10 Anbieter genutzt',        en:'Used 10 providers'},     check:s=>Object.values(s).filter(v=>(v.total||0)>0).length>=10},
  {id:'sport_fan',   cat:'provider',icon:'⚽',name:{de:'Sport-Fan',        en:'Sports Fan'},      desc:{de:'1h DAZN',                    en:'1h on DAZN'},            check:s=>(s.dazn?.total||0)>=3600},
  {id:'music_fan',   cat:'provider',icon:'🎵',name:{de:'Musik-Fan',        en:'Music Fan'},       desc:{de:'1h Spotify',                 en:'1h on Spotify'},         check:s=>(s.spotify?.total||0)>=3600},
  {id:'twitch_fan',  cat:'provider',icon:'🎮',name:{de:'Twitch-Fan',       en:'Twitch Fan'},      desc:{de:'2h Twitch',                  en:'2h on Twitch'},          check:s=>(s.twitch?.total||0)>=7200},
  {id:'binge_day',   cat:'special', icon:'🛋️',name:{de:'Binge-Tag',        en:'Binge Day'},       desc:{de:'4h an einem Tag',            en:'4h in one day'},         check:s=>Object.values(s).some(v=>v.byDay&&Math.max(...v.byDay)>=14400)},
  {id:'early_bird',  cat:'special', icon:'🌅',name:{de:'Frühaufsteher',    en:'Early Bird'},      desc:{de:'3h montags gesamt',          en:'3h on Mondays total'},   check:s=>Object.values(s).reduce((a,v)=>a+(v.byDay?.[1]||0),0)>=10800},
  {id:'hid_100app',  cat:'hidden',  icon:'🏠',name:{de:'Stammgast',        en:'Regular'},         desc:{de:'App 100× gestartet',         en:'App started 100×'},      check:(_,m)=>(m?.appStarts||0)>=100,     hidden:true},
  {id:'hid_set50',   cat:'hidden',  icon:'⚙️',name:{de:'Einstellungs-Freak',en:'Settings Freak'}, desc:{de:'Einstellungen 50× geöffnet', en:'Settings opened 50×'},   check:(_,m)=>(m?.settingsOpens||0)>=50,  hidden:true},
  {id:'hid_1000h',   cat:'hidden',  icon:'👑',name:{de:'Lebenswerk',       en:"Life's Work"},     desc:{de:'1000h gestreamt',            en:'1000h streamed'},        check:s=>tot(s)>=3600000,                hidden:true},
  {id:'hid_midnight',cat:'hidden',  icon:'🌙',name:{de:'Mitternachts-Freak',en:'Midnight Freak'}, desc:{de:'Nach Mitternacht gestreamt', en:'Streamed past midnight'}, check:(_,m)=>(m?.midnightStreams||0)>=1, hidden:true},
  {id:'hid_all20',   cat:'hidden',  icon:'🔬',name:{de:'Alles-Tester',     en:'All-Tester'},      desc:{de:'20 Anbieter genutzt',        en:'Used 20 providers'},     check:s=>Object.values(s).filter(v=>(v.total||0)>0).length>=20, hidden:true},
];
function tot(s){return Object.values(s).reduce((a,v)=>a+(v.total||0),0);}
function achName(a){return a.name[lang]||a.name.de;}
function achDesc(a){return a.desc[lang]||a.desc.de;}

// ════════ PLUGIN PRESETS ═══════════════════════════════════════════
const PLUGIN_PRESETS=[
  {id:'adblock',    name:'AdBlock',              desc:'ADBLOCK, Inc.',                              url:'https://easylist.to/easylist/easylist.txt'},
  {id:'easyprivacy',name:'EasyPrivacy',           desc:'Tracking & Analytics blockieren',            url:'https://easylist.to/easylist/easyprivacy.txt'},
  {id:'fanboy',     name:'Fanboy Annoyance',      desc:'Cookie-Banner & Popups blockieren',          url:'https://easylist.to/easylist/fanboy-annoyance.txt'},
  {id:'adguard',    name:'AdGuard Base',          desc:'AdGuard Basisliste',                         url:'https://filters.adtidy.org/extension/chromium/filters/2.txt'},
  {id:'betterttv',  name:'BetterTTV',             desc:'Twitch-Emotes & Verbesserungen',             url:'', note:'Wird automatisch in Twitch injiziert wenn der Anbieter geöffnet wird.'},
  {id:'buster',     name:'Buster: Captcha Solver',desc:'CAPTCHA-Löser für bs.to, cine.to, movie2k',  url:'', note:'Wird automatisch auf unterstützten Seiten aktiviert.'},
];

// ════════ GLOBALS ══════════════════════════════════════════════════
const TMDB_IMG='https://image.tmdb.org/t/p/w300', TMDB_BD='https://image.tmdb.org/t/p/w1280';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pad=n=>String(n).padStart(2,'0');

let settings={},profiles=[],activeProfileId='default',lang='de';
let currentProvider=null,currentWebview=null,currentProvUrl=null;
let pipProviderId=null,isFullscreen=false;
let clockDraggable=false,_clockInt=null;
let extraAdDomains=[],installedPlugins=new Set(),pluginDomainStore={};
let watchlist=[],searchHistory=[],viewHistory=[],providerOrder=[];
let hiddenItems={news:{},upcoming:{}},watchedItems={news:{},upcoming:{}};
let searchTimer=null,lastQuery='',searchPage=1;
let sessionCache={},streamTabs=[],activeTabId=null;
let watchTimeTimer=null,sessionRefreshTimer=null,autoSaveTimer=null;
let particlesAnim=null,_achWatchInterval=null;
let _editId=null;

const slideshows={news:{items:[],idx:0,timer:null,mediaType:'movies',tab:'trending'},upcoming:{items:[],idx:0,timer:null,mediaType:'movies',months:1}};
function getProfilePartition(id){const p=PROVIDERS()[id];const base=(p?.partition||id).replace('persist:','');return `persist:${activeProfileId}_${base}`;}

// ════════ INIT ═════════════════════════════════════════════════════
async function init(){
  settings=await window.electronAPI.getSettings();
  const D={favorites:[],cardImages:{},cardImageOffsets:{},cardBgColors:{},cardBgOpacity:{},cardCustomNames:{},cardCustomTags:{},cardLogos:{},clock:{enabled:false,position:{x:16,y:52},color:'#ff3b30',opacity:0.5,size:22,type:'digital',showSeconds:false},fontSize:14,accentColor:'#30c5bb',hiddenItems:{news:{},upcoming:{}},watchedItems:{news:{},upcoming:{}},watchlist:[],searchHistory:[],viewHistory:[],providerOrder:[],language:'de',particlesEnabled:false,particlesConfig:{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle'],appWide:true},newsLastTab:'movies',upcomingLastTab:'movies',cardLayout:'normal',sortAlpha:false,sortDir:'asc',designOptions:{cardRadius:14,sidebarWidth:200,cardShadow:true,glass:false,fontFamily:'DM Sans'},customProviders:{},deletedProviders:[]};
  Object.entries(D).forEach(([k,v])=>{if(settings[k]==null)settings[k]=v;});
  settings.clock={...D.clock,...(settings.clock||{})};
  settings.designOptions={...D.designOptions,...(settings.designOptions||{})};

  hiddenItems=settings.hiddenItems;watchedItems=settings.watchedItems;
  watchlist=settings.watchlist;searchHistory=settings.searchHistory;
  viewHistory=settings.viewHistory;providerOrder=settings.providerOrder;
  lang=settings.language;customProviders=settings.customProviders||{};
  slideshows.news.mediaType=settings.newsLastTab;
  slideshows.upcoming.mediaType=settings.upcomingLastTab;

  applyFontSize(settings.fontSize);applyAccent(settings.accentColor);
  applyFontFamily(settings.designOptions.fontFamily||'DM Sans');
  applyDesignOptions(settings.designOptions);applyLanguage(lang);applyBgImage(settings.appBgImage);

  const theme=await window.electronAPI.getTheme();setTheme(theme,false);
  extraAdDomains=await window.electronAPI.getExtraAdDomains();
  installedPlugins=new Set(JSON.parse(localStorage.getItem('installedPlugins')||'[]'));
  profiles=await window.electronAPI.getProfiles();
  activeProfileId=await window.electronAPI.getActiveProfile();

  buildSidebarProfile();buildProviderGrid();buildSidebarNav();
  setupClock();setupTitlebar();setupThemeToggle();setupNavigation();
  setupStreamControls();setupSettingsPanel();setupSearch();
  setupPluginsTab();setupClockContextMenu();setupSidebarCrunchyroll();
  setupParticles();setupPip();setupCardEditor();setupCustomProviderModal();
  setupLayoutButtons();checkOnlineStatus();startSessionAutoRefresh();startAchievementWatcher();

  window.electronAPI.onFullscreenChange(v=>{isFullscreen=v;updateFullscreenUI();});
  window.electronAPI.onSessionsUpdated(r=>{sessionCache=r;if(document.querySelector('.stab[data-tab="account"]')?.classList.contains('active'))renderSessionList(r);});
  window.electronAPI.onUpdateAvailable(info=>{showNotif('🚀 Update!',`v${info.version} verfügbar.`);const el=document.getElementById('update-check-result');if(el){el.textContent=`🚀 v${info.version} verfügbar`;el.style.color='var(--acc)';}});
  window.electronAPI.onUpdateNotAvailable(()=>{const el=document.getElementById('update-check-result');if(el){el.textContent='✓ Neueste Version';el.style.color='var(--acc)';}});
  window.electronAPI.onUpdateDownloaded(()=>showNotif('✓ Update bereit','App wird beim Neustart aktualisiert.'));
  window.electronAPI.onUpdateError(msg=>{const el=document.getElementById('update-check-result');if(el&&!msg.includes('404')){el.textContent='Fehler: '+msg;el.style.color='var(--danger)';}});

  isFullscreen=await window.electronAPI.isFullscreen();updateFullscreenUI();
  setInterval(checkOnlineStatus,30000);
  trackMeta('appStarts');
  // Neue Features initialisieren
  setupShortcutsModal();
  setupOnboarding();
  await loadPersistedNotifications();
  showOnboarding(false);
  setTimeout(buildRecentlyOpened, 200);
  patchSearchEarlyTrigger();
  // Watchlist-Sort Listener
  document.getElementById('wl-sort')?.addEventListener('change',()=>{
    const cat=document.querySelector('.wl-cat-btn.active')?.dataset.cat||'all';
    buildWatchlistSorted(cat);
  });
}

// ════════ LANGUAGE / THEME / FONT / DESIGN ═════════════════════════
function applyLanguage(l){
  lang=l;const t=I18N[l]||I18N.de;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(t[k])el.textContent=t[k];});
  const si=document.getElementById('search-input');if(si)si.placeholder=t.search;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  window._days=t.days;
}
function setTheme(t,save=true){
  document.documentElement.setAttribute('data-theme',t);
  const tog=document.getElementById('theme-toggle');if(tog)tog.checked=(t==='light');
  if(save){window.electronAPI.setTheme(t);window.electronAPI.setSettings(settings);showSaveToast();}
}
function setupThemeToggle(){document.getElementById('theme-toggle')?.addEventListener('change',e=>setTheme(e.target.checked?'light':'dark'));}
function applyFontSize(px){document.documentElement.style.setProperty('--fs',px+'px');}
function applyFontFamily(f){const map={'DM Sans':"'DM Sans',sans-serif",'Inter':"'Inter',sans-serif",'Rajdhani':"'Rajdhani',sans-serif",'Orbitron':"'Orbitron',sans-serif",'Exo 2':"'Exo 2',sans-serif",'system-ui':'system-ui,sans-serif'};const css=map[f]||"'DM Sans',sans-serif";document.documentElement.style.setProperty('--font-b',css);document.documentElement.style.setProperty('--font-d',css);}
function applyAccent(hex){document.documentElement.style.setProperty('--acc',hex||'#30c5bb');const rgb=hexToRgb(hex||'#30c5bb');if(rgb)document.documentElement.style.setProperty('--accg',`rgba(${rgb},.18)`);}
function applyDesignOptions(opts){if(!opts)return;document.documentElement.style.setProperty('--r',`${opts.cardRadius||14}px`);document.documentElement.style.setProperty('--r-sm',`${Math.max(4,(opts.cardRadius||14)-4)}px`);document.documentElement.style.setProperty('--sw',`${opts.sidebarWidth||200}px`);const mc=document.getElementById('main-content');if(mc)mc.style.left=`${opts.sidebarWidth||200}px`;const sb=document.getElementById('sidebar');if(sb)sb.style.width=`${opts.sidebarWidth||200}px`;document.body.classList.toggle('glass-mode',!!opts.glass);}
function applyBgImage(url){const mc=document.getElementById('main-content');if(!mc)return;mc.style.backgroundImage=url?`url("${url}")`:'';if(url){mc.style.backgroundSize='cover';mc.style.backgroundPosition='center';}}
function hexToRgb(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null;}

// ════════ AUTO-SAVE & TOAST ════════════════════════════════════════
function autoSave(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(()=>window.electronAPI.setSettings(settings),600);}
function showSaveToast(){const t=document.getElementById('save-toast');if(!t)return;t.style.display='block';clearTimeout(window._saveTimer);window._saveTimer=setTimeout(()=>t.style.display='none',2800);}
function showNotif(title,body){window.electronAPI.showNotification(title,body);}
function showToastMsg(msg){const t=document.getElementById('save-toast');if(!t)return;const orig=t.textContent;t.textContent=msg;t.style.display='block';clearTimeout(window._toastTimer);window._toastTimer=setTimeout(()=>{t.textContent=orig||'✓ Gespeichert';t.style.display='none';},2200);}

// ════════ PARTICLES ════════════════════════════════════════════════
function setupParticles(){const canvas=document.getElementById('particles-canvas');if(!canvas)return;if(particlesAnim){cancelAnimationFrame(particlesAnim);particlesAnim=null;}if(!settings.particlesEnabled){canvas.style.display='none';return;}const cfg=settings.particlesConfig||{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle']};canvas.style.display='block';const ctx=canvas.getContext('2d');let w=canvas.width=window.innerWidth,h=canvas.height=window.innerHeight;const shapes=cfg.shapes?.length?cfg.shapes:['circle'];const pts=Array.from({length:cfg.count||80},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*(cfg.size||1.5)+.4,vx:(Math.random()-.5)*(cfg.speed||1)*.7,vy:(Math.random()-.5)*(cfg.speed||1)*.7,op:Math.random()*.5+.1,rot:Math.random()*Math.PI*2,shape:shapes[Math.floor(Math.random()*shapes.length)]}));window.addEventListener('resize',()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;});function drawP(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const c=(cfg.color||'#30c5bb')+Math.round(p.op*255).toString(16).padStart(2,'0');ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=.8;switch(p.shape){case 'triangle':ctx.beginPath();ctx.moveTo(0,-p.r*1.3);ctx.lineTo(p.r,p.r*.8);ctx.lineTo(-p.r,p.r*.8);ctx.closePath();ctx.fill();break;case 'star':ctx.beginPath();for(let i=0;i<5;i++){ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*p.r,-Math.sin((18+i*72)*Math.PI/180)*p.r);ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*p.r*.4,-Math.sin((54+i*72)*Math.PI/180)*p.r*.4);}ctx.closePath();ctx.fill();break;case 'line':ctx.beginPath();ctx.moveTo(-p.r*2,0);ctx.lineTo(p.r*2,0);ctx.stroke();break;case 'ring':ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.lineWidth=p.r*.35;ctx.stroke();break;default:ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();}ctx.restore();}function tick(){ctx.clearRect(0,0,w,h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=.003;if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;drawP(p);});particlesAnim=requestAnimationFrame(tick);}tick();}
async function checkOnlineStatus(){const on=await window.electronAPI.checkOnline();const b=document.getElementById('offline-banner');if(b)b.style.display=on?'none':'flex';}

// ════════ PROFILES ═════════════════════════════════════════════════
function buildSidebarProfile(){const p=profiles.find(pr=>pr.id===activeProfileId)||{name:"User"};const nameEl=document.getElementById("sidebar-profile-name");if(nameEl)nameEl.textContent=p.name||"User";const avEl=document.getElementById("sidebar-profile-avatar");if(avEl)avEl.innerHTML=p.avatar?`<img src="${p.avatar}" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>`:"👤";}
function buildProfileSelect(){const sel=document.getElementById('profile-select');if(!sel)return;sel.innerHTML='';profiles.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;if(p.id===activeProfileId)o.selected=true;sel.appendChild(o);});sel.onchange=()=>switchProfile(sel.value);}
function switchProfile(id,showToast=true){
  if(currentWebview){document.getElementById('webview-wrap').innerHTML='';currentWebview=null;currentProvider=null;}
  const pip=document.getElementById('pip-window');if(pip){pip.style.display='none';document.getElementById('pip-content').innerHTML='';}pipProviderId=null;
  const cur=profiles.find(p=>p.id===activeProfileId);if(cur){cur.favorites=settings.favorites;cur.watchlist=watchlist;cur.searchHistory=searchHistory;}
  const next=profiles.find(p=>p.id===id);if(!next)return;
  activeProfileId=id;
  settings.favorites=next.favorites||[];watchlist=next.watchlist||[];searchHistory=next.searchHistory||[];
  window.electronAPI.setActiveProfile(id);window.electronAPI.setProfiles(profiles);
  if(showToast)showSaveToast();
  startSessionAutoRefresh();buildProviderGrid();showView('home');
}
function startSessionAutoRefresh(){window.electronAPI.refreshSessionsNow(activeProfileId);clearInterval(sessionRefreshTimer);sessionRefreshTimer=setInterval(()=>window.electronAPI.refreshSessionsNow(activeProfileId),60000);}

// ════════ NAVIGATION / VIEW ════════════════════════════════════════
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));document.getElementById('view-'+id)?.classList.add('active');document.querySelectorAll('[data-view="'+id+'"]').forEach(b=>b.classList.add('active'));}
function buildSidebarNav(){applyLanguage(lang);}

function setupNavigation(){
  document.querySelectorAll('[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v=btn.dataset.view;
      if(v==='home'){maybeMoveToPip();showView('home');}
      else if(v==='stream'){if(currentProvider)showView('stream');else if(pipProviderId)restoreFromPip();else showView('home');}
      else if(v==='news'){showView('news');loadSlideshow('news',slideshows.news.mediaType,slideshows.news.tab);}
      else if(v==='upcoming'){showView('upcoming');loadSlideshow('upcoming',slideshows.upcoming.mediaType);}
      else if(v==='watchlist'){showView('watchlist');buildWatchlist();}
      else if(v==='stats'){showView('stats');buildStatsView();}
      else if(v==='cr-calendar'){showView('cr-calendar');loadCrCalendarView();}
      else showView(v);
    });
  });
  // Favoriten Sub-Menü
  document.getElementById('nav-fav-toggle')?.addEventListener('click',()=>{document.getElementById('nav-fav-toggle').classList.toggle('open');document.getElementById('nav-sub-favorites')?.classList.toggle('open');});
  document.getElementById('fav-search')?.addEventListener('input',e=>document.getElementById('nav-sub-favorites-list')?.querySelectorAll('.nav-sub-btn').forEach(b=>{b.style.display=b.textContent.toLowerCase().includes(e.target.value.toLowerCase())?'flex':'none';}));
  // Watchlist Kategorie Links
  document.querySelectorAll('.wl-cat-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.wl-cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');buildWatchlist(btn.dataset.cat);});});
  // News Switcher
  document.querySelectorAll('#news-type-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#news-type-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.news.mediaType=btn.dataset.media;settings.newsLastTab=btn.dataset.media;autoSave();loadSlideshow('news',btn.dataset.media,slideshows.news.tab);}));
  document.querySelectorAll('.news-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.news-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');slideshows.news.tab=tab.dataset.tab;loadSlideshow('news',slideshows.news.mediaType,tab.dataset.tab);}));
  // Upcoming Switcher
  document.querySelectorAll('#upcoming-type-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#upcoming-type-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.upcoming.mediaType=btn.dataset.media;settings.upcomingLastTab=btn.dataset.media;autoSave();loadSlideshow('upcoming',btn.dataset.media);}));
  document.querySelectorAll('.range-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.upcoming.months=parseInt(btn.dataset.months);loadSlideshow('upcoming',slideshows.upcoming.mediaType);}));
  // Home Buttons
  document.getElementById('btn-add-provider-home')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='flex');
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));
  setupSortButtons();
}
function buildSidebarSubMenus(){const list=document.getElementById('nav-sub-favorites-list');if(!list)return;list.innerHTML='';const favs=(settings.favorites||[]).sort((a,b)=>(PROVIDERS()[a]?.name||'').localeCompare(PROVIDERS()[b]?.name||''));if(!favs.length){const h=document.createElement('div');h.style.cssText='padding:5px 10px;font-size:11px;color:var(--tx3)';h.textContent='Keine Favoriten';list.appendChild(h);return;}favs.forEach(id=>{const p=PROVIDERS()[id];if(!p)return;const btn=document.createElement('button');btn.className='nav-sub-btn';btn.innerHTML=`<img src="${getFavicon(id,p)}" width="14" height="14" style="border-radius:2px;object-fit:contain" onerror="this.style.display='none'"/> ${esc((settings.cardCustomNames||{})[id]||p.name)}`;btn.addEventListener('click',()=>openProvider(id));list.appendChild(btn);});}

// ════════ SORT ═════════════════════════════════════════════════════
function setupSortButtons(){
  document.getElementById('btn-sort-alpha')?.addEventListener('click',()=>{if(settings.sortAlpha&&settings.sortDir==='asc'){settings.sortDir='desc';}else if(settings.sortAlpha&&settings.sortDir==='desc'){settings.sortAlpha=false;settings.sortDir='asc';}else{settings.sortAlpha=true;settings.sortDir='asc';}settings.sortByUsage=false;autoSave();buildProviderGrid();updateSortBtn();});
  document.getElementById('btn-sort-usage')?.addEventListener('click',()=>{settings.sortByUsage=!settings.sortByUsage;settings.sortAlpha=false;autoSave();buildProviderGrid();document.getElementById('btn-sort-usage')?.classList.toggle('active',!!settings.sortByUsage);updateSortBtn();});
}
function updateSortBtn(){const btn=document.getElementById('btn-sort-alpha');if(!btn)return;if(settings.sortAlpha&&settings.sortDir==='asc'){btn.textContent='A↓Z';btn.classList.add('active');}else if(settings.sortAlpha&&settings.sortDir==='desc'){btn.textContent='Z↓A';btn.classList.add('active');}else{btn.textContent='A↓Z';btn.classList.remove('active');}}

// ════════ PROVIDER GRID ════════════════════════════════════════════
async function buildProviderGrid(){
  const grid=document.getElementById('providers-grid');if(!grid)return;
  grid.innerHTML='';
  const layout=settings.cardLayout||'normal';grid.className='providers-grid'+(layout!=='normal'?' '+layout:'');
  ['normal','compact','mini'].forEach(l=>document.getElementById('layout-'+l)?.classList.toggle('active',l===layout));
  updateSortBtn();
  const deleted=settings.deletedProviders||[];
  let entries=Object.entries(PROVIDERS()).filter(([id])=>!deleted.includes(id));
  if(settings.sortByUsage){const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));entries=entries.sort((a,b)=>(stats[b[0]]?.total||0)-(stats[a[0]]?.total||0));}
  else if(settings.sortAlpha){entries=entries.sort((a,b)=>settings.sortDir==='desc'?b[1].name.localeCompare(a[1].name):a[1].name.localeCompare(b[1].name));}
  else{entries=entries.sort((a,b)=>a[1].name.localeCompare(b[1].name));if(providerOrder.length)entries=entries.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai<0&&bi<0)return 0;if(ai<0)return 1;if(bi<0)return -1;return ai-bi;});}
  const favs=settings.favorites||[];
  const favL=entries.filter(([id])=>favs.includes(id));
  const rest=entries.filter(([id])=>!favs.includes(id));
  if(favL.length){addGridLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addGridLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}
  if(!settings.sortAlpha&&!settings.sortByUsage)setupDragDrop(grid);
  buildSidebarSubMenus();
  setTimeout(buildRecentlyOpened,50);
}
function addGridLabel(grid,text){const el=document.createElement('div');el.className='grid-section-label';el.textContent=text;grid.appendChild(el);}

function createCard(id,p,isFav){
  const card=document.createElement('div');card.className='provider-card';card.dataset.id=id;
  if(!settings.sortAlpha&&!settings.sortByUsage)card.setAttribute('draggable','true');
  const img=(settings.cardImages||{})[id]||'';
  const logo=(settings.cardLogos||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opa=(settings.cardBgOpacity||{})[id]??100;
  const bgCol=(settings.cardBgColors||{})[id]||p.color+'33';
  const cName=(settings.cardCustomNames||{})[id]||p.name;
  const cTag=(settings.cardCustomTags||{})[id]||p.tag;
  const isMini=(settings.cardLayout||'normal')==='mini';
  const faviconSrc=logo||getFavicon(id,p);
  const isLoggedIn=!!(sessionCache&&sessionCache[id]);
    card.innerHTML=`${p.quality&&!isMini?`<div class="card-quality-badge">${p.quality}</div>`:''}
    ${isLoggedIn?'<div class="card-session-dot" title="Eingeloggt"></div>':''}
    <div class="card-banner" style="background:${bgCol}">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,transparent 80%)"></div>
      ${img?`<div class="card-banner-img" style="background-image:url('${img}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:${opa/100}"></div>`:''}
      <img class="card-favicon" src="${faviconSrc}" alt="${esc(cName)}" onerror="this.style.display='none'"/>
    </div>
    <div class="card-body"><div class="card-info"><span class="card-name">${esc(cName)}</span>${!isMini?`<span class="card-tag">${esc(cTag)}</span>`:''}</div>${!isMini?'<span class="card-arrow">→</span>':''}</div>
    <button class="card-bookmark${isFav?' active':''}" title="Favorit"><svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.5"><path d="M1 1h10v15l-5-3.5L1 16z"/></svg></button>
    <button class="card-edit-btn" title="Karte anpassen">✏️</button>`;
  card.querySelector('.card-bookmark').addEventListener('click',e=>{e.stopPropagation();e.preventDefault();toggleFavorite(id);});
  card.querySelector('.card-edit-btn').addEventListener('click',e=>{e.stopPropagation();e.preventDefault();openCardEditor(id,p);});
  let _dm=false;
  card.addEventListener('mousedown',()=>_dm=false);card.addEventListener('mousemove',()=>_dm=true);
  card.addEventListener('mouseup',e=>{if(_dm)return;if(e.target.closest('.card-bookmark,.card-edit-btn'))return;openProvider(id);});
  card.addEventListener('contextmenu',e=>{
    e.preventDefault();
    document.querySelectorAll('.card-ctx').forEach(m=>m.remove());
    const menu=document.createElement('div');menu.className='card-ctx';
    menu.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r-sm);z-index:3000;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,.5);padding:4px 0`;
    [{l:`▶ ${esc(cName)} öffnen`,fn:()=>openProvider(id)},{l:'↗ In eigenem Fenster',fn:()=>openProviderNewWindow(id)}].forEach(({l,fn})=>{const btn=document.createElement('button');btn.style.cssText='display:block;width:100%;padding:8px 14px;border:none;background:transparent;color:var(--tx);font-size:13px;cursor:pointer;text-align:left';btn.innerHTML=l;btn.onmouseenter=()=>btn.style.background='var(--bgch)';btn.onmouseleave=()=>btn.style.background='transparent';btn.addEventListener('click',()=>{menu.remove();fn();});menu.appendChild(btn);});
    document.body.appendChild(menu);setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),10);
  });
  return card;
}
function setupLayoutButtons(){['normal','compact','mini'].forEach(l=>document.getElementById('layout-'+l)?.addEventListener('click',()=>{settings.cardLayout=l;autoSave();buildProviderGrid();}));}
function toggleFavorite(id){const favs=settings.favorites||[];const idx=favs.indexOf(id);if(idx<0)favs.push(id);else favs.splice(idx,1);settings.favorites=favs;autoSave();buildProviderGrid();}
function setupDragDrop(grid){let drag=null;grid.querySelectorAll('.provider-card[draggable]').forEach(card=>{card.addEventListener('dragstart',e=>{
      if(settings.sortAlpha){
        const sortBtn=document.getElementById('btn-sort-alpha');
        if(sortBtn){sortBtn.style.outline='2px solid var(--acc)';setTimeout(()=>sortBtn.style.outline='',1200);}
        showToastMsg('A–Z deaktivieren um Karten zu verschieben');
        e.preventDefault();return;
      }
      drag=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>el.classList.remove('drag-indicator-left','drag-indicator-right'));});card.addEventListener('dragover',e=>{e.preventDefault();if(card===drag)return;grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>el.classList.remove('drag-indicator-left','drag-indicator-right'));const r=card.getBoundingClientRect();card.classList.add(e.clientX<r.left+r.width/2?'drag-indicator-left':'drag-indicator-right');});card.addEventListener('dragleave',()=>card.classList.remove('drag-indicator-left','drag-indicator-right'));card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drag-indicator-left','drag-indicator-right');if(!drag||drag===card)return;const cards=[...grid.querySelectorAll('.provider-card')];const ids=cards.map(c=>c.dataset.id);const si=ids.indexOf(drag.dataset.id),di=ids.indexOf(card.dataset.id);if(si>-1&&di>-1){ids.splice(si,1);const r=card.getBoundingClientRect();ids.splice(e.clientX>=r.left+r.width/2?Math.min(di+1,ids.length):di,0,drag.dataset.id);}providerOrder=ids;settings.providerOrder=ids;autoSave();buildProviderGrid();});});}

// ════════ CARD EDITOR ══════════════════════════════════════════════
function openCardEditor(id,p){_editId=id;const overlay=document.getElementById('card-editor-overlay');if(!overlay)return;document.getElementById('card-editor-title').textContent='Karte: '+((settings.cardCustomNames||{})[id]||p.name);const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};const opa=(settings.cardBgOpacity||{})[id]??100;['card-ed-name','card-ed-tag'].forEach(eid=>{const fld=document.getElementById(eid);if(fld)fld.value=eid==='card-ed-name'?(settings.cardCustomNames||{})[id]||p.name:(settings.cardCustomTags||{})[id]||p.tag;});const col=((settings.cardBgColors||{})[id]||p.color).substring(0,7);['card-ed-color','card-ed-color-text'].forEach(eid=>{const el=document.getElementById(eid);if(el)el.value=col;});[['card-ed-x',off.x,'px'],['card-ed-y',off.y,'px'],['card-ed-opacity',opa,'%']].forEach(([eid,v,suf])=>{const el=document.getElementById(eid);if(el)el.value=v;const elv=document.getElementById(eid+'-val');if(elv)elv.textContent=v+suf;});const lp=document.getElementById('card-ed-logo-preview');if(lp){const logo=(settings.cardLogos||{})[id]||'';lp.innerHTML=logo?`<img src="${logo}" style="width:100%;height:100%;object-fit:contain"/>`:'';}overlay.style.display='flex';}

function setupCardEditor(){
  document.getElementById('card-editor-overlay')?.addEventListener('click',e=>{if(e.target.id==='card-editor-overlay')e.target.style.display='none';});
  document.getElementById('card-editor-close')?.addEventListener('click',()=>document.getElementById('card-editor-overlay').style.display='none');
  document.getElementById('card-ed-logo-pick')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('logo_'+_editId);if(r){const url=r.base64||r.filePath||r;settings.cardLogos=settings.cardLogos||{};settings.cardLogos[_editId]=url;const lp=document.getElementById('card-ed-logo-preview');if(lp)lp.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:contain"/>`;autoSave();}});
  document.getElementById('card-ed-logo-remove')?.addEventListener('click',()=>{delete(settings.cardLogos||{})[_editId];const lp=document.getElementById('card-ed-logo-preview');if(lp)lp.innerHTML='';autoSave();});
  document.getElementById('card-ed-pick')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('card_'+_editId);if(r){settings.cardImages[_editId]=r.base64||r.filePath||r;autoSave();}});
  document.getElementById('card-ed-remove-img')?.addEventListener('click',()=>{delete settings.cardImages[_editId];autoSave();});
  ['card-ed-x','card-ed-y'].forEach(eid=>{document.getElementById(eid)?.addEventListener('input',e=>{const v=parseInt(e.target.value);const elv=document.getElementById(eid+'-val');if(elv)elv.textContent=v+'px';settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[_editId]={...(settings.cardImageOffsets[_editId]||{}),[eid.endsWith('-x')?'x':'y']:v};autoSave();});});
  document.getElementById('card-ed-opacity')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('card-ed-opacity-val').textContent=v+'%';settings.cardBgOpacity[_editId]=v;autoSave();});
  document.getElementById('card-ed-color')?.addEventListener('input',e=>{settings.cardBgColors[_editId]=e.target.value+'55';document.getElementById('card-ed-color-text').value=e.target.value;autoSave();});
  document.getElementById('card-ed-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){document.getElementById('card-ed-color').value=e.target.value;settings.cardBgColors[_editId]=e.target.value+'55';autoSave();}});
  document.getElementById('card-ed-reset')?.addEventListener('click',()=>{['cardImages','cardImageOffsets','cardBgColors','cardBgOpacity','cardCustomNames','cardCustomTags','cardLogos'].forEach(k=>{if(settings[k])delete settings[k][_editId];});const p=PROVIDERS()[_editId];if(p){document.getElementById('card-ed-name').value=p.name;document.getElementById('card-ed-tag').value=p.tag;}autoSave();buildProviderGrid();showToastMsg('Karte zurückgesetzt.');});
  document.getElementById('card-ed-save')?.addEventListener('click',()=>{const name=document.getElementById('card-ed-name').value.trim();const tag=document.getElementById('card-ed-tag').value.trim();settings.cardCustomNames=settings.cardCustomNames||{};settings.cardCustomTags=settings.cardCustomTags||{};if(name)settings.cardCustomNames[_editId]=name;if(tag)settings.cardCustomTags[_editId]=tag;if(customProviders[_editId]){if(name)customProviders[_editId].name=name;if(tag)customProviders[_editId].tag=tag;settings.customProviders=customProviders;}autoSave();buildProviderGrid();document.getElementById('card-editor-overlay').style.display='none';showSaveToast();});
  document.getElementById('card-ed-delete')?.addEventListener('click',()=>{const cName=(settings.cardCustomNames||{})[_editId]||PROVIDERS()[_editId]?.name||_editId;if(!confirm('"'+cName+'" löschen?'))return;if(customProviders[_editId])delete customProviders[_editId];else{settings.deletedProviders=settings.deletedProviders||[];settings.deletedProviders.push(_editId);}settings.customProviders=customProviders;providerOrder=providerOrder.filter(id=>id!==_editId);settings.providerOrder=providerOrder;autoSave();buildProviderGrid();document.getElementById('card-editor-overlay').style.display='none';});
}

// ════════ CUSTOM PROVIDER ══════════════════════════════════════════
function setupCustomProviderModal(){document.getElementById('cp-save')?.addEventListener('click',()=>{const name=document.getElementById('cp-name').value.trim(),url=document.getElementById('cp-url').value.trim(),color=document.getElementById('cp-color')?.value||'#30c5bb';if(!name||!url)return;const id='custom_'+Date.now();customProviders[id]={name,tag:'Eigener Anbieter',url,color,quality:'–'};settings.customProviders=customProviders;autoSave();buildProviderGrid();document.getElementById('custom-provider-modal').style.display='none';document.getElementById('cp-name').value='';document.getElementById('cp-url').value='';});document.getElementById('cp-cancel')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='none');}

// ════════ OPEN PROVIDER ════════════════════════════════════════════
function openProvider(id){const p=PROVIDERS()[id];if(!p)return;openProviderAtUrl(id,p.url,(settings.cardCustomNames||{})[id]||p.name,getProfilePartition(id));}
function openProviderNewWindow(id){const p=PROVIDERS()[id];if(!p)return;window.electronAPI.openSecondWindow({url:p.url,partition:getProfilePartition(id),title:(settings.cardCustomNames||{})[id]||p.name});}
function openProviderAtUrl(id,url,name,partition){
  if(!url)return;
  // Sicherheit: nur http/https erlauben
  try{const u=new URL(url);if(!['http:','https:'].includes(u.protocol))return;}catch{return;}
  const p=PROVIDERS()[id]||{url,name:name||id,color:'#333',multiTab:false};
  if(currentProvider===id&&currentWebview){showView('stream');return;}
  if(pipProviderId===id){restoreFromPip();return;}
  if(currentWebview&&currentProvider&&currentProvider!==id)maybeMoveToPip();
  currentProvider=id;currentProvUrl=url;
  document.getElementById('stream-title').textContent=name||p.name;
  document.getElementById('btn-watching').style.display='flex';
  document.getElementById('btn-bg-play').style.display=p.bgAudio?'flex':'none';
  window.electronAPI.setupWebviewSession(partition||getProfilePartition(id));
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';
  const wv=document.createElement('webview');
  wv.setAttribute('src',url);wv.setAttribute('partition',partition||getProfilePartition(id));if(p.multiTab||p.allowpopups)wv.setAttribute('allowpopups','');wv.setAttribute('useragent',UA);wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  if(p.multiTab){setupMultiTabWebview(id,wv,url,name||p.name);}
  else{document.getElementById('stream-tabs-bar').style.display='none';streamTabs=[];activeTabId=null;wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))wv.loadURL(e.url);});}
  currentWebview=wv;if(wrap)wrap.appendChild(wv);
  let loadTO=null;
  wv.addEventListener('did-start-loading',()=>{clearTimeout(loadTO);loadTO=setTimeout(()=>{showNotif('⚠ Lädt sehr lange…',name||p.name+' braucht länger als erwartet. Wird erneut versucht…');try{wv.reload();}catch{}},7000);});
  wv.addEventListener('did-stop-loading',()=>{clearTimeout(loadTO);document.getElementById('btn-retry').style.display='none';addViewHistory({id,name:name||p.name,url,time:Date.now()});startWatchTimer(id);window.electronAPI.refreshSessionsNow(activeProfileId);if(new Date().getHours()<4)trackMeta('midnightStreams');});
  wv.addEventListener('did-fail-load',e=>{if(e.errorCode===-3||e.errorCode===0)return;clearTimeout(loadTO);document.getElementById('btn-retry').style.display='flex';showNotif('⚠ Fehler',(name||p.name)+' konnte nicht geladen werden.');});
  // Suchleiste leeren
  const si=document.getElementById('search-input');if(si)si.value='';document.getElementById('search-dropdown').style.display='none';
  // BetterTTV
  if(id==='twitch')setTimeout(()=>injectBetterTTV(wv),2000);
  // Buster Captcha
  if(['burning','cineto','movie2k'].includes(id))setTimeout(()=>injectBuster(wv),2000);
  showView('stream');
}
function injectBetterTTV(wv){if(!installedPlugins.has('betterttv'))return;try{wv.executeJavaScript("if(!document.getElementById('bttv-inject')){const s=document.createElement('script');s.id='bttv-inject';s.src='https://cdn.betterttv.net/betterttv.js';document.head.appendChild(s);}");} catch{}}
function injectBuster(wv){if(!installedPlugins.has('buster'))return;try{wv.executeJavaScript("if(!document.getElementById('buster-inject')){const s=document.createElement('script');s.id='buster-inject';s.src='https://cdn.jsdelivr.net/gh/dessant/buster@master/src/content/index.js';document.head.appendChild(s);}");} catch{}}
function startWatchTimer(id){stopWatchTimer();watchTimeTimer=setInterval(()=>{window.electronAPI.recordWatchTime(id,60,activeProfileId);checkAchievements(true);},60000);}
function stopWatchTimer(){clearInterval(watchTimeTimer);watchTimeTimer=null;}
function addViewHistory(e){viewHistory=viewHistory.filter(h=>h.id!==e.id).slice(0,49);viewHistory.unshift(e);settings.viewHistory=viewHistory;autoSave();}

// ════════ MULTI-TAB ════════════════════════════════════════════════
function setupMultiTabWebview(pid,wv,url,title){streamTabs=[{id:'tab0',title,url,webview:wv,muted:false}];activeTabId='tab0';document.getElementById('stream-tabs-bar').style.display='block';renderStreamTabs();wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))addStreamTab(pid,e.url,e.frameName||e.url);});wv.addEventListener('page-title-updated',e=>{if(streamTabs[0])streamTabs[0].title=e.title.substring(0,30);renderStreamTabs();});}
function addStreamTab(pid,url,title){const p=PROVIDERS()[pid];if(!p)return;const id='tab_'+Date.now();const wv=document.createElement('webview');wv.setAttribute('src',url);wv.setAttribute('partition',getProfilePartition(pid));wv.setAttribute('allowpopups','');wv.setAttribute('useragent',UA);wv.style.cssText='width:100%;height:100%;border:none;display:flex';wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))addStreamTab(pid,e.url,e.url);});wv.addEventListener('page-title-updated',e=>{const t=streamTabs.find(t=>t.id===id);if(t){t.title=e.title.substring(0,30);renderStreamTabs();}});streamTabs.push({id,title:title.substring(0,30),url,webview:wv,muted:false});switchTab(id);}
function switchTab(id){activeTabId=id;const wrap=document.getElementById('webview-wrap');if(!wrap)return;wrap.innerHTML='';const tab=streamTabs.find(t=>t.id===id);if(tab?.webview){wrap.appendChild(tab.webview);currentWebview=tab.webview;}renderStreamTabs();}
function closeTab(id){const idx=streamTabs.findIndex(t=>t.id===id);if(idx<0)return;streamTabs.splice(idx,1);if(!streamTabs.length){stopStream();return;}switchTab(streamTabs[Math.max(0,idx-1)].id);}
function renderStreamTabs(){const bar=document.getElementById('stream-tabs-bar'),cont=document.getElementById('stream-tabs');if(!bar||!cont)return;bar.style.display=streamTabs.length?'block':'none';cont.innerHTML='';streamTabs.forEach(tab=>{const el=document.createElement('div');el.className='stream-tab'+(tab.id===activeTabId?' active':'');el.innerHTML=`<span class="stream-tab-title">${esc(tab.title)}</span><button class="stream-tab-mute">${tab.muted?'🔇':'🔊'}</button><button class="stream-tab-close">✕</button>`;el.querySelector('.stream-tab-title').addEventListener('click',()=>switchTab(tab.id));el.querySelector('.stream-tab-mute').addEventListener('click',e=>{e.stopPropagation();tab.muted=!tab.muted;try{tab.webview.setAudioMuted(tab.muted);}catch{}renderStreamTabs();});el.querySelector('.stream-tab-close').addEventListener('click',e=>{e.stopPropagation();closeTab(tab.id);});cont.appendChild(el);});}
function stopStream(){stopWatchTimer();if(isFullscreen)window.electronAPI.setFullscreen(false);document.getElementById('webview-wrap').innerHTML='';currentWebview=null;currentProvider=null;currentProvUrl=null;streamTabs=[];activeTabId=null;document.getElementById('stream-tabs-bar').style.display='none';document.getElementById('btn-watching').style.display='none';showView('home');}
function maybeMoveToPip(){if(currentWebview&&currentProvider){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}}

// ════════ STREAM CONTROLS / FULLSCREEN / PIP ═══════════════════════
function setupStreamControls(){
  document.getElementById('back-btn')?.addEventListener('click',()=>{if(isFullscreen)window.electronAPI.setFullscreen(false);maybeMoveToPip();showView('home');});
  document.getElementById('btn-stop')?.addEventListener('click',()=>{if(!confirm('Stream beenden?'))return;stopStream();});
  document.getElementById('btn-pip')?.addEventListener('click',()=>{if(currentWebview&&currentProvider){maybeMoveToPip();showView('home');}});
  document.getElementById('btn-fullscreen')?.addEventListener('click',()=>window.electronAPI.setFullscreen(!isFullscreen));
  document.getElementById('btn-retry')?.addEventListener('click',()=>{if(currentWebview&&currentProvUrl)currentWebview.loadURL(currentProvUrl);});
  document.getElementById('btn-second-window')?.addEventListener('click',()=>{if(currentProvider)openProviderNewWindow(currentProvider);});
  document.getElementById('btn-bg-play')?.addEventListener('click',()=>{maybeMoveToPip();showView('home');});
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{if(!currentProvider)return;const name=(settings.cardCustomNames||{})[currentProvider]||PROVIDERS()[currentProvider]?.name||currentProvider;if(!confirm('Von '+name+' abmelden?'))return;window.electronAPI.clearProviderSession(activeProfileId,currentProvider);if(currentWebview)try{currentWebview.loadURL(currentProvUrl);}catch{}window.electronAPI.refreshSessionsNow(activeProfileId);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isFullscreen)window.electronAPI.setFullscreen(false);if(e.key==='F11'){e.preventDefault();window.electronAPI.setFullscreen(!isFullscreen);}if((e.ctrlKey||e.metaKey)&&(e.key==='f'||e.key==='F')){e.preventDefault();const si=document.getElementById('search-input');si?.focus();si?.select();}});
}
function updateFullscreenUI(){const els=['stream-topbar','sidebar','titlebar','stream-tabs-bar'].map(id=>document.getElementById(id));const wrap=document.getElementById('webview-wrap');if(isFullscreen){els.forEach(el=>el?.classList.add('hidden'));if(wrap)wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';}else{els.forEach(el=>el?.classList.remove('hidden'));if(wrap)wrap.style.cssText='';}}
function setupPip(){const pip=document.getElementById('pip-window');if(!pip)return;let drag=false,ox=0,oy=0;document.getElementById('pip-topbar')?.addEventListener('mousedown',e=>{drag=true;const r=pip.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();});document.addEventListener('mousemove',e=>{if(!drag)return;pip.style.left=Math.max(0,Math.min(window.innerWidth-pip.offsetWidth,e.clientX-ox))+'px';pip.style.top=Math.max(0,Math.min(window.innerHeight-pip.offsetHeight,e.clientY-oy))+'px';pip.style.right='auto';pip.style.bottom='auto';});document.addEventListener('mouseup',()=>drag=false);document.getElementById('pip-expand')?.addEventListener('click',restoreFromPip);document.getElementById('pip-close')?.addEventListener('click',()=>{pip.style.display='none';document.getElementById('pip-content').innerHTML='';pipProviderId=null;stopWatchTimer();});}
function moveToPip(id,wv){const pip=document.getElementById('pip-window'),cont=document.getElementById('pip-content');if(!pip||!cont)return;cont.innerHTML='';if(wv?.parentNode)wv.parentNode.removeChild(wv);if(wv){wv.style.cssText='width:100%;height:100%;border:none;display:flex';cont.appendChild(wv);}pipProviderId=id;const t=document.getElementById('pip-title');if(t)t.textContent=(settings.cardCustomNames||{})[id]||PROVIDERS()[id]?.name||id;pip.style.left='auto';pip.style.top='auto';pip.style.right='24px';pip.style.bottom='24px';pip.style.display='flex';}
function restoreFromPip(){if(!pipProviderId)return;const id=pipProviderId,pip=document.getElementById('pip-window'),cont=document.getElementById('pip-content'),wrap=document.getElementById('webview-wrap');if(!cont||!wrap)return;const wv=cont.querySelector('webview');if(wv){wv.parentNode.removeChild(wv);wv.style.cssText='width:100%;height:100%;border:none;display:flex';wrap.innerHTML='';wrap.appendChild(wv);currentWebview=wv;}cont.innerHTML='';pip.style.display='none';pipProviderId=null;currentProvider=id;document.getElementById('stream-title').textContent=(settings.cardCustomNames||{})[id]||PROVIDERS()[id]?.name||id;document.getElementById('btn-watching').style.display='flex';showView('stream');}

// ════════ SEARCH ═══════════════════════════════════════════════════
function extractYtId(q){const ps=[/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,/youtube\.com\/shorts\/([\w-]{11})/,/youtube\.com\/embed\/([\w-]{11})/];for(const p of ps){const m=q.match(p);if(m)return m[1];}return null;}

function setupSearch(){
  const input=document.getElementById('search-input'),clear=document.getElementById('search-clear'),dd=document.getElementById('search-dropdown');if(!input||!dd)return;
  input.addEventListener('focus',()=>{if(input.value.trim()&&dd.innerHTML)dd.style.display='block';else if(!input.value.trim()&&searchHistory.length)renderSearchHistory(dd);});
  input.addEventListener('input',()=>{
    const q=input.value.trim();if(clear)clear.style.display=q?'block':'none';
    clearTimeout(searchTimer);
    if(!q){dd.innerHTML='';if(searchHistory.length)renderSearchHistory(dd);else dd.style.display='none';return;}
    lastQuery=q;searchPage=1;
    // AbortController: vorherige Suche abbrechen
    if(window._tmdbAbort)window._tmdbAbort.abort();
    window._tmdbAbort=new AbortController();
    const ytId=extractYtId(q);
    if(ytId){dd.innerHTML='<div class="search-dd-section">YouTube</div><div class="search-dd-item" id="yt-dd-item" style="cursor:pointer"><img src="https://img.youtube.com/vi/'+ytId+'/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover;flex-shrink:0" onerror="this.style.display=\'none\'"/><div class="search-dd-info"><div class="search-dd-title">YouTube Video</div><div class="search-dd-meta">Direkt öffnen</div></div></div>';dd.style.display='block';document.getElementById('yt-dd-item')?.addEventListener('click',()=>{dd.style.display='none';openProviderAtUrl('youtube','https://www.youtube.com/watch?v='+ytId,'YouTube',getProfilePartition('youtube'));});return;}
    renderInstantSuggestions(q,dd);
    searchTimer=setTimeout(()=>runTmdbSearch(q,1,window._tmdbAbort?.signal),350);
  });
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=input.value.trim();if(!q)return;clearTimeout(searchTimer);addToSearchHistory(q);runTmdbSearch(q,1);}});
  if(clear)clear.addEventListener('click',()=>{input.value='';clear.style.display='none';dd.style.display='none';dd.innerHTML='';lastQuery='';});
  document.addEventListener('mousedown',e=>{const wrap=input.closest('.search-bar-wrap')||input.closest('.home-actions');if(wrap&&!wrap.contains(e.target)&&!dd.contains(e.target))dd.style.display='none';});
}

function renderSearchHistory(dd){
  let html='<div class="search-dd-section" style="display:flex;justify-content:space-between;align-items:center"><span>Zuletzt gesucht</span><button onclick="clearAllSearchHistory()" style="font-size:10px;color:var(--danger);border:none;background:transparent;cursor:pointer;padding:2px 6px;border-radius:4px;font-weight:600">Alle löschen</button></div>';
  searchHistory.slice(0,10).forEach((q,i)=>{html+=`<div class="search-dd-history-item"><span class="search-dd-history-q" data-q="${esc(q)}">🕐 ${esc(q)}</span><button class="search-dd-history-del" data-i="${i}">✕</button></div>`;});
  dd.innerHTML=html;dd.style.display='block';
  dd.querySelectorAll('.search-dd-history-q').forEach(el=>el.addEventListener('click',()=>{document.getElementById('search-input').value=el.dataset.q;document.getElementById('search-input').dispatchEvent(new Event('input'));}));
  dd.querySelectorAll('.search-dd-history-del').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();searchHistory.splice(parseInt(el.dataset.i),1);settings.searchHistory=searchHistory;autoSave();renderSearchHistory(dd);}));
}
window.clearAllSearchHistory=function(){searchHistory=[];settings.searchHistory=[];autoSave();const dd=document.getElementById('search-dropdown');if(dd)dd.style.display='none';};

function renderInstantSuggestions(q,dd){const ql=q.toLowerCase();const matches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql));if(!matches.length)return;let html='<div class="search-dd-section">Anbieter</div>';matches.slice(0,4).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-prov-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc((settings.cardCustomNames||{})[id]||p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`;});dd.innerHTML=html;dd.style.display='block';dd.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.provOpen)));}

const _tmdbSearchCache=new Map();
async function runTmdbSearch(q,page=1,signal=null){
  const cacheKey=q+'|'+page;
  const cached=_tmdbSearchCache.get(cacheKey);
  if(cached&&Date.now()-cached.ts<5*60*1000&&page===1){
    // Cache-Treffer: direkt rendern ohne API-Call
    const dd=document.getElementById('search-dropdown');
    if(dd&&!signal?.aborted){dd.innerHTML=cached.html;dd.style.display='block';
      dd.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.provOpen)));
      dd.querySelectorAll('.search-dd-film').forEach(el=>el.addEventListener('click',async e=>{if(e.target.closest('.search-dd-provider-chip'))return;dd.style.display='none';showDetailPopup(parseInt(el.dataset.tmdb),el.dataset.type,el.dataset.title);}));
    }return;
  }
  const dd=document.getElementById('search-dropdown');if(!dd)return;
  const ql=q.toLowerCase();const provMatches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql));
  let html='';
  if(provMatches.length&&page===1){html+='<div class="search-dd-section">Anbieter</div>';provMatches.slice(0,3).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-prov-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc((settings.cardCustomNames||{})[id]||p.name)}</div></div></div>`;});}
  try{
    if(signal?.aborted)return;
    const data=await window.electronAPI.searchTmdb(q);
    if(signal?.aborted)return;
    const results=(data.results||[]).filter(r=>r.poster_path&&r.media_type!=='person');
    if(results.length){
      if(page===1)html+='<div class="search-dd-section">Filme & Serien</div>';
      const slice=results.slice((page-1)*8,page*8);
      slice.forEach(item=>{const title=item.title||item.name||'';const year=(item.release_date||item.first_air_date||'').substring(0,4);const type=item.media_type==='movie'?'Film':'Serie';html+=`<div class="search-dd-item search-dd-film" data-tmdb="${item.id}" data-type="${item.media_type}" data-title="${esc(title)}" style="cursor:pointer"><img class="search-dd-poster" src="${TMDB_IMG}${item.poster_path}" style="width:36px;height:52px;object-fit:cover;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(title)}</div><div class="search-dd-meta"><span class="search-dd-badge">${type}</span>${year?`<span>${year}</span>`:''}</div><div class="search-dd-providers" id="chips_${item.id}"></div></div></div>`;});
      if(results.length>page*8)html+=`<div class="search-dd-more" id="dd-more-btn">Weitere Ergebnisse ↓</div>`;
    }else if(!provMatches.length){html+=`<div style="padding:16px 14px;text-align:center;font-size:13px;color:var(--tx2)">Keine Ergebnisse für „${esc(q)}"</div>`;}
  }catch(e){html+=`<div style="padding:12px 14px;font-size:12px;color:var(--danger)">Fehler: ${e.message}</div>`;}
  if(page===1)dd.innerHTML=html;else{const mb=document.getElementById('dd-more-btn');if(mb)mb.remove();const tmp=document.createElement('div');tmp.innerHTML=html;tmp.querySelectorAll('.search-dd-item,.search-dd-more').forEach(el=>dd.appendChild(el));dd.scrollTo({top:dd.scrollHeight,behavior:'smooth'});}
  dd.style.display='block';
  // Cache speichern
  if(page===1)_tmdbSearchCache.set(cacheKey,{html:dd.innerHTML,ts:Date.now()});
  dd.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.provOpen)));
  dd.querySelectorAll('.search-dd-film').forEach(el=>el.addEventListener('click',async e=>{if(e.target.closest('.search-dd-provider-chip'))return;dd.style.display='none';showDetailPopup(parseInt(el.dataset.tmdb),el.dataset.type,el.dataset.title);}));
  document.getElementById('dd-more-btn')?.addEventListener('click',()=>{searchPage++;runTmdbSearch(lastQuery,searchPage);});
  dd.querySelectorAll('.search-dd-film').forEach(el=>loadSearchChips(parseInt(el.dataset.tmdb),el.dataset.type,'chips_'+el.dataset.tmdb));
}
async function loadSearchChips(tmdbId,type,cId){try{const prov=await window.electronAPI.getStreamingProviders({tmdbId,type});const cont=document.getElementById(cId);if(!cont)return;const all=[...(prov?.flatrate||[]),...(prov?.rent||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i&&p.logo_path).slice(0,4);if(all.length)cont.innerHTML=all.map(p=>{const oid=TMDB_PMAP[p.provider_id];return`<div class="search-dd-provider-chip"${oid?` data-prov-open="${oid}"`:''} style="cursor:${oid?'pointer':'default'}"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" style="width:12px;height:12px;object-fit:contain;border-radius:2px" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;}).join('');cont.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProvider(el.dataset.provOpen);}));}catch{}}
function addToSearchHistory(q){if(!q||searchHistory.includes(q))return;searchHistory.unshift(q);searchHistory=searchHistory.slice(0,20);settings.searchHistory=searchHistory;autoSave();}

// ════════ DETAIL POPUP ═════════════════════════════════════════════
async function showDetailPopup(tmdbId,tmdbType,title){
  const overlay=document.getElementById('detail-overlay');if(!overlay)return;
  overlay.style.display='flex';
  ['detail-title','detail-overview','detail-meta','detail-providers','detail-badges','detail-actions'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='';});
  document.getElementById('detail-title').textContent=title||'Lädt…';
  document.getElementById('detail-trailer-wrap').style.display='none';
  const twv=document.getElementById('detail-trailer-wv');if(twv)twv.setAttribute('src','about:blank');
  const data=await window.electronAPI.getTmdbDetail({id:tmdbId,type:tmdbType}).catch(()=>null);
  if(!data||data.error)return;
  const {detail,videos,providers}=data;if(!detail)return;
  const t=detail.title||detail.name||title;
  const poster=detail.poster_path?`${TMDB_IMG}${detail.poster_path}`:'';
  const backdrop=detail.backdrop_path?`${TMDB_BD}${detail.backdrop_path}`:'';
  const year=(detail.release_date||detail.first_air_date||'').substring(0,4);
  const runtime=detail.runtime?`${detail.runtime} Min.`:detail.episode_run_time?.[0]?`~${detail.episode_run_time[0]} Min.`:'';
  const rating=detail.vote_average?detail.vote_average.toFixed(1):null;
  const genres=(detail.genres||[]).map(g=>g.name).join(', ');
  document.getElementById('detail-title').textContent=t;
  document.getElementById('detail-overview').textContent=detail.overview||'Keine Beschreibung.';
  // POSTER: object-fit:contain damit nicht abgeschnitten
  const pEl=document.getElementById('detail-poster');if(pEl&&poster){pEl.src=poster;pEl.style.objectFit='contain';}
  const bEl=document.getElementById('detail-backdrop');if(bEl&&backdrop)bEl.style.backgroundImage=`url("${backdrop}")`;
  document.getElementById('detail-badges').innerHTML=[year,runtime,rating?'★ '+rating:null,tmdbType==='tv'?'Serie':'Film'].filter(Boolean).map(b=>`<span class="detail-badge">${esc(b)}</span>`).join('');
  document.getElementById('detail-meta').innerHTML=genres?`<div class="detail-meta-item"><span class="detail-meta-label">Genre:</span> ${esc(genres)}</div>`:'';
  // Trailer
  const trailer=videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
  if(trailer){document.getElementById('detail-trailer-wrap').style.display='block';const twv=document.getElementById('detail-trailer-wv');if(twv)twv.setAttribute('src','https://www.youtube-nocookie.com/embed/'+trailer.key+'?rel=0&modestbranding=1');}
  // Provider – kein undefined
  const provWrap=document.getElementById('detail-providers');const availProv=[];
  if(providers){const all=[...(providers.flatrate||[]),...(providers.rent||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i&&p.provider_name&&p.logo_path);all.slice(0,8).forEach(p=>{const oid=TMDB_PMAP[p.provider_id];availProv.push({...p,ourId:oid});});provWrap.innerHTML=availProv.length?availProv.map(p=>`<div class="detail-provider-chip${p.ourId?' clickable':''}"${p.ourId?` data-prov="${p.ourId}"`:''} style="cursor:${p.ourId?'pointer':'default'}"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`).join(''):'<span style="font-size:11px;color:var(--tx3)">Nicht in DE verfügbar</span>';provWrap.querySelectorAll('[data-prov]').forEach(el=>el.addEventListener('click',()=>{overlay.style.display='none';openProvider(el.dataset.prov);}));}
  // Aktionen
  const actions=document.getElementById('detail-actions');
  const isInWl=!!watchlist.find(w=>w.id===tmdbType+'_'+tmdbId);
  actions.innerHTML=`<button class="detail-action-btn primary" id="d-watch">▶ Anschauen</button><button class="detail-action-btn secondary" id="d-ggl">🔍 Google</button><button class="detail-action-btn secondary" id="d-wl">${isInWl?'🔖 Gemerkt':'🔖 Merken'}</button>`;
  // Anschauen
  document.getElementById('d-watch').addEventListener('click',()=>{
    const ourP=availProv.filter(p=>p.ourId);
    if(!ourP.length){window.electronAPI.openExternal('https://www.google.com/search?q='+encodeURIComponent(t+' stream deutsch'));return;}
    if(ourP.length===1){overlay.style.display='none';openProvider(ourP[0].ourId);return;}
    // Auswahl
    const sel=document.createElement('div');sel.className='provider-select-popup';sel.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:20px;z-index:10;min-width:220px;box-shadow:0 8px 32px rgba(0,0,0,.6)';sel.innerHTML='<div style="font-family:var(--font-d);font-weight:700;margin-bottom:12px;color:var(--tx)">Bei welchem Anbieter?</div>';
    ourP.forEach(p=>{const btn=document.createElement('button');btn.style.cssText='display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);margin-bottom:6px;cursor:pointer;color:var(--tx);font-size:13px';btn.innerHTML=`<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" style="width:16px;height:16px;object-fit:contain" onerror="this.style.display='none'"/>${esc(p.provider_name)}`;btn.addEventListener('click',()=>{overlay.style.display='none';sel.remove();openProvider(p.ourId);});sel.appendChild(btn);});
    const cancel=document.createElement('button');cancel.textContent='Abbrechen';cancel.style.cssText='width:100%;padding:7px;background:transparent;border:1px solid var(--bor);border-radius:var(--r-sm);cursor:pointer;color:var(--tx2);font-size:12px;margin-top:4px';cancel.addEventListener('click',()=>sel.remove());sel.appendChild(cancel);
    document.querySelector('.detail-modal').appendChild(sel);
  });
  document.getElementById('d-ggl').addEventListener('click',()=>window.electronAPI.openExternal('https://www.google.com/search?q='+encodeURIComponent(t+' stream deutsch')));
  document.getElementById('d-wl').addEventListener('click',e=>{const wlId=tmdbType+'_'+tmdbId;if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.textContent='🔖 Merken';}else{if(watchlist.find(w=>w.id===wlId)){showToastMsg('✓ Bereits in deiner Watchlist');return;}watchlist.unshift({id:wlId,tmdbId,tmdbType,title:t,poster,releaseDate:detail.release_date||detail.first_air_date||'',mediaType:tmdbType==='tv'?'tv':'movie'});e.target.textContent='🔖 Gemerkt';}settings.watchlist=watchlist;autoSave();});
  document.getElementById('detail-close').onclick=closeDetailPopup;
  overlay.onclick=e=>{if(e.target===overlay)closeDetailPopup();};
}
function closeDetailPopup(){document.getElementById('detail-overlay').style.display='none';const twv=document.getElementById('detail-trailer-wv');if(twv)twv.setAttribute('src','about:blank');}


// ════════ SLIDESHOW ════════════════════════════════════════════════
async function loadSlideshow(key,mediaType,tab){
  const ss=slideshows[key];ss.mediaType=mediaType;if(tab)ss.tab=tab;
  let raw=[];
  try{if(key==='news'){const data=(ss.tab||'trending')==='trending'?await window.electronAPI.getTrending():await window.electronAPI.getNewReleases();raw=mediaType==='movies'?(data.movies||[]):mediaType==='shows'?(data.shows||[]):(data.anime||[]);}
  else{const data=await window.electronAPI.getUpcoming(1);raw=mediaType==='movies'?(data.movies||[]):mediaType==='shows'?(data.shows||[]):(data.anime||[]);
      const today=new Date();today.setHours(0,0,0,0);
      raw=raw.filter(i=>{const d=i.release_date||i.first_air_date;return d&&new Date(d)>=today;});}}catch{}
  ss.items=raw.filter(i=>!(hiddenItems[key]||{})[i.id]);
  renderSlideshow(key);
}

function renderSlideshow(key){
  const ss=slideshows[key];const track=document.getElementById(key+'-track'),dots=document.getElementById(key+'-dots');
  clearInterval(ss.timer);ss.idx=0;if(!track)return;track.innerHTML='';if(dots)dots.innerHTML='';
  if(!ss.items.length){track.innerHTML='<div style="color:rgba(255,255,255,.4);padding:20px 40px">Keine Daten.</div>';return;}
  const watchedBtn=document.getElementById(key+'-show-watched');if(watchedBtn)watchedBtn.style.display='block';
  const hiddenBtn=document.getElementById(key+'-show-hidden');if(hiddenBtn)hiddenBtn.style.display='block';

  ss.items.forEach((item,i)=>{
    const title=item.title||item.name||'Unbekannt';
    const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';
    const rd=item.release_date||item.first_air_date||'';
    const year=rd.substring(0,4);
    const tmdbType=item.title?'movie':'tv';
    const isInWl=!!watchlist.find(w=>w.id===tmdbType+'_'+item.id);
    const isWatched=!!(watchedItems[key]||{})[item.id];
    const fmtDate=rd&&key==='upcoming'?new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):null;

    const card=document.createElement('div');card.className='slide-card'+(i===0?' active-slide':'');card.dataset.idx=i;
    card.innerHTML=`
      <div class="slide-hide-wrap"><button class="slide-hide-btn" title="Ausblenden"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/></svg></button></div>
      <div class="slide-bookmark-wrap"><button class="slide-bookmark-btn${isInWl?' bookmarked':''}" title="Merken">🔖</button></div>
      <div class="slide-watched-wrap"><button class="slide-watched-btn${isWatched?' watched':''}" title="Gesehen">✓</button></div>
      <div class="slide-card-inner">
        ${poster?`<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'"/>`:'<div class="slide-card-poster-ph">🎬</div>'}
        <div class="slide-card-body"><div class="slide-card-title">${esc(title)}</div><div style="font-size:9px;color:rgba(255,255,255,.45);margin-top:2px">${year?`<span>${year}</span>`:''} ${fmtDate?`<span style="color:var(--acc)">📅 ${fmtDate}</span>`:''}</div></div>
      </div>`;

    card.querySelector('.slide-hide-btn').addEventListener('click',e=>{e.stopPropagation();card.style.transition='all .4s';card.style.opacity='0';card.style.transform='scale(.85)';setTimeout(()=>{if(!hiddenItems[key])hiddenItems[key]={};hiddenItems[key][item.id]={title,poster,tmdbId:item.id,tmdbType,releaseDate:rd};settings.hiddenItems=hiddenItems;autoSave();ss.items=ss.items.filter(it=>it.id!==item.id);renderSlideshow(key);},400);});
    card.querySelector('.slide-bookmark-btn').addEventListener('click',e=>{e.stopPropagation();const wlId=tmdbType+'_'+item.id;if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.classList.remove('bookmarked');}else{watchlist.unshift({id:wlId,tmdbId:item.id,tmdbType,title,poster,releaseDate:rd,mediaType:tmdbType==='tv'?'tv':'movie'});e.target.classList.add('bookmarked');}settings.watchlist=watchlist;autoSave();});
    card.querySelector('.slide-watched-btn').addEventListener('click',e=>{e.stopPropagation();if(!watchedItems[key])watchedItems[key]={};if(watchedItems[key][item.id]){delete watchedItems[key][item.id];e.target.classList.remove('watched');}else{watchedItems[key][item.id]={title,poster,tmdbId:item.id,tmdbType,releaseDate:rd};e.target.classList.add('watched');}settings.watchedItems=watchedItems;autoSave();});
    card.querySelector('.slide-card-inner').addEventListener('click',()=>{goToSlide(key,i);showDetailPopup(item.id,tmdbType,title);});
    track.appendChild(card);
    if(dots){const dot=document.createElement('button');dot.className='slide-dot'+(i===0?' active':'');dot.addEventListener('click',()=>goToSlide(key,i));dots.appendChild(dot);}
  });

  document.getElementById(key+'-prev').onclick=()=>goToSlide(key,ss.idx-1);
  document.getElementById(key+'-next').onclick=()=>goToSlide(key,ss.idx+1);
  updateSlideshowBg(key,ss.items[0]);updateSlideshowTitle(key,ss.items[0]);
  const titleEl=document.getElementById(key+'-current-title');if(titleEl)titleEl.textContent=ss.items[0]?.title||ss.items[0]?.name||'';
  ss.timer=setInterval(()=>goToSlide(key,ss.idx+1),6000);

  // Watched/Hidden buttons
  if(watchedBtn)watchedBtn.onclick=()=>showItemsPanel(key,'watched');
  if(hiddenBtn)hiddenBtn.onclick=()=>showItemsPanel(key,'hidden');
}

function goToSlide(key,idx){const ss=slideshows[key];if(!ss.items.length)return;idx=((idx%ss.items.length)+ss.items.length)%ss.items.length;ss.idx=idx;const track=document.getElementById(key+'-track'),dots=document.getElementById(key+'-dots');if(!track)return;const cards=track.querySelectorAll('.slide-card');cards.forEach((c,i)=>c.classList.toggle('active-slide',i===idx));const active=cards[idx];if(active){const isFirst=idx===0;if(isFirst)active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});else active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}if(dots)dots.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));updateSlideshowBg(key,ss.items[idx]);updateSlideshowTitle(key,ss.items[idx]);const titleEl=document.getElementById(key+'-current-title');if(titleEl)titleEl.textContent=ss.items[idx]?.title||ss.items[idx]?.name||'';clearInterval(ss.timer);ss.timer=setInterval(()=>goToSlide(key,ss.idx+1),6000);}
function updateSlideshowTitle(key,item){const el=document.getElementById(key+'-current-title');if(el)el.textContent=item?.title||item?.name||'';}
function updateSlideshowBg(key,item){const el=document.getElementById(key+'-bg');if(!el||!item)return;const bd=item.backdrop_path?`${TMDB_BD}${item.backdrop_path}`:'';if(bd)el.style.backgroundImage=`url("${bd}")`;}

function showItemsPanel(key,mode){
  _hiddenPanelKey=key;
  const overlay=document.getElementById('hidden-overlay');const grid=document.getElementById('hidden-grid');if(!overlay||!grid)return;
  const store=mode==='watched'?watchedItems[key]||{}:hiddenItems[key]||{};const ids=Object.keys(store);
  if(!ids.length){showToastMsg(mode==='watched'?'Keine gesehenen Einträge.':'Keine ausgeblendeten Einträge.');return;}
  grid.innerHTML='';
  ids.forEach(id=>{const item=store[id];const card=document.createElement('div');card.className='hidden-card';card.innerHTML=(item.poster?`<img class="hidden-card-poster" src="${item.poster}" loading="lazy"/>`:'')+`<div class="hidden-card-body"><div class="hidden-card-title">${esc(item.title||id)}</div></div>`;
  card.style.cursor='pointer';card.title='Klicken zum Einblenden';
  card.addEventListener('click',()=>{delete store[id];settings[mode==='watched'?'watchedItems':'hiddenItems']=mode==='watched'?watchedItems:hiddenItems;autoSave();card.remove();loadSlideshow(key,slideshows[key].mediaType,slideshows[key].tab);if(!Object.keys(store).length)overlay.style.display='none';});
  grid.appendChild(card);});
  overlay.style.display='flex';
  // Außen-Klick schließt
  const closeOut=e=>{if(e.target===overlay){overlay.style.display='none';overlay.removeEventListener('click',closeOut);}};
  overlay.addEventListener('click',closeOut);
  return; // Original-Funktion überschrieben

}
let _hiddenPanelKey="news";

function setupSidebarCrunchyroll(){const toggle=document.getElementById('sidebar-cr-toggle'),cont=document.getElementById('sidebar-cr-content');if(!toggle||!cont)return;toggle.addEventListener('click',()=>{const open=cont.style.display!=='none';cont.style.display=open?'none':'block';toggle.classList.toggle('open',!open);if(!open&&!cont.dataset.loaded){cont.dataset.loaded='1';loadSidebarCR(cont);}});}
async function loadSidebarCR(container){container.innerHTML='<div style="font-size:11px;color:var(--tx3);padding:8px;text-align:center">Lädt…</div>';try{const resp=await window.electronAPI.getUpcoming(1);const anime=(resp.anime||[]).slice(0,10);if(!anime.length){container.innerHTML='<div style="font-size:11px;color:var(--tx3);padding:8px;text-align:center">Keine Daten</div>';return;}container.innerHTML='';anime.forEach(item=>{const title=item.title||item.name||'?';const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';const rd=item.first_air_date||item.release_date||'';const dateStr=rd?new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short'}):'-';const el=document.createElement('div');el.style.cssText='display:flex;align-items:center;gap:7px;padding:5px 6px;border-radius:6px;cursor:pointer;transition:background .14s';el.innerHTML=(poster?`<img src="${poster}" style="width:28px;height:40px;object-fit:cover;border-radius:3px;flex-shrink:0" loading="lazy"/>`:'')+`<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:11px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(title)}</div><div style="font-size:9px;color:var(--acc);font-weight:600;margin-top:1px">📅 ${dateStr}</div></div>`;el.onmouseenter=()=>el.style.background='var(--bgc)';el.onmouseleave=()=>el.style.background='';el.addEventListener('click',()=>showDetailPopup(item.id,'tv',title));container.appendChild(el);});const cta=document.createElement('div');cta.style.cssText='text-align:center;padding:6px;font-size:11px;color:var(--acc);font-weight:600;cursor:pointer;border-top:1px solid var(--bor);margin-top:4px';cta.textContent='▶ Crunchyroll öffnen';cta.addEventListener('click',()=>openProvider('crunchyroll'));container.appendChild(cta);}catch{container.innerHTML='<div style="font-size:11px;color:var(--danger);padding:8px">Fehler</div>';}}

// ════════ WATCHLIST ════════════════════════════════════════════════
// ════════ STATISTIKEN ═════════════════════════════════════════════
async function buildStatsView(){
  const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));
  const content=document.getElementById('stats-content');if(!content)return;
  content.innerHTML='';
  const entries=Object.entries(stats).map(([id,v])=>({id,secs:v?.total||0})).filter(e=>e.secs>0).sort((a,b)=>b.secs-a.secs);
  const days=window._days||['So','Mo','Di','Mi','Do','Fr','Sa'];
  if(!entries.length){content.innerHTML='<div style="color:var(--tx2);font-size:13px;padding:10px 0;text-align:center">Noch keine Stream-Daten.<br>Starte einen Stream um Statistiken zu sammeln.</div>';}
  else{
    // Top 5 mit Animation
    const top=document.createElement('div');top.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:14px">⏱ Meiste Streamzeit</h3>';
    const maxS=entries[0].secs;
    entries.slice(0,5).forEach(({id,secs},i)=>{const p=PROVIDERS()[id];if(!p)return;const hours=(secs/3600).toFixed(1);const pct=Math.round((secs/maxS)*100);const w=document.createElement('div');w.style.cssText='margin-bottom:12px';w.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px;color:var(--tx)"><span style="display:flex;align-items:center;gap:7px"><img src="${getFavicon(id,p)}" style="width:16px;height:16px;border-radius:3px;object-fit:contain" onerror="this.style.display='none'"/>${esc((settings.cardCustomNames||{})[id]||p.name)}</span><span style="color:var(--tx2)">${hours}h</span></div><div style="height:10px;background:var(--bgc);border-radius:999px;overflow:hidden"><div class="stats-bar-fill" data-target="${pct}" style="width:0%;height:100%;border-radius:999px;background:${p.color};transition:width 1s ease ${i*0.15}s"></div></div>`;top.appendChild(w);});
    content.appendChild(top);
    setTimeout(()=>content.querySelectorAll('.stats-bar-fill').forEach(el=>el.style.width=el.dataset.target+'%'),50);
    // Gesamt
    const totalH=(tot(stats)/3600).toFixed(1);const totalDiv=document.createElement('div');totalDiv.style.cssText='margin:16px 0;padding:12px 16px;background:var(--accg);border:1px solid var(--acc);border-radius:var(--r);text-align:center';totalDiv.innerHTML=`<div style="font-family:var(--font-d);font-size:28px;font-weight:800;color:var(--acc)">${totalH}h</div><div style="font-size:12px;color:var(--tx2);margin-top:3px">Gesamt gestreamt</div>`;content.appendChild(totalDiv);
    // Wochentage
    const dayTotals=Array(7).fill(0);entries.forEach(({id})=>{const v=stats[id];if(v?.byDay)v.byDay.forEach((s,i)=>dayTotals[i]+=s);});const maxDay=Math.max(...dayTotals,1);const dw=document.createElement('div');dw.style.cssText='margin-top:20px';dw.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">📅 Wochentage</h3><div style="display:flex;align-items:flex-end;gap:6px;height:80px">';days.forEach((d,i)=>{const pct=Math.round((dayTotals[i]/maxDay)*100);const h=(dayTotals[i]/3600).toFixed(1);dw.innerHTML+=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%"><div style="font-size:9px;color:var(--tx2)">${h}h</div><div class="day-bar-fill" data-target="${pct}" style="width:100%;height:0%;background:var(--acc);border-radius:4px 4px 0 0;transition:height .8s ease ${i*0.1}s;margin-top:auto"></div><div style="font-size:10px;color:var(--tx2)">${d}</div></div>`;});dw.innerHTML+='</div>';content.appendChild(dw);setTimeout(()=>content.querySelectorAll('.day-bar-fill').forEach(el=>el.style.height=el.dataset.target+'%'),100);
  }
  buildAchievementsSection(stats);
}

// ════════ ACHIEVEMENTS ════════════════════════════════════════════
function buildAchievementsSection(stats){
  const el=document.getElementById('achievements-content');if(!el)return;
  const earned=new Set(JSON.parse(localStorage.getItem('achievements_'+activeProfileId)||'[]'));
  el.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:14px">🏆 Achievements</h3>';
  ['stream','provider','special','hidden'].forEach(cat=>{
    const list=ACHIEVEMENTS.filter(a=>a.cat===cat);const label=ACH_CATS[cat][lang]||ACH_CATS[cat].de;
    const sec=document.createElement('div');sec.style.cssText='margin-bottom:18px';sec.innerHTML=`<div style="font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">${label}</div>`;
    const grid=document.createElement('div');grid.style.cssText='display:flex;flex-wrap:wrap;gap:6px';
    if(cat==='hidden'){const done=list.filter(a=>earned.has(a.id));const locked=list.filter(a=>!earned.has(a.id));done.forEach(ach=>{const c=document.createElement('div');c.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);font-size:12px;color:var(--acc)';c.title=achDesc(ach);c.innerHTML=`<span style="font-size:18px">${ach.icon}</span><div><div style="font-weight:600">${esc(achName(ach))}</div><div style="font-size:10px;opacity:.7">${esc(achDesc(ach))}</div></div>`;grid.appendChild(c);});if(locked.length){const hint=document.createElement('div');hint.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);font-size:12px;color:var(--tx3)';hint.innerHTML='🔒 '+locked.length+'× Versteckt – durch Spielen freischalten';grid.appendChild(hint);}}
    else{list.forEach(ach=>{const ok=earned.has(ach.id);const c=document.createElement('div');c.style.cssText=`display:flex;align-items:center;gap:8px;padding:8px 12px;background:${ok?'var(--accg)':'var(--bgc)'};border:1px solid ${ok?'var(--acc)':'var(--bor)'};border-radius:var(--r-sm);font-size:12px;color:${ok?'var(--acc)':'var(--tx2)'};opacity:${ok?1:.55}`;c.title=achDesc(ach);c.innerHTML=`<span style="font-size:18px">${ach.icon}</span><div><div style="font-weight:600;font-size:12px">${esc(achName(ach))}</div><div style="font-size:10px;opacity:.7;max-width:160px;line-height:1.3">${esc(achDesc(ach))}</div></div>`;grid.appendChild(c);});}
    sec.appendChild(grid);el.appendChild(sec);
  });
}
function startAchievementWatcher(){clearInterval(_achWatchInterval);_achWatchInterval=setInterval(async()=>{const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));checkAchievements(false,stats);},30000);}
async function checkAchievements(live=false,statsArg=null){
  const stats=statsArg||await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));
  const meta=JSON.parse(localStorage.getItem('achMeta_'+activeProfileId)||'{}');
  const earned=new Set(JSON.parse(localStorage.getItem('achievements_'+activeProfileId)||'[]'));
  let newOnes=false;
  ACHIEVEMENTS.forEach(ach=>{if(earned.has(ach.id))return;let ok=false;try{ok=ach.check(stats,meta);}catch{}if(ok){earned.add(ach.id);newOnes=true;showNotif('🏆 Achievement!',ach.icon+' '+achName(ach)+': '+achDesc(ach));}});
  if(newOnes){localStorage.setItem('achievements_'+activeProfileId,JSON.stringify([...earned]));if(document.getElementById('view-stats')?.classList.contains('active'))buildStatsView();}
}
function trackMeta(key){try{const k='achMeta_'+activeProfileId;const meta=JSON.parse(localStorage.getItem(k)||'{}');meta[key]=(meta[key]||0)+1;if(key==='stream'&&new Date().getHours()<4)meta.midnightStreams=(meta.midnightStreams||0)+1;localStorage.setItem(k,JSON.stringify(meta));}catch{}}

// ════════ UHR ══════════════════════════════════════════════════════
function setupClock(){
  clearInterval(_clockInt);const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};widget.style.display='block';widget.style.left=pos.x+'px';widget.style.top=pos.y+'px';widget.style.right='auto';widget.style.bottom='auto';widget.style.color=clk.color||'#ff3b30';widget.style.fontSize=(clk.size||22)+'px';widget.style.opacity=String(1-(clk.opacity??0.5));
  const showSecs=!!clk.showSeconds;
  if(clk.type==='analog'){function drawA(){const n=new Date(),h=n.getHours()%12,m=n.getMinutes(),s=n.getSeconds();const sz=Math.max(clk.size||22,18),r=sz*1.8;const ha=((h+m/60)/12)*Math.PI*2-Math.PI/2,ma=(m/60)*Math.PI*2-Math.PI/2,sa=(s/60)*Math.PI*2-Math.PI/2;const c=clk.color||'#ff3b30';timeEl.innerHTML=`<svg width="${r*2}" height="${r*2}" viewBox="0 0 ${r*2} ${r*2}" style="display:block"><circle cx="${r}" cy="${r}" r="${r-2}" fill="none" stroke="${c}" stroke-width="1.5" opacity=".4"/><line x1="${r}" y1="${r}" x2="${r+Math.cos(ha)*r*.55}" y2="${r+Math.sin(ha)*r*.55}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="${r}" y1="${r}" x2="${r+Math.cos(ma)*r*.8}" y2="${r+Math.sin(ma)*r*.8}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>${showSecs?`<line x1="${r}" y1="${r}" x2="${r+Math.cos(sa)*r*.85}" y2="${r+Math.sin(sa)*r*.85}" stroke="${c}" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`:''}''<circle cx="${r}" cy="${r}" r="2" fill="${c}"/></svg>`;} drawA();_clockInt=setInterval(drawA,showSecs?1000:10000);}
  else{function tick(){timeEl.textContent=pad(new Date().getHours())+':'+pad(new Date().getMinutes())+(showSecs?':'+pad(new Date().getSeconds()):'');}tick();_clockInt=setInterval(tick,1000);}
}

function setupClockContextMenu(){
  const widget=document.getElementById('clock-widget'),ctx=document.getElementById('clock-ctx-menu');if(!widget||!ctx)return;
  widget.addEventListener('contextmenu',e=>{
    e.preventDefault();e.stopPropagation();
    // Vor der Uhr erscheinen – korrekte Z-Index Positionierung
    const x=e.clientX,y=e.clientY;
    ctx.style.display='block';ctx.style.zIndex='9100';
    const ch=ctx.offsetHeight||100;
    ctx.style.left=x+'px';ctx.style.top=Math.max(0,y-ch)+'px';
    const secBtn=document.getElementById('clock-ctx-seconds');if(secBtn)secBtn.textContent=settings.clock?.showSeconds?'Sekunden ausblenden':'Sekunden anzeigen';
  });
  document.addEventListener('click',e=>{if(!ctx.contains(e.target))ctx.style.display='none';});
  document.getElementById('clock-ctx-disable')?.addEventListener('click',()=>{settings.clock.enabled=false;autoSave();setupClock();ctx.style.display='none';});
  document.getElementById('clock-ctx-seconds')?.addEventListener('click',()=>{settings.clock.showSeconds=!settings.clock.showSeconds;autoSave();setupClock();ctx.style.display='none';const el=document.getElementById('clock-show-seconds');if(el)el.checked=settings.clock.showSeconds;});
}

function enableClockDrag(on){
  clockDraggable=on;const widget=document.getElementById('clock-widget');if(!widget)return;
  widget.style.cursor=on?'move':'default';
  if(widget._dragOff){widget._dragOff();widget._dragOff=null;}
  if(!on)return;
  let drag=false,ox=0,oy=0;
  const md=e=>{drag=true;const r=widget.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();};
  const mm=e=>{if(!drag)return;widget.style.left=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox))+'px';widget.style.top=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy))+'px';widget.style.right='auto';widget.style.bottom='auto';};
  const mu=()=>{if(!drag)return;drag=false;const r=widget.getBoundingClientRect();settings.clock.position={x:Math.round(r.left),y:Math.round(r.top)};autoSave();};
  widget.addEventListener('mousedown',md);document.addEventListener('mousemove',mm);document.addEventListener('mouseup',mu);
  widget._dragOff=()=>{widget.removeEventListener('mousedown',md);document.removeEventListener('mousemove',mm);document.removeEventListener('mouseup',mu);};
}


// ════════ PROFILE MANAGER
function openProfileManager(){
  const overlay=document.getElementById('profile-manager-overlay');const list=document.getElementById('pm-list');if(!list||!overlay)return;
  list.innerHTML='';
  profiles.forEach(p=>{const item=document.createElement('div');item.style.cssText=`display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid ${p.id===activeProfileId?'var(--acc)':'var(--bor)'};border-radius:var(--r-sm);cursor:pointer;background:${p.id===activeProfileId?'var(--accg)':'var(--bgc)'};transition:all .15s;margin-bottom:8px`;item.innerHTML=`<div style="width:36px;height:36px;border-radius:50%;background:var(--bgch);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;flex-shrink:0">${p.avatar?`<img src="${p.avatar}" style="width:36px;height:36px;object-fit:cover"/>`:'👤'}</div><div style="flex:1"><div style="font-weight:700;color:var(--tx)">${esc(p.name)}</div>${p.pin?'<div style="font-size:10px;color:var(--tx3)">🔒 PIN-geschützt</div>':''}</div>${p.id===activeProfileId?'<span style="font-size:11px;color:var(--acc);font-weight:700">Aktiv</span>':''}<button style="border:1px solid var(--bor);background:transparent;color:var(--tx2);padding:4px 8px;border-radius:var(--r-sm);font-size:11px;cursor:pointer">✏️</button>`;
  item.querySelector('button').addEventListener('click',e=>{e.stopPropagation();document.getElementById('profile-manager-overlay').style.display='none';openProfileEditor(p.id);});
  item.addEventListener('click',e=>{if(e.target.closest('button'))return;if(p.id===activeProfileId){document.getElementById('profile-manager-overlay').style.display='none';return;}if(p.pin){document.getElementById('profile-manager-overlay').style.display='none';showPinPrompt(p);}else{document.getElementById('profile-manager-overlay').style.display='none';switchProfile(p.id);}});
  list.appendChild(item);});
  overlay.style.display='flex';
}
function showPinPrompt(p){const pin=prompt(`PIN für "${p.name}":`);if(pin===null)return;if(String(pin)===String(p.pin))switchProfile(p.id);else showToastMsg('Falscher PIN');}
function openProfileEditor(id){const p=id?profiles.find(pr=>pr.id===id):null;window._pedId=id;window._pedAvatar=undefined;window._pedPin=undefined;document.getElementById('ped-title').textContent=p?'Profil bearbeiten':'Neues Profil';document.getElementById('ped-name').value=p?.name||'';document.getElementById('ped-avatar-preview').innerHTML=p?.avatar?`<img src="${p.avatar}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`:'👤';document.getElementById('ped-delete').style.display=p?'flex':'none';document.getElementById('profile-editor-overlay').style.display='flex';}
function saveProfileEditor(){const name=(document.getElementById('ped-name').value||'').trim()||'User';if(window._pedId){const p=profiles.find(pr=>pr.id===window._pedId);if(p){p.name=name;if(window._pedAvatar!==undefined)p.avatar=window._pedAvatar;if(window._pedPin!==undefined)p.pin=window._pedPin||null;}}else{const id='profile_'+Date.now();profiles.push({id,name,avatar:window._pedAvatar||null,pin:window._pedPin||null,favorites:[],watchlist:[],searchHistory:[]});}window.electronAPI.setProfiles(profiles);document.getElementById('profile-editor-overlay').style.display='none';buildSidebarProfile();showSaveToast();}
function deleteProfileEditor(){if(!window._pedId||profiles.length<=1){showToastMsg('Mindestens 1 Profil nötig');return;}if(!confirm('Profil löschen?'))return;profiles=profiles.filter(p=>p.id!==window._pedId);window.electronAPI.setProfiles(profiles);document.getElementById('profile-editor-overlay').style.display='none';if(activeProfileId===window._pedId)switchProfile(profiles[0].id);else buildSidebarProfile();}
// ════════ SETTINGS PANEL ══════════════════════════════════════════
function setupSettingsPanel(){
  document.getElementById('btn-settings')?.addEventListener('click',openSettings);
  document.getElementById('settings-close')?.addEventListener('click',closeSettings);
  document.getElementById('settings-overlay')?.addEventListener('click',closeSettings);
  document.getElementById('btn-add-profile')?.addEventListener('click',()=>{document.getElementById('profile-modal').style.display='flex';document.getElementById('new-profile-name').focus();});
  // Profile Modal
  document.getElementById('btn-create-profile')?.addEventListener('click',()=>{const name=document.getElementById('new-profile-name').value.trim();if(!name)return;const id='profile_'+Date.now();profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});window.electronAPI.setProfiles(profiles);document.getElementById('profile-modal').style.display='none';buildSidebarProfile();switchProfile(id,true);/* Punkt 1: sofort auswählen */});
  document.getElementById('btn-cancel-profile')?.addEventListener('click',()=>document.getElementById('profile-modal').style.display='none');
  // Tabs
  document.querySelectorAll('.sms-btn[data-stab]').forEach(tab=>{tab.addEventListener('click',()=>{document.querySelectorAll('.sms-btn').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));tab.classList.add('active');document.getElementById('smt-'+tab.dataset.stab)?.classList.add('active');if(tab.dataset.stab==='account')buildSettingsAccountTab();if(tab.dataset.stab==='advanced')buildAdvancedTab();// Uhr-Drag nur im clock-Tab
  enableClockDrag(tab.dataset.stab==='clock');});});
  // Design
  lnkColor('set-accent-color','set-accent-text');
  document.getElementById('set-accent-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){settings.accentColor=e.target.value;applyAccent(e.target.value);autoSave();}});
  document.getElementById('set-accent-color')?.addEventListener('input',e=>{settings.accentColor=e.target.value;applyAccent(e.target.value);document.getElementById('set-accent-text').value=e.target.value;autoSave();});
  document.getElementById('reset-accent')?.addEventListener('click',()=>{settings.accentColor='#30c5bb';applyAccent('#30c5bb');['set-accent-color','set-accent-text'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='#30c5bb';});autoSave();});
  document.getElementById('font-family-select')?.addEventListener('change',e=>{settings.designOptions.fontFamily=e.target.value;applyFontFamily(e.target.value);autoSave();});
  document.getElementById('font-size-range')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('font-size-val').textContent=v+'px';settings.fontSize=v;applyFontSize(v);autoSave();});
  document.getElementById('card-radius')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('card-radius-val').textContent=v+'px';settings.designOptions.cardRadius=v;applyDesignOptions(settings.designOptions);autoSave();});
  document.getElementById('sidebar-width')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('sidebar-width-val').textContent=v+'px';settings.designOptions.sidebarWidth=v;applyDesignOptions(settings.designOptions);autoSave();});
  document.getElementById('glass-toggle')?.addEventListener('change',e=>{settings.designOptions.glass=e.target.checked;applyDesignOptions(settings.designOptions);autoSave();});
  document.getElementById('pick-bg-image')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('appBg');if(r){const url=r.base64||r.filePath||r;settings.appBgImage=url;applyBgImage(url);autoSave();}});
  document.getElementById('reset-bg-image')?.addEventListener('click',()=>{settings.appBgImage='';applyBgImage('');autoSave();});
  // Partikel
  document.getElementById('particles-toggle')?.addEventListener('change',e=>{settings.particlesEnabled=e.target.checked;document.getElementById('particles-options-section').style.display=e.target.checked?'flex':'none';setupParticles();autoSave();});
  ['particle-count','particle-size','particle-speed'].forEach(id=>{document.getElementById(id)?.addEventListener('input',e=>{const v=parseFloat(e.target.value);document.getElementById(id+'-val').textContent=v;settings.particlesConfig=settings.particlesConfig||{};settings.particlesConfig[id.replace('particle-','')]=v;setupParticles();autoSave();});});
  lnkColor('particle-color','particle-color-text');
  document.getElementById('particle-color')?.addEventListener('input',e=>{if(!settings.particlesConfig)settings.particlesConfig={};settings.particlesConfig.color=e.target.value;document.getElementById('particle-color-text').value=e.target.value;setupParticles();autoSave();});
  document.getElementById('particle-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){if(!settings.particlesConfig)settings.particlesConfig={};settings.particlesConfig.color=e.target.value;setupParticles();autoSave();}});
  document.querySelectorAll('.particle-shape-btn').forEach(btn=>{btn.addEventListener('click',()=>{btn.classList.toggle('active');settings.particlesConfig=settings.particlesConfig||{};settings.particlesConfig.shapes=[...document.querySelectorAll('.particle-shape-btn.active')].map(b=>b.dataset.shape);if(!settings.particlesConfig.shapes.length){btn.classList.add('active');settings.particlesConfig.shapes=[btn.dataset.shape];}setupParticles();autoSave();});});
  // Sprache
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>{settings.language=btn.dataset.lang;applyLanguage(btn.dataset.lang);autoSave();}));
  // Clock
  document.getElementById('clock-enabled')?.addEventListener('change',e=>{settings.clock.enabled=e.target.checked;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=e.target.checked?'Aktiviert':'Deaktiviert';autoSave();setupClock();});
  document.getElementById('clock-opacity')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('clock-opacity-val').textContent=v+'%';settings.clock.opacity=v/100;if(v>=100){settings.clock.enabled=false;const ce=document.getElementById('clock-enabled');if(ce)ce.checked=false;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Deaktiviert';}else if(!settings.clock.enabled){settings.clock.enabled=true;const ce=document.getElementById('clock-enabled');if(ce)ce.checked=true;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Aktiviert';}autoSave();setupClock();});
  document.getElementById('clock-size')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('clock-size-val').textContent=v+'px';settings.clock.size=v;autoSave();setupClock();});
  lnkColor('clock-color','clock-color-text');
  document.getElementById('clock-color')?.addEventListener('input',e=>{settings.clock.color=e.target.value;document.getElementById('clock-color-text').value=e.target.value;autoSave();setupClock();});
  document.getElementById('clock-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){settings.clock.color=e.target.value;autoSave();setupClock();}});
  document.getElementById('clock-show-seconds')?.addEventListener('change',e=>{settings.clock.showSeconds=e.target.checked;autoSave();setupClock();});
  document.querySelectorAll('.clock-type-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.clock-type-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');settings.clock.type=btn.dataset.clockType;settings.clock.enabled=true;const ce=document.getElementById('clock-enabled');if(ce)ce.checked=true;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Aktiviert';autoSave();setupClock();}));
  document.getElementById('reset-clock-opacity')?.addEventListener('click',()=>{settings.clock.opacity=0.5;const co=document.getElementById('clock-opacity');if(co)co.value=50;const cv=document.getElementById('clock-opacity-val');if(cv)cv.textContent='50%';autoSave();setupClock();});
  document.getElementById('reset-clock-size')?.addEventListener('click',()=>{settings.clock.size=22;const cs=document.getElementById('clock-size');if(cs)cs.value=22;const csv=document.getElementById('clock-size-val');if(csv)csv.textContent='22px';autoSave();setupClock();});
  // Account
  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{if(!confirm('Von allen Diensten abmelden?'))return;window.electronAPI.clearAllSessions(activeProfileId);showSaveToast();});
  document.getElementById('btn-google-auth')?.addEventListener('click',()=>{window.electronAPI.openGoogleAuthBrowser(activeProfileId);const h=document.getElementById('google-auth-hint');if(h){h.style.display='block';setTimeout(()=>h.style.display='none',30000);}});
  // Profile
  document.getElementById('btn-rename-profile')?.addEventListener('click',()=>{const name=prompt('Neuer Name:',profiles.find(p=>p.id===activeProfileId)?.name||'');if(name){const p=profiles.find(p=>p.id===activeProfileId);if(p){p.name=name;window.electronAPI.setProfiles(profiles);buildSidebarProfile();}}});
  document.getElementById('btn-delete-profile')?.addEventListener('click',()=>{if(profiles.length<=1){showToastMsg('Mindestens ein Profil benötigt.');return;}const cur=profiles.find(p=>p.id===activeProfileId);document.getElementById('delete-profile-text').textContent='Profil "'+cur?.name+'" löschen?';document.getElementById('delete-profile-modal').style.display='flex';});
  document.getElementById('btn-confirm-delete-profile')?.addEventListener('click',()=>{window.electronAPI.clearAllSessions(activeProfileId);profiles=profiles.filter(p=>p.id!==activeProfileId);window.electronAPI.setProfiles(profiles);document.getElementById('delete-profile-modal').style.display='none';switchProfile(profiles[0].id);buildSidebarProfile();});
  document.getElementById('btn-cancel-delete-profile')?.addEventListener('click',()=>document.getElementById('delete-profile-modal').style.display='none');
  // Advanced
  document.getElementById('btn-check-updates')?.addEventListener('click',async()=>{const el=document.getElementById('update-check-result');if(el){el.textContent='Prüfe…';el.style.color='var(--tx2)';}await window.electronAPI.checkForUpdates();});
  document.getElementById('btn-restore-providers')?.addEventListener('click',()=>{settings.deletedProviders=[];settings.customProviders={};customProviders={};providerOrder=[];settings.providerOrder=[];autoSave();buildProviderGrid();showToastMsg('Standardanbieter wiederhergestellt.');});
  document.getElementById('btn-restore-single-open')?.addEventListener('click',()=>{const list=document.getElementById('restore-single-list');if(!list)return;const deleted=settings.deletedProviders||[];if(!deleted.length){showToastMsg('Keine gelöschten Anbieter.');return;}list.style.display=list.style.display==='none'?'block':'none';list.innerHTML='';deleted.forEach(id=>{const p=PROVIDERS_BASE[id];if(!p)return;const btn=document.createElement('button');btn.className='pick-btn';btn.style.cssText='width:100%;text-align:left;margin-bottom:4px;cursor:pointer';btn.textContent='↺ '+p.name;btn.addEventListener('click',()=>{settings.deletedProviders=(settings.deletedProviders||[]).filter(d=>d!==id);autoSave();buildProviderGrid();btn.remove();showToastMsg(p.name+' wiederhergestellt.');});list.appendChild(btn);});});
  // VPN
  // btn-check-vpn → in buildAdvancedTab  document.getElementById('btn-nordvpn')?.addEventListener('click',()=>window.electronAPI.openExternal('https://nordvpn.com/'));
  // Verlauf löschen (Mehr)
  document.getElementById('btn-clear-history-all')?.addEventListener('click',()=>{if(!confirm('Gesamten Verlauf löschen?'))return;viewHistory=[];settings.viewHistory=[];autoSave();showToastMsg('Verlauf gelöscht.');});
  // Widevine
  document.getElementById('widevine-dl-link')?.addEventListener('click',e=>{e.preventDefault();window.electronAPI.openExternal('https://github.com/nicehash/electron-widevinecdm');});
  syncSettingsUI();
}

function openSettings(){document.getElementById('settings-panel')?.classList.add('open');document.getElementById('settings-overlay')?.classList.add('open');buildSettingsAccountTab();buildAdvancedTab();syncSettingsUI();trackMeta('settingsOpens');}
function closeSettings(){enableClockDrag(false);document.getElementById('settings-panel')?.classList.remove('open');document.getElementById('settings-overlay')?.classList.remove('open');window.electronAPI.setSettings(settings);showSaveToast();/* Punkt 5: Toast nur beim Schließen */}

function lnkColor(cId,tId){const c=document.getElementById(cId),t=document.getElementById(tId);if(!c||!t)return;c.addEventListener('input',()=>t.value=c.value);t.addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test(t.value))c.value=t.value;});}

function syncSettingsUI(){
  const acc=settings.accentColor||'#30c5bb';['set-accent-color','set-accent-text'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=acc;});
  const fsr=document.getElementById('font-size-range');if(fsr)fsr.value=settings.fontSize||14;const fsv=document.getElementById('font-size-val');if(fsv)fsv.textContent=(settings.fontSize||14)+'px';
  const ffs=document.getElementById('font-family-select');if(ffs)ffs.value=settings.designOptions?.fontFamily||'DM Sans';
  const pt=document.getElementById('particles-toggle');if(pt){pt.checked=!!settings.particlesEnabled;const sec=document.getElementById('particles-options-section');if(sec)sec.style.display=settings.particlesEnabled?'flex':'none';}
  const cfg=settings.particlesConfig||{};[['particle-count',cfg.count||80],['particle-size',cfg.size||1.5],['particle-speed',cfg.speed||1]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v;const elv=document.getElementById(id+'-val');if(elv)elv.textContent=v;});
  const pcol=document.getElementById('particle-color'),pcolT=document.getElementById('particle-color-text');if(pcol)pcol.value=cfg.color||'#30c5bb';if(pcolT)pcolT.value=cfg.color||'#30c5bb';
  document.querySelectorAll('.particle-shape-btn').forEach(b=>b.classList.toggle('active',(cfg.shapes||['circle']).includes(b.dataset.shape)));
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===(settings.language||'de')));
  const clk=settings.clock||{};
  const ce=document.getElementById('clock-enabled');if(ce)ce.checked=!!clk.enabled;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const col=clk.color||'#ff3b30';['clock-color','clock-color-text'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=col;});
  const opPct=Math.round((clk.opacity??0.5)*100);const co=document.getElementById('clock-opacity');if(co)co.value=opPct;const cv=document.getElementById('clock-opacity-val');if(cv)cv.textContent=opPct+'%';
  const sz=clk.size||22;const cs=document.getElementById('clock-size');if(cs)cs.value=sz;const csv=document.getElementById('clock-size-val');if(csv)csv.textContent=sz+'px';
  document.querySelectorAll('.clock-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.clockType===(clk.type||'digital')));
  const sec=document.getElementById('clock-show-seconds');if(sec)sec.checked=!!clk.showSeconds;
  const opts=settings.designOptions||{};const cr=document.getElementById('card-radius');if(cr)cr.value=opts.cardRadius||14;const crv=document.getElementById('card-radius-val');if(crv)crv.textContent=(opts.cardRadius||14)+'px';const sw=document.getElementById('sidebar-width');if(sw)sw.value=opts.sidebarWidth||200;const swv=document.getElementById('sidebar-width-val');if(swv)swv.textContent=(opts.sidebarWidth||200)+'px';const gt=document.getElementById('glass-toggle');if(gt)gt.checked=!!opts.glass;
  updateSortBtn();
}

// ════════ ACCOUNT TAB ══════════════════════════════════════════════
async function buildSettingsAccountTab(){const list=document.getElementById('session-list');if(!list)return;list.innerHTML='<div style="font-size:13px;color:var(--tx2);padding:8px 0">Wird geprüft…</div>';const result=await window.electronAPI.getAllSessions(activeProfileId).catch(()=>({}));sessionCache=result;renderSessionList(result);}
function renderSessionList(res){
  const list=document.getElementById('session-list');if(!list)return;list.innerHTML='';
  if(!window._logoutPending)window._logoutPending=new Set();const pending=window._logoutPending;
  const sorted=Object.entries(PROVIDERS_BASE).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const on=sorted.filter(([id])=>!!res[id]),off=sorted.filter(([id])=>!res[id]);
  function makeItem(id,p,isOn){const item=document.createElement('div');item.style.cssText='display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--bor)';const dot=`<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${isOn?'#66bb6a':'var(--tx3)'}"></span>`;const cb=`<input type="checkbox" class="session-cb" data-id="${id}" ${pending.has(id)?'checked':''} style="cursor:pointer;accent-color:var(--acc)"/>`;item.innerHTML=dot+cb+`<span style="flex:1;font-size:13px;color:var(--tx)">${esc((settings.cardCustomNames||{})[id]||p.name)}</span>${isOn?'<span style="font-size:11px;color:var(--acc)">✓</span>':''}`;item.querySelector('.session-cb')?.addEventListener('change',e=>{if(e.target.checked)pending.add(id);else pending.delete(id);const btn=document.getElementById('btn-logout-selected');if(btn)btn.style.display=pending.size?'flex':'none';});return item;}
  if(on.length){const lbl=document.createElement('div');lbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.1em;padding:8px 0 4px';lbl.textContent='Angemeldet';list.appendChild(lbl);on.forEach(([id,p])=>list.appendChild(makeItem(id,p,true)));}
  if(off.length){const lbl=document.createElement('div');lbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.1em;padding:8px 0 4px;margin-top:8px';lbl.textContent='Nicht angemeldet';list.appendChild(lbl);off.forEach(([id,p])=>list.appendChild(makeItem(id,p,false)));}
  let btn=document.getElementById('btn-logout-selected');if(!btn){btn=document.createElement('button');btn.id='btn-logout-selected';btn.className='settings-danger-btn';btn.style.cssText='display:none;margin-top:10px';btn.textContent='Von Auswahl abmelden';btn.addEventListener('click',()=>{if(!pending.size)return;showLogoutConfirmModal([...pending]);});list.after(btn);}btn.style.display=pending.size?'flex':'none';
}
function showLogoutConfirmModal(ids){
  const names=ids.map(id=>(settings.cardCustomNames||{})[id]||PROVIDERS_BASE[id]?.name||id).join(', ');
  let modal=document.getElementById('logout-confirm-modal');
  if(!modal){modal=document.createElement('div');modal.id='logout-confirm-modal';modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:center;justify-content:center';modal.innerHTML='<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:24px;max-width:380px;width:90%;text-align:center"><div style="font-size:32px;margin-bottom:12px">🔒</div><h3 style="font-family:var(--font-d);font-size:16px;font-weight:700;color:var(--tx);margin-bottom:8px">Abmelden</h3><p id="logout-confirm-text" style="font-size:13px;color:var(--tx2);margin-bottom:16px;line-height:1.5"></p><div style="display:flex;gap:8px;justify-content:center"><button id="logout-confirm-ok" style="padding:10px 24px;background:var(--danger);color:#fff;border:none;border-radius:var(--r-sm);cursor:pointer;font-size:13px;font-weight:600">Abmelden</button><button id="logout-confirm-cancel" style="padding:10px 20px;background:var(--bgc);color:var(--tx);border:1px solid var(--bor);border-radius:var(--r-sm);cursor:pointer;font-size:13px">Abbrechen</button></div></div>';document.body.appendChild(modal);}
  document.getElementById('logout-confirm-text').textContent='Von folgenden Diensten abmelden?\n'+names;modal.style.display='flex';
  document.getElementById('logout-confirm-ok').onclick=()=>{window.electronAPI.clearProvidersSessions(activeProfileId,ids);window._logoutPending=new Set();modal.style.display='none';setTimeout(()=>buildSettingsAccountTab(),500);};
  document.getElementById('logout-confirm-cancel').onclick=()=>modal.style.display='none';
}

// ════════ ADVANCED TAB ═════════════════════════════════════════════
async function buildAdvancedTab(){buildCustomProvidersList();checkWidevineStatus();}
function buildCustomProvidersList(){const list=document.getElementById('custom-providers-list');if(!list)return;list.innerHTML='';const custom=customProviders||{};if(!Object.keys(custom).length){list.innerHTML='<div style="font-size:12px;color:var(--tx3)">Keine eigenen Anbieter</div>';return;}Object.entries(custom).forEach(([id,p])=>{const item=document.createElement('div');item.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bor);font-size:13px;color:var(--tx)';item.innerHTML=`<span style="flex:1">${esc(p.name)}</span><button class="settings-danger-btn" style="width:auto;padding:4px 10px;font-size:11px">✕</button>`;item.querySelector('button').addEventListener('click',()=>{delete customProviders[id];settings.customProviders=customProviders;autoSave();buildProviderGrid();buildCustomProvidersList();});list.appendChild(item);});}
async function checkWidevineStatus(){const el=document.getElementById('widevine-status');if(!el)return;const s=await window.electronAPI.getWidevineStatus().catch(()=>null);if(s?.installed)el.innerHTML=`<span style="color:var(--acc)">✓ CDM installiert: <code style="font-size:10px">${s.path}</code></span>`;else el.innerHTML=`<span style="color:var(--tx3)">✗ Nicht gefunden. Ablegen unter: <code style="font-size:10px">${s?.cdmDir||'AppData/Roaming/OmniSight/WidevineCdm'}</code></span>`;}

// ════════ PLUGINS ══════════════════════════════════════════════════
function setupPluginsTab(){buildPluginPresets('');document.getElementById('plugin-search')?.addEventListener('input',e=>buildPluginPresets(e.target.value));}
function buildPluginPresets(filter){const container=document.getElementById('plugin-presets-list');if(!container)return;const filtered=PLUGIN_PRESETS.filter(p=>!filter||p.name.toLowerCase().includes(filter.toLowerCase())||p.desc.toLowerCase().includes(filter.toLowerCase()));container.innerHTML='';filtered.forEach(preset=>{const isInst=installedPlugins.has(preset.id);const div=document.createElement('div');div.className='plugin-preset';div.innerHTML=`<div class="plugin-preset-info"><div class="plugin-preset-name">${esc(preset.name)}</div><div class="plugin-preset-desc">${esc(preset.desc)}</div></div>`;let btn;if(preset.note){btn=document.createElement('button');btn.className='plugin-preset-btn info';btn.textContent='Info';btn.addEventListener('click',()=>showToastMsg(preset.note));}else if(isInst){btn=document.createElement('button');btn.className='plugin-preset-btn remove';btn.textContent='Deinstallieren';btn.addEventListener('click',()=>{installedPlugins.delete(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));delete pluginDomainStore[preset.id];rebuildPluginDomains();buildPluginPresets(filter);});}else{btn=document.createElement('button');btn.className='plugin-preset-btn install';btn.textContent='Installieren';btn.addEventListener('click',async()=>{btn.textContent='Lädt…';btn.disabled=true;const r=await window.electronAPI.fetchAdblockList(preset.url);if(r.ok){pluginDomainStore[preset.id]=r.domains;rebuildPluginDomains();installedPlugins.add(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));buildPluginPresets(filter);}else{btn.textContent='Fehler';btn.disabled=false;}});}div.appendChild(btn);container.appendChild(div);});}
function rebuildPluginDomains(){const all=[...new Set(Object.values(pluginDomainStore).flat())];window.electronAPI.applyExtraAdDomains(all);const el=document.getElementById('plugin-domain-count');if(el)el.textContent=all.length;}

// ════════ TITLEBAR ═════════════════════════════════════════════════
function updateTitlebarProfile(){
  const p=profiles.find(pr=>pr.id===activeProfileId)||{name:'User'};
  const el=document.getElementById('titlebar-profile-indicator');
  if(el)el.innerHTML=p.avatar?`<img src="${p.avatar}" style="width:18px;height:18px;border-radius:50%;object-fit:cover"/>`:`<span style="font-size:11px;font-weight:700;color:var(--acc)">${(p.name||'U').charAt(0).toUpperCase()}</span>`;
}
function setupTitlebar(){document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());document.getElementById('btn-close')?.addEventListener('click',()=>window.electronAPI.close());document.getElementById('btn-shortcuts-hint')?.addEventListener('click',()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true}));});}

// ════════ START ════════════════════════════════════════════════════
// ════════ PERSISTENTE NOTIFICATIONS LADEN ═════════════════════════
async function loadPersistedNotifications(){
  try{
    const saved=await window.electronAPI.getNotifications(activeProfileId);
    if(Array.isArray(saved)&&saved.length){notifications=saved;renderNotifications();updateNotifBadge();}
  }catch{}
}

// ════════ WATCHLIST SORTIERUNG (erweitert) ════════════════════════
function buildWatchlistSorted(cat){
  const catArg=cat||document.querySelector('.wl-cat-btn.active')?.dataset.cat||'all';
  const sortVal=document.getElementById('wl-sort')?.value||'alpha';
  const content=document.getElementById('watchlist-content');if(!content)return;
  let items=watchlist.filter(i=>catArg==='all'||i.mediaType===catArg||(!i.mediaType&&catArg==='movie'));
  switch(sortVal){
    case 'alpha':   items=[...items].sort((a,b)=>a.title.localeCompare(b.title));break;
    case 'date-asc':items=[...items].sort((a,b)=>(a.releaseDate||'').localeCompare(b.releaseDate||''));break;
    case 'date-desc':items=[...items].sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||''));break;
    case 'added':   /* bereits in Reihenfolge der watchlist-Array (neuste zuerst) */ break;
  }
  content.innerHTML='';
  if(!items.length){content.innerHTML='<div style="text-align:center;padding:40px;color:var(--tx2)">Noch nichts gemerkt.<br>Klicke auf 🔖 bei Filmen oder Serien.</div>';return;}
  const grid=document.createElement('div');grid.className='watchlist-grid';
  items.forEach(item=>{
    const card=document.createElement('div');card.className='wl-card';
    const poster=item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy" onerror="this.style.display='none'"/>`:' <div class="wl-card-poster-ph">🎬</div>';
    const dateStr=item.releaseDate?new Date(item.releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${item.title||''}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}</div><button class="wl-card-remove">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();watchlist=watchlist.filter(w=>w.id!==item.id);settings.watchlist=watchlist;autoSave();card.style.transition='all .25s';card.style.opacity='0';card.style.transform='scale(.9)';setTimeout(()=>buildWatchlistSorted(catArg),260);});
    card.addEventListener('contextmenu',e=>{e.preventDefault();document.querySelectorAll('.wl-ctx-menu').forEach(m=>m.remove());const menu=document.createElement('div');menu.className='wl-ctx-menu';menu.style.cssText=`position:fixed;left:${Math.min(e.clientX,window.innerWidth-180)}px;top:${Math.min(e.clientY,window.innerHeight-120)}px;background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r-sm);z-index:3000;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5);padding:4px 0`;[{v:'movie',l:'🎬 Film'},{v:'tv',l:'📺 Serie'},{v:'anime',l:'⛩️ Anime'}].forEach(c=>{const btn=document.createElement('button');btn.style.cssText='display:block;width:100%;padding:8px 14px;border:none;background:transparent;color:var(--tx);font-size:13px;cursor:pointer;text-align:left';btn.textContent=(c.v===item.mediaType?'✓ ':'')+c.l;btn.onmouseenter=()=>btn.style.background='var(--bgch)';btn.onmouseleave=()=>btn.style.background='transparent';btn.addEventListener('click',()=>{const idx=watchlist.findIndex(w=>w.id===item.id);if(idx>-1){watchlist[idx].mediaType=c.v;settings.watchlist=watchlist;autoSave();}menu.remove();buildWatchlist(catArg);});menu.appendChild(btn);});document.body.appendChild(menu);setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),10);});
    card.addEventListener('click',async()=>{await showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title);const check=setInterval(()=>{if(document.getElementById('detail-overlay').style.display==='none'){clearInterval(check);if(!watchlist.find(w=>w.id===item.id))buildWatchlistSorted(catArg);}},300);});
    grid.appendChild(card);
  });
  content.appendChild(grid);
}
// Globale buildWatchlist überschreiben
window.buildWatchlist=buildWatchlistSorted;

// ════════ ZULETZT GEÖFFNET (Home-Bereich) ════════════════════════
function buildRecentlyOpened(){
  const grid=document.getElementById('providers-grid');if(!grid)return;
  const recent=viewHistory.slice(0,4).filter(h=>PROVIDERS()[h.id]);
  if(!recent.length)return;
  const existing=document.getElementById('recently-opened-section');if(existing)existing.remove();
  const section=document.createElement('div');section.id='recently-opened-section';section.style.cssText='grid-column:1/-1;margin-bottom:4px';
  section.innerHTML=`<div class="grid-section-label" style="margin-bottom:10px">🕐 Zuletzt geöffnet</div><div style="display:flex;gap:10px;flex-wrap:wrap">
    ${recent.map(h=>{const p=PROVIDERS()[h.id];const name=(settings.cardCustomNames||{})[h.id]||p?.name||h.id;return`<button class="recent-chip" data-id="${h.id}" style="display:flex;align-items:center;gap:7px;padding:6px 12px 6px 8px;background:var(--bgc);border:1px solid var(--bor);border-radius:999px;cursor:pointer;color:var(--tx2);font-size:calc(var(--fs) - 2px);font-weight:500;transition:all .15s"><img src="${getFavicon(h.id,p)}" style="width:16px;height:16px;border-radius:50%;object-fit:contain;background:${p?.color||'#333'}22" onerror="this.style.display='none'"/>${name}</button>`;}).join('')}
  </div>`;
  section.querySelectorAll('.recent-chip').forEach(btn=>btn.addEventListener('click',()=>openProvider(btn.dataset.id)));
  section.querySelectorAll('.recent-chip').forEach(btn=>{btn.onmouseenter=()=>{btn.style.borderColor='var(--acc)';btn.style.color='var(--tx)';};btn.onmouseleave=()=>{btn.style.borderColor='var(--bor)';btn.style.color='var(--tx2)';};});
  grid.prepend(section);
}

// ════════ ONBOARDING ═════════════════════════════════════════════
let obStep=1;const OB_TOTAL=5;

function showOnboarding(force=false){
  if(!force&&settings.onboardingDone)return;
  obStep=1;
  const overlay=document.getElementById('onboarding-overlay');if(!overlay)return;
  overlay.style.display='flex';
  buildObDots();updateObStep();
}

function buildObDots(){
  const dots=document.getElementById('ob-dots');if(!dots)return;
  dots.innerHTML='';
  for(let i=1;i<=OB_TOTAL;i++){const d=document.createElement('button');d.className='ob-dot'+(i===obStep?' active':'');d.style.cssText=`width:${i===obStep?'18px':'7px'};height:7px;border-radius:999px;border:none;background:${i===obStep?'var(--acc)':'rgba(255,255,255,.3)'};cursor:pointer;transition:all .3s;padding:0`;d.addEventListener('click',()=>{obStep=i;updateObStep();});dots.appendChild(d);}
}

function updateObStep(){
  document.querySelectorAll('.onboarding-step').forEach((s,i)=>s.classList.toggle('active',i+1===obStep));
  const bar=document.getElementById('onboarding-progress-bar');if(bar)bar.style.width=`${(obStep/OB_TOTAL)*100}%`;
  const nextBtn=document.getElementById('ob-next');if(nextBtn)nextBtn.textContent=obStep===OB_TOTAL?'Los geht\'s! 🚀':'Weiter →';
  buildObDots();
}

function setupOnboarding(){
  // Keyboard-Navigation
  document.addEventListener('keydown',e=>{
    const overlay=document.getElementById('onboarding-overlay');
    if(!overlay||overlay.style.display==='none')return;
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();if(obStep<OB_TOTAL){obStep++;updateObStep();}}
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();if(obStep>1){obStep--;updateObStep();}}
    else if(e.key==='Escape'){closeOnboarding();}
  });
  document.getElementById('ob-next')?.addEventListener('click',()=>{
    if(obStep<OB_TOTAL){obStep++;updateObStep();}
    else{closeOnboarding();}
  });
  document.getElementById('ob-skip')?.addEventListener('click',closeOnboarding);
  document.getElementById('btn-show-onboarding')?.addEventListener('click',()=>{closeSettings();setTimeout(()=>showOnboarding(true),200);});
}

function closeOnboarding(){
  document.getElementById('onboarding-overlay').style.display='none';
  settings.onboardingDone=true;autoSave();
}

// ════════ TMDB-SUCHE AB 2 ZEICHEN ════════════════════════════════
// Die setupSearch-Funktion wird um früheren Trigger ergänzt
const _origSetupSearch=setupSearch;
function patchSearchEarlyTrigger(){
  const input=document.getElementById('search-input');if(!input)return;
  // Zusätzlicher Listener: ab 2 Zeichen sofort TMDb starten (200ms debounce)
  input.addEventListener('input',()=>{
    const q=input.value.trim();
    if(q.length>=2&&q.length<3){// bei genau 2 Zeichen mit kürzerem Delay
      clearTimeout(window._earlySearchTimer);
      window._earlySearchTimer=setTimeout(()=>runTmdbSearch(q,1),200);
    }
  });
}
// ════════ SHORTCUTS MODAL ═════════════════════════════════════════
function setupShortcutsModal(){
  // Shortcut-Liste anzeigen mit "?"
  document.addEventListener('keydown',e=>{
    if(e.key==='?'&&!e.ctrlKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
      const existing=document.getElementById('shortcuts-modal-overlay');
      if(existing){existing.remove();return;}
      const overlay=document.createElement('div');overlay.id='shortcuts-modal-overlay';
      overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:8000;display:flex;align-items:center;justify-content:center';
      overlay.innerHTML=`<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:28px 32px;min-width:340px;box-shadow:0 24px 60px rgba(0,0,0,.6)">
        <div style="font-family:var(--font-d);font-size:18px;font-weight:800;color:var(--tx);margin-bottom:18px">⌨️ Tastenkürzel</div>
        ${[['F11','Vollbild umschalten'],['Strg + F','Suche fokussieren'],['Esc','Vollbild beenden / Popup schließen'],['?','Diese Übersicht öffnen/schließen'],['Strg+Shift+Alt+R','Admin: PIN zurücksetzen']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;gap:24px;padding:6px 0;border-bottom:1px solid var(--bor);font-size:13px"><span style="color:var(--tx2)">${v}</span><kbd style="background:var(--bgc);border:1px solid var(--borh);border-radius:5px;padding:2px 8px;font-size:11px;color:var(--tx);font-family:monospace">${k}</kbd></div>`).join('')}
        <div style="margin-top:14px;text-align:right"><button onclick="document.getElementById('shortcuts-modal-overlay').remove()" style="border:1px solid var(--bor);background:transparent;color:var(--tx2);padding:6px 16px;border-radius:var(--r-sm);cursor:pointer;font-size:12px">Schließen</button></div>
      </div>`;
      overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
      document.body.appendChild(overlay);
    }
  });
}

// ════════ OFFLINE CACHE ════════════════════════════════════════════
const _tmdbCache={};
const _origRunTmdbSearch=typeof runTmdbSearch==='function'?runTmdbSearch:null;
function cachedTmdbSearch(q,page){
  const key=q+'_'+page;
  if(_tmdbCache[key]&&Date.now()-_tmdbCache[key].ts<5*60*1000){
    // Cache gültig (5 min), direkt rendern
    return _tmdbCache[key].data;
  }
  return null;
}


// ════════ START ════════════════════════════════════════════════════



// ══ UPDATE CHECK ═══════════════════════════════════════════════════
document.getElementById('btn-check-updates')?.addEventListener('click',async()=>{const el=document.getElementById('update-check-result');if(el){el.textContent='Prüfe…';el.style.color='var(--tx2)';}await window.electronAPI.checkForUpdates();});

// ══ WATCHLIST EXPORT/IMPORT ════════════════════════════════════════
document.getElementById('btn-view-watchlist-adv')?.addEventListener('click',()=>{showView('watchlist');buildWatchlistSorted();closeSettings();});
document.getElementById('btn-export-watchlist')?.addEventListener('click',()=>{
  if(!watchlist.length){showToastMsg('Watchlist ist leer');return;}
  const data=JSON.stringify(watchlist,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`omnisight-watchlist-${Date.now()}.json`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  showToastMsg('Watchlist exportiert');
});
document.getElementById('btn-import-watchlist')?.addEventListener('click',()=>{
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.addEventListener('change',async()=>{
    const file=input.files[0];if(!file)return;
    try{
      const text=await file.text();const data=JSON.parse(text);
      if(!Array.isArray(data))throw new Error('Ungültiges Format');
      let added=0;data.forEach(item=>{if(!watchlist.find(w=>w.id===item.id)){watchlist.push(item);added++;}});
      settings.watchlist=watchlist;autoSave();
      showToastMsg(`${added} Einträge importiert`);
      buildWatchlistSorted();
    }catch(e){showToastMsg('Fehler: '+e.message);}
  });
  input.click();
});
document.getElementById('btn-restore-providers')?.addEventListener('click',()=>{settings.deletedProviders=[];settings.customProviders={};customProviders={};providerOrder=[];settings.providerOrder=[];autoSave();buildProviderGrid();showToastMsg('Standardanbieter wiederhergestellt');});
document.getElementById('btn-show-onboarding')?.addEventListener('click',()=>{closeSettings();setTimeout(()=>showOnboarding(true),200);});
document.getElementById('pick-bg-image')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('appBg');if(r){const url=r.base64||r.filePath||r;settings.appBgImage=url;applyBgImage(url);autoSave();}});
document.getElementById('reset-bg-image')?.addEventListener('click',()=>{settings.appBgImage='';applyBgImage('');autoSave();});

// ══ PLUGINS ════════════════════════════════════════════════════════
function buildPluginsList(){
  const container=document.getElementById('plugin-presets-list');if(!container)return;
  container.innerHTML='';
  PLUGIN_PRESETS.forEach(preset=>{
    const isInst=installedPlugins.has(preset.id);
    const div=document.createElement('div');div.className='plugin-preset';
    div.innerHTML=`<div class="plugin-preset-info"><div class="plugin-preset-name">${esc(preset.name)}</div><div class="plugin-preset-desc">${esc(preset.desc)}</div>${preset.note?`<div style="font-size:10px;color:var(--acc);margin-top:2px">${esc(preset.note)}</div>`:''}</div>`;
    let btn;
    if(preset.note){btn=document.createElement('button');btn.className='plugin-preset-btn plugin-preset-btn--info';btn.textContent='Info';btn.addEventListener('click',()=>showToastMsg(preset.note));}
    else if(isInst){btn=document.createElement('button');btn.className='plugin-preset-btn plugin-preset-btn--remove';btn.textContent='Deinstallieren';btn.addEventListener('click',()=>{installedPlugins.delete(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));delete pluginDomainStore[preset.id];rebuildPluginDomains();buildPluginsList();});}
    else{btn=document.createElement('button');btn.className='plugin-preset-btn plugin-preset-btn--install';btn.textContent='Installieren';btn.addEventListener('click',async()=>{btn.textContent='Lädt…';btn.disabled=true;const r=await window.electronAPI.fetchAdblockList(preset.url);if(r.ok){pluginDomainStore[preset.id]=r.domains;rebuildPluginDomains();installedPlugins.add(preset.id);localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));buildPluginsList();}else{btn.textContent='Fehler';btn.disabled=false;}});}
    div.appendChild(btn);container.appendChild(div);
  });
}
function rebuildPluginDomains(){const all=[...new Set(Object.values(pluginDomainStore).flat())];window.electronAPI.applyExtraAdDomains(all);}

// ══ WATCHED CONTENT ════════════════════════════════════════════════
function setupWatchedContent(){
  document.getElementById('watched-content-close')?.addEventListener('click',()=>document.getElementById('watched-content-overlay').style.display='none');
  document.getElementById('watched-content-overlay')?.addEventListener('click',e=>{if(e.target.id==='watched-content-overlay')e.target.style.display='none';});
  document.getElementById('watched-search')?.addEventListener('input',renderWatchedGrid);
  document.getElementById('watched-filter')?.addEventListener('change',renderWatchedGrid);
  document.getElementById('btn-add-watched')?.addEventListener('click',()=>{const title=prompt('Titel eingeben:');if(!title)return;const type=prompt('Typ (movie/tv/anime):','movie')||'movie';const list=settings.watchedContentList||[];list.push({id:'manual_'+Date.now(),title,mediaType:type,addedAt:new Date().toISOString()});settings.watchedContentList=list;autoSave();renderWatchedGrid();});
}
function openWatchedContentModal(){renderWatchedGrid();document.getElementById('watched-content-overlay').style.display='flex';}
function renderWatchedGrid(){
  const grid=document.getElementById('watched-content-grid');if(!grid)return;
  const search=(document.getElementById('watched-search')?.value||'').toLowerCase();
  const filter=document.getElementById('watched-filter')?.value||'all';
  const list=settings.watchedContentList||[];
  let items=list.filter(i=>(filter==='all'||i.mediaType===filter)&&(!search||i.title.toLowerCase().includes(search)));
  if(!items.length){grid.innerHTML='<div style="color:var(--tx2);font-size:13px;padding:20px;text-align:center;grid-column:1/-1">Keine Einträge.</div>';return;}
  grid.innerHTML='';
  items.forEach(item=>{const card=document.createElement('div');card.className='wl-card';card.innerHTML=`${item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy"/>`:'<div class="wl-card-poster-ph">🎬</div>'}<div class="wl-card-body"><div class="wl-card-title">${esc(item.title)}</div><div class="wl-card-date">${item.mediaType||'?'}</div></div><button class="wl-card-remove">✕</button>`;card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();settings.watchedContentList=(settings.watchedContentList||[]).filter(w=>w.id!==item.id);autoSave();renderWatchedGrid();});grid.appendChild(card);});
}

// ══ ONBOARDING ═════════════════════════════════════════════════════
function setupOnboarding(){
  document.getElementById('ob-next')?.addEventListener('click',()=>{if(obStep<OB_TOTAL){obStep++;updateObStep();}else{applyOnboardingSettings();closeOnboarding();}});
  document.getElementById('ob-skip')?.addEventListener('click',()=>{applyOnboardingSettings();closeOnboarding();});
  // Sprache
  document.getElementById('ob-lang-de')?.addEventListener('click',()=>{settings.language='de';applyLanguage('de');document.getElementById('ob-lang-de').classList.add('active');document.getElementById('ob-lang-en').classList.remove('active');});
  document.getElementById('ob-lang-en')?.addEventListener('click',()=>{settings.language='en';applyLanguage('en');document.getElementById('ob-lang-en').classList.add('active');document.getElementById('ob-lang-de').classList.remove('active');});
  // Akzentfarbe
  document.getElementById('ob-accent-color')?.addEventListener('input',e=>{settings.accentColor=e.target.value;applyAccent(e.target.value);});
  // Schriftart
  document.getElementById('ob-font-family')?.addEventListener('change',e=>{settings.designOptions.fontFamily=e.target.value;applyFontFamily(e.target.value);});
  // Schriftgröße
  document.getElementById('ob-font-size')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('ob-font-size-val').textContent=v+'px';settings.fontSize=v;applyFontSize(v);});
  // Avatar
  document.getElementById('ob-pick-avatar')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('ob_avatar');if(r){const url=r.base64||r.filePath||r;document.getElementById('ob-avatar-preview').innerHTML=`<img src="${url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover"/>`;window._obAvatar=url;}});
  document.getElementById('ob-clear-avatar')?.addEventListener('click',()=>{document.getElementById('ob-avatar-preview').innerHTML='👤';window._obAvatar=null;});
  // Keyboard-Navigation
  document.addEventListener('keydown',e=>{const ov=document.getElementById('onboarding-overlay');if(!ov||ov.style.display==='none')return;if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();if(obStep<OB_TOTAL){obStep++;updateObStep();}}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();if(obStep>1){obStep--;updateObStep();}}else if(e.key==='Escape'){applyOnboardingSettings();closeOnboarding();}});
}
function applyOnboardingSettings(){
  // Profilname aus Onboarding übernehmen
  const nameInput=document.getElementById('ob-profile-name');const name=(nameInput?.value||'').trim()||'User';
  const p=profiles.find(pr=>pr.id===activeProfileId);
  if(p){p.name=name;if(window._obAvatar!==undefined&&window._obAvatar!==null)p.avatar=window._obAvatar;window.electronAPI.setProfiles(profiles);}
  autoSave();buildSidebarProfile();
}
function showOnboarding(force=false){
  if(!force&&settings.onboardingDone)return;
  obStep=1;updateObStep();
  document.getElementById('onboarding-overlay').style.display='flex';
  // Aktuellen Profilnamen vorbelegen
  const p=profiles.find(pr=>pr.id===activeProfileId);const nameInput=document.getElementById('ob-profile-name');if(nameInput&&p)nameInput.value=p.name||'User';
  // Aktuelle Sprache vorbelegen
  document.getElementById('ob-lang-de')?.classList.toggle('active',lang==='de');document.getElementById('ob-lang-en')?.classList.toggle('active',lang==='en');
  document.getElementById('ob-accent-color').value=settings.accentColor||'#30c5bb';
  document.getElementById('ob-font-family').value=settings.designOptions?.fontFamily||'DM Sans';
  document.getElementById('ob-font-size').value=settings.fontSize||14;document.getElementById('ob-font-size-val').textContent=(settings.fontSize||14)+'px';
}
function closeOnboarding(){document.getElementById('onboarding-overlay').style.display='none';settings.onboardingDone=true;autoSave();}
function updateObStep(){
  document.querySelectorAll('.onboarding-step').forEach((s,i)=>s.classList.toggle('active',i+1===obStep));
  const bar=document.getElementById('onboarding-progress-bar');if(bar)bar.style.width=`${(obStep/OB_TOTAL)*100}%`;
  const nextBtn=document.getElementById('ob-next');if(nextBtn)nextBtn.textContent=obStep===OB_TOTAL?'Los geht\'s! 🚀':'Weiter →';
  buildObDots();
}
function buildObDots(){
  const dots=document.getElementById('ob-dots');if(!dots)return;
  dots.innerHTML='';
  for(let i=1;i<=OB_TOTAL;i++){const d=document.createElement('button');d.style.cssText=`width:${i===obStep?'18px':'7px'};height:7px;border-radius:999px;border:none;background:${i===obStep?'var(--acc)':'rgba(255,255,255,.3)'};cursor:pointer;transition:all .3s;padding:0`;d.addEventListener('click',()=>{obStep=i;updateObStep();});dots.appendChild(d);}
}

// ══ SHORTCUTS MODAL ════════════════════════════════════════════════
function setupShortcutsModal(){
  const openModal=()=>{const existing=document.getElementById('shortcuts-modal-overlay');if(existing){existing.remove();return;}const overlay=document.createElement('div');overlay.id='shortcuts-modal-overlay';overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:8000;display:flex;align-items:center;justify-content:center';overlay.innerHTML=`<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:28px 32px;min-width:340px;box-shadow:0 24px 60px rgba(0,0,0,.6)"><div style="font-family:var(--font-d);font-size:18px;font-weight:800;color:var(--tx);margin-bottom:18px">⌨️ Tastenkürzel</div>${[['F11','Vollbild umschalten'],['Strg+F','Suche fokussieren'],['Esc','Vollbild beenden / Schließen'],['?','Diese Übersicht'],['→/←','Onboarding navigieren'],['Strg+Shift+Alt+R','Admin: PIN zurücksetzen']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;gap:24px;padding:7px 0;border-bottom:1px solid var(--bor);font-size:13px"><span style="color:var(--tx2)">${v}</span><kbd style="background:var(--bgc);border:1px solid var(--borh);border-radius:5px;padding:2px 8px;font-size:11px;color:var(--tx);font-family:monospace">${k}</kbd></div>`).join('')}<div style="margin-top:14px;text-align:right"><button onclick="document.getElementById('shortcuts-modal-overlay').remove()" style="border:1px solid var(--bor);background:transparent;color:var(--tx2);padding:6px 16px;border-radius:var(--r-sm);cursor:pointer;font-size:12px">Schließen</button></div></div>`;overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});document.body.appendChild(overlay);};
  document.getElementById('btn-shortcuts-hint')?.addEventListener('click',openModal);
  document.addEventListener('keydown',e=>{if(e.key==='?'&&!e.ctrlKey&&!e.altKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))openModal();});
}

// ══ TITLEBAR ═══════════════════════════════════════════════════════
function setupTitlebar(){
  document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',()=>window.electronAPI.close());
}

// ══ START ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>init());

// ══ FEHLENDE HANDLER ══════════════════════════════════════════════
(function setupMissingHandlers(){
  // Profil-Switcher Button
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('btn-profile-switcher')?.addEventListener('click',()=>{
      const overlay=document.getElementById('profile-manager-overlay');
      if(overlay){
        // Profilliste bauen
        const list=document.getElementById('pm-list');if(list){list.innerHTML='';
        profiles.forEach(p=>{const item=document.createElement('div');item.style.cssText=`display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid ${p.id===activeProfileId?'var(--acc)':'var(--bor)'};border-radius:var(--r-sm);cursor:pointer;background:${p.id===activeProfileId?'var(--accg)':'var(--bgc)'};margin-bottom:8px;transition:all .15s`;item.innerHTML=`<div style="width:36px;height:36px;border-radius:50%;background:var(--bgch);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;flex-shrink:0">${p.avatar?`<img src="${p.avatar}" style="width:36px;height:36px;object-fit:cover"/>`:'👤'}</div><div style="flex:1"><div style="font-weight:700;color:var(--tx)">${p.name}</div>${p.pin?'<div style="font-size:10px;color:var(--tx3)">🔒 PIN</div>':''}</div>${p.id===activeProfileId?'<span style="font-size:11px;color:var(--acc);font-weight:700">Aktiv</span>':''}`;
        item.addEventListener('click',()=>{if(p.id===activeProfileId){overlay.style.display='none';return;}if(p.pin){overlay.style.display='none';const pin=prompt('PIN für "'+p.name+'":');if(pin===null)return;if(String(pin)===String(p.pin))switchProfile(p.id);else showToastMsg('Falscher PIN');}else{overlay.style.display='none';switchProfile(p.id);}});
        list.appendChild(item);});}
        overlay.style.display='flex';
      }
    });
    // Profile Manager Buttons
    document.getElementById('pm-close')?.addEventListener('click',()=>document.getElementById('profile-manager-overlay').style.display='none');
    document.getElementById('pm-btn-new')?.addEventListener('click',()=>{document.getElementById('profile-manager-overlay').style.display='none';openPedForNew();});
    document.getElementById('pm-btn-logout')?.addEventListener('click',()=>{document.getElementById('profile-manager-overlay').style.display='none';showToastMsg('Profil abgemeldet. App neu starten um Profil zu wählen.');});
    // Profile Editor
    document.getElementById('ped-save')?.addEventListener('click',()=>{const name=(document.getElementById('ped-name')?.value||'').trim()||'User';if(window._pedId){const p=profiles.find(pr=>pr.id===window._pedId);if(p){p.name=name;if(window._pedAvatar!==undefined)p.avatar=window._pedAvatar;if(window._pedPin!==undefined)p.pin=window._pedPin||null;}}else{const id='profile_'+Date.now();profiles.push({id,name,avatar:window._pedAvatar||null,pin:null,favorites:[],watchlist:[],searchHistory:[]});}window.electronAPI.setProfiles(profiles);document.getElementById('profile-editor-overlay').style.display='none';buildSidebarProfile();showSaveToast();});
    document.getElementById('ped-cancel')?.addEventListener('click',()=>document.getElementById('profile-editor-overlay').style.display='none');
    document.getElementById('ped-delete')?.addEventListener('click',()=>{if(!window._pedId||profiles.length<=1){showToastMsg('Mindestens 1 Profil nötig');return;}if(!confirm('Profil löschen?'))return;profiles=profiles.filter(p=>p.id!==window._pedId);window.electronAPI.setProfiles(profiles);document.getElementById('profile-editor-overlay').style.display='none';if(activeProfileId===window._pedId)switchProfile(profiles[0].id);else buildSidebarProfile();});
    document.getElementById('ped-pick-avatar')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('pa').catch(()=>null);if(r){const url=r.base64||r.filePath||r;document.getElementById('ped-avatar-preview').innerHTML=`<img src="${url}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`;window._pedAvatar=url;}});
    document.getElementById('ped-clear-avatar')?.addEventListener('click',()=>{document.getElementById('ped-avatar-preview').innerHTML='👤';window._pedAvatar=null;});
    document.getElementById('ped-set-pin')?.addEventListener('click',()=>{const p=prompt('Neuen 4-stelligen PIN eingeben:');if(!p)return;if(p.length!==4||!/^\d{4}$/.test(p)){showToastMsg('PIN muss genau 4 Ziffern sein');return;}window._pedPin=p;showToastMsg('PIN gesetzt');});
    document.getElementById('ped-remove-pin')?.addEventListener('click',()=>{window._pedPin='';showToastMsg('PIN entfernt');});
    // Notification Bell
    const bell=document.getElementById('notif-bell-btn');const center=document.getElementById('notif-center');
    if(bell&&center){
      bell.addEventListener('click',e=>{e.stopPropagation();const open=center.style.display==='flex';center.style.display=open?'none':'flex';if(!open)renderNotifications();});
      document.addEventListener('click',e=>{if(center.style.display==='flex'&&!center.contains(e.target)&&!bell.contains(e.target))center.style.display='none';});
    }
    document.getElementById('notif-center-close')?.addEventListener('click',()=>{document.getElementById('notif-center').style.display='none';});
    document.getElementById('notif-clear-all')?.addEventListener('click',()=>{notifications=[];renderNotifications();updateNotifBadge();window.electronAPI.setNotifications(activeProfileId,[]);});
    // Settings Modal Tabs
    document.querySelectorAll('.sms-btn[data-stab]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.sms-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));btn.classList.add('active');document.getElementById('smt-'+btn.dataset.stab)?.classList.add('active');if(btn.dataset.stab==='account')buildSessionList(sessionCache||{});if(btn.dataset.stab==='clock')enableClockDrag(true);else enableClockDrag(false);if(btn.dataset.stab==='advanced')buildAdvancedTab();});});
    // Settings Open/Close
    document.getElementById('btn-settings')?.addEventListener('click',()=>{document.getElementById('settings-overlay').style.display='flex';buildAdvancedTab();syncSettingsUI();trackMeta('settingsOpens');});
    document.getElementById('settings-close')?.addEventListener('click',()=>{enableClockDrag(false);document.getElementById('settings-overlay').style.display='none';window.electronAPI.setSettings(settings);showSaveToast();});
    document.getElementById('settings-overlay')?.addEventListener('click',e=>{if(e.target.id==='settings-overlay'){enableClockDrag(false);document.getElementById('settings-overlay').style.display='none';window.electronAPI.setSettings(settings);showSaveToast();}});
  },{once:true});
})();
