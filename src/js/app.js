'use strict';

// ══════════════════════════════
// PROVIDERS
// ══════════════════════════════
const PROVIDERS = {
  apple:        { name:'Apple TV+',      tag:'Apple Originals',          url:'https://tv.apple.com',                   color:'#555555', partition:'persist:apple' },
  ard:          { name:'ARD Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.ardmediathek.de',            color:'#003D6B', partition:'persist:ard' },
  burning:      { name:'BurningSeries',  tag:'Serien & Anime',            url:'https://bs.to',                          color:'#C0392B', partition:'persist:burning' },
  cineto:       { name:'Cine.to',        tag:'Filme & Serien',            url:'https://cine.to',                        color:'#8B5CF6', partition:'persist:cineto' },
  crunchyroll:  { name:'Crunchyroll',    tag:'Anime & Manga',             url:'https://www.crunchyroll.com',            color:'#F47521', partition:'persist:crunchyroll' },
  dazn:         { name:'DAZN',           tag:'Sport Live-Streams',        url:'https://www.dazn.com',                   color:'#F8D200', partition:'persist:dazn' },
  disney:       { name:'Disney+',        tag:'Marvel, Star Wars & mehr',  url:'https://www.disneyplus.com',             color:'#113CCF', partition:'persist:disney' },
  hbomax:       { name:'Max (HBO)',       tag:'HBO Originals & mehr',      url:'https://www.max.com',                    color:'#0031DB', partition:'persist:hbomax' },
  joyn:         { name:'Joyn',           tag:'Kostenlos streamen',        url:'https://www.joyn.de',                    color:'#E4001B', partition:'persist:joyn' },
  mubi:         { name:'MUBI',           tag:'Arthouse & Kino',           url:'https://mubi.com',                       color:'#213F5E', partition:'persist:mubi' },
  netflix:      { name:'Netflix',        tag:'Filme & Serien',            url:'https://www.netflix.com',                color:'#E50914', partition:'persist:netflix' },
  paramountplus:{ name:'Paramount+',     tag:'Paramount Originals',       url:'https://www.paramountplus.com',          color:'#0064FF', partition:'persist:paramountplus' },
  prime:        { name:'Prime Video',    tag:'Amazon Originals',          url:'https://www.primevideo.com',             color:'#00A8E1', partition:'persist:prime' },
  rtl:          { name:'RTL+',           tag:'RTL Serien & Shows',        url:'https://plus.rtl.de',                    color:'#FF6B00', partition:'persist:rtl' },
  skygo:        { name:'Sky Go',         tag:'Sky Serien & Sport',        url:'https://www.sky.de/entertainment/sky-go',color:'#00205B', partition:'persist:skygo' },
  twitch:       { name:'Twitch',         tag:'Live-Streams & Gaming',     url:'https://www.twitch.tv',                  color:'#9146FF', partition:'persist:twitch' },
  youtube:      { name:'YouTube',        tag:'Videos & Streams',          url:'https://www.youtube.com',                color:'#FF0000', partition:'persist:youtube' },
  zdf:          { name:'ZDF Mediathek',  tag:'Öffentlich-rechtlich',      url:'https://www.zdf.de',                     color:'#163A6A', partition:'persist:zdf' },
};

// Streaming-Verfügbarkeit (Demo-Mapping)
const STREAMING_MAP = {
  netflix: ['netflix'], prime: ['prime'], disney: ['disney'],
  crunchyroll: ['crunchyroll'], hbomax: ['hbomax'], apple: ['apple'],
  paramountplus: ['paramountplus'], mubi: ['mubi'],
};

