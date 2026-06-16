import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  plan: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DiscoverQuery extends PaginationQuery {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  gender?: string;
}
