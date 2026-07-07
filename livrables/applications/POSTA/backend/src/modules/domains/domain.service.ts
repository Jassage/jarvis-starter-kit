import { RoleUtilisateur } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';
import { generateDkimKeyPair } from '../../utils/dkim';
import { checkDomainDns } from '../../utils/dns-check';
import { assertDomainQuota } from '../billing/quota';

interface Requester {
  userId: string;
  role: RoleUtilisateur;
}

function assertAccess(domain: { ownerId: string }, requester: Requester) {
  if (requester.role !== 'SUPER_ADMIN' && domain.ownerId !== requester.userId) {
    throw new AppError(403, 'Accès refusé : ce domaine ne vous appartient pas');
  }
}

export async function createDomain(ownerId: string, nomDomaineRaw: string) {
  await assertDomainQuota(ownerId);

  const nomDomaine = nomDomaineRaw.trim().toLowerCase();

  const existing = await prisma.domain.findUnique({ where: { nomDomaine } });
  if (existing) throw new AppError(409, 'Ce domaine est déjà enregistré');

  const { dkimSelector, dkimPublicKey, dkimTxtValue } = generateDkimKeyPair(nomDomaine);

  return prisma.domain.create({
    data: { nomDomaine, ownerId, dkimSelector, dkimPublicKey, dkimTxtValue },
  });
}

export async function listDomains(requester: Requester) {
  const where = requester.role === 'SUPER_ADMIN' ? {} : { ownerId: requester.userId };
  return prisma.domain.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getDomain(id: string, requester: Requester) {
  const domain = await prisma.domain.findUnique({ where: { id } });
  if (!domain) throw new AppError(404, 'Domaine introuvable');
  assertAccess(domain, requester);
  return domain;
}

export async function verifyDomain(id: string, requester: Requester) {
  const domain = await getDomain(id, requester);
  const result = await checkDomainDns(domain.nomDomaine, domain.dkimSelector, domain.dkimPublicKey);
  const toutOk = result.mxOk && result.spfOk && result.dkimOk && result.dmarcOk;

  return prisma.domain.update({
    where: { id },
    data: {
      mxOk: result.mxOk,
      spfOk: result.spfOk,
      dkimOk: result.dkimOk,
      dmarcOk: result.dmarcOk,
      lastError: result.lastError,
      lastCheckedAt: new Date(),
      verifiedAt: toutOk ? new Date() : domain.verifiedAt,
      statut: toutOk ? 'VERIFIE' : 'EN_ATTENTE',
    },
  });
}

export async function deleteDomain(id: string, requester: Requester) {
  const domain = await getDomain(id, requester);

  const [mailboxCount, aliasCount] = await Promise.all([
    prisma.mailbox.count({ where: { domainId: domain.id } }),
    prisma.alias.count({ where: { domainId: domain.id } }),
  ]);
  if (mailboxCount > 0 || aliasCount > 0) {
    throw new AppError(409, 'Impossible de supprimer un domaine avec des boîtes mail ou alias actifs');
  }

  await prisma.domain.delete({ where: { id: domain.id } });
}
