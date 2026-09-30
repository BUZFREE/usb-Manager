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
  Terminal, 
  Activity, 
  Printer, 
  Sun, 
  Moon, 
  Monitor, 
  ChevronRight, 
  CheckCircle2, 
  Layers,
  X,
  Menu
} from 'lucide-react';
import { PolicyMode } from '../types/usbPolicy';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { generatePythonProjectZip, downloadBlob } from '../utils/zipGenerator';

interface NavItem {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  hasLiveIndicator?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  policyMode: PolicyMode;
  onRefreshStatus?: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  computersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  policyMode,
  onRefreshStatus,
  isOpenMobile,
  setIsOpenMobile,
  computersCount = 6,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  const navGroups: NavGroup[] = [
    {
      title: 'SUPERVISION & CONTRÔLE',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de Bord',
          subLabel: 'Flux Temps Réel & Radar Ports',
          icon: Activity,
          hasLiveIndicator: true,
        },
        {
          id: 'monoposte',
          label: 'Monoposte (Local)',
          subLabel: 'Verrouillage immédiat & GPO',
          icon: Laptop,
        },
        {
          id: 'reseau',
          label: 'Réseau & Active Directory',
          subLabel: 'Flotte de machines & WMI',
          icon: Globe,
          badge: `${computersCount} PCs`,
        },
      ],
    },
    {
      title: 'OUTILS & MOTEURS SYSTÈME',
      items: [
        {
          id: 'python',
          label: 'Moteur & Suite Python',
          subLabel: '8 Outils, CLI, GUI & EXE',
          icon: Terminal,
          badge: '8 Outils',
        },
        {
          id: 'forensics',
          label: 'Forensics & Event Logs',
          subLabel: 'Event IDs 20001/3 & Registre',
          icon: Search,
          badge: 'IDs 20001/3',
        },
        {
          id: 'audit',
          label: 'Scanner Matériel USB',
          subLabel: 'Extraction VID, PID & Serial',
          icon: Cpu,
        },
        {
          id: 'whitelist',
          label: 'Liste Blanche',
          subLabel: 'Exceptions chiffrées & .REG',
          icon: ListFilter,
        },
        {
          id: 'scripts',
          label: 'GPO & PowerShell / REG',
          subLabel: 'Scripts & Guide gpmc.msc',
          icon: FileCode,
        },
      ],
    },
    {
      title: 'ÉDITION & IMPRESSION DES ÉTATS',
      items: [
        {
          id: 'reports',
          label: "Centre d'Impression & Rapports",
          subLabel: 'États officiels A4 & Exports PDF/CSV',
          icon: Printer,
          highlight: true,
          badge: 'Officiel A4',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & App Header */}
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight flex items-center gap-1.5 truncate">
                  WinLock USB
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                    v2.6
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate">
                  Gestionnaire GPO & Suite Python
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Active Policy Badge */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {policyMode === 'BLOCK_ALL' && (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {policyMode === 'READ_ONLY' && (
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              {policyMode === 'BLOCK_EXECUTE' && (
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              {policyMode === 'UNBLOCKED' && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div className="truncate">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Stratégie Active</div>
                <div className="font-bold text-slate-200">
                  {policyMode === 'BLOCK_ALL' && 'STOCKAGE BLOQUÉ'}
                  {policyMode === 'READ_ONLY' && 'LECTURE SEULE'}
                  {policyMode === 'BLOCK_EXECUTE' && 'EXEC INTERDITE'}
                  {policyMode === 'UNBLOCKED' && 'ACCÈS AUTORISÉ'}
                </div>
              </div>
            </div>

            {onRefreshStatus && (
              <button
                onClick={onRefreshStatus}
                title="Actualiser le statut des politiques"
                className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Groups List */}
          <div className="px-3 py-3 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none space-y-4">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {group.title}
                </div>

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setIsOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                          isActive
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/10'
                            : item.highlight
                            ? 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 border border-cyan-800/40'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.hasLiveIndicator ? (
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          ) : (
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive
                                  ? 'text-slate-950'
                                  : item.highlight
                                  ? 'text-cyan-400'
                                  : 'text-slate-400'
                              }`}
                            />
                          )}

                          <div className="truncate">
                            <div className="truncate leading-snug">{item.label}</div>
                            {item.subLabel && (
                              <div
                                className={`text-[10px] font-normal truncate ${
                                  isActive ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {item.subLabel}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 ${
                              isActive
                                ? 'bg-slate-950 text-cyan-300 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom Controls: Theme Switcher & Download ZIP */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-3">
          {/* Multi-Theme Selector: Dark, Light, System */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5 px-1 uppercase">
              <span>Thème d'Affichage</span>
              <span className="text-cyan-400 font-bold">
                {theme === 'dark' ? 'Sombre' : theme === 'light' ? 'Clair' : 'Système'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Activer le mode Sombre"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Sombre</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  theme === 'light'
                    ? 'bg-slate-800 text-amber-400 shadow-sm font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Activer le mode Clair"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Clair</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  theme === 'system'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Synchroniser avec le thème du système d'exploitation Windows"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Download Full Python Suite Archive */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Création ZIP...' : 'Télécharger Suite (.zip)'}
          </button>

          {/* Guarantee Footer Notice */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Souris & Clavier HID Inviolables</span>
          </div>
        </div>
      </aside>
    </>
  );
};
