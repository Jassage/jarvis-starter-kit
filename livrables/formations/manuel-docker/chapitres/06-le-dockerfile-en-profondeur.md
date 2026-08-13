# Chapitre 6 — Le Dockerfile en profondeur

**Niveau : Débutant → Intermédiaire**

---

## Introduction

Ce chapitre est le plus dense du manuel jusqu'ici : il détaille, une par une, les douze instructions qui composent le vocabulaire d'un Dockerfile. Chaque instruction est illustrée par un exemple isolé et court — le chapitre 7 assemblera ensuite un projet complet et fonctionnel, et le chapitre 14 ira plus loin avec une vraie API Node.js. Ici, l'objectif est de comprendre **ce que fait chaque ligne**, pas encore de construire une application entière.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- expliquer le rôle précis de `FROM`, `WORKDIR`, `COPY`, `ADD`, `RUN`, `ENV`, `ARG`, `EXPOSE`, `USER`, `CMD`, `ENTRYPOINT`, `HEALTHCHECK` ;
- choisir entre `COPY` et `ADD`, et justifier ce choix ;
- distinguer `ARG` (disponible seulement à la construction) de `ENV` (disponible aussi à l'exécution) ;
- expliquer pourquoi `EXPOSE` ne publie aucun port à lui seul ;
- distinguer la forme *shell* et la forme *exec* d'une instruction, et pourquoi la forme exec est généralement préférable ;
- combiner `ENTRYPOINT` et `CMD` pour définir un point d'entrée fixe avec des arguments par défaut modifiables.

## 📋 Prérequis

Chapitres 4 et 5 (conteneurs, images).

## Pourquoi ce chapitre est important

Le Dockerfile est le document le plus réutilisé de tout ce manuel — chaque chapitre de la Partie IV (dockeriser Node, React, MySQL, PostgreSQL...) en écrit un nouveau, en s'appuyant sur ce vocabulaire sans le redéfinir. Une instruction mal comprise ici (confondre `CMD` et `ENTRYPOINT`, ou croire qu'`EXPOSE` ouvre un port) se traduit directement par un bug ou une image mal conçue plus loin dans le manuel.

---

## Concepts fondamentaux

Douze instructions, groupées par rôle :

1. **Origine et structure** — `FROM`, `WORKDIR`.
2. **Apporter du contenu** — `COPY`, `ADD`.
3. **Construire** — `RUN`.
4. **Configurer** — `ENV`, `ARG`.
5. **Documenter et sécuriser** — `EXPOSE`, `USER`.
6. **Démarrer** — `CMD`, `ENTRYPOINT`.
7. **Surveiller** — `HEALTHCHECK`.

---

## 6.1 `FROM` : choisir une image de base

```dockerfile
FROM node:20
```

**Explication :** `FROM` est presque toujours la **première** instruction d'un Dockerfile. Elle définit l'image de base sur laquelle toutes les instructions suivantes viennent s'empiler (chapitre 1, section 1.3 — les couches).

> ⚠️ **Attention** — Rappel du chapitre 5 : toujours préciser un tag de version explicite (`node:20`, jamais `node` seul ni `node:latest`) pour garantir une construction reproductible dans le temps.

Un Dockerfile peut contenir plusieurs `FROM` — c'est la base des **builds multi-étapes**, introduits brièvement ici et détaillés en profondeur au chapitre 15 (Dockeriser React).

```dockerfile
FROM node:20 AS build
# ... étapes de construction ...

FROM nginx:1.27
# ... étape finale, plus légère ...
```

**Explication :** `AS build` donne un nom à cette étape, réutilisable plus loin dans le même Dockerfile (`COPY --from=build`, vu au chapitre 15) — un mécanisme qui permet de ne conserver, dans l'image finale, que le strict résultat d'une étape de construction, sans tout l'outillage utilisé pour y arriver.

---

## 6.2 `WORKDIR` : définir le dossier de travail

```dockerfile
FROM node:20
WORKDIR /app
```

**Explication :** `WORKDIR` fixe le dossier courant à l'intérieur de l'image pour **toutes les instructions suivantes** (`COPY`, `RUN`, `CMD`...) — équivalent d'un `cd /app` qui resterait actif jusqu'à la fin du fichier, ou jusqu'à un nouveau `WORKDIR`.

> ✅ **Bonne pratique** — Toujours utiliser `WORKDIR` plutôt que d'enchaîner des `RUN cd /app && ...` : chaque instruction `RUN` s'exécute dans un processus séparé (section 6.4), donc un `cd` fait dans une instruction `RUN` ne survit jamais à l'instruction suivante. `WORKDIR`, lui, est une propriété persistante de l'image en construction.

