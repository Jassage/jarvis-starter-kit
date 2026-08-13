<div class="chapitre-titre-num">CHAPITRE 4</div>

# Les opérateurs

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras effectuer des calculs, comparer des valeurs et combiner des conditions en Java, et tu comprendras précisément pourquoi `10 / 3` ne donne pas ce qu'on attend intuitivement.

## A. Le problème

Une variable qui garde une seule valeur figée n'est déjà pas mal, mais un programme utile doit **calculer** : additionner un prix et une taxe, comparer un âge à une limite, vérifier plusieurs conditions à la fois. Il faut donc des symboles pour dire à Java quelle opération effectuer.

## B. Exemple de la vie réelle

Pense à une calculatrice de poche. Tu tapes `8`, puis `+`, puis `4`, puis `=`, et elle affiche `12`. Le `+` est un **opérateur** : un symbole qui indique quelle opération effectuer sur les valeurs qui l'entourent. Java fonctionne exactement pareil, avec beaucoup plus d'opérateurs qu'une simple calculatrice, y compris pour comparer et pour combiner des conditions vraies/fausses.

## C. Explication très simple

> Un **opérateur** est un symbole qui effectue une opération (calcul, comparaison, combinaison logique) sur une ou deux valeurs, appelées ses **opérandes**.

Java propose trois grandes familles d'opérateurs, qu'on voit une par une.

## D. Les opérateurs arithmétiques (calcul)

```java
int a = 10;
int b = 3;

System.out.println(a + b); // 13 → addition
System.out.println(a - b); // 7  → soustraction
System.out.println(a * b); // 30 → multiplication
System.out.println(a / b); // 3  → division ENTIÈRE (voir plus bas)
System.out.println(a % b); // 1  → modulo : le RESTE de la division
```

## E. Explication : la division entière et le modulo

Ces deux opérateurs surprennent presque tous les débutants au premier contact, donc prenons le temps de bien les comprendre.

```{.uml}
  a / b     quand a et b sont tous les deux des int
    ↓
  Division ENTIÈRE : le résultat est TOUJOURS un int,
  la partie après la virgule est purement supprimée
  (pas arrondie — supprimée).

  10 / 3 = 3        (et non 3.33)
  7  / 2 = 3        (et non 3.5)

  a % b     ("modulo")
    ↓
  Le RESTE de la division entière de a par b.

  10 % 3 = 1   →  car 10 = 3×3 + 1
  7  % 2 = 1   →  car 7  = 3×2 + 1
  9  % 3 = 0   →  car 9 est parfaitement divisible par 3
```

<div class="encadre astuce">
<span class="encadre-titre">💡 À quoi sert vraiment le modulo ?</span>
Le modulo (<code>%</code>) sert énormément en pratique : savoir si un nombre est pair (<code>nombre % 2 == 0</code>), répartir des éléments en groupes égaux, faire "boucler" un compteur (par exemple, revenir à 0 après avoir atteint 7 pour représenter les jours de la semaine). Tu le recroiseras très souvent dans ce manuel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pour un résultat précis, force au moins un double</span>

```java
int a = 10;
int b = 3;
double resultatFaux = a / b;              // 3.0 → le calcul entier a déjà eu lieu, trop tard !
double resultatCorrect = (double) a / b;  // 3.3333333333333335 → correct
```

`(double) a` est une **conversion de type** (on dit aussi un **cast**) : on force temporairement Java à traiter `a` comme un `double` avant d'effectuer la division, ce qui empêche la division entière de se déclencher.
</div>

## F. Les opérateurs de comparaison

```java
int age = 20;

System.out.println(age == 20); // true  → égal à
System.out.println(age != 20); // false → différent de
System.out.println(age > 18);  // true  → strictement supérieur à
System.out.println(age < 18);  // false → strictement inférieur à
System.out.println(age >= 20); // true  → supérieur ou égal à
System.out.println(age <= 18); // false → inférieur ou égal à
```

Chaque comparaison produit toujours un `boolean` (`true` ou `false`), jamais autre chose.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur très fréquente : confondre = et ==</span>

```java
int age = 20;
if (age = 25) { // ❌ erreur de compilation en Java (heureusement !)
    ...
}
```

`=` **affecte** une valeur (chapitre 2) ; `==` **compare** deux valeurs. En Java, contrairement à certains langages, écrire `=` là où `==` est attendu provoque directement une erreur de compilation pour les types numériques et booléens — une protection bienvenue qui n'existe pas dans tous les langages.
</div>

## G. Les opérateurs logiques (combiner des conditions)

```java
int age = 20;
boolean aCarteEtudiant = true;

System.out.println(age >= 18 && aCarteEtudiant); // true  → ET : les DEUX doivent être vraies
System.out.println(age < 18 || aCarteEtudiant);  // true  → OU : AU MOINS UNE doit être vraie
System.out.println(!aCarteEtudiant);              // false → NON : inverse la valeur
```

