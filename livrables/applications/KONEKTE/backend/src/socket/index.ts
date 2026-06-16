import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "../types";
import { sendMessageService } from "../services/message.service";

export const onlineUsers = new Map<string, string>();
let _io: SocketServer | null = null;

export const getIO = () => _io;

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
      credentials: true,
    },
  });

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
    onlineUsers.set(userId, socket.id);

    await prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });

    socket.broadcast.emit("user:online", { userId });

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

          const receiverSocketId = onlineUsers.get(message.receiverId);
          const isReceiverInRoom = receiverSocketId
            ? (await io.in(`conv:${data.conversationId}`).fetchSockets()).some(
                (s) => s.id === receiverSocketId
              )
            : false;

          let finalMessage = message;
          if (isReceiverInRoom) {
            await prisma.message.update({ where: { id: message.id }, data: { status: "READ" } });
            finalMessage = { ...message, status: "READ" };
          } else if (receiverSocketId) {
            await prisma.message.update({ where: { id: message.id }, data: { status: "DELIVERED" } });
            finalMessage = { ...message, status: "DELIVERED" };
          }

          io.to(`conv:${data.conversationId}`).emit("message:new", finalMessage);

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification:new", {
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
      onlineUsers.delete(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: new Date() },
      });
      socket.broadcast.emit("user:offline", { userId });
    });
  });

  return io;
};
