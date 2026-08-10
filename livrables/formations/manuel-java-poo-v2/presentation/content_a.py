# -*- coding: utf-8 -*-
"""Contenu : couverture, objectifs, plan, Module 1 (intro), Module 2 (rappel bases),
Modules 3 a 9 (POO fondamentale : classes/objets -> static)."""

FRONT = [
    {"type": "cover",
     "kicker": "COURS DE PROGRAMMATION",
     "title": "JAVA",
     "subtitle": "Programmation Orientée Objet",
     "tagline": "De la classe et de l'objet à l'application complète avec base de données",
     "meta": ["Enseignant : ____________________", "Établissement : ____________________", "Année académique : ____________________"]},

    {"type": "bullets", "kicker": "Objectifs du cours", "title": "Où ce cours va vous mener",
     "bullets": [
        "Comprendre la Programmation Orientée Objet (POO) et penser en objets, pas seulement en instructions",
        "Maîtriser classes, objets, encapsulation, héritage, polymorphisme, abstraction, interfaces",
        "Utiliser les structures de données de Java : tableaux, ArrayList, HashSet, HashMap",
        "Gérer les erreurs proprement avec les exceptions, et faire persister des données (fichiers, puis base de données)",
        "Concevoir avec UML avant de coder, et organiser une application en couches claires",
        "Connecter Java à MySQL avec JDBC, via une architecture DAO propre",
        "Construire une application complète, du modèle de données jusqu'à la base de données",
     ],
     "notes": "Cadrer la séance : ce cours part du principe que les bases de Java (variables, boucles, méthodes) sont déjà vues ou seront rappelées brièvement au Module 2. L'objectif final : être capable de concevoir ET développer une application Java en POO connectée à une base de données. Insister sur la progression : chaque brique s'appuie sur la précédente, ne pas sauter de module."},

    {"type": "bullets", "kicker": "Plan du cours", "title": "Progression du cours",
     "bullets": [
        "1. Introduction à la POO — 2. Rappel des bases Java",
        "3-9. Classe, objet, attribut, méthode, constructeur, encapsulation, modificateurs, static",
        "10-14. Héritage, redéfinition, polymorphisme, abstraction, interfaces",
        "15-18. Relations entre classes, surcharge, packages",
        "19-24. Exceptions, collections, génériques, enum, fichiers, lambdas & streams",
        "25-26. UML et architecture en couches",
        "27-30. Bases de données, JDBC, DAO, projet Gestion des Étudiants",
        "TP 1 à 9, quiz, projet final, glossaire",
     ],
     "notes": "Ce plan suit fidèlement la logique du manuel de référence du cours. Chaque grande étape s'appuie sur la précédente : ne jamais avancer sur les couches base de données avant que la POO fondamentale (Modules 3 à 18) soit acquise."},
]

