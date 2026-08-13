<div class="chapitre-titre-num">CHAPITRE 26</div>

# Créer et mettre en forme un tableau

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : créer un tableau en spécifiant précisément son nombre de lignes et de colonnes ; naviguer et sélectionner efficacement lignes, colonnes, cellules ou tableau entier ; redimensionner un tableau, ses lignes et ses colonnes, y compris de façon uniforme ; fusionner et fractionner des cellules pour des mises en page complexes ; régler les marges intérieures et l'espacement des cellules ; fractionner un tableau en deux tableaux distincts ; configurer une ligne d'en-tête qui se répète automatiquement sur chaque page ; et appliquer un style de tableau cohérent avec le thème du document.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Créer des tableaux en spécifiant lignes et colonnes | MO-100 Word Associate — Manage Tables and Lists | 3.1.3 |
| Configurer les marges et l'espacement des cellules | MO-100 Word Associate — Manage Tables and Lists | 3.2.2 |
| Fusionner et fractionner des cellules | MO-100 Word Associate — Manage Tables and Lists | 3.2.3 |
| Redimensionner des tableaux, lignes et colonnes | MO-100 Word Associate — Manage Tables and Lists | 3.2.4 |
| Fractionner des tableaux | MO-100 Word Associate — Manage Tables and Lists | 3.2.5 |
| Configurer une ligne d'en-tête répétée | MO-100 Word Associate — Manage Tables and Lists | 3.2.6 |

Ce chapitre couvre la quasi-totalité du sous-domaine MOS **3.2 Modify tables**, les objectifs restants (conversion texte-tableau, tri) étant traités au chapitre 27.

**Prérequis** : chapitre 12 (tabulations), pour bien situer quand un tableau est réellement l'outil adapté plutôt qu'un simple alignement par taquets.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport financier trimestriel de l'ONG doit présenter le détail des dépenses par catégorie sur les quatre trimestres de l'année, dans un tableau suffisamment long pour s'étendre sur deux pages à l'impression. Ta responsable veut aussi une ligne de titre fusionnée en haut du tableau ("Dépenses 2026"), et remarque que les cellules semblent "trop collées, on n'arrive pas à lire confortablement les chiffres". Ce chapitre couvre chacun de ces besoins précis, un cran au-dessus des tabulations du chapitre 12.
</div>

## 26.1 Créer un tableau en spécifiant lignes et colonnes

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 73 — Créer le tableau de dépenses trimestrielles</span>

**Objectif** : créer la structure de base du tableau demandé dans la mise en situation.

**Préparation** : ouvre un nouveau document de test.

