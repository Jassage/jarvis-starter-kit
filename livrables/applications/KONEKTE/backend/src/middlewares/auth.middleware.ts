import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types";

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