# ============================================================ MODULE 1 =====
M1 = [
    {"type": "section", "module_no": "MODULE 1", "title": "Introduction à la POO",
     "subtitle": "Qu'est-ce que la programmation ? Pourquoi la POO ? Comment Java fonctionne."},

    {"type": "bullets", "kicker": "Module 1", "title": "Qu'est-ce qu'un programme ?",
     "bullets": [
        "Un ordinateur ne sait rien faire seul : il exécute une suite d'instructions précises",
        "Analogie : une recette de cuisine — un ordre exact, aucune étape devinée",
        "Un langage de programmation traduit une intention humaine en instructions compréhensibles par la machine",
     ],
     "definition": "Programme = suite d'instructions, écrites dans un ordre précis, exécutées une par une par un ordinateur.",
     "notes": "Demander : « Quelle est la différence entre une recette de cuisine et un programme ? » Réponse attendue : aucune, structurellement — les deux exigent un ordre exact, sans étape devinée. Transition : pour écrire ces instructions, il faut un langage — Java en est un."},

    {"type": "bullets", "kicker": "Module 1", "title": "Programmation procédurale : la limite",
     "bullets": [
        "Approche procédurale : des variables séparées + des fonctions qui les manipulent",
        "Exemple : nomClient1/soldeClient1, nomClient2/soldeClient2… rien ne les relie formellement",
        "Avec 100 clients : 200 variables à suivre à la main — aucune n'appartient visiblement à l'autre",
        "La POO répond à ce problème précis : regrouper données + actions dans une même unité, l'objet",
     ],
     "notes": "Ce point est un COMPLÉMENT pédagogique qui prépare directement le chapitre 8 du manuel (« Pourquoi avons-nous besoin de la POO »). Montrer au tableau l'exemple BoutiqueSansPOO vs BoutiqueAvecPOO (repris en Module 3). Insister : la procédurale n'est pas « fausse », elle devient juste ingérable à mesure que le programme grandit."},

    {"type": "bullets", "kicker": "Module 1", "title": "Java : contexte et caractéristiques",
     "bullets": [
        "Créé en 1995 par Sun Microsystems (racheté depuis par Oracle)",
        "Devise historique : « Write Once, Run Anywhere » (écrit une fois, exécuté partout)",
        "Utilisé dans les banques, assurances, administrations, Android, le côté serveur, les applications d'entreprise",
        "Fortement typé, orienté objet, portable grâce à la JVM",
     ],
     "notes": "Anecdote à raconter : le nom « Java » viendrait du café bu par l'équipe créatrice, originaire de l'île de Java — d'où le logo tasse de café fumante. Insister sur la stabilité/robustesse long terme comme raison du choix de Java dans les systèmes bancaires et administratifs."},

    {"type": "diagram_flow", "kicker": "Module 1", "title": "Comment un programme Java s'exécute",
     "boxes": ["Code Java (.java)", "javac (compilation)", "Bytecode (.class)", "JVM (Java Virtual Machine)", "Système d'exploitation"],
     "notes": "Décortiquer chaque flèche : (1) le développeur écrit du code source lisible ; (2) javac le compile en bytecode, un langage intermédiaire propre à Java ; (3) la JVM, installée sur chaque OS, traduit ce même bytecode pour la machine réelle. C'est cette étape intermédiaire qui permet au MÊME fichier compilé de tourner sur Windows, Mac et Linux sans réécriture."},

    {"type": "definitions_trio", "kicker": "Module 1 — complément pédagogique", "title": "JDK, JRE et JVM",
     "items": [
        ("JVM", "Java Virtual Machine — exécute le bytecode sur la machine réelle, quel que soit l'OS."),
        ("JRE", "Java Runtime Environment — la JVM + les bibliothèques nécessaires pour EXÉCUTER un programme Java déjà compilé."),
        ("JDK", "Java Development Kit — le JRE + les outils pour DÉVELOPPER (javac, débogueur…). Nécessaire pour écrire et compiler du code."),
     ],
     "notes": "COMPLÉMENT pédagogique : le manuel de référence détaille la JVM et la compilation (chapitre 1) mais ne nomme pas formellement JDK/JRE — ce point le complète pour l'usage pratique en salle (installation de l'environnement). Retenir la relation d'inclusion : JDK ⊃ JRE ⊃ JVM. Pour développer, il faut le JDK ; pour seulement exécuter un .jar déjà compilé, le JRE suffit."},

    {"type": "code", "kicker": "Module 1", "title": "Ton premier programme Java",
     "code": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Bonjour !\");\n    }\n}",
     "caption": "public class Main → un point d'entrée obligatoire : la méthode main().",
     "notes": "Construire ce programme progressivement au tableau : (1) classe vide, (2) ajouter public static void main(String[] args), (3) ajouter System.out.println. Expliquer chaque mot brièvement mais annoncer qu'ils seront détaillés plus loin (public → chapitre encapsulation ; static → module static). Exécuter mentalement : javac Main.java puis java Main."},

    {"type": "errors", "kicker": "Module 1", "title": "Erreurs fréquentes",
     "items": [
        "Le nom du fichier ne correspond pas exactement au nom de la classe publique",
        "Oublier une accolade fermante",
        "Faute de casse : System.out.printLn au lieu de println (Java est sensible à la casse)",
     ],
     "notes": "Faire écrire ces trois erreurs au tableau et demander aux étudiants de prédire le message d'erreur du compilateur pour chacune."},

    {"type": "summary", "kicker": "Module 1", "title": "À retenir",
     "bullets": [
        "Un programme est une suite d'instructions précises, exécutées dans l'ordre",
        "Java est compilé en bytecode, puis exécuté par la JVM — d'où sa portabilité",
        "JDK (développer) ⊃ JRE (exécuter) ⊃ JVM (machine virtuelle)",
        "Chaque programme Java démarre par la méthode main(), point d'entrée obligatoire",
     ]},

    {"type": "quiz", "kicker": "Module 1", "title": "Quiz — Introduction à la POO",
     "questions": [
        "Vrai ou faux : un .class compilé sur Windows doit être recompilé pour tourner sur Mac.",
        "Que produit javac à partir d'un fichier .java ?",
        "Quel outil exécute réellement le bytecode ?",
        "Le JDK contient-il le JRE, ou l'inverse ?",
        "Pourquoi la programmation procédurale devient-elle ingérable avec beaucoup de clients ?",
     ],
     "notes": "Réponses : (1) Faux — même bytecode, exécuté par la JVM propre à chaque OS. (2) Le bytecode (.class). (3) La JVM. (4) Le JDK contient le JRE (qui contient lui-même la JVM). (5) Parce que rien ne relie formellement les variables d'un même client entre elles — au-delà de quelques dizaines d'éléments, c'est ingérable à la main."},
]

