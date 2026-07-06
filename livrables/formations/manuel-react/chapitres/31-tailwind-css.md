<div class="chapitre-titre-num">CHAPITRE 31</div>

# Tailwind CSS

## 31.1 Le principe "utility-first"

Tailwind CSS propose une approche radicalement différente du CSS traditionnel : au lieu d'écrire des classes sémantiques (`.carte-produit`) puis leurs styles dans un fichier séparé, on compose l'apparence directement dans le JSX en assemblant de petites **classes utilitaires**, chacune ne faisant qu'une seule chose.

```jsx
// Sans Tailwind : classe sémantique + CSS séparé
<div className="carte-produit">...</div>
```
```css
.carte-produit {
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

```jsx
// Avec Tailwind : composition directe de classes utilitaires, aucun fichier CSS séparé nécessaire
<div className="p-4 rounded-lg bg-white shadow-sm">...</div>
```

## 31.2 Installation avec Vite

```
$ npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

```jsx
// main.jsx
import "./index.css";
```

## 31.3 Les catégories de classes utilitaires essentielles

```jsx
function CarteProduit({ nom, prix }) {
  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md flex flex-col gap-2">
      <h3 className="text-xl font-bold text-gray-900">{nom}</h3>
      <p className="text-2xl font-semibold text-blue-600">{prix} HTG</p>
      <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
        Ajouter au panier
      </button>
    </div>
  );
}
```

| Catégorie | Exemples |
|---|---|
| Espacement | `p-4` (padding), `m-2` (margin), `gap-4` (espace entre éléments flex/grid) |
| Dimensions | `w-full`, `h-screen`, `max-w-sm` |
| Flexbox/Grid | `flex`, `flex-col`, `grid`, `grid-cols-3`, `items-center`, `justify-between` |
| Typographie | `text-xl`, `font-bold`, `text-gray-900`, `text-center` |
| Couleurs/fond | `bg-blue-600`, `text-white`, `border-red-300` |
| Bordures/ombres | `rounded-lg`, `border`, `shadow-md` |
| États | `hover:bg-blue-700`, `focus:ring-2`, `disabled:opacity-50` |

## 31.4 Responsive directement dans les classes

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* 1 colonne sur mobile, 2 sur tablette (sm), 3 sur écran moyen (md), 4 sur desktop (lg) */}
</div>
```

Les préfixes `sm:`, `md:`, `lg:`, `xl:` correspondent à des breakpoints prédéfinis (mobile-first : la classe sans préfixe s'applique à tous les écrans, chaque préfixe ne s'applique qu'**à partir de** cette largeur).

## 31.5 Extraire un composant plutôt que répéter des classes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège classique : de très longues chaînes de classes répétées</span>
```jsx
// ❌ Répété identique sur 10 boutons différents dans l'application : difficile à maintenir
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50">
  Valider
</button>
```
La solution Tailwind n'est **pas** de revenir à une classe CSS sémantique classique, mais d'extraire un **composant React** réutilisable (retour au chapitre 5) :
```jsx
// ✅ Un seul endroit à modifier pour changer le style de TOUS les boutons primaires
function BoutonPrimaire({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}
```
</div>

## 31.6 Classes conditionnelles avec clsx

```jsx
import clsx from "clsx";

function Badge({ statut }) {
  return (
    <span
      className={clsx("px-2 py-1 rounded-full text-xs font-medium", {
        "bg-green-100 text-green-700": statut === "actif",
        "bg-red-100 text-red-700": statut === "inactif",
        "bg-gray-100 text-gray-700": statut === "en_attente",
      })}
    >
      {statut}
    </span>
  );
}
```

## 31.7 Personnaliser le thème (couleurs, polices de marque)

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-marque: #146ef5;
  --font-titre: "Poppins", sans-serif;
}
```

```jsx
<h1 className="text-marque font-titre">Titre de marque</h1>
```

## 31.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Construire dynamiquement un nom de classe Tailwind par concaténation</span>
```jsx
// ❌ Tailwind analyse le code source de façon STATIQUE pour savoir quelles classes générer.
// "bg-" + couleur n'apparaît JAMAIS littéralement dans le code : Tailwind ne génère pas cette classe !
function Badge({ couleur }) {
  return <span className={`bg-${couleur}-500`}>Badge</span>;
}
```
```jsx
// ✅ Écrire les classes complètes explicitement, même dans une structure conditionnelle
function Badge({ couleur }) {
  const classesCouleur = {
    rouge: "bg-red-500",
    vert: "bg-green-500",
    bleu: "bg-blue-500",
  };
  return <span className={classesCouleur[couleur]}>Badge</span>;
}
```
</div>

## 31.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 31.1</span>

Construis une carte de profil avec Tailwind : avatar rond, nom en gras, statut en petit texte gris, le tout centré avec un espacement cohérent et une ombre légère.
</div>

**Corrigé :**
```jsx
function CarteProfil({ avatar, nom, statut }) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-white rounded-xl shadow-sm">
      <img src={avatar} alt={nom} className="w-16 h-16 rounded-full object-cover" />
      <p className="font-bold text-gray-900">{nom}</p>
      <p className="text-sm text-gray-500">{statut}</p>
    </div>
  );
}
```

## 31.10 Résumé du chapitre

- Tailwind compose l'apparence via des classes utilitaires directement dans le JSX, sans fichier CSS séparé par composant.
- Les préfixes responsive (`sm:`, `md:`, `lg:`) suivent une logique mobile-first.
- Face à des classes répétées, extraire un **composant React**, pas revenir à une classe CSS sémantique.
- Jamais de nom de classe construit dynamiquement par concaténation de chaîne — Tailwind ne peut analyser que des classes complètes et statiques.

*Chapitre suivant : Bootstrap, une approche par composants pré-stylés.*
