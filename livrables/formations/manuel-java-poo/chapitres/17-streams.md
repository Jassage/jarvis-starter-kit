<div class="chapitre-titre-num">CHAPITRE 17</div>

# Les Streams API

## Objectifs pédagogiques

Comprendre le traitement déclaratif de collections via les Streams, maîtriser `filter`, `map`, `reduce`, `collect`, et savoir trier/rechercher avec cette API.

## 17.1 Le style impératif vs le style déclaratif (rappel de l'esprit du chapitre 1)

```java
// Style IMPÉRATIF classique : on décrit CHAQUE ÉTAPE du COMMENT
List<String> etudiantsMajeurs = new ArrayList<>();
for (Etudiant e : etudiants) {
    if (e.getAge() >= 18) {
        etudiantsMajeurs.add(e.getNom());
    }
}
Collections.sort(etudiantsMajeurs);
```

```java
// Style DÉCLARATIF avec Streams : on décrit CE QU'ON VEUT obtenir
List<String> etudiantsMajeurs = etudiants.stream()
    .filter(e -> e.getAge() >= 18)
    .map(Etudiant::getNom)
    .sorted()
    .toList();
```

Un **Stream** est un pipeline d'opérations appliquées à une séquence de données, exprimé comme une chaîne d'étapes déclaratives plutôt qu'une boucle explicite.

## 17.2 Créer un flux (Stream)

```java
List<String> noms = List.of("Jaslin", "Marie", "Paul");
Stream<String> flux1 = noms.stream();          // depuis une collection
Stream<String> flux2 = Stream.of("a", "b", "c"); // depuis des valeurs littérales
IntStream flux3 = IntStream.rangeClosed(1, 10);  // flux de nombres 1 à 10 inclus
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un Stream ne se consomme qu'UNE SEULE FOIS</span>
```java
Stream<String> flux = noms.stream();
flux.forEach(System.out::println);
flux.forEach(System.out::println); // 💥 IllegalStateException : le flux a déjà été "consommé"
```
Contrairement à une `List`, un `Stream` n'est **pas** une structure de données réutilisable : c'est un pipeline à usage unique. Pour reparcourir les mêmes données, il faut créer un **nouveau** Stream (`noms.stream()` à nouveau).
</div>

## 17.3 filter : ne garder que certains éléments

```java
List<Etudiant> etudiants = List.of(
    new Etudiant("Jaslin", 22, 16.5),
    new Etudiant("Marie", 17, 14.0),
    new Etudiant("Paul", 20, 9.5)
);

List<Etudiant> majeursEtBonneMoyenne = etudiants.stream()
    .filter(e -> e.getAge() >= 18)
    .filter(e -> e.getMoyenne() >= 10)
    .toList();
```

`filter` reçoit un `Predicate<T>` (chapitre 16) et ne conserve que les éléments pour lesquels il retourne `true`.

## 17.4 map : transformer chaque élément

```java
List<String> nomsEnMajuscules = etudiants.stream()
    .map(Etudiant::getNom)          // Etudiant → String (extrait juste le nom)
    .map(String::toUpperCase)       // String → String (transforme en majuscules)
    .toList();

System.out.println(nomsEnMajuscules); // [JASLIN, MARIE, PAUL]
```

`map` reçoit une `Function<T, R>` (chapitre 16) et transforme chaque élément du flux en un élément potentiellement d'un type différent.

## 17.5 reduce : combiner tous les éléments en une seule valeur

```java
double moyenneGenerale = etudiants.stream()
    .mapToDouble(Etudiant::getMoyenne)
    .average()                    // méthode dédiée pour la moyenne, plus lisible que reduce ici
    .orElse(0.0);

double sommeDesMoyennes = etudiants.stream()
    .map(Etudiant::getMoyenne)
    .reduce(0.0, (accumulateur, valeurCourante) -> accumulateur + valeurCourante);

System.out.println(sommeDesMoyennes); // 40.0
```

`reduce(valeurInitiale, (accumulateur, element) -> ...)` combine progressivement tous les éléments en une seule valeur finale — la même logique qu'une boucle `for` accumulant un total, exprimée de façon déclarative.

## 17.6 collect : reconstruire une collection depuis un flux

```java
import java.util.stream.Collectors;

List<String> noms = etudiants.stream()
    .map(Etudiant::getNom)
    .collect(Collectors.toList()); // équivalent, plus moderne : .toList()

Set<String> nomsUniques = etudiants.stream()
    .map(Etudiant::getNom)
    .collect(Collectors.toSet());

Map<String, Double> moyennesParNom = etudiants.stream()
    .collect(Collectors.toMap(Etudiant::getNom, Etudiant::getMoyenne));

String tousLesNoms = etudiants.stream()
    .map(Etudiant::getNom)
    .collect(Collectors.joining(", ")); // "Jaslin, Marie, Paul"
