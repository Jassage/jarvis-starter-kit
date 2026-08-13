<div class="chapitre-titre-num">CHAPITRE 3</div>

# Découverte de l'interface : Ruban, onglets, barre d'accès rapide, mode Backstage

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : identifier et nommer précisément chaque zone de la fenêtre principale de Word ; comprendre la logique du Ruban (onglets, groupes, commandes, lanceurs de boîte de dialogue) et retrouver n'importe quelle commande sans deviner au hasard ; distinguer un onglet permanent d'un onglet contextuel ; réduire ou restaurer le Ruban selon ton besoin d'espace ; personnaliser la barre d'outils Accès rapide avec tes commandes les plus utilisées ; naviguer dans le mode Backstage (onglet Fichier) pour gérer un document au-delà du simple contenu ; et lire les informations affichées dans la barre d'état.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Personnaliser la barre d'outils Accès rapide | MO-101 Word Expert — Manage Document Options and Settings | 1.1.6 |
| Afficher les onglets masqués du Ruban | MO-101 Word Expert — Manage Document Options and Settings | 1.1.7 |

Le reste de ce chapitre (anatomie générale du Ruban, mode Backstage, barre d'état) est un **prérequis de navigation** implicite à l'ensemble de l'examen MOS Word — aucune question ne porte directement sur "qu'est-ce qu'un onglet", mais chaque tâche de l'examen suppose cette maîtrise acquise. Les compétences directement évaluées et propres à ce chapitre se limitent aux deux lignes ci-dessus, détaillées en section 3.5 et approfondies au chapitre 4.

**Prérequis** : chapitre 2 (Word installé et activé sur ta machine).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Word enfin installé (chapitre 2), tu l'ouvres pour la première fois à l'ONG. L'écran qui s'affiche te semble dense : des bandes d'icônes en haut, des mots que tu ne connais pas ("Ruban", groupes de commandes sans étiquette évidente), une zone blanche au centre, une barre grise tout en bas. Ta responsable, en passant derrière toi, remarque : <em>"Ah, ça a un peu changé depuis la dernière fois que j'ai touché à un vieux Word. Cherche pas à tout retenir, une fois que tu sais où regarder, tu retrouves toujours ce qu'il te faut."</em> Elle a raison : ce chapitre ne te demande pas de mémoriser où se trouve chaque commande, mais de comprendre la <strong>logique</strong> qui organise l'interface — une logique stable depuis 2007, que tu retrouveras identique dans Excel et PowerPoint.
</div>

## 3.1 Vue d'ensemble annotée de la fenêtre Word

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Fenêtre principale de Word au démarrage</span>

- **Objectif** : donner une carte de référence complète de l'interface, à laquelle renvoyer tout le reste du chapitre (et du manuel).
- **Contenu exact** : un document vierge fraîchement ouvert dans Word, fenêtre maximisée, onglet **Accueil** actif.
- **Zones à mettre en évidence** (une flèche numérotée par zone, dans le sens de lecture haut → bas, gauche → droite) :
  1. Barre d'outils Accès rapide (coin supérieur gauche, au-dessus du Ruban).
  2. Titre du document (centre de la barre de titre).
  3. Compte Microsoft connecté (coin supérieur droit).
  4. Bouton "Réduire le Ruban" (chevron, à droite des onglets).
  5. Les onglets du Ruban (Fichier, Accueil, Insertion, Dessin, Création, Disposition, Références, Publipostage, Révision, Affichage).
  6. Le Ruban lui-même, avec ses groupes de commandes visibles sous l'onglet Accueil (Presse-papiers, Police, Paragraphe, Styles, Modification).
  7. Un lanceur de boîte de dialogue (petite flèche en coin inférieur droit d'un groupe, ex. le groupe Police).
  8. La règle horizontale (si affichée).
  9. La zone de la page (fond blanc central) et le point d'insertion clignotant.
  10. La barre d'état (bande grise tout en bas : numéro de page, nombre de mots, langue de correction).
  11. Les boutons de modes d'affichage et le curseur de zoom (coin inférieur droit).
- **Annotations/flèches** : onze flèches numérotées reliées à un encadré latéral listant le nom exact de chaque zone (voir liste ci-dessus).
- **Légende** : "Figure 3.1 — Carte complète de l'interface de Word, référence pour tout le manuel."
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le vocabulaire exact de cette carte</span>
Ce manuel utilise systématiquement les noms précis de la Figure 3.1 (Ruban, onglet, groupe, lanceur de boîte de dialogue, barre d'état, mode Backstage) plutôt que des expressions approximatives ("le menu du haut", "les trucs en bas"). Ce vocabulaire n'est pas un formalisme gratuit : c'est celui qu'utilisent l'aide officielle de Microsoft, les formations MOS et tes futurs collègues — s'y habituer dès maintenant t'évite de "traduire" mentalement à chaque recherche d'aide en ligne.
</div>

## 3.2 Anatomie du Ruban : onglets, groupes, commandes

Le **Ruban** est la bande horizontale de commandes visuelles qui a remplacé, en 2007 (chapitre 1), l'ancien système de menus déroulants empilés (Fichier, Édition, Affichage...) hérité des années 1990.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Pense au Ruban comme à l'établi d'un artisan, réorganisé par métier plutôt qu'en vrac : au lieu de fouiller un unique tiroir fourre-tout (l'ancien menu "Format" qui contenait autrefois polices, paragraphes, styles, colonnes, tabulations, tout mélangé), tu ouvres directement le bon compartiment — l'onglet **Accueil** range les outils de mise en forme courante, l'onglet **Insertion** ceux qui ajoutent des objets, l'onglet **Références** ceux qui construisent un document académique. Une fois que tu sais dans quel compartiment chercher, la commande précise saute aux yeux au lieu d'être noyée dans une liste.
</div>

Chaque **onglet** (Accueil, Insertion, Disposition...) regroupe des **groupes de commandes** apparentées, eux-mêmes composés de boutons, menus déroulants et cases à cocher. Un petit détail structurant, visible en bas à droite de certains groupes : le **lanceur de boîte de dialogue** — une flèche discrète qui, une fois cliquée, ouvre une fenêtre offrant des réglages plus fins que ceux visibles directement dans le Ruban.

| Onglet | Rôle principal | Chapitre(s) où il est détaillé |
|---|---|---|
| **Fichier** | Mode Backstage : gestion du document lui-même (section 3.6) | 5, 42-45 |
| **Accueil** | Mise en forme courante du texte et des paragraphes | 9-11 |
| **Insertion** | Ajout d'objets : images, tableaux, en-têtes, symboles | 21-27 |
| **Dessin** | Annotations manuscrites et formes libres (tactile/stylet) | — |
| **Création** | Thèmes, jeux de styles, filigrane, couleur de page | 17-18 |
| **Disposition** | Marges, orientation, colonnes, sauts de page/section | 13-16 |
| **Références** | Table des matières, notes de bas de page, citations, index | 28-33 |
| **Publipostage** | Fusion de documents avec une source de données | 34 |
| **Révision** | Orthographe, commentaires, suivi des modifications | 8, 38-40 |
| **Affichage** | Modes d'affichage, volets, zoom | 6 |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — le Ruban est contextuel</span>
Certains onglets n'apparaissent **que** lorsqu'un objet précis est sélectionné : sélectionner une image fait surgir un onglet "Format de l'image" ; cliquer dans un tableau fait apparaître "Outils de tableau" avec deux sous-onglets ("Création" et "Disposition" — à ne pas confondre avec les onglets permanents du même nom). Ces **onglets contextuels** disparaissent dès que tu cliques ailleurs dans le document. Un débutant les cherche parfois en vain dans le Ruban standard, sans réaliser qu'il faut d'abord sélectionner l'objet concerné.
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Onglet contextuel "Outils de tableau"</span>

- **Objectif** : montrer concrètement l'apparition d'un onglet contextuel.
- **Contenu exact** : un tableau simple de 3x3 inséré dans un document, point d'insertion à l'intérieur d'une cellule, faisant apparaître les onglets "Création de tableau" et "Disposition (Outils de tableau)" en surbrillance à droite des onglets permanents.
- **Zones à mettre en évidence** : encadrer en couleur distincte (par exemple orange) les deux onglets contextuels, pour les différencier visuellement des onglets permanents en bleu.
- **Annotations/flèches** : légende "Ces onglets n'existent que parce qu'un tableau est actuellement sélectionné."
- **Légende** : "Figure 3.2 — Un onglet contextuel apparaît uniquement quand l'objet concerné est actif."
</div>

## 3.3 Réduire le Ruban et naviguer au clavier

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 4 — Prendre le contrôle de l'affichage du Ruban</span>

**Objectif** : savoir gagner de la place à l'écran quand le Ruban n'est pas nécessaire en continu, et retrouver n'importe quelle commande sans souris.

**Préparation** : Word ouvert sur un document vierge (celui laissé ouvert à la fin du chapitre 2, ou un nouveau document si tu redémarres Word).

**Étapes détaillées** :
1. Double-clique sur le nom de l'onglet **Accueil** actif : les groupes de commandes se masquent, ne laissant visible que la bande d'onglets. Double-clique à nouveau sur un onglet pour les réafficher.
2. Clique sur le petit chevron (^) en haut à droite du Ruban, ou utilise le raccourci **`Ctrl+F1`**, pour basculer entre Ruban complet et Ruban réduit.
3. Appuie sur la touche **`Alt`** seule (relâche-la) : des petites étiquettes de lettres et chiffres apparaissent au-dessus de chaque onglet et de la barre d'outils Accès rapide — ce sont les **touches d'accès**.
4. Appuie sur la lettre correspondant à l'onglet **Insertion** (généralement `N`) : le Ruban bascule sur cet onglet et affiche de nouvelles touches d'accès pour chacune de ses commandes.
5. Appuie sur **`Échap`** à tout moment pour annuler la navigation au clavier et revenir à l'état normal.

**Résultat attendu** : tu sais aller chercher n'importe quelle commande du Ruban en trois ou quatre frappes clavier, sans toucher la souris — une compétence particulièrement utile en cas de trackpad capricieux ou de contrainte d'accessibilité.

**Dépannage** : si les touches d'accès n'apparaissent pas après avoir appuyé sur `Alt`, vérifie que le focus clavier est bien dans la fenêtre Word (clique une fois dans le document, puis réessaie).
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — enchaîner les touches d'accès sans les relâcher visuellement</span>
Une fois la séquence `Alt` connue pour une commande précise (par exemple `Alt`, `N`, `SI` pour insérer une image via l'onglet Insertion), tu peux la retaper de mémoire sans repasser par l'affichage des étiquettes : Word l'exécute directement. C'est exactement le même principe que les raccourcis `Alt` hérités des menus Windows des années 1990 — Microsoft les a conservés par souci de compatibilité et de rapidité, sous une forme modernisée compatible avec le Ruban.
</div>

## 3.4 La barre d'outils Accès rapide

La **barre d'outils Accès rapide** (souvent abrégée BOAR ou QAT, *Quick Access Toolbar*) est la petite rangée d'icônes fixe au-dessus (ou en dessous) du Ruban, contenant par défaut Enregistrer, Annuler et Rétablir. Contrairement au Ruban, son contenu reste identique quel que soit l'onglet actif — elle est pensée pour les commandes que tu utilises en continu, peu importe ce sur quoi tu travailles.

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 5 — Personnaliser la barre d'outils Accès rapide</span>

**Objectif** : ajouter à la BOAR une commande que tu utilises fréquemment mais qui demande normalement plusieurs clics dans le Ruban — ici, "Aperçu avant impression et impression".

**Préparation** : reprends le document laissé ouvert à l'atelier 4.

**Étapes détaillées** :
1. Clique sur la petite flèche déroulante à droite de la barre d'outils Accès rapide.
2. Dans le menu qui s'ouvre, clique sur **"Aperçu et impression"** : une coche apparaît devant l'option, et son icône rejoint immédiatement la BOAR.
3. Toujours dans ce même menu, clique sur **"Afficher en dessous du Ruban"** : la BOAR se déplace sous le Ruban, plus proche de la zone de document — utile si tu as ajouté de nombreuses commandes et que la barre de titre devient trop chargée.
4. Reclique sur la flèche déroulante, puis **"Autres commandes..."** pour ouvrir la fenêtre complète de personnalisation, où **toutes** les commandes de Word (y compris celles absentes du Ruban) peuvent être ajoutées à la BOAR.
5. Dans cette fenêtre, cherche "Nombre de mots" dans la liste de gauche, sélectionne-la, clique sur **Ajouter**, puis **OK**.

**Résultat attendu** : ta barre d'outils Accès rapide contient désormais Enregistrer, Annuler, Rétablir, Aperçu et impression, et Nombre de mots — accessibles en un clic depuis n'importe quel onglet.

**Dépannage** : si une commande ajoutée par erreur encombre la BOAR, refais l'étape 4, sélectionne-la dans la liste de droite ("Personnaliser la barre d'outils Accès rapide"), puis clique sur **Supprimer**.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.6 Customize the Quick Access toolbar (MO-101 Expert)</span>
L'atelier 5 correspond exactement à cette compétence de l'examen Word Expert. **Piège fréquent** : l'examen peut demander d'ajouter une commande précise qui n'apparaît pas dans le menu déroulant rapide (comme "Nombre de mots" ci-dessus) — dans ce cas, le réflexe correct est toujours de passer par **"Autres commandes..."** plutôt que d'abandonner la recherche dans le menu rapide.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Dans un cabinet juridique où l'impression de contrats reste quotidienne, il est courant de voir la BOAR enrichie de "Aperçu et impression", "Nombre de mots" (pour vérifier des seuils contractuels de longueur) et parfois "Comparer" (chapitre 40) — trois commandes qui, sans personnalisation, exigeraient chacune plusieurs clics répétés dans le Ruban au fil de la journée.
</div>

## 3.5 Afficher un onglet masqué du Ruban

Certains onglets utiles n'apparaissent pas par défaut dans le Ruban — le plus connu étant l'onglet **Développeur**, nécessaire pour les macros (chapitre 36) et les contrôles de formulaire (chapitre 4 en aperçu, détaillé au chapitre 37).

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Afficher l'onglet Développeur</span>

1. **Fichier > Options > Personnaliser le ruban**.
2. Dans la liste de droite ("Personnaliser le ruban"), coche la case **Développeur**.
3. Clique sur **OK** : l'onglet Développeur apparaît immédiatement à droite des onglets existants.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.7 Display hidden ribbon tabs (MO-101 Expert)</span>
Cette procédure correspond directement à l'objectif d'examen Expert 1.1.7. **Recommandation** : au moment de te préparer à la Partie 14, entraîne-toi aussi à masquer à nouveau un onglet ainsi affiché (même procédure, décocher la case) — l'examen peut demander l'un ou l'autre sens de la manipulation.
</div>

## 3.6 Le mode Backstage : l'onglet Fichier

Cliquer sur l'onglet **Fichier** ne fait pas apparaître un onglet du Ruban comme les autres : il ouvre un écran plein cadre appelé **mode Backstage** (littéralement "en coulisses"), entièrement dédié à la gestion du **document en tant que fichier** plutôt qu'à son contenu.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la distinction Ruban / Backstage</span>
Le Ruban agit sur le <strong>contenu</strong> du document (le texte, sa mise en forme, les objets qu'il contient). Le mode Backstage agit sur le <strong>document lui-même</strong> comme fichier : l'enregistrer, l'imprimer, le partager, consulter ses propriétés, gérer le compte connecté, régler les options générales de Word. Cette distinction, une fois comprise, évite de chercher "Imprimer" dans le Ruban (où elle ne se trouve pas) ou de chercher une commande de mise en forme dans le Backstage (où elle n'a rien à faire).
</div>

Les rubriques principales du mode Backstage :

- **Infos** : propriétés du document, protection (chapitre 42), inspection avant partage (section détaillée au chapitre 42).
- **Nouveau** : créer un document vierge ou à partir d'un modèle (chapitre 19).
- **Ouvrir** : documents récents, OneDrive, "Ce PC".
- **Enregistrer** / **Enregistrer sous** : chapitre 5.
- **Imprimer** : aperçu et réglages d'impression (chapitre 44).
- **Partager** : envoi et coédition (chapitre 41).
- **Exporter** : conversion PDF et autres formats (chapitre 45).
- **Compte** : licence et activation (vu au chapitre 2).
- **Options** : réglages avancés de Word (chapitre 4, dédié entièrement à ce sujet).

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Mode Backstage, écran "Infos"</span>

- **Objectif** : montrer la structure du Backstage : un menu vertical de rubriques à gauche, le contenu de la rubrique sélectionnée à droite.
- **Contenu exact** : le Backstage ouvert sur "Infos", avec le menu vertical complet visible (Infos, Nouveau, Ouvrir, Enregistrer, Enregistrer sous, Imprimer, Partager, Exporter, Fermer, Compte, Options, et la flèche "Retour" en haut).
- **Zones à mettre en évidence** : encadrer le menu vertical à gauche et la flèche "Retour" (coin supérieur gauche, qui ramène au document).
- **Annotations/flèches** : flèche vers "Retour" avec la mention "Seule sortie du Backstage — ou la touche Échap."
- **Légende** : "Figure 3.3 — Le mode Backstage : menu vertical à gauche, détails à droite."
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Établissement scolaire</span>
Un enseignant qui prépare un examen ouvre systématiquement Fichier > Infos avant de diffuser le sujet, pour vérifier via "Inspecter le document" qu'aucun commentaire de relecture ou nom d'auteur resté dans les propriétés ne fuite par erreur vers les élèves — un usage concret du mode Backstage au-delà du simple enregistrement, détaillé au chapitre 42.
</div>

## 3.7 La barre d'état et le curseur de zoom

La **barre d'état**, bande grise en bas de la fenêtre, affiche en continu des informations sur le document et propose des raccourcis rapides.

| Élément (de gauche à droite) | Information affichée |
|---|---|
| Numéro de page | Page actuelle / nombre total de pages |
| Nombre de mots | Total du document, ou de la sélection si du texte est sélectionné |
| Icône de vérification | Coche verte (aucune faute détectée) ou croix (fautes à corriger) |
| Langue de correction | Langue active à l'endroit du point d'insertion |
| Boutons de mode d'affichage | Lecture, Page, Web (détaillés au chapitre 6) |
| Curseur de zoom | Glissière + pourcentage, de 10% à 500% |

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Un clic droit n'importe où dans la barre d'état ouvre un menu à cocher permettant de choisir précisément quelles informations y apparaissent (nombre de lignes, de caractères, de paragraphes...) — une personnalisation méconnue mais utile, par exemple pour un rédacteur devant respecter un nombre de caractères imposé (article de presse, résumé académique à contrainte stricte).
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reconstituer l'interface de mémoire</span>
Ferme les yeux (ou détourne le regard de l'écran) et énumère à voix haute ou par écrit, sans regarder la Figure 3.1, les onze zones de la fenêtre Word identifiées en section 3.1, avec leur emplacement approximatif. Puis rouvre les yeux et vérifie : combien en as-tu retrouvées sans erreur de localisation ? Recommence l'exercice le lendemain — la mémorisation spatiale de l'interface s'ancre après plusieurs répétitions espacées, pas en une seule fois.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Chercher "Imprimer" dans le Ruban</span>
Comme vu section 3.6, l'impression n'est pas une commande de mise en forme : elle vit dans le mode Backstage (Fichier > Imprimer), jamais dans un onglet du Ruban. Un réflexe "je cherche dans le Ruban" pour toute commande, sans distinguer contenu et fichier, ralentit inutilement la navigation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Ne pas reconnaître un onglet contextuel disparu</span>
Un utilisateur sélectionne une image, voit apparaître "Format de l'image", clique ailleurs par inadvertance, puis cherche cet onglet en vain en pensant l'avoir "perdu" ou "supprimé". Il suffit de resélectionner l'image pour le faire réapparaître (section 3.2) — aucune perte réelle ne s'est produite.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Confondre les deux onglets "Création"</span>
L'onglet permanent **Création** (thèmes, jeux de styles, filigrane) et le sous-onglet contextuel **Création** des Outils de tableau (bordures, trames de fond de cellules) portent le même nom mais n'apparaissent pas dans le même contexte ni ne proposent les mêmes commandes. Vérifie toujours si un tableau est sélectionné avant de conclure qu'une commande de tableau "n'existe pas".
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le Ruban reste réduit et gêne la navigation</span>

- **Diagnostic** : le mode "Ruban réduit" a été activé par mégarde (section 3.3), volontairement ou via un double-clic accidentel sur un onglet.
- **Résolution** : clique une fois sur n'importe quel onglet pour l'afficher temporairement, ou clique sur le chevron (^) en haut à droite pour désactiver durablement le mode réduit.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une commande personnalisée a disparu de la barre d'outils Accès rapide</span>

- **Diagnostic** : soit elle a été supprimée par erreur (menu déroulant BOAR), soit la personnalisation était liée à un document spécifique plutôt qu'à Word en général.
- **Résolution** : Fichier > Options > Barre d'outils Accès rapide affiche en bas un menu déroulant "Personnaliser : Pour tous les documents" vs "Pour [nom du document]" — vérifier lequel était sélectionné au moment de l'ajout.
</div>

## En entreprise

- **Bonne pratique répandue** : personnaliser la BOAR avec les 3 à 5 commandes réellement utilisées en continu dans son propre poste — au-delà, la barre devient elle-même encombrée et perd son intérêt de rapidité.
- **Bonne pratique répandue** : dans une formation interne à de nouveaux employés, présenter systématiquement la distinction Ruban/Backstage en premier (section 3.6) plutôt que de laisser chacun la découvrir seul par tâtonnement.
- **Erreur classique observée** : un employé change la langue d'affichage ou personnalise lourdement le Ruban sur un poste partagé (accueil, bibliothèque, salle informatique), gênant l'utilisateur suivant qui ne reconnaît plus l'interface standard.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — exporter et réimporter sa personnalisation du Ruban</span>
Fichier > Options > Personnaliser le ruban propose, en bas de la fenêtre, un bouton **"Importer/Exporter"** permettant de sauvegarder l'ensemble de tes personnalisations (Ruban et BOAR) dans un fichier `.exportedUI`, réimportable sur un autre poste ou après une réinstallation. Un gain de temps réel pour qui change souvent de machine ou configure plusieurs postes identiques (contexte ONG ou PME avec plusieurs employés partageant les mêmes besoins, chapitre 2).
</div>

## Résumé du chapitre

- La fenêtre de Word se décompose en zones stables : barre d'outils Accès rapide, Ruban (onglets + groupes + commandes), zone de document, barre d'état — cartographiées en Figure 3.1.
- Le Ruban organise les commandes par onglets thématiques (Accueil, Insertion, Références...) ; certains onglets sont **contextuels** et n'apparaissent qu'avec un objet sélectionné.
- Le Ruban peut être réduit (`Ctrl+F1`) et entièrement navigué au clavier via la touche `Alt` et ses touches d'accès.
- La barre d'outils Accès rapide, personnalisable via "Autres commandes...", reste identique quel que soit l'onglet actif — objectif MOS Expert 1.1.6.
- Le mode Backstage (onglet Fichier) gère le document comme fichier (enregistrer, imprimer, partager, options), distinct du Ruban qui gère son contenu.
- Un onglet masqué comme "Développeur" s'active via Fichier > Options > Personnaliser le ruban — objectif MOS Expert 1.1.7.
- La barre d'état affiche des informations en continu (nombre de mots, langue, zoom) et se personnalise elle-même par clic droit.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un onglet contextuel comme "Format de l'image" apparaît :
   - a) En permanence dans le Ruban
   - b) Uniquement quand l'objet concerné est sélectionné
   - c) Seulement après redémarrage de Word
   - d) Uniquement dans Word Online

2. La commande "Imprimer" se trouve :
   - a) Dans l'onglet Accueil du Ruban
   - b) Dans le mode Backstage (Fichier)
   - c) Dans la barre d'état
   - d) Dans la barre d'outils Accès rapide par défaut

