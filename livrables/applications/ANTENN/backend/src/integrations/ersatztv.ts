/**
 * Point d'intégration ErsatzTV — documenté, non branché.
 *
 * ErsatzTV est le moteur de playout du client (existant, pas recodé ici). Cette
 * appli gère la grille "prévue" (CreneauGrille en base) ; ErsatzTV gère la grille
 * "réellement diffusée" une fois configurée de son côté. Les deux doivent être
 * synchronisées, mais l'API réelle d'ErsatzTV (base URL + clé) n'est pas
 * disponible dans cet environnement — donc :
 *
 * - `CreneauGrille.syncStatus` passe à SYNCHRONISE uniquement par action manuelle
 *   d'un opérateur (POST /api/creneaux/:id/synchroniser), après qu'il ait répercuté
 *   la grille dans ErsatzTV via son propre outillage (UI ou API ErsatzTV directe).
 * - `Match.statutDiffusion` passe à EN_COURS / TERMINE uniquement via les actions
 *   explicites "Démarrer"/"Terminer le direct" d'un opérateur — pas de détection
 *   automatique de l'ingest RTMP tant que ce point n'est pas câblé.
 *
 * Quand un accès réel à l'API ErsatzTV sera disponible, brancher ici :
 *   - pushCreneauVersErsatzTv(creneau) : POST vers l'API ErsatzTV pour créer/mettre
 *     à jour le bloc de programmation correspondant.
 *   - verifierStatutIngest(match) : poll de l'API ErsatzTV (ou du serveur RTMP) pour
 *     détecter automatiquement le passage en direct et appeler demarrerMatch().
 *
 * ERSATZTV_BASE_URL / ERSATZTV_API_KEY sont déjà en config (src/config/env.ts)
 * pour éviter d'avoir à retoucher la config quand l'intégration sera codée.
 */
import { env } from '../config/env';

export function estErsatzTvConfigure(): boolean {
  return Boolean(env.ERSATZTV_BASE_URL);
}
