// OmniSight Bundle – generiert am 2026-05-26T17:21:48.138Z
// NICHT MANUELL BEARBEITEN – Änderungen in den Quell-Dateien vornehmen


// ════════════════════════════════════════════════════════════
// core/i18n.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Internationalisierung (DE / EN)
// ═══════════════════════════════════════════════════════════════════

const I18N = {
  de: {
    // Navigation
    home: 'Übersicht', watchlist: 'Gemerkt', news: 'Neuigkeiten',
    upcoming: 'Upcoming', stats: 'Statistiken', settings: 'Einstellungen',
    // Suche
    searchPlaceholder: 'Anbieter, Film, Serie, YouTube-URL…',
    searchNoResults: 'Keine Ergebnisse für',
    // Allgemein
    save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen',
    close: 'Schließen', open: 'Öffnen', add: 'Hinzufügen',
    edit: 'Bearbeiten', back: 'Zurück', loading: 'Lädt…',
    yes: 'Ja', no: 'Nein', confirm: 'Bestätigen',
    // Anbieter
    addProvider: '+ Anbieter', providerSaved: 'Anbieter gespeichert',
    // Profile
    newProfile: '+ Neues Profil', profileSaved: '✓ Profil gespeichert',
    profileDeleted: 'Profil gelöscht', profileRequired: 'Mindestens 1 Profil erforderlich',
    pinSet: 'PIN gesetzt', pinWrong: 'Falscher PIN', pinRemoved: 'PIN entfernt',
    // Watchlist
    added: 'Zur Watchlist hinzugefügt', removed: 'Von Watchlist entfernt',
    alreadyAdded: '✓ Bereits in deiner Watchlist',
    // Stream
    streamEnd: 'Stream beenden?',
    // Wochentage
    days: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    // Einstellungen
    settingsTitle: 'Einstellungen', settingsSaved: '✓ Einstellungen gespeichert',
    // Update
    updateAvailable: '🚀 Update verfügbar',
    updateDownloading: '⬇ Wird heruntergeladen…',
    updateReady: '✓ Update bereit – jetzt neu starten',
    upToDate: '✓ Aktuellste Version',
    // Benachrichtigungen
    noNotifications: 'Keine Benachrichtigungen',
    // Achievements
    achievementUnlocked: 'Achievement freigeschaltet!',
    // WideVine
    widevineFound: '✓ WideVine CDM installiert und aktiv',
    widevineNotFound: '✗ WideVine CDM nicht gefunden',
    widevineGuide: 'Installationsanleitung öffnen',
    // Sonstiges
    changesSaved: '✓ Änderungen gespeichert',
    changesDiscarded: 'Änderungen verworfen',
    copied: '✓ In Zwischenablage kopiert',
    error: 'Fehler',
  },
  en: {
    home: 'Overview', watchlist: 'Saved', news: 'What\'s New',
    upcoming: 'Upcoming', stats: 'Statistics', settings: 'Settings',
    searchPlaceholder: 'Provider, Movie, Series, YouTube URL…',
    searchNoResults: 'No results for',
    save: 'Save', cancel: 'Cancel', delete: 'Delete',
    close: 'Close', open: 'Open', add: 'Add',
    edit: 'Edit', back: 'Back', loading: 'Loading…',
    yes: 'Yes', no: 'No', confirm: 'Confirm',
    addProvider: '+ Provider', providerSaved: 'Provider saved',
    newProfile: '+ New Profile', profileSaved: '✓ Profile saved',
    profileDeleted: 'Profile deleted', profileRequired: 'At least 1 profile required',
    pinSet: 'PIN set', pinWrong: 'Wrong PIN', pinRemoved: 'PIN removed',
    added: 'Added to watchlist', removed: 'Removed from watchlist',
    alreadyAdded: '✓ Already in your watchlist',
    streamEnd: 'End stream?',
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    settingsTitle: 'Settings', settingsSaved: '✓ Settings saved',
    updateAvailable: '🚀 Update available',
    updateDownloading: '⬇ Downloading…',
    updateReady: '✓ Update ready – restart now',
    upToDate: '✓ You have the latest version',
    noNotifications: 'No notifications',
    achievementUnlocked: 'Achievement unlocked!',
    widevineFound: '✓ WideVine CDM installed and active',
    widevineNotFound: '✗ WideVine CDM not found',
    widevineGuide: 'Open installation guide',
    changesSaved: '✓ Changes saved',
    changesDiscarded: 'Changes discarded',
    copied: '✓ Copied to clipboard',
    error: 'Error',
  },
};

function t(key) {
  const lang = (typeof settings !== 'undefined' && settings.language) || 'de';
  return (I18N[lang] || I18N.de)[key] || (I18N.de)[key] || key;
}

// ════════════════════════════════════════════════════════════
// core/providers.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Provider Definitionen
// Alle Streaming-Anbieter mit Metadaten
// ═══════════════════════════════════════════════════════════════════

const PROVIDERS_BASE = {
  // ── Video-On-Demand ──────────────────────────────────────────────
  netflix:       {name:'Netflix',         tag:'Serien & Filme',           url:'https://www.netflix.com',                 color:'#E50914', quality:'4K',   multiTab:false},
  prime:         {name:'Prime Video',     tag:'Amazon Originals',          url:'https://www.primevideo.com',              color:'#00A8E1', quality:'4K',   multiTab:false},
  disney:        {name:'Disney+',         tag:'Disney · Marvel · Star Wars',url:'https://www.disneyplus.com',            color:'#113CCF', quality:'4K',   multiTab:false},
  hbomax:        {name:'Max',             tag:'HBO & Warner Bros.',         url:'https://www.max.com',                    color:'#002BE7', quality:'4K',   multiTab:false},
  apple:         {name:'Apple TV+',       tag:'Apple Originals',           url:'https://tv.apple.com',                   color:'#000000', quality:'4K',   multiTab:false},
  paramountplus: {name:'Paramount+',      tag:'CBS & Paramount Originals', url:'https://www.paramountplus.com',           color:'#0064FF', quality:'1080p',multiTab:false},
  mubi:          {name:'MUBI',            tag:'Arthouse & Indie',          url:'https://mubi.com/de',                    color:'#29292B', quality:'1080p',multiTab:false},
  skygo:         {name:'Sky Go',          tag:'Sky Entertainment',          url:'https://www.sky.de/sky-go',              color:'#000000', quality:'1080p',multiTab:false},
  wow:           {name:'WOW',             tag:'Serien & Sport',            url:'https://www.wowtv.de',                   color:'#FF3366', quality:'1080p',multiTab:false},
  waipu:         {name:'Waipu TV',        tag:'Live-TV & Mediatheken',     url:'https://www.waipu.tv/tv-programm',       color:'#FF6600', quality:'1080p',multiTab:false},
  magenta:       {name:'MagentaTV',       tag:'Deutsche Telekom',          url:'https://www.magentatv.de',               color:'#E20074', quality:'4K',   multiTab:false},
  // ── Anime ─────────────────────────────────────────────────────────
  crunchyroll:   {name:'Crunchyroll',     tag:'Anime & Manga',             url:'https://www.crunchyroll.com',            color:'#F47521', quality:'1080p',multiTab:false},
  adn:           {name:'ADN',             tag:'Anime Digital Network',     url:'https://www.animedigitalnetwork.de',     color:'#0099FF', quality:'1080p',multiTab:false},
  // ── Live & Sport ──────────────────────────────────────────────────
  twitch:        {name:'Twitch',          tag:'Live-Streams & Gaming',     url:'https://www.twitch.tv',                  color:'#9146FF', quality:'1080p',multiTab:true, bgAudio:true},
  dazn:          {name:'DAZN',            tag:'Live-Sport',                url:'https://www.dazn.com',                   color:'#F8FF00', quality:'4K',   multiTab:false},
  // ── Video / YouTube ───────────────────────────────────────────────
  youtube:       {name:'YouTube',         tag:'Videos & Streams',          url:'https://www.youtube.com',                color:'#FF0000', quality:'4K',   multiTab:true, bgAudio:false},
  // ── Musik ─────────────────────────────────────────────────────────
  spotify:       {name:'Spotify',         tag:'Musik & Podcasts',          url:'https://open.spotify.com',               color:'#1DB954', quality:'',     multiTab:false, bgAudio:true},
  // ── Kostenlos ────────────────────────────────────────────────────
  ard:           {name:'ARD Mediathek',   tag:'Öffentlich-Rechtlich',      url:'https://www.ardmediathek.de',            color:'#003D73', quality:'HD',   multiTab:false},
  zdf:           {name:'ZDF Mediathek',   tag:'Öffentlich-Rechtlich',      url:'https://www.zdf.de',                     color:'#1A1B4B', quality:'HD',   multiTab:false},
  arte:          {name:'ARTE',            tag:'Kultur & Dokumentationen',  url:'https://www.arte.tv/de',                 color:'#E5281E', quality:'HD',   multiTab:false},
  funk:          {name:'Funk',            tag:'Content-Netzwerk ARD/ZDF',  url:'https://www.funk.net',                   color:'#000000', quality:'HD',   multiTab:false},
  kika:          {name:'KiKA',            tag:'Kinder-Mediathek',          url:'https://www.kika.de',                    color:'#00AA00', quality:'HD',   multiTab:false},
  joyn:          {name:'Joyn',            tag:'Free-TV & Mediathek',       url:'https://www.joyn.de',                    color:'#FF4C00', quality:'HD',   multiTab:false},
  rtl:           {name:'RTL+',            tag:'Entertainment & Serien',    url:'https://plus.rtl.de',                    color:'#FF0000', quality:'HD',   multiTab:false},
  // ── Inoffiziell ───────────────────────────────────────────────────
  burning:       {name:'Burning Series',  tag:'Serien-Streaming',          url:'https://bs.to',                          color:'#C0392B', quality:'',     multiTab:false},
  cineto:        {name:'Cine.to',         tag:'Filme & Serien',            url:'https://cine.to',                        color:'#1A1A2E', quality:'',     multiTab:false},
  movie2k:       {name:'Movie2k',         tag:'Filme & Serien',            url:'https://movie2k.ch',                     color:'#2C3E50', quality:'',     multiTab:false},
};

// TMDB Provider-ID → OmniSight-ID Mapping
const TMDB_PMAP = {
  8:   'netflix',     9:   'prime',       337: 'disney',
  384: 'hbomax',      2:   'apple',       531: 'paramountplus',
  100: 'mubi',        29:  'skygo',       546: 'wow',
  386: 'dazn',        67:  'crunchyroll', 283: 'adn',
  192: 'youtube',     78:  'twitch',
};

// Kategorie-Zuordnung
const PROVIDER_CAT_MAP = {
  netflix:'video',   prime:'video',      disney:'video',   hbomax:'video',
  apple:'video',     paramountplus:'video', mubi:'video',  skygo:'video',
  wow:'video',       waipu:'live',       magenta:'live',
  crunchyroll:'anime', adn:'anime',
  twitch:'live',     dazn:'live',
  youtube:'video',   spotify:'music',
  ard:'free',        zdf:'free',         arte:'free',      funk:'free',
  kika:'free',       joyn:'free',        rtl:'free',
  burning:'video',   cineto:'video',     movie2k:'video',
};

const PROVIDER_CATEGORIES = {
  all:    {de:'Alle',         en:'All',           icon:'🌐'},
  video:  {de:'Streaming',    en:'Streaming',      icon:'🎬'},
  anime:  {de:'Anime',        en:'Anime',          icon:'⛩️'},
  live:   {de:'Live & Sport', en:'Live & Sport',   icon:'📡'},
  music:  {de:'Musik',        en:'Music',          icon:'🎵'},
  free:   {de:'Kostenlos',    en:'Free',           icon:'🆓'},
  custom: {de:'Eigene',       en:'Custom',         icon:'⚙️'},
};

function getProviderCategory(id) {
  if (typeof settings !== 'undefined' && settings.providerCategories?.[id])
    return settings.providerCategories[id];
  return PROVIDER_CAT_MAP[id] || 'video';
}

function getFavicon(id, p) {
  const FAVICON_MAP = {
    apple:'tv.apple.com', adn:'animedigitalnetwork.de', ard:'ardmediathek.de',
    arte:'arte.tv', burning:'bs.to', cineto:'cine.to', crunchyroll:'crunchyroll.com',
    dazn:'dazn.com', disney:'disneyplus.com', funk:'funk.net',
    hbomax:'max.com', joyn:'joyn.de', kika:'kika.de', magenta:'magentatv.de',
    mubi:'mubi.com', movie2k:'movie2k.ch', netflix:'netflix.com',
    paramountplus:'paramountplus.com', prime:'primevideo.com', rtl:'plus.rtl.de',
    skygo:'sky.de', spotify:'open.spotify.com', twitch:'twitch.tv',
    waipu:'waipu.tv', wow:'wowtv.de', youtube:'youtube.com', zdf:'zdf.de',
    spotify:'open.spotify.com',
  };
  const domain = FAVICON_MAP[id];
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  if (p?.logoUrl) return p.logoUrl;
  return `https://www.google.com/s2/favicons?domain=${(new URL(p?.url||'https://example.com').hostname)}&sz=64`;
}

function PROVIDERS() {
  const custom = (typeof customProviders !== 'undefined') ? customProviders : {};
  return { ...PROVIDERS_BASE, ...custom };
}

// ════════════════════════════════════════════════════════════
// core/achievements.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Achievements System
// ═══════════════════════════════════════════════════════════════════

// Hilfsfunktionen
function _tot(stats) {
  return Object.values(stats||{}).reduce((a, v) => a + (v?.total||0), 0);
}
function _uniq(stats) {
  return Object.values(stats||{}).filter(v => (v?.total||0) > 0).length;
}

const ACHIEVEMENTS = [
  // ── Streaming-Meilensteine ────────────────────────────────────────
  {id:'h2',   cat:'stream',   icon:'⏰', name:{de:'2 Stunden',    en:'2 Hours'},    desc:{de:'2h gestreamt',     en:'2h streamed'},    check:(s)=>_tot(s)>=7200},
  {id:'h20',  cat:'stream',   icon:'🕔', name:{de:'20 Stunden',   en:'20 Hours'},   desc:{de:'20h gestreamt',    en:'20h streamed'},   check:(s)=>_tot(s)>=72000},
  {id:'h75',  cat:'stream',   icon:'🥉', name:{de:'75 Stunden',   en:'75 Hours'},   desc:{de:'75h gestreamt',    en:'75h streamed'},   check:(s)=>_tot(s)>=270000},
  {id:'h100', cat:'stream',   icon:'🥇', name:{de:'100 Stunden',  en:'100 Hours'},  desc:{de:'100h gestreamt',   en:'100h streamed'},  check:(s)=>_tot(s)>=360000},
  {id:'h250', cat:'stream',   icon:'🥈', name:{de:'250 Stunden',  en:'250 Hours'},  desc:{de:'250h gestreamt',   en:'250h streamed'},  check:(s)=>_tot(s)>=900000},
  {id:'h500', cat:'stream',   icon:'💎', name:{de:'500 Stunden',  en:'500 Hours'},  desc:{de:'500h gestreamt',   en:'500h streamed'},  check:(s)=>_tot(s)>=1800000},
  {id:'h1000',cat:'stream',   icon:'⭐', name:{de:'1000 Stunden', en:'1000 Hours'}, desc:{de:'1000h gestreamt',  en:'1000h streamed'}, check:(s)=>_tot(s)>=3600000},
  // ── Anbieter-Vielfalt ────────────────────────────────────────────
  {id:'prov3', cat:'provider', icon:'📺', name:{de:'3 Anbieter',   en:'3 Providers'}, desc:{de:'3 verschiedene Anbieter',   en:'3 providers used'}, check:(s)=>_uniq(s)>=3},
  {id:'prov10',cat:'provider', icon:'🌍', name:{de:'10 Anbieter',  en:'10 Providers'},desc:{de:'10 verschiedene Anbieter',  en:'10 providers used'},check:(s)=>_uniq(s)>=10},
  {id:'prov15',cat:'provider', icon:'🌎', name:{de:'15 Anbieter',  en:'15 Providers'},desc:{de:'15 verschiedene Anbieter', en:'15 providers used'},check:(s)=>_uniq(s)>=15},
  // ── Anbieter-Spezifisch ─────────────────────────────────────────
  {id:'ard1h',    cat:'provider',icon:'📻',name:{de:'Öffentlich-Rechtlich',en:'Public TV'},        desc:{de:'1h ARD oder ZDF',    en:'1h ARD or ZDF'},   check:(s)=>(s.ard?.total||0)+(s.zdf?.total||0)>=3600},
  {id:'arte1h',   cat:'provider',icon:'🎨',name:{de:'Kulturliebhaber',     en:'Culture Lover'},    desc:{de:'1h ARTE',            en:'1h ARTE'},         check:(s)=>(s.arte?.total||0)>=3600},
  {id:'joyn2h',   cat:'provider',icon:'📺',name:{de:'Free-TV Fan',         en:'Free TV Fan'},      desc:{de:'2h Joyn',            en:'2h Joyn'},         check:(s)=>(s.joyn?.total||0)>=7200},
  {id:'prime5h',  cat:'provider',icon:'📦',name:{de:'Prime-Fan',           en:'Prime Fan'},        desc:{de:'5h Prime Video',     en:'5h Prime Video'},  check:(s)=>(s.prime?.total||0)>=18000},
  {id:'spotify5h',cat:'provider',icon:'🎵',name:{de:'Musik-Liebhaber',     en:'Music Lover'},      desc:{de:'5h Spotify',         en:'5h Spotify'},      check:(s)=>(s.spotify?.total||0)>=18000},
  // ── Besondere Erfolge ─────────────────────────────────────────────
  {id:'friday',   cat:'special', icon:'🎉',name:{de:'Freitagsstreamer',   en:'Friday Streamer'},  desc:{de:'Am Freitag gestreamt', en:'Streamed on Friday'},  check:(s)=>Object.values(s||{}).some(v=>(v.byDay?.[5]||0)>0)},
  {id:'allweek',  cat:'special', icon:'🗓️',name:{de:'Allrounder',          en:'All-Rounder'},      desc:{de:'Jeden Wochentag gestreamt',en:'Streamed every day'},  check:(s)=>Array(7).fill(0).map((_,i)=>Object.values(s||{}).reduce((a,v)=>a+(v.byDay?.[i]||0),0)).every(d=>d>0)},
  {id:'wl5',      cat:'special', icon:'📝',name:{de:'Erste 5 gemerkt',    en:'First 5 Saved'},    desc:{de:'5 Titel in Watchlist',    en:'5 titles saved'},      check:()=>(typeof watchlist!=='undefined'?watchlist:[]).length>=5},
  {id:'wl10',     cat:'special', icon:'📋',name:{de:'Watchlist-Fan',      en:'Watchlist Fan'},    desc:{de:'10 Titel gemerkt',        en:'10 titles saved'},     check:()=>(typeof watchlist!=='undefined'?watchlist:[]).length>=10},
  {id:'wl25',     cat:'special', icon:'📚',name:{de:'Watchlist-Sammler',  en:'Collector'},        desc:{de:'25 Titel gemerkt',        en:'25 titles saved'},     check:()=>(typeof watchlist!=='undefined'?watchlist:[]).length>=25},
  {id:'wl50',     cat:'special', icon:'📖',name:{de:'Fleißige Watchlist', en:'Busy Watchlist'},   desc:{de:'50 Titel gemerkt',        en:'50 titles saved'},     check:()=>(typeof watchlist!=='undefined'?watchlist:[]).length>=50},
  {id:'search10', cat:'special', icon:'🔍',name:{de:'Forscher',           en:'Researcher'},       desc:{de:'10× gesucht',             en:'Searched 10×'},        check:(_,m)=>(m?.searchCount||0)>=10},
  {id:'customProv',cat:'special',icon:'🆕',name:{de:'Pionier',            en:'Pioneer'},          desc:{de:'Eigenen Anbieter erstellt',en:'Custom provider added'},check:(_,m)=>(m?.customProviderAdded||0)>=1},
  // ── Versteckt ────────────────────────────────────────────────────
  {id:'hid_night',    cat:'hidden',icon:'🌙',name:{de:'Nachtmensch',       en:'Night Owl'},        desc:{de:'Nach 23 Uhr gestreamt',   en:'Streamed after 11pm'},   hidden:true, check:(_,m)=>(m?.lateNight||0)>=1},
  {id:'hid_marathon', cat:'hidden',icon:'🏃',name:{de:'Marathon-Zuschauer',en:'Binge Watcher'},    desc:{de:'6h am Stück gestreamt',   en:'6h in a row'},           hidden:true, check:(s)=>Object.values(s||{}).some(v=>v.byDay&&Math.max(...v.byDay)>=21600)},
  {id:'hid_nostalgic',cat:'hidden',icon:'📼',name:{de:'Nostalgiker',       en:'Nostalgic'},        desc:{de:'3h auf inoffiziellen Seiten',en:'3h unofficial sites'}, hidden:true, check:(s)=>(s.cineto?.total||0)+(s.movie2k?.total||0)+(s.burning?.total||0)>=10800},
  {id:'hid_search100',cat:'hidden',icon:'🕵️',name:{de:'Suchmaschine',     en:'Search Machine'},   desc:{de:'100× gesucht',            en:'Searched 100×'},         hidden:true, check:(_,m)=>(m?.searchCount||0)>=100},
  {id:'hid_allprov',  cat:'hidden',icon:'🏅',name:{de:'Sammler',           en:'Collector'},        desc:{de:'20 verschiedene Anbieter',en:'20 providers used'},     hidden:true, check:(s)=>_uniq(s)>=20},
  {id:'hid_beta',     cat:'hidden',icon:'🧪',name:{de:'Beta-Tester',       en:'Beta Tester'},      desc:{de:'In der Beta dabei gewesen',en:'Participated in beta'},  hidden:true, check:(_,m)=>(m?.isBeta||0)>=1},
];

