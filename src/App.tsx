/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MonoposteView } from './components/MonoposteView';
import { ReseauView } from './components/ReseauView';
import { PythonEngineView } from './components/PythonEngineView';
import { UsbForensicsView } from './components/UsbForensicsView';
import { GpoScriptGeneratorView } from './components/GpoScriptGeneratorView';
import { WhitelistView } from './components/WhitelistView';
import { UsbAuditView } from './components/UsbAuditView';
import { PolicyMode, NetworkComputer, DeploymentLog } from './types/usbPolicy';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [policyMode, setPolicyMode] = useState<PolicyMode>('BLOCK_ALL');
  const [lastAppliedTime, setLastAppliedTime] = useState<string>(
    new Date().toLocaleTimeString('fr-FR')
  );

  // Network fleet mock state
  const [computers, setComputers] = useState<NetworkComputer[]>([
    {
      id: 'pc-1',
      hostname: 'PC-DIRECTION01',
      ip: '192.168.10.12',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        policyMode={policyMode}
        onRefreshStatus={() => setLastAppliedTime(new Date().toLocaleTimeString('fr-FR'))}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            policyMode={policyMode}
            onApplyPolicy={handleApplyPolicy}
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

        {currentTab === 'python' && <PythonEngineView />}

        {currentTab === 'forensics' && <UsbForensicsView />}

        {currentTab === 'scripts' && <GpoScriptGeneratorView />}

        {currentTab === 'whitelist' && <WhitelistView />}

        {currentTab === 'audit' && <UsbAuditView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-medium">WinLock USB & GPO Manager</span>
            <span>—</span>
            <span>Suite Python 3.12 (winreg, ctypes Win32, pywin32, WMI) pour Windows 10, 11 et Windows Server</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Souris & Clavier HID Inviolables
            </span>
            <span>•</span>
            <span>Watchdog en temps réel & Forensics intégrés</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
