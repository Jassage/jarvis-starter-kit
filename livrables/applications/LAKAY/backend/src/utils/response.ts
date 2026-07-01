import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Succès',
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  } satisfies ApiResponse<T>);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown[]
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  } satisfies ApiResponse);
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function paginate(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(query.page || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20')));
  return { page, limit, skip: (page - 1) * limit };
}
