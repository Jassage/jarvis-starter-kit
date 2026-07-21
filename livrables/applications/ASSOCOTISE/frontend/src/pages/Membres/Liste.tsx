import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PageToolbar } from '../../components/ui/PageToolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Field';
import { MembreModal } from '../../components/membres/MembreModal';
import { useParametres } from '../../contexts/ParametresContext';
import { ecouterMembres } from '../../services/membres.service';
import { ecouterCotisationsDuMois, valeursCourantes } from '../../services/cotisations.service';
import { moisCourant, formatDate } from '../../lib/format';
import type { Membre } from '../../types';

export function MembresListe() {
  const { montantCotisation } = useParametres();
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
          map.set(c.memberId, c.montant >= montantCotisation);
        }
        setAJourParMembre(map);
      }),
    [montantCotisation]
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
          <Select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as typeof filtreStatut)}
            className="w-44"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </Select>
        }
      />

      {membresFiltres.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="Aucun membre trouvé" hint="Ajoute ton premier membre cotisant." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th>
              <Th className="hidden sm:table-cell">Téléphone</Th>
              <Th className="hidden md:table-cell">Adhésion</Th>
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
                <Td className="hidden sm:table-cell">{m.telephone}</Td>
                <Td className="hidden md:table-cell">{formatDate(m.dateAdhesion)}</Td>
                <Td>
                  <Badge tone={m.statut === 'actif' ? 'success' : 'neutral'}>
                    {m.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </Badge>
                </Td>
                <Td>
                  {/* Un membre inactif ne cotise plus : le marquer "En retard" serait faux. */}
                  {m.statut !== 'actif' ? (
                    <span className="text-xs text-[var(--color-muted)]">—</span>
                  ) : aJourParMembre.get(m.id) ? (
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
