<div class="chapitre-titre-num">CHAPITRE 36</div>

# Initiation aux macros (enregistreur de macros)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer ce qu'est une macro et dans quels cas elle représente un vrai gain de temps ; enregistrer une macro simple reproduisant une séquence d'actions répétitive ; la nommer selon les règles imposées par Word ; l'exécuter à la demande, y compris via un raccourci clavier dédié ; modifier une macro simple directement dans l'éditeur ; et la copier vers un autre document ou modèle pour la rendre disponible au-delà du seul fichier où elle a été créée.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Enregistrer des macros simples | MO-101 Word Expert — Use Advanced Word Features | 4.2.1 |
| Nommer des macros simples | MO-101 Word Expert — Use Advanced Word Features | 4.2.2 |
| Modifier des macros simples | MO-101 Word Expert — Use Advanced Word Features | 4.2.3 |
| Copier des macros vers d'autres documents ou modèles | MO-101 Word Expert — Use Advanced Word Features | 4.2.4 |

Ce chapitre couvre l'intégralité du sous-domaine MOS Expert **4.2 Create and modify macros**.

**Prérequis** : chapitre 35 (onglet Développeur, déjà activé pour les contrôles de contenu et réutilisé ici pour les macros).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Chaque rapport mensuel de l'ONG nécessite la même séquence répétitive de mise en forme finale : appliquer le style de titre au premier paragraphe, insérer la ligne de signature standard en bas, puis enregistrer une copie au format PDF. Un bénévole effectue cette séquence manuellement chaque mois, parfois en oubliant une étape. Ta responsable te demande d'automatiser cette routine en un seul clic ou raccourci clavier. Ce chapitre introduit l'outil conçu précisément pour ce type de répétition, sans nécessiter de compétences de programmation.
</div>

## 36.1 Qu'est-ce qu'une macro

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Une <strong>macro</strong> est une séquence d'actions Word enregistrée une première fois, puis rejouable à l'identique en un seul geste (clic, raccourci clavier) autant de fois que nécessaire. Contrairement à un modèle (chapitre 19) ou un QuickPart (chapitre 35), qui insèrent un contenu figé, une macro <strong>exécute des actions</strong> — cliquer sur des commandes, appliquer des styles, enregistrer un fichier — exactement comme si un utilisateur les réalisait lui-même, mais en une fraction du temps et sans risque d'oubli d'une étape.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Quand une macro est-elle vraiment utile ?</span>
Une macro se justifie pour une séquence d'au moins trois ou quatre actions, répétée régulièrement, et dont chaque étape reste identique d'une fois à l'autre — un cas exactement comme celui de la mise en situation. Une action isolée, ou une séquence qui change à chaque fois selon le contexte, ne bénéficie pas autant de l'automatisation par macro.
</div>

## 36.2 Enregistrer une macro simple

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 111 — Enregistrer la macro de mise en forme finale</span>

**Objectif** : automatiser une partie de la routine décrite dans la mise en situation d'ouverture.

**Préparation** : ouvre un document de test représentant un rapport mensuel, avec un premier paragraphe de titre non encore stylé.

**Étapes détaillées** :
1. Onglet **Développeur** (chapitre 35), groupe Code, clique sur **Enregistrer une macro**.
2. Une boîte de dialogue s'ouvre **avant** que l'enregistrement ne commence réellement — c'est ici que le nom et l'emplacement de stockage se choisissent (section 36.3), pas après coup.
3. Une fois validé, une petite icône de cassette apparaît dans la barre d'état en bas de l'écran, confirmant que l'enregistrement est actif : toute action effectuée à partir de maintenant sera capturée.
4. Sélectionne le premier paragraphe, applique le style "Titre 1" (chapitre 9).
5. Onglet Développeur, clique sur **"Arrêter l'enregistrement"** (le même bouton qui affichait "Enregistrer une macro" avant le démarrage).

**Résultat attendu** : une macro enregistrée, contenant la seule action réalisée pendant l'enregistrement (l'application du style Titre 1), prête à être rejouée sur n'importe quel autre document.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.2.1 Record simple macros (MO-101 Expert)</span>
L'atelier 111 correspond exactement à cet objectif. **Piège fréquent** : oublier d'arrêter l'enregistrement après la séquence voulue continue de capturer toute action supplémentaire (y compris des clics accidentels ou des corrections), produisant une macro plus longue et moins fiable que prévu.
</div>