// Welche Provider können einen Titel direkt suchen?
const SEARCH_URLS = {
  netflix:      (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  prime:        (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`,
  disney:       (t) => `https://www.disneyplus.com/search/${encodeURIComponent(t)}`,
  crunchyroll:  (t) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(t)}`,
  youtube:      (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t)}`,
  twitch:       (t) => `https://www.twitch.tv/search?term=${encodeURIComponent(t)}`,
  hbomax:       (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
  apple:        (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
  joyn:         (t) => `https://www.joyn.de/serien?search=${encodeURIComponent(t)}`,
  ard:          (t) => `https://www.ardmediathek.de/suche/${encodeURIComponent(t)}`,
  zdf:          (t) => `https://www.zdf.de/suche?q=${encodeURIComponent(t)}`,
  rtl:          (t) => `https://plus.rtl.de/suche?q=${encodeURIComponent(t)}`,
};

function getFaviconUrl(id) {
  const domains = {
    apple:'tv.apple.com', ard:'ardmediathek.de', burning:'bs.to',
    cineto:'cine.to', crunchyroll:'crunchyroll.com', dazn:'dazn.com',
    disney:'disneyplus.com', hbomax:'max.com', joyn:'joyn.de',
    mubi:'mubi.com', netflix:'netflix.com', paramountplus:'paramountplus.com',
    prime:'primevideo.com', rtl:'plus.rtl.de', skygo:'sky.de',
    twitch:'twitch.tv', youtube:'youtube.com', zdf:'zdf.de',
  };
  const d = domains[id] || new URL(PROVIDERS[id]?.url||'https://example.com').hostname;
  return `https://www.google.com/s2/favicons?sz=64&domain=${d}`;
}

// ══════════════════════════════
// STATE
// ══════════════════════════════
let currentProvider = null;
let currentWebview  = null;
let pipProviderId   = null;
let isFullscreen    = false;
let fsHoverTimer    = null;
let fsAutoHide      = null;
let clockInterval   = null;
let settings        = {};
let imgEditorState  = { providerId:null, url:'', x:0, y:0 };
let clockPrevSettings = null;
let clockUnsaved      = false;
let searchTimer       = null;
let searchPage        = 1;
let lastSearchQuery   = '';
let newsCurTab        = 'trending';

// ══════════════════════════════
// INIT
// ══════════════════════════════
async function init() {
  settings = await window.electronAPI.getSettings();
  settings.favorites        = settings.favorites        || [];
  settings.cardImages       = settings.cardImages       || {};
  settings.cardImageOffsets = settings.cardImageOffsets || {};
  settings.clock            = settings.clock            || { enabled:false, position:{x:16,y:52}, color:'#bfbfbf', opacity:0.85, size:22 };
  settings.fontSize         = settings.fontSize         || 14;
  settings.accentColor      = settings.accentColor      || '#30c5bb';

  applyFontSize(settings.fontSize);
  applySettings(settings, false);

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

  window.electronAPI.onFullscreenChange(v => { isFullscreen=v; updateFullscreenUI(); });
  window.electronAPI.onSessionsCleared(() => buildSettingsAccountTab());

  isFullscreen = await window.electronAPI.isFullscreen();
  updateFullscreenUI();
}

// ══════════════════════════════
// THEME
// ══════════════════════════════
function setTheme(t, save=true) {
  document.documentElement.setAttribute('data-theme', t);
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t==='light');
  if (save) window.electronAPI.setTheme(t);
}
function setupThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('change', e => setTheme(e.target.checked?'light':'dark'));
}

// ══════════════════════════════
// FONT SIZE
// ══════════════════════════════
function applyFontSize(px) {
  document.documentElement.style.setProperty('--fs', px+'px');
}

// ══════════════════════════════
// SETTINGS
// ══════════════════════════════
function applySettings(s, save=true) {
  const root = document.documentElement;
  const mc   = document.getElementById('main-content');

  if (s.appBgImage) {
    if (mc) { mc.style.backgroundImage=`url("${s.appBgImage}")`; mc.style.backgroundSize='cover'; mc.style.backgroundPosition='center'; mc.classList.add('has-bg'); }
    root.style.setProperty('--bgs','rgba(10,10,20,0.75)');
  } else {
    if (mc) { mc.style.backgroundImage=''; mc.classList.remove('has-bg'); }
    root.style.removeProperty('--bgs');
  }

  const acc = s.accentColor||'#30c5bb';
  root.style.setProperty('--acc', acc);
  const rgb = hexToRgb(acc);
  if (rgb) root.style.setProperty('--accg',`rgba(${rgb},.18)`);

  const li = document.getElementById('logo-img');
  if (li) li.src = s.logoImage||'assets/icon.png';

  Object.entries(s.cardImages||{}).forEach(([id,url])=>{
    const el=document.querySelector(`.provider-card[data-id="${id}"] .card-banner-img`);
    if(!el) return;
    if(url){ const off=(s.cardImageOffsets||{})[id]||{x:0,y:0}; el.style.backgroundImage=`url("${url}")`; el.style.backgroundPosition=`calc(50% + ${off.x}px) calc(50% + ${off.y}px)`; el.style.opacity='1'; }
    else { el.style.backgroundImage=''; el.style.opacity='0'; }
  });

  setupClock();
  if (save) window.electronAPI.setSettings(s);
}

function hexToRgb(hex) {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r?`${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}`:null;
}

// ══════════════════════════════
// TITLEBAR
// ══════════════════════════════
function setupTitlebar() {
  document.getElementById('btn-minimize')?.addEventListener('click',()=>window.electronAPI.minimize());
  document.getElementById('btn-maximize')?.addEventListener('click',()=>window.electronAPI.maximize());
  document.getElementById('btn-close')?.addEventListener('click',  ()=>window.electronAPI.close());
}

// ══════════════════════════════
// NAVIGATION
// ══════════════════════════════
function showView(id) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${id}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${id}"]`)?.classList.add('active');
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const v=btn.dataset.view;
      if (v==='home') { maybeMoveToPip(); showView('home'); }
      else if (v==='stream') {
        if (!currentProvider && !pipProviderId) showView('nothing');
        else if (currentProvider) showView('stream');
        else restoreFromPip();
      }
      else if (v==='news') { showView('news'); loadNews(newsCurTab); }
      else showView(v);
    });
  });

  setupToggle('nav-fav-toggle','nav-sub-favorites');
  setupToggle('nav-providers-toggle','nav-sub-providers');
  document.getElementById('goto-home-btn')?.addEventListener('click',()=>showView('home'));

  // News tabs
  document.querySelectorAll('.news-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.news-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      newsCurTab = tab.dataset.tab;
      loadNews(newsCurTab);
    });
  });
}

function setupToggle(btnId, subId) {
  const btn=document.getElementById(btnId), sub=document.getElementById(subId);
  btn?.addEventListener('click',()=>{ btn.classList.toggle('open'); sub?.classList.toggle('open'); });
}

// ══════════════════════════════
// NEWS
// ══════════════════════════════
async function loadNews(tab) {
  const content = document.getElementById('news-content');
  if (!content) return;
  content.innerHTML = '<div class="news-loading">Wird geladen…</div>';

  try {
    const data = tab==='trending'
      ? await window.electronAPI.getTrending()
      : await window.electronAPI.getNewReleases();

    if (data.error) { content.innerHTML=`<div class="news-loading">Fehler: ${data.error}</div>`; return; }

    const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';

    function makeCard(item, type) {
      const title   = item.title||item.name||'Unbekannt';
      const date    = item.release_date||item.first_air_date||'';
      const rating  = item.vote_average ? item.vote_average.toFixed(1) : null;
      const poster  = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null;
      const wseUrl  = `https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(title)}`;

      const card = document.createElement('div');
      card.className = 'news-card';
      card.innerHTML = `
        ${poster
          ? `<img class="news-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.outerHTML='<div class=news-card-poster-ph><svg width=24 height=24 viewBox=\\'0 0 24 24\\' fill=none stroke=currentColor stroke-width=1.5><rect x=3 y=3 width=18 height=18 rx=2/></svg></div>'">`
          : `<div class="news-card-poster-ph"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>`
        }
        <div class="news-card-body">
          <div class="news-card-title">${esc(title)}</div>
          <div class="news-card-meta">
            ${date?date.substring(0,4):''}
            ${rating?`<span class="news-card-rating">★ ${rating}</span>`:''}
          </div>
          <button class="news-wse-btn">↗ Wo streamen?</button>
        </div>
      `;
      card.querySelector('.news-wse-btn').addEventListener('click', e=>{
        e.stopPropagation();
        window.electronAPI.openExternal(wseUrl);
      });
      card.addEventListener('click', ()=>window.electronAPI.openExternal(wseUrl));
      return card;
    }

    content.innerHTML = '';

    const moviesLabel = document.createElement('div');
    moviesLabel.className = 'news-section-title';
    moviesLabel.textContent = tab==='trending' ? '🔥 Trending Filme' : '✨ Neue Filme';
    content.appendChild(moviesLabel);

    const moviesGrid = document.createElement('div');
    moviesGrid.className = 'news-grid';
    (data.movies||[]).forEach(m=>moviesGrid.appendChild(makeCard(m,'movie')));
    content.appendChild(moviesGrid);

    const showsLabel = document.createElement('div');
    showsLabel.className = 'news-section-title';
    showsLabel.textContent = tab==='trending' ? '🔥 Trending Serien' : '✨ Neue Serien';
    content.appendChild(showsLabel);

    const showsGrid = document.createElement('div');
    showsGrid.className = 'news-grid';
    (data.shows||[]).forEach(s=>showsGrid.appendChild(makeCard(s,'tv')));
    content.appendChild(showsGrid);
  } catch(e) {
    content.innerHTML = `<div class="news-loading">Fehler beim Laden: ${e.message}</div>`;
  }
}

