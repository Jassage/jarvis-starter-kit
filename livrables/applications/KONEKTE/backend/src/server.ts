import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import authRoutes from "./routes/auth.routes";
import discoverRoutes from "./routes/discover.routes";
import swipeRoutes from "./routes/swipe.routes";
import messageRoutes from "./routes/message.routes";
import profileRoutes from "./routes/profile.routes";
import photoRoutes from "./routes/photo.routes";
import moderationRoutes from "./routes/moderation.routes";
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import { initSocket } from "./socket";

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/swipes", swipeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route introuvable" });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`Konekte backend démarré sur http://localhost:${PORT}`);
});

export default app;
