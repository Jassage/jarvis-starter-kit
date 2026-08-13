# Chapitre 17 — Dockeriser PostgreSQL

**Niveau : Intermédiaire**

---

## Introduction

Même démarche que le chapitre 16, appliquée à PostgreSQL — avec ses propres variables, son propre chemin de données, et une nuance de conception importante sur son compte utilisateur par défaut. Ce chapitre se termine par un comparatif direct des deux moteurs, utile pour justifier un choix de stack en connaissance de cause plutôt que par habitude.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- configurer un conteneur PostgreSQL avec les bonnes variables d'environnement ;
- expliquer la différence de modèle utilisateur entre PostgreSQL et MySQL (chapitre 16) ;
- utiliser `PGDATA` pour éviter un piège connu lié à certains systèmes de fichiers de volumes ;
- te connecter à PostgreSQL avec `psql`, depuis l'hôte et depuis un autre conteneur ;
- choisir entre MySQL et PostgreSQL pour un projet donné, en connaissance de leurs différences réelles.

## 📋 Prérequis

Chapitre 16 — ce chapitre s'appuie sur lui et évite de répéter ce qui est identique (scripts d'initialisation, volumes).

## Pourquoi ce chapitre est important

PostgreSQL est le moteur choisi par la majorité des projets récents du portefeuille dont ce manuel s'inspire, notamment ceux nécessitant des extensions avancées (données géospatiales, par exemple). Savoir le dockeriser avec la même rigueur que MySQL, sans confondre leurs conventions respectives, évite des erreurs de configuration bêtes mais fréquentes chez qui connaît un des deux moteurs et suppose, à tort, que l'autre fonctionne à l'identique.

---

## Concepts fondamentaux

1. **Variables d'environnement PostgreSQL** — proches de MySQL, avec une différence de modèle utilisateur.
2. **`PGDATA`** — un réglage de précaution peu connu mais utile.
3. **Scripts d'initialisation** — même mécanisme et même piège que MySQL (chapitre 16), non redémontré ici.
4. **MySQL vs PostgreSQL** — un comparatif pour choisir en connaissance de cause.

---

## 17.1 Variables d'environnement PostgreSQL

```bash
# [Terminal]
docker run -d --name postgres-projet \
  -e POSTGRES_USER=app_user \
  -e POSTGRES_PASSWORD=motdepasse_app \
  -e POSTGRES_DB=app \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -v postgres-projet-data:/var/lib/postgresql/data \
  postgres:16
```

| Variable | Rôle |
|---|---|
| `POSTGRES_USER` | Nom du compte créé — **devient le superutilisateur** de cette instance (voir 17.2) |
| `POSTGRES_PASSWORD` | Mot de passe de ce compte — **obligatoire**, contrairement à MySQL qui tolère (déconseillé) une absence de mot de passe |
| `POSTGRES_DB` | Nom d'une base créée automatiquement (par défaut, identique à `POSTGRES_USER` si omise) |
| `PGDATA` | Sous-dossier précis, à l'intérieur du volume monté, où PostgreSQL stocke ses données (section 17.3) |

> ⚠️ **Attention — la différence de modèle la plus importante de ce chapitre** — Sur MySQL (chapitre 16), `MYSQL_ROOT_PASSWORD` crée un compte administrateur séparé, et `MYSQL_USER`/`MYSQL_PASSWORD` créent un **second** compte, limité, pour l'application. Sur l'image officielle PostgreSQL, il n'existe **qu'un seul mécanisme** : `POSTGRES_USER` (par défaut `postgres` si omis) devient directement le **superutilisateur** de l'instance — il n'y a pas, par défaut, de distinction équivalente à `root` vs utilisateur applicatif limité. Pour reproduire cette séparation des privilèges sur PostgreSQL, il faut créer explicitement un rôle supplémentaire via un script d'initialisation (section 17.4) — une étape volontaire, pas automatique comme sur MySQL.

---

## 17.2 `PGDATA` : un réglage de précaution

```text
-e PGDATA=/var/lib/postgresql/data/pgdata
```

**Le problème que `PGDATA` évite :** par défaut, PostgreSQL stocke ses fichiers directement à la racine de `/var/lib/postgresql/data`. Certains systèmes de fichiers de volumes (en particulier sur certains hébergeurs cloud ou pilotes de stockage réseau) déposent automatiquement un dossier caché (souvent `lost+found`) à la racine d'un volume monté — PostgreSQL, trouvant un dossier non vide et non reconnu comme les siens, peut refuser de démarrer.

