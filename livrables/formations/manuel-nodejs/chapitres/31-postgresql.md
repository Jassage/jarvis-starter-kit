<div class="chapitre-titre-num">CHAPITRE 31</div>

# Connexion à PostgreSQL

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Se connecter à PostgreSQL depuis Node.js avec le driver `pg`, exécuter des requêtes paramétrées, et gérer un pool de connexions correctement. À la fin de ce chapitre, tu sauras pourquoi une transaction bancaire mal gérée peut corrompre silencieusement des données, et comment l'éviter structurellement.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un client de BANKA (l'application de gestion bancaire évoquée dans ce portefeuille) signale qu'un virement entre deux comptes a débité le compte source sans jamais créditer le compte destinataire — l'argent a littéralement disparu. En investiguant, tu découvres que le code utilisait `pool.query("BEGIN")` puis deux `pool.query("UPDATE ...")` séparés, plutôt qu'une connexion dédiée : le pool a distribué chaque requête à une connexion **différente**, et le `BEGIN` d'une connexion n'a jamais concerné les `UPDATE` exécutés sur d'autres connexions. Ce chapitre construit exactement le mécanisme qui empêche ce genre d'incident — un des pièges les plus sérieux et les plus silencieux de ce chapitre.
</div>

## 31.1 Installer et configurer le driver pg

```
$ npm install pg
```

```js
// src/config/db.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ex: postgresql://user:password@localhost:5432/mabase
});

module.exports = pool;
```

## 31.2 Le pool de connexions : pourquoi il est indispensable

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ne jamais ouvrir une connexion par requête</span>
Ouvrir une nouvelle connexion TCP à la base de données à chaque requête HTTP serait extrêmement coûteux en performance (établir une connexion prend un temps non négligeable). Un **pool de connexions** maintient un ensemble de connexions déjà ouvertes et les **réutilise** entre les requêtes, empruntant une connexion libre du pool puis la restituant une fois la requête terminée.
</div>

```mermaid
flowchart TD
    A["pool.query(...)"] --> B{"Une connexion\nLIBRE est disponible ?"}
    B -->|"Oui"| C["Emprunte cette connexion"]
    B -->|"Non, pool plein"| D["Attend qu'une connexion\nse libere (connectionTimeoutMillis)"]
    D --> C
    C --> E["Execute la requete"]
    E --> F["Restitue AUTOMATIQUEMENT\nla connexion au pool"]
    F --> G["Connexion redevient LIBRE,\nprete pour la PROCHAINE requete\n(potentiellement d'un AUTRE appel)"]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma</span>
Chaque `pool.query()` emprunte puis restitue automatiquement une connexion — mais rien ne garantit que deux appels `pool.query()` successifs utilisent la **même** connexion physique. C'est précisément ce mécanisme qui a causé l'incident de la mise en situation d'ouverture : `BEGIN` et les `UPDATE` suivants pouvaient très bien atterrir sur des connexions différentes.
</div>

```js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                     // nombre maximum de connexions simultanées dans le pool
  idleTimeoutMillis: 30000,    // ferme une connexion inactive après 30s
  connectionTimeoutMillis: 5000, // délai maximum pour obtenir une connexion avant d'échouer
});
```

## 31.3 Exécuter des requêtes paramétrées (rappel du chapitre 25)

```js
const pool = require("../config/db");

async function trouverParEmail(email) {
  const resultat = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
  return resultat.rows[0] || null; // rows : TOUJOURS un tableau, même pour une seule ligne attendue
}

