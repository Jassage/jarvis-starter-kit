<div class="chapitre-titre-num">CHAPITRE 5</div>

# Les conditions

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras faire prendre des décisions à ton programme selon les valeurs qu'il rencontre, avec `if`, `else if`, `else` et `switch`.

## A. Le problème

Jusqu'ici, chaque programme qu'on a écrit exécute **toujours** exactement les mêmes lignes, dans le même ordre, peu importe les valeurs des variables. Un vrai programme doit pourtant réagir différemment selon la situation : refuser l'accès à un mineur, afficher une mention différente selon une note, proposer un menu différent selon le choix de l'utilisateur.

## B. Exemple de la vie réelle

Pense à un videur à l'entrée d'un événement. Il applique une règle simple : *« Si la personne a 18 ans ou plus, elle entre. Sinon, elle n'entre pas. »* Il ne laisse jamais entrer tout le monde sans regarder, et il ne refuse jamais tout le monde sans regarder non plus : sa décision **dépend** d'une information (l'âge).

## C. Explication très simple

> Une **condition** permet à un programme d'exécuter un bloc de code différent selon qu'une expression booléenne (vue au chapitre 4) est vraie ou fausse.

## D. Premier exemple Java

```java
int age = 20;

if (age >= 18) {
    System.out.println("Accès autorisé");
}
```

## E. Explication ligne par ligne

```{.uml}
if (age >= 18) {
 │       │        │
 │       │        └─ Le bloc entre accolades ne s'exécute QUE si la condition est vraie.
 │       │
 │       └─ La condition : une expression qui doit être un boolean (vu chapitre 4).
 │
 └─ Mot-clé qui introduit une condition : "si..."
```

Si `age >= 18` vaut `false`, tout le bloc entre les accolades est simplement **ignoré**, sans erreur, et l'exécution continue juste après.

## F. else, else if, et un deuxième exemple

```java
int note = 12;

if (note >= 16) {
    System.out.println("Mention Très Bien");
} else if (note >= 14) {
    System.out.println("Mention Bien");
} else if (note >= 10) {
    System.out.println("Admis");
} else {
    System.out.println("Non admis");
}
// Affiche : Admis
```

```{.uml}
if (...)       →  vérifiée en premier
else if (...)  →  vérifiée SEULEMENT si tout ce qui précède était faux
else if (...)  →  idem
else           →  s'exécute seulement si RIEN au-dessus n'était vrai
                   (bloc "sinon, dans tous les autres cas")
```

Dès qu'une condition est vraie, Java exécute **uniquement** son bloc et ignore tout le reste de la chaîne `if / else if / else` — même si une condition suivante aurait aussi été vraie.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Mettre les conditions dans le mauvais ordre</span>

```java
int note = 18;

if (note >= 10) {
    System.out.println("Admis");        // ❌ s'affiche EN PREMIER, avant d'avoir pu tester >= 16
} else if (note >= 16) {
    System.out.println("Mention Très Bien"); // jamais atteint pour note = 18 !
}
```

Java teste les conditions **dans l'ordre où elles sont écrites**, et s'arrête à la première vraie. Ici, `note >= 10` est vrai pour `18` aussi, donc le programme affiche "Admis" et ne vérifie jamais `note >= 16`. Il faut toujours ranger les conditions qui se chevauchent de la **plus stricte à la plus large**.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier les accolades sur plusieurs lignes</span>

```java
if (age >= 18)
    System.out.println("Accès autorisé");
    System.out.println("Bienvenue !"); // ❌ piège : cette ligne s'exécute TOUJOURS,
                                        //    condition ou pas !
```

Sans accolades, `if` ne s'applique qu'à la **toute première** instruction qui suit. La deuxième ligne, même indentée pareil, n'est **pas** protégée par la condition. Utilise systématiquement des accolades, même pour une seule ligne, pour éviter ce piège.
</div>

## Le switch

Quand on compare une **même** variable à plusieurs valeurs précises (pas des intervalles), `switch` est souvent plus lisible qu'une longue chaîne de `else if` :

```java
int jour = 3;
String nomJour;

switch (jour) {
    case 1:
        nomJour = "Lundi";
        break;
    case 2:
        nomJour = "Mardi";
        break;
    case 3:
        nomJour = "Mercredi";
        break;
    default:
        nomJour = "Jour inconnu";
        break;
}

System.out.println(nomJour); // Mercredi
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : break</span>
<code>break</code> arrête immédiatement l'exécution du <code>switch</code> dès qu'un <code>case</code> correspondant a été trouvé et exécuté. Sans <code>break</code>, Java continue d'exécuter <strong>tous les cas suivants</strong>, même s'ils ne correspondent plus à la valeur recherchée (un comportement appelé <em>fall-through</em>, presque toujours une erreur involontaire chez les débutants).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier un break dans un switch</span>

```java
int jour = 1;
switch (jour) {
    case 1:
        System.out.println("Lundi");
        // ❌ pas de break !
    case 2:
        System.out.println("Mardi"); // s'affiche AUSSI, alors que jour = 1 !
        break;
}
// Affiche : Lundi   ET   Mardi
```
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 L'opérateur ternaire : un if/else en une seule ligne</span>
Pour une condition très simple qui ne fait que choisir entre deux valeurs, Java propose un raccourci pratique :

```java
int age = 20;
String statut = (age >= 18) ? "Majeur" : "Mineur";
// équivalent à :
// if (age >= 18) { statut = "Majeur"; } else { statut = "Mineur"; }
```

À réserver aux cas vraiment simples : un `if/else` classique reste plus lisible dès que la logique se complique.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais faire prendre une décision à mon programme avec if.
✓ Je sais enchaîner plusieurs conditions avec else if et else.
✓ Je sais que Java s'arrête à la première condition vraie qu'il rencontre.
✓ Je sais utiliser switch pour comparer une variable à plusieurs valeurs précises.
✓ Je n'oublie plus les break dans un switch.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris une condition qui affiche `"Température élevée"` si une variable `temperature` (double) dépasse 38.0, et `"Température normale"` sinon.
</div>

## Correction

```java
double temperature = 39.2;

if (temperature > 38.0) {
    System.out.println("Température élevée");
} else {
    System.out.println("Température normale");
}
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Une boutique applique une réduction selon le montant total d'un panier : 0% en dessous de 500 HTG, 5% entre 500 et 1000 HTG (exclu), 10% à partir de 1000 HTG. Écris un programme qui déclare `double montant`, calcule le pourcentage de réduction applicable avec `if/else if/else`, et l'affiche.
</div>

### Corrigé du défi

```java
public class Reduction {
    public static void main(String[] args) {
        double montant = 750.0;
        double pourcentage;

        if (montant >= 1000) {
            pourcentage = 10;
        } else if (montant >= 500) {
            pourcentage = 5;
        } else {
            pourcentage = 0;
        }

        System.out.println("Réduction applicable : " + pourcentage + "%");
        // Affiche : Réduction applicable : 5.0%
    }
}
```

Remarque l'ordre choisi : de la condition la plus stricte (`>= 1000`) vers la plus large (`else`, qui couvre tout ce qui reste) — exactement la règle vue dans l'erreur fréquente n°1 de ce chapitre.

## Résumé du chapitre

- `if` exécute un bloc uniquement si sa condition (un `boolean`) est vraie.
- `else if` et `else` permettent d'enchaîner plusieurs cas ; Java s'arrête au premier vrai.
- Les conditions qui se chevauchent doivent être rangées de la plus stricte à la plus large.
- `switch` compare une même variable à plusieurs valeurs précises ; ne jamais oublier `break`.
- L'opérateur ternaire `condition ? siVrai : siFaux` est un raccourci pour les cas très simples.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris une condition qui affiche `"Positif"`, `"Négatif"` ou `"Zéro"` selon la valeur d'un `int nombre`.
</div>

**Corrigé :**
```java
if (nombre > 0) {
    System.out.println("Positif");
} else if (nombre < 0) {
    System.out.println("Négatif");
} else {
    System.out.println("Zéro");
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Réécris ce `switch` en utilisant `if / else if / else`, en gardant exactement le même comportement :

```java
switch (mois) {
    case 12: case 1: case 2:
        saison = "Hiver";
        break;
    case 3: case 4: case 5:
        saison = "Printemps";
        break;
    default:
        saison = "Autre saison";
}
```
</div>

**Corrigé :**
```java
if (mois == 12 || mois == 1 || mois == 2) {
    saison = "Hiver";
} else if (mois == 3 || mois == 4 || mois == 5) {
    saison = "Printemps";
} else {
    saison = "Autre saison";
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Un site impose ces règles de mot de passe : au moins 8 caractères (`motDePasse.length() >= 8`, une méthode de `String` vue en détail plus tard) ET au moins une majuscule détectée dans une variable `boolean contientMajuscule` déjà calculée ailleurs. Écris la condition complète qui affiche `"Mot de passe valide"` ou `"Mot de passe invalide"`, en combinant les deux exigences.
</div>

**Corrigé :**
```java
String motDePasse = "Abcdefgh";
boolean contientMajuscule = true; // supposé déjà calculé

if (motDePasse.length() >= 8 && contientMajuscule) {
    System.out.println("Mot de passe valide");
} else {
    System.out.println("Mot de passe invalide");
}
```
Les deux exigences doivent être vraies **en même temps**, d'où l'opérateur `&&` (ET) vu au chapitre 4.

---

*Chapitre suivant : les boucles, pour répéter automatiquement une action, plutôt que de recopier la même ligne dix, cent ou mille fois.*
