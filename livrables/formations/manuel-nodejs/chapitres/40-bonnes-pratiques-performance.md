<div class="chapitre-titre-num">CHAPITRE 40</div>

# Bonnes pratiques et optimisation des performances

## Objectifs pédagogiques

Consolider les bonnes pratiques transversales d'un projet Node.js professionnel, et identifier les leviers de performance les plus impactants avant le projet final.

## 40.1 Ne jamais bloquer l'event loop (rappel critique du chapitre 1)

```js
// ❌ Bloque le thread principal : TOUTES les requêtes en attente sont gelées pendant ce calcul
function estNombrePremierSync(n) {
  for (let i = 2; i < n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Déplacer un calcul lourd hors du thread principal</span>
Pour un calcul réellement intensif (traitement d'image, calcul cryptographique lourd), le module natif **`worker_threads`** exécute le code dans un thread séparé, sans bloquer le thread principal qui continue à traiter les autres requêtes normalement.
</div>

```js
const { Worker } = require("worker_threads");

function calculerEnArrierePlan(donnees) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./calcul-lourd.worker.js", { workerData: donnees });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}
```

## 40.2 Compression des réponses HTTP

```
$ npm install compression
```

```js
const compression = require("compression");
app.use(compression()); // compresse les réponses (gzip/brotli), réduisant la bande passante transférée
```

## 40.3 Mise en cache avec Redis

```js
const redis = require("redis");
const client = redis.createClient({ url: process.env.REDIS_URL });
await client.connect();

async function obtenirProduitsAvecCache() {
  const cache = await client.get("produits:tous");
  if (cache) {
    return JSON.parse(cache); // évite une requête base de données si le cache est encore valide
  }

  const produits = await ProduitRepository.listerTous();
  await client.setEx("produits:tous", 60, JSON.stringify(produits)); // expire après 60 secondes
  return produits;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Invalider le cache lors des écritures, sinon des données obsolètes persistent</span>
```js
async function creerProduit(donnees) {
  const produit = await ProduitRepository.creer(donnees);
  await client.del("produits:tous"); // invalide le cache : la prochaine lecture rechargera les données FRAÎCHES
  return produit;
}
```
Un cache jamais invalidé après une écriture affiche des données **périmées** aux utilisateurs suivants, jusqu'à l'expiration naturelle — toujours invalider (ou mettre à jour) le cache concerné après toute modification des données sous-jacentes.
</div>

## 40.4 Index de base de données (rappel transversal)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le levier de performance le plus impactant, souvent négligé</span>
Rappel des manuels React et Java de ce même auteur : un index sur les colonnes fréquemment utilisées dans un `WHERE` ou une jointure peut transformer une requête de plusieurs secondes en quelques millisecondes, sur une table volumineuse. C'est souvent le premier levier à vérifier face à un problème de performance, avant d'envisager du cache ou de la mise à l'échelle horizontale.
</div>

## 40.5 Pool de connexions dimensionné correctement

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un pool trop petit limite la concurrence ; un pool trop grand épuise les ressources de la base</span>
Un pool de connexions (chapitres 31-32, 34) trop restreint (`max: 5`) limite artificiellement le nombre de requêtes traitées simultanément, même si le serveur pourrait en gérer davantage. À l'inverse, un pool trop large sur plusieurs instances de l'application peut épuiser le nombre maximal de connexions autorisées par le SGBD lui-même. Un dimensionnement adapté à la charge réelle attendue (mesuré, pas deviné) est nécessaire.
</div>

## 40.6 Clustering et scaling horizontal

```{.uml}
Sans clustering :                    Avec clustering (PM2 -i max) :
┌──────────────┐                    ┌──────────┐ ┌──────────┐ ┌──────────┐
│  1 processus     │                    │Processus 1│ │Processus 2│ │Processus 3│
│  1 coeur CPU utilisé│                 │ Coeur 1   │ │ Coeur 2   │ │ Coeur 3   │
└──────────────┘                    └──────────┘ └──────────┘ └──────────┘
                                          Répartition automatique des requêtes
```

## 40.7 Compresser et minifier ne suffit pas : mesurer d'abord

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours mesurer avant d'optimiser (rappel transversal des manuels précédents)</span>
Avant d'appliquer la moindre optimisation, mesurer où se trouve réellement le goulot d'étranglement : le temps de réponse est-il dominé par la base de données (ajouter des index), par la sérialisation JSON de grosses réponses (paginer davantage), par un calcul CPU (déplacer vers un worker), ou par un service externe lent (mettre en cache) ? Optimiser à l'aveugle gaspille du temps sur des axes qui n'ont, en réalité, qu'un impact marginal.
</div>

## 40.8 Bonnes pratiques transversales récapitulées

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist avant la mise en production d'une API</span>
- Architecture en couches respectée (Route → Contrôleur → Service → Repository, chapitre 17).
- Toutes les entrées validées (chapitre 18), aucune confiance aveugle dans les données client.
- Gestion d'erreurs centralisée (chapitre 19), aucune stack trace exposée en production.
- Journalisation structurée (chapitre 20), sans données sensibles.
- Authentification JWT + RBAC (chapitres 23-24) sur toutes les routes sensibles, jamais basé sur des données envoyées par le client.
- Helmet, CORS restreint, Rate Limiting (chapitre 25) activés.
- Tests unitaires et d'intégration (chapitres 29-30) couvrant la logique critique.
- Migrations de base de données versionnées et appliquées via `migrate deploy` (chapitre 34, 39), jamais de synchronisation automatique en production.
- Variables d'environnement externalisées (chapitre 12), aucun secret dans le code ou dans l'image Docker.
</div>

## 40.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Optimiser prématurément au détriment de la lisibilité</span>
Réécrire un code parfaitement clair en une version "optimisée" mais illisible, sans avoir mesuré de problème de performance réel, dégrade la maintenabilité pour un bénéfice hypothétique. La priorité reste un code clair et bien architecturé ; l'optimisation ciblée n'intervient qu'une fois un vrai goulot d'étranglement mesuré.
</div>

## 40.10 Résumé du chapitre

- Ne jamais bloquer l'event loop avec un calcul lourd synchrone ; déléguer à `worker_threads` si nécessaire.
- La compression HTTP, le cache Redis (avec invalidation systématique), et les index de base de données sont les leviers de performance les plus rentables.
- PM2 en mode cluster (ou plusieurs instances Docker) exploite le parallélisme matériel malgré le modèle mono-thread de Node.js.
- Toujours mesurer avant d'optimiser ; ne jamais sacrifier la lisibilité pour une optimisation non mesurée.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.1</span>

Ajoute un cache Redis (60 secondes) à une fonction `obtenirStatistiquesDashboard()`, avec invalidation explicite lors de la création d'une nouvelle vente.
</div>

**Corrigé :**
```js
async function obtenirStatistiquesDashboard() {
  const cache = await client.get("dashboard:stats");
  if (cache) return JSON.parse(cache);

  const stats = await calculerStatistiques(); // requête coûteuse
  await client.setEx("dashboard:stats", 60, JSON.stringify(stats));
  return stats;
}

async function creerVente(donnees) {
  const vente = await VenteRepository.creer(donnees);
  await client.del("dashboard:stats"); // invalide le cache : les stats seront recalculées à la prochaine lecture
  return vente;
}
```

*Ceci clôt la Partie 9 (conteneurisation et déploiement). Chapitre suivant : le projet final MediAPI, qui assemble l'ensemble des 40 chapitres précédents dans une API complète de gestion hospitalière.*