async function creer({ nom, email, motDePasseHash }) {
  const resultat = await pool.query(
    "INSERT INTO utilisateurs (nom, email, mot_de_passe_hash) VALUES ($1, $2, $3) RETURNING *",
    [nom, email, motDePasseHash]
  );
  return resultat.rows[0];
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 RETURNING * : récupérer la ligne insérée en une seule requête</span>
PostgreSQL permet d'ajouter `RETURNING *` (ou des colonnes précises) à un `INSERT`/`UPDATE`/`DELETE`, retournant directement la ligne affectée — évitant une seconde requête `SELECT` séparée pour récupérer l'id auto-généré ou les valeurs par défaut appliquées.
</div>

## 31.4 Transactions avec le driver pg : corriger l'incident de la mise en situation

```js
async function transfererFonds(compteSourceId, compteDestId, montant) {
  const client = await pool.connect(); // emprunte UNE connexion dédiée du pool pour toute la transaction

  try {
    await client.query("BEGIN");

    await client.query("UPDATE comptes SET solde = solde - $1 WHERE id = $2", [montant, compteSourceId]);
    await client.query("UPDATE comptes SET solde = solde + $1 WHERE id = $2", [montant, compteDestId]);

    await client.query("COMMIT");
  } catch (erreur) {
    await client.query("ROLLBACK");
    throw erreur;
  } finally {
    client.release(); // rend la connexion au pool, INDISPENSABLE dans tous les cas (succès ou échec)
  }
}
```

```mermaid
sequenceDiagram
    participant App
    participant Pool
    participant Client as Connexion DEDIEE (client)
    participant DB as PostgreSQL

    App->>Pool: pool.connect()
    Pool-->>App: UNE connexion dediee (client)
    App->>Client: client.query("BEGIN")
    Client->>DB: BEGIN
    App->>Client: client.query("UPDATE compte source")
    Client->>DB: UPDATE (meme connexion)
    App->>Client: client.query("UPDATE compte dest")
    Client->>DB: UPDATE (MEME connexion, garanti)
    alt Tout reussit
        App->>Client: client.query("COMMIT")
        Client->>DB: COMMIT - les deux UPDATE valides ENSEMBLE
    else Une erreur survient
        App->>Client: client.query("ROLLBACK")
        Client->>DB: ROLLBACK - AUCUN des deux UPDATE applique
    end
    App->>Pool: client.release()
    Note over Pool: Connexion rendue disponible\npour d'autres requetes
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication du schéma</span>
`pool.connect()` retire une connexion du pool et la réserve exclusivement à l'appelant jusqu'à `client.release()` — garantissant que `BEGIN`, les deux `UPDATE`, et `COMMIT`/`ROLLBACK` s'exécutent tous sur la **même** connexion physique, la seule façon dont PostgreSQL peut considérer ces opérations comme une transaction unique et atomique. C'est exactement ce qui manquait dans l'incident de la mise en situation d'ouverture.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une transaction DOIT utiliser une connexion DÉDIÉE, pas le pool directement</span>

```js
// ❌ Chaque pool.query() peut emprunter une connexion DIFFÉRENTE du pool, cassant la transaction !
await pool.query("BEGIN");
await pool.query("UPDATE ..."); // peut s'exécuter sur une AUTRE connexion que le BEGIN précédent
await pool.query("COMMIT");
```
`pool.query()` emprunte et restitue automatiquement une connexion à **chaque appel**, sans garantie que ce soit la même d'un appel à l'autre — une transaction SQL doit impérativement rester sur la **même** connexion du début (`BEGIN`) à la fin (`COMMIT`/`ROLLBACK`), d'où l'usage explicite de `pool.connect()` (section 31.4). Exactement l'erreur qui a causé la disparition d'argent dans la mise en situation d'ouverture.
</div>

## 31.5 Toujours relâcher une connexion empruntée

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier client.release() épuise progressivement le pool</span>
Si `client.release()` n'est pas appelé (notamment en cas d'exception non gérée par un `finally`), cette connexion reste **indéfiniment** empruntée au pool, jamais restituée. À terme, toutes les connexions du pool sont épuisées, et l'application ne peut plus exécuter aucune requête — un `finally { client.release(); }` systématique (comme en section 31.4) est donc indispensable pour tout usage de `pool.connect()`.
</div>

## 31.6 Fermer proprement le pool à l'arrêt de l'application

```js
process.on("SIGTERM", async () => {
  console.log("Arrêt du serveur, fermeture du pool de connexions...");
  await pool.end();
  process.exit(0);
});
```

## Atelier — Reproduire puis corriger l'incident de virement

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 31 — De la perte d'argent silencieuse à la transaction sûre</span>

**Objectif** : reproduire exactement le bug de la mise en situation d'ouverture, puis vérifier la correction.

**Préparation** : une table `comptes` de test avec deux comptes ayant chacun un solde initial connu.

**Étapes détaillées** :
1. Écris une version buggée de `transfererFonds` utilisant `pool.query()` directement (comme l'exemple "❌" de la section 31.4).
2. Appelle-la plusieurs fois en parallèle (`Promise.all` avec plusieurs transferts simultanés) sur un pool de petite taille (`max: 2`, pour forcer des connexions différentes plus facilement) : observe si les soldes finaux sont cohérents avec les transferts effectués.
3. Corrige avec `pool.connect()` (section 31.4) et répète le même test.
4. Vérifie que la somme totale des soldes des deux comptes reste strictement invariante après tous les transferts, dans les deux versions, mais que seule la version corrigée garantit qu'aucun virement individuel n'est jamais "à moitié" appliqué en cas d'erreur simulée.

**Validation** : en simulant une erreur au milieu de la fonction (par exemple, forcer une exception entre les deux `UPDATE`), la version corrigée doit laisser les deux comptes totalement inchangés (rollback complet), jamais un seul des deux `UPDATE` appliqué.

**Résultat attendu** : la démonstration concrète de la différence entre une transaction réelle et une fausse transaction qui ne fait illusion qu'en l'absence d'erreur.

**Dépannage** : si le bug ne se reproduit pas facilement avec la version buggée, augmente le nombre de transferts simultanés ou réduis la taille du pool pour forcer davantage de changements de connexion entre les appels.

**Nettoyage** : remets les soldes de test à leur valeur initiale.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre les index de paramètres ($1, $2...) avec ceux de MySQL (?)</span>

```js
// ❌ PostgreSQL utilise $1, $2... — la syntaxe "?" est celle de MySQL (chapitre 32), pas de PostgreSQL
await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);
```
```js
// ✅ Syntaxe correcte pour PostgreSQL
await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Utiliser pool.query() pour une transaction multi-requêtes</span>
Exactement l'incident de la mise en situation d'ouverture — l'erreur la plus coûteuse possible dans ce chapitre, avec des conséquences financières réelles si elle atteint la production d'une application bancaire ou commerciale.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "sorry, too many clients already" ou pool épuisé</span>