# ============================================================ MODULE 2 =====
M2 = [
    {"type": "section", "module_no": "MODULE 2", "title": "Rappel des bases Java",
     "subtitle": "Variables, types, opérateurs, conditions, boucles, méthodes — avant d'entrer en POO"},

    {"type": "code_bullets", "kicker": "Module 2", "title": "Variables et types",
     "code": "int age = 20;\ndouble prix = 250.0;\nString nom = \"Jaslin\";\nboolean actif = true;",
     "bullets": [
        "Une variable = un espace nommé en mémoire (nom + type + valeur)",
        "Java est fortement typé : le type est déclaré et vérifié à la compilation",
        "Types primitifs courants : int, double, boolean, char — String est un objet",
     ],
     "notes": "Rappel rapide seulement — si le public maîtrise déjà ces notions, ne pas s'attarder. Analogie : une étiquette collée sur une boîte (le nom), le contenu de la boîte pouvant changer (la valeur), mais l'étiquette reste."},

    {"type": "code_bullets", "kicker": "Module 2", "title": "Opérateurs",
     "code": "int a = 10, b = 3;\na + b;   // 13\na / b;   // 3  (division ENTIÈRE)\na % b;   // 1  (modulo : le reste)",
     "bullets": [
        "Arithmétiques : + - * / %",
        "Piège classique : 10 / 3 vaut 3, pas 3.33 — la partie décimale est supprimée, pas arrondie",
        "Comparaison (==, !=, <, >) et logiques (&&, ||, !)",
     ],
     "notes": "Insister sur le piège de la division entière — c'est l'erreur la plus fréquente des débutants sur ce sujet. Demander : pourquoi (double) a / b donne-t-il un résultat différent de a / b ? Réponse : le transtypage doit être appliqué AVANT la division, sinon le calcul entier a déjà eu lieu."},

    {"type": "code_bullets", "kicker": "Module 2", "title": "Conditions",
     "code": "if (note >= 16) {\n    // Très Bien\n} else if (note >= 10) {\n    // Admis\n} else {\n    // Non admis\n}",
     "bullets": [
        "if / else if / else exécute UN SEUL bloc, le premier dont la condition est vraie",
        "switch : une alternative pour tester une même variable contre plusieurs valeurs",
     ],
     "notes": "Rappeler l'ordre de test : dès qu'une condition est vraie, le reste de la chaîne est ignoré, même si une condition suivante aurait aussi été vraie. Piège classique : ranger les conditions de la plus stricte à la plus large, pas l'inverse."},

    {"type": "code_bullets", "kicker": "Module 2", "title": "Boucles",
     "code": "for (int i = 1; i <= 5; i++) {\n    System.out.println(i);\n}",
     "bullets": [
        "for : nombre de répétitions connu à l'avance",
        "while / do-while : répète tant qu'une condition reste vraie",
        "for-each : parcourt chaque élément d'un tableau ou d'une collection",
     ],
     "notes": "Décomposer l'ordre d'exécution du for : initialisation (une fois) → condition → bloc → incrément → retour à la condition. Piège classique : oublier de faire évoluer la condition testée → boucle infinie."},

    {"type": "bullets", "kicker": "Module 2", "title": "Tableaux (rappel)",
     "bullets": [
        "Un tableau a une taille FIXE, décidée une fois pour toutes : int[] notes = {12, 15, 9};",
        "Accès par indice, toujours à partir de 0 : notes[0] est le premier élément",
        "Parcours avec for classique ou for-each",
        "Approfondi au Module 20 (Collections), avec ArrayList qui lève cette limite de taille fixe",
     ],
     "notes": "Piège classique : .length (attribut, sans parenthèses) sur un tableau vs .length() (méthode, avec parenthèses) sur un String."},

    {"type": "code_bullets", "kicker": "Module 2", "title": "Méthodes : paramètres et valeur de retour",
     "code": "static int additionner(int a, int b) {\n    return a + b;\n}\n\nint resultat = additionner(3, 4); // 7",
     "bullets": [
        "Une méthode regroupe des instructions sous un nom réutilisable",
        "void = ne renvoie rien ; un type de retour (int, double…) exige un return",
        "Paramètre = nom dans la définition ; argument = valeur réelle envoyée à l'appel",
     ],
     "notes": "C'est la dernière étape avant d'entrer en POO — souligner explicitement la transition : une méthode 'appartiendra' bientôt à une classe précise, et manipulera ses propres données, sans qu'on ait besoin de tout lui passer en paramètre."},

    {"type": "exercise", "kicker": "Module 2 — À vous de jouer", "title": "Exercice de synthèse",
     "prompt": "Écrivez une méthode calculerMoyenne(int[] notes) qui renvoie la moyenne d'un tableau de notes, puis un programme main qui affiche « Admis » si la moyenne est ≥ 10, « Non admis » sinon.",
     "notes": "Correction : boucler sur le tableau en sommant, diviser par notes.length (en forçant un double), puis un if/else simple. Laisser 5 minutes de recherche avant d'afficher la correction."},
]

