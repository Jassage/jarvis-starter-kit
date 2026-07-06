<div class="chapitre-titre-num">CHAPITRE 12</div>

# useEffect en profondeur

## 12.1 Le rôle de useEffect : synchroniser avec le monde extérieur

`useState` gère les données internes d'un composant. Mais un composant a souvent besoin de **communiquer avec quelque chose en dehors de React** : appeler une API, démarrer un minuteur, écouter un événement du navigateur, se connecter à un WebSocket. C'est le rôle de **`useEffect`**.

**Analogie :** pense à `useEffect` comme à un agent de liaison entre ton composant et le monde extérieur (le serveur, l'horloge du système, le navigateur). Il s'exécute **après** que React ait mis à jour l'écran, jamais pendant le calcul du rendu lui-même.

```jsx
import { useState, useEffect } from "react";

function Horloge() {
  const [heure, setHeure] = useState(new Date());

  useEffect(() => {
    const minuteur = setInterval(() => {
      setHeure(new Date());
    }, 1000);

    // Fonction de nettoyage : exécutée avant le prochain effet, ou au démontage du composant
    return () => clearInterval(minuteur);
  }, []); // tableau de dépendances vide = exécuté une seule fois, au montage

  return <p>{heure.toLocaleTimeString()}</p>;
}
```

## 12.2 Le tableau de dépendances : la clé de tout

C'est **le** concept le plus mal compris de `useEffect`. Le tableau de dépendances contrôle **quand** l'effet se réexécute :

```jsx
useEffect(() => {
  console.log("S'exécute à CHAQUE rendu du composant");
});

useEffect(() => {
  console.log("S'exécute UNE SEULE FOIS, au montage du composant");
}, []);

useEffect(() => {
  console.log("S'exécute au montage, PUIS à chaque fois que `id` change");
}, [id]);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle d'or</span>
Le tableau de dépendances doit contenir **toutes les valeurs du composant** (props, state, fonctions définies dans le composant) utilisées **à l'intérieur** de l'effet. React (via le plugin ESLint `eslint-plugin-react-hooks`, installé par défaut avec Vite) t'avertit automatiquement si une dépendance est manquante — ne désactive jamais cet avertissement sans comprendre pourquoi il apparaît.
</div>

## 12.3 Exemple concret : charger des données depuis une API

```jsx
function ProfilUtilisateur({ userId }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUtilisateur(data);
        setChargement(false);
      });
  }, [userId]); // re-exécuté à chaque changement d'utilisateur affiché

  if (chargement) return <p>Chargement...</p>;
  return <p>{utilisateur.nom}</p>;
}
```

Sans `[userId]` en dépendance, si le composant reste monté mais que `userId` change (ex : navigation d'un profil à un autre sans démonter le composant), les données affichées resteraient celles du **premier** utilisateur chargé — un bug très courant en pratique.

## 12.4 La fonction de nettoyage (cleanup) : éviter les fuites mémoire

Toute ressource "ouverte" dans un effet (minuteur, abonnement, connexion WebSocket, écouteur d'événement) doit être **fermée** dans la fonction retournée par l'effet :

```jsx
function Fenetre() {
  const [largeur, setLargeur] = useState(window.innerWidth);

  useEffect(() => {
    function gererRedimensionnement() {
      setLargeur(window.innerWidth);
    }

    window.addEventListener("resize", gererRedimensionnement);

    // Nettoyage : indispensable, sinon l'écouteur reste actif même après démontage du composant
    return () => window.removeEventListener("resize", gererRedimensionnement);
  }, []);

  return <p>Largeur : {largeur}px</p>;
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier le nettoyage</span>
Sans `removeEventListener` dans le retour de l'effet, chaque montage du composant `Fenetre` ajoute un **nouvel** écouteur sans jamais retirer les précédents. Si le composant est monté/démonté plusieurs fois (navigation entre pages, par exemple), on accumule des écouteurs fantômes qui continuent à s'exécuter — une fuite mémoire classique, difficile à détecter sans les outils de profiling.
</div>

## 12.5 StrictMode et le double appel des effets en développement

Rappel du chapitre 3 : `<StrictMode>` (activé par défaut par Vite) exécute **volontairement** certains effets deux fois **en développement uniquement** (montage → démontage → remontage), justement pour révéler les effets mal nettoyés.

<div class="encadre astuce">
<span class="encadre-titre">💡 Si ton effet se déclenche "deux fois" en dev, ce n'est pas un bug de React</span>
Si tu observes un `console.log` ou un appel réseau exécuté deux fois au montage en développement, vérifie d'abord ta fonction de nettoyage : c'est très probablement `StrictMode` qui révèle un effet mal nettoyé, pas un bug de React lui-même. Ce double-appel **ne se produit jamais en production**.
</div>

## 12.6 useEffect n'est pas fait pour tout

Un piège fréquent chez les débutants : utiliser `useEffect` pour calculer une valeur dérivée d'un state existant.

```jsx
// ❌ Mauvaise pratique : un effet inutile pour une simple valeur calculée
function Panier({ articles }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(articles.reduce((somme, a) => somme + a.prix, 0));
  }, [articles]);

  return <p>Total : {total} HTG</p>;
}
```

```jsx
// ✅ Correct : calcul direct pendant le rendu, pas besoin d'effet ni de state supplémentaire
function Panier({ articles }) {
  const total = articles.reduce((somme, a) => somme + a.prix, 0);
  return <p>Total : {total} HTG</p>;
}
```

**Règle pratique :** si une valeur peut être **calculée directement** à partir des props/state existants pendant le rendu, elle n'a besoin ni de son propre `useState`, ni d'un `useEffect` pour se synchroniser. Réserve `useEffect` aux vraies synchronisations avec l'extérieur (réseau, DOM natif, timers, abonnements). Le chapitre 15 (`useMemo`) couvre le cas où ce calcul devient coûteux et mérite d'être mis en cache.

## 12.7 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Boucle infinie par dépendance mal gérée</span>
```jsx
// ❌ Boucle infinie : l'effet met à jour un state qui est... sa propre dépendance, sans condition d'arrêt
useEffect(() => {
  setCompteur(compteur + 1);
}, [compteur]);
```
Chaque exécution de l'effet modifie `compteur`, ce qui redéclenche l'effet, indéfiniment. Toujours vérifier qu'un effet qui modifie un state n'est pas lui-même redéclenché par ce même state sans condition de sortie.
</div>

## 12.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Identifie le bug dans ce composant qui affiche le titre de la page dans l'onglet du navigateur, et corrige-le :
```jsx
function Page({ titre }) {
  useEffect(() => {
    document.title = titre;
  });
  return <h1>{titre}</h1>;
}
```
</div>

**Corrigé :** Ce n'est pas un bug bloquant (l'effet s'exécute à chaque rendu et remet toujours le bon titre), mais c'est **inefficace** : l'effet se réexécute inutilement à chaque rendu, même quand `titre` n'a pas changé. Il faut ajouter le tableau de dépendances :
```jsx
function Page({ titre }) {
  useEffect(() => {
    document.title = titre;
  }, [titre]);
  return <h1>{titre}</h1>;
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.2</span>

Écris un composant `Chronometre` qui affiche un compteur de secondes écoulées depuis le montage du composant, en t'assurant qu'aucun minuteur ne continue de tourner après le démontage du composant.
</div>

**Corrigé :**
```jsx
function Chronometre() {
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    const minuteur = setInterval(() => {
      setSecondes((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(minuteur);
  }, []);

  return <p>{secondes} secondes écoulées</p>;
}
```

## 12.9 Résumé du chapitre

- `useEffect` synchronise un composant avec le monde extérieur (API, DOM natif, timers, abonnements) — pas pour calculer des valeurs dérivées.
- Le tableau de dépendances contrôle la fréquence de réexécution : absent (chaque rendu), `[]` (montage uniquement), `[x, y]` (montage + à chaque changement de x ou y).
- Toute ressource ouverte dans un effet doit être fermée dans sa fonction de nettoyage (le `return` de l'effet).
- `StrictMode` double intentionnellement certains effets en développement pour révéler les fuites — jamais en production.
- Une valeur calculable directement depuis les props/state existants ne nécessite ni state ni effet supplémentaire.

*Chapitre suivant : le Context API, pour partager des données à travers l'arbre de composants sans prop drilling.*
