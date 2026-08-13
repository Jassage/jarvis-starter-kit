<div class="chapitre-titre-num">CHAPITRE 12</div>

# Tabulations

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer pourquoi la touche `Tab` ne doit jamais être confondue avec plusieurs espaces répétés ; poser un taquet de tabulation gauche, centré, droit ou décimal directement sur la règle ; poser un taquet avec précision numérique via la boîte de dialogue Tabulations ; ajouter des points de suite (pointillés) menant l'œil jusqu'à une valeur alignée à droite ; déplacer, modifier ou supprimer un taquet existant ; et décider, face à un besoin d'alignement en colonnes, si une tabulation ou un tableau est l'outil réellement adapté.
</div>

**Matrice de compétences MOS**

Ce chapitre ne correspond à aucun objectif directement testé par l'examen MOS Word (MO-100/MO-101) — les tabulations n'apparaissent pas comme compétence isolée dans le référentiel officiel, contrairement aux retraits de paragraphe (chapitre 10) ou aux tableaux (chapitres 26-27) qui, eux, sont explicitement évalués. Elles restent une compétence de base indispensable à la production de documents propres, y compris pour les tâches d'examen elles-mêmes. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 10 (retraits de paragraphe, à ne pas confondre avec les tabulations de ce chapitre).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Pour finaliser le rapport mensuel, ta responsable demande un petit sommaire manuel en première page : le nom de chaque section suivi, aligné parfaitement à droite, du numéro de page correspondant — avec des pointillés entre les deux, "comme dans un vrai livre". Tu tentes d'abord d'aligner ça en tapant plusieurs espaces entre le nom de section et le numéro, mais le résultat se décale dès qu'un nom de section est plus long qu'un autre. Ce chapitre t'apprend l'outil conçu précisément pour ce problème, que les espaces répétés ne peuvent jamais résoudre correctement.
</div>

