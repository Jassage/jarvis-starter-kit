# Chapitre 14 — Dockeriser une API Node.js / Express

**Niveau : Intermédiaire**

---

## Introduction

Le backend du chapitre 13 était volontairement minimal — juste assez pour prouver que Nginx, Node et MySQL communiquaient. Ce chapitre construit une vraie API Express, avec les vrais réflexes de production : `npm ci` plutôt que `npm install`, un `.dockerignore` adapté à Node, un utilisateur non-root, et un premier aperçu honnête de la tension entre image de développement et image de production — que le chapitre 28 résoudra complètement.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- dockeriser une API Express réelle avec plusieurs routes ;
- expliquer la différence entre `npm install` et `npm ci`, et pourquoi la seconde est préférable dans un Dockerfile ;
- utiliser `--omit=dev` pour exclure les dépendances de développement d'une image de production ;
- écrire un `.dockerignore` adapté à un projet Node.js ;
- utiliser un bind mount pour itérer sur le code sans reconstruire l'image à chaque changement, et connaître les limites de cette approche.

## 📋 Prérequis

Chapitre 13. Une connaissance de base de Node.js et npm aide, sans être un prérequis strict — chaque commande est expliquée.

## Pourquoi ce chapitre est important

Node.js/Express est la stack backend la plus utilisée dans ce manuel (et dans le portefeuille de projets réels dont ce manuel s'inspire). Le patron construit ici — `npm ci`, `.dockerignore`, utilisateur non-root — est repris tel quel dans chaque projet complet de la Partie X.

---

## Concepts fondamentaux

1. **`npm ci` vs `npm install`** — reproductibilité stricte pour un environnement de build.
2. **`--omit=dev`** — une image de production sans outillage de développement.
3. **`.dockerignore` pour Node** — exclure ce qui ne doit jamais entrer dans l'image.
4. **Bind mount en développement** — ses bénéfices, et sa vraie limite.

---

## 14.1 L'API Express

```text
api-express/
├── src/
│   └── index.js
├── package.json
├── package-lock.json
├── Dockerfile
├── .dockerignore
└── .env.example
```

### `src/index.js`
```javascript
const express = require("express");
const app = express();
app.use(express.json());

const tasks = [{ id: 1, titre: "Apprendre Docker", faite: false }];

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const tache = { id: tasks.length + 1, titre: req.body.titre, faite: false };
  tasks.push(tache);
  res.status(201).json(tache);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API à l'écoute sur le port ${port}`));
