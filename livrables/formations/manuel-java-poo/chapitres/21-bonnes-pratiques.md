<div class="chapitre-titre-num">CHAPITRE 21</div>

# Bonnes pratiques Java

## Objectifs pédagogiques

Consolider les conventions de nommage, l'organisation des packages, la documentation JavaDoc, l'introduction aux tests unitaires, et les principes du Clean Code — la synthèse pratique avant les projets des chapitres 22-23.

## 21.1 Convention de nommage (récapitulatif)

| Élément | Convention | Exemple |
|---|---|---|
| Classe, interface, enum | PascalCase | `CompteBancaire`, `Payable`, `StatutCommande` |
| Méthode, variable, attribut | camelCase | `calculerSolde()`, `nombreDeComptes` |
| Constante (`static final`) | MAJUSCULES_SNAKE_CASE | `TAUX_TVA`, `NOMBRE_MAX_TENTATIVES` |
| Package | tout en minuscules | `com.jaslin.minicours.service` |
| Paramètre de type générique | Une lettre majuscule | `T`, `E`, `K`, `V` |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un nom qui ne respecte pas la casse conventionnelle compile quand même</span>
Java n'impose **aucune** de ces conventions au niveau du compilateur (à l'exception des règles strictes vues au chapitre 2, comme le nom du fichier pour une classe publique) — elles sont respectées par discipline professionnelle et lisibilité collective, pas par contrainte technique. Un code qui les ignore compile et s'exécute, mais sera jugé non professionnel par toute équipe.
</div>

## 21.2 Nommer avec intention

```java
// ❌ Noms non explicites
public class Mgr {
    public void proc(List<Object> l) {
        for (Object o : l) { /* ... */ }
    }
}

// ✅ Noms qui expriment l'INTENTION, sans commentaire nécessaire pour comprendre
public class GestionnaireInscriptions {
    public void traiterInscriptions(List<Etudiant> etudiants) {
        for (Etudiant etudiant : etudiants) { /* ... */ }
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un bon nom élimine le besoin d'un commentaire</span>
`traiterInscriptions(List<Etudiant> etudiants)` n'a besoin d'aucun commentaire pour être compris — le nom **est** la documentation. Un commentaire devient nécessaire quand le "pourquoi" n'est pas évident (une contrainte métier non intuitive, un contournement d'un bug externe), jamais pour pallier un mauvais nom de méthode/variable.
</div>

## 21.3 Organisation des packages (rappel du chapitre 9, en pratique)

```
com.jaslin.minicours/
├── modele/       # Etudiant, Cours, Inscription — les données métier
├── dao/          # EtudiantDAO, CoursDAO — accès aux données (chapitre 30)
├── service/      # InscriptionService, PaiementService — logique métier
├── exception/    # SoldeInsuffisantException et autres exceptions personnalisées (chapitre 12)
├── util/         # ValidateurEmail, FormateurDate — fonctions utilitaires
└── Application.java
```

## 21.4 Documentation JavaDoc

```java
/**
 * Représente un compte bancaire appartenant à un client.
 * Gère les opérations de dépôt et de retrait avec validation des montants.
 *
 * @author Jaslin Occius
 * @version 1.0
 */
public class CompteBancaire {

    /**
     * Dépose un montant sur le compte.
     *
     * @param montant le montant à déposer, doit être strictement positif
     * @throws IllegalArgumentException si le montant est négatif ou nul
     */
    public void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Le montant doit être positif");
        }
        // ...
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 JavaDoc génère une vraie documentation HTML navigable</span>
La commande `javadoc` (fournie avec le JDK) génère, à partir de ces commentaires structurés, un site de documentation HTML complet et navigable — exactement le format de la documentation officielle de la bibliothèque standard Java elle-même, consultée par tout développeur Java au quotidien.
</div>

