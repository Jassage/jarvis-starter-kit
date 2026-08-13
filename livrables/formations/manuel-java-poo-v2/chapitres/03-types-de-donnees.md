<div class="chapitre-titre-num">CHAPITRE 3</div>

# Les types de données

## Objectifs pédagogiques

À la fin de ce chapitre, tu connaîtras les principaux types de données de Java (nombres entiers, nombres à virgule, texte, vrai/faux), tu sauras choisir le bon type selon la situation, et tu sauras créer un tableau simple pour ranger plusieurs valeurs du même type.

## A. Le problème

Au chapitre 2, on a vu qu'une variable a toujours un type. Mais pourquoi Java propose-t-il **plusieurs** types de nombres (`int`, `long`, `double`, `float`...) au lieu d'un seul type universel « nombre » ?

Parce que toutes les informations numériques n'ont pas les mêmes besoins. Un âge (0 à 120) et la population mondiale (plus de 8 milliards) ne demandent pas la même quantité de mémoire pour être stockés. Un prix avec centimes (19,99) n'a pas la même nature qu'un nombre d'articles en stock (toujours un nombre entier, jamais "3,5 articles"). Utiliser le type adapté à chaque situation, c'est écrire un programme à la fois plus clair et plus efficace.

## B. Exemple de la vie réelle

Pense à un classeur de rangement avec des tiroirs de tailles différentes.

```{.uml}
┌───────────────────────────────┐
│  Petit tiroir : pièces de monnaie (peu de place nécessaire) │
├───────────────────────────────┤
│  Grand tiroir : dossiers épais (beaucoup de place)          │
├───────────────────────────────┤
│  Tiroir spécial : liquides (une bouteille, pas un dossier)  │
└───────────────────────────────┘
```

Tu ne ranges pas une bouteille d'eau dans le tiroir à pièces de monnaie : ça ne rentrerait pas, ou ce serait un gâchis de place. De la même façon, Java propose plusieurs « tiroirs » (types) de tailles et de natures différentes, et choisir le bon évite le gaspillage et les erreurs.

## C. Explication très simple

Les types de données en Java se répartissent en deux grandes familles :

1. **Les types primitifs** : des types de base, fournis directement par Java, qui stockent une seule valeur simple (un nombre, un caractère, un booléen).
2. **Les types référence** : des types plus complexes, comme `String` (le texte) ou les classes qu'on créera nous-mêmes à partir du chapitre 9. On y reviendra en détail plus loin dans le manuel (chapitre 9, section sur les références d'objets).

Ce chapitre se concentre sur les types primitifs, plus `String` qui, bien que techniquement un type référence, s'utilise dès le début tellement il est courant.

## D. Premier exemple Java

```java
int nombreEtudiants = 45;
long populationHaiti = 11_400_000L;
double prixArticle = 19.99;
char premiereLettre = 'J';
boolean estOuvert = true;
String nomBoutique = "Boutique Jaslin";
```

## E. Explication : le tableau des types primitifs

