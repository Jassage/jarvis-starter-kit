<div class="chapitre-titre-num">CHAPITRE 24</div>

# Graphiques

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer pourquoi un graphique Word repose en réalité sur un mini-classeur Excel intégré ; insérer un graphique et choisir le type adapté à la nature des données à représenter ; modifier les données source d'un graphique déjà inséré ; mettre en forme un graphique (titre, légende, étiquettes, couleurs de thème) ; et distinguer un graphique incorporé d'un graphique lié à un classeur Excel externe.
</div>

**Matrice de compétences MOS**

Ce chapitre ne correspond à aucun objectif du référentiel MOS Word (MO-100/MO-101) : la création de graphiques relève, dans le programme de certification Microsoft Office Specialist, du référentiel **Excel**, pas de celui de Word — logique, puisque tout graphique Word s'appuie en coulisses sur un moteur de calcul Excel (section 24.1). Ce chapitre reste néanmoins essentiel pour produire des rapports professionnels complets, un objectif de ce manuel qui dépasse le seul périmètre de l'examen. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 23 (SmartArt), pour bien distinguer un graphique de données chiffrées d'une représentation conceptuelle d'idées.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport annuel de l'ONG doit présenter l'évolution du nombre de bénéficiaires sur les quatre derniers trimestres, ainsi que la répartition du budget entre ses trois grands postes de dépense. Ta responsable insiste : "un tableau de chiffres, c'est bien, mais un bailleur de fonds qui feuillette rapidement un rapport retient surtout ce qu'il voit d'un coup d'œil." Ce chapitre montre comment transformer ces données chiffrées en graphiques clairs, un registre différent du SmartArt du chapitre 23 (qui représente des idées, pas des valeurs numériques).
</div>

## 24.1 Le principe : un graphique Word est un mini-classeur Excel intégré

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Contrairement à un SmartArt (chapitre 23) ou une forme (chapitre 22), un graphique Word ne stocke pas ses données directement dans le document : il les stocke dans une **feuille de calcul Excel miniature intégrée** au fichier `.docx`, invisible à l'usage courant mais bien réelle. Modifier le graphique revient toujours, en coulisses, à modifier cette feuille de données.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi cette architecture, et le lien avec le chapitre 1</span>
Cette conception illustre concrètement l'écosystème Microsoft 365 déjà évoqué au chapitre 1 : plutôt que de réinventer un moteur de calcul et de représentation graphique propre à Word, Microsoft réutilise directement celui d'Excel, garantissant les mêmes types de graphiques et les mêmes possibilités de calcul dans les deux logiciels.
</div>

## 24.2 Insérer un graphique et choisir le bon type

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 67 — Créer le graphique d'évolution des bénéficiaires</span>

**Objectif** : représenter une évolution dans le temps, la première demande de la mise en situation.

**Préparation** : ouvre un nouveau document de test.

**Étapes détaillées** :
1. Onglet **Insertion**, groupe Illustrations, clique sur **Graphique**.
2. Dans la boîte de dialogue, sélectionne la catégorie **Histogramme** (barres verticales), puis le sous-type "Histogramme groupé" — le type le plus adapté pour comparer une valeur (nombre de bénéficiaires) sur plusieurs périodes successives (les quatre trimestres).
3. Clique sur **OK** : le graphique s'insère avec des données d'exemple, et une feuille de calcul type Excel s'ouvre automatiquement à côté (section 24.1 concrètement visible).
4. Dans cette feuille, remplace les libellés d'exemple par "T1", "T2", "T3", "T4" et les valeurs par le nombre réel de bénéficiaires de chaque trimestre.
5. Ferme la feuille de données : le graphique dans le document se met à jour instantanément pour refléter les nouvelles valeurs.

**Résultat attendu** : un histogramme clair montrant l'évolution trimestrielle du nombre de bénéficiaires, immédiatement compréhensible d'un coup d'œil.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Choisir le bon type de graphique selon les données</span>

| Type de données | Type de graphique adapté |
|---|---|
| Évolution dans le temps (trimestres, mois, années) | Histogramme ou Courbes |
| Répartition d'un tout en parts (budget par poste de dépense) | Secteurs (camembert) |
| Comparaison de plusieurs catégories indépendantes | Histogramme ou Barres |
| Relation entre deux variables numériques | Nuage de points (XY) |

Un mauvais choix de type — représenter une évolution temporelle en secteurs, par exemple — communique une information confuse ou trompeuse, même avec des données par ailleurs exactes.
</div>

## 24.3 Créer le graphique de répartition budgétaire

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 68 — Représenter la répartition du budget</span>

**Objectif** : répondre à la seconde demande de la mise en situation, avec le type de graphique adapté à une répartition.

