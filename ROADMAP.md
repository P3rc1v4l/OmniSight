# OmniHub – Roadmap

Diese Datei hält den geplanten Funktionsumfang fest und wird **bei jeder Version automatisch aktualisiert**.
Stand: v0.39.0

Legende: ✅ erledigt · 🟡 teilweise · ⏳ geplant · 💡 in Klärung (Machbarkeit)

---

## 🆕 Neue Vorschläge (Stand v0.36.0)

### Erledigt in dieser Version
- ✅ **Anzahl je Kategorie** als Zahl am Filter-Chip.
- ✅ **„Überrasch mich"** – zufälliger Anbieter (🎲 in der Übersicht).
- ✅ **Zifferntasten 1–9** starten Favorit (sonst sichtbaren Anbieter) Nr. n direkt.
- ✅ **Sammelaktionen** für Hintergrund-Streams: „Alle stumm/laut" + „Alle schließen" (ab 2 Streams).
- ✅ **Tastenkürzel-Übersicht** zusätzlich per **?** (neben F1); Liste um 1–9 ergänzt.

### Neue Ideen
**Funktionen**
- ✅ **Lautstärke je Hintergrund-Stream** (v0.39): Regler in der Sidebar (Rust-eval setzt video.volume).
- 💡 **Hintergrund-Streams nach Neustart wiederherstellen** (optional).
- 💡 **Timer je Hintergrund-Stream** (einzelnen Stream nach X Min schließen).
- 💡 **Zwischenablage-Erkennung:** Liegt eine Stream-/Video-URL in der Zwischenablage, Schnellvorschlag zum Öffnen.

**UI**
- 💡 **Spitzname je Hintergrund-Stream** (Klick auf den Namen zum Umbenennen, z.B. Kanalname).
- 💡 **Streamanzahl im Fenstertitel / Tray-Icon** anzeigen.
- 💡 Hintergrund-Bereich merkt seinen **Ein-/Ausklapp-Zustand**.

**Verbesserungen / UX**
- 💡 **Sicherheitsabfrage** vor „Alle schließen".
- 💡 **Auto-Reconnect:** Bei Netzwerkfehler im Stream automatisch neu laden.
- 💡 Konfig-**Migration** beim Update (Versionierung der gespeicherten Daten).

**Sicherheit**
- 💡 **Auto-Lock nach Inaktivität** (PIN/Sperrbildschirm).
- 💡 **Eltern-Bericht:** Nutzungszeit pro (Kinder-)Profil.

---

## 🆕 Neue Vorschläge (Stand v0.35.0)

### Erledigt in dieser Version
- ✅ **Hintergrund-Streams in der Sidebar** statt schwebender Leiste – ausklappbar, mit Anzahl, einzeln stummschalten/▶/✕. Bewusst in der Sidebar, weil diese nie vom eingebetteten Video überdeckt wird (anders als ein schwebendes Overlay).

### Funktionen (bauen auf der neuen Mehr-Webview-Technik auf)
- ⏳ **Split-/Multi-View:** 2–4 Streams **gleichzeitig sichtbar** in einem Raster (z.B. Sport/Twitch). Nutzt dieselbe Mehr-Webview-Basis wie die Hintergrund-Streams.
- 💡 **Audio-Only-Modus** je (Hintergrund-)Stream: nur Ton, Video pausiert/versteckt → spart Leistung. Passt ideal zur Hintergrund-Funktion.
- 🟡 Sammelaktionen Hintergrund: „Alle stumm/schließen" ✅ (v0.36); offen: Anzeige, welcher Stream gerade tönt.
- 💡 **Globale Suche** (Anbieter + TMDB) in einem Feld, Tastenkürzel Strg/Cmd+K.
- ✅ „Überrasch mich" (v0.36) – siehe oben.
- 🟡 Zifferntasten 1–9 ✅ (v0.36); offen: Anbieter-Gruppen/Ordner.

