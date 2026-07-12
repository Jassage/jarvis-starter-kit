import { Response } from 'express';

interface SSEClient {
  id: string;
  userId: string;
  agenceId: string | null;
  res: Response;
}

const clients = new Map<string, SSEClient>();

export function addSSEClient(id: string, userId: string, agenceId: string | null, res: Response): void {
  clients.set(id, { id, userId, agenceId, res });
}

export function removeSSEClient(id: string): void {
  clients.delete(id);
}

export interface SSEEvent {
  type: 'TRANSACTION_EN_ATTENTE' | 'TRANSACTION_VALIDEE' | 'TRANSACTION_REJETEE' | 'ALERTE_AML' | 'ECHEANCE_RETARD' | 'CAISSE_FERMEE' | 'PLAFOND_CAISSE_DEPASSE';
  agenceId?: string | null;
  userId?: string;
  data: Record<string, unknown>;
}

export function broadcastSSE(event: SSEEvent): void {
  const payload = JSON.stringify({ type: event.type, data: event.data });

  for (const client of clients.values()) {
    // Filtrage par agence : si l'événement est lié à une agence, n'envoyer qu'aux clients de cette agence
    if (event.agenceId && client.agenceId && client.agenceId !== event.agenceId) continue;
    // Filtrage personnel : si l'événement cible un utilisateur spécifique
    if (event.userId && client.userId !== event.userId) continue;

    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      clients.delete(client.id);
    }
  }
}
