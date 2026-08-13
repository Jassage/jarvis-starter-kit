<div class="chapitre-titre-num">CHAPITRE 20</div>

# HashSet

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras utiliser `HashSet` pour garantir qu'une collection ne contient jamais de doublon, et tu comprendras dans quelles situations le préférer à `ArrayList`.

## A. Le problème

Imagine devoir stocker la liste des adresses email déjà inscrites sur un site. Avec un `ArrayList` (chapitre 19), rien n'empêche d'ajouter deux fois la même adresse par erreur :

```java
ArrayList<String> emails = new ArrayList<>();
emails.add("jaslin@example.com");
emails.add("jaslin@example.com"); // ✅ accepté sans problème... mais c'est un doublon indésirable !
System.out.println(emails.size()); // 2, alors qu'on ne veut qu'UNE seule adresse unique
```

## B. Exemple de la vie réelle

Pense à un cachet de présence sur une feuille d'émargement : chaque personne ne peut signer **qu'une seule fois**. Si quelqu'un essaie de signer une deuxième fois, ça n'ajoute rien de nouveau — son nom y figure déjà.

## C. Explication très simple

> `HashSet` est une collection Java qui garantit qu'**aucun élément ne peut y apparaître deux fois**. Ajouter un élément déjà présent ne fait simplement rien.

## D. Premier exemple Java

```java
import java.util.HashSet;

HashSet<String> emails = new HashSet<>();
emails.add("jaslin@example.com");
emails.add("marie@example.com");
emails.add("jaslin@example.com"); // ignoré silencieusement : déjà présent

System.out.println(emails.size()); // 2, pas 3 !
```

## E. Explication ligne par ligne

```{.uml}
HashSet<String> emails = new HashSet<>();
    │
    └─ Même syntaxe générique qu'ArrayList (chapitre 19) : les chevrons
       donnent le type des éléments. La différence n'est pas dans la
       syntaxe de création, mais dans le COMPORTEMENT de add().

emails.add("jaslin@example.com"); // la 2e fois
    │
    └─ add() VÉRIFIE d'abord si l'élément est déjà présent. Si oui, il
       ne fait RIEN (pas d'erreur, pas de doublon ajouté). add() renvoie
       d'ailleurs un boolean : true si l'élément a été réellement ajouté,
       false s'il était déjà présent.
```

```java
boolean ajoute = emails.add("jaslin@example.com");
System.out.println(ajoute); // false : déjà présent, rien n'a changé
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un HashSet ne garantit AUCUN ordre</span>

```java
HashSet<String> fruits = new HashSet<>();
fruits.add("Mangue");
fruits.add("Ananas");
fruits.add("Banane");

System.out.println(fruits); // l'ORDRE affiché n'est PAS garanti être celui d'ajout !
```

Contrairement à `ArrayList`, qui conserve toujours l'ordre d'ajout, `HashSet` **ne garantit aucun ordre particulier** de parcours. Si l'ordre compte pour toi, `ArrayList` (avec une vérification manuelle des doublons) ou `LinkedHashSet` (une variante hors périmètre de ce manuel) sont plus adaptés.
</div>

## F. Deuxième exemple : les mêmes méthodes essentielles qu'ArrayList

```java
import java.util.HashSet;

public class GestionInscriptions {
    public static void main(String[] args) {
        HashSet<String> emailsInscrits = new HashSet<>();

        System.out.println(inscrire(emailsInscrits, "jaslin@example.com")); // true : nouvelle inscription
        System.out.println(inscrire(emailsInscrits, "marie@example.com"));  // true
        System.out.println(inscrire(emailsInscrits, "jaslin@example.com")); // false : déjà inscrit !

        System.out.println("Total d'inscrits uniques : " + emailsInscrits.size()); // 2
    }

