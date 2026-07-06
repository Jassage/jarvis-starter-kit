<div class="chapitre-titre-num">CHAPITRE 23</div>

# Projet final POO complet — Gestion de bibliothèque

## Objectifs pédagogiques

Assembler l'ensemble des notions des chapitres 1 à 22 dans une application complète : architecture en couches, packages organisés, interfaces, héritage, encapsulation, polymorphisme, abstraction, exceptions personnalisées, sauvegarde de données par fichier, menu interactif et tests.

## 23.1 Cahier des charges

**BiblioGest** est une application console de gestion de bibliothèque : gestion des livres, des membres, des emprunts/retours, avec sauvegarde persistante par fichier (sans base de données relationnelle — sujet réservé aux chapitres 24 à 32).

**Fonctionnalités :** ajouter/rechercher un livre, inscrire un membre, emprunter/retourner un livre, lister les emprunts en cours, sauvegarder/charger l'état de la bibliothèque depuis un fichier.

## 23.2 Architecture en couches

**Architecture en couches — BiblioGest**

```{.uml}
┌───────────────────────────────┐
│   ui (menu console interactif)   │  ← Présentation
├───────────────────────────────┤
│   service (logique métier)       │  ← Métier
├───────────────────────────────┤
│   persistance (sauvegarde/charge)│  ← Persistance
├───────────────────────────────┤
│   modele (Livre, Membre, Emprunt)│  ← Données
└───────────────────────────────┘
         + exception (transversal, utilisé par toutes les couches)
```

```
com.jaslin.bibliogest/
├── modele/
│   ├── Personne.java (abstract)
│   ├── Membre.java
│   ├── Bibliothecaire.java
│   ├── Livre.java
│   └── Emprunt.java
├── exception/
│   ├── LivreIndisponibleException.java
│   └── MembreNonTrouveException.java
├── persistance/
│   ├── GestionnairePersistance.java (interface)
│   └── GestionnaireFichierTexte.java
├── service/
│   └── BibliothequeService.java
├── ui/
│   └── MenuPrincipal.java
└── Application.java
```

## 23.3 Package modele

```java
package com.jaslin.bibliogest.modele;

public abstract class Personne {
    protected String nom;
    protected String email;

    public Personne(String nom, String email) {
        this.nom = nom;
        this.email = email;
    }

    public String getNom() { return nom; }
    public String getEmail() { return email; }

    public abstract String afficherProfil();
}
```

```java
package com.jaslin.bibliogest.modele;

public class Membre extends Personne {
    private String numeroMembre;
    private int nbEmpruntsMax = 3;

    public Membre(String nom, String email, String numeroMembre) {
        super(nom, email);
        this.numeroMembre = numeroMembre;
    }

    public String getNumeroMembre() { return numeroMembre; }
    public int getNbEmpruntsMax() { return nbEmpruntsMax; }

    @Override
    public String afficherProfil() {
        return "Membre " + numeroMembre + " : " + nom + " (" + email + ")";
    }
}
```

```java
package com.jaslin.bibliogest.modele;

public class Livre {
    private String isbn;
    private String titre;
    private String auteur;
    private boolean disponible = true;

    public Livre(String isbn, String titre, String auteur) {
        this.isbn = isbn;
        this.titre = titre;
        this.auteur = auteur;
    }

    public String getIsbn() { return isbn; }
    public String getTitre() { return titre; }
    public String getAuteur() { return auteur; }
    public boolean isDisponible() { return disponible; }

    public void marquerEmprunte() { this.disponible = false; }
    public void marquerDisponible() { this.disponible = true; }

    @Override
    public String toString() {
        return titre + " de " + auteur + " (" + (disponible ? "disponible" : "emprunté") + ")";
    }
}
```

```java
package com.jaslin.bibliogest.modele;

import java.time.LocalDate;

public class Emprunt {
    private Livre livre;
    private Membre membre;
    private LocalDate dateEmprunt;
    private LocalDate dateRetour; // null tant que le livre n'est pas rendu

    public Emprunt(Livre livre, Membre membre) {
        this.livre = livre;
        this.membre = membre;
        this.dateEmprunt = LocalDate.now();
    }

    public void enregistrerRetour() {
        this.dateRetour = LocalDate.now();
    }

    public boolean estEnCours() {
        return dateRetour == null;
    }

    public Livre getLivre() { return livre; }
    public Membre getMembre() { return membre; }

    @Override
    public String toString() {
        return livre.getTitre() + " emprunté par " + membre.getNom() + " le " + dateEmprunt
            + (estEnCours() ? " (en cours)" : " (rendu le " + dateRetour + ")");
    }
}
```

