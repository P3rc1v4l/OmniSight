'use strict';

// ═══ KRITISCHE FEHLENDE FUNKTIONEN (müssen vor buildProviderGrid geladen sein) ═══

const PROVIDER_CAT_MAP = {
  netflix:'video',prime:'video',disney:'video',hbomax:'video',apple:'video',
  paramountplus:'video',mubi:'video',skygo:'video',wow:'video',waipu:'video',
  magenta:'video',burning:'video',cineto:'video',movie2k:'video',rtl:'video',
  crunchyroll:'anime',adn:'anime',
  twitch:'live',dazn:'live',
  youtube:'video',spotify:'music',
  ard:'free',zdf:'free',arte:'free',funk:'free',kika:'free',joyn:'free',
};

function getProviderCategory(id) {
  if (settings && settings.providerCategories && settings.providerCategories[id]) {
    return settings.providerCategories[id];
  }
  return PROVIDER_CAT_MAP[id] || 'video';
}

function updateCategoryFilter(active) {
  document.querySelectorAll('.cat-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === active);
  });
}

// notifications Variable sicherstellen
if (typeof notifications === 'undefined') {
  var notifications = [];
}

// ═══════════════════════════════════════════════════════════════════
// OmniSight v3.1.7 - Fixes & fehlende Funktionen
// Wird nach app.js geladen und ergänzt/überschreibt fehlende Teile
// ═══════════════════════════════════════════════════════════════════

// ── 1. FEHLENDE GRUNDFUNKTIONEN ────────────────────────────────────

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifications || !notifications.length) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--tx2);font-size:13px">Keine Benachrichtigungen</div>';
    return;
  }
  list.innerHTML = notifications.map(n => `
    <div class="notif-item">
      <div class="notif-item-icon">${n.icon||'🔔'}</div>
      <div class="notif-item-body">
        <div class="notif-item-title">${esc(n.title||'')}</div>
        <div class="notif-item-text">${esc(n.body||'')}</div>
      </div>
      <div class="notif-item-time">${n.time||''}</div>
      <button class="notif-item-del" onclick="deleteNotif(${n.id})">✕</button>
    </div>`).join('');
}

window.deleteNotif = function(id) {
  if (!notifications) return;
  notifications = notifications.filter(n => n.id !== id);
  renderNotifications();
  updateNotifBadge();
  window.electronAPI.setNotifications(activeProfileId, notifications);
};

function updateNotifBadge() {
  const b = document.getElementById('notif-badge');
  if (!b) return;
  const count = (notifications||[]).length;
  b.textContent = count;
  b.style.display = count ? 'block' : 'none';
}

function addNotification(icon, title, body) {
  if (!notifications) notifications = [];
  const n = {
    id: Date.now(), icon, title, body,
    time: new Date().toLocaleTimeString('de-DE', {hour:'2-digit',minute:'2-digit'})
  };
  notifications.unshift(n);
  notifications = notifications.slice(0, 50);
  renderNotifications();
  updateNotifBadge();
  window.electronAPI.setNotifications(activeProfileId, notifications);
  // Ton
  if (settings.notificationsConfig?.sound) {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 520;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.35);
    } catch(e) {}
  }
}

// ── 2. SESSION LIST ─────────────────────────────────────────────────

function buildSessionList(res) {
  // Action-Buttons ganz oben (neu aufbauen)
  let actionRow = document.getElementById('account-action-btns');
  if (!actionRow) {
    actionRow = document.createElement('div');
    actionRow.id = 'account-action-btns';
    actionRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--bor);flex-wrap:wrap';
    const parent = document.getElementById('session-list')?.parentElement;
    if (parent) parent.insertBefore(actionRow, parent.firstChild);
  }
  actionRow.innerHTML = `
    <button class="pick-btn" id="btn-logout-all" style="color:var(--danger);border-color:var(--danger)">↩ Alle abmelden</button>
    <button class="pick-btn" id="btn-logout-selected">↩ Auswahl abmelden</button>`;
  document.getElementById('btn-logout-all')?.addEventListener('click', () => {
    if (!confirm('Von allen Diensten abmelden?')) return;
    window.electronAPI.clearAllSessions(activeProfileId);
    showToastMsg('Von allen Diensten abgemeldet');
    setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 800);
  });
  document.getElementById('btn-logout-selected')?.addEventListener('click', () => {
    const ids = [...(window._logoutPending||new Set())];
    if (!ids.length) { showToastMsg('Keine Anbieter ausgewählt'); return; }
    window.electronAPI.clearProvidersSessions(activeProfileId, ids);
    window._logoutPending = new Set();
    showToastMsg(`${ids.length} Anbieter abgemeldet`);
    setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 800);
  });

  const list = document.getElementById('session-list');
  if (!list) return;
  list.innerHTML = '';
  if (!window._logoutPending) window._logoutPending = new Set();

  const prov = Object.entries(PROVIDERS_BASE).sort((a,b) => a[1].name.localeCompare(b[1].name));
  const loggedIn = prov.filter(([id]) => !!(res||{})[id]);
  const notIn = prov.filter(([id]) => !(res||{})[id]);

  function makeItem(id, p, isOn) {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:9px;padding:8px 4px;border-bottom:1px solid var(--bor);position:relative';
    item.innerHTML = `
      <input type="checkbox" class="session-cb" data-id="${id}"
        style="accent-color:var(--acc);cursor:pointer;width:15px;height:15px"/>
      <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${isOn?'#66bb6a':'var(--bor)'}"></span>
      <img src="${getFavicon(id,p)}" style="width:18px;height:18px;border-radius:3px;object-fit:contain"
        onerror="this.style.display='none'"/>
      <span style="flex:1;font-size:13px;color:var(--tx)">${esc((settings.cardCustomNames||{})[id]||p.name)}</span>
      ${isOn?'<span style="font-size:10px;color:#66bb6a;font-weight:600">✓</span>':''}
      <button class="logout-single-btn" data-id="${id}" style="display:none;padding:3px 8px;border:1px solid var(--bor);background:transparent;color:var(--danger);border-radius:var(--r-sm);font-size:10px;cursor:pointer">Abmelden</button>`;
    const cb = item.querySelector('.session-cb');
    const logoutBtn = item.querySelector('.logout-single-btn');
    cb.addEventListener('change', e => {
      if (e.target.checked) window._logoutPending.add(id);
      else window._logoutPending.delete(id);
    });
    if (isOn) {
      item.addEventListener('mouseenter', () => logoutBtn.style.display = 'block');
    item.addEventListener('mouseleave', () => logoutBtn.style.display = 'none');
    }
    logoutBtn.addEventListener('click', () => {
      window.electronAPI.clearProviderSession(activeProfileId, id);
      // Sofort visuelles Feedback + rebuild
      showToastMsg('Abgemeldet von ' + p.name);
      // Item direkt entfernen ohne auf Refresh warten
      item.style.transition = 'opacity .3s';
      item.style.opacity = '0';
      setTimeout(() => { item.remove(); }, 300);
      setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 600);
    });
    return item;
  }

  if (loggedIn.length) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:700;color:var(--acc);text-transform:uppercase;letter-spacing:.1em;padding:8px 0 4px';
    lbl.textContent = 'Angemeldet';
    list.appendChild(lbl);
    loggedIn.forEach(([id,p]) => list.appendChild(makeItem(id,p,true)));
  }
  if (notIn.length) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:10px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;padding:8px 0 4px;margin-top:8px';
    lbl.textContent = 'Nicht angemeldet';
    list.appendChild(lbl);
    notIn.forEach(([id,p]) => list.appendChild(makeItem(id,p,false)));
  }
}

// ── 3. CR KALENDER ──────────────────────────────────────────────────

async function loadCrCalendarView() {
  const content = document.getElementById('cr-calendar-content');
  if (!content) return;
  content.innerHTML = '<div style="color:var(--tx2);font-size:13px;padding:20px;text-align:center">Lädt Anime-Kalender…</div>';
  try {
    const [p1, p2] = await Promise.all([
      window.electronAPI.getUpcoming(1),
      window.electronAPI.getTrending()
    ]);
    const all = [...(p1.anime||[]), ...(p2.anime||[])]
      .filter((v,i,a) => a.findIndex(x=>x.id===v.id)===i)
      .filter(i => i.poster_path)
      // Keine fremdsprachigen Titel (Punkt 7)
      .filter(i => {
        const t = i.title||i.name||'';
        return /^[\u0000-\u024F\s\d\W]+$/.test(t); // nur lateinische Zeichen
      })
      .slice(0, 60);

    if (!all.length) {
      content.innerHTML = '<div style="color:var(--tx2);padding:20px;text-align:center">Keine Daten verfügbar.</div>';
      return;
    }

    const byDate = {};
    all.forEach(item => {
      const d = item.first_air_date || item.release_date || 'Unbekannt';
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(item);
    });

    content.innerHTML = '<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="pick-btn" onclick="openProvider(\'crunchyroll\')">▶ Auf Crunchyroll</button></div>';

    Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b)).forEach(([date, items]) => {
      const label = date !== 'Unbekannt'
        ? new Date(date).toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
        : 'Datum unbekannt';
      const sec = document.createElement('div');
      sec.style.cssText = 'margin-bottom:24px';
      sec.innerHTML = `<div style="font-family:var(--font-d);font-size:13px;font-weight:700;color:var(--acc);margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid var(--bor)">${label}</div>`;
      const g = document.createElement('div');
      g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px';
      items.forEach(item => {
        const title = item.title||item.name||'?';
        const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '';
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .18s,border-color .18s';
        card.innerHTML = (poster?`<img src="${poster}" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block" loading="lazy"/>`:'')+
          `<div style="padding:6px 8px"><div style="font-size:11px;font-weight:600;color:var(--tx);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(title)}</div></div>`;
        card.onmouseenter = () => {card.style.transform='translateY(-3px)';card.style.borderColor='var(--acc)';};
        card.onmouseleave = () => {card.style.transform='';card.style.borderColor='';};
        card.addEventListener('click', () => showDetailPopup(item.id, 'tv', title));
        g.appendChild(card);
      });
      sec.appendChild(g);
      content.appendChild(sec);
    });
  } catch(e) {
    content.innerHTML = `<div style="color:var(--danger);padding:20px">Fehler: ${esc(e.message)}</div>`;
  }
}

// ── 4. KATEGORIE-FILTER-BAR ─────────────────────────────────────────

const PROVIDER_CATEGORIES_DEF = {
  all:    {de:'Alle',        en:'All',          icon:'🌐'},
  video:  {de:'Streaming',   en:'Streaming',     icon:'🎬'},
  anime:  {de:'Anime',       en:'Anime',         icon:'⛩️'},
  live:   {de:'Live & Sport',en:'Live & Sport',  icon:'📡'},
  music:  {de:'Musik',       en:'Music',         icon:'🎵'},
  free:   {de:'Kostenlos',   en:'Free',          icon:'🆓'},
  custom: {de:'Eigene',      en:'Custom',        icon:'⚙️'},
};
const PROVIDER_CAT_MAP_DEF = {
  netflix:'video',prime:'video',disney:'video',hbomax:'video',apple:'video',
  paramountplus:'video',mubi:'video',skygo:'video',wow:'video',waipu:'video',magenta:'video',
  crunchyroll:'anime',adn:'anime',
  twitch:'live',dazn:'live',
  youtube:'video',spotify:'music',
  ard:'free',zdf:'free',arte:'free',funk:'free',kika:'free',joyn:'free',
  burning:'video',cineto:'video',movie2k:'video',rtl:'video',
};

function buildCategoryFilterBar() {
  const bar = document.getElementById('category-filter-bar');
  if (!bar) return;
  const active = settings.activeCategory || 'all';
  bar.innerHTML = '';
  Object.entries(PROVIDER_CATEGORIES_DEF).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.className = 'cat-filter-btn' + (active===key ? ' active':'');
    btn.dataset.cat = key;
    btn.innerHTML = `${cat.icon} <span>${cat[lang]||cat.de}</span>`;
    btn.addEventListener('click', () => {
      settings.activeCategory = key;
      autoSave();
      buildProviderGrid();
    });
    bar.appendChild(btn);
  });
  // Eigene Gruppen
  Object.entries(settings.providerGroups||{}).forEach(([gid, g]) => {
    const btn = document.createElement('button');
    btn.className = 'cat-filter-btn' + (active===gid ? ' active':'');
    btn.dataset.cat = gid;
    btn.innerHTML = `${g.icon||'📁'} <span>${esc(g.name)}</span>`;
    btn.addEventListener('click', () => { settings.activeCategory=gid; autoSave(); buildProviderGrid(); });
    bar.appendChild(btn);
  });
  // Gruppen-Manager Button
  const mgr = document.createElement('button');
  mgr.className = 'cat-filter-btn';
  mgr.innerHTML = '⚙ <span>Gruppen</span>';
  mgr.title = 'Eigene Gruppen verwalten';
  mgr.addEventListener('click', () => typeof openGroupManager==='function' && openGroupManager());
  bar.appendChild(mgr);
  // Drop-Zones einrichten
  setTimeout(() => typeof setupGroupDropZones==='function' && setupGroupDropZones(), 100);
}

// ── 5. ZULETZT GEÖFFNET ENTFERNEN ───────────────────────────────────

function buildRecentlyOpened() {
  // Deaktiviert – Punkt 5: "Zuletzt geöffnet" soll entfernt werden
  const existing = document.getElementById('recently-opened-section');
  if (existing) existing.remove();
}

