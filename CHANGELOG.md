# Changelog

Alle nennenswerten Änderungen an OmniHub werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/),
Versionierung nach [SemVer](https://semver.org/lang/de/).

## [0.1.0] – 2026-05-28

### Hinzugefügt (Grundgerüst)
- Projektgerüst auf Basis **Tauri v2 + SvelteKit + Tailwind v4** (SPA-Modus via `adapter-static`).
- **Sidebar-Navigation** mit allen Hauptansichten laut Doku (Übersicht, Watchlist, Neuigkeiten, Upcoming, Schaut gerade, Statistiken, Einstellungen).
- **Übersicht-Seite** mit Anbieter-Raster, Suchfeld und Karten-Hover (Editor-Button als Platzhalter) sowie „Eigener Anbieter"-Kachel.
- **24 legale Standard-Anbieter** als Datensatz (`src/lib/data/providers.ts`).
- **Einstellungen** mit 6-Tab-Struktur; Design-Tab steuert Akzentfarbe, Theme, Schriftgröße, Eckenradius und Sidebar-Breite live über CSS-Variablen.
- **Stores**: Einstellungen (mit Live-Anwendung der Design-Tokens), Profile (inkl. SHA-256-PIN-Hashing), Anbieter (inkl. Reset-Funktion), aktiver Stream.
- **Tauri-Backend** mit registrierten Plugins (opener, dialog, notification, store) und Beispiel-Command.
- **GitHub-Actions-Release-Workflow** (`workflow_dispatch` ODER Tag `v*`).
- Typdefinitionen für Provider, Profile, Settings, Watchlist.

### Bewusst NICHT übernommen
- Die Einträge **Burning Series, Cine.to, Movie2k** aus der ursprünglichen Liste wurden nicht als Standard-Anbieter aufgenommen (illegale Streaming-Portale). Die Funktion „eigenen Anbieter hinzufügen" bleibt davon unberührt.

### Noch offen (Roadmap)
- TMDB-Anbindung (Suche, Watchlist-Metadaten, News, Upcoming) – geplant v0.2
- Streamzeit-Tracking & Statistik-Auswertung – geplant v0.2
- Profil-Verwaltung-UI, Onboarding, Achievements, Plugins, Uhr-Overlay, VPN, Auto-Updater – Folgeversionen
