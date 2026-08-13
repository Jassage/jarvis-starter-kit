<div class="chapitre-titre-num">CHAPITRE 31</div>

# Index et table des illustrations

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : marquer des entrées d'index, y compris des sous-entrées et des occurrences multiples d'un même terme ; générer un index complet en fin de document ; le mettre à jour après modification ; insérer une légende automatique et numérotée sur une image ou un tableau ; configurer les propriétés d'une légende, y compris créer une nouvelle étiquette personnalisée ; et insérer une table des illustrations qui recense automatiquement toutes les figures ou tous les tableaux légendés d'un document.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Marquer des entrées d'index | MO-101 Word Expert — Create Custom Document Elements | 3.3.1 |
| Créer des index | MO-101 Word Expert — Create Custom Document Elements | 3.3.2 |
| Mettre à jour des index | MO-101 Word Expert — Create Custom Document Elements | 3.3.3 |
| Insérer des légendes de figures et de tableaux | MO-101 Word Expert — Create Custom Document Elements | 3.4.1 |
| Configurer les propriétés de légende | MO-101 Word Expert — Create Custom Document Elements | 3.4.2 |
| Insérer et modifier une table des illustrations | MO-101 Word Expert — Create Custom Document Elements | 3.4.3 |

Ce chapitre couvre l'intégralité des deux sous-domaines MOS Expert 3.3 et 3.4, entièrement dédiés aux index et aux tables d'illustrations.

**Prérequis** : chapitre 28 (table des matières), dont l'index et la table des illustrations partagent la logique de champ actualisable.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le mémoire universitaire de l'étudiant bénévole (chapitres 29-30) doit désormais inclure un index des termes techniques clés en fin de document, ainsi qu'une table recensant tous les graphiques et tableaux insérés dans le texte, chacun légendé ("Figure 1", "Tableau 1"...) et référencé avec son numéro de page. Son jury insiste : "Un mémoire sans index ni table des illustrations donne l'impression d'un travail bâclé." Ce chapitre couvre les deux exigences.
</div>

## 31.1 Marquer des entrées d'index

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 91 — Marquer les termes techniques clés du mémoire</span>

**Objectif** : identifier, dans le texte, les termes qui devront apparaître dans l'index final.

**Préparation** : ouvre le document du mémoire de test, repère un terme technique clé mentionné à plusieurs endroits (par exemple "gouvernance associative").

**Étapes détaillées** :
1. Sélectionne une occurrence du terme, onglet **Références**, groupe Index, clique sur **Entrée**, ou raccourci **`Alt+Maj+X`**.
2. La boîte de dialogue **Marquer les entrées d'index** s'ouvre, avec le terme déjà proposé dans le champ "Entrée principale".
3. Pour créer une hiérarchie (par exemple "Gouvernance" comme entrée principale, "associative" comme sous-entrée), tape "Gouvernance" dans "Entrée principale" et "associative" dans "Sous-entrée".
4. Clique sur **"Marquer tout"** plutôt que "Marquer" simplement : Word recherche et marque automatiquement **toutes** les occurrences identiques de ce terme dans le document, pas seulement celle sélectionnée.
5. La boîte de dialogue reste ouverte, permettant de sélectionner un nouveau terme dans le texte et de répéter l'opération sans la refermer à chaque fois.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.3.1 Mark index entries (MO-101 Expert)</span>
L'atelier 91 correspond exactement à cet objectif. **Piège fréquent** : cliquer sur "Marquer" au lieu de "Marquer tout" ne marque que l'occurrence sélectionnée, obligeant à répéter manuellement l'opération pour chaque occurrence du même terme ailleurs dans le document.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Marquer une entrée d'index insère un <strong>champ caché</strong> (visible uniquement avec les marques de mise en forme affichées, `Ctrl+Maj+8`, chapitre 6) directement dans le texte, sous la forme `{ XE "Gouvernance:associative" }` — ce code n'apparaît jamais à l'impression ni en lecture normale, mais reste bien présent dans le document tant qu'il n'est pas explicitement supprimé.
</div>

## 31.2 Créer l'index

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 92 — Générer l'index du mémoire</span>

