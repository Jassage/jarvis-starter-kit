<div class="chapitre-titre-num">CHAPITRE 32</div>

# Connexion à MySQL

## Objectifs pédagogiques

Se connecter à MySQL depuis Node.js avec `mysql2`, en identifiant précisément les différences pratiques avec PostgreSQL vu au chapitre précédent.

## 32.1 Installer mysql2

```
$ npm install mysql2
```

<div class="encadre astuce">
<span class="encadre-titre">💡 mysql2, pas mysql</span>
Le paquet historique `mysql` n'est plus maintenu activement ; `mysql2` (compatible avec la même API de base) est le choix standard aujourd'hui, avec en plus le support natif des Promises et de meilleures performances.
</div>

## 32.2 Pool de connexions avec mysql2

```js
// src/config/db.js
const mysql = require("mysql2/promise"); // "/promise" : version basée sur les Promises, pas les callbacks

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

module.exports = pool;
```

## 32.3 Requêtes paramétrées : la syntaxe ? de MySQL

```js
const pool = require("../config/db");

async function trouverParEmail(email) {
  const [lignes] = await pool.query("SELECT * FROM utilisateurs WHERE email = ?", [email]);
  // pool.query() retourne un TABLEAU [lignes, metadonnees] — la déstructuration extrait directement les lignes
  return lignes[0] || null;
}

async function creer({ nom, email, motDePasseHash }) {
  const [resultat] = await pool.query(
    "INSERT INTO utilisateurs (nom, email, mot_de_passe_hash) VALUES (?, ?, ?)",
    [nom, email, motDePasseHash]
  );
  return { id: resultat.insertId, nom, email }; // MySQL ne supporte pas RETURNING : l'id est dans resultat.insertId
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ MySQL utilise ?, PostgreSQL utilise $1/$2 — et MySQL n'a pas RETURNING</span>
Rappel du chapitre 31 : ces deux différences de syntaxe (paramètres et absence de `RETURNING`) sont la source d'erreurs la plus fréquente en changeant de SGBD sans adapter le code. Après un `INSERT` MySQL, l'id auto-généré s'obtient via `resultat.insertId`, jamais via une clause `RETURNING` (inexistante en MySQL classique).
</div>

## 32.4 Transactions avec mysql2

```js
async function transfererFonds(compteSourceId, compteDestId, montant) {
  const connexion = await pool.getConnection(); // équivalent du pool.connect() de PostgreSQL

  try {
    await connexion.beginTransaction();

    await connexion.query("UPDATE comptes SET solde = solde - ? WHERE id = ?", [montant, compteSourceId]);
    await connexion.query("UPDATE comptes SET solde = solde + ? WHERE id = ?", [montant, compteDestId]);

    await connexion.commit();
  } catch (erreur) {
    await connexion.rollback();
    throw erreur;
  } finally {
    connexion.release();
  }
}
```

## 32.5 Requêtes préparées explicites (execute vs query)

```js
// query() : re-parse la requête à chaque appel
// execute() : utilise une requête PRÉPARÉE côté serveur MySQL, plus performant sur des requêtes RÉPÉTÉES
const [lignes] = await pool.execute("SELECT * FROM produits WHERE categorie = ?", [categorie]);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 execute() vs query() : une nuance de performance, pas de sécurité</span>
Les deux méthodes protègent également bien contre l'injection SQL (paramètres liés dans les deux cas) — `execute()` apporte un gain de performance sur des requêtes **exécutées très fréquemment** avec la même structure, en réutilisant la préparation côté serveur MySQL.
</div>

## 32.6 Tableau récapitulatif PostgreSQL vs MySQL

| Aspect | PostgreSQL (`pg`) | MySQL (`mysql2`) |
|---|---|---|
| Paramètres de requête | `$1`, `$2`, `$3`... | `?`, `?`, `?`... |
| Récupérer l'id auto-généré | `RETURNING id` dans la requête | `resultat.insertId` après l'`INSERT` |
| Forme du résultat | `resultat.rows` (tableau) | `[lignes, metadonnees]` (déstructuration) |
| Pool | `new Pool({...})` | `mysql.createPool({...})` |
| Connexion dédiée pour transaction | `pool.connect()` | `pool.getConnection()` |

## 32.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier la déstructuration du tableau retourné par query()</span>
```js
const resultat = await pool.query("SELECT * FROM utilisateurs"); // ❌ resultat est [lignes, metadonnees], PAS directement les lignes !
console.log(resultat.length); // 2 (le tableau contient 2 éléments : lignes ET metadonnees), pas le nombre de lignes réelles
```
```js
const [lignes] = await pool.query("SELECT * FROM utilisateurs"); // ✅ déstructuration correcte
console.log(lignes.length); // le vrai nombre de lignes retournées
```
</div>

## 32.8 Résumé du chapitre

- `mysql2/promise` fournit un pool de connexions basé sur les Promises, avec une API proche mais syntaxiquement différente de `pg`.
- MySQL utilise `?` comme paramètre (pas `$1`), et `resultat.insertId` pour l'id auto-généré (pas `RETURNING`).
- `pool.query()` retourne un tableau `[lignes, metadonnees]` à déstructurer, contrairement à `pg` qui retourne `{ rows }`.
- Une transaction nécessite une connexion dédiée (`pool.getConnection()`), exactement comme pour PostgreSQL.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.1</span>

Adapte la fonction `decrementerStockAtomique` de l'exercice 31.1 (PostgreSQL) pour MySQL avec `mysql2`.
</div>

**Corrigé :**
```js
async function decrementerStockAtomique(produitId, quantite) {
  const [resultat] = await pool.query(
    "UPDATE produits SET stock = stock - ? WHERE id = ? AND stock >= ?",
    [quantite, produitId, quantite]
  );
  if (resultat.affectedRows === 0) {
    throw new Error("Stock insuffisant");
  }
}
```

*Chapitre suivant : la connexion à MongoDB, une base NoSQL orientée documents.*
