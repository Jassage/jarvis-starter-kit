'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { useReservationsStore } from '@/stores/reservationsStore';
import { useChambresStore } from '@/stores/chambresStore';
import type { TypeSejour } from '@/stores/chambresStore';

const FORM_INITIAL = {
  typeSejour: 'NUITEE' as TypeSejour,
  typeChambreId: '',
  dateArrivee: '',
  dateDepart: '',
  dateJour: '',
  heureArrivee: '10:00',
  heureDepart: '18:00',
  nombreAdultes: 2,
  nombreEnfants: 0,
  devise: 'HTG' as 'HTG' | 'USD',
  nom: '',
  telephone: '',
  email: '',
};

export default function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { employe } = useAuthStore();
  const { creerManuelle } = useReservationsStore();
  const { types } = useChambresStore();

  const [form, setForm] = useState(FORM_INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nombrePersonnes = form.nombreAdultes + form.nombreEnfants;
  const typesEligibles = types.filter((t) => t.capaciteMax >= nombrePersonnes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employe?.etablissementId) return;
    setError('');
    setSubmitting(true);
    try {
      const estJour = form.typeSejour === 'JOUR';
      const dateArrivee = estJour ? new Date(`${form.dateJour}T${form.heureArrivee}`).toISOString() : form.dateArrivee;
      const dateDepart = estJour ? new Date(`${form.dateJour}T${form.heureDepart}`).toISOString() : form.dateDepart;
      await creerManuelle({
        etablissementId: employe.etablissementId,
        typeChambreId: form.typeChambreId,
        dateArrivee,
        dateDepart,
        nombrePersonnes,
        nombreAdultes: form.nombreAdultes,
        nombreEnfants: form.nombreEnfants,
        devise: form.devise,
        typeSejour: form.typeSejour,
        client: { nom: form.nom, telephone: form.telephone, email: form.email },
      });
      onClose();
      setForm(FORM_INITIAL);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle réservation" maxWidth={520}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, typeSejour: 'NUITEE' })}
            className={form.typeSejour === 'NUITEE' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Nuitée
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, typeSejour: 'JOUR' })}
            className={form.typeSejour === 'JOUR' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Day-use (jour)
          </button>
        </div>

        {form.typeSejour === 'NUITEE' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Arrivée</label>
              <input type="date" required className="input" value={form.dateArrivee} onChange={(e) => setForm({ ...form, dateArrivee: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Départ</label>
              <input type="date" required className="input" value={form.dateDepart} onChange={(e) => setForm({ ...form, dateDepart: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date</label>
              <input type="date" required className="input" value={form.dateJour} onChange={(e) => setForm({ ...form, dateJour: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Heure arrivée</label>
              <input type="time" required className="input" value={form.heureArrivee} onChange={(e) => setForm({ ...form, heureArrivee: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Heure départ</label>
              <input type="time" required className="input" value={form.heureDepart} onChange={(e) => setForm({ ...form, heureDepart: e.target.value })} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adultes</label>
            <input type="number" min={1} max={20} required className="input" value={form.nombreAdultes} onChange={(e) => setForm({ ...form, nombreAdultes: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Enfants</label>
            <input type="number" min={0} max={20} required className="input" value={form.nombreEnfants} onChange={(e) => setForm({ ...form, nombreEnfants: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Devise</label>
            <select className="input" value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value as 'HTG' | 'USD' })}>
              <option value="HTG">HTG</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Type de chambre</label>
          <select required className="input" value={form.typeChambreId} onChange={(e) => setForm({ ...form, typeChambreId: e.target.value })}>
            <option value="">Sélectionner...</option>
            {typesEligibles.map((t) => (
              <option key={t.id} value={t.id}>{t.nom} (max {t.capaciteMax} pers.)</option>
            ))}
          </select>
        </div>

        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--color-ink-3)' }}>CLIENT</p>
          <div className="space-y-3">
            <input placeholder="Nom complet" required className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Téléphone" required className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              <input type="email" placeholder="Email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? 'Création...' : 'Créer la réservation'}
        </button>
      </form>
    </Modal>
  );
}