> 📌 **À retenir** — Si le dossier indiqué par `WORKDIR` n'existe pas encore dans l'image, Docker le crée automatiquement.

---

## 6.3 `COPY` et `ADD` : apporter du contenu dans l'image

```dockerfile
COPY package.json package-lock.json ./
COPY . .
```

**Explication :**
```text
COPY source destination
→ copie des fichiers/dossiers depuis le contexte de build (le dossier où "docker build" est lancé, détaillé au chapitre 7)
   vers l'intérieur de l'image, à l'emplacement défini par WORKDIR (ici, "./" = "/app")
```

`ADD` fait globalement la même chose que `COPY`, avec deux capacités supplémentaires : extraire automatiquement une archive `.tar` copiée localement, et télécharger un fichier depuis une URL.

| Cas d'usage | Instruction recommandée |
|---|---|
| Copier des fichiers ou dossiers du projet | `COPY` |
| Extraire automatiquement une archive locale dans l'image | `ADD` (seul cas légitime) |
| Télécharger un fichier distant pendant le build | Ni l'un ni l'autre — préférer `RUN curl`/`wget` (traçable, gérable en cache, chapitre 25) |

> ⚠️ **Attention** — Le comportement "spécial" d'`ADD` (extraction automatique, téléchargement d'URL) est une source fréquente de surprises : un fichier `.tar.gz` copié avec `ADD` est silencieusement décompressé dans l'image, ce qui n'est presque jamais l'intention réelle du développeur qui voulait juste copier une archive telle quelle.

> ✅ **Bonne pratique** — Utiliser systématiquement `COPY`, sauf besoin explicite et conscient de l'extraction automatique d'`ADD`. C'est la recommandation de la documentation officielle Docker elle-même, reprise au chapitre 25.

---

## 6.4 `RUN` : exécuter une commande pendant la construction

```dockerfile
RUN npm install
RUN apt-get update && apt-get install -y curl
```

**Explication :** `RUN` exécute une commande **au moment de la construction de l'image** (`docker build`), et son résultat (les fichiers créés, les paquets installés) est capturé dans une nouvelle couche de l'image (chapitre 1, section 1.3 ; chapitre 5, section 5.7).

> ⚠️ **Attention — piège très fréquent** — Chaque instruction `RUN` s'exécute dans un environnement isolé de la précédente. `RUN cd /tmp` suivi d'un second `RUN pwd` affichera `/app` (ou le `WORKDIR` défini), **pas** `/tmp` — le changement de dossier de la première ligne ne survit pas à la seconde. Pour enchaîner plusieurs commandes qui dépendent les unes des autres dans un même contexte shell, les combiner sur une seule ligne `RUN` avec `&&` :

```dockerfile
# ❌ Le "cd /tmp" de cette ligne n'a aucun effet sur la suivante
RUN cd /tmp
RUN pwd

# ✅ Les deux commandes partagent le même processus shell
RUN cd /tmp && pwd
```

> 📌 **À retenir** — Combiner plusieurs commandes liées sur une seule ligne `RUN` avec `&&` n'est pas qu'une question de fonctionnement correct — c'est aussi ce qui limite le nombre de couches créées, un point approfondi au chapitre 25 (optimisation).

---

## 6.5 `ENV` et `ARG` : deux façons de paramétrer, deux portées différentes

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}

