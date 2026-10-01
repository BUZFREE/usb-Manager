import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface UsbActivityLog {
  id: string;
  timestamp: string;
  hostname: string;
  ip: string;
  user: string;
  deviceModel: string;
  serialNumber: string;
  hardwareId: string;
  action: 'BLOCKED' | 'READ_ONLY' | 'EXEC_BLOCKED' | 'ALLOWED';
  policyEnforced: string;
  riskRating: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  complianceRef: string;
}

export function exportCompliancePdf(
  logs: UsbActivityLog[],
  auditMetadata: {
    auditorName: string;
    organization: string;
    dateGenerated: string;
    totalEvents: number;
    blockedCount: number;
    allowedCount: number;
    readOnlyCount: number;
  }
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner (Dark Blue)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Cyan accent line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RAPPORT D\'AUDIT DE CONFORMITÉ & TRAÇABILITÉ DES FLUX USB', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Organisation : ${auditMetadata.organization}  |  Classification : CONFIDENTIEL DSI / RSSI  |  Réf : SEC-USB-${new Date().getFullYear()}`,
    14,
    19
  );

  doc.setTextColor(6, 182, 212);
  doc.text(`Généré le : ${auditMetadata.dateGenerated}`, pageWidth - 14, 19, { align: 'right' });

  // 2. Metadata / Context Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 32, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('CADRE RÉGLEMENTAIRE & PÉRIMÈTRE D\'AUDIT :', 18, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    '• Référentiels : ANSSI Guide d\'Hygiène Informatique (Règle 18) | ISO/IEC 27001:2022 (Mesure A.8.10) | Directive NIS 2 (Art. 21)',
    18,
    44
  );
  doc.text(
    '• Cibles : Flotte de postes clients Windows 10/11 & Serveurs Active Directory. Stratégie GPO RemovableStorageDevices et USBSTOR.',
    18,
    49
  );

  // 3. KPI Statistics Cards
  const cardY = 58;
  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardHeight = 16;

  // Card 1: Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ÉVÉNEMENTS', 18, cardY + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(auditMetadata.totalEvents), 18, cardY + 12);

  // Card 2: Bloqués (Red)
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14 + cardWidth + 3, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('TENTATIVES BLOQUÉES', 14 + cardWidth + 7, cardY + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(String(auditMetadata.blockedCount), 14 + cardWidth + 7, cardY + 12);

  // Card 3: Lecture Seule (Amber)
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(14 + (cardWidth + 3) * 2, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 98, 7);
  doc.text('LECTURE SEULE (ANTI-FUITE)', 14 + (cardWidth + 3) * 2 + 4, cardY + 5);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(String(auditMetadata.readOnlyCount), 14 + (cardWidth + 3) * 2 + 4, cardY + 12);

  // Card 4: Clavier & Souris HID (Green)
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14 + (cardWidth + 3) * 3, cardY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('SOURIS & CLAVIER HID', 14 + (cardWidth + 3) * 3 + 4, cardY + 5);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('100% PRÉSERVÉS', 14 + (cardWidth + 3) * 3 + 4, cardY + 12);

  // 4. Activity Logs Table
  const tableRows = logs.map((log) => [
    log.timestamp,
    `${log.hostname}\n(${log.ip})`,
    log.user,
    `${log.deviceModel}\nS/N: ${log.serialNumber}`,
    log.action === 'BLOCKED'
      ? 'BLOQUÉ TOTAL'
      : log.action === 'READ_ONLY'
      ? 'LECTURE SEULE'
      : log.action === 'EXEC_BLOCKED'
      ? 'EXEC BLOQUÉE'
      : 'AUTORISÉ (WL)',
    log.policyEnforced,
    log.riskRating,
    log.complianceRef,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [
      [
        'Date / Heure',
        'Poste Client & IP',
        'Session Utilisateur',
        'Périphérique USB & S/N',
        'Action Appliquée',
        'Règle de Sécurité / GPO',
        'Risque',
        'Référentiel',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 28 },
      2: { cellWidth: 24 },
      3: { cellWidth: 55 },
      4: { cellWidth: 28, fontStyle: 'bold' },
      5: { cellWidth: 50 },
      6: { cellWidth: 22, fontStyle: 'bold' },
      7: { cellWidth: 32 },
    },
    didParseCell: (data) => {
      // Color status cells
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.includes('BLOQUÉ')) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        } else if (text.includes('LECTURE')) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else if (text.includes('AUTORISÉ')) {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        }
      }
      if (data.section === 'body' && data.column.index === 6) {
        const risk = String(data.cell.raw);
        if (risk === 'CRITIQUE') data.cell.styles.textColor = [225, 29, 72];
        else if (risk === 'ELEVE') data.cell.styles.textColor = [234, 88, 12];
        else if (risk === 'MOYEN') data.cell.styles.textColor = [202, 138, 4];
        else data.cell.styles.textColor = [22, 163, 74];
      }
    },
    margin: { left: 14, right: 14, bottom: 26 },
  });

  // 5. Footer & Signatures Block on last page
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  const signY = Math.min(finalY + 8, pageHeight - 24);

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, signY, pageWidth - 28, 16, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('VISA DE VALIDATION DU RESPONSABLE SÉCURITÉ (RSSI) :', 18, signY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Auditeur désigné : ${auditMetadata.auditorName}`, 18, signY + 11);

  doc.text('VISA DIRECTION DES SYSTÈMES D\'INFORMATION (DSI) :', pageWidth / 2 + 10, signY + 5);
  doc.text('Signature & Cachet : [DOCUMENT VALIDÉ ET HORODATÉ]', pageWidth / 2 + 10, signY + 11);

  // Bottom footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `WinLock USB & GPO Manager - Rapport d'audit de sécurité conforme ANSSI / ISO 27001  |  Page ${i} sur ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  doc.save(`Rapport_Audit_USB_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportComplianceCsv(
  logs: UsbActivityLog[],
  auditMetadata: {
    organization: string;
    dateGenerated: string;
    auditorName: string;
  }
) {
  // UTF-8 BOM so Excel opens accents properly without garbled characters
  const BOM = '\uFEFF';

  let csv = BOM;
  csv += `# RAPPORT D'AUDIT DE CONFORMITE - TRAÇABILITE DES FLUX USB (ANSSI / ISO 27001)\n`;
  csv += `# Organisation : ${auditMetadata.organization}\n`;
  csv += `# Date de generation : ${auditMetadata.dateGenerated}\n`;
  csv += `# Auditeur / RSSI : ${auditMetadata.auditorName}\n`;
  csv += `# Total des evenements : ${logs.length}\n`;
  csv += `# --------------------------------------------------------------------------------\n`;
  csv += `Date et Heure;Poste Client;Adresse IP;Utilisateur Session;Modele Peripherique USB;Numero de Serie;Hardware ID;Action Appliquee;Regle GPO;Niveau de Risque;Article de Conformite\n`;

  for (const log of logs) {
    csv += `"${log.timestamp}";"${log.hostname}";"${log.ip}";"${log.user}";"${log.deviceModel}";"${log.serialNumber}";"${log.hardwareId}";"${log.action}";"${log.policyEnforced}";"${log.riskRating}";"${log.complianceRef}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Logs_Activite_USB_Conformite_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ConnectedUsbDevice {
  id: string;
  vendorId: string;
  productId: string;
  serialNumber: string;
  deviceModel: string;
  manufacturer: string;
  deviceClass: 'MASS_STORAGE' | 'HID_MOUSE' | 'HID_KEYBOARD' | 'AUDIO' | 'PRINTER' | 'COMMUNICATION' | 'HUB';
  deviceClassName: string;
  pnpDevicePath: string;
  portLocation: string;
  driverService: string;
  guidClass: string;
  securityVerdict: 'BLOQUÉ' | 'LECTURE_SEULE' | 'PROTÉGÉ_HID' | 'AUTORISÉ_WL';
  busSpeed: string;
  powerDraw: string;
}

export function exportConnectedDevicesJson(
  devices: ConnectedUsbDevice[],
  metadata: {
    hostname: string;
    os: string;
    scanDate: string;
    auditor: string;
  }
) {
  const exportPayload = {
    reportTitle: "Rapport d'Audit Matériel - Périphériques USB Connectés au Système",
    scanMetadata: {
      hostname: metadata.hostname,
      operatingSystem: metadata.os,
      scanTimestamp: metadata.scanDate,
      auditedBy: metadata.auditor,
      totalConnectedDevices: devices.length,
      storageDevicesCount: devices.filter((d) => d.deviceClass === 'MASS_STORAGE').length,
      hidDevicesCount: devices.filter((d) => d.deviceClass === 'HID_MOUSE' || d.deviceClass === 'HID_KEYBOARD').length,
    },
    connectedDevices: devices.map((d) => ({
      vendorId: d.vendorId,
      productId: d.productId,
      serialNumber: d.serialNumber,
      deviceModel: d.deviceModel,
      manufacturer: d.manufacturer,
      deviceClass: d.deviceClass,
      deviceClassName: d.deviceClassName,
      pnpDevicePath: d.pnpDevicePath,
      portLocation: d.portLocation,
      driverService: d.driverService,
      guidClass: d.guidClass,
      securityVerdict: d.securityVerdict,
      busSpeed: d.busSpeed,
      powerDraw: d.powerDraw,
    })),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Inventaire_USB_Connectes_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportConnectedDevicesCsv(
  devices: ConnectedUsbDevice[],
  metadata: {
    hostname: string;
    scanDate: string;
  }
) {
  const BOM = '\uFEFF';
  let csv = BOM;
  csv += `# INVENTAIRE COMPLET DES PERIPHERIQUES USB CONNECTES AU SYSTEME\n`;
  csv += `# Machine hôte : ${metadata.hostname}\n`;
  csv += `# Date d'inventaire : ${metadata.scanDate}\n`;
  csv += `# Total des périphériques découverts : ${devices.length}\n`;
  csv += `# --------------------------------------------------------------------------------\n`;
  csv += `VendorID;ProductID;Numero_de_Serie;Nom_Peripherique;Fabricant;Classe_Materielle;Pilote_Windows;Port_Emplacement;Vitesse_Bus;Consommation;Verdict_Securite;GUID_Classe\n`;

  for (const d of devices) {
    csv += `"${d.vendorId}";"${d.productId}";"${d.serialNumber}";"${d.deviceModel}";"${d.manufacturer}";"${d.deviceClassName}";"${d.driverService}";"${d.portLocation}";"${d.busSpeed}";"${d.powerDraw}";"${d.securityVerdict}";"${d.guidClass}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Inventaire_USB_Connectes_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFleetInventoryCsv(
  computers: Array<{
    id: string;
    hostname: string;
    ip: string;
    macAddress: string;
    nicAdapter?: string;
    domain: string;
    os: string;
    currentPolicy: string;
    status: string;
    lastSync: string;
  }>,
  metadata: {
    organization: string;
    dateGenerated: string;
    auditor: string;
  }
) {
  const BOM = '\uFEFF';
  let csv = BOM;
  csv += `# BORDEREAU OFFICIEL D'INVENTAIRE DU PARC INFORMATIQUE (NOMS REELS, ADRESSES MAC & IP)\n`;
  csv += `# Organisation : ${metadata.organization}\n`;
  csv += `# Date de generation : ${metadata.dateGenerated}\n`;
  csv += `# Responsable d'inventaire : ${metadata.auditor}\n`;
  csv += `# Total des machines recensees : ${computers.length}\n`;
  csv += `# --------------------------------------------------------------------------------\n`;
  csv += `Nom_Reel_Hostname;Adresse_IP;Adresse_MAC;Carte_Reseau_NIC;Domaine_AD;Systeme_Exploitation;Politique_USB_Active;Statut_Reseau;Derniere_Synchro\n`;

  for (const c of computers) {
    csv += `"${c.hostname}";"${c.ip}";"${c.macAddress}";"${c.nicAdapter || 'Ethernet/Wi-Fi standard'}";"${c.domain}";"${c.os}";"${c.currentPolicy}";"${c.status.toUpperCase()}";"${c.lastSync}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Inventaire_Parc_PC_MAC_IP_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportFleetInventoryJson(
  computers: Array<{
    id: string;
    hostname: string;
    ip: string;
    macAddress: string;
    nicAdapter?: string;
    domain: string;
    os: string;
    currentPolicy: string;
    status: string;
    lastSync: string;
  }>,
  metadata: {
    organization: string;
    dateGenerated: string;
    auditor: string;
  }
) {
  const payload = {
    reportTitle: "Bordereau Officiel d'Inventaire Matériel & Réseau du Parc PC",
    metadata: {
      organization: metadata.organization,
      auditor: metadata.auditor,
      dateGenerated: metadata.dateGenerated,
      totalComputers: computers.length,
      onlineComputers: computers.filter((c) => c.status === 'online').length,
    },
    inventory: computers.map((c) => ({
      hostname: c.hostname,
      ipAddress: c.ip,
      macAddress: c.macAddress,
      nicAdapter: c.nicAdapter || 'Contrôleur Réseau Standard',
      domain: c.domain,
      operatingSystem: c.os,
      activeUsbPolicy: c.currentPolicy,
      status: c.status,
      lastSync: c.lastSync,
    })),
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Inventaire_Parc_PC_MAC_IP_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

