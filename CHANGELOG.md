## v3.1.13 -- 2026-05-25

### Aufräumen: Duplikate entfernt
- app.js: 6 doppelte Funktionen entfernt (setupTitlebar, showOnboarding,
  setupOnboarding, closeOnboarding, setupShortcutsModal, rebuildPluginDomains)
- fixes.js: zweite buildSessionList Definition entfernt
- Token-Eingabe-Dialog entfernt (war fehlerhaft und nicht nötig)
- preload.js: getGhToken/setGhToken entfernt

### Auto-Update: Vereinfacht
- Kein Token mehr nötig -- funktioniert über öffentliche GitHub Releases
- 404/ENOENT Fehler werden als 'kein Update' behandelt, nicht als Fehler
- Update-Check-Button zeigt nach 8s 'Aktuellste Version' wenn kein Event kommt

### Miniplayer (PIP): Kein Reload mehr
- restoreFromPip und moveToPip verschoben den Webview nur im DOM
  (parentNode.removeChild + appendChild) statt ihn neu zu erstellen
- Stream läuft nach PIP-Umschaltung nahtlos weiter

### Sessions: Zuverlässigere Erkennung
- Beim Öffnen des Account-Tabs: erst refreshSessionsNow, dann 800ms warten,
  dann getAllSessions -- gibt Cookies Zeit um gelesen zu werden
- Keine Checkboxen mehr nach Session-Update

## v3.1.12 -- 2026-05-25

### Bugfixes
- ReferenceError 'newInput is not defined': Alter patchSearch-Block (848 Zeilen)
  existierte noch in fixes.js parallel zu setupSearchFinal -- vollständig entfernt.
  Jetzt nur noch ein einziger Search-Handler aktiv.

### WideVine CDM: Verbessert
- DLL-Suche: prueft beide möglichen Pfade
- Chromium-Switch 'enable-widevine-cdm' explizit gesetzt
- enable-features um WidevineCdm und EncryptedMediaExtensions erweitert
- Version auf '4.10.2662.3' (Chrome 124 kompatibel) aktualisiert
- Konsolen-Log zeigt wo DLL gefunden wurde

### Auto-Update: Neuer Weg (empfohlen)
- OMNISIGHT_UPDATE_TOKEN: GH_TOKEN wird beim Build als Umgebungsvariable
  in die App eingebettet -- kein manuelles Token-Eingeben mehr nötig
- Workflow: OMNISIGHT_UPDATE_TOKEN = secrets.GH_TOKEN gesetzt
- Robustere Feed-Konfiguration: versucht erst ohne Token, dann mit
- Fallback: Token-Eingabe in Einstellungen -> Mehr weiterhin möglich

## v3.1.11 -- 2026-05-25

### Auto-Update: Grundlegend repariert
- setupWidevineDir() wurde nie aufgerufen (nur definiert) -- jetzt in
  app.whenReady() als erster Schritt
- Auto-Update fuer private Repos: setFeedURL benoetigt 'private:true' und
  'token' -- beides jetzt korrekt gesetzt
- GH_TOKEN wird aus electron-store geladen (nicht nur aus process.env)
- Neuer IPC-Handler 'set-gh-token' / 'get-gh-token': Nutzer kann den Token
  einmalig in Einstellungen -> Mehr -> Updates eingeben
- Update-Check-Button: zeigt Token-Eingabe-Dialog wenn kein Token vorhanden
- Timeout von 8s verhindert dauerhaftes 'Prüfe...'

### WideVine CDM: Ordner wird jetzt IMMER angelegt
- Beim App-Start (app.whenReady) wird setupWidevineDir() aufgerufen
- Ordner-Pfad: %AppData%\omnisight\WidevineCdm\_platform_specific\win_x64\
- get-widevine-status legt den Ordner an falls er fehlt
- WideVine-Status-Anzeige in Einstellungen -> Mehr zeigt den exakten Pfad
  und einen 'Ordner oeffnen'-Button der jetzt korrekt funktioniert

