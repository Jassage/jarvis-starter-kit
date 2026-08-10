# -*- coding: utf-8 -*-
"""Contenu : TP 1-9, Projet final, Glossaire, Aide-memoire, Erreurs frequentes, Cloture."""

TP_INTRO = [
    {"type": "section", "module_no": "TRAVAUX PRATIQUES", "title": "TP 1 à 9",
     "subtitle": "Neuf travaux pratiques progressifs, du plus simple au plus complet"},
]

TP = [
    {"type": "tp", "kicker": "TP 1", "title": "Classe Personne",
     "objective": "Modéliser un objet simple avec attributs et méthode d'affichage.",
     "requirements": ["Attributs nom, age", "Méthode afficherInformations()", "Créer 2 objets et les afficher"],
     "skills": "Modules 3-5", "notes": "TP fondamental, dérivé directement des exercices de fin de chapitre du manuel (classes/objets). Correction rapide au tableau."},

    {"type": "tp", "kicker": "TP 2", "title": "Classe Etudiant",
     "objective": "Ajouter constructeur et encapsulation à une classe.",
     "requirements": ["Attributs privés nom, age, moyenne", "Constructeur qui valide (moyenne entre 0 et 20)", "Getters/setters"],
     "skills": "Modules 6-7", "notes": "Vérifier que le constructeur appelle bien les setters plutôt que de contourner la validation."},

    {"type": "tp", "kicker": "TP 3", "title": "Gestion des comptes bancaires",
     "objective": "Appliquer l'encapsulation à un cas métier réaliste.",
     "requirements": ["Classe CompteBancaire (titulaire, solde privé)", "deposer(), retirer() avec règles métier", "Refuser un retrait supérieur au solde"],
     "skills": "Modules 6-7-19", "notes": "Ajouter une SoldeInsuffisantException personnalisée pour les groupes avancés (anticipe le Module 19)."},

    {"type": "tp", "kicker": "TP 4", "title": "Héritage avec Animal",
     "objective": "Construire une hiérarchie de classes avec extends.",
     "requirements": ["Classe mère Animal (nom, manger())", "Classes filles Chien, Chat avec méthodes propres", "Utiliser super() et @Override"],
     "skills": "Modules 10-11", "notes": "Reprend l'exemple fil rouge du cours (Animal/Chien/Chat)."},

    {"type": "tp", "kicker": "TP 5", "title": "Polymorphisme",
     "objective": "Manipuler un tableau d'objets de types différents avec un seul comportement.",
     "requirements": ["Réutiliser la hiérarchie du TP 4", "Tableau Animal[] mêlant Chien et Chat", "Une seule boucle qui appelle une méthode redéfinie"],
     "skills": "Module 12", "notes": "Vérifier l'absence de tout instanceof dans la boucle — c'est le critère de réussite du TP."},

    {"type": "tp", "kicker": "TP 6", "title": "Système de gestion d'une bibliothèque",
     "objective": "Faire collaborer plusieurs classes : Livre, Membre, Emprunt.",
     "requirements": ["Classe Livre (titre, disponible)", "Classe Membre (nom, liste d'emprunts)", "Emprunter/retourner avec mise à jour de disponible"],
     "skills": "Modules 15-16", "notes": "Bon terrain pour distinguer association (Membre/Emprunt) et composition. Peut être étendu avec ArrayList (Module 20) pour la liste d'emprunts."},

    {"type": "tp", "kicker": "TP 7", "title": "Gestion d'une entreprise",
     "objective": "Modéliser produits, ventes et stock avec collections.",
     "requirements": ["Classe Produit (nom, prix, stock)", "HashMap<String, Produit> pour le catalogue", "Vente qui décrémente le stock, refuse si insuffisant"],
     "skills": "Modules 19-20", "notes": "Combine exceptions (stock insuffisant) et collections (HashMap) dans un scénario métier réaliste."},

    {"type": "tp", "kicker": "TP 8", "title": "DAO + MySQL",
     "objective": "Connecter une classe métier à une vraie base de données.",
     "requirements": ["Table SQL correspondant au modèle", "DAO complet (CRUD) avec PreparedStatement", "Tester chaque opération avec de vraies données"],
     "skills": "Modules 27-29", "notes": "S'assurer qu'un environnement MySQL est disponible en salle, ou fournir un script SQL prêt à l'emploi + les identifiants de connexion."},

    {"type": "tp", "kicker": "TP 9", "title": "Application CRUD complète",
     "objective": "Assembler modèle, DAO et interface texte en une application fonctionnelle.",
     "requirements": ["Menu console (ajouter/lister/modifier/supprimer)", "Toutes les opérations persistées en base", "Gestion des exceptions à chaque étape (pas de crash)"],
     "skills": "Modules 26-30", "notes": "Synthèse finale avant le projet noté. Correspond en substance au Module 30 (Gestion des étudiants), à réutiliser ou à décliner sur un autre domaine (produits, membres…)."},
]

