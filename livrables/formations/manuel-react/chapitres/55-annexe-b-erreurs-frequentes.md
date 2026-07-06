<div class="chapitre-titre-num">ANNEXE B</div>

# Récapitulatif des erreurs fréquentes

Cette annexe regroupe, par ordre d'apparition dans le manuel, toutes les erreurs signalées dans les encadrés "⚠️ Attention" des 53 chapitres — une référence rapide à consulter en cas de bug qui "rappelle quelque chose".

| # | Erreur | Chapitre |
|---|---|---|
| 1 | Confondre React (bibliothèque) et un framework "tout-en-un" fournissant routing/HTTP | 1 |
| 2 | Croire que le Virtual DOM garantit toujours de meilleures performances | 1 |
| 3 | Déployer le dossier source au lieu de `dist/` | 2 |
| 4 | Mettre un secret derrière une variable `VITE_*` (exposée au navigateur) | 2 |
| 5 | Modifier `node_modules` directement | 3 |
| 6 | Deux éléments frères au niveau racine du JSX (sans Fragment) | 4 |
| 7 | Oublier de fermer une balise auto-fermante (`<img>`, `<input>`) | 4 |
| 8 | Utiliser `class`/`for` au lieu de `className`/`htmlFor` | 4 |
| 9 | Mettre une instruction (`if`) au lieu d'une expression dans `{}` | 4 |
| 10 | Nommer un composant en minuscule | 5 |
| 11 | Définir un composant à l'intérieur d'un autre composant | 5 |
| 12 | Modifier directement une prop reçue | 6 |
| 13 | Oublier les accolades pour transmettre un nombre/booléen en prop | 6 |
| 14 | Muter directement un objet/tableau de state au lieu d'en créer une copie | 7 |
| 15 | Appeler un Hook de façon conditionnelle | 7 |
| 16 | Appeler une fonction au lieu de la référencer dans `onClick={fn()}` | 8 |
| 17 | Oublier `preventDefault()` sur la soumission d'un formulaire | 8 |
| 18 | Le piège du `0` affiché avec `{longueur && <Composant />}` | 9 |
| 19 | Utiliser l'index du tableau comme `key` sur une liste dynamique | 10 |
| 20 | Champ contrôlé initialisé avec `undefined` au lieu d'une chaîne vide | 11 |
| 21 | Passer une fonction `async` directement à `useEffect` | 12, 23 |
| 22 | Oublier la fonction de nettoyage d'un `useEffect` (fuite mémoire) | 12 |
| 23 | Boucle infinie par dépendance de `useEffect` mal gérée | 12 |
| 24 | Utiliser `useContext` sans `Provider` englobant | 13 |
| 25 | Muter l'état directement dans un reducer `useReducer` | 14 |
| 26 | Dépendance manquante dans `useMemo`/`useCallback` | 15 |
| 27 | Lire/afficher `ref.current` en attendant un rendu visuel | 16 |
| 28 | Manipuler `ref.current` avant le montage (pendant le rendu) | 16 |
| 29 | Route catch-all (`*`) déclarée avant les autres routes | 19 |
| 30 | Utiliser `<a>` classique au lieu de `<Link>` pour la navigation interne | 19 |
| 31 | Protection de route uniquement côté frontend, jamais revérifiée côté serveur | 20, 25, 27 |
| 32 | Modifier le state Redux en dehors d'un reducer de slice | 21 |
| 33 | Oublier `.data` sur une réponse Axios | 23 |
| 34 | `dangerouslySetInnerHTML` sur du contenu utilisateur non nettoyé | 24, 28 |
| 35 | Oublier `URL.revokeObjectURL()` après une prévisualisation de fichier | 25 |
| 36 | Stocker un token longue durée dans `localStorage` | 26, 28 |
| 37 | Une "déconnexion" qui n'efface que le state React, sans révoquer côté serveur | 26 |
| 38 | Construire dynamiquement un nom de classe Tailwind par concaténation | 31 |
| 39 | Utiliser le JavaScript natif de Bootstrap (jQuery) avec React | 32 |
| 40 | Oublier le spread `{...register(...)}` de React Hook Form | 36 |
| 41 | Appeler `.parse()` de Zod sans `try/catch` (préférer `safeParse`) | 38 |
| 42 | Objet/tableau littéral créé en ligne comme prop, cassant `React.memo` | 40 |
| 43 | `React.lazy` sur un composant affiché systématiquement au premier écran | 41 |
| 44 | `import * as X` empêchant le tree shaking | 33, 42 |
| 45 | Tester les détails d'implémentation plutôt que le comportement observable | 43 |
| 46 | `placeholder` utilisé à la place d'un vrai `<label>` | 44 |
| 47 | Oublier la règle de réécriture SPA en production (404 sur route profonde) | 46 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser cette annexe</span>
Face à un bug non identifié, parcours cette liste par mots-clés (state, useEffect, formulaire, route...) avant de chercher ailleurs : une bonne partie des bugs de débutant à intermédiaire en React appartiennent à l'une de ces catégories déjà documentées avec leur solution dans le chapitre correspondant.
</div>
