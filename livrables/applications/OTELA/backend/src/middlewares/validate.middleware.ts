import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Réassigné explicitement : parseAsync applique les transforms Zod (z.coerce.date(),
      // etc.) sur une copie — sans ça req.body garde les chaînes brutes d'origine et un
      // contrôleur qui fait confiance au type validé (ex. une Date) reçoit une string.
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Beaucoup de schémas ne déclarent que `body` (params non validés, lus tels
      // quels par le contrôleur) — ne réassigner que les clés effectivement validées,
      // sinon les clés omises reviendraient `undefined` et casseraient ces routes.
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
