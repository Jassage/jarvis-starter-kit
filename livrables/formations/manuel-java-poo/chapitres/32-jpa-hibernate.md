<div class="chapitre-titre-num">CHAPITRE 32</div>

# Introduction à JPA et Hibernate

## Objectifs pédagogiques

Comprendre ce qu'est un ORM et pourquoi il simplifie l'accès aux données par rapport à JDBC, configurer Hibernate, annoter des entités, et réaliser un CRUD complet — puis un aperçu de Spring Data JPA.

## 32.1 Pourquoi un ORM

Rappel des chapitres 26-30 : le mapping manuel `ResultSet` → objet (la méthode `mapper()` répétée dans chaque DAO) est une tâche mécanique et répétitive. Un **ORM** (*Object-Relational Mapping*) automatise cette correspondance entre objets Java et lignes de tables relationnelles.

**Hibernate** est l'implémentation la plus utilisée de **JPA** (*Jakarta Persistence API*), la spécification standard Java pour la persistance objet-relationnel — JPA définit le **contrat** (les annotations, les interfaces), Hibernate en fournit une **implémentation** concrète (exactement la même relation qu'entre JDBC, chapitre 26, et ses pilotes).

## 32.2 JDBC vs Hibernate : ce qui change concrètement

| | JDBC (chapitres 26-30) | Hibernate/JPA |
|---|---|---|
| Écriture de SQL | Manuelle, requête par requête | Générée automatiquement à partir des annotations |
| Mapping ResultSet → objet | Manuel (`mapper()` dans chaque DAO) | Automatique |
| Gestion des relations (clés étrangères) | Jointures SQL manuelles | Annotations déclaratives (`@OneToMany`, etc.) |
| Portabilité entre SGBD | Nécessite d'adapter certaines requêtes | Génère le SQL adapté au SGBD configuré |
| Contrôle fin du SQL exécuté | Total | Partiel (Hibernate génère le SQL, personnalisable) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce manuel a d'abord enseigné JDBC "à la main"</span>
Comprendre JDBC en profondeur (chapitres 26-30) rend Hibernate bien plus facile à appréhender : chaque annotation JPA de ce chapitre **remplace** une portion de code JDBC déjà écrite précédemment — tu sais exactement ce qu'Hibernate fait "en coulisses", plutôt que de le traiter comme une boîte noire magique.
</div>

## 32.3 Installation et configuration

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>6.4.4.Final</version>
</dependency>
```

```xml
<!-- src/main/resources/META-INF/persistence.xml -->
<persistence>
    <persistence-unit name="gestionCommercialePU">
        <properties>
            <property name="jakarta.persistence.jdbc.url" value="jdbc:mysql://localhost:3306/gestion_commerciale"/>
            <property name="jakarta.persistence.jdbc.user" value="root"/>
            <property name="jakarta.persistence.jdbc.password" value="${DB_PASSWORD}"/>
            <property name="hibernate.hbm2ddl.auto" value="update"/> <!-- crée/met à jour les tables automatiquement -->
            <property name="hibernate.show_sql" value="true"/> <!-- affiche le SQL généré, utile pour apprendre -->
        </properties>
    </persistence-unit>
</persistence>
```

## 32.4 Les entités et annotations principales

```java
package com.jaslin.gestioncommerciale.modele;

import jakarta.persistence.*;

@Entity // marque cette classe comme correspondant à une table
@Table(name = "produit")
public class Produit {

    @Id // équivalent de PRIMARY KEY (chapitre 24)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // équivalent de AUTO_INCREMENT
    private Long id;

    @Column(name = "nom", nullable = false, length = 150)
    private String nom;

    @Column(nullable = false)
    private double prix;

    @Column(nullable = false)
    private int stock;

    @ManyToOne // plusieurs Produit → un seul Fournisseur (relation N:1)
    @JoinColumn(name = "fournisseur_id") // équivalent de FOREIGN KEY
    private Fournisseur fournisseur;

    public Produit() {} // constructeur SANS argument OBLIGATOIRE : Hibernate l'utilise en interne

