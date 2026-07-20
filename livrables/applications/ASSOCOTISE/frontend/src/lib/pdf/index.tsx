import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { RapportPDF, type RapportPDFProps } from './RapportPDF';

export async function telechargerRapportPdf(nomFichier: string, props: RapportPDFProps) {
  const rapportDocument = <RapportPDF {...props} /> as unknown as ReactElement<DocumentProps>;
  const blob = await pdf(rapportDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}
