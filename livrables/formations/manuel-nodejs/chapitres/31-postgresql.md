<div class="chapitre-titre-num">CHAPITRE 31</div>

# Connexion à PostgreSQL

## Objectifs pédagogiques

Se connecter à PostgreSQL depuis Node.js avec le driver `pg`, exécuter des requêtes paramétrées, et gérer un pool de connexions correctement.

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

## 31.4 Transactions avec le driver pg

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

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une transaction DOIT utiliser une connexion DÉDIÉE, pas le pool directement</span>
```js
// ❌ Chaque pool.query() peut emprunter une connexion DIFFÉRENTE du pool, cassant la transaction !
await pool.query("BEGIN");
await pool.query("UPDATE ..."); // peut s'exécuter sur une AUTRE connexion que le BEGIN précédent
await pool.query("COMMIT");
```
`pool.query()` emprunte et restitue automatiquement une connexion à **chaque appel**, sans garantie que ce soit la même d'un appel à l'autre — une transaction SQL doit impérativement rester sur la **même** connexion du début (`BEGIN`) à la fin (`COMMIT`/`ROLLBACK`), d'où l'usage explicite de `pool.connect()` (section 31.4).
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

## 31.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre les index de paramètres ($1, $2...) avec ceux de MySQL (?)</span>
```js
// ❌ PostgreSQL utilise $1, $2... — la syntaxe "?" est celle de MySQL (chapitre 32), pas de PostgreSQL
await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);
```
```js
// ✅ Syntaxe correcte pour PostgreSQL
await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
```
</div>

## 31.8 Résumé du chapitre

- Le driver `pg` fournit un `Pool` de connexions réutilisables, bien plus performant qu'une connexion ouverte à chaque requête.
- Les requêtes paramétrées (`$1`, `$2`...) protègent contre l'injection SQL, avec `RETURNING *` pour récupérer la ligne affectée en une seule requête.
- Une transaction doit impérativement utiliser une connexion dédiée (`pool.connect()`), jamais le pool directement.
- `client.release()` doit toujours être appelé dans un `finally`, sous peine d'épuiser progressivement le pool.

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

*Chapitre suivant : la connexion à MySQL, avec ses particularités par rapport à PostgreSQL.*
