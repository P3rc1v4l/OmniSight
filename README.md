# 🎬 Aletheos Stream

**Dein zentraler Streaming-Hub** – Netflix, Prime Video, Disney+, Crunchyroll, BurningSeries und Cine.to in einer modernen Desktop-App.

![Aletheos Stream](https://img.shields.io/badge/Electron-29-47848F?style=flat&logo=electron)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## ✨ Features

- **6 Streaming-Anbieter** in einer App
- **Anmeldung wird gespeichert** – einmal einloggen, immer eingeloggt
- **Dark & Light Mode** per Schieberegler
- **Modernes Design** mit Glasmorphismus-Effekten
- **Frameless Window** mit eigener Titelleiste
- Läuft auf Windows, macOS und Linux

---

## 🚀 Schnellstart (Entwicklung)

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder neuer)
- npm (wird mit Node.js mitgeliefert)

### Installation

```bash
# Repository klonen
git clone https://github.com/DEIN-USERNAME/aletheos-stream.git
cd aletheos-stream

# Abhängigkeiten installieren
npm install

# App starten
npm start
```

---

## 📦 Als .exe bauen (Windows)

```bash
# Abhängigkeiten installieren
npm install

# Windows-Build erstellen (.exe Installer)
npm run build
```

Die fertige `.exe` findest du danach im Ordner `dist/`.

> **Hinweis:** Beim ersten Build wird Electron heruntergeladen (~80 MB). Das kann einen Moment dauern.

### Build für andere Plattformen

```bash
# macOS (.dmg)
npm run build:mac

# Linux (.AppImage)
npm run build:linux
```

---

## 📁 Projektstruktur

```
aletheos-stream/
├── src/
│   ├── main.js          ← Electron Main Process
│   ├── preload.js       ← Sicherer IPC-Bridge
│   ├── index.html       ← Haupt-UI
│   ├── css/
│   │   └── style.css    ← Styles (Dark/Light Mode)
│   ├── js/
│   │   └── app.js       ← Frontend-Logik
│   └── assets/
│       └── icon.png     ← App-Icon (512x512 empfohlen)
├── package.json
├── .gitignore
└── README.md
```

---

## 🎨 Anbieter hinzufügen

In `src/js/app.js` die `PROVIDERS`-Konstante erweitern:

```javascript
const PROVIDERS = {
  // Bestehende Anbieter...
  meinAnbieter: {
    name: 'Mein Anbieter',
    url: 'https://meinanbieter.de',
    partition: 'persist:meinanbieter'  // wichtig: persist: Prefix!
  },
};
```

Dann in `src/index.html` eine neue Provider-Card im Grid hinzufügen:

```html
<div class="provider-card" data-id="meinAnbieter" data-url="https://meinanbieter.de">
  <div class="provider-bg" style="--card-color: #FF6B6B;"></div>
  <div class="provider-logo"><!-- Logo hier --></div>
  <div class="provider-info">
    <span class="provider-name">Mein Anbieter</span>
    <span class="provider-tag">Kategorie</span>
  </div>
  <div class="provider-arrow">→</div>
</div>
```

---

## 🔒 Datenschutz & Sessions

Die App speichert Cookies und Sessions **lokal auf deinem Gerät** mithilfe von Electrons `partition`-System. Jeder Anbieter hat seine eigene isolierte Session. Deine Anmeldedaten verlassen deinen Computer nicht.

Session-Dateien befinden sich unter:
- **Windows:** `%APPDATA%\aletheos-stream`
- **macOS:** `~/Library/Application Support/aletheos-stream`
- **Linux:** `~/.config/aletheos-stream`

---

## 🛠️ Technologien

| Technologie | Verwendung |
|-------------|-----------|
| [Electron](https://electronjs.org) | Desktop-App-Framework |
| [electron-store](https://github.com/sindresorhus/electron-store) | Persistente Einstellungen |
| [electron-builder](https://www.electron.build) | Packaging & Installer |

---

## ⚠️ Hinweis

Diese App ist ein persönlicher Streaming-Hub und lädt die offiziellen Webseiten der Anbieter in einem eingebetteten Browser. Für die Nutzung benötigst du gültige, eigene Accounts bei den jeweiligen Diensten.

---

## 📄 Lizenz

MIT License – siehe [LICENSE](LICENSE)
