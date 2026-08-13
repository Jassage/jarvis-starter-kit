-- CreateEnum
CREATE TYPE "CategorieArticle" AS ENUM ('COMMUNIQUE', 'INTERVIEW', 'REPORTAGE', 'CULTURE', 'SPORT', 'SANTE', 'AGRICULTURE', 'EDUCATION', 'POLITIQUE', 'DEVELOPPEMENT', 'INFRASTRUCTURE', 'AUTRE');

-- CreateEnum
CREATE TYPE "CategorieEvenement" AS ENUM ('FESTIVAL', 'CARNAVAL', 'REUNION', 'MATCH', 'FORMATION', 'CONFERENCE', 'CULTUREL', 'SPORT', 'ECONOMIE', 'FETE', 'AUTRE');

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "auteur" TEXT,
    "categorie" "CategorieArticle" NOT NULL,
    "tags" TEXT[],
    "datePublication" TIMESTAMP(3) NOT NULL,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "imagePrincipaleId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles_traductions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "resume" TEXT NOT NULL,
    "contenu" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieEvenement" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureAffichage" TEXT,
    "lieu" TEXT NOT NULL,
    "organisateur" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "imagePrincipaleId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements_traductions" (
    "id" TEXT NOT NULL,
    "evenementId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evenements_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "articles_imagePrincipaleId_idx" ON "articles"("imagePrincipaleId");

-- CreateIndex
CREATE UNIQUE INDEX "articles_traductions_articleId_locale_key" ON "articles_traductions"("articleId", "locale");

-- CreateIndex
CREATE INDEX "evenements_imagePrincipaleId_idx" ON "evenements"("imagePrincipaleId");

-- CreateIndex
CREATE UNIQUE INDEX "evenements_traductions_evenementId_locale_key" ON "evenements_traductions"("evenementId", "locale");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_imagePrincipaleId_fkey" FOREIGN KEY ("imagePrincipaleId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_traductions" ADD CONSTRAINT "articles_traductions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_imagePrincipaleId_fkey" FOREIGN KEY ("imagePrincipaleId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements_traductions" ADD CONSTRAINT "evenements_traductions_evenementId_fkey" FOREIGN KEY ("evenementId") REFERENCES "evenements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
