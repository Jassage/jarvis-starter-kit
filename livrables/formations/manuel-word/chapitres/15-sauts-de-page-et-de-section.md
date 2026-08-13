<div class="chapitre-titre-num">CHAPITRE 15</div>

# Sauts de page et sauts de section

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : distinguer un saut de page manuel d'un simple passage automatique à la page suivante ; insérer les quatre types de sauts de section (Page suivante, Continu, Page paire, Page impaire) selon le besoin réel ; appliquer une orientation, des marges ou un format de papier différents à une section précise d'un document ; contrôler si l'en-tête d'une section est lié ou indépendant de la section précédente ; et supprimer un saut de section sans casser accidentellement la mise en page qui l'entoure.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Insérer des sauts de page, de section et de colonne | MO-100 Word Associate — Insert and Format Text, Paragraphs, and Sections | 2.3.2 |
| Modifier les options de mise en page d'une section | MO-100 Word Associate — Insert and Format Text, Paragraphs, and Sections | 2.3.3 |

**Prérequis** : chapitre 13 (concept de section) et chapitre 14 (en-têtes et pieds de page, dont le comportement change fondamentalement dès qu'une section entre en jeu).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Il est temps de résoudre le problème resté en suspens depuis le chapitre 13 : un tableau de données trop large pour tenir lisiblement en orientation portrait doit apparaître sur une seule page en orientation paysage, entouré de pages en portrait avant et après lui, dans le même document. Tu as aussi remarqué, en testant les en-têtes du chapitre 14, qu'une modification apportée à l'en-tête d'une page semblait parfois se répercuter sur tout le document, et parfois non, sans comprendre pourquoi. Ce chapitre explique enfin ce mécanisme et te donne le contrôle total dessus.
</div>

## 15.1 Saut de page manuel contre saut de page automatique

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Word insère automatiquement un saut de page dès que le texte atteint le bas de la zone imprimable — c'est un saut de page <strong>automatique</strong>, invisible et qui se déplace tout seul si le contenu change en amont. Un saut de page <strong>manuel</strong> (`Ctrl+Entrée`) force un passage à la page suivante à un endroit précis choisi par l'auteur, indépendamment de la quantité de texte présente avant lui.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — l'erreur la plus fréquente de ce chapitre</span>
Appuyer plusieurs fois sur `Entrée` pour "pousser" du texte vers la page suivante, plutôt que d'insérer un vrai saut de page manuel, casse la mise en page dès que le contenu précédent change de longueur (une phrase ajoutée ou supprimée en amont) : le texte "poussé" à la main se retrouve alors au mauvais endroit, avec des lignes vides visibles en trop ou en moins. Un saut de page manuel (`Ctrl+Entrée`), lui, reste toujours ancré au même endroit du texte, quel que soit ce qui se passe avant.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment repérer un saut de page manuel dans un document existant</span>
Affiche les marques de mise en forme (`Ctrl+Maj+8`, chapitre 6) : un saut de page manuel apparaît comme une ligne pointillée horizontale portant la mention "Saut de page", nettement distincte d'un simple changement de page automatique qui, lui, ne laisse aucune marque visible.
</div>

## 15.2 Les quatre types de sauts de section

Contrairement au saut de page (qui ne fait que déplacer le texte suivant sur une nouvelle page, sans changer sa mise en page), un **saut de section** crée une frontière permettant à la zone qui suit d'avoir des réglages de page entièrement différents (chapitre 13).

| Type de saut de section | Effet |
|---|---|
| **Page suivante** | La nouvelle section démarre sur une toute nouvelle page — le type le plus courant |
| **Continu** | La nouvelle section démarre immédiatement après, sur la **même** page — utile pour changer le nombre de colonnes (chapitre 16) au milieu d'une page, sans saut de page visible |
| **Page paire** | La nouvelle section démarre sur la prochaine page paire, en sautant une page blanche si nécessaire |
| **Page impaire** | La nouvelle section démarre sur la prochaine page impaire — utilisé en édition classique pour qu'un nouveau chapitre commence toujours sur une page de droite |

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Université</span>
Un mémoire académique relié (chapitre 33) utilise souvent un saut de section "Page impaire" avant chaque nouveau chapitre, garantissant qu'un chapitre démarre toujours sur la page de droite d'un livre ouvert — une convention éditoriale qui peut laisser une page blanche volontaire à la fin du chapitre précédent.
</div>

## 15.3 Insérer un saut de section pour le tableau en paysage

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 37 — Isoler une page en orientation paysage au milieu d'un document portrait</span>

**Objectif** : résoudre exactement le problème du tableau large de la mise en situation d'ouverture, laissé en suspens depuis le chapitre 13.

**Préparation** : reprends le rapport mensuel avec le tableau volumineux (ou insère un tableau de test suffisamment large, chapitre 26, pour illustrer le besoin).

**Étapes détaillées** :
1. Place le point d'insertion juste **avant** le tableau (au début du paragraphe qui le précède).
2. Onglet **Disposition**, groupe Mise en page, clique sur **Sauts de page**, puis sous "Sauts de section", choisis **"Page suivante"**.
3. Place le point d'insertion juste **après** le tableau, et insère un second saut de section "Page suivante" de la même façon, pour délimiter la fin de cette section isolée.
4. Clique n'importe où **à l'intérieur** de la section contenant le tableau (entre les deux sauts insérés), puis Disposition > Orientation > **Paysage**.

**Résultat attendu** : seule la page contenant le tableau bascule en orientation Paysage ; les pages avant et après ce tableau restent en Portrait, sans qu'aucun réglage manuel supplémentaire n'ait été nécessaire sur elles.

**Dépannage** : si tout le document bascule en Paysage plutôt qu'une seule section, vérifie que le point d'insertion se trouvait bien à l'intérieur de la section isolée au moment du changement d'orientation, et non avant le premier saut de section.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.3.2 et 2.3.3 (MO-100 Associate)</span>
L'atelier 37 couvre les deux objectifs de ce chapitre en une seule manipulation : insérer les sauts de section (2.3.2) puis modifier les options de mise en page de la section ainsi créée (2.3.3). **Recommandation** : bien vérifier, après le changement d'orientation, que les sections avant et après n'ont pas été affectées par erreur — un contrôle rapide en mode d'affichage "Plusieurs pages" (chapitre 6).
</div>

<div class="encadre capture">
<span class="encadre-titre">📷 Capture à réaliser — Trois sections, orientations différentes</span>

- **Objectif** : montrer visuellement le résultat de l'atelier 37.
- **Contenu exact** : un aperçu "Plusieurs pages" (chapitre 6) montrant trois pages consécutives : la première et la troisième en Portrait, la deuxième (contenant le tableau) en Paysage, nettement plus large.
- **Zones à mettre en évidence** : encadrer la page centrale en Paysage pour la distinguer visuellement des deux autres.
- **Annotations/flèches** : légende "Chaque section conserve sa propre orientation, indépendamment des sections voisines."
- **Légende** : "Figure 15.1 — Trois sections, trois orientations, un seul document."
</div>

## 15.4 Lier ou délier les en-têtes entre sections

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le mécanisme qui a dérouté le scénario d'ouverture</span>
Par défaut, chaque nouvelle section créée <strong>hérite</strong> de l'en-tête et du pied de page de la section précédente, via une option nommée <strong>"Lier au précédent"</strong>, activée automatiquement. C'est pour cela qu'une modification d'en-tête semblait parfois se répercuter partout (les sections étaient liées) et parfois non (le lien avait été rompu, volontairement ou par une case décochée par inadvertance).
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 38 — Donner un en-tête propre à la section en paysage</span>

**Objectif** : afficher, sur la seule page en paysage, la mention "Tableau détaillé" en en-tête plutôt que l'en-tête habituel du rapport.

**Préparation** : reprends le document de l'atelier 37.

**Étapes détaillées** :
1. Double-clique dans l'en-tête de la page en Paysage pour activer son édition.
2. Dans l'onglet contextuel En-têtes et pieds de page (chapitre 14), repère le bouton **"Lier au précédent"** dans le groupe Navigation : s'il est activé (surligné), clique dessus pour le **désactiver**. Un message d'avertissement "Supprimer le lien à la section précédente" peut apparaître, à confirmer.
3. Une fois le lien rompu, l'en-tête de cette section devient totalement indépendant : efface son contenu hérité et tape "Tableau détaillé".
4. Vérifie que l'en-tête de la section suivante (après le tableau) est resté inchangé — s'il a été affecté par erreur, c'est que son propre lien "Lier au précédent" n'a pas été rompu à temps avant modification.

**Résultat attendu** : seule la section du tableau affiche "Tableau détaillé" en en-tête ; les sections avant et après conservent l'en-tête d'origine du rapport, sans aucune interférence entre elles.

**Dépannage** : si l'en-tête de la section précédente se modifie aussi alors que tu pensais avoir rompu le lien, vérifie que "Lier au précédent" a bien été désactivé **avant** toute modification du texte — rompre le lien après coup ne défait pas rétroactivement une modification déjà propagée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — l'ordre des opérations compte</span>
Toujours désactiver "Lier au précédent" <strong>avant</strong> de modifier le contenu d'un en-tête de section, jamais après. Modifier d'abord, puis rompre le lien ensuite, ne "sépare" pas la modification déjà propagée aux autres sections liées — un piège fréquent chez les utilisateurs découvrant cette fonctionnalité pour la première fois.
</div>

## 15.5 Supprimer un saut de section sans casser la mise en page

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Retirer proprement un saut de section</span>

1. Affiche les marques de mise en forme (`Ctrl+Maj+8`, chapitre 6) : un saut de section apparaît comme une double ligne pointillée portant la mention du type de saut ("Saut de section (Page suivante)").
2. Place le point d'insertion juste avant cette marque, puis appuie sur **`Suppr`** (Delete) pour la retirer.
3. Attention au résultat : supprimer un saut de section fusionne les deux sections qu'il séparait, et la mise en page de la section qui **suivait** le saut adopte généralement celle qui **précédait** — vérifie donc immédiatement l'orientation, les marges et les en-têtes après cette suppression.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — supprimer un saut de section a un effet en cascade</span>
Contrairement à un simple saut de page (dont la suppression ne fait que rapprocher deux blocs de texte), supprimer un saut de section peut modifier silencieusement l'orientation, les marges ou l'en-tête de tout un bloc de pages qui suivait ce saut — toujours vérifier visuellement le résultat en mode "Plusieurs pages" après une telle suppression, plutôt que de supposer qu'aucun autre changement ne s'est produit.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire un document à quatre sections distinctes</span>
Construis un document de test avec quatre sections consécutives : (1) une page de garde en Portrait sans en-tête, (2) une introduction en Portrait avec en-tête "Introduction", (3) une page de tableau en Paysage avec en-tête "Annexe chiffrée", (4) une conclusion en Portrait reprenant l'en-tête "Introduction" de la section 2 (donc liée à une section qui n'est pas immédiatement précédente — réfléchis à la méthode pour y parvenir sans retaper le texte). Documente chaque étape et chaque type de saut utilisé.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre saut de page et saut de section</span>
Insérer un simple saut de page (`Ctrl+Entrée`) en espérant pouvoir changer l'orientation ou les marges de la page suivante ne fonctionne jamais : seul un vrai saut de **section** permet des réglages de page différents, un saut de page se contentant de déplacer le texte sur une nouvelle page avec la mise en page identique à la section en cours.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier un en-tête avant de rompre le lien "Lier au précédent"</span>
Comme détaillé en section 15.4, cette erreur d'ordre propage une modification à des sections qui n'étaient pourtant pas censées être affectées, un problème qui ne se corrige pas simplement en rompant le lien après coup.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Supprimer un saut de section sans vérifier l'effet en cascade</span>
Comme signalé en section 15.5, la suppression d'un saut de section peut modifier silencieusement l'orientation ou les marges d'un bloc entier de pages — un problème découvert souvent bien après la suppression, lors d'une relecture ou d'une impression, plutôt qu'immédiatement.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le changement d'orientation affecte tout le document au lieu d'une seule section</span>

