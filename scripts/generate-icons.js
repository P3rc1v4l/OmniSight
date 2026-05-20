/**
 * OmniSight Icon Generator - v2
 * Erzeugt icon.ico mit transparentem Hintergrund aus icon.png
 * Installiert fehlende Abhängigkeiten automatisch und läuft dann durch.
 */
const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const src  = path.join(root, 'src', 'assets', 'icon.png');
const out  = path.join(root, 'src', 'assets', 'icon.ico');

function tryRequire(mod) {
  try { return require(mod); } catch { return null; }
}

async function run() {
  // Deps installieren falls nötig
  let sharp    = tryRequire('sharp');
  let pngToIco = tryRequire('png-to-ico');

  if (!sharp || !pngToIco) {
    console.log('Installiere sharp und png-to-ico…');
    execSync('npm install sharp png-to-ico --save-dev', { stdio: 'inherit', cwd: root });
    // Nach Installation direkt laden
    sharp    = require('sharp');
    pngToIco = require('png-to-ico');
  }

  if (!fs.existsSync(src)) {
    console.error('icon.png nicht gefunden:', src);
    process.exit(1);
  }

  const sizes = [16, 32, 48, 64, 128, 256];
  console.log('Generiere Icon-Größen:', sizes.join(', '));

  const bufs = await Promise.all(
    sizes.map(s =>
      sharp(src)
        .resize(s, s, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } })
        .png()
        .toBuffer()
    )
  );

  const ico = await pngToIco(bufs);
  fs.writeFileSync(out, ico);
  console.log('✅ icon.ico erfolgreich erstellt:', out);
}

run().catch(e => { console.error('❌ Fehler:', e.message); process.exit(1); });