// ══════════════════════════════
// SEARCH – Dropdown
// ══════════════════════════════
function setupSearch() {
  const input  = document.getElementById('search-input');
  const clear  = document.getElementById('search-clear');
  const dd     = document.getElementById('search-dropdown');

  input?.addEventListener('input', ()=>{
    const q = input.value.trim();
    clear.style.display = q?'block':'none';
    clearTimeout(searchTimer);
    if (!q) { dd.style.display='none'; dd.innerHTML=''; return; }
    lastSearchQuery = q; searchPage = 1;
    searchTimer = setTimeout(()=>runSearch(q, 1), 450);
  });

  clear?.addEventListener('click', ()=>{
    input.value=''; clear.style.display='none';
    dd.style.display='none'; dd.innerHTML='';
  });

  // Außerhalb klicken → schließen
  document.addEventListener('mousedown', e=>{
    const wrap = document.getElementById('search-bar')?.closest('.search-bar-wrap');
    if (wrap && !wrap.contains(e.target)) { dd.style.display='none'; }
  });
}

async function runSearch(q, page=1) {
  const dd = document.getElementById('search-dropdown');
  dd.style.display = 'block';
  if (page===1) dd.innerHTML = '<div class="search-dd-loading">Suche…</div>';

  // Provider-Treffer
  const provMatches = Object.entries(PROVIDERS).filter(([,p])=>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  // YouTube
  const ytId = extractYtId(q);

  let html = '';

  // Provider
  if (provMatches.length && page===1) {
    html += `<div class="search-dd-section">Anbieter</div>`;
    provMatches.slice(0,3).forEach(([id,p])=>{
      html += `<div class="search-dd-item" onclick="openProvider('${id}')">
        <img class="search-dd-poster" src="${getFaviconUrl(id)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/>
        <div class="search-dd-info">
          <div class="search-dd-title">${esc(p.name)}</div>
          <div class="search-dd-meta"><span class="search-dd-badge">Anbieter</span> ${esc(p.tag)}</div>
        </div>
      </div>`;
    });
  }

  // YouTube direkt
  if (ytId && page===1) {
    html += `<div class="search-dd-section">YouTube Video</div>
    <div class="search-dd-item" onclick="openProvider('youtube')">
      <img class="search-dd-poster" src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:80px;height:46px;border-radius:5px;object-fit:cover" onerror="this.style.display='none'"/>
      <div class="search-dd-info">
        <div class="search-dd-title">YouTube Video öffnen</div>
        <div class="search-dd-meta">Direkt in OmniSight abspielen</div>
        <div class="search-dd-providers" style="margin-top:4px">
          <div class="search-dd-provider-chip" onclick="event.stopPropagation();openProvider('youtube')"><img src="${getFaviconUrl('youtube')}"/>YouTube</div>
        </div>
      </div>
    </div>`;
  }

  // OMDB Ergebnisse
  if (!ytId) {
    try {
      const data = await window.electronAPI.searchTitle(q);
      if (data.Search && data.Search.length) {
        const start  = (page-1)*5;
        const items  = data.Search.slice(start, start+5);
        const total  = parseInt(data.totalResults)||data.Search.length;
        const hasMore= (start+5) < Math.min(total, data.Search.length);

        if (page===1) html += `<div class="search-dd-section">Filme & Serien</div>`;

        for (const item of items) {
          // Detail abrufen für Laufzeit + Bewertung
          let detail = null;
          try { detail = await window.electronAPI.searchTitleDetail(item.imdbID); } catch {}

          const typeLabel = item.Type==='movie'?'Film':item.Type==='series'?'Serie':item.Type;
          const runtime   = detail?.Runtime && detail.Runtime!=='N/A' ? detail.Runtime : null;
          const imdbR     = detail?.imdbRating && detail.imdbRating!=='N/A' ? detail.imdbRating : null;
          const rtR       = detail?.Ratings?.find(r=>r.Source==='Rotten Tomatoes')?.Value || null;
          const wseUrl    = `https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(item.Title)}`;

          // Provider-Chips (Demo: wir zeigen Suche-Links für bekannte Provider)
          const providerChips = Object.entries(SEARCH_URLS)
            .slice(0,4)
            .map(([id,urlFn])=>{
              const p = PROVIDERS[id];
              return `<div class="search-dd-provider-chip" onclick="event.stopPropagation();openProviderWithSearch('${id}','${esc(item.Title)}')">
                <img src="${getFaviconUrl(id)}" onerror="this.style.display='none'"/>${p.name}
              </div>`;
            }).join('');

          html += `<div class="search-dd-item">
            ${item.Poster&&item.Poster!=='N/A'
              ? `<img class="search-dd-poster" src="${item.Poster}" onerror="this.className='search-dd-poster-ph';this.innerHTML='🎬'"/>`
              : `<div class="search-dd-poster-ph">🎬</div>`}
            <div class="search-dd-info">
              <div class="search-dd-title">${esc(item.Title)}</div>
              <div class="search-dd-meta">
                <span class="search-dd-badge">${typeLabel}</span>
                ${item.Year?`<span>${item.Year}</span>`:''}
                ${runtime?`<span>⏱ ${runtime}</span>`:''}
                ${imdbR?`<span class="search-dd-rating">IMDb ${imdbR}</span>`:''}
                ${rtR?`<span class="search-dd-rating">🍅 ${rtR}</span>`:''}
              </div>
              <div class="search-dd-providers">${providerChips}
                <div class="search-dd-provider-chip" onclick="event.stopPropagation();window.electronAPI.openExternal('${wseUrl}')">↗ Alle</div>
              </div>
            </div>
          </div>`;
        }

        if (hasMore) {
          html += `<div class="search-dd-more" id="search-dd-more-btn">Weitere Ergebnisse anzeigen ↓</div>`;
        }
      } else if (!provMatches.length && !ytId) {
        html += `<div class="search-dd-empty">Keine Ergebnisse für „${esc(q)}"</div>`;
      }
    } catch {}
  }

  // werstreamt.es Footer
  if (!ytId) {
    html += `<div class="search-dd-wse">
      <span>Verfügbarkeit prüfen:</span>
      <button onclick="window.electronAPI.openExternal('https://www.werstreamt.es/filme-und-serien/?q=${encodeURIComponent(q)}')">↗ werstreamt.es</button>
    </div>`;
  }

  if (page===1) dd.innerHTML = html;
  else {
    // Append – "Mehr"-Button entfernen und neue Items einfügen
    const moreBtn = document.getElementById('search-dd-more-btn');
    if (moreBtn) moreBtn.remove();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('.search-dd-item').forEach(el=>dd.insertBefore(el, dd.querySelector('.search-dd-wse')||null));
  }

  // "Mehr" Button Event
  document.getElementById('search-dd-more-btn')?.addEventListener('click', ()=>{
    searchPage++;
    runSearch(lastSearchQuery, searchPage);
  });
}

function extractYtId(str) {
  const p=[
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const r of p) { const m=str.match(r); if(m) return m[1]; }
  return null;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Global für onclick in innerHTML
window.openProvider            = openProvider;
window.openProviderWithSearch  = openProviderWithSearch;

function openProviderWithSearch(id, title) {
  const urlFn = SEARCH_URLS[id];
  if (!urlFn) { openProvider(id); return; }
  openProviderAtUrl(id, urlFn(title));
}

// ══════════════════════════════
// PROVIDER GRID
// ══════════════════════════════
function buildProviderGrid() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  grid.innerHTML='';

  const favs   = settings.favorites||[];
  const sorted = Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const favL   = sorted.filter(([id])=>favs.includes(id));
  const rest   = sorted.filter(([id])=>!favs.includes(id));

  if (favL.length) { addLabel(grid,'⭐ Favoriten'); favL.forEach(([id,p])=>grid.appendChild(createCard(id,p,true))); }
  if (rest.length) { if(favL.length) addLabel(grid,'Alle Anbieter'); rest.forEach(([id,p])=>grid.appendChild(createCard(id,p,false))); }
}

function addLabel(grid,text) {
  const el=document.createElement('div'); el.className='grid-section-label'; el.textContent=text; grid.appendChild(el);
}

function createCard(id,p,isFav) {
  const card=document.createElement('div');
  card.className='provider-card'; card.dataset.id=id;
  const imgUrl=(settings.cardImages||{})[id]||'';
  const off=(settings.cardImageOffsets||{})[id]||{x:0,y:0};
  card.innerHTML=`
    <button class="card-star ${isFav?'active':''}" data-id="${id}">
      <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" ${isFav?'fill="currentColor"':'fill="none"'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </button>
    <div class="card-banner">
      <div class="card-banner-gradient" style="background:radial-gradient(ellipse at center,${p.color}55 0%,${p.color}22 50%,transparent 80%)"></div>
      <div class="card-banner-img" style="${imgUrl?`background-image:url('${imgUrl}');background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);background-size:cover;position:absolute;inset:0;opacity:1;transition:opacity .3s`:'opacity:0;position:absolute;inset:0'}"></div>
      <img class="card-favicon" src="${getFaviconUrl(id)}" alt="${p.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        style="position:relative;z-index:2;width:52px;height:52px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));transition:transform .2s"/>
      <div class="card-favicon-placeholder" style="display:none;background:${p.color}33">${p.name.charAt(0)}</div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <span class="card-name">${p.name}</span>
        <span class="card-tag">${p.tag}</span>
      </div>
      <span class="card-arrow">→</span>
    </div>`;
  card.querySelector('.card-star').addEventListener('click',e=>{e.stopPropagation();toggleFavorite(id);});
  card.addEventListener('click',e=>{if(!e.target.closest('.card-star'))openProvider(id);});
  return card;
}

