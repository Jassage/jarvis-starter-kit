<div class="chapitre-titre-num">CHAPITRE 22</div>

# Exercices pratiques — 10 études de cas

## Objectifs pédagogiques

Appliquer l'ensemble des notions des chapitres 1 à 21 (classes, héritage, polymorphisme, abstraction, interfaces, exceptions, collections, enums) sur dix domaines métier différents, sous forme d'études de cas structurées : diagramme de classes, code clé commenté, explication des choix de conception.

<div class="encadre astuce">
<span class="encadre-titre">💡 Format de ce chapitre</span>
Contrairement aux chapitres précédents, chaque étude de cas ci-dessous est **volontairement condensée** : un diagramme de classes, l'extrait de code le plus représentatif, et une explication des choix de conception — sans redémontrer les concepts déjà couverts en détail. L'objectif est de voir les mêmes principes **se répéter** sur des domaines variés, jusqu'à devenir des réflexes. Les projets complets avec menus interactifs et persistance sont traités séparément aux chapitres 23 et 31.
</div>

## 22.1 Gestion d'une bibliothèque

**Diagramme de classes — Bibliothèque**

```{.uml}
┌─────────────┐        ┌─────────────┐
│    Livre        │        │   Membre        │
├─────────────┤        ├─────────────┤
│ - titre          │        │ - nom             │
│ - disponible     │        │ - emprunts : List&lt;Emprunt&gt; │
├─────────────┤        └─────────────┘
│+emprunter()      │              │ 1
│+retourner()      │              │
└─────────────┘              ◇ 0..*
      │ 1                        │
      │                          ▼
      ◇ 0..*              ┌─────────────┐
      └─────────────────►│    Emprunt      │
                          ├─────────────┤
                          │ - dateEmprunt   │
                          └─────────────┘
```

