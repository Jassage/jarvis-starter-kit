<div class="chapitre-titre-num">CHAPITRE 40</div>

# IntelliJ IDEA / VS Code

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras créer un projet, l'exécuter, et déboguer du code avec des points d'arrêt (breakpoints), dans un vrai environnement de développement.

## A. Le problème

Techniquement, tout le code de ce manuel pourrait être écrit dans un simple éditeur de texte (le Bloc-notes), compilé avec `javac`, et exécuté avec `java`, ligne de commande après ligne de commande. Mais sur un vrai projet de plusieurs dizaines de fichiers, sans coloration syntaxique, sans détection d'erreur immédiate, sans aucun outil d'aide, ce serait terriblement lent et source d'erreurs.

## B. Exemple de la vie réelle

Pense à la différence entre construire un meuble à mains nues, sans le moindre outil, et le construire avec un établi bien équipé (perceuse, niveau, mètre). Le résultat final pourrait être identique en théorie, mais le temps et la précision n'ont rien à voir. Un **IDE** (Integrated Development Environment, "environnement de développement intégré") est cet établi bien équipé, pour écrire du code.

## C. Explication très simple

> Un **IDE** est un logiciel qui regroupe, en un seul endroit, l'édition de code, la compilation, l'exécution, la détection d'erreurs et le débogage — tout ce dont un développeur a besoin au quotidien.

Deux choix très répandus pour Java : **IntelliJ IDEA** (spécialisé Java, très complet) et **Visual Studio Code** (plus généraliste, léger, avec des extensions Java).

## D. Créer et exécuter un projet, étape par étape

**Étape 1 — Créer un nouveau projet.** Dans IntelliJ IDEA : `File → New → Project`, choisir "Java", donner un nom. Dans VS Code (avec l'extension "Extension Pack for Java" installée) : `Ctrl+Shift+P → Java: Create Java Project`.

**Étape 2 — Écrire une classe.** L'IDE crée automatiquement le squelette :

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Bonjour !");
    }
}
```

**Étape 3 — Exécuter.** Un simple clic sur le bouton ▶️ (ou `Shift+F10` sur IntelliJ, `F5` sur VS Code) compile **et** exécute le programme, sans jamais taper `javac` ni `java` manuellement.

## E. Le débogage : comprendre un programme qui ne fait pas ce qu'on attend

Imagine ce code, qui affiche un résultat inattendu :

```java
public class CalculMoyenne {
    public static void main(String[] args) {
        int[] notes = {12, 15, 9, 18};
        int somme = 0;

        for (int i = 0; i < notes.length; i++) {
            somme += notes[i];
        }

        int moyenne = somme / notes.length; // moyenne entière, tronquée (chapitre 3) — un bug potentiel !
        System.out.println("Moyenne : " + moyenne);
    }
}
```

Plutôt que d'ajouter des `System.out.println` un peu partout pour "espionner" les valeurs (une technique valable, mais limitée), un **breakpoint** permet de figer le programme à une ligne précise et d'inspecter **toutes** ses variables en direct.

```{.uml}
1. Clique dans la marge, à côté de la ligne "int moyenne = somme / notes.length;"
   → un point rouge apparaît : c'est le BREAKPOINT.
2. Lance le programme en mode DÉBOGAGE (icône 🐞, pas ▶️).
3. Le programme s'exécute normalement... puis s'ARRÊTE pile à cette ligne,
   AVANT de l'exécuter.
4. Une fenêtre "Variables" affiche EN DIRECT : somme = 54, i = 4 (ou déjà
   sorti de la boucle), notes = [12, 15, 9, 18].
5. Bouton "Step Over" (F8) : exécute UNE SEULE ligne à la fois, permettant
   de voir "moyenne" prendre sa valeur (13, tronqué) juste après.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Breakpoint</span>
