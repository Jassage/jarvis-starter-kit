'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChambresStore } from '@/stores/chambresStore';

const AUJOURDHUI = new Date().toISOString().slice(0, 10);
const DANS_UN_AN = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

const FORM_VIDE = { nom: '', capaciteMax: 2, nombreLits: 1, superficie: '', description: '', tarifHtg: '', tarifUsd: '', equipements: [] as string[] };

export default function TypeChambreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { creerType, creerTarif } = useChambresStore();
  const [form, setForm] = useState(FORM_VIDE);
  const [nouvelEquipement, setNouvelEquipement] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ajouterEquipement = () => {
    const v = nouvelEquipement.trim();
    if (v && !form.equipements.includes(v)) setForm({ ...form, equipements: [...form.equipements, v] });
    setNouvelEquipement('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await creerType({
        nom: form.nom,
        capaciteMax: form.capaciteMax,
        description: form.description || undefined,
        nombreLits: form.nombreLits,
        superficie: form.superficie ? Number(form.superficie) : null,
        equipements: form.equipements,
      });
      const { types } = useChambresStore.getState();
      const nouveauType = types.find((t) => t.nom === form.nom && t.capaciteMax === form.capaciteMax);
      if (nouveauType) {
        if (form.tarifHtg) await creerTarif(nouveauType.id, { devise: 'HTG', typeSejour: 'NUITEE', montant: Number(form.tarifHtg), dateDebutSaison: AUJOURDHUI, dateFinSaison: DANS_UN_AN });
        if (form.tarifUsd) await creerTarif(nouveauType.id, { devise: 'USD', typeSejour: 'NUITEE', montant: Number(form.tarifUsd), dateDebutSaison: AUJOURDHUI, dateFinSaison: DANS_UN_AN });
      }
      onClose();
      setForm(FORM_VIDE);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer le type de chambre');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau type de chambre" maxWidth={480}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
          <input required placeholder="Ex. Suite" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Capacité max</label>
            <input type="number" min={1} max={50} required className="input" value={form.capaciteMax} onChange={(e) => setForm({ ...form, capaciteMax: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nombre de lits</label>
            <input type="number" min={1} max={20} required className="input" value={form.nombreLits} onChange={(e) => setForm({ ...form, nombreLits: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Superficie m²</label>
            <input type="number" min={1} max={2000} className="input" value={form.superficie} onChange={(e) => setForm({ ...form, superficie: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Équipements</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.equipements.map((eq) => (
              <span key={eq} className="badge inline-flex items-center gap-1">{eq}
                <button type="button" onClick={() => setForm({ ...form, equipements: form.equipements.filter((x) => x !== eq) })}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" value={nouvelEquipement} placeholder="Climatisation, Wi-Fi..." onChange={(e) => setNouvelEquipement(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterEquipement(); } }} />
            <button type="button" className="btn btn-secondary shrink-0" onClick={ajouterEquipement}>Ajouter</button>
          </div>
        </div>
        <div className="pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'var(--color-ink-3)' }}>TARIF INITIAL (optionnel, sur 1 an)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tarif / nuit (HTG)</label>
              <input type="number" min={0} className="input" value={form.tarifHtg} onChange={(e) => setForm({ ...form, tarifHtg: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Tarif / nuit (USD)</label>
              <input type="number" min={0} className="input" value={form.tarifUsd} onChange={(e) => setForm({ ...form, tarifUsd: e.target.value })} />
            </div>
          </div>
        </div>
        {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">{submitting ? 'Création...' : 'Créer le type de chambre'}</button>
      </form>
    </Modal>
  );
}
