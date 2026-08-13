<div class="chapitre-titre-num">CHAPITRE 19</div>

# Modèles : créer, utiliser, personnaliser

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer précisément ce qui distingue un modèle d'un document ordinaire ; construire un modèle complet de zéro, combinant les styles (chapitre 17) et le thème (chapitre 18) d'une organisation ; enregistrer ce modèle au bon format et au bon emplacement pour qu'il apparaisse dans la galerie Fichier > Nouveau ; modifier correctement un modèle existant sans accidentellement le confondre avec un document qui en découle ; et distinguer un modèle personnel d'un modèle d'organisation partagé.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Modifier des modèles de document existants | MO-101 Word Expert — Manage Document Options and Settings | 1.1.1 |

**Prérequis** : chapitre 5 (créer un document à partir d'un modèle existant), chapitre 17 (styles) et chapitre 18 (thèmes), tous deux réutilisés directement dans ce chapitre.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport mensuel de l'ONG, désormais doté de ses styles personnalisés (chapitre 17) et de son thème officiel (chapitre 18), doit être reproductible chaque mois par n'importe quel membre de l'équipe, sans que chacun ne doive reconstruire cette mise en forme depuis un ancien rapport copié-collé. Ta responsable demande un vrai **modèle** de rapport mensuel : ouvrable en un clic depuis Fichier > Nouveau, avec la structure de base déjà en place (titre, sections types, styles et thème corrects), mais jamais risqué d'être écrasé par erreur en travaillant sur un rapport particulier. Ce chapitre boucle la logique commencée au chapitre 4 (Normal.dotm), approfondie aux chapitres 17 et 18.
</div>

## 19.1 Ce qui distingue un modèle d'un document

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la synthèse de plusieurs chapitres précédents</span>
Un <strong>modèle</strong> (extension <code>.dotx</code>, ou <code>.dotm</code> s'il contient des macros, chapitre 36) est un fichier <strong>distinct</strong> d'un document (<code>.docx</code>), qui sert de point de départ réutilisable. Ouvrir un modèle via Fichier > Nouveau (chapitre 5) crée toujours une <strong>copie</strong> de travail au format document, laissant le modèle source intact — c'est exactement le mécanisme déjà rencontré au chapitre 4 avec Normal.dotm, le modèle invisible utilisé par défaut pour tout document vierge.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un modèle est comme un moule à gâteau : on peut l'utiliser autant de fois que nécessaire pour produire des gâteaux (des documents) identiques dans leur forme, sans jamais "consommer" ou modifier le moule lui-même en cuisinant. Modifier le moule (le modèle) change la forme de tous les futurs gâteaux, mais jamais celle des gâteaux déjà sortis du four (les documents déjà créés et enregistrés séparément).
</div>

## 19.2 Créer un modèle complet de zéro

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 50 — Construire le modèle de rapport mensuel de l'ONG</span>

**Objectif** : répondre à la demande de la mise en situation d'ouverture.

**Préparation** : ouvre un nouveau document vierge.

**Étapes détaillées** :
1. Construis la structure de base du rapport : un titre ("Rapport mensuel — [Mois] [Année]") avec le style Titre 1, suivi de sections types avec Titre 2 ("Résumé exécutif", "Activités du mois", "Situation financière", "Perspectives"), chacune suivie d'un court texte de substitution entre crochets (par exemple "[Décrire ici les activités principales du mois]").
2. Applique le thème "ONG Exemple" et le jeu de styles personnalisé créés au chapitre 18.
3. Ajoute l'en-tête et la numérotation de page (chapitre 14) attendus pour tout rapport de l'organisation.
4. Une fois la structure satisfaisante, va dans **Fichier > Enregistrer sous** (chapitre 5).
5. Dans le menu déroulant "Type", choisis **"Modèle Word (*.dotx)"** : Word bascule automatiquement l'emplacement d'enregistrement proposé vers le dossier **"Modèles Office personnalisés"** de ton profil utilisateur.
6. Nomme le fichier "Rapport mensuel ONG Exemple", clique sur **Enregistrer**.

**Résultat attendu** : ouvrir désormais Fichier > Nouveau affiche ce modèle dans une section dédiée ("Personnel"), prêt à générer un nouveau rapport en un clic, avec toute la structure, les styles et le thème déjà en place.

**Dépannage** : si le modèle n'apparaît pas dans Fichier > Nouveau après l'enregistrement, vérifie que le dossier de destination choisi à l'étape 5 était bien le dossier "Modèles Office personnalisés" par défaut, et non un autre dossier sélectionné par erreur.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un cabinet juridique construit un modèle de contrat-type incluant déjà les clauses standards, la numérotation multiniveaux (chapitre 11) des articles, et les styles de mise en forme officiels du cabinet — chaque nouveau contrat spécifique à un client démarre alors de ce modèle plutôt que d'un document vierge ou, pire, de la copie d'un ancien contrat d'un autre client (avec le risque d'y laisser des informations confidentielles oubliées).
</div>

## 19.3 Modifier un modèle existant

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 51 — Corriger une coquille dans le modèle sans créer de nouveau document</span>

**Objectif** : apprendre la manipulation correcte pour éditer le modèle lui-même, distincte de son utilisation habituelle.

**Préparation** : le modèle "Rapport mensuel ONG Exemple" de l'atelier 50 contient une erreur à corriger (par exemple, une faute dans "Perspectives" tapée "Perspective" au singulier par erreur).

**Étapes détaillées** :
1. Ouvre l'explorateur de fichiers Windows, navigue jusqu'au dossier "Modèles Office personnalisés" (généralement `Documents\Modèles Office personnalisés`).
2. **Double-clique directement** sur le fichier `.dotx` lui-même — contrairement à l'ouverture via Fichier > Nouveau (chapitre 5), cela ouvre le **modèle en édition directe**, pas une copie de travail.
3. Corrige la coquille ("Perspectives" au pluriel), puis enregistre normalement (`Ctrl+S`) : cette fois, c'est bien le fichier modèle lui-même qui est mis à jour.
4. Ferme le fichier, puis vérifie via Fichier > Nouveau qu'un nouveau document créé à partir de ce modèle reflète bien la correction.

**Résultat attendu** : le modèle est corrigé une seule fois, et tout futur document créé à partir de lui hérite automatiquement de la correction — sans avoir à corriger individuellement chaque rapport déjà produit auparavant (qui reste, lui, inchangé, cohérent avec le principe du chapitre 19.1).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.1 Modify existing document templates (MO-101 Expert)</span>
L'atelier 51 correspond exactement à cet objectif. **Piège fréquent en examen** : la manipulation attendue (double-clic direct sur le fichier `.dotx`, ou Fichier > Ouvrir en ciblant explicitement le fichier modèle) diffère de l'usage courant (Fichier > Nouveau) — une confusion entre les deux est spécifiquement ce que l'erreur n°1 du chapitre 5 mettait déjà en garde, dans le sens inverse cette fois : ici, c'est bien le modèle qu'on veut éditer, pas une copie.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le rappel exact du chapitre 5</span>
Rappel de l'erreur n°1 du chapitre 5 : ouvrir un modèle directement depuis l'explorateur modifie le modèle lui-même, alors qu'un usage normal (Fichier > Nouveau) crée une copie de travail. Ce chapitre montre que ce comportement, présenté comme un piège au chapitre 5, devient ici un <strong>outil volontaire et recherché</strong> dès qu'il s'agit de corriger ou faire évoluer le modèle en tant que tel.
</div>

## 19.4 Modèles personnels contre modèles d'organisation partagés

| Type de modèle | Emplacement | Visibilité |
|---|---|---|
| **Modèle personnel** | Dossier "Modèles Office personnalisés" du profil utilisateur | Uniquement sur ce poste, pour cet utilisateur |
| **Modèle d'organisation** | Espace SharePoint dédié aux modèles d'entreprise (configuré par un administrateur Microsoft 365) | Accessible à tous les membres autorisés de l'organisation, depuis Fichier > Nouveau, onglet dédié |

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Un modèle d'organisation configuré via SharePoint (chapitre 41) apparaît directement dans Fichier > Nouveau sous un onglet propre à l'entreprise, visible par tous les collaborateurs autorisés — la solution la plus robuste pour une organisation de plusieurs personnes, comparée à la distribution manuelle de fichiers `.dotx` par e-mail, plus simple à mettre en place mais plus fragile dans la durée (versions qui divergent, oubli de mise à jour chez certains).
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire un modèle de lettre officielle</span>
Construis un modèle de lettre officielle complet pour une organisation fictive : en-tête avec logo textuel et coordonnées, zone de date alignée à droite (tabulation, chapitre 12), formule d'appel et de politesse type, avec des styles personnalisés cohérents. Enregistre-le comme modèle `.dotx`, puis crée deux lettres différentes à partir de lui pour vérifier que chacune reste indépendante et n'affecte jamais le modèle source.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Continuer à copier un ancien document plutôt que créer un vrai modèle</span>
Copier-coller un ancien rapport et en effacer le contenu spécifique pour "faire un nouveau rapport" fonctionne à court terme, mais accumule le risque d'oublier une information confidentielle du document d'origine (chapitre 42) et ne bénéficie jamais des avantages d'un vrai modèle (apparition dans Fichier > Nouveau, mise à jour centralisée en cas de correction).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier accidentellement le modèle en pensant créer un nouveau document</span>
Double-cliquer sur un fichier `.dotx` en pensant qu'il se comportera comme un `.docx` ordinaire (l'ouvrir pour l'utiliser, pas pour le modifier) risque de modifier silencieusement le modèle partagé par toute l'équipe — l'inverse exact de la manipulation volontaire de la section 19.3, mais accidentelle cette fois.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier de vérifier le type de fichier lors de l'enregistrement d'un modèle</span>
Enregistrer un modèle nouvellement créé au format `.docx` par erreur (plutôt que `.dotx`) le fait apparaître comme un document ordinaire, pas comme un modèle — il n'apparaîtra jamais dans la galerie Fichier > Nouveau, un oubli fréquent qui déroute lors de la première tentative de création d'un modèle.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le modèle personnel n'apparaît pas dans Fichier > Nouveau</span>

- **Diagnostic** : le fichier a probablement été enregistré au mauvais format (`.docx` au lieu de `.dotx`) ou dans le mauvais dossier.
- **Résolution** : vérifier l'extension du fichier dans l'explorateur (afficher les extensions de fichiers si nécessaire) et son emplacement exact, en le déplaçant si besoin vers le dossier "Modèles Office personnalisés" correct.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une modification du modèle ne se répercute pas sur un document déjà créé à partir de lui</span>

- **Diagnostic** : c'est le comportement **normal et attendu**, pas un bug — un document créé à partir d'un modèle devient, dès sa création, totalement indépendant de ce modèle (section 19.1), à l'exception des styles explicitement liés (chapitre 17) qui peuvent, eux, être mis à jour séparément via l'Organisateur.
- **Résolution** : aucune action nécessaire ; si une mise à jour rétroactive de documents déjà créés est réellement souhaitée, elle doit être faite manuellement, document par document, ou via l'Organisateur pour les seuls styles concernés.
</div>

## En entreprise

- **Bonne pratique répandue** : créer un modèle dès qu'un même type de document (rapport, lettre, facture) est produit plus de deux ou trois fois avec une structure similaire, plutôt que de continuer à copier un ancien fichier indéfiniment.
- **Bonne pratique répandue** : centraliser les modèles d'organisation sur un espace SharePoint partagé plutôt que par distribution manuelle de fichiers, pour garantir que toute l'équipe utilise toujours la version la plus à jour.
- **Erreur classique observée** : plusieurs versions légèrement différentes d'un "même" modèle circulant par e-mail dans une équipe, chacun ayant reçu et modifié sa propre copie sans savoir laquelle faisait référence.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — modèles avec macros (.dotm)</span>
Un modèle enregistré au format **.dotm** (plutôt que `.dotx`) peut contenir des macros (chapitre 36) directement utilisables dans tout document créé à partir de lui — utile pour un modèle qui automatise une tâche répétitive (générer automatiquement une numérotation de dossier, par exemple) dès sa création, sans configuration supplémentaire de l'utilisateur final.
</div>

## Résumé du chapitre

- Un modèle (`.dotx`/`.dotm`) est un fichier distinct d'un document (`.docx`), servant de point de départ réutilisable sans jamais être modifié par l'usage normal (Fichier > Nouveau).
- Construire un modèle complet combine structure de base, styles personnalisés (chapitre 17) et thème (chapitre 18), enregistré via "Enregistrer sous" en choisissant explicitement le type "Modèle Word".
- Modifier un modèle existant nécessite de l'ouvrir directement (double-clic sur le fichier, pas via Fichier > Nouveau) — objectif MOS Expert 1.1.1.
- Un modèle personnel reste local à un poste ; un modèle d'organisation partagé via SharePoint est accessible à toute une équipe de façon centralisée et à jour.
- Modifier un modèle ne modifie jamais rétroactivement les documents déjà créés à partir de lui — un comportement normal, pas une limitation.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour modifier un modèle existant lui-même (pas créer un document à partir de lui) :
   - a) Fichier > Nouveau, puis choisir le modèle
   - b) Double-cliquer directement sur le fichier `.dotx`
   - c) Copier-coller le contenu dans un nouveau document
   - d) Impossible, les modèles ne sont jamais modifiables

