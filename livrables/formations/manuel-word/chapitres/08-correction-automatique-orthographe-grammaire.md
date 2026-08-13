<div class="chapitre-titre-num">CHAPITRE 8</div>

# Correction automatique, orthographe et grammaire

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : interpréter les soulignés ondulés de couleur pendant la frappe et corriger une faute directement au clic droit ; lancer une vérification complète d'orthographe et de grammaire sur tout un document ; personnaliser la correction automatique (remplacements de frappe, majuscules) pour qu'elle t'aide plutôt qu'elle ne te gêne ; ajouter des mots légitimes (noms propres, jargon métier) à un dictionnaire personnalisé pour éviter les faux positifs répétés ; utiliser l'Éditeur de Word pour améliorer la clarté, la concision et le ton d'un texte au-delà de la simple orthographe ; et lire un score de lisibilité pour évaluer objectivement la difficulté de lecture d'un document.
</div>

**Matrice de compétences MOS**

Ce chapitre ne correspond à aucun objectif directement testé par l'examen MOS Word (MO-100/MO-101) — la correction orthographique et grammaticale est une aide passive de l'application, jamais une tâche évaluée en tant que telle par un scénario d'examen. Elle reste néanmoins indirectement indispensable : tout document produit pendant l'examen est implicitement jugé propre, sans faute résiduelle visible. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 7 (sélection et remplacement de texte).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport mensuel est presque terminé. En le relisant, ta responsable te fait remarquer que le nom de l'ONG partenaire, "Fondasyon Espwa", est systématiquement souligné en rouge par Word et qu'elle craint que tu ne le "corriges" par erreur en acceptant une suggestion automatique. De ton côté, tu remarques que Word a discrètement remplacé "1er" par une version avec un "1ᵉʳ" en exposant à chaque fois que tu l'as tapé, un comportement que tu n'as jamais configuré volontairement. Ces deux frictions montrent que la correction automatique de Word est puissante mais doit être comprise et apprivoisée, pas simplement subie.
</div>

## 8.1 La vérification en temps réel : comprendre les soulignés

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Word souligne le texte en <strong>rouge ondulé</strong> pour un mot probablement mal orthographié ou absent de son dictionnaire, et en <strong>bleu ondulé</strong> (parfois double) pour une faute de grammaire ou de style probable (accord, ponctuation, répétition). Ces soulignés n'apparaissent jamais à l'impression ni dans le document final — ce sont des indications visuelles à l'écran uniquement, comme les marques de mise en forme du chapitre 6.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Corriger une faute directement au clic droit</span>

1. Clique avec le bouton droit sur un mot souligné en rouge.
2. Un menu contextuel propose une ou plusieurs suggestions de correction en haut, suivies d'options comme **"Ignorer"** (pour cette occurrence uniquement), **"Ignorer tout"** (pour toutes les occurrences du même mot dans ce document) et **"Ajouter au dictionnaire"** (section 8.4).
3. Clique sur la suggestion correcte pour remplacer immédiatement le mot fautif.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — un mot non souligné n'est pas nécessairement correct</span>
Le correcteur détecte les mots absents du dictionnaire ou les erreurs grammaticales structurelles courantes, mais ne comprend pas le sens réel de la phrase. "Le maire a signé le contrat" et "La mère a signé le contrat" sont tous deux orthographiquement corrects : Word ne peut pas deviner lequel des deux mots correspond réellement à l'intention de l'auteur. Une relecture humaine reste nécessaire au-delà du correcteur, en particulier pour les homophones.
</div>

## 8.2 Vérification complète : le volet Orthographe et grammaire

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 19 — Lancer une vérification complète du document</span>

**Objectif** : passer en revue systématiquement toutes les fautes potentielles d'un document, plutôt que de corriger au fil de la frappe uniquement.

**Préparation** : reprends le rapport mensuel des chapitres précédents (ou tout document contenant volontairement quelques fautes de test).

**Étapes détaillées** :
1. Appuie sur **`F7`** (ou onglet **Révision > Grammaire et orthographe**).
2. Le volet **Éditeur** s'ouvre à droite, listant chaque problème détecté, groupé par catégorie (Orthographe, Grammaire, Clarté, Concision...).
3. Clique sur la première entrée : Word surligne le passage concerné dans le document et affiche les suggestions correspondantes dans le volet.
4. Pour chaque suggestion, choisis **Remplacer** (accepter la correction proposée), **Ignorer une fois**, ou **Ignorer tout**.
5. Continue jusqu'à ce que le volet indique qu'aucun problème supplémentaire n'est détecté.

