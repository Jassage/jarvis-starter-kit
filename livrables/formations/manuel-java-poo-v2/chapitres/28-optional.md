<div class="chapitre-titre-num">CHAPITRE 28</div>

# Optional

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras représenter proprement "l'absence de valeur" avec `Optional`, pour réduire durablement le risque de `NullPointerException`, l'erreur la plus fréquente de tout le langage Java, croisée depuis le chapitre 9.

## A. Le problème

Une méthode qui recherche un client par email peut, légitimement, ne rien trouver :

```java
static Client rechercherParEmail(ArrayList<Client> clients, String email) {
    for (Client c : clients) {
        if (c.getEmail().equals(email)) {
            return c;
        }
    }
    return null; // aucun client trouvé
}

Client client = rechercherParEmail(clients, "inconnu@example.com");
System.out.println(client.getNom()); // 💥 NullPointerException, si personne n'a pensé à vérifier null !
```

Le vrai problème : **rien, dans la signature de la méthode**, n'avertit celui qui l'appelle qu'elle peut renvoyer `null`. Il faut lire le code source, ou tomber sur le bug, pour le découvrir.

## B. Exemple de la vie réelle

Pense à une boîte cadeau, fermée. Tu ne sais pas, en la regardant de l'extérieur, si elle contient réellement quelque chose ou si elle est vide — mais au moins, l'objet "boîte" existe bel et bien entre tes mains, avec une façon claire de vérifier son contenu avant de l'ouvrir. `Optional` est exactement cette boîte : elle t'oblige à vérifier explicitement si une valeur est présente, avant de tenter de l'utiliser.

## C. Explication très simple

> `Optional<T>` est un conteneur qui représente **soit** une valeur présente, **soit** son absence explicite — sans jamais recourir à un `null` silencieux et dangereux.

## D. Premier exemple Java

```java
import java.util.Optional;

static Optional<Client> rechercherParEmail(ArrayList<Client> clients, String email) {
    for (Client c : clients) {
        if (c.getEmail().equals(email)) {
            return Optional.of(c); // une valeur EST présente
        }
    }
    return Optional.empty(); // AUCUNE valeur : explicite, pas un null caché
}
```

## E. Explication ligne par ligne

```{.uml}
static Optional<Client> rechercherParEmail(...) {
           │        │
           │        └─ Le type d'élément potentiellement contenu (les
           │           generics du chapitre 26, à nouveau !).
           └─ Le TYPE DE RETOUR annonce IMMÉDIATEMENT, dans la signature
              elle-même, que cette méthode peut ne rien trouver.
              N'importe qui lisant juste cette ligne le sait, sans avoir
              besoin de lire tout le corps de la méthode.

    return Optional.of(c);    // il y a une valeur
    return Optional.empty();  // il n'y en a pas
```

## F. Deuxième exemple : utiliser un Optional en toute sécurité

```java
Optional<Client> resultat = rechercherParEmail(clients, "jaslin@example.com");

if (resultat.isPresent()) {
    Client client = resultat.get();
    System.out.println("Trouvé : " + client.getNom());
} else {
    System.out.println("Aucun client avec cet email");
}
```

Une écriture plus courte, très courante, avec une lambda (chapitre 27) :

```java
resultat.ifPresentOrElse(
    client -> System.out.println("Trouvé : " + client.getNom()),
    () -> System.out.println("Aucun client avec cet email")
);
```

Ou encore, pour fournir une valeur par défaut sans jamais risquer `null` :

```java
Client client = resultat.orElse(new Client("Client inconnu"));
System.out.println(client.getNom()); // toujours sûr, jamais de NullPointerException possible
```

| Méthode | Rôle |
|---|---|
| `isPresent()` | `true` si une valeur est présente |
| `get()` | Renvoie la valeur (⚠️ lève une exception si absente — toujours vérifier `isPresent()` avant) |
| `orElse(valeurParDefaut)` | Renvoie la valeur, ou la valeur par défaut si absente |
| `ifPresentOrElse(siPresent, siAbsent)` | Exécute l'un ou l'autre lambda, selon le cas |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Appeler get() sans vérifier isPresent() recrée exactement le problème d'origine</span>

```java
Client client = resultat.get(); // 💥 NoSuchElementException si resultat est vide !
```

`Optional` ne résout le problème du chapitre 9 **que si** on l'utilise correctement — `get()` sans vérification préalable ne fait que remplacer une `NullPointerException` par une `NoSuchElementException`, tout aussi brutale. Préfère toujours `orElse()`, `ifPresentOrElse()`, ou un `if (isPresent())` explicite.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Où utiliser Optional, et où ne pas l'utiliser</span>
`Optional` est pensé pour les <strong>valeurs de retour</strong> de méthode, là où une absence de résultat est légitime (une recherche, par exemple). Il n'est en revanche <strong>pas recommandé</strong> comme type d'attribut de classe, ni comme type de paramètre de méthode — dans ces cas, une simple vérification <code>null</code> classique, ou une meilleure conception évitant l'absence de valeur, reste préférable. C'est une nuance que tu retrouveras en approfondissant Java au-delà de ce manuel.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Retourner null au lieu d'Optional.empty()</span>