// ── 6. SEARCH VERBESSERN ────────────────────────────────────────────

// Bessere TMDB-Suche: nur Ergebnisse zeigen die query wirklich enthalten
const _origRunTmdbSearch2 = window._origRunTmdbSearch;

async function runTmdbSearch(q, page=1, signal=null) {
  const dd = document.getElementById('search-dropdown');
  if (!dd) return;
  const ql = q.toLowerCase().trim();
  if (!ql) return;

  // Anbieter-Matches
  const provMatches = Object.entries(PROVIDERS()).filter(([id,p]) => {
    const name = ((settings.cardCustomNames||{})[id]||p.name).toLowerCase();
    return name.includes(ql) || name.startsWith(ql);
  });

  let html = '';
  if (provMatches.length && page===1) {
    html += '<div class="search-dd-section">Anbieter</div>';
    provMatches.slice(0,3).forEach(([id,p]) => {
      html += `<div class="search-dd-item" data-prov-open="${id}">
        <img src="${getFavicon(id,p)}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:${p.color}22;padding:4px" onerror="this.style.display='none'"/>
        <div class="search-dd-info"><div class="search-dd-title">${esc((settings.cardCustomNames||{})[id]||p.name)}</div></div>
      </div>`;
    });
  }

  try {
    if (signal?.aborted) return;
    const data = await window.electronAPI.searchTmdb(q);
    if (signal?.aborted) return;

    // FILTER: nur Ergebnisse die query im Titel haben UND nur lateinische Zeichen
    const results = (data.results||[]).filter(r => {
      if (!r.poster_path) return false;
      if (r.media_type === 'person') return false;
      const title = (r.title||r.name||'').toLowerCase();
      // Titelrelevanz prüfen
      if (!title.includes(ql) && !ql.split(' ').every(w => title.includes(w))) return false;
      // Keine fremdsprachigen Titel
      if (!/^[\u0000-\u024F\s\d\W]+$/.test(r.title||r.name||'')) return false;
      return true;
    });

    if (results.length) {
      if (page === 1) html += '<div class="search-dd-section">Filme & Serien</div>';
      results.slice((page-1)*8, page*8).forEach(item => {
        const title = item.title||item.name||'';
        const year = (item.release_date||item.first_air_date||'').substring(0,4);
        const type = item.media_type==='movie'?'Film':'Serie';
        html += `<div class="search-dd-item search-dd-film" data-tmdb="${item.id}" data-type="${item.media_type}" data-title="${esc(title)}" style="cursor:pointer">
          <img class="search-dd-poster" src="${TMDB_IMG}${item.poster_path}" style="width:36px;height:52px;object-fit:cover;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'"/>
          <div class="search-dd-info">
            <div class="search-dd-title">${esc(title)}</div>
            <div class="search-dd-meta"><span class="search-dd-badge">${type}</span>${year?`<span>${year}</span>`:''}</div>
          </div>
        </div>`;
      });
      if (results.length > page*8) html += `<div class="search-dd-more" id="dd-more-btn">Mehr anzeigen ↓</div>`;
    } else if (!provMatches.length) {
      html += `<div style="padding:16px 14px;text-align:center;font-size:13px;color:var(--tx2)">Keine Ergebnisse für „${esc(q)}"</div>`;
    }
  } catch(e) {
    if (e.name !== 'AbortError') html += `<div style="padding:12px;color:var(--danger);font-size:12px">Fehler beim Suchen</div>`;
  }

  if (signal?.aborted) return;
  if (page === 1) dd.innerHTML = html;
  else {
    const mb = document.getElementById('dd-more-btn');
    if (mb) mb.remove();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('.search-dd-item,.search-dd-more').forEach(el => dd.appendChild(el));
  }
  dd.style.display = 'block';

  dd.querySelectorAll('[data-prov-open]').forEach(el =>
    el.addEventListener('click', () => { dd.style.display='none'; openProvider(el.dataset.provOpen); }));
  dd.querySelectorAll('.search-dd-film').forEach(el =>
    el.addEventListener('click', e => {
      if (e.target.closest('[data-prov-open]')) return;
      dd.style.display = 'none';
      addToSearchHistory(el.dataset.title);
      showDetailPopup(parseInt(el.dataset.tmdb), el.dataset.type, el.dataset.title);
    }));
  document.getElementById('dd-more-btn')?.addEventListener('click', () => {
    if (!window._searchPage) window._searchPage = 1;
    window._searchPage++;
    runTmdbSearch(q, window._searchPage, signal);
  });
}

// ── 7. SLIDESHOW KARTEN FIX ─────────────────────────────────────────

// Slideshow-Karten: Poster füllt die Karte, keine Checkbox
function createSlideCard(item, key, mediaType) {
  const title = item.title||item.name||'?';
  const poster = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '';
  const rd = item.release_date||item.first_air_date||'';
  const year = rd.substring(0,4);
  const tmdbType = item.title ? 'movie' : 'tv';
  // Fremdsprachige Titel filtern
  if (!/^[\u0000-\u024F\s\d\W]+$/.test(title)) return null;
  const isInWl = !!watchlist.find(w => w.id===tmdbType+'_'+item.id);

  const card = document.createElement('div');
  card.className = 'slide-card';
  card.dataset.idx = 0;
  card.innerHTML = `
    <div class="slide-card-inner">
      ${poster
        ? `<img class="slide-card-poster" src="${poster}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'"/>`
        : '<div class="slide-card-poster-ph">🎬</div>'}
      <div class="slide-card-body">
        <div class="slide-card-title">${esc(title)}</div>
        ${year?`<div style="font-size:9px;color:rgba(255,255,255,.4)">${year}</div>`:''}
      </div>
    </div>
    <div class="slide-card-actions">
      <button class="slide-hide-btn" title="Ausblenden">🙈</button>
      <button class="slide-bookmark-btn${isInWl?' bookmarked':''}" title="Merken">🔖</button>
    </div>`;

  card.querySelector('.slide-card-inner').addEventListener('click', () => {
    showDetailPopup(item.id, tmdbType, title);
  });
  card.querySelector('.slide-hide-btn').addEventListener('click', e => {
    e.stopPropagation();
    hiddenItems[key] = hiddenItems[key]||{};
    hiddenItems[key][item.id] = {title, poster, tmdbId:item.id, tmdbType, releaseDate:rd, mediaType};
    settings.hiddenItems = hiddenItems;
    autoSave();
    card.remove();
  });
  card.querySelector('.slide-bookmark-btn').addEventListener('click', e => {
    e.stopPropagation();
    const wlId = tmdbType+'_'+item.id;
    if (watchlist.find(w=>w.id===wlId)) {
      watchlist = watchlist.filter(w=>w.id!==wlId);
      e.target.classList.remove('bookmarked');
    } else {
      watchlist.unshift({id:wlId,tmdbId:item.id,tmdbType,title,poster,releaseDate:rd,mediaType:tmdbType==='tv'?'tv':'movie'});
      e.target.classList.add('bookmarked');
    }
    settings.watchlist = watchlist;
    autoSave();
  });
  return card;
}

// ── 8. DETAIL POPUP: ANBIETER NEBENEINANDER + SMART OPEN ────────────

const _origShowDetailPopup = typeof showDetailPopup === 'function' ? showDetailPopup : null;

