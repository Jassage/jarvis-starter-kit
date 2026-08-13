<div class="chapitre-titre-num">CHAPITRE 2</div>

# Les variables

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras : expliquer avec tes propres mots ce qu'est une variable, créer une variable en Java, lui donner une valeur, comprendre pourquoi Java a besoin de connaître le *type* de chaque variable, et repérer les erreurs les plus fréquentes des débutants.

Aucune connaissance préalable n'est nécessaire. Si tu n'as jamais écrit une ligne de code avant ce chapitre, tu es exactement au bon endroit.

---

## A. Le problème

Un programme, c'est une suite d'instructions qui manipulent des informations : un âge, un nom, un prix, un score.

Mais un programme ne peut rien faire d'utile s'il ne peut pas **retenir** ces informations pendant qu'il travaille.

Imagine que tu demandes à quelqu'un : *« Multiplie 8 par 4, puis ajoute 2 au résultat. »* Pour répondre, cette personne doit d'abord calculer 8 × 4, **retenir** ce résultat (32) quelque part dans sa tête, puis lui ajouter 2. Si elle oublie le résultat intermédiaire en cours de route, elle ne peut pas terminer le calcul.

Un ordinateur a exactement le même besoin. Il lui faut un endroit où **garder en mémoire** une information, le temps de l'utiliser. C'est exactement à ça que sert une **variable**.

## B. Exemple de la vie réelle

Pense à une **étiquette** que tu colles sur une boîte de rangement.

```{.uml}
┌─────────────────┐
│   Étiquette :    │
│      "ÂGE"       │
│                  │
│   Contenu : 20   │
└─────────────────┘
```

Sur l'étiquette, tu écris un nom (« ÂGE ») pour savoir ce que contient la boîte. À l'intérieur de la boîte, tu ranges une valeur (20).

Plus tard, si l'âge change, tu ne changes pas l'étiquette : tu remplaces simplement ce qu'il y a **dans** la boîte. L'étiquette « ÂGE » reste collée dessus, mais le contenu passe de 20 à 21.

C'est exactement le principe d'une variable en programmation.

## C. Explication très simple

> Une **variable** est un espace en mémoire de l'ordinateur, identifié par un **nom**, qui sert à garder une **valeur** que le programme peut utiliser et modifier.

Une variable a toujours trois choses :

1. **Un nom** : comment on l'appelle dans le code (l'étiquette sur la boîte).
2. **Un type** : quelle sorte d'information elle peut contenir — un nombre entier, du texte, etc. (on explique le type juste après).
3. **Une valeur** : ce qu'elle contient réellement à un instant donné (le contenu de la boîte).

En Java, contrairement à certains langages, on doit **toujours préciser le type** d'une variable quand on la crée. Java veut savoir à l'avance : *« Est-ce que cette boîte va contenir un nombre ? Du texte ? Autre chose ? »* — pour pouvoir vérifier que tu ne fais pas d'erreur plus tard (comme essayer de ranger un vêtement dans une boîte prévue pour de la vaisselle).

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Type</span>
Le <strong>type</strong> d'une variable décrit la nature de l'information qu'elle peut contenir : un nombre entier, un nombre à virgule, du texte, une valeur vraie/fausse, etc. Java vérifie le type de chaque variable avant même d'exécuter le programme — c'est ce qu'on appelle un langage <strong>fortement typé</strong>. On détaille tous les types disponibles au chapitre 3.
</div>

## D. Premier exemple Java

Voici la façon la plus simple de créer une variable en Java :

```java
int age = 20;
```

C'est tout. Une seule ligne suffit à créer une variable, lui donner un type, et lui donner une valeur de départ.

## E. Explication ligne par ligne

Découpons cette unique ligne, morceau par morceau, car chaque mot a un rôle précis :

```{.uml}
int      age      =      20      ;
 │        │        │       │      │
 │        │        │       │      └─ Le point-virgule : termine l'instruction
 │        │        │       │         (obligatoire à la fin de PRESQUE chaque ligne en Java)
 │        │        │       │
 │        │        │       └─ La valeur donnée à la variable
 │        │        │
 │        │        └─ Le signe "=" : ici, il ne veut PAS dire "égal" comme en
 │        │           mathématiques. Il veut dire "range la valeur de droite
 │        │           DANS la variable de gauche". On appelle ça une
 │        │           AFFECTATION.
 │        │
 │        └─ Le nom de la variable : c'est l'étiquette. On choisit ce nom
 │           nous-mêmes (ici "age", mais ça aurait pu être "annees" ou
 │           n'importe quel autre nom valide).
 │
 └─ Le type de la variable : "int" veut dire "integer", c'est-à-dire
    "nombre entier" (sans virgule) en anglais. On dit à Java : "cette
    boîte ne contiendra QUE des nombres entiers".
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Affectation</span>
L'<strong>affectation</strong> est l'action de donner une valeur à une variable, avec le symbole <code>=</code>. Contrairement aux mathématiques, <code>=</code> en Java ne compare rien : il <strong>range</strong> la valeur écrite à droite dans la variable écrite à gauche. On dit qu'on <strong>affecte</strong> 20 à la variable <code>age</code>, ou qu'on <strong>assigne</strong> 20 à <code>age</code> (les deux mots sont utilisés).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ = en Java n'est pas le = des mathématiques</span>
En mathématiques, <code>x = x + 1</code> n'a pas de sens (un nombre ne peut pas être égal à lui-même plus 1). En Java, cette même écriture est parfaitement normale et très courante :

```java
int age = 20;
age = age + 1; // on lit : "prends la valeur actuelle de age (20), ajoute 1,
               //           et range le résultat (21) dans age"
