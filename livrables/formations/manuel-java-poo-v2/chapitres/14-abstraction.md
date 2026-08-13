<div class="chapitre-titre-num">CHAPITRE 14</div>

# Abstraction

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras créer une classe abstraite et des méthodes abstraites, et tu comprendras pourquoi imposer "ce qu'une classe doit faire" sans en imposer "comment" est une idée puissante.

## A. Le problème

Au chapitre 13, la classe mère `Animal` fournissait une méthode `parler()` avec un comportement générique ("L'animal fait un bruit"), que chaque classe fille redéfinissait. Mais ce comportement générique n'a, en réalité, **aucun sens** : un "animal en général" ne fait aucun bruit précis — seul un chien, un chat, ou une vache précis peut réellement parler à sa façon. Écrire un corps de méthode "par défaut" qui ne devrait jamais vraiment s'exécuter tel quel est un signe qu'il manque un outil.

## B. Exemple de la vie réelle

> Lorsque tu conduis une voiture, tu utilises le volant et les pédales sans avoir besoin de connaître chaque détail du moteur.

Tu sais **ce que** fait la pédale d'accélérateur (la voiture accélère), sans avoir besoin de savoir **comment**, exactement, l'essence est injectée dans le moteur pour y parvenir. Le constructeur de la voiture, lui, garantit qu'une pédale d'accélérateur **doit exister et doit accélérer** — sans imposer à tous les modèles de voiture la même mécanique interne exacte pour y arriver (essence, diesel, électrique...).

## C. Explication très simple

> **L'abstraction** consiste à définir **ce qu'une classe doit être capable de faire**, sans imposer **comment** exactement elle doit le faire — chaque classe fille reste libre d'implémenter le détail à sa façon.

Java propose un outil dédié à ça : la **classe abstraite**.

## D. Premier exemple Java

```java
abstract class Animal {
    String nom;

    Animal(String nom) {
        this.nom = nom;
    }

    abstract void parler(); // pas de corps ! juste une signature, un "contrat"

    void dormir() { // méthode normale, avec un vrai comportement partagé
        System.out.println(nom + " dort");
    }
}
```

```java
class Chien extends Animal {
    Chien(String nom) {
        super(nom);
    }

    @Override
    void parler() { // OBLIGATOIRE : sinon, erreur de compilation
        System.out.println(nom + " aboie : Ouaf !");
    }
}
```

## E. Explication ligne par ligne

```{.uml}
abstract class Animal {
    │
    └─ "abstract" devant "class" : cette classe ne peut JAMAIS être
       instanciée directement. "new Animal(...)" est une erreur de
       compilation, quels que soient ses paramètres.

    abstract void parler();
       │                  │
       │                  └─ Pas d'accolades, pas de corps : juste un
       │                     "contrat" — la SIGNATURE de la méthode,
       │                     sans dire comment elle doit être réalisée.
       │
       └─ "abstract" devant une méthode : chaque classe fille CONCRÈTE
          (non abstraite) DOIT obligatoirement fournir sa propre version,
          sous peine d'erreur de compilation.
```

```java
Animal a = new Animal("Générique"); // ❌ erreur de compilation : classe abstraite
Animal chien = new Chien("Rex");    // ✅ Chien est CONCRÈTE, elle fournit parler()
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Classe abstraite</span>
Une <strong>classe abstraite</strong> est une classe qui ne peut jamais être instanciée directement avec <code>new</code>. Elle sert uniquement de plan partiel, destiné à être complété par des classes filles concrètes. Elle peut mélanger des méthodes <strong>abstraites</strong> (sans corps, à implémenter obligatoirement) et des méthodes <strong>normales</strong>, avec un vrai comportement déjà partagé (comme <code>dormir()</code> ci-dessus).
</div>

## F. Deuxième exemple : le contrat forcé

```java
public class Main {
    public static void main(String[] args) {
        Animal chien = new Chien("Rex");
        chien.parler(); // Rex aboie : Ouaf !
        chien.dormir(); // Rex dort (méthode héritée, non abstraite)
    }
}

class Chat extends Animal {
    Chat(String nom) {
        super(nom);
    }
    // ❌ Si on oublie de redéfinir parler() ici, ERREUR DE COMPILATION :
    // "Chat is not abstract and does not override abstract method parler()"
}
```

Contrairement au polymorphisme "classique" du chapitre 13 (où `parler()` avait un corps générique, redéfini par choix), une méthode `abstract` **force** chaque classe fille concrète à fournir sa propre implémentation — l'oubli devient une erreur de compilation, pas un bug silencieux découvert plus tard à l'exécution.

<div class="encadre astuce">
<span class="encadre-titre">💡 Différence entre classe abstraite et classe normale héritée</span>
Une classe normale héritée (chapitre 12) propose un comportement par défaut, que la classe fille peut redéfinir <strong>ou pas</strong> — c'est optionnel. Une classe abstraite avec des méthodes <code>abstract</code> impose que ce comportement soit fourni, obligatoirement, dès la compilation.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Essayer d'instancier une classe abstraite</span>

```java
abstract class Animal { ... }

