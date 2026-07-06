<div class="chapitre-titre-num">CHAPITRE 24</div>

# Introduction aux bases de données

## Objectifs pédagogiques

Comprendre ce qu'est une base de données relationnelle, situer MySQL/PostgreSQL/MariaDB/Oracle/SQL Server, installer un environnement de travail, et créer une première base avec ses tables, clés et contraintes.

## 24.1 Qu'est-ce qu'une base de données

Une **base de données** est un ensemble structuré de données, organisé pour être facilement consulté, modifié et interrogé — par opposition au fichier texte du chapitre 23 (`livres.txt`), qui n'offre aucune structure interrogeable, aucune contrainte d'intégrité, et devient vite ingérable à grande échelle ou avec plusieurs utilisateurs simultanés.

<div class="encadre astuce">
<span class="encadre-titre">💡 Le problème concret que résout une vraie base de données</span>
Le fichier `livres.txt` du chapitre 23 fonctionne pour un usage mono-utilisateur simple, mais : aucune garantie que deux lignes n'aient pas le même ISBN, aucune façon efficace de "chercher tous les livres d'un auteur" sans lire tout le fichier, et surtout, aucune gestion propre de **plusieurs utilisateurs modifiant les données en même temps** (deux bibliothécaires empruntant simultanément le même livre). Un **SGBD** (Système de Gestion de Base de Données) résout ces trois problèmes nativement.
</div>

## 24.2 SGBD relationnels et NoSQL

| | Relationnel (SQL) | NoSQL |
|---|---|---|
| Structure | Tables avec colonnes et types fixes, liées par des clés | Documents, clés-valeurs, graphes — structure flexible |
| Contraintes d'intégrité | Fortes (clés primaires/étrangères, contraintes, chapitre 24.9) | Généralement plus souples, gérées côté application |
| Cas d'usage typique | Données structurées avec relations claires (clients-commandes, étudiants-notes) | Données volumineuses, schéma évolutif, très grande échelle |
| Exemples | MySQL, PostgreSQL, Oracle, SQL Server | MongoDB, Redis, Cassandra |

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce manuel se concentre sur le relationnel</span>
Les projets métier de ce manuel (gestion scolaire, bancaire, commerciale) ont des données **fortement relationnelles** (un étudiant a des notes, une commande a des lignes, un client a des factures) — le modèle relationnel, avec ses contraintes strictes, est le choix naturel et le plus répandu pour ce type d'application, d'où le choix de MySQL pour la suite de ce manuel.
</div>

## 24.3 Les principaux SGBD relationnels

| SGBD | Éditeur | Licence | Points forts |
|---|---|---|---|
| **MySQL** | Oracle (racheté) | Open source (avec édition entreprise) | Le plus populaire pour le web, très documenté, léger |
| **PostgreSQL** | Communauté open source | Open source | Très riche en fonctionnalités avancées (JSON natif, types personnalisés), réputé pour sa rigueur |
| **MariaDB** | Communauté (fork de MySQL) | Open source | Compatible MySQL, développé après le rachat de MySQL par Oracle |
| **Oracle Database** | Oracle | Commerciale | Standard historique en grande entreprise, très performant, coûteux |
| **SQL Server** | Microsoft | Commerciale (édition gratuite Express disponible) | Intégration forte avec l'écosystème Microsoft/.NET |

Ce manuel utilise **MySQL** pour ses exemples (le plus répandu dans l'enseignement et les projets web), mais les concepts SQL (chapitre 25) restent **presque identiques** d'un SGBD à l'autre — les différences se limitent à quelques détails de syntaxe.

## 24.4 Installation de MySQL

```
1. Télécharger MySQL Community Server depuis dev.mysql.com/downloads
2. Lancer l'installateur, choisir "Developer Default" (inclut MySQL Server + MySQL Workbench)
3. Définir le mot de passe du compte root lors de la configuration
4. Vérifier l'installation :

$ mysql --version
mysql  Ver 8.0.36 for Win64 on x86_64
```

```
$ mysql -u root -p
Enter password: ********
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

## 24.5 Installation de PostgreSQL (alternative)

```
1. Télécharger depuis postgresql.org/download
2. L'installateur configure automatiquement le port par défaut (5432) et propose pgAdmin (interface graphique)
3. Vérifier :

$ psql --version
psql (PostgreSQL) 16.2
```

## 24.6 Installation de phpMyAdmin (interface web pour MySQL)

<div class="encadre astuce">
<span class="encadre-titre">💡 phpMyAdmin nécessite un serveur web + PHP</span>
phpMyAdmin est une interface web de gestion de MySQL, généralement installée via une distribution tout-en-un (**XAMPP**, **WAMP** sous Windows, ou **MAMP** sous macOS) qui fournit Apache + PHP + MySQL préconfigurés ensemble — l'installer isolément sans serveur PHP ne fonctionnerait pas.
</div>

```
1. Installer XAMPP (apachefriends.org)
2. Démarrer les modules Apache et MySQL depuis le panneau de contrôle XAMPP
3. Ouvrir http://localhost/phpmyadmin dans le navigateur
```

## 24.7 Créer une base de données

```sql
CREATE DATABASE minicours_bd;
USE minicours_bd;
```

## 24.8 Créer les tables

```sql
CREATE TABLE etudiant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    age INT,
    date_inscription DATE DEFAULT (CURRENT_DATE)
);

