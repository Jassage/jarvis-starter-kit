<div class="chapitre-titre-num">CHAPITRE 7</div>

# Abstraction

## Objectifs pédagogiques

Comprendre pourquoi certaines classes ne devraient jamais être instanciées directement, savoir déclarer des classes et méthodes `abstract`, et commencer à distinguer ce cas des interfaces (approfondi au chapitre 8).

## 7.1 Le problème : une classe mère "trop générale" pour exister seule

Au chapitre 6, `Forme` définissait `calculerAire()` retournant `0` par défaut — une valeur arbitraire, sans aucun sens réel :

```java
public class Forme {
    double calculerAire() {
        return 0; // Que représente réellement "l'aire d'une Forme" sans précision de forme ?
    }
}

Forme f = new Forme(); // Rien n'empêche cette création absurde : une "forme" abstraite n'existe pas concrètement
System.out.println(f.calculerAire()); // 0, une valeur qui ne veut rien dire
```

Le concept de "Forme" en général n'a pas de méthode de calcul d'aire sensée — seules les formes **concrètes** (`Cercle`, `Carre`) en ont une. **L'abstraction** formalise cette idée : `Forme` ne devrait jamais être instanciée directement, seulement héritée.

## 7.2 Classes abstraites

```java
public abstract class Forme {
    // Méthode ABSTRAITE : aucun corps, chaque classe fille DOIT fournir sa propre implémentation
    abstract double calculerAire();

    // Une classe abstraite PEUT aussi contenir des méthodes concrètes, normalement implémentées
    void afficherType() {
        System.out.println("Ceci est une forme géométrique.");
    }
}
```

```java
Forme f = new Forme(); // ❌ Erreur de compilation : impossible d'instancier une classe abstraite
```

```java
public class Cercle extends Forme {
    double rayon;
    Cercle(double rayon) { this.rayon = rayon; }

    @Override
    double calculerAire() { // OBLIGATOIRE : sinon Cercle devient lui-même abstrait implicitement
        return Math.PI * rayon * rayon;
    }
}

Cercle c = new Cercle(5); // ✅ Une classe CONCRÈTE (non abstraite) peut être instanciée normalement
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une classe fille qui n'implémente pas toutes les méthodes abstraites reste abstraite</span>
```java
public abstract class Forme {
    abstract double calculerAire();
    abstract double calculerPerimetre();
}

public class Triangle extends Forme {
    @Override
    double calculerAire() { return 0; } // implémentée
    // calculerPerimetre() PAS implémentée
}
// ❌ Erreur de compilation : Triangle doit soit implémenter calculerPerimetre(), soit être déclarée "abstract" elle-même
```
</div>

## 7.3 Diagramme UML d'une classe abstraite

**Diagramme de classe — Abstraction**

```{.uml}
┌─────────────────────────────┐
│      «abstract» Forme          │
├─────────────────────────────┤
│ + calculerAire(): double  {abstrait} │
│ + afficherType(): void         │
└─────────────────────────────┘
           △
           │
    ┌──────┴───────┐
    │               │
┌─────────┐   ┌─────────┐
│  Cercle   │   │  Carre    │
├─────────┤   ├─────────┤
│ - rayon   │   │ - cote     │
├─────────┤   ├─────────┤
│+calculerAire()│ │+calculerAire()│
└─────────┘   └─────────┘
```

Par convention UML, le nom d'une classe abstraite est écrit en *italique* (représenté ici par `«abstract»` en préfixe, une convention textuelle équivalente utilisée dans ce manuel), et les méthodes abstraites sont annotées `{abstrait}`.

## 7.4 Cas d'utilisation typiques

- **Modéliser un concept qui n'a de sens que via ses spécialisations** : `Forme` (Cercle, Carré), `Employe` (EmployeCommission, EmployeHoraire, chapitre 6), `Vehicule` (Voiture, Moto, Camion).
- **Imposer un contrat partiel** : forcer chaque sous-classe à implémenter certaines méthodes clés (`calculerSalaire()`), tout en fournissant du code commun réutilisable (comme `afficherType()` en section 7.2) — un avantage que les interfaces pures (chapitre 8, avant Java 8) n'offraient pas.
- **Empêcher une instanciation directe non voulue**, tout en gardant la possibilité de typer une variable ou un paramètre avec le type général (`Forme f = new Cercle(5);`, exactement comme au chapitre 6 pour le polymorphisme).

## 7.5 Classe abstraite avec constructeur

<div class="encadre astuce">
<span class="encadre-titre">💡 Une classe abstraite PEUT avoir un constructeur, même si elle ne peut pas être instanciée directement</span>
Son constructeur ne sera jamais appelé via `new Forme(...)`, mais bien via `super(...)` depuis le constructeur d'une classe fille concrète — exactement le même mécanisme qu'au chapitre 5.
</div>

```java
public abstract class Employe {
    private String nom;
    private double salaireDeBase;

