'use client';
import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={420}>
      <p className="text-sm mb-6" style={{ color: 'var(--color-ink-2)' }}>{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} disabled={loading} className="btn btn-secondary">
          Annuler
        </button>
        <button onClick={handleConfirm} disabled={loading} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>
          {loading ? 'Patientez…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
