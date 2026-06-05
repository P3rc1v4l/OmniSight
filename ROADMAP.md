# OmniSight – Roadmap

Diese Datei hält den geplanten Funktionsumfang fest und wird **bei jeder Version automatisch aktualisiert**.
Stand: v0.80.0

Legende: ✅ erledigt · 🟡 teilweise · ⏳ geplant · 💡 in Klärung (Machbarkeit)

---

## 💡 Ideen-Pool / Backlog (v0.43.0 gesammelt)

Ungeordnete Vorschläge für kommende Versionen. ⭐ = bevorzugt. 🦀 = braucht Rust/Tauri (im Sandbox nicht testbar), 🎨 = reines Frontend.

### 🎬 Anbieter & Startseite
- ✅ **Anbieter-Ordner/Sammlungen** – eigene, ein-/ausklappbare Gruppen, umgesetzt in v0.47.0.
- ⏳ 🎨 **Karten-Ansicht umschaltbar** – kompakt / groß / Liste.
- ⏳ 🎨 **Schnellsuche direkt beim Anbieter** – Deep-Link in dessen Suche statt nur Startseite.
- ✅ **Erreichbarkeits-Indikator** pro Karte (Favicon-Ping), umgesetzt in v0.59.0.

### ▶️ Streaming & Player
- 🔜 ⭐ 🦀 **Split-View** – zwei Streams echt nebeneinander im Raster (nicht nur Hintergrund-Stream). NÄCHSTER SCHRITT (nativ/Rust, muss per GitHub Actions gebaut & getestet werden).
- 💡 🦀 **Windows-Picture-in-Picture**.
- ⏳ 🎨 **Theater-Modus** – UI dimmt automatisch, sobald ein Stream läuft.
- 💡 🦀 **Globale Medientasten** (Play/Pause/Stumm über Windows-Tasten).

