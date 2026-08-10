# -*- coding: utf-8 -*-
"""Contenu : Modules 10 a 20 (heritage -> collections)."""

# ============================================================ MODULE 10 ====
M10 = [
    {"type": "section", "module_no": "MODULE 10", "title": "Héritage",
     "subtitle": "Deuxième pilier de la POO — réutiliser et étendre le comportement d'une classe"},

    {"type": "bullets", "kicker": "Module 10", "title": "Le problème : dupliquer Chien et Chat",
     "bullets": [
        "Chien et Chat ont tous les deux un nom, un âge, et savent manger, dormir",
        "Sans réutilisation, il faut recopier ces éléments dans CHAQUE classe animale",
        "Un bug dans manger() devrait alors être corrigé partout, séparément, au risque d'en oublier un",
     ],
     "notes": "Poser la question : « Quelle est la différence entre une classe et un objet ? » avant d'enchaîner (rappel Module 3), puis transition naturelle vers l'héritage comme second pilier de la POO."},

    {"type": "diagram_tree", "kicker": "Module 10 — exemple du prompt", "title": "Une hiérarchie d'animaux",
     "root": "Animal", "children": ["Chien", "Chat"],
     "notes": "Schéma exact demandé par la consigne. Le test « EST UN » valide qu'un héritage a du sens : un Chien EST UN Animal → héritage logique. Un Moteur N'EST PAS une Voiture (elle EN A un) → pas d'héritage, plutôt une composition (Module 15)."},

    {"type": "code", "kicker": "Module 10 — exemple du prompt", "title": "extends : la syntaxe",
     "code": "public class Animal {\n    public void manger() {\n        System.out.println(\"Je mange\");\n    }\n}\n\npublic class Chien extends Animal {\n    public void aboyer() {\n        System.out.println(\"Wouf !\");\n    }\n}",
     "caption": "Chien monChien = new Chien(); monChien.manger(); → hérité, jamais réécrit dans Chien.",
     "notes": "Chien obtient AUTOMATIQUEMENT tout ce qu'Animal définit, sans l'avoir réécrit, et y ajoute ses propres méthodes. Java n'autorise l'héritage que d'une SEULE classe mère directe (pas d'héritage multiple de classes)."},

    {"type": "code_bullets", "kicker": "Module 10", "title": "super : constructeur et méthode de la classe mère",
     "code": "class Chien extends Animal {\n    Chien(String nom) {\n        super(nom); // 1re ligne obligatoire\n    }\n\n    @Override\n    void manger() {\n        super.manger(); // version de la classe mère\n        System.out.println(\"+ des croquettes\");\n    }\n}",
     "bullets": [
        "super(...) appelle le constructeur de la classe mère — doit être la 1re ligne",
        "super.methode() appelle la version originale de la classe mère avant d'ajouter du comportement",
     ],
     "notes": "Si aucun super(...) explicite n'est écrit, Java tente d'appeler automatiquement le constructeur SANS paramètre de la classe mère. S'il n'existe pas (comme ici), erreur de compilation obligeant à écrire super(...) soi-même."},

    {"type": "errors", "kicker": "Module 10", "title": "Erreurs fréquentes",
     "items": [
        "Oublier @Override et faire une faute de frappe silencieuse (Java croit à une nouvelle méthode)",
        "Hériter alors que le test « EST UN » n'a pas de sens (Voiture extends Moteur)",
        "super(...) qui n'est pas la première ligne du constructeur",
     ]},

    {"type": "exercise", "kicker": "Module 10 — À vous de jouer", "title": "Hériter et redéfinir",
     "prompt": "Créez une classe mère Employe (nom, salaireBase, calculerSalaire() renvoie salaireBase), puis une classe fille Commercial qui ajoute commission et redéfinit calculerSalaire() pour renvoyer salaireBase + commission, en réutilisant super.calculerSalaire().",
     "notes": "Vérifier l'usage de super.calculerSalaire() plutôt que de recopier salaireBase directement — c'est tout l'intérêt de la réutilisation par héritage."},

    {"type": "summary", "kicker": "Module 10", "title": "À retenir",
     "bullets": [
        "extends fait hériter automatiquement attributs et méthodes de la classe mère",
        "Le test « EST UN » valide qu'un héritage a un sens métier réel",
        "super(...) : constructeur de la classe mère ; super.methode() : sa version originale",
     ]},
]

