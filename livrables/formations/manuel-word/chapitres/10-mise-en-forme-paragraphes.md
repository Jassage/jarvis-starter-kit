<div class="chapitre-titre-num">CHAPITRE 10</div>

# Mise en forme des paragraphes

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : aligner un paragraphe (gauche, centré, droite, justifié) selon l'effet recherché ; régler précisément l'interligne et l'espacement avant/après un paragraphe ; créer des retraits de première ligne, des retraits gauche/droite et des retraits négatifs (suspendus) ; appliquer une bordure ou une trame de fond à un paragraphe entier ; reproduire une mise en forme de paragraphe complète avec le Pinceau ; et configurer les options de pagination d'un paragraphe pour éviter qu'il ne se retrouve coupé de façon disgracieuse entre deux pages.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Définir l'interligne, l'espacement de paragraphe et les retraits | MO-100 Word Associate — Insert and Format Text, Paragraphs, and Sections | 2.2.3 |
| Configurer les options de pagination d'un paragraphe | MO-101 Word Expert — Use Advanced Editing and Formatting Features | 2.2.2 |

**Prérequis** : chapitre 9 (mise en forme de caractères, notamment le Pinceau réutilisé ici au niveau du paragraphe).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Ta responsable relit le rapport mensuel imprimé et fronce les sourcils : un titre de section se retrouve seul en bas d'une page, séparé du texte qui le suit sur la page d'après — "ça fait négligé", dit-elle. Elle remarque aussi que les paragraphes sont collés les uns aux autres sans respiration visuelle, avec un simple retour à la ligne pour les séparer plutôt qu'un vrai espacement. Ce chapitre résout ces deux problèmes : l'espacement entre paragraphes (esthétique) et la pagination intelligente (éviter les coupures disgracieuses), deux aspects de la mise en forme de paragraphe trop souvent négligés.
</div>

## 10.1 L'alignement du paragraphe

| Alignement | Raccourci | Usage typique |
|---|---|---|
| **Gauche** | `Ctrl+L` | Texte courant, lecture occidentale naturelle |
| **Centré** | `Ctrl+E` | Titres, pages de garde, citations isolées |
| **Droite** | `Ctrl+R` | Dates en en-tête de lettre, signatures |
| **Justifié** | `Ctrl+J` | Documents imprimés formels (livres, rapports officiels) |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — le justifié a un coût visuel</span>
Le texte justifié étire l'espacement entre les mots pour aligner parfaitement les deux marges — un rendu élégant en colonnes larges (livres), mais qui peut créer des espaces disgracieux ("rivières blanches") dans des colonnes étroites (chapitre 15) ou avec des mots longs. La coupure de mots automatique (chapitre 13) atténue ce problème quand le justifié est un choix éditorial assumé.
</div>

## 10.2 Interligne et espacement de paragraphe

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la distinction essentielle de ce chapitre</span>
L'<strong>interligne</strong> règle l'espace <strong>à l'intérieur</strong> d'un même paragraphe, entre ses lignes successives. L'<strong>espacement avant/après</strong> règle l'espace <strong>entre deux paragraphes distincts</strong>. Une confusion fréquente consiste à ajouter une ligne vide (`Entrée` supplémentaire) pour créer de l'espace entre paragraphes, alors que le réglage "Espacement après" produit un résultat plus cohérent, plus facilement modifiable globalement, et compatible avec les styles (chapitre 17).
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 23 — Régler interligne et espacement via la boîte de dialogue Paragraphe</span>

**Objectif** : remplacer les lignes vides manuelles du scénario d'ouverture par un espacement de paragraphe propre et cohérent.

**Préparation** : reprends le rapport mensuel. Supprime toute ligne vide utilisée uniquement pour créer de l'espace entre deux paragraphes (repère-les en affichant les marques de mise en forme, `Ctrl+Maj+8`, chapitre 6).

