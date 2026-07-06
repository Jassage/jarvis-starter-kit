<div class="chapitre-titre-num">CHAPITRE 6</div>

# Polymorphisme

## Objectifs pédagogiques

Distinguer surcharge et redéfinition, comprendre la liaison dynamique (le mécanisme qui rend le polymorphisme possible), maîtriser upcasting/downcasting et l'opérateur `instanceof`.

## 6.1 Le mot "polymorphisme" : plusieurs formes

**Polymorphisme** vient du grec "plusieurs formes" : la capacité pour un même appel de méthode de produire un comportement **différent** selon le type réel de l'objet qui le reçoit.

```java
public class Animal {
    void crier() {
        System.out.println("L'animal fait un bruit.");
    }
}

public class Chien extends Animal {
    @Override
    void crier() {
        System.out.println("Wouf wouf !");
    }
}

public class Chat extends Animal {
    @Override
    void crier() {
        System.out.println("Miaou !");
    }
}
```

```java
Animal[] animaux = { new Chien(), new Chat(), new Animal() };

for (Animal a : animaux) {
    a.crier(); // le MÊME appel a.crier() produit un résultat DIFFÉRENT selon le type réel de chaque objet
}
// Wouf wouf !
// Miaou !
// L'animal fait un bruit.
```

C'est le polymorphisme en action : le code de la boucle ne "sait" pas s'il manipule un `Chien`, un `Chat` ou un `Animal` générique — il appelle `crier()` et laisse **chaque objet** décider de son propre comportement.

## 6.2 Deux formes de polymorphisme : surcharge vs redéfinition

<div class="encadre astuce">
<span class="encadre-titre">💡 Ne pas confondre ces deux mécanismes, souvent mélangés par les débutants</span>
- **Surcharge (overloading)** : plusieurs méthodes **de la même classe**, même nom, mais des paramètres différents (déjà vue pour les constructeurs au chapitre 3). Résolue **à la compilation** (polymorphisme statique).
- **Redéfinition (overriding)** : une classe fille remplace le comportement d'une méthode héritée, **même signature exacte** (vue au chapitre 5). Résolue **à l'exécution** (polymorphisme dynamique) — c'est elle qui permet l'exemple de la section 6.1.
</div>

```java
public class Calculatrice {
    // SURCHARGE : même nom "additionner", signatures différentes
    int additionner(int a, int b) {
        return a + b;
    }

    double additionner(double a, double b) {
        return a + b;
    }

    int additionner(int a, int b, int c) {
        return a + b + c;
    }
}
```

## 6.3 La liaison dynamique (dynamic binding)

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment Java "sait" quelle version de crier() appeler</span>
Quand le code exécute `a.crier()` sur une variable déclarée `Animal a`, Java ne regarde **pas** le type déclaré de la variable (`Animal`) pour décider quelle méthode exécuter, mais le **type réel de l'objet** créé avec `new` (`Chien`, `Chat`...). Cette résolution **à l'exécution** (et non à la compilation) s'appelle la **liaison dynamique** — le mécanisme fondamental qui rend le polymorphisme possible.
</div>

```java
Animal a = new Chien(); // type déclaré : Animal ; type RÉEL : Chien
a.crier(); // "Wouf wouf !" — la liaison dynamique appelle la version de Chien, pas celle d'Animal
```

## 6.4 Upcasting : traiter un objet spécifique comme son type général

```java
Chien monChien = new Chien();
Animal a = monChien; // UPCASTING implicite : Chien → Animal, toujours sûr, jamais d'erreur possible
a.crier(); // "Wouf wouf !" (liaison dynamique, toujours le comportement réel de Chien)
```

L'**upcasting** ("cast vers le haut", vers la classe mère) est **implicite et toujours sûr** : un `Chien` **est** toujours un `Animal`, cette conversion ne peut jamais échouer.

## 6.5 Downcasting : reconvertir vers le type spécifique

```java
Animal a = new Chien();
Chien c = (Chien) a; // DOWNCASTING explicite : nécessite un cast manuel entre parenthèses
c.aboyer(); // accès à une méthode PROPRE à Chien, absente d'Animal
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un downcasting incorrect lève une ClassCastException à l'exécution</span>
```java
Animal a = new Chat(); // le type réel est Chat, pas Chien !
Chien c = (Chien) a; // 💥 ClassCastException : l'objet réel n'est pas un Chien
```
Contrairement à l'upcasting (toujours sûr), le downcasting peut échouer **à l'exécution** si le type réel de l'objet ne correspond pas au type demandé. Le compilateur ne peut pas détecter cette erreur à l'avance — d'où l'importance de vérifier le type réel avant un downcasting (section 6.6).
</div>

## 6.6 instanceof : vérifier le type réel avant un downcasting

```java
Animal a = new Chat();

