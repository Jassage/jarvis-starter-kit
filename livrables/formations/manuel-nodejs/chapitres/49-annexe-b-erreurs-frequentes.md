<div class="chapitre-titre-num">ANNEXE B</div>

# Récapitulatif des erreurs fréquentes

| # | Erreur | Chapitre |
|---|---|---|
| 1 | Bloquer l'event loop avec du code synchrone lourd (calcul, `*Sync`) | 1, 11, 40 |
| 2 | Utiliser `var` au lieu de `const`/`let`, perdant la portée de bloc | 7 |
| 3 | Oublier que les fonctions fléchées n'ont pas leur propre `this` | 7 |
| 4 | Confondre `\|\|` et `??` sur une valeur légitimement à `0` ou `""` | 7 |
| 5 | Oublier `return` après la gestion d'une erreur dans un callback | 8 |
| 6 | Oublier de retourner la Promise dans un `.then()`, cassant le chaînage | 9 |
| 7 | `await` en série sur des opérations indépendantes au lieu de `Promise.all` | 10 |
| 8 | Utiliser des méthodes `fs.*Sync` dans le traitement d'une requête HTTP | 11 |
| 9 | Traiter `process.env.X` comme un booléen/nombre natif sans conversion | 12 |
| 10 | Charger `dotenv.config()` après des modules qui dépendent déjà de `process.env` | 12 |
| 11 | Oublier `express.json()`, laissant `req.body` à `undefined` | 13 |
| 12 | Oublier `next()` dans un middleware, bloquant la requête indéfiniment | 14 |
| 13 | Contrôleur contenant directement la logique métier et l'accès aux données | 15, 17 |
| 14 | Contrôleur appelant directement un repository, en sautant le service | 17 |
| 15 | Valider les données après les avoir déjà utilisées | 18 |
| 16 | Erreur async non capturée n'atteignant jamais le middleware d'erreurs (Express 4) | 19 |
| 17 | Exposer une stack trace complète au client en production | 19 |
| 18 | Journaliser des données sensibles (mots de passe, tokens complets) | 20 |
| 19 | Recompter un total sans appliquer les mêmes filtres que la requête de données | 21 |
| 20 | Comparer un mot de passe en clair avec `===` au lieu de `bcrypt.compare()` | 22 |
| 21 | Utiliser la même clé secrète pour access token et refresh token | 23 |
| 22 | Faire confiance à un rôle envoyé directement par le client | 24 |
| 23 | RBAC seul sans vérifier le droit sur la ressource précise (IDOR) | 24 |
| 24 | Rate limiting en mémoire locale, incohérent sur plusieurs instances | 25, 40 |
| 25 | Concaténer une requête SQL au lieu d'utiliser des paramètres liés | 25, 31, 32 |
| 26 | Servir un dossier uploads/ entier en accès statique sans restriction | 26, 45 |
| 27 | Bloquer une réponse HTTP sur l'envoi d'un e-mail non critique | 27 |
| 28 | Documentation Swagger divergente du comportement réel du code | 28 |
| 29 | Oublier `await` sur une assertion Jest asynchrone (`resolves`/`rejects`) | 29 |
| 30 | Exécuter des tests d'intégration contre la base de développement/production | 30 |
| 31 | Utiliser `pool.query()` au lieu d'une connexion dédiée pour une transaction | 31, 32 |
| 32 | Oublier `client.release()`, épuisant progressivement le pool de connexions | 31 |
| 33 | Confondre la syntaxe `$1` (PostgreSQL) et `?` (MySQL) | 32 |
| 34 | Oublier de convertir un id en `ObjectId` avant une requête MongoDB | 33 |
| 35 | Oublier `.toArray()` sur un curseur `find()` MongoDB | 33 |
| 36 | Utiliser `tx`/connexion de transaction de façon incohérente (Prisma/Sequelize) | 34, 35 |
| 37 | `sequelize.sync()`/`hbm2ddl.auto=update`-like en production | 35 |
| 38 | Oublier `runValidators: true` sur une mise à jour Mongoose | 36 |
| 39 | Copier `node_modules` local dans l'image Docker, sans `.dockerignore` | 37 |
| 40 | Utiliser `localhost` au lieu du nom de service dans Docker Compose | 38 |
| 41 | Appliquer des migrations après (et non avant) le redémarrage de la nouvelle version | 39 |
| 42 | Optimiser sans avoir mesuré de goulot d'étranglement réel | 40 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser cette annexe</span>
Face à un bug non identifié dans une API Node.js/Express, parcours cette liste par mots-clés avant de chercher ailleurs — la majorité des erreurs de débutant à intermédiaire sur ce stack appartiennent à l'une de ces catégories déjà documentées avec leur solution dans le chapitre correspondant.
</div>
