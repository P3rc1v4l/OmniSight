/**
 * OmniSight Icon Generator v3
 * Benötigt: sharp, png-to-ico (beide in package.json devDependencies)
 * Ausführen: node scripts/generate-icons.js
 */
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const pngToIco = require('png-to-ico');

const root = path.join(__dirname, '..');
const src  = path.join(root, 'src', 'assets', 'icon.png');
const out  = path.join(root, 'src', 'assets', 'icon.ico');

async function run() {
  if (!fs.existsSync(src)) {
    console.error('Fehler: icon.png nicht gefunden unter', src);
    process.exit(1);
  }

  const sizes = [16, 32, 48, 64, 128, 256];
  console.log('Generiere ICO mit Größen:', sizes.join(', '));

  const buffers = await Promise.all(
    sizes.map(s =>
      sharp(src)
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  const icoBuffer = await pngToIco(buffers);
  fs.writeFileSync(out, icoBuffer);
  console.log('✅ icon.ico erfolgreich erstellt:', out);
}

run().catch(err => {
  console.error('❌ Fehler beim Generieren:', err.message);
  process.exit(1);
});
