<div class="chapitre-titre-num">CHAPITRE 6</div>

# Les props

## 6.1 Définition et analogie

Les **props** (abréviation de *properties*) sont les données qu'un composant **parent** transmet à un composant **enfant**. C'est le seul moyen standard de faire "descendre" de l'information dans l'arbre de composants.

**Analogie :** pense aux props comme aux ingrédients qu'on donne à un cuisinier via une commande au restaurant. Le client (composant parent) précise "une pizza, sans oignon, taille L" (les props), et le cuisinier (composant enfant) prépare le plat **en fonction de cette commande**, sans jamais modifier lui-même ce qu'on lui a demandé.

```jsx
function CarteProduit(props) {
  return (
    <div className="carte">
      <h3>{props.nom}</h3>
      <p>{props.prix} HTG</p>
    </div>
  );
}

function Boutique() {
  return (
    <div>
      <CarteProduit nom="Riz local" prix={250} />
      <CarteProduit nom="Haricots" prix={180} />
    </div>
  );
}
```

`props` est un simple **objet JavaScript** : `{ nom: "Riz local", prix: 250 }`. React le construit automatiquement à partir des attributs JSX passés lors de l'utilisation du composant.

## 6.2 La déstructuration : la syntaxe utilisée en pratique

Écrire `props.nom`, `props.prix` partout devient vite verbeux. La convention professionnelle est de **déstructurer** l'objet `props` directement dans les paramètres de la fonction :

```jsx
// Style verbeux (à éviter en pratique)
function CarteProduit(props) {
  return <h3>{props.nom}</h3>;
}

// Style recommandé : déstructuration
function CarteProduit({ nom, prix }) {
  return (
    <div className="carte">
      <h3>{nom}</h3>
      <p>{prix} HTG</p>
    </div>
  );
}
```

## 6.3 Les props sont en lecture seule (immuabilité)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Règle absolue : ne jamais modifier une prop reçue</span>
```jsx
// ❌ Interdit : modifier directement une prop
function CarteProduit({ prix }) {
  prix = prix * 1.18; // NE JAMAIS FAIRE ÇA — React affichera un avertissement, et le comportement devient imprévisible
  return <p>{prix} HTG</p>;
}
```
```jsx
// ✅ Correct : calculer une nouvelle valeur locale sans toucher à la prop
function CarteProduit({ prix }) {
  const prixAvecTaxe = prix * 1.18;
  return <p>{prixAvecTaxe} HTG</p>;
}
```
Les props appartiennent au composant **parent**. Si l'enfant a besoin de faire évoluer une valeur dans le temps (au clic, à la saisie...), ce n'est plus une prop qu'il faut utiliser mais un **state** (chapitre 7), ou alors l'enfant doit **prévenir le parent** via une fonction callback passée en prop (section 6.5).
</div>

## 6.4 Props par défaut

```jsx
function Avatar({ url = "/avatar-defaut.png", taille = 48 }) {
  return <img src={url} width={taille} height={taille} alt="Avatar" />;
}

// Utilisation sans préciser url : la valeur par défaut s'applique
<Avatar />
// Utilisation en précisant url : la valeur par défaut est ignorée
<Avatar url="/photo-jaslin.jpg" taille={64} />
```

## 6.5 Les props peuvent être des fonctions : communiquer de l'enfant vers le parent

