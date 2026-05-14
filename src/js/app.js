'use strict';

// ════════════════════════════════
// PROVIDER CONFIG (alphabetisch)
// ════════════════════════════════
const PROVIDERS = {
  apple:        { name:'Apple TV+',      tag:'Apple Originals',          url:'https://tv.apple.com',              color:'#555555', partition:'persist:apple' },
  ard:          { name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.ardmediathek.de',       color:'#003D6B', partition:'persist:ard' },
  burning:      { name:'BurningSeries',  tag:'Serien & Anime',            url:'https://bs.to',                     color:'#C0392B', partition:'persist:burning' },
  cineto:       { name:'Cine.to',        tag:'Filme & Serien',            url:'https://cine.to',                   color:'#8B5CF6', partition:'persist:cineto' },
  crunchyroll:  { name:'Crunchyroll',    tag:'Anime & Manga',             url:'https://www.crunchyroll.com',       color:'#F47521', partition:'persist:crunchyroll' },
  dazn:         { name:'DAZN',           tag:'Sport Live-Streams',        url:'https://www.dazn.com',              color:'#F8D200', partition:'persist:dazn' },
  disney:       { name:'Disney+',        tag:'Marvel, Star Wars & mehr',  url:'https://www.disneyplus.com',        color:'#113CCF', partition:'persist:disney' },
  hbomax:       { name:'Max (HBO)',       tag:'HBO Originals & mehr',      url:'https://www.max.com',               color:'#0031DB', partition:'persist:hbomax' },
  joyn:         { name:'Joyn',           tag:'Kostenlos streamen',        url:'https://www.joyn.de',               color:'#E4001B', partition:'persist:joyn' },
  mubi:         { name:'MUBI',           tag:'Arthouse & Kino',           url:'https://mubi.com',                  color:'#213F5E', partition:'persist:mubi' },
  netflix:      { name:'Netflix',        tag:'Filme & Serien',            url:'https://www.netflix.com',           color:'#E50914', partition:'persist:netflix' },
  paramountplus:{ name:'Paramount+',     tag:'Paramount Originals',       url:'https://www.paramountplus.com',     color:'#0064FF', partition:'persist:paramountplus' },
  prime:        { name:'Prime Video',    tag:'Amazon Originals',          url:'https://www.primevideo.com',        color:'#00A8E1', partition:'persist:prime' },
  rtl:          { name:'RTL+',           tag:'RTL Serien & Shows',        url:'https://plus.rtl.de',               color:'#FF6B00', partition:'persist:rtl' },
  skygo:        { name:'Sky Go',         tag:'Sky Serien & Sport',        url:'https://www.sky.de/entertainment/sky-go', color:'#00205B', partition:'persist:skygo' },
  twitch:       { name:'Twitch',         tag:'Live-Streams & Gaming',     url:'https://www.twitch.tv',             color:'#9146FF', partition:'persist:twitch' },
  youtube:      { name:'YouTube',        tag:'Videos & Streams',          url:'https://www.youtube.com',           color:'#FF0000', partition:'persist:youtube' },
  zdf:          { name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.zdf.de',                color:'#163A6A', partition:'persist:zdf' },
};

// Favicons (Google S2 Favicon-Service als Fallback)
function getFaviconUrl(id) {
  const urls = {
    apple:        'https://tv.apple.com/favicon.ico',
    ard:          'https://www.ardmediathek.de/favicon.ico',
    burning:      'https://bs.to/favicon.ico',
    cineto:       'https://cine.to/favicon.ico',
    crunchyroll:  'https://www.crunchyroll.com/favicon.ico',
    dazn:         'https://www.dazn.com/favicon.ico',
    disney:       'https://www.disneyplus.com/favicon.ico',
    hbomax:       'https://www.max.com/favicon.ico',
    joyn:         'https://www.joyn.de/favicon.ico',
    mubi:         'https://mubi.com/favicon.ico',
    netflix:      'https://www.netflix.com/favicon.ico',
    paramountplus:'https://www.paramountplus.com/favicon.ico',
    prime:        'https://www.primevideo.com/favicon.ico',
    rtl:          'https://plus.rtl.de/favicon.ico',
    skygo:        'https://www.sky.de/favicon.ico',
    twitch:       'https://www.twitch.tv/favicon.ico',
    youtube:      'https://www.youtube.com/favicon.ico',
    zdf:          'https://www.zdf.de/favicon.ico',
  };
  return urls[id] || `https://www.google.com/s2/favicons?sz=32&domain=${PROVIDERS[id]?.url}`;
}

// SVG-Logos für Karten-Banner
const LOGOS = {
  netflix:      `<svg viewBox="0 0 111 30" fill="currentColor" height="24"><path d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.468 0h5.063l3.062 7.874L105.875 0h5.124l-5.937 14.28zM90.47 0h-4.594v27.25c1.5.094 3.062.156 4.594.343V0zm-8.937 26.937c-4.187-.281-8.375-.53-12.656-.625V0h4.595v21.875c2.75.062 5.5.281 8.061.438v4.624zM64.25 10.657v4.594h-6.406V26H53.22V0h13.125v4.657H57.844v6h6.406zM44.7 26.25c-1.719 0-3.469-.094-5.188-.156V4.657H34.45V0h15.344v4.657H44.7V26.25zM23.044 5.688L16.5 26.937c-1.532-.062-3.063-.094-4.594-.094l-6.75-21.156v21.25H.5V0h6.313l6.843 21.563L19.5 0H26v26.937c-1-.031-1.969-.094-2.956-.094V5.688z"/></svg>`,
  prime:        `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:18px;font-weight:800;letter-spacing:-.5px">prime</span><span style="font-size:7px;letter-spacing:.18em;font-weight:700;opacity:.6">VIDEO</span></div>`,
  disney:       `<div style="display:flex;align-items:baseline;gap:2px"><span style="font-family:Georgia,serif;font-size:22px;font-weight:bold">Disney</span><span style="font-size:24px;font-weight:900;color:#4FC3F7;line-height:1">+</span></div>`,
  crunchyroll:  `<svg viewBox="0 0 200 45" height="26" fill="currentColor"><text x="2" y="36" font-family="sans-serif" font-size="34" font-weight="900">crunchyroll</text></svg>`,
  burning:      `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><svg viewBox="0 0 40 44" height="30" fill="none"><path d="M20 2C12 2 5 10 6 20C7 28 13 34 20 40C27 34 33 28 34 20C35 10 28 2 20 2Z" fill="#C0392B"/><path d="M20 12C17 16 15 21 18 25C21 29 24 24 23 20C22 17 20 14 20 12Z" fill="white" opacity=".85"/></svg><span style="font-size:8px;font-weight:700;letter-spacing:.05em;opacity:.8">BurningSeries</span></div>`,
  cineto:       `<svg viewBox="0 0 120 42" height="26" fill="currentColor"><text x="2" y="34" font-family="sans-serif" font-size="36" font-weight="900" letter-spacing="-1">cine.to</text></svg>`,
  youtube:      `<svg viewBox="0 0 90 22" height="22" fill="currentColor"><path d="M27.97 3.66s-.29-2.07-1.19-2.98c-1.14-1.2-2.41-1.2-3-1.27C20.54-.08 15 0 15 0H14.99S9.46-.08 6.22.41c-.58.07-1.86.07-3 1.27C2.32 2.59 2.03 4.66 2.03 4.66S1.74 7.09 1.74 9.52v2.27c0 2.43.29 4.86.29 4.86s.29 2.07 1.19 2.98c1.14 1.2 2.63 1.16 3.3 1.28C8.45 21 15 21 15 21s5.54-.08 7.78-.57c.58-.07 1.86-.07 3-1.27.9-.91 1.19-2.98 1.19-2.98s.29-2.43.29-4.86V9.52c0-2.43-.29-4.86-.29-4.86zM12.06 13.72V6.26l8.1 3.74-8.1 3.72z"/><text x="32" y="16" font-family="sans-serif" font-size="15" font-weight="700">YouTube</text></svg>`,
  twitch:       `<svg viewBox="0 0 100 26" height="26" fill="currentColor"><path d="M2.15 0L0 5.52v19.24h6.62V28h3.72l3.72-3.24h5.66L27 17V0H2.15zm22.54 15.93l-4.44 3.86H13.6l-3.72 3.24v-3.24H4.3V2.31h20.38v13.62zm-4.44-8.97v7.72h-2.3V6.96h2.3zm-6.16 0v7.72h-2.3V6.96h2.3z"/><text x="32" y="19" font-family="sans-serif" font-size="17" font-weight="800">Twitch</text></svg>`,
  dazn:         `<svg viewBox="0 0 80 30" height="28" fill="currentColor"><text x="0" y="26" font-family="sans-serif" font-size="30" font-weight="900" letter-spacing="-1">DAZN</text></svg>`,
  hbomax:       `<svg viewBox="0 0 80 28" height="26" fill="currentColor"><text x="0" y="23" font-family="sans-serif" font-size="26" font-weight="900">max</text></svg>`,
  joyn:         `<svg viewBox="0 0 70 28" height="26" fill="currentColor"><text x="0" y="23" font-family="sans-serif" font-size="26" font-weight="900">joyn</text></svg>`,
  mubi:         `<svg viewBox="0 0 80 28" height="26" fill="currentColor"><text x="0" y="23" font-family="sans-serif" font-size="26" font-weight="900">MUBI</text></svg>`,
  apple:        `<svg viewBox="0 0 110 28" height="24" fill="currentColor"><text x="0" y="22" font-family="sans-serif" font-size="20" font-weight="700">Apple TV+</text></svg>`,
  paramountplus:`<svg viewBox="0 0 120 28" height="24" fill="currentColor"><text x="0" y="22" font-family="sans-serif" font-size="18" font-weight="700">Paramount+</text></svg>`,
  rtl:          `<svg viewBox="0 0 70 28" height="26" fill="currentColor"><text x="0" y="23" font-family="sans-serif" font-size="26" font-weight="900">RTL+</text></svg>`,
  skygo:        `<svg viewBox="0 0 90 28" height="26" fill="currentColor"><text x="0" y="23" font-family="sans-serif" font-size="22" font-weight="800">Sky Go</text></svg>`,
  ard:          `<svg viewBox="0 0 110 28" height="24" fill="currentColor"><text x="0" y="22" font-family="sans-serif" font-size="17" font-weight="700">ARD Mediathek</text></svg>`,
  zdf:          `<svg viewBox="0 0 120 28" height="24" fill="currentColor"><text x="0" y="22" font-family="sans-serif" font-size="17" font-weight="700">ZDF Mediathek</text></svg>`,
};

// ════════════════════════════════
// STATE
// ════════════════════════════════
let currentProvider  = null;   // aktiver Stream-Provider
let currentWebview   = null;   // Webview im Stream-View
let pipWebview       = null;   // Webview im PiP-Fenster
let pipProviderId    = null;   // Provider-ID im PiP
let isFullscreen     = false;
let fsHoverTimer     = null;
let fsAutoHide       = null;
let clockInterval    = null;
let settings         = {};
let imgEditorState   = { providerId: null, url: '', x: 0, y: 0 };

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  // Defaults sicherstellen
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.clock            = settings.clock            || { enabled:false, position:'bottom-right', color:'#ffffff', opacity:0.85 };

  applySettings(settings, false);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  buildProviderGrid();
  buildSidebarSubMenus();

  setupTitlebar();
  setupThemeToggle();
  setupNavigation();
  setupStreamControls();
  setupSettingsPanel();
  setupFullscreenExit();
  setupESCKey();
  setupPip();
  setupClock();

  window.electronAPI.onFullscreenChange(v => { isFullscreen = v; updateFullscreenUI(); });
  window.electronAPI.onSessionsCleared(() => buildSettingsAccountTab());

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
}

// ════════════════════════════════
// THEME
// ════════════════════════════════
function setTheme(t, save = true) {
  document.documentElement.setAttribute('data-theme', t);
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t === 'light');
  if (save) window.electronAPI.setTheme(t);
}
function setupThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('change', e => setTheme(e.target.checked ? 'light' : 'dark'));
}

