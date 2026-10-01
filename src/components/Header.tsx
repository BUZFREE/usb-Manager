import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  RefreshCw,
  Printer,
  Moon,
  Sun,
  Monitor,
  Menu,
  Activity,
  Laptop,
  Globe,
  Terminal,
  Search,
  Cpu,
  ListFilter,
  FileCode,
  HeartPulse,
  Building2,
  UserCheck
} from 'lucide-react';
import { PolicyMode } from '../types/usbPolicy';
import { useTheme } from '../context/ThemeContext';
import { generatePythonProjectZip, downloadBlob } from '../utils/zipGenerator';
import { DmeUserSession } from './DmeWelcomeModal';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  policyMode: PolicyMode;
  onRefreshStatus?: () => void;
  onToggleSidebarMobile?: () => void;
  onOpenDmeModal?: () => void;
  connectedUser?: DmeUserSession;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  policyMode,
  onRefreshStatus,
  onToggleSidebarMobile,
  onOpenDmeModal,
  connectedUser,
}) => {
  const { theme, setTheme } = useTheme();
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

  const getTabLabel = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Tableau de Bord (Temps Réel)';
      case 'monoposte':
        return 'Monoposte (Poste Local)';
      case 'reseau':
        return 'Réseau & Active Directory';
      case 'python':
        return 'Moteur & Suite Python (8 Outils)';
      case 'forensics':
        return 'Forensics & Event Logs (IDs 20001, 20003)';
      case 'audit':
        return 'Scanner & Audit Matériel USB';
      case 'whitelist':
        return 'Liste Blanche (Exceptions)';
      case 'scripts':
        return 'GPO & Scripts PowerShell / .REG';
      case 'reports':
        return "Centre d'Impression & Rapports Officiels";
      case 'wifi-mikrotik':
        return "Détection & Blocage Wi-Fi (Exception Winbox MikroTik Port 8291)";
      default:
        return 'WinLock USB Manager';
    }
  };

  const getStatusBadge = () => {
    switch (policyMode) {
      case 'BLOCK_ALL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Stockage : BLOQUÉ
          </span>
        );
      case 'READ_ONLY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5" />
            Stockage : LECTURE SEULE
          </span>
        );
      case 'BLOCK_EXECUTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            Stockage : EXEC INTERDITE
          </span>
        );
      case 'UNBLOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Stockage : DÉBLOQUÉ
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left: Mobile hamburger & Breadcrumb title */}
          <div className="flex items-center gap-3">
            {onToggleSidebarMobile && (
              <button
                onClick={onToggleSidebarMobile}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden"
                title="Ouvrir le menu de navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">WinLock USB &rsaquo;</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
                  {getTabLabel()}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Windows 10, 11 & Windows Server • Souris & Clavier HID Inviolables
              </p>
            </div>
          </div>

          {/* Right: Actions, Status & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Mr. BAZ AMAR / DME Santé Identification Button */}
            {onOpenDmeModal && (
              <button
                onClick={onOpenDmeModal}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs flex items-center gap-2 transition text-slate-200 cursor-pointer shadow-sm"
                title="Présentation du projet par Mr. BAZ AMAR (CHU Béni Messous Alger, 10-2026) • Identification Santé DME"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                  BA
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[11px] font-extrabold text-slate-100 flex items-center gap-1.5">
                    <span>{connectedUser?.fullName || 'Mr. BAZ AMAR'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800/40">DME</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {connectedUser?.email || 'CHU Béni Messous'}
                  </div>
                </div>
              </button>
            )}

            {getStatusBadge()}

            {/* Quick Print Center shortcut button */}
            <button
              onClick={() => setCurrentTab('reports')}
              className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                currentTab === 'reports'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
              title="Accéder au Centre d'Impression des États"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Imprimer États</span>
            </button>

            {/* Refresh policy status button */}
            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                title="Rafraîchir l'audit des stratégies"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Top Quick Theme Switcher Icons */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  theme === 'dark' ? 'bg-slate-900 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Mode Sombre"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Mode Clair"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  theme === 'system' ? 'bg-slate-900 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Mode Système Auto"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
