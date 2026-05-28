// ═══ v0.2.0 – TMDB Commands ═══
use serde_json::Value;

const TMDB_KEY: &str = "2dca580c2a14b55200e784d157207b4d";
const TMDB_BASE: &str = "https://api.themoviedb.org/3";

async fn tmdb_get(path: &str) -> Result<Value, String> {
    let url = format!("{}{}", TMDB_BASE, path);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;
    let resp = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", TMDB_KEY))
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    resp.json::<Value>().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_tmdb(query: String) -> Result<Value, String> {
    let encoded = urlencoding::encode(&query);
    tmdb_get(&format!(
        "/search/multi?query={}&language=de-DE&include_adult=false&page=1",
        encoded
    )).await
}

#[tauri::command]
pub async fn get_trending() -> Result<Value, String> {
    let movies = tmdb_get("/trending/movie/week?language=de-DE").await?;
    let tv     = tmdb_get("/trending/tv/week?language=de-DE").await?;
    let anime  = tmdb_get("/discover/tv?with_genres=16&language=de-DE&sort_by=popularity.desc").await?;
    Ok(serde_json::json!({
        "movies": movies.get("results").cloned().unwrap_or_default(),
        "series": tv.get("results").cloned().unwrap_or_default(),
        "anime":  anime.get("results").cloned().unwrap_or_default(),
    }))
}

#[tauri::command]
pub async fn get_new_releases() -> Result<Value, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let four_weeks_ago = (chrono::Utc::now() - chrono::Duration::weeks(4))
        .format("%Y-%m-%d")
        .to_string();

    let movies = tmdb_get(&format!(
        "/movie/now_playing?language=de-DE&page=1"
    )).await?;
    let tv = tmdb_get(&format!(
        "/tv/on_the_air?language=de-DE&page=1"
    )).await?;
    let anime = tmdb_get(&format!(
        "/discover/tv?with_genres=16&language=de-DE&sort_by=popularity.desc&first_air_date.gte={}&first_air_date.lte={}",
        four_weeks_ago, today
    )).await?;

    Ok(serde_json::json!({
        "movies": movies.get("results").cloned().unwrap_or_default(),
        "shows":  tv.get("results").cloned().unwrap_or_default(),
        "anime":  anime.get("results").cloned().unwrap_or_default(),
    }))
}

#[tauri::command]
pub async fn get_upcoming(page: u32) -> Result<Value, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let movies = tmdb_get(&format!("/movie/upcoming?language=de-DE&page={}", page)).await?;
    let tv     = tmdb_get(&format!("/tv/on_the_air?language=de-DE&page={}", page)).await?;
    let anime  = tmdb_get(&format!(
        "/discover/tv?with_genres=16&language=de-DE&sort_by=first_air_date.asc&first_air_date.gte={}&page={}",
        today, page
    )).await?;
    Ok(serde_json::json!({
        "movies": movies.get("results").cloned().unwrap_or_default(),
        "series": tv.get("results").cloned().unwrap_or_default(),
        "anime":  anime.get("results").cloned().unwrap_or_default(),
        "total_pages": movies.get("total_pages").cloned().unwrap_or(Value::from(1)),
    }))
}

#[tauri::command]
pub async fn get_streaming_providers(tmdb_id: u64, media_type: String) -> Result<Value, String> {
    tmdb_get(&format!(
        "/{}/{}/watch/providers?language=de-DE",
        media_type, tmdb_id
    )).await
}

/// Holt Details + Videos + Streaming-Anbieter für einen Titel
#[tauri::command]
pub async fn get_tmdb_detail(id: u64, media_type: String) -> Result<Value, String> {
    let detail_path = format!(
        "/{}/{}?language=de-DE&append_to_response=videos,credits",
        media_type, id
    );
    let providers_path = format!(
        "/{}/{}/watch/providers?language=de-DE",
        media_type, id
    );

    let (detail_res, providers_res) = tokio::join!(
        tmdb_get(&detail_path),
        tmdb_get(&providers_path),
    );

    let detail    = detail_res.unwrap_or_default();
    let prov_raw  = providers_res.unwrap_or_default();

    // Videos extrahieren
    let videos: Vec<Value> = detail
        .get("videos")
        .and_then(|v| v.get("results"))
        .and_then(|r| r.as_array())
        .cloned()
        .unwrap_or_default();

    // Streaming-Anbieter für DE
    let providers = prov_raw
        .get("results")
        .and_then(|r| r.get("DE"))
        .cloned()
        .unwrap_or_default();

    Ok(serde_json::json!({
        "detail":    detail,
        "videos":    videos,
        "providers": providers,
    }))
}

/// Prüft ob Watchlist-Einträge heute veröffentlicht wurden
#[tauri::command]
pub async fn get_watchlist_releases(items: Vec<Value>) -> Result<Vec<Value>, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let mut released = Vec::new();

    for item in items.iter().take(20) {
        let tmdb_id = match item.get("tmdbId").and_then(|v| v.as_u64()) {
            Some(id) => id,
            None => continue,
        };
        let media_type = item.get("tmdbType")
            .and_then(|v| v.as_str())
            .unwrap_or("movie")
            .to_string();
        let title = item.get("title")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let path = format!("/{}/{}?language=de-DE", media_type, tmdb_id);
        if let Ok(detail) = tmdb_get(&path).await {
            let release_date = detail
                .get("release_date")
                .or_else(|| detail.get("first_air_date"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            if release_date == today {
                released.push(serde_json::json!({
                    "tmdbId":    tmdb_id,
                    "tmdbType":  media_type,
                    "title":     title,
                    "releaseDate": release_date,
                }));
            }
        }
    }

    Ok(released)
}
