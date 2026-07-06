<div class="chapitre-titre-num">CHAPITRE 1</div>

# Introduction à la Programmation Orientée Objet

## Objectifs pédagogiques

À la fin de ce chapitre, tu seras capable de : définir ce qu'est la POO, expliquer pourquoi elle a émergé, la distinguer de la programmation procédurale, et énoncer ses quatre principes fondamentaux (que les chapitres 2 à 8 détailleront un par un).

## 1.1 Une analogie pour commencer

Imagine que tu dois décrire une voiture à un ordinateur. Deux façons de procéder :

- **L'approche procédurale** : tu écris une suite de fonctions séparées — `demarrerMoteur(voiture)`, `accelerer(voiture, vitesse)`, `freiner(voiture)` — qui manipulent toutes une même structure de données `voiture` (vitesse, niveau d'essence, état du moteur) passée en paramètre à chaque appel.
- **L'approche orientée objet** : tu définis un "moule" `Voiture` qui regroupe **à la fois** les données (vitesse, essence) **et** les comportements (`demarrer()`, `accelerer()`, `freiner()`) qui les manipulent. Chaque voiture réelle devient un **objet** fabriqué à partir de ce moule, responsable de son propre état.

**La Programmation Orientée Objet (POO)** est un paradigme de programmation qui organise le code autour d'**objets** — des entités regroupant des données (attributs) et des comportements (méthodes) qui leur sont propres — plutôt qu'autour de fonctions manipulant des données externes.

## 1.2 Historique en bref

| Période | Événement |
|---|---|
| 1967 | **Simula 67** (Norvège) introduit les premiers concepts de classes et d'objets, pour la simulation. |
| 1972 | **Smalltalk** (Xerox PARC) généralise la POO comme paradigme à part entière, "tout est objet". |
| 1983 | **C++** ajoute la POO à C, la rendant accessible à l'industrie du logiciel. |
| 1995 | **Java** (Sun Microsystems) impose la POO comme paradigme unique du langage ("tout est objet ou presque"), avec la portabilité "write once, run anywhere" via la JVM. |
| 2004 → aujourd'hui | Java continue d'évoluer (generics en 2004, lambdas en 2014, records en 2021...) tout en gardant la POO comme fondation. |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi Java est un excellent langage pour apprendre la POO</span>
Contrairement à des langages multi-paradigmes plus permissifs, Java impose une discipline stricte : toute variable et toute méthode doit vivre à l'intérieur d'une classe (à l'exception des primitives et de quelques éléments modernes comme les méthodes statiques d'interface). Cette rigueur, parfois frustrante au début, force à assimiler correctement les concepts de la POO dès le départ — un atout pédagogique reconnu, qui explique pourquoi Java reste un choix standard dans l'enseignement universitaire.
</div>

## 1.3 Programmation procédurale vs orientée objet

```java
// ==================== APPROCHE PROCÉDURALE ====================
// Les données et les fonctions qui les manipulent sont SÉPARÉES

class ProgrammeProcedural {
    public static void main(String[] args) {
        // Les données "voiture" ne sont qu'un ensemble de variables isolées
        String modele = "Toyota Corolla";
        double vitesse = 0;
        double essence = 40.0;

        vitesse = accelerer(vitesse, 20);
        essence = consommerEssence(essence, 20);

        System.out.println(modele + " roule à " + vitesse + " km/h, essence restante : " + essence + "L");
    }

    // Fonction indépendante : elle reçoit les données en paramètre, ne les "possède" pas
    static double accelerer(double vitesseActuelle, double increment) {
        return vitesseActuelle + increment;
    }

    static double consommerEssence(double essenceActuelle, double distanceParcourue) {
        return essenceActuelle - (distanceParcourue * 0.08);
    }
}
```

```java
// ==================== APPROCHE ORIENTÉE OBJET ====================
// Les données ET les comportements qui les manipulent sont REGROUPÉS dans un objet

class Voiture {
    // Attributs : les données PROPRES à chaque voiture
    String modele;
    double vitesse;
    double essence;

    // Méthodes : les comportements qui manipulent CES données précises
    void accelerer(double increment) {
        this.vitesse += increment;
        this.essence -= increment * 0.08; // consommer de l'essence en accélérant
    }

    void afficherEtat() {
        System.out.println(modele + " roule à " + vitesse + " km/h, essence restante : " + essence + "L");
    }
}

public class ProgrammeOriente {
    public static void main(String[] args) {
        Voiture maVoiture = new Voiture();
        maVoiture.modele = "Toyota Corolla";
        maVoiture.vitesse = 0;
        maVoiture.essence = 40.0;

        maVoiture.accelerer(20); // la voiture gère ELLE-MÊME son propre changement d'état
        maVoiture.afficherEtat();
    }
}
```

La différence clé : dans l'approche procédurale, n'importe quelle fonction du programme pourrait modifier `vitesse` de façon incohérente (par exemple, la rendre négative). Dans l'approche orientée objet, c'est la méthode `accelerer()` de `Voiture` elle-même qui contrôle **comment** son propre état peut changer — un principe qui deviendra central au chapitre 4 (Encapsulation).

## 1.4 Les avantages concrets de la POO

- **Modularité** : chaque classe est une unité autonome, développable et testable séparément.
- **Réutilisabilité** : une classe bien conçue (`Voiture`, `CompteBancaire`) se réutilise dans plusieurs programmes sans modification, et via l'héritage (chapitre 5), sans duplication de code.
- **Maintenabilité** : un bug localisé dans le comportement `accelerer()` se corrige à un seul endroit (la classe `Voiture`), pas dans toutes les fonctions qui manipulaient la vitesse.
- **Extensibilité** : ajouter un nouveau type de véhicule (`VoitureElectrique`) qui réutilise et étend le comportement existant est naturel avec l'héritage et le polymorphisme (chapitres 5-6).
- **Modélisation naturelle du monde réel** : les concepts métier (Client, Compte, Commande, Étudiant) se traduisent directement en classes, facilitant la communication entre développeurs et experts du domaine métier.