PROJET_FINAL = [
    {"type": "section", "module_no": "PROJET FINAL", "title": "Application de gestion",
     "subtitle": "Le projet capstone du cours — toutes les notions mobilisées ensemble"},

    {"type": "bullets", "kicker": "Projet final", "title": "Fonctionnalités attendues",
     "bullets": [
        "Étudiants, professeurs, classes, matières, inscriptions, notes, paiements (selon le domaine choisi)",
        "Architecture en couches complète : UI → Service → DAO → Base de données (Module 26)",
        "Persistance réelle en MySQL via JDBC et DAO (Modules 27-29)",
        "Gestion des erreurs par exceptions dédiées, jamais de crash brutal (Module 19)",
     ],
     "notes": "Domaine à choisir avec les étudiants (gestion scolaire, bibliothèque, commerciale…) selon leur contexte — le manuel de référence utilisé pour ce cours propose son propre exemple filé complet, nommé GestionCommerciale, décrit dans le slide suivant à titre d'illustration REPRODUCTIBLE."},

    {"type": "bullets", "kicker": "Projet final — exemple du manuel", "title": "Exemple illustratif : GestionCommerciale",
     "bullets": [
        "Domaine : gestion commerciale (Client, Produit, Commande, Paiement — vu au Module 16)",
        "UI (menu console) → Controller → Service → DAO → Database, en couches strictement séparées",
        "Chaque couche ne connaît que sa voisine directe (Module 26)",
        "Le SQL vit exclusivement dans les DAO ; les règles métier vivent exclusivement dans les Service",
     ],
     "notes": "Cet exemple précis est le projet final du manuel de référence du cours — présenté ici comme modèle reproductible, pas comme un exercice imposé. Les étudiants peuvent transposer strictement la même architecture à un domaine de gestion scolaire (Étudiants/Professeurs/Classes/Notes), en gardant EXACTEMENT la même séparation en couches."},

    {"type": "bullets", "kicker": "Projet final", "title": "Concepts obligatoirement mobilisés",
     "bullets": [
        "Classes, objets, encapsulation, héritage, polymorphisme, interfaces (Modules 3-14)",
        "Collections (ArrayList/HashMap), exceptions personnalisées (Modules 19-20)",
        "Packages organisés par rôle (Module 18)",
        "DAO, JDBC, MySQL (Modules 27-29)",
     ],
     "notes": "Grille d'évaluation suggérée : cocher chaque concept effectivement présent et correctement utilisé dans le rendu de chaque étudiant/groupe."},
]

