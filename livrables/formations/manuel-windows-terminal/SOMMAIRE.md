# Manuel complet Windows Terminal, CMD et PowerShell — Sommaire

## Partie 1 — Comprendre le terminal Windows
1. Qu'est-ce qu'un terminal ?
2. Installation et configuration (Windows Terminal, PowerShell 7, Git Bash, OpenSSH)

## Partie 2 — Les bases de CMD
3. Navigation
4. Gestion des fichiers
5. Gestion des disques
6. Variables d'environnement
7. Les scripts Batch (.bat)

## Partie 3 — PowerShell
8. Introduction à PowerShell
9. Les cmdlets essentielles
10. Les objets PowerShell (pipeline orienté objet)
11. Variables, types et collections
12. Conditions
13. Boucles
14. Fonctions, modules et scripts
15. Gestion des processus, services et tâches planifiées
16. Gestion des utilisateurs Windows
17. Gestion des fichiers avancée (compression, recherche, regex)
18. Réseau
19. Administration Windows (registre, pare-feu, Defender, partages)
20. WMI et CIM
21. Active Directory (introduction)
22. Sécurité (NTFS, ACL, chiffrement, Execution Policy)
23. Automatisation
24. PowerShell et le Cloud (Azure, Microsoft 365, Graph, AWS, GCP)
25. PowerShell pour les développeurs (Git, Docker, Node.js, VS Code...)
26. PowerShell DevOps (CI/CD, Azure DevOps, GitHub Actions, Jenkins)
27. Débogage
28. Bonnes pratiques

## Partie 4 — Projets complets
29. Dix projets complets (gestionnaire de sauvegarde, nettoyeur Windows, gestionnaire de processus, scanner réseau, surveillance serveur, inventaire matériel, gestionnaire d'utilisateurs, déploiement automatique, outil d'administration, outil de maintenance)

## Partie 5 — Annexes
A. Référence des commandes CMD les plus utiles
B. Référence des cmdlets PowerShell les plus importantes
C. Raccourcis clavier et alias PowerShell
D. Expressions régulières
E. Erreurs fréquentes récapitulées
F. Bonnes pratiques récapitulées
G. Ressources officielles Microsoft

---

**Décisions techniques** (mêmes leçons que les 3 manuels précédents) :
- Couverture injectée via `--include-before-body` (avant le sommaire auto-généré).
- `-tex_math_dollars` désactivé dès le départ (PowerShell utilise énormément de `$`).
- Schémas en blocs de code `{.uml}` (texte/ASCII), jamais en `<div>` brut.
- PDF via script Puppeteer dédié (pied de page personnalisé, pas d'en-tête date/URL).
- Saut de page sur le badge "CHAPITRE X", pas sur le `<h1>`.
- Partie 4 : les 10 projets regroupés en un seul chapitre (comme les 10 études de cas du manuel Java), chacun avec script complet + explication, pour éviter la duplication avec les projets déjà démontrés dans les chapitres théoriques.
- Annexes A/B : références curées et organisées par catégorie (commandes CMD réellement natives ~140 + combinaisons de commutateurs ; cmdlets PowerShell les plus utilisées en pratique ~200-250), plutôt que des listes gonflées artificiellement pour atteindre un chiffre rond — la qualité et l'utilité réelle priment sur le compte exact.
