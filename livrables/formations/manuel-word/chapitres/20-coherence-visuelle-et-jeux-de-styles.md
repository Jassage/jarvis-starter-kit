<div class="chapitre-titre-num">CHAPITRE 20</div>

# Cohérence visuelle et jeux de styles

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer comment styles, thème et modèle s'articulent ensemble comme un seul système de cohérence, plutôt que trois fonctionnalités isolées ; auditer un document existant pour repérer les incohérences visuelles qui trahissent une absence de méthode ; construire, de bout en bout, une méthode de travail reproductible pour garantir la cohérence documentaire d'une petite organisation ; et mener à bien un mini-projet combinant l'ensemble des notions de la Partie 5.
</div>

**Matrice de compétences MOS**

Ce chapitre de synthèse ne couvre aucun objectif MOS supplémentaire au-delà de ceux déjà traités en détail aux chapitres 17 (création et modification de styles), 18 (thèmes et jeux de styles) et 19 (modèles). Il consolide leur usage combiné en une méthode, un savoir-faire transversal réellement attendu à l'examen mais qui ne correspond à aucun objectif isolé du référentiel. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitres 17, 18 et 19, dont ce chapitre combine directement les acquis.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Trois mois après la mise en place des styles, du thème et du modèle de l'ONG (chapitres 17 à 19), ta responsable te transmet un rapport reçu d'un nouveau collègue, visiblement pas encore formé à ces outils : titres tantôt en gras manuel tantôt en vrai style, deux nuances de bleu légèrement différentes selon les pages, un espacement de paragraphe tantôt réglé tantôt simulé par des lignes vides. "On dirait que chacun fait un peu à sa sauce", constate-t-elle. Ce chapitre te donne la méthode pour diagnostiquer précisément ce type de problème et y remédier durablement, pas seulement sur ce document isolé.
</div>

## 20.1 Le triangle de la cohérence : styles, thème, modèle

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la synthèse de trois chapitres</span>
Trois niveaux, imbriqués, garantissent la cohérence visuelle d'une organisation :
</div>

```{.uml}
                      MODELE (.dotx)
                  point de depart reutilisable
                 (chapitre 19)
                        |
            contient et applique
                        |
                        v
        STYLES  <-------+-------->  THEME
   (Titre 1, Normal,           (couleurs, polices,
    Alerte financiere...)       effets - chapitre 18)
    definition du CONTENU       definition de l'APPARENCE
    structurel (chapitre 17)    globale reutilisee par
                                les styles
```

- Le **thème** (chapitre 18) définit l'apparence globale (couleurs, polices) sans se soucier de la structure du document.
- Les **styles** (chapitre 17) définissent la structure (ceci est un titre, ceci est une alerte) en faisant référence, autant que possible, aux couleurs et polices du thème plutôt qu'à des valeurs fixes.
- Le **modèle** (chapitre 19) fige cette combinaison styles + thème dans un fichier de départ réutilisable, pour que chaque nouveau document en hérite automatiquement, sans reconstruction manuelle.

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce triangle, et pas un seul outil</span>
Un thème seul, sans styles cohérents, ne sert à rien si chaque rédacteur continue à mettre en forme manuellement (chapitre 9) plutôt que d'appliquer les styles disponibles. Des styles parfaits, sans modèle pour les diffuser, restent enfermés dans le seul document où ils ont été créés (rappel du chapitre 17, section 17.6). Les trois s'appuient l'un sur l'autre ; retirer un des trois affaiblit sérieusement les deux autres.
</div>

## 20.2 Diagnostiquer un document incohérent

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 52 — Auditer le rapport du nouveau collègue</span>

**Objectif** : repérer méthodiquement les incohérences décrites dans la mise en situation, avant de les corriger.

**Préparation** : reprends (ou recrée un exemple similaire) un document avec des incohérences volontaires : un titre en gras manuel plutôt qu'en style Titre 1, une couleur bleue légèrement différente du thème officiel sur un autre titre, un espacement simulé par lignes vides sur certains paragraphes.

