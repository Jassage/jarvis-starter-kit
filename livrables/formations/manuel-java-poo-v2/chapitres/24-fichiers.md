<div class="chapitre-titre-num">CHAPITRE 24</div>

# Lire et écrire dans des fichiers

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras écrire des données dans un fichier et les relire, pour que ton programme puisse conserver des informations au-delà de sa propre exécution.

## A. Le problème

Tous les programmes de ce manuel, jusqu'ici, oublient absolument tout dès qu'ils s'arrêtent. Un `ArrayList<Etudiant>` rempli pendant l'exécution disparaît intégralement à la fermeture du programme — relancer le programme repart toujours de zéro. Un vrai logiciel a besoin de **conserver** ses données entre deux exécutions.

## B. Exemple de la vie réelle

Pense à la différence entre parler à voix haute (une fois dit, c'est oublié, sauf si quelqu'un s'en souvient) et écrire dans un cahier (relisible à volonté, même des jours plus tard, par n'importe qui ouvrant ce cahier). Un fichier joue exactement ce rôle de "cahier" pour un programme : ce qui y est écrit reste disponible, même après l'arrêt complet du programme qui l'a écrit.

## C. Explication très simple

> **Écrire dans un fichier** enregistre des données sur le disque, de façon durable. **Lire un fichier** récupère ces données plus tard, potentiellement dans une toute autre exécution du programme.

## D. Premier exemple Java : écrire dans un fichier

```java
import java.io.FileWriter;
import java.io.IOException;

public class EcritureFichier {
    public static void main(String[] args) {
        try (FileWriter writer = new FileWriter("notes.txt")) {
            writer.write("Jaslin;16.5\n");
            writer.write("Marie;14.0\n");
            System.out.println("Fichier écrit avec succès");
        } catch (IOException e) {
            System.out.println("Erreur d'écriture : " + e.getMessage());
        }
    }
}
```

## E. Explication ligne par ligne

```{.uml}
try (FileWriter writer = new FileWriter("notes.txt")) {
   │        │         │            │
   │        │         │            └─ "notes.txt" : le fichier créé (ou écrasé
   │        │         │               s'il existait déjà) dans le dossier du programme.
   │        │         │
   │        │         └─ "new FileWriter(...)" ouvre le fichier en écriture.
   │        │
   │        └─ Un objet capable d'ÉCRIRE du texte dans ce fichier.
   │
   └─ "try (...)" : une variante spéciale de try, appelée TRY-WITH-RESOURCES.

    writer.write("Jaslin;16.5\n");
             │                │
             │                └─ "\n" : passage à la ligne (comme dans le fichier,
             │                   pas seulement à l'écran).
             └─ Écrit le texte donné dans le fichier.
} catch (IOException e) {
    ...
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Try-with-resources</span>
<code>try (FileWriter writer = ...)</code> est une forme spéciale de <code>try</code> (chapitre 22) qui garantit que la ressource ouverte entre parenthèses (ici, le fichier) sera <strong>automatiquement fermée</strong> à la fin du bloc, même si une exception survient — sans jamais avoir besoin d'écrire explicitement <code>writer.close()</code> ni d'utiliser un <code>finally</code> (chapitre 22) pour ça. C'est la façon moderne et sûre de manipuler un fichier en Java.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ IOException est une exception vérifiée</span>
Toute opération sur un fichier peut échouer pour des raisons hors du contrôle du programme (disque plein, permissions refusées, fichier verrouillé par un autre programme...). C'est pourquoi Java oblige (chapitre 23) à gérer <code>IOException</code>, soit avec un <code>catch</code> comme ici, soit en la propageant avec <code>throws IOException</code> sur la méthode appelante.
</div>

## F. Deuxième exemple : lire un fichier

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class LectureFichier {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("notes.txt"))) {
            String ligne;
            while ((ligne = reader.readLine()) != null) {
                String[] parties = ligne.split(";"); // découpe "Jaslin;16.5" en {"Jaslin", "16.5"}
                String nom = parties[0];
                double note = Double.parseDouble(parties[1]);
                System.out.println(nom + " a eu " + note);
            }
        } catch (IOException e) {
            System.out.println("Erreur de lecture : " + e.getMessage());
        }
    }
}
```

Résultat (si `notes.txt` a été écrit par le programme de la section D) :
```text
Jaslin a eu 16.5
Marie a eu 14.0
```