## 12.1 Pourquoi les espaces répétés ne fonctionnent jamais pour aligner du texte

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
La quasi-totalité des polices utilisées dans Word sont à <strong>chasse variable</strong> : chaque caractère occupe une largeur différente (un "i" est plus étroit qu'un "m"). Taper plusieurs espaces pour aligner visuellement du texte en colonnes ne fonctionne donc que par coïncidence, et se déforme dès qu'un mot change de longueur ou que la police change. La <strong>tabulation</strong> résout ce problème en définissant un point d'arrêt <strong>fixe</strong> sur la règle, atteint par une seule touche `Tab`, quel que soit le texte tapé avant.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une tabulation, c'est comme une gare fixe sur une ligne de métro : peu importe d'où part le train (peu importe la longueur du mot tapé juste avant), il s'arrête toujours exactement au même endroit. Des espaces répétés, c'est plutôt comme marcher un nombre fixe de pas : la distance parcourue varie selon la longueur de chaque pas (la largeur de chaque caractère), donc l'arrivée n'est jamais garantie au même point.
</div>

## 12.2 Les quatre types de taquets de tabulation

| Type de taquet | Symbole sur la règle | Effet |
|---|---|---|
| **Gauche** | ⌐ (équerre simple) | Le texte tapé après `Tab` commence à cette position et s'étend vers la droite |
| **Centré** | ⊥ (té inversé) | Le texte se centre de part et d'autre de cette position |
| **Droit** | ¬ (équerre inversée) | Le texte tapé se termine exactement à cette position, s'étendant vers la gauche au fur et à mesure de la frappe |
| **Décimal** | Té avec un point | Aligne des nombres sur leur virgule/point décimal, quel que soit le nombre de chiffres avant ou après |

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Un tableau de prix simple dans une lettre commerciale (avant d'envisager un vrai tableau, chapitre 26) utilise un taquet décimal pour aligner parfaitement une colonne de montants en gourdes ou en dollars, quel que soit le nombre de chiffres de chaque montant — 500 s'aligne avec 12 500 sur leur séparateur décimal commun, sans un seul espace ajusté manuellement.
</div>

## 12.3 Poser un taquet directement sur la règle

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 30 — Aligner deux colonnes de texte à la règle</span>

**Objectif** : créer un alignement en deux colonnes (nom / fonction) sans tableau, en utilisant uniquement des taquets posés visuellement.

**Préparation** : affiche la règle (Affichage > Règle si elle n'est pas déjà visible). Tape trois lignes au format "Nom" `Tab` "Fonction" (par exemple "Jean Baptiste" `Tab` "Coordonnateur").

**Étapes détaillées** :
1. Sélectionne les trois lignes.
2. Repère, tout en haut à gauche de la règle verticale, le petit bouton carré affichant une icône de taquet : clique dessus plusieurs fois pour faire défiler les quatre types de taquets (gauche, centré, droit, décimal) jusqu'à obtenir le type **Gauche**.
3. Clique directement sur la règle horizontale, à environ 6 cm depuis la marge gauche : un petit repère de taquet gauche apparaît à cet endroit, et le texte après chaque `Tab` s'aligne instantanément à cette position sur les trois lignes sélectionnées.
4. Pour ajuster la position après coup, fais glisser le repère sur la règle vers la gauche ou la droite : le texte suit en temps réel.

**Résultat attendu** : les trois noms sont alignés à gauche, suivis chacun d'une fonction qui commence exactement à la même position horizontale, quelle que soit la longueur du nom.

**Dépannage** : si le taquet semble n'affecter qu'une seule ligne, vérifie que les trois lignes étaient bien sélectionnées **avant** de cliquer sur la règle — un taquet posé sans sélection ne s'applique qu'au paragraphe où se trouve le point d'insertion.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — un taquet est une propriété de paragraphe, pas de document</span>
Comme les retraits (chapitre 10), un taquet de tabulation posé sur la règle s'applique uniquement aux paragraphes sélectionnés au moment de sa création. Une nouvelle ligne tapée juste après hérite généralement des mêmes taquets (car `Entrée` copie la mise en forme du paragraphe précédent), mais un paragraphe totalement différent ailleurs dans le document n'en hérite pas automatiquement.
</div>

## 12.4 Poser un taquet précisément par boîte de dialogue

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 31 — Créer le sommaire avec points de suite du scénario d'ouverture</span>

**Objectif** : résoudre précisément la demande de la mise en situation, avec un alignement à droite et des pointillés.

**Préparation** : reprends le document. Tape une ligne par section du sommaire, au format "Nom de la section" `Tab` "Numéro de page" (par exemple "Introduction" `Tab` "3").

**Étapes détaillées** :
1. Sélectionne l'ensemble des lignes du sommaire.
2. Ouvre le lanceur de boîte de dialogue Paragraphe (chapitre 10), puis clique sur le bouton **"Tabulations..."** en bas à gauche.
3. Dans le champ "Position", tape une valeur proche de la marge droite utile, par exemple `16 cm`.
4. Sous "Alignement", sélectionne **"Droite"**.
5. Sous "Points de suite", sélectionne l'option avec des points (`.......`) plutôt qu'aucun trait.
6. Clique sur **Définir**, puis **OK**.

**Résultat attendu** : chaque numéro de page s'aligne parfaitement à la position choisie, relié au nom de section par une ligne de points, exactement comme demandé — sans dépendre de la longueur du nom de chaque section.

**Dépannage** : si les points de suite n'apparaissent pas, vérifie que le curseur était bien positionné après le clic sur "Définir" et non seulement après avoir rempli les champs sans valider cette étape intermédiaire.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — sommaire manuel contre table des matières automatique</span>
Le sommaire construit dans cet atelier reste un montage <strong>manuel</strong> : si le contenu du document change de longueur, chaque numéro de page devra être corrigé à la main. Pour un document appelé à évoluer, la <strong>table des matières automatique</strong> du chapitre 28 (qui repose, elle, sur de vrais styles de titre comme vu au chapitre 9) reste toujours préférable dès que le document dépasse quelques pages stables.
</div>

## 12.5 Modifier et supprimer un taquet

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Ajuster ou supprimer un taquet existant</span>

- **Déplacer** : fais glisser le repère directement sur la règle vers une nouvelle position.
- **Supprimer par glissement** : fais glisser le repère **hors** de la règle (vers le bas, dans la zone du document) : il disparaît.
- **Supprimer par boîte de dialogue** : ouvre la boîte de dialogue Tabulations (section 12.4), sélectionne la position exacte dans la liste, clique sur **Supprimer**, puis **OK**.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Le bouton **"Effacer tout"** de la boîte de dialogue Tabulations retire d'un coup tous les taquets personnalisés d'une sélection, faisant réapparaître les taquets par défaut de Word (généralement espacés tous les 1,25 cm) — utile pour repartir d'une base neutre plutôt que de supprimer chaque taquet un par un.
</div>

## 12.6 Tabulations ou tableau : quel outil choisir ?

| Critère | Tabulations | Tableau (chapitre 26) |
|---|---|---|
| Nombre de colonnes | Deux ou trois, simples | Plusieurs, avec structure complexe |
| Bordures visibles | Non, sauf ajout manuel | Oui, gérées nativement |
| Tri des données | Non | Oui (chapitre 27) |
| Fusion de cellules | Non applicable | Oui |
| Rapidité de mise en place | Très rapide pour un alignement ponctuel | Plus structurant mais plus lourd pour un simple alignement |
| Usage typique | Sommaire manuel, en-tête de lettre, courte liste alignée | Données tabulaires, budgets, plannings |

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Pour un alignement ponctuel de deux ou trois éléments par ligne sans besoin de bordures ni de tri, la tabulation reste plus rapide et plus légère qu'un tableau. Dès que la structure se complexifie (plus de trois colonnes, besoin de fusionner des cellules, tri des données), basculer vers un vrai tableau évite de "forcer" les tabulations au-delà de leur usage raisonnable.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire un en-tête de lettre professionnelle avec tabulations</span>
Recrée l'en-tête typique d'une lettre professionnelle : nom de l'expéditeur aligné à gauche et date alignée à droite, sur la même ligne, en utilisant un seul taquet de tabulation droit positionné à la marge droite utile de la page — sans utiliser d'espaces ni de tableau. Vérifie que l'alignement reste correct même en changeant la longueur du nom de l'expéditeur.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Aligner du texte avec des espaces répétés</span>
Comme expliqué en section 12.1, cette méthode ne fonctionne jamais de façon fiable avec une police à chasse variable — l'alignement obtenu n'est qu'une coïncidence visuelle sur l'écran ou la police utilisée au moment de la frappe.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre tabulation et retrait de première ligne</span>
Appuyer sur `Tab` en tout début de paragraphe pour simuler un retrait de première ligne (plutôt que d'utiliser le vrai retrait du chapitre 10) mélange deux mécanismes différents : le retrait est une propriété du paragraphe entier, la tabulation un simple saut ponctuel dans le texte — les deux produisent un effet visuel proche au début d'un paragraphe isolé, mais se comportent différemment dès que le texte est réorganisé ou copié ailleurs.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Poser un taquet sans sélectionner tous les paragraphes concernés</span>
Comme signalé dans l'atelier 30, un taquet posé sans sélection préalable ne s'applique qu'au paragraphe où se trouve le point d'insertion — un piège fréquent qui laisse penser que la fonctionnalité "ne marche pas" alors qu'elle a simplement été appliquée à un seul paragraphe sur plusieurs visés.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : appuyer sur `Tab` ne déplace pas le texte à la position attendue</span>

- **Diagnostic** : aucun taquet personnalisé n'a été posé à cet endroit précis ; `Tab` utilise alors les taquets par défaut de Word (souvent tous les 1,25 cm), qui ne correspondent pas nécessairement à la position visuellement souhaitée.
- **Résolution** : poser explicitement un taquet à la position voulue (sections 12.3 ou 12.4) plutôt que de compter sur les taquets par défaut.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les points de suite n'apparaissent que sur certaines lignes du sommaire</span>

- **Diagnostic** : le taquet avec points de suite n'a probablement été appliqué qu'à une partie des paragraphes sélectionnés au moment de sa création (section 12.4), les autres lignes ayant été ajoutées après coup sans hériter du même réglage.
- **Résolution** : sélectionner l'ensemble des lignes du sommaire et réappliquer le taquet avec points de suite à toutes, en une seule fois.
</div>

## En entreprise

- **Bonne pratique répandue** : réserver les tabulations à des alignements ponctuels et simples (en-tête de lettre, courte liste alignée), et basculer vers un vrai tableau (chapitre 26) dès que la structure se complexifie.
- **Bonne pratique répandue** : documenter dans un modèle d'entreprise (chapitre 19) les taquets standards d'un en-tête de correspondance officielle, pour une cohérence entre tous les courriers produits par l'organisation.
- **Erreur classique observée** : des documents où l'alignement en colonnes "à l'espace" se décale visiblement dès l'ouverture sur un poste utilisant une police de substitution différente (chapitre 1, sur la compatibilité DOCX).

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — le taquet "Barre" pour séparer visuellement des colonnes</span>
Un cinquième type de taquet, moins connu, insère une **barre verticale** fixe entre deux colonnes de texte tabulé, sans nécessiter de bordure de tableau — accessible dans la boîte de dialogue Tabulations sous "Alignement > Barre". Un raccourci visuel utile pour séparer deux valeurs alignées sans construire un tableau complet.
</div>

## Résumé du chapitre

- Les espaces répétés ne garantissent jamais un alignement fiable avec une police à chasse variable ; seule une vraie tabulation résout ce problème structurellement.
- Quatre types de taquets existent : gauche, centré, droit, décimal — chacun avec un usage précis.
- Un taquet se pose visuellement sur la règle (rapide, approximatif) ou par boîte de dialogue Tabulations (lent, précis, avec points de suite disponibles).
- Un taquet est une propriété de paragraphe, comme un retrait : il ne s'applique qu'aux paragraphes sélectionnés au moment de sa création.
- Pour un document dont la longueur évolue, un sommaire manuel à tabulations doit être mis à jour à la main ; la table des matières automatique (chapitre 28) reste préférable dès que possible.
- Les tabulations conviennent à un alignement simple en deux ou trois colonnes ; un vrai tableau (chapitre 26) s'impose au-delà.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pourquoi les espaces répétés ne garantissent-ils pas un alignement fiable ?
   - a) Parce que Word limite le nombre d'espaces consécutifs
   - b) Parce que la plupart des polices ont une largeur de caractère variable
   - c) Parce que les espaces ne s'impriment jamais
   - d) Parce que c'est une fonctionnalité désactivée par défaut

