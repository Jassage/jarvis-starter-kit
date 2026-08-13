<div class="chapitre-titre-num">CHAPITRE 14</div>

# En-têtes, pieds de page et numérotation

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : insérer et modifier un en-tête et un pied de page depuis la galerie de modèles prédéfinis ; ajouter une numérotation de page dans différents styles et positions ; configurer une première page différente du reste du document (utile pour une page de garde sans numéro) ; distinguer les pages paires des pages impaires quand la reliure l'exige ; insérer des champs dynamiques (date automatique, nom de fichier, "Page X sur Y") qui se mettent à jour tout seuls ; et fermer proprement le mode d'édition d'en-tête pour revenir au corps du document.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Insérer et modifier des en-têtes et pieds de page | MO-100 Word Associate — Manage Documents | 1.2.3 |

**Prérequis** : chapitre 13 (concept de section, indispensable pour comprendre "Première page différente" et "Pages paires/impaires différentes" de ce chapitre).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport mensuel est presque prêt pour l'impression. Ta responsable demande : le nom de l'ONG et la date du rapport en haut de chaque page, le numéro de page en bas, mais surtout **pas** de numéro sur la toute première page (la page de garde) — "ça ne se fait jamais de numéroter la couverture", précise-t-elle. Ce chapitre répond précisément à cette demande très courante en milieu professionnel, qui déroute souvent les débutants découvrant pour la première fois le lien entre en-têtes et sections.
</div>

## 14.1 Anatomie d'un en-tête et d'un pied de page

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
L'<strong>en-tête</strong> et le <strong>pied de page</strong> sont des zones distinctes du corps principal du document, situées respectivement en haut et en bas de chaque page, et répétées automatiquement sur toutes les pages concernées sans devoir être retapées. Contrairement au corps du texte, leur contenu se met à jour ou reste identique selon des règles propres à ces zones — un principe différent du texte courant.
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Zone d'en-tête activée</span>

- **Objectif** : montrer la transition visuelle entre le corps du document et la zone d'en-tête activée.
- **Contenu exact** : une page de document avec le corps de texte grisé (estompé) et la zone d'en-tête en haut, active, curseur clignotant à l'intérieur, avec l'onglet contextuel "En-têtes et pieds de page" visible dans le Ruban.
- **Zones à mettre en évidence** : encadrer la ligne pointillée séparant l'en-tête du corps de texte grisé.
- **Annotations/flèches** : légende "Le corps du texte devient inactif (grisé) tant que l'en-tête est en cours d'édition."
- **Légende** : "Figure 14.1 — Mode d'édition de l'en-tête, corps de texte temporairement inactif."
</div>

## 14.2 Insérer un en-tête et un pied de page prédéfinis

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 34 — Ajouter un en-tête avec le nom de l'organisation et la date</span>

**Objectif** : répondre à la première partie de la demande de la mise en situation.

**Préparation** : reprends le rapport mensuel.

**Étapes détaillées** :
1. Onglet **Insertion**, groupe En-tête et pied de page, clique sur **En-tête**.
2. La galerie propose plusieurs modèles prédéfinis (Vide, Ligne latérale, Sémaphore...) : clique sur **"Vide"** pour un contrôle total du contenu.
3. Le document bascule automatiquement en mode d'édition d'en-tête (Figure 14.1) : tape "ONG Exemple International".
4. Onglet contextuel **En-têtes et pieds de page** (apparu automatiquement, rappel du chapitre 3 sur les onglets contextuels), clique sur **Date et heure** dans le groupe Insertion : choisis un format de date, coche **"Mettre à jour automatiquement"** pour que la date reflète toujours le jour d'ouverture du document plutôt qu'une date figée.
5. Double-clique n'importe où dans le corps du texte pour **quitter** le mode d'édition d'en-tête et revenir à l'édition normale.

**Résultat attendu** : chaque page affiche désormais automatiquement le nom de l'organisation et la date du jour en en-tête, sans avoir eu à les retaper page par page.

