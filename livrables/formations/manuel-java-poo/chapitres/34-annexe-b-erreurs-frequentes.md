<div class="chapitre-titre-num">ANNEXE B</div>

# Récapitulatif des erreurs fréquentes

| # | Erreur | Chapitre |
|---|---|---|
| 1 | NullPointerException sur un attribut objet non initialisé (valeur par défaut `null`) | 2 |
| 2 | Comparer deux objets avec `==` au lieu de `.equals()` | 2 |
| 3 | Constructeur par défaut disparu dès qu'un constructeur paramétré est écrit | 3 |
| 4 | Oublier `this.` et créer une variable locale involontaire (`nom = nom;`) | 3 |
| 5 | `this(...)` qui n'est pas la toute première instruction du constructeur | 3 |
| 6 | Getter/setter "passe-plat" sans aucune validation réelle | 4 |
| 7 | Retourner une référence directe vers un attribut objet mutable (contourne l'encapsulation) | 4 |
| 8 | `super(...)` absent ou mal placé (doit être la première instruction) | 5 |
| 9 | Confondre héritage ("est un") et composition ("a un") | 5 |
| 10 | Oublier `@Override`, risquant une surcharge accidentelle plutôt qu'une redéfinition | 5, 6 |
| 11 | `ClassCastException` sur un downcasting sans vérification `instanceof` préalable | 6 |
| 12 | Classe fille n'implémentant pas toutes les méthodes abstraites (reste abstraite implicitement) | 7 |
| 13 | Classe top-level déclarée `private`/`protected` (interdit, sauf classes imbriquées) | 10 |
| 14 | Méthode `static` tentant d'accéder à un attribut d'instance | 11 |
| 15 | Bloc `catch` vide, masquant silencieusement une erreur | 12 |
| 16 | Ordre des blocs `catch` du plus général au plus spécifique (erreur de compilation) | 12 |
| 17 | `ConcurrentModificationException` en modifiant une collection pendant un for-each classique | 13 |
| 18 | Utiliser un objet métier comme clé de `HashMap`/`HashSet` sans redéfinir `equals()`/`hashCode()` | 13 |
| 19 | Oublier une dépendance dans un tableau de génériques bornés / wildcard mal choisi | 15 |
| 20 | Capturer dans une lambda une variable qui n'est pas "effectivement finale" | 16 |
| 21 | Utiliser une lambda pour une interface à plusieurs méthodes abstraites (impossible) | 16 |
| 22 | Oublier qu'un Stream ne se consomme qu'une seule fois | 17 |
| 23 | Confondre agrégation et composition dans un diagramme UML | 18 |
| 24 | "Un carré est un rectangle" : violation du principe de substitution de Liskov | 19 |
| 25 | Appliquer un Design Pattern sans besoin réel identifié | 20 |
| 26 | Coder en dur les identifiants de connexion à la base dans le code source | 26 |
| 27 | Oublier que les index JDBC (`PreparedStatement`, `ResultSet`) commencent à 1, pas 0 | 27 |
| 28 | `DELETE`/`UPDATE` échouant à cause d'une contrainte de clé étrangère non anticipée | 24, 27 |
| 29 | Construire une requête SQL par concaténation de chaînes (injection SQL) | 28 |
| 30 | Oublier `rollback()` dans le `catch` d'une transaction | 29 |
| 31 | Oublier de restaurer `autoCommit(true)` après une transaction manuelle | 29 |
| 32 | Race condition sur un décrément de stock sans `UPDATE ... WHERE quantite >= ?` atomique | 31 |
| 33 | Glisser de la logique métier dans une classe DAO (doit rester dans la couche Service) | 30 |
| 34 | `hibernate.hbm2ddl.auto=update` laissé actif en environnement de production | 32 |
| 35 | Entité JPA sans constructeur sans argument (requis par Hibernate via réflexion) | 32 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser cette annexe</span>
Face à un bug ou une erreur de compilation non identifiée, parcours cette liste par mots-clés avant de chercher ailleurs — la majorité des erreurs de débutant à intermédiaire en Java orienté objet et bases de données appartiennent à l'une de ces catégories déjà documentées avec leur solution dans le chapitre correspondant.
</div>
