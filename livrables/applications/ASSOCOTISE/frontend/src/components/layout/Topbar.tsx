import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const labelRole: Record<string, string> = {
  secretaire: 'Secrétaire',
  responsable_finances: 'Responsable Finances',
};

export function Topbar({ titre }: { titre: string }) {
  const { profil, deconnecter } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
      <h1 className="text-lg font-semibold text-[var(--color-ink)]">{titre}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--color-ink)]">{profil?.nom}</p>
          <p className="text-xs text-[var(--color-muted)]">{profil && labelRole[profil.role]}</p>
        </div>
        <button
          onClick={() => deconnecter()}
          className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-danger)]"
          title="Se déconnecter"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