**Objectif** : produire l'index complet demandé par le jury, en fin de document.

**Préparation** : reprends le document de l'atelier 91, avec plusieurs termes déjà marqués.

**Étapes détaillées** :
1. Place le point d'insertion sur une nouvelle page en toute fin de document.
2. Onglet Références, groupe Index, clique sur **Insérer l'index**.
3. Choisis le nombre de **colonnes** (2 colonnes est la convention la plus courante pour un index, comme une mise en page en colonnes du chapitre 16), le format visuel dans le menu déroulant, et si les sous-entrées doivent s'afficher **"Retrait"** (sur leur propre ligne, en dessous de l'entrée principale) ou **"Continu"** (sur la même ligne que l'entrée principale, séparées par une virgule).
4. Clique sur **OK** : l'index se génère, listant chaque entrée marquée par ordre alphabétique, avec son ou ses numéros de page.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.3.2 Create indexes (MO-101 Expert)</span>
L'atelier 92 correspond exactement à cet objectif.
</div>

## 31.3 Mettre à jour l'index

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Actualiser l'index après modification du document</span>

1. Après avoir marqué de nouvelles entrées ou modifié le texte (changeant la pagination), clique n'importe où dans l'index généré.
2. Onglet Références, groupe Index, clique sur **"Mettre à jour l'index"** (ou `F9`, comme pour la table des matières du chapitre 28 et les formules de tableau du chapitre 27).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.3.3 Update indexes (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif. **Recommandation** : comme pour la table des matières, actualiser systématiquement l'index (et tous les autres champs du document, via `Ctrl+A` puis `F9`, chapitre 27) juste avant tout envoi ou impression finale.
</div>

## 31.4 Insérer une légende sur une image ou un tableau

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 93 — Légender un graphique du mémoire</span>

**Objectif** : préparer les figures et tableaux du mémoire à être recensés dans une table des illustrations.

**Préparation** : reprends un document contenant au moins un graphique (chapitre 24) et un tableau (chapitre 26).

**Étapes détaillées** :
1. Sélectionne le graphique, onglet Références, groupe Légendes, clique sur **Insérer une légende**.
2. Sous "Étiquette", choisis **"Figure"** dans le menu déroulant (les étiquettes par défaut proposées sont Équation, Figure, Tableau).
3. Choisis la **Position** ("Au-dessus de l'élément sélectionné" ou "Au-dessous"), ajoute un court texte après le numéro automatiquement inséré (par exemple "Figure 1. Évolution trimestrielle des bénéficiaires").
4. Clique sur **OK** : la légende s'insère, avec un numéro qui s'incrémentera automatiquement pour chaque nouvelle "Figure" ajoutée ensuite dans le document.
5. Répète l'opération sur le tableau, cette fois avec l'étiquette **"Tableau"** — une numérotation indépendante ("Tableau 1") de celle des figures.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.4.1 Insert figure and table captions (MO-101 Expert)</span>
L'atelier 93 correspond exactement à cet objectif.
</div>

## 31.5 Configurer les propriétés de légende

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Créer une étiquette personnalisée et régler le format de numérotation</span>

1. Dans la boîte de dialogue Insérer une légende, clique sur **"Nouvelle étiquette..."** pour créer une étiquette autre que celles proposées par défaut (par exemple "Carte" pour un mémoire de géographie incluant des cartes, ou "Photo" pour distinguer les photographies des graphiques).
2. Clique sur **"Numérotation..."** pour choisir un format différent (chiffres romains plutôt qu'arabes) ou pour inclure le **numéro de chapitre** dans la légende (utile pour un document long divisé en chapitres numérotés, produisant par exemple "Figure 3-1" pour la première figure du chapitre 3, en s'appuyant sur un style de titre associé à cette numérotation).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.4.2 Configure caption properties (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Établissement scolaire</span>
Un mémoire universitaire en géographie ou en urbanisme crée une étiquette personnalisée "Carte" distincte de "Figure", permettant à sa table des illustrations finale (section 31.6) de distinguer clairement les cartes des graphiques statistiques, deux types de contenu visuel qu'un jury évalue souvent différemment.
</div>

## 31.6 Insérer et modifier une table des illustrations

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 94 — Générer la table des illustrations du mémoire</span>

**Objectif** : compléter la deuxième demande du jury dans la mise en situation d'ouverture.

**Préparation** : reprends le document avec les légendes "Figure" et "Tableau" des ateliers précédents.

**Étapes détaillées** :
1. Place le point d'insertion sur une nouvelle page, généralement juste après la table des matières (chapitre 28).
2. Onglet Références, groupe Légendes, clique sur **Insérer une table des illustrations**.
3. Sous **"Étiquette de légende"**, choisis **"Figure"** : seules les légendes utilisant cette étiquette précise seront recensées dans cette table.
4. Clique sur **OK** : la table se génère, listant chaque figure avec son texte de légende et son numéro de page.
5. Répète l'opération sur une nouvelle page distincte pour une seconde table, cette fois avec l'étiquette **"Tableau"** — les deux types d'éléments nécessitent des tables séparées, une par étiquette.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.4.3 Insert and modify a table of figures (MO-101 Expert)</span>
L'atelier 94 correspond exactement à cet objectif. **Piège fréquent en examen** : une seule table des illustrations ne peut recenser qu'une seule étiquette à la fois (Figure OU Tableau, jamais les deux mélangées) — un document avec plusieurs types d'éléments légendés nécessite donc plusieurs tables distinctes, une par étiquette.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Comme la table des matières (chapitre 28) et l'index (section 31.2), une table des illustrations reste un champ à actualiser manuellement (clic droit > Mettre à jour les champs, ou `F9`) après tout ajout, suppression ou renumérotation de figures dans le document.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire l'appareil de référence complet d'un mémoire</span>
Sur un document de test simulant un mémoire d'au moins cinq pages, construis l'intégralité de son appareil de référence : table des matières (chapitre 28), index d'au moins cinq termes marqués avec sous-entrées, deux figures et un tableau légendés, et une table des illustrations distincte pour les figures et pour le tableau. Actualise l'ensemble avec `Ctrl+A` puis `F9` pour vérifier la cohérence finale.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Cliquer sur "Marquer" plutôt que "Marquer tout"</span>
Comme signalé dans l'atelier 91, cette confusion laisse la majorité des occurrences d'un terme non marquées, produisant un index incomplet qui semble pourtant correctement construit à la première vérification rapide.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Mélanger figures et tableaux dans une seule table des illustrations</span>
Comme signalé dans l'atelier 94, une table des illustrations ne recense qu'une seule étiquette à la fois — tenter d'inclure figures et tableaux dans la même table produit une liste incomplète, limitée à l'étiquette sélectionnée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier d'actualiser l'index et les tables d'illustrations après des révisions tardives</span>
Comme pour la table des matières (chapitre 28), une révision de dernière minute (ajout d'une figure, suppression d'un paragraphe) qui décale la pagination sans actualisation manuelle de ces champs laisse un document final avec des numéros de page incorrects dans l'index et les tables d'illustrations.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un terme marqué "Marquer tout" n'apparaît pas à toutes ses occurrences attendues dans l'index</span>

- **Diagnostic** : "Marquer tout" ne marque que les occurrences **identiques** au mot exact sélectionné (même casse, même forme) — une variante orthographique ou une forme plurielle différente ne sera pas automatiquement détectée.
- **Résolution** : marquer séparément chaque variante significative du terme si nécessaire (singulier/pluriel, majuscule/minuscule en début de phrase).
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la numérotation des figures ne s'incrémente pas correctement après suppression d'une figure au milieu du document</span>

- **Diagnostic** : la numérotation des légendes reste correcte tant qu'elle est actualisée — un affichage figé après suppression n'a simplement pas encore été rafraîchi.
- **Résolution** : sélectionner tout le document (`Ctrl+A`) et appuyer sur `F9` pour recalculer l'ensemble des numéros de légendes restants.
</div>

## En entreprise

- **Bonne pratique répandue** : légender systématiquement toute figure ou tout tableau d'un rapport long dès son insertion, plutôt que d'ajouter les légendes après coup, pour éviter tout oubli.
- **Bonne pratique répandue** : marquer les entrées d'index au fil de la rédaction plutôt qu'en une seule session finale, pour ne pas manquer de termes clés dispersés dans un document long.
- **Erreur classique observée** : des mémoires ou rapports avec des figures numérotées de façon incohérente ("Figure 1", puis "Figure 3" sans "Figure 2"), résultat d'une suppression de figure jamais suivie d'une actualisation des champs restants.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — utiliser un fichier de concordance pour un index volumineux</span>
Pour un document très long avec de nombreux termes à indexer, Word permet de créer un **fichier de concordance** (un document Word séparé listant en deux colonnes les termes à repérer et leurs entrées d'index correspondantes), utilisable via l'option "AutoMarquer" de la boîte de dialogue Insérer l'index — une automatisation qui évite de marquer manuellement chaque occurrence une par une sur un ouvrage volumineux comme un livre entier.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — synthèse de ce chapitre pour l'examen</span>
Ce chapitre couvre l'intégralité des sous-domaines Expert 3.3 (index) et 3.4 (tables d'illustrations), six objectifs consécutifs. **Recommandation** : bien distinguer les trois commandes voisines de l'onglet Références concernées — Entrée/Insérer l'index (groupe Index) et Insérer une légende/Insérer une table des illustrations (groupe Légendes) — chacune couvrant un objectif précis et distinct de l'examen.
</div>

## Résumé du chapitre

- Marquer une entrée d'index insère un champ caché dans le texte ; "Marquer tout" repère automatiquement toutes les occurrences identiques — objectif MOS Expert 3.3.1.
- L'index se génère par ordre alphabétique, avec un choix de colonnes et de présentation des sous-entrées — objectif MOS Expert 3.3.2.
- Comme tout champ, l'index doit être actualisé manuellement après modification du document — objectif MOS Expert 3.3.3.
- Une légende s'insère sur une figure ou un tableau avec une étiquette (Figure, Tableau, ou personnalisée) et un numéro automatique — objectif MOS Expert 3.4.1.
- Les propriétés de légende permettent de créer une étiquette personnalisée et de configurer le format de numérotation, y compris l'inclusion du numéro de chapitre — objectif MOS Expert 3.4.2.
- Une table des illustrations ne recense qu'une seule étiquette à la fois, nécessitant des tables distinctes pour les figures et les tableaux — objectif MOS Expert 3.4.3.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le raccourci pour marquer une entrée d'index est :
   - a) `Ctrl+Alt+X`
   - b) `Alt+Maj+X`
   - c) `Ctrl+Maj+I`
   - d) `Alt+I`

