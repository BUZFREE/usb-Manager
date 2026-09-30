import React, { useState } from 'react';
import { 
  ListFilter, 
  Plus, 
  Trash2, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  FileCode, 
  Download,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { WhitelistDevice } from '../types/usbPolicy';
import { downloadText } from '../utils/zipGenerator';

export const WhitelistView: React.FC = () => {
  const [devices, setDevices] = useState<WhitelistDevice[]>([
    {
      id: 'wl-1',
      label: 'Clé Kingston IronKey D300 (Chiffrée Direction)',
      vendorId: '0951',
      productId: '1666',
      hardwareId: 'USBSTOR\\DiskKingstonDataTraveler_3.0PMAP',
      serialNumber: '001A928BC45D',
      assignedUser: 'Direction Générale (DG)',
      dateAdded: '2026-09-15',
      notes: 'Clé certifiée FIPS 140-2 Niveau 3 autorisée en écriture'
    },
    {
      id: 'wl-2',
      label: 'Disque Sauvegarde IT Externe Crucial X8',
      vendorId: '0634',
      productId: '5600',
      hardwareId: 'USBSTOR\\DiskCrucial_CT1000X8SSD9_____0200',
      serialNumber: '2145E4598F',
      assignedUser: 'Équipe SysAdmin / SecOps',
      dateAdded: '2026-09-20',
      notes: 'Disque de secours pour images ISO et restauration offline'
    }
  ]);

  const [label, setLabel] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [assignedUser, setAssignedUser] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !hardwareId.trim()) return;

    const vidMatch = hardwareId.match(/VID_([0-9A-Fa-f]{4})/i);
    const pidMatch = hardwareId.match(/PID_([0-9A-Fa-f]{4})/i);
    const parts = hardwareId.split('\\');
    const detectedSerial = parts.length > 2 && parts[parts.length - 1].length > 3 ? parts[parts.length - 1] : `SN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newDev: WhitelistDevice = {
      id: `wl-${Date.now()}`,
      label: label.trim(),
      vendorId: vidMatch ? vidMatch[1].toUpperCase() : '0781',
      productId: pidMatch ? pidMatch[1].toUpperCase() : '5583',
      hardwareId: hardwareId.trim(),
      serialNumber: detectedSerial,
      assignedUser: assignedUser.trim() || 'Non assigné',
      dateAdded: new Date().toISOString().split('T')[0],
      notes: 'Ajouté manuellement via console WinLock'
    };

    setDevices((prev) => [newDev, ...prev]);
    setLabel('');
    setHardwareId('');
    setAssignedUser('');
  };

  const handleRemove = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const generatedRegContent = `Windows Registry Editor Version 5.00

; ==============================================================================
; WINLOCK USB - LISTE BLANCHE DES PÉRIPHÉRIQUES AUTORISÉS (SetupAPI Restrictions)
; Bloque tout le stockage USB SAUF les identifiants matériels listés ci-dessous
; ==============================================================================

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DeviceInstall\\Restrictions]
"DenyDeviceClasses"=dword:00000001
"DenyDeviceClassesRetroactive"=dword:00000001
"AllowDeviceIDs"=dword:00000001

; Classe Disques de stockage à bloquer par défaut ({4d36e967-e325-11ce-bfc1-08002be10318})
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DeviceInstall\\Restrictions\\DenyDeviceClasses]
"1"="{4d36e967-e325-11ce-bfc1-08002be10318}"

; Clés USB spécifiques explicitement autorisées (Exceptions Liste Blanche)
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DeviceInstall\\Restrictions\\AllowDeviceIDs]
${devices.map((d, idx) => `"${idx + 1}"="${d.hardwareId}"`).join('\n')}
`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                EXCEPTIONS & CLÉS OFFICIELLES
              </span>
              <span className="text-xs text-slate-400">{devices.length} clés d'entreprise approuvées</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Gestion de la Liste Blanche (Whitelist USB)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Autorisez uniquement certaines clés USB d'entreprise (chiffrées BitLocker/IronKey, sauvegardes IT) 
              grâce à leur identifiant matériel matériel unique (<code className="text-cyan-300">Hardware ID</code> ou numéro de série), 
              tout en maintenant le <strong>blocage strict</strong> de toutes les clés USB grand public non autorisées.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadText(generatedRegContent, 'Whitelist_USB_Exceptions.reg')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger .REG Liste Blanche
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form add key */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Ajouter une Clé USB à la Liste Blanche
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Désignation de la clé
              </label>
              <input
                type="text"
                placeholder="Ex: Clé SanDisk Extreme IT Admin"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Hardware ID (Identifiant Matériel Windows)
              </label>
              <input
                type="text"
                placeholder="Ex: USBSTOR\DiskSanDisk_Cruzer_Glide..."
                value={hardwareId}
                onChange={(e) => setHardwareId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Trouvable dans le Gestionnaire de Périphériques &gt; Détails &gt; Numéros d'identification du matériel.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Utilisateur ou Service Assigné
              </label>
              <input
                type="text"
                placeholder="Ex: Responsable Comptabilité / IT"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter aux exceptions
            </button>
          </form>
        </div>

        {/* List of Whitelisted Devices */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Périphériques USB Autorisés
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {devices.length} entrée(s) active(s)
            </span>
          </h3>

          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">{device.label}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Autorisé
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-300 break-all">
                    {device.hardwareId}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <span>Assigné à : <strong className="text-slate-200">{device.assignedUser}</strong></span>
                    <span>Ajouté le : {device.dateAdded}</span>
                  </div>
                  {device.notes && (
                    <div className="text-[11px] text-slate-500 italic">{device.notes}</div>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(device.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition self-start sm:self-center"
                  title="Retirer de la liste blanche"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Reg Code Preview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            Configuration de Registre Générée pour la Liste Blanche (AllowDeviceIDs)
          </h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedRegContent);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48 overflow-y-auto">
          <pre>
            <code>{generatedRegContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
