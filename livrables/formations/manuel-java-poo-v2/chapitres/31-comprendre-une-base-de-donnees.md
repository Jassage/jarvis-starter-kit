<div class="chapitre-titre-num">CHAPITRE 31</div>

# Comprendre une base de données

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras ce qu'est une base de données relationnelle, et tu connaîtras le vocabulaire de base : table, colonne, ligne, clé primaire, clé étrangère, relation.

## A. Le problème

Le chapitre 24 a montré comment écrire des données dans un fichier texte. Mais un fichier texte a de sérieuses limites : rien n'empêche d'y écrire n'importe quoi (une ligne malformée), rechercher une information précise oblige à tout relire ligne par ligne, et plusieurs programmes qui écrivent en même temps dans le même fichier peuvent facilement se marcher dessus. Une vraie application professionnelle (banque, école, boutique) a besoin d'un outil bien plus robuste.

## B. Exemple de la vie réelle

Pense à un classeur de bureau, avec plusieurs intercalaires, chacun dédié à une catégorie précise (un intercalaire "Clients", un intercalaire "Commandes"). À l'intérieur de chaque intercalaire, des fiches toutes construites sur le **même modèle** (les mêmes champs : nom, adresse, téléphone), une fiche par personne. C'est exactement l'organisation d'une base de données relationnelle.

## C. Explication très simple

> Une **base de données** est un système organisé qui stocke des informations de façon structurée, durable, et interrogeable rapidement — bien au-delà de ce qu'un simple fichier texte permet.

## Le vocabulaire essentiel

```{.uml}
BASE DE DONNÉES
      │
      └── TABLE ("Etudiants")            ← un intercalaire du classeur
              │
              ├── COLONNE ("nom")         ← un champ commun à toutes les fiches
              ├── COLONNE ("age")
              ├── COLONNE ("moyenne")
              │
              └── LIGNE                    ← une fiche précise
                    (1, "Jaslin", 22, 16.5)
                    (2, "Marie", 20, 14.0)
```

- Une **table** regroupe toutes les données d'un même type de chose (tous les étudiants, tous les produits).
- Une **colonne** définit un champ précis, commun à toutes les lignes de la table (`nom`, `age`).
- Une **ligne** (ou **enregistrement**) représente une entrée précise (un étudiant précis).

## La clé primaire

```{.uml}
Table Etudiants
┌────┬────────┬─────┬─────────┐
│ id │  nom   │ age │ moyenne │
├────┼────────┼─────┼─────────┤
│ 1  │ Jaslin │ 22  │ 16.5    │  ← id = CLÉ PRIMAIRE : identifie CETTE
│ 2  │ Marie  │ 20  │ 14.0    │    ligne, de façon UNIQUE, pour toujours
└────┴────────┴─────┴─────────┘
```

> La **clé primaire** est une colonne (souvent nommée `id`) dont la valeur est **unique** pour chaque ligne d'une table, et sert à l'identifier de façon fiable et permanente.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi jamais utiliser le nom comme clé primaire</span>
Deux étudiants pourraient légitimement s'appeler "Jaslin" tous les deux. Une clé primaire (généralement un simple nombre entier, auto-généré par la base de données elle-même) évite ce piège en garantissant l'unicité par construction, indépendamment de toute donnée métier qui pourrait, elle, se répéter.
</div>

## La clé étrangère et les relations

```{.uml}
Table Etudiants                    Table Inscriptions
┌────┬────────┐                    ┌────┬─────────────┬───────────┐
│ id │  nom   │                    │ id │ etudiant_id │ cours     │
├────┼────────┤                    ├────┼─────────────┼───────────┤
│ 1  │ Jaslin │ ◄──────────────────┤ 1  │     1       │ Java      │
│ 2  │ Marie  │ ◄──────┐           │ 2  │     2       │ SQL       │
└────┴────────┘         └──────────┤ 3  │     2       │ Java      │
                                    └────┴─────────────┴───────────┘
                                            │
                                            └─ CLÉ ÉTRANGÈRE : pointe
                                               vers l'id d'une ligne
                                               de la table Etudiants
```

> Une **clé étrangère** est une colonne d'une table qui référence la clé primaire d'une **autre** table, créant ainsi une **relation** entre les deux — exactement le même principe que l'association du chapitre 16, mais appliqué aux données stockées, pas aux objets en mémoire.

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Relation un-à-plusieurs (1-N)</span>
Dans l'exemple ci-dessus, UN étudiant peut avoir PLUSIEURS inscriptions (Marie est inscrite à SQL et à Java), mais chaque inscription ne concerne qu'UN SEUL étudiant. C'est une <strong>relation un-à-plusieurs</strong> (1-N), la plus courante de toutes — exactement le pendant, côté base de données, de la relation Client/Commande du chapitre 16 et 17.
</div>

## Erreurs fréquentes (conceptuelles)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Dupliquer une information au lieu de la relier</span>

```text
❌ Table Inscriptions avec une colonne "nom_etudiant" en TEXTE, répétée
   à chaque ligne, au lieu d'un "etudiant_id" pointant vers la table Etudiants.
```

