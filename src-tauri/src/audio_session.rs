// Windows-Lautstärkemixer: WebView2-Audio erscheint sonst als „Microsoft Edge WebView2".
// Wir benennen die Audio-Sessions, die zu UNSEREM Prozessbaum gehören, über die
// Windows Core Audio API (WASAPI) in „OmniSight" um und setzen unser Icon.
// Hinweis: Der Name ändert sich sofort; das Icon erst, wenn der Mixer neu geöffnet wird.
#![cfg(target_os = "windows")]

use std::collections::HashSet;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use windows::core::{Interface, PCWSTR};
use windows::Win32::Foundation::CloseHandle;
use windows::Win32::Media::Audio::{
    eConsole, eRender, IAudioSessionControl2, IAudioSessionEnumerator, IAudioSessionManager2,
    IMMDeviceEnumerator, MMDeviceEnumerator,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED,
};
use windows::Win32::System::Diagnostics::ToolHelp::{
    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
};

fn to_wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

// Alle Nachfahren-PIDs des eigenen Prozesses (inkl. self) – damit benennen wir NUR
// unsere eigenen WebView2-Audioprozesse um, nicht die anderer Apps.
fn descendant_pids(root: u32) -> HashSet<u32> {
    let mut pairs: Vec<(u32, u32)> = Vec::new();
    unsafe {
        if let Ok(snap) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
            let mut entry = PROCESSENTRY32W {
                dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32,
                ..Default::default()
            };
            if Process32FirstW(snap, &mut entry).is_ok() {
                loop {
                    pairs.push((entry.th32ProcessID, entry.th32ParentProcessID));
                    if Process32NextW(snap, &mut entry).is_err() {
                        break;
                    }
                }
            }
            let _ = CloseHandle(snap);
        }
    }
    let mut set = HashSet::new();
    set.insert(root);
    loop {
        let mut changed = false;
        for &(pid, ppid) in &pairs {
            if set.contains(&ppid) && set.insert(pid) {
                changed = true;
            }
        }
        if !changed {
            break;
        }
    }
    set
}

// Einmal alle passenden Audio-Sessions umbenennen.
unsafe fn rename_sessions(
    name_w: &[u16],
    icon_w: &[u16],
    ours: &HashSet<u32>,
) -> windows::core::Result<()> {
    let enumerator: IMMDeviceEnumerator = CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
    let device = enumerator.GetDefaultAudioEndpoint(eRender, eConsole)?;
    let manager: IAudioSessionManager2 = device.Activate(CLSCTX_ALL, None)?;
    let sessions: IAudioSessionEnumerator = manager.GetSessionEnumerator()?;
    let count = sessions.GetCount()?;
    for i in 0..count {
        let ctrl = sessions.GetSession(i)?;
        let ctrl2: IAudioSessionControl2 = ctrl.cast()?;
        let pid = ctrl2.GetProcessId().unwrap_or(0);
        if pid != 0 && ours.contains(&pid) {
            let _ = ctrl2.SetDisplayName(PCWSTR(name_w.as_ptr()), std::ptr::null());
            let _ = ctrl2.SetIconPath(PCWSTR(icon_w.as_ptr()), std::ptr::null());
        }
    }
    Ok(())
}

// Hintergrund-Thread: benennt alle paar Sekunden neu (Sessions entstehen erst, wenn
// im Stream tatsächlich Audio läuft).
pub fn start_audio_session_renamer() {
    std::thread::spawn(|| {
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        }
        let name_w = to_wide("OmniSight");
        let icon_w = std::env::current_exe()
            .ok()
            .and_then(|p| p.to_str().map(|s| to_wide(&format!("{},0", s))))
            .unwrap_or_else(|| to_wide(""));
        let me = std::process::id();
        loop {
            let ours = descendant_pids(me);
            unsafe {
                let _ = rename_sessions(&name_w, &icon_w, &ours);
            }
            std::thread::sleep(std::time::Duration::from_secs(3));
        }
    });
}
