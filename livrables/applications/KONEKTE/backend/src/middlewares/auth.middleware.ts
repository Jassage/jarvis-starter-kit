import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types";
import { prisma } from "../lib/prisma";

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Token manquant" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET non configuré");

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    req.userPlan = payload.plan;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token invalide ou expiré" });
  }
};

// A chaîner après requireAuth. Vérifie le statut admin en base à chaque appel
// (plutôt que dans le JWT) pour qu'une révocation de droits soit immédiate.
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      res.status(403).json({ success: false, error: "Accès réservé aux administrateurs" });
      return;
    }
    next();
  } catch {
    res.status(500).json({ success: false, error: "Erreur serveur" });
  }
};