Si Marie change de nom (mariage, correction d'orthographe), il faudrait retrouver et corriger **chaque** ligne où son nom apparaît en texte. Avec une clé étrangère, la correction se fait **une seule fois**, dans la table `Etudiants`, et toutes les inscriptions restent automatiquement à jour puisqu'elles ne stockent qu'une référence (`etudiant_id`), jamais une copie du nom.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre "table" et "base de données"</span>

Une base de données peut contenir **plusieurs** tables (Étudiants, Cours, Inscriptions, Professeurs...), toutes reliées entre elles. Une table seule n'est qu'**une pièce** du système complet, pas le système entier.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je connais le vocabulaire : base de données, table, colonne, ligne.
✓ Je comprends le rôle d'une clé primaire : identifier une ligne de
  façon unique et permanente.
✓ Je comprends le rôle d'une clé étrangère : relier une ligne d'une
  table à une ligne d'une autre table.
✓ Je sais pourquoi dupliquer une donnée est une mauvaise pratique,
  plutôt que de la relier par clé étrangère.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Pour une table `Produits` (id, nom, prix) et une table `Commandes` (id, produit_id, quantite), quelle colonne est la clé étrangère, et vers quelle colonne pointe-t-elle ?
</div>

## Correction

`produit_id`, dans la table `Commandes`, est la clé étrangère : elle pointe vers la colonne `id` (la clé primaire) de la table `Produits`, reliant chaque commande au produit concerné, sans jamais dupliquer son nom ou son prix directement dans `Commandes`.

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Dessine (en texte, comme dans ce chapitre) la structure de deux tables pour un système de bibliothèque : `Livres` (id, titre, disponible) et `Emprunts` (id, livre_id, nom_emprunteur, date_retour). Identifie clairement la clé primaire de chaque table, et la clé étrangère qui les relie.
</div>

### Corrigé du défi

```{.uml}
Table Livres                       Table Emprunts
┌────┬──────────────┬────────────┐  ┌────┬──────────┬─────────────────┬─────────────┐
│ id │    titre       │ disponible │  │ id │ livre_id │ nom_emprunteur   │ date_retour │
├────┼──────────────┼────────────┤  ├────┼──────────┼─────────────────┼─────────────┤
│ 1  │ Le Petit Prince│   false    │◄─┤ 1  │    1     │ Jaslin           │ 2026-09-01  │
│ 2  │ 1984           │   true     │  └────┴──────────┴─────────────────┴─────────────┘
└────┴──────────────┴────────────┘

Clé primaire de Livres : id
Clé primaire de Emprunts : id
Clé étrangère : Emprunts.livre_id → Livres.id
```

## Résumé du chapitre

- Une **base de données** organise des informations en tables, bien plus robuste et rapide à interroger qu'un simple fichier texte.
- Une **table** regroupe des lignes construites sur les mêmes colonnes ; une **ligne** est une entrée précise.
- La **clé primaire** identifie chaque ligne de façon unique et permanente (souvent un simple identifiant numérique).
- La **clé étrangère** relie une ligne d'une table à une ligne d'une autre table, évitant toute duplication d'information.
- La relation un-à-plusieurs (1-N) est la plus courante : un étudiant peut avoir plusieurs inscriptions, chaque inscription n'appartenant qu'à un seul étudiant.

---

## Exercices de fin de chapitre

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 1 — Facile</span>

Vrai ou faux : une base de données ne peut contenir qu'une seule table.
</div>

**Corrigé :** Faux. Une base de données contient généralement plusieurs tables, reliées entre elles par des clés étrangères.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 2 — Intermédiaire</span>

Pourquoi est-il déconseillé de stocker directement le nom du professeur dans chaque ligne de la table `Cours`, plutôt qu'un `professeur_id` ?
</div>

**Corrigé :** Si le nom du professeur change (correction d'orthographe, mariage), il faudrait retrouver et corriger manuellement chaque ligne de `Cours` où il apparaît. Avec `professeur_id`, la correction se fait une seule fois dans la table `Professeurs`, et tous les cours restent automatiquement cohérents.

<div class="encadre exercice">
<span class="encadre-titre">📝 Niveau 3 — Défi</span>

Pour un système hospitalier avec `Patients` (id, nom), `Medecins` (id, nom) et `Consultations` (id, patient_id, medecin_id, date), explique en une phrase pourquoi `Consultations` a besoin de **deux** clés étrangères, et non une seule.
</div>

**Corrigé :** Une consultation implique **deux** entités distinctes en relation simultanée : le patient qui consulte, et le médecin qui reçoit. Chacune de ces relations nécessite sa propre clé étrangère (`patient_id` vers `Patients`, `medecin_id` vers `Medecins`) pour être correctement représentée — une seule clé étrangère ne pourrait relier la consultation qu'à une seule des deux entités, perdant la moitié de l'information essentielle.

---

*Chapitre suivant : SQL, le langage qui permet de réellement interroger et manipuler les données d'une base de données.*
