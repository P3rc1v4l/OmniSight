# OmniHub

**Dein zentraler Streaming-Hub** – Netflix, Prime, Disney+, YouTube, Twitch und viele mehr an einem Ort.

Gebaut mit [Tauri v2](https://tauri.app/) + Edge WebView (Windows).

---

## Features

- 📺 **25+ Streaming-Anbieter** in einem Fenster
- 🔐 **WideVine eingebaut** – via Edge WebView, kein Setup nötig
- 📌 **Watchlist** mit TMDB-Metadaten
- 📊 **Statistiken & Achievements** (30+ freischaltbar)
- 👤 **Multi-Profile** mit PIN-Schutz
- 🎨 **Dark/Light Theme**, Partikel-Hintergrund, Glassmorphismus
- 🔔 **Push-Benachrichtigungen** (Pause-Erinnerungen, Updates)
- 🎬 **Detail-Ansicht** mit Trailer, Ratings & Streaming-Verfügbarkeit

---

## Installation

1. Lade die neueste `.exe` von den [Releases](https://github.com/P3rc1v4l/OmniHub/releases) herunter
2. Installer ausführen
3. Fertig – WideVine ist bereits via Edge WebView eingebaut

---

## Entwicklung

```bash
# Voraussetzungen: Node.js 20+, Rust stable, Microsoft Edge (WebView2)

npm install
npm run dev      # Development-Server
npm run build    # Production-Build
```

---

## Build & Release

Der GitHub Actions Workflow baut automatisch eine Windows-EXE:

- **Manuell**: GitHub → Actions → „Build & Release OmniHub" → Run workflow
- **Automatisch**: Bei Tag `v*` wird automatisch ein Release erstellt

**Secrets** die du in GitHub hinterlegen musst:
- `TAURI_PRIVATE_KEY` – Code-Signing-Key (für Auto-Updates)
- `TAURI_KEY_PASSWORD` – Passwort des Keys

---

## Feedback & Support

- 💬 [Discord-Server](https://discord.gg/tnfgta33uj) – für schnellen Support
- 🐛 [GitHub Issues](https://github.com/P3rc1v4l/OmniHub/issues) – für Bugs & Feature-Requests

---

## Lizenz

MIT – © 2026 P3rc1v4l
