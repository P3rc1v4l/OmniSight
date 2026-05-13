'use strict';

// ========================
// PROVIDER CONFIG
// ========================
const PROVIDERS = {
  netflix:     { name:'Netflix',       tag:'Filme & Serien',        url:'https://www.netflix.com',        color:'#E50914', partition:'persist:netflix' },
  prime:       { name:'Prime Video',   tag:'Amazon Originals',       url:'https://www.primevideo.com',     color:'#00A8E1', partition:'persist:prime' },
  disney:      { name:'Disney+',       tag:'Marvel, Star Wars & mehr',url:'https://www.disneyplus.com',   color:'#113CCF', partition:'persist:disney' },
  crunchyroll: { name:'Crunchyroll',   tag:'Anime & Manga',          url:'https://www.crunchyroll.com',   color:'#F47521', partition:'persist:crunchyroll' },
  burning:     { name:'BurningSeries', tag:'Serien & Anime',         url:'https://bs.to',                 color:'#C0392B', partition:'persist:burning' },
  cineto:      { name:'Cine.to',       tag:'Filme & Serien',         url:'https://cine.to',               color:'#8B5CF6', partition:'persist:cineto' },
};

// Provider-Logos als SVG-Strings
const LOGOS = {
  netflix: `<svg viewBox="0 0 111 30" fill="currentColor" height="28"><path d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.468 0h5.063l3.062 7.874L105.875 0h5.124l-5.937 14.28zM90.47 0h-4.594v27.25c1.5.094 3.062.156 4.594.343V0zm-8.937 26.937c-4.187-.281-8.375-.53-12.656-.625V0h4.595v21.875c2.75.062 5.5.281 8.061.438v4.624zM64.25 10.657v4.594h-6.406V26H53.22V0h13.125v4.657H57.844v6h6.406zM44.7 26.25c-1.719 0-3.469-.094-5.188-.156V4.657H34.45V0h15.344v4.657H44.7V26.25zM23.044 5.688L16.5 26.937c-1.532-.062-3.063-.094-4.594-.094l-6.75-21.156v21.25H.5V0h6.313l6.843 21.563L19.5 0H26v26.937c-1-.031-1.969-.094-2.956-.094V5.688z"/></svg>`,

  prime: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><svg viewBox="0 0 80 22" fill="currentColor" height="18"><text x="0" y="18" font-family="sans-serif" font-size="20" font-weight="800">prime</text></svg><span style="font-size:9px;letter-spacing:.14em;font-weight:700;opacity:.6">VIDEO</span></div>`,

  disney: `<svg viewBox="0 0 120 36" height="32"><text x="4" y="28" font-family="Georgia,serif" font-size="26" font-weight="bold" fill="currentColor">Disney</text><text x="96" y="28" font-family="sans-serif" font-size="28" font-weight="900" fill="#4FC3F7">+</text></svg>`,

  crunchyroll: `<svg viewBox="0 0 180 42" height="30" fill="currentColor"><text x="2" y="34" font-family="sans-serif" font-size="32" font-weight="900">crunchyroll</text></svg>`,

  burning: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><svg viewBox="0 0 40 44" height="36" fill="none"><path d="M20 2C12 2 5 10 6 20C7 28 13 34 20 40C27 34 33 28 34 20C35 10 28 2 20 2Z" fill="#C0392B"/><path d="M20 12C17 16 15 21 18 25C21 29 24 24 23 20C22 17 20 14 20 12Z" fill="white" opacity=".85"/></svg><span style="font-size:10px;font-weight:700;letter-spacing:.06em">BurningSeries</span></div>`,

  cineto: `<svg viewBox="0 0 110 40" height="30" fill="currentColor"><text x="2" y="32" font-family="sans-serif" font-size="34" font-weight="900" letter-spacing="-1">cine.to</text></svg>`,
};

// ========================
// STATE
// ========================
let currentProvider = null;
let currentWebview  = null;
let settings        = { appBg:'', cardBg:'', accentColor:'#7c6cff' };
let isFullscreen    = false;
let fsExitTimeout   = null;

// ========================
// INIT
// ========================
async function init() {
  settings = await window.electronAPI.getSettings();
  applySettings(settings, false);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  buildProviderGrid();
  buildProviderSubMenu();
  setupTitlebar();
  setupThemeToggle();
  setupNavigation();
  setupStreamControls();
  setupSettingsPanel();
  setupSidebarBottom();
  setupFullscreenExitHover();

  window.electronAPI.onFullscreenChange(v => {
    isFullscreen = v;
    updateFullscreenUI();
  });

  window.electronAPI.onSessionsCleared(() => {
    document.querySelectorAll('.card-badge').forEach(b => b.remove());
  });

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
}

// ========================
// THEME
// ========================
function setTheme(theme, save=true) {
  document.documentElement.setAttribute('data-theme', theme);
  const t = document.getElementById('theme-toggle');
  if (t) t.checked = (theme === 'light');
  if (save) window.electronAPI.setTheme(theme);
}

function setupThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('change', e => {
    setTheme(e.target.checked ? 'light' : 'dark');
  });
}

// ========================
// SETTINGS
// ========================
const DEFAULTS = { appBg:'', cardBg:'', accentColor:'#7c6cff' };

function applySettings(s, save=true) {
  const root = document.documentElement;
  if (s.appBg)      root.style.setProperty('--bg',  s.appBg);
  else              root.style.removeProperty('--bg');
  if (s.cardBg)     root.style.setProperty('--bgc', s.cardBg);
  else              root.style.removeProperty('--bgc');
  if (s.accentColor) root.style.setProperty('--acc', s.accentColor);
  if (save) window.electronAPI.setSettings(s);
}

function setupSettingsPanel() {
  const panel   = document.getElementById('settings-panel');
  const overlay = document.getElementById('settings-overlay');
  const btnOpen = document.getElementById('btn-settings');
  const btnClose= document.getElementById('settings-close');

  // Sync UI mit gespeicherten Werten
  syncSettingsUI();

  btnOpen.addEventListener('click',  () => { panel.classList.add('open'); overlay.classList.add('open'); });
  btnClose.addEventListener('click', closeSettings);
  overlay.addEventListener('click',  closeSettings);

  function closeSettings() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  }

  // Color pickers ↔ Text inputs
  linkColorInput('set-app-bg-color',   'set-app-bg-text');
  linkColorInput('set-card-bg-color',  'set-card-bg-text');
  linkColorInput('set-accent-color',   'set-accent-text');

  // Reset-Buttons
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.reset;
      settings[key] = DEFAULTS[key];
      syncSettingsUI();
      applySettings(settings);
    });
  });

  document.getElementById('settings-save').addEventListener('click', () => {
    settings.appBg      = document.getElementById('set-app-bg-text').value.trim();
    settings.cardBg     = document.getElementById('set-card-bg-text').value.trim();
    settings.accentColor= document.getElementById('set-accent-text').value.trim() || '#7c6cff';
    applySettings(settings);
    closeSettings();
  });
}

function linkColorInput(colorId, textId) {
  const col = document.getElementById(colorId);
  const txt = document.getElementById(textId);
  col.addEventListener('input', () => { txt.value = col.value; });
  txt.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(txt.value)) col.value = txt.value;
  });
}

function syncSettingsUI() {
  const s = settings;
  const appBg  = s.appBg  || '#0a0a0f';
  const cardBg = s.cardBg || '#18181f';
  const acc    = s.accentColor || '#7c6cff';
  document.getElementById('set-app-bg-color').value  = appBg;
  document.getElementById('set-app-bg-text').value   = s.appBg || '';
  document.getElementById('set-card-bg-color').value = cardBg;
  document.getElementById('set-card-bg-text').value  = s.cardBg || '';
  document.getElementById('set-accent-color').value  = acc;
  document.getElementById('set-accent-text').value   = s.accentColor || '';
}

// ========================
// TITLEBAR
// ========================
function setupTitlebar() {
  document.getElementById('btn-minimize')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',    () => window.electronAPI.close());
}

// ========================
// NAVIGATION
// ========================
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
      if (v === 'home') { showView('home'); clearWebview(); }
      else showView(v);
    });
  });

  // Anbieter-Untermenü Toggle
  const toggle = document.getElementById('nav-providers-toggle');
  const sub    = document.getElementById('nav-sub-providers');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    sub.classList.toggle('open');
  });
}

// ========================
// PROVIDER GRID AUFBAUEN
// ========================
function buildProviderGrid() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const card = document.createElement('div');
    card.className = 'provider-card';
    card.dataset.id = id;
    card.style.setProperty('--card-color', p.color);

    card.innerHTML = `
      <div class="card-banner">
        <div class="card-banner-bg"></div>
        <div class="card-banner-circle"></div>
        <div class="card-logo">${LOGOS[id] || p.name}</div>
      </div>
      <div class="card-body">
        <div class="card-info">
          <span class="card-name">${p.name}</span>
          <span class="card-tag">${p.tag}</span>
        </div>
        <span class="card-arrow">→</span>
      </div>
    `;

    card.addEventListener('click', () => openProvider(id));
    grid.appendChild(card);
  });
}

// ========================
// PROVIDER UNTERMENÜ
// ========================
function buildProviderSubMenu() {
  const sub = document.getElementById('nav-sub-providers');
  if (!sub) return;

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const btn = document.createElement('button');
    btn.className = 'nav-sub-btn';
    btn.dataset.id = id;
    btn.innerHTML = `<span class="dot" style="background:${p.color}"></span>${p.name}`;
    btn.addEventListener('click', () => openProvider(id));
    sub.appendChild(btn);
  });
}