**Dépannage** : si le texte tapé dans l'en-tête d'une page n'apparaît pas sur les autres pages du document, vérifie qu'aucun saut de section (chapitre 15) ne sépare ces pages en zones d'en-tête indépendantes.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Un **double-clic** directement dans la zone d'en-tête ou de pied de page (même en mode d'édition normale du corps de texte) active immédiatement son édition — pas besoin de systématiquement repasser par l'onglet Insertion.
</div>

## 14.3 Insérer la numérotation de page

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 35 — Ajouter un numéro de page en pied de page</span>

**Objectif** : compléter la mise en situation avec un numéro de page en bas de chaque page.

**Préparation** : reprends le document de l'atelier 34.

**Étapes détaillées** :
1. Onglet **Insertion**, groupe En-tête et pied de page, clique sur **Numéro de page**.
2. Choisis la position souhaitée : **"Bas de page"** pour ce cas, puis un style dans la galerie (numéro simple centré, ou avec un habillage comme "Numéro brut 2" aligné à droite).
3. Le numéro s'insère automatiquement sur chaque page, s'incrémentant tout seul — jamais besoin de le taper manuellement page par page.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — "Page X sur Y"</span>
Insertion > Numéro de page > **"Bas de page"** propose aussi un format **"Page X sur Y"**, affichant par exemple "Page 3 sur 12" — deux champs dynamiques distincts (le numéro de la page actuelle et le nombre total de pages), tous deux mis à jour automatiquement si le document s'allonge ou se raccourcit. Ce format est très apprécié dans un rapport professionnel car il donne au lecteur une indication immédiate de la longueur restante.
</div>

## 14.4 Première page différente : la page de garde sans numéro

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 36 — Retirer le numéro de la page de garde uniquement</span>

**Objectif** : résoudre exactement la troisième demande de la mise en situation d'ouverture, sans créer de section supplémentaire.

**Préparation** : reprends le document des ateliers 34 et 35, muni désormais d'un en-tête et d'un numéro de page.

**Étapes détaillées** :
1. Double-clique dans l'en-tête ou le pied de page pour activer le mode d'édition.
2. Dans l'onglet contextuel En-têtes et pieds de page, groupe Options, coche **"Première page différente"**.
3. La première page affiche désormais un en-tête et un pied de page **vides**, totalement indépendants de ceux du reste du document — tape-y uniquement ce qui est pertinent pour une page de garde (rien, dans ce cas précis), tandis que les pages suivantes conservent leur en-tête et leur numérotation normale.

**Résultat attendu** : la page de garde n'affiche ni en-tête ni numéro de page, tandis que toutes les pages suivantes conservent le nom de l'organisation, la date et une numérotation cohérente (qui, par défaut, compte la page de garde comme "page 1" mais sans l'afficher — un point souvent source de confusion, détaillé au dépannage ci-dessous).

**Dépannage** : si la deuxième page affiche "Page 2" alors que la responsable attend "Page 1" pour la première page réellement numérotée, voir la section 14.6 sur le réglage de la valeur de départ de la numérotation.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.2.3 Insert and modify headers and footers (MO-100 Associate)</span>
Les ateliers 34, 35 et 36 couvrent ensemble cet objectif dans sa quasi-intégralité. **Piège fréquent en examen** : oublier que "Première page différente" est une case à cocher du groupe Options, facilement manquée si l'on ne connaît pas son emplacement précis dans l'onglet contextuel.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
"Première page différente" ne nécessite <strong>aucune</strong> section supplémentaire (contrairement à ce qu'on pourrait supposer après le chapitre 13) : c'est une option indépendante, disponible même sur un document à une seule section. Les besoins plus complexes (en-têtes différents à partir de la page 5, par exemple) nécessitent en revanche un vrai saut de section, développé au chapitre 15.
</div>

## 14.5 Pages paires et impaires différentes

Pour un document destiné à une reliure (chapitre 13, marges symétriques), il est courant d'afficher un contenu différent sur les pages paires (verso) et impaires (recto) — par exemple, le titre du document sur les pages impaires et le titre du chapitre en cours sur les pages paires, comme dans de nombreux livres imprimés.

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Activer des en-têtes distincts pour pages paires/impaires</span>

1. Mode d'édition d'en-tête activé, onglet contextuel En-têtes et pieds de page, groupe Options, coche **"Pages paires et impaires différentes"**.
2. Word affiche désormais deux zones d'en-tête distinctes selon la parité de la page : navigue entre elles simplement en faisant défiler le document, chaque page affichant la zone qui lui correspond.
3. Remplis chaque zone séparément selon le contenu souhaité.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Université</span>
Un mémoire académique relié (Partie 13, projet 2) utilise fréquemment cette fonctionnalité : le titre du mémoire en en-tête des pages impaires, le titre du chapitre en cours en en-tête des pages paires — une convention éditoriale classique des ouvrages imprimés reliés.
</div>

## 14.6 Personnaliser le format et la valeur de départ de la numérotation

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Régler le format des numéros et leur valeur de départ</span>

1. Onglet Insertion > Numéro de page > **"Format des numéros de page..."**.
2. Le menu déroulant "Format de nombre" permet de choisir des chiffres romains (i, ii, iii — souvent utilisés pour les pages préliminaires d'un mémoire, chapitre 33) ou des lettres plutôt que des chiffres arabes.
3. Sous "Numérotation des pages", choisis **"À partir de"** et saisis une valeur (par exemple `1`, pour que la première page réellement numérotée du corps du rapport affiche bien "1", même si la page de garde qui la précède ne compte pas visuellement).
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reproduire la mise en page d'un livre relié</span>
En combinant "Première page différente" (section 14.4) et "Pages paires et impaires différentes" (section 14.5), construis un document de test d'au moins quatre pages reproduisant la structure d'un petit livre relié : page de garde sans en-tête ni numéro, puis en-têtes alternés (titre du document à droite sur les pages impaires, "Chapitre en cours" à gauche sur les pages paires), avec une numérotation qui démarre à 1 sur la première page de contenu réel.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Taper manuellement un numéro de page au lieu d'insérer un champ dynamique</span>
Taper "1", "2", "3" au clavier dans le pied de page de chaque page casse immédiatement dès qu'une page est ajoutée ou supprimée ailleurs dans le document — exactement le même problème que la numérotation manuelle de liste vue au chapitre 11, appliqué ici aux pages.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier l'en-tête d'une seule page en pensant que cela n'affecte qu'elle</span>
Sans section dédiée (chapitre 15) ni case "Première/Pages paires-impaires différentes" cochée à bon escient, modifier l'en-tête affiché sur une page modifie en réalité l'en-tête de **toutes** les pages de la même section — un comportement qui surprend les débutants habitués à penser "page par page" plutôt qu'en zones logiques.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier de désactiver "Mettre à jour automatiquement" sur une date qui doit rester figée</span>
Une date d'en-tête insérée avec mise à jour automatique (section 14.2) affiche toujours la date d'**ouverture** du document, pas sa date de rédaction ou d'envoi d'origine — un problème pour un document dont la date doit rester fixe une fois finalisé (un contrat daté, par exemple), où une date insérée sans l'option de mise à jour automatique est préférable.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la numérotation de page commence à un chiffre inattendu</span>

- **Diagnostic** : soit "Première page différente" compte tout de même la page de garde comme "page 1" en arrière-plan (sans l'afficher), décalant ainsi la numérotation visible des pages suivantes ; soit une valeur de départ personnalisée a été oubliée d'un document précédent copié.
- **Résolution** : vérifier et régler explicitement "À partir de" dans Format des numéros de page (section 14.6) plutôt que de supposer le comportement par défaut.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : impossible de modifier le texte du corps du document alors qu'aucun en-tête ne semble actif</span>

- **Diagnostic** : le mode d'édition d'en-tête ou de pied de page est probablement resté actif par inadvertance (le corps du texte apparaît grisé, Figure 14.1) sans que l'utilisateur ne l'ait remarqué.
- **Résolution** : double-cliquer n'importe où dans le corps du texte, ou cliquer sur "Fermer l'en-tête et le pied de page" dans l'onglet contextuel, pour revenir à l'édition normale.
</div>

## En entreprise

- **Bonne pratique répandue** : intégrer l'en-tête et le pied de page standards de l'organisation (logo, nom, numérotation) directement dans un modèle (chapitre 19), pour une cohérence automatique sur tout document produit.
- **Bonne pratique répandue** : toujours utiliser des champs dynamiques (date automatique, numéro de page, "Page X sur Y") plutôt que du texte tapé manuellement, pour éviter toute incohérence après modification du document.
- **Erreur classique observée** : des rapports professionnels où la page de garde affiche malencontreusement "Page 1" en bas, un détail perçu comme peu soigné dans un contexte professionnel formel.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — insérer le nom du fichier et son chemin dans le pied de page</span>
Onglet En-têtes et pieds de page (contextuel) > groupe Insertion > **Quick Part > Champ...**, puis choisir le champ **FileName** (avec l'option "Ajouter le chemin d'accès au nom de fichier") insère automatiquement le nom complet et l'emplacement du document dans le pied de page — une pratique répandue dans les organisations qui impriment de nombreux documents et veulent pouvoir retrouver instantanément la source numérique d'une copie papier.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — synthèse de ce chapitre pour l'examen</span>
Ce chapitre couvre entièrement l'objectif **1.2.3 Insert and modify headers and footers**. **Recommandation** : s'entraîner spécifiquement à "Première page différente", une case à cocher facilement oubliée en situation d'examen chronométré car nichée dans le groupe Options de l'onglet contextuel plutôt que dans un menu principal évident.
</div>

## Résumé du chapitre

- En-têtes et pieds de page sont des zones répétées automatiquement sur chaque page, distinctes et indépendantes du corps du texte.
- La numérotation de page s'insère toujours comme un champ dynamique, jamais tapée manuellement, pour rester cohérente si le document change de longueur.
- "Première page différente" retire l'en-tête/pied de page uniquement sur la première page, sans nécessiter de saut de section — objectif MOS 1.2.3.
- "Pages paires et impaires différentes" permet une alternance de contenu adaptée à un document relié.
- Le format des numéros (chiffres romains, lettres) et leur valeur de départ se règlent indépendamment via "Format des numéros de page".
- Un double-clic dans le corps du texte referme proprement le mode d'édition d'en-tête/pied de page.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour retirer le numéro de page uniquement sur la première page d'un document, sans créer de section :
   - a) Insérer un saut de section avant la deuxième page
   - b) Cocher "Première page différente"
   - c) Supprimer manuellement le numéro sur cette page
   - d) Passer en mode Brouillon

2. Un numéro de page inséré via Insertion > Numéro de page est :
   - a) Un texte tapé manuellement
   - b) Un champ dynamique qui se met à jour automatiquement
   - c) Une image
   - d) Un lien hypertexte