### 🔖 Entdecken & Watchlist
- ✅ **„Verfügbar bei dir"** – Anbieter-Chips an jeder Watchlist-Karte (JustWatch-Abgleich), umgesetzt in v0.49.0.
- ✅ **Eigene Bewertung + „Gesehen"-Status** pro Titel, umgesetzt in v0.50.0.
- ✅ **Empfehlungen** („Weil du … gemerkt hast", via TMDB), umgesetzt in v0.51.0.
- ⏳ 🎨 **Tags/Unterlisten** in der Watchlist (z. B. „Heute Abend").

### 📊 Statistik & Achievements
- ✅ **Rückblick / „Wrapped"** – teilbare Zusammenfassung (Gesamt-Daten) umgesetzt in v0.45.0.
- ⏳ 🎨 **Streak-Zähler** (Tage in Folge) + passende Achievements.
- ✅ **Wochen-Heatmap** der Sehzeit (im Rückblick), umgesetzt in v0.58.0.
- ✅ **Detailseite pro Anbieter** (Statistik + „hier verfügbar" + Aktionen), umgesetzt in v0.57.0.

### 🔑 Profile & Sicherheit
- ⏳ ⭐ 🦀 **App-Sperre beim Start** (ganze App per PIN) + Auto-Sperre nach Inaktivität.
- ⏳ 🎨 **Kinder-Profile** mit Anbieter-Sperre.
- ✅ **Backup/Restore** aller Daten als Datei (Plugin-Store + localStorage), umgesetzt in v0.56.0.

### 🎨 Design & Barrierefreiheit
- ✅ **Fertige Theme-Presets** (komplette Farbschemata, nicht nur Akzent) – umgesetzt in v0.44.0.
- ⏳ 🎨 **Anpassbare Tastenkürzel**.
- ⏳ 🎨 **Kontrast-Modus** + „Bewegung reduzieren" beachten.
- 💡 🎨 **Eigene Theme-/CSS-Datei laden**.

### ⚙️ System & Daten
- 🟡 ⭐ 🦀 **Autostart + Tray-Icon** umgesetzt in v0.63.0 (Autostart, Tray mit Öffnen/Beenden, minimiert starten, in Tray schließen). MUSS per GitHub Actions gebaut & getestet werden. Offen: Schnellzugriff letztes Profil/Stream im Tray-Menü.
- ⏳ 🎨 **Einstellungs-Export/-Import**, optional Datei-Sync über Dropbox-/Drive-Ordner.
- 🟡 **Update-Kanäle** (stabil/beta): Beta zeigt Vorabversionen via GitHub-Fallback (Frontend, v0.62.0). Signierter Auto-Install pro Kanal bräuchte noch CI/Endpoint-Arbeit (🦀).
- ✅ **Performance-Modus** (Effekte aus bei laufendem Stream), umgesetzt in v0.62.0.

### 🧩 Erweiterbarkeit
- 💡 🎨 **Widget-System** für die Startseite (Wetter, RSS, Notizen).
- 💡 🦀 **Neue-Folgen-Benachrichtigung** via AniList-Abos.

---

## 🆕 v0.72.0
- 🦀 **Navigations-/Download-Schutz für eingebettete Streams** (Rust-Erzeugung mit `on_navigation`/`on_download`); Fallback auf Fenster-Modus bleibt. Per CI bauen & testen.
- ⏳ Baut darauf auf: kosmetisches Adblock pro Anbieter (Init-Skript), WebView2-Autofill (with_webview). Separat/schwer: Lautstärke-Mixer-Name (Windows Core-Audio COM).

## 🆕 v0.71.0
- 🦀 **CSP fürs Hauptfenster** (Sicherheitsnetz gegen eingeschleusten Code): nur eigene Skripte/Stile; erlaubt TMDB-Bilder, YouTube-Trailer, GitHub-Update-Check. Per CI bauen & im Auge behalten (Konsole bei Problemen). Offen bleiben: Cargo.lock (3, manuell), Navigation (6), PIN-Salt (4).

## 🆕 v0.70.0
- 🦀 **Sicherheits-Härtung:** Berechtigungen nur noch fürs Hauptfenster (Stream-/Embed-Webviews ohne Rechte, Least Privilege); Favicon-Abruf auf 2 MB begrenzt. Per CI bauen & testen.
- ⏳ Offene Sicherheits-Vorschläge: CSP setzen (2), Cargo.lock committen (3, manuell), Navigation der Stream-Seiten absichern (6), zufälliger PIN-Salt pro Profil (4).

## 🆕 v0.69.0
- 🦀 **Single-Instance:** Zweiter Programmstart startet keine neue Instanz, sondern holt die laufende (z. B. aus dem Tray) in den Vordergrund. Keine doppelten Tray-Icons mehr. Per CI bauen & testen.

## 🆕 v0.68.0
- 🦀 **Erreichbarkeit zuverlässiger:** echte HTTP-Anfrage in Rust (`check_reachable`) statt Favicon-Ping; jede Antwort = erreichbar, nur Verbindungsfehler = rot. Außerhalb von Tauri „unbekannt" statt rot. Per CI bauen & testen.

## 🆕 v0.67.0
- 🦀 **Interne Kennungen umbenannt (mit Migration):** Bundle-Identifier `com.p3rc1v4l.omnisight`, Store-Datei `omnisight.json`, localStorage `omnisight:*`. Rust kopiert beim ersten Start die alten App-Daten in den neuen Ordner; localStorage liest alte Schlüssel als Fallback. PIN-Salt + Discord-Asset-Key bewusst beibehalten (nicht migrierbar). Per CI bauen & testen.

## 🆕 v0.66.0
- 🟢 **Umbenennung OmniHub → OmniSight** (Produktname, Setup/.exe, Paket-/Crate-Namen, CI-Release-Name, UI, Onboarding, Kommentare, GitHub-Links, ZIP-Name). Interne Daten-Kennungen (Bundle-Identifier, `omnihub.json`, `omnihub:`-Schlüssel, Discord-Asset-Key) bewusst beibehalten, damit Nutzerdaten + Update-Kontinuität erhalten bleiben.

## 🆕 v0.65.0
- 🟢 **Eigenes Bild als Avatar:** Upload im Profileditor, automatisch quadratisch zugeschnitten + auf 128 px verkleinert; überall korrekt angezeigt (Karte, Umschalter, aktiver Knopf).

## 🆕 v0.64.0
- 🟢 **Profileditor neu gestaltet:** Karten-Raster mit großem Avatar (auf Profil-Akzentfarbe), Abzeichen (Haupt/Aktiv/PIN), Chip-Aktionen, In-Karte-Picker, mehr Avatare und „Profil hinzufügen"-Karte.

## 🆕 v0.63.0
- 🦀 **Autostart + Tray** (Rust, per CI bauen): Mit Windows starten, System-Tray (Öffnen/Beenden, Linksklick = Fenster), „minimiert starten" und „beim Schließen in den Tray". Schalter in Einstellungen → Erweitert → System.

## 🆕 v0.62.0
- 🟢 **Performance-Modus:** schaltet Animationen, Glas-Effekt, Schatten und Partikel automatisch ab, solange ein Stream (Vordergrund oder Hintergrund) läuft. Schalter in Design-Einstellungen.
- 🟡 **Update-Kanäle (stabil/beta):** Auswahl in Erweitert; Beta zeigt auch Vorabversionen über den GitHub-Fallback.

## 🆕 v0.61.0
- 🟢 **„Weiterschauen"** als eigener Abschnitt mit Überschrift, klar über den Favoriten.

## 🆕 v0.60.0
- 🟢 **Erreichbarkeit verfeinert:** Geräte-Offline-Erkennung (kein falsches „rot"), Auto-Refresh (bei Wiederverbindung + alle 5 Min), manueller 🔄-Knopf und Tooltip mit Prüfzeitpunkt (zweisprachig).

## 🆕 v0.59.0
- 🟢 **Erreichbarkeits-Indikator** pro Anbieter-Karte: kleiner Punkt (grün = erreichbar, rot = nicht erreichbar) via Favicon-Ping; abschaltbar in Design-Einstellungen. Grober Ping, kein Login-Status.

## 🆕 v0.58.0
- 🟢 **Wochen-Heatmap** im Rückblick: GitHub-artiges Raster der täglichen Sehzeit (pro Jahr bzw. letzte 26 Wochen bei „Gesamt"), mit Monats-/Wochentags-Beschriftung, Tooltips und Legende.

## 🆕 v0.57.0
- 🟢 **Anbieter-Detailseite** (/provider): erreichbar über das ⓘ auf der Anbieter-Karte. Zeigt deine Sehzeit-Statistik (gesamt, diese Woche, Anteil, Rang), „Überrasch mich hier" und welche Watchlist-Titel dort laufen.

## 🆕 v0.56.0
- 🟢 **Backup/Restore:** komplette Sicherung aller App-Daten (Plugin-Store + localStorage) als JSON-Datei, mit Wiederherstellung (überschreibt + lädt neu). In Einstellungen → Erweitert.

## 🆕 v0.55.0
- 🦀 **Pause für Hintergrund-Streams** (inkl. Spotify) + bestmögliche **Spotify-Lautstärke** (Rust, per CI bauen).
- 🟢 **Gemerkt:** kleinere Karten, Anbieter-Chips nur als gleich große Logos, Empfehlungen über volle Breite (bis 24), Standardfilter „Ungesehen".
- 🟢 **Uhr:** Live-Vorschau der Transparenz beim Bearbeiten.
- 🟢 **Design:** Theme-Vorlagen nach Dunkel/Hell gruppiert & sortiert.

## 🆕 v0.54.0
- 🟢 **Update-Fallback:** zusätzliche Prüfung über die GitHub-Releases-API (Banner + Download-Link), wenn der signierte Updater nichts findet.
- 🟢 **Schnellerer Start:** Settings/Profile/Katalog parallel geladen; Update-Check ~4 s verzögert.

## 🆕 v0.53.0
- 🦀 **Spotify-Pause im Hintergrund:** „Stumm" pausiert Spotify per Play/Pause-Klick (Web Audio lässt sich nicht stummschalten). Muss per GitHub Actions gebaut/getestet werden; Lautstärkeregler wirkt bei Spotify weiterhin nicht.

## 🆕 v0.52.0
- 🛠️ **Fixes:** Gemerkt-Seite fror durch doppelte „Verfügbar bei"-Chips ein (entdoppelt); Empfehlungen auf **eine** Reihe mit max. 10 zufälligen Titeln umgestellt; „Diese Woche" deckt jetzt die ganze Kalenderwoche (Mo–So) ab.

## 🆕 v0.51.0
- 🟢 **Empfehlungen:** „Weil du … gemerkt hast"-Reihen unter der Watchlist (TMDB-Empfehlungen, Seeds aus bestbewerteten/zuletzt hinzugefügten Titeln).

## 🆕 v0.50.0
- 🟢 **Bewertung & „Gesehen":** 1–5 Sterne + Gesehen-Status pro Watchlist-Titel, mit Filtern (gesehen/ungesehen) und Sortierung „Beste Bewertung".

## 🆕 v0.49.0
- 🟢 **„Verfügbar bei dir":** Watchlist-Karten zeigen passende eigene Anbieter (TMDB/JustWatch-Abgleich), klickbar zum direkten Öffnen.

## 🆕 v0.48.0
- 🟢 **Gemerkt – Wochen-Vorschau:** zeigt welche Titel erscheinen (mit Wochentag + „heute"-Abzeichen), erweitert auf die kommenden 7 Tage; lokales Datum statt UTC.

## 🆕 v0.47.0
- 🟢 **Anbieter-Sammlungen:** eigene Ordner (anlegen/umbenennen/löschen, Anbieter zuordnen) als ein-/ausklappbare Abschnitte auf der Startseite, pro Profil.

## 🆕 v0.46.0
- 🟢 **Jahres-Rückblick:** datiertes Streamzeit-Tracking (Tages-Buckets je Profil) + Zeitraum-Wahl im Rückblick (Gesamt / einzelne Jahre).

## 🆕 v0.45.0
- 🟢 **Rückblick / „Wrapped":** teilbare Poster-Zusammenfassung der Nutzung (Statistik-Tab).
- 🟢 **„Überrasch mich" + Zufallstitel:** öffnet einen zufälligen Titel, der beim gewählten Anbieter läuft.
- 🟢 **Update-Banner immer im Vordergrund** (fixes Overlay über allen HTML-Oberflächen).

## 🆕 v0.44.0
- 🟢 **Theme-Vorlagen:** fertige Farbschemata (Standard, Mitternacht, Graphit, Amethyst, Wald, Sonnenuntergang, Nord, Papier, Hoher Kontrast) im Design-Tab – setzen Flächen + Akzent, live umschaltbar.

## 🆕 v0.43.0
- 🟢 **Mehrsprachigkeit (DE/EN) – abgeschlossen:** Einstellungs-Dialog, alle Dialoge (Titel-Infos, Anbieter hinzufügen, Tastenkürzel) und die Achievements (Stufennamen + Beschreibungen) übersetzt. Die gesamte Oberfläche ist nun zweisprachig.

## v0.42.0
- 🟡 **Mehrsprachigkeit – Phase 2:** Statistiken, Gemerkt, CR-Kalender, Neuigkeiten & Upcoming übersetzt (inkl. sprachabhängiger Datums-/Zeitformate).

## v0.41.0
- 🟡 **Mehrsprachigkeit (DE/EN) – Phase 1:** Übersetzungssystem + Sprache im Onboarding; Navigation, Onboarding, Startseite und alle Kategorien übersetzt.

## 🆕 Erledigt in v0.41.0
- ✅ **Akzentfarbe je Profil** – jedes Profil kann eine eigene Akzentfarbe haben (überschreibt die globale, sobald das Profil aktiv ist). Auswahl im Profil-Editor.

---

## 🆕 Erledigt in v0.40.0
- ✅ **Auto-Update:** beim Start **und automatisch 1×/Stunde**.
- ✅ **Profil-Logins dauerhaft & getrennt** (stabile Webview-Labels; v0.38-Umweg entfernt).
- 🟡 **Spotify stummen/Lautstärke:** Mute/Volume durchsuchen jetzt Shadow-DOM + gleichorigin-iframes. Nutzt Spotify reines Web-Audio (kein Media-Element), bleibt es evtl. unerreichbar – im Build zu prüfen.
- ✅ **Design-Menü modernisiert:** Hell/Dunkel-Umschalter + Akzentfarben-Presets (Swatches).
- ✅ **Uhr-Menü modernisiert:** Typ als Umschalter, **12/24-Stunden-Format**, Farb-Swatches, aufgeräumtes Layout.
- ✅ **Profil-Editor erweitert:** **Avatar je Profil** (Emoji-Auswahl) + Politur; Avatar erscheint im Profilumschalter.

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
- ✅ **Profiltrennung (v0.40):** Logins sind pro Profil getrennt UND dauerhaft – ohne Neustart. Ursache war ein Zähler im Webview-Label (jedes Öffnen = leeres Verzeichnis); jetzt stabile Labels je (Profil, Anbieter). Der v0.38-Umweg (Env-Var/Relaunch) wurde entfernt.
- 💡 **Privater Stream** (Inkognito-Webview ohne Verlauf/Cookies) für geteilte Geräte.
- 💡 PINs per OS-Schlüsselspeicher (keyring) verschlüsseln; Auto-Update-Signatur verifizieren.

---

## 🆕 Neue Vorschläge (Stand v0.24.0)

### Technisch
- ✅ **Echtes Vollbild für eingebettete Streams** (v0.25–0.27): OmniSight-Vollbild-Schalter, randlos, Leiste per Maus oben einblendbar, Esc beendet (globales Tastenkürzel).
- ✅ **Hardware-Beschleunigung (GPU) umschaltbar** (v0.25): Schalter unter Plugins, greift beim Neustart über WebView2-Startargument.
- 💡 Webview-Pooling: Anbieter-Webviews vorhalten statt neu erzeugen → schnelleres Umschalten.
- 💡 Datei-Logging mit Rotation (optional aktivierbar) zur leichteren Fehlersuche bei Builds.
- 💡 Update-Kanäle (stabil/beta) + Changelog direkt im Update-Banner.

### Sicherheit
- ⏳ Profil-PIN optional als **App-Sperre beim Start** (nicht nur beim Profilwechsel).
- 💡 PINs verschlüsselt ablegen (OS-Schlüsselspeicher/keyring) statt im Klartext.
- 💡 Strikte CSP **nur für die OmniSight-Oberfläche** (Anbieter-Webviews bleiben unbeschränkt).
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
- 💡 Strikte CSP nur für die OmniSight-Oberfläche (Anbieter-Webviews bleiben frei).
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
