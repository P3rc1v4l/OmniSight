# OmniSight Changelog

## v2.2.0 — 2025

### 🐛 Bugfixes
- **Build-Fix**: `differentialPackage` ist kein gültiges Root-Property in electron-builder 24.x → entfernt
- **Build-Fix**: `differentialPackage` auch aus `nsis`-Block entfernt (nur in `nsis`-Block erlaubt ab bestimmten Versionen, aber nicht in 24.13.x)
- Electron auf `^33.0.0` aktualisiert (Sicherheits-Update, mehrere CVEs in v29 behoben)

### 🆕 Neue Features
- **Profil-Avatar in Titelleiste**: Zeigt aktives Profil-Bild/Initial-Buchstaben – klickbar zum Profilwechsel
- **Keyboard-Navigation im Onboarding**: Pfeiltasten links/rechts navigieren zwischen Schritten, Escape schließt
- **TMDB-Offline-Cache**: Suchergebnisse werden 5 Minuten gecacht – bei kurzzeitig schlechter Verbindung funktioniert die Suche trotzdem
- **Strg+F**: Suche wird fokussiert und Text selektiert (nicht nur fokussiert)

### 🔧 Verbesserungen
- **AbortController für TMDB-Suche**: Vorherige API-Anfragen werden abgebrochen wenn neue Eingabe kommt – kein unnötiger Traffic mehr
- **allowpopups nur für multiTab-Provider**: Twitch, YouTube, BurningSeries etc. – alle anderen Webviews erlauben keine Popups mehr (Sicherheit)
- **URL-Protokoll-Whitelist**: Öffnen von `file://`, `javascript:` etc. via Provider-Click wird blockiert
- **Race-Condition-Schutz**: Settings und Profile schreiben nicht mehr parallel in den Store
- **CSP für Multi-Window**: Eigene Content-Security-Policy im zweiten Fenster

## v2.1.0 — 2025

### 🐛 Bugfixes
- **Kritischer Fix**: `app.js` hatte 3× DOMContentLoaded, 2× init(), doppelte Funktionen → App zeigte leere Übersicht
- **Build-Fix**: `installerName` ist kein gültiges NSIS-Property → entfernt

### 🆕 Neue Features
- Onboarding-Screen (5 Schritte) beim ersten Start
- Watchlist-Sortierung (A–Z, Datum ↑↓, Zuletzt gemerkt)
- „Zuletzt geöffnet"-Chips in der Übersicht
- TMDB-Suche ab 2 Zeichen
- Session-Indikator auf Karten (grüner Punkt wenn eingeloggt)
- Shortcuts-Modal (Taste ?)
- Watchlist-Duplikat-Toast

### 🔧 Verbesserungen
- Statistiken-Button direkt über Einstellungen
- Benachrichtigungen persistent (pro Profil)
- Stream-Pause-Timer kumulativ
- Profilbilder als Base64
- Admin-Reset über SHA-256-Hash (Strg+Shift+Alt+R)

## v2.0.0 — 2025
- Kompletter Umbau: Benachrichtigungs-Center, Profil-System, CR Kalender, Anime-Kategorie,
  Custom CSS, Schriftart-Auswahl, 10 neue Achievements, WideVine-Integration,
  Watchlist Export/Import, Push-Pause-Erinnerung, Session-Indikator u.v.m.

## v1.2.0
- Initiale veröffentlichte Version
