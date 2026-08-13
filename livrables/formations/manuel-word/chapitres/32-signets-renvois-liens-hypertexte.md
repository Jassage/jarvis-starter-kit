<div class="chapitre-titre-num">CHAPITRE 32</div>

# Signets, renvois et liens hypertexte

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : créer un signet pour marquer un emplacement précis d'un document et y naviguer instantanément ; insérer un renvoi qui référence automatiquement un titre, une figure ou un tableau, avec mise à jour si sa position ou sa numérotation change ; insérer un lien hypertexte vers un autre emplacement du même document ; insérer un lien hypertexte vers une adresse web ou un e-mail externe ; et lier un document à un contenu externe (fichier ou objet) qui se met à jour si la source change.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Créer des liens vers des emplacements dans les documents | MO-100 Word Associate — Manage Documents | 1.1.2 |
| Créer des liens vers du contenu de document externe | MO-101 Word Expert — Manage Document Options and Settings | 1.1.4 |

**Prérequis** : chapitre 28 (table des matières) et chapitre 31 (légendes), dont les renvois de ce chapitre reprennent directement les mécanismes.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le mémoire universitaire, désormais riche de titres, figures et tableaux légendés (chapitres 28 et 31), doit permettre au lecteur de naviguer d'une section à l'autre sans recourir uniquement à la table des matières — par exemple, un renvoi dans le texte du type "voir Figure 3, page 12" qui reste juste même si cette figure change de page après une révision. Le mémoire doit aussi inclure un lien vers le site web de l'ONG partenaire de l'étude de cas, et une référence vers les statistiques officielles d'un fichier Excel externe partagé par l'équipe. Ce chapitre couvre chacun de ces besoins.
</div>

## 32.1 Créer et utiliser un signet

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un <strong>signet</strong> est un marqueur invisible posé à un emplacement précis d'un document, nommé par l'utilisateur, permettant d'y naviguer ou d'y faire référence ultérieurement (un renvoi, section 32.2, ou un lien hypertexte, section 32.3) — un peu comme une ancre invisible plantée dans le texte.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 95 — Créer un signet sur une section clé du mémoire</span>

**Objectif** : marquer un emplacement qui sera référencé plus loin dans ce chapitre.

**Préparation** : ouvre le document du mémoire de test.

