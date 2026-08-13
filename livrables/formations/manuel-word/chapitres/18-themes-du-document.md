<div class="chapitre-titre-num">CHAPITRE 18</div>

# Thèmes du document

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer ce qu'est un thème et comment il s'articule avec les styles vus au chapitre 17 ; appliquer un thème prédéfini et un jeu de styles (style set) à tout un document en un clic ; créer un jeu de couleurs personnalisé reprenant l'identité visuelle d'une organisation ; créer un jeu de polices personnalisé combinant une police de titres et une police de corps de texte ; enregistrer un thème entièrement personnalisé, combinant couleurs, polices et effets ; et créer puis enregistrer un jeu de styles personnalisé réutilisable.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Appliquer des jeux de styles (style sets) | MO-100 Word Associate — Manage Documents | 1.2.2 |
| Créer des jeux de couleurs personnalisés | MO-101 Word Expert — Create Custom Document Elements | 3.2.1 |
| Créer des jeux de polices personnalisés | MO-101 Word Expert — Create Custom Document Elements | 3.2.2 |
| Créer des thèmes personnalisés | MO-101 Word Expert — Create Custom Document Elements | 3.2.3 |
| Créer des jeux de styles personnalisés | MO-101 Word Expert — Create Custom Document Elements | 3.2.4 |

Ce chapitre couvre la quasi-totalité du sous-domaine MOS Expert **3.2 Create custom design elements**, un autre chapitre à très fort rendement pour la Partie 14, dans la continuité du chapitre 17 sur les styles.

**Prérequis** : chapitre 17 (styles), dont ce chapitre prolonge directement la logique à l'échelle de tout un document.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'ONG a désormais une charte graphique officielle : un bleu institutionnel précis, un vert secondaire, et deux polices (une pour les titres, une autre plus sobre pour le texte courant). Ta responsable te demande de faire en sorte que **tous** les documents Word de l'organisation — rapports, lettres, la lettre d'information du chapitre 16 — respectent cette charte automatiquement, sans que chaque personne de l'équipe n'ait à choisir manuellement une couleur ou une police à chaque nouveau document. Ce chapitre montre comment un thème résout ce problème à la racine, à un niveau que les styles individuels du chapitre 17 ne couvrent pas à eux seuls.
</div>

## 18.1 Qu'est-ce qu'un thème, et comment il s'articule avec les styles

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien essentiel avec le chapitre 17</span>
Un <strong>thème</strong> regroupe trois éléments appliqués à <strong>tout</strong> le document en une seule fois : un jeu de <strong>couleurs</strong>, un jeu de <strong>polices</strong> (une pour les titres, une pour le corps), et un jeu d'<strong>effets</strong> (ombres, reflets pour les objets graphiques, chapitre 22). Les styles du chapitre 17 (Titre 1, Normal...) ne définissent pas de couleur ou de police en valeur absolue, mais font le plus souvent référence aux couleurs et polices <strong>du thème actif</strong> — changer de thème change donc instantanément l'apparence de tous les styles qui s'y réfèrent, sans toucher à un seul style individuellement.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Si un style (chapitre 17) est la recette précise d'un plat, le thème est le menu complet du restaurant : changer de thème, c'est un peu comme changer de chef cuisinier tout en gardant les mêmes noms de plats à la carte — chaque plat ("Titre 1", "Normal") reste identifiable par son nom, mais son exécution concrète (couleurs, polices) change selon le thème actif, sans avoir à réécrire chaque recette individuellement.
</div>

## 18.2 Appliquer un thème prédéfini et un jeu de styles

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 46 — Changer l'apparence globale du rapport en un clic</span>

**Objectif** : observer concrètement l'effet d'un thème sur un document déjà structuré avec des styles (chapitre 17).

**Préparation** : reprends le rapport mensuel, avec ses styles de titre déjà appliqués (chapitre 9).

**Étapes détaillées** :
1. Onglet **Création** (Ruban, chapitre 3), groupe Mise en forme du document, survole les vignettes de la galerie **Thèmes** : un aperçu instantané s'affiche dans le document.
2. Clique sur un thème différent de celui par défaut ("Faceted" ou un autre nom selon la version) : observe que les couleurs des titres et les polices changent instantanément, sans qu'un seul style n'ait été modifié individuellement.
3. Dans le même groupe, ouvre la galerie **"Jeux de styles"** (Style Sets) : chaque vignette propose une variante d'espacement et de hiérarchie visuelle des styles existants (plus ou moins de contraste entre Titre 1 et le corps, par exemple), sans changer les couleurs ni les polices du thème actif.

