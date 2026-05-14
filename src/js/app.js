'use strict';

// ════════════════════════════════
// PROVIDER CONFIG
// ════════════════════════════════
const PROVIDERS = {
  netflix:     { name:'Netflix',       tag:'Filme & Serien',          url:'https://www.netflix.com',        color:'#E50914', partition:'persist:netflix' },
  prime:       { name:'Prime Video',   tag:'Amazon Originals',        url:'https://www.primevideo.com',     color:'#00A8E1', partition:'persist:prime' },
  disney:      { name:'Disney+',       tag:'Marvel, Star Wars & mehr',url:'https://www.disneyplus.com',    color:'#113CCF', partition:'persist:disney' },
  crunchyroll: { name:'Crunchyroll',   tag:'Anime & Manga',           url:'https://www.crunchyroll.com',   color:'#F47521', partition:'persist:crunchyroll' },
  burning:     { name:'BurningSeries', tag:'Serien & Anime',          url:'https://bs.to',                 color:'#C0392B', partition:'persist:burning' },
  cineto:      { name:'Cine.to',       tag:'Filme & Serien',          url:'https://cine.to',               color:'#8B5CF6', partition:'persist:cineto' },
  youtube:     { name:'YouTube',       tag:'Videos & Streams',        url:'https://www.youtube.com',       color:'#FF0000', partition:'persist:youtube' },
  twitch:      { name:'Twitch',        tag:'Live-Streams & Gaming',   url:'https://www.twitch.tv',         color:'#9146FF', partition:'persist:twitch' },
};

