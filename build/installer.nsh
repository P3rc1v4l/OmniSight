; OmniSight – NSIS Installer Script v3.2.3
; NUR customInstall + customUnInstall – KEIN !define MUI_*

; ── Bei Installation: NUR Registry-Eintrag, KEINE Datenlösch-Frage ──
!macro customInstall
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
  WriteRegStr HKCU "Software\OmniSight" "Publisher"   "P3rc1v4l"
!macroend

; ── Bei Deinstallation: Daten-Lösch-Dialog ──────────────────────────
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
    "OmniSight deinstallieren$\r$\n$\r$\nMoechtest du auch alle gespeicherten Daten loeschen?$\r$\n$\r$\n  Ja   $\t$\tProfile, Einstellungen, Watchlist werden geloescht$\r$\n  Nein $\t$\tDaten bleiben erhalten (ideal fuer spaetere Neuinstallation)$\r$\n" \
    IDNO omnisight_keep_data

    RMDir /r "$APPDATA\omnisight"
    RMDir /r "$LOCALAPPDATA\omnisight"
    DetailPrint "Alle OmniSight-Daten wurden geloescht."
    Goto omnisight_data_done

  omnisight_keep_data:
    DetailPrint "OmniSight-Daten wurden behalten."

  omnisight_data_done:
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