# ============================================================ MODULE 3 =====
M3 = [
    {"type": "section", "module_no": "MODULE 3", "title": "Comprendre la Programmation Orientée Objet",
     "subtitle": "Objet, classe, attribut, méthode, état, comportement, instance"},

    {"type": "bullets", "kicker": "Module 3", "title": "Le problème que la POO résout",
     "bullets": [
        "Boutique sans POO : nomClient1/soldeClient1, nomClient2/soldeClient2… variables séparées",
        "Rien, dans le code, ne dit que nomClient1 et soldeClient1 appartiennent au MÊME client",
        "Avec 100 clients : 200 variables séparées à suivre à la main",
     ],
     "notes": "Reprendre l'exemple BoutiqueSansPOO du Module 1 si le temps le permet, ou le présenter ici pour la première fois. Le code exact est dans le manuel (chapitre 8) : deux clients, quatre variables, deux fonctions statiques qui les manipulent séparément."},

    {"type": "compare", "kicker": "Module 3", "title": "Tas de papiers vs dossier organisé",
     "left_title": "Sans POO", "left_items": ["Feuille 1 : \"Marie\"", "Feuille 2 : \"0\" (solde ?)", "100 clients = 200 feuilles éparpillées"],
     "right_title": "Avec POO", "right_items": ["DOSSIER Marie", "Nom : Marie — Solde : 500 HTG", "Actions : ajouterAchat()"],
     "notes": "Analogie du manuel : un dossier client regroupe TOUT ce qui concerne un client (données ET actions) en une seule unité cohérente. C'est exactement ce que propose la POO."},

    {"type": "definitions_trio", "kicker": "Module 3", "title": "Le vocabulaire fondamental",
     "items": [
        ("Classe", "Le plan, le moule (ex : le plan-type d'un dossier client)."),
        ("Objet", "Une chose réelle construite à partir du plan (ex : le dossier de Marie, précisément)."),
        ("Attribut", "Une caractéristique de l'objet (ex : le nom, le solde)."),
     ],
     "notes": "Ajouter un 4e terme oralement : Méthode = une action que l'objet sait faire (ex : ajouterAchat()). Insister : une classe seule ne représente JAMAIS un objet concret — le plan d'une maison n'est pas habitable."},

    {"type": "diagram_tree", "kicker": "Module 3 — exemple du prompt", "title": "Une classe, plusieurs objets",
     "root": "Voiture (classe)", "children": ["Toyota rouge", "BMW noire", "Mercedes blanche"],
     "notes": "Exemple donné tel quel dans la consigne du cours. Chaque objet a SES PROPRES valeurs (marque, couleur) mais partage la même structure (attributs marque/couleur/vitesse, méthodes démarrer/accélérer/freiner) définie une seule fois dans la classe."},

    {"type": "code", "kicker": "Module 3", "title": "Vocabulaire en code : classe Client",
     "code": "class Client {\n    // ATTRIBUTS\n    String nom;\n    double solde;\n\n    // MÉTHODE\n    void ajouterAchat(double montant) {\n        solde = solde + montant;\n    }\n}",
     "caption": "Les données (nom, solde) et l'action (ajouterAchat) vivent désormais ensemble.",
     "notes": "Comparer explicitement avec la version « sans POO » du début du module. Souligner : ajouterAchat() utilise directement solde, sans qu'on le lui passe en paramètre séparément — elle sait déjà qu'elle appartient à un client précis."},

    {"type": "errors", "kicker": "Module 3", "title": "Erreurs fréquentes",
     "items": [
        "Croire que la POO élimine le besoin des variables/conditions/boucles/méthodes déjà connues",
        "Vouloir créer une classe pour absolument tout, y compris un simple calcul sans état à conserver",
     ],
     "notes": "La POO organise le code déjà connu, elle n'ajoute rien de magique. Une classe se justifie par un ÉTAT qui évolue dans le temps (un client, un compte), pas par n'importe quel bout de logique isolé."},

    {"type": "exercise", "kicker": "Module 3 — À vous de jouer", "title": "Identifier classe / attributs / méthode",
     "prompt": "Pour une application de bibliothèque, identifiez une classe plausible, donnez-lui au moins 2 attributs et 1 méthode.",
     "notes": "Réponse attendue : classe Livre, attributs titre (String) et disponible (boolean), méthode emprunter(). Faire justifier : un livre a un état qui évolue (disponible ou non) et des actions qui lui sont propres."},

    {"type": "summary", "kicker": "Module 3", "title": "À retenir",
     "bullets": [
        "CLASSE = le plan ; OBJET = une instance concrète construite à partir du plan",
        "ATTRIBUT = une caractéristique ; MÉTHODE = une action",
        "La POO regroupe données et actions liées, plutôt que de les séparer",
        "Une classe seule ne représente jamais un objet précis",
     ]},
]

