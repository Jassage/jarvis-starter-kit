<div class="chapitre-titre-num">CHAPITRE 27</div>

# Les expressions Lambda

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras écrire une expression lambda, pour transmettre un comportement (une action) comme s'il s'agissait d'une simple valeur.

## A. Le problème

Imagine vouloir trier une liste d'étudiants, tantôt par nom, tantôt par moyenne, selon le contexte. Avec ce qu'on connaît jusqu'ici, il faudrait écrire une classe entière rien que pour décrire **comment comparer** deux étudiants — beaucoup de code pour une idée pourtant très simple : *« compare ces deux valeurs, comme ceci »*.

## B. Exemple de la vie réelle

Pense à donner une instruction courte à quelqu'un : *« Trie ces fruits du plus petit au plus gros. »* Tu ne rédiges pas un mode d'emploi complet et formel pour ça — tu donnes directement la règle, brièvement, au moment où tu en as besoin. Une expression lambda permet exactement ça en Java : donner une petite règle de comportement, directement là où elle est utilisée, sans construire toute une classe pour l'occasion.

## C. Explication très simple

> Une **expression lambda** est une façon compacte d'écrire une petite méthode "à la volée", sans lui donner de nom, directement à l'endroit où on en a besoin.

## D. Premier exemple Java

Avant les lambdas, avec une interface fonctionnelle classique :

```java
interface Operation {
    int appliquer(int a, int b);
}

Operation addition = new Operation() {
    @Override
    public int appliquer(int a, int b) {
        return a + b;
    }
};

System.out.println(addition.appliquer(3, 4)); // 7
```

Avec une expression lambda, le même résultat, bien plus court :

```java
Operation addition = (a, b) -> a + b;

System.out.println(addition.appliquer(3, 4)); // 7
```

## E. Explication ligne par ligne

```{.uml}
Operation addition = (a, b) -> a + b;
                       │    │    │
                       │    │    └─ Le RÉSULTAT de l'opération (équivalent
                       │    │       d'un "return" implicite pour une
                       │    │       expression aussi courte).
                       │    └─ La flèche : sépare "ce qu'on reçoit" de
                       │       "ce qu'on en fait".
                       └─ Les PARAMÈTRES reçus (comme ceux d'une méthode,
                          chapitre 7), sans avoir besoin de préciser
                          leur type — Java le déduit de "Operation".
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Interface fonctionnelle</span>
Une expression lambda ne peut être utilisée que là où Java attend une <strong>interface fonctionnelle</strong> : une interface (chapitre 15) qui ne contient <strong>qu'une seule</strong> méthode abstraite (ici, <code>appliquer</code>). Le lambda <code>(a, b) -> a + b</code> fournit directement le corps de cette unique méthode, sans jamais avoir besoin de répéter son nom.
</div>

## F. Deuxième exemple : les interfaces fonctionnelles déjà fournies par Java

Java fournit un ensemble d'interfaces fonctionnelles toutes prêtes, pour éviter d'en écrire une nouvelle à chaque fois :

```java
import java.util.function.Predicate;

Predicate<Integer> estPair = n -> n % 2 == 0;
System.out.println(estPair.test(6));  // true
System.out.println(estPair.test(7));  // false
```

```java
import java.util.function.Function;

Function<Integer, Integer> carre = n -> n * n;
System.out.println(carre.apply(5)); // 25
```

| Interface | Rôle | Exemple |
|---|---|---|
| `Predicate<T>` | Teste une condition, renvoie `boolean` | `n -> n > 0` |
| `Function<T, R>` | Transforme un `T` en `R` | `s -> s.length()` |
| `Consumer<T>` | Consomme une valeur, ne renvoie rien | `s -> System.out.println(s)` |
| `Supplier<T>` | Ne prend rien, fournit une valeur | `() -> "Bonjour"` |

<div class="encadre astuce">
<span class="encadre-titre">💡 Lambda avec un tri : l'usage le plus courant</span>

```java
import java.util.ArrayList;
import java.util.Comparator;

ArrayList<String> noms = new ArrayList<>();
noms.add("Marie");
noms.add("Jaslin");
noms.add("Anne");

noms.sort((a, b) -> a.compareTo(b)); // tri alphabétique, via une lambda
System.out.println(noms); // [Anne, Jaslin, Marie]
```

`compareTo` (une méthode fournie par `String`) renvoie un nombre négatif, nul ou positif selon l'ordre relatif de deux chaînes — exactement ce qu'attend `sort()` pour comparer deux éléments.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser un lambda là où une interface a plusieurs méthodes abstraites</span>

```java
interface Vehicule {
    void demarrer();
    void arreter();
}