3. Pour revenir à l'édition normale du corps du texte après avoir modifié l'en-tête :
   - a) Fermer complètement le document
   - b) Double-cliquer dans le corps du texte
   - c) Appuyer sur `Ctrl+Z`
   - d) Changer de mode d'affichage

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. "Première page différente" nécessite obligatoirement un saut de section. — **Faux**, c'est une option indépendante.
2. Un champ de date avec "Mettre à jour automatiquement" affiche toujours la date d'ouverture du document. — **Vrai**.
3. Modifier l'en-tête d'une page modifie automatiquement l'en-tête de toutes les pages de la même section. — **Vrai**.
4. Le format des numéros de page ne peut être que des chiffres arabes (1, 2, 3). — **Faux** (chiffres romains et lettres sont aussi disponibles).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi taper manuellement un numéro de page dans chaque pied de page est une mauvaise pratique, avec un exemple concret de problème que cela provoque.
2. Un collègue veut que sa page de garde n'affiche ni en-tête ni numéro, mais que la deuxième page affiche bien "Page 1". Décris la combinaison exacte de réglages à appliquer.

**Corrigé 1** : un numéro tapé manuellement ne s'ajuste jamais automatiquement si des pages sont ajoutées ou supprimées ailleurs dans le document — par exemple, ajouter un paragraphe qui repousse tout le contenu d'une page laisserait tous les numéros suivants incorrects, jusqu'à ce qu'ils soient tous corrigés manuellement un par un, une tâche fastidieuse et sujette à erreur.

