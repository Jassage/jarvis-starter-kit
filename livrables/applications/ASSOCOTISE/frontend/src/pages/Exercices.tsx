import { useEffect, useMemo, useState } from 'react';
import { Lock, Unlock, CalendarCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, Th, Td, Tr } from '../components/ui/Table';
import { useAuth } from '../contexts/AuthContext';
import { ecouterCotisationsPlage } from '../services/cotisations.service';
import { ecouterDepensesPlage } from '../services/depenses.service';
import {
  anneeCourante,
  calculerTotauxExercice,
  cloturerExercice,
  ecouterExercices,
  rouvrirExercice,
} from '../services/exercices.service';
import { formatDate, formatMontant } from '../lib/format';
import type { Cotisation, Depense, Exercice } from '../types';

export function Exercices() {
  const { profil } = useAuth();
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(anneeCourante());
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => ecouterExercices(setExercices), []);
  useEffect(
    () => ecouterCotisationsPlage(`${anneeSelectionnee}-01`, `${anneeSelectionnee}-12`, setCotisations),
    [anneeSelectionnee]
  );
  useEffect(
    () => ecouterDepensesPlage(`${anneeSelectionnee}-01-01`, `${anneeSelectionnee}-12-31`, setDepenses),
    [anneeSelectionnee]
  );

  const exerciceSelectionne = exercices.find((e) => e.annee === anneeSelectionnee);
  const soldeReporte = exerciceSelectionne?.soldeReporte ?? 0;

  const { totalCotise, totalDepense } = useMemo(
    () => calculerTotauxExercice(cotisations, depenses),
    [cotisations, depenses]
  );
  const soldeFinal = soldeReporte + totalCotise - totalDepense;

  // Une année encore en cours ne peut pas être clôturée : des cotisations y sont
  // forcément encore attendues.
  const anneeTerminee = Number(anneeSelectionnee) < Number(anneeCourante());
  const dejaCloture = exerciceSelectionne?.statut === 'cloture';

  const anneesProposees = useMemo(() => {
    const courante = Number(anneeCourante());
    const annees = new Set<string>(exercices.map((e) => e.annee));
    for (let a = courante; a >= courante - 4; a--) annees.add(String(a));
    return [...annees].sort((a, b) => Number(b) - Number(a));
  }, [exercices]);

  async function onCloturer() {
    if (!profil) return;
    if (
      !confirm(
        `Clôturer l'exercice ${anneeSelectionnee} ?\n\n` +
          `Solde final : ${formatMontant(soldeFinal)}, reporté sur ${Number(anneeSelectionnee) + 1}.\n` +
          `Plus aucune cotisation ni dépense de cette année ne pourra être saisie, corrigée ou annulée.`
      )
    )
      return;
    setErreur(null);
    setMessage(null);
    setEnvoi(true);
    try {
      const solde = await cloturerExercice({
        annee: anneeSelectionnee,
        soldeReporte,
        totalCotise,
        totalDepense,
        cloturePar: profil.id,
      });
      setMessage(
        `Exercice ${anneeSelectionnee} clôturé. Solde de ${formatMontant(solde)} reporté sur ${Number(anneeSelectionnee) + 1}.`
      );
    } catch {
      setErreur('La clôture a échoué. Seul le responsable finances peut clôturer un exercice.');
    } finally {
      setEnvoi(false);
    }
  }

  async function onRouvrir(annee: string) {
    if (!profil) return;
    if (!confirm(`Rouvrir l'exercice ${annee} ? Les écritures de cette année redeviendront modifiables.`)) return;
    setErreur(null);
    setMessage(null);
    try {
      await rouvrirExercice(annee, profil.id);
      setMessage(`Exercice ${annee} rouvert.`);
    } catch {
      setErreur('La réouverture a échoué.');
    }
  }

  return (
    <div className="space-y-5">
      {message && (
        <p className="rounded-lg bg-[var(--color-success-bg)] px-3 py-2 text-sm text-[var(--color-success)]">
          {message}
        </p>
      )}
      {erreur && (
        <p className="rounded-lg bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">{erreur}</p>
      )}

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
            <CalendarCheck size={16} /> Situation de l'exercice
          </h3>
          <div className="flex gap-1.5">
            {anneesProposees.map((a) => (
              <button
                key={a}
                onClick={() => setAnneeSelectionnee(a)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  a === anneeSelectionnee
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-[var(--color-muted)]">Solde reporté</p>
            <p className="text-base font-semibold text-[var(--color-ink)]">{formatMontant(soldeReporte)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)]">Cotisations de l'année</p>
            <p className="text-base font-semibold text-[var(--color-brand-dark)]">{formatMontant(totalCotise)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)]">Dépenses de l'année</p>
            <p className="text-base font-semibold text-[var(--color-danger)]">{formatMontant(totalDepense)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted)]">Solde de fin d'exercice</p>
            <p className="text-base font-semibold text-[var(--color-gold-dark)]">{formatMontant(soldeFinal)}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {dejaCloture ? (
            <>
              <Badge tone="neutral">
                <Lock size={12} /> Exercice clôturé
              </Badge>
              <button
                onClick={() => onRouvrir(anneeSelectionnee)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--color-bg)]"
              >
                <Unlock size={13} /> Rouvrir l'exercice
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCloturer}
                disabled={!anneeTerminee || envoi}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-xs font-medium text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
              >
                <Lock size={13} /> {envoi ? 'Clôture…' : `Clôturer l'exercice ${anneeSelectionnee}`}
              </button>
              {!anneeTerminee && (
                <span className="text-xs text-[var(--color-muted)]">
                  Un exercice ne peut être clôturé qu'une fois l'année terminée.
                </span>
              )}
            </>
          )}
        </div>
      </Card>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Historique des exercices</h3>
        {exercices.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-[var(--color-muted)]">
              Aucun exercice enregistré. Le premier sera créé à la première clôture.
            </p>
          </Card>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Année</Th>
                <Th>Statut</Th>
                <Th className="hidden sm:table-cell">Reporté</Th>
                <Th className="hidden md:table-cell">Cotisé</Th>
                <Th className="hidden md:table-cell">Dépensé</Th>
                <Th>Solde final</Th>
                <Th className="hidden lg:table-cell">Clôturé le</Th>
              </tr>
            </thead>
            <tbody>
              {exercices.map((e) => (
                <Tr key={e.annee}>
                  <Td className="font-medium text-[var(--color-ink)]">{e.annee}</Td>
                  <Td>
                    {e.statut === 'cloture' ? (
                      <Badge tone="neutral">Clôturé</Badge>
                    ) : (
                      <Badge tone="success">Ouvert</Badge>
                    )}
                  </Td>
                  <Td className="hidden sm:table-cell">{formatMontant(e.soldeReporte)}</Td>
                  <Td className="hidden md:table-cell">
                    {e.totalCotise != null ? formatMontant(e.totalCotise) : '—'}
                  </Td>
                  <Td className="hidden md:table-cell">
                    {e.totalDepense != null ? formatMontant(e.totalDepense) : '—'}
                  </Td>
                  <Td>{e.soldeFinal != null ? formatMontant(e.soldeFinal) : '—'}</Td>
                  <Td className="hidden lg:table-cell">
                    {e.clotureLe ? formatDate(e.clotureLe) : '—'}
                    {e.rouvertLe && (
                      <span className="ml-1 text-xs text-[var(--color-muted)]">
                        (rouvert le {formatDate(e.rouvertLe)})
                      </span>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        La clôture est appliquée par les règles Firestore, pas seulement par l'interface :
        toute cotisation ou dépense d'une année clôturée est rejetée par le serveur, y compris
        une tentative d'annulation.
      </p>
    </div>
  );
}
