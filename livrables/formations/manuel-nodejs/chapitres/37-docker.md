<div class="chapitre-titre-num">CHAPITRE 37</div>

# Docker

## Objectifs pédagogiques

Comprendre le principe de la conteneurisation, écrire un Dockerfile optimisé pour une application Node.js, et construire/exécuter une image.

## 37.1 Le problème résolu par Docker

<div class="encadre astuce">
<span class="encadre-titre">💡 "Ça marche sur ma machine" — le problème classique</span>
Une application qui fonctionne parfaitement sur la machine d'un développeur peut échouer sur le serveur de production à cause de différences d'environnement : version de Node.js différente, dépendance système manquante, variable d'environnement oubliée. **Docker** empaquette l'application **avec tout son environnement d'exécution** dans une image portable, garantissant un comportement identique partout où elle s'exécute.
</div>

## 37.2 Image vs conteneur

- **Image** : un modèle immuable, un "plan de construction" contenant le code, les dépendances, et la configuration nécessaire pour exécuter l'application.
- **Conteneur** : une **instance en cours d'exécution** d'une image — comme un objet est une instance d'une classe (rappel du manuel Java de ce même auteur).

```
$ docker build -t mon-api .        # construit une IMAGE à partir du Dockerfile
$ docker run -p 3000:3000 mon-api  # démarre un CONTENEUR à partir de cette image
```

## 37.3 Un Dockerfile de base

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi copier package*.json AVANT le reste du code</span>
Docker met en **cache** chaque étape (couche/*layer*) du Dockerfile. Si le code source change mais que `package.json` reste identique, copier `package*.json` puis exécuter `npm ci` **avant** de copier le reste du code permet à Docker de réutiliser le cache de cette étape coûteuse (installation des dépendances), ne réexécutant que les étapes suivantes — accélérant considérablement les reconstructions successives.
</div>

## 37.4 alpine : une image de base légère

<div class="encadre astuce">
<span class="encadre-titre">💡 node:20-alpine vs node:20</span>
`node:20` (basé sur Debian complet) pèse plusieurs centaines de Mo ; `node:20-alpine` (basé sur Alpine Linux, une distribution minimaliste) ne pèse que quelques dizaines de Mo — un gain significatif de taille d'image, de temps de transfert, et de surface d'attaque de sécurité (moins de logiciels installés = moins de vulnérabilités potentielles).
</div>

## 37.5 Build multi-étapes (multi-stage) pour une image de production optimisée

```dockerfile
# Étape 1 : construction (avec toutes les devDependencies nécessaires pour un éventuel build)
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build 2>/dev/null || true # si le projet a une étape de build (TypeScript, par exemple)

# Étape 2 : production (image FINALE, allégée, sans les outils de développement)
FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev # UNIQUEMENT les dépendances de production, pas Jest/nodemon/etc.

COPY --from=build /app/dist ./dist # ne récupère QUE le résultat compilé de l'étape précédente
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'image finale ne contient jamais les devDependencies ni le code source non compilé</span>
Le build multi-étapes sépare l'environnement de **construction** (qui peut avoir besoin d'outils lourds) de l'image **finale** réellement déployée, bien plus légère et sans surface d'attaque inutile (pas de Jest, pas d'ESLint, pas de code TypeScript brut dans l'image de production).
</div>

## 37.6 .dockerignore : exclure les fichiers inutiles

```
# .dockerignore
node_modules/
.env
.git/
*.log
tests/
coverage/
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans .dockerignore, node_modules local est copié dans l'image, en plus d'être réinstallé</span>
Sans ce fichier, `COPY . .` copierait aussi le `node_modules/` local du développeur (potentiellement incompatible avec l'architecture du conteneur, notamment pour des paquets natifs compilés) — `.dockerignore` fonctionne exactement comme `.gitignore`, mais pour le contexte de build Docker.
</div>

## 37.7 Variables d'environnement dans un conteneur

```
$ docker run -p 3000:3000 --env-file .env mon-api
```

```dockerfile
# Alternative : valeur par défaut dans le Dockerfile, surchageable au lancement
ENV PORT=3000
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais intégrer de vrais secrets DANS l'image Docker elle-même</span>
Une variable définie via `ENV` dans le Dockerfile devient **partie intégrante de l'image**, visible par quiconque a accès à cette image (même sans lancer de conteneur, via `docker history`). Les vrais secrets (mots de passe, clés API) doivent toujours être injectés **au lancement** du conteneur (`--env-file`, ou via un orchestrateur comme Docker Compose, chapitre 38, ou un gestionnaire de secrets en production), jamais codés dans le Dockerfile.
</div>

## 37.8 Commandes Docker essentielles

```
$ docker build -t mon-api:1.0 .        # construit une image avec un tag de version
$ docker images                        # liste les images locales
$ docker run -d -p 3000:3000 mon-api   # démarre en arrière-plan (-d = detached)
$ docker ps                             # liste les conteneurs en cours d'exécution
$ docker logs <id_conteneur>            # affiche les logs d'un conteneur
$ docker exec -it <id_conteneur> sh    # ouvre un terminal DANS le conteneur en cours d'exécution
$ docker stop <id_conteneur>
$ docker rm <id_conteneur>              # supprime un conteneur arrêté
$ docker rmi mon-api:1.0                # supprime une image
```

## 37.9 Healthcheck : signaler que l'application est prête

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider -q http://localhost:3000/sante || exit 1
```

```js
// Une route dédiée, légère, sans logique métier ni dépendance externe
app.get("/sante", (req, res) => res.status(200).json({ statut: "ok" }));
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi un healthcheck est utile en production</span>
Un orchestrateur (Docker Compose, Kubernetes) peut utiliser ce signal pour savoir si un conteneur est réellement **prêt à recevoir du trafic**, et redémarrer automatiquement un conteneur qui ne répond plus correctement — une route `/sante` volontairement minimaliste évite qu'une panne de base de données, par exemple, ne fasse échouer le healthcheck lui-même de façon trompeuse.
</div>

## 37.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Lancer npm install au lieu de npm ci dans le Dockerfile</span>
Rappel du chapitre 3 : `npm ci` garantit une installation strictement reproductible à partir de `package-lock.json`, essentielle pour qu'une image Docker construite aujourd'hui installe **exactement** les mêmes versions qu'une image construite demain avec le même code source.
</div>

## 37.11 Résumé du chapitre

- Docker empaquette l'application avec son environnement d'exécution complet, éliminant les différences entre machines.
- L'ordre des instructions du Dockerfile (dépendances avant code source) exploite le cache de build de Docker.
- `node:20-alpine` produit des images bien plus légères que l'image Debian complète.
- Le build multi-étapes sépare construction et image finale de production, plus légère et sans outils de développement.
- Les vrais secrets ne doivent jamais être intégrés dans l'image elle-même, toujours injectés au lancement du conteneur.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 37.1</span>

Écris un Dockerfile pour une API Node.js simple (pas de build TypeScript), basé sur `node:20-alpine`, exposant le port 4000, avec un `.dockerignore` approprié.
</div>

**Corrigé :**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
```
```
# .dockerignore
node_modules/
.env
.git/
tests/
```

*Chapitre suivant : Docker Compose, pour orchestrer l'API avec sa base de données et ses autres services.*
