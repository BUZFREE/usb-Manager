import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  UserCheck, 
  Calendar, 
  Cpu, 
  HardDrive, 
  Layers, 
  Zap, 
  Search, 
  Eye, 
  Check, 
  Copy, 
  AlertTriangle,
  MousePointer,
  Keyboard,
  Globe,
  FileCode
} from 'lucide-react';
import { 
  exportCompliancePdf, 
  exportComplianceCsv, 
  exportConnectedDevicesJson, 
  exportConnectedDevicesCsv,
  exportFleetInventoryCsv,
  exportFleetInventoryJson,
  UsbActivityLog,
  ConnectedUsbDevice
} from '../utils/pdfExport';
import { downloadText } from '../utils/zipGenerator';
import { NetworkComputer, PolicyMode } from '../types/usbPolicy';
import { useLocalMachine } from '../context/LocalMachineContext';

interface ReportsPrintCenterViewProps {
  policyMode: PolicyMode;
  computers?: NetworkComputer[];
}

export const ReportsPrintCenterView: React.FC<ReportsPrintCenterViewProps> = ({
  policyMode,
  computers = []
}) => {
  const { localMachine } = useLocalMachine();

  // Global Report Metadata
  const [organization, setOrganization] = useState('ENTREPRISE & ASSOCIÉS (DSI / RSSI)');
  const [auditorName, setAuditorName] = useState('Équipe Sécurité Opérationnelle (SecOps)');
  const [documentRef, setDocumentRef] = useState(`SEC-USB-ETAT-${new Date().getFullYear()}`);
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('fr-FR'));

  // Selected Report Type
  const [activeReportTab, setActiveReportTab] = useState<
    'COMPLIANCE_AUDIT' | 'CONNECTED_INVENTORY' | 'EVENT_LOGS' | 'HID_CERTIFICATE' | 'NETWORK_FLEET'
  >('COMPLIANCE_AUDIT');

  // Activity logs sample data
  const [activityLogs] = useState<UsbActivityLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-29 09:14:22',
      hostname: 'PC-DIRECTION01',
      ip: '192.168.10.12',
      user: 'CORP\\jdupont',
      deviceModel: 'Clé USB SanDisk Ultra 64GB USB 3.0',
      serialNumber: '4C530001220412117582',
      hardwareId: 'USBSTOR\\DiskSanDisk_Ultra___________1.00',
      action: 'BLOCKED',
      policyEnforced: 'GPO RemovableStorageDevices (Deny_All = 1)',
      riskRating: 'ELEVE',
      complianceRef: 'ISO 27001 A.8.10 & ANSSI R18',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-29 08:45:10',
      hostname: 'PC-FINANCE02',
      ip: '192.168.10.18',
      user: 'CORP\\mlefevre',
      deviceModel: 'Disque Dur Externe WD Elements 2TB',
      serialNumber: '57583431413838383134',
      hardwareId: 'USBSTOR\\DiskWD______Elements_25A2___1018',
      action: 'BLOCKED',
      policyEnforced: 'USBSTOR Driver Disable (Start = 4)',
      riskRating: 'CRITIQUE',
      complianceRef: 'ISO 27001 A.8.10 (Data Exfiltration)',
    },
    {
      id: 'log-3',
      timestamp: '2026-09-29 08:30:45',
      hostname: 'PC-COMPTA03',
      ip: '192.168.10.25',
      user: 'CORP\\compta_recettes',
      deviceModel: 'Clé USB Kingston DataTraveler 32GB',
      serialNumber: '0019B9DFE4A5',
      hardwareId: 'USBSTOR\\DiskKingstonDataTraveler_3.0PMAP',
      action: 'READ_ONLY',
      policyEnforced: 'Deny_Write = 1 (Consultation seule autorisée)',
      riskRating: 'MOYEN',
      complianceRef: 'RGPD & Protection Fuite Données',
    },
    {
      id: 'log-4',
      timestamp: '2026-09-29 08:05:14',
      hostname: 'SRV-FILE01',
      ip: '192.168.10.5',
      user: 'CORP\\admin_sys',
      deviceModel: 'Clé Kingston IronKey D300 (Chiffrée)',
      serialNumber: '001A928BC45D',
      hardwareId: 'USBSTOR\\DiskKingstonIronKey_D300___2.00',
      action: 'ALLOWED',
      policyEnforced: 'Exception Liste Blanche (AllowDeviceIDs)',
      riskRating: 'FAIBLE',
      complianceRef: 'Conforme FIPS 140-2 Level 3',
    },
    {
      id: 'log-5',
      timestamp: '2026-09-28 17:22:04',
      hostname: 'PC-ACCUEIL',
      ip: '192.168.10.30',
      user: 'CORP\\hote_accueil',
      deviceModel: 'Smartphone Android Samsung Galaxy S23',
      serialNumber: 'RF8N402B19D',
      hardwareId: 'USB\\VID_04E8&PID_6860&MS_COMP_MTP',
      action: 'BLOCKED',
      policyEnforced: 'WPD Restrictions (GUID {6AC27878...})',
      riskRating: 'ELEVE',
      complianceRef: 'ANSSI R18 (Périphériques Mobiles)',
    },
    {
      id: 'log-6',
      timestamp: '2026-09-28 15:40:18',
      hostname: 'PC-DEV01-LAPTOP',
      ip: '192.168.10.45',
      user: 'CORP\\dev_lead',
      deviceModel: 'Clé USB Corsair Flash Voyager 128GB',
      serialNumber: 'AA00000000000452',
      hardwareId: 'USBSTOR\\DiskCorsair_Flash_Voyager___1.00',
      action: 'EXEC_BLOCKED',
      policyEnforced: 'Deny_Execute = 1 (Lancement binaire interdit)',
      riskRating: 'ELEVE',
      complianceRef: 'NIS 2 Art. 21 (Anti-Ransomware)',
    },
    {
      id: 'log-7',
      timestamp: '2026-09-28 11:15:30',
      hostname: 'PC-COMPTA03',
      ip: '192.168.10.25',
      user: 'CORP\\stagiaire02',
      deviceModel: 'Lecteur de Cartes SD Transcend USB 3.0',
      serialNumber: 'TS-RDF5-1192',
      hardwareId: 'USBSTOR\\DiskTS-RDF5_SD_Transcend____1.00',
      action: 'BLOCKED',
      policyEnforced: 'GPO RemovableStorageDevices (Deny_All = 1)',
      riskRating: 'ELEVE',
      complianceRef: 'ISO 27001 A.8.10',
    }
  ]);

  // Connected devices sample data
  const [connectedDevices] = useState<ConnectedUsbDevice[]>([
    {
      id: 'cdev-1',
      vendorId: '0x0781',
      productId: '0x5581',
      serialNumber: '4C530001290310118221',
      deviceModel: 'SanDisk Ultra Flair USB 3.0 Flash Drive',
      manufacturer: 'SanDisk Corporation',
      deviceClass: 'MASS_STORAGE',
      deviceClassName: 'Stockage de Masse Amovible',
      pnpDevicePath: 'USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00\\4C530001290310118221',
      portLocation: 'Port_#0001.Hub_#0002 (Façade Avant USB 3.0)',
      driverService: 'USBSTOR.SYS',
      guidClass: '{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}',
      securityVerdict: 'BLOQUÉ',
      busSpeed: 'USB 3.2 Gen 1 (5 Gbps)',
      powerDraw: '224 mA',
    },
    {
      id: 'cdev-2',
      vendorId: '0x046D',
      productId: '0xC08B',
      serialNumber: 'HID-LOGI-8812',
      deviceModel: 'Logitech G502 HERO High Performance Gaming Mouse',
      manufacturer: 'Logitech Europe S.A.',
      deviceClass: 'HID_MOUSE',
      deviceClassName: "Souris d'Interface Humaine (HID)",
      pnpDevicePath: 'HID\\VID_046D&PID_C08B&REV_7002&MI_00\\7&3A5348F&0&0000',
      portLocation: 'Port_#0003.Hub_#0001 (Panneau Arrière USB 2.0)',
      driverService: 'mouhid.sys',
      guidClass: '{4d36e96f-e325-11ce-bfc1-08002be10318}',
      securityVerdict: 'PROTÉGÉ_HID',
      busSpeed: 'USB 2.0 High-Speed (480 Mbps)',
      powerDraw: '100 mA',
    },
    {
      id: 'cdev-3',
      vendorId: '0x413C',
      productId: '0x2113',
      serialNumber: 'HID-DELL-0041',
      deviceModel: 'Dell QuietKey KB216 Multimedia USB Keyboard',
      manufacturer: 'Dell Inc.',
      deviceClass: 'HID_KEYBOARD',
      deviceClassName: "Clavier d'Interface Humaine (HID)",
      pnpDevicePath: 'HID\\VID_413C&PID_2113\\6&2B94A7F&0&0000',
      portLocation: 'Port_#0004.Hub_#0001 (Panneau Arrière USB 2.0)',
      driverService: 'kbdhid.sys',
      guidClass: '{4d36e96b-e325-11ce-bfc1-08002be10318}',
      securityVerdict: 'PROTÉGÉ_HID',
      busSpeed: 'USB 1.1 Full-Speed (12 Mbps)',
      powerDraw: '100 mA',
    },
    {
      id: 'cdev-4',
      vendorId: '0x0951',
      productId: '0x1666',
      serialNumber: '001A928BC45D',
      deviceModel: 'Kingston DataTraveler IronKey D300 (Hardware Encrypted)',
      manufacturer: 'Kingston Technology Company Inc.',
      deviceClass: 'MASS_STORAGE',
      deviceClassName: 'Stockage Amovible Chiffré Matériellement',
      pnpDevicePath: 'USBSTOR\\DiskKingstonIronKey_D300___2.00\\001A928BC45D',
      portLocation: 'Port_#0005.Hub_#0001 (Station d\'Accueil Docking)',
      driverService: 'USBSTOR.SYS',
      guidClass: '{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}',
      securityVerdict: 'AUTORISÉ_WL',
      busSpeed: 'USB 3.2 Gen 1 (5 Gbps)',
      powerDraw: '300 mA',
    }
  ]);

  // KPIs
  const totalEvents = activityLogs.length;
  const blockedCount = activityLogs.filter((l) => l.action === 'BLOCKED' || l.action === 'EXEC_BLOCKED').length;
  const allowedCount = activityLogs.filter((l) => l.action === 'ALLOWED').length;
  const readOnlyCount = activityLogs.filter((l) => l.action === 'READ_ONLY').length;
  const complianceRate = Math.round(((blockedCount + readOnlyCount + allowedCount) / totalEvents) * 100);

  // Print Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    exportCompliancePdf(activityLogs, {
      auditorName,
      organization,
      dateGenerated: `${reportDate} à ${new Date().toLocaleTimeString('fr-FR')}`,
      totalEvents,
      blockedCount,
      allowedCount,
      readOnlyCount,
    });
  };

  const handleExportComplianceCsv = () => {
    exportComplianceCsv(activityLogs, {
      organization,
      dateGenerated: reportDate,
      auditorName,
    });
  };

  const handleExportConnectedJson = () => {
    exportConnectedDevicesJson(connectedDevices, {
      hostname: localMachine.hostname,
      os: localMachine.os,
      scanDate: reportDate,
      auditor: auditorName,
    });
  };

  const handleExportConnectedCsv = () => {
    exportConnectedDevicesCsv(connectedDevices, {
      hostname: localMachine.hostname,
      scanDate: reportDate,
    });
  };

  const allFleetForExport = [
    {
      id: 'local-client-host',
      hostname: `${localMachine.hostname} [Poste Client Host]`,
      ip: localMachine.ip,
      macAddress: localMachine.macAddress,
      nicAdapter: localMachine.nicAdapter,
      domain: localMachine.domainOrWorkgroup,
      os: localMachine.os,
      currentPolicy: policyMode,
      status: 'online',
      lastSync: localMachine.lastDetected,
    },
    ...computers,
  ];

  const handleExportFleetCsv = () => {
    exportFleetInventoryCsv(allFleetForExport, {
      organization,
      dateGenerated: reportDate,
      auditor: auditorName,
    });
  };

  const handleExportFleetJson = () => {
    exportFleetInventoryJson(allFleetForExport, {
      organization,
      dateGenerated: reportDate,
      auditor: auditorName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Print Center Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                CENTRE D'IMPRESSION & ÉDITION DES ÉTATS OFFICIELS
              </span>
              <span className="text-xs text-slate-400">Rapports A4 certifiés • Exports PDF / CSV / JSON</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              <Printer className="w-6 h-6 text-cyan-400" />
              Édition & Impression Centralisée des États de Conformité
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Générez, prévisualisez et imprimez l'ensemble des états réglementaires et inventaires matériels 
              pour vos comités de direction, auditeurs externes, le commissariat aux comptes ou l'ANSSI.
            </p>
          </div>

          {/* Quick Universal Print & PDF Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition active:scale-95"
              title="Lancer l'impression directe papier ou PDF du document affiché"
            >
              <Printer className="w-4 h-4" />
              Imprimer l'État Actuel (Ctrl+P)
            </button>

            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition active:scale-95"
              title="Générer et télécharger le rapport PDF certifié"
            >
              <FileText className="w-4 h-4" />
              Générer Rapport PDF Officiel
            </button>
          </div>
        </div>

        {/* Customizable Report Header Metadata Inputs */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" /> Raison Sociale / DSI
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Responsable d'Audit / RSSI
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Référence Documentaire
            </label>
            <input
              type="text"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date d'Édition
            </label>
            <input
              type="text"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveReportTab('COMPLIANCE_AUDIT')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeReportTab === 'COMPLIANCE_AUDIT'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Rapport d'Audit & Traçabilité USB
          </button>

          <button
            onClick={() => setActiveReportTab('CONNECTED_INVENTORY')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeReportTab === 'CONNECTED_INVENTORY'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            2. Fiche d'Inventaire Matériel (VID/PID/Serial)
          </button>

          <button
            onClick={() => setActiveReportTab('HID_CERTIFICATE')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeReportTab === 'HID_CERTIFICATE'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            3. Certificat de Préservation HID (Souris/Clavier)
          </button>

          <button
            onClick={() => setActiveReportTab('EVENT_LOGS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeReportTab === 'EVENT_LOGS'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            4. Relevé Forensique Event Logs (20001 & 20003)
          </button>

          <button
            onClick={() => setActiveReportTab('NETWORK_FLEET')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition ${
              activeReportTab === 'NETWORK_FLEET'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            5. Bordereau de Flotte & Déploiement Réseau
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCUMENT PREVIEW & PRINTABLE PAPER CONTAINER (A4 FORMAT)                  */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-200">
              Aperçu Format Papier Imprimable A4 & Certifié
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Réf : {documentRef}
            </span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer cette Page
            </button>
          </div>
        </div>

        {/* Printable Paper Document Sheet */}
        <div className="print-page bg-white text-slate-950 rounded-xl p-8 sm:p-12 shadow-2xl border border-slate-300 max-w-5xl mx-auto font-sans space-y-6">
          {/* Document Header Banner */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1 flex items-center gap-1">
                <span>CLASSIFICATION : STRICTEMENT CONFIDENTIEL DSI / RSSI</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                {activeReportTab === 'COMPLIANCE_AUDIT' && "Rapport d'Audit de Conformité & Traçabilité USB"}
                {activeReportTab === 'CONNECTED_INVENTORY' && "Fiche d'Inventaire Matériel des Périphériques USB"}
                {activeReportTab === 'HID_CERTIFICATE' && "Certificat d'Intégrité & Préservation des Périphériques HID"}
                {activeReportTab === 'EVENT_LOGS' && "Rapport Forensique des Journaux d'Événements Windows"}
                {activeReportTab === 'NETWORK_FLEET' && "Bordereau de Conformité de la Flotte Active Directory"}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Garantie de conformité réglementaire ANSSI (R18), ISO/IEC 27001 (A.8.10) et Directive Européenne NIS 2
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 font-mono">
              <div className="font-bold text-slate-900 text-sm">Réf : {documentRef}</div>
              <div>Date d'effet : {reportDate}</div>
              <div className="text-[10px] text-slate-500">Document généré par WinLock USB</div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Organisation</span>
              <strong className="text-slate-900">{organization}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Auditeur / Visa</span>
              <strong className="text-slate-900">{auditorName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Politique Active</span>
              <strong className="text-rose-700">
                {policyMode === 'BLOCK_ALL' ? 'BLOCAGE TOTAL (Deny_All)' : policyMode === 'READ_ONLY' ? 'LECTURE SEULE (DLP)' : 'AUTORISÉ'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Taux de Conformité</span>
              <strong className="text-emerald-700 font-bold">{complianceRate}% Conforme</strong>
            </div>
          </div>

          {/* TAB 1: COMPLIANCE AUDIT TABLE */}
          {activeReportTab === 'COMPLIANCE_AUDIT' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">
                1. Relevé des Événements d'Accès et Tentatives Interceptées
              </h3>
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2">Horodatage</th>
                    <th className="p-2">Poste & IP</th>
                    <th className="p-2">Utilisateur</th>
                    <th className="p-2">Périphérique & S/N</th>
                    <th className="p-2">Verdict Système</th>
                    <th className="p-2">Référentiel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[10px] text-slate-600">{log.timestamp}</td>
                      <td className="p-2 font-bold text-slate-900">
                        {log.hostname}
                        <span className="block text-[9px] text-slate-500 font-mono">{log.ip}</span>
                      </td>
                      <td className="p-2 text-slate-700">{log.user}</td>
                      <td className="p-2">
                        <span className="font-semibold text-slate-900">{log.deviceModel}</span>
                        <span className="block text-[9px] text-slate-500 font-mono">S/N : {log.serialNumber}</span>
                      </td>
                      <td className="p-2 font-bold">
                        {log.action === 'BLOCKED' && <span className="text-rose-700">BLOQUÉ TOTAL</span>}
                        {log.action === 'READ_ONLY' && <span className="text-amber-700">LECTURE SEULE</span>}
                        {log.action === 'EXEC_BLOCKED' && <span className="text-indigo-700">EXEC INTERDITE</span>}
                        {log.action === 'ALLOWED' && <span className="text-emerald-700">AUTORISÉ (WL)</span>}
                      </td>
                      <td className="p-2 text-[10px] text-slate-600">{log.complianceRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: CONNECTED HARDWARE INVENTORY TABLE */}
          {activeReportTab === 'CONNECTED_INVENTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Inventaire Exhaustif des Identifiants Matériels Détectés
                </h3>
                <div className="text-xs text-slate-600 font-mono no-print flex gap-2">
                  <button onClick={handleExportConnectedCsv} className="text-cyan-700 hover:underline">
                    Export CSV
                  </button>
                  <span>•</span>
                  <button onClick={handleExportConnectedJson} className="text-cyan-700 hover:underline">
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Host Machine Physical Identification Banner */}
              <div className="bg-slate-50 border border-slate-300 rounded p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-slate-800">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-sans font-bold">Poste Client Audité (Nom Réel)</span>
                  <span className="font-bold text-slate-900">{localMachine.hostname}</span>
                  <span className="block text-[9px] text-slate-500 font-sans">
                    {localMachine.isVerifiedReal ? '✅ Scan Réel Certifié' : '⚠️ Scan en Attente'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-sans font-bold">Adresse IP Locale</span>
                  <span className="font-bold text-emerald-700">{localMachine.ip}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-sans font-bold">Adresse MAC Physique</span>
                  <span className="font-bold text-indigo-700">{localMachine.macAddress}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-sans font-bold">Carte Réseau (NIC)</span>
                  <span className="truncate block text-slate-700" title={localMachine.nicAdapter}>{localMachine.nicAdapter}</span>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2">VendorID</th>
                    <th className="p-2">ProductID</th>
                    <th className="p-2">Numéro de Série</th>
                    <th className="p-2">Modèle & Fabricant</th>
                    <th className="p-2">Classe Système</th>
                    <th className="p-2">Pilote (.SYS)</th>
                    <th className="p-2">Statut GPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                  {connectedDevices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-cyan-900">{d.vendorId}</td>
                      <td className="p-2 font-bold text-indigo-900">{d.productId}</td>
                      <td className="p-2 font-semibold text-slate-900">{d.serialNumber}</td>
                      <td className="p-2 font-sans font-medium text-slate-800">
                        {d.deviceModel}
                        <span className="block text-[9px] text-slate-500 font-sans">{d.manufacturer}</span>
                      </td>
                      <td className="p-2 font-sans">{d.deviceClassName}</td>
                      <td className="p-2">{d.driverService}</td>
                      <td className="p-2 font-sans font-bold">
                        {d.securityVerdict === 'BLOQUÉ' && <span className="text-rose-700">BLOQUÉ GPO</span>}
                        {d.securityVerdict === 'PROTÉGÉ_HID' && <span className="text-emerald-700">PROTÉGÉ HID</span>}
                        {d.securityVerdict === 'AUTORISÉ_WL' && <span className="text-cyan-700">LISTE BLANCHE</span>}
                        {d.securityVerdict === 'LECTURE_SEULE' && <span className="text-amber-700">LECTURE SEULE</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: HID PRESERVATION CERTIFICATE */}
          {activeReportTab === 'HID_CERTIFICATE' && (
            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">
                3. Certificat d'Isolation & Préservation des Périphériques HID
              </h3>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ATTESTATION DE SÉCURITÉ TECHNIQUE FORMELLE
                </div>
                <p>
                  Le soussigné, <strong>{auditorName}</strong>, agissant en qualité d'auditeur pour <strong>{organization}</strong>, 
                  certifie par la présente que la stratégie de verrouillage USB déployée par <em>WinLock USB & GPO Manager</em> 
                  applique un filtrage matériel ciblant exclusivement la classe amovible (<code className="font-mono">{'{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}'}</code>).
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                  Périmètre des classes d'interface humaine déclarées exemptes :
                </h4>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
                  <li><strong>Souris USB :</strong> GUID {'{4d36e96f-e325-11ce-bfc1-08002be10318}'} — Pilote mouhid.sys — Fonctionnement continu garanti.</li>
                  <li><strong>Claviers USB :</strong> GUID {'{4d36e96b-e325-11ce-bfc1-08002be10318}'} — Pilote kbdhid.sys — Fonctionnement continu garanti.</li>
                  <li><strong>Périphériques Audio :</strong> GUID {'{4d36e96c-e325-11ce-bfc1-08002be10318}'} — Pilote usbaudio.sys — Non impacté.</li>
                  <li><strong>Imprimantes USB :</strong> GUID {'{4d36e979-e325-11ce-bfc1-08002be10318}'} — Pilote usbprint.sys — Non impacté.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: EVENT LOGS 20001 & 20003 REPORT */}
          {activeReportTab === 'EVENT_LOGS' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">
                4. Relevé des Journaux d'Événements Windows PnP (Event IDs 20001 & 20003)
              </h3>
              <p className="text-xs text-slate-600">
                Extraction des horodatages précis d'installation et d'association de service sous Microsoft Windows.
              </p>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2">Date / Heure</th>
                    <th className="p-2">Event ID</th>
                    <th className="p-2">Machine & User</th>
                    <th className="p-2">Périphérique & S/N</th>
                    <th className="p-2">Service Pilote</th>
                    <th className="p-2">Code Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[10px]">
                  <tr>
                    <td className="p-2">2026-09-29 09:14:22.180</td>
                    <td className="p-2 font-bold text-cyan-800">20001 (Install)</td>
                    <td className="p-2 font-sans">PC-DIRECTION01 (CORP\jdupont)</td>
                    <td className="p-2">SanDisk Ultra Flair (4C530001290310118221)</td>
                    <td className="p-2">USBSTOR (usbstor.inf)</td>
                    <td className="p-2 text-emerald-700">0x0 (Succès)</td>
                  </tr>
                  <tr>
                    <td className="p-2">2026-09-29 09:14:22.215</td>
                    <td className="p-2 font-bold text-indigo-800">20003 (Service)</td>
                    <td className="p-2 font-sans">PC-DIRECTION01 (CORP\jdupont)</td>
                    <td className="p-2">SanDisk Ultra Flair (4C530001290310118221)</td>
                    <td className="p-2">USBSTOR</td>
                    <td className="p-2 font-bold text-rose-700">0x80070005 (Accès Refusé GPO)</td>
                  </tr>
                  <tr>
                    <td className="p-2">2026-09-29 08:45:10.040</td>
                    <td className="p-2 font-bold text-cyan-800">20001 (Install)</td>
                    <td className="p-2 font-sans">PC-FINANCE02 (CORP\mlefevre)</td>
                    <td className="p-2">WD Elements 2TB (57583431413838383134)</td>
                    <td className="p-2">USBSTOR (usbstor.inf)</td>
                    <td className="p-2 text-emerald-700">0x0 (Succès)</td>
                  </tr>
                  <tr>
                    <td className="p-2">2026-09-29 08:45:10.090</td>
                    <td className="p-2 font-bold text-indigo-800">20003 (Service)</td>
                    <td className="p-2 font-sans">PC-FINANCE02 (CORP\mlefevre)</td>
                    <td className="p-2">WD Elements 2TB (57583431413838383134)</td>
                    <td className="p-2">USBSTOR</td>
                    <td className="p-2 font-bold text-rose-700">0x80070005 (Pilote Start=4)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: NETWORK FLEET TABLE */}
          {activeReportTab === 'NETWORK_FLEET' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  5. Bordereau d'Inventaire Exhaustif du Parc des Postes (Noms Réels, Adresses MAC & IP)
                </h3>
                <div className="text-xs text-slate-600 font-mono no-print flex gap-2">
                  <button onClick={handleExportFleetCsv} className="text-cyan-700 hover:underline">
                    Export CSV
                  </button>
                  <span>•</span>
                  <button onClick={handleExportFleetJson} className="text-cyan-700 hover:underline">
                    Export JSON
                  </button>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-2">Nom Réel (Hostname)</th>
                    <th className="p-2">Adresse IP</th>
                    <th className="p-2">Adresse MAC</th>
                    <th className="p-2">Carte Réseau (NIC)</th>
                    <th className="p-2">Domaine AD</th>
                    <th className="p-2">Système d'Exploitation</th>
                    <th className="p-2">Politique USB</th>
                    <th className="p-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Host Client Row */}
                  <tr className="bg-cyan-50/80 font-mono text-[10px] font-semibold border-b border-cyan-200">
                    <td className="p-2 font-bold font-sans text-cyan-950 text-[11px]">
                      {localMachine.hostname}
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-800 text-[9px] font-sans">
                        [Poste Client Host]
                      </span>
                    </td>
                    <td className="p-2 font-bold text-emerald-800">{localMachine.ip}</td>
                    <td className="p-2 font-bold text-indigo-800">{localMachine.macAddress}</td>
                    <td className="p-2 font-sans text-slate-700 truncate max-w-[130px]" title={localMachine.nicAdapter}>
                      {localMachine.nicAdapter}
                    </td>
                    <td className="p-2 font-sans text-slate-700">{localMachine.domainOrWorkgroup}</td>
                    <td className="p-2 font-sans text-[10px] text-slate-600">{localMachine.os}</td>
                    <td className="p-2 font-sans font-bold text-cyan-900">
                      {policyMode === 'BLOCK_ALL' ? 'BLOQUÉ TOTAL' : policyMode === 'READ_ONLY' ? 'LECTURE SEULE' : 'AUTORISÉ'}
                    </td>
                    <td className="p-2 font-sans text-emerald-700 font-bold">
                      {localMachine.isVerifiedReal ? 'CERTIFIÉ RÉEL' : 'EN ATTENTE'}
                    </td>
                  </tr>
                  {computers.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50 font-mono text-[10px]">
                      <td className="p-2 font-bold font-sans text-slate-900 text-[11px]">{comp.hostname}</td>
                      <td className="p-2 font-bold text-emerald-800">{comp.ip}</td>
                      <td className="p-2 font-bold text-indigo-800">{comp.macAddress}</td>
                      <td className="p-2 font-sans text-slate-600 truncate max-w-[130px]" title={comp.nicAdapter}>
                        {comp.nicAdapter || 'Ethernet/Wi-Fi standard'}
                      </td>
                      <td className="p-2 font-sans text-slate-700">{comp.domain}</td>
                      <td className="p-2 font-sans text-[10px] text-slate-600">{comp.os}</td>
                      <td className="p-2 font-sans font-bold">
                        {comp.currentPolicy === 'BLOCK_ALL' ? (
                          <span className="text-rose-700">BLOQUÉ TOTAL</span>
                        ) : comp.currentPolicy === 'READ_ONLY' ? (
                          <span className="text-amber-700">LECTURE SEULE</span>
                        ) : (
                          <span className="text-emerald-700">AUTORISÉ</span>
                        )}
                      </td>
                      <td className="p-2 font-sans text-emerald-700 font-bold">{comp.status.toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures & Certification Block (Formal Compliance Seal) */}
          <div className="border-t-2 border-slate-900 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-slate-800">
            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 space-y-3">
              <div className="font-bold text-slate-950 uppercase text-[11px]">
                Visa du Responsable de la Sécurité des SI (RSSI) :
              </div>
              <div className="text-[11px] text-slate-600">
                Nom : <strong>{auditorName}</strong>
                <br />
                Date : {reportDate}
                <br />
                Mention : <em>« Vu et certifié conforme aux référentiels ANSSI & ISO 27001 »</em>
              </div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <div className="text-[10px] text-slate-500 italic text-center">[Cachet Électronique & Signature]</div>
            </div>

            <div className="border border-slate-300 p-4 rounded-lg bg-slate-50 space-y-3">
              <div className="font-bold text-slate-950 uppercase text-[11px]">
                Approbation de la Direction des Systèmes d'Information (DSI) :
              </div>
              <div className="text-[11px] text-slate-600">
                Entité : <strong>{organization}</strong>
                <br />
                Périmètre : Ensemble du parc informatique d'entreprise
                <br />
                Mention : <em>« Stratégie déployée et verrouillage effectif vérifié »</em>
              </div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <div className="text-[10px] text-slate-500 italic text-center">[Signature du Directeur DSI]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
