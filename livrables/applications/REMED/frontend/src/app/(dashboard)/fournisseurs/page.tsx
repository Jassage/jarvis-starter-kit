'use client';
import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Fournisseur } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

const CAN_GERER = ['SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'MAGASINIER'];
const formVide = { nom: '', contact: '', telephone: '', email: '', adresse: '' };

export default function FournisseursPage() {
  const { utilisateur } = useAuthStore();
  const peutGerer = utilisateur ? CAN_GERER.includes(utilisateur.role) : false;

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [fournisseurEdite, setFournisseurEdite] = useState<Fournisseur | null>(null);
  const [form, setForm] = useState(formVide);
  const [enregistrement, setEnregistrement] = useState(false);

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/fournisseurs', { params: { tous: true } });
      setFournisseurs(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les fournisseurs'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = fournisseurs.filter((f) => f.nom.toLowerCase().includes(recherche.toLowerCase()));

  function ouvrirCreation() {
    setFournisseurEdite(null);
    setForm(formVide);
    setModalOuvert(true);
  }

  function ouvrirEdition(f: Fournisseur) {
    setFournisseurEdite(f);
    setForm({ nom: f.nom, contact: f.contact || '', telephone: f.telephone || '', email: f.email || '', adresse: f.adresse || '' });
    setModalOuvert(true);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      if (fournisseurEdite) {
        await api.patch(`/fournisseurs/${fournisseurEdite.id}`, form);
      } else {
        await api.post('/fournisseurs', form);
      }
      setModalOuvert(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'enregistrer le fournisseur"));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar
        search={recherche}
        onSearch={setRecherche}
        searchPlaceholder="Nom du fournisseur..."
        actionLabel={peutGerer ? 'Nouveau fournisseur' : undefined}
        onAction={peutGerer ? ouvrirCreation : undefined}
      />

      {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={Truck} title="Aucun fournisseur" hint="Ajoutez votre premier fournisseur" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((f) => (
                  <tr key={f.id} className={peutGerer ? 'cursor-pointer' : ''} onClick={() => peutGerer && ouvrirEdition(f)}>
                    <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{f.nom}</td>
                    <td>{f.contact || '—'}</td>
                    <td>{f.telephone || '—'}</td>
                    <td>{f.email || '—'}</td>
                    <td><Badge tone={f.actif ? 'success' : 'neutral'}>{f.actif ? 'Actif' : 'Inactif'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOuvert} onClose={() => setModalOuvert(false)} title={fournisseurEdite ? 'Modifier le fournisseur' : 'Nouveau fournisseur'} maxWidth={520}>
        <form onSubmit={enregistrer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
            <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Contact</label>
            <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Téléphone</label>
              <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Adresse</label>
            <input className="input" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </div>

          {fournisseurEdite && (
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-ink-2)' }}>
              <input
                type="checkbox"
                checked={fournisseurEdite.actif}
                onChange={async (e) => {
                  await api.patch(`/fournisseurs/${fournisseurEdite.id}`, { actif: e.target.checked });
                  setFournisseurEdite({ ...fournisseurEdite, actif: e.target.checked });
                  await charger();
                }}
              />
              Fournisseur actif
            </label>
          )}

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOuvert(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
