/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MonoposteView } from './components/MonoposteView';
import { ReseauView } from './components/ReseauView';
import { PythonEngineView } from './components/PythonEngineView';
import { UsbForensicsView } from './components/UsbForensicsView';
import { GpoScriptGeneratorView } from './components/GpoScriptGeneratorView';
import { WhitelistView } from './components/WhitelistView';
import { UsbAuditView } from './components/UsbAuditView';
import { ReportsPrintCenterView } from './components/ReportsPrintCenterView';
import { WifiMikrotikView } from './components/WifiMikrotikView';
import { DmeWelcomeModal, DmeUserSession } from './components/DmeWelcomeModal';
import { PolicyMode, NetworkComputer, DeploymentLog } from './types/usbPolicy';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [policyMode, setPolicyMode] = useState<PolicyMode>('BLOCK_ALL');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lastAppliedTime, setLastAppliedTime] = useState<string>(
    new Date().toLocaleTimeString('fr-FR')
  );

  // DME Healthcare Session & Welcome Modal State (Created by Mr. BAZ AMAR CHU Béni Messous Alger 10-2026)
  const [dmeSession, setDmeSession] = useState<DmeUserSession>(() => {
    try {
      const saved = localStorage.getItem('winlock_dme_auth_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      email: 'issaadhassani@gmail.com',
      fullName: 'Mr. BAZ AMAR',
      hospital: 'CHU Béni Messous - Alger',
      role: 'Informaticien Santé / DSI DME',
      connectedAt: '',
      isAuthenticated: false,
    };
  });

  const [isDmeModalOpen, setIsDmeModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('winlock_dme_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !parsed.isAuthenticated;
      }
    } catch {}
    return true; // Foreground presentation open by default
  });

  // Network fleet state with real Hostnames, IP addresses, MAC addresses, and NIC adapters
  const [computers, setComputers] = useState<NetworkComputer[]>([
    {
      id: 'pc-1',
      hostname: 'PC-DIRECTION01',
      ip: '192.168.10.12',
      macAddress: '00:1A:2B:44:89:12',
      nicAdapter: 'Intel(R) Ethernet Connection I219-LM',
      domain: 'CORP.LOCAL',
      os: 'Windows 11 Pro 23H2',
      currentPolicy: 'BLOCK_ALL',
      status: 'online',
      lastSync: '10:42:15',
      selected: false,
    },
    {
      id: 'pc-2',
      hostname: 'PC-FINANCE02',
      ip: '192.168.10.18',
      macAddress: '3C:52:82:1D:6F:4A',
      nicAdapter: 'Realtek PCIe GbE Family Controller',
      domain: 'CORP.LOCAL',
      os: 'Windows 11 Enterprise',
      currentPolicy: 'BLOCK_ALL',
      status: 'online',
      lastSync: '10:40:02',
      selected: false,
    },
    {
      id: 'pc-3',
      hostname: 'PC-COMPTA03',
      ip: '192.168.10.25',
      macAddress: '50:7B:9D:E4:C1:88',
      nicAdapter: 'Intel(R) Wi-Fi 6 AX201 160MHz',
      domain: 'CORP.LOCAL',
      os: 'Windows 10 Pro 22H2',
      currentPolicy: 'READ_ONLY',
      status: 'online',
      lastSync: '10:38:50',
      selected: false,
    },
    {
      id: 'pc-4',
      hostname: 'PC-ACCUEIL',
      ip: '192.168.10.30',
      macAddress: '70:85:C2:5E:2B:99',
      nicAdapter: 'Realtek Gaming 2.5GbE Family Controller',
      domain: 'CORP.LOCAL',
      os: 'Windows 11 Pro 23H2',
      currentPolicy: 'BLOCK_ALL',
      status: 'online',
      lastSync: '10:44:11',
      selected: false,
    },
    {
      id: 'pc-5',
      hostname: 'PC-DEV01-LAPTOP',
      ip: '192.168.10.45',
      macAddress: '9C:B6:D0:A2:14:73',
      nicAdapter: 'Intel(R) Wi-Fi 6E AX211 160MHz',
      domain: 'CORP.LOCAL',
      os: 'Windows 11 Enterprise',
      currentPolicy: 'UNBLOCKED',
      status: 'offline',
      lastSync: 'Hier 18:20',
      selected: false,
    },
    {
      id: 'pc-6',
      hostname: 'SRV-FILE01',
      ip: '192.168.10.5',
      macAddress: '00:50:56:B3:9C:01',
      nicAdapter: 'Broadcom NetXtreme Gigabit Ethernet',
      domain: 'CORP.LOCAL',
      os: 'Windows Server 2022',
      currentPolicy: 'BLOCK_ALL',
      status: 'online',
      lastSync: '10:45:00',
      selected: false,
    },
  ]);

  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([
    {
      id: 'log-init-1',
      timestamp: '10:42:15',
      target: 'PC-DIRECTION01 (192.168.10.12)',
      action: 'Blocage USB Total (GPO & USBSTOR)',
      result: 'success',
      details: 'winreg.SetValueEx sur HKLM\\...\\RemovableStorageDevices -> Deny_All=1 appliqué via Python WMI StdRegProv.',
    },
    {
      id: 'log-init-2',
      timestamp: '10:40:02',
      target: 'PC-FINANCE02 (192.168.10.18)',
      action: 'Blocage USB Total',
      result: 'success',
      details: 'Pilote USBSTOR Start=4 désactivé. gpupdate /target:computer validé.',
    },
  ]);

  const handleApplyPolicy = (newMode: PolicyMode, retroactive: boolean) => {
    setPolicyMode(newMode);
    setLastAppliedTime(new Date().toLocaleTimeString('fr-FR'));

    const actionText =
      newMode === 'BLOCK_ALL'
        ? 'Blocage USB Total appliqué (Python winreg)'
        : newMode === 'READ_ONLY'
        ? 'Passage en Lecture Seule'
        : newMode === 'BLOCK_EXECUTE'
        ? 'Blocage de l\'exécution d\'applications USB'
        : 'Levée des restrictions USB';

    const log: DeploymentLog = {
      id: `local-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      target: 'POSTE_LOCAL (Monoposte)',
      action: actionText,
      result: 'success',
      details: `Registre HKLM synchronisé par Python. Rétroactivité SetupAPI : ${
        retroactive ? 'Activée' : 'Désactivée'
      }. Souris et clavier HID intacts.`,
    };

    setDeploymentLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Left Sidebar Navigation Menu */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        policyMode={policyMode}
        onRefreshStatus={() => setLastAppliedTime(new Date().toLocaleTimeString('fr-FR'))}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        computersCount={computers.length}
        onOpenDmeModal={() => setIsDmeModalOpen(true)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          policyMode={policyMode}
          onRefreshStatus={() => setLastAppliedTime(new Date().toLocaleTimeString('fr-FR'))}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenDmeModal={() => setIsDmeModalOpen(true)}
          connectedUser={dmeSession}
        />

        {/* View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              policyMode={policyMode}
              onApplyPolicy={handleApplyPolicy}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'monoposte' && (
            <MonoposteView
              policyMode={policyMode}
              setPolicyMode={setPolicyMode}
              onApplyPolicy={handleApplyPolicy}
              lastAppliedTime={lastAppliedTime}
            />
          )}

          {currentTab === 'reseau' && (
            <ReseauView
              computers={computers}
              setComputers={setComputers}
              deploymentLogs={deploymentLogs}
              setDeploymentLogs={setDeploymentLogs}
            />
          )}

          {currentTab === 'wifi-mikrotik' && <WifiMikrotikView />}

          {currentTab === 'python' && <PythonEngineView />}

          {currentTab === 'forensics' && <UsbForensicsView />}

          {currentTab === 'scripts' && <GpoScriptGeneratorView />}

          {currentTab === 'whitelist' && <WhitelistView />}

          {currentTab === 'audit' && <UsbAuditView />}

          {currentTab === 'reports' && (
            <ReportsPrintCenterView
              policyMode={policyMode}
              computers={computers}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-medium">WinLock Santé & Sécurisation DME</span>
              <span>—</span>
              <span className="text-cyan-400">Créé par Mr. BAZ AMAR (CHU Béni Messous Alger, 10-2026)</span>
              <span>•</span>
              <span>Utilisation libre pour tous les informaticiens de la santé</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Souris & Clavier HID Inviolables
              </span>
              <span>•</span>
              <button
                onClick={() => setIsDmeModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
              >
                À propos du Projet DME
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Foreground Modal: Official Presentation by Mr. BAZ AMAR & Healthcare Email Login */}
      <DmeWelcomeModal
        isOpen={isDmeModalOpen}
        onClose={() => setIsDmeModalOpen(false)}
        onSaveSession={(sess) => setDmeSession(sess)}
        currentSession={dmeSession}
      />
    </div>
  );
}