# ---------------------------------------------------------- GLOSSAIRE ------
GLOSSAIRE = [
    {"type": "section", "module_no": "ANNEXE A", "title": "Glossaire", "subtitle": "Les termes essentiels du cours"},

    {"type": "glossary", "kicker": "Glossaire (1/3)", "title": "A – H",
     "items": [
        ("Abstraction", "Définir ce qu'une classe doit faire sans imposer comment (Module 13)."),
        ("Agrégation", "Un objet contient d'autres objets qui pourraient exister indépendamment (Module 15)."),
        ("Association", "Deux objets se connaissent, mais existent chacun indépendamment (Module 15)."),
        ("Attribut", "Une caractéristique (donnée) d'un objet (Module 3)."),
        ("Classe", "Un plan/moule permettant de créer des objets (Module 3)."),
        ("Composition", "Un objet crée et contient des objets qui n'ont aucun sens sans lui (Module 15)."),
        ("Constructeur", "Méthode spéciale exécutée à chaque new, qui initialise un objet (Module 6)."),
        ("DAO", "Data Access Object — classe dédiée à l'accès aux données (Module 29)."),
        ("Encapsulation", "Rendre les attributs privés, exposer des méthodes publiques contrôlées (Module 7)."),
        ("Exception", "Signal envoyé par Java lorsqu'une erreur survient à l'exécution (Module 19)."),
        ("Héritage", "Une classe fille réutilise attributs/méthodes d'une classe mère (Module 10)."),
     ]},
    {"type": "glossary", "kicker": "Glossaire (2/3)", "title": "I – P",
     "items": [
        ("Interface", "Contrat de méthodes qu'une classe s'engage à implémenter (Module 14)."),
        ("JDBC", "Outils Java pour se connecter à une base de données (Module 27)."),
        ("JVM", "Machine virtuelle Java, exécute le bytecode sur tout système (Module 1)."),
        ("Lambda", "Expression compacte pour écrire une méthode « à la volée » (Module 24)."),
        ("Liaison dynamique", "Java choisit, à l'exécution, la méthode selon le type RÉEL de l'objet (Module 12)."),
        ("Méthode", "Bloc d'instructions nommé, appartenant à une classe (Module 3)."),
        ("Objet", "Une instance concrète créée à partir d'une classe (Module 3)."),
        ("Package", "L'équivalent Java d'un dossier, regroupant des classes liées (Module 18)."),
        ("Polymorphisme", "Des objets de classes différentes répondent différemment à un même appel (Module 12)."),
        ("PreparedStatement", "Requête SQL préparée avec des ?, protégeant contre l'injection SQL (Module 28)."),
     ]},
    {"type": "glossary", "kicker": "Glossaire (3/3)", "title": "R – T",
     "items": [
        ("Référence", "Ce qu'une variable objet contient réellement : un pointeur vers l'objet (Module 4)."),
        ("Static", "Appartient à la classe elle-même, un seul exemplaire partagé (Module 9)."),
        ("Stream", "Chaîne d'opérations déclaratives appliquées à une collection (Module 24)."),
        ("Surcharge", "Plusieurs méthodes/constructeurs de même nom, paramètres différents (Module 17)."),
        ("SQL", "Langage standard pour créer et manipuler des bases de données (Module 27)."),
        ("SQLException", "Exception levée par JDBC en cas de problème de base de données (Module 28)."),
        ("this", "Désigne l'objet en cours de construction ou de manipulation (Module 6)."),
        ("Try-with-resources", "Forme de try qui ferme automatiquement une ressource (Module 23)."),
     ],
     "notes": "Glossaire condensé aux termes du programme de ce cours (Modules 1-30). Le manuel de référence contient un dictionnaire complet et bien plus large (Annexe A du manuel), à distribuer en complément si besoin."},
]

AIDE_MEMOIRE = [
    {"type": "table", "kicker": "ANNEXE B", "title": "Aide-mémoire — syntaxe essentielle",
     "headers": ["Notion", "Syntaxe"],
     "rows": [
        ["Classe", "public class Nom { }"],
        ["Attribut privé + getter", "private Type nom; public Type getNom() { return nom; }"],
        ["Constructeur", "public Nom(Type p) { this.attr = p; }"],
        ["Héritage", "class Fille extends Mere { }"],
        ["Redéfinition", "@Override\\npublic Type methode() { }"],
        ["Interface", "interface Nom { void methode(); }\\nclass C implements Nom { }"],
        ["Try/catch", "try { } catch (TypeException e) { } finally { }"],
        ["ArrayList", "List<T> l = new ArrayList<>(); l.add(x);"],
        ["HashMap", "Map<K,V> m = new HashMap<>(); m.put(k, v); m.get(k);"],
        ["Connexion JDBC", "DriverManager.getConnection(url, user, pass)"],
        ["PreparedStatement", "conn.prepareStatement(\"... WHERE x = ?\")"],
     ],
     "notes": "Ce tableau est un pense-bête, pas un cours — chaque ligne renvoie à son module pour l'explication complète. Le manuel de référence propose une Annexe B bien plus détaillée (commandes Maven/Git, raccourcis IDE), hors périmètre de ce cours de POO."},
]