async function checkAchievements(statsArg = null) {
  try {
    const stats = statsArg || await window.electronAPI.getStreamStats(activeProfileId).catch(() => ({}));
    const pid   = activeProfileId || 'default';

    // Aus electron-store laden (persistent, überlebt Updates!)
    let earnedArr = await window.electronAPI.getAchievements(pid).catch(() => []);
    let meta      = await window.electronAPI.getAchievementMeta(pid).catch(() => ({}));
    
    // Migration: falls noch in localStorage
    const lsKey = `achievements_${pid}`;
    const lsData = localStorage.getItem(lsKey);
    if (lsData && (!earnedArr || earnedArr.length === 0)) {
      try {
        earnedArr = JSON.parse(lsData);
        // In electron-store migrieren
        window.electronAPI.setAchievements(pid, earnedArr);
        localStorage.removeItem(lsKey);
        console.log('[Achievements] localStorage → electron-store migriert');
      } catch {}
    }

    const earned  = new Set(earnedArr || []);
    let newOnes   = false;

    // Beta-Achievement automatisch setzen
    meta.isBeta = 1;
    meta.searchCount = (meta.searchCount || 0);

    for (const a of ACHIEVEMENTS) {
      if (earned.has(a.id)) continue;
      let ok = false;
      try { ok = a.check(stats, meta, typeof watchlist !== 'undefined' ? watchlist : []); } catch {}
      if (!ok) continue;
      earned.add(a.id);
      newOnes = true;
      const name = a.name[(typeof lang !== 'undefined' ? lang : 'de')] || a.name.de;
      if (settings?.notificationsConfig?.achievements !== false) {
        if (typeof addNotification === 'function')
          addNotification('🏆', typeof t === 'function' ? t('achievementUnlocked') : 'Achievement!', `${a.icon} ${name}`);
      }
    }
    if (newOnes) {
      // In electron-store speichern (nicht localStorage)
      window.electronAPI.setAchievements(pid, [...earned]);
      window.electronAPI.setAchievementMeta(pid, meta);
    }
  } catch (e) {
    console.warn('[Achievements] Fehler:', e.message);
  }
}

function startAchievementWatcher() {
  // Alle 5 Minuten prüfen
  setInterval(() => checkAchievements(), 5 * 60 * 1000);
  // Sofort nach Init
  setTimeout(() => checkAchievements(), 3000);
}

// ════════════════════════════════════════════════════════════
// ui/notifications.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Benachrichtigungs-System
// ═══════════════════════════════════════════════════════════════════

let notifications = [];

function addNotification(icon, title, body) {
  if (!Array.isArray(notifications)) notifications = [];
  const n = {
    id:   Date.now() + Math.random(),
    icon: icon || '🔔',
    title, body,
    time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }),
  };
  notifications.unshift(n);
  notifications = notifications.slice(0, 50);
  renderNotifications();
  updateNotifBadge();
  persistNotifications();
  // Ton
  if (settings?.notificationsConfig?.sound) {
    try {
      const ctx = new AudioContext();
      const o   = ctx.createOscillator();
      const g   = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 520;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.3);
    } catch {}
  }
  return n;
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifications.length) {
    list.innerHTML = `<div style="text-align:center;padding:30px;color:var(--tx2);font-size:13px">${t('noNotifications')}</div>`;
    return;
  }
  list.innerHTML = notifications.map(n => `
    <div class="notif-item" data-id="${n.id}">
      <div class="notif-item-icon">${n.icon}</div>
      <div class="notif-item-body">
        <div class="notif-item-title">${esc(n.title || '')}</div>
        <div class="notif-item-text">${esc(n.body || '')}</div>
      </div>
      <div class="notif-item-meta">
        <div class="notif-item-time">${n.time}</div>
        <button class="notif-item-del" onclick="deleteNotif(${n.id})">✕</button>
      </div>
    </div>`).join('');
}

function updateNotifBadge() {
  const b = document.getElementById('notif-badge');
  if (!b) return;
  const count = notifications.length;
  b.textContent = count > 99 ? '99+' : count;
  b.style.display = count ? 'flex' : 'none';
}

function deleteNotif(id) {
  notifications = notifications.filter(n => n.id !== id);
  renderNotifications();
  updateNotifBadge();
  persistNotifications();
}

window.deleteNotif = deleteNotif;

function persistNotifications() {
  try {
    window.electronAPI.setNotifications(
      activeProfileId || 'default',
      notifications
    );
  } catch {}
}

async function loadPersistedNotifications() {
  try {
    const saved = await window.electronAPI.getNotifications(activeProfileId || 'default');
    if (Array.isArray(saved)) {
      notifications = saved;
      renderNotifications();
      updateNotifBadge();
    }
  } catch {}
}

function setupNotificationCenter() {
  const bell = document.getElementById('notif-bell-btn');
  const nc   = document.getElementById('notif-center');
  const close = document.getElementById('notif-center-close');
  const clear = document.getElementById('notif-clear-all');
  if (!bell || !nc) return;

  bell.addEventListener('click', e => {
    e.stopPropagation();
    const open = nc.style.display === 'flex';
    nc.style.display = open ? 'none' : 'flex';
    if (!open) renderNotifications();
  });
  document.addEventListener('click', e => {
    if (nc.style.display === 'flex' && !nc.contains(e.target) && !bell.contains(e.target))
      nc.style.display = 'none';
  });
  close?.addEventListener('click', () => nc.style.display = 'none');
  clear?.addEventListener('click', () => {
    notifications = [];
    renderNotifications();
    updateNotifBadge();
    persistNotifications();
  });

  // Crash-Log Benachrichtigung
  window.electronAPI.onCrashLogFound?.(data => {
    const toast = document.createElement('div');
    toast.className = 'crash-toast';
    toast.innerHTML = `
      <div style="font-size:20px">⚠️</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:var(--tx)">Letzter Absturz erkannt</div>
        <div style="font-size:11px;color:var(--tx2);margin-top:2px">OmniSight ist beim letzten Start abgestürzt.</div>
      </div>
      <button id="crash-view-btn" class="crash-btn">Details</button>
      <button id="crash-clear-btn" class="crash-close">✕</button>`;
    document.body.appendChild(toast);
    document.getElementById('crash-view-btn')?.addEventListener('click', () => {
      alert(`Crash-Details:\n\n${data.preview}\n\nLog: %AppData%\\omnisight\\logs\\crash.log`);
    });
    document.getElementById('crash-clear-btn')?.addEventListener('click', () => {
      window.electronAPI.clearCrashLog();
      toast.remove();
    });
    setTimeout(() => toast?.remove(), 12000);
  });
}

// ════════════════════════════════════════════════════════════
// ui/search.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Suche (TMDB + Anbieter)
// ═══════════════════════════════════════════════════════════════════

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';

let _searchTimer  = null;
let _searchAbort  = null;
let _searchPage   = 1;
// searchHistory: von app.js verwaltet

// Cache für schnelle Wiederholung
const _searchCache = new Map();

function setupSearch() {
  const input   = document.getElementById('search-input');
  const dd      = document.getElementById('search-dropdown');
  const clearBtn= document.getElementById('search-clear');
  if (!input || !dd) return;

  function closeSearch() { dd.style.display = 'none'; }

  function doSearch(q, page = 1) {
    _searchPage = page;
    q = q.trim();
    if (!q) {
      if (searchHistory.length) renderSearchHistory(dd);
      else closeSearch();
      return;
    }
    // YouTube-URL direkt
    const ytId = extractYtId(q);
    if (ytId && page === 1) { renderYtResult(dd, ytId); return; }

    if (_searchAbort) try { _searchAbort.abort(); } catch {}
    _searchAbort = new AbortController();
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => runTmdbSearch(q, page, _searchAbort.signal), 300);
  }

  // Alle alten Listener entfernen durch Clone
  const fresh = input.cloneNode(true);
  input.parentNode.replaceChild(fresh, input);

  fresh.addEventListener('input', () => {
    const q = fresh.value;
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
    doSearch(q);
  });
  fresh.addEventListener('focus', () => {
    const q = fresh.value.trim();
    if (q) doSearch(q);
    else if (searchHistory.length) renderSearchHistory(dd);
  });
  fresh.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter' && fresh.value.trim()) {
      addToSearchHistory(fresh.value.trim());
    }
  });

  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      fresh.value = '';
      clearBtn.style.display = 'none';
      dd.innerHTML = '';
      closeSearch();
      if (_searchAbort) try { _searchAbort.abort(); } catch {}
      clearTimeout(_searchTimer);
      fresh.focus();
    });
  }

  // Außen-Klick schließt
  document.addEventListener('mousedown', e => {
    const wrap = fresh.closest?.('.search-bar') ||
                 fresh.closest?.('.search-bar-wrap') ||
                 fresh.parentElement;
    if (wrap && !wrap.contains(e.target) && !dd.contains(e.target))
      closeSearch();
  });

  // Seitenwechsel schließt
  document.querySelectorAll('[data-view]').forEach(btn =>
    btn.addEventListener('click', closeSearch));
}

function extractYtId(q) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = q.match(p);
    if (m) return m[1];
  }
  return null;
}

function renderYtResult(dd, ytId) {
  dd.innerHTML = `
    <div class="search-dd-section">YouTube</div>
    <div class="search-dd-item" id="yt-dd-direct" style="cursor:pointer">
      <img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg"
        style="width:80px;height:46px;border-radius:5px;object-fit:cover;flex-shrink:0"
        onerror="this.style.display='none'"/>
      <div class="search-dd-info">
        <div class="search-dd-title">YouTube Video</div>
        <div class="search-dd-meta">Direkt öffnen</div>
      </div>
    </div>`;
  dd.style.display = 'block';
  document.getElementById('yt-dd-direct')?.addEventListener('click', () => {
    dd.style.display = 'none';
    openProviderAtUrl('youtube',
      `https://www.youtube.com/watch?v=${ytId}`,
      'YouTube', getProfilePartition('youtube'));
  });
}

async function runTmdbSearch(q, page = 1, signal = null) {
  const dd = document.getElementById('search-dropdown');
  if (!dd || !q) return;

  // Cache prüfen
  const cacheKey = `${q}|${page}`;
  const cached   = _searchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
    dd.innerHTML    = cached.html;
    dd.style.display = 'block';
    bindSearchResults(dd, q, page);
    return;
  }

  const ql = q.toLowerCase().trim();

  // Anbieter-Treffer (immer auf Seite 1)
  let html = '';
  if (page === 1) {
    const provMatches = Object.entries(PROVIDERS())
      .filter(([id]) => !(settings.deletedProviders || []).includes(id))
      .filter(([id, p]) => {
        const name = ((settings.cardCustomNames || {})[id] || p.name).toLowerCase();
        return name.startsWith(ql) || name.includes(ql);
      })
      .slice(0, 3);

    if (provMatches.length) {
      html += '<div class="search-dd-section">Anbieter</div>';
      provMatches.forEach(([id, p]) => {
        const name = (settings.cardCustomNames || {})[id] || p.name;
        html += `<div class="search-dd-item" data-prov-open="${id}" style="cursor:pointer">
          <img src="${getFavicon(id, p)}"
            style="width:36px;height:36px;object-fit:contain;border-radius:8px;
                   background:${p.color}22;padding:4px"
            onerror="this.style.display='none'"/>
          <div class="search-dd-info">
            <div class="search-dd-title">${esc(name)}</div>
            <div class="search-dd-meta">${esc(p.tag || '')}</div>
          </div>
        </div>`;
      });
    }
  }

  // TMDB
  try {
    if (signal?.aborted) return;
    const data    = await window.electronAPI.searchTmdb(q);
    if (signal?.aborted) return;

    const results = (data.results || []).filter(r => {
      if (!r.poster_path || r.media_type === 'person') return false;
      const title = (r.title || r.name || '').toLowerCase();
      // Relevanz: Begriff muss im Titel vorkommen
      if (!title.includes(ql) && !ql.split(' ').every(w => w.length < 2 || title.includes(w)))
        return false;
      // Nur lateinische Zeichen
      return /^[\u0000-\u024F\s\d\W]+$/.test(r.title || r.name || '');
    });

    if (results.length) {
      if (page === 1) html += '<div class="search-dd-section">Filme & Serien</div>';
      const slice = results.slice((page - 1) * 8, page * 8);
      slice.forEach(item => {
        const title  = item.title || item.name || '';
        const year   = (item.release_date || item.first_air_date || '').substring(0, 4);
        const type   = item.media_type === 'movie' ? 'Film' : 'Serie';
        const rating = item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : '';
        html += `<div class="search-dd-item search-dd-film" style="cursor:pointer"
            data-tmdb="${item.id}" data-type="${item.media_type}" data-title="${esc(title)}">
          <img class="search-dd-poster"
            src="${TMDB_IMG}${item.poster_path}"
            style="width:36px;height:52px;object-fit:cover;border-radius:5px;flex-shrink:0"
            onerror="this.style.display='none'"/>
          <div class="search-dd-info">
            <div class="search-dd-title">${esc(title)}</div>
            <div class="search-dd-meta">
              <span class="search-dd-badge">${type}</span>
              ${year ? `<span>${year}</span>` : ''}
              ${rating ? `<span>${rating}</span>` : ''}
            </div>
          </div>
        </div>`;
      });
      if (results.length > page * 8)
        html += `<div class="search-dd-more" id="dd-more-btn">Mehr anzeigen ↓</div>`;
    } else if (!html.includes('data-prov-open')) {
      html += `<div style="padding:16px 14px;text-align:center;font-size:13px;color:var(--tx2)">
        Keine Ergebnisse für „${esc(q)}"</div>`;
    }
  } catch (e) {
    if (e.name !== 'AbortError')
      html += `<div style="padding:12px;color:var(--danger);font-size:12px">Suche fehlgeschlagen</div>`;
  }

  if (signal?.aborted) return;
  if (page === 1) { dd.innerHTML = html; }
  else {
    document.getElementById('dd-more-btn')?.remove();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('.search-dd-item, .search-dd-more').forEach(el => dd.appendChild(el));
  }
  dd.style.display = 'block';

  // Cache speichern
  _searchCache.set(cacheKey, { html: dd.innerHTML, ts: Date.now() });

  bindSearchResults(dd, q, page);
}

function bindSearchResults(dd, q, page) {
  dd.querySelectorAll('[data-prov-open]').forEach(el =>
    el.addEventListener('click', () => { dd.style.display='none'; openProvider(el.dataset.provOpen); }));
  dd.querySelectorAll('.search-dd-film').forEach(el =>
    el.addEventListener('click', e => {
      if (e.target.closest('[data-prov-open]')) return;
      dd.style.display = 'none';
      addToSearchHistory(el.dataset.title);
      showDetailPopup(parseInt(el.dataset.tmdb), el.dataset.type, el.dataset.title);
    }));
  document.getElementById('dd-more-btn')?.addEventListener('click', () =>
    runTmdbSearch(q, page + 1));
}

function addToSearchHistory(q) {
  if (!q || !q.trim()) return;
  searchHistory = [q, ...searchHistory.filter(h => h !== q)].slice(0, 15);
  settings.searchHistory = searchHistory;
  autoSave();
}

function renderSearchHistory(dd) {
  if (!searchHistory || !searchHistory.length) { dd.style.display = 'none'; return; }
  let html = `<div class="search-dd-section" style="display:flex;justify-content:space-between;align-items:center">
    <span>Zuletzt gesucht</span>
    <button onclick="clearAllSearchHistory()" class="search-dd-clear-all">Alle löschen</button>
  </div>`;
  searchHistory.slice(0, 10).forEach((q, i) => {
    const cacheKey = `${q}|1`;
    const cached   = _searchCache.get(cacheKey);
    const preview  = cached && Date.now() - cached.ts < 10 * 60 * 1000
      ? `<div style="font-size:10px;color:var(--acc);margin-top:1px">⚡ Vorschau</div>` : '';
    html += `<div class="search-dd-history-item">
      <span class="search-dd-history-q" data-q="${esc(q)}" data-i="${i}">🕐 ${esc(q)}${preview}</span>
      <button class="search-dd-history-del" data-i="${i}">✕</button>
    </div>`;
  });
  dd.innerHTML    = html;
  dd.style.display = 'block';

  dd.querySelectorAll('.search-dd-history-q').forEach(el =>
    el.addEventListener('click', () => {
      const input = document.getElementById('search-input');
      if (input) { input.value = el.dataset.q; input.focus(); }
      const cached = _searchCache.get(`${el.dataset.q}|1`);
      if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
        dd.innerHTML    = cached.html;
        dd.style.display = 'block';
        bindSearchResults(dd, el.dataset.q, 1);
      } else { runTmdbSearch(el.dataset.q, 1); }
    }));
  dd.querySelectorAll('.search-dd-history-del').forEach(el =>
    el.addEventListener('click', e => {
      e.stopPropagation();
      searchHistory.splice(parseInt(el.dataset.i), 1);
      settings.searchHistory = searchHistory;
      autoSave();
      renderSearchHistory(dd);
    }));
}

function clearAllSearchHistory() {
  searchHistory            = [];
  settings.searchHistory   = [];
  autoSave();
  const dd = document.getElementById('search-dropdown');
  if (dd) { dd.innerHTML = ''; dd.style.display = 'none'; }
}

window.clearAllSearchHistory = clearAllSearchHistory;

// ════════════════════════════════════════════════════════════
// features/widevine.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – WideVine CDM Management
// ═══════════════════════════════════════════════════════════════════