**Résultat attendu** : deux leviers indépendants et complémentaires — le thème (couleurs/polices/effets) et le jeu de styles (hiérarchie visuelle) — permettent de transformer radicalement l'apparence d'un document déjà structuré, en quelques clics seulement.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.2.2 Apply style sets (MO-100 Associate)</span>
L'atelier 46 correspond à cet objectif pour sa partie "jeu de styles". **Distinction à retenir pour l'examen** : "Thèmes" et "Jeux de styles" sont deux galeries adjacentes mais distinctes du même groupe du Ruban — un changement de thème modifie les couleurs et polices, un changement de jeu de styles modifie la hiérarchie visuelle (tailles, espacements relatifs) sans toucher aux couleurs ni aux polices choisies par le thème.
</div>

## 18.3 Créer un jeu de couleurs personnalisé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 47 — Créer les couleurs officielles de l'ONG</span>

**Objectif** : répondre à la première partie de la mise en situation d'ouverture.

**Préparation** : reprends le document de l'atelier 46. Connais à l'avance les codes couleur exacts de la charte (par exemple, un bleu institutionnel `#1B4F72` et un vert secondaire `#27AE60`).

**Étapes détaillées** :
1. Onglet Création, groupe Mise en forme du document, clique sur **Couleurs**, puis **"Personnaliser les couleurs..."** en bas de la galerie.
2. La boîte de dialogue affiche douze zones de couleur (Couleur de texte/arrière-plan foncé et clair, six couleurs d'accentuation, deux couleurs de lien hypertexte) : clique sur le menu déroulant de **"Accentuation 1"**, choisis **"Autres couleurs..."**, puis saisis le code hexadécimal exact `1B4F72` dans l'onglet Personnalisées.
3. Répète pour **"Accentuation 2"** avec le vert `27AE60`.
4. En bas de la boîte de dialogue, nomme ce jeu de couleurs **"ONG Exemple"**, puis clique sur **Enregistrer**.

**Résultat attendu** : ce jeu de couleurs personnalisé apparaît désormais dans la galerie Couleurs, sous une section "Personnalisé", réutilisable dans tout futur document sans devoir ressaisir les codes hexadécimaux.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.1 Create custom color sets (MO-101 Expert)</span>
L'atelier 47 correspond exactement à cet objectif. **Recommandation** : toujours utiliser le code hexadécimal exact fourni par une charte graphique plutôt que de choisir une couleur "à l'œil" dans la roue de couleurs — une nuance visuellement proche mais techniquement différente reste détectable à l'impression professionnelle ou par un logiciel de contrôle qualité.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Établissement scolaire</span>
Un établissement universitaire (comme UJEPH) enregistre un jeu de couleurs reprenant exactement les teintes de son blason officiel, garantissant que tous les documents administratifs produits par différents services (secrétariat, direction, communication) utilisent rigoureusement la même identité visuelle, sans dépendre de la mémoire ou du jugement visuel de chaque rédacteur.
</div>

## 18.4 Créer un jeu de polices personnalisé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 48 — Associer les deux polices officielles de l'ONG</span>

**Objectif** : répondre à la deuxième partie de la mise en situation d'ouverture.

**Préparation** : reprends le document de l'atelier 47.

**Étapes détaillées** :
1. Onglet Création, groupe Mise en forme du document, clique sur **Polices**, puis **"Personnaliser les polices..."**.
2. Choisis la police pour **"Police du titre"** (par exemple "Montserrat", si installée) et pour **"Police du corps de texte"** (par exemple "Calibri", plus sobre pour la lecture continue).
3. Nomme ce jeu de polices **"ONG Exemple"**, clique sur **Enregistrer**.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.2 Create custom font sets (MO-101 Expert)</span>
L'atelier 48 correspond exactement à cet objectif. **Piège fréquent** : une police choisie dans ce jeu de polices personnalisé ne s'affiche correctement que si elle est installée sur la machine qui ouvre le document — un rappel direct du sujet de compatibilité DOCX déjà abordé au chapitre 1 et à l'annexe C.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Choisir une police de titre et une police de corps suffisamment <strong>contrastées</strong> visuellement (par exemple une police à empattements pour les titres, une police sans empattement pour le corps, ou l'inverse) renforce la hiérarchie visuelle du document, plutôt que d'utiliser deux polices trop similaires qui n'apportent aucune distinction perceptible entre titres et texte courant.
</div>

## 18.5 Enregistrer un thème personnalisé complet

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 49 — Combiner couleurs et polices en un thème unique réutilisable</span>

**Objectif** : finaliser la charte graphique de l'ONG en un seul thème complet, transférable à toute l'équipe.