## 21.5 Introduction aux tests unitaires (JUnit)

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CompteBancaireTest {

    @Test
    void deposerAugmenteLeSolde() {
        CompteBancaire compte = new CompteBancaire("Jaslin", 1000);
        compte.deposer(500);
        assertEquals(1500, compte.getSolde());
    }

    @Test
    void deposerMontantNegatifLeveUneException() {
        CompteBancaire compte = new CompteBancaire("Jaslin", 1000);
        assertThrows(IllegalArgumentException.class, () -> compte.deposer(-100));
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi tester, même sur un petit projet étudiant</span>
Un test unitaire automatisé vérifie **instantanément** qu'une modification du code n'a pas cassé un comportement existant — sans avoir à relancer manuellement le programme et vérifier "à l'œil" à chaque changement. Les projets de ce manuel (chapitres 22-23, 31) gagneraient à inclure de tels tests, même sommaires, sur leur logique métier critique (calculs, validations).
</div>

## 21.6 Refactoring : améliorer sans changer le comportement

```java
// ❌ AVANT : méthode trop longue, mélange plusieurs responsabilités (rappel du SRP, chapitre 19)
public void traiterCommande(Commande commande) {
    if (commande.getArticles().isEmpty()) {
        throw new IllegalArgumentException("Commande vide");
    }
    double total = 0;
    for (Article a : commande.getArticles()) {
        total += a.getPrix() * a.getQuantite();
    }
    if (commande.getClient().getSoldeDu() > 5000) {
        throw new IllegalStateException("Solde dû trop élevé");
    }
    System.out.println("Commande validée : " + total);
}
```

```java
// ✅ APRÈS : refactorisé en petites méthodes, chacune avec un nom qui exprime son intention
public void traiterCommande(Commande commande) {
    validerCommandeNonVide(commande);
    validerSoldeClient(commande.getClient());

    double total = calculerTotal(commande);
    System.out.println("Commande validée : " + total);
}

private void validerCommandeNonVide(Commande commande) {
    if (commande.getArticles().isEmpty()) {
        throw new IllegalArgumentException("Commande vide");
    }
}

private void validerSoldeClient(Client client) {
    if (client.getSoldeDu() > 5000) {
        throw new IllegalStateException("Solde dû trop élevé");
    }
}

private double calculerTotal(Commande commande) {
    double total = 0;
    for (Article a : commande.getArticles()) {
        total += a.getPrix() * a.getQuantite();
    }
    return total;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Le refactoring se fait toujours avec un filet de sécurité</span>
Refactoriser sans tests automatisés (section 21.5) revient à modifier la structure du code **sans garantie** que le comportement reste identique. La pratique professionnelle standard consiste à écrire des tests **avant** de refactoriser un code existant, pour détecter immédiatement toute régression introduite involontairement.
</div>

## 21.7 Principes Clean Code récapitulés

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist Clean Code, à appliquer aux projets des chapitres suivants</span>
- Une méthode devrait tenir sur **un écran**, sans scroll — sinon, elle fait probablement trop de choses (rappel du SRP, chapitre 19).
- Un nom devrait exprimer l'intention, sans nécessiter de commentaire pour l'expliquer.
- Éviter les "nombres magiques" en dur : `if (age >= 18)` devrait devenir `if (age >= AGE_MAJORITE)` avec une constante nommée (chapitre 11).
- Préférer plusieurs petites classes avec une responsabilité claire à une seule classe "fourre-tout".
- Un commentaire explique le **pourquoi**, jamais le **quoi** (que le code bien nommé exprime déjà).
</div>

## 21.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre "ça marche" et "c'est du bon code"</span>
Un code qui compile et produit le bon résultat n'est pas nécessairement un code de qualité professionnelle. La vraie mesure : un autre développeur (ou toi-même, six mois plus tard) peut-il comprendre, modifier et faire évoluer ce code **sans avoir à le réécrire entièrement** ? C'est exactement l'objectif des pratiques de ce chapitre, appliquées concrètement dans les deux projets complets (chapitres 23 et 31).
</div>

## 21.9 Résumé du chapitre

- Les conventions de nommage (PascalCase, camelCase, MAJUSCULES_SNAKE_CASE) ne sont pas imposées par le compilateur mais attendues par toute équipe professionnelle.
- Un bon nom élimine le besoin d'un commentaire ; un commentaire n'a de valeur que pour expliquer un "pourquoi" non évident.
- JavaDoc documente le code de façon structurée et génère une vraie documentation HTML navigable.
- Les tests unitaires (JUnit) garantissent qu'une modification ne casse pas un comportement existant, et sécurisent tout refactoring.
- Le Clean Code vise un code compréhensible et modifiable par d'autres, pas seulement fonctionnel.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

Refactorise cette méthode en respectant le principe qu'une méthode ne devrait faire qu'une seule chose :
```java
public void enregistrerEtudiant(String nom, int age, String email) {
    if (nom == null || nom.isBlank()) throw new IllegalArgumentException("Nom requis");
    if (age < 0 || age > 120) throw new IllegalArgumentException("Âge invalide");
    if (!email.contains("@")) throw new IllegalArgumentException("Email invalide");
    System.out.println("Étudiant enregistré : " + nom);
}
```
</div>

**Corrigé :**
```java
public void enregistrerEtudiant(String nom, int age, String email) {
    validerNom(nom);
    validerAge(age);
    validerEmail(email);
    System.out.println("Étudiant enregistré : " + nom);
}

private void validerNom(String nom) {
    if (nom == null || nom.isBlank()) throw new IllegalArgumentException("Nom requis");
}

private void validerAge(int age) {
    if (age < 0 || age > 120) throw new IllegalArgumentException("Âge invalide");
}

private void validerEmail(String email) {
    if (!email.contains("@")) throw new IllegalArgumentException("Email invalide");
}
```

*Ceci clôt la Partie 7. Chapitre suivant : les exercices pratiques, dix études de cas orientées objet appliquant l'ensemble des notions vues jusqu'ici.*