**Étapes détaillées** :
1. Onglet **Insertion**, groupe Tableaux, clique sur **Tableau**.
2. Pour un tableau simple et rapide, fais glisser la souris sur la grille visuelle proposée (jusqu'à 10x8 cellules) : le nombre de lignes et de colonnes survolées s'affiche en direct au-dessus.
3. Pour un tableau plus grand ou une saisie précise du nombre exact de lignes/colonnes, clique plutôt sur **"Insérer un tableau..."** en dessous de la grille : une boîte de dialogue permet de taper directement "5" colonnes (Catégorie, T1, T2, T3, T4) et "6" lignes (1 ligne de titre + 5 catégories de dépense).
4. Clique sur **OK** : le tableau vide apparaît, prêt à être rempli.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.1.3 Create tables by specifying rows and columns (MO-100 Associate)</span>
L'atelier 73 correspond exactement à cet objectif. **Recommandation** : pour un tableau de plus de 10 colonnes ou 8 lignes, la boîte de dialogue "Insérer un tableau" est indispensable, la grille visuelle rapide étant limitée à cette taille.
</div>

## 26.2 Naviguer et sélectionner dans un tableau

| Action | Méthode |
|---|---|
| Passer à la cellule suivante | `Tab` |
| Passer à la cellule précédente | `Maj+Tab` |
| Nouvelle ligne en fin de tableau | `Tab` depuis la dernière cellule de la dernière ligne |
| Sélectionner une cellule | Clic dans la marge gauche de la cellule (le curseur devient une petite flèche noire) |
| Sélectionner une ligne entière | Clic dans la marge gauche, à hauteur de la ligne, hors du tableau |
| Sélectionner une colonne entière | Clic juste au-dessus de la colonne (le curseur devient une flèche noire pointant vers le bas) |
| Sélectionner tout le tableau | Clic sur le petit repère carré à quatre flèches qui apparaît en haut à gauche du tableau au survol |

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Appuyer sur `Tab` depuis la toute dernière cellule du tableau (en bas à droite) crée automatiquement une nouvelle ligne — un réflexe rapide pour allonger un tableau au fil de la saisie, sans passer par une commande d'insertion de ligne explicite.
</div>

## 26.3 Redimensionner un tableau, ses lignes et ses colonnes

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 74 — Ajuster la largeur des colonnes du tableau de dépenses</span>

**Objectif** : donner plus d'espace à la colonne "Catégorie" (texte plus long) et harmoniser les colonnes de chiffres.

**Préparation** : reprends le tableau de l'atelier 73, rempli de quelques données de test.

**Étapes détaillées** :
1. Place le curseur sur la ligne verticale séparant la colonne "Catégorie" de "T1" : il se transforme en double flèche horizontale. Fais-la glisser vers la droite pour élargir la première colonne.
2. Sélectionne les quatre colonnes de chiffres (T1 à T4), onglet contextuel **Disposition** (distinct de "Création du tableau"), groupe Taille de cellule, clique sur **"Distribuer les colonnes"** : les quatre colonnes sélectionnées deviennent instantanément de largeur strictement identique.
3. Pour redimensionner tout le tableau proportionnellement, fais glisser le petit repère carré qui apparaît en bas à droite du tableau au survol.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.4 Resize tables, rows, and columns (MO-100 Associate)</span>
L'atelier 74 correspond exactement à cet objectif. **Piège fréquent** : "Distribuer les colonnes" et "Distribuer les lignes" se trouvent dans l'onglet **Disposition**, pas dans l'onglet Création du tableau où l'on pourrait intuitivement les chercher en premier.
</div>

## 26.4 Fusionner et fractionner des cellules

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 75 — Créer la ligne de titre fusionnée "Dépenses 2026"</span>

**Objectif** : répondre à la deuxième demande de la mise en situation d'ouverture.

**Préparation** : reprends le tableau des ateliers précédents. Insère une nouvelle ligne tout en haut (clic droit sur la première ligne > Insérer > Insérer au-dessus).

**Étapes détaillées** :
1. Sélectionne toutes les cellules de cette nouvelle première ligne (les cinq colonnes).
2. Onglet contextuel Disposition, groupe Fusionner, clique sur **Fusionner les cellules** : les cinq cellules deviennent une seule cellule continue.
3. Tape "Dépenses 2026", centre le texte (chapitre 10), mets-le en gras (chapitre 9).
4. À l'inverse, pour fractionner une cellule existante en plusieurs (par exemple, si "T1" devait plus tard être divisé en "Janvier"/"Février"/"Mars"), sélectionne cette cellule, clique sur **Fractionner les cellules**, et indique le nombre de colonnes et de lignes souhaité pour la subdivision.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.3 Merge and split cells (MO-100 Associate)</span>
L'atelier 75 correspond exactement à cet objectif pour la fusion ; la procédure de fractionnement de cellule le complète pour l'opération inverse.
</div>

## 26.5 Marges et espacement des cellules

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 76 — Aérer les cellules du tableau</span>

**Objectif** : répondre à la remarque "trop collées" de la mise en situation d'ouverture.

**Préparation** : reprends le tableau des ateliers précédents.

**Étapes détaillées** :
1. Clique n'importe où dans le tableau, onglet contextuel Disposition, groupe Alignement, clique sur **Marges de la cellule**.
2. Augmente les valeurs **Haut**, **Bas**, **Gauche**, **Droite** (par exemple à 0,1 cm chacune si elles étaient à 0) : un espace intérieur apparaît désormais entre le texte et les bordures de chaque cellule.
3. L'option **"Autoriser l'espacement entre les cellules"**, dans la même boîte de dialogue, ajoute en plus un espace visible **entre** les cellules elles-mêmes (plutôt qu'à l'intérieur de chacune) — un effet visuel différent, parfois utilisé pour un rendu de tableau plus aéré façon grille de galerie photo.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.2 Configure cell margins and spacing (MO-100 Associate)</span>
L'atelier 76 correspond exactement à cet objectif. **Distinction à retenir** : "marges de cellule" (espace intérieur, entre le texte et la bordure d'une même cellule) et "espacement entre les cellules" (espace extérieur, entre deux cellules voisines) sont deux réglages distincts de la même boîte de dialogue, à ne pas confondre en situation d'examen.
</div>

