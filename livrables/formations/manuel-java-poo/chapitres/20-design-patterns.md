<div class="chapitre-titre-num">CHAPITRE 20</div>

# Les Design Patterns

## Objectifs pédagogiques

Connaître neuf design patterns parmi les plus utilisés en Java, comprendre le problème que chacun résout, et savoir l'implémenter dans un cas concret.

## 20.1 Qu'est-ce qu'un Design Pattern

Un **design pattern** (patron de conception) est une solution **éprouvée et réutilisable** à un problème de conception qui revient régulièrement — pas du code à copier-coller tel quel, mais une **structure d'organisation des classes** à adapter à chaque contexte.

## 20.2 Singleton : garantir une instance unique

**Problème résolu :** certaines ressources (configuration globale, connexion partagée) ne doivent exister qu'en **un seul exemplaire** dans toute l'application.

```java
public class ConfigurationApplication {
    private static ConfigurationApplication instanceUnique; // référence STATIQUE, partagée par toute l'appli
    private String urlBaseDeDonnees;

    private ConfigurationApplication() { // constructeur PRIVÉ : empêche new ConfigurationApplication() ailleurs
        this.urlBaseDeDonnees = "jdbc:mysql://localhost:3306/minicours";
    }

    public static ConfigurationApplication getInstance() {
        if (instanceUnique == null) {
            instanceUnique = new ConfigurationApplication(); // créée UNE SEULE FOIS, au premier appel
        }
        return instanceUnique;
    }

    public String getUrlBaseDeDonnees() {
        return urlBaseDeDonnees;
    }
}
```

```java
ConfigurationApplication config1 = ConfigurationApplication.getInstance();
ConfigurationApplication config2 = ConfigurationApplication.getInstance();
System.out.println(config1 == config2); // true : c'est LITTÉRALEMENT le même objet
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le Singleton est un pattern controversé, à utiliser avec parcimonie</span>
Le Singleton introduit un **état global** dans l'application, ce qui complique les tests (impossible de facilement remplacer l'instance par une version simulée pour un test unitaire) et crée une dépendance cachée non visible dans les signatures de méthodes. L'injection de dépendances (section 20.9) est souvent préférée en conception moderne, y compris pour les cas qui semblent, à première vue, appeler un Singleton.
</div>

## 20.3 Factory : centraliser la création d'objets

**Problème résolu :** la logique de **choix** de quelle classe concrète instancier ne devrait pas être dispersée dans tout le code appelant.

```java
public interface Notification {
    void envoyer(String message);
}

public class NotificationEmail implements Notification {
    @Override
    public void envoyer(String message) { System.out.println("Email : " + message); }
}

public class NotificationSMS implements Notification {
    @Override
    public void envoyer(String message) { System.out.println("SMS : " + message); }
}

public class NotificationFactory {
    public static Notification creer(String type) {
        return switch (type) {
            case "EMAIL" -> new NotificationEmail();
            case "SMS" -> new NotificationSMS();
            default -> throw new IllegalArgumentException("Type inconnu : " + type);
        };
    }
}
```

```java
Notification notif = NotificationFactory.creer("EMAIL"); // le code appelant ne connaît AUCUNE classe concrète
notif.envoyer("Votre commande est confirmée");
```

## 20.4 Builder : construire un objet complexe étape par étape

**Problème résolu :** un constructeur avec de nombreux paramètres (surtout optionnels) devient illisible et sujet aux erreurs d'ordre.

```java
// ❌ Constructeur télescope : illisible, ordre des paramètres facilement confondu
Etudiant e = new Etudiant("Jaslin", 22, "MAT001", "Informatique", true, "Bourse", null);
```

```java
public class Etudiant {
    private final String nom;
    private final int age;
    private final String filiere;
    private final boolean boursier;

    private Etudiant(Builder builder) { // constructeur PRIVÉ, appelé uniquement par le Builder
        this.nom = builder.nom;
        this.age = builder.age;
        this.filiere = builder.filiere;
        this.boursier = builder.boursier;
    }

    public static class Builder {
        private String nom;
        private int age;
        private String filiere;
        private boolean boursier = false; // valeur par défaut raisonnable

        public Builder nom(String nom) { this.nom = nom; return this; } // retourne "this" : chaînage fluide
        public Builder age(int age) { this.age = age; return this; }
        public Builder filiere(String filiere) { this.filiere = filiere; return this; }
        public Builder boursier(boolean boursier) { this.boursier = boursier; return this; }

        public Etudiant build() {
            return new Etudiant(this);
        }
    }
}
```

```java
// ✅ Lisible, ordre libre, valeurs optionnelles clairement identifiées
Etudiant e = new Etudiant.Builder()
    .nom("Jaslin")
    .age(22)
    .filiere("Informatique")
    .boursier(true)
    .build();
```

## 20.5 Strategy : rendre un algorithme interchangeable

**Problème résolu :** éviter un grand `if`/`switch` pour choisir un comportement, en le rendant substituable à l'exécution (application directe du principe Open/Closed, chapitre 19).

```java
public interface StrategiePaiement {
    void payer(double montant);
}

