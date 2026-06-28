'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ name }: { name: string }) => {
  const p = { viewBox: '0 0 24 24', fill: 'none', className: 'w-5 h-5', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':     return <svg {...p}><path d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" stroke="currentColor"/></svg>;
    case 'users':    return <svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor"/></svg>;
    case 'wallet':   return <svg {...p}><path d="M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-2M22 12h-6a2 2 0 100 4h6v-4z" stroke="currentColor"/></svg>;
    case 'arrows':   return <svg {...p}><path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" stroke="currentColor"/></svg>;
    case 'cash':     return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor"/><circle cx="12" cy="12" r="2.5" stroke="currentColor"/><path d="M6 10h.01M18 10h.01M6 14h.01M18 14h.01" stroke="currentColor"/></svg>;
    case 'doc':      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" stroke="currentColor"/></svg>;
    case 'shield':   return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" stroke="currentColor"/></svg>;
    case 'chart':    return <svg {...p}><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor"/></svg>;
    case 'building': return <svg {...p}><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8" stroke="currentColor"/></svg>;
    case 'people':   return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor"/></svg>;
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor"/></svg>;
    case 'logout':   return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor"/></svg>;
    case 'piggy':    return <svg {...p}><path d="M19 10c0-3.87-3.58-7-8-7S3 6.13 3 10c0 2.39 1.22 4.53 3.11 5.96L5 20h14l-1.11-4.04C19.78 14.53 21 12.39 21 10zM12 7v3m-3-1h6" stroke="currentColor"/></svg>;
    case 'book':     return <svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 22h16v-5H6.5M4 19.5V4a2 2 0 012-2h14v13H6.5" stroke="currentColor"/></svg>;
    case 'layers':   return <svg {...p}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor"/></svg>;
    case 'trending': return <svg {...p}><path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" stroke="currentColor"/></svg>;
    case 'balance':  return <svg {...p}><path d="M12 3v18M3 9l9-6 9 6M3 15l9-6 9 6M3 9h18M3 15h18" stroke="currentColor"/></svg>;
    case 'id-card':  return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor"/><circle cx="8" cy="12" r="2" stroke="currentColor"/><path d="M14 10h4M14 14h4M2 9h20" stroke="currentColor"/></svg>;
    case 'contract': return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M8 12h8M8 16h5" stroke="currentColor"/></svg>;
    case 'salary':   return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor"/><path d="M12 10v4M10 12h4" stroke="currentColor"/></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor"/></svg>;
    case 'briefcase':return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor"/><path d="M12 12v3M9 12h6" stroke="currentColor"/></svg>;
    case 'clock':    return <svg {...p}><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M12 7v5l3.5 3.5" stroke="currentColor"/></svg>;
    default: return null;
  }
};

// ─── Nav definitions ──────────────────────────────────────────────────────────
const ALL_ROLES = ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE', 'AUDITEUR'];

