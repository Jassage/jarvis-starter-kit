-- CreateEnum
CREATE TYPE "SourceAudience" AS ENUM ('WEB', 'MOBILE');

-- CreateEnum
CREATE TYPE "ActionAudit" AS ENUM ('CONNEXION', 'CRENEAU_CREE', 'CRENEAU_MODIFIE', 'CRENEAU_SUPPRIME', 'CRENEAU_SYNCHRONISE', 'SPONSOR_CREE', 'SPONSOR_MODIFIE', 'SPONSOR_SUPPRIME', 'HABILLAGE_CREE', 'HABILLAGE_SUPPRIME', 'CONFIG_CHAINE_MODIFIEE', 'CONTENU_SUPPRIME', 'REPLAY_PUBLIE', 'REPLAY_RETIRE', 'REPLAY_SUPPRIME', 'UTILISATEUR_CREE', 'UTILISATEUR_MODIFIE', 'UTILISATEUR_MOT_DE_PASSE_REINITIALISE', 'MATCH_DEMARRE', 'MATCH_TERMINE');

-- Les DiffusionLog sont désormais générés (jamais saisis) et idempotents par créneau :
-- l'index simple laisse place à une contrainte d'unicité. Les éventuels doublons
-- hérités d'un seed antérieur sont supprimés d'abord, le plus récent étant conservé.
DELETE FROM "diffusion_logs" a
USING "diffusion_logs" b
WHERE a."creneauId" IS NOT NULL
  AND a."creneauId" = b."creneauId"
  AND (a."createdAt" < b."createdAt" OR (a."createdAt" = b."createdAt" AND a."id" < b."id"));

-- DropIndex
DROP INDEX IF EXISTS "diffusion_logs_creneauId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "diffusion_logs_creneauId_key" ON "diffusion_logs"("creneauId");

-- CreateTable
CREATE TABLE "audience_sessions" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "source" "SourceAudience" NOT NULL DEFAULT 'WEB',
    "creneauId" TEXT,
    "replayId" TEXT,
    "debutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dernierPingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dureeSecondes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "audience_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "ActionAudit" NOT NULL,
    "utilisateurId" TEXT,
    "utilisateurEmail" TEXT NOT NULL,
    "utilisateurNom" TEXT NOT NULL,
    "cible" TEXT,
    "cibleId" TEXT,
    "details" TEXT,
    "adresseIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audience_sessions_creneauId_idx" ON "audience_sessions"("creneauId");

-- CreateIndex
CREATE INDEX "audience_sessions_replayId_idx" ON "audience_sessions"("replayId");

-- CreateIndex
CREATE INDEX "audience_sessions_dernierPingAt_idx" ON "audience_sessions"("dernierPingAt");

-- CreateIndex
CREATE UNIQUE INDEX "audience_sessions_sessionKey_creneauId_key" ON "audience_sessions"("sessionKey", "creneauId");

-- CreateIndex
CREATE UNIQUE INDEX "audience_sessions_sessionKey_replayId_key" ON "audience_sessions"("sessionKey", "replayId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- AddForeignKey
ALTER TABLE "audience_sessions" ADD CONSTRAINT "audience_sessions_creneauId_fkey" FOREIGN KEY ("creneauId") REFERENCES "creneaux_grille"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_sessions" ADD CONSTRAINT "audience_sessions_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "replays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