function toggleFavorite(id) {
  const favs=settings.favorites||[]; const idx=favs.indexOf(id);
  if(idx===-1) favs.push(id); else favs.splice(idx,1);
  settings.favorites=favs; window.electronAPI.setSettings(settings);
  buildProviderGrid(); buildSidebarSubMenus();
}

// ══════════════════════════════
// SIDEBAR MENUS
// ══════════════════════════════
function buildSidebarSubMenus() { buildFavSub(); buildProvSub(); }

function buildFavSub() {
  const sub=document.getElementById('nav-sub-favorites'); if(!sub) return; sub.innerHTML='';
  const favs=settings.favorites||[];
  if(!favs.length){ const h=document.createElement('div'); h.style.cssText='padding:5px 10px;font-size:11px;color:var(--tx3)'; h.textContent='Noch keine Favoriten'; sub.appendChild(h); return; }
  favs.forEach(id=>{ const p=PROVIDERS[id]; if(p) sub.appendChild(makeSubBtn(id,p)); });
}

function buildProvSub() {
  const sub=document.getElementById('nav-sub-providers'); if(!sub) return; sub.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>sub.appendChild(makeSubBtn(id,p)));
}

function makeSubBtn(id,p) {
  const btn=document.createElement('button'); btn.className='nav-sub-btn';
  btn.innerHTML=`<img src="${getFaviconUrl(id)}" onerror="this.outerHTML='<span class=\\'dot\\' style=\\'background:${p.color}\\'></span>'" alt="" width="14" height="14" style="border-radius:2px;object-fit:contain;flex-shrink:0"/>${p.name}`;
  btn.addEventListener('click',()=>openProvider(id)); return btn;
}

// ══════════════════════════════
// PROVIDER ÖFFNEN
// ══════════════════════════════
function openProvider(id) {
  openProviderAtUrl(id, PROVIDERS[id]?.url);
}

