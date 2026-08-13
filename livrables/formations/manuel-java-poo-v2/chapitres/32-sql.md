<div class="chapitre-titre-num">CHAPITRE 32</div>

# SQL indispensable

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras écrire les commandes SQL de base : créer une table, y insérer, lire, modifier et supprimer des données, filtrer avec `WHERE`, trier avec `ORDER BY`, regrouper avec `GROUP BY`, et relier deux tables avec `JOIN`.

## A. Le problème

Le chapitre 31 a posé le vocabulaire (table, colonne, ligne, clé). Mais comment donne-t-on réellement des ordres à une base de données ? Il faut un langage dédié, compris par toutes les bases de données relationnelles du monde (MySQL, PostgreSQL, SQL Server...) : **SQL**.

## B. Exemple de la vie réelle

Pense à des ordres très précis donnés à un bibliothécaire : *« Crée une nouvelle étagère. »*, *« Range ce livre sur l'étagère Romans. »*, *« Montre-moi tous les livres empruntés cette semaine. »* SQL fonctionne exactement comme ça : une suite de phrases courtes et précises, dans un vocabulaire standardisé, pour agir sur une base de données.

## C. Explication très simple

> **SQL** (Structured Query Language) est le langage standard utilisé pour créer des tables, et pour insérer, lire, modifier et supprimer les données qu'elles contiennent.

## CREATE : créer une table

```sql
CREATE TABLE etudiants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100),
    age INT,
    moyenne DOUBLE
);
```

```{.uml}
CREATE TABLE etudiants ( ... )
   │                     │
   │                     └─ La liste des COLONNES, avec leur TYPE
   │                        (VARCHAR = texte de longueur limitée,
   │                        INT = entier, DOUBLE = nombre à virgule —
   │                        des équivalents SQL des types Java du
   │                        chapitre 3).
   └─ Crée une nouvelle table, avec le nom donné.

id INT PRIMARY KEY AUTO_INCREMENT
          │              │
          │              └─ Java (ou plutôt, ici, la base de données)
          │                 génère automatiquement une valeur
          │                 unique croissante à chaque nouvelle ligne.
          └─ Déclare cette colonne comme CLÉ PRIMAIRE (chapitre 31).
```

## INSERT : ajouter une ligne

```sql
INSERT INTO etudiants (nom, age, moyenne) VALUES ('Jaslin', 22, 16.5);
INSERT INTO etudiants (nom, age, moyenne) VALUES ('Marie', 20, 14.0);
```

`id` n'est jamais fourni explicitement : `AUTO_INCREMENT` s'en charge automatiquement, exactement comme un compteur qui s'incrémente tout seul à chaque insertion.

## SELECT et WHERE : lire des données

```sql
SELECT * FROM etudiants;                          -- toutes les colonnes, toutes les lignes
SELECT nom, moyenne FROM etudiants;                -- seulement ces deux colonnes
SELECT * FROM etudiants WHERE moyenne >= 14;       -- seulement les lignes qui correspondent
SELECT * FROM etudiants WHERE nom = 'Jaslin';
```

```{.uml}
SELECT colonnes FROM table WHERE condition;
   │                             │
   │                             └─ EXACTEMENT le rôle d'un if (chapitre 5) :
   │                                ne garde que les lignes qui vérifient
   │                                cette condition.
   └─ Précise QUELLES colonnes on veut voir ("*" = toutes).
```

<div class="encadre astuce">
<span class="encadre-titre">💡 WHERE en SQL, c'est le filter() du chapitre 29</span>
La comparaison n'est pas un hasard : <code>WHERE moyenne &gt;= 14</code> en SQL joue exactement le même rôle que <code>.filter(e -&gt; e.getMoyenne() &gt;= 14)</code> avec la Stream API — les deux filtrent une collection de données selon une condition, l'une côté base de données, l'autre côté programme Java.
</div>

## UPDATE et DELETE : modifier et supprimer

```sql
UPDATE etudiants SET moyenne = 17.0 WHERE nom = 'Jaslin';
DELETE FROM etudiants WHERE moyenne < 10;
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Danger absolu : UPDATE ou DELETE sans WHERE</span>

```sql
UPDATE etudiants SET moyenne = 0;  -- ⚠️ modifie TOUTES les lignes de la table, sans exception !
DELETE FROM etudiants;              -- ⚠️ SUPPRIME TOUTES les lignes de la table !
```

Sans `WHERE`, `UPDATE` et `DELETE` s'appliquent à **toutes** les lignes de la table, sans distinction. C'est l'une des erreurs les plus redoutées de tout développeur, capable de détruire des données réelles en production en une seule commande — toujours vérifier son `WHERE` avant d'exécuter, en particulier sur une vraie base de données, jamais seulement de test.
</div>

## ORDER BY : trier

```sql
SELECT * FROM etudiants ORDER BY moyenne DESC;  -- décroissant (le plus élevé en premier)
SELECT * FROM etudiants ORDER BY nom ASC;       -- croissant (alphabétique), ASC = par défaut
```

## GROUP BY : regrouper et agréger

```sql
SELECT age, COUNT(*) AS nombre_etudiants
FROM etudiants
GROUP BY age;
```

```{.uml}
GROUP BY age
   │
   └─ Regroupe toutes les lignes ayant le MÊME âge ensemble, puis
      COUNT(*) compte combien de lignes il y a dans CHAQUE groupe.
      (D'autres fonctions existent : SUM(), AVG(), MAX(), MIN() —
      exactement les équivalents SQL de sum()/average() du chapitre 29 !)