3. Personnaliser la barre d'outils Accès rapide correspond à quel objectif de l'examen MOS ?
   - a) MO-100 1.2.3
   - b) MO-101 1.1.6
   - c) MO-101 4.2.1
   - d) Aucun objectif ne couvre cette action

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Le Ruban et le mode Backstage gèrent tous les deux le contenu du document de la même façon. — **Faux** (le Ruban agit sur le contenu, le Backstage sur le fichier lui-même).
2. La touche `Alt` seule affiche des touches d'accès permettant de naviguer le Ruban au clavier. — **Vrai**.
3. L'onglet Développeur est visible par défaut dans le Ruban. — **Faux** (il doit être activé via Fichier > Options > Personnaliser le ruban).
4. La barre d'outils Accès rapide change de contenu selon l'onglet actif du Ruban. — **Faux** (son contenu reste fixe, contrairement au Ruban).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique avec tes propres mots la différence entre ce que gère le Ruban et ce que gère le mode Backstage, avec un exemple concret pour chacun.
2. Un collègue te dit qu'il "a perdu" l'onglet "Outils de tableau" après avoir cliqué ailleurs dans son document. Que lui expliques-tu ?

**Corrigé 1** : le Ruban agit sur le **contenu** du document — par exemple, mettre un mot en gras (onglet Accueil) ou insérer une image (onglet Insertion). Le mode Backstage agit sur le **document comme fichier** — par exemple, l'enregistrer sous un autre format ou consulter ses propriétés (Fichier > Infos). Le premier modifie ce qui est écrit ; le second gère le fichier lui-même.

