<div class="chapitre-titre-num">CHAPITRE 25</div>

# SQL indispensable pour Java

## Objectifs pédagogiques

Maîtriser les commandes SQL essentielles (DDL et DML) qui seront exécutées depuis Java au chapitre 26 : création/modification de structure, insertion, mise à jour, suppression, requêtes de sélection avec filtres, tris, regroupements et jointures.

## 25.1 Les deux familles de commandes SQL

- **DDL (Data Definition Language)** : définit la **structure** — `CREATE`, `ALTER`, `DROP`.
- **DML (Data Manipulation Language)** : manipule les **données** — `INSERT`, `UPDATE`, `DELETE`, `SELECT`.

## 25.2 CREATE DATABASE / CREATE TABLE (rappel du chapitre 24)

```sql
CREATE DATABASE gestion_commerciale;
USE gestion_commerciale;

CREATE TABLE client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    solde_du DECIMAL(10,2) DEFAULT 0
);
```

## 25.3 ALTER TABLE : modifier une structure existante

```sql
ALTER TABLE client ADD COLUMN telephone VARCHAR(20);
ALTER TABLE client MODIFY COLUMN nom VARCHAR(150); -- change le type/taille d'une colonne existante
ALTER TABLE client DROP COLUMN telephone;
ALTER TABLE client ADD CONSTRAINT chk_solde CHECK (solde_du >= 0);
```

## 25.4 DROP TABLE : supprimer une table

```sql
DROP TABLE IF EXISTS ancienne_table; -- IF EXISTS évite une erreur si la table n'existe déjà plus
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ DROP TABLE est irréversible</span>
Contrairement à `DELETE` (section 25.7, qui supprime des lignes mais garde la structure), `DROP TABLE` supprime **définitivement** la table et toutes ses données, sans aucune confirmation. À utiliser avec la même prudence qu'un `rm -rf` en ligne de commande.
</div>

## 25.5 INSERT : ajouter des données

```sql
INSERT INTO client (nom, email, solde_du) VALUES ('Jaslin Occius', 'jaslin@mail.com', 0);

INSERT INTO client (nom, email) VALUES
    ('Marie Pierre', 'marie@mail.com'),
    ('Paul Louis', 'paul@mail.com'); -- insertion multiple en une seule commande
```

## 25.6 UPDATE : modifier des données existantes

```sql
UPDATE client SET solde_du = 500 WHERE id = 1;

UPDATE client SET solde_du = solde_du + 100 WHERE email = 'jaslin@mail.com';
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un UPDATE sans WHERE modifie TOUTES les lignes de la table</span>
```sql
UPDATE client SET solde_du = 0; -- 💥 remet TOUS les clients à zéro, sans exception !
```
Toujours vérifier la clause `WHERE` avant d'exécuter un `UPDATE` en production — une erreur ici affecte l'intégralité de la table, pas une ligne isolée.
</div>

## 25.7 DELETE : supprimer des données

```sql
DELETE FROM client WHERE id = 3;
DELETE FROM client WHERE solde_du = 0 AND email LIKE '%test%'; -- suppression conditionnelle précise
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Même risque que UPDATE : DELETE sans WHERE vide toute la table</span>
```sql
DELETE FROM client; -- supprime TOUTES les lignes (mais garde la structure de la table, contrairement à DROP)
```
</div>

## 25.8 SELECT, WHERE, ORDER BY

```sql
SELECT nom, email FROM client;                     -- colonnes précises, plutôt que SELECT * en production
SELECT * FROM client WHERE solde_du > 0;             -- filtre
SELECT * FROM client WHERE nom LIKE 'J%';            -- commence par "J"
SELECT * FROM client WHERE solde_du BETWEEN 100 AND 500;
SELECT * FROM client ORDER BY nom ASC;               -- tri croissant (DESC pour décroissant)
SELECT * FROM client ORDER BY solde_du DESC LIMIT 5; -- les 5 clients avec le plus grand solde dû
```

## 25.9 GROUP BY et HAVING

```sql
-- Nombre de clients par tranche de solde dû, groupés
SELECT solde_du > 0 AS a_une_dette, COUNT(*) AS nombre
FROM client
GROUP BY a_une_dette;

-- HAVING filtre APRÈS le regroupement (contrairement à WHERE, qui filtre AVANT)
SELECT cours_id, COUNT(*) AS nb_inscrits
FROM inscription
GROUP BY cours_id
HAVING COUNT(*) >= 10; -- ne garde que les cours ayant au moins 10 inscrits
```

<div class="encadre astuce">
<span class="encadre-titre">💡 WHERE vs HAVING : la différence clé</span>
`WHERE` filtre les **lignes individuelles** avant tout regroupement. `HAVING` filtre les **groupes** après leur agrégation (`COUNT`, `SUM`, `AVG`...) — on ne peut pas écrire `WHERE COUNT(*) >= 10`, car `COUNT(*)` n'existe qu'une fois le regroupement effectué.
</div>

## 25.10 LIMIT : pagination

```sql
SELECT * FROM client ORDER BY id LIMIT 10;        -- les 10 premiers résultats
SELECT * FROM client ORDER BY id LIMIT 10 OFFSET 20; -- 10 résultats, en sautant les 20 premiers (page 3 si 10/page)
```

## 25.11 Les jointures (INNER, LEFT, RIGHT)

```sql
-- INNER JOIN : uniquement les lignes ayant une correspondance dans LES DEUX tables
SELECT e.nom, c.titre
FROM inscription i
INNER JOIN etudiant e ON i.etudiant_id = e.id
INNER JOIN cours c ON i.cours_id = c.id;

