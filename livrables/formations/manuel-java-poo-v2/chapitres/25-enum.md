<div class="chapitre-titre-num">CHAPITRE 25</div>

# Enum

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras représenter un ensemble fixe et connu de valeurs avec `enum`, plutôt que d'utiliser des `String` ou des `int` fragiles.

## A. Le problème

Imagine représenter le statut d'une commande avec un simple `String` :

```java
String statut = "EN_COURS";
// plus tard...
statut = "En cours"; // ❌ faute de frappe, ou variation de casse : AUCUNE erreur de compilation !
if (statut.equals("EN_COURS")) { ... } // ne matchera jamais "En cours" !
```

Rien n'empêche d'écrire `"En cours"`, `"encours"`, ou même `"peut-être"` — le compilateur ne connaît que la règle générale "c'est un `String`", pas la liste précise des valeurs valides.

## B. Exemple de la vie réelle

Pense aux jours de la semaine. Il n'en existe que sept, connus et fixes à l'avance : lundi, mardi... jamais un huitième jour inventé par erreur. Un menu de restaurant avec un nombre fixe de plats fonctionne pareil : le client choisit **parmi** une liste connue, il ne peut pas commander un plat qui n'existe pas sur le menu.

## C. Explication très simple

> Un **enum** (énumération) définit un ensemble **fixe et connu à l'avance** de valeurs possibles, vérifié par le compilateur — impossible d'utiliser une valeur qui n'en fait pas partie.

## D. Premier exemple Java

```java
enum StatutCommande {
    EN_ATTENTE,
    EN_COURS,
    LIVREE,
    ANNULEE
}
```

```java
StatutCommande statut = StatutCommande.EN_COURS;

if (statut == StatutCommande.EN_COURS) {
    System.out.println("La commande est en cours de traitement");
}
```

## E. Explication ligne par ligne

```{.uml}
enum StatutCommande {
    EN_ATTENTE, EN_COURS, LIVREE, ANNULEE
}
   │                                     │
   │                                     └─ Les VALEURS possibles, séparées par des
   │                                        virgules. Convention Java : MAJUSCULES,
   │                                        comme des constantes.
   └─ "enum" déclare un type dont TOUTES les valeurs valides sont
      listées explicitement — aucune autre n'est possible.

StatutCommande statut = StatutCommande.EN_COURS;
                             │
                             └─ On accède à une valeur de l'enum via
                                "NomEnum.VALEUR", jamais entre guillemets.
```

```java
StatutCommande statut = "EN_COURS"; // ❌ erreur de compilation ! Un String n'est pas un StatutCommande.
```

<div class="encadre astuce">
<span class="encadre-titre">💡 == fonctionne parfaitement sur les enums, contrairement aux String</span>
Rappel du chapitre 9 : comparer des <code>String</code> avec <code>==</code> est risqué. Pour un <code>enum</code>, c'est <strong>l'inverse</strong> : chaque valeur (<code>EN_COURS</code>, <code>LIVREE</code>...) n'existe qu'en <strong>un seul</strong> exemplaire dans toute l'application, garanti par Java lui-même. <code>==</code> est donc parfaitement fiable et même préféré à <code>.equals()</code> sur un enum.
</div>

## F. Deuxième exemple : enum avec switch, et enum plus riche

```java
static String decrire(StatutCommande statut) {
    switch (statut) {
        case EN_ATTENTE:
            return "En attente de traitement";
        case EN_COURS:
            return "En cours de préparation";
        case LIVREE:
            return "Livrée avec succès";
        case ANNULEE:
            return "Commande annulée";
        default:
            return "Statut inconnu";
    }
}
```

Un `enum` peut aussi avoir des attributs et des méthodes, exactement comme une classe :

```java
enum Departement {
    NORD_OUEST("Port-de-Paix"),
    ARTIBONITE("Gonaïves"),
    OUEST("Port-au-Prince");

    private final String chefLieu;

    Departement(String chefLieu) { // un CONSTRUCTEUR d'enum, toujours private implicitement
        this.chefLieu = chefLieu;
    }

    String getChefLieu() {
        return chefLieu;
    }
}
```

