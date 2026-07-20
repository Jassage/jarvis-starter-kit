import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export function Topbar({ titre, onOuvrirMenu }: { titre: string; onOuvrirMenu: () => void }) {
  const { deconnecter } = useAuth();
  const { theme, basculer } = useTheme();

  return (
    <header className="verre sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOuvrirMenu}
          className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-bg)] lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--color-ink)]">{titre}</h1>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={basculer}
          className="rounded-lg p-2 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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
