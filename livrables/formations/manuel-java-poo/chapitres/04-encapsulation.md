<div class="chapitre-titre-num">CHAPITRE 4</div>

# Encapsulation

## Objectifs pédagogiques

Comprendre pourquoi exposer directement les attributs d'une classe est risqué, savoir les rendre `private`, et construire des getters/setters qui valident les données — le premier des quatre piliers de la POO (rappel du chapitre 1).

## 4.1 Le problème des attributs publics

```java
public class CompteBancaire {
    public double solde; // ⚠️ accessible et modifiable par N'IMPORTE QUEL code, sans contrôle
}

CompteBancaire compte = new CompteBancaire();
compte.solde = -50000; // Rien n'empêche cette absurdité métier !
compte.solde = compte.solde + 1000000; // N'importe quel code peut manipuler le solde directement
```

Avec des attributs `public`, **aucune règle métier** ne peut être imposée : n'importe quelle partie du programme peut placer l'objet dans un état incohérent, sans passer par une logique de validation.

## 4.2 La solution : attributs privés + méthodes d'accès

**L'encapsulation** consiste à rendre les attributs **privés** (`private`), inaccessibles directement de l'extérieur, et à fournir des méthodes publiques contrôlées (**getters** et **setters**) pour les lire et les modifier.

```java
public class CompteBancaire {
    private String titulaire;
    private double solde; // privé : accessible SEULEMENT depuis l'intérieur de cette classe

    public CompteBancaire(String titulaire, double soldeInitial) {
        this.titulaire = titulaire;
        this.solde = soldeInitial;
    }

    // Getter : lecture contrôlée
    public double getSolde() {
        return solde;
    }

    // Setter : écriture contrôlée, AVEC validation
    public void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Le montant à déposer doit être positif");
        }
        this.solde += montant;
    }

    public void retirer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Le montant à retirer doit être positif");
        }
        if (montant > this.solde) {
            throw new IllegalStateException("Solde insuffisant");
        }
        this.solde -= montant;
    }
}
```

```java
CompteBancaire compte = new CompteBancaire("Jaslin", 1000);
compte.solde = -50000; // ❌ Erreur de compilation : solde n'est pas accessible (private)
compte.deposer(500);   // ✅ Seule voie autorisée, avec validation garantie
System.out.println(compte.getSolde()); // 1500.0
```

## 4.3 Getters et setters : la convention Java

```java
public class Etudiant {
    private String nom;
    private int age;

    public Etudiant(String nom, int age) {
        setNom(nom); // réutiliser le setter DANS le constructeur garantit la même validation partout
        setAge(age);
    }

    // Getter : préfixe "get" + nom de l'attribut en majuscule à la première lettre
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
<span class="encadre-titre">💡 Pour un booléen, le préfixe conventionnel est "is", pas "get"</span>
```java
private boolean actif;

public boolean isActif() { // "isActif", pas "getActif", par convention Java sur les booléens
    return actif;
}
```
Cette convention (respectée par les frameworks comme Hibernate, chapitre 32, et les bibliothèques JSON) permet une lecture naturelle : `if (compte.isActif())` se lit comme une vraie question.
</div>

## 4.4 Ne pas se contenter de getters/setters "passe-plat"

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un getter/setter qui ne valide rien n'apporte quasiment rien de plus qu'un attribut public</span>
```java
// ⚠️ Encapsulation "de façade" : aucune validation, aucun contrôle réel
public void setAge(int age) {
    this.age = age; // accepte n'importe quelle valeur, y compris -50 ou 9999
}
```
L'encapsulation n'a de valeur réelle **que si** les setters valident effectivement les données (comme en section 4.3). Un getter/setter qui se contente de lire/écrire sans aucune règle n'apporte, en soi, qu'un allongement de code sans bénéfice de sécurité des données — même s'il garde l'avantage de pouvoir ajouter une validation **plus tard** sans casser le code appelant (contrairement à un attribut public qu'il faudrait alors migrer partout).
</div>

## 4.5 Attributs en lecture seule (pas de setter)

```java
public class Personne {
    private final String numeroSecuriteSociale; // final : ne peut être assigné qu'une seule fois