**Préparation** : reprends le document de l'atelier 67.

**Étapes détaillées** :
1. Insertion > Graphique, catégorie **Secteurs**, sous-type "Secteurs" simple.
2. Dans la feuille de données, remplace les catégories par "Matériel scolaire", "Logistique", "Frais administratifs", et les valeurs par les montants ou pourcentages réels de chaque poste.
3. Ferme la feuille de données pour voir le graphique en secteurs se mettre à jour.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — les secteurs ne conviennent qu'à un tout cohérent</span>
Un graphique en secteurs n'a de sens que si les valeurs représentées forment ensemble un tout logique à 100% (comme une répartition budgétaire complète) — l'utiliser pour comparer des valeurs indépendantes sans relation de tout à parties (comme le nombre de bénéficiaires par trimestre de l'atelier 67) serait un contresens visuel similaire à celui déjà signalé pour les catégories de SmartArt au chapitre 23.
</div>

## 24.4 Modifier les données source d'un graphique existant

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Corriger ou actualiser des données déjà insérées</span>

1. Sélectionne le graphique, onglet contextuel **Création de graphique** (Ruban, chapitre 3), groupe Données, clique sur **Modifier les données**.
2. La feuille de calcul miniature se rouvre, avec les valeurs actuellement utilisées par le graphique.
3. Modifie les valeurs nécessaires ; pour ajouter une nouvelle catégorie (un cinquième trimestre, par exemple), tape les nouvelles données dans la ligne ou colonne suivante, puis fais glisser le petit repère bleu en bas à droite de la zone de données pour étendre la plage prise en compte par le graphique.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Le repère bleu délimitant la zone de données prise en compte est facile à manquer la première fois : sans l'étendre, une nouvelle ligne de données tapée dans la feuille n'apparaîtra tout simplement pas dans le graphique, même après actualisation.
</div>

## 24.5 Mettre en forme un graphique

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 69 — Habiller les deux graphiques aux couleurs de l'ONG</span>

**Objectif** : finaliser la présentation professionnelle des deux graphiques créés dans ce chapitre.

**Préparation** : reprends les graphiques des ateliers 67 et 68.

**Étapes détaillées** :
1. Sélectionne un graphique, clique sur l'icône **"+"** (Éléments de graphique) qui apparaît à sa droite : coche ou décoche Titre du graphique, Étiquettes de données, Légende, Quadrillage selon les besoins réels.
2. Clique sur l'icône **pinceau** (Styles de graphique) à côté : choisis un style visuel prédéfini, puis l'onglet **Couleur** pour appliquer une palette qui fait référence au thème actif du document (chapitre 18), garantissant une cohérence avec le reste du rapport.
3. Double-clique directement sur le titre du graphique pour le remplacer par un texte explicite ("Évolution trimestrielle des bénéficiaires" plutôt que le titre générique par défaut).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Toujours remplacer le titre générique par défaut d'un graphique par un titre explicite et complet, et désactiver les éléments visuels superflus (un quadrillage trop chargé, une légende inutile si une seule série de données est représentée) — un graphique surchargé d'éléments décoratifs communique moins clairement qu'un graphique épuré à l'essentiel.
</div>

## 24.6 Graphique incorporé contre graphique lié à un classeur externe

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un graphique créé directement dans Word (comme dans ce chapitre) est <strong>incorporé</strong> : ses données vivent uniquement dans le mini-classeur intégré au document, indépendant de tout fichier Excel externe. Il est aussi possible de copier un graphique depuis un vrai classeur Excel et de le coller dans Word avec l'option **"Utiliser le thème de destination et lier les données"** (dans les Options de collage, chapitre 7, appliquées ici à un graphique) : ce graphique **lié** se met alors à jour automatiquement si le classeur Excel source change, à condition que ce fichier externe reste accessible.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Une PME qui suit son chiffre d'affaires mensuel dans un classeur Excel dédié, mis à jour chaque mois par la comptabilité, insère ce graphique **lié** (plutôt qu'incorporé) dans son rapport de gestion Word — chaque nouvelle ouverture du rapport peut alors proposer une actualisation automatique reflétant les derniers chiffres du classeur, sans avoir à reconstruire le graphique à chaque rapport mensuel.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Choisir puis justifier un type de graphique</span>
Reçois ces trois jeux de données fictifs et détermine, pour chacun, le type de graphique le plus adapté en justifiant ton choix en une phrase : (1) le nombre de bénévoles actifs sur les cinq dernières années, (2) la répartition des dons entre particuliers, entreprises et fondations pour une seule année, (3) la comparaison du nombre de bénéficiaires entre quatre régions différentes pour une même année. Crée les trois graphiques correspondants.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Choisir un graphique en secteurs pour des données qui ne forment pas un tout cohérent</span>
Comme signalé en section 24.3, ce contresens visuel reste l'erreur la plus fréquente chez les débutants découvrant les graphiques, tentés d'utiliser le type visuellement le plus attrayant plutôt que le plus pertinent.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier d'étendre la zone de données après ajout de nouvelles valeurs</span>
Comme signalé en section 24.4, une nouvelle ligne de données tapée sans étendre le repère bleu délimitant la plage reste invisible dans le graphique, un oubli qui déroute particulièrement lorsqu'on s'attend à voir apparaître automatiquement la nouvelle valeur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Confondre graphique incorporé et graphique lié</span>
Modifier un classeur Excel externe en pensant que le graphique incorporé dans un rapport Word déjà envoyé va se mettre à jour automatiquement ne fonctionne que si ce graphique a explicitement été inséré comme **lié** — un graphique incorporé reste totalement indépendant de tout fichier externe, y compris celui dont il aurait pu être copié à l'origine.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le graphique n'affiche pas les nouvelles données tapées dans la feuille</span>

- **Diagnostic** : la zone de données délimitée par le repère bleu (section 24.4) n'a probablement pas été étendue pour inclure les nouvelles lignes ou colonnes.
- **Résolution** : rouvrir "Modifier les données" et faire glisser le repère bleu jusqu'à englober toutes les données réellement destinées au graphique.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un graphique lié affiche un message d'erreur ou des données obsolètes</span>

- **Diagnostic** : le classeur Excel source a probablement été déplacé, renommé ou supprimé, ou n'est simplement pas accessible depuis le poste actuel (par exemple, un fichier resté sur un autre ordinateur).
- **Résolution** : vérifier l'emplacement du classeur source via clic droit sur le graphique > "Modifier les liens vers les fichiers", et le relier au bon emplacement si nécessaire.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours choisir le type de graphique en fonction de la nature réelle des données (évolution, répartition, comparaison), jamais selon une préférence esthétique arbitraire.
- **Bonne pratique répandue** : utiliser un graphique lié plutôt qu'incorporé pour tout rapport récurrent alimenté par un classeur Excel mis à jour régulièrement par une autre équipe (comptabilité, suivi terrain).
- **Erreur classique observée** : des rapports contenant des graphiques visuellement soignés mais dont le type ne correspond pas à la nature des données, communiquant une information confuse malgré un rendu esthétique agréable.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — combiner deux types de graphiques dans un même graphique</span>
Le type **"Graphique combiné"** de la boîte de dialogue Insérer un graphique permet, par exemple, de représenter une série de données en histogramme et une seconde série en courbe sur le même graphique (avec éventuellement un axe secondaire) — utile pour comparer deux grandeurs de nature différente, comme le nombre de bénéficiaires (histogramme) et le taux de satisfaction en pourcentage (courbe) sur les mêmes périodes.
</div>

## Résumé du chapitre

- Un graphique Word repose sur un mini-classeur Excel intégré, invisible à l'usage courant mais réel — l'écosystème Microsoft 365 du chapitre 1 concrètement à l'œuvre.
- Le type de graphique (histogramme, secteurs, courbes, nuage de points) doit refléter la nature réelle des données : évolution, répartition, comparaison ou relation.
- Les données source se modifient via "Modifier les données", en veillant à toujours étendre la zone délimitée par le repère bleu pour toute nouvelle valeur ajoutée.
- La mise en forme (titre, légende, étiquettes, couleurs de thème) se règle via les icônes flottantes ou l'onglet contextuel Création de graphique.
- Un graphique incorporé reste indépendant de tout fichier externe ; un graphique lié à un classeur Excel se met à jour automatiquement si ce fichier change, à condition qu'il reste accessible.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un graphique Word stocke ses données dans :
   - a) Un fichier texte séparé
   - b) Un mini-classeur Excel intégré au document
   - c) Le presse-papiers
   - d) Un style de paragraphe