System.out.println(age); // affiche 21
```

Il faut lire <code>=</code> comme <strong>« range dans »</strong>, jamais comme <strong>« est égal à »</strong>. On calcule d'abord tout ce qu'il y a à droite du <code>=</code>, puis seulement ensuite on range le résultat dans la variable de gauche.
</div>

## F. Deuxième exemple

Un programme complet, un peu plus réaliste, avec plusieurs variables de types différents qui travaillent ensemble :

```java
public class FicheEtudiant {
    public static void main(String[] args) {
        String nom = "Jaslin";
        int age = 22;
        double moyenne = 15.5;
        boolean estAdmis = true;

        System.out.println("Nom : " + nom);
        System.out.println("Âge : " + age);
        System.out.println("Moyenne : " + moyenne);
        System.out.println("Admis : " + estAdmis);
    }
}
```

Résultat affiché à l'écran :

```text
Nom : Jaslin
Âge : 22
Moyenne : 15.5
Admis : true
```

Remarque au passage : le symbole `+` entre du texte (entre guillemets `"..."`) et une variable ne fait pas une addition mathématique ici, il **colle** (on dit **concatène**) le texte et la valeur de la variable bout à bout. On reverra ce point en détail au chapitre 5 sur les opérateurs — retiens seulement, pour l'instant, que `+` se comporte différemment selon ce qu'il y a autour de lui.

Ne t'inquiète pas si tu ne comprends pas encore `public class`, `public static void main` ou `System.out.println` : ces éléments ont été expliqués en détail au chapitre 1, et le seul but de cet exemple est de te montrer plusieurs variables **en action**, ensemble, dans un vrai petit programme.

## G. Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier le point-virgule</span>

```java
int age = 20   // ❌ il manque le point-virgule à la fin
```

Java affichera une erreur de compilation du type `';' expected`. En Java, (presque) chaque instruction doit se terminer par un point-virgule. C'est probablement l'erreur la plus fréquente chez tous les débutants, sans exception — elle t'arrivera, et ce n'est pas grave.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Utiliser une variable avant de lui donner une valeur</span>

```java
int age;
System.out.println(age); // ❌ erreur de compilation : variable non initialisée
```

Une variable **locale** (déclarée à l'intérieur d'une méthode, comme ici) doit avoir reçu une valeur avant d'être lue. Java refuse de compiler un programme qui lirait une boîte encore vide — c'est une protection, pas une punition : ça t'évite d'utiliser accidentellement une information qui n'existe pas encore.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Mettre le mauvais type de valeur dans une variable</span>

```java
int age = "vingt"; // ❌ erreur de compilation : incompatible types
```

`"vingt"` est du texte (entouré de guillemets), pas un nombre entier. Une variable déclarée `int` ne peut contenir que des nombres entiers, jamais du texte. C'est justement le rôle du type : empêcher ce genre de confusion **avant même** que le programme ne s'exécute.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°4 — Java fait la différence entre majuscules et minuscules</span>

```java
int age = 20;
System.out.println(Age); // ❌ erreur : "Age" n'existe pas, seule "age" existe
```

`age` et `Age` sont deux noms **complètement différents** pour Java (on dit que Java est **sensible à la casse**). Une simple majuscule oubliée ou ajoutée par erreur suffit à provoquer une erreur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°5 — Redéclarer deux fois la même variable</span>

```java
int age = 20;
int age = 25; // ❌ erreur : "age" a déjà été déclarée dans ce bloc
```

Une fois qu'une variable a été créée (déclarée) avec son type, on ne peut plus la redéclarer dans le même bloc de code. Pour changer sa valeur, on écrit simplement `age = 25;`, sans répéter `int` devant.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais ce qu'est une variable et à quoi elle sert.
✓ Je sais qu'une variable a un nom, un type et une valeur.
✓ Je sais créer une variable et lui donner une valeur en une ligne.
✓ Je comprends que "=" veut dire "range dans", pas "est égal à".
✓ Je reconnais les 5 erreurs de débutant les plus fréquentes sur les variables.
```
</div>

