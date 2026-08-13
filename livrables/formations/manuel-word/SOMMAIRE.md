# Manuel de référence Microsoft Word — Sommaire

## Partie 1 — Découverte de Microsoft Word
1. Présentation de Microsoft Word : histoire, positionnement et écosystème
2. Installation et configuration (Microsoft 365, Office 2021, Word Web, Word Mobile)
3. Découverte de l'interface : Ruban, onglets, barre d'accès rapide, mode Backstage
4. Personnalisation de l'interface et des options

## Partie 2 — Manipuler les documents
5. Créer, ouvrir, enregistrer et gérer ses documents
6. Modes d'affichage, navigation et zoom
7. Sélection, presse-papiers et déplacement de texte
8. Correction automatique, orthographe et grammaire

## Partie 3 — Mise en forme du texte
9. Mise en forme des caractères
10. Mise en forme des paragraphes
11. Listes à puces, numérotées et multiniveaux
12. Tabulations

## Partie 4 — Mise en page et structure du document
13. Mise en page : marges, orientation, format, sections
14. En-têtes, pieds de page et numérotation
15. Sauts de page et sauts de section
16. Colonnes et mises en page avancées

## Partie 5 — Styles, thèmes et modèles
17. Styles de texte et styles rapides
18. Thèmes du document
19. Modèles : créer, utiliser, personnaliser
20. Cohérence visuelle et jeux de styles

## Partie 6 — Objets visuels
21. Images : insertion et mise en forme
22. Formes, zones de texte et WordArt
23. SmartArt
24. Graphiques
25. Icônes, captures d'écran et médias en ligne

## Partie 7 — Tableaux
26. Créer et mettre en forme un tableau
27. Tableaux avancés : formules, tri, conversion texte ↔ tableau

## Partie 8 — Documents longs et références
28. Table des matières automatique
29. Notes de bas de page et notes de fin
30. Citations et bibliographie
31. Index et table des illustrations
32. Signets, renvois et liens hypertexte
33. Gérer un document long (mode Plan, sous-documents)

## Partie 9 — Publipostage et automatisation
34. Publipostage : lettres, étiquettes, enveloppes, e-mails
35. Champs et Quick Parts
36. Initiation aux macros (enregistreur de macros)
37. Introduction à VBA pour Word

## Partie 10 — Collaboration et révision
38. Suivi des modifications (mode Révision)
39. Commentaires
40. Comparer et fusionner des documents
41. Coauteur en temps réel (OneDrive, SharePoint, Teams)