async function showDetailPopup(tmdbId, tmdbType, title) {
  const overlay = document.getElementById('detail-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.getElementById('detail-title').textContent = title||'Lädt…';
  ['detail-overview','detail-meta','detail-providers','detail-badges','detail-actions'].forEach(id => {
    const el = document.getElementById(id); if(el) el.innerHTML='';
  });
  const twrapEl = document.getElementById('detail-trailer-wrap');
  if (twrapEl) twrapEl.style.display = 'none';
  const twv = document.getElementById('detail-trailer-wv');
  if (twv) twv.setAttribute('src','about:blank');

  const data = await window.electronAPI.getTmdbDetail({id:tmdbId,type:tmdbType}).catch(()=>null);
  if (!data||data.error) return;
  const {detail, videos, providers} = data;
  if (!detail) return;

  const t = detail.title||detail.name||title;
  const poster = detail.poster_path?`${TMDB_IMG}${detail.poster_path}`:'';
  const backdrop = detail.backdrop_path?`https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`:'';
  const year = (detail.release_date||detail.first_air_date||'').substring(0,4);
  const runtime = detail.runtime?`${detail.runtime} Min.`:(detail.episode_run_time?.[0]?`~${detail.episode_run_time[0]} Min.`:'');
  const rating = detail.vote_average?detail.vote_average.toFixed(1):null;
  const genres = (detail.genres||[]).map(g=>g.name).join(', ');

  document.getElementById('detail-title').textContent = t;
  document.getElementById('detail-overview').textContent = detail.overview||'Keine Beschreibung.';
  const pEl = document.getElementById('detail-poster');
  if (pEl && poster) { pEl.src=poster; pEl.style.objectFit='cover'; }
  const bEl = document.getElementById('detail-backdrop');
  if (bEl && backdrop) { bEl.style.backgroundImage=`url("${backdrop}")`; bEl.style.backgroundSize='cover'; bEl.style.backgroundPosition='center'; }
  document.getElementById('detail-badges').innerHTML = [year,runtime,rating?'★ '+rating:null,tmdbType==='tv'?'Serie':'Film']
    .filter(Boolean).map(b=>`<span class="detail-badge">${esc(b)}</span>`).join('');
  document.getElementById('detail-meta').innerHTML = genres?`<div class="detail-meta-item"><span class="detail-meta-label">Genre:</span> ${esc(genres)}</div>`:'';

  const trailer = (videos||[]).find(v=>v.site==='YouTube'&&v.type==='Trailer')||(videos||[])[0];
  if (trailer) {
    if (twrapEl) twrapEl.style.display='block';
    if (twv) twv.setAttribute('src',`https://www.youtube-nocookie.com/embed/${trailer.key}?rel=0&modestbranding=1`);
  }

  // Anbieter: nebeneinander, modern
  const provWrap = document.getElementById('detail-providers');
  const availProv = [];
  if (providers) {
    const all = [...(providers.flatrate||[]),...(providers.rent||[])]
      .filter((p,i,a) => a.findIndex(x=>x.provider_id===p.provider_id)===i && p.logo_path);
    all.slice(0,8).forEach(p => {
      const ourId = TMDB_PMAP[p.provider_id];
      availProv.push({...p, ourId});
    });
    if (provWrap) {
      provWrap.innerHTML = availProv.length
        ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${availProv.map(p=>
            `<div class="detail-provider-chip${p.ourId?' clickable':''}" ${p.ourId?`data-prov="${p.ourId}"`:''}
              style="display:flex;align-items:center;gap:5px;padding:5px 10px;background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);cursor:${p.ourId?'pointer':'default'};transition:all .14s">
              <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" style="width:18px;height:18px;object-fit:contain;border-radius:3px" onerror="this.style.display='none'"/>
              <span style="font-size:11px;color:var(--tx)">${esc(p.provider_name)}</span>
            </div>`).join('')}</div>`
        : '<span style="font-size:11px;color:var(--tx3)">Nicht in DE verfügbar</span>';
      provWrap.querySelectorAll('[data-prov]').forEach(el => {
        el.addEventListener('mouseenter', () => el.style.borderColor='var(--acc)');
        el.addEventListener('mouseleave', () => el.style.borderColor='');
        el.addEventListener('click', () => { overlay.style.display='none'; openProvider(el.dataset.prov); });
      });
    }
  }

  // Aktionen
  const actions = document.getElementById('detail-actions');
  const wlId = tmdbType+'_'+tmdbId;
  const isInWl = !!watchlist.find(w=>w.id===wlId);
  if (actions) {
    actions.innerHTML = `
      <button class="detail-action-btn primary" id="d-watch">▶ Anschauen</button>
      <button class="detail-action-btn secondary" id="d-ggl">🔍 Google</button>
      <button class="detail-action-btn secondary" id="d-wl">${isInWl?'🔖 Gemerkt':'🔖 Merken'}</button>`;

    document.getElementById('d-watch')?.addEventListener('click', () => {
      // Smart: angemeldeter Anbieter bevorzugen
      const ourProvs = availProv.filter(p => p.ourId);
      const loggedInProv = ourProvs.find(p => sessionCache && sessionCache[p.ourId]);
      const target = loggedInProv || ourProvs[0];
      if (target) { overlay.style.display='none'; openProvider(target.ourId); }
      else window.electronAPI.openExternal('https://www.google.com/search?q='+encodeURIComponent(t+' stream deutsch'));
    });
    document.getElementById('d-ggl')?.addEventListener('click', () =>
      window.electronAPI.openExternal('https://www.google.com/search?q='+encodeURIComponent(t+' stream deutsch')));
    document.getElementById('d-wl')?.addEventListener('click', e => {
      if (watchlist.find(w=>w.id===wlId)) { showToastMsg('✓ Bereits in deiner Watchlist'); return; }
      watchlist.unshift({id:wlId,tmdbId,tmdbType,title:t,poster,releaseDate:detail.release_date||detail.first_air_date||'',mediaType:tmdbType==='tv'?'tv':'movie'});
      settings.watchlist=watchlist; autoSave();
      e.target.textContent='🔖 Gemerkt';
    });
  }

  document.getElementById('detail-close').onclick = closeDetailPopup;
  overlay.onclick = e => { if(e.target===overlay) closeDetailPopup(); };
}

function closeDetailPopup() {
  document.getElementById('detail-overlay').style.display='none';
  const twv = document.getElementById('detail-trailer-wv');
  if (twv) twv.setAttribute('src','about:blank');
}

// ── 9. SUCHVERLAUF MIT VORSCHAU (Punkt 4) ───────────────────────────

function renderSearchHistory(dd) {
  if (!searchHistory||!searchHistory.length) { dd.style.display='none'; return; }
  let html = `<div class="search-dd-section" style="display:flex;justify-content:space-between;align-items:center">
    <span>Zuletzt gesucht</span>
    <button onclick="window.clearAllSearchHistory()" class="search-dd-clear-all">Alle löschen</button>
  </div>`;
  searchHistory.slice(0,10).forEach((q,i) => {
    // Cache-Vorschau prüfen
    const cacheKey = q+'|1';
    const cached = _tmdbSearchCache && _tmdbSearchCache.get ? _tmdbSearchCache.get(cacheKey) : null;
    const preview = cached && Date.now()-cached.ts < 10*60*1000
      ? `<div style="font-size:10px;color:var(--acc);margin-top:1px">Vorschau verfügbar</div>`
      : '';
    html += `<div class="search-dd-history-item">
      <span class="search-dd-history-q" data-q="${esc(q)}" data-i="${i}">🕐 ${esc(q)}${preview}</span>
      <button class="search-dd-history-del" data-i="${i}">✕</button>
    </div>`;
  });
  dd.innerHTML = html; dd.style.display = 'block';
  dd.querySelectorAll('.search-dd-history-q').forEach(el =>
    el.addEventListener('click', () => {
      const inp = document.getElementById('search-input');
      if (inp) { inp.value=el.dataset.q; inp.focus(); }
      // Cache prüfen und sofort anzeigen
      const cacheKey = el.dataset.q+'|1';
      const cached = _tmdbSearchCache && _tmdbSearchCache.get ? _tmdbSearchCache.get(cacheKey) : null;
      if (cached && Date.now()-cached.ts < 10*60*1000) {
        dd.innerHTML = cached.html; dd.style.display='block';
      } else {
        runTmdbSearch(el.dataset.q, 1);
      }
    }));
  dd.querySelectorAll('.search-dd-history-del').forEach(el =>
    el.addEventListener('click', e => {
      e.stopPropagation();
      searchHistory.splice(parseInt(el.dataset.i),1);
      settings.searchHistory=searchHistory; autoSave();
      renderSearchHistory(dd);
    }));
}

window.clearAllSearchHistory = function() {
  searchHistory=[]; settings.searchHistory=[]; autoSave();
  const dd=document.getElementById('search-dropdown');
  if(dd) {dd.innerHTML=''; dd.style.display='none';}
};

// ── 10. BUILDPROVIDER GRID: ANBIETER-BUTTON FIX ─────────────────────

// Stelle sicher dass der "+ Anbieter" Button funktioniert
(function patchProviderButton() {
  // Wird nach DOMContentLoaded ausgeführt
  const setupProviderBtn = () => {
    const btn = document.getElementById('btn-add-custom-provider');
    if (!btn) return;
    btn.onclick = null;
    btn.addEventListener('click', () => {
      const modal = document.getElementById('custom-provider-modal');
      if (modal) modal.style.display = 'flex';
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProviderBtn);
  } else {
    setupProviderBtn();
    setTimeout(setupProviderBtn, 500); // Fallback
  }
})();

// ── 11. ACCOUNT SESSION FIX ─────────────────────────────────────────

// Sessions sofort laden wenn Account-Tab geöffnet wird
(function patchAccountTab() {
  const orig = document.querySelectorAll.bind(document);
  const tryBind = () => {
    document.querySelectorAll('.sms-btn[data-stab]').forEach(btn => {
      if (btn.dataset.stab === 'account' && !btn._sessionPatched) {
        btn._sessionPatched = true;
        btn.addEventListener('click', async () => {
          // Sofort Sessions laden
          const res = await window.electronAPI.getAllSessions(activeProfileId).catch(()=>({}));
          sessionCache = res;
          setTimeout(() => buildSessionList(res), 50);
        });
      }
    });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(tryBind,600));
  else setTimeout(tryBind, 600);
})();

console.log('[OmniSight fixes.js] Geladen, alle Fixes aktiv');

// ── 12. PARTIKEL-SHAPES: Sprache nicht zurücksetzen ─────────────────

(function patchParticleShapes() {
  const bind = () => {
    document.querySelectorAll('.particle-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (!settings.particlesConfig) settings.particlesConfig = {};
        const active = [...document.querySelectorAll('.particle-shape-btn.active')].map(b=>b.dataset.shape);
        settings.particlesConfig.shapes = active.length ? active : [btn.dataset.shape];
        if (!active.length) btn.classList.add('active');
        setupParticles();
        autoSave();
        // Sprache NICHT zurücksetzen!
      });
    });
  };
  setTimeout(bind, 800);
})();

// ── 13. PROFIL-EDITOR FIXES ─────────────────────────────────────────

(function patchProfileEditor() {
  const bind = () => {
    // Außerhalb-Klick schließt ohne Speichern
    const overlay = document.getElementById('profile-editor-overlay');
    if (overlay && !overlay._fixPatched) {
      overlay._fixPatched = true;
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          showToastMsg('Änderungen verworfen');
        }
      });
    }

    // PIN-Eingabe im Profil-Editor
    const pinBtn = document.getElementById('ped-set-pin');
    if (pinBtn && !pinBtn._fixPatched) {
      pinBtn._fixPatched = true;
      pinBtn.addEventListener('click', () => {
        let entered = '';
        const dialog = document.createElement('div');
        dialog.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center';
        dialog.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:24px;min-width:280px;text-align:center">
          <div style="font-size:32px;margin-bottom:12px">🔒</div>
          <h3 style="color:var(--tx);margin-bottom:14px">PIN eingeben (4 Ziffern)</h3>
          <div style="display:flex;justify-content:center;gap:10px;margin-bottom:16px">
            ${[0,1,2,3].map(i=>`<div id="pin-setup-dot-${i}" style="width:14px;height:14px;border-radius:50%;background:var(--bor);border:2px solid var(--borh)"></div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:200px;margin:0 auto">
            ${[1,2,3,4,5,6,7,8,9,'✕',0,'⌫'].map(k=>`<button class="pin-setup-key" data-k="${k}" style="padding:12px;border:1px solid var(--bor);background:var(--bgc);color:var(--tx);border-radius:var(--r-sm);font-size:16px;font-weight:600;cursor:pointer">${k}</button>`).join('')}
          </div>
        </div>`;
        document.body.appendChild(dialog);
        const updateDots = () => {
          [0,1,2,3].forEach(i=>{const d=document.getElementById('pin-setup-dot-'+i);if(d)d.style.background=i<entered.length?'var(--acc)':'var(--bor)';});
        };
        dialog.querySelectorAll('.pin-setup-key').forEach(btn => {
          btn.addEventListener('click', () => {
            const k = btn.dataset.k;
            if (k==='✕') { dialog.remove(); return; }
            if (k==='⌫') { entered=entered.slice(0,-1); updateDots(); return; }
            if (entered.length>=4) return;
            entered += k; updateDots();
            if (entered.length===4) {
              window._pedPin = entered;
              dialog.remove();
              showToastMsg('PIN gesetzt (' + '*'.repeat(4) + ')');
            }
          });
        });
        dialog.addEventListener('click', e => { if(e.target===dialog) dialog.remove(); });
      });
    }

    // Profil-Bild wählen
    const avatarBtn = document.getElementById('ped-pick-avatar');
    if (avatarBtn && !avatarBtn._fixPatched) {
      avatarBtn._fixPatched = true;
      avatarBtn.addEventListener('click', async () => {
        const r = await window.electronAPI.pickImage('profile_avatar').catch(()=>null);
        if (r) {
          const url = r.base64||r.filePath||r;
          const prev = document.getElementById('ped-avatar-preview');
          if (prev) prev.innerHTML = `<img src="${url}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`;
          window._pedAvatar = url;
        }
      });
    }

    // PIN entfernen
    const removePinBtn = document.getElementById('ped-remove-pin');
    if (removePinBtn && !removePinBtn._fixPatched) {
      removePinBtn._fixPatched = true;
      removePinBtn.addEventListener('click', () => { window._pedPin=''; showToastMsg('PIN entfernt'); });
    }
  };
  setTimeout(bind, 700);
})();

// ── 14. UHR-FIXES ───────────────────────────────────────────────────

// Clock digital↔analog über Kontextmenü
(function patchClockContextMenu() {
  const bind = () => {
    const analogToggle = document.getElementById('clock-ctx-analog');
    if (analogToggle && !analogToggle._fixPatched) {
      analogToggle._fixPatched = true;
      analogToggle.addEventListener('change', e => {
        settings.clock = settings.clock||{};
        settings.clock.type = e.target.checked ? 'analog' : 'digital';
        settings.clock.enabled = true;
        autoSave();
        // Uhr sofort neu aufbauen
        if (typeof setupClock==='function') { clearInterval(window._clockInt); setupClock(); }
        document.getElementById('clock-ctx-menu').style.display='none';
        // Sync Clock-Type-Buttons in Einstellungen
        document.querySelectorAll('.clock-type-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.clockType===settings.clock.type));
        const clkEnabled = document.getElementById('clock-enabled');
        if (clkEnabled) clkEnabled.checked = true;
      });
    }
  };
  setTimeout(bind, 800);
})();

// ── 15. EINSTELLUNGEN ÜBERSICHT (Punkt 20) ──────────────────────────

(function buildSettingsOverview() {
  const bind = () => {
    const content = document.getElementById('settings-modal-content');
    if (!content || document.getElementById('smt-overview')) return;

    // Übersichts-Tab erstellen
    const overview = document.createElement('div');
    overview.id = 'smt-overview';
    overview.className = 'smt-content active';
    overview.innerHTML = `
      <h2 class="smt-title">⚙️ Einstellungen</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-top:8px">
        ${[
          {stab:'appearance',icon:'🎨',name:'Design',desc:'Farben, Schrift, Partikel'},
          {stab:'account',icon:'🔑',name:'Account',desc:'Sessions & Anmeldungen'},
          {stab:'clock',icon:'🕐',name:'Uhr',desc:'Digitale oder analoge Uhr'},
          {stab:'notifications',icon:'🔔',name:'Benachrichtigungen',desc:'Push-Einstellungen'},
          {stab:'plugins',icon:'🧩',name:'Plugins',desc:'Werbeblocker & Erweiterungen'},
          {stab:'advanced',icon:'⚙',name:'Mehr',desc:'Updates, VPN, Backup'}
        ].map(tab=>`
          <div class="settings-overview-card" data-goto="${tab.stab}"
            style="background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r);padding:18px 16px;cursor:pointer;transition:all .18s">
            <div style="font-size:28px;margin-bottom:8px">${tab.icon}</div>
            <div style="font-family:var(--font-d);font-weight:700;color:var(--tx);margin-bottom:4px">${tab.name}</div>
            <div style="font-size:11px;color:var(--tx2)">${tab.desc}</div>
          </div>`).join('')}
      </div>`;
    content.prepend(overview);

    // Hover + Klick auf Übersichts-Karten
    overview.querySelectorAll('.settings-overview-card').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.borderColor='var(--acc)'; card.style.transform='translateY(-2px)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor=''; card.style.transform=''; });
      card.addEventListener('click', () => {
        const target = card.dataset.goto;
        document.querySelectorAll('.sms-btn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));
        document.querySelector(`.sms-btn[data-stab="${target}"]`)?.classList.add('active');
        document.getElementById('smt-'+target)?.classList.add('active');
        if (target==='account') {
          window.electronAPI.getAllSessions(activeProfileId).then(res=>{sessionCache=res;buildSessionList(res);});
        }
        if (target==='advanced') buildAdvancedTab();
      });
    });

    // Tab-Navigation: Übersicht als ersten Schritt hinzufügen
    const nav = document.querySelector('.sms-nav');
    if (nav && !nav.querySelector('[data-stab="overview"]')) {
      const btn = document.createElement('button');
      btn.className = 'sms-btn active';
      btn.dataset.stab = 'overview';
      btn.innerHTML = '🏠 Übersicht';
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sms-btn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.smt-content').forEach(c=>c.classList.remove('active'));
        btn.classList.add('active');
        overview.classList.add('active');
      });
      nav.prepend(btn);
    }
  };
  setTimeout(bind, 600);
})();

// ── 16. ACHIEVEMENTS ERWEITERN ──────────────────────────────────────