## 26.6 Fractionner un tableau en deux

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Séparer un tableau en deux tableaux distincts</span>

1. Place le point d'insertion dans la ligne qui doit devenir la **première ligne** du second tableau.
2. Onglet contextuel Disposition, groupe Fusionner, clique sur **Fractionner le tableau**.
3. Un paragraphe normal (non tableau) s'insère automatiquement entre les deux tableaux désormais distincts, chacun modifiable indépendamment.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.5 Split tables (MO-100 Associate)</span>
Cette procédure correspond exactement à cet objectif. **Usage typique** : insérer un paragraphe de commentaire ou de transition entre deux ensembles de données qui, à l'origine, formaient un seul tableau continu.
</div>

## 26.7 Configurer une ligne d'en-tête répétée

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 77 — Répéter le titre du tableau sur la deuxième page</span>

**Objectif** : garantir que le tableau de dépenses, qui s'étend sur deux pages (mise en situation d'ouverture), reste lisible sans devoir remonter en haut de la première page pour identifier chaque colonne.

**Préparation** : reprends le tableau, allongé avec suffisamment de lignes de données pour dépasser une page (ou simule ce cas avec un tableau de test volontairement long).

**Étapes détaillées** :
1. Sélectionne la ligne d'en-tête du tableau (celle contenant "Catégorie", "T1", "T2", "T3", "T4" — pas la ligne fusionnée "Dépenses 2026" de la section 26.4, qui n'est qu'un titre décoratif).
2. Onglet contextuel Disposition, groupe Données, clique sur **"Répéter les lignes d'en-tête"**.
3. Fais défiler le document jusqu'à la deuxième page contenant la suite du tableau : la ligne d'en-tête sélectionnée apparaît désormais automatiquement en haut de cette page aussi, sans avoir été retapée manuellement.

**Résultat attendu** : un tableau long reste lisible sur chaque page qu'il occupe, chaque colonne identifiable sans retour en arrière.

**Dépannage** : si la ligne d'en-tête ne se répète pas, vérifie qu'elle a bien été sélectionnée dans son intégralité (toute la ligne, pas seulement une cellule) avant de cliquer sur la commande, et que le tableau est bien coupé par un saut de page **automatique** plutôt que manuel (un saut de page manuel, chapitre 15, à l'intérieur d'un tableau peut interférer avec ce comportement).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.6 Configure a repeating row header (MO-100 Associate)</span>
L'atelier 77 correspond exactement à cet objectif. **Piège fréquent** : cette option ne fonctionne que sur une ligne d'en-tête réellement en première position du tableau — impossible de désigner comme "répétée" une ligne située au milieu.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un tableau récapitulatif de clauses contractuelles s'étalant sur plusieurs pages utilise systématiquement cette fonctionnalité, garantissant qu'un lecteur qui parcourt le document en diagonale retrouve toujours l'intitulé de chaque colonne sans devoir remonter au tout début du tableau.
</div>

