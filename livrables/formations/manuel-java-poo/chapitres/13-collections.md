<div class="chapitre-titre-num">CHAPITRE 13</div>

# Les collections Java

## Objectifs pédagogiques

Connaître les interfaces `List`, `Set`, `Map` et leurs implémentations principales, savoir choisir la bonne collection selon le besoin, et manipuler un `Iterator`.

## 13.1 Pourquoi les collections plutôt que les tableaux

```java
String[] noms = new String[3]; // taille FIXE, définie une fois pour toutes
noms[0] = "Jaslin";
noms[1] = "Marie";
// noms[3] = "Paul"; // ❌ ArrayIndexOutOfBoundsException : impossible d'agrandir un tableau
```

Les tableaux Java ont une taille **fixe**, définie à la création. Les **collections** (package `java.util`) offrent des structures de données dont la taille s'ajuste dynamiquement, avec des méthodes riches pour ajouter, retirer, rechercher, trier.

## 13.2 List : une séquence ordonnée, avec doublons possibles

```java
import java.util.List;
import java.util.ArrayList;

List<String> etudiants = new ArrayList<>(); // le type déclaré est l'INTERFACE List, l'implémentation ArrayList
etudiants.add("Jaslin");
etudiants.add("Marie");
etudiants.add("Jaslin"); // doublon autorisé dans une List

System.out.println(etudiants.get(0));      // "Jaslin" — accès par index, comme un tableau
System.out.println(etudiants.size());       // 3
etudiants.remove("Marie");                  // retire la première occurrence trouvée
System.out.println(etudiants);              // [Jaslin, Jaslin]
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Programmer contre l'interface, pas l'implémentation</span>
```java
List<String> noms = new ArrayList<>(); // ✅ Recommandé : type déclaré = interface List
ArrayList<String> noms2 = new ArrayList<>(); // ⚠️ Fonctionne, mais moins flexible
```
Déclarer une variable avec le type **interface** (`List`) plutôt que l'implémentation concrète (`ArrayList`) permet de changer d'implémentation plus tard (`LinkedList`, par exemple) sans modifier tout le code qui utilise cette variable — une application directe du principe d'abstraction (chapitre 7) et du principe SOLID d'inversion de dépendance (chapitre 19).
</div>

### ArrayList vs LinkedList

| Critère | ArrayList | LinkedList |
|---|---|---|
| Structure interne | Tableau redimensionnable | Liste doublement chaînée |
| Accès par index (`get(i)`) | Rapide (O(1)) | Lent (O(n), doit parcourir la chaîne) |
| Ajout/suppression au milieu | Lent (décale les éléments suivants) | Rapide (O(1), une fois la position atteinte) |
| Cas d'usage typique | Accès fréquent par index, peu d'insertions au milieu | Insertions/suppressions fréquentes au milieu |

<div class="encadre astuce">
<span class="encadre-titre">💡 Par défaut, choisis ArrayList</span>
Dans l'immense majorité des cas réels, `ArrayList` est le bon choix par défaut. `LinkedList` ne se justifie que face à un besoin mesuré et spécifique d'insertions/suppressions fréquentes en milieu de liste.
</div>

## 13.3 Set : pas de doublons, ordre non garanti (sauf variantes)

```java
import java.util.Set;
import java.util.HashSet;

Set<String> emails = new HashSet<>();
emails.add("jaslin@mail.com");
emails.add("marie@mail.com");
emails.add("jaslin@mail.com"); // ignoré silencieusement : déjà présent

System.out.println(emails.size()); // 2, pas 3 — le doublon n'a jamais été ajouté
```

```java
import java.util.TreeSet;

Set<String> emailsTries = new TreeSet<>(); // TreeSet : maintient un ORDRE (naturel, ou personnalisé)
emailsTries.add("marie@mail.com");
emailsTries.add("ali@mail.com");
System.out.println(emailsTries); // [ali@mail.com, marie@mail.com] — trié automatiquement
```

| Implémentation | Ordre | Performance |
|---|---|---|
| `HashSet` | Aucun ordre garanti | La plus rapide (accès quasi O(1)) |
| `LinkedHashSet` | Ordre d'insertion préservé | Légèrement plus lente que HashSet |
| `TreeSet` | Ordre trié (naturel ou `Comparator`) | Plus lente (O(log n)) mais toujours triée |

## 13.4 Map : associations clé-valeur

```java
import java.util.Map;
import java.util.HashMap;

Map<String, Double> soldesComptes = new HashMap<>();
soldesComptes.put("jaslin@mail.com", 5000.0);
soldesComptes.put("marie@mail.com", 3200.0);

System.out.println(soldesComptes.get("jaslin@mail.com")); // 5000.0
System.out.println(soldesComptes.containsKey("paul@mail.com")); // false
soldesComptes.put("jaslin@mail.com", 5500.0); // remplace la valeur existante pour cette clé