Un <strong>breakpoint</strong> (point d'arrêt) est un marqueur posé sur une ligne précise du code, qui suspend l'exécution du programme dès qu'elle est atteinte, permettant d'inspecter l'état exact de toutes les variables à cet instant précis — bien plus efficace, sur un bug complexe, qu'une série de <code>System.out.println</code> ajoutés puis retirés manuellement.
</div>

## F. Deuxième exemple : inspecter le code sans même l'exécuter

Un IDE moderne détecte de nombreux problèmes **avant même** de lancer le programme :

```java
int age = 20;
if (age = 25) { // l'IDE souligne cette ligne en ROUGE avant même la compilation !
    ...
}
```

- **Coloration syntaxique** : les mots-clés (`if`, `class`), types et chaînes de caractères sont visuellement distincts, rendant le code plus facile à lire d'un coup d'œil.
- **Auto-complétion** : taper `notes.` propose automatiquement la liste des méthodes disponibles (`length`, dans le cas d'un tableau), sans avoir besoin de les mémoriser toutes.
- **Renommage sûr** (`Shift+F6` sur IntelliJ) : renommer une variable ou une méthode met à jour **automatiquement** tous ses usages dans le projet entier, sans jamais en oublier un.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Ignorer les soulignements rouges/jaunes de l'IDE</span>
Un soulignement rouge signale une erreur qui empêchera la compilation ; un soulignement jaune signale un avertissement (souvent une amélioration possible, pas forcément bloquante). Les ignorer systématiquement, "pour voir plus tard", fait perdre tout le bénéfice de la détection immédiate offerte par l'IDE.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Déboguer sans breakpoint, uniquement avec des println</span>
Ajouter, puis retirer, des dizaines de <code>System.out.println("ici 1")</code>, <code>System.out.println("ici 2")</code> temporaires reste une technique valable pour un bug très simple, mais devient vite lente et désordonnée sur un bug complexe impliquant plusieurs variables — le débogueur avec breakpoints (section E) est bien plus efficace, une fois maîtrisé.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais créer et exécuter un projet Java depuis un IDE.
✓ Je sais poser un breakpoint et lancer le débogage.
✓ Je sais inspecter les variables en direct pendant un arrêt sur breakpoint.
✓ Je sais utiliser Step Over pour avancer ligne par ligne.
✓ Je sais reconnaître l'intérêt de l'auto-complétion et du renommage sûr.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Dans le code `CalculMoyenne` de la section E, à quelle ligne exacte poserais-tu un breakpoint pour vérifier la valeur de `somme` juste après la fin de la boucle, mais avant le calcul de `moyenne` ?
</div>

## Correction

Sur la ligne `int moyenne = somme / notes.length;` — exactement comme dans l'exemple. À ce moment précis, la boucle est déjà totalement terminée (donc `somme` a sa valeur finale, 54), mais `moyenne` n'a pas encore été calculée : c'est le point idéal pour vérifier que `somme` contient bien la valeur attendue avant de continuer.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Sans exécuter réellement de code, décris étape par étape (comme dans la section E) comment tu utiliserais un breakpoint et "Step Over" pour comprendre pourquoi ce code affiche un résultat inattendu :

```java
int total = 0;
for (int i = 1; i <= 5; i++) {
    total = i;  // bug : devrait être "total += i"
}
System.out.println(total); // affiche 5, pas 15 !
```
</div>

### Corrigé du défi

```text
1. Poser un breakpoint sur la ligne "total = i;", à l'intérieur de la boucle.
2. Lancer en mode débogage.
3. À chaque arrêt (un par tour de boucle), noter la valeur de "total" et
   de "i" dans le panneau Variables.
4. Avec Step Over, observer que "total" prend successivement 1, 2, 3, 4,
   5 — jamais une SOMME cumulée, révélant que "total = i" REMPLACE la
   valeur au lieu de l'ADDITIONNER.
5. La correction devient alors évidente : "total += i;" (l'opérateur
   d'affectation composée du chapitre 4).
```

## Résumé du chapitre

- Un **IDE** regroupe édition, compilation, exécution et débogage en un seul outil.
- IntelliJ IDEA (spécialisé Java) et VS Code (généraliste, avec extensions) sont deux choix courants.
- Un **breakpoint** suspend l'exécution à une ligne précise, permettant d'inspecter toutes les variables en direct.
- "Step Over" avance ligne par ligne pendant une session de débogage.
- La coloration syntaxique, l'auto-complétion et le renommage sûr accélèrent considérablement l'écriture et la maintenance du code.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Quelle est la différence entre lancer un programme en mode normal (▶️) et en mode débogage (🐞) ?
</div>

**Corrigé :** Le mode normal exécute le programme du début à la fin sans interruption. Le mode débogage permet au programme de s'arrêter automatiquement sur chaque breakpoint rencontré, pour inspecter son état à cet instant précis.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pourquoi renommer une variable directement dans l'éditeur de texte (rechercher/remplacer manuel) est-il plus risqué que d'utiliser la fonction "renommage sûr" de l'IDE ?
</div>

**Corrigé :** Un rechercher/remplacer manuel risque de modifier du texte qui ressemble au nom recherché sans être réellement cette variable (par exemple, un commentaire, ou une autre variable au nom similaire), ou d'oublier des usages dans d'autres fichiers. Le renommage sûr de l'IDE comprend la structure réelle du code et met à jour uniquement les vraies références à cette variable précise, dans tout le projet.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Un programme lève une `NullPointerException` (chapitre 9) à une ligne précise, mais tu ne comprends pas pourquoi la variable concernée est `null`. Décris comment un breakpoint posé **avant** cette ligne t'aiderait à comprendre l'origine du problème.
</div>

**Corrigé :** En posant un breakpoint juste avant la ligne fautive, on peut inspecter la variable concernée avant le plantage et remonter, avec "Step Over" ou en revenant en arrière dans le code, jusqu'à l'endroit précis où elle aurait dû être initialisée mais ne l'a pas été — révélant l'oubli exact (un constructeur incomplet, un attribut jamais assigné, chapitre 9 et 10) responsable du `null` inattendu.

---

*Chapitre suivant : Maven, pour gérer automatiquement les dépendances externes d'un projet, comme le pilote MySQL déjà croisé au chapitre 33.*