```

## 17.7 Tri avec sorted()

```java
List<Etudiant> triesParMoyenne = etudiants.stream()
    .sorted(Comparator.comparingDouble(Etudiant::getMoyenne))
    .toList();

List<Etudiant> triesParMoyenneDecroissante = etudiants.stream()
    .sorted(Comparator.comparingDouble(Etudiant::getMoyenne).reversed())
    .toList();

// Tri multi-critères : d'abord par âge, puis par nom en cas d'égalité
List<Etudiant> triesComplexe = etudiants.stream()
    .sorted(Comparator.comparingInt(Etudiant::getAge).thenComparing(Etudiant::getNom))
    .toList();
```

## 17.8 Recherche avec anyMatch, findFirst, count

```java
boolean auMoinsUnMajeur = etudiants.stream().anyMatch(e -> e.getAge() >= 18);
boolean tousMajeurs = etudiants.stream().allMatch(e -> e.getAge() >= 18);

Optional<Etudiant> premierMajeur = etudiants.stream()
    .filter(e -> e.getAge() >= 18)
    .findFirst();

premierMajeur.ifPresent(e -> System.out.println(e.getNom()));

long nombreMajeurs = etudiants.stream()
    .filter(e -> e.getAge() >= 18)
    .count();
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Optional : éviter les NullPointerException (rappel du chapitre 2)</span>
`findFirst()` retourne un `Optional<Etudiant>`, pas directement un `Etudiant` qui pourrait être `null`. `Optional` **force** à gérer explicitement le cas "absent" (`.ifPresent(...)`, `.orElse(...)`, `.orElseThrow(...)`) plutôt que de risquer une `NullPointerException` en oubliant de vérifier `null` soi-même.
</div>

## 17.9 Chaîner un pipeline complet

```java
String rapport = etudiants.stream()
    .filter(e -> e.getMoyenne() >= 10)
    .sorted(Comparator.comparingDouble(Etudiant::getMoyenne).reversed())
    .map(e -> e.getNom() + " (" + e.getMoyenne() + ")")
    .collect(Collectors.joining("\n"));

System.out.println(rapport);
// Jaslin (16.5)
```

## 17.10 Diagramme conceptuel du pipeline Stream

**Pipeline Stream — flux de transformation**

```{.uml}
etudiants.stream()
      │
      ▼
  filter(moyenne >= 10)     ── opération INTERMÉDIAIRE (paresseuse, ne s'exécute pas encore)
      │
      ▼
  sorted(par moyenne)        ── opération INTERMÉDIAIRE
      │
      ▼
  map(vers String)           ── opération INTERMÉDIAIRE
      │
      ▼
  collect(joining)           ── opération TERMINALE (déclenche l'exécution de TOUT le pipeline)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Les opérations intermédiaires sont "paresseuses" (lazy)</span>
`filter`, `map`, `sorted` ne s'exécutent **pas** immédiatement quand ils sont écrits — ils ne font que décrire le pipeline. Rien ne s'exécute réellement tant qu'une **opération terminale** (`collect`, `forEach`, `count`, `reduce`...) n'est pas appelée, qui déclenche alors le parcours effectif des données à travers tout le pipeline construit.
</div>

## 17.11 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier qu'un Stream ne modifie jamais la collection d'origine</span>
```java
etudiants.stream().filter(e -> e.getAge() >= 18); // ⚠️ Ne fait RIEN d'utile : le résultat n'est jamais récupéré !
```
Sans opération terminale **et** sans récupérer/utiliser son résultat, cette ligne ne produit aucun effet visible — `filter` (comme toute opération de Stream) ne modifie jamais `etudiants` lui-même, il faut toujours récupérer le résultat via `.toList()`, `.collect(...)`, ou une autre opération terminale.
</div>

## 17.12 Résumé du chapitre

- Les Streams permettent un traitement **déclaratif** de collections, en chaînant des opérations plutôt qu'en écrivant des boucles explicites.
- `filter` (garder), `map` (transformer), `reduce`/`collect` (combiner en un résultat final) sont les opérations centrales.
- Un Stream ne se consomme qu'une fois ; les opérations intermédiaires sont paresseuses jusqu'à une opération terminale.
- `Optional` (retourné par `findFirst()`, etc.) force à gérer explicitement l'absence de résultat, évitant les `NullPointerException`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

À partir d'une `List<Produit>` (attributs `nom`, `prix`, `categorie`), utilise les Streams pour obtenir la liste des noms de produits de la catégorie "Électronique", triés par prix décroissant.
</div>

**Corrigé :**
```java
List<String> resultat = produits.stream()
    .filter(p -> p.getCategorie().equals("Électronique"))
    .sorted(Comparator.comparingDouble(Produit::getPrix).reversed())
    .map(Produit::getNom)
    .toList();
```

*Ceci clôt la Partie 5 (Java moderne). Chapitre suivant : UML, pour formaliser la conception d'un système avant de l'implémenter.*
