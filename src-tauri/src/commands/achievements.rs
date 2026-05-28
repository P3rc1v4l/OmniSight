use serde_json::Value;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_achievements(app: tauri::AppHandle, profile_id: String) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get(format!("achievements_{}", profile_id)).unwrap_or(Value::Array(vec![])))
}

#[tauri::command]
pub async fn set_achievements(app: tauri::AppHandle, profile_id: String, list: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set(format!("achievements_{}", profile_id), list);
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_achievement_meta(app: tauri::AppHandle, profile_id: String) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get(format!("achMeta_{}", profile_id)).unwrap_or(Value::Object(serde_json::Map::new())))
}

#[tauri::command]
pub async fn set_achievement_meta(app: tauri::AppHandle, profile_id: String, meta: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set(format!("achMeta_{}", profile_id), meta);
    store.save().map_err(|e| e.to_string())
}
