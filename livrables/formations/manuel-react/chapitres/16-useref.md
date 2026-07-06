<div class="chapitre-titre-num">CHAPITRE 16</div>

# useRef

## 16.1 Deux usages bien distincts de useRef

`useRef` sert à deux choses **très différentes**, qu'il faut bien distinguer :

1. **Accéder directement à un élément du DOM** (focus sur un champ, lecture d'une dimension, contrôle d'une vidéo...).
2. **Conserver une valeur mutable qui persiste entre les rendus, sans jamais déclencher de nouveau rendu** quand elle change (contrairement à `useState`).

## 16.2 Usage 1 — Accéder à un élément du DOM

```jsx
import { useRef } from "react";

function ChampAvecFocus() {
  const inputRef = useRef(null);

  function focaliserChamp() {
    inputRef.current.focus(); // .current pointe vers le vrai nœud DOM <input>
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focaliserChamp}>Focaliser le champ</button>
    </div>
  );
}
```

`useRef(null)` retourne un objet `{ current: null }`. En passant `ref={inputRef}` à un élément JSX natif (`<input>`, `<div>`, `<video>`...), React place automatiquement le vrai nœud DOM correspondant dans `inputRef.current`, dès que le composant est monté.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une `ref`, c'est comme le numéro de plaque d'immatriculation d'une voiture : ça te permet de retrouver et manipuler directement **le véhicule physique** (le vrai élément DOM), plutôt que de décrire son état via des props/state comme le fait le reste de React.
</div>

## 16.3 Usage 2 — Une valeur qui persiste sans déclencher de rendu

```jsx
import { useRef, useEffect } from "react";

function Chronometre() {
  const idIntervalle = useRef(null);
  const [secondes, setSecondes] = useState(0);

  function demarrer() {
    if (idIntervalle.current !== null) return; // déjà démarré
    idIntervalle.current = setInterval(() => {
      setSecondes((prev) => prev + 1);
    }, 1000);
  }

  function arreter() {
    clearInterval(idIntervalle.current);
    idIntervalle.current = null;
  }

  return (
    <div>
      <p>{secondes}s</p>
      <button onClick={demarrer}>Démarrer</button>
      <button onClick={arreter}>Arrêter</button>
    </div>
  );
}
```

Ici, `idIntervalle` stocke l'identifiant du minuteur (`setInterval`). On pourrait être tenté d'utiliser `useState` pour ça, mais ce serait une erreur : changer `idIntervalle` n'a **aucun impact visuel** à afficher, donc ça n'a pas besoin de déclencher un nouveau rendu. Utiliser `useState` pour cette donnée provoquerait des rendus inutiles ; `useRef` est fait exactement pour ce cas.

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle de choix simple</span>
Cette donnée doit-elle se refléter à l'écran ? **Oui** → `useState`. **Non**, c'est juste une information technique interne (id de minuteur, référence DOM, valeur précédente à comparer) → `useRef`.
</div>

## 16.4 Différence fondamentale avec useState

| | useState | useRef |
|---|---|---|
| Modifier la valeur déclenche un nouveau rendu ? | Oui | Non |
| La valeur est-elle "figée" pendant un rendu donné ? | Oui (jusqu'au prochain rendu) | Non — `ref.current` reflète toujours la dernière valeur, immédiatement |
| Cas d'usage | Données qui doivent s'afficher à l'écran | Références DOM, valeurs techniques internes, valeur précédente à comparer |

## 16.5 Cas d'usage réel : mesurer une dimension du DOM

```jsx
function BoiteMesuree() {
  const boiteRef = useRef(null);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    if (boiteRef.current) {
      setLargeur(boiteRef.current.offsetWidth);
    }
  }, []);

  return <div ref={boiteRef}>Largeur mesurée : {largeur}px</div>;
}
```

## 16.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Lire ref.current pendant le rendu pour l'afficher</span>
```jsx
// ❌ Mauvaise pratique : afficher ref.current directement dans le JSX
function Composant() {
  const compteurRef = useRef(0);
  compteurRef.current++;
  return <p>Rendu n°{compteurRef.current}</p>; // ne se met JAMAIS à jour visuellement !
}
```
Puisque modifier une `ref` **ne déclenche pas** de nouveau rendu, le texte affiché ne se mettra jamais à jour tant qu'un rendu ne sera pas déclenché par ailleurs (par un state qui change, par exemple). Si une valeur doit s'afficher et se mettre à jour visuellement, c'est le signe qu'il faut un `useState`, pas un `useRef`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Accéder à ref.current avant le montage</span>
```jsx
// ❌ Au tout premier rendu, inputRef.current vaut encore null
function Champ() {
  const inputRef = useRef(null);
  inputRef.current.focus(); // 💥 TypeError, exécuté PENDANT le rendu, avant que le DOM existe
  return <input ref={inputRef} />;
}
```
Le nœud DOM n'existe qu'**après** le rendu. Toute manipulation de `ref.current` doit se faire dans un gestionnaire d'événement (après une interaction) ou dans un `useEffect` (qui s'exécute après le rendu), jamais directement dans le corps du composant.
</div>

## 16.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Crée un composant `ChampRecherche` où le champ de saisie reçoit automatiquement le focus dès que le composant apparaît à l'écran (au montage).
</div>

**Corrigé :**
```jsx
function ChampRecherche() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} type="text" placeholder="Rechercher..." />;
}
```

## 16.8 Résumé du chapitre

- `useRef` a deux usages : référencer un élément DOM (`ref={monRef}`) et conserver une valeur mutable qui ne déclenche pas de rendu.
- Contrairement à `useState`, modifier `ref.current` ne provoque **jamais** de nouveau rendu.
- Si une valeur doit s'afficher à l'écran et évoluer visuellement, c'est un `useState`, pas un `useRef`.
- `ref.current` ne doit être lu/modifié que dans un événement ou un `useEffect`, jamais pendant le rendu lui-même.

*Chapitre suivant : créer ses propres hooks personnalisés pour réutiliser de la logique entre plusieurs composants.*
