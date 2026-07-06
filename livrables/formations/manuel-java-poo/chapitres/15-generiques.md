<div class="chapitre-titre-num">CHAPITRE 15</div>

# Les génériques (Generics)

## Objectifs pédagogiques

Comprendre le problème que résolvent les génériques, savoir écrire des classes et méthodes génériques, et connaître le rôle des wildcards (`? extends`, `? super`).

## 15.1 Le problème avant les génériques

```java
public class Boite {
    private Object contenu; // Object : le type le plus général, accepte N'IMPORTE QUOI

    public void mettre(Object contenu) {
        this.contenu = contenu;
    }

    public Object recuperer() {
        return contenu;
    }
}

Boite boite = new Boite();
boite.mettre("Jaslin");
String texte = (String) boite.recuperer(); // cast MANUEL obligatoire, et risqué

boite.mettre(42); // ⚠️ Rien n'empêche de mettre un entier dans la même boîte !
String texteInvalide = (String) boite.recuperer(); // 💥 ClassCastException à l'exécution (chapitre 6)
```

Sans génériques, utiliser `Object` pour rester "générique" oblige à des casts manuels partout, **sans aucune garantie à la compilation** que le contenu réel corresponde au type attendu.

## 15.2 Classe générique

```java
public class Boite<T> { // T : un "paramètre de type", un espace réservé pour un type précisé plus tard
    private T contenu;

    public void mettre(T contenu) {
        this.contenu = contenu;
    }

    public T recuperer() {
        return contenu;
    }
}
```

```java
Boite<String> boiteTexte = new Boite<>();
boiteTexte.mettre("Jaslin");
String texte = boiteTexte.recuperer(); // AUCUN cast nécessaire, le compilateur connaît déjà le type !

boiteTexte.mettre(42); // ❌ Erreur de COMPILATION, pas d'exécution : détectée immédiatement, avant même de lancer le programme
```

<div class="encadre astuce">
<span class="encadre-titre">💡 T, E, K, V : des conventions de nommage, pas des mots-clés</span>
`T` (Type), `E` (Element, pour les collections), `K`/`V` (Key/Value, pour les maps) sont des **conventions** largement suivies dans tout code Java (y compris la bibliothèque standard, `List&lt;E&gt;`, `Map&lt;K, V&gt;`), pas des mots réservés du langage — on pourrait techniquement écrire `Boite<Truc>`, mais ce ne serait pas idiomatique.
</div>

## 15.3 Méthode générique

Une méthode peut être générique **indépendamment** de sa classe englobante :

```java
public class Utilitaires {
    // <T> avant le type de retour déclare que cette méthode introduit son propre paramètre de type
    public static <T> T premierElement(List<T> liste) {
        if (liste.isEmpty()) {
            throw new IllegalArgumentException("La liste ne peut pas être vide");
        }
        return liste.get(0);
    }
}
```

```java
List<String> noms = List.of("Jaslin", "Marie");
String premier = Utilitaires.premierElement(noms); // T est déduit automatiquement : String

List<Integer> notes = List.of(15, 12, 18);
Integer premiereNote = Utilitaires.premierElement(notes); // T déduit ici : Integer
```

## 15.4 Génériques avec plusieurs paramètres de type

```java
public class Paire<K, V> {
    private K cle;
    private V valeur;

    public Paire(K cle, V valeur) {
        this.cle = cle;
        this.valeur = valeur;
    }

    public K getCle() { return cle; }
    public V getValeur() { return valeur; }

    @Override
    public String toString() {
        return "(" + cle + " → " + valeur + ")";
    }
}
```

```java
Paire<String, Double> soldeCompte = new Paire<>("jaslin@mail.com", 5000.0);
System.out.println(soldeCompte); // (jaslin@mail.com → 5000.0)
```

## 15.5 Bornes sur les génériques (bounded types)

```java
// T doit OBLIGATOIREMENT être Number ou une de ses sous-classes (Integer, Double...)
public class BoiteNumerique<T extends Number> {
    private T valeur;

    public BoiteNumerique(T valeur) {
        this.valeur = valeur;
    }

    public double doubleValeur() {
        return valeur.doubleValue(); // accessible car garanti par "extends Number"
    }
}

BoiteNumerique<Integer> b1 = new BoiteNumerique<>(42);   // ✅ Integer hérite de Number
BoiteNumerique<Double> b2 = new BoiteNumerique<>(3.14);  // ✅ Double hérite de Number
BoiteNumerique<String> b3 = new BoiteNumerique<>("abc"); // ❌ Erreur de compilation : String n'est pas un Number
```

