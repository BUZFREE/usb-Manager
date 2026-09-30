import React, { useState } from 'react';
import { 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  FileCode, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Search,
  Eye,
  Sliders,
  PackageCheck,
  FolderLock
} from 'lucide-react';
import { PYTHON_FILES, PythonSourceFile } from '../data/pythonTemplates';
import { generatePythonProjectZip, downloadBlob, downloadText } from '../utils/zipGenerator';

export const PythonEngineView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonSourceFile>(PYTHON_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [cliInput, setCliInput] = useState('python winlock_cli.py --status');
  const [cliOutput, setCliOutput] = useState<string[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    downloadText(selectedFile.code, selectedFile.filename);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generatePythonProjectZip();
      downloadBlob(zipBlob, 'WinLockUsb-Python-Suite.zip');
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRunCli = (cmdToRun?: string) => {
    const command = (cmdToRun || cliInput).trim();
    const lines: string[] = [
      `C:\\Users\\Administrateur\\WinLock> ${command}`,
      `[WINLOCK PYTHON SUITE v2.5.0 - Python 3.12 / winreg / ctypes / pywin32]`
    ];

    if (command.includes('--block') || command.includes('-b')) {
      lines.push(
        `[PRIVILÈGES] ctypes.windll.shell32.IsUserAnAdmin() == True. Token élevé validé.`,
        `[REGISTRE] winreg.SetValueEx(HKLM, "SOFTWARE\\Policies\\Microsoft\\Windows\\RemovableStorageDevices", "Deny_All", 1)`,
        `[REGISTRE] winreg.SetValueEx(GUID {53f5630d...}, Deny_Read=1, Deny_Write=1, Deny_Execute=1)`,
        `[PILOTE] winreg.SetValueEx(SYSTEM\\...\\Services\\USBSTOR, "Start", 4) -> Pilote usbstor.sys désactivé.`,
        `[SETUPAPI] ctypes.windll.setupapi.SetupDiSetClassInstallParams(DICS_DISABLE) exécuté.`,
        `[SHELL] ctypes.windll.shell32.SHChangeNotify(0x08000000, 0x1000, None, None) -> Explorateur Windows notifié.`,
        `[GARANTIE MATÉRIELLE] Souris (mouhid.sys) et Clavier (kbdhid.sys) demeurent 100% OPÉRATIONNELS.`,
        `[SUCCÈS] Clés USB et disques durs externes BLOQUÉS avec succès.`
      );
    } else if (command.includes('--readonly') || command.includes('-ro')) {
      lines.push(
        `[REGISTRE] Suppression de la valeur Deny_All.`,
        `[REGISTRE] RemovableStorageDevices\\{53f5630d...} -> Deny_Write=1, Deny_Read=0.`,
        `[PILOTE] Service USBSTOR Start=3 (Manuel).`,
        `[SUCCÈS] Mode LECTURE SEULE activé : consultation autorisée, écriture/copie vers USB bloquée (Anti-Fuite).`
      );
    } else if (command.includes('--unblock') || command.includes('-u')) {
      lines.push(
        `[REGISTRE] Suppression des clés de stratégies RemovableStorageDevices.`,
        `[PILOTE] Service USBSTOR Start=3.`,
        `[SHELL] Notification Shell effectuée.`,
        `[SUCCÈS] Toutes les restrictions sur les clés USB ont été retirées.`
      );
    } else if (command.includes('--forensics')) {
      lines.push(
        `[FORENSICS] Extraction de HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR...`,
        `--------------------------------------------------------------------------------`,
        `[1] Modèle : SanDisk Ultra Fit 3.1 | S/N : 4C530001220412117582 | Risque : Élevé`,
        `[2] Modèle : Kingston DataTraveler | S/N : 001A928BC45D         | Risque : Approuvé (Chiffrée)`,
        `[3] Modèle : WD Elements Portable  | S/N : 57583431413838383134 | Risque : Critique (HDD Externe)`,
        `--------------------------------------------------------------------------------`,
        `[SUCCÈS] 3 périphériques USB historiques identifiés dans la ruche de registre.`
      );
    } else if (command.includes('--watchdog')) {
      lines.push(
        `[WATCHDOG] Initialisation du moniteur WMI en temps réel...`,
        `[WATCHDOG] Requête WQL : SELECT * FROM __InstanceCreationEvent WITHIN 2 WHERE TargetInstance ISA 'Win32_DiskDrive'`,
        `[WATCHDOG] Surveillance active en arrière-plan... En attente d'événements de branchement USB.`,
        `[INTERCEPTION] Clé USB SanDisk détectée sur le port USB 3.0 !`,
        `[INTERCEPTION] Action appliquée : Démontage immédiat par stratégie de sécurité.`
      );
    } else if (command.includes('build_exe')) {
      lines.push(
        `[BUILD] Génération du manifeste UAC requireAdministrator... OK.`,
        `[BUILD] Exécution de PyInstaller --onefile --clean --manifest=uac_admin.manifest winlock_cli.py...`,
        `[BUILD] Analyse des dépendances et compilation du runtime Python...`,
        `[SUCCÈS] Exécutable standalone généré dans : dist/WinLockUsb.exe (Prêt à l'emploi sans installer Python !)`
      );
    } else if (command.includes('usb_scanner') || command.includes('--scan')) {
      lines.push(
        `[SCANNER MATÉRIEL] Interrogation du bus PnP via WMI (Win32_PnPEntity)...`,
        `--------------------------------------------------------------------------------`,
        `[1] VID: 0x0781 | PID: 0x5581 | S/N: 4C530001290310118221 | Statut: BLOQUÉ GPO (SanDisk Ultra Flair)`,
        `[2] VID: 0x046D | PID: 0xC08B | S/N: HID-LOGI-8812         | Statut: PROTÉGÉ (Souris Logitech G502 HERO)`,
        `[3] VID: 0x413C | PID: 0x2113 | S/N: HID-DELL-0041         | Statut: PROTÉGÉ (Clavier Dell KB216)`,
        `[4] VID: 0x0951 | PID: 0x1666 | S/N: 001A928BC45D         | Statut: AUTORISÉ (Kingston IronKey D300)`,
        `--------------------------------------------------------------------------------`,
        `[SUCCÈS] 4 périphériques physiques inventoriés avec VID, PID, et numéros de série uniques.`
      );
    } else {
      lines.push(
        `=== ÉTAT DU POSTE LOCAL (winreg audit) ===`,
        `  • Statut Stockage USB       : RESTRICTIONS ACTIVES (Deny_All=1)`,
        `  • Pilote USBSTOR            : Start=4 (Désactivé)`,
        `  • Souris USB (HID)          : 100% PROTÉGÉE (mouhid.sys inviolé)`,
        `  • Clavier USB (HID)         : 100% PROTÉGÉ (kbdhid.sys inviolé)`,
        `  • Casques & Imprimantes     : 100% FONCTIONNELS`,
        `Tapez 'python winlock_cli.py --block', '--readonly', ou '--forensics'.`
      );
    }

    setCliOutput(lines);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                SUITE COMPLÈTE PYTHON 3.12 (WINREG / CTYPES / WMI)
              </span>
              <span className="text-xs text-slate-400">7 Outils Intégrés • CLI • GUI • Watchdog • Forensics • PyInstaller</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Suite d'Outils Python pour la Gestion USB Windows
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Conformément à votre demande, l'ensemble de l'architecture a été développé en <strong>Python</strong>, 
              offrant un écosystème d'outils considérablement enrichi : 
              manipulation native du Registre HKLM avec <code className="text-cyan-300">winreg</code>, 
              appels Win32 natifs via <code className="text-cyan-300">ctypes.windll</code>, 
              démon de surveillance en temps réel <code className="text-cyan-300">WMI</code>, 
              application graphique <code className="text-cyan-300">Tkinter</code>, 
              extracteur d'historique forensique et compilation en <strong>.EXE autonome</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Création de l\'archive...' : 'Télécharger Suite Python (.zip)'}
            </button>
          </div>
        </div>

        {/* 4 Tool Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Cpu className="w-4 h-4" />
              APIs Windows Natives
            </div>
            <p className="text-xs text-slate-400">
              Module standard <code className="text-slate-300">winreg</code> et <code className="text-slate-300">ctypes.windll</code> pour un accès direct au Registre HKLM et à SetupAPI.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Eye className="w-4 h-4" />
              Démon Watchdog USB
            </div>
            <p className="text-xs text-slate-400">
              Surveillance continue en arrière-plan interceptant instantanément chaque clé branchée sur le port USB via WMI.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Search className="w-4 h-4" />
              Audit Forensique USB
            </div>
            <p className="text-xs text-slate-400">
              Extraction de l'historique complet des clés USB ayant été connectées sur la machine via la ruche <code className="text-slate-300">Enum\USBSTOR</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <PackageCheck className="w-4 h-4" />
              Exécutable .EXE Standalone
            </div>
            <p className="text-xs text-slate-400">
              Compilateur PyInstaller produisant un binaire Windows autonome avec élévation UAC administrateur intégrée.
            </p>
          </div>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PYTHON_FILES.map((file) => (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  selectedFile.filename === file.filename
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                {file.filename}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Copier le code source"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>

            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Télécharger ce fichier uniquement"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <span className="text-cyan-400 font-semibold">{selectedFile.filename}</span> : {selectedFile.description}
          </div>
          <span className="text-[11px] font-mono text-slate-500 uppercase">{selectedFile.category}</span>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed text-slate-300">
          <pre>
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Interactive Python CLI Runner Simulator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Simulateur d'Exécution Python en Ligne de Commande</h3>
              <p className="text-xs text-slate-400">
                Testez les différents scripts et arguments de la suite Python directement dans le navigateur.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setCliInput('python winlock_cli.py --block');
                handleRunCli('python winlock_cli.py --block');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700"
            >
              --block
            </button>
            <button
              onClick={() => {
                setCliInput('python winlock_cli.py --readonly');
                handleRunCli('python winlock_cli.py --readonly');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
            >
              --readonly
            </button>
            <button
              onClick={() => {
                setCliInput('python winlock_cli.py --unblock');
                handleRunCli('python winlock_cli.py --unblock');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
            >
              --unblock
            </button>
            <button
              onClick={() => {
                setCliInput('python winlock_cli.py --forensics');
                handleRunCli('python winlock_cli.py --forensics');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
            >
              --forensics
            </button>
            <button
              onClick={() => {
                setCliInput('python winlock_cli.py --watchdog');
                handleRunCli('python winlock_cli.py --watchdog');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
            >
              --watchdog
            </button>
            <button
              onClick={() => {
                setCliInput('python usb_scanner.py');
                handleRunCli('python usb_scanner.py');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
            >
              usb_scanner.py
            </button>
            <button
              onClick={() => {
                setCliInput('python build_exe.py');
                handleRunCli('python build_exe.py');
              }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
            >
              build_exe.py
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCli()}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="python winlock_cli.py [options]"
          />
          <button
            onClick={() => handleRunCli()}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Exécuter
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 min-h-[140px] space-y-1">
          {cliOutput.length === 0 ? (
            <div className="text-slate-500">
              Tapez une commande Python ou cliquez sur l'un des boutons d'options ci-dessus...
            </div>
          ) : (
            cliOutput.map((l, idx) => (
              <div
                key={idx}
                className={
                  l.includes('[SUCCÈS]')
                    ? 'text-emerald-400 font-semibold'
                    : l.includes('[GARANTIE]')
                    ? 'text-cyan-300 font-bold'
                    : l.includes('ALERTE') || l.includes('[INTERCEPTION]')
                    ? 'text-rose-400 font-bold'
                    : l.startsWith('C:\\')
                    ? 'text-slate-100 font-bold'
                    : 'text-slate-300'
                }
              >
                {l}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
