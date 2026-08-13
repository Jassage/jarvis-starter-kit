<div class="chapitre-titre-num">CHAPITRE 47</div>

# Projet final — Déploiement Docker

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Conteneuriser MediAPI complètement (Dockerfile multi-étapes, Docker Compose, pipeline CI/CD) et vérifier une checklist finale avant sa mise en production réelle. À la fin de ce chapitre, tu auras déployé de bout en bout un projet complet — l'aboutissement concret des 46 chapitres précédents.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
C'est le jour de la mise en production pour la clinique. Le médecin-directeur t'a donné le feu vert, et cette fois, il n'y a plus de filet de sécurité : chaque patient réel, chaque consultation réelle, chaque document médical réel dépendra de ce déploiement. Ce chapitre construit exactement le processus qui rend ce moment serein plutôt que stressant — un Dockerfile éprouvé, un pipeline CI/CD qui teste avant de déployer, et une checklist finale qui rassemble, en une seule vérification, l'ensemble des bonnes pratiques des 46 chapitres précédents.
</div>

## 47.1 Dockerfile de MediAPI

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider -q http://localhost:3000/sante || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi générer le client Prisma dans l'étape de build</span>
`npx prisma generate` produit du code JavaScript spécifique au schéma (`node_modules/.prisma`), qui doit être présent dans l'image finale — copié explicitement depuis l'étape `build` vers l'étape `production`, exactement le principe du build multi-étapes du chapitre 37.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
La commande finale (`npx prisma migrate deploy && node server.js`) applique **toujours** les migrations avant de démarrer l'application, à chaque redémarrage du conteneur — rappel direct de l'incident du vendredi soir évité au chapitre 39, désormais impossible à reproduire puisque cet ordre est gravé dans l'image elle-même, pas dans la mémoire d'un développeur.
</div>

## 47.2 docker-compose.yml complet de MediAPI

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/mediapi
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads_mediapi:/app/uploads
    restart: always

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=mediapi
    volumes:
      - donnees_postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  donnees_postgres:
  uploads_mediapi:
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un volume dédié pour uploads/, séparé de la base de données</span>
Les documents médicaux téléversés (chapitre 45) doivent survivre aux redémarrages du conteneur `api`, exactement comme les données de `db` — un volume `uploads_mediapi` séparé garantit cette persistance, indépendamment du cycle de vie du conteneur applicatif.
</div>

## 47.3 Variables d'environnement de production

```
# .env.production (jamais commité)
DB_PASSWORD=un-mot-de-passe-tres-solide
JWT_ACCESS_SECRET=cle-secrete-access-tres-longue-et-aleatoire
JWT_REFRESH_SECRET=cle-secrete-refresh-differente-de-lacces
```

## 47.4 Pipeline CI/CD complet pour MediAPI

