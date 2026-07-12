-- Moteur anti-double-booking, niveau base de données. Prisma ne sait pas exprimer
-- une contrainte d'exclusion PostgreSQL : cette migration est écrite à la main
-- (même pattern que POSTA::mail_views), à appliquer après la migration `init`.
--
-- Empêche toute insertion concurrente de deux réservations dont les plages de dates
-- se chevauchent sur la même chambre, tant que l'une des deux est CONFIRMEE ou
-- EN_ATTENTE. C'est le seul garde-fou garanti sous forte concurrence : le pré-check
-- applicatif dans reservations.service.ts (findFirst avec relation "none") est une
-- optimisation UX (retour rapide, message clair) mais PEUT laisser passer une course
-- entre deux requêtes simultanées — cette contrainte, elle, est vérifiée par Postgres
-- lui-même au moment du COMMIT et ne peut jamais être contournée.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- tsrange (pas tstzrange) : les colonnes DateTime de Prisma sont mappées en
-- "timestamp(3)" SANS fuseau horaire par défaut sur PostgreSQL. tstzrange() sur une
-- colonne timestamp exigerait une conversion dépendant du fuseau de session, ce qui
-- rend l'expression non-IMMUTABLE et bloque la création de l'index GiST.
ALTER TABLE "reservations"
  ADD CONSTRAINT no_overlap_chambre
  EXCLUDE USING gist (
    "chambreId" WITH =,
    tsrange("dateArrivee", "dateDepart") WITH &&
  )
  WHERE (statut IN ('CONFIRMEE', 'EN_ATTENTE'));
