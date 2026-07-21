import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';

const INDIGO = '#4338ca';
const INDIGO_DARK = '#241f5c';
const INDIGO_SOFT = '#ece9fb';
const GOLD = '#b8860b';
const ROSE = '#b91c1c';
const ROSE_SOFT = '#fbeaea';
const MUTED = '#6b6785';
const BORDER = '#e4e2f0';
const INK = '#1e1b3a';
const SURFACE_SOFT = '#f6f5fb';
const ZEBRA = '#faf9fd';

/**
 * Le séparateur de milliers de `Intl.NumberFormat('fr-HT')` (espace fine insécable, U+202F)
 * n'existe pas dans la police Helvetica intégrée à react-pdf : elle s'affichait en "/" à
 * l'impression (ex. "4/300 HTG"). On reformate ici avec un espace ASCII classique.
 */
function formaterMontantPdf(value: number, devise: string): string {
  const arrondi = Math.round(value);
  const negatif = arrondi < 0;
  const chiffres = Math.abs(arrondi).toString();
  const groupes = chiffres.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${negatif ? '-' : ''}${groupes} ${devise}`;
}

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, color: INK, fontFamily: 'Helvetica' },

  bandeau: { backgroundColor: INDIGO_DARK, paddingVertical: 22, paddingHorizontal: 36 },
  bandeauAccent: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 130, backgroundColor: INDIGO, opacity: 0.55 },
  bandeauLigne: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoRond: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandeauTitre: { fontSize: 21, fontWeight: 700, color: '#ffffff' },
  bandeauSousTitre: { fontSize: 11, marginTop: 6, color: '#d8d4f7' },

  corps: { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 60 },

  blocEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  blocLabel: { fontSize: 9.5, fontWeight: 700, color: INDIGO_DARK, textTransform: 'uppercase', letterSpacing: 0.6 },
  blocSousLabel: { fontSize: 8, color: MUTED, fontStyle: 'italic' },

  ligneCartes: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  carte: { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: SURFACE_SOFT },
  carteAccent: { height: 4 },
  carteCorps: { padding: 10 },
  carteLabel: { fontSize: 7.5, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  carteValeur: { fontSize: 14, fontWeight: 700 },

  carteCumul: { flex: 1, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: BORDER, borderStyle: 'dashed' },
  carteCumulLabel: { fontSize: 7.5, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  carteCumulValeur: { fontSize: 12, fontWeight: 700, color: INDIGO_DARK },

  section: { marginTop: 16 },
  sectionTitreLigne: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  sectionPastille: { width: 6, height: 6, borderRadius: 3, backgroundColor: INDIGO },
  sectionTitre: { fontSize: 11, fontWeight: 700, color: INDIGO_DARK },

  table: { borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: BORDER },
  tableRowHeader: { flexDirection: 'row', backgroundColor: INDIGO_SOFT },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  tableRowZebra: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: ZEBRA },
  th: { flex: 1, padding: 6, fontSize: 7.5, fontWeight: 700, color: INDIGO_DARK, textTransform: 'uppercase', letterSpacing: 0.3 },
  td: { flex: 1, padding: 6, fontSize: 9 },
  tdBold: { flex: 1, padding: 6, fontSize: 9, fontWeight: 700 },

  puceRetard: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: ROSE, marginRight: 6, marginTop: 2 },
  ligneRetard: { flexDirection: 'row', alignItems: 'flex-start', padding: 7 },

  pied: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  videTexte: { fontSize: 9, color: MUTED, padding: 10, fontStyle: 'italic' },
});

function PiggyIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        fill={INDIGO_DARK}
        d="M19 10h-1.26A6.98 6.98 0 0 0 12 6c-1.5 0-2.85.5-4 1.35V6l-3 2v3.5L3 13v2l2-1v2l2 2h2v-1h4v1h2l1-1v-2.29c1.2-.94 2-2.4 2-4.06V10h1c.55 0 1-.45 1-1s-.45-1-1-1zM10 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
      />
    </Svg>
  );
}

export interface RapportPDFProps {
  nomAssociation: string;
  devise: string;
  periodeLabel: string;
  cotisationsDuMois: number;
  depensesDuMois: number;
  totalCotiseCumule: number;
  totalDepenseCumule: number;
  soldeNetCumule: number;
  evolutionMensuelle: { mois: string; cotisations: number; depenses: number }[];
  topContributeurs: { nom: string; total: number }[];
  membresEnRetard: string[];
  /** Libellés adaptables : le même document sert le tableau de bord et les rapports par période. */
  libelleActivite?: string;
  sousTitreCumul?: string;
  libelleEvolution?: string;
  depensesParCategorie?: { categorie: string; montant: number }[];
}

export function RapportPDF({
  nomAssociation,
  devise,
  periodeLabel,
  cotisationsDuMois,
  depensesDuMois,
  totalCotiseCumule,
  totalDepenseCumule,
  soldeNetCumule,
  evolutionMensuelle,
  topContributeurs,
  membresEnRetard,
  libelleActivite = 'Activité du mois',
  sousTitreCumul = "Cumul de l'exercice",
  libelleEvolution = 'Évolution mensuelle',
  depensesParCategorie = [],
}: RapportPDFProps) {
  const genereLe = new Intl.DateTimeFormat('fr-HT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const soldeDuMois = cotisationsDuMois - depensesDuMois;
  const formatMontantPdf = (value: number) => formaterMontantPdf(value, devise);

  return (
    <Document title={`${nomAssociation} — Rapport ${periodeLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.bandeau}>
          <View style={styles.bandeauAccent} />
          <View style={styles.bandeauLigne}>
            <View style={styles.logoRond}>
              <PiggyIcon />
            </View>
            <View>
              <Text style={styles.bandeauTitre}>{nomAssociation}</Text>
            </View>
          </View>
          <Text style={styles.bandeauSousTitre}>Rapport financier — {periodeLabel}</Text>
        </View>

        <View style={styles.corps}>
          <View style={styles.blocEntete}>
            <Text style={styles.blocLabel}>
              {libelleActivite} — {periodeLabel}
            </Text>
          </View>
          <View style={styles.ligneCartes}>
            <View style={styles.carte}>
              <View style={[styles.carteAccent, { backgroundColor: INDIGO }]} />
              <View style={styles.carteCorps}>
                <Text style={styles.carteLabel}>Cotisations collectées</Text>
                <Text style={[styles.carteValeur, { color: INDIGO_DARK }]}>{formatMontantPdf(cotisationsDuMois)}</Text>
              </View>
            </View>
            <View style={styles.carte}>
              <View style={[styles.carteAccent, { backgroundColor: ROSE }]} />
              <View style={styles.carteCorps}>
                <Text style={styles.carteLabel}>Dépenses engagées</Text>
                <Text style={[styles.carteValeur, { color: ROSE }]}>{formatMontantPdf(depensesDuMois)}</Text>
              </View>
            </View>
            <View style={styles.carte}>
              <View style={[styles.carteAccent, { backgroundColor: GOLD }]} />
              <View style={styles.carteCorps}>
                <Text style={styles.carteLabel}>Solde de la période</Text>
                <Text style={[styles.carteValeur, { color: soldeDuMois < 0 ? ROSE : GOLD }]}>
                  {formatMontantPdf(soldeDuMois)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.blocEntete, { marginTop: 20 }]}>
            <Text style={styles.blocLabel}>Trésorerie de l'association</Text>
            <Text style={styles.blocSousLabel}>{sousTitreCumul}</Text>
          </View>
          <View style={styles.ligneCartes}>
            <View style={styles.carteCumul}>
              <Text style={styles.carteCumulLabel}>Total cotisé</Text>
              <Text style={styles.carteCumulValeur}>{formatMontantPdf(totalCotiseCumule)}</Text>
            </View>
            <View style={styles.carteCumul}>
              <Text style={styles.carteCumulLabel}>Total dépensé</Text>
              <Text style={styles.carteCumulValeur}>{formatMontantPdf(totalDepenseCumule)}</Text>
            </View>
            <View style={styles.carteCumul}>
              <Text style={styles.carteCumulLabel}>Solde net disponible</Text>
              <Text style={[styles.carteCumulValeur, { color: GOLD }]}>{formatMontantPdf(soldeNetCumule)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitreLigne}>
              <View style={styles.sectionPastille} />
              <Text style={styles.sectionTitre}>{libelleEvolution}</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                <Text style={styles.th}>Mois</Text>
                <Text style={styles.th}>Cotisations</Text>
                <Text style={styles.th}>Dépenses</Text>
                <Text style={styles.th}>Solde du mois</Text>
              </View>
              {evolutionMensuelle.map((e, i) => (
                <View style={i % 2 === 1 ? styles.tableRowZebra : styles.tableRow} key={e.mois}>
                  <Text style={styles.td}>{e.mois}</Text>
                  <Text style={styles.td}>{formatMontantPdf(e.cotisations)}</Text>
                  <Text style={styles.td}>{formatMontantPdf(e.depenses)}</Text>
                  <Text style={[styles.tdBold, { color: e.cotisations - e.depenses < 0 ? ROSE : INK }]}>
                    {formatMontantPdf(e.cotisations - e.depenses)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {depensesParCategorie.length > 0 && (
            <View style={styles.section} wrap={false}>
              <View style={styles.sectionTitreLigne}>
                <View style={[styles.sectionPastille, { backgroundColor: ROSE }]} />
                <Text style={[styles.sectionTitre, { color: ROSE }]}>Répartition des dépenses</Text>
              </View>
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.th, { flex: 3 }]}>Catégorie</Text>
                  <Text style={styles.th}>Montant</Text>
                  <Text style={styles.th}>Part</Text>
                </View>
                {depensesParCategorie.map((c, i) => (
                  <View style={i % 2 === 1 ? styles.tableRowZebra : styles.tableRow} key={c.categorie}>
                    <Text style={[styles.td, { flex: 3 }]}>{c.categorie}</Text>
                    <Text style={styles.tdBold}>{formatMontantPdf(c.montant)}</Text>
                    <Text style={styles.td}>
                      {depensesDuMois > 0 ? `${Math.round((c.montant / depensesDuMois) * 100)} %` : '—'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section} wrap={false}>
            <View style={styles.sectionTitreLigne}>
              <View style={styles.sectionPastille} />
              <Text style={styles.sectionTitre}>Top contributeurs</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRowHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
                <Text style={[styles.th, { flex: 3 }]}>Membre</Text>
                <Text style={styles.th}>Total cotisé</Text>
              </View>
              {topContributeurs.length === 0 ? (
                <Text style={styles.videTexte}>Aucun surplus enregistré pour l'instant.</Text>
              ) : (
                topContributeurs.map((c, i) => (
                  <View style={i % 2 === 1 ? styles.tableRowZebra : styles.tableRow} key={c.nom}>
                    <Text style={[styles.td, { flex: 0.5, color: GOLD, fontWeight: 700 }]}>{i + 1}</Text>
                    <Text style={[styles.td, { flex: 3 }]}>{c.nom}</Text>
                    <Text style={styles.tdBold}>{formatMontantPdf(c.total)}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <View style={styles.sectionTitreLigne}>
              <View style={[styles.sectionPastille, { backgroundColor: ROSE }]} />
              <Text style={[styles.sectionTitre, { color: ROSE }]}>Membres en retard — {periodeLabel}</Text>
            </View>
            <View style={[styles.table, { borderColor: ROSE_SOFT }]}>
              {membresEnRetard.length === 0 ? (
                <Text style={styles.videTexte}>Aucun retard, tout le monde est à jour.</Text>
              ) : (
                membresEnRetard.map((nom, i) => (
                  <View style={i % 2 === 1 ? { ...styles.ligneRetard, backgroundColor: ZEBRA } : styles.ligneRetard} key={nom}>
                    <View style={styles.puceRetard} />
                    <Text style={{ fontSize: 9, color: INK }}>{nom}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={styles.pied} fixed>
          <Text>{nomAssociation} — Gestion financière associative</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages} · Généré le ${genereLe}`}
          />
        </View>
      </Page>
    </Document>
  );
}
