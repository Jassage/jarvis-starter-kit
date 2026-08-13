<div class="chapitre-titre-num">CHAPITRE 26</div>

# Les génériques (Generics)

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras en profondeur ce que représentent les chevrons `<>` déjà croisés avec `ArrayList`, `HashSet` et `HashMap`, et tu sauras créer ta propre classe générique.

## A. Le problème

Imagine une classe `Boite` capable de contenir n'importe quel type de contenu, sans generics :

```java
class Boite {
    private Object contenu; // "Object" : le type le plus général de Java, ancêtre de TOUT

    void ranger(Object contenu) { this.contenu = contenu; }
    Object recuperer() { return contenu; }
}

Boite boite = new Boite();
boite.ranger("Un texte");
String texte = (String) boite.recuperer(); // ⚠️ obligé de "forcer" le type (transtypage), risqué

boite.ranger(42); // rien n'empêche de ranger n'importe quoi d'autre par erreur !
String texte2 = (String) boite.recuperer(); // 💥 ClassCastException à l'exécution !
```

Le compilateur ne peut **rien** vérifier ici : n'importe quel type peut être rangé, et le transtypage `(String)` peut échouer brutalement, mais seulement à l'exécution, jamais détecté avant.

## B. Exemple de la vie réelle

Pense à une boîte de rangement générique, sur laquelle tu colles toi-même une étiquette précisant son contenu autorisé : "Boîte à outils", "Boîte à vêtements". N'importe qui respectant l'étiquette évite les mélanges accidentels. Les generics jouent exactement ce rôle d'étiquette, mais **vérifiée automatiquement** par le compilateur.

## C. Explication très simple

> Les **generics** permettent à une classe de fonctionner avec **n'importe quel type**, tout en gardant, pour chaque utilisation précise, la garantie que ce type reste cohérent partout — vérifié dès la compilation.

## D. Premier exemple Java : une classe générique

```java
class Boite<T> {
    private T contenu;

    void ranger(T contenu) {
        this.contenu = contenu;
    }

    T recuperer() {
        return contenu;
    }
}
```

```java
Boite<String> boiteTexte = new Boite<>();
boiteTexte.ranger("Un texte");
String texte = boiteTexte.recuperer(); // ✅ AUCUN transtypage nécessaire, le type est déjà connu !

boiteTexte.ranger(42); // ❌ erreur de compilation : Boite<String> n'accepte QUE des String
```

## E. Explication ligne par ligne

```{.uml}
class Boite<T> {
   │         │
   │         └─ "T" (pour "Type") : un NOM DE TYPE GÉNÉRIQUE, un espace
   │            réservé. Ce n'est ni "int", ni "String" : c'est un
   │            SYMBOLE qui sera remplacé par un vrai type au moment
   │            de la création de l'objet.
   └─ Une classe générique, capable de s'adapter à n'importe quel type "T".

private T contenu;
    │
    └─ Cet attribut a pour type "T" — quel que soit le type réel choisi
       plus tard.

Boite<String> boiteTexte = new Boite<>();
       │
       └─ ICI, "T" est REMPLACÉ par "String", pour CETTE instance précise.
          Toute cette Boite ne travaillera QU'avec des String, à partir
          de maintenant, vérifié par le compilateur.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Paramètre de type</span>
<code>T</code> est appelé un <strong>paramètre de type</strong> — l'équivalent, pour les types, de ce qu'est un paramètre de méthode (chapitre 7) pour les valeurs. Convention Java : une seule lettre majuscule, souvent <code>T</code> (Type), <code>E</code> (Element, pour une collection), <code>K</code>/<code>V</code> (Key/Value, pour une map — exactement ce que tu utilises déjà sans le savoir avec <code>HashMap&lt;K, V&gt;</code> au chapitre 21).
</div>

## F. Deuxième exemple : tu utilises déjà les generics depuis longtemps

```java
ArrayList<String> noms = new ArrayList<>();      // T = String
ArrayList<Etudiant> etudiants = new ArrayList<>(); // T = Etudiant
HashMap<String, Integer> stock = new HashMap<>();  // K = String, V = Integer
```

Chaque fois que tu as écrit `ArrayList<String>` (chapitre 19) ou `HashMap<String, Integer>` (chapitre 21), tu utilisais déjà des generics — sans avoir eu besoin, jusqu'ici, de comprendre exactement comment ils étaient construits en coulisses. Maintenant tu sais : `ArrayList<T>` et `HashMap<K, V>` sont, elles-mêmes, des classes génériques, écrites par les créateurs de Java exactement comme `Boite<T>` ci-dessus.

<div class="encadre astuce">
<span class="encadre-titre">💡 Une méthode générique, sans classe générique complète</span>
Il est aussi possible de rendre **une seule méthode** générique, sans generic sur toute la classe :

```java
static <T> void afficherPaire(T premier, T deuxieme) {
    System.out.println(premier + " et " + deuxieme);
}

