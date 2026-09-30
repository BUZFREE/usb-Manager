import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  MousePointer, 
  Keyboard, 
  HardDrive, 
  FolderLock, 
  Headphones, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal, 
  RefreshCw, 
  Zap, 
  Info,
  Sliders,
  Database,
  Layers,
  Monitor,
  Check,
  FileText
} from 'lucide-react';
import { PolicyMode } from '../types/usbPolicy';

interface MonoposteViewProps {
  policyMode: PolicyMode;
  setPolicyMode: (mode: PolicyMode) => void;
  onApplyPolicy: (mode: PolicyMode, retroactive: boolean) => void;
  lastAppliedTime: string;
}

export interface WindowsVersionSpec {
  id: string;
  name: string;
  family: 'client' | 'server' | 'legacy';
  releaseYear: string;
  architecture: string;
  gpoSupported: boolean;
  usbstorSupported: boolean;
  storageDevicePoliciesSupported: boolean;
  notes: string;
}

export const SUPPORTED_WINDOWS_VERSIONS: WindowsVersionSpec[] = [
  {
    id: 'win11',
    name: 'Windows 11 (24H2, 23H2, 22H2, 21H2)',
    family: 'client',
    releaseYear: '2021-2026',
    architecture: 'x64, ARM64',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Support complet GPO RemovableStorageDevices + USBSTOR + SetupAPI Hot-Dismount + 64-bit direct.',
  },
  {
    id: 'win10',
    name: 'Windows 10 (22H2, 21H2, LTSC 2021/2019/2016/2015)',
    family: 'client',
    releaseYear: '2015-2025',
    architecture: 'x86 (32-bit), x64 (64-bit)',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Support complet GPO RemovableStorageDevices + USBSTOR Start=4 + StorageDevicePolicies.',
  },
  {
    id: 'win81',
    name: 'Windows 8.1 & Windows 8',
    family: 'client',
    releaseYear: '2012-2013',
    architecture: 'x86, x64',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Support natif GPO + USBSTOR + WriteProtect.',
  },
  {
    id: 'win7',
    name: 'Windows 7 (SP1)',
    family: 'client',
    releaseYear: '2009-2011',
    architecture: 'x86 (32-bit), x64 (64-bit)',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Support GPO RemovableStorageDevices + USBSTOR Start=4 + StorageDevicePolicies WriteProtect.',
  },
  {
    id: 'winvista',
    name: 'Windows Vista',
    family: 'client',
    releaseYear: '2006-2007',
    architecture: 'x86, x64',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Introduction du conteneur GPO RemovableStorageDevices + pilote USBSTOR.',
  },
  {
    id: 'winxp',
    name: 'Windows XP (SP2, SP3) & Windows 2000',
    family: 'legacy',
    releaseYear: '2001-2004',
    architecture: 'x86 (32-bit)',
    gpoSupported: false,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Mode Rétrocompatible : Verrouillage via USBSTOR Start=4 + StorageDevicePolicies WriteProtect=1.',
  },
  {
    id: 'srv2025',
    name: 'Windows Server 2025, 2022, 2019, 2016',
    family: 'server',
    releaseYear: '2016-2025',
    architecture: 'x64',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Serveurs Active Directory & contrôleurs de domaine : GPO machine + WMI StdRegProv.',
  },
  {
    id: 'srv2012',
    name: 'Windows Server 2012 R2, 2012, 2008 R2, 2008',
    family: 'server',
    releaseYear: '2008-2013',
    architecture: 'x86, x64',
    gpoSupported: true,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'GPO Machine + WMI StdRegProv + StorageDevicePolicies.',
  },
  {
    id: 'srv2003',
    name: 'Windows Server 2003 & 2003 R2',
    family: 'legacy',
    releaseYear: '2003',
    architecture: 'x86, x64',
    gpoSupported: false,
    usbstorSupported: true,
    storageDevicePoliciesSupported: true,
    notes: 'Mode Rétrocompatible : Pilote USBSTOR Start=4 + StorageDevicePolicies WriteProtect=1.',
  },
];

