import { RoleUtilisateur } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';
import * as domainService from '../domains/domain.service';

interface Requester {
  userId: string;
  role: RoleUtilisateur;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normaliseSource(sourceRaw: string, nomDomaine: string): string {
  const source = sourceRaw.trim().toLowerCase();
  const catchAll = `@${nomDomaine}`;
  if (source === catchAll) return source;
  if (!source.endsWith(`@${nomDomaine}`) || !EMAIL_REGEX.test(source)) {
    throw new AppError(422, `L'alias doit être une adresse du domaine ${nomDomaine}`);
  }
  return source;
}

function normaliseDestinations(destinationRaw: string): string {
  const destinations = destinationRaw
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  if (destinations.length === 0) throw new AppError(422, 'Au moins une destination requise');
  for (const dest of destinations) {
    if (!EMAIL_REGEX.test(dest)) throw new AppError(422, `Destination invalide : ${dest}`);
  }
  return destinations.join(', ');
}

async function getAliasOrThrow(domainId: string, id: string) {
  const alias = await prisma.alias.findFirst({ where: { id, domainId } });
  if (!alias) throw new AppError(404, 'Alias introuvable');
  return alias;
}

export async function createAlias(
  domainId: string,
  requester: Requester,
  sourceRaw: string,
  destinationRaw: string
) {
  const domain = await domainService.getDomain(domainId, requester);
  const source = normaliseSource(sourceRaw, domain.nomDomaine);
  const destination = normaliseDestinations(destinationRaw);

  const [existingAlias, existingMailbox] = await Promise.all([
    prisma.alias.findUnique({ where: { source } }),
    prisma.mailbox.findUnique({ where: { email: source } }),
  ]);
  if (existingAlias) throw new AppError(409, 'Cet alias existe déjà');
  if (existingMailbox) throw new AppError(409, 'Une boîte mail existe déjà pour cette adresse');

  return prisma.alias.create({ data: { domainId, source, destination } });
}

export async function listAliases(domainId: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  return prisma.alias.findMany({ where: { domainId }, orderBy: { createdAt: 'desc' } });
}

export async function getAlias(domainId: string, id: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  return getAliasOrThrow(domainId, id);
}

export async function updateAlias(
  domainId: string,
  id: string,
  requester: Requester,
  data: { destination?: string; actif?: boolean }
) {
  await domainService.getDomain(domainId, requester);
  await getAliasOrThrow(domainId, id);

  return prisma.alias.update({
    where: { id },
    data: {
      ...(data.destination !== undefined ? { destination: normaliseDestinations(data.destination) } : {}),
      ...(data.actif !== undefined ? { actif: data.actif } : {}),
    },
  });
}

export async function deleteAlias(domainId: string, id: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  await getAliasOrThrow(domainId, id);
  await prisma.alias.delete({ where: { id } });
}