2. Pour représenter une répartition budgétaire en parts d'un tout, le type de graphique adapté est :
   - a) Histogramme
   - b) Secteurs
   - c) Nuage de points
   - d) Courbes uniquement

3. Un graphique "lié" à un classeur Excel externe :
   - a) Ne peut jamais être modifié
   - b) Se met à jour automatiquement si le classeur source change et reste accessible
   - c) Est identique en tout point à un graphique incorporé
   - d) Nécessite une connexion Internet permanente

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un graphique en secteurs convient à n'importe quel jeu de données, quelle que soit sa nature. — **Faux**, uniquement à une répartition d'un tout cohérent.
2. Étendre le repère bleu de la zone de données est nécessaire pour qu'une nouvelle valeur apparaisse dans le graphique. — **Vrai**.
3. La création de graphiques est un objectif explicite du référentiel de certification MOS Word. — **Faux** (elle relève du référentiel Excel).
4. Un graphique incorporé reste indépendant de tout fichier Excel externe. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un graphique en secteurs serait un mauvais choix pour représenter le nombre de bénéficiaires sur quatre trimestres distincts.
2. Un collègue modifie régulièrement un classeur Excel de suivi budgétaire et voudrait que son rapport Word reflète toujours les derniers chiffres sans reconstruire le graphique à chaque fois. Que lui recommandes-tu ?

