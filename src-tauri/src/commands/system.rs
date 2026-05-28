// ═══ v0.3.2 – System Commands (Compile-Fix) ═══

use serde_json::Value;

#[tauri::command]
pub async fn open_external(url: String) -> Result<(), String> {
    if !url.starts_with("http://")
        && !url.starts_with("https://")
        && !url.starts_with("file://")
    {
        return Err("Nur http/https/file URLs erlaubt".to_string());
    }
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_app_version(app: tauri::AppHandle) -> Result<String, String> {
    Ok(app.package_info().version.to_string())
}

#[tauri::command]
pub async fn pick_image(app: tauri::AppHandle) -> Result<Value, String> {
    use tauri_plugin_dialog::DialogExt;

    let result = app.dialog()
        .file()
        .add_filter("Bilder", &["png", "jpg", "jpeg", "webp", "gif", "svg"])
        .blocking_pick_file();

    match result {
        Some(path) => {
            let path_str = path.to_string();
            match std::fs::read(&path_str) {
                Ok(bytes) => {
                    let b64 = base64_encode(&bytes);
                    let mime = if path_str.ends_with(".png")       { "image/png"     }
                               else if path_str.ends_with(".svg")  { "image/svg+xml" }
                               else if path_str.ends_with(".gif")  { "image/gif"     }
                               else if path_str.ends_with(".webp") { "image/webp"    }
                               else                                { "image/jpeg"    };
                    Ok(serde_json::json!({
                        "base64":   format!("data:{};base64,{}", mime, b64),
                        "filePath": path_str,
                        "fileName": std::path::Path::new(&path_str)
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("image")
                    }))
                }
                Err(e) => Err(e.to_string()),
            }
        }
        None => Ok(Value::Null),
    }
}

#[tauri::command]
pub async fn check_online() -> Result<bool, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())?;
    Ok(client.head("https://www.google.com").send().await.is_ok())
}

#[tauri::command]
pub async fn get_system_theme() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("reg")
            .args([
                "query",
                r"HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize",
                "/v",
                "AppsUseLightTheme",
            ])
            .output()
            .map_err(|e| e.to_string())?;
        let s = String::from_utf8_lossy(&output.stdout);
        return Ok(if s.contains("0x0") { "dark".to_string() } else { "light".to_string() });
    }
    #[allow(unreachable_code)]
    Ok("dark".to_string())
}

fn base64_encode(input: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((input.len() + 2) / 3 * 4);
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 { chunk[1] as usize } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as usize } else { 0 };
        let n = (b0 << 16) | (b1 << 8) | b2;
        out.push(CHARS[(n >> 18) & 63] as char);
        out.push(CHARS[(n >> 12) & 63] as char);
        out.push(if chunk.len() > 1 { CHARS[(n >> 6) & 63] as char } else { '=' });
        out.push(if chunk.len() > 2 { CHARS[n & 63] as char } else { '=' });
    }
    out
}
