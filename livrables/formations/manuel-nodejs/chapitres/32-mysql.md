<div class="chapitre-titre-num">CHAPITRE 32</div>

# Connexion à MySQL

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Se connecter à MySQL depuis Node.js avec `mysql2`, en identifiant précisément les différences pratiques avec PostgreSQL vu au chapitre précédent. À la fin de ce chapitre, tu sauras porter un service PostgreSQL vers MySQL (ou l'inverse) sans tomber dans les trois pièges de syntaxe les plus fréquents.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un client héberge déjà son infrastructure sur un serveur mutualisé qui ne propose que MySQL — pas PostgreSQL. Tu as l'habitude d'écrire tes requêtes avec `pg` (chapitre 31), et copies-colles rapidement un service existant en changeant juste le nom du paquet importé. Le code plante immédiatement : `$1` n'est pas reconnu par MySQL, et `resultat.rows` est `undefined`. Ce chapitre t'évite cette perte de temps en listant précisément, dès le départ, les trois différences syntaxiques qui piègent presque tout le monde en migrant d'un SGBD à l'autre.
</div>

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
Rappel du chapitre 31 : ces deux différences de syntaxe (paramètres et absence de `RETURNING`) sont la source d'erreurs la plus fréquente en changeant de SGBD sans adapter le code — exactement le piège de la mise en situation d'ouverture. Après un `INSERT` MySQL, l'id auto-généré s'obtient via `resultat.insertId`, jamais via une clause `RETURNING` (inexistante en MySQL classique).
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

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le principe du chapitre 31 reste identique à l'identique : une transaction doit toujours utiliser une connexion dédiée (`pool.getConnection()`, l'équivalent MySQL de `pool.connect()`), jamais le pool directement — le même risque de données incohérentes existe sur MySQL que sur PostgreSQL si cette règle n'est pas respectée.
</div>

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

## 32.6 Tableau récapitulatif PostgreSQL vs MySQL (syntaxe du driver)

| Aspect | PostgreSQL (`pg`) | MySQL (`mysql2`) |
|---|---|---|
| Paramètres de requête | `$1`, `$2`, `$3`... | `?`, `?`, `?`... |
| Récupérer l'id auto-généré | `RETURNING id` dans la requête | `resultat.insertId` après l'`INSERT` |
| Forme du résultat | `resultat.rows` (tableau) | `[lignes, metadonnees]` (déstructuration) |
| Pool | `new Pool({...})` | `mysql.createPool({...})` |
| Connexion dédiée pour transaction | `pool.connect()` | `pool.getConnection()` |

## 32.7 PostgreSQL vs MySQL : au-delà de la syntaxe, quand choisir quoi

<div class="encadre astuce">
<span class="encadre-titre">💡 Le vrai choix se fait rarement sur la syntaxe du driver</span>
La syntaxe (section 32.6) n'est qu'une gêne de portage, jamais un critère de choix sérieux. Le vrai choix entre PostgreSQL et MySQL se fait sur des critères plus fondamentaux.
</div>

| Critère | PostgreSQL | MySQL |
|---|---|---|
| Conformité SQL standard | Très stricte, fonctionnalités avancées (CTE récursives, fenêtrage, types JSON riches) | Historiquement plus permissive, s'est modernisée avec le temps |
| Types de données avancés | Excellent (JSON/JSONB, tableaux natifs, types géométriques via PostGIS) | Support JSON correct, moins de types natifs avancés |
| Performance en lecture simple | Très bonne | Historiquement optimisée pour la lecture, souvent perçue comme légèrement plus rapide sur des requêtes simples |
| Écosystème d'hébergement | Très large (Railway, Supabase, RDS, Neon...) | Très large également (historiquement la base des hébergements mutualisés, cPanel) |
| Cas d'usage typique dans ce portefeuille | BANKA, GESCOM (transactions complexes, intégrité stricte) | Hébergement mutualisé imposé par un client, migration d'un système existant |

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Pour un nouveau projet sans contrainte externe, ce manuel (et la majorité des projets de ce portefeuille) privilégie PostgreSQL, pour sa richesse de types et sa conformité stricte au SQL standard. MySQL reste un choix parfaitement valide, souvent **imposé** par une contrainte externe (hébergement mutualisé du client, système existant à maintenir) — exactement le scénario de la mise en situation d'ouverture — plutôt que choisi librement.
</div>

