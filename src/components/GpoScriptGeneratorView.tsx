import React, { useState } from 'react';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  BookOpen, 
  FolderLock, 
  CheckCircle2, 
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { SCRIPT_TEMPLATES, ScriptFile } from '../data/scriptTemplates';
import { downloadText } from '../utils/zipGenerator';

export const GpoScriptGeneratorView: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<ScriptFile>(SCRIPT_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedScript.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadText(selectedScript.content, selectedScript.name);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                ACTIVE DIRECTORY & SCRIPTS D'ADMINISTRATION
              </span>
              <span className="text-xs text-slate-400">PowerShell 5.1/7+ • Fichiers .REG • GPMC.MSC</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Générateur de Stratégies GPO & Scripts Déployables
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Téléchargez des scripts PowerShell automatisés et des fichiers de Registre Windows 
              prêts à l'emploi, ou suivez le guide pas-à-pas pour configurer une stratégie de groupe 
              dans votre console Active Directory (<code className="text-cyan-300">gpmc.msc</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger {selectedScript.name}
            </button>
          </div>
        </div>
      </div>

      {/* Script Selector & Code Viewer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2.5 gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {SCRIPT_TEMPLATES.map((script) => (
              <button
                key={script.name}
                onClick={() => setSelectedScript(script)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  selectedScript.name === script.name
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                {script.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <span className="text-cyan-400 font-semibold">{selectedScript.name}</span> : {selectedScript.description}
          </div>
          <span className="text-[11px] font-mono text-slate-500 uppercase">{selectedScript.category}</span>
        </div>

        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[420px] overflow-y-auto leading-relaxed text-slate-300">
          <pre>
            <code>{selectedScript.content}</code>
          </pre>
        </div>
      </div>

      {/* Complete Step-by-Step GPO Guide */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Guide Officiel : Configuration de la GPO Active Directory (Windows Server)
            </h3>
            <p className="text-xs text-slate-400">
              Procédure certifiée pour déployer la stratégie sur une Unité d'Organisation (OU) sans impacter les souris ni les claviers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">1</span>
              Créer l'Objet GPO
            </div>
            <p className="text-xs text-slate-300">
              Ouvrez <code className="text-cyan-300">gpmc.msc</code> sur votre Contrôleur de Domaine (DC).
              Faites un clic droit sur votre OU d'ordinateurs et sélectionnez :
              <br />
              <strong className="text-slate-200">« Créer un objet GPO dans ce domaine, et le lier ici... »</strong>
              <br />
              Nommez-le : <code className="text-slate-300">GPO_Securite_Blocage_USB_Storage</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">2</span>
              Naviguer dans l'Arborescence
            </div>
            <p className="text-xs text-slate-300">
              Faites un clic droit <strong>Modifier</strong> sur la GPO. Naviguez vers :
            </p>
            <div className="p-2 rounded bg-slate-900/80 font-mono text-[11px] text-cyan-300">
              Configuration ordinateur<br />
              └ Modèles d'administration<br />
              &nbsp;&nbsp;└ Système<br />
              &nbsp;&nbsp;&nbsp;&nbsp;└ Accès au stockage amovible
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">3</span>
              Activer les Paramètres Cibles
            </div>
            <p className="text-xs text-slate-300">
              Configurez selon votre besoin :
            </p>
            <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
              <li><strong>Disques amovibles : Refuser l'accès en écriture</strong> (Pour Lecture Seule)</li>
              <li><strong>Disques amovibles : Refuser l'accès en lecture & exécution</strong> (Pour Blocage Total)</li>
              <li><strong>Périphériques WPD : Refuser l'accès</strong> (Bloque les smartphones)</li>
            </ul>
          </div>
        </div>

        {/* Reassurance Callout */}
        <div className="mt-4 p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-cyan-300 font-semibold">Pourquoi la souris et le clavier ne risquent rien ?</strong> Le conteneur GPO 
            « Accès au stockage amovible » (Removable Storage Access) n'a d'effet <strong>que</strong> sur les pilotes de la pile 
            <code className="text-slate-200"> usbstor.sys</code> et les GUIDs de volumes amovibles. Les claviers et souris sont gérés 
            par la pile d'interface humaine (<code className="text-slate-200">hidclass.sys / mouhid.sys</code>) et sont physiquement 
            ignorés par ce composant Windows.
          </div>
        </div>
      </div>
    </div>
  );
};
