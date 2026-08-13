# Chapitre 20 — Étude de cas : React + NestJS

**Niveau : Intermédiaire**

---

## Introduction

Cette étude de cas reprend le patron du chapitre 19 (React statique + API Node + PostgreSQL) en substituant Express par **NestJS**, un framework backend structuré (modules, contrôleurs, services, décorateurs), plus proche des conventions d'un framework comme Spring Boot ou Angular côté architecture. Elle est volontairement plus courte que le chapitre 19 : tout ce qui est identique (préparation serveur, sécurité, nginx, HTTPS, sauvegardes, monitoring) est renvoyé à son chapitre d'origine, seules les différences réelles sont détaillées.

## 🎯 Objectifs pédagogiques

Déployer une API NestJS en production, en identifiant précisément ce qui diffère d'Express (chapitre 19) et ce qui reste rigoureusement identique.

## 📋 Prérequis

Chapitre 19 complété (base commune), chapitre 6 section 6.8 (NestJS).

## Pourquoi ce chapitre est important

Beaucoup d'équipes choisissent NestJS pour sa structure imposée (utile à grande échelle, plusieurs développeurs) plutôt qu'Express (plus libre, plus simple à démarrer). Ce chapitre montre que ce choix architectural n'a **aucun impact** sur le déploiement lui-même — la leçon centrale de la Partie III (chapitre 6, section 6.0) confirmée en conditions réelles.

---

## Ce qui reste strictement identique au chapitre 19

Préparation du serveur (19.1), installation des logiciels (19.2), sécurisation PostgreSQL (19.3), déploiement du frontend React (19.5), configuration nginx du frontend, HTTPS (19.7), sauvegardes (19.8), monitoring (19.9). Aucune de ces étapes ne change avec NestJS — se référer directement au chapitre 19.

## Ce qui diffère : le backend NestJS

### Structure du projet

```mermaid
flowchart TD
    Main["main.ts (point d'entrée)"] --> AppModule["AppModule"]
    AppModule --> MembresModule["MembresModule"]
    AppModule --> CotisationsModule["CotisationsModule"]
    MembresModule --> MembresController["MembresController"]
    MembresModule --> MembresService["MembresService"]
```
**Explication du diagramme :** contrairement à Express (des routes déclarées librement), NestJS impose une organisation en **modules**, chacun regroupant un **contrôleur** (reçoit les requêtes HTTP) et un **service** (logique métier) — une discipline architecturale qui n'apparaît jamais au niveau du déploiement, seulement dans le code source.

### Déploiement

