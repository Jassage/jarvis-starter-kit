<div class="chapitre-titre-num">CHAPITRE 8</div>

# Pourquoi avons-nous besoin de la POO ?

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras pourquoi la Programmation Orientée Objet (POO) existe, quel problème concret elle résout par rapport à ce que tu as appris jusqu'ici, et tu connaîtras le vocabulaire de base (classe, objet, attribut, méthode) qui structure tout le reste de ce manuel.

C'est un chapitre charnière : tout ce que tu as appris en Partie 2 (variables, types, conditions, boucles, méthodes) reste valable et utile pour toujours. La POO ne remplace rien de tout ça — elle ajoute une nouvelle façon d'**organiser** ce code, à mesure qu'un programme grandit.

## A. Le problème

Reprenons le mini-projet de fin de Partie 2 : un panier de boutique. Imagine maintenant que la boutique grandisse, et qu'on doive gérer non plus un tableau de prix, mais des dizaines de clients, chacun avec un nom, un solde dû, un historique d'achats — et des dizaines de fonctions qui manipulent toutes ces informations séparément.

```java
public class BoutiqueSansPOO {
    public static void main(String[] args) {
        // Les données d'un client : de simples variables, SÉPARÉES les unes des autres
        String nomClient1 = "Marie";
        double soldeClient1 = 0;

        String nomClient2 = "Paul";
        double soldeClient2 = 0;

        soldeClient1 = ajouterAchat(soldeClient1, 500);
        soldeClient2 = ajouterAchat(soldeClient2, 1200);

        afficherClient(nomClient1, soldeClient1);
        afficherClient(nomClient2, soldeClient2);
    }

    static double ajouterAchat(double solde, double montant) {
        return solde + montant;
    }

    static void afficherClient(String nom, double solde) {
        System.out.println(nom + " doit " + solde + " HTG");
    }
}
```

Ce code fonctionne. Mais remarque le problème qui grossit avec chaque nouveau client : `nomClient1`/`soldeClient1`, `nomClient2`/`soldeClient2`... Rien, dans le code, ne dit clairement que `nomClient1` et `soldeClient1` **appartiennent ensemble**, décrivent le **même** client. C'est seulement dans la tête du développeur, via une convention de nommage fragile, que ce lien existe. Avec 100 clients, ce code devient ingérable : 200 variables séparées à suivre à la main.

## B. Exemple de la vie réelle

Pense à la différence entre un tas de papiers volants sur un bureau et un vrai dossier client dans un classeur.

```{.uml}
Tas de papiers volants :               Dossier client organisé :
┌────────────┐                         ┌─────────────────────────┐
│ "Marie"    │  (feuille 1)            │  DOSSIER : Marie          │
└────────────┘                         │  ─────────────────────    │
┌────────────┐                         │  Nom : Marie               │
│ "0"        │  (feuille 2, solde ?)   │  Solde : 500 HTG           │
└────────────┘                         │  Actions : ajouterAchat()  │
     ... 100 clients = 200 feuilles    └─────────────────────────┘
     éparpillées, à recoller mentalement    ... 100 dossiers, chacun
     dans le bon ordre à chaque fois         complet et autonome
```