ENV NODE_ENV=production
```

**Différence fondamentale**, souvent confondue par un débutant :

| | `ARG` | `ENV` |
|---|---|---|
| Disponible pendant `docker build` | Oui | Oui |
| Disponible dans le conteneur en cours d'exécution | **Non** | **Oui** |
| Modifiable au moment du build | `docker build --build-arg NODE_VERSION=18` | Non (fixé dans le Dockerfile) |
| Modifiable au moment du run | Non (le build est déjà terminé) | `docker run -e NODE_ENV=development` (chapitre 9) |
| Cas d'usage typique | Choisir une version de base, un chemin de build | Configuration de l'application elle-même |

> 💡 **Analogie** — `ARG`, ce sont les instructions données au cuisinier **pendant** la préparation du plat ("utilise du sel fin, pas du gros sel") — une fois le plat servi, ces instructions n'ont plus de sens et ne sont plus visibles. `ENV`, ce sont les instructions écrites **sur l'étiquette du plat lui-même** ("à conserver à 4°C") — elles restent attachées et lisibles même une fois le plat sorti de la cuisine.

> ⚠️ **Attention** — Ne **jamais** placer un secret (mot de passe, clé d'API) dans `ARG` ou `ENV` à l'intérieur d'un Dockerfile versionné : les deux restent visibles dans l'historique de l'image (`docker history`, chapitre 5) et dans le Dockerfile lui-même sur Git. Ce point est développé en profondeur au chapitre 9 (variables d'environnement et secrets) et au chapitre 26 (sécurité).

---

## 6.6 `EXPOSE` : documenter, pas publier

```dockerfile
EXPOSE 3000
```

**Explication :** `EXPOSE` déclare, **à titre informatif**, que l'application à l'intérieur du conteneur écoute sur le port 3000. C'est une documentation lisible par Docker et par les humains qui lisent le Dockerfile — **elle ne rend le port accessible depuis l'extérieur du conteneur d'aucune façon**.

> ❌ **Erreur fréquente, très répandue** — Croire qu'ajouter `EXPOSE 3000` au Dockerfile suffit à rendre l'application joignable depuis le navigateur. C'est faux : seule l'option `-p` (ou `--publish`) de `docker run`, ou l'équivalent `ports:` en Compose, publie réellement un port vers l'hôte — sujet complet du chapitre 8. `EXPOSE` sans `-p` correspondant laisse le conteneur totalement injoignable depuis l'extérieur.

> 📌 **À retenir** — `EXPOSE` = une note collée sur la porte ("il y a une sortie ici"). `-p` = la clé qui ouvre réellement cette porte depuis l'extérieur. Les deux sont utiles ensemble, mais un seul des deux ne suffit jamais.

---

## 6.7 `USER` : ne pas rester root par défaut

```dockerfile
FROM node:20
# ... installation ...
USER node
```

**Explication :** sans `USER` explicite, un conteneur exécute son processus principal en tant que `root` par défaut — un risque de sécurité détaillé au chapitre 26. `USER` change l'utilisateur effectif pour toutes les instructions suivantes (`RUN`, et le processus final lancé par `CMD`/`ENTRYPOINT`).

> ✅ **Bonne pratique** — De nombreuses images officielles (dont `node`) fournissent déjà un utilisateur non-root prêt à l'emploi (`node` dans le cas de l'image Node.js officielle) — l'utiliser plutôt que de rester en `root` par défaut est une modification d'une seule ligne, à fort impact sur la sécurité. Approfondi au chapitre 26.

---

## 6.8 `CMD` et `ENTRYPOINT` : démarrer le conteneur

C'est la paire d'instructions la plus mal comprise du Dockerfile — parce que les deux peuvent, en apparence, servir au même but (définir ce qui s'exécute au démarrage du conteneur), mais avec une différence de comportement capitale.

### Forme *shell* vs forme *exec*

```dockerfile
# Forme shell — exécutée via /bin/sh -c
CMD npm start

# Forme exec — exécutée directement, SANS shell intermédiaire (recommandée)
CMD ["npm", "start"]
```

> ⚠️ **Attention** — La forme *shell* passe la commande à travers un interpréteur shell intermédiaire (`/bin/sh -c "npm start"`), ce qui signifie que le processus réellement lancé par Docker (le "PID 1" du conteneur) est ce shell, pas directement `npm`. Conséquence concrète : les signaux d'arrêt envoyés par `docker stop` (chapitre 4) peuvent ne pas être transmis correctement au vrai processus applicatif, retardant l'arrêt jusqu'au délai forcé de 10 secondes. La forme **exec** (avec des crochets `["...", "..."]`) exécute directement le programme sans shell intermédiaire, et propage correctement les signaux — c'est la forme recommandée par défaut.

### `CMD` seul

```dockerfile
CMD ["node", "server.js"]
```

**Explication :** définit la commande par défaut exécutée au démarrage du conteneur. Elle peut être **entièrement remplacée** en passant une commande à `docker run` :

```bash
# [Terminal] — remplace complètement le CMD du Dockerfile
docker run mon-image node autre-script.js
```

### `ENTRYPOINT` seul

```dockerfile
ENTRYPOINT ["node", "server.js"]
```

**Explication :** définit une commande **fixe**, qui ne peut pas être remplacée aussi simplement — tout ce qui est passé après le nom de l'image dans `docker run` est ajouté **en argument** à l'`ENTRYPOINT`, plutôt que de le remplacer.

### `ENTRYPOINT` + `CMD` combinés (le patron le plus utile)

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

**Explication :** `ENTRYPOINT` fixe le programme exécuté (`node`, toujours), `CMD` fournit l'argument par défaut (`server.js`), **modifiable** au lancement :

```bash
# [Terminal] — utilise le CMD par défaut ("server.js")
docker run mon-image