- **Diagnostic** : le point d'insertion se trouvait probablement avant le premier saut de section au moment du changement, ou aucun saut de section n'a été correctement inséré avant l'application du changement d'orientation.
- **Résolution** : vérifier via les marques de mise en forme que les sauts de section existent bien aux deux emplacements prévus, puis recliquer précisément à l'intérieur de la section concernée avant de réappliquer le changement.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une page blanche inattendue apparaît entre deux sections</span>

- **Diagnostic** : un saut de section "Page paire" ou "Page impaire" (section 15.2) a été utilisé, insérant volontairement une page vierge si nécessaire pour respecter la parité demandée — un comportement voulu, pas un bug.
- **Résolution** : si cette page blanche n'est pas souhaitée, remplacer ce saut par un simple saut "Page suivante", qui ne force aucune parité particulière.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours vérifier, avant l'impression finale d'un document professionnel comportant plusieurs sections, l'ensemble des orientations et en-têtes en mode d'affichage "Plusieurs pages" plutôt que de faire confiance à un seul défilement rapide.
- **Bonne pratique répandue** : documenter dans un modèle d'entreprise (chapitre 19) les sections types couramment utilisées (page de garde, corps, annexes en paysage), pour éviter de reconstruire cette architecture à chaque nouveau rapport.
- **Erreur classique observée** : un document professionnel envoyé à un client avec une orientation ou un en-tête incohérent sur une seule page, résultat d'une modification tardive ayant cassé silencieusement une section sans que cela soit remarqué avant l'envoi.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — copier une section entière avec sa mise en page</span>
Sélectionner du texte incluant la marque de saut de section qui le précède (ou le suit) et le copier-coller dans un autre document transfère aussi les réglages de mise en page propres à cette section — un raccourci utile pour réutiliser une architecture de sections déjà construite dans un document, plutôt que de la recréer intégralement dans un nouveau fichier.
</div>

