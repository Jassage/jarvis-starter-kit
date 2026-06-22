import { Response } from 'express'
import { ApiResponse } from '../types'

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data }
  res.status(status).json(body)
}

export function sendError(res: Response, message: string, status = 400): void {
  const body: ApiResponse = { success: false, message }
  res.status(status).json(body)
}

export function generateNumero(prefix: string, count: number): string {
  const year = new Date().getFullYear()
  const padded = String(count + 1).padStart(5, '0')
  return `${prefix}-${year}-${padded}`
}
