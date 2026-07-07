import { Request } from 'express';
import { PlatformRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: PlatformRole;
    boutiqueId?: string | null;
  };
  boutiqueId?: string; // résolu par tenant.middleware, portée tenant effective de la requête
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}
