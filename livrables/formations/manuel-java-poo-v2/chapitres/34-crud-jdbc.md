<div class="chapitre-titre-num">CHAPITRE 34</div>

# Les opérations CRUD avec JDBC

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras créer, lire, modifier et supprimer des données MySQL depuis un programme Java, en toute sécurité avec `PreparedStatement`.

## A. Le problème

Le chapitre 33 a ouvert une connexion, mais sans jamais envoyer la moindre requête SQL réelle. Il manque un mécanisme pour transmettre une commande `SELECT`, `INSERT`, `UPDATE` ou `DELETE` (chapitre 32) à la base de données, et pour récupérer un résultat.

## B. Explication très simple

> **CRUD** est un acronyme (Create, Read, Update, Delete) désignant les quatre opérations de base sur des données, exactement les commandes SQL du chapitre 32 : `INSERT`, `SELECT`, `UPDATE`, `DELETE`.

## C. Create (INSERT)

```java
import java.sql.*;

public class InsertionEtudiant {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:mysql://localhost:3306/ecole";

        try (Connection connexion = DriverManager.getConnection(url, "root", "motdepasse123");
             PreparedStatement requete = connexion.prepareStatement(
                 "INSERT INTO etudiants (nom, age, moyenne) VALUES (?, ?, ?)")) {

            requete.setString(1, "Jaslin");
            requete.setInt(2, 22);
            requete.setDouble(3, 16.5);

            requete.executeUpdate();
            System.out.println("Étudiant inséré avec succès");
        }
    }
}
```

## D. Explication ligne par ligne

```{.uml}
PreparedStatement requete = connexion.prepareStatement(
    "INSERT INTO etudiants (nom, age, moyenne) VALUES (?, ?, ?)")
       │                                                    │
       │                                                    └─ Les "?" sont des
       │                                                       PLACEHOLDERS :
       │                                                       des emplacements
       │                                                       réservés, remplis
       │                                                       ensuite un par un.
       └─ PREPARE la requête, SANS encore l'exécuter.

requete.setString(1, "Jaslin");
requete.setInt(2, 22);
requete.setDouble(3, 16.5);
              │      │
              │      └─ La VALEUR à placer.
              └─ La POSITION du "?" à remplir (1 = le premier, PAS 0 !).

requete.executeUpdate();
             │
             └─ EXÉCUTE réellement la requête. "executeUpdate" pour
                INSERT/UPDATE/DELETE (qui ne renvoient pas de lignes,
                juste un nombre de lignes affectées).
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : PreparedStatement</span>
Un <code>PreparedStatement</code> est une requête SQL "préparée" à l'avance, avec des emplacements réservés (<code>?</code>) remplis séparément, plutôt que construite en collant directement du texte. C'est la façon <strong>sûre</strong> et <strong>recommandée</strong> d'exécuter du SQL depuis Java — la section suivante explique pourquoi.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne JAMAIS construire une requête SQL en collant du texte utilisateur</span>

```java
// ❌ DANGEREUX : injection SQL possible !
String nom = "Jaslin'; DROP TABLE etudiants; --"; // une entrée malveillante
Statement requete = connexion.createStatement();
requete.executeUpdate("INSERT INTO etudiants (nom) VALUES ('" + nom + "')");
// La base de données exécute alors DEUX commandes : l'insertion, PUIS la suppression de toute la table !
```

Coller directement du texte (surtout une entrée fournie par un utilisateur) dans une requête SQL ouvre la porte à l'**injection SQL**, l'une des failles de sécurité les plus classiques et les plus dangereuses de toute la programmation. `PreparedStatement`, avec ses `?`, empêche structurellement ce genre d'attaque : la valeur est toujours traitée comme une simple donnée, jamais comme du code SQL exécutable.
</div>

## E. Read (SELECT)

```java
try (Connection connexion = DriverManager.getConnection(url, "root", "motdepasse123");
     PreparedStatement requete = connexion.prepareStatement(
         "SELECT nom, age, moyenne FROM etudiants WHERE moyenne >= ?")) {

    requete.setDouble(1, 14.0);

    try (ResultSet resultats = requete.executeQuery()) {
        while (resultats.next()) {
            String nom = resultats.getString("nom");
            int age = resultats.getInt("age");
            double moyenne = resultats.getDouble("moyenne");
            System.out.println(nom + " (" + age + " ans) : " + moyenne);
        }
    }
}
```

```{.uml}
ResultSet resultats = requete.executeQuery();
    │                          │
    │                          └─ "executeQuery" pour SELECT uniquement
    │                             (contrairement à executeUpdate).
    └─ Un curseur, qui parcourt les LIGNES renvoyées par la requête.

