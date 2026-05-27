# castlabs WideVine Setup (einmalig als Entwickler)

## Was Nutzer sehen: Nichts – WideVine funktioniert einfach.
## Was du einmalig tun musst:

### Schritt 1: castlabs-Konto erstellen
1. Gehe zu: https://castlabs.com/free-demos/widevine-electron/
2. Registriere dich mit deiner E-Mail (kostenlos für Indie-Entwickler)
3. Du erhältst eine E-Mail mit Bestätigung

### Schritt 2: EVS-Tool lokal ausführen (einmalig)
```bash
# Im OmniSight-Ordner:
npx @castlabs/electron-builder-tools@latest castlabs-evs register
```
Das erstellt eine `.castlabs` Konfigurationsdatei im Home-Verzeichnis.

### Schritt 3: GitHub Secret setzen
Das EVS-Tool gibt dir nach der Registrierung einen Token.
Diesen Token als GitHub Secret hinzufügen:
- GitHub Repository → Settings → Secrets → New repository secret
- Name: `CASTLABS_EVS_TOKEN`
- Value: (der Token vom EVS-Tool)

### Schritt 4: build.yml anpassen (bereits vorbereitet)
```yaml
- name: castlabs EVS
  run: npx @castlabs/electron-builder-tools@latest castlabs-evs check
  env:
    CASTLABS_EVS_TOKEN: ${{ secrets.CASTLABS_EVS_TOKEN }}
```

### Ergebnis
Der nächste Build verwendet automatisch das castlabs-signierte Electron-Binary
mit offiziellem WideVine. Alle Nutzer bekommen die signierte EXE ohne
irgendetwas tun zu müssen.

### Demo-Modus (ohne Registrierung)
Mit `--skip` läuft EVS im Demo-Modus:
- WideVine auf Security Level 1 (SD/HD, kein 4K-DRM)
- Crunchyroll, Disney+, Netflix funktionieren auf normaler Qualität
- Für 4K: Security Level 3 = Hardware-TPM nötig (die meisten PCs haben das nicht)
