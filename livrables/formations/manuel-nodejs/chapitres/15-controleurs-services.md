<div class="chapitre-titre-num">CHAPITRE 15</div>

# Contrôleurs et services

## Objectifs pédagogiques

Comprendre la responsabilité précise d'un contrôleur par opposition à un service, et savoir répartir correctement la logique d'une fonctionnalité entre les deux.

## 15.1 Le problème : tout dans le contrôleur

```js
// ❌ Le contrôleur mélange HTTP, validation, logique métier et accès aux données
router.post("/utilisateurs", async (req, res) => {
  const { nom, email, motDePasse } = req.body;

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Email invalide" });
  }

  const existant = await db.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
  if (existant.rows.length > 0) {
    return res.status(409).json({ message: "Email déjà utilisé" });
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const resultat = await db.query(
    "INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES ($1, $2, $3) RETURNING *",
    [nom, email, motDePasseHash]
  );

  res.status(201).json(resultat.rows[0]);
});
```

Ce code fonctionne, mais mélange **quatre responsabilités différentes** dans une seule fonction : extraction des données HTTP, validation, règles métier (vérifier l'unicité, hacher le mot de passe), et accès direct à la base de données.

## 15.2 Le contrôleur : traduire HTTP ↔ logique métier

<div class="encadre astuce">
<span class="encadre-titre">💡 La responsabilité UNIQUE d'un contrôleur</span>
Un contrôleur ne devrait faire que : (1) extraire les données pertinentes de la requête (`req.body`, `req.params`, `req.query`), (2) appeler la méthode de service correspondante, (3) traduire le résultat (ou l'erreur) en réponse HTTP appropriée. **Aucune** logique métier, **aucun** accès direct aux données.
</div>

```js
// src/controllers/utilisateurs.controller.js
const UtilisateurService = require("../services/utilisateurs.service");

async function creer(req, res, next) {
  try {
    const { nom, email, motDePasse } = req.body;
    const nouvelUtilisateur = await UtilisateurService.creerUtilisateur({ nom, email, motDePasse });
    res.status(201).json(nouvelUtilisateur);
  } catch (erreur) {
    next(erreur); // délègue au middleware de gestion d'erreurs centralisé (chapitre 19)
  }
}

async function lister(req, res, next) {
  try {
    const utilisateurs = await UtilisateurService.listerUtilisateurs();
    res.json(utilisateurs);
  } catch (erreur) {
    next(erreur);
  }
}

module.exports = { creer, lister };
```

## 15.3 Le service : la logique métier pure

```js
// src/services/utilisateurs.service.js
const bcrypt = require("bcrypt");
const UtilisateurRepository = require("../repositories/utilisateurs.repository");
const { ConflitError } = require("../errors");

async function creerUtilisateur({ nom, email, motDePasse }) {
  const existant = await UtilisateurRepository.trouverParEmail(email);
  if (existant) {
    throw new ConflitError("Cet email est déjà utilisé"); // erreur métier personnalisée (chapitre 19)
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const utilisateur = await UtilisateurRepository.creer({ nom, email, motDePasseHash });

  delete utilisateur.motDePasseHash; // ne JAMAIS renvoyer le hash, même haché, au client
  return utilisateur;
}

async function listerUtilisateurs() {
  const utilisateurs = await UtilisateurRepository.listerTous();
  return utilisateurs.map((u) => {
    const { motDePasseHash, ...utilisateurSansMotDePasse } = u;
    return utilisateurSansMotDePasse;
  });
}

module.exports = { creerUtilisateur, listerUtilisateurs };
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un service ne connaît RIEN de HTTP</span>
Remarque essentielle : `UtilisateurService` ne reçoit jamais `req`/`res`, ne connaît aucun code de statut HTTP, et ne lève que des erreurs métier génériques (`ConflitError`). Cette indépendance permet de **réutiliser** le service depuis un contexte totalement différent (une tâche planifiée, un script CLI, un test unitaire, chapitre 29) sans jamais avoir besoin d'un contexte HTTP simulé.
</div>

## 15.4 Le flux complet, illustré

```{.uml}
Route (routes/utilisateurs.routes.js)
      │
      ▼
Contrôleur (controllers/utilisateurs.controller.js)
      │  extrait req.body, appelle le service, traduit le résultat en réponse HTTP
      ▼
Service (services/utilisateurs.service.js)
      │  logique métier : validation métier, hachage, règles (ex: unicité email)
      ▼
Repository (repositories/utilisateurs.repository.js)  ── détaillé au chapitre 17
      │  accès brut aux données (SQL, Prisma, Mongoose...)
      ▼
Base de données
```

## 15.5 Pourquoi cette séparation est-elle importante en pratique

- **Testabilité** : `UtilisateurService.creerUtilisateur(...)` se teste directement (chapitre 29), sans simuler de requête HTTP.
- **Réutilisabilité** : la même logique de création d'utilisateur peut être appelée depuis un script d'import en masse, sans dupliquer le code.
- **Lisibilité** : un contrôleur de 5-10 lignes se comprend d'un coup d'œil ; toute la complexité métier vit dans un endroit dédié et prévisible.
- **Évolution facilitée** : changer la base de données (chapitre 30-31) n'affecte que le repository, jamais le service ni le contrôleur.

## 15.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un service qui retourne directement un objet issu de la base, sans transformation</span>
```js
// ❌ Expose potentiellement des champs sensibles (mot de passe haché, jetons internes) au client
async function trouverUtilisateur(id) {
  return UtilisateurRepository.trouverParId(id); // tel quel, SANS filtrage
}
```
Toujours filtrer explicitement les champs sensibles avant de retourner un objet issu de la base de données — ne jamais faire confiance au contrôleur pour "oublier" de les afficher.
</div>

## 15.7 Résumé du chapitre

- Le **contrôleur** traduit HTTP ↔ logique métier : extraction des données de requête, appel du service, mise en forme de la réponse — rien de plus.
- Le **service** porte la logique métier pure, sans jamais connaître `req`/`res` ni aucun concept HTTP.
- Cette séparation améliore testabilité, réutilisabilité et facilite l'évolution (changement de base de données, nouveaux points d'entrée non-HTTP).
- Toujours filtrer les champs sensibles (mots de passe hachés) avant de retourner un objet au client.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Refactorise ce contrôleur monolithique en séparant contrôleur et service :
```js
router.get("/produits/:id", async (req, res) => {
  const produit = await db.query("SELECT * FROM produits WHERE id = $1", [req.params.id]);
  if (produit.rows.length === 0) {
    return res.status(404).json({ message: "Introuvable" });
  }
  res.json(produit.rows[0]);
});
```
</div>

**Corrigé :**
```js
// controllers/produits.controller.js
async function obtenir(req, res, next) {
  try {
    const produit = await ProduitService.trouverParId(req.params.id);
    if (!produit) return res.status(404).json({ message: "Introuvable" });
    res.json(produit);
  } catch (erreur) {
    next(erreur);
  }
}
```
```js
// services/produits.service.js
async function trouverParId(id) {
  return ProduitRepository.trouverParId(id);
}
```

*Chapitre suivant : l'architecture MVC, pour formaliser cette organisation à l'échelle de toute une application.*
