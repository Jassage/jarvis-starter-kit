<div class="chapitre-titre-num">CHAPITRE 7</div>

# JavaScript moderne (ES6+)

## Objectifs pédagogiques

Maîtriser les fonctionnalités du JavaScript moderne indispensables pour écrire du code Node.js idiomatique et lisible : `let`/`const`, fonctions fléchées, déstructuration, spread/rest, template literals, classes, et les opérateurs modernes (`?.`, `??`).

## 7.1 let et const : en finir avec var

```js
// ❌ var : portée de FONCTION (pas de bloc), sujette au hoisting confus
function exemple() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — accessible en dehors du bloc if, un piège fréquent
}

// ✅ let/const : portée de BLOC, comportement prévisible
function exempleModerne() {
  if (true) {
    let x = 10;
  }
  console.log(x); // ❌ ReferenceError : x n'est pas défini ici — comportement attendu
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle pratique : const par défaut, let si réassignation nécessaire</span>
`const` empêche la **réassignation** de la variable (pas la mutation de son contenu si c'est un objet/tableau — rappel similaire au `final` de Java, si tu as suivi ce manuel). Utilise `const` par défaut pour tout, et `let` uniquement quand la variable doit réellement changer de valeur (un compteur de boucle, un accumulateur). `var` ne devrait plus jamais apparaître dans du code neuf.
</div>

```js
const utilisateur = { nom: "Jaslin" };
utilisateur.nom = "Marie"; // ✅ autorisé : on MODIFIE le contenu, pas la référence elle-même
utilisateur = {};           // ❌ TypeError : Assignment to constant variable
```

## 7.2 Fonctions fléchées (arrow functions)

```js
// Fonction classique
function additionner(a, b) {
  return a + b;
}

// Fonction fléchée équivalente
const additionner = (a, b) => a + b; // retour implicite si le corps tient sur une expression

// Avec un corps de bloc, le retour doit être explicite
const traiterCommande = (commande) => {
  const total = commande.lignes.reduce((somme, l) => somme + l.prix, 0);
  return { ...commande, total };
};
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les fonctions fléchées n'ont pas leur propre "this"</span>
```js
const utilisateur = {
  nom: "Jaslin",
  saluerClassique: function () {
    console.log("Bonjour " + this.nom); // "this" = l'objet utilisateur
  },
  saluerFlechee: () => {
    console.log("Bonjour " + this.nom); // "this" = le contexte EXTÉRIEUR (souvent undefined en module), pas utilisateur !
  },
};
```
Une fonction fléchée hérite du `this` de son **contexte englobant** au moment de sa définition, plutôt que de recevoir son propre `this` selon la façon dont elle est appelée (comportement des fonctions classiques). C'est précieux dans les callbacks (évite le classique `const self = this;`), mais dangereux pour les méthodes d'objet destinées à utiliser leur propre `this`.
</div>

## 7.3 Template literals

```js
const nom = "Jaslin";
const age = 24;

// ❌ Concaténation classique, verbeuse
const message = "Bonjour " + nom + ", tu as " + age + " ans.";

// ✅ Template literal : interpolation directe, multi-lignes naturelles
const messageModerne = `Bonjour ${nom}, tu as ${age} ans.`;

const html = `
  <div>
    <h1>${nom}</h1>
    <p>${age} ans</p>
  </div>
`;
```

## 7.4 Déstructuration

```js
// Objets
const utilisateur = { nom: "Jaslin", email: "jaslin@mail.com", age: 24 };
const { nom, email } = utilisateur;
const { nom: nomUtilisateur } = utilisateur; // renommage à l'extraction

// Avec valeur par défaut
const { role = "UTILISATEUR" } = utilisateur; // "role" n'existe pas dans l'objet → valeur par défaut utilisée

// Tableaux
const coordonnees = [48.85, 2.35];
const [latitude, longitude] = coordonnees;

// Très utilisé pour les paramètres de fonction (lisibilité + auto-documentation)
function creerUtilisateur({ nom, email, age = 18 }) {
  console.log(`${nom} (${email}), ${age} ans`);
}
creerUtilisateur({ nom: "Jaslin", email: "jaslin@mail.com" }); // age prend 18 par défaut
```

## 7.5 Spread et Rest (l'opérateur ...)

```js
// Spread : "étale" les éléments d'un tableau/objet
const partie1 = [1, 2, 3];
const partie2 = [4, 5, 6];
const complet = [...partie1, ...partie2]; // [1, 2, 3, 4, 5, 6]

const utilisateurBase = { nom: "Jaslin", role: "UTILISATEUR" };
const utilisateurAdmin = { ...utilisateurBase, role: "ADMIN" }; // écrase "role", copie le reste

// Rest : regroupe les arguments RESTANTS dans un tableau
function additionnerTout(...nombres) {
  return nombres.reduce((total, n) => total + n, 0);
}
additionnerTout(1, 2, 3, 4); // 10

// Rest en déstructuration : récupère "le reste" des propriétés
const { nom, ...autresProprietes } = utilisateur;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le spread est la base de l'immuabilité en JavaScript</span>
`{ ...utilisateurBase, role: "ADMIN" }` crée un **nouvel** objet plutôt que de modifier `utilisateurBase` directement — un principe d'immuabilité qui limite les effets de bord inattendus, particulièrement précieux dès que l'état est partagé entre plusieurs parties du code (services, middlewares).
</div>

## 7.6 Classes

```js
class CompteBancaire {
  #solde; // champ PRIVÉ (# préfixe), inaccessible depuis l'extérieur de la classe

