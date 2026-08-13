# Chapitre 38 — Tour d'horizon : Docker pour Node.js, React/Vite, NestJS, Python, Java

**Niveau : Intermédiaire → Avancé**

---

## Introduction

Ce chapitre ouvre la Partie IX avec un vrai tour d'horizon, pas une redite. Node.js/Express, React/Vite, MySQL et PostgreSQL sont déjà couverts en profondeur (chapitres 14 à 17) — ce chapitre s'y réfère directement plutôt que de répéter. Il ajoute ce qui manquait encore : NestJS et un patron Python générique, avant que les chapitres 39 et 40 n'approfondissent respectivement Java/Spring Boot et Django.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- retrouver rapidement le bon chapitre de référence pour chaque stack déjà couverte ;
- dockeriser une application NestJS avec un build multi-étapes adapté à sa compilation TypeScript ;
- dockeriser une application Python générique avec un vrai serveur de production (Gunicorn), pas le serveur de développement intégré ;
- reconnaître que le patron Docker (multi-stage, `USER` non-root, `.dockerignore`, healthcheck) reste **identique** d'une stack à l'autre, seuls les détails de langage changent.

## 📋 Prérequis

Chapitre 20 (pour la vue d'ensemble d'une application assemblée) ; les chapitres 14-17 sont directement référencés.

## Pourquoi ce chapitre est important

Un développeur qui a compris Docker sur une seule stack (Node.js, dans ce manuel) doit pouvoir appliquer le même raisonnement à n'importe quelle autre — ce chapitre le prouve explicitement, plutôt que de le laisser supposé.

---

## Concepts fondamentaux

1. **Ce qui ne change jamais** — le patron Docker, quelle que soit la stack.
2. **NestJS** — Node.js, avec une étape de compilation.
3. **Python générique** — `pip`, et un vrai serveur de production.
4. **Où trouver chaque stack** — table de référence complète.

---

## 38.1 Ce qui ne change jamais entre les stacks

Quelle que soit la stack, le patron reste le même :
```text
1. Choisir une image de base officielle, avec un tag précis (chapitre 5)
2. .dockerignore adapté au langage (chapitre 7, 14)
3. Installer les dépendances AVANT de copier le reste du code (cache, chapitre 7)
4. Multi-stage si une étape de compilation existe (chapitre 15, 25)
5. USER non-root (chapitre 6, 26)
6. HEALTHCHECK cohérent avec une vraie route de santé (chapitre 6, 21)
7. Jamais de secret en dur (chapitre 9, 26)
```

> 📌 **À retenir** — Ce chapitre applique cette même liste, déjà acquise, à deux nouvelles stacks — la nouveauté n'est jamais dans le raisonnement, seulement dans les commandes propres à chaque écosystème.

---

## 38.2 Node.js/Express et React/Vite : renvoi direct

> Pour Node.js/Express, voir le **chapitre 14** (Dockerfile complet, `npm ci`, `--omit=dev`, `.dockerignore`).
> Pour React/Vite, voir le **chapitre 15** (multi-stage build, variables au build-time, `try_files` pour le routage côté client).

---

## 38.3 NestJS : Node.js, avec compilation

NestJS est un framework Node.js structuré (modules, décorateurs, injection de dépendances), mais reste **exécuté par Node.js** — la vraie différence pour Docker est sa compilation TypeScript obligatoire vers JavaScript avant exécution.

```dockerfile
# Étape 1 : compiler TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : exécuter uniquement le résultat compilé
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

**Explication :** exactement le multi-stage backend du chapitre 25 (section 25.4), appliqué ici concrètement à NestJS — `npm run build` invoque le compilateur NestJS (`nest build`), produisant `dist/main.js`, seul fichier réellement nécessaire à l'exécution.

> 📌 **À retenir** — Rien de conceptuellement nouveau pour qui a lu le chapitre 25 — NestJS confirme simplement que le patron "multi-stage pour tout langage compilé" s'applique bien au-delà d'un seul exemple isolé.

---

## 38.4 Python générique : `pip` et un vrai serveur de production

```text
app-python/
├── app.py
├── requirements.txt
└── Dockerfile
```

```text
# [requirements.txt]
flask==3.0.3
gunicorn==22.0.0
```

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
USER nobody
HEALTHCHECK --interval=10s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

**Explication, ligne par ligne :**
```text
python:3.12-slim
→ équivalent Python de "node:20-alpine" (chapitre 5) : une base réduite,
  plus légère que l'image Python complète, tout en restant compatible
  avec la majorité des paquets (contrairement à Alpine, "slim" reste
  basé sur Debian, évitant les problèmes de compatibilité musl/glibc
  du chapitre 25 pour les paquets Python avec extensions natives)

