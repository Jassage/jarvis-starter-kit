# Manuel Java — De Zéro à Développeur Java (VERSION 2) — Sommaire

> Réécriture pédagogique complète du manuel Java POO original (`manuel-java-poo/`, conservé intact),
> pensée pour un lecteur qui n'a jamais programmé. Méthode systématique par notion : problème → analogie
> de la vie réelle → explication simple → premier exemple → explication ligne par ligne → deuxième exemple →
> erreurs fréquentes → exercice → correction → défi → résumé.

## Partie 1 — Découvrir Java
1. Bienvenue dans le monde de la programmation

## Partie 2 — Les bases indispensables (nouveau vs V1)
2. Les variables
3. Les types de données
4. Les opérateurs
5. Les conditions
6. Les boucles
7. Les méthodes

## Partie 3 — Entrer dans la POO
8. Pourquoi avons-nous besoin de la POO ?
9. Classes et objets
10. Constructeurs
11. Encapsulation
12. Héritage
13. Polymorphisme
14. Abstraction
15. Interfaces

## Partie 4 — Maîtriser la POO
16. Relations entre objets (association, agrégation, composition)
17. Classes, objets et relations complexes (Client, Commande, Produit, Paiement)

## Partie 5 — Collections
18. Les tableaux
19. ArrayList
20. HashSet
21. HashMap

## Partie 6 — Gestion des erreurs
22. Les exceptions
23. Exceptions personnalisées

## Partie 7 — Fichiers
24. Lire et écrire dans des fichiers

## Partie 8 — Java moderne
25. Enum
26. Generics
27. Lambda
28. Optional
29. Stream API

## Partie 9 — UML
30. Comprendre UML (classes, cas d'utilisation, séquence, activités)

## Partie 10 — Base de données
31. Comprendre une base de données
32. SQL indispensable

## Partie 11 — JDBC
33. Connecter Java à MySQL
34. CRUD avec JDBC
35. DAO

## Partie 12 — Architecture professionnelle
36. Organiser un projet Java
37. MVC
38. DTO et Repository

## Partie 13 — Tests
39. Pourquoi tester son programme ? (JUnit 5)

## Partie 14 — Outils professionnels
40. IntelliJ IDEA / VS Code
41. Maven
42. Git et GitHub

## Partie 15 — Bonnes pratiques
43. Écrire du bon code

## Partie 16 — SOLID
44. Les principes SOLID

## Partie 17 — Design Patterns
45. Design Patterns (Singleton, Factory, Builder, Strategy, Observer, Adapter, Decorator)

## Partie 18 — Projets progressifs
46. Projet 1 — Calculatrice
47. Projet 2 — Gestion des étudiants
48. Projet 3 — Gestion d'une bibliothèque
49. Projet 4 — Gestion d'un magasin
50. Projet 5 — Gestion bancaire
51. Projet 6 — Gestion scolaire
52. Projet 7 — Gestion commerciale avec MySQL

## Partie 19 — Projet final
53. GestionCommerciale — projet professionnel complet (UI → Controller → Service → DAO → Database)

## Annexes
A. (54) Dictionnaire Java — glossaire de tous les termes techniques du manuel
B. (55) Aide-mémoire — syntaxe, commandes Maven/Git, raccourcis IDE
C. (56) Erreurs fréquentes récapitulées (toutes parties confondues)
D. (57) Bibliographie, conclusion et feuille de route pour continuer après le manuel

---

## Décisions techniques (base de travail V2)

- **Dossier séparé** `manuel-java-poo-v2/`, le manuel V1 (`manuel-java-poo/`) reste intact et disponible — rien n'est supprimé, conformément à la consigne. Même pipeline de build (pandoc → HTML/DOCX/PDF via `build.ps1`, PDF via Edge/Puppeteer via `print-pdf.js`).
- **Contenu technique repris de V1** partout où il est déjà correct (héritage, polymorphisme, collections, JDBC, DAO, SOLID, Design Patterns, etc.), mais **entièrement retravaillé pédagogiquement** : analogie de la vie réelle avant toute définition, vocabulaire expliqué au premier usage, progression beaucoup plus lente, exercices 3 niveaux + défi sur chaque chapitre.
- **Contenu entièrement nouveau vs V1** : toute la Partie 2 (variables, types, opérateurs, conditions, boucles, méthodes — V1 partait directement de la POO sans les bases Java), le chapitre 39 (Tests/JUnit), la Partie 14 (outils IDE/Maven/Git), les 7 projets progressifs de la Partie 18 (V1 n'avait qu'un seul projet POO + un projet intégrateur MySQL), Optional (ch.28).
- **Révisions de fin de partie** (résumé, carte mentale ASCII, questions de révision, QCM, mini-projet) : intégrées comme dernière section du **dernier chapitre de chaque partie**, plutôt qu'en fichiers séparés, pour garder un nombre de fichiers gérable sans rien sacrifier du contenu demandé.
- **SOLID et Design Patterns** : un seul chapitre par sujet (comme en V1), structuré en sous-sections par principe/pattern, chacune suivant mauvais code → problème → amélioration → bon code, plutôt qu'un chapitre par principe (61 fichiers sinon).
- **Encadrés pédagogiques** : `astuce` / `attention` / `exercice` (repris de V1) + trois nouveaux introduits en V2 : `vocabulaire` (terme technique expliqué au premier usage), `progression` (🎯 Ce que tu sais maintenant), `defi` (petit problème à résoudre seul, corrigé différée).
- **Front matter** : `00-preface.md` (préface, objectifs, prérequis, mode d'emploi), avant le chapitre 1.
- **Diagrammes** : pré-rendus en vrais diagrammes Mermaid (35, classDiagram/sequenceDiagram/flowchart/mindmap/gitGraph selon le cas) via `render-mermaid.js` (paquet `mermaid` en devDependency, rendu dans l'Edge headless déjà utilisé pour le PDF — jamais `@mermaid-js/mermaid-cli`, dont le téléchargement de Chromium propre s'est révélé irréalisable dans cet environnement). Les blocs qui ne sont PAS de vrais diagrammes (annotations de code ligne par ligne, tables de données avec exemples concrets) restent en ASCII (`\`\`\`{.uml}\``), volontairement.