> ✅ **Bonne pratique** — Fixer `PGDATA` sur un **sous-dossier** du point de montage (`/var/lib/postgresql/data/pgdata`, comme dans l'exemple) plutôt que la racine du volume elle-même contourne ce problème par construction : PostgreSQL n'a plus jamais besoin de considérer la racine du volume monté comme "son" dossier de données. Une précaution documentée par l'image officielle elle-même, peu connue des débutants, qui évite un incident potentiel sur certains environnements cloud avant même qu'il ne se produise.

---

## 17.3 Scripts d'initialisation : identiques à MySQL

```yaml
# [compose.yaml, extrait]
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: motdepasse_app
      POSTGRES_DB: app
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d

volumes:
  db-data:
```

> 📌 **À retenir** — L'image officielle PostgreSQL utilise **exactement** la même convention que MySQL (chapitre 16, section 16.2) : tout fichier `.sh` ou `.sql` dans `/docker-entrypoint-initdb.d/` s'exécute, dans l'ordre alphabétique, **une seule fois**, à la toute première initialisation d'un volume vide — avec exactement le même piège si un script est ajouté après coup. Rien de nouveau à apprendre ici, seulement à reconnaître le même principe sous un moteur différent.

## 17.4 Créer un rôle applicatif limité (l'équivalent du `MYSQL_USER` de MySQL)

`init/01-roles.sql` :
```sql
CREATE ROLE lecture_seule WITH LOGIN PASSWORD 'motdepasse_lecture';
GRANT CONNECT ON DATABASE app TO lecture_seule;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lecture_seule;
```

**Explication :** contrairement à MySQL, où `MYSQL_USER` fournit directement un compte limité, PostgreSQL exige d'écrire soi-même ce genre de script si une séparation des privilèges est souhaitée dès l'initialisation — un exemple de rôle en lecture seule, utile pour un compte de reporting ou d'audit (repris implicitement dans certains projets de la Partie X).

---

## 17.5 Se connecter avec `psql`

```bash
# [Terminal] — depuis l'hôte (développement uniquement, rappel chapitre 11/16)
psql -h 127.0.0.1 -p 5432 -U app_user -d app

# [Terminal] — depuis un autre conteneur du même réseau Compose (chapitre 11)
docker compose exec db psql -U app_user -d app
```

```sql
-- une fois connecté
\dt              -- lister les tables
\du              -- lister les rôles
SELECT version(); -- confirmer la version PostgreSQL active
```

---

## 17.6 MySQL vs PostgreSQL : comparatif

| Critère | MySQL | PostgreSQL |
|---|---|---|
| Conformité au standard SQL | Bonne, avec des écarts historiques | Généralement considérée plus stricte et conforme |
| Types de données avancés | JSON basique | JSON/JSONB natif et performant, types tableaux, types personnalisés |
| Extensions | Limitées | Écosystème riche (PostGIS pour la géolocalisation, `pg_trgm` pour la recherche floue, `uuid-ossp`...) |
| Gestion de la concurrence | MVCC (implémentation propre) | MVCC (implémentation propre, souvent citée comme plus robuste sous forte charge concurrente) |
| Support ORM (Prisma, dans ce portefeuille) | Complet | Complet, souvent la cible par défaut de la documentation Prisma |
| Compte administrateur par défaut | `root` séparé, compte applicatif limité disponible nativement (chapitre 16) | Superutilisateur unique par défaut, séparation à construire soi-même (section 17.4) |
| Notoriété historique | Très répandu dans l'hébergement web classique (WordPress et écosystème PHP) | Dominant sur les projets récents nécessitant des fonctionnalités avancées |

> 📌 **À retenir** — Il n'existe **pas** de réponse universelle "l'un est meilleur que l'autre" — le choix dépend du projet. Un besoin de données géospatiales (une plateforme immobilière avec recherche par périmètre, par exemple) orientera naturellement vers PostgreSQL et son extension PostGIS ; un projet migré depuis un écosystème PHP/WordPress historique restera souvent sur MySQL par continuité. Ce manuel dockerise les deux avec la même rigueur, précisément pour ne jamais faire de ce choix une contrainte technique.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Confusion sur qui est "l'administrateur" de la base | Modèle MySQL (root séparé) supposé à tort identique sur PostgreSQL | Se rappeler que `POSTGRES_USER` EST le superutilisateur, sans compte root distinct par défaut |
| PostgreSQL refuse de démarrer sur certains volumes cloud | Absence de `PGDATA` pointant vers un sous-dossier | Toujours définir `PGDATA=/var/lib/postgresql/data/pgdata` par précaution |
| Un script d'init ajouté après coup n'a aucun effet | Même piège qu'au chapitre 16, volume déjà initialisé | Repartir d'un volume vide en développement, utiliser une vraie migration en production |
| "password authentication failed" avec `psql` | Mauvais compte ou mauvais mot de passe, ou tentative avec le nom de base par défaut plutôt que `POSTGRES_DB` | Vérifier précisément les trois variables `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` utilisées à la création |

---

## Laboratoire pratique n°1 — Lancer et vérifier PostgreSQL

**Objectifs :** exécuter la section 17.1 et confirmer la connexion.
**Prérequis :** Chapitre 16.

**Étapes :** lance le conteneur de la section 17.1, connecte-toi avec `docker exec -it postgres-projet psql -U app_user -d app`, exécute `\dt` et `SELECT version();`.

**Résultat attendu :** connexion réussie, version PostgreSQL confirmée.

---

## Laboratoire pratique n°2 — Créer un rôle en lecture seule

**Objectifs :** reproduire la séparation des privilèges de la section 17.4, absente par défaut sur PostgreSQL contrairement à MySQL.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** mets en place `init/01-roles.sql`, relance avec un volume vide, connecte-toi avec `lecture_seule`, et vérifie qu'une tentative d'écriture (`INSERT`) échoue alors qu'une lecture (`SELECT`) réussit.

**Résultat attendu :** confirmation pratique qu'un rôle limité fonctionne comme prévu, contrastant avec le superutilisateur par défaut.

---

## Laboratoire pratique n°3 — Vérifier l'emplacement réel des données avec `PGDATA`

**Objectifs :** confirmer que `PGDATA` place bien les fichiers dans le sous-dossier attendu.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** `docker exec postgres-projet ls -la /var/lib/postgresql/data` (doit montrer un dossier `pgdata`, pas les fichiers de données directement à la racine), puis `docker exec postgres-projet ls -la /var/lib/postgresql/data/pgdata` (doit montrer les vrais fichiers PostgreSQL).

**Résultat attendu :** confirmation visuelle de la structure décrite en section 17.2.

---

## Exercices

1. Explique la différence de modèle utilisateur entre MySQL (`MYSQL_ROOT_PASSWORD`/`MYSQL_USER`) et PostgreSQL (`POSTGRES_USER`).
2. Pourquoi `PGDATA` pointant vers un sous-dossier est-il une précaution utile sur certains environnements cloud ?
3. Que faut-il faire, sur PostgreSQL, pour obtenir un compte aux privilèges limités équivalent au `MYSQL_USER` de MySQL ?
4. Cite deux critères concrets qui orienteraient un choix vers PostgreSQL plutôt que MySQL pour un projet donné.
5. Le piège des scripts d'initialisation exécutés une seule fois (chapitre 16) s'applique-t-il aussi à PostgreSQL ? Justifie.

---

## Quiz

**Question 1.** Sur l'image officielle PostgreSQL, `POSTGRES_USER` :
a) Crée un compte limité, distinct d'un superutilisateur séparé
b) Devient directement le superutilisateur de l'instance
c) N'a aucun effet sans `POSTGRES_ROOT_PASSWORD`
d) Est ignoré si `POSTGRES_DB` est défini

