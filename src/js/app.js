'use strict';

// ════════════════════════════════
// PROVIDERS
// ════════════════════════════════
const PROVIDERS_BASE = {
  apple:        {name:'Apple TV+',      tag:'Apple Originals',          url:'https://tv.apple.com',                    color:'#555555', quality:'4K',    partition:'apple'},
  adn:          {name:'ADN',            tag:'Anime Digital Network',    url:'https://www.animedigitalnetwork.de',      color:'#0077CC', quality:'HD',    partition:'adn'},
  ard:          {name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',     url:'https://www.ardmediathek.de',             color:'#003D6B', quality:'HD',    partition:'ard'},
  arte:         {name:'ARTE',           tag:'Kultur & Dokumentation',   url:'https://www.arte.tv/de',                  color:'#F00000', quality:'HD',    partition:'arte'},
  burning:      {name:'BurningSeries',  tag:'Serien & Anime',           url:'https://bs.to',                           color:'#C0392B', quality:'HD',    partition:'burning', multiTab:true},
  cineto:       {name:'Cine.to',        tag:'Filme & Serien',           url:'https://cine.to',                         color:'#8B5CF6', quality:'HD',    partition:'cineto',  multiTab:true},
  crunchyroll:  {name:'Crunchyroll',    tag:'Anime & Manga',            url:'https://www.crunchyroll.com',             color:'#F47521', quality:'4K',    partition:'crunchyroll'},
  dazn:         {name:'DAZN',           tag:'Sport Live-Streams',       url:'https://www.dazn.com',                    color:'#F8D200', quality:'4K',    partition:'dazn'},
  disney:       {name:'Disney+',        tag:'Marvel, Star Wars & mehr', url:'https://www.disneyplus.com',              color:'#113CCF', quality:'4K',    partition:'disney'},
  funk:         {name:'Funk',           tag:'Content Creator Network',  url:'https://www.funk.net',                    color:'#000000', quality:'HD',    partition:'funk'},
  hbomax:       {name:'Max (HBO)',       tag:'HBO Originals & mehr',     url:'https://www.max.com',                     color:'#0031DB', quality:'4K',    partition:'hbomax'},
  joyn:         {name:'Joyn',           tag:'Kostenlos streamen',       url:'https://www.joyn.de',                     color:'#E4001B', quality:'HD',    partition:'joyn'},
  kika:         {name:'KiKA',           tag:'Kinder & Familie',         url:'https://www.kika.de',                     color:'#00A859', quality:'HD',    partition:'kika'},
  magenta:      {name:'MagentaTV',      tag:'Telekom Streaming',        url:'https://www.magentatv.de',                color:'#E20074', quality:'4K',    partition:'magenta'},
  movie2k:      {name:'Movie2k',        tag:'Filme & Serien',           url:'https://movie2k.ch/',                     color:'#FF6B35', quality:'HD',    partition:'movie2k'},
  mubi:         {name:'MUBI',           tag:'Arthouse & Kino',          url:'https://mubi.com',                        color:'#213F5E', quality:'HD',    partition:'mubi'},
  netflix:      {name:'Netflix',        tag:'Filme & Serien',           url:'https://www.netflix.com',                 color:'#E50914', quality:'4K',    partition:'netflix'},
  paramountplus:{name:'Paramount+',     tag:'Paramount Originals',      url:'https://www.paramountplus.com',           color:'#0064FF', quality:'4K',    partition:'paramountplus'},
  prime:        {name:'Prime Video',    tag:'Amazon Originals',         url:'https://www.primevideo.com',              color:'#00A8E1', quality:'4K',    partition:'prime'},
  rtl:          {name:'RTL+',           tag:'RTL Serien & Shows',       url:'https://plus.rtl.de',                     color:'#FF6B00', quality:'HD',    partition:'rtl'},
  skygo:        {name:'Sky Go',         tag:'Sky Serien & Sport',       url:'https://www.sky.de/entertainment/sky-go', color:'#00205B', quality:'HD',    partition:'skygo'},
  spotify:      {name:'Spotify',        tag:'Musik & Podcasts',         url:'https://open.spotify.com',                color:'#1DB954', quality:'–',     partition:'spotify', bgAudio:true},
  twitch:       {name:'Twitch',         tag:'Live-Streams & Gaming',    url:'https://www.twitch.tv',                   color:'#9146FF', quality:'1080p', partition:'twitch',  multiTab:true},
  waipu:        {name:'Waipu.tv',       tag:'Live-TV & Mediathek',      url:'https://www.waipu.tv',                    color:'#00B4D8', quality:'HD',    partition:'waipu'},
  wow:          {name:'WOW',            tag:'Sky ohne Abo',             url:'https://www.wowtv.de',                    color:'#00A3E0', quality:'HD',    partition:'wow'},
  youtube:      {name:'YouTube',        tag:'Videos & Streams',         url:'https://www.youtube.com',                 color:'#FF0000', quality:'4K',    partition:'youtube',  multiTab:true},
  zdf:          {name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',     url:'https://www.zdf.de',                      color:'#163A6A', quality:'HD',    partition:'zdf'},
};

// TMDB → unser Provider-Mapping
const TMDB_PROVIDER_MAP = {
  8:'netflix',9:'prime',337:'disney',384:'hbomax',531:'paramountplus',
  283:'crunchyroll',350:'apple',207:'mubi',36:'mubi',29:'waipu',
};

// ════════════════════════════════
// ACHIEVEMENTS
// ════════════════════════════════
const ACHIEVEMENT_CATEGORIES = {
  stream:  {de:'⏱ Streamzeit', en:'⏱ Streaming Time'},
  provider:{de:'📺 Anbieter',   en:'📺 Providers'},
  special: {de:'✨ Besonders',  en:'✨ Special'},
  hidden:  {de:'🔒 Versteckt',  en:'🔒 Hidden'},
};

const ACHIEVEMENTS = [
  // ── Streamzeit ──
  {id:'first_stream',   cat:'stream',  name:{de:'Erster Stream',       en:'First Stream'},     icon:'🎬', desc:{de:'Ersten Stream gestartet',          en:'Started your first stream'},       check:s=>Object.values(s).some(v=>v.total>0)},
  {id:'hour_1',         cat:'stream',  name:{de:'1 Stunde',            en:'1 Hour'},            icon:'⏰', desc:{de:'1h insgesamt gestreamt',            en:'Streamed 1h in total'},             check:s=>totalSecs(s)>=3600},
  {id:'hour_5',         cat:'stream',  name:{de:'5 Stunden',           en:'5 Hours'},           icon:'🕔', desc:{de:'5h insgesamt gestreamt',            en:'Streamed 5h in total'},             check:s=>totalSecs(s)>=18000},
  {id:'hour_10',        cat:'stream',  name:{de:'10 Stunden',          en:'10 Hours'},          icon:'🕐', desc:{de:'10h insgesamt gestreamt',           en:'Streamed 10h in total'},            check:s=>totalSecs(s)>=36000},
  {id:'hour_50',        cat:'stream',  name:{de:'50 Stunden',          en:'50 Hours'},          icon:'🏅', desc:{de:'50h insgesamt gestreamt',           en:'Streamed 50h in total'},            check:s=>totalSecs(s)>=180000},
  {id:'hour_100',       cat:'stream',  name:{de:'100 Stunden',         en:'100 Hours'},         icon:'💯', desc:{de:'100h insgesamt gestreamt',          en:'Streamed 100h in total'},           check:s=>totalSecs(s)>=360000},
  {id:'hour_500',       cat:'stream',  name:{de:'500 Stunden',         en:'500 Hours'},         icon:'🏆', desc:{de:'500h insgesamt gestreamt',          en:'Streamed 500h in total'},           check:s=>totalSecs(s)>=1800000},
  {id:'night_owl',      cat:'stream',  name:{de:'Nachteule',           en:'Night Owl'},         icon:'🦉', desc:{de:'Am Wochenende gestreamt',           en:'Streamed on the weekend'},          check:s=>Object.values(s).some(v=>(v.byDay?.[0]||0)+(v.byDay?.[6]||0)>0)},
  {id:'monday_start',   cat:'stream',  name:{de:'Wochenstart',         en:'Week Starter'},      icon:'📅', desc:{de:'An einem Montag gestreamt',         en:'Streamed on a Monday'},             check:s=>Object.values(s).some(v=>(v.byDay?.[1]||0)>0)},
  // ── Anbieter ──
  {id:'netflix_1h',     cat:'provider',name:{de:'Netflix Fan',         en:'Netflix Fan'},       icon:'🍿', desc:{de:'1h Netflix gestreamt',              en:'Streamed 1h on Netflix'},           check:s=>(s.netflix?.total||0)>=3600},
  {id:'youtube_5h',     cat:'provider',name:{de:'YouTube Addict',      en:'YouTube Addict'},    icon:'▶️', desc:{de:'5h YouTube gestreamt',              en:'Streamed 5h on YouTube'},           check:s=>(s.youtube?.total||0)>=18000},
  {id:'anime_fan',      cat:'provider',name:{de:'Anime-Fan',           en:'Anime Fan'},         icon:'⛩️', desc:{de:'Crunchyroll 1h gestreamt',          en:'Streamed 1h on Crunchyroll'},       check:s=>(s.crunchyroll?.total||0)>=3600},
  {id:'anime_master',   cat:'provider',name:{de:'Anime-Meister',       en:'Anime Master'},      icon:'🐉', desc:{de:'Crunchyroll 10h gestreamt',         en:'Streamed 10h on Crunchyroll'},      check:s=>(s.crunchyroll?.total||0)>=36000},
  {id:'multi_provider', cat:'provider',name:{de:'Viel-Streamer',       en:'Multi-Streamer'},    icon:'🌐', desc:{de:'5 verschiedene Anbieter genutzt',   en:'Used 5 different providers'},       check:s=>Object.values(s).filter(v=>v.total>0).length>=5},
  {id:'all_providers',  cat:'provider',name:{de:'Komplett-Streamer',   en:'Full Streamer'},     icon:'🎯', desc:{de:'10 verschiedene Anbieter genutzt',  en:'Used 10 different providers'},      check:s=>Object.values(s).filter(v=>v.total>0).length>=10},
  {id:'sport_fan',      cat:'provider',name:{de:'Sport-Fan',           en:'Sports Fan'},        icon:'⚽', desc:{de:'DAZN 1h gestreamt',                en:'Streamed 1h on DAZN'},              check:s=>(s.dazn?.total||0)>=3600},
  {id:'music_fan',      cat:'provider',name:{de:'Musik-Fan',           en:'Music Fan'},         icon:'🎵', desc:{de:'Spotify 1h gestreamt',              en:'Streamed 1h on Spotify'},           check:s=>(s.spotify?.total||0)>=3600},
  {id:'twitch_fan',     cat:'provider',name:{de:'Twitch-Fan',          en:'Twitch Fan'},        icon:'🎮', desc:{de:'Twitch 2h gestreamt',               en:'Streamed 2h on Twitch'},            check:s=>(s.twitch?.total||0)>=7200},
  // ── Besonders ──
  {id:'binge_day',      cat:'special', name:{de:'Binge-Tag',           en:'Binge Day'},         icon:'🛋️', desc:{de:'An einem Tag 4h gestreamt',         en:'Streamed 4h in one day'},           check:s=>Object.values(s).some(v=>v.byDay&&Math.max(...v.byDay)>=14400)},
  {id:'early_bird',     cat:'special', name:{de:'Frühaufsteher',       en:'Early Bird'},        icon:'🌅', desc:{de:'Mehr als 3h montags gestreamt',     en:'Streamed 3h+ on Mondays'},          check:s=>Object.values(s).reduce((a,v)=>a+(v.byDay?.[1]||0),0)>=10800},
  // ── Versteckt ──
  {id:'hid_100app',     cat:'hidden',  name:{de:'Stammgast',           en:'Regular'},           icon:'🏠', desc:{de:'App 100x gestartet',               en:'Started the app 100 times'},        check:(_,meta)=>(meta?.appStarts||0)>=100, hidden:true},
  {id:'hid_settings50', cat:'hidden',  name:{de:'Einstellungs-Freak',  en:'Settings Freak'},    icon:'⚙️', desc:{de:'Einstellungen 50x geöffnet',        en:'Opened settings 50 times'},         check:(_,meta)=>(meta?.settingsOpens||0)>=50, hidden:true},
  {id:'hid_1000h',      cat:'hidden',  name:{de:'Lebenswerk',          en:'Life\'s Work'},       icon:'👑', desc:{de:'1000h insgesamt gestreamt',         en:'Streamed 1000h in total'},          check:s=>totalSecs(s)>=3600000, hidden:true},
  {id:'hid_midnight',   cat:'hidden',  name:{de:'Mitternachts-Freak',  en:'Midnight Freak'},    icon:'🌙', desc:{de:'Nach Mitternacht gestreamt',        en:'Streamed after midnight'},           check:(_,meta)=>(meta?.midnightStreams||0)>=1, hidden:true},
  {id:'hid_allprovider',cat:'hidden',  name:{de:'Alles-Tester',        en:'All-Tester'},        icon:'🔬', desc:{de:'Alle 20 Standardanbieter genutzt',  en:'Used all 20 default providers'},    check:s=>Object.values(s).filter(v=>v.total>0).length>=20, hidden:true},
];
function totalSecs(s){return Object.values(s).reduce((a,v)=>a+(v.total||0),0);}

// ════════════════════════════════
// PLUGIN PRESETS
// ════════════════════════════════
const PLUGIN_PRESETS = [
  {id:'adblock',    name:{de:'AdBlock',              en:'AdBlock'},              desc:{de:'Von ADBLOCK, Inc. – getadblock.com', en:'By ADBLOCK, Inc.'},                              url:'https://easylist.to/easylist/easylist.txt'},
  {id:'easyprivacy',name:{de:'EasyPrivacy',           en:'EasyPrivacy'},          desc:{de:'Tracking & Analytics blockieren',    en:'Block tracking & analytics'},                    url:'https://easylist.to/easylist/easyprivacy.txt'},
  {id:'fanboy',     name:{de:'Fanboy Annoyance',      en:'Fanboy Annoyance'},     desc:{de:'Cookie-Banner & Popups blockieren',  en:'Block cookie banners & popups'},                 url:'https://easylist.to/easylist/fanboy-annoyance.txt'},
  {id:'adguard',    name:{de:'AdGuard Base',          en:'AdGuard Base'},         desc:{de:'AdGuard Basisliste',                 en:'AdGuard base list'},                             url:'https://filters.adtidy.org/extension/chromium/filters/2.txt'},
  {id:'buster',     name:{de:'Buster: Captcha Solver',en:'Buster: Captcha Solver'},desc:{de:'CAPTCHA-Löser (Browser-Extension)', en:'Captcha solver (browser extension)'},            url:'', note:{de:'Buster ist eine Browser-Extension. OmniSight versucht CAPTCHAs automatisch zu überspringen.',en:'Buster is a browser extension. OmniSight tries to skip CAPTCHAs automatically.'}},
  {id:'betterttv',  name:{de:'BetterTTV',             en:'BetterTTV'},            desc:{de:'Twitch-Emotes & Verbesserungen',     en:'Twitch emotes & improvements'},                  url:'', note:{de:'BetterTTV ist eine Browser-Extension.',en:'BetterTTV is a browser extension.'}},
  {id:'icloud',     name:{de:'iCloud-Passwörter',     en:'iCloud Passwords'},     desc:{de:'Passwörter aus Safari (Windows)',    en:'Passwords from Safari (Windows)'},               url:'', note:{de:'Nur über die iCloud für Windows-App verfügbar.',en:'Only available via the iCloud for Windows app.'}},
];

// ════════════════════════════════
// I18N – vollständig
// ════════════════════════════════
const I18N = {
  de:{
    // Nav
    overview:'Übersicht', favorites:'Favoriten', watchlist:'Gemerkt', news:'Neuigkeiten',
    upcoming:'Upcoming', providers:'Anbieter', settings:'Einstellungen',
    watchingNow:'Schaut gerade', stats:'Statistiken', back:'Zurück', fullscreen:'Vollbild',
    miniPlayer:'Miniplayer', stop:'Stop', logout:'Abmelden',
    // Suche
    search:'Film, Serie, Anbieter suchen…',
    // Media-Tabs
    moviesTab:'Filme', showsTab:'Serien', animeTab:'Anime',
    trending:'Trending', newReleases:'Neu',
    // Einstellungen
    bgImage:'Hintergrundbild', accentColor:'Akzentfarbe', fontSize:'Schriftgröße',
    fontFamily:'Schriftart', language:'Sprache',
    designOptions:'Design-Optionen', cardRadius:'Kartenrundung', sidebarWidth:'Sidebar-Breite',
    cardShadow:'Karten-Schatten', glassMode:'Glasmorphismus',
    particles:'Partikel-Hintergrund', particleCount:'Anzahl', particleSize:'Größe',
    particleSpeed:'Geschwindigkeit', particleColor:'Farbe', particleShapes:'Formen',
    // Account
    accountTab:'Account', loggedIn:'Angemeldet', notLoggedIn:'Nicht angemeldet',
    logoutAll:'Von ALLEN Diensten abmelden', googleLogin:'Im Browser bei Google anmelden (YouTube)',
    // Uhr
    clockTab:'Uhr', clockEnabled:'Uhr anzeigen', clockColor:'Farbe',
    clockOpacity:'Transparenz', clockSize:'Schriftgröße', clockDragHint:'💡 Verschiebe die Uhr mit der Maus.',
    clockTypeDigital:'Digital', clockTypeAnalog:'Analog',
    clockSeconds:'Sekunden anzeigen', clockTransparencyHint:'0% = sichtbar · 100% = unsichtbar (deaktiviert)',
    // Plugins
    pluginsTab:'Plugins', pluginSearch:'Plugin suchen…', pluginInstall:'Installieren',
    pluginRemove:'Entfernen', pluginInfo:'Info', pluginDomains:'Geblockte Domains gesamt',
    // Mehr
    moreTab:'Mehr', updates:'Updates', checkUpdates:'Auf Updates prüfen',
    vpn:'VPN', widevine:'Widevine CDM (DRM)', profileManage:'Profil verwalten',
    profileRename:'Profil umbenennen', profileDelete:'Profil löschen',
    providerRestore:'Alle Standardanbieter wiederherstellen',
    providerRestoreSingle:'Einzelnen Anbieter wiederherstellen',
    // Statistiken
    statsTitle:'Statistiken', statsNoData:'Noch keine Stream-Daten.',
    statsTopProviders:'⏱ Meiste Streamzeit (Top 3)', statsWeekdays:'📅 Wochentage',
    statsCrunchyroll:'⛩️ Crunchyroll Release-Kalender',
    statsAchievements:'🏆 Achievements',
    // Achievements-Kategorien
    achCatStream:'⏱ Streamzeit', achCatProvider:'📺 Anbieter', achCatSpecial:'✨ Besonders', achCatHidden:'🔒 Versteckt',
    achHiddenHint:'Versteckte Achievements – durch Spielen freischalten',
    // Gemerkt
    watchlistEmpty:'Noch nichts gemerkt.\nKlicke bei Filmen/Serien auf 🔖',
    // Allgemein
    defaultProfile:'Standardkonto', save:'Gespeichert', cancel:'Abbrechen', close:'Schließen',
    // Wochentage
    days:['So','Mo','Di','Mi','Do','Fr','Sa'],
  },
  en:{
    overview:'Overview', favorites:'Favorites', watchlist:'Watchlist', news:"What's New",
    upcoming:'Upcoming', providers:'Providers', settings:'Settings',
    watchingNow:'Now Watching', stats:'Statistics', back:'Back', fullscreen:'Fullscreen',
    miniPlayer:'Mini Player', stop:'Stop', logout:'Sign out',
    search:'Search movies, shows, providers…',
    moviesTab:'Movies', showsTab:'Shows', animeTab:'Anime',
    trending:'Trending', newReleases:'New',
    bgImage:'Background Image', accentColor:'Accent Color', fontSize:'Font Size',
    fontFamily:'Font Family', language:'Language',
    designOptions:'Design Options', cardRadius:'Card Radius', sidebarWidth:'Sidebar Width',
    cardShadow:'Card Shadow', glassMode:'Glass Effect',
    particles:'Particle Background', particleCount:'Count', particleSize:'Size',
    particleSpeed:'Speed', particleColor:'Color', particleShapes:'Shapes',
    accountTab:'Account', loggedIn:'Logged In', notLoggedIn:'Not Logged In',
    logoutAll:'Sign out of ALL services', googleLogin:'Sign in with Google in browser (YouTube)',
    clockTab:'Clock', clockEnabled:'Show Clock', clockColor:'Color',
    clockOpacity:'Opacity', clockSize:'Font Size', clockDragHint:'💡 Drag the clock with your mouse.',
    clockTypeDigital:'Digital', clockTypeAnalog:'Analog',
    clockSeconds:'Show seconds', clockTransparencyHint:'0% = visible · 100% = invisible (disables)',
    pluginsTab:'Plugins', pluginSearch:'Search plugins…', pluginInstall:'Install',
    pluginRemove:'Remove', pluginInfo:'Info', pluginDomains:'Total blocked domains',
    moreTab:'More', updates:'Updates', checkUpdates:'Check for updates',
    vpn:'VPN', widevine:'Widevine CDM (DRM)', profileManage:'Manage Profile',
    profileRename:'Rename Profile', profileDelete:'Delete Profile',
    providerRestore:'Restore all default providers',
    providerRestoreSingle:'Restore individual provider',
    statsTitle:'Statistics', statsNoData:'No stream data yet.',
    statsTopProviders:'⏱ Most Streamed (Top 3)', statsWeekdays:'📅 Weekdays',
    statsCrunchyroll:'⛩️ Crunchyroll Release Calendar',
    statsAchievements:'🏆 Achievements',
    achCatStream:'⏱ Streaming Time', achCatProvider:'📺 Providers', achCatSpecial:'✨ Special', achCatHidden:'🔒 Hidden',
    achHiddenHint:'Hidden achievements – unlock by playing',
    watchlistEmpty:'Nothing saved yet.\nClick 🔖 on movies/shows to save.',
    defaultProfile:'Default Account', save:'Saved', cancel:'Cancel', close:'Close',
    days:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  },
};

const TMDB_IMG      = 'https://image.tmdb.org/t/p/w300';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function enc(s){return encodeURIComponent(s);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function pad(n){return String(n).padStart(2,'0');}
function getFavicon(id,p){
  const d={apple:'tv.apple.com',adn:'animedigitalnetwork.de',ard:'ardmediathek.de',arte:'arte.tv',burning:'bs.to',cineto:'cine.to',crunchyroll:'crunchyroll.com',dazn:'dazn.com',disney:'disneyplus.com',funk:'funk.net',hbomax:'max.com',joyn:'joyn.de',kika:'kika.de',magenta:'magentatv.de',movie2k:'movie2k.ch',mubi:'mubi.com',netflix:'netflix.com',paramountplus:'paramountplus.com',prime:'primevideo.com',rtl:'plus.rtl.de',skygo:'sky.de',spotify:'open.spotify.com',twitch:'twitch.tv',waipu:'waipu.tv',wow:'wowtv.de',youtube:'youtube.com',zdf:'zdf.de'};
  const domain = d[id] || (p?.url ? (() => { try { return new URL(p.url).hostname; } catch { return 'example.com'; } })() : 'example.com');
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

// ════════════════════════════════
// STATE
// ════════════════════════════════
let settings={}, profiles=[], activeProfileId='default';
let currentProvider=null, currentWebview=null, currentProvUrl=null;
let pipProviderId=null;
let isFullscreen=false, fsHoverTimer=null, fsAutoHide=null;
let clockInterval=null, clockDragEnabled=false, clockDragHandlers=null;
let extraAdDomains=[], installedPlugins=new Set();
let watchlist=[], searchHistory=[], viewHistory=[], providerOrder=[];
let customProviders={};
let lang='de', customCSS='';
let watchTimeTimer=null, sessionRefreshTimerId=null;
let streamTabs=[], activeTabId=null;
let hiddenItems={news:{},upcoming:{}};
let particlesConfig={count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle']};
let particlesAnimId=null;
let autoSaveTimerId=null;
let searchTimer=null, searchPage=1, lastQuery='';
let designOptions={cardRadius:14,sidebarWidth:200,cardShadow:true,glass:false};

const slideshows={
  news:    {items:[],idx:0,timer:null,mediaType:'movies',tab:'trending'},
  upcoming:{items:[],idx:0,timer:null,mediaType:'movies',months:1},
};

function PROVIDERS(){return {...PROVIDERS_BASE,...customProviders};}
function getProfilePartition(id){return `${activeProfileId}_${PROVIDERS()[id]?.partition||id}`;}

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init(){
  settings = await window.electronAPI.getSettings();
  const D = (k,v) => { if(settings[k]===undefined) settings[k]=v; };
  D('favorites',[]); D('cardImages',{}); D('cardImageOffsets',{}); D('cardBgColors',{});
  D('cardBgOpacity',{}); D('cardCustomNames',{}); D('cardCustomTags',{});
  D('clock',{enabled:false,position:{x:16,y:52},color:'#ff3b30',opacity:0.5,size:22});
  D('fontSize',14); D('accentColor','#30c5bb'); D('fontFamily','DM Sans');
  D('hiddenItems',{news:{},upcoming:{}}); D('watchlist',[]); D('searchHistory',[]);
  D('viewHistory',[]); D('providerOrder',[]); D('language','de');
  D('particlesEnabled',false); D('particlesConfig',{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle']});
  D('customCSS',''); D('customProviders',{}); D('newsLastTab','movies'); D('upcomingLastTab','movies');
  D('cardLayout','normal'); D('designOptions',{cardRadius:14,sidebarWidth:200,cardShadow:true,glass:false});

  hiddenItems        = settings.hiddenItems;
  watchlist          = settings.watchlist;
  searchHistory      = settings.searchHistory;
  viewHistory        = settings.viewHistory;
  providerOrder      = settings.providerOrder;
  lang               = settings.language;
  customCSS          = settings.customCSS;
  customProviders    = settings.customProviders;
  particlesConfig    = settings.particlesConfig;
  designOptions      = settings.designOptions;
  slideshows.news.mediaType     = settings.newsLastTab;
  slideshows.upcoming.mediaType = settings.upcomingLastTab;

  applyFontSize(settings.fontSize);
  applyFontFamily(settings.fontFamily);
  applyAccent(settings.accentColor);
  applyLanguage(lang);
  applyCustomCSS(customCSS);
  applyBgImage(settings.appBgImage);
  applyDesignOptions(designOptions);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  extraAdDomains  = await window.electronAPI.getExtraAdDomains();
  installedPlugins = new Set(JSON.parse(localStorage.getItem('installedPlugins')||'[]'));

  profiles        = await window.electronAPI.getProfiles();
  activeProfileId = await window.electronAPI.getActiveProfile();
  buildProfileSelect();

  buildProviderGrid();
  buildSidebarSubMenus();
  // Sort-Button Initialzustand
  document.getElementById('btn-sort-alpha')?.classList.toggle('active',!!settings.sortAlpha);
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
  setupUpdateHandler();
  setupHiddenPanel();
  setupCustomProviderModal();
  setupProfileModals();
  setupVPNPanel();
  checkOnlineStatus();
  startSessionAutoRefresh();
  checkWidevineStatus();

  window.electronAPI.onFullscreenChange(v=>{isFullscreen=v;updateFullscreenUI();});
  window.electronAPI.onSessionsUpdated(r=>renderSessionList(r));
  window.electronAPI.onGoogleAuthDone(()=>showToast('✓ Google-Login erkannt!'));

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
  setInterval(checkOnlineStatus, 30000);
}

// ════════════════════════════════
// HELPERS
// ════════════════════════════════
function autoSave(toast=false){
  clearTimeout(autoSaveTimerId);
  autoSaveTimerId = setTimeout(()=>{
    window.electronAPI.setSettings(settings);
    if(toast) showSaveToast();
  }, 600);
}
function autoSaveAndToast(){ autoSave(true); }
function showSaveToast(){
  const t=document.getElementById('save-toast');if(!t)return;
  t.style.display='block'; setTimeout(()=>t.style.display='none', 2800);
}
let toastTimeout=null;
function showToast(msg,dur=3000){
  const t=document.getElementById('error-toast');if(!t)return;
  t.textContent=msg;t.style.background='rgba(48,197,187,.9)';t.classList.add('show');
  clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),dur);
}
function showLoading(txt='Wird geladen…'){document.getElementById('loading-text').textContent=txt;document.getElementById('loading-overlay').classList.add('active');}
function hideLoading(){document.getElementById('loading-overlay').classList.remove('active');}

// ════════════════════════════════
// LANGUAGE
// ════════════════════════════════
function applyLanguage(l){
  lang=l;
  const t=I18N[l]||I18N.de;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(t[k]!==undefined)el.textContent=t[k];});
  const si=document.getElementById('search-input');if(si)si.placeholder=t.search;
  const ps=document.getElementById('plugin-search');if(ps)ps.placeholder=t.pluginSearch||'Plugin suchen…';
  // Settings-Tabs übersetzen
  const tabMap={appearance:'Design',account:t.accountTab||'Account',clock:t.clockTab||'Uhr',plugins:t.pluginsTab||'Plugins',advanced:t.moreTab||'Mehr'};
  document.querySelectorAll('.stab[data-tab]').forEach(tab=>{const k=tabMap[tab.dataset.tab];if(k)tab.textContent=k;});
  // Settings-Header Titel
  const sh=document.querySelector('.settings-header>span:first-child');if(sh)sh.textContent=t.settings;
  // Statistiken-Titel
  const stEl=document.querySelector('#view-stats .view-title');if(stEl)stEl.textContent=`📊 ${t.statsTitle||'Statistiken'}`;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  window._days=t.days||['So','Mo','Di','Mi','Do','Fr','Sa'];
  // Standardkonto umbenennen
  const defaultP=profiles?.find(p=>p.id==='default');
  if(defaultP&&(defaultP.name==='Standardkonto'||defaultP.name==='Default Account')){
    defaultP.name=t.defaultProfile||'Standardkonto';
    buildProfileSelect();
  }
}

// ════════════════════════════════
// THEME / FONT / ACCENT / CSS
// ════════════════════════════════
function setTheme(t,save=true){
  document.documentElement.setAttribute('data-theme',t);
  const tog=document.getElementById('theme-toggle');if(tog)tog.checked=(t==='light');
  if(save){window.electronAPI.setTheme(t);autoSave();}
}
function setupThemeToggle(){document.getElementById('theme-toggle')?.addEventListener('change',e=>setTheme(e.target.checked?'light':'dark'));}
function applyFontSize(px){document.documentElement.style.setProperty('--fs',px+'px');}
function applyFontFamily(f){
  const map={'DM Sans':"'DM Sans',sans-serif",'Inter':"'Inter',sans-serif",'Rajdhani':"'Rajdhani',sans-serif",'Orbitron':"'Orbitron',sans-serif",'Exo 2':"'Exo 2',sans-serif",'system-ui':'system-ui,sans-serif'};
  const css=map[f]||"'DM Sans',sans-serif";
  // Punkt 21: Schriftart gilt auch für Titel (--font-d)
  document.documentElement.style.setProperty('--font-b',css);
  document.documentElement.style.setProperty('--font-d',css);
  const clk=document.getElementById('clock-widget');if(clk)clk.style.fontFamily=css;
}
function applyAccent(hex){
  document.documentElement.style.setProperty('--acc',hex||'#30c5bb');
  const rgb=hexToRgb(hex||'#30c5bb');
  if(rgb)document.documentElement.style.setProperty('--accg',`rgba(${rgb},.18)`);
}
function applyCustomCSS(css){
  let el=document.getElementById('custom-css-style');
  if(!el){el=document.createElement('style');el.id='custom-css-style';document.head.appendChild(el);}
  el.textContent=css||'';
}
function applyBgImage(url){
  const mc=document.getElementById('main-content');if(!mc)return;
  if(url){mc.style.backgroundImage=`url("${url}")`;mc.style.backgroundSize='cover';mc.style.backgroundPosition='center';mc.classList.add('has-bg');document.documentElement.style.setProperty('--bgs','rgba(10,10,20,0.75)');}
  else{mc.style.backgroundImage='';mc.classList.remove('has-bg');document.documentElement.style.removeProperty('--bgs');}
}
function applyDesignOptions(opts){
  if(!opts) return;
  document.documentElement.style.setProperty('--r',`${opts.cardRadius||14}px`);
  document.documentElement.style.setProperty('--r-sm',`${Math.max(4,(opts.cardRadius||14)-5)}px`);
  document.documentElement.style.setProperty('--sw',`${opts.sidebarWidth||200}px`);
  document.getElementById('main-content')?.style.setProperty('left',`${opts.sidebarWidth||200}px`);
  document.getElementById('sidebar')?.style.setProperty('width',`${opts.sidebarWidth||200}px`);
  if(opts.glass) document.body.classList.add('glass-mode'); else document.body.classList.remove('glass-mode');
}
function hexToRgb(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null;}

// ════════════════════════════════
// PARTICLES
// ════════════════════════════════
function setupParticles(){
  const canvas=document.getElementById('particles-canvas');if(!canvas)return;
  if(particlesAnimId){cancelAnimationFrame(particlesAnimId);particlesAnimId=null;}
  canvas.style.display=settings.particlesEnabled?'block':'none';
  if(!settings.particlesEnabled)return;
  const ctx=canvas.getContext('2d');
  let w=canvas.width=window.innerWidth, h=canvas.height=window.innerHeight;
  const cfg=particlesConfig||{count:80,size:1.5,speed:1,color:'#30c5bb',shapes:['circle']};
  const shapes=cfg.shapes?.length?cfg.shapes:['circle'];
  const pts=Array.from({length:cfg.count||80},()=>({
    x:Math.random()*w, y:Math.random()*h,
    r:Math.random()*(cfg.size||1.5)+.4,
    vx:(Math.random()-.5)*(cfg.speed||1)*.7,
    vy:(Math.random()-.5)*(cfg.speed||1)*.7,
    op:Math.random()*.5+.1, rot:Math.random()*Math.PI*2,
    shape:shapes[Math.floor(Math.random()*shapes.length)],
  }));
  const onResize=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;};
  window.addEventListener('resize',onResize);
  function drawShape(ctx,p){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    const col=cfg.color||'#30c5bb';
    ctx.fillStyle=col+Math.round(p.op*255).toString(16).padStart(2,'0');
    ctx.strokeStyle=col+Math.round(p.op*255).toString(16).padStart(2,'0');
    ctx.lineWidth=.8;
    const r=p.r;
    switch(p.shape){
      case 'circle': ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();break;
      case 'triangle': ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.lineTo(r,r*.8);ctx.lineTo(-r,r*.8);ctx.closePath();ctx.fill();break;
      case 'diamond': ctx.beginPath();ctx.moveTo(0,-r*1.6);ctx.lineTo(r,0);ctx.lineTo(0,r*1.6);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();break;
      case 'star': ctx.beginPath();for(let i=0;i<5;i++){ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*r,-Math.sin((18+i*72)*Math.PI/180)*r);ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*r*.45,-Math.sin((54+i*72)*Math.PI/180)*r*.45);}ctx.closePath();ctx.fill();break;
      case 'line': ctx.beginPath();ctx.moveTo(-r*2.5,0);ctx.lineTo(r*2.5,0);ctx.stroke();break;
      case 'hex': ctx.beginPath();for(let i=0;i<6;i++){ctx.lineTo(r*Math.cos(i*Math.PI/3),r*Math.sin(i*Math.PI/3));}ctx.closePath();ctx.fill();break;
      case 'cross': ctx.fillRect(-r*.2,-r,r*.4,r*2);ctx.fillRect(-r,-r*.2,r*2,r*.4);break;
      case 'arrow': ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(r*.4,-r*.5);ctx.lineTo(r,0);ctx.lineTo(r*.4,r*.5);ctx.stroke();break;
      case 'ring': ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.lineWidth=r*.35;ctx.stroke();break;
      case 'dot': ctx.beginPath();ctx.arc(0,0,r*.4,0,Math.PI*2);ctx.fill();break;
      default: ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function tick(){
    ctx.clearRect(0,0,w,h);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.rot+=.003*(cfg.speed||1);
      if(p.x<-10)p.x=w+10;if(p.x>w+10)p.x=-10;
      if(p.y<-10)p.y=h+10;if(p.y>h+10)p.y=-10;
      drawShape(ctx,p);
    });
    particlesAnimId=requestAnimationFrame(tick);
  }
  tick();
}