function openProviderAtUrl(id, url) {
  const p=PROVIDERS[id]; if(!p||!url) return;

  if (currentWebview && currentProvider && currentProvider!==id) {
    moveToPip(currentProvider, currentWebview); currentWebview=null; currentProvider=null;
  }
  if (pipProviderId===id) { restoreFromPip(); return; }

  currentProvider=id;
  showLoading(`${p.name} wird geöffnet…`);
  document.getElementById('stream-title').textContent=p.name;
  document.getElementById('btn-watching').style.display='flex';

  window.electronAPI.setupWebviewSession(p.partition);
  const wrap=document.getElementById('webview-wrap'); if(wrap) wrap.innerHTML='';

  const wv=document.createElement('webview');
  wv.setAttribute('src', url);
  wv.setAttribute('partition', p.partition);
  wv.setAttribute('allowpopups','');
  wv.setAttribute('useragent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
  wv.style.cssText='width:100%;height:100%;border:none;display:flex';
  currentWebview=wv; if(wrap) wrap.appendChild(wv);

  wv.addEventListener('did-start-loading',()=>showLoading(`${p.name} wird geladen…`));
  wv.addEventListener('did-stop-loading', ()=>hideLoading());
  wv.addEventListener('did-fail-load', async e=>{
    if(e.errorCode===-3||e.errorCode===0) return;
    hideLoading();
    let diag='';
    try{ const r=await window.electronAPI.checkUrl(p.url); diag=r.ok?`Webseite erreichbar (HTTP ${r.status}), aber Einbettung blockiert.`:`Verbindungsfehler: ${r.error}`; }catch{}
    showWebviewError(p,e.errorCode,e.errorDescription,diag);
  });

  // Dropdown schließen
  document.getElementById('search-dropdown').style.display='none';
  showView('stream');
}

// ══════════════════════════════
// STREAM
// ══════════════════════════════
function stopStream() {
  if(isFullscreen) window.electronAPI.setFullscreen(false);
  const wrap=document.getElementById('webview-wrap'); if(wrap) wrap.innerHTML='';
  currentWebview=null; currentProvider=null; showView('home');
}

function maybeMoveToPip() {
  if(currentWebview&&currentProvider){ moveToPip(currentProvider,currentWebview); currentWebview=null; currentProvider=null; }
}

function setupStreamControls() {
  document.getElementById('back-btn')?.addEventListener('click',()=>{ if(isFullscreen) window.electronAPI.setFullscreen(false); maybeMoveToPip(); showView('home'); });
  document.getElementById('btn-stop')?.addEventListener('click',()=>{ if(!confirm('Stream beenden?')) return; stopStream(); });
  document.getElementById('btn-pip')?.addEventListener('click',()=>{ if(currentWebview&&currentProvider){ maybeMoveToPip(); showView('home'); } });
  document.getElementById('btn-fullscreen')?.addEventListener('click',()=>window.electronAPI.setFullscreen(!isFullscreen));
  document.getElementById('btn-logout-provider')?.addEventListener('click',()=>{
    if(!currentProvider) return;
    const p=PROVIDERS[currentProvider]; if(!confirm(`Von ${p.name} abmelden?`)) return;
    window.electronAPI.clearProviderSession(currentProvider);
    if(currentWebview) currentWebview.loadURL(p.url);
    buildSettingsAccountTab();
  });
}

// ══════════════════════════════
// PIP
// ══════════════════════════════
function setupPip() {
  const pip=document.getElementById('pip-window'); if(!pip) return;
  let drag=false,ox=0,oy=0;
  document.getElementById('pip-topbar')?.addEventListener('mousedown',e=>{ drag=true; const r=pip.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top; e.preventDefault(); });
  document.addEventListener('mousemove',e=>{ if(!drag) return; let nx=Math.max(0,Math.min(window.innerWidth-pip.offsetWidth,e.clientX-ox)); let ny=Math.max(0,Math.min(window.innerHeight-pip.offsetHeight,e.clientY-oy)); pip.style.left=nx+'px'; pip.style.top=ny+'px'; pip.style.right='auto'; pip.style.bottom='auto'; });
  document.addEventListener('mouseup',()=>drag=false);
  document.getElementById('pip-expand')?.addEventListener('click',restoreFromPip);
  document.getElementById('pip-close')?.addEventListener('click',()=>{ pip.style.display='none'; document.getElementById('pip-content').innerHTML=''; pipProviderId=null; });
}

function moveToPip(providerId, wvNode) {
  const pip=document.getElementById('pip-window'), content=document.getElementById('pip-content'), title=document.getElementById('pip-title');
  if(!pip||!content) return;
  content.innerHTML='';
  if(wvNode&&wvNode.parentNode) wvNode.parentNode.removeChild(wvNode);
  if(wvNode){ wvNode.style.cssText='width:100%;height:100%;border:none;display:flex'; content.appendChild(wvNode); }
  pipProviderId=providerId;
  if(title) title.textContent=PROVIDERS[providerId]?.name||providerId;
  pip.style.left='auto'; pip.style.top='auto'; pip.style.right='24px'; pip.style.bottom='24px';
  pip.style.display='flex';
}

function restoreFromPip() {
  if(!pipProviderId) return;
  const id=pipProviderId, pip=document.getElementById('pip-window'), content=document.getElementById('pip-content'), wrap=document.getElementById('webview-wrap');
  if(!content||!wrap) return;
  const wv=content.querySelector('webview');
  if(wv){ wv.parentNode.removeChild(wv); wv.style.cssText='width:100%;height:100%;border:none;display:flex'; wrap.innerHTML=''; wrap.appendChild(wv); currentWebview=wv; }
  content.innerHTML=''; pip.style.display='none'; pipProviderId=null; currentProvider=id;
  document.getElementById('stream-title').textContent=PROVIDERS[id]?.name||id;
  document.getElementById('btn-watching').style.display='flex';
  showView('stream');
}

// ══════════════════════════════
// FULLSCREEN
// ══════════════════════════════
function updateFullscreenUI() {
  const topbar=document.getElementById('stream-topbar'), sidebar=document.getElementById('sidebar');
  const tb=document.getElementById('titlebar'), wrap=document.getElementById('webview-wrap'), btn=document.getElementById('btn-fullscreen');
  if(isFullscreen){
    [topbar,sidebar,tb].forEach(el=>el?.classList.add('hidden'));
    if(wrap) wrap.style.cssText='position:fixed;inset:0;z-index:500;background:#000';
    if(btn) btn.innerHTML=svgMin()+' Beenden';
  } else {
    [topbar,sidebar,tb].forEach(el=>el?.classList.remove('hidden'));
    if(wrap) wrap.style.cssText='';
    if(btn) btn.innerHTML=svgMax()+' Vollbild';
    document.getElementById('fs-exit-btn')?.classList.remove('visible');
  }
}

function svgMax(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;}
function svgMin(){return`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>`;}

function setupFullscreenExit() {
  const btn=document.getElementById('fs-exit-btn'); if(!btn) return;
  document.addEventListener('mousemove',e=>{
    if(!isFullscreen) return;
    const zone=113, cx=window.innerWidth/2;
    const inZ=Math.abs(e.clientX-cx)<zone/2&&e.clientY<zone;
    if(inZ){ if(!fsHoverTimer) fsHoverTimer=setTimeout(()=>{ btn.classList.add('visible'); clearTimeout(fsAutoHide); fsAutoHide=setTimeout(()=>btn.classList.remove('visible'),3000); },1000); }
    else { clearTimeout(fsHoverTimer); fsHoverTimer=null; }
  });
  btn.addEventListener('click',()=>{ window.electronAPI.setFullscreen(false); btn.classList.remove('visible'); });
}

function setupESCKey() {
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&isFullscreen) window.electronAPI.setFullscreen(false); });
}

