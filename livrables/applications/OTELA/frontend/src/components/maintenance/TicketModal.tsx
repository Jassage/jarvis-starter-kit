'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useMaintenanceStore, PrioriteTicket } from '@/stores/maintenanceStore';

const PRIORITE_LABEL: Record<PrioriteTicket, string> = {
  BASSE: 'Basse',
  NORMALE: 'Normale',
  HAUTE: 'Haute',
  URGENTE: 'Urgente',
};

export default function TicketModal({ open, onClose, chambres }: {
  open: boolean;
  onClose: () => void;
  chambres: { id: string; numero: string; typeChambre: { nom: string } }[];
}) {
  const { creerTicket } = useMaintenanceStore();
  const [cible, setCible] = useState<'chambre' | 'zone'>('chambre');
  const [form, setForm] = useState({ chambreId: '', zone: '', titre: '', description: '', priorite: 'NORMALE' as PrioriteTicket, bloqueChambre: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => setForm({ chambreId: '', zone: '', titre: '', description: '', priorite: 'NORMALE', bloqueChambre: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (cible === 'chambre' && !form.chambreId) {
      setError('Sélectionnez une chambre');
      return;
    }
    if (cible === 'zone' && !form.zone.trim()) {
      setError('Indiquez la zone concernée');
      return;
    }
    setSubmitting(true);
    try {
      await creerTicket({
        chambreId: cible === 'chambre' ? form.chambreId : undefined,
        zone: cible === 'zone' ? form.zone : undefined,
        titre: form.titre,
        description: form.description || undefined,
        priorite: form.priorite,
        bloqueChambre: cible === 'chambre' ? form.bloqueChambre : false,
      });
      onClose();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer ce ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Signaler un problème" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setCible('chambre')} className="btn flex-1" style={{ background: cible === 'chambre' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'chambre' ? 'var(--color-primary-2)' : 'var(--color-ink-2)' }}>Chambre</button>
          <button type="button" onClick={() => setCible('zone')} className="btn flex-1" style={{ background: cible === 'zone' ? 'var(--color-primary-soft)' : 'var(--color-surface-2)', color: cible === 'zone' ? 'var(--color-primary-2)' : 'var(--color-ink-2)' }}>Zone commune</button>
        </div>

        {cible === 'chambre' ? (
          <select required className="input" value={form.chambreId} onChange={(e) => setForm({ ...form, chambreId: e.target.value })}>
            <option value="">Sélectionner une chambre...</option>
            {chambres.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
          </select>
        ) : (
          <input required placeholder="Zone concernée (ex. Hall d'entrée, Piscine...)" className="input" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} />
        )}

        <input required placeholder="Titre du problème" className="input" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
        <textarea placeholder="Description (optionnel)" className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Priorité</label>
          <select className="input" value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value as PrioriteTicket })}>
            {Object.entries(PRIORITE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {cible === 'chambre' && (
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
            <input type="checkbox" checked={form.bloqueChambre} onChange={(e) => setForm({ ...form, bloqueChambre: e.target.checked })} />
            Mettre la chambre hors service immédiatement (si elle est disponible)
          </label>
        )}

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Envoi...' : 'Signaler'}</button>
      </form>
    </Modal>
  );
}
