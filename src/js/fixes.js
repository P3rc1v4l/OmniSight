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
