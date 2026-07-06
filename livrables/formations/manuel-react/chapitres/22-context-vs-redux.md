<div class="chapitre-titre-num">CHAPITRE 22</div>

# Choisir entre Context API et Redux

## 22.1 Ce ne sont pas des concurrents directs

Une confusion fréquente : penser que Context API et Redux Toolkit résolvent exactement le même problème et qu'il faut choisir "le meilleur" une fois pour toutes. En réalité :

- **Context API** est un mécanisme de **transport** de données à travers l'arbre de composants (résout le prop drilling). Ce n'est **pas** un outil de gestion d'état à proprement parler.
- **Redux Toolkit** est un véritable **système de gestion d'état** avec des règles strictes (state en lecture seule, modifications via actions/reducers uniquement), des outils de débogage puissants (Redux DevTools), et des mécanismes avancés (middleware, thunks, cache RTK Query).

On peut très bien utiliser Context API pour transporter le store Redux lui-même (c'est d'ailleurs ce que fait `<Provider store={store}>` de `react-redux` en coulisses).

## 22.2 Tableau de décision

| Critère | Context API + useState/useReducer | Redux Toolkit |
|---|---|---|
| Taille du projet | Petit à moyen | Moyen à grand |
| Fréquence de changement du state global | Rare (thème, langue, utilisateur connecté) | Fréquent (panier, notifications temps réel, filtres complexes) |
| Nombre de composants qui lisent des parties différentes du state | Peu, ou tous lisent la même chose | Beaucoup, chacun lisant des tranches différentes |
| Outils de débogage (voir l'historique des changements) | Aucun par défaut | Redux DevTools (rejouer chaque action, voyager dans le temps) |
| Besoin de logique métier centralisée et testée isolément | Optionnel | Naturel (reducers = fonctions pures testables) |
| Coût d'apprentissage / mise en place | Très faible | Modéré (slices, store, providers) |
| Risque de re-rendus inutiles à grande échelle | Plus élevé (tout Context change = tous les consommateurs re-rendent, chapitre 13) | Plus faible (`useSelector` ne re-rend que si la portion précise lue change) |

## 22.3 Une règle pratique simple

<div class="encadre astuce">
<span class="encadre-titre">💡 Commence toujours par Context + useState/useReducer</span>
Sur un nouveau projet, démarre avec Context API (chapitres 13-14). Bascule vers Redux Toolkit **seulement** quand un signe concret apparaît :
- Le state global est lu et modifié par **de très nombreux composants** répartis dans toute l'application.
- Tu as besoin de **déboguer** précisément une séquence d'actions (Redux DevTools devient précieux).
- La logique de mise à jour du state devient complexe au point de mériter d'être testée **indépendamment** de React.
- Tu constates des re-rendus en cascade difficiles à contrôler avec de simples Contexts.

Ne commence **jamais** un projet avec Redux "par habitude" ou "parce que c'est standard" : c'est un coût de mise en place et d'apprentissage qui ne se justifie que face à un vrai besoin.
</div>

## 22.4 Exemple concret sur les projets de Jaslin

- **EduSpher** : l'utilisateur connecté et le thème passent naturellement par un `AuthContext`/`ThemeContext` (state qui change rarement). Les notifications et messages, mis à jour par polling toutes les quelques secondes et lus uniquement par les composants concernés (badge, liste), justifieraient un passage à Redux Toolkit ou RTK Query si l'application grandissait encore en complexité.
- **BANKA** : un système avec 7 rôles RBAC, des notifications temps réel SSE, de nombreux modules interdépendants (comptabilité, RH, transactions) — un candidat plus naturel pour Redux Toolkit si le state partagé entre modules devenait difficile à suivre avec de simples Contexts.

## 22.5 On peut combiner les deux

Rien n'empêche de garder Context API pour les données globales rares (auth, thème) **et** Redux Toolkit pour le state métier qui change souvent (panier, filtres de recherche partagés, données temps réel) dans la **même** application. Ce n'est pas un choix binaire pour tout le projet, mais une décision **par domaine de données**.

## 22.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

Pour chacun des besoins suivants, indique s'il est plus adapté à Context API ou à Redux Toolkit, en justifiant en une phrase :
1. Le thème clair/sombre de l'application.
2. Le panier d'achat d'une boutique en ligne avec ajout/retrait fréquents et affichage du total dans le header, la page panier et la page checkout.
3. La langue d'affichage choisie par l'utilisateur.
4. Les résultats d'une recherche avec filtres multiples partagés entre une barre de filtres, une liste de résultats et une carte interactive.
</div>

**Corrigé :**
1. **Context API** — change rarement, lu par peu de composants.
2. **Redux Toolkit** — modifié fréquemment, lu par plusieurs composants distants, bénéficierait du debugging Redux DevTools.
3. **Context API** — change rarement, cas typique de préférence globale.
4. **Redux Toolkit** (ou au minimum `useReducer` + Context) — état complexe partagé par plusieurs composants indépendants qui doivent tous rester synchronisés.

## 22.7 Résumé du chapitre

- Context API transporte des données ; Redux Toolkit est un véritable système de gestion d'état avec outils de débogage.
- Démarre par Context + useState/useReducer ; bascule vers Redux Toolkit face à un besoin concret (ampleur, fréquence de changement, debugging, tests).
- Le choix se fait **par domaine de données**, pas une fois pour toutes pour l'ensemble du projet.

*Ceci clôt la Partie 3 (Navigation et état global). Chapitre suivant : Axios et la consommation d'API REST, première étape de la Partie 4 (communication avec le backend).*