Un dossier regroupe **tout ce qui concerne un client** (ses informations ET les actions qu'on peut faire avec) en une seule unité cohérente. C'est exactement ce que propose la Programmation Orientée Objet.

## C. Explication très simple

> La **Programmation Orientée Objet (POO)** est une façon d'organiser le code en regroupant, dans une même unité appelée **objet**, les données d'une chose (ses **attributs**) et les actions qu'on peut faire avec (ses **méthodes**), au lieu de les séparer.

Quatre mots-clés à retenir dès maintenant, qu'on va utiliser sans arrêt à partir de ce chapitre :

```text
CLASSE     = le PLAN, le moule (ex : le plan-type d'un "dossier client")
OBJET      = une chose RÉELLE construite à partir du plan (ex : le dossier de Marie, précisément)
ATTRIBUT   = une caractéristique de l'objet (ex : le nom, le solde)
MÉTHODE    = une action que l'objet sait faire (ex : ajouterAchat())
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une classe n'est jamais qu'un plan, jamais une chose réelle</span>
Le plan d'une maison n'est pas habitable : on ne peut vivre que dans une maison réellement construite à partir de ce plan. De la même façon, une <strong>classe</strong> ne représente aucun client précis en elle-même — c'est seulement quand on <strong>crée un objet</strong> à partir d'elle (chapitre 9) qu'on obtient quelque chose de concret et manipulable.
</div>

## D. Premier exemple Java : la même situation, en POO

```java
class Client {
    // ATTRIBUTS : les caractéristiques d'un client
    String nom;
    double solde;

    // MÉTHODE : une action qu'un client sait faire
    void ajouterAchat(double montant) {
        solde = solde + montant;
    }

    void afficherFiche() {
        System.out.println(nom + " doit " + solde + " HTG");
    }
}
```

## E. Explication ligne par ligne

```{.uml}
class Client {
   │     │
   │     └─ Nom de la classe : par convention Java, toujours avec une MAJUSCULE
   │        au début (Client, pas client).
   └─ Mot-clé qui annonce : "voici un nouveau plan/moule".

   String nom;
   double solde;
        │
        └─ Les ATTRIBUTS : chaque objet Client créé à partir de ce plan aura
           SON PROPRE nom et SON PROPRE solde, indépendants de tous les autres.

   void ajouterAchat(double montant) {
       solde = solde + montant;
   }
        │
        └─ Une MÉTHODE : remarque qu'elle utilise directement "solde", sans
           qu'on ait besoin de le lui passer en paramètre séparément — elle
           sait déjà qu'elle appartient à UN client précis, et manipule
           SES données à lui.
```

## F. Deuxième exemple : le même programme, réécrit avec la classe Client

```java
public class BoutiqueAvecPOO {
    public static void main(String[] args) {
        Client client1 = new Client();
        client1.nom = "Marie";
        client1.solde = 0;

        Client client2 = new Client();
        client2.nom = "Paul";
        client2.solde = 0;

        client1.ajouterAchat(500);
        client2.ajouterAchat(1200);

        client1.afficherFiche();
        client2.afficherFiche();
    }
}
```

Résultat :
```text
Marie doit 500.0 HTG
Paul doit 1200.0 HTG
```

Compare ce code à celui de la section A : ici, `client1.nom` et `client1.solde` sont **visiblement et durablement liés**, regroupés dans un seul objet `client1`. Ajouter un troisième client ne demande pas d'inventer deux nouvelles variables mal nommées, juste un troisième objet, construit exactement sur le même plan. (On explique en détail `new Client()` et le point `.` au chapitre 9 — cette section te montre seulement la différence d'organisation, à grands traits.)

## Les avantages concrets, très concis

- **Clarté** : les données et les actions qui vont ensemble restent groupées, visiblement.
- **Réutilisabilité** : le plan `Client` sert à créer autant de clients que nécessaire, sans dupliquer de code.
- **Maintenabilité** : une erreur dans `ajouterAchat()` se corrige à un seul endroit, dans la classe, et la correction profite instantanément à tous les objets créés à partir d'elle.
- **Modélisation naturelle** : le code se rapproche du vocabulaire réel du métier (Client, Commande, Produit), ce qui facilite la communication entre développeurs et non-développeurs.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Croire que la POO élimine le besoin de tout ce qui précède</span>
La POO ne supprime ni les variables, ni les types, ni les conditions, ni les boucles, ni les méthodes : elle les <strong>organise différemment</strong>. Une méthode reste une méthode ; la seule différence est qu'elle appartient désormais à une classe précise, et manipule les attributs de cette classe.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Vouloir créer une classe pour absolument tout</span>
Un piège classique de débutant, une fois la POO découverte, est de vouloir "objetiser" jusqu'au moindre calcul isolé. La POO organise le code qui gère un <strong>état</strong> : des données qui persistent et évoluent dans le temps (un client, un compte, une commande). Un simple calcul ponctuel sans état à conserver (calculer une racine carrée, par exemple) n'a pas besoin de devenir une classe.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais expliquer pourquoi la POO existe, avec un vrai exemple concret.
✓ Je connais les quatre mots-clés : classe (plan), objet (chose réelle),
  attribut (caractéristique), méthode (action).
✓ Je comprends qu'une classe seule ne représente jamais un objet concret.
✓ Je sais que la POO organise le code déjà connu, sans rien y ajouter de magique.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pour une application de bibliothèque, identifie ce qui serait une classe, et donne au moins 2 attributs et 1 méthode plausibles pour elle.
</div>

## Correction

Une classe plausible : `Livre`. Attributs possibles : `titre` (String), `disponible` (boolean). Méthode possible : `emprunter()`. D'autres réponses valides existent (`Membre`, `Bibliothecaire`...) : l'important est de justifier le choix par la présence d'un état qui évolue (un livre devient disponible ou non) et d'actions qui lui sont propres.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Sans encore utiliser `new` (vu en détail au chapitre 9), écris seulement la **classe** `CompteBancaire` avec deux attributs (`titulaire`, `solde`) et deux méthodes : `deposer(double montant)` qui augmente le solde, et `retirer(double montant)` qui le diminue seulement si le solde est suffisant (sinon, affiche un message d'erreur).
</div>

### Corrigé du défi

```java
class CompteBancaire {
    String titulaire;
    double solde;

    void deposer(double montant) {
        solde = solde + montant;
    }

    void retirer(double montant) {
        if (montant <= solde) {
            solde = solde - montant;
        } else {
            System.out.println("Solde insuffisant");
        }
    }
}
```

Remarque que `retirer()` réutilise directement ce que tu connais déjà (le `if/else` du chapitre 5) — la POO n'a rien changé à **comment** on écrit la logique à l'intérieur d'une méthode, seulement à **où** cette méthode vit désormais.

## Résumé du chapitre

- La POO résout un problème réel : éviter que les données liées entre elles (nom + solde d'un même client) se retrouvent éparpillées en variables séparées et fragiles à maintenir.
- **Classe** = le plan ; **objet** = une chose réelle construite à partir du plan ; **attribut** = une caractéristique ; **méthode** = une action.
- Une classe seule ne représente jamais un client, un compte ou un livre précis — il faut créer un objet à partir d'elle (chapitre 9).
- La POO n'élimine rien de la Partie 2 : elle organise ce même code autrement, en le regroupant par unité cohérente.
- Piège à éviter : vouloir transformer en classe la moindre variable isolée sans état réel à gérer.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Associe chaque terme à sa bonne définition : (1) Classe, (2) Objet, (3) Attribut, (4) Méthode — (a) une action, (b) un plan, (c) une chose construite à partir d'un plan, (d) une caractéristique.
</div>

**Corrigé :** 1-b, 2-c, 3-d, 4-a.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pour chacun des éléments suivants d'une application de gestion scolaire, indique s'il ferait un bon objet ou non, en justifiant : (a) un Étudiant, (b) le calcul d'une moyenne à partir de deux notes isolées, (c) une Salle de classe.
</div>

**Corrigé :** (a) Bon objet — état qui évolue (nom, notes, classe) et comportements associés. (b) Pas un objet — un calcul ponctuel sans état à conserver, une simple méthode suffit. (c) Bon objet — état (capacité, occupants) et comportements (réserver, libérer).

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Le code suivant utilise encore l'ancienne approche (variables séparées). Identifie la classe qu'il faudrait créer, ses attributs, et une méthode qui remplacerait `augmenterStock`.

```java
String produitNom = "Riz";
int produitStock = 100;

static int augmenterStock(int stock, int quantite) {
    return stock + quantite;
}
```
</div>

**Corrigé :**
```java
class Produit {
    String nom;
    int stock;

    void augmenterStock(int quantite) {
        stock = stock + quantite;
    }
}
```
`nom` et `stock` deviennent des attributs regroupés dans une seule classe `Produit` ; `augmenterStock` devient une méthode qui manipule directement `stock`, sans avoir besoin de le recevoir en paramètre séparément — exactement comme `ajouterAchat()` dans l'exemple du chapitre.

---

*Chapitre suivant : les classes et les objets, pour enfin apprendre à concrètement créer un objet à partir d'une classe avec le mot-clé `new`, et comprendre ce qui se passe réellement en mémoire.*
