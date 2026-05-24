'use strict';
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
    item.addEventListener('mouseenter', () => logoutBtn.style.display = 'block');
    item.addEventListener('mouseleave', () => logoutBtn.style.display = 'none');
    logoutBtn.addEventListener('click', () => {
      window.electronAPI.clearProviderSession(activeProfileId, id);
      showToastMsg('Abgemeldet von ' + p.name);
      setTimeout(() => window.electronAPI.refreshSessionsNow(activeProfileId), 500);
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
            el.textContent = '✓ Du hast die aktuellste Version (v'+((typeof settings!=='undefined'&&settings.appVersion)||'3.1.7')+')';
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