**Étapes détaillées** :
1. Sélectionne l'ensemble du texte concerné (`Ctrl+A` pour tout le document, ou une sélection ciblée).
2. Onglet **Accueil** (ou **Disposition**), groupe Paragraphe, clique sur le lanceur de boîte de dialogue.
3. Sous "Espacement", règle **"Après"** à `10 pt` (une valeur courante en usage professionnel).
4. Sous "Interligne", choisis **"1,5 ligne"** dans le menu déroulant (plutôt que "Simple", plus dense, ou "Double", habituellement réservé aux manuscrits académiques à annoter).
5. Clique sur **OK**.

**Résultat attendu** : un espacement visuel régulier entre chaque paragraphe, obtenu sans une seule ligne vide manuelle, immédiatement modifiable en un seul réglage si l'espacement doit changer pour tout le document.

**Dépannage** : si l'espacement ne semble pas s'appliquer après validation, vérifie que la sélection couvrait bien l'intégralité des paragraphes concernés — un réglage de paragraphe s'applique uniquement aux paragraphes touchés, même partiellement, par la sélection.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.2.3 Set line and paragraph spacing and indentation (MO-100 Associate)</span>
L'atelier 23 correspond à la première moitié de cet objectif. **Piège fréquent** : l'énoncé d'examen peut demander un interligne à une valeur précise en points plutôt qu'un préréglage nommé — utiliser alors "Options d'interligne" dans le menu déroulant plutôt que de se limiter aux préréglages visibles par défaut.
</div>

## 10.3 Les retraits de paragraphe

Un **retrait** décale le bord d'un paragraphe par rapport à la marge de la page, sans modifier la marge elle-même (chapitre 13).

| Type de retrait | Effet |
|---|---|
| **Gauche** | Décale tout le paragraphe depuis la marge gauche |
| **Droite** | Décale tout le paragraphe depuis la marge droite |
| **Première ligne** | Décale uniquement la première ligne du paragraphe (usage classique en littérature) |
| **Suspendu (négatif)** | Décale toutes les lignes **sauf** la première — utilisé pour une bibliographie (chapitre 30) ou une liste avec numéro en retrait |

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 24 — Créer un retrait suspendu à la règle et à la boîte de dialogue</span>

**Objectif** : maîtriser les deux méthodes (visuelle et précise) pour un même résultat.

