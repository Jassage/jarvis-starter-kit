import { useEffect, useMemo, useState } from 'react';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { ecouterMembres } from '../../services/membres.service';
import { listerCotisationsMembre, valeursCourantes } from '../../services/cotisations.service';
import { formatMoisLabel, formatMontant } from '../../lib/format';
import type { Membre } from '../../types';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function VueAnnuelle() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [memberId, setMemberId] = useState('');
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [montantsParMois, setMontantsParMois] = useState<Map<string, number>>(new Map());
  const [chargement, setChargement] = useState(false);

  useEffect(() => ecouterMembres(setMembres), []);

  useEffect(() => {
    if (!memberId) {
      setMontantsParMois(new Map());
      return;
    }
    setChargement(true);
    listerCotisationsMembre(memberId)
      .then((cotisations) => {
        const courantes = valeursCourantes(cotisations);
        const map = new Map<string, number>();
        for (const c of courantes.values()) map.set(c.mois, c.montant);
        setMontantsParMois(map);
      })
      .finally(() => setChargement(false));
  }, [memberId]);

  const anneesDisponibles = useMemo(() => {
    const now = new Date().getFullYear();
    return [now - 2, now - 1, now, now + 1];
  }, []);

  const lignes = useMemo(() => {
    return MOIS_LABELS.map((_, index) => {
      const mois = `${annee}-${String(index + 1).padStart(2, '0')}`;
      return { mois, montant: montantsParMois.get(mois) ?? 0 };
    });
  }, [annee, montantsParMois]);

  const totalAnnee = lignes.reduce((sum, l) => sum + l.montant, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="max-w-xs">
          <option value="">Sélectionner un membre…</option>
          {membres.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </Select>
        <Select value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="max-w-[8rem]">
          {anneesDisponibles.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      {!memberId ? (
        <EmptyState title="Choisis un membre" hint="Sélectionne un membre pour voir son historique annuel." />
      ) : chargement ? (
        <p className="text-sm text-[var(--color-muted)]">Chargement…</p>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Mois</Th>
                <Th>Statut</Th>
                <Th>Montant</Th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <Tr key={l.mois}>
                  <Td className="font-medium text-[var(--color-ink)]">{formatMoisLabel(l.mois)}</Td>
                  <Td>{l.montant > 0 ? <Badge tone="success">Payé</Badge> : <Badge tone="danger">Non payé</Badge>}</Td>
                  <Td>{l.montant > 0 ? formatMontant(l.montant) : '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <div className="rounded-lg bg-[var(--color-brand-light)] px-4 py-3">
            <p className="text-xs text-[var(--color-brand-dark)]">Total cotisé en {annee}</p>
            <p className="text-lg font-semibold text-[var(--color-brand-dark)]">{formatMontant(totalAnnee)}</p>
          </div>
        </>
      )}
    </div>
  );
}