**Étapes détaillées — grille d'audit** :
1. **Styles réellement utilisés** : clique dans chaque titre du document et vérifie, dans le volet Styles (chapitre 9), si le style affiché correspond bien à "Titre 1"/"Titre 2", ou si c'est "Normal" avec une mise en forme manuelle qui l'imite visuellement.
2. **Couleurs** : sélectionne chaque élément coloré et vérifie, dans le sélecteur de couleur (chapitre 9), s'il s'agit d'une couleur du **thème actif** (affichée dans la rangée du haut du sélecteur, avec un nom comme "Accentuation 1") ou d'une couleur **standard/personnalisée** saisie manuellement (rangées du bas) — cette dernière ne changera jamais si le thème est modifié plus tard.
3. **Espacement** : affiche les marques de mise en forme (`Ctrl+Maj+8`, chapitre 6) pour repérer d'éventuelles lignes vides utilisées à la place d'un réglage d'espacement de paragraphe (chapitre 10).
4. Note chaque incohérence trouvée dans une liste, avec sa localisation précise dans le document.

**Résultat attendu** : une liste concrète et localisée des écarts entre ce document et la méthode attendue, prête à être corrigée section 20.3 plutôt que par une relecture visuelle approximative.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment reconnaître une couleur de thème d'une couleur figée</span>
Dans le sélecteur de couleur, les couleurs de la rangée du haut portent un nom lié au thème ("Accentuation 1", "Arrière-plan 2") et changeraient automatiquement si le thème actif changeait. Les couleurs des rangées suivantes ("Couleurs standard", "Personnalisées") restent, elles, figées quel que soit le thème appliqué ensuite — une différence invisible à l'œil sur le moment, mais déterminante pour la cohérence à long terme d'une organisation qui ferait évoluer sa charte graphique.
</div>

## 20.3 Corriger méthodiquement, sans tout reconstruire

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 53 — Remettre le rapport en conformité</span>

**Objectif** : corriger chaque incohérence relevée à l'atelier 52, en réutilisant les outils déjà maîtrisés plutôt qu'en retapant le document.

**Préparation** : reprends le document audité et la liste d'incohérences de l'atelier 52.

