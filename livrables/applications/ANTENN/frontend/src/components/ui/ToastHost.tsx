'use client';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, ToastTon } from '@/stores/toastStore';

const STYLE: Record<ToastTon, { bg: string; fg: string; icon: React.ComponentType<{ className?: string }> }> = {
  succes: { bg: 'var(--color-success-soft)', fg: 'var(--color-success)', icon: CheckCircle2 },
  erreur: { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)', icon: AlertTriangle },
  info: { bg: 'var(--color-info-soft)', fg: 'var(--color-info)', icon: Info },
};

// Retour d'action global. Auparavant les pages affichaient leurs erreurs dans un
// bandeau en haut de page : invisible quand on agissait sur la dernière ligne d'un
// tableau long, et les succès ne disaient rien du tout.
//
// `aria-live="polite"` fait annoncer le message par un lecteur d'écran sans couper la
// tâche en cours ; `role="status"` le rattache à la région de statut de la page.
export default function ToastHost() {
  const { toasts, retirer } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-sm"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const s = STYLE[t.ton];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            className="toast-item flex items-start gap-2.5 p-3.5 rounded-xl shadow-lg"
            style={{ background: 'var(--color-surface-2)', border: `1px solid ${s.fg}33` }}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.fg }}
            >
              <Icon className="w-4 h-4" />
            </span>
            <p className="text-sm font-semibold flex-1 min-w-0" style={{ color: 'var(--color-ink)' }}>
              {t.message}
            </p>
            <button
              onClick={() => retirer(t.id)}
              className="p-1 rounded-lg shrink-0"
              style={{ color: 'var(--color-ink-3)' }}
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
