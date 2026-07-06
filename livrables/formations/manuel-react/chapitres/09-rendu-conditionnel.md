<div class="chapitre-titre-num">CHAPITRE 9</div>

# Le rendu conditionnel

## 9.1 Le problème

Comme vu au chapitre 4, on ne peut pas écrire un `if` classique directement à l'intérieur du JSX (entre accolades), car un `if` est une **instruction**, pas une **expression** qui produit une valeur. Ce chapitre présente les différentes techniques pour afficher conditionnellement du contenu.

## 9.2 Technique 1 — if / else avant le return

La plus lisible dès que la logique devient un peu complexe :

```jsx
function StatutCommande({ statut }) {
  if (statut === "livree") {
    return <p className="succes">✅ Commande livrée</p>;
  }
  if (statut === "en_cours") {
    return <p className="info">🚚 En cours de livraison</p>;
  }
  return <p className="erreur">❌ Commande annulée</p>;
}
```

## 9.3 Technique 2 — l'opérateur ternaire `condition ? a : b`

Idéal pour un choix simple entre deux valeurs, directement dans le JSX :

```jsx
function BoutonConnexion({ estConnecte }) {
  return (
    <button>
      {estConnecte ? "Se déconnecter" : "Se connecter"}
    </button>
  );
}
```

Ternaires imbriqués : à utiliser avec parcimonie, la lisibilité chute vite au-delà de deux niveaux :

```jsx
function Badge({ score }) {
  return (
    <span>
      {score >= 80 ? "🟢 Excellent" : score >= 50 ? "🟡 Moyen" : "🔴 Faible"}
    </span>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Au-delà de 2 conditions, préfère if/else ou une fonction</span>
Un ternaire imbriqué sur 3 niveaux ou plus devient difficile à lire d'un coup d'œil. Reviens alors à la technique 1 (if/else avant le `return`), ou extrais la logique dans une petite fonction dédiée qui retourne le JSX ou le texte voulu.
</div>

## 9.4 Technique 3 — l'opérateur `&&` (afficher ou rien du tout)

Très utilisé quand il n'y a **rien à afficher dans le cas contraire** (pas de "sinon") :

```jsx
function Notification({ messages }) {
  return (
    <div>
      <h3>Notifications</h3>
      {messages.length > 0 && <p>Vous avez {messages.length} nouveau(x) message(s)</p>}
    </div>
  );
}
```

Si `messages.length > 0` est `false`, React n'affiche **rien** (React ignore silencieusement les valeurs `false`, `null`, `undefined` dans le JSX).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège classique du "0" affiché à l'écran</span>
```jsx
// ❌ Piège : si messages.length vaut 0, "0" s'affiche littéralement à l'écran !
{messages.length && <p>Vous avez {messages.length} message(s)</p>}
```
En JavaScript, `0 && quoiQueCeSoit` s'évalue à `0` (pas à `false`), et React **affiche** `0` (contrairement à `false`/`null`/`undefined` qui sont ignorés). Toujours transformer la condition en un vrai booléen :
```jsx
// ✅ Correct : comparaison explicite qui produit un vrai booléen
{messages.length > 0 && <p>Vous avez {messages.length} message(s)</p>}
```
Cette erreur est extrêmement fréquente, y compris chez des développeurs expérimentés découvrant React.
</div>

## 9.5 Technique 4 — une variable JSX calculée avant le return

Utile quand le contenu conditionnel est un bloc JSX complexe (plusieurs balises), pour garder le `return` principal lisible :

```jsx
function TableauDeBord({ chargement, erreur, donnees }) {
  let contenu;

  if (chargement) {
    contenu = <p>Chargement en cours...</p>;
  } else if (erreur) {
    contenu = <p className="erreur">Une erreur est survenue : {erreur}</p>;
  } else {
    contenu = (
      <ul>
        {donnees.map((item) => (
          <li key={item.id}>{item.nom}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="tableau-de-bord">
      <h2>Tableau de bord</h2>
      {contenu}
    </div>
  );
}
```

Ce pattern (chargement / erreur / données) est **omniprésent** dans les applications réelles consommant une API (voir chapitre 24).

## 9.6 Technique 5 — masquer sans démonter (CSS) vs ne pas rendre du tout (JS)

Il existe deux façons bien différentes de "cacher" un élément :

```jsx
// Option A : l'élément reste dans le DOM, juste invisible visuellement
<div style={{ display: estVisible ? "block" : "none" }}>Contenu</div>

// Option B : l'élément n'existe carrément pas dans le DOM si la condition est fausse
{estVisible && <div>Contenu</div>}
```

| | Option A (CSS `display: none`) | Option B (rendu conditionnel JS) |
|---|---|---|
| Le composant reste "monté" | Oui — son state est conservé | Non — s'il redevient visible, il repart de zéro (remonté) |
| Cas d'usage typique | Onglets qu'on bascule souvent, formulaire dont on veut garder la saisie même masqué | Contenu qui n'a de sens que dans certaines conditions (ex : message d'erreur, modal) |

## 9.7 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Retourner null par erreur sans le vouloir</span>
```jsx
function Alerte({ message }) {
  if (!message) {
    return null; // ✅ volontaire : ne rien afficher est une pratique légitime et courante
  }
  return <div className="alerte">{message}</div>;
}
```
Retourner `null` depuis un composant est **parfaitement valide** en React (le composant n'affiche simplement rien). Ce n'est une erreur que si c'est **non intentionnel** — vérifie toujours que la condition qui mène à `null` est bien celle que tu voulais.
</div>

## 9.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.1</span>

Corrige ce composant qui affiche parfois un "0" indésirable à l'écran :
```jsx
function Panier({ articles }) {
  return (
    <div>
      {articles.length && <p>{articles.length} article(s) dans le panier</p>}
    </div>
  );
}
```
</div>

**Corrigé :**
```jsx
function Panier({ articles }) {
  return (
    <div>
      {articles.length > 0 && <p>{articles.length} article(s) dans le panier</p>}
    </div>
  );
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.2</span>

Écris un composant `EtatConnexion` qui reçoit `chargement` (booléen) et `utilisateur` (objet ou `null`), et affiche : "Chargement..." si `chargement` est vrai, "Bonjour {nom}" si `utilisateur` existe, sinon "Veuillez vous connecter".
</div>

**Corrigé :**
```jsx
function EtatConnexion({ chargement, utilisateur }) {
  if (chargement) {
    return <p>Chargement...</p>;
  }
  if (utilisateur) {
    return <p>Bonjour {utilisateur.nom}</p>;
  }
  return <p>Veuillez vous connecter</p>;
}
```

## 9.9 Résumé du chapitre

- `if`/`else` avant le `return` : le plus lisible pour une logique complexe ou plusieurs cas.
- Le ternaire `? :` : idéal pour un choix simple entre deux valeurs, dans le JSX.
- `condition && <JSX />` : pour afficher ou rien — attention au piège du `0` affiché, toujours comparer explicitement (`length > 0`).
- Une variable JSX calculée avant le `return` : pour garder un `return` principal lisible avec des blocs complexes.
- `display: none` (CSS) conserve le state du composant ; le rendu conditionnel JS le démonte complètement.

*Chapitre suivant : afficher des listes de données dynamiquement, et le rôle crucial de la prop `key`.*
