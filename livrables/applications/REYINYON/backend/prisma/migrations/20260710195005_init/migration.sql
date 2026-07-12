-- CreateEnum
CREATE TYPE "StatutReunion" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE');

-- CreateEnum
CREATE TYPE "ModeConnexion" AS ENUM ('VIDEO', 'AUDIO_SEUL', 'DIAL_IN');

-- CreateEnum
CREATE TYPE "ModeConnexionParticipant" AS ENUM ('VIDEO', 'AUDIO_SEUL', 'DIAL_IN_TELEPHONE');

-- CreateEnum
CREATE TYPE "StatutAttente" AS ENUM ('EN_ATTENTE', 'ADMIS', 'REJETE');

-- CreateEnum
CREATE TYPE "StatutEnregistrement" AS ENUM ('NON_DEMARRE', 'EN_COURS', 'DISPONIBLE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reunions" (
    "id" TEXT NOT NULL,
    "hoteId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "dateHeurePrevue" TIMESTAMP(3),
    "statut" "StatutReunion" NOT NULL DEFAULT 'PLANIFIEE',
    "codeReunion" TEXT NOT NULL,
    "codeAcces" TEXT,
    "salleAttenteActive" BOOLEAN NOT NULL DEFAULT false,
    "verrouillee" BOOLEAN NOT NULL DEFAULT false,
    "modeConnexionMinimale" "ModeConnexion" NOT NULL DEFAULT 'VIDEO',
    "livekitRoomName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reunions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "nomAffiche" TEXT NOT NULL,
    "modeConnexion" "ModeConnexionParticipant" NOT NULL DEFAULT 'VIDEO',
    "statutAttente" "StatutAttente" NOT NULL DEFAULT 'ADMIS',
    "dateHeureEntree" TIMESTAMP(3),
    "dateHeureSortie" TIMESTAMP(3),
    "livekitIdentity" TEXT NOT NULL,
    "reconnectTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_chat" (
    "id" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "envoyeA" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enregistrements" (
    "id" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,
    "urlFichier" TEXT,
    "dureeSecondes" INTEGER,
    "tailleFichier" INTEGER,
    "statut" "StatutEnregistrement" NOT NULL DEFAULT 'NON_DEMARRE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enregistrements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reunions_codeReunion_key" ON "reunions"("codeReunion");

-- CreateIndex
CREATE UNIQUE INDEX "reunions_livekitRoomName_key" ON "reunions"("livekitRoomName");

-- CreateIndex
CREATE INDEX "reunions_hoteId_idx" ON "reunions"("hoteId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_livekitIdentity_key" ON "participants"("livekitIdentity");

-- CreateIndex
CREATE UNIQUE INDEX "participants_reconnectTokenHash_key" ON "participants"("reconnectTokenHash");

-- CreateIndex
CREATE INDEX "participants_reunionId_idx" ON "participants"("reunionId");

-- CreateIndex
CREATE INDEX "messages_chat_reunionId_envoyeA_idx" ON "messages_chat"("reunionId", "envoyeA");

-- CreateIndex
CREATE INDEX "enregistrements_reunionId_idx" ON "enregistrements"("reunionId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reunions" ADD CONSTRAINT "reunions_hoteId_fkey" FOREIGN KEY ("hoteId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "reunions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_chat" ADD CONSTRAINT "messages_chat_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "reunions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_chat" ADD CONSTRAINT "messages_chat_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enregistrements" ADD CONSTRAINT "enregistrements_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "reunions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