# ============================================================ MODULE 11 ====
M11 = [
    {"type": "section", "module_no": "MODULE 11", "title": "Redéfinition des méthodes",
     "subtitle": "@Override — remplacer le comportement hérité"},

    {"type": "code", "kicker": "Module 11 — exemple du prompt", "title": "@Override",
     "code": "class Chien extends Animal {\n    @Override\n    public void manger() {\n        System.out.println(\"Le chien mange\");\n    }\n}",
     "notes": "@Override est une ANNOTATION : une indication donnée au compilateur, pas une instruction exécutée. Elle n'est pas obligatoire pour que le code fonctionne, mais c'est une excellente pratique de sécurité."},

    {"type": "bullets", "kicker": "Module 11", "title": "Pourquoi la redéfinition est utile",
     "bullets": [
        "Chaque classe fille peut adapter un comportement générique à sa propre réalité",
        "@Override protège contre une faute de frappe : sans elle, Java croirait qu'on ajoute une NOUVELLE méthode",
        "Sans @Override, la faute de frappe passe totalement inaperçue — aucune erreur de compilation",
     ],
     "notes": "Faire écrire au tableau une redéfinition avec une faute de frappe volontaire (mangerr au lieu de manger) sans @Override, puis avec @Override — montrer que seul le second cas produit une erreur de compilation claire."},

    {"type": "errors", "kicker": "Module 11", "title": "Erreur fréquente",
     "items": ["Oublier @Override → une faute de frappe crée silencieusement une méthode indépendante, sans lien avec la classe mère"],
     "notes": "Rappel : ceci prépare directement le polymorphisme (Module 12), où la redéfinition devient le mécanisme central."},

    {"type": "exercise", "kicker": "Module 11 — À vous de jouer", "title": "Redéfinir avec @Override",
     "prompt": "Pour une classe Forme avec dessiner() (« Forme générique »), créez une classe fille Cercle qui redéfinit dessiner() pour afficher « Cercle ». Toujours avec @Override.",
     "notes": "Vérifier systématiquement la présence de @Override — en faire une habitude dès ce module."},

    {"type": "summary", "kicker": "Module 11", "title": "À retenir",
     "bullets": ["@Override signale explicitement une redéfinition et protège contre les fautes de frappe silencieuses"]},
]

# ============================================================ MODULE 12 ====
M12 = [
    {"type": "section", "module_no": "MODULE 12", "title": "Polymorphisme",
     "subtitle": "Un même appel, des comportements différents selon le type réel de l'objet"},

    {"type": "code", "kicker": "Module 12 — exemple du prompt", "title": "Type déclaré vs type réel",
     "code": "Animal animal = new Chien();\nanimal.manger(); // exécute la version de Chien, pas d'Animal !",
     "notes": "Poser la question dès maintenant : « À votre avis, quelle version de manger() va s'exécuter ? » Laisser les étudiants répondre avant de révéler la réponse (liaison dynamique)."},

    {"type": "definitions_trio", "kicker": "Module 12", "title": "Type de référence vs type réel de l'objet",
     "items": [
        ("Type déclaré (référence)", "Animal — seulement une « étiquette » pour la variable, PAS le type réel de l'objet."),
        ("Type réel de l'objet", "Chien — décidé par new, c'est LUI qui détermine quelle méthode s'exécute."),
        ("Liaison dynamique", "Le mécanisme automatique par lequel Java choisit, à l'exécution, la bonne version d'une méthode redéfinie."),
     ],
     "notes": "C'est le cœur du chapitre : la variable a un type déclaré (Animal), mais Java exécute TOUJOURS la méthode de la classe RÉELLE de l'objet (Chien), jamais celle du type déclaré."},

    {"type": "code", "kicker": "Module 12", "title": "La vraie puissance : un tableau polymorphe",
     "code": "Animal[] animaux = { new Chien(), new Chat(), new Chien() };\n\nfor (Animal a : animaux) {\n    a.parler(); // un SEUL appel, un comportement DIFFÉRENT à chaque tour\n}",
     "caption": "Résultat : Ouaf ! / Miaou ! / Ouaf !",
     "notes": "Le vrai bénéfice : ajouter une classe Vache extends Animal demain ne demande AUCUNE modification de cette boucle. Sans polymorphisme, il faudrait un if (animal instanceof Chien) { ... } else if (... Chat) { ... } — fragile et à modifier à chaque nouveau type."},

    {"type": "errors", "kicker": "Module 12", "title": "Erreurs fréquentes",
     "items": [
        "Croire que le TYPE DÉCLARÉ décide quelle méthode s'exécute (c'est toujours le type RÉEL)",
        "Vouloir appeler animal.aboyer() sur une variable déclarée Animal : erreur de compilation, même si l'objet réel est un Chien",
     ],
     "notes": "Pour appeler aboyer(), il faudrait un transtypage explicite ((Chien) animal).aboyer() — technique avancée, à mentionner mais pas approfondir."},

    {"type": "exercise", "kicker": "Module 12 — À vous de jouer", "title": "Polymorphisme sur un tableau d'employés",
     "prompt": "Créez Employe.calculerPrime() (0.0 par défaut), puis Vendeur (prime = 10% du chiffre d'affaires) et Manager (prime fixe 500). Dans un tableau Employe[], affichez la prime de chacun avec UNE SEULE boucle.",
     "notes": "Résultat attendu : chaque employé affiche sa propre prime, sans aucun if/instanceof dans la boucle — exactement l'intérêt démontré."},

    {"type": "summary", "kicker": "Module 12", "title": "À retenir",
     "bullets": [
        "C'est toujours le type RÉEL de l'objet, jamais le type déclaré, qui décide quelle méthode s'exécute",
        "Le polymorphisme permet du code qui n'a pas besoin de changer quand on ajoute un nouveau type",
     ]},

    {"type": "quiz", "kicker": "Modules 10-12", "title": "Quiz — Héritage, redéfinition, polymorphisme",
     "questions": [
        "Que fait super.methode() à l'intérieur d'une méthode redéfinie ?",
        "Pourquoi @Override est-il recommandé même s'il n'est pas obligatoire ?",
        "Dans Animal a = new Chien();, quel type décide quelle version de parler() s'exécute ?",
        "Combien de classes mères directes une classe Java peut-elle avoir ?",
        "Pourquoi le polymorphisme réduit-il la maintenance par rapport à une chaîne de instanceof ?",
     ],
     "notes": "Réponses : (1) Appelle la version de la méthode définie dans la classe mère. (2) Il protège contre une faute de frappe qui créerait silencieusement une méthode indépendante. (3) Le type RÉEL de l'objet (Chien), jamais le type déclaré. (4) Une seule (pas d'héritage multiple de classes en Java). (5) Ajouter un type ne demande qu'une nouvelle classe avec sa méthode redéfinie — tout le code existant continue de fonctionner sans modification."},
]