**Étapes détaillées** :
1. Pour chaque titre en gras manuel : sélectionne-le, applique le vrai style "Titre 1" ou "Titre 2" (chapitre 9) — la mise en forme manuelle disparaît automatiquement au profit du style.
2. Pour chaque couleur figée hors thème : sélectionne l'élément concerné, rouvre le sélecteur de couleur, choisis cette fois la couleur d'accentuation du thème plutôt que la couleur standard utilisée par erreur.
3. Pour chaque espacement simulé par lignes vides : supprime les lignes vides, applique le réglage d'espacement de paragraphe correct (chapitre 10), idéalement en vérifiant que le style utilisé l'intègre déjà nativement plutôt que de le régler paragraphe par paragraphe.
4. Une fois toutes les corrections faites, relance un audit rapide (étapes de l'atelier 52) pour confirmer qu'aucune incohérence ne subsiste.

**Résultat attendu** : un document entièrement conforme, corrigé en réutilisant les styles et le thème existants, sans retaper le moindre mot du contenu original.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Face à un document incohérent produit par un collègue, la correction méthodique (styles et couleurs de thème réappliqués) est presque toujours plus rapide que la reconstruction manuelle depuis zéro — un argument concret à faire valoir auprès d'une équipe encore réticente à apprendre les styles.
</div>

## 20.4 Construire une méthode de travail durable pour une organisation

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — ONG</span>
Après l'incident du rapport incohérent, l'ONG de la mise en situation formalise une procédure courte, documentée une seule fois : (1) tout nouveau rapport démarre du modèle officiel (chapitre 19), jamais d'un document vierge ni d'une copie d'un ancien rapport ; (2) toute mise en forme utilise un style existant, jamais un attribut de caractère manuel isolé pour un titre ou une alerte ; (3) toute couleur provient du sélecteur de thème, jamais d'une couleur standard ou personnalisée saisie au hasard. Cette procédure, une fois écrite et partagée, prévient la plupart des incohérences futures sans nécessiter de contrôle qualité systématique après coup.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — restreindre les styles disponibles pour forcer la cohérence</span>
Le volet complet des styles (chapitre 17) propose, via "Gérer les styles" > onglet "Restreindre", de limiter les styles visibles dans la galerie aux seuls styles officiels de l'organisation — masquant les styles intégrés non pertinents (comme certains styles de citation ou de bibliographie non utilisés par cette organisation précise) pour réduire le risque qu'un collaborateur choisisse, par méconnaissance, un style inadapté plutôt que celui réellement attendu.
</div>

## Mini-projet de fin de partie

<div class="encadre exercice">
<span class="encadre-titre">🏗️ Mini-projet — Identité documentaire complète d'une organisation fictive</span>

**Contexte** : ce mini-projet combine l'intégralité de la Partie 5 (chapitres 17 à 20) en un seul livrable concret, à la manière d'une mission réelle de mise en cohérence documentaire.

**Objectif** : construire, pour une organisation fictive de ton choix (PME, association, cabinet, établissement scolaire), un système complet de cohérence documentaire prêt à être partagé avec une équipe.

**Livrables attendus** :
1. Un **jeu de couleurs personnalisé** (chapitre 18) reprenant deux couleurs précises (codes hexadécimaux) de l'identité visuelle choisie.
2. Un **jeu de polices personnalisé** (chapitre 18) associant une police de titre et une police de corps cohérentes.
3. Un **thème complet** (chapitre 18) combinant les deux éléments précédents, enregistré en fichier `.thmx`.
4. Au moins **trois styles personnalisés** (chapitre 17) : un style de titre principal dérivé du thème, un style d'alerte ou de mise en avant (encadré, couleur), et un style de citation ou de note — chacun faisant référence aux couleurs du thème plutôt qu'à des couleurs figées.
5. Un **modèle** (`.dotx`, chapitre 19) intégrant le thème et les styles précédents, avec une structure de base minimale (titre, deux ou trois sections types) prête à être utilisée pour un premier document réel de cette organisation.
6. Un **document de test** créé à partir de ce modèle, démontrant que styles, thème et modèle fonctionnent bien ensemble sans incohérence (vérifiable avec la grille d'audit de la section 20.2).

**Critères de réussite** : le document de test final ne doit présenter aucune des trois incohérences types identifiées en section 20.2 — aucune couleur figée hors thème, aucun style imité manuellement, aucun espacement simulé par lignes vides.

**Format de restitution suggéré** : les quatre fichiers (jeu de couleurs et de polices intégrés au thème `.thmx`, modèle `.dotx`, document de test `.docx`) accompagnés d'un court texte expliquant les choix de couleurs et de polices retenus pour l'organisation choisie.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Convaincre un collègue réticent</span>
Un collègue expérimenté mais habitué à la mise en forme manuelle depuis des années te dit : "Ça marche très bien comme ça depuis dix ans, pourquoi changer maintenant ?" Rédige une réponse de 8 à 10 phrases qui ne se contente pas d'affirmer que les styles sont "mieux", mais qui s'appuie sur au moins trois arguments concrets tirés des chapitres 17 à 20 (temps de correction globale, cohérence entre plusieurs rédacteurs, facilité de mise à jour d'une charte graphique).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Corriger un document incohérent sans en identifier la cause structurelle</span>
Corriger visuellement un titre mal formaté sans vérifier s'il utilise réellement le bon style laisse le problème structurel intact (invisible à la navigation par titres, chapitre 6, ou à une future table des matières, chapitre 28) même si le rendu visuel semble corrigé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Créer un thème et des styles sans jamais les intégrer à un modèle</span>
Un travail de cohérence visuelle qui s'arrête aux chapitres 17 et 18, sans passer par le chapitre 19, oblige chaque nouveau document à réappliquer manuellement thème et styles depuis un document existant copié — un raccourci fragile plutôt qu'une véritable solution durable.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Négliger la formation de l'équipe une fois les outils en place</span>
Construire un système de cohérence documentaire irréprochable ne sert à rien si les personnes qui rédigent réellement les documents de l'organisation ne savent pas où trouver le modèle, ni pourquoi utiliser les styles plutôt que la mise en forme manuelle — la méthode de la section 20.4 doit être accompagnée d'une communication claire, pas seulement d'un fichier déposé quelque part.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : après correction, certains éléments reviennent à leur état incohérent après réouverture du document</span>

- **Diagnostic** : la correction a probablement été appliquée à une copie ou un brouillon non enregistré, ou un style intégré modifié localement a été écrasé par une version différente présente dans un modèle lié.
- **Résolution** : vérifier que le document a bien été enregistré (`Ctrl+S`) après chaque correction, et que le modèle attaché au document (chapitre 19) ne contredit pas les styles modifiés directement dans le document.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter par écrit, en une page simple, la procédure de cohérence documentaire d'une organisation (section 20.4), accessible à toute nouvelle recrue dès son arrivée.
- **Bonne pratique répandue** : désigner une personne responsable de la maintenance du thème et du modèle officiels, pour éviter que plusieurs versions légèrement différentes ne circulent sans coordination.
- **Erreur classique observée** : un système de cohérence documentaire techniquement parfait mais jamais communiqué à l'équipe, aussi inutile qu'un modèle jamais utilisé.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — vérifier la cohérence par un script ou un contrôle qualité périodique</span>
Une organisation produisant un grand volume de documents peut envisager, au-delà de ce manuel, une macro (chapitre 36) de contrôle qualité qui parcourt automatiquement un document et signale toute mise en forme manuelle suspecte (police hors thème, couleur figée) — une automatisation avancée qui prolonge directement la grille d'audit manuelle de la section 20.2.
</div>

## Résumé du chapitre

- Styles, thème et modèle forment un triangle de cohérence interdépendant : retirer l'un des trois affaiblit sérieusement les deux autres.
- Un audit méthodique (styles réellement utilisés, couleurs de thème contre couleurs figées, espacement réel contre lignes vides) repère les incohérences plus fiablement qu'une simple relecture visuelle.
- Corriger un document incohérent en réappliquant styles et couleurs de thème existants est presque toujours plus rapide qu'une reconstruction manuelle complète.
- Une méthode de travail documentée et communiquée à toute une équipe prévient la récurrence des incohérences, bien au-delà de la correction ponctuelle d'un seul document.
- Le mini-projet de ce chapitre combine l'intégralité de la Partie 5 en un livrable concret et réutilisable.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Une couleur de thème (rangée du haut du sélecteur de couleur) se distingue d'une couleur standard car :
   - a) Elle est toujours plus foncée
   - b) Elle change automatiquement si le thème actif change
   - c) Elle ne peut être appliquée qu'aux titres
   - d) Elle est incompatible avec l'impression