### Version
- Korrekte Erhoehung auf 3.1.11 (nach 3.1.10)

## v3.1.10 -- 2026-05-25

### Kritische Bugfixes
- TypeError 'Cannot read properties of null (reading contains)': Suche-Mousedown
  handler greift auf null zu wenn Suchfeld neu geklont wird -- null-safe gemacht
- Profil loeschen funktioniert wieder: Button hatte alten Handler der ueberschrieben
  wurde -- neu verdrahtet mit PIN-Abfrage wenn Profil einen PIN hat
- Profil-Editor Aussen-Klick: schliesst ohne Speichern (showToastMsg bestaetigt)

### Twitch / YouTube
- Chrome-UA ohne 'Electron'-String wird jetzt fuer ALLE Sessions gesetzt
  (vorher nur im openProviderAtUrl Webview-Attribut, jetzt auch in der Session)
  Behebt: 'Browser wird nicht unterstuetzt'-Meldung auf Twitch
- Tabs optisch ueberarbeitet: aktiver Tab mit Akzentfarbe, Hover-Effekte,
  Mute-Button im Tab, '+ Neuer Tab'-Button rechts neben den Tabs

### Neue Features
- Hintergrund-Streams: Wenn Twitch/YouTube verlassen, erscheint Sidebar-Button
  'Im Hintergrund (N)' -- zeigt Panel mit Mute/Unmute/Restore/Stop pro Stream
- Ladetime-Meldung: 'Laedt sehr lange' erscheint jetzt in der App als
  Push-Benachrichtigung statt als Windows-Systemmeldung

### Karten
- Quality-Badge: Breite passt sich dem Text an (kein langer schwarzer Balken mehr)
- Favoriten-Lesezeichen: gelb wenn Favorit, kein Hintergrund, nur beim Hovern
- Edit-Button (Stift): unten rechts auf der Karte beim Hovern

### Statistiken
- Erreichte Achievements haben volle Sichtbarkeit (opacity 1, kein Filter)
- Noch nicht erreichte sind dezent ausgegraut (opacity 0.38)

## v3.1.10 -- 2026-05-24

### Version
- Erste zweistellige Patch-Nummer (3.1.10 statt 3.2.0, da nur Fixes)

### Deinstallation mit Daten-Dialog
- Beim Deinstallieren von OmniSight erscheint jetzt ein echter Windows-Dialog:
  "Moechtest du alle OmniSight-Daten loeschen?" mit Ja/Nein
- Ja: loescht %AppData%\omnisight (Profile, Watchlist, Sessions, Einstellungen)
- Nein: Daten bleiben erhalten fuer spaetere Neuinstallation
- Implementiert als NSIS-Custom-Script (build/installer.nsh)

## v3.1.8 -- 2026-05-24

### Sicherheit (Vorschlaege 1-3, 5-6)
- CSP (Content-Security-Policy) fuer app-eigene Seiten: verhindert dass
  injizierter Code externe Ressourcen laden kann
- IPC Rate-Limiting: set-settings und andere kritische Handler werden bei
  Ueberflutung (z.B. durch kompromittierten Webview) gedrosselt
- PIN-Hash: PINs werden als SHA-256-Hash gespeichert statt als Klartext
- Webview Berechtigungen: Kamera/Mikrofon-Zugriffe durch Streaming-Seiten
  werden kontrolliert; Streaming-DRM-Anfragen bleiben erlaubt
- Session-Ablauf: Sessions die 30+ Tage nicht genutzt wurden werden bereinigt
- Startup-Zeitmessung: Ladezeit wird in der Browser-Konsole protokolliert

### Neue Features
- WideVine CDM Installationsanleitung: Schritt-fuer-Schritt Anleitung in
  Einstellungen -> Mehr -> WideVine CDM -> 'Installationsanleitung oeffnen'
  mit Ordner-Oeffnen-Buttons fuer Chrome, Edge und Ziel-Ordner
- icon.svg entfernt (wurde nicht verwendet)

