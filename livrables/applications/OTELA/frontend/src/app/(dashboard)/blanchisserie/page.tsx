'use client';
import { useEffect, useState } from 'react';
import { Shirt, Plus, ArrowRight } from 'lucide-react';
import { useBlanchisserieStore, StatutBlanchisserie } from '@/stores/blanchisserieStore';
import { useChambresStore } from '@/stores/chambresStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const STATUT_TONE: Record<StatutBlanchisserie, 'warning' | 'info' | 'violet' | 'success'> = {
  RECUE: 'warning',
  EN_TRAITEMENT: 'info',
  PRETE: 'violet',
  LIVREE: 'success',
};

const STATUT_LABEL: Record<StatutBlanchisserie, string> = {
  RECUE: 'Reçue',
  EN_TRAITEMENT: 'En traitement',
  PRETE: 'Prête',
  LIVREE: 'Livrée',
};

const PROCHAIN: Record<StatutBlanchisserie, StatutBlanchisserie | null> = {
  RECUE: 'EN_TRAITEMENT',
  EN_TRAITEMENT: 'PRETE',
  PRETE: 'LIVREE',
  LIVREE: null,
};

export default function BlanchisseriePage() {
  const { commandes, fetchCommandes, creerCommande, updateStatut } = useBlanchisserieStore();
  const { chambres, fetchAll } = useChambresStore();
  const [form, setForm] = useState({ chambreId: '', articles: '', montant: '', devise: 'HTG' as 'HTG' | 'USD' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommandes();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chambresOccupees = chambres.filter((c) => c.statut === 'OCCUPEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creerCommande({ chambreId: form.chambreId, articles: form.articles, montant: Number(form.montant), devise: form.devise });
      setForm({ chambreId: '', articles: '', montant: '', devise: 'HTG' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer cette commande');
    }
  };

  const avancer = async (id: string, statut: StatutBlanchisserie) => {
    const suivant = PROCHAIN[statut];
    if (!suivant) return;
    try {
      await updateStatut(id, suivant);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de mettre à jour cette commande');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <select required className="input" value={form.chambreId} onChange={(e) => setForm({ ...form, chambreId: e.target.value })}>
          <option value="">Chambre occupée...</option>
          {chambresOccupees.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
        </select>
        <input required placeholder="Articles (ex: 3 chemises...)" className="input sm:col-span-2" value={form.articles} onChange={(e) => setForm({ ...form, articles: e.target.value })} />
        <input required type="number" min={0} step="0.01" placeholder="Montant" className="input" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
        <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Créer</button>
        {error && <div className="sm:col-span-5 p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      </form>

      <div className="card overflow-x-auto">
        {commandes.length === 0 ? (
          <EmptyState icon={Shirt} title="Aucune commande de blanchisserie" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Chambre</th><th>Articles</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{c.chambre.numero}</td>
                  <td>{c.articles}</td>
                  <td>{Number(c.montant).toLocaleString('fr-FR')} {c.devise}</td>
                  <td><Badge tone={STATUT_TONE[c.statut]}>{STATUT_LABEL[c.statut]}</Badge></td>
                  <td>
                    {PROCHAIN[c.statut] && (
                      <button onClick={() => avancer(c.id, c.statut)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <ArrowRight className="w-3.5 h-3.5" />
                        Marquer {STATUT_LABEL[PROCHAIN[c.statut]!].toLowerCase()}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
