// OmniSight – Rust-Backend (Tauri v2).

mod tmdb;
mod discord;
mod anilist;
mod favicon;

/// Liest die gespeicherte Einstellung „Hardware-Beschleunigung" aus der Store-Datei
/// (dieselbe Datei, die das Frontend über tauri-plugin-store schreibt) – und zwar
/// BEVOR das Fenster/Webview erzeugt wird. Schlägt das Lesen fehl, bleibt die GPU
/// aktiv (sicherer Standard). Windows: %APPDATA%\<identifier>\omnihub.json.
/// Daten-Kennungen ab v0.67.0. Die Migration kopiert ggf. die alten Daten herüber.
const APP_IDENTIFIER: &str = "com.p3rc1v4l.omnisight";
const STORE_FILE: &str = "omnisight.json";
const OLD_IDENTIFIER: &str = "com.p3rc1v4l.omnihub";
const OLD_STORE_FILE: &str = "omnihub.json";

/// Einmalige Migration: kopiert alte App-Daten (com.p3rc1v4l.omnihub\omnihub.json)
/// in den neuen Ordner (com.p3rc1v4l.omnisight\omnisight.json) – aber nur, wenn dort
/// noch nichts liegt. Alle weiteren Dateien (z. B. Fensterzustand) werden 1:1
/// mitkopiert. Best effort: Fehler werden ignoriert, das alte Verzeichnis bleibt
/// als Sicherung unangetastet.
fn migrate_appdata() {
    let Ok(appdata) = std::env::var("APPDATA") else { return; };
    let base = std::path::Path::new(&appdata);
    let new_dir = base.join(APP_IDENTIFIER);
    let new_store = new_dir.join(STORE_FILE);
    if new_store.exists() {
        return; // bereits migriert oder schon in Benutzung
    }
    let old_dir = base.join(OLD_IDENTIFIER);
    let old_store = old_dir.join(OLD_STORE_FILE);
    if !old_store.exists() {
        return; // nichts zu migrieren (Neuinstallation)
    }
    let _ = std::fs::create_dir_all(&new_dir);
    let _ = std::fs::copy(&old_store, &new_store); // omnihub.json -> omnisight.json
    if let Ok(entries) = std::fs::read_dir(&old_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_file() {
                if let Some(name) = p.file_name() {
                    if name == std::ffi::OsStr::new(OLD_STORE_FILE) {
                        continue; // Haupt-Store wurde schon umbenannt kopiert
                    }
                    let _ = std::fs::copy(&p, new_dir.join(name));
                }
            }
        }
    }
}

fn hw_accel_disabled() -> bool {
    let Ok(appdata) = std::env::var("APPDATA") else { return false; };
    let path = std::path::Path::new(&appdata)
        .join(APP_IDENTIFIER)
        .join(STORE_FILE);
    let Ok(text) = std::fs::read_to_string(path) else { return false; };
    let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) else { return false; };
    matches!(
        json.get("settings")
            .and_then(|s| s.get("plugins"))
            .and_then(|p| p.get("hardwareAcceleration"))
            .and_then(|v| v.as_bool()),
        Some(false)
    )
}

/// Liest einen Bool aus settings.plugins.<key> der Store-Datei (oder None).
fn plugin_bool(key: &str) -> Option<bool> {
    let appdata = std::env::var("APPDATA").ok()?;
    let path = std::path::Path::new(&appdata)
        .join(APP_IDENTIFIER)
        .join(STORE_FILE);
    let text = std::fs::read_to_string(path).ok()?;
    let json = serde_json::from_str::<serde_json::Value>(&text).ok()?;
    json.get("settings")
        .and_then(|s| s.get("plugins"))
        .and_then(|p| p.get(key))
        .and_then(|v| v.as_bool())
}

/// Laufzeit-Schalter „Beim Schließen in den Tray" (vom Frontend gesetzt).
#[derive(Default)]
struct TrayState {
    close_to_tray: std::sync::atomic::AtomicBool,
}

#[tauri::command]
fn set_close_to_tray(state: tauri::State<TrayState>, enabled: bool) {
    state
        .close_to_tray
        .store(enabled, std::sync::atomic::Ordering::Relaxed);
}

/// Hauptfenster zeigen, wiederherstellen und fokussieren.
fn show_main<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    use tauri::Manager;
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

/// Gibt die installierte WebView2-Laufzeit-Version zurück (für die Diagnose in den
/// Einstellungen). Schlägt der Aufruf fehl, fehlt die WebView2-Runtime vermutlich.
#[tauri::command]
fn webview2_version() -> Result<String, String> {
    tauri::webview_version().map_err(|e| e.to_string())
}