## v3.1.7 -- 2026-05-24

### Architektur-Aenderung
- Alle fehlenden Funktionen und Fixes in neue Datei fixes.js ausgelagert
  (wird nach app.js geladen). Das verhindert dass Patches kuenftige Patches
  brechen und macht Debugging einfacher.

### Kritische Bugfixes
- loadCrCalendarView, renderNotifications, buildSessionList, buildCategoryFilterBar
  existierten nicht mehr nach mehreren Patch-Runden -- alle neu implementiert
- Zuletzt geoeffnet auf der Uebersicht entfernt (Punkt 5)
- + Anbieter Button funktioniert wieder (Punkt 5)
- Suche: nur relevante Ergebnisse, fremdsprachige Titel gefiltert (Punkt 6)
- Suche: schliesst bei Aussen-Klick, startet neu wenn Fokus mit Text (Punkt 6)
- Suchverlauf mit Cache-Vorschau: Klick auf alten Begriff laedt direkt Ergebnisse (Punkt 4)
- Detail-Popup: Anbieter nebeneinander, Smart-Open waehlt angemeldeten Anbieter (Punkt 6)
- Slideshow-Karten: kein Checkbox-Overlay, Buttons unten (Punkt 7+9)
- Fremdsprachige Titel in Neuigkeiten/Upcoming ausgefiltert (Punkt 7)

### Neue Features
- Einstellungs-Uebersicht als erste Seite mit Kacheln (Punkt 20)
- Profil-Editor: PIN-Eingabe als Numpad-Dialog, Bild-Upload, Aussen-Klick schliesst ohne Speichern (Punkt 10)
- Account-Tab: Sessions sofort geladen, einzelner Abmelden-Button beim Hover (Punkt 13)
- Uhr: digital/analog Wechsel ueber Kontextmenue funktioniert (Punkt 15)
- Achievements: 8 neue hinzugefuegt (Watchlist-Fan, Forscher, etc.) (Punkt 11)
- Onboarding: Sprache live wechseln, Buttons mit Abkuerzung ueber Name (Punkt 21)
- Einstellungen: Partikel-Formen beeinflussen Sprache nicht mehr (Punkt 12)
- Toggle-Regler zeigen Akzentfarbe wenn aktiv (Punkt 12)
- Achievement-Benachrichtigungen nur In-App, nicht als Windows-Toast (Punkt 16)
- Update-Pruefung: zeigt nach 8s 'Aktuellste Version' statt Pruefe... (Punkt 18)
- WideVine CDM: Download-Anleitung verlinkt (Punkt 19)
- Plugins: Install/Deinstall-Buttons in Akzent-/Rot-Farbe (Punkt 17)

## v3.1.6 -- 2026-05-24

### KRITISCHER BUGFIX
- preload.js war syntaktisch kaputt: durch einen frueheren Patch wurden zwei Zeilen
  zusammengefuegt ('isFullscreen: ()=>downloadUpdate: ...'), was einen JavaScript-
  SyntaxError beim Laden warf. Dadurch stand window.electronAPI NICHT zur Verfuegung
  und init() konnte nicht einmal starten. Alle Buttons und Anbieter fehlten deshalb.
  preload.js wurde komplett neu und korrekt geschrieben.

### Neue Features (Stabilitaet)
- Globaler Fehler-Handler: Unbehandelte JavaScript-Fehler zeigen jetzt einen
  roten Toast unten in der App statt lautlos zu scheitern
- Healthcheck nach Start: 800ms nach init() wird geprueft ob das Provider-Grid
  befuellt ist. Falls nicht (wegen eines unbehandelten Fehlers), wird buildProviderGrid()
  automatisch erneut aufgerufen

## v3.1.5 -- 2026-05-24

### Bugfixes
- Anbieter-Grid wieder sichtbar: buildWatchlist() Aufruf in wl-cat-btn war falsch (buildWatchlistSorted fehlt), Navigation crashte beim Klick auf Gemerkt
- Doppelter btn-restore-providers Handler entfernt (war in setupSettingsPanel UND als freistehender Code)
- window.buildWatchlist Alias entfernt (verursachte Verwirrung und indirekten Fehler)

