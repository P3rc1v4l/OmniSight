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
