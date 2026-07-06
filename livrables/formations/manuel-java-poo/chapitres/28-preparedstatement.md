<div class="chapitre-titre-num">CHAPITRE 28</div>

# PreparedStatement

## Objectifs pédagogiques

Comprendre en profondeur pourquoi `PreparedStatement` protège contre les injections SQL, là où `Statement` ne le fait pas, et maîtriser sa syntaxe de paramétrage.

## 28.1 Pourquoi PreparedStatement : la faille de Statement

```java
// ❌ DANGEREUX : construction de la requête par CONCATÉNATION de chaînes
String email = champSaisieParUtilisateur.getText(); // "jaslin@mail.com' OR '1'='1"
String sql = "SELECT * FROM client WHERE email = '" + email + "'";
// La requête RÉELLEMENT exécutée devient :
// SELECT * FROM client WHERE email = 'jaslin@mail.com' OR '1'='1'
// → '1'='1' est TOUJOURS vrai : retourne TOUS les clients, pas seulement celui recherché !
```

C'est une **injection SQL** : un utilisateur malveillant insère du SQL dans un champ de saisie normal, modifiant le **sens** de la requête exécutée. Selon la requête ciblée, cela peut permettre de contourner une authentification, lire des données non autorisées, voire supprimer des tables entières (`'; DROP TABLE client; --`).

## 28.2 PreparedStatement : la protection structurelle

```java
// ✅ SÛR : la requête est PRÉ-COMPILÉE avec des espaces réservés ("?"), les valeurs sont ENVOYÉES SÉPARÉMENT
String sql = "SELECT * FROM client WHERE email = ?";
try (PreparedStatement stmt = connexion.prepareStatement(sql)) {
    stmt.setString(1, email); // "jaslin@mail.com' OR '1'='1" est traité comme UNE SEULE VALEUR littérale
    ResultSet rs = stmt.executeQuery();
}
// La base cherche un email EXACTEMENT égal à la chaîne "jaslin@mail.com' OR '1'='1" (qui n'existe pas)
// — le contenu du paramètre ne peut JAMAIS modifier la STRUCTURE de la requête.
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi c'est structurellement impossible, pas juste "filtré"</span>
`PreparedStatement` envoie la requête SQL (avec ses `?`) au serveur **séparément** des valeurs des paramètres, dans deux étapes distinctes : (1) la structure de la requête est compilée une première fois, (2) les valeurs sont injectées ensuite **en tant que données**, jamais réinterprétées comme du code SQL. Ce n'est pas un simple "nettoyage" de la chaîne (comme échapper les apostrophes) : la séparation est **structurelle**, rendant l'injection SQL par ce biais tout simplement impossible.
</div>

## 28.3 Paramètres : types et méthodes set

```java
PreparedStatement stmt = connexion.prepareStatement(
    "INSERT INTO etudiant (nom, age, date_inscription, actif) VALUES (?, ?, ?, ?)"
);
stmt.setString(1, "Jaslin");
stmt.setInt(2, 22);
stmt.setDate(3, java.sql.Date.valueOf(LocalDate.now()));
stmt.setBoolean(4, true);

// setNull pour une valeur SQL NULL explicite
stmt.setNull(2, java.sql.Types.INTEGER);

// setObject : accepte (presque) n'importe quel type, JDBC déduit la conversion
stmt.setObject(2, 22);
```

| Méthode | Type Java | Type SQL |
|---|---|---|
| `setString` | `String` | `VARCHAR`, `TEXT` |
| `setInt` | `int` | `INT` |
| `setDouble` | `double` | `DECIMAL`, `DOUBLE` |
| `setDate` | `java.sql.Date` | `DATE` |
| `setBoolean` | `boolean` | `BOOLEAN`, `TINYINT(1)` |
| `setNull` | — | `NULL` explicite |

## 28.4 Exemple complet : recherche multicritère sécurisée

