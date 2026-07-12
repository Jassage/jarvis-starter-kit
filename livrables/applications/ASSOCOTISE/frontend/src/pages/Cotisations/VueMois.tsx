import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { CotisationModal } from '../../components/cotisations/CotisationModal';
import { ecouterMembres } from '../../services/membres.service';
import { ecouterCotisationsDuMois, valeursCourantes } from '../../services/cotisations.service';
import { ajouterMois, formatMoisLabel, formatMontant, moisCourant } from '../../lib/format';
import type { Membre } from '../../types';

const MONTANT_MINIMUM = 500;

export function VueMois() {
  const [mois, setMois] = useState(moisCourant());
  const [membres, setMembres] = useState<Membre[]>([]);
  const [courantesParMembre, setCourantesParMembre] = useState<Map<string, { montant: number; moyenPaiement: string }>>(
    new Map()
  );
  const [modalOuverte, setModalOuverte] = useState(false);
  const [membreSaisie, setMembreSaisie] = useState<string | undefined>(undefined);

  useEffect(() => ecouterMembres(setMembres), []);

  useEffect(
    () =>
      ecouterCotisationsDuMois(mois, (cotisations) => {
        const courantes = valeursCourantes(cotisations);
        const map = new Map<string, { montant: number; moyenPaiement: string }>();
        for (const c of courantes.values()) {
          map.set(c.memberId, { montant: c.montant, moyenPaiement: c.moyenPaiement });
        }
        setCourantesParMembre(map);
      }),
    [mois]
  );

  const membresActifs = useMemo(() => membres.filter((m) => m.statut === 'actif'), [membres]);
  const totalCollecte = useMemo(
    () => [...courantesParMembre.values()].reduce((sum, c) => sum + c.montant, 0),
    [courantesParMembre]
  );
  const nbPaye = membresActifs.filter((m) => courantesParMembre.has(m.id)).length;

  function ouvrirSaisie(membreId?: string) {
    setMembreSaisie(membreId);
    setModalOuverte(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMois((m) => ajouterMois(m, -1))}
            className="rounded-lg border border-[var(--color-border)] p-1.5 hover:bg-[var(--color-bg)]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-40 text-center text-sm font-medium text-[var(--color-ink)]">
            {formatMoisLabel(mois)}
          </span>
          <button
            onClick={() => setMois((m) => ajouterMois(m, 1))}
            className="rounded-lg border border-[var(--color-border)] p-1.5 hover:bg-[var(--color-bg)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => ouvrirSaisie()}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)]"
        >
          <Plus size={16} /> Saisir une cotisation
        </button>
      </div>

      <Card className="flex items-center gap-8 p-4">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Total collecté</p>
          <p className="text-lg font-semibold text-[var(--color-brand-dark)]">{formatMontant(totalCollecte)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">Membres à jour</p>
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {nbPaye} / {membresActifs.length}
          </p>
        </div>
      </Card>

      <Table>
        <thead>
          <tr>
            <Th>Membre</Th>
            <Th>Statut</Th>
            <Th>Montant</Th>
            <Th>Moyen</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {membresActifs.map((m) => {
            const c = courantesParMembre.get(m.id);
            return (
              <Tr key={m.id}>
                <Td className="font-medium text-[var(--color-ink)]">{m.nom}</Td>
                <Td>
                  {c ? <Badge tone="success">Payé</Badge> : <Badge tone="danger">Non payé</Badge>}
                </Td>
                <Td>
                  {c ? formatMontant(c.montant) : '—'}
                  {c && c.montant > MONTANT_MINIMUM && (
                    <span className="ml-1 text-xs text-[var(--color-brand)]">(surplus)</span>
                  )}
                </Td>
                <Td className="capitalize">{c?.moyenPaiement ?? '—'}</Td>
                <Td>
                  <button
                    onClick={() => ouvrirSaisie(m.id)}
                    className="text-xs font-medium text-[var(--color-brand)] hover:underline"
                  >
                    {c ? 'Corriger' : 'Saisir'}
                  </button>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>

      <CotisationModal
        open={modalOuverte}
        onClose={() => setModalOuverte(false)}
        membres={membresActifs}
        membreParDefaut={membreSaisie}
        moisParDefaut={mois}
        correction={!!membreSaisie && courantesParMembre.has(membreSaisie)}
      />
    </div>
  );
}
