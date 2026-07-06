<div class="chapitre-titre-num">CHAPITRE 12</div>

# Les exceptions en POO

## Objectifs pédagogiques

Comprendre le mécanisme try/catch/finally, la différence entre exceptions vérifiées et non vérifiées, et savoir créer ses propres exceptions métier.

## 12.1 Le problème : un programme qui plante brutalement

```java
public class Programme {
    public static void main(String[] args) {
        int[] notes = {12, 15, 8};
        System.out.println(notes[5]); // 💥 ArrayIndexOutOfBoundsException — le programme s'arrête NET
        System.out.println("Cette ligne ne s'exécute jamais");
    }
}
```

Sans mécanisme de gestion, une erreur à l'exécution (**exception**) interrompt immédiatement le programme. Le mécanisme `try`/`catch` permet d'**intercepter** ces erreurs et de réagir proprement, sans interrompre l'application entière.

## 12.2 try / catch : intercepter une exception

```java
public class Programme {
    public static void main(String[] args) {
        int[] notes = {12, 15, 8};

        try {
            System.out.println(notes[5]); // le code "à risque" est placé dans le bloc try
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Erreur : index invalide - " + e.getMessage());
        }

        System.out.println("Le programme continue normalement !");
    }
}
```

## 12.3 finally : du code qui s'exécute toujours

```java
public void lireFichier(String chemin) {
    Scanner scanner = null;
    try {
        scanner = new Scanner(new File(chemin));
        System.out.println(scanner.nextLine());
    } catch (FileNotFoundException e) {
        System.out.println("Fichier introuvable : " + chemin);
    } finally {
        // S'exécute TOUJOURS, que le try réussisse, échoue, ou même en cas de return dans le try/catch
        if (scanner != null) {
            scanner.close();
        }
        System.out.println("Nettoyage effectué.");
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 finally garantit le nettoyage des ressources, quoi qu'il arrive</span>
`finally` s'exécute **systématiquement** : que le `try` réussisse, qu'une exception soit attrapée par `catch`, ou même si `catch` contient lui-même un `return` ou relance une exception. C'est l'endroit fiable pour libérer des ressources (fichiers, connexions réseau, connexions base de données) — bien qu'en pratique, `try-with-resources` (section 12.7) soit aujourd'hui préféré pour ce cas précis.
</div>

## 12.4 Hiérarchie des exceptions Java

**Hiérarchie simplifiée des exceptions Java**

```{.uml}
                    Throwable
                   /          \
              Error         Exception
           (erreurs graves    /        \
            de la JVM,   RuntimeException  (exceptions
            non gérées      (non vérifiées)   "vérifiées")
            en pratique)    /      |      \
                    NullPointer  ArrayIndex  IllegalArgument
                    Exception    OutOfBounds  Exception
                                 Exception