| Type | Contient | Exemple | Taille approximative |
|---|---|---|---|
| `byte` | Très petit nombre entier | `12` | 1 octet (-128 à 127) |
| `short` | Petit nombre entier | `1200` | 2 octets |
| `int` | Nombre entier courant | `45`, `-3` | 4 octets (jusqu'à environ 2 milliards) |
| `long` | Très grand nombre entier | `11_400_000L` | 8 octets |
| `float` | Nombre à virgule, précision réduite | `19.99f` | 4 octets |
| `double` | Nombre à virgule, précision courante | `19.99` | 8 octets |
| `char` | Un seul caractère | `'J'` | 2 octets |
| `boolean` | Vrai ou faux | `true` / `false` | 1 bit (en pratique) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Lequel choisir, dans la pratique ?</span>
Pour un débutant (et même pour un développeur expérimenté, dans l'immense majorité des cas), deux règles suffisent : utilise <code>int</code> pour presque tous tes nombres entiers, et <code>double</code> pour presque tous tes nombres à virgule. Les autres types (<code>byte</code>, <code>short</code>, <code>float</code>, <code>long</code>) ne deviennent utiles que dans des cas précis (économiser de la mémoire sur des millions de valeurs, dépasser la limite d'un <code>int</code>...), rencontrés bien plus tard.
</div>

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : String</span>
<code>String</code> est le type qui représente du <strong>texte</strong> en Java : une suite de caractères, toujours écrite entre guillemets doubles (<code>"Bonjour"</code>). Contrairement à <code>char</code> qui ne contient qu'un seul caractère entre guillemets <strong>simples</strong> (<code>'J'</code>), <code>String</code> peut contenir zéro, un, ou des milliers de caractères.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne confonds jamais 'J' et "J"</span>

```java
char lettre = 'J';   // ✅ un seul caractère, guillemets SIMPLES
String texte = "J";  // ✅ du texte (même s'il ne contient qu'un caractère), guillemets DOUBLES
char erreur = "J";   // ❌ erreur de compilation : "J" est un String, pas un char
```
</div>

## F. Deuxième exemple

Un petit programme qui utilise plusieurs types ensemble, dans une situation réaliste :

```java
public class ArticleBoutique {
    public static void main(String[] args) {
        String nom = "Sac de riz 5kg";
        double prix = 550.0;
        int quantiteEnStock = 32;
        boolean disponible = quantiteEnStock > 0;
        char categorie = 'A'; // A = Alimentaire, par exemple

        System.out.println("Article : " + nom);
        System.out.println("Prix : " + prix + " HTG");
        System.out.println("En stock : " + quantiteEnStock);
        System.out.println("Disponible : " + disponible);
        System.out.println("Catégorie : " + categorie);
    }
}
```

## Créer un tableau simple

Il arrive très souvent qu'on ait besoin de ranger, non pas une seule valeur, mais **plusieurs valeurs du même type** ensemble : les notes d'un étudiant, les prix d'un panier, les noms d'une classe entière. Java propose pour cela le **tableau** (`array`), qu'on détaillera en profondeur au chapitre 18 — voici seulement de quoi te dépanner dès maintenant.

```java
int[] notes = {12, 15, 9, 18, 14};

System.out.println(notes[0]); // 12 → le PREMIER élément est à l'indice 0, pas 1 !
System.out.println(notes[2]); // 9  → le TROISIÈME élément est à l'indice 2
System.out.println(notes.length); // 5 → le nombre total d'éléments du tableau
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Indice (index)</span>
L'<strong>indice</strong> est la position d'un élément dans un tableau. En Java (comme dans la plupart des langages de programmation), le comptage commence toujours à <strong>0</strong>, pas à 1. Le premier élément est donc à l'indice <code>0</code>, le deuxième à l'indice <code>1</code>, et ainsi de suite jusqu'à <code>longueur - 1</code>.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur classique de débutant : compter à partir de 1</span>

```java
int[] notes = {12, 15, 9, 18, 14};
System.out.println(notes[5]); // 💥 ArrayIndexOutOfBoundsException !
```

Un tableau de 5 éléments a des indices allant de `0` à `4`. L'indice `5` n'existe pas — c'est une des erreurs les plus fréquentes chez les débutants, tellement fréquente qu'elle a un nom d'exception dédié en Java : `ArrayIndexOutOfBoundsException`.
</div>

## G. Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Perdre de la précision en mélangeant int et double</span>

```java
int total = 10 / 3; // total vaut 3, PAS 3.33 !
System.out.println(total); // 3
```

Diviser deux `int` entre eux donne toujours un résultat `int`, arrondi en supprimant tout ce qui suit la virgule (jamais en arrondissant au plus proche). Pour obtenir un résultat précis, au moins un des deux nombres doit être un `double` : `double total = 10.0 / 3;` donne bien `3.3333...`. Le chapitre 4 (Opérateurs) revient en détail sur ce piège.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Dépasser la capacité d'un type (overflow)</span>

```java
int grandNombre = 2_147_483_647; // la valeur maximale d'un int
grandNombre = grandNombre + 1;
System.out.println(grandNombre); // -2147483648 !! (pas une erreur, un résultat FAUX et silencieux)
```

Un `int` ne peut pas dépasser environ 2,1 milliards. Le dépasser ne provoque **aucune erreur visible** : le nombre "boucle" silencieusement vers la valeur négative la plus basse. C'est pour ça qu'on utilise `long` dès qu'on manipule potentiellement de très grands nombres (population, montants cumulés sur des années...).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Comparer des String avec ==</span>

```java
String a = "Jaslin";
String b = "Jaslin";
System.out.println(a == b); // fonctionne "par chance" ici, mais ne JAMAIS s'y fier
```

On y reviendra en détail au chapitre 9 (section 2.6 du chapitre précédent l'a déjà signalé) : pour comparer le **contenu** de deux `String`, utilise toujours `.equals()`, jamais `==`.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je connais les principaux types primitifs de Java et ce qu'ils contiennent.
✓ Je sais que int convient pour presque tous les nombres entiers, et double
  pour presque tous les nombres à virgule.
✓ Je ne confonds plus 'J' (char) et "J" (String).
✓ Je sais créer un tableau simple et accéder à ses éléments par leur indice.
✓ Je sais qu'un tableau commence toujours à l'indice 0.
```
</div>

## H. Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Quel type choisirais-tu pour chacune de ces informations : (a) le nombre d'habitants d'un pays, (b) le prix d'un produit en gourdes avec centimes, (c) la première initiale du nom d'un client, (d) si un client est majeur ou non ?
</div>

## I. Correction

(a) `long` (ou `int` si le pays a moins de 2 milliards d'habitants — mais `long` est plus prudent pour une population nationale).
(b) `double`, car un prix avec centimes nécessite une virgule.
(c) `char`, car c'est un seul caractère.
(d) `boolean`, car la réponse est forcément vrai ou faux.

## J. Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Crée un tableau `int[] prix` contenant 4 prix de ton choix. Affiche le premier et le dernier prix du tableau (le dernier, sans écrire son indice en dur, en utilisant `prix.length`).
</div>

### Corrigé du défi

```java
public class Prix {
    public static void main(String[] args) {
        int[] prix = {250, 180, 500, 75};

        System.out.println("Premier prix : " + prix[0]);
        System.out.println("Dernier prix : " + prix[prix.length - 1]);
    }
}
```

`prix.length` vaut `4` (le nombre d'éléments). Le dernier élément est donc toujours à l'indice `prix.length - 1`, quelle que soit la taille du tableau — une astuce à retenir, bien plus fiable que d'écrire l'indice en dur.

## K. Résumé du chapitre

- Java propose plusieurs types de nombres (`int`, `long`, `double`, `float`...) pour s'adapter à la nature et à la taille de l'information.
- En pratique, `int` pour les entiers et `double` pour les nombres à virgule couvrent la grande majorité des besoins d'un débutant.
- `char` (un seul caractère, guillemets simples) et `String` (du texte, guillemets doubles) ne sont **jamais** interchangeables.
- Un `int` a une capacité maximale ; la dépasser produit un résultat faux et silencieux (overflow), sans erreur visible.
- Un **tableau** range plusieurs valeurs du même type ; le premier élément est toujours à l'indice `0`.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Déclare un tableau `String[] jours` contenant les noms de 3 jours de la semaine, puis affiche le deuxième jour du tableau.
</div>

**Corrigé :**
```java
String[] jours = {"Lundi", "Mardi", "Mercredi"};
System.out.println(jours[1]); // Mardi
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Que va afficher ce code, et pourquoi ?

```java
int a = 7;
int b = 2;
double resultat = a / b;
System.out.println(resultat);
```
</div>

**Corrigé :** Le code affiche **3.0**, pas 3.5. `a / b` est une division entre deux `int` (`7 / 2`), qui donne `3` en tronquant la partie décimale — **avant même** d'être rangée dans `resultat`. Le fait que `resultat` soit un `double` ne change rien : le calcul `a / b` est déjà terminé et déjà faux (au sens "imprécis") au moment où son résultat est copié dans la variable. Pour obtenir `3.5`, il aurait fallu écrire `(double) a / b` ou `a / (double) b` — la conversion de type, vue plus en détail au chapitre 4.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Un professeur veut stocker les notes sur 20 de 5 étudiants dans un tableau `double[]`. Écris le code qui déclare ce tableau avec 5 valeurs de ton choix, puis affiche la note du 3ᵉ étudiant et la note du dernier étudiant (sans indice écrit en dur pour ce dernier).
</div>

**Corrigé :**
```java
public class NotesEtudiants {
    public static void main(String[] args) {
        double[] notes = {14.5, 16.0, 9.5, 18.0, 12.5};

        System.out.println("Note du 3e étudiant : " + notes[2]);
        System.out.println("Note du dernier étudiant : " + notes[notes.length - 1]);
    }
}
```

---

*Chapitre suivant : les opérateurs, pour apprendre à calculer, comparer et combiner les valeurs que tu sais maintenant stocker.*