/// Erzeugt eine eingebettete Anbieter-Webview als Kind des Hauptfensters – MIT
/// Absicherung: Navigation nur zu http(s)/about/data (fremde Schemata wie file: werden
/// blockiert), und automatische Downloads werden unterbunden. Scheitert das Erzeugen,
/// fällt das Frontend auf den Fenster-Modus zurück (Streaming bricht nicht ab).
#[tauri::command]
async fn create_embedded_webview(
    app: tauri::AppHandle,
    label: String,
    url: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<(), String> {
    use tauri::webview::WebviewBuilder;
    use tauri::{LogicalPosition, LogicalSize, Manager, WebviewUrl};

    let window = app
        .get_window("main")
        .ok_or_else(|| "Hauptfenster nicht gefunden".to_string())?;
    let parsed: tauri::Url = url.parse().map_err(|_| "Ungültige URL".to_string())?;

    let builder = WebviewBuilder::new(&label, WebviewUrl::External(parsed))
        .on_navigation(|u| {
            // Nur normale Web-Navigation zulassen.
            matches!(u.scheme(), "http" | "https" | "about" | "data" | "blob")
        })
        .on_download(|_webview, _event| {
            // Downloads in eingebetteten Streams blockieren.
            false
        });

    window
        .add_child(
            builder,
            LogicalPosition::new(x, y),
            LogicalSize::new(width, height),
        )
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Grobe Erreichbarkeitsprüfung einer Anbieter-URL. JEDE HTTP-Antwort (auch 403/404)
/// bedeutet „Server erreichbar"; nur Verbindungs-/DNS-/Timeout-Fehler gelten als
/// nicht erreichbar. Das ist KEIN Login-/Service-Status. Server-seitig in Rust, daher
/// kein CORS/CSP und kein falsches „rot", nur weil ein Favicon fehlt.
#[tauri::command]
async fn check_reachable(url: String) -> bool {
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
    {
        Ok(c) => c,
        Err(_) => return false,
    };
    // Erst HEAD (sparsam); manche Server mögen kein HEAD -> dann GET als Rückfall.
    if client
        .head(&url)
        .header("User-Agent", "Mozilla/5.0 (OmniSight)")
        .send()
        .await
        .is_ok()
    {
        return true;
    }
    client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (OmniSight)")
        .send()
        .await
        .is_ok()
}

/// Schaltet einen eingebetteten Stream (per Webview-Label) stumm bzw. wieder laut.
/// Tauri bietet kein direktes Audio-Mute, daher setzen wir im Webview alle
/// <video>/<audio>-Elemente auf muted und beobachten DOM-Änderungen mit, weil
/// Player (z.B. Twitch) das Video-Element zur Laufzeit austauschen.
/// Sonderfall Spotify: Spotify spielt über Web Audio (kein <audio>-Element), daher
/// wird dort einmalig der Play/Pause-Button geklickt (muted=pausieren, unmuted=abspielen).
#[tauri::command]
fn webview_set_muted(app: tauri::AppHandle, label: String, muted: bool) -> Result<(), String> {
    use tauri::Manager;
    let wv = app
        .get_webview(&label)
        .ok_or_else(|| format!("Webview '{}' nicht gefunden", label))?;
    let val = if muted { "true" } else { "false" };
    let js = String::from(
        "(function(){window.__omniMuted=__M__;function c(r,o){try{if(!r||!r.querySelectorAll)return;r.querySelectorAll('video,audio').forEach(function(e){o.push(e)});r.querySelectorAll('*').forEach(function(e){if(e.shadowRoot)c(e.shadowRoot,o)});r.querySelectorAll('iframe').forEach(function(f){try{if(f.contentDocument)c(f.contentDocument,o)}catch(_){}})}catch(_){}}function a(){var o=[];c(document,o);o.forEach(function(e){try{e.muted=window.__omniMuted}catch(_){}})}a();if(!window.__omniMuteObs){var t;window.__omniMuteObs=new MutationObserver(function(){clearTimeout(t);t=setTimeout(a,400)});try{window.__omniMuteObs.observe(document.documentElement,{childList:true,subtree:true})}catch(_){}}try{if((location.host||'').indexOf('spotify')!==-1){var sb=document.querySelector('[data-testid=\"control-button-playpause\"]');if(!sb){var cs=document.querySelectorAll('button[aria-label]');for(var i=0;i<cs.length;i++){var al=(cs[i].getAttribute('aria-label')||'').toLowerCase();if(al.indexOf('paus')!==-1||al.indexOf('anhalt')!==-1||al.indexOf('play')!==-1||al.indexOf('wiederg')!==-1||al.indexOf('abspiel')!==-1){sb=cs[i];break;}}}if(sb){var L=(sb.getAttribute('aria-label')||'').toLowerCase();var known=L.indexOf('paus')!==-1||L.indexOf('anhalt')!==-1||L.indexOf('play')!==-1||L.indexOf('wiederg')!==-1||L.indexOf('abspiel')!==-1;var playing=L.indexOf('paus')!==-1||L.indexOf('anhalt')!==-1;if(known){if(window.__omniMuted&&playing)sb.click();else if(!window.__omniMuted&&!playing)sb.click();}}}}catch(_){}})();",
    )
    .replace("__M__", val);
    wv.eval(&js).map_err(|e| e.to_string())
}

/// Setzt die Lautstärke (0.0–1.0) eines eingebetteten Streams per Label. Wie beim Mute
/// über alle Medien-Elemente + Beobachter, falls der Player sein Video-Element austauscht.
/// Sonderfall Spotify (Web Audio, kein <audio>): bestmöglicher Versuch über den
/// Lautstärke-Regler der Oberfläche (Input-Range bzw. Klick auf die Leiste).
#[tauri::command]
fn webview_set_volume(app: tauri::AppHandle, label: String, volume: f64) -> Result<(), String> {
    use tauri::Manager;
    let wv = app
        .get_webview(&label)
        .ok_or_else(|| format!("Webview '{}' nicht gefunden", label))?;
    let v = if volume < 0.0 { 0.0 } else if volume > 1.0 { 1.0 } else { volume };
    let js = String::from(
        "(function(){window.__omniVol=__V__;function c(r,o){try{if(!r||!r.querySelectorAll)return;r.querySelectorAll('video,audio').forEach(function(e){o.push(e)});r.querySelectorAll('*').forEach(function(e){if(e.shadowRoot)c(e.shadowRoot,o)});r.querySelectorAll('iframe').forEach(function(f){try{if(f.contentDocument)c(f.contentDocument,o)}catch(_){}})}catch(_){}}function a(){var o=[];c(document,o);o.forEach(function(e){try{e.volume=window.__omniVol}catch(_){}})}a();if(!window.__omniVolObs){var t;window.__omniVolObs=new MutationObserver(function(){clearTimeout(t);t=setTimeout(a,400)});try{window.__omniVolObs.observe(document.documentElement,{childList:true,subtree:true})}catch(_){}}try{if((location.host||'').indexOf('spotify')!==-1){var r=Math.max(0,Math.min(1,window.__omniVol));var vi=document.querySelector('[data-testid=\"volume-bar\"] input[type=range]')||document.querySelector('input[type=range][aria-label*=\"olum\" i],input[type=range][aria-label*=\"autst\" i]');if(vi){var mx=parseFloat(vi.max||'1')||1;var setv=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;setv.call(vi,String(r*mx));vi.dispatchEvent(new Event('input',{bubbles:true}));vi.dispatchEvent(new Event('change',{bubbles:true}));}else{var bar=document.querySelector('[data-testid=\"volume-bar\"]');var cl=bar?(bar.querySelector('[data-testid=\"progress-bar\"]')||bar.firstElementChild||bar):null;if(cl){var rc=cl.getBoundingClientRect();var x=rc.left+rc.width*r;var y=rc.top+rc.height/2;['pointerdown','pointerup','click'].forEach(function(t){try{cl.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y}))}catch(_){}});}}}}catch(_){}})();",
    )
    .replace("__V__", &format!("{:.3}", v));
    wv.eval(&js).map_err(|e| e.to_string())
}

/// Pausiert/spielt einen eingebetteten Stream per Label. Generisch über alle Medien-
/// Elemente (pause()/play()); Spotify über den Play/Pause-Button. Einmalig (kein
/// Beobachter), damit Nutzeraktionen nicht überschrieben werden.
#[tauri::command]
fn webview_set_paused(app: tauri::AppHandle, label: String, paused: bool) -> Result<(), String> {
    use tauri::Manager;
    let wv = app
        .get_webview(&label)
        .ok_or_else(|| format!("Webview '{}' nicht gefunden", label))?;
    let val = if paused { "true" } else { "false" };
    let js = String::from(
        "(function(){window.__omniPaused=__P__;function c(r,o){try{if(!r||!r.querySelectorAll)return;r.querySelectorAll('video,audio').forEach(function(e){o.push(e)});r.querySelectorAll('*').forEach(function(e){if(e.shadowRoot)c(e.shadowRoot,o)});r.querySelectorAll('iframe').forEach(function(f){try{if(f.contentDocument)c(f.contentDocument,o)}catch(_){}})}catch(_){}}var o=[];c(document,o);o.forEach(function(e){try{if(window.__omniPaused)e.pause();else{var pr=e.play();if(pr&&pr.catch)pr.catch(function(){})}}catch(_){}});try{if((location.host||'').indexOf('spotify')!==-1){var sb=document.querySelector('[data-testid=\"control-button-playpause\"]');if(!sb){var cs=document.querySelectorAll('button[aria-label]');for(var i=0;i<cs.length;i++){var al=(cs[i].getAttribute('aria-label')||'').toLowerCase();if(al.indexOf('paus')!==-1||al.indexOf('anhalt')!==-1||al.indexOf('play')!==-1||al.indexOf('wiederg')!==-1||al.indexOf('abspiel')!==-1){sb=cs[i];break;}}}if(sb){var L=(sb.getAttribute('aria-label')||'').toLowerCase();var known=L.indexOf('paus')!==-1||L.indexOf('anhalt')!==-1||L.indexOf('play')!==-1||L.indexOf('wiederg')!==-1||L.indexOf('abspiel')!==-1;var playing=L.indexOf('paus')!==-1||L.indexOf('anhalt')!==-1;if(known){if(window.__omniPaused&&playing)sb.click();else if(!window.__omniPaused&&!playing)sb.click();}}}}catch(_){}})();",
    )
    .replace("__P__", val);
    wv.eval(&js).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Einmalige Daten-Migration vom alten Identifier auf den neuen – MUSS vor dem
    // ersten Store-Zugriff (hw_accel_disabled) laufen.
    migrate_appdata();

    // Hardware-Beschleunigung ggf. abschalten. WebView2 liest dieses Env-Var beim
    // Anlegen seiner Umgebung – es muss daher VOR dem Fenster gesetzt werden.
    if hw_accel_disabled() {
        let prev = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
        let combined = format!("{} --disable-gpu --disable-gpu-compositing", prev);
        std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined.trim());
    }
    tauri::Builder::default()
        // Single-Instance MUSS als erstes Plugin registriert werden: Ein zweiter
        // Programmstart (z. B. während die App im Tray liegt) startet KEINE neue
        // Instanz, sondern meldet sich hier bei der laufenden – wir holen das Fenster
        // zurück. Verhindert mehrere Tray-Icons / doppelte Prozesse.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            show_main(app);
        }))
        // window-state speichert Position/Größe automatisch und stellt sie beim
        // nächsten Start wieder her. Erststart läuft maximiert (siehe tauri.conf.json).
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(discord::DiscordState::default())
        .manage(TrayState::default())
        .setup(|app| {
            use tauri::menu::{MenuBuilder, MenuItemBuilder};
            use tauri::tray::{TrayIconBuilder, TrayIconEvent};
            use tauri::Manager;

            // Laufzeit-Schalter mit gespeichertem Wert vorbelegen.
            if plugin_bool("closeToTray") == Some(true) {
                app.state::<TrayState>()
                    .close_to_tray
                    .store(true, std::sync::atomic::Ordering::Relaxed);
            }

            // System-Tray mit Menü (Öffnen / Beenden) + Linksklick = Fenster zeigen.
            let show_i = MenuItemBuilder::with_id("show", "OmniSight öffnen").build(app)?;
            let quit_i = MenuItemBuilder::with_id("quit", "Beenden").build(app)?;
            let menu = MenuBuilder::new(app).items(&[&show_i, &quit_i]).build()?;
            let _tray = TrayIconBuilder::with_id("omni-tray")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("OmniSight")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => show_main(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main(tray.app_handle());
                    }
                })
                .build(app)?;

            // „Minimiert starten": Hauptfenster nach dem Start minimieren.
            if plugin_bool("startMinimized") == Some(true) {
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.minimize();
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            // „In den Tray schließen": Schließen des Hauptfensters abfangen -> verstecken.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    use tauri::Manager;
                    let keep = window
                        .state::<TrayState>()
                        .close_to_tray
                        .load(std::sync::atomic::Ordering::Relaxed);
                    if keep {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            tmdb::tmdb_search,
            tmdb::tmdb_trending,
            tmdb::tmdb_upcoming,
            tmdb::tmdb_list,
            tmdb::tmdb_details,
            discord::discord_connect,
            discord::discord_set_activity,
            discord::discord_clear,
            discord::discord_disconnect,
            anilist::anilist_schedule,
            favicon::fetch_favicon,
            webview_set_muted,
            webview_set_volume,
            webview_set_paused,
            webview2_version,
            check_reachable,
            create_embedded_webview,
            set_close_to_tray,
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Start von OmniSight");
}
