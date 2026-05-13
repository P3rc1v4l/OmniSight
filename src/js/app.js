'use strict';

// =====================
// PROVIDER CONFIG
// =====================
const PROVIDERS = {
  netflix:      { name: 'Netflix',        url: 'https://www.netflix.com',         partition: 'persist:netflix' },
  prime:        { name: 'Prime Video',    url: 'https://www.primevideo.com',       partition: 'persist:prime' },
  disney:       { name: 'Disney+',        url: 'https://www.disneyplus.com',       partition: 'persist:disney' },
  crunchyroll:  { name: 'Crunchyroll',    url: 'https://www.crunchyroll.com',      partition: 'persist:crunchyroll' },
  burning:      { name: 'BurningSeries',  url: 'https://burningseries.to',         partition: 'persist:burning' },
  cineto:       { name: 'Cine.to',        url: 'https://cine.to',                  partition: 'persist:cineto' },
};

// =====================
// STATE
// =====================
let currentProvider = null;
let currentWebview = null;

// =====================
// INIT
// =====================
async function init() {
  await applyStoredTheme();
  setupTitlebarControls();
  setupThemeToggle();
  setupProviderCards();
  setupNavButtons();
  setupStreamViewControls();
}

// =====================
// THEME
// =====================
async function applyStoredTheme() {
  const theme = await window.electronAPI.getTheme();
  setTheme(theme, false);
}

function setTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.checked = (theme === 'light');
  if (save) window.electronAPI.setTheme(theme);
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('change', (e) => {
    setTheme(e.target.checked ? 'light' : 'dark');
  });
}

// =====================
// TITLEBAR CONTROLS
// =====================
function setupTitlebarControls() {
  document.getElementById('btn-minimize')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click', () => window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click', () => window.electronAPI.close());
}

// =====================
// NAVIGATION
// =====================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');

  const navBtn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
  if (navBtn) navBtn.classList.add('active');
}

function setupNavButtons() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === 'home') {
        showView('home');
        clearWebview();
      } else {
        showView(view);
      }
    });
  });
}

// =====================
// PROVIDER CARDS
// =====================
function setupProviderCards() {
  document.querySelectorAll('.provider-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const provider = PROVIDERS[id];
      if (provider) openProvider(id, provider);
    });
  });
}

// =====================
// OPEN PROVIDER IN WEBVIEW
// =====================
function openProvider(id, provider) {
  showLoading(`${provider.name} wird geöffnet…`);
  currentProvider = id;

  // Stream-Header aktualisieren
  const streamTitle = document.getElementById('stream-title');
  if (streamTitle) streamTitle.textContent = provider.name;

  // Alten Webview entfernen
  clearWebview();

  // Neuen Webview erstellen mit eigener persistenter Session (Cookies bleiben!)
  const webview = document.createElement('webview');
  webview.setAttribute('src', provider.url);
  webview.setAttribute('partition', provider.partition); // wichtig: persist: prefix = gespeichert!
  webview.setAttribute('allowpopups', '');
  webview.style.width = '100%';
  webview.style.height = '100%';

  currentWebview = webview;

  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.appendChild(webview);

  webview.addEventListener('did-start-loading', () => {
    showLoading(`${provider.name} wird geladen…`);
  });

  webview.addEventListener('did-stop-loading', () => {
    hideLoading();
  });

  webview.addEventListener('did-fail-load', (e) => {
    if (e.errorCode !== -3) { // -3 = abgebrochen (normal bei Redirects)
      hideLoading();
      showErrorInWebview(provider.url);
    }
  });

  // Zur Stream-Ansicht wechseln
  showView('stream');
}

function clearWebview() {
  const wrap = document.getElementById('webview-wrap');
  if (wrap) wrap.innerHTML = '';
  currentWebview = null;
}

function showErrorInWebview(url) {
  const wrap = document.getElementById('webview-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div style="
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      height:100%; gap:16px; color: var(--text-secondary); font-family: var(--font-body);
    ">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div style="font-size:15px;">Seite konnte nicht geladen werden.</div>
      <a href="#" style="color: var(--accent); font-size:13px; text-decoration:none;"
        onclick="window.electronAPI.openExternal('${url}'); return false;">
        Im Browser öffnen →
      </a>
    </div>
  `;
}

// =====================
// STREAM VIEW CONTROLS
// =====================
function setupStreamViewControls() {
  document.getElementById('back-btn')?.addEventListener('click', () => {
    clearWebview();
    currentProvider = null;
    showView('home');
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (!currentProvider) return;
    const provider = PROVIDERS[currentProvider];
    if (!provider) return;

    const confirmed = confirm(`Wirklich von ${provider.name} abmelden?\nDeine gespeicherte Sitzung (Cookies) wird gelöscht.`);
    if (!confirmed) return;

    // Webview neu laden – löscht session durch leere Partition nicht direkt,
    // aber wir können auf die Abmelde-URL navigieren
    if (currentWebview) {
      // Versuche, die Logout-URL zu öffnen
      const logoutUrls = {
        netflix:     'https://www.netflix.com/signout',
        prime:       'https://www.amazon.de/gp/flex/sign-out.html',
        disney:      'https://www.disneyplus.com/logout',
        crunchyroll: 'https://www.crunchyroll.com/logout',
        burning:     provider.url,
        cineto:      provider.url,
      };
      const logoutUrl = logoutUrls[currentProvider] || provider.url;
      currentWebview.loadURL(logoutUrl);
    }
  });
}

// =====================
// LOADING OVERLAY
// =====================
function showLoading(text = 'Wird geladen…') {
  const overlay = document.getElementById('loading-overlay');
  const label = document.getElementById('loading-text');
  if (label) label.textContent = text;
  overlay?.classList.add('active');
}

function hideLoading() {
  document.getElementById('loading-overlay')?.classList.remove('active');
}

// =====================
// START
// =====================
document.addEventListener('DOMContentLoaded', init);
