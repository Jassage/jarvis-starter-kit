import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";
import { AuthRequest } from "../types";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import {
  registerService,
  loginService,
  getMeService,
  requestPasswordResetService,
  resetPasswordService,
  verifyEmailService,
  changePasswordService,
  deleteAccountService,
} from "../services/auth.service";

const router = Router();

router.post("/register", authLimiter, async (req, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerService(data);
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.post("/login", authLimiter, async (req, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginService(data);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(401).json({ success: false, error: message });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getMeService(req.userId!);
    res.json({ success: true, data: user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(404).json({ success: false, error: message });
  }
});

router.post("/forgot-password", async (req, res: Response): Promise<void> => {
  await requestPasswordResetService(req.body.email).catch(() => {});
  res.json({ success: true, message: "Si cet email existe, un lien a été envoyé." });
});

router.post("/reset-password", async (req, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, error: "Token et mot de passe requis" });
      return;
    }
    await resetPasswordService(token, password);
    res.json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/verify-email/:token", async (req, res: Response): Promise<void> => {
  try {
    await verifyEmailService(req.params.token as string);
    res.json({ success: true, message: "Email vérifié avec succès" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.put("/change-password", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, error: "Données invalides" });
      return;
    }
    await changePasswordService(req.userId!, currentPassword, newPassword);
    res.json({ success: true, message: "Mot de passe modifié" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

router.delete("/account", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ success: false, error: "Mot de passe requis" });
      return;
    }
    await deleteAccountService(req.userId!, password);
    res.json({ success: true, message: "Compte supprimé" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
