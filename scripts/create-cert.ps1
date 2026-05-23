# OmniSight – Self-Signed Code-Signing Zertifikat erstellen
# Dieses Skript als Administrator in PowerShell ausführen
# Dadurch verschwindet die Windows SmartScreen-Warnung beim ersten Öffnen der EXE

# 1. Zertifikat erstellen (gültig 3 Jahre)
$cert = New-SelfSignedCertificate `
  -DnsName "OmniSight" `
  -Subject "CN=OmniSight, O=P3rc1v4l, C=DE" `
  -CertStoreLocation "cert:\CurrentUser\My" `
  -Type CodeSigning `
  -KeyUsage DigitalSignature `
  -NotAfter (Get-Date).AddYears(3)

Write-Host "Zertifikat erstellt: $($cert.Thumbprint)"

# 2. Als PFX exportieren (Passwort wählen und merken!)
$password = Read-Host "PFX-Passwort eingeben" -AsSecureString
$pfxPath = "$PSScriptRoot\omnisight-cert.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password
Write-Host "Exportiert: $pfxPath"

# 3. In GitHub Secrets eintragen:
#    CSC_LINK  = base64-encoded PFX-Datei
#    CSC_KEY_PASSWORD = das Passwort
# 
#    Base64 erzeugen:
#    [Convert]::ToBase64String([IO.File]::ReadAllBytes("omnisight-cert.pfx")) | clip
#    (kopiert den Wert in die Zwischenablage)

Write-Host ""
Write-Host "Naechste Schritte:"
Write-Host "1. GitHub Repo -> Settings -> Secrets -> New secret"
Write-Host "   CSC_LINK = (Base64-Wert von omnisight-cert.pfx)"
Write-Host "   CSC_KEY_PASSWORD = (dein Passwort)"
Write-Host "2. Danach verschwinden die SmartScreen-Warnungen."
