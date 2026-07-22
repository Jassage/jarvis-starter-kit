-- Référence courte de réservation, communiquée au client pour la consultation en
-- ligne. Nullable (plusieurs NULL autorisés sous une contrainte unique Postgres) —
-- toujours renseignée par le code à la création.
ALTER TABLE "reservations" ADD COLUMN "reference" TEXT;
CREATE UNIQUE INDEX "reservations_reference_key" ON "reservations"("reference");