## 26.8 Appliquer un style de tableau

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Habiller le tableau avec un style cohérent</span>

1. Clique dans le tableau, onglet contextuel **Création du tableau**, groupe Styles de tableau, survole les vignettes pour un aperçu instantané.
2. Les couleurs de la galerie font référence au thème actif du document (chapitre 18), garantissant une cohérence automatique.
3. Dans le groupe **Options de style de tableau**, coche ou décoche **"Ligne d'en-tête"** (mise en forme distincte pour la première ligne), **"Lignes à bandes"** (alternance de couleur entre lignes, facilitant la lecture d'un tableau dense) et **"Première colonne"** selon les besoins.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Activer "Lignes à bandes" sur tout tableau de plus de cinq ou six lignes de données facilite considérablement la lecture horizontale d'une ligne précise, en particulier sur un tableau imprimé où le regard doit suivre une ligne sur toute sa largeur sans se perdre.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reconstituer le tableau complet de la mise en situation</span>
Construis intégralement le tableau de dépenses trimestrielles décrit en ouverture de chapitre : ligne de titre fusionnée "Dépenses 2026", ligne d'en-tête de colonnes répétée sur chaque page, marges de cellule aérées, style de tableau cohérent avec un thème de ton choix, et suffisamment de lignes de données pour que le tableau s'étende réellement sur deux pages à l'impression (aperçu avant impression, chapitre 44).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Chercher "Distribuer les colonnes" dans l'onglet Création du tableau</span>
Comme signalé en section 26.3, cette commande se trouve dans l'onglet Disposition, pas dans Création du tableau (qui contient plutôt les styles et couleurs) — une confusion fréquente entre les deux onglets contextuels d'un tableau sélectionné.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre marges de cellule et espacement entre les cellules</span>
Comme signalé en section 26.5, ces deux réglages voisins de la même boîte de dialogue produisent des effets visuels différents — vérifier lequel des deux correspond réellement au résultat recherché avant de valider.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Sélectionner la mauvaise ligne pour "Répéter les lignes d'en-tête"</span>
Comme signalé dans l'atelier 77, sélectionner la ligne de titre fusionnée décorative plutôt que la véritable ligne d'en-tête de colonnes produit un résultat différent de celui attendu, la répétition portant alors sur le mauvais contenu.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : impossible de fusionner des cellules qui semblent pourtant adjacentes</span>

- **Diagnostic** : les cellules sélectionnées ne forment peut-être pas un rectangle parfait (par exemple, une sélection en L irrégulière suite à des fusions précédentes), un cas que Word ne sait pas fusionner directement.
- **Résolution** : vérifier la sélection exacte et, si nécessaire, fusionner d'abord des sous-groupes de cellules par étapes plutôt qu'en une seule opération.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la ligne d'en-tête répétée n'apparaît pas en mode Aperçu avant impression</span>

- **Diagnostic** : la répétition de ligne d'en-tête (section 26.7) ne s'affiche visuellement qu'à partir du moment où le tableau dépasse réellement une page — sur un tableau tenant entièrement sur une seule page, aucune répétition n'est visible puisqu'aucune deuxième page n'existe encore.
- **Résolution** : vérifier que le tableau dépasse effectivement une page avant de conclure à un problème.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours activer la répétition de ligne d'en-tête sur tout tableau susceptible de dépasser une page, dès sa création plutôt qu'après coup lors d'une relecture tardive.
- **Bonne pratique répandue** : utiliser "Distribuer les colonnes/lignes" pour une harmonisation rapide plutôt que d'ajuster chaque largeur manuellement à la souris, une méthode plus lente et moins précise.
- **Erreur classique observée** : des tableaux financiers professionnels aux colonnes de largeurs visiblement incohérentes, résultat d'ajustements manuels approximatifs plutôt que d'une distribution automatique.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — convertir la hauteur de ligne en valeur exacte</span>
Onglet Disposition, groupe Taille de cellule, le champ **Hauteur** accepte une valeur numérique précise en centimètres pour la ligne sélectionnée — combiné à "Distribuer les lignes" pour le reste du tableau, cela permet un contrôle très fin sur un tableau destiné à un usage où l'alignement millimétrique compte (une grille d'emploi du temps imprimée, par exemple).
</div>