**Préparation** : reprends le document des ateliers 47 et 48, qui utilise déjà le jeu de couleurs et le jeu de polices "ONG Exemple".

**Étapes détaillées** :
1. Onglet Création, groupe Mise en forme du document, clique sur la flèche déroulante de la galerie **Thèmes**, puis **"Enregistrer le thème actuel..."**.
2. Nomme le fichier **"Theme ONG Exemple"**, conserve l'emplacement par défaut proposé (le dossier "Document Themes" du profil utilisateur — c'est cet emplacement précis qui permet au thème d'apparaître ensuite dans la galerie de tout document), puis clique sur **Enregistrer**.
3. Pour transmettre ce thème à un collègue, envoie-lui simplement le fichier `.thmx` généré : il devra le copier dans son propre dossier "Document Themes" (ou l'importer directement via "Parcourir les thèmes..." dans la même galerie) pour le voir apparaître dans sa propre galerie Thèmes.

**Résultat attendu** : un fichier de thème réutilisable, combinant couleurs et polices de l'ONG, applicable en un clic à n'importe quel document futur, par n'importe quel membre de l'équipe disposant de ce même fichier.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.3 Create custom themes (MO-101 Expert)</span>
L'atelier 49 correspond exactement à cet objectif. **Distinction avec la section 17.6** : transférer un thème (fichier `.thmx` indépendant) est un mécanisme différent de transférer des styles individuels via l'Organisateur — un thème et des styles sont deux niveaux distincts qui peuvent chacun être partagés séparément, ou ensemble via un modèle complet (chapitre 19).
</div>

## 18.6 Créer et enregistrer un jeu de styles personnalisé

Au-delà des jeux de styles prédéfinis vus en section 18.2, il est possible de créer sa propre variante de hiérarchie visuelle.

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Enregistrer un jeu de styles personnalisé</span>

1. Ajuste manuellement l'apparence de plusieurs styles du document (par exemple, via "Modifier..." sur Titre 1 et Titre 2, chapitre 17) jusqu'à obtenir la hiérarchie visuelle souhaitée.
2. Onglet Création, groupe Mise en forme du document, clique sur la flèche déroulante de la galerie **Jeux de styles**, puis **"Enregistrer en tant que nouveau jeu de styles rapides..."**.
3. Nomme ce jeu de styles (par exemple "ONG Exemple — Rapports"), clique sur **Enregistrer**.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.4 Create custom style sets (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif, complétant le sous-domaine MOS 3.2 dans son intégralité au fil de ce chapitre.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire l'identité visuelle complète d'une organisation fictive</span>
Choisis une organisation fictive (une PME, une association, un établissement scolaire) et définis pour elle deux couleurs d'accentuation précises (codes hexadécimaux), une police de titre et une police de corps. Crée successivement le jeu de couleurs, le jeu de polices, puis le thème complet regroupant les deux, en leur donnant des noms cohérents avec l'organisation choisie. Applique ce thème à un document de test d'au moins deux pages avec plusieurs niveaux de titres.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre thème et jeu de styles</span>
Comme signalé en section 18.2, ces deux galeries adjacentes du Ruban contrôlent des aspects différents (couleurs/polices contre hiérarchie visuelle) — appliquer l'un en pensant changer l'autre est une confusion fréquente chez les débutants découvrant cette section du Ruban pour la première fois.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Choisir une couleur "à l'œil" plutôt qu'un code hexadécimal exact</span>
Comme signalé en section 18.3, une couleur choisie visuellement dans la roue de couleurs plutôt qu'avec le code exact d'une charte graphique introduit un écart, parfois minime mais réel, entre les documents produits par différentes personnes d'une même organisation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier de transférer le fichier de thème à toute l'équipe</span>
Créer un thème personnalisé magnifique sur son propre poste, sans le partager activement (fichier `.thmx`, section 18.5) avec le reste de l'équipe, limite son bénéfice au seul créateur — un thème d'organisation n'a de valeur que s'il est effectivement utilisé par tous ceux qui produisent des documents en son nom.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un thème transmis par un collègue n'apparaît pas dans ma galerie Thèmes</span>

- **Diagnostic** : le fichier `.thmx` reçu n'a probablement pas été placé dans le bon dossier, ou n'a pas été importé via "Parcourir les thèmes...".
- **Résolution** : utiliser directement Création > Thèmes > **"Parcourir les thèmes..."** et naviguer jusqu'au fichier `.thmx` reçu, plutôt que de le copier manuellement dans un dossier système.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les polices du thème personnalisé s'affichent différemment sur un autre poste</span>

- **Diagnostic** : comme signalé en section 18.4, la police choisie n'est probablement pas installée sur cet autre poste, Word la remplaçant alors silencieusement par une police de substitution proche.
- **Résolution** : vérifier que les polices personnalisées de la charte sont bien installées sur tous les postes de l'équipe, ou choisir des polices largement répandues (comme celles pré-installées avec Microsoft 365) pour éviter ce problème.
</div>

## En entreprise

- **Bonne pratique répandue** : centraliser la création d'un thème d'organisation (couleurs, polices) au sein d'une seule personne ou d'une petite équipe de communication, plutôt que de laisser chaque employé créer sa propre variante approximative.
- **Bonne pratique répandue** : distribuer le fichier de thème `.thmx` officiel via un espace partagé (SharePoint/OneDrive, chapitre 41) accessible à toute l'équipe, avec une procédure d'installation documentée.
- **Erreur classique observée** : des documents d'une même organisation utilisant des nuances de bleu visiblement différentes d'un rapport à l'autre, faute d'un thème centralisé et effectivement partagé.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — associer un thème complet à un modèle d'entreprise</span>
Le moyen le plus fiable de garantir qu'une organisation entière utilise toujours le bon thème n'est pas de compter sur chaque utilisateur pour l'appliquer manuellement, mais d'intégrer directement le thème personnalisé dans un **modèle** (`.dotx`, chapitre 19) : tout nouveau document créé à partir de ce modèle hérite alors automatiquement du thème correct, sans aucune action requise de la part de l'utilisateur.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — synthèse de ce chapitre pour l'examen</span>
Ce chapitre couvre un objectif Associate (1.2.2) et l'intégralité du sous-domaine Expert **3.2 Create custom design elements** (quatre objectifs). **Piège fréquent** : les quatre commandes de création (couleurs, polices, thème, jeu de styles) se trouvent toutes dans le même groupe "Mise en forme du document" de l'onglet Création, mais chacune ouvre une boîte de dialogue ou un menu différent — mémoriser précisément l'emplacement de chacune avant l'examen évite une perte de temps inutile en situation chronométrée.
</div>

## Résumé du chapitre

- Un thème regroupe couleurs, polices et effets, appliqué à tout le document ; les styles (chapitre 17) y font souvent référence plutôt que de définir des valeurs fixes.
- Thèmes et jeux de styles sont deux galeries adjacentes mais indépendantes : couleurs/polices contre hiérarchie visuelle — objectif MOS Associate 1.2.2 pour les jeux de styles.
- Un jeu de couleurs personnalisé se crée avec des codes hexadécimaux exacts, jamais choisis à l'œil pour une charte graphique officielle — objectif MOS Expert 3.2.1.
- Un jeu de polices personnalisé associe une police de titre et une police de corps, idéalement contrastées — objectif MOS Expert 3.2.2.
- Un thème complet (fichier `.thmx`) se crée et se transfère à toute une équipe pour une identité visuelle cohérente — objectif MOS Expert 3.2.3.
- Un jeu de styles personnalisé enregistre une hiérarchie visuelle propre, réutilisable au-delà des jeux de styles prédéfinis — objectif MOS Expert 3.2.4.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un thème regroupe :
   - a) Uniquement des couleurs
   - b) Couleurs, polices et effets
   - c) Uniquement des styles de paragraphe
   - d) Uniquement la mise en page des sections

