; OmniSight – NSIS Installer Script v3.2.8
; KRITISCH: Update-Installationen dürfen KEINE Daten löschen!
; Nur echte Deinstallation (ohne /UPDATE) löscht AppData.

; ── Installation: WideVine-Dateien sichern/wiederherstellen ──────────
!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
  
  ; WideVine-Ordner anlegen falls nicht vorhanden (NIEMALS löschen!)
  CreateDirectory "$APPDATA\omnisight\WidevineCdm"
  CreateDirectory "$APPDATA\omnisight\WidevineCdm\_platform_specific"
  CreateDirectory "$APPDATA\omnisight\WidevineCdm\_platform_specific\win_x64"
!macroend

; ── Deinstallation: NUR bei echter Deinstallation löschen ────────────
!macro customUnInstall
  ; Prüfe ob dies ein UPDATE ist (electron-updater setzt /UPDATE Flag)
  ; Bei Updates: KEINE Daten löschen, nur Registry-Eintrag entfernen
  ${GetParameters} $R0
  ${GetOptions} $R0 "/UPDATE" $R1
  ${If} ${Errors}
    ; Kein /UPDATE Parameter → echte Deinstallation → Daten löschen
    RMDir /r "$APPDATA\omnisight"
    RMDir /r "$LOCALAPPDATA\omnisight"
    DetailPrint "Alle OmniSight-Daten wurden geloescht."
  ${Else}
    ; Update → Daten bleiben erhalten!
    DetailPrint "Update: Daten werden behalten."
  ${EndIf}
  
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
