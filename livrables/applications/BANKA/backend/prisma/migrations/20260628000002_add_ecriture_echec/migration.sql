-- Table de traçage des écritures comptables en échec.
-- Permet la réconciliation sans bloquer les opérations bancaires.
CREATE TABLE "ecritures_echec" (
    "id"            TEXT NOT NULL,
    "debitNumero"   TEXT NOT NULL,
    "creditNumero"  TEXT NOT NULL,
    "montant"       DECIMAL(15,2) NOT NULL,
    "libelle"       TEXT NOT NULL,
    "erreur"        TEXT NOT NULL,
    "transactionId" TEXT,
    "userId"        TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_echec_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ecritures_echec_createdAt_idx" ON "ecritures_echec"("createdAt");
