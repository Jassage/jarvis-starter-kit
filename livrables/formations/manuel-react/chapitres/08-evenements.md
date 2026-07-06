<div class="chapitre-titre-num">CHAPITRE 8</div>

# Les événements

## 8.1 La syntaxe des événements en React

En HTML classique, on écrit les événements en minuscules et souvent sous forme de chaîne :

```html
<!-- HTML classique -->
<button onclick="alert('clic')">Cliquer</button>
```

En JSX, les événements suivent la convention **camelCase**, et on leur passe **une fonction**, pas une chaîne :

```jsx
function Bouton() {
  function gererClic() {
    alert("clic");
  }
  return <button onClick={gererClic}>Cliquer</button>;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Appeler la fonction au lieu de la référencer</span>
```jsx
// ❌ La fonction est APPELÉE immédiatement au rendu, pas au clic !
<button onClick={gererClic()}>Cliquer</button>

// ✅ On passe la RÉFÉRENCE de la fonction ; React l'appellera lui-même au bon moment
<button onClick={gererClic}>Cliquer</button>

// ✅ Alternative : une fonction fléchée anonyme, utile pour passer des arguments
<button onClick={() => gererClic(42)}>Cliquer</button>
```
`onClick={gererClic()}` exécute `gererClic` **pendant le rendu du composant**, pas au moment du clic — et si `gererClic` retourne `undefined`, c'est `undefined` qui est (inutilement) assigné à `onClick`.
</div>

## 8.2 Événements courants

| Événement React | Déclenché quand... |
|---|---|
| `onClick` | l'utilisateur clique sur l'élément |
| `onChange` | la valeur d'un champ de formulaire change |
| `onSubmit` | un formulaire est soumis |
| `onFocus` / `onBlur` | un champ reçoit / perd le focus |
| `onMouseEnter` / `onMouseLeave` | la souris entre / sort de l'élément |
| `onKeyDown` / `onKeyUp` | une touche du clavier est pressée / relâchée |

```jsx
function ChampRecherche() {
  function gererChangement(evenement) {
    console.log("Valeur tapée :", evenement.target.value);
  }
  return <input type="text" onChange={gererChangement} placeholder="Rechercher..." />;
}
```

## 8.3 L'objet événement (SyntheticEvent)

Chaque gestionnaire reçoit un objet événement en paramètre. React l'appelle un **SyntheticEvent** : une enveloppe unifiée autour de l'événement natif du navigateur, garantissant un comportement identique sur tous les navigateurs.

```jsx
function Formulaire() {
  function gererSoumission(evenement) {
    evenement.preventDefault(); // empêche le rechargement de page par défaut du navigateur
    console.log("Formulaire soumis sans recharger la page");
  }

  return (
    <form onSubmit={gererSoumission}>
      <input type="text" />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier evenement.preventDefault() sur un formulaire</span>
Sans `preventDefault()`, soumettre un `<form>` provoque un **rechargement complet de la page** par le navigateur (comportement HTML natif), ce qui efface tout le state React de l'application. C'est l'une des erreurs les plus fréquentes en début d'apprentissage des formulaires (approfondi au chapitre 11).
</div>

## 8.4 Passer des arguments à un gestionnaire d'événement

```jsx
function ListeProduits({ produits, onSupprimer }) {
  return (
    <ul>
      {produits.map((produit) => (
        <li key={produit.id}>
          {produit.nom}
          <button onClick={() => onSupprimer(produit.id)}>Supprimer</button>
        </li>
      ))}
    </ul>
  );
}
```

On enveloppe l'appel dans une fonction fléchée `() => onSupprimer(produit.id)` pour ne l'exécuter **qu'au moment du clic**, avec l'identifiant correct capturé pour cet élément précis de la liste.

## 8.5 La propagation des événements (bubbling) et son arrêt

Comme en JavaScript natif, un événement React "remonte" par défaut des éléments enfants vers leurs parents (bubbling) :

```jsx
function Carte() {
  function gererClicCarte() {
    console.log("Carte cliquée");
  }
  function gererClicBouton(evenement) {
    evenement.stopPropagation(); // empêche gererClicCarte de se déclencher aussi
    console.log("Bouton cliqué");
  }

  return (
    <div onClick={gererClicCarte} className="carte">
      <p>Cliquer n'importe où sur la carte...</p>
      <button onClick={gererClicBouton}>...sauf ce bouton</button>
    </div>
  );
}
```

Sans `stopPropagation()`, cliquer sur le bouton déclencherait **les deux** gestionnaires (`gererClicBouton` puis `gererClicCarte`), car le clic sur le bouton "remonte" jusqu'à son parent `<div>`.

## 8.6 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Créer une nouvelle fonction fléchée à chaque rendu sans y penser</span>
```jsx
<button onClick={() => onSupprimer(produit.id)}>Supprimer</button>
```
Cette syntaxe est parfaitement correcte et très courante. Il faut juste savoir qu'elle **recrée une nouvelle fonction à chaque rendu** du composant. Sur une liste de quelques dizaines d'éléments, c'est totalement négligeable. Ce n'est un vrai sujet d'optimisation que sur des listes très volumineuses ou des composants enfants mémoïsés avec `React.memo` (voir chapitre 40 sur la performance) — ne t'en préoccupe pas avant d'avoir un problème de performance mesuré.
</div>

## 8.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Crée un composant `ChampAvecCompteur` : un `<input>` de type texte qui affiche en temps réel, sous le champ, le nombre de caractères tapés.
</div>

**Corrigé :**
```jsx
function ChampAvecCompteur() {
  const [texte, setTexte] = useState("");

  return (
    <div>
      <input type="text" value={texte} onChange={(e) => setTexte(e.target.value)} />
      <p>{texte.length} caractère(s)</p>
    </div>
  );
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.2</span>

Crée un composant `CarteCliquable` : une carte entière est cliquable et affiche "Carte ouverte" dans la console, sauf si on clique précisément sur un bouton "Favoris" à l'intérieur, qui doit afficher "Ajouté aux favoris" **sans** déclencher aussi l'ouverture de la carte.
</div>

**Corrigé :**
```jsx
function CarteCliquable() {
  function ouvrirCarte() {
    console.log("Carte ouverte");
  }
  function ajouterFavoris(e) {
    e.stopPropagation();
    console.log("Ajouté aux favoris");
  }

  return (
    <div onClick={ouvrirCarte} className="carte">
      <p>Contenu de la carte</p>
      <button onClick={ajouterFavoris}>Favoris</button>
    </div>
  );
}
```

## 8.8 Résumé du chapitre

- Les événements JSX sont en camelCase (`onClick`, `onChange`) et reçoivent une **référence de fonction**, jamais un appel direct.
- L'objet événement (`SyntheticEvent`) est passé automatiquement au gestionnaire ; `evenement.target.value` lit la valeur d'un champ.
- `evenement.preventDefault()` empêche le comportement par défaut du navigateur (essentiel sur `onSubmit`).
- `evenement.stopPropagation()` empêche un événement de remonter vers les éléments parents.

*Chapitre suivant : le rendu conditionnel, pour afficher différentes choses selon l'état de l'application.*