2. Changer de "Jeu de styles" (Style Set) modifie principalement :
   - a) Les couleurs du document
   - b) La hiérarchie visuelle (tailles, espacements) sans changer les couleurs ni les polices du thème
   - c) Le format de papier
   - d) La langue de correction

3. Pour qu'une couleur de charte graphique soit reproduite exactement, il faut utiliser :
   - a) La roue de couleurs à l'œil
   - b) Le code hexadécimal exact
   - c) Le nuancier par défaut de Word uniquement
   - d) Une capture d'écran de la couleur

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Modifier un thème modifie automatiquement l'apparence des styles qui y font référence. — **Vrai**.
2. Un thème personnalisé s'enregistre dans un fichier portant l'extension `.thmx`. — **Vrai**.
3. Les jeux de couleurs et les jeux de polices ne peuvent pas être créés séparément, uniquement ensemble via un thème complet. — **Faux**, ils peuvent être créés et enregistrés indépendamment.
4. Une police non installée sur le poste du destinataire s'affiche toujours de façon identique à l'originale. — **Faux** (Word la remplace silencieusement par une police de substitution).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique la différence entre un thème et un jeu de styles, avec un exemple concret de ce que chacun modifierait sur un même document.
2. Un collègue a créé un superbe thème pour son propre document, mais le reste de l'équipe ne le voit pas dans sa galerie Thèmes. Explique-lui comment le partager correctement.

