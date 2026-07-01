import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AIService } from './ai.service';
import { requireAuth } from '../../middlewares/auth.middleware';
import { aiLimiter } from '../../middlewares/rateLimiter.middleware';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
const aiService = new AIService();

// Toutes les routes AI sont soumises au rate limiter (20 req/heure par IP)
router.use(aiLimiter);

/**
 * @swagger
 * /api/ai/estimate:
 *   post:
 *     summary: Estimate property price via AI
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/estimate', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await aiService.estimatePrice(req.body);
    return sendSuccess(res, result, 'Estimation générée');
  } catch {
    return sendError(res, 'Impossible de générer l\'estimation', 500);
  }
});

/**
 * @swagger
 * /api/ai/generate-description:
 *   post:
 *     summary: Generate listing description via AI
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/generate-description', requireAuth, async (req: Request, res: Response) => {
  try {
    const description = await aiService.generateDescription(req.body);
    return sendSuccess(res, { description }, 'Description générée');
  } catch {
    return sendError(res, 'Impossible de générer la description', 500);
  }
});

/**
 * @swagger
 * /api/ai/search:
 *   post:
 *     summary: Natural language search parsing
 *     tags: [AI]
 */
router.post('/search', async (req: Request, res: Response) => {
  const schema = z.object({ query: z.string().min(3).max(500) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Query invalide', 400);

  try {
    const filters = await aiService.naturalLanguageSearch(parsed.data.query);
    return sendSuccess(res, filters, 'Filtres extraits');
  } catch {
    return sendError(res, 'Impossible d\'analyser la recherche', 500);
  }
});

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI assistant chat
 *     tags: [AI]
 */
router.post('/chat', async (req: Request, res: Response) => {
  const schema = z.object({
    message: z.string().min(1).max(1000),
    listingId: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Message invalide', 400);

  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const reply = await aiService.chat(userId ?? 'anonymous', parsed.data.message, parsed.data.listingId);
    return sendSuccess(res, { reply }, 'Réponse générée');
  } catch {
    return sendError(res, 'Assistant temporairement indisponible', 500);
  }
});

export default router;