**Corrigé 2** : rien n'est perdu — "Outils de tableau" est un onglet contextuel qui n'apparaît que lorsque le point d'insertion se trouve à l'intérieur d'un tableau. Il suffit de cliquer de nouveau dans une cellule du tableau pour le voir réapparaître.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.1</span>

Ouvre Word, puis sans consulter ce chapitre, essaie de retrouver la commande "Nombre de mots" par trois méthodes différentes : (1) dans la barre d'état, (2) dans le Ruban (onglet Révision), (3) via la barre d'outils Accès rapide si tu as fait l'atelier 5. Note laquelle te semble la plus rapide selon le contexte.
</div>

**Corrigé :** (1) la barre d'état affiche en continu le nombre de mots, sans aucun clic — la plus rapide pour une simple consultation ; (2) l'onglet Révision, groupe Vérification, propose "Nombre de mots" avec une boîte de dialogue plus détaillée (caractères avec/sans espaces, paragraphes) ; (3) si ajoutée à la BOAR, un seul clic suffit depuis n'importe quel onglet — la plus rapide si l'information est consultée très fréquemment.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 3.2</span>

Active l'onglet Développeur (section 3.5), puis identifie au moins deux groupes de commandes qui y apparaissent. Explique en une phrase pourquoi cet onglet n'est pas affiché par défaut pour la majorité des utilisateurs.
</div>