**Corrigé 1** : un graphique en secteurs représente des parts d'un tout à 100%, une relation qui n'a pas de sens pour des valeurs indépendantes mesurées à des moments différents (les bénéficiaires de chaque trimestre ne "s'additionnent" pas en un tout à représenter en camembert) — un histogramme ou une courbe, qui représentent une évolution ou une comparaison de valeurs indépendantes, seraient nettement plus appropriés.

**Corrigé 2** : recommander d'insérer le graphique comme **lié** au classeur Excel source (copier depuis Excel, coller avec liaison des données, section 24.6) plutôt que comme graphique incorporé créé directement dans Word — le graphique se mettra alors à jour automatiquement à chaque ouverture du rapport, tant que le classeur source reste accessible au même emplacement.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.1</span>

Crée un histogramme représentant le nombre de participants à quatre événements fictifs organisés par une association, avec un titre explicite et une palette de couleurs cohérente avec un thème de ton choix.
</div>

**Corrigé :** réussi si le graphique affiche clairement les quatre événements et leur nombre de participants respectif, avec un titre décrivant précisément le contenu plutôt qu'un texte générique.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 24.2</span>

Sur ce même graphique, ajoute un cinquième événement en modifiant les données source, en veillant à bien étendre la zone de données prise en compte par le graphique.
</div>

**Corrigé :** réponse personnelle ; réussi si le cinquième événement apparaît correctement dans le graphique après extension du repère bleu délimitant la zone de données.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer qu'un graphique Word repose sur un mini-classeur Excel intégré.</li>
<li>☐ Je choisis le type de graphique adapté à la nature réelle des données.</li>
<li>☐ Je modifie les données source d'un graphique en veillant à étendre la zone de données.</li>
<li>☐ Je mets en forme un graphique (titre, légende, couleurs de thème).</li>
<li>☐ Je distingue un graphique incorporé d'un graphique lié à un classeur externe.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Graphique Word** = mini-classeur Excel intégré, invisible à l'usage courant.
- **Type de graphique** = selon la nature des données (évolution, répartition, comparaison, relation), jamais selon l'esthétique.
- **Repère bleu** = toujours l'étendre après ajout de nouvelles données.
- **Incorporé** (indépendant) contre **lié** (mise à jour automatique depuis un classeur externe).

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Insertion ou l'onglet contextuel Création de graphique.
</div>

## FAQ

<dl class="faq">
<dt>Puis-je modifier un graphique inséré dans Word directement depuis Excel installé sur le même poste ?</dt>
<dd>Oui, un bouton "Modifier les données dans Excel" (à côté de "Modifier les données") ouvre la feuille dans une vraie fenêtre Excel complète plutôt que la mini-feuille intégrée, utile pour des manipulations de données plus complexes.</dd>

<dt>Un graphique peut-il être redimensionné et positionné comme une image ou une forme ?</dt>
<dd>Oui, les mêmes principes de redimensionnement (poignées d'angle, chapitre 21) et d'habillage du texte s'appliquent à un graphique, qui reste un objet flottant comme les autres éléments graphiques de cette Partie 6.</dd>

<dt>Existe-t-il des types de graphiques plus avancés que ceux mentionnés dans ce chapitre ?</dt>
<dd>Oui, Word propose aussi des graphiques en cascade, en entonnoir, en boîte à moustaches ou hiérarchiques (Icicle, Sunburst) parmi les types plus récents — moins courants en usage quotidien mais disponibles dans la même boîte de dialogue Insérer un graphique pour des besoins d'analyse plus spécifiques.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les graphiques dans Word : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101), confirmant l'absence d'objectif sur les graphiques : voir `assets/mos-objectifs.md` dans ce manuel.
- Écosystème Microsoft 365 et intégration Excel-Word : chapitre 1 et chapitre 47.

*Chapitre suivant : icônes, captures d'écran et médias en ligne — pour compléter la Partie 6 avec les derniers types d'objets visuels insérables directement dans Word.*