    public Produit(String nom, double prix, int stock) {
        this.nom = nom;
        this.prix = prix;
        this.stock = stock;
    }
    // getters/setters (chapitre 4)
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un constructeur sans argument est OBLIGATOIRE pour une entité JPA</span>
Hibernate instancie les entités **par réflexion** (une technique avancée du JDK permettant de créer des objets et d'accéder à leurs membres sans passer par le code source compilé habituel), ce qui exige un constructeur public ou protégé sans argument, même si le code métier n'en a normalement pas besoin (rappel du chapitre 3 : sans lui, ce constructeur n'existerait pas si un autre constructeur paramétré est déjà défini).
</div>

## 32.5 Les relations : @OneToMany, @ManyToOne, @ManyToMany

```java
@Entity
public class Fournisseur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;

    @OneToMany(mappedBy = "fournisseur") // "mappedBy" pointe vers l'attribut CÔTÉ Produit qui porte la relation
    private List<Produit> produits = new ArrayList<>();
}
```

```java
@Entity
public class Etudiant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany // plusieurs Etudiant ↔ plusieurs Cours : nécessite une table de jointure
    @JoinTable(
        name = "inscription",
        joinColumns = @JoinColumn(name = "etudiant_id"),
        inverseJoinColumns = @JoinColumn(name = "cours_id")
    )
    private List<Cours> coursInscrits = new ArrayList<>();
}
```

**Relations JPA — rappel visuel (comparer au chapitre 18)**

```{.uml}
Produit "N" ────► "1" Fournisseur    (@ManyToOne côté Produit, @OneToMany côté Fournisseur)
Etudiant "N" ────► "N" Cours          (@ManyToMany, via une table de jointure intermédiaire)
```

## 32.6 Persistance des données : EntityManager

```java
import jakarta.persistence.*;

public class ProduitRepository {
    private EntityManagerFactory emf = Persistence.createEntityManagerFactory("gestionCommercialePU");

    public Long creer(Produit produit) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin(); // équivalent de setAutoCommit(false), chapitre 29
            em.persist(produit);          // équivalent d'un INSERT, généré automatiquement
            em.getTransaction().commit();
            return produit.getId();
        } finally {
            em.close();
        }
    }
}
```

## 32.7 CRUD complet avec Hibernate

```java
public class ProduitRepository {
    private EntityManagerFactory emf = Persistence.createEntityManagerFactory("gestionCommercialePU");

    // CREATE
    public void creer(Produit produit) {
        EntityManager em = emf.createEntityManager();
        em.getTransaction().begin();
        em.persist(produit);
        em.getTransaction().commit();
        em.close();
    }

    // READ (par id)
    public Produit trouverParId(Long id) {
        EntityManager em = emf.createEntityManager();
        Produit produit = em.find(Produit.class, id); // équivalent d'un SELECT ... WHERE id = ?
        em.close();
        return produit;
    }

    // READ (tous, via JPQL — le langage de requête orienté OBJET de JPA, pas orienté table)
    public List<Produit> listerTous() {
        EntityManager em = emf.createEntityManager();
        List<Produit> resultats = em.createQuery("SELECT p FROM Produit p ORDER BY p.nom", Produit.class)
            .getResultList();
        em.close();
        return resultats;
    }

    // UPDATE
    public void modifier(Produit produit) {
        EntityManager em = emf.createEntityManager();
        em.getTransaction().begin();
        em.merge(produit); // met à jour une entité déjà existante en base
        em.getTransaction().commit();
        em.close();
    }

    // DELETE
    public void supprimer(Long id) {
        EntityManager em = emf.createEntityManager();
        em.getTransaction().begin();
        Produit produit = em.find(Produit.class, id);
        if (produit != null) {
            em.remove(produit);
        }
        em.getTransaction().commit();
        em.close();
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 JPQL ressemble à SQL, mais interroge des CLASSES, pas des tables</span>
`"SELECT p FROM Produit p"` référence la classe Java `Produit` (avec une majuscule, son vrai nom), pas la table `produit` en base. Hibernate traduit cette requête JPQL en SQL réel adapté au SGBD configuré — un niveau d'abstraction supplémentaire par rapport au SQL brut du chapitre 25.
</div>

## 32.8 Comparaison directe : le même CRUD, JDBC vs Hibernate

```java
// JDBC (chapitre 30) : mapping manuel obligatoire
private Etudiant mapper(ResultSet rs) throws SQLException {
    return new Etudiant(rs.getInt("id"), rs.getString("nom"), rs.getString("email"), rs.getInt("age"));
}
```

```java
// Hibernate : AUCUN mapping manuel, l'entité EST directement l'objet retourné
Etudiant e = em.find(Etudiant.class, id); // toutes les colonnes sont déjà remplies dans l'objet
```

## 32.9 Introduction à Spring Data JPA (aperçu)

**Spring Data JPA**, construit par-dessus JPA/Hibernate dans l'écosystème Spring, va encore plus loin : il génère l'implémentation d'un DAO (appelé "Repository" dans ce contexte) **automatiquement**, à partir d'une simple interface.

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProduitRepository extends JpaRepository<Produit, Long> {
    // AUCUNE implémentation à écrire : Spring Data génère automatiquement creer/trouver/modifier/supprimer

    List<Produit> findByNomContaining(String motCle); // généré à partir du NOM de la méthode !
    List<Produit> findByPrixLessThan(double prixMax);
}
```

```java
produitRepository.save(nouveauProduit);           // CREATE ou UPDATE, selon si l'id existe déjà
produitRepository.findById(1L);                    // READ par id
produitRepository.findByNomContaining("ordinateur"); // généré automatiquement depuis le nom de la méthode !
produitRepository.deleteById(1L);                  // DELETE
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce manuel s'arrête à l'introduction : Spring mériterait un manuel dédié</span>
Spring Data JPA élimine quasiment tout le code DAO manuel des chapitres 27 et 30 — mais il s'appuie sur l'ensemble de l'écosystème Spring (injection de dépendances automatisée, configuration par annotations), qui dépasse le périmètre de ce manuel centré sur le Java "pur" et JPA/Hibernate de base. Comprendre JDBC (chapitres 26-30) puis Hibernate (ce chapitre) constitue exactement le socle nécessaire pour aborder Spring Data JPA ensuite avec une compréhension solide de ce qu'il automatise réellement.
</div>

## 32.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de fermer l'EntityManager</span>
Contrairement à `Connection` (chapitre 26, `try-with-resources`), un `EntityManager` non fermé accumule des ressources (connexions, cache de premier niveau) qui ne sont jamais libérées. La pratique recommandée : `try-with-resources` si la version de JPA le permet, ou un bloc `finally` systématique comme dans tous les exemples de ce chapitre.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ hibernate.hbm2ddl.auto=update en production</span>
Cette option (section 32.3), pratique en développement pour laisser Hibernate créer/adapter les tables automatiquement, est **déconseillée en production** : elle peut appliquer des changements de schéma non maîtrisés. En production, les migrations de schéma doivent être gérées explicitement (via des outils comme Flyway ou Liquibase, ou des scripts SQL versionnés comme au chapitre 24).
</div>

## 32.11 Résumé du chapitre

- Un ORM (Hibernate, implémentation de JPA) automatise le mapping objet-relationnel, éliminant le code de mapping manuel répété en JDBC.
- `@Entity`, `@Id`, `@Column`, `@ManyToOne`/`@OneToMany`/`@ManyToMany` déclarent la structure et les relations directement sur les classes Java.
- `EntityManager` (`persist`, `find`, `merge`, `remove`) remplace `PreparedStatement`/`ResultSet` pour les opérations CRUD.
- JPQL interroge des classes Java, pas des tables SQL directement.
- Spring Data JPA va plus loin en générant l'implémentation des Repository à partir de simples interfaces — un aperçu de ce que l'écosystème Spring automatise au-delà de ce manuel.

*Ceci clôt le corps principal du manuel (32 chapitres). Les annexes suivantes (aide-mémoire, erreurs fréquentes, glossaire, ressources) servent de référence rapide pour la suite de ta pratique.*