### Neue Features
- Widevine Auto-Check: Beim App-Start wird geprueft ob WideVine CDM installiert ist. Falls nicht, erscheint ein dezentes Banner mit Hinweis (nur einmal pro Session)
- Watchlist-Erinnerungs-Datum: Rechtsklick auf Karte -> Erinnerung setzen. Am gewaehlten Tag erscheint beim Start eine Benachrichtigung. Symbol auf Karte zeigt aktive Erinnerung.

## v3.1.5 — 2026-05-24

### 🐛 Bugfixes
- **Icon-Fehler behoben**: Das ICO hatte keinen 256x256-Eintrag → electron-builder hat abgebrochen. Neues ICO mit allen Groessen (16/32/48/64/128/256px) und transparentem Hintergrund.
- **Fuses-Fehler behoben**: `scripts/fuses.js` suchte nach falscher Datei (ohne `.exe`-Erweiterung auf Windows) → Pfad-Ermittlung korrigiert.

### 🎨 Design
- **Neues Logo**: Transparenter Hintergrund, keine schwarze Box mehr in Taskleiste und Splash.

### 🔧 Verbesserungen
- **Build startet nicht mehr bei jedem Commit**: Workflow laeuft nur noch bei manuellem Start (Actions → Run workflow) oder bei Tag-Push. So koennen alle Dateien in Ruhe hochgeladen werden.
- Icons werden nicht mehr bei jedem Build neu generiert (nur wenn Logo geaendert wird).

### 🆕 Neue Features
- **Watchlist-Erinnerungs-Datum**: Rechtsklick auf Watchlist-Karte → Erinnerung setzen (JJJJ-MM-TT). An diesem Tag erscheint beim App-Start eine Benachrichtigung. Symbol auf der Karte zeigt aktive Erinnerung.

## v3.1.4 — 2026-05-24

### 🐛 Kritische Bugfixes
- **Navigation funktioniert wieder**: IIFE `setupMissingHandlers()` lief synchron vor dem DOM und hat alle Handler zerstoert. Komplett entfernt und direkt in `setupNavigation()` integriert.
- **Anbieter werden wieder angezeigt**: `buildWatchlist()` existierte nicht mehr (umbenannt zu `buildWatchlistSorted()`) — alle Aufrufe korrigiert.
- **Einstellungen oeffnen/schliessen**: `openSettings()` nutzte alten Sidebar-Stil — auf Modal umgestellt.
- **Profil-Switcher und Benachrichtigungs-Glocke**: Handler jetzt zuverlaessig in `setupNavigation()` registriert.

### 🔒 Sicherheit
- **Dependabot aktiviert**: Wochentliche automatische PRs fuer veraltete npm-Pakete und GitHub Actions (Electron-Major-Updates ausgenommen).

### 🔧 Verbesserungen
- **Icons nicht mehr bei jedem Build**: `generate-icons.js` aus dem normalen Workflow-Build entfernt — nur noch manuell ausfuehren wenn sich das Logo aendert.
- **LICENSE**: Umlaute entfernt, jetzt vollstaendig auf Englisch — wird in allen Systemen korrekt angezeigt.

### 🆕 Neue Features
- **Drag & Drop in Gruppen**: Anbieter-Karten koennen direkt auf einen Gruppen-Button in der Filter-Leiste gezogen werden — Karte wird sofort der Gruppe zugewiesen.

## v3.1.3 — 2026-05-23

### 🐛 Bugfix
- **Workflow-Fehler behoben**: `${{ !secrets.CSC_LINK }}` und `${{ secrets.CSC_LINK != '' }}` sind keine gültige GitHub Actions YAML-Syntax. Lösung: ein einziger Build-Step mit `CSC_IDENTITY_AUTO_DISCOVERY: false` – das verhindert den `WIN_CSC_LINK`-Fehler zuverlässig ohne Conditionals.

