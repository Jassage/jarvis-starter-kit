import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { MembreModal } from '../../components/membres/MembreModal';
import { ecouterMembres } from '../../services/membres.service';
import { ecouterCotisationsDuMois, valeursCourantes } from '../../services/cotisations.service';
import { moisCourant, formatDate } from '../../lib/format';
import type { Membre } from '../../types';

const MONTANT_MINIMUM = 500;

export function MembresListe() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [aJourParMembre, setAJourParMembre] = useState<Map<string, boolean>>(new Map());
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'actif' | 'inactif'>('tous');
  const [modalOuverte, setModalOuverte] = useState(false);

  useEffect(() => ecouterMembres(setMembres), []);

  useEffect(
    () =>
      ecouterCotisationsDuMois(moisCourant(), (cotisations) => {
        const courantes = valeursCourantes(cotisations);
        const map = new Map<string, boolean>();
        for (const c of courantes.values()) {
          map.set(c.memberId, c.montant >= MONTANT_MINIMUM);
        }
        setAJourParMembre(map);
      }),
    []
  );

  const membresFiltres = useMemo(() => {
    return membres.filter((m) => {
      const matchRecherche = m.nom.toLowerCase().includes(recherche.toLowerCase());
      const matchStatut = filtreStatut === 'tous' || m.statut === filtreStatut;
      return matchRecherche && matchStatut;
    });
  }, [membres, recherche, filtreStatut]);

  return (
    <div className="space-y-4">
      <PageToolbar
        search={recherche}
        onSearch={setRecherche}
        searchPlaceholder="Rechercher un membre…"
        actionLabel="Nouveau membre"
        onAction={() => setModalOuverte(true)}
        extra={
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as typeof filtreStatut)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        }
      />

      {membresFiltres.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="Aucun membre trouvé" hint="Ajoute ton premier membre cotisant." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th>Téléphone</Th>
              <Th>Adhésion</Th>
              <Th>Statut</Th>
              <Th>Ce mois-ci</Th>
            </tr>
          </thead>
          <tbody>
            {membresFiltres.map((m) => (
              <Tr key={m.id}>
                <Td className="font-medium text-[var(--color-ink)]">
                  <Link to={`/membres/${m.id}`} className="hover:underline">
                    {m.nom}
                  </Link>
                </Td>
                <Td>{m.telephone}</Td>
                <Td>{formatDate(m.dateAdhesion)}</Td>
                <Td>
                  <Badge tone={m.statut === 'actif' ? 'success' : 'neutral'}>
                    {m.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </Badge>
                </Td>
                <Td>
                  {aJourParMembre.get(m.id) ? (
                    <Badge tone="success">À jour</Badge>
                  ) : (
                    <Badge tone="danger">En retard</Badge>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <MembreModal open={modalOuverte} onClose={() => setModalOuverte(false)} />
    </div>
  );
}
