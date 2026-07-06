<div class="chapitre-titre-num">CHAPITRE 11</div>

# Les classes spéciales

## Objectifs pédagogiques

Comprendre les classes/méthodes `final`, les membres `static`, et les différents types de classes imbriquées (classe interne, classe statique imbriquée, classe anonyme).

## 11.1 Classe finale : interdire l'héritage

```java
public final class ConfigurationSysteme {
    // Aucune classe ne pourra jamais hériter de ConfigurationSysteme
}

public class ConfigEtendue extends ConfigurationSysteme { } // ❌ Erreur de compilation
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi interdire l'héritage volontairement</span>
Certaines classes ne doivent **jamais** être étendues, par sécurité ou cohérence de conception — `String` elle-même, dans la bibliothèque standard Java, est déclarée `final` pour garantir que son comportement (notamment son immuabilité) ne puisse jamais être altéré par une sous-classe.
</div>

## 11.2 Méthode finale : interdire la redéfinition

```java
public class Employe {
    public final double calculerBaseImposable(double salaire) { // ne pourra JAMAIS être redéfinie
        return salaire * 0.85;
    }
}

public class EmployeCommission extends Employe {
    @Override
    public double calculerBaseImposable(double salaire) { // ❌ Erreur de compilation
        return salaire;
    }
}
```

Utile pour garantir qu'une règle métier critique (un calcul réglementaire, une validation de sécurité) ne puisse **jamais** être contournée par une redéfinition dans une classe fille, même par inadvertance.

## 11.3 Attribut final : une constante d'instance

Rappel du chapitre 4 : un attribut `final` ne peut être assigné **qu'une seule fois**, généralement dans le constructeur.

```java
public class Personne {
    private final String numeroSecuriteSociale;

    public Personne(String numeroSecuriteSociale) {
        this.numeroSecuriteSociale = numeroSecuriteSociale; // première et SEULE assignation possible
    }
}
```

```java
public class Constantes {
    public static final double TAUX_TVA = 0.10; // constante VÉRITABLE : static (partagée) + final (immuable)
}

System.out.println(Constantes.TAUX_TVA); // accès direct via le nom de la classe, pas besoin d'instance
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Convention de nommage des constantes</span>
Par convention Java, une constante `static final` s'écrit **entièrement en majuscules**, mots séparés par des underscores (`TAUX_TVA`, `NOMBRE_MAX_TENTATIVES`) — une convention différente de celle des attributs classiques (`camelCase`).
</div>

## 11.4 static : membres partagés par toutes les instances

```java
public class CompteBancaire {
    private static int nombreDeComptesCrees = 0; // PARTAGÉ par TOUS les objets CompteBancaire
    private String titulaire;

    public CompteBancaire(String titulaire) {
        this.titulaire = titulaire;
        nombreDeComptesCrees++; // incrémente le compteur PARTAGÉ à chaque création
    }

    public static int getNombreDeComptesCrees() { // méthode statique : appelée sur la CLASSE, pas un objet
        return nombreDeComptesCrees;
    }
}
```

```java
new CompteBancaire("Jaslin");
new CompteBancaire("Marie");
System.out.println(CompteBancaire.getNombreDeComptesCrees()); // 2 — un SEUL compteur partagé par tous les comptes
```

**Schéma mémoire — attribut d'instance vs attribut static**

```{.uml}
  Classe CompteBancaire (une seule zone mémoire partagée)
  ┌──────────────────────────────┐
  │ nombreDeComptesCrees = 2        │ ◄── UN SEUL exemplaire, partagé
  └──────────────────────────────┘
           ▲                    ▲
           │                    │
  ┌────────────────┐   ┌────────────────┐
  │ Objet compte1     │   │ Objet compte2     │
  │ titulaire="Jaslin" │   │ titulaire="Marie" │  ◄── CHAQUE objet a SA PROPRE copie
  └────────────────┘   └────────────────┘
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une méthode static ne peut pas accéder aux attributs d'instance</span>
```java
public class CompteBancaire {
    private String titulaire; // attribut D'INSTANCE

    public static void afficherTitulaire() {
        System.out.println(titulaire); // ❌ Erreur de compilation : titulaire n'existe que pour une instance précise
    }
}
```
Une méthode `static` n'est liée à **aucun objet précis** — elle ne peut donc accéder qu'à d'autres membres `static`, jamais aux attributs ou méthodes d'instance (qui n'ont de sens que pour un objet particulier).
</div>

## 11.5 Classe interne (non statique)

Une **classe interne** est définie à l'intérieur d'une autre classe, et chaque instance de la classe interne est **liée** à une instance précise de la classe englobante.

```java
public class Ecole {
    private String nomEcole;

