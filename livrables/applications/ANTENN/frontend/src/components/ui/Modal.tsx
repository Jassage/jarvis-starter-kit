'use client';
import { ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Sélecteur des éléments réellement atteignables au clavier à l'intérieur du dialogue.
const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}) {
  const panneau = useRef<HTMLDivElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const titreId = useId();

  useEffect(() => {
    if (!open) return;

    // Mémorise l'élément qui avait le focus pour le lui rendre à la fermeture : sans
    // cela, le focus retombe sur le <body> et la navigation clavier repart du début de
    // la page à chaque fermeture de dialogue.
    declencheur.current = document.activeElement as HTMLElement | null;
    panneau.current?.querySelector<HTMLElement>(FOCUSABLES)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panneau.current) return;

      // Piège à focus : la tabulation tourne en boucle dans le dialogue au lieu de
      // partir se perdre dans la page qui reste affichée derrière.
      const cibles = Array.from(panneau.current.querySelectorAll<HTMLElement>(FOCUSABLES));
      if (!cibles.length) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];

      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    // Le fond de page ne doit pas défiler sous le dialogue.
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowInitial;
      declencheur.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,16,0.7)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        ref={panneau}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        className="w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7"
        style={{ maxWidth, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface)', border: '1px solid var(--color-line)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 id={titreId} className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
            style={{ color: 'var(--color-ink-3)', background: 'var(--color-surface-2)' }}
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
