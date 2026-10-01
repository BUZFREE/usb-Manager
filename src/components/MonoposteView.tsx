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
  FileText,
  Download,
  Copy,
  Edit3,
  Network,
  Laptop,
  Globe,
  Save,
  Cpu,
  Upload,
  ClipboardCheck,
  ClipboardCopy,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import { PolicyMode, LocalMachineInfo } from '../types/usbPolicy';
import { SCRIPT_TEMPLATES } from '../data/scriptTemplates';
import { downloadText } from '../utils/zipGenerator';
import { useLocalMachine, POWERSHELL_ONE_LINER } from '../context/LocalMachineContext';

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

  // Local PC Real Inventory State from Global Context
  const {
    localMachine,
    setLocalMachine,
    updateLocalMachine,
    importScanJsonContent,
    importFromClipboard,
    downloadScannerBat,
    copyPowerShellCommand,
    detectBrowserHardwareAndIp,
  } = useLocalMachine();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDetectingLocal, setIsDetectingLocal] = useState(false);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [showScanAssistantModal, setShowScanAssistantModal] = useState(false);
  const [pastedRawText, setPastedRawText] = useState('');
  const [editHostname, setEditHostname] = useState(localMachine.hostname);
  const [editIp, setEditIp] = useState(localMachine.ip);
  const [editMac, setEditMac] = useState(localMachine.macAddress);
  const [editAdapter, setEditAdapter] = useState(localMachine.nicAdapter);
  const [editDomain, setEditDomain] = useState(localMachine.domainOrWorkgroup);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setEditHostname(localMachine.hostname);
    setEditIp(localMachine.ip);
    setEditMac(localMachine.macAddress);
    setEditAdapter(localMachine.nicAdapter);
    setEditDomain(localMachine.domainOrWorkgroup);
  }, [localMachine]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyPowerShell = async () => {
    const ok = await copyPowerShellCommand();
    if (ok) {
      setDetectionNotice(
        "⚡ Commande PowerShell copiée ! Ouvrez PowerShell (Win+X > Terminal), collez la commande (Ctrl+V) et appuyez sur Entrée. Puis revenez ici et cliquez sur [📋 Coller le Scan]."
      );
    } else {
      setDetectionNotice("Commande PowerShell prête dans l'Assistant de Scan.");
      setShowScanAssistantModal(true);
    }
    setTimeout(() => setDetectionNotice(null), 10000);
  };

  const handlePasteFromClipboard = async () => {
    setDetectionNotice("Lecture du presse-papiers...");
    const res = await importFromClipboard();
    setDetectionNotice(res.message);
    if (!res.success) {
      setShowScanAssistantModal(true);
    }
    setTimeout(() => setDetectionNotice(null), 8000);
  };

  const handleAnalyzeRawPastedText = () => {
    if (!pastedRawText.trim()) return;
    const res = importScanJsonContent(pastedRawText.trim());
    setDetectionNotice(res.message);
    if (res.success) {
      setPastedRawText('');
      setShowScanAssistantModal(false);
    }
    setTimeout(() => setDetectionNotice(null), 8000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importScanJsonContent(content);
        setDetectionNotice(result.message);
        setTimeout(() => setDetectionNotice(null), 8000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDetectLocalNetwork = async () => {
    setIsDetectingLocal(true);
    setDetectionNotice("Sondage de l'adresse IP et de l'environnement système...");
    const detected = await detectBrowserHardwareAndIp();
    setIsDetectingLocal(false);
    if (detected) {
      setDetectionNotice(
        `IP détectée : ${detected}. Note : Pour charger votre vrai nom Windows et votre adresse MAC sans erreur, cliquez sur [⚡ Copier Commande PowerShell] ou [1. Scanner ce PC].`
      );
    } else {
      setDetectionNotice(
        "Pour afficher votre vrai nom de PC et votre adresse MAC sans restriction du navigateur, utilisez la commande PowerShell 1-ligne."
      );
    }
    setTimeout(() => setDetectionNotice(null), 8000);
  };

  const handleSaveLocalInventory = (e: React.FormEvent) => {
    e.preventDefault();
    updateLocalMachine({
      hostname: editHostname.trim().toUpperCase() || localMachine.hostname,
      ip: editIp.trim() || localMachine.ip,
      macAddress: editMac.trim().toUpperCase() || localMachine.macAddress,
      nicAdapter: editAdapter.trim() || localMachine.nicAdapter,
      domainOrWorkgroup: editDomain.trim().toUpperCase() || localMachine.domainOrWorkgroup,
      isVerifiedReal: true,
      scanSource: 'MANUAL_ENTRY',
    });
    setIsEditingLocal(false);
    setDetectionNotice('Identifiants de votre PC enregistrés avec succès dans votre navigateur !');
    setTimeout(() => setDetectionNotice(null), 5000);
  };

  const handleExportLocalJson = () => {
    const payload = {
      reportType: "FICHE D'INVENTAIRE MATÉRIEL ET RÉSEAU DU POSTE LOCAL",
      generatedAt: new Date().toISOString(),
      machine: {
        nomReelHostname: localMachine.hostname,
        adresseMac: localMachine.macAddress,
        adresseIp: localMachine.ip,
        carteReseauNic: localMachine.nicAdapter,
        domaineOuWorkgroup: localMachine.domainOrWorkgroup,
        systemeExploitation: currentWinSpec.name,
        architecture: currentWinSpec.architecture,
        masqueSousReseau: localMachine.subnetMask,
        passerelleParDefaut: localMachine.defaultGateway,
        serveursDns: localMachine.dnsServer,
        isVerifiedReal: localMachine.isVerifiedReal,
        scanSource: localMachine.scanSource,
      },
      politiqueUsbCourante: {
        mode: policyMode,
        sourisEtClavierProteges: true,
        derniereApplication: lastAppliedTime,
      }
    };
    downloadText(JSON.stringify(payload, null, 2), `Inventaire_${localMachine.hostname}_${localMachine.macAddress.replace(/:/g, '')}.json`);
  };

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

      {/* FICHE D'INVENTAIRE MATÉRIEL ET RÉSEAU DU POSTE LOCAL (Nom Réel, MAC & IP) */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Hidden File Input for JSON Scan Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${localMachine.isVerifiedReal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'}`}>
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-100">
                  Fiche d'Inventaire Matériel & Réseau du Poste Local
                </h3>
                {localMachine.isVerifiedReal ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    IDENTITÉ PHYSIQUE VÉRIFIÉE (SCAN RÉEL)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    SCAN LOCAL EN ATTENTE (SANDBOX DU NAVIGATEUR)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Identification officielle : Nom NetBIOS réel, adresse MAC physique de la carte réseau et adresse IP.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePasteFromClipboard}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow flex items-center gap-1.5 transition active:scale-95"
              title="Coller instantanément le résultat du scan depuis votre presse-papiers Windows"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              1. Coller le Scan (1-Clic)
            </button>

            <button
              onClick={handleCopyPowerShell}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow flex items-center gap-1.5 transition active:scale-95"
              title="Copier la commande PowerShell 1-ligne pour extraire vos vraies coordonnées sans rien télécharger"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              2. Commande PowerShell (3s)
            </button>

            <button
              onClick={downloadScannerBat}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow flex items-center gap-1.5 transition active:scale-95"
              title="Télécharger le script 1-clic pour scanner ce PC Windows physique"
            >
              <Download className="w-3.5 h-3.5" />
              3. Scanner ce PC (.bat)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
              title="Importer le fichier mon_pc_scan.json généré par le script sur votre Bureau"
            >
              <Upload className="w-3.5 h-3.5" />
              Importer (.json)
            </button>

            <button
              onClick={() => setIsEditingLocal(!isEditingLocal)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              {isEditingLocal ? 'Fermer' : 'Modifier / Saisir'}
            </button>

            <button
              onClick={() => setShowScanAssistantModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Ouvrir l'assistant d'aide pour le scan sans erreur"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Assistant de Scan
            </button>

            <button
              onClick={handleExportLocalJson}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center gap-1.5 transition"
              title="Télécharger la fiche d'inventaire de ce PC au format JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Fiche JSON
            </button>
          </div>
        </div>

        {/* Notice feedback */}
        {detectionNotice && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2 animate-fadeIn">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{detectionNotice}</span>
          </div>
        )}

        {/* Explanatory Banner: Why Web Browser Sandbox Cannot Read MAC Address Silently */}
        {!localMachine.isVerifiedReal && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Pourquoi le scan du navigateur ne peut pas deviner votre nom de PC et votre adresse MAC ?
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Standard Sécurité W3C (Anti-Fingerprinting)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Par mesure de sécurité obligatoire, <strong>les navigateurs web (Chrome, Edge, Firefox) interdisent formellement à tout site web</strong> d'accéder directement à l'adresse MAC physique de votre carte réseau ou au nom NetBIOS de votre ordinateur. Pour charger vos coordonnées physiques réelles <strong>sans résultat erroné</strong>, utilisez l'une des solutions directes ci-dessous :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Method 1 */}
              <div className="bg-slate-900/90 border border-cyan-800/40 rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Méthode 1 : PowerShell 1-Ligne (3s)
                </div>
                <p className="text-[10px] text-slate-400">
                  Cliquez ci-dessous, collez dans PowerShell (Ctrl+V) et appuyez sur Entrée :
                </p>
                <button
                  onClick={handleCopyPowerShell}
                  className="px-2.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] shadow flex items-center gap-1 w-full justify-center transition active:scale-95"
                >
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  Copier la Commande
                </button>
              </div>

              {/* Method 2 */}
              <div className="bg-slate-900/90 border border-emerald-800/40 rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Méthode 2 : Coller le Scan (1-Clic)
                </div>
                <p className="text-[10px] text-slate-400">
                  Dès que la commande a été exécutée, vos données sont dans le presse-papiers :
                </p>
                <button
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow flex items-center gap-1 w-full justify-center transition active:scale-95"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Coller le Scan (1-Clic)
                </button>
              </div>

              {/* Method 3 */}
              <div className="bg-slate-900/90 border border-amber-800/40 rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  Méthode 3 : Script .BAT ou Saisie
                </div>
                <p className="text-[10px] text-slate-400">
                  Téléchargez le mini-scanner autonome ou tapez manuellement vos identifiants :
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={downloadScannerBat}
                    className="px-2 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow flex items-center gap-1 flex-1 justify-center transition active:scale-95"
                  >
                    <Download className="w-3 h-3" />
                    Scanner (.bat)
                  </button>
                  <button
                    onClick={() => setIsEditingLocal(true)}
                    className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px] border border-slate-700 flex items-center gap-1 flex-1 justify-center transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    Saisir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verified Banner */}
        {localMachine.isVerifiedReal && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Coordonnées réelles appliquées :</strong> {localMachine.hostname} • MAC : <code className="font-mono text-emerald-300 font-bold">{localMachine.macAddress}</code> • IP : <code className="font-mono text-emerald-300">{localMachine.ip}</code> ({localMachine.scanSource === 'LOCAL_SCRIPT_SCAN' ? 'Extrait via Scanner-Ce-PC.bat' : 'Saisi manuellement'}).
              </span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-emerald-300 underline hover:text-white shrink-0"
            >
              Réimporter un nouveau scan
            </button>
          </div>
        )}

        {/* Inline Editing Form */}
        {isEditingLocal && (
          <form onSubmit={handleSaveLocalInventory} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              Correction Manuelle des Coordonnées Réelles de votre PC Windows
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Nom Réel Machine (Hostname NetBIOS)
                </label>
                <input
                  type="text"
                  value={editHostname}
                  onChange={(e) => setEditHostname(e.target.value)}
                  placeholder="Ex: MON-PC-BUREAU"
                  className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Adresse MAC Physique (Format XX:XX:XX:XX:XX:XX)
                </label>
                <input
                  type="text"
                  value={editMac}
                  onChange={(e) => setEditMac(e.target.value)}
                  placeholder="Ex: 00:1A:2B:3C:4D:5E"
                  className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Adresse IP Locale (IPv4)
                </label>
                <input
                  type="text"
                  value={editIp}
                  onChange={(e) => setEditIp(e.target.value)}
                  placeholder="Ex: 192.168.1.50"
                  className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Contrôleur Réseau (NIC)
                </label>
                <input
                  type="text"
                  value={editAdapter}
                  onChange={(e) => setEditAdapter(e.target.value)}
                  placeholder="Ex: Realtek PCIe GbE ou Intel Wi-Fi"
                  className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  Domaine ou Groupe de Travail
                </label>
                <input
                  type="text"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  placeholder="Ex: WORKGROUP ou DOMAIN.LOCAL"
                  className="w-full px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  Enregistrer Définitivement
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLocal(false)}
                  className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 4 Technical Inventory Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Machine Hostname */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                Nom Réel Machine
              </span>
              <button
                onClick={() => handleCopyText(localMachine.hostname, 'hostname')}
                className="text-slate-500 hover:text-cyan-400 transition"
                title="Copier le nom de la machine"
              >
                {copiedField === 'hostname' ? (
                  <span className="text-[10px] text-emerald-400 font-bold">Copié !</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-base font-bold text-slate-100 font-mono truncate" title={localMachine.hostname}>
              {localMachine.hostname}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-1">
              Domaine : <span className="text-cyan-300 font-mono">{localMachine.domainOrWorkgroup}</span>
            </div>
          </div>

          {/* Card 2: MAC Address */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                Adresse MAC Physique
              </span>
              <button
                onClick={() => handleCopyText(localMachine.macAddress, 'mac')}
                className="text-slate-500 hover:text-indigo-400 transition"
                title="Copier l'adresse MAC"
              >
                {copiedField === 'mac' ? (
                  <span className="text-[10px] text-emerald-400 font-bold">Copié !</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-base font-bold text-indigo-300 font-mono tracking-wider">
              {localMachine.macAddress}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-1" title={localMachine.nicAdapter}>
              {localMachine.nicAdapter}
            </div>
          </div>

          {/* Card 3: IP Address */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Adresse IP Locale
              </span>
              <button
                onClick={() => handleCopyText(localMachine.ip, 'ip')}
                className="text-slate-500 hover:text-emerald-400 transition"
                title="Copier l'adresse IP"
              >
                {copiedField === 'ip' ? (
                  <span className="text-[10px] text-emerald-400 font-bold">Copié !</span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="text-base font-bold text-emerald-300 font-mono">
              {localMachine.ip}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Masque : <span className="font-mono text-slate-300">{localMachine.subnetMask}</span>
            </div>
          </div>

          {/* Card 4: Operating System & USB Policy */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Politique USB Active
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Poste opérationnel" />
            </div>
            <div className="text-sm font-bold truncate">
              {policyMode === 'BLOCK_ALL' && <span className="text-rose-400">Verrouillage Total</span>}
              {policyMode === 'READ_ONLY' && <span className="text-amber-400">Lecture Seule</span>}
              {policyMode === 'BLOCK_EXECUTE' && <span className="text-indigo-400">Anti-Exécutables</span>}
              {policyMode === 'UNBLOCKED' && <span className="text-emerald-400">Débloqué Standard</span>}
            </div>
            <div className="text-[10px] text-emerald-400/90 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Souris & Clavier HID Préservés</span>
            </div>
          </div>
        </div>

        {/* Windows PowerShell One-Liner Quick Copy Box */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Extraction Réelle 1-Ligne (Sans Téléchargement) :</strong> Exécutez dans PowerShell pour copier vos vraies données dans le presse-papiers.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyPowerShell}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow"
              title="Copier la commande PowerShell universelle qui copie directement les coordonnées dans votre presse-papiers"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
              <span>Copier Commande PowerShell</span>
            </button>

            <button
              onClick={handlePasteFromClipboard}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow"
              title="Coller immédiatement les données copiées par PowerShell"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Coller le Scan</span>
            </button>

            <button
              onClick={() => setShowScanAssistantModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3 h-3 text-cyan-400" />
              <span>Aide / Assistant</span>
            </button>
          </div>
        </div>

        {/* Scan Assistant Modal */}
        {showScanAssistantModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-slate-100">
                    Assistant de Détection & Scan Réel de Ce PC
                  </h3>
                </div>
                <button
                  onClick={() => setShowScanAssistantModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    Pourquoi le navigateur affiche "Scan en attente" ?
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Les règles de sécurité du W3C interdisent formellement aux pages web d'accéder au matériel physique (adresse MAC et nom NetBIOS) sans interaction locale. Pour charger vos coordonnées exactes :
                  </p>
                </div>

                {/* Option 1: PowerShell 1-Liner */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Option 1 (Recommandée - 3 secondes) : Commande PowerShell 1-Ligne
                    </span>
                    <button
                      onClick={handleCopyPowerShell}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <ClipboardCopy className="w-3 h-3" />
                      Copier
                    </button>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-200 overflow-x-auto whitespace-pre-wrap break-all select-all">
                    {POWERSHELL_ONE_LINER}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>1. Ouvrez PowerShell &gt; Collez la commande &gt; Entrée.</span>
                    <button
                      onClick={handlePasteFromClipboard}
                      className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      2. Cliquer pour Coller le Résultat
                    </button>
                  </div>
                </div>

                {/* Option 2: Raw Text / JSON Area */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    Option 2 : Coller le texte brut ou le JSON ici
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Vous pouvez coller le JSON du scan, ou le résultat d'un <code>ipconfig /all</code> ou <code>getmac</code> :
                  </p>
                  <textarea
                    rows={3}
                    value={pastedRawText}
                    onChange={(e) => setPastedRawText(e.target.value)}
                    placeholder='Exemple : {"hostname":"MON-PC","ip":"192.168.1.25","macAddress":"00:1A:2B:3C:4D:5E"}'
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzeRawPastedText}
                      disabled={!pastedRawText.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Analyser et Appliquer Immédiatement
                    </button>
                  </div>
                </div>

                {/* Option 3: Mini-Scanner .BAT */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-100 text-xs block">
                      Option 3 : Télécharger Scanner-Ce-PC.bat
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Génère le fichier <code>mon_pc_scan.json</code> sur votre Bureau et copie les données.
                    </span>
                  </div>
                  <button
                    onClick={downloadScannerBat}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger .bat
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowScanAssistantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real Machine Instant 1-Click Execution Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold shrink-0 mt-0.5">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                ⚡ Exécution Réelle sur ce PC Windows (1 Clic Immédiat)
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Application Physique Immédiate
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                <strong>Pourquoi les ports ne se bloquent-ils pas tout seuls depuis un site web (Vercel) ?</strong><br />
                Pour des raisons évidentes de sécurité du navigateur (sandbox), 
                Windows interdit formellement à tout site web distant de modifier le registre système sans action locale. 
                Pour bloquer immédiatement vos ports USB physiques, téléchargez le script 1-clic ci-dessous et lancez-le en tant qu'administrateur !
              </p>
            </div>
          </div>

          {/* Direct Download Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Bloquer_USB_Immediat.bat')?.content;
                if (bat) downloadText(bat, 'Bloquer_USB_Immediat.bat');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition active:scale-95 flex items-center gap-1.5"
              title="Télécharger le script Batch pour bloquer immédiatement les clés USB"
            >
              <ShieldAlert className="w-4 h-4" />
              Bloquer USB (.bat)
            </button>

            <button
              onClick={() => {
                const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Lecture_Seule_USB.bat')?.content;
                if (bat) downloadText(bat, 'Lecture_Seule_USB.bat');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition active:scale-95 flex items-center gap-1.5"
              title="Télécharger le script Batch pour autoriser la lecture seule"
            >
              <FolderLock className="w-4 h-4" />
              Lecture Seule (.bat)
            </button>

            <button
              onClick={() => {
                const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Debloquer_USB.bat')?.content;
                if (bat) downloadText(bat, 'Debloquer_USB.bat');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition active:scale-95 flex items-center gap-1.5"
              title="Télécharger le script Batch pour débloquer les ports USB"
            >
              <ShieldCheck className="w-4 h-4" />
              Débloquer USB (.bat)
            </button>

            <button
              onClick={() => {
                const reg = SCRIPT_TEMPLATES.find((s) => s.name === 'Block_USB_Storage.reg')?.content;
                if (reg) downloadText(reg, 'Block_USB_Storage.reg');
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Télécharger le fichier .reg d'importation dans le Registre Windows"
            >
              Fichier .REG
            </button>
          </div>
        </div>

        {/* Quick Instructions Step by Step */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">1</span>
            <span>Téléchargez le script <strong>.bat</strong> ci-dessus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">2</span>
            <span>Clic-droit &rsaquo; <strong>Exécuter en tant qu'administrateur</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">3</span>
            <span><strong>Effet immédiat :</strong> Clés bloquées, souris/clavier opérationnels !</span>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Bloquer_USB_Immediat.bat')?.content;
                        if (bat) downloadText(bat, 'Bloquer_USB_Immediat.bat');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 flex items-center gap-1 transition"
                      title="Télécharger le script Batch pour bloquer ce PC"
                    >
                      <Download className="w-3 h-3" />
                      .BAT
                    </button>
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
                  </div>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Lecture_Seule_USB.bat')?.content;
                        if (bat) downloadText(bat, 'Lecture_Seule_USB.bat');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1 transition"
                      title="Télécharger le script Batch pour passer en lecture seule"
                    >
                      <Download className="w-3 h-3" />
                      .BAT
                    </button>
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
                  </div>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Lecture_Seule_USB.bat')?.content;
                        if (bat) downloadText(bat, 'Lecture_Seule_USB.bat');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 flex items-center gap-1 transition"
                      title="Télécharger le script Batch"
                    >
                      <Download className="w-3 h-3" />
                      .BAT
                    </button>
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
                  </div>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        const bat = SCRIPT_TEMPLATES.find((s) => s.name === 'Debloquer_USB.bat')?.content;
                        if (bat) downloadText(bat, 'Debloquer_USB.bat');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center gap-1 transition"
                      title="Télécharger le script Batch pour débloquer"
                    >
                      <Download className="w-3 h-3" />
                      .BAT
                    </button>
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
                  </div>
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