2. Un taquet décimal sert principalement à :
   - a) Centrer du texte
   - b) Aligner des nombres sur leur séparateur décimal
   - c) Insérer une barre verticale
   - d) Créer un retrait de première ligne

3. Les points de suite (pointillés) se configurent :
   - a) Dans la boîte de dialogue Police
   - b) Dans la boîte de dialogue Tabulations
   - c) Dans le volet de navigation
   - d) Dans les options de correction automatique

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un taquet posé sur la règle s'applique automatiquement à tout le document. — **Faux** (il ne s'applique qu'aux paragraphes sélectionnés au moment de sa création).
2. La tabulation et le retrait de première ligne sont exactement le même mécanisme. — **Faux**, ce sont deux mécanismes distincts.
3. Un sommaire construit avec des tabulations se met à jour automatiquement si le document change de longueur. — **Faux** (contrairement à une table des matières automatique, chapitre 28).
4. Il existe un type de taquet permettant d'insérer une barre verticale entre deux colonnes. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un tableau de deux colonnes serait parfois un choix moins adapté qu'une simple tabulation pour un alignement ponctuel.
2. Un collègue tape systématiquement plusieurs espaces pour aligner des colonnes de chiffres dans ses documents. Explique-lui, avec un exemple concret, pourquoi cette méthode finira par lui poser problème.