// ════════════════════════════════
// SETTINGS ANWENDEN
// ════════════════════════════════
const DEFAULTS = { appBg:'', appBgImage:'', cardBg:'', accentColor:'#7c6cff', cardImages:{}, cardImageOffsets:{}, logoImage:'', favorites:[], clock:{ enabled:false, position:'bottom-right', color:'#ffffff', opacity:0.85 } };

function applySettings(s, save = true) {
  const root = document.documentElement;

  // Hintergrund
  if (s.appBgImage) {
    document.body.style.backgroundImage    = `url("${s.appBgImage}")`;
    document.body.style.backgroundSize     = 'cover';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
    if (s.appBg) root.style.setProperty('--bg', s.appBg);
    else         root.style.removeProperty('--bg');
  }

  if (s.cardBg) root.style.setProperty('--bgc', s.cardBg);
  else          root.style.removeProperty('--bgc');

  root.style.setProperty('--acc', s.accentColor || '#7c6cff');

  // Logo
  const li = document.getElementById('logo-img');
  const ls = document.getElementById('logo-svg');
  if (s.logoImage && li && ls) { li.src = s.logoImage; li.style.display = 'block'; ls.style.display = 'none'; }
  else if (li && ls)           { li.style.display = 'none'; ls.style.display = 'block'; }

  // Karten-Bilder & Offsets
  Object.entries(s.cardImages || {}).forEach(([id, url]) => {
    const banner = document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
    if (!banner) return;
    if (url) {
      const off = (s.cardImageOffsets || {})[id] || { x:0, y:0 };
      banner.style.backgroundImage    = `url("${url}")`;
      banner.style.backgroundPosition = `calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;
      banner.style.opacity = '1';
    } else {
      banner.style.backgroundImage = '';
      banner.style.opacity = '0';
    }
  });

  // Uhr
  setupClock();

  if (save) window.electronAPI.setSettings(s);
}

// ════════════════════════════════
// TITLEBAR
// ════════════════════════════════
function setupTitlebar() {
  document.getElementById('btn-minimize')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',    () => window.electronAPI.close());
}

// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (v === 'home') { maybeMinimizeToPin(); showView('home'); }
      else showView(v);
    });
  });

  setupToggle('nav-fav-toggle',       'nav-sub-favorites');
  setupToggle('nav-providers-toggle', 'nav-sub-providers');
}

function setupToggle(btnId, subId) {
  const btn = document.getElementById(btnId);
  const sub = document.getElementById(subId);
  btn?.addEventListener('click', () => {
    btn.classList.toggle('open');
    sub?.classList.toggle('open');
  });
}

// ════════════════════════════════
// PROVIDER GRID & SIDEBAR AUFBAUEN
// ════════════════════════════════
function buildProviderGrid() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const favs = settings.favorites || [];
  const sorted = Object.entries(PROVIDERS).sort((a,b) => a[1].name.localeCompare(b[1].name));

  // Favoriten-Sektion
  const favEntries = sorted.filter(([id]) => favs.includes(id));
  const restEntries = sorted.filter(([id]) => !favs.includes(id));

  if (favEntries.length) {
    const lbl = document.createElement('div');
    lbl.className = 'grid-section-label';
    lbl.textContent = '⭐ Favoriten';
    grid.appendChild(lbl);
    favEntries.forEach(([id, p]) => grid.appendChild(createProviderCard(id, p, true)));
  }

  if (restEntries.length) {
    if (favEntries.length) {
      const lbl = document.createElement('div');
      lbl.className = 'grid-section-label';
      lbl.textContent = 'Alle Anbieter';
      grid.appendChild(lbl);
    }
    restEntries.forEach(([id, p]) => grid.appendChild(createProviderCard(id, p, false)));
  }
}

function createProviderCard(id, p, isFav) {
  const card = document.createElement('div');
  card.className = 'provider-card';
  card.dataset.id = id;
  card.style.setProperty('--card-color', p.color);

  const imgUrl = (settings.cardImages || {})[id] || '';
  const off    = (settings.cardImageOffsets || {})[id] || { x:0, y:0 };

  card.innerHTML = `
    <button class="card-star ${isFav ? 'active' : ''}" data-id="${id}" title="${isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">
      <svg width="13" height="13" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" ${isFav ? 'fill="currentColor"' : 'fill="none"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </button>
    <div class="card-banner">
      <div class="card-banner-img" style="background-image:${imgUrl ? `url('${imgUrl}')` : 'none'};background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:${imgUrl ? 1 : 0};transition:opacity .3s"></div>
      <div class="card-banner-logo-bg"><img src="${getFaviconUrl(id)}" onerror="this.style.display='none'" alt=""/></div>
      <div class="card-banner-overlay"></div>
      <div class="card-banner-circle"></div>
      <div class="card-logo">${LOGOS[id] || `<span style="font-size:18px;font-weight:800">${p.name}</span>`}</div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <span class="card-name">${p.name}</span>
        <span class="card-tag">${p.tag}</span>
      </div>
      <span class="card-arrow">→</span>
    </div>
  `;

  // Stern-Klick
  card.querySelector('.card-star').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(id);
  });

  // Karte-Klick → Provider öffnen
  card.addEventListener('click', e => {
    if (e.target.closest('.card-star')) return;
    openProvider(id);
  });

  return card;
}

function toggleFavorite(id) {
  const favs = settings.favorites || [];
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  settings.favorites = favs;
  window.electronAPI.setSettings(settings);
  buildProviderGrid();
  buildSidebarSubMenus();
}

// ════════════════════════════════
// SIDEBAR UNTERMENÜS
// ════════════════════════════════
function buildSidebarSubMenus() {
  buildFavoritesSubMenu();
  buildProvidersSubMenu();
}

function buildFavoritesSubMenu() {
  const sub  = document.getElementById('nav-sub-favorites');
  if (!sub) return;
  sub.innerHTML = '';
  const favs = settings.favorites || [];
  if (!favs.length) {
    const hint = document.createElement('div');
    hint.style.cssText = 'padding:6px 10px;font-size:11px;color:var(--tx3)';
    hint.textContent = 'Noch keine Favoriten';
    sub.appendChild(hint);
    return;
  }
  favs.forEach(id => {
    const p = PROVIDERS[id];
    if (!p) return;
    sub.appendChild(createSubBtn(id, p));
  });
}

function buildProvidersSubMenu() {
  const sub = document.getElementById('nav-sub-providers');
  if (!sub) return;
  sub.innerHTML = '';
  Object.entries(PROVIDERS)
    .sort((a,b) => a[1].name.localeCompare(b[1].name))
    .forEach(([id, p]) => sub.appendChild(createSubBtn(id, p)));
}

function createSubBtn(id, p) {
  const btn = document.createElement('button');
  btn.className = 'nav-sub-btn';
  btn.dataset.id = id;
  btn.innerHTML = `<img src="${getFaviconUrl(id)}" onerror="this.outerHTML='<span class=\\'dot\\' style=\\'background:${p.color}\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${p.name}`;
  btn.addEventListener('click', () => openProvider(id));
  return btn;
}

// ════════════════════════════════
// PROVIDER ÖFFNEN
// ════════════════════════════════
function openProvider(id) {
  const p = PROVIDERS[id];
  if (!p) return;

  // Laufenden Stream → PiP
  if (currentWebview && currentProvider && currentProvider !== id) {
    moveToPip(currentProvider, currentWebview);
    currentWebview  = null;
    currentProvider = null;
  }

  // War schon PiP für diesen Provider? → zurückholen
  if (pipProviderId === id) {
    restoreFromPip();
    return;
  }

  currentProvider = id;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent = p.name;
  document.getElementById('btn-watching').style.display = 'flex';

  window.electronAPI.setupWebviewSession(p.partition);

  // Alten Webview im Stream-View entfernen (nicht den PiP!)
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';

  const wv = document.createElement('webview');
  wv.setAttribute('src', p.url);
  wv.setAttribute('partition', p.partition);
  wv.setAttribute('allowpopups', '');
  wv.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  wv.style.cssText = 'width:100%;height:100%;border:none;display:flex';

  currentWebview = wv;
  if (wrap) wrap.appendChild(wv);

  wv.addEventListener('did-start-loading', () => showLoading(`${p.name} wird geladen…`));
  wv.addEventListener('did-stop-loading',  () => hideLoading());
  wv.addEventListener('did-fail-load', async e => {
    if (e.errorCode === -3 || e.errorCode === 0) return;
    hideLoading();
    let diag = '';
    try {
      const r = await window.electronAPI.checkUrl(p.url);
      diag = r.ok
        ? `Webseite erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`
        : `Verbindungsfehler: ${r.error}`;
    } catch {}
    showWebviewError(p, e.errorCode, e.errorDescription, diag);
  });

  showView('stream');
}

// ════════════════════════════════
// STREAM STOPPEN (zurück zur Main Page)
// ════════════════════════════════
function stopStream() {
  if (isFullscreen) window.electronAPI.setFullscreen(false);
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';
  currentWebview  = null;
  currentProvider = null;
  // PiP bleibt unverändert
  showView('home');
}

// ════════════════════════════════
// ZURÜCK (ohne Stream zu stoppen)
// ════════════════════════════════
function goBack() {
  if (isFullscreen) window.electronAPI.setFullscreen(false);
  // Stream läuft weiter, View wechseln
  maybeMinimizeToPin();
  showView('home');
}

// Falls Stream läuft und wir die View verlassen → PiP
function maybeMinimizeToPin() {
  if (currentWebview && currentProvider) {
    moveToPip(currentProvider, currentWebview);
    currentWebview  = null;
    currentProvider = null;
  }
}

// ════════════════════════════════
// PiP
// ════════════════════════════════
function setupPip() {
  const pip = document.getElementById('pip-window');

  // Drag & Drop
  let drag = false, ox = 0, oy = 0;
  const topbar = document.getElementById('pip-topbar');
  topbar?.addEventListener('mousedown', e => {
    drag = true;
    const r = pip.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    let nx = e.clientX - ox;
    let ny = e.clientY - oy;
    nx = Math.max(0, Math.min(window.innerWidth  - pip.offsetWidth,  nx));
    ny = Math.max(0, Math.min(window.innerHeight - pip.offsetHeight, ny));
    pip.style.left   = nx + 'px';
    pip.style.top    = ny + 'px';
    pip.style.right  = 'auto';
    pip.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', () => { drag = false; });

  // Expand → zurück zum großen Fenster
  document.getElementById('pip-expand')?.addEventListener('click', restoreFromPip);

  // Close
  document.getElementById('pip-close')?.addEventListener('click', () => {
    const pip = document.getElementById('pip-window');
    pip.style.display = 'none';
    document.getElementById('pip-content').innerHTML = '';
    pipWebview    = null;
    pipProviderId = null;
  });
}

function moveToPip(providerId, webview) {
  const pip     = document.getElementById('pip-window');
  const content = document.getElementById('pip-content');
  const title   = document.getElementById('pip-title');
  if (!pip || !content) return;

  // Alten PiP-Inhalt entfernen
  content.innerHTML = '';

  // Den laufenden Webview in den PiP verschieben
  // Da wir den DOM-Node nicht direkt verschieben können ohne Reload,
  // erstellen wir einen neuen Webview mit gleicher Partition & URL
  const p  = PROVIDERS[providerId];
  if (!p) return;

  const newWv = document.createElement('webview');
  newWv.setAttribute('partition', p.partition);
  newWv.setAttribute('src', p.url);
  newWv.setAttribute('allowpopups', '');
  newWv.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  newWv.style.cssText = 'width:100%;height:100%;border:none;display:flex';

  content.appendChild(newWv);
  pipWebview    = newWv;
  pipProviderId = providerId;

  if (title) title.textContent = p.name;
  pip.style.display = 'flex';
}

function restoreFromPip() {
  if (!pipProviderId) return;
  const id = pipProviderId;

  // PiP schließen
  const pip = document.getElementById('pip-window');
  pip.style.display = 'none';
  document.getElementById('pip-content').innerHTML = '';
  pipWebview    = null;
  pipProviderId = null;

  // Provider normal öffnen
  openProvider(id);
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function setupStreamControls() {
  // Zurück: Stream → PiP, Home anzeigen
  document.getElementById('back-btn')?.addEventListener('click', goBack);

  // Stop: Stream beenden, Home
  document.getElementById('btn-stop')?.addEventListener('click', () => {
    if (!confirm('Stream beenden und zur Übersicht zurückkehren?')) return;
    stopStream();
  });

  // Miniplayer
  document.getElementById('btn-pip')?.addEventListener('click', () => {
    if (currentWebview && currentProvider) {
      moveToPip(currentProvider, currentWebview);
      currentWebview  = null;
      currentProvider = null;
      showView('home');
    }
  });

  // Vollbild
  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    window.electronAPI.setFullscreen(!isFullscreen);
  });

  // Abmelden
  document.getElementById('btn-logout-provider')?.addEventListener('click', () => {
    if (!currentProvider) return;
    const p = PROVIDERS[currentProvider];
    if (!confirm(`Von ${p.name} abmelden?`)) return;
    window.electronAPI.clearProviderSession(currentProvider);
    if (currentWebview) currentWebview.loadURL(p.url);
    buildSettingsAccountTab();
  });
}

// ════════════════════════════════
// VOLLBILD
// ════════════════════════════════
function updateFullscreenUI() {
  const topbar  = document.getElementById('stream-topbar');
  const sidebar = document.getElementById('sidebar');
  const tb      = document.getElementById('titlebar');
  const wrap    = document.getElementById('webview-wrap');
  const btn     = document.getElementById('btn-fullscreen');

  if (isFullscreen) {
    [topbar, sidebar, tb].forEach(el => el?.classList.add('hidden'));
    if (wrap) { wrap.style.cssText = 'position:fixed;inset:0;z-index:500;background:#000'; }
    if (btn)  { btn.innerHTML = svgMinimize() + ' Beenden'; }
  } else {
    [topbar, sidebar, tb].forEach(el => el?.classList.remove('hidden'));
    if (wrap) { wrap.style.cssText = ''; }
    if (btn)  { btn.innerHTML = svgFullscreen() + ' Vollbild'; }
    document.getElementById('fs-exit-btn')?.classList.remove('visible');
  }
}

function svgFullscreen() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`; }
function svgMinimize()   { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`; }

// ════════════════════════════════
// VOLLBILD EXIT (1 Sek hover in 3×3 cm Bereich)
// ════════════════════════════════
function setupFullscreenExit() {
  const btn = document.getElementById('fs-exit-btn');
  if (!btn) return;

  document.addEventListener('mousemove', e => {
    if (!isFullscreen) return;
    const zone = 113; // ~3cm bei 96dpi
    const cx   = window.innerWidth / 2;
    const inZ  = Math.abs(e.clientX - cx) < zone / 2 && e.clientY < zone;

    if (inZ) {
      if (!fsHoverTimer) {
        fsHoverTimer = setTimeout(() => {
          btn.classList.add('visible');
          clearTimeout(fsAutoHide);
          fsAutoHide = setTimeout(() => btn.classList.remove('visible'), 3000);
        }, 1000);
      }
    } else {
      clearTimeout(fsHoverTimer);
      fsHoverTimer = null;
    }
  });

  btn.addEventListener('click', () => {
    window.electronAPI.setFullscreen(false);
    btn.classList.remove('visible');
  });
}

function setupESCKey() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isFullscreen) window.electronAPI.setFullscreen(false);
  });
}

