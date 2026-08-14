'use client';
import { useCallback, useEffect, useState } from 'react';
import { Users, ShieldCheck, KeyRound, Copy, Check, UserPlus } from 'lucide-react';
import { useUtilisateurStore, Utilisateur, LienReinitialisation } from '@/stores/utilisateurStore';
import { useAuthStore, Role } from '@/stores/authStore';
import { useToastStore, messageErreur } from '@/stores/toastStore';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import PageToolbar from '@/components/ui/PageToolbar';
import EmptyState from '@/components/ui/EmptyState';

const ROLE_LABEL: Record<Role, string> = {
  ADMINISTRATEUR: 'Administrateur',
  OPERATEUR_REGIE: 'Opérateur régie',
};

export default function UtilisateursPage() {
  const { utilisateurs, isLoading, fetchUtilisateurs, createUtilisateur, updateUtilisateur, genererLien } =
    useUtilisateurStore();
  const moi = useAuthStore((s) => s.utilisateur);
  const { succes, erreur } = useToastStore();

  const [recherche, setRecherche] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', nom: '', password: '', role: 'OPERATEUR_REGIE' as Role });
  const [enCours, setEnCours] = useState(false);
  const [lien, setLien] = useState<LienReinitialisation | null>(null);
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    try {
      await fetchUtilisateurs();
    } catch (e) {
      erreur(messageErreur(e, 'Chargement des comptes impossible'));
    }
  }, [fetchUtilisateurs, erreur]);

  useEffect(() => {
    charger();
  }, [charger]);

  const filtres = utilisateurs.filter(
    (u) =>
      u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase())
  );

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    try {
      await createUtilisateur(form);
      succes(`Compte créé pour ${form.email}`);
      setModalOpen(false);
      setForm({ email: '', nom: '', password: '', role: 'OPERATEUR_REGIE' });
    } catch (err) {
      erreur(messageErreur(err, 'Création impossible'));
    } finally {
      setEnCours(false);
    }
  }

  async function basculerActivation(u: Utilisateur) {
    try {
      await updateUtilisateur(u.id, { isActive: !u.isActive });
      succes(u.isActive ? `${u.nom} désactivé, ses sessions sont coupées` : `${u.nom} réactivé`);
    } catch (err) {
      erreur(messageErreur(err, 'Modification impossible'));
    }
  }

  async function changerRole(u: Utilisateur, role: Role) {
    try {
      await updateUtilisateur(u.id, { role });
      succes(`${u.nom} est désormais ${ROLE_LABEL[role].toLowerCase()}`);
    } catch (err) {
      erreur(messageErreur(err, 'Changement de rôle impossible'));
    }
  }

  async function reinitialiser(u: Utilisateur) {
    try {
      const resultat = await genererLien(u.id);
      setLien(resultat);
      setCopie(false);
    } catch (err) {
      erreur(messageErreur(err, 'Génération du lien impossible'));
    }
  }

  async function copierLien() {
    if (!lien) return;
    try {
      await navigator.clipboard.writeText(lien.lien);
      setCopie(true);
      succes('Lien copié');
    } catch {
      erreur('Copie impossible, sélectionnez le lien manuellement');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-ink)' }}>
          Comptes de la régie
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-3)' }}>
          Un compte n&apos;est jamais supprimé : le désactiver coupe l&apos;accès immédiatement tout en conservant sa trace au journal d&apos;audit.
        </p>
      </div>

      <PageToolbar
        search={recherche}
        onSearch={setRecherche}
        searchPlaceholder="Rechercher un compte..."
        actionLabel="Nouveau compte"
        onAction={() => setModalOpen(true)}
      />

      <div className="card overflow-hidden">
        {filtres.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isLoading ? 'Chargement...' : 'Aucun compte'}
            hint="Créez un compte opérateur pour qu'il gère la grille au quotidien."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-shell">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>État</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((u) => {
                  const cestMoi = u.id === moi?.id;
                  return (
                    <tr key={u.id}>
                      <td>
                        <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{u.nom}</span>
                        {cestMoi && <span className="ml-2 text-xs" style={{ color: 'var(--color-ink-3)' }}>(vous)</span>}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="input py-1.5 text-xs"
                          style={{ width: 'auto' }}
                          value={u.role}
                          disabled={cestMoi}
                          onChange={(e) => changerRole(u, e.target.value as Role)}
                          aria-label={`Rôle de ${u.nom}`}
                        >
                          <option value="OPERATEUR_REGIE">Opérateur régie</option>
                          <option value="ADMINISTRATEUR">Administrateur</option>
                        </select>
                      </td>
                      <td>
                        <Badge tone={u.isActive ? 'success' : 'danger'}>
                          {u.isActive ? 'Actif' : 'Désactivé'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => reinitialiser(u)}
                            className="btn btn-secondary py-1.5 px-3 text-xs"
                            title="Générer un lien de réinitialisation de mot de passe"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> Mot de passe
                          </button>
                          <button
                            onClick={() => basculerActivation(u)}
                            className={`btn py-1.5 px-3 text-xs ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                            disabled={cestMoi}
                            title={cestMoi ? 'Vous ne pouvez pas désactiver votre propre compte' : undefined}
                          >
                            {u.isActive ? 'Désactiver' : 'Réactiver'}
                          </button>
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

      {/* Création */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau compte">
        <form onSubmit={soumettre} className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="u-nom">
              NOM COMPLET
            </label>
            <input id="u-nom" className="input" required minLength={2} value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="u-email">
              EMAIL
            </label>
            <input id="u-email" type="email" className="input" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="u-mdp">
              MOT DE PASSE INITIAL
            </label>
            <input id="u-mdp" type="text" className="input" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-3)' }}>
              10 caractères minimum, avec majuscule, minuscule et chiffre. Vous pourrez ensuite générer un lien
              pour que la personne choisisse elle-même son mot de passe.
            </p>
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest block mb-1.5" style={{ color: 'var(--color-ink-3)' }} htmlFor="u-role">
              RÔLE
            </label>
            <select id="u-role" className="input" value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="OPERATEUR_REGIE">Opérateur régie — grille, matchs, habillage</option>
              <option value="ADMINISTRATEUR">Administrateur — accès complet, contrats et comptes</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={enCours}>
              <UserPlus className="w-4 h-4" /> {enCours ? 'Création...' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lien de réinitialisation */}
      <Modal open={!!lien} onClose={() => setLien(null)} title="Lien de réinitialisation" maxWidth={560}>
        {lien && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-ink-2)' }}>
              Transmettez ce lien à <strong style={{ color: 'var(--color-ink)' }}>{lien.utilisateur.nom}</strong>.
              Il choisira lui-même son mot de passe : vous ne le connaîtrez jamais.
            </p>
            <div
              className="p-3 rounded-xl text-xs break-all font-mono"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink-2)', border: '1px solid var(--color-line)' }}
            >
              {lien.lien}
            </div>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-warning)' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Usage unique, expire le {new Date(lien.expiresAt).toLocaleString('fr-FR')}. Générer un nouveau lien annule celui-ci.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setLien(null)}>Fermer</button>
              <button className="btn btn-primary" onClick={copierLien}>
                {copie ? <><Check className="w-4 h-4" /> Copié</> : <><Copy className="w-4 h-4" /> Copier le lien</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