**Étapes détaillées** :
1. Sélectionne le texte à marquer (par exemple, le titre d'une section méthodologique), onglet **Insertion**, groupe Liens, clique sur **Signet**.
2. Tape un nom sans espace (par exemple "Methodologie", les espaces n'étant pas autorisés dans un nom de signet), clique sur **Ajouter**.
3. Pour naviguer directement vers ce signet plus tard, `Ctrl+B` (Atteindre, chapitre 6), choisis "Signet" dans la liste de gauche, sélectionne son nom, clique sur **Atteindre**.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Par défaut, les signets restent invisibles à l'écran. Fichier > Options > Options avancées > **"Afficher les signets"** les rend visibles sous forme de crochets gris `[ ]` — utile pendant la phase de construction d'un document complexe, à désactiver avant la diffusion finale puisque ces crochets ne s'impriment jamais mais peuvent distraire à l'écran.
</div>

## 32.2 Insérer un renvoi

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 96 — Créer le renvoi vers la Figure 3</span>

**Objectif** : répondre à la première demande de la mise en situation, avec un renvoi qui reste toujours exact.

**Préparation** : reprends le document contenant les figures légendées du chapitre 31.

**Étapes détaillées** :
1. Place le point d'insertion dans le texte, à l'endroit où le renvoi doit apparaître ("voir ").
2. Onglet Insertion (ou onglet Références, selon la version), groupe Liens, clique sur **Renvoi**.
3. Sous **"Catégorie"**, choisis "Figure" (les mêmes étiquettes de légende que celles créées au chapitre 31).
4. Sous **"Renvoi à"**, choisis **"Étiquette et numéro"** (pour obtenir "Figure 3") — ou une autre option comme "Texte de légende entier" ou "Numéro de page".
5. Sélectionne la figure exacte visée dans la liste, coche **"Insérer comme lien hypertexte"** pour qu'un `Ctrl+clic` sur le renvoi navigue directement vers cette figure, puis clique sur **Insérer**.
6. Répète l'opération immédiatement après pour insérer ", page ", puis un second renvoi de catégorie "Figure", cette fois avec "Renvoi à" réglé sur **"Numéro de page"**.

**Résultat attendu** : un texte "voir Figure 3, page 12" entièrement composé de champs dynamiques — si la figure est renumérotée (par exemple, une figure supprimée avant elle) ou déplacée sur une autre page après révision, une simple actualisation (`F9`) met à jour les deux valeurs automatiquement.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.1 et 1.1.2, usage combiné</span>
Le renvoi combine ici la logique des légendes (chapitre 31, domaine MOS 4) et celle des liens internes (1.1.2) — une illustration concrète que les compétences de ce manuel se combinent naturellement dans un document réel, au-delà de leur classement séparé par chapitre.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Toujours utiliser un renvoi plutôt que de taper manuellement "Figure 3, page 12" en dur : une révision ultérieure du document (figure supprimée, réorganisation de sections) rendrait un texte tapé manuellement silencieusement faux, sans aucun signalement de la part de Word — exactement le même principe que la numérotation automatique déjà vu à de nombreuses reprises dans ce manuel (listes au chapitre 11, pages au chapitre 14, table des matières au chapitre 28).
</div>

## 32.3 Lien hypertexte vers un emplacement du même document

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 97 — Créer un lien de navigation interne</span>

**Objectif** : ajouter un lien de navigation directe vers le signet créé à l'atelier 95, en complément du renvoi de l'atelier 96.

**Préparation** : reprends le document, place le point d'insertion où le lien doit apparaître.

**Étapes détaillées** :
1. Tape le texte du lien ("voir la section méthodologique"), sélectionne-le.
2. `Ctrl+K` (raccourci direct) ou onglet Insertion, groupe Liens, clique sur **Lien**.
3. Dans le panneau de gauche de la boîte de dialogue, clique sur **"Emplacement dans ce document"** : la liste affiche automatiquement tous les titres (grâce aux styles de titre, chapitre 9) et tous les signets existants du document.
4. Sélectionne le signet "Methodologie" créé à l'atelier 95, clique sur **Insérer un lien**.

**Résultat attendu** : le texte devient un lien hypertexte (généralement souligné et en bleu, chapitre 9 — rappel que le soulignement doit être réservé aux liens), cliquable en `Ctrl+clic` pour naviguer directement vers le signet visé.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.2 Link to locations within documents (MO-100 Associate)</span>
L'atelier 97 correspond exactement à cet objectif. **Recommandation** : bien connaître les trois destinations possibles d'un lien interne — un titre (via les styles), un signet, ou un emplacement du haut du document — toutes accessibles depuis le même panneau "Emplacement dans ce document".
</div>

## 32.4 Lien hypertexte vers une adresse web ou un e-mail

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 98 — Lier vers le site web de l'ONG partenaire</span>

**Objectif** : répondre à la deuxième demande de la mise en situation d'ouverture.

**Préparation** : reprends le document, sélectionne le texte "site web de l'ONG partenaire".

**Étapes détaillées** :
1. `Ctrl+K`, dans le panneau de gauche cette fois clique sur **"Fichier ou page Web existant(e)"**.
2. Tape ou colle l'adresse complète dans le champ **"Adresse"** (par exemple `https://exemple-ong.org`).
3. Clique sur **Insérer un lien** : le texte devient cliquable, ouvrant le navigateur par défaut vers cette adresse en `Ctrl+clic`.
4. Pour un lien vers une adresse e-mail plutôt qu'un site web, choisis plutôt **"Adresse de messagerie"** dans le panneau de gauche, et tape l'adresse — Word ajoute automatiquement le préfixe technique `mailto:` nécessaire pour que cliquer dessus ouvre directement un nouveau message dans le client de messagerie par défaut.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — vérifier un lien avant diffusion</span>
Une adresse web mal saisie (faute de frappe, protocole manquant) crée un lien qui semble fonctionnel visuellement mais qui échoue à l'ouverture — toujours tester chaque lien externe important en `Ctrl+clic` avant l'envoi ou la publication finale d'un document qui en contient.
</div>

## 32.5 Lier un document à un contenu externe

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec le chapitre 24</span>
Le principe déjà rencontré au chapitre 24 pour les graphiques liés à un classeur Excel externe s'étend à d'autres types de contenu : un objet <strong>lié</strong> (par opposition à <strong>incorporé</strong>) reste connecté à son fichier source, se mettant à jour automatiquement si ce fichier change, tant qu'il reste accessible au même emplacement.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 99 — Lier le fichier Excel de statistiques externes</span>

**Objectif** : répondre à la troisième demande de la mise en situation d'ouverture.

**Préparation** : dispose d'un classeur Excel de test contenant quelques statistiques.

**Étapes détaillées** :
1. Onglet Insertion, groupe Texte, clique sur **Objet**, puis l'onglet **"Créer à partir du fichier"** de la boîte de dialogue.
2. Clique sur **Parcourir...**, sélectionne le classeur Excel externe.
3. Coche impérativement **"Lier au fichier"** (case facilement manquée, décochée par défaut) avant de cliquer sur **OK** — sans cette case cochée, le contenu serait **incorporé** (une copie figée insérée dans le document) plutôt que **lié** (connecté en permanence au fichier source).
4. Le contenu du classeur s'affiche dans le document ; si ce classeur est modifié plus tard dans Excel et réenregistré, rouvrir le document Word (ou clic droit sur l'objet > "Mettre à jour le lien") reflète automatiquement ces changements.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.4 Link to external document content (MO-101 Expert)</span>
L'atelier 99 correspond exactement à cet objectif. **Piège fréquent en examen** : oublier de cocher "Lier au fichier" produit un objet incorporé (comportement par défaut) plutôt que lié — vérifier systématiquement cette case si l'objectif est bien une liaison dynamique et non une simple insertion figée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — la fragilité des liens vers un fichier externe</span>
Un objet lié cesse de se mettre à jour (et peut afficher une erreur) si le fichier source est déplacé, renommé ou supprimé — un risque à anticiper en conservant les fichiers sources liés à un emplacement stable, idéalement partagé via OneDrive/SharePoint (chapitre 41) plutôt qu'un dossier local susceptible d'être réorganisé.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire un mémoire entièrement navigable</span>
Sur un document de test d'au moins six pages avec plusieurs titres et deux figures légendées, crée : un signet sur une section clé, un renvoi vers une figure avec son numéro de page, un lien hypertexte interne vers un titre, et un lien hypertexte externe vers un site web de ton choix. Teste chaque lien en `Ctrl+clic` pour vérifier son bon fonctionnement.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Taper manuellement un renvoi plutôt que d'utiliser la fonctionnalité native</span>
Comme signalé en section 32.2, un renvoi tapé "en dur" devient silencieusement faux après toute révision affectant la numérotation ou la pagination, sans aucun avertissement de Word.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier de cocher "Lier au fichier" pour un objet externe</span>
Comme signalé dans l'atelier 99, cette case décochée par défaut produit un objet figé plutôt que dynamique — une confusion fréquente qui n'est découverte que lorsque le contenu source change sans que le document Word ne le reflète.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Utiliser des espaces dans un nom de signet</span>
Word interdit les espaces dans un nom de signet ; une tentative avec espace échoue silencieusement ou tronque le nom au premier espace rencontré, source de confusion pour un débutant qui ne comprend pas pourquoi son signet ne se nomme pas comme prévu.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un renvoi affiche "Erreur ! Signet non défini."</span>

- **Diagnostic** : l'élément référencé (figure, signet, titre) a probablement été supprimé du document après la création du renvoi.
- **Résolution** : modifier le renvoi (clic droit > "Modifier le champ", ou le supprimer et le recréer) en le pointant vers un élément existant.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un objet lié affiche des données obsolètes malgré une modification du fichier source</span>

- **Diagnostic** : le lien n'a probablement pas été actualisé depuis la modification du fichier externe, ou ce fichier a été déplacé.
- **Résolution** : clic droit sur l'objet > "Objet lié" > "Liens..." pour vérifier le chemin du fichier source et forcer une mise à jour manuelle si nécessaire.
</div>

## En entreprise

- **Bonne pratique répandue** : utiliser systématiquement des renvois plutôt que des références tapées manuellement dans tout document long soumis à des révisions successives (rapports, mémoires, contrats).
- **Bonne pratique répandue** : conserver les fichiers sources de tout objet lié dans un emplacement partagé stable (OneDrive/SharePoint) plutôt qu'un dossier local, pour éviter la rupture du lien en cas de déplacement de fichier.
- **Erreur classique observée** : des rapports professionnels avec des renvois internes ("voir section 3.2") devenus faux après une réorganisation du document, faute d'avoir utilisé la fonctionnalité native de renvoi.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — afficher tous les liens hypertexte d'un document pour vérification</span>
Avant une diffusion externe importante, `Ctrl+A` puis `F9` actualise tous les champs, y compris les renvois ; une vérification manuelle complémentaire de chaque lien hypertexte externe (section 32.4) reste recommandée, car ces derniers ne sont pas des champs actualisables automatiquement de la même façon — seule une adresse mal saisie dès l'origine (ou devenue obsolète depuis) provoquera un échec, indétectable par une simple actualisation de champs.
</div>

## Résumé du chapitre

- Un signet marque un emplacement précis et invisible d'un document, nommé sans espace, navigable via `Ctrl+B`.
- Un renvoi référence dynamiquement un titre, une figure ou un tableau, restant exact après toute révision — à toujours préférer à une référence tapée manuellement.
- Un lien hypertexte interne (vers un titre ou un signet) se crée via `Ctrl+K` > "Emplacement dans ce document" — objectif MOS Associate 1.1.2.
- Un lien hypertexte externe (site web, e-mail) se crée via le même raccourci, avec une adresse à vérifier avant diffusion.
- Un objet lié à un fichier externe nécessite de cocher explicitement "Lier au fichier", sans quoi il reste figé (incorporé) — objectif MOS Expert 1.1.4.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un signet ne peut pas contenir dans son nom :
   - a) De chiffres
   - b) D'espaces
   - c) De majuscules
   - d) Plus de trois caractères

