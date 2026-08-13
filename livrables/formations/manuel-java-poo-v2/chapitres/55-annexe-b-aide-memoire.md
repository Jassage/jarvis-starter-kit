<div class="chapitre-titre-num">ANNEXE B</div>

# Aide-mémoire

> Un récapitulatif condensé de toute la syntaxe et des commandes essentielles de ce manuel — à garder ouvert pendant que tu codes.

## Syntaxe de base

```java
// Variable
int age = 20;
String nom = "Jaslin";

// Tableau
int[] notes = {12, 15, 9};
int[][] grille = {{1, 2}, {3, 4}};

// Condition
if (age >= 18) { ... } else if (...) { ... } else { ... }
switch (jour) { case 1: ...; break; default: ...; }

// Boucles
for (int i = 0; i < 10; i++) { ... }
for (int n : notes) { ... }
while (condition) { ... }
do { ... } while (condition);

// Méthode
static int additionner(int a, int b) { return a + b; }
```

## Opérateurs

```text
+ - * / %        arithmétiques (division entière entre int)
== != > < >= <=  comparaison
&& || !          logiques (ET, OU, NON)
condition ? a : b  ternaire
```

## Classes et objets

```java
class Etudiant {
    private String nom;              // attribut privé
    Etudiant(String nom) { this.nom = nom; }  // constructeur
    String getNom() { return nom; }  // getter
}

Etudiant e = new Etudiant("Jaslin"); // création d'un objet
```

## Les 4 piliers de la POO

```java
// Encapsulation
private double solde;
public double getSolde() { return solde; }

// Héritage
class Chien extends Animal { ... }
super(nom); // appel constructeur mère
super.methode(); // appel méthode mère

// Polymorphisme
Animal a = new Chien(); // le type RÉEL décide de la méthode exécutée

// Abstraction / Interface
abstract class Forme { abstract double calculerAire(); }
interface Volant { void voler(); }
class X implements Volant { public void voler() { ... } }
```

## Collections

```java
ArrayList<String> liste = new ArrayList<>();
liste.add("A"); liste.get(0); liste.remove("A"); liste.size();

HashSet<String> ensemble = new HashSet<>(); // pas de doublons
ensemble.add("A"); ensemble.contains("A");

HashMap<String, Integer> map = new HashMap<>(); // clé → valeur
map.put("cle", 1); map.get("cle"); map.getOrDefault("x", 0);
```

## Exceptions

```java
try {
    ...
} catch (TypeException e) {
    System.out.println(e.getMessage());
} finally {
    // toujours exécuté
}
throw new IllegalArgumentException("message");

class MonException extends Exception {
    public MonException(String m) { super(m); }
}
```

## Fichiers

```java
try (FileWriter w = new FileWriter("f.txt")) { w.write("texte\n"); }
try (BufferedReader r = new BufferedReader(new FileReader("f.txt"))) {
    String ligne;
    while ((ligne = r.readLine()) != null) { ... }
}
```

## Java moderne

```java
enum Statut { EN_ATTENTE, LIVREE }

class Boite<T> { private T contenu; }  // generics

Predicate<Integer> estPair = n -> n % 2 == 0;  // lambda

Optional<Client> c = Optional.of(client);
c.orElse(clientParDefaut);

liste.stream().filter(x -> x > 0).map(x -> x * 2).toList();
```

## SQL

```sql
CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT, nom VARCHAR(100));
INSERT INTO t (nom) VALUES ('valeur');
SELECT * FROM t WHERE colonne = 'valeur' ORDER BY colonne DESC;
UPDATE t SET colonne = 'x' WHERE id = 1;
DELETE FROM t WHERE id = 1;
SELECT categorie, COUNT(*) FROM t GROUP BY categorie;
SELECT * FROM a JOIN b ON a.id = b.a_id;
```

## JDBC

```java
Connection cnx = DriverManager.getConnection(url, user, pass);
PreparedStatement req = cnx.prepareStatement("SELECT * FROM t WHERE id = ?");
req.setInt(1, id);
ResultSet rs = req.executeQuery();   // SELECT
req.executeUpdate();                  // INSERT / UPDATE / DELETE
while (rs.next()) { rs.getString("nom"); }
```

## Tests JUnit 5

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void monTest() {
    assertEquals(attendu, reel);
    assertTrue(condition);
    assertThrows(TypeException.class, () -> { ... });
}
```

## Commandes Maven

```text
mvn compile   # compiler
mvn test      # exécuter les tests
mvn package   # compiler + tester + créer le .jar
mvn clean     # nettoyer les fichiers générés
```

```xml
<dependency>
    <groupId>...</groupId>
    <artifactId>...</artifactId>
    <version>...</version>
</dependency>
```

## Commandes Git

```text
git init                       # initialiser un dépôt
git status                     # voir l'état actuel
git add fichier / git add .    # préparer les modifications
git commit -m "message"        # enregistrer un instantané
git branch nom                 # créer une branche
git checkout nom                # basculer sur une branche
git merge nom                  # fusionner une branche
git push / git pull            # envoyer / récupérer depuis GitHub
```

## Raccourcis IDE courants (IntelliJ IDEA)

```text
Shift+F10        Exécuter
Shift+F9         Déboguer
F8               Step Over (débogage)
Shift+F6         Renommer (sûr, dans tout le projet)
Ctrl+Alt+L       Reformater le code
Ctrl+Shift+F10   Exécuter la méthode/classe courante
```

## Convention de nommage Java

```text
Classe          MajusculeAuDebut        Etudiant, CompteBancaire
Variable/méthode camelCase              nom, calculerTotal()
Constante        MAJUSCULE_AVEC_UNDERSCORE  TAUX_MAXIMUM
Package          tout en minuscule       model, dao, service
```

---

*Annexe suivante : les erreurs fréquentes de tout le manuel, récapitulées en un seul endroit.*