```

### `package.json`
```json
{
  "name": "api-express",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.19.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

**Explication de la distinction `dependencies`/`devDependencies` :** `express` est nécessaire pour que l'application **fonctionne**, en développement comme en production. `nodemon` (rechargement automatique au changement de fichier) n'est utile qu'**en développement** — l'inclure dans une image de production ajouterait du poids et de la surface d'attaque (chapitre 26) sans aucun bénéfice réel une fois l'application déployée.

---

## 14.2 `npm ci` plutôt que `npm install`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]
```

| | `npm install` | `npm ci` |
|---|---|---|
| Respecte exactement `package-lock.json` | Peut légèrement s'en écarter (recalcule certaines résolutions) | **Oui, strictement** — installe précisément les versions verrouillées |
| Vitesse | Plus lente en général | Plus rapide (pas de résolution de dépendances à recalculer) |
| Modifie `package-lock.json` | Peut le modifier | Ne le modifie **jamais** |
| Exige un `package-lock.json` existant | Non | **Oui**, échoue sinon |
| Recommandé pour | Développement local, ajout d'une nouvelle dépendance | Construction d'image Docker, CI/CD (chapitre 31) |

> ⚠️ **Attention** — `npm ci` **supprime d'abord tout `node_modules` existant** avant de réinstaller — un détail sans conséquence dans un Dockerfile (l'image de base n'a jamais de `node_modules` préexistant), mais qui rendrait `npm ci` dangereux à lancer directement sur un poste de développement contenant des modifications locales non versionnées dans `node_modules` (un cas rare et déconseillé de toute façon).

> 📌 **À retenir** — `npm ci` dans un Dockerfile garantit que l'image construite aujourd'hui utilise **exactement** les mêmes versions de dépendances qu'hier, tant que `package-lock.json` n'a pas changé — la même philosophie de reproductibilité que "jamais `latest`" au chapitre 5, appliquée cette fois aux dépendances de l'application plutôt qu'à l'image de base.

**`--omit=dev`** exclut les paquets listés sous `devDependencies` (ici, `nodemon`) de l'installation — l'image de production ne contient que ce qui est strictement nécessaire à l'exécution.

---

## 14.3 `.dockerignore` pour un projet Node.js

```text
# [.dockerignore]
node_modules
npm-debug.log
.git
.env
*.md
.vscode
```

> ⚠️ **Attention — rappel du chapitre 7, avec un risque concret ici** — Sans `node_modules` dans `.dockerignore`, une instruction `COPY . .` copierait un `node_modules` local (potentiellement construit sur un système d'exploitation différent de celui de l'image, chapitre 2 — certains paquets npm compilent du code natif spécifique à l'OS) **par-dessus** celui, correct, que `RUN npm ci` vient d'installer à l'intérieur de l'image. Résultat possible : une application qui fonctionne sur la machine de développement mais plante dans le conteneur, pour une cause difficile à diagnostiquer sans connaître ce piège précis.

---

## 14.4 Construire et vérifier

```bash
# [Terminal] — depuis api-express/
docker build -t api-express .
docker run -d --name api -p 3000:3000 api-express
```

```bash
# [Terminal]
curl http://localhost:3000/health
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"titre":"Nouvelle tâche"}'
curl http://localhost:3000/api/tasks
```

**Résultat attendu :** `{"status":"ok"}`, la liste initiale d'une tâche, la création réussie (`201`), puis une liste de deux tâches — l'API fonctionne intégralement dans le conteneur.

---

## 14.5 Développement avec bind mount : le bénéfice et la vraie limite

```yaml
# [compose.yaml, extrait]
services:
  api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
