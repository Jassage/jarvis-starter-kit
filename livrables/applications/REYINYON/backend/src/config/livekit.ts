import { RoomServiceClient, EgressClient } from 'livekit-server-sdk';
import { env } from './env';

// Room Service API (HTTP) — utilisée côté serveur uniquement pour les
// contrôles hôte (mute/remove/delete) et la génération de tokens. Le frontend,
// lui, se connecte en WebSocket directement à LiveKit via NEXT_PUBLIC_LIVEKIT_WS_URL,
// jamais via ce client.
export const roomServiceClient = new RoomServiceClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

// Les requêtes Egress (démarrer/arrêter un enregistrement) passent par la même
// API HTTP LiveKit que Room Service — le serveur les relaie au worker Egress
// via Redis, jamais un appel direct de ce backend vers le conteneur egress.
export const egressClient = new EgressClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
