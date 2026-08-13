import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
    pharmacieId: string;
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
