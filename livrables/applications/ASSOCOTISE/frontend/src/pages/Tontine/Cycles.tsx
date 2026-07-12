import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { NouveauCycleModal } from '../../components/tontine/NouveauCycleModal';
import { ecouterCycles } from '../../services/tontine.service';
import { ecouterMembres } from '../../services/membres.service';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatMontant } from '../../lib/format';
import type { CycleTontine, Membre } from '../../types';

const labelMethode = { fixe: 'Ordre fixe', aleatoire: 'Tirage au sort', anciennete: 'Ancienneté' };

export function TontineCycles() {
  const { profil } = useAuth();
  const [cycles, setCycles] = useState<CycleTontine[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [modalOuverte, setModalOuverte] = useState(false);

  useEffect(() => ecouterCycles(setCycles), []);
  useEffect(() => ecouterMembres(setMembres), []);

  return (
    <div className="space-y-4">
      <PageToolbar
        actionLabel={profil?.role === 'responsable_finances' ? 'Nouveau cycle' : undefined}
        onAction={() => setModalOuverte(true)}
      />

      {cycles.length === 0 ? (
        <EmptyState icon={<RefreshCw size={32} />} title="Aucun cycle de tontine" hint="Crée le premier cycle pour démarrer un sol." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Début</Th>
              <Th>Cotisation/tour</Th>
              <Th>Méthode</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-[var(--color-ink)]">
                  <Link to={`/tontine/${c.id}`} className="hover:underline">
                    {c.nom}
                  </Link>
                </Td>
                <Td>{formatDate(c.dateDebut)}</Td>
                <Td>{formatMontant(c.montantCotisation)}</Td>
                <Td>{labelMethode[c.methodeOrdre]}</Td>
                <Td>
                  <Badge tone={c.statut === 'en_cours' ? 'success' : 'neutral'}>
                    {c.statut === 'en_cours' ? 'En cours' : 'Clos'}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <NouveauCycleModal open={modalOuverte} onClose={() => setModalOuverte(false)} membres={membres} />
    </div>
  );
}