**Résultat attendu** : un document entièrement relu de façon systématique, sans dépendre uniquement des soulignés visibles au fil de la frappe (facilement manqués sur un long document).

**Dépannage** : si `F7` ne déclenche rien, vérifie qu'aucune portion du document n'est en langue "Ne pas vérifier l'orthographe" (Révision > Langue > Définir la langue de vérification linguistique, chapitre 1) — une portion ainsi marquée est ignorée par la vérification complète.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un cabinet juridique passe systématiquement `F7` sur tout contrat avant envoi au client, non pour remplacer la relecture humaine d'un juriste (indispensable sur le fond), mais pour éliminer en amont les fautes de forme qui nuiraient à la crédibilité d'un document par ailleurs juridiquement solide.
</div>

## 8.3 Personnaliser la correction automatique

La **correction automatique** (AutoCorrect) intervient pendant la frappe, avant même que tu ne t'en rendes compte : elle corrige certaines fautes de frappe courantes, met en majuscule le début d'une phrase, ou remplace certains raccourcis par un texte plus long.

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 20 — Ajouter ton propre remplacement automatique</span>

**Objectif** : créer un raccourci de frappe personnel pour un texte long et répétitif — reproduisant une pratique professionnelle courante.

**Préparation** : reprends Word ouvert à l'atelier 19.

**Étapes détaillées** :
1. **Fichier > Options > Vérification > Options de correction automatique**.
2. Dans l'onglet "Correction automatique", observe la liste des remplacements déjà existants (par exemple "adn" → "ADN").
3. Dans le champ "Remplacer", tape un raccourci court, par exemple `ongex`. Dans le champ "Par", tape le texte complet : "ONG Exemple International, section régionale Nord".
4. Clique sur **Ajouter**, puis **OK**.
5. Retourne dans ton document et tape `ongex` suivi d'un espace : le texte complet se substitue automatiquement.

**Résultat attendu** : un gain de frappe mesurable pour tout texte long et répétitif utilisé plusieurs fois par jour dans un même contexte professionnel.

**Dépannage** : si le remplacement ne se déclenche pas, vérifie que la case "Correction automatique en cours de frappe" est bien cochée en haut de la même fenêtre d'options.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — Word Expert et QuickParts pour des textes encore plus longs</span>
La correction automatique convient à des remplacements courts (un mot ou une phrase). Pour des blocs de texte plus longs et mis en forme (un paragraphe de politique de confidentialité, une signature complète), les **composants QuickPart** (chapitre 35, objectif MOS Expert 3.1.1) constituent l'outil approprié — ce chapitre couvre l'équivalent simple, le chapitre 35 son équivalent professionnel avancé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — les corrections automatiques par défaut ne conviennent pas à tous les contextes</span>
Le comportement "Majuscules en début de phrase" ou "Correction des deux majuscules initiales" peut interférer avec des sigles, des noms de marque ou une orthographe créole/régionale volontaire. La section 8.3 (onglet Correction automatique) permet de décocher précisément chaque comportement automatique jugé gênant, sans devoir désactiver toute la correction automatique en bloc.
</div>

## 8.4 Le dictionnaire personnalisé : éliminer les faux positifs récurrents

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Ajouter un mot au dictionnaire personnalisé</span>

