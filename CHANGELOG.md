## v3.1.0 — 2025

### 🆕 Neue Features
- **⚡ Anbieter-Kategorien**: Filtere Anbieter nach Kategorie – Streaming, Anime, Live & Sport, Musik, Kostenlos, Eigene. Filter-Leiste erscheint über dem Grid. Per Rechtsklick auf eine Karte kann die Kategorie individuell geändert werden.
- **📤 Vollständiges Backup/Restore**: Alle Einstellungen, Profile und Watchlist als eine JSON-Datei exportieren und importieren (Einstellungen → Mehr → Vollständiges Backup)
- **⚠️ Crash-Log Benachrichtigung**: Wenn OmniSight beim letzten Start abgestürzt ist, erscheint beim nächsten Start ein dezenter Toast mit Crash-Details-Link
- **🎬 Animierter Splashscreen**: Neues Splash-Fenster mit Logo-Animation, Puls-Ringen, Ladebalken und Fade-In-Effekten
- **🏷 Kategorie im Kontextmenü**: Rechtsklick auf Anbieter-Karte → Kategorie ändern

### 🔒 Sicherheit
- **Electron ^34** (Upgrade von ^33) – mehrere V8 und Chromium Security-Patches
- **Self-Signed Code-Signing**: `scripts/create-cert.ps1` führt durch die Zertifikat-Erstellung. Danach verschwindet die Windows-SmartScreen-Warnung. Secrets `CSC_LINK` + `CSC_KEY_PASSWORD` in GitHub eintragen.
- Workflow: CSC_LINK und CSC_KEY_PASSWORD als optionale Signing-Secrets eingebunden

### ⚖️ Lizenz
- Kontakt-E-Mail in LICENSE aktualisiert: zzickyzzacky@gmail.com

## v3.0.3 — 2025

### 🐛 Bugfixes
- **Einstellungen-Buttons funktionieren wieder**: `openSettings()` nutzte alten Seitenleisten-Stil statt Modal – korrigiert
- **Settings-Tabs funktionieren wieder**: doppelte Event-Handler und falsche Selektoren entfernt
- **Overlay-Klick**: Einstellungen schließen nur noch bei Klick außerhalb des Modals

### ⚖️ Lizenz
- **MIT-Lizenz entfernt** → **Proprietäre Nutzungslizenz**: Weitergabe, Veröffentlichung und kommerzielle Nutzung ohne Genehmigung verboten. Testpersonen dürfen die EXE nutzen aber nicht weiterverbreiten.

### 🔧 Verbesserungen
- **Einstellungs-Modal deutlich größer**: 1100×720px (statt 820×560px), breitere Sidebar, flexibles Grid mit mehr Spalten
- **Build-Matrix**: Workflow unterstützt jetzt Windows, Mac und Linux (Mac/Linux nur bei Tags oder manueller Auswahl)
- **Werbeblocker-Statistik** in Statistiken: zeigt geblockte Werbeanfragen, gestreamte Anbieter und Watchlist-Größe als Kacheln
- **Stream-Erinnerung**: Toast wenn ein Anbieter mehr als 3 Tage nicht genutzt wurde
- **Favoriten eigene Reihenfolge**: Favoriten können unabhängig von der allgemeinen Sortierung per Drag umgeordnet werden

## v3.0.2 — 2025

### 🐛 Bugfix
- **`npm ci` → `npm install`**: `package-lock.json` wird nicht eingecheckt → GitHub Actions nutzte `npm ci` was eine Lockfile voraussetzt → auf `npm install` zurückgewechselt, npm-cache entfernt

### 🔒 Sicherheit
- **ASAR-Verschlüsselung** aktiviert: App-Ressourcen (HTML, JS, CSS) sind als verschlüsseltes ASAR-Archiv verpackt – Quellcode nicht mehr direkt lesbar
- **Crash-Reporter** eingebaut: Abstürze werden in `%AppData%/OmniSight/logs/crash.log` gespeichert; beim nächsten Start wird der letzte Crash im Entwickler-Log angezeigt
- **Auto-Update vollständig aktiviert**: `autoInstallOnAppQuit=true`, Download-Fortschritt wird in der App angezeigt, "Jetzt installieren"-Button nach Download
- IPC `download-update` und `get-watchlist-releases` abgesichert

### 🆕 Neue Features
- **⚡ Quick-Launcher (Taste N)**: Taste `N` öffnet einen Schnell-Starter mit allen Anbietern; weiterer Buchstabe filtert sofort; Zahlen 1–6 öffnen den Anbieter direkt
- **Watchlist-Release-Benachrichtigung**: Beim App-Start wird geprüft ob ein Film/Serie aus der Watchlist heute erscheint – Push-Notification wenn ja
- **Update-Banner**: Wenn ein Update verfügbar ist, erscheint ein dezenter Banner oben mit Download-Fortschritt und Installieren-Button

## v3.0.1 — 2025

### 🐛 Bugfix
- **GitHub Actions Storage-Fehler behoben**: Artifacts haben jetzt `retention-days: 1` (automatisch nach 24h gelöscht) und es wird nur noch die `.exe` hochgeladen (keine `.blockmap`)
- Workflow bereinigt: alte Artifacts werden vor jedem neuen Build automatisch gelöscht

