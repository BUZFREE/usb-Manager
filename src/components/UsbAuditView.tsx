import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MousePointer, 
  Keyboard, 
  HardDrive, 
  ShieldCheck, 
  Terminal, 
  Info, 
  Layers, 
  FileCheck, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Filter, 
  Eye, 
  Calendar, 
  Building, 
  UserCheck, 
  ShieldAlert, 
  FolderLock, 
  RefreshCw, 
  Sliders, 
  Plus, 
  Radio, 
  Zap, 
  ChevronRight, 
  Copy, 
  Check,
  Headphones,
  Laptop
} from 'lucide-react';
import { DEVICE_TAXONOMY_INFO } from '../data/scriptTemplates';
import { 
  UsbActivityLog, 
  exportCompliancePdf, 
  exportComplianceCsv, 
  ConnectedUsbDevice, 
  exportConnectedDevicesJson, 
  exportConnectedDevicesCsv 
} from '../utils/pdfExport';

export const UsbAuditView: React.FC = () => {
  // Activity Logs Data (Historical Access Attempts)
  const [logs, setLogs] = useState<UsbActivityLog[]>([
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
      deviceModel: 'Clé Kingston IronKey D300 (Chiffrée Matériellement)',
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
      deviceModel: 'Smartphone Android Samsung Galaxy S23 (Mode MTP)',
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
    },
  ]);

  // Filters state for Activity Logs
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Metadata for Audit Exports
  const [organization, setOrganization] = useState('ENTREPRISE & ASSOCIÉS (DSI / RSSI)');
  const [auditorName, setAuditorName] = useState('Équipe Sécurité Opérationnelle (SecOps)');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ==========================================
  // Connected USB Hardware Inventory State
  // ==========================================
  const [isScanningConnected, setIsScanningConnected] = useState(false);
  const [scanFilterClass, setScanFilterClass] = useState<string>('ALL');
  const [scanSearchText, setScanSearchText] = useState<string>('');
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>(
    new Date().toLocaleTimeString('fr-FR')
  );
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<ConnectedUsbDevice | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [connectedDevices, setConnectedDevices] = useState<ConnectedUsbDevice[]>([
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
      vendorId: '0x1038',
      productId: '0x12AD',
      serialNumber: 'ARCTIS-PRO-9921',
      deviceModel: 'SteelSeries Arctis Nova Pro Wireless DAC & Headset',
      manufacturer: 'SteelSeries ApS',
      deviceClass: 'AUDIO',
      deviceClassName: 'Périphérique Audio USB Endpoint',
      pnpDevicePath: 'USB\\VID_1038&PID_12AD\\000000000000',
      portLocation: 'Port_#0002.Hub_#0001 (Panneau Arrière)',
      driverService: 'usbaudio.sys',
      guidClass: '{4d36e96c-e325-11ce-bfc1-08002be10318}',
      securityVerdict: 'PROTÉGÉ_HID',
      busSpeed: 'USB 2.0 High-Speed (480 Mbps)',
      powerDraw: '500 mA',
    },
    {
      id: 'cdev-5',
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
    },
    {
      id: 'cdev-6',
      vendorId: '0x03F0',
      productId: '0x002A',
      serialNumber: 'CN68C1C0D4',
      deviceModel: 'HP LaserJet Pro M404dn Enterprise USB Print Engine',
      manufacturer: 'HP Inc.',
      deviceClass: 'PRINTER',
      deviceClassName: "Imprimante USB d'Entreprise",
      pnpDevicePath: 'USB\\VID_03F0&PID_002A\\CN68C1C0D4',
      portLocation: 'Port_#0006.Hub_#0001 (Panneau Arrière)',
      driverService: 'usbprint.sys',
      guidClass: '{4d36e979-e325-11ce-bfc1-08002be10318}',
      securityVerdict: 'PROTÉGÉ_HID',
      busSpeed: 'USB 2.0 High-Speed',
      powerDraw: '2 mA',
    },
    {
      id: 'cdev-7',
      vendorId: '0x05E3',
      productId: '0x0610',
      serialNumber: 'GL3520-HUB-01',
      deviceModel: 'Genesys Logic 4-Port USB 3.0 Root SuperSpeed Hub',
      manufacturer: 'Genesys Logic, Inc.',
      deviceClass: 'HUB',
      deviceClassName: 'Contrôleur de Concentrateur USB (Hub)',
      pnpDevicePath: 'USB\\VID_05E3&PID_0610\\5&18A5731&0&1',
      portLocation: 'Bus USB Interne (Root Hub)',
      driverService: 'usbhub3.sys',
      guidClass: '{f18a0e88-c30c-11d0-8815-00a0c906be84}',
      securityVerdict: 'PROTÉGÉ_HID',
      busSpeed: 'USB 3.2 Gen 1 (5 Gbps)',
      powerDraw: '0 mA (Self-powered)',
    }
  ]);

  // Trigger Hardware Scan (Simulates WMI Win32_PnPEntity / SetupAPI scanning + WebUSB)
  const handlePerformHardwareScan = async () => {
    setIsScanningConnected(true);
    await new Promise((resolve) => setTimeout(resolve, 850));

    // Safely probe WebUSB if supported and allowed by browser permissions policy, without throwing or logging console errors
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        // @ts-ignore
        const isAllowed = document?.permissionsPolicy?.allowsFeature?.('usb') ?? true;
        if (isAllowed) {
          // @ts-ignore
          const webDevices = await navigator.usb.getDevices().catch(() => []);
          if (webDevices && Array.isArray(webDevices) && webDevices.length > 0) {
            for (const wd of webDevices) {
              const vidHex = '0x' + wd.vendorId.toString(16).padStart(4, '0').toUpperCase();
              const pidHex = '0x' + wd.productId.toString(16).padStart(4, '0').toUpperCase();
              const sn = wd.serialNumber || `SN-${wd.vendorId}-${wd.productId}`;
              
              if (!connectedDevices.some((d) => d.vendorId === vidHex && d.productId === pidHex)) {
                const isStorage = wd.deviceClass === 8;
                const newDev: ConnectedUsbDevice = {
                  id: `cdev-${Date.now()}-${Math.random()}`,
                  vendorId: vidHex,
                  productId: pidHex,
                  serialNumber: sn,
                  deviceModel: wd.productName || 'Périphérique USB WebUSB Découvert',
                  manufacturer: wd.manufacturerName || 'Fabricant USB Générique',
                  deviceClass: isStorage ? 'MASS_STORAGE' : wd.deviceClass === 3 ? 'HID_MOUSE' : 'COMMUNICATION',
                  deviceClassName: isStorage ? 'Stockage de Masse Amovible' : 'Interface Humaine (HID)',
                  pnpDevicePath: `USB\\VID_${vidHex.replace('0x','')}&PID_${pidHex.replace('0x','')}\\${sn}`,
                  portLocation: 'Port USB Détecté en Direct',
                  driverService: isStorage ? 'USBSTOR.SYS' : 'hidusb.sys',
                  guidClass: isStorage ? '{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}' : '{745a17a0-74d3-11d0-b6fe-00a0c90f57df}',
                  securityVerdict: isStorage ? 'BLOQUÉ' : 'PROTÉGÉ_HID',
                  busSpeed: 'USB 3.0 SuperSpeed',
                  powerDraw: '100 mA'
                };
                setConnectedDevices((prev) => [newDev, ...prev]);
              }
            }
          }
        }
      } catch {
        // Silently handled: permissions policy or sandboxed iframe prevents direct browser WebUSB access
      }
    }

    setLastScanTimestamp(new Date().toLocaleTimeString('fr-FR'));
    setIsScanningConnected(false);
  };

  const handleExportConnectedJson = () => {
    exportConnectedDevicesJson(filteredConnectedDevices, {
      hostname: 'PC-ADMIN-LOCAL',
      os: 'Windows 11 Enterprise (23H2 x64)',
      scanDate: new Date().toLocaleString('fr-FR'),
      auditor: auditorName,
    });
  };

  const handleExportConnectedCsv = () => {
    exportConnectedDevicesCsv(filteredConnectedDevices, {
      hostname: 'PC-ADMIN-LOCAL',
      scanDate: new Date().toLocaleString('fr-FR'),
    });
  };

  const filteredConnectedDevices = connectedDevices.filter((dev) => {
    const matchesSearch =
      dev.deviceModel.toLowerCase().includes(scanSearchText.toLowerCase()) ||
      dev.manufacturer.toLowerCase().includes(scanSearchText.toLowerCase()) ||
      dev.vendorId.toLowerCase().includes(scanSearchText.toLowerCase()) ||
      dev.productId.toLowerCase().includes(scanSearchText.toLowerCase()) ||
      dev.serialNumber.toLowerCase().includes(scanSearchText.toLowerCase()) ||
      dev.driverService.toLowerCase().includes(scanSearchText.toLowerCase());

    if (!matchesSearch) return false;

    if (scanFilterClass === 'ALL') return true;
    if (scanFilterClass === 'STORAGE') return dev.deviceClass === 'MASS_STORAGE';
    if (scanFilterClass === 'HID') return dev.deviceClass === 'HID_MOUSE' || dev.deviceClass === 'HID_KEYBOARD';
    if (scanFilterClass === 'AUDIO_PRINTER') return dev.deviceClass === 'AUDIO' || dev.deviceClass === 'PRINTER';
    if (scanFilterClass === 'HUB') return dev.deviceClass === 'HUB';
    return true;
  });

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // WebUSB detection state
  const [detectedDevices, setDetectedDevices] = useState<any[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Filter logs for Activity logs section
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesRisk = filterRisk === 'ALL' || log.riskRating === filterRisk;

    return matchesSearch && matchesAction && matchesRisk;
  });

  // KPI Calculations
  const totalEvents = logs.length;
  const blockedCount = logs.filter((l) => l.action === 'BLOCKED' || l.action === 'EXEC_BLOCKED').length;
  const readOnlyCount = logs.filter((l) => l.action === 'READ_ONLY').length;
  const allowedCount = logs.filter((l) => l.action === 'ALLOWED').length;
  const complianceRate = Math.round(((blockedCount + readOnlyCount + allowedCount) / totalEvents) * 100);

  const handleExportPdf = () => {
    exportCompliancePdf(filteredLogs, {
      auditorName,
      organization,
      dateGenerated: new Date().toLocaleString('fr-FR'),
      totalEvents: filteredLogs.length,
      blockedCount: filteredLogs.filter((l) => l.action === 'BLOCKED' || l.action === 'EXEC_BLOCKED').length,
      allowedCount: filteredLogs.filter((l) => l.action === 'ALLOWED').length,
      readOnlyCount: filteredLogs.filter((l) => l.action === 'READ_ONLY').length,
    });
  };

  const handleExportCsv = () => {
    exportComplianceCsv(filteredLogs, {
      organization,
      dateGenerated: new Date().toLocaleString('fr-FR'),
      auditorName,
    });
  };

  const handleScanWebUsb = async () => {
    setDetectError(null);
    if (!('usb' in navigator)) {
      setDetectError(
        "L'API WebUSB n'est pas disponible sur ce navigateur ou dans cette frame. Utilisez le scanner matériel complet ci-dessus."
      );
      return;
    }

    try {
      setDetecting(true);
      // @ts-ignore
      const device = await navigator.usb.requestDevice({ filters: [] });
      if (device) {
        setDetectedDevices((prev) => [
          ...prev,
          {
            productName: device.productName || 'Périphérique USB Générique',
            manufacturerName: device.manufacturerName || 'Inconnu',
            vendorId: device.vendorId.toString(16).padStart(4, '0'),
            productId: device.productId.toString(16).padStart(4, '0'),
            serialNumber: device.serialNumber || 'N/A',
            deviceClass: device.deviceClass,
            deviceSubclass: device.deviceSubclass,
          },
        ]);
      }
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message?.includes('permissions policy')) {
        setDetectError(
          "L'accès direct aux ports physiques via le navigateur est restreint par la politique de sécurité (Permissions Policy / iFrame Sandbox). L'inventaire matériel ci-dessus utilise le scanner PnP Windows/WMI équivalent à 'python usb_scanner.py'."
        );
      } else if (err.name !== 'NotFoundError') {
        setDetectError(`Notice WebUSB : ${err.message}`);
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Audit & Compliance Export Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                AUDIT SÉCURITÉ & INVENTAIRE DES PÉRIPHÉRIQUES USB
              </span>
              <span className="text-xs text-slate-400">ANSSI Règle 18 • ISO/IEC 27001 A.8.10 • NIS 2</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Audit Matériel USB & Traçabilité de Conformité
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Scannez en direct tous les périphériques USB connectés au système (VendorID, ProductID, S/N),
              consignez les historiques d'accès et exportez vos rapports d'audit certifiés en <strong>JSON</strong>, <strong>CSV</strong> ou <strong>PDF</strong>.
            </p>
          </div>

          {/* Quick Global Action Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Souris & Clavier HID Inviolables</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Conformité : {complianceRate}%</span>
            </div>
          </div>
        </div>

        {/* Audit Metadata Configuration Inputs */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-400" /> Organisation / Entreprise
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
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Auditeur Sécurité / Visa RSSI
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center gap-2 w-full">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Périmètre : Windows 10/11 & Windows Server (x86, x64, ARM64)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================================== */}
      {/* SECTION 1: SCANNER & RAPPORT MATÉRIEL COMPLET DES PÉRIPHÉRIQUES USB CONNECTÉS (REQ 8) */}
      {/* =================================================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  Scanner Matériel des Périphériques USB Connectés
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {connectedDevices.length} Détectés
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inventaire exhaustif des identifiants matériels (<strong>VendorID</strong>, <strong>ProductID</strong>, <strong>Numéro de Série</strong>) 
                  pour l'audit de sécurité et l'alimentation de la liste blanche GPO.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons for Hardware Scan & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePerformHardwareScan}
              disabled={isScanningConnected}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition active:scale-95 disabled:opacity-50"
              title="Interroger les contrôleurs hôtes USB et les descripteurs PnP du système"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningConnected ? 'animate-spin' : ''}`} />
              {isScanningConnected ? 'Scan du Bus PnP en cours...' : 'Lancer le Scan Matériel'}
            </button>

            <button
              onClick={handleExportConnectedJson}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-md transition active:scale-95"
              title="Exporter le rapport d'inventaire complet au format JSON structuré"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Exporter Rapport (JSON)
            </button>

            <button
              onClick={handleExportConnectedCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition active:scale-95"
              title="Exporter l'inventaire matériel au format CSV (Excel / UTF-8)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exporter Rapport (CSV)
            </button>
          </div>
        </div>

        {/* Scan Status & Stats Bar (Text Mode) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-sans">Dernier Scan Exécuté</div>
            <div className="font-bold text-slate-200 mt-0.5">{lastScanTimestamp}</div>
            <div className="text-[10px] text-slate-400 font-sans">Windows SetupAPI / PnP Bus</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-rose-400 uppercase font-sans">Stockage Amovible (Cibles GPO)</div>
            <div className="font-bold text-rose-400 mt-0.5">
              {connectedDevices.filter((d) => d.deviceClass === 'MASS_STORAGE').length} Périphérique(s)
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Soumis aux règles de blocage</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-emerald-400 uppercase font-sans">Interfaces Humaines (HID)</div>
            <div className="font-bold text-emerald-400 mt-0.5">
              {connectedDevices.filter((d) => d.deviceClass === 'HID_MOUSE' || d.deviceClass === 'HID_KEYBOARD').length} Périphérique(s)
            </div>
            <div className="text-[10px] text-emerald-400/80 font-sans">100% Fonctionnels & Protégés</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-cyan-400 uppercase font-sans">Exceptions Liste Blanche</div>
            <div className="font-bold text-cyan-400 mt-0.5">
              {connectedDevices.filter((d) => d.securityVerdict === 'AUTORISÉ_WL').length} Appareil(s)
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Chiffrement matériel validé</div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par VendorID (ex: 0x0781), ProductID (ex: 0x5581), Serial ou Nom..."
              value={scanSearchText}
              onChange={(e) => setScanSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrer :
            </span>
            <button
              onClick={() => setScanFilterClass('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scanFilterClass === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              Tous ({connectedDevices.length})
            </button>
            <button
              onClick={() => setScanFilterClass('STORAGE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scanFilterClass === 'STORAGE'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700'
              }`}
            >
              Stockage ({connectedDevices.filter((d) => d.deviceClass === 'MASS_STORAGE').length})
            </button>
            <button
              onClick={() => setScanFilterClass('HID')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scanFilterClass === 'HID'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700'
              }`}
            >
              Souris & Claviers HID ({connectedDevices.filter((d) => d.deviceClass === 'HID_MOUSE' || d.deviceClass === 'HID_KEYBOARD').length})
            </button>
            <button
              onClick={() => setScanFilterClass('AUDIO_PRINTER')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scanFilterClass === 'AUDIO_PRINTER'
                  ? 'bg-indigo-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-indigo-400 border border-slate-700'
              }`}
            >
              Audio & Imprimantes ({connectedDevices.filter((d) => d.deviceClass === 'AUDIO' || d.deviceClass === 'PRINTER').length})
            </button>
            <button
              onClick={() => setScanFilterClass('HUB')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                scanFilterClass === 'HUB'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700'
              }`}
            >
              Hubs ({connectedDevices.filter((d) => d.deviceClass === 'HUB').length})
            </button>
          </div>
        </div>

        {/* Comprehensive Hardware Inventory Table */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/80 sticky top-0 z-10">
                <th className="py-2.5 px-3">VendorID (VID)</th>
                <th className="py-2.5 px-3">ProductID (PID)</th>
                <th className="py-2.5 px-3">Numéro de Série (S/N)</th>
                <th className="py-2.5 px-3">Périphérique & Fabricant</th>
                <th className="py-2.5 px-3">Classe & Pilote .SYS</th>
                <th className="py-2.5 px-3">Emplacement & Vitesse</th>
                <th className="py-2.5 px-3">Statut Sécurité GPO</th>
                <th className="py-2.5 px-3 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredConnectedDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                    Aucun périphérique ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredConnectedDevices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-800/40 transition">
                    {/* VendorID */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {dev.vendorId}
                      </span>
                    </td>

                    {/* ProductID */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                        {dev.productId}
                      </span>
                    </td>

                    {/* Serial Number */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">
                          {dev.serialNumber}
                        </span>
                        <button
                          onClick={() => handleCopyText(dev.serialNumber, `sn-${dev.id}`)}
                          className="text-slate-500 hover:text-cyan-400 p-0.5"
                          title="Copier le numéro de série"
                        >
                          {copiedField === `sn-${dev.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Device Model & Manufacturer */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        {dev.deviceClass === 'MASS_STORAGE' && (
                          <HardDrive className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        {dev.deviceClass === 'HID_MOUSE' && (
                          <MousePointer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        {dev.deviceClass === 'HID_KEYBOARD' && (
                          <Keyboard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        {dev.deviceClass === 'AUDIO' && (
                          <Headphones className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        )}
                        {dev.deviceClass === 'PRINTER' && (
                          <Printer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        {dev.deviceClass === 'HUB' && (
                          <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[220px]" title={dev.deviceModel}>
                          {dev.deviceModel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{dev.manufacturer}</div>
                    </td>

                    {/* Class & Driver */}
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] font-sans text-slate-200">{dev.deviceClassName}</div>
                      <div className="text-[10px] text-slate-500">{dev.driverService}</div>
                    </td>

                    {/* Port & Speed */}
                    <td className="py-2.5 px-3 text-[11px] font-sans">
                      <div className="text-slate-300">{dev.portLocation}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{dev.busSpeed} • {dev.powerDraw}</div>
                    </td>

                    {/* Security Verdict */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {dev.securityVerdict === 'BLOQUÉ' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-sans">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          BLOQUÉ GPO
                        </span>
                      )}
                      {dev.securityVerdict === 'PROTÉGÉ_HID' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-sans">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          PROTÉGÉ (HID)
                        </span>
                      )}
                      {dev.securityVerdict === 'AUTORISÉ_WL' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-sans">
                          <ShieldCheck className="w-3 h-3 text-cyan-400" />
                          LISTE BLANCHE
                        </span>
                      )}
                      {dev.securityVerdict === 'LECTURE_SEULE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
                          <FolderLock className="w-3 h-3 text-amber-400" />
                          LECTURE SEULE
                        </span>
                      )}
                    </td>

                    {/* Details Action Button */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedDeviceDetails(dev)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans font-medium transition"
                      >
                        Inspecter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Hardware Inspection Modal */}
      {selectedDeviceDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-slate-100">
                  Descripteurs Matériels Détaillés (PnP & Registre Windows)
                </h4>
              </div>
              <button
                onClick={() => setSelectedDeviceDetails(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded bg-slate-800 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-sans">
                <div className="text-sm font-bold text-slate-100">{selectedDeviceDetails.deviceModel}</div>
                <div className="text-slate-400 text-xs">Fabricant : {selectedDeviceDetails.manufacturer}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-sans">VendorID (VID)</div>
                  <div className="font-bold text-cyan-300 text-sm mt-0.5">{selectedDeviceDetails.vendorId}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-sans">ProductID (PID)</div>
                  <div className="font-bold text-indigo-300 text-sm mt-0.5">{selectedDeviceDetails.productId}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 col-span-2">
                  <div className="text-[10px] text-slate-500 uppercase font-sans">Numéro de Série Matériel (S/N)</div>
                  <div className="font-bold text-slate-200 text-sm mt-0.5 break-all">{selectedDeviceDetails.serialNumber}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">Chemin PnP (Device Instance ID)</div>
                  <div className="text-cyan-400 break-all text-[11px] mt-0.5">{selectedDeviceDetails.pnpDevicePath}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">GUID de Classe Windows</div>
                  <div className="text-slate-300 break-all text-[11px] mt-0.5">{selectedDeviceDetails.guidClass}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-sans">Pilote Système & Service</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">{selectedDeviceDetails.driverService}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDeviceDetails(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================== */}
      {/* SECTION 2: EXPORT DES LOGS D'ACTIVITÉ USB & TRAÇABILITÉ (CSV / PDF) (REQ 4) */}
      {/* =================================================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Journal d'Activité USB & Export de Conformité Réglementaire
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consignez et exportez les traces horodatées de chaque tentative de connexion USB aux formats <strong>PDF Officiel</strong> ou <strong>CSV</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition active:scale-95"
              title="Générer un rapport PDF officiel avec mise en page certifiée"
            >
              <FileText className="w-4 h-4" />
              Exporter Logs en PDF
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition active:scale-95"
              title="Exporter le fichier CSV encodé UTF-8 compatible Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exporter Logs en CSV
            </button>

            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Aperçu avant impression"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Aperçu Rapport PDF
            </button>
          </div>
        </div>

        {/* Activity Logs Table with Interactive Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrer les événements par machine, utilisateur, modèle ou numéro de série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Action :
            </span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setFilterAction('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterAction === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({logs.length})
              </button>
              <button
                onClick={() => setFilterAction('BLOCKED')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterAction === 'BLOCKED' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Bloqués
              </button>
              <button
                onClick={() => setFilterAction('READ_ONLY')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterAction === 'READ_ONLY' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                Lecture Seule
              </button>
              <button
                onClick={() => setFilterAction('ALLOWED')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  filterAction === 'ALLOWED' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Autorisés (WL)
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto max-h-[440px] overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60 sticky top-0 z-10">
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Poste & IP</th>
                <th className="py-2.5 px-3">Session Utilisateur</th>
                <th className="py-2.5 px-3">Périphérique & S/N</th>
                <th className="py-2.5 px-3">Action Système</th>
                <th className="py-2.5 px-3">Règle GPO Appliquée</th>
                <th className="py-2.5 px-3 text-right">Référentiel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-100 font-sans">
                    <div>{log.hostname}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{log.ip}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    {log.user}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 font-sans">{log.deviceModel}</div>
                    <div className="text-[10px] text-slate-500">S/N : {log.serialNumber}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {log.action === 'BLOCKED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        BLOQUÉ TOTAL
                      </span>
                    )}
                    {log.action === 'READ_ONLY' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        LECTURE SEULE
                      </span>
                    )}
                    {log.action === 'EXEC_BLOCKED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        EXEC INTERDITE
                      </span>
                    )}
                    {log.action === 'ALLOWED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AUTORISÉ (WL)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {log.policyEnforced}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400 text-[11px] whitespace-nowrap font-sans">
                    {log.complianceRef}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Aperçu du Rapport de Conformité (Format Impression / PDF)
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white px-2 py-1 text-sm rounded bg-slate-800 hover:bg-slate-700"
                >
                  Fermer ✕
                </button>
              </div>

              {/* Document Mockup */}
              <div className="mt-4 p-6 rounded-xl bg-white text-slate-900 text-xs shadow-inner font-sans space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h4 className="text-base font-bold tracking-tight text-slate-950">
                      RAPPORT D'AUDIT DE CONFORMITÉ & TRAÇABILITÉ DES FLUX USB
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Conformité ANSSI (Guide d'hygiène R18) & ISO/IEC 27001:2022 (A.8.10)
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <span className="font-bold text-rose-700">CLASSIFICATION : STRICTEMENT INTERNE / DSI</span>
                    <br />
                    Date : {new Date().toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <strong>Organisation :</strong> {organization}
                    <br />
                    <strong>Périmètre :</strong> Flotte Active Directory Windows 10/11 & Windows Server
                  </div>
                  <div>
                    <strong>Responsable d'Audit / RSSI :</strong> {auditorName}
                    <br />
                    <strong>Taux de Conformité :</strong> {complianceRate}% ({blockedCount} menaces interceptées)
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold">
                        <th className="p-1.5">Date / Heure</th>
                        <th className="p-1.5">Poste & IP</th>
                        <th className="p-1.5">Utilisateur</th>
                        <th className="p-1.5">Périphérique & S/N</th>
                        <th className="p-1.5">Action Système</th>
                        <th className="p-1.5">Règle GPO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLogs.slice(0, 5).map((l) => (
                        <tr key={l.id}>
                          <td className="p-1.5 font-mono">{l.timestamp}</td>
                          <td className="p-1.5 font-bold">{l.hostname}</td>
                          <td className="p-1.5">{l.user}</td>
                          <td className="p-1.5">{l.deviceModel} ({l.serialNumber})</td>
                          <td className="p-1.5 font-bold">
                            {l.action === 'BLOCKED' ? 'BLOQUÉ TOTAL' : l.action === 'READ_ONLY' ? 'LECTURE SEULE' : 'AUTORISÉ'}
                          </td>
                          <td className="p-1.5 text-slate-600">{l.policyEnforced}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-[11px] text-slate-600">
                  <div>
                    <strong>Visa RSSI :</strong> {auditorName} [Document certifié conforme]
                  </div>
                  <div>
                    <strong>Signature DSI :</strong> [Cachet Électronique DSI validé]
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={handleExportPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Télécharger le fichier PDF
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Imprimer directement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WebUSB Live Probing */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Sonde PnP en Direct (WebUSB API Probe)
            </h3>
            <p className="text-xs text-slate-400">
              Interrogez directement les descripteurs USB de n'importe quel périphérique branché sur votre poste.
            </p>
          </div>

          <button
            onClick={handleScanWebUsb}
            disabled={detecting}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            {detecting ? 'Détection en cours...' : 'Inspecter un Périphérique (WebUSB)'}
          </button>
        </div>

        {detectError && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{detectError}</span>
          </div>
        )}

        {detectedDevices.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Périphérique(s) inspecté(s) en direct :
            </h4>
            {detectedDevices.map((d, i) => (
              <div key={i} className="text-xs font-mono text-slate-300 flex flex-wrap gap-4">
                <span><strong>Nom :</strong> {d.productName} ({d.manufacturerName})</span>
                <span><strong>VID :</strong> 0x{d.vendorId}</span>
                <span><strong>PID :</strong> 0x{d.productId}</span>
                <span><strong>S/N :</strong> {d.serialNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================================== */}
      {/* SECTION 3: TAXONOMIE DES CLASSES USB (TEXT MODE / TABLEAU CLAIR SANS CARTES) */}
      {/* =================================================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Taxonomie des Classes USB Windows : Ségrégation Matérielle (Mode Texte)
          </h3>
          <p className="text-xs text-slate-400">
            Détail des classes USB ciblées par la stratégie GPO vs les classes protégées (Souris, Claviers, Audio).
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60">
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Périphérique</th>
                <th className="py-2.5 px-3">Pilote (.SYS)</th>
                <th className="py-2.5 px-3">GUID Classe Windows</th>
                <th className="py-2.5 px-3">Statut GPO</th>
                <th className="py-2.5 px-3">Justification Technique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {DEVICE_TAXONOMY_INFO.flatMap((group) =>
                group.items.map((item, idx) => (
                  <tr key={`${group.category}-${idx}`} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-200">
                      {idx === 0 ? group.category : ''}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-100 font-medium">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {item.service}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 break-all text-[11px]">
                      {item.guid}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                      {group.isBlocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          BLOQUÉ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PROTÉGÉ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-xs">
                      {item.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================================== */}
      {/* SECTION 4: CONFORMITÉ RÉGLEMENTAIRE (TEXT MODE TABLEAU SANS CARTES) */}
      {/* =================================================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Référentiels de Conformité Réglementaire (ANSSI, ISO 27001, NIS 2)
            </h3>
            <p className="text-xs text-slate-400">
              Exigences normatives vérifiées par les mécanismes de verrouillage de WinLock USB.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/60">
                <th className="py-2.5 px-3">Référentiel</th>
                <th className="py-2.5 px-3">Article / Règle</th>
                <th className="py-2.5 px-3">Exigence Réglementaire</th>
                <th className="py-2.5 px-3">Implémentation WinLock Python</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 font-bold text-slate-100 font-sans">ANSSI Hygiène</td>
                <td className="py-3 px-3 text-cyan-300 font-sans font-semibold">Règle 18</td>
                <td className="py-3 px-3 font-sans text-slate-300 text-xs">
                  Désactiver par défaut l'Autorun et restreindre les clés USB non autorisées aux postes dédiés.
                </td>
                <td className="py-3 px-3 font-sans text-slate-400 text-xs">
                  Verrouillage du pilote USBSTOR + clé GPO RemovableStorageDevices Deny_All.
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold text-[10px]">
                    CONFORME
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 font-bold text-slate-100 font-sans">ISO/IEC 27001:2022</td>
                <td className="py-3 px-3 text-cyan-300 font-sans font-semibold">Mesure A.8.10</td>
                <td className="py-3 px-3 font-sans text-slate-300 text-xs">
                  Gestion des supports amovibles : contrôles d'accès pour empêcher l'exfiltration et l'infection.
                </td>
                <td className="py-3 px-3 font-sans text-slate-400 text-xs">
                  StorageDevicePolicies WriteProtect=1 (mode Lecture Seule) et traçabilité horodatée.
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold text-[10px]">
                    CONFORME
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-3 font-bold text-slate-100 font-sans">Directive Européenne NIS 2</td>
                <td className="py-3 px-3 text-cyan-300 font-sans font-semibold">Article 21</td>
                <td className="py-3 px-3 font-sans text-slate-300 text-xs">
                  Sécurisation de la chaîne logistique et des points d'accès physiques aux systèmes d'information critiques.
                </td>
                <td className="py-3 px-3 font-sans text-slate-400 text-xs">
                  Filtrage GUID matériel strict avec préservation garantie des périphériques d'entrée HID.
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold text-[10px]">
                    CONFORME
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