```{.uml}
while ((ligne = reader.readLine()) != null) {
   │       │             │             │
   │       │             │             └─ readLine() renvoie null quand il n'y a
   │       │             │                PLUS de ligne à lire : c'est le signal
   │       │             │                d'arrêt de la boucle.
   │       │             └─ Lit UNE ligne du fichier à chaque appel.
   │       └─ Range cette ligne dans "ligne", ET la boucle vérifie
   │          IMMÉDIATEMENT si le résultat est null, en une seule expression.
   └─ Continue tant qu'il reste des lignes à lire.
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 String.split() et Double.parseDouble(), deux méthodes très utiles</span>
<code>texte.split(";")</code> découpe une chaîne selon un séparateur, renvoyant un tableau de <code>String</code> (le format CSV très courant pour stocker des données simples dans un fichier texte). <code>Double.parseDouble(texte)</code> convertit un <code>String</code> en <code>double</code> (son équivalent existe pour chaque type : <code>Integer.parseInt</code>, <code>Boolean.parseBoolean</code>...) — indispensable puisqu'un fichier ne contient toujours que du texte brut, jamais directement des nombres.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier try-with-resources et ne jamais fermer le fichier</span>

```java
FileWriter writer = new FileWriter("notes.txt");
writer.write("Jaslin;16.5\n");
// ❌ writer.close() jamais appelé : les données peuvent ne JAMAIS être
//    réellement écrites sur le disque, restant "en attente" en mémoire !
```

Sans fermeture explicite (ou try-with-resources), les données écrites peuvent rester bloquées dans un espace tampon interne, jamais réellement transférées sur le disque. Utilise systématiquement `try (...)`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Lire un fichier qui n'existe pas</span>

```java
BufferedReader reader = new BufferedReader(new FileReader("fichier_inexistant.txt"));
// 💥 FileNotFoundException (une sous-catégorie d'IOException) dès l'ouverture
```

Toujours prévoir ce cas (via le `catch (IOException e)`, qui attrape aussi `FileNotFoundException` puisque c'est une sous-classe) plutôt que de supposer qu'un fichier existera toujours.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais écrire du texte dans un fichier avec FileWriter.
✓ Je sais lire un fichier ligne par ligne avec BufferedReader.
✓ Je sais utiliser try-with-resources pour fermer automatiquement un fichier.
✓ Je sais découper une ligne avec split() et convertir du texte en nombre.
✓ Je sais gérer IOException, une exception vérifiée liée aux fichiers.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pourquoi `try (FileWriter writer = new FileWriter("notes.txt")) { ... }` est-il préférable à `FileWriter writer = new FileWriter("notes.txt"); ... writer.close();` écrit séparément après le bloc ?
</div>

## Correction

Avec try-with-resources, la fermeture du fichier est **garantie automatiquement**, même si une exception survient au milieu du bloc — le `writer.close()` écrit "à la main" après le bloc ne s'exécuterait jamais si une erreur interrompt le programme avant d'y arriver, laissant potentiellement le fichier mal fermé ou des données non écrites.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris un programme qui enregistre un `ArrayList<String>` de noms de produits dans un fichier `produits.txt` (un produit par ligne), puis relit ce même fichier et affiche le nombre total de lignes lues.
</div>

### Corrigé du défi

```java
import java.io.*;
import java.util.ArrayList;

public class GestionProduitsFichier {
    public static void main(String[] args) {
        ArrayList<String> produits = new ArrayList<>();
        produits.add("Riz");
        produits.add("Haricots");
        produits.add("Sucre");

        try (FileWriter writer = new FileWriter("produits.txt")) {
            for (String produit : produits) {
                writer.write(produit + "\n");
            }
        } catch (IOException e) {
            System.out.println("Erreur d'écriture : " + e.getMessage());
        }

        int compteur = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader("produits.txt"))) {
            while (reader.readLine() != null) {
                compteur++;
            }
        } catch (IOException e) {
            System.out.println("Erreur de lecture : " + e.getMessage());
        }

        System.out.println("Nombre de produits lus : " + compteur); // 3
    }
}
```

## Résumé du chapitre

- Écrire dans un fichier conserve des données au-delà de l'exécution du programme.
- `FileWriter` écrit du texte ; `BufferedReader` + `FileReader` le relit, ligne par ligne avec `readLine()`.
- `try-with-resources` ferme automatiquement le fichier, même en cas d'erreur.
- `readLine()` renvoie `null` quand il n'y a plus de ligne à lire — le signal naturel de fin de boucle.
- `split()` et `parseDouble()`/`parseInt()` permettent de structurer et convertir le texte lu depuis un fichier.

---

# 🎓 Révision de la Partie 7 — Fichiers

## Questions de révision

1. Pourquoi les données d'un `ArrayList` disparaissent-elles à la fin d'un programme, contrairement à celles d'un fichier ?
2. Que garantit try-with-resources, que ne garantit pas un simple `FileWriter writer = new FileWriter(...)` sans fermeture explicite ?
3. Comment sait-on qu'on a atteint la fin d'un fichier en le lisant avec `readLine()` ?

**Réponses :** (1) Un `ArrayList` vit uniquement en mémoire vive (RAM), effacée à l'arrêt du programme ; un fichier est écrit sur le disque, qui conserve les données même hors tension. (2) La fermeture automatique et garantie du fichier, même si une exception interrompt le bloc en cours de route. (3) `readLine()` renvoie `null`.

## Mini-projet de la Partie 7

<div class="encadre defi">
<span class="encadre-titre">🧩 Mini-projet — Carnet de contacts persistant</span>

Écris un programme avec deux méthodes : `enregistrerContact(String nom, String telephone)` qui **ajoute** une ligne `nom;telephone` à un fichier `contacts.txt` (indice : `new FileWriter("contacts.txt", true)`, le second paramètre `true` signifie "ajouter à la fin", plutôt que d'écraser le fichier), et `afficherTousLesContacts()` qui relit et affiche chaque ligne du fichier, proprement formatée.
</div>

### Corrigé du mini-projet

```java
import java.io.*;

public class CarnetContacts {
    public static void main(String[] args) {
        enregistrerContact("Jaslin", "3712-3456");
        enregistrerContact("Marie", "3798-7654");
        afficherTousLesContacts();
    }

    static void enregistrerContact(String nom, String telephone) {
        try (FileWriter writer = new FileWriter("contacts.txt", true)) { // true = mode ajout
            writer.write(nom + ";" + telephone + "\n");
        } catch (IOException e) {
            System.out.println("Erreur d'enregistrement : " + e.getMessage());
        }
    }

    static void afficherTousLesContacts() {
        try (BufferedReader reader = new BufferedReader(new FileReader("contacts.txt"))) {
            String ligne;
            while ((ligne = reader.readLine()) != null) {
                String[] parties = ligne.split(";");
                System.out.println(parties[0] + " : " + parties[1]);
            }
        } catch (IOException e) {
            System.out.println("Erreur de lecture : " + e.getMessage());
        }
    }
}
```

---

*Chapitre suivant : le Java moderne, en commençant par Enum, pour représenter proprement un ensemble fixe et connu de valeurs.*
