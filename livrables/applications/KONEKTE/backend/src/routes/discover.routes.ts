import { Router, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { AuthRequest } from "../types";
import { discoverService, searchProfilesService } from "../services/discover.service";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profiles = await discoverService(req.userId!, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      minAge: Number(req.query.minAge) || 18,
      maxAge: Number(req.query.maxAge) || 60,
      gender: req.query.gender as string | undefined,
    });
    res.json({ success: true, data: profiles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
});

router.get("/search", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const results = await searchProfilesService(req.userId!, (req.query.query as string) ?? "");
    res.json({ success: true, data: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
