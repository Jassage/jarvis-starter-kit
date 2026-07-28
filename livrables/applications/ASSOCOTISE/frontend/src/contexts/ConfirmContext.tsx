import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface ConfirmOptions {
  titre: string;
  description: string;
  confirmerLabel?: string;
  annulerLabel?: string;
  /** Rouge + icône d'alerte, pour une action destructrice (annulation, clôture, réouverture...). */
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

/**
 * Remplace window.confirm() par un vrai modal, pour toutes les actions irréversibles de
 * l'app (annulation de cotisation/dépense, clôture/réouverture d'exercice, réinitialisation
 * de mot de passe...). Un seul modal partagé, piloté par une promesse : `await confirmer(...)`
 * se comporte comme `confirm()` mais avec un rendu cohérent avec le reste de l'interface.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((valeur: boolean) => void) | null>(null);

  const confirmer = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function repondre(valeur: boolean) {
    resolveRef.current?.(valeur);
    resolveRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirmer}>
      {children}
      <Modal open={options !== null} onClose={() => repondre(false)} title={options?.titre ?? ''} maxWidth="max-w-sm">
        {options && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              {options.danger && (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
                  <AlertTriangle size={16} />
                </span>
              )}
              <p className="whitespace-pre-line text-sm text-[var(--color-muted)]">{options.description}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => repondre(false)}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-bg)]"
              >
                {options.annulerLabel ?? 'Annuler'}
              </button>
              <button
                onClick={() => repondre(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  options.danger
                    ? 'bg-[var(--color-danger)] hover:opacity-90'
                    : 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)]'
                }`}
              >
                {options.confirmerLabel ?? 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider');
  return ctx;
}