// ══════════════════════════════
// CLOCK
// ══════════════════════════════
function setupClock() {
  clearInterval(clockInterval);
  const widget=document.getElementById('clock-widget'), timeEl=document.getElementById('clock-time');
  if(!widget||!timeEl) return;
  const clk=settings.clock||{};
  if(!clk.enabled){ widget.style.display='none'; return; }

  const pos=clk.position||{};
  widget.style.display='block';
  if(pos.x!==null&&pos.x!==undefined){ widget.style.left=pos.x+'px'; widget.style.top=pos.y+'px'; widget.style.right='auto'; widget.style.bottom='auto'; }
  else { widget.style.left='16px'; widget.style.top='52px'; widget.style.right='auto'; widget.style.bottom='auto'; }
  widget.style.color   = clk.color||'#bfbfbf';
  widget.style.opacity = clk.opacity??0.85;
  widget.style.fontSize= (clk.size||22)+'px';

  const tick=()=>{ const n=new Date(); timeEl.textContent=`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`; };
  tick(); clockInterval=setInterval(tick,1000);
}

function pad(n){return String(n).padStart(2,'0');}

function previewClock() {
  const widget=document.getElementById('clock-widget'); if(!widget) return;
  const enabled=document.getElementById('clock-enabled')?.checked;
  const color  =document.getElementById('clock-color-text')?.value||'#bfbfbf';
  const opacity=(parseInt(document.getElementById('clock-opacity')?.value)||85)/100;
  const size   =parseInt(document.getElementById('clock-size')?.value)||22;

  // Status-Label
  const lbl=document.getElementById('clock-status-label');
  if(lbl) lbl.textContent=enabled?'Aktiviert':'Deaktiviert';

  if(!enabled){ widget.style.display='none'; clockUnsaved=true; markClockUnsaved(); return; }
  widget.style.display='block';
  widget.style.color=color; widget.style.opacity=opacity; widget.style.fontSize=size+'px';
  clockUnsaved=true; markClockUnsaved();
}

function markClockUnsaved() {
  const h=document.getElementById('clock-unsaved-hint'); if(h) h.style.display='block';
}

function startClockDrag() {
  const widget=document.getElementById('clock-widget'); if(!widget) return;
  widget.style.display='block';
  widget.classList.add('draggable'); clockUnsaved=true; markClockUnsaved();

  let drag=false,ox=0,oy=0;
  function onDown(e){ drag=true; const r=widget.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top; e.preventDefault(); }
  function onMove(e){ if(!drag) return; widget.style.left=Math.max(0,Math.min(window.innerWidth-widget.offsetWidth,e.clientX-ox))+'px'; widget.style.top=Math.max(0,Math.min(window.innerHeight-widget.offsetHeight,e.clientY-oy))+'px'; widget.style.right='auto'; widget.style.bottom='auto'; }
  function onUp(){ if(!drag) return; drag=false; const r=widget.getBoundingClientRect(); settings.clock._pendingPos={x:Math.round(r.left),y:Math.round(r.top)}; clockUnsaved=true; markClockUnsaved(); }

  widget.addEventListener('mousedown',onDown);
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);

  const btn=document.getElementById('clock-drag-mode-btn');
  if(btn){ btn.textContent='✓ Fertig'; btn.onclick=()=>{ widget.classList.remove('draggable'); document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); widget.removeEventListener('mousedown',onDown); btn.textContent='✋ Uhr verschieben'; btn.onclick=startClockDrag; }; }
}

function setupClockUnsavedDialog() {
  document.getElementById('clock-save-btn')?.addEventListener('click',()=>{ saveClockSettings(); document.getElementById('clock-unsaved-overlay').style.display='none'; closeSettingsForReal(); });
  document.getElementById('clock-disable-btn')?.addEventListener('click',()=>{ settings.clock.enabled=false; window.electronAPI.setSettings(settings); setupClock(); clockUnsaved=false; document.getElementById('clock-unsaved-overlay').style.display='none'; const lbl=document.getElementById('clock-status-label'); if(lbl) lbl.textContent='Deaktiviert'; closeSettingsForReal(); });
  document.getElementById('clock-cancel-btn')?.addEventListener('click',()=>{ if(clockPrevSettings){ settings.clock=JSON.parse(JSON.stringify(clockPrevSettings)); setupClock(); } clockUnsaved=false; document.getElementById('clock-unsaved-overlay').style.display='none'; const h=document.getElementById('clock-unsaved-hint'); if(h) h.style.display='none'; });
}

function saveClockSettings() {
  const pPos=settings.clock._pendingPos;
  settings.clock={
    enabled: document.getElementById('clock-enabled')?.checked??settings.clock.enabled,
    position: pPos||settings.clock.position||{x:16,y:52},
    color:   document.getElementById('clock-color-text')?.value||'#bfbfbf',
    opacity: (parseInt(document.getElementById('clock-opacity')?.value)||85)/100,
    size:    parseInt(document.getElementById('clock-size')?.value)||22,
  };
  delete settings.clock._pendingPos;
  window.electronAPI.setSettings(settings); setupClock();
  clockUnsaved=false; const h=document.getElementById('clock-unsaved-hint'); if(h) h.style.display='none';
}

