import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HeartPulse, 
  ShieldCheck, 
  ShieldAlert, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  Router, 
  Laptop, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ChevronRight, 
  FileText, 
  Radio, 
  Activity, 
  UserCheck, 
  Award,
  Zap,
  MousePointer,
  Keyboard,
  Shield,
  Sun
} from 'lucide-react';

export interface DmeUserSession {
  email: string;
  fullName: string;
  hospital: string;
  role: string;
  connectedAt: string;
  isAuthenticated: boolean;
}

interface DmeWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: DmeUserSession) => void;
  currentSession: DmeUserSession;
}

export const DmeWelcomeModal: React.FC<DmeWelcomeModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  currentSession,
}) => {
  const [email, setEmail] = useState(currentSession.email || 'issaadhassani@gmail.com');
  const [fullName, setFullName] = useState(currentSession.fullName || 'Mr. BAZ AMAR');
  const [hospital, setHospital] = useState(currentSession.hospital || 'CHU Béni Messous - Alger');
  const [role, setRole] = useState(currentSession.role || 'Informaticien Santé / DSI DME');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIconStep, setActiveIconStep] = useState(0);

  // Animated icon showcase representing the project roles (styled for light mode)
  const securityRoles = [
    {
      id: 'dme',
      title: 'Plateforme DME Hospitalière',
      sub: 'Dossier Médical Électronique sécurisé',
      icon: HeartPulse,
      color: 'text-rose-600 bg-rose-50 border-rose-200 ring-rose-100',
      badge: 'CHU Béni Messous',
      detail: 'Protection intégrale des terminaux hospitaliers accédant aux dossiers patients.',
    },
    {
      id: 'usb',
      title: 'Bloquage du Stockage USB',
      sub: 'Clés USB, Disques Externes, MTP',
      icon: HardDrive,
      color: 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-100',
      badge: 'Anti-Fuite & Ransomware',
      detail: 'Interdiction physique et logique de tout support de masse amovible.',
    },
    {
      id: 'wifi',
      title: 'Bloquage Wi-Fi & Hotspots',
      sub: 'Partages 4G/5G, Bornes Sauvages',
      icon: WifiOff,
      color: 'text-rose-600 bg-rose-50 border-rose-200 ring-rose-100',
      badge: 'Pare-feu Sans Fil',
      detail: 'Coupure des passerelles non autorisées pour empêcher l\'exfiltration réseau.',
    },
    {
      id: 'winbox',
      title: 'Exception Winbox MikroTik',
      sub: 'Port TCP 8291 & MNDP UDP 5678',
      icon: Router,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-100',
      badge: 'RouterOS Préservé',
      detail: 'Accès exclusif maintenu pour la télé-administration des routeurs réseaux.',
    },
    {
      id: 'hid',
      title: 'Souris & Clavier HID Inviolables',
      sub: 'Continuité absolue du soin',
      icon: MousePointer,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200 ring-cyan-100',
      badge: '100% Opérationnel',
      detail: 'Les médecins et soignants continuent d\'utiliser leurs postes sans perturbation.',
    },
  ];

  // Icon step animation timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveIconStep((prev) => (prev + 1) % securityRoles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isOpen, securityRoles.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Veuillez saisir une adresse email professionnelle valide (ex: contact@chu-benimessous.dz ou nom@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const newSession: DmeUserSession = {
      email: email.trim(),
      fullName: fullName.trim() || 'Informaticien Santé DME',
      hospital: hospital.trim() || 'CHU Béni Messous - Alger',
      role: role.trim() || 'DSI Santé',
      connectedAt: new Date().toLocaleString('fr-FR'),
      isAuthenticated: true,
    };

    localStorage.setItem('winlock_dme_auth_session', JSON.stringify(newSession));
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSaveSession(newSession);
      onClose();
    }, 600);
  };

  const currentRoleObj = securityRoles[activeIconStep];
  const CurrentIcon = currentRoleObj.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      {/* Light Mode Dialog Container */}
      <div className="bg-white border-2 border-cyan-500/60 rounded-3xl max-w-4xl w-full shadow-2xl shadow-slate-900/30 overflow-hidden relative my-auto text-slate-900">
        
        {/* Top Decorative Hospital / Cybersecurity Header Bar (Light Mode) */}
        <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-cyan-50 border-b border-slate-200/90 p-5 sm:p-6 relative">
          
          {/* Close button if user already authenticated */}
          {currentSession.isAuthenticated && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
              title="Fermer la présentation"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Badges Bar (Light Mode) */}
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  CHU BÉNI MESSOUS • ALGER
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-800 bg-cyan-100/90 px-2.5 py-1 rounded-md border border-cyan-300 flex items-center gap-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-cyan-700" />
                  ÉDITION 10-2026
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-800 bg-rose-100/90 px-2.5 py-1 rounded-md border border-rose-300 flex items-center gap-1.5 shadow-xs">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  SÉCURITÉ PLATEFORME DME
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  MODE CLAIR
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                WinLock Santé & Sécurisation des Postes DME
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Application officielle conçue et développée par <strong className="text-cyan-800 font-extrabold">Mr. BAZ AMAR</strong> (CHU Béni Messous Alger, 10-2026) 
                mise à disposition en <strong className="text-emerald-800 font-bold">utilisation libre</strong> pour tous les informaticiens de la santé.
              </p>
            </div>

            {/* Author Identification Badge Card (Light Mode) */}
            <div className="shrink-0 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-cyan-600/20">
                BA
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">Mr. BAZ AMAR</div>
                <div className="text-[11px] text-cyan-800 font-mono font-medium">CHU Béni Messous — Alger</div>
                <div className="text-[10px] text-emerald-800 font-sans font-bold">Projet Libre Santé (10-2026)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Content : Animated Visualizer & Login Form (Light Mode) */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50/50">
          
          {/* Left Column : Animated Roles Showcase & Objectives (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Dynamic Animated Roles Radar Strip (Light Mode) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                  Rôles Clés & Symboles de l'Application
                </span>
                <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  Étape {activeIconStep + 1} / {securityRoles.length}
                </span>
              </div>

              {/* Central Interactive Icon Presentation */}
              <div className="flex items-center gap-4 bg-slate-50/90 p-4 rounded-xl border border-slate-200/90 shadow-inner transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ring-4 transition-all duration-500 ${currentRoleObj.color}`}>
                  <CurrentIcon className="w-7 h-7 transition-transform duration-500 scale-110" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {currentRoleObj.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-700 border border-slate-300 font-mono shadow-xs">
                      {currentRoleObj.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    {currentRoleObj.sub}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {currentRoleObj.detail}
                  </p>
                </div>
              </div>

              {/* 5 Animated Role Selector Pills */}
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {securityRoles.map((roleItem, idx) => {
                  const IconComponent = roleItem.icon;
                  const isActive = idx === activeIconStep;
                  return (
                    <button
                      key={roleItem.id}
                      onClick={() => setActiveIconStep(idx)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-50 border-2 border-cyan-600 text-cyan-800 scale-105 shadow-sm font-bold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={roleItem.title}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'animate-bounce text-cyan-700' : ''}`} />
                      <span className="text-[9px] font-mono mt-1 font-bold truncate max-w-full">
                        {roleItem.id.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Project Statement & Health Compliance (Light Mode) */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-2 text-xs text-slate-700 leading-relaxed shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Vocation & Exigences Techniques de la Plateforme DME :
              </div>
              <p className="text-slate-800">
                La plateforme <strong>DME (Dossier Médical Électronique / DPI)</strong> centralise l'historique médical, 
                les examens biologiques et les prescriptions des patients. Pour se conformer aux exigences 
                de cyber-résilience hospitalière, cette application permet de :
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <li className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">Bloquage USB Total</strong> (Prévention fuite de dossiers & virus)</span>
                </li>
                <li className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">Bloquage Wi-Fi & Hotspots</strong> (Anti-passerelles non tracées)</span>
                </li>
                <li className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">Exception Winbox MikroTik</strong> (Port 8291 opérationnel)</span>
                </li>
                <li className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">Souris & Clavier HID Inviolés</strong> (Soin continu)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column : Email Login & Authentication Form (Light Mode) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800 border border-cyan-200">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Connexion Informaticien de Santé
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Veuillez vous identifier avec votre email professionnel pour déverrouiller la console.
                  </p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-700" />
                  Adresse Email Professionnelle <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="issaadhassani@gmail.com ou dsi@chu-benimessous.dz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Cet email sera horodaté sur chaque rapport d'audit et politique déployée.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Nom & Titre de l'Opérateur
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mr. BAZ AMAR"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-cyan-600 focus:bg-white transition"
                />
              </div>

              {/* Hospital / Establishment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Établissement Hospitalier
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="CHU Béni Messous - Alger"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-cyan-600 focus:bg-white transition"
                />
              </div>

              {/* Role / Service */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Service / Affectation DME
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-cyan-600 focus:bg-white transition"
                >
                  <option value="Informaticien Santé / DSI DME">Informaticien Santé / DSI DME</option>
                  <option value="Administrateur Réseaux & Sécurité (Winbox)">Administrateur Réseaux & Sécurité (Winbox)</option>
                  <option value="Technicien Support Postes de Travail DME">Technicien Support Postes de Travail DME</option>
                  <option value="Responsable Sécurité SI Hospitalier (RSSI)">Responsable Sécurité SI Hospitalier (RSSI)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-500 hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-600/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin text-white" />
                      <span>Authentification & Déverrouillage en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Accéder à la Console de Sécurité DME (1 Clic)</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-500">
                  Plateforme DME • Version 10-2026 • Utilisation libre pour la santé
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note (Light Mode) */}
        <div className="border-t border-slate-200 bg-slate-100/90 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>
              Projet d'intérêt public pour les hôpitaux • Initié par <strong>Mr. BAZ AMAR</strong> au <strong>CHU Béni Messous Alger (10-2026)</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sécurisation DME Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
