'use strict';

// ════════════════════════════════
// PROVIDER CONFIG (alphabetisch)
// ════════════════════════════════
const PROVIDERS = {
  apple:        { name:'Apple TV+',      tag:'Apple Originals',           url:'https://tv.apple.com',                   color:'#555555', partition:'persist:apple' },
  ard:          { name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',       url:'https://www.ardmediathek.de',            color:'#003D6B', partition:'persist:ard' },
  burning:      { name:'BurningSeries',  tag:'Serien & Anime',             url:'https://bs.to',                          color:'#C0392B', partition:'persist:burning' },
  cineto:       { name:'Cine.to',        tag:'Filme & Serien',             url:'https://cine.to',                        color:'#8B5CF6', partition:'persist:cineto' },
  crunchyroll:  { name:'Crunchyroll',    tag:'Anime & Manga',              url:'https://www.crunchyroll.com',            color:'#F47521', partition:'persist:crunchyroll' },
  dazn:         { name:'DAZN',           tag:'Sport Live-Streams',         url:'https://www.dazn.com',                   color:'#F8D200', partition:'persist:dazn' },
  disney:       { name:'Disney+',        tag:'Marvel, Star Wars & mehr',   url:'https://www.disneyplus.com',             color:'#113CCF', partition:'persist:disney' },
  hbomax:       { name:'Max (HBO)',       tag:'HBO Originals & mehr',       url:'https://www.max.com',                    color:'#0031DB', partition:'persist:hbomax' },
  joyn:         { name:'Joyn',           tag:'Kostenlos streamen',         url:'https://www.joyn.de',                    color:'#E4001B', partition:'persist:joyn' },
  mubi:         { name:'MUBI',           tag:'Arthouse & Kino',            url:'https://mubi.com',                       color:'#213F5E', partition:'persist:mubi' },
  netflix:      { name:'Netflix',        tag:'Filme & Serien',             url:'https://www.netflix.com',                color:'#E50914', partition:'persist:netflix' },
  paramountplus:{ name:'Paramount+',     tag:'Paramount Originals',        url:'https://www.paramountplus.com',          color:'#0064FF', partition:'persist:paramountplus' },
  prime:        { name:'Prime Video',    tag:'Amazon Originals',           url:'https://www.primevideo.com',             color:'#00A8E1', partition:'persist:prime' },
  rtl:          { name:'RTL+',           tag:'RTL Serien & Shows',         url:'https://plus.rtl.de',                    color:'#FF6B00', partition:'persist:rtl' },
  skygo:        { name:'Sky Go',         tag:'Sky Serien & Sport',         url:'https://www.sky.de/entertainment/sky-go',color:'#00205B', partition:'persist:skygo' },
  twitch:       { name:'Twitch',         tag:'Live-Streams & Gaming',      url:'https://www.twitch.tv',                  color:'#9146FF', partition:'persist:twitch' },
  youtube:      { name:'YouTube',        tag:'Videos & Streams',           url:'https://www.youtube.com',                color:'#FF0000', partition:'persist:youtube' },
  zdf:          { name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',       url:'https://www.zdf.de',                     color:'#163A6A', partition:'persist:zdf' },
};

function getFaviconUrl(id) {
  const map = {
    apple:'https://www.google.com/s2/favicons?sz=64&domain=tv.apple.com',
    ard:'https://www.google.com/s2/favicons?sz=64&domain=ardmediathek.de',
    burning:'https://www.google.com/s2/favicons?sz=64&domain=bs.to',
    cineto:'https://www.google.com/s2/favicons?sz=64&domain=cine.to',
    crunchyroll:'https://www.google.com/s2/favicons?sz=64&domain=crunchyroll.com',
    dazn:'https://www.google.com/s2/favicons?sz=64&domain=dazn.com',
    disney:'https://www.google.com/s2/favicons?sz=64&domain=disneyplus.com',
    hbomax:'https://www.google.com/s2/favicons?sz=64&domain=max.com',
    joyn:'https://www.google.com/s2/favicons?sz=64&domain=joyn.de',
    mubi:'https://www.google.com/s2/favicons?sz=64&domain=mubi.com',
    netflix:'https://www.google.com/s2/favicons?sz=64&domain=netflix.com',
    paramountplus:'https://www.google.com/s2/favicons?sz=64&domain=paramountplus.com',
    prime:'https://www.google.com/s2/favicons?sz=64&domain=primevideo.com',
    rtl:'https://www.google.com/s2/favicons?sz=64&domain=plus.rtl.de',
    skygo:'https://www.google.com/s2/favicons?sz=64&domain=sky.de',
    twitch:'https://www.google.com/s2/favicons?sz=64&domain=twitch.tv',
    youtube:'https://www.google.com/s2/favicons?sz=64&domain=youtube.com',
    zdf:'https://www.google.com/s2/favicons?sz=64&domain=zdf.de',
  };
  return map[id] || `https://www.google.com/s2/favicons?sz=64&domain=${new URL(PROVIDERS[id]?.url||'https://example.com').hostname}`;
}

// ════════════════════════════════
// STATE
// ════════════════════════════════
let currentProvider = null;
let currentWebview  = null;
let pipProviderId   = null;
let isFullscreen    = false;
let fsHoverTimer    = null;
let fsAutoHide      = null;
let clockInterval   = null;
let settings        = {};
let imgEditorState  = { providerId:null, url:'', x:0, y:0 };

// Uhr-Drag-State
let clockDragActive    = false;
let clockPrevSettings  = null; // Snapshot beim Öffnen des Uhr-Tabs
let clockUnsaved       = false;

// Search debounce
let searchTimer = null;

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.clock            = settings.clock            || { enabled:false, position:{x:null,y:null}, color:'#ffffff', opacity:0.85, size:22 };
  settings.fontSize         = settings.fontSize         || 'medium';
  settings.accentColor      = settings.accentColor      || '#30c5bb';

  applySettings(settings, false);
  applyFontSize(settings.fontSize);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

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
  setupPip();
  setupSearch();
  setupImageEditor();
  setupClockUnsavedDialog();

  window.electronAPI.onFullscreenChange(v => { isFullscreen = v; updateFullscreenUI(); });
  window.electronAPI.onSessionsCleared(() => buildSettingsAccountTab());

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
}

// ════════════════════════════════
// THEME
// ════════════════════════════════
function setTheme(t, save=true) {
  document.documentElement.setAttribute('data-theme', t);
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t === 'light');
  if (save) window.electronAPI.setTheme(t);
}
function setupThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('change', e => setTheme(e.target.checked ? 'light' : 'dark'));
}