// ════════════════════════════════
// ONLINE CHECK / UPDATE
// ════════════════════════════════
async function checkOnlineStatus(){
  const on=await window.electronAPI.checkOnline();
  const b=document.getElementById('offline-banner');
  if(b) b.style.display=on?'none':'flex';
  // Fanboy Annoyance blockiert manchmal ipapi.co → "Keine Verbindung" erscheint fälschlich
}

function setupUpdateHandler(){
  window.electronAPI.onUpdateAvailable(info=>{
    const badge=document.getElementById('update-badge');if(badge)badge.style.display='block';
    const el=document.getElementById('update-check-result');
    if(el){el.textContent=`🚀 Update v${info.version} verfügbar! Herunterladen…`;el.style.color='var(--acc)';}
    showToast(`🚀 Update v${info.version} verfügbar!`,5000);
  });
  window.electronAPI.onUpdateNotAvailable(()=>{
    const el=document.getElementById('update-check-result');
    if(el){el.textContent='✓ Du hast bereits die aktuellste Version.';el.style.color='var(--acc)';}
  });
  window.electronAPI.onUpdateDownloaded(()=>{
    const el=document.getElementById('update-check-result');
    if(el){el.textContent='✓ Update heruntergeladen – beim nächsten Start wird es installiert.';el.style.color='var(--acc)';}
    showToast('Update heruntergeladen – wird beim Neustart installiert.',6000);
  });
  window.electronAPI.onUpdateError(msg=>{
    const el=document.getElementById('update-check-result');
    if(!el)return;
    if(msg.includes('app-update.yml')||msg.includes('404')){
      el.textContent='ℹ Noch keine öffentliche GitHub-Release vorhanden. Erstelle einen Tag v'+require?.('../../package.json')?.version+' um Releases zu aktivieren.';
    }else{
      el.textContent='Fehler: '+msg;
    }
    el.style.color='var(--tx2)';
  });
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
  const pip=document.getElementById('pip-window');if(pip){pip.style.display='none';document.getElementById('pip-content').innerHTML='';}
  pipProviderId=null;
  // Stream stoppen
  if(currentWebview){const w=document.getElementById('webview-wrap');if(w)w.innerHTML='';currentWebview=null;currentProvider=null;}
  // Aktuelle Profildaten sichern
  const cur=profiles.find(p=>p.id===activeProfileId);
  if(cur){cur.favorites=settings.favorites;cur.watchlist=watchlist;cur.searchHistory=searchHistory;cur.viewHistory=viewHistory;}
  // Neues Profil
  const next=profiles.find(p=>p.id===id);
  if(next){
    activeProfileId=id;
    settings.favorites   =next.favorites   ||[];
    watchlist            =next.watchlist   ||[];
    searchHistory        =next.searchHistory||[];
    viewHistory          =next.viewHistory  ||[];
    window.electronAPI.setActiveProfile(id);
    window.electronAPI.setProfiles(profiles);
    startSessionAutoRefresh();
    buildProviderGrid();buildSidebarSubMenus();
    showView('home');
  }
}