**Corrigé 1** : un thème modifie les couleurs (par exemple, tous les titres passeraient du bleu au vert) et les polices (Montserrat remplacée par Calibri) de tout le document ; un jeu de styles, lui, ne changerait ni les couleurs ni les polices, mais par exemple l'espacement entre le titre et le texte qui suit, ou le contraste de taille entre Titre 1 et Titre 2 — deux leviers indépendants qui peuvent se combiner librement.

**Corrigé 2** : enregistrer le thème comme fichier `.thmx` (Thèmes > "Enregistrer le thème actuel...", section 18.5), puis transmettre ce fichier au reste de l'équipe, qui devra l'importer via "Parcourir les thèmes..." dans sa propre galerie Thèmes pour le voir apparaître et pouvoir l'appliquer à ses propres documents.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Crée un jeu de couleurs personnalisé avec deux couleurs d'accentuation de ton choix (codes hexadécimaux précis), applique-le à un document de test contenant au moins deux niveaux de titres, et observe le résultat visuel.
</div>

**Corrigé :** réussi si les couleurs d'accentuation choisies apparaissent correctement sur les titres du document, et si le jeu de couleurs personnalisé reste disponible dans la galerie Couleurs pour un usage futur.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.2</span>

Combine ce jeu de couleurs avec un jeu de polices personnalisé (une police de titre, une police de corps) en un thème complet enregistré, puis vérifie que ce thème apparaît bien dans la galerie Thèmes d'un nouveau document.
</div>

**Corrigé :** réponse personnelle ; réussi si le thème complet apparaît dans la section personnalisée de la galerie Thèmes et reproduit fidèlement couleurs et polices sur un nouveau document où il est appliqué.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer comment un thème s'articule avec les styles du chapitre 17.</li>
<li>☐ Je distingue clairement un thème (couleurs/polices/effets) d'un jeu de styles (hiérarchie visuelle).</li>
<li>☐ Je crée un jeu de couleurs personnalisé avec des codes hexadécimaux exacts.</li>
<li>☐ Je crée un jeu de polices personnalisé, avec une police de titre et une police de corps contrastées.</li>
<li>☐ J'enregistre un thème complet réutilisable et transférable à une équipe.</li>
<li>☐ Je crée et enregistre un jeu de styles personnalisé.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Thème** = couleurs + polices + effets, appliqué à tout le document — les styles y font référence.
- **Jeu de styles** ≠ thème : hiérarchie visuelle uniquement, sans toucher aux couleurs/polices — MOS 1.2.2.
- **Jeu de couleurs personnalisé** = toujours par code hexadécimal exact — MOS 3.2.1.
- **Jeu de polices personnalisé** = titre + corps, idéalement contrastés — MOS 3.2.2.
- **Thème complet** = fichier `.thmx`, transférable via "Parcourir les thèmes..." — MOS 3.2.3.
- **Jeu de styles personnalisé** = "Enregistrer en tant que nouveau jeu de styles rapides" — MOS 3.2.4.

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Création du Ruban.
</div>

## FAQ

<dl class="faq">
<dt>Un thème s'applique-t-il aussi aux tableaux et aux graphiques du document ?</dt>
<dd>Oui, les styles de tableau (chapitre 26) et les graphiques (chapitre 24) font également référence aux couleurs du thème actif par défaut, garantissant une cohérence visuelle globale au-delà du seul texte.</dd>

<dt>Puis-je revenir au thème par défaut de Word après avoir appliqué un thème personnalisé ?</dt>
<dd>Oui, la galerie Thèmes propose toujours le thème "Office" par défaut aux côtés des thèmes personnalisés enregistrés, sans jamais supprimer l'un au profit de l'autre.</dd>

<dt>Le thème d'un document PowerPoint peut-il être réutilisé dans Word ?</dt>
<dd>Oui, les thèmes Office (fichiers `.thmx`) sont partagés entre Word, Excel et PowerPoint — un thème créé dans l'un peut être importé et appliqué directement dans les autres, cohérent avec l'écosystème Microsoft 365 évoqué au chapitre 1.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les thèmes Office : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Intégration d'un thème dans un modèle d'entreprise complet : chapitre 19.

*Chapitre suivant : modèles — créer, utiliser, personnaliser. Ce chapitre montrera comment figer définitivement styles (chapitre 17) et thème (ce chapitre) dans un fichier modèle réutilisable, sans dépendre d'un transfert manuel répété à chaque nouveau document.*
