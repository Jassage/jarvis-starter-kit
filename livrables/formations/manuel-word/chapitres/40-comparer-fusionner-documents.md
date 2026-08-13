<div class="chapitre-titre-num">CHAPITRE 40</div>

# Comparer et fusionner des documents

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : comparer deux versions d'un même document pour reconstituer automatiquement les différences entre elles, même si le suivi des modifications n'a jamais été activé ; interpréter le document combiné généré par cette comparaison ; et combiner les modifications indépendantes de plusieurs réviseurs ayant chacun travaillé sur leur propre copie du même document original, sans coédition en temps réel.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Comparer et combiner plusieurs documents | MO-101 Word Expert — Manage Document Options and Settings | 1.1.3 |

**Prérequis** : chapitre 38 (suivi des modifications), dont ce chapitre reconstitue l'équivalent après coup quand il n'a pas été utilisé dès le départ.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
La trésorière découvre que la secrétaire a modifié le rapport annuel directement, sans avoir activé le suivi des modifications (chapitre 38) — un oubli malheureux qui rend impossible de savoir précisément ce qui a changé entre les deux versions. Par ailleurs, deux autres bénévoles ont chacun, séparément et sans se concerter, apporté des corrections sur leur propre copie du même document original. Ta responsable te demande de reconstituer les différences dans le premier cas, et de combiner les deux copies indépendantes dans le second. Ce chapitre couvre les deux besoins.
</div>

## 40.1 Comparer deux versions d'un document

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
La fonctionnalité <strong>Comparer</strong> analyse deux fichiers `.docx` distincts (un document "original" et un document "révisé") et génère automatiquement un troisième document affichant leurs différences sous forme de marques de révision — exactement comme si le suivi des modifications avait été activé depuis le début, reconstitué après coup à partir de la seule comparaison des deux fichiers.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 124 — Reconstituer les modifications de la secrétaire</span>

**Objectif** : répondre à la première demande de la mise en situation, sans que le suivi des modifications n'ait été activé lors de la relecture.

**Préparation** : dispose de deux fichiers de test — "Rapport_Original.docx" (la version de la trésorière) et "Rapport_Secretaire.docx" (la version modifiée directement, sans suivi).

**Étapes détaillées** :
1. Onglet **Révision**, groupe Comparer, clique sur **Comparer**, puis **"Comparer..."** dans le menu déroulant.
2. Sous **"Document original"**, sélectionne "Rapport_Original.docx" ; sous **"Document révisé"**, sélectionne "Rapport_Secretaire.docx".
3. Clique sur **"Plus >>"** pour afficher les options avancées : coche ou décoche les types de différences à détecter (insertions/suppressions, mise en forme, en-têtes/pieds de page, commentaires...) selon le niveau de détail souhaité.
4. Clique sur **OK** : Word génère un **nouveau document** affichant automatiquement toutes les différences entre les deux fichiers, sous forme de marques de révision identiques à celles du suivi des modifications (chapitre 38) — insertions soulignées, suppressions barrées.

**Résultat attendu** : un document tiers reconstituant précisément ce qui a changé entre les deux versions, exploitable exactement comme un document relu sous suivi actif (accepter/rejeter chaque modification, chapitre 38).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.3 Compare and combine multiple documents (MO-101 Expert), première partie</span>
L'atelier 124 correspond à cet objectif pour la partie "comparer". **Recommandation** : par défaut, Word affiche aussi les documents original et révisé côte à côte du document combiné, dans des volets séparés — une vue triple utile pour vérifier visuellement la cohérence du résultat généré.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel</span>
Un cabinet juridique recevant deux versions successives d'un contrat de la part d'un client, sans savoir précisément ce qui a changé entre les deux, utilise la fonction Comparer pour reconstituer automatiquement les modifications avant d'accepter formellement la nouvelle version — une garantie de ne manquer aucune clause modifiée, même mineure.
</div>