function setupProfileModals(){
  document.getElementById('btn-add-profile')?.addEventListener('click',()=>{document.getElementById('profile-modal').style.display='flex';document.getElementById('new-profile-name').value='';document.getElementById('new-profile-name').focus();});
  document.getElementById('btn-create-profile')?.addEventListener('click',()=>{
    const name=document.getElementById('new-profile-name').value.trim();if(!name)return;
    const id=`profile_${Date.now()}`;
    profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});
    window.electronAPI.setProfiles(profiles);buildProfileSelect();switchProfile(id);
    document.getElementById('profile-modal').style.display='none';
  });
  document.getElementById('btn-cancel-profile')?.addEventListener('click',()=>document.getElementById('profile-modal').style.display='none');
  document.getElementById('btn-delete-profile')?.addEventListener('click',()=>{
    if(profiles.length<=1){showToast('Mindestens ein Profil erforderlich.');return;}
    const cur=profiles.find(p=>p.id===activeProfileId);
    document.getElementById('delete-profile-text').textContent=`Profil „${cur?.name||activeProfileId}" und alle seine Anmeldungen werden gelöscht.`;
    document.getElementById('delete-profile-modal').style.display='flex';
  });
  document.getElementById('btn-confirm-delete-profile')?.addEventListener('click',()=>{
    window.electronAPI.clearAllSessions(activeProfileId);
    profiles=profiles.filter(p=>p.id!==activeProfileId);
    window.electronAPI.setProfiles(profiles);
    document.getElementById('delete-profile-modal').style.display='none';
    switchProfile(profiles[0].id);buildProfileSelect();
  });
  document.getElementById('btn-cancel-delete-profile')?.addEventListener('click',()=>document.getElementById('delete-profile-modal').style.display='none');
}

// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation(){
  document.querySelectorAll('[data-view]').forEach(btn=>{
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
  const provBtn=document.getElementById('nav-providers-toggle'),provSub=document.getElementById('nav-sub-providers');
  provBtn?.addEventListener('click',()=>{provBtn.classList.toggle('open');provSub?.classList.toggle('open');});

  document.addEventListener('mousedown',e=>{
    if(provSub?.classList.contains('open')&&!provSub.contains(e.target)&&!provBtn?.contains(e.target)){provSub.classList.remove('open');provBtn?.classList.remove('open');}
    const favSub=document.getElementById('nav-sub-favorites'),favBtn=document.getElementById('nav-fav-toggle');
    if(favSub?.classList.contains('open')&&!favSub.contains(e.target)&&!favBtn?.contains(e.target)){favSub.classList.remove('open');favBtn?.classList.remove('open');}
    const dd=document.getElementById('search-dropdown');
    if(dd&&dd.style.display!=='none'){const wrap=document.getElementById('search-bar')?.closest('.search-bar-wrap');if(wrap&&!wrap.contains(e.target))dd.style.display='none';}
  });

  document.getElementById('fav-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-favorites-list',e.target.value));
  document.getElementById('prov-search')?.addEventListener('input',e=>filterSubMenu('nav-sub-providers-list',e.target.value));

  // News switcher
  document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const mt=btn.dataset.media;slideshows.news.mediaType=mt;settings.newsLastTab=mt;autoSave();loadNews(mt,slideshows.news.tab);
  }));
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(tab=>tab.addEventListener('click',()=>{
    document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');
    slideshows.news.tab=tab.dataset.newsTab;loadNews(slideshows.news.mediaType,tab.dataset.newsTab);
  }));
  // Upcoming switcher
  document.querySelectorAll('#upcoming-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('#upcoming-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const mt=btn.dataset.media;slideshows.upcoming.mediaType=mt;settings.upcomingLastTab=mt;autoSave();loadUpcoming(mt,slideshows.upcoming.months);
  }));
  document.querySelectorAll('.range-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    slideshows.upcoming.months=parseInt(btn.dataset.months);loadUpcoming(slideshows.upcoming.mediaType,slideshows.upcoming.months);
  }));
  // Watchlist switcher
  document.querySelectorAll('#wl-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('#wl-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');buildWatchlist(btn.dataset.wlCat);
  }));
  document.getElementById('wl-sort')?.addEventListener('change',()=>buildWatchlist(document.querySelector('#wl-switcher .active')?.dataset.wlCat||'all'));
  // Home: + Button für Custom Provider
  document.getElementById('btn-add-provider-home')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='flex');
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));

  // Fix 5: Alphabetisch sortieren Toggle
  document.getElementById('btn-sort-alpha')?.addEventListener('click',()=>{
    settings.sortAlpha=!settings.sortAlpha;autoSave();buildProviderGrid();
    document.getElementById('btn-sort-alpha')?.classList.toggle('active',!!settings.sortAlpha);
  });

  // Fix 6: Einzelne Anbieter wiederherstellen
  document.getElementById('btn-restore-single-open')?.addEventListener('click',()=>{
    const list=document.getElementById('restore-single-list');if(!list)return;
    const deleted=settings.deletedProviders||[];
    if(!deleted.length){showToast('Keine gelöschten Anbieter.');return;}
    list.style.display=list.style.display==='none'?'block':'none';
    list.innerHTML='';
    deleted.forEach(id=>{
      const p=PROVIDERS_BASE[id];if(!p)return;
      const btn=document.createElement('button');
      btn.className='pick-btn';btn.style.cssText='width:100%;text-align:left;margin-bottom:4px';
      btn.textContent=`↺ ${p.name}`;
      btn.addEventListener('click',()=>{
        settings.deletedProviders=deleted.filter(d=>d!==id);
        autoSave();buildProviderGrid();buildSidebarSubMenus();
        btn.remove();showToast(`${p.name} wiederhergestellt.`);
      });
      list.appendChild(btn);
    });
  });

  // Punkt 17: Crunchyroll-Kalender in Sidebar
  setupSidebarCrunchyroll();
}

function setupToggle(btnId,subId){const btn=document.getElementById(btnId),sub=document.getElementById(subId);btn?.addEventListener('click',()=>{btn.classList.toggle('open');sub?.classList.toggle('open');});}
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
// NEWS
// ════════════════════════════════
async function loadNews(mediaType='movies',tab='trending'){
  slideshows.news.mediaType=mediaType;slideshows.news.tab=tab;
  document.querySelectorAll('#news-switcher .media-type-text-btn').forEach(b=>b.classList.toggle('active',b.dataset.media===mediaType));
  document.querySelectorAll('#news-tab-btns .news-tab').forEach(t=>t.classList.toggle('active',t.dataset.newsTab===tab));
  const data = tab==='trending' ? await window.electronAPI.getTrending().catch(()=>({})) : await window.electronAPI.getNewReleases().catch(()=>({}));
  const raw = mediaType==='movies'?(data.movies||[]):mediaType==='shows'?(data.shows||[]):(data.anime||[]);
  slideshows.news.items=raw.filter(i=>!hiddenItems.news?.[i.id]);
  buildFullSlideshow('news');
}

