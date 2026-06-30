import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONFIG_DEFAULTS = [
  // ─── AML ────────────────────────────────────────────────────────────────────
  { cle: 'AML_SEUIL_HTG', valeur: '500000', description: 'Seuil BRH de déclaration obligatoire en HTG (montant unique ou cumulé)' },
  { cle: 'AML_SEUIL_USD', valeur: '10000',  description: 'Seuil BRH de déclaration obligatoire en USD' },

  // ─── Frais automatiques ───────────────────────────────────────────────────
  { cle: 'FRAIS_TENUE_COMPTE_MENSUEL', valeur: '150',  description: 'Frais mensuels de tenue de compte en HTG (prélevés le 1er du mois)' },
  { cle: 'FRAIS_DOSSIER_PRET_TAUX',   valeur: '2',    description: 'Frais de dossier prêt en % du montant accordé (prélevés au décaissement)' },
  { cle: 'FRAIS_VIREMENT_TAUX',       valeur: '0.5',  description: 'Frais de virement en % du montant (prélevés sur le compte source)' },

  // ─── Prêts ───────────────────────────────────────────────────────────────
  { cle: 'TAUX_PENALITE_JOURNALIER',  valeur: '0.001', description: 'Taux journalier de pénalité de retard (ex: 0.001 = 0.1%/jour)' },
  { cle: 'DELAI_GRACE_RETARD',        valeur: '5',     description: 'Nombre de jours de grâce avant facturation des pénalités' },

  // ─── Plafonds ────────────────────────────────────────────────────────────
  { cle: 'PLAFOND_RETRAIT_JOURNALIER', valeur: '100000', description: 'Plafond cumulatif de retrait par client par jour en HTG (0 = pas de plafond)' },
];

async function main() {
  console.log('Seeding configurations manquantes...');
  let inserted = 0;
  let skipped = 0;

  for (const conf of CONFIG_DEFAULTS) {
    const existing = await prisma.configuration.findUnique({ where: { cle: conf.cle } });
    if (existing) {
      console.log(`  ⟳ Existante : ${conf.cle} = ${existing.valeur}`);
      skipped++;
    } else {
      await prisma.configuration.create({ data: conf });
      console.log(`  + Créée   : ${conf.cle} = ${conf.valeur}`);
      inserted++;
    }
  }

  console.log(`\nTerminé : ${inserted} créée(s), ${skipped} ignorée(s) (déjà présentes).`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
