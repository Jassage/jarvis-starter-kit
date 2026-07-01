import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import * as messagesService from './messages.service';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.middleware';

const startConversationSchema = z.object({
  body: z.object({
    otherUserId: z.string(),
    listingId: z.string().optional(),
    firstMessage: z.string().min(1).max(1000),
  }),
});

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(2000),
    attachmentUrl: z.string().url().optional(),
    attachmentType: z.string().optional(),
  }),
  params: z.object({ conversationId: z.string() }),
});

const router = Router();

router.use(requireAuth);

// Démarrer ou récupérer une conversation
router.post('/start', validate(startConversationSchema), asyncHandler(async (req, res) => {
  const { otherUserId, listingId, firstMessage } = req.body;
  const conv = await messagesService.getOrCreateConversation(req.user!.id, otherUserId, listingId);
  // Envoyer le premier message si c'est une nouvelle conversation
  if (conv.messages.length === 0 || firstMessage) {
    await messagesService.sendMessage(conv.id, req.user!.id, firstMessage);
  }
  sendSuccess(res, { conversation: conv }, 'Conversation démarrée', 201);
}));

// Liste des conversations
router.get('/', asyncHandler(async (req, res) => {
  const conversations = await messagesService.getConversations(req.user!.id);
  sendSuccess(res, { conversations });
}));

// Nombre de messages non lus
router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await messagesService.getUnreadCount(req.user!.id);
  sendSuccess(res, { count });
}));

// Messages d'une conversation
router.get('/:conversationId/messages', asyncHandler(async (req, res) => {
  const result = await messagesService.getMessages(
    req.params.conversationId,
    req.user!.id,
    req.query as Record<string, string>
  );
  sendSuccess(res, { messages: result.messages }, 'Messages', 200, { pagination: result.pagination });
}));

// Envoyer un message
router.post('/:conversationId/messages', validate(sendMessageSchema), asyncHandler(async (req, res) => {
  const msg = await messagesService.sendMessage(
    req.params.conversationId,
    req.user!.id,
    req.body.content,
    req.body.attachmentUrl,
    req.body.attachmentType
  );
  sendSuccess(res, { message: msg }, 'Message envoyé', 201);
}));

export default router;
