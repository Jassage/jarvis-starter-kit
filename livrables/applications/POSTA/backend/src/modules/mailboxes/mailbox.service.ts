import { RoleUtilisateur } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../types';
import * as domainService from '../domains/domain.service';
import { hashMailboxPassword } from '../../utils/crypt';
import { assertMailboxQuota, resolveMailboxQuota } from '../billing/quota';

interface Requester {
  userId: string;
  role: RoleUtilisateur;
}

// Ne jamais renvoyer passwordHash dans une réponse API.
const SAFE_SELECT = {
  id: true,
  domainId: true,
  localPart: true,
  email: true,
  quotaMb: true,
  actif: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function getMailboxOrThrow(domainId: string, id: string) {
  const mailbox = await prisma.mailbox.findFirst({ where: { id, domainId } });
  if (!mailbox) throw new AppError(404, 'Boîte mail introuvable');
  return mailbox;
}

export async function createMailbox(
  domainId: string,
  requester: Requester,
  localPartRaw: string,
  motDePasse: string,
  quotaMb?: number
) {
  const domain = await domainService.getDomain(domainId, requester);
  await assertMailboxQuota(domain.ownerId);

  const localPart = localPartRaw.trim().toLowerCase();
  const email = `${localPart}@${domain.nomDomaine}`;

  const [existingMailbox, existingAlias] = await Promise.all([
    prisma.mailbox.findUnique({ where: { email } }),
    prisma.alias.findUnique({ where: { source: email } }),
  ]);
  if (existingMailbox) throw new AppError(409, 'Cette boîte mail existe déjà');
  if (existingAlias) throw new AppError(409, 'Un alias existe déjà pour cette adresse');

  const quotaMbResolu = await resolveMailboxQuota(domain.ownerId, quotaMb);

  return prisma.mailbox.create({
    data: {
      domainId,
      localPart,
      email,
      passwordHash: hashMailboxPassword(motDePasse),
      quotaMb: quotaMbResolu,
    },
    select: SAFE_SELECT,
  });
}

export async function listMailboxes(domainId: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  return prisma.mailbox.findMany({
    where: { domainId },
    select: SAFE_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMailbox(domainId: string, id: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  const mailbox = await getMailboxOrThrow(domainId, id);
  const { passwordHash: _passwordHash, ...safe } = mailbox;
  return safe;
}

export async function updateMailbox(
  domainId: string,
  id: string,
  requester: Requester,
  data: { motDePasse?: string; quotaMb?: number; actif?: boolean }
) {
  const domain = await domainService.getDomain(domainId, requester);
  await getMailboxOrThrow(domainId, id);
  const quotaMbClampe =
    data.quotaMb !== undefined ? await resolveMailboxQuota(domain.ownerId, data.quotaMb) : undefined;

  return prisma.mailbox.update({
    where: { id },
    data: {
      ...(data.motDePasse ? { passwordHash: hashMailboxPassword(data.motDePasse) } : {}),
      ...(quotaMbClampe !== undefined ? { quotaMb: quotaMbClampe } : {}),
      ...(data.actif !== undefined ? { actif: data.actif } : {}),
    },
    select: SAFE_SELECT,
  });
}

export async function deleteMailbox(domainId: string, id: string, requester: Requester) {
  await domainService.getDomain(domainId, requester);
  await getMailboxOrThrow(domainId, id);
  await prisma.mailbox.delete({ where: { id } });
}