## 15.6 Wildcards : ? extends et ? super

```java
// ? extends Number : accepte une List de Number OU de n'importe laquelle de ses sous-classes
public static double sommeDesNombres(List<? extends Number> nombres) {
    double somme = 0;
    for (Number n : nombres) {
        somme += n.doubleValue();
    }
    return somme;
}
```

```java
List<Integer> entiers = List.of(1, 2, 3);
List<Double> decimaux = List.of(1.5, 2.5);

System.out.println(sommeDesNombres(entiers));  // fonctionne : List<Integer>
System.out.println(sommeDesNombres(decimaux)); // fonctionne aussi : List<Double>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 PECS : Producer Extends, Consumer Super</span>
Un moyen mnémotechnique classique pour choisir le bon wildcard : si la collection ne fait que **produire** des valeurs (tu les lis seulement), utilise `? extends T`. Si elle ne fait que **consommer** des valeurs (tu les ajoutes seulement), utilise `? super T`. Ce sujet, plus avancé, dépasse le cadre strict de ce manuel mais mérite d'être connu de nom pour la suite de ta pratique professionnelle.
</div>

## 15.7 Les génériques et les collections (lien avec le chapitre 13)

```java
List<Etudiant> etudiants = new ArrayList<>(); // <Etudiant> EST un usage direct des génériques
etudiants.add(new Etudiant("Jaslin"));
etudiants.add("Erreur"); // ❌ Erreur de compilation : "Erreur" n'est pas un Etudiant
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le chapitre 13 utilisait déjà les génériques sans le nommer explicitement</span>
`List<String>`, `Map<String, Double>` du chapitre 13 sont des exemples directs de classes génériques déjà fournies par la bibliothèque standard Java — ce chapitre explique enfin **comment** elles fonctionnent en coulisses, et comment créer ses propres classes du même type.
</div>

## 15.8 Diagramme UML avec paramètre générique

**Diagramme de classe générique**

```{.uml}
┌─────────────────────────┐
│         Boite&lt;T&gt;            │
├─────────────────────────┤
│ - contenu : T              │
├─────────────────────────┤
│ + mettre(contenu: T): void  │
│ + recuperer(): T            │
└─────────────────────────┘
```

## 15.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Effacement de type (type erasure) : les génériques n'existent qu'à la compilation</span>
```java
List<String> liste1 = new ArrayList<>();
List<Integer> liste2 = new ArrayList<>();
System.out.println(liste1.getClass() == liste2.getClass()); // true !
```
À l'exécution, la JVM ne "connaît" plus le paramètre générique (`String`, `Integer`) : cette information n'existe que pour le compilateur, qui vérifie la cohérence des types **avant** de générer le bytecode, puis l'efface (mécanisme appelé *type erasure*). C'est une particularité historique de Java (introduite en 2004 pour garder la compatibilité avec du code plus ancien pré-générique) à connaître, sans besoin d'en maîtriser toutes les implications avancées à ce stade.
</div>

## 15.10 Résumé du chapitre

- Les génériques évitent les casts manuels et détectent les erreurs de type **à la compilation** plutôt qu'à l'exécution.
- `class Boite<T>` déclare une classe générique ; `<T> T methode(...)` déclare une méthode générique indépendante.
- `T extends Number` borne un paramètre de type à une famille de classes précise.
- `? extends T` (lecture) / `? super T` (écriture) sont les wildcards utilisés pour des collections en paramètre de méthode.
- Les génériques Java n'existent qu'à la compilation (*type erasure*) — la JVM ne les "voit" plus à l'exécution.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Crée une classe générique `Pile<T>` (structure LIFO simplifiée) avec les méthodes `empiler(T element)`, `depiler()` (retire et retourne le dernier élément ajouté) et `estVide()`, basée en interne sur une `List<T>`.
</div>

**Corrigé :**
```java
import java.util.ArrayList;
import java.util.List;

public class Pile<T> {
    private List<T> elements = new ArrayList<>();

    public void empiler(T element) {
        elements.add(element);
    }

    public T depiler() {
        if (estVide()) {
            throw new IllegalStateException("La pile est vide");
        }
        return elements.remove(elements.size() - 1);
    }

    public boolean estVide() {
        return elements.isEmpty();
    }
}
```

*Ceci clôt la Partie 4 (robustesse et structures de données). Chapitre suivant : les expressions lambda, pour écrire du code fonctionnel concis en Java moderne.*