while (resultats.next()) {
             │
             └─ Avance à la ligne SUIVANTE, renvoie false s'il n'y en a plus
                (exactement comme readLine() renvoyait null au chapitre 24).

resultats.getString("nom");
              │           │
              │           └─ Le NOM de la colonne à lire (peut aussi être
              │              une position numérique, comme pour setString).
              └─ Lit la valeur de cette colonne, pour la ligne COURANTE.
```

## Update et Delete

```java
try (Connection connexion = DriverManager.getConnection(url, "root", "motdepasse123");
     PreparedStatement requete = connexion.prepareStatement(
         "UPDATE etudiants SET moyenne = ? WHERE nom = ?")) {

    requete.setDouble(1, 18.0);
    requete.setString(2, "Jaslin");

    int lignesModifiees = requete.executeUpdate();
    System.out.println(lignesModifiees + " ligne(s) modifiée(s)");
}
```

```java
try (Connection connexion = DriverManager.getConnection(url, "root", "motdepasse123");
     PreparedStatement requete = connexion.prepareStatement(
         "DELETE FROM etudiants WHERE moyenne < ?")) {

    requete.setDouble(1, 10.0);
    int lignesSupprimees = requete.executeUpdate();
    System.out.println(lignesSupprimees + " ligne(s) supprimée(s)");
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 executeUpdate() renvoie un nombre, pas les données elles-mêmes</span>
Pour <code>INSERT</code>, <code>UPDATE</code> et <code>DELETE</code>, <code>executeUpdate()</code> renvoie le <strong>nombre de lignes affectées</strong> — utile pour vérifier, par exemple, qu'une suppression a réellement trouvé et supprimé quelque chose (<code>0</code> signifierait qu'aucune ligne ne correspondait à la condition).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre executeQuery() et executeUpdate()</span>

```java
requete.executeQuery("DELETE FROM etudiants WHERE id = 1"); // ❌ erreur : executeQuery est pour SELECT
requete.executeUpdate("SELECT * FROM etudiants");            // ❌ erreur : executeUpdate est pour INSERT/UPDATE/DELETE
```

Utiliser la mauvaise méthode provoque une `SQLException` immédiate. Retiens : `executeQuery` = lire (renvoie un `ResultSet`) ; `executeUpdate` = écrire (renvoie un nombre de lignes affectées).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Compter les positions des ? à partir de 0</span>

```java
requete.setString(0, "Jaslin"); // 💥 erreur : les positions JDBC commencent à 1, PAS à 0 !
requete.setString(1, "Jaslin"); // ✅ correct
```

Contrairement aux indices de tableaux (chapitre 3) et aux listes (chapitre 19), qui commencent tous à `0`, les positions des `?` d'un `PreparedStatement` commencent à **1** — une exception notable à la règle habituelle, source d'erreur fréquente.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais insérer des données avec PreparedStatement et executeUpdate().
✓ Je sais lire des données avec executeQuery() et parcourir un ResultSet.
✓ Je sais modifier et supprimer des données avec UPDATE et DELETE.
✓ Je sais pourquoi PreparedStatement protège contre l'injection SQL.
✓ Je sais que les positions des ? commencent à 1, pas à 0.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pourquoi ce code est-il dangereux, et comment le corriger ?

```java
Statement requete = connexion.createStatement();
requete.executeUpdate("DELETE FROM etudiants WHERE nom = '" + nomSaisi + "'");
```
</div>

## Correction

Ce code construit la requête en collant directement `nomSaisi` (potentiellement une entrée utilisateur) dans le texte SQL, ouvrant la porte à une injection SQL. Correction :
```java
PreparedStatement requete = connexion.prepareStatement("DELETE FROM etudiants WHERE nom = ?");
requete.setString(1, nomSaisi);
requete.executeUpdate();
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `compterEtudiantsAdmis(Connection connexion)` qui exécute `SELECT COUNT(*) FROM etudiants WHERE moyenne >= 10`, et renvoie ce compte (indice : lis la colonne par sa position, `resultats.getInt(1)`, puisque `COUNT(*)` n'a pas de nom de colonne explicite).
</div>

### Corrigé du défi

```java
static int compterEtudiantsAdmis(Connection connexion) throws SQLException {
    String sql = "SELECT COUNT(*) FROM etudiants WHERE moyenne >= 10";

    try (PreparedStatement requete = connexion.prepareStatement(sql);
         ResultSet resultats = requete.executeQuery()) {

        if (resultats.next()) {
            return resultats.getInt(1);
        }
        return 0;
    }
}
```

## Résumé du chapitre

- **CRUD** désigne les quatre opérations de base : Create (`INSERT`), Read (`SELECT`), Update (`UPDATE`), Delete (`DELETE`).
- `PreparedStatement` prépare une requête avec des `?`, remplis ensuite avec `setString`, `setInt`, `setDouble`...
- `executeUpdate()` pour `INSERT`/`UPDATE`/`DELETE` (renvoie un nombre de lignes affectées) ; `executeQuery()` pour `SELECT` (renvoie un `ResultSet`).
- `ResultSet.next()` avance ligne par ligne ; `getString`/`getInt`/`getDouble` lisent une colonne de la ligne courante.
- `PreparedStatement` protège structurellement contre l'injection SQL — ne jamais coller du texte directement dans une requête.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris le `PreparedStatement` (préparation + remplissage, sans l'exécuter) qui insérerait un produit `("Riz", 250.0)` dans une table `produits (nom, prix)`.
</div>

**Corrigé :**
```java
PreparedStatement requete = connexion.prepareStatement(
    "INSERT INTO produits (nom, prix) VALUES (?, ?)");
requete.setString(1, "Riz");
requete.setDouble(2, 250.0);
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Complète cette lecture de résultats pour afficher chaque nom de produit trouvé :

```java
ResultSet resultats = requete.executeQuery();
// à compléter
```
</div>

**Corrigé :**
```java
while (resultats.next()) {
    System.out.println(resultats.getString("nom"));
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Écris une méthode `mettreAJourStock(Connection connexion, String nomProduit, int nouvelleQuantite)` qui exécute un `UPDATE`, et affiche `"Produit introuvable"` si `executeUpdate()` renvoie `0`.
</div>

**Corrigé :**
```java
static void mettreAJourStock(Connection connexion, String nomProduit, int nouvelleQuantite) throws SQLException {
    String sql = "UPDATE produits SET quantite = ? WHERE nom = ?";
    try (PreparedStatement requete = connexion.prepareStatement(sql)) {
        requete.setInt(1, nouvelleQuantite);
        requete.setString(2, nomProduit);

        int lignesModifiees = requete.executeUpdate();
        if (lignesModifiees == 0) {
            System.out.println("Produit introuvable");
        } else {
            System.out.println("Stock mis à jour");
        }
    }
}
```

---

*Chapitre suivant : l'architecture DAO, pour organiser proprement tout ce code JDBC plutôt que de le disperser dans tout le programme.*
