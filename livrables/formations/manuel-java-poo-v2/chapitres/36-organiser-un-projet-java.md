<div class="chapitre-titre-num">CHAPITRE 36</div>

# Organiser un projet Java

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras structurer un projet Java en dossiers clairs, chacun avec une responsabilité précise, plutôt que d'entasser toutes les classes ensemble.

## A. Le problème

Jusqu'ici, la plupart des exemples de ce manuel plaçaient toutes les classes dans un seul fichier, ou dans un seul dossier indistinct. Sur un vrai projet de plusieurs dizaines de classes (modèles, DAO, services, exceptions personnalisées...), retrouver un fichier précis devient vite pénible sans organisation claire.

## B. Exemple de la vie réelle

Pense à une maison bien organisée : la cuisine contient les ustensiles de cuisine, la chambre contient les vêtements, le garage contient les outils. Chercher une casserole dans le garage n'aurait aucun sens. Un projet Java bien structuré applique exactement ce principe : chaque type de fichier a son propre "dossier logique".

## C. Explication très simple

> Organiser un projet Java consiste à ranger les classes dans des **packages** (des dossiers) selon leur **rôle** dans l'application, pas selon un ordre arbitraire.

## D. Une structure de projet standard

```{.uml}
src/
 ├── model/         → les classes "données" (Etudiant, Produit, CompteBancaire...)
 ├── dao/            → l'accès aux données (chapitre 35 : EtudiantDAO, ProduitDAO...)
 ├── service/        → la logique métier (calculs, règles, orchestration)
 ├── exception/      → les exceptions personnalisées (chapitre 23)
 ├── config/         → la configuration (connexion base de données, paramètres)
 └── ui/             → l'interface utilisateur (menus, affichage, saisie)
```

## E. Explication : le rôle de chaque dossier

```{.uml}
model/        → CE QUE l'application manipule : Etudiant, Produit, Commande.
                 Des classes simples, sans logique complexe (chapitre 9-11).

dao/          → COMMENT accéder aux données : lire/écrire en base de
                 données (chapitre 35). Ne contient JAMAIS de règle métier.

service/      → CE QUE l'application FAIT réellement : les règles
                 métier (un étudiant peut-il s'inscrire ? un compte
                 peut-il retirer tel montant ?), en s'appuyant sur les
                 DAO pour les données.

exception/    → Les erreurs métier propres à l'application (chapitre 23).

config/       → Les détails techniques de configuration (URL de base
                 de données, clés, paramètres) — isolés du reste du
                 code pour être facilement modifiables sans toucher à
                 la logique.

ui/           → Ce que voit et manipule l'utilisateur final (menu
                 texte console, ou interface graphique).
```

## F. Exemple concret : les packages Java

En Java, chaque dossier correspond à un **package**, déclaré en première ligne de chaque fichier :

```java
// Fichier : src/model/Etudiant.java
package model;

public class Etudiant {
    private String nom;
    private double moyenne;
    // ...
}
```

```java
// Fichier : src/dao/EtudiantDAO.java
package dao;

import model.Etudiant; // importer une classe d'un AUTRE package

public class EtudiantDAO {
    public void sauvegarder(Etudiant etudiant) {
        // ...
    }
}
```

```java
// Fichier : src/service/InscriptionService.java
package service;

import model.Etudiant;
import dao.EtudiantDAO;
import exception.PlaceIndisponibleException;

public class InscriptionService {
    private EtudiantDAO etudiantDAO;

    public InscriptionService(EtudiantDAO etudiantDAO) {
        this.etudiantDAO = etudiantDAO;
    }

    public void inscrire(Etudiant etudiant) throws PlaceIndisponibleException {
        // règle métier : vérifications, puis délégation au DAO
        etudiantDAO.sauvegarder(etudiant);
    }
}
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Package</span>
Un <strong>package</strong> est l'équivalent Java d'un dossier : il regroupe des classes liées, et évite les conflits de noms entre deux classes portant le même nom mais appartenant à des concepts différents (deux classes <code>Facture</code> dans deux modules distincts, par exemple). La déclaration <code>package nomDuDossier;</code> doit être la toute première ligne (hors commentaires) de chaque fichier <code>.java</code>, et doit correspondre exactement à l'emplacement réel du fichier sur le disque.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 La règle générale : chaque classe a UNE responsabilité</span>
Cette organisation en dossiers reflète un principe plus profond, qui sera formalisé au chapitre 44 (SOLID) sous le nom de <strong>responsabilité unique</strong> : chaque classe (et chaque package) ne devrait avoir qu'une seule raison de changer. Un modèle change si la donnée métier change ; un DAO change si la base de données change ; un service change si une règle métier change — rarement, voire jamais, pour la même raison en même temps.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Mélanger les responsabilités dans une seule classe</span>

```java
public class Etudiant { // ❌ un "model" qui fait tout : données, JDBC, ET affichage
    private String nom;