# ============================================================ MODULE 13 ====
M13 = [
    {"type": "section", "module_no": "MODULE 13", "title": "Classes abstraites",
     "subtitle": "Définir ce qu'une classe doit faire, sans imposer comment"},

    {"type": "code", "kicker": "Module 13 — exemple du prompt", "title": "abstract class et méthode abstraite",
     "code": "public abstract class Animal {\n    public abstract void faireSon();\n\n    public void dormir() {\n        System.out.println(\"Je dors\");\n    }\n}",
     "notes": "abstract devant une méthode = pas de corps, juste une signature : un contrat que CHAQUE classe fille concrète doit obligatoirement respecter, sous peine d'erreur de compilation."},

    {"type": "bullets", "kicker": "Module 13", "title": "Ce qui change par rapport à l'héritage simple",
     "bullets": [
        "abstract class Animal {} → new Animal(...) est TOUJOURS une erreur de compilation",
        "Une méthode abstraite n'a pas de corps : { ... } et abstract sont mutuellement exclusifs",
        "Toute classe fille CONCRÈTE doit implémenter chaque méthode abstraite héritée, sans exception",
        "Une classe abstraite peut mélanger méthodes abstraites ET méthodes normales déjà implémentées",
     ],
     "notes": "Différence clé avec le Module 11 : une méthode normale redéfinissable est OPTIONNELLE à redéfinir ; une méthode abstraite est OBLIGATOIRE à implémenter, vérifié dès la compilation."},

    {"type": "errors", "kicker": "Module 13", "title": "Erreurs fréquentes",
     "items": [
        "Essayer d'instancier une classe abstraite directement (new Animal(...))",
        "Donner un corps à une méthode abstraite",
        "Oublier d'implémenter une méthode abstraite dans une classe fille concrète",
     ]},

    {"type": "exercise", "kicker": "Module 13 — À vous de jouer", "title": "Classe abstraite Forme",
     "prompt": "Créez une classe abstraite Forme avec calculerAire() (abstraite) et afficherType() (normale, message fixe). Créez deux classes filles concrètes Cercle et Carre qui implémentent calculerAire().",
     "notes": "Vérifier que new Forme() est bien refusé par le compilateur si un étudiant essaie."},

    {"type": "summary", "kicker": "Module 13", "title": "À retenir",
     "bullets": [
        "Une classe abstraite ne peut JAMAIS être instanciée directement",
        "Une méthode abstraite FORCE son implémentation par chaque classe fille concrète",
     ]},
]