## Résumé du chapitre

- Un saut de page manuel (`Ctrl+Entrée`) force un passage de page à un endroit précis, contrairement au saut de page automatique invisible qui se déplace tout seul selon le contenu.
- Quatre types de sauts de section existent : Page suivante, Continu, Page paire, Page impaire — chacun avec un usage précis, objectif MOS 2.3.2.
- Un saut de section, contrairement à un saut de page, permet une mise en page (orientation, marges, format) entièrement différente pour la zone qui suit — objectif MOS 2.3.3.
- "Lier au précédent" détermine si l'en-tête d'une nouvelle section hérite de celui de la section précédente ; toujours rompre ce lien **avant** toute modification, jamais après.
- Supprimer un saut de section peut modifier silencieusement la mise en page d'un bloc entier de pages — toujours vérifier le résultat après suppression.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour donner à une page une orientation différente du reste du document, il faut :
   - a) Un simple saut de page (`Ctrl+Entrée`)
   - b) Un saut de section
   - c) Plusieurs appuis sur `Entrée`
   - d) Changer le format de papier de tout le document

2. "Lier au précédent" désactivé signifie que l'en-tête de la section :
   - a) Est identique à celui de la section précédente
   - b) Devient indépendant de la section précédente
   - c) Disparaît complètement
   - d) Se transforme en pied de page

