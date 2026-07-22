'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, CalendarDays, BedDouble, BarChart3, Building2, X, Hotel, DoorOpen, Sparkles, UtensilsCrossed, ChefHat, Sparkle, Settings, Wine, Shirt, Bell, Car, ConciergeBell, Users, ScrollText, Wrench, Receipt } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const NAV_ETABLISSEMENT = [
  { href: '/reception', label: 'Réception', icon: DoorOpen },
  { href: '/reservations', label: 'Réservations', icon: CalendarClock },
  { href: '/calendrier', label: 'Calendrier', icon: CalendarDays },
  { href: '/menage', label: 'Ménage', icon: Sparkles },
  { href: '/pos', label: 'Restaurant/Bar', icon: UtensilsCrossed },
  { href: '/room-service', label: 'Room Service', icon: ConciergeBell },
  { href: '/cuisine', label: 'Cuisine', icon: ChefHat },
  { href: '/restaurant/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/spa', label: 'Spa', icon: Sparkle },
  { href: '/spa/config', label: 'Spa — Config', icon: Settings },
  { href: '/minibar', label: 'Minibar', icon: Wine },
  { href: '/blanchisserie', label: 'Blanchisserie', icon: Shirt },
  { href: '/conciergerie', label: 'Conciergerie', icon: Bell },
  { href: '/voiturier', label: 'Voiturier', icon: Car },
  { href: '/chambres', label: 'Chambres & Tarifs', icon: BedDouble },
  { href: '/employes', label: 'Employés', icon: Users },
  { href: '/rapports', label: 'Rapports', icon: BarChart3 },
  { href: '/parametres', label: 'Paramètres hôtel', icon: Settings },
];

const NAV_COMPTABLE = [
  { href: '/reservations', label: 'Réservations', icon: CalendarClock },
  { href: '/rapports', label: 'Rapports', icon: BarChart3 },
];

const NAV_MAINTENANCE = [
  { href: '/chambres', label: 'Chambres', icon: Wrench },
];

const NAV_PROPRIETAIRE = [
  { href: '/chaine', label: 'Vue chaîne', icon: BarChart3 },
  { href: '/rapports', label: 'Rapports', icon: Receipt },
  { href: '/journal', label: 'Journal d\'audit', icon: ScrollText },
];

const NAV_RECEPTION = [
  { href: '/reception', label: 'Réception', icon: DoorOpen },
  { href: '/reservations', label: 'Réservations', icon: CalendarClock },
  { href: '/calendrier', label: 'Calendrier', icon: CalendarDays },
  { href: '/spa', label: 'Spa', icon: Sparkle },
  { href: '/blanchisserie', label: 'Blanchisserie', icon: Shirt },
  { href: '/conciergerie', label: 'Conciergerie', icon: Bell },
  { href: '/voiturier', label: 'Voiturier', icon: Car },
];

const NAV_MENAGE = [
  { href: '/menage', label: 'Ménage', icon: Sparkles },
  { href: '/minibar', label: 'Minibar', icon: Wine },
];

const NAV_SERVEUR = [
  { href: '/pos', label: 'Restaurant/Bar', icon: UtensilsCrossed },
  { href: '/room-service', label: 'Room Service', icon: ConciergeBell },
  { href: '/cuisine', label: 'Cuisine', icon: ChefHat },
];

const NAV_CHAINE = [
  { href: '/chaine', label: 'Vue chaîne', icon: BarChart3 },
  { href: '/etablissements', label: 'Établissements', icon: Building2 },
  { href: '/employes', label: 'Employés', icon: Users },
  { href: '/journal', label: 'Journal d\'audit', icon: ScrollText },
];

const NAV_PAR_ROLE: Record<string, typeof NAV_ETABLISSEMENT> = {
  ADMINISTRATEUR_CHAINE: NAV_CHAINE,
  ADMINISTRATEUR_ETABLISSEMENT: NAV_ETABLISSEMENT,
  PROPRIETAIRE: NAV_PROPRIETAIRE,
  COMPTABLE: NAV_COMPTABLE,
  MAINTENANCE: NAV_MAINTENANCE,
  RECEPTION: NAV_RECEPTION,
  MENAGE: NAV_MENAGE,
  SERVEUR: NAV_SERVEUR,
};

const ROLE_LABELS: Record<string, string> = {
  RECEPTION: 'Réception',
  MENAGE: 'Ménage',
  SERVEUR: 'Serveur',
  MAINTENANCE: 'Maintenance',
  COMPTABLE: 'Comptable',
  PROPRIETAIRE: 'Propriétaire',
  ADMINISTRATEUR_ETABLISSEMENT: 'Directeur',
  ADMINISTRATEUR_CHAINE: 'Super administrateur',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { employe } = useAuthStore();

  const nav = employe ? NAV_PAR_ROLE[employe.role] ?? [] : [];

  const initiales = employe ? employe.nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : '';

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(11,23,51,0.5)' }} onClick={closeSidebar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-line)' }}
      >
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--gradient-gold)' }}>
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-none tracking-tight" style={{ color: 'var(--color-ink)' }}>OTELA</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--color-ink-3)' }}>PMS hôtelier</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1.5 rounded-lg" style={{ color: 'var(--color-ink-3)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>MENU</p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}>
                <span
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
                  style={{ background: active ? 'var(--color-primary-soft)' : 'transparent', color: active ? 'var(--color-primary-2)' : 'var(--color-ink-2)' }}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full" style={{ background: 'var(--color-primary-2)' }} />}
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {employe && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--color-surface-2)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: 'var(--gradient-brand)' }}>
                {initiales}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{employe.nom}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>{ROLE_LABELS[employe.role]}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