**Corrigé :** l'onglet Développeur contient notamment les groupes "Code" (macros, Visual Basic) et "Contrôles" (cases à cocher, champs de formulaire). Il reste masqué par défaut car la majorité des utilisateurs de Word n'écrit jamais de macro ni ne conçoit de formulaire — l'afficher systématiquement encombrerait le Ruban pour un usage rare, d'où le choix de Microsoft d'en faire une option explicite plutôt qu'un réglage par défaut.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais nommer les onze zones de la fenêtre Word sans hésiter.</li>
<li>☐ Je comprends la différence entre un onglet permanent et un onglet contextuel.</li>
<li>☐ Je sais réduire/restaurer le Ruban et naviguer au clavier avec la touche Alt.</li>
<li>☐ J'ai personnalisé ma barre d'outils Accès rapide avec au moins une commande utile.</li>
<li>☐ Je sais expliquer la différence entre ce que gère le Ruban et ce que gère le mode Backstage.</li>
<li>☐ Je sais afficher l'onglet Développeur quand j'en ai besoin.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Ruban** = contenu du document, organisé en onglets > groupes > commandes.
- **Mode Backstage** (Fichier) = le document comme fichier (enregistrer, imprimer, partager, options).
- **Onglets contextuels** = apparaissent seulement avec l'objet concerné sélectionné.
- **BOAR** (barre d'outils Accès rapide) = contenu fixe, personnalisable via "Autres commandes..." — MOS Expert 1.1.6.
- **Onglet Développeur** = masqué par défaut, activable via Fichier > Options > Personnaliser le ruban — MOS Expert 1.1.7.

**Raccourcis clavier de ce chapitre** :
- `Ctrl+F1` : réduire/restaurer le Ruban.
- `Alt` (seul) : afficher les touches d'accès clavier du Ruban.
- `Échap` : annuler la navigation au clavier ou quitter le mode Backstage.
</div>

## FAQ

<dl class="faq">
<dt>Pourquoi mon Ruban n'a-t-il pas exactement les mêmes onglets que dans ce manuel ?</dt>
<dd>Certains onglets dépendent de la formule Microsoft 365 souscrite (l'onglet Dessin, par exemple, est plus visible sur les appareils tactiles) ou d'extensions/compléments installés par ton organisation. Les onglets décrits ici (Accueil, Insertion, Disposition, Références...) restent universels sur toute installation standard.</dd>

<dt>Puis-je avoir plusieurs barres d'outils Accès rapide différentes selon les documents ?</dt>
<dd>Oui, en partie : Fichier > Options > Barre d'outils Accès rapide permet de choisir si une personnalisation s'applique "Pour tous les documents" ou seulement "Pour [document actif]" — utile pour un modèle spécifique nécessitant des commandes particulières (chapitre 19).</dd>

<dt>Le mode Backstage existe-t-il aussi dans Word Online ?</dt>
<dd>Une version simplifiée existe (Fichier propose Infos, Enregistrer sous, Imprimer, Options...), mais certaines rubriques avancées de la version Desktop y sont absentes, cohérent avec les limites déjà signalées au chapitre 2 (section 2.6).</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle Microsoft sur le Ruban : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Liste complète des raccourcis clavier Word : consultée en détail au fil des chapitres, compilée à l'Annexe A.

*Chapitre suivant : personnalisation approfondie de l'interface et des options de Word — pour adapter durablement cet environnement à ta façon de travailler, au-delà des réglages ponctuels vus ici.*