public class PaiementCarte implements StrategiePaiement {
    @Override
    public void payer(double montant) { System.out.println("Paiement par carte : " + montant); }
}

public class PaiementMonCash implements StrategiePaiement {
    @Override
    public void payer(double montant) { System.out.println("Paiement MonCash : " + montant); }
}

public class Commande {
    private StrategiePaiement strategiePaiement;

    public void definirModePaiement(StrategiePaiement strategie) { // change de comportement À L'EXÉCUTION
        this.strategiePaiement = strategie;
    }

    public void payer(double montant) {
        strategiePaiement.payer(montant);
    }
}
```

```java
Commande commande = new Commande();
commande.definirModePaiement(new PaiementMonCash());
commande.payer(1500);
```

## 20.6 Observer : notifier automatiquement des changements

**Problème résolu :** plusieurs objets doivent être **informés automatiquement** quand l'état d'un autre objet change, sans être fortement couplés entre eux.

```java
public interface Observateur {
    void notifier(String evenement);
}

public class Commande {
    private List<Observateur> observateurs = new ArrayList<>();

    public void ajouterObservateur(Observateur o) {
        observateurs.add(o);
    }

    public void changerStatut(String nouveauStatut) {
        for (Observateur o : observateurs) {
            o.notifier("Statut changé : " + nouveauStatut); // notifie TOUS les observateurs enregistrés
        }
    }
}

public class ServiceEmail implements Observateur {
    @Override
    public void notifier(String evenement) {
        System.out.println("[Email] " + evenement);
    }
}

public class ServiceSMS implements Observateur {
    @Override
    public void notifier(String evenement) {
        System.out.println("[SMS] " + evenement);
    }
}
```

```java
Commande commande = new Commande();
commande.ajouterObservateur(new ServiceEmail());
commande.ajouterObservateur(new ServiceSMS());
commande.changerStatut("EXPEDIEE"); // les DEUX services sont notifiés automatiquement
```

## 20.7 Adapter : rendre compatibles deux interfaces incompatibles

**Problème résolu :** intégrer une classe existante (souvent externe, non modifiable) dont l'interface ne correspond pas à celle attendue par le reste du code.

```java
// Classe EXISTANTE, non modifiable (par exemple, une librairie tierce)
public class LecteurCSVExterne {
    public String[] lireLigneCSV(String ligne) {
        return ligne.split(",");
    }
}

// Interface ATTENDUE par le reste de l'application
public interface LecteurDonnees {
    List<String> lireDonnees(String source);
}

// L'ADAPTATEUR fait le pont entre les deux, sans modifier LecteurCSVExterne
public class AdaptateurCSV implements LecteurDonnees {
    private LecteurCSVExterne lecteurExterne = new LecteurCSVExterne();

    @Override
    public List<String> lireDonnees(String source) {
        String[] valeurs = lecteurExterne.lireLigneCSV(source);
        return Arrays.asList(valeurs);
    }
}
```

## 20.8 Decorator : ajouter des comportements dynamiquement

**Problème résolu :** ajouter des fonctionnalités à un objet **sans** modifier sa classe ni créer une explosion de sous-classes pour chaque combinaison possible.

```java
public interface Cafe {
    double getPrix();
    String getDescription();
}

public class CafeSimple implements Cafe {
    @Override
    public double getPrix() { return 50; }
    @Override
    public String getDescription() { return "Café"; }
}

public abstract class DecorateurCafe implements Cafe {
    protected Cafe cafeDecore; // enveloppe un AUTRE Cafe (composition, chapitre 18)

    public DecorateurCafe(Cafe cafeDecore) {
        this.cafeDecore = cafeDecore;
    }
}

public class AvecLait extends DecorateurCafe {
    public AvecLait(Cafe cafeDecore) { super(cafeDecore); }

    @Override
    public double getPrix() { return cafeDecore.getPrix() + 15; }
    @Override
    public String getDescription() { return cafeDecore.getDescription() + " + Lait"; }
}

public class AvecSucre extends DecorateurCafe {
    public AvecSucre(Cafe cafeDecore) { super(cafeDecore); }

    @Override
    public double getPrix() { return cafeDecore.getPrix() + 5; }
    @Override
    public String getDescription() { return cafeDecore.getDescription() + " + Sucre"; }
}
```

```java
Cafe commande = new AvecSucre(new AvecLait(new CafeSimple())); // empile les décorateurs dynamiquement
System.out.println(commande.getDescription() + " : " + commande.getPrix());
// "Café + Lait + Sucre : 70.0"
```

## 20.9 MVC : séparer données, logique et affichage

**Problème résolu :** éviter de mélanger la logique métier, les données et l'affichage dans une même classe (rappel direct du Single Responsibility Principle, chapitre 19).

**Architecture MVC**

```{.uml}
┌─────────┐        ┌─────────────┐        ┌─────────┐
│   Vue      │◄───────│  Contrôleur    │───────►│  Modèle    │
│ (affichage)│        │ (orchestration)│        │ (données + │
│            │───────►│                │◄───────│  logique)  │
└─────────┘        └─────────────┘        └─────────┘
     ▲ utilisateur interagit avec la Vue, qui transmet au Contrôleur
