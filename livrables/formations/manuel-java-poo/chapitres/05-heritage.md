<div class="chapitre-titre-num">CHAPITRE 5</div>

# Héritage

## Objectifs pédagogiques

Comprendre comment une classe peut réutiliser et étendre le comportement d'une autre, maîtriser `extends`, `super`, la redéfinition de méthodes, et l'interaction entre héritage et constructeurs.

## 5.1 Le problème : duplication entre classes similaires

```java
public class Etudiant {
    String nom;
    int age;
    String numeroEtudiant;

    void afficherFiche() {
        System.out.println(nom + ", " + age + " ans, matricule " + numeroEtudiant);
    }
}

public class Professeur {
    String nom;     // DUPLIQUÉ
    int age;        // DUPLIQUÉ
    String matiere;

    void afficherFiche() { // LOGIQUE PARTIELLEMENT DUPLIQUÉE
        System.out.println(nom + ", " + age + " ans, enseigne " + matiere);
    }
}
```

`nom` et `age` sont communs aux deux classes, mais dupliqués. **L'héritage** permet d'extraire ce qui est commun dans une classe **mère** (ou "classe parente"), que les classes **filles** (ou "classes enfants") réutilisent et complètent.

## 5.2 Le mot-clé extends

```java
// Classe mère : regroupe ce qui est commun à TOUTE personne de l'école
public class Personne {
    String nom;
    int age;

    Personne(String nom, int age) {
        this.nom = nom;
        this.age = age;
    }

    void seDeplacer() {
        System.out.println(nom + " se déplace.");
    }
}

// Classe fille : HÉRITE de tout ce que Personne possède, et ajoute ses propres particularités
public class Etudiant extends Personne {
    String numeroEtudiant;

    Etudiant(String nom, int age, String numeroEtudiant) {
        super(nom, age); // appelle le constructeur de Personne (section 5.4)
        this.numeroEtudiant = numeroEtudiant;
    }

    void etudier() {
        System.out.println(nom + " étudie."); // nom est HÉRITÉ de Personne, directement accessible
    }
}
```

```java
Etudiant e = new Etudiant("Jaslin", 22, "MAT2024001");
e.seDeplacer(); // méthode héritée de Personne : "Jaslin se déplace."
e.etudier();    // méthode propre à Etudiant : "Jaslin étudie."
```

**Diagramme de classe — Héritage**

```{.uml}
┌─────────────────────┐
│      Personne         │
├─────────────────────┤
│ # nom : String        │
│ # age : int            │
├─────────────────────┤
│ + Personne(nom, age)  │
│ + seDeplacer(): void   │
└─────────────────────┘
           △
           │  extends (héritage)
           │
┌─────────────────────────────┐
│          Etudiant              │
├─────────────────────────────┤
│ - numeroEtudiant : String       │
├─────────────────────────────┤
│ + Etudiant(nom, age, numeroEtudiant) │
│ + etudier(): void               │
└─────────────────────────────┘
```

Le triangle vide (△) pointant vers la classe mère est la notation UML standard pour l'héritage — retenue exactement ainsi au chapitre 18.

## 5.3 Réutilisation du code : le vrai bénéfice

```java
public class Professeur extends Personne {
    String matiere;

    Professeur(String nom, int age, String matiere) {
        super(nom, age);
        this.matiere = matiere;
    }

    void enseigner() {
        System.out.println(nom + " enseigne " + matiere);
    }
}
```

`nom`, `age` et `seDeplacer()` ne sont écrits **qu'une seule fois**, dans `Personne` — `Etudiant` et `Professeur` en héritent automatiquement, sans aucune duplication.

## 5.4 super : appeler le constructeur de la classe mère

<div class="encadre attention">
<span class="encadre-titre">⚠️ super(...) doit être la PREMIÈRE instruction du constructeur</span>
```java
Etudiant(String nom, int age, String numeroEtudiant) {
    this.numeroEtudiant = numeroEtudiant;
    super(nom, age); // ❌ Erreur de compilation : super doit être en première ligne
}
```
Java exige que l'initialisation de la classe mère (`super(...)`) se fasse **avant** toute autre instruction du constructeur fille, garantissant que la partie héritée de l'objet est initialisée avant sa partie spécifique. Si `super(...)` n'est pas écrit explicitement, Java insère automatiquement un appel **implicite** à `super()` (le constructeur sans paramètre de la mère) — qui échoue à la compilation si la classe mère n'en possède pas.
</div>

## 5.5 Redéfinition de méthode (@Override)

