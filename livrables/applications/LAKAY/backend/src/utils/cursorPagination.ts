/** Encode un curseur opaque (base64url d'un JSON) à partir des valeurs du dernier élément d'une page. */
export function encodeCursor(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor<T = Record<string, unknown>>(cursor?: string | null): T | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export interface CursorSortField {
  field: string;
  direction: 'asc' | 'desc';
  /** Valeur de ce champ pour le dernier élément de la page précédente. */
  value: unknown;
}

/**
 * Construit un WHERE Prisma générique pour reprendre après un curseur, sur un
 * tri multi-champs (ex: sponsorisé > mis en avant > prix > id). Chaque champ
 * ajoute une clause "strictement après lui, à égalité stricte des champs
 * précédents" — garantit qu'aucune ligne n'est répétée ni sautée, même à tri
 * composite. Le dernier champ doit être une colonne unique (id) pour lever
 * toute ambiguïté en cas d'égalité sur les champs précédents.
 *
 * Prisma ne supporte pas `lt`/`gt` sur les booléens (seulement `equals`/`not`) :
 * un champ booléen est traité à part (il n'a que deux valeurs, "strictement
 * après" n'existe que dans un sens).
 */
export function buildCursorWhere(sorts: CursorSortField[]): Record<string, unknown> {
  const clauses: Record<string, unknown>[] = [];
  for (let i = 0; i < sorts.length; i++) {
    const eqPrefix = sorts.slice(0, i).map((s) => ({ [s.field]: s.value }));
    const s = sorts[i];
    if (typeof s.value === 'boolean') {
      const hasSuccessor = s.direction === 'desc' ? s.value === true : s.value === false;
      if (!hasSuccessor) continue; // valeur déjà à l'extrême : aucune ligne ne peut suivre sur ce champ
      clauses.push({ AND: [...eqPrefix, { [s.field]: !s.value }] });
    } else {
      const op = s.direction === 'desc' ? 'lt' : 'gt';
      clauses.push({ AND: [...eqPrefix, { [s.field]: { [op]: s.value } }] });
    }
  }
  return { OR: clauses };
}

export function serializeSortValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
