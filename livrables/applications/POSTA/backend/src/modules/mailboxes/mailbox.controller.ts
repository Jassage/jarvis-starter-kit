import { Response } from 'express';
import * as mailboxService from './mailbox.service';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../types';
import { logAudit } from '../../utils/audit';

export async function createMailbox(req: AuthRequest, res: Response) {
  const mailbox = await mailboxService.createMailbox(
    req.params.domainId,
    req.user!,
    req.body.localPart,
    req.body.motDePasse,
    req.body.quotaMb
  );
  await logAudit({
    req,
    action: 'BOITE_MAIL_CREEE',
    entite: 'Mailbox',
    entiteId: mailbox.id,
    changes: { email: mailbox.email },
  });
  sendSuccess(res, { mailbox }, 'Boîte mail créée', 201);
}

export async function listMailboxes(req: AuthRequest, res: Response) {
  const mailboxes = await mailboxService.listMailboxes(req.params.domainId, req.user!);
  sendSuccess(res, { mailboxes });
}

export async function getMailbox(req: AuthRequest, res: Response) {
  const mailbox = await mailboxService.getMailbox(req.params.domainId, req.params.id, req.user!);
  sendSuccess(res, { mailbox });
}

export async function updateMailbox(req: AuthRequest, res: Response) {
  const mailbox = await mailboxService.updateMailbox(req.params.domainId, req.params.id, req.user!, {
    motDePasse: req.body.motDePasse,
    quotaMb: req.body.quotaMb,
    actif: req.body.actif,
  });
  await logAudit({
    req,
    action: 'BOITE_MAIL_MODIFIEE',
    entite: 'Mailbox',
    entiteId: mailbox.id,
    changes: {
      email: mailbox.email,
      motDePasseModifie: req.body.motDePasse !== undefined,
      quotaMb: req.body.quotaMb,
      actif: req.body.actif,
    },
  });
  sendSuccess(res, { mailbox }, 'Boîte mail mise à jour');
}

export async function deleteMailbox(req: AuthRequest, res: Response) {
  const mailbox = await mailboxService.getMailbox(req.params.domainId, req.params.id, req.user!);
  await mailboxService.deleteMailbox(req.params.domainId, req.params.id, req.user!);
  await logAudit({
    req,
    action: 'BOITE_MAIL_SUPPRIMEE',
    entite: 'Mailbox',
    entiteId: mailbox.id,
    changes: { email: mailbox.email },
  });
  sendSuccess(res, null, 'Boîte mail supprimée');
}