```

## JOIN : relier deux tables

Reprenons l'exemple du chapitre 31 (Étudiants et Inscriptions) :

```sql
SELECT etudiants.nom, inscriptions.cours
FROM etudiants
JOIN inscriptions ON etudiants.id = inscriptions.etudiant_id;
```

```{.uml}
FROM etudiants
JOIN inscriptions ON etudiants.id = inscriptions.etudiant_id
        │                              │                  │
        │                              │                  └─ La CLÉ ÉTRANGÈRE
        │                              │                     (chapitre 31)
        │                              └─ La CLÉ PRIMAIRE correspondante
        └─ "JOIN" relie deux tables via leur clé primaire/étrangère,
           produisant un résultat combinant les colonnes des DEUX tables.
```

Résultat (exemple) :
```text
nom      | cours
---------|------
Jaslin   | Java
Marie    | SQL
Marie    | Java
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Requête</span>
Une <strong>requête</strong> (<em>query</em>, en anglais) est le nom générique donné à toute commande SQL qui interroge ou manipule une base de données — <code>SELECT</code>, <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> sont tous des types de requêtes.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier les guillemets sur du texte</span>

```sql
SELECT * FROM etudiants WHERE nom = Jaslin;   -- ❌ erreur : Jaslin sans guillemets est interprété
                                                --    comme un NOM DE COLONNE, pas du texte !
SELECT * FROM etudiants WHERE nom = 'Jaslin'; -- ✅ correct
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre = et == (contrairement à Java !)</span>

```sql
SELECT * FROM etudiants WHERE moyenne == 14; -- ❌ erreur de syntaxe en SQL standard !
SELECT * FROM etudiants WHERE moyenne = 14;  -- ✅ en SQL, "=" seul suffit pour COMPARER
```

Piège inversé par rapport au chapitre 4 : en SQL, `=` sert **à la fois** à affecter (dans un `UPDATE ... SET`) et à comparer (dans un `WHERE`), sans jamais doubler le signe.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais créer une table avec CREATE TABLE.
✓ Je sais insérer, lire, modifier et supprimer des données (INSERT,
  SELECT, UPDATE, DELETE).
✓ Je sais filtrer avec WHERE, trier avec ORDER BY, regrouper avec GROUP BY.
✓ Je sais relier deux tables avec JOIN, via clé primaire/étrangère.
✓ Je sais qu'un UPDATE ou DELETE sans WHERE est extrêmement dangereux.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris la requête SQL qui affiche le nom et la moyenne des étudiants ayant une moyenne supérieure ou égale à 14, triés du plus élevé au plus faible.
</div>

## Correction

```sql
SELECT nom, moyenne FROM etudiants WHERE moyenne >= 14 ORDER BY moyenne DESC;
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Pour les tables `produits` (id, nom, prix, categorie) et `ventes` (id, produit_id, quantite), écris une requête qui affiche, pour chaque catégorie, le chiffre d'affaires total (prix × quantite, sommé), regroupé par catégorie, en utilisant `JOIN` et `GROUP BY` ensemble.
</div>

### Corrigé du défi

```sql
SELECT produits.categorie, SUM(produits.prix * ventes.quantite) AS chiffre_affaires
FROM ventes
JOIN produits ON ventes.produit_id = produits.id
GROUP BY produits.categorie;
```

## Résumé du chapitre

- **SQL** est le langage standard pour créer et manipuler des tables de base de données.
- `CREATE TABLE` crée une structure ; `INSERT` ajoute des lignes ; `SELECT` les lit ; `UPDATE` les modifie ; `DELETE` les supprime.
- `WHERE` filtre les lignes concernées ; `ORDER BY` les trie ; `GROUP BY` les regroupe pour des calculs agrégés (`COUNT`, `SUM`, `AVG`...).
- `JOIN` relie deux tables via leur clé primaire/étrangère.
- `UPDATE`/`DELETE` sans `WHERE` s'appliquent à **toutes** les lignes : toujours vérifier avant d'exécuter.

---

# 🎓 Révision de la Partie 10 — Base de données

## Questions de révision

1. Pourquoi est-il dangereux d'exécuter un `DELETE` sans `WHERE` ?
2. Quelle commande SQL relie deux tables entre elles ?
3. Quelle est la différence entre `WHERE` et `GROUP BY` ?

**Réponses :** (1) Parce que sans condition, il supprime absolument toutes les lignes de la table, sans distinction. (2) `JOIN`. (3) `WHERE` filtre les lignes individuelles selon une condition ; `GROUP BY` les regroupe ensemble pour appliquer des calculs agrégés (compter, sommer, faire une moyenne) par groupe.

## Mini-projet de la Partie 10

<div class="encadre defi">
<span class="encadre-titre">🧩 Mini-projet — Base de données d'une petite boutique</span>

Écris les requêtes SQL complètes pour : (1) créer une table `produits` (id, nom, prix, quantite), (2) insérer 3 produits, (3) afficher tous les produits dont le prix dépasse 200, triés par prix décroissant, (4) mettre à jour la quantité d'un produit précis, (5) afficher le nombre total de produits et la valeur totale du stock (prix × quantite, sommé).
</div>

### Corrigé du mini-projet

```sql
CREATE TABLE produits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100),
    prix DOUBLE,
    quantite INT
);

INSERT INTO produits (nom, prix, quantite) VALUES ('Riz', 250, 100);
INSERT INTO produits (nom, prix, quantite) VALUES ('Sucre', 150, 50);
INSERT INTO produits (nom, prix, quantite) VALUES ('Huile', 300, 30);

SELECT * FROM produits WHERE prix > 200 ORDER BY prix DESC;

UPDATE produits SET quantite = 80 WHERE nom = 'Riz';

SELECT COUNT(*) AS nombre_produits, SUM(prix * quantite) AS valeur_totale_stock
FROM produits;
```

---

*Chapitre suivant : connecter Java à MySQL, pour enfin faire communiquer directement un programme Java avec une vraie base de données.*
