<div class="chapitre-titre-num">CHAPITRE 44</div>

# Les principes SOLID

## Objectifs pédagogiques

À la fin de ce chapitre, tu connaîtras les cinq principes SOLID, chacun illustré par un problème concret, pour écrire un code orienté objet plus facile à maintenir et à faire évoluer sans le casser.

## A. Le problème

Le chapitre 43 a donné des habitudes générales de bon code. **SOLID** va plus loin : cinq principes précis, spécifiques à la Programmation Orientée Objet, formalisés par des développeurs expérimentés après avoir observé, encore et encore, les mêmes erreurs de conception se répéter sur de vrais projets.

## B. Explication très simple

> **SOLID** est un acronyme regroupant cinq principes de conception orientée objet — chaque lettre représente un principe, chacun résolvant un problème récurrent bien précis.

```text
S — Single Responsibility     (Responsabilité unique)
O — Open/Closed                (Ouvert/Fermé)
L — Liskov Substitution        (Substitution de Liskov)
I — Interface Segregation      (Ségrégation des interfaces)
D — Dependency Inversion       (Inversion de dépendance)
```

Pour chacun, on suit la même démarche : mauvais code → le problème qu'il cause → l'amélioration → le bon code.

## S — Responsabilité unique

> Une classe ne devrait avoir qu'**une seule raison de changer**.

**Mauvais code :**
```java
class Employe {
    double calculerSalaireNet() { return 0; /* ... */ }
    void sauvegarderEnBase() { /* SQL directement ici */ }
    String genererFichePDF() { /* génération PDF ici */ return ""; }
}
```

**Problème :** cette classe mélange trois raisons de changer complètement différentes (une règle de calcul de salaire, une technologie de base de données, un format de document). Modifier l'une de ces trois choses risque d'impacter, par erreur, les deux autres.

**Amélioration :** exactement le principe déjà appliqué au chapitre 36 (organisation en packages) — séparer chaque responsabilité dans sa propre classe.

**Bon code :**
```java
class Employe {
    double calculerSalaireNet() { return 0; /* ... */ }
}
class EmployeDAO { // rappel du chapitre 35
    void sauvegarder(Employe e) { /* SQL ici, et SEULEMENT ici */ }
}
class FicheDePaieGenerator {
    String genererPDF(Employe e) { return ""; }
}
```

## O — Ouvert/Fermé

> Une classe devrait être **ouverte à l'extension**, mais **fermée à la modification**.

**Mauvais code :**
```java
double calculerAireTotale(List<Object> formes) {
    double total = 0;
    for (Object forme : formes) {
        if (forme instanceof Cercle c) {
            total += Math.PI * c.rayon * c.rayon;
        } else if (forme instanceof Carre ca) {
            total += ca.cote * ca.cote;
        }
        // ajouter un Triangle exigerait de MODIFIER cette méthode !
    }
    return total;
}
```

**Problème :** chaque nouvelle forme oblige à modifier une méthode qui **fonctionnait déjà**, avec le risque d'y introduire un bug, même pour un changement qui ne devrait concerner qu'un nouveau cas.

**Amélioration :** remplacer les `instanceof` en cascade par le polymorphisme, déjà vu au chapitre 13.

**Bon code :**
```java
abstract class Forme {
    abstract double calculerAire();
}

double calculerAireTotale(List<Forme> formes) {
    double total = 0;
    for (Forme forme : formes) {
        total += forme.calculerAire(); // AUCUNE modification nécessaire, quel que soit le type
    }
    return total;
}
// Ajouter Triangle n'exige QUE d'écrire "class Triangle extends Forme", sans toucher au reste
```

## L — Substitution de Liskov

> Un objet d'une classe fille doit pouvoir **remplacer** un objet de sa classe mère sans casser le comportement attendu.

