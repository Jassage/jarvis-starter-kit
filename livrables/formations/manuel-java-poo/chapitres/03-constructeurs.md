<div class="chapitre-titre-num">CHAPITRE 3</div>

# Les constructeurs

## Objectifs pédagogiques

Comprendre le rôle du constructeur, savoir en définir plusieurs (surcharge), maîtriser le mot-clé `this`, et garantir qu'un objet est toujours créé dans un état valide et cohérent.

## 3.1 Le problème résolu par les constructeurs

Au chapitre 2, les objets étaient créés puis initialisés attribut par attribut :

```java
Etudiant e = new Etudiant();
e.nom = "Jaslin";
e.age = 22;
e.moyenne = 0; // et si on OUBLIE cette ligne ? l'objet reste dans un état incomplet, silencieusement
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le problème : rien n'oblige à initialiser tous les attributs</span>
Sans mécanisme dédié, un objet peut exister dans un état incomplet ou incohérent (un `Etudiant` sans nom, un `CompteBancaire` créé avec un solde `null` non initialisé) sans que le compilateur ne signale quoi que ce soit. Le **constructeur** résout ce problème en **imposant** les informations nécessaires dès la création de l'objet.
</div>

## 3.2 Le constructeur par défaut

Si aucun constructeur n'est écrit explicitement, Java en fournit un **gratuitement** : le constructeur par défaut, sans paramètre, qui initialise chaque attribut à sa valeur par défaut (chapitre 2).

```java
public class Etudiant {
    String nom;
    int age;
    // Aucun constructeur écrit : Java fournit implicitement Etudiant() { }
}

Etudiant e = new Etudiant(); // appelle le constructeur par défaut implicite
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Dès qu'un constructeur est écrit, le constructeur par défaut disparaît</span>
```java
public class Etudiant {
    String nom;
    Etudiant(String nom) { this.nom = nom; }
}

Etudiant e = new Etudiant(); // ❌ Erreur de compilation : le constructeur par défaut n'existe plus !
```
Dès qu'un **seul** constructeur est défini explicitement (avec ou sans paramètre), Java **cesse** de fournir le constructeur par défaut sans paramètre. S'il doit rester accessible, il faut l'écrire soi-même, en plus des autres.
</div>

## 3.3 Le constructeur paramétré

```java
public class Etudiant {
    String nom;
    int age;
    double moyenne;

    // Constructeur paramétré : impose les valeurs nécessaires dès la création
    Etudiant(String nom, int age, double moyenne) {
        this.nom = nom;
        this.age = age;
        this.moyenne = moyenne;
    }
}

// Impossible de créer un Etudiant incomplet : le compilateur EXIGE les 3 arguments
Etudiant e = new Etudiant("Jaslin", 22, 16.5);
```

## 3.4 Le mot-clé this

`this` désigne **l'objet en cours de construction/manipulation**, permettant de distinguer un attribut de l'objet d'un paramètre portant le même nom.

```java
public class Etudiant {
    String nom;

    Etudiant(String nom) {
        this.nom = nom; // this.nom = L'ATTRIBUT de l'objet ; nom (à droite) = LE PARAMÈTRE reçu
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur fréquente : oublier this et créer une variable locale involontaire</span>
```java
public class Etudiant {
    String nom;

    Etudiant(String nom) {
        nom = nom; // ❌ Ne fait RIEN d'utile : assigne le paramètre à lui-même, l'attribut nom reste null !
    }
}
```
Sans `this.`, `nom = nom;` assigne la variable **paramètre** `nom` à elle-même (une opération inutile), et l'attribut `this.nom` de l'objet reste à sa valeur par défaut (`null`). C'est une des erreurs les plus fréquentes et les plus silencieuses des débutants — aucune erreur de compilation, mais un comportement incorrect à l'exécution.
</div>

`this` sert aussi à appeler un **autre constructeur de la même classe** (section 3.6), ou à retourner l'objet courant dans certains design patterns (chapitre 20, pattern Builder).

## 3.5 Surcharge de constructeurs

Une classe peut définir **plusieurs** constructeurs, différant par le nombre ou le type de leurs paramètres — c'est la **surcharge** (à ne pas confondre avec la redéfinition, vue au chapitre 5).

```java
public class Etudiant {
    String nom;
    int age;
    double moyenne;

    // Constructeur complet
    Etudiant(String nom, int age, double moyenne) {
        this.nom = nom;
        this.age = age;
        this.moyenne = moyenne;
    }

    // Constructeur sans moyenne (nouvel étudiant, pas encore noté)
    Etudiant(String nom, int age) {
        this.nom = nom;
        this.age = age;
        this.moyenne = 0.0;
    }

    // Constructeur minimal
    Etudiant(String nom) {
        this.nom = nom;
        this.age = 18; // âge par défaut supposé
        this.moyenne = 0.0;
    }
}

