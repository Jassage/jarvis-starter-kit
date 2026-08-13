-- CreateTable
CREATE TABLE "sections_communales" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "principale" BOOLEAN NOT NULL DEFAULT false,
    "couleur" TEXT NOT NULL,
    "population" INTEGER,
    "photoUrl" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_communales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections_communales_traductions" (
    "id" TEXT NOT NULL,
    "sectionCommunaleId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "activitesPrincipales" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_communales_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnalites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "periode" TEXT,
    "photoUrl" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnalites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnalites_traductions" (
    "id" TEXT NOT NULL,
    "personnaliteId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "domaine" TEXT NOT NULL,
    "biographie" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnalites_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sections_communales_traductions_sectionCommunaleId_locale_key" ON "sections_communales_traductions"("sectionCommunaleId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "personnalites_traductions_personnaliteId_locale_key" ON "personnalites_traductions"("personnaliteId", "locale");

-- AddForeignKey
ALTER TABLE "sections_communales_traductions" ADD CONSTRAINT "sections_communales_traductions_sectionCommunaleId_fkey" FOREIGN KEY ("sectionCommunaleId") REFERENCES "sections_communales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnalites_traductions" ADD CONSTRAINT "personnalites_traductions_personnaliteId_fkey" FOREIGN KEY ("personnaliteId") REFERENCES "personnalites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