```java
static Optional<Client> rechercher(...) {
    ...
    return null; // ❌ recrée exactement le problème qu'Optional est censé résoudre !
}
```

Une méthode qui renvoie `Optional<Client>` ne devrait **jamais** renvoyer `null` directement : ça oblige l'appelant à vérifier `null` ET à connaître `Optional`, le pire des deux mondes. Toujours `Optional.empty()` pour signaler une absence.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Envelopper un Optional dans un autre Optional</span>

```java
Optional<Optional<Client>> resultat = ...; // ❌ inutilement complexe, à éviter
```

`Optional` n'est censé représenter qu'**un seul niveau** d'absence possible. L'imbriquer ne fait qu'ajouter de la confusion sans aucun bénéfice.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais qu'Optional<T> représente une valeur présente OU son absence
  explicite, jamais un null caché.
✓ Je sais créer un Optional.of(valeur) ou Optional.empty().
✓ Je sais utiliser isPresent(), orElse() et ifPresentOrElse() en sécurité.
✓ Je sais qu'appeler get() sans vérification recrée le problème initial.
✓ Je sais qu'Optional est pensé pour les retours de méthode, pas pour
  les attributs ni les paramètres.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Que va afficher ce code ?

```java
Optional<String> vide = Optional.empty();
System.out.println(vide.orElse("valeur par défaut"));
```
</div>

## Correction

Le code affiche **"valeur par défaut"**. `vide` ne contient aucune valeur ; `orElse(...)` fournit alors la valeur de secours donnée en paramètre, sans jamais risquer d'exception ni de `null`.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `trouverProduitParNom(ArrayList<Produit> produits, String nom)` qui renvoie un `Optional<Produit>`, et utilise-la avec `ifPresentOrElse` pour afficher le prix du produit trouvé, ou `"Produit introuvable"` sinon.
</div>

### Corrigé du défi

```java
import java.util.ArrayList;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        ArrayList<Produit> produits = new ArrayList<>();
        produits.add(new Produit("Riz", 250.0));
        produits.add(new Produit("Sucre", 150.0));

        Optional<Produit> resultat = trouverProduitParNom(produits, "Sucre");

        resultat.ifPresentOrElse(
            p -> System.out.println("Prix : " + p.getPrix()),
            () -> System.out.println("Produit introuvable")
        );
    }

    static Optional<Produit> trouverProduitParNom(ArrayList<Produit> produits, String nom) {
        for (Produit p : produits) {
            if (p.getNom().equals(nom)) {
                return Optional.of(p);
            }
        }
        return Optional.empty();
    }
}
```

## Résumé du chapitre

- `Optional<T>` représente une valeur présente ou son absence explicite, jamais un `null` silencieux.
- Une méthode dont le type de retour est `Optional<T>` annonce, dès sa signature, qu'elle peut ne rien trouver.
- `Optional.of(valeur)` pour une valeur présente ; `Optional.empty()` pour son absence.
- `orElse()` et `ifPresentOrElse()` évitent le risque d'exception ; `get()` sans vérification préalable recrée le problème d'origine.
- `Optional` convient aux retours de méthode, pas aux attributs ni aux paramètres.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Écris un `Optional<Integer>` contenant la valeur `42`, et affiche-la avec `orElse(0)`.
</div>

**Corrigé :**
```java
Optional<Integer> nombre = Optional.of(42);
System.out.println(nombre.orElse(0)); // 42
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Explique en une phrase pourquoi ce code est une mauvaise pratique, même s'il compile.

```java
static Optional<Client> rechercher(String email) {
    Client c = rechercherEnBase(email);
    if (c == null) {
        return null;
    }
    return Optional.of(c);
}
```
</div>

**Corrigé :** La méthode renvoie encore parfois `null` directement, au lieu de systématiquement `Optional.empty()` en cas d'absence — ce qui oblige l'appelant à vérifier **à la fois** `null` et `Optional`, recréant exactement le problème qu'`Optional` était censé éliminer.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Réécris la méthode de l'exercice précédent pour qu'elle ne renvoie jamais `null`, en utilisant correctement `Optional`.
</div>

**Corrigé :**
```java
static Optional<Client> rechercher(String email) {
    Client c = rechercherEnBase(email);
    return Optional.ofNullable(c); // convertit automatiquement un null EN Optional.empty()
}
```
`Optional.ofNullable(valeur)` est justement pensée pour ce cas précis : envelopper le résultat, potentiellement `null`, d'un appel externe (ici, `rechercherEnBase`, une méthode qu'on ne contrôle pas), en un `Optional` propre et sûr.

---

*Chapitre suivant : la Stream API, pour traiter des collections entières de façon déclarative, en combinant tout ce que tu as appris depuis les tableaux jusqu'aux lambdas.*
