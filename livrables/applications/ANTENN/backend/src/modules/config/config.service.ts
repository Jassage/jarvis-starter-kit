import prisma from '../../config/database';
import { PositionOverlay } from '@prisma/client';

// Config de chaîne = singleton, auto-créée au premier accès (pas besoin de la seeder).
// Le chemin de création passe par un upsert sur la colonne de verrou `singleton` :
// findFirst + create ne suffisait pas — deux appels concurrents sur une base neuve
// (l'EPG public et le détail d'un replay arrivent en parallèle) ne voyaient rien
// chacun de leur côté et créaient chacun leur ligne, après quoi findFirst renvoyait
// l'une ou l'autre et le logo de chaîne apparaissait par intermittence.
export async function getConfig() {
  const existing = await prisma.configChaine.findFirst();
  if (existing) return existing;
  return prisma.configChaine.upsert({ where: { singleton: true }, create: {}, update: {} });
}

interface ConfigInput {
  nomChaine?: string;
  logoPosition?: PositionOverlay;
  logoOpacite?: number;
  logoActif?: boolean;
}

export async function updateConfig(data: ConfigInput) {
  const config = await getConfig();
  return prisma.configChaine.update({ where: { id: config.id }, data });
}

export async function updateLogoChaine(logoUrl: string) {
  const config = await getConfig();
  return prisma.configChaine.update({ where: { id: config.id }, data: { logoUrl } });
}