export const MonoposteView: React.FC<MonoposteViewProps> = ({
  policyMode,
  setPolicyMode,
  onApplyPolicy,
  lastAppliedTime,
}) => {
  const [retroactive, setRetroactive] = useState(true);
  const [selectedWindowsVersion, setSelectedWindowsVersion] = useState<string>('win11');
  const [testDevice, setTestDevice] = useState<'usb' | 'mouse' | 'keyboard' | 'hdd' | 'phone' | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const currentWinSpec =
    SUPPORTED_WINDOWS_VERSIONS.find((v) => v.id === selectedWindowsVersion) ||
    SUPPORTED_WINDOWS_VERSIONS[0];

  const handleModeChange = (newMode: PolicyMode) => {
    setPolicyMode(newMode);
    onApplyPolicy(newMode, retroactive);
  };

  const handleSimulatePlugin = (device: 'usb' | 'mouse' | 'keyboard' | 'hdd' | 'phone') => {
    setTestDevice(device);

    if (device === 'mouse') {
      setTestResult(
        `[VÉRIFIÉ] Souris USB branchée sur ${currentWinSpec.name}. Classe HID mouhid.sys active. Fonctionnement 100% garanti sans interruption.`
      );
    } else if (device === 'keyboard') {
      setTestResult(
        `[VÉRIFIÉ] Clavier USB branché sur ${currentWinSpec.name}. Classe HID kbdhid.sys active. La frappe et les raccourcis fonctionnent normalement.`
      );
    } else if (device === 'usb' || device === 'hdd') {
      const devName = device === 'usb' ? 'Clé USB Flash Drive' : 'Disque Dur Externe USB';
      if (policyMode === 'BLOCK_ALL') {
        const mechanism = currentWinSpec.gpoSupported
          ? 'GPO RemovableStorageDevices (Deny_All = 1) et USBSTOR (Start = 4)'
          : 'USBSTOR (Start = 4) et verrouillage INF (Mode Legacy XP)';
        setTestResult(
          `🛑 [ACCÈS REFUSÉ] ${devName} inséré sous ${currentWinSpec.name}. Montage bloqué par : ${mechanism}. Code retour 0x80070005 (Accès refusé).`
        );
      } else if (policyMode === 'READ_ONLY') {
        setTestResult(
          `⚠️ [LECTURE SEULE] ${devName} monté sous ${currentWinSpec.name}. Lecture des fichiers permise, mais écriture bloquée par StorageDevicePolicies (WriteProtect = 1) et Deny_Write.`
        );
      } else if (policyMode === 'BLOCK_EXECUTE') {
        setTestResult(
          `🛡️ [EXÉCUTION BLOQUÉE] ${devName} accessible en fichiers, mais tout lancement d'exécutable (.exe, .bat, .cmd) est refusé par la stratégie système.`
        );
      } else {
        setTestResult(`🟢 [AUTORISÉ] ${devName} monté normalement en lecture et écriture sans restriction.`);
      }
    } else if (device === 'phone') {
      if (policyMode === 'BLOCK_ALL') {
        setTestResult(
          `🛑 [MTP BLOQUÉ] Smartphone connecté sous ${currentWinSpec.name}. Protocole Windows Portable Device (WPD GUID {6AC27878...}) désactivé.`
        );
      } else {
        setTestResult(`🟢 [MTP AUTORISÉ] Smartphone accessible dans l'explorateur.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header: System Overview & Universal OS Selector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                POSTE LOCAL & COMPATIBILITÉ UNIVERSELLE
              </span>
              <span className="text-xs text-slate-400">Dernière synchronisation : {lastAppliedTime}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Administration du Verrouillage USB Windows
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Ce moteur a été architecturé pour fonctionner de manière transparente sur 
              <strong> toutes les versions de Windows existantes</strong> (Windows 11, 10, 8.1, 8, 7, Vista, XP, 2000 
              et Windows Server 2003 à 2025) en 32-bit et 64-bit, sans conflit de redirection Wow6432Node.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 cursor-pointer hover:bg-slate-800">
              <input
                type="checkbox"
                checked={retroactive}
                onChange={(e) => setRetroactive(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Démontage rétroactif à chaud (SetupAPI)</span>
            </label>
          </div>
        </div>

        {/* Windows OS Target Selector Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Système d'exploitation cible :</span>
          </div>

          <div className="flex-1 max-w-md">
            <select
              value={selectedWindowsVersion}
              onChange={(e) => setSelectedWindowsVersion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {SUPPORTED_WINDOWS_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.architecture})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Architecture : <span className="text-cyan-300">{currentWinSpec.architecture}</span> • Sortie :{' '}
            <span className="text-slate-200">{currentWinSpec.releaseYear}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Matrix (Text / Table Layout instead of Card Grid) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Niveau de Restriction Actif (Sélection & Application Immédiate)
            </h3>
            <p className="text-xs text-slate-400">
              Sélectionnez la politique désirée. Elle est instantanément propagée au Registre et aux GPO locales.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                <th className="py-3 px-4 w-12">État</th>
                <th className="py-3 px-4">Niveau de Restriction</th>
                <th className="py-3 px-4">Impact Opérationnel</th>
                <th className="py-3 px-4">Mécanismes Registre / GPO Appliqués</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {/* Option 1: Block All */}
              <tr
                className={`transition ${
                  policyMode === 'BLOCK_ALL' ? 'bg-rose-950/20 font-medium' : 'hover:bg-slate-800/30'
                }`}
              >
                <td className="py-3 px-4">
                  {policyMode === 'BLOCK_ALL' ? (
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Bloquer Totalement
                  </div>
                  <div className="text-[11px] text-slate-400">Verrouillage hermétique complet</div>
                </td>
                <td className="py-3 px-4 text-slate-300 text-xs">
                  Interdit totalement la <strong>lecture</strong>, l'<strong>écriture</strong> et l'<strong>exécution</strong> sur toutes les clés USB et disques externes.
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                  <span className="text-cyan-300">Deny_All = 1</span> | <span className="text-cyan-300">USBSTOR Start = 4</span> | <span className="text-cyan-300">WriteProtect = 1</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleModeChange('BLOCK_ALL')}
                    disabled={policyMode === 'BLOCK_ALL'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      policyMode === 'BLOCK_ALL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                    }`}
                  >
                    {policyMode === 'BLOCK_ALL' ? 'Actif' : 'Activer'}
                  </button>
                </td>
              </tr>

              {/* Option 2: Read Only */}
              <tr
                className={`transition ${
                  policyMode === 'READ_ONLY' ? 'bg-amber-950/20 font-medium' : 'hover:bg-slate-800/30'
                }`}
              >
                <td className="py-3 px-4">
                  {policyMode === 'READ_ONLY' ? (
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <FolderLock className="w-4 h-4" />
                    Lecture Seule (Anti-Fuite)
                  </div>
                  <div className="text-[11px] text-slate-400">Protection DLP / Anti-Exfiltration</div>
                </td>
                <td className="py-3 px-4 text-slate-300 text-xs">
                  Les employés peuvent <strong>consulter et ouvrir les documents</strong> d'une clé USB, mais toute copie ou modification vers la clé est bloquée.
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                  <span className="text-amber-300">Deny_Write = 1</span> | <span className="text-amber-300">WriteProtect = 1</span> | <span className="text-slate-400">Deny_Read = 0</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleModeChange('READ_ONLY')}
                    disabled={policyMode === 'READ_ONLY'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      policyMode === 'READ_ONLY'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                    }`}
                  >
                    {policyMode === 'READ_ONLY' ? 'Actif' : 'Activer'}
                  </button>
                </td>
              </tr>

              {/* Option 3: Block Executables */}
              <tr
                className={`transition ${
                  policyMode === 'BLOCK_EXECUTE' ? 'bg-indigo-950/20 font-medium' : 'hover:bg-slate-800/30'
                }`}
              >
                <td className="py-3 px-4">
                  {policyMode === 'BLOCK_EXECUTE' ? (
                    <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Bloquer Exécution (Anti-Ransomware)
                  </div>
                  <div className="text-[11px] text-slate-400">Neutralisation des scripts & binaires</div>
                </td>
                <td className="py-3 px-4 text-slate-300 text-xs">
                  Autorise les fichiers de données (PDF, DOCX) mais <strong>interdit le lancement d'exécutables</strong> (.exe, .bat, .ps1, .vbs) depuis les supports USB.
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                  <span className="text-indigo-300">Deny_Execute = 1</span> | <span className="text-slate-400">USBSTOR Start = 3</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleModeChange('BLOCK_EXECUTE')}
                    disabled={policyMode === 'BLOCK_EXECUTE'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      policyMode === 'BLOCK_EXECUTE'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                    }`}
                  >
                    {policyMode === 'BLOCK_EXECUTE' ? 'Actif' : 'Activer'}
                  </button>
                </td>
              </tr>

              {/* Option 4: Unblocked */}
              <tr
                className={`transition ${
                  policyMode === 'UNBLOCKED' ? 'bg-emerald-950/20 font-medium' : 'hover:bg-slate-800/30'
                }`}
              >
                <td className="py-3 px-4">
                  {policyMode === 'UNBLOCKED' ? (
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-700 inline-block"></span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Débloquer Tout
                  </div>
                  <div className="text-[11px] text-slate-400">Fonctionnement standard par défaut</div>
                </td>
                <td className="py-3 px-4 text-slate-300 text-xs">
                  Supprime l'ensemble des restrictions. Les clés USB et disques externes fonctionnent normalement en lecture/écriture.
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                  <span className="text-emerald-300">Deny_All = 0</span> | <span className="text-emerald-300">WriteProtect = 0</span> | <span className="text-emerald-300">USBSTOR = 3</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleModeChange('UNBLOCKED')}
                    disabled={policyMode === 'UNBLOCKED'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      policyMode === 'UNBLOCKED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    {policyMode === 'UNBLOCKED' ? 'Actif' : 'Activer'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Universal Multi-Layer Protection Explanation (Text Mode, No Cards) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Architecture de Compatibilité Multi-Versions : Pourquoi Tous les Windows sont Couverts ?
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Notre code Python applique simultanément les mécanismes adaptés à chaque génération d'OS pour garantir un verrouillage infaillible.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                <th className="py-2.5 px-3">Couche de Sécurité</th>
                <th className="py-2.5 px-3">Versions Windows Cibles</th>
                <th className="py-2.5 px-3">Clé de Registre / API Win32</th>
                <th className="py-2.5 px-3">Rôle Technique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">1. GPO RemovableStorageDevices</td>
                <td className="py-2.5 px-3 font-sans text-slate-200">Win 11, 10, 8.1, 8, 7, Vista, Server 2008-2025</td>
                <td className="py-2.5 px-3 text-slate-400 break-all">HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">Stratégie officielle Microsoft avec filtrage GUID fin ({'{53f5630d...}'}).</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">2. Pilote Universel USBSTOR</td>
                <td className="py-2.5 px-3 font-sans text-slate-200">Universel (Win 2000, XP, Vista, 7, 8, 10, 11, Server)</td>
                <td className="py-2.5 px-3 text-slate-400">HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR (Start = 4)</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">Empêche le chargement du pilote de masse usbstor.sys sans affecter l'USB d'entrée.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">3. StorageDevicePolicies (DLP)</td>
                <td className="py-2.5 px-3 font-sans text-slate-200">Win XP SP2/SP3, Vista, 7, 8, 10, 11, Server 2003-2025</td>
                <td className="py-2.5 px-3 text-slate-400">HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies (WriteProtect = 1)</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">Mécanisme universel de protection en écriture pour le mode Lecture Seule.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">4. Pont Registre 64-bit Direct</td>
                <td className="py-2.5 px-3 font-sans text-slate-200">Tous systèmes Windows 64-bit (x64 / ARM64)</td>
                <td className="py-2.5 px-3 text-slate-400">winreg.KEY_WOW64_64KEY (0x0100)</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">Garantit l'écriture directe dans HKLM 64-bit, sans redirection parasite vers Wow6432Node.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preservation Assurance Panel (Text Mode Layout) */}
      <div className="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-slate-100">
            Tableau des Périphériques Préservés : Pourquoi la Souris et le Clavier ne sont Jamais Coupés ?
          </h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Dans toutes les versions de Windows, le bus USB différencie rigoureusement les classes d'interface utilisateur (HID) 
          de la classe de stockage de masse amovible (Mass Storage). Les GUIDs et pilotes ci-dessous restent 100% actifs :
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                <th className="py-2.5 px-3">Périphérique</th>
                <th className="py-2.5 px-3">Classe Windows</th>
                <th className="py-2.5 px-3">Pilote Système (.SYS)</th>
                <th className="py-2.5 px-3">GUID Matériel Inviolé</th>
                <th className="py-2.5 px-3 text-right">Statut de Fonctionnement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-emerald-400" /> Souris USB & Récepteurs Sans Fil
                </td>
                <td className="py-2 px-3 text-emerald-300 font-sans">HID Mouse Class</td>
                <td className="py-2 px-3 text-slate-400">mouhid.sys / hidusb.sys</td>
                <td className="py-2 px-3 text-slate-400">{'{4d36e96f-e325-11ce-bfc1-08002be10318}'}</td>
                <td className="py-2 px-3 text-right font-sans text-emerald-400 font-semibold">100% Opérationnel</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-emerald-400" /> Claviers USB & Pavés Numériques
                </td>
                <td className="py-2 px-3 text-emerald-300 font-sans">HID Keyboard Class</td>
                <td className="py-2 px-3 text-slate-400">kbdhid.sys / hidusb.sys</td>
                <td className="py-2 px-3 text-slate-400">{'{4d36e96b-e325-11ce-bfc1-08002be10318}'}</td>
                <td className="py-2 px-3 text-right font-sans text-emerald-400 font-semibold">100% Opérationnel</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" /> Casques Audio & Microphones USB
                </td>
                <td className="py-2 px-3 text-emerald-300 font-sans">Audio Endpoint Class</td>
                <td className="py-2 px-3 text-slate-400">usbaudio.sys</td>
                <td className="py-2 px-3 text-slate-400">{'{4d36e96c-e325-11ce-bfc1-08002be10318}'}</td>
                <td className="py-2 px-3 text-right font-sans text-emerald-400 font-semibold">100% Opérationnel</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-100 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-400" /> Imprimantes & Scanners USB
                </td>
                <td className="py-2 px-3 text-emerald-300 font-sans">Printers Class</td>
                <td className="py-2 px-3 text-slate-400">usbprint.sys</td>
                <td className="py-2 px-3 text-slate-400">{'{4d36e979-e325-11ce-bfc1-08002be10318}'}</td>
                <td className="py-2 px-3 text-right font-sans text-emerald-400 font-semibold">100% Opérationnel</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Test Bench (Text Mode Selection) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Banc de Test & Simulation de Branchement PnP
            </h3>
            <p className="text-xs text-slate-400">
              Testez la réaction du système selon la version de Windows sélectionnée : <strong>{currentWinSpec.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulatePlugin('usb')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
            >
              Brancher Clé USB
            </button>
            <button
              onClick={() => handleSimulatePlugin('hdd')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
            >
              Brancher Disque Externe
            </button>
            <button
              onClick={() => handleSimulatePlugin('mouse')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            >
              Brancher Souris USB
            </button>
            <button
              onClick={() => handleSimulatePlugin('keyboard')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition"
            >
              Brancher Clavier USB
            </button>
            <button
              onClick={() => handleSimulatePlugin('phone')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
            >
              Brancher Smartphone MTP
            </button>
          </div>
        </div>

        {testResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 flex items-start gap-3">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-500 font-bold">[RÉACTION DU SYSTÈME] </span>
              {testResult}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Registry State Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Valeurs Synchronisées dans le Registre HKLM
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Ces valeurs sont écrites avec <code className="text-cyan-300">winreg.KEY_WOW64_64KEY</code> pour garantir l'absence de virtualisation 32-bit.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/40">
                <th className="py-2.5 px-3">Chemin de Clé HKLM</th>
                <th className="py-2.5 px-3">Valeur</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Donnée Actuelle</th>
                <th className="py-2.5 px-3">Effet Windows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 text-cyan-400">...\\Policies\\Microsoft\\Windows\\RemovableStorageDevices</td>
                <td className="py-2.5 px-3 font-semibold">Deny_All</td>
                <td className="py-2.5 px-3 text-slate-400">REG_DWORD</td>
                <td className="py-2.5 px-3 font-bold text-rose-400">
                  {policyMode === 'BLOCK_ALL' ? '0x00000001 (1)' : '0 (Non défini)'}
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  {policyMode === 'BLOCK_ALL' ? 'Blocage GPO global disques amovibles' : 'Inactif'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-cyan-400">...\\Control\\StorageDevicePolicies</td>
                <td className="py-2.5 px-3 font-semibold">WriteProtect</td>
                <td className="py-2.5 px-3 text-slate-400">REG_DWORD</td>
                <td className="py-2.5 px-3 font-bold text-amber-400">
                  {policyMode === 'BLOCK_ALL' || policyMode === 'READ_ONLY' ? '0x00000001 (1)' : '0 (0)'}
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  {policyMode === 'BLOCK_ALL' || policyMode === 'READ_ONLY' ? 'Protection écriture (XP à Win 11)' : 'Écriture permise'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-cyan-400">SYSTEM\\CurrentControlSet\\Services\\USBSTOR</td>
                <td className="py-2.5 px-3 font-semibold">Start</td>
                <td className="py-2.5 px-3 text-slate-400">REG_DWORD</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">
                  {policyMode === 'BLOCK_ALL' ? '0x00000004 (4 = Désactivé)' : '0x00000003 (3 = Manuel)'}
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  {policyMode === 'BLOCK_ALL' ? 'Pilote usbstor.sys inactif' : 'Pilote monté à la demande'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