**Corrigé 1** : un tableau introduit une structure plus lourde (bordures à gérer ou masquer, cellules, comportement différent à la mise en page) pour un besoin qui ne demande qu'un simple alignement ponctuel de deux ou trois éléments — la tabulation atteint le même résultat visuel plus rapidement et sans structure superflue.

**Corrigé 2** : dès qu'un des chiffres alignés change de nombre de chiffres (par exemple 500 devient 12 500), l'alignement à l'espace se décale visuellement car chaque espace occupe une largeur fixe qui ne compense pas la largeur variable des chiffres eux-mêmes selon la police utilisée — un taquet décimal, lui, réaligne automatiquement chaque valeur sur son séparateur décimal, quel que soit le nombre de chiffres.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>

Crée une liste de trois produits fictifs avec leur prix, alignés avec un taquet décimal, de sorte que les prix (à un ou deux chiffres avant la virgule) s'alignent parfaitement sur leur séparateur décimal.
</div>

**Corrigé :** réussi si les trois montants s'alignent visuellement sur leur virgule décimale, quel que soit le nombre de chiffres de chaque montant.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.2</span>

Reproduis le sommaire avec points de suite de l'atelier 31 sur un document de ton choix, avec au moins quatre entrées de longueurs de titre différentes. Vérifie que tous les numéros de page restent alignés à la même position malgré ces longueurs différentes.
</div>

