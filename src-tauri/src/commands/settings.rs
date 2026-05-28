use serde_json::Value;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_settings(app: tauri::AppHandle) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get("settings").unwrap_or(Value::Object(serde_json::Map::new())))
}

#[tauri::command]
pub async fn set_settings(app: tauri::AppHandle, settings: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set("settings", settings);
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_theme(app: tauri::AppHandle) -> Result<String, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get("theme")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "dark".to_string()))
}

#[tauri::command]
pub async fn set_theme(app: tauri::AppHandle, theme: String) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set("theme", Value::String(theme));
    store.save().map_err(|e| e.to_string())
}
