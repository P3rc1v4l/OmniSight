; ═══════════════════════════════════════════════════════════════════
; OmniSight – NSIS Custom Installer Script
; Modernes Design: Dunkles Theme mit Teal-Akzent
; 
; WICHTIG: Kein !define von MUI_HEADERIMAGE oder anderen MUI-Vars hier
; electron-builder setzt diese bereits. Nur customInstall + customUnInstall!
; ═══════════════════════════════════════════════════════════════════

; ── Installation ────────────────────────────────────────────────────
!macro customInstall
  ; Registrierungseintrag für Deinstallation
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
  WriteRegStr HKCU "Software\OmniSight" "Publisher"   "P3rc1v4l"
!macroend

; ── Deinstallation: Daten-Lösch-Dialog ──────────────────────────────
!macro customUnInstall
  ; Modernen Dialog anzeigen
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
    "OmniSight deinstallieren$\r$\n$\r$\nMoechtest du auch alle gespeicherten Daten loeschen?$\r$\n$\r$\n  Ja   $\t$\tProfile, Einstellungen, Watchlist und Sessions werden geloescht$\r$\n  Nein $\t$\tDaten bleiben erhalten (gut fuer Neuinstallation)$\r$\n$\r$\n" \
    IDNO omnisight_keep_data

    ; Ja geklickt: AppData loeschen
    RMDir /r "$APPDATA\omnisight"
    RMDir /r "$LOCALAPPDATA\omnisight"
    DetailPrint "Alle OmniSight-Daten wurden geloescht."
    Goto omnisight_data_done

  omnisight_keep_data:
    DetailPrint "OmniSight-Daten wurden behalten."

  omnisight_data_done:
  ; Registrierungseintraege entfernen
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