const LOGOS = {
  netflix: `<svg viewBox="0 0 111 30" fill="currentColor" height="26"><path d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.468 0h5.063l3.062 7.874L105.875 0h5.124l-5.937 14.28zM90.47 0h-4.594v27.25c1.5.094 3.062.156 4.594.343V0zm-8.937 26.937c-4.187-.281-8.375-.53-12.656-.625V0h4.595v21.875c2.75.062 5.5.281 8.061.438v4.624zM64.25 10.657v4.594h-6.406V26H53.22V0h13.125v4.657H57.844v6h6.406zM44.7 26.25c-1.719 0-3.469-.094-5.188-.156V4.657H34.45V0h15.344v4.657H44.7V26.25zM23.044 5.688L16.5 26.937c-1.532-.062-3.063-.094-4.594-.094l-6.75-21.156v21.25H.5V0h6.313l6.843 21.563L19.5 0H26v26.937c-1-.031-1.969-.094-2.956-.094V5.688z"/></svg>`,

  prime: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:20px;font-weight:800;letter-spacing:-.5px;color:currentColor">prime</span><span style="font-size:8px;letter-spacing:.18em;font-weight:700;opacity:.6">VIDEO</span></div>`,

  disney: `<div style="display:flex;align-items:baseline;gap:2px"><span style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:currentColor">Disney</span><span style="font-size:26px;font-weight:900;color:#4FC3F7;line-height:1">+</span></div>`,

  crunchyroll: `<svg viewBox="0 0 200 45" height="28" fill="currentColor"><text x="2" y="36" font-family="sans-serif" font-size="34" font-weight="900">crunchyroll</text></svg>`,

  burning: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
    <svg viewBox="0 0 40 44" height="32" fill="none">
      <path d="M20 2C12 2 5 10 6 20C7 28 13 34 20 40C27 34 33 28 34 20C35 10 28 2 20 2Z" fill="#C0392B"/>
      <path d="M20 12C17 16 15 21 18 25C21 29 24 24 23 20C22 17 20 14 20 12Z" fill="white" opacity=".85"/>
    </svg>
    <span style="font-size:9px;font-weight:700;letter-spacing:.05em;opacity:.8">BurningSeries</span>
  </div>`,

  cineto: `<svg viewBox="0 0 120 42" height="28" fill="currentColor"><text x="2" y="34" font-family="sans-serif" font-size="36" font-weight="900" letter-spacing="-1">cine.to</text></svg>`,

  youtube: `<svg viewBox="0 0 90 20" height="22" fill="currentColor"><path d="M27.97 3.66s-.29-2.07-1.19-2.98c-1.14-1.2-2.41-1.2-3-1.27C20.54-.08 15 0 15 0H14.99S9.46-.08 6.22.41c-.58.07-1.86.07-3 1.27C2.32 2.59 2.03 4.66 2.03 4.66S1.74 7.09 1.74 9.52v2.27c0 2.43.29 4.86.29 4.86s.29 2.07 1.19 2.98c1.14 1.2 2.63 1.16 3.3 1.28C8.45 21 15 21 15 21s5.54-.08 7.78-.57c.58-.07 1.86-.07 3-1.27.9-.91 1.19-2.98 1.19-2.98s.29-2.43.29-4.86V9.52c0-2.43-.29-4.86-.29-4.86zM12.06 13.72V6.26l8.1 3.74-8.1 3.72z"/><text x="32" y="16" font-family="sans-serif" font-size="16" font-weight="700">YouTube</text></svg>`,

  twitch: `<svg viewBox="0 0 100 24" height="24" fill="currentColor"><path d="M2.15 0L0 5.52v19.24h6.62V28h3.72l3.72-3.24h5.66L27 17V0H2.15zm22.54 15.93l-4.44 3.86H13.6l-3.72 3.24v-3.24H4.3V2.31h20.38v13.62zm-4.44-8.97v7.72h-2.3V6.96h2.3zm-6.16 0v7.72h-2.3V6.96h2.3z"/><text x="32" y="18" font-family="sans-serif" font-size="18" font-weight="800">Twitch</text></svg>`,
};

// ════════════════════════════════
// STATE
// ════════════════════════════════
let currentProvider = null;
let currentWebview  = null;
let settings        = { appBg:'', appBgImage:'', cardBg:'', accentColor:'#7c6cff', cardImages:{}, logoImage:'' };
let isFullscreen    = false;
let fsTimer         = null;
let fsHoverTimer    = null;

// ════════════════════════════════
// INIT
// ════════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  applySettings(settings, false);

  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);

  buildProviderGrid();
  buildProviderSubMenu();
  buildSettingsCardTab();
  buildSettingsAccountTab();

  setupTitlebar();
  setupThemeToggle();
  setupNavigation();
  setupStreamControls();
  setupSettingsPanel();
  setupFullscreenExit();
  setupESCKey();

  window.electronAPI.onFullscreenChange(v => {
    isFullscreen = v;
    updateFullscreenUI();
  });

  window.electronAPI.onSessionsCleared(() => {
    buildSettingsAccountTab();
  });

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
}

// ════════════════════════════════
// THEME
// ════════════════════════════════
function setTheme(theme, save = true) {
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

// ════════════════════════════════
// SETTINGS ANWENDEN
// ════════════════════════════════
const DEFAULTS = { appBg:'', appBgImage:'', cardBg:'', accentColor:'#7c6cff', cardImages:{}, logoImage:'' };

function applySettings(s, save = true) {
  const root = document.documentElement;

  // App-Hintergrund: Bild hat Vorrang vor Farbe
  if (s.appBgImage) {
    root.style.setProperty('--bg', `url("${s.appBgImage}") center/cover no-repeat`);
    document.body.style.backgroundImage = `url("${s.appBgImage}")`;
    document.body.style.backgroundSize  = 'cover';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = '';
    if (s.appBg) root.style.setProperty('--bg', s.appBg);
    else root.style.removeProperty('--bg');
  }

  if (s.cardBg) root.style.setProperty('--bgc', s.cardBg);
  else root.style.removeProperty('--bgc');

  if (s.accentColor) root.style.setProperty('--acc', s.accentColor);
  else root.style.setProperty('--acc', '#7c6cff');

  // Logo
  const logoImg = document.getElementById('logo-img');
  const logoSvg = document.getElementById('logo-svg');
  if (s.logoImage && logoImg && logoSvg) {
    logoImg.src = s.logoImage;
    logoImg.style.display = 'block';
    logoSvg.style.display = 'none';
  } else if (logoImg && logoSvg) {
    logoImg.style.display = 'none';
    logoSvg.style.display = 'block';
  }

  // Karten-Bilder aktualisieren
  if (s.cardImages) {
    Object.entries(s.cardImages).forEach(([id, imgUrl]) => {
      const banner = document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
      if (banner) {
        if (imgUrl) {
          banner.style.backgroundImage = `url("${imgUrl}")`;
          banner.style.opacity = '1';
        } else {
          banner.style.backgroundImage = '';
          banner.style.opacity = '0';
        }
      }
    });
  }

  if (save) window.electronAPI.setSettings(s);
}

// ════════════════════════════════
// SETTINGS PANEL
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
    });
  });

  // Color pickers
  linkColor('set-app-bg-color', 'set-app-bg-text');
  linkColor('set-card-bg-color', 'set-card-bg-text');
  linkColor('set-accent-color', 'set-accent-text');

  // Reset-Buttons
  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.reset;
      if (key === 'cardImages') settings.cardImages = {};
      else settings[key] = DEFAULTS[key] ?? '';
      syncSettingsUI();
      applySettings(settings);
      buildSettingsCardTab();
    });
  });

  // Bild-Pick-Buttons
  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => handlePickImage(btn.dataset.pick));
  });

  // Speichern
  document.getElementById('settings-save')?.addEventListener('click', () => {
    settings.appBg       = document.getElementById('set-app-bg-text').value.trim();
    settings.cardBg      = document.getElementById('set-card-bg-text').value.trim();
    settings.accentColor = document.getElementById('set-accent-text').value.trim() || '#7c6cff';
    applySettings(settings);
    closeSettings();
  });

  // Alle abmelden
  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von ALLEN Streaming-Diensten abmelden?\nAlle gespeicherten Sitzungen werden gelöscht.')) return;
    window.electronAPI.clearAllSessions();
    if (currentProvider) {
      clearWebview();
      currentProvider = null;
      showView('home');
    }
    buildSettingsAccountTab();
  });

  syncSettingsUI();
}

function openSettings() {
  document.getElementById('settings-panel')?.classList.add('open');
  document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab();
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
    updateImgPreview('prev-logo', url);
  } else if (dest === 'appBgImage') {
    settings.appBgImage = url;
    updateImgPreview('prev-app-bg', url);
  } else if (dest.startsWith('card_')) {
    const id = dest.replace('card_', '');
    if (!settings.cardImages) settings.cardImages = {};
    settings.cardImages[id] = url;
    updateImgPreview(`prev-card-${id}`, url);
    applySettings(settings); // Sofort anwenden
  }
}

function updateImgPreview(previewId, url) {
  const prev = document.getElementById(previewId);
  if (!prev) return;
  prev.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;
}

function linkColor(colorId, textId) {
  const col = document.getElementById(colorId);
  const txt = document.getElementById(textId);
  if (!col || !txt) return;
  col.addEventListener('input', () => { txt.value = col.value; });
  txt.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(txt.value)) col.value = txt.value;
  });
}

function syncSettingsUI() {
  const s = settings;
  setColorField('set-app-bg-color', 'set-app-bg-text',   s.appBg      || '#0a0a0f', s.appBg      || '');
  setColorField('set-card-bg-color','set-card-bg-text',   s.cardBg     || '#18181f', s.cardBg     || '');
  setColorField('set-accent-color', 'set-accent-text',    s.accentColor|| '#7c6cff', s.accentColor|| '');

  if (s.logoImage)    updateImgPreview('prev-logo',   s.logoImage);
  if (s.appBgImage)   updateImgPreview('prev-app-bg', s.appBgImage);
}

function setColorField(colorId, textId, colorVal, textVal) {
  const col = document.getElementById(colorId);
  const txt = document.getElementById(textId);
  if (col) col.value = colorVal;
  if (txt) txt.value = textVal;
}

// ════════════════════════════════
// SETTINGS: KARTEN-TAB
// ════════════════════════════════
function buildSettingsCardTab() {
  const list = document.getElementById('card-image-list');
  if (!list) return;
  list.innerHTML = '';

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const imgUrl = settings.cardImages?.[id] || '';
    const item = document.createElement('div');
    item.className = 'card-img-item';
    item.innerHTML = `
      <span class="card-img-dot" style="background:${p.color}"></span>
      <span class="card-img-name">${p.name}</span>
      <div class="img-preview" id="prev-card-${id}">
        ${imgUrl
          ? `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        }
      </div>
      <button class="pick-btn" data-pick="card_${id}" style="max-width:80px;font-size:11px">Bild</button>
      ${imgUrl ? `<button class="reset-btn" data-card-reset="${id}">↺</button>` : ''}
    `;

    item.querySelector('.pick-btn')?.addEventListener('click', () => handlePickImage(`card_${id}`));
    item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click', () => {
      if (settings.cardImages) delete settings.cardImages[id];
      applySettings(settings);
      buildSettingsCardTab();
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

  const sessions = await window.electronAPI.getAllSessions();
  list.innerHTML = '';

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const loggedIn = !!sessions[id];
    const item = document.createElement('div');
    item.className = 'session-item';
    item.innerHTML = `
      <span class="session-dot ${loggedIn ? 'active' : ''}"></span>
      <span class="session-name">${p.name}</span>
      <span class="session-status">${loggedIn ? 'Eingeloggt' : 'Nicht angemeldet'}</span>
      ${loggedIn ? `<button class="session-logout-btn" data-id="${id}">Abmelden</button>` : ''}
    `;

    item.querySelector('.session-logout-btn')?.addEventListener('click', () => {
      window.electronAPI.clearProviderSession(id);
      if (currentProvider === id) {
        clearWebview();
        currentProvider = null;
        showView('home');
      }
      buildSettingsAccountTab();
    });

    list.appendChild(item);
  });
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
      if (v === 'home') { showView('home'); }
      else showView(v);
    });
  });

  const toggle = document.getElementById('nav-providers-toggle');
  const sub    = document.getElementById('nav-sub-providers');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    sub.classList.toggle('open');
  });
}