**Choix de conception :** `Emprunt` matérialise la relation entre `Membre` et `Livre` (une association enrichie d'attributs, comme `dateEmprunt`) — une relation directe `Membre`↔`Livre` sans classe intermédiaire ne pourrait pas stocker cette date proprement.

```java
public class Livre {
    private String titre;
    private boolean disponible = true;

    public void emprunter() {
        if (!disponible) throw new IllegalStateException("Livre déjà emprunté");
        disponible = false;
    }

    public void retourner() {
        disponible = true;
    }
}
```

## 22.2 Gestion d'une école

**Diagramme de classes — École**

```{.uml}
┌─────────────────┐
│  «abstract» Personne │
├─────────────────┤
│ # nom : String        │
└─────────────────┘
        △
   ┌────┴────┐
┌─────────┐ ┌─────────────┐
│ Etudiant   │ │ Professeur     │
├─────────┤ ├─────────────┤
│-notes:List&lt;Double&gt;│ │-matiere       │
├─────────┤ └─────────────┘
│+calculerMoyenne()│
└─────────┘
```

**Choix de conception :** `Personne` (abstraite, chapitre 7) factorise `nom`, commun à `Etudiant` et `Professeur` — un héritage classique (chapitre 5) puisque les deux sont bien des "Personne" au sens strict (relation "est un" valide, rappel du principe de Liskov, chapitre 19).

```java
public abstract class Personne {
    protected String nom;
    public Personne(String nom) { this.nom = nom; }
}

public class Etudiant extends Personne {
    private List<Double> notes = new ArrayList<>();

    public Etudiant(String nom) { super(nom); }

    public void ajouterNote(double note) { notes.add(note); }

    public double calculerMoyenne() {
        return notes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
}
```

## 22.3 Gestion d'un hôpital

**Diagramme de classes — Hôpital**

```{.uml}
┌─────────────┐    1        0..*  ┌─────────────┐
│   Medecin       │◄───────────────┤ Consultation    │
├─────────────┤                   ├─────────────┤
│ - specialite     │                   │ - date          │
└─────────────┘                   │ - diagnostic    │
                                   └─────────────┘
                                          │ 0..*      1
                                          └───────────►┌─────────┐
                                                        │ Patient    │
                                                        ├─────────┤
                                                        │-dossierMedical│
                                                        └─────────┘
```

**Choix de conception :** `Consultation` relie `Medecin` et `Patient` (comme `Emprunt` en 22.1) ; l'énumération (chapitre 14) modélise naturellement un statut fermé :

```java
public enum StatutConsultation { PLANIFIEE, EN_COURS, TERMINEE, ANNULEE }

public class Consultation {
    private LocalDate date;
    private String diagnostic;
    private StatutConsultation statut = StatutConsultation.PLANIFIEE;

    public void terminer(String diagnostic) {
        this.diagnostic = diagnostic;
        this.statut = StatutConsultation.TERMINEE;
    }
}
```

## 22.4 Gestion bancaire

**Diagramme de classes — Banque**

```{.uml}
┌─────────────────┐
│ «abstract» CompteBancaire │
├─────────────────┤
│ # solde : double      │
├─────────────────┤
│+deposer()             │
│+retirer(): void {abstrait} │
└─────────────────┘
        △
   ┌────┴─────┐
┌─────────┐ ┌──────────┐
│CompteEpargne│ │CompteCourant │
├─────────┤ ├──────────┤
│-tauxInteret│ │-decouvertAutorise│
└─────────┘ └──────────┘
```

**Choix de conception :** `retirer()` est **abstraite** (chapitre 7) car sa règle diffère réellement : `CompteEpargne` refuse tout découvert, `CompteCourant` l'autorise jusqu'à une limite — exactement le genre de variation que le polymorphisme (chapitre 6) gère sans `instanceof`.

```java
public abstract class CompteBancaire {
    protected double solde;
    public void deposer(double montant) { solde += montant; }
    public abstract void retirer(double montant);
}

public class CompteCourant extends CompteBancaire {
    private double decouvertAutorise;

    @Override
    public void retirer(double montant) {
        if (solde - montant < -decouvertAutorise) {
            throw new IllegalStateException("Découvert maximum dépassé");
        }
        solde -= montant;
    }
}
```

## 22.5 Gestion d'un magasin

**Diagramme de classes — Magasin**

```{.uml}
┌─────────┐  1    ◆   1..*  ┌─────────────┐
│  Vente     │───────────────►│ LigneVente      │
├─────────┤                ├─────────────┤
│-dateVente  │                │ - quantite      │
└─────────┘                └─────────────┘
                                   │ 0..*      1
                                   └──────────►┌─────────┐
                                               │ Produit    │
                                               ├─────────┤
                                               │-stock      │
                                               └─────────┘
```

**Choix de conception :** `Vente`◆`LigneVente` est une **composition** (chapitre 18) — une ligne de vente n'a aucun sens sans sa vente ; `LigneVente`─`Produit` reste une simple association, le produit existant indépendamment des ventes qui le référencent.

```java
public class LigneVente {
    private Produit produit;
    private int quantite;

    public double calculerSousTotal() {
        return produit.getPrix() * quantite;
    }
}

public class Vente {
    private List<LigneVente> lignes = new ArrayList<>();

    public double calculerTotal() {
        return lignes.stream().mapToDouble(LigneVente::calculerSousTotal).sum(); // Streams, chapitre 17
    }
}
```

## 22.6 Gestion d'un hôtel

**Diagramme de classes — Hôtel**

```{.uml}
┌─────────┐   1        0..*  ┌─────────────┐
│  Chambre   │◄──────────────────┤ Reservation     │
├─────────┤                   ├─────────────┤
│ - numero    │                   │ - dateArrivee   │
│ - type       │                   │ - dateDepart    │
├─────────┤                   └─────────────┘
│+estDisponible(date)│
└─────────┘
```

**Choix de conception :** `estDisponible(LocalDate date)` illustre une **méthode métier non triviale** qui parcourt les réservations existantes de la chambre — un bon exemple où déléguer la logique à la classe concernée (`Chambre`) plutôt qu'à un service externe reste cohérent avec l'encapsulation (chapitre 4).

```java
public enum TypeChambre { SIMPLE, DOUBLE, SUITE }

public class Chambre {
    private String numero;
    private TypeChambre type;
    private List<Reservation> reservations = new ArrayList<>();

    public boolean estDisponible(LocalDate arrivee, LocalDate depart) {
        return reservations.stream().noneMatch(r -> r.chevauche(arrivee, depart));
    }
}
```

## 22.7 Gestion d'un restaurant

**Diagramme de classes — Restaurant**

```{.uml}
┌─────────┐   1    ◆    1..*  ┌─────────────┐
│Commande    │──────────────────►│ItemCommande     │
├─────────┤                   ├─────────────┤
│-tableNumero │                   │ - quantite      │
└─────────┘                   └─────────────┘
                                      │ 0..*     1
                                      └─────────►┌──────────┐
                                                 │ PlatMenu    │
                                                 ├──────────┤
                                                 │-tempsPreparation│
                                                 └──────────┘
```

**Choix de conception :** structure quasiment identique au magasin (22.5) — bonne illustration que **le même patron de conception** (composition Commande/Item + association vers un catalogue) s'applique à des domaines métier différents, un signe de la valeur réelle de la modélisation orientée objet.

```java
public class ItemCommande {
    private PlatMenu plat;
    private int quantite;
    private String instructionsSpeciales; // "sans oignon", propre au restaurant
}
```

## 22.8 Gestion des employés

**Diagramme de classes — Employés**

```{.uml}
┌─────────────────┐
│  «abstract» Employe   │
├─────────────────┤
│+calculerSalaire(): double {abstrait}│
└─────────────────┘
        △
   ┌────┴─────┐
┌───────────┐ ┌──────────────┐
│EmployeCommission│ │EmployeHoraire  │
└───────────┘ └──────────────┘
```

**Choix de conception :** cas déjà traité en détail au chapitre 6 (polymorphisme) — repris ici pour mémoire, comme rappel que ces 10 études de cas ne sont pas indépendantes des chapitres précédents, mais leur application répétée.

```java
public abstract class Employe {
    public abstract double calculerSalaire();
}
```

## 22.9 Gestion des véhicules

**Diagramme de classes — Véhicules**

```{.uml}
┌─────────────┐
│  «interface» Assurable │
├─────────────┤
│+calculerPrimeAssurance(): double│
└─────────────┘
        ▲┊
   ┌────┴─────┐
┌─────────┐ ┌──────────┐
│  Voiture   │ │   Moto      │
└─────────┘ └──────────┘
```

**Choix de conception :** `Assurable` est une **interface** (chapitre 8), pas une classe abstraite — le calcul de prime d'assurance est un **contrat de capacité** transversal, potentiellement partagé avec d'autres types d'objets assurables (une `Maison`, sans lien de hiérarchie avec les véhicules), justifiant une interface plutôt qu'une classe mère commune.

```java
public interface Assurable {
    double calculerPrimeAssurance();
}

public class Voiture implements Assurable {
    private double valeur;
    private int anneeFabrication;

    @Override
    public double calculerPrimeAssurance() {
        int age = LocalDate.now().getYear() - anneeFabrication;
        return valeur * (age > 10 ? 0.03 : 0.05); // véhicule plus ancien = prime relative plus faible
    }
}
```

## 22.10 Gestion d'un cinéma

**Diagramme de classes — Cinéma**

```{.uml}
┌─────────┐  1    ◆   1..*  ┌─────────────┐
│Seance      │───────────────►│  Reservation    │
├─────────┤                ├─────────────┤
│-film        │                │-siegeNumero     │
│-salle       │                └─────────────┘
└─────────┘
```

**Choix de conception :** `Seance`◆`Reservation` (composition) modélise qu'une réservation de siège n'a de sens que pour une séance précise ; la disponibilité d'un siège se vérifie en filtrant les réservations existantes de la séance (même logique Streams qu'en 22.6) :