1. Clic droit sur le mot souligné à tort en rouge (par exemple "Fondasyon", du scénario d'ouverture).
2. Clique sur **"Ajouter au dictionnaire"**.
3. Le mot n'est désormais plus jamais souligné, dans **aucun** document ouvert sur ce poste — le dictionnaire personnalisé est global à l'installation, pas propre à un seul fichier.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le dictionnaire personnalisé est particulièrement utile pour les noms propres récurrents (noms d'organisations, de personnes, de lieux haïtiens comme "Pignon" ou "Gros-Morne"), le jargon technique d'un métier, ou des mots créoles insérés ponctuellement dans un document par ailleurs rédigé en français. Y ajouter un mot une seule fois évite de devoir l'ignorer manuellement à chaque nouvelle occurrence, dans chaque nouveau document.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Hôpital</span>
Un service administratif hospitalier ajoute au dictionnaire personnalisé la terminologie médicale et pharmaceutique récurrente dans ses comptes rendus, évitant que chaque terme technique légitime (souvent long et absent du dictionnaire français standard) ne soit signalé comme fautif à chaque relecture.
</div>

## 8.5 L'Éditeur : au-delà de l'orthographe

Le volet **Éditeur**, aperçu en section 8.2, propose des catégories d'amélioration au-delà de la simple correction :

| Catégorie | Ce qu'elle détecte |
|---|---|
| Orthographe | Fautes de frappe et mots absents du dictionnaire |
| Grammaire | Accords, conjugaisons, structure de phrase |
| Clarté | Phrases ambiguës ou trop complexes à décoder |
| Concision | Formulations redondantes ou inutilement longues |
| Formalité | Registre de langue incohérent avec un document professionnel |
| Vocabulaire | Répétitions rapprochées d'un même mot, suggestions de synonymes |

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Université</span>
Un étudiant rédigeant un mémoire académique (Partie 13, projet 2) utilise l'onglet "Concision" et "Vocabulaire" de l'Éditeur pour repérer les répétitions rapprochées d'un même terme technique, un défaut fréquent en rédaction académique de première version, avant une relecture par le directeur de mémoire.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — l'Éditeur propose, il ne décide pas</span>
Les suggestions de Clarté, Concision et Formalité restent des propositions stylistiques, pas des règles absolues comme l'orthographe. Un style volontairement plus formel ou plus direct qu'une suggestion peut rester un choix légitime de l'auteur — contrairement à une faute d'orthographe, jamais du domaine du "choix de style".
</div>

## 8.6 Statistiques de lisibilité

Une fois une vérification complète terminée (section 8.2), Word peut afficher des **statistiques de lisibilité**, incluant un score basé sur des formules linguistiques reconnues (adaptées de l'indice de Flesch).

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Activer et consulter les statistiques de lisibilité</span>

1. **Fichier > Options > Vérification**, coche **"Afficher les statistiques de lisibilité"**, puis **OK**.
2. Lance une vérification complète (`F7`, section 8.2) et termine-la entièrement (jusqu'au message "La vérification est terminée").
3. Une fenêtre affiche automatiquement des statistiques (nombre de mots, phrases par paragraphe, mots par phrase) suivies d'un **score de facilité de lecture** sur 100 et d'un **niveau scolaire** approximatif nécessaire pour comprendre aisément le texte.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un score de facilité de lecture élevé (proche de 100) indique un texte simple à lire ; un score bas indique des phrases longues et complexes. Pour un rapport destiné à un large public non spécialisé (comme un bailleur de fonds international, scénario d'ouverture du chapitre 1), viser un score plus élevé améliore concrètement la compréhension et l'impact du document — un critère de qualité rédactionnelle mesurable, pas seulement une impression subjective.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Réduire la complexité d'un paragraphe mesurée par le score</span>
Rédige un paragraphe d'environ 100 mots sur un sujet de ton choix, en phrases volontairement longues et complexes. Note son score de facilité de lecture (section 8.6). Réécris ensuite ce même paragraphe en simplifiant les phrases (les raccourcissant, réduisant les subordonnées imbriquées), sans en changer le sens. Compare les deux scores obtenus et explique par écrit les modifications concrètes qui ont fait progresser le score.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Accepter une suggestion de correction sans la lire</span>
Cliquer trop vite sur la première suggestion d'un clic droit peut remplacer un mot par un autre au sens totalement différent (un nom propre mal orthographié "corrigé" en un mot commun proche visuellement) — toujours lire la suggestion avant de valider, en particulier pour des noms propres.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Désactiver toute la correction automatique à cause d'un seul comportement gênant</span>
Un seul remplacement automatique indésirable (comme les majuscules d'exposant du scénario d'ouverture) pousse parfois à désactiver entièrement la correction automatique en Fichier > Options, perdant au passage tous les bénéfices des autres corrections utiles. La section 8.3 permet de décocher précisément le seul comportement gênant.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ajouter au dictionnaire une faute réelle par clic accidentel</span>
Cliquer par erreur sur "Ajouter au dictionnaire" pour un mot réellement mal orthographié (plutôt que "Ignorer") l'empêche définitivement d'être signalé à l'avenir, y compris dans d'autres documents. La correction se fait manuellement via Fichier > Options > Vérification > "Dictionnaires personnalisés" > Modifier la liste des mots, en supprimant l'entrée erronée.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : aucun soulignement n'apparaît, même sur un texte manifestement fautif</span>

- **Diagnostic** : la vérification automatique en cours de frappe est désactivée, ou la portion de texte est marquée en langue "Ne pas vérifier l'orthographe et la grammaire".
- **Résolution** : Fichier > Options > Vérification, vérifier que "Vérifier l'orthographe au cours de la frappe" et "Vérifier la grammaire au cours de la frappe" sont cochées ; sinon, vérifier la langue de vérification de la sélection concernée (Révision > Langue).
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un mot légitime est souligné à chaque nouveau document</span>

- **Diagnostic** : ce mot n'a jamais été ajouté au dictionnaire personnalisé, contrairement à une occurrence isolée simplement "ignorée" dans un document précédent.
- **Résolution** : utiliser explicitement "Ajouter au dictionnaire" (section 8.4) plutôt que "Ignorer tout", qui ne s'applique qu'au document actif.
</div>

## En entreprise

- **Bonne pratique répandue** : constituer et partager un dictionnaire personnalisé d'équipe (noms de clients, jargon métier) pour toute une organisation, plutôt que chaque employé ne reconstruise le sien isolément.
- **Bonne pratique répandue** : systématiser `F7` avant tout envoi de document externe important, en complément (jamais en remplacement) d'une relecture humaine sur le fond.
- **Erreur classique observée** : une correction automatique mal maîtrisée qui transforme silencieusement une abréviation professionnelle voulue en un mot différent, découverte seulement après diffusion du document.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — exporter son dictionnaire personnalisé vers un autre poste</span>
Fichier > Options > Vérification > Dictionnaires personnalisés > Modifier la liste des mots permet d'exporter la liste sous forme de fichier texte simple, réimportable sur un autre poste — utile pour transférer rapidement un vocabulaire métier accumulé sur plusieurs mois vers un nouvel ordinateur ou un collègue partageant le même contexte professionnel.
</div>

## Résumé du chapitre

- Les soulignés rouges (orthographe) et bleus (grammaire) sont des indications à l'écran uniquement, jamais imprimées, et ne garantissent pas la justesse du sens d'une phrase.
- `F7` (ou Révision > Grammaire et orthographe) ouvre le volet Éditeur pour une vérification complète et systématique du document.
- La correction automatique (Fichier > Options > Vérification > Options de correction automatique) se personnalise finement : remplacements de frappe personnalisés, désactivation ciblée d'un comportement gênant sans tout désactiver.
- Le dictionnaire personnalisé élimine durablement les faux positifs sur des noms propres ou du jargon métier récurrent, contrairement à "Ignorer tout" qui ne vaut que pour un seul document.
- L'Éditeur va au-delà de l'orthographe (clarté, concision, formalité, vocabulaire) sans jamais imposer ses suggestions comme des règles absolues.
- Les statistiques de lisibilité donnent un score objectif de facilité de lecture, utile pour adapter un texte à son public réel.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un mot souligné en rouge ondulé signale :
   - a) Une faute de grammaire
   - b) Un mot probablement mal orthographié ou absent du dictionnaire
   - c) Un problème de mise en page
   - d) Un lien hypertexte

2. Pour ajouter durablement un nom propre au vocabulaire reconnu par Word, sans qu'il soit signalé dans aucun futur document, il faut :
   - a) Cliquer sur "Ignorer" une seule fois
   - b) Cliquer sur "Ignorer tout"
   - c) Cliquer sur "Ajouter au dictionnaire"
   - d) Changer la langue du document

