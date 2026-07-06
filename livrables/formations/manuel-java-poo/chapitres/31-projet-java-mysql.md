<div class="chapitre-titre-num">CHAPITRE 31</div>

# Projet Java POO + MySQL — Gestion commerciale complète

## Objectifs pédagogiques

Assembler l'intégralité des notions des chapitres 1 à 30 dans un projet professionnel complet : authentification par rôles, gestion commerciale (clients, produits, stock, fournisseurs, ventes, achats, factures), tableau de bord, recherche multicritère, pagination, rapports et sauvegarde de données.

## 31.1 Cahier des charges

**GestionCommerciale** est une application de gestion pour une entreprise (boutique avec fournisseurs et clients) couvrant : authentification (ADMINISTRATEUR, EMPLOYE), CRUD clients/produits/fournisseurs, ventes (avec décrément de stock atomique), achats (avec réception, incrément de stock), factures, tableau de bord avec statistiques, recherche multicritère paginée, rapports, et sauvegarde/restauration de la base.

## 31.2 Architecture du projet

```
gestion-commerciale/
├── pom.xml
├── src/main/resources/
│   └── application.properties
└── src/main/java/com/jaslin/gestioncommerciale/
    ├── config/         → ConfigDB, ConnexionManager
    ├── modele/         → Utilisateur, Client, Produit, Fournisseur, Vente, LigneVente, Achat, Facture
    ├── exception/      → StockInsuffisantException, AuthentificationException, ...
    ├── dao/             → interfaces + implémentations JDBC (chapitre 30)
    ├── service/        → logique métier (AuthService, VenteService, AchatService, RapportService...)
    ├── util/            → PaginationUtil, ValidateurUtil, SauvegardeUtil
    └── ui/              → MenuPrincipal, MenuVentes, MenuRapports...
```

```xml
<!-- pom.xml -->
<project>
    <groupId>com.jaslin</groupId>
    <artifactId>gestion-commerciale</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## 31.3 Modèle de données (schéma SQL)

```sql
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMINISTRATEUR', 'EMPLOYE') NOT NULL DEFAULT 'EMPLOYE'
);

CREATE TABLE client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    solde_du DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE fournisseur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20)
);

CREATE TABLE produit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    fournisseur_id INT,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseur(id)
);

CREATE TABLE vente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('VALIDEE', 'ANNULEE') DEFAULT 'VALIDEE',
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);

CREATE TABLE ligne_vente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vente_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (vente_id) REFERENCES vente(id),
    FOREIGN KEY (produit_id) REFERENCES produit(id)
);

CREATE TABLE achat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fournisseur_id INT NOT NULL,
    date_achat DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('COMMANDE', 'RECU') DEFAULT 'COMMANDE',
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseur(id)
);

CREATE TABLE facture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vente_id INT NOT NULL UNIQUE,
    montant_total DECIMAL(12,2) NOT NULL,
    date_emission DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES vente(id)
);
```

**Modèle relationnel — GestionCommerciale (simplifié)**

```{.uml}
Fournisseur "1"───"0..*" Produit "1"───"0..*" LigneVente "0..*"───"1" Vente "1"───"1" Facture
                                                                  │
                                                              "0..*"│"1"
                                                                  ▼
                                                              Client
Fournisseur "1"───"0..*" Achat
Utilisateur "1"───"0..*" Vente
```

## 31.4 Fichier de configuration et connexion centralisée

```properties
# src/main/resources/application.properties
db.url=jdbc:mysql://localhost:3306/gestion_commerciale
db.user=root
db.password=${DB_PASSWORD}
```

```java
package com.jaslin.gestioncommerciale.config;

import java.io.IOException;
import java.io.InputStream;
import java.sql.*;
import java.util.Properties;

public class ConfigDB {
    private static final Properties PROPRIETES = new Properties();

    static { // bloc d'initialisation statique : chargé UNE SEULE FOIS au premier accès à la classe
        try (InputStream input = ConfigDB.class.getClassLoader().getResourceAsStream("application.properties")) {
            PROPRIETES.load(input);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de charger la configuration", e);
        }
    }

    public static Connection obtenirConnexion() throws SQLException {
        return DriverManager.getConnection(
            PROPRIETES.getProperty("db.url"),
            PROPRIETES.getProperty("db.user"),
            System.getenv("DB_PASSWORD") // mot de passe réel lu depuis une VARIABLE D'ENVIRONNEMENT, jamais commité
        );
    }
}
```

## 31.5 Authentification et gestion des rôles

```java
package com.jaslin.gestioncommerciale.modele;

