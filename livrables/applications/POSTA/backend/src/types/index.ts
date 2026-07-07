import { Request } from 'express';
import { RoleUtilisateur } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: RoleUtilisateur;
  };
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}