-- LEFT JOIN : TOUS les étudiants, même ceux SANS aucune inscription (cours_id sera NULL pour eux)
SELECT e.nom, c.titre
FROM etudiant e
LEFT JOIN inscription i ON e.id = i.etudiant_id
LEFT JOIN cours c ON i.cours_id = c.id;
```

**INNER JOIN vs LEFT JOIN — visualisation**

```{.uml}
INNER JOIN : ne garde que l'INTERSECTION
  etudiant ∩ inscription

  ┌─────────┐        ┌─────────┐
  │etudiant   │        │inscription │
  │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← seule la zone commune est retournée
  └─────────┘        └─────────┘

LEFT JOIN : garde TOUTE la table de GAUCHE (etudiant), même sans correspondance
  ┌─────────┐        ┌─────────┐
  │▓▓▓▓▓▓▓▓▓▓▓▓etudiant │        │inscription │
  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← etudiant entier + intersection
  └─────────┘        └─────────┘
```

- **RIGHT JOIN** suit la même logique que `LEFT JOIN`, mais garde toute la table de **droite**. En pratique, `RIGHT JOIN` est rarement utilisé : on peut toujours reformuler avec un `LEFT JOIN` en inversant l'ordre des tables.

## 25.12 Les vues (VIEW)

```sql
CREATE VIEW vue_etudiants_actifs AS
SELECT e.nom, e.email, COUNT(i.id) AS nb_cours_suivis
FROM etudiant e
LEFT JOIN inscription i ON e.id = i.etudiant_id
GROUP BY e.id;

SELECT * FROM vue_etudiants_actifs WHERE nb_cours_suivis > 0; -- utilisée comme une table normale
```

Une **vue** est une requête sauvegardée, réutilisable comme une table virtuelle — utile pour simplifier des requêtes complexes et fréquemment répétées.

## 25.13 Les index

```sql
CREATE INDEX idx_client_email ON client(email);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un index accélère la recherche, au prix d'un coût sur l'écriture</span>
Sans index, rechercher `WHERE email = '...'` oblige MySQL à parcourir **toutes** les lignes de la table. Un index sur `email` permet une recherche quasi instantanée, même sur des millions de lignes — au prix d'un léger ralentissement des `INSERT`/`UPDATE` (l'index doit lui-même être mis à jour). Les colonnes fréquemment utilisées dans un `WHERE` ou une jointure sont de bonnes candidates à l'indexation.
</div>

## 25.14 Les transactions (aperçu, approfondi au chapitre 29)

```sql
START TRANSACTION;
UPDATE compte_bancaire SET solde = solde - 500 WHERE id = 1; -- débit
UPDATE compte_bancaire SET solde = solde + 500 WHERE id = 2; -- crédit
COMMIT; -- valide les DEUX opérations ensemble, ou ROLLBACK pour tout annuler si une erreur survient
```

## 25.15 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre = et LIKE pour une recherche partielle</span>
```sql
SELECT * FROM client WHERE nom = 'Jas'; -- ne trouve RIEN si le nom complet est "Jaslin"
SELECT * FROM client WHERE nom LIKE 'Jas%'; -- ✅ trouve "Jaslin", "Jasmine", etc.
```
</div>

## 25.16 Exercices SQL corrigés

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Écris une requête retournant le nom des clients ayant un solde dû supérieur à 1000, triés du plus élevé au plus faible.
</div>

**Corrigé :**
```sql
SELECT nom, solde_du FROM client WHERE solde_du > 1000 ORDER BY solde_du DESC;
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.2</span>

Écris une requête retournant, pour chaque cours, son titre et le nombre d'étudiants inscrits, uniquement pour les cours ayant au moins 1 inscrit.
</div>

**Corrigé :**
```sql
SELECT c.titre, COUNT(i.id) AS nb_inscrits
FROM cours c
INNER JOIN inscription i ON c.id = i.cours_id
GROUP BY c.id, c.titre
HAVING COUNT(i.id) >= 1;
```

## 25.17 Résumé du chapitre

- DDL (`CREATE`, `ALTER`, `DROP`) définit la structure ; DML (`INSERT`, `UPDATE`, `DELETE`, `SELECT`) manipule les données.
- `WHERE` filtre les lignes, `HAVING` filtre les groupes après `GROUP BY`.
- `INNER JOIN` ne garde que les correspondances communes ; `LEFT JOIN` garde toute la table de gauche, même sans correspondance.
- Les vues simplifient des requêtes complexes réutilisées ; les index accélèrent les recherches sur les colonnes fréquemment filtrées.
- `UPDATE`/`DELETE` sans `WHERE` affectent **toute** la table — toujours vérifier cette clause avant exécution.

*Chapitre suivant : JDBC, pour exécuter ces mêmes commandes SQL directement depuis une application Java.*
