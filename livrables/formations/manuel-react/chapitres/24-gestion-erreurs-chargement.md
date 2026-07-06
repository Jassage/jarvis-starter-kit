<div class="chapitre-titre-num">CHAPITRE 24</div>

# Gestion des erreurs et des états de chargement

## 24.1 Les trois états universels d'une requête réseau

Toute donnée venant d'une API traverse toujours les mêmes trois états, déjà croisés aux chapitres 17, 21 et 23 : **chargement**, **succès**, **échec**. Ce chapitre consolide ce pattern en un composant réutilisable.

## 24.2 Un composant générique EtatRequete

```jsx
// components/EtatRequete.jsx
function EtatRequete({ chargement, erreur, enfants, messageVide, estVide = false }) {
  if (chargement) {
    return <p className="chargement">Chargement en cours...</p>;
  }
  if (erreur) {
    return <p className="erreur">Une erreur est survenue : {erreur}</p>;
  }
  if (estVide) {
    return <p className="vide">{messageVide || "Aucune donnée disponible"}</p>;
  }
  return enfants;
}

export default EtatRequete;
```

```jsx
function ListeProduits() {
  const { donnees, chargement, erreur } = useFetch("/api/produits"); // hook du chapitre 17

  return (
    <EtatRequete
      chargement={chargement}
      erreur={erreur}
      estVide={donnees?.length === 0}
      messageVide="Aucun produit trouvé"
      enfants={<ul>{donnees?.map((p) => <li key={p.id}>{p.nom}</li>)}</ul>}
    />
  );
}
```

## 24.3 Distinguer les types d'erreurs HTTP

Toutes les erreurs ne méritent pas le même traitement à l'écran :

```jsx
function messageErreurDepuisAxios(err) {
  if (!err.response) {
    return "Impossible de contacter le serveur. Vérifie ta connexion internet.";
  }

  switch (err.response.status) {
    case 400:
      return err.response.data?.message || "Requête invalide.";
    case 401:
      return "Ta session a expiré, merci de te reconnecter.";
    case 403:
      return "Tu n'as pas les droits nécessaires pour cette action.";
    case 404:
      return "Ressource introuvable.";
    case 500:
      return "Erreur interne du serveur. Réessaie plus tard.";
    default:
      return "Une erreur inattendue est survenue.";
  }
}
```

```jsx
try {
  await api.post("/produits", donnees);
} catch (err) {
  setErreur(messageErreurDepuisAxios(err));
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 err.response absent = problème réseau, pas une réponse du serveur</span>
Avec Axios, si `err.response` est `undefined`, cela signifie que la requête n'a **jamais atteint** le serveur (pas de connexion internet, serveur backend éteint, CORS mal configuré) — un cas très différent d'un vrai code d'erreur HTTP retourné par le serveur, et qui mérite un message différent pour l'utilisateur.
</div>

## 24.4 Error Boundaries : intercepter les erreurs de rendu

Un `try/catch` classique **ne rattrape pas** les erreurs qui surviennent pendant le rendu d'un composant React (par exemple, accéder à une propriété d'un objet `undefined` dans le JSX). Pour cela, React fournit un mécanisme dédié : les **Error Boundaries**, qui doivent encore être écrits sous forme de composant **classe** (aucun hook équivalent n'existe à ce jour pour ce cas précis) :

```jsx
// components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { aUneErreur: false };
  }

  static getDerivedStateFromError() {
    return { aUneErreur: true };
  }

  componentDidCatch(error, info) {
    console.error("Erreur interceptée :", error, info);
    // On enverrait ici l'erreur à un service de suivi (Sentry, etc.)
  }

  render() {
    if (this.state.aUneErreur) {
      return <p className="erreur">Quelque chose s'est mal passé. Rafraîchis la page.</p>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

```jsx
// App.jsx
<ErrorBoundary>
  <Routes>{/* ... */}</Routes>
</ErrorBoundary>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi une classe alors que ce manuel n'utilise que des fonctions ?</span>
C'est la **seule** exception de ce manuel (rappel du chapitre 5) : les Error Boundaries reposent sur les méthodes de cycle de vie `getDerivedStateFromError` et `componentDidCatch`, qui n'ont pas d'équivalent hook à ce jour. En pratique, on écrit ce composant **une seule fois** dans un projet (souvent copié depuis la documentation officielle), puis on ne le retouche plus.
</div>

## 24.5 Où placer les Error Boundaries

```jsx
// Une seule Error Boundary globale : toute erreur non gérée casse TOUTE l'application
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Plusieurs Error Boundaries ciblées : une erreur dans un widget n'affecte que ce widget
<Dashboard>
  <ErrorBoundary><WidgetVentes /></ErrorBoundary>
  <ErrorBoundary><WidgetNotifications /></ErrorBoundary>
</Dashboard>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Granularité recommandée</span>
Sur un tableau de bord avec plusieurs widgets indépendants (comme sur GESCOM ou BANKA), encapsuler **chaque widget** dans sa propre Error Boundary évite qu'un bug dans un seul widget (ex : un graphique mal alimenté) ne fasse planter l'écran entier.
</div>

## 24.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un Error Boundary ne rattrape pas tout</span>
Les Error Boundaries ne rattrapent **pas** : les erreurs dans les gestionnaires d'événements (`onClick`, etc. — un `try/catch` classique suffit là), les erreurs asynchrones (dans un `useEffect` ou une Promise non gérée), les erreurs côté serveur (SSR), ni les erreurs dans l'Error Boundary lui-même. Un `try/catch` reste nécessaire pour toute logique asynchrone, en complément des Error Boundaries pour les erreurs de rendu.
</div>

## 24.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Explique pourquoi ce code ne protège pas l'application contre une erreur survenant réellement pendant le clic sur le bouton :
```jsx
<ErrorBoundary>
  <button onClick={() => { throw new Error("Boom"); }}>Cliquer</button>
</ErrorBoundary>
```
</div>

**Corrigé :** Les Error Boundaries ne rattrapent que les erreurs survenant **pendant le rendu** des composants qu'elles englobent, pas celles levées dans un gestionnaire d'événement exécuté après coup. Il faut un `try/catch` classique directement dans le gestionnaire `onClick` pour ce cas.

## 24.8 Résumé du chapitre

- Toute donnée réseau traverse trois états universels : chargement, succès, échec — un composant `EtatRequete` générique évite de dupliquer cette logique partout.
- Distinguer les codes d'erreur HTTP (401, 403, 404, 500...) permet des messages utilisateur pertinents plutôt qu'un message générique.
- Les **Error Boundaries** (composants classe, seule exception du manuel) interceptent les erreurs de **rendu**, pas les erreurs asynchrones ni celles des gestionnaires d'événements.
- Répartir plusieurs Error Boundaries ciblées limite l'impact d'un bug à une seule zone de l'interface.

*Chapitre suivant : le téléversement de fichiers, un cas particulier des formulaires nécessitant des composants non contrôlés.*
