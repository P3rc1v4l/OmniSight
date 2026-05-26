; OmniSight – NSIS v3.3.0
; WideVine in ProgramData (überlebt alle Updates!)

!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
  
  ; WideVine in ProgramData anlegen (NICHT in AppData!)
  ; ProgramData wird von deleteAppDataOnUninstall NIEMALS berührt
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm"
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific"
  CreateDirectory "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific\win_x64"
  
  ; Falls alte WideVine-Dateien in AppData liegen: nach ProgramData migrieren
  IfFileExists "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64\widevinecdm.dll" 0 no_migration
    CopyFiles "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64\*.*" \
              "$PROGRAMDATA\OmniSight\WidevineCdm\_platform_specific\win_x64\"
    CopyFiles "$APPDATA\omnisight\WidevineCdm\manifest.json" \
              "$PROGRAMDATA\OmniSight\WidevineCdm\"
    DetailPrint "WideVine-Dateien nach ProgramData migriert."
  no_migration:
!macroend
