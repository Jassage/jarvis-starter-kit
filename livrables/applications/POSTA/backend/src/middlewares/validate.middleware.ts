import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: unknown };

      // Réinjecter le résultat parsé pour que Zod agisse réellement : le body est remplacé
      // par sa version validée et strippée de toute clé inconnue (anti mass-assignment), et
      // les coercions (z.coerce) prennent effet. On ne touche query/params que si le schéma
      // les a déclarés, pour ne pas effacer les paramètres des routes qui ne les valident pas.
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) Object.assign(req.query, parsed.query);
      if (parsed.params !== undefined) Object.assign(req.params, parsed.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(res, 'Données invalides', 422, err.errors.map((e) => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        })));
      }
      next(err);
    }
  };
}