## Résumé du chapitre

- Un tableau se crée en spécifiant précisément lignes et colonnes, via la grille rapide ou la boîte de dialogue complète pour les grands tableaux — objectif MOS 3.1.3.
- La navigation (`Tab`/`Maj+Tab`) et la sélection (ligne, colonne, cellule, tableau entier) suivent des zones de clic précises dans les marges du tableau.
- Redimensionner un tableau, ses lignes ou colonnes se fait manuellement ou via "Distribuer" pour une harmonisation automatique — objectif MOS 3.2.4.
- Fusionner et fractionner des cellules permettent des mises en page complexes comme un titre fusionné — objectif MOS 3.2.3.
- Marges de cellule (espace intérieur) et espacement entre cellules (espace extérieur) sont deux réglages distincts — objectif MOS 3.2.2.
- Fractionner un tableau le sépare en deux tableaux indépendants avec un paragraphe entre eux — objectif MOS 3.2.5.
- Répéter la ligne d'en-tête garantit la lisibilité d'un tableau long sur plusieurs pages — objectif MOS 3.2.6.
- Les styles de tableau font référence au thème actif, avec des options (ligne d'en-tête, lignes à bandes) à ajuster selon le contenu.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour harmoniser instantanément la largeur de plusieurs colonnes sélectionnées, on utilise :
   - a) Fusionner les cellules
   - b) Distribuer les colonnes
   - c) Répéter les lignes d'en-tête
   - d) Fractionner le tableau

2. "Répéter les lignes d'en-tête" fonctionne :
   - a) Sur n'importe quelle ligne du tableau
   - b) Uniquement sur la première ligne du tableau
   - c) Uniquement sur la dernière ligne
   - d) Uniquement si le tableau tient sur une seule page

3. L'espacement "entre les cellules" (distinct des marges de cellule) ajoute de l'espace :
   - a) À l'intérieur de chaque cellule, entre le texte et la bordure
   - b) Entre deux cellules voisines, à l'extérieur de chacune
   - c) Uniquement dans la ligne d'en-tête
   - d) Uniquement à l'impression, jamais à l'écran

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. "Distribuer les colonnes" se trouve dans l'onglet Création du tableau. — **Faux**, il se trouve dans l'onglet Disposition.
2. Fractionner un tableau insère automatiquement un paragraphe entre les deux tableaux résultants. — **Vrai**.
3. Une ligne d'en-tête répétée doit être retapée manuellement sur chaque nouvelle page. — **Faux**, c'est automatique une fois la fonctionnalité activée.
4. Les styles de tableau font référence aux couleurs du thème actif du document. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique la différence entre "marges de cellule" et "espacement entre les cellules", avec un exemple de résultat visuel différent pour chacun.
2. Un collègue a un tableau de huit pages sans ligne d'en-tête répétée. Explique-lui pourquoi c'est problématique et comment corriger cela rapidement.

**Corrigé 1** : les marges de cellule ajoutent de l'espace **à l'intérieur** d'une cellule, entre son texte et ses propres bordures (un texte qui semblait collé aux bords se retrouve mieux aéré) ; l'espacement entre les cellules ajoute de l'espace **entre** deux cellules voisines, créant une séparation visible façon grille, un peu comme les cases d'un damier avec un espace blanc entre chaque case plutôt que des cases directement adjacentes.

**Corrigé 2** : sans ligne d'en-tête répétée, un lecteur consultant une page intermédiaire du tableau (page 5 sur 8, par exemple) ne voit aucun intitulé de colonne et doit remonter physiquement à la première page pour comprendre ce que chaque colonne représente — une perte de temps et de clarté évitable. La correction est rapide : sélectionner la ligne d'en-tête réelle (première ligne du tableau) et activer Disposition > Répéter les lignes d'en-tête, une seule fois pour que l'effet s'applique à toutes les pages suivantes.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.1</span>