const NAV_BANKING = [
  { href: '/dashboard',           label: 'Tableau de bord',    icon: 'home',     roles: ALL_ROLES },
  { href: '/clients',             label: 'Clients',             icon: 'users',    roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE'] },
  { href: '/comptes',             label: 'Comptes',             icon: 'wallet',   roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'COMPTABLE'] },
  { href: '/transactions',        label: 'Transactions',        icon: 'arrows',   roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'COMPTABLE'] },
  { href: '/caisse',              label: 'Caisse',              icon: 'cash',     roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER'] },
  { href: '/prets',               label: 'Crédits & Prêts',    icon: 'doc',      roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'AGENT_CREDIT'] },
  { href: '/epargne-programmee',  label: 'Épargne programmée', icon: 'piggy',    roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER'] },
  { href: '/rapports',            label: 'Rapports',            icon: 'chart',    roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'COMPTABLE', 'AUDITEUR'] },
  { href: '/audit',               label: 'Journal d\'audit',   icon: 'shield',   roles: ['SUPER_ADMIN', 'DIRECTEUR', 'AUDITEUR'] },
  { href: '/utilisateurs',        label: 'Opérateurs',          icon: 'people',   roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  { href: '/agences',             label: 'Agences',             icon: 'building', roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  { href: '/administration',      label: 'Administration',      icon: 'settings', roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
];

const NAV_COMPTA = [
  { href: '/compta/dashboard',     label: 'Tableau de bord',    icon: 'home',     roles: ALL_ROLES },
  { href: '/compta/plan-comptable',label: 'Plan comptable',      icon: 'book',     roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE', 'AUDITEUR'] },
  { href: '/compta/journal',       label: 'Journal des écritures',icon: 'layers',  roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE'] },
  { href: '/compta/grand-livre',   label: 'Grand livre',         icon: 'trending', roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE', 'AUDITEUR'] },
  { href: '/compta/bilan',         label: 'Bilan',               icon: 'balance',  roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE', 'AUDITEUR'] },
  { href: '/compta/resultat',      label: 'Compte de résultat',  icon: 'chart',    roles: ['SUPER_ADMIN', 'DIRECTEUR', 'COMPTABLE', 'AUDITEUR'] },
];

const NAV_RH = [
  { href: '/rh/dashboard',   label: 'Tableau de bord',  icon: 'home',      roles: ALL_ROLES },
  { href: '/rh/employes',    label: 'Employés',          icon: 'people',    roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'] },
  { href: '/rh/postes',      label: 'Postes & Métiers',  icon: 'briefcase', roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  { href: '/rh/contrats',    label: 'Contrats',          icon: 'contract',  roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'] },
  { href: '/rh/paie',        label: 'Gestion de la paie',icon: 'salary',    roles: ['SUPER_ADMIN', 'DIRECTEUR'] },
  { href: '/rh/conges',      label: 'Congés & Absences', icon: 'calendar',  roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'] },
  { href: '/rh/pointage',    label: 'Pointage',           icon: 'clock',     roles: ['SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR'] },
];

// ─── Module config ─────────────────────────────────────────────────────────────
const MODULES = [
  { key: 'banking', label: 'Bancaire',      color: '#1e40af', bg: '#eef2ff', nav: NAV_BANKING, defaultHref: '/dashboard' },
  { key: 'compta',  label: 'Comptabilité',  color: '#047857', bg: '#ecfdf5', nav: NAV_COMPTA,  defaultHref: '/compta/dashboard' },
  { key: 'rh',      label: 'RH',            color: '#7c3aed', bg: '#f5f3ff', nav: NAV_RH,       defaultHref: '/rh/dashboard' },
] as const;

type ModuleKey = 'banking' | 'compta' | 'rh';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Administrateur', DIRECTEUR: 'Directeur', SUPERVISEUR: 'Superviseur',
  CAISSIER: 'Caissier', AGENT_CREDIT: 'Agent de crédit', COMPTABLE: 'Comptable', AUDITEUR: 'Auditeur',
};

function detectModule(pathname: string): ModuleKey {
  if (pathname.startsWith('/compta')) return 'compta';
  if (pathname.startsWith('/rh')) return 'rh';
  return 'banking';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { utilisateur, logout } = useAuthStore();

  const currentModule = detectModule(pathname);
  const mod = MODULES.find((m) => m.key === currentModule)!;
  const visibleItems = mod.nav.filter((item) => utilisateur && item.roles.includes(utilisateur.role));

  return (
    <aside className="w-[260px] min-h-screen flex flex-col" style={{ background: '#ffffff', borderRight: '1px solid #e7eaf3' }}>
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid #f0f2f9' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${mod.color}, ${mod.color}cc)` }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-8h6v8M9 12h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-base leading-tight tracking-tight" style={{ color: '#0b1733' }}>BANKA ERP</p>
          <p className="text-xs truncate" style={{ color: '#8b94b0' }}>{utilisateur?.agence?.nom || 'Siège'}</p>
        </div>
      </div>

      {/* Module switcher */}
      <div className="px-3 pt-3 pb-2">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: '#f7f8fc' }}>
          {MODULES.map((m) => {
            const active = currentModule === m.key;
            return (
              <button
                key={m.key}
                onClick={() => router.push(m.defaultHref)}
                className="py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={active
                  ? { background: 'white', color: m.color, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#8b94b0' }
                }
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-1 pb-3 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#8b94b0' }}>
          {mod.label}
        </p>
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/compta/dashboard' && item.href !== '/rh/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={active
                  ? { background: mod.bg, color: mod.color }
                  : { color: '#4a5578' }
                }
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f7f8fc'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: active ? mod.color : '#8b94b0' }}><Icon name={item.icon} /></span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: mod.color }}></span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="m-3 p-3 rounded-xl" style={{ background: '#f7f8fc' }}>
        <button
          onClick={() => router.push('/profil')}
          className="flex items-center gap-3 mb-3 w-full text-left rounded-xl p-1 -m-1 transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f9'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${mod.color}, ${mod.color}99)` }}>
            <span className="text-white text-xs font-bold">
              {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ color: '#0b1733' }}>{utilisateur?.prenom} {utilisateur?.nom}</p>
            <p className="text-xs truncate" style={{ color: '#8b94b0' }}>{ROLE_LABEL[utilisateur?.role || ''] || utilisateur?.role}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: '#fff', color: '#4a5578', border: '1px solid #e7eaf3' }}
        >
          <Icon name="logout" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
