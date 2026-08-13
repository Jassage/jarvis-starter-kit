<div class="chapitre-titre-num">CHAPITRE 33</div>

# Connecter Java à MySQL

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras établir une connexion entre un programme Java et une base de données MySQL, avec JDBC.

## A. Le problème

Les chapitres 31 et 32 ont montré ce qu'est une base de données et comment lui parler en SQL — mais **directement dans un terminal**, jamais depuis un vrai programme Java. Comment un programme Java peut-il envoyer une requête SQL à une base de données, et récupérer le résultat ?

## B. Explication très simple

```text
   Java
    ↓
   JDBC
    ↓
Pilote MySQL
    ↓
  MySQL
```

> **JDBC** (Java DataBase Connectivity) est l'ensemble d'outils fournis par Java pour se connecter à une base de données, lui envoyer des requêtes SQL, et récupérer les résultats. Un **pilote** (driver) spécifique à chaque base de données (MySQL, PostgreSQL...) fait le lien technique entre JDBC et cette base précise.

Pense à JDBC comme à une prise électrique universelle : elle définit **comment** brancher n'importe quel appareil (n'importe quelle base de données), mais chaque appareil a besoin de son propre adaptateur (le pilote) pour vraiment fonctionner.

## C. Établir une connexion, étape par étape

**Étape 1 — Ajouter le pilote MySQL au projet.** (Le chapitre 41, Maven, expliquera la façon professionnelle de gérer cette dépendance ; pour l'instant, retiens simplement qu'un fichier `.jar` du pilote MySQL doit être disponible au projet.)

**Étape 2 — Définir les informations de connexion.**

```java
String url = "jdbc:mysql://localhost:3306/ecole";
String utilisateur = "root";
String motDePasse = "motdepasse123";
```

```{.uml}
jdbc:mysql://localhost:3306/ecole
  │      │       │         │    │
  │      │       │         │    └─ Le nom de la BASE DE DONNÉES précise à utiliser.
  │      │       │         └─ Le PORT (3306 est le port standard de MySQL).
  │      │       └─ L'ADRESSE du serveur ("localhost" = cet ordinateur même).
  │      └─ Le TYPE de base de données ciblée.
  └─ Préfixe obligatoire de toute URL JDBC.
```

**Étape 3 — Ouvrir la connexion.**

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConnexion {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/ecole";
        String utilisateur = "root";
        String motDePasse = "motdepasse123";

        try (Connection connexion = DriverManager.getConnection(url, utilisateur, motDePasse)) {
            System.out.println("Connexion réussie !");
        } catch (SQLException e) {
            System.out.println("Erreur de connexion : " + e.getMessage());
        }
    }
}
```

## D. Explication ligne par ligne

```{.uml}
try (Connection connexion = DriverManager.getConnection(url, utilisateur, motDePasse)) {
   │        │                       │                       │
   │        │                       │                       └─ Les 3 informations
   │        │                       │                          de l'étape 2.
   │        │                       └─ Demande à Java d'établir RÉELLEMENT la
   │        │                          connexion réseau vers la base de données.
   │        └─ Le TYPE représentant une connexion active à une base de données.
   └─ "try (...)" : try-with-resources (chapitre 24) — la connexion sera
      TOUJOURS fermée automatiquement, même en cas d'erreur, exactement
      comme pour un fichier.
} catch (SQLException e) {
    ...
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : SQLException</span>
<code>SQLException</code> est l'exception vérifiée (chapitre 23) que JDBC lève dès qu'une opération de base de données échoue : identifiants incorrects, serveur MySQL éteint, base inexistante, requête SQL mal formée... Toute interaction JDBC doit être entourée d'un <code>try/catch</code> (ou déclarer <code>throws SQLException</code>).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Le serveur MySQL n'est pas démarré</span>

```text
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

Ce message signifie généralement que le serveur MySQL n'est tout simplement pas en cours d'exécution sur la machine ciblée, ou que le port indiqué (3306 par défaut) est incorrect ou bloqué.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Stocker le mot de passe directement dans le code source</span>

```java
String motDePasse = "motdepasse123"; // ⚠️ acceptable pour un exercice d'apprentissage,
                                       //    JAMAIS pour une vraie application déployée
```

Dans un vrai projet professionnel, les identifiants de connexion (mot de passe, en particulier) ne doivent **jamais** être écrits directement dans le code source, surtout si ce code est partagé sur un dépôt Git (chapitre 42) — un fichier de configuration séparé, exclu du dépôt, ou des variables d'environnement, sont les approches standard, hors du périmètre détaillé de ce manuel.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je comprends le rôle de JDBC : faire le pont entre Java et une base de données.
✓ Je sais construire une URL de connexion JDBC pour MySQL.
✓ Je sais ouvrir une connexion avec DriverManager.getConnection().
✓ Je sais utiliser try-with-resources pour fermer automatiquement la connexion.
✓ Je sais qu'une SQLException signale un problème de base de données.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Décompose cette URL JDBC : `jdbc:mysql://192.168.1.10:3306/banque` — quelle est l'adresse du serveur, quel est le port, quelle est la base de données ciblée ?
</div>

## Correction

Adresse du serveur : `192.168.1.10` (un serveur distant, pas forcément la machine locale). Port : `3306`. Base de données : `banque`.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `ouvrirConnexion()` qui renvoie un `Optional<Connection>` (chapitre 28) : `Optional.of(connexion)` en cas de succès, `Optional.empty()` en cas d'échec (en capturant `SQLException` et en affichant le message d'erreur).
</div>

