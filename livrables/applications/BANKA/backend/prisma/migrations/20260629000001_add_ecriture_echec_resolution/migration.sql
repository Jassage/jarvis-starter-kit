-- Ajout des champs de résolution pour la réconciliation manuelle des écritures en échec.
ALTER TABLE "ecritures_echec"
  ADD COLUMN "resolu"      BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN "resoluAt"    TIMESTAMP(3),
  ADD COLUMN "resoluParId" TEXT;

CREATE INDEX "ecritures_echec_resolu_idx" ON "ecritures_echec"("resolu");
