; OmniSight – Custom NSIS Installer Script
; Wird beim Deinstallieren aufgerufen

!macro customUnInstall
  ; Dialog: Soll AppData gelöscht werden?
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Möchtest du alle OmniSight-Daten löschen?$\n$\nDazu gehören:$\n• Profile und Einstellungen$\n• Watchlist und Favoriten$\n• Login-Sessions$\n$\nWenn du Nein wählst, bleiben deine Daten erhalten$\nfalls du OmniSight später neu installierst." \
    IDNO data_keep

  ; Ja: AppData löschen
  RMDir /r "$APPDATA\omnisight"
  DetailPrint "OmniSight-Daten wurden gelöscht."
  Goto data_done

  data_keep:
  DetailPrint "OmniSight-Daten wurden behalten."

  data_done:
!macroend
