'use client';
import { useEffect, useState } from 'react';
import { useFournisseurStore, Fournisseur } from '@/stores/fournisseurStore';
import Modal from '@/components/ui/Modal';

function FournisseurForm({ fournisseur, onDone }: { fournisseur?: Fournisseur; onDone: () => void }) {
  const { createFournisseur, updateFournisseur } = useFournisseurStore();
  const [form, setForm] = useState({ nom: fournisseur?.nom ?? '', telephone: fournisseur?.telephone ?? '', adresse: fournisseur?.adresse ?? '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { nom: form.nom.trim(), telephone: form.telephone.trim() || undefined, adresse: form.adresse.trim() || undefined };
      if (fournisseur) await updateFournisseur(fournisseur.id, payload);
      else await createFournisseur(payload);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
        <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
        <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-ink-2)' }}>Adresse</label>
        <input className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
      </div>
      {error && <div className="text-sm p-3 rounded-xl" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50" style={{ background: 'var(--color-primary-2)' }}>
        {submitting ? 'Enregistrement...' : fournisseur ? 'Mettre à jour' : 'Créer le fournisseur'}
      </button>
    </form>
  );
}

export default function FournisseursPage() {
  const { fournisseurs, fetchFournisseurs, archiveFournisseur } = useFournisseurStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | undefined>(undefined);

  useEffect(() => { fetchFournisseurs(); }, [fetchFournisseurs]);

  const handleSearch = async (v: string) => { setSearch(v); await fetchFournisseurs(v || undefined); };

  const handleArchive = async (f: Fournisseur) => {
    if (!confirm(`Archiver "${f.nom}" ?`)) return;
    try { await archiveFournisseur(f.id); } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input className="input sm:max-w-xs" placeholder="Rechercher un fournisseur..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        <button onClick={() => { setEditing(undefined); setModalOpen(true); }} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0" style={{ background: 'var(--color-primary-2)' }}>
          + Nouveau fournisseur
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-line-2)' }}>
                {['Nom', 'Téléphone', 'Adresse', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id} className="border-t" style={{ borderColor: 'var(--color-line-2)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-ink)' }}>{f.nom}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-2)' }}>{f.telephone || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-ink-2)' }}>{f.adresse || '—'}</td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => { setEditing(f); setModalOpen(true); }} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>Modifier</button>
                    <button onClick={() => handleArchive(f)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>Archiver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {fournisseurs.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--color-ink-3)' }}>Aucun fournisseur pour le moment.</div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}>
        <FournisseurForm fournisseur={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
