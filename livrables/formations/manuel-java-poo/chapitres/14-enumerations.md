<div class="chapitre-titre-num">CHAPITRE 14</div>

# Les énumérations

## Objectifs pédagogiques

Comprendre pourquoi `enum` est préférable à des constantes texte/entier libres, et savoir exploiter des énumérations avec attributs et méthodes.

## 14.1 Le problème résolu par enum

```java
public class Commande {
    String statut; // ⚠️ N'IMPORTE QUELLE chaîne est acceptée, y compris des fautes de frappe
}

Commande c = new Commande();
c.statut = "EN_ATTENT"; // faute de frappe, aucune erreur détectée, bug silencieux
```

Sans `enum`, un statut représenté par une simple `String` (ou un entier "magique") n'offre **aucune garantie** : le compilateur ne peut ni vérifier les valeurs possibles, ni empêcher une faute de frappe.

## 14.2 Déclarer une énumération simple

```java
public enum StatutCommande {
    EN_ATTENTE,
    VALIDEE,
    EXPEDIEE,
    LIVREE,
    ANNULEE
}
```

```java
public class Commande {
    private StatutCommande statut;

    public Commande() {
        this.statut = StatutCommande.EN_ATTENTE;
    }

    public void valider() {
        this.statut = StatutCommande.VALIDEE;
    }
}

Commande c = new Commande();
c.statut = StatutCommande.EN_ATTENT; // ❌ Erreur de compilation : cette valeur n'existe pas dans l'enum !
```

Le compilateur garantit désormais qu'**aucune** valeur en dehors de celles listées ne peut jamais être assignée — la faute de frappe de la section 14.1 devient impossible.

## 14.3 switch sur une énumération

```java
public String decrireStatut(StatutCommande statut) {
    switch (statut) {
        case EN_ATTENTE:
            return "En attente de validation";
        case VALIDEE:
            return "Validée, en préparation";
        case EXPEDIEE:
            return "En cours de livraison";
        case LIVREE:
            return "Livrée avec succès";
        case ANNULEE:
            return "Commande annulée";
        default:
            return "Statut inconnu";
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'IDE peut vérifier l'exhaustivité d'un switch sur enum</span>
Beaucoup d'éditeurs (IntelliJ, Eclipse) avertissent si un `switch` sur une énumération **oublie** une valeur possible — un filet de sécurité précieux quand une nouvelle valeur est ajoutée à l'enum plus tard (par exemple `RETOURNEE`), rappelant automatiquement de mettre à jour tous les `switch` existants.
</div>

## 14.4 Énumération avec attributs et méthodes

Une énumération Java n'est pas qu'une simple liste de constantes : c'est une **vraie classe**, qui peut posséder des attributs, un constructeur (implicitement `private`) et des méthodes.

```java
public enum Role {
    ETUDIANT(1, "Accès limité aux cours"),
    FORMATEUR(2, "Peut créer et gérer des cours"),
    ADMIN(3, "Accès complet à la plateforme");

    private final int niveau;
    private final String description;

    // Constructeur d'enum : TOUJOURS private (implicitement), appelé une fois par constante ci-dessus
    Role(int niveau, String description) {
        this.niveau = niveau;
        this.description = description;
    }

    public int getNiveau() {
        return niveau;
    }

    public String getDescription() {
        return description;
    }

    public boolean estAuMoins(Role autre) {
        return this.niveau >= autre.niveau;
    }
}
```

```java
Role monRole = Role.FORMATEUR;
System.out.println(monRole.getDescription()); // "Peut créer et gérer des cours"
System.out.println(monRole.estAuMoins(Role.ETUDIANT)); // true : FORMATEUR (niveau 2) ≥ ETUDIANT (niveau 1)
```

## 14.5 Méthodes utiles de tout enum

```java
Role[] tousLesRoles = Role.values(); // tableau de TOUTES les constantes de l'enum, dans l'ordre déclaré
for (Role r : tousLesRoles) {
    System.out.println(r.name() + " (niveau " + r.getNiveau() + ")");
}

