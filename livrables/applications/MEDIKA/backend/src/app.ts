import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import patientsRoutes from "./routes/patients.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import consultationsRoutes from "./routes/consultations.routes";
import facturesRoutes from "./routes/factures.routes";
import usersRoutes from "./routes/users.routes";
import servicesRoutes from "./routes/services.routes";
import statsRoutes from "./routes/stats.routes";
import examensRoutes from "./routes/examens.routes";
import fileAttenteRoutes from "./routes/file-attente.routes";
import settingsRoutes from "./routes/settings.routes";
import auditRoutes from "./routes/audit.routes";
import hospitalisationsRoutes from "./routes/hospitalisations.routes";
import pharmacieRoutes from "./routes/pharmacie.routes";
import planningRoutes from "./routes/planning.routes";
import eventsRoutes from "./routes/events.routes";
import tarifsRoutes from "./routes/tarifs.routes";

const app = express();

const origins = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
];
app.use(cors({ origin: origins, credentials: true }));
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", app: "MEDIKA" }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/factures", facturesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/examens", examensRoutes);
app.use("/api/file-attente", fileAttenteRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/hospitalisations", hospitalisationsRoutes);
app.use("/api/pharmacie", pharmacieRoutes);
app.use("/api/planning", planningRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/tarifs", tarifsRoutes);

app.use(errorHandler);

export default app;
