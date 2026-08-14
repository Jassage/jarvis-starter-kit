import api from './client';

// Heartbeat d'audience, parité avec le player web (frontend/src/lib/audience.ts).
// C'est ce qui fait exister l'audience mobile dans le rapport sponsor : sans ces
// pings, seuls les viewers web seraient comptés.

export const INTERVALLE_PING_MS = 30_000;

// UUID v4 généré sans dépendance native. `crypto.randomUUID` n'est pas garanti sous
// Hermes, et ajouter une bibliothèque de stockage/crypto imposerait un nouveau build
// EAS pour une valeur qui n'a aucun besoin d'être imprévisible : elle sert seulement à
// ne pas compter deux fois le même appareil sur un même programme.
function uuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Clé conservée en mémoire pour la durée de vie de l'application. Sans stockage
// persistant (pas d'AsyncStorage dans ce projet), un redémarrage de l'app ouvre une
// nouvelle session : l'audience instantanée reste juste, seul le dédoublonnage entre
// deux lancements successifs est perdu.
let sessionKey: string | null = null;

function getSessionKey(): string {
  if (!sessionKey) sessionKey = uuidV4();
  return sessionKey;
}

export async function pingAudience(cible: { creneauId?: string | null; replayId?: string | null }): Promise<void> {
  if (!cible.creneauId && !cible.replayId) return;
  try {
    await api.post('/audience/ping', { sessionKey: getSessionKey(), source: 'MOBILE', ...cible });
  } catch {
    // Le comptage ne doit jamais perturber la lecture : en cas d'échec réseau, le
    // ping suivant reprendra.
  }
}