## 23.4 Package exception

```java
package com.jaslin.bibliogest.exception;

public class LivreIndisponibleException extends RuntimeException {
    public LivreIndisponibleException(String titre) {
        super("Le livre \"" + titre + "\" n'est actuellement pas disponible.");
    }
}

public class MembreNonTrouveException extends RuntimeException {
    public MembreNonTrouveException(String numeroMembre) {
        super("Aucun membre trouvé avec le numéro : " + numeroMembre);
    }
}
```

## 23.5 Package persistance : interface + implémentation fichier

```java
package com.jaslin.bibliogest.persistance;

import java.util.List;
import com.jaslin.bibliogest.modele.Livre;

// Interface : permet de changer d'implémentation (fichier texte, JSON, base de données future) sans
// modifier le code appelant — application directe de l'inversion de dépendance (chapitre 19)
public interface GestionnairePersistance {
    void sauvegarderLivres(List<Livre> livres);
    List<Livre> chargerLivres();
}
```

```java
package com.jaslin.bibliogest.persistance;

import java.io.*;
import java.util.*;
import com.jaslin.bibliogest.modele.Livre;

public class GestionnaireFichierTexte implements GestionnairePersistance {
    private static final String NOM_FICHIER = "livres.txt";

    @Override
    public void sauvegarderLivres(List<Livre> livres) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(NOM_FICHIER))) {
            for (Livre livre : livres) {
                // Format simple : isbn;titre;auteur;disponible
                writer.println(livre.getIsbn() + ";" + livre.getTitre() + ";"
                    + livre.getAuteur() + ";" + livre.isDisponible());
            }
        } catch (IOException e) {
            System.out.println("Erreur lors de la sauvegarde : " + e.getMessage());
        }
    }

    @Override
    public List<Livre> chargerLivres() {
        List<Livre> livres = new ArrayList<>();
        File fichier = new File(NOM_FICHIER);

        if (!fichier.exists()) {
            return livres; // premier lancement : aucun fichier existant, liste vide
        }

        try (Scanner scanner = new Scanner(fichier)) {
            while (scanner.hasNextLine()) {
                String[] parties = scanner.nextLine().split(";");
                Livre livre = new Livre(parties[0], parties[1], parties[2]);
                if (!Boolean.parseBoolean(parties[3])) {
                    livre.marquerEmprunte();
                }
                livres.add(livre);
            }
        } catch (IOException e) {
            System.out.println("Erreur lors du chargement : " + e.getMessage());
        }
        return livres;
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi une interface pour un besoin aussi simple</span>
`GestionnairePersistance` peut sembler superflue pour une seule implémentation. Mais elle rend le `BibliothequeService` (section 23.6) totalement indépendant du **mode** de stockage choisi — un bon exemple d'application du principe d'inversion de dépendance (chapitre 19) qui prendra tout son sens au chapitre 31, où une implémentation `GestionnairePersistanceMySQL` pourra remplacer celle-ci sans toucher au service.
</div>

## 23.6 Package service : la logique métier

```java
package com.jaslin.bibliogest.service;

import java.util.*;
import com.jaslin.bibliogest.modele.*;
import com.jaslin.bibliogest.exception.*;
import com.jaslin.bibliogest.persistance.GestionnairePersistance;

public class BibliothequeService {
    private List<Livre> livres;
    private List<Membre> membres = new ArrayList<>();
    private List<Emprunt> emprunts = new ArrayList<>();
    private GestionnairePersistance persistance;

    public BibliothequeService(GestionnairePersistance persistance) { // injection de dépendance (chapitre 20)
        this.persistance = persistance;
        this.livres = persistance.chargerLivres(); // charge l'état sauvegardé au démarrage
    }

    public void ajouterLivre(String isbn, String titre, String auteur) {
        livres.add(new Livre(isbn, titre, auteur));
    }

    public void inscrireMembre(String nom, String email, String numeroMembre) {
        membres.add(new Membre(nom, email, numeroMembre));
    }

