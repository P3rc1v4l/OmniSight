// Tauri benötigt Client-seitiges Rendering, damit die Tauri-APIs (window object)
// funktionieren. Deshalb SSR aus, Prerender aus -> reine SPA.
export const ssr = false;
export const prerender = false;
