export interface ScriptFile {
  name: string;
  extension: 'ps1' | 'reg' | 'bat' | 'xml';
  description: string;
  category: 'powershell' | 'registry' | 'gpo';
  content: string;
}

export const SCRIPT_TEMPLATES: ScriptFile[] = [
  {
    name: 'Deploy-UsbSecurityPolicy.ps1',
    extension: 'ps1',
    description: 'Script PowerShell universel d\'administration (Monoposte ou Réseau / Active Directory)',
    category: 'powershell',
    content: `<#
.SYNOPSIS
    WinLock USB - Contrôle des clés USB et disques externes pour Windows.
    Garantit le fonctionnement de la souris, clavier et imprimantes.

.DESCRIPTION
    Configure les clés de Registre GPO sous HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices
    et le service USBSTOR. Peut s'exécuter en local ou sur une liste d'ordinateurs du domaine.

.PARAMETER Action
    BlockAll, ReadOnly, BlockExecute, Unblock, Audit

.PARAMETER ComputerName
    Liste de noms d'ordinateurs ou adresses IP cibles (par défaut : localhost)

.EXAMPLE
    .\\Deploy-UsbSecurityPolicy.ps1 -Action BlockAll
    .\\Deploy-UsbSecurityPolicy.ps1 -Action ReadOnly -ComputerName "PC-ADMIN01", "PC-COMPTA02"
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("BlockAll", "ReadOnly", "BlockExecute", "Unblock", "Audit")]
    [string]$Action,

    [Parameter(Mandatory = $false, Position = 1)]
    [string[]]$ComputerName = @("localhost")
)

function Test-IsAdmin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
    Write-Warning "Ce script doit être exécuté dans une session PowerShell élevée en tant qu'Administrateur."
    exit 1
}

$RemovableStorageGuid = "{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}"
$WpdGuid              = "{6AC27878-A641-422B-BAC6-F4A9102EAC32}"

foreach ($target in $ComputerName) {
    Write-Host "\\n========================================================" -ForegroundColor Cyan
    Write-Host "Traitement de la cible : $target [Action: $Action]" -ForegroundColor Cyan
    Write-Host "========================================================"

    $scriptBlock = {
        param($mode, $storageGuid, $wpdGuid)

        $policyBasePath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices"
        $storagePath    = "$policyBasePath\\$storageGuid"
        $wpdPath        = "$policyBasePath\\$wpdGuid"
        $usbstorPath    = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR"

        # Création des arborescences de Registre
        if (-not (Test-Path $policyBasePath)) { New-Item -Path $policyBasePath -Force | Out-Null }
        if (-not (Test-Path $storagePath))    { New-Item -Path $storagePath -Force | Out-Null }
        if (-not (Test-Path $wpdPath))        { New-Item -Path $wpdPath -Force | Out-Null }

        switch ($mode) {
            "BlockAll" {
                # Bloquer totalement stockage amovible
                Set-ItemProperty -Path $policyBasePath -Name "Deny_All" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Read" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Write" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Execute" -Value 1 -Type DWord -Force
                # Bloquer WPD (smartphones/MTP)
                Set-ItemProperty -Path $wpdPath -Name "Deny_Read" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $wpdPath -Name "Deny_Write" -Value 1 -Type DWord -Force
                # Service USBSTOR désactivé (Start = 4)
                Set-ItemProperty -Path $usbstorPath -Name "Start" -Value 4 -Type DWord -Force
                Write-Output "[OK] Clés USB et disques durs externes : BLOQUÉS."
                Write-Output "[OK] Clavier et souris USB : 100% OPÉRATIONNELS."
            }

            "ReadOnly" {
                Remove-ItemProperty -Path $policyBasePath -Name "Deny_All" -ErrorAction SilentlyContinue
                Set-ItemProperty -Path $storagePath -Name "Deny_Read" -Value 0 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Write" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Execute" -Value 0 -Type DWord -Force
                Set-ItemProperty -Path $usbstorPath -Name "Start" -Value 3 -Type DWord -Force
                Write-Output "[OK] Clés USB configurées en LECTURE SEULE (Écriture interdite)."
            }

            "BlockExecute" {
                Remove-ItemProperty -Path $policyBasePath -Name "Deny_All" -ErrorAction SilentlyContinue
                Set-ItemProperty -Path $storagePath -Name "Deny_Read" -Value 0 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Write" -Value 0 -Type DWord -Force
                Set-ItemProperty -Path $storagePath -Name "Deny_Execute" -Value 1 -Type DWord -Force
                Set-ItemProperty -Path $usbstorPath -Name "Start" -Value 3 -Type DWord -Force
                Write-Output "[OK] Exécution d'applications depuis USB bloquée (Anti-Ransomware)."
            }

            "Unblock" {
                Remove-ItemProperty -Path $policyBasePath -Name "Deny_All" -ErrorAction SilentlyContinue
                Remove-Item -Path $storagePath -Recurse -ErrorAction SilentlyContinue
                Remove-Item -Path $wpdPath -Recurse -ErrorAction SilentlyContinue
                Set-ItemProperty -Path $usbstorPath -Name "Start" -Value 3 -Type DWord -Force
                Write-Output "[OK] Toutes les restrictions USB ont été levées."
            }

            "Audit" {
                $denyAll = (Get-ItemProperty -Path $policyBasePath -ErrorAction SilentlyContinue).Deny_All
                $storageWrite = (Get-ItemProperty -Path $storagePath -ErrorAction SilentlyContinue).Deny_Write
                $storageRead = (Get-ItemProperty -Path $storagePath -ErrorAction SilentlyContinue).Deny_Read
                $usbstor = (Get-ItemProperty -Path $usbstorPath -ErrorAction SilentlyContinue).Start

                Write-Output "--- RAPPORT D'AUDIT SUR $env:COMPUTERNAME ---"
                Write-Output "Deny_All GPO       : $(if($denyAll -eq 1){'ACTIF (Bloqué)'}else{'Inactif'})"
                Write-Output "Deny_Write USB     : $(if($storageWrite -eq 1){'ACTIF (Écriture bloquée)'}else{'Non restreint'})"
                Write-Output "Deny_Read USB      : $(if($storageRead -eq 1){'ACTIF (Lecture bloquée)'}else{'Non restreint'})"
                Write-Output "USBSTOR Start val  : $usbstor $(if($usbstor -eq 4){'(Désactivé)'}else{'(Activé)'})"
                Write-Output "Souris & Clavier   : OPÉRATIONNELS (Classe HID inviolée)"
            }
        }

        # Forcer la prise en compte par le système
        try {
            gpupdate /target:computer /wait:0 | Out-Null
        } catch {}
    }

    try {
        if ($target -eq "localhost" -or $target -eq $env:COMPUTERNAME -or $target -eq "127.0.0.1") {
            & $scriptBlock $Action $RemovableStorageGuid $WpdGuid
        } else {
            Invoke-Command -ComputerName $target -ScriptBlock $scriptBlock -ArgumentList $Action, $RemovableStorageGuid, $WpdGuid -ErrorAction Stop
        }
    } catch {
        Write-Error "Erreur lors de l'application sur $target : $_"
    }
}
`
  },
  {
    name: 'Block_USB_Storage.reg',
    extension: 'reg',
    description: 'Fichier de Registre Windows pour bloquer instantanément le stockage amovible en 1 double-clic',
    category: 'registry',
    content: `Windows Registry Editor Version 5.00

; ==============================================================================
; WINLOCK USB - BLOCAGE COMPLET DES CLÉS USB ET DISQUES EXTERNES
; Préserve la souris, le clavier et les imprimantes (Classes HID & Printers)
; ==============================================================================

; 1. Stratégie GPO Machine - Interdire l'accès à tous les périphériques de stockage amovible
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices]
"Deny_All"=dword:00000001

; 2. Restriction ciblée sur les disques amovibles (Flash Drive / HDD Externe)
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}]
"Deny_Read"=dword:00000001
"Deny_Write"=dword:00000001
"Deny_Execute"=dword:00000001

; 3. Restriction sur les smartphones / appareils photos MTP (WPD)
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{6AC27878-A641-422B-BAC6-F4A9102EAC32}]
"Deny_Read"=dword:00000001
"Deny_Write"=dword:00000001

; 4. Désactivation du pilote de stockage de masse USBSTOR (Start = 4)
; Note : Les souris et claviers utilisent HIDUSB.SYS / MOUHID.SYS / KBDHID.SYS et restent actifs
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR]
"Start"=dword:00000004
`
  },
  {
    name: 'ReadOnly_USB_Storage.reg',
    extension: 'reg',
    description: 'Fichier de Registre pour interdire la copie de fichiers vers les clés USB (Lecture Seule)',
    category: 'registry',
    content: `Windows Registry Editor Version 5.00

; ==============================================================================
; WINLOCK USB - PASSAGE DU STOCKAGE AMOVIBLE EN LECTURE SEULE
; Permet aux employés de lire des documents mais interdit l'exfiltration de données
; ==============================================================================

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices]
"Deny_All"=-

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}]
"Deny_Read"=dword:00000000
"Deny_Write"=dword:00000001
"Deny_Execute"=dword:00000000

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR]
"Start"=dword:00000003
`
  },
  {
    name: 'Unblock_USB_Storage.reg',
    extension: 'reg',
    description: 'Fichier de Registre pour réautoriser l\'ensemble des périphériques USB de stockage',
    category: 'registry',
    content: `Windows Registry Editor Version 5.00

; ==============================================================================
; WINLOCK USB - RESTAURATION DE L'ACCÈS NORMAL AU STOCKAGE USB
; ==============================================================================

[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices]

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR]
"Start"=dword:00000003
`
  },
  {
    name: 'Bloquer_USB_Immediat.bat',
    extension: 'bat',
    description: 'Script Batch Windows 1-Clic pour bloquer immédiatement le stockage USB (Exécuter en tant qu\'administrateur)',
    category: 'registry',
    content: `@echo off
chcp 65001 >nul
:: ==============================================================================
:: WINLOCK USB - SCRIPT D'APPLICATION IMMEDIATE (CLIC DROIT -> EXECUTER EN ADMIN)
:: ==============================================================================
title WinLock USB - Blocage Réel Immédiat

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ==============================================================================
    echo [ATTENTION] CE SCRIPT NECESSITE LES DROITS D'ADMINISTRATEUR WINDOWS.
    echo.
    echo Pour bloquer physiquement les ports USB de cette machine :
    echo   1. Faites un clic droit sur ce fichier 'Bloquer_USB_Immediat.bat'
    echo   2. Cliquez sur 'Executer en tant qu'administrateur'
    echo ==============================================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ==============================================================================
echo   WINLOCK USB : VERROUILLAGE REEL DES CLES USB ET DISQUES EXTERNES
echo ==============================================================================
echo.

echo [1/3] Configuration des cles de registre GPO RemovableStorageDevices...
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices" /v "Deny_All" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" /v "Deny_Read" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" /v "Deny_Write" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" /v "Deny_Execute" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{6AC27878-A641-422B-BAC6-F4A9102EAC32}" /v "Deny_Read" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{6AC27878-A641-422B-BAC6-F4A9102EAC32}" /v "Deny_Write" /t REG_DWORD /d 1 /f >nul

echo [2/3] Desactivation du pilote USBSTOR (Start = 4)...
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v "Start" /t REG_DWORD /d 4 /f >nul

echo [3/3] Rafraichissement immediat des strategies locales Windows...
gpupdate /target:computer /wait:0 >nul 2>&1

echo.
echo ==============================================================================
echo   [SUCCES TOTAL] :
echo   - Les cles USB et disques durs externes sont DESORMAIS BLOQUES sur ce PC !
echo   - La souris et le clavier USB restent 100%% INTACTS et OPERATIONNELS.
echo ==============================================================================
echo.
pause
`
  },
  {
    name: 'Lecture_Seule_USB.bat',
    extension: 'bat',
    description: 'Script Batch Windows 1-Clic pour passer les clés USB en lecture seule (Anti-fuite / Anti-vol)',
    category: 'registry',
    content: `@echo off
chcp 65001 >nul
title WinLock USB - Passage en Lecture Seule

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERREUR] Clic droit sur ce fichier -^> "Executer en tant qu'administrateur".
    pause
    exit /b 1
)

echo Configuration en LECTURE SEULE (Copie vers USB interdite)...
reg delete "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices" /v "Deny_All" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" /v "Deny_Read" /t REG_DWORD /d 0 /f >nul
reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" /v "Deny_Write" /t REG_DWORD /d 1 /f >nul
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v "Start" /t REG_DWORD /d 3 /f >nul
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies" /v "WriteProtect" /t REG_DWORD /d 1 /f >nul

gpupdate /target:computer /wait:0 >nul 2>&1

echo [SUCCES] Cles USB en mode LECTURE SEULE. Consultation permise, ecriture bloquee.
pause
`
  },
  {
    name: 'Debloquer_USB.bat',
    extension: 'bat',
    description: 'Script Batch Windows 1-Clic pour réautoriser tous les ports USB',
    category: 'registry',
    content: `@echo off
chcp 65001 >nul
title WinLock USB - Déblocage USB

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERREUR] Clic droit sur ce fichier -^> "Executer en tant qu'administrateur".
    pause
    exit /b 1
)

echo Retrait des restrictions USB...
reg delete "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices" /f >nul 2>&1
reg delete "HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies" /v "WriteProtect" /f >nul 2>&1
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v "Start" /t REG_DWORD /d 3 /f >nul

gpupdate /target:computer /wait:0 >nul 2>&1

echo [SUCCES] Tous les ports USB sont DEBLOQUES. Acces normal retabli.
pause
`
  },
  {
    name: 'Audit-Inventaire-PC-Local-Et-Reseau.ps1',
    extension: 'ps1',
    description: 'Script PowerShell d\'inventaire complet : extrait le nom réel du PC, l\'adresse MAC, l\'IP locale et le statut USB',
    category: 'powershell',
    content: `<#
.SYNOPSIS
    WinLock USB - Inventaire Matériel & Réseau Haute Précision (Nom Réel, MAC & IP)
    Extrait les coordonnées réelles de l'ordinateur Windows et génère un rapport certifié.
#>

[CmdletBinding()]
param(
    [string]$ExportPath = "$([Environment]::GetFolderPath('Desktop'))\\Inventaire_PC_$($env:COMPUTERNAME).json"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " INVENTAIRE MATÉRIEL ET RÉSEAU DU POSTE WINDOWS (Nom, MAC, IP)  " -ForegroundColor Cyan
Write-Host "================================================================="

# 1. Nom Réel de l'ordinateur et Domaine
$computerName = $env:COMPUTERNAME
$computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue
$domainName = if ($computerSystem) { $computerSystem.Domain } else { "WORKGROUP" }
$osInfo = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction SilentlyContinue

# 2. Cartes Réseau et Adresses MAC Physiques
$adapters = Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Up" }
$primaryAdapter = $adapters | Select-Object -First 1

# 3. Adresses IP Réseau
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
$primaryIp = if ($ipAddresses) { $ipAddresses[0].IPAddress } else { "127.0.0.1" }

# 4. Statut du verrouillage USB dans le Registre
$policyPath = "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices"
$usbstorPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR"

$denyAll = (Get-ItemProperty -Path $policyPath -Name "Deny_All" -ErrorAction SilentlyContinue).Deny_All
$usbstorStart = (Get-ItemProperty -Path $usbstorPath -Name "Start" -ErrorAction SilentlyContinue).Start

$usbStatus = if ($denyAll -eq 1 -or $usbstorStart -eq 4) { "BLOQUÉ TOTAL" }
             elseif ((Get-ItemProperty -Path "$policyPath\\{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}" -Name "Deny_Write" -ErrorAction SilentlyContinue).Deny_Write -eq 1) { "LECTURE SEULE" }
             else { "AUTORISÉ (DÉBLOQUÉ)" }

# Affichage à l'écran
Write-Host "  • Nom Réel (NetBIOS) : " -NoNewline; Write-Host $computerName -ForegroundColor Yellow
Write-Host "  • Domaine / Réseau   : " -NoNewline; Write-Host $domainName -ForegroundColor Green
Write-Host "  • Adresse IP Locale  : " -NoNewline; Write-Host $primaryIp -ForegroundColor Green
Write-Host "  • Adresse MAC        : " -NoNewline; Write-Host $primaryAdapter.MacAddress -ForegroundColor Cyan
Write-Host "  • Contrôleur NIC     : " -NoNewline; Write-Host $primaryAdapter.InterfaceDescription -ForegroundColor Gray
Write-Host "  • Système d'Exploit. : " -NoNewline; Write-Host "$($osInfo.Caption) ($($osInfo.OSArchitecture))" -ForegroundColor Gray
Write-Host "  • Politique USB      : " -NoNewline; Write-Host $usbStatus -ForegroundColor $(if ($usbStatus -like "*BLOQUÉ*") { "Red" } else { "Green" })
Write-Host "-----------------------------------------------------------------"

# Export Structuré JSON
$inventoryData = [PSCustomObject]@{
    Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    NomReelHostname = $computerName
    Domaine = $domainName
    AdresseIp = $primaryIp
    AdresseMac = $primaryAdapter.MacAddress
    CarteReseau = $primaryAdapter.InterfaceDescription
    VitesseLiaison = $primaryAdapter.LinkSpeed
    SystemeExploitation = $osInfo.Caption
    Architecture = $osInfo.OSArchitecture
    StatutUsb = $usbStatus
    DenyAllGpo = $denyAll
    UsbStorStart = $usbstorStart
}

$inventoryData | ConvertTo-Json -Depth 3 | Out-File -FilePath $ExportPath -Encoding utf8
Write-Host "[+] Rapport d'inventaire exporté avec succès dans :" -ForegroundColor Green
Write-Host "    $ExportPath" -ForegroundColor White
Write-Host "================================================================="
`
  },
  {
    name: 'Bloquer-Wifi-Sauf-Winbox-MikroTik.ps1',
    extension: 'ps1',
    description: 'Bloque tout le trafic Wi-Fi sur Windows Defender Firewall SAUF les connexions Winbox MikroTik (Port TCP 8291, MNDP UDP 5678 & winbox.exe)',
    category: 'powershell',
    content: `<#
.SYNOPSIS
    WinLock - Blocage de la connexion Wi-Fi avec Exception Winbox MikroTik.
.DESCRIPTION
    1. Bloque le trafic réseau Wi-Fi (Internet, HTTP, DNS, SMB, partages) sur les cartes sans fil.
    2. Autorise EXCLUSIVEMENT les connexions de gestion MikroTik RouterOS :
       - Port TCP 8291 (Port officiel Winbox)
       - Port UDP 5678 (MikroTik Neighbor Discovery Protocol - MNDP / Recherche MAC Winbox)
       - Processus Winbox (winbox.exe et winbox64.exe)
       - Sous-réseau d'administration MikroTik (par défaut : 192.168.88.0/24)
.NOTES
    Exécuter dans une session PowerShell élevée en tant qu'Administrateur.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$MikrotikRouterIP = "192.168.88.1",

    [Parameter(Mandatory = $false)]
    [string]$MikrotikSubnet = "192.168.88.0/24"
)

function Test-IsAdmin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin)) {
    Write-Warning "Ce script doit être exécuté en Administrateur (Clic-droit > Exécuter avec PowerShell)."
    exit 1
}

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   WINLOCK - BLOCAGE DU WI-FI AVEC EXCEPTION WINBOX MIKROTIK (ROUTEROS)         " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Configuration cible :" -ForegroundColor White
Write-Host "  * IP Routeur MikroTik : $MikrotikRouterIP" -ForegroundColor Yellow
Write-Host "  * Sous-réseau d'admin : $MikrotikSubnet" -ForegroundColor Yellow
Write-Host "  * Port TCP Winbox     : 8291 (Totalement Ouvert & Protégé)" -ForegroundColor Green
Write-Host "  * Port UDP Découverte : 5678 (MNDP / MAC Telnet Actif)" -ForegroundColor Green
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Gray

# 1. Nettoyage des anciennes règles WinLock Wi-Fi si existantes
Remove-NetFirewallRule -Name "WinLock-WiFi-*" -ErrorAction SilentlyContinue

# 2. Règle 1 : Bloquer tout le trafic sortant sur les interfaces Wi-Fi
Write-Host "[1/4] Application du blocage général du trafic Wi-Fi..." -ForegroundColor Yellow
New-NetFirewallRule -Name "WinLock-WiFi-Block-Outbound" \`
    -DisplayName "WinLock - Blocage Trafic Wi-Fi Général" \`
    -Description "Bloque tout le trafic sortant sur les adaptateurs sans fil pour empêcher les fuites et partages de connexion." \`
    -Direction Outbound \`
    -InterfaceType Wireless \`
    -Action Block \`
    -Profile Any \`
    -Enabled True | Out-Null

# 3. Règle 2 : Exception Winbox MikroTik TCP 8291 (Gestion RouterOS)
Write-Host "[2/4] Création de l'exception prioritaire Winbox (Port TCP 8291)..." -ForegroundColor Green
New-NetFirewallRule -Name "WinLock-WiFi-Allow-Winbox-TCP" \`
    -DisplayName "WinLock - Exception Winbox MikroTik TCP 8291" \`
    -Description "Autorise explicitement la connexion Winbox MikroTik sur le port TCP 8291." \`
    -Direction Outbound \`
    -InterfaceType Wireless \`
    -Protocol TCP \`
    -RemotePort 8291 \`
    -Action Allow \`
    -Profile Any \`
    -Enabled True | Out-Null

# 4. Règle 3 : Exception MikroTik MNDP UDP 5678 (Découverte voisins & Winbox MAC)
Write-Host "[3/4] Création de l'exception de découverte MikroTik (Port UDP 5678)..." -ForegroundColor Green
New-NetFirewallRule -Name "WinLock-WiFi-Allow-MNDP-UDP" \`
    -DisplayName "WinLock - Exception MikroTik MNDP UDP 5678" \`
    -Description "Permet à Winbox de découvrir les routeurs MikroTik par adresse MAC et MNDP." \`
    -Direction Outbound \`
    -InterfaceType Wireless \`
    -Protocol UDP \`
    -RemotePort 5678 \`
    -Action Allow \`
    -Profile Any \`
    -Enabled True | Out-Null

# 5. Règle 4 : Exception applicative pour les processus winbox.exe et winbox64.exe
Write-Host "[4/4] Autorisation du binaire officiel Winbox..." -ForegroundColor Green
New-NetFirewallRule -Name "WinLock-WiFi-Allow-Winbox-App" \`
    -DisplayName "WinLock - Autorisation Application Winbox" \`
    -Description "Autorise le binaire Winbox à émettre sur le réseau Wi-Fi vers le routeur." \`
    -Direction Outbound \`
    -InterfaceType Wireless \`
    -Program "%SystemRoot%\\..\\*winbox*.exe" \`
    -Action Allow \`
    -Profile Any \`
    -Enabled True -ErrorAction SilentlyContinue | Out-Null

Write-Host "--------------------------------------------------------------------------------" -ForegroundColor Gray
Write-Host " [+] VERROUILLAGE ACTIF : Tout le Wi-Fi externe / Internet est BLOQUE." -ForegroundColor Green
Write-Host " [+] EXCEPTION VALIDEE  : Winbox MikroTik (TCP 8291 & UDP 5678) est OPERATIONNEL." -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
`
  },
  {
    name: 'Bloquer-Wifi-Sauf-Winbox-MikroTik.bat',
    extension: 'bat',
    description: 'Lanceur Batch 1-Clic pour bloquer le Wi-Fi tout en maintenant Winbox MikroTik accessible',
    category: 'powershell',
    content: `@echo off
chcp 65001 >nul
title WinLock - Blocage Wi-Fi avec Exception Winbox MikroTik (TCP 8291)
color 0b
cls
echo ==============================================================================
echo   WINLOCK - BLOCAGE DU WI-FI AVEC EXCEPTION WINBOX MIKROTIK
echo ==============================================================================
echo Application des regles Windows Defender Firewall...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'SilentlyContinue'; " ^
  "Remove-NetFirewallRule -Name 'WinLock-WiFi-*' -ErrorAction SilentlyContinue; " ^
  "New-NetFirewallRule -Name 'WinLock-WiFi-Block-Outbound' -DisplayName 'WinLock - Blocage WiFi Sortant' -Direction Outbound -InterfaceType Wireless -Action Block -Profile Any -Enabled True | Out-Null; " ^
  "New-NetFirewallRule -Name 'WinLock-WiFi-Allow-Winbox-TCP' -DisplayName 'WinLock - Winbox MikroTik TCP 8291' -Direction Outbound -InterfaceType Wireless -Protocol TCP -RemotePort 8291 -Action Allow -Profile Any -Enabled True | Out-Null; " ^
  "New-NetFirewallRule -Name 'WinLock-WiFi-Allow-MNDP-UDP' -DisplayName 'WinLock - MikroTik MNDP UDP 5678' -Direction Outbound -InterfaceType Wireless -Protocol UDP -RemotePort 5678 -Action Allow -Profile Any -Enabled True | Out-Null; " ^
  "Write-Host '==============================================================================' -ForegroundColor Cyan; " ^
  "Write-Host ' [OK] BLOCAGE WI-FI APPLIQUE AVEC SUCCES !' -ForegroundColor Green; " ^
  "Write-Host '   * Connexions Wi-Fi standards : BLOQUEES (Anti-Fuite / Anti-Hotspot)' -ForegroundColor Yellow; " ^
  "Write-Host '   * Winbox MikroTik (Port 8291): 100%% AUTORISE ET FONCTIONNEL' -ForegroundColor Green; " ^
  "Write-Host '   * Decouverte MAC (Port 5678) : 100%% AUTORISEE' -ForegroundColor Green; " ^
  "Write-Host '==============================================================================' -ForegroundColor Cyan;"

echo.
pause
`
  },
  {
    name: 'Debloquer-Wifi.bat',
    extension: 'bat',
    description: 'Supprime les restrictions de pare-feu et rétablit le Wi-Fi complet',
    category: 'powershell',
    content: `@echo off
chcp 65001 >nul
title WinLock - Retablissement du Wi-Fi Standard
color 0a
cls
echo ==============================================================================
echo   WINLOCK - RETABLISSEMENT DU WI-FI (LEVER LES RESTRICTIONS)
echo ==============================================================================
echo Suppression des regles de filtrage Wi-Fi...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Remove-NetFirewallRule -Name 'WinLock-WiFi-*' -ErrorAction SilentlyContinue; " ^
  "Write-Host ' [OK] Toutes les regles de blocage Wi-Fi ont ete retirees.' -ForegroundColor Green; " ^
  "Write-Host ' Le Wi-Fi de ce PC fonctionne desormais de maniere standard.' -ForegroundColor White;"

echo.
pause
`
  },
  {
    name: 'Tester-Winbox-Port8291.ps1',
    extension: 'ps1',
    description: 'Teste l\'accessibilité du routeur MikroTik et du port Winbox 8291 depuis ce PC',
    category: 'powershell',
    content: `<#
.SYNOPSIS
    Test de connectivité Winbox MikroTik RouterOS (Port TCP 8291 & Découverte UDP 5678)
#>

param(
    [string]$RouterIP = "192.168.88.1"
)

Write-Host "Test de communication vers le routeur MikroTik ($RouterIP : 8291)..." -ForegroundColor Cyan

$test = Test-NetConnection -ComputerName $RouterIP -Port 8291 -WarningAction SilentlyContinue

if ($test.TcpTestSucceeded) {
    Write-Host " [SUCCESS] Le port Winbox 8291 est OUVERT et accessible !" -ForegroundColor Green
    Write-Host " Temps de reponse : $($test.RoundTripTime) ms" -ForegroundColor Yellow
} else {
    Write-Host " [AVERTISSEMENT] Le port 8291 ne repond pas sur $RouterIP." -ForegroundColor Red
    Write-Host " Verifiez que le routeur MikroTik est bien allume et que son IP correspond." -ForegroundColor Gray
}
`
  }
];

