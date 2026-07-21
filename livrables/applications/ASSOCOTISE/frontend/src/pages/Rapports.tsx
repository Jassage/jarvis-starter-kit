import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, FileDown, Wallet, Receipt, PiggyBank, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Field, Input } from '../components/ui/Field';
import { useParametres } from '../contexts/ParametresContext';
import { ecouterMembres } from '../services/membres.service';
import { ecouterCotisationsPlage, valeursCourantes } from '../services/cotisations.service';
import { ecouterDepensesPlage } from '../services/depenses.service';
import { anneeCourante } from '../services/exercices.service';
import { telechargerCsv } from '../lib/csv';
import { telechargerRapportPdf } from '../lib/pdf';
import { ajouterMois, formatMoisLabel, formatMontant, moisCourant } from '../lib/format';
import type { CategorieDepense, Cotisation, Depense, Membre } from '../types';

const LIBELLE_CATEGORIE: Record<CategorieDepense, string> = {
  materiel: 'Matériel',
  logistique: 'Logistique',
  administratif: 'Administratif',
  projet_business: 'Projet business',
  autre: 'Autre',
};

type Preset = 'mois' | 'trimestre' | 'exercice' | 'precedent' | 'personnalise';

function bornesPreset(preset: Preset): { debut: string; fin: string } {
  const courant = moisCourant();
  switch (preset) {
    case 'mois':
      return { debut: courant, fin: courant };
    case 'trimestre':
      return { debut: ajouterMois(courant, -2), fin: courant };
    case 'exercice':
      return { debut: `${anneeCourante()}-01`, fin: `${anneeCourante()}-12` };
    case 'precedent': {
      const annee = String(Number(anneeCourante()) - 1);
      return { debut: `${annee}-01`, fin: `${annee}-12` };
    }
    default:
      return { debut: courant, fin: courant };
  }
}

/** Liste des mois d'une plage inclusive, pour l'axe du graphe. */
function moisDeLaPlage(debut: string, fin: string): string[] {
  const mois: string[] = [];
  let courant = debut;
  // Garde-fou : une plage inversée ou aberrante ne doit pas boucler indéfiniment.
  for (let i = 0; i < 120 && courant <= fin; i++) {
    mois.push(courant);
    courant = ajouterMois(courant, 1);
  }
  return mois;
}

