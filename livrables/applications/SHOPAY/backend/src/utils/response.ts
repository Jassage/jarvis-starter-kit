import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export function sendSuccess<T>(res: Response, data: T, message = 'Succès', statusCode = 200): void {
  res.status(statusCode).json({ success: true, message, data } satisfies ApiResponse<T>);
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: unknown[]): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  } satisfies ApiResponse);
}
