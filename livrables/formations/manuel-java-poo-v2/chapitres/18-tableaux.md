<div class="chapitre-titre-num">CHAPITRE 18</div>

# Les tableaux

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras créer et parcourir des tableaux à une et deux dimensions, et rechercher un élément à l'intérieur.

## A. Le problème

Le chapitre 3 t'a donné un premier aperçu des tableaux. Mais un vrai programme a souvent besoin de représenter des grilles (un plateau de jeu, une salle de cinéma avec rangées et sièges), ou de retrouver un élément précis dans une grande liste de valeurs. Ce chapitre approfondit ce que tu sais déjà.

## B. Exemple de la vie réelle

Pense à une salle de cinéma. Les places ne sont pas alignées sur une seule file : elles forment une **grille**, avec des rangées et des colonnes (rangée A, siège 3 ; rangée B, siège 7...). Un simple tableau à une dimension ne suffit pas à représenter ça naturellement — il faut un **tableau à deux dimensions**, un tableau de tableaux.

## C. Rappel : le tableau simple

```java
int[] notes = {12, 15, 9, 18, 14};

for (int i = 0; i < notes.length; i++) {
    System.out.println("Note " + i + " : " + notes[i]);
}
```

## D. Premier exemple Java : un tableau à deux dimensions

```java
int[][] sallesCinema = {
    {1, 1, 0, 1}, // rangée A : 1 = occupé, 0 = libre
    {0, 0, 1, 1}, // rangée B
    {1, 0, 0, 0}  // rangée C
};
```

## E. Explication ligne par ligne

```{.uml}
int[][] sallesCinema = { {1,1,0,1}, {0,0,1,1}, {1,0,0,0} };
    │
    └─ DEUX paires de crochets : un tableau DONT CHAQUE ÉLÉMENT est
       lui-même un tableau. "sallesCinema[0]" est le tableau {1,1,0,1}
       (la rangée A entière) ; "sallesCinema[0][2]" est 0 (le 3e siège
       de la rangée A, à l'indice 2, toujours en commençant à 0).
```

```java
System.out.println(sallesCinema[0][2]); // 0 → rangée A, 3e siège (libre)
System.out.println(sallesCinema[1][3]); // 1 → rangée B, 4e siège (occupé)
System.out.println(sallesCinema.length);    // 3 → nombre de RANGÉES
System.out.println(sallesCinema[0].length); // 4 → nombre de SIÈGES par rangée
```

## F. Deuxième exemple : parcourir un tableau 2D avec des boucles imbriquées

```java
public class SalleCinema {
    public static void main(String[] args) {
        int[][] salle = {
            {1, 1, 0, 1},
            {0, 0, 1, 1},
            {1, 0, 0, 0}
        };

        int placesLibres = 0;

        for (int rangee = 0; rangee < salle.length; rangee++) {
            for (int siege = 0; siege < salle[rangee].length; siege++) {
                if (salle[rangee][siege] == 0) {
                    placesLibres++;
                }
            }
        }

        System.out.println("Places libres : " + placesLibres); // 5
    }
}
```

Une **boucle à l'intérieur d'une autre boucle** (boucles imbriquées) est la façon standard de parcourir un tableau à deux dimensions : la boucle extérieure avance rangée par rangée, la boucle intérieure avance siège par siège à l'intérieur de la rangée courante.

## Rechercher un élément dans un tableau

```java
public class RechercheTableau {
    public static void main(String[] args) {
        String[] noms = {"Marie", "Paul", "Jaslin", "Anne"};
        String recherche = "Jaslin";
        boolean trouve = false;
        int position = -1;

        for (int i = 0; i < noms.length; i++) {
            if (noms[i].equals(recherche)) {
                trouve = true;
                position = i;
                break; // inutile de continuer une fois trouvé
            }
        }

        if (trouve) {
            System.out.println(recherche + " trouvé à la position " + position);
        } else {
            System.out.println(recherche + " introuvable");
        }
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 break arrête une boucle, pas seulement un switch</span>
Tu connaissais déjà <code>break</code> pour un <code>switch</code> (chapitre 5). Il fonctionne exactement pareil dans une boucle : il l'arrête immédiatement, sans attendre que sa condition devienne naturellement fausse. Ici, une fois l'élément trouvé, continuer à parcourir le reste du tableau serait un travail inutile.
</div>

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Recherche linéaire</span>
Parcourir un tableau élément par élément, du début à la fin, jusqu'à trouver ce qu'on cherche, s'appelle une <strong>recherche linéaire</strong>. C'est la méthode la plus simple, mais aussi la plus lente sur un très grand tableau — les chapitres 19 à 21 introduisent des structures de données (ArrayList, HashSet, HashMap) offrant des recherches bien plus rapides dans certains cas.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre .length (tableau) et .length() (String)</span>

```java
int[] notes = {1, 2, 3};
System.out.println(notes.length());  // ❌ erreur de compilation : length n'est pas une méthode sur un tableau

