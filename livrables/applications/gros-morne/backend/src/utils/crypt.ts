import { createHash } from 'crypto';

// Le refresh token est un JWT signé, mais on ne stocke jamais sa valeur brute en base :
// seul son hash SHA-256 y figure. Un dump de base ne livre donc aucun jeton de session
// réutilisable (même durcissement que BANKA/LAKAY/ANTENN/POSTA).
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
