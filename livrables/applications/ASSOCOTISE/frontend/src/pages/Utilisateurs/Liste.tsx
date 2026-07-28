import { useEffect, useState } from 'react';
import { UserCog, Pencil } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { UtilisateurModal } from '../../components/utilisateurs/UtilisateurModal';
import { ecouterUtilisateurs, changerStatutUtilisateur } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { formatDate } from '../../lib/format';
import { LABEL_ROLE, type UtilisateurBureau } from '../../types';

export function UtilisateursListe() {
  const { profil, envoyerReinitialisation } = useAuth();
  const confirmer = useConfirm();
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurBureau[]>([]);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [utilisateurAEditer, setUtilisateurAEditer] = useState<UtilisateurBureau | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => ecouterUtilisateurs(setUtilisateurs), []);

  async function onReinitialiser(u: UtilisateurBureau) {
    const ok = await confirmer({
      titre: 'Réinitialiser le mot de passe ?',
      description: `Un lien de réinitialisation sera envoyé à ${u.email}.`,
      confirmerLabel: 'Envoyer le lien',
    });
    if (!ok) return;
    setMessage(null);
    try {
      await envoyerReinitialisation(u.email);
      setMessage(`Lien de réinitialisation envoyé à ${u.email}.`);
    } catch {
      setMessage(`Envoi impossible pour ${u.email}.`);
    }
  }

  async function onChangerStatut(u: UtilisateurBureau) {
    if (u.actif) {
      const ok = await confirmer({
        titre: `Désactiver le compte de ${u.nom} ?`,
        description: 'La personne ne pourra plus se connecter tant que le compte ne sera pas réactivé.',
        confirmerLabel: 'Désactiver',
        danger: true,
      });
      if (!ok) return;
    }
    await changerStatutUtilisateur(u.id, !u.actif);
  }

  return (
    <div className="space-y-4">
      <PageToolbar actionLabel="Nouveau compte" onAction={() => setModalOuverte(true)} />

      {message && (
        <p className="rounded-lg bg-[var(--color-info-bg)] px-3 py-2 text-sm text-[var(--color-info)]">{message}</p>
      )}

      {utilisateurs.length === 0 ? (
        <EmptyState icon={<UserCog size={32} />} title="Aucun compte du bureau" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th className="hidden sm:table-cell">Email</Th>
              <Th>Rôle</Th>
              <Th className="hidden md:table-cell">Créé le</Th>
              <Th>Statut</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium text-[var(--color-ink)]">{u.nom}</Td>
                <Td className="hidden sm:table-cell">{u.email}</Td>
                <Td>{LABEL_ROLE[u.role]}</Td>
                <Td className="hidden md:table-cell">{formatDate(u.creeLe)}</Td>
                <Td>
                  <Badge tone={u.actif ? 'success' : 'neutral'}>{u.actif ? 'Actif' : 'Désactivé'}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    {u.id !== profil?.id && (
                      <button
                        onClick={() => setUtilisateurAEditer(u)}
                        aria-label={`Modifier ${u.nom}`}
                        className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
                      >
                        <Pencil size={13} /> Modifier
                      </button>
                    )}
                    <button
                      onClick={() => onReinitialiser(u)}
                      className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      Réinitialiser le mot de passe
                    </button>
                    {u.id !== profil?.id && (
                      <button
                        onClick={() => onChangerStatut(u)}
                        className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                      >
                        {u.actif ? 'Désactiver' : 'Réactiver'}
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <UtilisateurModal open={modalOuverte} onClose={() => setModalOuverte(false)} />
      {utilisateurAEditer && (
        <UtilisateurModal
          open
          onClose={() => setUtilisateurAEditer(null)}
          utilisateur={utilisateurAEditer}
        />
      )}
    </div>
  );
}
