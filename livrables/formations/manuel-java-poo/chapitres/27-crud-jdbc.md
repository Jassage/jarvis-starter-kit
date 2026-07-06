<div class="chapitre-titre-num">CHAPITRE 27</div>

# Les opérations CRUD avec JDBC

## Objectifs pédagogiques

Implémenter pas à pas les quatre opérations CRUD (Create, Read, Update, Delete) avec JDBC sur une entité `Etudiant`, puis reproduire ce même patron sur quatre autres domaines métier (employés, produits, clients, commandes).

## 27.1 La table et l'entité de départ

```sql
CREATE TABLE etudiant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    age INT
);
```

```java
public class Etudiant {
    private int id;
    private String nom;
    private String email;
    private int age;

    public Etudiant(String nom, String email, int age) { // constructeur SANS id : pas encore en base
        this.nom = nom;
        this.email = email;
        this.age = age;
    }

    public Etudiant(int id, String nom, String email, int age) { // constructeur AVEC id : lu depuis la base
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.age = age;
    }
    // getters/setters (chapitre 4) omis pour la lisibilité
}
```

## 27.2 CREATE : insérer un étudiant

**Explication :** `INSERT` ajoute une nouvelle ligne ; `Statement.RETURN_GENERATED_KEYS` récupère l'`id` auto-généré par MySQL, indispensable pour manipuler cet étudiant ensuite (mise à jour, suppression).

**Séquence — CREATE**

```{.uml}
Application → Connection.prepareStatement(INSERT...)
            → PreparedStatement.executeUpdate()
            → PreparedStatement.getGeneratedKeys()
            → id récupéré, réinjecté dans l'objet Etudiant
```

```java
public int creerEtudiant(Etudiant etudiant) throws SQLException {
    String sql = "INSERT INTO etudiant (nom, email, age) VALUES (?, ?, ?)";

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

        stmt.setString(1, etudiant.getNom());
        stmt.setString(2, etudiant.getEmail());
        stmt.setInt(3, etudiant.getAge());

        stmt.executeUpdate();

        try (ResultSet cles = stmt.getGeneratedKeys()) {
            if (cles.next()) {
                return cles.getInt(1); // l'id auto-généré par MySQL
            }
        }
        throw new SQLException("Aucun id généré lors de la création");
    }
}
```

**Résultat obtenu :** l'étudiant est inséré, son `id` généré est retourné pour usage ultérieur.

**Optimisation :** insérer plusieurs étudiants un par un dans une boucle est lent (un aller-retour réseau par insertion) ; pour un import massif, `addBatch()`/`executeBatch()` regroupe plusieurs insertions en un seul aller-retour :

```java
try (PreparedStatement stmt = connexion.prepareStatement(sql)) {
    for (Etudiant e : nouveauxEtudiants) {
        stmt.setString(1, e.getNom());
        stmt.setString(2, e.getEmail());
        stmt.setInt(3, e.getAge());
        stmt.addBatch();
    }
    stmt.executeBatch(); // exécute TOUTES les insertions en un seul échange réseau
}
```

## 27.3 READ : lire un ou plusieurs étudiants

**Explication :** `SELECT` + `ResultSet` parcouru ligne par ligne, chaque ligne reconstruite en objet `Etudiant` — un pattern appelé **mapping** (approfondi comme "ORM" au chapitre 32).

```java
public Optional<Etudiant> trouverParId(int id) throws SQLException {
    String sql = "SELECT id, nom, email, age FROM etudiant WHERE id = ?";

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql)) {

        stmt.setInt(1, id);

        try (ResultSet resultSet = stmt.executeQuery()) {
            if (resultSet.next()) {
                return Optional.of(mapperVersEtudiant(resultSet));
            }
            return Optional.empty(); // aucun résultat : Optional vide (rappel du chapitre 17), pas null
        }
    }
}

public List<Etudiant> listerTous() throws SQLException {
    String sql = "SELECT id, nom, email, age FROM etudiant ORDER BY nom";
    List<Etudiant> etudiants = new ArrayList<>();

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql);
         ResultSet resultSet = stmt.executeQuery()) {

        while (resultSet.next()) {
            etudiants.add(mapperVersEtudiant(resultSet));
        }
    }
    return etudiants;
}

private Etudiant mapperVersEtudiant(ResultSet rs) throws SQLException {
    return new Etudiant(
        rs.getInt("id"),
        rs.getString("nom"),
        rs.getString("email"),
        rs.getInt("age")
    );
}
```

