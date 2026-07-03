# OmniSight

Zentraler **Streaming-Hub** als Windows-Desktop-App. Bündelt deine legalen
Streaming-Dienste in einem Fenster – mit Profilen, Watchlist, Statistiken und
TMDB-Metadaten.

**Tech-Stack:** Tauri v2 (Rust) · SvelteKit (Svelte 5) · Tailwind CSS v4

© 2026 Luka Kalinka. Proprietäre Software – siehe [LICENSE](./LICENSE).

---

## Zwei Auslieferungen, ein Code

| | Desktop (Windows) | Web (Docker) |
|---|---|---|
| Installation | `OmniSight_x.y.z_x64-setup.exe` aus den Releases | `docker compose up -d` |
| Streaming | eingebettet in der App | öffnet Anbieter in neuen Tabs |
| Login | Profile + optional PIN | **Login + 2FA (TOTP)**, Admin lädt Nutzer ein |
| Updates | Auto-Updater (signiert) | neues Image ziehen |

### Web-Version starten (Proxmox/Docker)
1. `.env.example` nach `.env` kopieren und `TMDB_API_KEY`, `ADMIN_USER`, `ADMIN_PASSWORD` setzen.
2. `docker compose up -d` → App läuft auf Port **8480**.
3. Erster Login mit dem Admin-Konto → 2FA einrichten (Authenticator-App).
4. Nutzer verwalten unter **`/admin`**. Zugriff am besten über **Tailscale** (privat) oder Tailscale Funnel (öffentlich, HTTPS → dann `COOKIE_SECURE=1`).

### Benötigte GitHub-Secrets (für Releases)
| Secret | Zweck |
|---|---|
| `TMDB_API_KEY` | wird beim Desktop-Build eingebettet (steht nie im Code) |
| `TAURI_SIGNING_PRIVATE_KEY` (+ `_PASSWORD`) | signiert den Auto-Updater |

Das Repo enthält **keine Secrets** und ist damit public-tauglich.

---

## Release bauen – komplett in GitHub, ohne lokale Installation

Du brauchst auf deinem PC **nichts** außer der fertigen `.exe`. Der gesamte Build
läuft auf GitHubs Servern:

1. Code liegt in GitHub (Bearbeiten geht direkt über die Weboberfläche).
2. **Actions-Tab → „Release" → *Run workflow*** klicken
   *(oder einen Tag pushen, z.B. `v0.2.0`).*
3. GitHub baut die App und **veröffentlicht den Release automatisch**.
4. Im **Releases-Tab** liegt die fertige `.exe` / der Installer zum Download.

> **Entwurf statt Veröffentlichung?** Beim manuellen Start (*Run workflow*)
> kannst du die Option **„Nur Entwurf statt veröffentlichtem Release?"** anhaken.
> Dann landet der Build als Entwurf im Releases-Tab und du veröffentlichst ihn
> selbst per **„Publish release"**.

---

## TMDB-Key eintragen (für Suche, News & Upcoming)

Damit Filmsuche, Neuigkeiten und Upcoming funktionieren, braucht OmniSight einen
**kostenlosen** TMDB-API-Key. Eintragen dauert ~1 Minute, alles im Browser:

1. Kostenlos registrieren: <https://www.themoviedb.org/signup>
2. Key beantragen: <https://www.themoviedb.org/settings/api>
   → „API Read Access Token" (v4) **oder** „API Key (v3 auth)" kopieren.
3. In GitHub die Datei **`src-tauri/src/tmdb.rs`** öffnen (Stift-Symbol zum Bearbeiten).
4. Die Zeile

   ```rust
   const TMDB_API_KEY: &str = "PASTE_YOUR_TMDB_KEY_HERE";
   ```

   ändern in (Beispiel):

   ```rust
   const TMDB_API_KEY: &str = "dein_key_hier";
   ```

5. Committen → nächsten Build starten. Fertig.

> Der Key liegt im fertigen Build und ist dort technisch auslesbar. TMDB-Keys
> sind kostenlos und ratenlimitiert, daher für ein Hobby-Projekt vertretbar.
> Ohne Key funktioniert die App normal weiter – nur die TMDB-Bereiche zeigen
> dann einen Hinweis statt Ergebnissen.

---

## Bedienung – Tastenkürzel

| Taste | Funktion |
|-------|----------|
| `F1` | Tastenkürzel-Übersicht |
| `Strg` + `K` | Suche fokussieren |
| `Strg` + `,` | Einstellungen öffnen |
| `Strg` + `D` | Hell-/Dunkel-Modus |
| `Esc` | Dialog schließen |

---

## Projektstruktur (Kurzüberblick)

- `src/routes` – Seiten (Übersicht, Watchlist, News, Upcoming, Statistiken, …)
- `src/lib/components` – Titelleiste, Sidebar, Karten, Modals
- `src/lib/stores` – Zustand (Einstellungen, Profile, Anbieter, Watchlist) mit Persistenz
- `src-tauri/src` – Rust-Backend inkl. `tmdb.rs`
- `.github/workflows/release.yml` – automatischer Build & Release

---

## Lizenz

Proprietär. Vervielfältigung, Weitergabe oder Veröffentlichung des Quellcodes
ist ohne ausdrückliche schriftliche Genehmigung **nicht** gestattet.
Details in [LICENSE](./LICENSE). Kontakt: zzickyzzacky@gmail.com