- **Cause probable** : des connexions empruntées via `pool.connect()` jamais relâchées (erreur de la section 31.5, souvent une exception non capturée avant `client.release()`).
- **Diagnostic** : vérifier que chaque `pool.connect()` est systématiquement suivi d'un `finally { client.release(); }`.
- **Solution** : ajouter le `finally` manquant ; en urgence, redémarrer le processus applicatif libère toutes les connexions du pool.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : des données incohérentes après une opération censée être atomique</span>

- **Cause probable** : transaction implémentée avec `pool.query()` au lieu de `pool.connect()` (erreur fréquente n°2, exactement l'incident de la mise en situation d'ouverture).
- **Solution** : migrer vers le pattern `pool.connect()` + `try/catch/finally` de la section 31.4.
</div>

## En entreprise

- **Revue de code systématique sur les transactions financières** : dans les applications manipulant de l'argent réel (BANKA, GESCOM dans ce portefeuille), toute fonction touchant à des soldes ou des paiements fait l'objet d'une attention particulière en revue de code, précisément à cause du risque de l'incident de la mise en situation d'ouverture.
- **Monitoring de la taille du pool** : de nombreuses équipes surveillent le nombre de connexions actives/disponibles du pool en production, un indicateur précoce de fuite de connexions avant qu'elle ne devienne critique.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi un pool de connexions plutôt qu'une connexion par requête ?"**
Réponse attendue : établir une connexion TCP est coûteux en temps ; un pool maintient des connexions déjà ouvertes et les réutilise, évitant ce coût répété à chaque requête.

**Q2. "Pourquoi une transaction ne peut-elle pas utiliser pool.query() directement ?"**
Réponse attendue : chaque appel `pool.query()` peut emprunter une connexion différente du pool, alors qu'une transaction SQL doit rester sur une seule et même connexion du `BEGIN` au `COMMIT`/`ROLLBACK` — d'où l'usage de `pool.connect()` pour réserver une connexion dédiée.

**Q3. "Que se passe-t-il si client.release() n'est jamais appelé ?"**
Réponse attendue : la connexion reste indéfiniment réservée, réduisant progressivement le nombre de connexions disponibles dans le pool jusqu'à son épuisement complet, rendant l'application incapable d'exécuter de nouvelles requêtes.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les requêtes paramétrées (`$1`, `$2`...) ne sont pas optionnelles — elles constituent la principale défense contre l'injection SQL (rappel du chapitre 25), pour toute donnée provenant d'une entrée utilisateur.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Dimensionner `max` (taille du pool) selon la charge réelle attendue — un pool trop petit crée une file d'attente sous forte charge concurrente ; un pool trop grand gaspille des ressources côté base de données sans bénéfice réel.
</div>

## Résumé du chapitre

- Le driver `pg` fournit un `Pool` de connexions réutilisables, bien plus performant qu'une connexion ouverte à chaque requête.
- Les requêtes paramétrées (`$1`, `$2`...) protègent contre l'injection SQL, avec `RETURNING *` pour récupérer la ligne affectée en une seule requête.
- Une transaction doit impérativement utiliser une connexion dédiée (`pool.connect()`), jamais le pool directement — sous peine de données incohérentes, comme dans l'incident de la mise en situation d'ouverture.
- `client.release()` doit toujours être appelé dans un `finally`, sous peine d'épuiser progressivement le pool.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Pourquoi utiliser un pool de connexions ?
   - a) Pour ralentir volontairement les requêtes
   - b) Pour réutiliser des connexions déjà ouvertes, évitant le coût d'une nouvelle connexion à chaque requête
   - c) PostgreSQL l'exige techniquement pour fonctionner
   - d) Pour chiffrer les requêtes

