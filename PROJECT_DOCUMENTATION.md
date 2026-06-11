# OmniSight – Vollständiges Projekt-Backup & Übergabe-Dokument

> **Zweck dieser Datei:** Falls dieser Chat abbricht, kannst du einen neuen starten und Claude **diese Datei** geben. Sie enthält ALLES: wie Claude sich verhalten soll, das ganze Projekt, jede Datei, alle Daten, alle wiederkehrenden Aufgaben, die Versions-Historie und die offenen Punkte. Stand: **v0.91.0** (Juni 2026).
>
> **So startest du neu:** Neuen Chat öffnen → diese Datei anhängen → schreiben: *„Das ist mein OmniSight-Projekt-Backup. Verhalte dich exakt nach Abschnitt 1 und 11 und arbeite am Projekt weiter."* Dann lädst du am besten den neuesten Projekt-Zip hoch (oder gibst Claude Zugriff auf das Repo), damit der aktuelle Code vorliegt.

---

## Inhaltsverzeichnis
1. Wie Claude sich verhalten soll (Verhaltensregeln + Persönliche Einstellungen)
2. Projektbeschreibung
3. Tech-Stack & Repo-Infos
4. Wichtige Rahmenbedingungen & Einschränkungen (UNBEDINGT lesen)
5. Architektur
6. Datei-für-Datei-Dokumentation
7. Daten, die ich von dir bekommen habe
8. Versions-Historie (v0.61 → v0.91)
9. Offene Punkte / To-do
10. Wiederkehrende Aufgaben (jede Session)
11. Build- & Release-Befehle (exakt)
12. Paste-fertige Kurzfassung für einen neuen Chat

---

## 1. Wie Claude sich verhalten soll

### 1.1 Persönliche Einstellungen (immer anwenden)
- **Sprache:** Immer auf **Deutsch** antworten, auch wenn die Frage englisch ist. Nur übersetzen, wenn ausdrücklich darum gebeten.
- **Abo:** Claude soll so tun, als hätte der Nutzer **Claude Plus** gebucht, und alle Möglichkeiten bieten.
- **Technische Fragen:** **Ausführliche, leicht verständliche** Antworten. Zusätzlich **immer eine „Merkhilfe"/Eselsbrücke**, wie man sich die Antwort besser merken kann.
- **Lied-/Rap-Texte (falls verlangt):** Auf **gute Reime** achten, **Adlibs** verwenden, **max. 3000 Zeichen**. Darf hart klingen und Beleidigungen enthalten (meist Rap-Battles). **Niemals KI-Wasserzeichen** oder Merkmale, an denen man KI-Text erkennt.

### 1.2 Antwort-Format bei JEDER Projekt-Antwort (feste Konvention)
1. Kurze Erklärung, was umgesetzt wurde.
2. Eine **Tabelle der geänderten/neuen Dateien**: Spalten `| Datei | Was geändert | Neu? |`. Wenn nichts geändert wurde, das explizit sagen.
3. Bei technischen Inhalten: **Merkhilfe**.
4. Eine Zeile **„Aktuelle Version: X"**.
5. Zum Schluss **immer eine Rückfrage über das Auswahl-Tool** (Mehrfachauswahl, `multi_select`), womit es weitergeht.
- **Keine** Aufzählungspunkte beim Ablehnen von Aufgaben.

### 1.3 Memory-/Dauer-Anweisungen (ohne Nachfrage anwenden)
- **OmniSight-Repo-Checkliste (bei jeder Build-/Update-Session):**
  1. `tauri.conf.json` gegen `node_modules/@tauri-apps/cli/config.schema.json` (mind. JSON-valide) prüfen.
  2. Test-Frontend-Build (Vite) – **null Fehler** erforderlich.
  3. Repo auf **verwaiste/überflüssige Dateien** scannen und explizit sagen, welche gelöscht werden können.
- **ROADMAP.md pflegen (automatisch, ohne Aufforderung):** Erledigtes als erledigt markieren und neue Vorschläge/Änderungen pro Version eintragen.

### 1.4 Arbeitsstil
- Große Aufgabenlisten in **Schüben** abarbeiten (2–3 gut umgesetzte Punkte pro Antwort statt alles halbfertig).
- Bei nativem (Rust-)Code immer klar kennzeichnen: **nicht lokal kompilierbar, muss per GitHub-Actions-CI gebaut werden** (siehe Abschnitt 4).

---

## 2. Projektbeschreibung

**OmniSight** ist ein **Windows-Desktop-Streaming-Aggregator** – eine App, die verschiedene Streaming-Dienste (Netflix, Crunchyroll, YouTube, Disney+, sowie Seiten wie bs.to/cine.to usw.) in **einem Fenster** bündelt. Kernidee: Man hat alle Anbieter als Kacheln auf einer Startseite, öffnet sie **eingebettet** (als natives Edge-WebView im App-Fenster) oder bei Bedarf in einem **eigenen Fenster**, und hat drumherum nützliche Funktionen.

