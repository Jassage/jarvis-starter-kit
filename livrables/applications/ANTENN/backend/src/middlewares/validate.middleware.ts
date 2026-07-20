import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Zod strippe par défaut les clés non déclarées : on réinjecte le résultat
      // parsé pour que les services reçoivent un objet nettoyé (anti mass-assignment)
      // et avec les coercions/valeurs par défaut effectivement appliquées.
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: unknown };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as Request['query'];
      if (parsed.params !== undefined) req.params = parsed.params as Request['params'];
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