2. Une table des illustrations basée sur l'étiquette "Figure" recense :
   - a) Les figures et les tableaux ensemble
   - b) Uniquement les éléments légendés avec l'étiquette "Figure"
   - c) Tous les paragraphes du document
   - d) Uniquement les images sans légende

3. "Marquer tout" dans la boîte de dialogue d'index marque :
   - a) Uniquement l'occurrence sélectionnée
   - b) Toutes les occurrences identiques du terme dans le document
   - c) Tous les mots du document
   - d) Uniquement les titres

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une entrée d'index marquée insère un champ visible à l'impression. — **Faux**, il reste caché sauf affichage des marques de mise en forme.
2. Une seule table des illustrations peut recenser à la fois des figures et des tableaux. — **Faux**, une table par étiquette.
3. Le format de numérotation d'une légende peut inclure le numéro de chapitre. — **Vrai**.
4. L'index et la table des illustrations se mettent à jour automatiquement sans aucune action de l'utilisateur. — **Faux**, une actualisation manuelle est nécessaire.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un document avec des figures et des tableaux légendés nécessite deux tables des illustrations distinctes plutôt qu'une seule.
2. Un étudiant a marqué "Gouvernance" avec "Marquer" plutôt que "Marquer tout" alors que ce terme apparaît six fois dans son mémoire. Quel sera le résultat dans l'index final, et comment corriger cela ?

