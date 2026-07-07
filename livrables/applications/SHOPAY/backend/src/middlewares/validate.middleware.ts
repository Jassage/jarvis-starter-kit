import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return sendError(
          res,
          'Données invalides',
          422,
          err.errors.map((e) => ({ field: e.path.slice(1).join('.'), message: e.message }))
        );
      }
      next(err);
    }
  };
}
