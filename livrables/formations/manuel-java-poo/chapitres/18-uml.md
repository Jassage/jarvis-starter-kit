<div class="chapitre-titre-num">CHAPITRE 18</div>

# UML

## Objectifs pédagogiques

Comprendre le rôle d'UML dans la conception logicielle, savoir lire et produire un diagramme de classes complet, et découvrir les diagrammes de séquence, de cas d'utilisation et d'activités.

## 18.1 Qu'est-ce qu'UML et pourquoi l'utiliser

**UML** (*Unified Modeling Language*) est un langage de modélisation graphique normalisé, utilisé pour **concevoir** un système avant (ou pendant) son implémentation. Ce manuel a déjà utilisé sa notation de diagramme de classes de façon informelle depuis le chapitre 1 (en texte/ASCII, rappel du choix technique du sommaire) — ce chapitre en formalise les règles complètes.

<div class="encadre astuce">
<span class="encadre-titre">💡 UML n'est pas un langage de programmation</span>
UML sert à **communiquer** une conception (entre développeurs, avec des clients, en documentation), pas à être exécuté. Un diagramme de classes ne remplace jamais le code réel, mais aide à réfléchir à la structure **avant** d'écrire ce code, ou à documenter une architecture existante pour un nouveau membre de l'équipe.
</div>

## 18.2 Le diagramme de classes en détail

**Diagramme de classes complet — Système de bibliothèque**

```{.uml}
┌─────────────────────────────┐
│      «abstract» Utilisateur     │
├─────────────────────────────┤
│ # nom : String                  │
│ # email : String                │
├─────────────────────────────┤
│ + Utilisateur(nom, email)       │
│ + afficherProfil(): void {abstrait} │
└─────────────────────────────┘
           △
           │
    ┌──────┴────────┐
┌─────────┐    ┌──────────────┐
│  Membre    │    │ Bibliothecaire  │
├─────────┤    ├──────────────┤
│-nbEmprunts │    │ - matricule      │
├─────────┤    ├──────────────┤
│+afficherProfil()│ │+afficherProfil()│
└─────────┘    └──────────────┘
      │ 1                    │ 1
      │                       │
      │ emprunte              │ gère
      │                       │
      ◇ 0..*              ────►  0..*
┌─────────────┐        ┌─────────────┐
│    Emprunt     │◇──────►│    Livre        │
├─────────────┤   1    ├─────────────┤
│ - dateEmprunt   │        │ - titre          │
│ - dateRetour    │        │ - disponible     │
├─────────────┤        ├─────────────┤
│+estEnRetard()   │        │+emprunter()      │
└─────────────┘        │+retourner()      │
                        └─────────────┘
```

## 18.3 Les types de relations entre classes

| Relation | Notation (texte) | Signification | Exemple |
|---|---|---|---|
| **Héritage** | `△` (triangle vide) | "est un" | `Membre` **hérite de** `Utilisateur` |
| **Implémentation** | `▲┊` (triangle vide, trait pointillé) | "respecte le contrat de" | `Facture` **implémente** `Payable` |
| **Association** | `──────` (trait plein) | "est en relation avec" | `Membre` **emprunte** des `Livre` |
| **Agrégation** | `◇──────` (losange vide) | "a un", mais l'un peut exister sans l'autre | Une `Bibliotheque` **a des** `Livre`, qui peuvent exister indépendamment |
| **Composition** | `◆──────` (losange plein) | "a un", et l'un ne peut PAS exister sans l'autre | Une `Maison` **a des** `Piece` : sans maison, les pièces n'ont pas de sens |
| **Dépendance** | `┄┄┄┄►` (pointillé, flèche ouverte) | "utilise temporairement" | Une méthode reçoit un paramètre d'un autre type, sans le stocker |

<div class="encadre astuce">
<span class="encadre-titre">💡 Agrégation vs Composition : le test du "sans l'un, l'autre a-t-il un sens ?"</span>
La distinction la plus subtile : dans une **composition**, la durée de vie de l'objet "contenu" est **liée** à celle de son "contenant" (supprimer une `Commande` supprime ses `LigneCommande`). Dans une **agrégation**, les deux objets ont des durées de vie **indépendantes** (supprimer une `Bibliotheque` ne devrait pas supprimer les `Livre` physiques qu'elle contenait, potentiellement transférés ailleurs).
</div>

## 18.4 Cardinalités (multiplicités)

```
Membre "1" ────── "0..*" Emprunt
```

| Notation | Signification |
|---|---|
| `1` | Exactement un |
| `0..1` | Zéro ou un (optionnel) |
| `0..*` ou `*` | Zéro ou plusieurs |
| `1..*` | Au moins un |
| `3..5` | Entre 3 et 5 |

*"Un `Membre` peut avoir 0 ou plusieurs `Emprunt` ; chaque `Emprunt` est associé à exactement 1 `Membre`."*

## 18.5 Diagramme de séquence

Le **diagramme de séquence** montre l'**ordre chronologique** des messages échangés entre objets pour réaliser un scénario précis.

**Diagramme de séquence — Emprunter un livre**

