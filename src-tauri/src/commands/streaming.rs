// ═══ v0.3.2 – Fix: chrono::Datelike Import ═══
// ═══ v0.2.0 – Streaming Commands ═══
use serde_json::Value;
use chrono::Datelike;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_stream_stats(app: tauri::AppHandle, profile_id: String) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    let key = format!("streamStats_{}", profile_id);
    Ok(store.get(&key).unwrap_or(Value::Object(serde_json::Map::new())))
}

#[tauri::command]
pub async fn set_stream_stats(app: tauri::AppHandle, profile_id: String, stats: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set(format!("streamStats_{}", profile_id), stats);
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_watched_content(app: tauri::AppHandle, profile_id: String) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get(format!("watchedContent_{}", profile_id)).unwrap_or(Value::Array(vec![])))
}

#[tauri::command]
pub async fn set_watched_content(app: tauri::AppHandle, profile_id: String, content: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set(format!("watchedContent_{}", profile_id), content);
    store.save().map_err(|e| e.to_string())
}

/// Erhöht Streamzeit für einen Anbieter um `seconds` Sekunden
#[tauri::command]
pub async fn record_watch_time(
    app: tauri::AppHandle,
    provider_id: String,
    seconds: u64,
    profile_id: String,
) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    let key = format!("streamStats_{}", profile_id);

    let mut stats = store.get(&key)
        .unwrap_or(Value::Object(serde_json::Map::new()));

    // Wochentag 0-6 (0 = Sonntag)
    let weekday = chrono::Utc::now().weekday();
    let day_idx = weekday.num_days_from_sunday() as usize;

    let entry = stats
        .as_object_mut()
        .ok_or("stats ist kein Objekt")?
        .entry(provider_id.clone())
        .or_insert(serde_json::json!({
            "total": 0,
            "byDay": [0,0,0,0,0,0,0],
            "sessions": 0
        }));

    if let Some(obj) = entry.as_object_mut() {
        // total erhöhen
        let total = obj.entry("total").or_insert(Value::from(0u64));
        if let Some(n) = total.as_u64() {
            *total = Value::from(n + seconds);
        }
        // byDay erhöhen
        let by_day = obj.entry("byDay").or_insert(Value::Array(vec![
            Value::from(0u64); 7
        ]));
        if let Some(arr) = by_day.as_array_mut() {
            if arr.len() < 7 {
                arr.resize(7, Value::from(0u64));
            }
            if let Some(n) = arr[day_idx].as_u64() {
                arr[day_idx] = Value::from(n + seconds);
            }
        }
        // sessions erhöhen (bei jedem Aufruf von 60s → einmal pro Minute)
        if seconds >= 60 {
            let sessions = obj.entry("sessions").or_insert(Value::from(0u64));
            if let Some(n) = sessions.as_u64() {
                *sessions = Value::from(n + 1);
            }
        }
    }

    store.set(key, stats);
    store.save().map_err(|e| e.to_string())
}
