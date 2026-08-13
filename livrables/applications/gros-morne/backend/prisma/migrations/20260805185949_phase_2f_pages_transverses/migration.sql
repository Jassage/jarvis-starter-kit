-- CreateEnum
CREATE TYPE "CategoriePartenaire" AS ENUM ('INSTITUTIONNEL', 'ENTREPRISE', 'SPONSOR', 'ONG', 'MECENE', 'MEDIA');

-- CreateEnum
CREATE TYPE "NiveauPartenaire" AS ENUM ('PLATINE', 'OR', 'ARGENT', 'BRONZE');

-- CreateEnum
CREATE TYPE "EmplacementAffichage" AS ENUM ('ACCUEIL', 'A_PROPOS');

-- CreateEnum
CREATE TYPE "CategorieFaq" AS ENUM ('TOURISME', 'SERVICES', 'INVESTISSEMENT', 'DEMARCHES', 'FONCTIONNEMENT_SITE');

-- CreateEnum
CREATE TYPE "StatutMessage" AS ENUM ('NOUVEAU', 'LU', 'TRAITE', 'ARCHIVE');

-- CreateTable
CREATE TABLE "temoignages" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT,
    "photoId" TEXT,
    "note" INTEGER,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temoignages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temoignages_traductions" (
    "id" TEXT NOT NULL,
    "temoignageId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "contenu" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temoignages_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partenaires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategoriePartenaire" NOT NULL,
    "niveau" "NiveauPartenaire",
    "lienSiteWeb" TEXT,
    "logoId" TEXT,
    "emplacements" "EmplacementAffichage"[],
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partenaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_contact" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "sujet" TEXT,
    "message" TEXT NOT NULL,
    "statut" "StatutMessage" NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnes_newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abonnes_newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "categorie" "CategorieFaq" NOT NULL,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs_traductions" (
    "id" TEXT NOT NULL,
    "faqId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "question" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "horaires" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "whatsappUrl" TEXT,
    "siteWebUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "adminNom" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "chemin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "temoignages_photoId_idx" ON "temoignages"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "temoignages_traductions_temoignageId_locale_key" ON "temoignages_traductions"("temoignageId", "locale");

-- CreateIndex
CREATE INDEX "partenaires_logoId_idx" ON "partenaires"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "abonnes_newsletter_email_key" ON "abonnes_newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_traductions_faqId_locale_key" ON "faqs_traductions"("faqId", "locale");

-- CreateIndex
CREATE INDEX "activity_logs_adminUserId_idx" ON "activity_logs"("adminUserId");

-- CreateIndex
CREATE INDEX "activity_logs_entite_idx" ON "activity_logs"("entite");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "temoignages" ADD CONSTRAINT "temoignages_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temoignages_traductions" ADD CONSTRAINT "temoignages_traductions_temoignageId_fkey" FOREIGN KEY ("temoignageId") REFERENCES "temoignages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs_traductions" ADD CONSTRAINT "faqs_traductions_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "faqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
