import prisma from './prisma';

/**
 * Génère un numéro de pièce (VNT-000123, CMD-000045...) via une séquence PostgreSQL dédiée,
 * jamais via count()+1 : sous deux requêtes concurrentes, count() peut lire la même valeur deux
 * fois et produire un numéro dupliqué (409 sur la contrainte d'unicité pour l'une des deux).
 * nextval() est atomique et ne peut jamais renvoyer deux fois la même valeur.
 *
 * La création de la séquence se fait volontairement HORS de toute transaction Prisma : le DDL
 * est transactionnel en PostgreSQL, donc une séquence créée à l'intérieur d'une transaction qui
 * échoue ensuite disparaît avec elle et repart de zéro au prochain essai (bug réel corrigé sur
 * transfert.service.ts — même piège à ne pas reproduire ici).
 */
export async function genererNumeroSequence(nomSequence: string, prefixe: string): Promise<string> {
  await prisma.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS ${nomSequence}`);
  const rows = await prisma.$queryRawUnsafe<{ value: bigint | number }[]>(
    `SELECT nextval('${nomSequence}') AS value`
  );
  const value = Number(rows[0]?.value ?? 0);
  return `${prefixe}-${String(value).padStart(6, '0')}`;
}