**Corrigé 1** : une table des illustrations est configurée pour recenser une seule étiquette de légende à la fois (Figure ou Tableau) — un document utilisant les deux types d'éléments doit donc générer deux tables séparées, chacune filtrée sur son étiquette respective, pour obtenir un recensement complet et correctement organisé de chaque type de contenu visuel.

**Corrigé 2** : l'index final n'affichera qu'un seul numéro de page pour "Gouvernance", celui de l'occurrence effectivement marquée, ignorant les cinq autres occurrences du terme ailleurs dans le document. Pour corriger cela, il faut soit sélectionner à nouveau chaque occurrence et la marquer individuellement, soit — plus efficacement — sélectionner une occurrence, rouvrir la boîte de dialogue Marquer les entrées d'index, et cliquer cette fois sur "Marquer tout" pour couvrir automatiquement les six occurrences en une seule opération.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 31.1</span>

Sur un document de test contenant le terme "budget" à trois endroits différents, marque-le avec "Marquer tout", puis génère un index et vérifie qu'il n'affiche qu'une seule entrée "budget" avec les trois numéros de page correspondants.
</div>

**Corrigé :** réussi si l'entrée "budget" de l'index affiche bien les trois numéros de page séparés par une virgule, confirmant que les trois occurrences ont été correctement détectées en une seule opération.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 31.2</span>

