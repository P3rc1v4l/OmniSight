# Browser-Erweiterungen (nur Windows)

Dieser Ordner wird **mit der App ausgeliefert** (als Tauri-Ressource) und beim
Start als WebView2-Erweiterungs-Pfad genutzt. Eingebettete Streams können daraus
**Chromium-Erweiterungen** laden (z. B. den Werbeblocker uBlock Origin).

Aktiviert wird das **pro Anbieter**: im Karten-Editor den Schalter
**„Werbeblocker (nur Windows)"** einschalten. Ohne Schalter passiert nichts.

## uBlock Origin wird automatisch geholt

Der Release-Workflow (`.github/workflows/release.yml`) lädt beim Build die
**neueste** uBlock-Origin-Erweiterung herunter und entpackt sie hierher nach
`uBlock0.chromium/`. Du musst dafür **nichts** tun und **nichts** committen –
die Dateien werden absichtlich per `.gitignore` aus dem Repo herausgehalten.

uBlock pflegt seine **Filterlisten** (EasyList usw.) zur Laufzeit selbst – du
bleibst also automatisch aktuell.

## Lokaler Build (optional)

Wenn du lokal (mit Rust) baust, die Erweiterung manuell herlegen:

1. `uBlock0_x.x.x.chromium.zip` vom offiziellen GitHub-Release laden.
2. Entpacken, sodass hier `uBlock0.chromium/manifest.json` liegt.

## Weitere Erweiterungen (z. B. BetterTTV)

Jede weitere Erweiterung kommt als eigener Unterordner mit eigener
`manifest.json` hierher. Der Erweiterungs-Pfad zeigt auf **diesen** Ordner;
jeder Unterordner wird als eigene Erweiterung geladen.

## Hinweise / Grenzen

- **Nur Windows** – WebView2 unterstützt Erweiterungen, WebKit (macOS/Linux) nicht.
- Wirkt nur im **eingebetteten** Stream-Modus (nicht im Fenster-Fallback).
- uBlock Origin ist eine **Manifest-V2**-Erweiterung. Falls eine künftige
  WebView2-Runtime nur noch MV3 lädt, ggf. auf „uBlock Origin Lite" wechseln.
- Ob das Laden im **Release-Build** genauso klappt wie im Debug-Build, muss am
  echten Build getestet werden – Eigenheit von WebView2/Tauri.
- uBlock Origin steht unter **GPLv3**. Es wird unverändert mitgeliefert (eigene
  Lizenzdatei bleibt enthalten) – das ist eine zulässige Aggregation und ändert
  nichts an der Lizenz von OmniSight.
- Keine Erweiterungen ablegen, die Captchas/Bot-Erkennung umgehen.
