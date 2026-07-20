-- CreateTable
CREATE TABLE "config_chaine" (
    "id" TEXT NOT NULL,
    "nomChaine" TEXT NOT NULL DEFAULT 'ANTENN',
    "logoUrl" TEXT,
    "logoPosition" "PositionOverlay" NOT NULL DEFAULT 'HAUT_DROITE',
    "logoOpacite" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "logoActif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_chaine_pkey" PRIMARY KEY ("id")
);
