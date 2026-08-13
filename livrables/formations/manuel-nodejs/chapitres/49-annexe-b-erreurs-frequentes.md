<div class="chapitre-titre-num">ANNEXE B</div>

# Récapitulatif des erreurs fréquentes

| # | Erreur | Solution en bref | Chapitre |
|---|---|---|---|
| 1 | Bloquer l'event loop avec du code synchrone lourd (calcul, `*Sync`) | Déporter vers un worker thread ou une version asynchrone de l'opération | 1, 11, 40 |
| 2 | Utiliser `var` au lieu de `const`/`let`, perdant la portée de bloc | Toujours utiliser `const` par défaut, `let` seulement si réassignation nécessaire | 7 |
| 3 | Oublier que les fonctions fléchées n'ont pas leur propre `this` | Utiliser une fonction classique si `this` dynamique est nécessaire (ex. méthode d'objet) | 7 |
| 4 | Confondre `\|\|` et `??` sur une valeur légitimement à `0` ou `""` | Utiliser `??` dès qu'une valeur falsy légitime (0, "", false) doit être conservée | 7 |
| 5 | Oublier `return` après la gestion d'une erreur dans un callback | Toujours `return` après avoir appelé le callback d'erreur, pour stopper l'exécution | 8 |
| 6 | Oublier de retourner la Promise dans un `.then()`, cassant le chaînage | `return` systématiquement la valeur ou la Promise à l'intérieur d'un `.then()` | 9 |
| 7 | `await` en série sur des opérations indépendantes au lieu de `Promise.all` | Lancer les opérations indépendantes en parallèle avec `Promise.all` | 10 |
| 8 | Utiliser des méthodes `fs.*Sync` dans le traitement d'une requête HTTP | Toujours utiliser les versions asynchrones (`fs.promises.*`) dans un gestionnaire de route | 11 |
| 9 | Traiter `process.env.X` comme un booléen/nombre natif sans conversion | Convertir explicitement (`Number(...)`, comparaison `=== "true"`) — tout est une chaîne | 12 |
| 10 | Charger `dotenv.config()` après des modules qui dépendent déjà de `process.env` | Appeler `dotenv.config()` en toute première ligne du point d'entrée | 12 |
| 11 | Oublier `express.json()`, laissant `req.body` à `undefined` | Ajouter `app.use(express.json())` avant les routes qui lisent `req.body` | 13 |
| 12 | Oublier `next()` dans un middleware, bloquant la requête indéfiniment | Appeler `next()` dans toute branche qui ne termine pas la réponse elle-même | 14 |
| 13 | Contrôleur contenant directement la logique métier et l'accès aux données | Déplacer la logique vers un service, l'accès aux données vers un repository | 15, 17 |
| 14 | Contrôleur appelant directement un repository, en sautant le service | Toujours passer par la couche service, même pour une opération simple | 17 |
| 15 | Valider les données après les avoir déjà utilisées | Valider (Zod) en tout début de traitement, avant tout usage des données | 18 |
| 16 | Erreur async non capturée n'atteignant jamais le middleware d'erreurs (Express 4) | Envelopper les routes async dans un wrapper `try/catch` + `next(err)`, ou migrer vers Express 5 | 19 |
| 17 | Exposer une stack trace complète au client en production | Renvoyer un message générique en production, réserver la stack trace aux logs serveur | 19 |
| 18 | Journaliser des données sensibles (mots de passe, tokens complets) | Masquer ou omettre les champs sensibles avant journalisation | 20 |
| 19 | Recompter un total sans appliquer les mêmes filtres que la requête de données | Appliquer exactement le même `where`/filtre au `count` qu'à la requête paginée | 21 |
| 20 | Comparer un mot de passe en clair avec `===` au lieu de `bcrypt.compare()` | Toujours utiliser `bcrypt.compare()`, jamais de comparaison directe de chaîne | 22 |
| 21 | Utiliser la même clé secrète pour access token et refresh token | Utiliser deux secrets distincts, pour limiter l'impact d'une fuite de l'un des deux | 23 |
| 22 | Faire confiance à un rôle envoyé directement par le client | Toujours dériver le rôle du token JWT vérifié côté serveur, jamais du corps de la requête | 24 |
| 23 | RBAC seul sans vérifier le droit sur la ressource précise (IDOR) | Vérifier systématiquement que la ressource demandée appartient bien à l'utilisateur authentifié | 24 |
| 24 | Rate limiting en mémoire locale, incohérent sur plusieurs instances | Utiliser un store partagé (Redis) dès que l'application tourne sur plusieurs instances | 25, 40 |
| 25 | Concaténer une requête SQL au lieu d'utiliser des paramètres liés | Toujours utiliser des requêtes paramétrées (`$1`, `?`) ou un ORM, jamais de concaténation | 25, 31, 32 |
| 26 | Servir un dossier uploads/ entier en accès statique sans restriction | Servir les fichiers sensibles via une route authentifiée dédiée, jamais en statique direct | 26, 45 |
| 27 | Bloquer une réponse HTTP sur l'envoi d'un e-mail non critique | Envoyer la réponse HTTP d'abord, traiter l'e-mail de façon asynchrone/en arrière-plan | 27 |
| 28 | Documentation Swagger divergente du comportement réel du code | Maintenir la documentation au même endroit/commit que le code qu'elle décrit | 28 |
| 29 | Oublier `await` sur une assertion Jest asynchrone (`resolves`/`rejects`) | Toujours `await expect(...).resolves/.rejects...` pour que l'assertion soit réellement vérifiée | 29 |
| 30 | Exécuter des tests d'intégration contre la base de développement/production | Utiliser une base de données dédiée aux tests, isolée et réinitialisable | 30 |
| 31 | Utiliser `pool.query()` au lieu d'une connexion dédiée pour une transaction | Réserver un client unique (`pool.connect()`) pour toute la durée d'une transaction | 31, 32 |
| 32 | Oublier `client.release()`, épuisant progressivement le pool de connexions | Toujours libérer la connexion dans un bloc `finally` | 31 |
| 33 | Confondre la syntaxe `$1` (PostgreSQL) et `?` (MySQL) | Vérifier la syntaxe de paramétrage propre au moteur de base de données utilisé | 32 |
| 34 | Oublier de convertir un id en `ObjectId` avant une requête MongoDB | Convertir explicitement via `new ObjectId(id)` avant toute requête par identifiant | 33 |
| 35 | Oublier `.toArray()` sur un curseur `find()` MongoDB | Toujours terminer par `.toArray()` (ou itérer le curseur) pour obtenir les documents | 33 |
| 36 | Utiliser `tx`/connexion de transaction de façon incohérente (Prisma/Sequelize) | Passer systématiquement l'objet de transaction (`tx`/`{transaction: t}`) à chaque opération concernée | 34, 35 |
| 37 | `sequelize.sync()`/`hbm2ddl.auto=update`-like en production | Utiliser uniquement des migrations explicites en production, jamais de synchronisation automatique | 35 |
| 38 | Oublier `runValidators: true` sur une mise à jour Mongoose | Ajouter `{ runValidators: true }` à chaque `findByIdAndUpdate`/`updateOne` | 36 |
| 39 | Copier `node_modules` local dans l'image Docker, sans `.dockerignore` | Ajouter un `.dockerignore` excluant `node_modules`, laisser `npm ci` réinstaller dans l'image | 37 |
| 40 | Utiliser `localhost` au lieu du nom de service dans Docker Compose | Utiliser le nom du service défini dans `docker-compose.yml` pour la résolution réseau interne | 38 |
| 41 | Appliquer des migrations après (et non avant) le redémarrage de la nouvelle version | Toujours exécuter les migrations avant de démarrer la nouvelle version de l'application | 39 |
| 42 | Optimiser sans avoir mesuré de goulot d'étranglement réel | Profiler et mesurer avant toute optimisation, jamais par simple intuition | 40 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser cette annexe</span>
Face à un bug non identifié dans une API Node.js/Express, parcours cette liste par mots-clés avant de chercher ailleurs — la majorité des erreurs de débutant à intermédiaire sur ce stack appartiennent à l'une de ces catégories déjà documentées avec leur solution dans le chapitre correspondant.
</div>
