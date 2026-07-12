import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, Receipt, PiggyBank, RefreshCw, Download, AlertTriangle, Trophy } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { ecouterMembres } from '../services/membres.service';
import { ecouterToutesCotisations, ecouterCotisationsDuMois, valeursCourantes } from '../services/cotisations.service';
import { ecouterDepenses } from '../services/depenses.service';
import { ecouterCycles, ecouterToutesLesTontinePayments, ecouterTousLesParticipants } from '../services/tontine.service';
import { ajouterMois, formatMoisLabel, formatMontant, moisCourant } from '../lib/format';
import { telechargerCsv } from '../lib/csv';
import type { Cotisation, CycleTontine, Depense, Membre, ParticipantTontine, PaiementTontine } from '../types';

const MONTANT_MINIMUM = 500;

export function Dashboard() {
  const { profil } = useAuth();
  const [membres, setMembres] = useState<Membre[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [cotisationsMois, setCotisationsMois] = useState<Cotisation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [cycles, setCycles] = useState<CycleTontine[]>([]);
  const [tontinePaiements, setTontinePaiements] = useState<PaiementTontine[]>([]);
  const [tontineParticipants, setTontineParticipants] = useState<ParticipantTontine[]>([]);

  useEffect(() => ecouterMembres(setMembres), []);
  useEffect(() => ecouterToutesCotisations(setCotisations), []);
  useEffect(() => ecouterCotisationsDuMois(moisCourant(), setCotisationsMois), []);
  useEffect(() => ecouterDepenses(setDepenses), []);
  useEffect(() => ecouterCycles(setCycles), []);
  useEffect(() => ecouterToutesLesTontinePayments(setTontinePaiements), []);
  useEffect(() => ecouterTousLesParticipants(setTontineParticipants), []);

  const courantesParCle = useMemo(() => valeursCourantes(cotisations), [cotisations]);
  const totalCotisationClassique = useMemo(
    () => [...courantesParCle.values()].reduce((sum, c) => sum + c.montant, 0),
    [courantesParCle]
  );
  const totalTontine = useMemo(() => tontinePaiements.reduce((sum, p) => sum + p.montant, 0), [tontinePaiements]);
  const totalDepenses = useMemo(() => depenses.reduce((sum, d) => sum + d.montant, 0), [depenses]);
  const soldeNet = totalCotisationClassique - totalDepenses;

  const cyclesEnCours = useMemo(() => cycles.filter((c) => c.statut === 'en_cours'), [cycles]);
  const cagnotteTontineEnCours = useMemo(() => {
    return cyclesEnCours.reduce((sum, cycle) => {
      const nbParticipants = tontineParticipants.filter((p) => p.cycleId === cycle.id).length;
      return sum + cycle.montantCotisation * nbParticipants;
    }, 0);
  }, [cyclesEnCours, tontineParticipants]);

  const evolutionMensuelle = useMemo(() => {
    const mois6derniers = Array.from({ length: 6 }, (_, i) => ajouterMois(moisCourant(), -(5 - i)));
    return mois6derniers.map((mois) => {
      const courantesMois = valeursCourantes(cotisations.filter((c) => c.mois === mois));
      const cotisationsMoisTotal = [...courantesMois.values()].reduce((sum, c) => sum + c.montant, 0);
      const depensesMoisTotal = depenses
        .filter((d) => d.date.startsWith(mois))
        .reduce((sum, d) => sum + d.montant, 0);
      return { mois: formatMoisLabel(mois).slice(0, 3), cotisations: cotisationsMoisTotal, depenses: depensesMoisTotal };
    });
  }, [cotisations, depenses]);

  const membresActifs = useMemo(() => membres.filter((m) => m.statut === 'actif'), [membres]);
  const courantesDuMois = useMemo(() => valeursCourantes(cotisationsMois), [cotisationsMois]);

  const membresEnRetardCotisation = useMemo(
    () => membresActifs.filter((m) => (courantesDuMois.get(m.id)?.montant ?? 0) < MONTANT_MINIMUM),
    [membresActifs, courantesDuMois]
  );

  const membresEnRetardTontine = useMemo(() => {
    const result: { membre: Membre; cycle: CycleTontine }[] = [];
    for (const cycle of cyclesEnCours) {
      const participantsCycle = tontineParticipants
        .filter((p) => p.cycleId === cycle.id)
        .sort((a, b) => a.position - b.position);
      const tourEnCours = participantsCycle.find((p) => !p.aRecuSonTour);
      if (!tourEnCours) continue;
      for (const p of participantsCycle) {
        if (p.position !== tourEnCours.position) continue;
        const paiement = tontinePaiements.find(
          (pay) => pay.cycleId === cycle.id && pay.periode === p.position && pay.memberId === p.memberId
        );
        if (!paiement || paiement.statut === 'retard') {
          const membre = membres.find((m) => m.id === p.memberId);
          if (membre) result.push({ membre, cycle });
        }
      }
    }
    return result;
  }, [cyclesEnCours, tontineParticipants, tontinePaiements, membres]);

  const topContributeurs = useMemo(() => {
    const totalParMembre = new Map<string, number>();
    for (const c of courantesParCle.values()) {
      totalParMembre.set(c.memberId, (totalParMembre.get(c.memberId) ?? 0) + c.montant);
    }
    return [...totalParMembre.entries()]
      .map(([memberId, total]) => ({ membre: membres.find((m) => m.id === memberId), total }))
      .filter((x): x is { membre: Membre; total: number } => !!x.membre && x.total > MONTANT_MINIMUM)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [courantesParCle, membres]);

  function exporterCsv() {
    telechargerCsv(
      `assocotise-rapport-${moisCourant()}.csv`,
      ['Mois', 'Cotisations classiques (HTG)', 'Dépenses (HTG)'],
      evolutionMensuelle.map((e) => [e.mois, e.cotisations, e.depenses])
    );
  }

  if (profil?.role !== 'responsable_finances') {
    // Vue résumée pour le secrétaire : pas d'accès au financier complet.
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-xs text-[var(--color-muted)]">Cotisations collectées — {formatMoisLabel(moisCourant())}</p>
          <p className="text-lg font-semibold text-[var(--color-brand-dark)]">
            {formatMontant([...courantesDuMois.values()].reduce((sum, c) => sum + c.montant, 0))}
          </p>
        </Card>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">Membres en retard ce mois-ci</h3>
          {membresEnRetardCotisation.length === 0 ? (
            <EmptyState title="Tous les membres actifs sont à jour" />
          ) : (
            <Card className="divide-y divide-[var(--color-border)]">
              {membresEnRetardCotisation.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-[var(--color-ink)]">{m.nom}</span>
                  <Badge tone="danger">En retard</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Wallet size={18} />} theme="brand" label="Total cotisé (classique + tontine)" value={formatMontant(totalCotisationClassique + totalTontine)} />
        <StatCard icon={<Receipt size={18} />} theme="rose" label="Total dépensé" value={formatMontant(totalDepenses)} />
        <StatCard icon={<PiggyBank size={18} />} theme="gold" label="Solde net disponible" value={formatMontant(soldeNet)} sub="Cagnotte projet business" />
        <StatCard icon={<RefreshCw size={18} />} theme="violet" label="Cagnotte tontine en cours" value={formatMontant(cagnotteTontineEnCours)} sub={`${cyclesEnCours.length} cycle(s) actif(s)`} />
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">Évolution mensuelle — cotisations vs dépenses</h3>
          <button
            onClick={exporterCsv}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg)]"
          >
            <Download size={14} /> Exporter CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={evolutionMensuelle}>
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatMontant(Number(value))} />
            <Legend />
            <Bar dataKey="cotisations" name="Cotisations" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="depenses" name="Dépenses" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
            <AlertTriangle size={15} /> Membres en retard ce mois-ci
          </h3>
          <Card className="divide-y divide-[var(--color-border)]">
            {membresEnRetardCotisation.length === 0 && membresEnRetardTontine.length === 0 ? (
              <div className="p-4">
                <EmptyState title="Aucun retard, tout le monde est à jour" />
              </div>
            ) : (
              <>
                {membresEnRetardCotisation.map((m) => (
                  <div key={`cotis-${m.id}`} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-[var(--color-ink)]">{m.nom}</span>
                    <Badge tone="danger">Cotisation</Badge>
                  </div>
                ))}
                {membresEnRetardTontine.map(({ membre, cycle }) => (
                  <div key={`tontine-${membre.id}-${cycle.id}`} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-[var(--color-ink)]">{membre.nom}</span>
                    <Badge tone="warning">Tontine — {cycle.nom}</Badge>
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>

        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
            <Trophy size={15} /> Top contributeurs (au-dessus du minimum)
          </h3>
          <Card className="divide-y divide-[var(--color-border)]">
            {topContributeurs.length === 0 ? (
              <div className="p-4">
                <EmptyState title="Aucun surplus enregistré pour l'instant" />
              </div>
            ) : (
              topContributeurs.map(({ membre, total }, index) => (
                <div key={membre.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-[var(--color-ink)]">
                    {index + 1}. {membre.nom}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-brand-dark)]">{formatMontant(total)}</span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
