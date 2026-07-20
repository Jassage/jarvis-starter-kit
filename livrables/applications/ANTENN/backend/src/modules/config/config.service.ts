import prisma from '../../config/database';
import { PositionOverlay } from '@prisma/client';

// Config de chaîne = singleton. getOrCreate garantit qu'une seule ligne existe et
// évite d'avoir à seeder impérativement la config (auto-créée au premier accès).
export async function getConfig() {
  const existing = await prisma.configChaine.findFirst();
  if (existing) return existing;
  return prisma.configChaine.create({ data: {} });
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
