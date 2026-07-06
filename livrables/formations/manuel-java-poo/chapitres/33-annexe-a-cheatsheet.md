<div class="chapitre-titre-num">ANNEXE A</div>

# Aide-mémoire syntaxe Java POO

## Classe et objet (chapitres 2-3)

```java
public class Etudiant {
    private String nom;                          // attribut privé (chapitre 4)

    public Etudiant(String nom) { this.nom = nom; } // constructeur

    public String getNom() { return nom; }         // getter
}
Etudiant e = new Etudiant("Jaslin");               // instanciation
```

## Encapsulation (chapitre 4)

```java
private double solde;
public double getSolde() { return solde; }
public void deposer(double montant) {
    if (montant <= 0) throw new IllegalArgumentException("Montant invalide");
    solde += montant;
}
```

## Héritage et polymorphisme (chapitres 5-6)

```java
public class Animal {
    void crier() { System.out.println("..."); }
}
public class Chien extends Animal {
    @Override void crier() { System.out.println("Wouf"); }
    void sePresenter() { super.crier(); /* + code propre */ }
}
Animal a = new Chien();      // upcasting (implicite, toujours sûr)
Chien c = (Chien) a;         // downcasting (explicite, peut lever ClassCastException)
if (a instanceof Chien ch) { ch.aboyer(); } // pattern matching (Java 16+)
```

## Abstraction et interfaces (chapitres 7-8)

```java
public abstract class Forme {
    abstract double calculerAire();               // méthode abstraite, sans corps
    void afficher() { System.out.println("Forme"); } // méthode concrète
}
public interface Payable {
    double calculerMontant();                      // implicitement public abstract
    default void afficherRecu() { /* ... */ }       // méthode par défaut (Java 8+)
    static Payable creerVide() { return () -> 0.0; } // méthode statique
}
public class Facture implements Payable, Imprimable { /* implémente plusieurs interfaces */ }
```

## Modificateurs d'accès (chapitre 10)

```
private       → même classe uniquement
(rien)        → même package (package-private)
protected     → même package + classes filles (même hors package)
public        → partout
```

## Classes spéciales (chapitre 11)

```java
public final class Config { }                 // classe non héritable
public final double calculer() { }             // méthode non redéfinissable
private static int compteur = 0;               // membre static, partagé par toutes les instances
public class Ecole {
    public class Salle { }                      // classe interne (liée à une instance d'Ecole)
    public static class Statut { }               // classe statique imbriquée (indépendante)
}
Operation op = new Operation() { /* ... */ };    // classe anonyme
```

## Exceptions (chapitre 12)

```java
try {
    // code à risque
} catch (SQLException e) {
    // gestion spécifique
} catch (Exception e) {
    // catch générique EN DERNIER
} finally {
    // toujours exécuté
}
try (Connection c = ...; PreparedStatement s = ...) { } // try-with-resources
throw new IllegalArgumentException("message");
public void methode() throws IOException { }
public class MonException extends RuntimeException {
    public MonException(String message) { super(message); }
}
```

## Collections (chapitre 13)

```java
List<String> liste = new ArrayList<>();     // ordonnée, doublons permis
Set<String> ensemble = new HashSet<>();      // pas de doublons
Map<String, Double> carte = new HashMap<>(); // clé-valeur
liste.forEach(System.out::println);
liste.removeIf(x -> x.isBlank());
```

## Enum, Generics, Lambda, Streams (chapitres 14-17)

```java
public enum Role { ETUDIANT, FORMATEUR, ADMIN }

public class Boite<T> { private T contenu; }
public static <T> T premier(List<T> liste) { return liste.get(0); }

Operation addition = (a, b) -> a + b;
noms.forEach(System.out::println);

List<String> resultat = liste.stream()
    .filter(x -> x.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .toList();
```

## SOLID (chapitre 19) — récapitulatif express

```
S — une classe, une seule responsabilité
O — extensible sans modifier le code existant
L — une sous-classe ne casse jamais le contrat de sa classe mère
I — plusieurs interfaces spécifiques > une seule interface trop large
D — dépendre d'abstractions (interfaces), pas d'implémentations concrètes
```

## JDBC (chapitres 26-30)

```java
try (Connection c = DriverManager.getConnection(url, user, password);
     PreparedStatement stmt = c.prepareStatement("SELECT * FROM produit WHERE id = ?")) {
    stmt.setInt(1, id);
    try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) { rs.getString("nom"); }
    }
}
// Transaction (chapitre 29)
connexion.setAutoCommit(false);
try {
    // plusieurs opérations
    connexion.commit();
} catch (SQLException e) {
    connexion.rollback();
} finally {
    connexion.setAutoCommit(true);
}
```

## JPA/Hibernate (chapitre 32)

```java
@Entity
public class Produit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;
}

em.getTransaction().begin();
em.persist(produit);   // CREATE
Produit p = em.find(Produit.class, id); // READ
em.merge(produit);      // UPDATE
em.remove(produit);     // DELETE
em.getTransaction().commit();
```