async function checkWidevineStatus() {
  try {
    const status = await window.electronAPI.getWidevineStatus();
    const el     = document.getElementById('widevine-status');
    if (!el) return;

    if (status?.installed) {
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;color:#66bb6a">
          <span style="font-size:18px">✓</span>
          <div>
            <div style="font-weight:700;font-size:13px">WideVine CDM installiert</div>
            ${status.version ? `<div style="font-size:11px;opacity:.7">Version: ${status.version}</div>` : ''}
          </div>
        </div>`;
    } else {
      const missing = [];
      if (!status?.dllExists)      missing.push('widevinecdm.dll');
      if (!status?.sigExists)      missing.push('widevinecdm.dll.sig');
      if (!status?.manifestExists) missing.push('manifest.json');

      el.innerHTML = `
        <div style="color:var(--danger)">
          <div style="display:flex;align-items:center;gap:6px;font-weight:700;margin-bottom:6px">
            <span>✗</span> WideVine CDM nicht vollständig
          </div>
          ${missing.length ? `
          <div style="font-size:11px;margin-bottom:8px">
            Fehlende Dateien:<br>
            ${missing.map(f=>`<code style="background:var(--bgc);padding:1px 5px;border-radius:3px;color:var(--danger)">${f}</code>`).join(' ')}
          </div>` : ''}
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
            <code style="background:var(--bgc);border:1px solid var(--bor);border-radius:4px;padding:4px 8px;font-size:10px;color:var(--tx2);flex:1;word-break:break-all">${status?.cdmDir || '?'}</code>
            <button onclick="window._openWvFolder('dest')"
              style="padding:5px 10px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer;white-space:nowrap">📁 Öffnen</button>
          </div>
        </div>`;

      // Anleitung-Button
      let guideBtn = el.parentElement?.querySelector('.wv-guide-btn');
      if (!guideBtn) {
        guideBtn = document.createElement('button');
        guideBtn.className = 'pick-btn wv-guide-btn';
        guideBtn.style.marginTop = '8px';
        guideBtn.innerHTML = '📖 Schritt-für-Schritt Anleitung';
        guideBtn.addEventListener('click', openWidevineGuide);
        el.parentElement?.appendChild(guideBtn);
      }
    }
  } catch (e) {
    console.warn('[WideVine] Status-Fehler:', e.message);
  }
}

window._openWvFolder = async function(type) {
  try {
    let targetPath = '';
    if (type === 'dest') {
      const status = await window.electronAPI.getWidevineStatus();
      targetPath   = status?.cdmDir || '';
    } else if (type === 'chrome') {
      targetPath   = 'C:\\Program Files\\Google\\Chrome\\Application';
    } else if (type === 'edge') {
      targetPath   = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';
    }
    if (!targetPath) { showToastMsg('Pfad nicht gefunden'); return; }
    const normalized = targetPath.replace(/\\/g, '/');
    window.electronAPI.openExternal('file:///' + normalized);
  } catch (e) {
    showToastMsg('Ordner konnte nicht geöffnet werden: ' + e.message);
  }
};

function openWidevineGuide() {
  const existing = document.getElementById('widevine-guide-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id    = 'widevine-guide-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;' +
    'display:flex;align-items:center;justify-content:center;padding:20px';

  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);
      width:min(660px,96%);max-height:88vh;display:flex;flex-direction:column;
      overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.7)">
      <div style="display:flex;align-items:center;padding:18px 22px;border-bottom:1px solid var(--bor)">
        <span style="font-size:22px;margin-right:10px">🔐</span>
        <span style="font-family:var(--font-d);font-size:17px;font-weight:800;color:var(--tx);flex:1">WideVine CDM installieren</span>
        <button onclick="document.getElementById('widevine-guide-overlay').remove()"
          style="border:none;background:transparent;color:var(--tx2);font-size:18px;cursor:pointer;padding:4px 8px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:22px;flex:1;display:flex;flex-direction:column;gap:16px">
        <div style="background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);padding:12px 16px;font-size:13px;color:var(--tx)">
          <b>Was ist WideVine?</b><br>
          WideVine ist ein Kopierschutzsystem das Netflix, Disney+, Amazon Prime und Crunchyroll
          nutzen. OmniSight braucht es um diese Dienste abspielen zu können.
          Du hast WideVine bereits auf deinem PC – es ist in Google Chrome oder Microsoft Edge eingebaut.
        </div>
        <div style="background:rgba(229,115,115,.1);border:1px solid var(--danger);border-radius:var(--r-sm);padding:10px 14px;font-size:12px;color:var(--tx)">
          ⚠️ <b>Du brauchst genau 3 Dateien</b> aus demselben Ordner – ohne alle drei funktioniert WideVine nicht:<br><br>
          <code style="background:var(--bgc);padding:2px 6px;border-radius:3px;font-size:11px">widevinecdm.dll</code> +
          <code style="background:var(--bgc);padding:2px 6px;border-radius:3px;font-size:11px">widevinecdm.dll.sig</code> +
          <code style="background:var(--bgc);padding:2px 6px;border-radius:3px;font-size:11px">manifest.json</code>
        </div>
        <div>
          <h3 style="font-family:var(--font-d);font-size:14px;font-weight:700;color:var(--tx);margin-bottom:12px">Schritt-für-Schritt:</h3>
          ${[
            {n:1, title:'Chrome- oder Edge-Ordner öffnen', desc:'Klicke auf einen der Buttons und öffne den Ordner im Datei-Explorer.',
              btns:[{label:'📁 Chrome öffnen',fn:"window._openWvFolder('chrome')"},{label:'📁 Edge öffnen',fn:"window._openWvFolder('edge')"}]},
            {n:2, title:'In den Versionsunterordner navigieren',
              desc:'Du siehst einen Ordner mit einer Versionsnummer (z.B. <code>4.10.2662.3</code>). Öffne ihn → dann <code>_platform_specific</code> → dann <code>win_x64</code>. Dort liegen die 3 benötigten Dateien.'},
            {n:3, title:'Alle 3 Dateien kopieren',
              desc:'Wähle alle Dateien aus (<kbd>Strg+A</kbd>) und kopiere sie (<kbd>Strg+C</kbd>).'},
            {n:4, title:'In den OmniSight-Ordner einfügen',
              desc:'Öffne den Ziel-Ordner und füge die Dateien ein (<kbd>Strg+V</kbd>).',
              btns:[{label:'📁 Ziel-Ordner öffnen',fn:"window._openWvFolder('dest')"}]},
            {n:5, title:'OmniSight neu starten', desc:'Schließe OmniSight komplett und öffne es erneut. Netflix, Disney+ und Crunchyroll sollten jetzt funktionieren.', ok:true},
          ].map(step=>`
            <div style="display:flex;gap:10px;margin-bottom:14px">
              <div style="width:24px;height:24px;border-radius:50%;
                background:${step.ok?'#66bb6a':'var(--acc)'};color:#fff;
                font-size:11px;font-weight:700;display:flex;align-items:center;
                justify-content:center;flex-shrink:0;margin-top:2px">${step.n}</div>
              <div style="flex:1">
                <div style="font-size:13px;color:var(--tx);font-weight:600;margin-bottom:3px">${step.title}</div>
                <div style="font-size:12px;color:var(--tx2)">${step.desc}</div>
                ${step.btns ? `<div style="display:flex;gap:6px;margin-top:6px">${step.btns.map(b=>`<button onclick="${b.fn}" style="padding:5px 12px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer">${b.label}</button>`).join('')}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <div style="background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);padding:12px 16px">
          <b style="font-size:13px;color:var(--tx)">⚖️ Legal?</b>
          <div style="font-size:12px;color:var(--tx2);margin-top:4px">
            Ja. Du verwendest WideVine nur für Dienste bei denen du angemeldet bist.
            Du kopierst es aus deinem eigenen Chrome-Browser. Das ist keine Urheberrechtsverletzung.
          </div>
        </div>
      </div>
      <div style="padding:14px 22px;border-top:1px solid var(--bor);display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('widevine-guide-overlay').remove()"
          style="padding:8px 20px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-family:var(--font-d);font-weight:700;cursor:pointer">
          Verstanden
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// Widevine-Banner wenn nicht installiert
async function checkWidevineBanner() {
  try {
    const status = await window.electronAPI.getWidevineStatus();
    if (!status?.installed && !sessionStorage.getItem('wv-banner-shown')) {
      sessionStorage.setItem('wv-banner-shown', '1');
      const banner = document.createElement('div');
      banner.id    = 'widevine-banner';
      banner.style.cssText =
        'position:fixed;top:var(--tbh,40px);left:var(--sw,200px);right:0;' +
        'background:rgba(229,115,115,.1);border-bottom:1px solid var(--danger);' +
        'padding:8px 16px;display:flex;align-items:center;gap:12px;z-index:990;' +
        'font-size:12px;color:var(--tx)';
      banner.innerHTML = `
        <span>⚠ WideVine CDM fehlt – Netflix, Disney+, Prime und Crunchyroll funktionieren möglicherweise nicht.</span>
        <button onclick="openWidevineGuide()" style="padding:4px 12px;background:var(--danger);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer;white-space:nowrap">Anleitung</button>
        <button onclick="this.parentElement.remove()" style="margin-left:auto;background:transparent;border:none;color:var(--tx2);font-size:16px;cursor:pointer">✕</button>`;
      document.body.appendChild(banner);
    }
  } catch {}
}

// ════════════════════════════════════════════════════════════
// features/feedback.js
// ════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// OmniSight – Beta-Feedback System
// In-App Feedback + Discord-Link
// ═══════════════════════════════════════════════════════════════════

const DISCORD_INVITE = 'https://discord.gg/D6BnznYztF';

function setupFeedback() {
  // Feedback-Button in Einstellungen verdrahten
  document.getElementById('btn-open-feedback')?.addEventListener('click', openFeedbackModal);
  document.getElementById('btn-open-discord')?.addEventListener('click', () => {
    window.electronAPI.openExternal(DISCORD_INVITE);
  });
}

function openFeedbackModal() {
  const existing = document.getElementById('feedback-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id    = 'feedback-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);width:min(500px,96%);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6)">
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--bor)">
        <span style="font-size:20px;margin-right:10px">💬</span>
        <span style="font-family:var(--font-d);font-size:16px;font-weight:800;color:var(--tx);flex:1">Beta-Feedback</span>
        <button onclick="document.getElementById('feedback-overlay').remove()" style="border:none;background:transparent;color:var(--tx2);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="font-size:12px;color:var(--tx2);font-weight:600;display:block;margin-bottom:5px">Kategorie</label>
          <select id="fb-category" style="width:100%;background:var(--bgc);border:1px solid var(--bor);color:var(--tx);border-radius:var(--r-sm);padding:8px 10px;outline:none">
            <option value="bug">🐛 Fehler/Bug</option>
            <option value="feature">💡 Verbesserungsvorschlag</option>
            <option value="ui">🎨 Design-Problem</option>
            <option value="performance">⚡ Performance</option>
            <option value="other">📝 Sonstiges</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--tx2);font-weight:600;display:block;margin-bottom:5px">Titel</label>
          <input id="fb-title" type="text" placeholder="Kurze Beschreibung…" maxlength="100"
            style="width:100%;background:var(--bgc);border:1px solid var(--bor);color:var(--tx);border-radius:var(--r-sm);padding:8px 10px;outline:none;box-sizing:border-box"/>
        </div>
        <div>
          <label style="font-size:12px;color:var(--tx2);font-weight:600;display:block;margin-bottom:5px">Details</label>
          <textarea id="fb-text" rows="5" placeholder="Was ist passiert? Was hast du erwartet? Schritte zum Reproduzieren…" maxlength="1000"
            style="width:100%;background:var(--bgc);border:1px solid var(--bor);color:var(--tx);border-radius:var(--r-sm);padding:8px 10px;outline:none;resize:vertical;box-sizing:border-box;font-family:inherit"></textarea>
        </div>
        <div>
          <label style="font-size:12px;color:var(--tx2);font-weight:600;display:block;margin-bottom:5px">Version</label>
          <input id="fb-version" type="text" value="v${window.__appVersion || '3.1.14'}" readonly
            style="width:100%;background:var(--bgch);border:1px solid var(--bor);color:var(--tx3);border-radius:var(--r-sm);padding:8px 10px;outline:none;box-sizing:border-box"/>
        </div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--bor);display:flex;gap:8px;justify-content:flex-end">
        <button onclick="document.getElementById('feedback-overlay').remove()" class="pick-btn">Abbrechen</button>
        <button id="fb-discord-btn" class="pick-btn" style="background:transparent;border-color:var(--bor)">
          <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0b5061df29d55a746d69_icon_clyde_white_RGB.png"
            style="width:14px;height:11px;margin-right:5px;opacity:.6" onerror="this.remove()"/>
          Discord öffnen
        </button>
        <button id="fb-submit-btn" style="padding:8px 18px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-family:var(--font-d);font-weight:700;cursor:pointer">
          Feedback senden
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('fb-discord-btn')?.addEventListener('click', () => {
    window.electronAPI.openExternal(DISCORD_INVITE);
  });

  document.getElementById('fb-submit-btn')?.addEventListener('click', () => {
    const category = document.getElementById('fb-category')?.value || 'other';
    const title    = document.getElementById('fb-title')?.value?.trim();
    const text     = document.getElementById('fb-text')?.value?.trim();
    const version  = window.__appVersion || '3.1.14';

    if (!title || !text) {
      showToastMsg('Bitte Titel und Details ausfüllen');
      return;
    }

    // Feedback als GitHub Issue öffnen (öffnet Browser)
    const body = encodeURIComponent(
      `**Kategorie:** ${category}\n` +
      `**Version:** ${version}\n` +
      `**Betriebssystem:** Windows\n\n` +
      `**Beschreibung:**\n${text}`
    );
    const titleEnc = encodeURIComponent(`[Beta] ${title}`);
    const issueUrl = `https://github.com/P3rc1v4l/OmniSight/issues/new?title=${titleEnc}&body=${body}&labels=beta-feedback`;

    window.electronAPI.openExternal(issueUrl);
    overlay.remove();
    showToastMsg('✓ GitHub-Issue-Formular geöffnet');
  });
}

// ════════════════════════════════════════════════════════════
// app.js
// ════════════════════════════════════════════════════════════

// [Error-Handler: in index.html];
window.addEventListener('unhandledrejection', e => {
  console.error('[OmniSight Promise]', e.reason);
});

// ════════ PROVIDERS ════════════════════════════════════════════════
// [PROVIDERS_BASE: in core/providers.js oder core/i18n.js definiert]
// [TMDB_PMAP: in core/providers.js oder core/i18n.js definiert]
let customProviders={};
// [PROVIDERS: in core/providers.js definiert]

// [getFavicon: in core/providers.js definiert]


// ════════ I18N ═════════════════════════════════════════════════════
// [I18N: in core/providers.js oder core/i18n.js definiert]
// ════════ ACHIEVEMENTS ═════════════════════════════════════════════
// [ACH_CATS + ACHIEVEMENTS: in core/achievements.js definiert]


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
const TMDB_BD='https://image.tmdb.org/t/p/w1280'; // TMDB_IMG aus search.js
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
  console.log('[OmniSight] init() gestartet');
  try {

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
  setupStreamControls();setupSettingsPanel();
  // Settings-spezifische Listener:
document.getElementById('btn-check-updates')?.addEventListener('click',async()=>{const el=document.getElementById('update-check-result');if(el){el.textContent='Prüfe…';el.style.color='var(--tx2)';}await window.electronAPI.checkForUpdates();});
  
  // ══ WATCHLIST EXPORT/IMPORT ════════════════════════════════════════
  document.getElementById('btn-view-watchlist-adv')?.addEventListener('click',()=>{showView('watchlist');buildWatchlistSorted();closeSettings();});
  // Export/Import Einstellungen
  document.getElementById('btn-export-settings')?.addEventListener('click',async()=>{const r=await window.electronAPI.exportSettings().catch(()=>({ok:false}));if(r.ok)showToastMsg('✓ Einstellungen exportiert');else if(r!==false)showToastMsg('Abgebrochen');});
  document.getElementById('btn-import-settings')?.addEventListener('click',async()=>{if(!confirm('Alle aktuellen Einstellungen werden überschrieben. Fortfahren?'))return;const r=await window.electronAPI.importSettings().catch(()=>({ok:false}));if(r.ok){showToastMsg('✓ Einstellungen importiert – App wird neu geladen');setTimeout(()=>location.reload(),1500);}else if(r.error)showToastMsg('Fehler: '+r.error);});
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
  document.getElementById('btn-show-onboarding')?.addEventListener('click',()=>{closeSettings();setTimeout(()=>showOnboarding(true),200);});
  document.getElementById('pick-bg-image')?.addEventListener('click',async()=>{const r=await window.electronAPI.pickImage('appBg');if(r){const url=r.base64||r.filePath||r;settings.appBgImage=url;applyBgImage(url);autoSave();}});
  document.getElementById('reset-bg-image')?.addEventListener('click',()=>{settings.appBgImage='';applyBgImage('');autoSave();});
  
  // ══ PLUGINS ════════════════════════════════════════════════════════setupSearch();
  setupPluginsTab();setupClockContextMenu();setupSidebarCrunchyroll();
  setupParticles();setupPip();setupCardEditor();setupCustomProviderModal();
  setupLayoutButtons();checkOnlineStatus();startSessionAutoRefresh();startAchievementWatcher();

  window.electronAPI.onFullscreenChange(v=>{isFullscreen=v;updateFullscreenUI();});
  window.electronAPI.onSessionsUpdated(r=>{
    sessionCache=r;
    // Nur Session-Dots aktualisieren wenn auf Home-View, kein komplettes Rebuild
    const homeActive=document.getElementById('view-home')?.classList.contains('active');
    if(homeActive){
      // Nur Dots sanft aktualisieren, kein grid.innerHTML='' 
      Object.entries(r).forEach(([id,isOn])=>{
        const card=document.querySelector(`.provider-card[data-id="${id}"]`);
        if(card){
          let dot=card.querySelector('.card-session-dot');
          if(isOn&&!dot){dot=document.createElement('div');dot.className='card-session-dot';card.appendChild(dot);}
          else if(!isOn&&dot)dot.remove();
        }
      });
    }
    const accountActive=document.querySelector('.sms-btn[data-stab="account"]')?.classList.contains('active');
    if(accountActive)buildSessionList(r);
  });
  window.electronAPI.onUpdateAvailable(info=>{
    showNotif('🚀 Update!',`v${info.version} verfügbar.`);
    // Update-Check Ergebnis
    const el=document.getElementById('update-check-result');
    if(el){el.textContent=`🚀 v${info.version} verfügbar – bereit zum Herunterladen`;el.style.color='var(--acc)';}
    // Download-Button einblenden
    const dlBtn=document.getElementById('btn-download-update');
    if(dlBtn){dlBtn.style.display='flex';dlBtn.textContent='⬇ Herunterladen';}
    // Update-Banner einblenden
    const banner=document.getElementById('update-banner');
    const bannerTxt=document.getElementById('update-text');
    if(banner){banner.style.display='flex';}
    if(bannerTxt){bannerTxt.textContent=`🚀 Update v${info.version} verfügbar`;}
  });
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
  setTimeout(checkWatchlistReleases, 4000);
  setTimeout(runHealthcheck, 800);
  setTimeout(checkCertExpiry, 5000);
  patchSearchEarlyTrigger();
  // Watchlist-Sort Listener
  document.getElementById('wl-sort')?.addEventListener('change',()=>{
    const cat=document.querySelector('.wl-cat-btn.active')?.dataset.cat||'all';
    buildWatchlistSorted(cat);
  });
  // Zusätzliche Setups
  if (typeof setupProfileEditor === 'function') setupProfileEditor();
  if (typeof setupFeedback === 'function') setupFeedback();
  setTimeout(() => {
    if (typeof checkWidevineBanner === 'function') checkWidevineBanner();
  }, 2000);
  } catch(e) {
    console.error('[OmniSight] FEHLER in init():', e.message, e.stack);
    const toast = document.getElementById('error-toast');
    if (toast) { toast.textContent = 'Init-Fehler: ' + e.message; toast.style.display = 'block'; }
  }
  console.log('[OmniSight] init() beendet');
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
      else if(v==='watchlist'){showView('watchlist');buildWatchlistSorted();}
      else if(v==='stats'){showView('stats');buildStatsView();}
      else if(v==='cr-calendar'){showView('cr-calendar');loadCrCalendarView();}
      else showView(v);
    });
  });
  // Favoriten Sub-Menü
  document.getElementById('nav-fav-toggle')?.addEventListener('click',()=>{document.getElementById('nav-fav-toggle').classList.toggle('open');document.getElementById('nav-sub-favorites')?.classList.toggle('open');});
  document.getElementById('fav-search')?.addEventListener('input',e=>document.getElementById('nav-sub-favorites-list')?.querySelectorAll('.nav-sub-btn').forEach(b=>{b.style.display=b.textContent.toLowerCase().includes(e.target.value.toLowerCase())?'flex':'none';}));
  // Watchlist Kategorie Links
  document.querySelectorAll('.wl-cat-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.wl-cat-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');buildWatchlistSorted(btn.dataset.cat);});});
  // News Switcher
  document.querySelectorAll('#news-type-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#news-type-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.news.mediaType=btn.dataset.media;settings.newsLastTab=btn.dataset.media;autoSave();loadSlideshow('news',btn.dataset.media,slideshows.news.tab);}));
  document.querySelectorAll('.news-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.news-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');slideshows.news.tab=tab.dataset.tab;loadSlideshow('news',slideshows.news.mediaType,tab.dataset.tab);}));
  // Upcoming Switcher
  document.querySelectorAll('#upcoming-type-switcher .media-type-text-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#upcoming-type-switcher .media-type-text-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.upcoming.mediaType=btn.dataset.media;settings.upcomingLastTab=btn.dataset.media;autoSave();loadSlideshow('upcoming',btn.dataset.media);}));
  document.querySelectorAll('.range-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');slideshows.upcoming.months=parseInt(btn.dataset.months);loadSlideshow('upcoming',slideshows.upcoming.mediaType);}));
  // Home Buttons
  document.getElementById('btn-add-provider-home')?.addEventListener('click',()=>document.getElementById('custom-provider-modal').style.display='flex');
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));
  // Profile-Switcher
  document.getElementById('btn-profile-switcher')?.addEventListener('click',openProfileManager);
  // Notification-Bell
  const _bell=document.getElementById('notif-bell-btn');
  const _nc=document.getElementById('notif-center');
  if(_bell&&_nc){
    _bell.addEventListener('click',e=>{e.stopPropagation();const open=_nc.style.display==='flex';_nc.style.display=open?'none':'flex';if(!open)renderNotifications();});
    document.addEventListener('click',e=>{if(_nc.style.display==='flex'&&!_nc.contains(e.target)&&!_bell.contains(e.target))_nc.style.display='none';});
  }
  document.getElementById('notif-center-close')?.addEventListener('click',()=>document.getElementById('notif-center').style.display='none');
  document.getElementById('notif-clear-all')?.addEventListener('click',()=>{notifications=[];renderNotifications();updateNotifBadge();window.electronAPI.setNotifications(activeProfileId,[]);});
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
  // Kategorie-Filter
  const activeCat=settings.activeCategory||'all';
  updateCategoryFilter(activeCat);
  grid.innerHTML='';
  const layout=settings.cardLayout||'normal';grid.className='providers-grid'+(layout!=='normal'?' '+layout:'');
  ['normal','compact','mini'].forEach(l=>document.getElementById('layout-'+l)?.classList.toggle('active',l===layout));
  updateSortBtn();
  const deleted=settings.deletedProviders||[];
  let entries=Object.entries(PROVIDERS()).filter(([id])=>!deleted.includes(id));
  // Kategorie-Filter anwenden
  if(activeCat!=='all'){
    if(activeCat==='custom')entries=entries.filter(([id])=>!!customProviders[id]);
    else if(settings.providerGroups&&settings.providerGroups[activeCat]){
      const grpProviders=settings.providerGroups[activeCat].providers||[];
      entries=entries.filter(([id])=>grpProviders.includes(id));
    }
    else entries=entries.filter(([id])=>getProviderCategory(id)===activeCat);
  }
  if(settings.sortByUsage){const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));entries=entries.sort((a,b)=>(stats[b[0]]?.total||0)-(stats[a[0]]?.total||0));}
  else if(settings.sortAlpha){entries=entries.sort((a,b)=>settings.sortDir==='desc'?b[1].name.localeCompare(a[1].name):a[1].name.localeCompare(b[1].name));}
  else{entries=entries.sort((a,b)=>a[1].name.localeCompare(b[1].name));if(providerOrder.length)entries=entries.sort((a,b)=>{const ai=providerOrder.indexOf(a[0]),bi=providerOrder.indexOf(b[0]);if(ai<0&&bi<0)return 0;if(ai<0)return 1;if(bi<0)return -1;return ai-bi;});}
  const favs=settings.favorites||[];
  const favOrder=settings.favoritesOrder||[];
  const favL=entries.filter(([id])=>favs.includes(id)).sort((a,b)=>{
    const ai=favOrder.indexOf(a[0]),bi=favOrder.indexOf(b[0]);
    if(ai<0&&bi<0)return favs.indexOf(a[0])-favs.indexOf(b[0]);
    if(ai<0)return 1;if(bi<0)return-1;return ai-bi;
  });
  const rest=entries.filter(([id])=>!favs.includes(id));
  if(favL.length){addGridLabel(grid,'⭐ Favoriten');favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true)));}
  if(rest.length){if(favL.length)addGridLabel(grid,'Alle Anbieter');rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false)));}
  if(!settings.sortAlpha&&!settings.sortByUsage)setupDragDrop(grid);
  buildSidebarSubMenus();
  setTimeout(buildRecentlyOpened,50);
  setTimeout(setupGroupDropZones,100);
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
  // "Neu!"-Badge wenn Anbieter heute Inhalt aus der Watchlist veröffentlicht
  const hasNewContent=!!(window._watchlistReleasesToday||[]).includes(id);
    card.innerHTML=`${p.quality&&!isMini?`<div class="card-quality-badge">${p.quality}</div>`:''}
    ${isLoggedIn?'<div class="card-session-dot" title="Eingeloggt"></div>':''}${hasNewContent?'<div class="card-new-badge">NEU</div>':''}
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
    [{l:`▶ ${esc(cName)} öffnen`,fn:()=>openProvider(id)},{l:'↗ In eigenem Fenster',fn:()=>openProviderNewWindow(id)},{l:'🏷 Kategorie ändern',fn:()=>{const cats=Object.entries(PROVIDER_CATEGORIES).filter(([k])=>k!=='all');const choice=prompt('Kategorie wählen:\n'+cats.map(([k,c],i)=>`${i+1}. ${c.icon} ${c.de}`).join('\n'));if(!choice)return;const idx=parseInt(choice)-1;if(idx>=0&&idx<cats.length){settings.providerCategories=settings.providerCategories||{};settings.providerCategories[cats[idx][0]]===cats[idx][0]?null:settings.providerCategories[id]=cats[idx][0];autoSave();buildProviderGrid();showToastMsg(`Kategorie: ${cats[idx][1].de}`);}}}].forEach(({l,fn})=>{const btn=document.createElement('button');btn.style.cssText='display:block;width:100%;padding:8px 14px;border:none;background:transparent;color:var(--tx);font-size:13px;cursor:pointer;text-align:left';btn.innerHTML=l;btn.onmouseenter=()=>btn.style.background='var(--bgch)';btn.onmouseleave=()=>btn.style.background='transparent';btn.addEventListener('click',()=>{menu.remove();fn();});menu.appendChild(btn);});
    document.body.appendChild(menu);setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),10);
  });
  return card;
}
function setupLayoutButtons(){['normal','compact','mini'].forEach(l=>document.getElementById('layout-'+l)?.addEventListener('click',()=>{settings.cardLayout=l;autoSave();buildProviderGrid();}));}
function toggleFavorite(id){const favs=settings.favorites||[];const idx=favs.indexOf(id);if(idx<0)favs.push(id);else favs.splice(idx,1);settings.favorites=favs;autoSave();buildProviderGrid();}
function setupDragDrop(grid){
  // Favoriten-Label als Drop-Zone: Karte droppen = zu Favoriten hinzufügen
  grid.querySelectorAll('.grid-section-label').forEach(label=>{
    if(!label.textContent.includes('Favoriten'))return;
    label.addEventListener('dragover',e=>{e.preventDefault();label.style.color='var(--acc)';});
    label.addEventListener('dragleave',()=>label.style.color='');
    label.addEventListener('drop',e=>{e.preventDefault();label.style.color='';
      const id=e.dataTransfer.getData('text/plain');
      if(id&&!(settings.favorites||[]).includes(id)){
        settings.favorites=settings.favorites||[];settings.favorites.push(id);autoSave();buildProviderGrid();
        showToastMsg('⭐ Zu Favoriten hinzugefügt');
      }
    });
  });
let drag=null;grid.querySelectorAll('.provider-card[draggable]').forEach(card=>{card.addEventListener('dragstart',e=>{
      if(settings.sortAlpha){
        const sortBtn=document.getElementById('btn-sort-alpha');
        if(sortBtn){sortBtn.style.outline='2px solid var(--acc)';setTimeout(()=>sortBtn.style.outline='',1200);}
        showToastMsg('A–Z deaktivieren um Karten zu verschieben');
        e.preventDefault();return;
      }
      drag=card;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',card.dataset.id||'');});card.addEventListener('dragend',()=>{card.classList.remove('dragging');grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>el.classList.remove('drag-indicator-left','drag-indicator-right'));});card.addEventListener('dragover',e=>{e.preventDefault();if(card===drag)return;grid.querySelectorAll('.drag-indicator-left,.drag-indicator-right').forEach(el=>el.classList.remove('drag-indicator-left','drag-indicator-right'));const r=card.getBoundingClientRect();card.classList.add(e.clientX<r.left+r.width/2?'drag-indicator-left':'drag-indicator-right');});card.addEventListener('dragleave',()=>card.classList.remove('drag-indicator-left','drag-indicator-right'));card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drag-indicator-left','drag-indicator-right');if(!drag||drag===card)return;const cards=[...grid.querySelectorAll('.provider-card')];const ids=cards.map(c=>c.dataset.id);const si=ids.indexOf(drag.dataset.id),di=ids.indexOf(card.dataset.id);if(si>-1&&di>-1){ids.splice(si,1);const r=card.getBoundingClientRect();ids.splice(e.clientX>=r.left+r.width/2?Math.min(di+1,ids.length):di,0,drag.dataset.id);}providerOrder=ids;settings.providerOrder=ids;autoSave();buildProviderGrid();});});}

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
  // Stream-Erinnerung: gleicher Anbieter wie zuletzt?
  const vh=settings.viewHistory||[];const lastSame=vh.find(h=>h.id===id);
  if(lastSame&&Date.now()-lastSame.time>3*24*3600000){ // > 3 Tage
    const daysSince=Math.floor((Date.now()-lastSame.time)/86400000);
    showToastMsg(`▶ Zuletzt vor ${daysSince} Tagen gestreamt – weitermachen?`,4000);
  }
  document.getElementById('btn-watching').style.display='flex';
  document.getElementById('btn-bg-play').style.display=p.bgAudio?'flex':'none';
  window.electronAPI.setupWebviewSession(partition||getProfilePartition(id));
  const wrap=document.getElementById('webview-wrap');if(wrap)wrap.innerHTML='';
  const wv=document.createElement('webview');
  wv.setAttribute('src',url);wv.setAttribute('partition',partition||getProfilePartition(id));if(p.multiTab||p.allowpopups)wv.setAttribute('allowpopups','');wv.setAttribute('useragent',UA);wv.setAttribute('enableblinkfeatures','EncryptedMedia,PictureInPicture');wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  if(p.multiTab){setupMultiTabWebview(id,wv,url,name||p.name);}
  else{document.getElementById('stream-tabs-bar').style.display='none';streamTabs=[];activeTabId=null;wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))wv.loadURL(e.url);});}
  currentWebview=wv;if(wrap)wrap.appendChild(wv);
  let loadTO=null;
  wv.addEventListener('did-start-loading',()=>{clearTimeout(loadTO);loadTO=setTimeout(()=>{showNotif('⚠ Lädt sehr lange…',name||p.name+' braucht länger als erwartet. Wird erneut versucht…');try{wv.reload();}catch{}},7000);});
  wv.addEventListener('dom-ready', () => {
  // WideVine: EME-Test und Setup
  try {
    wv.executeJavaScript(`
      if (typeof MediaKeys !== 'undefined') {
        navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
          initDataTypes: ['cenc'],
          videoCapabilities: [{contentType: 'video/mp4;codecs="avc1.42E01E"'}],
        }]).then(a => console.log('[WideVine] EME OK:', a.keySystem))
          .catch(e => console.log('[WideVine] EME:', e.message));
      }
    `).catch(() => {});
  } catch {}
});
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
function addStreamTab(pid,url,title){const p=PROVIDERS()[pid];if(!p)return;const id='tab_'+Date.now();const wv=document.createElement('webview');wv.setAttribute('src',url);wv.setAttribute('partition',getProfilePartition(pid));wv.setAttribute('allowpopups','');wv.setAttribute('useragent',UA);wv.setAttribute('enableblinkfeatures','EncryptedMedia,PictureInPicture');wv.style.cssText='width:100%;height:100%;border:none;display:flex';wv.addEventListener('new-window',e=>{if(e.url?.startsWith('http'))addStreamTab(pid,e.url,e.url);});wv.addEventListener('page-title-updated',e=>{const t=streamTabs.find(t=>t.id===id);if(t){t.title=e.title.substring(0,30);renderStreamTabs();}});streamTabs.push({id,title:title.substring(0,30),url,webview:wv,muted:false});switchTab(id);}
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

// [setupSearch: in ui/search.js definiert]


// [renderSearchHistory: in ui/search.js definiert]

window.clearAllSearchHistory=function(){searchHistory=[];settings.searchHistory=[];autoSave();const dd=document.getElementById('search-dropdown');if(dd)dd.style.display='none';};

function renderInstantSuggestions(q,dd){const ql=q.toLowerCase();const matches=Object.entries(PROVIDERS()).filter(([,p])=>p.name.toLowerCase().includes(ql));if(!matches.length)return;let html='<div class="search-dd-section">Anbieter</div>';matches.slice(0,4).forEach(([id,p])=>{html+=`<div class="search-dd-item" data-prov-open="${id}"><img class="search-dd-poster" src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/><div class="search-dd-info"><div class="search-dd-title">${esc((settings.cardCustomNames||{})[id]||p.name)}</div><div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span></div></div></div>`;});dd.innerHTML=html;dd.style.display='block';dd.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',()=>openProvider(el.dataset.provOpen)));}

const _tmdbSearchCache=new Map();
// [runTmdbSearch: in ui/search.js definiert]

async function loadSearchChips(tmdbId,type,cId){try{const prov=await window.electronAPI.getStreamingProviders({tmdbId,type});const cont=document.getElementById(cId);if(!cont)return;const all=[...(prov?.flatrate||[]),...(prov?.rent||[])].filter((p,i,a)=>a.findIndex(x=>x.provider_id===p.provider_id)===i&&p.logo_path).slice(0,4);if(all.length)cont.innerHTML=all.map(p=>{const oid=TMDB_PMAP[p.provider_id];return`<div class="search-dd-provider-chip"${oid?` data-prov-open="${oid}"`:''} style="cursor:${oid?'pointer':'default'}"><img src="https://image.tmdb.org/t/p/w45${p.logo_path}" style="width:12px;height:12px;object-fit:contain;border-radius:2px" onerror="this.style.display='none'"/>${esc(p.provider_name)}</div>`;}).join('');cont.querySelectorAll('[data-prov-open]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openProvider(el.dataset.provOpen);}));}catch{}}
// [addToSearchHistory: in ui/search.js definiert]


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
  // Top-Kacheln
  const adCount=parseInt(localStorage.getItem('adBlock_'+activeProfileId)||'0');
  const kachelDiv=document.createElement('div');
  kachelDiv.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px';
  kachelDiv.innerHTML=`<div style="background:var(--accg);border:1px solid var(--acc);border-radius:var(--r);padding:14px;text-align:center"><div style="font-family:var(--font-d);font-size:26px;font-weight:800;color:var(--acc)">${adCount.toLocaleString()}</div><div style="font-size:11px;color:var(--tx2);margin-top:3px">🛡 Werbungen geblockt</div></div><div style="background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:14px;text-align:center"><div style="font-family:var(--font-d);font-size:26px;font-weight:800;color:var(--tx)">${(settings.viewHistory||[]).length}</div><div style="font-size:11px;color:var(--tx2);margin-top:3px">▶ Anbieter gestreamt</div></div><div style="background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:14px;text-align:center"><div style="font-family:var(--font-d);font-size:26px;font-weight:800;color:var(--tx)">${watchlist.length}</div><div style="font-size:11px;color:var(--tx2);margin-top:3px">📌 Watchlist</div></div>`;
  content.appendChild(kachelDiv);
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
// [startAchievementWatcher: in core/achievements.js definiert]

// [checkAchievements: in core/achievements.js definiert]

function trackMeta(key){try{const k='achMeta_'+activeProfileId;const meta=JSON.parse(localStorage.getItem(k)||'{}');meta[key]=(meta[key]||0)+1;if(key==='stream'&&new Date().getHours()<4)meta.midnightStreams=(meta.midnightStreams||0)+1;localStorage.setItem(k,JSON.stringify(meta));}catch{}}

// ════════ UHR ══════════════════════════════════════════════════════
function setupClock(){
  clearInterval(_clockInt);const widget=document.getElementById('clock-widget'),timeEl=document.getElementById('clock-time');if(!widget||!timeEl)return;
  const clk=settings.clock||{};
  if(!clk.enabled){widget.style.display='none';return;}
  const pos=clk.position||{x:16,y:52};widget.style.display='block';widget.style.left=pos.x+'px';widget.style.top=pos.y+'px';widget.style.right='auto';widget.style.bottom='auto';widget.style.color=clk.color||'#ff3b30';widget.style.fontSize=(clk.size||22)+'px';widget.style.opacity=String(1-(clk.opacity??0.5));
  const showSecs=!!clk.showSeconds;
  if(clk.type==='analog'){function drawA(){const n=new Date(),h=n.getHours()%12,m=n.getMinutes(),s=n.getSeconds();const sz=Math.max(clk.size||22,18),r=sz*1.8;const ha=((h+m/60)/12)*Math.PI*2-Math.PI/2,ma=(m/60)*Math.PI*2-Math.PI/2,sa=(s/60)*Math.PI*2-Math.PI/2;const c=clk.color||'#ff3b30';timeEl.innerHTML=`<svg width="${r*2}" height="${r*2}" viewBox="0 0 ${r*2} ${r*2}" style="display:block"><circle cx="${r}" cy="${r}" r="${r-2}" fill="none" stroke="${c}" stroke-width="1.5" opacity=".4"/><line x1="${r}" y1="${r}" x2="${r+Math.cos(ha)*r*.55}" y2="${r+Math.sin(ha)*r*.55}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><line x1="${r}" y1="${r}" x2="${r+Math.cos(ma)*r*.8}" y2="${r+Math.sin(ma)*r*.8}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>${showSecs?`<line x1="${r}" y1="${r}" x2="${r+Math.cos(sa)*r*.85}" y2="${r+Math.sin(sa)*r*.85}" stroke="${c}" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`:''}''<circle cx="${r}" cy="${r}" r="2" fill="${c}"/></svg>`;} drawA();_clockInt=setInterval(drawA,showSecs?1000:10000);}
  else{
    function tick(){
      const n=new Date();
      const h=String(n.getHours()).padStart(2,'0');
      const min=String(n.getMinutes()).padStart(2,'0');
      const s=String(n.getSeconds()).padStart(2,'0');
      timeEl.textContent=showSecs?h+':'+min+':'+s:h+':'+min;
    }
    tick();_clockInt=setInterval(tick,1000);
  }
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
  document.getElementById('settings-overlay')?.addEventListener('click',e=>{if(e.target.id==='settings-overlay')closeSettings();});
  document.getElementById('btn-add-profile')?.addEventListener('click',()=>{document.getElementById('profile-modal').style.display='flex';document.getElementById('new-profile-name').focus();});
  // Profile Modal
  document.getElementById('btn-create-profile')?.addEventListener('click',()=>{const name=document.getElementById('new-profile-name').value.trim();if(!name)return;const id='profile_'+Date.now();profiles.push({id,name,favorites:[],watchlist:[],searchHistory:[],viewHistory:[]});window.electronAPI.setProfiles(profiles);document.getElementById('profile-modal').style.display='none';buildSidebarProfile();switchProfile(id,true);/* Punkt 1: sofort auswählen */});
  document.getElementById('btn-cancel-profile')?.addEventListener('click',()=>document.getElementById('profile-modal').style.display='none');
  // Tabs
  document.querySelectorAll('.sms-btn[data-stab]').forEach(tab=>{tab.addEventListener('click',()=>{document.querySelectorAll('.sms-btn').forEach(t=>t.classList.remove('active'));document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));tab.classList.add('active');document.getElementById('smt-'+tab.dataset.stab)?.classList.add('active');if(tab.dataset.stab==='account')buildSessionList(sessionCache||{});if(tab.dataset.stab==='advanced')buildAdvancedTab();// Uhr-Drag nur im clock-Tab
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
  // Partikel-Shape-Handler in fixes.js
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

function openSettings(){
  document.getElementById('settings-overlay').style.display='flex';
  // Immer zuerst Übersicht zeigen
  document.querySelectorAll('.sms-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));
  // Einstellungs-Übersicht Tab
  const overviewTab=document.querySelector('.sms-btn[data-stab="overview"]');
  const overviewContent=document.getElementById('smt-overview');
  if(overviewTab){overviewTab.classList.add('active');}
  if(overviewContent){overviewContent.classList.add('active');}
  else{
    // Fallback: Design-Tab
    document.querySelector('.sms-btn[data-stab="appearance"]')?.classList.add('active');
    document.getElementById('smt-appearance')?.classList.add('active');
  }
  syncSettingsUI();buildAdvancedTab();trackMeta('settingsOpens');
}
function closeSettings(){enableClockDrag(false);document.getElementById('settings-overlay').style.display='none';window.electronAPI.setSettings(settings);showSaveToast();}

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
    const reminderStr=item.reminderDate?`🔔 ${new Date(item.reminderDate).toLocaleDateString('de-DE',{day:'2-digit',month:'short'})}`:'';
    card.innerHTML=`${poster}<div class="wl-card-body"><div class="wl-card-title">${item.title||''}</div>${dateStr?`<div class="wl-card-date">📅 ${dateStr}</div>`:''}${reminderStr?`<div class="wl-card-date" style="color:var(--acc)">${reminderStr}</div>`:''}</div><button class="wl-card-remove">✕</button>`;
    card.querySelector('.wl-card-remove').addEventListener('click',e=>{e.stopPropagation();watchlist=watchlist.filter(w=>w.id!==item.id);settings.watchlist=watchlist;autoSave();card.style.transition='all .25s';card.style.opacity='0';card.style.transform='scale(.9)';setTimeout(()=>buildWatchlistSorted(catArg),260);});
    card.addEventListener('contextmenu',e=>{e.preventDefault();document.querySelectorAll('.wl-ctx-menu').forEach(m=>m.remove());const menu=document.createElement('div');menu.className='wl-ctx-menu';menu.style.cssText=`position:fixed;left:${Math.min(e.clientX,window.innerWidth-180)}px;top:${Math.min(e.clientY,window.innerHeight-120)}px;background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r-sm);z-index:3000;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.5);padding:4px 0`;[{v:'movie',l:'🎬 Film'},{v:'tv',l:'📺 Serie'},{v:'anime',l:'⛩️ Anime'}].forEach(c=>{const btn=document.createElement('button');btn.style.cssText='display:block;width:100%;padding:8px 14px;border:none;background:transparent;color:var(--tx);font-size:13px;cursor:pointer;text-align:left';btn.textContent=(c.v===item.mediaType?'✓ ':'')+c.l;btn.onmouseenter=()=>btn.style.background='var(--bgch)';btn.onmouseleave=()=>btn.style.background='transparent';btn.addEventListener('click',()=>{const idx=watchlist.findIndex(w=>w.id===item.id);if(idx>-1){watchlist[idx].mediaType=c.v;settings.watchlist=watchlist;autoSave();}menu.remove();buildWatchlistSorted(catArg);});menu.appendChild(btn);});document.body.appendChild(menu);setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),10);});
    card.addEventListener('click',async()=>{await showDetailPopup(item.tmdbId,item.tmdbType||'movie',item.title);const check=setInterval(()=>{if(document.getElementById('detail-overlay').style.display==='none'){clearInterval(check);if(!watchlist.find(w=>w.id===item.id))buildWatchlistSorted(catArg);}},300);});
    grid.appendChild(card);
  });
  content.appendChild(grid);
}

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
let obStep=1;const OB_TOTAL=7;

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
/* [rebuildPluginDomains: Duplikat entfernt] */

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
/* [setupOnboarding: Duplikat entfernt] */
function applyOnboardingSettings(){
  // Profilname aus Onboarding übernehmen
  const nameInput=document.getElementById('ob-profile-name');const name=(nameInput?.value||'').trim()||'User';
  const p=profiles.find(pr=>pr.id===activeProfileId);
  if(p){p.name=name;if(window._obAvatar!==undefined&&window._obAvatar!==null)p.avatar=window._obAvatar;window.electronAPI.setProfiles(profiles);}
  // Anbieter-Selektion aus Onboarding anwenden
  const checkedProviders=document.querySelectorAll('.ob-prov-check:checked');
  if(checkedProviders.length>0){
    const selected=new Set([...checkedProviders].map(c=>c.dataset.id));
    // Nicht ausgewählte Anbieter ausblenden (deletedProviders)
    const allIds=Object.keys(PROVIDERS_BASE);
    const toDelete=allIds.filter(id=>!selected.has(id)&&!customProviders[id]);
    if(toDelete.length<allIds.length-1){ // mindestens 1 behalten
      settings.deletedProviders=toDelete;
    }
  }
  autoSave();buildSidebarProfile();buildCategoryFilterBar();buildProviderGrid();
}
/* [showOnboarding: Duplikat entfernt] */
/* [closeOnboarding: Duplikat entfernt] */


// ══ SHORTCUTS MODAL ════════════════════════════════════════════════
/* [setupShortcutsModal: Duplikat entfernt] */


// ══ EINSTELLUNGS-SUCHE ═════════════════════════════════════════════
function setupSettingsSearch(){
  const input=document.getElementById('settings-search-input');if(!input)return;
  const allCards=()=>document.querySelectorAll('.smt-card,.smt-content h2');
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    if(!q){
      // Reset: alles zeigen
      document.querySelectorAll('.smt-card').forEach(c=>c.style.display='');
      document.querySelectorAll('.smt-content').forEach(c=>c.style.display='');
      document.querySelectorAll('.smt-content.active').forEach(c=>c.style.display='flex');
      return;
    }
    // Alle Tabs sichtbar machen
    document.querySelectorAll('.smt-content').forEach(c=>c.style.display='flex');
    document.querySelectorAll('.smt-card').forEach(card=>{
      const text=(card.textContent||'').toLowerCase();
      card.style.display=text.includes(q)?'':'none';
    });
  });
}


// ══ WATCHLIST RELEASE CHECK ════════════════════════════════════════
async function checkWatchlistReleases(){
  // Erinnerungs-Datum prüfen
  const today=new Date().toISOString().split('T')[0];
  watchlist.forEach(item=>{
    if(item.reminderDate===today){
      if(settings.notificationsConfig?.watchlist!==false){
        addNotification('🔔','Watchlist-Erinnerung',`Heute: ${item.title}`);
        window.electronAPI.showNotification('🔔 Watchlist-Erinnerung','Heute: '+item.title);
      }
    }
  });
  if(!watchlist.length)return;
  const ids=watchlist.map(i=>({tmdbId:i.tmdbId,tmdbType:i.tmdbType||'movie',title:i.title})).filter(i=>i.tmdbId);
  try{
    const releases=await window.electronAPI.getWatchlistReleases(ids).catch(()=>[]);
    releases.forEach(r=>{
      if(settings.notificationsConfig?.watchlist!==false){
        window.electronAPI.showNotification('🎬 Heute verfügbar!',r.title+' ist heute erschienen!');
        addNotification('🎬','Heute verfügbar!',r.title+' ist jetzt erschienen!');
      }
    });
  }catch{}
}

// ══ QUICK-LAUNCHER (Taste N) ═══════════════════════════════════════
function setupQuickLauncher(){
  let qlMode=false;let qlTimer=null;
  const ql=document.createElement('div');ql.id='quick-launcher';
  ql.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:20px 28px;z-index:8500;display:none;min-width:340px;box-shadow:0 24px 60px rgba(0,0,0,.7)';
  ql.innerHTML=`<div style="font-family:var(--font-d);font-size:13px;font-weight:700;color:var(--tx2);margin-bottom:12px;text-align:center">⚡ Quick-Start – Buchstabe tippen</div><div id="ql-results" style="display:flex;flex-direction:column;gap:4px;max-height:280px;overflow-y:auto"></div>`;
  document.body.appendChild(ql);

  document.addEventListener('keydown',e=>{
    // N öffnet Quick-Launcher (außer in Input-Feldern)
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const settings_open=document.getElementById('settings-overlay')?.style.display==='flex';
    const onboarding_open=document.getElementById('onboarding-overlay')?.style.display==='flex';
    if(settings_open||onboarding_open)return;

    if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!qlMode){
      qlMode=true;ql.style.display='block';renderQuickLauncher('');
      clearTimeout(qlTimer);qlTimer=setTimeout(()=>closeQL(),5000);
      e.preventDefault();return;
    }
    if(!qlMode)return;
    if(e.key==='Escape'){closeQL();return;}
    if(e.key==='Backspace'){closeQL();return;}
    if(e.key.length===1){
      renderQuickLauncher(e.key.toLowerCase());
      clearTimeout(qlTimer);qlTimer=setTimeout(()=>closeQL(),3000);
    }
  });
  document.addEventListener('click',e=>{if(qlMode&&!ql.contains(e.target))closeQL();});

  function closeQL(){qlMode=false;ql.style.display='none';clearTimeout(qlTimer);}
  function renderQuickLauncher(char){
    const results=document.getElementById('ql-results');if(!results)return;
    const entries=Object.entries(PROVIDERS()).filter(([id])=>!(settings.deletedProviders||[]).includes(id));
    // Fuzzy-Suche: matched wenn Eingabe irgendwo im Namen vorkommt
    function fuzzyMatch(str,q){if(!q)return true;const s=str.toLowerCase();const pattern=q.split('').join('.*');try{return new RegExp(pattern).test(s);}catch{return s.includes(q);}}
    const filtered=char?entries.filter(([id,p])=>{const name=((settings.cardCustomNames||{})[id]||p.name).toLowerCase();return name.startsWith(char)||name.includes(char)||fuzzyMatch(name,char)||id.startsWith(char);}).sort((a,b)=>{const na=((settings.cardCustomNames||{})[a[0]]||a[1].name).toLowerCase();const nb=((settings.cardCustomNames||{})[b[0]]||b[1].name).toLowerCase();return(na.startsWith(char)?-1:0)-(nb.startsWith(char)?-1:0);}):entries.slice(0,8);
    results.innerHTML='';
    if(!filtered.length){results.innerHTML='<div style="color:var(--tx3);font-size:12px;text-align:center;padding:12px">Kein Anbieter gefunden</div>';return;}
    filtered.slice(0,6).forEach(([id,p],i)=>{
      const item=document.createElement('button');
      item.style.cssText='display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);cursor:pointer;color:var(--tx);width:100%;transition:all .14s;text-align:left';
      item.innerHTML=`<img src="${getFavicon(id,p)}" style="width:20px;height:20px;border-radius:4px;object-fit:contain;background:${p.color}22;padding:2px" onerror="this.style.display='none'"/><span style="flex:1;font-weight:600;font-size:13px">${esc((settings.cardCustomNames||{})[id]||p.name)}</span><kbd style="font-size:9px;background:var(--bgch);border:1px solid var(--bor);border-radius:3px;padding:1px 5px;color:var(--tx2)">${i+1}</kbd>`;
      item.onmouseenter=()=>item.style.borderColor='var(--acc)';
      item.onmouseleave=()=>item.style.borderColor='var(--bor)';
      item.addEventListener('click',()=>{closeQL();openProvider(id);});
      // Zahl-Taste drücken
      const keyHandler=e2=>{if(e2.key===String(i+1)){document.removeEventListener('keydown',keyHandler);closeQL();openProvider(id);}};
      document.addEventListener('keydown',keyHandler);
      setTimeout(()=>document.removeEventListener('keydown',keyHandler),3000);
      results.appendChild(item);
    });
  }
}


// ══ STATISTIKEN TEILEN ═════════════════════════════════════════════
async function shareStats(){
  // Electron: Screenshot des Stat-Bereichs
  try{
    const {nativeImage}=require('electron');
    // Wir nutzen window.electronAPI für einen IPC-Screenshot
    showToastMsg('📸 Screenshot wird erstellt…');
    // Fallback: HTML-Canvas Screenshot über html2canvas wenn verfügbar
    const statsEl=document.getElementById('stats-content');
    if(!statsEl)return;
    // Einfacher Fallback: JSON-Export der Statistik-Daten
    const stats=await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));
    const entries=Object.entries(stats).map(([id,v])=>({provider:(settings.cardCustomNames||{})[id]||PROVIDERS()[id]?.name||id,hours:((v?.total||0)/3600).toFixed(1)})).filter(e=>parseFloat(e.hours)>0).sort((a,b)=>b.hours-a.hours);
    const totalH=(Object.values(stats).reduce((a,v)=>a+(v?.total||0),0)/3600).toFixed(1);
    const text=`📊 Meine OmniSight-Statistiken:\n\nGesamt: ${totalH}h\n\n${entries.slice(0,5).map(e=>`${e.provider}: ${e.hours}h`).join('\n')}\n\nErstellt mit OmniSight`;
    // In Zwischenablage kopieren
    await navigator.clipboard.writeText(text);
    showToastMsg('✓ Statistiken in Zwischenablage kopiert');
  }catch(e){showToastMsg('Fehler: '+e.message);}
}


// ══ ZERTIFIKAT-ABLAUF-CHECK ════════════════════════════════════════
function checkCertExpiry(){
  try{
    // certExpiry wird von electron-builder als extraMetadata in package.json eingebettet
    const expiry=window.__omnisightMeta?.certExpiry;
    if(!expiry)return;
    const expDate=new Date(expiry);const now=new Date();
    const daysLeft=Math.ceil((expDate-now)/(1000*60*60*24));
    if(daysLeft<=0){
      addNotification('🔒','Zertifikat abgelaufen!','Das Code-Signing-Zertifikat ist abgelaufen. scripts/create-cert.ps1 erneut ausführen und neue Secrets in GitHub hinterlegen.');
    }else if(daysLeft<=30){
      addNotification('⚠️','Zertifikat läuft bald ab',`Noch ${daysLeft} Tage bis das Code-Signing-Zertifikat abläuft. Rechtzeitig erneuern!`);
    }
  }catch{}
}


// Healthcheck nach init()
function runHealthcheck(){
  const required = ['buildProviderGrid','setupNavigation','openProvider','showView'];
  const missing = required.filter(fn => typeof window[fn] !== 'function' && typeof eval(fn) !== 'function');
  if(missing.length){
    showToastMsg('⚠ Initialisierungsfehler: ' + missing.join(', '), 5000);
    console.error('[Healthcheck] Fehlende Funktionen:', missing);
  }
  // Prüfe ob Provider-Grid leer ist obwohl Anbieter vorhanden
  setTimeout(()=>{
    const grid = document.getElementById('providers-grid');
    if(grid && !grid.children.length && Object.keys(PROVIDERS()).length > 0){
      console.warn('[Healthcheck] Grid leer – rebuilde…');
      buildProviderGrid();
    }
  }, 1500);
}

// ══ CRASH-LOG MELDUNG ══════════════════════════════════════════════
function setupCrashLogNotification(){
  window.electronAPI.onCrashLogFound?.(data=>{
    // Toast mit Option zum Melden
    const toast=document.createElement('div');
    toast.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--bg2);border:1px solid var(--danger);border-radius:var(--r);padding:14px 20px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;align-items:center;gap:12px;max-width:420px;animation:slideInRight .3s ease';
    toast.innerHTML=`<div style="font-size:20px">⚠️</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--tx)">Letzter Absturz erkannt</div><div style="font-size:11px;color:var(--tx2);margin-top:2px">OmniSight ist beim letzten Start abgestürzt.</div></div><div style="display:flex;gap:6px;flex-shrink:0"><button id="crash-view-btn" style="padding:5px 10px;border:1px solid var(--bor);background:var(--bgc);color:var(--tx2);border-radius:var(--r-sm);cursor:pointer;font-size:11px">Details</button><button id="crash-clear-btn" style="padding:5px 10px;background:transparent;border:none;color:var(--tx3);cursor:pointer;font-size:11px">✕</button></div>`;
    document.body.appendChild(toast);
    toast.querySelector('#crash-view-btn').addEventListener('click',()=>{
      alert('Crash-Details:\n\n'+data.preview+'\n\nLog-Datei: %AppData%/OmniSight/logs/crash.log');
    });
    toast.querySelector('#crash-clear-btn').addEventListener('click',()=>{
      window.electronAPI.clearCrashLog?.();toast.remove();
    });
    setTimeout(()=>{if(document.body.contains(toast)){toast.style.animation='slideInRight .3s ease reverse';setTimeout(()=>toast.remove(),300);}},12000);
  });
}


