<div class="chapitre-titre-num">ANNEXE C</div>

# Glossaire des termes React

**Access token** — Jeton d'authentification à durée de vie courte, transmis à chaque requête API. Voir chapitre 26.

**ARIA** — *Accessible Rich Internet Applications*, ensemble d'attributs HTML complétant l'accessibilité pour les technologies d'assistance. Voir chapitre 44.

**Bundle** — Le ou les fichiers JavaScript/CSS finaux générés par le build, envoyés au navigateur. Voir chapitres 2 et 42.

**Children** — Prop spéciale contenant le contenu placé entre les balises ouvrante/fermante d'un composant. Voir chapitres 5-6.

**Code splitting** — Découpage du bundle final en plusieurs fichiers chargés à la demande. Voir chapitre 42.

**Composant** — Fonction JavaScript (PascalCase) retournant du JSX, unité de base de toute interface React. Voir chapitre 5.

**Composant contrôlé** — Champ de formulaire dont la valeur est gérée par le state React. Voir chapitre 11.

**Composant non contrôlé** — Champ de formulaire dont la valeur est gérée par le DOM natif, lue via une `ref`. Voir chapitres 11 et 16.

**Context** — Mécanisme de transport de données à travers l'arbre de composants, sans prop drilling. Voir chapitre 13.

**CORS** — *Cross-Origin Resource Sharing*, mécanisme de sécurité navigateur régissant les requêtes entre domaines différents. Voir chapitre 26.

**CSS Modules** — Fichiers CSS dont les classes sont automatiquement scopées à un composant. Voir chapitre 30.

**Dispatch** — Fonction envoyant une action à un reducer (`useReducer`) ou à un store Redux. Voir chapitres 14 et 21.

**Error Boundary** — Composant classe interceptant les erreurs de rendu de ses enfants. Voir chapitre 24.

**Fragment** — `<>...</>`, regroupe plusieurs éléments JSX sans ajouter de nœud au DOM final. Voir chapitre 4.

**Hook** — Fonction spéciale préfixée `use`, permettant d'utiliser des fonctionnalités React (state, effets...) dans un composant fonction. Voir chapitres 7, 12 à 17.

**Hydratation** — Processus par lequel React "rattache" son fonctionnement interactif à un HTML déjà généré (SSR). Voir chapitre 45.

**HMR** — *Hot Module Replacement*, mise à jour du navigateur sans rechargement complet ni perte de state, pendant le développement. Voir chapitre 2.

**Immuabilité** — Principe consistant à ne jamais modifier un state/objet existant, mais à en créer une copie modifiée. Voir chapitres 7 et 14.

**JSX** — Extension de syntaxe JavaScript permettant d'écrire une structure proche du HTML dans le code. Voir chapitre 4.

**JWT** — *JSON Web Token*, jeton signé transportant des informations d'authentification. Voir chapitre 26.

**Lazy loading** — Chargement différé d'un composant, téléchargé seulement au moment où il est réellement nécessaire. Voir chapitre 41.

**Middleware (Redux)** — Fonction interceptant les actions dispatchées avant qu'elles n'atteignent le reducer.

**Prop drilling** — Transmission d'une prop à travers plusieurs niveaux de composants intermédiaires qui n'en ont pas besoin eux-mêmes. Voir chapitre 6.

**Props** — Données transmises d'un composant parent vers un composant enfant, en lecture seule. Voir chapitre 6.

**RBAC** — *Role-Based Access Control*, contrôle d'accès basé sur les rôles utilisateur. Voir chapitre 27.

**Reconciliation (réconciliation)** — Algorithme comparant deux Virtual DOM pour calculer la différence minimale à appliquer au DOM réel. Voir chapitre 1.

**Reducer** — Fonction pure décrivant les transitions d'état possibles en réponse à des actions. Voir chapitre 14, 21.

**Refresh token** — Jeton longue durée permettant d'obtenir un nouvel access token sans redemander les identifiants. Voir chapitre 26.

**Render (rendu)** — Processus par lequel React calcule à quoi doit ressembler l'interface à un instant donné.

**RTK Query** — Extension de Redux Toolkit gérant automatiquement cache et revalidation des données serveur. Voir chapitre 21.

**Selector (Redux)** — Fonction lisant une portion précise du state global via `useSelector`. Voir chapitre 21.

**SEO** — *Search Engine Optimization*, optimisation pour les moteurs de recherche. Voir chapitre 45.

**Slice (Redux Toolkit)** — Portion du store Redux dédiée à un domaine, regroupant state initial et reducers. Voir chapitre 21.

**SPA** — *Single Page Application*, application web tenant dans une seule page HTML, dont le contenu est mis à jour dynamiquement en JavaScript. Voir chapitre 3.

**SSG** — *Static Site Generation*, génération du HTML à l'avance, au moment du build. Voir chapitre 45.

**SSR** — *Server-Side Rendering*, génération du HTML côté serveur à chaque requête. Voir chapitre 45.

**State (état)** — Donnée interne d'un composant, dont la modification déclenche un nouveau rendu. Voir chapitre 7.

**Store (Redux)** — Conteneur unique de tout le state global géré par Redux. Voir chapitre 21.

**StrictMode** — Mode de développement React exécutant volontairement certains effets deux fois pour révéler les effets mal nettoyés. Voir chapitres 3 et 12.

**Suspense** — Composant React affichant un contenu de repli pendant qu'une ressource asynchrone (composant lazy) n'est pas encore prête. Voir chapitre 41.

**Thunk** — Fonction asynchrone dispatchée dans Redux, gérée par `createAsyncThunk`. Voir chapitre 21.

**Tree shaking** — Élimination du code jamais importé/utilisé lors du build final. Voir chapitre 42.

**TypeScript** — Sur-ensemble de JavaScript ajoutant un système de types statiques vérifiés à la compilation. Voir chapitre 18.

**Virtual DOM** — Représentation en mémoire de l'interface, comparée à la version précédente pour optimiser les mises à jour du DOM réel. Voir chapitre 1.

**XSS** — *Cross-Site Scripting*, faille de sécurité permettant l'injection de scripts malveillants dans une page. Voir chapitre 28.
