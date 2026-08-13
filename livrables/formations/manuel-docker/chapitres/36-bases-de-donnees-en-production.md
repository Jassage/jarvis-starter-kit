# Chapitre 36 — Bases de données en production avec Docker

**Niveau : Avancé**

---

## Introduction

Ce chapitre rassemble et complète tout ce que les chapitres 16, 17 et 33 ont construit séparément pour MySQL, PostgreSQL et leur sauvegarde — et ajoute ce qui manquait encore pour une vraie production : comment faire évoluer un schéma sans jamais utiliser le piège de `docker-entrypoint-initdb.d` (chapitre 16), comment gérer un trop grand nombre de connexions, et une affirmation à retenir mot pour mot : **un volume Docker n'est pas, à lui seul, une stratégie de sauvegarde.**

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- appliquer une migration de schéma en production avec un outil dédié, jamais avec les scripts d'initialisation du chapitre 16 ;
- expliquer les limites d'un conteneur de base de données unique en matière de disponibilité ;
- appliquer une isolation réseau et une politique de connexions chiffrées cohérentes avec le chapitre 26 ;
- mettre en place un pooler de connexions pour éviter la saturation d'une base sous forte charge ;
- dimensionner correctement les limites de ressources d'un conteneur de base de données.

## 📋 Prérequis

Chapitres 16, 17 et 33.

## Pourquoi ce chapitre est important

Une base de données est, dans presque tous les projets de ce manuel, la seule pièce **non remplaçable** sans perte — un backend ou un frontend cassé se corrige et se redéploie (chapitre 32), mais des données perdues ou corrompues ne se régénèrent jamais. Ce chapitre applique le niveau de rigueur que ce constat exige.

---

## Concepts fondamentaux

1. **Migrations** — faire évoluer un schéma, jamais via `docker-entrypoint-initdb.d`.
2. **Disponibilité** — les limites d'un conteneur unique.
3. **Sécurité en production** — isolation, chiffrement, rotation des identifiants.
4. **Connection pooling** — éviter la saturation des connexions.
5. **Dimensionnement** — les ressources d'une base de données, spécifiquement.

---

## 36.1 Migrations : la vraie réponse au piège du chapitre 16

Rappel du chapitre 16 (section 16.2) : `docker-entrypoint-initdb.d` ne s'exécute **qu'une seule fois**, à l'initialisation d'un volume vide — inutilisable pour faire évoluer un schéma déjà en production. La réponse standard est un outil de **migration**, comme Prisma Migrate (déjà utilisé dans l'écosystème de ce portefeuille).

```bash
# [Terminal, en LOCAL, développement uniquement]
npx prisma migrate dev --name ajout_colonne_email
```

```bash
# [Terminal, sur le serveur de PRODUCTION, jamais l'inverse]
docker compose exec backend npx prisma migrate deploy
```

> ⚠️ **Attention — la distinction la plus importante de cette section** — `migrate dev` est **interactif** : il peut générer une nouvelle migration, poser des questions, et n'est **jamais** destiné à un environnement de production. `migrate deploy` fait l'inverse : il **applique** uniquement les fichiers de migration déjà écrits et committés, dans l'ordre, de façon **idempotente** — relancer `migrate deploy` sur une base déjà à jour ne fait rien (les migrations déjà appliquées sont ignorées), un comportement sûr à intégrer dans un pipeline automatisé (chapitre 31).

```yaml
# [.github/workflows/deploy.yml, extrait — ajout d'une étape de migration au pipeline du chapitre 31]
      - name: Appliquer les migrations
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/mon-projet
            docker compose -f compose.yaml -f compose.prod.yaml exec -T backend npx prisma migrate deploy
```

> ✅ **Bonne pratique** — Exécuter les migrations comme une **étape séparée et explicite** du déploiement, **avant** le redémarrage de l'application (rappel du cycle Backup → ... → Deploy du chapitre 32) — jamais implicitement au démarrage de chaque instance du backend, ce qui provoquerait une course dangereuse si plusieurs instances tentaient d'appliquer la même migration simultanément.

---

## 36.2 Disponibilité : les limites d'un conteneur unique

> ⚠️ **Attention — une limite honnête de ce manuel** — Un unique conteneur de base de données, même parfaitement sauvegardé (chapitre 33) et surveillé (chapitre 34), reste un **point de défaillance unique** (single point of failure) : sa panne — matérielle, ou même un simple redémarrage planifié — interrompt l'application entière le temps de sa récupération. Une vraie haute disponibilité (réplication primaire/secondaire, bascule automatique) est une architecture significativement plus complexe, généralement construite avec des outils d'orchestration multi-machines (rappel du chapitre 2 : Kubernetes ou équivalent), **délibérément hors du périmètre "un seul serveur" de ce manuel**.

> 📌 **À retenir** — Pour l'écrasante majorité des projets de ce portefeuille (chapitre 2, section 2.6), un unique conteneur de base de données bien sauvegardé, bien surveillé, avec un temps de redémarrage rapide (chapitre 21, healthchecks) offre une disponibilité largement suffisante. La réplication devient pertinente à partir d'un besoin réel et mesuré de continuité de service même pendant une panne matérielle — un signal d'échelle similaire à celui qui justifierait Kubernetes (chapitre 2).

---

## 36.3 Sécurité en production : synthèse et chiffrement en transit

> Rappel synthétique des chapitres 11 et 26 : jamais de port de base de données publié directement (chapitre 11, section 11.6), utilisateur applicatif aux privilèges limités plutôt que le compte administrateur (chapitres 16-17), secrets jamais en dur (chapitre 9).

```javascript
// [backend, connexion PostgreSQL avec chiffrement en transit]
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // certificat auto-signé interne — voir nuance ci-dessous
});
```

> ⚠️ **Attention — défense en profondeur, rappel de la philosophie du chapitre 26** — Même sur le réseau Docker **interne** (chapitre 11), où le trafic ne quitte jamais la machine hôte, chiffrer la connexion entre le backend et la base de données reste une précaution de **défense en profondeur** : elle protège contre un scénario où un attaquant aurait déjà obtenu un accès partiel au réseau interne (par exemple via une faille applicative permettant d'observer le trafic d'un conteneur voisin) — un chiffrement en transit réduit ce qu'un tel accès partiel permettrait d'observer.

---

## 36.4 Connection pooling : éviter la saturation

> ⚠️ **Attention — un problème réel à l'échelle** — Chaque connexion active à PostgreSQL ou MySQL a un coût en mémoire côté serveur, et chaque moteur impose une limite maximale de connexions simultanées (`max_connections`, souvent 100 par défaut sur PostgreSQL). Une application avec plusieurs instances backend (chapitre 35, mise à l'échelle) ou un usage de connexions mal géré peut **dépasser cette limite**, provoquant des refus de connexion pour de nouvelles requêtes — même si le CPU et la RAM de la base restent, par ailleurs, largement disponibles.

