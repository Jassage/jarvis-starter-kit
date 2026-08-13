<div class="chapitre-titre-num">CHAPITRE 51</div>

# Projet 2 — Mémoire académique avec bibliographie et table des matières

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
Ce deuxième projet fil rouge mobilise particulièrement les outils de documents longs de la Partie 8, jusqu'ici moins sollicités que dans le premier projet. À la fin de ce chapitre, tu sauras produire un mémoire académique complet, avec pagination mixte (chiffres romains puis arabes), notes de bas de page, bibliographie gérée par source, index, table des illustrations, et un processus de validation par un directeur de mémoire simulé.
</div>

**Ce chapitre ne comporte pas de matrice de compétences MOS dédiée** : il mobilise en pratique les objectifs déjà couverts, en particulier ceux du domaine 4 (Create and Manage References). Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 50 (premier projet, dont ce projet réutilise les acquis de base sans les redétailler), et en particulier les chapitres 28 à 33 (Partie 8, documents longs).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Cahier des charges du projet</span>
Un étudiant bénévole de l'ONG (déjà mentionné aux chapitres 29 et 30) doit remettre son mémoire de fin d'études sur un sujet de son choix en lien avec le secteur associatif. Le cahier des charges de son établissement est strict :

- Pages préliminaires (page de garde, remerciements, sommaire) numérotées en chiffres romains (i, ii, iii...), corps du mémoire numéroté en chiffres arabes à partir de 1.
- Au moins quatre chapitres, chacun démarrant sur une nouvelle page impaire (convention éditoriale des mémoires reliés).
- En-tête avec le titre du mémoire sur les pages impaires, le titre du chapitre en cours sur les pages paires.
- Au moins six citations de sources différentes (livres, articles, sites web), gérées via le gestionnaire de sources, avec bibliographie complète en style APA.
- Au moins trois notes de bas de page apportant des précisions complémentaires sans alourdir le texte principal.
- Un index d'au moins huit termes techniques, avec au moins deux sous-entrées.
- Au moins deux figures et un tableau légendés, recensés dans une table des illustrations.
- Au moins un renvoi dynamique dans le texte vers une figure.
- Une relecture simulée par un directeur de mémoire n'ayant pas utilisé le suivi des modifications, nécessitant une comparaison de documents après coup.
- Une page de validation avec ligne de signature du directeur de mémoire.

Adapte le sujet du mémoire à un domaine de ton choix, tant que chaque exigence structurelle est respectée.
</div>