# ============================================================ MODULE 4 =====
M4 = [
    {"type": "section", "module_no": "MODULE 4", "title": "Créer une classe Java",
     "subtitle": "Construire une classe pas à pas, puis créer un objet avec new"},

    {"type": "code", "kicker": "Module 4 — étape 1", "title": "Une classe vide",
     "code": "class Voiture {\n\n}",
     "notes": "Étape 1 du manuel : une classe vide, juste l'enveloppe. Rien à exécuter encore."},

    {"type": "code", "kicker": "Module 4 — étape 2", "title": "Ajouter les attributs",
     "code": "class Voiture {\n    String marque;\n    String couleur;\n    double vitesse;\n}",
     "notes": "Chaque objet Voiture créé à partir de ce plan aura SON PROPRE marque/couleur/vitesse, indépendants des autres."},

    {"type": "code", "kicker": "Module 4 — étape 3", "title": "Ajouter une méthode",
     "code": "class Voiture {\n    String marque;\n    String couleur;\n    double vitesse;\n\n    void demarrer() {\n        System.out.println(\"La voiture démarre\");\n    }\n}",
     "notes": "Une méthode void ajoute un comportement, sans encore de valeur de retour. Rappel du Module 2 sur les méthodes."},

    {"type": "code_bullets", "kicker": "Module 4 — étape 4", "title": "Créer un objet avec new",
     "code": "Voiture voiture1 = new Voiture();\nvoiture1.marque = \"Toyota\";\nvoiture1.couleur = \"Rouge\";\n\nvoiture1.demarrer();\nSystem.out.println(voiture1.marque);",
     "bullets": [
        "new déclenche : réservation mémoire → attributs à leur valeur par défaut → appel du constructeur",
        "Voiture voiture2 = new Voiture(); crée un DEUXIÈME objet, totalement indépendant du premier",
        "Le point (.) accède aux attributs et méthodes d'un objet précis",
     ],
     "notes": "Expliquer chaque mot de la ligne : TYPE nomVariable = new Constructeur(). Montrer avec deux objets Voiture (voiture1 Toyota rouge, voiture2 Honda bleue) que chacun garde ses propres valeurs, indépendamment de l'autre."},

    {"type": "table", "kicker": "Module 4", "title": "Valeurs par défaut d'un attribut non initialisé",
     "headers": ["Type", "Valeur par défaut"],
     "rows": [["int, long, short, byte", "0"], ["double, float", "0.0"], ["boolean", "false"], ["String, tout type objet", "null"]],
     "notes": "Ce tableau explique pourquoi appeler une méthode sur un attribut objet non initialisé (String par ex.) provoque une NullPointerException — le sujet le plus fréquent d'erreur en Java, revu au Module 6 (constructeurs) pour le résoudre définitivement."},

    {"type": "exercise", "kicker": "Module 4 — À vous de jouer", "title": "Construire une classe complète",
     "prompt": "Créez une classe Livre avec les attributs titre (String) et disponible (boolean), une méthode emprunter() qui affiche un message différent selon la disponibilité. Créez un objet et testez.",
     "notes": "Solution attendue proche de l'exercice du manuel (chapitre 9) : if (disponible) { disponible = false; ... } else { ... }. Vérifier que chaque étudiant a bien utilisé new."},

    {"type": "summary", "kicker": "Module 4", "title": "À retenir",
     "bullets": [
        "new réserve la mémoire, initialise les valeurs par défaut, puis appelle le constructeur",
        "Une variable objet contient une RÉFÉRENCE, jamais l'objet lui-même",
        "Deux objets créés séparément sont toujours indépendants, sauf affectation directe (v2 = v1)",
     ]},
]

# ============================================================ MODULE 5 =====
M5 = [
    {"type": "section", "module_no": "MODULE 5", "title": "Attributs et méthodes",
     "subtitle": "Paramètres, valeur de retour, méthodes void et méthodes avec retour"},

    {"type": "bullets", "kicker": "Module 5", "title": "Attribut d'instance vs méthode",
     "bullets": [
        "Attribut d'instance : chaque objet a SA PROPRE copie (ex : le solde de CE client précis)",
        "Méthode void : effectue une action, ne renvoie rien",
        "Méthode avec retour : calcule et RENVOIE un résultat avec return",
        "Méthode avec paramètres : reçoit des informations en entrée, entre parenthèses",
     ],
     "notes": "Faire le lien explicite avec le Module 2 : une méthode de classe fonctionne exactement pareil qu'une méthode static, sauf qu'elle appartient maintenant à un objet et peut lire/modifier ses attributs directement, sans les recevoir en paramètre."},

    {"type": "code", "kicker": "Module 5 — exemple du prompt", "title": "Méthode avec paramètres et retour",
     "code": "public double calculerSalaire(double salaire, double prime) {\n    return salaire + prime;\n}",
     "caption": "1. Déclaration → 2. Appel : calculerSalaire(15000, 2000) → 3. Résultat : 17000.0",
     "notes": "Décomposer les trois étapes demandées par la consigne : déclaration (la méthode elle-même), appel (avec de vrais arguments), résultat (la valeur renvoyée, récupérable dans une variable)."},

    {"type": "code_bullets", "kicker": "Module 5", "title": "void vs avec retour, côte à côte",
     "code": "void afficherSolde(double solde) {\n    System.out.println(solde);\n}\n\ndouble getSolde() {\n    return solde;\n}",
     "bullets": [
        "void → agit (afficher, modifier), rien à récupérer dans une variable",
        "avec type de retour → calcule et renvoie une valeur exploitable ensuite",
        "Oublier return dans une méthode non-void est une erreur de compilation",
     ],
     "notes": "Cette distinction prépare directement le Module 7 (encapsulation, getters/setters) où les deux formes seront systématiquement utilisées côte à côte."},

    {"type": "exercise", "kicker": "Module 5 — À vous de jouer", "title": "Écrire une méthode avec retour",
     "prompt": "Écrivez une méthode calculerRemise(double prix, double pourcentage) qui renvoie le montant de la remise (prix * pourcentage / 100). Appelez-la et affichez le résultat pour un prix de 500 et une remise de 10%.",
     "notes": "Résultat attendu : 50.0. Vérifier que les étudiants utilisent bien return et non un simple println à l'intérieur de la méthode."},

    {"type": "summary", "kicker": "Module 5", "title": "À retenir",
     "bullets": [
        "Un attribut d'instance appartient à CHAQUE objet séparément",
        "void = aucun retour ; un type de retour exige return",
        "Les paramètres sont l'entrée, la valeur de retour est la sortie",
     ]},
]

