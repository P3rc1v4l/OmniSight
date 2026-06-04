// OmniSight – holt ein Favicon und gibt es als Daten-URL zurück (Base64).
// So lässt es sich offline zwischenspeichern und seine Farbe per Canvas auslesen
// (Daten-URLs sind nicht cross-origin -> kein „tainted canvas").

use base64::Engine;

#[tauri::command]
pub async fn fetch_favicon(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (OmniSight)")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let ct = resp
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/png")
        .split(';')
        .next()
        .unwrap_or("image/png")
        .to_string();

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    if bytes.is_empty() {
        return Err("Favicon ist leer".into());
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", ct, b64))
}
