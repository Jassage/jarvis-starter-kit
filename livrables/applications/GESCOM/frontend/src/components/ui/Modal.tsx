'use client';
import { ReactNode } from 'react';

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
      style={{ background: 'rgba(11,23,51,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl p-6"
        style={{ maxWidth, background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>{title}</h3>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-ink-3)' }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
