<div class="chapitre-titre-num">CHAPITRE 30</div>

# Architecture DAO

## Objectifs pédagogiques

Généraliser le patron CRUD répété au chapitre 27 en une architecture **DAO** (Data Access Object) propre, avec interfaces, implémentations JDBC et couche service — l'architecture directement reprise dans le projet du chapitre 31.

## 30.1 Pourquoi le modèle DAO

Rappel de la remarque du chapitre 27 (section 27.9) : les CRUD `Etudiant`, `Employe`, `Produit`, `Client`, `Commande` répètent une structure quasiment identique. Le **DAO** (Data Access Object) formalise ce patron : **une interface par entité**, décrivant les opérations d'accès aux données disponibles, **séparée** de son implémentation technique (JDBC ici, potentiellement JPA/Hibernate au chapitre 32 demain).

<div class="encadre astuce">
<span class="encadre-titre">💡 DAO est une application directe de plusieurs principes déjà vus</span>
Le pattern DAO combine directement : le **Single Responsibility Principle** (chapitre 19 : la classe DAO n'a qu'une responsabilité, l'accès aux données), l'**inversion de dépendance** (chapitre 19 : le reste de l'application dépend de l'interface, pas de l'implémentation JDBC précise), et le concept d'interface de persistance déjà esquissé au chapitre 23 (`GestionnairePersistance`).
</div>

## 30.2 Créer l'interface DAO

```java
package com.jaslin.gestioncommerciale.dao;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import com.jaslin.gestioncommerciale.modele.Etudiant;

public interface EtudiantDAO {
    int creer(Etudiant etudiant) throws SQLException;
    Optional<Etudiant> trouverParId(int id) throws SQLException;
    List<Etudiant> listerTous() throws SQLException;
    boolean modifier(Etudiant etudiant) throws SQLException;
    boolean supprimer(int id) throws SQLException;
}
```

## 30.3 Implémentation DAO avec JDBC

```java
package com.jaslin.gestioncommerciale.dao;

import java.sql.*;
import java.util.*;
import com.jaslin.gestioncommerciale.modele.Etudiant;
import com.jaslin.gestioncommerciale.config.ConfigDB;

public class EtudiantDAOJDBC implements EtudiantDAO {

    @Override
    public int creer(Etudiant etudiant) throws SQLException {
        String sql = "INSERT INTO etudiant (nom, email, age) VALUES (?, ?, ?)";
        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, etudiant.getNom());
            stmt.setString(2, etudiant.getEmail());
            stmt.setInt(3, etudiant.getAge());
            stmt.executeUpdate();

            try (ResultSet cles = stmt.getGeneratedKeys()) {
                return cles.next() ? cles.getInt(1) : -1;
            }
        }
    }

    @Override
    public Optional<Etudiant> trouverParId(int id) throws SQLException {
        String sql = "SELECT * FROM etudiant WHERE id = ?";
        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql)) {

            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? Optional.of(mapper(rs)) : Optional.empty();
            }
        }
    }

    @Override
    public List<Etudiant> listerTous() throws SQLException {
        String sql = "SELECT * FROM etudiant ORDER BY nom";
        List<Etudiant> resultats = new ArrayList<>();
        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                resultats.add(mapper(rs));
            }
        }
        return resultats;
    }

    @Override
    public boolean modifier(Etudiant etudiant) throws SQLException {
        String sql = "UPDATE etudiant SET nom = ?, email = ?, age = ? WHERE id = ?";
        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql)) {

            stmt.setString(1, etudiant.getNom());
            stmt.setString(2, etudiant.getEmail());
            stmt.setInt(3, etudiant.getAge());
            stmt.setInt(4, etudiant.getId());
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean supprimer(int id) throws SQLException {
        String sql = "DELETE FROM etudiant WHERE id = ?";
        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql)) {

            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }

    private Etudiant mapper(ResultSet rs) throws SQLException {
        return new Etudiant(rs.getInt("id"), rs.getString("nom"), rs.getString("email"), rs.getInt("age"));
    }
}
```

## 30.4 La couche Service : logique métier au-dessus du DAO

<div class="encadre astuce">
<span class="encadre-titre">💡 Le DAO ne contient QUE de l'accès aux données, jamais de logique métier</span>
Une erreur de conception fréquente est de glisser de la validation métier (âge minimum, format d'email) directement dans la classe DAO. Le DAO doit rester une couche **purement technique** d'accès aux données ; toute règle métier vit dans la couche **Service**, qui orchestre un ou plusieurs DAO.
</div>

```java
package com.jaslin.gestioncommerciale.service;

import java.sql.SQLException;
import java.util.List;
import com.jaslin.gestioncommerciale.dao.EtudiantDAO;
import com.jaslin.gestioncommerciale.modele.Etudiant;

public class EtudiantService {
    private final EtudiantDAO etudiantDAO; // dépend de l'INTERFACE (chapitre 19-20, injection de dépendance)

    public EtudiantService(EtudiantDAO etudiantDAO) {
        this.etudiantDAO = etudiantDAO;
    }

    public int inscrireEtudiant(String nom, String email, int age) throws SQLException {
        if (age < 16) {
            throw new IllegalArgumentException("L'âge minimum d'inscription est 16 ans"); // RÈGLE MÉTIER ici
        }
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Format d'email invalide");
        }
        return etudiantDAO.creer(new Etudiant(nom, email, age));
    }

    public List<Etudiant> listerEtudiants() throws SQLException {
        return etudiantDAO.listerTous();
    }
}
```

## 30.5 Diagramme UML de l'architecture DAO

**Architecture DAO complète**

```{.uml}
┌───────────────┐
│  EtudiantService  │  ← logique métier (validation, règles)
├───────────────┤
│ - etudiantDAO : EtudiantDAO │
└───────────────┘
        │ dépend de (injection)
        ▼
┌───────────────────┐
│ «interface» EtudiantDAO │  ← contrat d'accès aux données
├───────────────────┤
│+creer(), +trouverParId()  │
│+listerTous(), +modifier() │
│+supprimer()               │
└───────────────────┘
        ▲┊ implements
┌───────────────────┐
│  EtudiantDAOJDBC       │  ← implémentation technique (JDBC aujourd'hui, JPA possible demain)
└───────────────────┘
```

## 30.6 Assemblage final : injection manuelle dans main

```java
public class Application {
    public static void main(String[] args) throws SQLException {
        EtudiantDAO dao = new EtudiantDAOJDBC();          // choix de l'implémentation, ICI et une seule fois
        EtudiantService service = new EtudiantService(dao); // injectée dans le service

        int id = service.inscrireEtudiant("Jaslin", "jaslin@mail.com", 22);
        System.out.println("Étudiant inscrit avec l'id : " + id);

        service.listerEtudiants().forEach(System.out::println);
    }
}
```

## 30.7 Bénéfice concret : remplacer l'implémentation sans toucher au reste

```java
// Une implémentation FAKE, gardant les données en mémoire, pour les tests unitaires
public class EtudiantDAOFake implements EtudiantDAO {
    private List<Etudiant> etudiants = new ArrayList<>();
    private int prochainId = 1;

    @Override
    public int creer(Etudiant etudiant) {
        etudiant.setId(prochainId);
        etudiants.add(etudiant);
        return prochainId++;
    }

    @Override
    public List<Etudiant> listerTous() {
        return new ArrayList<>(etudiants); // copie défensive, rappel du chapitre 4
    }
    // ... autres méthodes ...
}
```

```java
@Test
void inscrireEtudiantAvecAgeInsuffisantLeveUneException() {
    EtudiantService service = new EtudiantService(new EtudiantDAOFake()); // AUCUNE base de données réelle nécessaire
    assertThrows(IllegalArgumentException.class,
        () -> service.inscrireEtudiant("Jaslin", "jaslin@mail.com", 10));
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 C'est exactement le bénéfice annoncé au chapitre 23</span>
Grâce à l'interface `EtudiantDAO`, les tests de `EtudiantService` s'exécutent **instantanément**, sans base de données réelle démarrée — la logique métier (validation d'âge, format d'email) est testée indépendamment de la persistance, exactement le principe déjà illustré avec `GestionnairePersistance` au chapitre 23.
</div>

## 30.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger logique métier et accès aux données dans la même classe</span>
```java
// ❌ EtudiantDAOJDBC ne devrait JAMAIS contenir cette validation
public int creer(Etudiant etudiant) throws SQLException {
    if (etudiant.getAge() < 16) { // ⚠️ règle MÉTIER glissée dans la couche DAO, à la mauvaise place
        throw new IllegalArgumentException("Âge insuffisant");
    }
    // ...
}
```
Cette validation doit vivre dans `EtudiantService` (section 30.4), jamais dans le DAO — sinon toute nouvelle implémentation du DAO (JPA au chapitre 32, un DAO de test) devrait dupliquer cette même règle métier.
</div>

## 30.9 Résumé du chapitre

- Le pattern DAO sépare une **interface** (contrat d'accès aux données) de son **implémentation** technique (JDBC), permettant de changer cette dernière sans impacter le reste de l'application.
- La couche **Service** orchestre un ou plusieurs DAO et porte **exclusivement** la logique métier — jamais le DAO lui-même.
- L'injection de dépendance (le service reçoit son DAO via le constructeur) facilite grandement les tests, via une implémentation DAO simulée en mémoire.
- Cette architecture (DAO + Service) est directement reprise et étendue dans le projet intégrateur du chapitre 31.

*Chapitre suivant : le projet Java POO + MySQL, qui assemble tout ce que la Partie 10 a construit dans une application de gestion commerciale complète.*
