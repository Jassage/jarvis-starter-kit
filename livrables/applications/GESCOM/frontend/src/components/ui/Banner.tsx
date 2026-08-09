'use client';
import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Banner({
  message,
  type = 'success',
  onClose,
  className = '',
}: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  className?: string;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  const isError = type === 'error';
  const Icon = isError ? XCircle : CheckCircle2;
  const color = isError ? 'var(--color-danger)' : 'var(--color-success)';

  return (
    <div
      className={`card p-4 flex items-center gap-3 ${className}`}
      style={{
        background: isError ? 'var(--color-danger-soft)' : 'var(--color-success-soft)',
        border: `1px solid ${isError ? 'rgba(220,38,38,0.2)' : 'rgba(16,185,129,0.25)'}`,
      }}
    >
      <Icon className="w-5 h-5 shrink-0" style={{ color }} />
      <p className="text-sm font-semibold" style={{ color }}>{message}</p>
    </div>
  );
}