String texte = "Bonjour";
System.out.println(texte.length);    // ❌ erreur de compilation : length EST une méthode sur String
```

Piège classique et fréquent : sur un **tableau**, `length` est un attribut, sans parenthèses. Sur un **String**, `.length()` est une méthode, avec parenthèses. Les deux se prononcent pareil à l'oral, ce qui entretient la confusion.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Inverser les indices d'un tableau 2D</span>

```java
int[][] salle = {{1, 1, 0}, {0, 1, 1}};
System.out.println(salle[2][0]); // 💥 ArrayIndexOutOfBoundsException : seulement 2 rangées (indices 0 et 1) !
```

Toujours vérifier séparément la taille de la première dimension (`salle.length`, le nombre de rangées) et celle de la deuxième (`salle[i].length`, le nombre d'éléments dans la rangée `i`) — elles ne sont pas forcément égales.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais créer et parcourir un tableau à deux dimensions.
✓ Je sais utiliser des boucles imbriquées pour parcourir une grille.
✓ Je sais rechercher un élément dans un tableau avec une recherche linéaire.
✓ Je ne confonds plus .length (tableau) et .length() (String).
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris une boucle qui compte combien de fois la valeur `7` apparaît dans un tableau `int[] valeurs`.
</div>

## Correction

```java
int[] valeurs = {7, 3, 7, 9, 7, 2};
int compteur = 0;

for (int v : valeurs) {
    if (v == 7) {
        compteur++;
    }
}
System.out.println("Le 7 apparaît " + compteur + " fois"); // 3
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Un plateau de jeu `int[][] plateau` de 3x3 contient des `0` (case vide) ou des `1` (case occupée). Écris un programme qui affiche, ligne par ligne, le plateau sous forme lisible (par exemple, `"."` pour vide et `"X"` pour occupé, sans espace entre les caractères d'une même ligne).
</div>

### Corrigé du défi

```java
public class Plateau {
    public static void main(String[] args) {
        int[][] plateau = {
            {1, 0, 1},
            {0, 1, 0},
            {1, 1, 0}
        };

        for (int ligne = 0; ligne < plateau.length; ligne++) {
            String rendu = "";
            for (int colonne = 0; colonne < plateau[ligne].length; colonne++) {
                if (plateau[ligne][colonne] == 1) {
                    rendu = rendu + "X";
                } else {
                    rendu = rendu + ".";
                }
            }
            System.out.println(rendu);
        }
    }
}
```

Résultat :
```text
X.X
.X.
XX.
```

## Résumé du chapitre

- Un tableau à deux dimensions (`int[][]`) est un tableau dont chaque élément est lui-même un tableau.
- On le parcourt avec des **boucles imbriquées** : une boucle extérieure pour les rangées, une boucle intérieure pour les colonnes.
- `.length` sur un tableau est un attribut (sans parenthèses) ; `.length()` sur un `String` est une méthode (avec parenthèses).
- Une **recherche linéaire** parcourt un tableau élément par élément jusqu'à trouver (ou non) ce qu'on cherche.
- `break` arrête une boucle immédiatement, pas seulement un `switch`.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Déclare un tableau `int[][] grille` de 2 lignes et 2 colonnes, rempli de valeurs de ton choix, et affiche la valeur en bas à droite.
</div>

**Corrigé :**
```java
int[][] grille = {{1, 2}, {3, 4}};
System.out.println(grille[1][1]); // 4
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Écris une méthode `contient(int[] tableau, int valeur)` qui renvoie `true` si `valeur` apparaît dans `tableau`, `false` sinon, en utilisant une recherche linéaire avec `break`.
</div>

**Corrigé :**
```java
static boolean contient(int[] tableau, int valeur) {
    boolean trouve = false;
    for (int v : tableau) {
        if (v == valeur) {
            trouve = true;
            break;
        }
    }
    return trouve;
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Pour le tableau 2D `sallesCinema` de la section D, écris un programme qui affiche la position (rangée, siège) du **premier** siège libre trouvé, ou `"Salle complète"` si aucun n'est libre.
</div>

**Corrigé :**
```java
int[][] salle = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}};
boolean trouve = false;

for (int rangee = 0; rangee < salle.length && !trouve; rangee++) {
    for (int siege = 0; siege < salle[rangee].length && !trouve; siege++) {
        if (salle[rangee][siege] == 0) {
            System.out.println("Premier siège libre : rangée " + rangee + ", siège " + siege);
            trouve = true;
        }
    }
}

if (!trouve) {
    System.out.println("Salle complète");
}
```
`!trouve` dans les deux conditions de boucle permet d'arrêter la recherche dès qu'un siège libre est trouvé, même à travers deux boucles imbriquées (un simple `break` n'arrêterait que la boucle intérieure).

---

*Chapitre suivant : ArrayList, une structure de données bien plus souple qu'un tableau, capable de grandir et rétrécir librement.*