```{.uml}
&&  (ET)   →  true SEULEMENT si les DEUX côtés sont vrais
||  (OU)   →  true si AU MOINS UN des deux côtés est vrai
!   (NON)  →  inverse une valeur booléenne (true devient false, et inversement)
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Court-circuit</span>
Java arrête l'évaluation d'un <code>&&</code> dès que le premier côté est <code>false</code> (le résultat sera de toute façon <code>false</code>), et d'un <code>||</code> dès que le premier côté est <code>true</code> (le résultat sera de toute façon <code>true</code>). On appelle ça l'<strong>évaluation en court-circuit</strong> : le deuxième côté n'est même pas examiné si le résultat est déjà certain. C'est utile, par exemple, pour éviter une erreur : <code>objet != null && objet.taille() > 0</code> ne vérifie <code>objet.taille()</code> que si <code>objet</code> n'est effectivement pas <code>null</code>.
</div>

## Deuxième exemple : tout combiné

```java
public class VerificationAcces {
    public static void main(String[] args) {
        int age = 17;
        boolean accompagne = true;

        boolean peutEntrer = (age >= 18) || (age >= 12 && accompagne);

        System.out.println("Peut entrer : " + peutEntrer); // true
    }
}
```

Ici, `peutEntrer` vaut `true` car même si `age >= 18` est faux (17 n'est pas ≥ 18), la deuxième partie `age >= 12 && accompagne` est vraie (17 ≥ 12, et la personne est accompagnée). Les parenthèses rendent l'ordre d'évaluation explicite et évitent toute ambiguïté.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier que + concatène du texte, mais additionne des nombres</span>

```java
System.out.println("Total : " + 5 + 3);   // "Total : 53" (pas 8 !)
System.out.println("Total : " + (5 + 3)); // "Total : 8"  (avec parenthèses)
```

Java lit `+` de gauche à droite. `"Total : " + 5` colle d'abord le texte et le nombre (`"Total : 5"`), puis `+ 3` colle encore `3` au résultat déjà textuel. Les parenthèses forcent l'addition mathématique à se faire **avant** la concaténation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Diviser par zéro</span>

```java
int a = 10;
int b = 0;
System.out.println(a / b); // 💥 ArithmeticException: / by zero
```

Diviser un entier par zéro provoque une erreur immédiate (une **exception**, chapitre 22). Avec des `double`, en revanche, `10.0 / 0` ne plante pas mais donne `Infinity` — un comportement différent à connaître.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais utiliser les opérateurs arithmétiques (+ - * / %).
✓ Je comprends la division entière et je sais forcer un résultat précis.
✓ Je sais comparer des valeurs (== != > < >= <=).
✓ Je sais combiner des conditions avec && (ET), || (OU) et ! (NON).
✓ Je ne confonds plus = (affectation) et == (comparaison).
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Que vaut `17 % 5` ? Explique le calcul.
</div>

**Correction :** `17 % 5` vaut **2**. `17 = 5 × 3 + 2` : 5 rentre 3 fois dans 17 (soit 15), et il reste 2. Le modulo renvoie précisément ce reste.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris un programme qui déclare un `int nombre` de ton choix, et affiche `"Pair"` si `nombre % 2 == 0` est vrai, sinon affiche `"Impair"` — en utilisant uniquement ce que tu as vu jusqu'ici (tu peux t'aider d'un `System.out.println` conditionné par une variable booléenne intermédiaire ; le vrai `if` arrive au chapitre suivant).
</div>

### Corrigé du défi

```java
public class PairOuImpair {
    public static void main(String[] args) {
        int nombre = 14;
        boolean estPair = nombre % 2 == 0;

        System.out.println(estPair ? "Pair" : "Impair");
        // L'opérateur ?: (ternaire) : "condition ? valeurSiVrai : valeurSiFaux"
        // Un raccourci pratique, revu au chapitre 5.
    }
}
```

## Résumé du chapitre

- Les **opérateurs arithmétiques** (`+ - * / %`) effectuent des calculs ; la division entre deux `int` est toujours entière (tronquée), jamais arrondie.
- Le **modulo** (`%`) donne le reste d'une division, très utile pour tester la parité ou faire "boucler" un compteur.
- Les **opérateurs de comparaison** (`== != > < >= <=`) produisent toujours un `boolean`.
- Les **opérateurs logiques** (`&& || !`) combinent des conditions booléennes, avec évaluation en court-circuit.
- `=` affecte une valeur, `==` la compare : ne jamais les confondre.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Que vaut `9 / 2` en Java (avec deux int) ? Et `9.0 / 2` ?
</div>

**Corrigé :** `9 / 2` vaut `4` (division entière, tronquée). `9.0 / 2` vaut `4.5` (au moins un des deux opérandes est un `double`, donc le résultat garde sa précision).

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Un âge est stocké dans `int age = 15;`. Écris une expression booléenne qui vaut `true` uniquement si la personne est mineure (moins de 18 ans) ET a au moins 13 ans (adolescent).
</div>

**Corrigé :**
```java
boolean estAdolescent = age >= 13 && age < 18; // true pour age = 15
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Sans exécuter le code, prédis ce qu'affichent ces trois lignes, et explique chaque résultat :

```java
System.out.println(7 % 3);
System.out.println("Score : " + 2 + 2);
System.out.println("Score : " + (2 + 2));
```
</div>

**Corrigé :**
```text
1
Score : 22
Score : 4
```
`7 % 3` vaut `1` (7 = 3×2 + 1). `"Score : " + 2 + 2` concatène de gauche à droite : `"Score : " + 2` donne `"Score : 2"`, puis `+ 2` colle encore `"2"`, donnant `"Score : 22"`. `"Score : " + (2 + 2)` calcule d'abord `2 + 2 = 4` grâce aux parenthèses, avant de le coller au texte, donnant `"Score : 4"`.

---

*Chapitre suivant : les conditions, pour permettre enfin à ton programme de prendre des décisions différentes selon les valeurs qu'il rencontre.*