## 36.3 Nommer une macro correctement

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — les règles de nommage</span>
Un nom de macro doit commencer par une <strong>lettre</strong> (jamais un chiffre), ne contenir <strong>aucun espace</strong> ni caractère spécial (utiliser plutôt la casse mixte comme "MiseEnFormeRapport" ou un tiret bas comme "Mise_En_Forme_Rapport"), et rester suffisamment explicite pour être reconnu des mois plus tard dans une liste qui pourrait contenir plusieurs dizaines de macros.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Nommer et stocker correctement une macro</span>

1. Dans la boîte de dialogue Enregistrer une macro (avant de commencer, comme vu section 36.2), tape un nom respectant les règles ci-dessus, par exemple "MiseEnFormeRapportONG".
2. Sous **"Enregistrer la macro dans"**, choisis entre **"Tous les documents (Normal.dotm)"** (disponible dans tout futur document, comme les styles et thèmes transférés vers Normal.dotm aux chapitres 17-18) ou **"[Nom du document actif]"** (disponible uniquement dans ce document précis).
3. Ajoute une courte **Description** rappelant ce que fait la macro, utile pour s'en souvenir des mois plus tard.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.2.2 Name simple macros (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif. **Recommandation** : toujours choisir "Tous les documents (Normal.dotm)" pour une macro à usage général comme celle de la mise en situation, réservant le stockage limité au document actif pour des macros vraiment spécifiques à un fichier précis.
</div>

## 36.4 Exécuter une macro

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Lancer une macro enregistrée</span>

1. Onglet Développeur, groupe Code, clique sur **Macros** (ou raccourci **`Alt+F8`**).
2. Sélectionne la macro dans la liste, clique sur **Exécuter**.
3. Pour un accès encore plus rapide, un raccourci clavier peut être assigné directement lors de la création de la macro (bouton "Clavier..." dans la boîte de dialogue Enregistrer une macro, section 36.2), ou un bouton peut être ajouté à la barre d'outils Accès rapide (chapitre 4) pour un accès en un seul clic permanent.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
Assigner un raccourci clavier mémorable (par exemple `Ctrl+Alt+M` pour "Mise en forme") à une macro fréquemment utilisée élimine même le besoin d'ouvrir la boîte de dialogue Macros à chaque exécution — un gain de temps cumulatif réel pour une action répétée des dizaines de fois par mois.
</div>

## 36.5 Modifier une macro simple

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 112 — Corriger une macro sans la réenregistrer entièrement</span>

**Objectif** : ajuster une macro existante suite à un besoin légèrement différent, sans repartir de zéro.

**Préparation** : reprends la macro "MiseEnFormeRapportONG" de l'atelier 111.

**Étapes détaillées** :
1. Onglet Développeur, Macros (`Alt+F8`), sélectionne la macro, clique sur **Modifier**.
2. L'éditeur Visual Basic s'ouvre (approfondi au chapitre 37), affichant le code généré automatiquement par l'enregistrement — par exemple une ligne ressemblant à `Selection.Style = ActiveDocument.Styles("Titre 1")`.
3. Sans connaissance de programmation approfondie, il reste possible de repérer et modifier une valeur simple dans ce code — par exemple, remplacer `"Titre 1"` par `"Titre 2"` directement dans le texte, entre guillemets, si le besoin de la macro a légèrement changé.
4. Ferme l'éditeur (les modifications s'enregistrent automatiquement avec le document ou le modèle), puis teste la macro modifiée.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.2.3 Edit simple macros (MO-101 Expert)</span>
L'atelier 112 correspond exactement à cet objectif. **Recommandation** : pour une modification substantielle allant au-delà d'un simple changement de valeur, il reste souvent plus fiable de supprimer la macro et de la réenregistrer entièrement (section 36.2) plutôt que de modifier un code encore mal maîtrisé — le chapitre 37 approfondit la lecture et l'écriture de ce code.
</div>

## 36.6 Copier une macro vers un autre document ou modèle

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Transférer une macro comme un style</span>