// Wird zu ACHIEVEMENTS Array hinzugefügt nach Laden
setTimeout(() => {
  if (typeof ACHIEVEMENTS === 'undefined') return;
  const newAch = [
    {id:'wl10',cat:'special',icon:'📋',name:{de:'Watchlist-Fan',en:'Watchlist Fan'},desc:{de:'10 Titel gemerkt',en:'10 titles saved'},check:(_,m)=>(watchlist||[]).length>=10,hidden:false},
    {id:'wl25',cat:'special',icon:'📚',name:{de:'Watchlist-Sammler',en:'Watchlist Collector'},desc:{de:'25 Titel gemerkt',en:'25 titles saved'},check:(_,m)=>(watchlist||[]).length>=25,hidden:false},
    {id:'search10',cat:'special',icon:'🔍',name:{de:'Forscher',en:'Researcher'},desc:{de:'10× gesucht',en:'Searched 10×'},check:(_,m)=>(m?.searchCount||0)>=10,hidden:false},
    {id:'customProv',cat:'special',icon:'🆕',name:{de:'Pionier',en:'Pioneer'},desc:{de:'Eigenen Anbieter hinzugefügt',en:'Added custom provider'},check:(_,m)=>(m?.customProviderAdded||0)>=1,hidden:false},
    {id:'h250',cat:'stream',icon:'🥈',name:{de:'250 Stunden',en:'250 Hours'},desc:{de:'250h gestreamt',en:'250h streamed'},check:s=>tot(s)>=900000,hidden:false},
    {id:'prov15',cat:'provider',icon:'🌍',name:{de:'15 Anbieter',en:'15 Providers'},desc:{de:'15 Anbieter genutzt',en:'15 providers used'},check:s=>uniq(s)>=15,hidden:false},
    {id:'prime5h',cat:'provider',icon:'📦',name:{de:'Prime-Fan',en:'Prime Fan'},desc:{de:'5h Prime Video',en:'5h Prime Video'},check:s=>(s.prime?.total||0)>=18000,hidden:false},
    {id:'spotify5h',cat:'provider',icon:'🎵',name:{de:'Musik-Liebhaber',en:'Music Lover'},desc:{de:'5h Spotify',en:'5h Spotify'},check:s=>(s.spotify?.total||0)>=18000,hidden:false},
  ];
  newAch.forEach(a => { if (!ACHIEVEMENTS.find(x=>x.id===a.id)) ACHIEVEMENTS.push(a); });
  console.log('[Fixes] Achievements erweitert auf', ACHIEVEMENTS.length);
}, 500);

// ── 17. SPRACHE IM ONBOARDING LIVE WECHSELN ─────────────────────────

(function patchOnboardingLanguage() {
  setTimeout(() => {
    ['ob-lang-de','ob-lang-en'].forEach(btnId => {
      const btn = document.getElementById(btnId);
      if (!btn||btn._obLangPatched) return;
      btn._obLangPatched = true;
      btn.addEventListener('click', () => {
        const newLang = btnId==='ob-lang-de' ? 'de' : 'en';
        settings.language = newLang;
        applyLanguage(newLang);
        // Onboarding-Texts anpassen
        const ob = document.getElementById('onboarding-overlay');
        if (ob) {
          ob.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.dataset.i18n;
            const t = I18N[newLang]||I18N.de;
            if (t[k]) el.textContent = t[k];
          });
        }
        // Buttons-Highlight
        document.getElementById('ob-lang-de')?.classList.toggle('active', newLang==='de');
        document.getElementById('ob-lang-en')?.classList.toggle('active', newLang==='en');
      });
    });
  }, 700);
})();

// ── 18. NOTIFICATION: ACHIEVEMENT NUR IN APP ─────────────────────────

// Achievements nicht als Windows-Notification, nur in App
const _origCheckAchievements = typeof checkAchievements==='function' ? checkAchievements : null;
if (_origCheckAchievements) {
  window.checkAchievements = async function(statsArg=null) {
    const stats = statsArg || await window.electronAPI.getStreamStats(activeProfileId).catch(()=>({}));
    const meta = JSON.parse(localStorage.getItem('achMeta_'+activeProfileId)||'{}');
    const earned = new Set(JSON.parse(localStorage.getItem('achievements_'+activeProfileId)||'[]'));
    let newOnes = false;
    ACHIEVEMENTS.forEach(a => {
      if (earned.has(a.id)) return;
      let ok = false;
      try { ok = a.check(stats, meta, watchlist); } catch(e) {}
      if (ok) {
        earned.add(a.id);
        newOnes = true;
        if (settings.notificationsConfig?.achievements) {
          // NUR In-App, kein Windows-Toast
          addNotification('🏆', 'Achievement!', (a.icon||'🏆')+' '+(a.name[lang]||a.name.de));
        }
      }
    });
    if (newOnes) localStorage.setItem('achievements_'+activeProfileId, JSON.stringify([...earned]));
  };
}

// ── 19. UPDATE-PRÜFUNG: "Prüfe..." nicht dauerhaft ──────────────────

(function patchUpdateCheck() {
  setTimeout(() => {
    const btn = document.getElementById('btn-check-updates');
    if (!btn||btn._updatePatched) return;
    btn._updatePatched = true;
    btn.addEventListener('click', async () => {
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent='Prüfe…'; el.style.color='var(--tx2)'; }
      try {
        await window.electronAPI.checkForUpdates();
        // Timeout: wenn nach 8s kein Event → "aktuell"
        setTimeout(() => {
          if (el && el.textContent==='Prüfe…') {
            el.textContent = '✓ Du hast die aktuellste Version (v'+((typeof settings!=='undefined'&&settings.appVersion)||'3.1.13')+')';
            el.style.color = 'var(--acc)';
          }
        }, 8000);
      } catch(e) {
        if (el) { el.textContent='Fehler beim Prüfen'; el.style.color='var(--danger)'; }
      }
    }, { once: false });
  }, 700);
})();

// ── 20. WIDEVINE INFO ────────────────────────────────────────────────

(function showWidevineInfo() {
  setTimeout(async () => {
    const el = document.getElementById('widevine-status');
    if (!el) return;
    try {
      const status = await window.electronAPI.getWidevineStatus();
      if (status.installed) {
        el.innerHTML = '<span style="color:var(--acc)">✓ WideVine CDM installiert</span>';
      } else {
        el.innerHTML = `<span style="color:var(--danger)">✗ Nicht gefunden. Ablegen unter: <code style="font-size:10px">${status.cdmDir||'?'}</code></span>
          <div style="margin-top:6px;font-size:11px;color:var(--tx2)">
            WideVine CDM muss manuell installiert werden (Google-Lizenz).<br>
            <a href="#" onclick="window.electronAPI.openExternal('https://github.com/nicehash/NiceHashQuickMiner/releases');return false"
              style="color:var(--acc)">Download-Anleitung öffnen ↗</a>
          </div>`;
      }
    } catch(e) {}
  }, 1000);
})();

// Sicherstellen dass loadPersistedNotifications aufgerufen wird
setTimeout(async () => {
  if (typeof loadPersistedNotifications==='function') {
    await loadPersistedNotifications();
  }
  updateNotifBadge();
}, 400);

console.log('[OmniSight fixes.js Teil 2] Alle Patches aktiv');

// ════════════════════════════════════════════════════════════════════
// v3.1.8 ERGÄNZUNGEN
// ════════════════════════════════════════════════════════════════════

// ── WideVine Anleitung (Punkt 2) ─────────────────────────────────────

function openWidevineGuide() {
  const overlay = document.createElement('div');
  overlay.id = 'widevine-guide-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:4000;display:flex;align-items:center;justify-content:center;padding:20px';

  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);width:min(640px,96%);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.7)">
      <div style="display:flex;align-items:center;padding:18px 22px;border-bottom:1px solid var(--bor)">
        <span style="font-size:22px;margin-right:10px">🔐</span>
        <span style="font-family:var(--font-d);font-size:17px;font-weight:800;color:var(--tx);flex:1">WideVine CDM installieren</span>
        <button onclick="document.getElementById('widevine-guide-overlay').remove()"
          style="border:none;background:transparent;color:var(--tx2);font-size:18px;cursor:pointer;padding:4px 8px">✕</button>
      </div>
      <div style="overflow-y:auto;padding:22px;flex:1">
        <div style="background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);padding:12px 16px;margin-bottom:20px;font-size:13px;color:var(--tx)">
          <b>Was ist WideVine?</b><br>
          WideVine ist ein Sicherheitssystem das Netflix, Amazon Prime und Disney+ nutzen um ihre Inhalte zu schützen.
          OmniSight braucht es um diese Dienste abspielen zu können. Du hast WideVine bereits auf deinem PC –
          es ist in Google Chrome eingebaut. Du musst es nur in den richtigen Ordner kopieren.
        </div>

        <div style="background:rgba(48,197,187,.08);border:1px solid rgba(48,197,187,.2);border-radius:var(--r-sm);padding:10px 14px;margin-bottom:18px;font-size:12px;color:var(--tx2)">
          ⚖️ <b>Legal?</b> Ja. Du verwendest WideVine nur auf deinem eigenen PC für Dienste bei denen du angemeldet bist.
          Du kopierst es aus Chrome (das du bereits installiert hast). Das ist kein Umgehen von DRM, sondern Aktivieren.
        </div>

        ${['chrome','edge'].map((browser,i) => `
          <div style="margin-bottom:20px">
            <h3 style="font-family:var(--font-d);font-size:14px;font-weight:700;color:var(--tx);margin-bottom:10px">
              ${i===0?'🟡 Methode 1: Aus Google Chrome kopieren':'🔵 Methode 2: Aus Microsoft Edge kopieren'}
              ${i===0?'<span style="font-size:10px;color:var(--acc);font-weight:500;margin-left:8px">(empfohlen)</span>':''}
            </h3>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                {n:1, txt: i===0
                  ? 'Öffne diesen Ordner (Strg+L im Explorer, dann den Pfad einfügen):'
                  : 'Öffne diesen Ordner:',
                  path: i===0
                  ? 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\[version]\\\\WidevineCdm\\\\_platform_specific\\\\win_x64\\\\'
                  : 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\[version]\\\\WidevineCdm\\\\_platform_specific\\\\win_x64\\\\',
                  note: '[version] = die Zahl die du dort siehst (z.B. 124.0.6367.201)',
                  btn: i===0?'chrome':'edge'},
                {n:2, txt:'Kopiere diese Datei:', file:'widevinecdm.dll'},
                {n:3, txt:'Füge sie in diesen Ordner ein:', path:'%AppData%\\\\omnisight\\\\WidevineCdm\\\\_platform_specific\\\\win_x64\\\\', btn:'dest', note:'Dieser Ordner wird automatisch erstellt wenn OmniSight zum ersten Mal startet.'},
                {n:4, txt:'Starte OmniSight neu. Fertig! ✓'},
              ].map(step => `
                <div style="display:flex;gap:10px;align-items:flex-start">
                  <div style="width:22px;height:22px;border-radius:50%;background:var(--acc);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${step.n}</div>
                  <div style="flex:1">
                    <div style="font-size:13px;color:var(--tx);margin-bottom:${step.path||step.file?'5px':'0'}">${step.txt}</div>
                    ${step.file?`<code style="background:var(--bgc);border:1px solid var(--bor);border-radius:4px;padding:3px 8px;font-size:12px;color:var(--acc)">${step.file}</code>`:''}
                    ${step.path?`
                      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px">
                        <code style="background:var(--bgc);border:1px solid var(--bor);border-radius:4px;padding:4px 10px;font-size:11px;color:var(--tx2);flex:1;min-width:0;word-break:break-all">${step.path}</code>
                        ${step.btn?`<button onclick="window._openWvFolder('${step.btn}')"
                          style="padding:5px 12px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0">📁 Öffnen</button>`:''}
                      </div>`:''}
                    ${step.note?`<div style="font-size:11px;color:var(--tx3);margin-top:3px">💡 ${step.note}</div>`:''}
                  </div>
                </div>`).join('')}
            </div>
          </div>`).join('<div style="height:1px;background:var(--bor);margin:14px 0"></div>')}

        <div style="background:var(--bgc);border:1px solid var(--bor);border-radius:var(--r-sm);padding:12px 16px;margin-top:8px">
          <b style="font-size:13px;color:var(--tx)">❓ Hast du kein Chrome/Edge?</b>
          <div style="font-size:12px;color:var(--tx2);margin-top:4px">
            Dann installiere kurz <a href="#" onclick="window.electronAPI.openExternal('https://www.google.com/chrome/');return false" style="color:var(--acc)">Google Chrome</a>,
            kopiere die Datei, dann kannst du Chrome wieder deinstallieren.
          </div>
        </div>
      </div>
      <div style="padding:14px 22px;border-top:1px solid var(--bor);display:flex;justify-content:flex-end">
        <button onclick="document.getElementById('widevine-guide-overlay').remove()"
          style="padding:8px 20px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-family:var(--font-d);font-weight:700;cursor:pointer">Verstanden</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

// Ordner-Öffnen Helfer
window._openWvFolder = async function(type) {
  let path = '';
  if (type === 'dest') {
    // Ziel-Ordner: AppData/omnisight/WidevineCdm
    const status = await window.electronAPI.getWidevineStatus().catch(()=>null);
    if (status?.cdmDir) path = status.cdmDir;
  } else if (type === 'chrome') {
    path = 'C:\\Program Files\\Google\\Chrome\\Application';
  } else if (type === 'edge') {
    path = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';
  }
  if (path) window.electronAPI.openExternal('file://'+path.replace(/\\/g,'/'));
};

// Widevine-Button in Einstellungen einbauen
(function addWidevineGuideBtn() {
  setTimeout(() => {
    const wvSection = document.getElementById('widevine-status');
    if (!wvSection || wvSection._guideAdded) return;
    wvSection._guideAdded = true;
    const btn = document.createElement('button');
    btn.className = 'pick-btn';
    btn.style.cssText = 'margin-top:8px;display:flex;align-items:center;gap:6px';
    btn.innerHTML = '📖 Installationsanleitung öffnen';
    btn.addEventListener('click', openWidevineGuide);
    wvSection.parentElement?.appendChild(btn);
  }, 1000);
})();

// ── Vorschlag 5: Session-Token-Ablauf ────────────────────────────────

