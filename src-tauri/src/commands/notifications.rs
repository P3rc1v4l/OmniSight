use serde_json::Value;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_notifications(app: tauri::AppHandle, profile_id: String) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get(format!("notifications_{}", profile_id)).unwrap_or(Value::Array(vec![])))
}

#[tauri::command]
pub async fn set_notifications(app: tauri::AppHandle, profile_id: String, notifs: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set(format!("notifications_{}", profile_id), notifs);
    store.save().map_err(|e| e.to_string())
}
