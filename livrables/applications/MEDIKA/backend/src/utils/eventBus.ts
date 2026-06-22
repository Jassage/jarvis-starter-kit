import { Response } from 'express'

// Global clients (receive all broadcasts)
const globalClients = new Set<Response>()

// Per-user clients (receive targeted broadcasts)
const userClients = new Map<string, Set<Response>>()

export function addClient(res: Response, userId?: string) {
  globalClients.add(res)
  if (userId) {
    if (!userClients.has(userId)) userClients.set(userId, new Set())
    userClients.get(userId)!.add(res)
  }
}

export function removeClient(res: Response, userId?: string) {
  globalClients.delete(res)
  if (userId && userClients.has(userId)) {
    userClients.get(userId)!.delete(res)
    if (userClients.get(userId)!.size === 0) userClients.delete(userId)
  }
}

export function broadcast(resource: string) {
  const payload = `data: ${JSON.stringify({ resource, ts: Date.now() })}\n\n`
  globalClients.forEach(res => {
    try { res.write(payload) } catch { globalClients.delete(res) }
  })
}

export function broadcastTo(userId: string, resource: string, extra?: Record<string, unknown>) {
  const payload = `data: ${JSON.stringify({ resource, ts: Date.now(), ...extra })}\n\n`
  const clients = userClients.get(userId)
  if (!clients) return
  clients.forEach(res => {
    try { res.write(payload) } catch { clients.delete(res) }
  })
}