```java
public class Seance {
    private List<Reservation> reservations = new ArrayList<>();

    public boolean siegeDisponible(int numeroSiege) {
        return reservations.stream().noneMatch(r -> r.getSiegeNumero() == numeroSiege);
    }
}
```

## 22.11 Synthèse : les patrons récurrents observés

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce que ces 10 études de cas révèlent</span>
Malgré des domaines métier très différents, trois structures reviennent constamment :
1. **Hiérarchie + polymorphisme** (école, banque, employés, véhicules) : une classe mère/interface commune, des comportements spécialisés par sous-type.
2. **Composition Commande/Item** (magasin, restaurant, cinéma) : un objet "conteneur" composé de lignes, chacune référençant un élément de catalogue.
3. **Association enrichie via une classe intermédiaire** (bibliothèque, hôpital, hôtel) : une relation entre deux entités qui porte elle-même des données (date, statut).
Reconnaître ces patrons face à un nouveau problème accélère considérablement la phase de conception.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

En t'inspirant du patron "Composition Commande/Item" (sections 22.5, 22.7, 22.10), modélise un système de gestion de factures pour une entreprise de services (une `Facture` contient plusieurs `LignePrestation`, chacune référençant un `TypePrestation` du catalogue de l'entreprise). Propose le diagramme de classes et le code de la méthode de calcul du total.
</div>

**Corrigé :**
```java
public class LignePrestation {
    private TypePrestation type;
    private double heuresFacturees;

    public double calculerMontant() {
        return type.getTauxHoraire() * heuresFacturees;
    }
}

public class Facture {
    private List<LignePrestation> lignes = new ArrayList<>();

    public double calculerTotal() {
        return lignes.stream().mapToDouble(LignePrestation::calculerMontant).sum();
    }
}
```

*Chapitre suivant : le projet final POO complet, qui assemble l'ensemble de ces notions dans une application de gestion de bibliothèque avec architecture en couches, menus interactifs et diagrammes UML complets.*
