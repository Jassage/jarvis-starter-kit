<div class="chapitre-titre-num">CHAPITRE 1</div>

# Introduction à React

## 1.1 Une analogie pour commencer

Imagine que tu dois construire une maison. Deux approches s'offrent à toi :

- **L'approche artisanale** : tu coules le béton toi-même, tu poses chaque brique une par une, tu câbles l'électricité fil par fil. C'est ce que fait le JavaScript "brut" (vanilla JS) ou jQuery quand on manipule le DOM directement : à chaque changement de donnée, on doit retrouver le bon élément HTML et le modifier à la main.
- **L'approche LEGO** : tu assembles des blocs préfabriqués (une porte, une fenêtre, un mur) que tu peux réutiliser, combiner et réorganiser facilement. Si tu changes la couleur du bloc "porte" dans son plan, toutes les portes de la maison qui utilisent ce bloc changent automatiquement.

**React, c'est l'approche LEGO pour construire des interfaces web.** Chaque bloc s'appelle un **composant**. Tu décris à quoi ton interface doit ressembler *en fonction de tes données*, et React se charge de mettre à jour l'écran tout seul quand ces données changent.

Cette idée a un nom : la **programmation déclarative**. Tu ne dis pas "va chercher le bouton, ajoute-lui la classe rouge" (ça, c'est de l'impératif). Tu dis "ce bouton est rouge quand `enErreur` est vrai" et React s'occupe du reste.

## 1.2 Qu'est-ce que React exactement ?

React est une **bibliothèque JavaScript** (pas un framework complet comme Angular) créée par Facebook (aujourd'hui Meta) en 2013, utilisée pour construire des **interfaces utilisateur (UI)**, principalement pour le web (avec React Native, les mêmes concepts s'appliquent au mobile).

**Bibliothèque vs Framework, la nuance qui compte :**