```bash
git clone git@github.com:tonorg/association-backend-nest.git ~/backend
cd ~/backend
npm ci
cp .env.example .env
nano .env
npx prisma migrate deploy
npm run build              # génère dist/main.js (pas dist/server.js)
pm2 start dist/main.js --name association-api
pm2 save
```
> 📌 **À retenir** — La seule différence pratique avec le chapitre 19 : le fichier de démarrage est `dist/main.js`, pas `dist/server.js`. Tout le reste (variables d'environnement, PM2, nginx, migrations) est identique au chapitre 19.

### `.env.example` NestJS typique

```bash
DATABASE_URL=postgresql://association_user:MOT_DE_PASSE@localhost:5432/association
JWT_SECRET=...
PORT=4000
CORS_ORIGINS=https://app.tondomaine.ht
```
Identique dans sa forme au `.env` Express du chapitre 19 — NestJS ne change rien à la façon dont les variables d'environnement sont lues (`process.env`), seulement à la façon dont elles sont injectées dans le code via son système de configuration interne (`@nestjs/config`), un détail de code, jamais de déploiement.

### Nginx et HTTPS

Rigoureusement identiques à ceux du chapitre 19, section 19.6 — un reverse proxy ne sait pas, et n'a pas besoin de savoir, si le backend derrière lui est écrit avec Express ou NestJS.

---

## Étude de cas

**Contexte.** La même association du chapitre 19, mais cette fois l'équipe de développement grandit à quatre personnes et souhaite une structure de code plus rigide pour éviter les incohérences entre développeurs — la raison typique du choix de NestJS plutôt qu'Express dans un contexte réel. Le déploiement, lui, ne change pas d'une ligne au-delà du nom du fichier de démarrage.

---

## Bonnes pratiques (récapitulatif du chapitre)

- Ne jamais confondre une différence de structure de code avec une différence de déploiement — vérifier systématiquement laquelle est réellement en cause avant d'adapter une procédure.
- `dist/main.js` pour NestJS, à ne pas confondre avec l'habitude prise sur Express.

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Pourquoi elle arrive | Conséquence |
|---|---|---|
| `pm2 start dist/server.js` par habitude d'Express | Réflexe non ajusté | `Error: Cannot find module`, l'application ne démarre jamais |

---

## Captures d'écran à réaliser

> 📸 **Capture 23**
> **Logiciel :** terminal
> **Pourquoi cette capture est utile :** montrer `pm2 list` avec l'API NestJS active, identique visuellement à l'API Express du chapitre 19.
> **Page/écran concerné :** sortie de `pm2 list`
> **Montrer :** le statut "online" du process `association-api`
> **Flouter/masquer :** rien de sensible

---

## Laboratoire pratique n°1 — Migrer le backend du chapitre 19 vers NestJS

**Objectifs :** confirmer par la pratique que seul le backend change.
**Étapes :** déploie une API NestJS équivalente sur le même VPS (ou un clone de test), en ne changeant que les étapes de la section "Ce qui diffère".
**Résultat attendu :** un fonctionnement identique du point de vue du frontend et de nginx.

## Laboratoire pratique n°2 — Comparer les logs PM2 des deux frameworks

**Objectifs :** observer si le format des logs diffère entre Express et NestJS.
**Étapes :** compare `pm2 logs` sur les deux déploiements (chapitre 19 et ce chapitre).
**Résultat attendu :** un format de log légèrement différent (NestJS est plus verbeux par défaut au démarrage), sans impact sur la méthode de consultation elle-même.

---

## Exercices

1. Liste, de mémoire, les trois seules différences réelles entre le déploiement du chapitre 19 et celui-ci.
2. Pourquoi une différence d'architecture de code (modules NestJS) n'affecte-t-elle jamais la configuration nginx ?

## Quiz

**Question 1.** Le fichier de démarrage généré par le build NestJS est :
a) `dist/server.js`
b) `dist/main.js`
c) `dist/app.js`
d) `dist/index.js`

> 🔑 **Corrigé** — 1: b

---

## 📝 Résumé du chapitre

NestJS se déploie de façon quasi identique à Express (chapitre 19) — seule la structure interne du code change, jamais la procédure de déploiement, de reverse proxy ou de sécurisation.

## ✅ Checklist avant de passer au chapitre 21

- [ ] Je sais identifier, pour n'importe quel framework Node, si une différence affecte le déploiement ou seulement le code source.

---

## Glossaire du chapitre

**Module (NestJS)**
Définition simple : un regroupement organisé de fonctionnalités liées.
Définition technique : une classe décorée `@Module()` regroupant contrôleurs, services et fournisseurs liés à un même domaine métier.
Voir : Chapitre 20, section "Ce qui diffère".

## ❓ FAQ

**Faut-il préférer NestJS à Express pour un nouveau projet ?**
Cela dépend de la taille de l'équipe et de la complexité attendue — hors du périmètre de ce manuel, centré sur le déploiement, identique dans les deux cas.

## Références officielles

NestJS Documentation — [docs.nestjs.com](https://docs.nestjs.com)

## Conclusion

Le chapitre 21 introduit une variation plus significative : le rendu serveur avec Next.js, cette fois entièrement conteneurisé avec Docker Compose.

---

⬅️ [Chapitre 19 — React + Express + PostgreSQL](19-etude-de-cas-react-express-postgresql.md) · ➡️ **Suite : Chapitre 21 — Next.js + Prisma + Docker**