# ============================================================ MODULE 14 ====
M14 = [
    {"type": "section", "module_no": "MODULE 14", "title": "Interfaces",
     "subtitle": "Un contrat que plusieurs classes, même sans lien de parenté, peuvent respecter"},

    {"type": "bullets", "kicker": "Module 14", "title": "Une interface, c'est un contrat",
     "bullets": [
        "Une classe abstraite impose un contrat, mais seulement à SES propres classes filles",
        "Une classe Java ne peut hériter que d'UNE SEULE classe mère (Module 10)",
        "Un Oiseau et un Avion peuvent tous deux « voler », sans qu'aucun ne soit une sorte de l'autre",
     ],
     "notes": "Analogie du manuel : un contrat d'embauche générique (« livrer un rapport chaque vendredi ») ne précise pas COMMENT chacun doit le rédiger — un comptable et un designer respecteront ce même engagement, chacun à sa manière."},

    {"type": "code", "kicker": "Module 14 — exemple du prompt", "title": "interface / implements",
     "code": "public interface Volant {\n    void voler();\n}\n\npublic class Avion implements Volant {\n    @Override\n    public void voler() {\n        System.out.println(\"L'avion vole\");\n    }\n}",
     "notes": "implements déclare qu'une classe respecte un contrat, sans lien d'héritage. Les méthodes d'une interface sont implicitement public — la classe qui implémente doit respecter cette même visibilité, jamais plus restrictive."},

    {"type": "compare", "kicker": "Module 14", "title": "Classe abstraite vs Interface",
     "left_title": "Classe abstraite", "left_items": ["Une seule par classe (extends)", "Peut avoir des attributs avec état", "Méthodes déjà implémentées possibles", "Classes PROCHES, base commune réelle"],
     "right_title": "Interface", "right_items": ["Plusieurs par classe (implements)", "Pas d'état, seulement des constantes", "Rarement des méthodes implémentées", "Capacité partagée, classes différentes"],
     "notes": "Tableau du manuel. Exemple d'ancrage : Animal → Chien/Chat = classe abstraite (base réelle commune) ; Volant → Oiseau/Avion = interface (capacité partagée, aucun lien de parenté)."},

    {"type": "errors", "kicker": "Module 14", "title": "Erreurs fréquentes",
     "items": [
        "Oublier public devant une méthode d'interface implémentée",
        "Instancier directement une interface (new Volant())",
     ]},

    {"type": "exercise", "kicker": "Module 14 — À vous de jouer", "title": "Une classe, plusieurs interfaces",
     "prompt": "Créez les interfaces Volant (voler()) et Nageur (nager()). Créez une classe Canard qui implémente LES DEUX.",
     "notes": "Souligner : une classe peut implémenter autant d'interfaces qu'elle le souhaite, séparées par des virgules — impossible avec l'héritage de classes."},

    {"type": "summary", "kicker": "Module 14", "title": "À retenir",
     "bullets": [
        "Une interface est un contrat, sans lien d'héritage entre les classes qui le respectent",
        "Une classe peut implémenter PLUSIEURS interfaces, mais hériter d'une SEULE classe",
        "Classe abstraite = base commune réelle ; Interface = capacité partagée",
     ]},

    {"type": "question", "title": "QUESTION", "text": "Quelle est la différence entre une classe et un objet ?",
     "notes": "Réponse (Module 3) : une classe est un plan ; un objet est une instance concrète créée à partir de ce plan avec new."},
    {"type": "answer", "title": "RÉPONSE",
     "bullets": ["Classe = le plan, le moule", "Objet = une instance concrète, construite avec new", "Une classe seule ne représente jamais un objet précis"]},

    {"type": "quiz", "kicker": "Modules 13-14", "title": "Quiz — Abstraction et interfaces",
     "questions": [
        "Une classe abstraite avec 2 méthodes abstraites est héritée par une fille qui n'en implémente qu'une. Résultat ?",
        "Combien d'interfaces une classe Java peut-elle implémenter à la fois ?",
        "Quelle visibilité une méthode d'interface implémentée doit-elle toujours avoir ?",
        "Dans quel cas préférer une interface à une classe abstraite ?",
     ],
     "notes": "Réponses : (1) Erreur de compilation. (2) Autant que nécessaire. (3) public. (4) Quand des classes potentiellement très différentes partagent une capacité, sans base commune réelle."},
]