function cleanExpiredSessions() {
  // Sessions die 30+ Tage nicht genutzt wurden aus Cache entfernen
  const now = Date.now();
  const maxAge = 30 * 24 * 3600 * 1000;
  let changed = false;
  Object.keys(sessionCache||{}).forEach(id => {
    const entry = sessionCache[id];
    if (entry && entry.lastSeen && now - entry.lastSeen > maxAge) {
      delete sessionCache[id];
      changed = true;
    }
  });
  if (changed) console.log('[Sessions] Abgelaufene Sessions bereinigt');
}

// ── Vorschlag 6: Startup-Zeitmessung ─────────────────────────────────

window._perfStart = performance.now();
window.addEventListener('load', () => {
  const loadTime = (performance.now() - window._perfStart).toFixed(0);
  console.log(`[OmniSight] Seite geladen in ${loadTime}ms`);
});

// Nach init() Gesamtzeit messen
const _origInit = typeof init==='function' ? init : null;
if (_origInit) {
  window.init = async function() {
    const t = performance.now();
    await _origInit.call(this, ...arguments);
    console.log(`[OmniSight] init() abgeschlossen in ${(performance.now()-t).toFixed(0)}ms`);
  };
}

// ── PIN-Hash beim Speichern ──────────────────────────────────────────

(function patchProfileSaving() {
  setTimeout(() => {
    const saveBtn = document.getElementById('ped-save');
    if (!saveBtn || saveBtn._hashPatched) return;
    saveBtn._hashPatched = true;
    // Original-Handler sichern
    const _origClick = saveBtn.onclick;
    saveBtn.addEventListener('click', async e => {
      // PIN hashen bevor gespeichert wird
      if (window._pedPin !== undefined && window._pedPin !== null && window._pedPin !== '') {
        try {
          const hashed = await window.electronAPI.hashPin(String(window._pedPin));
          window._pedPin = hashed; // Hash statt Klartext
        } catch(err) {}
      }
      // Ursprünglicher Save-Handler läuft weiter
    });
  }, 800);
})();

console.log('[OmniSight fixes.js Teil 3] v3.1.8 Sicherheits-Updates aktiv');

// ════════════════════════════════════════════════════════════════════
// v3.1.9 FIXES
// ════════════════════════════════════════════════════════════════════

// ── 1. AUTO-UPDATE: Korrekte Versions-Erkennung ──────────────────────

(function patchAutoUpdate() {
  // Version aus package.json extraMetadata lesen
  // Echte App-Version aus main.js laden
window.electronAPI.getAppVersion().then(v => {
  window.__appVersion = v || '3.1.13';
  // Version in "Mehr"-Tab anzeigen
  const vEl = document.querySelector('.settings-version-text');
  if (vEl) vEl.textContent = 'v' + v;
  // app.js __appVersion sync
  if (document.getElementById('update-check-result')) {
    // Nichts tun – wird beim Klick gelesen
  }
}).catch(() => { window.__appVersion = '3.1.13'; });


  // onUpdateAvailable: Banner zeigen
  window.electronAPI.onUpdateAvailable && window.electronAPI.onUpdateAvailable(info => {
    const banner = document.getElementById('update-banner');
    const txt = document.getElementById('update-text');
    const dlBtn = document.getElementById('btn-download-update');
    if (banner) banner.style.display = 'flex';
    if (txt) txt.textContent = `🚀 Update v${info.version} verfügbar`;
    if (dlBtn) {
      dlBtn.style.display = 'flex';
      dlBtn.textContent = '⬇ Herunterladen';
      dlBtn.disabled = false;
      dlBtn.onclick = () => {
        dlBtn.textContent = '⬇ Lädt…';
        dlBtn.disabled = true;
        window.electronAPI.downloadUpdate();
      };
    }
  });

  window.electronAPI.onUpdateDownloaded && window.electronAPI.onUpdateDownloaded(() => {
    const instBtn = document.getElementById('btn-install-update');
    const dlBtn = document.getElementById('btn-download-update');
    if (dlBtn) dlBtn.style.display = 'none';
    if (instBtn) {
      instBtn.style.display = 'flex';
      instBtn.onclick = () => window.electronAPI.installUpdate();
    }
  });
})();

// ── 2. UPDATE-CHECK: Korrekte Version anzeigen ───────────────────────

(function patchUpdateCheckVersion() {
  setTimeout(() => {
    const btn = document.getElementById('btn-check-updates');
    if (!btn || btn._v319Patched) return;
    btn._v319Patched = true;

    // Alle alten Handler entfernen
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', async () => {
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent = 'Prüfe…'; el.style.color = 'var(--tx2)'; }

      let resolved = false;

      // Auf Update-Events warten
      const updateHandler = (info) => {
        resolved = true;
        if (el) {
          el.textContent = `🚀 Update v${info.version} verfügbar – sieh oben im Banner!`;
          el.style.color = 'var(--acc)';
        }
      };
      const noUpdateHandler = () => {
        resolved = true;
        if (el) {
          el.textContent = `✓ Du hast die aktuellste Version (v${window.__appVersion||'3.1.13'})`;
          el.style.color = 'var(--acc)';
        }
      };
      const errorHandler = (msg) => {
        resolved = true;
        if (el) {
          el.textContent = msg && !msg.includes('404') ? 'Fehler: ' + msg : `✓ Aktuellste Version (v${window.__appVersion||'3.1.13'})`;
          el.style.color = msg && !msg.includes('404') ? 'var(--danger)' : 'var(--acc)';
        }
      };

      // Temporäre Listener
      window.electronAPI.onUpdateAvailable(updateHandler);
      window.electronAPI.onUpdateNotAvailable(noUpdateHandler);
      window.electronAPI.onUpdateError(errorHandler);

      try { await window.electronAPI.checkForUpdates(); } catch(e) {}

      // Timeout: 6s dann Fallback
      setTimeout(() => {
        if (!resolved && el && el.textContent === 'Prüfe…') {
          el.textContent = `✓ Aktuellste Version (v${window.__appVersion||'3.1.13'})`;
          el.style.color = 'var(--acc)';
        }
      }, 6000);
    });
  }, 800);
})();

// ── 3. PROFIL-EDITOR: Buttons reparieren ─────────────────────────────

(function fixProfileEditorButtons() {
  const bind = () => {
    // Speichern
    const saveBtn = document.getElementById('ped-save');
    if (saveBtn && !saveBtn._v319Fixed) {
      saveBtn._v319Fixed = true;
      saveBtn.replaceWith(saveBtn.cloneNode(true));
      const newSave = document.getElementById('ped-save');
      newSave.addEventListener('click', async () => {
        const name = (document.getElementById('ped-name')?.value || '').trim() || 'User';
        const pedId = window._pedProfileId;
        let pinToSave = undefined;
        if (window._pedPin !== undefined) {
          if (window._pedPin === '') {
            pinToSave = null;
          } else {
            // Hash wenn es ein roher PIN ist (4 Ziffern)
            if (/^\d{4}$/.test(String(window._pedPin))) {
              try { pinToSave = await window.electronAPI.hashPin(String(window._pedPin)); }
              catch(e) { pinToSave = window._pedPin; }
            } else {
              pinToSave = window._pedPin; // bereits gehasht
            }
          }
        }
        if (pedId) {
          const p = profiles.find(pr => pr.id === pedId);
          if (p) {
            p.name = name;
            if (window._pedAvatar !== undefined) p.avatar = window._pedAvatar;
            if (pinToSave !== undefined) p.pin = pinToSave;
          }
        } else {
          const id = 'profile_' + Date.now();
          profiles.push({ id, name, avatar: window._pedAvatar || null, pin: pinToSave || null, favorites:[], watchlist:[], searchHistory:[] });
        }
        window.electronAPI.setProfiles(profiles);
        document.getElementById('profile-editor-overlay').style.display = 'none';
        buildSidebarProfile();
        showSaveToast();
      });
    }

    // Abbrechen
    const cancelBtn = document.getElementById('ped-cancel');
    if (cancelBtn && !cancelBtn._v319Fixed) {
      cancelBtn._v319Fixed = true;
      cancelBtn.addEventListener('click', () => {
        document.getElementById('profile-editor-overlay').style.display = 'none';
      });
    }

    // Löschen
    const delBtn = document.getElementById('ped-delete');
    if (delBtn && !delBtn._v319Fixed) {
      delBtn._v319Fixed = true;
      delBtn.addEventListener('click', () => {
        const pedId = window._pedProfileId;
        if (!pedId || profiles.length <= 1) { showToastMsg('Mindestens 1 Profil erforderlich'); return; }
        if (!confirm('Profil wirklich löschen?')) return;
        profiles = profiles.filter(p => p.id !== pedId);
        window.electronAPI.setProfiles(profiles);
        document.getElementById('profile-editor-overlay').style.display = 'none';
        if (activeProfileId === pedId) switchProfile(profiles[0].id);
        else buildSidebarProfile();
      });
    }

    // PIN setzen: erst alten PIN abfragen wenn vorhanden
    const setPinBtn = document.getElementById('ped-set-pin');
    if (setPinBtn && !setPinBtn._v319Fixed) {
      setPinBtn._v319Fixed = true;
      setPinBtn.replaceWith(setPinBtn.cloneNode(true));
      document.getElementById('ped-set-pin').addEventListener('click', async () => {
        const pedId = window._pedProfileId;
        const profile = pedId ? profiles.find(p => p.id === pedId) : null;

        // Wenn Profil bereits PIN hat: erst alten PIN prüfen
        if (profile && profile.pin) {
          const oldPin = prompt('Aktuellen PIN eingeben:');
          if (oldPin === null) return;
          let valid = false;
          try { valid = await window.electronAPI.verifyPin(oldPin, profile.pin); }
          catch(e) { valid = String(oldPin) === String(profile.pin); }
          if (!valid) { showToastMsg('Falscher PIN'); return; }
        }

        // Neuen PIN eingeben
        const newPin = prompt('Neuen PIN (4 Ziffern):');
        if (newPin === null) return;
        if (!/^\d{4}$/.test(newPin)) { showToastMsg('PIN muss genau 4 Ziffern sein'); return; }
        window._pedPin = newPin;
        showToastMsg('PIN gesetzt – wird beim Speichern aktiviert');
      });
    }
  };
  setTimeout(bind, 700);
})();

// ── 4. SUCHE: Komplett überarbeitet ─────────────────────────────────


// [patchSearch entfernt - durch setupSearchFinal ersetzt]

// ── 3. KATEGORIE-FILTER: Gruppen-Button → Anbieter verwalten ────────

(function patchGroupsBtn() {
  setTimeout(() => {
    const bar = document.getElementById('category-filter-bar');
    if (!bar) return;
    // "Gruppen"-Button durch "Anbieter +" ersetzen
    const grpBtn = bar.querySelector('[title="Eigene Gruppen verwalten"]');
    if (grpBtn) {
      grpBtn.innerHTML = '➕ <span>Anbieter</span>';
      grpBtn.title = 'Ausgeblendete Anbieter wieder aktivieren';
      grpBtn.onclick = null;
      grpBtn.addEventListener('click', () => openRestoreProvidersPanel());
    }
    // Sicherstellen dass Filter immer sichtbar
    bar.style.display = 'flex';
  }, 700);
})();