Role r = Role.valueOf("ADMIN"); // convertit une chaîne EXACTE en constante d'enum correspondante
System.out.println(r.ordinal()); // 2 : position (base 0) dans l'ordre de déclaration
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ valueOf() lève une exception si la chaîne ne correspond à aucune constante</span>
```java
Role r = Role.valueOf("SUPERADMIN"); // 💥 IllegalArgumentException : aucune constante de ce nom
```
Toujours valider ou entourer d'un `try/catch` un `valueOf()` recevant une chaîne provenant d'une source externe non garantie (saisie utilisateur, donnée en base de données, chapitre 26).
</div>

## 14.6 Énumération implémentant une interface

```java
public interface Taxable {
    double calculerTaxe(double montant);
}

public enum TypeClient implements Taxable {
    PARTICULIER {
        @Override
        public double calculerTaxe(double montant) {
            return montant * 0.10;
        }
    },
    ENTREPRISE {
        @Override
        public double calculerTaxe(double montant) {
            return montant * 0.18;
        }
    };
}
```

```java
TypeClient client = TypeClient.ENTREPRISE;
System.out.println(client.calculerTaxe(1000)); // 180.0
```

Chaque constante peut fournir sa **propre** implémentation d'une méthode — une forme de polymorphisme (chapitre 6) directement intégrée dans l'énumération, évitant un `switch` externe.

## 14.7 Diagramme UML d'une énumération

**Diagramme — Énumération**

```{.uml}
┌──────────────────────────────┐
│         «enumeration» Role       │
├──────────────────────────────┤
│  ETUDIANT                        │
│  FORMATEUR                       │
│  ADMIN                           │
├──────────────────────────────┤
│ - niveau : int                    │
│ - description : String            │
├──────────────────────────────┤
│ + getNiveau(): int                │
│ + estAuMoins(autre: Role): boolean │
└──────────────────────────────┘
```

## 14.8 Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours préférer enum à des constantes String/int "magiques"</span>
Dès qu'un ensemble de valeurs possibles est **fixe et connu à l'avance** (statuts, rôles, types, jours de la semaine, catégories), `enum` doit être préféré à des chaînes ou entiers libres — la sécurité de type qu'il apporte élimine une catégorie entière de bugs silencieux (rappel de la section 14.1).
</div>

## 14.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Comparer une énumération avec .equals() au lieu de ==</span>
```java
if (statut.equals(StatutCommande.VALIDEE)) { ... } // fonctionne, mais inutilement verbeux
if (statut == StatutCommande.VALIDEE) { ... }       // ✅ préféré : les constantes d'enum sont des singletons uniques
```
Contrairement aux objets classiques (chapitre 2, où `==` est déconseillé), chaque constante d'une énumération est un **singleton unique** garanti par la JVM — `==` est donc **sûr et recommandé** pour comparer des valeurs d'enum, contrairement à la règle générale sur les objets.
</div>

## 14.10 Résumé du chapitre

- `enum` garantit à la compilation qu'une variable ne peut prendre qu'une valeur parmi un ensemble fixe et connu.
- Une énumération peut avoir attributs, constructeur (implicitement privé) et méthodes — c'est une vraie classe.
- Chaque constante peut fournir sa propre implémentation d'une méthode (polymorphisme intégré à l'enum).
- `values()`, `valueOf(String)`, `name()`, `ordinal()` sont fournies automatiquement par le compilateur.
- `==` est sûr et recommandé pour comparer des constantes d'enum, contrairement à la règle générale sur les objets.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Crée un enum `JourSemaine` avec les 7 jours, un attribut `estWeekend` (booléen), et une méthode `estOuvrable()` retournant l'inverse.
</div>

**Corrigé :**
```java
public enum JourSemaine {
    LUNDI(false), MARDI(false), MERCREDI(false), JEUDI(false),
    VENDREDI(false), SAMEDI(true), DIMANCHE(true);

    private final boolean estWeekend;

    JourSemaine(boolean estWeekend) {
        this.estWeekend = estWeekend;
    }

    public boolean estOuvrable() {
        return !estWeekend;
    }
}
```

*Chapitre suivant : les génériques, pour écrire des classes et méthodes réutilisables avec n'importe quel type de données, tout en gardant la sécurité de type.*
