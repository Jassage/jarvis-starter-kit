import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, UserX, UserCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, Th, Td, Tr } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { MembreModal } from '../../components/membres/MembreModal';
import { ecouterMembres, changerStatutMembre } from '../../services/membres.service';
import { listerCotisationsMembre } from '../../services/cotisations.service';
import { formatDate, formatMoisLabel, formatMontant, moisCourant } from '../../lib/format';
import type { Cotisation, Membre } from '../../types';

const MONTANT_MINIMUM = 500;

export function MembreFiche() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [membres, setMembres] = useState<Membre[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => ecouterMembres(setMembres), []);

  useEffect(() => {
    if (!id) return;
    listerCotisationsMembre(id)
      .then(setCotisations)
      .finally(() => setChargement(false));
  }, [id]);

  const membre = membres.find((m) => m.id === id);

  const { totalCotise, parMois } = useMemo(() => {
    const groupes = new Map<string, Cotisation[]>();
    for (const c of cotisations) {
      const liste = groupes.get(c.mois) ?? [];
      liste.push(c);
      groupes.set(c.mois, liste);
    }
    // tri décroissant par date de saisie dans chaque mois
    for (const liste of groupes.values()) {
      liste.sort((a, b) => new Date(b.saisiLe).getTime() - new Date(a.saisiLe).getTime());
    }
    const moisTries = [...groupes.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const total = moisTries.reduce((sum, [, liste]) => sum + liste[0].montant, 0);
    return { totalCotise: total, parMois: moisTries };
  }, [cotisations]);

  const aJourCeMois = parMois.find(([mois]) => mois === moisCourant())?.[1][0];
  const estAJour = aJourCeMois ? aJourCeMois.montant >= MONTANT_MINIMUM : false;

  if (chargement) return <p className="text-[var(--color-muted)]">Chargement…</p>;
  if (!membre) return <EmptyState title="Membre introuvable" />;

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/membres')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Retour aux membres
      </button>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">{membre.nom}</h2>
            <p className="text-sm text-[var(--color-muted)]">
              {membre.telephone} {membre.email && `· ${membre.email}`}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Membre depuis le {formatDate(membre.dateAdhesion)}
            </p>
            <div className="mt-3 flex gap-2">
              <Badge tone={membre.statut === 'actif' ? 'success' : 'neutral'}>
                {membre.statut === 'actif' ? 'Actif' : 'Inactif'}
              </Badge>
              <Badge tone={estAJour ? 'success' : 'danger'}>{estAJour ? 'À jour' : 'En retard'}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalOuverte(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-bg)]"
            >
              <Pencil size={15} /> Modifier
            </button>
            <button
              onClick={() => changerStatutMembre(membre.id, membre.statut === 'actif' ? 'inactif' : 'actif')}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-bg)]"
            >
              {membre.statut === 'actif' ? <UserX size={15} /> : <UserCheck size={15} />}
              {membre.statut === 'actif' ? 'Désactiver' : 'Réactiver'}
            </button>
          </div>
        </div>
        <div className="mt-5 rounded-lg bg-[var(--color-brand-light)] px-4 py-3">
          <p className="text-xs text-[var(--color-brand-dark)]">Total cotisé (toutes périodes)</p>
          <p className="text-xl font-semibold text-[var(--color-brand-dark)]">{formatMontant(totalCotise)}</p>
        </div>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Historique des cotisations</h3>
        {parMois.length === 0 ? (
          <EmptyState title="Aucune cotisation enregistrée pour ce membre" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Mois</Th>
                <Th>Montant courant</Th>
                <Th>Moyen</Th>
                <Th>Corrections</Th>
              </tr>
            </thead>
            <tbody>
              {parMois.map(([mois, liste]) => (
                <Tr key={mois}>
                  <Td className="font-medium text-[var(--color-ink)]">{formatMoisLabel(mois)}</Td>
                  <Td>
                    {formatMontant(liste[0].montant)}
                    {liste[0].montant > MONTANT_MINIMUM && (
                      <span className="ml-1 text-xs text-[var(--color-brand)]">
                        (+{formatMontant(liste[0].montant - MONTANT_MINIMUM)} de surplus)
                      </span>
                    )}
                  </Td>
                  <Td className="capitalize">{liste[0].moyenPaiement}</Td>
                  <Td>
                    {liste.length > 1 ? (
                      <details>
                        <summary className="cursor-pointer text-xs text-[var(--color-info)]">
                          {liste.length - 1} correction(s)
                        </summary>
                        <ul className="mt-1 space-y-1 text-xs text-[var(--color-muted)]">
                          {liste.slice(1).map((c) => (
                            <li key={c.id}>
                              {formatDate(c.saisiLe)} — {formatMontant(c.montant)} ({c.moyenPaiement})
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">—</span>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <MembreModal open={modalOuverte} onClose={() => setModalOuverte(false)} membre={membre} />
    </div>
  );
}
