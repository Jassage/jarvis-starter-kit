'use client';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(9,18,15,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7"
        style={{ maxWidth, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>{title}</h3>
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
