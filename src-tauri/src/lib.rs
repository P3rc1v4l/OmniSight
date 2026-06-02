// OmniHub – Rust-Backend (Tauri v2).

mod tmdb;
mod discord;
mod anilist;
mod favicon;

/// Liest die gespeicherte Einstellung „Hardware-Beschleunigung" aus der Store-Datei
/// (dieselbe Datei, die das Frontend über tauri-plugin-store schreibt) – und zwar
/// BEVOR das Fenster/Webview erzeugt wird. Schlägt das Lesen fehl, bleibt die GPU
/// aktiv (sicherer Standard). Windows: %APPDATA%\<identifier>\omnihub.json.
fn hw_accel_disabled() -> bool {
    let Ok(appdata) = std::env::var("APPDATA") else { return false; };
    let path = std::path::Path::new(&appdata)
        .join("com.p3rc1v4l.omnihub")
        .join("omnihub.json");
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

/// Pfad zum App-Datenordner (Windows: %APPDATA%\com.p3rc1v4l.omnihub).
fn omni_appdata() -> Option<std::path::PathBuf> {
    std::env::var("APPDATA").ok().map(|v| std::path::PathBuf::from(v).join("com.p3rc1v4l.omnihub"))
}

/// Experimentell: getrennte Logins je Profil über ein eigenes WebView2-Datenverzeichnis.
/// Wird NUR aktiv, wenn die Datei <appdata>/profile-sep existiert und einen (sicheren)
/// Profilnamen enthält. Greift nur, falls Tauri/WebView2 die Umgebungsvariable beachtet.
/// Muss vor der Fenster-/Webview-Erzeugung laufen.
fn apply_profile_separation_env() {
    let Some(base) = omni_appdata() else { return };
    let sep_file = base.join("profile-sep");
    let Ok(pid) = std::fs::read_to_string(&sep_file) else { return };
    let pid = pid.trim();
    if pid.is_empty() || !pid.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_') {
        return;
    }
    let dir = base.join("webview2").join(pid);
    let _ = std::fs::create_dir_all(&dir);
    std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", dir);
}

/// Schreibt/löscht die Profiltrennungs-Datei. Beim nächsten Start nutzt die App dann
/// ein eigenes WebView2-Datenverzeichnis für dieses Profil.
#[tauri::command]
fn set_profile_separation(enabled: bool, profile_id: String) -> Result<(), String> {
    let base = omni_appdata().ok_or_else(|| "APPDATA nicht gefunden".to_string())?;
    std::fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    let sep_file = base.join("profile-sep");
    if enabled && !profile_id.is_empty() {
        std::fs::write(&sep_file, profile_id).map_err(|e| e.to_string())?;
    } else {
        let _ = std::fs::remove_file(&sep_file);
    }
    Ok(())
}

/// Gibt die installierte WebView2-Laufzeit-Version zurück (für die Diagnose in den
/// Einstellungen). Schlägt der Aufruf fehl, fehlt die WebView2-Runtime vermutlich.
#[tauri::command]
fn webview2_version() -> Result<String, String> {
    tauri::webview_version().map_err(|e| e.to_string())
}

/// Schaltet einen eingebetteten Stream (per Webview-Label) stumm bzw. wieder laut.
/// Tauri bietet kein direktes Audio-Mute, daher setzen wir im Webview alle
/// <video>/<audio>-Elemente auf muted und beobachten DOM-Änderungen mit, weil
/// Player (z.B. Twitch) das Video-Element zur Laufzeit austauschen.
#[tauri::command]
fn webview_set_muted(app: tauri::AppHandle, label: String, muted: bool) -> Result<(), String> {
    use tauri::Manager;
    let wv = app
        .get_webview(&label)
        .ok_or_else(|| format!("Webview '{}' nicht gefunden", label))?;
    let val = if muted { "true" } else { "false" };
    let js = String::from(
        "(function(){window.__omniMuted=__M__;var a=function(){document.querySelectorAll('video,audio').forEach(function(e){try{e.muted=window.__omniMuted;}catch(_){}})};a();if(!window.__omniMuteObs){window.__omniMuteObs=new MutationObserver(a);try{window.__omniMuteObs.observe(document.documentElement,{childList:true,subtree:true});}catch(_){}}})();",
    )
    .replace("__M__", val);
    wv.eval(&js).map_err(|e| e.to_string())
}

/// Setzt die Lautstärke (0.0–1.0) eines eingebetteten Streams per Label. Wie beim Mute
/// über alle Medien-Elemente + Beobachter, falls der Player sein Video-Element austauscht.
#[tauri::command]
fn webview_set_volume(app: tauri::AppHandle, label: String, volume: f64) -> Result<(), String> {
    use tauri::Manager;
    let wv = app
        .get_webview(&label)
        .ok_or_else(|| format!("Webview '{}' nicht gefunden", label))?;
    let v = if volume < 0.0 { 0.0 } else if volume > 1.0 { 1.0 } else { volume };
    let js = String::from(
        "(function(){window.__omniVol=__V__;var a=function(){document.querySelectorAll('video,audio').forEach(function(e){try{e.volume=window.__omniVol;}catch(_){}})};a();if(!window.__omniVolObs){window.__omniVolObs=new MutationObserver(a);try{window.__omniVolObs.observe(document.documentElement,{childList:true,subtree:true});}catch(_){}}})();",
    )
    .replace("__V__", &format!("{:.3}", v));
    wv.eval(&js).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Hardware-Beschleunigung ggf. abschalten. WebView2 liest dieses Env-Var beim
    // Anlegen seiner Umgebung – es muss daher VOR dem Fenster gesetzt werden.
    if hw_accel_disabled() {
        let prev = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
        let combined = format!("{} --disable-gpu --disable-gpu-compositing", prev);
        std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined.trim());
    }
    // Experimentelle Profiltrennung: ggf. eigenes WebView2-Datenverzeichnis setzen
    // (ebenfalls VOR dem Fenster, da WebView2 die Variable beim Start liest).
    apply_profile_separation_env();
    tauri::Builder::default()
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
        .manage(discord::DiscordState::default())
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
            webview2_version,
            set_profile_separation,
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Start von OmniHub");
}