    public void sauvegarderEnBase() { /* SQL ici ??? */ }
    public void afficherMenu() { /* interface utilisateur ici ??? */ }
}
```

Une classe `Etudiant` (modèle) ne devrait jamais contenir de SQL (rôle du DAO) ni de logique d'affichage (rôle de l'interface). Ce mélange rend le code difficile à faire évoluer indépendamment.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Package qui ne correspond pas au dossier réel</span>

```java
// Fichier physiquement situé dans src/dao/EtudiantDAO.java
package model; // ❌ erreur de compilation : ne correspond pas au dossier réel !
```

La déclaration `package` doit refléter **exactement** l'emplacement physique du fichier sur le disque, sous peine d'erreur de compilation.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais structurer un projet en dossiers model/dao/service/exception/config/ui.
✓ Je comprends le rôle précis de chaque dossier.
✓ Je sais déclarer un package et importer une classe d'un autre package.
✓ Je sais qu'une classe ne devrait avoir qu'une seule responsabilité claire.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Dans quel dossier ranger chacune de ces classes : (a) `CompteBancaire` (attributs, getters/setters), (b) `CompteBancaireDAO` (SQL), (c) `VirementService` (règles de virement), (d) `SoldeInsuffisantException` ?
</div>

## Correction

(a) `model/` — c'est une donnée métier simple. (b) `dao/` — c'est de l'accès aux données. (c) `service/` — c'est de la logique métier. (d) `exception/` — c'est une exception personnalisée.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Pour une application de bibliothèque, propose une répartition en packages pour ces 6 classes : `Livre`, `LivreDAO`, `EmpruntService`, `LivreIndisponibleException`, `ParametresApplication` (URL base de données), `MenuConsole`.
</div>

### Corrigé du défi

```{.uml}
model/       → Livre
dao/         → LivreDAO
service/     → EmpruntService
exception/   → LivreIndisponibleException
config/      → ParametresApplication
ui/          → MenuConsole
```

## Résumé du chapitre

- Un projet Java bien organisé range ses classes en **packages** (dossiers), selon leur **rôle** : model, dao, service, exception, config, ui.
- `model/` : les données ; `dao/` : l'accès aux données ; `service/` : la logique métier ; `ui/` : l'interface.
- La déclaration `package` doit correspondre exactement à l'emplacement réel du fichier.
- Chaque classe ne devrait avoir qu'une seule responsabilité claire, sans mélanger données, accès aux données et affichage.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Dans quel dossier ranger une classe `ConnexionBaseDeDonnees` qui centralise l'URL et les identifiants JDBC ?
</div>

**Corrigé :** `config/`, puisqu'elle centralise des détails de configuration technique.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Explique en une phrase pourquoi une classe `Etudiant` (model) ne devrait jamais contenir directement de code JDBC.
</div>

**Corrigé :** Parce que mélanger la donnée métier et l'accès à la base de données rend le code difficile à faire évoluer indépendamment : changer la structure de la base de données obligerait alors à modifier la classe modèle elle-même, alors que ce changement devrait rester isolé dans le DAO.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Une classe `RapportVentesService` a besoin à la fois de `VenteDAO` et de `ProduitDAO` pour construire son rapport. Explique pourquoi ce n'est pas un problème de conception, contrairement à une classe `Vente` (model) qui aurait besoin d'un DAO.
</div>

**Corrigé :** Un **service** est justement conçu pour orchestrer plusieurs sources de données et règles métier ensemble — dépendre de plusieurs DAO fait pleinement partie de son rôle légitime. Un **modèle**, en revanche, ne devrait représenter qu'une donnée simple, sans dépendre d'un DAO : cela mélangerait deux responsabilités (donnée et accès aux données) qui doivent rester séparées.

---

*Chapitre suivant : MVC, un patron d'architecture qui formalise et approfondit cette même idée de séparation des responsabilités.*