```{.uml}
Membre          Bibliotheque         Livre           Emprunt
  │                   │                 │                │
  │ emprunterLivre()  │                 │                │
  ├──────────────────►│                 │                │
  │                   │ estDisponible() │                │
  │                   ├────────────────►│                │
  │                   │◄────────────────┤ true           │
  │                   │                 │                │
  │                   │  new Emprunt()                    │
  │                   ├───────────────────────────────────►│
  │                   │                 │                │
  │                   │ marquerIndisponible()              │
  │                   ├────────────────►│                │
  │                   │                 │                │
  │◄──────────────────┤ confirmation    │                │
```

Chaque colonne verticale représente un objet ; les flèches horizontales, les appels de méthode, lus de haut en bas dans l'ordre où ils se produisent.

## 18.6 Diagramme de cas d'utilisation (Use Case)

Le **diagramme de cas d'utilisation** montre, du point de vue de l'utilisateur, les grandes fonctionnalités du système et qui (quel "acteur") y a accès.

**Diagramme de cas d'utilisation — Système de bibliothèque**

```{.uml}
                    ┌─────────────────────────┐
                    │   Système Bibliothèque     │
                    │                             │
    Membre ────────►│  ( Emprunter un livre )     │
      │              │                             │
      │              │  ( Consulter le catalogue )  │
      │──────────────┼────────────────────────────►│
                    │                             │
                    │  ( Retourner un livre )      │
                    │◄────────────────────────────┤
                    │                             │
Bibliothecaire ────►│  ( Ajouter un livre )        │
      │              │                             │
      │──────────────┼────────────────────────────►│
                    │  ( Gérer les membres )       │
                    └─────────────────────────┘
```

Un acteur (bonhomme filiforme en UML graphique, représenté ici par son nom) est une entité **externe** au système (un utilisateur humain, ou parfois un autre système) qui interagit avec lui via des cas d'utilisation (ellipses).

## 18.7 Diagramme d'activités

Le **diagramme d'activités** ressemble à un organigramme, modélisant le **flux logique** d'un processus, avec ses embranchements conditionnels.

**Diagramme d'activités — Processus d'emprunt**

```{.uml}
        ● (début)
        │
        ▼
  [Rechercher le livre]
        │
        ▼
    ◇ Disponible ? ◇
     │           │
    Oui          Non
     │           │
     ▼           ▼
[Créer Emprunt] [Afficher message
     │            "indisponible"]
     ▼           │
[Marquer livre    │
 indisponible]    │
     │           │
     └─────┬─────┘
           ▼
          ● (fin)
```

## 18.8 De UML au code : traduire un diagramme de classes

```java
// Directement traduit du diagramme de la section 18.2
public abstract class Utilisateur {
    protected String nom;
    protected String email;

    public Utilisateur(String nom, String email) {
        this.nom = nom;
        this.email = email;
    }

    public abstract void afficherProfil();
}

public class Membre extends Utilisateur {
    private int nbEmprunts;

    public Membre(String nom, String email) {
        super(nom, email);
    }

    @Override
    public void afficherProfil() {
        System.out.println("Membre : " + nom + " (" + nbEmprunts + " emprunts en cours)");
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une bonne pratique professionnelle : concevoir d'abord, coder ensuite</span>
Sur un projet réel de taille modeste à moyenne (comme les études de cas du chapitre 22 et les projets des chapitres 23 et 31), esquisser d'abord le diagramme de classes principal permet de repérer les incohérences de conception (relations manquantes, responsabilités mal réparties) **avant** d'investir du temps à écrire du code qu'il faudrait ensuite largement retoucher.
</div>

## 18.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre agrégation et composition dans un diagramme</span>
Une erreur de modélisation classique : représenter une relation `Commande`-`LigneCommande` (qui devrait être une **composition**, car une ligne de commande n'a aucun sens sans sa commande) comme une simple agrégation. Cette confusion se traduit ensuite en code par une mauvaise gestion du cycle de vie des objets liés (oublier de supprimer les lignes en cascade lors de la suppression d'une commande).
</div>

## 18.10 Résumé du chapitre

- UML modélise une conception avant/pendant l'implémentation ; il ne remplace jamais le code.
- Le diagramme de classes détaille attributs, méthodes, visibilité et relations (héritage, implémentation, association, agrégation, composition, dépendance).
- Les cardinalités précisent combien d'instances participent à chaque côté d'une relation.
- Le diagramme de séquence montre l'ordre chronologique des appels ; le diagramme de cas d'utilisation, les fonctionnalités vues par les acteurs ; le diagramme d'activités, le flux logique d'un processus.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Dessine (en notation texte) un diagramme de classes simplifié pour un système de commande en ligne : `Client`, `Commande`, `LigneCommande`, `Produit`, avec les bonnes relations (association, composition) et cardinalités.
</div>

**Corrigé :**
<div class="uml">
Client "1" ────── "0..*" Commande
Commande "1" ◆────── "1..*" LigneCommande   (composition : une ligne n'existe pas sans sa commande)
LigneCommande "0..*" ────── "1" Produit      (association : un produit existe indépendamment des lignes qui le référencent)
</div>

*Chapitre suivant : les principes SOLID, pour structurer un code orienté objet maintenable et évolutif.*
