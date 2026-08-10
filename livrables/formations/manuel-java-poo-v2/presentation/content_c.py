# -*- coding: utf-8 -*-
"""Contenu : Modules 21 a 30 (generiques -> projet complet gestion etudiants)."""

# ============================================================ MODULE 21 ====
M21 = [
    {"type": "section", "module_no": "MODULE 21", "title": "Génériques",
     "subtitle": "Ce que représentent vraiment les chevrons < >"},

    {"type": "code_bullets", "kicker": "Module 21 — exemple du prompt", "title": "List<String> vs List<Integer>",
     "code": "List<String> noms = new ArrayList<>();      // T = String\nList<Integer> notes = new ArrayList<>();    // T = Integer",
     "bullets": [
        "Chaque utilisation d'ArrayList/HashMap depuis le Module 20 utilisait déjà les génériques",
        "T (paramètre de type) est un symbole, remplacé par un vrai type à la création de l'objet",
        "List<String> et List<Integer> sont deux types INCOMPATIBLES entre eux pour le compilateur",
     ],
     "notes": "Sans generics, une classe utilisant Object accepterait n'importe quel type sans contrôle, avec un transtypage manuel risqué (ClassCastException seulement à l'exécution). Les generics déplacent cette vérification à la COMPILATION."},

    {"type": "bullets", "kicker": "Module 21", "title": "Pourquoi les génériques sont utiles",
     "bullets": [
        "Sécurité : impossible d'ajouter accidentellement un type incompatible",
        "Pas de transtypage manuel nécessaire à la lecture (contrairement à Object)",
        "Toujours un type OBJET entre chevrons, jamais un primitif (Integer, pas int)",
     ],
     "notes": "On peut aussi créer sa PROPRE classe générique, ex. class Boite<T> { T contenu; } — mentionner brièvement, sans s'y attarder si le temps manque."},

    {"type": "summary", "kicker": "Module 21", "title": "À retenir",
     "bullets": ["Les generics vérifient la cohérence des types dès la compilation, sans transtypage manuel risqué"]},
]

# ============================================================ MODULE 22 ====
M22 = [
    {"type": "section", "module_no": "MODULE 22", "title": "Enum",
     "subtitle": "Représenter un ensemble fixe et connu de valeurs"},

    {"type": "code", "kicker": "Module 22 — exemple du prompt", "title": "enum Statut",
     "code": "public enum Statut {\n    ACTIF,\n    INACTIF,\n    BLOQUE\n}",
     "notes": "Sans enum, un simple String pour un statut accepte n'importe quelle valeur (« En cours », « encours »…) sans que le compilateur ne détecte rien. Un enum limite les valeurs possibles à une liste fixe, vérifiée à la compilation."},

    {"type": "code_bullets", "kicker": "Module 22", "title": "Utilisation",
     "code": "Statut s = Statut.ACTIF;\n\nif (s == Statut.ACTIF) {\n    System.out.println(\"Compte actif\");\n}",
     "bullets": [
        "== est sûr et même préféré à .equals() sur un enum : chaque valeur n'existe qu'en UN seul exemplaire",
        "values() renvoie toutes les valeurs, parcourables avec un for-each",
        "Un enum peut avoir des attributs, un constructeur et des méthodes, comme une classe",
     ],
     "notes": "Piège : un switch sur enum n'oblige PAS à traiter tous les cas (contrairement à une méthode abstraite) — toujours prévoir un default par prudence."},

    {"type": "exercise", "kicker": "Module 22 — À vous de jouer", "title": "Enum enrichi",
     "prompt": "Créez un enum NiveauUrgence (BASSE, MOYENNE, HAUTE, CRITIQUE) avec un attribut delaiMaximumHeures fixé par un constructeur, et une méthode estUrgent() (true pour HAUTE et CRITIQUE).",
     "notes": "this == HAUTE || this == CRITIQUE à l'intérieur même de l'enum — pas besoin de préfixe."},

    {"type": "summary", "kicker": "Module 22", "title": "À retenir",
     "bullets": ["enum limite les valeurs possibles à un ensemble fixe, vérifié par le compilateur", "== est sûr sur un enum, contrairement aux String"]},
]