1. Onglet Développeur, groupe Code, clique sur **Macros**, puis sur **Organisateur...** en bas de la boîte de dialogue.
2. Clique sur l'onglet **"Macrocommandes du projet"** : l'interface est visuellement identique à l'Organisateur de styles déjà rencontré au chapitre 17 — deux colonnes, l'une pour le document/modèle actif, l'autre pour Normal.dotm ou tout autre document/modèle ouvert au choix.
3. Sélectionne la macro dans la colonne source, clique sur **Copier** vers la colonne de destination.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.2.4 Copy macros to other documents or templates (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif. **Recommandation** : ce mécanisme de transfert est délibérément identique à celui des styles (chapitre 17) — une même logique d'Organisateur, appliquée ici aux macrocommandes plutôt qu'aux styles, à retenir comme un principe transversal de Word plutôt qu'une fonctionnalité isolée à chaque fois.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un cabinet juridique ayant développé une macro de mise en forme automatique pour ses contrats (numérotation d'articles, styles spécifiques) la transfère, via l'Organisateur, vers le modèle officiel de contrat de l'organisation (chapitre 19) — garantissant que chaque juriste utilisant ce modèle dispose automatiquement de la même automatisation, sans devoir la recréer individuellement sur son propre poste.
</div>

## 36.7 Sécurité des macros : ce qu'il faut savoir

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec les chapitres 4 et 19</span>
Les macros étant du code exécutable, elles représentent un vecteur historique de logiciels malveillants — c'est pourquoi Word les <strong>désactive par défaut</strong> dans un document reçu d'une source externe (rappel du chapitre 4, sur l'affichage des onglets, et du chapitre 19, sur le format `.dotm` réservé aux modèles avec macros). Un document contenant des macros doit être enregistré au format `.docm` (document) ou `.dotm` (modèle) — jamais un simple `.docx`, qui ne peut techniquement pas contenir de macros.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — n'active jamais les macros d'un document dont tu ne connais pas la source</span>
Un document `.docm` reçu par e-mail d'un expéditeur inconnu affiche un bandeau d'avertissement de sécurité ("Macros désactivées") — ne jamais cliquer sur "Activer le contenu" sans être certain de la fiabilité de la source, exactement le même principe de prudence que pour tout fichier exécutable reçu d'origine incertaine.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Automatiser la routine complète de la mise en situation</span>
Enregistre une macro complète reproduisant l'intégralité de la routine décrite en ouverture de chapitre : appliquer le style Titre 1 au premier paragraphe, insérer une ligne de signature standard en bas du document (un QuickPart créé au chapitre 35 conviendrait ici), puis enregistrer une copie du document au format PDF (chapitre 45, anticipé ici). Nomme-la selon les règles, assigne-lui un raccourci clavier, puis teste-la sur un nouveau document de test.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier d'arrêter l'enregistrement après la séquence voulue</span>
Comme signalé dans l'atelier 111, cette erreur capture des actions supplémentaires non désirées, produisant une macro imprévisible qui reproduit plus que ce qui était réellement souhaité.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Utiliser un espace ou un chiffre en début de nom de macro</span>
Comme signalé en section 36.3, ces noms sont simplement refusés par Word, obligeant à corriger le nom avant de pouvoir enregistrer la macro.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Activer les macros d'un document reçu d'une source non fiable</span>
Comme signalé en section 36.7, ce geste réflexe et rapide peut exposer le poste à un contenu malveillant si l'expéditeur ou l'origine du fichier n'est pas certain — toujours vérifier la légitimité de la source avant de cliquer sur "Activer le contenu".
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une macro exécutée produit un résultat inattendu, différent de celui enregistré</span>

- **Diagnostic** : la macro a probablement capturé des actions supplémentaires ou différentes de celles réellement voulues (erreur n°1), ou le document sur lequel elle s'exécute a une structure différente de celui utilisé lors de l'enregistrement (par exemple, un texte déjà stylé différemment).
- **Résolution** : réenregistrer la macro plus soigneusement, ou consulter son code dans l'éditeur (section 36.5) pour identifier précisément l'action problématique.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "Activer le contenu" n'apparaît jamais, empêchant toute macro de fonctionner</span>

- **Diagnostic** : le Centre de gestion de la confidentialité (Fichier > Options > Centre de gestion de la confidentialité > Paramètres des macros) est probablement réglé sur "Désactiver toutes les macros sans notification", un niveau de sécurité plus strict que le défaut.
- **Résolution** : ajuster ce réglage vers "Désactiver toutes les macros avec notification" pour retrouver le bandeau d'avertissement habituel, tout en gardant un contrôle explicite avant activation.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter chaque macro d'organisation (nom, description, action réalisée) dans un document de référence partagé, pour que toute l'équipe comprenne ce que fait chaque automatisation disponible.
- **Bonne pratique répandue** : transférer les macros utiles vers le modèle officiel de l'organisation (chapitre 19) plutôt que de laisser chaque personne recréer individuellement les mêmes automatisations.
- **Erreur classique observée** : des macros oubliées, sans description ni nom explicite, dont plus personne ne se souvient de la fonction exacte des mois après leur création — un problème que le nommage rigoureux de la section 36.3 permet d'éviter.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — assigner une macro à un bouton personnalisé du Ruban</span>
Fichier > Options > Personnaliser le ruban propose, dans la liste déroulante des commandes, une catégorie **"Macros"** listant toutes les macrocommandes disponibles — permettant de créer un bouton visuel dédié dans un onglet personnalisé du Ruban (chapitre 4), plutôt que de systématiquement passer par la boîte de dialogue Macros ou un raccourci clavier à mémoriser.
</div>

## Résumé du chapitre

- Une macro enregistre une séquence d'actions répétitive, rejouable en un geste — utile dès trois ou quatre actions identiques répétées régulièrement.
- L'enregistrement se lance via Développeur > Enregistrer une macro, en veillant à bien arrêter l'enregistrement une fois la séquence voulue terminée — objectif MOS Expert 4.2.1.
- Le nom d'une macro doit commencer par une lettre, sans espace ni caractère spécial, et son emplacement de stockage (Normal.dotm ou document actif) détermine sa disponibilité — objectif MOS Expert 4.2.2.
- Une macro s'exécute via `Alt+F8`, un raccourci clavier dédié, ou un bouton de la barre d'outils Accès rapide.
- Une macro simple se modifie directement dans l'éditeur Visual Basic, en ajustant une valeur du code généré — objectif MOS Expert 4.2.3.
- Une macro se copie vers un autre document ou modèle via l'Organisateur, selon le même principe que les styles du chapitre 17 — objectif MOS Expert 4.2.4.
- Les macros nécessitent un format `.docm`/`.dotm` et restent désactivées par défaut pour des raisons de sécurité — ne jamais les activer sur un document de source incertaine.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un nom de macro valide doit :
   - a) Commencer par un chiffre
   - b) Commencer par une lettre, sans espace
   - c) Contenir au moins un espace
   - d) Faire exactement dix caractères