pip install --no-cache-dir
→ équivalent Python de "npm ci --omit=dev" (chapitre 14) et de
  "apk add --no-cache" (chapitre 25) : installe les dépendances
  sans laisser de cache inutile dans la couche de l'image

gunicorn --bind 0.0.0.0:8000 app:app
→ Gunicorn est un VRAI serveur de production WSGI — jamais le serveur
  de développement intégré à Flask (app.run()), qui affiche lui-même
  un avertissement explicite contre son usage en production, exactement
  la même distinction que "node server.js" vs "nodemon" au chapitre 28
```

> 📌 **À retenir** — Le réflexe "jamais le serveur de développement en production" (déjà vu implicitement au chapitre 28 avec `nodemon`) se retrouve à l'identique dans l'écosystème Python — Gunicorn (ou Uvicorn pour une application asynchrone) joue exactement le rôle que joue `node` seul, sans `nodemon`, pour une image de production Node.js.

---

## 38.5 MySQL et PostgreSQL : renvoi direct

> Pour MySQL, voir le **chapitre 16** (variables d'environnement, scripts d'initialisation, `my.cnf`).
> Pour PostgreSQL, voir le **chapitre 17** (variables d'environnement, `PGDATA`, comparatif avec MySQL).

---

## 38.6 Table de référence complète

| Stack | Chapitre |
|---|---|
| Node.js / Express | 14 |
| React / Vite | 15 |
| NestJS | 38 (ce chapitre) |
| Python générique (Flask/Gunicorn) | 38 (ce chapitre) |
| Django | 40 (étude de cas approfondie) |
| Java / Spring Boot | 39 (étude de cas approfondie) |
| MySQL | 16 |
| PostgreSQL | 17 |
| Redis | 18 |
| Nginx (reverse proxy) | 19 |

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Image NestJS volumineuse, avec le compilateur TypeScript inclus en production | Absence de multi-stage build | Appliquer le patron de la section 38.3 |
| Application Python "qui marche" mais lente et instable sous charge réelle | Serveur de développement Flask utilisé en production | Toujours Gunicorn (ou Uvicorn) en production |
| Confusion `python:slim` vs `python:alpine` | Croyance qu'Alpine est toujours le bon choix, sans vérification | Rappel du chapitre 25 : `slim` évite souvent des problèmes de compatibilité `musl` pour l'écosystème Python spécifiquement |
| `pip install` sans `--no-cache-dir` | Réflexe absent, contrairement à `npm ci` déjà maîtrisé | Toujours l'ajouter, exactement le même raisonnement que le chapitre 25 |

---

## Laboratoire pratique n°1 — Dockeriser une API NestJS minimale

**Objectifs :** exécuter la section 38.3.
**Prérequis :** Chapitre 25.

**Étapes :** crée ou réutilise un projet NestJS minimal, applique le Dockerfile multi-stage, compare sa taille à une version construite en une seule étape (naïve, comme au laboratoire 2 du chapitre 15).

**Résultat attendu :** une réduction de taille mesurable, cohérente avec les résultats déjà obtenus au chapitre 15 pour React.

---

## Laboratoire pratique n°2 — Dockeriser une API Python avec Gunicorn

**Objectifs :** exécuter la section 38.4.
**Prérequis :** Laboratoire 1 complété.

**Étapes :** construis l'image Python de la section 38.4, lance-la, vérifie qu'elle répond correctement, puis remplace temporairement `gunicorn` par le serveur de développement Flask (`flask run`) pour observer l'avertissement explicite qu'il affiche contre un usage en production.

**Résultat attendu :** une compréhension directe, pas seulement affirmée, de la distinction serveur de développement/production, transposée à un nouvel écosystème.

---

## Laboratoire pratique n°3 — Construire sa propre table de référence

**Objectifs :** consolider la section 38.6 pour un usage futur personnel.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** pour chaque stack de la table de la section 38.6, note en une phrase le point le plus important à retenir (le piège principal ou la bonne pratique clé) de son chapitre respectif.

**Résultat attendu :** une fiche de référence personnelle et compacte, réutilisable comme aide-mémoire.

---

## Exercices

1. Pourquoi NestJS nécessite-t-il un multi-stage build, contrairement à l'Express simple du chapitre 14 ?
2. Quelle est l'analogie entre `npm ci --omit=dev`, `apk add --no-cache` et `pip install --no-cache-dir` ?
3. Pourquoi `python:slim` est-il parfois préféré à `python:alpine`, contrairement à la préférence générale pour Alpine du chapitre 25 ?
4. Quel rôle joue Gunicorn, comparé à `node` seul pour une image de production Node.js ?
5. Pourquoi ce chapitre ne réexplique-t-il pas Node.js/Express ni React/Vite en détail ?

---

## Quiz

**Question 1.** NestJS, pour Docker, nécessite principalement :
a) Un runtime totalement différent de Node.js
b) Un multi-stage build pour gérer sa compilation TypeScript
c) Une image de base spécifique introuvable sur Docker Hub
d) Aucune particularité par rapport à Express

**Question 2.** `pip install --no-cache-dir` sert le même objectif que :
a) `docker rmi`
b) `npm ci --omit=dev` et `apk add --no-cache`
c) `docker compose down`
d) `USER non-root`

**Question 3.** Gunicorn, dans une image Python de production :
a) Remplace Python lui-même
b) Joue le rôle d'un vrai serveur de production, contrairement au serveur de développement intégré à Flask
c) Sert uniquement au débogage
d) N'a aucun rapport avec la production

**Question 4.** `python:3.12-slim`, comparé à `python:3.12-alpine` :
a) Est toujours plus volumineux sans aucun avantage
b) Peut éviter des problèmes de compatibilité liés à `musl` pour certains paquets Python
c) N'existe pas réellement
d) Est incompatible avec Docker

**Question 5.** Ce chapitre renvoie directement aux chapitres 14 à 17 pour :
a) Redéfinir entièrement ces stacks
b) Éviter de répéter un contenu déjà couvert en profondeur
c) Signaler qu'elles sont obsolètes
d) Introduire une syntaxe totalement différente

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Le patron Docker (image de base précise, `.dockerignore`, cache de build, multi-stage si compilation, `USER` non-root, `HEALTHCHECK`, jamais de secret en dur) reste identique d'une stack à l'autre — seuls les détails de commandes changent.
- NestJS, bien qu'un framework structuré, reste du Node.js — sa seule particularité Docker notable est sa compilation TypeScript, gérée par un multi-stage build identique dans son principe à celui du chapitre 15/25.
- Python suit les mêmes réflexes que Node.js : `pip install --no-cache-dir` (comme `npm ci`), et surtout un vrai serveur de production (Gunicorn) à la place du serveur de développement, la même distinction que `nodemon` vs `node` au chapitre 28.
- Node.js/Express, React/Vite, MySQL et PostgreSQL restent couverts par leurs chapitres dédiés (14 à 17), jamais répétés ici.

## ✅ Checklist avant de passer au chapitre 39

- [ ] Je sais dockeriser NestJS avec un multi-stage build adapté à sa compilation.
- [ ] Je sais dockeriser une application Python avec Gunicorn, jamais le serveur de développement.
- [ ] Je peux retrouver rapidement le chapitre de référence pour n'importe quelle stack de ce manuel.
- [ ] Je reconnais que le raisonnement Docker ne change jamais, seulement les commandes spécifiques à chaque langage.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**WSGI**
Définition simple : le standard d'interface entre un serveur web et une application Python synchrone (comme Flask/Django).
Voir : Chapitre 38, section 38.4.

**Gunicorn**
Définition simple : un serveur d'application Python de production, implémentant le standard WSGI.
Voir : Chapitre 38, section 38.4.

---

## ❓ FAQ

**Ce chapitre couvre-t-il Vue ou Angular, au-delà de React ?**
Non explicitement, mais le patron du chapitre 15 (multi-stage, `try_files`, variables au build-time) s'applique de façon quasiment identique — seule la commande de build et le dossier de sortie changent d'un framework frontend à l'autre.

**Pourquoi Django n'a-t-il pas son propre patron ici, contrairement à NestJS ?**
Parce que Django bénéficie d'une étude de cas complète et approfondie au chapitre 40 (avec PostgreSQL, Redis et Nginx assemblés), un traitement plus riche que le survol de ce chapitre — la même raison pour laquelle Java/Spring Boot est approfondi séparément au chapitre 39.

**Uvicorn est-il différent de Gunicorn ?**
Oui — Uvicorn sert les applications Python **asynchrones** (ASGI, comme FastAPI), quand Gunicorn sert nativement WSGI (synchrone). Les deux peuvent même être combinés (Gunicorn pilotant des workers Uvicorn) — un détail avancé, mentionné ici pour référence, non développé davantage.

---

## Références officielles

- Documentation NestJS — [docs.nestjs.com](https://docs.nestjs.com)
- Image officielle Python — [hub.docker.com/_/python](https://hub.docker.com/_/python)
- Gunicorn — [gunicorn.org](https://gunicorn.org)

---

## Conclusion

Le raisonnement Docker de ce manuel vient d'être vérifié transférable, concrètement, à deux nouvelles stacks. Les chapitres 39 et 40 vont plus loin, avec deux études de cas complètes — Java/Spring Boot, puis Django — assemblées avec une vraie base de données et, pour Django, Redis et Nginx.

---

⬅️ [Chapitre 37 — Architecture microservices](37-architecture-microservices.md) · ➡️ **Suite : Chapitre 39 — Étude de cas : Java Spring Boot + PostgreSQL**