# ============================================================ MODULE 23 ====
M23 = [
    {"type": "section", "module_no": "MODULE 23", "title": "Fichiers",
     "subtitle": "Faire persister des données au-delà de l'exécution du programme"},

    {"type": "code_bullets", "kicker": "Module 23", "title": "Écrire puis lire un fichier",
     "code": "try (FileWriter writer = new FileWriter(\"notes.txt\")) {\n    writer.write(\"Jaslin;16.5\\n\");\n}\n\ntry (BufferedReader reader = new BufferedReader(new FileReader(\"notes.txt\"))) {\n    String ligne;\n    while ((ligne = reader.readLine()) != null) {\n        System.out.println(ligne);\n    }\n}",
     "bullets": [
        "try-with-resources ferme automatiquement le fichier, même en cas d'erreur",
        "readLine() renvoie null quand il n'y a plus de ligne : le signal naturel de fin de boucle",
        "split(\";\") découpe une ligne ; Double.parseDouble()/Integer.parseInt() convertit le texte en nombre",
     ],
     "notes": "Sans fermeture (ou sans try-with-resources), les données écrites peuvent rester bloquées en mémoire tampon, jamais réellement transférées sur le disque. File/Path/Files (java.nio) offrent une API plus moderne, à mentionner brièvement."},

    {"type": "errors", "kicker": "Module 23", "title": "Erreurs fréquentes",
     "items": ["Oublier try-with-resources et ne jamais fermer le fichier", "Lire un fichier qui n'existe pas sans gérer IOException"]},

    {"type": "exercise", "kicker": "Module 23 — À vous de jouer", "title": "Carnet de contacts persistant",
     "prompt": "Écrivez enregistrerContact(nom, telephone) qui AJOUTE une ligne à contacts.txt (indice : new FileWriter(\"contacts.txt\", true)), et afficherTousLesContacts() qui relit le fichier.",
     "notes": "Le second paramètre true du FileWriter signifie « ajouter à la fin », plutôt que d'écraser le fichier existant."},

    {"type": "summary", "kicker": "Module 23", "title": "À retenir",
     "bullets": ["Un fichier conserve des données au-delà de l'exécution, contrairement à un ArrayList (RAM)", "try-with-resources garantit la fermeture automatique, même en cas d'erreur"]},
]

# ============================================================ MODULE 24 ====
M24 = [
    {"type": "section", "module_no": "MODULE 24", "title": "Lambda et Streams",
     "subtitle": "Traiter une collection de façon déclarative — non prioritaire avant la POO fondamentale"},

    {"type": "code", "kicker": "Module 24", "title": "Expression lambda",
     "code": "Predicate<Integer> estPair = n -> n % 2 == 0;\nSystem.out.println(estPair.test(6)); // true",
     "notes": "Une lambda écrit une petite méthode « à la volée », sans lui donner de nom. Elle ne fonctionne que sur une interface FONCTIONNELLE (une seule méthode abstraite) — Predicate, Function, Consumer, Supplier sont fournies par Java."},

    {"type": "code_bullets", "kicker": "Module 24", "title": "Stream : filter, map, collect",
     "code": "List<String> nomsAdmis = etudiants.stream()\n    .filter(e -> e.getMoyenne() >= 10)\n    .map(e -> e.getNom())\n    .toList();",
     "bullets": [
        "filter() sélectionne, map() transforme, sorted() trie — des opérations INTERMÉDIAIRES, enchaînables",
        "toList(), count(), sum() sont des opérations TERMINALES : sans elles, rien ne s'exécute",
        "Un Stream déjà consommé ne peut plus jamais être réutilisé",
     ],
     "notes": "forEach() applique une action à chaque élément. Le Stream combine tout ce qui précède : collections (Module 20), lambdas, et Optional pour les résultats potentiellement absents (average() par ex.)."},

    {"type": "exercise", "kicker": "Module 24 — À vous de jouer", "title": "Filtrer et transformer",
     "prompt": "À partir d'une List<Produit> (nom, prix, quantiteEnStock), calculez la valeur totale du stock des produits en stock (quantiteEnStock > 0), avec filter + mapToDouble + sum.",
     "notes": "Ne pas présenter cette partie comme un prérequis avant de maîtriser la POO fondamentale — insister que ce module est un bonus « Java moderne », consultable à tout moment après le Module 20."},

    {"type": "summary", "kicker": "Module 24", "title": "À retenir",
     "bullets": ["Une lambda transmet un comportement comme une simple valeur", "Un Stream enchaîne des opérations déclaratives, sans écrire la boucle manuellement"]},

    {"type": "quiz", "kicker": "Modules 21-24", "title": "Quiz — Génériques, enum, fichiers, lambda/streams",
     "questions": [
        "Pourquoi ArrayList<Etudiant> empêche-t-il d'y ajouter accidentellement un Produit ?",
        "Pourquoi comparer des enum avec == est-il sûr, contrairement aux String ?",
        "Comment sait-on qu'on a atteint la fin d'un fichier lu avec readLine() ?",
        "Que se passe-t-il si on oublie l'opération terminale d'un Stream ?",
     ],
     "notes": "Réponses : (1) Le paramètre générique T est fixé à Etudiant, vérifié dès la compilation. (2) Chaque valeur d'enum n'existe qu'en un seul exemplaire garanti. (3) readLine() renvoie null. (4) Rien ne s'exécute : un Stream reste paresseux tant qu'aucune opération terminale n'est appelée."},
]

