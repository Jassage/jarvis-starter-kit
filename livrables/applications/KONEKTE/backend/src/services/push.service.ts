import axios from "axios";
import { prisma } from "../lib/prisma";
import { getIO, userRoom } from "../socket";

export const isUserOnline = async (userId: string): Promise<boolean> => {
  const io = getIO();
  if (!io) return false;
  const sockets = await io.in(userRoom(userId)).fetchSockets();
  return sockets.length > 0;
};

// Best-effort : un push manqué (token absent, expo down, device désinscrit)
// ne doit jamais faire échouer l'action métier (swipe, envoi de message).
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { pushToken: true } });
    if (!user?.pushToken) return;

    await axios.post(
      "https://exp.host/--/api/v2/push/send",
      { to: user.pushToken, title, body, data, sound: "default" },
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 8000 }
    );
  } catch {
    // silencieux — voir commentaire ci-dessus
  }
};