## 40.2 Combiner les modifications de plusieurs réviseurs

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la distinction avec la section 40.1</span>
Là où <strong>Comparer</strong> analyse deux versions d'un document pour révéler leurs différences, <strong>Combiner</strong> répond à un besoin différent : réunir en un seul document les modifications indépendantes apportées par <strong>plusieurs personnes</strong> ayant chacune travaillé séparément sur sa propre copie du même document original — un scénario fréquent quand la coédition en temps réel (chapitre 41) n'était pas disponible ou n'a pas été utilisée.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 125 — Combiner les corrections des deux bénévoles</span>

**Objectif** : répondre à la seconde demande de la mise en situation d'ouverture.

**Préparation** : dispose de trois fichiers — "Rapport_Original.docx", "Rapport_Benevole1.docx" et "Rapport_Benevole2.docx", chacun modifié indépendamment à partir de l'original.

**Étapes détaillées** :
1. Onglet Révision, Comparer, choisis cette fois **"Combiner..."**.
2. Sous "Document original", sélectionne "Rapport_Original.docx" ; sous "Document révisé", sélectionne "Rapport_Benevole1.docx". Valide avec OK : un premier document combiné apparaît, avec les modifications du bénévole 1 sous forme de marques de révision attribuées à son nom.
3. Relance Comparer > Combiner une seconde fois, cette fois avec "Document original" pointant vers le document combiné obtenu à l'étape précédente, et "Document révisé" vers "Rapport_Benevole2.docx".
4. Le document final combine les modifications des **deux** bénévoles, chacune correctement attribuée à son auteur respectif (comme au chapitre 38, avec le nom et l'horodatage au survol de chaque marque).

**Résultat attendu** : un seul document réunissant les contributions indépendantes des deux bénévoles, prêt pour un examen méthodique via les techniques du chapitre 38 (parcourir, accepter, rejeter chaque modification).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.1.3 Compare and combine multiple documents (MO-101 Expert), deuxième partie</span>
L'atelier 125 correspond à cet objectif pour la partie "combiner". **Piège fréquent en examen** : combiner plus de deux documents nécessite de répéter l'opération par paires successives (comme dans cet atelier), et non une seule opération englobant directement trois fichiers ou plus en une fois.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — un résultat parfois complexe à démêler</span>
Si les deux bénévoles ont modifié exactement le même passage de façon différente, le document combiné affichera les deux modifications concurrentes côte à côte, nécessitant un arbitrage humain (accepter l'une, rejeter l'autre) — la fonctionnalité Combiner ne résout jamais automatiquement un conflit de fond entre deux modifications contradictoires, elle se contente de les rassembler visiblement pour un arbitrage ultérieur.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reconstituer un historique de révisions complet</span>
Crée un document original de test, puis trois copies modifiées indépendamment (simulant trois collègues différents, en changeant le nom d'utilisateur entre chaque copie, chapitre 38). Combine les trois versions par paires successives en un seul document final, puis utilise les techniques du chapitre 38 pour accepter ou rejeter chaque modification, en résolvant les éventuels conflits entre les trois contributeurs.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre Comparer et Combiner</span>
Comme signalé en section 40.2, Comparer répond à "qu'est-ce qui a changé entre ces deux versions ?" tandis que Combiner répond à "comment réunir les contributions de plusieurs personnes ?" — deux besoins différents malgré leur emplacement voisin dans le même menu déroulant.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Tenter de combiner plus de deux documents en une seule opération</span>
Comme signalé dans l'atelier 125, chaque opération Combiner ne traite que deux fichiers à la fois — combiner trois contributions ou plus nécessite de répéter l'opération successivement, chaque résultat intermédiaire servant de "document original" pour l'étape suivante.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ignorer un conflit de modification concurrente sans arbitrage</span>
Comme signalé en section 40.2, accepter automatiquement toutes les modifications d'un document combiné sans examiner les conflits entre contributeurs peut produire un texte final incohérent, mêlant deux versions contradictoires d'un même passage sans qu'aucun choix explicite n'ait été fait.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le document combiné affiche des modifications qui semblent dupliquées</span>

- **Diagnostic** : une même correction a peut-être été apportée indépendamment par deux réviseurs différents sur le même passage, ce qui n'est pas une erreur de la fonctionnalité Combiner mais un reflet fidèle d'une coïncidence réelle entre les deux contributions.
- **Résolution** : examiner chaque modification concernée via les techniques du chapitre 38, en acceptant l'une et en rejetant l'autre si elles sont effectivement redondantes.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la comparaison ne détecte aucune différence entre deux fichiers pourtant différents</span>

- **Diagnostic** : les deux fichiers sélectionnés dans la boîte de dialogue sont peut-être identiques par erreur (le mauvais fichier a été sélectionné pour l'un des deux champs).
- **Résolution** : vérifier attentivement les noms de fichiers exacts sélectionnés sous "Document original" et "Document révisé" avant de relancer la comparaison.
</div>

## En entreprise

- **Bonne pratique répandue** : privilégier le suivi des modifications activé dès le départ (chapitre 38) ou la coédition en temps réel (chapitre 41) plutôt que de compter systématiquement sur Comparer/Combiner comme solution de rattrapage — ces deux fonctionnalités restent des filets de sécurité, pas une méthode de travail à privilégier par défaut.
- **Bonne pratique répandue** : nommer clairement chaque copie de travail (avec le nom du contributeur et une date) avant toute opération de combinaison, pour éviter toute confusion sur l'ordre et l'origine des fichiers à traiter.
- **Erreur classique observée** : des équipes qui perdent un temps considérable à reconstituer manuellement des différences entre versions faute d'avoir utilisé Comparer, alors que cette fonctionnalité aurait résolu le problème en quelques clics.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — personnaliser les éléments comparés</span>
Le bouton "Plus >>" de la boîte de dialogue Comparer (section 40.1) permet de désactiver la détection de certains types de différences (par exemple, ignorer les changements de mise en forme pour ne se concentrer que sur les modifications de texte) — un réglage utile quand une mise en forme différente entre deux versions est normale et attendue (documents provenant de deux modèles différents, par exemple) et ne doit pas polluer l'analyse des différences de contenu réellement pertinentes.
</div>

## Résumé du chapitre

- Comparer analyse deux versions d'un même document et génère un document tiers avec des marques de révision équivalentes à celles du suivi des modifications, même s'il n'a jamais été activé.
- Combiner réunit les modifications indépendantes de plusieurs contributeurs ayant chacun travaillé sur sa propre copie du même original, une paire de fichiers à la fois, à répéter pour plus de deux contributeurs.
- Ces deux fonctionnalités restent des solutions de rattrapage, moins fiables en pratique que le suivi des modifications activé dès le départ ou la coédition en temps réel.
- Un conflit entre deux modifications concurrentes sur un même passage nécessite toujours un arbitrage humain explicite, jamais résolu automatiquement.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La fonctionnalité Comparer sert à :
   - a) Fusionner plusieurs formats de fichiers en un seul
   - b) Révéler les différences entre deux versions d'un même document
   - c) Traduire un document dans une autre langue
   - d) Compresser des images