for (Map.Entry<String, Double> entree : soldesComptes.entrySet()) {
    System.out.println(entree.getKey() + " → " + entree.getValue());
}
```

`HashMap` (non trié), `LinkedHashMap` (ordre d'insertion préservé) et `TreeMap` (trié par clé) suivent exactement la même logique de choix que pour `Set` (section 13.3).

## 13.5 Iterator : parcourir une collection en toute sécurité

```java
import java.util.Iterator;

List<String> taches = new ArrayList<>(List.of("Devoir", "Lecture", "Sport"));

Iterator<String> it = taches.iterator();
while (it.hasNext()) {
    String tache = it.next();
    if (tache.equals("Sport")) {
        it.remove(); // suppression SÉCURISÉE pendant l'itération
    }
}
System.out.println(taches); // [Devoir, Lecture]
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ ConcurrentModificationException : modifier une liste pendant un for-each classique</span>
```java
for (String tache : taches) {
    if (tache.equals("Sport")) {
        taches.remove(tache); // 💥 ConcurrentModificationException à l'itération suivante
    }
}
```
Modifier directement une collection (`add`/`remove`) pendant qu'un for-each classique la parcourt lève une exception, car la boucle utilise en coulisses un `Iterator` qui détecte cette modification externe non sécurisée. Utilise `Iterator.remove()` explicitement (comme en exemple ci-dessus), ou `removeIf(...)` (section 13.6) pour ce besoin précis.
</div>

## 13.6 Quelques méthodes pratiques modernes

```java
List<String> noms = new ArrayList<>(List.of("Jaslin", "Marie", "Paul"));

noms.removeIf(nom -> nom.startsWith("P")); // supprime "Paul" — syntaxe lambda, chapitre 16
noms.forEach(System.out::println);         // affiche chaque élément — référence de méthode, chapitre 16

List<String> immuable = List.of("a", "b", "c"); // liste IMMUABLE, toute tentative de modification lève une exception
```

## 13.7 Diagramme UML des interfaces de collections

**Hiérarchie simplifiée des collections Java**

```{.uml}
              Collection «interface»
             /          |            \
        List        Set              Queue
     «interface»  «interface»      «interface»
        │             │
   ┌────┴────┐   ┌────┴─────┐
ArrayList  LinkedList   HashSet  TreeSet


                Map «interface» (indépendante de Collection)
                    │
             ┌──────┴───────┐
          HashMap        TreeMap
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Map n'hérite PAS de Collection</span>
Contrairement à `List` et `Set`, l'interface `Map` (associations clé-valeur) fait partie du même framework des collections Java, mais n'hérite **pas** de l'interface `Collection` — une distinction historique de conception à connaître pour éviter toute confusion.
</div>

## 13.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser un HashMap/HashSet avec une clé dont equals()/hashCode() ne sont pas correctement définis</span>
```java
public class Etudiant {
    String nom;
    // equals() et hashCode() NON redéfinis : utilisent la comparaison de référence par défaut
}

Set<Etudiant> etudiants = new HashSet<>();
etudiants.add(new Etudiant("Jaslin"));
etudiants.add(new Etudiant("Jaslin")); // ⚠️ Ajouté quand même : ce sont deux OBJETS différents, "égaux" en apparence seulement
System.out.println(etudiants.size()); // 2, probablement pas le résultat voulu
```
Sans redéfinir `equals()`/`hashCode()` (technique approfondie en pratique dans les projets des chapitres 22-23), un `HashSet`/`HashMap` compare les objets par référence, pas par contenu métier — deux `Etudiant` avec le même nom sont traités comme différents.
</div>

## 13.9 Résumé du chapitre

- `List` (ordonnée, doublons permis), `Set` (pas de doublons), `Map` (clé-valeur) sont les trois familles principales, chacune avec plusieurs implémentations aux compromis différents.
- `ArrayList` est le choix par défaut pour `List` ; `LinkedList` seulement face à un besoin mesuré d'insertions fréquentes au milieu.
- `HashSet`/`HashMap` (rapides, non triés), `LinkedHashSet`/`LinkedHashMap` (ordre d'insertion), `TreeSet`/`TreeMap` (triés).
- Toujours utiliser `Iterator.remove()` ou `removeIf(...)` pour modifier une collection pendant son parcours, jamais un for-each classique.
- Utiliser un objet métier comme clé de `Map`/`Set` exige de redéfinir correctement `equals()`/`hashCode()`.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Utilise une `Map<String, Integer>` pour compter le nombre d'occurrences de chaque mot dans une liste de mots donnée.
</div>

**Corrigé :**
```java
List<String> mots = List.of("chat", "chien", "chat", "oiseau", "chien", "chat");
Map<String, Integer> compteur = new HashMap<>();

for (String mot : mots) {
    compteur.put(mot, compteur.getOrDefault(mot, 0) + 1);
}

System.out.println(compteur); // {chat=3, chien=2, oiseau=1} (ordre non garanti avec HashMap)
```

*Chapitre suivant : les énumérations, pour représenter un ensemble fixe et fini de valeurs possibles.*