// ════════════════════════════════
// UPCOMING
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
  if(!items.length){track.innerHTML='<div style="color:rgba(255,255,255,.4);padding:20px">Keine Daten.</div>';if(titleEl)titleEl.textContent='';return;}

  items.forEach((item,i)=>{
    const title=item.title||item.name||'Unbekannt';
    const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:null;
    const rd=item.release_date||item.first_air_date||'';
    const year=rd.substring(0,4);
    const fmtDate=rd&&key==='upcoming'?new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):null;
    const tmdbType=item.title?'movie':'tv';
    const isInWl=!!watchlist.find(w=>w.id===`${tmdbType}_${item.id}`);

    const card=document.createElement('div');
    card.className='slide-card'+(i===0?' active-slide':'');
    card.dataset.idx=i;
    card.innerHTML=`
      <div class="slide-bookmark-wrap">
        <button class="slide-bookmark-btn${isInWl?' bookmarked':''}" title="Merken">🔖</button>
      </div>
      <div class="slide-hide-wrap">
        <button class="slide-hide-btn" title="Ausblenden">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8"/></svg>
        </button>
      </div>
      <div class="slide-card-inner">
        ${poster?`<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">`:
          `<div class="slide-card-poster-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`}
        <div class="slide-card-body">
          <div class="slide-card-title">${esc(title)}</div>
          <div style="font-size:9px;color:rgba(255,255,255,.45);margin-top:2px;display:flex;gap:4px;flex-wrap:wrap">
            ${year?`<span>${year}</span>`:''}
            ${fmtDate?`<span style="color:var(--acc)">📅 ${fmtDate}</span>`:''}
          </div>
        </div>
      </div>`;

    card.querySelector('.slide-bookmark-btn').addEventListener('click',e=>{
      e.stopPropagation();const wlId=`${tmdbType}_${item.id}`;
      if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.classList.remove('bookmarked');}
      else{watchlist.unshift({id:wlId,tmdbId:item.id,tmdbType,title,poster:poster||'',releaseDate:rd,mediaType:tmdbType==='tv'?'tv':'movie'});e.target.classList.add('bookmarked');}
      settings.watchlist=watchlist;autoSave();
    });
    card.querySelector('.slide-hide-btn').addEventListener('click',e=>{
      e.stopPropagation();card.classList.add('fading');
      card.addEventListener('animationend',()=>{
        const ns=key==='news'?'news':'upcoming';
        if(!hiddenItems[ns])hiddenItems[ns]={};
        hiddenItems[ns][item.id]={title,poster:poster||'',tmdbId:item.id,tmdbType,releaseDate:rd};
        settings.hiddenItems=hiddenItems;autoSave();
        ss.items=ss.items.filter(it=>it.id!==item.id);buildFullSlideshow(key);
      },{once:true});
    });
    card.querySelector('.slide-card-inner').addEventListener('click',()=>{ goToSlide(key,i); showDetailPopup(item.id,tmdbType,title); });
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
  const track=document.getElementById(`${key}-track`),dots=document.getElementById(`${key}-dots`);if(!track||!dots)return;
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
  document.getElementById('news-show-hidden')?.addEventListener('click',()=>showHiddenPanel('news'));
  document.getElementById('upcoming-show-hidden')?.addEventListener('click',()=>showHiddenPanel('upcoming'));
  const overlay=document.getElementById('hidden-overlay');
  document.getElementById('hidden-close')?.addEventListener('click',()=>overlay.style.display='none');
  overlay?.addEventListener('click',e=>{if(e.target===overlay)overlay.style.display='none';});
}

function showHiddenPanel(ns){
  const overlay=document.getElementById('hidden-overlay'),grid=document.getElementById('hidden-grid');if(!overlay||!grid)return;
  const hidden=hiddenItems[ns]||{};const ids=Object.keys(hidden);
  if(!ids.length){showToast('Keine ausgeblendeten Einträge.');return;}
  grid.innerHTML='';
  ids.forEach(id=>{
    const item=hidden[id];const card=document.createElement('div');card.className='hidden-card';
    card.innerHTML=`${item.poster?`<img class="hidden-card-poster" src="${item.poster}" loading="lazy"/>`:'<div class="hidden-card-poster" style="aspect-ratio:2/3;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:28px">🎬</div>'}<div class="hidden-card-body"><div class="hidden-card-title">${esc(item.title||id)}</div></div><button class="hidden-restore-btn">Einblenden</button>`;
    card.querySelector('.hidden-restore-btn').addEventListener('click',()=>{
      card.classList.add('restoring');
      card.addEventListener('transitionend',()=>{
        delete hidden[id];settings.hiddenItems=hiddenItems;autoSave();card.remove();
        if(ns==='news')loadNews(slideshows.news.mediaType,slideshows.news.tab);else loadUpcoming(slideshows.upcoming.mediaType,slideshows.upcoming.months);
        if(!Object.keys(hidden).length)overlay.style.display='none';
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
  ['detail-title','detail-overview'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=id==='detail-title'?title||'Lädt…':''});
  document.getElementById('detail-poster').src='';
  document.getElementById('detail-backdrop').style.backgroundImage='';
  document.getElementById('detail-meta').innerHTML='';
  document.getElementById('detail-providers').innerHTML='';
  document.getElementById('detail-badges').innerHTML='';
  document.getElementById('detail-actions').innerHTML='';
  document.getElementById('detail-trailer-wrap').style.display='none';
  const wv=document.getElementById('detail-trailer-wv');if(wv)wv.setAttribute('src','about:blank');

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
  document.getElementById('detail-overview').textContent=detail.overview||'Keine Beschreibung.';
  const pEl=document.getElementById('detail-poster');if(pEl&&poster){pEl.src=poster;pEl.alt=t;}
  const bEl=document.getElementById('detail-backdrop');if(bEl&&backdrop)bEl.style.backgroundImage=`url("${backdrop}")`;

  // Bewertungen NUR im Detail-Popup
  document.getElementById('detail-badges').innerHTML=[year,runtime,rating?`★ ${rating}`:null,tmdbType==='tv'?'Serie':'Film'].filter(Boolean).map(p=>`<span class="detail-badge">${esc(p)}</span>`).join('');
  document.getElementById('detail-meta').innerHTML=[genres?`<div class="detail-meta-item"><span class="detail-meta-label">Genre: </span>${esc(genres)}</div>`:'',detail.vote_count?`<div class="detail-meta-item"><span class="detail-meta-label">Stimmen: </span>${detail.vote_count.toLocaleString('de')}</div>`:''].filter(Boolean).join('');

  // Trailer – youtube-nocookie kein Fehler 153
  const trailer=videos.find(v=>v.site==='YouTube'&&v.type==='Trailer')||videos.find(v=>v.site==='YouTube');
  if(trailer){
    document.getElementById('detail-trailer-wrap').style.display='block';
    const wv=document.getElementById('detail-trailer-wv');
    if(wv)wv.setAttribute('src',`https://www.youtube-nocookie.com/embed/${trailer.key}?rel=0&modestbranding=1`);
  }

  // Provider – NUR DE-verfügbare, kein undefined
  const provWrap=document.getElementById('detail-providers');
  if(provWrap&&providers){
    const all=[...(providers.flatrate||[]),(providers.rent||[]),(providers.buy||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i&&p.provider_name&&p.logo_path).slice(0,8);
    provWrap.innerHTML=all.length
      ?all.map(p=>{const ourId=TMDB_PROVIDER_MAP[p.provider_id];return`<div class="detail-provider-chip"${ourId?` onclick="openProvider('${ourId}')" style="cursor:pointer"`:''} title="${esc(p.provider_name)}"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;}).join('')
      :'<span style="font-size:11px;color:var(--tx3)">Nicht in DE verfügbar</span>';
  }

  const actions=document.getElementById('detail-actions');
  if(actions){
    const isInWl=!!watchlist.find(w=>w.id===`${tmdbType}_${tmdbId}`);
    actions.innerHTML=`
      <button class="detail-action-btn primary" id="d-wse">↗ Wo streamen?</button>
      <button class="detail-action-btn secondary" id="d-ggl">🔍 Google</button>
      <button class="detail-action-btn secondary" id="d-wl">${isInWl?'🔖 Gemerkt':'🔖 Merken'}</button>`;
    document.getElementById('d-wse').addEventListener('click',()=>openProviderAtUrl('werstreamt',`https://www.werstreamt.es/?q=${enc(t)}`,'Werstreamt.es','persist:werstreamt'));
    document.getElementById('d-ggl').addEventListener('click',()=>window.electronAPI.openExternal(`https://www.google.com/search?q=${enc(t+' stream deutsch')}`));
    document.getElementById('d-wl').addEventListener('click',e=>{
      const wlId=`${tmdbType}_${tmdbId}`;
      if(watchlist.find(w=>w.id===wlId)){watchlist=watchlist.filter(w=>w.id!==wlId);e.target.textContent='🔖 Merken';}
      else{watchlist.unshift({id:wlId,tmdbId,tmdbType,title:t,poster,releaseDate:detail.release_date||detail.first_air_date||'',mediaType:tmdbType==='tv'?'tv':'movie'});e.target.textContent='🔖 Gemerkt';}
      settings.watchlist=watchlist;autoSave();
    });
  }

  document.getElementById('detail-close').onclick=closeDetailPopup;
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeDetailPopup();});
}

function closeDetailPopup(){
  document.getElementById('detail-overlay').style.display='none';
  const wv=document.getElementById('detail-trailer-wv');if(wv)wv.setAttribute('src','about:blank');
}

window.openProvider=id=>openProvider(id);
window.openProviderAtUrl=(id,url,name,part)=>openProviderAtUrl(id,url,name,part);

// ════════════════════════════════
// SEARCH – Enter-only für Verlauf
// ════════════════════════════════
function setupSearch(){
  const input=document.getElementById('search-input'),clear=document.getElementById('search-clear'),dd=document.getElementById('search-dropdown');

  input?.addEventListener('focus',()=>{
    if(!input.value.trim()&&searchHistory.length)showHistory(dd);
    else if(input.value.trim()&&dd.innerHTML)dd.style.display='block';
  });
  input?.addEventListener('input',()=>{
    const q=input.value.trim();clear.style.display=q?'block':'none';
    clearTimeout(searchTimer);
    if(!q){dd.style.display=searchHistory.length?'block':'none';if(searchHistory.length)showHistory(dd);else{dd.innerHTML='';dd.style.display='none';}return;}
    lastQuery=q;searchPage=1;
    // YouTube-Link sofort erkennen
    const ytId=extractYtId(q);
    if(ytId){showYtResult(q,ytId,dd);return;}
    // Sofortige Anbieter-Vorschläge
    showInstantProviders(q,dd);
    // TMDB nach 220ms (kein Verlauf-Eintrag!)
    searchTimer=setTimeout(()=>runSearch(q,1,dd,false),220);
  });
  // Enter → Suche + Verlauf-Eintrag
  input?.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const q=input.value.trim();if(!q)return;
      clearTimeout(searchTimer);
      addToSearchHistory(q);
      runSearch(q,1,dd,true);
    }
  });
  clear?.addEventListener('click',()=>{input.value='';clear.style.display='none';dd.style.display='none';dd.innerHTML='';lastQuery='';});
}

function showHistory(dd){
  let html=`<div class="search-dd-section">Zuletzt gesucht <button class="search-dd-clear-history" id="dd-clear-all">Alle löschen</button></div>`;
  searchHistory.slice(0,8).forEach((q,i)=>{
    html+=`<div class="search-dd-history-item"><span class="search-dd-history-text" data-q="${esc(q)}">🕐 ${esc(q)}</span><button class="search-dd-history-del" data-i="${i}">✕</button></div>`;
  });
  dd.innerHTML=html;dd.style.display='block';
  dd.querySelector('#dd-clear-all')?.addEventListener('click',()=>{searchHistory=[];settings.searchHistory=[];autoSave();dd.style.display='none';});
  dd.querySelectorAll('.search-dd-history-text').forEach(el=>el.addEventListener('click',()=>{const q=el.dataset.q;document.getElementById('search-input').value=q;runSearch(q,1,dd,false);}));
  dd.querySelectorAll('.search-dd-history-del').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();const i=parseInt(el.dataset.i);searchHistory.splice(i,1);settings.searchHistory=searchHistory;autoSave();showHistory(dd);}));
}

function showInstantProviders(q,dd){
  const ql=q.toLowerCase();
  const matches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql)).sort((a,b)=>a[1].name.toLowerCase().indexOf(ql)-b[1].name.toLowerCase().indexOf(ql));
  if(!matches.length)return;
  let html=`<div class="search-dd-section">Anbieter</div>`;
  matches.slice(0,4).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`;});
  dd.innerHTML=html;dd.style.display='block';
  dd.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
}

async function runSearch(q,page=1,dd,addHistory=false){
  if(addHistory)addToSearchHistory(q);
  dd.style.display='block';
  const ql=q.toLowerCase();
  const provMatches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql));
  let html='';
  if(provMatches.length&&page===1){
    html+=`<div class="search-dd-section">Anbieter</div>`;
    provMatches.slice(0,3).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc(p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`;});
  }

  try{
    const tmdbData=await window.electronAPI.searchTmdb({query:q,page});
    const results=(tmdbData.results||[]).filter(r=>r.media_type!=='person'&&r.poster_path).slice(0,8);
    if(results.length){
      if(page===1)html+=`<div class="search-dd-section">Filme &amp; Serien</div>`;
      for(const item of results){
        const title=item.title||item.name||'';
        const year=(item.release_date||item.first_air_date||'').substring(0,4);
        const type=item.media_type==='movie'?'Film':'Serie';
        const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';
        html+=`<div class="search-dd-item search-dd-film" data-tmdb="${item.id}" data-type="${item.media_type}" data-title="${esc(title)}">
          ${poster?`<img class="search-dd-poster" src="${poster}" onerror="this.outerHTML='<div class=search-dd-poster-ph>🎬</div>'"/>`:'<div class="search-dd-poster-ph">🎬</div>'}
          <div class="search-dd-info">
            <div class="search-dd-title">${esc(title)}</div>
            <div class="search-dd-meta"><span class="search-dd-badge">${type}</span>${year?`<span>${year}</span>`:''}</div>
            <div class="search-dd-providers" id="chips_${item.id}"><span style="font-size:10px;color:var(--tx3)">Lädt…</span></div>
          </div></div>`;
      }
      const hasMore=(tmdbData.total_results||0)>page*8;
      if(hasMore)html+=`<div class="search-dd-more" id="dd-more-btn">Weitere Ergebnisse ↓</div>`;
      else html+=`<div class="search-dd-no-more">Keine weiteren Ergebnisse.</div>`;
    }else if(!provMatches.length){html+=`<div style="padding:16px 14px;text-align:center;font-size:13px;color:var(--tx2)">Keine Ergebnisse für „${esc(q)}"</div>`;}
  }catch{}

  if(page===1)dd.innerHTML=html;
  else{
    const mb=document.getElementById('dd-more-btn');if(mb)mb.remove();
    const nm=dd.querySelector('.search-dd-no-more');if(nm)nm.remove();
    const tmp=document.createElement('div');tmp.innerHTML=html;
    tmp.querySelectorAll('.search-dd-item').forEach(el=>dd.appendChild(el));
    const nm2=tmp.querySelector('.search-dd-no-more');if(nm2)dd.appendChild(nm2);
    const mb2=tmp.querySelector('#dd-more-btn');if(mb2)dd.appendChild(mb2);
    dd.scrollTo({top:dd.scrollHeight,behavior:'smooth'});
  }
  dd.style.display='block';

  dd.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.open)));
  dd.querySelectorAll('.search-dd-film').forEach(el=>{
    el.addEventListener('click',e=>{if(e.target.closest('.search-dd-provider-chip'))return;dd.style.display='none';showDetailPopup(parseInt(el.dataset.tmdb),el.dataset.type,el.dataset.title);});
    loadProviderChips(parseInt(el.dataset.tmdb),el.dataset.type,`chips_${el.dataset.tmdb}`);
  });
  dd.querySelector('#dd-more-btn')?.addEventListener('click',()=>{searchPage++;runSearch(lastQuery,searchPage,dd,false);});
}

