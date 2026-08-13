# Windows Terminal & PowerShell — De zéro à administrateur (VERSION 2) — Sommaire

> Réécriture pédagogique complète du manuel Windows Terminal/CMD/PowerShell original (`manuel-windows-terminal/`, conservé intact),
> pensée pour un lecteur qui n'a jamais ouvert un terminal. Méthode systématique par notion : le problème → analogie de la vie
> réelle → explication simple → première commande → décomposition → exemple réel → erreurs fréquentes → exercice → correction →
> défi → résumé. Chapitre suivant la structure `🎯 Objectifs / 🧠 Comprendre / 💻 Démonstration / 🔍 Décortiquons / ⚠️ Attention /
> 📝 Exercice facile / 📝 Exercice intermédiaire / 🔥 Défi / ✅ Correction / 🎯 Ce que tu sais maintenant`.

## Partie 1 — Comprendre l'ordinateur (nouveau vs V1)
1. Comment fonctionne un ordinateur ?

## Partie 2 — Découvrir le terminal
2. Qu'est-ce qu'un terminal ?

## Partie 3 — Windows Terminal
3. Installer et configurer Windows Terminal

## Partie 4 — CMD
4. Premières commandes CMD (dir, cd, cls, echo, help)
5. Naviguer dans Windows (lecteurs, arborescence, tree)
6. Gérer les fichiers avec CMD (mkdir → robocopy)
7. Variables et environnement CMD (PATH, set, setx)