**Corrigé :** réponse personnelle ; réussi si les quatre numéros de page s'alignent verticalement à la position exacte définie dans la boîte de dialogue Tabulations, avec des points de suite visibles entre chaque titre et son numéro.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais pourquoi les espaces répétés ne garantissent jamais un alignement fiable.</li>
<li>☐ Je pose un taquet gauche, centré, droit et décimal directement sur la règle.</li>
<li>☐ Je pose un taquet avec précision et points de suite via la boîte de dialogue Tabulations.</li>
<li>☐ Je sais déplacer et supprimer un taquet existant.</li>
<li>☐ Je choisis consciemment entre tabulation et tableau selon la complexité réelle du besoin.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Jamais d'espaces répétés** pour aligner du texte en colonnes — toujours une tabulation.
- **Quatre types de taquets** : gauche, centré, droit, décimal (plus "Barre", moins courant).
- **Taquet = propriété de paragraphe**, comme un retrait — s'applique uniquement à la sélection au moment de sa création.
- **Points de suite** = boîte de dialogue Tabulations, pas la boîte de dialogue Police.
- **Sommaire à tabulations** = manuel, à mettre à jour soi-même ; préférer la table des matières automatique (chapitre 28) dès que possible.

Aucun raccourci clavier dédié dans ce chapitre au-delà de la touche `Tab` elle-même.
</div>

## FAQ

<dl class="faq">
<dt>Combien de taquets puis-je poser sur une même ligne ?</dt>
<dd>Autant que nécessaire, sans limite pratique significative — au-delà de trois ou quatre colonnes cependant, un tableau (chapitre 26) devient presque toujours plus lisible et plus facile à maintenir.</dd>

<dt>Les taquets sont-ils conservés si je copie-colle le texte dans un autre document ?</dt>
<dd>Oui, généralement, surtout avec l'option de collage "Conserver la mise en forme source" (chapitre 7) — les taquets étant une propriété de paragraphe transférée avec le texte.</dd>

<dt>Puis-je afficher les taquets existants sans ouvrir la boîte de dialogue Tabulations ?</dt>
<dd>Oui : ils apparaissent directement comme de petits repères sur la règle horizontale dès que le point d'insertion se trouve dans un paragraphe qui en contient, sans action supplémentaire nécessaire.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les tabulations : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Comparatif complet Tabulations vs Tableaux : Annexe C.
- Approfondissement de la table des matières automatique, alternative au sommaire manuel : chapitre 28.

*Chapitre suivant : mise en page — marges, orientation, format et sections. Ce chapitre clôt la Partie 3 (mise en forme du texte) ; la Partie 4 s'attaque désormais à la mise en page de la page elle-même.*
