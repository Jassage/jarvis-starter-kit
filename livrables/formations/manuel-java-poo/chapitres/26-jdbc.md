<div class="chapitre-titre-num">CHAPITRE 26</div>

# JDBC (Java Database Connectivity)

## Objectifs pédagogiques

Comprendre l'architecture JDBC, installer un pilote (connecteur) MySQL/PostgreSQL, configurer un projet Maven, établir une connexion à une base de données, et gérer proprement les exceptions et ressources.

## 26.1 Présentation de JDBC

**JDBC** (*Java Database Connectivity*) est l'API standard de Java pour communiquer avec une base de données relationnelle — elle définit un ensemble d'interfaces (`Connection`, `Statement`, `ResultSet`) que chaque SGBD implémente via son propre **pilote** (driver).

<div class="encadre astuce">
<span class="encadre-titre">💡 Le même code Java, presque indépendant du SGBD</span>
Grâce à cette abstraction (une application directe du principe d'inversion de dépendance, chapitre 19), le code Java écrit avec les interfaces JDBC change **très peu** en passant de MySQL à PostgreSQL — seule la chaîne de connexion et le pilote chargé diffèrent, le reste du code (`Statement`, `ResultSet`) reste identique.
</div>

## 26.2 Architecture JDBC

**Architecture JDBC**

```{.uml}
┌─────────────────┐
│  Application Java   │
├─────────────────┤
│   API JDBC (interfaces) │  ← Connection, Statement, ResultSet (chapitre 27)
├─────────────────┤
│  Pilote JDBC (driver)   │  ← mysql-connector-j, postgresql (spécifique à chaque SGBD)
├─────────────────┤
│   Serveur de base de données │  ← MySQL, PostgreSQL...
└─────────────────┘
```

## 26.3 Les pilotes JDBC

| SGBD | Nom du pilote (dépendance Maven) |
|---|---|
| MySQL | `com.mysql:mysql-connector-j` |
| PostgreSQL | `org.postgresql:postgresql` |

## 26.4 Configuration avec Maven

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.3.0</version>
    </dependency>
</dependencies>
```

```xml
<!-- Pour PostgreSQL, à la place -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>
```

## 26.5 Configuration avec Gradle (alternative)

```groovy
// build.gradle
dependencies {
    implementation 'com.mysql:mysql-connector-j:8.3.0'
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Depuis Java 6, aucun Class.forName() manuel n'est nécessaire</span>
D'anciens tutoriels JDBC montrent `Class.forName("com.mysql.cj.jdbc.Driver")` avant toute connexion. Depuis le mécanisme **ServiceLoader** (Java 6+), le pilote présent dans les dépendances est détecté **automatiquement** — cette ligne est aujourd'hui obsolète et peut être omise.
</div>

## 26.6 Créer une connexion à la base de données

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConnexion {
    private static final String URL = "jdbc:mysql://localhost:3306/gestion_commerciale";
    private static final String UTILISATEUR = "root";
    private static final String MOT_DE_PASSE = "motdepasse";

    public static void main(String[] args) {
        try (Connection connexion = DriverManager.getConnection(URL, UTILISATEUR, MOT_DE_PASSE)) {
            System.out.println("Connexion réussie !");
        } catch (SQLException e) {
            System.out.println("Échec de connexion : " + e.getMessage());
        }
    }
}
```

**Anatomie de l'URL JDBC :** `jdbc:mysql://hôte:port/nomBaseDeDonnees` — `jdbc:mysql://` identifie le protocole et le SGBD, `localhost:3306` le serveur (3306 est le port par défaut de MySQL), `gestion_commerciale` la base ciblée.

## 26.7 Gestion des exceptions SQL

```java
try (Connection connexion = DriverManager.getConnection(URL, UTILISATEUR, MOT_DE_PASSE)) {
    // ... opérations sur la base ...
} catch (SQLException e) {
    System.out.println("Code erreur SQL : " + e.getErrorCode());
    System.out.println("État SQL : " + e.getSQLState());
    System.out.println("Message : " + e.getMessage());
}
```

`SQLException` (exception **vérifiée**, rappel du chapitre 12) doit toujours être gérée explicitement — impossible d'ignorer silencieusement un problème de connexion ou de requête, le compilateur l'exige.

## 26.8 Fermeture des ressources : Connection, Statement, ResultSet

```java
// ❌ Approche manuelle, verbeuse et à risque d'oubli
Connection connexion = null;
Statement statement = null;
ResultSet resultSet = null;
try {
    connexion = DriverManager.getConnection(URL, UTILISATEUR, MOT_DE_PASSE);
    statement = connexion.createStatement();
    resultSet = statement.executeQuery("SELECT * FROM client");
    // ...
} catch (SQLException e) {
    System.out.println(e.getMessage());
} finally {
    // Fermeture manuelle dans l'ORDRE INVERSE de création, avec des try/catch imbriqués nécessaires...
    if (resultSet != null) try { resultSet.close(); } catch (SQLException e) { /* ignoré */ }
    if (statement != null) try { statement.close(); } catch (SQLException e) { /* ignoré */ }
    if (connexion != null) try { connexion.close(); } catch (SQLException e) { /* ignoré */ }
}
```

## 26.9 try-with-resources : l'approche recommandée (rappel du chapitre 12)

```java
// ✅ Connection, Statement et ResultSet implémentent tous AutoCloseable
try (Connection connexion = DriverManager.getConnection(URL, UTILISATEUR, MOT_DE_PASSE);
     Statement statement = connexion.createStatement();
     ResultSet resultSet = statement.executeQuery("SELECT * FROM client")) {

    while (resultSet.next()) {
        System.out.println(resultSet.getString("nom"));
    }
} catch (SQLException e) {
    System.out.println("Erreur : " + e.getMessage());
}
// Les TROIS ressources sont fermées automatiquement, dans l'ordre inverse de déclaration, même en cas d'exception
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce manuel utilise systématiquement try-with-resources pour JDBC</span>
Tous les exemples JDBC des chapitres 27 à 30 utilisent cette syntaxe — plus courte, plus sûre (aucun risque d'oubli de fermeture), et c'est la pratique professionnelle standard depuis Java 7.
</div>

## 26.10 Externaliser la configuration (bonnes pratiques de sécurité)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais coder en dur les identifiants de connexion dans le code source</span>
```java
private static final String MOT_DE_PASSE = "motdepasse123"; // ❌ visible dans le code, versionné dans Git !
```
Un mot de passe de base de données en dur dans le code source finit tôt ou tard dans l'historique Git, potentiellement visible publiquement si le dépôt est partagé. La bonne pratique : externaliser dans un fichier `application.properties` (chapitre 30-31), **exclu du contrôle de version** (`.gitignore`).
</div>

```properties
# src/main/resources/application.properties (JAMAIS commité avec de vraies valeurs en production)
db.url=jdbc:mysql://localhost:3306/gestion_commerciale
db.user=root
db.password=motdepasse
```

```java
import java.io.InputStream;
import java.util.Properties;

public class ConfigDB {
    public static Connection obtenirConnexion() throws SQLException, IOException {
        Properties props = new Properties();
        try (InputStream input = ConfigDB.class.getClassLoader()
                .getResourceAsStream("application.properties")) {
            props.load(input);
        }
        return DriverManager.getConnection(
            props.getProperty("db.url"),
            props.getProperty("db.user"),
            props.getProperty("db.password")
        );
    }
}
```

## 26.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Communication link failure : le SGBD n'est pas démarré, ou le port est incorrect</span>
Une des erreurs les plus fréquentes chez les débutants : `com.mysql.cj.jdbc.exceptions.CommunicationsException` signifie généralement que le serveur MySQL n'est pas démarré, ou que le port dans l'URL (souvent 3306) ne correspond pas à la configuration réelle du serveur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Access denied for user : identifiants incorrects</span>
`Access denied for user 'root'@'localhost'` signale un mot de passe incorrect, ou un utilisateur sans les droits d'accès à la base ciblée — à vérifier directement via `mysql -u root -p` en ligne de commande avant de chercher un bug côté Java.
</div>

## 26.12 Résumé du chapitre

- JDBC fournit une API standard (`Connection`, `Statement`, `ResultSet`) indépendante du SGBD ; seul le pilote (dépendance Maven/Gradle) change selon MySQL/PostgreSQL.
- `DriverManager.getConnection(url, utilisateur, motDePasse)` établit la connexion ; le pilote est détecté automatiquement depuis Java 6+.
- `try-with-resources` doit systématiquement fermer `Connection`, `Statement` et `ResultSet`.
- Les identifiants de connexion doivent être externalisés dans un fichier de configuration, jamais codés en dur dans le code source versionné.

*Chapitre suivant : les opérations CRUD (Create, Read, Update, Delete) avec JDBC, développées pas à pas sur plusieurs cas métier.*
