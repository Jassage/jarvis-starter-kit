<div class="chapitre-titre-num">CHAPITRE 10</div>

# Async/Await

## Objectifs pédagogiques

Maîtriser `async`/`await`, la syntaxe qui rend le code asynchrone aussi lisible qu'un code synchrone classique, et savoir gérer les erreurs et le parallélisme correctement avec elle.

## 10.1 async/await : du sucre syntaxique au-dessus des Promises

```js
// Avec .then() (chapitre 9)
function chargerDonnees() {
  return lireUtilisateur(42)
    .then((utilisateur) => lireCommandes(utilisateur.id))
    .then((commandes) => {
      console.log(commandes);
    })
    .catch((erreur) => {
      console.error(erreur.message);
    });
}

// Avec async/await : même logique, syntaxe QUASI-SYNCHRONE
async function chargerDonnees() {
  try {
    const utilisateur = await lireUtilisateur(42);
    const commandes = await lireCommandes(utilisateur.id);
    console.log(commandes);
  } catch (erreur) {
    console.error(erreur.message);
  }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 async/await ne remplace pas les Promises, il les utilise</span>
`async`/`await` **est** entièrement basé sur les Promises du chapitre 9 — une fonction `async` retourne **toujours** une Promise, et `await` ne fait qu'attendre qu'une Promise se règle avant de continuer. Comprendre les Promises reste indispensable, même en n'écrivant plus jamais de `.then()` au quotidien.
</div>

## 10.2 Le mot-clé async

```js
async function direBonjour() {
  return "Bonjour"; // une fonction async retourne TOUJOURS une Promise, même pour une valeur simple
}

direBonjour().then((message) => console.log(message)); // "Bonjour"

// Équivalent : lever une exception dans une fonction async = rejeter la Promise retournée
async function echouerToujours() {
  throw new Error("Ça a échoué");
}
echouerToujours().catch((erreur) => console.error(erreur.message));
```

## 10.3 Le mot-clé await

```js
async function exemple() {
  console.log("1. Avant l'attente");
  const resultat = await attendre(1000); // met en PAUSE cette fonction (pas tout le programme) jusqu'à résolution
  console.log("3. Après l'attente :", resultat);
}

exemple();
console.log("2. Le reste du programme continue pendant l'attente");
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ await ne peut être utilisé qu'à l'intérieur d'une fonction async</span>
```js
function normale() {
  const resultat = await attendre(1000); // ❌ SyntaxError : await n'est valide que dans une fonction async
}
```
Depuis Node.js récent, `await` est également autorisé au **niveau racine d'un module ES Modules** ("top-level await"), mais reste interdit dans une fonction classique non déclarée `async`, et dans les modules CommonJS classiques.
</div>

## 10.4 try/catch : la gestion d'erreur avec async/await

```js
async function creerUtilisateur(donnees) {
  try {
    const utilisateurExistant = await UtilisateurRepository.trouverParEmail(donnees.email);
    if (utilisateurExistant) {
      throw new Error("Cet email est déjà utilisé");
    }
    const nouvelUtilisateur = await UtilisateurRepository.creer(donnees);
    return nouvelUtilisateur;
  } catch (erreur) {
    console.error("Échec de création :", erreur.message);
    throw erreur; // souvent utile de RE-lever l'erreur pour que l'appelant puisse aussi réagir (chapitre 19)
  }
}
```

## 10.5 Le piège classique : await en série vs Promise.all en parallèle

