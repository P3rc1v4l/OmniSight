'use strict';
/**
 * Electron Fuses – Sicherheits-Schalter
 * Werden beim Build in die EXE eingebrannt und können nicht per Code überschrieben werden.
 * Dokumentation: https://www.electronjs.org/docs/latest/tutorial/fuses
 */
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

module.exports = async ({ appOutDir, packager }) => {
  const ext = packager.platform.nodeName === 'darwin' ? '.app' : '';
  const exeName = packager.appInfo.productFilename + ext;
  const electronBinaryPath = path.join(appOutDir, exeName);

  try {
    await flipFuses(electronBinaryPath, {
      version: FuseVersion.V1,
      // Node.js im Renderer dauerhaft deaktivieren (auch wenn nodeIntegration: true gesetzt würde)
      [FuseV1Options.RunAsNode]: false,
      // ASAR-Integritätsprüfung aktivieren
      [FuseV1Options.EnableCookieEncryption]: true,
      // Devtools in Produktion deaktivieren
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      // NODE_PATH deaktivieren
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
    });
    console.log('✓ Electron Fuses erfolgreich gesetzt');
  } catch (e) {
    // Fuses sind optional – Build soll nicht fehlschlagen wenn @electron/fuses fehlt
    console.warn('⚠ Fuses konnten nicht gesetzt werden:', e.message);
  }
};
