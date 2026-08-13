<div class="chapitre-titre-num">ANNEXE A</div>

# Dictionnaire Java — Glossaire

> Tous les termes techniques rencontrés dans ce manuel, dans l'ordre alphabétique, avec le chapitre où chacun est introduit en détail.

**Abstraction** — Définir ce qu'une classe doit faire sans imposer comment, via une classe abstraite et des méthodes abstraites. *Chapitre 14.*

**Affectation** — L'action de donner une valeur à une variable avec `=`. *Chapitre 2.*

**Agrégation** — Un objet contient logiquement d'autres objets, qui pourraient exister indépendamment de lui. *Chapitre 16.*

**Annotation** — Une indication donnée au compilateur, comme `@Override` ou `@Test`, sans être une instruction exécutée. *Chapitre 12.*

**Argument** — La valeur réelle envoyée lors de l'appel d'une méthode (à distinguer du paramètre). *Chapitre 7.*

**Assertion** — Une vérification explicite qu'une condition doit être vraie, dans un test (`assertEquals`, `assertTrue`...). *Chapitre 39.*

**Association** — Deux objets se connaissent et collaborent, mais existent chacun de façon indépendante. *Chapitre 16.*

**Attribut** — Une caractéristique (donnée) d'un objet, définie dans sa classe. *Chapitre 8.*

**Autoboxing** — Conversion automatique entre un type primitif et son équivalent objet (`int` ↔ `Integer`). *Chapitre 19.*

**Bibliothèque / dépendance** — Du code externe réutilisé dans un projet, géré par Maven. *Chapitre 41.*

**Boucle** — Une structure qui répète un bloc d'instructions (`for`, `while`, `do while`, `for-each`). *Chapitre 6.*

**Branche (Git)** — Une ligne de développement indépendante. *Chapitre 42.*

**Breakpoint** — Un marqueur qui suspend l'exécution d'un programme à une ligne précise, pour inspection. *Chapitre 40.*

**Bytecode** — Le langage intermédiaire produit par la compilation Java, exécuté par la JVM. *Chapitre 1.*

**Cast (transtypage)** — Conversion explicite d'un type vers un autre, comme `(double) a`. *Chapitre 4.*

**Classe** — Un plan/moule permettant de créer des objets. *Chapitre 8.*

**Classe abstraite** — Une classe qui ne peut jamais être instanciée directement, servant de base à des classes filles. *Chapitre 14.*

**Clé étrangère** — Une colonne qui référence la clé primaire d'une autre table, en base de données. *Chapitre 31.*

**Clé primaire** — Une colonne qui identifie une ligne de façon unique dans une table. *Chapitre 31.*

**Commit (Git)** — Un instantané enregistré, définitivement, dans l'historique d'un projet. *Chapitre 42.*

**Compilation** — L'étape où le code source est vérifié et traduit en bytecode. *Chapitre 1.*

**Composition** — Un objet crée et contient d'autres objets qui n'ont aucun sens en dehors de lui. *Chapitre 16.*

**Concaténation** — Coller du texte et une valeur avec l'opérateur `+`. *Chapitre 2.*

**Condition** — Une structure qui exécute un bloc selon qu'une expression booléenne est vraie (`if`, `else`, `switch`). *Chapitre 5.*

**Constructeur** — Une méthode spéciale, exécutée à chaque `new`, qui initialise un objet. *Chapitre 10.*

**DAO (Data Access Object)** — Une classe dédiée à l'accès aux données d'une table. *Chapitre 35.*

**Design pattern** — Une solution éprouvée et réutilisable à un problème de conception récurrent. *Chapitre 45.*

