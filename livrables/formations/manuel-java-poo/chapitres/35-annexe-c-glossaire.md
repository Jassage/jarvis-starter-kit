<div class="chapitre-titre-num">ANNEXE C</div>

# Glossaire

**Abstraction** — Principe consistant à définir un contrat commun sans imposer tous les détails d'implémentation. Chapitre 7.

**ACID** — Atomicité, Cohérence, Isolation, Durabilité : les quatre propriétés garanties par une transaction de base de données. Chapitre 29.

**Attribut** — Donnée membre d'une classe, représentant l'état d'un objet. Chapitre 2.

**Classe abstraite** — Classe ne pouvant jamais être instanciée directement, réservée à l'héritage. Chapitre 7.

**Classe anonyme** — Classe sans nom, déclarée et instanciée en une seule expression. Chapitre 11.

**Clé étrangère (Foreign Key)** — Colonne référençant la clé primaire d'une autre table, garantissant l'intégrité référentielle. Chapitre 24.

**Clé primaire (Primary Key)** — Colonne identifiant de façon unique chaque ligne d'une table. Chapitre 24.

**Composition** — Relation UML où un objet contenu n'a aucun sens sans son conteneur (durée de vie liée). Chapitre 18.

**Constructeur** — Méthode spéciale appelée à la création d'un objet via `new`, initialisant son état. Chapitre 3.

**DAO (Data Access Object)** — Patron de conception séparant l'accès aux données (interface + implémentation) du reste de l'application. Chapitre 30.

**DDL / DML** — Data Definition Language (`CREATE`, `ALTER`, `DROP`) / Data Manipulation Language (`INSERT`, `UPDATE`, `DELETE`, `SELECT`). Chapitre 25.

**Downcasting** — Conversion explicite d'un type général vers un type plus spécifique, pouvant échouer à l'exécution. Chapitre 6.

**Encapsulation** — Principe consistant à protéger les données internes d'un objet via des attributs privés et des méthodes d'accès contrôlées. Chapitre 4.

**Enum (énumération)** — Type représentant un ensemble fixe et fini de valeurs constantes. Chapitre 14.

**EntityManager** — Interface JPA centrale pour créer, lire, modifier et supprimer des entités persistées. Chapitre 32.

**Exception** — Événement anormal interrompant le flux normal d'exécution, interceptable via try/catch. Chapitre 12.

**Génériques (Generics)** — Mécanisme permettant d'écrire des classes/méthodes réutilisables pour différents types, avec sécurité de type à la compilation. Chapitre 15.

**Getter / Setter** — Méthodes publiques permettant de lire/modifier un attribut privé de façon contrôlée. Chapitre 4.

**Hibernate** — Implémentation la plus répandue de la spécification JPA. Chapitre 32.

**Héritage** — Mécanisme permettant à une classe de réutiliser et d'étendre le comportement d'une autre. Chapitre 5.

**Injection de dépendance** — Une classe reçoit ses dépendances de l'extérieur (constructeur) plutôt que de les créer elle-même. Chapitre 19-20.

**Interface** — Contrat de méthodes qu'une classe s'engage à implémenter, sans imposer de code partagé (hors méthodes par défaut). Chapitre 8.

**Interface fonctionnelle** — Interface ne déclarant qu'une seule méthode abstraite, implémentable via une lambda. Chapitre 8, 16.

**JDBC** — API standard Java pour communiquer avec une base de données relationnelle. Chapitre 26.

**JPA** — Spécification standard Java de persistance objet-relationnel (implémentée par Hibernate). Chapitre 32.

**JPQL** — Langage de requête de JPA, interrogeant des classes Java plutôt que des tables SQL directement. Chapitre 32.

**Lambda (expression)** — Syntaxe concise implémentant une interface fonctionnelle. Chapitre 16.

**Liaison dynamique** — Mécanisme résolvant, à l'exécution, quelle version redéfinie d'une méthode appeler selon le type réel de l'objet. Chapitre 6.

**ORM (Object-Relational Mapping)** — Outil automatisant la correspondance entre objets Java et lignes de tables relationnelles. Chapitre 32.

**Package** — Espace de noms regroupant des classes apparentées. Chapitre 9.

**Polymorphisme** — Capacité pour un même appel de méthode de produire un comportement différent selon le type réel de l'objet. Chapitre 6.

**PreparedStatement** — Requête SQL pré-compilée avec paramètres, protégeant structurellement contre l'injection SQL. Chapitre 28.

**Race condition** — Bug survenant quand plusieurs opérations concurrentes accèdent à une même donnée sans synchronisation adéquate. Chapitre 31.

**Redéfinition (Override)** — Remplacement, par une classe fille, du comportement d'une méthode héritée, même signature. Chapitre 5-6.

**Singleton** — Patron de conception garantissant une seule instance d'une classe dans toute l'application. Chapitre 20.

**SOLID** — Cinq principes de conception orientée objet (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion). Chapitre 19.

**SGBD** — Système de Gestion de Base de Données (MySQL, PostgreSQL, Oracle...). Chapitre 24.

**Static** — Modificateur désignant un membre partagé par toutes les instances d'une classe, ou indépendant de toute instance. Chapitre 11.

**Stream** — Pipeline d'opérations déclaratives (filter, map, reduce, collect) appliqué à une séquence de données. Chapitre 17.

**Surcharge (Overloading)** — Plusieurs méthodes de même nom dans une même classe, différant par leurs paramètres. Chapitre 3, 6.

**Transaction** — Ensemble d'opérations SQL devant réussir ou échouer intégralement ensemble (commit/rollback). Chapitre 29.

**UML** — Langage de modélisation graphique normalisé pour la conception logicielle. Chapitre 18.

**Upcasting** — Conversion implicite et toujours sûre d'un type spécifique vers un type plus général (classe mère/interface). Chapitre 6.