# ============================================================ MODULE 15 ====
M15 = [
    {"type": "section", "module_no": "MODULE 15", "title": "Composition et agrégation",
     "subtitle": "Association, agrégation, composition — faire collaborer des objets"},

    {"type": "bullets", "kicker": "Module 15", "title": "Trois nuances d'un même principe",
     "bullets": [
        "Une relation existe dès qu'une classe utilise une AUTRE classe comme type d'attribut",
        "ASSOCIATION : deux objets se connaissent, mais existent chacun indépendamment",
        "AGRÉGATION : un objet contient logiquement d'autres objets, qui pourraient lui survivre",
        "COMPOSITION : un objet crée et contient d'autres objets qui n'ont AUCUN sens sans lui",
     ],
     "notes": "L'indice le plus fiable pour distinguer agrégation et composition : QUI crée l'objet contenu, et OÙ ? Si le conteneur le crée lui-même avec new dans son propre constructeur → composition."},

    {"type": "diagram_flow", "kicker": "Module 15 — exemples du prompt", "title": "Université — Étudiants (agrégation)",
     "boxes": ["Université", "Étudiants (existent indépendamment)"],
     "notes": "Une école n'existe pas sans étudiants qui la fréquentent, mais un étudiant qui change d'école continue d'exister ailleurs — c'est une agrégation, pas une composition."},

    {"type": "diagram_flow", "kicker": "Module 15 — exemples du prompt", "title": "Maison — Pièces (composition)",
     "boxes": ["Maison", "Pièces (n'existent que pour elle)"],
     "notes": "Une ligne de commande (ou une pièce d'une maison) n'a aucun sens en dehors de son conteneur : si le conteneur est détruit, elle disparaît avec lui."},

    {"type": "code", "kicker": "Module 15", "title": "Composition en code : Commande / LigneCommande",
     "code": "class Commande {\n    private LigneCommande[] lignes;\n\n    Commande(String[] produits, int[] quantites) {\n        this.lignes = new LigneCommande[produits.length];\n        for (int i = 0; i < produits.length; i++) {\n            // La Commande CRÉE elle-même ses lignes\n            this.lignes[i] = new LigneCommande(produits[i], quantites[i]);\n        }\n    }\n}",
     "notes": "Les LigneCommande sont créées À L'INTÉRIEUR du constructeur de Commande : elles n'ont aucune existence possible en dehors d'elle — signature d'une vraie composition."},

    {"type": "errors", "kicker": "Module 15", "title": "Erreur fréquente",
     "items": ["Confondre agrégation et composition — un impact réel sur l'évolution du code (peut-on faire changer un étudiant d'école sans le détruire ?)"]},

    {"type": "exercise", "kicker": "Module 15 — À vous de jouer", "title": "Association, agrégation ou composition ?",
     "prompt": "Classez ces relations : (a) Voiture et Roue (créées par la voiture) ; (b) Médecin et Patient (indépendants) ; (c) Équipe et Joueur (les joueurs peuvent changer d'équipe).",
     "notes": "Réponses : (a) Composition — les roues n'ont aucun sens hors de la voiture qui les a créées. (b) Association — indépendants l'un de l'autre. (c) Agrégation — contenus, mais peuvent survivre à un transfert."},

    {"type": "summary", "kicker": "Module 15", "title": "À retenir",
     "bullets": [
        "Association = indépendants ; Agrégation = contient, mais survit ; Composition = contient, ne survit pas",
        "L'indice fiable : qui crée l'objet contenu, et où (new dans le constructeur du conteneur = composition)",
     ]},
]

