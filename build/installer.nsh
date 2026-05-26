; OmniSight – NSIS Installer Script v3.2.9
; 
; deleteAppDataOnUninstall: true in package.json zeigt automatisch
; die Checkbox "Lösche die Anwendungsdaten" im Deinstallations-Dialog.
; electron-builder übernimmt das Löschen selbst.
; 
; Wir brauchen NUR:
; - customInstall: WideVine-Ordner anlegen (bleibt bei Updates erhalten)

!macro customInstall
  ; WideVine-Ordner anlegen – wird bei Updates NICHT gelöscht
  ; (liegt in $APPDATA\omnisight, nicht in $INSTDIR)
  CreateDirectory "$APPDATA\omnisight\WidevineCdm"
  CreateDirectory "$APPDATA\omnisight\WidevineCdm\_platform_specific"
  CreateDirectory "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64"
  
  ; Registry-Eintrag
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
!macroend

; customUnInstall NICHT definieren!
; electron-builder übernimmt mit deleteAppDataOnUninstall:true
; die Checkbox-gesteuerte Löschung automatisch.