### UI
- 💡 **Audio-Indikator** am tönenden Hintergrund-Stream (kleine Pegel-Animation).
- 💡 **Sidebar ein-/ausklappbar** (schmaler Icon-Modus) für mehr Platz auf kleinen Bildschirmen.
- ✅ Anzahl je Kategorie am Filter-Chip (v0.36).
- 💡 Kompakter Modus + einstellbare Kartengröße; Akzentfarbe automatisch aus dem aktiven Anbieter-Logo.

### Verbesserungen / UX
- 💡 **Tastenkürzel-Übersicht** (?-Taste) + frei belegbare Shortcuts.
- ✅ **Crash-Recovery** (v0.37): „Neu laden"-Knopf immer in der Stream-Leiste; bei Fehler ein Hinweis-Panel mit „Erneut versuchen" / „In eigenem Fenster öffnen".
- 💡 Drag&Drop-Reihenfolge auch für die Hintergrund-Liste.

### Technisch
- 💡 **Webview-Warmhalten/Pooling** der zuletzt genutzten Anbieter für schnelleres Umschalten.
- 💡 **RAM-Schutz:** Hintergrund-Streams nach X Min Inaktivität automatisch entladen (mit Vorwarnung).
- ✅ **WebView2-Health-Check** (v0.37): Version in Einstellungen → Mehr; bei Fehler Warnung + Download-Link; Installer bringt WebView2 mit (downloadBootstrapper).
- 💡 Optionales lokales Debug-Log mit Rotation; Auto-Update mit Fortschrittsanzeige.

### Sicherheit
- ⏳ **App-Sperre beim Start** per PIN (optional, nicht nur beim Profilwechsel).
- 🟡 **Profiltrennung (experimentell, v0.38):** Opt-in unter Einstellungen → Konto. Eigenes WebView2-Datenverzeichnis je Profil (Neustart beim Wechsel). Wirkt nur, falls Tauri/WebView2 die Umgebungsvariable beachtet – im Build zu prüfen.
- 💡 **Privater Stream** (Inkognito-Webview ohne Verlauf/Cookies) für geteilte Geräte.
- 💡 PINs per OS-Schlüsselspeicher (keyring) verschlüsseln; Auto-Update-Signatur verifizieren.

---

## 🆕 Neue Vorschläge (Stand v0.24.0)

### Technisch
- ✅ **Echtes Vollbild für eingebettete Streams** (v0.25–0.27): OmniHub-Vollbild-Schalter, randlos, Leiste per Maus oben einblendbar, Esc beendet (globales Tastenkürzel).
- ✅ **Hardware-Beschleunigung (GPU) umschaltbar** (v0.25): Schalter unter Plugins, greift beim Neustart über WebView2-Startargument.
- 💡 Webview-Pooling: Anbieter-Webviews vorhalten statt neu erzeugen → schnelleres Umschalten.
- 💡 Datei-Logging mit Rotation (optional aktivierbar) zur leichteren Fehlersuche bei Builds.
- 💡 Update-Kanäle (stabil/beta) + Changelog direkt im Update-Banner.

### Sicherheit
- ⏳ Profil-PIN optional als **App-Sperre beim Start** (nicht nur beim Profilwechsel).
- 💡 PINs verschlüsselt ablegen (OS-Schlüsselspeicher/keyring) statt im Klartext.
- 💡 Strikte CSP **nur für die OmniHub-Oberfläche** (Anbieter-Webviews bleiben unbeschränkt).
- 💡 Signatur der Auto-Updates verifizieren + deutlicher Hinweis, falls der Schlüssel fehlt.