3. Un saut de section "Page impaire" garantit que la nouvelle section démarre :
   - a) Sur la même page
   - b) Sur la prochaine page impaire, quitte à insérer une page blanche
   - c) Toujours sur la page 1
   - d) Uniquement à l'impression, jamais à l'écran

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un saut de page manuel permet de changer l'orientation de la page suivante. — **Faux** (seul un saut de section le permet).
2. Par défaut, une nouvelle section hérite de l'en-tête de la section précédente. — **Vrai** ("Lier au précédent" activé par défaut).
3. Supprimer un saut de section n'a aucun effet sur la mise en page environnante. — **Faux** (effet en cascade possible sur l'orientation, les marges, les en-têtes).
4. Un saut de section "Continu" démarre toujours sur une nouvelle page. — **Faux** (il démarre sur la même page, contrairement à "Page suivante").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un simple saut de page ne suffit jamais à changer l'orientation d'une seule page dans un document.
2. Un collègue modifie l'en-tête d'une section, puis remarque que trois autres sections ont aussi changé sans qu'il l'ait voulu. Explique-lui ce qui s'est probablement passé et comment l'éviter à l'avenir.

**Corrigé 1** : un saut de page ne fait que déplacer le texte suivant sur une nouvelle page, sans créer de frontière de mise en page — l'orientation, les marges et le format de papier restent des propriétés de **section**, pas de page individuelle. Sans saut de section, toutes les pages appartiennent à la même section et partagent donc nécessairement la même orientation.

