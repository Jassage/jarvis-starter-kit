import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import {
  createStripeSession,
  handleStripeWebhook,
  createMoncashPayment,
  verifyMoncashPayment,
} from "../services/payment.service";

const router = Router();

// ─── Stripe ───────────────────────────────────────────────────────────────────

router.post("/stripe/create-checkout", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const result = await createStripeSession(req.userId!, planId);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

// Webhook Stripe — doit recevoir le body raw (non parsé)
router.post("/stripe/webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    await handleStripeWebhook(req.body as Buffer, sig);
    res.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    res.status(400).json({ error: message });
  }
});

// ─── MonCash ─────────────────────────────────────────────────────────────────

router.post("/moncash/create", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const result = await createMoncashPayment(req.userId!, planId);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/moncash/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.query.orderId as string;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

    if (!orderId) { res.redirect(`${frontendUrl}/premium?error=missing_order`); return; }

    const success = await verifyMoncashPayment(orderId);
    if (success) {
      res.redirect(`${frontendUrl}/premium/success`);
    } else {
      res.redirect(`${frontendUrl}/premium?error=payment_failed`);
    }
  } catch {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    res.redirect(`${frontendUrl}/premium?error=server_error`);
  }
});

// ─── Vérification statut Premium ─────────────────────────────────────────────

router.get("/status", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = await import("../lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { subscriptionPlan: true, subscriptionExpiry: true },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
});

export default router;