// ════════════════════════════════
// PROVIDER GRID
// ════════════════════════════════
function buildProviderGrid() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const imgUrl = settings.cardImages?.[id] || '';
    const card   = document.createElement('div');
    card.className    = 'provider-card';
    card.dataset.id   = id;
    card.style.setProperty('--card-color', p.color);

    card.innerHTML = `
      <div class="card-banner">
        <div class="card-banner-img" style="background-image:${imgUrl ? `url('${imgUrl}')` : 'none'};opacity:${imgUrl ? 1 : 0};background-size:cover;background-position:center;position:absolute;inset:0;transition:opacity .3s"></div>
        <div class="card-banner-overlay"></div>
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

// ════════════════════════════════
// PROVIDER UNTERMENÜ
// ════════════════════════════════
function buildProviderSubMenu() {
  const sub = document.getElementById('nav-sub-providers');
  if (!sub) return;
  sub.innerHTML = '';

  Object.entries(PROVIDERS).forEach(([id, p]) => {
    const btn = document.createElement('button');
    btn.className = 'nav-sub-btn';
    btn.dataset.id = id;
    btn.innerHTML = `<span class="dot" style="background:${p.color}"></span>${p.name}`;
    btn.addEventListener('click', () => openProvider(id));
    sub.appendChild(btn);
  });
}

// ════════════════════════════════
// PROVIDER ÖFFNEN
// ════════════════════════════════
function openProvider(id) {
  const p = PROVIDERS[id];
  if (!p) return;

  currentProvider = id;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent = p.name;
  document.getElementById('btn-watching').style.display = 'flex';

  window.electronAPI.setupWebviewSession(p.partition);
  clearWebview();

  const webview = document.createElement('webview');
  webview.setAttribute('src', p.url);
  webview.setAttribute('partition', p.partition);
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  webview.style.cssText = 'width:100%;height:100%;border:none;display:flex';

  currentWebview = webview;
  document.getElementById('webview-wrap').appendChild(webview);

  webview.addEventListener('did-start-loading', () => showLoading(`${p.name} wird geladen…`));

  webview.addEventListener('did-stop-loading', () => {
    hideLoading();
    window.electronAPI.setProviderLoggedIn(id, true);
  });

  webview.addEventListener('did-fail-load', async (e) => {
    // -3 = abgebrochen (Redirect), ignorieren
    if (e.errorCode === -3 || e.errorCode === 0) return;
    hideLoading();

    // Diagnose: URL prüfen
    let diagMsg = '';
    try {
      const check = await window.electronAPI.checkUrl(p.url);
      if (check.ok) {
        diagMsg = `Webseite erreichbar (HTTP ${check.status}), aber Einbettung blockiert.`;
      } else {
        diagMsg = `Verbindungsfehler: ${check.error}`;
      }
    } catch { diagMsg = 'Diagnose nicht möglich.'; }

    showWebviewError(p, e.errorCode, e.errorDescription, diagMsg);
  });

  // Webview-Tastatur: ESC weitergeben
  webview.addEventListener('dom-ready', () => {
    webview.focus();
  });

  showView('stream');
}

function clearWebview() {
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';
  currentWebview = null;
}

function showWebviewError(provider, code, desc, diagMsg) {
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;

  const isEmbedBlock = diagMsg?.includes('Einbettung blockiert');
  const suggestion = isEmbedBlock
    ? `Die Seite läuft, blockiert aber die Einbettung. Du kannst sie im Browser öffnen.`
    : `Mögliche Ursachen: Keine Internetverbindung, die Seite ist down, oder sie blockiert den Zugriff.`;

  wrap.innerHTML = `
    <div class="webview-error">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>${provider.name} konnte nicht geladen werden</h3>
      <p>${suggestion}</p>
      ${code ? `<span class="err-code">Fehlercode: ${code} – ${desc || 'Unbekannt'}</span>` : ''}
      ${diagMsg ? `<span class="err-code" style="margin-top:-8px">${diagMsg}</span>` : ''}
      <a href="#" onclick="window.electronAPI.openExternal('${provider.url}');return false;">Im Browser öffnen →</a>
    </div>
  `;
}

// ════════════════════════════════
// STREAM CONTROLS
// ════════════════════════════════
function setupStreamControls() {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (isFullscreen) window.electronAPI.setFullscreen(false);
    clearWebview();
    currentProvider = null;
    showView('home');
    // "Schaut gerade" bleibt sichtbar (Punkt 4)
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
    buildSettingsAccountTab();
  });
}

// ════════════════════════════════
// VOLLBILD
// ════════════════════════════════
function updateFullscreenUI() {
  const els = {
    topbar:  document.getElementById('stream-topbar'),
    sidebar: document.getElementById('sidebar'),
    tb:      document.getElementById('titlebar'),
    btn:     document.getElementById('btn-fullscreen'),
    wrap:    document.getElementById('webview-wrap'),
  };

  if (isFullscreen) {
    els.topbar?.classList.add('hidden');
    els.sidebar?.classList.add('hidden');
    els.tb?.classList.add('hidden');
    if (els.wrap) { els.wrap.style.cssText = 'position:fixed;inset:0;z-index:500;background:#000'; }
    if (els.btn) els.btn.innerHTML = iconMinimize() + ' Vollbild beenden';
  } else {
    els.topbar?.classList.remove('hidden');
    els.sidebar?.classList.remove('hidden');
    els.tb?.classList.remove('hidden');
    if (els.wrap) { els.wrap.style.cssText = ''; }
    if (els.btn) els.btn.innerHTML = iconFullscreen() + ' Vollbild';
    document.getElementById('fs-exit-btn')?.classList.remove('visible');
  }
}

function iconFullscreen() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
}
function iconMinimize() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`;
}

