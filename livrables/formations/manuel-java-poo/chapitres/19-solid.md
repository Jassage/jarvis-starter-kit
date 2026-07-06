<div class="chapitre-titre-num">CHAPITRE 19</div>

# Les principes SOLID

## Objectifs pédagogiques

Comprendre et appliquer les cinq principes SOLID, avec un exemple concret "avant/après" pour chacun, afin d'écrire du code orienté objet plus maintenable et plus facile à faire évoluer.

## 19.1 Pourquoi SOLID

**SOLID** est un acronyme regroupant cinq principes de conception orientée objet, formalisés notamment par Robert C. Martin ("Uncle Bob"), visant à produire du code plus **maintenable**, plus **testable** et plus **facile à étendre** sans le casser.

## 19.2 S — Single Responsibility Principle (Responsabilité unique)

<div class="encadre astuce">
<span class="encadre-titre">💡 Énoncé</span>
Une classe ne devrait avoir qu'**une seule raison de changer** — c'est-à-dire, une seule responsabilité clairement définie.
</div>

```java
// ❌ AVANT : Employe mélange logique métier ET persistance ET génération de rapport
public class Employe {
    private String nom;
    private double salaire;

    public double calculerSalaireNet() {
        return salaire * 0.85;
    }

    public void sauvegarderEnBaseDeDonnees() { // responsabilité de PERSISTANCE, hors de propos ici
        // ... code JDBC (chapitre 26) ...
    }

    public String genererFichePDF() { // responsabilité de PRÉSENTATION/rapport, encore différente
        // ... génération de PDF ...
        return "";
    }
}
```

```java
// ✅ APRÈS : chaque classe a UNE SEULE raison de changer
public class Employe {
    private String nom;
    private double salaire;

    public double calculerSalaireNet() {
        return salaire * 0.85;
    }
    // getters/setters...
}

public class EmployeRepository { // responsabilité : PERSISTANCE (approfondi au chapitre 30, pattern DAO)
    public void sauvegarder(Employe employe) {
        // ... code JDBC ...
    }
}

public class FicheDePaieGenerator { // responsabilité : GÉNÉRATION DE DOCUMENT
    public String genererPDF(Employe employe) {
        // ... génération de PDF ...
        return "";
    }
}
```

Si la logique de calcul du salaire change, seule `Employe` est modifiée. Si le mode de stockage change (MySQL → PostgreSQL, chapitre 24), seule `EmployeRepository` est touchée — aucun effet de bord entre des responsabilités désormais séparées.

## 19.3 O — Open/Closed Principle (Ouvert/Fermé)

<div class="encadre astuce">
<span class="encadre-titre">💡 Énoncé</span>
Une classe devrait être **ouverte à l'extension**, mais **fermée à la modification** — ajouter un nouveau comportement ne devrait pas exiger de modifier du code existant qui fonctionne déjà.
</div>

```java
// ❌ AVANT : ajouter un nouveau type de forme oblige à MODIFIER calculerAireTotale()
public class CalculateurAire {
    public double calculerAireTotale(List<Object> formes) {
        double total = 0;
        for (Object forme : formes) {
            if (forme instanceof Cercle c) {
                total += Math.PI * c.rayon * c.rayon;
            } else if (forme instanceof Carre ca) {
                total += ca.cote * ca.cote;
            }
            // Ajouter un Triangle exigerait de MODIFIER cette méthode existante !
        }
        return total;
    }
}
```

```java
// ✅ APRÈS : utilise le polymorphisme (chapitre 6) et l'abstraction (chapitre 7)
public abstract class Forme {
    public abstract double calculerAire();
}

public class CalculateurAire {
    public double calculerAireTotale(List<Forme> formes) {
        double total = 0;
        for (Forme forme : formes) {
            total += forme.calculerAire(); // AUCUNE modification nécessaire, quel que soit le type ajouté
        }
        return total;
    }
}

// Ajouter un Triangle n'exige QUE d'ajouter une nouvelle classe, sans toucher à CalculateurAire
public class Triangle extends Forme {
    @Override
    public double calculerAire() { /* ... */ return 0; }
}
```