**Mauvais code :**
```java
class Rectangle {
    protected double largeur, hauteur;
    void setLargeur(double l) { largeur = l; }
    void setHauteur(double h) { hauteur = h; }
    double calculerAire() { return largeur * hauteur; }
}

class Carre extends Rectangle {
    @Override
    void setLargeur(double l) {
        largeur = l;
        hauteur = l; // ⚠️ un effet de bord INATTENDU pour qui utilise un Rectangle générique
    }
}
```

**Problème :**
```java
void testerRectangle(Rectangle r) {
    r.setLargeur(5);
    r.setHauteur(10);
    System.out.println(r.calculerAire()); // 50 attendu... mais 100 avec un Carre !
}
```

Ce code s'attend à ce que **n'importe quel** `Rectangle` se comporte pareil ; un `Carre` viole silencieusement cette attente.

**Amélioration :** ne pas forcer une relation d'héritage juste parce qu'elle "semble" logique mathématiquement — retour au test "EST UN" comportemental du chapitre 12.

**Bon code :**
```java
abstract class Forme {
    abstract double calculerAire();
}
class Rectangle extends Forme {
    private double largeur, hauteur;
    @Override double calculerAire() { return largeur * hauteur; }
}
class Carre extends Forme { // n'hérite PLUS de Rectangle
    private double cote;
    @Override double calculerAire() { return cote * cote; }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 "Un carré est un rectangle" en maths, pas toujours en POO</span>
Mathématiquement vrai, mais l'héritage en POO exige une compatibilité de <strong>comportement</strong>, pas seulement conceptuelle. C'est l'exemple le plus classique pour illustrer ce principe.
</div>

## I — Ségrégation des interfaces

> Mieux vaut plusieurs interfaces **petites et spécifiques** qu'une seule grande interface imposant des méthodes inutiles.

**Mauvais code :**
```java
interface Travailleur {
    void travailler();
    void dormir();  // ⚠️ un Robot ne dort JAMAIS
    void manger();  // ⚠️ un Robot ne mange JAMAIS
}

class Robot implements Travailleur {
    public void travailler() { System.out.println("Le robot travaille."); }
    public void dormir() { }  // forcé d'implémenter, pour rien
    public void manger() { }  // idem
}
```

**Problème :** `Robot` doit fournir des méthodes qui n'ont **aucun sens** pour lui, uniquement parce que l'interface les impose à tout le monde.

**Bon code :**
```java
interface Travailleur { void travailler(); }
interface EtreVivant { void dormir(); void manger(); }

class Humain implements Travailleur, EtreVivant { /* implémente les 3 */ }
class Robot implements Travailleur { /* n'implémente QUE ce qui a du sens pour lui */
    public void travailler() { System.out.println("Le robot travaille."); }
}
```

## D — Inversion de dépendance

> Un module ne devrait pas dépendre directement d'un autre module concret — les deux devraient dépendre d'une **abstraction** (interface) commune.

**Mauvais code :**
```java
class EmailSender {
    void envoyer(String message) { System.out.println("Email : " + message); }
}

class NotificationService {
    private EmailSender emailSender = new EmailSender(); // dépendance RIGIDE

    void notifier(String message) {
        emailSender.envoyer(message);
        // ajouter un SMS exigerait de MODIFIER cette classe (viole aussi Open/Closed !)
    }
}
```

**Problème :** `NotificationService` est "collé" à `EmailSender` — impossible d'ajouter un autre canal sans modifier son code.

**Bon code :**
```java
interface CanalNotification { void envoyer(String message); }

class EmailSender implements CanalNotification {
    public void envoyer(String message) { System.out.println("Email : " + message); }
}
class SmsSender implements CanalNotification {
    public void envoyer(String message) { System.out.println("SMS : " + message); }
}

class NotificationService {
    private CanalNotification canal; // dépend de l'INTERFACE, pas d'une implémentation précise

    NotificationService(CanalNotification canal) { // reçu depuis l'extérieur
        this.canal = canal;
    }