## 1.5 Les quatre principes fondamentaux de la POO

Ce manuel consacre un chapitre entier (ou plus) à chacun de ces quatre piliers ; cette section n'en donne qu'un aperçu, à relier aux chapitres correspondants.

1. **Encapsulation** (chapitre 4) : regrouper données et comportements, et **protéger** l'accès direct aux données internes d'un objet (via des attributs privés et des méthodes d'accès contrôlées).
2. **Héritage** (chapitre 5) : permettre à une classe de **réutiliser et d'étendre** le comportement d'une autre classe, évitant la duplication de code.
3. **Polymorphisme** (chapitre 6) : permettre à des objets de types différents de répondre différemment à un **même appel de méthode**, selon leur type réel.
4. **Abstraction** (chapitre 7) : ne montrer que l'**essentiel** d'un objet (ce qu'il fait), en cachant les détails de **comment** il le fait.

<div class="encadre astuce">
<span class="encadre-titre">💡 Moyen mnémotechnique : E.H.P.A.</span>
**E**ncapsulation, **H**éritage, **P**olymorphisme, **A**bstraction — les quatre piliers, dans l'ordre où ce manuel les enseigne (chapitres 4 à 7), après avoir posé les bases indispensables (classes, objets, constructeurs) aux chapitres 2 et 3.
</div>

## 1.6 Premier diagramme UML : la notation utilisée dans ce manuel

Le chapitre 18 détaillera la notation UML complète. Voici, dès maintenant, la structure de base d'un diagramme de classe en texte, utilisée dans tout le manuel :

**Diagramme de classe — Voiture**

```{.uml}
┌─────────────────────────────┐
│           Voiture            │
├─────────────────────────────┤
│ - modele : String            │
│ - vitesse : double           │
│ - essence : double           │
├─────────────────────────────┤
│ + accelerer(increment: double): void │
│ + afficherEtat(): void       │
└─────────────────────────────┘
```

- La partie du haut donne le **nom de la classe**.
- La partie du milieu liste les **attributs** (`- nom : Type`, le `-` signifiant "privé", vu au chapitre 10).
- La partie du bas liste les **méthodes** (`+ nom(paramètres): typeDeRetour`, le `+` signifiant "public").

## 1.7 Erreurs fréquentes à ce stade

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Croire que la POO élimine le besoin de fonctions</span>
La POO ne supprime pas les fonctions : elle les **renomme méthodes** et les **rattache** à une classe précise. `accelerer()` reste fondamentalement une fonction ; la différence est qu'elle n'existe que dans le contexte d'un objet `Voiture` précis, et agit sur les données de **cet** objet particulier.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Penser qu'il faut absolument tout modéliser en objets dès le départ</span>
Un piège classique de débutant est de vouloir créer une classe pour absolument tout, y compris des calculs simples et isolés sans état à conserver. La POO organise le code qui gère un **état** (des données qui persistent et évoluent) ; un simple calcul mathématique sans état associé (`Math.sqrt(x)`) n'a pas besoin d'être "objetisé".
</div>

## 1.8 Résumé du chapitre

- La POO organise le code autour d'**objets** regroupant données (attributs) et comportements (méthodes), par opposition à la programmation procédurale qui les sépare.
- Née avec Simula 67, généralisée par Smalltalk, popularisée par C++ et Java.
- Avantages principaux : modularité, réutilisabilité, maintenabilité, extensibilité, modélisation naturelle du métier.
- Quatre piliers fondamentaux : **E**ncapsulation, **H**éritage, **P**olymorphisme, **A**bstraction — détaillés aux chapitres 4 à 7.
- Un diagramme de classe UML (notation texte de ce manuel) présente nom, attributs et méthodes d'une classe.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Pour chacun des éléments suivants d'une application de gestion scolaire, indique s'il ferait un bon "objet" (donnée + comportement qui évoluent ensemble) ou non, en justifiant : (a) un Étudiant, (b) le calcul d'une moyenne à partir de deux notes, (c) une Salle de classe, (d) l'affichage d'un message de bienvenue au démarrage du programme.
</div>

**Corrigé :**
(a) **Bon objet** — un étudiant a un état (nom, notes, classe) qui évolue dans le temps et des comportements associés (s'inscrire à un cours, consulter son bulletin).
(b) **Pas un objet** — un simple calcul sans état à conserver ; une méthode utilitaire suffit (éventuellement une méthode statique, chapitre 11).
(c) **Bon objet** — une salle a un état (capacité, occupants actuels, équipements) et des comportements (réserver, libérer).
(d) **Pas un objet** — une action ponctuelle sans état, une simple instruction ou méthode `main` suffit.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>

Réécris en pseudo-code orienté objet (nom de classe + liste d'attributs + liste de méthodes, comme en section 1.6) le concept de "Livre" dans une bibliothèque, avec au moins 3 attributs et 2 méthodes cohérentes.
</div>

**Corrigé :**

**Diagramme de classe — Livre**

```{.uml}
┌─────────────────────────────┐
│            Livre              │
├─────────────────────────────┤
│ - titre : String              │
│ - auteur : String             │
│ - disponible : boolean        │
├─────────────────────────────┤
│ + emprunter(): void           │
│ + retourner(): void           │
└─────────────────────────────┘
```

*Chapitre suivant : les classes et les objets, la première brique concrète de tout programme Java orienté objet.*
