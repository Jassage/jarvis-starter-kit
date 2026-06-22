-- CreateTable
CREATE TABLE "hopital_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nom" TEXT NOT NULL DEFAULT 'CLINIQUE MEDIKA',
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hopital_config_pkey" PRIMARY KEY ("id")
);