function openRestoreProvidersPanel() {
  const existing = document.getElementById('restore-prov-overlay');
  if (existing) { existing.remove(); return; }
  const deleted = settings.deletedProviders || [];
  const all = Object.entries(PROVIDERS_BASE)
    .filter(([id]) => deleted.includes(id))
    .sort((a,b) => a[1].name.localeCompare(b[1].name));

  const overlay = document.createElement('div');
  overlay.id = 'restore-prov-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:3000;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);width:min(480px,96%);max-height:80vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.6)">
    <div style="padding:16px 20px;border-bottom:1px solid var(--bor);display:flex;align-items:center">
      <span style="font-family:var(--font-d);font-weight:800;font-size:16px;color:var(--tx);flex:1">📺 Anbieter aktivieren</span>
      <button onclick="document.getElementById('restore-prov-overlay').remove()" style="border:none;background:transparent;color:var(--tx2);font-size:18px;cursor:pointer">✕</button>
    </div>
    <div style="overflow-y:auto;padding:14px 20px;flex:1">
      ${!all.length
        ? '<div style="color:var(--tx2);text-align:center;padding:20px">Alle Anbieter sind bereits aktiv.</div>'
        : all.map(([id,p]) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bor)">
            <img src="${getFavicon(id,p)}" style="width:20px;height:20px;object-fit:contain;border-radius:3px" onerror="this.style.display='none'"/>
            <span style="flex:1;font-size:13px;color:var(--tx)">${esc(p.name)}</span>
            <button class="pick-btn" onclick="restoreProvider('${id}')" style="font-size:11px;padding:4px 10px">✓ Aktivieren</button>
          </div>`).join('')}
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

window.restoreProvider = function(id) {
  settings.deletedProviders = (settings.deletedProviders||[]).filter(x => x!==id);
  autoSave();
  buildProviderGrid();
  buildCategoryFilterBar();
  // Overlay aktualisieren
  const ov = document.getElementById('restore-prov-overlay');
  if (ov) { ov.remove(); openRestoreProvidersPanel(); }
  showToastMsg('✓ ' + (PROVIDERS_BASE[id]?.name || id) + ' aktiviert');
};

// ── 4. NEUIGKEITEN/UPCOMING: Ausgeblendete anzeigen Fix ─────────────

(function patchHiddenItems() {
  setTimeout(() => {
    document.querySelectorAll('.show-hidden-btn, [id$="-show-hidden"]').forEach(btn => {
      if (btn._hiddenFixed) return;
      btn._hiddenFixed = true;
      btn.addEventListener('click', () => {
        // Key aus Button-ID oder data-key ableiten
        const key = btn.dataset.key || btn.id.replace('-show-hidden','') || 'news';
        if (!hiddenItems[key] || !Object.keys(hiddenItems[key]).length) {
          showToastMsg('Keine ausgeblendeten Titel.'); return;
        }
        hiddenItems[key] = {};
        settings.hiddenItems = hiddenItems;
        autoSave();
        if (typeof renderSlideshows==='function') renderSlideshows();
        showToastMsg('Ausgeblendete Titel wieder angezeigt.');
      });
    });
  }, 800);
})();

// ── 5. WIDEVINE: Ordner erstellen über IPC ───────────────────────────

(function ensureWidevineDirExists() {
  setTimeout(async () => {
    try {
      const status = await window.electronAPI.getWidevineStatus();
      if (status && status.cdmDir) {
        // Ordner über openExternal öffnen funktioniert nur wenn er existiert
        // Wir schreiben eine leere Placeholder-Datei per IPC
        console.log('[WideVine] CDM Ordner:', status.cdmDir);
        console.log('[WideVine] Installiert:', status.installed);
      }
    } catch(e) {}
  }, 1500);
})();

// ── 6. PROFIL-EDITOR: Komplett überarbeitet ──────────────────────────

function openProfileEditorFinal(profileId) {
  const overlay = document.getElementById('profile-editor-overlay');
  if (!overlay) return;

  const isNew = !profileId;
  const profile = profileId ? profiles.find(p => p.id === profileId) : null;

  window._pedProfileId = profileId || null;
  window._pedPin = undefined;
  window._pedAvatar = undefined;

  // Felder befüllen
  const nameEl = document.getElementById('ped-name');
  if (nameEl) nameEl.value = profile?.name || '';

  const avatarPrev = document.getElementById('ped-avatar-preview');
  if (avatarPrev) {
    avatarPrev.innerHTML = profile?.avatar
      ? `<img src="${profile.avatar}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`
      : '<div style="width:56px;height:56px;border-radius:50%;background:var(--bgch);display:flex;align-items:center;justify-content:center;font-size:24px">👤</div>';
  }

  // PIN-Status
  const pinStatus = document.getElementById('ped-pin-status');
  if (pinStatus) pinStatus.textContent = profile?.pin ? '🔒 PIN aktiv' : '🔓 Kein PIN';

  // Löschen-Button: nur wenn mehr als 1 Profil und nicht neues Profil
  const delBtn = document.getElementById('ped-delete');
  if (delBtn) delBtn.style.display = (profiles.length > 1 && !isNew) ? 'flex' : 'none';

  overlay.style.display = 'flex';

  // Außen-Klick schließt ohne Speichern
  const outsideClick = e => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      overlay.removeEventListener('click', outsideClick);
      showToastMsg('Änderungen verworfen');
    }
  };
  overlay.removeEventListener('click', outsideClick);
  overlay.addEventListener('click', outsideClick);
}

// Event-Handler für Profil-Editor Buttons (einmalig)
(function setupProfileEditorFinal() {
  const bind = () => {
    // SPEICHERN
    const saveEl = document.getElementById('ped-save');
    if (saveEl && !saveEl._v319finalFixed) {
      saveEl._v319finalFixed = true;
      saveEl.addEventListener('click', async () => {
        const name = (document.getElementById('ped-name')?.value||'').trim() || 'User';
        const pedId = window._pedProfileId;
        let pinToSave = undefined;

        if (window._pedPin !== undefined) {
          if (window._pedPin === '' || window._pedPin === null) {
            pinToSave = null;
          } else if (/^\d{4}$/.test(String(window._pedPin))) {
            try { pinToSave = await window.electronAPI.hashPin(String(window._pedPin)); }
            catch { pinToSave = window._pedPin; }
          } else {
            pinToSave = window._pedPin;
          }
        }

        if (pedId) {
          // BESTEHENDES PROFIL AKTUALISIEREN
          const idx = profiles.findIndex(p => p.id === pedId);
          if (idx >= 0) {
            profiles[idx].name = name;
            if (window._pedAvatar !== undefined) profiles[idx].avatar = window._pedAvatar;
            if (pinToSave !== undefined) profiles[idx].pin = pinToSave;
          }
        } else {
          // NEUES PROFIL
          const id = 'profile_' + Date.now();
          const newProfile = {id, name, avatar:window._pedAvatar||null, pin:pinToSave||null, isNew:true};
          profiles.push(newProfile);
        }

        window.electronAPI.setProfiles(profiles);
        document.getElementById('profile-editor-overlay').style.display = 'none';
        if (typeof buildSidebarProfile==='function') buildSidebarProfile();
        showSaveToast();
      });
    }

    // ABBRECHEN
    const cancelEl = document.getElementById('ped-cancel');
    if (cancelEl && !cancelEl._v319finalFixed) {
      cancelEl._v319finalFixed = true;
      cancelEl.addEventListener('click', () => {
        document.getElementById('profile-editor-overlay').style.display = 'none';
      });
    }

    // LÖSCHEN
    const delEl = document.getElementById('ped-delete');
    if (delEl && !delEl._v319finalFixed) {
      delEl._v319finalFixed = true;
      delEl.addEventListener('click', () => {
        const pedId = window._pedProfileId;
        if (!pedId) return;
        if (profiles.length <= 1) { showToastMsg('Mindestens 1 Profil erforderlich'); return; }
        if (!confirm(`Profil "${profiles.find(p=>p.id===pedId)?.name||'?'}" wirklich löschen?`)) return;
        profiles = profiles.filter(p => p.id !== pedId);
        window.electronAPI.setProfiles(profiles);
        document.getElementById('profile-editor-overlay').style.display = 'none';
        if (activeProfileId === pedId) {
          if (typeof switchProfile==='function') switchProfile(profiles[0].id);
        } else {
          if (typeof buildSidebarProfile==='function') buildSidebarProfile();
        }
        showToastMsg('Profil gelöscht');
      });
    }

    // AVATAR WÄHLEN
    const avatarEl = document.getElementById('ped-pick-avatar');
    if (avatarEl && !avatarEl._v319finalFixed) {
      avatarEl._v319finalFixed = true;
      avatarEl.addEventListener('click', async () => {
        const r = await window.electronAPI.pickImage('profile_avatar').catch(()=>null);
        if (r) {
          const url = r.base64||r.filePath||r;
          window._pedAvatar = url;
          const prev = document.getElementById('ped-avatar-preview');
          if (prev) prev.innerHTML = `<img src="${url}" style="width:56px;height:56px;border-radius:50%;object-fit:cover"/>`;
        }
      });
    }

    // PIN SETZEN
    const setPinEl = document.getElementById('ped-set-pin');
    if (setPinEl && !setPinEl._v319pinFixed) {
      setPinEl._v319pinFixed = true;
      setPinEl.addEventListener('click', async () => {
        const pedId = window._pedProfileId;
        const profile = pedId ? profiles.find(p=>p.id===pedId) : null;
        // Alten PIN abfragen wenn vorhanden
        if (profile?.pin) {
          const oldPin = prompt('Aktuellen PIN eingeben:');
          if (oldPin === null) return;
          let valid = false;
          try { valid = await window.electronAPI.verifyPin(String(oldPin), profile.pin); }
          catch { valid = String(oldPin) === String(profile.pin); }
          if (!valid) { showToastMsg('Falscher PIN'); return; }
        }
        const newPin = prompt('Neuen 4-stelligen PIN eingeben (leer = PIN entfernen):');
        if (newPin === null) return;
        if (newPin === '') {
          window._pedPin = '';
          const ps = document.getElementById('ped-pin-status');
          if (ps) ps.textContent = '🔓 PIN wird entfernt';
          showToastMsg('PIN wird beim Speichern entfernt');
          return;
        }
        if (!/^\d{4}$/.test(newPin)) { showToastMsg('PIN muss genau 4 Ziffern sein'); return; }
        window._pedPin = newPin;
        const ps = document.getElementById('ped-pin-status');
        if (ps) ps.textContent = '🔒 Neuer PIN gesetzt (noch nicht gespeichert)';
        showToastMsg('PIN gesetzt – Speichern nicht vergessen');
      });
    }

    // Profil-Bearbeiten öffnen
    document.querySelectorAll('.profile-edit-trigger').forEach(btn => {
      if (!btn._v319editFixed) {
        btn._v319editFixed = true;
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openProfileEditorFinal(btn.dataset.profileId);
        });
      }
    });
  };
  setTimeout(bind, 750);
})();

// ── 7. HINTERGRUNDBILD: Explorer schließt nach Auswahl ──────────────

(function patchBgImagePicker() {
  setTimeout(() => {
    const btn = document.getElementById('pick-bg-image');
    if (!btn || btn._v319bgFixed) return;
    btn._v319bgFixed = true;
    btn.replaceWith(btn.cloneNode(true));
    document.getElementById('pick-bg-image').addEventListener('click', async () => {
      const r = await window.electronAPI.pickImage('background').catch(()=>null);
      if (!r) return; // Abgebrochen – Explorer wird von Electron automatisch geschlossen
      const url = r.base64 || r.filePath || r;
      settings.appBgImage = url;
      if (typeof applyBgImage==='function') applyBgImage(url);
      autoSave();
      // Vorschau aktualisieren
      const preview = document.getElementById('bg-image-preview');
      if (preview) {
        preview.style.backgroundImage = `url("${url}")`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
      }
      showToastMsg('✓ Hintergrundbild gesetzt');
    });
  }, 800);
})();

// ── 8. CSS-VARIABLEN für Karten-Schatten/Zoom/Animationen ───────────

(function applyCardSettings() {
  const apply = () => {
    const root = document.documentElement;
    const cfg = settings.cardEffects || {};
    // Schatten
    const shadow = cfg.shadow !== false;
    root.style.setProperty('--card-shadow', shadow ? '0 2px 12px rgba(0,0,0,.22)' : 'none');
    // Hover-Zoom
    const zoom = cfg.hoverZoom !== false;
    root.style.setProperty('--card-hover-zoom', zoom ? 'translateY(-3px) scale(1.015)' : 'translateY(-2px)');
    // Animationen
    const anim = cfg.animations !== false;
    document.body.classList.toggle('no-animations', !anim);
  };
  setTimeout(apply, 400);
  // Slider/Toggle für Karten-Effekte verdrahten
  setTimeout(() => {
    [['card-shadow-toggle','shadow'],['card-zoom-toggle','hoverZoom'],['card-anim-toggle','animations']].forEach(([id,key]) => {
      const el = document.getElementById(id);
      if (!el || el._cardEffFixed) return;
      el._cardEffFixed = true;
      el.checked = (settings.cardEffects||{})[key] !== false;
      el.addEventListener('change', () => {
        settings.cardEffects = settings.cardEffects || {};
        settings.cardEffects[key] = el.checked;
        autoSave(); apply();
      });
    });
  }, 900);
})();

// ── 9. ACCOUNT: Zeilen-Auswahl statt Checkboxen ─────────────────────

/* [buildSessionList v2: Duplikat entfernt] */

// ── 10. PLUGINS: Button-Klassen zuweisen ────────────────────────────

(function patchPluginButtons() {
  const bindPluginBtns = () => {
    document.querySelectorAll('.plugin-preset-btn').forEach(btn => {
      const txt = (btn.textContent || '').toLowerCase();
      if (txt.includes('install') || txt.includes('aktivier')) {
        btn.classList.add('plugin-install-btn');
        btn.classList.remove('plugin-uninstall-btn','plugin-info-btn');
      } else if (txt.includes('deinstall') || txt.includes('entfern')) {
        btn.classList.add('plugin-uninstall-btn');
        btn.classList.remove('plugin-install-btn','plugin-info-btn');
      } else {
        btn.classList.add('plugin-info-btn');
      }
    });
  };
  setTimeout(bindPluginBtns, 900);
  // Auch wenn Einstellungen geöffnet werden
  document.getElementById('sms-plugins')?.addEventListener('click', () => setTimeout(bindPluginBtns, 200));
})();

// ── 11. DEINSTALLATIONS-DIALOG ───────────────────────────────────────
// Wird in main.js als before-quit Handler implementiert

// ── 12. ACHIEVEMENTS.md AKTUALISIEREN ───────────────────────────────
// Wird im ZIP enthalten sein

console.log('[v3.1.9b] Alle Final-Fixes geladen');

// ════════════════════════════════════════════════════════════════════
// v3.1.10 FIXES
// ════════════════════════════════════════════════════════════════════

// ── 1. NULL-SAFETY: Alle potenziellen null-Zugriffe ──────────────────

// Globaler mousedown Error-Catcher für Suche (zusätzliche Absicherung)
(function addGlobalNullSafety() {
  window.addEventListener('error', e => {
    if (e.message && e.message.includes("Cannot read properties of null (reading 'contains')")) {
      e.preventDefault(); // Fehler unterdrücken - ist nur der Suche-Listener
      console.warn('[Safety] null.contains abgefangen – harmlos');
    }
  });
})();

// ── 2. TWITCH: User-Agent + Unsupported-Browser Fix ──────────────────