async function loadProviderChips(tmdbId,type,containerId){
  try{
    const providers=await window.electronAPI.getStreamingProviders({tmdbId,type});
    const container=document.getElementById(containerId);if(!container)return;
    const all=[...(providers?.flatrate||[]),(providers?.rent||[]),(providers?.buy||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i&&p.provider_name&&p.logo_path).slice(0,4);
    if(all.length){
      container.innerHTML=all.map(p=>{const ourId=TMDB_PROVIDER_MAP[p.provider_id];return`<div class="search-dd-provider-chip"${ourId?` data-prov="${ourId}"`:''}><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;}).join('');
      container.querySelectorAll('[data-prov]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProvider(el.dataset.prov);}));
    }else{container.innerHTML='<span style="font-size:10px;color:var(--tx3)">Nicht in DE verfügbar</span>';}
  }catch{const c=document.getElementById(containerId);if(c)c.innerHTML='';}
}

function addToSearchHistory(q){if(!q||searchHistory.includes(q))return;searchHistory.unshift(q);searchHistory=searchHistory.slice(0,20);settings.searchHistory=searchHistory;autoSave();}

function showYtResult(q,ytId,dd){
  dd.innerHTML=`<div class="search-dd-section">YouTube</div>
    <div class="search-dd-item" id="yt-result-item">
      <img class="search-dd-poster" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover" onerror="this.style.display='none'"/>
      <div class="search-dd-info">
        <div class="search-dd-title">YouTube Video abspielen</div>
        <div class="search-dd-meta">Direkt in OmniSight öffnen · <span style="font-size:10px;color:var(--tx3)">${esc(ytId)}</span></div>
      </div>
    </div>`;
  dd.style.display='block';
  document.getElementById('yt-result-item')?.addEventListener('click',()=>{
    dd.style.display='none';
    openProviderAtUrl('youtube',`https://www.youtube.com/watch?v=${ytId}`,'YouTube',`persist:${getProfilePartition('youtube')}`);
  });
}

// ════════════════════════════════
// CRUNCHYROLL KALENDER
// ════════════════════════════════
async function loadCrunchyrollCalendar(container){
  container.innerHTML='<div style="color:var(--tx2);font-size:13px;padding:10px">Lädt Crunchyroll-Kalender…</div>';
  try{
    // Crunchyroll RSS Feed für neue Episoden
    const rssUrl='https://feeds.feedburner.com/crunchyroll/rss';
    // Alternativ: TMDB Anime-Kalender (DE-verfügbar)
    const today=new Date();
    const future=new Date(today);future.setDate(today.getDate()+7);
    const fmt=d=>d.toISOString().split('T')[0];
    const resp=await window.electronAPI.getUpcoming(1);
    const anime=(resp.anime||[]).slice(0,12);

    if(!anime.length){container.innerHTML='<div style="color:var(--tx2);font-size:13px;padding:10px">Keine kommenden Anime-Releases gefunden.</div>';return;}

    container.innerHTML='';
    // Nach Datum gruppieren
    const byDate={};
    anime.forEach(item=>{
      const d=item.first_air_date||item.release_date||'';
      const key=d||'Unbekannt';
      if(!byDate[key])byDate[key]=[];
      byDate[key].push(item);
    });

    Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).forEach(([date,items])=>{
      const dateLabel=date!=='Unbekannt'?new Date(date).toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long'}):'Datum unbekannt';
      const section=document.createElement('div');
      section.style.cssText='margin-bottom:20px';
      section.innerHTML=`<div style="font-family:var(--font-d);font-size:14px;font-weight:700;color:var(--acc);margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid var(--bor)">${dateLabel}</div>`;
      const grid=document.createElement('div');
      grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px';
      items.forEach(item=>{
        const title=item.title||item.name||'Unbekannt';
        const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';
        const card=document.createElement('div');
        card.style.cssText='background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .2s,border-color .2s';
        card.innerHTML=`${poster?`<img src="${poster}" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block" loading="lazy" onerror="this.style.display='none'"/>`:''}<div style="padding:7px 8px"><div style="font-size:11px;font-weight:600;color:var(--tx);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(title)}</div><div style="font-size:9px;color:var(--acc);margin-top:2px;font-weight:600">Crunchyroll</div></div>`;
        card.addEventListener('mouseenter',()=>{card.style.transform='translateY(-3px)';card.style.borderColor='var(--acc)';});
        card.addEventListener('mouseleave',()=>{card.style.transform='';card.style.borderColor='';});
        card.addEventListener('click',()=>showDetailPopup(item.id,item.title?'movie':'tv',title));
        grid.appendChild(card);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });

    // Crunchyroll-Button
    const cta=document.createElement('button');
    cta.className='detail-action-btn primary';
    cta.style.cssText='margin-top:10px;width:auto';
    cta.innerHTML='▶ Alle auf Crunchyroll ansehen';
    cta.addEventListener('click',()=>openProvider('crunchyroll'));
    container.appendChild(cta);

  }catch(e){container.innerHTML=`<div style="color:var(--danger);font-size:13px;padding:10px">Fehler: ${e.message}</div>`;}
}

// ════════════════════════════════
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid(){
  const grid=document.getElementById('providers-grid');if(!grid)return;
  grid.innerHTML='';
  const layout=settings.cardLayout||'normal';
  grid.className='providers-grid'+(layout!=='normal'?' '+layout:'');
  ['normal','compact','mini'].forEach(l=>document.getElementById(`layout-${l}`)?.classList.toggle('active',l===layout));

  // Sort toggle button state
  const sortBtn=document.getElementById('btn-sort-alpha');
  if(sortBtn)sortBtn.classList.toggle('active',!!settings.sortAlpha);

  const favs=settings.favorites||[];
  const deleted=settings.deletedProviders||[];
  // Gelöschte rausfiltern
  let all=Object.entries(PROVIDERS()).filter(([id])=>!deleted.includes(id));

  let sorted;
  if(settings.sortAlpha){
    // Alphabetisch – keine manuelle Sortierung beachten
    sorted=all.sort((a,b)=>a[1].name.localeCompare(b[1].name));
  }else{
    sorted=all.sort((a,b)=>a[1].name.localeCompare(b[1].name));
    if(providerOrder.length)sorted=sorted.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai===-1&&bi===-1)return a[1].name.localeCompare(b[1].name);if(ai===-1)return 1;if(bi===-1)return-1;return ai-bi;});
  }

  const favL=sorted.filter(([id])=>favs.includes(id));
  const rest=sorted.filter(([id])=>!favs.includes(id));
  if(favL.length){addGridLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addGridLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}
  if(!settings.sortAlpha)setupCardDragDrop(grid);
}

function addGridLabel(grid,text){const el=document.createElement('div');el.className='grid-section-label';el.textContent=text;grid.appendChild(el);}

function createCard(id,p,isFav){
  const card=document.createElement('div');card.className='provider-card';card.dataset.id=id;card.setAttribute('draggable','true');
  const imgUrl=(settings.cardImages||{})[id]||'';
  const logoUrl=(settings.cardLogos||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  const bgColor=(settings.cardBgColors||{})[id]||p.color+'33';
  const customName=(settings.cardCustomNames||{})[id];
  const customTag=(settings.cardCustomTags||{})[id];
  const isMini=(settings.cardLayout||'normal')==='mini';
  const faviconSrc=logoUrl||getFavicon(id,p);

  card.innerHTML=`
    ${p.quality&&!isMini?`<div class="card-quality-badge">${p.quality}</div>`:''}
    <button class="card-edit-btn" title="Karte anpassen">✏️</button>
    <div class="card-banner" style="background:${bgColor}">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,${p.color}22 50%,transparent 80%)"></div>
      <div class="card-banner-img" style="${imgUrl?`background-image:url('${imgUrl}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:${opacity/100}`:opacity===0?'opacity:0;position:absolute;inset:0':'opacity:0;position:absolute;inset:0'}"></div>
      <img class="card-favicon" src="${faviconSrc}" alt="${esc(customName||p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="position:relative;z-index:2;width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;background:${p.color}33">${(customName||p.name).charAt(0)}</div>
    </div>
    <div class="card-body"><div class="card-info"><span class="card-name">${esc(customName||p.name)}</span>${!isMini?`<span class="card-tag">${esc(customTag||p.tag)}</span>`:''}</div>${!isMini?'<span class="card-arrow">→</span>':''}</div>
    <button class="card-bookmark${isFav?' active':''}" title="${isFav?'Favorit entfernen':'Favorit'}">
      <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path class="bm-fill" d="M1 1h10v15l-5-3.5L1 16z"/></svg>
    </button>`;

  card.querySelector('.card-bookmark').addEventListener('click',e=>{e.stopPropagation();e.preventDefault();toggleFavorite(id);});
  card.querySelector('.card-edit-btn').addEventListener('click',e=>{e.stopPropagation();e.preventDefault();openCardEditor(id,p);});
  // Fix: draggable unterdrückt manchmal click → mouseup nutzen
  let _dm=false;
  card.addEventListener('mousedown',()=>{_dm=false;});
  card.addEventListener('mousemove',()=>{_dm=true;});
  card.addEventListener('mouseup',e=>{
    if(_dm)return;
    if(e.target.closest('.card-bookmark')||e.target.closest('.card-edit-btn'))return;
    openProvider(id);
  });
  return card;
}

function setupLayoutButtons(){['normal','compact','mini'].forEach(l=>{document.getElementById(`layout-${l}`)?.addEventListener('click',()=>{settings.cardLayout=l;autoSave();buildProviderGrid();});});}

// DRAG & DROP LIVE
function setupCardDragDrop(grid){
  let dragSrc=null;
  grid.querySelectorAll('.provider-card').forEach(card=>{
    card.addEventListener('dragstart',e=>{dragSrc=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';setTimeout(()=>card.classList.add('dragging'),0);});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>{el.classList.remove('drag-indicator-left','drag-indicator-right');});});
    card.addEventListener('dragover',e=>{
      e.preventDefault();if(card===dragSrc)return;
      grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>{el.classList.remove('drag-indicator-left','drag-indicator-right');});
      const rect=card.getBoundingClientRect();
      if(e.clientX<rect.left+rect.width/2)card.classList.add('drag-indicator-left');else card.classList.add('drag-indicator-right');
    });
    card.addEventListener('dragleave',()=>card.classList.remove('drag-indicator-left','drag-indicator-right'));
    card.addEventListener('drop',e=>{
      e.preventDefault();card.classList.remove('drag-indicator-left','drag-indicator-right');
      if(!dragSrc||dragSrc===card)return;
      const cards=[...grid.querySelectorAll('.provider-card')];
      const ids=cards.map(c=>c.dataset.id);
      const si=ids.indexOf(dragSrc.dataset.id),di=ids.indexOf(card.dataset.id);
      if(si>-1&&di>-1){
        ids.splice(si,1);
        const rect=card.getBoundingClientRect();
        const insertAfter=e.clientX>=rect.left+rect.width/2;
        ids.splice(insertAfter?di+1:di<ids.length?di:ids.length,0,dragSrc.dataset.id);
      }
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
let cardEditorState={id:null,p:null};
function setupCardEditor(){
  document.getElementById('card-editor-close')?.addEventListener('click',()=>document.getElementById('card-editor-overlay').style.display='none');
  document.getElementById('card-editor-overlay')?.addEventListener('click',e=>{if(e.target===document.getElementById('card-editor-overlay'))document.getElementById('card-editor-overlay').style.display='none';});
  document.getElementById('card-ed-pick')?.addEventListener('click',async()=>{
    const url=await window.electronAPI.pickImage(`card_${cardEditorState.id}`);
    if(url){settings.cardImages[cardEditorState.id]=url;updateCardEditorPreview();autoSave();}
  });
  document.getElementById('card-ed-remove-img')?.addEventListener('click',()=>{delete settings.cardImages[cardEditorState.id];delete(settings.cardImageOffsets||{})[cardEditorState.id];delete(settings.cardBgOpacity||{})[cardEditorState.id];updateCardEditorPreview();autoSave();});
  // Fix 7: Logo-Picker
  document.getElementById('card-ed-logo-pick')?.addEventListener('click',async()=>{
    const url=await window.electronAPI.pickImage(`logo_${cardEditorState.id}`);
    if(url){settings.cardLogos=settings.cardLogos||{};settings.cardLogos[cardEditorState.id]=url;updateCardEditorPreview();autoSave();}
  });
  document.getElementById('card-ed-logo-remove')?.addEventListener('click',()=>{delete(settings.cardLogos||{})[cardEditorState.id];updateCardEditorPreview();autoSave();});
  ['card-ed-x','card-ed-y'].forEach(id=>{document.getElementById(id)?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById(id+'-val').textContent=v+'px';settings.cardImageOffsets=settings.cardImageOffsets||{};settings.cardImageOffsets[cardEditorState.id]={...(settings.cardImageOffsets[cardEditorState.id]||{}),[(id==='card-ed-x'?'x':'y')]:v};updateCardEditorPreview();});});
  document.getElementById('card-ed-opacity')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('card-ed-opacity-val').textContent=v+'%';settings.cardBgOpacity=settings.cardBgOpacity||{};settings.cardBgOpacity[cardEditorState.id]=v;updateCardEditorPreview();});
  document.getElementById('card-ed-color')?.addEventListener('input',e=>{settings.cardBgColors=settings.cardBgColors||{};settings.cardBgColors[cardEditorState.id]=e.target.value+'55';document.getElementById('card-ed-color-text').value=e.target.value;updateCardEditorPreview();});
  document.getElementById('card-ed-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){document.getElementById('card-ed-color').value=e.target.value;settings.cardBgColors=settings.cardBgColors||{};settings.cardBgColors[cardEditorState.id]=e.target.value+'55';updateCardEditorPreview();}});
  document.getElementById('card-ed-save')?.addEventListener('click',()=>{
    const name=document.getElementById('card-ed-name').value.trim();
    const tag=document.getElementById('card-ed-tag').value.trim();
    if(name){settings.cardCustomNames=settings.cardCustomNames||{};settings.cardCustomNames[cardEditorState.id]=name;}
    if(tag){settings.cardCustomTags=settings.cardCustomTags||{};settings.cardCustomTags[cardEditorState.id]=tag;}
    if(customProviders[cardEditorState.id]){if(name)customProviders[cardEditorState.id].name=name;if(tag)customProviders[cardEditorState.id].tag=tag;settings.customProviders=customProviders;}
    autoSaveAndToast();buildProviderGrid();buildSidebarSubMenus();document.getElementById('card-editor-overlay').style.display='none';
  });
  // Fix 4: Reset-Button
  document.getElementById('card-ed-reset')?.addEventListener('click',()=>{
    const id=cardEditorState.id;
    delete(settings.cardImages||{})[id];delete(settings.cardImageOffsets||{})[id];delete(settings.cardBgOpacity||{})[id];
    delete(settings.cardBgColors||{})[id];delete(settings.cardCustomNames||{})[id];delete(settings.cardCustomTags||{})[id];
    delete(settings.cardLogos||{})[id];
    // Reset input-Felder
    const p=cardEditorState.p;
    document.getElementById('card-ed-name').value=p?.name||'';
    document.getElementById('card-ed-tag').value=p?.tag||'';
    updateCardEditorPreview();autoSave();showToast('Karte zurückgesetzt.');
  });
  });
  document.getElementById('card-ed-delete')?.addEventListener('click',()=>{
    if(!confirm(`„${cardEditorState.p?.name||cardEditorState.id}" löschen?`))return;
    // Custom providers direkt löschen; Standard-Provider nur aus order entfernen
    if(customProviders[cardEditorState.id])delete customProviders[cardEditorState.id];
    else{ settings.deletedProviders=settings.deletedProviders||[];settings.deletedProviders.push(cardEditorState.id); }
    settings.customProviders=customProviders;
    providerOrder=providerOrder.filter(id=>id!==cardEditorState.id);settings.providerOrder=providerOrder;
    autoSave();buildProviderGrid();buildSidebarSubMenus();document.getElementById('card-editor-overlay').style.display='none';
  });
}

function openCardEditor(id,p){
  cardEditorState={id,p};
  document.getElementById('card-editor-title').textContent=`Karte: ${(settings.cardCustomNames||{})[id]||p.name}`;
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  document.getElementById('card-ed-name').value=(settings.cardCustomNames||{})[id]||p.name;
  document.getElementById('card-ed-tag').value=(settings.cardCustomTags||{})[id]||p.tag;
  document.getElementById('card-ed-x').value=off.x;document.getElementById('card-ed-x-val').textContent=off.x+'px';
  document.getElementById('card-ed-y').value=off.y;document.getElementById('card-ed-y-val').textContent=off.y+'px';
  document.getElementById('card-ed-opacity').value=opacity;document.getElementById('card-ed-opacity-val').textContent=opacity+'%';
  const col=(settings.cardBgColors||{})[id]?.substring(0,7)||p.color;
  document.getElementById('card-ed-color').value=col;document.getElementById('card-ed-color-text').value=col;
  // Logo preview
  const logoUrl=(settings.cardLogos||{})[id]||'';
  const logoPreview=document.getElementById('card-ed-logo-preview');
  if(logoPreview)logoPreview.innerHTML=logoUrl?`<img src="${logoUrl}" style="width:100%;height:100%;object-fit:contain"/>`:getFavicon(id,p)?`<img src="${getFavicon(id,p)}" style="width:100%;height:100%;object-fit:contain"/>`:'';
  updateCardEditorPreview();
  document.getElementById('card-editor-overlay').style.display='flex';
}

function updateCardEditorPreview(){
  const id=cardEditorState.id;if(!id)return;
  const prev=document.getElementById('card-editor-preview');if(!prev)return;
  const img=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  const opacity=(settings.cardBgOpacity||{})[id]??100;
  const bgColor=(settings.cardBgColors||{})[id]||(cardEditorState.p?.color+'33')||'#18181f';
  prev.style.background=bgColor;
  if(img){prev.style.backgroundImage=`url("${img}")`;prev.style.backgroundSize='cover';prev.style.backgroundPosition=`calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;prev.style.opacity=opacity/100;}
  else{prev.style.backgroundImage='';prev.style.opacity=1;}
}

// PROVIDERS WIEDERHERSTELLEN
// (überschreibt gelöschte Standardanbieter)

// ════════════════════════════════
// CRUNCHYROLL SIDEBAR KALENDER
// ════════════════════════════════
function setupSidebarCrunchyroll(){
  const toggle=document.getElementById('sidebar-cr-toggle');
  const content=document.getElementById('sidebar-cr-content');
  if(!toggle||!content)return;
  toggle.addEventListener('click',()=>{
    const open=content.style.display!=='none';
    content.style.display=open?'none':'block';
    toggle.classList.toggle('open',!open);
    if(!open&&!content.dataset.loaded){content.dataset.loaded='1';loadSidebarCrunchyroll(content);}
  });
}

async function loadSidebarCrunchyroll(container){
  container.innerHTML=`<div class="sidebar-cr-loading">Lädt…</div>`;
  try{
    const resp=await window.electronAPI.getUpcoming(1);
    const anime=(resp.anime||[]).slice(0,10);
    if(!anime.length){container.innerHTML=`<div class="sidebar-cr-loading">Keine Daten</div>`;return;}
    container.innerHTML='';
    anime.forEach(item=>{
      const title=item.title||item.name||'Unbekannt';
      const poster=item.poster_path?`${TMDB_IMG}${item.poster_path}`:'';
      const rd=item.first_air_date||item.release_date||'';
      const dateStr=rd?new Date(rd).toLocaleDateString('de-DE',{day:'2-digit',month:'short'}):'-';
      const el=document.createElement('div');el.className='sidebar-cr-item';
      el.innerHTML=`${poster?`<img src="${poster}" loading="lazy" onerror="this.style.display='none'"/>`:''}
        <div class="sidebar-cr-item-info">
          <div class="sidebar-cr-item-title">${esc(title)}</div>
          <div class="sidebar-cr-item-date">📅 ${dateStr}</div>
        </div>`;
      el.addEventListener('click',()=>showDetailPopup(item.id,item.title?'movie':'tv',title));
      container.appendChild(el);
    });
    const cta=document.createElement('div');cta.className='sidebar-cr-item';
    cta.style.justifyContent='center';cta.style.color='var(--acc)';cta.style.fontWeight='600';
    cta.textContent='▶ Crunchyroll öffnen';cta.addEventListener('click',()=>openProvider('crunchyroll'));
    container.appendChild(cta);
  }catch{container.innerHTML=`<div class="sidebar-cr-loading">Fehler</div>`;}
}

// ════════════════════════════════
// SIDEBAR
// ════════════════════════════════
function buildSidebarSubMenus(){buildFavSub();}
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
  const customName=(settings.cardCustomNames||{})[id];
  const btn=document.createElement('button');btn.className='nav-sub-btn';
  btn.innerHTML=`<img src="${getFavicon(id,p)}" onerror="this.outerHTML='<span style=\\'width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${esc(customName||p.name)}`;
  btn.addEventListener('click',()=>openProvider(id));return btn;
}

// ════════════════════════════════
// PROVIDER ÖFFNEN – KEIN RELOAD wenn gleicher Provider
// ════════════════════════════════
function openProvider(id){
  const p=PROVIDERS()[id];if(!p)return;
  openProviderAtUrl(id,p.url,p.name,`persist:${getProfilePartition(id)}`);
}

function openProviderAtUrl(id,url,name,partition){
  if(!url)return;
  const p=PROVIDERS()[id]||{url,name:name||id,partition:id,color:'#333',multiTab:false};
  // Gleicher Provider aktiv → NUR View zeigen, kein Reload
  if(currentProvider===id&&currentWebview){showView('stream');return;}
  if(pipProviderId===id){restoreFromPip();return;}
  if(currentWebview&&currentProvider&&currentProvider!==id){moveToPip(currentProvider,currentWebview);currentWebview=null;currentProvider=null;}

  currentProvider=id;currentProvUrl=url;
  showLoading(`${customName(id)||p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent=customName(id)||p.name;
  document.getElementById('btn-watching').style.display='flex';
  const bgBtn=document.getElementById('btn-bg-play');
  if(bgBtn)bgBtn.style.display=(p.bgAudio||id==='spotify'||id==='youtube'||id==='twitch')?'flex':'none';

  const part=partition||`persist:${getProfilePartition(id)}`;
  window.electronAPI.setupWebviewSession(part);
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';

  const wv=document.createElement('webview');
  wv.setAttribute('src',url);wv.setAttribute('partition',part);wv.setAttribute('allowpopups','');wv.setAttribute('useragent',CHROME_UA);
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';

  if(p.multiTab||id==='twitch'||id==='youtube'){
    setupStreamTabs(id,wv,url,customName(id)||p.name);
    wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))addStreamTab(id,e.url,e.frameName||e.url);});
  }else{
    document.getElementById('stream-tabs-bar').style.display='none';streamTabs=[];activeTabId=null;
    wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))wv.loadURL(e.url);});
  }

  currentWebview=wv;if(wrap)wrap.appendChild(wv);
  wv.addEventListener('did-start-loading',()=>showLoading(`${customName(id)||p.name}…`));
  wv.addEventListener('did-stop-loading',()=>{hideLoading();document.getElementById('btn-retry').style.display='none';addViewHistory({id,name:customName(id)||p.name,url,time:Date.now()});startWatchTimer(id);window.electronAPI.refreshSessionsNow(activeProfileId);});
  wv.addEventListener('did-fail-load',async e=>{
    if(e.errorCode===-3||e.errorCode===0)return;
    hideLoading();document.getElementById('btn-retry').style.display='flex';
    let diag='';try{const r=await window.electronAPI.checkUrl(url);diag=r.ok?`Erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`:`Fehler: ${r.error}`;}catch{}
    const cdmNote=e.errorCode?` Crunchyroll KAT-6005 → Widevine CDM benötigt (Einstellungen → Mehr → Widevine).`:'';
    const wrap=document.getElementById('webview-wrap');if(!wrap)return;
    wrap.innerHTML=`<div class="webview-error"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>${esc(customName(id)||p.name)} nicht erreichbar</h3><p>${diag||'Keine Verbindung.'}${cdmNote}</p>${e.errorCode?`<span class="err-code">Code: ${e.errorCode}</span>`:''}<div class="webview-error-actions"><button class="webview-error-btn primary" onclick="document.getElementById('btn-retry').click()">🔄 Erneut</button><button class="webview-error-btn secondary" onclick="window.electronAPI.openExternal('${url}')">↗ Browser</button></div></div>`;
  });

  document.getElementById('search-dropdown').style.display='none';
  showView('stream');
}

function customName(id){return(settings.cardCustomNames||{})[id]||null;}

// STREAM TABS
function setupStreamTabs(id,wv,url,title){streamTabs=[{id:'tab_0',title,url,webview:wv,muted:false}];activeTabId='tab_0';renderStreamTabs();}
function addStreamTab(providerId,url,title){
  const id='tab_'+Date.now(),p=PROVIDERS()[providerId];
  const wv=document.createElement('webview');
  wv.setAttribute('src',url);wv.setAttribute('partition',`persist:${getProfilePartition(providerId)}`);wv.setAttribute('allowpopups','');wv.setAttribute('useragent',CHROME_UA);wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))addStreamTab(providerId,e.url,e.frameName||e.url);});
  wv.addEventListener('page-title-updated',e=>{const t=streamTabs.find(t=>t.id===id);if(t){t.title=e.title;renderStreamTabs();}});
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
  if(!streamTabs.length){document.getElementById('stream-tabs-bar').style.display='none';stopStream();return;}
  switchToTab(streamTabs[Math.max(0,idx-1)].id);
}
function renderStreamTabs(){
  const bar=document.getElementById('stream-tabs-bar'),cont=document.getElementById('stream-tabs');if(!bar||!cont)return;
  bar.style.display=streamTabs.length?'block':'none';cont.innerHTML='';
  streamTabs.forEach(tab=>{
    const el=document.createElement('div');el.className='stream-tab'+(tab.id===activeTabId?' active':'');
    el.innerHTML=`<span class="stream-tab-title">${esc(tab.title.substring(0,28))}</span><button class="stream-tab-mute" title="${tab.muted?'Ton an':'Muten'}">${tab.muted?'🔇':'🔊'}</button><button class="stream-tab-close">✕</button>`;
    el.querySelector('.stream-tab-title').addEventListener('click',()=>switchToTab(tab.id));
    el.querySelector('.stream-tab-mute').addEventListener('click',e=>{e.stopPropagation();tab.muted=!tab.muted;try{tab.webview.setAudioMuted(tab.muted);}catch{}renderStreamTabs();});
    el.querySelector('.stream-tab-close').addEventListener('click',e=>{e.stopPropagation();closeStreamTab(tab.id);});
    cont.appendChild(el);
  });
}

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
  document.getElementById('btn-second-window')?.addEventListener('click',()=>{if(currentProvider&&currentProvUrl)window.electronAPI.openSecondWindow({url:currentProvUrl,partition:`persist:${getProfilePartition(currentProvider)}`,title:customName(currentProvider)||PROVIDERS()[currentProvider]?.name});});
  document.getElementById('btn-bg-play')?.addEventListener('click',()=>{maybeMoveToPip();showView('home');});
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{if(!currentProvider)return;if(!confirm(`Abmelden?`))return;window.electronAPI.clearProviderSession(activeProfileId,currentProvider);if(currentWebview)currentWebview.loadURL(currentProvUrl);window.electronAPI.refreshSessionsNow(activeProfileId);});
}

function startWatchTimer(id){stopWatchTimer();watchTimeTimer=setInterval(()=>{window.electronAPI.recordWatchTime(id,60,activeProfileId);checkAchievements();},60000);}
function stopWatchTimer(){clearInterval(watchTimeTimer);watchTimeTimer=null;}
function addViewHistory(e){viewHistory=viewHistory.filter(h=>h.id!==e.id).slice(0,49);viewHistory.unshift(e);settings.viewHistory=viewHistory;autoSave();}

// PIP
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
  pipProviderId=id;if(title)title.textContent=customName(id)||PROVIDERS()[id]?.name||id;
  pip.style.left='auto';pip.style.top='auto';pip.style.right='24px';pip.style.bottom='24px';pip.style.display='flex';
}
function restoreFromPip(){
  if(!pipProviderId)return;
  const id=pipProviderId,pip=document.getElementById('pip-window'),content=document.getElementById('pip-content'),wrap=document.getElementById('webview-wrap');if(!content||!wrap)return;
  const wv=content.querySelector('webview');
  if(wv){wv.parentNode.removeChild(wv);wv.style.cssText='width:100%;height:100%;border:none;display:flex';wrap.innerHTML='';wrap.appendChild(wv);currentWebview=wv;}
  content.innerHTML='';pip.style.display='none';pipProviderId=null;currentProvider=id;
  document.getElementById('stream-title').textContent=customName(id)||PROVIDERS()[id]?.name||id;
  document.getElementById('btn-watching').style.display='flex';showView('stream');
}

// FULLSCREEN
function updateFullscreenUI(){
  const els=['stream-topbar','sidebar','titlebar','stream-tabs-bar'].map(id=>document.getElementById(id));
  const wrap=document.getElementById('webview-wrap'),btn=document.getElementById('btn-fullscreen');
  if(isFullscreen){els.forEach(el=>el?.classList.add('hidden'));if(wrap)wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';if(btn)btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg> Beenden`;}
  else{els.forEach(el=>el?.classList.remove('hidden'));if(wrap)wrap.style.cssText='';if(btn)btn.innerHTML=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> Vollbild`;}
}
function setupFullscreenExit(){
  const btn=document.getElementById('fs-exit-btn');if(!btn)return;
  document.addEventListener('mousemove',e=>{if(!isFullscreen)return;const inZ=Math.abs(e.clientX-window.innerWidth/2)<80&&e.clientY<60;if(inZ){if(!fsHoverTimer)fsHoverTimer=setTimeout(()=>{btn.classList.add('visible');clearTimeout(fsAutoHide);fsAutoHide=setTimeout(()=>btn.classList.remove('visible'),3000);},800);}else{clearTimeout(fsHoverTimer);fsHoverTimer=null;}});
  btn.addEventListener('click',()=>{window.electronAPI.setFullscreen(false);btn.classList.remove('visible');});
}
function setupESCKey(){document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isFullscreen)window.electronAPI.setFullscreen(false);});}

// CLOCK
function setupClock(){
  clearInterval(clockInterval);
  const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};
  widget.style.display='block';widget.style.left=pos.x+'px';widget.style.top=pos.y+'px';widget.style.right='auto';widget.style.bottom='auto';
  widget.style.color=clk.color||'#ff3b30';
  widget.style.opacity=String(1-(clk.opacity??0.5));
  widget.style.fontSize=(clk.size||22)+'px';widget.style.background='none';widget.style.border='none';widget.style.padding='0';
  const showSeconds=!!clk.showSeconds;
  const isAnalog=clk.type==='analog';
  if(isAnalog){
    // Analog-Uhr via SVG-Canvas (einfach)
    const tick=()=>{
      const n=new Date(),h=n.getHours()%12,m=n.getMinutes(),s=n.getSeconds();
      const sz=clk.size||22,r=sz*1.8;
      const ha=((h+m/60)/12)*Math.PI*2-Math.PI/2;
      const ma=(m/60)*Math.PI*2-Math.PI/2;
      const sa=(s/60)*Math.PI*2-Math.PI/2;
      const c=clk.color||'#ff3b30';
      timeEl.innerHTML=`<svg width="${r*2}" height="${r*2}" viewBox="0 0 ${r*2} ${r*2}" style="display:block">
        <circle cx="${r}" cy="${r}" r="${r-2}" fill="none" stroke="${c}" stroke-width="1.5" opacity=".4"/>
        <line x1="${r}" y1="${r}" x2="${r+Math.cos(ha)*r*.55}" y2="${r+Math.sin(ha)*r*.55}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="${r}" y1="${r}" x2="${r+Math.cos(ma)*r*.8}" y2="${r+Math.sin(ma)*r*.8}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
        ${showSeconds?`<line x1="${r}" y1="${r}" x2="${r+Math.cos(sa)*r*.85}" y2="${r+Math.sin(sa)*r*.85}" stroke="${c}" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`:''}
        <circle cx="${r}" cy="${r}" r="2" fill="${c}"/>
      </svg>`;
    };
    tick();clockInterval=setInterval(tick,showSeconds?1000:10000);
  }else{
    const tick=()=>{const n=new Date();timeEl.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}${showSeconds?':'+pad(n.getSeconds()):''}`;};
    tick();clockInterval=setInterval(tick,1000);
  }
}
function previewClock(){
  const widget=document.getElementById('clock-widget');if(!widget)return;
  const enabled=document.getElementById('clock-enabled')?.checked;
  const color=document.getElementById('clock-color-text')?.value||'#ff3b30';
  const opacityPct=parseInt(document.getElementById('clock-opacity')?.value)||50;
  const size=parseInt(document.getElementById('clock-size')?.value)||22;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=enabled?'Aktiviert':'Deaktiviert';
  // 100% Transparenz → auto-deaktivieren
  if(opacityPct>=100&&enabled){
    document.getElementById('clock-enabled').checked=false;
    if(lbl)lbl.textContent='Deaktiviert';
    widget.style.display='none';return;
  }
  if(!enabled){widget.style.display='none';return;}
  widget.style.display='block';widget.style.color=color;
  widget.style.opacity=String(1-opacityPct/100);
  widget.style.fontSize=size+'px';widget.style.background='none';widget.style.border='none';widget.style.padding='0';
}
function saveClock(){
  const pPos=settings.clock._pendingPos;
  const opPct=(parseInt(document.getElementById('clock-opacity')?.value)||50);
  const enabledEl=document.getElementById('clock-enabled');
  const enabled=opPct>=100?false:!!enabledEl?.checked;
  if(opPct>=100&&enabledEl)enabledEl.checked=false;
  settings.clock={
    enabled,
    position:pPos||settings.clock.position||{x:16,y:52},
    color:document.getElementById('clock-color-text')?.value||'#ff3b30',
    opacity:opPct/100,
    size:parseInt(document.getElementById('clock-size')?.value)||22,
    type:document.querySelector('.clock-type-btn.active')?.dataset.clockType||'digital',
    showSeconds:!!document.getElementById('clock-show-seconds')?.checked,
  };
  delete settings.clock._pendingPos;setupClock();autoSave();
}
function enableClockDragMode(on){
  clockDragEnabled=on;const widget=document.getElementById('clock-widget');if(!widget)return;
  if(on)widget.classList.add('drag-mode');else widget.classList.remove('drag-mode');
  if(clockDragHandlers){widget.removeEventListener('mousedown',clockDragHandlers.down);document.removeEventListener('mousemove',clockDragHandlers.move);document.removeEventListener('mouseup',clockDragHandlers.up);clockDragHandlers=null;}
  if(!on)return;
  let drag=false,ox=0,oy=0;
  const down=e=>{if(!clockDragEnabled)return;drag=true;const r=widget.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;e.preventDefault();};
  const move=e=>{if(!drag||!clockDragEnabled)return;widget.style.left=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox))+'px';widget.style.top=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy))+'px';widget.style.right='auto';widget.style.bottom='auto';};
  const up=()=>{if(!drag)return;drag=false;const r=widget.getBoundingClientRect();settings.clock._pendingPos={x:Math.round(r.left),y:Math.round(r.top)};autoSave();};
  widget.addEventListener('mousedown',down);document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
  clockDragHandlers={down,move,up};
}
function setupClockContextMenu(){
  const widget=document.getElementById('clock-widget'),ctx=document.getElementById('clock-ctx-menu');if(!widget||!ctx)return;
  widget.addEventListener('contextmenu',e=>{e.preventDefault();ctx.style.left=e.clientX+'px';ctx.style.top=e.clientY+'px';ctx.style.display='block';});
  document.addEventListener('click',e=>{if(!ctx.contains(e.target))ctx.style.display='none';});
  document.getElementById('clock-ctx-disable')?.addEventListener('click',()=>{settings.clock.enabled=false;autoSave();setupClock();const ce=document.getElementById('clock-enabled');if(ce)ce.checked=false;const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent='Deaktiviert';ctx.style.display='none';});
}