// ════════════════════════════════
// FONT SIZE
// ════════════════════════════════
function applyFontSize(size) {
  document.documentElement.setAttribute('data-fontsize', size || 'medium');
}

// ════════════════════════════════
// SETTINGS ANWENDEN
// ════════════════════════════════
const DEFAULTS = {
  appBgImage:'', accentColor:'#30c5bb', cardImages:{}, cardImageOffsets:{},
  logoImage:'', favorites:[], fontSize:'medium',
  clock:{ enabled:false, position:{x:null,y:null}, color:'#ffffff', opacity:0.85, size:22 },
};

function applySettings(s, save=true) {
  const root = document.documentElement;

  // Hintergrundbild
  const mc = document.getElementById('main-content');
  if (s.appBgImage) {
    if (mc) {
      mc.style.backgroundImage    = `url("${s.appBgImage}")`;
      mc.style.backgroundSize     = 'cover';
      mc.style.backgroundPosition = 'center';
      mc.classList.add('has-bg');
    }
    // Sidebar-Farbe ans Bild anpassen → dominante Farbe nicht extrahierbar ohne Canvas,
    // daher setzen wir ein semi-transparentes Overlay via CSS-Variable
    root.style.setProperty('--bgs', 'rgba(10,10,20,0.72)');
  } else {
    if (mc) { mc.style.backgroundImage = ''; mc.classList.remove('has-bg'); }
    root.style.removeProperty('--bgs');
  }

  // Akzentfarbe
  root.style.setProperty('--acc', s.accentColor || '#30c5bb');
  const accRgb = hexToRgb(s.accentColor || '#30c5bb');
  if (accRgb) root.style.setProperty('--accg', `rgba(${accRgb},0.18)`);

  // Logo
  const li = document.getElementById('logo-img');
  if (li && s.logoImage) li.src = s.logoImage;
  else if (li) li.src = 'assets/icon.png';

  // Karten-Bilder
  Object.entries(s.cardImages || {}).forEach(([id, url]) => {
    const el = document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
    if (!el) return;
    if (url) {
      const off = (s.cardImageOffsets||{})[id] || {x:0,y:0};
      el.style.backgroundImage    = `url("${url}")`;
      el.style.backgroundPosition = `calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;
      el.style.opacity = '1';
    } else {
      el.style.backgroundImage = ''; el.style.opacity = '0';
    }
  });

  // Uhr
  setupClock();

  if (save) window.electronAPI.setSettings(s);
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : null;
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
      if (v === 'home') { maybeMoveToPip(); showView('home'); }
      else if (v === 'stream') {
        if (!currentProvider && !pipProviderId) { showView('nothing'); }
        else if (currentProvider) showView('stream');
        else if (pipProviderId) restoreFromPip();
      }
      else showView(v);
    });
  });

  setupToggle('nav-fav-toggle',       'nav-sub-favorites');
  setupToggle('nav-providers-toggle', 'nav-sub-providers');

  document.getElementById('goto-home-btn')?.addEventListener('click', () => showView('home'));
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
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const favs    = settings.favorites || [];
  const sorted  = Object.entries(PROVIDERS).sort((a,b) => a[1].name.localeCompare(b[1].name));
  const favList = sorted.filter(([id]) => favs.includes(id));
  const rest    = sorted.filter(([id]) => !favs.includes(id));

  if (favList.length) {
    addGridLabel(grid, '⭐ Favoriten');
    favList.forEach(([id,p]) => grid.appendChild(createCard(id,p,true)));
  }
  if (rest.length) {
    if (favList.length) addGridLabel(grid, 'Alle Anbieter');
    rest.forEach(([id,p]) => grid.appendChild(createCard(id,p,false)));
  }
}

function addGridLabel(grid, text) {
  const el = document.createElement('div');
  el.className = 'grid-section-label';
  el.textContent = text;
  grid.appendChild(el);
}

function createCard(id, p, isFav) {
  const card = document.createElement('div');
  card.className = 'provider-card';
  card.dataset.id = id;
  card.style.setProperty('--card-color', p.color);

  const imgUrl = (settings.cardImages||{})[id] || '';
  const off    = (settings.cardImageOffsets||{})[id] || {x:0,y:0};
  const fav    = getFaviconUrl(id);

  // Farbverlauf aus Provider-Farbe
  const col = p.color;

  card.innerHTML = `
    <button class="card-star ${isFav?'active':''}" data-id="${id}">
      <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" ${isFav?'fill="currentColor"':'fill="none"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </button>
    <div class="card-banner">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center, ${col}55 0%, ${col}22 50%, transparent 80%)"></div>
      <div class="card-banner-img" style="background-image:${imgUrl?`url('${imgUrl}')`:'none'};background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:${imgUrl?1:0};transition:opacity .3s"></div>
      <img class="card-favicon" src="${fav}" alt="${p.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        style="position:relative;z-index:2;width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;position:relative;z-index:2;width:52px;height:52px;background:${col}33;border-radius:10px;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:white">${p.name.charAt(0)}</div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <span class="card-name">${p.name}</span>
        <span class="card-tag">${p.tag}</span>
      </div>
      <span class="card-arrow">→</span>
    </div>
  `;

  card.querySelector('.card-star').addEventListener('click', e => { e.stopPropagation(); toggleFavorite(id); });
  card.addEventListener('click', e => { if (!e.target.closest('.card-star')) openProvider(id); });
  return card;
}

function toggleFavorite(id) {
  const favs = settings.favorites || [];
  const idx  = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx,1);
  settings.favorites = favs;
  window.electronAPI.setSettings(settings);
  buildProviderGrid();
  buildSidebarSubMenus();
}

// ════════════════════════════════
// SIDEBAR UNTERMENÜS
// ════════════════════════════════
function buildSidebarSubMenus() {
  buildFavSub();
  buildProvidersSub();
}

function buildFavSub() {
  const sub = document.getElementById('nav-sub-favorites');
  if (!sub) return;
  sub.innerHTML = '';
  const favs = settings.favorites || [];
  if (!favs.length) {
    const h = document.createElement('div');
    h.style.cssText = 'padding:5px 10px;font-size:11px;color:var(--tx3)';
    h.textContent = 'Noch keine Favoriten';
    sub.appendChild(h); return;
  }
  favs.forEach(id => { const p = PROVIDERS[id]; if(p) sub.appendChild(makeSubBtn(id,p)); });
}

function buildProvidersSub() {
  const sub = document.getElementById('nav-sub-providers');
  if (!sub) return;
  sub.innerHTML = '';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name))
    .forEach(([id,p]) => sub.appendChild(makeSubBtn(id,p)));
}

function makeSubBtn(id, p) {
  const btn = document.createElement('button');
  btn.className = 'nav-sub-btn';
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

  // Laufenden Stream → PiP (nur wenn anderer Provider)
  if (currentWebview && currentProvider && currentProvider !== id) {
    moveToPip(currentProvider, currentWebview);
    currentWebview = null; currentProvider = null;
  }

  // War PiP für diesen Provider? → restore
  if (pipProviderId === id) { restoreFromPip(); return; }

  currentProvider = id;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent = p.name;
  document.getElementById('btn-watching').style.display = 'flex';

  window.electronAPI.setupWebviewSession(p.partition);

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
      diag = r.ok ? `Webseite erreichbar (HTTP ${r.status}), aber Einbettung blockiert.` : `Verbindungsfehler: ${r.error}`;
    } catch {}
    showWebviewError(p, e.errorCode, e.errorDescription, diag);
  });

  showView('stream');
}

// ════════════════════════════════
// STREAM STOP
// ════════════════════════════════
function stopStream() {
  if (isFullscreen) window.electronAPI.setFullscreen(false);
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';
  currentWebview = null; currentProvider = null;
  showView('home');
}

// ════════════════════════════════
// BACK (Stream → PiP)
// ════════════════════════════════
function maybeMoveToPip() {
  if (currentWebview && currentProvider) {
    moveToPip(currentProvider, currentWebview);
    currentWebview = null; currentProvider = null;
  }
}

// ════════════════════════════════
// PIP – Webview DOM-Node direkt verschieben (kein Reload)
// ════════════════════════════════
function setupPip() {
  const pip = document.getElementById('pip-window');
  if (!pip) return;

  // Drag
  let drag=false, ox=0, oy=0;
  document.getElementById('pip-topbar')?.addEventListener('mousedown', e => {
    drag=true;
    const r = pip.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    let nx = Math.max(0, Math.min(window.innerWidth  - pip.offsetWidth,  e.clientX - ox));
    let ny = Math.max(0, Math.min(window.innerHeight - pip.offsetHeight, e.clientY - oy));
    pip.style.left=nx+'px'; pip.style.top=ny+'px';
    pip.style.right='auto'; pip.style.bottom='auto';
  });
  document.addEventListener('mouseup', () => { drag=false; });

  document.getElementById('pip-expand')?.addEventListener('click', restoreFromPip);
  document.getElementById('pip-close')?.addEventListener('click',  () => {
    pip.style.display = 'none';
    document.getElementById('pip-content').innerHTML = '';
    pipProviderId = null;
  });
}

function moveToPip(providerId, webviewNode) {
  const pip     = document.getElementById('pip-window');
  const content = document.getElementById('pip-content');
  const title   = document.getElementById('pip-title');
  if (!pip || !content) return;

  // Webview DOM-Node direkt in PiP verschieben – kein Reload!
  content.innerHTML = '';
  if (webviewNode && webviewNode.parentNode) {
    webviewNode.parentNode.removeChild(webviewNode);
  }
  if (webviewNode) {
    webviewNode.style.cssText = 'width:100%;height:100%;border:none;display:flex';
    content.appendChild(webviewNode);
  }

  pipProviderId = providerId;
  if (title) title.textContent = PROVIDERS[providerId]?.name || providerId;

  // Reset position to bottom-right
  pip.style.left='auto'; pip.style.top='auto';
  pip.style.right='24px'; pip.style.bottom='24px';
  pip.style.display = 'flex';
}

function restoreFromPip() {
  if (!pipProviderId) return;
  const id      = pipProviderId;
  const pip     = document.getElementById('pip-window');
  const content = document.getElementById('pip-content');
  const wrap    = document.getElementById('webview-wrap');
  if (!content || !wrap) return;

  // Webview zurück in den Stream-View verschieben – kein Reload!
  const wv = content.querySelector('webview');
  if (wv) {
    wv.parentNode.removeChild(wv);
    wv.style.cssText = 'width:100%;height:100%;border:none;display:flex';
    wrap.innerHTML = '';
    wrap.appendChild(wv);
    currentWebview  = wv;
  }

  content.innerHTML = '';
  pip.style.display = 'none';
  pipProviderId   = null;
  currentProvider = id;

  document.getElementById('stream-title').textContent = PROVIDERS[id]?.name || id;
  document.getElementById('btn-watching').style.display = 'flex';
  showView('stream');
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function setupStreamControls() {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (isFullscreen) window.electronAPI.setFullscreen(false);
    maybeMoveToPip();
    showView('home');
  });
  document.getElementById('btn-stop')?.addEventListener('click', () => {
    if (!confirm('Stream beenden und zur Übersicht?')) return;
    stopStream();
  });
  document.getElementById('btn-pip')?.addEventListener('click', () => {
    if (currentWebview && currentProvider) {
      maybeMoveToPip(); showView('home');
    }
  });
  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    window.electronAPI.setFullscreen(!isFullscreen);
  });
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
// FULLSCREEN
// ════════════════════════════════
function updateFullscreenUI() {
  const topbar  = document.getElementById('stream-topbar');
  const sidebar = document.getElementById('sidebar');
  const tb      = document.getElementById('titlebar');
  const wrap    = document.getElementById('webview-wrap');
  const btn     = document.getElementById('btn-fullscreen');

  if (isFullscreen) {
    [topbar,sidebar,tb].forEach(el=>el?.classList.add('hidden'));
    if (wrap) wrap.style.cssText = 'position:fixed;inset:0;z-index:500;background:#000';
    if (btn)  btn.innerHTML = svgMin()+' Beenden';
  } else {
    [topbar,sidebar,tb].forEach(el=>el?.classList.remove('hidden'));
    if (wrap) wrap.style.cssText = '';
    if (btn)  btn.innerHTML = svgMax()+' Vollbild';
    document.getElementById('fs-exit-btn')?.classList.remove('visible');
  }
}

function svgMax() { return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`; }
function svgMin() { return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`; }

function setupFullscreenExit() {
  const btn = document.getElementById('fs-exit-btn');
  if (!btn) return;
  document.addEventListener('mousemove', e => {
    if (!isFullscreen) return;
    const zone = 113, cx = window.innerWidth/2;
    const inZ  = Math.abs(e.clientX-cx) < zone/2 && e.clientY < zone;
    if (inZ) {
      if (!fsHoverTimer) fsHoverTimer = setTimeout(() => {
        btn.classList.add('visible');
        clearTimeout(fsAutoHide);
        fsAutoHide = setTimeout(()=>btn.classList.remove('visible'), 3000);
      }, 1000);
    } else { clearTimeout(fsHoverTimer); fsHoverTimer=null; }
  });
  btn.addEventListener('click', () => { window.electronAPI.setFullscreen(false); btn.classList.remove('visible'); });
}

function setupESCKey() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isFullscreen) window.electronAPI.setFullscreen(false);
  });
}

// ════════════════════════════════
// SEARCH
// ════════════════════════════════
function setupSearch() {
  const input   = document.getElementById('search-input');
  const clearBtn= document.getElementById('search-clear');
  const results = document.getElementById('search-results');

  input?.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'block' : 'none';
    clearTimeout(searchTimer);
    if (!q) { results.style.display='none'; results.innerHTML=''; return; }
    searchTimer = setTimeout(() => runSearch(q), 500);
  });

  clearBtn?.addEventListener('click', () => {
    input.value=''; clearBtn.style.display='none';
    results.style.display='none'; results.innerHTML='';
  });
}

async function runSearch(q) {
  const results = document.getElementById('search-results');
  results.style.display = 'block';

  // Provider-Suche
  const providerMatches = Object.entries(PROVIDERS).filter(([,p]) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  // YouTube-Link?
  const ytId = extractYouTubeId(q);

  results.innerHTML = `<div class="search-loading">Suche läuft…</div>`;

  let html = `<div class="search-results-header"><span class="search-results-title">Ergebnisse für „${escHtml(q)}"</span></div>`;

  // Provider-Treffer
  if (providerMatches.length) {
    html += `<div style="margin-bottom:10px;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">Anbieter</div>`;
    providerMatches.forEach(([id,p]) => {
      html += `<div class="search-result-item" style="cursor:pointer" onclick="openProvider('${id}')">
        <img src="${getFaviconUrl(id)}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/>
        <div class="search-result-info">
          <span class="search-result-title">${p.name}</span>
          <span class="search-result-meta">${p.tag}</span>
          <div class="search-result-actions">
            <button class="search-action-btn primary" onclick="event.stopPropagation();openProvider('${id}')">▶ Öffnen</button>
          </div>
        </div>
      </div>`;
    });
  }

  // YouTube direkt
  if (ytId) {
    html += `<div style="margin:10px 0 6px;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">YouTube Video</div>`;
    html += `<div class="search-yt-result">
      <img class="search-yt-thumb" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" onerror="this.style.display='none'"/>
      <div class="search-yt-info">
        <div class="search-yt-title">YouTube Video</div>
        <div class="search-yt-channel">${escHtml(q)}</div>
        <div class="search-result-actions" style="margin-top:6px">
          <button class="search-action-btn primary" onclick="openProvider('youtube');setTimeout(()=>{if(window._currentWv)window._currentWv.loadURL('https://www.youtube.com/watch?v=${ytId}')},1500)">▶ In OmniSight öffnen</button>
          <button class="search-action-btn" onclick="window.electronAPI.openExternal('https://www.youtube.com/watch?v=${ytId}')">↗ Browser</button>
        </div>
      </div>
    </div>`;
  }

  // Titel-Suche via OMDB
  if (!ytId) {
    try {
      const data = await window.electronAPI.searchTitle(q);
      if (data.Search && data.Search.length) {
        html += `<div style="margin:10px 0 6px;font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em">Filme & Serien</div>`;
        data.Search.slice(0,5).forEach(item => {
          const typeLabel = item.Type === 'movie' ? 'Film' : item.Type === 'series' ? 'Serie' : item.Type;
          const wseUrl = `https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(item.Title)}`;
          html += `<div class="search-result-item">
            ${item.Poster && item.Poster !== 'N/A'
              ? `<img class="search-result-poster" src="${item.Poster}" onerror="this.outerHTML='<div class=search-result-poster-placeholder><svg width=24 height=24 viewBox=\\'0 0 24 24\\' fill=none stroke=currentColor stroke-width=1.5><rect x=3 y=3 width=18 height=18 rx=2/></svg></div>'"/>`
              : `<div class="search-result-poster-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`
            }
            <div class="search-result-info">
              <span class="search-result-type">${typeLabel}</span>
              <span class="search-result-title">${escHtml(item.Title)}</span>
              <span class="search-result-meta">${item.Year || ''}</span>
              <div class="search-result-actions">
                <button class="search-action-btn primary" onclick="window.electronAPI.openExternal('${wseUrl}')">↗ Bei werstreamt.es suchen</button>
                <button class="search-action-btn" onclick="window.electronAPI.openExternal('https://www.imdb.com/title/${item.imdbID}')">IMDb</button>
              </div>
            </div>
          </div>`;
        });
      } else if (!providerMatches.length && !ytId) {
        html += `<div class="search-empty">Keine Ergebnisse gefunden für „${escHtml(q)}".<br><br>
          <button class="search-action-btn primary" onclick="window.electronAPI.openExternal('https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(q)}')">↗ Bei werstreamt.es suchen</button>
        </div>`;
      }
    } catch {}
  }

  // Immer: werstreamt.es Link
  if (!ytId) {
    html += `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bor);display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:11px;color:var(--tx3)">Auf welcher Plattform ist der Titel verfügbar?</span>
      <button class="search-action-btn" onclick="window.electronAPI.openExternal('https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(q)}')">↗ werstreamt.es</button>
    </div>`;
  }

  results.innerHTML = html;
}

function extractYouTubeId(str) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) { const m = str.match(p); if (m) return m[1]; }
  return null;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Global für Search (YouTube direct open)
window.openProvider = openProvider;

// ════════════════════════════════
// CLOCK
// ════════════════════════════════
function setupClock() {
  clearInterval(clockInterval);
  const widget = document.getElementById('clock-widget');
  const timeEl = document.getElementById('clock-time');
  if (!widget || !timeEl) return;

  const clk = settings.clock || {};
  if (!clk.enabled) { widget.style.display='none'; return; }

  // Position
  const pos = clk.position || {};
  widget.style.display = 'block';
  if (pos.x !== null && pos.x !== undefined && pos.y !== null && pos.y !== undefined) {
    widget.style.left   = pos.x + 'px';
    widget.style.top    = pos.y + 'px';
    widget.style.right  = 'auto';
    widget.style.bottom = 'auto';
  } else {
    // Default: rechts unten
    widget.style.left   = 'auto';
    widget.style.top    = 'auto';
    widget.style.right  = '16px';
    widget.style.bottom = '16px';
  }

  widget.style.color     = clk.color   || '#ffffff';
  widget.style.opacity   = clk.opacity ?? 0.85;
  widget.style.fontSize  = (clk.size || 22) + 'px';

  const tick = () => {
    const n = new Date();
    timeEl.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  };
  tick();
  clockInterval = setInterval(tick, 1000);
}

function pad(n) { return String(n).padStart(2,'0'); }

// Live-Uhr-Preview während Einstellungen offen
function previewClock() {
  const widget = document.getElementById('clock-widget');
  if (!widget) return;
  const enabled = document.getElementById('clock-enabled')?.checked;
  const color   = document.getElementById('clock-color-text')?.value || '#ffffff';
  const opacity = (parseInt(document.getElementById('clock-opacity')?.value)||85) / 100;
  const size    = parseInt(document.getElementById('clock-size')?.value) || 22;

  if (!enabled) { widget.style.display='none'; return; }
  widget.style.display   = 'block';
  widget.style.color     = color;
  widget.style.opacity   = opacity;
  widget.style.fontSize  = size + 'px';
  clockUnsaved = true;
  document.getElementById('clock-unsaved-hint')?.style && (document.getElementById('clock-unsaved-hint').style.display='block');
}

// Uhr per Maus verschieben
function startClockDrag() {
  const widget = document.getElementById('clock-widget');
  if (!widget) return;

  // Uhr einblenden
  widget.style.display  = 'block';
  widget.classList.add('draggable', 'clock-drag-active');
  clockDragActive = true;

  let drag=false, ox=0, oy=0;
  function onDown(e) {
    drag=true;
    const r = widget.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    e.preventDefault();
  }
  function onMove(e) {
    if (!drag) return;
    let nx = Math.max(0, Math.min(window.innerWidth  - widget.offsetWidth,  e.clientX-ox));
    let ny = Math.max(0, Math.min(window.innerHeight - widget.offsetHeight, e.clientY-oy));
    widget.style.left='auto'; widget.style.right='auto';
    widget.style.top='auto';  widget.style.bottom='auto';
    widget.style.left=nx+'px'; widget.style.top=ny+'px';
  }
  function onUp() {
    if (!drag) return;
    drag=false;
    // Position speichern (nur temporär bis "Speichern")
    const r = widget.getBoundingClientRect();
    settings.clock._pendingPos = { x: Math.round(r.left), y: Math.round(r.top) };
    clockUnsaved = true;
    document.getElementById('clock-unsaved-hint').style.display = 'block';
  }

  widget.addEventListener('mousedown', onDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);

  // Drag-Modus beenden
  document.getElementById('clock-drag-mode-btn').textContent = '✓ Fertig';
  document.getElementById('clock-drag-mode-btn').onclick = () => stopClockDrag(onDown, onMove, onUp);
}

function stopClockDrag(onDown, onMove, onUp) {
  const widget = document.getElementById('clock-widget');
  widget?.classList.remove('draggable','clock-drag-active');
  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup', onUp);
  widget?.removeEventListener('mousedown', onDown);
  clockDragActive = false;
  document.getElementById('clock-drag-mode-btn').textContent = '✋ Uhr verschieben';
  document.getElementById('clock-drag-mode-btn').onclick = startClockDrag;
}

// Dialog: nicht gespeicherte Uhren-Änderungen
function setupClockUnsavedDialog() {
  document.getElementById('clock-save-btn')?.addEventListener('click', () => {
    saveClockSettings();
    document.getElementById('clock-unsaved-overlay').style.display = 'none';
  });
  document.getElementById('clock-disable-btn')?.addEventListener('click', () => {
    settings.clock.enabled = false;
    window.electronAPI.setSettings(settings);
    setupClock();
    clockUnsaved = false;
    document.getElementById('clock-unsaved-overlay').style.display = 'none';
  });
  document.getElementById('clock-cancel-btn')?.addEventListener('click', () => {
    // Zurück zu alten Einstellungen
    if (clockPrevSettings) {
      settings.clock = JSON.parse(JSON.stringify(clockPrevSettings));
      setupClock();
    }
    clockUnsaved = false;
    document.getElementById('clock-unsaved-overlay').style.display = 'none';
  });
}

function saveClockSettings() {
  const pos = settings.clock._pendingPos || settings.clock.position || {};
  settings.clock = {
    enabled:  document.getElementById('clock-enabled')?.checked ?? settings.clock.enabled,
    position: settings.clock._pendingPos || settings.clock.position || {x:null,y:null},
    color:    document.getElementById('clock-color-text')?.value || '#ffffff',
    opacity:  (parseInt(document.getElementById('clock-opacity')?.value)||85)/100,
    size:     parseInt(document.getElementById('clock-size')?.value)||22,
  };
  delete settings.clock._pendingPos;
  window.electronAPI.setSettings(settings);
  setupClock();
  clockUnsaved = false;
  document.getElementById('clock-unsaved-hint').style.display = 'none';
}

// ════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════
function setupSettingsPanel() {
  const panel   = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');

  document.getElementById('btn-settings')?.addEventListener('click', () => {
    openSettings();
  });
  document.getElementById('settings-close')?.addEventListener('click', closeSettings);
  overlay?.addEventListener('click', closeSettings);

  // Tabs
  document.querySelectorAll('.stab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.stab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`stab-${tab.dataset.tab}`)?.classList.add('active');
      if (tab.dataset.tab==='account') buildSettingsAccountTab();
      if (tab.dataset.tab==='cards')   buildSettingsCardTab();
      if (tab.dataset.tab==='clock')   syncClockUI();
    });
  });

  // Color pickers
  linkColor('set-accent-color','set-accent-text');
  linkColor('clock-color','clock-color-text');

  // Reset buttons
  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.reset;
      if (k==='accentColor') { settings.accentColor='#30c5bb'; syncAppearanceUI(); }
      else if (k==='logoImage') { settings.logoImage=''; const li=document.getElementById('logo-img'); if(li) li.src='assets/icon.png'; }
      else if (k==='appBgImage') { settings.appBgImage=''; updatePreview('prev-app-bg',null); }
      applySettings(settings);
    });
  });

  // Image pick buttons
  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => handlePickImage(btn.dataset.pick));
  });

  // Font size buttons
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.font-size-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      settings.fontSize = btn.dataset.size;
      applyFontSize(settings.fontSize);
    });
  });

  // Clock live preview
  ['clock-enabled','clock-color','clock-opacity','clock-size'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', previewClock);
    document.getElementById(id)?.addEventListener('change', previewClock);
  });
  document.getElementById('clock-color-text')?.addEventListener('input', previewClock);

  // Clock opacity/size label
  document.getElementById('clock-opacity')?.addEventListener('input', e => {
    document.getElementById('clock-opacity-val').textContent = e.target.value+'%';
  });
  document.getElementById('clock-size')?.addEventListener('input', e => {
    document.getElementById('clock-size-val').textContent = e.target.value+'px';
  });

  // Clock drag button
  document.getElementById('clock-drag-mode-btn')?.addEventListener('click', startClockDrag);

  // Save
  document.getElementById('settings-save')?.addEventListener('click', () => {
    settings.accentColor = document.getElementById('set-accent-text')?.value.trim() || '#30c5bb';
    settings.logoImage   = settings.logoImage || '';
    if (clockUnsaved) {
      document.getElementById('clock-unsaved-overlay').style.display='flex';
      return;
    }
    applySettings(settings);
    closeSettings();
  });

  // Alle abmelden
  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von ALLEN Diensten abmelden?')) return;
    window.electronAPI.clearAllSessions();
    buildSettingsAccountTab();
  });

  syncAppearanceUI();
}

function openSettings() {
  clockPrevSettings = JSON.parse(JSON.stringify(settings.clock));
  clockUnsaved      = false;
  document.getElementById('settings-panel')?.classList.add('open');
  document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();
  buildSettingsCardTab();
  syncClockUI();
}

function closeSettings() {
  if (clockUnsaved) {
    document.getElementById('clock-unsaved-overlay').style.display='flex';
    return;
  }
  document.getElementById('settings-panel')?.classList.remove('open');
  document.getElementById('settings-overlay')?.classList.remove('open');
}

async function handlePickImage(dest) {
  const url = await window.electronAPI.pickImage(dest);
  if (!url) return;
  if (dest==='logo') {
    settings.logoImage = url;
    const li = document.getElementById('logo-img'); if(li) li.src=url;
    updatePreview('prev-logo', url);
  } else if (dest==='appBgImage') {
    settings.appBgImage = url;
    updatePreview('prev-app-bg', url);
  } else if (dest.startsWith('card_')) {
    const id = dest.replace('card_','');
    settings.cardImages[id] = url;
    applySettings(settings);
    buildProviderGrid();
    buildSettingsCardTab();
    openImageEditor(id, url);
    return;
  }
  applySettings(settings);
}

function updatePreview(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url) el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;
  else el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
}

function linkColor(cId, tId) {
  const c=document.getElementById(cId), t=document.getElementById(tId);
  if(!c||!t) return;
  c.addEventListener('input', ()=>{ t.value=c.value; });
  t.addEventListener('input', ()=>{ if(/^#[0-9a-fA-F]{6}$/.test(t.value)) c.value=t.value; });
}

function syncAppearanceUI() {
  const acc = settings.accentColor||'#30c5bb';
  const ca  = document.getElementById('set-accent-color');
  const ta  = document.getElementById('set-accent-text');
  if(ca) ca.value=acc; if(ta) ta.value=acc;

  if(settings.appBgImage) updatePreview('prev-app-bg', settings.appBgImage);
  if(settings.logoImage)  updatePreview('prev-logo', settings.logoImage);

  // Font size
  document.querySelectorAll('.font-size-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.size === (settings.fontSize||'medium'));
  });
}

function syncClockUI() {
  const clk = settings.clock||{};
  const ce=document.getElementById('clock-enabled');
  const cc=document.getElementById('clock-color');
  const ct=document.getElementById('clock-color-text');
  const co=document.getElementById('clock-opacity');
  const cv=document.getElementById('clock-opacity-val');
  const cs=document.getElementById('clock-size');
  const csv=document.getElementById('clock-size-val');
  if(ce) ce.checked = !!clk.enabled;
  const col = clk.color||'#ffffff';
  if(cc) cc.value=col; if(ct) ct.value=col;
  const op = Math.round((clk.opacity??0.85)*100);
  if(co) co.value=op; if(cv) cv.textContent=op+'%';
  const sz = clk.size||22;
  if(cs) cs.value=sz; if(csv) csv.textContent=sz+'px';
}

// ════════════════════════════════
// SETTINGS: KARTEN-TAB
// ════════════════════════════════
function buildSettingsCardTab() {
  const list = document.getElementById('card-image-list');
  if (!list) return;
  list.innerHTML = '';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p]) => {
    const imgUrl = (settings.cardImages||{})[id]||'';
    const item   = document.createElement('div');
    item.className = 'card-img-item';
    item.innerHTML = `
      <span class="card-img-dot" style="background:${p.color}"></span>
      <span class="card-img-name">${p.name}</span>
      <div class="img-preview" id="prev-card-${id}">
        ${imgUrl ? `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`}
      </div>
      <button class="pick-btn" style="max-width:60px;font-size:11px" data-card="${id}">Bild</button>
      ${imgUrl?`<button class="pick-btn" style="max-width:52px;font-size:11px;color:var(--acc);border-color:var(--acc)" data-edit="${id}">✎</button>`:''}
      ${imgUrl?`<button class="reset-btn" data-card-reset="${id}">↺</button>`:''}
    `;
    item.querySelector(`[data-card="${id}"]`)?.addEventListener('click', ()=>handlePickImage(`card_${id}`));
    item.querySelector(`[data-edit="${id}"]`)?.addEventListener('click', ()=>openImageEditor(id, imgUrl));
    item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click', ()=>{
      delete settings.cardImages[id]; delete (settings.cardImageOffsets||{})[id];
      applySettings(settings); buildProviderGrid(); buildSettingsCardTab();
    });
    list.appendChild(item);
  });
}

// ════════════════════════════════
// SETTINGS: ACCOUNT-TAB
// ════════════════════════════════
async function buildSettingsAccountTab() {
  const list = document.getElementById('session-list');
  if (!list) return;
  list.innerHTML = '<div class="loading-sessions">Login-Status wird geprüft…</div>';
  const res = await window.electronAPI.getAllSessions();
  list.innerHTML = '';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p]) => {
    const on = !!res[id];
    const item = document.createElement('div');
    item.className = 'session-item';
    item.innerHTML = `
      <span class="session-dot ${on?'active':''}"></span>
      <span class="session-name">${p.name}</span>
      <span class="session-status">${on?'✓ Eingeloggt':'–'}</span>
      ${on?`<button class="session-logout-btn" data-id="${id}">Abmelden</button>`:''}
    `;
    item.querySelector('.session-logout-btn')?.addEventListener('click', ()=>{
      window.electronAPI.clearProviderSession(id);
      if(currentProvider===id) stopStream();
      buildSettingsAccountTab();
    });
    list.appendChild(item);
  });
}

// ════════════════════════════════
// IMAGE EDITOR
// ════════════════════════════════
function setupImageEditor() {
  const pxEl  = document.getElementById('pos-x');
  const pyEl  = document.getElementById('pos-y');
  const pvx   = document.getElementById('pos-x-val');
  const pvy   = document.getElementById('pos-y-val');
  const imgEl = document.getElementById('img-editor-img');

  pxEl?.addEventListener('input', ()=>{
    imgEditorState.x = parseInt(pxEl.value);
    if(pvx) pvx.textContent=pxEl.value;
    if(imgEl) imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;
  });
  pyEl?.addEventListener('input', ()=>{
    imgEditorState.y = parseInt(pyEl.value);
    if(pvy) pvy.textContent=pyEl.value;
    if(imgEl) imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`;
  });

  document.getElementById('img-editor-close')?.addEventListener('click', ()=>{
    document.getElementById('img-editor-overlay').style.display='none';
  });
  document.getElementById('img-editor-save')?.addEventListener('click', ()=>{
    const {providerId,url,x,y}=imgEditorState;
    settings.cardImages[providerId]             = url;
    settings.cardImageOffsets                   = settings.cardImageOffsets||{};
    settings.cardImageOffsets[providerId]       = {x,y};
    applySettings(settings); buildProviderGrid(); buildSettingsCardTab();
    document.getElementById('img-editor-overlay').style.display='none';
  });
  document.getElementById('img-editor-remove')?.addEventListener('click', ()=>{
    const {providerId}=imgEditorState;
    delete settings.cardImages[providerId];
    delete (settings.cardImageOffsets||{})[providerId];
    applySettings(settings); buildProviderGrid(); buildSettingsCardTab();
    document.getElementById('img-editor-overlay').style.display='none';
  });
}

function openImageEditor(providerId, imgUrl) {
  const overlay = document.getElementById('img-editor-overlay');
  const imgEl   = document.getElementById('img-editor-img');
  const title   = document.getElementById('img-editor-title');
  if (!overlay||!imgEl) return;
  const off = (settings.cardImageOffsets||{})[providerId]||{x:0,y:0};
  imgEditorState = {providerId, url:imgUrl, x:off.x, y:off.y};
  if(title) title.textContent=`Banner: ${PROVIDERS[providerId]?.name||providerId}`;
  imgEl.style.backgroundImage    = `url("${imgUrl}")`;
  imgEl.style.backgroundSize     = 'cover';
  imgEl.style.backgroundRepeat   = 'no-repeat';
  imgEl.style.backgroundPosition = `calc(50% + ${off.x}px) calc(50% + ${off.y}px)`;
  const px=document.getElementById('pos-x'), py=document.getElementById('pos-y');
  const pvx=document.getElementById('pos-x-val'), pvy=document.getElementById('pos-y-val');
  if(px){px.value=off.x;} if(py){py.value=off.y;}
  if(pvx) pvx.textContent=off.x; if(pvy) pvy.textContent=off.y;
  overlay.style.display='flex';
}

// ════════════════════════════════
// WEBVIEW ERROR
// ════════════════════════════════
function showWebviewError(provider, code, desc, diag) {
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="webview-error">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h3>${provider.name} konnte nicht geladen werden</h3>
      <p>${diag||'Keine Verbindung oder die Seite blockiert den Zugriff.'}</p>
      ${code?`<span class="err-code">Fehlercode: ${code} – ${desc||'Unbekannt'}</span>`:''}
      <a href="#" onclick="window.electronAPI.openExternal('${provider.url}');return false;">Im Browser öffnen →</a>
    </div>`;
}

// ════════════════════════════════
// LOADING
// ════════════════════════════════
function showLoading(text='Wird geladen…') {
  document.getElementById('loading-text').textContent=text;
  document.getElementById('loading-overlay').classList.add('active');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// ════════════════════════════════
// START
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