# ============================================================ MODULE 16 ====
M16 = [
    {"type": "section", "module_no": "MODULE 16", "title": "Relations entre classes",
     "subtitle": "Association, héritage, dépendance, agrégation, composition — vue UML"},

    {"type": "table", "kicker": "Module 16", "title": "Panorama des relations UML",
     "headers": ["Relation", "Symbole UML", "Sens"],
     "rows": [
        ["Association", "Ligne simple", "Deux objets se connaissent, indépendants"],
        ["Héritage", "Flèche triangle plein", "extends — « EST UN »"],
        ["Réalisation", "Flèche triangle pointillé", "implements — respecte un contrat"],
        ["Agrégation", "Losange VIDE ◇", "Contient, mais l'objet contenu survit"],
        ["Composition", "Losange PLEIN ◆", "Contient, l'objet contenu ne survit pas"],
        ["Dépendance", "Flèche pointillée", "Utilise temporairement, sans attribut permanent"],
     ],
     "notes": "Cette vue synthétise les Modules 10 (héritage), 14 (interfaces) et 15 (association/agrégation/composition) sous une seule notation graphique standardisée, approfondie au Module 25 (UML)."},

    {"type": "code_bullets", "kicker": "Module 16", "title": "Un système complet : Client / Commande / Produit / Paiement",
     "code": "class Commande {\n    private Client client;             // ASSOCIATION\n    private LigneCommande[] lignes;    // COMPOSITION\n    private boolean payee;\n}",
     "bullets": [
        "Chaque classe ne connaît que ses VOISINES DIRECTES, jamais tout le système",
        "Les classes collaborent via leurs méthodes PUBLIQUES, jamais en fouillant un attribut interne lointain",
        "Une action métier (« payer ») peut nécessiter de mettre à jour PLUSIEURS objets à la fois",
     ],
     "notes": "Exemple du manuel (chapitre 17) : Paiement.executer() doit à la fois marquer la commande payée ET réduire la dette du client — oublier l'un des deux crée un état incohérent, une erreur métier très réaliste."},

    {"type": "errors", "kicker": "Module 16", "title": "Erreur fréquente",
     "items": ["Une classe qui modifie DIRECTEMENT un attribut interne d'une autre classe, en traversant plusieurs objets (viole l'encapsulation, casse le code au moindre changement interne)"]},

    {"type": "summary", "kicker": "Module 16", "title": "À retenir",
     "bullets": ["Chaque relation UML a un sens précis et une notation propre", "Les classes collaborent par leurs méthodes publiques, jamais en accédant directement aux attributs internes d'une autre"]},
]

# ============================================================ MODULE 17 ====
M17 = [
    {"type": "section", "module_no": "MODULE 17", "title": "Surcharge",
     "subtitle": "Overloading — plusieurs méthodes, même nom, paramètres différents"},

    {"type": "code", "kicker": "Module 17 — exemple du prompt", "title": "Surcharge : même nom, signatures différentes",
     "code": "public void afficher() {}\npublic void afficher(String nom) {}\npublic void afficher(String nom, int age) {}",
     "notes": "Java choisit automatiquement la bonne version selon le NOMBRE et le TYPE des arguments fournis à l'appel — déjà vu avec les constructeurs surchargés au Module 6."},

    {"type": "compare", "kicker": "Module 17", "title": "Surcharge vs Redéfinition",
     "left_title": "Surcharge (overloading)", "left_items": ["Même classe", "Paramètres DIFFÉRENTS", "Choisie à la COMPILATION", "Ex : plusieurs constructeurs (Module 6)"],
     "right_title": "Redéfinition (overriding)", "right_items": ["Classe fille vs classe mère", "MÊME signature exactement", "Choisie à l'EXÉCUTION (Module 12)", "Ex : @Override (Module 11)"],
     "notes": "Confusion très fréquente chez les débutants entre ces deux mots qui se ressemblent en français. Insister sur le moment où le choix est fait : compilation (surcharge) vs exécution (redéfinition, liaison dynamique)."},

    {"type": "exercise", "kicker": "Module 17 — À vous de jouer", "title": "Écrire des méthodes surchargées",
     "prompt": "Écrivez trois versions surchargées d'une méthode calculerPrix() : sans paramètre (renvoie 0), avec un double prix, avec un double prix et un double remise.",
     "notes": "Vérifier que les étudiants comprennent bien que ce sont TROIS méthodes distinctes, coexistant dans la même classe, pas une seule méthode avec des paramètres optionnels (qui n'existe pas nativement en Java)."},

    {"type": "summary", "kicker": "Module 17", "title": "À retenir",
     "bullets": ["Surcharge = même nom, paramètres différents, même classe, choisie à la compilation", "Redéfinition = même signature, classe fille, choisie à l'exécution"]},
]

