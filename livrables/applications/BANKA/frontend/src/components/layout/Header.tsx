'use client';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de votre activité bancaire' },
  '/clients': { title: 'Clients', subtitle: 'Gestion de la base clients et KYC' },
  '/comptes': { title: 'Comptes', subtitle: 'Comptes d\'épargne, courants et à terme' },
  '/transactions': { title: 'Transactions', subtitle: 'Dépôts, retraits, virements et validations' },
  '/caisse': { title: 'Caisse', subtitle: 'Ouverture, fermeture et arrêté de caisse' },
  '/prets': { title: 'Crédits & Prêts', subtitle: 'Dossiers, approbations et remboursements' },
};

export default function Header() {
  const pathname = usePathname();
  const { utilisateur } = useAuthStore();
  const segment = '/' + pathname.split('/')[1];
  const page = PAGES[segment] || { title: 'BANKA', subtitle: '' };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <header className="h-[72px] px-8 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid #e7eaf3' }}>
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0b1733' }}>{page.title}</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8b94b0' }}>{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: '#f7f8fc' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#4a5578' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium capitalize" style={{ color: '#4a5578' }}>{today}</span>
        </div>

        <button className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: '#f7f8fc' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#4a5578' }}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#ef4444' }}></span>
        </button>

        <div className="flex items-center gap-3 pl-3 ml-1" style={{ borderLeft: '1px solid #e7eaf3' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <span className="text-white text-sm font-bold">
              {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: '#0b1733' }}>{utilisateur?.prenom} {utilisateur?.nom}</p>
            <p className="text-xs leading-tight" style={{ color: '#8b94b0' }}>{utilisateur?.agence?.nom || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
