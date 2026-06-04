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
    // Hardware-Beschleunigung ggf. abschalten. WebView2 liest dieses Env-Var beim
    // Anlegen seiner Umgebung – es muss daher VOR dem Fenster gesetzt werden.
    if hw_accel_disabled() {
        let prev = std::env::var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS").unwrap_or_default();
        let combined = format!("{} --disable-gpu --disable-gpu-compositing", prev);
        std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", combined.trim());
    }
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
            webview_set_paused,
            webview2_version,
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Start von OmniHub");
}