export function Rapports() {
  const { montantCotisation, nomAssociation, devise } = useParametres();
  const [preset, setPreset] = useState<Preset>('exercice');
  const [bornes, setBornes] = useState(() => bornesPreset('exercice'));
  const [membres, setMembres] = useState<Membre[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [genereEnCours, setGenereEnCours] = useState(false);

  useEffect(() => ecouterMembres(setMembres), []);
  useEffect(
    () => ecouterCotisationsPlage(bornes.debut, bornes.fin, setCotisations),
    [bornes.debut, bornes.fin]
  );
  useEffect(
    () => ecouterDepensesPlage(`${bornes.debut}-01`, `${bornes.fin}-31`, setDepenses),
    [bornes.debut, bornes.fin]
  );

  function choisirPreset(p: Preset) {
    setPreset(p);
    if (p !== 'personnalise') setBornes(bornesPreset(p));
  }

  const courantes = useMemo(() => [...valeursCourantes(cotisations).values()], [cotisations]);
  const depensesActives = useMemo(() => depenses.filter((d) => !d.annulee), [depenses]);

  const totalCotise = useMemo(() => courantes.reduce((s, c) => s + c.montant, 0), [courantes]);
  const totalDepense = useMemo(() => depensesActives.reduce((s, d) => s + d.montant, 0), [depensesActives]);
  const solde = totalCotise - totalDepense;

  const membresActifs = useMemo(() => membres.filter((m) => m.statut === 'actif'), [membres]);
  const moisPeriode = useMemo(() => moisDeLaPlage(bornes.debut, bornes.fin), [bornes]);

  // Taux de recouvrement : ce qui a été perçu rapporté à ce qui était attendu sur la période
  // (montant de cotisation x membres actifs x nombre de mois).
  const attendu = montantCotisation * membresActifs.length * moisPeriode.length;
  const tauxRecouvrement = attendu > 0 ? Math.min(100, Math.round((totalCotise / attendu) * 100)) : 0;

  const nomParMembre = useMemo(() => new Map(membres.map((m) => [m.id, m.nom])), [membres]);

  const evolution = useMemo(
    () =>
      moisPeriode.map((mois) => ({
        mois: formatMoisLabel(mois).slice(0, 4),
        cotisations: courantes.filter((c) => c.mois === mois).reduce((s, c) => s + c.montant, 0),
        depenses: depensesActives.filter((d) => d.date.startsWith(mois)).reduce((s, d) => s + d.montant, 0),
      })),
    [moisPeriode, courantes, depensesActives]
  );

  const parCategorie = useMemo(() => {
    const totaux = new Map<CategorieDepense, number>();
    for (const d of depensesActives) totaux.set(d.categorie, (totaux.get(d.categorie) ?? 0) + d.montant);
    return [...totaux.entries()]
      .map(([categorie, montant]) => ({ categorie, montant }))
      .sort((a, b) => b.montant - a.montant);
  }, [depensesActives]);

  const topContributeurs = useMemo(() => {
    const totaux = new Map<string, number>();
    for (const c of courantes) totaux.set(c.memberId, (totaux.get(c.memberId) ?? 0) + c.montant);
    return [...totaux.entries()]
      .map(([memberId, total]) => ({ nom: nomParMembre.get(memberId) ?? 'Membre supprimé', total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [courantes, nomParMembre]);

  const periodeLabel =
    bornes.debut === bornes.fin
      ? formatMoisLabel(bornes.debut)
      : `${formatMoisLabel(bornes.debut)} à ${formatMoisLabel(bornes.fin)}`;

  function exporterCotisations() {
    telechargerCsv(
      `assocotise-cotisations-${bornes.debut}_${bornes.fin}.csv`,
      ['Membre', 'Mois', 'Montant', 'Date de paiement', 'Moyen', 'Note'],
      courantes
        .sort((a, b) => (a.mois < b.mois ? -1 : 1))
        .map((c) => [
          nomParMembre.get(c.memberId) ?? 'Membre supprimé',
          c.mois,
          c.montant,
          c.date,
          c.moyenPaiement,
          c.note ?? '',
        ])
    );
  }

  function exporterDepenses() {
    telechargerCsv(
      `assocotise-depenses-${bornes.debut}_${bornes.fin}.csv`,
      ['Description', 'Catégorie', 'Montant', 'Date'],
      depensesActives
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((d) => [d.description, LIBELLE_CATEGORIE[d.categorie], d.montant, d.date])
    );
  }

  async function exporterPdf() {
    setGenereEnCours(true);
    try {
      await telechargerRapportPdf(`assocotise-rapport-${bornes.debut}_${bornes.fin}.pdf`, {
        nomAssociation,
        devise,
        periodeLabel,
        cotisationsDuMois: totalCotise,
        depensesDuMois: totalDepense,
        totalCotiseCumule: totalCotise,
        totalDepenseCumule: totalDepense,
        soldeNetCumule: solde,
        evolutionMensuelle: evolution,
        topContributeurs,
        membresEnRetard: [],
        libelleActivite: 'Activité de la période',
        sousTitreCumul: 'Totaux de la période',
        libelleEvolution: 'Évolution mensuelle sur la période',
        depensesParCategorie: parCategorie.map((c) => ({
          categorie: LIBELLE_CATEGORIE[c.categorie],
          montant: c.montant,
        })),
      });
    } finally {
      setGenereEnCours(false);
    }
  }

  const presets: Array<[Preset, string]> = [
    ['mois', 'Ce mois'],
    ['trimestre', '3 derniers mois'],
    ['exercice', `Exercice ${anneeCourante()}`],
    ['precedent', `Exercice ${Number(anneeCourante()) - 1}`],
    ['personnalise', 'Personnalisé'],
  ];

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap gap-1.5">
          {presets.map(([valeur, label]) => (
            <button
              key={valeur}
              onClick={() => choisirPreset(valeur)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                preset === valeur
                  ? 'bg-[var(--color-brand)] text-white'
                  : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-bg)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'personnalise' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Du mois">
              <Input
                type="month"
                value={bornes.debut}
                onChange={(e) => setBornes((b) => ({ ...b, debut: e.target.value }))}
              />
            </Field>
            <Field label="Au mois">
              <Input
                type="month"
                value={bornes.fin}
                onChange={(e) => setBornes((b) => ({ ...b, fin: e.target.value }))}
              />
            </Field>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={exporterCotisations}
            disabled={courantes.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            <Download size={14} /> Cotisations (CSV)
          </button>
          <button
            onClick={exporterDepenses}
            disabled={depensesActives.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            <Download size={14} /> Dépenses (CSV)
          </button>
          <button
            onClick={exporterPdf}
            disabled={genereEnCours}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-60"
          >
            <FileDown size={14} /> {genereEnCours ? 'Génération…' : 'Rapport PDF'}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Wallet size={18} />}
          theme="brand"
          label="Cotisations perçues"
          value={formatMontant(totalCotise)}
          sub={periodeLabel}
        />
        <StatCard
          icon={<Receipt size={18} />}
          theme="rose"
          label="Dépenses engagées"
          value={formatMontant(totalDepense)}
          sub={periodeLabel}
        />
        <StatCard
          icon={<PiggyBank size={18} />}
          theme="gold"
          label="Solde de la période"
          value={formatMontant(solde)}
          sub={solde < 0 ? 'Déficitaire' : 'Excédentaire'}
        />
        <StatCard
          icon={<Users size={18} />}
          theme="brand"
          label="Taux de recouvrement"
          value={`${tauxRecouvrement} %`}
          sub={`Attendu ${formatMontant(attendu)}`}
        />
      </div>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Cotisations et dépenses par mois</h3>
        {evolution.length === 0 ? (
          <EmptyState title="Période vide" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={evolution}>
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatMontant(Number(value))} />
              <Legend />
              <Bar dataKey="cotisations" name="Cotisations" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Répartition des dépenses</h3>
          {parCategorie.length === 0 ? (
            <EmptyState title="Aucune dépense sur la période" />
          ) : (
            <div className="space-y-3">
              {parCategorie.map(({ categorie, montant }) => {
                const part = totalDepense > 0 ? Math.round((montant / totalDepense) * 100) : 0;
                return (
                  <div key={categorie}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink)]">{LIBELLE_CATEGORIE[categorie]}</span>
                      <span className="text-[var(--color-muted)]">
                        {formatMontant(montant)} · {part} %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                      <div className="h-full rounded-full bg-[var(--color-danger)]" style={{ width: `${part}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Top contributeurs de la période</h3>
          {topContributeurs.length === 0 ? (
            <EmptyState title="Aucune cotisation sur la période" />
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {topContributeurs.map(({ nom, total }, index) => (
                <div key={nom} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[var(--color-ink)]">
                    {index + 1}. {nom}
                  </span>
                  <span className="font-medium text-[var(--color-brand-dark)]">{formatMontant(total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
