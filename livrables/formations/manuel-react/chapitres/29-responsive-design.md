<div class="chapitre-titre-num">CHAPITRE 29</div>

# Responsive Design en React

## 29.1 Le responsive design reste un sujet CSS, pas React

Première clarification importante : React ne change **rien** aux techniques fondamentales du responsive design (media queries, Flexbox, Grid). Ce chapitre couvre les patterns **spécifiques à React** pour adapter le comportement d'un composant selon la taille de l'écran, en complément du CSS pur.

## 29.2 Approche CSS pure : la base, à privilégier autant que possible

```css
/* styles.css */
.grille-produits {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .grille-produits {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grille-produits {
    grid-template-columns: 1fr;
  }
}
```

```jsx
function GrilleProduits({ produits }) {
  return (
    <div className="grille-produits">
      {produits.map((p) => <CarteProduit key={p.id} produit={p} />)}
    </div>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle d'or : CSS d'abord</span>
Tant que l'adaptation ne concerne que l'**apparence** (taille, disposition, espacement), le CSS pur (media queries, Flexbox, Grid) suffit et reste plus performant qu'une solution JavaScript — aucun re-rendu React n'est nécessaire, le navigateur gère l'affichage nativement.
</div>

## 29.3 Quand le CSS ne suffit plus : afficher des composants différents

Le CSS seul ne peut pas faire apparaître/disparaître des **composants entiers** différents selon la taille d'écran (par exemple, un menu hamburger sur mobile vs une barre de navigation complète sur desktop) sans un hook dédié à la taille d'écran :

```jsx
// hooks/useMediaQuery.js — un hook personnalisé (chapitre 17) réutilisable
import { useState, useEffect } from "react";

export function useMediaQuery(requete) {
  const [correspond, setCorrespond] = useState(() => window.matchMedia(requete).matches);

  useEffect(() => {
    const media = window.matchMedia(requete);
    function gererChangement(e) {
      setCorrespond(e.matches);
    }
    media.addEventListener("change", gererChangement);
    return () => media.removeEventListener("change", gererChangement);
  }, [requete]);

  return correspond;
}
```

```jsx
function Navigation() {
  const estMobile = useMediaQuery("(max-width: 768px)");
  return estMobile ? <MenuHamburger /> : <BarreNavigationComplete />;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ window.matchMedia, pas window.innerWidth avec un écouteur resize</span>
`window.matchMedia` est plus performant que d'écouter `resize` et de recalculer soi-même une condition à chaque pixel de redimensionnement : le navigateur optimise nativement la détection de changement de correspondance à une media query.
</div>

## 29.4 Breakpoints centralisés

```jsx
// hooks/breakpoints.js
export const BREAKPOINTS = {
  mobile: "(max-width: 480px)",
  tablette: "(max-width: 768px)",
  desktop: "(min-width: 1024px)",
};
```

```jsx
import { useMediaQuery } from "./useMediaQuery";
import { BREAKPOINTS } from "./breakpoints";

function Composant() {
  const estMobile = useMediaQuery(BREAKPOINTS.mobile);
}
```

Centraliser les seuils évite d'avoir `"(max-width: 768px)"` répété en dur (et potentiellement incohérent) dans plusieurs fichiers.

## 29.5 Images responsives

```jsx
function ImageProduit({ produit }) {
  return (
    <img
      src={produit.imageMoyenne}
      srcSet={`${produit.imagePetite} 480w, ${produit.imageMoyenne} 768w, ${produit.imageGrande} 1200w`}
      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
      alt={produit.nom}
      loading="lazy"
    />
  );
}
```

`srcSet`/`sizes` laissent le navigateur choisir **la plus petite image suffisante** selon la taille réelle d'affichage — plus efficace qu'une seule grande image toujours chargée, quelle que soit la taille de l'écran.

## 29.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Recréer un mini-framework CSS en JavaScript</span>
Un piège fréquent chez les développeurs venant d'un environnement très orienté JS : vouloir tout gérer en JavaScript (calculer des tailles, positionner des éléments avec `useMediaQuery` partout), alors qu'une simple règle CSS (`flex-wrap`, `grid-template-columns` avec `auto-fit`/`minmax`) suffirait, sans aucun JavaScript ni re-rendu :
```css
.grille-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```
Cette grille s'adapte **automatiquement** au nombre de colonnes possibles selon la largeur disponible, sans aucune media query ni JavaScript.
</div>

## 29.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 29.1</span>

Utilise `useMediaQuery` pour afficher un composant `TableauComplet` sur desktop (largeur ≥ 1024px) et un composant `ListeCartes` (plus adapté au tactile) sur les écrans plus petits.
</div>

**Corrigé :**
```jsx
function AffichageDonnees({ donnees }) {
  const estDesktop = useMediaQuery("(min-width: 1024px)");
  return estDesktop ? <TableauComplet donnees={donnees} /> : <ListeCartes donnees={donnees} />;
}
```

## 29.8 Résumé du chapitre

- Le responsive design reste fondamentalement du CSS (media queries, Flexbox, Grid) ; React n'intervient que pour changer de **composants** entiers selon la taille d'écran.
- `useMediaQuery` (basé sur `window.matchMedia`) est le hook personnalisé standard pour cette détection.
- Centraliser les breakpoints évite les incohérences entre fichiers.
- Ne recrée pas en JavaScript ce que CSS Grid/Flexbox (`auto-fit`, `minmax`) résout nativement et plus simplement.

*Chapitre suivant : CSS Modules, pour scoper localement ses styles à un composant.*
