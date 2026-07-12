'use client';
import { useEffect, useState } from 'react';
import { Wine, Plus } from 'lucide-react';
import { useMinibarStore } from '@/stores/minibarStore';
import { useChambresStore } from '@/stores/chambresStore';
import EmptyState from '@/components/ui/EmptyState';

export default function MinibarPage() {
  const { articles, consommations, fetchArticles, fetchConsommations, constaterConsommation } = useMinibarStore();
  const { chambres, fetchAll } = useChambresStore();
  const [chambreId, setChambreId] = useState('');
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchConsommations();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chambresOccupees = chambres.filter((c) => c.statut === 'OCCUPEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const articlesChoisis = Object.entries(quantites).filter(([, q]) => q > 0).map(([articleMinibarId, quantite]) => ({ articleMinibarId, quantite }));
    if (!chambreId || articlesChoisis.length === 0) {
      setError('Sélectionnez une chambre et au moins un article');
      return;
    }
    setSubmitting(true);
    try {
      await constaterConsommation(chambreId, articlesChoisis);
      setChambreId('');
      setQuantites({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d\'ajouter cette consommation au folio');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <p className="text-xs font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>CONTRÔLE DE CHAMBRE</p>
        <select required className="input" value={chambreId} onChange={(e) => setChambreId(e.target.value)}>
          <option value="">Chambre occupée...</option>
          {chambresOccupees.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
        </select>

        <div className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-ink-2)' }}>{a.nom} — {Number(a.prix).toLocaleString('fr-FR')} {a.devise}</span>
              <input
                type="number" min={0} placeholder="0"
                className="input" style={{ width: '5rem', padding: '0.35rem 0.6rem' }}
                value={quantites[a.id] || ''}
                onChange={(e) => setQuantites({ ...quantites, [a.id]: Number(e.target.value) })}
              />
            </div>
          ))}
        </div>

        {error && <div className="p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          <Plus className="w-4 h-4" />
          Ajouter au folio
        </button>
      </form>

      <div className="card overflow-x-auto">
        {consommations.length === 0 ? (
          <EmptyState icon={Wine} title="Aucune consommation constatée" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Chambre</th><th>Article</th><th>Quantité</th><th>Date</th></tr></thead>
            <tbody>
              {consommations.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.chambre.numero}</td>
                  <td>{c.articleMinibar.nom}</td>
                  <td>{c.quantite}</td>
                  <td>{new Date(c.dateConstat).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