// SETTINGS PANEL
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
      // Punkt 22: Uhr-Drag nur wenn clock-Tab
      if(tab.dataset.tab==='clock'){setTimeout(()=>enableClockDragMode(true),200);}
      else{enableClockDragMode(false);}
    });
  });

  // Design
  linkColor('set-accent-color','set-accent-text');
  document.getElementById('set-accent-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){settings.accentColor=e.target.value;applyAccent(e.target.value);autoSave();}});
  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn=>btn.addEventListener('click',()=>{
    const k=btn.dataset.reset;
    if(k==='accentColor'){settings.accentColor='#30c5bb';applyAccent('#30c5bb');const c=document.getElementById('set-accent-color'),t=document.getElementById('set-accent-text');if(c)c.value='#30c5bb';if(t)t.value='#30c5bb';}
    else if(k==='appBgImage'){settings.appBgImage='';updatePreview('prev-app-bg',null);applyBgImage(null);}
    else if(k==='clockColor'){settings.clock.color='#ff3b30';const c=document.getElementById('clock-color'),t=document.getElementById('clock-color-text');if(c)c.value='#ff3b30';if(t)t.value='#ff3b30';previewClock();}
    autoSave();
  }));
  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn=>btn.addEventListener('click',()=>handlePickImage(btn.dataset.pick)));
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');
  fsr?.addEventListener('input',()=>{const v=parseInt(fsr.value);if(fsv)fsv.textContent=v+'px';settings.fontSize=v;applyFontSize(v);autoSave();});
  document.getElementById('font-family-select')?.addEventListener('change',e=>{settings.fontFamily=e.target.value;applyFontFamily(e.target.value);autoSave();});
  // Design options
  document.getElementById('card-radius')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('card-radius-val').textContent=v+'px';designOptions.cardRadius=v;settings.designOptions=designOptions;applyDesignOptions(designOptions);autoSave();});
  document.getElementById('sidebar-width')?.addEventListener('input',e=>{const v=parseInt(e.target.value);document.getElementById('sidebar-width-val').textContent=v+'px';designOptions.sidebarWidth=v;settings.designOptions=designOptions;applyDesignOptions(designOptions);autoSave();});
  document.getElementById('card-shadow-toggle')?.addEventListener('change',e=>{designOptions.cardShadow=e.target.checked;settings.designOptions=designOptions;applyDesignOptions(designOptions);autoSave();});
  document.getElementById('glass-toggle')?.addEventListener('change',e=>{designOptions.glass=e.target.checked;settings.designOptions=designOptions;applyDesignOptions(designOptions);autoSave();});
  // Particles
  document.getElementById('particles-toggle')?.addEventListener('change',e=>{settings.particlesEnabled=e.target.checked;const sec=document.getElementById('particles-options-section');if(sec)sec.style.display=e.target.checked?'flex':'none';setupParticles();autoSave();});
  document.getElementById('particle-count')?.addEventListener('input',e=>{document.getElementById('particle-count-val').textContent=e.target.value;particlesConfig.count=parseInt(e.target.value);settings.particlesConfig=particlesConfig;setupParticles();autoSave();});
  document.getElementById('particle-size')?.addEventListener('input',e=>{document.getElementById('particle-size-val').textContent=e.target.value;particlesConfig.size=parseFloat(e.target.value);settings.particlesConfig=particlesConfig;setupParticles();autoSave();});
  document.getElementById('particle-speed')?.addEventListener('input',e=>{document.getElementById('particle-speed-val').textContent=e.target.value;particlesConfig.speed=parseFloat(e.target.value);settings.particlesConfig=particlesConfig;setupParticles();autoSave();});
  linkColor('particle-color','particle-color-text');
  document.getElementById('particle-color-text')?.addEventListener('input',e=>{if(/^#[0-9a-fA-F]{6}$/.test(e.target.value)){particlesConfig.color=e.target.value;settings.particlesConfig=particlesConfig;setupParticles();autoSave();}});
  document.getElementById('particle-color')?.addEventListener('input',e=>{particlesConfig.color=e.target.value;settings.particlesConfig=particlesConfig;document.getElementById('particle-color-text').value=e.target.value;setupParticles();autoSave();});
  // Partikel Formen – Mehrfachauswahl
  document.querySelectorAll('.particle-shape-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      btn.classList.toggle('active');
      particlesConfig.shapes=[...document.querySelectorAll('.particle-shape-btn.active')].map(b=>b.dataset.shape);
      if(!particlesConfig.shapes.length){btn.classList.add('active');particlesConfig.shapes=[btn.dataset.shape];}
      settings.particlesConfig=particlesConfig;setupParticles();autoSave();
    });
  });
  // Language
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>{settings.language=btn.dataset.lang;applyLanguage(btn.dataset.lang);autoSave();}));
  // Clock
  linkColor('clock-color','clock-color-text');
  ['clock-enabled','clock-opacity','clock-size'].forEach(id=>document.getElementById(id)?.addEventListener('change',saveClock));
  ['clock-enabled','clock-opacity','clock-size'].forEach(id=>document.getElementById(id)?.addEventListener('input',previewClock));
  document.getElementById('clock-color-text')?.addEventListener('input',previewClock);
  document.getElementById('clock-opacity')?.addEventListener('input',e=>document.getElementById('clock-opacity-val').textContent=e.target.value+'%');
  document.getElementById('clock-size')?.addEventListener('input',e=>document.getElementById('clock-size-val').textContent=e.target.value+'px');
  document.getElementById('clock-show-seconds')?.addEventListener('change',saveClock);
  // Clock-Type Toggle
  document.querySelectorAll('.clock-type-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.clock-type-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');saveClock();
  }));
  // Account
  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{if(!confirm('Von ALLEN Diensten abmelden?'))return;window.electronAPI.clearAllSessions(activeProfileId);buildSettingsAccountTab();});
  document.getElementById('btn-google-auth')?.addEventListener('click',async()=>{
    const hint=document.getElementById('google-auth-hint');if(hint)hint.style.display='block';
    window.electronAPI.openGoogleAuthBrowser(activeProfileId);
    document.getElementById('btn-google-auth').textContent='⏳ Warte auf Login (30s)…';
    setTimeout(()=>{document.getElementById('btn-google-auth').textContent='🔐 Im Browser bei Google anmelden (YouTube)';if(hint)hint.style.display='none';},32000);
  });
  // Advanced – Events werden in buildAdvancedTab gesetzt
  document.getElementById('widevine-info-link')?.addEventListener('click',e=>{e.preventDefault();window.electronAPI.openExternal('https://github.com/nicehash/electron-widevinecdm');});
  document.getElementById('btn-add-provider-home')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='flex');

  setupLayoutButtons();syncSettingsUI();
}

