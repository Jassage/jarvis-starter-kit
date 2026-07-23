import ExcelJS from 'exceljs';
import prisma from '../../config/database';
import { getRapportEtablissement, getRapportChaine } from './rapports.service';

const STYLE_ENTETE = { font: { bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } } } as const;

function feuilleResume(classeur: ExcelJS.Workbook, titre: string, rapport: Awaited<ReturnType<typeof getRapportEtablissement>>) {
  const feuille = classeur.addWorksheet('Résumé');
  feuille.columns = [{ width: 30 }, { width: 18 }, { width: 18 }];
  feuille.addRow([titre]).font = { bold: true, size: 14 };
  feuille.addRow([]);

  feuille.addRow(['Indicateur', 'HTG', 'USD']).eachCell((c) => Object.assign(c, STYLE_ENTETE));
  feuille.addRow(['Chambres', rapport.nbChambres, '']);
  feuille.addRow(["Taux d'occupation", `${(rapport.tauxOccupation * 100).toFixed(1)}%`, '']);
  feuille.addRow(['Nuits occupées', rapport.nuitsOccupees, '']);
  feuille.addRow(['Nuits disponibles', rapport.nuitsDisponibles, '']);
  feuille.addRow(['Séjours day-use', rapport.sejoursJourCount, '']);
  feuille.addRow(['Revenu', rapport.revenuParDevise.HTG, rapport.revenuParDevise.USD]);
  feuille.addRow(['ADR (revenu / nuit occupée)', rapport.adrParDevise.HTG.toFixed(2), rapport.adrParDevise.USD.toFixed(2)]);
  feuille.addRow(['RevPAR (revenu / nuit disponible)', rapport.revparParDevise.HTG.toFixed(2), rapport.revparParDevise.USD.toFixed(2)]);
  feuille.addRow(['Facturé', rapport.facturation.HTG.facture, rapport.facturation.USD.facture]);
  feuille.addRow(['Payé', rapport.facturation.HTG.paye, rapport.facturation.USD.paye]);
  feuille.addRow(['Impayé', rapport.facturation.HTG.impaye, rapport.facturation.USD.impaye]);

  feuille.addRow([]);
  feuille.addRow(['Répartition par type de chambre']).font = { bold: true };
  feuille.addRow(['Type', 'Nuits occupées', 'Revenu HTG', 'Revenu USD']).eachCell((c) => Object.assign(c, STYLE_ENTETE));
  for (const t of rapport.repartitionParType) {
    feuille.addRow([t.nom, t.nuitsOccupees, t.revenuHTG, t.revenuUSD]);
  }
}

async function feuilleReservations(classeur: ExcelJS.Workbook, etablissementId: string | undefined, from: Date, to: Date) {
  const feuille = classeur.addWorksheet('Réservations');
  feuille.columns = [
    { header: 'Référence', key: 'reference', width: 14 },
    { header: 'Établissement', key: 'etablissement', width: 22 },
    { header: 'Client', key: 'client', width: 22 },
    { header: 'Chambre', key: 'chambre', width: 20 },
    { header: 'Arrivée', key: 'arrivee', width: 14 },
    { header: 'Départ', key: 'depart', width: 14 },
    { header: 'Devise', key: 'devise', width: 10 },
    { header: 'Montant', key: 'montant', width: 14 },
    { header: 'Statut', key: 'statut', width: 14 },
  ];
  feuille.getRow(1).eachCell((c) => Object.assign(c, STYLE_ENTETE));

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(etablissementId ? { etablissementId } : {}),
      dateArrivee: { lt: to },
      dateDepart: { gt: from },
    },
    select: {
      reference: true,
      dateArrivee: true,
      dateDepart: true,
      devise: true,
      montantTotal: true,
      statut: true,
      client: { select: { nom: true } },
      etablissement: { select: { nom: true } },
      chambre: { select: { numero: true, typeChambre: { select: { nom: true } } } },
    },
    orderBy: { dateArrivee: 'asc' },
  });

  for (const r of reservations) {
    feuille.addRow({
      reference: r.reference ?? '—',
      etablissement: r.etablissement.nom,
      client: r.client.nom,
      chambre: `${r.chambre.typeChambre.nom} — ${r.chambre.numero}`,
      arrivee: r.dateArrivee.toISOString().slice(0, 10),
      depart: r.dateDepart.toISOString().slice(0, 10),
      devise: r.devise,
      montant: Number(r.montantTotal),
      statut: r.statut,
    });
  }
}

export async function genererExportEtablissement(etablissementId: string, nomEtablissement: string, from: Date, to: Date): Promise<Buffer> {
  const rapport = await getRapportEtablissement(etablissementId, from, to);
  const classeur = new ExcelJS.Workbook();
  classeur.creator = 'OTELA';
  feuilleResume(classeur, `${nomEtablissement} — Rapport du ${from.toISOString().slice(0, 10)} au ${to.toISOString().slice(0, 10)}`, rapport);
  await feuilleReservations(classeur, etablissementId, from, to);
  const buffer = await classeur.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function genererExportChaine(from: Date, to: Date): Promise<Buffer> {
  const rapport = await getRapportChaine(from, to);
  const classeur = new ExcelJS.Workbook();
  classeur.creator = 'OTELA';

  const feuille = classeur.addWorksheet('Résumé chaîne');
  feuille.columns = [{ width: 26 }, { width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];
  feuille.addRow([`Rapport chaîne — du ${from.toISOString().slice(0, 10)} au ${to.toISOString().slice(0, 10)}`]).font = { bold: true, size: 14 };
  feuille.addRow([]);
  feuille.addRow(['Établissement', "Taux d'occ.", 'Revenu HTG', 'Revenu USD', 'Impayé HTG']).eachCell((c) => Object.assign(c, STYLE_ENTETE));
  for (const e of rapport.parEtablissement) {
    feuille.addRow([e.nom, `${(e.tauxOccupation * 100).toFixed(1)}%`, e.revenuParDevise.HTG, e.revenuParDevise.USD, e.facturation.HTG.impaye]);
  }
  feuille.addRow([]);
  feuille.addRow(['Total', '', rapport.totalParDevise.HTG, rapport.totalParDevise.USD, rapport.totalFacturationParDevise.HTG.impaye]).font = { bold: true };

  await feuilleReservations(classeur, undefined, from, to);

  const buffer = await classeur.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
