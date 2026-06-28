import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ok } from '../types';
import * as svc from '../services/device.service';

// ─── ZKTeco ADMS ─────────────────────────────────────────────────────────────

export async function iclockGet(req: Request, res: Response) {
  const sn      = req.query.SN as string;
  const commKey = req.query.CommKey as string | undefined;
  const info    = req.query.INFO as string | undefined;

  if (!sn) { res.status(400).send('REJECT'); return; }

  const device = await svc.findDeviceBySN(sn, commKey);

  // Heartbeat (/iclock/cdata?SN=xxx&INFO=...)
  if (info) {
    if (device) await svc.touchDevice(sn);
    res.setHeader('Content-Type', 'text/plain');
    res.send(device ? 'OK' : 'REJECT');
    return;
  }

  if (!device) { res.setHeader('Content-Type', 'text/plain'); res.send('REJECT'); return; }

  await svc.touchDevice(sn);

  // Réponse de configuration pour l'appareil
  res.setHeader('Content-Type', 'text/plain');
  res.send([
    `GET OPTION FROM: ${sn}`,
    'ATTLOGStamp=0',
    'OPERLOGStamp=9999',
    'ATTPHOTOStamp=0',
    'ErrorDelay=30',
    'Delay=10',
    'TransTimes=00:00;14:05',
    'TransInterval=1',
    'TransFlag=TransData AttLog OpLog',
    'TimeZone=0',
    'Realtime=1',
    'Encrypt=0',
  ].join('\n'));
}

export async function iclockPost(req: Request, res: Response) {
  const sn      = req.query.SN as string;
  const commKey = req.query.CommKey as string | undefined;
  const table   = req.query.table as string;

  res.setHeader('Content-Type', 'text/plain');

  if (!sn) { res.send('REJECT'); return; }

  const device = await svc.findDeviceBySN(sn, commKey);
  if (!device) { res.send('REJECT'); return; }

  await svc.touchDevice(sn);

  if (table === 'ATTLOG') {
    const body  = typeof req.body === 'string' ? req.body : req.body?.toString?.() || '';
    const count = await svc.processAttLog(body, device.id, sn);
    res.send(`OK: ${count}`);
    return;
  }

  // OPERLOG et autres tables → on accuse réception sans traitement
  res.send('OK: 0');
}

// ─── CRUD Appareils ──────────────────────────────────────────────────────────

export async function listDevices(req: AuthRequest, res: Response, next: NextFunction) {
  try { res.json(ok(await svc.listDevices())); } catch (e) { next(e); }
}

export async function createDevice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const device = await svc.createDevice(req.body, req.user!.userId);
    res.status(201).json(ok(device, 'Appareil enregistré'));
  } catch (e) { next(e); }
}

export async function updateDevice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const device = await svc.updateDevice(req.params.id, req.body, req.user!.userId);
    res.json(ok(device, 'Appareil mis à jour'));
  } catch (e) { next(e); }
}

export async function deleteDevice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteDevice(req.params.id, req.user!.userId);
    res.json(ok(null, 'Appareil supprimé'));
  } catch (e) { next(e); }
}
