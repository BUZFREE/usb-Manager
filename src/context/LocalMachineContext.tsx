import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalMachineInfo } from '../types/usbPolicy';
import { downloadText } from '../utils/zipGenerator';

const STORAGE_KEY = 'winlock_local_machine_inventory_v3';

export const DEFAULT_INITIAL_MACHINE: LocalMachineInfo = {
  hostname: 'CE-PC (Scan en attente)',
  ip: 'Non scanné (Cliquez sur Détecter / Scanner)',
  macAddress: 'Non scanné (Cliquez sur Détecter / Scanner)',
  domainOrWorkgroup: 'WORKGROUP',
  os: typeof navigator !== 'undefined' ? `${navigator.platform || 'Windows'} (Web)` : 'Windows 11 / 10',
  nicAdapter: 'Contrôleur Réseau en attente de scan...',
  subnetMask: '255.255.255.0 (/24)',
  defaultGateway: '192.168.1.1',
  dnsServer: '1.1.1.1, 8.8.8.8',
  dhcpEnabled: true,
  status: 'online',
  lastDetected: 'En attente',
  isVerifiedReal: false,
  scanSource: 'DEFAULT_UNSCANNED',
};

// 1-Line cross-version PowerShell command that queries real Hostname, MAC, IP, NIC and puts compressed JSON in clipboard
export const POWERSHELL_ONE_LINER = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $c=$env:COMPUTERNAME; $d=(Get-CimInstance Win32_ComputerSystem).Domain; if(-not $d){$d='WORKGROUP'}; $o=(Get-CimInstance Win32_OperatingSystem).Caption; $ad=(Get-NetAdapter | Where-Object Status -eq 'Up' | Select-Object -First 1); $mac=if($ad){$ad.MacAddress}else{(Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled -eq $true | Select-Object -First 1).MACAddress}; if(-not $mac){$mac='00:00:00:00:00:00'}; $nic=if($ad){$ad.InterfaceDescription}else{'Controleur Reseau Actif'}; $ip=(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'} | Select-Object -First 1).IPAddress; if(-not $ip){$ip=(Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled -eq $true | Select-Object -First 1).IPAddress[0]}; $res=[PSCustomObject]@{hostname=$c;ip=$ip;macAddress=$mac;nicAdapter=$nic;domain=$d;os=$o;scannedAt=(Get-Date).ToString('yyyy-MM-dd HH:mm:ss');isVerifiedReal=$true;scanSource='LOCAL_SCRIPT_SCAN'}; $j=$res|ConvertTo-Json -Compress; Set-Clipboard -Value $j; Write-Host '=================================================================' -ForegroundColor Cyan; Write-Host ' [+] SCAN REEL TERMINE AVEC SUCCES !' -ForegroundColor Green; Write-Host ('   * Nom Reel (Hostname) : ' + $c) -ForegroundColor Yellow; Write-Host ('   * Adresse MAC         : ' + $mac) -ForegroundColor Yellow; Write-Host ('   * Adresse IP          : ' + $ip) -ForegroundColor Yellow; Write-Host ('   * Carte Reseau (NIC)  : ' + $nic) -ForegroundColor Gray; Write-Host '=================================================================' -ForegroundColor Cyan; Write-Host ' [OK] Donnees copiees dans votre presse-papiers !' -ForegroundColor Green; Write-Host ' Retournez sur l application et cliquez sur: Coller depuis le Presse-papiers.' -ForegroundColor White;"`;

export const SCANNER_BAT_CONTENT = `@echo off
chcp 65001 >nul
title WinLock USB - Scanner d'Inventaire Réel (Nom, MAC, IP & USB)
color 0b
cls
echo ==============================================================================
echo   WINLOCK USB - SCANNER D'INVENTAIRE MATERIEL REEL (Windows Host)
echo ==============================================================================
echo Analyse en cours des parametres materiels reels de ce PC Windows...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'SilentlyContinue'; " ^
  "$comp = $env:COMPUTERNAME; " ^
  "$dom = (Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).Domain; " ^
  "if (-not $dom) { $dom = 'WORKGROUP' }; " ^
  "$os = (Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue).Caption; " ^
  "$adapters = Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up'; " ^
  "$adapter = $adapters | Select-Object -First 1; " ^
  "$mac = if ($adapter) { $adapter.MacAddress } else { (Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled -eq $true | Select-Object -First 1).MACAddress }; " ^
  "if (-not $mac) { $mac = '00:00:00:00:00:00' }; " ^
  "$nic = if ($adapter) { $adapter.InterfaceDescription } else { 'Controleur Reseau Actif' }; " ^
  "$ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' }; " ^
  "$ip = if ($ips) { ($ips | Select-Object -First 1).IPAddress } else { (Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled -eq $true | Select-Object -First 1).IPAddress[0] }; " ^
  "if (-not $ip) { $ip = '127.0.0.1' }; " ^
  "$usbs = @(Get-PnpDevice -Class USB -Status OK -ErrorAction SilentlyContinue | ForEach-Object { @{ name = $_.FriendlyName; id = $_.InstanceId; class = $_.Class } }); " ^
  "$report = [PSCustomObject]@{ " ^
  "  hostname = $comp; " ^
  "  ip = $ip; " ^
  "  macAddress = $mac; " ^
  "  nicAdapter = $nic; " ^
  "  domain = $dom; " ^
  "  os = $os; " ^
  "  usbCount = $usbs.Count; " ^
  "  usbDevices = $usbs; " ^
  "  scannedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss'); " ^
  "  isVerifiedReal = $true; " ^
  "  scanSource = 'LOCAL_SCRIPT_SCAN' " ^
  "}; " ^
  "$dest = Join-Path ([Environment]::GetFolderPath('Desktop')) 'mon_pc_scan.json'; " ^
  "$report | ConvertTo-Json -Depth 4 | Out-File -FilePath $dest -Encoding utf8; " ^
  "$jsonClip = $report | ConvertTo-Json -Compress; " ^
  "Set-Clipboard -Value $jsonClip; " ^
  "Write-Host '------------------------------------------------------------------------------' -ForegroundColor Cyan; " ^
  "Write-Host ' [+] SCAN TERMINE AVEC SUCCES !' -ForegroundColor Green; " ^
  "Write-Host ('   * Nom Reel de ce PC : ' + $comp) -ForegroundColor Yellow; " ^
  "Write-Host ('   * Adresse MAC       : ' + $mac) -ForegroundColor Yellow; " ^
  "Write-Host ('   * Adresse IP        : ' + $ip) -ForegroundColor Yellow; " ^
  "Write-Host ('   * Carte Reseau      : ' + $nic) -ForegroundColor Gray; " ^
  "Write-Host ('   * Peripheriques USB : ' + $usbs.Count + ' detectes') -ForegroundColor Gray; " ^
  "Write-Host '------------------------------------------------------------------------------' -ForegroundColor Cyan; " ^
  "Write-Host (' [+] Fichier genere sur votre Bureau : ' + $dest) -ForegroundColor Green; " ^
  "Write-Host ' [+] DONNEES DU SCAN COPIEES DIRECTEMENT DANS LE PRESSE-PAPIERS !' -ForegroundColor Yellow; " ^
  "Write-Host '   Retournez sur l application et cliquez sur: Coller depuis le Presse-papiers.' -ForegroundColor White;"

echo.
pause
`;

/**
 * Robust multi-format parser for JSON, clipboard content, or text dump (ipconfig / terminal).
 */
export function parseScanInput(raw: string): Partial<LocalMachineInfo> | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Try parsing JSON (direct or embedded between braces)
  try {
    let jsonStr = trimmed;
    const jsonStart = trimmed.indexOf('{');
    const jsonEnd = trimmed.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      jsonStr = trimmed.substring(jsonStart, jsonEnd + 1);
    }
    const data = JSON.parse(jsonStr);
    if (data && (data.hostname || data.macAddress || data.ip || data.ComputerName || data.nom)) {
      return {
        hostname: (data.hostname || data.ComputerName || data.nom || '').trim().toUpperCase(),
        ip: (data.ip || data.IPAddress || data.adresseIp || '').trim(),
        macAddress: (data.macAddress || data.Mac || data.mac || '').trim().toUpperCase(),
        nicAdapter: data.nicAdapter || data.carteReseau || data.Adapter || 'Contrôleur Réseau Windows',
        domainOrWorkgroup: (data.domain || data.domaine || data.Workgroup || 'WORKGROUP').trim().toUpperCase(),
        os: data.os || data.OperatingSystem || 'Windows 11 / 10',
        isVerifiedReal: true,
        scanSource: 'LOCAL_SCRIPT_SCAN',
        detectedUsbDevicesCount: Array.isArray(data.usbDevices) ? data.usbDevices.length : data.usbCount,
      };
    }
  } catch {}

  // 2. Try parsing Key-Value or raw text (e.g. from ipconfig or PowerShell output)
  let foundHostname: string | undefined;
  let foundIp: string | undefined;
  let foundMac: string | undefined;
  let foundNic: string | undefined;

  const hostMatch = trimmed.match(/(?:hostname|nom de l'hôte|nom de la machine|nom de l'ordinateur|computername)\s*[:=]\s*([a-zA-Z0-9_-]+)/i);
  if (hostMatch) foundHostname = hostMatch[1].trim().toUpperCase();

  const macMatch = trimmed.match(/([0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2})/);
  if (macMatch) foundMac = macMatch[1].replace(/-/g, ':').toUpperCase();

  const ipMatch = trimmed.match(/(?:ip(?:v4)?|adresse ip|ipaddress)\s*[:=]?\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i)
    || trimmed.match(/\b(192\.168\.[0-9]{1,3}\.[0-9]{1,3}|10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|172\.(?:1[6-9]|2[0-9]|3[0-1])\.[0-9]{1,3}\.[0-9]{1,3})\b/);
  if (ipMatch) foundIp = ipMatch[1];

  const nicMatch = trimmed.match(/(?:carte|adapter|description|interface)\s*[:=]\s*([^\r\n]+)/i);
  if (nicMatch) foundNic = nicMatch[1].trim();

  if (foundHostname || foundMac || foundIp) {
    return {
      hostname: foundHostname || 'MON-PC',
      ip: foundIp || '192.168.1.100',
      macAddress: foundMac || '00:00:00:00:00:00',
      nicAdapter: foundNic || 'Contrôleur Réseau Windows',
      domainOrWorkgroup: 'WORKGROUP',
      isVerifiedReal: true,
      scanSource: 'LOCAL_SCRIPT_SCAN',
    };
  }

  return null;
}