// ══ KEYBOARD-NAVIGATION PROVIDER-GRID ════════════════════════════
function setupGridKeyboardNav(){
  let focusIdx=-1;
  function getCards(){return [...document.querySelectorAll('.provider-card')];}
  document.addEventListener('keydown',e=>{
    // Nur im Home-View und wenn kein Input fokussiert
    if(!document.getElementById('view-home')?.classList.contains('active'))return;
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(document.getElementById('settings-overlay')?.style.display==='flex')return;
    if(document.getElementById('quick-launcher')?.style.display==='block')return;
    const cards=getCards();if(!cards.length)return;
    const cols=Math.round(document.getElementById('providers-grid')?.offsetWidth/(260+14))||4;
    if(e.key==='ArrowRight'){e.preventDefault();focusIdx=Math.min(focusIdx+1,cards.length-1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();focusIdx=Math.max(focusIdx-1,0);}
    else if(e.key==='ArrowDown'){e.preventDefault();focusIdx=Math.min(focusIdx+cols,cards.length-1);}
    else if(e.key==='ArrowUp'){e.preventDefault();focusIdx=Math.max(focusIdx-cols,0);}
    else if(e.key==='Enter'&&focusIdx>=0){e.preventDefault();const id=cards[focusIdx]?.dataset.id;if(id)openProvider(id);return;}
    else if((e.key==='f'||e.key==='F')&&focusIdx>=0){e.preventDefault();const id=cards[focusIdx]?.dataset.id;if(id){toggleFavorite(id);showToastMsg((settings.favorites||[]).includes(id)?'⭐ Favorit entfernt':'⭐ Favorit hinzugefügt');}return;}
    else return;
    if(focusIdx<0)focusIdx=0;
    cards.forEach((c,i)=>{c.classList.toggle('keyboard-focus',i===focusIdx);});
    cards[focusIdx]?.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  // Fokus bei Hover mitführen
  document.getElementById('providers-grid')?.addEventListener('mouseover',e=>{
    const card=e.target.closest('.provider-card');if(!card)return;
    const cards=getCards();focusIdx=cards.indexOf(card);
  });
}

// ══ TITLEBAR ═══════════════════════════════════════════════════════
/* [setupTitlebar: Duplikat entfernt] */

// ══ START ══════════════════════════════════════════════════════════
// Init: readyState prüfen (Script kann nach DOMContentLoaded geladen werden)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init());
} else {
  // DOM bereits bereit (Script am Ende des HTML)
  init();
}

// ══ FEHLENDE HANDLER ══════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
// fixes.js
// ════════════════════════════════════════════════════════════

// OmniSight – fixes.js
// Enthält nur aktive, nicht-redundante Patches
// Alte v3.1.x Patches wurden in die Modul-Dateien überführt

// ════════════════════════════════════════════════════════════════════
// TEIL 1: GRUNDLEGENDE FEHLENDE FUNKTIONEN (müssen früh definiert sein)
// ════════════════════════════════════════════════════════════════════

function getProviderCategory(id) {
  if (typeof settings !== 'undefined' && settings.providerCategories?.[id])
    return settings.providerCategories[id];
  return PROVIDER_CAT_MAP[id] || 'video';
}

function updateCategoryFilter(active) {
  document.querySelectorAll('.cat-filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === active));
}

// ════════════════════════════════════════════════════════════════════
// TEIL 2: SUCHE – sauber, ohne Selbstrekursion
// ════════════════════════════════════════════════════════════════════

function setupSearch() {
  const input    = document.getElementById('search-input');
  const dd       = document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('search-clear');
  if (!input || !dd) return;

  input.placeholder = (typeof t === 'function' ? t('searchPlaceholder') : null)
    || 'Anbieter, Film, Serie, YouTube-URL…';

  let _timer = null;
  let _abort = null;

  function closeSearch() { dd.style.display = 'none'; }

  function doSearch(q) {
    if (!q || !q.trim()) {
      if (typeof searchHistory !== 'undefined' && searchHistory.length)
        renderSearchHistory(dd);
      else closeSearch();
      return;
    }
    if (_abort) { try { _abort.abort(); } catch {} }
    _abort = new AbortController();
    clearTimeout(_timer);
    _timer = setTimeout(() => runTmdbSearch(q.trim(), 1, _abort.signal), 280);
  }

  // Sauber: Input neu klonen
  const fresh = input.cloneNode(true);
  input.parentNode.replaceChild(fresh, input);

  if (clearBtn) clearBtn.style.display = 'none';

  fresh.addEventListener('input', () => {
    const q = fresh.value;
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
    doSearch(q);
  });
  fresh.addEventListener('focus', () => {
    const q = fresh.value.trim();
    if (q) doSearch(q);
    else if (typeof searchHistory !== 'undefined' && searchHistory.length)
      renderSearchHistory(dd);
  });
  fresh.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); fresh.blur(); }
    if (e.key === 'Enter' && fresh.value.trim())
      if (typeof addToSearchHistory === 'function') addToSearchHistory(fresh.value.trim());
  });

  if (clearBtn) {
    const newClear = clearBtn.cloneNode(true);
    clearBtn.parentNode.replaceChild(newClear, clearBtn);
    newClear.addEventListener('click', () => {
      fresh.value = '';
      newClear.style.display = 'none';
      dd.innerHTML = '';
      closeSearch();
      if (_abort) try { _abort.abort(); } catch {}
      clearTimeout(_timer);
      fresh.focus();
    });
  }

  // Außen-Klick schließt – capture phase
  document.addEventListener('mousedown', e => {
    const wrap = fresh.closest('.search-bar') ||
                 fresh.closest('.home-actions') ||
                 fresh.parentElement;
    if (wrap && !wrap.contains(e.target) && !dd.contains(e.target))
      closeSearch();
  }, true);

  document.querySelectorAll('[data-view]').forEach(btn =>
    btn.addEventListener('click', closeSearch));
}

