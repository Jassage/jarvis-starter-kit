import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { requireAuth } from '../../middlewares/auth.middleware';
import { sendSuccess } from '../../utils/response';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';

const router = Router();
router.use(requireAuth);

// Plans et tarifs
router.get('/plans', asyncHandler(async (_req, res) => {
  const plans = [
    {
      id: 'BASIC',
      name: 'Basic',
      priceHTG: 2500,
      priceUSD: 20,
      duration: 30,
      features: ['20 annonces actives', '90 jours par annonce', 'Photos illimitées', 'Messagerie'],
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professionnel',
      priceHTG: 7500,
      priceUSD: 60,
      duration: 30,
      features: ['Annonces illimitées', '180 jours par annonce', '3 annonces sponsorisées/mois', 'Dashboard analytique', 'Support prioritaire'],
    },
    {
      id: 'ENTERPRISE',
      name: 'Entreprise',
      priceHTG: 20000,
      priceUSD: 160,
      duration: 30,
      features: ['Tout du Pro', 'API accès', 'Agent dédié', 'Logo agence vérifié', 'Intégration custom'],
    },
  ];
  sendSuccess(res, { plans });
}));

// Historique des paiements
router.get('/history', asyncHandler(async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  sendSuccess(res, { payments });
}));

// Initier un paiement MonCash
router.post('/moncash/initiate', asyncHandler(async (req, res) => {
  const { planId, currency } = req.body;

  const planPrices: Record<string, { htg: number; usd: number }> = {
    BASIC: { htg: 2500, usd: 20 },
    PROFESSIONAL: { htg: 7500, usd: 60 },
    ENTERPRISE: { htg: 20000, usd: 160 },
  };

  if (!planPrices[planId]) throw new AppError('Plan invalide', 400);

  const amount = currency === 'USD' ? planPrices[planId].usd : planPrices[planId].htg;

  // Créer le paiement en attente
  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      amount,
      currency: currency || 'HTG',
      method: 'MONCASH',
      status: 'PENDING',
      description: `Abonnement LAKAY ${planId}`,
      metadata: { planId },
    },
  });

  // TODO: intégrer l'API MonCash réelle avec les credentials Digicel Business
  // Simulation : retourner un lien de paiement fictif
  sendSuccess(res, {
    paymentId: payment.id,
    redirectUrl: `https://moncashbutton.digicelhaiti.com/checkout/${payment.id}`,
    orderId: payment.id,
  }, 'Paiement initié');
}));

// Webhook MonCash
router.post('/moncash/callback', asyncHandler(async (req, res) => {
  const { orderId, transactionId, success } = req.body;

  const payment = await prisma.payment.findFirst({
    where: { id: orderId, status: 'PENDING' },
  });

  if (!payment) { res.status(404).json({ success: false }); return; }

  if (success) {
    const planId = (payment.metadata as Record<string, string>)?.planId;
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', providerRef: transactionId },
      });
      if (planId) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        await tx.subscription.upsert({
          where: { userId: payment.userId },
          create: { userId: payment.userId, plan: planId as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE', endDate, isActive: true },
          update: { plan: planId as 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE', endDate, isActive: true, startDate: new Date() },
        });
      }
    });
  } else {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
  }

  res.json({ success: true });
}));

export default router;
