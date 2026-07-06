<div class="chapitre-titre-num">CHAPITRE 21</div>

# Pagination, recherche, tri et filtrage

## Objectifs pédagogiques

Implémenter une API de listing complète et professionnelle : pagination par page, recherche textuelle, tri dynamique et filtrage multicritère, combinés dans un seul point d'entrée cohérent.

## 21.1 Le problème : renvoyer toutes les lignes d'une table

<div class="encadre attention">
<span class="encadre-titre">⚠️ GET /produits sans pagination devient rapidement inutilisable</span>
Une table de quelques dizaines de milliers de produits renvoyée intégralement à chaque requête `GET /produits` gaspille de la bande passante, ralentit la réponse, et peut même épuiser la mémoire du serveur ou du client. La **pagination** est une attente de base pour toute API listant des ressources potentiellement nombreuses.
</div>

## 21.2 Pagination par page (offset-based)

```js
// GET /produits?page=2&limite=20
async function lister(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limite = Math.min(100, parseInt(req.query.limite) || 20); // plafond pour éviter les abus
    const decalage = (page - 1) * limite;

    const { produits, total } = await ProduitService.lister({ decalage, limite });

    res.json({
      donnees: produits,
      pagination: {
        page,
        limite,
        total,
        totalPages: Math.ceil(total / limite),
      },
    });
  } catch (erreur) {
    next(erreur);
  }
}
```

```js
// services/produits.service.js
async function lister({ decalage, limite }) {
  const [produits, total] = await Promise.all([
    ProduitRepository.listerAvecPagination(decalage, limite),
    ProduitRepository.compter(),
  ]);
  return { produits, total };
}
```

```js
// repositories/produits.repository.js — avec Prisma (chapitre 34)
async function listerAvecPagination(decalage, limite) {
  return prisma.produit.findMany({ skip: decalage, take: limite });
}
async function compter() {
  return prisma.produit.count();
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours plafonner la limite demandée par le client</span>
Sans plafond (`Math.min(100, ...)`), un client pourrait demander `?limite=1000000`, forçant le serveur à charger une quantité déraisonnable de données en une seule requête — un vecteur d'attaque par déni de service (chapitre 25) facile à éviter avec une limite maximale raisonnable.
</div>

## 21.3 Pagination par curseur (cursor-based) — aperçu

<div class="encadre astuce">
<span class="encadre-titre">💡 Quand préférer la pagination par curseur</span>
La pagination par page (`skip`/`take`) devient **inefficace** sur de très grandes tables (le SGBD doit quand même parcourir tous les enregistrements sautés). La pagination par **curseur** (utilisant l'id ou une date du dernier élément vu comme point de départ de la page suivante, `WHERE id > dernierIdVu LIMIT ...`) reste performante quel que soit le nombre total de lignes — au prix d'une navigation "page précédente/suivante" uniquement, sans accès direct à une page arbitraire (comme "page 50").
</div>

## 21.4 Recherche textuelle

```js
// GET /produits?recherche=riz
async function listerAvecRecherche(req, res, next) {
  try {
    const { recherche } = req.query;
    const produits = await ProduitRepository.rechercherParNom(recherche);
    res.json(produits);
  } catch (erreur) {
    next(erreur);
  }
}
```

```js
// Avec Prisma : recherche insensible à la casse, correspondance partielle
async function rechercherParNom(motCle) {
  if (!motCle) return prisma.produit.findMany();
  return prisma.produit.findMany({
    where: { nom: { contains: motCle, mode: "insensitive" } },
  });
}
```

## 21.5 Tri dynamique

```js
// GET /produits?trierPar=prix&ordre=desc
const CHAMPS_TRI_AUTORISES = ["nom", "prix", "createdAt"]; // liste blanche, JAMAIS accepter n'importe quel champ

