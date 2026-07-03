'use client';
import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useFournisseurStore, Fournisseur } from '@/stores/fournisseurStore';
import Modal from '@/components/ui/Modal';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';

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
      <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">
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
      <PageToolbar search={search} onSearch={handleSearch} searchPlaceholder="Rechercher un fournisseur..." actionLabel="Nouveau fournisseur" onAction={() => { setEditing(undefined); setModalOpen(true); }} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-shell">
            <thead>
              <tr>
                {['Nom', 'Téléphone', 'Adresse', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((f) => (
                <tr key={f.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{f.nom}</td>
                  <td>{f.telephone || '—'}</td>
                  <td>{f.adresse || '—'}</td>
                  <td className="text-right space-x-3 whitespace-nowrap">
                    <button onClick={() => { setEditing(f); setModalOpen(true); }} className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }}>Modifier</button>
                    <button onClick={() => handleArchive(f)} className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>Archiver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {fournisseurs.length === 0 && (
          <EmptyState icon={Building2} title="Aucun fournisseur pour le moment" />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}>
        <FournisseurForm fournisseur={editing} onDone={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
