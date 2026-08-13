<div class="chapitre-titre-num">CHAPITRE 11</div>

# Encapsulation

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras pourquoi exposer directement les attributs d'une classe est dangereux, tu sauras les protéger avec `private`, et construire des méthodes d'accès (getters/setters) qui valident réellement les données. C'est le premier des quatre grands piliers de la POO annoncés au chapitre 8.

## A. Le problème

Jusqu'ici, on a toujours accédé directement aux attributs d'un objet : `compte.solde = -50000;`. Rien, dans ce qu'on a vu jusqu'à présent, n'empêche ce genre d'absurdité métier — un solde négatif, un âge de -5 ans, un stock impossible.

```java
public class CompteBancaire {
    double solde; // accessible et modifiable par N'IMPORTE QUEL code, sans aucun contrôle
}

CompteBancaire compte = new CompteBancaire();
compte.solde = -50000; // rien ne l'empêche !
```

## B. Exemple de la vie réelle

> On ne laisse pas n'importe qui entrer dans notre maison.

Une maison a une porte d'entrée, verrouillée. Les visiteurs ne se promènent pas librement dans toutes les pièces : ils sonnent, et c'est **toi** qui décides de les laisser entrer, dans certaines pièces seulement, à certaines conditions. Personne ne peut, de l'extérieur, réarranger tes meubles à sa guise en passant par une fenêtre.

## C. Explication très simple

> **L'encapsulation** consiste à rendre les attributs d'une classe **privés** (`private`), inaccessibles directement de l'extérieur, et à fournir des méthodes publiques contrôlées pour les lire et les modifier, avec des règles de validation.

## D. Premier exemple Java

```java
public class CompteBancaire {
    private String titulaire;
    private double solde; // private : accessible SEULEMENT depuis l'intérieur de cette classe

    public CompteBancaire(String titulaire, double soldeInitial) {
        this.titulaire = titulaire;
        this.solde = soldeInitial;
    }

    public double getSolde() {
        return solde;
    }

    public void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Le montant à déposer doit être positif");
        }
        this.solde += montant;
    }
}
```

## E. Explication ligne par ligne

```{.uml}
private double solde;
   │
   └─ "private" : rend l'attribut invisible et inaccessible depuis
      L'EXTÉRIEUR de la classe. Seul le code écrit À L'INTÉRIEUR de
      CompteBancaire peut le lire ou l'écrire directement.

public double getSolde() {
   │      │        │
   │      │        └─ Un GETTER : une méthode publique qui se contente
   │      │           de LIRE la valeur, sans permettre de la modifier.
   │      │
   │      └─ Convention Java : "get" + nom de l'attribut, majuscule au début.
   │
   └─ "public" : accessible depuis n'importe où, contrairement à l'attribut.

public void deposer(double montant) {
    if (montant <= 0) {
        throw new IllegalArgumentException(...);
    }
    this.solde += montant;
}
       │
       └─ Un SETTER, mais avec une VALIDATION avant d'accepter la modification.
          Ici, il porte un nom métier ("deposer") plutôt que le nom
          générique "setSolde", ce qui est souvent préférable.
```

```java
CompteBancaire compte = new CompteBancaire("Jaslin", 1000);
compte.solde = -50000;   // ❌ erreur de compilation : solde n'est pas accessible (private)
compte.deposer(500);     // ✅ seule voie autorisée, avec validation garantie
System.out.println(compte.getSolde()); // 1500.0
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Getter et Setter</span>
Un <strong>getter</strong> est une méthode publique qui renvoie la valeur d'un attribut privé, sans permettre de le modifier. Un <strong>setter</strong> est une méthode publique qui modifie un attribut privé, généralement après avoir vérifié que la nouvelle valeur est acceptable. Ensemble, on les appelle des <strong>accesseurs</strong>.
</div>

## F. Deuxième exemple : la convention Java complète

```java
public class Etudiant {
    private String nom;
    private int age;

    public Etudiant(String nom, int age) {
        setNom(nom); // réutiliser le setter DANS le constructeur garantit la même validation partout
        setAge(age);
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        if (nom == null || nom.isBlank()) {
            throw new IllegalArgumentException("Le nom ne peut pas être vide");
        }
        this.nom = nom;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age < 0 || age > 120) {
            throw new IllegalArgumentException("Âge invalide : " + age);
        }
        this.age = age;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pour un booléen, on utilise "is", pas "get"</span>

```java
private boolean actif;

public boolean isActif() { // "isActif", pas "getActif"
    return actif;
}
```

Cette convention permet une lecture naturelle : `if (compte.isActif())` se lit presque comme une phrase.
</div>

## Attributs en lecture seule (sans setter)

```java
public class Personne {
    private final String numeroIdentifiant; // final : ne peut être assigné qu'UNE SEULE FOIS

    public Personne(String numeroIdentifiant) {
        this.numeroIdentifiant = numeroIdentifiant;
    }

    public String getNumeroIdentifiant() {
        return numeroIdentifiant;
    }
    // Pas de setNumeroIdentifiant() : cette donnée ne doit JAMAIS changer après création
}
```

Certaines données (un identifiant, une date de naissance) ne doivent jamais changer après la création de l'objet. Ne fournir **aucun** setter pour elles, éventuellement combiné à `final`, garantit cette immuabilité — imposée par le compilateur lui-même, pas seulement par une bonne intention du développeur.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Un setter qui ne valide rien n'apporte presque rien</span>

```java
public void setAge(int age) {
    this.age = age; // ⚠️ accepte n'importe quelle valeur, y compris -50 ou 9999
}
```

L'encapsulation n'a de valeur réelle **que si** les setters valident effectivement les données. Un setter qui se contente de lire/écrire sans aucune règle ressemble encore à un attribut public déguisé — il garde tout de même l'avantage de pouvoir ajouter une validation plus tard sans casser le code appelant, contrairement à un attribut public.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Rendre un attribut privé, mais oublier de l'utiliser dans le constructeur</span>

```java
public class Produit {
    private double prix;

    public Produit(double prix) {
        this.prix = prix; // ❌ contourne setPrix() : AUCUNE validation appliquée ici !
    }

    public void setPrix(double prix) {
        if (prix < 0) throw new IllegalArgumentException("Prix négatif refusé");
        this.prix = prix;
    }
}

Produit p = new Produit(-500); // ✅ compile, MAIS crée un objet dans un état invalide !
```

Écrire un setter qui valide ne sert à rien si le **constructeur** contourne ce setter en assignant directement l'attribut. Il faut, autant que possible, faire appeler le setter **depuis** le constructeur (comme dans l'exemple `Etudiant` de la section F).
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais pourquoi des attributs publics sont dangereux pour la cohérence des données.
✓ Je sais rendre un attribut private et fournir un getter/setter publics.
✓ Je sais qu'un setter n'a de valeur que s'il valide réellement les données.
✓ Je sais rendre un attribut en lecture seule (final, sans setter).
✓ Je sais faire appeler le setter depuis le constructeur pour ne jamais contourner la validation.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Cette classe `Produit` n'est pas encapsulée. Encapsule-la : rends ses attributs privés, ajoute des getters, et un setter `setPrix()` qui refuse tout prix négatif.

