# App-Icons

Dieser Ordner muss die App-Icons enthalten, die in `tauri.conf.json` referenziert
werden (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`).

Die werden **automatisch** aus einem einzigen Quellbild erzeugt. Lege ein
quadratisches PNG (mind. 1024×1024 px) z.B. als `app-icon.png` ins Projekt-Root
und führe aus:

```bash
npm run tauri icon ./app-icon.png
```

Danach liegen alle benötigten Icon-Dateien hier und der Build funktioniert.
Solange noch keine Icons vorhanden sind, schlägt `npm run tauri:build` mit einer
Icon-Fehlermeldung fehl – `npm run tauri:dev` läuft aber trotzdem.