# ============================================================ MODULE 25 ====
M25 = [
    {"type": "section", "module_no": "MODULE 25", "title": "UML et conception",
     "subtitle": "Passer d'un problème réel au code Java, en dessinant avant d'écrire"},

    {"type": "diagram_flow", "kicker": "Module 25 — pipeline du prompt", "title": "Du problème réel au code",
     "boxes": ["Problème réel", "Analyse", "Classes", "Attributs / Méthodes", "Relations", "Code Java"],
     "notes": "Construire un programme de plusieurs classes sans plan préalable, c'est comme construire une maison sans dessiner ses plans d'abord. UML systématise ce qui était déjà utilisé intuitivement depuis le Module 3 (diagramme Voiture)."},

    {"type": "diagram_class_uml", "kicker": "Module 25", "title": "Le diagramme de classes",
     "class_name": "Client", "attrs": ["- nom : String", "- soldeDu : double"], "methods": ["+ ajouterDette(montant)"],
     "class2_name": "Commande", "attrs2": ["- lignes : LigneCommande[]", "- payee : boolean"], "methods2": ["+ calculerTotal(): double", "+ valider(): void"],
     "multiplicity": "1        *",
     "notes": "« - » = private, « + » = public, « # » = protected. La multiplicité « 1 » et « * » sur la relation se lit : 1 Client peut avoir PLUSIEURS (*) Commande. Transformation en Java quasi mécanique : chaque « - » devient un attribut private, chaque « + » une méthode public."},

    {"type": "bullets", "kicker": "Module 25", "title": "Visibilité, héritage, association, multiplicité",
     "bullets": [
        "Visibilité : -, +, # dans le diagramme correspondent aux modificateurs du Module 8",
        "Héritage : flèche à triangle plein (Module 16)",
        "Association : ligne simple, avec sa multiplicité (1, *, 0..1…)",
        "Le diagramme de cas d'utilisation identifie ACTEURS et fonctionnalités, AVANT la structure technique",
     ],
     "notes": "Mentionner brièvement les diagrammes de séquence (ordre des appels dans le temps) et d'activités (un if/else visuel, avec losange = décision) si le temps le permet — tous se transforment directement en code Java."},

    {"type": "exercise", "kicker": "Module 25 — À vous de jouer", "title": "Dessiner avant de coder",
     "prompt": "Pour un système de réservation de salle : dessinez un diagramme de classes simple (Salle, Reservation, Employe), puis traduisez-le en squelette de classes Java.",
     "notes": "Démarche professionnelle attendue : le squelette Java doit découler DIRECTEMENT du diagramme, sans improvisation."},

    {"type": "summary", "kicker": "Module 25", "title": "À retenir",
     "bullets": ["UML donne des conventions de dessin standardisées, avant ou pendant l'écriture du code", "Chaque symbole UML se traduit presque mécaniquement en Java"]},
]