**Corrigé 2** : cocher "Première page différente" (section 14.4) pour vider l'en-tête et le pied de page de la page de garde, puis régler dans Format des numéros de page (section 14.6) la numérotation "À partir de 1" pour que la deuxième page, première page visuellement numérotée, affiche bien "1" plutôt que "2".

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.1</span>

Sur un document de test d'au moins trois pages, insère un en-tête avec le titre du document, un pied de page avec "Page X sur Y", puis active "Première page différente" pour que la page de garde reste totalement vierge en en-tête comme en pied de page.
</div>

**Corrigé :** réussi si la page de garde n'affiche ni en-tête ni pied de page, tandis que les pages suivantes affichent bien le titre en en-tête et "Page X sur Y" en pied de page, avec X et Y qui s'ajustent automatiquement si des pages sont ajoutées.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 14.2</span>

Règle la numérotation de ce même document pour qu'elle démarre à 1 sur la première page de contenu réel (après la page de garde), puis vérifie le résultat en mode d'affichage "Plusieurs pages" (chapitre 6).
</div>

**Corrigé :** réponse personnelle ; réussi si la deuxième page du document (première page de contenu après la page de garde) affiche bien "1" comme numéro visible.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'insère un en-tête et un pied de page depuis la galerie prédéfinie.</li>
<li>☐ J'insère une numérotation de page comme champ dynamique, jamais manuellement.</li>
<li>☐ Je configure "Première page différente" pour une page de garde sans en-tête ni numéro.</li>
<li>☐ Je configure des en-têtes distincts pour pages paires et impaires quand nécessaire.</li>
<li>☐ Je règle le format et la valeur de départ de la numérotation.</li>
<li>☐ Je sais fermer proprement le mode d'édition d'en-tête pour revenir au corps du texte.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **En-tête/pied de page** = zones répétées automatiquement, indépendantes du corps du texte — MOS 1.2.3.
- **Numéro de page** = toujours un champ dynamique, jamais tapé manuellement.
- **"Première page différente"** = pas besoin de section, juste une case à cocher (groupe Options).
- **"Pages paires et impaires différentes"** = pour un document relié avec alternance de contenu.
- **Format des numéros de page** = format (chiffres/lettres/romains) et valeur de départ, réglages indépendants.