```java
System.out.println(Departement.OUEST.getChefLieu()); // "Port-au-Prince"
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : values() et name()</span>
Chaque <code>enum</code> fournit automatiquement une méthode <code>values()</code>, qui renvoie un tableau de toutes ses valeurs, très utile pour les parcourir :

```java
for (StatutCommande s : StatutCommande.values()) {
    System.out.println(s); // affiche chaque valeur, une par une
}
```
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier un cas dans un switch sur enum</span>

```java
switch (statut) {
    case EN_ATTENTE: return "...";
    case EN_COURS: return "...";
    // ❌ LIVREE et ANNULEE oubliés : pas d'erreur de compilation, mais comportement incomplet
}
```

Contrairement à une méthode `abstract` (chapitre 14), Java ne force pas à traiter **tous** les cas d'un `enum` dans un `switch`. Toujours prévoir un `default`, ou vérifier soigneusement qu'aucune valeur n'a été oubliée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre le nom d'un enum et une chaîne de caractères</span>

```java
StatutCommande statut = StatutCommande.valueOf("EN_COURS"); // ✅ convertit un String en enum, si la valeur existe
StatutCommande statut2 = StatutCommande.valueOf("En cours"); // 💥 IllegalArgumentException : ne correspond à rien !
```

`valueOf()` (utile pour convertir une donnée textuelle lue, par exemple, dans un fichier — chapitre 24) exige une correspondance **exacte** avec le nom déclaré, casse comprise.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais créer un enum pour représenter un ensemble fixe de valeurs.
✓ Je sais comparer des valeurs d'enum avec ==, sans risque.
✓ Je sais utiliser un enum dans un switch.
✓ Je sais ajouter des attributs et méthodes à un enum, avec un constructeur.
✓ Je sais parcourir toutes les valeurs d'un enum avec values().
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Crée un enum `JourSemaine` avec les 7 jours, et affiche-les tous avec une boucle utilisant `values()`.
</div>

## Correction

```java
enum JourSemaine {
    LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE
}

for (JourSemaine jour : JourSemaine.values()) {
    System.out.println(jour);
}
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Crée un enum `NiveauUrgence` (BASSE, MOYENNE, HAUTE, CRITIQUE) avec un attribut `delaiMaximumHeures` (int) fixé par un constructeur, et une méthode `estUrgent()` qui renvoie `true` pour HAUTE et CRITIQUE uniquement.
</div>

### Corrigé du défi

```java
enum NiveauUrgence {
    BASSE(72),
    MOYENNE(24),
    HAUTE(4),
    CRITIQUE(1);

    private final int delaiMaximumHeures;

    NiveauUrgence(int delaiMaximumHeures) {
        this.delaiMaximumHeures = delaiMaximumHeures;
    }

    int getDelaiMaximumHeures() {
        return delaiMaximumHeures;
    }

    boolean estUrgent() {
        return this == HAUTE || this == CRITIQUE;
    }
}
```

Remarque `this == HAUTE` : à l'intérieur même de l'enum, on peut comparer `this` (la valeur courante) directement aux autres valeurs, sans préfixe.

## Résumé du chapitre

- `enum` définit un ensemble fixe et connu de valeurs, vérifié par le compilateur.
- Comparer des valeurs d'enum avec `==` est sûr et même préféré à `.equals()`.
- Un `enum` peut avoir des attributs, un constructeur et des méthodes, exactement comme une classe.
- `values()` renvoie toutes les valeurs de l'enum ; `valueOf(texte)` convertit un `String` en valeur d'enum, si elle correspond exactement.
- Un `switch` sur un enum n'oblige pas à traiter tous les cas : toujours prévoir un `default` par prudence.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Crée un enum `Taille` avec les valeurs `PETIT`, `MOYEN`, `GRAND`, et affiche `Taille.MOYEN`.
</div>

**Corrigé :**
```java
enum Taille { PETIT, MOYEN, GRAND }
System.out.println(Taille.MOYEN); // MOYEN
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pourquoi ce code affiche-t-il `true`, alors qu'on aurait pu craindre le piège habituel du chapitre 9 sur `==` ?

```java
Taille t1 = Taille.GRAND;
Taille t2 = Taille.GRAND;
System.out.println(t1 == t2);
```
</div>

**Corrigé :** Chaque valeur d'un `enum` n'existe qu'en un **seul exemplaire unique** dans toute l'application, garanti par Java (contrairement à `new String(...)`, qui peut créer plusieurs objets distincts pour le même texte). `t1` et `t2` référencent donc forcément le même objet `GRAND`, rendant `==` toujours fiable sur un enum.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Crée un enum `Role` (ETUDIANT, PROFESSEUR, ADMIN) avec une méthode `peutModifierNotes()` renvoyant `true` uniquement pour `PROFESSEUR` et `ADMIN`. Utilise-le dans une méthode `verifierAcces(Role role)` qui affiche `"Accès autorisé"` ou `"Accès refusé"`.
</div>

**Corrigé :**
```java
enum Role {
    ETUDIANT, PROFESSEUR, ADMIN;

    boolean peutModifierNotes() {
        return this == PROFESSEUR || this == ADMIN;
    }
}

static void verifierAcces(Role role) {
    if (role.peutModifierNotes()) {
        System.out.println("Accès autorisé");
    } else {
        System.out.println("Accès refusé");
    }
}
```

---

*Chapitre suivant : les generics, pour comprendre enfin en profondeur ce que représentent ces chevrons `<>` déjà croisés avec ArrayList, HashSet et HashMap.*