2. Enregistrer un modèle au format `.docx` par erreur plutôt que `.dotx` a pour conséquence :
   - a) Aucune, les deux formats sont strictement identiques
   - b) Le fichier n'apparaît pas dans la galerie Fichier > Nouveau
   - c) Le document devient automatiquement un modèle
   - d) Le fichier est corrompu

3. Modifier un modèle après que dix documents ont déjà été créés à partir de lui :
   - a) Modifie automatiquement les dix documents existants
   - b) N'affecte que les futurs documents créés à partir de ce modèle
   - c) Supprime les dix documents existants
   - d) Nécessite de recréer les dix documents

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un modèle et un document sont deux formats de fichiers distincts. — **Vrai** (`.dotx`/`.dotm` contre `.docx`/`.docm`).
2. Modifier un modèle modifie rétroactivement tous les documents déjà créés à partir de lui. — **Faux**, sauf pour les styles liés via l'Organisateur.
3. Un modèle d'organisation partagé via SharePoint est visible par tous les collaborateurs autorisés depuis Fichier > Nouveau. — **Vrai**.
4. Un modèle ne peut jamais contenir de macros. — **Faux** (format `.dotm`, chapitre 36).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi construire un vrai modèle est préférable à copier-coller un ancien document, avec un risque concret que cela évite.
2. Un collègue a corrigé une erreur dans le modèle d'entreprise, mais se demande pourquoi les rapports du mois dernier affichent toujours l'ancienne erreur. Explique-lui pourquoi c'est normal.

