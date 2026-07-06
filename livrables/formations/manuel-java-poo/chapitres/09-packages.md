<div class="chapitre-titre-num">CHAPITRE 9</div>

# Les packages

## Objectifs pédagogiques

Comprendre à quoi servent les packages, savoir en créer et en importer, et connaître l'organisation standard d'un projet Java professionnel.

## 9.1 Le problème résolu par les packages

Sans organisation, toutes les classes d'un projet vivraient dans un même espace : deux classes différentes ne pourraient jamais porter le même nom (une classe `Client` d'un module facturation entrerait en conflit avec une classe `Client` d'un module CRM), et retrouver une classe dans un projet de centaines de fichiers deviendrait vite ingérable.

Un **package** est un espace de noms qui regroupe des classes apparentées, à la fois pour éviter les conflits de noms et pour organiser logiquement le code — l'équivalent Java des dossiers `components/`, `services/` vus dans d'autres écosystèmes.

## 9.2 Déclarer un package

```java
// Fichier : src/com/ecole/modele/Etudiant.java
package com.ecole.modele; // DOIT être la toute première ligne du fichier (avant même les imports)

public class Etudiant {
    private String nom;
    // ...
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le chemin du fichier doit correspondre exactement au nom du package</span>
Une classe déclarée `package com.ecole.modele;` **doit** être physiquement située dans un dossier `com/ecole/modele/` (chaque point du nom de package correspond à un niveau de dossier). Le compilateur Java **impose** cette correspondance stricte entre l'arborescence de fichiers et la déclaration de package.
</div>

## 9.3 Convention de nommage des packages

<div class="encadre astuce">
<span class="encadre-titre">💡 Convention universelle : le nom de domaine inversé</span>
Par convention (respectée dans toute l'industrie Java), un package commence par le nom de domaine de l'organisation **inversé**, en minuscules : une entreprise possédant `monentreprise.com` nommera ses packages `com.monentreprise.nomduprojet...`. Cette convention garantit l'unicité des noms de packages même entre projets et organisations différentes.
</div>

```
com.jaslin.minicours.modele
com.jaslin.minicours.service
com.jaslin.minicours.dao
```

## 9.4 Importer une classe d'un autre package

```java
// Fichier : src/com/ecole/service/InscriptionService.java
package com.ecole.service;

import com.ecole.modele.Etudiant; // importe la classe Etudiant du package com.ecole.modele

public class InscriptionService {
    public void inscrire(Etudiant etudiant) {
        System.out.println(etudiant.getNom() + " inscrit avec succès.");
    }
}
```

```java
import com.ecole.modele.*; // importe TOUTES les classes publiques du package (à utiliser avec discernement)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'import "étoile" (*) nuit à la lisibilité, même s'il compile sans erreur</span>
`import com.ecole.modele.*;` fonctionne, mais rend moins évident, à la lecture du fichier, quelles classes précises sont réellement utilisées. La plupart des équipes et des IDE (comme IntelliJ) préfèrent des imports explicites, un par classe, souvent générés/nettoyés automatiquement par l'éditeur.
</div>

## 9.5 java.lang : le seul package importé automatiquement

```java
String s = "Bonjour"; // String vit dans java.lang — AUCUN import nécessaire
System.out.println(s); // System vit aussi dans java.lang
```

Toutes les autres classes de la bibliothèque standard (`ArrayList` dans `java.util`, `LocalDate` dans `java.time`) nécessitent un import explicite, à l'exception du package `java.lang`, importé implicitement dans **tout** fichier Java.

## 9.6 Organisation standard d'un projet Java (Maven/Gradle)

```
mon-projet/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/jaslin/minicours/
│   │   │       ├── modele/          # classes représentant les données métier (Etudiant, Cours...)
│   │   │       ├── dao/             # accès aux données (chapitre 30)
│   │   │       ├── service/         # logique métier
│   │   │       ├── util/            # classes utilitaires (formatage, validation...)
│   │   │       └── Application.java # point d'entrée (méthode main)
│   │   └── resources/               # fichiers de configuration (.properties, etc.)
│   └── test/
│       └── java/                    # tests, même arborescence de packages que main/java
├── pom.xml                          # configuration Maven (dépendances, build)
└── README.md
```

<div class="encadre astuce">
<span class="encadre-titre">💡 src/main/java vs src/test/java : la convention Maven</span>
Cette structure (dite "Maven Standard Directory Layout", reprise aussi par Gradle) sépare strictement le code de production (`src/main/java`) du code de test (`src/test/java`), tout en gardant la même arborescence de packages entre les deux — une classe `com.jaslin.minicours.service.InscriptionService` et son test `com.jaslin.minicours.service.InscriptionServiceTest` vivent dans la même structure de dossiers, sous des racines différentes.
</div>

## 9.7 Visibilité par défaut et packages (aperçu avant le chapitre 10)

```java
package com.ecole.modele;

class UtilitaireInterne { // pas de "public" : visible SEULEMENT dans le package com.ecole.modele
    static void log(String message) {
        System.out.println("[LOG] " + message);
    }
}
```

Une classe (ou méthode) sans modificateur d'accès explicite est visible uniquement **à l'intérieur de son propre package** — un mécanisme détaillé au chapitre 10, qui permet de cacher des détails d'implémentation internes à un module tout en exposant seulement ce qui doit l'être publiquement.

## 9.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier package en première ligne, ou le placer après un import</span>
```java
import java.util.List;
package com.ecole.modele; // ❌ Erreur de compilation : package doit précéder tout import
```
La déclaration `package` doit toujours être la **toute première** ligne de code du fichier (les commentaires peuvent la précéder, mais aucun `import` ni déclaration de classe).
</div>

## 9.9 Résumé du chapitre

- Un package regroupe des classes apparentées, évite les conflits de noms, et organise le code par domaine.
- La déclaration `package` doit être la première ligne du fichier ; le chemin physique du fichier doit correspondre exactement au nom du package.
- La convention de nommage utilise le nom de domaine inversé (`com.entreprise.projet...`).
- Seul `java.lang` est importé automatiquement ; tout le reste nécessite un `import` explicite.
- La structure Maven/Gradle standard (`modele`, `dao`, `service`, `util`) est reprise tout au long des projets de ce manuel (chapitres 23 et 31).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 9.1</span>

Propose une organisation en packages pour un projet de gestion d'hôpital comprenant : des classes de données (`Patient`, `Medecin`, `Consultation`), une logique de planification de rendez-vous, et des utilitaires de calcul de dates.
</div>

**Corrigé :**
```
com.jaslin.hopital.modele       → Patient, Medecin, Consultation
com.jaslin.hopital.service      → PlanificationService
com.jaslin.hopital.util         → UtilitaireDate
```

*Chapitre suivant : les modificateurs d'accès, pour contrôler précisément la visibilité de chaque élément d'une classe.*
