<div class="chapitre-titre-num">ANNEXE C</div>

# Erreurs fréquentes récapitulées

> Toutes les erreurs de débutant signalées dans ce manuel, regroupées ici pour une révision rapide avant un examen, un entretien technique, ou simplement pour se rafraîchir la mémoire.

## Bases (Partie 2)

- Oublier le point-virgule à la fin d'une instruction.
- Utiliser une variable avant de lui donner une valeur.
- Confondre `'J'` (char, guillemets simples) et `"J"` (String, guillemets doubles).
- Java est sensible à la casse : `age` ≠ `Age`.
- `10 / 3` entre `int` donne `3`, pas `3.33` (division entière) — forcer un `double` avec `(double)`.
- Confondre `=` (affectation) et `==` (comparaison).
- Compter les indices de tableau à partir de 1 au lieu de 0.
- `.length` (tableau, sans parenthèses) vs `.length()` (String, avec parenthèses).
- Ranger les conditions `if/else if` de la plus large à la plus stricte (l'ordre inverse du bon).
- Oublier `break` dans un `switch` classique (fall-through).
- Créer une boucle infinie en oubliant de mettre à jour la condition testée.
- Off-by-one : utiliser `<=` au lieu de `<` pour parcourir un tableau par indice.
- Oublier `return` dans une méthode dont le type de retour n'est pas `void`.
- Croire qu'un paramètre primitif modifié dans une méthode change la variable d'origine (transmis par copie).

## POO (Partie 3-4)

- Appeler une méthode sur une référence `null` → `NullPointerException`.
- Comparer des objets (ou String) avec `==` au lieu de `.equals()`.
- Oublier `this.` dans un constructeur → `nom = nom;` n'assigne rien à l'attribut.
- Croire qu'un constructeur par défaut existe encore après en avoir écrit un autre.
- `this(...)` doit être la toute première ligne d'un constructeur.
- Un setter qui ne valide rien n'apporte presque aucun bénéfice sur un attribut public.
- Un constructeur qui contourne le setter (assigne directement l'attribut, sans validation).
- Oublier `@Override`, risquant une faute de frappe silencieuse dans une redéfinition.
- `super(...)` doit être la toute première ligne du constructeur d'une classe fille.
- Croire que le type déclaré d'une variable (pas le type réel de l'objet) décide quelle méthode s'exécute (polymorphisme).
- Essayer d'instancier une classe abstraite ou une interface directement.
- Oublier d'implémenter une méthode abstraite dans une classe fille concrète.
- Oublier `public` devant une méthode d'interface implémentée.

## Collections (Partie 5)

- Utiliser un type primitif entre chevrons (`ArrayList<int>` au lieu de `ArrayList<Integer>`).
- Modifier un `ArrayList` pendant un parcours `for-each` → `ConcurrentModificationException`.
- Utiliser `HashSet` là où l'ordre ou les doublons comptent (préférer `ArrayList`).
- Essayer d'utiliser `get(indice)` sur un `HashSet` (n'existe pas).
- Confondre `put()` (HashMap) et `add()` (ArrayList/HashSet).
- Oublier de vérifier une clé absente avant `get()` sur une HashMap → `null` puis `NullPointerException`.
- `put()` sur une clé déjà existante remplace silencieusement la valeur précédente.

## Exceptions et fichiers (Partie 6-7)

- Attraper `Exception` de façon trop large, masquant des bugs imprévus.
- Un `catch` vide qui fait disparaître silencieusement une erreur.
- Oublier `throws` sur une méthode qui lève une exception vérifiée.
- Oublier `super(message)` dans le constructeur d'une exception personnalisée.
- Oublier `try-with-resources`, risquant qu'un fichier reste mal fermé.
- Ne pas prévoir le cas d'un fichier inexistant (`FileNotFoundException`).

## Java moderne (Partie 8)

- Oublier un cas dans un `switch` sur `enum` (pas d'obligation de compilation, contrairement à une méthode abstraite).
- Utiliser un lambda sur une interface qui a plusieurs méthodes abstraites (interdit).
- Oublier `return` dans un lambda avec accolades.
- Appeler `Optional.get()` sans vérifier `isPresent()` au préalable.
- Retourner `null` au lieu de `Optional.empty()`.
- Oublier l'opération terminale d'un Stream (rien ne s'exécute).
- Réutiliser un Stream déjà consommé (`IllegalStateException`).

## Base de données et JDBC (Partie 10-11)

- Oublier les guillemets sur du texte dans une requête SQL.
- `UPDATE`/`DELETE` sans `WHERE` : modifie ou supprime TOUTES les lignes.
- Construire une requête SQL en collant du texte utilisateur → injection SQL. Toujours `PreparedStatement`.
- Confondre `executeQuery()` (SELECT) et `executeUpdate()` (INSERT/UPDATE/DELETE).
- Compter les positions des `?` d'un `PreparedStatement` à partir de 0 (elles commencent à 1).
- Laisser du SQL fuir hors des classes DAO.
- Un DAO qui contient de la logique métier (ne devrait faire que de l'accès aux données).

## Architecture et qualité (Partie 12-17)

- Mélanger les responsabilités dans une seule classe (données + SQL + affichage).
- Un contrôleur MVC qui contient lui-même des règles métier.
- Une vue qui accède directement au DAO, sans passer par le contrôleur.
- Un DTO qui contient des données sensibles (mot de passe, informations internes).
- Des noms de variables non explicites (`a`, `x`, `temp`).
- Des méthodes trop longues, mélangeant plusieurs responsabilités.
- Des commentaires qui répètent simplement ce que le code dit déjà.
- Dupliquer une même logique à plusieurs endroits (violation de DRY).
- Appliquer SOLID ou un design pattern sans besoin réel, ajoutant de la complexité inutile.
- Un héritage qui viole Liskov (le comportement d'une classe fille surprend qui utilise la classe mère).

## Tests et outils (Partie 13-14)

- Ne tester que le "chemin heureux", jamais les cas limites ou d'erreur.
- Des tests qui dépendent d'un ordre d'exécution ou d'un état partagé entre eux.
- Ignorer systématiquement les soulignements d'erreur/avertissement de l'IDE.
- Une faute de frappe dans un identifiant de dépendance Maven.
- Un message de commit Git vide de sens ("fix", "modif").
- Commiter un secret (mot de passe, clé) — reste dans l'historique même après suppression.

---

*Annexe suivante : bibliographie, conclusion et feuille de route pour continuer ta progression après ce manuel.*
