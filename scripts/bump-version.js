#!/usr/bin/env node
/**
 * OmniSight – Version automatisch erhöhen und Git-Tag setzen
 * 
 * Verwendung:
 *   node scripts/bump-version.js patch   → x.y.Z+1  (Bugfix)
 *   node scripts/bump-version.js minor   → x.Y+1.0  (neues Feature)
 *   node scripts/bump-version.js major   → X+1.0.0  (große Änderung)
 * 
 * Was es tut:
 *   1. package.json Version erhöhen
 *   2. CHANGELOG.md Eintrag vorbereiten
 *   3. Git commit + Tag setzen
 *   4. Push auf origin main + Tag
 *   → GitHub Actions startet dann automatisch den Build
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bumpType = process.argv[2] || 'patch';
if (!['patch','minor','major'].includes(bumpType)) {
  console.error('Usage: node bump-version.js [patch|minor|major]');
  process.exit(1);
}

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const [maj, min, pat] = pkg.version.split('.').map(Number);

let newVersion;
if (bumpType === 'major') newVersion = `${maj+1}.0.0`;
else if (bumpType === 'minor') newVersion = `${maj}.${min+1}.0`;
else newVersion = `${maj}.${min}.${pat+1}`;

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✓ Version: ${pkg.version.replace(newVersion, '')}${newVersion} (war: ${maj}.${min}.${pat})`);

// splash.html Version aktualisieren
const splashPath = path.join(__dirname, '..', 'src', 'splash.html');
if (fs.existsSync(splashPath)) {
  let splash = fs.readFileSync(splashPath, 'utf8');
  splash = splash.replace(/v\d+\.\d+\.\d+/g, `v${newVersion}`);
  fs.writeFileSync(splashPath, splash);
  console.log('✓ splash.html aktualisiert');
}

// CHANGELOG vorbereiten
const clPath = path.join(__dirname, '..', 'CHANGELOG.md');
const cl = fs.readFileSync(clPath, 'utf8');
const entry = `## v${newVersion} — ${new Date().toISOString().split('T')[0]}\n\n### 🆕 Neue Features\n- \n\n### 🐛 Bugfixes\n- \n\n`;
fs.writeFileSync(clPath, entry + cl);
console.log('✓ CHANGELOG vorbereitet');

// Git commit + Tag + Push
try {
  execSync('git add package.json src/splash.html CHANGELOG.md', { stdio: 'inherit' });
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
  console.log(`\n✅ v${newVersion} gepusht → GitHub Actions startet Build automatisch!`);
} catch(e) {
  console.warn('\n⚠ Git-Befehle fehlgeschlagen (kein Git-Repo oder kein Remote?)');
  console.log(`Manuell ausführen:\n  git add . && git commit -m "release v${newVersion}" && git tag v${newVersion} && git push origin main && git push origin v${newVersion}`);
}