**Préparation** : reprends un paragraphe du document, règle affichée (Affichage > Règle si elle n'est pas déjà visible).

**Étapes détaillées** :
1. Sélectionne le paragraphe. Sur la règle horizontale, repère les deux petits triangles et le rectangle sous la marge gauche : le triangle du haut règle le retrait de première ligne, le triangle du bas le retrait suspendu (ou gauche), le rectangle déplace les deux ensemble.
2. Fais glisser le triangle du **bas** vers la droite de 1 cm : toutes les lignes sauf la première se décalent.
3. Pour un réglage précis plutôt qu'approximatif à la souris, ouvre plutôt le lanceur de boîte de dialogue Paragraphe, et sous "Retrait", choisis **"Suspendu"** dans le menu déroulant "Spécial", avec une valeur exacte comme `1,25 cm`.

**Résultat attendu** : un retrait suspendu propre, obtenu soit visuellement (rapide, approximatif) soit numériquement (lent, précis) — les deux méthodes modifiant le même réglage sous-jacent.

**Dépannage** : si le glissement du triangle déplace accidentellement les deux marqueurs ensemble au lieu d'un seul, c'est le rectangle central (et non un triangle) qui a été saisi par erreur — recommencer en visant précisément la pointe du triangle voulu.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.2.3, deuxième moitié : les retraits (MO-100 Associate)</span>
La technique de la règle et celle de la boîte de dialogue sont toutes deux susceptibles d'être demandées à l'examen — s'entraîner aux deux plutôt qu'à une seule, l'énoncé ne précisant pas toujours la méthode attendue tant que le résultat final est correct.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Université</span>
Une bibliographie académique (chapitre 30) utilise systématiquement un retrait suspendu : la première ligne de chaque référence commence à la marge, les lignes suivantes de la même référence sont légèrement décalées, facilitant la lecture visuelle de where commence chaque nouvelle source dans une liste dense.
</div>

## 10.4 Bordures et trame de fond de paragraphe

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Encadrer un paragraphe important</span>

1. Sélectionne le paragraphe (un encadré d'avertissement, une citation à mettre en valeur).
2. Onglet Accueil, groupe Paragraphe, clique sur la flèche déroulante de l'icône **Bordures**, puis **"Bordures et trame..."**.
3. Onglet "Bordures" : choisis un style de trait, une couleur, une épaisseur, puis clique sur les côtés du paragraphe où appliquer la bordure dans l'aperçu.
4. Onglet "Trame de fond" : choisis une couleur de remplissage légère derrière le texte, pour un effet d'encadré visuellement cohérent.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Un paragraphe bordé et ombré est le principe visuel derrière les encadrés pédagogiques de ce manuel lui-même (Astuce, Attention, À retenir) — une technique que tu peux directement réutiliser dans tes propres documents pour mettre en valeur un avertissement ou une information clé, sans dépendance à un objet graphique séparé (chapitre 22).
</div>

## 10.5 Reproduire une mise en forme de paragraphe avec le Pinceau

Le Pinceau, vu au chapitre 9 pour les caractères, copie **aussi** l'intégralité de la mise en forme de paragraphe (alignement, interligne, retraits, bordures) à condition que la sélection source inclue la marque de fin de paragraphe.

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Pour être certain de copier la mise en forme de paragraphe et pas seulement celle des caractères, clique n'importe où dans le paragraphe source **sans rien sélectionner** avant d'activer le Pinceau : Word copie alors l'intégralité de la mise en forme du paragraphe entier, marque de fin de paragraphe comprise.
</div>

## 10.6 Contrôler la pagination d'un paragraphe

Le problème du scénario d'ouverture — un titre isolé en bas de page, séparé du texte qui le suit — se résout par les **options de pagination**, indépendantes du contenu du texte lui-même.

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 25 — Empêcher un titre d'être isolé en fin de page</span>

**Objectif** : garantir qu'un titre reste toujours accompagné d'au moins la première ligne du texte qui le suit.

**Préparation** : reprends le rapport mensuel, avec au moins un titre de section proche d'un saut de page naturel.

**Étapes détaillées** :
1. Sélectionne le titre concerné (ou place le point d'insertion dedans).
2. Ouvre le lanceur de boîte de dialogue Paragraphe, puis l'onglet **"Enchaînements"**.
3. Coche **"Paragraphes solidaires"** (garde ce paragraphe avec le suivant sur la même page) — l'option la plus directement utile pour un titre.
4. Coche également **"Éviter veuves et orphelines"** sur le corps de texte du document (souvent déjà cochée par défaut dans le style Normal) : elle empêche qu'une seule ligne d'un paragraphe ne se retrouve isolée en haut ou en bas d'une page, séparée du reste de son paragraphe.
5. Pour un contrôle encore plus strict, l'option **"Saut de page avant"** force un nouveau paragraphe (souvent un titre de section majeure) à toujours démarrer en haut d'une nouvelle page.

**Résultat attendu** : le titre précédemment isolé reste désormais systématiquement accompagné du début de son texte, quelle que soit la longueur du contenu précédent qui pourrait décaler la mise en page.

**Dépannage** : si le comportement ne change pas visiblement, vérifie que la sélection à l'étape 1 couvrait bien le paragraphe du titre lui-même, et non le paragraphe précédent par erreur.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.2.2 Set paragraph pagination options (MO-101 Expert)</span>
L'atelier 25 correspond exactement à cet objectif. **Distinction à retenir pour l'examen** : "Paragraphes solidaires" lie un paragraphe au **suivant** ; "Lignes solidaires" (autre case à cocher du même onglet) empêche une coupure de page **à l'intérieur** d'un même paragraphe — les deux se ressemblent dans leur intitulé mais résolvent des problèmes différents.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Ces options de pagination sont automatiquement intégrées aux styles de titre intégrés de Word (chapitre 17) — un titre mis en forme avec le vrai style "Titre 1" hérite déjà, par défaut, du réglage "Paragraphes solidaires". C'est une raison supplémentaire, après celles des chapitres 6 et 9, de toujours utiliser de vrais styles de titre plutôt qu'une imitation manuelle.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reproduire une mise en page de citation académique</span>
Recherche visuellement (dans un livre, un article en ligne, ou de mémoire) à quoi ressemble une citation longue mise en retrait dans un texte académique (généralement : retrait gauche et droit, interligne resserré, parfois taille de police légèrement réduite, sans guillemets). Reproduis cette mise en forme précise sur un paragraphe de citation dans un document Word, en utilisant uniquement les réglages de ce chapitre (retraits, interligne), sans aucun attribut de caractère individuel superflu.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Créer de l'espacement entre paragraphes avec des lignes vides</span>
Comme signalé en section 10.2, une ligne vide supplémentaire pour "aérer" la mise en page complique toute modification ultérieure (il faut réajuster chaque ligne vide individuellement) et casse la navigation du volet de titres si une ligne vide se glisse entre un titre et son style. Le réglage "Espacement après" (paragraphe) résout ce problème structurellement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Utiliser la barre d'espace ou la tabulation pour simuler un retrait de première ligne</span>
Appuyer plusieurs fois sur la barre d'espace ou la tabulation en début de paragraphe pour simuler un retrait de première ligne produit un résultat visuellement approximatif et incohérent d'un paragraphe à l'autre (chapitre 12 sur les tabulations). Le retrait de première ligne réel (section 10.3) garantit une valeur strictement identique partout, modifiable en un seul geste.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ignorer les options de pagination sur un document long</span>
Un document rédigé sans jamais toucher à l'onglet Enchaînements peut sembler correct à l'écran (une seule page visible à la fois) mais révéler, une fois imprimé ou converti en PDF (chapitre 45), des titres isolés ou des tableaux coupés au pire endroit possible — un défaut qui ne se voit qu'à la mise en page finale, souvent découvert tardivement.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : l'interligne semble différent malgré un réglage identique appliqué partout</span>

- **Diagnostic** : certaines polices ont des hauteurs de ligne natives différentes, et un réglage "Multiple" à une valeur non standard peut interagir différemment selon la police utilisée dans chaque paragraphe.
- **Résolution** : privilégier un réglage "Exactement" en points plutôt que "Multiple" si une cohérence stricte entre polices différentes est requise.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "Paragraphes solidaires" n'empêche pas un titre d'être isolé</span>

- **Diagnostic** : l'option a peut-être été appliquée sur le paragraphe suivant le titre plutôt que sur le titre lui-même — le réglage doit être actif sur le paragraphe qui doit rester collé à celui qui le suit, donc sur le titre.
- **Résolution** : vérifier précisément quel paragraphe porte le réglage via le lanceur de boîte de dialogue Paragraphe, onglet Enchaînements.
</div>

## En entreprise

- **Bonne pratique répandue** : définir l'espacement de paragraphe et l'interligne au niveau des **styles** (chapitre 17) plutôt que paragraphe par paragraphe, pour une cohérence automatique sur tout document futur basé sur le même modèle.
- **Bonne pratique répandue** : activer systématiquement "Paragraphes solidaires" sur tous les styles de titre d'un modèle d'entreprise, pour éliminer définitivement le problème de titres isolés en fin de page.
- **Erreur classique observée** : des rapports où chaque rédacteur de l'équipe a sa propre habitude d'espacement (certains avec des lignes vides, d'autres avec un espacement de paragraphe), produisant une incohérence visuelle une fois les contributions assemblées.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — copier les réglages de paragraphe vers un style existant</span>
Une fois un réglage de paragraphe (interligne, espacement, retraits, pagination) parfaitement ajusté sur un exemple, un clic droit sur le style correspondant dans la galerie de styles rapides (chapitre 9) et **"Mettre à jour [Nom du style] pour correspondre à la sélection"** propage instantanément ce réglage à tous les autres paragraphes utilisant déjà ce style dans le document — une passerelle directe vers la logique des styles développée au chapitre 17.
</div>

## Résumé du chapitre

- L'alignement (gauche, centré, droite, justifié) répond à un usage précis ; le justifié demande une vigilance particulière sur les colonnes étroites.
- L'interligne agit à l'intérieur d'un paragraphe, l'espacement avant/après agit entre deux paragraphes — les lignes vides manuelles sont une mauvaise pratique à éliminer au profit de ce dernier réglage.
- Les retraits (gauche, droite, première ligne, suspendu) se règlent à la règle (rapide, approximatif) ou par boîte de dialogue (précis) — objectif MOS Associate 2.2.3.
- Bordures et trame de fond de paragraphe permettent de créer des encadrés visuels sans recourir à un objet graphique séparé.
- Le Pinceau reproduit aussi la mise en forme de paragraphe, à condition d'inclure la marque de fin de paragraphe dans la sélection source.
- Les options de pagination (Paragraphes solidaires, Lignes solidaires, Éviter veuves et orphelines, Saut de page avant) évitent les coupures disgracieuses entre pages — objectif MOS Expert 2.2.2 — et sont automatiquement intégrées aux vrais styles de titre.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. L'espacement "Après" un paragraphe règle :
   - a) L'espace à l'intérieur du paragraphe, entre ses lignes
   - b) L'espace entre ce paragraphe et le suivant
   - c) La taille de la police du paragraphe
   - d) L'alignement du texte