2. Le principal avantage d'un renvoi par rapport à une référence tapée manuellement est :
   - a) Une couleur automatique différente
   - b) Une mise à jour automatique après révision du document
   - c) Une impression plus rapide
   - d) Une taille de police plus grande

3. Pour qu'un objet inséré depuis un fichier externe reste connecté à sa source, il faut :
   - a) Le convertir en image
   - b) Cocher "Lier au fichier"
   - c) L'imprimer immédiatement
   - d) Le renommer

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un renvoi tapé manuellement se met à jour automatiquement comme un vrai renvoi. — **Faux**.
2. `Ctrl+K` ouvre la boîte de dialogue d'insertion de lien hypertexte. — **Vrai**.
3. Un objet lié continue de fonctionner même si son fichier source est supprimé. — **Faux**.
4. Les signets restent visibles à l'impression par défaut. — **Faux**, ils restent invisibles sauf option d'affichage activée à l'écran uniquement.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un renvoi natif est préférable à une référence tapée manuellement dans un document appelé à être révisé plusieurs fois.
2. Un collègue insère un tableau Excel dans son rapport Word mais oublie de cocher "Lier au fichier". Quelle sera la conséquence si le classeur Excel source est mis à jour plus tard ?

**Corrigé 1** : un renvoi natif est un champ dynamique qui recalcule automatiquement sa valeur (numéro de figure, numéro de page) après toute révision affectant la structure du document, tandis qu'une référence tapée manuellement reste figée à sa valeur d'origine, devenant silencieusement fausse dès qu'un changement structurel intervient, sans aucun avertissement de la part de Word.

