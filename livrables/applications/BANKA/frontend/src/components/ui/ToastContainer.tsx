'use client';
import { useToastStore, Toast, ToastType } from '@/stores/toastStore';

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string; close: string }> = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#047857', iconBg: '#dcfce7', close: '#047857' },
  error:   { bg: '#fef2f2', border: '#fecaca', icon: '#b91c1c', iconBg: '#fee2e2', close: '#b91c1c' },
  warning: { bg: '#fffbeb', border: '#fde68a', icon: '#92400e', iconBg: '#fef3c7', close: '#92400e' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#1e40af', iconBg: '#dbeafe', close: '#1e40af' },
};

function ToastIcon({ type }: { type: ToastType }) {
  const s = TOAST_STYLES[type];
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.iconBg }}>
      {type === 'success' && (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: s.icon }}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
      {type === 'error' && (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: s.icon }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      )}
      {type === 'warning' && (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: s.icon }}><path d="M10.29 3.86l-8.18 14.14a2 2 0 001.71 3h16.36a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      )}
      {type === 'info' && (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: s.icon }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      )}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore();
  const s = TOAST_STYLES[toast.type];
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl shadow-lg min-w-[300px] max-w-[420px] animate-slide-up"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#0b1733' }}>{toast.title}</p>
        {toast.message && <p className="text-xs mt-0.5" style={{ color: '#4a5578' }}>{toast.message}</p>}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ color: s.icon, background: s.iconBg }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
