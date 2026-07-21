import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { NouvelUtilisateurModal } from '../../components/utilisateurs/NouvelUtilisateurModal';
import { ecouterUtilisateurs, changerStatutUtilisateur } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/format';
import type { UtilisateurBureau } from '../../types';

const labelRole = { secretaire: 'Secrétaire', responsable_finances: 'Responsable Finances' };

export function UtilisateursListe() {
  const { profil, envoyerReinitialisation } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurBureau[]>([]);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => ecouterUtilisateurs(setUtilisateurs), []);

  async function onReinitialiser(u: UtilisateurBureau) {
    if (!confirm(`Envoyer un lien de réinitialisation de mot de passe à ${u.email} ?`)) return;
    setMessage(null);
    try {
      await envoyerReinitialisation(u.email);
      setMessage(`Lien de réinitialisation envoyé à ${u.email}.`);
    } catch {
      setMessage(`Envoi impossible pour ${u.email}.`);
    }
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
                <Td>{labelRole[u.role]}</Td>
                <Td className="hidden md:table-cell">{formatDate(u.creeLe)}</Td>
                <Td>
                  <Badge tone={u.actif ? 'success' : 'neutral'}>{u.actif ? 'Actif' : 'Désactivé'}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onReinitialiser(u)}
                      className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      Réinitialiser le mot de passe
                    </button>
                    {u.id !== profil?.id && (
                      <button
                        onClick={() => changerStatutUtilisateur(u.id, !u.actif)}
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

      <NouvelUtilisateurModal open={modalOuverte} onClose={() => setModalOuverte(false)} />
    </div>
  );
}