**Résultat obtenu :** une liste d'objets `Etudiant` prêts à l'emploi côté Java, sans manipulation SQL supplémentaire dans le reste du code.

**Optimisation :** pour des tables volumineuses, toujours filtrer côté SQL (`WHERE`, `LIMIT`) plutôt que de charger toutes les lignes en mémoire Java pour les filtrer ensuite avec un Stream — la base est bien plus efficace pour ce travail.

## 27.4 UPDATE : modifier un étudiant existant

```java
public boolean modifierEtudiant(Etudiant etudiant) throws SQLException {
    String sql = "UPDATE etudiant SET nom = ?, email = ?, age = ? WHERE id = ?";

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql)) {

        stmt.setString(1, etudiant.getNom());
        stmt.setString(2, etudiant.getEmail());
        stmt.setInt(3, etudiant.getAge());
        stmt.setInt(4, etudiant.getId());

        int lignesAffectees = stmt.executeUpdate();
        return lignesAffectees > 0; // false si aucun étudiant avec cet id n'existait
    }
}
```

**Résultat obtenu :** `executeUpdate()` retourne le **nombre de lignes affectées** — une information précieuse pour détecter un `id` inexistant (0 ligne modifiée) sans lever d'exception.

## 27.5 DELETE : supprimer un étudiant

```java
public boolean supprimerEtudiant(int id) throws SQLException {
    String sql = "DELETE FROM etudiant WHERE id = ?";

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql)) {

        stmt.setInt(1, id);
        return stmt.executeUpdate() > 0;
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ DELETE peut échouer à cause d'une contrainte de clé étrangère</span>
Supprimer un `etudiant` référencé par une `inscription` (chapitre 24, clé étrangère) lève une `SQLIntegrityConstraintViolationException` — le SGBD refuse de créer une incohérence référentielle. La solution métier dépend du contexte : supprimer d'abord les inscriptions liées, ou interdire la suppression tant que des inscriptions existent (souvent le bon choix pour préserver un historique).
</div>

## 27.6 CRUD complet : Gestion des employés

```java
public class EmployeCRUD {
    public int creer(Employe e) throws SQLException {
        String sql = "INSERT INTO employe (nom, poste, salaire) VALUES (?, ?, ?)";
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, e.getNom());
            stmt.setString(2, e.getPoste());
            stmt.setDouble(3, e.getSalaire());
            stmt.executeUpdate();
            try (ResultSet cles = stmt.getGeneratedKeys()) {
                return cles.next() ? cles.getInt(1) : -1;
            }
        }
    }

    public List<Employe> listerParPoste(String poste) throws SQLException {
        String sql = "SELECT * FROM employe WHERE poste = ?";
        List<Employe> resultats = new ArrayList<>();
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql)) {
            stmt.setString(1, poste);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    resultats.add(new Employe(rs.getInt("id"), rs.getString("nom"),
                        rs.getString("poste"), rs.getDouble("salaire")));
                }
            }
        }
        return resultats;
    }
    // modifier() et supprimer() suivent EXACTEMENT le même patron que pour Etudiant (sections 27.4-27.5)
}
```

## 27.7 CRUD complet : Gestion des produits

```java
public class ProduitCRUD {
    public int creer(Produit p) throws SQLException {
        String sql = "INSERT INTO produit (nom, prix, stock) VALUES (?, ?, ?)";
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, p.getNom());
            stmt.setDouble(2, p.getPrix());
            stmt.setInt(3, p.getStock());
            stmt.executeUpdate();
            try (ResultSet cles = stmt.getGeneratedKeys()) {
                return cles.next() ? cles.getInt(1) : -1;
            }
        }
    }

    public List<Produit> rechercherSousSeuil(int seuilStock) throws SQLException {
        String sql = "SELECT * FROM produit WHERE stock < ? ORDER BY stock ASC";
        List<Produit> resultats = new ArrayList<>();
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql)) {
            stmt.setInt(1, seuilStock);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    resultats.add(new Produit(rs.getInt("id"), rs.getString("nom"),
                        rs.getDouble("prix"), rs.getInt("stock")));
                }
            }
        }
        return resultats;
    }
}
```

## 27.8 CRUD complet : Gestion des clients

```java
public class ClientCRUD {
    public void modifierSoldeDu(int clientId, double montant) throws SQLException {
        String sql = "UPDATE client SET solde_du = solde_du + ? WHERE id = ?";
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql)) {
            stmt.setDouble(1, montant);
            stmt.setInt(2, clientId);
            stmt.executeUpdate();
        }
    }

    public List<Client> listerAvecDette() throws SQLException {
        String sql = "SELECT * FROM client WHERE solde_du > 0 ORDER BY solde_du DESC";
        List<Client> resultats = new ArrayList<>();
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                resultats.add(new Client(rs.getInt("id"), rs.getString("nom"), rs.getDouble("solde_du")));
            }
        }
        return resultats;
    }
}
```

## 27.9 CRUD complet : Gestion des commandes

```java
public class CommandeCRUD {
    public int creer(int clientId, LocalDate dateCommande) throws SQLException {
        String sql = "INSERT INTO commande (client_id, date_commande) VALUES (?, ?)";
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, clientId);
            stmt.setDate(2, java.sql.Date.valueOf(dateCommande));
            stmt.executeUpdate();
            try (ResultSet cles = stmt.getGeneratedKeys()) {
                return cles.next() ? cles.getInt(1) : -1;
            }
        }
    }

    public List<Commande> listerParClient(int clientId) throws SQLException {
        String sql = "SELECT * FROM commande WHERE client_id = ? ORDER BY date_commande DESC";
        List<Commande> resultats = new ArrayList<>();
        try (Connection c = ConfigDB.obtenirConnexion();
             PreparedStatement stmt = c.prepareStatement(sql)) {
            stmt.setInt(1, clientId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    resultats.add(new Commande(rs.getInt("id"), rs.getInt("client_id"),
                        rs.getDate("date_commande").toLocalDate()));
                }
            }
        }
        return resultats;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le même patron, cinq fois : c'est exactement le signe qu'il faut le factoriser</span>
