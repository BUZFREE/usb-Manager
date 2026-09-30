import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  HardDrive, 
  FileSpreadsheet, 
  Key, 
  AlertTriangle, 
  FileText, 
  Filter, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Cpu, 
  Layers, 
  Zap, 
  Copy, 
  Check, 
  Terminal, 
  X, 
  FileCode,
  Laptop
} from 'lucide-react';
import { downloadText } from '../utils/zipGenerator';

export interface WindowsUsbEventLog {
  id: string;
  eventId: 20001 | 20003;
  eventChannel: string;
  timestamp: string;
  deviceModel: string;
  manufacturer: string;
  serialNumber: string;
  hardwareId: string;
  driverService: string;
  driverInf: string;
  userAccount: string;
  hostname: string;
  statusCode: string;
  statusVerdict: 'SUCCESS' | 'BLOCKED_GPO' | 'PROTECTED_HID';
  rawMessage: string;
  xmlDetails: string;
}

export interface ForensicsEntry {
  id: string;
  vendor: string;
  model: string;
  serialNumber: string;
  hardwareId: string;
  friendlyName: string;
  firstConnected: string;
  lastConnected: string;
  userAccount: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  whitelisted: boolean;
}

export const UsbForensicsView: React.FC = () => {
  // Navigation between Event Logs and Registry Forensics
  const [activeModuleTab, setActiveModuleTab] = useState<'EVENT_LOGS' | 'REGISTRY'>('EVENT_LOGS');

  // =========================================================================
  // Windows Event Logs State (Event IDs 20001 & 20003)
  // =========================================================================
  const [isScanningEventLogs, setIsScanningEventLogs] = useState(false);
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<'ALL' | '20001' | '20003'>('ALL');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [selectedEventXml, setSelectedEventXml] = useState<WindowsUsbEventLog | null>(null);
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);
  const [lastEventScanTime, setLastEventScanTime] = useState(
    new Date().toLocaleTimeString('fr-FR')
  );

  const [eventLogs, setEventLogs] = useState<WindowsUsbEventLog[]>([
    {
      id: 'evt-20001-1',
      eventId: 20001,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 09:14:22.180',
      deviceModel: 'Clé USB SanDisk Ultra Flair 64GB',
      manufacturer: 'SanDisk Corp.',
      serialNumber: '4C530001290310118221',
      hardwareId: 'USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\jdupont',
      hostname: 'PC-DIRECTION01',
      statusCode: '0x0 (Installation réussie)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "L'installation du périphérique pour USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00\\4C530001290310118221 a réussi avec le pilote usbstor.inf.",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20001</EventID>
    <Version>0</Version>
    <Level>4</Level>
    <Task>1</Task>
    <Opcode>0</Opcode>
    <Keywords>0x4000000000000000</Keywords>
    <TimeCreated SystemTime="2026-09-29T09:14:22.180Z" />
    <EventRecordID>104822</EventRecordID>
    <Channel>Microsoft-Windows-Kernel-PnP/Configuration</Channel>
    <Computer>PC-DIRECTION01.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1013" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00\\4C530001290310118221</Data>
    <Data Name="DriverName">usbstor.inf</Data>
    <Data Name="ClassGuid">{53f5630d-b6bf-11d0-94f2-00a0c91efb8b}</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x0</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20003-1',
      eventId: 20003,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 09:14:22.215',
      deviceModel: 'Clé USB SanDisk Ultra Flair 64GB',
      manufacturer: 'SanDisk Corp.',
      serialNumber: '4C530001290310118221',
      hardwareId: 'USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\jdupont',
      hostname: 'PC-DIRECTION01',
      statusCode: '0x80070005 (Accès Refusé GPO)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "Un service a été associé au périphérique. Nom du service : USBSTOR. Statut : 0x80070005 (Stratégie de groupe RemovableStorageDevices active).",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20003</EventID>
    <TimeCreated SystemTime="2026-09-29T09:14:22.215Z" />
    <Channel>Microsoft-Windows-Kernel-PnP/Configuration</Channel>
    <Computer>PC-DIRECTION01.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1013" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskSanDisk_Ultra_Flair_____1.00\\4C530001290310118221</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="DriverFileName">USBSTOR.SYS</Data>
    <Data Name="Status">0x80070005</Data>
    <Data Name="PolicyBlocked">True</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20001-2',
      eventId: 20001,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 08:45:10.040',
      deviceModel: 'Disque Dur Externe WD Elements 2TB',
      manufacturer: 'Western Digital',
      serialNumber: '57583431413838383134',
      hardwareId: 'USBSTOR\\DiskWD______Elements_25A2___1018',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\mlefevre',
      hostname: 'PC-FINANCE02',
      statusCode: '0x0 (Installation réussie)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "L'installation du périphérique pour USBSTOR\\DiskWD______Elements_25A2___1018\\57583431413838383134 a réussi avec le pilote usbstor.inf.",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20001</EventID>
    <TimeCreated SystemTime="2026-09-29T08:45:10.040Z" />
    <Computer>PC-FINANCE02.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1045" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskWD______Elements_25A2___1018\\57583431413838383134</Data>
    <Data Name="DriverName">usbstor.inf</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x0</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20003-2',
      eventId: 20003,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 08:45:10.090',
      deviceModel: 'Disque Dur Externe WD Elements 2TB',
      manufacturer: 'Western Digital',
      serialNumber: '57583431413838383134',
      hardwareId: 'USBSTOR\\DiskWD______Elements_25A2___1018',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\mlefevre',
      hostname: 'PC-FINANCE02',
      statusCode: '0x80070005 (Accès Refusé GPO)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "Un service a été associé au périphérique. Nom du service : USBSTOR. Statut : 0x80070005 (Pilote désactivé Start=4).",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20003</EventID>
    <TimeCreated SystemTime="2026-09-29T08:45:10.090Z" />
    <Computer>PC-FINANCE02.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1045" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskWD______Elements_25A2___1018\\57583431413838383134</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x80070005</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20001-3',
      eventId: 20001,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 08:05:14.312',
      deviceModel: 'Clé Kingston IronKey D300 (Chiffrée)',
      manufacturer: 'Kingston Technology',
      serialNumber: '001A928BC45D',
      hardwareId: 'USBSTOR\\DiskKingstonIronKey_D300___2.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\admin_sys',
      hostname: 'SRV-FILE01',
      statusCode: '0x0 (Installation réussie)',
      statusVerdict: 'SUCCESS',
      rawMessage: "L'installation du périphérique pour USBSTOR\\DiskKingstonIronKey_D300___2.00\\001A928BC45D a réussi avec le pilote usbstor.inf.",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20001</EventID>
    <TimeCreated SystemTime="2026-09-29T08:05:14.312Z" />
    <Computer>SRV-FILE01.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-500" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskKingstonIronKey_D300___2.00\\001A928BC45D</Data>
    <Data Name="DriverName">usbstor.inf</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x0</Data>
    <Data Name="WhitelistMatch">True</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20003-3',
      eventId: 20003,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 08:05:14.340',
      deviceModel: 'Clé Kingston IronKey D300 (Chiffrée)',
      manufacturer: 'Kingston Technology',
      serialNumber: '001A928BC45D',
      hardwareId: 'USBSTOR\\DiskKingstonIronKey_D300___2.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\admin_sys',
      hostname: 'SRV-FILE01',
      statusCode: '0x0 (Succès - Exception Whitelist)',
      statusVerdict: 'SUCCESS',
      rawMessage: "Un service a été associé au périphérique. Nom du service : USBSTOR. Statut : 0x0 (Autorisé par stratégie d'exception DeviceInstall).",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20003</EventID>
    <TimeCreated SystemTime="2026-09-29T08:05:14.340Z" />
    <Computer>SRV-FILE01.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-500" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskKingstonIronKey_D300___2.00\\001A928BC45D</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x0</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20003-hid',
      eventId: 20003,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-29 08:00:02.110',
      deviceModel: 'Souris Optique Logitech G502 HERO (HID)',
      manufacturer: 'Logitech Europe S.A.',
      serialNumber: 'HID-LOGI-8812',
      hardwareId: 'HID\\VID_046D&PID_C08B&REV_7002&MI_00',
      driverService: 'mouhid',
      driverInf: 'mouhid.inf',
      userAccount: 'AUTORITE NT\\SYSTEM',
      hostname: 'PC-DIRECTION01',
      statusCode: '0x0 (Succès - Pile HID Active)',
      statusVerdict: 'PROTECTED_HID',
      rawMessage: "Un service a été associé au périphérique. Nom du service : mouhid. Statut : 0x0. (Classe d'interface humaine active sans interruption).",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20003</EventID>
    <TimeCreated SystemTime="2026-09-29T08:00:02.110Z" />
    <Computer>PC-DIRECTION01.corp.local</Computer>
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">HID\\VID_046D&PID_C08B&REV_7002&MI_00\\7&3A5348F&0&0000</Data>
    <Data Name="ServiceName">mouhid</Data>
    <Data Name="ClassGuid">{4d36e96f-e325-11ce-bfc1-08002be10318}</Data>
    <Data Name="Status">0x0</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20001-4',
      eventId: 20001,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-28 15:40:18.910',
      deviceModel: 'Clé USB Corsair Flash Voyager 128GB',
      manufacturer: 'Corsair Memory',
      serialNumber: 'AA00000000000452',
      hardwareId: 'USBSTOR\\DiskCorsair_Flash_Voyager___1.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\dev_lead',
      hostname: 'PC-DEV01-LAPTOP',
      statusCode: '0x0 (Installation réussie)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "L'installation du périphérique pour USBSTOR\\DiskCorsair_Flash_Voyager___1.00\\AA00000000000452 a réussi avec le pilote usbstor.inf.",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20001</EventID>
    <TimeCreated SystemTime="2026-09-28T15:40:18.910Z" />
    <Computer>PC-DEV01-LAPTOP.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1090" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskCorsair_Flash_Voyager___1.00\\AA00000000000452</Data>
    <Data Name="DriverName">usbstor.inf</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x0</Data>
  </EventData>
</Event>`
    },
    {
      id: 'evt-20003-4',
      eventId: 20003,
      eventChannel: 'Microsoft-Windows-Kernel-PnP/Configuration',
      timestamp: '2026-09-28 15:40:18.945',
      deviceModel: 'Clé USB Corsair Flash Voyager 128GB',
      manufacturer: 'Corsair Memory',
      serialNumber: 'AA00000000000452',
      hardwareId: 'USBSTOR\\DiskCorsair_Flash_Voyager___1.00',
      driverService: 'USBSTOR',
      driverInf: 'usbstor.inf',
      userAccount: 'CORP\\dev_lead',
      hostname: 'PC-DEV01-LAPTOP',
      statusCode: '0x80070005 (Blocage Exécution)',
      statusVerdict: 'BLOCKED_GPO',
      rawMessage: "Un service a été associé au périphérique. Nom du service : USBSTOR. Statut : 0x80070005 (Deny_Execute actif).",
      xmlDetails: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Kernel-PnP" Guid="{9C205A39-1250-487D-ABD7-E831C62907E2}" />
    <EventID>20003</EventID>
    <TimeCreated SystemTime="2026-09-28T15:40:18.945Z" />
    <Computer>PC-DEV01-LAPTOP.corp.local</Computer>
    <Security UserID="S-1-5-21-3623811015-3361044348-30300820-1090" />
  </System>
  <EventData>
    <Data Name="DeviceInstanceId">USBSTOR\\DiskCorsair_Flash_Voyager___1.00\\AA00000000000452</Data>
    <Data Name="ServiceName">USBSTOR</Data>
    <Data Name="Status">0x80070005</Data>
  </EventData>
</Event>`
    }
  ]);

  // =========================================================================
  // Registry Forensics State (Enum\USBSTOR)
  // =========================================================================
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [history, setHistory] = useState<ForensicsEntry[]>([
    {
      id: 'f-1',
      vendor: 'SanDisk',
      model: 'Ultra Fit 3.1 64GB',
      serialNumber: '4C530001220412117582',
      hardwareId: 'USBSTOR\\DiskSanDisk_Ultra_Fit______1.00',
      friendlyName: 'SanDisk Ultra Fit USB Device',
      firstConnected: '2026-09-12 14:22:10',
      lastConnected: '2026-09-28 09:14:32',
      userAccount: 'CORP\\jdupont',
      riskLevel: 'HIGH',
      whitelisted: false
    },
    {
      id: 'f-2',
      vendor: 'Kingston',
      model: 'DataTraveler IronKey D300',
      serialNumber: '001A928BC45D',
      hardwareId: 'USBSTOR\\DiskKingstonDataTraveler_3.0PMAP',
      friendlyName: 'Kingston DataTraveler IronKey',
      firstConnected: '2026-09-15 08:30:00',
      lastConnected: '2026-09-29 08:05:14',
      userAccount: 'CORP\\direction_sec',
      riskLevel: 'LOW',
      whitelisted: true
    },
    {
      id: 'f-3',
      vendor: 'Western Digital',
      model: 'Elements Portable HDD 2TB',
      serialNumber: '57583431413838383134',
      hardwareId: 'USBSTOR\\DiskWD______Elements_25A2___1018',
      friendlyName: 'WD Elements 25A2 USB Device',
      firstConnected: '2026-09-25 18:40:22',
      lastConnected: '2026-09-25 19:10:05',
      userAccount: 'CORP\\stagiaire01',
      riskLevel: 'CRITICAL',
      whitelisted: false
    },
    {
      id: 'f-4',
      vendor: 'Samsung',
      model: 'Portable SSD T7 1TB',
      serialNumber: 'S5TDNS0N400129B',
      hardwareId: 'USBSTOR\\DiskSamsung_Portable_SSD_T7_0',
      friendlyName: 'Samsung Portable SSD T7',
      firstConnected: '2026-09-18 11:15:45',
      lastConnected: '2026-09-27 16:50:11',
      userAccount: 'CORP\\admin_sys',
      riskLevel: 'MEDIUM',
      whitelisted: false
    }
  ]);

  // Filtering Event Logs
  const filteredEventLogs = eventLogs.filter((evt) => {
    const matchesEventId =
      selectedEventIdFilter === 'ALL' || evt.eventId.toString() === selectedEventIdFilter;

    const matchesSearch =
      evt.deviceModel.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.manufacturer.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.serialNumber.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.hardwareId.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.userAccount.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.hostname.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
      evt.driverService.toLowerCase().includes(eventSearchTerm.toLowerCase());

    return matchesEventId && matchesSearch;
  });

  // Filtering Registry History
  const filteredRegistry = history.filter((item) => {
    const matchesSearch =
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userAccount.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = filterRisk === 'ALL' || item.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Interactive Live Scan of Event Logs
  const handleQueryEventLogs = async () => {
    setIsScanningEventLogs(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastEventScanTime(new Date().toLocaleTimeString('fr-FR'));
    setIsScanningEventLogs(false);
  };

  const toggleWhitelist = (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, whitelisted: !item.whitelisted, riskLevel: !item.whitelisted ? 'LOW' : 'HIGH' } : item
      )
    );
  };

  const handleCopySerial = (serial: string, id: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedSerial(id);
    setTimeout(() => setCopiedSerial(null), 2000);
  };

  // Export Event Logs CSV
  const handleExportEventLogsCsv = () => {
    const BOM = '\uFEFF';
    let csv = BOM;
    csv += `# JOURNAUX D'EVENEMENTS WINDOWS USB (EVENT IDS 20001 & 20003)\n`;
    csv += `# Date d'extraction : ${new Date().toLocaleString('fr-FR')}\n`;
    csv += `# Total des événements : ${filteredEventLogs.length}\n`;
    csv += `Date_Heure;Event_ID;Nature_Evenement;Machine;Utilisateur;Peripherique;Fabricant;Numero_Serie;Service_Pilote;Fichier_INF;Statut_Code;Verdict\n`;

    for (const evt of filteredEventLogs) {
      csv += `"${evt.timestamp}";"${evt.eventId}";"${evt.eventId === 20001 ? 'Installation Pilote (Driver Installation)' : 'Association Service (Service Association)'}";"${evt.hostname}";"${evt.userAccount}";"${evt.deviceModel}";"${evt.manufacturer}";"${evt.serialNumber}";"${evt.driverService}";"${evt.driverInf}";"${evt.statusCode}";"${evt.statusVerdict}"\n`;
    }

    downloadText(csv, `EventLogs_USB_20001_20003_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export Event Logs JSON
  const handleExportEventLogsJson = () => {
    const payload = {
      reportTitle: "Rapport d'Extraction des Journaux d'Événements Windows USB",
      extractedAt: new Date().toISOString(),
      eventIdsAudited: [20001, 20003],
      totalEvents: filteredEventLogs.length,
      events: filteredEventLogs
    };
    downloadText(JSON.stringify(payload, null, 2), `EventLogs_USB_${new Date().toISOString().split('T')[0]}.json`);
  };

  // Export Registry CSV
  const handleExportRegistryCsv = () => {
    const BOM = '\uFEFF';
    const header = 'Fabricant;Modèle;Numéro de Série;Hardware ID;Utilisateur;Première Connexion;Dernière Connexion;Niveau de Risque;Liste Blanche\n';
    const rows = history
      .map(
        (h) =>
          `"${h.vendor}";"${h.model}";"${h.serialNumber}";"${h.hardwareId}";"${h.userAccount}";"${h.firstConnected}";"${h.lastConnected}";"${h.riskLevel}";"${h.whitelisted ? 'OUI' : 'NON'}"`
      )
      .join('\n');
    downloadText(BOM + header + rows, `Rapport_Forensics_USB_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                FORENSIQUE WINDOWS & OBSERVATEUR D'ÉVÉNEMENTS
              </span>
              <span className="text-xs text-slate-400">
                Event IDs 20001 & 20003 • Canal Kernel-PnP • Ruche Enum\USBSTOR
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Investigation Forensique & Traçabilité des Connexions USB
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Retracez l'historique complet et infalsifiable des branchements USB grâce à la corrélation 
              des <strong>Journaux d'Événements Windows (Event IDs 20001 & 20003)</strong> et des artefacts 
              persistants du Registre Windows (<code className="text-cyan-300">HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR</code>).
            </p>
          </div>

          {/* Module Switcher Buttons */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveModuleTab('EVENT_LOGS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition ${
                activeModuleTab === 'EVENT_LOGS'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Event Logs (IDs 20001 & 20003)
            </button>
            <button
              onClick={() => setActiveModuleTab('REGISTRY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition ${
                activeModuleTab === 'REGISTRY'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Registre (Enum\USBSTOR)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: WINDOWS EVENT LOGS (EVENT IDS 20001 & 20003)                    */}
      {/* ========================================================================= */}
      {activeModuleTab === 'EVENT_LOGS' && (
        <div className="space-y-6">
          {/* Technical Explanatory Strip for Event IDs */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Rôle Forensique des Event IDs 20001 et 20003 sous Windows
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dans le journal système et Kernel-PnP, ces deux identifiants constituent la signature formelle de toute insertion USB.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleQueryEventLogs}
                  disabled={isScanningEventLogs}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition active:scale-95 disabled:opacity-50"
                  title="Interroger les journaux d'événements locaux ou distants via PowerShell / WMI"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningEventLogs ? 'animate-spin' : ''}`} />
                  {isScanningEventLogs ? 'Lecture des Event Logs...' : 'Interroger les Event Logs'}
                </button>

                <button
                  onClick={handleExportEventLogsCsv}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-sm transition active:scale-95"
                  title="Exporter les événements au format CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Exporter CSV
                </button>

                <button
                  onClick={handleExportEventLogsJson}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm transition active:scale-95"
                  title="Exporter les événements au format JSON"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Exporter JSON
                </button>
              </div>
            </div>

            {/* Event IDs Definitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs">
                      Event ID 20001
                    </span>
                    Installation Pilote PnP (Driver Installation)
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs font-sans">
                  Généré lors de la <strong>première détection physique</strong> du périphérique ou lors de l'attribution initiale du fichier INF (<code className="text-cyan-300">usbstor.inf</code>). 
                  Il horodate avec certitude l'instant de découverte et le compte utilisateur actif au moment de l'insertion.
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Source : <code>Microsoft-Windows-Kernel-PnP / UserPnp</code>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-xs">
                      Event ID 20003
                    </span>
                    Association & Démarrage Service (Service Association)
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs font-sans">
                  Généré à chaque fois que Windows <strong>associe et lance le service noyau</strong> (<code className="text-indigo-300">USBSTOR</code>). 
                  Permet de tracer chaque session d'utilisation et de détecter immédiatement les rejets par GPO (Code <code className="text-rose-400">0x80070005</code>).
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Service associé : <code>USBSTOR (ou mouhid / kbdhid pour les HID)</code>
                </div>
              </div>
            </div>
          </div>

          {/* Event Logs Filter & Search Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrer par modèle, numéro de série, utilisateur, machine ou service..."
                  value={eventSearchTerm}
                  onChange={(e) => setEventSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Event ID Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filtrer Event ID :
                </span>
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                  <button
                    onClick={() => setSelectedEventIdFilter('ALL')}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      selectedEventIdFilter === 'ALL'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({eventLogs.length})
                  </button>
                  <button
                    onClick={() => setSelectedEventIdFilter('20001')}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      selectedEventIdFilter === '20001'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-cyan-400'
                    }`}
                  >
                    Event 20001 ({eventLogs.filter((e) => e.eventId === 20001).length})
                  </button>
                  <button
                    onClick={() => setSelectedEventIdFilter('20003')}
                    className={`px-3 py-1 rounded-md font-medium transition ${
                      selectedEventIdFilter === '20003'
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'text-slate-400 hover:text-indigo-400'
                    }`}
                  >
                    Event 20003 ({eventLogs.filter((e) => e.eventId === 20003).length})
                  </button>
                </div>
              </div>
            </div>

            {/* Event Logs Table */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/80 sticky top-0 z-10">
                    <th className="py-2.5 px-3">Date & Heure Précise</th>
                    <th className="py-2.5 px-3">ID Événement</th>
                    <th className="py-2.5 px-3">Machine & Utilisateur</th>
                    <th className="py-2.5 px-3">Périphérique & S/N</th>
                    <th className="py-2.5 px-3">Pilote / Service Noyau</th>
                    <th className="py-2.5 px-3">Statut & Verdict</th>
                    <th className="py-2.5 px-3 text-right">XML Brut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredEventLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        Aucun événement ne correspond aux critères de filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredEventLogs.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                        {/* Timestamp */}
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {evt.timestamp}
                        </td>

                        {/* Event ID Badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {evt.eventId === 20001 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-sans">
                              <Cpu className="w-3 h-3 text-cyan-400" />
                              ID 20001 (Install)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans">
                              <Zap className="w-3 h-3 text-indigo-400" />
                              ID 20003 (Service)
                            </span>
                          )}
                        </td>

                        {/* Machine & User */}
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-semibold text-slate-200">{evt.hostname}</div>
                          <div className="text-[10px] text-slate-400">{evt.userAccount}</div>
                        </td>

                        {/* Device & Serial */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-100 font-sans">{evt.deviceModel}</div>
                          <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-mono mt-0.5">
                            <span>S/N : {evt.serialNumber}</span>
                            <button
                              onClick={() => handleCopySerial(evt.serialNumber, evt.id)}
                              className="text-slate-500 hover:text-cyan-400 p-0.5"
                              title="Copier le numéro de série"
                            >
                              {copiedSerial === evt.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Driver / Service */}
                        <td className="py-2.5 px-3">
                          <div className="text-[11px] font-mono text-indigo-300 font-bold">
                            {evt.driverService}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            INF : {evt.driverInf}
                          </div>
                        </td>

                        {/* Status Code */}
                        <td className="py-2.5 px-3 font-sans">
                          {evt.statusVerdict === 'BLOCKED_GPO' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                🛑 REJET GPO
                              </span>
                              <div className="text-[10px] text-rose-400 mt-0.5 font-mono">{evt.statusCode}</div>
                            </div>
                          ) : evt.statusVerdict === 'PROTECTED_HID' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ✅ HID PROTÉGÉ
                              </span>
                              <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">{evt.statusCode}</div>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🟢 SUCCÈS
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{evt.statusCode}</div>
                            </div>
                          )}
                        </td>

                        {/* Raw XML Button */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedEventXml(evt)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans font-medium transition flex items-center gap-1 ml-auto"
                          >
                            <FileCode className="w-3 h-3 text-cyan-400" />
                            Voir XML
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PowerShell & Python Command Terminal Helper */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Commandes d'Extraction Directe des Event IDs 20001 & 20003 sous Windows
            </h4>
            <p className="text-xs text-slate-400">
              Vous pouvez exécuter ces commandes directement sur vos serveurs ou machines cibles pour collecter ces événements :
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="text-cyan-400 font-bold text-[11px] flex items-center justify-between">
                  <span>PowerShell (Get-WinEvent) :</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("Get-WinEvent -FilterHashtable @{LogName='System','Microsoft-Windows-Kernel-PnP/Configuration'; Id=20001,20003} -MaxEvents 50 | Select-Object TimeCreated, Id, Message | Format-Table -AutoSize");
                    }}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copier
                  </button>
                </div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                  <code>{`Get-WinEvent -FilterHashtable @{
  LogName='System','Microsoft-Windows-Kernel-PnP/Configuration';
  Id=20001,20003
} -MaxEvents 50 | Select-Object TimeCreated, Id, Message`}</code>
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="text-indigo-400 font-bold text-[11px] flex items-center justify-between">
                  <span>Python Natif (win32evtlog) :</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("python usb_forensics.py --eventlogs");
                    }}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copier
                  </button>
                </div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed">
                  <code>{`# Exécute l'extraction automatique des Event IDs 20001 & 20003 :
python usb_forensics.py --eventlogs
# Ou avec export JSON :
python usb_forensics.py --eventlogs --json eventlogs.json`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: REGISTRY ARTIFACTS (HKLM\SYSTEM\...\Enum\USBSTOR)               */}
      {/* ========================================================================= */}
      {activeModuleTab === 'REGISTRY' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  Artefacts Persistants de Registre Windows (Enum\USBSTOR)
                </h3>
                <p className="text-xs text-slate-400">
                  Enregistrement permanent de chaque clé USB ayant été branchée sur la machine depuis sa création.
                </p>
              </div>

              <button
                onClick={handleExportRegistryCsv}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-sm transition active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Exporter Registre en CSV
              </button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par modèle, numéro de série ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Risque :
                </span>
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                  {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setFilterRisk(risk)}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        filterRisk === risk
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {risk === 'ALL' ? 'Tous' : risk}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Registry Forensic Table */}
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-950/80 sticky top-0 z-10">
                    <th className="py-2.5 px-3">Périphérique & Fabricant</th>
                    <th className="py-2.5 px-3">Numéro de Série Unique</th>
                    <th className="py-2.5 px-3">Session Utilisateur</th>
                    <th className="py-2.5 px-3">Dernière Connexion</th>
                    <th className="py-2.5 px-3">Évaluation Risque</th>
                    <th className="py-2.5 px-3 text-right">Action Liste Blanche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredRegistry.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-100">{item.friendlyName}</div>
                        <div className="text-[10px] text-slate-500 font-mono break-all">{item.hardwareId}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">
                        {item.serialNumber}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">
                        {item.userAccount}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {item.lastConnected}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.riskLevel === 'CRITICAL' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            CRITIQUE (HDD 2TB)
                          </span>
                        )}
                        {item.riskLevel === 'HIGH' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ÉLEVÉ (Clé Perso)
                          </span>
                        )}
                        {item.riskLevel === 'MEDIUM' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            MOYEN (SSD Externe)
                          </span>
                        )}
                        {item.riskLevel === 'LOW' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            FAIBLE (Chiffrée)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => toggleWhitelist(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition ${
                            item.whitelisted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {item.whitelisted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Approuvée
                            </>
                          ) : (
                            <>
                              <Key className="w-3.5 h-3.5 text-cyan-400" />
                              Whitelist
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* XML Inspection Modal */}
      {selectedEventXml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-base font-bold text-slate-100">
                    Structure XML Officielle - Event ID {selectedEventXml.eventId}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    Canal : {selectedEventXml.eventChannel} • Horodatage : {selectedEventXml.timestamp}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventXml(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 max-h-[380px] overflow-y-auto">
              <pre className="whitespace-pre-wrap leading-relaxed">
                <code>{selectedEventXml.xmlDetails}</code>
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedEventXml.xmlDetails);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-600/40 hover:bg-cyan-600/30 transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier le XML
              </button>

              <button
                onClick={() => setSelectedEventXml(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