// ══════════════════════════════
// SETTINGS
// ══════════════════════════════
function setupSettingsPanel() {
  document.getElementById('btn-settings')?.addEventListener('click', openSettings);
  document.getElementById('settings-close')?.addEventListener('click', closeSettings);
  document.getElementById('settings-overlay')?.addEventListener('click', closeSettings);

  document.querySelectorAll('.stab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.stab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.stab-content').forEach(c=>c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`stab-${tab.dataset.tab}`)?.classList.add('active');
      if(tab.dataset.tab==='account') buildSettingsAccountTab();
      if(tab.dataset.tab==='cards')   buildSettingsCardTab();
      if(tab.dataset.tab==='clock')   syncClockUI();
    });
  });

  linkColor('set-accent-color','set-accent-text');
  linkColor('clock-color','clock-color-text');

  document.querySelectorAll('.reset-btn[data-reset]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.dataset.reset;
      if(k==='accentColor'){ settings.accentColor='#30c5bb'; syncAppearanceUI(); }
      else if(k==='logoImage'){ settings.logoImage=''; const li=document.getElementById('logo-img'); if(li) li.src='assets/icon.png'; updatePreview('prev-logo',null); }
      else if(k==='appBgImage'){ settings.appBgImage=''; updatePreview('prev-app-bg',null); }
      applySettings(settings);
    });
  });

  document.querySelectorAll('.pick-btn[data-pick]').forEach(btn=>{
    btn.addEventListener('click',()=>handlePickImage(btn.dataset.pick));
  });

  // Font size slider
  const fsr=document.getElementById('font-size-range'), fsv=document.getElementById('font-size-val');
  fsr?.addEventListener('input',()=>{ const v=parseInt(fsr.value); if(fsv) fsv.textContent=v+'px'; settings.fontSize=v; applyFontSize(v); });

  // Clock live
  ['clock-enabled','clock-color','clock-opacity','clock-size'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',previewClock);
    document.getElementById(id)?.addEventListener('change',previewClock);
  });
  document.getElementById('clock-color-text')?.addEventListener('input',previewClock);
  document.getElementById('clock-opacity')?.addEventListener('input',e=>{ document.getElementById('clock-opacity-val').textContent=e.target.value+'%'; });
  document.getElementById('clock-size')?.addEventListener('input',e=>{ document.getElementById('clock-size-val').textContent=e.target.value+'px'; });
  document.getElementById('clock-drag-mode-btn')?.addEventListener('click',startClockDrag);

  document.getElementById('settings-save')?.addEventListener('click',()=>{
    settings.accentColor=document.getElementById('set-accent-text')?.value.trim()||'#30c5bb';
    if(clockUnsaved){ document.getElementById('clock-unsaved-overlay').style.display='flex'; return; }
    applySettings(settings); closeSettingsForReal();
  });

  document.getElementById('btn-logout-all')?.addEventListener('click',()=>{
    if(!confirm('Von ALLEN Diensten abmelden?')) return;
    window.electronAPI.clearAllSessions(); buildSettingsAccountTab();
  });

  syncAppearanceUI();
}

function openSettings() {
  clockPrevSettings=JSON.parse(JSON.stringify(settings.clock));
  clockUnsaved=false;
  document.getElementById('settings-panel')?.classList.add('open');
  document.getElementById('settings-overlay')?.classList.add('open');
  buildSettingsAccountTab(); buildSettingsCardTab(); syncClockUI(); syncAppearanceUI();
}

function closeSettings() {
  if(clockUnsaved){ document.getElementById('clock-unsaved-overlay').style.display='flex'; return; }
  closeSettingsForReal();
}

function closeSettingsForReal() {
  document.getElementById('settings-panel')?.classList.remove('open');
  document.getElementById('settings-overlay')?.classList.remove('open');
}

async function handlePickImage(dest) {
  const url=await window.electronAPI.pickImage(dest); if(!url) return;
  if(dest==='logo'){ settings.logoImage=url; const li=document.getElementById('logo-img'); if(li) li.src=url; updatePreview('prev-logo',url); }
  else if(dest==='appBgImage'){ settings.appBgImage=url; updatePreview('prev-app-bg',url); }
  else if(dest.startsWith('card_')){ const id=dest.replace('card_',''); settings.cardImages[id]=url; applySettings(settings); buildProviderGrid(); buildSettingsCardTab(); openImageEditor(id,url); return; }
  applySettings(settings);
}

