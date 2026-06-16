import { Request, Response } from "express";
import { AuthRequest } from "../types";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import {
  registerService,
  loginService,
  verifyEmailService,
  getMeService,
} from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body as Record<string, unknown>);
    const result = await registerService(data);
    res.status(201).json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
    res.status(400).json({ success: false, error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body as Record<string, unknown>);
    const result = await loginService(data);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur lors de la connexion";
    res.status(400).json({ success: false, error: message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    await verifyEmailService(req.params.token as string);
    res.json({ success: true, message: "Email vérifié avec succès" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de vérification";
    res.status(400).json({ success: false, error: message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ success: false, error: "Non authentifié" }); return; }
    const user = await getMeService(req.userId);
    res.json({ success: true, data: user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
};
