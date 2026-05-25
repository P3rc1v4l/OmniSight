; OmniSight – NSIS Installer Customization
; Nur customInstall und customUnInstall Macros!
; KEIN !define von MUI_* hier – electron-builder setzt diese bereits

; ── Installation: Registry-Eintrag ──────────────────────────────────
!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
!macroend

; ── Deinstallation: Daten-Lösch-Dialog ──────────────────────────────
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Moechtest du alle OmniSight-Daten loeschen?$\r$\n$\r$\nDazu gehoeren:$\r$\n  - Profile und Einstellungen$\r$\n  - Watchlist und Favoriten$\r$\n  - Login-Sessions$\r$\n$\r$\nNein = Daten bleiben fuer Neuinstallation erhalten." \
    IDNO keep_data

    RMDir /r "$APPDATA\omnisight"
    DetailPrint "OmniSight-Daten wurden geloescht."
    Goto data_done

  keep_data:
    DetailPrint "OmniSight-Daten wurden behalten."

  data_done:
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
