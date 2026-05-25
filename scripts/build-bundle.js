#!/usr/bin/env node
/**
 * OmniSight – Bundle Script
 * Fasst alle JS-Module in der richtigen Reihenfolge zusammen.
 * Wird automatisch vor dem Electron-Build ausgeführt.
 *
 * Reihenfolge:
 *   1. Core-Module (Daten, I18N, Achievements)
 *   2. UI-Module (Suche, Notifications)
 *   3. Feature-Module (WideVine, Feedback)
 *   4. App-Hauptdatei (app.js)
 *   5. Fixes / Patches (fixes.js)
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, '..', 'src', 'js');
const OUT  = path.join(SRC, 'bundle.js');

const FILES = [
  // ── Core ─────────────────────────────────────────────────────────
  path.join(SRC, 'core', 'i18n.js'),
  path.join(SRC, 'core', 'providers.js'),
  path.join(SRC, 'core', 'achievements.js'),
  // ── UI ───────────────────────────────────────────────────────────
  path.join(SRC, 'ui', 'notifications.js'),
  path.join(SRC, 'ui', 'search.js'),
  // ── Features ─────────────────────────────────────────────────────
  path.join(SRC, 'features', 'widevine.js'),
  path.join(SRC, 'features', 'feedback.js'),
  // ── Haupt-App ────────────────────────────────────────────────────
  path.join(SRC, 'app.js'),
  // ── Fixes (letzte Priorität) ──────────────────────────────────────
  path.join(SRC, 'fixes.js'),
];

let bundle = `// OmniSight Bundle – generiert am ${new Date().toISOString()}
// NICHT MANUELL BEARBEITEN – Änderungen in den Quell-Dateien vornehmen
`;

let total = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.warn('⚠ Datei nicht gefunden:', file);
    continue;
  }
  const name = path.relative(SRC, file);
  const code = fs.readFileSync(file, 'utf8')
    .replace(/^'use strict';\n?/gm, '') // Doppelte 'use strict' entfernen
    .trim();
  bundle += `\n\n// ${'═'.repeat(60)}\n// ${name}\n// ${'═'.repeat(60)}\n\n${code}`;
  total++;
  console.log(`  ✓ ${name}`);
}

fs.writeFileSync(OUT, bundle);
const lines = bundle.split('\n').length;
const kb    = Math.round(fs.statSync(OUT).size / 1024);
console.log(`\n✅ Bundle erstellt: bundle.js (${lines} Zeilen, ${kb} KB, ${total} Module)`);
