'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Tableau de bord', subtitle: "Vue d'ensemble de votre activité commerciale" },
  '/produits': { title: 'Produits', subtitle: "Catalogue, prix et seuils d'alerte" },
  '/stock': { title: 'Stock', subtitle: 'Quantités par emplacement, ajustements et mouvements' },
  '/ventes': { title: 'Ventes', subtitle: 'Historique des ventes et point de vente' },
  '/clients': { title: 'Clients', subtitle: 'Gestion de la base clients' },
  '/achats': { title: 'Achats', subtitle: 'Commandes fournisseurs et réceptions' },
  '/fournisseurs': { title: 'Fournisseurs', subtitle: 'Gestion de la base fournisseurs' },
  '/transferts': { title: 'Transferts', subtitle: 'Mouvements inter-sites boutique ↔ entrepôt' },
  '/compta': { title: 'Comptabilité', subtitle: 'Journal, grand livre et états financiers' },
  '/rapports': { title: 'Rapports', subtitle: 'Ventes, stock, achats et clients' },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { utilisateur, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const page = PAGES[pathname] || { title: 'GESCOM', subtitle: '' };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : '';

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-8 py-4 border-b backdrop-blur"
      style={{ borderColor: 'var(--color-line)', background: 'rgba(255,255,255,0.85)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 rounded-lg shrink-0" style={{ color: 'var(--color-ink-2)' }}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold truncate tracking-tight" style={{ color: 'var(--color-ink)' }}>{page.title}</h1>
          <p className="hidden sm:block text-sm truncate" style={{ color: 'var(--color-ink-3)' }}>{page.subtitle}</p>
        </div>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-full transition-colors"
          style={{ background: menuOpen ? 'var(--color-surface-2)' : 'transparent' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {initiales}
          </div>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            {utilisateur?.prenom}
          </span>
          <ChevronDown className="hidden sm:block w-4 h-4" style={{ color: 'var(--color-ink-3)' }} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-line)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-line-2)' }}>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{utilisateur?.prenom} {utilisateur?.nom}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>{utilisateur?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
              style={{ color: 'var(--color-danger)' }}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