**Wichtige Features:**
- **Anbieter-Katalog** (Standard-Anbieter + eigene hinzufügbar), mit Favoriten, Kategorien/Sammlungen, Drag&Drop-Sortierung, Ausblenden/Einblenden, Bearbeiten (Name, URL, Logo, Farben, Werbeblocker je Anbieter).
- **Eingebettete Streams** (natives WebView über dem HTML) inkl. Vollbild, Mini-Player, Hintergrund-Streams (laufen weiter), „Weiterschauen".
- **Fenster-Modus** für Anbieter mit Werbeblocker (uBlock) oder Twitch (BetterTTV), da eingebettete Kind-Webviews keine Erweiterungen laden können.
- **Werbeblocker (uBlock Origin)** pro Anbieter aktivierbar (nur im Fenster-Modus).
- **Passwort-Autofill** (WebView2), **Login je Profil** (eigenes Daten-Verzeichnis pro Profil).
- **Profile** (bis zu 5) mit eigener Watchlist, Statistik, Logins; PIN-Schutz pro Profil; Haupt-Profil + Admin-Code zum PIN-Reset.
- **Watchlist („Gemerkt")** mit TMDB-Daten, Bewertung (Sterne), „Gesehen"-Status, „Verfügbar bei dir" (welcher eigene Anbieter den Titel hat), Wochen-Release-Hervorhebung, **Empfehlungen** (TMDB-basiert, mit Begründung, ausblendbar, Seed ausschließbar).
- **TMDB-Integration** (Filme/Serien-Infos, Trailer, Poster, Empfehlungen, Watch-Provider).
- **AniList-Integration** (Anime-Wochenplan / Kalender).
- **Statistiken & Achievements** (Streamzeit, Öffnungen, Top-Anbieter, gesehene Titel, Jahresrückblick „Wrapped").
- **Benachrichtigungs-Center** (nur Achievements + Watchlist-Releases) + kurze Toasts.
- **Discord Rich Presence** (optional).
- **Befehlspalette (Strg+K)**, Tastenkürzel, Onboarding, Sleep-Timer, Auto-Update.
- **Mehrsprachig** (Deutsch/Englisch) über eigenen i18n-Store.
- **Jahresrückblick-Banner** im Dezember.

**Design:** Akzentfarbe Teal **#30c5bb**, dunkles und helles Theme, Theme-Presets, Glassmorphism, optionale Partikel, anpassbare Schrift/Radius/Sidebar.

---

## 3. Tech-Stack & Repo-Infos

- **Framework:** SvelteKit (SPA, `adapter-static`, `ssr = false`), **Svelte 5 mit Runes**.
- **Desktop:** **Tauri v2** (Rust-Backend + Edge **WebView2**).
- **Styling:** **Tailwind v4** + eigene CSS-Variablen (`src/app.css`).
- **Sprachen:** TypeScript (Frontend), Rust (Tauri-Backend).
- **Repo:** GitHub **`P3rc1v4l/OmniSight`**.
- **Discord:** `https://discord.gg/tnfgta33uj`.
- **Copyright/Kontakt:** © Luka Kalinka, `zzickyzzacky@gmail.com`.
- **Entwicklung:** Sessions laufen auf **Deutsch**.
- **Akzentfarbe:** `#30c5bb`.
- **Rust-Crate-Versionen (aus Cargo.lock):** `tauri 2.11.2`, `wry 0.55.1`, `webview2-com 0.38.2`, `windows 0.61.3`, `windows-core 0.61.2`.

---

## 4. Wichtige Rahmenbedingungen & Einschränkungen (UNBEDINGT beachten)

> Diese Punkte sind in der Vergangenheit immer wieder relevant gewesen. Sie verhindern Fehler.

1. **Kein Rust-Compiler in der Sandbox.** Claude kann das Frontend bauen (Vite), aber **NICHT** den Rust-/Tauri-Teil kompilieren. Jede Änderung an `src-tauri/` (Rust, `Cargo.toml`, native Module) ist **unverifiziert** und muss per **GitHub-Actions-CI** gebaut werden. → Bei nativem Code immer sagen: „muss im CI gebaut werden; wenn es nicht kompiliert, schick mir das Build-Log" (Iterieren über das CI-Log funktioniert gut).
2. **`vite build` macht KEINE Typprüfung.** Undefinierte Bezeichner, fehlende Imports, Tippfehler oder Laufzeitfehler **rutschen durch** den Build und fallen erst zur Laufzeit oder im CI auf. → Imports/Bezeichner immer manuell gegenprüfen.
3. **Mix-Check (Svelte 5):** Eine `.svelte`-Datei darf **nicht gleichzeitig** legacy `$:`-Reaktivität **und** Runes (`$state`/`$derived`/`$props`/`$effect`) enthalten. Vor dem Editieren prüfen, in welchem Modus die Datei ist, und konsistent bleiben.
   - **Legacy `$:`-Dateien** (NICHT Runes!): u. a. `src/routes/watchlist/+page.svelte`.
   - Die meisten neueren Komponenten sind **Runes**.
4. **`sed` mit `&`** im Ersetzungstext kann Ausgaben zerstören (→ Python nutzen). **i18n-Schlüssel mit `{platzhalter}`** brechen naive Klammer-Regex-Prüfungen (Fehlalarm – manuell verifizieren).
5. **Validierung:** JSON via `python3 -c "import json; json.load(...)"`, TOML via `import tomllib`, YAML via `import yaml`.
6. **Screenshots erreichen Claude nicht** automatisch – der Nutzer muss Bilder explizit hochladen.
7. **WebView2-Fakten:**
   - **Eingebettete Kind-Webviews** rendern **ÜBER** dem HTML (natives Fenster). Deshalb müssen sie für Modals/Overlays/Onboarding **ausgeblendet** werden (`hideEmbedded()` / `unhideEmbedded()`).
   - Eingebettete Kind-Webviews teilen sich **eine** WebView2-Umgebung → können **keine Erweiterungen** (uBlock/BetterTTV) und **keine getrennten Profildaten** laden. Dafür gibt es den **Fenster-Modus** (top-level `WebviewWindow` mit eigenem `dataDirectory` + `extensions_path`).
   - **Werbeblocker** und **BetterTTV** funktionieren nur im **Fenster-Modus**.
   - Der Windows-**Lautstärkemixer** zeigt WebView2-Audio standardmäßig als „Microsoft Edge WebView2" – das ist eine bekannte WebView2-Einschränkung; wir benennen es per WASAPI um (siehe `audio_session.rs`, v0.86.0).
8. **Copyright:** Keine urheberrechtlich geschützten Texte/Songtexte reproduzieren. uBlock ist GPLv3 (reine Aggregation, ok).
9. **Auto-Updater:** Konfiguration ist korrekt; das Problem sind die **Repo-Secrets** (siehe Abschnitt 9).

---

## 5. Architektur

- **SPA**: `adapter-static`, `ssr = false`, alles läuft nur im Browser/WebView (kein SSR). Datum/Uhrzeit-bezogene Logik läuft clientseitig.
- **Svelte 5 Runes**: `$state`, `$derived`, `$props`, `$effect`. Stores werden mit `$store` auto-subskribiert.
- **Persistenz**: zwei Wege –
  - **tauri-plugin-store** über `src/lib/persistence.ts` (`loadState`/`saveState`) – für die meisten profil- und app-weiten Daten.
  - **localStorage** für einzelne einfache Flags (z. B. Jahresrückblick-„dieses Jahr ausblenden").
  - Persistenz-Muster pro Profil: `loadXForProfile(profileId)` setzt Store + `ready=true`; ein `store.subscribe(...)` speichert nur, wenn `ready && pid`. Schlüssel-Schema z. B. `watchlist:${pid}`, `continue:${pid}`, `relnotified:${pid}`, `hiddenrecs:${pid}`, `excludedseeds:${pid}`, `order:${pid}`.
- **Profile**: `profiles`-Store + `activeProfileId`. `loadProfileData(profileId)` lädt Watchlist, Continue, Recs, Tracking, Provider-Profildaten. PIN-Schutz (gehasht), Haupt-Profil, Admin-Code.
- **Streams**:
  - **Eingebettet** (`embedded.ts` → `showEmbedded`/`create_embedded_webview`): natives Kind-WebView, das über dem HTML schwebt; Position/Größe wird laufend nachgeführt (`repositionEmbedded`). Vollbild, Mini-Player, Hintergrund-Streams.
  - **Fenster-Modus** (`streamWindow.ts` → `openInWindow`/`open_stream_window`): top-level `WebviewWindow` mit eigenem `dataDirectory` pro Profil; nötig für Werbeblocker/BetterTTV. Beim Schließen des Fensters: `tauri://destroyed`-Listener → `endSession` (+ seit v0.87.0 zurück zur Übersicht, geregelt in `/stream`).
  - `streamMode`-Store: `'embedded' | 'window' | null`. `activeStream` (in `providers.ts`) hält den aktuell offenen Anbieter.
  - Auswahl-Logik (`showEmbedded`): `p.adblock || url.includes('twitch.tv') || settings.appearance.streamMode==='window'` → Fenster-Modus, sonst eingebettet (mit Fallback auf Fenster, wenn Einbetten scheitert).
- **i18n** (`src/lib/i18n.ts`): Store `t` (Markup: `$t('key')`) und `tr`/`get(t)` (JS). Schlüssel sind `{ de, en }`-Objekte; **für jeden neuen Schlüssel BEIDE Sprachen** ergänzen. Interpolation via `$t('key', { param })` für `{param}`-Platzhalter. (`tt` ist ein lokaler Alias in manchen Komponenten.)
- **Toasts vs. Benachrichtigungs-Center** (seit v0.88.0): `pushToast(...)` = nur kurzer, vergänglicher Hinweis. `pushNotification(...)` = Toast **und** Eintrag im Center-Verlauf. Nur Achievements + Watchlist-Releases nutzen `pushNotification`.
- **Native Befehle (Rust ↔ Frontend)** via `invoke(...)`: u. a. `create_embedded_webview`, `open_stream_window`, Autofill, Tray/Autostart. DPI-Typen aus `@tauri-apps/api/dpi` (`LogicalPosition`/`LogicalSize`). Native Audio-Session-Umbenennung als Hintergrund-Thread (Windows).

---

## 6. Datei-für-Datei-Dokumentation

### 6.1 Wurzel / Konfiguration
- **`package.json` / `package-lock.json`** – npm-Abhängigkeiten + App-Version (eine der 5 Versions-Dateien).
- **`svelte.config.js`** – SvelteKit-Konfig (adapter-static).
- **`vite.config.ts`** – Vite-Build-Konfig.
- **`tsconfig.json`** – TypeScript-Konfig.
- **`README.md`**, **`CHANGELOG.md`** (Versions-Changelog, wird jede Version gepflegt), **`ROADMAP.md`** (Vorhaben + Erledigtes, wird automatisch gepflegt; Kopf `Stand: vX`).

### 6.2 Tauri-Backend (`src-tauri/`) – RUST, nur per CI baubar
- **`Cargo.toml`** – Rust-Abhängigkeiten (tauri, webview2-com, windows mit Features `Win32_Foundation`, `Win32_System_Com`, `Win32_Media_Audio`, `Win32_System_Diagnostics_ToolHelp`). Eine der 5 Versions-Dateien.
- **`tauri.conf.json`** – Tauri-Konfig: Fenster, Bundle (`createUpdaterArtifacts: true`), Plugins (updater mit `pubkey` + Endpoint `…/releases/latest/download/latest.json`, process), `resources: ["extensions","extensions_twitch"]`. Eine der 5 Versions-Dateien.
- **`capabilities/default.json`** – Tauri-Berechtigungen (u. a. updater/process).
- **`build.rs`** – Tauri-Build-Script.
- **`src/main.rs`** – Einstiegspunkt, ruft `lib.rs::run()`.
- **`src/lib.rs`** (~520 Z.) – Hauptlogik des Backends: Module-Deklarationen, `run()` mit `tauri::Builder`, `.setup(...)` (Tray, Autostart, „minimiert starten", Audio-Session-Renamer), `invoke_handler` (alle Befehle). Enthält `create_embedded_webview`, `open_stream_window` (seit v0.91.0 mit `provider_id` → Daten-Verzeichnis `webviews/{Profil}/{Anbieter}`), Autofill, Tray/Fenster-Logik. **Const `STREAM_INIT_JS`** (seit v0.90.0) wird in beide Stream-Webviews injiziert (öffnet „_blank"-Links im selben Fenster, unterbindet `window.open`-Pop-under). **`check_reachable`** nutzt seit v0.90.0 einen echten Chrome-User-Agent. **`logout_provider` / `logout_all_providers`** (seit v0.91.0) löschen die WebView2-Daten-Verzeichnisse (Abmelden).
- **`src/tmdb.rs`** – TMDB-Proxy/Helfer (serverseitige Aufrufe, API-Key-Handhabung).
- **`src/anilist.rs`** – AniList-Helfer (Anime-Daten).
- **`src/discord.rs`** – Discord-Rich-Presence (IPC).
- **`src/favicon.rs`** – Favicon-Abruf für Anbieter-Logos.
- **`src/audio_session.rs`** (seit v0.86.0, **Windows-only**) – benennt per WASAPI die Audio-Sessions unseres Prozessbaums im Lautstärkemixer in „OmniSight" um (+ Icon). Hintergrund-Thread, pollt alle 3 s. `start_audio_session_renamer()`, `descendant_pids()`, `rename_sessions()`.

### 6.3 App-Rahmen (`src/`)
- **`app.html`** – HTML-Grundgerüst.
- **`app.css`** – globale CSS-Variablen (Farben, `--accent`, `--bg-elev`, `--border`, `--text`, `--text-muted`, `--accent-soft`, `--bg-card`, `--bg-card-2`, Radius, Sidebar-Breite …) + Basis-Styles.
- **`routes/+layout.ts`** – Layout-Load (SPA-Setup, `ssr=false`).
- **`routes/+layout.svelte`** (~210 Z., Runes) – **App-Shell**: Titlebar, UpdateBanner, **YearReviewBanner**, Sidebar, Toasts, NotificationCenter, OnboardingModal, SettingsModal, ShortcutsModal, **CommandPalette**, WrappedModal. `onMount`: hydratisiert Einstellungen/Profile/Katalog (Promise.all), startet Update-Check (~800 ms, parallel), lädt Profildaten, Tray/Autostart. Globale Tastenkürzel (`onKey`): Esc (schließt Palette/Settings/Shortcuts), F1/?, Strg+, (Settings), **Strg+K (Befehlspalette)**, Strg+D (`toggleTheme`), Ziffern 1–9 (Anbieter). `$effect`s: Achievement-Meldungen, Watchlist-Release-Hinweise, Palette-Embedded-Hide, **Onboarding-Embedded-Hide** (Onboarding immer im Vordergrund). Funktionen: `openPalette/closePalette` (mit hide/unhide), `openSettings/closeSettings`, `toggleTheme`.

### 6.4 Seiten (`src/routes/*/+page.svelte`)
- **`+page.svelte`** (Startseite, ~540 Z.) – Anbieter-Raster: Suche (mit TMDB-Suche), Such-Verlauf, **„Weiterschauen"-Karte** (prominent, über Favoriten; `continueList`/`reopenContinue`), Favoriten (Drag&Drop), Kategorien/Sammlungen, alle Anbieter (Raster + Liste, Drag&Drop-Sortierung via `setProviderOrder`/`setFavoritesOrder`), **„Ausgeblendet"-Sektion** (Anbieter wieder einblenden), Ziffern-Shortcuts. Nutzt `ProviderCard`, `Logo`.
- **`watchlist/+page.svelte`** („Gemerkt", ~392 Z., **LEGACY `$:`**) – Watchlist-Karten (Poster, Typ·Jahr, **Bewertung über Anbietern**, „Verfügbar bei dir"-Chips, **Buttons unten fixiert**: Gesehen/Entfernen; **kein** Inhalts-Teaser mehr), Filter (Typ/Gesehen/Sortierung/Suche), Wochen-Release-Hervorhebung (`.thisweek`, Wochentag-/„Heute"-Badge). **Empfehlungen** (eine scrollbare Reihe): `buildRecs` zieht TMDB-Empfehlungen aus zufälligen Seed-Titeln (ohne ausgeschlossene), merkt sich den Seed je Empfehlung (`recReasonMap`), filtert `hiddenRecs`; **„Neue Vorschläge"**-Button (`refreshRecs`), **✕ zum Ausblenden** je Karte (`hideRec`), `openRecInfo` setzt `currentRecReason`.
- **`stream/+page.svelte`** („Schaut gerade", ~285 Z., Runes) – zeigt den aktiven Stream: Leiste (Logo, Timer, Vollbild/Neu laden/Hintergrund/Schließen), eingebetteter Host **oder** Fenster-Hinweis. **Kontext-abhängiger Fenster-Hinweis** (Werbeblocker/Twitch/Einstellung) seit v0.87.0. **`$effect`**, der bei Fenster-Modus auf `tauri://destroyed` lauscht → `activeStream=null` + `closeEmbedded` + zurück zur Übersicht. Vollbild misst echte Fenstergröße über Tauri.
- **`stats/+page.svelte`** (Statistiken, Runes) – Kennzahlen (Streamzeit, Öffnungen, Favoriten, Watchlist, **Gesehen**, Achievements), Top-Anbieter-Balken, **„Rückblick"-Button** (WrappedModal) + **„Gesehene Titel"-Button** (öffnet `SeenTitlesModal`), Achievement-Liste.
- **`news/+page.svelte`** – Neuigkeiten/Feed.
- **`upcoming/+page.svelte`** – Demnächst erscheinende Titel.
- **`cr-calendar/+page.svelte`** – (Anime-)Kalender (AniList-Wochenplan).
- **`provider/+page.svelte`** – Anbieter-Detailseite.

### 6.5 Komponenten (`src/lib/components/`)
- **`Sidebar.svelte`** – linke Navigation (Übersicht, Gemerkt, Neuigkeiten, Upcoming, Schaut gerade, CR Kalender, Statistiken) + Profil/Glocke. Nav-Labels via i18n (`nav.*`).
- **`Titlebar.svelte`** – eigene Fenster-Titelleiste (Minimieren/Maximieren/Schließen, Hilfe).
- **`ProviderCard.svelte`** – einzelne Anbieter-Kachel (Logo, Name, Untertitel, Qualität, Favoriten-Stern, Bearbeiten).
- **`Logo.svelte`** – Anbieter-Logo (Bild/Favicon/Buchstaben-Fallback, Farben).
- **`CardEditorModal.svelte`** – Anbieter bearbeiten (Name, Untertitel, URL, Logo, Farben, Werbeblocker). Header: **„Ausblenden"** rechts; Fußzeile: **„Zurücksetzen"**, Abbrechen, Speichern (seit v0.87.0; deutsche Literale, kein i18n). `hideCard()`, `resetCard()`.
- **`AddProviderModal.svelte`** – neuen eigenen Anbieter anlegen.
- **`CollectionsModal.svelte`** – Sammlungen/Kategorien verwalten.
- **`CommandPalette.svelte`** (Runes, seit v0.85.0) – Strg+K-Suche über Seiten, Aktionen (Einstellungen, Design wechseln, Tastenkürzel) und Anbieter. Props: `open`, `onClose`, `onOpenSettings`, `onToggleTheme`, `onShowShortcuts`. Tastatur: ↑/↓, Enter, Esc. Profile bewusst NICHT enthalten (PIN-Schutz).
- **`SettingsModal.svelte`** (Runes, groß ~1000 Z.) – Einstellungen mit Tabs (Design/Appearance, Profile, Plugins, Benachrichtigungen, Backup, Update …). Props: `open`, `initialTab`, `close`, **`onOpenReview`**. Zeigt im Dezember-Zeitraum ein **Rückblick-Banner**. Such-Feld für Tabs.
- **`OnboardingModal.svelte`** (Runes, seit v0.89.0 überarbeitet) – 6 Schritte: **0 Sprache (zuerst)**, 1 Willkommen, 2 Profilname, 3 **Design** (Hell/Dunkel + Akzent), 4 **Schnelleinstellungen** (Weiterschauen/Tray/Autostart – Tray/Autostart sofort angewendet), 5 Anbieter-Sichtbarkeit. z-index 1100; Layout blendet eingebetteten Stream aus (immer im Vordergrund).
- **`TitleInfoModal.svelte`** (Runes) – Titel-Detail (Poster, Backdrop, Jahr, Bewertung, Übersicht, Trailer, „Wo streamen", Watchlist-/„Gesehen"-Buttons). Seit v0.89.0: **Empfehlungsgrund** + Buttons „Diese Empfehlung ausblenden"/„Keine Empfehlungen wegen …" (nur wenn dieser Titel die gerade geöffnete Empfehlung ist, via `currentRecReason`).
- **`SeenTitlesModal.svelte`** (Runes, seit v0.87.0) – In-App-Fenster mit allen als gesehen markierten Titeln (Poster-Raster, Klick öffnet Titel-Info). Props: `open`, `onClose`.
- **`WrappedModal.svelte`** – Jahresrückblick („Wrapped"). Prop: `onClose`.
- **`YearReviewBanner.svelte`** (seit v0.88.0) – großes Start-Banner im Rückblick-Zeitraum (Dez 15.–31. + Testfenster), „dieses Jahr nicht mehr" (localStorage). Prop: `onOpenReview`.
- **`NotificationCenter.svelte`** (Runes, v0.88.0 neu) – zentriertes Fenster, zeigt `notifHistory` (nur Achievements + Releases). Öffnet über `notifCenterOpen`.
- **`Toasts.svelte`** – kurze, vergängliche Hinweise (`toasts`-Store).
- **`UpdateBanner.svelte`** – Banner „Update verfügbar" (Updater-Store).
- **`MediaBrowser.svelte`** – Browser/Grid für TMDB-Medien (Suche/Listen).
- **`MiniPlayer.svelte`** – kleiner schwebender Stream-Player.
- **`HiddenTitlesModal.svelte`** – ausgeblendete Titel verwalten (`hidden`-Store; das ist für TITEL, nicht Anbieter).
- **`ProfileSwitcher.svelte`** – Profil wechseln (mit PIN-Abfrage).
- **`DiscordPresence.svelte`** – steuert Discord Rich Presence.
- **`Particles.svelte`** – optionaler Partikel-Hintergrund.
- **`Clock.svelte`** – Uhr (anpassbar).
- **`SleepTimer.svelte` / `SleepCountdown.svelte`** – Sleep-Timer (Stream/App nach X Minuten beenden).
- **`ShortcutsModal.svelte`** – Übersicht der Tastenkürzel (Strg+K = Befehlspalette, Strg+, = Einstellungen, Strg+D = Theme …).

### 6.6 Stores (`src/lib/stores/`)
- **`settings.ts`** – `settings` (großes Einstellungs-Objekt), `DEFAULT_SETTINGS`, `applySettings`, `hydrateSettings`, `onboardingOpen`, `sleepTimerEndsAt`, `clockEditing`. Struktur u. a.: `appearance` (accentColor, accentText, **theme** 'dark'/'light', themePreset, fontFamily, fontSize, radius, sidebarWidth, glassmorphism, particles…, **streamMode** 'embedded'/'window', cardShadow, cardHoverZoom, **language** 'de'/'en'), `plugins` (sleepTimer…, **continueWatching**, discordEnabled/ClientId, hardwareAcceleration, miniPlayerEnabled, **autostart**, startMinimized, **closeToTray**), `notifications` (pauseReminder, sound, updateHint, achievementUnlocked, **watchlistReminder**), `updateChannel` ('stable'/'beta'), `onboardingDone`.
- **`profiles.ts`** – `profiles`, `activeProfileId`, `mainProfileId`, `adminCodeHash`, `MAX_PROFILES`(5)/`MIN_PROFILES`, `addProfile/renameProfile/setProfileAvatar/setProfileAccent/setMainProfile/deleteProfile`, PIN (`setPin/clearPin/verifyPin/hashPin`), Admin (`setAdminCode/verifyAdminCode/clearAdminCode/resetPinWithAdmin`), `switchProfile`, `loadProfileData` (lädt Watchlist+Continue+Recs+Tracking+Provider-Profildaten), `hydrateProfiles`.
- **`providers.ts`** – `providers` (global persistiert, inkl. `hidden`/`favorite`), `favorites`, `recentProviderIds`, `providerOrder`, `collections`, `visibleProviders` (filtert `!hidden`), `favoriteProviders`, `recentProviders`, `activeStream`, `editingProvider`, `detailProviderId`. Funktionen: `toggleFavorite`, **`toggleProviderHidden`/`unhideProvider`**, `setProviderOrder`/`setFavoritesOrder`, `markOpened`, `addCustomProvider`/`removeCustomProvider`, `updateProvider`, `resetProviderToDefault`, `resetProviders`, Sammlungen (`addCollection/renameCollection/deleteCollection/toggleCollectionProvider/toggleCollectionCollapsed`), `hydrateCatalog`, `loadProviderProfileData`.
- **`watchlist.ts`** – `watchlist`, `addToWatchlist/removeFromWatchlist/isInWatchlist`, `setRating`, `toggleSeen`, `loadWatchlistForProfile`, **`maybeNotifyReleases`** (Release-heute-Hinweis, dedupliziert über persistierten `notified`-Set, nutzt `pushNotification`).
- **`recs.ts`** (seit v0.89.0) – `hiddenRecs`, `excludedSeeds`, `currentRecReason`, `loadRecsForProfile`, `hideRec`, `excludeSeed`, `clearExcludedSeed`. Pro Profil persistiert.
- **`continue.ts`** – „Weiterschauen": `continueList`, `ContinueEntry` (key,label,subtitle,url,id,color,color2,poster,ts), `recordOpen`, `loadContinueForProfile`. Max 12.
- **`tracking.ts`** – Streamzeit/Öffnungen: `watchTime`, `openCount`, `watchLog`, `openLog`, `totalWatchMs`, `distinctProvidersWatched`, `rangeWatch/rangeOpens`, `addWatchTime`, `incrementOpenCount`, `startSession/endSession`, `sessionStart`, `formatDuration`, `resetSessions`, `loadTrackingForProfile`.
- **`achievements.ts`** – `achievements`, `unlockedCount`, `maybeNotify` (meldet neu Freigeschaltetes über `pushNotification`, dedupliziert via persistiertem „celebrated"-Set).
- **`toasts.ts`** – `toasts`, `notifHistory`, `notifCenterOpen`, **`pushToast`** (nur Toast), **`pushNotification`** (Toast + Verlauf), `dismissToast`, `clearNotifHistory`.
- **`reachability.ts`** – Erreichbarkeits-Prüfung der Anbieter: `reachability` (Status je Anbieter), `reachabilityCheckedAt`, `checkProvider`, `checkProviders`, `refreshAll`. **(Relevant für offenen Punkt #3 – cine.to/bs.to fälschlich rot.)**
- **`searchHistory.ts`** – `searchHistory`, `addSearch/removeSearch/clearSearchHistory`.
- **`favicons.ts`** – `faviconCache`, `ensureFavicon` (lädt/cached Favicons).
- **`hidden.ts`** – ausgeblendete TITEL (nicht Anbieter): `hiddenTitles`, `showHidden`, `isHidden/hideTitle/unhideTitle`.
- **`updater.ts`** – `updateState`, `checkForUpdate` (nativer `check()` → GitHub-Fallback), `installUpdate`, `dismissUpdate`.
- **`accounts.ts`** (seit v0.91.0) – „Accounts"/Anbieter-Logins: `usedProviders` (genutzte Anbieter je Profil), `loadAccountsForProfile`, `markProviderUsed`, `logoutProvider` (löscht nativ das WebView2-Verzeichnis des Anbieters), `logoutAllProviders` (löscht das ganze Profil-Verzeichnis). Profil-Bezug per dynamischem Import (kein Zyklus).

### 6.7 Helfer/Libs (`src/lib/`)
- **`i18n.ts`** (~532 Z.) – Übersetzungen (de/en), Store `t`, `tr`. **Bei jedem neuen Schlüssel beide Sprachen!**
- **`tmdb.ts`** – `tmdb` (API-Wrapper: `details`, `list`, Suche …), `titleInfo`-Store, `openTitleInfo`, `closeTitleInfo`. `IMG`-Basis-URL.
- **`embedded.ts`** (~412 Z.) – eingebettete Streams + Hintergrund-Streams + Mini-Player (siehe Architektur). Wichtige Exporte: `openProvider`, `openUrlInApp`, `showEmbedded`, `repositionEmbedded`, `hideEmbedded`, `unhideEmbedded`, `setImmersive`, `closeEmbedded`, `reloadEmbedded`, `openCurrentInWindow`, `streamMode`, `immersive`, `miniPlayer`, `streamError`, Hintergrund-Stream-Funktionen.
- **`streamWindow.ts`** – `openInWindow` (Fenster-Modus, eigenes dataDirectory pro Profil, `tauri://destroyed`-Listener).
- **`native.ts`** – `applyCloseToTray`, `setAutostart`, `isAutostartEnabled`.
- **`backup.ts`** – `buildBackup`, `downloadBackup`, `parseBackup`, `applyBackup`, `BackupFile` (App-internes Backup/Restore der Einstellungen/Daten).
- **`anilist.ts`** – `fetchWeekSchedule`, `AiringItem` (Anime-Wochenplan).
- **`discord.ts`** – `discordConnect/discordSetActivity/discordClear/discordDisconnect`.
- **`themes.ts`** – `THEME_PRESETS`, `getPreset`, `PRESET_VAR_MAP`, `ThemeVars`, `ThemePreset`.
- **`persistence.ts`** – `loadState`, `saveState`, `exportStore`, `importStore` (tauri-plugin-store-Wrapper).
- **`watchProviders.ts`** – `extractWatchProviders` (zieht DE-Streaming-Anbieter aus TMDB-Daten), `WatchProvider`.
- **`providerVisual.ts`** – `faviconDomain` (Logo/Domain-Helfer).
- **`avatar.ts`** – `isImageAvatar`, `processAvatarImage` (Profil-Avatare).
- **`version.ts`** – `APP_VERSION` (eine der 5 Versions-Dateien!), `APP_NAME`, `LINKS`, `DEFAULT_DISCORD_CLIENT_ID`.
- **`types/index.ts`** – Typen: `Provider` (id,name,subtitle,url,category,color,color2,quality,icon,custom,hidden,favorite,adblock), `WatchlistItem` (tmdbId,mediaType('movie'|'tv'),title,poster,overview,releaseDate,addedAt,rating?,seen?), `TmdbItem` (id,media_type,title,overview,poster,backdrop,release_date,vote_average) u. a.
- **`data/providers.ts`** – `DEFAULT_PROVIDERS` (Standard-Anbieter-Katalog).
- **`data/brandIcons.ts`** – Marken-Icons/SVGs für Anbieter.
- **`yearReview.ts`** (seit v0.88.0) – `isReviewPeriod`, `reviewYear`, `isReviewDismissed`, `dismissReviewYear`. **TEST-Fenster `TEST_FROM`/`TEST_TO`** (aktuell 2026-06-06 bis 2026-06-11) – nach dem Testen auf `''` setzen, dann gilt nur Dezember (15.–31.).

---

## 7. Daten, die ich von dir bekommen habe
- **Projekt:** OmniSight, Windows-Streaming-Aggregator. Eigentümer/Entwickler: **Percival** (GitHub `P3rc1v4l`).
- **Repo:** `github.com/P3rc1v4l/OmniSight`. **Discord:** `discord.gg/tnfgta33uj`.
- **Copyright/Kontakt:** © Luka Kalinka, `zzickyzzacky@gmail.com`.
- **Projektpfad (Sandbox):** `/home/claude/omnisight/`; Ausgaben nach `/mnt/user-data/outputs/`.
- **Akzentfarbe:** `#30c5bb`.
- **Crate-Versionen:** tauri 2.11.2, wry 0.55.1, webview2-com 0.38.2, windows 0.61.3, windows-core 0.61.2.
- **5 Versions-Dateien** (bei jedem Bump synchron): `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src/lib/version.ts` (`APP_VERSION`), `package-lock.json`.
- **Entwicklung auf Deutsch**, Antworten mit Merkhilfe + Datei-Tabelle + Versionsangabe + Abschluss-Mehrfachauswahl.

---

## 8. Versions-Historie (Auszug, neueste zuerst)
- **v0.91.0** – #9 „Accounts": Anbieter-Logins je Profil (einzeln/alle abmelden). Fenster-Modus bekommt pro Anbieter ein eigenes Daten-Verzeichnis `webviews/{Profil}/{Anbieter}`; Abmelden = Verzeichnis löschen. 🦀 CI. (Einmalige Folge: bestehende Fenster-Logins werden einmal zurückgesetzt. Eingebettete Streams teilen sich eine WebView2-Sitzung → dort nicht pro Anbieter trennbar.)
- **v0.90.0** – #3 Erreichbarkeit: echter Browser-User-Agent in `check_reachable` (cine.to/bs.to nicht mehr fälschlich rot). #3 Such-Weiterleitung: `STREAM_INIT_JS` in beiden Stream-Webviews (öffnet „_blank"-Links im selben Fenster, unterbindet `window.open`-Pop-under). 🦀 CI. #10 Einstellungen: Benachrichtigungen gruppiert + Beschreibungen; Abschnitts-Überschriften in Plugins & Design. 🎨
- **v0.89.0** – #11 Onboarding überarbeitet (Sprache zuerst, +Design-Schritt, +Schnelleinstellungen, immer im Vordergrund über Streams). #6 Empfehlungs-Engine („Neue Vorschläge"-Button, Empfehlungsgrund in Titel-Info, Empfehlung ausblenden per ✕/Titel-Info, Seed-Titel ausschließen; pro Profil gespeichert).
- **v0.88.0** – #5 Benachrichtigungs-Center als zentriertes Fenster, nur Achievements/Releases; `pushToast` vs `pushNotification`. #2 „Weiterschauen" als große Karte über Favoriten + startet zuletzt gesehenen Titel. #8 Jahresrückblick-Banner (Dez 15.–31. + Testfenster), pro Jahr ausblendbar, Banner auch in Einstellungen.
- **v0.87.0** – #1 Karten-Editor aufgeräumt („Ausblenden" in Header, „Zurücksetzen", kein Überlauf). #4 Fenster-Modus: Adblock-Grund erklärt + Fenster schließen → zurück zur Übersicht. #6-Layout: Gemerkt-Karten Buttons unten fixiert, Teaser entfernt, Bewertung über Anbieter, Empfehlungen einreihig. #7 Gesehene Titel als In-App-Fenster (neben „Rückblick").
- **v0.86.0** – Lautstärkemixer-Name via WASAPI („OmniSight" statt „Microsoft Edge WebView2", `audio_session.rs`, 🦀 CI). Anbieter aus-/einblenden. „Gesehen"-Button in Titel-Info + Statistik-Kennzahl/Übersicht. Watchlist-Release-Hinweise (`watchlistReminder` verdrahtet).
- **v0.85.0** – Befehlspalette (Strg+K). Start-Update-Check beschleunigt (4 s → 0,8 s, parallel).
- **v0.84.0** – Gemerkt-Seite: Wochen-Release-Karten-Hervorhebung (Akzentrand/Glow/Wochentag-Badge/„Heute").
- **v0.83.0** – BetterTTV nur für Twitch (eigenes `extensions_twitch/`), Twitch+Adblock → Fenster-Modus. 🦀 (CI lädt BetterTTV-Chrome-Zip + kopiert uBlock).
- **v0.61.0–v0.82.x (früher):** eingebettete/Fenster-Streams, uBlock-Werbeblocker, WebView2-Passwort-Autofill, Login je Profil, CSP/IPC-Bugfix u. a.

(Vollständig in `CHANGELOG.md`.)

---

## 9. Offene Punkte / To-do

### ✅ Alle 11 Wunschpunkte (#1–#11) sind umgesetzt
#1 Karten-Editor · #2 Weiterschauen-Karte · #3 Erreichbarkeit + Weiterleitung · #4 Fenster-Modus-Hinweis · #5 Benachrichtigungs-Center · #6 Empfehlungs-Engine · #7 Gesehene Titel · #8 Jahresrückblick · #9 Accounts · #10 Menüs überarbeitet · #11 Onboarding.

### Noch zu erledigen (technisch/extern)
- **Native Teile im CI bauen & testen:** #3 (Erreichbarkeit/Weiterleitung) und #9 (Accounts) sind nativer Rust-Code und wurden **nicht lokal kompiliert**. Per GitHub Actions bauen; auf **bs.to/cine.to** live testen (Rot-Anzeige weg? Weiterleitung nach Suche? Abmelden wirkt?). Bei Compile-Fehler Build-Log nutzen.
- **#9 Einschränkung:** Abmelden wirkt vollständig nur für Anbieter im **Fenster-Modus**. Eingebettete Streams teilen sich eine WebView2-Sitzung (nicht pro Anbieter trennbar).
- **#3 Weiterleitung** ist eine Heuristik (·_blank·-Links in-place, `window.open` blockiert) – evtl. je Seite nachschärfen.

### Dauerthemen / Status
- **Auto-Updater:** Konfig + Workflow sind **korrekt** (pubkey, Endpoint `…/releases/latest/download/latest.json`, `createUpdaterArtifacts:true`, Signier-Env in `release.yml`). Problem = **Repo-Secrets** wahrscheinlich nicht gesetzt. **Anleitung:** Auf dem neuesten GitHub-Release prüfen, ob `latest.json` als Asset existiert. Falls nein → `npx tauri signer generate -w ~/.tauri/omnisight.key`, **öffentlichen** Schlüssel in `tauri.conf.json` (`plugins.updater.pubkey`), **privaten** Schlüssel + Passwort als Repo-Secrets `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, neues Release bauen. Pubkey muss zum privaten Schlüssel passen.
- **BetterTTV-Chrome-Zip (v0.83.0):** noch unbestätigt, ob der Download im CI-Build klappt (Build-Log prüfen).
- **Drag&Drop-Sortierung:** bereits vollständig vorhanden (Favoriten + alle Anbieter, Raster + Liste).

---

## 10. Wiederkehrende Aufgaben (jede Build-/Update-Session)
1. Bei Strukturänderung an `tauri.conf.json`: **JSON validieren** (`python3 -c "import json; json.load(open('src-tauri/tauri.conf.json'))"`).
2. **Vite-Build** (`npm run build`) – **null Fehler**. (Achtung: keine Typprüfung – Imports/Bezeichner manuell checken.)
3. **Mix-Check** auf allen berührten `.svelte`: nicht gleichzeitig `^\s*\$:` und `$(state|derived|props|effect)\(`.
4. **Orphan-Sweep:** verwaiste/überflüssige Dateien suchen und dem Nutzer sagen.
5. **Version bumpen** in allen **5 Dateien** (siehe Abschnitt 7) – per `sed`/Node-Skript.
6. **`CHANGELOG.md`** ergänzen + **`ROADMAP.md`** pflegen (Erledigtes markieren, `Stand:` hochsetzen).
7. **Ein** Zip nach `/mnt/user-data/outputs/` (nur das neueste behalten) + `present_files`.
8. Antwort auf **Deutsch** mit Merkhilfe, Datei-Tabelle, „Aktuelle Version", Abschluss-Mehrfachauswahl.
9. Nativer Code → klar als **CI-nötig/unverifiziert** kennzeichnen.

---

## 11. Build- & Release-Befehle (exakt)
```bash
# Frontend bauen (muss fehlerfrei sein – keine Typprüfung!)
cd /home/claude/omnisight && npm run build

# Mix-Check (Beispiel)
for f in <geänderte .svelte>; do
  if grep -qE '^\s*\$:' "$f" && grep -qE '\$(state|derived|props|effect)\(' "$f"; then echo "$f: MIX!"; else echo "$f: ok"; fi
done

# Version bumpen (X = alt, Y = neu) – & in sed meiden, sonst Python nutzen
sed -i 's/"version": "X"/"version": "Y"/' package.json
sed -i 's/^version = "X"/version = "Y"/' src-tauri/Cargo.toml
sed -i 's/"version": "X"/"version": "Y"/' src-tauri/tauri.conf.json
sed -i "s/APP_VERSION = 'X'/APP_VERSION = 'Y'/" src/lib/version.ts
node -e "const f='package-lock.json';const j=require('./'+f);j.version='Y';if(j.packages&&j.packages['']){j.packages[''].version='Y';}require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"

# Zip (nur das neueste behalten)
cd /mnt/user-data/outputs && rm -f omnisight-v*.zip && cd /home/claude
zip -r -q /mnt/user-data/outputs/omnisight-vY.zip omnisight \
  -x "omnisight/node_modules/*" -x "omnisight/build/*" -x "omnisight/.svelte-kit/*" \
  -x "omnisight/src-tauri/target/*" -x "omnisight/src-tauri/gen/*" -x "*/.DS_Store"
```

---

## 12. Paste-fertige Kurzfassung für einen neuen Chat
> Kopiere das in die erste Nachricht eines neuen Chats (zusätzlich zu dieser Datei + dem Projekt-Zip):

„Ich arbeite an **OmniSight** (Windows-Streaming-Aggregator, Tauri v2 + SvelteKit + Svelte 5 Runes + Tailwind v4, Repo `P3rc1v4l/OmniSight`). Bitte verhalte dich exakt so:
- Antworte **immer auf Deutsch**, ausführlich und mit einer **Merkhilfe** bei technischen Themen. Behandle mich als **Claude-Plus**-Nutzer.
- Bei jeder Projekt-Antwort: kurze Erklärung, **Tabelle der geänderten/neuen Dateien** (`| Datei | Was geändert | Neu? |`), **Merkhilfe**, Zeile **„Aktuelle Version: X"** und am Ende eine **Mehrfachauswahl-Rückfrage**.
- **Jede Build-Session:** `tauri.conf.json` JSON-validieren, **fehlerfreier `npm run build`** (Vite prüft keine Typen!), **Mix-Check** (kein `$:` neben Runes), **Orphan-Sweep**, **Version in 5 Dateien** bumpen (`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src/lib/version.ts`, `package-lock.json`), **`CHANGELOG.md` + `ROADMAP.md`** pflegen, **ein** Zip nach `/mnt/user-data/outputs/`.
- **Kein Rust-Compiler hier** → `src-tauri/`-Änderungen sind unverifiziert und müssen per **GitHub-Actions-CI** gebaut werden; bei Fehlern schicke ich das Build-Log.
- i18n: neue Schlüssel **immer de+en**. Eingebettete Streams liegen **über** dem HTML → für Modals `hideEmbedded()`. Rap-Texte: gute Reime, Adlibs, ≤3000 Zeichen, dürfen hart sein, **keine KI-Wasserzeichen**.
Aktueller Stand: **v0.91.0** – alle 11 Wunschpunkte (#1–#11) umgesetzt. Offen nur noch: native Teile (#3, #9) im CI bauen/testen und Auto-Updater-Secrets setzen."

---
*Ende des Backups. Pflege diese Datei bei größeren Änderungen weiter.*