3. Le raccourci pour lancer une vérification complète d'orthographe et de grammaire est :
   - a) `Ctrl+F7`
   - b) `F7`
   - c) `Alt+F7`
   - d) `Ctrl+Maj+F7`

**Corrigé** : 1-b, 2-c, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Les soulignés rouges et bleus s'impriment sur le document final. — **Faux**, ils ne sont visibles qu'à l'écran.
2. L'Éditeur de Word ne détecte que les fautes d'orthographe. — **Faux** (il couvre aussi grammaire, clarté, concision, formalité, vocabulaire).
3. Un score de lisibilité élevé indique un texte plus difficile à lire. — **Faux** (un score élevé indique un texte plus facile à lire).
4. La correction automatique peut être personnalisée avec des remplacements de frappe propres à l'utilisateur. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi l'absence de soulignement rouge ou bleu sur une phrase ne garantit pas que celle-ci a le sens voulu par son auteur.
2. Un collègue désactive entièrement la correction automatique de Word parce qu'un seul comportement (les majuscules automatiques d'un sigle) le gênait. Que lui conseilles-tu à la place ?

**Corrigé 1** : le correcteur détecte des anomalies orthographiques et grammaticales structurelles, mais ne comprend pas le sens réel voulu par l'auteur. Un mot correctement orthographié mais substitué par erreur à un homophone (par exemple "maire" pour "mère") reste indétectable par ce mécanisme, puisque les deux mots existent légitimement dans le dictionnaire.

