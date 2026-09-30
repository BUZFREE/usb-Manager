import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Laptop, 
  Globe, 
  FileCode, 
  ListFilter, 
  Cpu, 
  RefreshCw,
  Search,
  Terminal
} from 'lucide-react';
import { PolicyMode } from '../types/usbPolicy';
import { generatePythonProjectZip, downloadBlob } from '../utils/zipGenerator';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  policyMode: PolicyMode;
  onRefreshStatus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  policyMode,
  onRefreshStatus,
}) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generatePythonProjectZip();
      downloadBlob(zipBlob, 'WinLockUsb-Python-Suite.zip');
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getStatusBadge = () => {
    switch (policyMode) {
      case 'BLOCK_ALL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Stockage USB : BLOQUÉ
          </span>
        );
      case 'READ_ONLY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" />
            Stockage USB : LECTURE SEULE
          </span>
        );
      case 'BLOCK_EXECUTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            Exécution USB : INTERDITE
          </span>
        );
      case 'UNBLOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Stockage USB : AUTORISÉ
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  WinLock USB & GPO Manager
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  Python 3.12 / winreg / ctypes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Suite Python Universelle • Compatible tous Windows (11, 10, 8, 7, XP & Server) • Souris & Clavier Protégés
              </p>
            </div>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2.5">
            {getStatusBadge()}

            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                title="Rafraîchir l'audit des stratégies"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'Création du ZIP...' : 'Télécharger Suite Python (.zip)'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-800/80 pt-1 -mb-px text-xs sm:text-sm">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Tableau de Bord (Temps Réel)
          </button>

          <button
            onClick={() => setCurrentTab('monoposte')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'monoposte'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Monoposte (Local)
          </button>

          <button
            onClick={() => setCurrentTab('reseau')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'reseau'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Réseau & Active Directory
          </button>

          <button
            onClick={() => setCurrentTab('python')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'python'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Moteur & Outils Python (8)
          </button>

          <button
            onClick={() => setCurrentTab('forensics')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'forensics'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            Forensics & Historique USB
          </button>

          <button
            onClick={() => setCurrentTab('scripts')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'scripts'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileCode className="w-4 h-4" />
            GPO & PowerShell / REG
          </button>

          <button
            onClick={() => setCurrentTab('whitelist')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'whitelist'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Liste Blanche (Exceptions)
          </button>

          <button
            onClick={() => setCurrentTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentTab === 'audit'
                ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Audit & Diagnostic Matériel
          </button>
        </nav>
      </div>
    </header>
  );
};