**Corrigé 2** : les sections concernées étaient probablement toutes liées entre elles via "Lier au précédent" (activé par défaut) — modifier l'en-tête de l'une propage donc automatiquement le changement à toutes les sections qui lui sont liées en aval. Pour éviter cela à l'avenir, désactiver explicitement "Lier au précédent" sur la section à modifier **avant** de taper le moindre changement, jamais après.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Crée un document de trois pages avec un saut de section "Page suivante" entre la première et la deuxième page. Change l'orientation de la deuxième page en Paysage et vérifie que les pages 1 et 3 restent en Portrait.
</div>

**Corrigé :** réussi si seule la page 2 s'affiche en Paysage, les pages 1 et 3 conservant leur orientation Portrait d'origine, confirmant l'indépendance de la section créée.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.2</span>

Sur ce même document, rends l'en-tête de la section 2 indépendant de la section 1 (rompt "Lier au précédent" avant toute modification), puis tape un texte d'en-tête différent sur cette seule section. Vérifie que les en-têtes des sections 1 et 3 restent inchangés.
</div>

**Corrigé :** réponse personnelle ; réussi si l'en-tête de la section 2 diffère bien de celui des sections 1 et 3, sans qu'aucune des deux autres n'ait été affectée par la modification.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je distingue un saut de page manuel d'un saut de page automatique.</li>
<li>☐ Je connais les quatre types de sauts de section et leur usage respectif.</li>
<li>☐ Je sais isoler une section pour lui appliquer une orientation ou des marges différentes.</li>
<li>☐ Je sais désactiver "Lier au précédent" avant de modifier un en-tête de section.</li>
<li>☐ Je vérifie systématiquement l'effet en cascade avant et après la suppression d'un saut de section.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Saut de page manuel** (`Ctrl+Entrée`) = position fixe ; **saut automatique** = invisible, se déplace tout seul.
- **Saut de section** (pas un saut de page) = seul moyen de changer orientation/marges/format pour une zone précise — MOS 2.3.2/2.3.3.
- **Quatre types** : Page suivante, Continu, Page paire, Page impaire.
- **"Lier au précédent"** = toujours le désactiver AVANT de modifier un en-tête, jamais après.
- **Suppression d'un saut de section** = vérifier systématiquement l'effet en cascade sur la mise en page.

**Raccourci clavier de ce chapitre** :
- `Ctrl+Entrée` : saut de page manuel.
</div>

## FAQ

<dl class="faq">
<dt>Combien de sections un document peut-il contenir au maximum ?</dt>
<dd>Il n'existe pas de limite pratique significative ; un document complexe (mémoire, rapport annuel) peut légitimement contenir des dizaines de sections sans problème de performance.</dd>

<dt>Un saut de section affecte-t-il la numérotation des pages (chapitre 14) ?</dt>
<dd>Pas automatiquement : la numérotation continue par défaut à travers les sections, sauf si elle est explicitement reconfigurée via Format des numéros de page > "À partir de", section propre à chaque section si les en-têtes ne sont pas liés.</dd>

<dt>Puis-je voir immédiatement tous les sauts de section d'un long document sans les chercher un par un ?</dt>
<dd>Oui, le mode Plan (chapitre 33) ou une recherche via `Ctrl+H` (Rechercher-remplacer, chapitre 7) avec l'option "Plus > Spécial > Saut de section" permet de les localiser tous rapidement, plutôt que de faire défiler manuellement tout le document.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les sauts de section : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Application des sections aux colonnes de texte : chapitre 16.

*Chapitre suivant : colonnes et mises en page avancées — pour appliquer directement la maîtrise des sections acquise ici à un nouveau cas d'usage concret, les colonnes de type journal.*