Vehicule v = () -> System.out.println("Démarrage"); // ❌ erreur de compilation
```

Une expression lambda ne peut représenter qu'**une seule** méthode. Si l'interface en a plusieurs, Java ne sait pas laquelle le lambda est censé implémenter, et refuse de compiler.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre { } avec return et une expression simple</span>

```java
Operation addition = (a, b) -> { a + b; }; // ❌ erreur : avec des accolades, "return" devient obligatoire
Operation addition2 = (a, b) -> { return a + b; }; // ✅ correct, avec accolades ET return
Operation addition3 = (a, b) -> a + b; // ✅ correct aussi, SANS accolades ni return (forme courte)
```

Deux styles valides existent : une expression courte, sans accolades ni `return` (le résultat est implicite), ou un vrai bloc entre accolades, qui exige alors un `return` explicite comme n'importe quelle méthode normale.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais écrire une expression lambda simple, (params) -> résultat.
✓ Je comprends qu'un lambda ne fonctionne que sur une interface
  fonctionnelle (une seule méthode abstraite).
✓ Je connais Predicate, Function, Consumer et Supplier, les interfaces
  fonctionnelles standard de Java.
✓ Je sais utiliser un lambda pour trier une liste avec sort().
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris un `Predicate<Integer>` nommé `estMajeur` qui teste si un nombre est supérieur ou égal à 18, et teste-le avec deux valeurs.
</div>

## Correction

```java
import java.util.function.Predicate;

Predicate<Integer> estMajeur = age -> age >= 18;

System.out.println(estMajeur.test(20)); // true
System.out.println(estMajeur.test(15)); // false
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une interface fonctionnelle `Validateur<T>` avec une méthode `boolean valider(T valeur)`. Écris une méthode `filtrer(ArrayList<Integer> nombres, Validateur<Integer> validateur)` qui renvoie un nouvel `ArrayList<Integer>` contenant uniquement les nombres validés. Utilise-la avec une lambda pour ne garder que les nombres pairs.
</div>

### Corrigé du défi

```java
import java.util.ArrayList;

interface Validateur<T> {
    boolean valider(T valeur);
}

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> nombres = new ArrayList<>();
        nombres.add(1); nombres.add(2); nombres.add(3); nombres.add(4); nombres.add(5);

        ArrayList<Integer> pairs = filtrer(nombres, n -> n % 2 == 0);
        System.out.println(pairs); // [2, 4]
    }

    static ArrayList<Integer> filtrer(ArrayList<Integer> nombres, Validateur<Integer> validateur) {
        ArrayList<Integer> resultat = new ArrayList<>();
        for (int n : nombres) {
            if (validateur.valider(n)) {
                resultat.add(n);
            }
        }
        return resultat;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce défi annonce le chapitre suivant</span>
Cette méthode <code>filtrer</code>, écrite ici à la main, correspond exactement à ce que la <strong>Stream API</strong> (chapitre 29) offre déjà toute prête, en une seule ligne : <code>nombres.stream().filter(n -&gt; n % 2 == 0).collect(...)</code>. Comprendre comment le construire soi-même, comme ici, aide à comprendre ce qui se passe vraiment derrière cette syntaxe plus condensée.
</div>

## Résumé du chapitre

- Une **expression lambda** écrit une petite méthode "à la volée", sous la forme `(paramètres) -> résultat`.
- Elle ne fonctionne que sur une **interface fonctionnelle** (une seule méthode abstraite).
- Java fournit des interfaces fonctionnelles standard : `Predicate`, `Function`, `Consumer`, `Supplier`.
- Avec accolades, `return` devient obligatoire ; sans accolades, le résultat est implicite.
- Un usage très courant : personnaliser un tri (`sort`) sans écrire de classe dédiée.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris un `Function<String, Integer>` nommé `longueur` qui renvoie la longueur d'un texte, et teste-le avec `"Bonjour"`.
</div>

**Corrigé :**
```java
Function<String, Integer> longueur = texte -> texte.length();
System.out.println(longueur.apply("Bonjour")); // 7
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Explique en une phrase pourquoi ce code ne compile pas, et corrige-le.

```java
Operation soustraction = (a, b) -> { a - b; };
```
</div>

**Corrigé :** Avec des accolades, le résultat n'est jamais implicite : il faut un `return` explicite. Correction : `(a, b) -> { return a - b; };` ou, plus simplement, sans accolades : `(a, b) -> a - b;`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une méthode `trierEtudiants(ArrayList<Etudiant> etudiants, Comparator<Etudiant> comparateur)` doit trier une liste d'étudiants selon un critère variable. Écris l'appel de cette méthode avec une lambda qui trie par moyenne décroissante (indice : `Double.compare(b.getMoyenne(), a.getMoyenne())` inverse l'ordre naturel).
</div>

**Corrigé :**
```java
trierEtudiants(etudiants, (e1, e2) -> Double.compare(e2.getMoyenne(), e1.getMoyenne()));
```
Inverser `e2` et `e1` (au lieu de `e1, e2`) dans `Double.compare` inverse l'ordre de tri, obtenant un tri décroissant plutôt que croissant.

---

*Chapitre suivant : Optional, pour représenter proprement "l'absence de valeur", sans jamais retomber dans le piège du NullPointerException.*
