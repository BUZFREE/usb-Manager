export type EventType = 'PLUG' | 'UNPLUG' | 'POLICY_UPDATE' | 'ALERT';

export type PortStatus = 'EMPTY' | 'BLOCKED_STORAGE' | 'READ_ONLY_STORAGE' | 'ALLOWED_STORAGE' | 'SAFE_HID';

export interface UsbPortState {
  id: string;
  name: string;
  portLabel: string;
  busType: 'USB 3.2 Gen 2' | 'USB 3.0' | 'USB 2.0' | 'USB-C Thunderbolt';
  location: 'Façade Avant (Front Panel)' | 'Panneau Arrière (Motherboard Rear)' | 'Hub Docking Station';
  status: PortStatus;
  connectedDevice?: {
    model: string;
    serial: string;
    vidPid: string;
    classType: string;
  };
}

export interface RealtimeUsbEvent {
  id: string;
  eventType: EventType;
  timestamp: string;
  timestampMs: number;
  hostname: string;
  portLabel: string;
  deviceModel: string;
  deviceType: 'STORAGE' | 'KEYBOARD' | 'MOUSE' | 'AUDIO' | 'PHONE';
  serialNumber: string;
  hardwareId: string;
  action: 'BLOCKED' | 'READ_ONLY' | 'ALLOWED' | 'HID_PASSTHROUGH';
  statusMessage: string;
  reactionTimeMs: number;
  risk: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
}

export interface SocketConnectionState {
  connected: boolean;
  serverUrl: string;
  transport: 'WEBSOCKET' | 'SIMULATION_QUEUE';
  eventsReceivedCount: number;
  lastHeartbeat: string;
  daemonPid?: number;
}
