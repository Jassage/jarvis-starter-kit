import { z } from 'zod';

// Le heartbeat est public (le player n'est pas authentifié) : la clé de session est
// tirée par le client et n'identifie jamais une personne. On impose un UUID pour
// éviter qu'une valeur devinable (« 1 », « test ») ne serve à écraser la session d'un
// autre viewer et fausser les chiffres.
export const pingSchema = z.object({
  body: z.object({
    sessionKey: z.string().uuid('Clé de session invalide'),
    source: z.enum(['WEB', 'MOBILE']).default('WEB'),
    creneauId: z.string().optional().nullable(),
    replayId: z.string().optional().nullable(),
  }),
});
