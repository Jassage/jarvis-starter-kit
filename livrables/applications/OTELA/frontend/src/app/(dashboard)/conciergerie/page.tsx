'use client';
import { useEffect, useState } from 'react';
import { Bell, Plus, UserCheck, Check } from 'lucide-react';
import { useConciergerieStore, StatutConciergerie } from '@/stores/conciergerieStore';
import { useChambresStore } from '@/stores/chambresStore';
import { useAuthStore } from '@/stores/authStore';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const STATUT_TONE: Record<StatutConciergerie, 'warning' | 'info' | 'success'> = {
  RECUE: 'warning',
  EN_COURS: 'info',
  TERMINEE: 'success',
};

const STATUT_LABEL: Record<StatutConciergerie, string> = {
  RECUE: 'Reçue',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
};

export default function ConciergeriePage() {
  const { demandes, fetchDemandes, creerDemande, assigner, terminer } = useConciergerieStore();
  const { chambres, fetchAll } = useChambresStore();
  const { employe } = useAuthStore();
  const [form, setForm] = useState({ chambreId: '', description: '' });
  const [montants, setMontants] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDemandes();
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chambresOccupees = chambres.filter((c) => c.statut === 'OCCUPEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await creerDemande(form);
      setForm({ chambreId: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de créer cette demande');
    }
  };

  const prendreEnCharge = async (id: string) => {
    if (!employe) return;
    try {
      await assigner(id, employe.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de prendre en charge cette demande');
    }
  };

  const handleTerminer = async (id: string) => {
    const montantStr = montants[id];
    const montant = montantStr ? Number(montantStr) : undefined;
    try {
      await terminer(id, montant);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impossible de clôturer cette demande');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <select required className="input" value={form.chambreId} onChange={(e) => setForm({ ...form, chambreId: e.target.value })}>
          <option value="">Chambre occupée...</option>
          {chambresOccupees.map((c) => <option key={c.id} value={c.id}>{c.typeChambre.nom} — {c.numero}</option>)}
        </select>
        <input required placeholder="Description de la demande" className="input sm:col-span-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn btn-primary"><Plus className="w-4 h-4" />Créer</button>
        {error && <div className="sm:col-span-4 p-2.5 rounded-xl text-xs" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
      </form>

      <div className="card overflow-x-auto">
        {demandes.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune demande de conciergerie" />
        ) : (
          <table className="table-shell w-full">
            <thead><tr><th>Chambre</th><th>Description</th><th>Assignée à</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id}>
                  <td className="font-semibold" style={{ color: 'var(--color-ink)' }}>{d.chambre.numero}</td>
                  <td>{d.description}</td>
                  <td>{d.employeAssigne?.nom || '—'}</td>
                  <td><Badge tone={STATUT_TONE[d.statut]}>{STATUT_LABEL[d.statut]}</Badge></td>
                  <td>
                    {d.statut === 'RECUE' && (
                      <button onClick={() => prendreEnCharge(d.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-primary-2)' }}>
                        <UserCheck className="w-3.5 h-3.5" />
                        Prendre en charge
                      </button>
                    )}
                    {d.statut === 'EN_COURS' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min={0} placeholder="Montant (optionnel)"
                          className="input" style={{ width: '9rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          value={montants[d.id] || ''}
                          onChange={(e) => setMontants({ ...montants, [d.id]: e.target.value })}
                        />
                        <button onClick={() => handleTerminer(d.id)} className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                          <Check className="w-3.5 h-3.5" />
                          Terminer
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