**Corrigé 1** : copier un ancien document risque de laisser des informations spécifiques au document d'origine (un nom de client précédent, un montant confidentiel) que l'auteur pourrait oublier de supprimer, en plus de ne bénéficier d'aucune des fonctionnalités propres à un vrai modèle (apparition centralisée dans Fichier > Nouveau, mise à jour homogène en cas de correction future).

**Corrigé 2** : un document créé à partir d'un modèle devient, dès sa création, un fichier totalement indépendant de ce modèle — modifier le modèle après coup n'a d'effet que sur les futurs documents créés à partir de lui, jamais sur ceux déjà existants et enregistrés séparément, sauf mise à jour manuelle de ces documents ou usage de l'Organisateur pour les seuls styles concernés (chapitre 17).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Construis un modèle simple de compte rendu de réunion (titre, date, liste des participants, ordre du jour en liste numérotée, section "Décisions prises"), enregistre-le au format `.dotx` dans le dossier de modèles personnels, puis vérifie qu'il apparaît bien dans Fichier > Nouveau.
</div>

**Corrigé :** réussi si le modèle apparaît dans une section dédiée de Fichier > Nouveau et que l'ouvrir crée bien une copie de travail (`.docx`) sans jamais modifier le fichier modèle original.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.2</span>

Ouvre ce modèle directement depuis l'explorateur de fichiers (pas via Fichier > Nouveau), ajoute une section supplémentaire ("Prochaines étapes"), enregistre. Crée ensuite un nouveau document à partir de ce modèle mis à jour pour vérifier que la nouvelle section y apparaît bien.
</div>