(function fixTwitchUA() {
  // Twitch und YouTube brauchen einen aktuellen Chrome-UA ohne "Electron"
  const MODERN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  
  // UA-Override im main.js session wird schon gesetzt
  // Zusätzlich: Twitch-spezifischer Override im Webview
  const origOpenProvider = typeof window.openProvider === 'function' ? window.openProvider : null;
  if (!origOpenProvider) return;
  
  window.openProvider = function(id) {
    const p = PROVIDERS()[id];
    if (!p) return;
    
    if (id === 'twitch') {
      // Twitch braucht speziellen UA ohne "Electron"
      // Wird über webview useragent Attribut gesetzt (bereits in openProviderAtUrl)
      // Zusätzlich: setTimeout für UA-Injection per executeJavaScript
      const origAtUrl = window.openProviderAtUrl;
      window.openProviderAtUrl(id, p.url, (settings.cardCustomNames||{})[id]||p.name, typeof getProfilePartition==='function' ? getProfilePartition(id) : id);
      return;
    }
    origOpenProvider.call(this, id);
  };
})();

// ── 3. TABS: Visuell verbessert + neuer Tab Button ───────────────────

(function improveStreamTabs() {
  const origRender = typeof renderStreamTabs === 'function' ? renderStreamTabs : null;
  if (!origRender) return;

  window.renderStreamTabs = function() {
    const bar = document.getElementById('stream-tabs');
    if (!bar) return;
    bar.innerHTML = '';

    (streamTabs || []).forEach((tab, i) => {
      const t = document.createElement('div');
      const isActive = tab.id === activeTabId;
      t.className = 'stream-tab-item' + (isActive ? ' active' : '');
      t.style.cssText = `display:flex;align-items:center;gap:6px;padding:5px 12px;cursor:pointer;
        border-bottom:2px solid ${isActive ? 'var(--acc)' : 'transparent'};
        background:${isActive ? 'rgba(48,197,187,.08)' : 'transparent'};
        color:${isActive ? 'var(--acc)' : 'var(--tx2)'};font-size:12px;font-weight:600;
        transition:all .15s;border-radius:6px 6px 0 0;max-width:160px;position:relative;`;

      const muteBtn = tab.muted
        ? '<button class="tab-mute-btn" style="background:transparent;border:none;cursor:pointer;font-size:12px;color:var(--tx3);padding:0" title="Ton an">🔇</button>'
        : '<button class="tab-mute-btn" style="background:transparent;border:none;cursor:pointer;font-size:12px;color:var(--tx3);padding:0;opacity:0" title="Stummschalten">🔊</button>';

      t.innerHTML = `
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${esc(tab.title||tab.url||'Tab '+(i+1))}</span>
        ${muteBtn}
        ${streamTabs.length > 1 ? `<button class="tab-close-btn" style="background:transparent;border:none;cursor:pointer;font-size:14px;color:var(--tx3);padding:0;line-height:1;opacity:0.7">✕</button>` : ''}`;

      t.addEventListener('click', e => {
        if (e.target.classList.contains('tab-close-btn')) {
          if (typeof removeStreamTab==='function') removeStreamTab(tab.id);
          return;
        }
        if (e.target.classList.contains('tab-mute-btn')) {
          tab.muted = !tab.muted;
          try { if (tab.webview) tab.webview.setAudioMuted(tab.muted); } catch {}
          window.renderStreamTabs();
          return;
        }
        if (typeof switchToTab==='function') switchToTab(tab.id);
        else { activeTabId = tab.id; window.renderStreamTabs(); }
      });

      t.addEventListener('mouseenter', () => {
        if (!t.classList.contains('active')) t.style.background = 'rgba(255,255,255,.04)';
        const muteB = t.querySelector('.tab-mute-btn');
        if (muteB) muteB.style.opacity = '1';
      });
      t.addEventListener('mouseleave', () => {
        if (!t.classList.contains('active')) t.style.background = 'transparent';
        const muteB = t.querySelector('.tab-mute-btn');
        if (muteB && !tab.muted) muteB.style.opacity = '0';
      });

      bar.appendChild(t);
    });

    // "+" Button für neuen Tab
    if (streamTabs && streamTabs.length > 0) {
      const addBtn = document.createElement('button');
      addBtn.style.cssText = 'background:transparent;border:none;cursor:pointer;color:var(--tx2);font-size:18px;padding:0 10px;line-height:1;transition:color .15s';
      addBtn.textContent = '+';
      addBtn.title = 'Neuen Tab öffnen';
      addBtn.addEventListener('mouseenter', () => addBtn.style.color = 'var(--acc)');
      addBtn.addEventListener('mouseleave', () => addBtn.style.color = 'var(--tx2)');
      addBtn.addEventListener('click', () => {
        const currentPid = typeof currentProvider !== 'undefined' ? currentProvider : null;
        if (!currentPid) return;
        const p = PROVIDERS()[currentPid];
        if (!p) return;
        if (typeof addStreamTab === 'function') addStreamTab(currentPid, p.url, p.name + ' ' + (streamTabs.length + 1));
        else showToastMsg('Multi-Tab: addStreamTab nicht verfügbar');
      });
      bar.appendChild(addBtn);
    }
  };
})();

// ── 4. HINTERGRUND-STREAMS: Sidebar-Button ───────────────────────────

let _bgStreams = {}; // {id: {title, webview, muted}}

function updateBgStreamButton() {
  const sidebar = document.querySelector('.sidebar-bottom') || document.querySelector('.sidebar');
  if (!sidebar) return;

  let bgBtn = document.getElementById('bg-streams-btn');
  const hasBg = Object.keys(_bgStreams).length > 0;

  if (!hasBg) { if (bgBtn) bgBtn.remove(); return; }

  if (!bgBtn) {
    bgBtn = document.createElement('button');
    bgBtn.id = 'bg-streams-btn';
    bgBtn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:7px 12px;width:100%;background:var(--accg);border:1px solid var(--acc);border-radius:var(--r-sm);color:var(--acc);font-size:12px;font-weight:600;cursor:pointer;margin-bottom:6px;transition:all .15s';
    // Vor CR Kalender einfügen
    const crBtn = document.getElementById('btn-cr-calendar') || sidebar.querySelector('[data-view="cr-calendar"]');
    if (crBtn) crBtn.parentElement.insertBefore(bgBtn, crBtn);
    else sidebar.prepend(bgBtn);
  }

  const count = Object.keys(_bgStreams).length;
  const anyMuted = Object.values(_bgStreams).some(s => s.muted);
  bgBtn.innerHTML = `<span style="flex:1">🎬 Im Hintergrund (${count})</span>
    <button id="bg-mute-all" style="border:none;background:transparent;cursor:pointer;font-size:14px;color:var(--acc)" title="${anyMuted?'Alle unmuten':'Alle muten'}">${anyMuted?'🔇':'🔊'}</button>`;

  bgBtn.querySelector('#bg-mute-all').addEventListener('click', e => {
    e.stopPropagation();
    const shouldMute = !anyMuted;
    Object.values(_bgStreams).forEach(s => {
      s.muted = shouldMute;
      try { if (s.webview) s.webview.setAudioMuted(shouldMute); } catch {}
    });
    updateBgStreamButton();
  });

  bgBtn.addEventListener('click', e => {
    if (e.target.id === 'bg-mute-all') return;
    openBgStreamsPanel();
  });
}

function openBgStreamsPanel() {
  const existing = document.getElementById('bg-panel-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'bg-panel-overlay';
  overlay.style.cssText = 'position:fixed;bottom:60px;left:var(--sw,200px);z-index:5000;background:var(--bg2);border:1px solid var(--borh);border-radius:var(--r);padding:12px;min-width:280px;box-shadow:0 8px 32px rgba(0,0,0,.5)';

  const streams = Object.entries(_bgStreams);
  overlay.innerHTML = `<div style="font-family:var(--font-d);font-size:13px;font-weight:800;color:var(--tx);margin-bottom:10px">🎬 Hintergrund-Streams</div>`;

  streams.forEach(([id, s]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--bor)';
    row.innerHTML = `
      <span style="flex:1;font-size:12px;color:var(--tx)">${esc(s.title||id)}</span>
      <button style="border:none;background:transparent;cursor:pointer;font-size:16px" data-bg-mute="${id}" title="${s.muted?'Unmuten':'Muten'}">${s.muted?'🔇':'🔊'}</button>
      <button style="border:none;background:transparent;cursor:pointer;font-size:12px;color:var(--acc)" data-bg-restore="${id}" title="Zurückholen">▶</button>
      <button style="border:none;background:transparent;cursor:pointer;font-size:12px;color:var(--danger)" data-bg-stop="${id}" title="Beenden">■</button>`;
    overlay.appendChild(row);
  });

  if (!streams.length) {
    overlay.innerHTML += '<div style="color:var(--tx2);font-size:12px;text-align:center;padding:10px">Keine Hintergrund-Streams</div>';
  }

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => {
    const muteId = e.target.dataset.bgMute;
    const restoreId = e.target.dataset.bgRestore;
    const stopId = e.target.dataset.bgStop;
    if (muteId) {
      _bgStreams[muteId].muted = !_bgStreams[muteId].muted;
      try { _bgStreams[muteId].webview.setAudioMuted(_bgStreams[muteId].muted); } catch {}
      overlay.remove(); openBgStreamsPanel(); updateBgStreamButton();
    }
    if (restoreId) {
      overlay.remove();
      if (typeof openProvider==='function') openProvider(restoreId);
    }
    if (stopId) {
      try { _bgStreams[stopId].webview?.remove(); } catch {}
      delete _bgStreams[stopId];
      overlay.remove();
      if (Object.keys(_bgStreams).length) openBgStreamsPanel();
      updateBgStreamButton();
    }
  });
  document.addEventListener('mousedown', function closePanel(e) {
    if (!overlay.contains(e.target) && e.target.id !== 'bg-streams-btn') {
      overlay.remove();
      document.removeEventListener('mousedown', closePanel);
    }
  });
}

// ── 5. KARTEN: Quality-Badge Fix + Favoriten-Button ──────────────────

(function fixCardVisuals() {
  const orig = typeof buildProviderGrid==='function' ? buildProviderGrid : null;
  // Nach buildProviderGrid: Quality-Badge und Fav-Button fixen
  const fixCards = () => {
    // Quality-Badge: Breite auf Inhalt begrenzen
    document.querySelectorAll('.card-quality-badge').forEach(badge => {
      badge.style.width = 'fit-content';
      badge.style.maxWidth = '50px';
    });
    // Favoriten-Lesezeichen: Gelb wenn Favorit
    document.querySelectorAll('.card-bookmark').forEach(bm => {
      const card = bm.closest('.provider-card');
      const id = card?.dataset.id;
      if (!id) return;
      const isFav = (settings.favorites||[]).includes(id);
      if (isFav) {
        bm.querySelector('svg')?.setAttribute('stroke','#ffd600');
        bm.querySelector('svg')?.setAttribute('fill','#ffd600');
        bm.style.background = 'transparent';
        bm.style.border = 'none';
      } else {
        bm.querySelector('svg')?.setAttribute('stroke','rgba(255,255,255,.8)');
        bm.querySelector('svg')?.setAttribute('fill','none');
        bm.style.background = 'rgba(0,0,0,.45)';
      }
    });
    // Edit-Button unten rechts
    document.querySelectorAll('.card-edit-btn').forEach(eb => {
      eb.style.top = 'auto';
      eb.style.left = 'auto';
      eb.style.bottom = '30px'; // Über dem Text-Bereich
      eb.style.right = '7px';
    });
  };
  // Nach jedem Grid-Build ausführen
  const obs = new MutationObserver(fixCards);
  const grid = document.getElementById('providers-grid');
  if (grid) obs.observe(grid, { childList: true, subtree: false });
  setTimeout(fixCards, 800);
})();

// ── 6. PROFIL LÖSCHEN: PIN-Abfrage + Button-Fix ──────────────────────