interface LocalMachineContextType {
  localMachine: LocalMachineInfo;
  setLocalMachine: React.Dispatch<React.SetStateAction<LocalMachineInfo>>;
  updateLocalMachine: (info: Partial<LocalMachineInfo>) => void;
  importScanJsonContent: (content: string) => { success: boolean; message: string };
  importFromClipboard: () => Promise<{ success: boolean; message: string }>;
  downloadScannerBat: () => void;
  copyPowerShellCommand: () => Promise<boolean>;
  detectBrowserHardwareAndIp: () => Promise<string | null>;
  resetToDefault: () => void;
}

const LocalMachineContext = createContext<LocalMachineContextType | undefined>(undefined);

export const LocalMachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localMachine, setLocalMachine] = useState<LocalMachineInfo>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // If stored state was old placeholder or bogus mock, discard it
          if (
            parsed.hostname === 'PC-EN-ATTENTE-DE-SCAN' ||
            parsed.hostname === 'DESKTOP-SEC-CORP' ||
            parsed.hostname === 'DESKTOP-SEC-CORP01' ||
            parsed.macAddress === '00:1A:2B:3C:4D:5E' ||
            parsed.macAddress === 'B4:2E:99:A1:74:0C'
          ) {
            return DEFAULT_INITIAL_MACHINE;
          }
          return { ...DEFAULT_INITIAL_MACHINE, ...parsed };
        }
      } catch (err) {
        console.error('Failed to load local machine from storage', err);
      }
    }
    return DEFAULT_INITIAL_MACHINE;
  });

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localMachine));
    } catch {}
  }, [localMachine]);

  // Clean old versions of local storage keys
  useEffect(() => {
    try {
      localStorage.removeItem('winlock_local_machine_inventory');
      localStorage.removeItem('winlock_local_machine_inventory_v2');
    } catch {}
  }, []);

  const updateLocalMachine = (info: Partial<LocalMachineInfo>) => {
    setLocalMachine((prev) => ({
      ...prev,
      ...info,
      lastDetected: new Date().toLocaleTimeString('fr-FR'),
    }));
  };

  const copyPowerShellCommand = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(POWERSHELL_ONE_LINER);
      return true;
    } catch {
      return false;
    }
  };

  const importFromClipboard = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        return {
          success: false,
          message: "L'accès au presse-papiers est refusé par la sandbox du navigateur. Utilisez la commande 1-ligne ou le fichier .bat.",
        };
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        return {
          success: false,
          message: "Le presse-papiers est vide. Exécutez d'abord la commande PowerShell 1-ligne ou Scanner-Ce-PC.bat !",
        };
      }
      return importScanJsonContent(text.trim());
    } catch (err: any) {
      return {
        success: false,
        message: `Erreur presse-papiers (${err.message || 'accès restreint'}). Utilisez le bouton [Importer Scan JSON] ou saisissez vos coordonnées manuellement.`,
      };
    }
  };

  const detectBrowserHardwareAndIp = async (): Promise<string | null> => {
    let publicIp: string | null = null;
    let localIp: string | null = null;

    // 1. Browser details
    const cores = navigator.hardwareConcurrency || 4;
    // @ts-ignore
    const mem = navigator.deviceMemory || undefined;
    const res = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
    const platform = navigator.userAgent.includes('Windows NT 10.0')
      ? 'Windows 11 / 10'
      : navigator.userAgent.includes('Windows NT')
      ? 'Windows NT'
      : navigator.platform || 'Windows';

    // 2. Query public IP as informational metadata
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          publicIp = data.ip;
        }
      }
    } catch {}

    // 3. WebRTC Local IP candidate probe
    try {
      // @ts-ignore
      const pc = new (window.RTCPeerConnection || window.webkitRTCPeerConnection)({ iceServers: [] });
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          try { pc.close(); } catch {}
          resolve();
        }, 700);

        pc.onicecandidate = (ice: any) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const candidate = ice.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch && ipMatch[1] && !ipMatch[1].startsWith('127.') && !ipMatch[1].startsWith('169.254.')) {
            localIp = ipMatch[1];
            clearTimeout(timeout);
            try { pc.close(); } catch {}
            resolve();
          }
        };
      });
    } catch {}

    setLocalMachine((prev) => {
      // Don't overwrite if verified by script
      if (prev.isVerifiedReal) {
        return {
          ...prev,
          publicIp: publicIp || prev.publicIp,
          cpuCores: cores,
          deviceMemoryGb: mem,
          screenResolution: res,
        };
      }

      // If local IP was discovered via WebRTC, apply it; otherwise keep status clear
      return {
        ...prev,
        ip: localIp ? localIp : prev.ip,
        publicIp: publicIp || undefined,
        cpuCores: cores,
        deviceMemoryGb: mem,
        screenResolution: res,
        os: `${platform} (Navigateur)`,
        lastDetected: new Date().toLocaleTimeString('fr-FR'),
      };
    });

    return localIp || publicIp;
  };

  const importScanJsonContent = (content: string): { success: boolean; message: string } => {
    const parsed = parseScanInput(content);
    if (!parsed) {
      return {
        success: false,
        message: 'Format non reconnu. Assurez-vous d\'avoir exécuté la commande PowerShell ou Scanner-Ce-PC.bat.',
      };
    }

    const updated: LocalMachineInfo = {
      hostname: parsed.hostname || 'PC-LOCAL',
      ip: parsed.ip || '192.168.1.100',
      macAddress: parsed.macAddress || '00:00:00:00:00:00',
      nicAdapter: parsed.nicAdapter || 'Contrôleur Réseau Windows',
      domainOrWorkgroup: parsed.domainOrWorkgroup || 'WORKGROUP',
      os: parsed.os || 'Windows 11 / 10',
      subnetMask: '255.255.255.0 (/24)',
      defaultGateway: '192.168.1.1',
      dnsServer: '1.1.1.1, 8.8.8.8',
      dhcpEnabled: true,
      status: 'online',
      lastDetected: new Date().toLocaleTimeString('fr-FR'),
      isVerifiedReal: true,
      scanSource: 'LOCAL_SCRIPT_SCAN',
      detectedUsbDevicesCount: parsed.detectedUsbDevicesCount,
    };

    setLocalMachine(updated);
    return {
      success: true,
      message: `✅ Scan réel validé avec succès ! PC : ${updated.hostname} | MAC : ${updated.macAddress} | IP : ${updated.ip}`,
    };
  };

  const downloadScannerBat = () => {
    downloadText(SCANNER_BAT_CONTENT, 'Scanner-Ce-PC.bat');
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setLocalMachine(DEFAULT_INITIAL_MACHINE);
  };

  return (
    <LocalMachineContext.Provider
      value={{
        localMachine,
        setLocalMachine,
        updateLocalMachine,
        importScanJsonContent,
        importFromClipboard,
        downloadScannerBat,
        copyPowerShellCommand,
        detectBrowserHardwareAndIp,
        resetToDefault,
      }}
    >
      {children}
    </LocalMachineContext.Provider>
  );
};

export const useLocalMachine = () => {
  const context = useContext(LocalMachineContext);
  if (!context) {
    throw new Error('useLocalMachine must be used within a LocalMachineProvider');
  }
  return context;
};