## 19.4 L — Liskov Substitution Principle (Substitution de Liskov)

<div class="encadre astuce">
<span class="encadre-titre">💡 Énoncé</span>
Un objet d'une classe fille doit pouvoir **remplacer** un objet de sa classe mère, **sans casser** le comportement attendu par le code qui l'utilise.
</div>

```java
// ❌ AVANT : viole Liskov — Carre "casse" le comportement attendu de Rectangle
public class Rectangle {
    protected double largeur;
    protected double hauteur;

    public void setLargeur(double largeur) { this.largeur = largeur; }
    public void setHauteur(double hauteur) { this.hauteur = hauteur; }
    public double calculerAire() { return largeur * hauteur; }
}

public class Carre extends Rectangle {
    @Override
    public void setLargeur(double largeur) {
        this.largeur = largeur;
        this.hauteur = largeur; // ⚠️ un carré force largeur = hauteur, un effet de bord INATTENDU
    }
}

public void testerRectangle(Rectangle r) {
    r.setLargeur(5);
    r.setHauteur(10);
    // Le code appelant s'attend à une aire de 50 (5×10)...
    System.out.println(r.calculerAire()); // ...mais avec un Carre, obtient 100 (10×10) ! Comportement cassé.
}
```

```java
// ✅ APRÈS : Carre et Rectangle ne partagent PLUS une relation d'héritage incorrecte
public abstract class Forme {
    public abstract double calculerAire();
}

public class Rectangle extends Forme {
    private double largeur;
    private double hauteur;
    // ...
    @Override
    public double calculerAire() { return largeur * hauteur; }
}

public class Carre extends Forme { // Carre n'hérite PLUS de Rectangle : relation "est un" incorrecte évitée
    private double cote;
    // ...
    @Override
    public double calculerAire() { return cote * cote; }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le piège classique "un carré EST un rectangle" (mathématiquement vrai, mais pas en POO)</span>
Mathématiquement, un carré est un cas particulier de rectangle. Mais en POO, hériter implique que la classe fille doit se comporter **de façon cohérente** avec toutes les attentes définies par la classe mère (ici, pouvoir fixer largeur et hauteur indépendamment) — ce que `Carre` viole nécessairement. C'est l'exemple le plus cité pour illustrer que l'héritage doit se baser sur un **comportement compatible**, pas uniquement une relation conceptuelle du monde réel.
</div>

## 19.5 I — Interface Segregation Principle (Ségrégation des interfaces)

<div class="encadre astuce">
<span class="encadre-titre">💡 Énoncé</span>
Mieux vaut plusieurs interfaces **petites et spécifiques** qu'une seule grande interface générale imposant des méthodes inutiles à certaines classes.
</div>

```java
// ❌ AVANT : une interface trop large, force des implémentations vides/absurdes
public interface Travailleur {
    void travailler();
    void dormir(); // un Robot ne dort jamais !
    void manger();  // un Robot ne mange jamais !
}

public class Robot implements Travailleur {
    @Override
    public void travailler() { System.out.println("Le robot travaille."); }
    @Override
    public void dormir() { /* ne fait rien, forcé d'implémenter quand même */ }
    @Override
    public void manger() { /* ne fait rien non plus */ }
}
```

```java
// ✅ APRÈS : interfaces séparées, chacune implémentée seulement si pertinente
public interface Travailleur {
    void travailler();
}

public interface EtreVivant {
    void dormir();
    void manger();
}

public class Humain implements Travailleur, EtreVivant {
    @Override public void travailler() { System.out.println("Travaille."); }
    @Override public void dormir() { System.out.println("Dort."); }
    @Override public void manger() { System.out.println("Mange."); }
}

public class Robot implements Travailleur { // n'implémente QUE ce qui a du sens pour lui
    @Override public void travailler() { System.out.println("Le robot travaille."); }
}
```

## 19.6 D — Dependency Inversion Principle (Inversion de dépendance)

<div class="encadre astuce">
<span class="encadre-titre">💡 Énoncé</span>
Les modules de haut niveau ne devraient pas dépendre directement des modules de bas niveau — les deux devraient dépendre d'une **abstraction** (interface) commune.
</div>

```java
// ❌ AVANT : NotificationService dépend directement d'une implémentation CONCRÈTE
public class EmailSender {
    public void envoyer(String message) {
        System.out.println("Email envoyé : " + message);
    }
}