// Vollbild-Exit per Maus oben Mitte (1 Sekunde hover → erscheint)
function setupFullscreenExit() {
  const exitBtn = document.getElementById('fs-exit-btn');
  if (!exitBtn) return;

  document.addEventListener('mousemove', e => {
    if (!isFullscreen) return;

    const cx   = window.innerWidth / 2;
    // ~3cm × 3cm bei ~96 DPI ≈ 113px × 113px
    const zone = 113;
    const inZone = Math.abs(e.clientX - cx) < zone / 2 && e.clientY < zone;

    if (inZone) {
      if (!fsHoverTimer) {
        fsHoverTimer = setTimeout(() => {
          exitBtn.classList.add('visible');
          // Auto-hide nach 3s
          clearTimeout(fsTimer);
          fsTimer = setTimeout(() => exitBtn.classList.remove('visible'), 3000);
        }, 1000); // 1 Sekunde in Zone = erscheint
      }
    } else {
      clearTimeout(fsHoverTimer);
      fsHoverTimer = null;
    }
  });

  exitBtn.addEventListener('click', () => {
    window.electronAPI.setFullscreen(false);
    exitBtn.classList.remove('visible');
  });
}

// ESC-Taste: Vollbild beenden (Punkt 2)
function setupESCKey() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isFullscreen) {
      window.electronAPI.setFullscreen(false);
    }
  });
}

// ════════════════════════════════
// LOADING & TOAST
// ════════════════════════════════
function showLoading(text = 'Wird geladen…') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-overlay').classList.add('active');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

function showToast(msg, duration = 4000) {
  const t = document.getElementById('error-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ════════════════════════════════
// START
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