    public Personne(String numeroSecuriteSociale) {
        this.numeroSecuriteSociale = numeroSecuriteSociale;
    }

    public String getNumeroSecuriteSociale() {
        return numeroSecuriteSociale;
    }
    // Pas de setNumeroSecuriteSociale() : cette donnée ne doit JAMAIS changer après création
}
```

Certaines données métier ne doivent **jamais** être modifiées après la création de l'objet (un identifiant, une date de naissance) : ne fournir **aucun setter** pour ces attributs les rend immuables après construction — combiné à `final` (approfondi au chapitre 11), cette immuabilité est garantie par le compilateur lui-même.

## 4.6 Diagramme UML avec visibilité

**Diagramme de classe — Encapsulation**

```{.uml}
┌─────────────────────────────────────┐
│            CompteBancaire            │
├─────────────────────────────────────┤
│ - titulaire : String                 │
│ - solde : double                     │
├─────────────────────────────────────┤
│ + CompteBancaire(titulaire, soldeInitial) │
│ + getSolde(): double                 │
│ + deposer(montant: double): void     │
│ + retirer(montant: double): void     │
└─────────────────────────────────────┘

Légende UML : "-" = private, "+" = public, "#" = protected (chapitre 10)
```

## 4.7 Les avantages concrets de l'encapsulation

- **Contrôle des données** : impossible de placer l'objet dans un état invalide depuis l'extérieur.
- **Flexibilité d'évolution** : l'implémentation interne (par exemple, stocker `solde` en centimes plutôt qu'en unités décimales) peut changer sans casser le code qui utilise `getSolde()`/`deposer()`.
- **Traçabilité** : chaque modification passe par une méthode identifiable, facilitant le débogage (on peut poser un point d'arrêt unique dans `deposer()` plutôt que de chercher partout où `solde` est modifié).
- **Sécurité métier** : les règles de validation (montant positif, solde suffisant) sont appliquées **une seule fois**, au bon endroit, et ne peuvent être contournées.

## 4.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Exposer un attribut objet mutable via un getter, sans copie défensive</span>
```java
public class Commande {
    private List<String> articles = new ArrayList<>();

    public List<String> getArticles() {
        return articles; // ⚠️ retourne la RÉFÉRENCE réelle de la liste interne
    }
}

Commande commande = new Commande();
commande.getArticles().add("Article non autorisé"); // Modifie la liste INTERNE directement, en contournant tout contrôle !
```
Retourner directement une référence vers un attribut objet mutable (une `List`, un tableau) permet à l'appelant de le modifier **sans passer par aucune méthode de la classe**, cassant l'encapsulation malgré un attribut `private`. La solution (approfondie au chapitre 13) : retourner une copie, ou une vue immuable (`Collections.unmodifiableList(articles)`).
</div>

## 4.9 Résumé du chapitre

- L'encapsulation rend les attributs `private` et n'expose que des méthodes publiques contrôlées (getters/setters).
- Un setter n'a de valeur réelle que s'il **valide** effectivement les données, pas seulement s'il les assigne.
- `final` sans setter associé rend un attribut immuable après construction — utile pour les identifiants et données qui ne doivent jamais changer.
- Attention aux getters qui retournent une référence directe vers un objet mutable interne : cela contourne l'encapsulation malgré un attribut privé.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Encapsule cette classe `Produit` : rends ses attributs privés, ajoute des getters, et un setter `setPrix()` qui refuse tout prix négatif.
```java
public class Produit {
    public String nom;
    public double prix;
}
```
</div>

**Corrigé :**
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

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.2</span>

Ajoute à `Produit` un attribut `quantiteEnStock` (privé) avec un getter, mais **sans setter direct** — la seule façon de le modifier doit être via deux méthodes `ajouterStock(int quantite)` et `retirerStock(int quantite)`, qui refusent toute opération rendant le stock négatif.
</div>

**Corrigé :**
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

*Ceci clôt la Partie 1 (fondamentaux). Chapitre suivant : l'héritage, pour réutiliser et étendre le comportement d'une classe existante.*