2. Le triangle de cohérence de ce chapitre relie :
   - a) Styles, thème, modèle
   - b) Tableaux, graphiques, images
   - c) Marges, orientation, format
   - d) Commentaires, révisions, protection

3. La méthode la plus efficace pour corriger un document truffé d'incohérences est généralement :
   - a) Retaper tout le document
   - b) Réappliquer les styles et couleurs de thème existants
   - c) Convertir le document en PDF
   - d) Supprimer toute mise en forme sans la remplacer

**Corrigé** : 1-b, 2-a, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un thème et des styles cohérents suffisent à garantir la cohérence documentaire sans modèle ni formation de l'équipe. — **Faux** (les trois éléments et la communication sont nécessaires).
2. Une couleur "standard" saisie manuellement reste figée même si le thème du document change ensuite. — **Vrai**.
3. Corriger un titre en lui appliquant le bon style est généralement plus rapide que de retaper tout le document. — **Vrai**.
4. La cohérence documentaire d'une organisation ne concerne que l'aspect visuel, jamais la méthode de travail de l'équipe. — **Faux**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi retirer un seul des trois éléments du triangle de cohérence (styles, thème, modèle) affaiblit les deux autres.
2. Un collègue affirme que ses documents sont "cohérents" simplement parce qu'ils ont tous la même couleur de titre. Explique-lui pourquoi cela ne suffit pas à garantir une vraie cohérence structurelle.

**Corrigé 1** : sans modèle, styles et thème restent enfermés dans un seul document, jamais diffusés à l'équipe ; sans styles, un thème n'a aucun contenu structurel auquel s'appliquer, laissant les rédacteurs mettre en forme manuellement malgré tout ; sans thème, les styles doivent définir des couleurs et polices figées, perdant la possibilité de faire évoluer l'identité visuelle d'un seul geste. Les trois se soutiennent mutuellement.