```yaml
# [compose.prod.yaml, extrait — PgBouncer devant PostgreSQL]
services:
  pgbouncer:
    image: edoburu/pgbouncer:1.21.0
    environment:
      DATABASE_URL: postgres://app_user:${DB_PASSWORD}@db:5432/app
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 200
      DEFAULT_POOL_SIZE: 20
    depends_on:
      db:
        condition: service_healthy
```

**Explication :**
```text
PgBouncer
→ un "pooler" de connexions, placé entre le backend et PostgreSQL : il accepte
  un grand nombre de connexions côté application (MAX_CLIENT_CONN: 200),
  mais ne maintient qu'un petit nombre de connexions RÉELLES vers PostgreSQL
  lui-même (DEFAULT_POOL_SIZE: 20), réutilisées et partagées entre les requêtes

POOL_MODE: transaction
→ une connexion réelle est libérée dès la fin de chaque transaction, plutôt
  que d'être bloquée pour toute la durée d'une session applicative — le mode
  le plus efficace pour la majorité des applications web de ce manuel
```

Le backend se connecte alors à `pgbouncer:5432` (son propre nom de service, rappel du chapitre 11) plutôt que directement à `db:5432`.

> 📌 **À retenir** — Un pooler de connexions n'est pas nécessaire pour un petit projet avec une seule instance backend et un trafic modéré — il devient pertinent précisément au moment où le chapitre 35 (mise à l'échelle, plusieurs instances) ou une charge réelle croissante commence à s'approcher de `max_connections`.

---

## 36.5 Dimensionner les ressources d'une base de données

> 📌 **À retenir, rappel appliqué du chapitre 35** — Une base de données a, presque systématiquement, un profil de consommation différent des autres services : plus gourmande en RAM (pour son cache interne de pages/index) que la plupart des backends applicatifs, mais souvent moins gourmande en CPU en usage normal. Fixer des `limits`/`reservations` (chapitre 35) trop proches de celles d'un simple backend serait une erreur de dimensionnement fréquente.