afficherPaire("A", "B");     // T = String
afficherPaire(1, 2);          // T = Integer
```
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser un type primitif comme paramètre générique</span>

```java
Boite<int> boite = new Boite<>(); // ❌ erreur de compilation
Boite<Integer> boite = new Boite<>(); // ✅ toujours la version "objet" du primitif (chapitre 19)
```

Cette règle, déjà croisée avec `ArrayList<Integer>` au chapitre 19, s'applique à **toute** classe générique : jamais de type primitif entre chevrons.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Mélanger les types entre deux instances différentes</span>

```java
Boite<String> boiteA = new Boite<>();
Boite<Integer> boiteB = new Boite<>();

boiteA = boiteB; // ❌ erreur de compilation : Boite<String> et Boite<Integer> sont INCOMPATIBLES
```

Même si les deux variables utilisent la même classe `Boite`, `Boite<String>` et `Boite<Integer>` sont considérés comme deux types **complètement différents** par le compilateur — c'est justement ce qui garantit la sécurité des generics.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je comprends ce que représentent les chevrons <> déjà utilisés avec
  ArrayList, HashSet et HashMap.
✓ Je sais créer une classe générique simple avec <T>.
✓ Je sais que le type générique est fixé une fois pour toutes à la
  création de l'objet, et vérifié par le compilateur.
✓ Je sais qu'un type primitif ne peut jamais être un paramètre générique.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pourquoi ce code ne compile-t-il pas ?

```java
Boite<String> boite = new Boite<>();
boite.ranger(100);
```
</div>

## Correction

`boite` est une `Boite<String>` : le paramètre générique `T` a été fixé à `String` pour cette instance précise. Appeler `ranger(100)` fournit un `int` (autoboxé en `Integer`), incompatible avec `String`. Le compilateur refuse ce code avant même de l'exécuter — exactement l'avantage recherché par rapport à une classe utilisant `Object` (section A), où cette erreur ne serait détectée qu'à l'exécution, bien plus tard et plus difficilement.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Crée une classe générique `Paire<T>` avec deux attributs `premier` et `deuxieme`, tous deux de type `T`, un constructeur, et une méthode `inverser()` qui échange leurs valeurs.
</div>

### Corrigé du défi

```java
class Paire<T> {
    private T premier;
    private T deuxieme;

    Paire(T premier, T deuxieme) {
        this.premier = premier;
        this.deuxieme = deuxieme;
    }

    void inverser() {
        T temporaire = premier;
        premier = deuxieme;
        deuxieme = temporaire;
    }

    void afficher() {
        System.out.println(premier + " / " + deuxieme);
    }
}

public class Main {
    public static void main(String[] args) {
        Paire<String> paire = new Paire<>("Riz", "Haricots");
        paire.afficher();  // Riz / Haricots
        paire.inverser();
        paire.afficher();  // Haricots / Riz
    }
}
```

## Résumé du chapitre

- Les **generics** (`<T>`) permettent à une classe de fonctionner avec n'importe quel type, tout en gardant une vérification stricte à la compilation.
- `ArrayList<T>`, `HashSet<T>` et `HashMap<K, V>`, déjà utilisées, sont elles-mêmes des classes génériques.
- Le type générique est fixé une fois pour toutes à la création de l'objet (`Boite<String>`), et deux instanciations avec des types différents sont incompatibles entre elles.
- Jamais de type primitif comme paramètre générique : toujours sa version objet (`Integer`, `Double`...).
- Les generics évitent les transtypages manuels risqués et détectent les erreurs de type dès la compilation, pas seulement à l'exécution.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Sans écrire de code, explique en une phrase pourquoi `ArrayList<Etudiant>` garantit qu'on ne pourra jamais accidentellement y ajouter un `Produit`.
</div>

**Corrigé :** Parce que `ArrayList<Etudiant>` fixe le paramètre générique `T` à `Etudiant` pour cette instance précise ; le compilateur refuse alors toute tentative d'y ajouter un objet d'un autre type, dès la compilation.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Complète cette classe générique `Conteneur<T>` avec une méthode `estVide()` renvoyant `true` si `contenu` vaut `null`.

```java
class Conteneur<T> {
    private T contenu;
    // à compléter
}
```
</div>

**Corrigé :**
```java
class Conteneur<T> {
    private T contenu;

    boolean estVide() {
        return contenu == null;
    }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Explique pourquoi une classe `Boite` utilisant `Object` (section A) autorise une erreur qu'une classe générique `Boite<T>` empêche complètement, en donnant le nom précis de l'exception concernée.
</div>

**Corrigé :** Avec `Object`, n'importe quel type peut être rangé sans distinction, et récupérer la valeur exige un transtypage manuel (`(String) boite.recuperer()`) qui peut échouer à l'exécution avec une `ClassCastException`, si le contenu réel ne correspond pas au type attendu. Avec `Boite<T>`, le type est vérifié et figé dès la compilation : il devient **impossible** d'y ranger un type incompatible, donc cette exception ne peut structurellement jamais survenir.

---

*Chapitre suivant : les expressions lambda, pour écrire du code plus court et plus expressif, en traitant même le comportement (une action) comme une valeur qu'on peut transmettre.*