### Funktionen
- ✅ Sleep-Timer: **Schnellauswahl (30/60/90 Min)** (v0.34). Variante „bis Episodenende" entfällt – über die eingebetteten Anbieter-Webviews lässt sich ein Episodenende nicht zuverlässig erkennen.
- ✅ Zuletzt gewählten **Kategorie-Filter merken** (v0.34) – beim Start wieder aktiv (Rückfall auf „Alle", falls leer).
- 💡 Globale Suche über alle Anbieter **und** TMDB in einem Feld.
- 💡 „Weiterschauen" mit Fortschritts-/Position (soweit der Anbieter es zulässt).
- 💡 Konfiguration importieren/exportieren (Backup) + Profil-Umzug zwischen Geräten.
- 💡 Zifferntasten 1–9 als Schnellstart für Anbieter.

### UI
- ✅ **Einstellungen optisch überarbeitet** (v0.27–0.28): einheitliche Schalter/Slider, eigene Auswahl-Pfeile, Fokus-Ringe, Einblende-Animation, Akzent-Logo, größeres Fenster.
- 💡 Anzahl je Kategorie als kleine Zahl am Filter-Chip.
- 💡 Position des Sleep-Countdowns wählbar (Sidebar/oben/unten).
- 💡 Kompakter Modus + einstellbare Kartengröße.
- 💡 Akzentfarbe automatisch aus dem Logo des aktiven Anbieters.

---

## 🆕 Weitere Vorschläge (Stand v0.28.0)

### Funktionen
- ✅ **Twitch: mehrere Streams gleichzeitig in-app** (v0.33) – mehrere eingebettete Webviews; **Hintergrund-Wiedergabe** (läuft beim Anbieterwechsel weiter) + **einzeln stummschalten** über die Streams-Leiste (Rust-`eval`). *Nativ, im Build zu testen.*
- 💡 **Globale Suche** (Anbieter + TMDB) in einem Feld, Tastenkürzel Strg/Cmd+K.
- ✅ **Suchverlauf in der Übersicht** (v0.31) – zuletzt gesuchte Begriffe als Chips unter der Suche. (Die separate „Verlauf"-Seite wurde auf Wunsch wieder entfernt.)
- ✅ **Mini-Player (Bild-in-Bild)** beim Verlassen der Stream-Seite (v0.30) – angedockt unten rechts mit Großansicht/Schließen; **per Einstellung an-/abschaltbar** (v0.31).
- 💡 **Split-View**: zwei Streams nebeneinander (z.B. für Sport).
- 💡 **Release-Benachrichtigungen**: neue Folgen/Filme aus der Watchlist (mit CR-Kalender verknüpft).
- 💡 **„Überrasch mich"** – zufälliger Titel/Anbieter.
- 💡 **Anbieter-Gruppen/Ordner** (eigene Sammlungen) + Zifferntasten 1–9 als Schnellstart.

### UX / Kinderschutz
- 💡 **Kinderprofil**: Anbieter-Whitelist + Tageszeit-/Zeitlimit pro Profil.
- 💡 **App-Sperre beim Start** per PIN (optional).
- 💡 Hell/Dunkel automatisch nach Tageszeit; mehr Akzent-Presets.

### Technisch / Sicherheit
- 💡 PINs verschlüsselt ablegen (OS-Schlüsselspeicher/keyring) statt Klartext.
- 💡 Strikte CSP nur für die OmniHub-Oberfläche (Anbieter-Webviews bleiben frei).
- 💡 Auto-Update-Signatur verifizieren + Hinweis, falls Schlüssel fehlt.
- ✅ **Lazy-Loading von Postern/Logos** (v0.34.1) – Bilder laden erst beim Heranscrollen (`loading="lazy"` + `decoding="async"`), schnellerer Seitenaufbau.
- 💡 Konfig-Backup (Export/Import) + Geräte-Sync.

---

## Erledigt (frühere Versionen)
- ✅ Persistenz (Einstellungen, Profile, Favoriten, Watchlist, Streamzeit)
- ✅ TMDB-Anbindung (Suche / Trending / Upcoming) – Key-Eintrag nötig
- ✅ Eigene Titelleiste + Tastenkürzel (?-Button / F1)
- ✅ Maximierter Start + Fenster-Memory
- ✅ Anbieter öffnen in echtem WebviewWindow (löste „Verbindung verweigert")
- ✅ Onboarding, Einstellungen als Modal
- ✅ Streamzeit-Tracking + Achievements (Basis)
- ✅ Profiltrennung: Favoriten/Watchlist/Streamzeit + getrennte Logins (dataDirectory)
- ✅ Profil-Wechsler mit PIN + Profilverwaltung (anlegen/umbenennen/löschen/PIN)
- ✅ Eigenes Logo als App-/Desktop-Symbol; Installer mit Lizenz-Zustimmung
- ✅ Dependabot (npm/Cargo/Actions)
- ✅ News/Upcoming als Hero+Filmstrip, Titel ausblenden, Anbieter-Logos am Titel
- ✅ „Weiterschauen"-Reihe (pro Profil) + Drag&Drop für Übersicht und Favoriten
- ✅ Kategorie-Filter in der Übersicht (DnD-sicher)
- ✅ Sichtbarer Sleep-Timer-Countdown (in der Seitenleiste)
- ✅ HTML5-Drag&Drop repariert (`dragDropEnabled: false`)
- ✅ Einstellungen erscheinen vor dem Stream; Vollbild + GPU-Schalter
- ✅ Versteckte Wiederherstellung für den Admin-PIN
- ✅ Suchverlauf in der Übersicht (nur bei fokussierter Suche)
- ✅ „Weiterschauen" als reiner Button (ohne Kachelreihe)
- ✅ CR-Kalender: volle Breite + Auswahl „letzte/nächste 7 Tage"
- ✅ Einstellungen-Performance: flüssigere Schalter & Scrollen (Backdrop-Blur entfernt)
- ✅ Twitch: mehrere Streams gleichzeitig + Hintergrund-Wiedergabe + Einzel-Mute
- ✅ Echtes Vollbild (Webview misst echte Fenstergröße)
- ✅ Sleep-Timer-Schnellauswahl (30/60/90) + Kategorie-Filter wird gemerkt
- ✅ Lazy-Loading für Poster & Logos (schnellerer Seitenaufbau)
- ✅ Hintergrund-Streams in der Sidebar (ausklappbar) statt schwebender Leiste
- ✅ Kategorie-Anzahl am Chip · „Überrasch mich" · Zifferntasten 1–9 · Hintergrund-Sammelaktionen · „?"-Kürzel
- ✅ Crash-Recovery (Neu-laden + Fehler-Panel) + WebView2-Health-Check
- 🟡 Profiltrennung experimentell (eigene Logins je Profil, Opt-in + Neustart)
- ✅ Lautstärke je Hintergrund-Stream (Regler in der Sidebar)

---

## v0.5.0 (diese Version)
- ✅ (11) Favoriten verschwinden aus „Alle Anbieter", bis sie wieder entfernt werden
- ✅ (12a) Achievement-/Push-Meldungen **nur in der App** (keine Windows-Benachrichtigungen)
- ✅ (12b) **50 Achievements**
- ✅ (10a) Übersicht: Umschalter Raster-/Listenansicht funktioniert
- ✅ (10b) Übersicht: „+ Anbieter" öffnet einen Editor zum Anlegen eigener Anbieter
- ✅ (16) Uhr-Overlay wird angezeigt (digital/analog, Farbe/Größe/Transparenz)
- ✅ (13a) Alle Checkboxen als schönere Schalter
- ✅ (13b) Glassmorphismus + „weitere Optik-Optionen" (Schatten/Hover-Zoom/Animationen) wirken
- ✅ (13c) Partikel-Hintergrund wird gerendert, mit detaillierten Optionen
- ✅ (13d) Mehr Schriftarten zur Auswahl (gilt für die ganze App)
- ✅ (15a) PIN-Änderung fragt zuerst den alten PIN ab

## v0.6.0
- ✅ (8) Anbieter werden im Hauptfenster eingebettet (kein zweites Fenster mehr); Fenster-Fallback vorhanden
- ✅ TMDB-Key eingetragen – Suche/Neuigkeiten/Upcoming liefern Daten

## v0.7.0
- ✅ (Update-Funktion) Echter In-App-Updater: Prüfung beim Start + auf Knopfdruck, Banner zum Herunterladen/Installieren (signiert über GitHub-Releases)

---

## v0.8.0
- ✅ (4) Karten gleich groß + volle Fensterbreite
- ✅ (6) Partikel-Hintergrund immer sichtbar (inkl. Sidebar)
- ✅ (16) Uhr sichtbar, 100% Transparenz = aus, im Uhr-Tab verschiebbar
- ✅ (10) Benachrichtigungscenter öffnet sich (Verlauf)
- ✅ (8) Neuigkeiten/Upcoming: Zeitlimit gegen ewiges „Lädt…"
- ✅ (7) Karten per Drag&Drop sortieren, alphabetisch als Standard, pro Profil gespeichert
- ✅ (11) Hintergrundbild wählbar (mit Deckkraft)
- ✅ (12) Design-zurücksetzen-Button
- ✅ (14) Partikel: mehrere Formen, Größe, Geschwindigkeit 0–1
- ✅ (5-Sicherheit) „Anbieter öffnen als" Eingebettet/Eigenes Fenster
- ✅ (17) Hinweis „Einstellungen gespeichert" beim Schließen
- ✅ (13) Erklärungen Karten-Schatten/Animationen + bessere Animationen

---

## v0.8.1 (Bugfixes)
- ✅ (5) Update-Prüfung: createUpdaterArtifacts aktiviert (latest.json wird erzeugt)
- ✅ (1/2) Profil bleibt beim Start & Seitenwechsel erhalten (zuverlässiger Sofort-Cache + abgesicherter Start)
- ✅ (3-Klick) Klick auf Karte öffnet wieder; Sortieren nur noch über Greif-Punkt
- ⏳ (3-Einbettung) Eingebetteter Stream zeigt evtl. nichts -> „Eigenes Fenster" testen / Konsole

---

## v0.9.0
- ✅ (4) Karten-Editor: Name/Untertitel/URL/Farbe/2.Farbe/Qualität/Logo bearbeiten (auch Standard-Anbieter), mit Live-Vorschau + „Auf Standard zurücksetzen"
- ✅ Eigene Logo-Bilder auf Karten; Bearbeitungen an Standard-Anbietern bleiben gespeichert

---

## v0.10.0
- ✅ (15) Profileditor: Haupt-Profil selbst wählbar (nicht löschbar), separater Admin-Code, „PIN vergessen?" per Admin-Code
- ✅ (1) Stream-Standard auf „Eigenes Fenster" (zuverlässig); „Eingebettet" bleibt optional
- ✅ (2) Desktop-Icons frisch aus Logo erzeugt; Android-/iOS-Reste entfernt

---

## v0.10.1 (Bugfixes)
- ✅ (2/8) F12-Konsole im Release aktiviert (devtools-Feature)
- ✅ (4) Admin-Code ändern erfordert alten Admin-Code
- ✅ (6) Haupt-Profil-Wechsel nur per Admin-Code
- ✅ (5) „Profil hinzufügen" verschwindet bei 5 Profilen
- ✅ (7) Uhr Digital/Analog-Umschalter funktioniert

---

## v0.11.0
- ✅ (18) Plugin-/Modul-System: Plugins-Tab funktional (Weiterschauen-Toggle, Sleep-Timer)
- ✅ (3) Eingebettete Streams laufen (durch Partikel-Absturz-Fix in v0.10.2)
- ℹ️ Echte Browser-Erweiterungen (AdBlock/Buster) nicht möglich (System-WebView); Captcha-Solver bewusst nicht

---

## v0.12.0
- ✅ Discord-Status (Rich Presence) als Plugin-Modul (Rust-Backend, lokal nicht testbar)

---

## v0.13.0
- ✅ (9) Crunchyroll-Kalender: 7-Tage-Anime-Plan via AniList, Crunchyroll markiert/verlinkt, Filter „Nur Crunchyroll"

---

## v0.14.0
- ✅ Titel-Info-Fenster (TMDB): Beschreibung, Trailer, Genre, Bewertung, „Wo streamen" (DE), Merken im Fenster

---

## v0.15.0
- ✅ (19) Watchlist Import/Export (JSON-Datei) + Info-Fenster auch bei „Gemerkt"
- ℹ️ VPN: nicht sinnvoll in-app machbar (separate App nutzen) · WideVine/DRM: in WebView2 nicht enthalten

---

## Als Nächstes geplant (Reihenfolge laut Wunsch)
- ⏳ (5) Streams starten nicht: Stream-Modus „Eigenes Fenster" als Notlösung; Ursache der Einbettung mit Konsolen-Ausgabe klären
