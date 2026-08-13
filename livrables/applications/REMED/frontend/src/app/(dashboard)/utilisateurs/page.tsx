'use client';
import { useEffect, useState } from 'react';
import { Users as UsersIcon, KeyRound, Ban, CheckCircle2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Utilisateur, Role } from '@/lib/types';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';

const ROLES: { value: Role; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'GERANT', label: 'Gérant' },
  { value: 'PHARMACIEN', label: 'Pharmacien' },
  { value: 'VENDEUR', label: 'Vendeur' },
  { value: 'MAGASINIER', label: 'Magasinier' },
];

export default function UtilisateursPage() {
  const { utilisateur: moi } = useAuthStore();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState('');

  const [modalCreation, setModalCreation] = useState(false);
  const [form, setForm] = useState({ email: '', motDePasse: '', nom: '', prenom: '', telephone: '', role: 'VENDEUR' as Role });
  const [enregistrement, setEnregistrement] = useState(false);

  const [modalReset, setModalReset] = useState<Utilisateur | null>(null);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');

  async function charger() {
    setChargement(true);
    try {
      const { data } = await api.get('/utilisateurs');
      setUtilisateurs(data.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de charger les utilisateurs'));
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const filtres = utilisateurs.filter(
    (u) => `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(recherche.toLowerCase())
  );

  function ouvrirCreation() {
    setForm({ email: '', motDePasse: '', nom: '', prenom: '', telephone: '', role: 'VENDEUR' });
    setError('');
    setModalCreation(true);
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setError('');
    try {
      await api.post('/utilisateurs', { ...form, telephone: form.telephone || undefined });
      setModalCreation(false);
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de créer le compte'));
    } finally {
      setEnregistrement(false);
    }
  }

  async function changerRole(u: Utilisateur, role: Role) {
    setError('');
    try {
      await api.patch(`/utilisateurs/${u.id}`, { role });
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de changer le rôle'));
    }
  }

  async function basculerActif(u: Utilisateur) {
    setError('');
    try {
      await api.patch(`/utilisateurs/${u.id}`, { actif: !u.actif });
      await charger();
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de mettre à jour le statut'));
    }
  }

  async function reinitialiserMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    if (!modalReset) return;
    setEnregistrement(true);
    setError('');
    try {
      await api.post(`/utilisateurs/${modalReset.id}/reset-password`, { nouveauMotDePasse });
      setModalReset(null);
      setNouveauMotDePasse('');
    } catch (err) {
      setError(apiErrorMessage(err, 'Impossible de réinitialiser le mot de passe'));
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageToolbar search={recherche} onSearch={setRecherche} searchPlaceholder="Nom ou email..." actionLabel="Nouvel utilisateur" onAction={ouvrirCreation} />

      {error && !modalCreation && !modalReset && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

      <div className="card overflow-hidden">
        {!chargement && filtres.length === 0 ? (
          <EmptyState icon={UsersIcon} title="Aucun utilisateur" hint="Créez le premier compte de votre équipe" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-shell w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((u) => {
                  const cestMoi = u.id === moi?.id;
                  return (
                    <tr key={u.id}>
                      <td className="font-medium" style={{ color: 'var(--color-ink)' }}>{u.prenom} {u.nom}{cestMoi ? ' (vous)' : ''}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="input py-1 text-xs"
                          value={u.role}
                          disabled={cestMoi}
                          onChange={(e) => changerRole(u, e.target.value as Role)}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      <td><Badge tone={u.actif ? 'success' : 'danger'}>{u.actif ? 'Actif' : 'Désactivé'}</Badge></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModalReset(u)} title="Réinitialiser le mot de passe" style={{ color: 'var(--color-primary-2)' }}>
                            <KeyRound className="w-4 h-4" />
                          </button>
                          {!cestMoi && (
                            <button onClick={() => basculerActif(u)} title={u.actif ? 'Désactiver' : 'Réactiver'} style={{ color: u.actif ? 'var(--color-danger)' : 'var(--color-success)' }}>
                              {u.actif ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalCreation} onClose={() => setModalCreation(false)} title="Nouvel utilisateur" maxWidth={480}>
        <form onSubmit={creer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Prénom</label>
              <input className="input" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nom</label>
              <input className="input" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Mot de passe initial</label>
            <input type="text" className="input" required minLength={8} value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} />
            <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Au moins 8 caractères. À communiquer à l&apos;employé, il n&apos;y a pas d&apos;email automatique.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Téléphone (optionnel)</label>
            <input className="input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Rôle</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCreation(false)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Création...' : 'Créer le compte'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!modalReset} onClose={() => setModalReset(null)} title={modalReset ? `Réinitialiser le mot de passe de ${modalReset.prenom} ${modalReset.nom}` : ''} maxWidth={440}>
        <form onSubmit={reinitialiserMotDePasse} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--color-ink-2)' }}>Nouveau mot de passe</label>
            <input type="text" className="input" required minLength={8} value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-ink-3)' }}>Les sessions actives de cet utilisateur seront immédiatement révoquées.</p>
          {error && <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalReset(null)}>Annuler</button>
            <button type="submit" disabled={enregistrement} className="btn btn-primary">{enregistrement ? 'Enregistrement...' : 'Réinitialiser'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
