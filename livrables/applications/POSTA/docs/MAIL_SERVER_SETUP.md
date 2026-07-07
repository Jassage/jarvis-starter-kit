# POSTA — Configuration du serveur mail (Postfix + Dovecot + OpenDKIM)

Ce document décrit comment brancher un VPS Postfix/Dovecot sur la base PostgreSQL de POSTA. Le
panel (backend + frontend de ce dépôt) ne fait que gérer les données ; c'est cette configuration,
posée manuellement sur le VPS mail, qui fait réellement transiter le courrier.

Postfix et Dovecot ne lisent **jamais** les tables applicatives (`domains`, `mailboxes`, `aliases`)
directement. Ils interrogent trois vues SQL en lecture seule (`mail_domains`, `mail_mailboxes`,
`mail_aliases`), créées par la migration `prisma/migrations/20260707161331_mail_views`, via deux
rôles Postgres à privilèges minimaux (`postfix_ro`, `dovecot_ro`). Ainsi, le panel reste la seule
source de vérité et toute modification (nouvelle boîte mail, alias désactivé, domaine suspendu) est
immédiatement reflétée côté serveur mail, sans synchronisation ni cache à gérer.

## 1. Prérequis

- Un VPS dédié (ne pas mutualiser avec les autres SaaS du portefeuille : le port 25 et la
  réputation IP doivent rester propres à POSTA)
- Une IP avec reverse DNS (PTR) configuré vers le nom d'hôte du serveur mail (ex. `mail.posta.ht`)
- PostgreSQL du panel accessible depuis ce VPS (réseau privé ou tunnel, jamais exposé publiquement)
- Paquets : `postfix`, `postfix-pgsql`, `dovecot-core`, `dovecot-imapd`, `dovecot-lmtpd`,
  `dovecot-pgsql`, `opendkim`, `opendkim-tools`

## 2. Rôles Postgres

Les rôles `postfix_ro` et `dovecot_ro` sont créés par la migration Prisma, mais **sans mot de
passe** (volontairement, pour ne jamais committer de secret de prod). À définir une fois par
environnement, directement sur la base :

```sql
ALTER ROLE postfix_ro WITH PASSWORD 'un-secret-genere-ici';
ALTER ROLE dovecot_ro WITH PASSWORD 'un-autre-secret-genere-ici';
```

Vérifier ensuite que `pg_hba.conf` autorise la connexion depuis l'IP du VPS mail pour ces deux
rôles (`hostssl posta postfix_ro <ip_vps>/32 scram-sha-256`, idem pour `dovecot_ro`).

**Important :** en production, déployer le schéma uniquement avec `prisma migrate deploy` (jamais
`prisma db push`, qui raisonne uniquement sur ce qui est déclaré dans `schema.prisma` et pourrait
ignorer ou remettre en cause les vues/rôles créés par migration SQL manuelle).

## 3. Postfix — domaines et boîtes virtuelles

`/etc/postfix/pgsql-virtual-mailbox-domains.cf` :

```
hosts = <host_postgres>
port = 5432
dbname = posta
user = postfix_ro
password = <mot_de_passe_postfix_ro>
query = SELECT 1 FROM mail_domains WHERE domain='%s'
```

`/etc/postfix/pgsql-virtual-mailbox-maps.cf` :

```
hosts = <host_postgres>
port = 5432
dbname = posta
user = postfix_ro
password = <mot_de_passe_postfix_ro>
query = SELECT domain || '/' || local_part || '/' FROM mail_mailboxes WHERE email='%s'
```

`/etc/postfix/pgsql-virtual-alias-maps.cf` :

```
hosts = <host_postgres>
port = 5432
dbname = posta
user = postfix_ro
password = <mot_de_passe_postfix_ro>
query = SELECT destination FROM mail_aliases WHERE source='%s'
```

Dans `main.cf` :

```
virtual_mailbox_domains = pgsql:/etc/postfix/pgsql-virtual-mailbox-domains.cf
virtual_mailbox_maps = pgsql:/etc/postfix/pgsql-virtual-mailbox-maps.cf
virtual_alias_maps = pgsql:/etc/postfix/pgsql-virtual-alias-maps.cf
virtual_mailbox_base = /var/mail/vhosts
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000
virtual_transport = lmtp:unix:private/dovecot-lmtp

smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_tls_security_level = may
smtp_tls_security_level = may
```

