# Changelog

Alle nennenswerten Änderungen an OmniSight werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/),
Versionierung nach [SemVer](https://semver.org/lang/de/).

## [0.41.0] – 2026-05-31

### Neu
- **Akzentfarbe je Profil:** Jedes Profil kann jetzt eine **eigene Akzentfarbe** haben. Sie wird angewendet, sobald das Profil aktiv ist, und überschreibt die globale Akzentfarbe – ohne sie zu ändern. Auswahl im **Profil-Editor** (farbiger Punkt neben dem Avatar): Presets, eigene Farbe oder „Standard" (globale Farbe). Technisch sauber umgesetzt: die abgeleitete Variable `--accent-soft` wird automatisch passend zur gewählten Farbe gesetzt.

---

## [0.101.0] – 2026-06-06

### Jahresrückblick nur im Dezember-Fenster — 🎨
- Das Jahresrückblick-Banner erscheint jetzt **nur noch vom 16. bis 31. Dezember**. Das frühere Test-Fenster wurde entfernt.

### Auto-Updater für privates Repo — 🔧
- Da das Quell-Repo wieder **privat** ist, waren die Release-Dateien (inkl. `latest.json`) nicht mehr öffentlich abrufbar – der Updater konnte nichts finden.
- Neu: Der CI baut + signiert wie bisher, **veröffentlicht die Artefakte aber in ein separates, öffentliches Repo** (`OmniSight-Releases`). Der Updater-Endpoint zeigt jetzt dorthin. **Der Quellcode bleibt privat, Updates sind öffentlich abrufbar – und der Zugriffstoken liegt ausschließlich in den CI-Secrets, niemals im Code/in der App.**
- Einmalige Einrichtung nötig (öffentliches Repo + PAT-Secret) – siehe Hinweise.

---

## [0.100.0] – 2026-06-06

### Globale Titelsuche — 🎨
- Neue **globale Suche** über **Strg+F** oder **/** (sowie über die Befehlspalette → „Titel suchen"): durchsucht TMDB nach Filmen und Serien.
- Ein Treffer öffnet das **bestehende Detail-Fenster** – dort steht u. a. **„Wo streamen"** (bei welchen Anbietern der Titel läuft) plus Merken-Button.
- **Letzte Suchen** werden als anklickbare Chips angezeigt und können einzeln entfernt werden. Live-Suche mit Entprellung; veraltete Antworten werden verworfen.

---

## [0.99.0] – 2026-06-06

### UI-Politur: Lade-Skelette & Leer-Zustände — 🎨
- Neue, wiederverwendbare **Lade-Skelette** (schimmernde Poster-Platzhalter): Neuigkeiten/Upcoming zeigen während des Ladens jetzt ein Skelett statt nur „Laden…", und die **Empfehlungen** auf der Gemerkt-Seite zeigen beim Aufbau ein Skelett.
- **Leer-Zustände vereinheitlicht:** Der Kategorie-Hinweis auf der Startseite war fest auf Deutsch – jetzt zweisprachig; der „keine Titel"-Zustand bekam ein Icon.

Hinweis: Die vollständige Vereinheitlichung der Icons (Emoji → einheitliches Icon-Set) ist ein größerer eigener Schritt und folgt separat.

---

## [0.98.0] – 2026-06-06

### Watchlist-Import — 🎨
- Über den **Import**-Button auf der Gemerkt-Seite lassen sich jetzt **CSV-Dateien** (Letterboxd, Trakt oder generisch) **und** die eigene **JSON-Sicherung** einlesen.
- **Auflösung über TMDB:** Zeilen mit TMDB-ID werden exakt übernommen; Zeilen nur mit Titel (z. B. echte Letterboxd-Exporte) werden per Suche zugeordnet – bevorzugt nach **Jahr** und **Typ** (Film/Serie).
- **Fortschrittsanzeige** während des Imports (X / Y), plus Ergebnis-Meldung (hinzugefügt / nicht gefunden bzw. Duplikate). Robuster CSV-Parser (Anführungszeichen, Kommas in Titeln) – mit Tests geprüft.
- Profitiert vom TMDB-Cache aus v0.96.0 (schnellere Wiederholungen).

---

## [0.97.0] – 2026-06-06

### Sicherheit: PIN-/Admin-Hashing gehärtet — 🔒
- Profil-**PINs** und der **Admin-Code** werden jetzt mit **gesalzenem PBKDF2-SHA256** (100.000 Iterationen, zufälliger Salt pro PIN) gehasht – statt des bisherigen ungesalzenen einfachen SHA-256. Damit sind gleiche PINs nicht mehr am gleichen Hash erkennbar und Brute-Force/Rainbow-Tables deutlich erschwert.
- **Automatische Migration ohne Datenverlust:** Bestehende (alte) PINs funktionieren weiter und werden beim **nächsten erfolgreichen Login** transparent auf PBKDF2 umgestellt; der Admin-Code beim nächsten erfolgreichen Prüfen.
- Krypto- und Migrationslogik wurde mit 12 deterministischen Tests verifiziert (richtiger/falscher PIN, Salting, Legacy-Kompatibilität, Upgrade, Admin-Schema).

---

## [0.96.0] – 2026-06-06

### Stabilität: svelte-check als CI-Gate — 🔧
- Neuer **`check`-Job** im Release-Workflow: vor jedem Build wird mit **svelte-check** auf Typfehler geprüft (der Vite-Build prüft Typen NICHT). Schlägt die Prüfung fehl, startet der Build gar nicht erst.
- Dabei **11 echte, bisher unentdeckte Typfehler behoben** (u. a. fehlende `'movie'|'tv'`-Casts, falsche Objekt-Felder, `null`-Fälle, ein nicht abgesichertes `Logo`-Provider, fehlende Node-Typen). `@types/node` ergänzt.

### Performance: TMDB-Cache — 🔧
- Detail-Abrufe (Titel-Info, Empfehlungen, Serien-Tracker) werden jetzt **6 Stunden im Speicher zwischengespeichert** – weniger Anfragen, schnellere Modals und ein schnellerer Serien-Check beim Start.

### Sicherheit/UX: Bestätigungen — 🔒
- **Abmelden** (einzeln und „Von allen abmelden") sowie **Profil löschen** fragen jetzt vorher nach. Besonders das Profil-Löschen war zuvor ohne Rückfrage.

---

## [0.95.0] – 2026-06-06

### Serien-Tracker erweitert — 🎨
- In der **Titel-Info einer Serie** stehen jetzt **„Nächste Folge"** und **„Letzte Folge"** (Staffel·Episode, Datum, Episodentitel – aus TMDB). Erscheint eine Folge heute, wird das mit „heute" in Akzentfarbe hervorgehoben.
- Nutzt die ohnehin geladenen Detaildaten – keine zusätzlichen Anfragen.

---

## [0.94.0] – 2026-06-06

### Serien-Tracker: Hinweis bei neuen Folgen — 🎨
- Beim Start prüft OmniSight für gemerkte **Serien**, ob heute eine **neue Folge** erschienen ist (TMDB), und meldet sie einmalig im Benachrichtigungs-Center („Neue Folge: …").
- Neue Einstellung unter **Benachrichtigungen → Im Benachrichtigungs-Center**: „Neue Folgen von Serien" (an/aus). Läuft einmal pro Sitzung, dedupliziert je Folge.

### Export der Watchlist zu Letterboxd & Trakt — 🎨
- Neue Buttons auf der Gemerkt-Seite: **🎬 Letterboxd** (CSV, nur Filme – Spalten `Title, Year, tmdbID, Rating`) und **📺 Trakt** (CSV, Filme + Serien – `tmdb_id, type, title, year, rating`).
- Bewertung wird passend umgerechnet (Letterboxd 1–5 wie in der App, Trakt 1–10 = Sterne × 2). Datei einfach beim jeweiligen Dienst importieren.

---

## [0.93.0] – 2026-06-06

### Gemerkt-Seite aufgeräumt — 🎨
- **Gesehen/Ungesehen-Filter entfernt.** Die Seite zeigt jetzt **nur noch ungesehene** Titel. Wer einen Titel auf „Gesehen" setzt, schiebt ihn aus „Gemerkt" – er zählt dann in den **Statistiken** (und ist über „Gesehene Titel" einsehbar).
- **Empfehlungen sitzen jetzt als Leiste am unteren Bildschirmrand** (klebt beim Scrollen unten), **ohne Scrollleiste**: es werden nur so viele Empfehlungen gezeigt, wie in eine Reihe passen (Anzahl passt sich automatisch an die Fensterbreite an).

---

## [0.92.0] – 2026-06-06

### Build-Fix (nativer Teil aus v0.90/v0.91)
- Der CI-Build schlug fehl, weil die Konstante `STREAM_INIT_JS` versehentlich **zwischen `#[tauri::command]` und der Funktion** `create_embedded_webview` stand („expected `fn`" + Folgefehler bei den Command-Makros). Konstante nach **vor** das Attribut verschoben. Inhaltlich identisch zu v0.91.0; jetzt kompilierbar.
- **Hinweis:** Dies betrifft nur den nativen Rust-Code → bitte erneut im **CI** bauen.

---

## [0.91.0] – 2026-06-06

### „Accounts" – Anbieter-Logins je Profil (#9) — 🦀 muss im CI gebaut werden
- Neuer Bereich **„Anmeldungen bei Anbietern"** im Einstellungen-Tab **Profile**: listet die in diesem Profil geöffneten Anbieter.
- **Einzeln abmelden** („Abmelden") und **„Von allen abmelden"** – löscht das WebView2-Daten-Verzeichnis (Cookies/Login/Speicher) des Anbieters bzw. des ganzen Profils.
- Dafür bekommt der **Fenster-Modus jetzt pro Anbieter ein eigenes Daten-Verzeichnis** (`webviews/{Profil}/{Anbieter}`) statt nur pro Profil. **Einmalige Folge:** bestehende Fenster-Modus-Logins werden beim Update einmal zurückgesetzt; danach sind Anbieter sauber einzeln abmeldbar.
- *Ehrlicher Hinweis:* Vollständig wirkt das Abmelden bei Anbietern, die im **Fenster-Modus** geöffnet werden. **Eingebettete** Streams teilen sich technisch eine gemeinsame WebView2-Sitzung und lassen sich nicht einzeln pro Anbieter trennen.

---

## [0.90.0] – 2026-06-06

### Erreichbarkeit & Weiterleitung (#3) — 🦀 muss im CI gebaut werden
- **Erreichbarkeits-Check** nutzt jetzt einen **echten Browser-User-Agent** (+ Accept-Header, 10s Timeout). Dadurch werden Cloudflare-/Bot-geschützte Seiten wie **cine.to** und **bs.to** nicht mehr fälschlich als „offline" (rot) angezeigt. Jede HTTP-Antwort (auch 403/503) gilt als erreichbar.
- **Such-Weiterleitung:** In Streams (eingebettet & Fenster) öffnen „in neuem Tab"-Links (z. B. zum Stream-Hoster) jetzt **im selben Fenster** – die Weiterleitung nach der Suche funktioniert. Gleichzeitig werden **`window.open`-Pop-under-Werbung** unterbunden.

### Einstellungen überarbeitet (#10) — 🎨
- **Benachrichtigungen**: in zwei Gruppen aufgeteilt („Im Benachrichtigungs-Center" = Erfolge + Watchlist-Release; „Kurze Hinweise" = Pause/Ton/Update), jede Option mit **Beschreibung**. Hinweis erklärt, was im Center landet.
- **Plugins**: Abschnitts-Überschriften **Wiedergabe / Integrationen / System**.
- **Design**: Abschnitts-Überschriften **Modus & Farbe** und **Hintergrund & Darstellung**.

---

## [0.89.0] – 2026-06-06

### Onboarding überarbeitet (#11)
- **Sprache ist jetzt die erste Seite** des Onboardings.
- Neuer Schritt **Design** (Hell/Dunkel + Akzentfarbe) und ein Schritt **Schnelleinstellungen** („Weiterschauen" merken, beim Schließen in die Taskleiste, mit Windows starten) – Autostart/Tray werden direkt angewendet.
- Das Onboarding liegt jetzt **immer ganz im Vordergrund**, auch über laufenden Streams (eingebetteter Stream wird währenddessen ausgeblendet).

### Empfehlungs-Engine (#6)
- **„Neue Vorschläge"**-Button über den Empfehlungen mischt frische Titel.
- In der **Titel-Info einer Empfehlung** steht jetzt der **Grund** („Empfohlen, weil du … gemerkt hast").
- **Empfehlungen ausblenden**: per ✕ direkt auf der Karte oder in der Titel-Info – ausgeblendete Titel tauchen nicht mehr auf (pro Profil gespeichert).
- **Keine Empfehlungen wegen eines Titels**: in der Titel-Info einer Empfehlung lässt sich der zugrunde liegende Watchlist-Titel von künftigen Empfehlungen ausschließen.

---

## [0.88.0] – 2026-06-06

### Benachrichtigungs-Center (#5)
- Öffnet jetzt als **größeres, zentriertes Fenster** (wie die Einstellungen) mit aufgeräumtem Design, Icon-Badges und leerem-Zustand-Hinweis.
- Es werden **nur noch wichtige Hinweise** gesammelt: **freigeschaltete Achievements** und **erscheinende Watchlist-Titel**. Kurze Bestätigungen wie „Karte gespeichert", „Einstellungen gespeichert" oder „Anbieter ausgeblendet" erscheinen weiterhin kurz als Toast, landen aber **nicht mehr im Verlauf**.

### „Weiterschauen" prominenter (#2)
- Der Weiterschauen-Eintrag ist jetzt eine **große Karte über den Favoriten** (mit Poster, Titel, Anbieter und „Fortsetzen"-Button) statt einer kleinen Zeile. Ein Klick **öffnet direkt den zuletzt gesehenen Titel** an der gemerkten Stelle.

### Jahresrückblick-Banner (#8)
- Im Zeitraum **15.–31. Dezember** erscheint beim Start ein **großes Banner** zum Jahresrückblick. Es lässt sich **„dieses Jahr nicht mehr"** ausblenden (kommt dann erst nächsten Dezember wieder) oder für die Sitzung schließen.
- Im selben Zeitraum zeigen auch die **Einstellungen** oben einen Hinweis-Banner darauf.
- **Test:** Aktuell ist zusätzlich ein Test-Fenster vom **06.–11.06.2026** aktiv, damit sich alles vor Dezember prüfen lässt (in `src/lib/yearReview.ts` einfach `TEST_FROM`/`TEST_TO` leeren, dann gilt nur Dezember).

---

## [0.87.0] – 2026-06-06

### Karten-Editor aufgeräumt
- Der Button **„Ausblenden"** sitzt jetzt oben rechts auf Titelhöhe (statt in der überfüllten Fußzeile), **„Auf Standard zurücksetzen"** heißt nur noch **„Zurücksetzen"**, und die Fußzeilen-Buttons laufen nicht mehr über den Rand.

### Fenster-Modus verständlicher
- Die Meldung auf „Schaut gerade" erklärt jetzt den **Grund** für den Fenster-Modus: bei aktivem **Werbeblocker** mit Hinweis, dass es ohne Werbeblocker wieder eingebettet läuft (bzw. Twitch/BetterTTV oder Einstellung).
- **Schließt man das Anbieter-Fenster**, springt die App automatisch zurück zur **Übersicht** (vorher blieb man auf „Schaut gerade").

### Gemerkt-Karten
- Die Buttons **„Gesehen"/„Entfernen"** sind jetzt **unten an der Karte fixiert** (gleiche Höhe bei allen Karten).
- Die **Inhaltsangabe** wird nicht mehr auf der Karte angeteasert.
- Die **Bewertung** steht jetzt über den Anbietern (zwischen Jahr und Anbieter-Logos).
- **Empfehlungen** erscheinen nur noch in **einer** Reihe (horizontal scrollbar).

### Statistiken
- **Gesehene Titel** öffnen sich jetzt in einem **In-App-Fenster** (wie die Einstellungen); der Button sitzt oben neben **„Rückblick"**.

---

## [0.86.0] – 2026-06-06

### Lautstärkemixer-Name (Windows)
- WebView2-Audio erschien im Windows-Lautstärkemixer als **„Microsoft Edge WebView2"**. Über die **Windows Core Audio API (WASAPI)** werden jetzt die Audio-Sessions, die zu OmniSights eigenem Prozessbaum gehören, in **„OmniSight"** umbenannt und mit dem App-Icon versehen. Der Name greift sofort, das Icon nach erneutem Öffnen des Mixers. (Nativer Code – erst nach einem CI-Build/Installer sichtbar.)

### Anbieter aus- und einblenden
- Im **Karten-Editor** eines Anbieters gibt es jetzt **„🙈 Ausblenden"**. Ausgeblendete Anbieter verschwinden aus allen sichtbaren Listen, bleiben aber erhalten.
- Am **Ende der Startseite** erscheint ein Abschnitt **„🙈 Ausgeblendet (N)"**, über den sich jeder Anbieter wieder **einblenden** lässt. Der Status wird gespeichert.

### „Gesehen" markieren + Statistik-Übersicht
- In den **Titelinfos** gibt es einen Button **„Als gesehen markieren"** (legt den Titel bei Bedarf zuerst in der Watchlist an).
- In den **Statistiken** zeigt eine neue Kennzahl **„Gesehen"** die Anzahl und ein Button **„Gesehene Titel anzeigen"** ein klickbares Poster-Raster aller gesehenen Titel.

### Watchlist-Hinweise (Release heute)
- Die bereits vorhandene Einstellung **„Watchlist-Erinnerungen"** ist jetzt aktiv: Erscheint ein gemerkter Titel **heute**, kommt ein einmaliger Hinweis. Pro Titel nur einmal (gespeichert pro Profil).

---

## [0.85.0] – 2026-06-05

### Befehlspalette (Strg+K)
- Neue **Befehlspalette**: mit **Strg+K** öffnet sich ein Such-Overlay, das **Seiten**, **Aktionen** (Einstellungen, Design wechseln, Tastenkürzel) und alle **Anbieter** (zum Öffnen) durchsuchbar macht. Bedienung per Tastatur (↑/↓, Enter, Esc) oder Maus. Strg+K fokussiert nicht mehr nur die Suche, sondern öffnet die Palette.
- Bei laufendem eingebettetem Stream wird dieser für die Palette kurz aus- und danach wieder eingeblendet.

### Schnellerer Update-Check beim Start
- Die Update-Prüfung startet jetzt **~0,8 s** nach dem Laden (statt 4 s) und läuft **parallel** zu den Profildaten – das „Update verfügbar" erscheint deutlich früher.

---

## [0.84.0] – 2026-06-05

### Gemerkt-Seite: Wochen-Releases an den Karten statt Banner
- Das Banner „Diese Woche" oben wurde entfernt. Stattdessen werden die **betroffenen Titel-Karten hervorgehoben**: Akzent-Rahmen + Leucht-Schatten und ein kleines Badge oben rechts mit dem **Release-Tag** (bzw. „Heute" am Erscheinungstag).
- Logik unverändert (Kalenderwoche Mo–So); nur die Darstellung wandert vom Banner direkt an die Karte.

---

## [0.83.0] – 2026-06-05

### BetterTTV für Twitch
- Twitch-Anbieter öffnen jetzt im Stream-Fenster mit **BetterTTV** und Werbeblockung. BetterTTV wird **nur** für Twitch geladen (eigener Ressourcen-Ordner `extensions_twitch/`, der nur fürs Twitch-Fenster als Erweiterungs-Pfad dient).
- Werbeblocker-Anbieter laden weiterhin nur uBlock; Twitch lädt uBlock + BetterTTV.
- CI lädt BetterTTV (Chrome-Build) und kopiert uBlock in den Twitch-Ordner (ausfallsicher).

---

## [0.82.0] – 2026-06-05

### Profilwechsel führt zurück zur Übersicht
- Wer beim Profilwechsel gerade einen Stream ansieht, wird jetzt automatisch zur Startseite/Übersicht zurückgeführt (zusammen mit dem Schließen der Streams aus 0.81.0).

---

## [0.81.0] – 2026-06-05

### Profilwechsel schließt laufende Streams
- Beim Profilwechsel werden jetzt **alle** laufenden Streams des alten Profils geschlossen – nicht nur Fenster-Streams, sondern auch der **eingebettete** Vordergrund-Stream und eingebettete Hintergrund-Streams.

---

## [0.80.0] – 2026-06-05

### Werbeblocker im eigenen Stream-Fenster + Profil-Trennung
- Anbieter mit aktiviertem Werbeblocker öffnen jetzt in einem **eigenen Top-Level-Fenster**, das in Rust erzeugt wird (neuer Befehl `open_stream_window`). Nur dort lassen sich WebView2-Erweiterungen (uBlock) laden – eingebettete Kind-Webviews können das technisch nicht.
- Dieses Fenster hat ein **eigenes Daten-Verzeichnis pro Profil** → getrennte Logins/Passwörter/Cookies je Profil. Damit ist die Profil-Trennung für solche Streams gelöst (eingebettete Kind-Webviews teilen sich die Umgebung und können das nicht).
- Enthält außerdem Navigations-/Download-Schutz und Passwort-Autofill.
- uBlock-Download im CI und Ressourcen-Bündelung wieder aktiv.

---

## [0.79.0] – 2026-06-05

### Autofill auch im Fenster-Modus
- Passwort-Speicherung & Autofill jetzt auch für Streams im Fenster-Modus (nicht nur eingebettet). Neuer Befehl `enable_webview_autofill`, der die WebView2-Einstellungen anhand des Fenster-Labels setzt; COM-Logik in einen gemeinsamen Helfer ausgelagert.
- Erinnerung: Der Fenster-Modus nutzt bereits ein **eigenes Daten-Verzeichnis pro Profil** → gespeicherte Logins/Passwörter sind dort je Profil getrennt.

---

## [0.78.0] – 2026-06-05

### Passwort-Autofill in eingebetteten Streams (nur Windows)
- Für eingebettete Anbieter-Webviews wird jetzt die WebView2-eigene **Passwort-Speicherung** (standardmäßig aus) und das **Formular-Autofill** aktiviert – per WebView2-COM (`ICoreWebView2Settings4`).
- Passwörter werden im **eigenen WebView2-Profil** von OmniSight gespeichert (nicht im System oder einem Browser). WebView2 bietet beim Login das Speichern an und füllt beim nächsten Mal aus.
- 🦀 Nativer COM-Code – per CI bauen. Versionen exakt passend zu wry (`webview2-com 0.38`, `windows 0.61`).

---

## [0.77.0] – 2026-06-05

### Freeze behoben: WebView2-Erweiterungen in eingebetteter Ansicht deaktiviert
- Das Laden einer Browser-Erweiterung (Werbeblocker) in die eingebettete Kind-Webview ließ den Prozess auf Windows einfrieren. Dieses Laden ist jetzt entfernt – eingebettete Streams laufen wieder stabil, auch bei aktiviertem Schalter.
- Der Werbeblocker-Schalter bleibt im Karten-Editor erhalten, hat aber aktuell **keine Wirkung**, bis ein tragfähiger Weg gefunden ist.
- Aufräumen: uBlock-Download im CI und die `extensions/`-Ressourcenbündelung entfernt (kein toter Ballast im Installer). Navigations-/Download-Schutz bleibt aktiv.

---

## [0.76.0] – 2026-06-05

### Kritischer Fix: CSP blockierte Tauris IPC
- Die in 0.71.0 eingeführte CSP verbot `connect-src` zu `http://ipc.localhost` – dadurch scheiterten Backend-Aufrufe (u. a. das Laden des Stores), was die Oberfläche einfrieren ließ (Knöpfe ohne Wirkung, kein Anbieterwechsel).
- `connect-src` um `ipc:` und `http://ipc.localhost` ergänzt (plus Asset-Protokoll vorsorglich in `img-src`/`connect-src`). Restliche Härtung bleibt erhalten.

---

## [0.75.0] – 2026-06-05

### uBlock Origin wird automatisch gebündelt
- Der Release-Workflow lädt beim Build die **neueste uBlock-Origin-Erweiterung** herunter und entpackt sie nach `src-tauri/extensions/uBlock0.chromium/`. Tauri bündelt sie als Ressource; Anbieter mit aktiviertem Werbeblocker-Schalter (seit 0.74.0) laden sie dann im eingebetteten Stream.
- Schritt ist **ausfallsicher** (`continue-on-error`): ein Download-Problem blockiert den Release nicht.
- `.gitignore` hält die heruntergeladenen Erweiterungs-Dateien aus dem Repo heraus (nur die README bleibt). uBlock aktualisiert seine Filterlisten selbst.

---

## [0.74.0] – 2026-06-05

### Werbeblocker pro Anbieter (WebView2-Erweiterungen, nur Windows)
- Neuer Schalter **„Werbeblocker (nur Windows)"** im Karten-Editor – frei pro Anbieter wählbar (Standard: aus).
- Eingebettete Streams können daraus eine Chromium-Erweiterung (z. B. uBlock Origin) laden: Rust aktiviert für aktivierte Anbieter `browser_extensions_enabled` + `extensions_path` und lädt aus dem mitgelieferten Ordner `src-tauri/extensions/` (nur wenn dort Erweiterungen liegen).
- `extensions/`-Ordner als App-Ressource gebündelt, inkl. Anleitung (README), wie uBlock Origin als entpackte Erweiterung abgelegt wird. uBlock aktualisiert seine Filterlisten selbst.
- Hinweis: 🦀 nativer Teil – per CI bauen/testen; Wirkung nur im eingebetteten Modus; Release-Build-Verhalten von WebView2-Erweiterungen muss am echten Build geprüft werden.

---

## [0.73.0] – 2026-06-05

### Werkzeug (keine App-Änderung)
- Neuer Hilfs-Workflow **„Abhängigkeits-Infos"** (manuell startbar): erzeugt eine `Cargo.lock`, zeigt die Versionen von `webview2-com`/`windows` im Log und stellt die `Cargo.lock` als Download bereit. Grundlage für (a) das Committen von `Cargo.lock` (Reproduzierbarkeit + Sicherheit) und (b) das korrekte, versionsgenaue Einbauen des WebView2-Autofills.
- Recherche-Ergebnis dokumentiert: WebView2-Browser-Erweiterungen (z. B. uBlock) sind über `browser_extensions_enabled` + `extensions_path` am Webview-Builder möglich (nur Windows, entpackte Erweiterungen).

---

## [0.72.1] – 2026-06-05

### Build-Fix
- Kompilierfehler aus 0.72.0 behoben: Die DPI-Typen (`LogicalPosition`/`LogicalSize`) liegen direkt unter `tauri::`, nicht unter `tauri::dpi`. Der Navigations-/Download-Schutz aus 0.72.0 baut damit jetzt durch.

---

## [0.72.0] – 2026-06-04

### Eingebettete Streams: Navigations- & Download-Schutz
- Die eingebetteten Anbieter-Webviews werden jetzt **in Rust** erzeugt und dabei abgesichert: **Navigation** nur zu normalen Web-Schemata (`http`/`https`/`about`/`data`/`blob`) – fremde Schemata wie `file:` werden blockiert; **automatische Downloads** in Streams werden unterbunden.
- Sicherheitsnetz: Schlägt das abgesicherte Erzeugen fehl, fällt OmniSight automatisch auf den Fenster-Modus zurück – Streaming bricht nie ab.
- (Grundlage für später: Auf dieser Rust-Erzeugung lassen sich künftig kosmetisches Adblock und WebView2-Autofill aufsetzen.)

---

## [0.71.0] – 2026-06-04

### Content-Security-Policy (CSP) fürs Hauptfenster
- Das App-Fenster hat jetzt eine **CSP** – eine Erlaubnisliste, die festlegt, woher Skripte, Bilder, Stile und Verbindungen kommen dürfen. Sie ist ein **Sicherheitsnetz**: Sollte je fremder Code in die Oberfläche gelangen, kann er keine externen Skripte nachladen oder Daten abfließen lassen.
- Bewusst erlaubt, damit nichts kaputtgeht: Bilder von `image.tmdb.org` (+ `data:` für Favicons), der **Trailer** über `youtube-nocookie.com`, und der **Update-Check** zu `api.github.com`. Skripte/Stile nur aus der App selbst.
- Betrifft nur das eigene Fenster – die eingebetteten Anbieter-Seiten laufen in eigenen Webviews und sind davon unberührt.

---

## [0.70.0] – 2026-06-04

### Sicherheits-Härtung
- **Strengere Berechtigungen (Least Privilege):** Die Tauri-Berechtigungen gelten jetzt **nur noch fürs Hauptfenster**. Eingebettete Anbieter-Webviews (`embed-*`) und Stream-Fenster (`stream-*`) laden Fremd-Inhalte und bekommen **keinerlei** App-Berechtigungen mehr – selbst wenn eine eingebettete Seite manipuliert würde, käme sie nicht an OmniSights Funktionen. (Defense-in-Depth; die eingebetteten Webviews liefen ohnehin schon ohne IPC.)
- **Favicon-Abruf begrenzt:** Antworten über 2 MB werden abgelehnt (erst per angekündigter Länge, dann anhand der tatsächlich gelesenen Größe), damit eine bösartige Favicon-URL den Speicher nicht zumüllen kann.

---

## [0.69.0] – 2026-06-04

### Nur noch eine Instanz (kein doppeltes Tray-Icon mehr)
- Liegt OmniSight im Infobereich (Tray) und du startest das Programm erneut, wird **keine zweite Instanz** mehr gestartet. Stattdessen holt die bereits laufende App ihr **Fenster zurück** (zeigen + in den Vordergrund), und der zweite Start beendet sich sofort. Damit häufen sich keine mehrfachen Tray-Icons / Prozesse mehr an.

---

## [0.68.0] – 2026-06-04

### Erreichbarkeits-Anzeige zuverlässiger (keine falschen „rot")
- Der Erreichbarkeits-Punkt prüft jetzt **server-seitig per echter HTTP-Anfrage** (in Rust), statt ein Favicon-Bild zu laden. **Jede** Antwort des Servers (auch 403/404) zählt als erreichbar – nur echte Verbindungs-/DNS-/Timeout-Fehler ergeben „rot". Damit verschwinden die falschen roten Punkte bei Anbietern, die kein `/favicon.ico` ausliefern.
- Außerhalb der Desktop-App (Web-Vorschau ohne Tauri) wird der Status als **unbekannt** (kein Punkt) angezeigt, statt fälschlich „rot".

---

## [0.67.0] – 2026-06-04

### Interne Kennungen umbenannt – mit Daten-Migration
- Auch die internen Kennungen heißen jetzt OmniSight: **Bundle-Identifier** `com.p3rc1v4l.omnisight`, **Store-Datei** `omnisight.json`, **localStorage-Schlüssel** `omnisight:*`.
- **Automatische Migration:** Beim ersten Start kopiert die App deine alten Daten aus `…\com.p3rc1v4l.omnihub\omnihub.json` in den neuen Ordner/Dateinamen (inkl. weiterer Dateien wie Fensterzustand). Die localStorage-Schlüssel werden beim Lesen automatisch vom alten Namen übernommen. Dein alter Daten-Ordner bleibt **als Sicherung unangetastet**.
- **Bewusst NICHT geändert (technisch nicht migrierbar):**
  - der **PIN-Salt** (`omnihub:` im PIN-Hash) – würde man ihn ändern, ließen sich bestehende PINs nie wieder bestätigen (Hashes sind nicht umkehrbar);
  - der **Discord-Bild-Asset-Key** `omnihub` – das ist ein Verweis auf ein im Discord-Portal hochgeladenes Bild; erst wenn du dort ein Asset namens `omnisight` hochlädst, kann ich diesen einen Wert umstellen.
- **Einmalige Folge des geänderten Identifiers:** Windows betrachtet die App als neu. Nach dem Update hast du **kurzzeitig zwei Einträge** (alt + neu); deine Daten sind bereits in die neue App übernommen – die **alte** kannst du manuell deinstallieren.

---

## [0.66.0] – 2026-06-04

### Projekt umbenannt: OmniHub → OmniSight
- Das gesamte Projekt heißt jetzt **OmniSight**. Umbenannt wurden u. a.: **Produktname & Fenstertitel** (damit auch das Installations-Setup und die `.exe` „OmniSight" heißen), **Paket-/Crate-Namen** (npm `omnisight`, Cargo `omnisight`/`omnisight_lib`), der **Release-Name** im CI, alle **Oberflächentexte**, das **Onboarding**, der **About-Bereich**, sämtliche **Kommentare**, die **GitHub-Links** sowie der **ZIP-Dateiname** (ab jetzt `omnisight-vX.zip`).
- **Bewusst NICHT geändert (zum Schutz deiner Daten):** der interne **Bundle-Identifier** `com.p3rc1v4l.omnihub`, der **Store-Dateiname** `omnihub.json`, die **localStorage-Schlüssel** `omnihub:*` (inkl. PIN-Salt) und der **Discord-Bild-Asset-Key** `omnihub`. So bleiben Einstellungen, Profile, Streamzeit und gespeicherte PINs erhalten, und das Update **ersetzt** die App, statt eine zweite Kopie zu installieren. Alte Backups (`omnihub-backup`) lassen sich weiterhin importieren.
- **Wichtig (GitHub-Links/Updater):** Die Links zeigen jetzt auf `…/P3rc1v4l/OmniSight`. Sie funktionieren erst, **sobald du das Repository umbenannt hast**. Plane also: dieses Release veröffentlichen → Repo umbenennen. (GitHub leitet alte Repo-Links automatisch auf den neuen Namen um.)

---

## [0.65.0] – 2026-06-04

### Eigenes Bild als Profil-Avatar
- Im Profileditor lässt sich über die Kamera-Kachel im Avatar-Auswahlfeld jetzt ein **eigenes Bild hochladen**. Es wird automatisch **quadratisch zugeschnitten und auf 128 px verkleinert/komprimiert**, damit der Speicher klein bleibt.
- Bild-Avatare werden überall korrekt angezeigt: in der Profil-Karte, im Profil-Umschalter (Liste) und am aktiven Profil-Knopf. Ein Emoji auswählen ersetzt das Bild wieder. Reines Frontend.

---

## [0.64.0] – 2026-06-04

### Profileditor neu gestaltet
- Die Profilverwaltung (Einstellungen → Konto) ist jetzt ein übersichtliches **Karten-Raster** statt einer gedrängten Liste.
- Jede **Profil-Karte** zeigt einen großen **Avatar auf der Profil-Akzentfarbe**, den editierbaren Namen und klare **Abzeichen** (Hauptprofil ★, Aktiv, 🔒 PIN). Ein farbiger Balken oben spiegelt die Akzentfarbe; die aktive Karte ist hervorgehoben.
- Aktionen sind als saubere **Chips** gruppiert: Farbe, PIN setzen/ändern, PIN vergessen, Als Hauptprofil, Löschen. Avatar-, Farb- und PIN-Auswahl öffnen sich direkt in der Karte.
- **Mehr Avatare** zur Auswahl und eine eigene **„Profil hinzufügen"-Karte**.
- Alle bestehenden Funktionen bleiben erhalten (PIN mit Alt-PIN-Prüfung, Admin-Code, Hauptprofil-Wechsel mit Admin-Bestätigung). Reines Frontend.

---

## [0.63.0] – 2026-06-04

### Autostart + System-Tray (🦀 bauen & testen)
- **Mit Windows starten:** OmniSight kann sich beim Anmelden automatisch starten (Schalter in **Einstellungen → Erweitert → System**).
- **System-Tray:** Ein Tray-Symbol mit Menü **„OmniSight öffnen"** und **„Beenden"**; **Linksklick** holt das Fenster zurück.
- **Minimiert starten:** Beim Start wird das Fenster minimiert.
- **Beim Schließen in den Tray:** Das Schließen des Fensters versteckt OmniSight in den Infobereich, statt es zu beenden (über das Tray-Menü wieder öffnen oder ganz beenden).
- **Wichtig/ehrlich:** Das sind native (Rust-)Änderungen inkl. Tray + neuem Autostart-Plugin und neuen Berechtigungen – **im Sandbox nicht baubar/testbar**. Bitte über **GitHub Actions** bauen und testen. Sollte der Build meckern (z. B. an einer umbenannten Tray-Methode oder am Cargo.lock), schick mir das Log – dann ziehe ich es nach. Noch offen: Schnellzugriff auf das letzte Profil/den letzten Stream direkt im Tray-Menü.

---

## [0.62.0] – 2026-06-04

### Performance-Modus
- Neuer Schalter unter **Einstellungen → Design**: Ist er an, schaltet OmniSight **Animationen, Glas-Effekt, Schatten und Partikel automatisch ab, solange ein Stream läuft** (Vordergrund oder Hintergrund) – und schaltet sie danach wieder ein. Spart Leistung beim Schauen.

### Update-Kanäle (stabil/beta)
- Unter **Einstellungen → Erweitert** lässt sich jetzt ein **Update-Kanal** wählen. **Beta** zeigt zusätzlich **Vorabversionen** (über den GitHub-Fallback), **Stabil** nur normale Releases.
- Ehrlich: Der signierte Auto-Install nutzt weiterhin das neueste stabile Release; Beta-Funde erscheinen als **GitHub-Download-Link**. Echte signierte Kanäle bräuchten noch CI-/Endpoint-Arbeit.

---

## [0.61.0] – 2026-06-04

### „Weiterschauen" als eigener Abschnitt über den Favoriten
- Der Weiterschauen-Eintrag steht klar **über den Favoriten** und hat jetzt eine eigene Überschnitt-Zeile **„▶ Weiterschauen"** (wie ⭐ Favoriten), statt nur ein kleiner Knopf zu sein.
- Hinweis: In den letzten Versionen war er bereits oberhalb der Favoriten – falls er bei dir darunter erschien, lag das an einer **älteren installierten Version** (siehe Update-Hinweis weiter unten).

---

## [0.60.0] – 2026-06-04

### Erreichbarkeits-Anzeige verfeinert
- **Offline-Erkennung:** Ist dein **Gerät** offline, werden Anbieter nicht mehr fälschlich „rot", sondern grau mit Hinweis „Keine Internetverbindung".
- **Automatische Aktualisierung:** Der Status frischt sich bei **Wiederverbindung** und **alle 5 Minuten** automatisch auf.
- **Manuell aktualisieren:** Neuer **🔄-Knopf** in der Anbieter-Leiste (erscheint nur, wenn der Indikator aktiv ist) prüft sofort alles neu.
- **Tooltip mit Zeitpunkt:** Der Status-Punkt zeigt jetzt z. B. „Erreichbar · vor 3 Min geprüft" und ist vollständig zweisprachig (DE/EN).

---

## [0.59.0] – 2026-06-04

### Erreichbarkeits-Indikator pro Karte
- Jede Anbieter-Karte zeigt jetzt einen kleinen **Status-Punkt** (im Qualitäts-Abzeichen oben links): **grün** = erreichbar, **rot** = nicht erreichbar, **gelb** = wird gerade geprüft.
- Technik: Es wird das **Favicon** der Anbieter-Domain geladen (lädt = erreichbar, Fehler/Timeout = nicht erreichbar). Das umgeht CORS und ist rein im Frontend.
- Abschaltbar unter **Einstellungen → Design** („Erreichbarkeit anzeigen"). Ergebnisse werden 5 Minuten zwischengespeichert.
- Ehrlich: Das ist ein **grober Erreichbarkeits-Ping**, kein Login-/Service-Status – ein fehlendes Favicon kann fälschlich „nicht erreichbar" zeigen.

---

## [0.58.0] – 2026-06-04

### Wochen-Heatmap im Rückblick
- Der **Rückblick** zeigt jetzt eine **Aktivitäts-Heatmap** im GitHub-Stil: ein Raster aus Tagen (Wochen als Spalten, Mo–So als Zeilen), eingefärbt nach täglicher Sehzeit.
- Sie passt sich dem gewählten **Zeitraum** an: bei einem Jahr das ganze Jahr, bei „Gesamt" die letzten 26 Wochen. Mit Monats- und Wochentags-Beschriftung, Tooltip pro Tag (Datum + Sehzeit) und einer Intensitäts-Legende.

---

## [0.57.0] – 2026-06-04

### Anbieter-Detailseite
- Über das neue **ⓘ-Symbol** auf jeder Anbieter-Karte (erscheint beim Überfahren) öffnet sich eine eigene **Detailseite** pro Anbieter.
- Sie zeigt deine **Statistik** für diesen Anbieter: gesamte Sehzeit, Sehzeit **diese Woche**, **Anteil** an deiner Gesamt-Sehzeit und den **Rang** unter allen Anbietern.
- Außerdem: **„Überrasch mich hier"** (öffnet einen zufälligen, dort verfügbaren Titel) und eine Übersicht, welche Titel **aus deiner Watchlist** bei diesem Anbieter laufen (TMDB-Abgleich).
- Schnellaktionen: Anbieter öffnen und als Favorit markieren.

---

## [0.56.0] – 2026-06-04

### Backup & Wiederherstellung
- Unter **Einstellungen → Erweitert** gibt es jetzt eine **Sicherung**: „Backup exportieren" speichert **alle** Daten (Profile, Watchlist mit Bewertungen/Status, Anbieter, Sammlungen, Statistiken/Tracking, Einstellungen, Suchverlauf …) als eine **JSON-Datei**.
- „Backup importieren" stellt aus einer solchen Datei wieder her – mit Sicherheitsabfrage, danach lädt OmniSight automatisch neu. **Achtung:** Der Import **überschreibt** die aktuellen Daten.
- Technisch wird sowohl der Plugin-Store als auch der localStorage gesichert – dadurch ist das Backup vollständig und erfasst auch künftige neue Funktionen automatisch. Reines Frontend, kein zusätzliches Plugin nötig.

---

## [0.55.0] – 2026-06-04

### Hintergrund-Streams: Pausieren + Spotify-Lautstärke (🦀 bauen & testen)
- Jeder Hintergrund-Stream hat jetzt einen **Pause/Play-Knopf** (neben Stummschalten). Generisch über die Medien-Elemente, bei **Spotify** über den Play/Pause-Button.
- **Spotify-Lautstärke:** bestmöglicher Versuch über den Lautstärke-Regler der Oberfläche (Input-Range bzw. Klick auf die Leiste). **Achtung:** native Rust-Änderung, im Sandbox nicht testbar – bitte per GitHub Actions bauen. Sollte Spotifys Regler-Aufbau abweichen, kann das Anpassen nötig sein; Pausieren/Stummschalten (= Pause) bleibt der zuverlässige Weg.

### Gemerkt
- **Kleinere Karten** (kompakteres Raster), damit mehr auf den Bildschirm passt.
- **Anbieter-Chips** zeigen jetzt nur noch das **Logo**, alle **gleich groß** und kompakter – ohne Namenstext.
- **Empfehlungen** füllen jetzt die **gesamte Breite** (responsives Raster) und zeigen **bis zu 24** Titel statt 10.
- Beim Öffnen landest du standardmäßig bei den **ungesehenen** Titeln.

### Einstellungen
- **Uhr:** Beim Bearbeiten wird die **Transparenz live** angezeigt (die Uhr bleibt während der Einstellung sichtbar und greifbar).
- **Design:** Theme-Vorlagen sind nach **Dunkel/Hell** gruppiert und sinnvoll sortiert.

---

## [0.54.0] – 2026-06-03

### Update-Prüfung: GitHub-Fallback
- Findet der signierte Tauri-Updater nichts (z. B. weil ein Release **keine** `latest.json`/Updater-Artefakte hat), prüft OmniSight jetzt **zusätzlich die GitHub-Releases-API**. Gibt es dort eine neuere veröffentlichte Version, erscheint das Banner mit dem Hinweis und einem **„Auf GitHub herunterladen"-Link** (manueller Download).
- Damit wird eine neue Version auch dann erkannt, wenn der Auto-Install-Pfad (noch) nicht eingerichtet ist. **Wichtig:** Entwürfe/Drafts werden von GitHub bewusst nicht ausgeliefert – ein als *Draft* gespeichertes Release wird also weder vom Updater noch vom Fallback gefunden.

### Schnellerer Start
- Settings, Profile und Anbieter-Katalog werden beim Start jetzt **parallel** geladen statt nacheinander.
- Die Update-Prüfung startet erst **~4 Sekunden nach** dem ersten Rendern, damit sie die Anzeige nicht ausbremst.
- Hinweis: Ein Teil der Startzeit hängt an Windows/WebView2 bzw. Virenscannern (außerhalb der App) – das lässt sich per Code nicht beeinflussen.

---

## [0.53.0] – 2026-06-03

### Spotify im Hintergrund stummschalten/pausieren (🦀 bauen & testen)
- Spotify spielt über **Web Audio** (kein `<audio>`-Element), daher griff das normale Stummschalten nicht. Neu: Ist ein Hintergrund-Stream **Spotify**, klickt OmniSight beim „Stumm" einmalig Spotifys **Play/Pause-Button** (pausiert) und beim Aktivieren wieder auf **Play**. Der Klick erfolgt nur einmal pro Schaltvorgang (keine Endlos-Toggles).
- **Achtung:** native (Rust-)Änderung – im Build-Sandbox nicht testbar. Bitte per GitHub Actions bauen und testen.
- Bekannte Grenze: Der **Lautstärkeregler** wirkt bei Spotify weiterhin nicht (Web Audio lässt sich von außen nicht regeln) – für Spotify bitte „Stumm" (= Pause) nutzen. Sollte Spotify seine Button-Kennungen ändern, kann es erneut nötig sein, die Selektoren anzupassen.

---

## [0.52.0] – 2026-06-03

### Behoben
- **Gemerkt-Seite fror ein / Buttons nicht klickbar:** Ursache war ein Render-Fehler durch doppelte „Verfügbar bei"-Chips (zwei TMDB-Anbieter, die auf denselben OmniSight-Anbieter zeigen). Die Chips werden jetzt entdoppelt – „Gesehen/Ungesehen" wird wieder sofort übernommen und alle Buttons reagieren.

### Geändert
- **Empfehlungen:** statt eigener Vorschläge pro Film gibt es jetzt **eine** Reihe mit **bis zu 10 zufälligen Titeln**, gemischt aus den Empfehlungen zu (zufällig gewählten) Titeln deiner Liste. Sie wird nur neu gewürfelt, wenn sich die Liste ändert – nicht beim Bewerten/Gesehen-Markieren.
- **„Diese Woche"-Vorschau:** deckt jetzt die **gesamte aktuelle Kalenderwoche (Mo–So)** ab – inklusive Titel, die diese Woche bereits erschienen sind. Vergangene Tage zeigen den Wochentag mit Datum, heute/morgen/gestern werden benannt.

---

## [0.51.0] – 2026-06-03

### Gemerkt: Empfehlungen „Weil du … gemerkt hast"
- Unter der Watchlist erscheinen jetzt **Empfehlungs-Reihen** auf Basis deiner Titel (TMDB-Empfehlungen). Als Ausgangstitel werden deine **bestbewerteten**, sonst zuletzt hinzugefügten Titel genommen (bis zu drei Reihen).
- Bereits gemerkte Titel werden herausgefiltert; ein Klick auf eine Empfehlung öffnet die Titel-Infos (von dort direkt merkbar).
- Hinweis: nutzt die TMDB-Empfehlungen-Schnittstelle (gültiger TMDB-Key + Internet nötig); je Ausgangstitel einmal geladen.

---

## [0.50.0] – 2026-06-03

### Gemerkt: Bewertung & „Gesehen"-Status
- Jeder Titel lässt sich jetzt mit **1–5 Sternen** bewerten (nochmal auf denselben Stern tippen = Bewertung löschen) und als **gesehen** markieren.
- Gesehene Titel werden auf der Karte abgedunkelt und mit einem ✓-Abzeichen versehen.
- Neue **Filter** „Ungesehen / Gesehen" sowie die **Sortierung „Beste Bewertung"**.
- Bewertung und Status werden pro Profil mit der Watchlist gespeichert (und sind in Export/Import enthalten).

---

## [0.49.0] – 2026-06-03

### Gemerkt: „Verfügbar bei dir"
- Jede Watchlist-Karte zeigt jetzt, bei **welchen deiner Anbieter** der Titel in Deutschland läuft (Abgleich über TMDB/JustWatch). Die Anbieter erscheinen als klickbare Chips – ein Klick öffnet den Titel direkt beim jeweiligen Anbieter (mit dessen Login-Sitzung).
- Es werden nur Anbieter angezeigt, die du auch eingerichtet hast. Die Daten werden je Titel einmal geladen und zwischengespeichert.
- Hinweis: Das ist eine **Anzeige in der App** (keine Push-Benachrichtigung). Voraussetzung sind ein gültiger TMDB-Key und Internet; Anbieter, die OmniSight (noch) nicht zuordnen kann, werden nicht angezeigt.

---

## [0.48.0] – 2026-06-03

### Gemerkt: Wochen-Vorschau mit Titeln
- Der bisherige „heute erscheint X"-Hinweis zeigt jetzt **welche Titel** es sind – und wurde auf die **kommenden 7 Tage** erweitert.
- Jeder Eintrag listet **Wochentag** (bzw. „Heute"/„Morgen", sprachabhängig) und Titel; heutige Titel bekommen ein „heute"-Abzeichen. Ein Klick öffnet direkt die Titel-Infos.
- Nebenbei: Das Tagesdatum wird jetzt aus der **lokalen** Zeit bestimmt (vorher UTC), das vermeidet ein falsches „heute" am späten Abend.

---

## [0.47.0] – 2026-06-03

### Anbieter-Sammlungen (Ordner)
- Neue **Sammlungen**: Über das 📁-Symbol in der Werkzeugleiste lassen sich eigene Ordner anlegen (z. B. „Anime", „Sport", „Kinder"), umbenennen, löschen und mit beliebigen Anbietern füllen – ein Anbieter kann in mehreren Sammlungen sein.
- Auf der Startseite erscheint jede Sammlung als **ein-/ausklappbarer Abschnitt** über der Anbieter-Übersicht (Klappzustand wird gespeichert). Beim Suchen werden die Sammlungen ausgeblendet.
- Sammlungen werden **pro Profil** gespeichert.

---

## [0.46.0] – 2026-06-03

### Jahres-Rückblick (datiertes Tracking)
- Die Streamzeit wird jetzt **datiert** aufgezeichnet (Tages-Buckets je Anbieter, pro Profil) – plus die Anzahl gestarteter Streams je Tag.
- Der **Rückblick** hat nun eine **Zeitraum-Wahl**: „Gesamt" sowie jedes Jahr mit Daten. Streamzeit, gestartete Streams, genutzte Anbieter und Top-Anbieter beziehen sich auf den gewählten Zeitraum.
- Hinweis: Die datierte Aufzeichnung beginnt mit diesem Update. Ältere Streamzeit (vor v0.46.0) hat keine Datumsangabe und erscheint daher nur unter **„Gesamt"**, nicht in einzelnen Jahren. Favoriten/Watchlist sind aktuelle Bestände, Achievements bleiben gesamt.

---

## [0.45.0] – 2026-06-03

### Rückblick / „Wrapped"
- Neuer **Rückblick** (Button im Statistik-Tab): zeigt deine Gesamt-Streamzeit, gestartete Streams, genutzte Anbieter, Favoriten, Watchlist-Titel, deine **Top-Anbieter** und freigeschaltete Achievements in einer teilbaren Poster-Ansicht (zum Screenshoten). Hinweis: basiert auf den Gesamt-Daten (es werden keine Datums-Zeitstempel gespeichert, daher kein Jahres-Filter).

### „Überrasch mich" mit Zufallstitel
- Der 🎲-Button wählt jetzt nicht nur einen zufälligen Anbieter, sondern sucht über TMDB einen **zufälligen Titel, der bei genau diesem Anbieter (DE) läuft**, und öffnet ihn direkt dort. Findet sich kein passender Titel (Nische/keine Daten), wird – wie bisher – der Anbieter geöffnet.

### Update-Banner immer im Vordergrund
- Das „Herunterladen & installieren"-Banner liegt jetzt als fixes Overlay direkt unter der Titelleiste **über allen Oberflächen** (Dialoge, Mini-Player, Seiten). Hinweis: ein im Vordergrund laufender **eingebetteter** Stream (native WebView) liegt technisch über der HTML-Ebene – dort kann das Banner verdeckt sein (Lösung wäre ein Rust-Eingriff, separat).

---

## [0.44.0] – 2026-06-03

### Theme-Vorlagen (Farbschemata)
- Neuer Bereich **„Theme-Vorlagen"** im Design-Tab: fertige, in sich stimmige Farbschemata, die Hintergrund, Flächen, Texte und einen passenden Akzent in einem Rutsch setzen.
- Mitgeliefert: **Standard, Mitternacht, Graphit, Amethyst, Wald, Sonnenuntergang, Nord** (dunkel) sowie **Papier** und **Hoher Kontrast** (hell).
- „Standard" folgt weiterhin dem Hell-/Dunkel-Schalter. Jede andere Vorlage legt ihren eigenen Modus + Akzent fest – der Akzent lässt sich danach frei weiter anpassen. Das Umschalten von Hell/Dunkel (auch per Strg+D) setzt automatisch auf „Standard" zurück.
- Die Auswahl ist sofort sichtbar (live) und wird pro Installation gespeichert.

---

## [0.43.0] – 2026-06-03

### Mehrsprachigkeit (Phase 3 – abgeschlossen)
- **Einstellungs-Dialog** vollständig übersetzt: alle Tabs (Design, Profile, Uhr, Benachrichtigungen, Plugins, Mehr), sämtliche Felder, Schalter, Hinweistexte, Auswahllisten und alle Meldungen (Toasts).
- **Dialoge** übersetzt: **Titel-Infos** (TitleInfoModal), **Eigenen Anbieter hinzufügen** (AddProviderModal) und **Tastenkürzel** (ShortcutsModal).
- **Achievements** sind jetzt zweisprachig: alle ~60 Stufennamen sowie die Fortschritts-Beschreibungen wechseln mit der Sprache.
- Damit ist die komplette App-Oberfläche in Deutsch und Englisch verfügbar.

---

## [0.42.0] – 2026-06-03

### Mehrsprachigkeit (Phase 2)
- Übersetzt: **Statistiken**, **Gemerkt** (Watchlist, inkl. Sortier-Optionen, Meldungen und Import/Export), **CR-Kalender** (inkl. „Heute/Morgen/Gestern", Wochentage und Uhrzeiten je nach Sprache) sowie **Neuigkeiten** und **Upcoming** (gemeinsamer MediaBrowser: Reiter, Hero, „Merken/Gemerkt", Fehlertexte).
- Datums- und Uhrzeitformate richten sich jetzt nach der gewählten Sprache (de-DE bzw. en-US).

### Noch offen (Phase 3)
- **Einstellungs-Dialog**, einzelne Dialoge (Titel-Infos, Anbieter hinzufügen, Kurzbefehle) und die **Achievement-Stufennamen** (~60 Stück, eigener Datensatz) folgen als letzte Phase.

---

## [0.41.0] – 2026-06-03

### Mehrsprachigkeit (Phase 1)
- **Neues Übersetzungssystem** (`src/lib/i18n.ts`): zentrales Wörterbuch (Deutsch/Englisch), reaktiv – ein Sprachwechsel übersetzt sofort und live.
- **Der Sprach-Schalter (DE/EN) funktioniert jetzt wirklich** und ist zusätzlich **im Onboarding** als eigener Schritt (mit den anderen Grundeinstellungen).
- **Übersetzt in dieser Phase:** Seitenleiste/Navigation (inkl. Hintergrund-Streams), Onboarding, **Startseite** und **alle Kategorien** (die Anbieter-Einordnung wie „Filme & Serien", „Live-TV" usw.).
- Anbieter-**Markennamen** (Netflix, Spotify …) bleiben unverändert – das sind Eigennamen.

### Hinweis (folgt in der nächsten Phase)
- Der **Einstellungs-Dialog** und die weiteren Seiten (Statistiken, Neuigkeiten, Upcoming, CR-Kalender, Gemerkt) sowie einzelne Dialoge werden als **Phase 2** übersetzt. Bis dahin erscheinen dort noch deutsche Texte.

---

## [0.40.0] – 2026-05-31

### Neu & behoben
- **Auto-Update:** Beim Start und zusätzlich **automatisch einmal pro Stunde** wird (still) nach Updates gesucht.
- **Profil-Logins bleiben erhalten – pro Profil getrennt:** Ursache des Ausloggens war ein hochzählender Zähler im Webview-Label, wodurch jedes Öffnen ein leeres Datenverzeichnis bekam. Jetzt **stabile Labels je (Profil, Anbieter)** → Logins bleiben dauerhaft und sind automatisch pro Profil getrennt. **Kein Neustart mehr beim Profilwechsel** (der experimentelle v0.38-Umweg wurde entfernt).
- **Spotify stummschalten/Lautstärke:** Die Mute-/Lautstärke-Steuerung durchsucht jetzt zusätzlich **Shadow-DOM und gleichorigin-iframes** – das erreicht mehr Player. *Hinweis: Spielt Spotify über reines Web-Audio ohne erreichbares Medien-Element, kann es trotzdem unerreichbar bleiben.*

### Design-Überarbeitung
- **Design-Menü:** **Hell/Dunkel-Umschalter** und **Akzentfarben-Presets** (klickbare Farbkreise + eigene Farbe) ganz oben.
- **Uhr-Menü:** aufgeräumtes Layout, **Typ als Umschalter** (Digital/Analog), neues **12-/24-Stunden-Format**, Farb-Presets.
- **Profil-Editor:** **Avatar je Profil** (Emoji-Auswahl), optisch aufgewertet; der Avatar erscheint auch im Profilumschalter.

### Wichtig
- Mehrere Punkte betreffen **nativen** Code (Logins/Labels, Spotify-eval) und konnten hier nicht kompiliert werden – bitte im Build prüfen.

---

## [0.39.0] – 2026-05-31

### Neu
- **Lautstärke je Hintergrund-Stream:** In der Sidebar hat jeder Hintergrund-Stream jetzt einen eigenen **Lautstärke-Regler** (0–100 %). So kannst du z.B. einen Stream leise im Hintergrund laufen lassen und einen anderen lauter. Bei stummgeschaltetem Stream ist der Regler ausgegraut (Stummschaltung hat Vorrang).
- Technisch über einen neuen Rust-Befehl, der `video.volume` im jeweiligen Webview setzt (analog zum Stummschalten, inkl. Beobachter).

### Wichtig
- Wie beim Stummschalten ist das ein **nativer** Eingriff (Rust + eval), hier nicht kompilierbar – bitte im Build prüfen, dass der Regler die Lautstärke wirklich ändert.

---

## [0.38.0] – 2026-05-31

### Neu – Profiltrennung (experimentell)
- **Getrennte Logins je Profil** als **Opt-in** unter **Einstellungen → Konto**. Ist es aktiv, bekommt jedes Profil einen **eigenen WebView2-Datenspeicher** – die Logins/Cookies sind dann pro Profil getrennt.
- Technisch: Beim Start setzt die App (falls aktiviert) ein profilspezifisches WebView2-Datenverzeichnis über eine Umgebungsvariable. Da WebView2 das nur **beim Start** liest, **startet die App beim Profilwechsel neu**.
- Standardmäßig ist die Option **aus** – für alle, die sie nicht aktivieren, ändert sich nichts (geteilter Login wie bisher).

### Wichtig (bitte testen)
- Das ist ein **nativer** Eingriff (neuer Rust-Befehl + Start-Logik), hier nicht kompilierbar. Bitte prüfen: Option aktivieren → neu starten → in Profil A einloggen → zu Profil B wechseln (App startet neu) → B sollte **ausgeloggt** sein. Klappt das nicht, beachtet dein WebView2 die Umgebungsvariable nicht – dann sag Bescheid, ich kläre einen anderen Weg.

---

## [0.37.0] – 2026-05-31

### Neu
- **Crash-Recovery für Streams:**
  - In der Stream-Leiste gibt es jetzt immer einen **„↻ Neu laden"**-Knopf (hilft bei schwarzem Bild, Hängern oder Abstürzen – lädt das eingebettete Fenster frisch).
  - Schlägt das Einbetten fehl, erscheint statt einer schwarzen Fläche ein **Hinweis-Panel** mit „Erneut versuchen" und „In eigenem Fenster öffnen".
- **WebView2-Health-Check:**
  - Unter **Einstellungen → Mehr** wird die installierte **WebView2-Version** angezeigt. Lässt sie sich nicht ermitteln, kommt eine Warnung samt **Download-Link**.
  - Der Installer ist explizit auf `downloadBootstrapper` gesetzt – fehlt WebView2, holt es der Installer automatisch nach.

### Wichtig
- Die WebView2-Versionsabfrage ist ein neuer **Rust-Befehl** (nativ) und konnte hier nicht kompiliert werden. Bitte im Build kurz prüfen, dass unter „Mehr" eine Version steht.

---

## [0.36.0] – 2026-05-31

### Neu (Schwung sicherer Frontend-Punkte)
- **Anzahl je Kategorie:** Jeder Filter-Chip in der Übersicht zeigt jetzt, wie viele Anbieter er enthält.
- **„Überrasch mich" 🎲:** Knopf in der Übersicht öffnet einen zufälligen Anbieter.
- **Zifferntasten 1–9:** Starten direkt den Favoriten (sonst sichtbaren Anbieter) Nr. n – sofern man nicht gerade in einem Eingabefeld/Dialog ist.
- **Hintergrund-Sammelaktionen:** In der Sidebar (ab 2 Hintergrund-Streams) „Alle stumm/laut" und „Alle schließen".
- **Tastenkürzel-Übersicht** öffnet jetzt auch mit **?** (neben F1); die Liste enthält die neuen Kürzel.

### Hinweis
- Die übrigen Vorschläge (Split-/Multi-View, echte Profiltrennung, OS-Keyring, Crash-Recovery, WebView2-Health-Check, RAM-Management, App-Sperre) sind größere **native** Eingriffe und folgen einzeln in eigenen, testbaren Schritten – bewusst nicht ungetestet im Bündel. Neue Ideen wurden in die Roadmap aufgenommen.

---

## [0.35.0] – 2026-05-31

### Geändert
- **Hintergrund-Streams jetzt in der Sidebar.** Die schwebende Leiste ist weg; stattdessen gibt es in der Sidebar einen **ausklappbaren Bereich „Im Hintergrund"** mit Anzahl-Zähler. Pro Stream: stummschalten 🔊/🔇, in den Vordergrund ▶, schließen ✕. Vorteil: Die Sidebar wird – anders als ein schwebendes Overlay – **nie vom eingebetteten Video überdeckt**, ist also auch auf der Stream-Seite erreichbar.

### Roadmap
- Frische Vorschläge ergänzt (u.a. Split-/Multi-View, Audio-Only-Modus, echte Profiltrennung, WebView2-Health-Check, App-Sperre beim Start).

---

## [0.34.1] – 2026-05-31

### Verbessert (Performance)
- **Lazy-Loading für Poster & Logos:** Bilder werden erst geladen, wenn sie ins Bild scrollen (`loading="lazy"`), und asynchron dekodiert (`decoding="async"`). Vor allem die **Anbieter-Logos** (auf jeder Karte) wurden bisher alle sofort geladen – jetzt baut sich die Übersicht spürbar schneller auf, besonders bei vielen Anbietern. *(Favicons werden wie bisher offline zwischengespeichert, sind also nach dem ersten Laden ohnehin sofort da.)*

---

## [0.34.0] – 2026-05-31

### Neu (aus der Roadmap)
- **Kategorie-Filter wird gemerkt:** Der zuletzt gewählte Filter in der Übersicht ist beim nächsten Start wieder aktiv. Hat die gemerkte Kategorie keine Anbieter, wird automatisch auf „Alle" zurückgesetzt.
- **Sleep-Timer-Schnellauswahl:** Knöpfe für **30 / 60 / 90 Minuten** direkt in den Einstellungen (zusätzlich zum Dropdown) – ein Klick statt Aufklappen.

### Hinweis
- Die Roadmap-Idee „Sleep-Timer bis Episodenende" wurde gestrichen: Über die eingebetteten Anbieter-Webviews lässt sich ein Episodenende technisch nicht zuverlässig erkennen.

---

## [0.33.1] – 2026-05-31

### Behoben
- **Vollbild ist jetzt echtes Vollbild.** Unten blieb ein Streifen (≈ Taskleistenhöhe) frei, weil das Stream-Webview mit `window.innerHeight` bemessen wurde – das stimmt während des Vollbild-Übergangs noch nicht. Jetzt wird die **echte Fenster-Innengröße von Tauri** verwendet und beim **tatsächlichen** Resize-Event des Fensters exakt nachpositioniert.

---

## [0.33.0] – 2026-05-31

### Neu – Mehrere Streams gleichzeitig (v.a. Twitch)
- **Mehrere Streams parallel:** Twitch (und andere) dürfen jetzt mehrfach laufen. Jeder Stream ist ein eigenes eingebettetes Webview.
- **„⤓ Hintergrund"-Knopf** auf der Stream-Seite: schiebt den laufenden Stream in den Hintergrund – er **läuft weiter** (Ton bleibt), während du einen anderen Anbieter startest.
- **Streams-Leiste** unten links: listet alle Hintergrund-Streams. Pro Stream: **stummschalten 🔊/🔇**, **in den Vordergrund ▶**, **schließen ✕**.
- **Einzeln stummschalten** über einen neuen Rust-Befehl, der im jeweiligen Webview die Video-/Audio-Elemente stummschaltet (inkl. Beobachter, falls der Player sein Video-Element austauscht).

### Wichtig
- Diese Funktion ist **nativ** und konnte nicht vorab getestet werden. Bitte im Build prüfen – besonders, ob versteckte Streams im Hintergrund **hörbar weiterlaufen** und ob das Stummschalten greift.

---

## [0.32.1] – 2026-05-31

### Behoben
- **Einstellungen laufen wieder flüssig.** Der `backdrop-filter`-Weichzeichner hinter dem Fenster wurde entfernt (er wurde bei jedem Schalter-Klick und beim Scrollen neu berechnet → Ruckeln). Zusätzlich ist der Inhaltsbereich jetzt als eigene Render-Ebene isoliert (`contain`), sodass Scrollen und Umschalten sauber sind.

---

## [0.32.0] – 2026-05-31

### Geändert
- **Suchverlauf nur bei aktiver Suche:** Die Chips „Zuletzt gesucht" erscheinen jetzt nur, wenn das Suchfeld den Fokus hat – sonst sind sie ausgeblendet.
- **„Weiterschauen" nur noch als Button:** Die Kachelreihe der zuletzt geöffneten Anbieter wurde entfernt; es bleibt der eine Fortsetzen-Button.
- **CR-Kalender nutzt die volle Breite** und hat eine Umschaltung **„Nächste 7 Tage" / „Letzte 7 Tage"** (zeigt auch bereits ausgestrahlte Folgen, neueste zuerst).

---

## [0.31.0] – 2026-05-31

### Geändert
- **„Verlauf"-Seite entfernt** (war unter Upcoming) – auf Wunsch wieder raus, Route gelöscht.
- **Suchverlauf in der Übersicht:** Unter der Suche erscheinen die zuletzt gesuchten Begriffe als Chips (Enter speichert einen Suchbegriff). Anklicken sucht erneut, einzeln entfernbar oder ganz leeren.
- **Mini-Player ist jetzt abschaltbar:** Schalter unter Einstellungen → Plugins. Aus = der Stream wird beim Verlassen der Stream-Seite ausgeblendet (kein Mini-Fenster).

---

## [0.30.0] – 2026-05-31

### Hinzugefügt
- **Mini-Player (Bild-in-Bild).** Verlässt man die Stream-Seite, ohne zu schließen (z.B. zurück zur Übersicht), läuft der Stream als kleines angedocktes Fenster unten rechts weiter. Oben dran eine schmale Leiste mit Anbietername, **Großansicht** (zurück zum Vollbild-Stream) und **Schließen**. „Schaut gerade" in der Seitenleiste bringt ebenfalls zurück.
- **Verlauf-Seite.** Neuer Eintrag „Verlauf" in der Seitenleiste: zeigt zuletzt geöffnete Titel/Anbieter mit Zeitangabe („vor 5 Min"), zum Wiederöffnen anklicken, einzeln entfernen oder den ganzen Verlauf leeren.

### Hinweis
- Der Mini-Player nutzt das native Stream-Webview (wird nur verschoben/verkleinert, nicht neu geladen) – bitte im Build prüfen, ob er beim Tab-Wechsel sauber unten rechts andockt.

---

## [0.29.0] – 2026-05-31

### Geändert
- **Einstellungsfenster größer** (bis 1180×800) und weiter aufgehübscht: luftigere Abstände, größere Überschrift, dezenter Hover auf den Karten.
- **Roadmap wird ab jetzt automatisch gepflegt:** erledigte Punkte werden markiert und neue Vorschläge pro Version eingetragen. `ROADMAP.md` auf Stand v0.28.0 gebracht (Vollbild, GPU-Schalter, Einstellungen u.a. als erledigt) + neue Ideenliste ergänzt.

---

## [0.28.0] – 2026-05-31

### Hinzugefügt
- **Versteckte Wiederherstellung für den Admin-PIN.** Tippt man im Einstellungen-Tab „Profile" eine geheime Zeichenfolge, wird der Admin-Code sofort zurückgesetzt (Notfall, falls vergessen). Während des Tippens ist nichts sichtbar; die Kombination wirkt nur in diesem Tab. Danach lässt sich unten ein neuer Admin-Code setzen.

---

## [0.27.0] – 2026-05-31

### Geändert
- **Einstellungen optisch überarbeitet (#6).** Durchgängiger Feinschliff in allen Tabs: echte **Schalter** (statt Häkchen), **Slider** mit eigenem Regler, eigene **Auswahl-Pfeile**, Fokus-Ringe in Akzentfarbe, sanftes Einblenden des Fensters, Akzent-Logo + leichter Verlauf in der Seitenleiste und ein runder Schließen-Knopf.
- **Vollbild unten randlos (#1).** Der Streifen am unteren Rand (wo die Taskleiste wäre) ist weg – das Webview wird nach dem Vollbild-Übergang mehrfach nachpositioniert, bis die Fenstergröße final ist.

---

## [0.26.0] – 2026-05-31

### Geändert / Hinzugefügt
- **Randloses Vollbild (#1/#3).** Im Vollbild füllt das Stream-Video jetzt das ganze Fenster – auch über die obere Leiste hinweg, oben wie unten randlos.
- **Leiste per Maus einblenden.** Maus an den oberen Bildschirmrand schieben → die Leiste (mit „Vollbild beenden"/„Schließen") fährt von oben ein und bleibt, solange die Maus darüber ist. Sonst bleibt sie unsichtbar.
- **Esc beendet das Vollbild.** Über einen globalen Tastenkürzel (neues Plugin `global-shortcut`), da der Stream den Tastatur-Fokus hat. Esc wird nur während des Vollbilds registriert und danach wieder freigegeben.

### Technisch
- Neues Plugin `tauri-plugin-global-shortcut` (+ JS-Paket) und Berechtigungen `global-shortcut:register/unregister/is-registered`.
- Vollbild lässt einen 2px-Streifen oben frei – nötig, damit OmniSight die Maus am oberen Rand erkennt (Alternative wäre, der Streaming-Seite Tauri-Zugriff zu geben – das wäre unsicher).

---

## [0.25.0] – 2026-05-31

### Hinzugefügt
- **Vollbild für Streams (#3).** Neuer „⛶ Vollbild"-Knopf in der Stream-Leiste: blendet Titelleiste + Seitenleiste aus, zieht das eingebettete Webview auf die ganze Fläche und setzt das Fenster in den OS-Vollbild. Beenden über „⤡ Vollbild beenden" in der schmalen oberen Leiste, die sichtbar/anklickbar bleibt (sie liegt über dem Webview). Beim Schließen des Streams wird der Vollbildmodus automatisch verlassen.
- **Hardware-Beschleunigung an/aus (#4).** Neuer Schalter unter Einstellungen → Plugins. Schaltet die GPU-Nutzung der gesamten App. Greift beim **nächsten Start** (WebView2 liest das Startargument beim Anlegen); ein „App jetzt neu starten"-Knopf ist direkt dabei.

### Technisch
- `dragDropEnabled: false` bleibt aktiv (HTML5-DnD).
- Neue Fenster-Berechtigungen: `set-fullscreen`, `is-fullscreen`.
- Rust liest die GPU-Einstellung vor dem Fensterstart aus `omnihub.json` und setzt bei Bedarf `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--disable-gpu` (sicherer Standard: bei Lesefehler bleibt GPU an).

---

## [0.24.0] – 2026-05-31

### Behoben
- **Drag & Drop der Anbieterkarten funktioniert wieder (#5).** Ursache: Das native Drag&Drop des Fensters fing die Maus-Events ab und blockierte das HTML5-Ziehen (bekanntes WebView2-Verhalten unter Windows). Über `dragDropEnabled: false` in der Fenster-Konfiguration ist das jetzt freigegeben – das Ziehen der ganzen Karte klappt damit in Übersicht und Favoriten.
- **Einstellungen erscheinen jetzt vor dem Stream (#2).** Beim Öffnen der Einstellungen wird der eingebettete Stream (natives Webview, liegt über dem HTML) kurz ausgeblendet und nach dem Schließen automatisch wieder eingeblendet.

### Geändert
- **Sleep-Timer-Countdown in der Seitenleiste (#1).** Der Countdown sitzt jetzt unten in der Seitenleiste – ein Bereich, der nie vom Stream-Webview verdeckt wird, also auch während eines laufenden Streams sichtbar bleibt. Klick bricht den Timer weiterhin ab.
- **Roadmap erweitert (#7):** neue Vorschläge zu Technik, Sicherheit, Funktionen und UI.

### Hinweis
- Vollbild für Streams (#3) und Hardware-Beschleunigung umschalten (#4) erfordern native Anpassungen (Rust/Fenster) und sind als nächste Schritte in der Roadmap eingetragen. Die optische Überarbeitung der Einstellungen (#6) folgt als eigener Schritt.

---

## [0.23.0] – 2026-05-30

### Hinzugefügt
- **Sichtbarer Sleep-Timer-Countdown:** Läuft der Sleep-Timer, erscheint unten rechts eine Anzeige (😴 mm:ss bzw. h:mm:ss), die jede Sekunde herunterzählt. Ein Klick darauf bricht den Timer ab. Funktioniert unabhängig davon, ob die Uhr eingeblendet ist.

---

## [0.22.0] – 2026-05-30

### Hinzugefügt
- **Kategorie-Filter in der Übersicht:** Über der Anbieter-Liste gibt es jetzt Filter-Chips (Alle · Filme & Serien · Anime · Live-TV · Mediatheken · Sport · Musik · Video · Eigene). Ein Klick zeigt nur die passende Kategorie. Es erscheinen nur Kategorien, die auch Anbieter haben. Drag & Drop bleibt dabei korrekt – die globale Reihenfolge wird durch das Filtern nicht durcheinandergebracht.

---

## [0.21.3] – 2026-05-30

### Hinzugefügt
- **Favoriten-Reihe per Drag & Drop sortierbar:** Die ⭐-Favoriten lassen sich jetzt genauso per Ziehen umsortieren wie die Übersicht. Die Reihenfolge wird pro Profil gespeichert. (Favoriten folgen jetzt deiner eigenen Reihenfolge statt der Katalog-Reihenfolge.)

---

## [0.21.2] – 2026-05-30

### Geändert
- **Anbieterkarten per Drag & Drop verschieben:** In der Übersicht lässt sich jetzt die **ganze Karte** ziehen (statt nur ein kleiner Griff) – in Raster- und Listenansicht. Das Ziel wird beim Ziehen mit einem gestrichelten Rahmen hervorgehoben. Klicken zum Öffnen funktioniert weiterhin.

---

## [0.21.1] – 2026-05-30

### Geändert
- **„Weiterschauen" jetzt pro Profil:** Jedes Profil hat seine eigene Liste (wie die Watchlist).
- **Kacheln deutlich kleiner**, damit die Reihe kompakter ist.
- **„Weiterschauen"-Kopf ist jetzt ein Knopf:** Ein Klick öffnet sofort den **zuletzt gesehenen Titel** (zeigt dessen Namen). Die Kacheln darunter bleiben für ältere Einträge.

---

## [0.21.0] – 2026-05-30

### Hinzugefügt
- **„Weiterschauen" auf der Startseite:** Zuletzt geöffnete Titel und Anbieter erscheinen oben als Poster-Kacheln. Ein Klick öffnet **genau dort wieder** (gleiche Anbieter-URL, geteilte Anmeldung). Titel zeigen ihr Poster, Einträge lassen sich per × entfernen. Wird über „Einstellungen → Plugins → Weiterschauen" ein-/ausgeschaltet.
- Beim Öffnen eines Titels (Hero-Anbieterlogo oder Info-Fenster) wird jetzt sein **Poster** mitgespeichert, damit „Weiterschauen" hübsch aussieht.

### Geändert
- Die bisherige einfache „Zuletzt geöffnet"-Leiste wurde durch „Weiterschauen" ersetzt (merkt sich jetzt auch einzelne Titel, nicht nur Anbieter).

---

## [0.20.0] – 2026-05-30

### Hinzugefügt
- **Anbieter-Logos im Hero:** Neuigkeiten/Upcoming zeigen jetzt unter der Beschreibung, **wo der Titel läuft** (bis zu 6 Logos). Ein Klick öffnet den Anbieter direkt in OmniSight (Titel-Suche, geteilte Anmeldung – wie im Info-Fenster). Die Anbieter werden pro Titel nachgeladen und zwischengespeichert.

### Intern
- Die „Wo läuft das"-Logik liegt jetzt in einem gemeinsamen Modul `watchProviders.ts`, das Hero und Titel-Info-Fenster gemeinsam nutzen (eine Quelle statt doppeltem Code).

---

## [0.19.1] – 2026-05-30

### Geändert
- **Hero-Bilder in maximaler Qualität:** Die Hintergrundbilder in Neuigkeiten/Upcoming laden jetzt in `original` statt `w1280` – schärfstmöglich.
- **Onboarding-Neustart:** „Einstellungen → Mehr → Onboarding starten" **schließt jetzt die Einstellungen** und startet das Onboarding sofort wieder – immer von Schritt 1.

---

## [0.19.0] – 2026-05-30

### Geändert
- **Einstellungen optisch überarbeitet:** Die **Schieberegler** (Schriftgröße, Eckenradius, Sidebar-Breite usw.) und Checkboxen sind jetzt in der **Akzentfarbe**. Einstellungskarten haben einen Hover-Effekt, der aktive Tab eine Akzent-Markierung.
- **„Mehr"-Menü komplett neu gestaltet:** Mit einem Info-Kopf (App + Version), klar gruppierten Bereichen (Updates, Daten & Ansicht, Hilfe) und übersichtlichen Optionskarten mit Symbol, Beschreibung und Knopf.
- **Bessere Hero-Bildqualität in Neuigkeiten/Upcoming:** Die großen Hintergrundbilder werden jetzt in `w1280` statt `w780` geladen – deutlich schärfer.

---

## [0.18.3] – 2026-05-30

### Hinzugefügt
- **„Merken"-Knopf direkt im Hero:** Neben „Details ansehen" lässt sich der aktuelle Titel mit einem Klick zur Watchlist hinzufügen bzw. wieder entfernen (zeigt „✓ Gemerkt").

### Geändert
- **Auto-Wechsel startet nach Klick automatisch wieder:** Nach einem Klick (Pfeile, Poster, Punkte, Hero, Merken) pausiert der Wechsel und läuft **nach 10 Sekunden** von selbst weiter – aber nur, wenn **kein Titel-Info-Fenster** offen ist.
- **Scrollbalken unter dem Poster-Streifen entfernt** (das Blättern per Pfeilen/Punkten/Auto-Wechsel bleibt erhalten).

---

## [0.18.2] – 2026-05-30

### Hinzugefügt
- **Mehr Infos im Hero:** Neuigkeiten/Upcoming zeigen unten links jetzt **Titel**, **Bewertung** (★), **Jahr & Typ** sowie eine **Kurzbeschreibung** (3 Zeilen) des aktuellen Titels – mit sanftem Einblenden beim Wechsel. Ein **„Details ansehen"**-Knopf öffnet die vollen Infos.

---

## [0.18.1] – 2026-05-30

### Hinzugefügt
- **Automatischer Wechsel im Hero:** Neuigkeiten/Upcoming blättern alle 7 Sekunden von selbst zum nächsten Titel. **Sobald du klickst** (Pfeile, Poster, Punkte oder Hero) oder ein Fenster offen ist, **pausiert** der Wechsel. Beim Wechsel der Tabs/Modi startet er wieder.

### Behoben
- **Alle Poster-Karten sind jetzt exakt gleich groß.** Die Kachel ist eine feste 2:3-Box, in die das Poster gefüllt wird – unterschiedliche Bildgrößen wirken sich nicht mehr aus.

---

## [0.18.0] – 2026-05-30

### Geändert
- **Neuigkeiten & Upcoming komplett neu gestaltet** (im Stil der Vorlage): großer **Hero** mit dem Backdrop des aktuellen Titels, Titel mittig in der Kopfzeile, **‹ ›-Pfeile** zum Blättern, darunter ein **Poster-Streifen** mit Titel + Jahr und **Punkten** zur Navigation. Klick auf den Hero öffnet die Titel-Infos.
- **Tabs Filme / Serien / Anime** und (bei Neuigkeiten) Umschalter **Trending / Neu**. „Anime" nutzt japanische Animationsserien von TMDB.

### Hinzugefügt
- **Titel ausblenden:** Über das durchgestrichene Auge auf einer Poster-Karte verschwindet ein Titel aus der Liste.
- **Auge-Button oben rechts** öffnet ein Fenster mit allen ausgeblendeten Filmen/Serien/Anime – dort lässt sich jeder Titel wieder **einblenden** (oder per Klick die Infos öffnen). Die Auswahl wird gespeichert.

### Technik
- Neuer flexibler Rust-Befehl `tmdb_list(path, params, mediaFallback)` für beliebige TMDB-Listen (Trending/Neu/Discover je Kategorie), neuer Speicher `hidden.ts`, neue Komponenten `MediaBrowser.svelte` und `HiddenTitlesModal.svelte`.

---

## [0.17.0] – 2026-05-30

### Hinzugefügt
- **Favicons werden offline zwischengespeichert.** Jedes Favicon wird einmal über das Backend geholt, als **Daten-URL** gespeichert (localStorage + App-Speicher) und danach **auch offline** angezeigt – kein erneuter Netzwerkabruf nötig.
- **Kartenfarbe passt sich dem Logo an.** Aus dem zwischengespeicherten Favicon wird die **dominante Farbe** ausgelesen und als Kartenfarbe verwendet. So matcht die Karte das Logo. **Nie weiße Karten** – zu helle Farben werden automatisch abgedunkelt. Eine im Karteneditor **manuell gewählte Farbe** hat immer Vorrang und wird nie überschrieben.

### Technik
- Neuer Rust-Befehl `fetch_favicon` (holt das Favicon und liefert es als Base64-Daten-URL), neue Abhängigkeit `base64`.
- Neuer Farb-Speicher `favicons.ts` (Cache + Canvas-Farbanalyse) und Helfer `providerVisual.ts`.

---

## [0.16.1] – 2026-05-29

### Hinzugefügt
- **Favicon-Fallback für Anbieter ohne eigenes Logo:** Anbieter ohne gebündeltes Marken-Logo (z.B. Prime Video, Disney+, ARTE, Joyn, WOW …) zeigen jetzt automatisch das **Favicon ihrer Website** (aus der Anbieter-URL abgeleitet) auf einem hellen Icon-Hintergrund. Reihenfolge: eigenes Bild → gebündeltes SVG → Favicon → Buchstabe (nur falls offline/kein Favicon). Gilt auch für selbst hinzugefügte Anbieter.

---

## [0.16.0] – 2026-05-29

### Hinzugefügt
- **Echte Anbieter-Logos** statt Buchstaben: 15 Marken-Logos (Netflix, Apple TV+, Paramount+, MUBI, Sky, MagentaTV, Crunchyroll, Twitch, DAZN, YouTube, Spotify, ARD, ZDF, RTL+, Max) sind als **gebündelte SVGs** (Quelle: Simple Icons, CC0) fest in der App – **offline verfügbar**, scharf und einheitlich, weiß auf der Marken-Farbe.
- Anbieter ohne hinterlegtes Logo (z.B. Prime Video, Disney+ – von Simple Icons nicht mehr angeboten, sowie einige deutsche Sender) behalten ihr **Text-Logo**. Für diese kannst du über den **Stift auf der Kachel → Logo hochladen** jederzeit ein eigenes Bild setzen.

### Behoben
- Im Titel-Info-Fenster wurden bei einigen Anbietern (Prime Video, Disney+, Apple TV+, Paramount+, RTL+, MagentaTV) die **falschen internen IDs** verwendet – dadurch wird die **Anmelde-Sitzung** jetzt korrekt mit der jeweiligen Kachel geteilt.

---

## [0.15.2] – 2026-05-29

### Hinzugefügt
- **Anbieter im Titel-Info-Fenster sind jetzt anklickbar.** Ein Klick auf ein Anbieter-Logo öffnet den Anbieter **in OmniSight** – bei großen Anbietern (Netflix, Prime, Disney+, Crunchyroll, Apple TV+, RTL+, Joyn, Paramount+, YouTube) direkt mit **dem Titel in der Suche**, sonst die JustWatch-Seite des Titels. Die Anmelde-Sitzung wird mit der jeweiligen Anbieter-Kachel geteilt, du bleibst also eingeloggt.

> Hinweis: Einen garantierten Direkt-Link zur exakten Titelseite liefert TMDB nicht – daher die Anbieter-Suche bzw. JustWatch als bestmögliche Annäherung.

---

## [0.15.1] – 2026-05-29

### Hinzugefügt
- **Watchlist: Sortieren & Filtern.** Auf der „Gemerkt"-Seite gibt es jetzt:
  - **Typ-Filter** (Alle / Filme / Serien),
  - **Sortierung** (zuletzt/zuerst hinzugefügt, Titel A–Z / Z–A, Erscheinungsdatum neu→alt / alt→neu),
  - eine **Suche** innerhalb der Watchlist.
  Bei leerem Ergebnis gibt es einen „Filter zurücksetzen"-Knopf.

---

## [0.15.0] – 2026-05-29

### Hinzugefügt
- **Titel-Info-Fenster jetzt auch bei „Gemerkt":** Klick auf Poster oder Titel in der Watchlist öffnet das Info-Fenster (Beschreibung, Trailer, „Wo streamen", Merken/Entfernen). Fehlende Felder (Backdrop, Bewertung, Laufzeit) werden automatisch aus den TMDB-Details nachgeladen.
- **Watchlist Import/Export (Punkt 19):** Auf der „Gemerkt"-Seite zwei Knöpfe – **Export** speichert die Liste als `omnihub-watchlist.json`, **Import** lädt eine solche Datei und fügt neue Titel hinzu (Duplikate werden übersprungen). Läuft komplett im Programm, ohne Zusatzrechte.

### Hinweis zu VPN & WideVine (Punkt 19)
- **VPN:** Ein echtes VPN lässt sich nicht sinnvoll/sicher in die App einbauen (Systemebene, Treiber, erhöhte Rechte). Empfehlung: separate VPN-App nutzen.
- **WideVine/DRM:** Die System-WebView (WebView2) enthält **kein WideVine** – DRM-geschützte Inhalte (z.B. Netflix in HD, Disney+) spielen daher in der App ggf. nicht ab. Das gilt eingebettet wie im Fenster-Modus. Im normalen Browser/den offiziellen Apps ist WideVine vorhanden; WideVine lässt sich nicht in die App integrieren.

---

## [0.14.0] – 2026-05-29

### Hinzugefügt
- **Titel-Info-Fenster (TMDB):** Klick auf einen Titel in **Suche**, **Neuigkeiten** oder **Upcoming** öffnet ein Info-Fenster mit **Poster/Backdrop, Beschreibung, Genre, Bewertung, Laufzeit/Jahr**, eingebettetem **Trailer** (YouTube) und **„Wo streamen" (DE)** mit Anbieter-Logos (Daten: JustWatch via TMDB). Direkt im Fenster lässt sich der Titel **merken/entfernen**.
  - Nutzt das vorhandene `tmdb_details` (mit `videos` + `watch/providers`). Klick auf Karten öffnet nun das Fenster statt sofort zu merken; das Merken passiert im Fenster.

---

## [0.13.1] – 2026-05-29

### Geändert
- **CR-Kalender optisch überarbeitet:** Poster-Karten in einem Raster, deutlich klarere Tages-Überschriften (mit Hervorhebung von „Heute"), Crunchyroll-orange Akzente, Hover-Effekte, gestaffeltes Einblenden und Skeleton-Ladeanzeige.
- **„Auf Crunchyroll" öffnet jetzt IN-APP** statt im externen Browser: Der Titel wird über dieselbe Stream-Mechanik wie Anbieter geöffnet und nutzt die bestehende Crunchyroll-Anmeldung mit. (Eingebettet bzw. – je nach Einstellung unter Design → „Anbieter öffnen als" – im eigenen Fenster.)

---

## [0.13.0] – 2026-05-29

### Hinzugefügt
- **Crunchyroll-Kalender (Punkt 9):** Die Seite „CR Kalender" zeigt jetzt den **Anime-Ausstrahlungsplan der nächsten 7 Tage**, gruppiert nach Tag (Heute/Morgen/Wochentag) mit Cover, Episode und Uhrzeit. Titel auf Crunchyroll sind markiert und direkt verlinkt. Filter **„Nur Crunchyroll"** (Standard an) – ausschaltbar, um alle anstehenden Anime zu sehen.
  - Datenquelle: **offene AniList-GraphQL-API** (kein Schlüssel nötig), da Crunchyroll keine offene API hat. Backend-Command `anilist_schedule` (reqwest, wie TMDB).

> Hinweis: Die Crunchyroll-Markierung stammt aus AniList-Daten und kann unvollständig sein. Der neue Rust-Command ist – wie TMDB – simpel gehalten, aber erst nach deinem Build endgültig bestätigt.

---

## [0.12.2] – 2026-05-29

### Geändert
- **Eingebaute OmniSight-Discord-Kennung hinterlegt.** Der Discord-Status funktioniert jetzt mit einem **einzigen Schalter** – keine Eingabe nötig. (Eine eigene Application-ID unter „Erweitert" hat weiterhin Vorrang.)

---

## [0.12.1] – 2026-05-29

### Geändert
- **Discord-Status ohne Code-Eingabe vorbereitet:** Es gibt jetzt einen Platz für eine **eingebaute OmniSight-Discord-Kennung**. Sobald diese hinterlegt ist, müssen Nutzer im Discord-Modul **nichts mehr eintragen** – einfach einschalten. Die eigene Application-ID ist nur noch eine **optionale „Erweitert"-Einstellung**. Klarstellung in der App: Es ist **kein Discord-Login** nötig, es nutzt die laufende Discord-App.

---

## [0.12.0] – 2026-05-29

### Hinzugefügt
- **Discord-Status (Rich Presence) als Plugin-Modul:** Im „Plugins"-Tab aktivierbar. Bei aktivem Stream zeigt Discord „Schaut <Anbieter>", sonst „Durchstöbert OmniSight". Voraussetzung: laufende Discord-App + eigene **Discord-Application-ID** (Client-ID), die im Plugins-Tab eingetragen wird.
  - Rust-Backend via Crate `discord-rich-presence` 1.1.0 mit Commands `discord_connect/set_activity/clear/disconnect` (lokale Discord-IPC).
  - Frontend-Modul aktualisiert die Anzeige automatisch beim Wechsel des Streams.

> Hinweis: Der Rust-Teil konnte lokal nicht kompiliert werden – bitte über GitHub Actions bauen. Bei Build-Fehlern Meldung schicken, dann nachbessern.

---

## [0.11.0] – 2026-05-29

### Hinzugefügt
- **Plugin-/Modul-System (Punkt 18):** Der „Plugins"-Tab ist jetzt funktional – eingebaute Zusatzfunktionen lassen sich an-/ausschalten:
  - **Weiterschauen:** blendet die „Zuletzt geöffnet"-Reihe auf der Startseite ein/aus.
  - **Sleep-Timer:** zeigt nach 15/30/60/90/120 Min einen Hinweis und schließt optional den laufenden Stream.

### Hinweis (ehrlich)
- **Echte Browser-Erweiterungen** (AdBlock, Buster usw.) lassen sich technisch **nicht** installieren: OmniSight nutzt die System-WebView (Edge/WebView2), nicht Chrome – Tauri bietet dafür keine Schnittstelle. **Captcha-Solver** werden bewusst nicht angeboten. Der Plugins-Tab weist darauf hin.
- Weitere Module wie **Discord-Status** sind möglich, brauchen aber eine zusätzliche (Rust-)Integration – auf Wunsch als Nächstes.

---

## [0.10.2] – 2026-05-29

### Behoben (wichtig)
- **Absturz beim Start behoben** (`Cannot read properties of undefined (reading 'getContext')`): Die Partikel-Komponente hat beim Start auf das Canvas zugegriffen, obwohl es (bei Partikel-Standard „aus") noch nicht existierte. Das löste einen „Uncaught"-Fehler aus, der den App-Aufbau stören konnte. Die Partikel-Logik läuft jetzt erst, **wenn das Canvas wirklich da ist**, und startet/stoppt sauber beim Ein-/Ausschalten. Dieser Fehler war ein heißer Kandidat dafür, dass auch **eingebettete Streams** und andere Abläufe gehakt haben.

---

## [0.10.1] – 2026-05-29

### Behoben / Geändert
- **(2/8) F12-Konsole aktiviert:** Die DevTools sind jetzt auch im fertigen Build verfügbar (Cargo-Feature `devtools`). Nach dem Neubau öffnest du sie mit **F12** oder **Rechtsklick → „Untersuchen"**.
- **(4) Admin-Code-Schutz:** Zum **Ändern/Entfernen** des Admin-Codes muss jetzt zuerst der **alte Admin-Code** eingegeben werden.
- **(6) Haupt-Profil nur per Admin-Code:** Das Haupt-Profil lässt sich nur noch nach Eingabe des Admin-Codes wechseln (sofern einer gesetzt ist).
- **(5) „Profil hinzufügen"** verschwindet jetzt komplett, sobald 5 Profile existieren (statt nur ausgegraut).
- **(7) Uhr Digital/Analog** wechselt jetzt zuverlässig (Umschalter schreibt den Wert nun korrekt zurück).

### Auf der Roadmap
- **(3)** Eingebettete Anbieter öffnen nicht – wird mit der nun verfügbaren F12-Konsole gezielt analysiert.

---

## [0.10.0] – 2026-05-29

### Hinzugefügt
- **Profileditor (Punkt 15):** Im Tab *Profile* lassen sich Profile anlegen, umbenennen, löschen und mit PIN schützen – und neu:
  - **Haupt-Profil selbst wählbar** (★). Es ist **nicht löschbar** und dient als „Anker".
  - **Separater Admin-Code** (frei wählbar, unabhängig von den Profil-PINs).
  - **„PIN vergessen?"** – einen vergessenen Profil-PIN über den Admin-Code zurücksetzen.

### Geändert / Behoben
- **(1) Eingebettete Anbieter:** Da das Einbetten auf einer experimentellen Tauri-Funktion beruht, die sich nicht zuverlässig prüfen lässt, ist **„Eigenes Fenster" jetzt Standard** (funktioniert verlässlich). „Eingebettet" bleibt als Option wählbar.
- **(2) Desktop-Icon:** Der komplette Icon-Satz (inkl. `icon.ico` in allen Größen) wurde **frisch aus dem App-Logo** erzeugt; nicht benötigte Android-/iOS-Icon-Ordner wurden entfernt.

> Hinweis zum Icon: Falls auf dem Desktop weiterhin ein altes Icon erscheint, liegt das am **Windows-Icon-Cache** einer früheren Installation (siehe Antwort, wie man das löst).

---

## [0.9.1] – 2026-05-29

### Behoben
- **Build/Signatur-Fehler** („failed to decode secret key … Missing comment in secret key"): Der Updater-Schlüssel hatte ein **Passwort**, und ein falsch gesetztes/leeres Passwort-Secret ließ die Signatur fehlschlagen. Es wurde ein **neues, passwortloses Schlüsselpaar** erzeugt (Signatur wurde lokal erfolgreich getestet). Der öffentliche Schlüssel in der App ist aktualisiert; das Passwort-Secret wird nicht mehr benötigt.

> Wichtig: Da bisher noch **kein** signierter Release veröffentlicht wurde, ist der Schlüsseltausch unkritisch – es gibt keine alten, anders signierten Installationen.

---

## [0.9.0] – 2026-05-29

### Hinzugefügt
- **Karten-Editor (Punkt 4):** Über das Stift-Symbol auf jeder Anbieterkarte lässt sich jetzt alles bearbeiten – **Name, Untertitel, URL, Farbe, 2. Farbe (Verlauf), Qualität und ein eigenes Logo-Bild**. Funktioniert für eigene **und** für Standard-Anbieter; Standard-Karten lassen sich per Knopf wieder „Auf Standard zurücksetzen". Mit Live-Vorschau des Logos.
- **Eigene Logo-Bilder:** Karten können jetzt ein hochgeladenes Bild als rundes Logo zeigen (sonst weiterhin das farbige Buchstaben-Logo).

### Geändert
- Bearbeitungen an **Standard-Anbietern bleiben erhalten** (werden gespeichert und beim Start wiederhergestellt; neue Felder künftiger Versionen werden weiterhin ergänzt).

---

## [0.8.1] – 2026-05-29

### Behoben
- **Update-Prüfung („Could not fetch a valid release JSON"):** In der Konfiguration fehlte `createUpdaterArtifacts`. Dadurch hat der Build nie eine `latest.json` erzeugt, die die App abfragen kann. Jetzt aktiviert – der nächste signierte Build legt `latest.json` an, und die Update-Suche funktioniert.
- **Profil bleibt erhalten (Start & Seitenwechsel):** Das aktive Profil und die Profilliste werden jetzt zusätzlich in einem zuverlässigen Sofort-Cache gespeichert und beim Start sicher wiederhergestellt. Der Start ist außerdem so abgesichert, dass ein Fehler in einem Schritt (z.B. Update-Prüfung) den Rest nicht mehr abbricht.
- **Klick auf Anbieterkarte öffnet wieder:** Das Drag&Drop aus v0.8.0 hatte den Klick „verschluckt". Jetzt gibt es einen kleinen **Greif-Punkt** (⠿, oben links bzw. links in der Liste) – nur der zieht zum Sortieren, der Rest der Karte öffnet wieder normal den Anbieter.

### Hinweis
Ob der eingebettete Stream danach erscheint, hängt weiterhin von der WebView-Einbettung ab (siehe Antwort: bitte „Eigenes Fenster" testen / Konsole prüfen).

---

## [0.8.0] – 2026-05-29

### Behoben
- **Anbieterkarten gleich groß:** „Alle Anbieter" sind jetzt genauso groß wie die Favoriten und füllen die volle Fensterbreite (kein Leerraum rechts mehr).
- **Partikel-Hintergrund** wird jetzt immer angezeigt (sobald aktiviert) – auf allen Seiten und auch hinter der Sidebar/Titelleiste. Die Größe wird zuverlässig anhand der Fenstergröße gesetzt.
- **Uhr:** wird wieder angezeigt; bei 100&nbsp;% Transparenz wird sie bewusst ausgeblendet. Im Uhr-Tab erscheint sie ganz vorne und ist per Maus verschiebbar.
- **Benachrichtigungscenter:** Klick auf die 🔔 öffnet jetzt ein Panel mit dem Verlauf der letzten Hinweise (mit „Leeren").
- **Neuigkeiten/Upcoming:** TMDB-Anfragen haben jetzt ein Zeitlimit (15&nbsp;s) – die Seite bleibt nicht mehr ewig auf „Lädt…" hängen, sondern zeigt im Fehlerfall einen Hinweis.

### Hinzugefügt
- **Karten per Drag & Drop sortieren:** Standard ist alphabetisch; eigene Reihenfolge wird automatisch pro Profil gespeichert. Button „A↓Z" stellt wieder alphabetisch her.
- **Hintergrundbild** in den Design-Einstellungen wählbar (inkl. Deckkraft-Regler und „Entfernen").
- **Design zurücksetzen**-Button (setzt alle Design-Optionen auf Standard).
- **Partikel-Optionen erweitert:** mehrere Formen gleichzeitig (Kreis/Quadrat/Dreieck/Stern), Größe einstellbar, Geschwindigkeit jetzt 0–1 in 0,1-Schritten.
- **Anbieter öffnen als** „Eingebettet" oder „Eigenes Fenster" (Sicherheits-Schalter, falls die Einbettung auf einem Gerät nicht klappt).
- **Einstellungen-Hinweis:** Beim Schließen der Einstellungen erscheint unten rechts „Einstellungen gespeichert".
- Erklärungen zu „Karten-Schatten" und „Animationen" direkt im Design-Tab; Animationen wirken jetzt deutlicher.

### Noch offen (kommt als Nächstes)
- Profileditor inkl. selbst wählbarem Haupt-Profil und separatem Admin-Code zum PIN-Zurücksetzen.
- Streams, die nach Klick nichts zeigen: bitte Stream-Modus testweise auf „Eigenes Fenster" stellen und Rückmeldung geben (Details in der Antwort).
- Crunchyroll-Kalender, Plugin-System, VPN/WideVine-Status.

---

## [0.7.0] – 2026-05-29

### Hinzugefügt
- **Echter In-App-Updater.** Beim Start (still) und auf Knopfdruck (Einstellungen → Mehr → „Nach Updates suchen") prüft die App gegen die GitHub-Releases. Gibt es eine neuere, signierte Version, erscheint oben ein **Banner** mit „Herunterladen & installieren" inkl. Fortschrittsbalken; danach startet die App automatisch neu.
- Signierte Updates über das Tauri-Updater-Plugin (Schlüsselpaar erzeugt, öffentlicher Schlüssel in der Konfiguration).

### Technisch
- Plugins `tauri-plugin-updater` und `tauri-plugin-process` ergänzt (Rust + JS) und Berechtigungen `updater:default` / `process:default` hinzugefügt.
- Release-Workflow signiert die Update-Artefakte und erzeugt `latest.json` (über GitHub-Secrets `TAURI_SIGNING_PRIVATE_KEY` / `…_PASSWORD`).

### Wichtig
- Die Secrets müssen **vor** dem Build von v0.7.0 in GitHub hinterlegt sein, sonst schlägt der Build fehl.
- Ein bereits installiertes v0.6.0 kann sich nicht selbst aktualisieren (hat noch keinen Updater). v0.7.0 einmalig manuell installieren – ab dann laufen Updates automatisch.

---

## [0.6.0] – 2026-05-29

### Hinzugefügt
- **Anbieter werden jetzt IM Hauptfenster angezeigt** (Punkt 8), als echtes eingebettetes Webview statt als zweites Fenster. Kein iframe – die „Verbindung verweigert"-Sperre greift also weiterhin nicht, und Logins bleiben pro Profil getrennt und erhalten.
- Stream-Ansicht mit Kopfleiste (Anbieter, Live-Streamzeit, „Schließen"); beim Verlassen der Seite wird das Webview ausgeblendet und beim Zurückkehren sofort wieder eingeblendet.
- **TMDB-Key eingetragen** – Suche, Neuigkeiten und Upcoming liefern jetzt Daten.
- Defensiver Fallback: Sollte das Einbetten auf einem System nicht funktionieren, öffnet sich automatisch wieder ein separates Fenster (App bleibt nutzbar).

### Technisch
- `unstable`-Feature des Tauri-Crates aktiviert (für eingebettete Webviews) und passende Webview-Berechtigungen ergänzt.

### Hinweis
- Das Einbetten ist eine native Windows/WebView2-Funktion und konnte hier nicht auf echtem Windows getestet werden; falls es klemmt, greift automatisch der Fenster-Fallback.

---

## [0.5.0] – 2026-05-29

Großer Funktionsblock aus der 17-Punkte-Liste.

### Hinzugefügt
- **50 Achievements** (statt 9), gestaffelt nach Streamzeit, gestarteten Streams, genutzten Anbietern, Favoriten und Watchlist.
- **In-App-Benachrichtigungen (Toasts).** Alle Push-Hinweise – inkl. Achievement-Freischaltung – erscheinen nur in der App, **nicht** mehr in den Windows-Benachrichtigungen.
- **Uhr-Overlay** wird angezeigt (digital oder analog, mit Farbe, Größe, Sekunden und Transparenz).
- **Partikel-Hintergrund** wird gerendert, mit Detailoptionen für Anzahl, Geschwindigkeit und Farbe.
- **„+ Anbieter"** öffnet einen Editor, um eigene Anbieter anzulegen (Name, URL, Beschreibung, Farbe, Qualität).
- **Raster-/Listenansicht** der Anbieter ist umschaltbar.
- Profilverwaltung: **PIN-Änderung fragt zuerst den alten PIN ab**; PIN entfernen ebenso geschützt.
- **ROADMAP.md** angelegt – hält alle 17 Wunsch-Punkte mit Status fest und wird laufend aktualisiert.

### Geändert
- **Favoriten verschwinden aus „Alle Anbieter"** und erscheinen dort erst wieder, wenn sie keine Favoriten mehr sind.
- **Glassmorphismus** sowie **Karten-Schatten, Hover-Zoom und Animationen** wirken jetzt tatsächlich.
- **Mehr Schriftarten** zur Auswahl; die gewählte Schrift gilt jetzt für **alle** Bedienelemente.
- **Alle Checkboxen** sehen als moderne Schalter aus.

### Noch offen (siehe ROADMAP.md)
- Titel-Info mit Trailer & Anbieter-Liste (5), Original-Logos (6), Hintergrundbild (13e), kompletter Profileditor + Admin-PIN-Reset (15b), komplette DE/EN-Übersetzung (13f), Anbieter in der App öffnen (8), CR-Kalender mit Login-Erkennung (9), „Account"-Tab mit aktiven Logins (14).

---

## [0.4.1] – 2026-05-29

### Behoben
- **Build schlug fehl** (`bundle > windows > nsis ... is not valid`). Der Lizenz-Pfad stand fälschlich unter `bundle.windows.nsis.license` – dieses Feld existiert dort nicht. Korrekt liegt er nun als **`bundle.licenseFile`** auf Bundle-Ebene; der NSIS-Installer zeigt die Lizenz-Seite weiterhin automatisch. Der Fehler steckte bereits seit v0.2.0 in der Konfiguration.
- Die komplette `tauri.conf.json` wird jetzt gegen das offizielle Tauri-Schema geprüft – aktuell **fehlerfrei**.

### Aufgeräumt
- Verwaiste Datei **`app-icon.png`** aus dem Projekt-Root entfernt (Überbleibsel des ersten Gerüsts, wurde nicht mehr verwendet).
- Leeren, ungenutzten Ordner `src/lib/i18n/` entfernt.

---

## [0.4.0] – 2026-05-29

Profiltrennung & getrennte Streaming-Logins.

### Hinzugefügt
- **Profile vollständig getrennt.** Jedes Profil hat eigene **Favoriten, Watchlist, „zuletzt geöffnet", Streamzeit und Achievements**. Beim Profilwechsel wird alles neu geladen.
- **Getrennte Logins beim Streamen.** Anbieter-Fenster nutzen pro Profil ein eigenes `dataDirectory` (Windows/WebView2) – Cookies und Anmeldungen sind dadurch je Profil getrennt und bleiben erhalten. Beim Wechsel werden die Fenster des vorherigen Profils geschlossen.
- **Profil-Wechsler** unten links in der Sidebar: Profil per Klick wechseln, **PIN-Abfrage** bei geschützten Profilen, Schnell-Hinzufügen.
- **Profilverwaltung** unter Einstellungen → Profile: anlegen (max. 5), umbenennen, löschen, **PIN setzen/ändern/entfernen** (SHA-256-Hash).

### Geändert
- **Favoriten** sind kein Anbieter-Flag mehr, sondern ein eigener, profilbezogener Datensatz.
- **Statistik** ist damit automatisch pro Profil.
- Mindestversion `@tauri-apps/api` auf 2.9.0 angehoben (für `dataDirectory`).

### Hinweise
- Streamzeit/Logins sind jetzt je Profil getrennt; die Anbieter-Liste (Katalog) und das App-Design bleiben global.
- Echte Marken-Logos, Karteneditor und CR-Kalender stehen weiterhin auf der Roadmap.

---

## [0.3.0] – 2026-05-29

Streamzeit-Tracking & Achievements.

### Hinzugefügt
- **Streamzeit-Tracking.** Solange ein Anbieter-Fenster offen ist, wird die Zeit gemessen – pro Anbieter und insgesamt. Ein 15-Sekunden-Heartbeat schreibt laufend fort (crash-sicher bis ~15 s), beim Schließen wird die letzte Teilzeit verbucht. Alles persistent gespeichert.
- **Achievements** schalten automatisch frei: Erstes Öffnen, 5 verschiedene Anbieter, 3/10 Favoriten, 5/20 Watchlist-Titel sowie 1/10/100 Stunden Streamzeit. Gesperrte Achievements zeigen einen **Fortschrittsbalken**.
- **Freischalt-Benachrichtigung** (einmalig je Achievement, abschaltbar unter Einstellungen → Benachrichtigungen).
- **Statistik-Seite überarbeitet**: echte Gesamtzeit, Anzahl gestarteter Streams, genutzte Anbieter sowie eine **Top-Liste der meistgenutzten Anbieter** mit Balken.
- **„Schaut gerade"-Seite** zeigt jetzt einen **Live-Timer** der laufenden Session inkl. bereits gespeicherter Zeit des Anbieters.

### Hinweise
- Streamzeit wird global gezählt (noch nicht je Profil getrennt – kommt mit der Profil-WebView-Trennung in v0.4).
- Läuft beim Beenden der App noch ein Fenster, geht höchstens die letzte angefangene 15-Sekunden-Spanne verloren.

### Roadmap (unverändert offen)
- **v0.3.x / v0.4**: echte Marken-SVG-Logos, Karteneditor für eigene Anbieter, Profiltrennung der WebViews (eigener `userDataDir`), optionale PIN-Verschlüsselung, Hintergrundbild-Auswahl, Watchlist-Import/-Export, Uhr-Overlay, CR-Kalender mit echten Daten, VPN-Status, Plugin-System.

---

## [0.2.0] – 2026-05-29

Großes Funktions- und Design-Update.

### Hinzugefügt
- **Persistenz.** Einstellungen, Profile, Favoriten, „zuletzt geöffnet" und die Watchlist werden über `tauri-plugin-store` dauerhaft gespeichert (`omnihub.json`) und beim Start automatisch geladen.
- **TMDB-Anbindung** (Rust-Command + Frontend-Wrapper): Multi-Suche, Trending (News) und Upcoming. Der API-Key wird in **einer Zeile** in `src-tauri/src/tmdb.rs` eingetragen (Anleitung im README). Unterstützt v3-Key und v4-Token automatisch.
- **Eigene Titelleiste** (OS-Rahmen entfernt): App-Branding links, Minimieren/Maximieren/Schließen rechts und ein **?-Button**, der die **Tastenkürzel-Übersicht** öffnet (F1, Strg+K, Strg+`,`, Strg+D, Esc).
- **Maximierter Erststart** + automatisches Merken von Fensterposition/-größe über `tauri-plugin-window-state`.
- **Onboarding** beim ersten Start (Profilname, Akzentfarbe, sichtbare Anbieter) – später über die Einstellungen erneut startbar.
- **Einstellungen als Modal** (statt eigener Seite), Layout im Stil des Screenshots: Tab-Sidebar links, Inhalt rechts, mit Tab-Suche.
- **Watchlist-Seite** voll funktionsfähig (Hinzufügen aus der Suche/News/Upcoming, Entfernen, „erscheint heute"-Banner).
- **News-/Upcoming-Seiten** mit TMDB-Daten und wechselndem, weichgezeichnetem Backdrop-Hintergrund.
- **Statistik-Seite** mit Live-Kennzahlen (Anbieter, Favoriten, Watchlist) und 8 Achievement-Kacheln.
- **CR-Kalender-Seite** als Platzhalter angelegt.
- **Favoriten & „Zuletzt geöffnet"** auf der Übersicht inkl. Lesezeichen-Button auf jeder Karte.

### Geändert / Behoben
- **„Anbieter hat die Verbindung verweigert" behoben.** Anbieter öffnen jetzt in einem echten **`WebviewWindow`** statt in einem `<iframe>`. Damit greifen `X-Frame-Options`/CSP-Sperren nicht mehr, und das native Edge-WebView beherrscht DRM (Netflix, Disney+ …).
- **Design-Überholung** nach Screenshot-Vorlage: Teal-Akzent (`#30c5bb`), **DM Sans** (offline gebündelt), große Anbieterkarten mit Marken-Verlauf, Qualitäts-Badge (4K/1080p/HD) und Logo.
- **Release-Workflow** veröffentlicht jetzt standardmäßig einen **echten Release**. Nur wenn beim manuellen Start die Option `draft` angehakt wird, entsteht ein Entwurf.
- Versionsnummern überall auf 0.2.0 angehoben.

### Bewusst NICHT übernommen
- **Burning Series, Cine.to, Movie2k** wurden erneut **nicht** als Standard-Anbieter aufgenommen (illegale Streaming-Portale). Die Funktion „eigenen Anbieter hinzufügen" bleibt davon unberührt.

### Noch offen (Roadmap)
- **v0.3**: echte Marken-SVG-Logos statt Buchstaben-Logos, Streamzeit-Tracking (schaltet Achievements frei), Karteneditor (eigene Anbieter anlegen/bearbeiten), Hintergrundbild-Auswahl, Watchlist-Import/-Export, Uhr-Overlay, CR-Kalender mit echten Daten.
- **v0.4**: Multi-Profil-Trennung der WebViews (eigener `userDataDir` je Profil), optionale PIN-Verschlüsselung der Profildaten, VPN-Status, Plugin-System.

---

## [0.1.1] – 2026-05-28

### Behoben
- **CI-Build lief nicht ohne lokale Vorarbeit.** Umgestellt auf `npm install` ohne Cache – die Lock-Datei wird auf dem Runner erzeugt. Es muss lokal nichts installiert werden.

### Hinzugefügt
- **App-Icons fertig im Repo**. Der Build benötigt keinen lokalen `tauri icon`-Aufruf mehr.
- Workflow liest die **Versionsnummer automatisch aus `package.json`**.

### Geändert
- Versionsnummer auf 0.1.1 angehoben; `Swatinem/rust-cache` korrekt geschrieben.

---

## [0.1.0] – 2026-05-28

### Hinzugefügt (Grundgerüst)
- Projektgerüst **Tauri v2 + SvelteKit + Tailwind v4**.
- Sidebar-Navigation, Übersicht mit Anbieter-Raster, 24 legale Standard-Anbieter.
- Einstellungen (6 Tabs), Stores (Settings/Profile/Provider), Tauri-Backend mit Plugins.
- GitHub-Actions-Release-Workflow.

### Bewusst NICHT übernommen
- Burning Series, Cine.to, Movie2k (illegale Portale).
