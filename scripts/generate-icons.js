#!/usr/bin/env node
/**
 * Icon-Generator für Aletheos Stream
 * Konvertiert icon.svg → icon.png → icon.ico (Windows)
 *
 * Benötigt: npm install sharp png-to-ico --save-dev
 * Ausführen: node scripts/generate-icons.js
 */

const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');

async function generateIcons() {
  try {
    const sharp = require('sharp');
    const pngToIco = require('png-to-ico');

    const svgPath = path.join(assetsDir, 'icon.svg');
    const pngPath = path.join(assetsDir, 'icon.png');
    const icoPath = path.join(assetsDir, 'icon.ico');

    // 1. SVG → PNG (512x512)
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    console.log('✅ icon.png erstellt (512x512)');

    // 2. PNG → ICO (für Windows)
    const icoBuffer = await pngToIco([pngPath]);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✅ icon.ico erstellt');

    console.log('\n🎉 Icons erfolgreich generiert!');
    console.log('Jetzt kannst du mit `npm run build` die .exe erstellen.\n');

  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('📦 Fehlende Pakete – werden installiert…');
      const { execSync } = require('child_process');
      execSync('npm install sharp png-to-ico --save-dev', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✅ Pakete installiert. Skript erneut ausführen: node scripts/generate-icons.js');
    } else {
      console.error('❌ Fehler:', err.message);
    }
  }
}

generateIcons();