Animal a = new Animal("Test"); // ❌ erreur de compilation : Animal is abstract; cannot be instantiated
```

Une classe abstraite ne peut **jamais** être créée directement, quels que soient ses constructeurs. Elle ne sert que de base à hériter.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Donner un corps à une méthode abstraite</span>

```java
abstract class Animal {
    abstract void parler() {  // ❌ erreur de compilation : une méthode abstraite ne peut PAS avoir de corps
        System.out.println("...");
    }
}
```

`abstract` et un corps de méthode (`{ ... }`) sont mutuellement exclusifs. Une méthode abstraite se termine directement par un point-virgule, sans accolades.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier d'implémenter une méthode abstraite héritée</span>

```java
class Vache extends Animal {
    // ❌ erreur de compilation si parler() n'est jamais redéfinie ici
}
```

Toute classe fille **concrète** (non déclarée elle-même `abstract`) hérite d'une classe abstraite doit fournir une implémentation pour **chacune** de ses méthodes abstraites, sans exception.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais créer une classe abstraite avec abstract class.
✓ Je sais qu'une classe abstraite ne peut jamais être instanciée directement.
✓ Je sais créer une méthode abstraite (sans corps) qui force son
  implémentation par chaque classe fille concrète.
✓ Je sais qu'une classe abstraite peut mélanger méthodes abstraites et
  méthodes normales déjà implémentées.
✓ Je comprends la différence avec une simple redéfinition optionnelle.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pourquoi ce code ne compile-t-il pas ?

```java
abstract class Forme {
    abstract double calculerAire();
}

Forme f = new Forme();
```
</div>

## Correction

`Forme` est une classe abstraite (`abstract class`). Une classe abstraite ne peut jamais être instanciée directement avec `new`, même si elle possède un constructeur valide. Il faudrait créer une classe fille concrète (par exemple `Cercle extends Forme`) qui implémente `calculerAire()`, puis instancier **cette** classe fille.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Crée une classe abstraite `Forme` avec une méthode abstraite `calculerAire()` (renvoie un `double`) et une méthode normale `afficherType()` qui affiche `"Je suis une forme géométrique"`. Crée deux classes filles concrètes, `Cercle` (attribut `rayon`) et `Carre` (attribut `cote`), chacune implémentant `calculerAire()` correctement.
</div>

### Corrigé du défi

```java
abstract class Forme {
    abstract double calculerAire();

    void afficherType() {
        System.out.println("Je suis une forme géométrique");
    }
}

class Cercle extends Forme {
    double rayon;
    Cercle(double rayon) { this.rayon = rayon; }

    @Override
    double calculerAire() {
        return Math.PI * rayon * rayon;
    }
}

class Carre extends Forme {
    double cote;
    Carre(double cote) { this.cote = cote; }

    @Override
    double calculerAire() {
        return cote * cote;
    }
}
```

## Résumé du chapitre

- **L'abstraction** définit ce qu'une classe doit faire, sans imposer comment, via `abstract class` et des méthodes `abstract`.
- Une classe abstraite ne peut **jamais** être instanciée directement avec `new`.
- Une méthode abstraite n'a pas de corps ; elle **force** son implémentation par chaque classe fille concrète, sous peine d'erreur de compilation.
- Une classe abstraite peut mélanger méthodes abstraites et méthodes normales déjà implémentées et partagées.
- Contrairement à une simple redéfinition optionnelle, l'abstraction rend l'implémentation obligatoire, vérifiée dès la compilation.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Vrai ou faux : une classe abstraite peut contenir des méthodes normales, avec un vrai corps.
</div>

**Corrigé :** Vrai. Seules les méthodes explicitement déclarées `abstract` n'ont pas de corps ; le reste de la classe peut contenir des attributs, des constructeurs et des méthodes tout à fait normales.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Ce code ne compile pas. Identifie l'erreur et corrige-la.

```java
abstract class Employe {
    abstract double calculerSalaire();
}

class Stagiaire extends Employe {
    double indemnite = 5000;
}
```
</div>

**Corrigé :** `Stagiaire` hérite de la méthode abstraite `calculerSalaire()` mais ne la redéfinit jamais, alors qu'elle n'est pas elle-même déclarée `abstract`. Correction :
```java
class Stagiaire extends Employe {
    double indemnite = 5000;

    @Override
    double calculerSalaire() {
        return indemnite;
    }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Explique en une phrase la différence entre une méthode normale redéfinie "par choix" (chapitre 13) et une méthode abstraite implémentée "par obligation" (ce chapitre), en termes de sécurité du code.
</div>

**Corrigé :** Une méthode normale redéfinissable offre un comportement par défaut qui peut être oublié sans qu'aucune erreur ne soit signalée (le programme compile et utilise silencieusement le comportement générique, potentiellement incorrect) ; une méthode abstraite, elle, rend l'oubli **impossible à compiler**, transformant une erreur potentiellement silencieuse en une erreur détectée immédiatement, avant même d'exécuter le programme.

---

*Chapitre suivant : les interfaces, pour définir un contrat que plusieurs classes, même sans lien de parenté, peuvent respecter ensemble.*
