<div class="chapitre-titre-num">CHAPITRE 10</div>

# Les constructeurs

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras écrire un constructeur pour garantir qu'un objet naît toujours complet et cohérent, tu comprendras le mot-clé `this`, et tu sauras définir plusieurs constructeurs pour une même classe.

## A. Le problème

Au chapitre 9, on créait un objet puis on remplissait ses attributs un par un :

```java
Livre livre = new Livre();
livre.titre = "Le Petit Prince";
livre.disponible = true; // et si on OUBLIE cette ligne ?
```

Rien n'empêche d'oublier une de ces lignes. Le programme continue de fonctionner **sans erreur visible**, avec un objet incomplet (`disponible` resterait à `false` par défaut, silencieusement faux). Sur un projet avec des dizaines d'attributs, ce genre d'oubli devient presque inévitable.

## B. Exemple de la vie réelle

Pense à la commande d'un meuble en kit. Deux façons de le recevoir :

- **Sans constructeur** : tu reçois une boîte de pièces détachées, et rien ne t'oblige à toutes les assembler. Le meuble peut rester bancal, avec une pièce manquante, sans que personne ne s'en aperçoive avant qu'il ne s'effondre.
- **Avec constructeur** : le vendeur exige, avant même de te livrer quoi que ce soit, que tu précises la couleur et les dimensions. Le meuble arrive déjà entièrement assemblé, avec toutes ses pièces obligatoires en place.

## C. Explication très simple

> Un **constructeur** est une méthode spéciale, portant le même nom que la classe, exécutée automatiquement à chaque `new`, dont le rôle est d'initialiser complètement un nouvel objet.

## D. Le constructeur par défaut

Si tu n'écris **aucun** constructeur, Java t'en fournit un gratuitement : le **constructeur par défaut**, sans paramètre, qui se contente d'initialiser chaque attribut à sa valeur par défaut (chapitre 9).

```java
public class Etudiant {
    String nom;
    int age;
    // Aucun constructeur écrit : Java fournit Etudiant() { } automatiquement
}

Etudiant e = new Etudiant(); // appelle ce constructeur par défaut, invisible
```

