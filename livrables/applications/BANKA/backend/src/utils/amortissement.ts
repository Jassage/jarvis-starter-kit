import { Decimal } from '@prisma/client/runtime/library';

export interface LigneAmortissement {
  numeroEcheance: number;
  dateEcheance: Date;
  capital: number;
  interet: number;
  mensualite: number;
  capitalRestant: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculerAmortissementDegressif(
  montant: number,
  tauxMensuel: number,
  dureeMois: number,
  datePremierRdv: Date
): LigneAmortissement[] {
  const lignes: LigneAmortissement[] = [];
  const mensualite = round2(
    (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois))
  );

  let capitalRestant = montant;

  for (let i = 1; i <= dureeMois; i++) {
    const interet = round2(capitalRestant * tauxMensuel);
    const capital = round2(mensualite - interet);
    capitalRestant = round2(capitalRestant - capital);
    if (capitalRestant < 0) capitalRestant = 0;

    const dateEcheance = new Date(datePremierRdv);
    dateEcheance.setMonth(dateEcheance.getMonth() + (i - 1));

    lignes.push({
      numeroEcheance: i,
      dateEcheance,
      capital,
      interet,
      mensualite,
      capitalRestant,
    });
  }

  return lignes;
}

export function calculerAmortissementConstant(
  montant: number,
  tauxMensuel: number,
  dureeMois: number,
  datePremierRdv: Date
): LigneAmortissement[] {
  const lignes: LigneAmortissement[] = [];
  const capitalParMois = round2(montant / dureeMois);
  let capitalRestant = montant;

  for (let i = 1; i <= dureeMois; i++) {
    const interet = round2(capitalRestant * tauxMensuel);
    const capital = i === dureeMois ? capitalRestant : capitalParMois;
    const mensualite = round2(capital + interet);
    capitalRestant = round2(capitalRestant - capital);
    if (capitalRestant < 0) capitalRestant = 0;

    const dateEcheance = new Date(datePremierRdv);
    dateEcheance.setMonth(dateEcheance.getMonth() + (i - 1));

    lignes.push({
      numeroEcheance: i,
      dateEcheance,
      capital,
      interet,
      mensualite,
      capitalRestant,
    });
  }

  return lignes;
}

export function calculerAmortissementInFine(
  montant: number,
  tauxMensuel: number,
  dureeMois: number,
  datePremierRdv: Date
): LigneAmortissement[] {
  const lignes: LigneAmortissement[] = [];
  const interet = round2(montant * tauxMensuel);

  for (let i = 1; i <= dureeMois; i++) {
    const capital = i === dureeMois ? montant : 0;
    const mensualite = i === dureeMois ? montant + interet : interet;
    const capitalRestant = i === dureeMois ? 0 : montant;

    const dateEcheance = new Date(datePremierRdv);
    dateEcheance.setMonth(dateEcheance.getMonth() + (i - 1));

    lignes.push({
      numeroEcheance: i,
      dateEcheance,
      capital,
      interet,
      mensualite,
      capitalRestant,
    });
  }

  return lignes;
}

export function calculerTableau(
  montant: number,
  tauxMensuel: number,
  dureeMois: number,
  typeAmortissement: string,
  datePremierRdv: Date
): LigneAmortissement[] {
  switch (typeAmortissement) {
    case 'DEGRESSIF':
      return calculerAmortissementDegressif(montant, tauxMensuel, dureeMois, datePremierRdv);
    case 'CONSTANT':
      return calculerAmortissementConstant(montant, tauxMensuel, dureeMois, datePremierRdv);
    case 'IN_FINE':
      return calculerAmortissementInFine(montant, tauxMensuel, dureeMois, datePremierRdv);
    default:
      return calculerAmortissementDegressif(montant, tauxMensuel, dureeMois, datePremierRdv);
  }
}
