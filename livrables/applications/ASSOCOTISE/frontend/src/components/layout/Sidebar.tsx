import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Receipt, UserCog, PiggyBank, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const liensBase = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/cotisations', label: 'Cotisations', icon: Wallet },
];

const liensResponsable = [
  { to: '/depenses', label: 'Dépenses', icon: Receipt },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: UserCog },
];

const labelRole: Record<string, string> = {
  secretaire: 'Secrétaire',
  responsable_finances: 'Responsable Finances',
};

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useAuth();
  const liens = profil?.role === 'responsable_finances' ? [...liensBase, ...liensResponsable] : liensBase;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`verre ${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex-col border-r border-[var(--color-border)] lg:static lg:z-auto lg:flex lg:w-64`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white shadow-[var(--shadow-card)]">
              <PiggyBank size={18} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">AssoCotise</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 pt-2">
          {liens.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] shadow-sm'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-brand)]" />
                  )}
                  <Icon size={17} strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {profil && (
          <div className="mx-3 mb-4 mt-2 flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] text-xs font-semibold text-white">
              {profil.nom.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--color-ink)]">{profil.nom}</p>
              <p className="truncate text-[11px] text-[var(--color-muted)]">{labelRole[profil.role]}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