## Partie 11 — Protection, impression et export
42. Protection des documents (mot de passe, restriction d'édition)
43. Signatures numériques et authenticité
44. Impression avancée
45. Export PDF et autres formats

## Partie 12 — Accessibilité, Microsoft 365 et intelligence artificielle
46. Accessibilité des documents
47. Word et l'écosystème Microsoft 365 (OneDrive, Teams, Outlook)
48. Word Online face à Word Desktop
49. Copilot et l'intelligence artificielle dans Word

## Partie 13 — Projets fil rouge
50. Projet 1 : rapport professionnel complet, de zéro à finalisé
51. Projet 2 : mémoire académique avec bibliographie et table des matières
52. Projet 3 : campagne de publipostage pour une organisation

## Partie 14 — Préparation à la certification Microsoft Office Specialist (MOS)
53. Vue d'ensemble et méthode de préparation à la certification MOS Word
54. Examen blanc n°1 corrigé
55. Examen blanc n°2 corrigé

## Annexes
A. Aide-mémoire général des raccourcis clavier
B. Glossaire complet
C. Tableaux comparatifs (Word vs Google Docs, Word vs LibreOffice Writer, Word Desktop vs Word Online, Microsoft 365 vs Office 2021, DOC vs DOCX, styles vs mise en forme directe, tabulations vs tableaux, thèmes vs styles)
D. Ressources complémentaires et pour aller plus loin

---

**Décisions techniques** (reprend les mêmes conventions que `manuel-nodejs`, `manuel-react` et les autres manuels du portefeuille) :
- Toolchain identique : chapitres en Markdown (`chapitres/`), assemblage `pandoc` via `build.ps1`, export HTML autonome + DOCX (table des matières native Word) + PDF (Puppeteer/Edge headless, pied de page personnalisé sans date/URL).
- Diagrammes en Mermaid (```` ```mermaid ````), pré-rendus en PNG au moment du build par `render-mermaid.js` (ni pandoc ni les exports PDF/DOCX n'exécutent de JavaScript). Schémas ASCII simples en blocs `{.uml}` quand un vrai diagramme Mermaid est superflu.
- Identité visuelle propre à ce manuel : bleu Word (`#2b579a` / `#1b3f73`) comme couleur de marque au lieu du vert de `manuel-nodejs`, reste de la structure CSS identique (`assets/style.css`).
- Palette de plans tarifaires — sans objet ici (pas un projet logiciel).
- Saut de page sur le badge « CHAPITRE X », jamais sur le `<h1>` lui-même (les deux doivent rester collés en haut de la nouvelle page).

---

## Gabarit de chapitre

Ce manuel vise le niveau d'un ouvrage de référence (Microsoft Press / ENI / Dunod) utilisable en université, en centre de formation et en autoformation, avec une préparation explicite à la certification MOS. Chaque chapitre suit donc un gabarit plus riche que celui des manuels techniques du portefeuille (`manuel-nodejs` etc.), pour répondre point par point au cahier des charges pédagogique validé avec Jaslin. Aucune section n'est optionnelle sauf mention contraire.

1. **Badge + titre** (`CHAPITRE X`).
2. **🎯 Objectifs pédagogiques** (encadré `objectif`) — ce que le lecteur saura faire à la fin, formulé en actions concrètes.
3. **Matrice de compétences MOS** — tableau `Compétence traitée | Domaine MOS | Code` citant les codes exacts d'`assets/mos-objectifs.md` (ex. `1.2.3 Insert and modify headers and footers`, MO-100 Associate ou MO-101 Expert). Sur un chapitre sans objectif d'examen réel (histoire, installation...), une ligne unique remplace le tableau : *"Ce chapitre ne correspond à aucun objectif testé par l'examen MOS — voir chapitre X pour la première compétence évaluée."* Jamais de rattachement artificiel à un code qui ne correspond pas réellement au contenu.
4. **Prérequis** — connaissances/chapitres nécessaires avant d'attaquer celui-ci (une ligne, pas d'encadré si le chapitre suit directement le précédent).
5. **🎬 Mise en situation** (encadré `scenario`) — un scénario professionnel réaliste (entreprise, université, administration...) qui ouvre le chapitre et lui donne un enjeu concret.
6. **Sections numérotées (X.Y)** — le cœur du chapitre : définitions précises avant tout usage du terme, explications détaillées, exemple simple puis exemple professionnel pour chaque notion importante, analogies (`astuce`), encadrés `bonne-pratique` / `mauvaise-pratique` / `securite` / `performance` / `retenir` / `memoriser` / `saviez-vous` (anecdote historique ou technique) / `expert` (astuce avancée, fonctionnalité peu connue), tableaux comparatifs quand pertinent, schémas ASCII/Mermaid, emplacements `capture` 📷 décrivant précisément la capture d'écran à réaliser (objectif, contenu exact, zones à surligner, annotations/flèches, légende).
7. **💼 Cas professionnels** (encadrés `cas-pro`) — déclinaison de la notion dans 3 à 5 contextes parmi entreprise, administration, université, hôpital, cabinet juridique, collectivité, ONG, PME, association, établissement scolaire (jamais les dix systématiquement — seulement ceux où l'usage diffère réellement).
8. **Atelier(s)** (encadré `exercice`) — mini-laboratoire(s) guidé(s) : Préparation / Étapes détaillées / Résultat attendu / Dépannage. Quand un chapitre compte plusieurs ateliers, chacun (sauf le premier) reprend le document laissé ouvert par le précédent plutôt que de repartir de zéro (continuité inspirée du "PRÉPAREZ-VOUS" / "UTILISEZ le document ouvert dans l'exercice précédent" du MOAC Word 2016) — moins répétitif, plus proche d'un usage réel.
9. **🏆 Défi** (encadré `defi`) — exercice plus difficile et plus ouvert que l'atelier, sans étapes détaillées, pour les lecteurs avancés.
10. **Mini-projet** — uniquement sur les chapitres charnière (fin de partie), un livrable concret combinant plusieurs notions du chapitre.
11. **Erreurs fréquentes** (encadrés `attention`) — au moins 3, avec la cause exacte, pas seulement le symptôme.
12. **Dépannage** — format symptôme → diagnostic → résolution, pour les blocages techniques réels (pas les erreurs de compréhension, déjà couvertes ci-dessus).
13. **En entreprise** — bonnes pratiques et erreurs classiques observées en contexte professionnel réel.
14. **🚀 Astuces avancées** (encadré `expert`) — raccourcis, fonctions peu connues, gains de productivité mesurables.
15. **🎓 Préparation MOS** (encadré `mos`) — reprend les codes de la Matrice de compétences en fin de chapitre : pièges fréquents du format d'examen, recommandation, un exercice calibré au format MOS.
16. **Résumé du chapitre** — 5 à 8 puces, jamais un simple copier-coller des titres de section.
17. **Quiz** (encadré `exercice`) — QCM, Vrai/Faux, questions ouvertes, corrigés systématiques et expliqués (pas juste la lettre de la bonne réponse).
18. **Exercices progressifs** — numérotés, difficulté croissante, corrigé détaillé pour chacun.
19. **Checklist de fin de chapitre** (`<ul class="checklist">`).
20. **Aide-mémoire** — raccourcis clavier du chapitre + points clés, format compact scannable.
21. **FAQ** (`<dl class="faq">`).
22. **Références et ressources complémentaires**.
23. Phrase de transition finale vers le chapitre suivant.

**Icônes ↔ classes CSS** (`assets/style.css`) : 🎯 `objectif`, 🎬 `scenario`, 💡 `astuce`, 📌 `retenir`, ⚠️ `attention`, ✅ `bonne-pratique`, ❌ `mauvaise-pratique`, 🔒 `securite`, 🚀 `performance` (perf) / `expert` (astuce avancée), 🧠 `memoriser` / `saviez-vous` (anecdote), 🎓 `mos`, 📷 `capture`, 📝 `exercice`, 🏆 `defi`, 🔍 `explorer`, 💼 `cas-pro`.

**Contrôle qualité avant de clore un chapitre** (dix questions du prompt maître, appliquées systématiquement) : compréhensible par un débutant complet, notions importantes toutes couvertes, exemples variés (simples + professionnels), captures d'écran décrites précisément, exercices réellement applicables, erreurs fréquentes traitées, lecture agréable, explications suffisamment détaillées, conseils professionnels présents, niveau comparable à un manuel Microsoft Press. Toute réponse négative déclenche une reprise du chapitre avant de passer au suivant.

**Méthode de production** : un chapitre à la fois, jamais en lot, avec feu vert de Jaslin avant de passer au suivant. Chapitre 1 a servi de pilote et a validé le gabarit avec Jaslin le 2026-08-02 ; la Matrice de compétences MOS (point 3 ci-dessus) a été ajoutée au gabarit le même jour après comparaison avec le *MOAC Word 2016* (Wiley), et rétroportée aux chapitres 1 et 2 pour rester cohérente sur l'ensemble du manuel.