**Corrigé :** réponse personnelle ; réussi si la nouvelle section "Prochaines étapes" apparaît dans tout nouveau document créé après la modification du modèle, confirmant la bonne compréhension de la distinction entre édition du modèle et création d'un document à partir de lui.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer ce qui distingue un modèle d'un document ordinaire.</li>
<li>☐ Je construis un modèle complet combinant structure, styles et thème.</li>
<li>☐ Je sais ouvrir un modèle directement pour le modifier, sans créer de copie accidentelle.</li>
<li>☐ Je distingue un modèle personnel d'un modèle d'organisation partagé.</li>
<li>☐ Je vérifie systématiquement le format de fichier (`.dotx`) lors de l'enregistrement d'un modèle.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Modèle** (`.dotx`/`.dotm`) ≠ **document** (`.docx`/`.docm`) — deux formats distincts.
- **Fichier > Nouveau** = crée une copie ; **double-clic direct sur le fichier** = édite le modèle lui-même — MOS Expert 1.1.1.
- **Modifier un modèle** = n'affecte jamais rétroactivement les documents déjà créés.
- **Modèle personnel** (poste local) contre **modèle d'organisation** (SharePoint, partagé).

Aucun raccourci clavier dédié : la création et la modification de modèles passent par Fichier > Enregistrer sous ou l'explorateur de fichiers.
</div>