## H. Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Sans lancer Java, réponds simplement : que va afficher ce programme, et pourquoi ?

```java
int score = 10;
score = score + 5;
System.out.println(score);
```
</div>

## I. Correction

Le programme affiche **15**.

Déroulons-le étape par étape, comme le ferait Java :

1. `int score = 10;` : Java crée une variable nommée `score`, de type `int`, et y range la valeur `10`.
2. `score = score + 5;` : Java calcule d'abord la partie droite. Il va lire la valeur **actuelle** de `score` (qui vaut 10 à cet instant), il calcule `10 + 5`, ce qui donne `15`. Ensuite seulement, il range ce résultat (`15`) dans `score`, en écrasant l'ancienne valeur (`10`).
3. `System.out.println(score);` : Java affiche la valeur **actuelle** de `score`, qui est désormais `15`.

Le piège classique ici serait de croire que le programme affiche 10, en oubliant que la ligne 2 modifie réellement le contenu de la variable.

## J. Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris un petit programme Java complet (avec `public class` et `main`, comme dans l'exemple F) qui :

1. Crée une variable `prixUnitaire` (type `double`) valant `75.0`.
2. Crée une variable `quantite` (type `int`) valant `3`.
3. Crée une variable `total` qui contient le résultat de `prixUnitaire * quantite`.
4. Affiche `"Total à payer : "` suivi de la valeur de `total`.

Essaie vraiment d'écrire le code toi-même avant de regarder la correction ci-dessous. C'est en se trompant qu'on apprend le plus vite.
</div>

*(La correction du défi se trouve juste après la section suivante, dans « Corrigé du défi », pour te laisser le temps de chercher.)*

## K. Résumé du chapitre

- Une **variable** est un espace nommé en mémoire qui garde une valeur que le programme peut lire et modifier.
- En Java, chaque variable a un **type** fixé à sa création, qui détermine ce qu'elle peut contenir.
- Créer une variable et lui donner une valeur se fait en une ligne : `type nom = valeur;`.
- Le symbole `=` signifie **« range dans »**, jamais **« est égal à »** au sens mathématique.
- Une variable locale doit être initialisée (avoir reçu une valeur) avant d'être lue, et Java refuse de compiler sinon.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Déclare une variable `prenom` (type `String`) contenant ton propre prénom, puis affiche-la avec `System.out.println`.
</div>

**Corrigé :**
```java
String prenom = "Jaslin";
System.out.println(prenom);
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Trouve et corrige les **trois** erreurs présentes dans ce code :

```java
int Note = 18
double moyenne = "16.5";
System.out.println(note);
```
</div>

**Corrigé :**
```java
int note = 18;          // (1) point-virgule manquant à la fin de la ligne
double moyenne = 16.5;   // (2) 16.5 doit être écrit sans guillemets : c'est un nombre, pas du texte
System.out.println(note); // (3) la variable s'appelle "Note" (majuscule) à la déclaration,
                           //     mais "note" (minuscule) à l'affichage : incohérence de casse.
                           //     Ici on choisit de tout écrire en minuscule, "note",
                           //     par convention Java (détaillée au chapitre 21).
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une boutique vend un article à 500 gourdes (HTG). Le client bénéficie d'une réduction de 50 gourdes. Écris un programme qui déclare le prix initial et la réduction dans deux variables séparées, calcule le prix final dans une troisième variable, puis affiche le résultat sous la forme : `Prix final : 450.0 HTG`.
</div>

### Corrigé du défi

Voici d'abord la correction de l'exercice de la section J (facture avec quantité) :

```java
public class Facture {
    public static void main(String[] args) {
        double prixUnitaire = 75.0;
        int quantite = 3;
        double total = prixUnitaire * quantite;

        System.out.println("Total à payer : " + total);
    }
}
```

Ce programme affiche `Total à payer : 225.0`. Remarque que `total` est déclarée `double` et non `int` : même si `225` pourrait sembler être un nombre entier, `prixUnitaire` est un `double` (75.0), et Java conserve ce type dès qu'un `double` intervient dans un calcul — ce point est détaillé au chapitre 3.

Et voici la correction du défi Niveau 3 (boutique) :

```java
public class ReductionBoutique {
    public static void main(String[] args) {
        double prixInitial = 500.0;
        double reduction = 50.0;
        double prixFinal = prixInitial - reduction;

        System.out.println("Prix final : " + prixFinal + " HTG");
    }
}
```

Ce programme affiche `Prix final : 450.0 HTG`.

---

*Chapitre suivant : les types de données, pour découvrir toutes les « catégories de boîtes » que Java met à ta disposition (nombres entiers, nombres à virgule, texte, vrai/faux...) et savoir laquelle choisir selon la situation.*
