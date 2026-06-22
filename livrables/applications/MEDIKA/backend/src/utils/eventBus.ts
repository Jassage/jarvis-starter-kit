import { Response } from 'express'

const clients = new Set<Response>()

export function addClient(res: Response) {
  clients.add(res)
}

export function removeClient(res: Response) {
  clients.delete(res)
}

export function broadcast(resource: string) {
  const payload = `data: ${JSON.stringify({ resource, ts: Date.now() })}\n\n`
  clients.forEach(res => {
    try { res.write(payload) } catch { clients.delete(res) }
  })
}
