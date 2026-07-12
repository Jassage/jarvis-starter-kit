'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useSpaStore } from '@/stores/spaStore';

export default function RendezVousModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { services, praticiens, fetchServices, fetchPraticiens, creerRendezVous } = useSpaStore();
  const [form, setForm] = useState({ serviceSpaId: '', praticienId: '', date: '', heure: '', nom: '', telephone: '', email: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchPraticiens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerRendezVous({
        serviceSpaId: form.serviceSpaId,
        praticienId: form.praticienId,
        dateHeure: new Date(`${form.date}T${form.heure}:00`).toISOString(),
        client: { nom: form.nom, telephone: form.telephone, email: form.email },
      });
      onClose();
      setForm({ serviceSpaId: '', praticienId: '', date: '', heure: '', nom: '', telephone: '', email: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le rendez-vous');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau rendez-vous spa" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Service</label>
          <select required className="input" value={form.serviceSpaId} onChange={(e) => setForm({ ...form, serviceSpaId: e.target.value })}>
            <option value="">Sélectionner...</option>
            {services.filter((s) => s.actif).map((s) => (
              <option key={s.id} value={s.id}>{s.nom} ({s.dureeMinutes} min — {Number(s.prix).toLocaleString('fr-FR')} {s.devise})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Praticien</label>
          <select required className="input" value={form.praticienId} onChange={(e) => setForm({ ...form, praticienId: e.target.value })}>
            <option value="">Sélectionner...</option>
            {praticiens.filter((p) => p.actif).map((p) => (
              <option key={p.id} value={p.id}>{p.nom}{p.specialites ? ` — ${p.specialites}` : ''}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Date</label>
            <input type="date" required className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Heure</label>
            <input type="time" required className="input" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
          </div>
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

        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? 'Création...' : 'Créer le rendez-vous'}
        </button>
      </form>
    </Modal>
  );
}
