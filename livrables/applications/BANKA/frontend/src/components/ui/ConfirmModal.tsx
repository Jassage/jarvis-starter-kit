'use client';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES: Record<ConfirmVariant, { icon: string; iconBg: string; iconColor: string; btn: string; btnText: string }> = {
  danger: {
    icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    iconBg: '#fee2e2',
    iconColor: '#b91c1c',
    btn: '#b91c1c',
    btnText: 'white',
  },
  warning: {
    icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    btn: '#b45309',
    btnText: 'white',
  },
  primary: {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: '#dbeafe',
    iconColor: '#1d4ed8',
    btn: '#1d4ed8',
    btnText: 'white',
  },
};

const Spin = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
    <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const s = VARIANT_STYLES[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(11,23,51,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="card w-full max-w-sm p-0 overflow-hidden animate-slide-up"
        style={{ boxShadow: '0 20px 60px rgba(11,23,51,0.2)' }}
      >
        {/* Body */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.iconBg }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: s.iconColor }}>
                <path d={s.icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-bold text-base leading-tight" style={{ color: '#0b1733' }}>{title}</h3>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#4a5578' }}>{message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: '1px solid #f0f2f9', background: '#f7f8fc' }}
        >
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: '#e4e7f0', color: '#4a5578' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: s.btn, color: s.btnText }}
          >
            {loading && <Spin />}
            {loading ? 'En cours...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