Aucun raccourci clavier dédié : tous les réglages passent par l'onglet Insertion ou l'onglet contextuel En-têtes et pieds de page.
</div>

## FAQ

<dl class="faq">
<dt>Puis-je avoir un logo dans l'en-tête plutôt que du texte ?</dt>
<dd>Oui, une image insérée en mode d'édition d'en-tête (Insertion > Images, chapitre 21) se comporte comme tout autre élément d'en-tête, répétée automatiquement sur chaque page concernée.</dd>

<dt>La numérotation de page fonctionne-t-elle différemment dans Word Online ?</dt>
<dd>Non, le principe reste identique ; seule l'interface d'accès peut différer légèrement, cohérent avec les limites déjà signalées au chapitre 2 sur les fonctionnalités avancées.</dd>

<dt>Puis-je avoir des en-têtes complètement différents à partir d'un chapitre précis, pas seulement la première page ?</dt>
<dd>Oui, mais cela nécessite un vrai saut de section (chapitre 15) plutôt que les options simples de ce chapitre, qui ne gèrent que la première page ou l'alternance paire/impaire.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les en-têtes et pieds de page : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Mécanique complète des sections pour des en-têtes distincts au-delà de la première page : chapitre 15.

*Chapitre suivant : sauts de page et sauts de section — pour maîtriser pleinement la notion de section introduite au chapitre 13 et déjà entrevue dans ce chapitre.*
