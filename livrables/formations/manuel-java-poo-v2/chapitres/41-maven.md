<div class="chapitre-titre-num">CHAPITRE 41</div>

# Maven

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras utiliser Maven pour gérer automatiquement les dépendances externes d'un projet Java (comme le pilote MySQL du chapitre 33 ou JUnit du chapitre 39), et pour le compiler, tester et empaqueter.

## A. Le problème

Le chapitre 33 mentionnait qu'un fichier `.jar` du pilote MySQL devait être "disponible au projet", sans détailler comment. Télécharger manuellement chaque bibliothèque externe (le pilote MySQL, JUnit, et toutes celles dont elles dépendent à leur tour) et les ranger soi-même dans le projet devient vite ingérable, surtout quand une bibliothèque doit être mise à jour, ou partagée avec toute une équipe.

## B. Exemple de la vie réelle

Pense à une liste de courses avec une recette précise : plutôt que d'aller toi-même chercher chaque ingrédient dans différents magasins (et de vérifier qu'ils sont tous compatibles entre eux), tu donnes la liste à un service de livraison qui s'occupe de tout rassembler. Maven joue ce rôle pour les bibliothèques Java : tu **déclares** ce dont tu as besoin, Maven les télécharge et les organise automatiquement.

## C. Explication très simple

> **Maven** est un outil qui gère automatiquement les dépendances externes d'un projet Java, et automatise sa compilation, ses tests et son empaquetage, à partir d'un seul fichier de configuration.

## D. Le fichier pom.xml, cœur de Maven

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.jaslin</groupId>
    <artifactId>mon-projet</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## E. Explication ligne par ligne

```{.uml}
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
     │              │                        │
     │              │                        └─ La VERSION exacte souhaitée.
     │              └─ Le NOM précis de la bibliothèque.
     └─ L'ÉDITEUR ou l'organisation qui publie cette bibliothèque.

<scope>test</scope>
    │
    └─ Précise que JUnit n'est nécessaire QUE pour les tests (chapitre 39),
       jamais empaqueté dans le programme final livré aux utilisateurs.
```

Il suffit d'ajouter ces quelques lignes dans `pom.xml` : Maven télécharge automatiquement le pilote MySQL (et JUnit) depuis un dépôt en ligne centralisé, ainsi que **toutes** leurs propres dépendances internes, sans jamais avoir à chercher ni télécharger le moindre fichier manuellement.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : pom.xml</span>
<code>pom.xml</code> ("Project Object Model") est le fichier de configuration central de tout projet Maven, situé à sa racine. Il décrit le projet lui-même (nom, version) et la liste complète de ses dépendances externes.
</div>

## F. Les commandes Maven essentielles

```{.uml}
mvn compile   →  compile le projet, sans l'exécuter
mvn test      →  exécute TOUS les tests JUnit du projet (chapitre 39)
mvn package   →  compile, teste, puis empaquette le projet en un fichier .jar livrable
mvn clean     →  supprime les fichiers générés par les commandes précédentes, pour repartir propre
```

```java
$ mvn test

[INFO] Running CompteBancaireTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un IDE lance généralement Maven pour toi, en coulisses</span>
Dans la pratique quotidienne, avec un IDE (chapitre 40) configuré pour Maven, il est rarement nécessaire de taper ces commandes directement dans un terminal : un clic sur ▶️ (Exécuter) ou sur l'icône de test déclenche déjà, en coulisses, les bonnes commandes Maven équivalentes.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Une faute de frappe dans un identifiant de dépendance</span>

```xml
<artifactId>mysql-conector-java</artifactId> <!-- ❌ "conector" au lieu de "connector" -->
```

Une simple faute de frappe dans `groupId`, `artifactId` ou `version` empêche Maven de trouver la bibliothèque, provoquant une erreur de compilation (dépendance introuvable) plutôt qu'une erreur de logique — toujours vérifier l'orthographe exacte, généralement copiée depuis une documentation officielle plutôt que retapée de mémoire.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier de relancer Maven après avoir modifié pom.xml</span>
Après avoir ajouté une nouvelle dépendance dans <code>pom.xml</code>, certains IDE ne la prennent pas en compte immédiatement : il faut parfois explicitement demander de "recharger" le projet Maven (souvent une icône avec deux flèches circulaires), sous peine que les nouvelles classes de la bibliothèque restent introuvables dans le code.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je comprends le rôle de Maven : gérer automatiquement les dépendances externes.
✓ Je sais lire et ajouter une dépendance dans pom.xml.
✓ Je connais les commandes essentielles : compile, test, package, clean.
✓ Je sais que <scope>test</scope> limite une dépendance aux tests uniquement.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Quelle commande Maven exécuterais-tu pour vérifier que tous les tests JUnit du chapitre 39 passent toujours, après une modification du code ?
</div>

## Correction

`mvn test` — cette commande compile le projet puis exécute automatiquement tous les tests annotés `@Test`, affichant un résumé clair des succès et des échecs.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris le bloc `<dependency>` correspondant à une bibliothèque `com.google.code.gson` (nom d'artefact `gson`), version `2.10.1`, nécessaire au programme final (pas seulement aux tests).
</div>

### Corrigé du défi

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

Aucun `<scope>test</scope>` ici, puisque cette bibliothèque est nécessaire au programme final, pas seulement à l'exécution des tests.

## Résumé du chapitre

- **Maven** gère automatiquement les dépendances externes d'un projet Java, à partir d'un fichier `pom.xml`.
- Chaque dépendance se déclare par `groupId`, `artifactId` et `version`.
- `mvn compile`, `mvn test`, `mvn package`, `mvn clean` sont les commandes essentielles.
- `<scope>test</scope>` limite une dépendance (comme JUnit) aux tests uniquement, sans l'embarquer dans le programme final.
- Un IDE bien configuré exécute généralement ces commandes automatiquement, en coulisses.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Quel fichier faut-il modifier pour ajouter une nouvelle bibliothèque externe à un projet Maven ?
</div>

**Corrigé :** `pom.xml`, à la racine du projet.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Quelle commande Maven choisirais-tu pour obtenir un fichier `.jar` livrable, prêt à être distribué ?
</div>

**Corrigé :** `mvn package` — elle compile, exécute les tests, puis empaquette le tout en un fichier `.jar`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Explique en une phrase pourquoi `<scope>test</scope>` sur la dépendance JUnit est une bonne pratique, plutôt que de la laisser sans scope précisé.
</div>

**Corrigé :** Sans `<scope>test</scope>`, JUnit serait inutilement inclus dans le programme final livré aux utilisateurs, alourdissant l'application avec une bibliothèque qui n'a de sens que pendant le développement, jamais à l'exécution réelle du programme.

---

*Chapitre suivant : Git et GitHub, pour suivre l'historique des modifications d'un projet et collaborer avec d'autres développeurs.*