# [Terminal] — remplace uniquement le CMD ("server.js" devient "worker.js"), ENTRYPOINT reste "node"
docker run mon-image worker.js
```

| Configuration | `docker run mon-image` | `docker run mon-image autre-arg` |
|---|---|---|
| `CMD ["node", "server.js"]` seul | exécute `node server.js` | exécute **uniquement** `autre-arg` (tout le CMD est remplacé, souvent une erreur "autre-arg: command not found") |
| `ENTRYPOINT ["node"]` seul | exécute `node` (sans argument, probablement une erreur) | exécute `node autre-arg` |
| `ENTRYPOINT ["node"]` + `CMD ["server.js"]` | exécute `node server.js` | exécute `node autre-arg` |

> 📌 **À retenir** — Utiliser `CMD` seul quand toute la commande doit pouvoir être librement remplacée au lancement. Utiliser `ENTRYPOINT` + `CMD` combinés quand le programme lui-même est fixe (toujours `node`, toujours un script Python précis) mais que ses arguments doivent rester ajustables.

---

## 6.9 `HEALTHCHECK` : un aperçu (détail complet au chapitre 21)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1
```

**Explication rapide :** `HEALTHCHECK` définit une commande que Docker exécute périodiquement à l'intérieur du conteneur pour juger s'il est réellement "en bonne santé" (pas seulement "démarré") — un conteneur peut tourner (`Running`) tout en étant fonctionnellement cassé (par exemple, incapable de répondre aux requêtes). Le statut apparaît dans `docker ps` (`healthy`/`unhealthy`).

> Cette instruction est reprise en détail, avec un vrai laboratoire pratique et son usage combiné à `depends_on` en Compose, au **chapitre 21**.

---

## 6.10 Dockerfile complet, toutes les instructions réunies

```dockerfile
# Étape de construction
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape finale
FROM node:20-alpine
ARG APP_VERSION=1.0.0
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
ENTRYPOINT ["node"]
CMD ["dist/server.js"]
```

**Lecture ligne par ligne, en s'appuyant sur tout le chapitre :** une première étape (`AS build`) installe les dépendances et construit l'application avec l'outillage complet de Node.js ; une seconde étape (`node:20-alpine`, plus légère) ne récupère que le strict résultat de la première (`COPY --from=build`, chapitre 15 pour le détail) ; `ARG`/`ENV` paramètrent respectivement le build et l'exécution ; `EXPOSE` documente le port sans le publier ; `USER node` évite de tourner en root ; `HEALTHCHECK` surveille l'application ; `ENTRYPOINT`/`CMD` combinés fixent `node` comme programme, avec `dist/server.js` comme argument par défaut modifiable.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Un `cd` dans un `RUN` semble "ne rien faire" à l'instruction suivante | Chaque `RUN` est un processus isolé | Combiner sur une seule ligne avec `&&`, ou utiliser `WORKDIR` |
| L'application reste injoignable malgré `EXPOSE` | `EXPOSE` ne publie aucun port | Ajouter `-p` au `docker run` (chapitre 8) |
| `docker run mon-image un-argument` échoue de façon inattendue | `CMD` seul est entièrement remplacé par l'argument passé | Utiliser `ENTRYPOINT` + `CMD` combinés si seul un argument doit varier |
| Le conteneur met 10 secondes à s'arrêter à chaque `docker stop` | Forme shell (`CMD npm start`) au lieu de la forme exec | Utiliser la forme exec `CMD ["npm", "start"]` |
| Un secret apparaît dans `docker history` | Secret placé dans `ARG` ou `ENV` en dur dans le Dockerfile | Ne jamais coder un secret en dur ; voir chapitres 9 et 26 |

---

## Laboratoire pratique n°1 — Observer l'effet (ou l'absence d'effet) de `WORKDIR` et `RUN cd`

**Objectifs :** vérifier par l'expérience le piège de la section 6.4.
**Prérequis :** Docker installé.

**Étapes :**
1. Crée un dossier de test avec un fichier `Dockerfile` contenant :
```dockerfile
FROM alpine
RUN cd /tmp
RUN pwd > /preuve.txt
CMD cat /preuve.txt
```
2. Construis l'image (`docker build -t test-workdir .` — la commande complète est détaillée au chapitre 7).
3. Lance un conteneur (`docker run test-workdir`) et observe le contenu affiché.

