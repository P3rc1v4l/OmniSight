// OmniHub – TMDB-Anbindung.
//
// === TMDB-API-KEY EINTRAGEN ===
// 1. Kostenlos einen Key anlegen: https://www.themoviedb.org/settings/api
// 2. Den "API Read Access Token" (v4) ODER den "API Key (v3 auth)" kopieren.
// 3. Hier in die folgende Zeile einfügen (zwischen die Anführungszeichen).
// 4. Diese Datei committen – fertig.
//
// Der Key landet im fertigen Build und ist dort technisch auslesbar. TMDB-Keys
// sind kostenlos, ratenlimitiert und damit ein akzeptables Risiko für ein
// Hobby-/Open-Source-Projekt. Wer den Key später besser schützen will, kann
// auf einen eigenen Proxy-Server umstellen – das ist später möglich, ohne die
// Frontend-Schnittstelle zu ändern.
const TMDB_API_KEY: &str = "PASTE_YOUR_TMDB_KEY_HERE";

const TMDB_BASE: &str = "https://api.themoviedb.org/3";
const TMDB_IMG: &str = "https://image.tmdb.org/t/p";

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct TmdbItem {
    pub id: i64,
    pub media_type: String, // "movie" | "tv"
    pub title: String,
    pub overview: String,
    pub poster: Option<String>,
    pub backdrop: Option<String>,
    pub release_date: Option<String>,
    pub vote_average: Option<f64>,
}

fn poster_url(path: &Option<String>, size: &str) -> Option<String> {
    path.as_ref().map(|p| format!("{TMDB_IMG}/{size}{p}"))
}

fn item_from_value(v: &Value, media_type_fallback: &str) -> TmdbItem {
    let media_type = v
        .get("media_type")
        .and_then(|x| x.as_str())
        .unwrap_or(media_type_fallback)
        .to_string();
    let title = v
        .get("title")
        .and_then(|x| x.as_str())
        .or_else(|| v.get("name").and_then(|x| x.as_str()))
        .unwrap_or("")
        .to_string();
    let release_date = v
        .get("release_date")
        .and_then(|x| x.as_str())
        .or_else(|| v.get("first_air_date").and_then(|x| x.as_str()))
        .map(|s| s.to_string());

    TmdbItem {
        id: v.get("id").and_then(|x| x.as_i64()).unwrap_or(0),
        media_type,
        title,
        overview: v
            .get("overview")
            .and_then(|x| x.as_str())
            .unwrap_or("")
            .to_string(),
        poster: poster_url(
            &v.get("poster_path").and_then(|x| x.as_str()).map(String::from),
            "w342",
        ),
        backdrop: poster_url(
            &v.get("backdrop_path")
                .and_then(|x| x.as_str())
                .map(String::from),
            "w780",
        ),
        release_date,
        vote_average: v.get("vote_average").and_then(|x| x.as_f64()),
    }
}

async fn get_json(path: &str, params: &[(&str, &str)]) -> Result<Value, String> {
    if TMDB_API_KEY == "PASTE_YOUR_TMDB_KEY_HERE" || TMDB_API_KEY.is_empty() {
        return Err(
            "TMDB-API-Key fehlt. Bitte in src-tauri/src/tmdb.rs eintragen (siehe Kommentar)."
                .into(),
        );
    }
    let client = reqwest::Client::new();
    let url = format!("{TMDB_BASE}{path}");
    let mut req = client.get(&url).query(&[("language", "de-DE")]).query(params);
    // v4-Tokens beginnen mit "ey" (JWT) -> als Bearer-Header. Sonst als query-key.
    if TMDB_API_KEY.starts_with("ey") {
        req = req.bearer_auth(TMDB_API_KEY);
    } else {
        req = req.query(&[("api_key", TMDB_API_KEY)]);
    }
    let resp = req.send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("TMDB HTTP {}", resp.status()));
    }
    resp.json::<Value>().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn tmdb_search(query: String) -> Result<Vec<TmdbItem>, String> {
    let q = urlencoding::encode(&query).to_string();
    let v = get_json("/search/multi", &[("query", &q), ("region", "DE")]).await?;
    let arr = v
        .get("results")
        .and_then(|x| x.as_array())
        .cloned()
        .unwrap_or_default();
    Ok(arr
        .iter()
        .filter(|x| {
            let mt = x.get("media_type").and_then(|m| m.as_str()).unwrap_or("");
            mt == "movie" || mt == "tv"
        })
        .map(|x| item_from_value(x, ""))
        .collect())
}

#[tauri::command]
pub async fn tmdb_trending() -> Result<Vec<TmdbItem>, String> {
    let v = get_json("/trending/all/week", &[("region", "DE")]).await?;
    let arr = v
        .get("results")
        .and_then(|x| x.as_array())
        .cloned()
        .unwrap_or_default();
    Ok(arr.iter().map(|x| item_from_value(x, "movie")).collect())
}

#[tauri::command]
pub async fn tmdb_upcoming() -> Result<Vec<TmdbItem>, String> {
    let v = get_json("/movie/upcoming", &[("region", "DE")]).await?;
    let arr = v
        .get("results")
        .and_then(|x| x.as_array())
        .cloned()
        .unwrap_or_default();
    Ok(arr.iter().map(|x| item_from_value(x, "movie")).collect())
}

#[tauri::command]
pub async fn tmdb_details(media_type: String, id: i64) -> Result<Value, String> {
    let path = format!("/{}/{}", media_type, id);
    get_json(&path, &[("append_to_response", "videos,watch/providers")]).await
}
