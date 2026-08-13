<div class="chapitre-titre-num">CHAPITRE 19</div>

# ArrayList

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras la limite principale des tableaux, et tu sauras utiliser `ArrayList` pour stocker une collection d'éléments dont la taille peut évoluer librement.

## A. Le problème

Un tableau, une fois créé, a une **taille fixe**, décidée une fois pour toutes :

```java
String[] panier = new String[3];
panier[0] = "Riz";
panier[1] = "Haricots";
panier[2] = "Sucre";
panier[3] = "Huile"; // 💥 ArrayIndexOutOfBoundsException : impossible d'agrandir un tableau !
```

Or, dans la vraie vie, un panier de courses grandit et rétrécit sans cesse : on ajoute un article, on en retire un autre. Un tableau classique ne sait tout simplement pas faire ça.

## B. Exemple de la vie réelle

Pense à la différence entre une boîte à œufs (12 emplacements fixes, ni plus ni moins) et un sac à dos extensible : tu peux y ajouter ou retirer des objets librement, et le sac s'adapte. `ArrayList` est ce "sac extensible" de Java.

## C. Explication très simple

> `ArrayList` est une classe fournie par Java qui stocke une collection d'éléments **dont la taille peut grandir ou rétrécir librement**, à la différence d'un tableau classique.

## D. Premier exemple Java

```java
import java.util.ArrayList;

ArrayList<String> panier = new ArrayList<>();
panier.add("Riz");
panier.add("Haricots");
panier.add("Sucre");
panier.add("Huile"); // ✅ aucune limite fixée à l'avance !

System.out.println(panier); // [Riz, Haricots, Sucre, Huile]
```

## E. Explication ligne par ligne

```{.uml}
import java.util.ArrayList;
   │
   └─ ArrayList n'est PAS un mot-clé du langage comme int ou boolean :
      c'est une classe fournie par Java, qu'il faut IMPORTER avant de
      pouvoir l'utiliser (contrairement à String, importée automatiquement).

ArrayList<String> panier = new ArrayList<>();
    │        │       │        │        │
    │        │       │        │        └─ Les chevrons vides "<>" (le
    │        │       │        │           "diamant") : Java déduit tout
    │        │       │        │           seul qu'il s'agit d'un
    │        │       │        │           ArrayList<String>, pas besoin
    │        │       │        │           de le répéter.
    │        │       │        └─ Comme toujours, "new" crée l'objet réel.
    │        │       └─ Le nom de la variable.
    │        └─ ENTRE CHEVRONS (< >) : le TYPE des éléments que cet
    │           ArrayList contiendra — ici, uniquement des String.
    └─ Le type de la variable.

panier.add("Riz");
    │      │
    │      └─ Ajoute un élément À LA FIN de la liste.
    └─ La méthode s'appelle sur l'OBJET ArrayList, comme toute méthode
       vue depuis le chapitre 9.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Generics (les chevrons &lt; &gt;)</span>
Les chevrons <code>&lt;String&gt;</code> définissent le <strong>type générique</strong> de l'ArrayList : le type précis des éléments qu'elle contiendra. Cette notation, appelée les <strong>generics</strong>, garantit qu'on ne peut jamais accidentellement ajouter un nombre dans une liste de texte. Le chapitre 26 approfondit ce mécanisme, que tu peux pour l'instant simplement utiliser sans en connaître tous les rouages.
</div>

## F. Deuxième exemple : les méthodes essentielles d'ArrayList

```java
import java.util.ArrayList;

public class GestionPanier {
    public static void main(String[] args) {
        ArrayList<String> panier = new ArrayList<>();
        panier.add("Riz");
        panier.add("Haricots");
        panier.add("Sucre");

        System.out.println(panier.size());        // 3 → nombre d'éléments
        System.out.println(panier.get(1));         // "Haricots" → élément à l'indice 1
        System.out.println(panier.contains("Sucre")); // true

        panier.remove("Haricots"); // retire par VALEUR
        System.out.println(panier); // [Riz, Sucre]

        panier.remove(0); // retire par INDICE (ici, "Riz")
        System.out.println(panier); // [Sucre]

        for (String article : panier) { // for-each fonctionne aussi sur un ArrayList
            System.out.println("Article : " + article);
        }
    }
}
```

| Méthode | Rôle |
|---|---|
| `add(element)` | Ajoute un élément à la fin |
| `get(indice)` | Renvoie l'élément à cet indice |
| `remove(element)` | Retire la première occurrence de cette valeur |
| `remove(indice)` | Retire l'élément à cet indice |
| `size()` | Nombre d'éléments actuellement dans la liste |
| `contains(element)` | `true` si l'élément est présent |
| `isEmpty()` | `true` si la liste ne contient aucun élément |

<div class="encadre astuce">
<span class="encadre-titre">💡 ArrayList d'objets personnalisés</span>
Un ArrayList peut contenir n'importe quel type d'objet, y compris tes propres classes :

```java
ArrayList<Produit> catalogue = new ArrayList<>();
catalogue.add(new Produit("Riz", 250.0));
catalogue.add(new Produit("Sucre", 150.0));