## E. Le constructeur paramétré, ligne par ligne

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
}
```

```{.uml}
Etudiant(String nom, int age, double moyenne) {
   │            │
   │            └─ Les PARAMÈTRES reçus, exactement comme pour une méthode (chapitre 7).
   │
   └─ Même nom EXACT que la classe. Pas de type de retour devant (ni void, ni
      autre) : c'est ce qui distingue visuellement un constructeur d'une
      méthode ordinaire.

   this.nom = nom;
     │    │     │
     │    │     └─ Le PARAMÈTRE reçu (à droite du =).
     │    └─ L'ATTRIBUT de l'objet (à gauche du =).
     └─ "this" désigne l'objet en cours de construction.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : this</span>
<code>this</code> désigne <strong>l'objet en cours de construction ou de manipulation</strong>. Il sert principalement à distinguer un attribut de l'objet d'un paramètre portant le même nom : <code>this.nom</code> = l'attribut ; <code>nom</code> (sans <code>this.</code>) = le paramètre reçu.
</div>

Une fois un constructeur paramétré écrit, il devient **impossible** de créer un `Etudiant` incomplet : le compilateur exige les 3 arguments à chaque `new`.

```java
Etudiant e = new Etudiant("Jaslin", 22, 16.5); // les 3 informations sont OBLIGATOIRES
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Dès qu'un constructeur est écrit, le constructeur par défaut disparaît</span>

```java
public class Etudiant {
    String nom;
    Etudiant(String nom) { this.nom = nom; }
}

Etudiant e = new Etudiant(); // ❌ erreur de compilation : le constructeur par défaut n'existe plus
```

Dès qu'un **seul** constructeur est défini explicitement, Java arrête de fournir le constructeur par défaut sans paramètre. S'il doit rester disponible, il faut l'écrire soi-même, en plus des autres.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier this et créer un bug silencieux</span>

```java
public class Etudiant {
    String nom;

    Etudiant(String nom) {
        nom = nom; // ❌ n'assigne le paramètre qu'à lui-même : l'attribut reste null !
    }
}
```

Sans `this.`, `nom = nom;` ne fait rien d'utile : Java comprend les deux `nom` comme le **même** paramètre local, jamais comme l'attribut de l'objet. Aucune erreur de compilation, mais un comportement incorrect et difficile à repérer à l'exécution — une des erreurs les plus fréquentes des débutants sur les constructeurs.
</div>

## F. Deuxième exemple : plusieurs constructeurs (surcharge)

Une classe peut avoir **plusieurs** constructeurs, différant par leurs paramètres — on appelle ça la **surcharge**.

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

    // Un nouvel étudiant, pas encore noté
    Etudiant(String nom, int age) {
        this(nom, age, 0.0); // délègue au constructeur ci-dessus, doit être la 1RE ligne
    }
}

Etudiant e1 = new Etudiant("Jaslin", 22, 16.5);
Etudiant e2 = new Etudiant("Marie", 20); // moyenne automatiquement à 0.0
```

Java choisit automatiquement le bon constructeur selon le nombre et le type des arguments fournis. `this(...)` évite de recopier `this.nom = nom; this.age = age;` dans les deux constructeurs.

<div class="encadre astuce">
<span class="encadre-titre">💡 Le constructeur, meilleur endroit pour valider les données</span>

```java
public class CompteBancaire {
    String titulaire;
    double solde;

    CompteBancaire(String titulaire, double soldeInitial) {
        if (soldeInitial < 0) {
            throw new IllegalArgumentException("Le solde initial ne peut pas être négatif");
        }
        this.titulaire = titulaire;
        this.solde = soldeInitial;
    }
}
```

Refuser une donnée invalide dès la construction garantit qu'**aucun** `CompteBancaire` à solde négatif ne pourra jamais exister ailleurs dans le programme — bien plus sûr que de vérifier "au cas par cas" dans chaque méthode qui utilise `solde` plus tard. On approfondit cette idée de protection au chapitre 11 (Encapsulation).
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais qu'un constructeur porte le même nom que sa classe, sans type de retour.
✓ Je sais écrire un constructeur paramétré qui impose les infos nécessaires.
✓ Je comprends le rôle de this pour distinguer attribut et paramètre.
✓ Je sais définir plusieurs constructeurs (surcharge) et déléguer avec this(...).
✓ Je sais valider une donnée dès le constructeur, avec throw.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pourquoi ce code ne compile-t-il pas ?

```java
public class Produit {
    String nom;
    Produit(String nom) { this.nom = nom; }
}

Produit p = new Produit();
```
</div>

## Correction

Dès qu'un constructeur `Produit(String nom)` est défini, Java arrête de fournir automatiquement le constructeur sans paramètre. `new Produit()` cherche un constructeur vide qui n'existe plus : erreur de compilation. Pour corriger, soit on appelle toujours `new Produit("...")`, soit on ajoute explicitement un second constructeur `Produit() { }`.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une classe `Rectangle` avec attributs `largeur` et `hauteur`, un constructeur qui refuse (avec `throw new IllegalArgumentException(...)`) toute dimension inférieure ou égale à zéro, une méthode `calculerAire()`, et un second constructeur `Rectangle(double cote)` qui crée un carré en délégant au premier via `this(...)`.
</div>

### Corrigé du défi

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

    Rectangle(double cote) {
        this(cote, cote);
    }

    double calculerAire() {
        return largeur * hauteur;
    }
}
```

## Résumé du chapitre

- Un **constructeur** porte le même nom que sa classe, sans type de retour, et s'exécute automatiquement à chaque `new`.
- Sans constructeur écrit, Java en fournit un par défaut, vide ; dès qu'on en écrit un, ce constructeur par défaut disparaît.
- `this.attribut` distingue l'attribut de l'objet d'un paramètre de même nom ; l'oublier crée un bug silencieux.
- Plusieurs constructeurs (surcharge) offrent différentes façons de créer un objet ; `this(...)`, en première ligne, évite la duplication entre eux.
- Le constructeur est l'endroit idéal pour valider les données et garantir un objet toujours cohérent dès sa naissance.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris un constructeur pour une classe `Point` avec attributs `x` et `y` (int), qui impose les deux valeurs à la création.
</div>

**Corrigé :**
```java
public class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Ce code compile-t-il ? Si non, pourquoi, et comment le corriger ?

```java
public class Article {
    String nom;
    double prix;

    Article(String nom) {
        this.nom = nom;
    }
}

Article a = new Article("Riz", 250.0);
```
</div>

**Corrigé :** Non, ce code ne compile pas. Le seul constructeur existant, `Article(String nom)`, prend **un seul** paramètre. L'appel `new Article("Riz", 250.0)` fournit deux arguments, qui ne correspondent à aucun constructeur défini. Correction : soit appeler `new Article("Riz")`, soit ajouter un constructeur `Article(String nom, double prix)`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Écris une classe `CompteBancaire` avec 3 constructeurs : un complet `(String titulaire, double soldeInitial)` qui valide que le solde n'est pas négatif, un `(String titulaire)` qui délègue au premier avec un solde de `0.0`, et vérifie que les deux fonctionnent avec des appels de test.
</div>

**Corrigé :**
```java
public class CompteBancaire {
    String titulaire;
    double solde;

    CompteBancaire(String titulaire, double soldeInitial) {
        if (soldeInitial < 0) {
            throw new IllegalArgumentException("Solde initial négatif refusé");
        }
        this.titulaire = titulaire;
        this.solde = soldeInitial;
    }

    CompteBancaire(String titulaire) {
        this(titulaire, 0.0);
    }
}

public class Main {
    public static void main(String[] args) {
        CompteBancaire c1 = new CompteBancaire("Jaslin", 5000);
        CompteBancaire c2 = new CompteBancaire("Marie"); // solde = 0.0

        System.out.println(c1.titulaire + " : " + c1.solde);
        System.out.println(c2.titulaire + " : " + c2.solde);
    }
}
```

---

*Chapitre suivant : l'encapsulation, le premier des quatre piliers de la POO, pour enfin protéger réellement les données d'un objet contre toute modification incohérente.*
