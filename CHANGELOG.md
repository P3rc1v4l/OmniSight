## v2.1.0 — 2025

### 🐛 Bugfixes
- **Kritischer Fix**: `app.js` hatte 3× `DOMContentLoaded` + 2× `init()` + doppelte Funktionsdefinitionen → App zeigte komplett leere Übersicht
- **Build-Fix**: `installerName` ist kein gültiges NSIS-Property → entfernt
- **blockmap** wird nicht mehr erzeugt (`differentialPackage: false` in nsis + build)

### 🆕 Neue Features
- **Onboarding-Screen** (5 Schritte) beim ersten Start; jederzeit in Einstellungen → Mehr abrufbar
- **Watchlist-Sortierung**: A–Z, Datum aufsteigend/absteigend, Zuletzt gemerkt
- **„Zuletzt geöffnet"-Chips** oben in der Übersicht (letzte 4 Anbieter)
- **TMDB-Suche ab 2 Zeichen** mit kurzem Debounce
- **Session-Indikator**: grüner pulsierender Punkt auf Karten wenn eingeloggt
- **Shortcuts-Modal** (Taste `?` oder Button in Titelleiste) zeigt alle Tastenkürzel
- **Watchlist-Duplikat-Toast**: Toast wenn Inhalt bereits in der Liste

### 🔧 Verbesserungen
- **Statistiken-Button** direkt über Einstellungen in der Sidebar (unten)
- **Benachrichtigungen persistent**: pro Profil gespeichert, bleiben nach Neustart
- **Stream-Pause-Timer kumulativ**: 2h Gesamtzeit über Anbieterwechsel
- **Profilbilder als Base64** für Cross-Platform-Kompatibilität
- **Admin-Reset sicherer**: SHA-256-Hash statt Klartext-Datei

# OmniSight Changelog

## v2.0.0 — Major Release (2025)

### 🆕 Neue Features
- **Benachrichtigungs-Center** (Glocken-Button in Sidebar) mit Verlauf
- **Stream-Pause Erinnerung** alle 2h mit Push-Notification
- **Watchlist Export/Import** als JSON in Einstellungen → Mehr
- **Profil-System komplett überarbeitet**: Button statt Dropdown, eigenes Modal, Profilbild, PIN-Schutz, Admin-Reset (Strg+Shift+Alt+R)
- **"Bereits angeschaut" Verwaltung** in Statistiken mit Filter + Suche
- **CR Kalender als eigener Sidebar-Button** (keine Dropdown-Sektion mehr)
- **Anime-Kategorie** in Neuigkeiten & Upcoming
- **Custom CSS Editor** in Design-Einstellungen
- **Schriftart-Auswahl** in Design-Einstellungen
- **10 neue Achievements** (Weekend Warrior, Explorer, Disney/Prime/HBO-Fan, Binge Master, Decade, u.v.m.)

### 🔧 Verbesserungen
- Stift-Button in Karte: erscheint links oben beim Hover, unter Quality-Badge
- Favoriten-Stern: gelb wenn aktiv, nur beim Hover sichtbar; Banner mit mehr Abstand
- Sortierung hebt sich auf wenn Karten manuell verschoben werden
- Slideshow-Timer pausiert während Kartendetails offen sind
- „Ausgeblendete Karten": kein X-Button, schließt beim Außen-Klick, Einblenden-Button nur beim Hover
- Sort-Button neu gestaltet (Icon + Label A–Z / Z–A)
- Profil-Dropdown ist jetzt ein moderner Button mit eigenem Wechsel-Modal
- Statistiken: Wochentags-Ansicht verbessert, Trakt.tv / VPN / Multi-Window entfernt
- Light-Mode: Schriftfarbe deutlich dunkler
- Einstellungen „Mehr" komplett neu strukturiert (Updates, VPN, WideVine, Watchlist)
- Plugin-Tab: Suchleiste entfernt, „Installierte Listen" entfernt, moderne Buttons
- Uhr-Kontextmenü: Digital/Analog-Toggle, Farb-Reset auf #cfcfcf / 50% / 36px
- Versionsanzeige klickbar → öffnet „Mehr"-Tab direkt
- Partikel-Einstellungen im Design-Tab vollständig zugänglich
- Anbieter-Karten öffnen wieder korrekt beim Klick
- Suchverlauf: X-Löschen-Button moderner gestaltet, rechts positioniert
- Übersetzung greift jetzt auf alle Views, Kategorien und Einstellungen
- Favoriten und Anbieter aus dem linken Balken entfernt (Punkt 13)

### 🐛 Bugfixes
- Hintergrundbild-Picker öffnet Datei-Explorer wieder korrekt
- Karten-Klick-Handling (mousedown/mouseup) verhindert versehentliches Öffnen beim Ziehen

## v1.2.0
- Initiale veröffentlichte Version