# ============================================================ MODULE 6 =====
M6 = [
    {"type": "section", "module_no": "MODULE 6", "title": "Constructeurs",
     "subtitle": "Initialiser un objet dès sa création, this, surcharge de constructeurs"},

    {"type": "bullets", "kicker": "Module 6", "title": "Le problème : un objet peut naître incomplet",
     "bullets": [
        "Livre livre = new Livre(); livre.titre = \"...\"; — et si on OUBLIE livre.disponible = true; ?",
        "Le programme continue de fonctionner SANS erreur visible, avec un objet incomplet",
        "Analogie : un meuble en kit livré sans obligation d'assemblage vs un vendeur qui exige les infos avant de livrer",
     ],
     "notes": "Faire le lien avec la NullPointerException du Module 4 : sans constructeur, rien n'empêche un attribut essentiel de rester à sa valeur par défaut, silencieusement."},

    {"type": "code", "kicker": "Module 6", "title": "Constructeur par défaut vs paramétré",
     "code": "public class Etudiant {\n    String nom;\n    int age;\n\n    Etudiant(String nom, int age) {\n        this.nom = nom;\n        this.age = age;\n    }\n}",
     "caption": "Etudiant e = new Etudiant(\"Jean\", 20); — les 2 informations deviennent OBLIGATOIRES",
     "notes": "Exemple exact du prompt du cours. Expliquer : sans aucun constructeur écrit, Java fournit gratuitement un constructeur vide. Dès qu'on écrit UN constructeur, ce constructeur par défaut disparaît."},

    {"type": "definitions_trio", "kicker": "Module 6", "title": "Comprendre this",
     "items": [
        ("this.nom", "L'ATTRIBUT de l'objet en cours de construction (à gauche du =)."),
        ("nom", "Le PARAMÈTRE reçu par le constructeur (à droite du =)."),
        ("this", "Désigne l'objet en cours de construction ou de manipulation."),
     ],
     "notes": "Piège n°1 du chapitre : oublier this. dans « nom = nom; » n'assigne rien à l'attribut — Java comprend les deux « nom » comme le MÊME paramètre local. Bug silencieux, sans erreur de compilation."},

    {"type": "code", "kicker": "Module 6", "title": "Plusieurs constructeurs (surcharge)",
     "code": "Etudiant(String nom, int age, double moyenne) {\n    this.nom = nom; this.age = age; this.moyenne = moyenne;\n}\n\nEtudiant(String nom, int age) {\n    this(nom, age, 0.0); // délègue, doit être la 1re ligne\n}",
     "notes": "this(...) évite de recopier les mêmes affectations dans les deux constructeurs. Règle stricte : this(...) doit être la toute première ligne du constructeur."},

    {"type": "errors", "kicker": "Module 6", "title": "Erreurs fréquentes",
     "items": [
        "Dès qu'un constructeur est écrit, le constructeur par défaut disparaît",
        "Oublier this. → nom = nom; n'assigne rien à l'attribut (bug silencieux)",
        "this(...) qui n'est pas la première ligne du constructeur",
     ]},

    {"type": "exercise", "kicker": "Module 6 — À vous de jouer", "title": "Constructeur avec validation",
     "prompt": "Écrivez une classe CompteBancaire(String titulaire, double soldeInitial) dont le constructeur refuse (avec throw new IllegalArgumentException) un solde initial négatif.",
     "notes": "Annonce directement le Module 7 (encapsulation) : le constructeur est le premier endroit où valider une donnée, garantissant qu'aucun objet invalide ne peut exister."},

    {"type": "summary", "kicker": "Module 6", "title": "À retenir",
     "bullets": [
        "Un constructeur porte le nom de la classe, sans type de retour, exécuté à chaque new",
        "this.attribut distingue l'attribut du paramètre de même nom",
        "Plusieurs constructeurs (surcharge) ; this(...) en 1re ligne évite la duplication",
     ]},
]