**Résultat attendu :** le fichier affiche `/`, pas `/tmp` — confirmant que le `cd` de la première instruction `RUN` n'a eu aucun effet sur la suivante.

---

## Laboratoire pratique n°2 — Comparer `CMD` seul et `ENTRYPOINT` + `CMD`

**Objectifs :** ressentir concrètement le tableau de la section 6.8.
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. Construis une image avec seulement `CMD ["echo", "bonjour"]`.
2. Lance-la sans argument, puis avec un argument (`docker run image au-revoir`) et observe le résultat.
3. Modifie le Dockerfile pour `ENTRYPOINT ["echo"]` + `CMD ["bonjour"]`, reconstruis, et répète le test.

**Résultat attendu :** dans le premier cas, l'argument remplace tout ("au-revoir" seul, souvent une erreur pour une vraie commande) ; dans le second, l'argument ne remplace que le `CMD` ("echo au-revoir").

---

## Laboratoire pratique n°3 — Confirmer qu'`EXPOSE` seul ne publie rien

**Objectifs :** vérifier de façon irréfutable la mise en garde de la section 6.6, avant même d'avoir vu le chapitre 8.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :**
1. Construis une image minimale avec `EXPOSE 8080` et un serveur simple (ou réutilise une image existante comme `nginx`, qui déclare déjà `EXPOSE 80`).
2. Lance-la **sans** `-p` (`docker run -d nginx`).
3. Essaie d'accéder à `http://localhost:80` (ou 8080) depuis ton navigateur ou `curl`.

**Résultat attendu :** aucune réponse — le port n'est pas accessible depuis l'hôte, malgré `EXPOSE`. Ce laboratoire sera repris et complété au chapitre 8 avec l'ajout de `-p`.

---

## Exercices

1. Explique pourquoi `RUN cd /app && npm install` fonctionne, alors que deux `RUN` séparés (`RUN cd /app` puis `RUN npm install`) ne fonctionnent pas comme attendu.
2. Un Dockerfile contient `ARG DB_PASSWORD`. Cette valeur est-elle visible dans le conteneur en cours d'exécution ? Justifie.
3. Pourquoi la forme exec (`CMD ["npm", "start"]`) est-elle préférable à la forme shell (`CMD npm start`) ?
4. Que se passe-t-il si on lance `docker run mon-image script-different.js` sur une image dont le Dockerfile ne contient que `CMD ["node", "server.js"]` (sans `ENTRYPOINT`) ?
5. Pourquoi `USER node` en fin de Dockerfile est-il considéré comme une bonne pratique de sécurité ?

---

## Quiz

**Question 1.** `EXPOSE 3000` dans un Dockerfile :
a) Publie automatiquement le port 3000 vers l'extérieur du conteneur
b) Documente le port utilisé par l'application, sans le publier
c) Empêche tout accès au port 3000
d) N'a aucun effet, c'est une instruction obsolète

**Question 2.** La différence entre `ARG` et `ENV` est :
a) Aucune, ce sont des synonymes
b) `ARG` n'est disponible qu'au moment du build, `ENV` reste disponible dans le conteneur en cours d'exécution
c) `ENV` n'est disponible qu'au moment du build, `ARG` reste disponible à l'exécution
d) `ARG` sert uniquement aux secrets

**Question 3.** Avec `ENTRYPOINT ["node"]` et `CMD ["server.js"]`, la commande `docker run mon-image worker.js` exécute :
a) `node server.js worker.js`
b) `worker.js` seul
c) `node worker.js`
d) Une erreur systématique

**Question 4.** La forme exec (`CMD ["npm", "start"]`) est préférable à la forme shell parce que :
a) Elle est plus courte à écrire
b) Elle propage correctement les signaux d'arrêt au processus applicatif
c) Elle seule permet d'utiliser des variables d'environnement
d) Elle est obligatoire depuis Docker 20

**Question 5.** `COPY` est préféré à `ADD` par défaut parce que :
a) `ADD` est plus lent
b) `ADD` a des comportements implicites (extraction d'archive, téléchargement d'URL) souvent non désirés
c) `COPY` fonctionne uniquement avec des fichiers texte
d) `ADD` est obsolète et ne fonctionne plus

> 🔑 **Corrigé** — 1: b · 2: b · 3: c · 4: b · 5: b

---

## 📝 Résumé du chapitre