**DRY (Don't Repeat Yourself)** — Le principe selon lequel une même logique ne devrait vivre qu'à un seul endroit. *Chapitre 43.*

**DTO (Data Transfer Object)** — Une classe dédiée à transporter un sous-ensemble précis de données. *Chapitre 38.*

**Enum** — Un type représentant un ensemble fixe et connu de valeurs. *Chapitre 25.*

**Encapsulation** — Rendre les attributs privés et n'exposer que des méthodes publiques contrôlées. *Chapitre 11.*

**Exception** — Un signal envoyé par Java lorsqu'une erreur survient pendant l'exécution. *Chapitre 22.*

**Exception personnalisée** — Une exception créée pour représenter une erreur avec un sens métier précis. *Chapitre 23.*

**Exception vérifiée / non vérifiée** — Une exception vérifiée (`Exception`) exige `throws` ; une non vérifiée (`RuntimeException`) ne l'exige pas. *Chapitre 23.*

**Generics** — Le mécanisme (`<T>`) qui permet à une classe de fonctionner avec n'importe quel type, vérifié à la compilation. *Chapitre 26.*

**Getter / Setter** — Des méthodes publiques qui lisent/modifient un attribut privé. *Chapitre 11.*

**Git / GitHub** — Un outil de suivi d'historique de code, et un service en ligne pour l'héberger. *Chapitre 42.*

**Héritage** — Une classe fille réutilise automatiquement les attributs et méthodes d'une classe mère (`extends`). *Chapitre 12.*

**IDE** — Un environnement de développement intégré (IntelliJ IDEA, VS Code). *Chapitre 40.*

**Indice (index)** — La position d'un élément dans un tableau, commençant toujours à 0. *Chapitre 3.*

**Injection de dépendance** — Recevoir une dépendance depuis l'extérieur, plutôt que de la créer soi-même. *Chapitre 44.*

**Instance** — Synonyme d'objet, créé à partir d'une classe. *Chapitre 9.*

**Interface** — Un contrat listant des méthodes qu'une classe s'engage à implémenter, sans lien d'héritage. *Chapitre 15.*

**Interface fonctionnelle** — Une interface avec une seule méthode abstraite, utilisable avec une lambda. *Chapitre 27.*

**JDBC** — L'ensemble d'outils Java pour se connecter à une base de données et lui envoyer des requêtes. *Chapitre 33.*

**JVM** — La machine virtuelle Java, qui exécute le bytecode sur n'importe quel système. *Chapitre 1.*

**Lambda** — Une expression compacte pour écrire une méthode "à la volée", sans lui donner de nom. *Chapitre 27.*

**Liaison dynamique** — Le mécanisme par lequel Java choisit, à l'exécution, la méthode réellement exécutée selon le type réel de l'objet. *Chapitre 13.*

**Mapper** — Une classe/méthode dédiée à la conversion entre un modèle et un DTO. *Chapitre 38.*

**Méthode** — Un bloc d'instructions nommé, appartenant à une classe, réutilisable. *Chapitre 7.*

**Modulo** (`%`) — L'opérateur qui renvoie le reste d'une division entière. *Chapitre 4.*

**MVC** — Modèle-Vue-Contrôleur, un patron d'architecture séparant données, affichage et orchestration. *Chapitre 37.*

**NullPointerException** — L'erreur provoquée par l'appel d'une méthode sur une référence `null`. *Chapitre 9.*

**Objet** — Une instance concrète créée à partir d'une classe. *Chapitre 8.*

**Optional** — Un conteneur représentant une valeur présente ou son absence explicite, sans `null` caché. *Chapitre 28.*

**Package** — L'équivalent Java d'un dossier, regroupant des classes liées. *Chapitre 36.*

**Paramètre** — Le nom utilisé dans la définition d'une méthode (à distinguer de l'argument). *Chapitre 7.*

**Paramètre de type** — Un symbole générique (`T`) remplacé par un vrai type à l'utilisation. *Chapitre 26.*

**Pattern Repository** — Une interface exposant un vocabulaire métier pour l'accès aux données, potentiellement en cachant leur source. *Chapitre 38.*

**Point d'entrée** — La méthode `main`, où commence toujours l'exécution d'un programme Java. *Chapitre 1.*

**Polymorphisme** — Des objets de classes différentes répondent différemment à un même appel de méthode. *Chapitre 13.*

**PreparedStatement** — Une requête SQL préparée avec des `?`, protégeant contre l'injection SQL. *Chapitre 34.*

**Programme** — Une suite d'instructions exécutées dans l'ordre par un ordinateur. *Chapitre 1.*

**Recherche linéaire** — Parcourir un tableau élément par élément jusqu'à trouver ce qu'on cherche. *Chapitre 18.*

**Référence** — Ce qu'une variable objet contient réellement : un pointeur vers l'objet, jamais l'objet lui-même. *Chapitre 9.*

**Régression** — Un bug introduit par une modification censée en corriger ou améliorer une autre. *Chapitre 39.*

**Relation un-à-plusieurs (1-N)** — Une ligne d'une table peut être liée à plusieurs lignes d'une autre table. *Chapitre 31.*

**Requête (SQL)** — Toute commande qui interroge ou manipule une base de données. *Chapitre 32.*

**SQL** — Le langage standard pour créer et manipuler des bases de données relationnelles. *Chapitre 32.*

**SQLException** — L'exception levée par JDBC en cas de problème de base de données. *Chapitre 33.*

**Stream** — Une chaîne d'opérations déclaratives appliquées à une collection. *Chapitre 29.*

**String** — Le type représentant du texte en Java. *Chapitre 3.*

**Surcharge** — Définir plusieurs constructeurs (ou méthodes) différant par leurs paramètres. *Chapitre 10.*

**Table / colonne / ligne** — Les composantes d'une base de données relationnelle. *Chapitre 31.*

**Test unitaire** — Un programme automatisé qui vérifie qu'une partie précise du code se comporte comme prévu. *Chapitre 39.*

**this** — Désigne l'objet en cours de construction ou de manipulation. *Chapitre 10.*

**Try-with-resources** — Une forme de `try` qui ferme automatiquement une ressource (fichier, connexion) à la fin du bloc. *Chapitre 24.*

**Type** — La nature de l'information qu'une variable peut contenir. *Chapitre 2.*

**Variable** — Un espace nommé en mémoire, gardant une valeur modifiable. *Chapitre 2.*

---

*Annexe suivante : l'aide-mémoire, avec la syntaxe essentielle et les commandes des outils vus dans ce manuel.*
