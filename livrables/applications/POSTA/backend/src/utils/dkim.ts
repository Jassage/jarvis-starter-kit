import { generateKeyPairSync } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { env } from '../config/env';

const DKIM_SELECTOR = 'posta';

export interface DkimKeyMaterial {
  dkimSelector: string;
  dkimPublicKey: string;
  dkimTxtValue: string;
}

// Génère la paire de clés DKIM pour un domaine : la clé privée est écrite sur disque
// (jamais en base, voir schema.prisma) pour que Postfix/OpenDKIM puisse la lire côté VPS.
export function generateDkimKeyPair(nomDomaine: string): DkimKeyMaterial {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const dkimPublicKey = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');

  mkdirSync(env.DKIM_KEYS_DIR, { recursive: true });
  const privateKeyPath = path.join(env.DKIM_KEYS_DIR, `${DKIM_SELECTOR}.${nomDomaine}.private.pem`);
  writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });

  return {
    dkimSelector: DKIM_SELECTOR,
    dkimPublicKey,
    dkimTxtValue: `v=DKIM1; k=rsa; p=${dkimPublicKey}`,
  };
}