```js
// ❌ SÉQUENTIEL : chaque requête attend que la précédente soit TERMINÉE, alors qu'elles sont indépendantes
async function chargerTableauDeBordLent() {
  const utilisateurs = await UtilisateurRepository.compter();  // attend 200ms
  const produits = await ProduitRepository.compter();          // attend encore 200ms APRÈS le premier
  const commandes = await CommandeRepository.compter();         // attend encore 200ms APRÈS le second
  return { utilisateurs, produits, commandes }; // Total : ~600ms
}

// ✅ PARALLÈLE : les trois requêtes indépendantes démarrent EN MÊME TEMPS
async function chargerTableauDeBordRapide() {
  const [utilisateurs, produits, commandes] = await Promise.all([
    UtilisateurRepository.compter(),
    ProduitRepository.compter(),
    CommandeRepository.compter(),
  ]);
  return { utilisateurs, produits, commandes }; // Total : ~200ms (le temps de la plus lente des trois)
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de performance très fréquente chez les débutants</span>
Enchaîner des `await` un par un pour des opérations **totalement indépendantes** (qui ne dépendent pas du résultat les unes des autres) gaspille du temps en attendant inutilement en série ce qui pourrait s'exécuter en parallèle. La règle : si une opération asynchrone ne dépend pas du résultat d'une autre, les lancer via `Promise.all` plutôt que des `await` successifs.
</div>

## 10.6 await dans une boucle : un autre piège de performance

```js
// ❌ Chaque itération ATTEND la précédente, même si les appels sont indépendants
async function envoyerTousLesEmails(destinataires) {
  for (const destinataire of destinataires) {
    await envoyerEmail(destinataire); // sérialise TOUS les envois, un par un
  }
}

// ✅ Lance tous les envois en parallèle, attend qu'ils soient TOUS terminés
async function envoyerTousLesEmailsRapide(destinataires) {
  await Promise.all(destinataires.map((destinataire) => envoyerEmail(destinataire)));
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Nuance : le parallélisme n'est pas toujours souhaitable</span>
Envoyer des centaines d'emails ou requêtes en parallèle sans limite peut saturer un service externe (limite de débit d'un fournisseur SMTP, chapitre 27) ou une base de données. Pour un grand volume, une librairie de contrôle de concurrence (comme `p-limit`) permet de paralléliser **par lots** plutôt que tout d'un coup.
</div>

## 10.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier await, obtenir une Promise au lieu de la valeur attendue</span>
```js
async function exemple() {
  const utilisateur = lireUtilisateur(42); // ❌ "await" oublié !
  console.log(utilisateur.nom); // 💥 undefined : "utilisateur" est une Promise, pas l'objet attendu
}
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Fonction async sans gestion d'erreur, dans un contexte qui ne la propage pas</span>
Dans un contrôleur Express (chapitre 13-15), une erreur levée dans une fonction `async` non entourée de `try/catch` (ou sans middleware de capture dédié, chapitre 19) peut ne **jamais** atteindre le gestionnaire d'erreurs global d'Express, contrairement au code synchrone. Ce point est développé en détail au chapitre 19.
</div>

## 10.8 Résumé du chapitre

- `async`/`await` est du sucre syntaxique au-dessus des Promises, rendant le code asynchrone lisible comme du code synchrone.
- Une fonction `async` retourne toujours une Promise ; `throw` à l'intérieur rejette cette Promise.
- `try/catch` gère les erreurs d'un bloc `await`, de façon bien plus lisible qu'une chaîne `.catch()`.
- Des `await` successifs sur des opérations **indépendantes** gaspillent du temps : préférer `Promise.all` pour les paralléliser.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Réécris cette fonction séquentielle pour paralléliser les trois appels indépendants avec `Promise.all` :
```js
async function chargerProfil(utilisateurId) {
  const utilisateur = await UtilisateurRepository.trouverParId(utilisateurId);
  const commandes = await CommandeRepository.trouverParUtilisateur(utilisateurId);
  const notifications = await NotificationRepository.trouverParUtilisateur(utilisateurId);
  return { utilisateur, commandes, notifications };
}
```
</div>

**Corrigé :**
```js
async function chargerProfil(utilisateurId) {
  const [utilisateur, commandes, notifications] = await Promise.all([
    UtilisateurRepository.trouverParId(utilisateurId),
    CommandeRepository.trouverParUtilisateur(utilisateurId),
    NotificationRepository.trouverParUtilisateur(utilisateurId),
  ]);
  return { utilisateur, commandes, notifications };
}
```

*Chapitre suivant : la gestion des fichiers avec le module fs.*