// ════════════════════════════════
// EINSTELLUNGEN
// ════════════════════════════════
function setupSettingsPanel() {
  const panel   = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');

  document.getElementById('btn-settings')?.addEventListener('click', openSettings);
  document.getElementById('settings-close')?.addEventListener('click', closeSettings);
  overlay?.addEventListener('click', closeSettings);

  // Tabs
  document.querySelectorAll('.stab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.stab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`stab-${tab.dataset.tab}`)?.classList.add('active');
      if (tab.dataset.tab === 'account') buildSettingsAccountTab();
      if (tab.dataset.tab === 'cards')   buildSettingsCardTab();
    });
  });

  // Color pickers
  linkColor('set-app-bg-color', 'set-app-bg-text');
  linkColor('set-card-bg-color','set-card-bg-text');
  linkColor('set-accent-color', 'set-accent-text');
  linkColor('clock-color',      'clock-color-text');

  // Reset
  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.reset;
      settings[key] = JSON.parse(JSON.stringify(DEFAULTS[key] ?? ''));
      syncSettingsUI();
      applySettings(settings);
      if (key.includes('card')) buildSettingsCardTab();
    });
  });

  // Bild-Pick
  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => handlePickImage(btn.dataset.pick));
  });

  // Uhr-Slider
  const opSlider = document.getElementById('clock-opacity');
  const opVal    = document.getElementById('clock-opacity-val');
  opSlider?.addEventListener('input', () => { opVal.textContent = opSlider.value + '%'; });

  // Speichern
  document.getElementById('settings-save')?.addEventListener('click', () => {
    settings.appBg       = document.getElementById('set-app-bg-text').value.trim();
    settings.cardBg      = document.getElementById('set-card-bg-text').value.trim();
    settings.accentColor = document.getElementById('set-accent-text').value.trim() || '#7c6cff';
    settings.clock = {
      enabled:  document.getElementById('clock-enabled').checked,
      position: document.getElementById('clock-position').value,
      color:    document.getElementById('clock-color-text').value.trim() || '#ffffff',
      opacity:  parseInt(document.getElementById('clock-opacity').value) / 100,
    };
    applySettings(settings);
    closeSettings();
  });

  // Alle abmelden
  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von ALLEN Diensten abmelden?')) return;
    window.electronAPI.clearAllSessions();
    buildSettingsAccountTab();
  });

  syncSettingsUI();
}