2. Pourquoi pool.query() ne convient-il pas pour une transaction ?
   - a) Il est trop lent
   - b) Chaque appel peut utiliser une connexion différente, cassant l'atomicité de la transaction
   - c) pool.query() n'existe pas dans le driver pg
   - d) Aucune raison particulière

3. Que faut-il toujours faire après pool.connect() ?
   - a) Rien de spécial
   - b) Appeler client.release() dans un finally
   - c) Fermer tout le pool
   - d) Relancer le serveur

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Deux appels pool.query() successifs utilisent garantie la même connexion physique. — **Faux**.
2. PostgreSQL utilise la syntaxe $1, $2 pour les paramètres, contrairement à MySQL. — **Vrai**.
3. Oublier client.release() n'a aucune conséquence à long terme. — **Faux** (épuise progressivement le pool).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Pourquoi l'incident de virement de la mise en situation d'ouverture n'a-t-il probablement pas été détecté immédiatement en développement, mais seulement signalé plus tard par un vrai client ?

**Corrigé** : le bug ne se manifeste que lorsque deux requêtes successives (`BEGIN` et un `UPDATE`, par exemple) empruntent réellement des connexions **différentes** du pool — un comportement probabiliste, pas systématique. Avec un pool peu sollicité en développement (peu de requêtes concurrentes), les mêmes connexions sont souvent réutilisées par coïncidence, masquant le bug. En production, sous charge réelle avec de nombreuses requêtes concurrentes, la probabilité que deux requêtes consécutives empruntent des connexions différentes augmente fortement, révélant le problème — exactement le genre de bug qui "marche en développement" mais échoue silencieusement en production.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 31.1</span>

Écris une fonction `mettreAJourStock(produitId, quantite)` qui décrémente le stock d'un produit de façon atomique (compare-and-swap, rappel du principe déjà vu dans les manuels React et Java de ce même auteur), en utilisant `pool.query` directement (pas de transaction multi-requêtes nécessaire ici, une seule requête UPDATE suffit).
</div>

**Corrigé :**
```js
async function decrementerStockAtomique(produitId, quantite) {
  const resultat = await pool.query(
    "UPDATE produits SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *",
    [quantite, produitId]
  );
  if (resultat.rows.length === 0) {
    throw new Error("Stock insuffisant");
  }
  return resultat.rows[0];
}
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais configurer un pool de connexions PostgreSQL.</li>
<li>☐ Je sais écrire des requêtes paramétrées avec la syntaxe $1, $2.</li>
<li>☐ Je sais implémenter une transaction correctement avec pool.connect().</li>
<li>☐ Je relâche systématiquement une connexion empruntée dans un finally.</li>
<li>☐ Je comprends pourquoi pool.query() est dangereux pour une transaction multi-requêtes.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours utiliser pool.connect() plutôt que pool.query() ?</dt>
<dd>Non, pool.query() convient parfaitement pour une requête unique (comme dans l'exercice 31.1). pool.connect() n'est nécessaire que pour une séquence de requêtes devant s'exécuter sur la même connexion (transactions).</dd>

<dt>Que se passe-t-il si deux transactions tentent de modifier le même compte simultanément ?</dt>
<dd>PostgreSQL gère le verrouillage au niveau ligne automatiquement pendant une transaction — la seconde transaction attend que la première se termine (COMMIT ou ROLLBACK) avant de pouvoir modifier la même ligne, garantissant la cohérence sans intervention manuelle supplémentaire.</dd>

<dt>Le pool de connexions est-il partagé entre plusieurs instances du serveur (Docker, load balancer) ?</dt>
<dd>Non, chaque instance du serveur maintient son propre pool indépendant — dimensionner `max` en tenant compte du nombre total d'instances déployées, pour ne pas dépasser la limite de connexions maximale configurée côté PostgreSQL.</dd>
</dl>

## Références et pour aller plus loin

- Documentation node-postgres (pg) : [https://node-postgres.com](https://node-postgres.com)
- Documentation PostgreSQL sur les transactions : [https://www.postgresql.org/docs/current/tutorial-transactions.html](https://www.postgresql.org/docs/current/tutorial-transactions.html)

*Chapitre suivant : la connexion à MySQL, avec ses particularités par rapport à PostgreSQL.*