## Partie 5 — Scripts Batch
8. Créer son premier script .bat (jusqu'aux menus et fonctions)

## Partie 6 — Découvrir PowerShell
9. Pourquoi PowerShell ? (le monde des objets)
10. Première commande PowerShell (Get-Help, Get-Command, Get-Member...)

## Partie 7 — Maîtriser les fichiers avec PowerShell
11. Fichiers et dossiers en PowerShell (Get-ChildItem → Add-Content)

## Partie 8 — Comprendre les objets PowerShell
12. Objets, propriétés, méthodes et pipeline

## Partie 9 — Variables et types
13. Variables, types et collections PowerShell

## Partie 10 — Programmation PowerShell
14. Conditions (if / elseif / else / switch)
15. Boucles (for / foreach / while / do)
16. Fonctions (paramètres, valeurs par défaut, validation, retour)

## Partie 11 — Administration Windows
17. Processus (Get-Process, Stop-Process, Start-Process)
18. Services (Get-Service, Start/Stop/Restart-Service)
19. Informations système (Get-ComputerInfo, Get-CimInstance)

## Partie 12 — Réseau
20. Diagnostic réseau, de ipconfig à Test-NetConnection

## Partie 13 — PowerShell et les API
21. Consommer une API REST (Invoke-RestMethod, JSON, Bearer Token)

## Partie 14 — Sécurité
22. UAC, permissions NTFS, Execution Policy et gestion des secrets

## Partie 15 — Automatisation
23. Automatiser ses tâches (sauvegardes, nettoyage, rapports, surveillance)

## Partie 16 — Modules et PowerShell avancé
24. Modules, manifestes et profil PowerShell

## Partie 17 — PowerShell Remoting
25. Administrer une machine à distance (WinRM, Invoke-Command)

## Partie 18 — PowerShell et Cloud
26. PowerShell et Azure (les bases du Cloud)

## Partie 19 — PowerShell pour le développeur
27. PowerShell avec Git, Node.js, Python et Docker

## Partie 20 — DevOps
28. PowerShell et les bases du DevOps (CI/CD, $LASTEXITCODE)

## Partie 21 — Débogage et dépannage
29. La méthode de dépannage et dix scénarios réels

## Partie 22 — Projets complets (progressifs)
30. Projet 1 — Nettoyeur Windows
31. Projet 2 — Inventaire système
32. Projet 3 — Surveillance CPU / RAM / disque
33. Projet 4 — Vérificateur réseau
34. Projet 5 — Scanner de ports pédagogique
35. Projet 6 — Gestionnaire de services
36. Projet 7 — Système de sauvegarde
37. Projet 8 — Administration de plusieurs machines
38. Projet 9 — Module PowerShell personnel
39. Projet 10 — Outil complet d'administration Windows

## Partie 23 — Chemin vers le niveau professionnel
40. La feuille de route : dix niveaux, du débutant au professionnel

## Annexes
A. (41) Glossaire final — dictionnaire des termes du manuel
B. (42) Cheat sheet — 100 commandes CMD essentielles
C. (43) Cheat sheet — 200 cmdlets PowerShell essentielles
D. (44) Cheat sheet — 50 commandes réseau
E. (45) Cheat sheet — 50 commandes d'administration Windows
F. (46) Cheat sheet — 50 commandes PowerShell pour développeurs
G. (47) Erreurs fréquentes récapitulées (toutes parties confondues)
H. (48) Ressources officielles Microsoft

---

## Décisions techniques (base de travail V2)

- **Dossier séparé** `manuel-windows-terminal-v2/`, le manuel V1 (`manuel-windows-terminal/`) reste intact et disponible — rien n'est supprimé. Même pipeline de build (pandoc → HTML/DOCX/PDF via `build.ps1`, PDF via Edge/Puppeteer via `print-pdf.js`), mêmes réglages (`-tex_math_dollars` désactivé dès le départ à cause des `$` omniprésents en PowerShell, couverture injectée via `--include-before-body`, schémas en blocs `{.uml}` texte).
- **Contenu technique repris de V1** partout où il est déjà exact (commandes, paramètres, syntaxe PowerShell 7, WMI/CIM, Azure, DevOps...), vérifié au passage pour éviter toute syntaxe obsolète, mais **entièrement retravaillé pédagogiquement** : jamais de commande introduite sans le problème qu'elle résout, une analogie de la vie réelle avant toute définition, vocabulaire technique expliqué au premier usage, progression beaucoup plus lente, exercices à plusieurs niveaux + défi sur chaque notion importante.
- **Contenu entièrement nouveau vs V1** : toute la Partie 1 (comment fonctionne un ordinateur — processeur, RAM, disque, OS, fichiers, dossiers, programmes, processus, services, réseau — V1 partait directement du terminal sans ces bases), la Partie 23 (feuille de route en dix niveaux), le chapitre 29 (méthode de dépannage formalisée en 8 étapes + dix scénarios narratifs), et le Glossaire final séparé (annexe A) — V1 n'avait que des annexes de référence, pas un dictionnaire pédagogique.
- **Encadrés pédagogiques** : `astuce` / `attention` / `exercice` (repris de V1, mêmes couleurs) + trois nouveaux introduits en V2 : `vocabulaire` (terme technique expliqué au premier usage, violet), `defi` (🔥 problème à résoudre seul, corrigé différée, rouge), `progression` (🎯 "Ce que tu sais maintenant", checklist de compétences, turquoise).
- **Structure de chapitre** : chaque chapitre suit `🎯 Objectifs` → `🧠 Comprendre` (problème + analogie + explication) → `💻 Démonstration` (première commande) → `🔍 Décortiquons` (décomposition) → un ou plusieurs exemples réels → `⚠️ Attention` (erreurs fréquentes) → `📝 Exercice facile` → `📝 Exercice intermédiaire` → `🔥 Défi` → `✅ Correction` → `🎯 Ce que tu sais maintenant`. Sur les chapitres couvrant plusieurs notions indépendantes (ex. chapitre 4, plusieurs commandes CMD), le cycle complet se répète par notion plutôt qu'une seule fois pour tout le chapitre.
- **Projets (Partie 22)** : dix fichiers séparés (un par projet, ch. 30-39) plutôt qu'un seul chapitre fourre-tout comme en V1 — chaque projet suit le cycle complet demandé (cahier des charges → analyse → conception → architecture → développement étape par étape → tests → gestion des erreurs → amélioration → documentation), ce qui aurait rendu un fichier unique illisible.
- **Annexes B/C (cheat sheets CMD/PowerShell)** : reprises et retravaillées depuis les annexes A/B de V1 (déjà curées, ~140 commandes CMD réellement natives et ~200-250 cmdlets les plus utilisées en pratique) — philosophie inchangée : la qualité et l'utilité réelle priment sur un compte artificiellement gonflé pour atteindre un chiffre rond.
- **Annexes D/E/F (cheat sheets thématiques réseau/admin/dev)** : nouvelles en V2, avec chevauchement volontaire et assumé avec B/C (une commande réseau essentielle apparaît aussi bien dans la cheat sheet PowerShell générale que dans la cheat sheet réseau) — l'objectif est qu'un lecteur cherchant "je fais du réseau aujourd'hui" trouve tout au même endroit sans devoir recouper plusieurs annexes.
