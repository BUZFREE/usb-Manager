import React, { useState } from 'react';
import { 
  Globe, 
  Server, 
  Laptop, 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Wifi, 
  WifiOff, 
  Terminal,
  Layers,
  FileSpreadsheet,
  Copy,
  Download,
  Network,
  Check,
  ClipboardCheck,
  ClipboardCopy,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { NetworkComputer, PolicyMode, DeploymentLog } from '../types/usbPolicy';
import { exportFleetInventoryCsv, exportFleetInventoryJson } from '../utils/pdfExport';
import { useLocalMachine, POWERSHELL_ONE_LINER } from '../context/LocalMachineContext';

interface ReseauViewProps {
  computers: NetworkComputer[];
  setComputers: React.Dispatch<React.SetStateAction<NetworkComputer[]>>;
  deploymentLogs: DeploymentLog[];
  setDeploymentLogs: React.Dispatch<React.SetStateAction<DeploymentLog[]>>;
}

export const ReseauView: React.FC<ReseauViewProps> = ({
  computers,
  setComputers,
  deploymentLogs,
  setDeploymentLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'WMI' | 'WINRM' | 'GPO'>('WMI');
  const [isDeploying, setIsDeploying] = useState(false);
  const [newHostname, setNewHostname] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newMac, setNewMac] = useState('');
  const [newNic, setNewNic] = useState('Intel(R) Ethernet Connection I219-LM');
  const [newDomain, setNewDomain] = useState('CORP.LOCAL');
  const [copiedMac, setCopiedMac] = useState<string | null>(null);
  const [reseauNotice, setReseauNotice] = useState<string | null>(null);

  const {
    localMachine,
    importFromClipboard,
    copyPowerShellCommand,
    downloadScannerBat,
  } = useLocalMachine();

  const handleReseauCopyPowerShell = async () => {
    const ok = await copyPowerShellCommand();
    if (ok) {
      setReseauNotice("⚡ Commande PowerShell copiée ! Ouvrez PowerShell (Win+X > Terminal), collez (Ctrl+V) et appuyez sur Entrée. Puis cliquez sur [📋 Coller Scan].");
    }
    setTimeout(() => setReseauNotice(null), 8000);
  };

  const handleReseauPasteClipboard = async () => {
    setReseauNotice("Lecture du presse-papiers...");
    const res = await importFromClipboard();
    setReseauNotice(res.message);
    setTimeout(() => setReseauNotice(null), 8000);
  };

  const generateRandomMac = () => {
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    return `00:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
  };

  const handleCopyMac = (mac: string) => {
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    setTimeout(() => setCopiedMac(null), 2500);
  };

  const allComputersForExport = [
    {
      id: 'local-host-pc',
      hostname: `${localMachine.hostname} [Ce PC Local]`,
      ip: localMachine.ip,
      macAddress: localMachine.macAddress,
      nicAdapter: localMachine.nicAdapter,
      domain: localMachine.domainOrWorkgroup,
      os: localMachine.os,
      currentPolicy: 'AUDIT_LOCAL',
      status: 'online',
      lastSync: localMachine.lastDetected,
    },
    ...computers,
  ];

  const handleExportCsv = () => {
    exportFleetInventoryCsv(allComputersForExport, {
      organization: 'ENTREPRISE & ASSOCIÉS (DSI / RSSI)',
      dateGenerated: new Date().toLocaleDateString('fr-FR'),
      auditor: 'Équipe Sécurité Opérationnelle (SecOps)',
    });
  };

  const handleExportJson = () => {
    exportFleetInventoryJson(allComputersForExport, {
      organization: 'ENTREPRISE & ASSOCIÉS (DSI / RSSI)',
      dateGenerated: new Date().toLocaleDateString('fr-FR'),
      auditor: 'Équipe Sécurité Opérationnelle (SecOps)',
    });
  };

  const filteredComputers = computers.filter(
    (c) =>
      c.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ip.includes(searchTerm) ||
      c.macAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = computers.filter((c) => c.selected).length;

  const toggleSelectAll = (checked: boolean) => {
    setComputers((prev) => prev.map((c) => ({ ...c, selected: checked })));
  };

  const toggleSelect = (id: string) => {
    setComputers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleAddComputer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostname.trim()) return;

    const finalMac = newMac.trim().toUpperCase() || generateRandomMac();

    const newComp: NetworkComputer = {
      id: `comp-${Date.now()}`,
      hostname: newHostname.toUpperCase().trim(),
      ip: newIp.trim() || '192.168.1.150',
      macAddress: finalMac,
      nicAdapter: newNic.trim() || 'Intel(R) Ethernet Connection I219-LM',
      domain: newDomain.trim(),
      os: 'Windows 11 Enterprise (23H2)',
      currentPolicy: 'UNBLOCKED',
      status: 'online',
      lastSync: new Date().toLocaleTimeString('fr-FR'),
      selected: true,
    };

    setComputers((prev) => [newComp, ...prev]);
    setNewHostname('');
    setNewIp('');
    setNewMac('');
  };

  const handleDeleteSelected = () => {
    setComputers((prev) => prev.filter((c) => !c.selected));
  };

  const handleBatchDeploy = async (targetMode: PolicyMode) => {
    const targets = computers.filter((c) => c.selected);
    if (targets.length === 0) return;

    setIsDeploying(true);

    for (const comp of targets) {
      // simulate latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      const isSuccess = comp.status !== 'offline';
      const actionName =
        targetMode === 'BLOCK_ALL'
          ? 'Blocage USB Total (GPO & USBSTOR)'
          : targetMode === 'READ_ONLY'
          ? 'Lecture Seule USB (Deny_Write)'
          : 'Déblocage USB';

      const newLog: DeploymentLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        target: `${comp.hostname} (${comp.ip})`,
        action: `${actionName} via ${selectedMethod}`,
        result: isSuccess ? 'success' : 'error',
        details: isSuccess
          ? `WMI StdRegProv: HKLM\\...\\RemovableStorageDevices mis à jour avec succès. Code retour 0.`
          : `Échec de connexion RPC/WinRM : Hôte injoignable ou pare-feu bloquant le port 135/5985.`,
      };

      setDeploymentLogs((prev) => [newLog, ...prev]);

      setComputers((prev) =>
        prev.map((c) =>
          c.id === comp.id
            ? {
                ...c,
                currentPolicy: isSuccess ? targetMode : c.currentPolicy,
                lastSync: new Date().toLocaleTimeString('fr-FR'),
              }
            : c
        )
      );
    }

    setIsDeploying(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Network Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                GESTION RÉSEAU & DOMAINE ACTIVE DIRECTORY
              </span>
              <span className="text-xs text-slate-400">
                {computers.length} machines répertoriées ({computers.filter((c) => c.status === 'online').length} en ligne)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Déploiement Centralisé sur le Parc Informatique
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Appliquez les restrictions USB à distance sur les postes de travail sans installer d'agent 
              lourd via <strong className="text-slate-300">WMI (StdRegProv)</strong>, <strong className="text-slate-300">WinRM</strong>, 
              ou en générant des objets de stratégie de groupe <strong className="text-slate-300">Active Directory (GPO)</strong>.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-lg font-bold text-rose-400">
                {computers.filter((c) => c.currentPolicy === 'BLOCK_ALL').length}
              </div>
              <div className="text-[11px] text-slate-400">USB Bloqués</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-lg font-bold text-amber-400">
                {computers.filter((c) => c.currentPolicy === 'READ_ONLY').length}
              </div>
              <div className="text-[11px] text-slate-400">Lecture Seule</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-center">
              <div className="text-lg font-bold text-emerald-400">
                {computers.filter((c) => c.currentPolicy === 'UNBLOCKED').length}
              </div>
              <div className="text-[11px] text-slate-400">Non Restreints</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Méthode de déploiement réseau :</span>
            <div className="inline-flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-xs">
              <button
                onClick={() => setSelectedMethod('WMI')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedMethod === 'WMI'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                WMI (StdRegProv natif)
              </button>
              <button
                onClick={() => setSelectedMethod('WINRM')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedMethod === 'WINRM'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                WinRM / PowerShell
              </button>
              <button
                onClick={() => setSelectedMethod('GPO')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  selectedMethod === 'GPO'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                GPO Active Directory
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchDeploy('BLOCK_ALL')}
              disabled={selectedCount === 0 || isDeploying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Bloquer ({selectedCount})
            </button>

            <button
              onClick={() => handleBatchDeploy('READ_ONLY')}
              disabled={selectedCount === 0 || isDeploying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Lecture Seule ({selectedCount})
            </button>

            <button
              onClick={() => handleBatchDeploy('UNBLOCKED')}
              disabled={selectedCount === 0 || isDeploying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Débloquer ({selectedCount})
            </button>

            {/* Quick Export Fleet Inventory Buttons */}
            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Exporter l'inventaire complet du parc (Noms réels, MAC, IP) en CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              Export CSV
            </button>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Exporter l'inventaire en JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              JSON
            </button>

            {selectedCount > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Supprimer la sélection de la liste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add computer & Search row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Machine Form */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Ajouter un Ordinateur du Réseau
          </h3>
          <form onSubmit={handleAddComputer} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nom NetBIOS / Hostname Réel
              </label>
              <input
                type="text"
                placeholder="Ex: PC-COMPTA01, SRV-FILE02"
                value={newHostname}
                onChange={(e) => setNewHostname(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Adresse IP
                </label>
                <input
                  type="text"
                  placeholder="192.168.1.xxx"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">
                    Adresse MAC
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewMac(generateRandomMac())}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Générer
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="00:1A:2B:3C:4D:5E"
                  value={newMac}
                  onChange={(e) => setNewMac(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Carte Réseau (NIC)
                </label>
                <input
                  type="text"
                  placeholder="Intel GbE / Realtek"
                  value={newNic}
                  onChange={(e) => setNewNic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Domaine AD
                </label>
                <input
                  type="text"
                  placeholder="CORP.LOCAL"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter à la liste d'inventaire
            </button>
          </form>
        </div>

        {/* Machine Table & Search */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom d'ordinateur, IP, MAC ou domaine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSelectAll(true)}
                  className="text-xs text-slate-400 hover:text-cyan-400 px-2 py-1"
                >
                  Tout cocher
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => toggleSelectAll(false)}
                  className="text-xs text-slate-400 hover:text-cyan-400 px-2 py-1"
                >
                  Tout décocher
                </button>
              </div>
            </div>

            {/* Reseau Notice Banner */}
            {reseauNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{reseauNotice}</span>
              </div>
            )}

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-2 px-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={computers.length > 0 && computers.every((c) => c.selected)}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500"
                      />
                    </th>
                    <th className="py-2 px-2.5">Nom Réel (Machine)</th>
                    <th className="py-2 px-2.5">Adresse IP</th>
                    <th className="py-2 px-2.5">Adresse MAC</th>
                    <th className="py-2 px-2.5">Domaine & NIC</th>
                    <th className="py-2 px-2.5">Statut</th>
                    <th className="py-2 px-2.5">Politique USB</th>
                    <th className="py-2 px-2.5 text-right">Dernière synchro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {/* Pinned Row 0: Local PC (Ce Poste Actuel) */}
                  <tr className="bg-cyan-950/40 border-b-2 border-cyan-500/40">
                    <td className="py-2.5 px-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" title="Poste Local Actif" />
                    </td>
                    <td className="py-2.5 px-2.5 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{localMachine.hostname}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-sans font-bold">
                              📍 CE POSTE (LOCAL)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">{localMachine.os}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-emerald-400 font-mono font-bold">
                      {localMachine.ip}
                    </td>
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60 font-bold">
                          {localMachine.macAddress}
                        </span>
                        <button
                          onClick={() => handleCopyMac(localMachine.macAddress)}
                          className="text-slate-500 hover:text-indigo-400 transition"
                          title="Copier l'adresse MAC de ce PC"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400">
                      <div className="text-cyan-400 font-sans text-xs">{localMachine.domainOrWorkgroup}</div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]" title={localMachine.nicAdapter}>
                        {localMachine.nicAdapter}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5">
                      {localMachine.isVerifiedReal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          SCAN RÉEL VÉRIFIÉ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          SCAN EN ATTENTE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 font-sans">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={handleReseauCopyPowerShell}
                          className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold shadow transition"
                          title="Copier la commande PowerShell pour scanner ce PC"
                        >
                          ⚡ Commande PS
                        </button>
                        <button
                          onClick={handleReseauPasteClipboard}
                          className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold shadow transition"
                          title="Coller le scan depuis le presse-papiers"
                        >
                          📋 Coller
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-sans text-[11px] text-slate-400">
                      {localMachine.lastDetected}
                    </td>
                  </tr>
                  {filteredComputers.map((comp) => (
                    <tr
                      key={comp.id}
                      className={`hover:bg-slate-800/40 transition ${
                        comp.selected ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-2.5">
                        <input
                          type="checkbox"
                          checked={!!comp.selected}
                          onChange={() => toggleSelect(comp.id)}
                          className="rounded border-slate-700 text-cyan-500"
                        />
                      </td>
                      <td className="py-2.5 px-2.5 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div>{comp.hostname}</div>
                            <div className="text-[10px] text-slate-500 font-sans">{comp.os}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-emerald-400 font-mono font-medium">
                        {comp.ip}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60">
                            {comp.macAddress || '00:1A:2B:3C:4D:5E'}
                          </span>
                          <button
                            onClick={() => handleCopyMac(comp.macAddress)}
                            className="text-slate-500 hover:text-indigo-400 transition"
                            title="Copier l'adresse MAC"
                          >
                            {copiedMac === comp.macAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-400">
                        <div className="text-cyan-400 font-sans text-xs">{comp.domain}</div>
                        <div className="text-[10px] text-slate-500 font-sans truncate max-w-[140px]" title={comp.nicAdapter}>
                          {comp.nicAdapter || 'Ethernet Standard'}
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        {comp.status === 'online' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            En ligne
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Hors-ligne
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 font-sans">
                        {comp.currentPolicy === 'BLOCK_ALL' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Bloqué
                          </span>
                        )}
                        {comp.currentPolicy === 'READ_ONLY' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Lecture seule
                          </span>
                        )}
                        {comp.currentPolicy === 'UNBLOCKED' && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Autorisé
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-slate-500 text-[11px]">
                        {comp.lastSync}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Log Console */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Journal d'Exécution & Télémétrie Déploiement Réseau
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Compte-rendu des appels WMI <code className="text-cyan-300">StdRegProv</code> et commandes PowerShell à distance.
        </p>

        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 font-mono text-xs max-h-48 overflow-y-auto space-y-2">
          {deploymentLogs.length === 0 ? (
            <div className="text-slate-500">Aucun déploiement récent. Sélectionnez des machines et cliquez sur un bouton d'action.</div>
          ) : (
            deploymentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                {log.result === 'success' ? (
                  <span className="text-emerald-400 font-bold shrink-0">[SUCCÈS]</span>
                ) : (
                  <span className="text-rose-400 font-bold shrink-0">[ÉCHEC]</span>
                )}
                <span className="text-cyan-400 font-semibold shrink-0">{log.target} :</span>
                <span className="text-slate-300">{log.action} — {log.details}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
