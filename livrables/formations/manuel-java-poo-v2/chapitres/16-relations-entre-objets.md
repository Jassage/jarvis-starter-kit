<div class="chapitre-titre-num">CHAPITRE 16</div>

# Relations entre objets

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras faire collaborer plusieurs classes ensemble en les reliant par des attributs, et tu connaîtras les trois grandes façons de relier des objets : association, agrégation et composition.

## A. Le problème

Jusqu'ici, chaque classe qu'on a écrite était plutôt isolée. Mais un vrai programme a besoin de faire **collaborer** des objets entre eux : une école a des étudiants, une commande contient des lignes de commande, un étudiant est inscrit dans une classe. Comment représenter ce genre de lien en Java ?

## B. Exemple de la vie réelle

```{.uml}
École ─── possède ─── Étudiants

Commande ─── contient ─── LigneCommande
```

Une école n'existe pas sans étudiants qui la fréquentent, mais un étudiant qui quitte l'école continue d'exister ailleurs (il change simplement d'établissement). À l'inverse, une ligne de commande (« 2 sacs de riz à 250 HTG ») n'a **aucun sens** sans la commande à laquelle elle appartient : si la commande est annulée, ses lignes disparaissent avec elle. Ce sont deux types de liens **différents**, qu'il est utile de distinguer.

## C. Explication très simple