```java
public class Produit {
    public String nom;
    public double prix;
}
```
</div>

## Correction

```java
public class Produit {
    private String nom;
    private double prix;

    public Produit(String nom, double prix) {
        this.nom = nom;
        setPrix(prix);
    }

    public String getNom() {
        return nom;
    }

    public double getPrix() {
        return prix;
    }

    public void setPrix(double prix) {
        if (prix < 0) {
            throw new IllegalArgumentException("Le prix ne peut pas être négatif");
        }
        this.prix = prix;
    }
}
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Ajoute à `Produit` un attribut `quantiteEnStock` (privé), avec un getter, mais **sans setter direct** : la seule façon de le modifier doit passer par deux méthodes, `ajouterStock(int quantite)` et `retirerStock(int quantite)`, qui refusent toute opération rendant le stock négatif ou toute quantité négative en entrée.
</div>

### Corrigé du défi

```java
private int quantiteEnStock;

public int getQuantiteEnStock() {
    return quantiteEnStock;
}

public void ajouterStock(int quantite) {
    if (quantite <= 0) {
        throw new IllegalArgumentException("La quantité à ajouter doit être positive");
    }
    this.quantiteEnStock += quantite;
}

public void retirerStock(int quantite) {
    if (quantite <= 0 || quantite > this.quantiteEnStock) {
        throw new IllegalArgumentException("Quantité à retirer invalide");
    }
    this.quantiteEnStock -= quantite;
}
```

Remarque qu'aucune méthode ne permet de fixer directement `quantiteEnStock` à une valeur arbitraire : elle ne peut évoluer que par petites étapes contrôlées, chacune validée.

## Résumé du chapitre

- **L'encapsulation** rend les attributs `private` et n'expose que des méthodes publiques contrôlées.
- Un getter lit une valeur ; un setter la modifie, idéalement avec validation.
- Un setter qui ne valide rien n'apporte presque aucun bénéfice réel par rapport à un attribut public.
- Le constructeur doit, autant que possible, réutiliser les setters plutôt que les contourner.
- Un attribut sans setter (souvent `final`) devient immuable après sa création : utile pour un identifiant ou une date de naissance.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Pourquoi cette ligne ne compile-t-elle pas, si `solde` est `private` dans `CompteBancaire`, et que ce code est écrit dans une autre classe `Main` ?

```java
compte.solde = 1000;
```
</div>

**Corrigé :** `private` rend l'attribut accessible **uniquement** depuis l'intérieur de la classe `CompteBancaire` elle-même. Toute tentative d'y accéder directement depuis une autre classe (ici `Main`) est refusée dès la compilation — c'est tout le sens de l'encapsulation.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Ce setter a un défaut de conception. Lequel, et comment le corriger ?

```java
public void setEmail(String email) {
    this.email = email;
}
```
</div>

**Corrigé :** Ce setter ne valide rien : il accepte n'importe quelle chaîne, y compris vide, `null`, ou sans arobase. Correction possible :
```java
public void setEmail(String email) {
    if (email == null || !email.contains("@")) {
        throw new IllegalArgumentException("Email invalide");
    }
    this.email = email;
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une classe `Employe` a un attribut `salaire` qui ne doit jamais pouvoir diminuer (seulement augmenter, ou rester stable). Écris l'encapsulation complète (attribut privé, getter, et une méthode `augmenterSalaire(double montant)` qui refuse tout montant négatif ou nul).
</div>

**Corrigé :**
```java
public class Employe {
    private double salaire;

    public Employe(double salaireInitial) {
        if (salaireInitial < 0) {
            throw new IllegalArgumentException("Salaire initial invalide");
        }
        this.salaire = salaireInitial;
    }

    public double getSalaire() {
        return salaire;
    }

    public void augmenterSalaire(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("L'augmentation doit être strictement positive");
        }
        this.salaire += montant;
    }
    // Aucune méthode ne permet de FIXER ou DIMINUER le salaire directement.
}
```

---

*Chapitre suivant : l'héritage, le deuxième pilier de la POO, pour réutiliser et étendre le comportement d'une classe existante sans dupliquer de code.*
