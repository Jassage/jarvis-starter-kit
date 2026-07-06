<div class="chapitre-titre-num">CHAPITRE 10</div>

# Les modificateurs d'accès

## Objectifs pédagogiques

Maîtriser les quatre niveaux de visibilité Java (`public`, `protected`, package-private, `private`) et savoir choisir le bon niveau selon l'intention de conception.

## 10.1 Les quatre niveaux, du plus ouvert au plus restrictif

| Modificateur | Même classe | Même package | Classe fille (autre package) | Partout ailleurs |
|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| *(aucun, package-private)* | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

## 10.2 private : le plus restrictif

```java
public class CompteBancaire {
    private double solde; // accessible SEULEMENT à l'intérieur de CompteBancaire

    private void journaliser(String message) { // méthode utilitaire interne, jamais exposée
        System.out.println("[LOG] " + message);
    }

    public void deposer(double montant) {
        solde += montant;
        journaliser("Dépôt de " + montant); // accessible ici : même classe
    }
}
```

`private` est le niveau par défaut recommandé pour **tout** attribut (rappel de l'encapsulation, chapitre 4) et pour toute méthode qui n'est qu'un détail d'implémentation interne, sans intérêt pour le code extérieur.

## 10.3 public : accessible de partout

```java
public class CompteBancaire {
    public void deposer(double montant) { // fait partie du contrat public de la classe
        // ...
    }
}
```

Réservé aux éléments qui constituent le **contrat officiel** de la classe : ce que n'importe quel autre code, dans n'importe quel package, est censé pouvoir utiliser légitimement.

## 10.4 package-private (aucun modificateur) : visible dans le même package uniquement

```java
package com.ecole.service;

class ValidateurInterne { // pas de modificateur : visible seulement dans com.ecole.service
    static boolean estValide(String email) {
        return email.contains("@");
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Cas d'usage typique du package-private</span>
Utile pour des classes ou méthodes qui doivent être partagées **entre plusieurs classes d'un même module** (par exemple, plusieurs classes DAO d'un même package qui partagent une classe utilitaire de connexion, chapitre 30), sans pour autant vouloir les exposer au reste de l'application.
</div>

## 10.5 protected : accessible aux classes filles, même hors du package

```java
package com.ecole.modele;

public class Personne {
    protected String nom; // accessible aux classes filles, même dans un AUTRE package

    protected void afficherInfosBase() {
        System.out.println("Nom : " + nom);
    }
}
```

```java
package com.ecole.modele.specialise; // package DIFFÉRENT de Personne

import com.ecole.modele.Personne;

public class Etudiant extends Personne {
    void exemple() {
        System.out.println(nom); // ✅ accessible : Etudiant est une classe FILLE de Personne
    }
}
```

`protected` est essentiellement pensé pour l'héritage (chapitre 5) : les attributs et méthodes qu'une classe mère veut partager avec ses classes filles, sans les rendre `public` pour autant.

## 10.6 Diagramme UML et modificateurs d'accès

Rappel du chapitre 4 : la notation UML utilise des symboles précis pour chaque niveau.

**Symboles UML de visibilité**

```{.uml}
+ public
- private
# protected
~ package-private (parfois omis ou noté "~")

┌─────────────────────────────┐
│           Personne              │
├─────────────────────────────┤
│ # nom : String                  │
│ - numeroSecuriteSociale : String │
├─────────────────────────────┤
│ + Personne(nom: String)         │
│ # afficherInfosBase(): void     │
└─────────────────────────────┘
```

## 10.7 Modificateurs sur les classes elles-mêmes

```java
public class Etudiant { }   // accessible depuis n'importe quel package

class UtilitaireInterne { } // package-private : accessible seulement dans son propre package
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une classe top-level ne peut JAMAIS être private ou protected</span>
```java
private class MaClasse { } // ❌ Erreur de compilation
```
Seules les classes **imbriquées** (chapitre 11) peuvent être `private` ou `protected`. Une classe de premier niveau (un fichier `.java` à la racine d'un package) ne peut être que `public` ou package-private (sans modificateur).
</div>

## 10.8 Principe de conception : le plus restrictif possible par défaut

<div class="encadre astuce">
<span class="encadre-titre">💡 Règle professionnelle : commencer par private, n'élargir qu'en cas de besoin réel</span>
La bonne pratique consiste à déclarer **systématiquement** tout nouvel attribut/méthode au niveau le plus restrictif possible (`private`), et à **n'élargir** la visibilité (`protected`, puis `public`) que lorsqu'un besoin concret et identifié l'exige. L'inverse — tout mettre `public` "au cas où" — expose inutilement les détails d'implémentation, rendant la classe plus fragile face à des changements internes futurs (rappel des avantages de l'encapsulation, chapitre 4).
</div>

## 10.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rendre protected un attribut qui devrait rester private</span>
```java
public class CompteBancaire {
    protected double solde; // ⚠️ accessible à TOUTE classe fille, même dans un package externe non maîtrisé
}
```
Si aucune classe fille n'a réellement besoin d'accéder directement à `solde` (et qu'un getter/setter suffit, chapitre 4), `protected` expose inutilement l'attribut à un risque de modification incohérente depuis n'importe quelle classe fille future, y compris écrite par une autre équipe.
</div>

## 10.10 Résumé du chapitre

- Quatre niveaux : `private` (même classe) < *package-private* (même package) < `protected` (+ classes filles) < `public` (partout).
- `private` par défaut pour les attributs et détails d'implémentation ; `public` réservé au contrat officiel de la classe.
- `protected` est pensé pour le partage avec les classes filles, y compris dans d'autres packages.
- Une classe top-level ne peut jamais être `private`/`protected` — seules les classes imbriquées (chapitre 11) le peuvent.
- Principe de conception : partir du plus restrictif, élargir seulement si un besoin réel apparaît.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Pour chacun des éléments suivants d'une classe `Employe`, propose le modificateur d'accès le plus approprié et justifie : (a) l'attribut `salaire`, (b) une méthode `calculerPrime()` appelée uniquement par les classes filles `EmployeCommission`/`EmployeHoraire`, (c) une méthode `getNom()`, (d) une classe utilitaire `ValidateurSalaire` utilisée seulement par d'autres classes du même package `service`.
</div>

**Corrigé :**
(a) `private` — donnée sensible, doit passer par un getter/setter validé (chapitre 4).
(b) `protected` — destinée aux classes filles, potentiellement dans d'autres packages.
(c) `public` — fait partie du contrat officiel de consultation de la classe.
(d) *package-private* (aucun modificateur) — utilisée uniquement à l'intérieur du package `service`, pas besoin d'exposition plus large.

*Chapitre suivant : les classes spéciales (finale, statique, interne, anonyme), pour des besoins de conception plus spécifiques.*
