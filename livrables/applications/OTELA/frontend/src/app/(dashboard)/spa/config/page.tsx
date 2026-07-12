'use client';
import { useEffect, useState } from 'react';
import { Sparkle, Users, Plus } from 'lucide-react';
import { useSpaStore } from '@/stores/spaStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function SpaConfigPage() {
  const { services, praticiens, fetchServices, fetchPraticiens, creerService, updateService, creerPraticien, updatePraticien } = useSpaStore();
  const [serviceForm, setServiceForm] = useState({ nom: '', dureeMinutes: '', prix: '', devise: 'HTG' as 'HTG' | 'USD' });
  const [praticienForm, setPraticienForm] = useState({ nom: '', specialites: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchPraticiens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creerService({ nom: serviceForm.nom, dureeMinutes: Number(serviceForm.dureeMinutes), prix: Number(serviceForm.prix), devise: serviceForm.devise });
      setServiceForm({ nom: '', dureeMinutes: '', prix: '', devise: 'HTG' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer ce service');
    }
  };

  const handlePraticienSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creerPraticien({ nom: praticienForm.nom, specialites: praticienForm.specialites || undefined });
      setPraticienForm({ nom: '', specialites: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer ce praticien');
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>SERVICES</h2>
        <form onSubmit={handleServiceSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <input required placeholder="Nom" className="input" value={serviceForm.nom} onChange={(e) => setServiceForm({ ...serviceForm, nom: e.target.value })} />
          <input required type="number" min={1} placeholder="Durée (min)" className="input" value={serviceForm.dureeMinutes} onChange={(e) => setServiceForm({ ...serviceForm, dureeMinutes: e.target.value })} />
          <input required type="number" min={0} step="0.01" placeholder="Prix" className="input" value={serviceForm.prix} onChange={(e) => setServiceForm({ ...serviceForm, prix: e.target.value })} />
          <select className="input" value={serviceForm.devise} onChange={(e) => setServiceForm({ ...serviceForm, devise: e.target.value as 'HTG' | 'USD' })}>
            <option value="HTG">HTG</option>
            <option value="USD">USD</option>
          </select>
          <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Ajouter</button>
        </form>

        <div className="card overflow-x-auto">
          {services.length === 0 ? (
            <EmptyState icon={Sparkle} title="Aucun service" />
          ) : (
            <table className="table-shell w-full">
              <thead><tr><th>Nom</th><th>Durée</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{s.nom}</td>
                    <td>{s.dureeMinutes} min</td>
                    <td>{Number(s.prix).toLocaleString('fr-FR')} {s.devise}</td>
                    <td><Badge tone={s.actif ? 'success' : 'neutral'}>{s.actif ? 'Actif' : 'Inactif'}</Badge></td>
                    <td>
                      <button onClick={() => updateService(s.id, { actif: !s.actif })} className="text-xs font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                        {s.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold tracking-widest" style={{ color: 'var(--color-ink-3)' }}>PRATICIENS</h2>
        <form onSubmit={handlePraticienSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <input required placeholder="Nom" className="input" value={praticienForm.nom} onChange={(e) => setPraticienForm({ ...praticienForm, nom: e.target.value })} />
          <input placeholder="Spécialités" className="input" value={praticienForm.specialites} onChange={(e) => setPraticienForm({ ...praticienForm, specialites: e.target.value })} />
          <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Ajouter</button>
        </form>

        {error && <div className="p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

        <div className="card overflow-x-auto">
          {praticiens.length === 0 ? (
            <EmptyState icon={Users} title="Aucun praticien" />
          ) : (
            <table className="table-shell w-full">
              <thead><tr><th>Nom</th><th>Spécialités</th><th>Statut</th><th></th></tr></thead>
              <tbody>
                {praticiens.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{p.nom}</td>
                    <td>{p.specialites || '—'}</td>
                    <td><Badge tone={p.actif ? 'success' : 'neutral'}>{p.actif ? 'Actif' : 'Inactif'}</Badge></td>
                    <td>
                      <button onClick={() => updatePraticien(p.id, { actif: !p.actif })} className="text-xs font-semibold" style={{ color: 'var(--color-ink-2)' }}>
                        {p.actif ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
