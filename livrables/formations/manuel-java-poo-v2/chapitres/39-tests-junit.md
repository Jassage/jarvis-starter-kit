<div class="chapitre-titre-num">CHAPITRE 39</div>

# Pourquoi tester son programme ? (JUnit 5)

## Objectifs pédagogiques

À la fin de ce chapitre, tu comprendras pourquoi écrire des tests automatisés est essentiel, et tu sauras écrire tes premiers tests unitaires avec JUnit 5.

## A. Le problème

Jusqu'ici, chaque exemple de ce manuel a été vérifié en le lançant "à la main", en lisant le résultat affiché dans la console. Cette méthode fonctionne pour un petit programme, mais devient vite intenable sur un vrai projet : à chaque modification, il faudrait relancer et vérifier **manuellement** des dizaines de scénarios, en espérant ne rien oublier ni se tromper en relisant le résultat.

## B. Exemple de la vie réelle

Pense à un contrôle qualité en usine automobile : avant de livrer une voiture, une série de vérifications automatiques et systématiques (freins, airbags, direction) est exécutée, **à chaque fois**, sans jamais faire confiance uniquement à "ça avait l'air de marcher la dernière fois". Un test automatisé joue exactement ce rôle pour un programme.

## C. Explication très simple

> Un **test unitaire** est un petit programme, écrit une fois, qui vérifie **automatiquement** qu'une partie précise du code (souvent une seule méthode) se comporte comme prévu — et qui peut être relancé à volonté, en quelques secondes, à chaque modification du programme.

## D. Premier exemple Java

D'abord, la méthode à tester (déjà vue au chapitre 7) :

```java
static int additionner(int a, int b) {
    return a + b;
}
```

Le test correspondant, avec JUnit 5 :

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculatriceTest {

    @Test
    void additionnerDeuxNombresPositifs() {
        int resultat = additionner(3, 4);
        assertEquals(7, resultat);
    }
}
```

## E. Explication ligne par ligne

```{.uml}
@Test
   │
   └─ Une ANNOTATION (déjà croisée avec @Override, chapitre 12) qui dit
      à JUnit : "cette méthode est un test, exécute-la et vérifie son
      résultat".

