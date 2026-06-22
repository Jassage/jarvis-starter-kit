import { Role } from '@prisma/client'
import { Request } from 'express'

export interface AuthPayload {
  userId: string
  email: string
  role: Role
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}