function openSettings() {
  document.getElementById('settings-panel')?.classList.add('open');
  document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();
  buildSettingsCardTab();
}

function closeSettings() {
  document.getElementById('settings-panel')?.classList.remove('open');
  document.getElementById('settings-overlay')?.classList.remove('open');
}

async function handlePickImage(dest) {
  const url = await window.electronAPI.pickImage(dest);
  if (!url) return;
  if (dest === 'logo') {
    settings.logoImage = url;
    updatePreview('prev-logo', url);
    applySettings(settings);
  } else if (dest === 'appBgImage') {
    settings.appBgImage = url;
    updatePreview('prev-app-bg', url);
    applySettings(settings);
  } else if (dest.startsWith('card_')) {
    const id = dest.replace('card_','');
    settings.cardImages = settings.cardImages || {};
    settings.cardImages[id] = url;
    applySettings(settings);
    buildProviderGrid();
    buildSettingsCardTab();
    openImageEditor(id, url);
  }
}

function updatePreview(id, url) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;
}

function linkColor(cId, tId) {
  const c = document.getElementById(cId);
  const t = document.getElementById(tId);
  if (!c || !t) return;
  c.addEventListener('input', () => { t.value = c.value; });
  t.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(t.value)) c.value = t.value; });
}

function syncSettingsUI() {
  const s = settings;
  setColorPair('set-app-bg-color', 'set-app-bg-text',   s.appBg      ||'#0a0a0f', s.appBg      ||'');
  setColorPair('set-card-bg-color','set-card-bg-text',   s.cardBg     ||'#18181f', s.cardBg     ||'');
  setColorPair('set-accent-color', 'set-accent-text',    s.accentColor||'#7c6cff', s.accentColor||'');
  if (s.logoImage)  updatePreview('prev-logo',   s.logoImage);
  if (s.appBgImage) updatePreview('prev-app-bg', s.appBgImage);

  const clk = s.clock || {};
  const ce = document.getElementById('clock-enabled');
  const cp = document.getElementById('clock-position');
  const cc = document.getElementById('clock-color');
  const ct = document.getElementById('clock-color-text');
  const co = document.getElementById('clock-opacity');
  const cv = document.getElementById('clock-opacity-val');
  if (ce) ce.checked  = !!clk.enabled;
  if (cp) cp.value    = clk.position || 'bottom-right';
  const col = clk.color || '#ffffff';
  if (cc) cc.value = col;
  if (ct) ct.value = col;
  const op = Math.round((clk.opacity ?? 0.85) * 100);
  if (co) co.value = op;
  if (cv) cv.textContent = op + '%';
}