# ============================================================ MODULE 18 ====
M18 = [
    {"type": "section", "module_no": "MODULE 18", "title": "Packages",
     "subtitle": "Organiser un projet en dossiers clairs selon le rôle de chaque classe"},

    {"type": "diagram_flow", "kicker": "Module 18 — exemple du prompt", "title": "Structure de projet standard",
     "boxes": ["src/model/  → les classes « données »", "src/service/ → la logique métier", "src/repository/ → l'accès aux données", "src/main/ → le point d'entrée"],
     "notes": "Analogie du manuel : une maison bien organisée — la cuisine contient les ustensiles, la chambre les vêtements. Chercher une casserole dans le garage n'aurait aucun sens."},

    {"type": "code", "kicker": "Module 18", "title": "package et import",
     "code": "// Fichier : src/model/Etudiant.java\npackage model;\n\npublic class Etudiant { /* ... */ }\n\n// Fichier : src/dao/EtudiantDAO.java\npackage dao;\nimport model.Etudiant; // importer une classe d'un AUTRE package",
     "notes": "Chaque dossier correspond à un package, déclaré en première ligne du fichier. Convention de nommage : tout en minuscules, souvent inspiré du domaine (model, service, dao, exception, ui)."},

    {"type": "exercise", "kicker": "Module 18 — À vous de jouer", "title": "Organiser un mini-projet",
     "prompt": "Pour une application de gestion de bibliothèque, proposez une arborescence de packages (au moins 4), et indiquez dans lequel irait chacune de ces classes : Livre, LivreDAO, ServicePret, ExceptionLivreIndisponible.",
     "notes": "Réponse attendue : model/Livre, dao/LivreDAO, service/ServicePret, exception/ExceptionLivreIndisponible."},

    {"type": "summary", "kicker": "Module 18", "title": "À retenir",
     "bullets": ["Un package Java = un dossier, organisé selon le RÔLE des classes qu'il contient", "package en 1re ligne du fichier ; import pour utiliser une classe d'un autre package"]},
]

# ============================================================ MODULE 19 ====
M19 = [
    {"type": "section", "module_no": "MODULE 19", "title": "Exceptions",
     "subtitle": "try, catch, finally, throw, throws — gérer les erreurs proprement"},

    {"type": "code", "kicker": "Module 19 — exemple du prompt", "title": "try / catch",
     "code": "try {\n    int resultat = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println(\"Erreur\");\n}",
     "notes": "Sans gestion, cette erreur arrêterait brutalement le programme. Avec try/catch, Java saute immédiatement au catch correspondant, puis le programme CONTINUE normalement après le bloc entier."},

    {"type": "code_bullets", "kicker": "Module 19", "title": "Plusieurs catch, et finally",
     "code": "try {\n    ...\n} catch (ArithmeticException e) {\n    ...\n} catch (ArrayIndexOutOfBoundsException e) {\n    ...\n} finally {\n    System.out.println(\"Toujours exécuté\");\n}",
     "bullets": [
        "finally s'exécute TOUJOURS, erreur ou pas — idéal pour libérer une ressource",
        "throw lève volontairement une exception ; throws l'annonce dans la signature de la méthode",
     ],
     "notes": "finally est l'endroit privilégié pour fermer un fichier ou une connexion, même en cas d'erreur. Bien distinguer throw (verbe, déclenche) de throws (dans la signature, annonce sans attraper)."},

    {"type": "code", "kicker": "Module 19", "title": "Créer une exception personnalisée",
     "code": "class SoldeInsuffisantException extends Exception {\n    public SoldeInsuffisantException(String message) {\n        super(message);\n    }\n}",
     "notes": "Une exception personnalisée hérite d'Exception (ou RuntimeException) et représente une erreur avec un sens métier précis, bien plus lisible qu'une exception générique. super(message) est indispensable pour que getMessage() fonctionne."},

    {"type": "errors", "kicker": "Module 19", "title": "Erreurs fréquentes",
     "items": [
        "Attraper Exception de façon trop large, masquant des bugs imprévus",
        "Un catch vide qui « avale » silencieusement l'erreur",
        "Oublier throws sur une méthode qui lève une exception vérifiée",
        "Oublier super(message) dans une exception personnalisée",
     ]},

    {"type": "exercise", "kicker": "Module 19 — À vous de jouer", "title": "Exception personnalisée bancaire",
     "prompt": "Créez SoldeInsuffisantException. Une méthode CompteBancaire.retirer(double montant) la lève si le montant dépasse le solde. Testez avec un try/catch.",
     "notes": "Vérifier throws SoldeInsuffisantException sur la signature de retirer(), et super(message) dans le constructeur de l'exception."},

    {"type": "summary", "kicker": "Module 19", "title": "À retenir",
     "bullets": [
        "try entoure le code risqué ; catch réagit à un type précis d'erreur ; finally s'exécute toujours",
        "throw déclenche ; throws annonce dans la signature",
        "Une exception personnalisée donne un sens métier clair à une erreur",
     ]},
]

