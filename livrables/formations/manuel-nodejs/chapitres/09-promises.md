<div class="chapitre-titre-num">CHAPITRE 9</div>

# Promises

## Objectifs pédagogiques

Comprendre ce qu'est une Promise, ses trois états, savoir la créer et la chaîner, et combiner plusieurs Promises en parallèle.

## 9.1 Le problème résolu par les Promises

Rappel du chapitre 8 : les callbacks imbriqués créent une pyramide difficile à lire et à maintenir. Une **Promise** représente une valeur qui sera **disponible plus tard** (ou une erreur qui surviendra plus tard), avec une syntaxe qui évite l'imbrication croissante.

## 9.2 Les trois états d'une Promise

```{.uml}
       new Promise((resolve, reject) => {...})
                    │
                    ▼
              «pending» (en attente)
               /              \
        resolve(valeur)     reject(erreur)
             │                    │
             ▼                    ▼
      «fulfilled»            «rejected»
      (résolue)              (rejetée)
```

- **pending** : état initial, l'opération n'est pas encore terminée.
- **fulfilled** (résolue) : l'opération a réussi, une valeur est disponible.
- **rejected** (rejetée) : l'opération a échoué, une erreur est disponible.

<div class="encadre astuce">
<span class="encadre-titre">💡 Une Promise ne peut changer d'état qu'une seule fois</span>
Une fois résolue ou rejetée, une Promise reste **définitivement** dans cet état — on parle de Promise "réglée" (*settled*). Appeler `resolve()` une seconde fois après un premier appel n'a aucun effet.
</div>

## 9.3 Créer une Promise

```js
function attendre(millisecondes) {
  return new Promise((resolve, reject) => {
    if (millisecondes < 0) {
      reject(new Error("La durée ne peut pas être négative"));
      return;
    }
    setTimeout(() => {
      resolve(`Attente de ${millisecondes}ms terminée`);
    }, millisecondes);
  });
}
```

## 9.4 Consommer une Promise avec .then() / .catch() / .finally()

```js
attendre(1000)
  .then((resultat) => {
    console.log(resultat); // "Attente de 1000ms terminée"
  })
  .catch((erreur) => {
    console.error("Erreur :", erreur.message);
  })
  .finally(() => {
    console.log("Terminé, succès ou échec"); // s'exécute TOUJOURS
  });
```

## 9.5 Chaîner des Promises (résoudre le Callback Hell)

```js
function lireUtilisateur(id) {
  return fetch(`/api/utilisateurs/${id}`).then((res) => res.json());
}
function lireCommandes(utilisateurId) {
  return fetch(`/api/commandes?utilisateur=${utilisateurId}`).then((res) => res.json());
}

// ✅ Chaînage PLAT, contrairement à l'imbrication du chapitre 8
lireUtilisateur(42)
  .then((utilisateur) => lireCommandes(utilisateur.id))
  .then((commandes) => {
    console.log(commandes);
  })
  .catch((erreur) => {
    // UN SEUL catch attrape une erreur survenue À N'IMPORTE QUELLE étape de la chaîne
    console.error("Erreur dans la chaîne :", erreur.message);
  });
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Chaque .then() retourne une NOUVELLE Promise</span>
C'est ce mécanisme qui permet le chaînage : la valeur retournée par un `.then()` (qu'elle soit une valeur simple ou une nouvelle Promise) devient l'entrée du `.then()` suivant. Un seul `.catch()` final suffit à intercepter une erreur survenue à **n'importe quelle** étape précédente de la chaîne — un net progrès par rapport à la gestion d'erreur dupliquée à chaque niveau des callbacks imbriqués.
</div>

## 9.6 Promise.all : exécuter plusieurs opérations en parallèle

```js
const p1 = fetch("/api/utilisateurs").then((r) => r.json());
const p2 = fetch("/api/produits").then((r) => r.json());
const p3 = fetch("/api/commandes").then((r) => r.json());

Promise.all([p1, p2, p3])
  .then(([utilisateurs, produits, commandes]) => {
    console.log(utilisateurs, produits, commandes); // les TROIS résultats, dans l'ordre d'origine
  })
  .catch((erreur) => {
    // Si UNE SEULE des trois échoue, tout Promise.all est rejeté immédiatement
    console.error("Au moins une requête a échoué :", erreur.message);
  });
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Promise.all échoue entièrement si UNE SEULE Promise échoue</span>
Si `p2` échoue alors que `p1` et `p3` réussissent, `Promise.all` rejette **immédiatement** avec l'erreur de `p2`, sans attendre les autres ni exposer leurs résultats réussis. Si ce comportement n'est pas souhaité (vouloir connaître le résultat de chaque Promise, succès ou échec), `Promise.allSettled` est la bonne alternative (section 9.7).
</div>