2. Combiner plus de deux documents nécessite :
   - a) Une seule opération englobant tous les fichiers
   - b) De répéter l'opération par paires successives
   - c) D'utiliser exclusivement Word Online
   - d) De désactiver le suivi des modifications au préalable

3. Un conflit entre deux modifications concurrentes sur un même passage est résolu :
   - a) Automatiquement par Word, sans intervention
   - b) Par un arbitrage humain explicite
   - c) En supprimant les deux modifications
   - d) Uniquement en recommençant tout le document

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Comparer nécessite que le suivi des modifications ait été activé au préalable sur l'un des deux documents. — **Faux**, la reconstitution se fait sans ce prérequis.
2. Combiner peut traiter directement trois documents ou plus en une seule opération. — **Faux**, deux à la fois seulement.
3. Le document généré par Comparer utilise les mêmes marques de révision que le suivi des modifications. — **Vrai**.
4. Un conflit de modification concurrente empêche totalement d'utiliser Combiner. — **Faux**, le conflit reste visible pour arbitrage, sans bloquer la fonctionnalité.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique la différence entre Comparer et Combiner, avec un exemple de situation où chacun serait l'outil approprié.
2. Une équipe reçoit trois copies indépendantes d'un même document, modifiées séparément par trois personnes différentes. Décris la méthode pour les réunir en un seul document final.

