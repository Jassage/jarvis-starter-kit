<div class="chapitre-titre-num">CHAPITRE 43</div>

# Écrire du bon code

## Objectifs pédagogiques

À la fin de ce chapitre, tu connaîtras les habitudes qui distinguent un code qui "marche" d'un code réellement professionnel : noms clairs, petites méthodes, classes responsables, commentaires utiles, éviter la répétition, gérer les erreurs, et sécurité de base.

## A. Le problème

Un code peut parfaitement compiler, s'exécuter, et produire le bon résultat — tout en étant extrêmement difficile à relire, à corriger, ou à faire évoluer six mois plus tard, par toi-même ou par quelqu'un d'autre. "Ça marche" et "c'est du bon code" ne sont pas la même chose.

## B. Exemple de la vie réelle

Pense à deux façons de ranger un atelier : l'une où chaque outil retrouve sa place précise, étiquetée, l'autre où tout est entassé en vrac mais où, avec de la patience, on finit toujours par retrouver ce qu'on cherche. Les deux "fonctionnent", mais l'une coûte beaucoup plus de temps et de frustration à long terme, surtout si quelqu'un d'autre doit s'y retrouver.

## 1. Des noms clairs

### Solution débutant

```java
int a = 20;
double b = 1500.0;
boolean c = true;

if (c && a >= 18) {
    b = b * 0.9;
}
```

### Solution professionnelle

```java
int age = 20;
double prixInitial = 1500.0;
boolean estMembreFidele = true;

if (estMembreFidele && age >= 18) {
    prixInitial = prixInitial * 0.9;
}
```

Le deuxième code fait **exactement** la même chose que le premier, mais se comprend instantanément, sans avoir besoin de deviner ce que `a`, `b` et `c` représentent.

## 2. Des petites méthodes, avec une seule responsabilité

### Solution débutant

```java
static void traiterCommande(Commande commande) {
    // 40 lignes qui vérifient le stock, calculent le total, appliquent
    // une réduction, enregistrent en base, envoient un email, ET
    // affichent un message — TOUT dans une seule méthode géante
}
```

### Solution professionnelle

```java
static void traiterCommande(Commande commande) {
    verifierStock(commande);
    double total = calculerTotal(commande);
    enregistrerCommande(commande);
    envoyerConfirmation(commande);
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une méthode devrait tenir sur un écran, et ne faire qu'une chose</span>
Si le nom d'une méthode contient "et" (<code>calculerTotalEtEnregistrer</code>), c'est souvent le signe qu'elle devrait être découpée en deux méthodes distinctes, chacune avec sa propre responsabilité claire — exactement le même principe déjà rencontré au chapitre 36 à l'échelle d'une classe entière.
</div>

## 3. Des classes responsables (rappel du chapitre 36)

```java
// ❌ Une classe qui fait TOUT
class Etudiant {
    void sauvegarderEnBase() { /* SQL ici */ }
    void afficherMenu() { /* interface ici */ }
    void envoyerEmail() { /* logique email ici */ }
}

// ✅ Chaque responsabilité dans sa propre classe
class Etudiant { /* seulement les données */ }
class EtudiantDAO { /* seulement l'accès aux données */ }
class NotificationService { /* seulement l'envoi d'emails */ }
```

## 4. Des commentaires utiles, pas redondants

### Solution débutant

```java
int age = 20; // déclare une variable age et lui donne la valeur 20
age = age + 1; // ajoute 1 à age
```

### Solution professionnelle

```java
int age = 20;
age = age + 1; // anniversaire du jour : on incrémente l'âge affiché
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un commentaire qui répète le code n'apporte RIEN</span>
Un bon commentaire explique le <strong>pourquoi</strong> (une décision métier, un contournement nécessaire, un piège à éviter), jamais le <strong>quoi</strong> quand le code lui-même le dit déjà clairement. Un code avec des noms clairs (règle n°1) a souvent besoin de <strong>moins</strong> de commentaires, pas plus.
</div>

## 5. Éviter le code répétitif (DRY)

### Solution débutant

```java
double totalAvecReductionA = prixA - (prixA * 0.10);
double totalAvecReductionB = prixB - (prixB * 0.10);
double totalAvecReductionC = prixC - (prixC * 0.10);
```

### Solution professionnelle

```java
static double appliquerReduction(double prix, double pourcentage) {
    return prix - (prix * pourcentage);
}

double totalA = appliquerReduction(prixA, 0.10);
double totalB = appliquerReduction(prixB, 0.10);
double totalC = appliquerReduction(prixC, 0.10);
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Terme : DRY (Don't Repeat Yourself)</span>
Le principe <strong>DRY</strong> ("ne te répète pas") recommande qu'une même logique ne soit écrite qu'à <strong>un seul endroit</strong> dans tout le programme. Si cette logique doit changer un jour (par exemple, le taux de réduction), une seule correction suffit — plutôt que de devoir retrouver et corriger toutes ses copies, en risquant d'en oublier une.
</div>

## 6. Gestion des erreurs (rappel du chapitre 22-23)

### Solution débutant

```java
try {
    compte.retirer(montant);
} catch (Exception e) {
    // rien, ou juste e.printStackTrace() sans vraie réaction
}
```

### Solution professionnelle

```java
try {
    compte.retirer(montant);
} catch (SoldeInsuffisantException e) {
    System.out.println("Retrait refusé : " + e.getMessage());
    // une vraie réaction, adaptée au contexte métier précis
}
```

## 7. Sécurité de base

- Ne jamais coller directement du texte utilisateur dans une requête SQL (chapitre 34, `PreparedStatement` obligatoire).
- Ne jamais stocker un mot de passe en clair (le hacher, comme évoqué au chapitre 33).
- Ne jamais commiter de secret (mot de passe, clé) dans Git (chapitre 42).
- Toujours valider les données reçues de l'extérieur (chapitre 11, encapsulation avec setters validants) avant de les utiliser.

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre "bon code" et "code impressionnant"</span>
Écrire délibérément du code compact, dense, ou utilisant des astuces peu connues du langage pour "impressionner" n'est pas un signe de qualité — c'est même souvent l'inverse : le meilleur code est celui que <strong>n'importe qui</strong>, y compris un futur toi moins expérimenté qu'aujourd'hui, peut comprendre rapidement, sans effort.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Sur-optimiser un code encore jamais mesuré comme lent</span>
Réécrire un code clair et simple en une version plus complexe "pour la performance", sans avoir jamais réellement mesuré un problème de lenteur, sacrifie souvent la lisibilité pour un gain totalement hypothétique. La clarté doit rester la priorité par défaut, sauf preuve concrète du contraire.
</div>

<div class="encadre progression">
<span class="encadre-titre">🎯 CE QUE TU SAIS MAINTENANT</span>

```text
✓ Je sais choisir des noms de variables et méthodes clairs et explicites.
✓ Je sais découper une longue méthode en plusieurs petites, à
  responsabilité unique.