**Question 2.** `PGDATA=/var/lib/postgresql/data/pgdata` sert à :
a) Chiffrer les données
b) Éviter un conflit avec un contenu préexistant à la racine de certains volumes cloud
c) Définir le port d'écoute de PostgreSQL
d) Créer automatiquement une sauvegarde

**Question 3.** Pour obtenir un rôle PostgreSQL aux privilèges limités, il faut :
a) Rien faire, c'est automatique comme sur MySQL
b) Écrire explicitement un script SQL de création de rôle, par exemple via `docker-entrypoint-initdb.d`
c) Utiliser une variable `POSTGRES_LIMITED_USER`
d) C'est impossible sur PostgreSQL

**Question 4.** Le mécanisme `docker-entrypoint-initdb.d` sur PostgreSQL :
a) Fonctionne différemment de MySQL
b) Fonctionne selon le même principe que MySQL : une seule exécution, à l'initialisation d'un volume vide
c) N'existe pas sur PostgreSQL
d) S'exécute à chaque démarrage

**Question 5.** PostgreSQL est souvent préféré à MySQL quand :
a) Le projet n'a besoin d'aucune extension particulière
b) Le projet nécessite des extensions avancées comme PostGIS pour les données géospatiales
c) Le projet est un simple site WordPress
d) Aucune différence ne justifie jamais un choix plutôt que l'autre

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- PostgreSQL se configure avec `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`, mais **sans** la séparation automatique root/utilisateur applicatif de MySQL : `POSTGRES_USER` devient directement le superutilisateur.
- `PGDATA` pointant vers un sous-dossier du volume est une précaution simple contre un problème documenté sur certains volumes cloud.
- Le mécanisme `docker-entrypoint-initdb.d`, avec son piège de la seule exécution à l'initialisation, est identique à MySQL — rien de nouveau à réapprendre.
- Un rôle aux privilèges limités doit être créé explicitement sur PostgreSQL, via un script d'initialisation, contrairement au `MYSQL_USER` automatique de MySQL.
- Le choix entre les deux moteurs dépend du projet — extensions nécessaires (PostGIS), écosystème existant, conformité au standard SQL — jamais d'une supériorité universelle de l'un sur l'autre.