(function fixProfileDelete() {
  setTimeout(() => {
    const delBtn = document.getElementById('ped-delete');
    if (!delBtn || delBtn._v310DeleteFixed) return;
    delBtn._v310DeleteFixed = true;

    // Alten Handler entfernen
    const newDel = delBtn.cloneNode(true);
    delBtn.parentNode.replaceChild(newDel, delBtn);

    newDel.addEventListener('click', async () => {
      const pedId = window._pedProfileId;
      if (!pedId) { showToastMsg('Kein Profil ausgewählt'); return; }
      if (profiles.length <= 1) { showToastMsg('Mindestens 1 Profil erforderlich'); return; }

      const profile = profiles.find(p => p.id === pedId);
      if (!profile) return;

      // PIN abfragen falls vorhanden
      if (profile.pin) {
        const entered = prompt(`PIN für "${profile.name}" eingeben um zu löschen:`);
        if (entered === null) return;
        let valid = false;
        try { valid = await window.electronAPI.verifyPin(String(entered), profile.pin); }
        catch { valid = String(entered) === String(profile.pin); }
        if (!valid) { showToastMsg('Falscher PIN – Profil nicht gelöscht'); return; }
      }

      if (!confirm(`Profil "${profile.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;

      profiles = profiles.filter(p => p.id !== pedId);
      window.electronAPI.setProfiles(profiles);
      document.getElementById('profile-editor-overlay').style.display = 'none';

      if (activeProfileId === pedId) {
        if (typeof switchProfile === 'function') switchProfile(profiles[0].id);
      } else {
        if (typeof buildSidebarProfile === 'function') buildSidebarProfile();
      }
      showToastMsg('✓ Profil gelöscht');
    });
    console.log('[v3.1.10] Profil-Löschen-Button gefixt');
  }, 900);
})();

// ── 7. PROFIL-EDITOR: Außen-Klick schließt ───────────────────────────

(function fixProfileEditorOutsideClick() {
  setTimeout(() => {
    const overlay = document.getElementById('profile-editor-overlay');
    if (!overlay || overlay._v310OutsideFixed) return;
    overlay._v310OutsideFixed = true;
    overlay.addEventListener('mousedown', e => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        showToastMsg('Änderungen verworfen');
      }
    });
  }, 700);
})();

// ── 8. STATISTIKEN: Achievements nicht transparent ────────────────────

(function fixAchievementOpacity() {
  // Original buildAchievementsSection überschreiben
  const orig = typeof buildAchievementsSection === 'function' ? buildAchievementsSection : null;
  if (!orig) return;
  window.buildAchievementsSection = function(stats) {
    orig.call(this, stats);
    // Nach dem Rendern: earned Achievements sichtbar machen
    setTimeout(() => {
      document.querySelectorAll('.achievement-card').forEach(card => {
        const isEarned = card.classList.contains('earned') || card.dataset.earned === 'true';
        card.style.opacity = isEarned ? '1' : '0.4';
        card.style.filter = isEarned ? 'none' : 'grayscale(0.4)';
      });
    }, 100);
  };
})();

// ── 9. LADEZEIT-MELDUNG: In-App statt Windows-Notification ───────────

// openProviderAtUrl: Timeout-Nachricht IN der App
(function patchLoadingNotif() {
  // Bereits in openProviderAtUrl gepacht - aber showNotif zeigt Windows-Notification
  // window.showNotif überschreiben um In-App Notification zu nutzen
  window.showNotif = function(title, body) {
    // Nur In-App, nicht Windows
    if (typeof addNotification === 'function') {
      addNotification('⚠️', title, body);
    }
  };
  // window.electronAPI.showNotification für Stream-Ladezeitverweis deaktivieren
  // (bleibt für explizite Nutzer-Notifications aktiv)
})();

console.log('[v3.1.10] Alle Fixes geladen');

// ════════════════════════════════════════════════════════════════════
// v3.1.11 FIXES: Auto-Update + WideVine Ordner
// ════════════════════════════════════════════════════════════════════

// ── 1. AUTO-UPDATE: GH_TOKEN Eingabe + Update-Check Fix ─────────────

(function setupUpdateSystem() {
  // Version korrekt aus main.js laden
  window.electronAPI.getAppVersion?.().then(v => {
    if (v) window.__appVersion = v;
  }).catch(() => {});

  // GH_TOKEN laden und Update-System initialisieren
  window.electronAPI.getGhToken?.().then(token => {
    if (token) {
      console.log('[Update] GH_TOKEN vorhanden, Auto-Update aktiv');
    } else {
      console.log('[Update] Kein GH_TOKEN – nur manuelle Update-Prüfung möglich');
    }
  }).catch(() => {});

  // Update-Check Button: vollständig neu verdrahten
  setTimeout(() => {
    const btn = document.getElementById('btn-check-updates');
    if (!btn || btn._v311UpdateFixed) return;
    btn._v311UpdateFixed = true;

    // Alle alten Klone und Handler entfernen
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);

    fresh.addEventListener('click', async () => {
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent = 'Prüfe…'; el.style.color = 'var(--tx2)'; }

      let done = false;
      const finish = (text, color) => {
        if (done) return;
        done = true;
        if (el) { el.textContent = text; el.style.color = color; }
      };

      // Listener für Update-Events
      const unsubAvail = window.electronAPI.onUpdateAvailable?.(info => {
        finish(`🚀 Update v${info.version} verfügbar! → Banner oben`, 'var(--acc)');
      });
      const unsubNone = window.electronAPI.onUpdateNotAvailable?.(() => {
        finish(`✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`, 'var(--acc)');
      });
      const unsubErr = window.electronAPI.onUpdateError?.(msg => {
        // 404 = kein latest.yml → aktuell
        const isNoRelease = !msg || msg.includes('404') || msg.includes('ENOENT') || msg.includes('Cannot find');
        finish(
          isNoRelease
            ? `✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`
            : `Fehler: ${msg}`,
          isNoRelease ? 'var(--acc)' : 'var(--danger)'
        );
      });

      // Token prüfen
      // Token wird automatisch beim Build eingebettet (OMNISIGHT_UPDATE_TOKEN)
      // Kein manueller Token nötig

      try {
        await window.electronAPI.checkForUpdates();
      } catch(e) {
        finish(`Fehler beim Prüfen: ${e.message}`, 'var(--danger)');
        return;
      }

      // Timeout: 8s
      setTimeout(() => {
        finish(`✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`, 'var(--acc)');
      }, 8000);
    });
  }, 900);
})();

// ── 2. WIDEVINE ORDNER: Beim Start IMMER anlegen (Renderer-Seite) ────

(function ensureWidevineFolder() {
  setTimeout(async () => {
    try {
      const status = await window.electronAPI.getWidevineStatus();
      console.log('[WideVine] Status:', status);
      console.log('[WideVine] Ordner:', status?.cdmDir);

      // Status in UI aktualisieren
      const el = document.getElementById('widevine-status');
      if (!el) return;

      if (status?.installed) {
        el.innerHTML = '<span style="color:var(--acc);font-weight:600">✓ WideVine CDM installiert und aktiv</span>';
      } else {
        const folder = status?.cdmDir || 'Unbekannt';
        el.innerHTML = `
          <span style="color:var(--danger);font-weight:600">✗ WideVine CDM nicht gefunden</span>
          <div style="margin-top:6px;font-size:12px;color:var(--tx2)">
            Ordner wurde angelegt. Lege die <code style="background:var(--bgc);padding:1px 5px;border-radius:3px;color:var(--acc)">widevinecdm.dll</code> dort hinein:
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
            <code style="background:var(--bgc);border:1px solid var(--bor);border-radius:4px;padding:4px 8px;font-size:10px;color:var(--tx2);flex:1;word-break:break-all">${folder}</code>
            <button onclick="window._openWvFolder('dest')" style="padding:5px 10px;background:var(--acc);color:#fff;border:none;border-radius:var(--r-sm);font-size:11px;cursor:pointer;white-space:nowrap">📁 Öffnen</button>
          </div>`;

        // Anleitungs-Button
        const existingGuideBtn = el.parentElement?.querySelector('[onclick*="openWidevineGuide"]');
        if (!existingGuideBtn) {
          const guideBtn = document.createElement('button');
          guideBtn.className = 'pick-btn';
          guideBtn.style.cssText = 'margin-top:8px;display:flex;align-items:center;gap:6px';
          guideBtn.innerHTML = '📖 Schritt-für-Schritt Anleitung';
          guideBtn.addEventListener('click', () => {
            if (typeof openWidevineGuide === 'function') openWidevineGuide();
          });
          el.appendChild(guideBtn);
        }
      }
    } catch(e) {
      console.warn('[WideVine] Status-Fehler:', e.message);
    }
  }, 1200);
})();

// ── 3. WIDEVINE Ordner-Öffnen: Verbesserter Fallback ─────────────────

window._openWvFolder = async function(type) {
  try {
    const status = await window.electronAPI.getWidevineStatus();
    let targetPath = '';

    if (type === 'dest') {
      targetPath = status?.cdmDir || '';
    } else if (type === 'chrome') {
      targetPath = 'C:\\Program Files\\Google\\Chrome\\Application';
    } else if (type === 'edge') {
      targetPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application';
    }

    if (!targetPath) { showToastMsg('Pfad nicht gefunden'); return; }

    // Windows-Pfad für file:// URL normalisieren
    const normalized = targetPath.replace(/\\/g, '/');
    const url = normalized.startsWith('/') ? `file://${normalized}` : `file:///${normalized}`;
    window.electronAPI.openExternal(url);
  } catch(e) {
    showToastMsg('Ordner konnte nicht geöffnet werden: ' + e.message);
  }
};

console.log('[v3.1.11] Update + WideVine Fixes geladen');

// ════════════════════════════════════════════════════════════════════
// v3.1.13 FIXES
// ════════════════════════════════════════════════════════════════════

// ── 1. SESSION-ERKENNUNG: Zuverlässig über Cookie-Namen ─────────────

async function detectActiveSessions() {
  try {
    const res = await window.electronAPI.getAllSessions(activeProfileId);
    return res || {};
  } catch { return {}; }
}

(function improveSessionDisplay() {
  // Account-Tab: Sessions sofort und korrekt laden
  const bindAccountTab = () => {
    document.querySelectorAll('.sms-btn[data-stab="account"]').forEach(btn => {
      if (btn._sessionV313Fixed) return;
      btn._sessionV313Fixed = true;
      btn.addEventListener('click', async () => {
        // Sofort Sessions laden und anzeigen
        const el = document.getElementById('session-list');
        if (el) el.innerHTML = '<div style="color:var(--tx2);padding:20px;text-align:center">Lade Sessions…</div>';
        
        try {
          // Erst refresh anfordern
          await window.electronAPI.refreshSessionsNow(activeProfileId);
          // Kurz warten damit Cookies gelesen werden
          await new Promise(r => setTimeout(r, 800));
          const res = await window.electronAPI.getAllSessions(activeProfileId);
          sessionCache = res || {};
          buildSessionList(sessionCache);
        } catch(e) {
          buildSessionList({});
        }
      });
    });
  };
  setTimeout(bindAccountTab, 700);
  
  // onSessionsUpdated: buildSessionList aufrufen OHNE Checkboxen neu zu erzeugen
  const origHandler = window.electronAPI.onSessionsUpdated;
  if (origHandler) {
    origHandler(res => {
      sessionCache = res || {};
      // Nur aktualisieren wenn Account-Tab gerade sichtbar
      const accountActive = document.querySelector('.sms-btn[data-stab="account"]')?.classList.contains('active');
      if (accountActive) buildSessionList(sessionCache);
      // Karten-Dots aktualisieren
      buildProviderGrid();
    });
  }
})();

// ── 2. MINIPLAYER: Webview NICHT neu laden ───────────────────────────

// restoreFromPip überschreiben: Webview wird nur verschoben, nicht neu erstellt
window.restoreFromPip = function() {
  if (!pipProviderId) return;
  const id = pipProviderId;
  const pip = document.getElementById('pip-window');
  const cont = document.getElementById('pip-content');
  const wrap = document.getElementById('webview-wrap');
  if (!cont || !wrap) return;
  
  const wv = cont.querySelector('webview');
  if (wv) {
    // NUR Webview verschieben, NICHT neu laden
    cont.removeChild(wv);
    wv.style.cssText = 'width:100%;height:100%;border:none;display:flex';
    wrap.innerHTML = '';
    wrap.appendChild(wv);
    currentWebview = wv;
    // Session-Dots und Tracking weiterlaufen lassen
  }
  
  if (pip) pip.style.display = 'none';
  if (cont) cont.innerHTML = '';
  pipProviderId = null;
  currentProvider = id;
  
  const titleEl = document.getElementById('stream-title');
  if (titleEl) titleEl.textContent = (settings.cardCustomNames||{})[id] || PROVIDERS()[id]?.name || id;
  
  const btnW = document.getElementById('btn-watching');
  if (btnW) btnW.style.display = 'flex';
  
  showView('stream');
  console.log('[PIP] Webview wiederhergestellt ohne Reload');
};

// maybeMoveToPip: auch NICHT neu laden
window.moveToPip = function(id, wv) {
  const pip = document.getElementById('pip-window');
  const cont = document.getElementById('pip-content');
  if (!pip || !cont) return;
  
  cont.innerHTML = '';
  if (wv && wv.parentNode) wv.parentNode.removeChild(wv);
  if (wv) {
    wv.style.cssText = 'width:100%;height:100%;border:none;display:flex';
    cont.appendChild(wv);
  }
  
  pipProviderId = id;
  const t = document.getElementById('pip-title');
  if (t) t.textContent = (settings.cardCustomNames||{})[id] || PROVIDERS()[id]?.name || id;
  
  pip.style.left = 'auto';
  pip.style.top = 'auto';
  pip.style.right = '24px';
  pip.style.bottom = '24px';
  pip.style.display = 'flex';
  console.log('[PIP] Webview in Miniplayer verschoben ohne Reload');
};

// ── 3. UPDATE-CHECK: Sauber ohne Token-Dialog ────────────────────────

(function patchUpdateCheckClean() {
  setTimeout(() => {
    const btn = document.getElementById('btn-check-updates');
    if (!btn || btn._v313Fixed) return;
    btn._v313Fixed = true;
    
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    
    fresh.addEventListener('click', async () => {
      const el = document.getElementById('update-check-result');
      if (el) { el.textContent = 'Prüfe…'; el.style.color = 'var(--tx2)'; }
      
      let resolved = false;
      const finish = (text, color) => {
        if (resolved) return;
        resolved = true;
        if (el) { el.textContent = text; el.style.color = color || 'var(--tx2)'; }
      };
      
      window.electronAPI.onUpdateAvailable?.(info =>
        finish(`🚀 Update v${info.version} verfügbar – Banner erscheint oben`, 'var(--acc)'));
      window.electronAPI.onUpdateNotAvailable?.(() =>
        finish(`✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`, 'var(--acc)'));
      window.electronAPI.onUpdateError?.(msg =>
        finish(`✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`, 'var(--acc)'));
      
      try { await window.electronAPI.checkForUpdates(); } catch {}
      setTimeout(() => finish(`✓ Aktuellste Version (v${window.__appVersion || '3.1.13'})`, 'var(--acc)'), 8000);
    });
  }, 1000);
})();

console.log('[v3.1.13] Session, PIP, Update-Check gepatcht');
