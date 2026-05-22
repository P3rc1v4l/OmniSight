# OmniSight Changelog

---

## v1.2.0 — 2026-05-22

### Neue Features
- Neues Profil wird direkt nach Erstellen ausgewählt (Sidebar + Dropdown)
- Statistiken-Link jetzt in der Sidebar zwischen Einstellungen und Profil-Dropdown
- CR Kalender als eigene Sidebar-Kategorie (eigener View, kein Dropdown)
- Anbieter-Dropdown aus der Sidebar entfernt
- "Gespeichert"-Toast erscheint nur beim Schließen der Einstellungen, Dark-Mode-Wechsel oder Profil-Wechsel
- Uhr: Drag nur im Clock-Tab der Einstellungen möglich; Kontext-Menü erscheint jetzt VOR der Uhr (Z-Index fix)
- Uhr: Sekunden dauerhaft anzeigbar; analoger Modus dauerhaft; 100% Transparenz deaktiviert die Uhr automatisch; Transparenz & Größe rücksetzbar
- Übersicht: Sortierung A↓Z / Z↓A / Nutzung mit Animation; Karten-Editor mit Logo-Picker, Hintergrundfarbe/-bild, Titel, Untertitel
- Übersicht: Rechtsklick öffnet Anbieter in eigenem Fenster (Punkt 21)
- Suche: TMDB statt OMDB; Verlauf erst bei Enter; komplett/einzeln löschbar; Suchleiste wird beim Öffnen eines Streams geleert
- Achievements: Live-Push-Benachrichtigungen beim Erreichen; werden in Statistiken sofort angezeigt
- Statistiken: Animierte Balken für Streamzeit und Wochentage; Gesamt-Stunden-Anzeige
- Gemerkt: Kategorien links (Alle/Filme/Serien/Anime) als Text-Buttons; Karten-Detail öffnet Poster korrekt (nicht abgeschnitten)
- Detail-Popup: Kein "undefined"-Chip; Anbieter-Chip öffnet den richtigen Anbieter; "Anschauen"-Button mit Anbieter-Auswahl; "Wo streamen" entfernt
- Neuigkeiten/Upcoming: Text-Switcher ohne Button-Hintergrund; Anime-Tab hinzugefügt; Ausblenden-Button links oben auf Karte; Gesehen-Button + eigener Bereich
- Light Mode: Schrift dunkler; Sidebar hat Titlebar-Farbe
- Einstellungen Design: Schriftart-Auswahl (DM Sans, Inter, Rajdhani, Orbitron, Exo 2); Design-Untermenü; Partikel-Untermenü mit Form/Farbe/Größe/Geschwindigkeit
- Sprache übersetzt jetzt alle Labels in der gesamten App
- Account: Angemeldete Anbieter werden korrekt erkannt (verbesserte Cookie-Checks); Mehrfachauswahl zum Abmelden; schönes Bestätigungs-Modal
- Multi-Tab für YouTube/Twitch: Mittlere Maustaste öffnet neuen Tab statt Fenster; Tab stummschaltbar; Hintergrund-Qualität reduziert
- Stream-Ladefehler: Push nach 5s, Auto-Retry, Abbrechen möglich
- YouTube-Anmeldung: öffnet Standard-Browser, kehrt automatisch zurück
- Plugins: Suchfeld kleiner; "Deinstallieren" statt Haken; BetterTTV für Twitch; Buster für bs.to/cine.to/movie2k; "Installierte Listen" entfernt
- Einstellungen Mehr: Karten-Design und Custom CSS entfernt; Update-Suche mit Startup/Intervall-Option; Push bei neuem Update; Install-Button
- VPN von Statistiken nach Einstellungen Mehr verschoben
- Statistiken: Trakt.tv-Integration entfernt; gesehene Inhalte stattdessen; Multi-Window aus Statistiken entfernt; 25 Achievements
- Verlauf: in Einstellungen Mehr löschbar; Suchverlauf komplett/einzeln löschbar
- Widevine: Status in Einstellungen Mehr; CDM-Einbindung für alle Streams
- Changelog-Datei angelegt

### Bugfixes
- Splash-Screen bleibt nicht mehr hängen (show:false + did-finish-load statt ready-to-show)
- GitHub Actions: --publish never verhindert GH_TOKEN-Fehler
- Suche: TMDB-API statt veralteter OMDB-Calls
- Uhr: Transparenz war falsch herum (jetzt: 0%=sichtbar, 100%=unsichtbar)

---

## v1.1.1 — 2026-05-22

### Bugfixes
- Splash-Screen Fix: show:false + Fallback-Timer
- GitHub Actions: --publish never gesetzt; GH_TOKEN nur bei Tag-Push genutzt
- Blockmap-Datei: nur bei Auto-Updater nötig, jetzt dokumentiert

---

## v1.1.0 — 2026-05-22

### Neue Features
- 9 neue Anbieter: ADN, ARTE, Funk, KiKA, MagentaTV, Movie2k, Spotify, Waipu.tv, WOW
- Custom-Provider System
- Sort A↓Z Button
- CR-Sidebar Kalender
- YouTube-Link-Erkennung in Suche
- Profil-isolierte Partitionen
- 25 Achievements (4 Kategorien)
- Analoge Uhr mit Sekunden-Option
- Watchlist V2: Rechtsklick-Kategorie, Text-Switcher
- Karten-Editor: Reset, Logo-Picker
- Einzelne Anbieter wiederherstellen
- Plugin-Domains pro Plugin separat

---

## v1.0.9 — Backup-Stand
- Basis-Version mit allen Grundfunktionen