- `FROM` fixe l'image de base (avec tag précis, jamais `latest`) ; `WORKDIR` fixe le dossier de travail pour toutes les instructions suivantes.
- `COPY` est le choix par défaut pour apporter des fichiers ; `ADD` n'est justifié que pour son extraction automatique d'archives.
- Chaque `RUN` s'exécute dans un processus isolé — enchaîner des commandes dépendantes exige `&&` sur une même ligne.
- `ARG` n'existe qu'au moment du build ; `ENV` persiste dans le conteneur en cours d'exécution — aucun des deux ne doit jamais contenir un secret en dur.
- `EXPOSE` documente un port sans jamais le publier — seul `-p` au lancement (chapitre 8) rend un port réellement accessible depuis l'hôte.
- `USER` évite de tourner en root par défaut.
- `CMD` seul est entièrement remplaçable au lancement ; `ENTRYPOINT` + `CMD` combinés fixent le programme tout en laissant ses arguments modifiables — la forme exec (crochets) est toujours préférable à la forme shell.
- `HEALTHCHECK` surveille la santé réelle du conteneur, au-delà du simple fait qu'il tourne — détaillé au chapitre 21.

## ✅ Checklist avant de passer au chapitre 7

- [ ] Je sais expliquer le rôle de chacune des douze instructions vues dans ce chapitre.
- [ ] Je sais pourquoi `COPY` est préféré à `ADD` par défaut.
- [ ] Je sais pourquoi `EXPOSE` seul ne rend rien accessible depuis l'extérieur.
- [ ] Je sais expliquer la différence de comportement entre `CMD` seul et `ENTRYPOINT` + `CMD` combinés.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Instruction (Dockerfile)**
Définition simple : une ligne du Dockerfile qui décrit une étape de construction.
Voir : Chapitre 1, section 1.7 ; Chapitre 6, toutes sections.

**Forme shell / forme exec**
Définition simple : deux syntaxes possibles pour `RUN`, `CMD`, `ENTRYPOINT` — via un interpréteur shell intermédiaire, ou en exécution directe.
Définition technique : la forme shell (`CMD npm start`) est traduite en `/bin/sh -c "npm start"` ; la forme exec (`CMD ["npm", "start"]`) exécute directement le binaire, sans processus shell intermédiaire, avec une meilleure propagation des signaux.
Voir : Chapitre 6, section 6.8.

**Multi-stage build (build multi-étapes)**
Définition simple : un Dockerfile avec plusieurs `FROM`, où une étape peut réutiliser le résultat d'une étape précédente.
Voir : Chapitre 6, section 6.1 ; Chapitre 15.

---

## ❓ FAQ

**Peut-on avoir plusieurs instructions `CMD` dans un même Dockerfile ?**
Techniquement oui, mais seule la **dernière** a un effet — toutes les précédentes sont silencieusement ignorées. Un Dockerfile ne devrait avoir qu'un seul `CMD` (et un seul `ENTRYPOINT`) pour rester lisible.

**Que se passe-t-il si un Dockerfile n'a ni `CMD` ni `ENTRYPOINT` ?**
Le conteneur démarre et s'arrête immédiatement, sans rien exécuter — `docker run` échoue explicitement ou ne produit aucun processus actif, selon l'image de base utilisée.

**`ARG` défini avant le premier `FROM` est-il accessible partout dans le Dockerfile ?**
Non — un `ARG` déclaré avant le premier `FROM` n'est accessible que dans les lignes `FROM` elles-mêmes (pour choisir dynamiquement une image de base). Pour l'utiliser après un `FROM`, il faut le redéclarer avec `ARG` juste après ce `FROM`.

---

## Références officielles

- Référence complète du Dockerfile — [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/)
- Bonnes pratiques d'écriture d'un Dockerfile — [docs.docker.com/build/building/best-practices](https://docs.docker.com/build/building/best-practices/)
- `CMD` vs `ENTRYPOINT`, documentation officielle — [docs.docker.com/reference/dockerfile/#cmd](https://docs.docker.com/reference/dockerfile/#cmd)

---

## Conclusion

Douze instructions, chacune comprise isolément. Le chapitre 7 les assemble enfin dans un vrai projet, du dossier vide jusqu'à une image construite et un conteneur qui tourne — la première fois que tout ce vocabulaire prend forme concrètement, de tes propres mains.

---

⬅️ [Chapitre 5 — Les images Docker](05-les-images-docker.md) · ➡️ **Suite : Chapitre 7 — Premier projet : construire et lancer sa première image**