**Corrigé 2** : plutôt que de désactiver toute la correction automatique, il vaut mieux se rendre dans Fichier > Options > Vérification > Options de correction automatique et décocher précisément le comportement gênant (par exemple "Corriger les deux premières majuscules d'un mot") — cela conserve tous les autres bénéfices de la correction automatique tout en éliminant la seule friction identifiée.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Tape volontairement trois fautes différentes dans un document de test : une faute d'orthographe simple, un accord grammatical incorrect, et un mot légitime mais absent du dictionnaire (un nom propre de ton choix). Utilise `F7` pour traiter les trois différemment : corrige la première, ignore la deuxième, ajoute la troisième au dictionnaire.
</div>

**Corrigé :** réussi si les trois cas sont traités distinctement, et si une nouvelle vérification confirme que le nom propre ajouté au dictionnaire n'est plus signalé, y compris dans un nouveau document vierge.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.2</span>

Crée un remplacement de correction automatique personnalisé pour ta propre signature professionnelle complète (nom, titre, organisation) associée à un raccourci court de ton choix. Teste-le dans un nouveau document.
</div>

**Corrigé :** réponse personnelle ; réussi si le raccourci choisi déclenche bien le remplacement automatique complet après une frappe suivie d'un espace ou d'un signe de ponctuation.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais interpréter les soulignés rouges et bleus sans les confondre.</li>
<li>☐ Je sais lancer et mener à terme une vérification complète avec `F7`.</li>
<li>☐ J'ai créé au moins un remplacement de correction automatique personnalisé.</li>
<li>☐ Je sais ajouter un mot légitime au dictionnaire personnalisé plutôt que de l'ignorer à répétition.</li>
<li>☐ Je connais les catégories couvertes par l'Éditeur au-delà de l'orthographe.</li>
<li>☐ Je sais consulter et interpréter un score de lisibilité.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Souligné rouge** = orthographe/mot inconnu ; **souligné bleu** = grammaire/style — jamais imprimés.
- **`F7`** = vérification complète via le volet Éditeur.
- **Ignorer tout** = valable pour ce document seulement ; **Ajouter au dictionnaire** = valable pour toute future utilisation de Word sur ce poste.
- **Correction automatique personnalisée** = Fichier > Options > Vérification > Options de correction automatique.
- **Score de lisibilité** = plus il est élevé, plus le texte est facile à lire.

**Raccourci clavier de ce chapitre** :
- `F7` : vérification orthographe et grammaire complète.
</div>

## FAQ

<dl class="faq">
<dt>Le correcteur de Word détecte-t-il aussi bien le créole haïtien que le français ?</dt>
<dd>Non par défaut : le créole haïtien n'est généralement pas disponible comme langue de vérification native dans Word. Les mots créoles insérés dans un document par ailleurs en français seront signalés comme fautifs, sauf ajout individuel au dictionnaire personnalisé (section 8.4) ou définition explicite d'une portion en "Ne pas vérifier l'orthographe" si le volume de texte créole est important.</dd>

<dt>Le score de lisibilité est-il fiable pour tous les types de texte ?</dt>
<dd>Il reste une estimation statistique basée sur la longueur des mots et des phrases, pas une évaluation complète du sens ou de la pertinence du contenu. Un texte technique légitimement complexe (juridique, scientifique) peut afficher un score bas sans que cela signale un défaut de rédaction.</dd>

<dt>L'Éditeur de Word fonctionne-t-il hors ligne ?</dt>
<dd>Les fonctionnalités de base (orthographe, grammaire) fonctionnent hors ligne. Certaines suggestions avancées de l'Éditeur (reformulations, certaines vérifications de clarté) nécessitent une connexion Internet active et un compte Microsoft 365 connecté.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur l'Éditeur de Word : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Formule de calcul de l'indice de facilité de lecture de Flesch (référence linguistique utilisée par Word) : disponible dans la documentation Microsoft sur les statistiques de lisibilité.

*Chapitre suivant : mise en forme des caractères — pour amorcer la Partie 3 de ce manuel et donner à un texte désormais correctement orthographié une présentation visuelle à la hauteur de son contenu.*
