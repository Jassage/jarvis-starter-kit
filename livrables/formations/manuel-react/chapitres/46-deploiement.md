<div class="chapitre-titre-num">CHAPITRE 46</div>

# Déploiement (Vercel, Netlify)

## 46.1 Rappel : ce qui doit réellement être déployé

Rappel du chapitre 2 : `npm run build` génère un dossier `dist/` contenant des fichiers HTML/CSS/JS **statiques**, optimisés et minifiés. C'est **ce dossier**, et uniquement lui, qui doit être déployé — jamais le code source, jamais `node_modules`.

```
$ npm run build

dist/
├── index.html
├── assets/
│   ├── index-a1b2c3.js
│   └── index-d4e5f6.css
```

## 46.2 Vercel : déploiement en quelques clics

**Vercel** (créé par l'équipe à l'origine de Next.js) est optimisé pour les projets React/Next.js, avec une intégration Git directe.

```
1. Créer un compte sur vercel.com, connecter le compte GitHub
2. "Add New Project" → sélectionner le dépôt GitHub du projet
3. Vercel détecte automatiquement Vite et configure la commande de build (npm run build) et le dossier de sortie (dist)
4. Ajouter les variables d'environnement VITE_* (chapitre 2) dans les Settings du projet
5. "Deploy"
```

```
$ # Alternative en ligne de commande, pour un déploiement manuel/rapide
$ npm install -g vercel
$ vercel

Vercel CLI
? Set up and deploy "~/mon-projet"? [Y/n] y
? Which scope should contain your project? Jaslin
? Link to existing project? [y/N] n
? What's your project's name? mon-projet
? In which directory is your code located? ./

🔗  Linked to jaslin/mon-projet
🔍  Inspect: https://vercel.com/jaslin/mon-projet/...
✅  Production: https://mon-projet.vercel.app
```

**Déploiement continu automatique :** une fois le projet lié à un dépôt GitHub, chaque `git push` sur la branche principale déclenche automatiquement un nouveau déploiement en production, et chaque Pull Request génère un **déploiement de prévisualisation** unique (une URL temporaire pour tester les changements avant de les fusionner).

## 46.3 Netlify : une alternative équivalente

```
1. Créer un compte sur netlify.com
2. "Add new site" → "Import an existing project" → connecter GitHub
3. Build command: npm run build
4. Publish directory: dist
5. Variables d'environnement dans Site settings → Environment variables
6. "Deploy site"
```

```
$ # Alternative CLI
$ npm install -g netlify-cli
$ netlify deploy --prod
```

Vercel et Netlify sont fonctionnellement très proches pour un projet Vite + React statique ; le choix se fait souvent sur des critères secondaires (habitudes d'équipe, fonctionnalités serverless spécifiques, tarification selon l'usage).

## 46.4 Le problème classique des SPA : le rafraîchissement sur une route profonde

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur 404 en rafraîchissant /produits/42</span>
Rappel du chapitre 19 : React Router gère la navigation **côté client**, en JavaScript. Si un utilisateur rafraîchit directement son navigateur sur `https://monsite.com/produits/42`, celui-ci envoie une **vraie requête HTTP** au serveur d'hébergement pour ce chemin exact. Si le serveur ne connaît que le fichier `index.html` à la racine (et non un fichier physique `/produits/42/index.html`, qui n'existe pas), il répond par une erreur 404.
</div>

**Solution : une redirection universelle vers `index.html`**, laissant ensuite React Router (côté client) interpréter l'URL et afficher la bonne page.

```
# public/_redirects (Netlify — copié tel quel dans dist/ au build, rappel du chapitre 3)
/*    /index.html   200
```

```json
// vercel.json (Vercel, à la racine du projet)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Vercel et Netlify configurent souvent cette règle automatiquement</span>
Les deux plateformes détectent généralement un projet Vite/React et appliquent cette réécriture par défaut. Il reste utile de connaître cette configuration explicitement pour un hébergement plus classique (Nginx, Apache) où elle n'est jamais automatique.
</div>

## 46.5 Variables d'environnement en production

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les variables VITE_ sont figées AU MOMENT DU BUILD, pas au runtime</span>
Contrairement à un serveur Node.js classique qui lit `process.env` à chaque démarrage, Vite **remplace littéralement** `import.meta.env.VITE_API_URL` par sa valeur réelle directement dans le code JavaScript généré, au moment de `npm run build`. Changer une variable d'environnement sur Vercel/Netilfy **après** un déploiement ne prend effet qu'au **prochain build** — jamais en modifiant simplement la configuration sans redéployer.
</div>

## 46.6 Vérifier le build de production en local avant de déployer

```
$ npm run build
$ npm run preview

  ➜  Local:   http://localhost:4173/
```

`npm run preview` (chapitre 2) sert localement le contenu réel de `dist/`, permettant de repérer un bug spécifique au mode production (souvent lié aux variables d'environnement ou à une différence de comportement entre développement et production) **avant** de le déployer.

## 46.7 CI/CD : automatiser tests et vérifications avant déploiement

Rappel des sessions passées sur LAKAY et GESCOM (GitHub Actions) : un vrai pipeline de production ne se contente pas de déployer directement, il **vérifie** d'abord que le code est prêt :

```yaml
# .github/workflows/deploy.yml
name: CI/CD
on:
  push:
    branches: [main]

jobs:
  verifier-et-deployer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run   # tests du chapitre 43
      - run: npm run build
      # Le déploiement Vercel/Netlify se déclenche ensuite automatiquement via leur propre intégration Git,
      # ou via une étape supplémentaire ici avec leur CLI respective
```

## 46.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de configurer la réécriture SPA sur un hébergement non spécialisé</span>
Sur un hébergement générique (VPS avec Nginx, comme mentionné pour LAKAY), la règle de réécriture du 46.4 doit être configurée manuellement :
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
Sans cette ligne, exactement le même problème 404 sur rafraîchissement se manifeste, cette fois sans qu'aucune configuration automatique de plateforme ne le résolve.
</div>

## 46.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 46.1</span>

Explique pourquoi ce scénario produit une erreur 404, et propose la correction : "Après déploiement sur Netlify d'une application React Router, la page d'accueil `/` fonctionne, mais rafraîchir la page sur `/profil` affiche une erreur 404 de Netlify."
</div>

**Corrigé :** Netlify tente de trouver un fichier physique correspondant à `/profil` dans le dossier `dist/`, qui n'existe pas (seul `index.html` existe, et React Router interprète l'URL **après** son chargement en JavaScript). La correction consiste à ajouter un fichier `public/_redirects` avec la ligne `/* /index.html 200`, redirigeant toute route inconnue vers `index.html`, laissant ensuite React Router afficher la bonne page côté client.

## 46.10 Résumé du chapitre

- Seul le contenu de `dist/` (généré par `npm run build`) doit être déployé, jamais le code source.
- Vercel et Netlify offrent un déploiement continu automatique sur chaque push Git, avec des URLs de prévisualisation par Pull Request.
- Toute SPA avec React Router nécessite une règle de réécriture serveur (`_redirects` ou `vercel.json`) pour éviter les 404 au rafraîchissement sur une route profonde.
- Les variables `VITE_*` sont figées au moment du build : les modifier exige un nouveau déploiement, pas seulement un changement de configuration.
- `npm run preview` permet de vérifier localement le build de production avant tout déploiement réel.

*Ceci clôt la Partie 8 (qualité et mise en production). Chapitre suivant : le début de la Partie 9, le projet final assemblant l'ensemble des notions de ce manuel.*