2. Pour qu'une macro soit disponible dans tout futur document, il faut l'enregistrer dans :
   - a) Le document actif uniquement
   - b) Normal.dotm
   - c) Le Presse-papiers
   - d) Un fichier PDF

3. Un document contenant des macros doit être enregistré au format :
   - a) `.docx`
   - b) `.docm` ou `.dotm`
   - c) `.txt`
   - d) `.pdf`

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une macro capture uniquement les actions réalisées entre le début et la fin explicite de l'enregistrement. — **Vrai**.
2. Les macros sont activées par défaut dans tout document reçu d'une source externe. — **Faux**, elles sont désactivées par défaut pour des raisons de sécurité.
3. L'Organisateur de macrocommandes fonctionne selon le même principe que l'Organisateur de styles. — **Vrai**.
4. Modifier une macro nécessite obligatoirement de la réenregistrer entièrement depuis le début. — **Faux**, un simple changement de valeur dans l'éditeur suffit souvent.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une macro se justifie pour une séquence de plusieurs actions répétitives, mais pas pour une action isolée effectuée une seule fois.
2. Un collègue reçoit un document `.docm` d'un expéditeur qu'il ne connaît pas, avec un bandeau proposant "Activer le contenu". Que devrait-il faire ?

**Corrigé 1** : une macro n'apporte un gain de temps réel que si la séquence automatisée est à la fois suffisamment longue (plusieurs actions) et répétée suffisamment souvent pour justifier le temps initial d'enregistrement et de test — une action isolée effectuée une seule fois ne bénéficierait d'aucun gain net, l'enregistrement de la macro prenant probablement plus de temps que l'action elle-même.

