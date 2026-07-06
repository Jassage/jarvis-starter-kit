<div class="chapitre-titre-num">CHAPITRE 8</div>

# Les interfaces

## Objectifs pédagogiques

Maîtriser `interface`/`implements`, comprendre pourquoi une classe peut implémenter plusieurs interfaces (contrairement à l'héritage de classes, chapitre 5), et découvrir méthodes par défaut, méthodes statiques et interfaces fonctionnelles.

## 8.1 Le problème résolu par les interfaces

Rappel du chapitre 5 : une classe Java ne peut hériter que d'**une seule** classe mère. Mais un objet peut légitimement devoir respecter **plusieurs contrats indépendants** : un `Canard` peut à la fois `Voler` et `Nager`, sans que ces deux capacités soient liées par une hiérarchie de classe commune sensée.

```java
public interface Volant {
    void voler();
}

public interface Nageur {
    void nager();
}

public class Canard implements Volant, Nageur { // implémente PLUSIEURS interfaces à la fois
    @Override
    public void voler() {
        System.out.println("Le canard vole.");
    }

    @Override
    public void nager() {
        System.out.println("Le canard nage.");
    }
}
```

## 8.2 interface et implements

Une **interface** définit un **contrat** : une liste de méthodes que toute classe l'implémentant s'engage à fournir, sans imposer **comment** elles sont réalisées.

```java
public interface Payable {
    double calculerMontant(); // implicitement "public abstract" — pas besoin de l'écrire
}

public class Facture implements Payable {
    private double montantHT;
    private double tauxTaxe;

    public Facture(double montantHT, double tauxTaxe) {
        this.montantHT = montantHT;
        this.tauxTaxe = tauxTaxe;
    }

    @Override
    public double calculerMontant() {
        return montantHT * (1 + tauxTaxe);
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toutes les méthodes d'interface sont implicitement public</span>
Contrairement aux classes, où l'on choisit `private`/`protected`/`public` (chapitre 10), toute méthode déclarée dans une interface est **implicitement `public abstract`**, même sans l'écrire explicitement. Une classe qui l'implémente doit donc obligatoirement la déclarer `public` (jamais plus restrictif), sous peine d'erreur de compilation.
</div>

## 8.3 Diagramme UML d'une interface

**Diagramme — Interface (notation avec trait pointillé)**

```{.uml}
┌─────────────────────────┐
│      «interface» Payable   │
├─────────────────────────┤
│ + calculerMontant(): double │
└─────────────────────────┘
           ▲
           ┊  implements (trait pointillé, contrairement au trait plein de l'héritage)
           ┊
┌─────────────────────────┐
│          Facture            │
├─────────────────────────┤
│ - montantHT : double        │
│ - tauxTaxe : double         │
├─────────────────────────┤
│ + calculerMontant(): double │
└─────────────────────────┘
```

## 8.4 Interfaces multiples et polymorphisme

```java
public interface Payable {
    double calculerMontant();
}

public interface Imprimable {
    void imprimer();
}

public class Facture implements Payable, Imprimable {
    // ... implémente calculerMontant() ET imprimer() ...
}
```

```java
Payable p = new Facture(1000, 0.10); // upcasting vers l'interface, comme au chapitre 6
System.out.println(p.calculerMontant());

List<Payable> facturesEnAttente = new ArrayList<>();
facturesEnAttente.add(new Facture(500, 0.10));
// N'importe quel autre type implémentant Payable (un Salaire, un Abonnement) pourrait aussi rejoindre cette liste
```

Une variable ou une collection typée par une **interface** peut contenir des objets de classes complètement différentes, tant qu'elles implémentent toutes ce contrat — un polymorphisme encore plus flexible que celui basé sur l'héritage de classes.

## 8.5 Méthodes par défaut (default)

Depuis Java 8, une interface peut fournir une **implémentation par défaut**, que les classes peuvent utiliser telle quelle ou redéfinir :

```java
public interface Payable {
    double calculerMontant();

    // Méthode par défaut : implémentation FOURNIE, réutilisable sans obligation de la réécrire
    default void afficherRecu() {
        System.out.println("Montant à payer : " + calculerMontant());
    }
}

public class Facture implements Payable {
    @Override
    public double calculerMontant() {
        return 1500;
    }
    // afficherRecu() n'a PAS besoin d'être réécrite, la version par défaut suffit
}

Facture f = new Facture();
f.afficherRecu(); // "Montant à payer : 1500.0" — utilise la version par défaut de l'interface
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi les méthodes par défaut ont été introduites</span>
Avant Java 8, ajouter une nouvelle méthode à une interface **existante** cassait la compilation de **toutes** les classes l'implémentant déjà (elles devenaient soudainement incomplètes). Les méthodes par défaut permettent d'étendre une interface **sans casser** le code existant : les classes déjà écrites héritent automatiquement du comportement par défaut, sans modification requise.
</div>

## 8.6 Méthodes statiques dans une interface

```java
public interface Payable {
    double calculerMontant();

    static Payable creerFactureVide() { // méthode STATIQUE : appelée sur l'interface elle-même, pas sur un objet
        return () -> 0.0; // exemple d'interface fonctionnelle, voir section 8.7
    }
}

Payable vide = Payable.creerFactureVide(); // appel direct sur l'interface, comme une méthode utilitaire
```

## 8.7 Interfaces fonctionnelles : introduction (approfondi au chapitre 16)

Une **interface fonctionnelle** est une interface ne déclarant **qu'une seule** méthode abstraite — elle peut alors être implémentée de façon très concise via une **expression lambda** (chapitre 16) :

```java
@FunctionalInterface // annotation optionnelle, vérifie qu'il n'y a qu'UNE méthode abstraite
public interface Operation {
    int appliquer(int a, int b);
}

public class Calculatrice {
    public static void main(String[] args) {
        // Implémentation "classique" via une classe anonyme (chapitre 11)
        Operation addition = new Operation() {
            @Override
            public int appliquer(int a, int b) {
                return a + b;
            }
        };

        // Implémentation CONCISE via une expression lambda (chapitre 16) — même contrat, bien plus court
        Operation soustraction = (a, b) -> a - b;

        System.out.println(addition.appliquer(5, 3));     // 8
        System.out.println(soustraction.appliquer(5, 3));  // 2
    }
}
```

Ce mécanisme, central en Java moderne (Streams, chapitre 17), n'est possible **que** parce qu'une interface fonctionnelle n'a qu'une seule méthode à implémenter — la lambda sait donc, sans ambiguïté, à quelle méthode son code correspond.

## 8.8 Interfaces vs classes abstraites : tableau de décision

| Critère | Interface | Classe abstraite |
|---|---|---|
| Héritage multiple | Une classe peut implémenter plusieurs interfaces | Une classe ne peut hériter que d'une seule classe (abstraite ou non) |
| État (attributs) | Uniquement des constantes (`public static final` implicite) | Peut posséder de vrais attributs d'instance |
| Code partagé | Méthodes par défaut (Java 8+) | Méthodes concrètes complètes, sans restriction |
| Constructeur | Aucun | Possible (appelé via `super(...)`) |
| Cas d'usage typique | Définir un contrat de capacité (Volant, Payable, Comparable) | Modéliser une hiérarchie avec état et code communs (Employe, Forme) |

## 8.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier d'implémenter une méthode de l'interface</span>
```java
public class Facture implements Payable {
    // calculerMontant() non implémentée !
}
// ❌ Erreur de compilation : Facture n'est pas abstraite et n'implémente pas la méthode abstraite calculerMontant()
```
Contrairement à une classe abstraite (chapitre 7) qu'une classe fille peut laisser partiellement abstraite, une classe **concrète** implémentant une interface doit fournir **toutes** ses méthodes abstraites, sans exception.
</div>

## 8.10 Résumé du chapitre

- Une interface définit un contrat pur ; `implements` permet à une classe d'en respecter **plusieurs à la fois**, contrairement à l'héritage de classes limité à une seule mère.
- Toute méthode d'interface est implicitement `public abstract`, sauf les méthodes `default` (implémentation fournie, redéfinissable) et `static` (appelées sur l'interface elle-même).
- Une **interface fonctionnelle** (une seule méthode abstraite) peut être implémentée de façon concise via une expression lambda (chapitre 16).
- Choisir une interface pour un contrat de capacité sans état partagé ; une classe abstraite pour une hiérarchie avec état et code communs.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Crée une interface `Comparable2` avec une méthode `comparerA(Object autre)`, et une méthode par défaut `estPlusGrandQue(Object autre)` qui utilise `comparerA` pour retourner un booléen. Implémente-la dans une classe `Produit` comparant par prix.
</div>

**Corrigé :**
```java
public interface Comparable2 {
    int comparerA(Object autre);

    default boolean estPlusGrandQue(Object autre) {
        return comparerA(autre) > 0;
    }
}

public class Produit implements Comparable2 {
    double prix;

    Produit(double prix) { this.prix = prix; }

    @Override
    public int comparerA(Object autre) {
        Produit autreProduit = (Produit) autre;
        return Double.compare(this.prix, autreProduit.prix);
    }
}
```

*Ceci clôt la Partie 2 (piliers avancés de la POO). Chapitre suivant : les packages, pour organiser un projet Java en modules cohérents.*
