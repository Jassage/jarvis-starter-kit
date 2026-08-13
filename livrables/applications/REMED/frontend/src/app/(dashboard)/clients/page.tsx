'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Client } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

const formVide = { nom: '', prenom: '', telephone: '', email: '', adresse: '', dateNaissance: '', sexe: '', notes: '' };

function formatHTG(v: string | number) {
  return new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG', maximumFractionDigits: 2 }).format(Number(v));
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [clientEdite, setClientEdite] = useState<Client | null>(null);
  const [form, setForm] = useState(formVide);
  const [enregistrement, setEnregistrement] = useState(false);
  const [detail, setDetail] = useState<Client | null>(null);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/clients', { params: recherche ? { recherche } : undefined });
      setClients(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les clients'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(charger, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  function ouvrirCreation() {
    setClientEdite(null);
    setForm(formVide);
    setModalOuvert(true);
  }

  function ouvrirEdition(c: Client) {
    setClientEdite(c);
    setForm({
      nom: c.nom,
      prenom: c.prenom || '',
      telephone: c.telephone || '',
      email: c.email || '',
      adresse: c.adresse || '',
      dateNaissance: c.dateNaissance ? c.dateNaissance.slice(0, 10) : '',
      sexe: c.sexe || '',
      notes: c.notes || '',
    });
    setModalOuvert(true);
  }

  async function voirDetail(c: Client) {
    try {
      const { data } = await api.get(`/clients/${c.id}`);
      setDetail(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger le détail du client'));
    }
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      const payload = { ...form, dateNaissance: form.dateNaissance || undefined };
      if (clientEdite) {
        await api.patch(`/clients/${clientEdite.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      setModalOuvert(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer le client"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar
        search={recherche}
        onSearch={setRecherche}
        searchPlaceholder="Nom, prénom, téléphone..."
        actionLabel="Nouveau client"
        onAction={ouvrirCreation}
      />

      {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && clients.length === 0 ? (
          <EmptyState icon={Users} title="Aucun client" hint="Ajoutez votre premier client" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium cursor-pointer" style={{ color: 'var(--color-ink)' }} onClick={() => voirDetail(c)}>
                      {c.nom} {c.prenom || ''}
                    </td>
                    <td>{c.telephone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>
                      <button className="text-xs font-semibold" style={{ color: 'var(--color-primary-2)' }} onClick={() => ouvrirEdition(c)}>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOuvert} onClose={() => setModalOuvert(false)} title={clientEdite ? 'Modifier le client' : 'Nouveau client'} maxWidth={520}>
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Prénom</label>
              <input className="input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
              <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Date de naissance</label>
              <input type="date" className="input" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Sexe</label>
              <select className="input" value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })}>
                <option value="">Non précisé</option>
                <option value="F">F</option>
                <option value="M">M</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Adresse</label>
            <input className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.nom} ${detail.prenom || ''}` : ''} maxWidth={520}>
        {detail && (
          <div className="space-y-4">
            <div className="text-sm space-y-1" style={{ color: 'var(--color-ink-2)' }}>
              {detail.telephone && <p>Téléphone : {detail.telephone}</p>}
              {detail.email && <p>Email : {detail.email}</p>}
              {detail.adresse && <p>Adresse : {detail.adresse}</p>}
            </div>
            <div>
              <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Historique des ventes</h4>
              {!detail.ventes || detail.ventes.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Aucune vente enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {detail.ventes.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-sm">
                      <span>{v.numero} · {new Date(v.createdAt).toLocaleDateString('fr-FR')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatHTG(v.montantTotal)}</span>
                        <Badge tone={v.statut === 'ANNULEE' ? 'danger' : 'success'}>{v.statut === 'ANNULEE' ? 'Annulée' : 'OK'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