✓ Je sais écrire des commentaires qui expliquent le POURQUOI, pas le QUOI.
✓ Je connais le principe DRY et sais l'appliquer.
✓ Je sais gérer les erreurs de façon réellement utile, jamais avec un catch vide.
✓ Je connais les 4 réflexes de sécurité de base à toujours appliquer.
```
</div>

## Petit exercice

<div class="encadre exercice">
<span class="encadre-titre">📝 Vérifie ta compréhension</span>

Améliore ce code selon la règle n°1 (noms clairs) :

```java
double x = 45000;
double y = 0.15;
double z = x * y;
```
</div>

## Correction

```java
double salaireAnnuel = 45000;
double tauxImposition = 0.15;
double montantImpot = salaireAnnuel * tauxImposition;
```

## Défi

<div class="encadre defi">
<span class="encadre-titre">🧩 Défi — À toi de jouer</span>

Refactorise ce code répétitif (règle n°5, DRY) en une seule méthode réutilisable :

```java
System.out.println("Bienvenue " + nom1 + " ! Vous avez " + points1 + " points.");
System.out.println("Bienvenue " + nom2 + " ! Vous avez " + points2 + " points.");
System.out.println("Bienvenue " + nom3 + " ! Vous avez " + points3 + " points.");
```
</div>

### Corrigé du défi

```java
static void afficherBienvenue(String nom, int points) {
    System.out.println("Bienvenue " + nom + " ! Vous avez " + points + " points.");
}

afficherBienvenue(nom1, points1);
afficherBienvenue(nom2, points2);
afficherBienvenue(nom3, points3);
```

## Résumé du chapitre

- Des **noms clairs** rendent le code compréhensible sans effort, réduisant même le besoin de commentaires.
- Des **méthodes petites et responsables** (une seule tâche chacune) sont plus faciles à comprendre, tester et corriger.
- Un bon **commentaire** explique le pourquoi, jamais une simple reformulation du code.
- Le principe **DRY** évite de dupliquer une même logique à plusieurs endroits.
- La **gestion des erreurs** doit toujours être réelle, jamais un `catch` vide.
- La **sécurité de base** (PreparedStatement, mots de passe hachés, secrets jamais commités, validation systématique) n'est jamais optionnelle.

---

# 🎓 Révision de la Partie 15 — Bonnes pratiques

## Questions de révision

1. Pourquoi un commentaire qui répète simplement le code n'apporte-t-il rien de plus ?
2. Que signifie le principe DRY, et pourquoi est-il important ?
3. Cite deux des quatre réflexes de sécurité de base présentés dans ce chapitre.

**Réponses :** (1) Parce qu'il n'ajoute aucune information que le code lui-même, s'il est clairement écrit, ne communique pas déjà. (2) "Ne te répète pas" : une même logique ne devrait exister qu'à un seul endroit, pour n'avoir à la corriger qu'une seule fois si elle doit changer. (3) Par exemple : ne jamais coller de texte utilisateur dans une requête SQL (utiliser PreparedStatement), et ne jamais commiter de secret dans Git.

## Mini-projet de la Partie 15

<div class="encadre defi">
<span class="encadre-titre">🧩 Mini-projet — Réviser un code existant</span>

Réécris ce code en appliquant toutes les règles du chapitre : noms clairs, méthode découpée, pas de répétition, gestion d'erreur réelle.

```java
public class P {
    public static void main(String[] a) {
        double x = 1000, y = 1500, z = 2000;
        double t1 = x - (x * 0.1);
        double t2 = y - (y * 0.1);
        double t3 = z - (z * 0.1);
        System.out.println(t1);
        System.out.println(t2);
        System.out.println(t3);
    }
}
```
</div>

### Corrigé du mini-projet

```java
public class CalculateurReductions {
    public static void main(String[] args) {
        double[] prixInitiaux = {1000, 1500, 2000};

        for (double prix : prixInitiaux) {
            double prixReduit = appliquerReduction(prix, 0.10);
            System.out.println("Prix après réduction : " + prixReduit);
        }
    }

    static double appliquerReduction(double prix, double pourcentage) {
        if (pourcentage < 0 || pourcentage > 1) {
            throw new IllegalArgumentException("Pourcentage invalide : " + pourcentage);
        }
        return prix - (prix * pourcentage);
    }
}
```

---

*Chapitre suivant : les principes SOLID, pour formaliser et approfondir encore ces bonnes pratiques en cinq règles de conception éprouvées.*
