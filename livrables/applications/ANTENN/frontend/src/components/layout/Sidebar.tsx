'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, Trophy, Handshake, Film, Sparkles, BarChart3, RadioTower, History, X, Tv } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { href: '/grille', label: 'Grille', icon: CalendarClock },
  { href: '/matchs', label: 'Matchs', icon: Trophy },
  { href: '/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/contenus', label: 'Contenus', icon: Film },
  { href: '/habillage', label: 'Habillage', icon: Sparkles },
  // Route régie distincte de la page publique /replay (deux pages ne peuvent pas
  // résoudre le même chemin, même dans des groupes de routes différents).
  { href: '/catalogue', label: 'Replay', icon: History },
  { href: '/rapports', label: 'Rapports', icon: BarChart3 },
  { href: '/parametres', label: 'Chaîne', icon: RadioTower },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { utilisateur } = useAuthStore();

  const initiales = utilisateur ? utilisateur.nom.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : '';

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(2,6,16,0.6)' }}
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-line)' }}
      >
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Tv className="w-5 h-5" style={{ color: '#001018' }} />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-none tracking-tight" style={{ color: 'var(--color-ink)' }}>ANTENN</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--color-ink-3)' }}>Régie de diffusion</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-1.5 rounded-lg" style={{ color: 'var(--color-ink-3)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>MENU</p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}>
                <span
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
                  style={{
                    background: active ? 'var(--color-primary-soft)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-ink-2)',
                  }}
                >
                  {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full" style={{ background: 'var(--color-primary)' }} />}
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {utilisateur && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--color-line)' }}>
            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--color-surface-2)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--gradient-brand)', color: '#001018' }}
              >
                {initiales}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{utilisateur.nom}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>
                  {utilisateur.role === 'ADMINISTRATEUR' ? 'Administrateur' : 'Opérateur régie'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