2. Un retrait suspendu (négatif) décale :
   - a) Toutes les lignes du paragraphe, y compris la première
   - b) Uniquement la première ligne
   - c) Toutes les lignes sauf la première
   - d) Uniquement le dernier mot du paragraphe

3. L'option "Paragraphes solidaires" garantit que :
   - a) Le paragraphe ne peut jamais être supprimé
   - b) Le paragraphe reste sur la même page que le paragraphe suivant
   - c) Le paragraphe est automatiquement centré
   - d) Le paragraphe change de couleur automatiquement

**Corrigé** : 1-b, 2-c, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Utiliser des lignes vides pour espacer des paragraphes est équivalent, en tout point, au réglage "Espacement après". — **Faux** (moins cohérent et plus difficile à ajuster globalement).
2. Le Pinceau peut reproduire la mise en forme de paragraphe, pas seulement celle des caractères. — **Vrai**, à condition d'inclure la marque de fin de paragraphe.
3. "Éviter veuves et orphelines" empêche qu'une seule ligne d'un paragraphe se retrouve isolée en haut ou en bas d'une page. — **Vrai**.
4. Le retrait de première ligne et le retrait suspendu produisent le même effet visuel. — **Faux**, ce sont des effets opposés.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi les lignes vides manuelles pour espacer des paragraphes posent un problème de cohérence sur un document long, en t'appuyant sur un exemple concret.
2. Un titre de section se retrouve seul en bas de page dans un document que tu relis. Décris la manipulation exacte pour corriger ce problème sans ajouter de saut de page manuel.

