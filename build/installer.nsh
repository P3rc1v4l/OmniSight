; OmniSight – NSIS Installer Script v3.2.6
; - Installation: KEINE Datenlösch-Frage
; - Deinstallation: AUTOMATISCH alle Daten löschen (keine Frage)

!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
!macroend

!macro customUnInstall
  ; Alle Daten automatisch löschen – keine Rückfrage
  RMDir /r "$APPDATA\omnisight"
  RMDir /r "$LOCALAPPDATA\omnisight"
  DeleteRegKey HKCU "Software\OmniSight"
  DetailPrint "Alle OmniSight-Daten wurden geloescht."
!macroend