## Atelier — Porter un service de PostgreSQL vers MySQL

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 32 — Reproduire la migration de la mise en situation</span>

**Objectif** : porter un repository PostgreSQL existant vers MySQL, en appliquant méthodiquement les trois différences de syntaxe.

**Préparation** : le repository `utilisateurs.repository.js` du chapitre 31 (version PostgreSQL avec `pg`).

**Étapes détaillées** :
1. Remplace `$1`, `$2`... par `?` partout dans les requêtes SQL.
2. Remplace chaque usage de `RETURNING *`/`RETURNING id` par une récupération via `resultat.insertId` (pour un INSERT) ou une requête `SELECT` séparée si nécessaire (pour un UPDATE).
3. Remplace chaque déstructuration `resultat.rows` par `const [lignes] = await pool.query(...)`.
4. Teste chaque méthode migrée contre une vraie base MySQL de test.

**Validation** : chaque méthode migrée doit produire un résultat équivalent à sa version PostgreSQL d'origine, pour les mêmes données d'entrée.

**Résultat attendu** : une checklist personnelle de migration, directement réutilisable pour n'importe quel futur projet nécessitant ce même portage.

**Dépannage** : si `resultat.length` semble incohérent après une requête, vérifie que la déstructuration `[lignes]` est bien présente — un oubli fréquent (erreur détaillée en section 32.7).

**Nettoyage** : aucun.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier la déstructuration du tableau retourné par query()</span>