```java
public List<Etudiant> rechercher(String motCleNom, Integer ageMinimum) throws SQLException {
    StringBuilder sql = new StringBuilder("SELECT * FROM etudiant WHERE 1=1");
    List<Object> parametres = new ArrayList<>();

    if (motCleNom != null && !motCleNom.isBlank()) {
        sql.append(" AND nom LIKE ?");
        parametres.add("%" + motCleNom + "%");
    }
    if (ageMinimum != null) {
        sql.append(" AND age >= ?");
        parametres.add(ageMinimum);
    }

    try (Connection connexion = ConfigDB.obtenirConnexion();
         PreparedStatement stmt = connexion.prepareStatement(sql.toString())) {

        for (int i = 0; i < parametres.size(); i++) {
            stmt.setObject(i + 1, parametres.get(i)); // index base 1 (rappel du chapitre 27)
        }

        List<Etudiant> resultats = new ArrayList<>();
        try (ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                resultats.add(new Etudiant(rs.getInt("id"), rs.getString("nom"),
                    rs.getString("email"), rs.getInt("age")));
            }
        }
        return resultats;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 WHERE 1=1 : une astuce pour simplifier la construction dynamique</span>
`WHERE 1=1` est une condition toujours vraie, qui permet d'ajouter chaque filtre suivant avec `AND ...` de façon uniforme, sans avoir à gérer spécialement le tout premier filtre (qui, sans cette astuce, ne devrait pas commencer par `AND`).
</div>

## 28.5 Comparaison Statement vs PreparedStatement

| Critère | Statement | PreparedStatement |
|---|---|---|
| Protection contre l'injection SQL | ❌ Aucune (concaténation manuelle) | ✅ Structurelle |
| Performance sur requêtes répétées | Recompilée à chaque exécution | Compilée une fois, réutilisable (`executeBatch`, chapitre 27) |
| Lisibilité avec valeurs dynamiques | Concaténation source d'erreurs | Paramètres `?` clairs et typés |
| Cas d'usage légitime restant | Requêtes DDL fixes sans paramètre (`CREATE TABLE`) | **Toujours**, dès qu'une valeur externe intervient |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Règle professionnelle stricte : jamais de Statement avec une valeur venant de l'utilisateur</span>
Il n'existe **aucune** justification légitime à utiliser `Statement` (plutôt que `PreparedStatement`) dès qu'une requête intègre une valeur provenant, même indirectement, d'une saisie utilisateur, d'un paramètre d'API, ou de toute source externe non totalement fixe et contrôlée par le développeur.
</div>

## 28.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mettre des guillemets autour du ? par réflexe (habitude du SQL écrit à la main)</span>
```java
String sql = "SELECT * FROM client WHERE email = '?'"; // ❌ "?" devient un LITTÉRAL, plus un paramètre !
```
Le `?` de `PreparedStatement` ne doit **jamais** être entouré de guillemets, contrairement à une valeur SQL écrite à la main (`WHERE email = 'jaslin@mail.com'`) — JDBC gère lui-même l'échappement nécessaire selon le type de la valeur fournie via `setString`/`setInt`/etc.
</div>

## 28.7 Résumé du chapitre

- `Statement` par concaténation de chaînes expose à l'**injection SQL** ; `PreparedStatement` l'empêche structurellement en séparant requête et valeurs.
- Les méthodes `setString`/`setInt`/`setDate`/`setBoolean`/`setNull` typent explicitement chaque paramètre `?`.
- Une requête à filtres dynamiques se construit en ajoutant des `AND ?` conditionnellement, avec `WHERE 1=1` pour simplifier.
- Règle professionnelle : `PreparedStatement` systématiquement, dès qu'une valeur externe entre dans la requête.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 28.1</span>

Réécris cette requête vulnérable à l'injection SQL avec un `PreparedStatement` sécurisé :
```java
String sql = "SELECT * FROM client WHERE nom = '" + nomSaisi + "' AND actif = " + estActif;
```
</div>

**Corrigé :**
```java
String sql = "SELECT * FROM client WHERE nom = ? AND actif = ?";
try (PreparedStatement stmt = connexion.prepareStatement(sql)) {
    stmt.setString(1, nomSaisi);
    stmt.setBoolean(2, estActif);
    ResultSet rs = stmt.executeQuery();
}
```

*Chapitre suivant : les transactions, pour garantir qu'un ensemble d'opérations SQL réussissent ou échouent toutes ensemble.*