**Corrigé 2** : sans "Lier au fichier" coché, le tableau est incorporé comme une copie figée au moment de l'insertion — toute modification ultérieure du classeur Excel source, même réenregistrée, ne se répercutera jamais automatiquement dans le document Word, qui continuera d'afficher les anciennes données jusqu'à une réinsertion manuelle complète.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.1</span>

Crée un signet nommé "Conclusion" sur le dernier paragraphe d'un document de test, puis insère en première page un lien hypertexte texte ("Aller à la conclusion") pointant vers ce signet.
</div>

**Corrigé :** réussi si le `Ctrl+clic` sur le lien en première page navigue directement vers le paragraphe de conclusion marqué par le signet.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.2</span>

Sur un document contenant une figure légendée, insère un renvoi de type "Étiquette et numéro" vers cette figure, puis supprime une figure précédente dans le document pour observer si le numéro du renvoi se met à jour correctement après actualisation (`F9`).
</div>

**Corrigé :** réponse personnelle ; réussi si le numéro affiché par le renvoi se décale correctement (par exemple de "Figure 2" à "Figure 1") après suppression de la figure précédente et actualisation du champ.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je crée un signet et j'y navigue via `Ctrl+B`.</li>
<li>☐ J'insère un renvoi dynamique vers un titre, une figure ou un tableau.</li>
<li>☐ Je crée un lien hypertexte vers un emplacement du même document.</li>
<li>☐ Je crée un lien hypertexte vers une adresse web ou un e-mail, en le vérifiant avant diffusion.</li>
<li>☐ Je lie un document à un contenu externe en cochant explicitement "Lier au fichier".</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Signet** = marqueur invisible nommé sans espace, navigable via `Ctrl+B`.
- **Renvoi** = toujours préférable à une référence tapée manuellement, reste exact après révision.
- **Lien interne** (`Ctrl+K` > Emplacement dans ce document) — MOS Associate 1.1.2.
- **Lien externe** (site web, e-mail) = toujours vérifier avant diffusion.
- **Objet lié** = cocher "Lier au fichier", sinon incorporé par défaut — MOS Expert 1.1.4.

