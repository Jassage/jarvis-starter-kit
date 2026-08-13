<div class="chapitre-titre-num">CHAPITRE 22</div>

# Les exceptions

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras anticiper et gérer proprement les erreurs qui surviennent pendant l'exécution d'un programme, avec `try`, `catch`, `finally`, `throw` et `throws`, au lieu de laisser le programme s'arrêter brutalement.

## A. Le problème

Tu as déjà croisé plusieurs erreurs qui arrêtent brutalement un programme : `NullPointerException` (chapitre 9), `ArrayIndexOutOfBoundsException` (chapitre 3), `ArithmeticException` (chapitre 4). Jusqu'ici, quand l'une d'elles survenait, le programme s'arrêtait net, sans aucune possibilité de réagir ou de continuer proprement.

```java
int[] notes = {12, 15, 9};
System.out.println(notes[10]); // 💥 le programme s'arrête ICI, plus rien après ne s'exécute
System.out.println("Cette ligne ne s'affichera jamais");
```

## B. Exemple de la vie réelle

> Tu essaies d'ouvrir une porte, mais quelque chose empêche l'opération.

Imagine que la porte soit verrouillée. Deux réactions possibles : rester planté, bloqué, sans savoir quoi faire (ce que fait un programme sans gestion d'erreur — il s'arrête). Ou bien : remarquer que la porte est verrouillée, réagir (chercher une autre clé, appeler quelqu'un, utiliser une autre porte), et continuer sa journée. Java permet cette deuxième réaction, grâce aux **exceptions**.

## C. Explication très simple

> Une **exception** est un signal envoyé par Java lorsqu'une erreur survient **pendant l'exécution** d'un programme. On peut la **capturer** pour réagir proprement, au lieu de laisser le programme s'arrêter brutalement.

## D. Premier exemple Java

```java
int[] notes = {12, 15, 9};

try {
    System.out.println(notes[10]); // provoque une exception
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Erreur : indice invalide, cette note n'existe pas");
}

System.out.println("Le programme continue normalement après !");
```

Résultat :
```text
Erreur : indice invalide, cette note n'existe pas
Le programme continue normalement après !
```

## E. Explication ligne par ligne

```{.uml}
try {
    System.out.println(notes[10]);
}
 │
 └─ Le bloc "try" ("essaie") contient le code SUSCEPTIBLE de provoquer
    une exception. Java l'exécute normalement, jusqu'à ce qu'une erreur
    survienne (ou pas).

catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Erreur : indice invalide, cette note n'existe pas");
}
   │                            │                    │
   │                            │                    └─ Le code de RÉACTION
   │                            │                       à cette erreur précise.
   │                            └─ "e" : une variable qui contiendra les
   │                               détails de l'exception survenue
   │                               (message, type précis...).
   └─ "catch" ("attrape") : si une exception du TYPE indiqué survient
      dans le bloc try, Java saute IMMÉDIATEMENT ici, sans exécuter le
      reste du bloc try.
```

Dès qu'une exception survient dans le `try`, Java abandonne **immédiatement** le reste de ce bloc (les lignes suivantes du `try` ne s'exécutent jamais) et saute directement au `catch` correspondant. Une fois le `catch` terminé, le programme **continue normalement** après tout le bloc `try/catch` — c'est la différence fondamentale avec un programme qui plante.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Lever / Attraper une exception</span>
On dit qu'une erreur <strong>lève</strong> (ou <strong>lance</strong>) une exception (<em>throw</em>, en anglais — d'où le mot-clé <code>throw</code> vu plus loin). On dit qu'un bloc <code>catch</code> <strong>attrape</strong> (ou <strong>capture</strong>) cette exception pour y réagir.
</div>

## F. Deuxième exemple : plusieurs catch, et finally

```java
public class DivisionSecurisee {
    public static void main(String[] args) {
        int[] valeurs = {10, 0, 5};
        int diviseur = 0;

        try {
            int resultat = valeurs[0] / diviseur;
            System.out.println("Résultat : " + resultat);
        } catch (ArithmeticException e) {
            System.out.println("Erreur : division par zéro impossible");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Erreur : indice invalide");
        } finally {
            System.out.println("Ce bloc s'exécute TOUJOURS, erreur ou pas");
        }

        System.out.println("Fin du programme");
    }
}
```

