<div class="chapitre-titre-num">CHAPITRE 16</div>

# Les expressions Lambda

## Objectifs pédagogiques

Maîtriser la syntaxe des expressions lambda, les relier aux interfaces fonctionnelles (chapitre 8), et savoir utiliser les références de méthodes.

## 16.1 Rappel : le problème résolu par les lambdas

Rappel du chapitre 8 (section 8.7) et du chapitre 11 (section 11.7) : implémenter une interface fonctionnelle (une seule méthode abstraite) via une classe anonyme est verbeux pour une logique aussi simple qu'une addition :

```java
Operation addition = new Operation() {
    @Override
    public int appliquer(int a, int b) {
        return a + b;
    }
};
```

Une **expression lambda** exprime la même chose en une seule ligne, sans répéter le nom de la méthode ni le mot-clé `new` :

```java
Operation addition = (a, b) -> a + b;
```

## 16.2 Syntaxe des lambdas

```java
// Forme complète, avec types explicites et accolades
Operation v1 = (int a, int b) -> { return a + b; };

// Types déduits automatiquement (le plus courant en pratique)
Operation v2 = (a, b) -> a + b;

// Un seul paramètre : les parenthèses deviennent optionnelles
Runnable tache = () -> System.out.println("Tâche exécutée");

Comparator<String> parLongueur = s -> s.length(); // un seul paramètre, parenthèses omises
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une lambda n'existe QUE parce qu'une interface fonctionnelle définit son contrat</span>
`(a, b) -> a + b` seule, hors contexte, ne veut rien dire pour le compilateur : c'est le type **cible** attendu (ici `Operation`, une interface fonctionnelle avec `int appliquer(int, int)`) qui donne son sens à la lambda — le nombre de paramètres et leur type sont déduits de cette méthode abstraite unique.
</div>

## 16.3 Les interfaces fonctionnelles standard de java.util.function

Java fournit un ensemble d'interfaces fonctionnelles génériques prêtes à l'emploi, évitant de devoir en déclarer une pour chaque besoin :

```java
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Consumer;
import java.util.function.Supplier;

Function<Integer, Integer> carre = x -> x * x;              // prend un T, retourne un R
System.out.println(carre.apply(5)); // 25

Predicate<String> estVide = String::isBlank;                  // prend un T, retourne un boolean
System.out.println(estVide.test("   ")); // true

Consumer<String> afficher = message -> System.out.println(message); // prend un T, ne retourne rien
afficher.accept("Bonjour Jaslin");

Supplier<Double> genererAleatoire = () -> Math.random();     // ne prend rien, retourne un T
System.out.println(genererAleatoire.get());
```

| Interface | Signature | Usage typique |
|---|---|---|
| `Function<T, R>` | `R apply(T t)` | Transformer une valeur en une autre |
| `Predicate<T>` | `boolean test(T t)` | Tester une condition (filtrage, chapitre 17) |
| `Consumer<T>` | `void accept(T t)` | Consommer une valeur sans rien retourner (affichage, sauvegarde) |
| `Supplier<T>` | `T get()` | Fournir une valeur sans paramètre |
| `BiFunction<T, U, R>` | `R apply(T t, U u)` | Combiner deux valeurs en une troisième |

## 16.4 Lambdas et collections (lien avec les chapitres 13 et 17)

```java
List<String> noms = new ArrayList<>(List.of("Jaslin", "Marie", "Paul", "Amélie"));

noms.removeIf(nom -> nom.length() < 5);       // Predicate<String>
noms.sort((a, b) -> a.compareTo(b));           // Comparator<String>
noms.forEach(nom -> System.out.println(nom)); // Consumer<String>
```

## 16.5 Références de méthodes (method references)

Quand une lambda se contente d'**appeler une méthode existante** sans rien ajouter, une syntaxe encore plus concise existe : la référence de méthode (`::`).

```java
noms.forEach(nom -> System.out.println(nom)); // lambda classique
noms.forEach(System.out::println);            // référence de méthode équivalente, plus concise
```

| Type de référence | Exemple | Équivalent lambda |
|---|---|---|
| Méthode statique | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Méthode d'instance sur un objet précis | `System.out::println` | `x -> System.out.println(x)` |
| Méthode d'instance sur le paramètre lui-même | `String::isBlank` | `s -> s.isBlank()` |
| Constructeur | `ArrayList::new` | `() -> new ArrayList<>()` |

```java
List<String> textes = List.of("10", "25", "3");
List<Integer> nombres = textes.stream()
    .map(Integer::parseInt) // référence de méthode statique
    .toList();
```

## 16.6 Capture de variables (closures)

```java
public class Compteur {
    public static void main(String[] args) {
        int seuil = 10; // variable locale

        Predicate<Integer> depasseLeSeuil = n -> n > seuil; // la lambda "capture" seuil de son environnement
        System.out.println(depasseLeSeuil.test(15)); // true
    }
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une variable capturée par une lambda doit être "effectivement finale"</span>
```java
int total = 0;
Consumer<Integer> ajouter = n -> {
    total += n; // ❌ Erreur de compilation : total doit être final ou effectivement final
};
```
Une lambda ne peut capturer qu'une variable locale qui n'est **jamais réassignée** après son initialisation (dite "effectivement finale") — elle ne peut donc jamais **modifier** une variable de son environnement extérieur, seulement la lire. Ce n'est pas une limitation arbitraire : elle garantit la cohérence si la lambda est exécutée plus tard, potentiellement dans un contexte différent (thread séparé, par exemple).
</div>

## 16.7 Lambda vs classe anonyme : quand chacune reste pertinente

<div class="encadre astuce">
<span class="encadre-titre">💡 Les lambdas ne remplacent PAS totalement les classes anonymes</span>
Une lambda ne peut implémenter **qu'une interface fonctionnelle** (une seule méthode abstraite, rappel du chapitre 8). Pour implémenter une interface avec plusieurs méthodes, ou étendre une classe abstraite (chapitre 7) avec un état interne propre, la classe anonyme (chapitre 11) reste nécessaire.
</div>

## 16.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser une lambda là où une interface n'a pas exactement une seule méthode abstraite</span>
```java
interface Vehicule {
    void demarrer();
    void arreter();
}

Vehicule v = () -> System.out.println("Démarrage"); // ❌ Erreur : Vehicule a DEUX méthodes abstraites, pas une seule
```
</div>

## 16.9 Résumé du chapitre

- Une expression lambda `(paramètres) -> expression` implémente de façon concise une interface fonctionnelle (une seule méthode abstraite, chapitre 8).
- `java.util.function` fournit des interfaces génériques prêtes à l'emploi : `Function`, `Predicate`, `Consumer`, `Supplier`.
- Les références de méthode (`::`) simplifient encore une lambda qui ne fait qu'appeler une méthode existante.
- Une lambda ne peut capturer qu'une variable locale "effectivement finale" (jamais réassignée).
- Les classes anonymes restent nécessaires pour les interfaces à plusieurs méthodes ou les classes abstraites avec état.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Utilise un `Predicate<Integer>` sous forme de lambda pour filtrer, dans une `List<Integer>`, uniquement les nombres pairs, à l'aide de `removeIf`.
</div>

**Corrigé :**
```java
List<Integer> nombres = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
nombres.removeIf(n -> n % 2 != 0); // retire tout ce qui N'EST PAS pair
System.out.println(nombres); // [2, 4, 6]
```

*Chapitre suivant : les Streams API, qui exploitent massivement les lambdas pour traiter des collections de façon déclarative.*
