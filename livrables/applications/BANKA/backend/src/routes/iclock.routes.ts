import { Router, Request, Response, NextFunction } from 'express';
import * as ctrl from '../controllers/device.controller';

const router = Router();

// ZKTeco envoie parfois text/plain, parfois sans Content-Type
// On lit le flux brut et on le stocke en string sur req.body
function rawText(req: Request, _res: Response, next: NextFunction) {
  if (req.method === 'GET') { next(); return; }
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => {
    req.body = Buffer.concat(chunks).toString('utf8');
    next();
  });
  req.on('error', next);
}

router.use(rawText);

router.get('/cdata',  ctrl.iclockGet);
router.post('/cdata', ctrl.iclockPost);

export default router;