Résultat :
```text
Erreur : division par zéro impossible
Ce bloc s'exécute TOUJOURS, erreur ou pas
Fin du programme
```

```{.uml}
try { ... }
catch (TypeA e) { ... }   →  premier type d'erreur possible
catch (TypeB e) { ... }   →  deuxième type d'erreur possible (Java teste dans l'ORDRE)
finally { ... }           →  s'exécute TOUJOURS, qu'une exception soit survenue ou non,
                              et même si un catch contenait un "return" — idéal pour
                              libérer une ressource (fermer un fichier, une connexion)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 finally, l'endroit fiable pour "nettoyer"</span>
<code>finally</code> s'exécute quoi qu'il arrive : que le <code>try</code> se termine normalement, qu'une exception survienne et soit attrapée, ou même qu'un <code>return</code> soit rencontré à l'intérieur. C'est l'endroit privilégié pour libérer une ressource (fermer un fichier ouvert, chapitre 24 ; fermer une connexion à une base de données, chapitre 33), pour être certain qu'elle sera toujours relâchée, même en cas d'erreur.
</div>

## Lever soi-même une exception : throw

Tu as déjà croisé `throw` depuis le chapitre 10 (constructeurs), sans qu'on l'explique formellement. C'est le moment.

```java
static double diviser(double a, double b) {
    if (b == 0) {
        throw new ArithmeticException("Division par zéro refusée");
    }
    return a / b;
}
```

```{.uml}
throw new ArithmeticException("Division par zéro refusée");
  │        │
  │        └─ On CRÉE un nouvel objet exception, avec un message explicatif.
  └─ "throw" : DÉCLENCHE volontairement cette exception, immédiatement.
```

`throw` permet à **ton propre code** de signaler une erreur, exactement comme le ferait Java automatiquement lors d'une division entière par zéro. Cette exception peut ensuite être attrapée par un `catch`, ailleurs dans le programme.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : throws (avec un "s")</span>
<code>throws</code> (à ne pas confondre avec <code>throw</code>) s'écrit dans la <strong>signature</strong> d'une méthode, pour annoncer qu'elle peut potentiellement lever une exception, sans l'attraper elle-même — laissant ce choix au code qui l'appellera. Cette nuance devient surtout visible avec les exceptions dites "vérifiées" (<em>checked</em>), une catégorie plus stricte qu'on croise notamment avec les fichiers (chapitre 24) et JDBC (chapitre 33).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Attraper Exception de façon trop large</span>

```java
try {
    // ... du code
} catch (Exception e) { // ⚠️ attrape TOUT, même des erreurs qu'on n'a pas anticipées
    System.out.println("Une erreur est survenue");
}
```

`Exception` est le type le plus général : l'attraper capture **absolument toute** erreur possible, y compris des bugs totalement imprévus, masquant leur vraie cause. Il est presque toujours préférable d'attraper le type **précis** d'exception qu'on anticipe réellement (`ArithmeticException`, `NumberFormatException`...), pour ne jamais cacher accidentellement un vrai bug.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un catch vide, qui "avale" silencieusement l'erreur</span>

```java
try {
    fichier.lire();
} catch (Exception e) {
    // rien ici... ❌ l'erreur disparaît sans laisser de trace, très difficile à déboguer plus tard
}
```

Un `catch` vide est presque toujours une mauvaise idée : l'erreur est totalement invisible, y compris pour le développeur qui essaiera de comprendre plus tard pourquoi le programme se comporte bizarrement. Au minimum, afficher le message de l'exception (`e.getMessage()`) ou la journaliser.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais entourer du code risqué avec try/catch pour éviter un arrêt brutal.
✓ Je sais attraper plusieurs types d'exceptions différents avec plusieurs catch.
✓ Je sais que finally s'exécute TOUJOURS, erreur ou pas.
✓ Je sais lever volontairement une exception avec throw.
✓ Je sais qu'il vaut mieux attraper un type précis d'exception que Exception en général.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Que va afficher ce code ?

```java
try {
    int x = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Erreur capturée");
} finally {
    System.out.println("Nettoyage");
}
System.out.println("Après le bloc");
```
</div>

## Correction

```text
Erreur capturée
Nettoyage
Après le bloc
```

`10 / 0` lève une `ArithmeticException`, attrapée par le `catch` correspondant. `finally` s'exécute ensuite, dans tous les cas. Le programme continue enfin normalement après tout le bloc `try/catch/finally`, sans jamais s'arrêter brutalement.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `retirerDuStock(int stockActuel, int quantiteDemandee)` qui lève une `IllegalArgumentException` si `quantiteDemandee > stockActuel`, et renvoie sinon `stockActuel - quantiteDemandee`. Appelle-la dans un `try/catch` qui affiche un message clair en cas d'erreur.
</div>

### Corrigé du défi

```java
public class Main {
    public static void main(String[] args) {
        try {
            int nouveauStock = retirerDuStock(50, 80);
            System.out.println("Nouveau stock : " + nouveauStock);
        } catch (IllegalArgumentException e) {
            System.out.println("Erreur : " + e.getMessage());
        }
    }

