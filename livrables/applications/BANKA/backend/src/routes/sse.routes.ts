import { Router } from 'express';
import { randomUUID } from 'crypto';
import { requireAuthSSE } from '../middleware/auth';
import { addSSEClient, removeSSEClient } from '../services/sse.service';

const router = Router();

router.get('/', requireAuthSSE, (req: any, res: any) => {
  const clientId = randomUUID();
  const userId = req.user!.userId as string;
  const agenceId = req.user!.agenceId as string | null;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Confirmer la connexion
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', data: { clientId } })}\n\n`);

  addSSEClient(clientId, userId, agenceId, res);

  // Heartbeat toutes les 30s pour maintenir la connexion ouverte
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 30_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSSEClient(clientId);
  });
});

export default router;
