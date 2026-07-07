-- Vues en lecture seule consommées par Postfix (virtual_mailbox_domains / virtual_mailbox_maps /
-- virtual_alias_maps) et Dovecot (passdb/userdb) sur le VPS mail. Postfix et Dovecot ne touchent
-- JAMAIS aux tables applicatives directement : uniquement ces vues, via des rôles dédiés à
-- privilèges minimaux. Voir docs/MAIL_SERVER_SETUP.md pour la configuration Postfix/Dovecot complète.

-- Un domaine n'est éligible au mail que si son propriétaire a complété la vérification DNS
-- (statut = VERIFIE). Ça évite d'accepter du courrier pour un domaine jamais prouvé comme
-- appartenant réellement au client (la vérification DKIM exige de poser un TXT qu'on a généré).

CREATE OR REPLACE VIEW mail_domains AS
SELECT "nomDomaine" AS domain
FROM domains
WHERE statut = 'VERIFIE';

CREATE OR REPLACE VIEW mail_mailboxes AS
SELECT
  m.email,
  m."passwordHash" AS password,
  m."localPart" AS local_part,
  d."nomDomaine" AS domain,
  m."quotaMb" AS quota_mb
FROM mailboxes m
JOIN domains d ON d.id = m."domainId"
WHERE m.actif = true AND d.statut = 'VERIFIE';

CREATE OR REPLACE VIEW mail_aliases AS
SELECT a.source, a.destination
FROM aliases a
JOIN domains d ON d.id = a."domainId"
WHERE a.actif = true AND d.statut = 'VERIFIE';

-- Rôles applicatifs dédiés (mots de passe à définir manuellement par environnement,
-- jamais committés en clair) :
--   ALTER ROLE postfix_ro WITH PASSWORD '...';
--   ALTER ROLE dovecot_ro WITH PASSWORD '...';

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postfix_ro') THEN
    CREATE ROLE postfix_ro LOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dovecot_ro') THEN
    CREATE ROLE dovecot_ro LOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO postfix_ro, dovecot_ro', current_database());
END
$$;

GRANT USAGE ON SCHEMA public TO postfix_ro, dovecot_ro;

-- Postfix n'a besoin de vérifier que l'existence d'une adresse, jamais du hash de mot de passe.
GRANT SELECT ON mail_domains TO postfix_ro;
GRANT SELECT ON mail_aliases TO postfix_ro;
GRANT SELECT (email, local_part, domain, quota_mb) ON mail_mailboxes TO postfix_ro;

-- Dovecot a besoin du hash pour l'authentification IMAP/SMTP (passdb).
GRANT SELECT ON mail_mailboxes TO dovecot_ro;
