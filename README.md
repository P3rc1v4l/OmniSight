# 🎬 OmniSight

**Dein zentraler Streaming-Hub** – Netflix, Prime Video, Disney+, Crunchyroll, YouTube, Twitch, BurningSeries, Cine.to und 20+ weitere Anbieter in einer modernen Desktop-App.

![Version](https://img.shields.io/badge/Version-1.1.1-30c5bb?style=flat)
![Electron](https://img.shields.io/badge/Electron-29-47848F?style=flat&logo=electron)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## ✨ Features

- **26+ Streaming-Anbieter** in einer App (Netflix, Prime, Disney+, Crunchyroll, YouTube, Twitch, ARD, ZDF, ARTE, Spotify uvm.)
- **Multi-Profil** – Jedes Profil hat eigene Anmeldungen, Favoriten, Watchlist und Statistiken
- **Neuigkeiten & Upcoming** – Aktuelle Filme/Serien/Anime aus Deutschland via TMDB
- **Crunchyroll Release-Kalender** – Kommende Anime-Episoden auf Crunchyroll DE
- **Suche** – Filme & Serien suchen, Streaming-Anbieter direkt öffnen
- **Watchlist / Gemerkt** – Filme, Serien und Anime für später speichern
- **Statistiken & Achievements** – Streamzeit, Wochenanalyse, freischaltbare Achievements
- **Miniplayer (PiP)** – Stream in kleinem Fenster weiterlaufen lassen
- **Multi-Tab** – Mehrere Tabs für Twitch, YouTube, BurningSeries und Cine.to
- **Anpassbare Karten** – Hintergrundbild, Farbe, Name, Beschreibung pro Anbieter
- **Dark & Light Mode** – Per Schieberegler
- **Partikel-Hintergrund** – 10 Formen, farblich und größenmäßig einstellbar
- **Uhr-Widget** – Analogig oder digital, verschiebbar
- **Ad-Blocker** – Integriert mit optionalen Filterlisten (AdBlock, EasyPrivacy, etc.)
- **Widevine CDM** – DRM-Unterstützung für Netflix, Disney+ etc. (CDM manuell installierbar)
- **Auto-Update** – Automatische Prüfung auf neue GitHub-Releases

---

## 🚀 Schnellstart (Entwicklung)

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 20 oder neuer)
- npm (wird mit Node.js mitgeliefert)

### Installation

```bash
# Repository klonen
git clone https://github.com/P3rc1v4l/OmniSight.git
cd OmniSight

# Abhängigkeiten installieren
npm install

# App starten
npm start
```

---

## 📦 Als .exe bauen (Windows)

```bash
npm install
npm run build
```

Die fertige `.exe` findest du danach im Ordner `dist/`.

### Icon generieren (optional)

```bash
npm run make-icon
```

### Build für andere Plattformen

```bash
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage)
```

---

## 📁 Projektstruktur

```
OmniSight/
├── src/
│   ├── main.js          ← Electron Main Process
│   ├── preload.js       ← Sicherer IPC-Bridge
│   ├── splash.html      ← Startbildschirm
│   ├── index.html       ← Haupt-UI
│   ├── css/
│   │   └── style.css    ← Alle Styles (Dark/Light Mode)
│   ├── js/
│   │   └── app.js       ← Frontend-Logik (~2000 Zeilen)
│   └── assets/
│       ├── icon.png     ← App-Icon
│       └── icon.ico     ← Windows-Icon (transparent)
├── scripts/
│   └── generate-icons.js ← Icon-Generator
├── .github/
│   └── workflows/
│       └── build.yml    ← GitHub Actions CI/CD
├── package.json
└── README.md
```

---

## 🔒 Widevine CDM (DRM)

Für Netflix, Disney+ und andere DRM-geschützte Dienste wird Widevine CDM benötigt.

1. CDM herunterladen: [electron-widevinecdm](https://github.com/nicehash/electron-widevinecdm)
2. Datei ablegen unter:
   - **Windows:** `%APPDATA%\omnisight\WidevineCdm\widevinecdm.dll`
   - **macOS:** `~/Library/Application Support/omnisight/WidevineCdm/libwidevinecdm.dylib`
   - **Linux:** `~/.config/omnisight/WidevineCdm/libwidevinecdm.so`

---

## 🔒 Datenschutz & Sessions

Sessions werden **lokal** gespeichert – deine Anmeldedaten verlassen deinen Computer nicht.

- **Windows:** `%APPDATA%\omnisight`
- **macOS:** `~/Library/Application Support/omnisight`
- **Linux:** `~/.config/omnisight`

---

## 📄 Lizenz

MIT License – siehe [LICENSE](LICENSE)
