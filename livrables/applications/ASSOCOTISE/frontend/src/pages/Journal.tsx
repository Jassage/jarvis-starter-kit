import { useEffect, useMemo, useState } from 'react';
import { ScrollText, Download } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, Th, Td, Tr } from '../components/ui/Table';
import { Select } from '../components/ui/Field';
import { ecouterMembres } from '../services/membres.service';
import { ecouterDernieresCotisations } from '../services/cotisations.service';
import { ecouterDernieresDepenses } from '../services/depenses.service';
import { ecouterDernieresRelances } from '../services/relances.service';
import { ecouterUtilisateurs } from '../services/users.service';
import { construireJournal, LIBELLES_TYPE, type TypeEvenement } from '../lib/audit';
import { telechargerCsv } from '../lib/csv';
import { formatDate, formatMontant } from '../lib/format';
import type { Cotisation, Depense, Membre, Relance, UtilisateurBureau } from '../types';

/** Nombre de documents lus par source. Le journal est une vue d'activité récente, pas un export exhaustif. */
const LIMITE_PAR_SOURCE = 200;

const TONS: Record<TypeEvenement, 'success' | 'danger' | 'info' | 'neutral'> = {
  cotisation_saisie: 'success',
  cotisation_corrigee: 'info',
  cotisation_annulee: 'danger',
  depense_creee: 'info',
  depense_modifiee: 'info',
  depense_annulee: 'danger',
  relance_envoyee: 'neutral',
  compte_cree: 'neutral',
};

export function Journal() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurBureau[]>([]);
  const [filtreType, setFiltreType] = useState<'tous' | TypeEvenement>('tous');
  const [filtreAuteur, setFiltreAuteur] = useState('tous');

  useEffect(() => ecouterDernieresCotisations(LIMITE_PAR_SOURCE, setCotisations), []);
  useEffect(() => ecouterDernieresDepenses(LIMITE_PAR_SOURCE, setDepenses), []);
  useEffect(() => ecouterDernieresRelances(LIMITE_PAR_SOURCE, setRelances), []);
  useEffect(() => ecouterMembres(setMembres), []);
  useEffect(() => ecouterUtilisateurs(setUtilisateurs), []);

  const nomAuteur = useMemo(() => new Map(utilisateurs.map((u) => [u.id, u.nom])), [utilisateurs]);

  const journal = useMemo(
    () => construireJournal({ cotisations, depenses, relances, membres, utilisateurs }),
    [cotisations, depenses, relances, membres, utilisateurs]
  );

  const journalFiltre = useMemo(
    () =>
      journal.filter(
        (e) =>
          (filtreType === 'tous' || e.type === filtreType) &&
          (filtreAuteur === 'tous' || e.auteurId === filtreAuteur)
      ),
    [journal, filtreType, filtreAuteur]
  );

  function exporter() {
    telechargerCsv(
      'assocotise-journal.csv',
      ['Date', 'Action', 'Auteur', 'Détail', 'Concerne', 'Montant'],
      journalFiltre.map((e) => [
        e.date,
        LIBELLES_TYPE[e.type],
        nomAuteur.get(e.auteurId) ?? e.auteurId,
        e.libelle,
        e.cible ?? '',
        e.montant ?? '',
      ])
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value as typeof filtreType)}
            className="w-56"
          >
            <option value="tous">Toutes les actions</option>
            {Object.entries(LIBELLES_TYPE).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select value={filtreAuteur} onChange={(e) => setFiltreAuteur(e.target.value)} className="w-56">
            <option value="tous">Tous les auteurs</option>
            {utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom}
              </option>
            ))}
          </Select>
        </div>
        <button
          onClick={exporter}
          disabled={journalFiltre.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--color-bg)] disabled:opacity-50"
        >
          <Download size={14} /> Exporter en CSV
        </button>
      </div>

      {journalFiltre.length === 0 ? (
        <EmptyState icon={<ScrollText size={32} />} title="Aucune action enregistrée" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Action</Th>
              <Th className="hidden md:table-cell">Auteur</Th>
              <Th>Détail</Th>
              <Th className="hidden sm:table-cell">Montant</Th>
            </tr>
          </thead>
          <tbody>
            {journalFiltre.map((e) => (
              <Tr key={e.id}>
                <Td className="whitespace-nowrap">{formatDate(e.date)}</Td>
                <Td>
                  <Badge tone={TONS[e.type]}>{LIBELLES_TYPE[e.type]}</Badge>
                </Td>
                <Td className="hidden md:table-cell">{nomAuteur.get(e.auteurId) ?? 'Compte supprimé'}</Td>
                <Td className="text-[var(--color-ink)]">
                  {e.libelle}
                  {e.cible && <span className="text-[var(--color-muted)]"> · {e.cible}</span>}
                </Td>
                <Td className="hidden sm:table-cell">{e.montant != null ? formatMontant(e.montant) : '—'}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        Journal reconstruit à partir des traces portées par les documents eux-mêmes, et non
        d'une collection de log à part : sans serveur, un log écrit par l'application pourrait
        être omis par qui voudrait dissimuler une action. Affiche les {LIMITE_PAR_SOURCE} entrées
        les plus récentes par type de donnée. Une dépense modifiée plusieurs fois ne conserve
        que sa dernière modification.
      </p>
    </div>
  );
}