function openSettings(){
  document.getElementById('settings-panel')?.classList.add('open');document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();syncSettingsUI();buildAdvancedTab();
  trackMeta('settingsOpens');
  // Punkt 22: Uhr-Drag NUR wenn clock-Tab aktiv
  const activeTab=document.querySelector('.stab.active')?.dataset.tab;
  if(activeTab==='clock') setTimeout(()=>enableClockDragMode(true),200);
}
function closeSettings(){
  enableClockDragMode(false);saveClock();
  document.getElementById('settings-panel')?.classList.remove('open');document.getElementById('settings-overlay')?.classList.remove('open');
  document.getElementById('vpn-panel').style.right='-340px';
  autoSaveAndToast();
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
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');if(fsr)fsr.value=settings.fontSize||14;if(fsv)fsv.textContent=(settings.fontSize||14)+'px';
  const ffs=document.getElementById('font-family-select');if(ffs)ffs.value=settings.fontFamily||'DM Sans';
  // Design options
  const cr=document.getElementById('card-radius'),crv=document.getElementById('card-radius-val');if(cr)cr.value=designOptions.cardRadius||14;if(crv)crv.textContent=(designOptions.cardRadius||14)+'px';
  const sw=document.getElementById('sidebar-width'),swv=document.getElementById('sidebar-width-val');if(sw)sw.value=designOptions.sidebarWidth||200;if(swv)swv.textContent=(designOptions.sidebarWidth||200)+'px';
  const cst=document.getElementById('card-shadow-toggle');if(cst)cst.checked=designOptions.cardShadow!==false;
  const gt=document.getElementById('glass-toggle');if(gt)gt.checked=!!designOptions.glass;
  // Particles
  const pt=document.getElementById('particles-toggle');if(pt){pt.checked=!!settings.particlesEnabled;const sec=document.getElementById('particles-options-section');if(sec)sec.style.display=settings.particlesEnabled?'flex':'none';}
  const pc=document.getElementById('particle-count'),pcv=document.getElementById('particle-count-val');if(pc)pc.value=particlesConfig.count||80;if(pcv)pcv.textContent=particlesConfig.count||80;
  const ps=document.getElementById('particle-size'),psv=document.getElementById('particle-size-val');if(ps)ps.value=particlesConfig.size||1.5;if(psv)psv.textContent=particlesConfig.size||1.5;
  const psp=document.getElementById('particle-speed'),pspv=document.getElementById('particle-speed-val');if(psp)psp.value=particlesConfig.speed||1;if(pspv)pspv.textContent=particlesConfig.speed||1;
  const pcol=document.getElementById('particle-color'),pcolT=document.getElementById('particle-color-text');if(pcol)pcol.value=particlesConfig.color||'#30c5bb';if(pcolT)pcolT.value=particlesConfig.color||'#30c5bb';
  document.querySelectorAll('.particle-shape-btn').forEach(b=>b.classList.toggle('active',(particlesConfig.shapes||['circle']).includes(b.dataset.shape)));
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===(settings.language||'de')));
  // Clock
  const clk=settings.clock||{};const ce=document.getElementById('clock-enabled');if(ce)ce.checked=!!clk.enabled;
  const lbl=document.getElementById('clock-status-label');if(lbl)lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const col=clk.color||'#ff3b30';const cc=document.getElementById('clock-color'),ct=document.getElementById('clock-color-text');if(cc)cc.value=col;if(ct)ct.value=col;
  const opPct=Math.round((clk.opacity??0.5)*100);const co=document.getElementById('clock-opacity'),cv=document.getElementById('clock-opacity-val');if(co)co.value=opPct;if(cv)cv.textContent=opPct+'%';
  const sz=clk.size||22;const cs=document.getElementById('clock-size'),csv=document.getElementById('clock-size-val');if(cs)cs.value=sz;if(csv)csv.textContent=sz+'px';
  // Clock-Typ
  const clkType=clk.type||'digital';
  document.querySelectorAll('.clock-type-btn').forEach(b=>b.classList.toggle('active',b.dataset.clockType===clkType));
  const secs=document.getElementById('clock-show-seconds');if(secs)secs.checked=!!clk.showSeconds;
}

// ACCOUNT TAB
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
  item.innerHTML=`<span class="session-dot ${on?'active':''}"></span><span class="session-name">${esc((settings.cardCustomNames||{})[id]||p.name)}</span><span class="session-status">${on?'✓':''}</span>${on?`<button class="session-logout-btn">Abmelden</button>`:''}`;
  item.querySelector('.session-logout-btn')?.addEventListener('click',()=>{window.electronAPI.clearProviderSession(activeProfileId,id);if(currentProvider===id)stopStream();buildSettingsAccountTab();});
  return item;
}

// ADVANCED TAB
function buildAdvancedTab(){
  buildCustomProviderList();
  checkWidevineStatus();
  // Fix 6: Einzelne Anbieter wiederherstellen Event (wird bei jedem Tab-Öffnen frisch gesetzt)
  document.getElementById('btn-restore-providers')?.addEventListener('click',()=>{settings.deletedProviders=[];settings.customProviders={};customProviders={};providerOrder=[];settings.providerOrder=[];autoSave();buildProviderGrid();buildSidebarSubMenus();showToast('Alle Standardanbieter wiederhergestellt.');});
  document.getElementById('btn-check-updates')?.addEventListener('click',async()=>{const el=document.getElementById('update-check-result');if(el)el.textContent='Prüfe…';await window.electronAPI.checkForUpdates();});
  document.getElementById('btn-vpn-settings')?.addEventListener('click',()=>document.getElementById('vpn-panel').style.right='0');
  document.getElementById('btn-rename-profile')?.addEventListener('click',()=>{const name=prompt('Neuer Name:',profiles.find(p=>p.id===activeProfileId)?.name||'');if(name){const p=profiles.find(p=>p.id===activeProfileId);if(p){p.name=name;window.electronAPI.setProfiles(profiles);buildProfileSelect();}}});
}

async function checkWidevineStatus(){
  const el=document.getElementById('widevine-status');if(!el)return;
  const s=await window.electronAPI.getWidevineStatus().catch(()=>null);
  if(s?.installed){
    el.innerHTML=`<span style="color:var(--acc)">✓ CDM installiert: <code style="font-size:10px">${s.path}</code></span>`;
  }else{
    el.innerHTML=`<span style="color:var(--tx3)">✗ CDM nicht gefunden.</span><br><span style="font-size:11px;color:var(--tx3)">Ablegen unter:<br><code style="font-size:9px;word-break:break-all">${s?.cdmDir||'userData/WidevineCdm'}</code></span>`;
  }
  const dl=document.getElementById('widevine-dl-link');
  if(!dl)el.insertAdjacentHTML('afterend',`<a href="#" id="widevine-dl-link" style="font-size:11px;color:var(--acc);display:block;margin-top:4px">📥 Download-Anleitung (GitHub) →</a>`);
  document.getElementById('widevine-dl-link')?.addEventListener('click',e=>{e.preventDefault();window.electronAPI.openExternal('https://github.com/nicehash/electron-widevinecdm');});
}