## Étape 1 — Structure des pages préliminaires et pagination mixte

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Crée la page de garde, une page de remerciements, et une page réservée au sommaire (qui sera générée à l'étape 6) — chacune sur sa propre page.
2. Insère un saut de section "Page suivante" (chapitre 15) juste avant le début du premier chapitre du corps du mémoire.
3. Dans les pages préliminaires, insère une numérotation de page (chapitre 14) au format "i, ii, iii" (Insertion > Numéro de page > Format des numéros de page).
4. Dans la section du corps du mémoire, insère une numérotation distincte au format arabe classique, réglée pour redémarrer "À partir de 1" (chapitre 14, section 14.6) — puisque les deux sections ne sont pas liées par défaut selon le type de saut choisi, vérifie ce comportement avant de continuer.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Point de contrôle avant de continuer</span>
Rappel du chapitre 15 : vérifie en mode "Plusieurs pages" (chapitre 6) que la numérotation romaine s'arrête bien à la dernière page préliminaire, et que le "1" arabe démarre bien sur la première page du corps du mémoire.
</div>

## Étape 2 — Chapitres démarrant sur une page impaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Rédige au moins quatre chapitres, chacun avec un titre de niveau 1 (chapitre 9) et plusieurs sous-sections de niveau 2.
2. Entre chaque chapitre, insère un saut de section de type **"Page impaire"** (chapitre 15, section 15.2) plutôt qu'un simple saut de page — la convention éditoriale demandée par le cahier des charges.
3. Vérifie, en mode Plusieurs pages, que chaque nouveau chapitre démarre bien sur une page de droite, quitte à laisser une page blanche si nécessaire.
</div>

## Étape 3 — En-têtes alternés

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Dans la section du corps du mémoire, active **"Pages paires et impaires différentes"** (chapitre 14, section 14.5).
2. Sur les pages impaires, tape le titre complet du mémoire.
3. Sur les pages paires, tape le titre du chapitre en cours — en l'absence de champ automatique reliant l'en-tête au titre du chapitre actif, mets-le à jour manuellement à chaque nouveau chapitre, ou utilise un champ `STYLEREF` (Insertion > Quick Part > Champ > StyleRef, chapitre 35) référençant le style "Titre 1" pour une mise à jour automatique.
</div>

## Étape 4 — Citations, notes de bas de page et bibliographie

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Choisis le style de citation **APA** (chapitre 30).
2. Crée six sources d'au moins trois types différents (livre, article de revue, site web) dans le gestionnaire de sources, en vérifiant le type de source à chaque création.
3. Insère chaque citation dans le texte à l'endroit pertinent, en réutilisant une source déjà créée si elle est citée plusieurs fois.
4. Ajoute au moins trois notes de bas de page (chapitre 29) pour des précisions qui alourdiraient le texte principal si elles y figuraient directement.
5. En fin de mémoire, génère la bibliographie complète (chapitre 30).
</div>

## Étape 5 — Figures, tableau et table des illustrations

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Insère au moins deux figures (images ou graphiques, chapitres 21 et 24) et légende-les avec l'étiquette "Figure" (chapitre 31).
2. Insère un tableau de données pertinent au sujet du mémoire, légende-le avec l'étiquette "Tableau".
3. Dans le texte, insère au moins un renvoi dynamique (chapitre 32) du type "voir Figure X" pointant vers l'une des figures.
4. En fin de mémoire, génère une table des illustrations pour les figures, et une seconde distincte pour les tableaux (chapitre 31, rappel qu'une seule étiquette par table).
</div>

## Étape 6 — Index et sommaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Marque au moins huit termes techniques du mémoire comme entrées d'index (chapitre 31), en utilisant "Marquer tout" à chaque fois, et en structurant au moins deux d'entre elles avec une sous-entrée.
2. Génère l'index complet en toute fin de document.
3. Reviens sur la page de sommaire réservée à l'étape 1, et génère la table des matières automatique (chapitre 28), avec au moins deux niveaux affichés.
</div>

## Étape 7 — Relecture sans suivi des modifications, puis comparaison

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Enregistre une copie du mémoire nommée "Memoire_Original.docx".
2. Sur une seconde copie, simule les corrections directes d'un directeur de mémoire n'ayant **pas** activé le suivi des modifications (chapitre 38) — apporte au moins cinq changements directement dans le texte, sans aucune marque de révision.
3. Utilise **Comparer** (chapitre 40) entre les deux fichiers pour reconstituer automatiquement ces cinq modifications sous forme de marques de révision.
4. Examine chaque modification reconstituée, accepte ou rejette-la en connaissance de cause.
</div>

## Étape 8 — Validation finale

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Ajoute une page de validation en toute fin de document, avec une ligne de signature (chapitre 43) au nom du directeur de mémoire.
2. Actualise l'ensemble des champs du document (`Ctrl+A` puis `F9`, chapitre 27) : table des matières, index, tables des illustrations, renvois, numéros de page.
3. Vérifie l'accessibilité (chapitre 46) et exporte le mémoire final en PDF avec signets basés sur les titres (chapitre 45).
</div>

## Grille d'auto-évaluation finale

<div class="encadre exercice">
<span class="encadre-titre">✅ Vérifie chaque exigence du cahier des charges avant de considérer le projet terminé</span>
<ul class="checklist">
<li>☐ Les pages préliminaires sont numérotées en chiffres romains, le corps en chiffres arabes redémarrant à 1.</li>
<li>☐ Chaque chapitre démarre sur une page impaire, via un saut de section approprié.</li>
<li>☐ Les en-têtes alternent correctement entre pages paires et impaires.</li>
<li>☐ Au moins six sources de trois types différents sont citées, avec une bibliographie complète en style APA.</li>
<li>☐ Au moins trois notes de bas de page apportent des précisions complémentaires.</li>
<li>☐ Un index d'au moins huit termes, avec au moins deux sous-entrées, est généré.</li>
<li>☐ Deux figures et un tableau sont légendés, recensés dans des tables des illustrations distinctes.</li>
<li>☐ Au moins un renvoi dynamique vers une figure fonctionne correctement.</li>
<li>☐ Une comparaison de documents a permis de reconstituer les corrections d'un relecteur n'ayant pas utilisé le suivi des modifications.</li>
<li>☐ Une page de validation avec ligne de signature clôt le mémoire.</li>
<li>☐ Tous les champs ont été actualisés avant l'export final.</li>
<li>☐ Le PDF final a été vérifié pour l'accessibilité et exporté avec ses signets.</li>
</ul>
</div>

## Pour aller plus loin

<div class="encadre defi">
<span class="encadre-titre">🏆 Variante — utiliser le mode Plan pour réorganiser les chapitres</span>
Une fois le mémoire rédigé, utilise le mode Plan (chapitre 33) pour inverser l'ordre de deux chapitres entiers, en vérifiant que chaque saut de section "Page impaire" associé à chaque chapitre continue de fonctionner correctement après ce déplacement.
</div>

<div class="encadre defi">
<span class="encadre-titre">🏆 Variante — changer de style de citation à la dernière minute</span>
Simule une demande de dernière minute du jury exigeant le style Chicago plutôt qu'APA (chapitre 30, section 30.5). Change le style dans le menu déroulant et vérifie que toutes les citations et la bibliographie se reforment automatiquement, sans reconstruction manuelle.
</div>

---

*Chapitre suivant : Projet 3 — campagne de publipostage pour une organisation, un troisième scénario complet mobilisant cette fois particulièrement l'automatisation de la Partie 9.*