async function listerAvecTri(req, res, next) {
  try {
    const trierPar = CHAMPS_TRI_AUTORISES.includes(req.query.trierPar) ? req.query.trierPar : "nom";
    const ordre = req.query.ordre === "desc" ? "desc" : "asc";

    const produits = await prisma.produit.findMany({
      orderBy: { [trierPar]: ordre },
    });
    res.json(produits);
  } catch (erreur) {
    next(erreur);
  }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais transmettre directement req.query.trierPar à la base sans validation</span>
```js
// ❌ DANGEREUX : un champ arbitraire (voire une tentative d'injection selon l'ORM) transmis directement
const produits = await prisma.produit.findMany({ orderBy: { [req.query.trierPar]: "asc" } });
```
Toujours valider le nom du champ de tri contre une **liste blanche explicite** (`CHAMPS_TRI_AUTORISES`) avant de l'utiliser — accepter n'importe quelle valeur permettrait à un client de tenter de trier sur un champ sensible non censé être exposé, ou de provoquer une erreur serveur avec un nom de champ inexistant.
</div>

## 21.6 Filtrage multicritère

```js
// GET /produits?categorie=alimentaire&prixMin=100&prixMax=500&disponible=true
async function construireFiltres(query) {
  const filtres = {};

  if (query.categorie) {
    filtres.categorie = query.categorie;
  }
  if (query.prixMin || query.prixMax) {
    filtres.prix = {};
    if (query.prixMin) filtres.prix.gte = Number(query.prixMin);
    if (query.prixMax) filtres.prix.lte = Number(query.prixMax);
  }
  if (query.disponible !== undefined) {
    filtres.stock = query.disponible === "true" ? { gt: 0 } : { equals: 0 };
  }

  return filtres;
}

async function listerAvecFiltres(req, res, next) {
  try {
    const filtres = await construireFiltres(req.query);
    const produits = await prisma.produit.findMany({ where: filtres });
    res.json(produits);
  } catch (erreur) {
    next(erreur);
  }
}
```

## 21.7 Tout combiner : un point d'entrée complet et professionnel

```js
async function listerComplet(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limite = Math.min(100, parseInt(req.query.limite) || 20);
    const trierPar = CHAMPS_TRI_AUTORISES.includes(req.query.trierPar) ? req.query.trierPar : "nom";
    const ordre = req.query.ordre === "desc" ? "desc" : "asc";
    const filtres = await construireFiltres(req.query);

    if (req.query.recherche) {
      filtres.nom = { contains: req.query.recherche, mode: "insensitive" };
    }

    const [produits, total] = await Promise.all([
      prisma.produit.findMany({
        where: filtres,
        orderBy: { [trierPar]: ordre },
        skip: (page - 1) * limite,
        take: limite,
      }),
      prisma.produit.count({ where: filtres }),
    ]);

    res.json({
      donnees: produits,
      pagination: { page, limite, total, totalPages: Math.ceil(total / limite) },
    });
  } catch (erreur) {
    next(erreur);
  }
}
```

## 21.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de recompter le total APRÈS application des filtres</span>
```js
// ❌ "total" ignore les filtres appliqués : totalPages devient incohérent avec les résultats filtrés
const produits = await prisma.produit.findMany({ where: filtres, skip, take: limite });
const total = await prisma.produit.count(); // compte TOUS les produits, pas seulement ceux filtrés !
```
Le comptage total doit **toujours** utiliser le même objet `where` que la requête de données elle-même, sinon la pagination affichée au client devient incohérente avec les résultats réellement filtrés.
</div>

## 21.9 Résumé du chapitre

- La pagination (offset-based ou cursor-based) est une attente de base pour tout endpoint listant des ressources potentiellement nombreuses.
- Toujours plafonner la limite de pagination demandée par le client, pour éviter les abus.
- Le tri dynamique doit valider le champ demandé contre une liste blanche explicite, jamais l'accepter tel quel.
- Le comptage total pour la pagination doit utiliser exactement les mêmes filtres que la requête de données.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

Ajoute un filtre `dateDebut`/`dateFin` (sur le champ `createdAt`) à la fonction `construireFiltres` de la section 21.6.
</div>

**Corrigé :**
```js
if (query.dateDebut || query.dateFin) {
  filtres.createdAt = {};
  if (query.dateDebut) filtres.createdAt.gte = new Date(query.dateDebut);
  if (query.dateFin) filtres.createdAt.lte = new Date(query.dateFin);
}
```

*Ceci clôt la Partie 4 (robustesse d'une API). Chapitre suivant : le hachage des mots de passe avec bcrypt, première étape de la Partie 5 (sécurité et authentification).*