Crée un tableau de 4 colonnes et 10 lignes, fusionne la première ligne en un titre unique, applique un style de tableau avec lignes à bandes, puis distribue uniformément les quatre colonnes.
</div>

**Corrigé :** réussi si le tableau affiche un titre fusionné en première ligne, des lignes alternées visuellement grâce aux bandes, et des colonnes de largeur strictement identique après distribution.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.2</span>

Sur un tableau suffisamment long pour dépasser une page, active la répétition de la ligne d'en-tête, puis vérifie en aperçu avant impression (chapitre 44) que l'en-tête apparaît bien sur chaque page occupée par le tableau.
</div>

**Corrigé :** réponse personnelle ; réussi si l'aperçu avant impression confirme la présence de la ligne d'en-tête en haut de chaque page concernée par le tableau.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je crée un tableau en spécifiant précisément lignes et colonnes.</li>
<li>☐ Je navigue et sélectionne efficacement dans un tableau.</li>
<li>☐ Je redimensionne un tableau, ses lignes et colonnes, y compris uniformément.</li>
<li>☐ Je fusionne et fractionne des cellules selon les besoins de mise en page.</li>
<li>☐ Je règle les marges de cellule et l'espacement entre cellules distinctement.</li>
<li>☐ Je fractionne un tableau en deux quand nécessaire.</li>
<li>☐ Je configure une ligne d'en-tête répétée sur un tableau long.</li>
<li>☐ J'applique un style de tableau cohérent avec le thème du document.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Créer un tableau** = grille rapide (petit tableau) ou boîte de dialogue (grand tableau, précis) — MOS 3.1.3.
- **Distribuer les colonnes/lignes** = onglet Disposition, pas Création du tableau — MOS 3.2.4.
- **Fusionner/Fractionner les cellules** = onglet Disposition, groupe Fusionner — MOS 3.2.3.
- **Marges de cellule** (intérieur) ≠ **espacement entre cellules** (extérieur) — MOS 3.2.2.
- **Fractionner le tableau** = insère un paragraphe entre deux tableaux distincts — MOS 3.2.5.
- **Répéter les lignes d'en-tête** = uniquement sur la vraie première ligne — MOS 3.2.6.

**Raccourcis clavier de ce chapitre** :
- `Tab` : cellule suivante (ou nouvelle ligne depuis la dernière cellule).
- `Maj+Tab` : cellule précédente.
</div>

## FAQ

<dl class="faq">
<dt>Un tableau peut-il contenir un autre tableau à l'intérieur d'une de ses cellules ?</dt>
<dd>Oui, Word autorise les tableaux imbriqués, bien que leur usage doive rester limité à des besoins de mise en page réellement complexes pour ne pas nuire à la lisibilité du document.</dd>

<dt>Le style de tableau appliqué change-t-il si le thème du document est modifié plus tard ?</dt>
<dd>Oui, tant que le style utilisé fait référence aux couleurs du thème (comme la majorité des styles de la galerie, section 26.8) plutôt qu'à des couleurs figées appliquées manuellement.</dd>

<dt>Peut-on annuler une fusion de cellules sans perdre le contenu qu'elle contenait ?</dt>
<dd>Oui, `Ctrl+Z` immédiatement après la fusion restaure les cellules individuelles avec leur contenu d'origine ; fractionner une cellule déjà fusionnée plus tard répartit son contenu selon des règles moins prévisibles, mieux vaut donc recourir à l'annulation si l'action est encore récente.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la création et la mise en forme de tableaux : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Comparatif Tabulations vs Tableaux : Annexe C.

*Chapitre suivant : tableaux avancés — formules, tri, et conversion entre texte et tableau, pour aller au-delà de la structure et de la mise en forme de base couvertes ici.*