CREATE TABLE cours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    categorie VARCHAR(50)
);

CREATE TABLE inscription (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    cours_id INT NOT NULL,
    progression INT DEFAULT 0,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id),
    FOREIGN KEY (cours_id) REFERENCES cours(id)
);
```

**Modèle relationnel — minicours_bd**

```{.uml}
┌───────────────┐         ┌───────────────┐        ┌───────────┐
│   etudiant       │         │  inscription     │        │   cours      │
├───────────────┤         ├───────────────┤        ├───────────┤
│ PK id             │◄────────┤ FK etudiant_id   │        │ PK id        │
│    nom             │   1  0..*  │ FK cours_id      ├───────►│    titre     │
│    email           │         │    progression   │  0..* 1│    categorie │
│    age             │         └───────────────┘        └───────────┘
└───────────────┘
```

## 24.9 Clés primaires et étrangères

- **Clé primaire (PRIMARY KEY)** : identifie **de façon unique** chaque ligne d'une table. `AUTO_INCREMENT` génère automatiquement une valeur croissante à chaque insertion.
- **Clé étrangère (FOREIGN KEY)** : référence la clé primaire d'une **autre** table, garantissant qu'on ne peut pas créer une `inscription` pointant vers un `etudiant_id` ou `cours_id` inexistant.

```sql
INSERT INTO inscription (etudiant_id, cours_id) VALUES (999, 1);
-- ❌ Erreur : Cannot add or update a child row: a foreign key constraint fails
-- (aucun etudiant avec id=999 n'existe)
```

## 24.10 Les contraintes d'intégrité

```sql
CREATE TABLE compte_bancaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulaire VARCHAR(100) NOT NULL,        -- NOT NULL : ce champ ne peut jamais être vide
    solde DECIMAL(12,2) NOT NULL DEFAULT 0, -- DEFAULT : valeur automatique si non précisée
    numero_compte VARCHAR(20) UNIQUE,        -- UNIQUE : aucune répétition possible entre lignes
    CONSTRAINT chk_solde_positif CHECK (solde >= 0) -- CHECK : règle métier appliquée par la base elle-même
);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi valider aussi au niveau de la base, pas seulement en Java</span>
Rappel des chapitres 4 et 12 : la validation métier en Java (encapsulation, exceptions) reste essentielle, mais elle ne protège que les données passant **par ton application**. Une contrainte `CHECK`/`NOT NULL`/`UNIQUE` au niveau de la base protège **même** contre une insertion directe erronée (un script externe, un autre programme, une erreur d'administration) — un filet de sécurité complémentaire, pas redondant.
</div>

## 24.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Créer une clé étrangère vers une table qui n'existe pas encore</span>
```sql
CREATE TABLE inscription (
    etudiant_id INT,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) -- ❌ Erreur si "etudiant" n'existe pas encore
);
```
L'ordre de création des tables compte : une table référencée par une clé étrangère doit être créée **avant** la table qui la référence.
</div>

## 24.12 Résumé du chapitre

- Une base de données relationnelle structure les données en tables liées, avec des contraintes d'intégrité fortes — un progrès net par rapport au fichier texte du chapitre 23.
- MySQL, PostgreSQL, MariaDB, Oracle, SQL Server sont les principaux SGBD relationnels ; ce manuel utilise MySQL.
- `CREATE DATABASE`/`CREATE TABLE` définissent la structure ; `PRIMARY KEY`/`FOREIGN KEY` garantissent l'unicité et l'intégrité référentielle.
- `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK` imposent des règles métier directement au niveau de la base, en complément de la validation Java.

*Chapitre suivant : les commandes SQL indispensables pour interagir avec une base de données depuis Java.*