    static boolean inscrire(HashSet<String> emails, String email) {
        return emails.add(email); // add() renvoie déjà exactement ce qu'on veut savoir
    }
}
```

| Méthode | Rôle |
|---|---|
| `add(element)` | Ajoute si absent ; renvoie `true`/`false` selon le résultat |
| `remove(element)` | Retire l'élément s'il est présent |
| `contains(element)` | `true` si l'élément est présent |
| `size()` | Nombre d'éléments (uniques, par définition) |

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Ensemble (Set)</span>
En mathématiques comme en Java, un <strong>ensemble</strong> (<em>Set</em>, la famille à laquelle appartient <code>HashSet</code>) est une collection d'éléments <strong>uniques</strong>, sans notion d'ordre garanti — contrairement à une <strong>liste</strong> (<em>List</em>, la famille d'<code>ArrayList</code>), qui garde l'ordre d'ajout et autorise les doublons.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser HashSet quand l'ordre ou les doublons comptent</span>

Un historique de transactions bancaires, par exemple, ne devrait **jamais** être un `HashSet` : deux transactions peuvent légitimement avoir exactement le même montant (pas de notion de "doublon" à empêcher), et l'ordre chronologique est essentiel. `ArrayList` est le bon choix ici. `HashSet` ne convient que lorsque l'**unicité** est une vraie règle métier (adresses email inscrites, codes-barres de produits en stock, identifiants déjà attribués).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Essayer d'accéder à un élément par indice</span>

```java
HashSet<String> fruits = new HashSet<>();
fruits.add("Mangue");
System.out.println(fruits.get(0)); // ❌ erreur de compilation : get(int) n'existe PAS sur HashSet
```

`HashSet` n'a **aucune notion de position** : il n'existe pas de méthode `get(indice)`. Pour parcourir ses éléments, on utilise uniquement `for-each` ou `contains()` pour tester la présence d'un élément précis.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais qu'un HashSet garantit l'absence de doublons.
✓ Je sais que add() renvoie true/false selon que l'ajout a réellement eu lieu.
✓ Je sais qu'un HashSet ne garantit aucun ordre de parcours.
✓ Je sais choisir entre ArrayList (ordre, doublons permis) et HashSet
  (unicité garantie, pas d'ordre garanti) selon le besoin métier.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Que va afficher ce code ?

```java
HashSet<Integer> nombres = new HashSet<>();
nombres.add(5);
nombres.add(10);
nombres.add(5);
nombres.add(15);
System.out.println(nombres.size());
```
</div>

## Correction

Le code affiche **3**. `5` est ajouté deux fois, mais la deuxième tentative est silencieusement ignorée par `HashSet` : l'ensemble ne contient finalement que `5`, `10` et `15`, soit 3 éléments uniques.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris une méthode `compterMotsUniques(String[] mots)` qui utilise un `HashSet<String>` pour renvoyer le nombre de mots **différents** dans un tableau (même si certains mots y apparaissent plusieurs fois).
</div>

### Corrigé du défi

```java
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        String[] mots = {"riz", "haricots", "riz", "sucre", "haricots"};
        System.out.println(compterMotsUniques(mots)); // 3
    }

    static int compterMotsUniques(String[] mots) {
        HashSet<String> uniques = new HashSet<>();
        for (String mot : mots) {
            uniques.add(mot); // les doublons sont automatiquement ignorés
        }
        return uniques.size();
    }
}
```

## Résumé du chapitre

- `HashSet` garantit qu'aucun élément ne peut y apparaître deux fois.
- `add()` renvoie `true` si l'élément a réellement été ajouté, `false` s'il était déjà présent.
- `HashSet` ne garantit **aucun ordre** de parcours, contrairement à `ArrayList`.
- Il n'existe pas de `get(indice)` sur un `HashSet` : seuls `contains()` et le parcours `for-each` sont disponibles.
- Choisis `HashSet` quand l'unicité est une vraie règle métier ; `ArrayList` sinon.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Vrai ou faux : `HashSet<String> s = new HashSet<>(); s.add("A"); s.add("A");` fait que `s.size()` vaut 2.
</div>

**Corrigé :** Faux. La deuxième tentative d'ajouter `"A"` est ignorée, car cet élément est déjà présent. `s.size()` vaut `1`.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pour chacune de ces situations, choisis `ArrayList` ou `HashSet`, en justifiant : (a) l'historique des messages d'une conversation, (b) la liste des numéros de plaques d'immatriculation déjà enregistrées, (c) le classement d'une course, du 1er au dernier.
</div>

**Corrigé :** (a) `ArrayList` — l'ordre chronologique compte, et deux messages identiques sont possibles. (b) `HashSet` — chaque plaque doit être unique, l'ordre n'a pas d'importance. (c) `ArrayList` — l'ordre (le classement) est justement l'information essentielle.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Écris une méthode `trouverDoublons(String[] noms)` qui renvoie un `HashSet<String>` contenant uniquement les noms qui apparaissent **au moins deux fois** dans le tableau. (Astuce : utilise deux HashSet, un pour les noms déjà vus, un pour les doublons détectés.)
</div>

**Corrigé :**
```java
static HashSet<String> trouverDoublons(String[] noms) {
    HashSet<String> dejaVus = new HashSet<>();
    HashSet<String> doublons = new HashSet<>();

    for (String nom : noms) {
        if (!dejaVus.add(nom)) { // add() renvoie false si déjà présent : c'est un doublon
            doublons.add(nom);
        }
    }
    return doublons;
}
```
Ce défi exploite directement la valeur de retour de `add()` (section E) : si `dejaVus.add(nom)` renvoie `false`, c'est que ce nom était déjà dans `dejaVus`, donc c'est un doublon.

---

*Chapitre suivant : HashMap, pour associer une clé à une valeur — la structure de données la plus utilisée de tout Java professionnel.*
