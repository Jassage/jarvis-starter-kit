'use client';
import { useEffect, useState } from 'react';
import { Car, Plus, LogOut } from 'lucide-react';
import { useVoiturierStore } from '@/stores/voiturierStore';
import { useChambresStore } from '@/stores/chambresStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function VoiturierPage() {
  const { vehicules, fetchVehicules, enregistrerVehicule, marquerDepart } = useVoiturierStore();
  const { chambres, fetchAll } = useChambresStore();
  const [form, setForm] = useState({ chambreId: '', plaqueImmatriculation: '', emplacement: '' });
  const [montants, setMontants] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicules();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chambresOccupees = chambres.filter((c) => c.statut === 'OCCUPEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await enregistrerVehicule(form);
      setForm({ chambreId: '', plaqueImmatriculation: '', emplacement: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d\'enregistrer ce véhicule');
    }
  };

  const handleDepart = async (id: string) => {
    const montantStr = montants[id];
    const montant = montantStr ? Number(montantStr) : undefined;
    try {
      await marquerDepart(id, montant);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible d\'enregistrer le départ');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <select required className="input" value={form.chambreId} onChange={(e) => setForm({ ...form, chambreId: e.target.value })}>
          <option value="">Chambre occupée...</option>
          {chambresOccupees.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
        </select>
        <input required placeholder="Plaque d'immatriculation" className="input" value={form.plaqueImmatriculation} onChange={(e) => setForm({ ...form, plaqueImmatriculation: e.target.value })} />
        <input required placeholder="Emplacement" className="input" value={form.emplacement} onChange={(e) => setForm({ ...form, emplacement: e.target.value })} />
        <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Enregistrer</button>
        {error && <div className="sm:col-span-4 p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      </form>

      <div className="card overflow-x-auto">
        {vehicules.length === 0 ? (
          <EmptyState icon={Car} title="Aucun véhicule enregistré" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Chambre</th><th>Plaque</th><th>Emplacement</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {vehicules.map((v) => (
                <tr key={v.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{v.chambre.numero}</td>
                  <td>{v.plaqueImmatriculation}</td>
                  <td>{v.emplacement}</td>
                  <td><Badge tone={v.dateDepart ? 'neutral' : 'success'}>{v.dateDepart ? 'Parti' : 'Stationné'}</Badge></td>
                  <td>
                    {!v.dateDepart && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={0} placeholder="Supplément (optionnel)"
                          className="input" style={{ width: '10rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          value={montants[v.id] || ''}
                          onChange={(e) => setMontants({ ...montants, [v.id]: e.target.value })}
                        />
                        <button onClick={() => handleDepart(v.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                          <LogOut className="w-3.5 h-3.5" />
                          Marquer parti
                        </button>
                      </div>
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