    public Employe(String nom, double salaireDeBase) {
        this.nom = nom;
        this.salaireDeBase = salaireDeBase;
    }

    public String getNom() { return nom; }
    public double getSalaireDeBase() { return salaireDeBase; }

    public abstract double calculerSalaire(); // chaque type d'employé calcule différemment
}

public class EmployeCommission extends Employe {
    private double commission;

    public EmployeCommission(String nom, double salaireDeBase, double commission) {
        super(nom, salaireDeBase); // appelle le constructeur de la classe abstraite Employe
        this.commission = commission;
    }

    @Override
    public double calculerSalaire() {
        return getSalaireDeBase() + commission;
    }
}
```

## 7.6 Différence avec les interfaces : aperçu avant le chapitre 8

<div class="encadre astuce">
<span class="encadre-titre">💡 Question fréquente : quand choisir une classe abstraite plutôt qu'une interface ?</span>
Règle simple, développée en détail au chapitre 8 : si les classes filles partagent un **état commun** (des attributs, comme `nom` et `salaireDeBase` ci-dessus) et du **code concret réutilisable**, une classe abstraite convient mieux. Si le besoin est uniquement de définir un **contrat de comportement** sans état partagé, et potentiellement d'être combiné à d'autres contrats (héritage multiple impossible avec les classes, chapitre 5), une interface est le bon choix.
</div>

## 7.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rendre abstraite une classe qui n'a aucune raison de l'être</span>
Déclarer `abstract` une classe qui, en pratique, a toujours un sens à être instanciée directement (par exemple, une classe utilitaire `Calculatrice` sans aucune vraie spécialisation prévue) ajoute une contrainte artificielle sans bénéfice réel. Réserve `abstract` aux cas où le concept **n'a réellement aucun sens concret** sans spécialisation (rappel de la section 7.1).
</div>

## 7.8 Résumé du chapitre

- Une classe `abstract` ne peut jamais être instanciée directement, seulement héritée.
- Une méthode `abstract` (sans corps) **doit** être implémentée par toute classe fille concrète, sinon celle-ci reste abstraite elle-même.
- Une classe abstraite peut mélanger méthodes abstraites (contrat imposé) et méthodes concrètes (code réutilisable), et posséder un état (attributs) et un constructeur.
- À réserver aux concepts qui n'ont de sens réel qu'à travers leurs spécialisations concrètes.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>

Crée une classe abstraite `Instrument` avec un attribut `nom`, un constructeur, une méthode abstraite `jouer()`, et une méthode concrète `presenter()` affichant le nom de l'instrument. Crée deux classes filles `Guitare` et `Piano` implémentant `jouer()` différemment.
</div>

**Corrigé :**
```java
public abstract class Instrument {
    private String nom;

    public Instrument(String nom) {
        this.nom = nom;
    }

    public void presenter() {
        System.out.println("Instrument : " + nom);
    }

    public abstract void jouer();
}

public class Guitare extends Instrument {
    public Guitare() { super("Guitare"); }

    @Override
    public void jouer() {
        System.out.println("Grattement des cordes...");
    }
}

public class Piano extends Instrument {
    public Piano() { super("Piano"); }

    @Override
    public void jouer() {
        System.out.println("Les touches résonnent...");
    }
}
```

*Chapitre suivant : les interfaces, pour définir un contrat pur, combinable en nombre illimité, contrairement à l'héritage de classes.*