## FAQ

<dl class="faq">
<dt>Puis-je transformer un document `.docx` déjà existant en modèle ?</dt>
<dd>Oui, ouvrir ce document et utiliser Fichier > Enregistrer sous en choisissant le type "Modèle Word (*.dotx)" le convertit directement, sans perte de contenu ni de mise en forme.</dd>

<dt>Un modèle peut-il inclure des styles sans inclure de contenu de texte ?</dt>
<dd>Oui, un modèle totalement vierge en contenu mais riche en styles personnalisés (chapitre 17) et en thème (chapitre 18) reste un modèle parfaitement valide, souvent même préférable pour un usage flexible.</dd>

<dt>Que devient un document si le modèle à partir duquel il a été créé est ensuite supprimé ?</dt>
<dd>Rien de grave : le document reste pleinement fonctionnel et modifiable, totalement indépendant de son modèle d'origine dès sa création (section 19.1) — seule une éventuelle mise à jour future de styles liés via l'Organisateur deviendrait alors impossible depuis ce modèle précis.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la création de modèles : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Modèles avec macros et automatisation : chapitre 36.

*Chapitre suivant : cohérence visuelle et jeux de styles — pour clore la Partie 5 en consolidant l'ensemble des outils de cohérence (styles, thèmes, modèles) vus depuis le chapitre 17 en une méthode de travail unifiée.*