if (a instanceof Chien) {
    Chien c = (Chien) a;
    c.aboyer();
} else if (a instanceof Chat) {
    Chat ch = (Chat) a;
    ch.griffer();
}
```

Depuis Java 16, une syntaxe simplifiée (**pattern matching for instanceof**) évite le cast manuel redondant :

```java
if (a instanceof Chat chat) { // "chat" est automatiquement typé Chat, prêt à l'emploi
    chat.griffer();
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Multiplier les instanceof est souvent un signe de mauvaise conception</span>
Une longue chaîne de `if (a instanceof X) ... else if (a instanceof Y) ...` contredit souvent l'esprit même du polymorphisme : le but du polymorphisme est justement d'éviter d'avoir à distinguer les types un par un dans le code appelant. Si ce pattern se répète souvent, la vraie solution est généralement de redéfinir la méthode concernée directement dans chaque classe fille (comme `crier()` en section 6.1), pour laisser la liaison dynamique faire le travail.
</div>

## 6.7 Le polymorphisme en pratique : une collection d'objets hétérogènes

```java
public class Forme {
    double calculerAire() {
        return 0;
    }
}

public class Cercle extends Forme {
    double rayon;
    Cercle(double rayon) { this.rayon = rayon; }

    @Override
    double calculerAire() {
        return Math.PI * rayon * rayon;
    }
}

public class Carre extends Forme {
    double cote;
    Carre(double cote) { this.cote = cote; }

    @Override
    double calculerAire() {
        return cote * cote;
    }
}

public class Programme {
    public static void main(String[] args) {
        Forme[] formes = { new Cercle(3), new Carre(4), new Cercle(1.5) };

        double aireTotale = 0;
        for (Forme f : formes) {
            aireTotale += f.calculerAire(); // AUCUN if/instanceof nécessaire !
        }
        System.out.println("Aire totale : " + aireTotale);
    }
}
```

C'est l'exemple le plus classique et le plus révélateur du polymorphisme : le code de la boucle traite indifféremment des `Cercle` et des `Carre` via leur type commun `Forme`, sans jamais avoir besoin de savoir lequel est lequel.

## 6.8 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre @Override (redéfinition) et une nouvelle surcharge accidentelle</span>
```java
public class Animal {
    void crier(String bruit) { System.out.println(bruit); }
}

public class Chien extends Animal {
    @Override
    void crier() { System.out.println("Wouf !"); } // ❌ Erreur de compilation
}
```
Sans paramètre identique, ceci n'est pas une redéfinition mais une tentative de surcharge — et `@Override` signale alors une erreur de compilation utile, car aucune méthode `crier()` sans paramètre n'existe dans `Animal` à redéfinir.
</div>

## 6.9 Résumé du chapitre

- Le polymorphisme permet à un même appel de méthode de produire un comportement différent selon le type réel de l'objet.
- **Surcharge** (même classe, paramètres différents, résolue à la compilation) ≠ **Redéfinition** (héritage, même signature, résolue à l'exécution via la liaison dynamique).
- **Upcasting** (vers la classe mère) est implicite et toujours sûr ; **downcasting** (vers la classe fille) est explicite et peut échouer (`ClassCastException`).
- `instanceof` (avec pattern matching depuis Java 16) vérifie le type réel avant un downcasting.
- Une collection d'objets de types différents mais partageant une classe/interface commune, manipulée polymorphiquement, évite les longues chaînes de conditions par type.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.1</span>

Crée une classe mère `Employe` avec une méthode `calculerSalaire()` retournant un montant fixe, puis deux classes filles `EmployeCommission` (salaire fixe + commission) et `EmployeHoraire` (taux horaire × heures travaillées), chacune redéfinissant `calculerSalaire()`. Écris une boucle qui calcule la masse salariale totale d'un tableau mélangeant les deux types.
</div>

**Corrigé :**
```java
public class Employe {
    double salaireFixe;
    Employe(double salaireFixe) { this.salaireFixe = salaireFixe; }
    double calculerSalaire() { return salaireFixe; }
}

public class EmployeCommission extends Employe {
    double commission;
    EmployeCommission(double salaireFixe, double commission) {
        super(salaireFixe);
        this.commission = commission;
    }
    @Override
    double calculerSalaire() {
        return salaireFixe + commission;
    }
}

public class EmployeHoraire extends Employe {
    double tauxHoraire;
    double heuresTravaillees;
    EmployeHoraire(double tauxHoraire, double heuresTravaillees) {
        super(0);
        this.tauxHoraire = tauxHoraire;
        this.heuresTravaillees = heuresTravaillees;
    }
    @Override
    double calculerSalaire() {
        return tauxHoraire * heuresTravaillees;
    }
}

public class Programme {
    public static void main(String[] args) {
        Employe[] employes = {
            new EmployeCommission(5000, 1200),
            new EmployeHoraire(150, 160)
        };

        double masseSalariale = 0;
        for (Employe e : employes) {
            masseSalariale += e.calculerSalaire();
        }
        System.out.println("Masse salariale : " + masseSalariale);
    }
}
```

*Chapitre suivant : l'abstraction, pour définir un contrat commun sans imposer d'implémentation.*
