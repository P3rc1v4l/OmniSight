use serde_json::Value;
use sha2::{Sha256, Digest};
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn get_profiles(app: tauri::AppHandle) -> Result<Value, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get("profiles").unwrap_or_else(|| {
        serde_json::json!([{"id":"default","name":"User","avatar":null,"pin":null}])
    }))
}

#[tauri::command]
pub async fn set_profiles(app: tauri::AppHandle, profiles: Value) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set("profiles", profiles);
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_active_profile(app: tauri::AppHandle) -> Result<String, String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    Ok(store.get("activeProfile")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "default".to_string()))
}

#[tauri::command]
pub async fn set_active_profile(app: tauri::AppHandle, profile_id: String) -> Result<(), String> {
    let store = app.store("omnihub.json").map_err(|e| e.to_string())?;
    store.set("activeProfile", Value::String(profile_id));
    store.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn hash_pin(pin: String) -> Result<String, String> {
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    Ok(hex::encode(hasher.finalize()))
}

#[tauri::command]
pub async fn verify_pin(pin: String, hash: String) -> Result<bool, String> {
    let mut hasher = Sha256::new();
    hasher.update(pin.as_bytes());
    Ok(hex::encode(hasher.finalize()) == hash)
}