**Corrigé 1** : Comparer répond au besoin "je veux savoir ce qui a changé entre deux versions précises d'un document" (par exemple, un contrat révisé par un client sans suivi des modifications activé) ; Combiner répond au besoin "je veux réunir les contributions indépendantes de plusieurs personnes ayant chacune travaillé séparément sur le même document original" (par exemple, trois collègues ayant chacun annoté leur propre copie d'un même rapport).

**Corrigé 2** : combiner d'abord la copie du premier contributeur avec l'original via Comparer > Combiner, obtenant un document intermédiaire ; combiner ensuite ce document intermédiaire avec la copie du deuxième contributeur ; combiner enfin ce nouveau résultat avec la copie du troisième contributeur — trois opérations successives par paires, jamais une seule opération englobant directement les quatre fichiers (original + trois copies) à la fois.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.1</span>

Crée un document original de test, duplique-le, modifie la copie sans activer le suivi des modifications (trois changements distincts), puis utilise Comparer pour reconstituer ces trois modifications sous forme de marques de révision.
</div>

**Corrigé :** réussi si le document combiné généré affiche bien les trois modifications sous forme de marques de révision classiques (insertions soulignées, suppressions barrées), exploitables exactement comme au chapitre 38.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.2</span>

Crée deux copies indépendantes d'un même document original, modifiées différemment chacune, puis combine-les en un seul document final via Comparer > Combiner. Vérifie que les modifications des deux copies apparaissent bien, correctement attribuées.
</div>

**Corrigé :** réponse personnelle ; réussi si le document final combiné affiche bien les modifications des deux copies, chacune attribuée au bon nom d'utilisateur au survol de la marque de révision correspondante.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je compare deux versions d'un document pour reconstituer leurs différences.</li>
<li>☐ J'interprète le document combiné généré par une comparaison.</li>
<li>☐ Je combine les modifications de plusieurs contributeurs par paires successives.</li>
<li>☐ Je sais arbitrer manuellement un conflit entre deux modifications concurrentes.</li>
<li>☐ Je distingue clairement Comparer de Combiner selon le besoin réel.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Comparer** = différences entre deux versions ; **Combiner** = réunir les contributions de plusieurs personnes — MOS Expert 1.1.3.
- **Combiner** = toujours par paires, jamais plus de deux fichiers en une seule opération.
- **Conflit de modification** = toujours un arbitrage humain, jamais résolu automatiquement.
- Ces deux fonctionnalités restent des solutions de rattrapage, à privilégier moins que le suivi des modifications actif dès le départ (chapitre 38) ou la coédition en temps réel (chapitre 41).

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Révision, groupe Comparer.
</div>

## FAQ

<dl class="faq">
<dt>Le document combiné généré remplace-t-il les fichiers originaux ?</dt>
<dd>Non, Comparer et Combiner génèrent toujours un nouveau document distinct, laissant les fichiers sources intacts et inchangés — un principe similaire à l'ouverture d'un modèle via Fichier > Nouveau (chapitre 5).</dd>

<dt>Peut-on comparer un document Word à un fichier PDF ?</dt>
<dd>Non directement, Comparer fonctionne uniquement entre deux documents Word ; un PDF devrait d'abord être converti ou son contenu importé dans un document Word avant toute comparaison significative.</dd>

<dt>La fonctionnalité Combiner attribue-t-elle correctement chaque modification à son véritable auteur ?</dt>
<dd>Oui, à condition que le nom d'utilisateur (Fichier > Options > Général, chapitre 38) ait été correctement configuré sur chaque poste au moment de la création de chaque copie modifiée.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la comparaison et la combinaison de documents : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Suivi des modifications, la méthode à privilégier en amont : chapitre 38.

*Chapitre suivant : coauteur en temps réel — pour clore la Partie 10 avec l'alternative moderne à la comparaison après coup, où plusieurs personnes travaillent simultanément sur un même document sans jamais avoir besoin de fichiers séparés à combiner.*