Les props ne transportent pas que des données statiques (texte, nombre) : elles peuvent aussi transporter des **fonctions**. C'est le mécanisme standard pour qu'un enfant "remonte" une information à son parent (puisque l'inverse — modifier une prop reçue — est interdit).

```jsx
function BoutonAjouterAuPanier({ onAjout }) {
  return <button onClick={() => onAjout()}>Ajouter au panier</button>;
}

function Boutique() {
  const gererAjout = () => {
    console.log("Un produit vient d'être ajouté au panier !");
  };

  return <BoutonAjouterAuPanier onAjout={gererAjout} />;
}
```

**Convention de nommage** largement adoptée dans l'écosystème React : le parent définit `gererAjout` (ou `handleAjout` en anglais), et nomme la prop qu'il transmet `onAjout` (préfixe `on`), pour signaler clairement "ceci est un événement auquel l'enfant peut réagir".

## 6.6 La prop spéciale `children`

Déjà vue au chapitre 5, `children` mérite un rappel ici car c'est *techniquement* une prop comme une autre, juste remplie automatiquement par React avec le contenu placé entre les balises ouvrante/fermante :

```jsx
function Alerte({ type, children }) {
  return <div className={`alerte alerte-${type}`}>{children}</div>;
}

// Utilisation
<Alerte type="succes">Votre compte a été créé avec succès.</Alerte>
<Alerte type="erreur">Email déjà utilisé.</Alerte>
```

## 6.7 Le "prop drilling" : le problème que Context API résoudra

Quand une donnée doit traverser plusieurs niveaux de composants intermédiaires qui n'en ont eux-mêmes pas besoin (ils ne font que la retransmettre), on parle de **prop drilling** :

```jsx
function App() {
  const utilisateur = { nom: "Jaslin" };
  return <Layout utilisateur={utilisateur} />;
}
function Layout({ utilisateur }) {
  return <Sidebar utilisateur={utilisateur} />; // Layout n'utilise pas utilisateur, il le retransmet juste
}
function Sidebar({ utilisateur }) {
  return <ProfilMini utilisateur={utilisateur} />; // idem
}
function ProfilMini({ utilisateur }) {
  return <p>Bonjour {utilisateur.nom}</p>; // seul ce composant en a réellement besoin
}
```

Ce n'est pas une erreur en soi sur 2-3 niveaux, mais ça devient pénible à maintenir sur une application complexe. Le **Context API** (chapitre 13) résout ce problème en permettant à `ProfilMini` d'accéder directement à `utilisateur` sans passer par `Layout` et `Sidebar`.

## 6.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier les accolades pour une valeur non-chaîne</span>
```jsx
// ❌ prix reçoit la CHAÎNE "250", pas le nombre 250
<CarteProduit prix="250" />
// ✅ prix reçoit bien le NOMBRE 250
<CarteProduit prix={250} />
```
Sans accolades, tout attribut JSX est traité comme une chaîne littérale. Pour transmettre un nombre, un booléen, un objet, un tableau ou une expression, les accolades sont obligatoires.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Propager trop de props une par une</span>
Quand un composant doit retransmettre beaucoup de props telles quelles à un élément HTML sous-jacent, l'opérateur de décomposition (*spread*) évite la répétition :
```jsx
function Input({ label, ...autresProps }) {
  return (
    <label>
      {label}
      <input {...autresProps} />
    </label>
  );
}
// <Input label="Email" type="email" placeholder="ex@mail.com" required />
```
À utiliser avec discernement : trop de spread rend le composant difficile à documenter (on ne sait plus quelles props il accepte réellement).
</div>

## 6.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.1</span>

Crée un composant `Badge` qui reçoit `texte` et `couleur` (par défaut `"gris"`), et affiche un `<span>` avec une couleur de fond correspondante en style inline.
</div>

**Corrigé :**
```jsx
function Badge({ texte, couleur = "gris" }) {
  return (
    <span style={{ backgroundColor: couleur, color: "white", padding: "2px 8px", borderRadius: "4px" }}>
      {texte}
    </span>
  );
}
// <Badge texte="Nouveau" couleur="green" />
// <Badge texte="En attente" /> → utilise "gris" par défaut
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.2</span>

Crée un composant `BoutonConfirmation` qui affiche un bouton "Supprimer" et qui, au clic, appelle une fonction `onConfirmer` transmise par le parent avec l'identifiant `id` de l'élément à supprimer.
</div>

**Corrigé :**
```jsx
function BoutonConfirmation({ id, onConfirmer }) {
  return (
    <button onClick={() => onConfirmer(id)}>Supprimer</button>
  );
}

function ListeProduits() {
  const gererSuppression = (id) => {
    console.log("Suppression du produit", id);
  };
  return <BoutonConfirmation id={42} onConfirmer={gererSuppression} />;
}
```

## 6.10 Résumé du chapitre

- Les props transmettent des données du parent vers l'enfant, en **lecture seule**.
- La déstructuration `{ nom, prix }` est la syntaxe standard en pratique, avec valeurs par défaut possibles.
- Les fonctions callback en props (`onAjout`, `onConfirmer`) permettent à l'enfant de communiquer vers le parent.
- `children` est une prop spéciale remplie par le contenu entre les balises du composant.
- Le "prop drilling" sur de nombreux niveaux annonce le besoin du Context API (chapitre 13).

*Chapitre suivant : le state, pour donner une mémoire interne à un composant.*