Une classe fille peut **redéfinir** (remplacer) le comportement d'une méthode héritée, en gardant la même signature :

```java
public class Personne {
    String nom;

    void seDeplacer() {
        System.out.println(nom + " marche.");
    }
}

public class Etudiant extends Personne {
    @Override
    void seDeplacer() {
        System.out.println(nom + " se déplace à vélo vers l'université.");
    }
}
```

```java
Etudiant e = new Etudiant();
e.nom = "Jaslin";
e.seDeplacer(); // "Jaslin se déplace à vélo vers l'université." — la version REDÉFINIE est utilisée
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'annotation @Override n'est pas obligatoire, mais toujours recommandée</span>
`@Override` ne change rien au comportement du programme — c'est une simple annotation qui demande au **compilateur** de vérifier qu'une méthode de la classe mère avec exactement cette signature existe réellement. Sans elle, une faute de frappe dans le nom de la méthode (`seDeplacer` écrit `seDeplacé`) créerait silencieusement une **nouvelle** méthode plutôt qu'une redéfinition, un bug très difficile à repérer sans cette vérification.
</div>

## 5.6 Appeler la version de la classe mère avec super.methode()

```java
public class Etudiant extends Personne {
    @Override
    void seDeplacer() {
        super.seDeplacer(); // exécute D'ABORD le comportement de Personne
        System.out.println("...puis prend le bus vers l'école.");
    }
}
```

```java
Etudiant e = new Etudiant();
e.nom = "Jaslin";
e.seDeplacer();
// "Jaslin marche."
// "...puis prend le bus vers l'école."
```

`super.methode()` permet d'**étendre** le comportement hérité plutôt que de le remplacer entièrement — utile quand la classe fille veut ajouter un comportement supplémentaire sans dupliquer celui déjà écrit dans la classe mère.

## 5.7 Héritage à un seul niveau : Java n'autorise pas l'héritage multiple de classes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une classe Java ne peut hériter que d'UNE SEULE classe mère</span>
```java
// ❌ Erreur de compilation : Java n'autorise pas l'héritage multiple de classes
public class Etudiant extends Personne, Employe { }
```
Contrairement à C++, Java **interdit** l'héritage multiple de classes (pour éviter des ambiguïtés complexes, comme le "problème du diamant"). Pour combiner plusieurs comportements provenant de sources différentes, Java propose les **interfaces** (chapitre 8), qu'une classe peut implémenter en nombre illimité.
</div>

## 5.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre héritage et composition</span>
L'héritage exprime une relation **"est un"** (`Etudiant` **est une** `Personne`). Si la relation réelle est **"a un"** (une `Voiture` **a un** `Moteur`, mais n'est pas un moteur), il ne faut **pas** utiliser l'héritage, mais la **composition** : ajouter un attribut de type `Moteur` dans `Voiture`. Utiliser l'héritage pour une relation "a un" est une erreur de conception fréquente chez les débutants, qui mène à des hiérarchies de classes artificielles et fragiles.
</div>

## 5.9 Résumé du chapitre

- `extends` permet à une classe fille de réutiliser attributs et méthodes d'une classe mère, sans duplication.
- `super(...)` (première instruction du constructeur) initialise la partie héritée de l'objet.
- `@Override` redéfinit une méthode héritée ; `super.methode()` permet d'étendre plutôt que remplacer.
- Java n'autorise **pas** l'héritage multiple de classes — les interfaces (chapitre 8) comblent ce besoin autrement.
- L'héritage modélise une relation "est un" ; une relation "a un" doit utiliser la composition, pas l'héritage.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Crée une classe mère `Vehicule` (attributs `marque`, `vitesseMax`, méthode `demarrer()`), puis une classe fille `Moto` qui redéfinit `demarrer()` en appelant d'abord la version de `Vehicule` puis en ajoutant un message spécifique aux motos.
</div>

**Corrigé :**
```java
public class Vehicule {
    String marque;
    double vitesseMax;

    Vehicule(String marque, double vitesseMax) {
        this.marque = marque;
        this.vitesseMax = vitesseMax;
    }

    void demarrer() {
        System.out.println(marque + " démarre.");
    }
}

public class Moto extends Vehicule {
    Moto(String marque, double vitesseMax) {
        super(marque, vitesseMax);
    }

    @Override
    void demarrer() {
        super.demarrer();
        System.out.println("Vroum ! Prête à rouler.");
    }
}
```

*Chapitre suivant : le polymorphisme, pour qu'un même appel de méthode se comporte différemment selon le type réel de l'objet.*
