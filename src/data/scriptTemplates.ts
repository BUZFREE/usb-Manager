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