**Corrigé 1** : si dix paragraphes utilisent chacun une ligne vide pour l'espacement et qu'un onzième en utilise deux par erreur d'inattention, l'incohérence visuelle apparaît immédiatement et ne peut être corrigée que ligne vide par ligne vide, individuellement. Un réglage "Espacement après" appliqué au style du document assure une valeur strictement identique partout, modifiable en un seul geste si besoin de l'ajuster globalement plus tard.

**Corrigé 2** : sélectionner (ou placer le point d'insertion dans) le titre isolé, ouvrir le lanceur de boîte de dialogue Paragraphe, onglet Enchaînements, et cocher "Paragraphes solidaires" — cette option garantit que le titre reste toujours accompagné d'au moins le début du texte qui le suit, sans dépendre d'un saut de page manuel fragile qui se déplacerait au moindre ajout ou suppression de texte en amont.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Sur un document de plusieurs paragraphes séparés par des lignes vides, supprime toutes les lignes vides (affiche les marques de mise en forme pour les repérer) et remplace-les par un espacement "Après" de 10 pt appliqué à l'ensemble du texte.
</div>

**Corrigé :** réussi si le document conserve un espacement visuel équivalent entre paragraphes sans plus aucune ligne vide, vérifiable en affichant les marques de mise en forme (`Ctrl+Maj+8`).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.2</span>

Crée une courte liste de trois références bibliographiques fictives (auteur, titre, année) et mets en forme chacune avec un retrait suspendu de 1 cm, pour que seule la première ligne de chaque référence commence à la marge.
</div>

**Corrigé :** réponse personnelle ; réussi si chaque référence affiche bien sa première ligne à la marge et ses lignes suivantes (le cas échéant) décalées de 1 cm.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je choisis l'alignement de paragraphe adapté à l'usage (gauche, centré, droite, justifié).</li>
<li>☐ Je distingue clairement interligne et espacement avant/après, et je n'utilise plus de lignes vides pour espacer des paragraphes.</li>
<li>☐ Je crée des retraits (première ligne, suspendu) à la règle et par boîte de dialogue.</li>
<li>☐ Je sais appliquer une bordure et une trame de fond à un paragraphe.</li>
<li>☐ J'utilise le Pinceau pour reproduire une mise en forme de paragraphe complète.</li>
<li>☐ Je configure les options de pagination pour éviter les coupures disgracieuses entre pages.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Interligne** = à l'intérieur du paragraphe ; **Espacement avant/après** = entre paragraphes — ne jamais simuler ce dernier avec des lignes vides.
- **Retrait suspendu** = toutes les lignes sauf la première (bibliographies, listes).
- **Paragraphes solidaires** = colle ce paragraphe au suivant sur la même page — MOS Expert 2.2.2.
- **Éviter veuves et orphelines** = empêche l'isolement d'une seule ligne en haut/bas de page.

**Raccourcis clavier de ce chapitre** :
- `Ctrl+L` : aligner à gauche.
- `Ctrl+E` : centrer.
- `Ctrl+R` : aligner à droite.
- `Ctrl+J` : justifier.
</div>

## FAQ

<dl class="faq">
<dt>Le réglage "Espacement après" s'additionne-t-il si deux paragraphes consécutifs en ont chacun un ?</dt>
<dd>Non par défaut : Word ne cumule pas automatiquement l'espacement "Après" du premier paragraphe avec l'espacement "Avant" du suivant, sauf si l'option "Ne pas ajouter d'espace entre les paragraphes de même style" est décochée dans les paramètres avancés — un détail à vérifier si un espacement semble plus important que prévu.</dd>

<dt>Les options de pagination fonctionnent-elles aussi dans un tableau ?</dt>
<dd>Partiellement : "Lignes solidaires" et "Éviter veuves et orphelines" s'appliquent au texte à l'intérieur d'une cellule, mais la gestion des sauts de page dans un tableau relève surtout d'options spécifiques aux tableaux, abordées au chapitre 26.</dd>

<dt>Puis-je appliquer un retrait différent pour l'impression et l'affichage à l'écran ?</dt>
<dd>Non, les retraits de paragraphe sont une propriété unique du document, identique en affichage comme à l'impression — contrairement à certains réglages d'affichage (chapitre 6) qui ne concernent que l'écran.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la mise en forme de paragraphes : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Approfondissement des styles de paragraphe : chapitre 17.

*Chapitre suivant : listes à puces, numérotées et multiniveaux — pour structurer une énumération d'idées au-delà du simple paragraphe continu.*
