'use client';

// Heartbeat d'audience du player public. C'est la seule source de chiffres du rapport
// sponsor : sans ces pings, les preuves de diffusion se génèrent à zéro vue.
//
// Le player n'étant jamais authentifié, on n'utilise pas l'instance axios de la régie
// (qui porte le token et son intercepteur de refresh) mais un simple fetch.

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CLE_STOCKAGE = 'antenn_session_audience';

export const INTERVALLE_PING_MS = 30_000;

// Identifiant opaque de session, stable d'une page à l'autre et d'une visite à la
// suivante sur le même navigateur. Il n'identifie personne : il sert uniquement à ne
// pas compter deux fois le même téléspectateur sur un même programme.
export function getSessionKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existante = window.localStorage.getItem(CLE_STOCKAGE);
    if (existante) return existante;
    const nouvelle = crypto.randomUUID();
    window.localStorage.setItem(CLE_STOCKAGE, nouvelle);
    return nouvelle;
  } catch {
    // Navigation privée ou stockage refusé : on retombe sur une clé de session en
    // mémoire. La vue sera comptée, elle ne survivra simplement pas au rechargement.
    return crypto.randomUUID();
  }
}

export async function pingAudience(cible: { creneauId?: string | null; replayId?: string | null }) {
  const sessionKey = getSessionKey();
  if (!sessionKey || (!cible.creneauId && !cible.replayId)) return;

  try {
    await fetch(`${API_URL}/audience/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey, source: 'WEB', ...cible }),
      // Le comptage d'audience ne doit jamais dégrader la lecture : en cas d'échec on
      // laisse simplement passer, le ping suivant reprendra.
      keepalive: true,
    });
  } catch {
    /* silencieux par conception */
  }
}