# ============================================================ MODULE 26 ====
M26 = [
    {"type": "section", "module_no": "MODULE 26", "title": "Architecture d'application",
     "subtitle": "Organiser une application en couches — complément pédagogique"},

    {"type": "diagram_flow", "kicker": "Module 26 — schéma du prompt", "title": "UI → Service → Repository → Database",
     "boxes": ["UI (interface utilisateur)", "Service (logique métier)", "Repository / DAO (accès aux données)", "Database"],
     "notes": "COMPLÉMENT pédagogique qui prépare directement les Modules 27-30 (DAO, JDBC). Chaque couche ne parle qu'à sa voisine directe — l'UI ne doit jamais appeler le DAO directement."},

    {"type": "table", "kicker": "Module 26", "title": "Le rôle de chaque couche",
     "headers": ["Couche", "Rôle"],
     "rows": [
        ["UI", "Ce que voit et manipule l'utilisateur final"],
        ["Service", "Les règles métier : un étudiant peut-il s'inscrire ? un compte peut-il retirer ce montant ?"],
        ["Repository / DAO", "L'accès aux données — lire/écrire en base, sans AUCUNE règle métier (Module 29)"],
        ["Database", "Le stockage durable des données (Module 27)"],
     ],
     "notes": "Cette organisation en couches sera concrètement appliquée dans le Module 30 (projet Gestion des Étudiants) et le Projet final."},

    {"type": "summary", "kicker": "Module 26", "title": "À retenir",
     "bullets": ["Chaque couche a une responsabilité unique et ne communique qu'avec sa voisine directe", "Le DAO ne connaît jamais de règle métier ; le Service ne connaît jamais de SQL"]},
]

# ============================================================ MODULE 27 ====
M27 = [
    {"type": "section", "module_no": "MODULE 27", "title": "Java et base de données",
     "subtitle": "OBLIGATOIRE — base de données, SQL, JDBC : le socle avant le code"},

    {"type": "bullets", "kicker": "Module 27", "title": "Vocabulaire d'une base de données relationnelle",
     "bullets": [
        "TABLE : regroupe toutes les données d'un même type de chose (tous les étudiants)",
        "COLONNE : un champ commun à toutes les lignes ; LIGNE : une entrée précise",
        "CLÉ PRIMAIRE : identifie une ligne de façon unique et permanente (souvent id, auto-généré)",
        "CLÉ ÉTRANGÈRE : une colonne qui référence la clé primaire d'une AUTRE table — une relation",
     ],
     "notes": "Analogie : un classeur avec des intercalaires (tables), chacun contenant des fiches (lignes) construites sur le même modèle (colonnes). Piège classique : dupliquer une info en texte au lieu de la relier par clé étrangère — corriger une seule fois, pas partout."},

    {"type": "table", "kicker": "Module 27", "title": "Commandes SQL essentielles",
     "headers": ["Commande", "Rôle"],
     "rows": [
        ["CREATE TABLE", "Crée une nouvelle structure de table"],
        ["INSERT INTO ... VALUES", "Ajoute une ligne"],
        ["SELECT ... WHERE", "Lit des lignes, filtrées par condition"],
        ["UPDATE ... SET ... WHERE", "Modifie des lignes existantes"],
        ["DELETE FROM ... WHERE", "Supprime des lignes"],
        ["JOIN ... ON", "Relie deux tables via clé primaire/étrangère"],
     ],
     "notes": "DANGER ABSOLU à souligner fortement : UPDATE ou DELETE SANS WHERE s'applique à TOUTES les lignes de la table, sans exception — l'une des erreurs les plus redoutées de tout développeur."},

    {"type": "code", "kicker": "Module 27", "title": "SQL : exemple complet",
     "code": "CREATE TABLE etudiants (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    nom VARCHAR(100),\n    moyenne DOUBLE\n);\n\nSELECT nom, moyenne FROM etudiants\nWHERE moyenne >= 14 ORDER BY moyenne DESC;",
     "notes": "WHERE en SQL joue le même rôle que .filter() en Stream API (Module 24) : les deux filtrent des données selon une condition. GROUP BY + COUNT()/SUM()/AVG() sont les équivalents SQL de sum()/average()."},

    {"type": "diagram_flow", "kicker": "Module 27 — schéma du prompt", "title": "L'architecture Java → JDBC → MySQL",
     "boxes": ["Java", "JDBC", "MySQL"],
     "notes": "JDBC (Java DataBase Connectivity) fait le pont entre un programme Java et une base de données, via un pilote (driver) spécifique à MySQL. Approfondi en détail au Module 28."},

    {"type": "table", "kicker": "Module 27", "title": "Vocabulaire JDBC essentiel",
     "headers": ["Terme", "Rôle"],
     "rows": [
        ["Connection", "Une connexion active vers la base de données"],
        ["Driver (pilote)", "Le composant technique propre à MySQL, adaptateur entre JDBC et la base"],
        ["URL JDBC", "jdbc:mysql://hôte:port/base — l'adresse de la base ciblée"],
        ["PreparedStatement", "Une requête SQL préparée avec des ?, protégée contre l'injection SQL"],
        ["ResultSet", "Le curseur qui parcourt les lignes renvoyées par un SELECT"],
        ["Transaction", "Un groupe d'opérations qui réussissent ou échouent TOUTES ensemble"],
     ],
     "notes": "CRUD = Create, Read, Update, Delete — les quatre opérations de base, détaillées au Module 28. Rappeler la définition d'une transaction en base bancaire : un virement = un débit + un crédit, tout ou rien."},

    {"type": "quiz", "kicker": "Modules 25-27", "title": "Quiz — UML, architecture, bases de données",
     "questions": [
        "Quel diagramme UML identifie qui utilise le système et pourquoi ?",
        "Pourquoi un DELETE sans WHERE est-il extrêmement dangereux ?",
        "Quelle commande SQL relie deux tables entre elles ?",
        "Pourquoi le Repository/DAO ne doit-il jamais contenir de règle métier ?",
     ],
     "notes": "Réponses : (1) Le diagramme de cas d'utilisation. (2) Il supprime TOUTES les lignes de la table, sans distinction. (3) JOIN. (4) Pour garder une séparation claire des responsabilités — le SQL doit rester isolé dans une seule couche, facilement remplaçable."},
]