# ============================================================ MODULE 7 =====
M7 = [
    {"type": "section", "module_no": "MODULE 7", "title": "Encapsulation",
     "subtitle": "Premier pilier de la POO — protéger les données d'un objet"},

    {"type": "code", "kicker": "Module 7", "title": "Le problème des attributs publics",
     "code": "public class CompteBancaire {\n    double solde; // accessible par N'IMPORTE QUEL code, sans contrôle\n}\n\ncompte.solde = -50000; // rien ne l'empêche !",
     "notes": "Analogie du manuel : on ne laisse pas n'importe qui entrer dans sa maison sans contrôle. Une porte verrouillée = private ; c'est le propriétaire (l'objet) qui décide qui entre, et à quelles conditions."},

    {"type": "code", "kicker": "Module 7", "title": "private : la solution",
     "code": "public class CompteBancaire {\n    private double solde;\n\n    public void deposer(double montant) {\n        if (montant > 0) {\n            solde += montant;\n        }\n    }\n\n    public double getSolde() {\n        return solde;\n    }\n}",
     "caption": "Exemple exact de la consigne du cours.",
     "notes": "private rend l'attribut inaccessible depuis l'extérieur de la classe. La SEULE voie autorisée pour le modifier passe par une méthode publique contrôlée — ici deposer(), qui valide le montant avant d'agir."},

    {"type": "definitions_trio", "kicker": "Module 7", "title": "Getter, setter, accesseurs",
     "items": [
        ("Getter", "Méthode publique qui LIT la valeur d'un attribut privé, sans la modifier."),
        ("Setter", "Méthode publique qui MODIFIE un attribut privé, idéalement avec validation."),
        ("private/public", "private = accessible seulement dans la classe ; public = accessible partout."),
     ],
     "notes": "Convention Java : get+Nom pour un getter, set+Nom pour un setter, is+Nom pour un booléen (isActif() plutôt que getActif())."},

    {"type": "bullets", "kicker": "Module 7", "title": "Pourquoi cette approche est meilleure",
     "bullets": [
        "Un setter qui valide GARANTIT qu'aucun objet incohérent ne peut jamais exister",
        "Le constructeur doit réutiliser les setters, jamais les contourner en assignant l'attribut directement",
        "Un attribut sans setter (souvent final) devient immuable après création (ex : un identifiant)",
     ],
     "notes": "Piège majeur du chapitre : un constructeur qui écrit this.prix = prix directement, en contournant setPrix(), crée un objet potentiellement invalide MALGRÉ l'existence d'un setter qui valide correctement."},

    {"type": "errors", "kicker": "Module 7", "title": "Erreurs fréquentes",
     "items": [
        "Un setter qui ne valide rien n'apporte presque aucun bénéfice par rapport à un attribut public",
        "Le constructeur contourne le setter en assignant directement l'attribut : aucune validation appliquée",
     ]},

    {"type": "exercise", "kicker": "Module 7 — À vous de jouer", "title": "Encapsuler une classe existante",
     "prompt": "Cette classe n'est pas encapsulée : public class Produit { public String nom; public double prix; }. Rendez ses attributs privés, ajoutez des getters, et un setter setPrix() qui refuse tout prix négatif.",
     "notes": "Vérifier que le constructeur appelle bien setPrix(prix) plutôt que this.prix = prix directement — c'est l'erreur n°2 du chapitre, très fréquente."},

    {"type": "summary", "kicker": "Module 7", "title": "À retenir",
     "bullets": [
        "Encapsulation = attributs private + méthodes publiques contrôlées",
        "Un setter n'a de valeur que s'il valide réellement les données",
        "Le constructeur doit réutiliser les setters, jamais les contourner",
     ]},
]