**Raccourcis clavier de ce chapitre** :
- `Ctrl+K` : insérer un lien hypertexte.
- `Ctrl+B` : atteindre (navigation vers un signet, une page, etc.).
</div>

## FAQ

<dl class="faq">
<dt>Un lien hypertexte peut-il pointer vers une page précise d'un autre document Word ?</dt>
<dd>Oui, en combinant "Fichier ou page Web existant(e)" avec un signet créé au préalable dans le document de destination, référencé via le champ "Signet" de la même boîte de dialogue de lien.</dd>

<dt>Supprimer un signet supprime-t-il aussi le texte qu'il marquait ?</dt>
<dd>Non, supprimer un signet (Insertion > Signet > sélectionner > Supprimer) retire uniquement le marqueur invisible, laissant le texte lui-même parfaitement intact.</dd>

<dt>Un objet lié fonctionne-t-il encore si le document Word est envoyé à quelqu'un qui n'a pas accès au fichier source ?</dt>
<dd>Non, le destinataire verra la dernière version du contenu affichée au moment de l'envoi, mais toute tentative de mise à jour du lien échouera puisqu'il n'a pas accès au fichier source original — un point à anticiper avant l'envoi d'un document contenant des objets liés à des destinataires externes.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les signets, renvois et liens hypertexte : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Objets liés à un classeur Excel externe, principe déjà vu pour les graphiques : chapitre 24.

*Chapitre suivant : gérer un document long — mode Plan et sous-documents, pour clore la Partie 8 avec les outils de structuration globale d'un document volumineux.*
