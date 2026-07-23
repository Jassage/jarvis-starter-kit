/** Lecture centralisee des variables d'environnement du worker. */

function requis(nom: string): string {
  const v = process.env[nom];
  if (!v || v.trim() === "") {
    throw new Error(`Variable d'environnement manquante: ${nom}`);
  }
  return v;
}

function optionnel(nom: string, defaut: string): string {
  const v = process.env[nom];
  return v && v.trim() !== "" ? v : defaut;
}

export const env = {
  /** Chemin vers la cle de compte de service Firebase (GOOGLE_APPLICATION_CREDENTIALS). */
  get firebaseCredentials(): string {
    return requis("GOOGLE_APPLICATION_CREDENTIALS");
  },
  /** Identifiant du dataset Socrata NY (Numbers/Win-4). Voir README. */
  socrataDatasetNy: optionnel("SOCRATA_DATASET_NY", "hsys-3def"),
  /** App token Socrata (optionnel, augmente les quotas). */
  socrataAppToken: optionnel("SOCRATA_APP_TOKEN", ""),
  /** Fuseau des tirages (heure de l'Est). */
  timezone: optionnel("DRAW_TIMEZONE", "America/New_York"),
  /** Mode : "cron" (planifie) ou "once" (une passe puis sortie), utile en debug. */
  runMode: optionnel("RUN_MODE", "cron"),
};