```

- **Exceptions vérifiées (checked)** : héritent de `Exception` mais pas de `RuntimeException` (ex : `IOException`, `SQLException`). Le compilateur **oblige** à les traiter (`try/catch` ou `throws`, section 12.6).
- **Exceptions non vérifiées (unchecked)** : héritent de `RuntimeException` (ex : `NullPointerException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException`). Le compilateur **n'oblige rien** — généralement des erreurs de programmation qu'on cherche à éviter plutôt qu'à rattraper systématiquement.

## 12.5 Attraper plusieurs types d'exceptions

```java
public void traiterDonnees(String texte) {
    try {
        int valeur = Integer.parseInt(texte);
        int resultat = 100 / valeur;
        System.out.println(resultat);
    } catch (NumberFormatException e) {
        System.out.println("Le texte n'est pas un nombre valide : " + texte);
    } catch (ArithmeticException e) {
        System.out.println("Division par zéro impossible");
    } catch (Exception e) {
        // catch générique, toujours en DERNIER : capture tout ce qui n'a pas été prévu spécifiquement
        System.out.println("Erreur inattendue : " + e.getMessage());
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'ordre des catch compte : du plus spécifique au plus général</span>
```java
try {
    // ...
} catch (Exception e) { // ❌ trop général en premier : capture TOUT, empêchant les catch suivants d'être atteints
    // ...
} catch (NumberFormatException e) { // ❌ Erreur de compilation : jamais atteignable
    // ...
}
```
Java exige que les blocs `catch` soient ordonnés du type d'exception le **plus spécifique** au plus **général** — sinon un bloc plus général placé en premier rendrait les suivants inutiles, ce que le compilateur refuse.
</div>

## 12.6 throw et throws

```java
// throw : lève explicitement UNE exception à un endroit précis du code
public void deposer(double montant) {
    if (montant <= 0) {
        throw new IllegalArgumentException("Le montant doit être positif");
    }
    // ...
}
```

```java
// throws : signale qu'UNE MÉTHODE peut lever une exception vérifiée, reportant la responsabilité à l'appelant
public void lireFichier(String chemin) throws IOException {
    Scanner scanner = new Scanner(new File(chemin)); // FileNotFoundException hérite de IOException
    // ...
}

// L'appelant DOIT alors gérer cette possibilité, via try/catch ou en propageant lui-même throws
public void utiliser() {
    try {
        lireFichier("data.txt");
    } catch (IOException e) {
        System.out.println("Erreur de lecture : " + e.getMessage());
    }
}
```

## 12.7 try-with-resources : fermeture automatique des ressources

```java
// Approche moderne (Java 7+), préférée au finally manuel de la section 12.3
public void lireFichier(String chemin) {
    try (Scanner scanner = new Scanner(new File(chemin))) {
        System.out.println(scanner.nextLine());
    } catch (FileNotFoundException e) {
        System.out.println("Fichier introuvable : " + chemin);
    }
    // scanner.close() est appelé AUTOMATIQUEMENT à la fin du bloc try, même en cas d'exception
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 try-with-resources fonctionne avec toute classe implémentant AutoCloseable</span>
`Scanner`, les connexions JDBC (`Connection`, `Statement`, `ResultSet`, chapitre 26), les flux de fichiers (`FileInputStream`) implémentent tous `AutoCloseable` — leur fermeture est garantie automatiquement dès qu'ils sont déclarés dans les parenthèses du `try`, sans bloc `finally` explicite nécessaire.
</div>

## 12.8 Créer ses propres exceptions personnalisées

```java
// Exception métier personnalisée : hérite de Exception (vérifiée) ou RuntimeException (non vérifiée)
public class SoldeInsuffisantException extends RuntimeException {
    public SoldeInsuffisantException(String message) {
        super(message); // délègue à la classe mère (Exception → Throwable) qui stocke le message
    }
}
```

```java
public class CompteBancaire {
    private double solde;

    public void retirer(double montant) {
        if (montant > solde) {
            throw new SoldeInsuffisantException(
                "Solde insuffisant : solde actuel " + solde + ", montant demandé " + montant
            );
        }
        solde -= montant;
    }
}
```

```java
CompteBancaire compte = new CompteBancaire();
try {
    compte.retirer(5000);
} catch (SoldeInsuffisantException e) {
    System.out.println("Opération refusée : " + e.getMessage());
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi créer des exceptions métier personnalisées</span>
Une exception nommée `SoldeInsuffisantException` (plutôt qu'une générique `RuntimeException` ou `IllegalStateException`) rend le code **auto-documenté** : un `catch (SoldeInsuffisantException e)` exprime clairement l'intention, et permet de distinguer précisément ce cas d'erreur métier d'autres erreurs techniques (comme une `NullPointerException` accidentelle), notamment utile dans les architectures en couches (chapitre 30).
</div>

## 12.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attraper une exception sans rien en faire (catch vide)</span>
```java
try {
    compte.retirer(montant);
} catch (SoldeInsuffisantException e) {
    // rien ici : l'erreur est SILENCIEUSEMENT ignorée !
}
```
Un bloc `catch` vide masque le problème au lieu de le résoudre — le programme continue comme si tout allait bien, alors qu'une opération a réellement échoué. Au minimum, journaliser l'erreur (`e.printStackTrace()` en développement, un vrai système de logs en production) ; idéalement, réagir de façon appropriée (notifier l'utilisateur, annuler une opération liée).
</div>

## 12.10 Résumé du chapitre

- `try`/`catch` intercepte une exception ; `finally` (ou mieux, `try-with-resources`) garantit un nettoyage systématique.
- Exceptions **vérifiées** (héritent de `Exception`, hors `RuntimeException`) : le compilateur impose leur gestion. **Non vérifiées** (héritent de `RuntimeException`) : gestion optionnelle, généralement des erreurs de programmation.
- `throw` lève une exception précise ; `throws` signale qu'une méthode peut en lever une, déléguant la responsabilité à l'appelant.
- Les blocs `catch` s'ordonnent du plus spécifique au plus général.
- Créer ses propres exceptions métier (`SoldeInsuffisantException`) rend le code plus lisible et les erreurs plus précises à traiter.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Crée une exception personnalisée `AgeInvalideException` et utilise-la dans le constructeur d'une classe `Personne` qui refuse tout âge négatif ou supérieur à 120.
</div>

**Corrigé :**
```java
public class AgeInvalideException extends RuntimeException {
    public AgeInvalideException(String message) {
        super(message);
    }
}

public class Personne {
    private int age;

    public Personne(int age) {
        if (age < 0 || age > 120) {
            throw new AgeInvalideException("Âge invalide : " + age);
        }
        this.age = age;
    }
}
```

*Chapitre suivant : les collections Java, pour manipuler des groupes d'objets de façon flexible et performante.*
