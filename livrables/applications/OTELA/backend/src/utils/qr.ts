import QRCode from 'qrcode';
import { env } from '../config/env';

// Le QR encode l'URL de consultation publique de la réservation. On l'appuie sur
// FRONTEND_URL (le site, pas l'API) : c'est une page pour le client, pas un endpoint.
export function urlConsultation(reference: string): string {
  return `${env.FRONTEND_URL.replace(/\/$/, '')}/ma-reservation?ref=${encodeURIComponent(reference)}`;
}

// Data URL (PNG base64) — directement intégrable dans un <img> d'email HTML ou
// renvoyé tel quel à un client web.
export function qrDataUrl(reference: string): Promise<string> {
  return QRCode.toDataURL(urlConsultation(reference), { margin: 1, width: 220 });
}

// Buffer PNG — pour l'incrustation dans un PDF (pdfkit ne lit pas les data URL).
export function qrPngBuffer(reference: string): Promise<Buffer> {
  return QRCode.toBuffer(urlConsultation(reference), { margin: 1, width: 220 });
}
