import { randomBytes, timingSafeEqual, createHash } from 'crypto';
import { sha512 } from 'sha512-crypt-ts';

const SALT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';

function generateSalt(length = 16): string {
  const bytes = randomBytes(length);
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += SALT_CHARS[bytes[i] % SALT_CHARS.length];
  }
  return salt;
}

// Format Dovecot {SHA512-CRYPT}$6$... (voir schema.prisma : jamais bcrypt, Dovecot doit
// pouvoir vérifier ce hash nativement via les vues SQL en lecture seule).
export function hashMailboxPassword(password: string): string {
  return `{SHA512-CRYPT}${sha512.crypt(password, generateSalt())}`;
}

export function verifyMailboxPassword(password: string, storedHash: string): boolean {
  const cryptPart = storedHash.replace('{SHA512-CRYPT}', '');
  const parts = cryptPart.split('$');
  if (parts.length < 4) return false;

  const recomputed = sha512.crypt(password, parts[2]);
  if (recomputed.length !== cryptPart.length) return false;
  return timingSafeEqual(Buffer.from(recomputed), Buffer.from(cryptPart));
}

// Jeton opaque à usage unique (reset mot de passe) : seul le hash est stocké en base,
// le jeton en clair n'existe que dans le lien envoyé par email et n'est jamais persisté.
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Le refresh token est un JWT signé, mais on ne stocke jamais sa valeur brute en base :
// seul son hash SHA-256 y figure. Un dump de base ou une fuite de backup ne livre donc
// aucun jeton de session réutilisable (même durcissement que BANKA/LAKAY/ANTENN).
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