// ========================
// PROVIDER ÖFFNEN
// ========================
function openProvider(id) {
  const provider = PROVIDERS[id];
  if (!provider) return;

  currentProvider = id;
  showLoading(`${provider.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent = provider.name;
  document.getElementById('btn-watching').style.display = 'flex';

  // Ad-Blocker für diese Session einrichten
  window.electronAPI.setupWebviewSession(provider.partition);

  clearWebview();

  const webview = document.createElement('webview');
  webview.setAttribute('src', provider.url);
  webview.setAttribute('partition', provider.partition);
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  webview.style.cssText = 'width:100%;height:100%;border:none;';

  currentWebview = webview;
  document.getElementById('webview-wrap').appendChild(webview);

  webview.addEventListener('did-start-loading', () => showLoading(`${provider.name} wird geladen…`));
  webview.addEventListener('did-stop-loading',  () => {
    hideLoading();
    window.electronAPI.setProviderLoggedIn(id, true);
  });
  webview.addEventListener('did-fail-load', e => {
    if (e.errorCode !== -3) {
      hideLoading();
      showWebviewError(provider.url);
    }
  });

  showView('stream');
}

function clearWebview() {
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';
  currentWebview = null;
}

function showWebviewError(url) {
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="webview-error">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Die Seite konnte nicht geladen werden.</p>
      <a href="#" onclick="window.electronAPI.openExternal('${url}');return false;">Im Browser öffnen →</a>
    </div>
  `;
}

// ========================
// STREAM CONTROLS
// ========================
function setupStreamControls() {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (isFullscreen) window.electronAPI.setFullscreen(false);
    clearWebview();
    currentProvider = null;
    document.getElementById('btn-watching').style.display = 'none';
    showView('home');
  });

  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    window.electronAPI.setFullscreen(!isFullscreen);
  });

  document.getElementById('btn-logout-provider')?.addEventListener('click', () => {
    if (!currentProvider) return;
    const p = PROVIDERS[currentProvider];
    if (!confirm(`Von ${p.name} abmelden?\nDeine Sitzung wird gelöscht.`)) return;
    window.electronAPI.clearProviderSession(currentProvider);
    if (currentWebview) currentWebview.loadURL(p.url);
  });
}

// ========================
// SIDEBAR BOTTOM
// ========================
function setupSidebarBottom() {
  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von ALLEN Streaming-Diensten abmelden?\nAlle gespeicherten Sitzungen werden gelöscht.')) return;
    window.electronAPI.clearAllSessions();
    if (currentProvider) {
      clearWebview();
      currentProvider = null;
      showView('home');
    }
  });
}

// ========================
// VOLLBILD
// ========================
function updateFullscreenUI() {
  const topbar  = document.getElementById('stream-topbar');
  const sidebar = document.getElementById('sidebar');
  const titlebar= document.getElementById('titlebar');
  const btn     = document.getElementById('btn-fullscreen');

  if (isFullscreen) {
    topbar?.classList.add('hidden');
    sidebar?.classList.add('hidden');
    titlebar?.classList.add('hidden');
    if (btn) btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg> Vollbild beenden`;

    // Webview auf ganzen Bildschirm
    const wrap = document.getElementById('webview-wrap');
    if (wrap) { wrap.style.position='fixed'; wrap.style.inset='0'; wrap.style.zIndex='500'; }
  } else {
    topbar?.classList.remove('hidden');
    sidebar?.classList.remove('hidden');
    titlebar?.classList.remove('hidden');
    if (btn) btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> Vollbild`;

    const wrap = document.getElementById('webview-wrap');
    if (wrap) { wrap.style.position=''; wrap.style.inset=''; wrap.style.zIndex=''; }
  }
}

// Vollbild-Exit per Maus oben Mitte
function setupFullscreenExitHover() {
  const exitBtn = document.getElementById('fullscreen-exit');
  if (!exitBtn) return;

  document.addEventListener('mousemove', e => {
    if (!isFullscreen) return;
    const centerX = window.innerWidth / 2;
    const inCenter = Math.abs(e.clientX - centerX) < 180;
    const atTop    = e.clientY < 50;

    if (inCenter && atTop) {
      exitBtn.classList.add('visible');
      clearTimeout(fsExitTimeout);
      fsExitTimeout = setTimeout(() => exitBtn.classList.remove('visible'), 2500);
    }
  });

  exitBtn.addEventListener('click', () => {
    window.electronAPI.setFullscreen(false);
    exitBtn.classList.remove('visible');
  });
}

// ========================
// LOADING
// ========================
function showLoading(text='Wird geladen…') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.add('active');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// ========================
// HIDDEN CLASSES
// ========================
const style = document.createElement('style');
style.textContent = `
  .hidden { display:none !important; }
`;
document.head.appendChild(style);

// ========================
// START
// ========================
document.addEventListener('DOMContentLoaded', init);