### 🔒 Sicherheit
- **Electron Fuses** eingebaut: `RunAsNode`, `EnableNodeOptionsEnvironmentVariable`, `EnableNodeCliInspectArguments` deaktiviert – schützt vor Code-Injection auch wenn Angreifer Packager-Optionen manipulieren
- **IPC Input-Validation** in `main.js`: alle kritischen Handler validieren Typ, Länge und Format der Eingaben (profileId, providerId, seconds, list)
- **Electron-Versionswarnung** im Start-Log wenn Version < 28
- `npm ci` statt `npm install` im Workflow (deterministisch, keine Lock-Abweichungen)

### 🆕 Neue Features
- **Provider-Karte: „Zuletzt geöffnet"** – unter dem Tag-Text wird angezeigt wann der Anbieter zuletzt genutzt wurde (z.B. „⏱ vor 2h", „⏱ vor 3d")
- **Einstellungs-Suche** – Suchfeld oben in der Einstellungs-Sidebar filtert alle Einstellungskarten live nach Text
- **Drag & Drop zu Favoriten** – Karte über die „⭐ Favoriten"-Überschrift ziehen fügt sie sofort zu Favoriten hinzu

# OmniSight Changelog

## v3.0.0 — Major Release 2025

### 🐛 Kritische Bugfixes
- **Anbieter-Karten: Klick öffnet jetzt wieder den Anbieter** (mousedown/mouseup Fix)
- **Neuigkeiten & Upcoming: Typ-Wechsel (Filme/Serien/Anime) funktioniert jetzt** (falsche IDs news-switcher→news-type-switcher korrigiert)
- **Einstellungen-Button öffnet jetzt das Einstellungs-Fenster**
- **Profil-Button öffnet jetzt den Profil-Manager**
- **Benachrichtigungs-Glocke öffnet jetzt das Notification-Center**
- **Build-Fix**: `differentialPackage` komplett aus allen Ebenen entfernt

### 🆕 Neue Features
- **Profil-Manager komplett neu**: Eigenes Fenster, Profilbild, PIN (4 Ziffern), Profilwechsel mit PIN-Abfrage, Profil erstellen/löschen
- **Einstellungen als Modal-Fenster** statt Seitenleiste (6 Tabs: Design, Account, Uhr, Benachrichtigungen, Plugins, Mehr)
- **Onboarding Schritt 2: Grundeinstellungen** – Sprache, Akzentfarbe, Schriftart, Schriftgröße, Profilname und -bild direkt beim ersten Start
- **Karten-Editor: Live-Vorschau** – Änderungen werden sofort an der Vorschau-Karte angezeigt; beim Schließen ohne Speichern wird gefragt
- **Karten-Editor: modernes Design** mit Seitenleiste für Vorschau und Felder-Bereich
- **Eigenen Anbieter hinzufügen** als Button in der Übersicht-Topbar
- **Watchlist Rechtsklick-Menü** zum Ändern der Kategorie (Film/Serie/Anime)
- **Slideshow-Titel mittig oben** auf Neuigkeiten- und Upcoming-Seite
- **Upcoming: Nur zukünftige Titel** (keine vergangenen Erscheinungen)
- **Ausgeblendet-Fenster: Filter** nach Filme/Serien/Anime, Klick außerhalb schließt
- **Hinweis beim Drag & Drop** wenn A–Z aktiv: Sort-Button wird hervorgehoben
- **Benachrichtigungston** (Web Audio API) bei neuen Notifications, abschaltbar
- **VPN-Verwaltung**: Eigene VPNs eintragen, benennen, aktivieren/deaktivieren

### 🔧 Verbesserungen
- Karten: kein Hover-Zoom mehr (standardmäßig); optional aktivierbar in Einstellungen
- Favoriten-Button: rechts oben auf der Karte (nicht links unten)
- Karten-Editor: Stift-Button links oben unter Quality-Badge
- Karten-Editor: Kein Schließen-X (schließt per Speichern/Löschen/Zurücksetzen/Außen-Klick)
- Karten-Editor: Lösch-Button nur Mülltonne (kein Text), Zurücksetzen rechts oben
- Erste Karte in der Slideshow wird nicht mehr vom Sidebar-Balken verdeckt
- Slideshow-Poster füllen die Karte vollständig (kein Leerraum)
- Backdrop im Detail-Popup wird nicht mehr abgeschnitten
- Statistiken: Wochentags-Ansicht optisch überarbeitet (animierte Balken, Farbgebung)
- Statistiken: 5 neue Achievements (h250, h1000h, daily30, newprov, prov20)
- CR-Kalender: mehr Quellen (Trending + Upcoming kombiniert), modernes Raster-Layout
- Einstellungen schließen → Toast "Gespeichert"
- Sortierung mit Hinweis-Toast wenn Karte gezogen wird
- Sprache ändern: alle Texte sofort übersetzt (inkl. Einstellungs-Navigation)
- Partikel-Formen einzeln an/abwählbar
- Karten-Hover-Zoom, Schatten und Animationen einzeln in Einstellungen steuerbar

## v2.2.0
- AbortController für TMDB-Suche, allowpopups nur für multiTab-Provider
- TMDB-Cache (5min), Profil-Avatar in Titelleiste, Keyboard-Navigation Onboarding
- Race-Condition-Schutz für Settings/Profiles

## v2.1.0
- Onboarding-Screen, Watchlist-Sortierung, Zuletzt geöffnet, TMDB ab 2 Zeichen
- Session-Indikator, Shortcuts-Modal, Watchlist-Duplikat-Toast

## v2.0.0
- Kompletter Umbau: Benachrichtigungs-Center, neues Profil-System, CR Kalender u.v.m.

## v1.2.0
- Initiale Version
