'use client';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

// Remplace `window.confirm()`. Le dialogue natif casse le thème sombre en plein milieu
// d'une action destructive, n'affiche aucun contexte au-delà d'une phrase, et ne peut
// pas distinguer visuellement « retirer de l'antenne » de « supprimer définitivement ».
export default function ConfirmDialog({
  open,
  titre,
  message,
  detail,
  libelleConfirmation = 'Confirmer',
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  titre: string;
  message: string;
  detail?: string;
  libelleConfirmation?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={titre} maxWidth={440}>
      <div className="flex items-start gap-3 mb-6">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: danger ? 'var(--color-danger-soft)' : 'var(--color-warning-soft)',
            color: danger ? 'var(--color-danger)' : 'var(--color-warning)',
          }}
        >
          <AlertTriangle className="w-4.5 h-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{message}</p>
          {detail && <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>{detail}</p>}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {libelleConfirmation}
        </button>
      </div>
    </Modal>
  );
}