```

- **Modèle** : les données et la logique métier (les classes `Etudiant`, `Cours` du reste de ce manuel).
- **Vue** : la présentation à l'utilisateur (console, interface graphique, page web).
- **Contrôleur** : reçoit les actions de l'utilisateur (depuis la Vue), orchestre le Modèle, et met à jour la Vue.

```java
public class EtudiantController {
    private EtudiantService service; // logique métier (Modèle)

    public void gererInscription(String nom, int age) {
        Etudiant etudiant = service.inscrire(nom, age); // délègue au Modèle
        EtudiantVue.afficherConfirmation(etudiant);       // met à jour la Vue
    }
}
```

Ce pattern structure directement l'architecture en couches du projet final (chapitres 23 et 31).

## 20.10 Dependency Injection : fournir les dépendances de l'extérieur

**Problème résolu :** rappel direct du principe d'inversion de dépendance (chapitre 19, section 19.6) — une classe ne devrait pas créer elle-même ses dépendances, mais les recevoir de l'extérieur.

```java
// Injection par CONSTRUCTEUR (la forme la plus courante et la plus recommandée)
public class InscriptionService {
    private final EtudiantRepository repository;

    public InscriptionService(EtudiantRepository repository) { // dépendance INJECTÉE, pas créée en interne
        this.repository = repository;
    }

    public void inscrire(Etudiant etudiant) {
        repository.sauvegarder(etudiant);
    }
}
```

```java
// Assemblage explicite (sans framework) : le code appelant choisit QUELLE implémentation injecter
EtudiantRepository repository = new EtudiantRepositoryJDBC(); // ou une version simulée pour les tests
InscriptionService service = new InscriptionService(repository);
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Frameworks d'injection de dépendances</span>
Sur de grands projets, des frameworks comme **Spring** automatisent cette injection (au lieu de l'assembler manuellement comme ci-dessus). Ce manuel reste centré sur le Java "pur" (sans framework), mais comprendre l'injection de dépendances manuelle rend l'apprentissage de Spring, plus tard, bien plus naturel.
</div>

## 20.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Appliquer un pattern parce qu'il est "connu", sans besoin réel</span>
Le piège le plus fréquent chez les développeurs qui viennent de découvrir les design patterns est de vouloir en placer partout, même là où une solution simple suffirait. Un design pattern répond à un **problème précis** (rappel de chaque section ci-dessus) — l'absence de ce problème signifie l'absence de besoin du pattern correspondant.
</div>

## 20.12 Résumé du chapitre

- **Singleton** : une seule instance globale (à utiliser avec parcimonie, complique les tests).
- **Factory** : centralise la logique de création d'objets.
- **Builder** : construit un objet complexe étape par étape, lisible et sans erreur d'ordre.
- **Strategy** : rend un algorithme interchangeable à l'exécution.
- **Observer** : notifie automatiquement plusieurs objets d'un changement d'état.
- **Adapter** : rend compatibles deux interfaces incompatibles, sans modifier le code existant.
- **Decorator** : ajoute des comportements dynamiquement, sans explosion de sous-classes.
- **MVC** : sépare données/logique (Modèle), affichage (Vue), orchestration (Contrôleur).
- **Dependency Injection** : une classe reçoit ses dépendances de l'extérieur plutôt que de les créer elle-même.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Utilise le pattern Builder pour construire une classe `Pizza` avec une base obligatoire (`taille`) et des garnitures optionnelles (`fromage`, `pepperoni`, `champignons`, tous booléens).
</div>

**Corrigé :**
```java
public class Pizza {
    private final String taille;
    private final boolean fromage;
    private final boolean pepperoni;
    private final boolean champignons;

    private Pizza(Builder b) {
        this.taille = b.taille;
        this.fromage = b.fromage;
        this.pepperoni = b.pepperoni;
        this.champignons = b.champignons;
    }

    public static class Builder {
        private String taille;
        private boolean fromage = false;
        private boolean pepperoni = false;
        private boolean champignons = false;

        public Builder(String taille) { this.taille = taille; } // obligatoire, passé au constructeur du Builder

        public Builder avecFromage() { this.fromage = true; return this; }
        public Builder avecPepperoni() { this.pepperoni = true; return this; }
        public Builder avecChampignons() { this.champignons = true; return this; }

        public Pizza build() { return new Pizza(this); }
    }
}
```
```java
Pizza pizza = new Pizza.Builder("Large").avecFromage().avecChampignons().build();
```

*Ceci clôt la Partie 6 (conception logicielle). Chapitre suivant : les bonnes pratiques Java, pour écrire un code propre au quotidien.*