# ============================================================ MODULE 28 ====
M28 = [
    {"type": "section", "module_no": "MODULE 28", "title": "Connexion MySQL avec Java",
     "subtitle": "Démonstration complète, étape par étape"},

    {"type": "bullets", "kicker": "Module 28 — Étapes 1 à 3", "title": "Créer la base et les tables",
     "bullets": [
        "Étape 1 — Créer la base de données : CREATE DATABASE ecole;",
        "Étape 2 — Créer les tables : CREATE TABLE etudiants (id INT PRIMARY KEY AUTO_INCREMENT, nom VARCHAR(100), age INT, moyenne DOUBLE);",
        "Étape 3 — Créer le projet Java (dossiers model/dao/service, Module 18 et 26)",
     ],
     "notes": "Dérouler ces étapes en direct si un environnement MySQL est disponible en classe ; sinon, présenter le code et son résultat attendu."},

    {"type": "code", "kicker": "Module 28 — Étapes 4 à 6", "title": "Driver, connexion, test",
     "code": "String url = \"jdbc:mysql://localhost:3306/ecole\";\n\ntry (Connection connexion =\n        DriverManager.getConnection(url, \"root\", \"motdepasse\")) {\n    System.out.println(\"Connexion réussie !\");\n} catch (SQLException e) {\n    System.out.println(\"Erreur : \" + e.getMessage());\n}",
     "caption": "Étape 4 : ajouter le driver JDBC MySQL au projet (via Maven, Module futur) — Étape 5-6 : connexion + test.",
     "notes": "jdbc:mysql://localhost:3306/ecole se décompose : préfixe jdbc:mysql:// → adresse localhost → port 3306 → base ecole. try-with-resources garantit la fermeture automatique de la connexion."},

    {"type": "code", "kicker": "Module 28 — Étape 7", "title": "Créer le modèle",
     "code": "class Etudiant {\n    private int id;\n    private String nom;\n    private int age;\n    private double moyenne;\n\n    Etudiant(String nom, int age, double moyenne) {\n        this.nom = nom; this.age = age; this.moyenne = moyenne;\n    }\n    // getters, setters (Module 7)...\n}",
     "notes": "Le modèle reste une classe Java SIMPLE, sans aucune trace de JDBC ni de SQL — c'est le rôle exclusif du DAO (étape suivante, Module 29)."},

    {"type": "code", "kicker": "Module 28 — Étapes 8 à 9", "title": "Repository/DAO et CRUD",
     "code": "void sauvegarder(Etudiant e) throws SQLException {\n    String sql = \"INSERT INTO etudiants (nom, age, moyenne) VALUES (?, ?, ?)\";\n    try (PreparedStatement req = connexion.prepareStatement(sql)) {\n        req.setString(1, e.getNom());\n        req.setInt(2, e.getAge());\n        req.setDouble(3, e.getMoyenne());\n        req.executeUpdate();\n    }\n}",
     "caption": "Les « ? » sont remplis un par un ; positions à partir de 1, JAMAIS de 0.",
     "notes": "PreparedStatement protège structurellement contre l'injection SQL — ne JAMAIS construire une requête en collant du texte utilisateur avec +. executeUpdate() pour INSERT/UPDATE/DELETE ; executeQuery() pour SELECT (renvoie un ResultSet)."},

    {"type": "code", "kicker": "Module 28 — Étape 10", "title": "Tester : lecture complète",
     "code": "String sql = \"SELECT id, nom, age, moyenne FROM etudiants\";\ntry (PreparedStatement req = connexion.prepareStatement(sql);\n     ResultSet rs = req.executeQuery()) {\n    while (rs.next()) {\n        System.out.println(rs.getString(\"nom\") + \" : \" + rs.getDouble(\"moyenne\"));\n    }\n}",
     "notes": "rs.next() avance à la ligne suivante et renvoie false quand il n'y en a plus — exactement le même principe que readLine() renvoyant null (Module 23). Tester en direct si un environnement MySQL est disponible."},

    {"type": "errors", "kicker": "Module 28", "title": "Erreurs fréquentes",
     "items": [
        "Coller du texte utilisateur dans une requête SQL → injection SQL (toujours PreparedStatement)",
        "Compter les positions des ? à partir de 0 (elles commencent à 1)",
        "Confondre executeQuery() (SELECT) et executeUpdate() (INSERT/UPDATE/DELETE)",
        "Stocker le mot de passe de connexion directement dans le code source versionné sur Git",
     ]},

    {"type": "exercise", "kicker": "Module 28 — À vous de jouer", "title": "CRUD complet",
     "prompt": "En reprenant les 10 étapes, ajoutez à votre EtudiantDAO les méthodes trouverParId(int id) et supprimer(int id).",
     "notes": "Cette exercice prépare directement le Module 29 (DAO) et sert de base au TP 8."},

    {"type": "summary", "kicker": "Module 28", "title": "À retenir",
     "bullets": [
        "URL JDBC : jdbc:type://adresse:port/base",
        "PreparedStatement protège contre l'injection SQL ; positions des ? à partir de 1",
        "executeUpdate() pour écrire, executeQuery() pour lire (renvoie un ResultSet)",
     ]},
]

