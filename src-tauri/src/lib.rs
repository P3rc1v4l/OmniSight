// OmniHub – Tauri Library
// ═══ v0.2.0 ═══
// WideVine ist durch Edge WebView (Windows) bereits verfügbar

use tauri::{Manager, WindowEvent};
use tauri_plugin_store::StoreExt;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        // Plugins
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        // Commands registrieren
        .invoke_handler(tauri::generate_handler![
            // Settings
            commands::settings::get_settings,
            commands::settings::set_settings,
            commands::settings::get_theme,
            commands::settings::set_theme,
            // Profile
            commands::profiles::get_profiles,
            commands::profiles::set_profiles,
            commands::profiles::get_active_profile,
            commands::profiles::set_active_profile,
            commands::profiles::hash_pin,
            commands::profiles::verify_pin,
            // Streaming
            commands::streaming::get_stream_stats,
            commands::streaming::set_stream_stats,
            commands::streaming::get_watched_content,
            commands::streaming::set_watched_content,
            commands::streaming::record_watch_time,
            // Achievements
            commands::achievements::get_achievements,
            commands::achievements::set_achievements,
            commands::achievements::get_achievement_meta,
            commands::achievements::set_achievement_meta,
            // Notifications
            commands::notifications::get_notifications,
            commands::notifications::set_notifications,
            // TMDB
            commands::tmdb::search_tmdb,
            commands::tmdb::get_trending,
            commands::tmdb::get_new_releases,
            commands::tmdb::get_upcoming,
            commands::tmdb::get_streaming_providers,
            commands::tmdb::get_tmdb_detail,
            commands::tmdb::get_watchlist_releases,
            // System
            commands::system::open_external,
            commands::system::get_app_version,
            commands::system::pick_image,
            commands::system::check_online,
            commands::system::get_system_theme,
        ])
        .setup(|app| {
            // Store initialisieren
            let _store = app.store("omnihub.json")
                .expect("Store konnte nicht erstellt werden");

            // System-Theme polling (Windows) – alle 2s
            #[cfg(target_os = "windows")]
            {
                let app_handle = app.handle().clone();
                std::thread::spawn(move || {
                    let mut last_dark = is_dark_mode();
                    loop {
                        std::thread::sleep(std::time::Duration::from_secs(2));
                        let dark = is_dark_mode();
                        if dark != last_dark {
                            last_dark = dark;
                            let theme = if dark { "dark" } else { "light" };
                            let _ = app_handle.emit("system-theme-changed", theme);
                        }
                    }
                });
            }

            // Auto-Updater (nur Release-Build)
            #[cfg(not(debug_assertions))]
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Ok(updater) = handle.updater() {
                        if let Ok(Some(update)) = updater.check().await {
                            let _ = handle.emit("update-available", serde_json::json!({
                                "version": update.version
                            }));
                        }
                    }
                });
            }

            // App-Version in Frontend verfügbar machen
            let version = app.package_info().version.to_string();
            let _ = app.get_webview_window("main").map(|w| {
                let _ = w.eval(&format!("window.__appVersion = '{}';", version));
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                let _ = window.app_handle().emit("app-closing", ());
            }
        })
        .run(tauri::generate_context!())
        .expect("OmniHub konnte nicht gestartet werden");
}

#[cfg(target_os = "windows")]
fn is_dark_mode() -> bool {
    use std::process::Command;
    let output = Command::new("reg")
        .args([
            "query",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize",
            "/v",
            "AppsUseLightTheme",
        ])
        .output()
        .unwrap_or_default();
    let s = String::from_utf8_lossy(&output.stdout);
    s.contains("0x0") // 0 = Dark Mode
}
