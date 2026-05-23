# OmniSight 🎬

**Dein zentrales Streaming-Hub** – Netflix, Prime, Disney+, YouTube, Twitch, Crunchyroll und 20+ weitere Anbieter in einer App.

---

## ✨ Features

- **25+ Streaming-Anbieter** in einer Oberfläche
- **Anbieter-Kategorien** (Streaming, Anime, Live & Sport, Musik, Kostenlos)
- **Watchlist** für Filme, Serien und Anime – mit TMDB-Integration
- **Neuigkeiten & Upcoming** mit Trailer-Vorschau und Streaming-Verfügbarkeit
- **Statistiken & Achievements** – verfolge deine Streaming-Gewohnheiten
- **CR Kalender** – Crunchyroll-Release-Übersicht
- **Profile** mit PIN-Schutz und eigenem Profilbild
- **Benachrichtigungs-Center** mit Pause-Erinnerung nach 2h
- **Quick-Launcher** (Taste `N`) für schnellen Anbieter-Start
- **Anbieter-Editor** mit Live-Vorschau
- **Partikel-Hintergrund**, animierter Splashscreen und Dark/Light-Mode
- **AdBlocker** integriert
- **Auto-Update** – neue Versionen werden automatisch erkannt und installiert

---

## 🚀 Installation

1. Neueste `.exe` von [Releases](https://github.com/P3rc1v4l/OmniSight/releases) herunterladen
2. Installer ausführen → OmniSight startet automatisch
3. Beim ersten Start: Onboarding führt durch Grundeinstellungen

> **Hinweis:** Windows SmartScreen kann beim ersten Start warnen – das liegt daran, dass die App noch kein kommerzielles Zertifikat hat. „Trotzdem ausführen" auswählen.

---

## ⌨️ Tastenkürzel

| Taste | Funktion |
|-------|----------|
| `N` | Quick-Launcher öffnen |
| `F11` | Vollbild umschalten |
| `Strg + F` | Suche fokussieren |
| `?` | Tastenkürzel-Übersicht |
| `Esc` | Vollbild beenden |
| `Strg + Shift + Alt + R` | Admin: PIN zurücksetzen |

---

## 🔄 Auto-Update

OmniSight prüft beim Start automatisch ob eine neue Version verfügbar ist. Wenn ja, erscheint ein Banner mit Download- und Installieren-Button. Die neue Version wird nach dem nächsten Neustart aktiv.

---

## 📁 Projektstruktur

```
OmniSight/
├── src/
│   ├── main.js          # Electron Hauptprozess
│   ├── preload.js       # IPC Bridge
│   ├── index.html       # App-UI
│   ├── splash.html      # Animierter Ladebildschirm
│   ├── js/app.js        # Frontend-Logik
│   └── css/style.css    # Styling
├── scripts/
│   ├── generate-icons.js # Icon-Generierung
│   ├── fuses.js          # Electron Sicherheits-Fuses
│   └── create-cert.ps1   # Self-Signed Zertifikat (optional)
└── .github/workflows/
    └── build.yml         # GitHub Actions Build
```

---

## ⚖️ Lizenz

Proprietäre Software – siehe [LICENSE](LICENSE).
Kontakt: zzickyzzacky@gmail.com