# ============================================================ MODULE 29 ====
M29 = [
    {"type": "section", "module_no": "MODULE 29", "title": "DAO",
     "subtitle": "Organiser proprement l'accès aux données"},

    {"type": "diagram_flow", "kicker": "Module 29 — schéma du prompt", "title": "Entity → DAO → Database",
     "boxes": ["Entity (Etudiant — objet Java simple)", "DAO (EtudiantDAO — tout le JDBC caché)", "Database (MySQL)"],
     "notes": "Analogie : un guichet unique en administration. Tout le monde s'adresse au MÊME guichet, sans connaître les procédures internes. Si la procédure change, seul le guichet s'adapte."},

    {"type": "code", "kicker": "Module 29 — exemple du prompt", "title": "Interface EtudiantDAO",
     "code": "public interface EtudiantDAO {\n    void ajouter(Etudiant e);\n    List<Etudiant> findAll();\n    Etudiant findById(int id);\n    void modifier(Etudiant e);\n    void supprimer(int id);\n}",
     "caption": "Un DAO regroupe TOUT le SQL d'une table derrière des méthodes claires.",
     "notes": "Rappeler l'usage d'interface (Module 14) : ce contrat pourrait avoir plusieurs implémentations (MySQL, PostgreSQL…) sans jamais changer le reste du programme."},

    {"type": "bullets", "kicker": "Module 29", "title": "Le vrai bénéfice du DAO",
     "bullets": [
        "Le reste du programme n'utilise QUE des objets Java normaux, jamais de SQL directement",
        "Changer la structure d'une table, ou de base de données, n'impacte QUE le DAO",
        "Un DAO ne doit JAMAIS contenir de règle métier (validations, calculs) — seulement l'accès aux données",
     ],
     "notes": "C'est exactement le bénéfice de l'encapsulation (Module 7), appliqué ici à l'échelle d'une couche entière plutôt qu'à un seul attribut."},

    {"type": "errors", "kicker": "Module 29", "title": "Erreurs fréquentes",
     "items": ["Laisser du SQL fuir hors du DAO (ex : directement dans main())", "Un DAO qui contient de la logique métier (ce n'est pas son rôle)"]},

    {"type": "exercise", "kicker": "Module 29 — À vous de jouer", "title": "Implémenter EtudiantDAO",
     "prompt": "Implémentez l'interface EtudiantDAO avec JDBC (comme au Module 28), en respectant strictement la règle : aucune validation métier dans le DAO.",
     "notes": "Toute règle de type « une moyenne doit être entre 0 et 20 » doit vivre dans le modèle (Module 7, encapsulation) ou dans une future couche Service, jamais dans le DAO."},

    {"type": "summary", "kicker": "Module 29", "title": "À retenir",
     "bullets": ["Un DAO regroupe tout le JDBC d'une table derrière des méthodes claires", "Le modèle reste une classe Java simple, sans aucune trace de SQL"]},
]