for (Produit p : catalogue) {
    System.out.println(p.getNom());
}
```

C'est exactement comme ça qu'un vrai projet Java stocke, par exemple, la liste des clients ou des commandes d'une application.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser un type primitif entre les chevrons</span>

```java
ArrayList<int> nombres = new ArrayList<>(); // ❌ erreur de compilation : int est un type primitif
ArrayList<Integer> nombres = new ArrayList<>(); // ✅ "Integer" (majuscule), la version objet de int
```

Les generics n'acceptent que des **types objets**, jamais de types primitifs (`int`, `double`, `boolean`...). Java fournit une version "objet" de chaque primitif (`Integer` pour `int`, `Double` pour `double`, `Boolean` pour `boolean`), et convertit automatiquement entre les deux la plupart du temps (un mécanisme appelé **autoboxing**, qu'il suffit de connaître de nom pour l'instant).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier une liste pendant qu'on la parcourt avec for-each</span>

```java
ArrayList<String> liste = new ArrayList<>(java.util.List.of("A", "B", "C"));
for (String s : liste) {
    if (s.equals("B")) {
        liste.remove(s); // 💥 ConcurrentModificationException !
    }
}
```

Retirer un élément d'un `ArrayList` **pendant** qu'on le parcourt avec `for-each` provoque une erreur à l'exécution. La solution correcte (une technique un peu plus avancée, un `Iterator`) dépasse le cadre de ce chapitre — retiens simplement, pour l'instant, qu'il faut éviter cette combinaison.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais pourquoi un tableau classique ne peut pas grandir ni rétrécir.
✓ Je sais créer un ArrayList et y ajouter/retirer des éléments.
✓ Je connais les méthodes essentielles : add, get, remove, size, contains.
✓ Je sais qu'un ArrayList peut contenir mes propres classes.
✓ Je sais qu'il faut utiliser Integer, pas int, entre les chevrons.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris le code qui crée un `ArrayList<String>` de 3 prénoms, puis affiche `true` ou `false` selon que la liste contient `"Jaslin"`.
</div>

## Correction

```java
ArrayList<String> prenoms = new ArrayList<>();
prenoms.add("Marie");
prenoms.add("Jaslin");
prenoms.add("Paul");

System.out.println(prenoms.contains("Jaslin")); // true
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `calculerTotal(ArrayList<Double> prix)` qui renvoie la somme de tous les prix d'une liste, avec une boucle `for-each`.
</div>

### Corrigé du défi

```java
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Double> prix = new ArrayList<>();
        prix.add(250.0);
        prix.add(180.0);
        prix.add(500.0);

        System.out.println("Total : " + calculerTotal(prix)); // 930.0
    }

    static double calculerTotal(ArrayList<Double> prix) {
        double total = 0;
        for (double p : prix) {
            total += p;
        }
        return total;
    }
}
```

## Résumé du chapitre

- Un tableau classique a une taille **fixe** ; `ArrayList` peut grandir et rétrécir librement.
- `ArrayList<String> liste = new ArrayList<>();` déclare une liste de `String` (le type entre chevrons).
- Méthodes essentielles : `add`, `get`, `remove`, `size`, `contains`, `isEmpty`.
- Les generics n'acceptent que des types objets (`Integer`, pas `int`).
- Ne jamais retirer un élément d'une liste **pendant** un parcours `for-each`.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Crée un `ArrayList<Integer>` de 4 nombres, et affiche son nombre d'éléments.
</div>

**Corrigé :**
```java
ArrayList<Integer> nombres = new ArrayList<>();
nombres.add(10);
nombres.add(20);
nombres.add(30);
nombres.add(40);
System.out.println(nombres.size()); // 4
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Écris une méthode `trouverMaximum(ArrayList<Integer> nombres)` qui renvoie le plus grand nombre de la liste (réutilise le principe du défi du chapitre 6, adapté à un ArrayList).
</div>

**Corrigé :**
```java
static int trouverMaximum(ArrayList<Integer> nombres) {
    int maximum = nombres.get(0);
    for (int n : nombres) {
        if (n > maximum) {
            maximum = n;
        }
    }
    return maximum;
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une classe `Etudiant` a un attribut `moyenne`. Écris une méthode `compterAdmis(ArrayList<Etudiant> etudiants)` qui renvoie le nombre d'étudiants ayant une moyenne `>= 10`.
</div>

**Corrigé :**
```java
static int compterAdmis(ArrayList<Etudiant> etudiants) {
    int compteur = 0;
    for (Etudiant e : etudiants) {
        if (e.getMoyenne() >= 10) {
            compteur++;
        }
    }
    return compteur;
}
```

---

*Chapitre suivant : HashSet, une collection qui garantit qu'aucun élément ne peut jamais y apparaître deux fois.*