```yaml
# .github/workflows/deploy.yml
name: CI/CD MediAPI

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: mediapi_test
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mediapi_test
      - run: npm test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mediapi_test
          NODE_ENV: test

  deployer:
    needs: test
    runs-on: ubuntu-latest
    if: success()
    steps:
      - name: Déployer sur le serveur de production
        run: |
          ssh utilisateur@serveur-mediapi.com "cd mediapi && git pull && docker compose up -d --build"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un vrai PostgreSQL de test dans le pipeline CI, pas une base simulée</span>
Le job `test` démarre un **vrai** conteneur PostgreSQL (via `services:` de GitHub Actions), garantissant que les tests d'intégration (chapitre 46) s'exécutent dans des conditions représentatives de la production — bien plus fiable qu'une base simulée qui pourrait masquer des incompatibilités réelles avec PostgreSQL.
</div>

## 47.5 Checklist finale avant mise en production

<div class="encadre astuce">
<span class="encadre-titre">💡 Récapitulatif transversal du manuel, appliqué à MediAPI</span>
- Toutes les routes sensibles protégées par `authentifier` + `autoriser` (chapitres 23-24).
- Toutes les entrées validées via Zod (chapitre 18) avant d'atteindre les services.
- Gestion d'erreurs centralisée, aucune stack trace exposée en production (chapitre 19).
- Helmet, CORS restreint, rate limiting sur `/auth/connexion` (chapitre 25).
- Migrations appliquées via `migrate deploy`, jamais `migrate dev` en production (chapitres 34, 39).
- Tests unitaires et d'intégration exécutés dans le pipeline CI/CD avant tout déploiement (chapitre 47.4).
- Documents médicaux servis uniquement via une route authentifiée, jamais en accès statique direct (chapitre 45).
- Variables d'environnement (secrets JWT, mot de passe base de données) injectées au lancement, jamais codées dans l'image Docker (chapitre 37).
</div>

## 47.6 Ce que ce projet final a assemblé

<div class="encadre astuce">
<span class="encadre-titre">💡 Récapitulatif de bout en bout</span>
MediAPI a mobilisé, dans un seul projet cohérent : fondamentaux Node.js et JavaScript asynchrone (parties 1-2), Express et architecture en couches (partie 3), robustesse (gestion d'erreurs, journalisation, pagination — partie 4), sécurité et authentification JWT/RBAC (partie 5), upload et documentation Swagger (partie 6), tests unitaires et d'intégration (partie 7), Prisma/PostgreSQL (partie 8), et Docker/déploiement (partie 9). C'est exactement la même méthodologie que celle déjà appliquée aux projets réels mentionnés dans les manuels React et Java de ce même auteur (KONEKTE, BANKA, GESCOM, LAKAY, MEDIKA) : les mêmes briques, assemblées selon les besoins spécifiques de chaque produit.
</div>

## 47.7 Pour aller plus loin après ce manuel

- Ajouter Redis pour le cache et un rate limiting partagé entre plusieurs instances (chapitre 25, 40).
- Explorer TypeScript pour un typage statique complet du projet (mentionné au chapitre 17).
- Ajouter des notifications temps réel (WebSockets/Socket.io) pour les rendez-vous à venir.
- Explorer Kubernetes pour une orchestration à plus grande échelle que Docker Compose.
- Consulter les annexes de ce manuel (aide-mémoire, glossaire, ressources) comme référence rapide au quotidien.

## Atelier — Le déploiement complet, de zéro à MediAPI en production

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 47 — La mise en production réelle de la mise en situation</span>

**Objectif** : dérouler l'intégralité du processus de déploiement de MediAPI, exactement comme le jour décrit dans la mise en situation d'ouverture.

**Préparation** : le projet MediAPI complet (chapitres 41-46), un VPS ou un environnement Docker local simulant la production.

**Étapes détaillées** :
1. Construis l'image de production (`docker build`) et vérifie sa taille (rappel du chapitre 37, `node:20-alpine`).
2. Lance `docker compose up -d --build` avec un fichier `.env.production` complet.
3. Vérifie que les migrations se sont appliquées automatiquement (`docker compose logs api`) avant le démarrage du serveur.
4. Teste le healthcheck (`docker compose ps`, la colonne "STATUS" doit indiquer "healthy").
5. Exécute la checklist complète de la section 47.5, point par point, sans en sauter un seul.
6. Simule un déploiement complet via le pipeline CI/CD (section 47.4) sur une branche de test, en observant chaque étape réussir dans l'ordre.

**Validation** : chaque point de la checklist finale doit être vérifié concrètement, pas seulement supposé correct — exactement le niveau de rigueur attendu avant que de vrais patients ne dépendent du système.

**Résultat attendu** : un déploiement de MediAPI aussi serein que rigoureux, aboutissement concret de l'ensemble du manuel.

**Dépannage** : si le healthcheck reste "unhealthy", vérifie que la route `/sante` (chapitre 37) répond bien en 200 sans dépendre d'une opération susceptible d'échouer (comme une requête base de données lourde).

**Nettoyage** : conserve cet environnement comme référence pour tes futurs déploiements de projets similaires.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Sauter des points de la checklist finale "parce que ça a l'air de marcher"</span>
Un projet qui "semble" fonctionner en test manuel peut malgré tout avoir une faille de sécurité invisible à l'usage normal (rappel du chapitre 25) — la checklist de la section 47.5 doit être vérifiée méthodiquement, jamais estimée par simple impression.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Déployer directement en production sans passer par le pipeline CI/CD</span>
Rappel du chapitre 39 — exactement le risque que ce chapitre entier vise à éliminer pour un projet aussi sensible que MediAPI.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le conteneur api redémarre en boucle sans jamais devenir "healthy"</span>

- **Cause probable** : échec de connexion à la base de données (variables d'environnement incorrectes) ou échec des migrations au démarrage.
- **Diagnostic** : `docker compose logs api` révèle généralement l'erreur exacte (rappel du chapitre 38 sur le débogage Docker Compose).
- **Solution** : corriger la configuration identifiée, puis relancer `docker compose up -d --build`.
</div>

## En entreprise

- **Mise en production comme processus reproductible, jamais un événement stressant** : l'objectif de tout ce manuel converge ici — un déploiement qui suit un processus documenté et automatisé (Dockerfile, Compose, CI/CD) ne devrait jamais dépendre de la mémoire ou du calme d'un développeur un jour précis.
- **Checklist finale comme rituel d'équipe** : de nombreuses équipes professionnelles maintiennent une checklist similaire à la section 47.5, revue et mise à jour à mesure que de nouvelles bonnes pratiques ou incidents passés l'enrichissent.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Décris le processus complet de déploiement d'une API Node.js que tu as mis en place."**
Réponse attendue : une réponse structurée couvrant conteneurisation (Dockerfile multi-étapes), orchestration (Docker Compose ou équivalent), pipeline CI/CD (tests avant déploiement), gestion des migrations (toujours avant redémarrage), et une checklist de sécurité — exactement la structure de ce chapitre.

**Q2. "Comment garantis-tu qu'aucune régression n'atteint la production ?"**
Réponse attendue : un pipeline CI/CD qui exécute systématiquement la suite de tests (unitaires et intégration) contre une vraie base de données de test avant d'autoriser le déploiement, bloquant automatiquement tout code défaillant.

**Q3. "Quelle est la dernière chose que tu vérifies avant une mise en production réelle ?"**
Réponse attendue : une checklist de sécurité et de robustesse complète (comme la section 47.5), vérifiée méthodiquement point par point, jamais estimée par simple impression que "ça a l'air de marcher".
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Pour une application manipulant des données médicales réelles, envisager un audit de sécurité externe avant la toute première mise en production réelle — au-delà de la checklist interne, un regard extérieur détecte souvent des angles morts.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documenter, dans le `README.md` du projet final, la procédure complète de déploiement (comme celle de ce chapitre) — pour que ce savoir ne reste jamais uniquement dans la tête de la personne qui a construit le projet.
</div>

## Résumé du chapitre

- Le Dockerfile multi-étapes génère et embarque le client Prisma, applique les migrations au démarrage du conteneur (`prisma migrate deploy && node server.js`).
- `docker-compose.yml` orchestre l'API et PostgreSQL, avec des volumes séparés pour les données et les uploads.
- Le pipeline CI/CD teste contre un vrai PostgreSQL éphémère avant tout déploiement en production.
- La checklist finale récapitule l'ensemble des bonnes pratiques transversales du manuel, appliquées concrètement à MediAPI.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Pourquoi le client Prisma est-il généré dans l'étape "build" puis copié vers "production" ?
   - a) Par habitude, sans raison technique
   - b) Pour garder l'image finale de production légère (principe du multi-étapes, chapitre 37)
   - c) Prisma l'exige absolument
   - d) Pour accélérer le build

2. Dans quel ordre le conteneur API de MediAPI exécute-t-il ses opérations au démarrage ?
   - a) Démarre le serveur, puis applique les migrations
   - b) Applique les migrations, puis démarre le serveur
   - c) Les deux simultanément
   - d) Aucun ordre particulier

3. Pourquoi le pipeline CI/CD utilise-t-il un vrai conteneur PostgreSQL plutôt qu'une base simulée ?
   - a) Par simplicité uniquement
   - b) Pour des conditions de test représentatives de la production
   - c) GitHub Actions l'exige
   - d) Pour ralentir volontairement les tests

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. La checklist finale de la section 47.5 peut être estimée par impression générale, sans vérification point par point. — **Faux**.
2. Le volume uploads_mediapi persiste les documents médicaux au-delà du cycle de vie du conteneur api. — **Vrai**.
3. Un déploiement manuel sans pipeline CI/CD est acceptable pour un projet manipulant des données sensibles. — **Faux**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

En quoi ce chapitre de déploiement final illustre-t-il la valeur de l'ensemble des 46 chapitres précédents, plutôt que d'être un simple ajout technique de fin de parcours ?

**Corrigé** : chaque élément de ce chapitre (Dockerfile multi-étapes, migrations avant démarrage, pipeline testant avant déploiement, checklist de sécurité) réutilise directement une leçon apprise dans un chapitre antérieur — rien n'est improvisé ni ajouté au dernier moment. C'est précisément cette réutilisation cohérente d'un socle de bonnes pratiques, plutôt qu'un patchwork de solutions ponctuelles, qui distingue un projet construit méthodiquement (comme MediAPI) d'un projet assemblé au hasard des besoins — la vraie compétence transmise par ce manuel n'est pas seulement de savoir écrire du code Node.js, mais de savoir l'organiser en un système cohérent, du premier chapitre jusqu'à la mise en production réelle.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 47.1</span>

Ajoute une étape au pipeline CI/CD (section 47.4) qui vérifie, via `npm audit` (rappel du chapitre 4), qu'aucune vulnérabilité critique n'est présente dans les dépendances avant tout déploiement.
</div>

**Corrigé :**
```yaml
steps:
  # ... étapes existantes ...
  - name: Audit de sécurité des dépendances
    run: npm audit --audit-level=critical
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai construit et testé le Dockerfile multi-étapes de MediAPI.</li>
<li>☐ J'ai orchestré l'API et PostgreSQL avec Docker Compose, volumes inclus.</li>
<li>☐ J'ai mis en place le pipeline CI/CD complet, testant avant de déployer.</li>
<li>☐ J'ai vérifié méthodiquement chaque point de la checklist finale (section 47.5).</li>
<li>☐ J'ai déployé MediAPI de bout en bout, du code source jusqu'à un conteneur en production.</li>
</ul>

