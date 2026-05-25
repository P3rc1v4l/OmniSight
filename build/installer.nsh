; OmniSight – NSIS Installer Customization
; Visuelles Design und Deinstallations-Dialog

; ── Farben & Design ─────────────────────────────────────────────────
!define MUI_BGCOLOR               "0A0A0F"
!define MUI_TEXTCOLOR             "F0F0F8"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP    "${BUILD_RESOURCES_DIR}\installer-header.bmp"

; ── Texte ────────────────────────────────────────────────────────────
!define MUI_WELCOMEPAGE_TITLE     "Willkommen bei OmniSight"
!define MUI_WELCOMEPAGE_TEXT      "OmniSight ist dein zentrales Streaming-Hub.$\n$\nDieser Assistent führt dich durch die Installation.$\n$\nKlicke auf Weiter um fortzufahren."
!define MUI_FINISHPAGE_TITLE      "OmniSight wurde installiert!"
!define MUI_FINISHPAGE_TEXT       "OmniSight ist einsatzbereit.$\n$\nDu kannst die App jetzt über das Desktop-Symbol oder das Startmenü öffnen."
!define MUI_FINISHPAGE_RUN        "$INSTDIR\OmniSight.exe"
!define MUI_FINISHPAGE_RUN_TEXT   "OmniSight jetzt starten"
!define MUI_FINISHPAGE_LINK       "Besuche unsere Community auf Discord"
!define MUI_FINISHPAGE_LINK_LOCATION "https://discord.gg/placeholder"

; ── Custom Install Step ──────────────────────────────────────────────
!macro customInstall
  ; Registrierung für Deinstallation mit Daten-Option
  WriteRegStr HKCU "Software\OmniSight" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\OmniSight" "Version"     "${VERSION}"
!macroend

; ── Deinstallation: Daten-Lösch-Dialog ──────────────────────────────
!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Moechtest du alle OmniSight-Daten loeschen?$\r$\n$\r$\nDazu gehoeren:$\r$\n  - Profile und Einstellungen$\r$\n  - Watchlist und Favoriten$\r$\n  - Login-Sessions$\r$\n$\r$\nWenn du NEIN waehlst, bleiben deine Daten erhalten$\r$\nund stehen nach einer Neuinstallation wieder bereit." \
    IDNO keep_data

    ; Ja: AppData loeschen
    RMDir /r "$APPDATA\omnisight"
    DetailPrint "OmniSight-Daten wurden geloescht."
    Goto data_done

  keep_data:
    DetailPrint "OmniSight-Daten wurden behalten."

  data_done:
  ; Registrierungsschluessel entfernen
  DeleteRegKey HKCU "Software\OmniSight"
!macroend