> Une **relation entre objets** existe dès qu'une classe utilise une autre classe comme type d'un de ses attributs (au lieu d'un simple `int` ou `String`).

Trois nuances de cette idée :

```{.uml}
ASSOCIATION   →  deux objets se connaissent et collaborent, mais existent
                  chacun de façon totalement indépendante.
                  (ex : un Etudiant connaît son Professeur ; si le
                  professeur change, l'étudiant continue d'exister)

AGRÉGATION    →  un objet "contient" logiquement d'autres objets, mais ces
                  derniers pourraient survivre à leur "conteneur".
                  (ex : une École possède des Étudiants, mais un étudiant
                  qui change d'école continue d'exister ailleurs)

COMPOSITION   →  un objet contient d'autres objets qui n'ont AUCUN sens
                  et NE PEUVENT PAS exister sans lui. Si le "conteneur"
                  est détruit, les objets qu'il contient disparaissent
                  avec lui.
                  (ex : une Commande contient des LigneCommande, qui
                  n'ont aucune raison d'exister sans elle)
```

## D. Premier exemple Java : l'association

```java
class Professeur {
    String nom;
    Professeur(String nom) { this.nom = nom; }
}

class Etudiant {
    String nom;
    Professeur professeurPrincipal; // ASSOCIATION : Etudiant connaît un Professeur

    Etudiant(String nom, Professeur professeurPrincipal) {
        this.nom = nom;
        this.professeurPrincipal = professeurPrincipal;
    }

    void afficherProfesseur() {
        System.out.println(nom + " a comme professeur principal " + professeurPrincipal.nom);
    }
}
```

## E. Explication ligne par ligne

```{.uml}
class Etudiant {
    String nom;
    Professeur professeurPrincipal;
           │
           └─ Un ATTRIBUT dont le TYPE est une autre classe (Professeur),
              exactement comme au chapitre 9 pour String — sauf que "String"
              est une classe fournie par Java, et "Professeur" est une
              classe qu'on a écrite nous-mêmes.
```

`professeurPrincipal` est une **référence** (chapitre 9) vers un objet `Professeur`, existant indépendamment ailleurs dans le programme. Si ce professeur change d'école, l'objet `Etudiant` continue d'exister normalement — c'est le signe d'une **association**, la relation la plus "lâche" des trois.

## F. Deuxième exemple : agrégation et composition

```java
// AGRÉGATION : une École possède des Étudiants, mais ils lui survivraient
class Ecole {
    String nom;
    Etudiant[] etudiants;

    Ecole(String nom, Etudiant[] etudiants) {
        this.nom = nom;
        this.etudiants = etudiants; // les Etudiant existent INDÉPENDAMMENT de Ecole
    }
}
```

```java
// COMPOSITION : une Commande CRÉE elle-même ses LigneCommande, qui n'existent QUE pour elle
class LigneCommande {
    String produit;
    int quantite;

    LigneCommande(String produit, int quantite) {
        this.produit = produit;
        this.quantite = quantite;
    }
}

class Commande {
    private LigneCommande[] lignes;

    Commande(String[] produits, int[] quantites) {
        this.lignes = new LigneCommande[produits.length];
        for (int i = 0; i < produits.length; i++) {
            // La Commande CRÉE elle-même ses lignes : elles n'existent QUE parce que la Commande existe
            this.lignes[i] = new LigneCommande(produits[i], quantites[i]);
        }
    }

    void afficherDetails() {
        for (LigneCommande ligne : lignes) {
            System.out.println("- " + ligne.quantite + "x " + ligne.produit);
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        String[] produits = {"Riz", "Haricots"};
        int[] quantites = {2, 3};

        Commande commande = new Commande(produits, quantites);
        commande.afficherDetails();
    }
}
```

Résultat :
```text
- 2x Riz
- 3x Haricots
```

<div class="encadre astuce">
<span class="encadre-titre">💡 L'indice le plus fiable pour distinguer agrégation et composition</span>
Demande-toi : « Qui crée l'objet contenu, et avec <code>new</code> ? » Dans l'agrégation (École/Étudiants), les <code>Etudiant</code> sont créés <strong>ailleurs</strong>, puis simplement transmis à l'école. Dans la composition (Commande/LigneCommande), c'est la <code>Commande</code> elle-même qui crée ses lignes, à l'intérieur de son propre constructeur — elles n'ont littéralement aucune existence possible en dehors d'elle.
</div>

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Diagramme UML de relation</span>
Le chapitre 30 (UML) détaillera la notation graphique complète de ces trois relations. Retiens dès maintenant leurs symboles standards, que tu recroiseras : l'association est une simple ligne, l'agrégation utilise un losange <strong>vide</strong> (◇) du côté du "conteneur", et la composition utilise un losange <strong>plein</strong> (◆).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre agrégation et composition, avec des conséquences bien réelles</span>

Si une classe `Ecole` **crée elle-même** ses `Etudiant` dans son constructeur (comme une vraie composition), il devient impossible de faire changer un étudiant d'école sans le détruire et en recréer un nouveau ailleurs — ce qui n'a aucun sens dans la vraie vie. Le bon choix de relation (agrégation ici, pas composition) n'est donc pas qu'une question de vocabulaire : il a un impact réel sur la façon dont le code peut évoluer.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un attribut objet non initialisé, encore et toujours</span>

```java
class Etudiant {
    Professeur professeurPrincipal;
}

Etudiant e = new Etudiant();
e.professeurPrincipal.nom; // 💥 NullPointerException : professeurPrincipal vaut null
```

Comme au chapitre 9, un attribut de type objet non initialisé vaut `null`. Cette erreur devient encore plus fréquente avec les relations entre objets, car il est facile d'oublier d'initialiser une association dans le constructeur.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais qu'un attribut peut avoir pour type une classe que j'ai écrite moi-même.
✓ Je connais la différence entre association (deux objets indépendants
  qui se connaissent), agrégation (contient, mais survit) et composition
  (contient, et ne survit pas sans le conteneur).
✓ Je sais repérer une composition au fait que l'objet "conteneur" crée
  lui-même les objets qu'il contient, avec new, dans son propre constructeur.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Une classe `Voiture` a un attribut `Moteur moteur`, initialisé directement dans le constructeur de `Voiture` avec `new Moteur()`. S'agit-il d'une association, d'une agrégation, ou d'une composition ? Justifie.
</div>

## Correction

C'est une **composition**. `Voiture` crée elle-même son `Moteur` dans son propre constructeur : ce moteur n'a aucune existence possible en dehors de cette voiture précise, et disparaît logiquement avec elle.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Crée une classe `Bibliotheque` en composition avec des `Etagere` (elle crée elle-même 3 étagères dans son constructeur, chacune avec un attribut `numero`). Ajoute une méthode `afficherEtageres()` qui les liste toutes.
</div>

### Corrigé du défi

```java
class Etagere {
    int numero;
    Etagere(int numero) { this.numero = numero; }
}

class Bibliotheque {
    private Etagere[] etageres;

    Bibliotheque() {
        this.etageres = new Etagere[3];
        for (int i = 0; i < 3; i++) {
            this.etageres[i] = new Etagere(i + 1); // COMPOSITION : créées ici, par la Bibliotheque elle-même
        }
    }

    void afficherEtageres() {
        for (Etagere e : etageres) {
            System.out.println("Étagère n°" + e.numero);
        }
    }
}
```

## Résumé du chapitre

- Une **relation entre objets** existe dès qu'un attribut a pour type une autre classe.
- **Association** : deux objets se connaissent, mais existent chacun de façon totalement indépendante.
- **Agrégation** : un objet contient logiquement d'autres objets, qui pourraient exister ailleurs.
- **Composition** : un objet crée et contient d'autres objets qui n'ont aucun sens sans lui.
- L'indice le plus fiable pour distinguer agrégation et composition : qui crée l'objet contenu, et où (`new` à l'intérieur du constructeur du conteneur = composition).

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Une classe `Client` a un attribut `Adresse adresseLivraison`, reçu en paramètre du constructeur `Client(String nom, Adresse adresse)`. S'agit-il d'une agrégation ou d'une composition ?
</div>

**Corrigé :** Une agrégation. L'objet `Adresse` est créé **ailleurs** (avant l'appel au constructeur de `Client`) et simplement transmis, il n'est pas créé par `Client` lui-même.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pour chacune de ces paires, indique s'il s'agit plutôt d'une association, d'une agrégation, ou d'une composition, en justifiant brièvement : (a) Voiture et Roue (créées par la voiture) ; (b) Médecin et Patient (indépendants l'un de l'autre) ; (c) Équipe et Joueur (les joueurs peuvent changer d'équipe).
</div>

**Corrigé :** (a) Composition — les roues n'ont aucun sens hors de la voiture qui les a créées. (b) Association — un médecin et un patient existent indépendamment l'un de l'autre, même s'ils collaborent. (c) Agrégation — les joueurs sont contenus dans l'équipe, mais peuvent survivre à un transfert vers une autre.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une classe `Commande` a d'abord été écrite avec ses `LigneCommande` reçues en paramètre du constructeur (agrégation), mais l'équipe réalise qu'une ligne de commande n'a jamais de sens en dehors de sa commande. Réécris le constructeur pour transformer cette relation en composition, sachant que le constructeur reçoit désormais directement des tableaux `String[] produits` et `int[] quantites` plutôt que des `LigneCommande[]` déjà construites.
</div>

**Corrigé :** C'est exactement l'exemple de la section F de ce chapitre :
```java
Commande(String[] produits, int[] quantites) {
    this.lignes = new LigneCommande[produits.length];
    for (int i = 0; i < produits.length; i++) {
        this.lignes[i] = new LigneCommande(produits[i], quantites[i]);
    }
}
```
En construisant les `LigneCommande` **à l'intérieur** du constructeur de `Commande`, plutôt qu'en les recevant déjà construites, on garantit qu'aucune `LigneCommande` ne peut exister sans passer par une `Commande` — la relation devient une vraie composition.

---

*Chapitre suivant : classes, objets et relations complexes, pour voir comment plusieurs classes collaborent ensemble dans une situation métier réaliste (Client, Commande, Produit, Paiement).*
