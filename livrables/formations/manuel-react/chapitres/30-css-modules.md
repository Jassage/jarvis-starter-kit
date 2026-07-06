<div class="chapitre-titre-num">CHAPITRE 30</div>

# CSS Modules

## 30.1 Le problème du CSS global

En CSS classique, toutes les classes partagent un **espace de noms global** : un fichier `boutons.css` définissant `.actif` peut entrer en conflit avec un autre fichier `onglets.css` définissant lui aussi `.actif`, sans qu'aucune erreur ne soit signalée — le style qui "gagne" dépend simplement de l'ordre de chargement des fichiers.

```css
/* boutons.css */
.actif { background: green; }

/* onglets.css chargé après : ÉCRASE silencieusement le .actif précédent */
.actif { background: blue; }
```

Sur un projet à plusieurs développeurs (comme GESCOM, avec sa refonte de design system), ce genre de collision devient vite un vrai problème de maintenance.

## 30.2 CSS Modules : des classes automatiquement scopées

Un fichier nommé `NomDuComposant.module.css` (la convention `.module.css` est reconnue automatiquement par Vite, sans configuration) génère des noms de classes **uniques**, garantissant qu'aucune collision n'est possible entre composants.

```css
/* CarteProduit.module.css */
.carte {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.titre {
  font-size: 1.2rem;
  font-weight: bold;
}

.enPromo {
  color: red;
}
```

```jsx
// CarteProduit.jsx
import styles from "./CarteProduit.module.css";

function CarteProduit({ nom, prix, enPromo }) {
  return (
    <div className={styles.carte}>
      <h3 className={styles.titre}>{nom}</h3>
      <p className={enPromo ? styles.enPromo : ""}>{prix} HTG</p>
    </div>
  );
}
```

À la compilation, `styles.carte` devient une chaîne unique générée automatiquement (par exemple `CarteProduit_carte__a1B2c`), garantissant qu'aucun autre composant du projet ne peut accidentellement réutiliser ou écraser cette classe.

## 30.3 Combiner plusieurs classes conditionnellement

```jsx
function Bouton({ variante, taille, children }) {
  const classes = [
    styles.bouton,
    variante === "danger" ? styles.danger : styles.primaire,
    taille === "grand" ? styles.grand : "",
  ]
    .filter(Boolean) // retire les chaînes vides
    .join(" ");

  return <button className={classes}>{children}</button>;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La librairie clsx simplifie cette syntaxe</span>
Sur un vrai projet, la combinaison conditionnelle de classes devient vite répétitive. La petite librairie `clsx` (ou `classnames`) simplifie cette écriture :
```
$ npm install clsx
```
```jsx
import clsx from "clsx";

function Bouton({ variante, taille, children }) {
  return (
    <button className={clsx(styles.bouton, {
      [styles.danger]: variante === "danger",
      [styles.primaire]: variante !== "danger",
      [styles.grand]: taille === "grand",
    })}>
      {children}
    </button>
  );
}
```
</div>

## 30.4 Composition de classes CSS Modules (composes)

```css
/* boutons.module.css */
.base {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.primaire {
  composes: base;
  background: #146ef5;
  color: white;
}

.danger {
  composes: base;
  background: #d32f2f;
  color: white;
}
```

```jsx
<button className={styles.primaire}>Valider</button>
// Applique automatiquement à la fois .base ET .primaire, sans dupliquer padding/border/cursor
```

## 30.5 Variables CSS partagées entre modules

```css
/* variables.css (fichier global, importé une seule fois dans main.jsx) */
:root {
  --couleur-primaire: #146ef5;
  --couleur-danger: #d32f2f;
  --espacement-base: 1rem;
}
```

```css
/* CarteProduit.module.css : peut utiliser les variables globales normalement */
.carte {
  padding: var(--espacement-base);
  border-color: var(--couleur-primaire);
}
```

Les variables CSS natives (`--nom-variable`) ne sont **jamais** scopées par CSS Modules : elles restent globales par nature, ce qui est justement voulu pour un thème cohérent à travers toute l'application.

## 30.6 CSS Modules vs Tailwind : un aperçu avant le chapitre 31

| | CSS Modules | Tailwind CSS (chapitre 31) |
|---|---|---|
| Où s'écrit le style | Fichier `.module.css` séparé | Classes utilitaires directement dans le JSX |
| Scoping | Automatique par fichier | N/A (classes utilitaires globales par nature, mais sans risque de collision) |
| Courbe d'apprentissage | Familière si on connaît déjà CSS | Nécessite d'apprendre le vocabulaire des classes utilitaires |
| Cas d'usage | Équipes préférant séparer strictement style et logique | Prototypage rapide, cohérence de design system imposée |

## 30.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier .module dans le nom du fichier</span>
```jsx
// ❌ Un fichier "CarteProduit.css" (sans .module) reste un CSS GLOBAL classique, jamais scopé
import "./CarteProduit.css";

// ✅ Seul le suffixe .module.css déclenche le scoping automatique par Vite
import styles from "./CarteProduit.module.css";
```
</div>

## 30.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 30.1</span>

Crée un fichier `Alerte.module.css` avec une classe de base `.alerte` et deux variantes `.succes`/`.erreur` utilisant `composes`, puis un composant `Alerte` qui les applique selon une prop `type`.
</div>

**Corrigé :**
```css
/* Alerte.module.css */
.alerte {
  padding: 0.8rem 1rem;
  border-radius: 6px;
  font-weight: 500;
}
.succes {
  composes: alerte;
  background: #e8f6ee;
  color: #1f7a45;
}
.erreur {
  composes: alerte;
  background: #fdecea;
  color: #b3261e;
}
```
```jsx
import styles from "./Alerte.module.css";

function Alerte({ type, children }) {
  return <div className={styles[type]}>{children}</div>;
}
// <Alerte type="succes">Enregistré !</Alerte>
```

## 30.9 Résumé du chapitre

- Un fichier `Nom.module.css` génère des classes automatiquement scopées, éliminant les collisions de noms entre composants.
- La combinaison conditionnelle de classes se fait via un tableau filtré, ou plus simplement via `clsx`.
- `composes` permet de composer des classes CSS Modules entre elles sans dupliquer les règles communes.
- Les variables CSS natives (`--nom`) restent globales par nature, utile pour un thème cohérent partagé.

*Chapitre suivant : Tailwind CSS, l'approche utility-first.*