    public Emprunt emprunterLivre(String isbn, String numeroMembre) {
        Livre livre = trouverLivreParIsbn(isbn);
        Membre membre = trouverMembreParNumero(numeroMembre);

        if (!livre.isDisponible()) {
            throw new LivreIndisponibleException(livre.getTitre());
        }

        long empruntsEnCours = emprunts.stream()
            .filter(Emprunt::estEnCours)
            .filter(e -> e.getMembre().equals(membre))
            .count();
        if (empruntsEnCours >= membre.getNbEmpruntsMax()) {
            throw new IllegalStateException(membre.getNom() + " a atteint sa limite d'emprunts");
        }

        livre.marquerEmprunte();
        Emprunt emprunt = new Emprunt(livre, membre);
        emprunts.add(emprunt);
        return emprunt;
    }

    public void retournerLivre(String isbn) {
        Livre livre = trouverLivreParIsbn(isbn);
        Emprunt emprunt = emprunts.stream()
            .filter(Emprunt::estEnCours)
            .filter(e -> e.getLivre().equals(livre))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Aucun emprunt en cours pour ce livre"));

        emprunt.enregistrerRetour();
        livre.marquerDisponible();
    }

    public List<Livre> rechercherParTitre(String motCle) {
        return livres.stream()
            .filter(l -> l.getTitre().toLowerCase().contains(motCle.toLowerCase()))
            .toList();
    }

    public List<Emprunt> listerEmpruntsEnCours() {
        return emprunts.stream().filter(Emprunt::estEnCours).toList();
    }

    public void sauvegarder() {
        persistance.sauvegarderLivres(livres);
    }

    private Livre trouverLivreParIsbn(String isbn) {
        return livres.stream()
            .filter(l -> l.getIsbn().equals(isbn))
            .findFirst()
            .orElseThrow(() -> new LivreIndisponibleException("ISBN " + isbn + " introuvable"));
    }

    private Membre trouverMembreParNumero(String numeroMembre) {
        return membres.stream()
            .filter(m -> m.getNumeroMembre().equals(numeroMembre))
            .findFirst()
            .orElseThrow(() -> new MembreNonTrouveException(numeroMembre));
    }

    public List<Livre> getTousLesLivres() { return livres; }
}
```

## 23.7 Package ui : menu interactif

```java
package com.jaslin.bibliogest.ui;

import java.util.Scanner;
import com.jaslin.bibliogest.service.BibliothequeService;
import com.jaslin.bibliogest.exception.*;

public class MenuPrincipal {
    private BibliothequeService service;
    private Scanner scanner = new Scanner(System.in);

    public MenuPrincipal(BibliothequeService service) {
        this.service = service;
    }

    public void demarrer() {
        boolean continuer = true;
        while (continuer) {
            afficherMenu();
            int choix = Integer.parseInt(scanner.nextLine());

            try {
                switch (choix) {
                    case 1 -> ajouterLivre();
                    case 2 -> emprunterLivre();
                    case 3 -> retournerLivre();
                    case 4 -> listerEmprunts();
                    case 5 -> rechercherLivre();
                    case 0 -> { service.sauvegarder(); continuer = false; }
                    default -> System.out.println("Choix invalide.");
                }
            } catch (LivreIndisponibleException | MembreNonTrouveException | IllegalStateException e) {
                // Gestion centralisée des erreurs métier attendues (chapitre 12)
                System.out.println("⚠ " + e.getMessage());
            }
        }
        System.out.println("Données sauvegardées. Au revoir !");
    }

    private void afficherMenu() {
        System.out.println("""
            \n=== BiblioGest ===
            1. Ajouter un livre
            2. Emprunter un livre
            3. Retourner un livre
            4. Lister les emprunts en cours
            5. Rechercher un livre
            0. Quitter (et sauvegarder)
            Choix : """);
    }

    private void ajouterLivre() {
        System.out.print("ISBN : ");
        String isbn = scanner.nextLine();
        System.out.print("Titre : ");
        String titre = scanner.nextLine();
        System.out.print("Auteur : ");
        String auteur = scanner.nextLine();
        service.ajouterLivre(isbn, titre, auteur);
        System.out.println("Livre ajouté avec succès.");
    }

    private void emprunterLivre() {
        System.out.print("ISBN du livre : ");
        String isbn = scanner.nextLine();
        System.out.print("Numéro de membre : ");
        String numeroMembre = scanner.nextLine();
        service.emprunterLivre(isbn, numeroMembre);
        System.out.println("Emprunt enregistré avec succès.");
    }

    private void retournerLivre() {
        System.out.print("ISBN du livre à retourner : ");
        service.retournerLivre(scanner.nextLine());
        System.out.println("Retour enregistré avec succès.");
    }