# ============================================================ MODULE 20 ====
M20 = [
    {"type": "section", "module_no": "MODULE 20", "title": "Collections",
     "subtitle": "ArrayList, HashSet, HashMap — au-delà des tableaux à taille fixe"},

    {"type": "code", "kicker": "Module 20 — exemple du prompt", "title": "ArrayList : une liste qui grandit librement",
     "code": "List<String> noms = new ArrayList<>();\nnoms.add(\"Jean\");\nnoms.add(\"Marie\");",
     "caption": "Un tableau classique a une taille FIXE ; ArrayList grandit et rétrécit librement.",
     "notes": "Rappel Module 2 : String[] panier = new String[3]; ne peut jamais accueillir un 4e élément. ArrayList lève cette limite."},

    {"type": "table", "kicker": "Module 20", "title": "ArrayList, HashSet, HashMap — comparatif",
     "headers": ["Structure", "Doublons ?", "Ordre gardé ?", "Accès"],
     "rows": [
        ["ArrayList", "Oui", "Oui (ajout)", "Par indice : get(i)"],
        ["HashSet", "Non (ignorés)", "Non garanti", "contains() seulement"],
        ["HashMap", "Clés uniques", "Non garanti", "Par clé : get(cle)"],
     ],
     "notes": "HashSet.add() renvoie un boolean : true si réellement ajouté, false si déjà présent. HashMap utilise put()/get(), jamais add() — confusion très fréquente en changeant de structure."},

    {"type": "bullets", "kicker": "Module 20", "title": "Opérations essentielles",
     "bullets": [
        "Ajout : add() (ArrayList/HashSet) ou put(clé, valeur) (HashMap)",
        "Suppression : remove(élément) ou remove(indice)",
        "Recherche : contains() (ArrayList/HashSet) ou containsKey()/getOrDefault() (HashMap)",
        "Parcours : for-each sur ArrayList/HashSet ; for (clé : map.keySet()) sur HashMap",
     ],
     "notes": "getOrDefault(cle, valeurParDefaut) sur une HashMap évite le piège classique du null renvoyé par get() sur une clé absente, qui provoque une NullPointerException dès qu'on essaie de l'utiliser comme un nombre."},

    {"type": "errors", "kicker": "Module 20", "title": "Erreurs fréquentes",
     "items": [
        "Type primitif entre chevrons : ArrayList<int> au lieu de ArrayList<Integer>",
        "Modifier une liste PENDANT un parcours for-each (ConcurrentModificationException)",
        "Confondre put() (HashMap) et add() (ArrayList/HashSet)",
        "Oublier de vérifier une clé absente avant get() sur une HashMap",
     ]},

    {"type": "exercise", "kicker": "Module 20 — À vous de jouer", "title": "Compter les occurrences",
     "prompt": "Écrivez une méthode compterOccurrences(String[] mots) qui renvoie une HashMap<String, Integer> associant chaque mot à son nombre d'apparitions, en utilisant getOrDefault().",
     "notes": "Solution : compte.put(mot, compte.getOrDefault(mot, 0) + 1); dans une boucle sur le tableau."},

    {"type": "summary", "kicker": "Module 20", "title": "À retenir",
     "bullets": [
        "ArrayList : taille variable, ordre gardé, doublons permis",
        "HashSet : unicité garantie, aucun ordre garanti",
        "HashMap : accès direct par clé, remplace silencieusement une clé déjà existante",
     ]},

    {"type": "quiz", "kicker": "Modules 15-20", "title": "Quiz — Relations, surcharge, exceptions, collections",
     "questions": [
        "Quelle est la différence essentielle entre agrégation et composition ?",
        "Que se passe-t-il avec le reste du bloc try dès qu'une exception survient ?",
        "Pourquoi PreparedStatement n'est pas encore concerné ici, mais throw l'est : que fait throw ?",
        "Quelle méthode utilise-t-on pour lire une valeur dans une HashMap ?",
        "Pourquoi un HashSet ne peut-il jamais contenir de doublon ?",
     ],
     "notes": "Réponses : (1) L'agrégation contient des objets qui pourraient survivre au conteneur ; la composition contient des objets créés par lui, qui n'ont aucun sens sans lui. (2) Il est immédiatement abandonné, Java saute au catch. (3) throw déclenche volontairement une exception. (4) get(clé). (5) add() vérifie automatiquement la présence avant d'ajouter, et ignore les doublons."},
]

ALL = M10 + M11 + M12 + M13 + M14 + M15 + M16 + M17 + M18 + M19 + M20
