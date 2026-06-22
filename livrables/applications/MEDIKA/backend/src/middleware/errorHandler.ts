import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    })
    return
  }

  console.error(err)
  res.status(500).json({ success: false, message: 'Erreur serveur interne' })
}