function setColorPair(cId, tId, cVal, tVal) {
  const c = document.getElementById(cId);
  const t = document.getElementById(tId);
  if (c) c.value = cVal;
  if (t) t.value = tVal;
}

// ════════════════════════════════
// SETTINGS: KARTEN-TAB
// ════════════════════════════════
function buildSettingsCardTab() {
  const list = document.getElementById('card-image-list');
  if (!list) return;
  list.innerHTML = '';

  Object.entries(PROVIDERS)
    .sort((a,b) => a[1].name.localeCompare(b[1].name))
    .forEach(([id, p]) => {
      const imgUrl = (settings.cardImages || {})[id] || '';
      const item   = document.createElement('div');
      item.className = 'card-img-item';
      item.innerHTML = `
        <span class="card-img-dot" style="background:${p.color}"></span>
        <span class="card-img-name">${p.name}</span>
        <div class="img-preview" id="prev-card-${id}">
          ${imgUrl
            ? `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
          }
        </div>
        <button class="pick-btn" style="max-width:68px;font-size:11px" data-card="${id}">Bild</button>
        ${imgUrl ? `<button class="pick-btn" style="max-width:58px;font-size:11px;color:var(--acc);border-color:var(--acc)" data-edit="${id}">✎ Edit</button>` : ''}
        ${imgUrl ? `<button class="reset-btn" data-card-reset="${id}" title="Entfernen">↺</button>` : ''}
      `;

      item.querySelector(`[data-card="${id}"]`)?.addEventListener('click', () => handlePickImage(`card_${id}`));
      item.querySelector(`[data-edit="${id}"]`)?.addEventListener('click', () => openImageEditor(id, imgUrl));
      item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click', () => {
        delete settings.cardImages[id];
        delete (settings.cardImageOffsets || {})[id];
        applySettings(settings);
        buildProviderGrid();
        buildSettingsCardTab();
      });

      list.appendChild(item);
    });
}

// ════════════════════════════════
// IMAGE EDITOR (Position anpassen)
// ════════════════════════════════
function openImageEditor(providerId, imgUrl) {
  const overlay = document.getElementById('img-editor-overlay');
  const imgEl   = document.getElementById('img-editor-img');
  const title   = document.getElementById('img-editor-title');
  if (!overlay || !imgEl) return;

  const off = (settings.cardImageOffsets || {})[providerId] || { x:0, y:0 };
  imgEditorState = { providerId, url: imgUrl, x: off.x, y: off.y };

  if (title) title.textContent = `Banner: ${PROVIDERS[providerId]?.name || providerId}`;

  imgEl.style.backgroundImage    = `url("${imgUrl}")`;
  imgEl.style.backgroundSize     = 'cover';
  imgEl.style.backgroundRepeat   = 'no-repeat';
  imgEl.style.backgroundPosition = `calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;

  const px = document.getElementById('pos-x');
  const py = document.getElementById('pos-y');
  const pvx = document.getElementById('pos-x-val');
  const pvy = document.getElementById('pos-y-val');
  if (px) { px.value = off.x; }
  if (py) { py.value = off.y; }
  if (pvx) pvx.textContent = off.x;
  if (pvy) pvy.textContent = off.y;

  px?.addEventListener('input', () => {
    imgEditorState.x = parseInt(px.value);
    if (pvx) pvx.textContent = px.value;
    imgEl.style.backgroundPosition = `calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;
  });
  py?.addEventListener('input', () => {
    imgEditorState.y = parseInt(py.value);
    if (pvy) pvy.textContent = py.value;
    imgEl.style.backgroundPosition = `calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;
  });

  overlay.style.display = 'flex';
}

document.getElementById('img-editor-close')?.addEventListener('click', () => {
  document.getElementById('img-editor-overlay').style.display = 'none';
});

document.getElementById('img-editor-save')?.addEventListener('click', () => {
  const { providerId, url, x, y } = imgEditorState;
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.cardImages[providerId]       = url;
  settings.cardImageOffsets[providerId] = { x, y };
  applySettings(settings);
  buildProviderGrid();
  buildSettingsCardTab();
  document.getElementById('img-editor-overlay').style.display = 'none';
});

document.getElementById('img-editor-remove')?.addEventListener('click', () => {
  const { providerId } = imgEditorState;
  delete (settings.cardImages || {})[providerId];
  delete (settings.cardImageOffsets || {})[providerId];
  applySettings(settings);
  buildProviderGrid();
  buildSettingsCardTab();
  document.getElementById('img-editor-overlay').style.display = 'none';
});

// ════════════════════════════════
// SETTINGS: ACCOUNT-TAB
// ════════════════════════════════
async function buildSettingsAccountTab() {
  const list = document.getElementById('session-list');
  if (!list) return;
  list.innerHTML = '<div class="loading-sessions">Login-Status wird geprüft…</div>';

  const results = await window.electronAPI.getAllSessions();
  list.innerHTML = '';

  Object.entries(PROVIDERS)
    .sort((a,b) => a[1].name.localeCompare(b[1].name))
    .forEach(([id, p]) => {
      const loggedIn = !!results[id];
      const item = document.createElement('div');
      item.className = 'session-item';
      item.innerHTML = `
        <span class="session-dot ${loggedIn ? 'active' : ''}"></span>
        <span class="session-name">${p.name}</span>
        <span class="session-status">${loggedIn ? '✓ Eingeloggt' : '–'}</span>
        ${loggedIn ? `<button class="session-logout-btn" data-id="${id}">Abmelden</button>` : ''}
      `;
      item.querySelector('.session-logout-btn')?.addEventListener('click', () => {
        window.electronAPI.clearProviderSession(id);
        if (currentProvider === id) stopStream();
        buildSettingsAccountTab();
      });
      list.appendChild(item);
    });
}

// ════════════════════════════════
// UHR
// ════════════════════════════════
function setupClock() {
  clearInterval(clockInterval);
  const widget = document.getElementById('clock-widget');
  const timeEl = document.getElementById('clock-time');
  if (!widget || !timeEl) return;

  const clk = settings.clock || {};
  if (!clk.enabled) { widget.style.display = 'none'; return; }

  // Position
  widget.className = `clock-widget pos-${clk.position || 'bottom-right'}`;
  widget.style.color   = clk.color   || '#ffffff';
  widget.style.opacity = clk.opacity ?? 0.85;
  widget.style.display = 'block';

  const tick = () => {
    const now  = new Date();
    const h    = String(now.getHours()).padStart(2,'0');
    const m    = String(now.getMinutes()).padStart(2,'0');
    const s    = String(now.getSeconds()).padStart(2,'0');
    timeEl.textContent = `${h}:${m}:${s}`;
  };
  tick();
  clockInterval = setInterval(tick, 1000);
}

// ════════════════════════════════
// WEBVIEW ERROR
// ════════════════════════════════
function showWebviewError(provider, code, desc, diag) {
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="webview-error">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>${provider.name} konnte nicht geladen werden</h3>
      <p>${diag || 'Mögliche Ursachen: Keine Internetverbindung, die Seite ist down oder blockiert den Zugriff.'}</p>
      ${code ? `<span class="err-code">Fehlercode: ${code} – ${desc||'Unbekannt'}</span>` : ''}
      <a href="#" onclick="window.electronAPI.openExternal('${provider.url}');return false;">Im Browser öffnen →</a>
    </div>
  `;
}

// ════════════════════════════════
// LOADING
// ════════════════════════════════
function showLoading(text = 'Wird geladen…') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.add('active');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// ════════════════════════════════
// EVENT DELEGATION für dynamische Elemente
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // img-editor Listener nach DOM-Load setzen
  document.getElementById('img-editor-close')?.addEventListener('click', () => {
    document.getElementById('img-editor-overlay').style.display = 'none';
  });
  document.getElementById('img-editor-save')?.addEventListener('click', () => {
    const { providerId, url, x, y } = imgEditorState;
    settings.cardImages       = settings.cardImages || {};
    settings.cardImageOffsets = settings.cardImageOffsets || {};
    settings.cardImages[providerId]       = url;
    settings.cardImageOffsets[providerId] = { x, y };
    applySettings(settings);
    buildProviderGrid();
    buildSettingsCardTab();
    document.getElementById('img-editor-overlay').style.display = 'none';
  });
  document.getElementById('img-editor-remove')?.addEventListener('click', () => {
    const { providerId } = imgEditorState;
    delete (settings.cardImages || {})[providerId];
    delete (settings.cardImageOffsets || {})[providerId];
    applySettings(settings);
    buildProviderGrid();
    buildSettingsCardTab();
    document.getElementById('img-editor-overlay').style.display = 'none';
  });

  init();
});
