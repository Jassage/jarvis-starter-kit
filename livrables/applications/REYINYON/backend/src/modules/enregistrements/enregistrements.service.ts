import { EncodedFileOutput, EncodedFileType, EgressStatus } from 'livekit-server-sdk';
import prisma from '../../config/database';
import { egressClient } from '../../config/livekit';
import { AppError } from '../../middlewares/errorHandler.middleware';
import logger from '../../utils/logger';

// Egress peut s'arrêter tout seul (crash Chrome, room vide, "Start signal not
// received"...) sans que ce backend en soit informé autrement qu'en
// interrogeant son statut réel — sinon un enregistrement mort reste "EN_COURS"
// en base indéfiniment et bloque tout nouvel enregistrement pour la réunion.
async function estEgressActif(egressId: string | null): Promise<boolean> {
  if (!egressId) return false;
  try {
    const liste = await egressClient.listEgress({ egressId });
    const info = liste[0];
    return info?.status === EgressStatus.EGRESS_ACTIVE || info?.status === EgressStatus.EGRESS_STARTING;
  } catch {
    return false;
  }
}

// Sortie fichier local (pas de S3/GCS) — Egress écrit directement sur le
// volume Docker monté (./recordings côté hôte, /out côté conteneur egress),
// servi ensuite par le backend via la route statique /recordings (cf. app.ts).
export async function demarrer(reunionId: string, livekitRoomName: string) {
  const enCours = await prisma.enregistrement.findFirst({ where: { reunionId, statut: 'EN_COURS' } });
  if (enCours) {
    if (await estEgressActif(enCours.egressId)) {
      throw new AppError('Un enregistrement est déjà en cours pour cette réunion', 409);
    }
    // Egress mort sans qu'on l'ait su — état corrigé plutôt que de rester
    // bloqué indéfiniment sur un enregistrement fantôme.
    await prisma.enregistrement.update({ where: { id: enCours.id }, data: { statut: 'DISPONIBLE', egressId: null } });
  }

  const nomFichier = `${livekitRoomName}-${Date.now()}.mp4`;
  const enregistrement = await prisma.enregistrement.create({ data: { reunionId, statut: 'EN_COURS' } });

  try {
    const info = await egressClient.startRoomCompositeEgress(
      livekitRoomName,
      { file: new EncodedFileOutput({ filepath: `/out/${nomFichier}`, fileType: EncodedFileType.MP4 }) },
      { layout: 'grid' }
    );
    return await prisma.enregistrement.update({
      where: { id: enregistrement.id },
      data: { egressId: info.egressId, urlFichier: `/recordings/${nomFichier}` },
    });
  } catch (err) {
    // Pas d'enregistrement fantôme en base si Egress refuse de démarrer
    // (ex. conteneur egress pas encore prêt, room introuvable).
    await prisma.enregistrement.delete({ where: { id: enregistrement.id } });
    logger.error({ err, reunionId, livekitRoomName }, "Échec du démarrage de l'enregistrement Egress");
    throw new AppError("Impossible de démarrer l'enregistrement", 502);
  }
}

export async function arreter(reunionId: string) {
  const enCours = await prisma.enregistrement.findFirst({ where: { reunionId, statut: 'EN_COURS' } });
  if (!enCours || !enCours.egressId) throw new AppError('Aucun enregistrement en cours pour cette réunion', 404);

  try {
    await egressClient.stopEgress(enCours.egressId);
  } catch (err) {
    // Déjà arrêté/mort côté Egress (ex. abort spontané) — pas bloquant, l'état
    // en base doit quand même sortir de EN_COURS.
    logger.warn({ err, egressId: enCours.egressId }, 'stopEgress a échoué, probablement déjà terminé');
  }
  return prisma.enregistrement.update({
    where: { id: enCours.id },
    data: { statut: 'DISPONIBLE', egressId: null },
  });
}

export async function lister(reunionId: string) {
  return prisma.enregistrement.findMany({
    where: { reunionId, statut: 'DISPONIBLE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function obtenirEnCours(reunionId: string) {
  return prisma.enregistrement.findFirst({ where: { reunionId, statut: 'EN_COURS' } });
}