### Corrigé du défi

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Optional;

public class ConnexionUtil {
    static Optional<Connection> ouvrirConnexion() {
        String url = "jdbc:mysql://localhost:3306/ecole";
        try {
            Connection connexion = DriverManager.getConnection(url, "root", "motdepasse123");
            return Optional.of(connexion);
        } catch (SQLException e) {
            System.out.println("Connexion impossible : " + e.getMessage());
            return Optional.empty();
        }
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Remarque volontaire sur ce défi</span>
Ici, la connexion n'est PAS ouverte avec try-with-resources, car elle doit rester ouverte et être renvoyée à l'appelant, qui devra lui-même la fermer une fois son travail terminé — un compromis assumé et courant, à condition de toujours veiller, ailleurs dans le programme, à ce que cette connexion soit bien fermée en fin d'utilisation.
</div>

## Résumé du chapitre

- **JDBC** relie un programme Java à une base de données, via un pilote spécifique (MySQL, PostgreSQL...).
- Une URL JDBC suit le format `jdbc:type://adresse:port/base`.
- `DriverManager.getConnection(url, utilisateur, motDePasse)` établit la connexion.
- `try-with-resources` ferme automatiquement la connexion, même en cas d'erreur.
- `SQLException` est l'exception vérifiée signalant tout problème lié à la base de données.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris l'URL JDBC pour une base de données `boutique`, sur le serveur local, port par défaut.
</div>

**Corrigé :** `jdbc:mysql://localhost:3306/boutique`

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pourquoi ce code, bien qu'il compile, est-il risqué en cas d'erreur de connexion ?

```java
Connection connexion = DriverManager.getConnection(url, user, pass);
// ... du code qui utilise connexion ...
connexion.close();
```
</div>

**Corrigé :** Si une exception survient entre l'ouverture et `connexion.close()`, cette dernière ligne ne s'exécutera jamais, laissant la connexion ouverte indéfiniment (une fuite de ressource). `try-with-resources` évite ce risque en garantissant la fermeture, quoi qu'il arrive.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Explique en une phrase pourquoi il est dangereux, dans un vrai projet professionnel destiné à être publié sur GitHub, d'écrire le mot de passe de la base de données directement dans le code source.
</div>

**Corrigé :** Un mot de passe écrit en clair dans le code source se retrouve dans l'historique du dépôt Git (chapitre 42), potentiellement visible par quiconque y a accès, y compris publiquement si le dépôt est ouvert — un risque de sécurité réel, déjà rencontré très concrètement dans plusieurs projets réels du portefeuille de Jaslin.

---

*Chapitre suivant : les opérations CRUD avec JDBC, pour enfin créer, lire, modifier et supprimer de vraies données depuis un programme Java.*