// ════════════════════════════════════════════════════════════════════
// TEIL 3: PROFIL-EDITOR – vollständig implementiert
// ════════════════════════════════════════════════════════════════════

function setupProfileEditor() {
  const overlay = document.getElementById('profile-editor-overlay');
  if (!overlay || overlay._setupDone) return;
  overlay._setupDone = true;

  // Außen-Klick schließt
  overlay.addEventListener('mousedown', e => {
    if (e.target === overlay) overlay.style.display = 'none';
  });

  // SPEICHERN
  document.getElementById('ped-save')?.addEventListener('click', async () => {
    const pedId = window._pedId;
    const name  = (document.getElementById('ped-name')?.value || '').trim() || 'User';
    let pinSave = undefined;

    if (window._pedPin !== undefined) {
      if (!window._pedPin) {
        pinSave = null;
      } else if (/^\d{4,8}$/.test(String(window._pedPin))) {
        try { pinSave = await window.electronAPI.hashPin(String(window._pedPin)); }
        catch  { pinSave = window._pedPin; }
      } else {
        pinSave = window._pedPin;
      }
    }

    if (pedId) {
      const idx = profiles.findIndex(p => p.id === pedId);
      if (idx >= 0) {
        profiles[idx].name = name;
        if (window._pedAvatar !== undefined) profiles[idx].avatar = window._pedAvatar;
        if (pinSave !== undefined) profiles[idx].pin = pinSave;
      }
    } else {
      profiles.push({
        id: 'profile_' + Date.now(), name,
        avatar: window._pedAvatar || null,
        pin: pinSave || null,
        favorites: [], watchlist: [], searchHistory: [], viewHistory: [],
      });
    }

    window.electronAPI.setProfiles(profiles);
    overlay.style.display = 'none';
    buildSidebarProfile();
    showSaveToast();
    window._pedId = null; window._pedPin = undefined; window._pedAvatar = undefined;
  });

  // ABBRECHEN
  document.getElementById('ped-cancel')?.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // LÖSCHEN
  document.getElementById('ped-delete')?.addEventListener('click', async () => {
    const pedId = window._pedId;
    if (!pedId || profiles.length <= 1) {
      showToastMsg('Mindestens 1 Profil erforderlich'); return;
    }
    const profile = profiles.find(p => p.id === pedId);
    if (!profile) return;

    if (profile.pin) {
      const entered = prompt('PIN für "' + profile.name + '" eingeben:');
      if (entered === null) return;
      let valid = false;
      try { valid = await window.electronAPI.verifyPin(String(entered), profile.pin); }
      catch { valid = String(entered) === String(profile.pin); }
      if (!valid) { showToastMsg('Falscher PIN'); return; }
    }

    if (!confirm('Profil "' + profile.name + '" wirklich löschen?')) return;

    profiles = profiles.filter(p => p.id !== pedId);
    window.electronAPI.setProfiles(profiles);
    overlay.style.display = 'none';
    window._pedId = null;

    if (activeProfileId === pedId) switchProfile(profiles[0].id);
    else buildSidebarProfile();
    showToastMsg('Profil gelöscht');
  });

  // AVATAR
  document.getElementById('ped-pick-avatar')?.addEventListener('click', async () => {
    const r = await window.electronAPI.pickImage('avatar').catch(() => null);
    if (!r) return;
    const url = r.base64 || r.filePath || r;
    window._pedAvatar = url;
    const prev = document.getElementById('ped-avatar-preview');
    if (prev) prev.innerHTML = '<img src="' + url + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>';
  });

  // PIN
  document.getElementById('ped-set-pin')?.addEventListener('click', async () => {
    const pedId   = window._pedId;
    const profile = pedId ? profiles.find(p => p.id === pedId) : null;

    if (profile?.pin) {
      const old = prompt('Aktuellen PIN eingeben:');
      if (old === null) return;
      let valid = false;
      try { valid = await window.electronAPI.verifyPin(String(old), profile.pin); }
      catch { valid = String(old) === String(profile.pin); }
      if (!valid) { showToastMsg('Falscher PIN'); return; }
    }

    const newPin = prompt('Neuen PIN eingeben (4-8 Ziffern, leer = entfernen):');
    if (newPin === null) return;
    if (newPin === '') {
      window._pedPin = '';
      const ps = document.getElementById('ped-pin-status');
      if (ps) ps.textContent = '🔓 PIN wird entfernt';
      showToastMsg('PIN wird beim Speichern entfernt');
      return;
    }
    if (!/^\d{4,8}$/.test(newPin)) { showToastMsg('PIN: 4-8 Ziffern'); return; }
    window._pedPin = newPin;
    const ps = document.getElementById('ped-pin-status');
    if (ps) ps.textContent = '🔒 Neuer PIN (noch nicht gespeichert)';
    showToastMsg('PIN gesetzt – Speichern nicht vergessen!');
  });

  // Neues Profil
  document.getElementById('btn-new-profile')?.addEventListener('click', () =>
    openProfileEditor(null));
}

function openProfileEditor(id) {
  const p = id ? profiles.find(pr => pr.id === id) : null;
  window._pedId     = id || null;
  window._pedAvatar = undefined;
  window._pedPin    = undefined;

  const titleEl = document.getElementById('ped-title');
  const nameEl  = document.getElementById('ped-name');
  const prevEl  = document.getElementById('ped-avatar-preview');
  const pinEl   = document.getElementById('ped-pin-status');
  const delBtn  = document.getElementById('ped-delete');

  if (titleEl) titleEl.textContent = p ? 'Profil bearbeiten' : 'Neues Profil';
  if (nameEl)  nameEl.value = p?.name || '';
  if (prevEl)  prevEl.innerHTML = p?.avatar
    ? '<img src="' + p.avatar + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>'
    : '<div style="width:56px;height:56px;border-radius:50%;background:var(--bgch);display:flex;align-items:center;justify-content:center;font-size:28px">👤</div>';
  if (pinEl)   pinEl.textContent = p?.pin ? '🔒 PIN aktiv' : '🔓 Kein PIN';
  if (delBtn)  delBtn.style.display = (p && profiles.length > 1) ? 'flex' : 'none';

  document.getElementById('profile-editor-overlay').style.display = 'flex';
}