# ============================================================ MODULE 8 =====
M8 = [
    {"type": "section", "module_no": "MODULE 8", "title": "Modificateurs d'accès",
     "subtitle": "private, default, protected, public — qui peut voir quoi"},

    {"type": "table", "kicker": "Module 8", "title": "Les 4 niveaux de visibilité",
     "headers": ["Modificateur", "Classe", "Package", "Sous-classe", "Partout"],
     "rows": [
        ["private", "✓", "", "", ""],
        ["default (aucun mot-clé)", "✓", "✓", "", ""],
        ["protected", "✓", "✓", "✓", ""],
        ["public", "✓", "✓", "✓", "✓"],
     ],
     "notes": "Tableau exact demandé par la consigne du cours. private = le plus restrictif (Module 7, encapsulation) ; public = accessible depuis n'importe où. protected est surtout utile en héritage (Module 10) : la classe fille y accède même dans un autre package."},

    {"type": "code_bullets", "kicker": "Module 8", "title": "Choisir le bon modificateur",
     "code": "public class Employe {\n    private double salaire;      // jamais depuis l'extérieur\n    protected String matricule;  // visible des sous-classes\n    public String nom;           // accessible partout (à éviter si possible)\n}",
     "bullets": [
        "Règle générale : commencer le plus restrictif possible (private), n'élargir que si nécessaire",
        "Un attribut public perd tout le bénéfice de l'encapsulation (Module 7)",
     ],
     "notes": "Insister : la visibilité par défaut (« default », sans mot-clé) est réservée au même package — une notion approfondie au Module 18 (packages)."},

    {"type": "exercise", "kicker": "Module 8 — À vous de jouer", "title": "Choisir la visibilité",
     "prompt": "Pour une classe CompteBancaire : quel modificateur donneriez-vous à solde, à un futur attribut partagé par toute une hiérarchie de comptes, et à une méthode consulterSolde() destinée à tous les appelants ?",
     "notes": "Réponses attendues : solde → private (Module 7) ; attribut partagé par la hiérarchie → protected (anticipe le Module 10) ; consulterSolde() → public."},

    {"type": "summary", "kicker": "Module 8", "title": "À retenir",
     "bullets": [
        "private ⊂ default ⊂ protected ⊂ public, du plus au moins restrictif",
        "Toujours partir du plus restrictif, élargir seulement si un vrai besoin l'exige",
     ]},
]

# ============================================================ MODULE 9 =====
M9 = [
    {"type": "section", "module_no": "MODULE 9", "title": "Static",
     "subtitle": "Membre de classe vs membre d'instance — complément pédagogique"},

    {"type": "bullets", "kicker": "Module 9 — complément pédagogique", "title": "Le problème : une info partagée par TOUS les objets",
     "bullets": [
        "Chaque objet Livre ne connaît que SON PROPRE état (disponible)",
        "Aucun livre, à lui seul, ne peut compter le nombre total d'emprunts sur TOUTE la bibliothèque",
        "Il faut une donnée qui n'appartient à AUCUN objet précis, mais à la classe elle-même",
     ],
     "notes": "COMPLÉMENT pédagogique : ce module reprend l'ouverture laissée par le manuel de référence à la fin de son chapitre 9 (exercice « défi » sur le comptage global d'emprunts), qui annonce explicitement static sans encore l'enseigner formellement. Ce module comble ce point, avec l'exemple donné par la consigne du cours (classe Compteur)."},

    {"type": "code", "kicker": "Module 9", "title": "Attribut static : exemple du prompt",
     "code": "public class Compteur {\n    static int nombreObjets = 0;\n\n    Compteur() {\n        nombreObjets++;\n    }\n}",
     "caption": "nombreObjets est PARTAGÉ par tous les objets Compteur — un seul exemplaire, jamais dupliqué.",
     "notes": "Créer 3 objets Compteur au tableau : Compteur.nombreObjets vaut 3, quel que soit l'objet interrogé — il n'existe qu'UN SEUL nombreObjets, pas un par objet."},

    {"type": "table", "kicker": "Module 9", "title": "Membre d'instance vs membre de classe",
     "headers": ["", "Membre d'instance", "Membre static (de classe)"],
     "rows": [
        ["Combien d'exemplaires ?", "Un par objet créé", "Un seul, partagé par tous"],
        ["Accès", "objet.attribut", "NomClasse.attribut"],
        ["Exemple", "solde d'UN compte précis", "taux d'intérêt commun à tous les comptes"],
     ],
     "notes": "Rappeler que main() lui-même est static (vu dès le Module 1) : c'est pourquoi il peut être appelé sans jamais créer d'objet Main au préalable. Une méthode static ne peut accéder directement qu'à des membres static — jamais à un attribut d'instance sans objet précis."},

    {"type": "exercise", "kicker": "Module 9 — À vous de jouer", "title": "Compter les objets créés",
     "prompt": "Ajoutez à une classe Etudiant un attribut static int totalEtudiants, incrémenté dans le constructeur, et une méthode static afficherTotal().",
     "notes": "Vérifier l'accès : Etudiant.totalEtudiants ou Etudiant.afficherTotal(), jamais via un objet précis (même si Java l'autorise techniquement, ce n'est pas la convention)."},

    {"type": "summary", "kicker": "Module 9", "title": "À retenir",
     "bullets": [
        "static = appartient à la CLASSE elle-même, un seul exemplaire partagé",
        "Sans static = appartient à CHAQUE objet, une copie par instance",
        "main() est static : c'est pourquoi il s'exécute sans créer d'objet au préalable",
     ]},
]

ALL = FRONT + M1 + M2 + M3 + M4 + M5 + M6 + M7 + M8 + M9