```yaml
# [compose.prod.yaml, extrait]
services:
  db:
    image: postgres:16
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1024M
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Checklist « base de données en production » (récapitulatif du chapitre)

- [ ] Volume nommé monté sur le chemin de données de l'image (chapitre 10, 16, 17).
- [ ] Sauvegarde automatisée, testée par restauration réelle (chapitre 33).
- [ ] Aucun port de base de données publié vers l'extérieur (chapitre 11, 26).
- [ ] Compte applicatif aux privilèges limités, jamais le compte administrateur pour l'application elle-même (chapitres 16-17).
- [ ] Migrations appliquées via un outil dédié (`migrate deploy` ou équivalent), jamais via `docker-entrypoint-initdb.d` après la mise en production.
- [ ] Connexion chiffrée entre l'application et la base, même en interne.
- [ ] Limites de ressources dimensionnées spécifiquement pour une base de données (RAM généreuse), pas copiées d'un autre service.
- [ ] Pooler de connexions envisagé dès que plusieurs instances applicatives ou une charge croissante s'en approchent.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Une évolution de schéma en production ne s'applique jamais | Tentative via `docker-entrypoint-initdb.d` sur un volume déjà initialisé | Utiliser un outil de migration dédié (`migrate deploy`) |
| Refus de connexion sous forte charge malgré des ressources CPU/RAM disponibles | `max_connections` atteint | Mettre en place un pooler de connexions (PgBouncer ou équivalent) |
| Panne totale de l'application lors d'une simple maintenance de la base | Conteneur de base de données unique, sans réplication | Accepter cette limite consciemment (section 36.2), ou évoluer vers une architecture plus complexe si le besoin est réellement mesuré |
| Base de données à court de mémoire alors que le backend a des ressources en excès | Limites de ressources copiées d'un autre service sans réflexion | Dimensionner spécifiquement selon le profil réel d'une base de données (section 36.5) |

---

## Laboratoire pratique n°1 — Mettre en place un vrai flux de migration

**Objectifs :** exécuter la section 36.1 de bout en bout.
**Prérequis :** Chapitre 33, un projet avec Prisma (ou un outil de migration équivalent).

**Étapes :** ajoute une colonne à un modèle existant, génère la migration en local (`migrate dev`), committe, applique-la sur un environnement de "production" simulé avec `migrate deploy`, confirme le succès et la nature idempotente d'un second appel.

**Résultat attendu :** une évolution de schéma appliquée proprement, sans jamais toucher à `docker-entrypoint-initdb.d`.

---

## Laboratoire pratique n°2 — Mettre en place PgBouncer

**Objectifs :** exécuter et vérifier la section 36.4.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** ajoute PgBouncer au projet, reconfigure le backend pour s'y connecter, puis compare le nombre de connexions réelles vers PostgreSQL (`SELECT count(*) FROM pg_stat_activity;`) avec et sans le pooler, sous une charge simulée de plusieurs requêtes concurrentes.

**Résultat attendu :** un nombre de connexions réelles vers PostgreSQL nettement inférieur au nombre de requêtes concurrentes envoyées par l'application.

---

## Laboratoire pratique n°3 — Auditer un projet selon la checklist complète

**Objectifs :** appliquer la checklist de ce chapitre à un projet réel.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** reprends le projet des chapitres 20-21, coche chaque point de la checklist « base de données en production », corrige ce qui manquerait.

**Résultat attendu :** un projet conforme à l'intégralité de la checklist, avec une justification pour chaque point.

---

## Exercices

1. Pourquoi `docker-entrypoint-initdb.d` ne peut-il jamais servir à une évolution de schéma en production ?
2. Quelle est la différence entre `migrate dev` et `migrate deploy`, et pourquoi cette distinction est-elle cruciale ?
3. Pourquoi un conteneur de base de données unique reste-t-il un point de défaillance unique, même bien sauvegardé ?
4. Pourquoi chiffrer une connexion interne, sur un réseau Docker qui ne quitte jamais la machine, apporte-t-il malgré tout une protection réelle ?
5. À partir de quel signal un pooler de connexions comme PgBouncer devient-il pertinent ?

---

## Quiz

**Question 1.** Une évolution de schéma en production doit être appliquée via :
a) `docker-entrypoint-initdb.d`, comme à l'initialisation
b) Un outil de migration dédié, appliqué explicitement (`migrate deploy` ou équivalent)
c) Une modification manuelle directe des fichiers de données
d) `docker volume prune`

**Question 2.** `migrate deploy`, contrairement à `migrate dev` :
a) Génère de nouvelles migrations de façon interactive
b) Applique uniquement les migrations déjà écrites, de façon idempotente, sans jamais interagir
c) Supprime toutes les données existantes
d) N'est utilisable qu'en développement

**Question 3.** Un conteneur de base de données unique, même bien sauvegardé :
a) Offre une disponibilité équivalente à une architecture répliquée
b) Reste un point de défaillance unique en cas de panne ou de maintenance
c) N'a besoin d'aucune sauvegarde
d) Ne peut jamais tomber en panne

**Question 4.** PgBouncer sert principalement à :
a) Chiffrer les données au repos
b) Réduire le nombre de connexions réelles vers la base, en les mutualisant
c) Remplacer entièrement PostgreSQL
d) Sauvegarder automatiquement les données

**Question 5.** Chiffrer une connexion entre le backend et la base de données sur un réseau Docker interne :
a) Est totalement inutile, le réseau étant déjà isolé
b) Apporte une protection de défense en profondeur, même sur un réseau interne
c) Ralentit systématiquement l'application de façon inacceptable
d) N'est possible qu'avec MySQL

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Une évolution de schéma en production exige un outil de migration dédié (`migrate deploy` ou équivalent), jamais le mécanisme d'initialisation à usage unique du chapitre 16.
- Un conteneur de base de données unique reste un point de défaillance unique — une limite honnête de ce manuel, acceptable pour l'écrasante majorité des projets, à dépasser uniquement sur un besoin réel et mesuré.
- La sécurité en production combine les rappels des chapitres 11 et 26, plus le chiffrement en transit même sur un réseau interne, en défense en profondeur.
- Un pooler de connexions (PgBouncer) devient pertinent dès que le nombre de connexions applicatives s'approche de `max_connections`, notamment avec plusieurs instances backend.
- Une base de données mérite un dimensionnement de ressources spécifique, généralement plus généreux en RAM que les autres services.
- **Rappel final et non négociable : un volume Docker n'est pas, à lui seul, une stratégie de sauvegarde** — le chapitre 33 dans son intégralité reste la vraie réponse à cette affirmation.

## ✅ Checklist avant de passer au chapitre 37

- [ ] Je sais appliquer une migration de schéma en production correctement.
- [ ] Je comprends les limites de disponibilité d'un conteneur de base de données unique.
- [ ] J'applique une isolation réseau et un chiffrement cohérents avec les chapitres 11 et 26.
- [ ] Je sais quand mettre en place un pooler de connexions.
- [ ] Mes limites de ressources sont dimensionnées spécifiquement pour chaque type de service.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Migration (rappel et approfondissement)**
Définition simple : un changement contrôlé et tracé du schéma d'une base de données déjà en usage (rappel du chapitre 16).
Voir : Chapitre 16, section 16.2 ; Chapitre 36, section 36.1.

**Point de défaillance unique (single point of failure)**
Définition simple : un composant dont la panne interrompt l'ensemble du système, faute de redondance.
Voir : Chapitre 36, section 36.2.

**Connection pooling**
Définition simple : la mutualisation d'un grand nombre de connexions applicatives vers un petit nombre de connexions réelles à la base de données.
Voir : Chapitre 36, section 36.4.

---

## ❓ FAQ

**Faut-il toujours un pooler de connexions, même pour un petit projet ?**
Non — un petit projet avec une seule instance backend atteint rarement `max_connections` ; le pooler devient une bonne pratique préventive à partir d'une charge ou d'une architecture multi-instance réelle.

**La réplication de base de données est-elle totalement hors de portée de Docker Compose ?**
Techniquement possible à un niveau basique (des images officielles proposent des configurations de réplication), mais une vraie haute disponibilité avec bascule automatique dépasse largement le modèle "un seul serveur" de ce manuel — un sujet pour un futur approfondissement au-delà de ce livre.

**Les migrations doivent-elles toujours être une étape séparée du déploiement de l'application ?**
Oui, fortement recommandé — les exécuter au démarrage de chaque instance applicative créerait une course dangereuse dès que plusieurs instances démarrent simultanément (chapitre 35), un problème qu'une étape de déploiement unique et explicite évite structurellement.

---

## Références officielles

- Prisma Migrate en production — [prisma.io/docs/orm/prisma-migrate/workflows/deploying](https://www.prisma.io/docs/orm/prisma-migrate/workflows/deploying)
- PgBouncer — [pgbouncer.org](https://www.pgbouncer.org)
- Réplication PostgreSQL (pour référence, hors périmètre détaillé) — [postgresql.org/docs/current/high-availability.html](https://www.postgresql.org/docs/current/high-availability.html)

---

## Conclusion

Une base de données traitée avec toute la rigueur qu'elle mérite — persistance, sauvegarde testée, migrations maîtrisées, sécurité en profondeur. Le chapitre 37 ferme la Partie VIII avec un dernier sujet d'architecture : pourquoi les microservices existent, et pourquoi ils ne sont pas la réponse par défaut à adopter systématiquement.

---

⬅️ [Chapitre 35 — Performance](35-performance.md) · ➡️ **Suite : Chapitre 37 — Docker et architecture microservices**
