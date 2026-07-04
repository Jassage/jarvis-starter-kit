import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "../types";
import { sendMessageService } from "../services/message.service";

const userRoom = (userId: string) => `user:${userId}`;

let _io: SocketServer | null = null;

export const getIO = () => _io;

// Sans adapter Redis, l'état en ligne (qui reçoit quoi) ne vit que dans la
// mémoire du process Node : ça casse dès qu'on tourne sur plusieurs instances
// (scaling horizontal Railway), un utilisateur connecté sur l'instance A
// devient invisible pour l'instance B. Avec REDIS_URL configuré, l'adapter
// rend broadcast/rooms/fetchSockets cohérents sur tout le cluster.
const setupRedisAdapter = async (io: SocketServer) => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[socket] REDIS_URL absent : adapter en mémoire locale (ok en mono-instance uniquement)");
    return;
  }

  const pubClient = new Redis(redisUrl);
  const subClient = pubClient.duplicate();
  pubClient.on("error", (err) => console.error("[socket] Redis pub error", err));
  subClient.on("error", (err) => console.error("[socket] Redis sub error", err));

  io.adapter(createAdapter(pubClient, subClient));
  console.log("[socket] adapter Redis actif");
};

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
      credentials: true,
    },
  });

  setupRedisAdapter(io).catch((err) => console.error("[socket] échec setup Redis adapter", err));

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error("Token manquant"));

    try {
      const secret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, secret) as JwtPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  _io = io;

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    await socket.join(userRoom(userId));

    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });

    // Ne signale "en ligne" que pour la première connexion de cet utilisateur
    // (évite un spam d'events si plusieurs onglets/appareils sont ouverts).
    const connections = await io.in(userRoom(userId)).fetchSockets();
    if (connections.length === 1) socket.broadcast.emit("user:online", { userId });

    socket.on("conversation:join", async (conversationId: string) => {
      socket.join(`conv:${conversationId}`);

      const updated = await prisma.message.updateMany({
        where: { conversationId, receiverId: userId, status: { not: "READ" } },
        data: { status: "READ" },
      });

      if (updated.count > 0) {
        socket.to(`conv:${conversationId}`).emit("message:read", { conversationId, readBy: userId });
      }
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on(
      "message:send",
      async (data: { conversationId: string; content: string; messageId?: string }) => {
        try {
          let message;
          if (data.messageId) {
            message = await prisma.message.findUnique({ where: { id: data.messageId } });
            if (!message) throw new Error("Message introuvable");
          } else {
            message = await sendMessageService(data.conversationId, userId, data.content);
          }

          const [convSockets, receiverSockets] = await Promise.all([
            io.in(`conv:${data.conversationId}`).fetchSockets(),
            io.in(userRoom(message.receiverId)).fetchSockets(),
          ]);
          const isReceiverOnline = receiverSockets.length > 0;
          const isReceiverInRoom = convSockets.some((s) => s.data.userId === message.receiverId);

          let finalMessage = message;
          if (isReceiverInRoom) {
            await prisma.message.update({ where: { id: message.id }, data: { status: "READ" } });
            finalMessage = { ...message, status: "READ" };
          } else if (isReceiverOnline) {
            await prisma.message.update({ where: { id: message.id }, data: { status: "DELIVERED" } });
            finalMessage = { ...message, status: "DELIVERED" };
          }

          io.to(`conv:${data.conversationId}`).emit("message:new", finalMessage);

          if (isReceiverOnline) {
            io.to(userRoom(message.receiverId)).emit("notification:new", {
              type: "NEW_MESSAGE",
              conversationId: data.conversationId,
              senderName: (await prisma.profile.findUnique({ where: { userId }, select: { firstName: true } }))?.firstName ?? "Quelqu'un",
            });
          }
        } catch (err) {
          socket.emit("error", { message: "Erreur lors de l'envoi du message" });
        }
      }
    );

    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conv:${conversationId}`).emit("typing:stop", { userId });
    });

    socket.on("disconnect", async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });
      // Socket.IO retire le socket de ses rooms avant d'émettre "disconnect" ;
      // s'il ne reste aucune autre connexion (autre onglet/appareil), l'utilisateur
      // est réellement hors ligne.
      const stillConnected = (await io.in(userRoom(userId)).fetchSockets()).length > 0;
      if (!stillConnected) socket.broadcast.emit("user:offline", { userId });
    });
  });

  return io;
};