```js
const resultat = await pool.query("SELECT * FROM utilisateurs"); // ❌ resultat est [lignes, metadonnees], PAS directement les lignes !
console.log(resultat.length); // 2 (le tableau contient 2 éléments : lignes ET metadonnees), pas le nombre de lignes réelles
```
```js
const [lignes] = await pool.query("SELECT * FROM utilisateurs"); // ✅ déstructuration correcte
console.log(lignes.length); // le vrai nombre de lignes retournées
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Copier-coller un service PostgreSQL sans adapter la syntaxe</span>
Exactement le piège de la mise en situation d'ouverture — les trois différences de syntaxe (section 32.6) sont suffisamment subtiles pour passer inaperçues à une relecture rapide, mais provoquent des erreurs immédiates à l'exécution.
</div>

## Débogage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "ER_PARSE_ERROR" ou requête rejetée par MySQL</span>

- **Cause probable** : syntaxe de paramètre PostgreSQL (`$1`) utilisée par erreur dans une requête MySQL.
- **Solution** : remplacer par `?` (section 32.3).
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "Cannot read properties of undefined (reading 'rows')"</span>

- **Cause** : code écrit pour `pg` (`resultat.rows`) exécuté contre `mysql2`, qui ne connaît pas cette propriété.
- **Solution** : utiliser la déstructuration `[lignes]` propre à `mysql2` (erreur fréquente n°1).
</div>

## En entreprise

- **Choix imposé par l'hébergement existant** : de nombreuses missions freelance impliquent de travailler avec le SGBD déjà en place chez le client (souvent MySQL sur un hébergement mutualisé historique), plutôt que de choisir librement — exactement le contexte de la mise en situation d'ouverture.
- **Portage entre SGBD via un ORM** : les équipes qui anticipent un possible changement de SGBD futur choisissent souvent un ORM (Prisma, chapitre 34) dès le départ, réduisant l'ampleur d'une migration à une simple reconfiguration plutôt qu'une réécriture de chaque requête SQL brute.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelles sont les principales différences syntaxiques entre les drivers pg et mysql2 ?"**
Réponse attendue : la syntaxe des paramètres (`$1` vs `?`), la récupération de l'id auto-généré (`RETURNING` vs `insertId`), et la forme du résultat (`resultat.rows` vs déstructuration `[lignes]`).

**Q2. "Dans quel contexte choisirais-tu MySQL plutôt que PostgreSQL pour un nouveau projet ?"**
Réponse attendue : principalement en cas de contrainte externe (hébergement du client déjà sur MySQL, système existant à maintenir), plutôt qu'un choix technique libre — PostgreSQL étant généralement préféré pour sa richesse de types et sa conformité SQL, sauf contrainte contraire.

**Q3. "execute() est-il plus sûr que query() contre l'injection SQL avec mysql2 ?"**
Réponse attendue : non, les deux protègent également bien via des paramètres liés — la différence est uniquement une nuance de performance sur des requêtes répétées, pas de sécurité.
</div>

## Optimisation, sécurité et maintenabilité

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documenter explicitement, dans le `README.md` d'un projet, quel SGBD est utilisé et pourquoi (choix libre ou contrainte externe, comme la mise en situation d'ouverture) — utile pour tout futur développeur se demandant s'il peut envisager une migration.
</div>

## Résumé du chapitre

- `mysql2/promise` fournit un pool de connexions basé sur les Promises, avec une API proche mais syntaxiquement différente de `pg`.
- MySQL utilise `?` comme paramètre (pas `$1`), et `resultat.insertId` pour l'id auto-généré (pas `RETURNING`).
- `pool.query()` retourne un tableau `[lignes, metadonnees]` à déstructurer, contrairement à `pg` qui retourne `{ rows }`.
- Une transaction nécessite une connexion dédiée (`pool.getConnection()`), exactement comme pour PostgreSQL.
- Le choix entre les deux SGBD se fait rarement sur la syntaxe, souvent sur une contrainte externe ou les besoins en types de données avancés.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM</span>

1. Quelle syntaxe de paramètre utilise mysql2 ?
   - a) $1, $2
   - b) ?
   - c) :param
   - d) {{param}}

2. Comment récupérer l'id auto-généré après un INSERT avec mysql2 ?
   - a) RETURNING id
   - b) resultat.insertId
   - c) resultat.rows[0].id
   - d) Ce n'est pas possible

3. execute() est-il plus sûr que query() contre l'injection SQL ?
   - a) Oui, nettement plus sûr
   - b) Non, les deux protègent également via des paramètres liés
   - c) execute() n'existe pas dans mysql2
   - d) query() est déconseillé en toute circonstance

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. pool.query() de mysql2 retourne directement les lignes, sans déstructuration nécessaire. — **Faux**.
2. MySQL supporte la clause RETURNING comme PostgreSQL. — **Faux**.
3. Une transaction MySQL nécessite aussi une connexion dédiée, comme sur PostgreSQL. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Question ouverte</span>

Le développeur de la mise en situation d'ouverture aurait-il pu éviter cette perte de temps ? Comment ?

**Corrigé** : oui, en consultant le tableau récapitulatif (section 32.6) avant de copier-coller le code, ou en adoptant dès le départ un ORM (Prisma, chapitre 34) qui abstrait ces différences syntaxiques entre SGBD — un changement de base de données se limiterait alors à une reconfiguration du datasource, sans jamais avoir à réécrire manuellement chaque requête SQL brute.
</div>

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

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais configurer un pool de connexions MySQL avec mysql2.</li>
<li>☐ Je connais les trois différences syntaxiques principales avec PostgreSQL.</li>
<li>☐ Je sais implémenter une transaction avec pool.getConnection().</li>
<li>☐ Je sais quand choisir MySQL plutôt que PostgreSQL, et inversement.</li>
<li>☐ Je pense systématiquement à déstructurer le résultat de pool.query().</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on utiliser le paquet mysql au lieu de mysql2 ?</dt>
<dd>Techniquement oui, mais déconseillé — mysql2 est aujourd'hui le standard de facto, activement maintenu, avec un support natif des Promises et de meilleures performances.</dd>

<dt>MySQL a-t-il un équivalent à JSONB de PostgreSQL ?</dt>
<dd>MySQL supporte un type JSON, mais sans l'indexation binaire avancée de JSONB — pour un usage intensif de données semi-structurées, PostgreSQL reste généralement plus adapté.</dd>

<dt>Peut-on utiliser pg et mysql2 dans le même projet ?</dt>
<dd>Techniquement possible (deux pools distincts, un par SGBD), mais rare en pratique — généralement réservé à une migration progressive entre deux SGBD, jamais comme architecture cible durable.</dd>
</dl>

## Références et pour aller plus loin

- Documentation mysql2 : [https://github.com/sidorares/node-mysql2](https://github.com/sidorares/node-mysql2)
- Comparatif officiel PostgreSQL vs MySQL (perspective PostgreSQL) : [https://www.postgresql.org/about/](https://www.postgresql.org/about/)

*Chapitre suivant : la connexion à MongoDB, une base NoSQL orientée documents.*