// VPN PANEL
function setupVPNPanel(){
  document.getElementById('vpn-panel-back')?.addEventListener('click',()=>document.getElementById('vpn-panel').style.right='-340px');
  document.getElementById('btn-check-vpn-panel')?.addEventListener('click',async()=>{
    const el=document.getElementById('vpn-status-result');if(el)el.textContent='Prüfe…';
    const r=await window.electronAPI.checkVpn();
    const badge=document.getElementById('vpn-badge');
    if(r.error){if(el)el.textContent=`Fehler: ${r.error}`;return;}
    if(badge){badge.textContent=r.isVpn?`🛡 VPN (${r.org})`:r.ip?`🌍 ${r.country}`:'';badge.className=`vpn-badge ${r.isVpn?'vpn-on':'vpn-off'}`;badge.style.display='block';}
    if(el)el.innerHTML=`IP: <b>${r.ip}</b><br>${r.city}, ${r.country}<br>${r.org}<br>${r.isVpn?'<span style="color:var(--acc)">✓ VPN aktiv</span>':'<span style="color:var(--tx3)">Kein VPN</span>'}`;
  });
  document.getElementById('btn-nordvpn')?.addEventListener('click',()=>window.electronAPI.openExternal('https://nordvpn.com/'));
  document.getElementById('btn-vpn-connect')?.addEventListener('click',()=>{const host=document.getElementById('custom-vpn-host').value.trim();if(!host){showToast('Host eingeben.');return;}window.electronAPI.openExternal(`https://${host}`);});
}

// PLUGINS TAB
function setupPluginsTab(){
  buildPluginPresets('');
  document.getElementById('plugin-search')?.addEventListener('input',e=>buildPluginPresets(e.target.value));
  updatePluginDomainCount();
}

const pluginDomainStore={};

function buildPluginPresets(filter){
  const container=document.getElementById('plugin-presets-list');if(!container)return;
  const t=I18N[lang]||I18N.de;
  const filtered=PLUGIN_PRESETS.filter(p=>{
    const name=typeof p.name==='object'?p.name[lang]||p.name.de:p.name;
    const desc=typeof p.desc==='object'?p.desc[lang]||p.desc.de:p.desc;
    return!filter||name.toLowerCase().includes(filter.toLowerCase())||desc.toLowerCase().includes(filter.toLowerCase());
  });
  container.innerHTML='';
  filtered.forEach(preset=>{
    const isInst=installedPlugins.has(preset.id);
    const name=typeof preset.name==='object'?preset.name[lang]||preset.name.de:preset.name;
    const desc=typeof preset.desc==='object'?preset.desc[lang]||preset.desc.de:preset.desc;
    const noteText=preset.note?(typeof preset.note==='object'?preset.note[lang]||preset.note.de:preset.note):null;
    const div=document.createElement('div');div.className='plugin-preset';
    div.innerHTML=`<div class="plugin-preset-info"><div class="plugin-preset-name">${esc(name)}</div><div class="plugin-preset-desc">${esc(desc)}</div></div>`;
    let btn;
    if(noteText){
      btn=document.createElement('button');btn.className='plugin-preset-btn info';btn.textContent=t.pluginInfo||'Info';
      btn.addEventListener('click',()=>showToast(noteText,6000));
    }else if(isInst){
      btn=document.createElement('button');btn.className='plugin-preset-btn remove';btn.textContent=t.pluginRemove||'Entfernen';
      btn.addEventListener('click',()=>{
        installedPlugins.delete(preset.id);
        localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));
        delete pluginDomainStore[preset.id];
        extraAdDomains=[...new Set(Object.values(pluginDomainStore).flat())];
        window.electronAPI.applyExtraAdDomains(extraAdDomains);
        updatePluginDomainCount();buildPluginPresets(filter);
      });
    }else{
      btn=document.createElement('button');btn.className='plugin-preset-btn install';btn.textContent=t.pluginInstall||'Installieren';
      btn.addEventListener('click',async()=>{
        btn.textContent='Lädt…';btn.disabled=true;
        const r=await window.electronAPI.fetchAdblockList(preset.url);
        if(r.ok){
          pluginDomainStore[preset.id]=r.domains;
          extraAdDomains=[...new Set(Object.values(pluginDomainStore).flat())];
          window.electronAPI.applyExtraAdDomains(extraAdDomains);
          installedPlugins.add(preset.id);
          localStorage.setItem('installedPlugins',JSON.stringify([...installedPlugins]));
          updatePluginDomainCount();buildPluginPresets(filter);
        }else{btn.textContent='Fehler';btn.disabled=false;}
      });
    }
    div.appendChild(btn);container.appendChild(div);
  });
}
function updatePluginDomainCount(){const el=document.getElementById('plugin-domain-count');if(el)el.textContent=extraAdDomains.length;}

// CUSTOM PROVIDER
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
    document.getElementById('cp-name').value='';document.getElementById('cp-url').value='';
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
  if(!Object.keys(customProviders).length)list.innerHTML='<div style="font-size:12px;color:var(--tx3);padding:4px 0">Keine eigenen Anbieter</div>';
}

// WATCHLIST
function buildWatchlist(cat='all'){
  const sort=document.getElementById('wl-sort')?.value||'alpha';
  let items=watchlist.filter(i=>cat==='all'||i.mediaType===cat||(!i.mediaType&&cat==='movie'));
  if(sort==='alpha')items=[...items].sort((a,b)=>a.title.localeCompare(b.title));
  else items=[...items].sort((a,b)=>{if(!a.releaseDate)return 1;if(!b.releaseDate)return-1;return a.releaseDate.localeCompare(b.releaseDate);});
  const content=document.getElementById('watchlist-content');if(!content)return;content.innerHTML='';
  if(!items.length){content.innerHTML='<div class="wl-empty">Noch nichts gemerkt.<br>Klicke bei Filmen/Serien auf 🔖</div>';return;}
  const grid=document.createElement('div');grid.className='watchlist-grid';
  items.forEach(item=>{
    const card=document.createElement('div');card.className='wl-card';
    const poster=item.poster?`<img class="wl-card-poster" src="${item.poster}" loading="lazy" onerror="this.style.display='none'"/>`:` <div class="wl-card-poster-ph">🎬</div>`;
    const dateStr=item.releaseDate?new Date(item.releaseDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'}):'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${esc(item.title)}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}</div><button class="wl-card-remove">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();watchlist=watchlist.filter(w=>w.id!==item.id);settings.watchlist=watchlist;autoSave();buildWatchlist(cat);});
    // Klick → Detail-Popup, danach prüfen ob noch in Watchlist
    card.addEventListener('click',async()=>{
      await showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title);
      // Nach Popup-Schließen: prüfen ob item noch in Watchlist
      const checkInterval=setInterval(()=>{
        if(document.getElementById('detail-overlay').style.display==='none'){
          clearInterval(checkInterval);
          if(!watchlist.find(w=>w.id===item.id)){card.style.opacity='0';card.style.transform='scale(.9)';setTimeout(()=>buildWatchlist(cat),300);}
        }
      },300);
    });
    // Fix 9: Rechtsklick → Kategorie wechseln
    card.addEventListener('contextmenu',e=>{
      e.preventDefault();
      const menu=document.createElement('div');
      menu.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r-sm);z-index:3000;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.4);padding:4px 0`;
      const cats=[{v:'movie',l:'🎬 Film'},{v:'tv',l:'📺 Serie'},{v:'anime',l:'⛩️ Anime'}];
      cats.forEach(c=>{
        const btn=document.createElement('button');
        btn.style.cssText='display:block;width:100%;padding:8px 14px;border:none;background:transparent;color:var(--tx);font-size:13px;cursor:pointer;text-align:left;transition:background .14s';
        btn.textContent=(c.v===item.mediaType?'✓ ':'')+c.l;
        btn.onmouseenter=()=>btn.style.background='var(--bgch)';
        btn.onmouseleave=()=>btn.style.background='transparent';
        btn.addEventListener('click',()=>{
          const idx=watchlist.findIndex(w=>w.id===item.id);
          if(idx>-1){watchlist[idx].mediaType=c.v;settings.watchlist=watchlist;autoSave();}
          menu.remove();buildWatchlist(cat);
        });
        menu.appendChild(btn);
      });
      document.body.appendChild(menu);
      setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),10);
    });
    grid.appendChild(card);
  });
  content.appendChild(grid);
}

// STATS
async function buildStatsView(){
  const stats=await window.electronAPI.getStreamStats(activeProfileId);
  const content=document.getElementById('stats-content');if(!content)return;
  const entries=Object.entries(stats).filter(([,v])=>v.total>0).sort((a,b)=>b[1].total-a[1].total);
  content.innerHTML='';
  if(!entries.length){content.innerHTML='<div style="color:var(--tx2);font-size:13px">Noch keine Stream-Daten.</div>';}
  else{
    const maxSecs=Math.max(...entries.map(e=>e[1].total),1);
    content.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">⏱ Meiste Streamzeit (Top 3)</h3>';
    entries.slice(0,3).forEach(([id,data])=>{
      const p=PROVIDERS()[id];if(!p)return;
      const hours=(data.total/3600).toFixed(1),pct=Math.round(data.total/maxSecs*100);
      const w=document.createElement('div');w.className='stats-bar-wrap';
      w.innerHTML=`<div class="stats-bar-label"><span>${esc(customName(id)||p.name)}</span><span>${hours}h</span></div><div class="stats-bar"><div class="stats-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>`;
      content.appendChild(w);
    });
    const days=window._days||['So','Mo','Di','Mi','Do','Fr','Sa'];
    const dayTotals=Array(7).fill(0);
    entries.forEach(([,data])=>{if(data.byDay)data.byDay.forEach((s,i)=>dayTotals[i]+=s);});
    const maxDay=Math.max(...dayTotals,1);
    const dw=document.createElement('div');dw.style.cssText='margin-top:20px';
    dw.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">📅 Wochentage</h3>'+days.map((d,i)=>`<div class="stats-bar-wrap"><div class="stats-bar-label"><span>${d}</span><span>${(dayTotals[i]/3600).toFixed(1)}h</span></div><div class="stats-bar"><div class="stats-bar-fill" style="width:${Math.round(dayTotals[i]/maxDay*100)}%;background:var(--acc)"></div></div></div>`).join('');
    content.appendChild(dw);
  }

  // Crunchyroll Kalender-Sektion
  const calSection=document.createElement('div');calSection.style.cssText='margin-top:28px';
  calSection.innerHTML='<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:12px">⛩️ Crunchyroll Release-Kalender</h3>';
  const calContent=document.createElement('div');calSection.appendChild(calContent);content.appendChild(calSection);
  loadCrunchyrollCalendar(calContent);

  buildAchievements(stats);
}

async function checkAchievements(){
  const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));
  const meta=JSON.parse(localStorage.getItem(`achMeta_${activeProfileId}`)||'{}');
  buildAchievements(stats,meta);
}

function buildAchievements(stats,meta={}){
  const content=document.getElementById('achievements-content');if(!content)return;
  const t=I18N[lang]||I18N.de;
  const earnedIds=new Set(JSON.parse(localStorage.getItem(`achievements_${activeProfileId}`)||'[]'));
  // Prüfe neue Achievements
  ACHIEVEMENTS.forEach(ach=>{
    let earned=false;
    try{earned=ach.check(stats,meta);}catch{}
    if(earned&&!earnedIds.has(ach.id)){
      earnedIds.add(ach.id);
      localStorage.setItem(`achievements_${activeProfileId}`,JSON.stringify([...earnedIds]));
      setTimeout(()=>{
        const name=typeof ach.name==='object'?ach.name[lang]||ach.name.de:ach.name;
        const desc=typeof ach.desc==='object'?ach.desc[lang]||ach.desc.de:ach.desc;
        window.electronAPI.showNotification('🏆 Achievement freigeschaltet!',`${ach.icon} ${name}: ${desc}`);
      },500);
    }
  });

  content.innerHTML=`<h3 style="font-family:var(--font-d);font-size:15px;color:var(--tx);margin-bottom:16px">${t.statsAchievements||'🏆 Achievements'}</h3>`;

  // Kategorien aufbauen
  const cats=['stream','provider','special','hidden'];
  cats.forEach(cat=>{
    const catAchs=ACHIEVEMENTS.filter(a=>a.cat===cat);
    if(!catAchs.length)return;
    const catLabel=ACHIEVEMENT_CATEGORIES[cat]?.[lang]||ACHIEVEMENT_CATEGORIES[cat]?.de||cat;
    const section=document.createElement('div');section.style.cssText='margin-bottom:20px';
    section.innerHTML=`<div style="font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">${catLabel}</div>`;
    const grid=document.createElement('div');grid.style.cssText='display:flex;flex-wrap:wrap;gap:6px';

    if(cat==='hidden'){
      // Versteckte: nur freigeschaltete zeigen, Rest als ??? anzeigen
      const earned=catAchs.filter(a=>earnedIds.has(a.id));
      const locked=catAchs.filter(a=>!earnedIds.has(a.id));
      earned.forEach(ach=>{
        const name=typeof ach.name==='object'?ach.name[lang]||ach.name.de:ach.name;
        const desc=typeof ach.desc==='object'?ach.desc[lang]||ach.desc.de:ach.desc;
        const card=document.createElement('div');card.className='achievement-card earned';
        card.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);font-size:13px;color:var(--acc);margin:2px;cursor:default';
        card.innerHTML=`${ach.icon} <div><div style="font-weight:600;font-size:13px">${esc(name)}</div><div style="font-size:11px;opacity:.7">${esc(desc)}</div></div>`;
        grid.appendChild(card);
      });
      if(locked.length){
        const hint=document.createElement('div');
        hint.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);font-size:12px;color:var(--tx3);margin:2px';
        hint.innerHTML=`🔒 ${locked.length}× ${t.achHiddenHint||'Versteckte Achievements – durch Spielen freischalten'}`;
        grid.appendChild(hint);
      }
    }else{
      catAchs.forEach(ach=>{
        const earned=earnedIds.has(ach.id);
        const name=typeof ach.name==='object'?ach.name[lang]||ach.name.de:ach.name;
        const desc=typeof ach.desc==='object'?ach.desc[lang]||ach.desc.de:ach.desc;
        const card=document.createElement('div');
        card.style.cssText=`display:flex;align-items:center;gap:8px;padding:8px 12px;background:${earned?'var(--accg)':'var(--bgc)'};border:1px solid ${earned?'var(--acc)':'var(--bor)'};border-radius:var(--r-sm);font-size:12px;color:${earned?'var(--acc)':'var(--tx2)'};margin:2px;opacity:${earned?1:.55};cursor:default;transition:opacity .2s`;
        card.title=desc;
        card.innerHTML=`<span style="font-size:18px">${ach.icon}</span><div><div style="font-weight:600;font-size:12px">${esc(name)}</div><div style="font-size:10px;opacity:.7;max-width:160px;line-height:1.3">${esc(desc)}</div></div>`;
        grid.appendChild(card);
      });
    }
    section.appendChild(grid);
    content.appendChild(section);
  });
}

// ─── Meta-Tracking für versteckte Achievements ───
function trackMeta(key){
  const meta=JSON.parse(localStorage.getItem(`achMeta_${activeProfileId}`)||'{}');
  meta[key]=(meta[key]||0)+1;
  localStorage.setItem(`achMeta_${activeProfileId}`,JSON.stringify(meta));
}

// TITLEBAR
function setupTitlebar(){
  document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',()=>window.electronAPI.close());
}

document.addEventListener('DOMContentLoaded',()=>{
  trackMeta('appStarts');
  init();
});