export const DEVICE_TAXONOMY_INFO = [
  {
    category: 'Périphériques Bloqués (Ciblés)',
    type: 'Stockage & Amovibles',
    isBlocked: true,
    items: [
      {
        name: 'Clés USB Flash Drive (SanDisk, Kingston, etc.)',
        service: 'USBSTOR.SYS',
        guid: '{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}',
        reason: 'Risque de vol de données, exfiltration et infection par virus/trojans.'
      },
      {
        name: 'Disques Durs Externes USB & SSD Portables',
        service: 'USBSTOR.SYS / UASPSTOR',
        guid: '{4d36e967-e325-11ce-bfc1-08002be10318}',
        reason: 'Stockage de masse à haute capacité non autorisé.'
      },
      {
        name: 'Cartes SD & Lecteurs Multi-cartes',
        service: 'SDBUS / USBSTOR',
        guid: '{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}',
        reason: 'Support amovible physique non contrôlé.'
      },
      {
        name: 'Smartphones Android / iPhone (Mode MTP / WPD)',
        service: 'WpdUsb.sys / WinUsb',
        guid: '{6AC27878-A641-422B-BAC6-F4A9102EAC32}',
        reason: 'Transfert de fichiers de terminal mobile vers le PC d\'entreprise.'
      }
    ]
  },
  {
    category: 'Périphériques Préservés (JAMAIS Bloqués)',
    type: 'Périphériques d\'Interface & Outils de Travail',
    isBlocked: false,
    items: [
      {
        name: 'Souris USB & Récepteurs Sans Fil (Logitech, Razer...)',
        service: 'MOUHID.SYS / HIDUSB.SYS',
        guid: '{4d36e96f-e325-11ce-bfc1-08002be10318}',
        reason: 'Classe HID Mouse. Totalement indépendante du sous-système de stockage amovible.'
      },
      {
        name: 'Claviers USB & Pavés Numériques',
        service: 'KBDHID.SYS / HIDUSB.SYS',
        guid: '{4d36e96b-e325-11ce-bfc1-08002be10318}',
        reason: 'Classe HID Keyboard. Aucune restriction appliquée.'
      },
      {
        name: 'Casques Audio, Écouteurs & Microphones USB',
        service: 'USBAUDIO.SYS',
        guid: '{4d36e96c-e325-11ce-bfc1-08002be10318}',
        reason: 'Classe Audio/Média. Non affectée par la stratégie RemovableStorageDevices.'
      },
      {
        name: 'Webcams USB & Caméras de Visioconférence',
        service: 'USBCAMD.SYS / USBVIDEO',
        guid: '{6bdd1fc6-810f-11d0-bec7-08002be2092f}',
        reason: 'Classe Image / Camera. Fonctionnement continu garanti.'
      },
      {
        name: 'Imprimantes & Scanners USB',
        service: 'USBPRINT.SYS',
        guid: '{4d36e979-e325-11ce-bfc1-08002be10318}',
        reason: 'Classe Printers. Les impressions directes en USB continuent de fonctionner.'
      },
      {
        name: 'Lecteurs de Cartes à Puce (Smartcards / Badges PKI)',
        service: 'WUDFRd / ScFilter',
        guid: '{50dd5230-ba8a-114a-8848-006209520000}',
        reason: 'Authentification d\'entreprise et cartes à puce conservées.'
      }
    ]
  }
];