    public Ecole(String nomEcole) {
        this.nomEcole = nomEcole;
    }

    // Classe interne : chaque Salle "appartient" à UNE instance précise d'Ecole
    public class Salle {
        private String numero;

        public Salle(String numero) {
            this.numero = numero;
        }

        public void afficher() {
            System.out.println("Salle " + numero + " de l'école " + nomEcole); // accès direct à nomEcole !
        }
    }
}
```

```java
Ecole ecole = new Ecole("Institution Mixte Faustin");
Ecole.Salle salle = ecole.new Salle("A101"); // syntaxe particulière : liée à une instance précise d'Ecole
salle.afficher(); // "Salle A101 de l'école Institution Mixte Faustin"
```

## 11.6 Classe statique imbriquée

Contrairement à la classe interne, une classe **statique** imbriquée n'est **pas** liée à une instance de la classe englobante — c'est simplement un regroupement logique de code.

```java
public class Commande {
    private double montant;

    // Classe statique imbriquée : n'a besoin d'AUCUNE instance de Commande pour exister
    public static class StatutCommande {
        public static final String EN_ATTENTE = "EN_ATTENTE";
        public static final String VALIDEE = "VALIDEE";
        public static final String ANNULEE = "ANNULEE";
    }
}

String statut = Commande.StatutCommande.VALIDEE; // pas besoin de new Commande() pour y accéder
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Quand choisir une classe interne vs une classe statique imbriquée</span>
Si la classe imbriquée a besoin d'accéder aux attributs de la classe englobante (comme `Salle` accédant à `nomEcole`), une classe interne (non statique) est nécessaire. Si elle est juste un regroupement logique indépendant (comme des constantes de statut), une classe **statique** imbriquée est plus simple et plus légère.
</div>

## 11.7 Classe anonyme

Une **classe anonyme** est une classe sans nom, définie et instanciée en une seule expression — typiquement pour une implémentation ponctuelle d'une interface ou d'une classe abstraite, utilisée une seule fois.

```java
public interface Operation {
    int appliquer(int a, int b);
}

public class Calculatrice {
    public static void main(String[] args) {
        // Classe anonyme : implémente Operation SUR PLACE, sans jamais créer de fichier/classe nommée
        Operation addition = new Operation() {
            @Override
            public int appliquer(int a, int b) {
                return a + b;
            }
        };

        System.out.println(addition.appliquer(2, 3)); // 5
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le lien avec les lambdas du chapitre 16</span>
Rappel de l'aperçu au chapitre 8 : pour une **interface fonctionnelle** (une seule méthode abstraite, comme `Operation` ci-dessus), une expression lambda (`(a, b) -> a + b`) remplace avantageusement une classe anonyme, en bien plus concis. Les classes anonymes restent nécessaires pour implémenter une interface avec **plusieurs** méthodes, ou une classe abstraite.
</div>

## 11.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser une classe interne (non statique) sans besoin réel d'accès à l'englobante</span>
Créer une classe interne "par habitude" alors qu'elle n'accède jamais aux attributs de la classe englobante ajoute une complexité inutile (syntaxe `outer.new Inner()`) sans aucun bénéfice — une classe statique imbriquée ou une classe top-level séparée conviendrait mieux dans ce cas.
</div>

## 11.9 Résumé du chapitre

- `final` sur une classe interdit l'héritage ; sur une méthode, interdit la redéfinition ; sur un attribut, impose une seule assignation.
- `static` définit un membre **partagé** par toutes les instances (ou indépendant de toute instance) — inaccessible aux attributs/méthodes d'instance.
- Une **classe interne** est liée à une instance précise de sa classe englobante ; une **classe statique imbriquée** ne l'est pas.
- Une **classe anonyme** implémente une interface/classe abstraite en une seule expression, pour un usage ponctuel — souvent remplacée par une lambda pour les interfaces fonctionnelles (chapitre 16).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Ajoute à une classe `Produit` un compteur statique `nombreTotalProduits`, incrémenté à chaque création, avec une méthode statique pour le consulter.
</div>

**Corrigé :**
```java
public class Produit {
    private static int nombreTotalProduits = 0;
    private String nom;

    public Produit(String nom) {
        this.nom = nom;
        nombreTotalProduits++;
    }

    public static int getNombreTotalProduits() {
        return nombreTotalProduits;
    }
}
```

*Ceci clôt la Partie 3 (organisation du code). Chapitre suivant : les exceptions, pour gérer proprement les erreurs d'exécution.*