Remarque volontaire à ce stade : ces cinq CRUD répètent une structure quasi identique (connexion, `PreparedStatement`, mapping `ResultSet`→objet). Ce constat est **exactement** le problème que le chapitre 30 (Architecture DAO) résout en généralisant ce patron, plutôt que de le dupliquer à chaque nouvelle entité.
</div>

## 27.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier que les index de PreparedStatement commencent à 1, pas 0</span>
```java
stmt.setString(0, nom); // ❌ SQLException : "Parameter index out of range" — commence à 1, pas 0 !
stmt.setString(1, nom); // ✅ Premier paramètre "?"
```
Contrairement aux tableaux et listes Java (index base 0), les paramètres de `PreparedStatement` et les colonnes de `ResultSet` (accessibles aussi par index) utilisent une numérotation **base 1** — une source d'erreur fréquente en venant d'un contexte purement Java.
</div>

## 27.11 Résumé du chapitre

- CREATE (`INSERT` + `RETURN_GENERATED_KEYS`), READ (`SELECT` + mapping `ResultSet`→objet), UPDATE, DELETE suivent un patron similaire, répété sur cinq domaines métier.
- `Optional` (rappel du chapitre 17) exprime proprement l'absence de résultat, plutôt qu'un retour `null`.
- Une contrainte de clé étrangère peut faire échouer un `DELETE` — un comportement voulu, pas un bug.
- Le nombre de lignes affectées par `executeUpdate()` permet de détecter un id inexistant sans exception.
- La répétition de ce patron sur cinq entités annonce directement le besoin d'une architecture DAO généralisée (chapitre 30).

*Chapitre suivant : PreparedStatement en détail, pour comprendre pourquoi il protège contre les injections SQL.*