```

**Explication :** rappel du chapitre 10 — ce bind mount synchronise `./src` (sur l'hôte) avec `/app/src` (dans le conteneur). Modifie `src/index.js`, puis :

```bash
# [Terminal]
docker compose restart api
```

**Résultat attendu :** le changement de code est pris en compte, **sans avoir reconstruit l'image** — seul un redémarrage du conteneur a suffi, parce que le fichier modifié était déjà visible à l'intérieur grâce au bind mount.

> ⚠️ **Attention — la vraie limite de ce chapitre** — Cette approche fonctionne pour du code, mais **pas** pour une modification de `package.json` (une nouvelle dépendance ajoutée) : `RUN npm ci` a été exécuté une seule fois, à la construction de l'image, et le bind mount ne synchronise que `src/`, pas `node_modules`. Ajouter une dépendance exige toujours une reconstruction (`docker compose up -d --build`). De plus, redémarrer manuellement le conteneur à chaque modification (plutôt qu'un vrai rechargement automatique via `nodemon`) reste artisanal comparé à un flux de développement professionnel complet. **Le chapitre 28** construit la solution durable : une image de développement dédiée, avec `nodemon` et toutes les `devDependencies`, distincte de l'image de production allégée construite dans ce chapitre — les deux issues du même projet, sans compromis sur l'une ou l'autre.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| "npm ci can only install packages when your package.json and package-lock.json are in sync" | `package-lock.json` absent ou désynchronisé | Committer systématiquement `package-lock.json`, lancer `npm install` en local après toute modification de `package.json` pour le régénérer |
| Application plantée dans le conteneur, fonctionnelle en local | `node_modules` local copié par-dessus celui de l'image (`.dockerignore` incomplet) | Toujours exclure `node_modules` dans `.dockerignore` |
| `nodemon: not found` en tentant d'utiliser `npm run dev` sur l'image de production | Image construite avec `--omit=dev`, donc sans `nodemon` | Normal et attendu — l'image de production n'a jamais vocation à exécuter `npm run dev` (chapitre 28 pour la bonne solution) |
| Une nouvelle dépendance ajoutée à `package.json` semble absente dans le conteneur | Bind mount limité au dossier `src/`, `RUN npm ci` non rejoué | Reconstruire l'image (`--build`) après tout changement de dépendances |

---

## Laboratoire pratique n°1 — Construire et tester l'API de bout en bout

**Objectifs :** exécuter les sections 14.1 à 14.4.
**Prérequis :** Chapitre 13.

**Étapes :** reproduis intégralement la section 14.4.

**Résultat attendu :** les quatre appels `curl` répondent tous correctement, dans l'ordre attendu.

---

## Laboratoire pratique n°2 — Comparer la taille avec et sans `--omit=dev`

**Objectifs :** rendre tangible l'intérêt de `--omit=dev` (rappel des leçons du chapitre 5 sur la taille des images).
**Prérequis :** Laboratoire 1 complété.

**Étapes :**
1. Note la taille de `api-express` (`docker images`).
2. Modifie temporairement le Dockerfile pour `RUN npm ci` (sans `--omit=dev`), reconstruis sous un autre tag (`docker build -t api-express:avec-dev .`).
3. Compare les deux tailles.

**Résultat attendu :** une différence de taille mesurable, aussi petite soit-elle sur ce projet à une seule dépendance de développement — la différence devient significative sur un vrai projet avec de nombreux outils de développement (linters, frameworks de test...).

---

## Laboratoire pratique n°3 — Modifier le code via bind mount

**Objectifs :** pratiquer et comprendre les limites de la section 14.5.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :**
1. Lance le projet via le `compose.yaml` de la section 14.5.
2. Modifie une route existante dans `src/index.js` (par exemple, le contenu renvoyé par `/health`).
3. `docker compose restart api`, puis reteste avec `curl`.
4. Ajoute une dépendance factice à `package.json` **sans** reconstruire, et constate qu'elle n'a aucun effet tant que `--build` n'est pas relancé.

**Résultat attendu :** confirmation vécue de la frontière exacte entre "un simple redémarrage suffit" et "une reconstruction est nécessaire".

---

## Exercices

1. Explique pourquoi `npm ci` est préféré à `npm install` dans un Dockerfile.
2. Que fait exactement `--omit=dev`, et pourquoi son usage a-t-il un lien avec le chapitre 26 (sécurité) ?
3. Pourquoi `node_modules` doit-il impérativement figurer dans le `.dockerignore` d'un projet Node.js ?
4. Un développeur modifie `package.json` puis redémarre simplement le conteneur (sans `--build`). Que va-t-il probablement observer ? Pourquoi ?
5. Pourquoi ce chapitre ne propose-t-il pas encore une solution complète de rechargement automatique (`nodemon`) en conteneur ?

---

## Quiz

**Question 1.** `npm ci`, comparé à `npm install` :
a) Est plus permissif et peut modifier `package-lock.json`
b) Installe strictement les versions verrouillées dans `package-lock.json`, sans le modifier
c) Ne fonctionne que hors de Docker
d) Installe toujours les `devDependencies`, sans exception

**Question 2.** `--omit=dev` :
a) Supprime le fichier `package.json` de l'image
b) Exclut les paquets listés sous `devDependencies` de l'installation
c) Empêche l'application de démarrer
d) N'a aucun effet sur la taille de l'image

**Question 3.** Ne pas exclure `node_modules` du `.dockerignore` d'un projet Node.js risque de :
a) Accélérer la construction sans risque
b) Copier un `node_modules` local par-dessus celui installé dans l'image, potentiellement incompatible
c) Empêcher totalement la construction de l'image
d) N'avoir aucun effet, `COPY` ignore toujours `node_modules`

**Question 4.** Un bind mount sur `src/` seul permet de refléter :
a) Toute modification du projet, y compris `package.json`
b) Uniquement les modifications de code à l'intérieur de `src/`
c) Uniquement les modifications de `node_modules`
d) Rien tant que l'image n'est pas reconstruite

**Question 5.** La solution durable au rechargement automatique en développement, distincte de l'image de production, est traitée :
a) Dans ce chapitre, de façon complète
b) Au chapitre 28
c) Jamais dans ce manuel
d) Au chapitre 5

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- `npm ci` (plutôt que `npm install`) garantit une installation strictement reproductible dans un Dockerfile, en s'appuyant sur `package-lock.json`.
- `--omit=dev` exclut les dépendances de développement d'une image de production, réduisant sa taille et sa surface d'attaque.
- `node_modules` doit systématiquement figurer dans le `.dockerignore` d'un projet Node.js, sous peine de copier un `node_modules` local potentiellement incompatible par-dessus celui de l'image.
- Un bind mount sur le dossier de code permet d'itérer sans reconstruire l'image, mais ne couvre ni les changements de dépendances ni un vrai rechargement automatique — une solution complète et honnête arrive au chapitre 28.

## ✅ Checklist avant de passer au chapitre 15

- [ ] J'ai construit et testé l'API Express de bout en bout.
- [ ] Je sais expliquer pourquoi `npm ci` est préférable à `npm install` dans un Dockerfile.
- [ ] Mon `.dockerignore` exclut systématiquement `node_modules`.
- [ ] Je sais ce qu'un bind mount synchronise, et ce qu'il ne synchronise pas.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**`npm ci`**
Définition simple : la commande d'installation stricte et reproductible de npm, basée sur `package-lock.json`.
Voir : Chapitre 14, section 14.2.

**`--omit=dev`**
Définition simple : l'option qui exclut les dépendances de développement d'une installation npm.
Voir : Chapitre 14, section 14.2.

---

## ❓ FAQ

**Pourquoi utiliser `alpine` (`node:20-alpine`) plutôt que `node:20` classique ?**
Rappel du chapitre 5, laboratoire 1 : `alpine` est une distribution de base beaucoup plus légère, réduisant significativement la taille finale de l'image — pertinent pour une image de production, moins critique en développement.

**Le port 3000 est-il obligatoire pour une API Express ?**
Non, c'est une convention courante mais arbitraire — `process.env.PORT` (section 14.1) permet de le rendre configurable sans toucher au code, exactement le principe du chapitre 9.

**Ce Dockerfile est-il déjà "prêt pour la production" ?**
Il applique déjà plusieurs bonnes pratiques (utilisateur non-root, `npm ci --omit=dev`), mais le chapitre 25 (Dockerfile professionnel) et le chapitre 26 (sécurité) ajoutent encore des couches d'optimisation et de durcissement avant qu'il ne soit considéré comme réellement complet.

---

## Références officielles

- `npm ci` — [docs.npmjs.com/cli/commands/npm-ci](https://docs.npmjs.com/cli/commands/npm-ci)
- Bonnes pratiques Docker pour Node.js — [docs.docker.com/language/nodejs](https://docs.docker.com/language/nodejs/)
- Guide officiel Node.js Docker — [github.com/nodejs/docker-node/blob/main/docs/BestPractices.md](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## Conclusion

Le backend a maintenant un vrai Dockerfile de production, reproductible et allégé. Le chapitre 15 s'attaque au frontend — React — avec un défi différent : construire une application, puis servir uniquement son résultat final via Nginx, sans jamais embarquer Node.js dans l'image livrée.

---

⬅️ [Chapitre 13 — Premier projet Compose](13-premier-projet-compose.md) · ➡️ **Suite : Chapitre 15 — Dockeriser React en production (multi-stage build)**
