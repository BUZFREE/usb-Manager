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
  domain: string;
  os: string;
  currentPolicy: PolicyMode;
  status: 'online' | 'offline' | 'deploying' | 'error';
  lastSync: string;
  selected?: boolean;
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