**Corrigé 2** : une même couleur de titre obtenue par mise en forme manuelle (gras + couleur appliqués à la main) plutôt que par un vrai style ne porte aucune information structurelle pour Word — elle n'apparaît pas dans la navigation par titres (chapitre 6), ne peut pas alimenter une table des matières automatique (chapitre 28), et ne se met pas à jour globalement si la charte graphique évolue (contrairement à un vrai style, chapitre 17). Une cohérence purement visuelle, sans structure réelle sous-jacente, reste fragile et limitée.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Sur un document de test contenant volontairement trois incohérences (un titre en gras manuel, une couleur standard plutôt que de thème, un espacement simulé par ligne vide), applique la grille d'audit de la section 20.2 pour toutes les identifier par écrit avant de les corriger.
</div>

**Corrigé :** réussi si les trois incohérences sont correctement identifiées et localisées avant toute correction, démontrant une application méthodique de la grille d'audit plutôt qu'une correction menée uniquement à l'instinct visuel.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.2</span>

Rédige, en une demi-page, la procédure de cohérence documentaire (section 20.4) que tu recommanderais à une petite organisation de cinq personnes n'ayant jamais utilisé de styles, thème ou modèle auparavant.
</div>

**Corrigé :** réponse personnelle ; une bonne réponse couvre au minimum : le point de départ obligatoire (modèle plutôt que document vierge ou copie), la règle d'usage des styles plutôt que la mise en forme manuelle, la règle d'usage des couleurs de thème plutôt que des couleurs figées, et une mention de la nécessité de communiquer cette procédure à toute l'équipe.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer comment styles, thème et modèle forment un système interdépendant.</li>
<li>☐ Je sais auditer un document pour repérer les incohérences visuelles et structurelles.</li>
<li>☐ Je corrige un document incohérent en réappliquant styles et couleurs de thème plutôt qu'en le retapant.</li>
<li>☐ Je sais formuler une méthode de travail documentée pour une organisation.</li>
<li>☐ J'ai mené à bien le mini-projet combinant l'ensemble de la Partie 5.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Triangle de cohérence** = styles (structure) + thème (apparence) + modèle (diffusion) — les trois s'appuient l'un sur l'autre.
- **Audit rapide** : styles réellement utilisés, couleurs de thème contre couleurs figées, espacement réel contre lignes vides.
- **Corriger ≠ retaper** : réappliquer styles et couleurs de thème existants est presque toujours plus rapide.
- **Méthode documentée + communiquée** = condition nécessaire, au-delà des seuls outils techniques.

Aucun nouveau raccourci clavier dans ce chapitre de synthèse.
</div>

## FAQ

<dl class="faq">
<dt>Existe-t-il un outil intégré à Word pour auditer automatiquement la cohérence d'un document ?</dt>
<dd>Pas un outil dédié unique, mais l'Inspecteur de style (chapitre 17) et le volet Styles permettent une vérification manuelle assez rapide ; une automatisation plus poussée relève de macros personnalisées (chapitre 36).</dd>

<dt>Le mini-projet de ce chapitre doit-il obligatoirement porter sur une ONG comme les exemples du manuel ?</dt>
<dd>Non, le contexte (PME, association, cabinet, établissement scolaire) est entièrement libre — seul le livrable technique final (couleurs, polices, thème, styles, modèle, document de test) est attendu, quel que soit le secteur choisi.</dd>

<dt>Une incohérence corrigée une fois peut-elle réapparaître plus tard dans le même document ?</dt>
<dd>Oui, si un rédacteur revient ensuite à des habitudes de mise en forme manuelle sur ce même document — d'où l'importance de la méthode et de la communication (section 20.4), pas seulement d'une correction ponctuelle.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la cohérence de mise en forme dans Word : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Automatisation avancée du contrôle qualité documentaire : chapitre 36.

*Chapitre suivant : la Partie 6 s'ouvre sur les objets visuels, en commençant par l'insertion et la mise en forme des images — un tout nouveau registre de compétences, aussi structuré méthodiquement que le texte l'a été jusqu'ici.*
