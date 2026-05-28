# OmniHub

Zentraler **Streaming-Hub** als Windows-Desktop-App. Bündelt deine legalen
Streaming-Dienste in einem Fenster – mit Profilen, Watchlist, Statistiken und
TMDB-Metadaten.

**Tech-Stack:** Tauri v2 (Rust) · SvelteKit (Svelte 5) · Tailwind CSS v4

---

## Voraussetzungen

| Tool | Version | Zweck |
|---|---|---|
| Node.js | ≥ 20 | Frontend-Build |
| Rust (rustup) | stable | Tauri-Backend |
| Microsoft Edge WebView2 | — | unter Windows i.d.R. vorinstalliert |

Tauri-Systemvoraussetzungen: https://v2.tauri.app/start/prerequisites/

## Einrichten

```bash
npm install
```

## Entwicklung (App-Fenster)

```bash
npm run tauri:dev
```

> Reine Web-Vorschau (ohne Tauri-Funktionen) geht auch mit `npm run dev`
> und Öffnen von http://localhost:1420 im Browser.

## Build (Windows-Installer)

```bash
npm run tauri:build
```

Das fertige Paket liegt danach unter `src-tauri/target/release/bundle/`.

## Release über GitHub Actions

- **Manuell:** Actions-Tab → „Release" → *Run workflow*
- **Automatisch:** Tag pushen, z.B. `git tag v0.1.0 && git push origin v0.1.0`

## Links

- GitHub: https://github.com/P3rc1v4l/OmniHub
- Discord: https://discord.gg/tnfgta33uj
