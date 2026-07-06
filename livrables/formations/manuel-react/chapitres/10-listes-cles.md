<div class="chapitre-titre-num">CHAPITRE 10</div>

# Les listes et les clés (keys)

## 10.1 Afficher une liste avec .map()

React n'a pas de syntaxe de boucle dédiée dans le JSX (pas de `<for>`). On utilise simplement la méthode JavaScript **`.map()`**, qui transforme un tableau de données en un tableau d'éléments JSX :

```jsx
function ListeProduits() {
  const produits = [
    { id: 1, nom: "Riz local", prix: 250 },
    { id: 2, nom: "Haricots", prix: 180 },
    { id: 3, nom: "Maïs moulu", prix: 150 },
  ];

  return (
    <ul>
      {produits.map((produit) => (
        <li key={produit.id}>
          {produit.nom} — {produit.prix} HTG
        </li>
      ))}
    </ul>
  );
}
```

## 10.2 La prop `key` : pourquoi elle est obligatoire

Dès que tu génères une liste d'éléments avec `.map()`, React **exige** une prop `key` unique sur l'élément racine retourné, et affichera un avertissement dans la console si elle manque.

**Pourquoi ?** Rappelle-toi le mécanisme de réconciliation vu au chapitre 1 : quand la liste change (un élément ajouté, supprimé, réordonné), React doit identifier **quel élément du Virtual DOM correspond à quel élément précédent**, pour ne mettre à jour que le strict nécessaire dans le vrai DOM. Sans `key`, React ne peut comparer les éléments **que par leur position** dans le tableau — ce qui devient faux dès qu'un élément est inséré ou supprimé au milieu de la liste.

**Analogie :** imagine une salle de classe où chaque élève porte un badge avec son nom (la `key`). Si un élève quitte la salle, le professeur sait exactement qui manque grâce aux badges. Sans badge, en ne comptant que les positions ("l'élève n°3 est parti"), le professeur pourrait confondre deux élèves qui ont simplement changé de place.

## 10.3 Le piège de l'index comme clé

```jsx
// ⚠️ À éviter dès que la liste peut être réordonnée, filtrée ou modifiée en cours d'utilisation
{taches.map((tache, index) => (
  <li key={index}>{tache.texte}</li>
))}
```

Utiliser l'**index du tableau** comme `key` fonctionne visuellement... jusqu'à ce que la liste change d'ordre ou qu'un élément soit supprimé au milieu. À ce moment-là, React associe les mauvais éléments aux mauvaises positions, ce qui peut provoquer :

- Un state local incorrect associé au mauvais élément (ex : un champ de saisie qui affiche la valeur d'un autre élément après suppression).
- Des animations ou transitions visuellement incohérentes.
- Des bugs difficiles à reproduire, car invisibles tant qu'on ne supprime/réordonne pas.

```jsx
// ✅ Correct : un identifiant STABLE et UNIQUE, indépendant de la position
{taches.map((tache) => (
  <li key={tache.id}>{tache.texte}</li>
))}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle simple</span>
Utilise **toujours** un identifiant unique et stable venant de tes données (un `id` de base de données, un UUID généré à la création). N'utilise l'index du tableau **qu'en dernier recours**, et uniquement si la liste est strictement statique (jamais réordonnée, jamais filtrée, jamais d'ajout/suppression au milieu).
</div>

## 10.4 La clé doit être unique parmi ses frères, pas globalement

```jsx
function Page() {
  const fruits = [{ id: 1, nom: "Mangue" }];
  const legumes = [{ id: 1, nom: "Carotte" }]; // même id que "Mangue", mais dans un AUTRE tableau .map()

  return (
    <div>
      <ul>{fruits.map((f) => <li key={f.id}>{f.nom}</li>)}</ul>
      <ul>{legumes.map((l) => <li key={l.id}>{l.nom}</li>)}</ul>
    </div>
  );
}
```

Ceci est **parfaitement valide** : la contrainte d'unicité de `key` s'applique uniquement **entre éléments frères issus du même `.map()`**, pas à l'échelle de toute l'application.

## 10.5 Filtrer et trier avant d'afficher

```jsx
function ListeProduitsEnStock({ produits }) {
  const produitsDisponibles = produits
    .filter((p) => p.stock > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <ul>
      {produitsDisponibles.map((p) => (
        <li key={p.id}>{p.nom}</li>
      ))}
    </ul>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ .sort() modifie le tableau original (mutation)</span>
`Array.prototype.sort()` trie le tableau **en place** et retourne une référence vers ce même tableau modifié. Si `produits` vient d'un state ou d'une prop, appeler `.sort()` directement dessus le mute (violation du principe d'immuabilité vu au chapitre 7). Toujours trier une **copie** :
```jsx
const produitsTries = [...produits].sort((a, b) => a.nom.localeCompare(b.nom));
```
</div>

## 10.6 Listes vides : penser au cas "aucun résultat"

```jsx
function ListeResultats({ resultats }) {
  if (resultats.length === 0) {
    return <p>Aucun résultat trouvé.</p>;
  }

  return (
    <ul>
      {resultats.map((r) => (
        <li key={r.id}>{r.nom}</li>
      ))}
    </ul>
  );
}
```

Un `<ul>` vide n'est pas une erreur technique, mais c'est une mauvaise expérience utilisateur : toujours prévoir un message explicite pour le cas "liste vide" (recherche sans résultat, panier vide, aucune notification...).

## 10.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Explique en une phrase pourquoi ce code peut poser problème une fois utilisé dans une vraie application où l'utilisateur peut supprimer des tâches :
```jsx
{taches.map((tache, index) => <TacheItem key={index} tache={tache} />)}
```
</div>

**Corrigé :** Utiliser l'index comme `key` fait que, dès qu'une tâche est supprimée au milieu de la liste, React réattribue les positions aux mauvais éléments (par exemple, un `<input>` non contrôlé à l'intérieur de `TacheItem` peut se retrouver à afficher la valeur d'une autre tâche) ; il faut utiliser `tache.id` à la place.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.2</span>

Écris un composant `ListeUtilisateurs` qui reçoit une prop `utilisateurs` (tableau d'objets `{ id, nom, actif }`), n'affiche que les utilisateurs `actif === true`, triés par nom, et affiche "Aucun utilisateur actif" si la liste filtrée est vide.
</div>

**Corrigé :**
```jsx
function ListeUtilisateurs({ utilisateurs }) {
  const actifs = utilisateurs
    .filter((u) => u.actif)
    .slice()
    .sort((a, b) => a.nom.localeCompare(b.nom));

  if (actifs.length === 0) {
    return <p>Aucun utilisateur actif</p>;
  }

  return (
    <ul>
      {actifs.map((u) => (
        <li key={u.id}>{u.nom}</li>
      ))}
    </ul>
  );
}
```

## 10.8 Résumé du chapitre

- `.map()` transforme un tableau de données en tableau d'éléments JSX ; il n'existe pas de boucle `for` dédiée en JSX.
- La prop `key` est **obligatoire** sur l'élément racine d'une liste, pour que React identifie correctement chaque élément lors des mises à jour (réconciliation).
- Utilise un **identifiant stable des données** (id, UUID) comme `key` ; évite l'index sauf liste strictement statique.
- `key` doit être unique parmi les éléments frères d'un même `.map()`, pas globalement.
- `.sort()` mute le tableau original : toujours trier une copie (`[...tableau].sort(...)`).
- Prévoir systématiquement l'affichage du cas "liste vide".

*Ceci clôt la Partie 1 (fondamentaux). Chapitre suivant : les formulaires, première étape de la Partie 2 (Hooks).*
