-- Verrou du singleton ConfigChaine.
--
-- Avant ce correctif, config.service.ts::getConfig() faisait findFirst() puis
-- create() sans aucune contrainte d'unicité : deux appels concurrents sur une base
-- neuve (l'EPG public et le détail d'un replay, par exemple) ne voyaient rien
-- chacun de leur côté et créaient chacun leur ligne. findFirst() renvoyait ensuite
-- l'une ou l'autre, faisant apparaître ou disparaître le logo et le nom de chaîne
-- de façon non déterministe. Constaté en conditions réelles (2 lignes en base).

-- 1. Déduplication : on conserve la ligne la plus récemment modifiée (celle qui a
--    le plus de chances de porter la configuration réellement saisie par la régie).
DELETE FROM "config_chaine"
WHERE "id" <> (SELECT "id" FROM "config_chaine" ORDER BY "updatedAt" DESC LIMIT 1);

-- 2. Colonne de verrou, toujours à true, avec contrainte d'unicité : la base refuse
--    désormais physiquement une seconde ligne.
ALTER TABLE "config_chaine" ADD COLUMN "singleton" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "config_chaine_singleton_key" ON "config_chaine"("singleton");
