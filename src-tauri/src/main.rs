// OmniHub – Tauri Main Entry Point
// Nutzt Edge WebView auf Windows → WideVine eingebaut!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    omnihub_lib::run();
}