Etudiant e1 = new Etudiant("Jaslin", 22, 16.5);
Etudiant e2 = new Etudiant("Marie", 20);
Etudiant e3 = new Etudiant("Paul");
```

Java choisit **automatiquement** le bon constructeur en fonction du nombre et du type des arguments fournis lors de l'appel `new`.

## 3.6 Éviter la duplication entre constructeurs avec this(...)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Duplication de logique entre constructeurs surchargés</span>
Le code de la section 3.5 répète `this.nom = nom;` et `this.moyenne = 0.0;` dans plusieurs constructeurs. La solution : faire appeler un constructeur par un **autre**, via `this(...)`, **obligatoirement en toute première ligne** du constructeur.
</div>

```java
public class Etudiant {
    String nom;
    int age;
    double moyenne;

    Etudiant(String nom, int age, double moyenne) {
        this.nom = nom;
        this.age = age;
        this.moyenne = moyenne;
    }

    // Délègue au constructeur complet, en complétant la moyenne par défaut
    Etudiant(String nom, int age) {
        this(nom, age, 0.0); // doit être la PREMIÈRE instruction du constructeur
    }

    Etudiant(String nom) {
        this(nom, 18, 0.0);
    }
}
```

## 3.7 Initialisation avec validation dès la construction

Le constructeur est l'endroit idéal pour garantir qu'un objet naît dans un état **cohérent**, en anticipant l'encapsulation complète du chapitre 4 :

```java
public class CompteBancaire {
    String titulaire;
    double solde;

    CompteBancaire(String titulaire, double soldeInitial) {
        this.titulaire = titulaire;

        if (soldeInitial < 0) {
            throw new IllegalArgumentException("Le solde initial ne peut pas être négatif");
        }
        this.solde = soldeInitial;
    }
}

CompteBancaire compte = new CompteBancaire("Jaslin", -500); // 💥 IllegalArgumentException levée immédiatement
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi valider dès le constructeur, plutôt que plus tard</span>
Refuser un état invalide **dès la création** de l'objet garantit qu'aucun code, nulle part dans le programme, ne pourra jamais manipuler un `CompteBancaire` avec un solde négatif dès le départ — bien plus sûr que de vérifier "au cas par cas" dans chaque méthode qui utilise `solde` plus tard.
</div>

## 3.8 Diagramme UML avec constructeurs

**Diagramme de classe — CompteBancaire**

```{.uml}
┌───────────────────────────────────────┐
│              CompteBancaire             │
├───────────────────────────────────────┤
│ - titulaire : String                    │
│ - solde : double                        │
├───────────────────────────────────────┤
│ + CompteBancaire(titulaire: String, soldeInitial: double) │
│ + deposer(montant: double): void        │
│ + retirer(montant: double): void        │
└───────────────────────────────────────┘
```

Par convention UML, le constructeur porte le **même nom que la classe** et n'a **aucun type de retour** listé (contrairement aux méthodes classiques) — exactement le comportement réel de Java.

## 3.9 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ this(...) qui n'est pas la première instruction</span>
```java
Etudiant(String nom) {
    System.out.println("Création..."); // ❌ Erreur de compilation
    this(nom, 18, 0.0);
}
```
`this(...)` doit **impérativement** être la toute première ligne du constructeur — Java l'exige pour garantir qu'un seul chemin d'initialisation complet s'exécute, sans double initialisation partielle.
</div>

## 3.10 Résumé du chapitre

- Le **constructeur par défaut** (sans paramètre) n'existe que si aucun autre constructeur n'est défini.
- Un **constructeur paramétré** impose les informations nécessaires dès `new`, empêchant un objet incomplet.
- `this.attribut` distingue l'attribut de l'objet d'un paramètre de même nom ; l'oublier crée un bug silencieux.
- La **surcharge** de constructeurs offre plusieurs façons de créer un objet ; `this(...)` (en première ligne) évite la duplication entre eux.
- Le constructeur est l'endroit privilégié pour **valider** et garantir un état initial cohérent.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Écris une classe `Rectangle` avec attributs `largeur` et `hauteur`, un constructeur paramété qui refuse (via `IllegalArgumentException`) toute dimension négative ou nulle, et une méthode `calculerAire()`.
</div>

**Corrigé :**
```java
public class Rectangle {
    double largeur;
    double hauteur;

    Rectangle(double largeur, double hauteur) {
        if (largeur <= 0 || hauteur <= 0) {
            throw new IllegalArgumentException("Les dimensions doivent être strictement positives");
        }
        this.largeur = largeur;
        this.hauteur = hauteur;
    }

    double calculerAire() {
        return largeur * hauteur;
    }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.2</span>

Ajoute à la classe `Rectangle` un second constructeur `Rectangle(double cote)` créant un carré (largeur = hauteur = cote), en réutilisant le premier constructeur via `this(...)`.
</div>

**Corrigé :**
```java
Rectangle(double cote) {
    this(cote, cote);
}
```

*Chapitre suivant : l'encapsulation, premier des quatre piliers de la POO, pour protéger réellement les données d'un objet.*
