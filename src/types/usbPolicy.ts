export type PolicyMode = 'BLOCK_ALL' | 'READ_ONLY' | 'BLOCK_EXECUTE' | 'UNBLOCKED';

export type PolicyMethod = 'GPO_REMOVABLE' | 'USBSTOR_SERVICE' | 'DEVICE_INSTALL_RESTRICTIONS' | 'HYBRID_MAX_SECURITY';

export interface DeviceCategoryStatus {
  id: string;
  name: string;
  category: 'storage' | 'input' | 'multimedia' | 'network';
  icon: string;
  description: string;
  blockedWhenProtected: boolean;
  driverOrGuid: string;
  statusText: string;
}

export interface WhitelistDevice {
  id: string;
  label: string;
  vendorId: string;
  productId: string;
  hardwareId: string;
  serialNumber: string;
  assignedUser: string;
  dateAdded: string;
  notes?: string;
}

export interface NetworkComputer {
  id: string;
  hostname: string;
  ip: string;
  macAddress: string;
  nicAdapter?: string;
  domain: string;
  os: string;
  currentPolicy: PolicyMode;
  status: 'online' | 'offline' | 'deploying' | 'error';
  lastSync: string;
  selected?: boolean;
}

export interface LocalMachineInfo {
  hostname: string;
  ip: string;
  macAddress: string;
  domainOrWorkgroup: string;
  os: string;
  nicAdapter: string;
  subnetMask: string;
  defaultGateway: string;
  dnsServer: string;
  dhcpEnabled: boolean;
  status: 'online' | 'offline';
  lastDetected: string;
  isVerifiedReal: boolean;
  scanSource: 'LOCAL_SCRIPT_SCAN' | 'MANUAL_ENTRY' | 'BROWSER_PROBE' | 'DEFAULT_UNSCANNED';
  publicIp?: string;
  cpuCores?: number;
  deviceMemoryGb?: number;
  screenResolution?: string;
  detectedUsbDevicesCount?: number;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  target: string;
  action: string;
  result: 'success' | 'warning' | 'error';
  details: string;
}

export interface RegistryKeyPreview {
  path: string;
  valueName: string;
  valueType: 'REG_DWORD' | 'REG_SZ' | 'REG_MULTI_SZ';
  valueData: string | number;
  description: string;
}

export type WifiBlockMode = 
  | 'BLOCK_ALL_EXCEPT_WINBOX' // Bloquer Wi-Fi sauf Winbox MikroTik (Port TCP 8291, UDP 5678 MNDP, winbox.exe)
  | 'SSID_ALLOWLIST_ONLY'     // Autoriser uniquement les SSID MikroTik approuvés
  | 'BLOCK_WIFI_TOTAL'        // Désactivation totale de la carte Wi-Fi
  | 'MONITOR_ONLY'            // Surveillance et détection sans blocage
  | 'UNRESTRICTED';           // Wi-Fi totalement libre

export interface WifiNetworkInfo {
  id: string;
  ssid: string;
  bssid: string;
  signalPercentage: number;
  channel: number;
  band: '2.4 GHz' | '5 GHz' | '6 GHz';
  authType: string;
  encryption: string;
  status: 'CONNECTED' | 'IN_RANGE' | 'BLOCKED' | 'SUSPICIOUS_HOTSPOT';
  isMikrotikDevice?: boolean;
  routerModel?: string;
  ipAddress?: string;
  gateway?: string;
  notes?: string;
}

export interface MikrotikWinboxRule {
  id: string;
  name: string;
  protocol: 'TCP' | 'UDP' | 'APP' | 'IP_RANGE';
  portOrTarget: string;
  direction: 'Inbound' | 'Outbound' | 'Both';
  action: 'Allow' | 'Block';
  description: string;
  enabled: boolean;
  isCriticalForWinbox: boolean;
}

export interface WifiAdapterInfo {
  name: string;
  description: string;
  macAddress: string;
  guid?: string;
  status: 'Up' | 'Down' | 'Disabled';
  connectedSsid?: string;
  ipv4Address?: string;
  gateway?: string;
  isRadioOn: boolean;
}