public enum RoleUtilisateur { ADMINISTRATEUR, EMPLOYE }

public class Utilisateur {
    private int id;
    private String nom;
    private String email;
    private String motDePasseHash;
    private RoleUtilisateur role;
    // constructeurs, getters/setters (chapitre 4)
}
```

```java
package com.jaslin.gestioncommerciale.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class AuthService {
    private final UtilisateurDAO utilisateurDAO;

    public AuthService(UtilisateurDAO utilisateurDAO) {
        this.utilisateurDAO = utilisateurDAO;
    }

    public Utilisateur connecter(String email, String motDePasse) throws SQLException {
        Utilisateur utilisateur = utilisateurDAO.trouverParEmail(email)
            .orElseThrow(() -> new AuthentificationException("Email ou mot de passe incorrect"));

        if (!verifierMotDePasse(motDePasse, utilisateur.getMotDePasseHash())) {
            throw new AuthentificationException("Email ou mot de passe incorrect");
        }
        return utilisateur;
    }

    private String hacher(String motDePasse) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(motDePasse.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private boolean verifierMotDePasse(String saisi, String hashStocke) {
        return hacher(saisi).equals(hashStocke);
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ SHA-256 seul reste insuffisant pour un vrai système en production</span>
À des fins pédagogiques, ce hachage simple illustre le principe (ne **jamais** stocker un mot de passe en clair). En production réelle, un algorithme dédié aux mots de passe (**BCrypt**, **Argon2**) est requis : contrairement à SHA-256 (conçu pour être rapide), ces algorithmes sont volontairement lents et intègrent un "sel" (salt) automatique, rendant les attaques par force brute bien plus coûteuses.
</div>

```java
public class RouteParRole { // équivalent Java d'une garde d'accès (comparer au chapitre 20 de React, si connu)
    public static void verifierAdmin(Utilisateur utilisateur) {
        if (utilisateur.getRole() != RoleUtilisateur.ADMINISTRATEUR) {
            throw new AccesRefuseException("Action réservée aux administrateurs");
        }
    }
}
```

## 31.6 Service Vente : la transaction centrale du système

```java
package com.jaslin.gestioncommerciale.service;

public class VenteService {
    private final VenteDAO venteDAO;
    private final ProduitDAO produitDAO;
    private final FactureDAO factureDAO;

    public VenteService(VenteDAO venteDAO, ProduitDAO produitDAO, FactureDAO factureDAO) {
        this.venteDAO = venteDAO;
        this.produitDAO = produitDAO;
        this.factureDAO = factureDAO;
    }

    public int creerVente(int clientId, int utilisateurId, List<LigneVenteDTO> lignes) throws SQLException {
        try (Connection connexion = ConfigDB.obtenirConnexion()) {
            connexion.setAutoCommit(false); // transaction (chapitre 29) : tout réussit, ou rien

            try {
                // 1. Vérifier et décrémenter le stock de CHAQUE produit (compare-and-swap atomique)
                for (LigneVenteDTO ligne : lignes) {
                    int lignesAffectees = produitDAO.decrementerStockAtomique(
                        connexion, ligne.produitId(), ligne.quantite());
                    if (lignesAffectees == 0) {
                        throw new StockInsuffisantException(ligne.produitId());
                    }
                }

                // 2. Créer la vente et ses lignes
                int venteId = venteDAO.creer(connexion, clientId, utilisateurId);
                double total = 0;
                for (LigneVenteDTO ligne : lignes) {
                    double prixUnitaire = produitDAO.trouverParId(ligne.produitId())
                        .orElseThrow().getPrix();
                    venteDAO.ajouterLigne(connexion, venteId, ligne.produitId(), ligne.quantite(), prixUnitaire);
                    total += prixUnitaire * ligne.quantite();
                }

                // 3. Générer la facture
                factureDAO.creer(connexion, venteId, total);

                connexion.commit();
                return venteId;
            } catch (SQLException | StockInsuffisantException e) {
                connexion.rollback();
                throw e instanceof SQLException se ? se : new SQLException(e);
            } finally {
                connexion.setAutoCommit(true);
            }
        }
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pourquoi decrementerStockAtomique et non un simple SELECT puis UPDATE</span>
```java
// ❌ Vérification puis mise à jour SÉPARÉES : une race condition possible entre les deux
int stockActuel = produitDAO.getStock(produitId); // Thread A lit stock = 5
if (stockActuel >= quantiteDemandee) {              // Thread B lit AUSSI stock = 5, AVANT que A ne décrémente
    produitDAO.decrementerStock(produitId, quantiteDemandee); // Les DEUX threads décrémentent, stock devient négatif !
}
```
```sql
-- ✅ UPDATE conditionnel ATOMIQUE : une seule requête SQL, garantie par le SGBD lui-même
UPDATE produit SET stock = stock - ? WHERE id = ? AND stock >= ?
```
Ce risque de **condition de concurrence** (race condition) est réel dès que plusieurs utilisateurs (deux caissiers, par exemple) peuvent vendre le même produit simultanément. La solution : une seule requête `UPDATE ... WHERE stock >= ?` qui vérifie et modifie **en une seule opération atomique**, garantie par le SGBD — `executeUpdate()` retourne alors `0` si la condition n'était plus vraie au moment de l'exécution réelle.
</div>

```java
// ProduitDAOJDBC
public int decrementerStockAtomique(Connection connexion, int produitId, int quantite) throws SQLException {
    String sql = "UPDATE produit SET stock = stock - ? WHERE id = ? AND stock >= ?";
    try (PreparedStatement stmt = connexion.prepareStatement(sql)) {
        stmt.setInt(1, quantite);
        stmt.setInt(2, produitId);
        stmt.setInt(3, quantite);
        return stmt.executeUpdate(); // 0 si le stock était insuffisant AU MOMENT de l'exécution
    }
}
```

## 31.7 Recherche multicritère et pagination

```java
package com.jaslin.gestioncommerciale.dao;

public class ProduitDAOJDBC implements ProduitDAO {

    public List<Produit> rechercher(String motCleNom, Double prixMax, int page, int taillePage) throws SQLException {
        StringBuilder sql = new StringBuilder("SELECT * FROM produit WHERE 1=1"); // rappel du chapitre 28
        List<Object> parametres = new ArrayList<>();

        if (motCleNom != null && !motCleNom.isBlank()) {
            sql.append(" AND nom LIKE ?");
            parametres.add("%" + motCleNom + "%");
        }
        if (prixMax != null) {
            sql.append(" AND prix <= ?");
            parametres.add(prixMax);
        }
        sql.append(" ORDER BY nom LIMIT ? OFFSET ?"); // pagination SQL, rappel du chapitre 25
        parametres.add(taillePage);
        parametres.add(page * taillePage);

        try (Connection connexion = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = connexion.prepareStatement(sql.toString())) {

            for (int i = 0; i < parametres.size(); i++) {
                stmt.setObject(i + 1, parametres.get(i));
            }

            List<Produit> resultats = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    resultats.add(mapper(rs));
                }
            }
            return resultats;
        }
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi la pagination se fait en SQL (LIMIT/OFFSET), pas en Java</span>
Charger **toutes** les lignes d'une table volumineuse en mémoire Java pour n'en afficher qu'une page serait extrêmement inefficace (rappel du chapitre 27, section optimisation). `LIMIT`/`OFFSET` demande au SGBD de ne renvoyer **que** les lignes réellement nécessaires à l'affichage courant.
</div>

## 31.8 Tableau de bord et rapports

```java
package com.jaslin.gestioncommerciale.service;

public class RapportService {
    public StatistiquesDashboard genererDashboard() throws SQLException {
        try (Connection connexion = ConfigDB.obtenirConnexion()) {
            double chiffreAffairesDuJour = requeteScalaire(connexion,
                "SELECT COALESCE(SUM(montant_total), 0) FROM facture WHERE DATE(date_emission) = CURDATE()");

            int nombreVentesDuJour = (int) requeteScalaire(connexion,
                "SELECT COUNT(*) FROM vente WHERE DATE(date_vente) = CURDATE()");

            List<ProduitStock> produitsSousSeuil = rechercherProduitsSousSeuil(connexion, 10);

            return new StatistiquesDashboard(chiffreAffairesDuJour, nombreVentesDuJour, produitsSousSeuil);
        }
    }

    private double requeteScalaire(Connection connexion, String sql) throws SQLException {
        try (PreparedStatement stmt = connexion.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getDouble(1);
        }
    }
}
```

## 31.9 Sauvegarde et restauration des données

```java
package com.jaslin.gestioncommerciale.util;

import java.io.IOException;

public class SauvegardeUtil {
    public static void sauvegarder(String cheminFichier) throws IOException, InterruptedException {
        // Exécute mysqldump comme processus externe — approche standard pour une sauvegarde SQL complète
        ProcessBuilder pb = new ProcessBuilder(
            "mysqldump", "-u", "root", "-p" + System.getenv("DB_PASSWORD"),
            "gestion_commerciale", "-r", cheminFichier
        );
        Process processus = pb.start();
        int code = processus.waitFor();
        if (code != 0) {
            throw new IOException("Échec de la sauvegarde, code retour : " + code);
        }
    }

    public static void restaurer(String cheminFichier) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
            "mysql", "-u", "root", "-p" + System.getenv("DB_PASSWORD"), "gestion_commerciale"
        );
        pb.redirectInput(new java.io.File(cheminFichier));
        Process processus = pb.start();
        processus.waitFor();
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi appeler mysqldump plutôt que de réimplémenter l'export en Java</span>
`mysqldump` (fourni avec toute installation MySQL) génère un export SQL complet et fiable, gérant automatiquement l'ordre des tables (clés étrangères), les types de données complexes, et les caractères spéciaux — réimplémenter cette logique manuellement en Java serait long, source d'erreurs, et sans réel bénéfice par rapport à l'outil déjà fourni par le SGBD lui-même.
</div>

## 31.10 Menu interactif (extrait)

```java
package com.jaslin.gestioncommerciale.ui;

public class MenuPrincipal {
    private final AuthService authService;
    private final VenteService venteService;
    private final RapportService rapportService;
    private Utilisateur utilisateurConnecte;
    private Scanner scanner = new Scanner(System.in);

    public void demarrer() throws SQLException {
        seConnecter();
        boolean continuer = true;
        while (continuer) {
            afficherMenu();
            int choix = Integer.parseInt(scanner.nextLine());
            try {
                switch (choix) {
                    case 1 -> afficherDashboard();
                    case 2 -> nouvelleVente();
                    case 3 -> rechercherProduits();
                    case 4 -> {
                        RouteParRole.verifierAdmin(utilisateurConnecte); // garde par rôle (rappel section 31.5)
                        genererSauvegarde();
                    }
                    case 0 -> continuer = false;
                    default -> System.out.println("Choix invalide.");
                }
            } catch (AccesRefuseException | StockInsuffisantException | SQLException e) {
                System.out.println("⚠ " + e.getMessage());
            }
        }
    }

    private void seConnecter() throws SQLException {
        System.out.print("Email : ");
        String email = scanner.nextLine();
        System.out.print("Mot de passe : ");
        String motDePasse = scanner.nextLine();
        this.utilisateurConnecte = authService.connecter(email, motDePasse);
        System.out.println("Bienvenue, " + utilisateurConnecte.getNom() + " (" + utilisateurConnecte.getRole() + ")");
    }
}
```

## 31.11 Diagramme UML global de l'architecture

**Architecture en couches — GestionCommerciale**

```{.uml}
┌─────────────────────────────────┐
│  ui (MenuPrincipal, MenuVentes...)   │
├─────────────────────────────────┤
│  service (AuthService, VenteService,  │
│  AchatService, RapportService)         │
├─────────────────────────────────┤
│  dao (interfaces + impl JDBC)          │
├─────────────────────────────────┤
│  modele (Utilisateur, Client, Produit, │
│  Vente, Achat, Facture)                │
└─────────────────────────────────┘
     + exception (transversal)
     + util (PaginationUtil, SauvegardeUtil)
     + config (ConfigDB)
```

## 31.12 Résumé du chapitre

- GestionCommerciale assemble authentification par rôles, architecture DAO/Service, transactions atomiques (décrément de stock sécurisé), recherche paginée, tableau de bord et sauvegarde via `mysqldump`.
- Le décrément de stock utilise un `UPDATE ... WHERE stock >= ?` atomique, évitant toute race condition entre ventes concurrentes.
- Les mots de passe sont hachés (jamais stockés en clair), avec une mise en garde sur les limites de SHA-256 seul en production réelle.
- La pagination et le filtrage se font en SQL (`LIMIT`/`OFFSET`, `WHERE` dynamique), jamais en chargeant toutes les données en mémoire Java.
- Ce projet démontre, à l'échelle d'une application complète, l'intégration de la quasi-totalité des 30 chapitres précédents.

*Chapitre suivant : introduction à JPA et Hibernate, pour automatiser ce que les chapitres 26 à 31 ont construit manuellement avec JDBC.*
