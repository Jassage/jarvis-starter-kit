import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  RefreshCw,
  UserCog,
  PiggyBank,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const liensBase = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/cotisations', label: 'Cotisations', icon: Wallet },
  { to: '/tontine', label: 'Tontine', icon: RefreshCw },
];

const liensResponsable = [
  { to: '/depenses', label: 'Dépenses', icon: Receipt },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: UserCog },
];

export function Sidebar() {
  const { profil } = useAuth();
  const liens = profil?.role === 'responsable_finances' ? [...liensBase, ...liensResponsable] : liensBase;

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand)] text-white">
          <PiggyBank size={18} />
        </div>
        <span className="font-semibold text-[var(--color-ink)]">AssoCotise</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {liens.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--color-brand-light)] text-[var(--color-brand-dark)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
