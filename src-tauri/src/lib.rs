// OmniHub – Rust-Backend (Tauri v2).
// Hier werden Plugins registriert und (später) eigene Commands bereitgestellt,
// z.B. Streamzeit-Tracking, VPN-Status, Update-Check.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("Fehler beim Start von OmniHub");
}

// Beispiel-Command (Platzhalter), damit die Frontend<->Backend-Brücke steht.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hallo {name}, willkommen bei OmniHub!")
}