### 🆕 Neue Features
- **📁 Eigene Anbieter-Gruppen**: Gruppen selbst erstellen, benennen und Anbieter zuweisen. Erscheinen als Filter-Buttons neben den Standard-Kategorien (⚙ Gruppen-Button in der Filter-Leiste)
- **⭐ F-Taste: Schnell-Favorit**: Im Tastatur-Navigations-Modus (Pfeiltasten) favorisiert/defavorisiert `F` die fokussierte Karte sofort
- **📌 Upcoming: Watchlist zuerst**: Filme und Serien aus der Watchlist erscheinen in der Upcoming-Slideshow automatisch ganz vorne
- **📋 Automatischer Release-Draft**: Nach jedem erfolgreichen Build wird automatisch ein Draft-Release auf GitHub erstellt – du musst nur noch auf "Publish" klicken

### 🔧 Verbesserungen
- Shortcuts-Modal: F-Taste dokumentiert
- `npm run shrinkwrap` Script für deterministischeren Build (optional)

## v3.1.2 — 2026-05-23

### 🐛 Bugfixes
- **Build-Fehler behoben**: `WIN_CSC_LINK` wurde auch bei leerem `CSC_LINK`-Secret gesetzt und hat den Build abgebrochen. Lösung: zwei separate Build-Steps (mit/ohne Signing), `CSC_IDENTITY_AUTO_DISCOVERY: false` wenn kein Zertifikat vorhanden

### 🔒 Sicherheit
- **Delta-Updates aktiviert**: `differentialPackage: true` in NSIS – Nutzer laden bei Updates nur geänderte Blöcke herunter (typisch 10–30 MB statt 120 MB)
- **Zertifikat-Ablauf-Erinnerung**: App prüft beim Start ob das Code-Signing-Zertifikat in den nächsten 30 Tagen abläuft und zeigt rechtzeitig eine Benachrichtigung
- Ablaufdatum im `package.json` als `certExpiry` hinterlegt

### 🆕 Neue Features
- **↑↓←→ Keyboard-Navigation im Provider-Grid**: Pfeiltasten navigieren zwischen Anbieter-Karten, Enter öffnet den Anbieter
- **🎬 Onboarding: Hell/Dunkel-Modus wählen**: Dark/Light-Toggle direkt im Onboarding Schritt 2
- **✨ Karten-Badge „NEU"**: Wenn ein Anbieter heute Watchlist-Inhalte veröffentlicht, erscheint ein NEU-Badge auf der Karte
- **🔖 Automatisches Versions-Bump Script**: `node scripts/bump-version.js [patch|minor|major]` erhöht Version, erstellt Tag und pusht alles automatisch

### 🔧 Verbesserungen
- README.md: Anleitung für Versions-Bump ergänzt
- Shortcuts-Modal: Pfeiltasten-Navigation dokumentiert

## v3.1.1 — 2025

### 🐛 Bugfixes
- **Build-Fehler behoben**: Leere `CSC_LINK`-Umgebungsvariable hat den Build abgebrochen – jetzt wird Code-Signing übersprungen wenn kein Zertifikat gesetzt ist (`forceCodeSigning: false`)
- **README.md**: "Aletheos Stream" durch "OmniSight" ersetzt, vollständig neu geschrieben
- **Mac/Linux Build entfernt**: Nur Windows-Build aktiv bis diese Plattformen getestet werden können

### 🆕 Neue Features
- **⚡ Quick-Launcher: Fuzzy-Suche**: „nfl" findet „Netflix", „prim" findet „Prime Video" – nicht mehr nur Anfangsbuchstabe
- **📊 Statistiken teilen**: „Teilen (Kopieren)"-Button kopiert Statistik-Zusammenfassung in die Zwischenablage
- **📺 Onboarding Schritt 4: Anbieter-Auswahl**: Beim ersten Start können Anbieter angehakt werden – nicht gewählte werden ausgeblendet

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