Insère deux figures légendées dans un document de test, puis génère une table des illustrations basée sur l'étiquette "Figure". Ajoute une troisième figure au milieu du document et actualise la table pour vérifier que la numérotation et la liste se mettent correctement à jour.
</div>

**Corrigé :** réponse personnelle ; réussi si la table des illustrations actualisée affiche bien les trois figures dans l'ordre correct, avec une numérotation continue de 1 à 3 reflétant leur position réelle dans le document.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je marque des entrées d'index, y compris des sous-entrées, avec "Marquer tout".</li>
<li>☐ Je génère un index complet en fin de document.</li>
<li>☐ J'actualise un index après modification du document.</li>
<li>☐ J'insère une légende automatique sur une figure ou un tableau.</li>
<li>☐ Je configure les propriétés de légende, y compris une étiquette personnalisée.</li>
<li>☐ J'insère une table des illustrations distincte par étiquette.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Marquer une entrée d'index** = `Alt+Maj+X`, toujours "Marquer tout" pour couvrir toutes les occurrences — MOS Expert 3.3.1.
- **Index/Table des illustrations** = champs à actualiser manuellement (`F9`) après modification — MOS Expert 3.3.3.
- **Légende** = étiquette (Figure/Tableau/personnalisée) + numéro automatique — MOS Expert 3.4.1, 3.4.2.
- **Table des illustrations** = une seule étiquette à la fois, jamais mélangée — MOS Expert 3.4.3.

**Raccourci clavier de ce chapitre** :
- `Alt+Maj+X` : marquer une entrée d'index.
</div>

## FAQ

<dl class="faq">
<dt>Un index peut-il inclure des renvois du type "Voir aussi" vers un autre terme ?</dt>
<dd>Oui, dans la boîte de dialogue Marquer les entrées d'index, l'option "Renvoi" permet de créer une entrée qui, plutôt qu'un numéro de page, affiche "Voir [autre terme]" — utile pour orienter le lecteur vers un synonyme ou un terme préféré.</dd>

<dt>Les légendes numérotées survivent-elles à une conversion en PDF ?</dt>
<dd>Oui, le texte des légendes et leur numérotation restent parfaitement lisibles dans un PDF (chapitre 45), le contenu étant figé au moment de l'export comme tout autre texte du document.</dd>

<dt>Peut-on personnaliser le format visuel de l'index (police, taille) comme un style ordinaire ?</dt>
<dd>Oui, l'index généré utilise des styles dédiés ("Index 1", "Index 2" pour chaque niveau de sous-entrée) modifiables comme n'importe quel style du document (chapitre 17).</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les index et tables des illustrations : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Styles dédiés à l'index, modifiables comme tout autre style : chapitre 17.

*Chapitre suivant : signets, renvois et liens hypertexte — pour relier différentes parties d'un document long entre elles, ou vers des ressources externes, complétant l'appareil de référence construit depuis le chapitre 28.*