  constructor(titulaire, soldeInitial = 0) {
    this.titulaire = titulaire;
    this.#solde = soldeInitial;
  }

  deposer(montant) {
    if (montant <= 0) {
      throw new Error("Le montant doit être positif");
    }
    this.#solde += montant;
  }

  get solde() { // getter : accessible comme une propriété, pas comme un appel de méthode
    return this.#solde;
  }
}

const compte = new CompteBancaire("Jaslin", 1000);
compte.deposer(500);
console.log(compte.solde); // 1500 (via le getter, sans parenthèses)
console.log(compte.#solde); // ❌ SyntaxError : champ privé inaccessible de l'extérieur
```

```js
class CompteEpargne extends CompteBancaire {
  constructor(titulaire, soldeInitial, tauxInteret) {
    super(titulaire, soldeInitial); // appelle le constructeur de la classe mère
    this.tauxInteret = tauxInteret;
  }

  appliquerInterets() {
    this.deposer(this.solde * this.tauxInteret);
  }
}
```

Les classes JavaScript restent, en coulisses, du **sucre syntaxique** au-dessus du système de prototypes historique du langage — mais leur syntaxe (`class`, `extends`, `super`, champs privés `#`) rend le code orienté objet bien plus lisible qu'avec l'ancienne syntaxe à base de prototypes explicites.

## 7.7 Optional chaining (?.) et nullish coalescing (??)

```js
const utilisateur = { profil: { adresse: null } };

// ❌ Sans optional chaining : risque de TypeError si une étape intermédiaire est null/undefined
console.log(utilisateur.profil.adresse.ville); // 💥 TypeError si adresse est null

// ✅ Optional chaining : retourne undefined au lieu de planter, si un maillon est null/undefined
console.log(utilisateur.profil?.adresse?.ville); // undefined, sans erreur

// Nullish coalescing : valeur par défaut UNIQUEMENT si null ou undefined (contrairement à ||)
const port = process.env.PORT ?? 3000;
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ ?? n'est pas la même chose que ||</span>
```js
const quantite = 0;
const quantiteAffichee1 = quantite || 10; // 10 — car 0 est "falsy", || le remplace à tort !
const quantiteAffichee2 = quantite ?? 10; // 0  — ?? ne remplace QUE null/undefined, pas 0
```
`||` remplace **toute** valeur "falsy" (`0`, `""`, `false`, `null`, `undefined`), ce qui est souvent une erreur quand `0` ou `""` sont des valeurs légitimes à conserver. `??` (nullish coalescing) ne remplace que `null`/`undefined`, un comportement bien plus précis pour les valeurs par défaut.
</div>

## 7.8 Méthodes de tableaux modernes

```js
const produits = [
  { nom: "Riz", prix: 250, categorie: "alimentaire" },
  { nom: "Savon", prix: 80, categorie: "hygiene" },
  { nom: "Haricots", prix: 180, categorie: "alimentaire" },
];

const alimentaires = produits.filter((p) => p.categorie === "alimentaire");
const noms = produits.map((p) => p.nom);
const total = produits.reduce((somme, p) => somme + p.prix, 0);
const cher = produits.find((p) => p.prix > 200);
const auMoinsUnCher = produits.some((p) => p.prix > 200);
const tousAbordables = produits.every((p) => p.prix < 1000);
```

## 7.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier que const n'empêche pas la mutation d'un objet/tableau</span>
```js
const liste = [1, 2, 3];
liste.push(4); // ✅ autorisé : on modifie le CONTENU, la référence "liste" ne change pas
console.log(liste); // [1, 2, 3, 4]
```
Ce n'est pas une erreur en soi, mais une confusion fréquente chez les débutants qui pensent, à tort, que `const` rend un tableau/objet totalement immuable.
</div>

## 7.10 Résumé du chapitre

- `const` par défaut, `let` seulement si réassignation nécessaire ; `var` à bannir.
- Les fonctions fléchées héritent du `this` de leur contexte englobant, contrairement aux fonctions classiques.
- La déstructuration et le spread/rest rendent le code plus concis et favorisent l'immuabilité.
- Les classes JavaScript modernes (champs privés `#`, `extends`, `super`) structurent le code orienté objet.
- `?.` protège contre les erreurs sur une chaîne d'accès potentiellement `null`/`undefined` ; `??` ne remplace que `null`/`undefined`, contrairement à `||`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>

Réécris cette fonction avec les fonctionnalités modernes vues dans ce chapitre (déstructuration, template literal, valeur par défaut) :
```js
function presenter(utilisateur) {
  var nom = utilisateur.nom;
  var role = utilisateur.role || "UTILISATEUR";
  return "Bonjour " + nom + ", rôle : " + role;
}
```
</div>

**Corrigé :**
```js
function presenter({ nom, role = "UTILISATEUR" }) {
  return `Bonjour ${nom}, rôle : ${role}`;
}
```

*Chapitre suivant : la programmation asynchrone, en commençant par les callbacks.*