## ✅ Checklist avant de passer au chapitre 18

- [ ] Je sais configurer PostgreSQL avec les bonnes variables.
- [ ] Je sais expliquer la différence de modèle utilisateur avec MySQL.
- [ ] Je sais pourquoi `PGDATA` sur un sous-dossier est une bonne pratique.
- [ ] Je sais créer un rôle aux privilèges limités via un script d'initialisation.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Superutilisateur (PostgreSQL)**
Définition simple : le compte PostgreSQL avec tous les droits, créé par défaut via `POSTGRES_USER`.
Voir : Chapitre 17, section 17.1.

**`PGDATA`**
Définition simple : la variable qui fixe l'emplacement précis des fichiers de données PostgreSQL à l'intérieur du volume monté.
Voir : Chapitre 17, section 17.2.

**Rôle (PostgreSQL)**
Définition simple : l'équivalent PostgreSQL d'un compte utilisateur, pouvant porter des droits précis.
Voir : Chapitre 17, section 17.4.

---

## ❓ FAQ

**PostgreSQL et MySQL peuvent-ils tourner simultanément dans le même projet Compose ?**
Techniquement oui — rien n'empêche de déclarer les deux comme services distincts — mais un projet réel de ce manuel n'utilise jamais les deux pour la même donnée applicative ; ce cas resterait une exception délibérée, pas une pratique courante.

**Quelle version de PostgreSQL utiliser ?**
Comme pour toute image (chapitre 5), une version majeure précise (`postgres:16`), jamais `latest`. Les projets de la Partie X de ce manuel utilisent PostgreSQL 16 par convention.

**Le comparatif de la section 17.6 est-il valable pour toujours ?**
Les deux moteurs évoluent constamment et réduisent certains de leurs écarts historiques au fil des versions — le tableau reflète une comparaison générale, utile pour orienter un choix, pas une vérité figée à ne jamais revérifier pour un projet précis.

---

## Références officielles

- Image officielle PostgreSQL sur Docker Hub — [hub.docker.com/_/postgres](https://hub.docker.com/_/postgres)
- Documentation officielle PostgreSQL — rôles et privilèges — [postgresql.org/docs/current/user-manag.html](https://www.postgresql.org/docs/current/user-manag.html)

---

## Conclusion

MySQL et PostgreSQL sont désormais tous deux dockerisés avec la même rigueur, et leurs différences réelles sont connues plutôt que devinées. Le chapitre 18 ajoute la troisième brique de données la plus courante de ce portefeuille : Redis, pour le cache, les sessions et les files d'attente.

---

⬅️ [Chapitre 16 — Dockeriser MySQL](16-dockeriser-mysql.md) · ➡️ **Suite : Chapitre 18 — Ajouter Redis (cache, session, queue)**
