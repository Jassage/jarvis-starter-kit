'use client';
import { useEffect, useState } from 'react';
import { UtensilsCrossed, Plus } from 'lucide-react';
import { useRestaurantStore, CategorieMenuItem } from '@/stores/restaurantStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const CATEGORIE_LABEL: Record<CategorieMenuItem, string> = {
  ENTREE: 'Entrée',
  PLAT: 'Plat',
  DESSERT: 'Dessert',
  BOISSON: 'Boisson',
  CARTE_BAR: 'Carte bar',
};

export default function RestaurantMenuPage() {
  const { menu, pointsDeVente, fetchMenu, fetchPointsDeVente, creerMenuItem, updateMenuItem } = useRestaurantStore();
  const [form, setForm] = useState({ pointDeVenteId: '', nom: '', prix: '', devise: 'HTG' as 'HTG' | 'USD', categorie: 'PLAT' as CategorieMenuItem });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenu();
    fetchPointsDeVente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creerMenuItem({ ...form, prix: Number(form.prix) });
      setForm({ ...form, nom: '', prix: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer cet item');
    }
  };

  const toggleDisponible = (id: string, disponible: boolean) => updateMenuItem(id, { disponible: !disponible });

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <select required className="input" value={form.pointDeVenteId} onChange={(e) => setForm({ ...form, pointDeVenteId: e.target.value })}>
          <option value="">Point de vente...</option>
          {pointsDeVente.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
        <input required placeholder="Nom" className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
        <input required type="number" min={0} step="0.01" placeholder="Prix" className="input" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
        <select className="input" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value as CategorieMenuItem })}>
          {Object.entries(CATEGORIE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Ajouter</button>
        {error && <div className="sm:col-span-5 p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      </form>

      <div className="card overflow-x-auto">
        {menu.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title="Aucun item de menu" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Nom</th><th>Point de vente</th><th>Catégorie</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {menu.map((m) => (
                <tr key={m.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{m.nom}</td>
                  <td>{m.pointDeVente?.nom}</td>
                  <td>{CATEGORIE_LABEL[m.categorie]}</td>
                  <td>{Number(m.prix).toLocaleString('fr-FR')} {m.devise}</td>
                  <td><Badge tone={m.disponible ? 'success' : 'neutral'}>{m.disponible ? 'Disponible' : 'Indisponible'}</Badge></td>
                  <td>
                    <button onClick={() => toggleDisponible(m.id, m.disponible)} className="text-xs font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                      {m.disponible ? 'Rendre indisponible' : 'Rendre disponible'}
                    </button>
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