# ============================================================ MODULE 30 ====
M30 = [
    {"type": "section", "module_no": "MODULE 30", "title": "Projet complet — Système de gestion des étudiants",
     "subtitle": "Toute la POO étudiée, connectée à une vraie base de données"},

    {"type": "diagram_flow", "kicker": "Module 30 — architecture du prompt", "title": "Architecture du projet",
     "boxes": ["Main", "Service (règles métier)", "DAO (accès aux données)", "JDBC", "MySQL"],
     "notes": "Cette architecture reprend exactement les Modules 26 (couches) à 29 (DAO). C'est la synthèse de tout le cours jusqu'ici."},

    {"type": "bullets", "kicker": "Module 30", "title": "Fonctionnalités attendues",
     "bullets": [
        "Ajouter, modifier, supprimer, rechercher, afficher un étudiant",
        "Enregistrer en base de données (Module 28) et récupérer depuis MySQL",
        "Utiliser encapsulation (Module 7), constructeur validant (Module 6), DAO (Module 29)",
        "Gérer les erreurs proprement avec des exceptions (Module 19), pas de crash brutal",
     ],
     "notes": "Ce projet reprend directement l'exemple filé Etudiant/EtudiantDAO des Modules 28-29. C'est le premier projet qui mobilise TOUTE la chaîne : modèle encapsulé → DAO → JDBC → MySQL."},

    {"type": "code_bullets", "kicker": "Module 30", "title": "Le modèle Etudiant, complet",
     "code": "public class Etudiant {\n    private int id;\n    private String nom;\n    private double moyenne;\n\n    public Etudiant(String nom, double moyenne) {\n        setNom(nom);\n        setMoyenne(moyenne);\n    }\n\n    public void setMoyenne(double moyenne) {\n        if (moyenne < 0 || moyenne > 20)\n            throw new IllegalArgumentException(\"Moyenne invalide\");\n        this.moyenne = moyenne;\n    }\n    // ...\n}",
     "bullets": [
        "Le constructeur réutilise les setters — aucune validation contournée (Module 7)",
        "Toute la couche DAO reprend l'EtudiantDAO du Module 29",
        "Le Service orchestre : par exemple, refuser une inscription si l'étudiant existe déjà",
     ],
     "notes": "Faire le lien explicite avec chaque module précédent lors de la présentation — ce projet est une synthèse, pas une nouveauté conceptuelle."},

    {"type": "exercise", "kicker": "Module 30 — Projet guidé", "title": "Construire le projet ensemble",
     "prompt": "En binôme : construisez Etudiant (modèle encapsulé), EtudiantDAO (CRUD complet JDBC), et un petit menu texte dans main() qui appelle ajouter/lister/supprimer.",
     "notes": "Séance pratique guidée. Circuler pour vérifier : encapsulation respectée, SQL uniquement dans le DAO, gestion des exceptions SQLException à chaque appel."},

    {"type": "summary", "kicker": "Module 30", "title": "À retenir",
     "bullets": [
        "Ce projet mobilise l'ensemble du cours : POO fondamentale + architecture + JDBC",
        "Une bonne architecture rend chaque couche remplaçable sans casser les autres",
     ]},
]

ALL = M21 + M22 + M23 + M24 + M25 + M26 + M27 + M28 + M29 + M30