    static int retirerDuStock(int stockActuel, int quantiteDemandee) {
        if (quantiteDemandee > stockActuel) {
            throw new IllegalArgumentException("Stock insuffisant : " + stockActuel + " disponible(s)");
        }
        return stockActuel - quantiteDemandee;
    }
}
```

Résultat :
```text
Erreur : Stock insuffisant : 50 disponible(s)
```

## Résumé du chapitre

- Une **exception** signale une erreur survenue pendant l'exécution ; sans gestion, elle arrête brutalement le programme.
- `try` entoure le code risqué ; `catch (TypeException e)` attrape et réagit à un type précis d'erreur.
- `finally` s'exécute toujours, erreur ou pas — idéal pour libérer des ressources.
- `throw` déclenche volontairement une exception ; `throws`, dans la signature d'une méthode, annonce qu'elle peut en lever une.
- Il vaut mieux attraper un type d'exception précis que le très général `Exception`, et ne jamais laisser un `catch` vide.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Entoure ce code d'un `try/catch` pour qu'il n'arrête plus brutalement le programme, en affichant `"Conversion impossible"` en cas d'erreur.

```java
String texte = "abc";
int nombre = Integer.parseInt(texte); // lève NumberFormatException si le texte n'est pas un nombre
```
</div>

**Corrigé :**
```java
String texte = "abc";
try {
    int nombre = Integer.parseInt(texte);
    System.out.println(nombre);
} catch (NumberFormatException e) {
    System.out.println("Conversion impossible");
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Explique en une phrase pourquoi ce code est une mauvaise pratique, même s'il ne provoque aucune erreur de compilation.

```java
try {
    traiterCommande();
} catch (Exception e) {
}
```
</div>

**Corrigé :** Il attrape **n'importe quelle** exception (`Exception`, le type le plus général) sans jamais réagir ni journaliser quoi que ce soit : toute erreur, même totalement imprévue, disparaît silencieusement, rendant le programme très difficile à déboguer si quelque chose se passe mal.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Écris une méthode `verifierAge(int age)` qui lève une `IllegalArgumentException` si `age < 0` ou `age > 120`, avec un message précisant laquelle des deux conditions a échoué. Teste-la avec 3 valeurs différentes dans des blocs `try/catch` séparés.
</div>

**Corrigé :**
```java
static void verifierAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("L'âge ne peut pas être négatif : " + age);
    }
    if (age > 120) {
        throw new IllegalArgumentException("Âge invraisemblable : " + age);
    }
    System.out.println("Âge valide : " + age);
}

public static void main(String[] args) {
    int[] agesATester = {-5, 25, 200};
    for (int age : agesATester) {
        try {
            verifierAge(age);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejeté : " + e.getMessage());
        }
    }
}
```

---

*Chapitre suivant : les exceptions personnalisées, pour créer tes propres types d'erreurs, avec un sens métier précis, plutôt que de toujours réutiliser les exceptions génériques de Java.*