function buildSidebarProfile() {
  const p = profiles.find(pr => pr.id === activeProfileId) || { name: 'User' };
  const nameEl = document.getElementById('sidebar-profile-name');
  if (nameEl) nameEl.textContent = p.name || 'User';
  const avEl = document.getElementById('sidebar-profile-avatar');
  if (avEl) avEl.innerHTML = p.avatar
    ? '<img src="' + p.avatar + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>'
    : '👤';

  // Profil-Liste aufbauen
  const list = document.getElementById('sidebar-profile-list');
  if (!list) return;
  list.innerHTML = '';

  profiles.forEach(prof => {
    const item = document.createElement('div');
    item.className = 'sidebar-profile-item' + (prof.id === activeProfileId ? ' active' : '');
    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 8px;' +
      'border-radius:var(--r-sm);cursor:pointer;transition:background .15s;margin-bottom:2px;' +
      (prof.id === activeProfileId ? 'background:var(--accg);color:var(--acc)' : 'color:var(--tx2)');

    item.innerHTML =
      '<div style="width:22px;height:22px;border-radius:50%;overflow:hidden;flex-shrink:0;' +
      'background:' + (prof.id === activeProfileId ? 'var(--acc)' : 'var(--bgch)') + ';' +
      'display:flex;align-items:center;justify-content:center;font-size:12px">' +
      (prof.avatar ? '<img src="' + prof.avatar + '" style="width:100%;height:100%;object-fit:cover"/>' : '👤') + '</div>' +
      '<span style="font-size:12px;font-weight:' + (prof.id === activeProfileId ? '700' : '400') + ';' +
      'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(prof.name) + '</span>' +
      '<button class="profile-edit-trigger" data-profile-id="' + prof.id + '" ' +
      'style="background:transparent;border:none;color:var(--tx3);cursor:pointer;font-size:11px;' +
      'padding:2px 4px;opacity:0;transition:opacity .15s" title="Bearbeiten">✏</button>';

    item.addEventListener('mouseenter', () => {
      item.querySelector('.profile-edit-trigger').style.opacity = '1';
      if (prof.id !== activeProfileId) item.style.background = 'var(--bgc)';
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('.profile-edit-trigger').style.opacity = '0';
      if (prof.id !== activeProfileId) item.style.background = 'transparent';
    });
    item.addEventListener('click', e => {
      if (e.target.closest('.profile-edit-trigger')) {
        e.stopPropagation();
        openProfileEditor(e.target.closest('.profile-edit-trigger').dataset.profileId);
        return;
      }
      if (prof.id === activeProfileId) return;
      if (prof.pin) {
        const entered = prompt('PIN für "' + prof.name + '":');
        if (entered === null) return;
        window.electronAPI.verifyPin(String(entered), prof.pin)
          .then(valid => valid ? switchProfile(prof.id) : showToastMsg('Falscher PIN'))
          .catch(() => String(entered) === String(prof.pin) ? switchProfile(prof.id) : showToastMsg('Falscher PIN'));
      } else {
        switchProfile(prof.id);
      }
    });
    list.appendChild(item);
  });
}

// ════════════════════════════════════════════════════════════════════
// TEIL 4: STATISTIKEN
// ════════════════════════════════════════════════════════════════════

async function buildStatsView() {
  const content = document.getElementById('stats-content');
  if (!content) return;
  content.innerHTML = '<div style="text-align:center;padding:30px;color:var(--tx2)">Lädt…</div>';

  const stats   = await window.electronAPI.getStreamStats(activeProfileId).catch(() => ({}));
  const watched = await window.electronAPI.getWatchedContent(activeProfileId).catch(() => []);
  content.innerHTML = '';

  const entries = Object.entries(stats)
    .map(([id, v]) => ({ id, secs: v?.total || 0, byDay: v?.byDay || Array(7).fill(0) }))
    .filter(e => e.secs > 0).sort((a, b) => b.secs - a.secs);

  const totalSecs = entries.reduce((a, e) => a + e.secs, 0);
  const totalH    = (totalSecs / 3600).toFixed(1);
  const adCount   = parseInt(localStorage.getItem('adBlock_' + activeProfileId) || '0');
  const topProv   = entries[0];
  const topName   = topProv
    ? ((settings.cardCustomNames || {})[topProv.id] || PROVIDERS()[topProv.id]?.name || topProv.id)
    : '–';
  const daysLabel = (I18N[lang] || I18N.de).days || ['So','Mo','Di','Mi','Do','Fr','Sa'];

  // Kacheln
  const kachelWrap = document.createElement('div');
  kachelWrap.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px';
  [
    { icon:'⏱', label:'Streamzeit',      value: totalH + 'h',               color:'var(--acc)' },
    { icon:'📺', label:'Anbieter genutzt', value: String(entries.length),      color:'#66bb6a' },
    { icon:'🎬', label:'Angeschaut',       value: String(watched.length),       color:'#ffa726' },
    { icon:'🛡', label:'Werbung geblockt', value: adCount.toLocaleString('de'), color:'#ab47bc',
      sub: topProv ? 'Meist bei ' + topName : '' },
  ].forEach(k => {
    const el = document.createElement('div');
    el.style.cssText = 'background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:14px;text-align:center';
    el.innerHTML = '<div style="font-size:20px;margin-bottom:4px">' + k.icon + '</div>' +
      '<div style="font-family:var(--font-d);font-size:22px;font-weight:800;color:' + k.color + '">' + k.value + '</div>' +
      '<div style="font-size:11px;color:var(--tx2);margin-top:3px">' + k.label + '</div>' +
      (k.sub ? '<div style="font-size:9px;color:var(--tx3);margin-top:2px">' + esc(k.sub) + '</div>' : '');
    kachelWrap.appendChild(el);
  });
  content.appendChild(kachelWrap);

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:40px;color:var(--tx2)';
    empty.textContent = 'Noch keine Daten. Starte einen Stream!';
    content.appendChild(empty);
    buildAchievementsSection(stats); return;
  }

  // Anbieter-Balken
  const barSec = document.createElement('div');
  barSec.style.cssText = 'background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:16px;margin-bottom:14px';
  barSec.innerHTML = '<h3 style="font-family:var(--font-d);font-size:14px;font-weight:700;color:var(--tx);margin-bottom:12px">📊 Meistgenutzte Anbieter</h3>';
  entries.slice(0, 8).forEach(({ id, secs }, i) => {
    const p = PROVIDERS()[id]; if (!p) return;
    const h = (secs / 3600).toFixed(1);
    const pct = Math.round((secs / (entries[0].secs || 1)) * 100);
    const name = (settings.cardCustomNames || {})[id] || p.name;
    const row = document.createElement('div');
    row.style.cssText = 'margin-bottom:10px';
    row.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px">' +
      '<span style="display:flex;align-items:center;gap:5px;color:var(--tx)">' +
      '<img src="' + getFavicon(id,p) + '" style="width:14px;height:14px;border-radius:2px;object-fit:contain" onerror="this.style.display=\'none\'"/>' +
      esc(name) + '</span><span style="color:var(--tx2)">' + h + 'h</span></div>' +
      '<div style="height:6px;background:var(--bgch);border-radius:999px;overflow:hidden">' +
      '<div style="width:0;height:100%;border-radius:999px;background:' + (p.color || 'var(--acc)') +
      ';transition:width 1s ease ' + (i * 0.08) + 's" data-w="' + pct + '"></div></div>';
    barSec.appendChild(row);
  });
  content.appendChild(barSec);
  setTimeout(() => content.querySelectorAll('[data-w]').forEach(el => el.style.width = el.dataset.w + '%'), 60);

  // Wochentage
  const dayTotals = Array(7).fill(0);
  entries.forEach(({ byDay }) => { if (byDay) byDay.forEach((s, i) => dayTotals[i] += s); });
  const maxDay = Math.max(...dayTotals, 1);
  const daySec = document.createElement('div');
  daySec.style.cssText = 'background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:16px;margin-bottom:14px';
  daySec.innerHTML = '<h3 style="font-family:var(--font-d);font-size:14px;font-weight:700;color:var(--tx);margin-bottom:12px">📅 Wochentage</h3>';
  const barCont = document.createElement('div');
  barCont.style.cssText = 'display:flex;align-items:flex-end;gap:8px;height:80px';
  daysLabel.forEach((d, i) => {
    const pct = Math.round((dayTotals[i] / maxDay) * 100);
    const isMax = dayTotals[i] === Math.max(...dayTotals) && dayTotals[i] > 0;
    const col = document.createElement('div');
    col.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%';
    col.innerHTML = '<div style="font-size:9px;color:' + (isMax?'var(--acc)':'var(--tx3)') + ';height:14px;display:flex;align-items:center">' +
      (dayTotals[i]>0 ? (dayTotals[i]/3600).toFixed(1)+'h' : '') + '</div>' +
      '<div style="flex:1;width:100%;display:flex;align-items:flex-end">' +
      '<div style="width:100%;min-height:3px;background:' + (isMax?'var(--acc)':'rgba(48,197,187,.3)') +
      ';border-radius:4px 4px 0 0;height:0;transition:height .8s ease ' + (i*0.06) + 's" data-dh="' + pct + '%"></div></div>' +
      '<div style="font-size:11px;font-weight:700;color:' + (isMax?'var(--acc)':'var(--tx2)') + '">' + d + '</div>';
    barCont.appendChild(col);
  });
  daySec.appendChild(barCont);
  content.appendChild(daySec);
  setTimeout(() => content.querySelectorAll('[data-dh]').forEach(el => el.style.height = el.dataset.dh), 80);

  buildAchievementsSection(stats);
}

function buildAchievementsSection(stats) {
  const el = document.getElementById('achievements-content');
  if (!el) return;
  const earned = new Set(JSON.parse(localStorage.getItem('achievements_' + activeProfileId) || '[]'));
  el.innerHTML = '';

  const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
  const earnedCount = [...earned].filter(id => !ACHIEVEMENTS.find(x=>x.id===id)?.hidden).length;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px';
  header.innerHTML = '<h3 style="font-family:var(--font-d);font-size:15px;font-weight:800;color:var(--tx);margin:0">🏆 Achievements</h3>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<div style="font-size:12px;color:var(--tx2)">' + earnedCount + ' / ' + total + ' freigeschaltet</div>' +
    '<div style="width:100px;height:6px;background:var(--bgch);border-radius:999px;overflow:hidden">' +
    '<div style="width:' + Math.round((earnedCount/total)*100) + '%;height:100%;background:var(--acc);border-radius:999px"></div></div></div>';
  el.appendChild(header);

  const catLabels = {
    stream: {de:'⏱ Streamzeit'}, provider: {de:'📺 Anbieter'},
    special: {de:'⭐ Besonders'}, hidden: {de:'🔒 Versteckt'},
  };

  ['stream','provider','special','hidden'].forEach(cat => {
    const list = ACHIEVEMENTS.filter(a => a.cat === cat);
    if (!list.length) return;
    const sec = document.createElement('div');
    sec.style.cssText = 'margin-bottom:18px';
    sec.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">' +
      (catLabels[cat]?.[lang] || catLabels[cat]?.de || cat) + '</div>';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px';

    list.forEach(a => {
      const isEarned = earned.has(a.id);
      const isHidden = a.hidden && !isEarned;
      const name = isHidden ? '???' : (a.name[lang] || a.name.de);
      const desc = isHidden ? 'Muss erst freigeschaltet werden' : (a.desc[lang] || a.desc.de);
      const card = document.createElement('div');
      card.style.cssText = 'background:var(--bgc);border:1px solid ' + (isEarned ? 'var(--acc)' : 'var(--bor)') +
        ';border-radius:var(--r-sm);padding:10px;display:flex;align-items:center;gap:8px;' +
        'opacity:' + (isEarned ? '1' : '0.4') + ';' +
        (isEarned ? 'background:linear-gradient(135deg,var(--bgc),var(--accg))' : '');
      card.innerHTML = '<div style="font-size:22px;filter:' + (isEarned?'none':'grayscale(1)') + '">' + a.icon + '</div>' +
        '<div style="min-width:0"><div style="font-size:11px;font-weight:700;color:' + (isEarned?'var(--acc)':'var(--tx)') +
        ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(name) + '</div>' +
        '<div style="font-size:10px;color:var(--tx3);margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(desc) + '</div></div>' +
        (isEarned ? '<div style="margin-left:auto;color:var(--acc);font-size:14px;flex-shrink:0">✓</div>' : '');
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    el.appendChild(sec);
  });
}

// ════════════════════════════════════════════════════════════════════
// TEIL 5: SPRACHE – ohne Rekursion
// ════════════════════════════════════════════════════════════════════

function applyLanguage(l) {
  lang = l;
  const tr = (I18N[l] || I18N.de);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key]) el.textContent = tr[key];
  });

  const si = document.getElementById('search-input');
  if (si) si.placeholder = tr.searchPlaceholder || 'Anbieter, Film, Serie…';

  document.querySelectorAll('.lang-btn, [data-lang]').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });

  window._days = tr.days || ['So','Mo','Di','Mi','Do','Fr','Sa'];
  settings.language = l;
  autoSave();
}

// Sprach-Buttons verdrahten (einmalig, kein Loop)
(function bindLangButtons() {
  setTimeout(() => {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      if (btn._langBound) return;
      btn._langBound = true;
      btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
  }, 500);
})();

// ════════════════════════════════════════════════════════════════════
// TEIL 6: ONBOARDING – Theme + Font + Sprache
// ════════════════════════════════════════════════════════════════════

(function fixOnboardingSetup() {
  setTimeout(() => {
    // Theme
    ['ob-theme-dark','ob-theme-light'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn || btn._obBound) return;
      btn._obBound = true;
      btn.addEventListener('click', async () => {
        const theme = id === 'ob-theme-light' ? 'light' : 'dark';
        await window.electronAPI.setTheme(theme);
        document.documentElement.dataset.theme = theme;
        if (typeof applyTheme === 'function') applyTheme(theme);
        document.getElementById('ob-theme-dark')?.classList.toggle('active', theme === 'dark');
        document.getElementById('ob-theme-light')?.classList.toggle('active', theme === 'light');
      });
    });

    // Schriftart
    const fontSel = document.getElementById('ob-font-family');
    if (fontSel && !fontSel._obBound) {
      fontSel._obBound = true;
      fontSel.value = settings.designOptions?.fontFamily || 'DM Sans';
      fontSel.addEventListener('change', () => {
        const font = fontSel.value;
        settings.designOptions = settings.designOptions || {};
        settings.designOptions.fontFamily = font;
        if (typeof applyFontFamily === 'function') applyFontFamily(font);
        autoSave();
      });
    }

    // Aktuelle Theme-State setzen
    const theme = document.documentElement.dataset.theme || 'dark';
    document.getElementById('ob-theme-dark')?.classList.toggle('active', theme === 'dark');
    document.getElementById('ob-theme-light')?.classList.toggle('active', theme === 'light');
  }, 400);
})();

// ════════════════════════════════════════════════════════════════════
// TEIL 7: KATEGORIE-FILTER + ANBIETER-WIEDERHERSTELLUNG
// ════════════════════════════════════════════════════════════════════

function buildCategoryFilterBar() {
  const bar = document.getElementById('category-filter-bar');
  if (!bar) return;
  bar.innerHTML = '';
  const active = settings.activeCategory || 'all';

  Object.entries(PROVIDER_CATEGORIES).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.className = 'cat-filter-btn' + (key === active ? ' active' : '');
    btn.dataset.cat = key;
    const label = cat[lang] || cat.de;
    btn.innerHTML = '<span>' + cat.icon + '</span><span class="cat-label">' + label + '</span>';
    btn.addEventListener('click', () => {
      settings.activeCategory = key;
      autoSave();
      updateCategoryFilter(key);
      buildProviderGrid();
    });
    bar.appendChild(btn);
  });

  // "Anbieter hinzufügen" Button
  const addBtn = document.createElement('button');
  addBtn.className = 'cat-filter-btn';
  addBtn.style.cssText = 'margin-left:auto';
  addBtn.innerHTML = '<span>➕</span><span class="cat-label">Anbieter</span>';
  addBtn.title = 'Ausgeblendete Anbieter aktivieren';
  addBtn.addEventListener('click', () => {
    if (typeof openRestoreProvidersPanel === 'function') openRestoreProvidersPanel();
  });
  bar.appendChild(addBtn);

  bar.style.display = 'flex';
}

// ════════════════════════════════════════════════════════════════════
// TEIL 8: UPDATE-CHECK
// ════════════════════════════════════════════════════════════════════

(function setupUpdateCheck() {
  setTimeout(() => {
    const btn = document.getElementById('btn-check-updates');
    if (!btn || btn._updateBound) return;
    btn._updateBound = true;
    btn.replaceWith(btn.cloneNode(true));
    document.getElementById('btn-check-updates').addEventListener('click', async () => {
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent = 'Prüfe…'; el.style.color = 'var(--tx2)'; }
      let done = false;
      const finish = (text, color) => {
        if (done) return; done = true;
        if (el) { el.textContent = text; el.style.color = color; }
      };
      window.electronAPI.onUpdateAvailable?.(info =>
        finish('🚀 v' + info.version + ' verfügbar!', 'var(--acc)'));
      window.electronAPI.onUpdateNotAvailable?.(() =>
        finish('✓ Aktuellste Version', 'var(--acc)'));
      window.electronAPI.onUpdateError?.(msg =>
        finish(msg && !msg.includes('404') ? 'Fehler: ' + msg : '✓ Aktuellste Version', 'var(--acc)'));
      try { await window.electronAPI.checkForUpdates(); } catch {}
      setTimeout(() => finish('✓ Aktuellste Version', 'var(--acc)'), 8000);
    });
  }, 900);
})();

// ════════════════════════════════════════════════════════════════════
// TEIL 9: WIDEVINE STATUS
// ════════════════════════════════════════════════════════════════════

async function checkWidevineStatus() {
  try {
    const status = await window.electronAPI.getWidevineStatus();
    const el     = document.getElementById('widevine-status');
    if (!el) return;

    if (status?.installed) {
      el.innerHTML = '<div style="display:flex;align-items:center;gap:6px;color:#66bb6a">' +
        '<span style="font-size:16px">✓</span>' +
        '<div><div style="font-weight:700;font-size:13px">WideVine CDM installiert</div>' +
        (status.version ? '<div style="font-size:11px;opacity:.7">v' + status.version + '</div>' : '') + '</div></div>';
    } else {
      const missing = [];
      if (!status?.dllExists)      missing.push('widevinecdm.dll');
      if (!status?.sigExists)      missing.push('widevinecdm.dll.sig');
      if (!status?.manifestExists) missing.push('manifest.json');
      el.innerHTML = '<div style="color:var(--danger)">' +
        '<div style="font-weight:700;margin-bottom:6px">✗ WideVine CDM nicht vollständig</div>' +
        (missing.length ? '<div style="font-size:11px;margin-bottom:8px">Fehlend: ' +
          missing.map(f => '<code style="background:var(--bgc);padding:1px 5px;border-radius:3px">' + f + '</code>').join(' ') + '</div>' : '') +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:6px">' +
        '<code style="background:var(--bgc);border:1px solid var(--bor);border-radius:4px;padding:4px 8px;font-size:10px;color:var(--tx2);flex:1;word-break:break-all">' + (status?.cdmDir || '?') + '</code>' +
        '<button onclick="window._openWvFolder(\'dest\')" style="padding:5px 10px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer">📁 Öffnen</button></div></div>';
    }
  } catch(e) {
    console.warn('[WideVine] Status-Fehler:', e.message);
  }
}

window._openWvFolder = async function(type) {
  try {
    let targetPath = '';
    if (type === 'dest') {
      const status = await window.electronAPI.getWidevineStatus();
      targetPath = status?.cdmDir || '';
    } else if (type === 'chrome') {
      targetPath = 'C:\\Program Files\\Google\\Chrome\\Application';
    } else if (type === 'edge') {
      targetPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';
    }
    if (!targetPath) { showToastMsg('Pfad nicht gefunden'); return; }
    window.electronAPI.openExternal('file:///' + targetPath.replace(/\\/g, '/'));
  } catch(e) {
    showToastMsg('Ordner konnte nicht geöffnet werden');
  }
};

// ════════════════════════════════════════════════════════════════════
// TEIL 10: SESSION-LISTE (Account-Tab)
// ════════════════════════════════════════════════════════════════════

