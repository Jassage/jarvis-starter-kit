/** Firestore rejette toute écriture contenant un champ de valeur `undefined` : on les retire avant d'écrire. */
export function omitUndefined<T extends Record<string, unknown>>(data: T): T {
  const resultat = {} as T;
  for (const [cle, valeur] of Object.entries(data)) {
    if (valeur !== undefined) (resultat as Record<string, unknown>)[cle] = valeur;
  }
  return resultat;
}