function updatePreview(id,url) {
  const el=document.getElementById(id); if(!el) return;
  if(url) el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`;
  else el.innerHTML=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
}

function linkColor(cId,tId){ const c=document.getElementById(cId),t=document.getElementById(tId); if(!c||!t) return; c.addEventListener('input',()=>t.value=c.value); t.addEventListener('input',()=>{ if(/^#[0-9a-fA-F]{6}$/.test(t.value)) c.value=t.value; }); }

function syncAppearanceUI() {
  const acc=settings.accentColor||'#30c5bb';
  const ca=document.getElementById('set-accent-color'),ta=document.getElementById('set-accent-text');
  if(ca) ca.value=acc; if(ta) ta.value=acc;
  if(settings.appBgImage) updatePreview('prev-app-bg',settings.appBgImage);
  if(settings.logoImage)  updatePreview('prev-logo',settings.logoImage);
  const fsr=document.getElementById('font-size-range'),fsv=document.getElementById('font-size-val');
  const fs=settings.fontSize||14; if(fsr) fsr.value=fs; if(fsv) fsv.textContent=fs+'px';
}

function syncClockUI() {
  const clk=settings.clock||{};
  const ce=document.getElementById('clock-enabled'); if(ce) ce.checked=!!clk.enabled;
  const lbl=document.getElementById('clock-status-label'); if(lbl) lbl.textContent=clk.enabled?'Aktiviert':'Deaktiviert';
  const col=clk.color||'#bfbfbf';
  const cc=document.getElementById('clock-color'),ct=document.getElementById('clock-color-text'); if(cc) cc.value=col; if(ct) ct.value=col;
  const op=Math.round((clk.opacity??0.85)*100);
  const co=document.getElementById('clock-opacity'),cv=document.getElementById('clock-opacity-val'); if(co) co.value=op; if(cv) cv.textContent=op+'%';
  const sz=clk.size||22;
  const cs=document.getElementById('clock-size'),csv=document.getElementById('clock-size-val'); if(cs) cs.value=sz; if(csv) csv.textContent=sz+'px';
  const h=document.getElementById('clock-unsaved-hint'); if(h) h.style.display='none';
}

// ══════════════════════════════
// ACCOUNT TAB
// ══════════════════════════════
async function buildSettingsAccountTab() {
  const list=document.getElementById('session-list'); if(!list) return;
  list.innerHTML='<div class="loading-sessions">Wird geprüft…</div>';
  const res=await window.electronAPI.getAllSessions();
  list.innerHTML='';

  const sorted=Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const loggedIn  = sorted.filter(([id])=>!!res[id]);
  const loggedOut = sorted.filter(([id])=>!res[id]);

  if(loggedIn.length){ const lbl=document.createElement('div'); lbl.className='session-group-label'; lbl.textContent='Angemeldet'; list.appendChild(lbl); loggedIn.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,true))); }
  if(loggedOut.length){ const lbl=document.createElement('div'); lbl.className='session-group-label'; lbl.textContent='Nicht angemeldet'; list.appendChild(lbl); loggedOut.forEach(([id,p])=>list.appendChild(makeSessionItem(id,p,false))); }
}

function makeSessionItem(id,p,on) {
  const item=document.createElement('div'); item.className='session-item';
  item.innerHTML=`<span class="session-dot ${on?'active':''}"></span><span class="session-name">${p.name}</span><span class="session-status">${on?'✓':''}</span>${on?`<button class="session-logout-btn" data-id="${id}">Abmelden</button>`:''}`;
  item.querySelector('.session-logout-btn')?.addEventListener('click',()=>{ window.electronAPI.clearProviderSession(id); if(currentProvider===id) stopStream(); buildSettingsAccountTab(); });
  return item;
}

// ══════════════════════════════
// CARD IMAGE LIST
// ══════════════════════════════
function buildSettingsCardTab() {
  const list=document.getElementById('card-image-list'); if(!list) return; list.innerHTML='';
  Object.entries(PROVIDERS).sort((a,b)=>a[1].name.localeCompare(b[1].name)).forEach(([id,p])=>{
    const imgUrl=(settings.cardImages||{})[id]||'';
    const item=document.createElement('div'); item.className='card-img-item';
    item.innerHTML=`<span class="card-img-dot" style="background:${p.color}"></span><span class="card-img-name">${p.name}</span><div class="img-preview" id="prev-card-${id}">${imgUrl?`<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"/>`:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'}</div><button class="pick-btn" style="max-width:60px;font-size:11px" data-card="${id}">Bild</button>${imgUrl?`<button class="pick-btn" style="max-width:50px;font-size:11px;color:var(--acc);border-color:var(--acc)" data-edit="${id}">✎</button><button class="reset-btn" data-card-reset="${id}">↺</button>`:''}`;
    item.querySelector(`[data-card="${id}"]`)?.addEventListener('click',()=>handlePickImage(`card_${id}`));
    item.querySelector(`[data-edit="${id}"]`)?.addEventListener('click',()=>openImageEditor(id,imgUrl));
    item.querySelector(`[data-card-reset="${id}"]`)?.addEventListener('click',()=>{ delete settings.cardImages[id]; delete(settings.cardImageOffsets||{})[id]; applySettings(settings); buildProviderGrid(); buildSettingsCardTab(); });
    list.appendChild(item);
  });
}

// ══════════════════════════════
// IMAGE EDITOR
// ══════════════════════════════
function setupImageEditor() {
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val'),imgEl=document.getElementById('img-editor-img');
  px?.addEventListener('input',()=>{ imgEditorState.x=parseInt(px.value); if(pvx) pvx.textContent=px.value; if(imgEl) imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`; });
  py?.addEventListener('input',()=>{ imgEditorState.y=parseInt(py.value); if(pvy) pvy.textContent=py.value; if(imgEl) imgEl.style.backgroundPosition=`calc(50% + ${imgEditorState.x}px) calc(50% + ${imgEditorState.y}px)`; });
  document.getElementById('img-editor-close')?.addEventListener('click',()=>document.getElementById('img-editor-overlay').style.display='none');
  document.getElementById('img-editor-save')?.addEventListener('click',()=>{ const{providerId,url,x,y}=imgEditorState; settings.cardImages[providerId]=url; settings.cardImageOffsets=settings.cardImageOffsets||{}; settings.cardImageOffsets[providerId]={x,y}; applySettings(settings); buildProviderGrid(); buildSettingsCardTab(); document.getElementById('img-editor-overlay').style.display='none'; });
  document.getElementById('img-editor-remove')?.addEventListener('click',()=>{ const{providerId}=imgEditorState; delete settings.cardImages[providerId]; delete(settings.cardImageOffsets||{})[providerId]; applySettings(settings); buildProviderGrid(); buildSettingsCardTab(); document.getElementById('img-editor-overlay').style.display='none'; });
}

function openImageEditor(providerId,imgUrl) {
  const overlay=document.getElementById('img-editor-overlay'),imgEl=document.getElementById('img-editor-img'),title=document.getElementById('img-editor-title');
  if(!overlay||!imgEl) return;
  const off=(settings.cardImageOffsets||{})[providerId]||{x:0,y:0};
  imgEditorState={providerId,url:imgUrl,x:off.x,y:off.y};
  if(title) title.textContent=`Banner: ${PROVIDERS[providerId]?.name||providerId}`;
  imgEl.style.cssText=`background-image:url("${imgUrl}");background-size:cover;background-repeat:no-repeat;background-position:calc(50% + ${off.x}px) calc(50% + ${off.y}px);position:absolute;inset:0`;
  const px=document.getElementById('pos-x'),py=document.getElementById('pos-y'),pvx=document.getElementById('pos-x-val'),pvy=document.getElementById('pos-y-val');
  if(px){px.value=off.x;} if(py){py.value=off.y;} if(pvx) pvx.textContent=off.x; if(pvy) pvy.textContent=off.y;
  overlay.style.display='flex';
}

// ══════════════════════════════
// WEBVIEW ERROR
// ══════════════════════════════
function showWebviewError(provider,code,desc,diag) {
  const wrap=document.getElementById('webview-wrap'); if(!wrap) return;
  wrap.innerHTML=`<div class="webview-error"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><h3>${provider.name} konnte nicht geladen werden</h3><p>${diag||'Keine Verbindung oder die Seite blockiert den Zugriff.'}</p>${code?`<span class="err-code">Fehlercode: ${code} – ${desc||'Unbekannt'}</span>`:''}<a href="#" onclick="window.electronAPI.openExternal('${provider.url}');return false;">Im Browser öffnen →</a></div>`;
}

function showLoading(text='Wird geladen…'){ document.getElementById('loading-text').textContent=text; document.getElementById('loading-overlay').classList.add('active'); }
function hideLoading(){ document.getElementById('loading-overlay').classList.remove('active'); }

document.addEventListener('DOMContentLoaded', init);