    private void listerEmprunts() {
        service.listerEmpruntsEnCours().forEach(System.out::println);
    }

    private void rechercherLivre() {
        System.out.print("Mot-clé du titre : ");
        service.rechercherParTitre(scanner.nextLine()).forEach(System.out::println);
    }
}
```

```java
package com.jaslin.bibliogest;

import com.jaslin.bibliogest.persistance.GestionnaireFichierTexte;
import com.jaslin.bibliogest.service.BibliothequeService;
import com.jaslin.bibliogest.ui.MenuPrincipal;

public class Application {
    public static void main(String[] args) {
        BibliothequeService service = new BibliothequeService(new GestionnaireFichierTexte());
        new MenuPrincipal(service).demarrer();
    }
}
```

## 23.8 Diagramme UML complet

**Diagramme de classes complet — BiblioGest**

```{.uml}
┌──────────────────┐
│ «interface» GestionnairePersistance │
├──────────────────┤
│+sauvegarderLivres()  │
│+chargerLivres()      │
└──────────────────┘
        ▲┊
┌──────────────────┐
│ GestionnaireFichierTexte │
└──────────────────┘
        ▲ utilisé par
        │
┌──────────────────┐        ┌─────────────┐
│ BibliothequeService  │───────►│    Livre        │
├──────────────────┤  0..*  ├─────────────┤
│-livres, membres, emprunts│        │-isbn, titre     │
└──────────────────┘        └─────────────┘
        │ utilise                    ▲
        ▼                            │ 0..*
┌──────────────────┐         ┌─────────────┐
│    MenuPrincipal      │         │   Emprunt       │
└──────────────────┘         └─────────────┘
                                     │ 0..*
                                     ▼
                            ┌─────────────────┐
                            │ «abstract» Personne │
                            └─────────────────┘
                                     △
                                ┌────┴────┐
                          ┌─────────┐ ┌──────────────┐
                          │  Membre    │ │ Bibliothecaire  │
                          └─────────┘ └──────────────┘
```

## 23.9 Tests des fonctionnalités

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BibliothequeServiceTest {

    @Test
    void empruntEchoueSiLivreDejaEmprunte() {
        BibliothequeService service = new BibliothequeService(new GestionnaireFichierTexteFake());
        service.ajouterLivre("123", "Le Petit Prince", "Saint-Exupéry");
        service.inscrireMembre("Jaslin", "jaslin@mail.com", "M001");
        service.inscrireMembre("Marie", "marie@mail.com", "M002");

        service.emprunterLivre("123", "M001");

        assertThrows(LivreIndisponibleException.class, () -> service.emprunterLivre("123", "M002"));
    }

    @Test
    void retournerLivreLeRendDisponible() {
        BibliothequeService service = new BibliothequeService(new GestionnaireFichierTexteFake());
        service.ajouterLivre("123", "Le Petit Prince", "Saint-Exupéry");
        service.inscrireMembre("Jaslin", "jaslin@mail.com", "M001");

        service.emprunterLivre("123", "M001");
        service.retournerLivre("123");

        boolean disponible = service.getTousLesLivres().get(0).isDisponible();
        assertTrue(disponible);
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi l'interface GestionnairePersistance facilite aussi les tests</span>
Les tests ci-dessus utiliseraient une implémentation `GestionnairePersistanceFake` (qui garde simplement les livres en mémoire, sans toucher au disque) plutôt que `GestionnaireFichierTexte` — exactement le bénéfice de l'inversion de dépendance (chapitre 19-20) : les tests s'exécutent rapidement, sans dépendre du système de fichiers réel.
</div>

## 23.10 Résumé du chapitre

- BiblioGest assemble architecture en couches, packages organisés, interfaces, héritage, encapsulation, polymorphisme, exceptions personnalisées et sauvegarde fichier.
- L'interface `GestionnairePersistance` découple le service métier du mode de stockage, facilitant à la fois l'évolution future (chapitre 31) et les tests.
- Le menu interactif (`Scanner`) centralise la gestion des exceptions métier, offrant une expérience utilisateur robuste face aux erreurs attendues.
- Ce projet sert de référence structurelle pour le projet intégrateur avec base de données du chapitre 31.

*Ceci clôt la Partie 8 (mise en pratique POO). Chapitre suivant : introduction aux bases de données, première étape de la Partie 9.*
