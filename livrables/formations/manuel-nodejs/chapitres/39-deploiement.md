<div class="chapitre-titre-num">CHAPITRE 39</div>

# Déploiement

## Objectifs pédagogiques

Déployer une API Node.js en production sur différentes plateformes, mettre en place un pipeline CI/CD basique, et gérer les migrations de base de données en production.

## 39.1 Les grandes familles de plateformes de déploiement

| Plateforme | Type | Cas d'usage typique |
|---|---|---|
| **Railway, Render, Fly.io** | PaaS moderne | Déploiement simple depuis Git, bases de données managées incluses |
| **VPS (DigitalOcean, OVH, Hetzner)** | Serveur virtuel brut | Contrôle total, nécessite de tout configurer soi-même (Nginx, Docker, sécurité) |
| **AWS/GCP/Azure** | Cloud complet | Grande échelle, nombreux services managés, complexité de configuration plus élevée |
| **Vercel** | Serverless | Adapté aux fonctions serverless courtes, moins aux API Express classiques longue durée |

## 39.2 Déployer sur un VPS avec Docker

```
$ ssh utilisateur@mon-serveur.com
$ git clone https://github.com/jaslin/mon-api.git
$ cd mon-api
$ docker compose -f docker-compose.prod.yml up -d --build
```

```yaml
# docker-compose.prod.yml — sans volumes de développement, avec redémarrage automatique
services:
  api:
    build: .
    restart: always # redémarre automatiquement le conteneur en cas de plantage ou de redémarrage du serveur
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env.production
```

## 39.3 Nginx comme reverse proxy

```nginx
# /etc/nginx/sites-available/mon-api
server {
    listen 80;
    server_name api.monapp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi un reverse proxy devant l'API Node.js</span>
Nginx gère le certificat HTTPS/SSL (via Let's Encrypt/Certbot), peut servir des fichiers statiques plus efficacement que Node.js, applique un rate limiting supplémentaire au niveau serveur, et permet d'héberger plusieurs applications sur le même serveur via des noms de domaine différents — autant de responsabilités qu'il vaut mieux déléguer à un serveur web dédié plutôt que de les gérer dans le code Node.js lui-même.
</div>

## 39.4 Migrations de base de données en production

```
$ npx prisma migrate deploy   # rappel du chapitre 34 : jamais "migrate dev" en production
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours appliquer les migrations AVANT de démarrer la nouvelle version de l'API</span>
Démarrer une nouvelle version du code qui suppose l'existence d'une colonne/table pas encore créée en base provoquerait des erreurs immédiates. L'ordre correct : (1) appliquer les migrations, (2) démarrer/redémarrer l'application avec le nouveau code.
</div>

```yaml
# Exemple d'étape dans un pipeline CI/CD (section 39.5)
- name: Appliquer les migrations
  run: npx prisma migrate deploy
- name: Redémarrer l'application
  run: docker compose up -d --build
```

## 39.5 Intégration continue (CI/CD) avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: CI/CD

on:
  push:
    branches: [main]

jobs:
  test-et-deployer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test                    # tests unitaires (chapitre 29)
      - run: npm run test:integration    # tests d'intégration (chapitre 30)
      - name: Déployer sur le serveur de production
        if: success()                    # UNIQUEMENT si toutes les étapes précédentes ont réussi
        run: |
          ssh utilisateur@mon-serveur.com "cd mon-api && git pull && docker compose up -d --build"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Aucun déploiement ne devrait contourner les tests</span>
Ce pipeline garantit qu'**aucun** code n'atteint la production sans être passé par le linting et l'intégralité de la suite de tests — une discipline qui détecte une régression **avant** qu'elle n'affecte de vrais utilisateurs, plutôt qu'après.
</div>

## 39.6 Gestion des processus avec PM2 (alternative/complément à Docker)

```
$ npm install -g pm2
$ pm2 start server.js --name mon-api -i max # -i max : un processus par coeur CPU disponible (cluster mode)
$ pm2 logs mon-api
$ pm2 restart mon-api
$ pm2 startup      # configure PM2 pour redémarrer automatiquement au reboot du serveur
$ pm2 save
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PM2 en mode cluster : exploiter plusieurs coeurs CPU</span>
Rappel du chapitre 1 : Node.js exécute le JavaScript sur un thread unique. PM2 en mode `cluster` (`-i max`) démarre **plusieurs processus** Node.js identiques, un par coeur CPU, répartissant automatiquement les requêtes entre eux — une façon simple d'exploiter le parallélisme matériel sans changer une ligne de code applicatif.
</div>

## 39.7 Zero-downtime deployment (déploiement sans interruption)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le principe du déploiement progressif (rolling deployment)</span>
Plutôt que d'arrêter l'ancienne version puis démarrer la nouvelle (provoquant une brève interruption de service), un déploiement "rolling" démarre la nouvelle version **en parallèle** de l'ancienne, redirige progressivement le trafic vers elle une fois qu'elle répond correctement (healthcheck, chapitre 37), puis arrête l'ancienne — PM2 (`pm2 reload`) et les orchestrateurs comme Kubernetes gèrent nativement ce mécanisme.
</div>

## 39.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Déployer directement depuis sa machine locale, sans CI/CD</span>
Sans pipeline automatisé, un déploiement manuel (`git push` puis commandes SSH tapées à la main) devient sujet à l'erreur humaine (oublier une étape, déployer un code non testé, pousser accidentellement des changements locaux non commités) — un pipeline CI/CD élimine cette variabilité.
</div>

## 39.9 Résumé du chapitre

- Les plateformes PaaS simplifient le déploiement ; un VPS avec Docker offre plus de contrôle au prix d'une configuration manuelle.
- Nginx en reverse proxy gère HTTPS, fichiers statiques et rate limiting, en amont de l'application Node.js.
- Les migrations de base de données (`migrate deploy`) doivent toujours s'appliquer avant de démarrer la nouvelle version du code.
- Un pipeline CI/CD (GitHub Actions) garantit qu'aucun code non testé n'atteint la production.
- PM2 en mode cluster exploite plusieurs coeurs CPU malgré le modèle mono-thread de Node.js.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 39.1</span>

Écris un pipeline GitHub Actions minimal qui installe les dépendances, exécute les tests, et échoue le build si un test échoue (sans étape de déploiement).
</div>

**Corrigé :**
```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

*Chapitre suivant : les bonnes pratiques et l'optimisation des performances, pour clore la Partie 9.*