ERREURS_RECAP = [
    {"type": "errors", "kicker": "ANNEXE C", "title": "Erreurs fréquentes — récapitulatif POO",
     "items": [
        "Oublier new → NullPointerException sur un attribut objet non initialisé",
        "Confondre classe et objet",
        "Rendre tous les attributs publics (perte de l'encapsulation)",
        "Confondre surcharge (paramètres différents) et redéfinition (@Override, même signature)",
        "Oublier @Override sur une redéfinition (faute de frappe silencieuse possible)",
        "Mal utiliser l'héritage (hériter sans que le test « EST UN » soit vrai)",
        "Comparer des objets avec == plutôt que .equals()",
     ]},
    {"type": "errors", "kicker": "ANNEXE C (suite)", "title": "Erreurs fréquentes — base de données",
     "items": [
        "UPDATE/DELETE sans WHERE : modifie ou supprime TOUTES les lignes",
        "Construire du SQL avec des chaînes concaténées non sécurisées (injection SQL)",
        "Ne jamais fermer les ressources JDBC (préférer systématiquement try-with-resources)",
        "Laisser du SQL fuir hors des classes DAO",
        "Compter les positions des ? d'un PreparedStatement à partir de 0 (elles commencent à 1)",
     ],
     "notes": "Cette double page condense les erreurs les plus significatives pour le périmètre du cours (POO + base de données). Le manuel de référence propose une Annexe C bien plus large, couvrant aussi tests, outils et bonnes pratiques d'architecture, hors périmètre direct de ce cours."},
]

CLOTURE = [
    {"type": "section", "module_no": "CLÔTURE", "title": "Résumé et message final",
     "subtitle": "De la syntaxe à la pensée d'un développeur"},

    {"type": "diagram_flow", "kicker": "Progression du cours — schéma du prompt", "title": "Comprendre → Maîtriser → Construire",
     "boxes": ["Comprendre", "Pratiquer", "Se tromper", "Corriger", "Construire", "Maîtriser"],
     "notes": "Ce cycle est la vraie méthode d'apprentissage de la programmation : aucune lecture ne remplace la pratique réelle, y compris les erreurs de compilation et les NullPointerException, qui font partie intégrante de l'apprentissage."},

    {"type": "summary", "kicker": "Résumé général", "title": "Ce que vous savez faire maintenant",
     "bullets": [
        "Concevoir des classes avec attributs, méthodes, constructeurs et encapsulation",
        "Utiliser héritage, polymorphisme, abstraction et interfaces pour organiser un système",
        "Choisir la bonne collection (ArrayList, HashSet, HashMap) selon le besoin",
        "Gérer les erreurs proprement avec des exceptions, y compris personnalisées",
        "Concevoir avec UML avant de coder, en couches claires (UI/Service/DAO)",
        "Connecter Java à MySQL avec JDBC et une architecture DAO propre",
     ]},

    {"type": "closing", "kicker": "Message final aux étudiants",
     "quote": "« Ne vous contentez pas d'apprendre la syntaxe Java. Apprenez à penser comme un développeur. »",
     "notes": "Diapositive de clôture, à lire à voix haute en fin de cours. Rappeler que la maîtrise vient de la pratique répétée, pas de la seule lecture — encourager fortement à refaire les TP et le projet final sans regarder les corrigés."},
]

ALL = TP_INTRO + TP + PROJET_FINAL + GLOSSAIRE + AIDE_MEMOIRE + ERREURS_RECAP + CLOTURE