public class NotificationService {
    private EmailSender emailSender = new EmailSender(); // dépendance RIGIDE et directe

    public void notifier(String message) {
        emailSender.envoyer(message);
        // Ajouter une notification par SMS exigerait de MODIFIER cette classe (viole aussi Open/Closed !)
    }
}
```

```java
// ✅ APRÈS : NotificationService dépend d'une ABSTRACTION, pas d'une implémentation précise
public interface CanalNotification {
    void envoyer(String message);
}

public class EmailSender implements CanalNotification {
    @Override
    public void envoyer(String message) {
        System.out.println("Email envoyé : " + message);
    }
}

public class SmsSender implements CanalNotification {
    @Override
    public void envoyer(String message) {
        System.out.println("SMS envoyé : " + message);
    }
}

public class NotificationService {
    private CanalNotification canal; // dépend de l'INTERFACE, pas d'une classe précise

    public NotificationService(CanalNotification canal) { // injecté depuis l'extérieur (chapitre 20 : Dependency Injection)
        this.canal = canal;
    }

    public void notifier(String message) {
        canal.envoyer(message);
    }
}
```

```java
NotificationService parEmail = new NotificationService(new EmailSender());
NotificationService parSms = new NotificationService(new SmsSender());
// Ajouter un CanalNotification par Slack, WhatsApp... n'exige AUCUNE modification de NotificationService
```

## 19.7 Diagramme UML récapitulatif — Dependency Inversion

**Inversion de dépendance appliquée**

```{.uml}
┌────────────────────┐
│ NotificationService    │
├────────────────────┤
│ - canal : CanalNotification │  ◄── dépend de l'INTERFACE, pas d'une implémentation
└────────────────────┘
           │ utilise
           ▼
┌────────────────────┐
│ «interface» CanalNotification │
└────────────────────┘
           △
    ┌──────┴───────┐
┌──────────┐  ┌──────────┐
│EmailSender │  │ SmsSender  │
└──────────┘  └──────────┘
```

## 19.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Appliquer SOLID de façon rigide et excessive dès le départ</span>
Sur une classe très simple, sans réelle perspective d'évolution (un utilitaire de calcul isolé, jamais amené à changer), créer des interfaces et des couches d'abstraction "juste au cas où" ajoute de la complexité sans bénéfice réel. SOLID s'applique surtout là où le changement et l'extension sont **probables** — c'est un guide de jugement, pas une règle mécanique à appliquer systématiquement partout.
</div>

## 19.9 Résumé du chapitre

- **S**ingle Responsibility : une classe, une seule raison de changer.
- **O**pen/Closed : extensible sans modifier le code existant (via polymorphisme/abstraction).
- **L**iskov Substitution : une classe fille ne doit jamais casser le comportement attendu de sa classe mère.
- **I**nterface Segregation : préférer plusieurs interfaces spécifiques à une seule interface trop large.
- **D**ependency Inversion : dépendre d'abstractions (interfaces), pas d'implémentations concrètes.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Identifie quel principe SOLID est violé dans ce code, et corrige-le :
```java
public class GestionnaireCommande {
    public void traiterCommande(Commande commande) {
        // valider la commande
        // calculer le total
        // enregistrer en base de données (JDBC direct ici)
        // envoyer un email de confirmation (SMTP direct ici)
    }
}
```
</div>

**Corrigé :** Violation du **Single Responsibility Principle** — la classe mélange validation, calcul, persistance et notification. Correction : séparer en `ValidateurCommande`, `CalculateurCommande`, `CommandeRepository`, `NotificationService`, chacune avec une seule responsabilité, orchestrées par `GestionnaireCommande` qui ne fait plus qu'appeler ces collaborateurs.

*Chapitre suivant : les Design Patterns, des solutions éprouvées à des problèmes de conception récurrents, souvent construites en appliquant ces mêmes principes SOLID.*