function buildSessionList(res) {
  const list = document.getElementById('session-list');
  if (!list) return;

  let actionRow = document.getElementById('account-action-btns');
  if (!actionRow) {
    actionRow = document.createElement('div');
    actionRow.id = 'account-action-btns';
    actionRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--bor);flex-wrap:wrap';
    const parent = list.parentElement;
    if (parent) parent.insertBefore(actionRow, parent.firstChild);
  }

  const selectedIds = new Set();

  actionRow.innerHTML = '<button class="pick-btn" id="btn-logout-all" style="border-color:var(--danger);color:var(--danger)">↩ Alle abmelden</button>' +
    '<button class="pick-btn" id="btn-logout-sel">↩ Auswahl abmelden</button>';

  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von allen Diensten abmelden?')) return;
    window.electronAPI.clearAllSessions(activeProfileId);
    showToastMsg('Alle abgemeldet');
    setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 600);
  });
  document.getElementById('btn-logout-sel')?.addEventListener('click', () => {
    if (!selectedIds.size) { showToastMsg('Keine Anbieter ausgewählt'); return; }
    window.electronAPI.clearProvidersSessions(activeProfileId, [...selectedIds]);
    selectedIds.clear();
    showToastMsg('Ausgewählte Anbieter abgemeldet');
    setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 600);
  });

  list.innerHTML = '';
  const all = Object.entries(PROVIDERS_BASE).sort((a,b) => a[1].name.localeCompare(b[1].name));
  const loggedIn = all.filter(([id]) => !!(res||{})[id]);
  const notIn    = all.filter(([id]) => !(res||{})[id]);

  function makeRow(id, p, isOn) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:9px;padding:8px 10px;' +
      'border:1px solid transparent;border-radius:var(--r-sm);cursor:pointer;transition:all .15s;margin-bottom:3px;user-select:none';
    row.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' + (isOn?'#66bb6a':'var(--bor)') + '"></span>' +
      '<img src="' + getFavicon(id,p) + '" style="width:18px;height:18px;border-radius:3px;object-fit:contain" onerror="this.style.display=\'none\'"/>' +
      '<span style="flex:1;font-size:13px;color:var(--tx)">' + esc((settings.cardCustomNames||{})[id]||p.name) + '</span>' +
      (isOn ? '<span style="font-size:10px;color:#66bb6a;font-weight:600">✓</span>' : '') +
      (isOn ? '<button class="sess-logout-btn" style="display:none;padding:3px 8px;border:1px solid var(--bor);background:transparent;color:var(--danger);border-radius:var(--r-sm);font-size:10px;cursor:pointer">Abmelden</button>' : '');

    if (isOn) {
      row.addEventListener('click', e => {
        if (e.target.classList.contains('sess-logout-btn')) return;
        if (selectedIds.has(id)) {
          selectedIds.delete(id);
          row.style.background = ''; row.style.borderColor = 'transparent';
        } else {
          selectedIds.add(id);
          row.style.background = 'var(--accg)'; row.style.borderColor = 'var(--acc)';
        }
      });
      const lb = row.querySelector('.sess-logout-btn');
      if (lb) {
        row.addEventListener('mouseenter', () => lb.style.display = 'block');
        row.addEventListener('mouseleave', () => lb.style.display = 'none');
        lb.addEventListener('click', e => {
          e.stopPropagation();
          window.electronAPI.clearProviderSession(activeProfileId, id);
          showToastMsg('Abgemeldet von ' + p.name);
          row.style.opacity = '0'; row.style.transition = 'opacity .3s';
          setTimeout(() => row.remove(), 300);
          setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 500);
        });
      }
    }
    return row;
  }

  if (loggedIn.length) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:700;color:var(--acc);text-transform:uppercase;letter-spacing:.1em;padding:6px 0 4px';
    lbl.textContent = 'Angemeldet';
    list.appendChild(lbl);
    loggedIn.forEach(([id,p]) => list.appendChild(makeRow(id,p,true)));
  }
  if (notIn.length) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;padding:8px 0 4px';
    lbl.textContent = 'Nicht angemeldet';
    list.appendChild(lbl);
    notIn.forEach(([id,p]) => list.appendChild(makeRow(id,p,false)));
  }
}

// ════════════════════════════════════════════════════════════════════
// TEIL 11: MISC PATCHES
// ════════════════════════════════════════════════════════════════════

// Plugin-Buttons Farben
(function stylePluginButtons() {
  const bind = () => {
    document.querySelectorAll('.plugin-preset-btn').forEach(btn => {
      const txt = (btn.textContent || '').toLowerCase();
      if (txt.includes('install') || txt.includes('aktivier'))
        btn.style.cssText += 'background:var(--acc)!important;color:#fff!important;border:none!important';
      else if (txt.includes('deinstall') || txt.includes('entfern'))
        btn.style.cssText += 'background:rgba(229,115,115,.12)!important;border:1px solid #e57373!important;color:#e57373!important';
    });
  };
  setTimeout(bind, 900);
})();

// CR Kalender
async function loadCrCalendarView() {
  const content = document.getElementById('cr-calendar-content');
  if (!content) return;
  content.innerHTML = '<div style="color:var(--tx2);padding:20px;text-align:center">Lädt…</div>';
  try {
    const [p1, p2] = await Promise.all([
      window.electronAPI.getUpcoming(1),
      window.electronAPI.getTrending(),
    ]);
    const all = [...(p1.anime||[]),...(p2.anime||[])]
      .filter((v,i,a) => a.findIndex(x=>x.id===v.id)===i)
      .filter(i => i.poster_path)
      .filter(i => /^[\u0000-\u024F\s\d\W]+$/.test(i.title||i.name||''));

    const today = new Date(); today.setHours(0,0,0,0);
    const dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];

    const tabs = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      tabs.push({
        label: i===0 ? 'Heute' : dayNames[d.getDay()]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.',
        date: d.toISOString().split('T')[0], type:'future'
      });
    }
    tabs.push({ label: '← Letzte Woche', date: 'lastweek', type:'past' });

    let activeTab = tabs[0].date;

    function renderTabContent(targetDate) {
      const tc = document.getElementById('cr-tab-content');
      if (!tc) return;
      tc.innerHTML = '';
      let items;
      if (targetDate === 'lastweek') {
        const ls = new Date(today); ls.setDate(today.getDate()-7);
        items = all.filter(i => {
          const d = i.first_air_date || i.release_date;
          if (!d) return false;
          const dt = new Date(d); dt.setHours(0,0,0,0);
          return dt >= ls && dt < today;
        });
      } else {
        items = all.filter(i => (i.first_air_date||i.release_date) === targetDate);
      }
      if (!items.length) {
        tc.innerHTML = '<div style="color:var(--tx2);padding:20px;text-align:center">Keine Anime für diesen Tag</div>';
        return;
      }
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;padding:14px 0';
      items.forEach(item => {
        const title = item.title||item.name||'?';
        const poster = item.poster_path ? 'https://image.tmdb.org/t/p/w185' + item.poster_path : '';
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .18s,border-color .18s';
        card.innerHTML = (poster ? '<img src="' + poster + '" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block" loading="lazy"/>' : '') +
          '<div style="padding:7px 9px"><div style="font-size:11px;font-weight:600;color:var(--tx);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(title) + '</div><div style="font-size:9px;color:var(--acc);margin-top:3px;font-weight:600">Crunchyroll</div></div>';
        card.addEventListener('mouseenter', () => { card.style.transform='translateY(-3px)'; card.style.borderColor='var(--acc)'; });
        card.addEventListener('mouseleave', () => { card.style.transform=''; card.style.borderColor=''; });
        card.addEventListener('click', () => showDetailPopup(item.id,'tv',title));
        grid.appendChild(card);
      });
      tc.appendChild(grid);
    }

    content.innerHTML = '';
    const topBar = document.createElement('div');
    topBar.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--bor);align-items:center';
    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'media-type-text-btn' + (tab.date===activeTab?' active':'');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        activeTab = tab.date;
        topBar.querySelectorAll('.media-type-text-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTabContent(tab.date);
      });
      topBar.appendChild(btn);
    });
    const crBtn = document.createElement('button');
    crBtn.className = 'pick-btn';
    crBtn.style.marginLeft = 'auto';
    crBtn.textContent = '▶ Crunchyroll';
    crBtn.addEventListener('click', () => openProvider('crunchyroll'));
    topBar.appendChild(crBtn);
    content.appendChild(topBar);
    const tc = document.createElement('div');
    tc.id = 'cr-tab-content';
    content.appendChild(tc);
    renderTabContent(activeTab);
  } catch(e) {
    if (content) content.innerHTML = '<div style="color:var(--danger);padding:20px">Fehler: ' + esc(e.message||String(e)) + '</div>';
  }
}

console.log('[OmniSight fixes.js] Geladen – keine Rekursionen');

// ════════════════════════════════════════════════════════════════════
// v3.2.6 FIXES
// ════════════════════════════════════════════════════════════════════

// ── 1. MINIPLAYER: Komplett überarbeitet ─────────────────────────────

(function setupPipImproved() {
  const PIP_W = 340, PIP_H = 200;
  let isDragging = false, dragOffX = 0, dragOffY = 0;

  function setupPip() {
    const pip = document.getElementById('pip-window');
    if (!pip || pip._v326Setup) return;
    pip._v326Setup = true;

    // Modernes Design
    pip.style.cssText = `
      position:fixed; width:${PIP_W}px; height:${PIP_H}px;
      right:24px; bottom:24px; left:auto; top:auto;
      background:#000; border-radius:12px; overflow:hidden;
      box-shadow:0 8px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08);
      z-index:8000; display:none; flex-direction:column;
      transition:box-shadow .2s;
    `;

    // Toolbar oben
    let toolbar = document.getElementById('pip-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'pip-toolbar';
      toolbar.style.cssText = `
        display:flex; align-items:center; gap:6px; padding:6px 10px;
        background:rgba(0,0,0,.85); backdrop-filter:blur(8px);
        border-bottom:1px solid rgba(255,255,255,.08);
        position:absolute; top:0; left:0; right:0; z-index:10;
        opacity:0; transition:opacity .2s;
      `;

      const title = document.createElement('span');
      title.id = 'pip-title';
      title.style.cssText = 'font-size:11px;color:#fff;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      title.textContent = 'Mini-Player';

      // Größenregler
      const sizes = [
        { label: 'S', w: 240, h: 135 },
        { label: 'M', w: 340, h: 200 },
        { label: 'L', w: 480, h: 270 },
      ];
      const sizeWrap = document.createElement('div');
      sizeWrap.style.cssText = 'display:flex;gap:3px';
      sizes.forEach(sz => {
        const b = document.createElement('button');
        b.textContent = sz.label;
        b.style.cssText = 'background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.7);font-size:10px;padding:2px 6px;border-radius:4px;cursor:pointer;transition:all .15s';
        b.addEventListener('mouseenter', () => b.style.background = 'rgba(255,255,255,.2)');
        b.addEventListener('mouseleave', () => b.style.background = 'rgba(255,255,255,.1)');
        b.addEventListener('click', () => {
          pip.style.width  = sz.w + 'px';
          pip.style.height = sz.h + 'px';
          const cont = document.getElementById('pip-content');
          if (cont) { const wv = cont.querySelector('webview'); if (wv) wv.style.height = (sz.h - 32) + 'px'; }
        });
        sizeWrap.appendChild(b);
      });

      // Mute Button
      const muteBtn = document.createElement('button');
      muteBtn.id = 'pip-mute-btn';
      muteBtn.style.cssText = 'background:rgba(255,255,255,.1);border:none;color:#fff;font-size:14px;padding:3px 8px;border-radius:4px;cursor:pointer;line-height:1';
      muteBtn.textContent = '🔊';
      muteBtn.title = 'Ton an/aus';
      muteBtn.addEventListener('click', () => {
        const cont = document.getElementById('pip-content');
        const wv = cont?.querySelector('webview');
        if (!wv) return;
        const muted = !wv._pipMuted;
        wv._pipMuted = muted;
        try { wv.setAudioMuted(muted); } catch {}
        muteBtn.textContent = muted ? '🔇' : '🔊';
        muteBtn.style.background = muted ? 'rgba(239,83,80,.4)' : 'rgba(255,255,255,.1)';
      });

      // Zurück-Button
      const restoreBtn = document.createElement('button');
      restoreBtn.style.cssText = 'background:rgba(48,197,187,.2);border:1px solid rgba(48,197,187,.3);color:var(--acc);font-size:10px;padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap';
      restoreBtn.textContent = '⤢ Vollbild';
      restoreBtn.title = 'Zurück zum Vollbild';
      restoreBtn.addEventListener('click', () => {
        if (typeof restoreFromPip === 'function') restoreFromPip();
      });

      // Schließen
      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = 'background:rgba(239,83,80,.15);border:none;color:#ef5350;font-size:14px;padding:3px 8px;border-radius:4px;cursor:pointer;line-height:1';
      closeBtn.textContent = '×';
      closeBtn.title = 'Stream beenden';
      closeBtn.addEventListener('click', () => {
        pip.style.display = 'none';
        const cont = document.getElementById('pip-content');
        if (cont) cont.innerHTML = '';
        pipProviderId = null;
        currentProvider = null;
        currentWebview = null;
      });

      toolbar.append(title, sizeWrap, muteBtn, restoreBtn, closeBtn);
      pip.appendChild(toolbar);
    }

    // Content-Bereich
    let cont = document.getElementById('pip-content');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'pip-content';
      cont.style.cssText = `position:absolute;top:32px;left:0;right:0;bottom:0;background:#000`;
      pip.appendChild(cont);
    }

    // Hover zeigt Toolbar
    pip.addEventListener('mouseenter', () => { toolbar.style.opacity = '1'; });
    pip.addEventListener('mouseleave', () => { toolbar.style.opacity = '0'; });

    // Drag & Drop
    toolbar.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      const rect = pip.getBoundingClientRect();
      dragOffX = e.clientX - rect.left;
      dragOffY = e.clientY - rect.top;
      pip.style.transition = 'none';
      pip.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      let x = e.clientX - dragOffX;
      let y = e.clientY - dragOffY;
      // Innerhalb des Bildschirms halten
      x = Math.max(0, Math.min(window.innerWidth - pip.offsetWidth, x));
      y = Math.max(0, Math.min(window.innerHeight - pip.offsetHeight, y));
      pip.style.left   = x + 'px';
      pip.style.top    = y + 'px';
      pip.style.right  = 'auto';
      pip.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      pip.style.transition = 'box-shadow .2s';
      pip.style.cursor = '';
    });
  }

  setTimeout(setupPip, 600);
})();

// maybeMoveToPip: Webview in Miniplayer verschieben
window.maybeMoveToPip = function() {
  const wrap = document.getElementById('webview-wrap');
  const pip  = document.getElementById('pip-window');
  const cont = document.getElementById('pip-content');
  if (!wrap || !pip || !cont || !currentWebview || !currentProvider) return;

  const wv = currentWebview;
  wrap.removeChild(wv);
  wv.style.cssText = 'width:100%;height:100%;border:none';
  cont.innerHTML = '';
  cont.appendChild(wv);

  pipProviderId = currentProvider;
  const titleEl = document.getElementById('pip-title');
  if (titleEl) titleEl.textContent =
    (settings.cardCustomNames || {})[currentProvider] ||
    PROVIDERS()[currentProvider]?.name || currentProvider;

  pip.style.display = 'flex';
  currentProvider = null;
  currentWebview  = null;
};

// restoreFromPip: Webview zurück in den Stream
window.restoreFromPip = function() {
  const pip  = document.getElementById('pip-window');
  const cont = document.getElementById('pip-content');
  const wrap = document.getElementById('webview-wrap');
  if (!pip || !cont || !wrap || !pipProviderId) return;

  const wv = cont.querySelector('webview');
  if (wv) {
    cont.removeChild(wv);
    wv.style.cssText = 'width:100%;height:100%;border:none;display:flex';
    wrap.innerHTML = '';
    wrap.appendChild(wv);
    currentWebview  = wv;
    currentProvider = pipProviderId;
  }

  pip.style.display = 'none';
  cont.innerHTML = '';
  pipProviderId  = null;

  const titleEl = document.getElementById('stream-title');
  if (titleEl) titleEl.textContent =
    (settings.cardCustomNames || {})[currentProvider] ||
    PROVIDERS()[currentProvider]?.name || currentProvider;

  showView('stream');
};

// ── 2. PARTIKEL: Komplett überarbeitet ───────────────────────────────

(function setupParticlesImproved() {
  function runParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    if (window._particlesAnim) { cancelAnimationFrame(window._particlesAnim); window._particlesAnim = null; }
    if (!settings.particlesEnabled) { canvas.style.display = 'none'; return; }

    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    let w = canvas.width  = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const cfg = settings.particlesConfig || {};
    const count   = cfg.count   || 60;
    const size    = cfg.size    || 1.5;
    const speed   = cfg.speed   || 0.8;
    const opacity = cfg.opacity !== undefined ? cfg.opacity : 0.55;
    const color   = cfg.color   || '#30c5bb';
    const shapes  = (cfg.shapes && cfg.shapes.length) ? cfg.shapes : ['circle'];

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * size + 0.4,
      vx: (Math.random() - .5) * speed * .6,
      vy: (Math.random() - .5) * speed * .6,
      rot: Math.random() * Math.PI * 2,
      op: (Math.random() * .5 + .5) * opacity,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

    function drawP(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;
      // Farbe: CSS var() in canvas nicht erlaubt
      const c = color.startsWith('var(')
        ? (getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#30c5bb')
        : color;
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      ctx.lineWidth = 0.8;
      switch (p.shape) {
        case 'triangle':
          ctx.beginPath(); ctx.moveTo(0,-p.r*1.4); ctx.lineTo(p.r,p.r*.9); ctx.lineTo(-p.r,p.r*.9); ctx.closePath(); ctx.fill(); break;
        case 'star':
          ctx.beginPath();
          for (let i=0;i<5;i++) { ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*p.r,   -Math.sin((18+i*72)*Math.PI/180)*p.r); ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*p.r*.4,-Math.sin((54+i*72)*Math.PI/180)*p.r*.4); }
          ctx.closePath(); ctx.fill(); break;
        case 'ring':
          ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.lineWidth=p.r*.35; ctx.stroke(); break;
        case 'line':
          ctx.beginPath(); ctx.moveTo(-p.r*2,0); ctx.lineTo(p.r*2,0); ctx.stroke(); break;
        default: // circle
          ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0,0,w,h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += .003;
        if(p.x<-10)p.x=w+10; if(p.x>w+10)p.x=-10;
        if(p.y<-10)p.y=h+10; if(p.y>h+10)p.y=-10;
        drawP(p);
      });
      window._particlesAnim = requestAnimationFrame(tick);
    }
    tick();
  }

  // UI: Partikel-Einstellungen verdrahten
  function bindParticleUI() {
    const sec = document.getElementById('particles-options-section') ||
                document.querySelector('[id*="particle"]')?.closest('.smt-card');
    const toggle = document.getElementById('particles-enabled');

    if (toggle && !toggle._pBound) {
      toggle._pBound = true;
      toggle.checked = !!settings.particlesEnabled;
      toggle.addEventListener('change', () => {
        settings.particlesEnabled = toggle.checked;
        runParticles();
        autoSave();
      });
    }

    // Anzahl
    const countEl = document.getElementById('particles-count');
    if (countEl && !countEl._pBound) {
      countEl._pBound = true;
      countEl.value = settings.particlesConfig?.count || 60;
      countEl.addEventListener('input', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        settings.particlesConfig.count = parseInt(countEl.value);
        runParticles(); autoSave();
      });
    }
    // Geschwindigkeit
    const speedEl = document.getElementById('particles-speed');
    if (speedEl && !speedEl._pBound) {
      speedEl._pBound = true;
      speedEl.value = (settings.particlesConfig?.speed || 0.8) * 10;
      speedEl.addEventListener('input', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        settings.particlesConfig.speed = parseInt(speedEl.value) / 10;
        runParticles(); autoSave();
      });
    }
    // Größe
    const sizeEl = document.getElementById('particles-size');
    if (sizeEl && !sizeEl._pBound) {
      sizeEl._pBound = true;
      sizeEl.value = (settings.particlesConfig?.size || 1.5) * 10;
      sizeEl.addEventListener('input', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        settings.particlesConfig.size = parseInt(sizeEl.value) / 10;
        runParticles(); autoSave();
      });
    }
    // Transparenz
    const opEl = document.getElementById('particles-opacity');
    if (opEl && !opEl._pBound) {
      opEl._pBound = true;
      opEl.value = Math.round((settings.particlesConfig?.opacity ?? 0.55) * 100);
      opEl.addEventListener('input', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        settings.particlesConfig.opacity = parseInt(opEl.value) / 100;
        const lbl = document.getElementById('particles-opacity-val');
        if (lbl) lbl.textContent = opEl.value + '%';
        runParticles(); autoSave();
      });
    }
    // Farbe
    const colorEl = document.getElementById('particles-color') || document.getElementById('particle-color');
    if (colorEl && !colorEl._pBound) {
      colorEl._pBound = true;
      colorEl.value = settings.particlesConfig?.color || '#30c5bb';
      colorEl.addEventListener('input', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        settings.particlesConfig.color = colorEl.value;
        runParticles(); autoSave();
      });
    }
    // Shapes
    document.querySelectorAll('.particle-shape-btn').forEach(btn => {
      if (btn._pBound) return;
      btn._pBound = true;
      const shape = btn.dataset.shape;
      const active = (settings.particlesConfig?.shapes || ['circle']).includes(shape);
      btn.classList.toggle('active', active);
      btn.style.opacity = active ? '1' : '0.4';
      btn.addEventListener('click', () => {
        settings.particlesConfig = settings.particlesConfig || {};
        let shapes = [...(settings.particlesConfig.shapes || ['circle'])];
        if (shapes.includes(shape)) {
          shapes = shapes.filter(s => s !== shape);
          if (!shapes.length) shapes = ['circle'];
        } else {
          shapes.push(shape);
        }
        settings.particlesConfig.shapes = shapes;
        document.querySelectorAll('.particle-shape-btn').forEach(b => {
          const active = shapes.includes(b.dataset.shape);
          b.classList.toggle('active', active);
          b.style.opacity = active ? '1' : '0.4';
        });
        runParticles(); autoSave();
      });
    });
  }

  window.setupParticles = function() { runParticles(); bindParticleUI(); };
  setTimeout(() => {
    if (settings?.particlesEnabled) runParticles();
    bindParticleUI();
  }, 600);
})();

// ── 3. DESIGN-OPTIONEN: Karten-Effekte ───────────────────────────────

