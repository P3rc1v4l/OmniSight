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

    // Schutz vor riesigen Antworten (Speicher): Favicons sind klein. Wir lehnen
    // zu große Antworten ab – erst über die angekündigte Länge, dann zur Sicherheit
    // noch einmal anhand der tatsächlich gelesenen Größe.
    const MAX_FAVICON_BYTES: u64 = 2 * 1024 * 1024; // 2 MB
    if let Some(len) = resp.content_length() {
        if len > MAX_FAVICON_BYTES {
            return Err("Favicon zu groß".into());
        }
    }

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    if bytes.len() as u64 > MAX_FAVICON_BYTES {
        return Err("Favicon zu groß".into());
    }
    if bytes.is_empty() {
        return Err("Favicon ist leer".into());
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", ct, b64))
}
