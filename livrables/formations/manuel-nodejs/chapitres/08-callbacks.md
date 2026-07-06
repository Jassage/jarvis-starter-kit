<div class="chapitre-titre-num">CHAPITRE 8</div>

# Callbacks

## Objectifs pédagogiques

Comprendre le modèle de callback, la toute première façon de gérer l'asynchrone en JavaScript, ses conventions en Node.js, et ses limites (qui motivent les Promises du chapitre 9).

## 8.1 Qu'est-ce qu'un callback

Un **callback** est simplement une fonction passée en argument à une autre fonction, pour être **rappelée plus tard**, typiquement une fois qu'une opération asynchrone se termine.

```js
const fs = require("fs");

console.log("1. Début du programme");

fs.readFile("data.txt", "utf8", (erreur, contenu) => {
  console.log("3. Contenu du fichier lu :", contenu);
});

console.log("2. Le programme continue SANS ATTENDRE la lecture du fichier");

// Ordre d'affichage réel :
// 1. Début du programme
// 2. Le programme continue SANS ATTENDRE la lecture du fichier
// 3. Contenu du fichier lu : ...
```

Ceci illustre concrètement le modèle non bloquant du chapitre 1 : `readFile` délègue la lecture du fichier en arrière-plan et **rappelle** la fonction callback fournie une fois l'opération terminée, sans jamais bloquer l'exécution du reste du programme.

## 8.2 La convention "error-first callback" de Node.js

<div class="encadre astuce">
<span class="encadre-titre">💡 Convention systématique dans toute l'API native de Node.js</span>
Par convention (respectée par `fs`, `http`, et la quasi-totalité des anciennes API Node.js à base de callbacks), le callback reçoit **toujours** l'erreur éventuelle en **premier paramètre** (`null` si tout s'est bien passé), suivi du résultat réel.
</div>

```js
fs.readFile("data.txt", "utf8", (erreur, contenu) => {
  if (erreur) {
    console.error("Erreur de lecture :", erreur.message);
    return; // toujours arrêter ici en cas d'erreur, ne pas continuer avec un "contenu" invalide
  }
  console.log(contenu);
});
```

## 8.3 Le "Callback Hell" (pyramide de la mort)

```js
// ❌ Callbacks imbriqués : chaque étape dépend du résultat de la précédente
fs.readFile("utilisateur.json", "utf8", (err1, donneesUtilisateur) => {
  if (err1) return console.error(err1);

  const utilisateur = JSON.parse(donneesUtilisateur);

  fs.readFile(`commandes-${utilisateur.id}.json`, "utf8", (err2, donneesCommandes) => {
    if (err2) return console.error(err2);

    const commandes = JSON.parse(donneesCommandes);

    fs.readFile(`facture-${commandes[0].id}.json`, "utf8", (err3, donneesFacture) => {
      if (err3) return console.error(err3);
      // ... et ainsi de suite, la pyramide continue de s'enfoncer vers la droite
      console.log(JSON.parse(donneesFacture));
    });
  });
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le vrai problème du Callback Hell n'est pas esthétique</span>
Au-delà de l'indentation croissante (problème purement visuel, contournable en nommant des fonctions séparées), le vrai problème est la **gestion d'erreur dupliquée** à chaque niveau (`if (err) return ...` répété), et la difficulté de combiner plusieurs opérations asynchrones **en parallèle** plutôt qu'en série. C'est précisément ce que les Promises (chapitre 9) et `async`/`await` (chapitre 10) résolvent structurellement.
</div>

## 8.4 Callbacks synchrones vs asynchrones

```js
// Callback SYNCHRONE : appelé immédiatement, dans le même tick d'exécution
[1, 2, 3].forEach((n) => console.log(n)); // callback de forEach : synchrone

// Callback ASYNCHRONE : appelé plus tard, après une opération différée
setTimeout(() => console.log("Plus tard"), 1000); // callback de setTimeout : asynchrone
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne pas confondre les deux : un piège classique avec des boucles et setTimeout</span>
```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // affiche 0, 1, 2 (avec `let`, portée de bloc par itération)
}
```
Avec `var` au lieu de `let`, ce code afficherait `3, 3, 3` (toutes les callbacks partageraient la même variable `i`, dont la valeur finale est 3 au moment où les callbacks s'exécutent enfin) — un exemple concret de l'importance de `let` pour la portée de bloc, vue au chapitre 7.
</div>

## 8.5 Créer sa propre fonction à callback

```js
function diviser(a, b, callback) {
  if (b === 0) {
    return callback(new Error("Division par zéro impossible"));
  }
  callback(null, a / b); // convention error-first respectée
}

diviser(10, 2, (erreur, resultat) => {
  if (erreur) {
    console.error(erreur.message);
    return;
  }
  console.log(resultat); // 5
});
```

## 8.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier le return après avoir géré l'erreur</span>
```js
fs.readFile("data.txt", "utf8", (erreur, contenu) => {
  if (erreur) {
    console.error(erreur.message);
    // ❌ pas de return : le code continue quand même !
  }
  console.log(contenu.toUpperCase()); // 💥 TypeError si erreur était définie (contenu est undefined)
});
```
Sans `return` après la gestion d'erreur, l'exécution continue avec des données potentiellement invalides — toujours `return` immédiatement après avoir traité une erreur dans un callback.
</div>

## 8.7 Résumé du chapitre

- Un callback est une fonction rappelée plus tard, typiquement à la fin d'une opération asynchrone.
- La convention Node.js "error-first" place toujours l'erreur éventuelle en premier paramètre du callback.
- Le "Callback Hell" (imbrication croissante) complique la gestion d'erreur et la composition d'opérations — résolu par les Promises (chapitre 9).
- Toujours `return` immédiatement après avoir traité une erreur dans un callback, pour éviter de continuer avec des données invalides.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Écris une fonction `verifierAge(age, callback)` qui appelle `callback` avec une erreur si `age < 0` ou `age > 120`, et avec `null, true` si l'âge est valide, en suivant la convention error-first.
</div>

**Corrigé :**
```js
function verifierAge(age, callback) {
  if (age < 0 || age > 120) {
    return callback(new Error("Âge invalide : " + age));
  }
  callback(null, true);
}

verifierAge(25, (erreur, estValide) => {
  if (erreur) return console.error(erreur.message);
  console.log("Âge valide :", estValide);
});
```

*Chapitre suivant : les Promises, qui structurent la composition d'opérations asynchrones sans imbrication croissante.*