(function bindDesignOptions() {
  setTimeout(() => {
    // Karten-Schatten
    const shadowToggle = document.getElementById('card-shadow-toggle');
    if (shadowToggle && !shadowToggle._doBound) {
      shadowToggle._doBound = true;
      shadowToggle.checked = settings.designOptions?.cardShadow !== false;
      shadowToggle.addEventListener('change', () => {
        settings.designOptions = settings.designOptions || {};
        settings.designOptions.cardShadow = shadowToggle.checked;
        document.documentElement.style.setProperty('--card-shadow',
          shadowToggle.checked ? '0 2px 12px rgba(0,0,0,.22)' : 'none');
        autoSave();
      });
    }
    // Karten-Hover-Zoom
    const zoomToggle = document.getElementById('card-zoom-toggle');
    if (zoomToggle && !zoomToggle._doBound) {
      zoomToggle._doBound = true;
      zoomToggle.checked = settings.designOptions?.hoverZoom !== false;
      zoomToggle.addEventListener('change', () => {
        settings.designOptions = settings.designOptions || {};
        settings.designOptions.hoverZoom = zoomToggle.checked;
        document.documentElement.style.setProperty('--card-hover-zoom',
          zoomToggle.checked ? 'translateY(-3px) scale(1.015)' : 'translateY(-2px)');
        autoSave();
      });
    }
    // Animationen
    const animToggle = document.getElementById('card-anim-toggle');
    if (animToggle && !animToggle._doBound) {
      animToggle._doBound = true;
      animToggle.checked = settings.designOptions?.animations !== false;
      animToggle.addEventListener('change', () => {
        settings.designOptions = settings.designOptions || {};
        settings.designOptions.animations = animToggle.checked;
        document.body.classList.toggle('no-animations', !animToggle.checked);
        autoSave();
      });
    }

    // Initiale CSS-Variablen setzen
    const do_ = settings.designOptions || {};
    document.documentElement.style.setProperty('--card-shadow',
      do_.cardShadow !== false ? '0 2px 12px rgba(0,0,0,.22)' : 'none');
    document.documentElement.style.setProperty('--card-hover-zoom',
      do_.hoverZoom !== false ? 'translateY(-3px) scale(1.015)' : 'translateY(-2px)');
    if (do_.animations === false) document.body.classList.add('no-animations');
  }, 500);
})();

// ── 4. PLUGIN BUTTONS: Farben ────────────────────────────────────────

(function stylePlugins() {
  const bind = () => {
    document.querySelectorAll('.plugin-preset-btn').forEach(btn => {
      const txt = (btn.textContent||'').toLowerCase().trim();
      // Erst klassen zurücksetzen
      btn.removeAttribute('style');
      if (txt.includes('deinstall') || txt.includes('entfern') || txt.includes('remove')) {
        btn.style.cssText = 'background:rgba(239,83,80,.12)!important;border:1px solid #ef5350!important;color:#ef5350!important;font-weight:600';
      } else if (txt.includes('install') || txt.includes('aktivier')) {
        btn.style.cssText = 'background:var(--acc)!important;color:#fff!important;border:none!important';
      }
    });
  };
  setTimeout(bind, 900);
  // Auch nach Tab-Wechsel
  document.getElementById('sms-plugins')?.addEventListener('click', () => setTimeout(bind, 200));
})();

// ── 5. WIDEVINE GUIDE: In Einstellungen verfügbar machen ─────────────

(function ensureWidevineGuideBtn() {
  setTimeout(() => {
    const btn = document.getElementById('btn-widevine-guide') ||
                document.querySelector('[data-widevine-guide]');
    if (btn && !btn._wvBound) {
      btn._wvBound = true;
      btn.addEventListener('click', () => {
        if (typeof openWidevineGuide === 'function') openWidevineGuide();
      });
    }
    // WideVine Status in Einstellungen aktualisieren
    if (typeof checkWidevineStatus === 'function') checkWidevineStatus();
  }, 800);
})();

// WideVine Guide Funktion (vollständig)
function openWidevineGuide() {
  const existing = document.getElementById('widevine-guide-overlay');
  if (existing) { existing.remove(); return; }
  const overlay = document.createElement('div');
  overlay.id = 'widevine-guide-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);width:min(660px,96%);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.7)">
      <div style="display:flex;align-items:center;padding:16px 20px;border-bottom:1px solid var(--bor)">
        <span style="font-size:20px;margin-right:10px">🔐</span>
        <span style="font-family:var(--font-d);font-size:16px;font-weight:800;color:var(--tx);flex:1">WideVine CDM installieren</span>
        <button onclick="document.getElementById('widevine-guide-overlay').remove()" style="border:none;background:transparent;color:var(--tx2);font-size:18px;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;padding:20px;flex:1;display:flex;flex-direction:column;gap:14px">
        <div style="background:rgba(239,83,80,.1);border:1px solid var(--danger);border-radius:var(--r-sm);padding:12px 16px;font-size:12px">
          ⚠ <b>Du brauchst genau 3 Dateien:</b><br><br>
          <b>Ordner 1:</b> <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">WidevineCdm\_platform_specific\win_x64\</code><br>
          &nbsp;&nbsp;→ <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">widevinecdm.dll</code> + <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">widevinecdm.dll.sig</code><br><br>
          <b>Ordner 2:</b> <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">WidevineCdm\</code> (eine Ebene höher)<br>
          &nbsp;&nbsp;→ <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">manifest.json</code>
        </div>
        <div style="background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);padding:12px 16px;font-size:12px">
          📁 In Chrome liegt die Struktur so: <code style="background:var(--bgc);padding:1px 5px;border-radius:3px">Chrome\Application\[Version]\WidevineCdm\</code><br>
          Dort siehst du: <b>manifest.json</b> (hier) und <b>_platform_specific\win_x64\</b> mit den 2 anderen Dateien.
        </div>
        ${[1,2,3,4,5].map((n,i) => {
          const steps = [
            {t:'Chrome-Ordner öffnen', d:'Klicke auf den Button um den WidevineCdm-Ordner von Chrome zu öffnen.',
             btns:[{l:'📁 Chrome',fn:"window._openWvFolder('chrome'"},{l:'📁 Edge',fn:"window._openWvFolder('edge'"}]},
            {t:'Versionsordner öffnen', d:'Öffne den Ordner mit der Versionsnummer (z.B. 4.10.x.x).'},
            {t:'manifest.json kopieren', d:'Kopiere die manifest.json aus dem WidevineCdm-Ordner in den OmniSight WidevineCdm-Ordner.',
             btns:[{l:'📁 Ziel WidevineCdm',fn:"window._openWvFolder('cdmBase'"}]},
            {t:'DLL + .sig kopieren', d:'Öffne _platform_specific → win_x64. Kopiere widevinecdm.dll und widevinecdm.dll.sig in den OmniSight win_x64-Ordner.',
             btns:[{l:'📁 Ziel win_x64',fn:"window._openWvFolder('dest'"}]},
            {t:'App neu starten', d:'Schließe OmniSight komplett und starte es neu. Netflix, Disney+ und Crunchyroll sollten jetzt funktionieren.', ok:true},
          ];
          const s = steps[i];
          return `<div style="display:flex;gap:10px">
            <div style="width:24px;height:24px;border-radius:50%;background:${s.ok?'#66bb6a':'var(--acc)'};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${n}</div>
            <div><div style="font-size:13px;font-weight:600;color:var(--tx);margin-bottom:3px">${s.t}</div>
            <div style="font-size:12px;color:var(--tx2)">${s.d}</div>
            ${s.btns?`<div style="display:flex;gap:6px;margin-top:6px">${s.btns.map(b=>`<button onclick="${b.fn})" style="padding:5px 12px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer">${b.l}</button>`).join('')}</div>`:''}
            </div></div>`;
        }).join('')}
      </div>
      <div style="padding:12px 20px;border-top:1px solid var(--bor);display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('widevine-guide-overlay').remove()" style="padding:8px 20px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-family:var(--font-d);font-weight:700;cursor:pointer">Verstanden</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// _openWvFolder: auch cdmBase öffnen
window._openWvFolder = async function(type) {
  try {
    const status = await window.electronAPI.getWidevineStatus();
    let targetPath = '';
    if (type === 'dest')    targetPath = status?.cdmDir  || '';
    else if (type === 'cdmBase') targetPath = status?.cdmBase || '';
    else if (type === 'chrome') targetPath = 'C:\\Program Files\\Google\\Chrome\\Application';
    else if (type === 'edge')   targetPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';
    if (!targetPath) { showToastMsg('Pfad nicht gefunden'); return; }
    window.electronAPI.openExternal('file:///' + targetPath.replace(/\\/g, '/'));
  } catch(e) { showToastMsg('Ordner konnte nicht geöffnet werden'); }
};

console.log('[v3.2.6] Miniplayer, Partikel, Design, WideVine, Plugins gepatcht');

// ════════════════════════════════════════════════════════════════════
// v3.2.7 FIXES
// ════════════════════════════════════════════════════════════════════

// ── 1. SUCHE: Außen-Klick WIRKLICH schließen ─────────────────────────

(function fixSearchClose() {
  // Jedes Mal wenn setupSearch() aufgerufen wurde, wurde ein neuer
  // 'mousedown' capture-Listener hinzugefügt. Wir nutzen ein Flag.
  if (window._searchCloseInstalled) return;
  window._searchCloseInstalled = true;

  document.addEventListener('mousedown', function(e) {
    const dd    = document.getElementById('search-dropdown');
    const input = document.getElementById('search-input');
    if (!dd || dd.style.display === 'none') return;

    const wrap = input?.closest('.search-bar') ||
                 input?.closest('.home-actions') ||
                 input?.parentElement;

    if (!wrap?.contains(e.target) && !dd.contains(e.target)) {
      dd.style.display = 'none';
    }
  }, true); // capture = true, läuft vor allen anderen Listenern
})();

// ── 2. UPDATE: Download/Install Buttons verdrahten ───────────────────

(function setupUpdateButtons() {
  setTimeout(() => {
    const dlBtn  = document.getElementById('btn-download-update');
    const instBtn= document.getElementById('btn-install-update');

    if (dlBtn && !dlBtn._updateBound) {
      dlBtn._updateBound = true;
      dlBtn.style.display = 'none'; // erst bei Update einblenden
      dlBtn.addEventListener('click', () => {
        dlBtn.textContent = '⬇ Lädt…';
        dlBtn.disabled    = true;
        window.electronAPI.downloadUpdate();
      });
    }

    if (instBtn && !instBtn._updateBound) {
      instBtn._updateBound = true;
      instBtn.style.display = 'none';
      instBtn.addEventListener('click', () => {
        instBtn.textContent = '↺ Wird installiert…';
        instBtn.disabled    = true;
        window.electronAPI.installUpdate();
      });
    }

    // onUpdateDownloaded: Install-Button einblenden
    window.electronAPI.onUpdateDownloaded?.(() => {
      if (dlBtn)   dlBtn.style.display   = 'none';
      if (instBtn) {
        instBtn.style.display   = 'flex';
        instBtn.disabled        = false;
        instBtn.textContent     = '↺ Jetzt installieren';
      }
      // Update-Check Ergebnis
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent = '✓ Update heruntergeladen – bereit zur Installation'; el.style.color = 'var(--acc)'; }
    });

    // Fortschritt
    window.electronAPI.onUpdateDownloadProgress?.((pct) => {
      if (dlBtn) dlBtn.textContent = `⬇ ${pct}%`;
    });
  }, 800);
})();

// ── 3. WIDEVINE GUIDE: In Einstellungen ──────────────────────────────

(function bindWidevineGuideBtn() {
  setTimeout(() => {
    const btn = document.getElementById('btn-widevine-guide');
    if (btn && !btn._wvBound) {
      btn._wvBound = true;
      btn.addEventListener('click', () => {
        if (typeof openWidevineGuide === 'function') openWidevineGuide();
        else console.warn('openWidevineGuide nicht gefunden');
      });
    }
  }, 700);
})();

// ── 4. MINIPLAYER: Auto-Aktivierung einstellbar ───────────────────────

// pip-auto-enable Toggle verdrahten
(function bindPipAutoToggle() {
  setTimeout(() => {
    const toggle = document.getElementById('pip-auto-enable');
    if (!toggle || toggle._pipBound) return;
    toggle._pipBound = true;
    toggle.checked = settings.pipAutoEnable !== false; // default: an
    toggle.addEventListener('change', () => {
      settings.pipAutoEnable = toggle.checked;
      autoSave();
      showToastMsg(toggle.checked ? '🎬 Miniplayer aktiviert sich automatisch' : '🎬 Miniplayer: manuell');
    });
  }, 700);
})();

// maybeMoveToPip: nur wenn pipAutoEnable aktiv
const _origMaybeMoveToPip = typeof maybeMoveToPip === 'function' ? maybeMoveToPip : null;
window.maybeMoveToPip = function() {
  // Nur automatisch wenn Einstellung aktiv
  if (settings.pipAutoEnable === false) return; // manuell deaktiviert
  if (typeof moveToPip === 'function' && window.moveToPip && currentWebview && currentProvider) {
    window.moveToPip(currentProvider, currentWebview);
  } else if (_origMaybeMoveToPip) {
    _origMaybeMoveToPip();
  }
};

// ── 5. KARTEN: Qualitäts-Badge ohne Hintergrund ──────────────────────

(function fixQualityBadge() {
  const style = document.createElement('style');
  style.textContent = `
    .card-quality-badge {
      background: transparent !important;
      color: rgba(255,255,255,0.6) !important;
      font-size: 9px !important;
      font-weight: 700 !important;
      padding: 0 !important;
      border-radius: 0 !important;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
    }
  `;
  document.head.appendChild(style);
})();

// ── 6. PROFIL-EDITOR: Komplett repariert ─────────────────────────────

// openProfileEditor überschreiben – sicher ohne Rekursion
window._openProfileEditorSafe = function(id) {
  const p = id ? (typeof profiles !== 'undefined' ? profiles.find(pr => pr.id === id) : null) : null;
  window._pedId     = id || null;
  window._pedAvatar = undefined;
  window._pedPin    = undefined;

  // Overlay holen
  const overlay = document.getElementById('profile-editor-overlay');
  if (!overlay) { console.warn('[Profile] Overlay nicht gefunden'); return; }

  // Felder befüllen
  const titleEl = document.getElementById('ped-title');
  const nameEl  = document.getElementById('ped-name');
  const prevEl  = document.getElementById('ped-avatar-preview');
  const pinEl   = document.getElementById('ped-pin-status');
  const delBtn  = document.getElementById('ped-delete');
  const cancelBtn = document.getElementById('ped-cancel');

  if (titleEl) titleEl.textContent = p ? 'Profil bearbeiten' : 'Neues Profil';
  if (nameEl)  { nameEl.value = p?.name || ''; setTimeout(() => nameEl.focus(), 100); }
  if (prevEl)  prevEl.innerHTML = p?.avatar
    ? `<img src="${p.avatar}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`
    : `<div style="width:56px;height:56px;border-radius:50%;background:var(--bgch);display:flex;align-items:center;justify-content:center;font-size:28px">👤</div>`;
  if (pinEl)   pinEl.textContent = p?.pin ? '🔒 PIN aktiv' : '🔓 Kein PIN';
  if (delBtn) {
    const canDelete = p && (typeof profiles !== 'undefined' ? profiles.length > 1 : false);
    delBtn.style.display = canDelete ? 'flex' : 'none';
  }

  overlay.style.display = 'flex';
  overlay.style.zIndex  = '4000';

  // Außen-Klick schließt (einmalig registrieren)
  if (!overlay._outsideClick) {
    overlay._outsideClick = true;
    overlay.addEventListener('mousedown', e => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        window._pedId = null;
      }
    });
  }
};

// Alle Edit-Trigger verdrahten (nach DOM-Aufbau)
(function bindProfileTriggers() {
  const bind = () => {
    // Stift-Buttons in Profil-Liste
    document.querySelectorAll('.profile-edit-trigger').forEach(btn => {
      if (btn._trigBound) return;
      btn._trigBound = true;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        window._openProfileEditorSafe(btn.dataset.profileId);
      });
    });
    // Neues Profil Button
    const newBtn = document.getElementById('btn-new-profile');
    if (newBtn && !newBtn._newBound) {
      newBtn._newBound = true;
      newBtn.addEventListener('click', () => window._openProfileEditorSafe(null));
    }
  };
  setTimeout(bind, 700);
  // Auch nach buildSidebarProfile neu binden
  const origBSP = window.buildSidebarProfile;
  if (typeof origBSP === 'function') {
    window.buildSidebarProfile = function() {
      origBSP.apply(this, arguments);
      setTimeout(bind, 100);
    };
  }
})();

// Profil-Editor Buttons: einmalig verdrahten ohne doppelte Handler
(function setupProfileEditorV327() {
  const bindEditorBtns = () => {
    const overlay = document.getElementById('profile-editor-overlay');
    if (!overlay || overlay._v327Done) return;
    overlay._v327Done = true;

    // SPEICHERN
    const saveBtn = document.getElementById('ped-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const pedId = window._pedId;
        const name  = (document.getElementById('ped-name')?.value || '').trim() || 'User';
        let pinSave = undefined;

        if (window._pedPin !== undefined) {
          if (!window._pedPin) {
            pinSave = null;
          } else if (/^\d{4,8}$/.test(String(window._pedPin))) {
            try { pinSave = await window.electronAPI.hashPin(String(window._pedPin)); }
            catch { pinSave = window._pedPin; }
          } else {
            pinSave = window._pedPin;
          }
        }

        if (typeof profiles === 'undefined') { showToastMsg('Fehler: profiles nicht definiert'); return; }

        if (pedId) {
          const idx = profiles.findIndex(p => p.id === pedId);
          if (idx >= 0) {
            profiles[idx].name = name;
            if (window._pedAvatar !== undefined) profiles[idx].avatar = window._pedAvatar;
            if (pinSave !== undefined) profiles[idx].pin = pinSave;
          }
        } else {
          profiles.push({
            id: 'profile_' + Date.now(), name,
            avatar: window._pedAvatar || null,
            pin: pinSave || null,
            favorites: [], watchlist: [], searchHistory: [], viewHistory: [],
          });
        }

        window.electronAPI.setProfiles(profiles);
        overlay.style.display = 'none';
        window._pedId = null; window._pedPin = undefined; window._pedAvatar = undefined;
        if (typeof buildSidebarProfile === 'function') buildSidebarProfile();
        showSaveToast();
      });
    }

    // ABBRECHEN
    document.getElementById('ped-cancel')?.addEventListener('click', () => {
      overlay.style.display = 'none';
      window._pedId = null;
    });

    // LÖSCHEN
    document.getElementById('ped-delete')?.addEventListener('click', async () => {
      const pedId = window._pedId;
      if (!pedId || !profiles || profiles.length <= 1) { showToastMsg('Mindestens 1 Profil erforderlich'); return; }
      const profile = profiles.find(p => p.id === pedId);
      if (!profile) return;

      if (profile.pin) {
        const entered = prompt(`PIN für "${profile.name}" eingeben:`);
        if (entered === null) return;
        let valid = false;
        try { valid = await window.electronAPI.verifyPin(String(entered), profile.pin); }
        catch { valid = String(entered) === String(profile.pin); }
        if (!valid) { showToastMsg('Falscher PIN'); return; }
      }
      if (!confirm(`Profil "${profile.name}" wirklich löschen?`)) return;

      profiles = profiles.filter(p => p.id !== pedId);
      window.electronAPI.setProfiles(profiles);
      overlay.style.display = 'none';
      window._pedId = null;
      if (activeProfileId === pedId) {
        if (typeof switchProfile === 'function') switchProfile(profiles[0].id);
      } else {
        if (typeof buildSidebarProfile === 'function') buildSidebarProfile();
      }
      showToastMsg('Profil gelöscht');
    });

    // AVATAR
    document.getElementById('ped-pick-avatar')?.addEventListener('click', async () => {
      const r = await window.electronAPI.pickImage('avatar').catch(() => null);
      if (!r) return;
      const url = r.base64 || r.filePath || r;
      window._pedAvatar = url;
      const prev = document.getElementById('ped-avatar-preview');
      if (prev) prev.innerHTML = `<img src="${url}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`;
    });

    // PIN
    document.getElementById('ped-set-pin')?.addEventListener('click', async () => {
      const pedId   = window._pedId;
      const profile = pedId ? profiles?.find(p => p.id === pedId) : null;
      if (profile?.pin) {
        const old = prompt('Aktuellen PIN eingeben:');
        if (old === null) return;
        let valid = false;
        try { valid = await window.electronAPI.verifyPin(String(old), profile.pin); }
        catch { valid = String(old) === String(profile.pin); }
        if (!valid) { showToastMsg('Falscher PIN'); return; }
      }
      const newPin = prompt('Neuen PIN (4-8 Ziffern, leer = entfernen):');
      if (newPin === null) return;
      if (newPin === '') {
        window._pedPin = '';
        const ps = document.getElementById('ped-pin-status');
        if (ps) ps.textContent = '🔓 PIN wird entfernt';
        showToastMsg('PIN wird beim Speichern entfernt');
        return;
      }
      if (!/^\d{4,8}$/.test(newPin)) { showToastMsg('PIN: 4-8 Ziffern'); return; }
      window._pedPin = newPin;
      const ps = document.getElementById('ped-pin-status');
      if (ps) ps.textContent = '🔒 Neuer PIN (noch nicht gespeichert)';
      showToastMsg('PIN gesetzt – Speichern nicht vergessen!');
    });
  };

  setTimeout(bindEditorBtns, 800);
})();

// openProfileEditor global überschreiben
window.openProfileEditor = function(id) {
  window._openProfileEditorSafe(id);
};

console.log('[v3.2.7] Suche, Update, WideVine, PIP, Karte, Profil gepatcht');