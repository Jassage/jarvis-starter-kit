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
  const { profil } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurBureau[]>([]);
  const [modalOuverte, setModalOuverte] = useState(false);

  useEffect(() => ecouterUtilisateurs(setUtilisateurs), []);

  return (
    <div className="space-y-4">
      <PageToolbar actionLabel="Nouveau compte" onAction={() => setModalOuverte(true)} />

      {utilisateurs.length === 0 ? (
        <EmptyState icon={<UserCog size={32} />} title="Aucun compte du bureau" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Email</Th>
              <Th>Rôle</Th>
              <Th>Créé le</Th>
              <Th>Statut</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium text-[var(--color-ink)]">{u.nom}</Td>
                <Td>{u.email}</Td>
                <Td>{labelRole[u.role]}</Td>
                <Td>{formatDate(u.creeLe)}</Td>
                <Td>
                  <Badge tone={u.actif ? 'success' : 'neutral'}>{u.actif ? 'Actif' : 'Désactivé'}</Badge>
                </Td>
                <Td>
                  {u.id !== profil?.id && (
                    <button
                      onClick={() => changerStatutUtilisateur(u.id, !u.actif)}
                      className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                    >
                      {u.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  )}
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