| | Bibliothèque (React) | Framework (Angular) |
|---|---|---|
| Qui appelle qui ? | Toi tu appelles React quand tu en as besoin | Le framework t'impose sa structure et t'appelle |
| Liberté | Grande liberté de choix (routing, gestion d'état, requêtes HTTP : tu choisis) | Tout est fourni et imposé (routing, HTTP, formulaires) |
| Courbe d'apprentissage | Douce au départ, mais il faut choisir/apprendre l'écosystème | Plus raide au départ, plus homogène ensuite |

C'est pour ça qu'on parle souvent de "l'écosystème React" plutôt que "le framework React" : autour de la bibliothèque de base gravitent des outils qu'on assemble selon les besoins du projet (on les verra tous dans ce manuel : React Router, Redux Toolkit, Axios, etc.).

## 1.3 Le problème que React résout

Avant les frameworks modernes, mettre à jour une interface complexe ressemblait à ceci :

```
$ # Pseudo-code jQuery — approche impérative
$ # "Je dois DIRE COMMENT faire, étape par étape"
```

```js
// Sans React : on manipule le DOM nous-mêmes
const compteurElement = document.getElementById("compteur");
let compteur = 0;

document.getElementById("bouton-plus").addEventListener("click", function () {
  compteur = compteur + 1;
  compteurElement.textContent = compteur; // on doit se souvenir de mettre à jour l'écran
  if (compteur > 10) {
    compteurElement.style.color = "red"; // et ne pas oublier CE détail non plus
  }
});
```

Le problème : plus l'application grandit, plus il devient difficile de se souvenir de **tous les endroits** où l'écran doit être mis à jour quand une donnée change. On oublie un cas, un bug visuel apparaît, l'application devient impossible à maintenir.

Avec React, on décrit uniquement le résultat voulu **en fonction de l'état actuel** :

```jsx
// Avec React : on décrit CE QUE l'interface doit être
function Compteur() {
  const [compteur, setCompteur] = useState(0);

  return (
    <div>
      <p style={{ color: compteur > 10 ? "red" : "black" }}>{compteur}</p>
      <button onClick={() => setCompteur(compteur + 1)}>+</button>
    </div>
  );
}
```

Ne t'inquiète pas si `useState` ou la syntaxe `<div>` dans du JavaScript te semblent étranges : c'est exactement l'objet des chapitres 4 et 7. Retiens juste l'idée : **on décrit l'interface comme une fonction de l'état, et React se charge de la synchronisation avec l'écran.**

## 1.4 Les concepts clés (vocabulaire à connaître dès maintenant)

Cette section est une carte du territoire. Chaque terme sera détaillé dans un chapitre dédié, mais il faut les avoir entendus une première fois.

<div class="encadre astuce">
<span class="encadre-titre">💡 À retenir</span>
Ne cherche pas à tout mémoriser d'un coup. Reviens à cette liste dès qu'un terme te semble flou plus loin dans le manuel.
</div>

- **Composant** : un morceau d'interface réutilisable et autonome (un bouton, une carte produit, une page entière). Voir chapitre 5.
- **JSX** : une syntaxe qui permet d'écrire du "HTML" directement dans du JavaScript. Voir chapitre 4.
- **Props** (*properties*) : les données qu'un composant parent transmet à un composant enfant, en lecture seule. Voir chapitre 6.
- **State** (état) : les données internes d'un composant, qui peuvent changer dans le temps et déclenchent un nouvel affichage quand elles changent. Voir chapitre 7.
- **Hook** : une fonction spéciale (toujours préfixée `use`) qui permet d'utiliser des fonctionnalités de React (state, effets de bord, contexte...) dans un composant fonction. Voir chapitres 7, 12 à 17.
- **Virtual DOM** : une représentation en mémoire de l'interface, que React compare à la version précédente pour ne mettre à jour que le strict nécessaire dans le vrai DOM du navigateur. Voir section 1.5.
- **Rendu (render)** : le processus par lequel React calcule à quoi doit ressembler l'interface à un instant donné.
- **Réconciliation (reconciliation)** : l'algorithme qui compare deux Virtual DOM (avant/après) pour calculer la différence minimale à appliquer au vrai DOM.

## 1.5 Comment React fonctionne réellement : le Virtual DOM

Le **DOM** (*Document Object Model*) est la représentation que le navigateur fait d'une page HTML. Le manipuler directement est **coûteux en performance** : chaque changement peut forcer le navigateur à recalculer les styles, la mise en page (layout) et à repeindre l'écran.

React introduit une couche intermédiaire : le **Virtual DOM**, un simple objet JavaScript léger qui représente l'interface voulue.

Voici ce qui se passe à chaque changement de données :

1. Une donnée change (ex : un `state` est mis à jour).
2. React recalcule un **nouveau Virtual DOM** décrivant à quoi l'interface devrait ressembler.
3. React compare ce nouveau Virtual DOM à l'ancien (algorithme de **diffing**).
4. React calcule la **différence minimale** (ex : "seul le texte de ce `<p>` a changé").
5. React applique **uniquement cette différence** au vrai DOM du navigateur.

```
$ # Schéma simplifié du cycle de rendu React
```

```
État change
    │
    ▼
Nouveau Virtual DOM calculé
    │
    ▼
Comparaison avec l'ancien Virtual DOM (diffing)
    │
    ▼
Liste des changements minimaux à appliquer
    │
    ▼
Mise à jour ciblée du vrai DOM (rendu à l'écran)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur de compréhension fréquente</span>
Le Virtual DOM ne rend pas React "magiquement plus rapide que tout" dans l'absolu — il rend surtout le code **plus simple à écrire et à maintenir** en évitant la manipulation manuelle du DOM, tout en gardant de bonnes performances par défaut. Les vraies optimisations de performance (chapitre 40) restent nécessaires sur des applications complexes.
</div>

## 1.6 Pourquoi choisir React (et quand ne pas le choisir)

**Choisis React quand :**
- Tu construis une interface avec beaucoup d'interactivité et d'état qui change souvent (tableaux de bord, réseaux sociaux, plateformes SaaS comme celles que tu développes déjà).
- Tu veux un vaste écosystème et une grande communauté (beaucoup de packages, de réponses sur Stack Overflow, de développeurs disponibles à embaucher).
- Tu veux pouvoir réutiliser tes compétences pour le mobile plus tard (React Native).

**Réfléchis à deux fois si :**
- Tu construis un site vitrine statique très simple (une page "brochure" avec peu d'interactivité) : du HTML/CSS pur, ou un générateur de site statique, sera plus rapide à livrer.
- Ton équipe a besoin d'une structure très stricte imposée dès le départ (formulaires, HTTP, state géré de façon homogène "out of the box") : Angular peut mieux convenir.
- Tu as besoin du meilleur SEO possible sans configuration supplémentaire : un framework par-dessus React comme **Next.js** (rendu côté serveur) sera nécessaire — React seul (Vite + React) rend côté client par défaut (voir chapitre 45 sur le SEO).

**Comparatif rapide avec les alternatives principales :**

| Critère | React | Vue | Angular |
|---|---|---|---|
| Type | Bibliothèque UI | Framework progressif | Framework complet |
| Syntaxe | JSX (JS + HTML mélangés) | Templates HTML + directives | Templates HTML + TypeScript |
| Gestion d'état intégrée | Non (Redux, Zustand, Context...) | Oui (Pinia) | Oui (services + RxJS) |
| Courbe d'apprentissage | Douce puis choix à faire | Douce | Plus raide |
| Cas d'usage typique | SaaS, apps riches, mobile (RN) | Sites moyens à complexes | Grandes applications d'entreprise |

## 1.7 L'écosystème React que tu vas apprendre dans ce manuel

React seul ne fait "que" l'affichage des composants. Pour construire une application complète comme celles que tu développes (BANKA, GESCOM, EduSpher...), on assemble plusieurs briques :

- **Vite** : l'outil qui crée et fait tourner ton projet React en local (chapitre 2).
- **React Router** : pour naviguer entre les pages (chapitre 19-20).
- **Redux Toolkit** ou **Context API** : pour partager des données entre composants éloignés (chapitres 13, 21-22).
- **Axios** : pour communiquer avec une API backend (chapitre 23).
- **React Hook Form + Zod/Yup** : pour gérer et valider les formulaires (chapitres 36-39).
- **Tailwind CSS / Material UI / Ant Design / Bootstrap** : pour le style visuel (chapitres 29-35).
- **Jest + React Testing Library** : pour tester le code (chapitre 43).
- **Vercel / Netlify** : pour mettre l'application en ligne (chapitre 46).

Ce manuel suit exactement cet ordre logique : d'abord les fondamentaux de React seul, puis chaque brique de l'écosystème, jusqu'au projet final qui les assemble toutes.

## 1.8 Erreurs fréquentes à ce stade (avant même d'écrire du code)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre React et un framework "tout-en-un"</span>
Beaucoup de débutants s'attendent à trouver un système de routing ou de requêtes HTTP "livré avec React". Ce n'est pas le cas : il faudra choisir/installer React Router et Axios (ou équivalents) toi-même. Ce n'est pas un manque, c'est un choix de conception (flexibilité).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Vouloir apprendre Redux avant de maîtriser le state local</span>
Beaucoup de tutoriels sautent directement à Redux. Dans ce manuel, on maîtrise d'abord `useState`, `props` et `Context API` (qui suffisent pour 80% des besoins réels) avant d'introduire Redux Toolkit pour les cas où il apporte une vraie valeur (chapitre 22).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Croire que "Virtual DOM" veut dire "toujours plus rapide"</span>
Comme vu en 1.5 : le Virtual DOM simplifie l'écriture du code, mais de mauvaises pratiques (ex : recréer des fonctions inutilement, ne pas utiliser les clés de liste correctement — chapitre 10) peuvent quand même dégrader les performances.
</div>

## 1.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1 — Comprendre le déclaratif</span>

Réécris en français, sous forme de phrase déclarative (le "quoi", pas le "comment"), le comportement suivant décrit ici de façon impérative :

*"Quand l'utilisateur clique sur le bouton 'Ajouter au panier', va chercher l'élément qui affiche le nombre d'articles dans le panier, augmente sa valeur de 1, puis va chercher l'icône du panier et fais-la clignoter brièvement."*
</div>

**Corrigé :**
> "Le nombre d'articles affiché est égal au nombre d'articles dans le panier. L'icône du panier clignote quand le panier vient d'être mis à jour."
>
> On ne décrit plus les étapes de manipulation du DOM : on décrit une **relation entre une donnée et l'affichage**. C'est exactement ce que fait un composant React avec son `state`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2 — Bibliothèque vs Framework</span>

Parmi les affirmations suivantes, laquelle est correcte ?

a) React impose une structure de dossiers stricte pour tous les projets.
b) React fournit un système de routing intégré par défaut.
c) React laisse le choix des outils de routing, de gestion d'état et de requêtes HTTP.
d) React ne peut pas être utilisé avec TypeScript.
</div>

**Corrigé :** Réponse **c**. React est volontairement minimaliste sur ces sujets : c'est justement l'objet des parties 3 et 4 de ce manuel (React Router, Redux Toolkit, Axios). La réponse (d) est fausse : TypeScript est même fortement recommandé en environnement professionnel (chapitre 18).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.3 — Réflexion projet</span>

Pense à une application que tu as déjà construite ou utilisée récemment (par exemple KONEKTE, EduSpher, ou une app tierce). Identifie 3 éléments de son interface qui pourraient être des "composants" réutilisables au sens de la section 1.1.
</div>

**Corrigé (exemple avec KONEKTE) :**
> - La **carte de profil** qu'on swipe (réutilisée à chaque profil affiché).
> - Le **bouton Like/Super Like** (même bouton, réutilisé sur plusieurs écrans : découverte, "Qui m'a liké").
> - La **bulle de message** dans le chat (réutilisée pour chaque message, avec un style différent selon si c'est "moi" ou "l'autre").

## 1.10 Résumé du chapitre

- React est une **bibliothèque JavaScript déclarative** pour construire des interfaces, pas un framework complet.
- Elle repose sur des **composants** réutilisables, un système de **props** et de **state**, et un **Virtual DOM** qui optimise les mises à jour de l'écran.
- L'écosystème (routing, gestion d'état globale, HTTP, style, tests) se choisit et s'assemble projet par projet.
- Ce manuel suit une progression : fondamentaux → hooks → navigation/état global → backend → style → validation → performance → qualité/déploiement → **projet final**.

*Chapitre suivant : installation et mise en place de l'environnement de développement avec Vite.*
