<div class="chapitre-titre-num">CHAPITRE 44</div>

# Accessibilité (ARIA)

## 44.1 Pourquoi l'accessibilité concerne tout développeur

L'accessibilité web (souvent abrégée **a11y** — "a", 11 lettres, "y") consiste à construire des interfaces utilisables par **tous**, y compris les personnes utilisant un lecteur d'écran (malvoyance), naviguant uniquement au clavier (handicap moteur), ou dans des conditions temporairement limitantes (bras cassé, écran en plein soleil rendant les faibles contrastes illisibles). C'est aussi, très concrètement, un critère de qualité que des clients institutionnels ou gouvernementaux peuvent exiger contractuellement.

## 44.2 Le HTML sémantique : la base avant même ARIA

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle d'or de l'accessibilité : "No ARIA is better than bad ARIA"</span>
Avant d'ajouter des attributs ARIA, la première règle est d'utiliser les **bonnes balises HTML sémantiques**, qui apportent une accessibilité de base gratuitement, sans aucun attribut supplémentaire.
</div>

```jsx
// ❌ Un <div> cliquable n'est ni focusable au clavier, ni annoncé comme un bouton par un lecteur d'écran
<div onClick={soumettre}>Valider</div>

// ✅ Une vraie balise <button> : focusable au Tab, activable au clavier (Entrée/Espace), annoncée comme "bouton"
<button onClick={soumettre}>Valider</button>
```

```jsx
// ❌ Une div "titre" n'est pas repérable par la navigation par titres d'un lecteur d'écran
<div className="titre-page">Tableau de bord</div>

// ✅ Une vraie hiérarchie de titres, navigable
<h1>Tableau de bord</h1>
```

## 44.3 Le texte alternatif des images

```jsx
// ❌ Une image sans description : un lecteur d'écran annonce juste "image", sans contexte
<img src="graphique-ventes.png" />

// ✅ alt décrit l'INFORMATION transmise par l'image, pas juste son nom de fichier
<img src="graphique-ventes.png" alt="Ventes en hausse de 12% par rapport au mois dernier" />

// ✅ Une image purement décorative (sans information) : alt vide, explicitement ignorée par les lecteurs d'écran
<img src="motif-decoratif.svg" alt="" />
```

## 44.4 Labels de formulaire