## FAQ

<dl class="faq">
<dt>MediAPI est-il prêt pour une vraie clinique, tel quel ?</dt>
<dd>Ce projet couvre les fondations techniques solides enseignées dans ce manuel ; une vraie mise en production pour un établissement de santé réel nécessiterait probablement une conformité réglementaire additionnelle (protection des données de santé) hors du périmètre strictement technique de ce manuel.</dd>

<dt>Faut-il redéployer manuellement à chaque changement, ou le pipeline s'en charge-t-il entièrement ?</dt>
<dd>Le pipeline de la section 47.4 automatise entièrement le processus : un simple `git push` sur la branche principale déclenche tests puis déploiement, sans intervention manuelle si tout réussit.</dd>

<dt>Que faire si un déploiement automatisé échoue en production ?</dt>
<dd>Avec le job `test` qui précède `deployer` dans le pipeline (section 47.4), un échec de test bloque le déploiement avant même qu'il n'atteigne la production — le scénario d'un déploiement défaillant devient rare, mais un rollback via Git reste la solution de secours si nécessaire (rappel du chapitre 39).</dd>
</dl>

## Références et pour aller plus loin

- Rappel des chapitres 37 (Docker), 38 (Docker Compose) et 39 (déploiement) pour les fondations complètes de ce chapitre.

*Ceci clôt la Partie 10 et le corps principal du manuel. Les annexes suivantes (aide-mémoire, erreurs fréquentes, glossaire, ressources) servent de référence rapide pour la suite de ta pratique.*