**Corrigé 2** : ne pas cliquer sur "Activer le contenu" tant que la fiabilité de l'expéditeur et l'origine du fichier n'ont pas été vérifiées — les macros étant du code exécutable, un document `.docm` non fiable peut potentiellement contenir du contenu malveillant, et ce bandeau de sécurité existe précisément pour laisser à l'utilisateur le contrôle explicite de cette décision plutôt que d'exécuter automatiquement du code inconnu.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.1</span>

Enregistre une macro nommée "AppliquerCitation" qui applique un style de paragraphe "Citation" (chapitre 17) à une sélection, en la stockant dans Normal.dotm. Teste-la sur trois paragraphes différents d'un document de test.
</div>

**Corrigé :** réussi si les trois paragraphes adoptent bien le style "Citation" après exécution de la macro, sans réenregistrement de celle-ci entre chaque test.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.2</span>

Ouvre l'éditeur de cette macro, repère la ligne de code faisant référence au style appliqué, et modifie-la pour appliquer un style différent. Teste à nouveau la macro modifiée.
</div>

**Corrigé :** réponse personnelle ; réussi si la macro modifiée applique bien le nouveau style choisi, confirmant qu'une modification simple dans l'éditeur peut ajuster le comportement d'une macro sans la réenregistrer entièrement.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer ce qu'est une macro et quand elle représente un vrai gain de temps.</li>
<li>☐ J'enregistre une macro simple en veillant à bien arrêter l'enregistrement.</li>
<li>☐ Je nomme une macro selon les règles de Word et je choisis le bon emplacement de stockage.</li>
<li>☐ J'exécute une macro via le raccourci, la boîte de dialogue ou un bouton dédié.</li>
<li>☐ Je modifie une macro simple directement dans l'éditeur.</li>
<li>☐ Je copie une macro vers un autre document ou modèle via l'Organisateur.</li>
<li>☐ Je sais pourquoi ne jamais activer les macros d'un document de source incertaine.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Macro** = séquence d'actions enregistrée, rejouable à l'identique — MOS Expert 4.2.1.
- **Nom** = lettre en premier caractère, jamais d'espace ; **stockage** = Normal.dotm pour une disponibilité universelle — MOS Expert 4.2.2.
- **Modification** = éditeur Visual Basic, changement de valeur simple possible — MOS Expert 4.2.3.
- **Copie vers un autre document/modèle** = Organisateur, même principe que les styles (chapitre 17) — MOS Expert 4.2.4.
- **Sécurité** = jamais "Activer le contenu" sur un document `.docm` de source incertaine.

**Raccourci clavier de ce chapitre** :
- `Alt+F8` : ouvrir la boîte de dialogue Macros.
</div>

## FAQ

<dl class="faq">
<dt>Une macro enregistrée peut-elle inclure des conditions (si... alors...) comme un champ de fusion conditionnel ?</dt>
<dd>Pas directement via l'enregistreur simple de ce chapitre, qui ne capture que des actions linéaires ; ajouter une logique conditionnelle nécessite d'écrire ou de modifier manuellement le code VBA, approfondi au chapitre 37.</dd>

<dt>Peut-on supprimer une macro devenue inutile ?</dt>
<dd>Oui, via Développeur > Macros, sélectionner la macro concernée puis cliquer sur "Supprimer" — une action définitive à confirmer avant de valider si la macro était partagée avec d'autres membres d'une équipe.</dd>

<dt>Une macro enregistrée sur Word pour Windows fonctionne-t-elle aussi sur Word pour Mac ?</dt>
<dd>Le VBA est globalement compatible entre les deux plateformes, mais certaines actions spécifiques à l'interface Windows peuvent ne pas se comporter de façon identique sur Mac — un test de vérification reste recommandé avant de déployer une macro sur un environnement mixte.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les macros dans Word : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Approfondissement du code VBA sous-jacent aux macros : chapitre 37.

*Chapitre suivant : introduction à VBA pour Word — pour aller au-delà de l'enregistreur automatique et écrire directement du code, dépassant les limites des macros simplement enregistrées.*
