import { expirerDocuments } from '../services/document.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function run(): Promise<void> {
  const count = await expirerDocuments();
  if (count > 0) {
    console.log(`[documentsExpiration] ${count} document(s) KYC expiré(s)`);
  }
}

export function startDocumentsExpirationJob(): void {
  run().catch((err) => console.error('[documentsExpiration] erreur:', err));
  setInterval(() => {
    run().catch((err) => console.error('[documentsExpiration] erreur:', err));
  }, ONE_DAY_MS);
}