Créer l'utilisateur système et le répertoire de maildirs :

```
groupadd -g 5000 vmail
useradd -g vmail -u 5000 vmail -d /var/mail/vhosts -m
```

## 4. Dovecot — authentification et livraison

`/etc/dovecot/dovecot-sql.conf.ext` :

```
driver = pgsql
connect = host=<host_postgres> port=5432 dbname=posta user=dovecot_ro password=<mot_de_passe_dovecot_ro>
default_pass_scheme = SHA512-CRYPT

password_query = \
  SELECT email as user, password FROM mail_mailboxes WHERE email='%u'

user_query = \
  SELECT '/var/mail/vhosts/' || domain || '/' || local_part as home, \
         5000 as uid, 5000 as gid, \
         concat('*:bytes=', quota_mb::text, 'M') as quota_rule \
  FROM mail_mailboxes WHERE email='%u'
```

`10-auth.conf` : activer `auth-sql`, désactiver `auth-system` (pas de comptes Unix).

`10-mail.conf` :

```
mail_location = maildir:/var/mail/vhosts/%d/%n
```

`10-master.conf` : socket `auth` exposé pour Postfix (`private/auth`, groupe `postfix`), service
`lmtp` activé pour la livraison depuis `virtual_transport`.

Le mot de passe stocké dans `mailboxes.passwordHash` est généré côté panel avec
`sha512-crypt-ts` (format `{SHA512-CRYPT}$6$...`), directement compatible avec
`default_pass_scheme = SHA512-CRYPT` ci-dessus — aucune conversion nécessaire.

## 5. OpenDKIM — signature sortante

Le panel génère une paire de clés DKIM 2048 bits à la création de chaque domaine
(`utils/dkim.ts`) : la clé publique va dans `domains.dkimPublicKey`/`dkimTxtValue` (exposées dans le
panel pour que le client pose le TXT), la clé privée est écrite sur disque dans
`DKIM_KEYS_DIR` (`storage/dkim/posta.<domaine>.private.pem`) et **n'existe jamais en base**.

Sur le VPS mail, chaque clé privée générée doit être copiée (ou le volume `DKIM_KEYS_DIR` monté
directement) dans le répertoire de clés d'OpenDKIM, puis référencée dans `KeyTable`/`SigningTable` :

```
# /etc/opendkim/KeyTable
posta._domainkey.<domaine> <domaine>:posta:/etc/opendkim/keys/<domaine>/posta.private

# /etc/opendkim/SigningTable
*@<domaine> posta._domainkey.<domaine>
```

Le sélecteur est toujours `posta` (constante `DKIM_SELECTOR` dans `utils/dkim.ts`), donc ce
gabarit peut être généré automatiquement à partir de la liste des domaines `VERIFIE` — un script de
synchronisation (à écrire) reste préférable à une copie manuelle à chaque nouveau domaine.

Brancher OpenDKIM sur Postfix via milter (`smtpd_milters` / `non_smtpd_milters` dans `main.cf`,
`Socket` dans `opendkim.conf`).

## 6. Ce qui n'est pas couvert par ce document

- Anti-spam / anti-virus entrant (Rspamd ou Amavis + ClamAV recommandés, non traité ici)
- Webmail (Roundcube ou équivalent, pour les clients qui n'utilisent pas de client IMAP natif)
- Synchronisation automatique des clés DKIM du panel vers OpenDKIM (script à écrire, voir §5)
- Surveillance des files d'attente Postfix / bounces / réputation IP
- Sauvegarde des maildirs (`/var/mail/vhosts`) — à mettre en place séparément du backup PostgreSQL

## 7. Vérifier qu'un domaine transite réellement

Une fois DNS + Postfix + Dovecot + OpenDKIM en place pour un domaine passé `VERIFIE` dans le panel :

```
openssl s_client -connect <ip_vps>:25 -starttls smtp   # bannière SMTP
doveadm auth test contact@<domaine> <mot_de_passe>       # authentification IMAP
swaks --to contact@<domaine> --from test@gmail.com       # envoi de test entrant
```
