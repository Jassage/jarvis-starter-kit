import { Router, Request, Response } from "express";
import { ZodError } from "zod";
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
  refreshTokenService,
  logoutService,
} from "../services/auth.service";

const router = Router();

const REFRESH_COOKIE = "konekte_refresh";
const isProd = process.env.NODE_ENV === "production";

const isMobileClient = (req: Request): boolean =>
  req.headers["x-client-type"] === "mobile";

// ZodError.message est un JSON.stringify() brut des issues de validation
// (illisible côté client). Ce format-la a fuité directement dans les
// réponses d'erreur (register/login/...) — on renvoie le premier message
// de validation lisible à la place.
const formatError = (err: unknown): string => {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "Données invalides";
  }
  return err instanceof Error ? err.message : "Erreur serveur";
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
};

router.post("/register", authLimiter, async (req, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const { refreshToken, ...result } = await registerService(data);
    if (isMobileClient(req)) {
      res.status(201).json({ success: true, data: { ...result, refreshToken } });
      return;
    }
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const message = formatError(err);
    res.status(400).json({ success: false, error: message });
  }
});

router.post("/login", authLimiter, async (req, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const { refreshToken, ...result } = await loginService(data);
    if (isMobileClient(req)) {
      res.json({ success: true, data: { ...result, refreshToken } });
      return;
    }
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = formatError(err);
    res.status(401).json({ success: false, error: message });
  }
});

router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const mobile = isMobileClient(req);
    const rawToken = mobile ? req.body?.refreshToken : req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) { res.status(401).json({ success: false, error: "Non authentifié" }); return; }

    const { refreshToken, ...result } = await refreshTokenService(rawToken);
    if (mobile) {
      res.json({ success: true, data: { ...result, refreshToken } });
      return;
    }
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    if (!isMobileClient(req)) clearRefreshCookie(res);
    const message = formatError(err);
    res.status(401).json({ success: false, error: message });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  const mobile = isMobileClient(req);
  const rawToken = mobile ? req.body?.refreshToken : req.cookies?.[REFRESH_COOKIE];
  await logoutService(rawToken).catch(() => {});
  if (!mobile) clearRefreshCookie(res);
  res.json({ success: true });
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getMeService(req.userId!);
    res.json({ success: true, data: user });
  } catch (err: unknown) {
    const message = formatError(err);
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
    const message = formatError(err);
    res.status(400).json({ success: false, error: message });
  }
});

router.get("/verify-email/:token", async (req, res: Response): Promise<void> => {
  try {
    await verifyEmailService(req.params.token as string);
    res.json({ success: true, message: "Email vérifié avec succès" });
  } catch (err: unknown) {
    const message = formatError(err);
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
    const message = formatError(err);
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
    const message = formatError(err);
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
