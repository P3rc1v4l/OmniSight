'use strict';
/**
 * Electron Fuses – Sicherheits-Schalter
 * Werden beim Build in die EXE eingebrannt.
 */
const path = require('path');
const fs = require('fs');

module.exports = async ({ appOutDir, packager }) => {
  // Korrekte Binary-Pfad-Ermittlung
  const platform = packager.platform.nodeName;
  let exeName;
  if (platform === 'win32') {
    exeName = packager.appInfo.productFilename + '.exe';
  } else if (platform === 'darwin') {
    exeName = packager.appInfo.productFilename + '.app';
  } else {
    exeName = packager.appInfo.productFilename;
  }

  const electronBinaryPath = path.join(appOutDir, exeName);

  // Pruefen ob Datei existiert bevor wir Fuses setzen
  if (!fs.existsSync(electronBinaryPath)) {
    console.warn('[Fuses] Binary nicht gefunden:', electronBinaryPath);
    return;
  }

  try {
    const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
    await flipFuses(electronBinaryPath, {
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    });
    console.log('[Fuses] Erfolgreich gesetzt');
  } catch (e) {
    // Fuses sind optional – Build soll nicht fehlschlagen
    console.warn('[Fuses] Konnten nicht gesetzt werden:', e.message);
  }
};
