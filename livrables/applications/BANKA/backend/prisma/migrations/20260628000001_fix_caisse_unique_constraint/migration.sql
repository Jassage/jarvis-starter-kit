-- Supprime la contrainte unique (agenceId, date, devise) qui empêche d'ouvrir
-- deux sessions sur la même journée (même si la première est fermée).
-- L'unicité de la session ouverte est désormais garantie uniquement par la
-- vérification applicative : findFirst WHERE statut = 'OUVERTE'.
DROP INDEX IF EXISTS "sessions_caisse_agenceId_date_devise_key";
