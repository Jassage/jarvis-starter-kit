import { Request } from 'express';
import { AdminRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: AdminRole;
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
