import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Réassigné explicitement (bug trouvé sur OTELA le 2026-07-09 : sans ça,
      // req.body garde les chaînes brutes d'origine et un contrôleur qui fait
      // confiance au type validé reçoit une string au lieu d'une Date, etc.).
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Ne réassigner que les clés effectivement déclarées par le schéma —
      // sinon les clés omises (ex. params non validés) reviendraient `undefined`.
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;
      if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Données invalides', 422, err.errors.map(e => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        })));
      }
      next(err);
    }
  };
}