    void notifier(String message) {
        canal.envoyer(message);
    }
}
```

```java
NotificationService parEmail = new NotificationService(new EmailSender());
NotificationService parSms = new NotificationService(new SmsSender());
// Ajouter Slack, WhatsApp... n'exige AUCUNE modification de NotificationService !
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Injection de dépendance</span>
Recevoir une dépendance (ici, <code>canal</code>) depuis <strong>l'extérieur</strong> plutôt que de la créer soi-même avec <code>new</code>, comme dans le constructeur de <code>NotificationService</code> ci-dessus, s'appelle l'<strong>injection de dépendance</strong>. C'est exactement le même mécanisme déjà utilisé, sans le nommer, avec les `Repository` du chapitre 38.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Appliquer SOLID de façon rigide, même sur du code très simple</span>
Sur un petit utilitaire de calcul isolé, sans aucune perspective réelle d'évolution, créer des interfaces et des abstractions "juste au cas où" ajoute de la complexité sans bénéfice concret. SOLID est un guide de jugement pour du code amené à évoluer, pas une règle mécanique à appliquer partout, systématiquement.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je connais les 5 principes SOLID et le problème que chacun résout.
✓ Je sais repérer une classe qui viole la responsabilité unique.
✓ Je sais remplacer une chaîne de instanceof par du polymorphisme (Open/Closed).
✓ Je sais reconnaître un héritage qui viole Liskov.
✓ Je sais préférer plusieurs petites interfaces à une seule trop large.
✓ Je sais dépendre d'une interface plutôt que d'une implémentation concrète.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Quel principe SOLID est violé ici, et pourquoi ?

```java
class GestionnaireCommande {
    void traiterCommande(Commande commande) {
        // valide, calcule le total, enregistre en base ET envoie un email — tout ici
    }
}
```
</div>

## Correction

Violation du **principe de responsabilité unique** : cette classe mélange validation, calcul, persistance et notification — quatre raisons de changer complètement différentes, regroupées dans une seule classe.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Ce code viole le principe d'inversion de dépendance. Corrige-le en introduisant une interface.

```java
class RapportPDF {
    void genererEnPDF() { /* ... */ }
}

class GenerateurRapport {
    private RapportPDF rapport = new RapportPDF(); // dépendance rigide

    void generer() {
        rapport.genererEnPDF();
    }
}
```
</div>

### Corrigé du défi

```java
interface FormatRapport {
    void generer();
}

class RapportPDF implements FormatRapport {
    public void generer() { /* génération PDF */ }
}

class RapportExcel implements FormatRapport {
    public void generer() { /* génération Excel */ }
}

class GenerateurRapport {
    private FormatRapport format;

    GenerateurRapport(FormatRapport format) {
        this.format = format;
    }

    void generer() {
        format.generer();
    }
}
```

## Résumé du chapitre

- **S**ingle Responsibility : une classe, une seule raison de changer.
- **O**pen/Closed : extensible via polymorphisme, sans modifier le code existant.
- **L**iskov Substitution : une classe fille ne doit jamais casser le comportement attendu de sa classe mère.
- **I**nterface Segregation : préférer plusieurs interfaces spécifiques à une seule trop large.
- **D**ependency Inversion : dépendre d'abstractions (interfaces), pas d'implémentations concrètes.

---

# 🎓 Révision de la Partie 16 — SOLID

## Question de révision

Pourquoi le principe Open/Closed et le principe de Dependency Inversion sont-ils souvent liés dans la pratique (comme dans l'exemple `NotificationService`) ?

**Réponse :** Parce que dépendre d'une interface (Dependency Inversion) est justement ce qui permet d'ajouter un nouveau comportement (un nouveau canal, une nouvelle forme) sans modifier le code existant (Open/Closed) — les deux principes se renforcent mutuellement autour de l'utilisation du polymorphisme et des interfaces.

---

*Chapitre suivant : les Design Patterns, des solutions éprouvées à des problèmes de conception récurrents, construites en s'appuyant sur ces mêmes principes SOLID.*