```jsx
// ❌ Un placeholder n'est PAS un label : il disparaît dès la saisie, et n'est pas toujours lu par les lecteurs d'écran
<input type="email" placeholder="Email" />

// ✅ Un vrai <label> associé, toujours visible et correctement annoncé
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le placeholder seul est une erreur d'accessibilité très fréquente</span>
Rappel du chapitre 4 (`htmlFor` au lieu de `for`) : un `<label htmlFor="email">` associé à `<input id="email">` permet à un lecteur d'écran d'annoncer clairement "Email, champ de saisie" au focus, et permet aussi à un utilisateur de cliquer sur le texte du label pour activer le champ. Un simple `placeholder` ne procure ni l'un ni l'autre.
</div>

## 44.5 Attributs ARIA : compléter, jamais remplacer le HTML sémantique

```jsx
// Un bouton icône seul (sans texte visible) a besoin d'une description explicite
function BoutonFermer({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Fermer la fenêtre">
      <IconeCroix />
    </button>
  );
}
```

```jsx
// Signaler dynamiquement un état à un lecteur d'écran
function Accordeon({ ouvert, onToggle, titre, children }) {
  return (
    <div>
      <button aria-expanded={ouvert} onClick={onToggle}>
        {titre}
      </button>
      {ouvert && <div role="region">{children}</div>}
    </div>
  );
}
```

```jsx
// Annoncer un message d'erreur au moment où il apparaît, même si l'utilisateur n'a pas le focus dessus
function MessageErreur({ message }) {
  if (!message) return null;
  return <p role="alert" className="erreur">{message}</p>;
}
```

`role="alert"` (rôle ARIA "live region") demande au lecteur d'écran d'**annoncer immédiatement** le contenu dès qu'il apparaît dans le DOM, sans attendre que l'utilisateur y navigue manuellement — essentiel pour des messages d'erreur de formulaire (chapitre 11) qui doivent être remarqués immédiatement.

## 44.6 Navigation au clavier

```jsx
function Modal({ ouvert, onFermer, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (ouvert) {
      modalRef.current?.focus(); // déplace le focus DANS la modale à son ouverture
    }
  }, [ouvert]);

  function gererTouche(e) {
    if (e.key === "Escape") onFermer(); // fermeture au clavier, pas seulement à la souris
  }

  if (!ouvert) return null;

  return (
    <div role="dialog" aria-modal="true" ref={modalRef} tabIndex={-1} onKeyDown={gererTouche}>
      {children}
    </div>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Test rapide et gratuit : essaie sans souris</span>
Le test d'accessibilité le plus simple et le plus révélateur, sans aucun outil : débrancher la souris et naviguer uniquement avec Tab, Shift+Tab, Entrée et Échap. Si un élément interactif ne peut pas être atteint ou activé ainsi, c'est un vrai problème d'accessibilité à corriger.
</div>

## 44.7 Outils de vérification automatisée

```
$ npm install --save-dev @axe-core/react
```

```jsx
// main.jsx (uniquement en développement)
if (import.meta.env.DEV) {
  import("@axe-core/react").then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  });
}
```

Cet outil analyse l'application en cours d'exécution et affiche dans la console du navigateur les violations d'accessibilité détectées (contraste insuffisant, label manquant, rôle ARIA incorrect), avec des liens explicatifs vers les règles concernées.

<div class="encadre astuce">
<span class="encadre-titre">💡 Lighthouse (chapitre 42) inclut aussi un audit d'accessibilité</span>
L'onglet Lighthouse des outils développeur, déjà mentionné au chapitre 42 pour la performance, propose également un audit "Accessibility" complet, notant l'application sur 100 et listant précisément chaque problème détecté automatiquement.
</div>

## 44.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Contraste de couleur insuffisant</span>
Un texte gris clair sur fond blanc peut sembler élégant visuellement, mais devenir illisible pour une personne malvoyante ou simplement en extérieur au soleil. Le ratio de contraste recommandé (WCAG AA) est d'au moins 4.5:1 pour du texte normal — vérifiable directement dans les outils développeur du navigateur (survol d'une couleur dans l'inspecteur CSS).
</div>

## 44.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 44.1</span>

Corrige les problèmes d'accessibilité de ce composant :
```jsx
function CarteProduit({ produit, onSupprimer }) {
  return (
    <div className="carte">
      <img src={produit.image} />
      <div className="titre">{produit.nom}</div>
      <div onClick={() => onSupprimer(produit.id)}>🗑️</div>
    </div>
  );
}
```
</div>

**Corrigé :**
```jsx
function CarteProduit({ produit, onSupprimer }) {
  return (
    <div className="carte">
      <img src={produit.image} alt={produit.nom} />
      <h3 className="titre">{produit.nom}</h3>
      <button onClick={() => onSupprimer(produit.id)} aria-label={`Supprimer ${produit.nom}`}>
        🗑️
      </button>
    </div>
  );
}
```
Trois corrections : `alt` descriptif sur l'image, `<h3>` sémantique au lieu d'un `<div>` pour le titre, `<button>` réellement focusable/activable au clavier avec `aria-label` explicite (l'émoji seul n'est pas toujours annoncé clairement par tous les lecteurs d'écran).

## 44.10 Résumé du chapitre

- Le HTML sémantique (`<button>`, `<h1>`, `<label>`) apporte une accessibilité de base gratuite, avant même d'ajouter ARIA.
- `alt` décrit l'information transmise par une image, jamais son nom de fichier ; vide pour une image purement décorative.
- Un `placeholder` ne remplace jamais un `<label>` associé.
- Les attributs ARIA (`aria-label`, `aria-expanded`, `role="alert"`) complètent le HTML sémantique pour les cas non couverts nativement.
- Tester au clavier seul (sans souris) révèle rapidement les vrais problèmes de navigation.

*Chapitre suivant : le SEO en React, et pourquoi le rendu côté client pose un défi particulier pour les moteurs de recherche.*
