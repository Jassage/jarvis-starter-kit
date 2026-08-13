'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, ChevronDown, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { api, apiErrorMessage } from '@/lib/api';
import { Notification } from '@/lib/types';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Tableau de bord', subtitle: "Vue d'ensemble de la pharmacie" },
  '/ventes': { title: 'Ventes', subtitle: 'Point de vente, caisse et historique' },
  '/ordonnances': { title: 'Ordonnances', subtitle: 'Prescriptions enregistrées et service partiel' },
  '/produits': { title: 'Produits', subtitle: 'Catalogue, prix et seuils d\'alerte' },
  '/stock': { title: 'Stock', subtitle: 'Lots, péremption, mouvements et ajustements' },
  '/inventaire': { title: 'Inventaire', subtitle: 'Comptages et ajustements de stock' },
  '/achats': { title: 'Achats', subtitle: 'Commandes fournisseurs et réceptions' },
  '/retours': { title: 'Retours', subtitle: 'Retours client, fournisseur et pertes' },
  '/depenses': { title: 'Dépenses', subtitle: 'Charges de la pharmacie' },
  '/rapports': { title: 'Rapports', subtitle: 'Ventes, stock, achats et finance' },
  '/clients': { title: 'Clients', subtitle: 'Base clients et historique des ventes' },
  '/fournisseurs': { title: 'Fournisseurs', subtitle: 'Gestion de la base fournisseurs' },
  '/utilisateurs': { title: 'Utilisateurs', subtitle: "Comptes de l'équipe et permissions" },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { utilisateur, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const page = PAGES[pathname] || { title: 'REMED', subtitle: '' };

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    async function chargerCompteur() {
      try {
        const { data } = await api.get('/notifications/non-lues/compteur');
        setNonLues(data.data.nonLues);
      } catch {
        // silencieux : la cloche n'est pas une fonctionnalité critique
      }
    }
    chargerCompteur();
    const intervalle = setInterval(chargerCompteur, 60000);
    return () => clearInterval(intervalle);
  }, []);

  async function ouvrirNotifications() {
    setNotifOpen((v) => !v);
    if (!notifOpen) {
      try {
        const { data } = await api.get('/notifications', { params: { limit: 20 } });
        setNotifications(data.data);
      } catch (err) {
        console.error(apiErrorMessage(err));
      }
    }
  }

  async function marquerLue(id: string) {
    try {
      await api.patch(`/notifications/${id}/lue`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lue: true } : n)));
      setNonLues((n) => Math.max(0, n - 1));
    } catch {
      // silencieux
    }
  }

  async function toutMarquerLu() {
    try {
      await api.post('/notifications/tout-lire');
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
      setNonLues(0);
    } catch {
      // silencieux
    }
  }

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
          <h1 className="text-base sm:text-lg font-bold truncate tracking-tight" style={{ color: 'var(--color-ink)' }}>
            {page.title}
          </h1>
          <p className="hidden sm:block text-sm truncate" style={{ color: 'var(--color-ink-3)' }}>
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
      <div className="relative" ref={notifRef}>
        <button onClick={ouvrirNotifications} className="relative p-2 rounded-full" style={{ background: notifOpen ? 'var(--color-surface-2)' : 'transparent' }}>
          <Bell className="w-5 h-5" style={{ color: 'var(--color-ink-2)' }} />
          {nonLues > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: 'var(--color-danger)' }}
            >
              {nonLues > 9 ? '9+' : nonLues}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl overflow-x-hidden"
            style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-line)' }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-line-2)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>Notifications</p>
              {nonLues > 0 && (
                <button onClick={toutMarquerLu} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--color-ink-3)' }}>Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.lue && marquerLue(n.id)}
                  className="w-full text-left px-4 py-3 border-b last:border-0 transition-colors"
                  style={{ borderColor: 'var(--color-line-2)', background: n.lue ? 'transparent' : 'var(--color-primary-soft)' }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-ink)' }}>{n.titre}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-3)' }}>{n.message}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-full transition-colors"
          style={{ background: menuOpen ? 'var(--color-surface-2)' : 'transparent' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-brand)' }}>
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
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-ink-3)' }}>
                {utilisateur?.role}
              </p>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors" style={{ color: 'var(--color-danger)' }}>
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
