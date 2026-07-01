import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';
import { verifyAccessToken } from '../utils/jwt';
import prisma from './database';

let io: SocketServer;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    },
  });

  // Auth middleware socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token as string;
      if (!token) return next(new Error('Token manquant'));
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, firstName: true, lastName: true, isActive: true },
      });
      if (!user || !user.isActive) return next(new Error('Utilisateur inactif'));
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 Socket connecté: ${user.firstName} ${user.lastName} (${user.id})`);

    // Rejoindre sa salle personnelle
    socket.join(`user:${user.id}`);

    // Rejoindre une conversation
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    // Quitter une conversation
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Indicateur de frappe
    socket.on('typing', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté: ${user.id}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO non initialisé');
  return io;
}