void additionnerDeuxNombresPositifs() {
        │
        └─ Convention : un nom de méthode de test EXPLICITE, décrivant
           précisément CE QUI est testé — pas juste "test1".

    int resultat = additionner(3, 4);
    assertEquals(7, resultat);
        │              │        │
        │              │        └─ La valeur RÉELLEMENT obtenue.
        │              └─ La valeur ATTENDUE.
        └─ Une ASSERTION : vérifie que les deux valeurs sont égales.
           Si ce n'est PAS le cas, le test ÉCHOUE immédiatement,
           signalé clairement par JUnit.
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Assertion</span>
Une <strong>assertion</strong> est une vérification explicite qu'une condition doit être vraie. <code>assertEquals(attendu, reel)</code> est la plus courante ; d'autres existent : <code>assertTrue(condition)</code>, <code>assertFalse(condition)</code>, <code>assertNull(valeur)</code>, <code>assertThrows(TypeException.class, () -&gt; ...)</code> (pour vérifier qu'une exception, chapitre 22, est bien levée).
</div>

## F. Deuxième exemple : tester une classe complète, y compris les cas limites

```java
class CompteBancaire {
    private double solde;

    CompteBancaire(double soldeInitial) {
        this.solde = soldeInitial;
    }

    void deposer(double montant) {
        if (montant <= 0) {
            throw new IllegalArgumentException("Montant invalide");
        }
        solde += montant;
    }

    double getSolde() {
        return solde;
    }
}
```

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CompteBancaireTest {

    @Test
    void deposerAugmenteLeSolde() {
        CompteBancaire compte = new CompteBancaire(1000);
        compte.deposer(500);
        assertEquals(1500, compte.getSolde());
    }

    @Test
    void deposerMontantNegatifLeveUneException() {
        CompteBancaire compte = new CompteBancaire(1000);

        assertThrows(IllegalArgumentException.class, () -> {
            compte.deposer(-100);
        });
    }

    @Test
    void soldeInitialEstCorrectementDefini() {
        CompteBancaire compte = new CompteBancaire(2000);
        assertEquals(2000, compte.getSolde());
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Tester aussi les cas limites, pas seulement le "chemin heureux"</span>
Le deuxième test ne vérifie pas qu'un dépôt "normal" fonctionne (déjà couvert par le premier test) : il vérifie qu'un dépôt <strong>invalide</strong> est correctement rejeté. Les meilleurs tests couvrent systématiquement les cas limites et les cas d'erreur, pas seulement le scénario où tout se passe bien — c'est souvent là que se cachent les vrais bugs.
</div>

## Pourquoi tester change vraiment le quotidien d'un développeur

```{.uml}
SANS tests automatisés :
  Modifier le code → relancer manuellement le programme →
  vérifier "à l'œil" chaque scénario → répéter pour CHAQUE
  modification future, en espérant ne rien casser ailleurs

AVEC tests automatisés :
  Modifier le code → relancer TOUS les tests en quelques secondes →
  JUnit signale IMMÉDIATEMENT tout comportement cassé, précisément
  là où ça a cassé
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : Régression</span>
Une <strong>régression</strong> est un bug introduit par une modification censée, en principe, améliorer ou corriger autre chose — un comportement qui fonctionnait avant, et qui se casse sans qu'on s'en aperçoive. Une suite de tests automatisés, relancée à chaque modification, détecte les régressions immédiatement, plutôt que de les découvrir bien plus tard, parfois en production.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Ne tester que le cas où tout se passe bien</span>

```java
@Test
void deposer() {
    CompteBancaire compte = new CompteBancaire(1000);
    compte.deposer(500);
    assertEquals(1500, compte.getSolde());
}
// ❌ et le dépôt d'un montant négatif ? Jamais testé !
```

Un seul test "heureux" ne suffit presque jamais à donner confiance dans le comportement réel d'une méthode. Toujours envisager : les valeurs limites, les valeurs invalides, les cas vides.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Des tests qui dépendent les uns des autres</span>

```java
static CompteBancaire compteGlobal = new CompteBancaire(1000); // ❌ partagé entre tests !

@Test
void test1() { compteGlobal.deposer(500); assertEquals(1500, compteGlobal.getSolde()); }

@Test
void test2() { compteGlobal.deposer(200); assertEquals(1700, compteGlobal.getSolde()); }
// ❌ test2 ne fonctionne QUE si test1 s'est déjà exécuté avant, dans le bon ordre !
```

Chaque test doit être **totalement indépendant** des autres, avec ses propres données fraîches (comme dans l'exemple F, où chaque test crée son propre `new CompteBancaire(...)`). Des tests qui dépendent d'un ordre d'exécution précis sont fragiles et trompeurs.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je comprends pourquoi les tests automatisés remplacent avantageusement
  la vérification manuelle.
✓ Je sais écrire un test avec @Test et assertEquals.
✓ Je sais tester qu'une exception est bien levée avec assertThrows.
✓ Je sais qu'un bon test couvre aussi les cas limites, pas seulement
  le scénario idéal.
✓ Je sais que chaque test doit être indépendant des autres.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Écris un test JUnit pour la méthode `estPair(int nombre)` (renvoie `true` si le nombre est pair), qui vérifie le cas `4` (pair).
</div>

## Correction

```java
@Test
void quatreEstPair() {
    assertTrue(estPair(4));
}
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Écris trois tests pour la méthode `diviser(double a, double b)` du chapitre 22 (qui lève une `ArithmeticException` si `b == 0`) : un cas normal, un cas de division par zéro (avec `assertThrows`), et un cas avec des nombres négatifs.
</div>

### Corrigé du défi

```java
class DiviseurTest {

    @Test
    void diviserDeuxNombresPositifs() {
        assertEquals(5.0, diviser(10, 2));
    }

    @Test
    void diviserParZeroLeveUneException() {
        assertThrows(ArithmeticException.class, () -> {
            diviser(10, 0);
        });
    }

    @Test
    void diviserAvecUnNombreNegatif() {
        assertEquals(-5.0, diviser(-10, 2));
    }
}
```

## Résumé du chapitre

- Un **test unitaire** vérifie automatiquement qu'une partie précise du code se comporte comme prévu, relançable à volonté.
- `@Test` annonce une méthode de test ; `assertEquals`, `assertTrue`, `assertThrows` vérifient un résultat.
- Un bon test couvre aussi les cas limites et d'erreur, pas seulement le scénario où tout se passe bien.
- Chaque test doit rester totalement indépendant des autres.
- Les tests automatisés détectent immédiatement les **régressions**, plutôt que de les découvrir bien plus tard.

---

# 🎓 Révision de la Partie 13 — Tests

## Questions de révision

1. Pourquoi un test automatisé est-il préférable à une vérification manuelle répétée ?
2. Que vérifie `assertThrows` ?
3. Pourquoi est-il risqué que deux tests partagent un même objet global ?

**Réponses :** (1) Parce qu'il s'exécute en quelques secondes, de façon fiable et répétable, sans dépendre de l'attention humaine à chaque relecture manuelle. (2) Qu'une exception précise est bien levée lors de l'exécution d'un morceau de code donné. (3) Parce que le résultat d'un test dépendrait alors de l'ordre d'exécution des autres tests, rendant les échecs difficiles à comprendre et les tests peu fiables.

## Mini-projet de la Partie 13

<div class="encadre defi">
<span class="encadre-titre">🧩 Mini-projet — Suite de tests pour une classe Produit</span>

Pour une classe `Produit` (nom, prix, quantiteEnStock) avec des méthodes `ajouterStock(int quantite)` et `retirerStock(int quantite)` (qui lève une exception si la quantité demandée dépasse le stock), écris une suite complète de tests JUnit couvrant : ajout normal, retrait normal, retrait excessif (exception), ajout de quantité négative (exception).
</div>

### Corrigé du mini-projet

```java
class ProduitTest {

    @Test
    void ajouterStockAugmenteLaQuantite() {
        Produit p = new Produit("Riz", 250, 100);
        p.ajouterStock(50);
        assertEquals(150, p.getQuantiteEnStock());
    }

    @Test
    void retirerStockDiminueLaQuantite() {
        Produit p = new Produit("Riz", 250, 100);
        p.retirerStock(30);
        assertEquals(70, p.getQuantiteEnStock());
    }

    @Test
    void retirerPlusQueLeStockLeveUneException() {
        Produit p = new Produit("Riz", 250, 100);
        assertThrows(IllegalArgumentException.class, () -> {
            p.retirerStock(150);
        });
    }

    @Test
    void ajouterQuantiteNegativeLeveUneException() {
        Produit p = new Produit("Riz", 250, 100);
        assertThrows(IllegalArgumentException.class, () -> {
            p.ajouterStock(-10);
        });
    }
}
```

---

*Chapitre suivant : les outils professionnels, en commençant par IntelliJ IDEA et VS Code, les environnements de développement qui accompagnent réellement l'écriture de Java au quotidien.*
