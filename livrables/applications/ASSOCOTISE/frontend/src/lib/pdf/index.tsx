import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { RapportPDFProps } from './RapportPDF';

/**
 * Le moteur PDF pèse à lui seul plus que tout le reste de l'application. Il est chargé
 * à la demande, au premier clic sur « Rapport PDF », et non dans le bundle initial :
 * sur une connexion lente, personne ne doit payer le prix d'une fonctionnalité qu'il
 * n'utilise pas.
 */
export async function telechargerRapportPdf(nomFichier: string, props: RapportPDFProps) {
  const [{ pdf }, { RapportPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./RapportPDF'),
  ]);
  const rapportDocument = (<RapportPDF {...props} />) as unknown as ReactElement<DocumentProps>;
  const blob = await pdf(rapportDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}
