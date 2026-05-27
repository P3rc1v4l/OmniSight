; OmniSight – NSIS v3.3.1
; deleteAppDataOnUninstall:false → wir steuern es manuell
; Updates: Daten bleiben erhalten
; Deinstallation: Checkbox "Anwendungsdaten löschen"

!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
  ; WideVine in ProgramData (überlebt alle Updates)
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm"
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific"
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific\win_x64"
  ; Migration: alte AppData WideVine-Dateien nach ProgramData
  IfFileExists "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64\widevinecdm.dll" 0 +3
    CopyFiles /SILENT "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64\*.*" "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific\win_x64\"
    CopyFiles /SILENT "$APPDATA\omnisight\WidevineCdm\manifest.json" "$PROGRAMDATA\OmniSight\WidevineCdm\" 
!macroend

!macro customUnInstall
  ; Checkbox: Anwendungsdaten löschen?
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
    "Anwendungsdaten löschen?$\r$\n$\r$\nDazu gehören: Profile, Einstellungen,$\r$\nWatchlist, Login-Sessions und Statistiken.$\r$\n$\r$\nWideVine-Dateien in ProgramData bleiben immer erhalten." \
    IDNO keep_data
    RMDir /r "$APPDATA\omnisight"
    RMDir /r "$LOCALAPPDATA\omnisight"
  keep_data:
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