## 9.7 Promise.allSettled, Promise.race, Promise.any

```js
// allSettled : attend TOUTES les Promises, quel que soit leur résultat individuel
const resultats = await Promise.allSettled([p1, p2, p3]);
resultats.forEach((r) => {
  if (r.status === "fulfilled") {
    console.log("Succès :", r.value);
  } else {
    console.log("Échec :", r.reason.message);
  }
});

// race : résout/rejette dès que la PREMIÈRE Promise se règle (succès ou échec)
Promise.race([p1, attendre(5000)]).then((resultat) => console.log(resultat));

// any : résout dès la PREMIÈRE Promise réussie ; ne rejette que si TOUTES échouent
Promise.any([p1, p2, p3]).then((premierSucces) => console.log(premierSucces));
```

## 9.8 Promisifier une fonction à callback

```js
const fs = require("fs");
const util = require("util");

// util.promisify convertit automatiquement une fonction "error-first callback" (chapitre 8) en fonction Promise
const readFilePromise = util.promisify(fs.readFile);

readFilePromise("data.txt", "utf8")
  .then((contenu) => console.log(contenu))
  .catch((erreur) => console.error(erreur.message));
```

```js
// Alternative moderne : de nombreux modules Node.js fournissent déjà une version Promise
const fs = require("fs/promises");

fs.readFile("data.txt", "utf8")
  .then((contenu) => console.log(contenu))
  .catch((erreur) => console.error(erreur.message));
```

## 9.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de retourner la Promise dans un .then() pour chaîner correctement</span>
```js
// ❌ lireCommandes n'est PAS retourné : le .then() suivant reçoit undefined, pas les commandes
lireUtilisateur(42).then((utilisateur) => {
  lireCommandes(utilisateur.id); // manque un "return" ici !
}).then((commandes) => {
  console.log(commandes); // undefined
});
```
```js
// ✅ Toujours retourner explicitement la Promise pour poursuivre la chaîne correctement
lireUtilisateur(42).then((utilisateur) => {
  return lireCommandes(utilisateur.id);
}).then((commandes) => {
  console.log(commandes); // les commandes, correctement chaînées
});
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un .catch() manquant laisse une Promise "rejetée sans gestion"</span>
Une Promise rejetée sans aucun `.catch()` (ni `try/catch` avec `async`/`await`, chapitre 10) génère un avertissement `UnhandledPromiseRejection`, et dans les versions récentes de Node.js, peut même **faire planter le processus entier**. Toujours prévoir une gestion d'erreur sur toute chaîne de Promises.
</div>

## 9.10 Résumé du chapitre

- Une Promise représente une valeur future, dans l'un de trois états : pending, fulfilled, rejected — définitivement réglée une fois résolue ou rejetée.
- `.then()`/`.catch()`/`.finally()` consomment une Promise ; chaque `.then()` retourne une nouvelle Promise, permettant un chaînage plat.
- `Promise.all` (échoue si une seule échoue), `Promise.allSettled` (attend toutes, expose chaque résultat), `Promise.race`/`Promise.any` combinent plusieurs Promises selon des besoins différents.
- `util.promisify` (ou les versions `/promises` natives comme `fs/promises`) convertit une fonction à callback en fonction basée sur les Promises.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.1</span>

Écris une fonction `verifierAgePromise(age)` retournant une Promise qui se résout avec `true` si l'âge est valide (0-120), ou se rejette avec une erreur sinon (reprends la logique de l'exercice 8.1, mais avec des Promises).
</div>

**Corrigé :**
```js
function verifierAgePromise(age) {
  return new Promise((resolve, reject) => {
    if (age < 0 || age > 120) {
      reject(new Error("Âge invalide : " + age));
      return;
    }
    resolve(true);
  });
}

verifierAgePromise(25)
  .then((estValide) => console.log("Âge valide :", estValide))
  .catch((erreur) => console.error(erreur.message));
```

*Chapitre suivant : async/await, la syntaxe qui rend le code asynchrone aussi lisible que du code synchrone.*
