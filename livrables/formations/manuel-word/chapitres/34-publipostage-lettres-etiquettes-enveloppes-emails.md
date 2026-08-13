<div class="chapitre-titre-num">CHAPITRE 34</div>

# Publipostage : lettres, étiquettes, enveloppes, e-mails

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : comprendre le principe du publipostage comme fusion d'un document type et d'une source de données ; gérer une liste de destinataires, y compris la trier, la filtrer et en exclure certains ; insérer des champs de fusion dans un document, y compris un bloc d'adresse et une ligne de salutation ; prévisualiser les résultats de la fusion avant de la finaliser ; et terminer une fusion en imprimant des documents individuels, en générant des étiquettes, des enveloppes, ou en envoyant directement des e-mails personnalisés.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Gérer les listes de destinataires | MO-101 Word Expert — Use Advanced Word Features | 4.3.1 |
| Insérer des champs fusionnés | MO-101 Word Expert — Use Advanced Word Features | 4.3.2 |
| Prévisualiser les résultats de la fusion | MO-101 Word Expert — Use Advanced Word Features | 4.3.3 |
| Créer des documents fusionnés, étiquettes et enveloppes | MO-101 Word Expert — Use Advanced Word Features | 4.3.4 |

Ce chapitre ouvre la Partie 9 et couvre l'intégralité du sous-domaine MOS Expert **4.3 Perform mail merges**.

**Prérequis** : chapitre 7 (rechercher-remplacer, pour bien distinguer un champ de fusion d'un simple texte à remplacer manuellement).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'ONG doit envoyer une lettre de remerciement personnalisée à 200 donateurs, chacun avec son nom, son montant de don et une ligne de salutation adaptée à son titre de civilité. Un bénévole propose de créer 200 copies du document et de remplacer manuellement le nom et le montant dans chacune — une tâche qui prendrait des heures et multiplierait les risques d'erreur. Ce chapitre montre comment produire ces 200 lettres personnalisées en quelques minutes, à partir d'un seul document type et d'une seule liste de donateurs.
</div>

## 34.1 Le principe du publipostage

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le <strong>publipostage</strong> combine deux éléments distincts : un <strong>document principal</strong> (la lettre type, avec sa mise en forme et son texte commun à tous les destinataires) et une <strong>source de données</strong> (une liste structurée — souvent un tableau Excel — contenant les informations propres à chaque destinataire : nom, adresse, montant). La fusion des deux produit un document final personnalisé pour chaque ligne de la source de données, sans jamais dupliquer manuellement le document type.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le document principal est comme un formulaire imprimé avec des espaces vides à remplir ; la source de données est comme un registre listant, ligne par ligne, les informations de chaque personne à qui ce formulaire doit être adressé. Le publipostage automatise exactement le travail qu'un employé ferait en recopiant, à la main, chaque ligne du registre dans un nouvel exemplaire du formulaire.
</div>

## 34.2 Démarrer la fusion et gérer la liste de destinataires

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 103 — Préparer la lettre type et la liste des donateurs</span>

**Objectif** : poser les bases du publipostage demandé dans la mise en situation.

**Préparation** : prépare (ou imagine) un classeur Excel de test avec des colonnes "Civilité", "Nom", "Prénom", "Montant" et une dizaine de lignes de donateurs fictifs.

**Étapes détaillées** :
1. Ouvre un nouveau document Word, rédige le corps de la lettre de remerciement en laissant les zones personnalisées vides pour l'instant.
2. Onglet **Publipostage**, groupe Démarrer la fusion et publipostage, clique sur **Démarrer la fusion et le publipostage**, choisis **"Lettres"**.
3. Clique sur **Sélectionner les destinataires**, puis **"Utiliser une liste existante..."**, navigue jusqu'au classeur Excel préparé, sélectionne la feuille contenant les données.
4. Clique sur **"Modifier la liste de destinataires"** : une boîte de dialogue affiche chaque ligne du classeur sous forme de tableau, avec une case à cocher devant chaque destinataire — décoche, par exemple, un donateur ayant demandé à ne plus recevoir de courrier, sans modifier le fichier Excel source lui-même.
5. Dans la même boîte de dialogue, clique sur l'en-tête de la colonne "Montant" pour **trier** la liste par ordre croissant ou décroissant, ou utilise la flèche de filtre pour n'afficher que les donateurs d'une catégorie précise.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.3.1 Manage recipient lists (MO-101 Expert)</span>
L'atelier 103 correspond exactement à cet objectif. **Recommandation** : bien distinguer décocher un destinataire (l'exclut de cette fusion précise, sans toucher au fichier source) et le supprimer du fichier Excel lui-même (une modification permanente, à ne faire que si le destinataire doit être définitivement retiré).
</div>

## 34.3 Insérer des champs de fusion

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 104 — Personnaliser la lettre avec les données des donateurs</span>

**Objectif** : insérer les emplacements qui seront remplacés par les informations propres à chaque destinataire.

**Préparation** : reprends le document de l'atelier 103, source de données déjà connectée.

**Étapes détaillées** :
1. Place le point d'insertion en haut de la lettre, onglet Publipostage, groupe Champs d'écriture et d'insertion, clique sur **Bloc d'adresse** : une boîte de dialogue propose un aperçu et plusieurs formats (avec ou sans nom d'entreprise, format du nom) ; choisis celui adapté, clique sur **OK** — un champ `«AddressBlock»` s'insère.
2. Un peu plus bas, clique sur **Ligne de salutation** : choisis le format ("Cher/Chère" suivi du prénom, par exemple), et surtout la formule de repli à utiliser **"si le nom du destinataire est invalide"** (par exemple "Cher(ère) Ami(e)") pour les lignes de données incomplètes.
3. Dans le corps du texte, à l'endroit où le montant doit apparaître, clique sur **Insérer un champ de fusion**, choisis **"Montant"** dans la liste déroulante (qui reprend exactement les noms de colonnes du classeur Excel source) : le champ `«Montant»` s'insère à cet endroit précis.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.3.2 Insert merged fields (MO-101 Expert)</span>
L'atelier 104 correspond exactement à cet objectif. **Piège fréquent** : "Bloc d'adresse" et "Ligne de salutation" sont des champs composites préconfigurés (combinant plusieurs colonnes automatiquement) — "Insérer un champ de fusion" reste nécessaire pour toute donnée individuelle ne rentrant pas dans ces deux formats prédéfinis, comme le montant dans cet exemple.
</div>

## 34.4 Prévisualiser les résultats de la fusion

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 105 — Vérifier la lettre avant l'envoi de masse</span>

**Objectif** : s'assurer que la personnalisation fonctionne correctement avant de produire les 200 lettres réelles.

**Préparation** : reprends le document des ateliers précédents, avec ses champs de fusion en place.

**Étapes détaillées** :
1. Onglet Publipostage, groupe Aperçu des résultats, clique sur **Aperçu des résultats** : les champs `«AddressBlock»`, `«GreetingLine»` et `«Montant»` sont remplacés par les données réelles du premier destinataire de la liste.
2. Utilise les flèches **"Enregistrement suivant"** / **"Enregistrement précédent"** pour parcourir plusieurs destinataires et vérifier que chacun s'affiche correctement, y compris les cas particuliers (un nom très long, une civilité manquante testant la formule de repli de la ligne de salutation).
3. Clique sur **"Rechercher un destinataire..."** pour vérifier directement un donateur précis par son nom, sans faire défiler toute la liste un par un.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.3.3 Preview merge results (MO-101 Expert)</span>
L'atelier 105 correspond exactement à cet objectif. **Bonne pratique associée** : toujours prévisualiser au moins trois ou quatre destinataires différents, en particulier ceux dont les données pourraient être incomplètes, avant de lancer une fusion finale sur une liste de plusieurs centaines de destinataires.
</div>

## 34.5 Terminer la fusion

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 106 — Produire les 200 lettres personnalisées</span>

**Objectif** : finaliser le publipostage de la mise en situation d'ouverture.

**Préparation** : reprends le document validé à l'atelier 105.

**Étapes détaillées** :
1. Onglet Publipostage, groupe Terminer, clique sur **Terminer et fusionner**.
2. Trois options principales s'offrent : **"Modifier des documents individuels..."** (génère un nouveau document Word unique contenant toutes les lettres personnalisées, une par destinataire, modifiable avant impression), **"Imprimer des documents..."** (envoie directement à l'imprimante sans document intermédiaire), et **"Envoyer des messages électroniques..."** (nécessite une colonne d'adresses e-mail dans la source de données et un client de messagerie configuré, pour un envoi direct personnalisé par e-mail plutôt qu'un courrier papier).
3. Choisis **"Modifier des documents individuels..."**, sélectionne "Tous" les destinataires (ou une plage précise), clique sur **OK** : un nouveau document s'ouvre, contenant les 200 lettres personnalisées à la suite, chacune sur ses propres pages.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.3.4 Create merged documents, labels, and envelopes (MO-101 Expert)</span>
L'atelier 106 correspond exactement à cet objectif pour les lettres fusionnées. **Recommandation** : "Modifier des documents individuels" est la méthode la plus sûre pour une relecture avant impression, contrairement à "Imprimer des documents" qui envoie directement sans étape de vérification intermédiaire.
</div>

## 34.6 Étiquettes et enveloppes

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Procédure — Générer des étiquettes d'adresse pour les mêmes donateurs</span>

1. Nouveau document, onglet Publipostage, Démarrer la fusion et le publipostage, choisis **"Étiquettes..."**.
2. Sélectionne le fournisseur et la référence exacte de la feuille d'étiquettes utilisée (par exemple Avery, avec un numéro de référence précis correspondant à la disposition physique des étiquettes sur la feuille) — un choix crucial pour que l'impression corresponde exactement aux étiquettes physiques.
3. Reconnecte la même source de données (atelier 103), insère un Bloc d'adresse sur la première étiquette, clique sur **"Mettre à jour toutes les étiquettes"** pour reproduire ce même champ sur toutes les étiquettes de la feuille.
4. Termine la fusion comme pour les lettres (section 34.5).
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Enveloppes</span>
Le principe est identique pour **"Enveloppes..."** dans le même menu Démarrer la fusion et le publipostage, avec un choix de format d'enveloppe (taille standard) plutôt qu'une référence de feuille d'étiquettes — utile pour imprimer directement l'adresse de chaque destinataire sur une enveloppe plutôt que sur une étiquette autocollante à apposer ensuite.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Collectivité</span>
Une administration communale envoyant un avis officiel à l'ensemble des foyers d'un quartier utilise le publipostage pour générer à la fois la lettre personnalisée et les enveloppes correspondantes à partir de la même liste d'adresses, garantissant une correspondance exacte entre chaque lettre et son enveloppe sans risque d'erreur d'appariement manuel.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Publipostage complet de bout en bout</span>
Reproduis intégralement le scénario de la mise en situation : crée une liste de test d'au moins huit destinataires fictifs (civilité, nom, montant), rédige une lettre type avec bloc d'adresse, ligne de salutation et montant personnalisé, prévisualise au moins trois destinataires différents, puis termine la fusion en générant le document final avec toutes les lettres. Génère ensuite les étiquettes correspondantes à partir de la même liste.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Modifier le fichier Excel source pendant une fusion déjà en cours</span>
Modifier et réenregistrer le classeur Excel source pendant que le document Word de fusion reste ouvert peut provoquer des incohérences si les colonnes ont changé de nom ou d'ordre — toujours fermer et rouvrir la connexion à la source de données après une modification structurelle du fichier Excel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier de prévisualiser plusieurs destinataires avant la fusion finale</span>
Comme signalé dans l'atelier 105, une prévisualisation limitée au seul premier destinataire peut manquer un problème visible uniquement sur un cas particulier (un nom très long qui déborde, une civilité manquante) présent plus loin dans la liste.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Choisir la mauvaise référence de feuille d'étiquettes</span>
Comme signalé en section 34.6, une référence de feuille d'étiquettes incorrecte produit un décalage progressif entre le texte imprimé et les étiquettes physiques réelles, un problème qui s'aggrave au fil de la page plutôt que de se limiter à la première étiquette.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les champs de fusion affichent des noms de colonnes au lieu des données réelles</span>

- **Diagnostic** : le mode Aperçu des résultats (section 34.4) n'est probablement pas activé, ou l'icône bascule entre "afficher les codes de champ" et "afficher les résultats" a été activée par erreur.
- **Résolution** : cliquer sur "Aperçu des résultats" pour basculer vers l'affichage des données réelles plutôt que des noms de champs.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la ligne de salutation affiche "Cher(ère) Invalide:LastName" pour certains destinataires</span>

- **Diagnostic** : la formule de repli n'a probablement pas été configurée correctement à l'atelier 104, ou certaines lignes de la source de données ont des champs de nom réellement vides ou mal orthographiés dans le fichier source.
- **Résolution** : revenir dans "Ligne de salutation" et vérifier le réglage "si le nom du destinataire est invalide", puis vérifier et corriger les données manquantes directement dans le fichier Excel source si nécessaire.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours conserver une copie de sauvegarde de la liste de destinataires avant toute modification (tri, filtre, exclusion) effectuée directement dans l'interface de publipostage.
- **Bonne pratique répandue** : tester une fusion sur un petit échantillon de deux ou trois destinataires réels avant de lancer l'impression ou l'envoi complet sur plusieurs centaines de personnes.
- **Erreur classique observée** : des campagnes de correspondance envoyées avec une ligne de salutation cassée ("Cher(ère) Invalide") pour une partie des destinataires, faute d'avoir vérifié la formule de repli avant l'envoi final.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — champs conditionnels dans une lettre de fusion</span>
Le groupe **Règles** de l'onglet Publipostage propose des champs conditionnels comme **"Si...Alors...Sinon..."**, permettant d'afficher un texte différent selon la valeur d'un champ — par exemple, un message de remerciement différent selon que le montant du don dépasse ou non un certain seuil, automatisant une personnalisation encore plus fine que le simple remplacement de valeurs.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — synthèse de ce chapitre pour l'examen</span>
Ce chapitre couvre l'intégralité du sous-domaine Expert **4.3 Perform mail merges**. **Recommandation** : bien connaître l'ordre logique des étapes (Démarrer la fusion → Sélectionner les destinataires → Insérer les champs → Aperçu des résultats → Terminer et fusionner), chacune correspondant à un groupe distinct et dans cet ordre sur l'onglet Publipostage du Ruban.
</div>

## Résumé du chapitre

- Le publipostage fusionne un document principal (type) et une source de données (liste structurée) pour produire des documents personnalisés en masse.
- Gérer la liste de destinataires permet de trier, filtrer et exclure certains destinataires sans modifier le fichier source — objectif MOS Expert 4.3.1.
- Les champs de fusion (Bloc d'adresse, Ligne de salutation, champs individuels) s'insèrent depuis le groupe dédié de l'onglet Publipostage — objectif MOS Expert 4.3.2.
- La prévisualisation sur plusieurs destinataires avant la fusion finale permet de détecter des cas particuliers problématiques — objectif MOS Expert 4.3.3.
- Terminer la fusion produit des documents individuels, imprime directement, ou envoie des e-mails ; le même principe s'applique aux étiquettes et enveloppes avec une référence de feuille précise — objectif MOS Expert 4.3.4.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le publipostage combine :
   - a) Deux documents Word identiques
   - b) Un document principal et une source de données
   - c) Un PDF et une image
   - d) Deux classeurs Excel

2. Décocher un destinataire dans "Modifier la liste de destinataires" :
   - a) Supprime définitivement ce destinataire du fichier Excel source
   - b) L'exclut uniquement de cette fusion précise
   - c) Envoie un message d'erreur
   - d) Ferme le document Word

3. Pour vérifier plusieurs destinataires avant la fusion finale, on utilise :
   - a) Terminer et fusionner directement
   - b) Aperçu des résultats
   - c) Insérer un champ de fusion
   - d) Démarrer la fusion et le publipostage

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Décocher un destinataire dans la liste de fusion modifie le fichier Excel source. — **Faux**.
2. "Bloc d'adresse" et "Ligne de salutation" sont des champs composites préconfigurés. — **Vrai**.
3. Choisir la mauvaise référence de feuille d'étiquettes n'a aucune conséquence sur l'impression. — **Faux**, cela produit un décalage progressif.
4. "Modifier des documents individuels" permet une relecture avant impression, contrairement à "Imprimer des documents" directement. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi prévisualiser plusieurs destinataires, et pas seulement le premier, est une bonne pratique avant de terminer une fusion de plusieurs centaines de lettres.
2. Un collègue veut envoyer 300 lettres personnalisées mais aussi générer les étiquettes d'adresse correspondantes. Doit-il recréer une nouvelle liste de destinataires pour les étiquettes ?

**Corrigé 1** : le premier destinataire de la liste peut avoir des données complètes et bien formées par coïncidence, alors que d'autres destinataires plus loin dans la liste peuvent présenter des cas particuliers (nom très long, champ manquant, civilité absente) qui ne se révèlent qu'en parcourant plusieurs enregistrements — une vérification limitée au premier cas laisse ces problèmes potentiels invisibles jusqu'à l'impression ou l'envoi final.

**Corrigé 2** : non, il peut reconnecter la même source de données Excel (la liste des 300 destinataires) à un nouveau document de fusion configuré en "Étiquettes" plutôt qu'en "Lettres" — la source de données reste identique, seul le type de document principal et sa mise en page changent selon l'usage final (lettre, étiquette ou enveloppe).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 34.1</span>

Crée une liste de test de cinq destinataires avec nom et montant de don, rédige une courte lettre type avec un champ de fusion pour le montant, puis prévisualise les cinq destinataires un par un pour vérifier que chaque montant s'affiche correctement.
</div>

**Corrigé :** réussi si chacun des cinq aperçus affiche le bon montant correspondant à la ligne exacte du destinataire visualisé, sans décalage ni erreur d'appariement.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 34.2</span>

Termine la fusion de l'exercice 34.1 en choisissant "Modifier des documents individuels", puis vérifie que le document final généré contient bien cinq lettres distinctes, chacune sur ses propres pages.
</div>

**Corrigé :** réponse personnelle ; réussi si le document final compte bien cinq lettres personnalisées consécutives, chacune reflétant les données du destinataire correspondant.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends le principe du publipostage (document principal + source de données).</li>
<li>☐ Je gère une liste de destinataires (tri, filtre, exclusion) sans modifier le fichier source.</li>
<li>☐ J'insère un bloc d'adresse, une ligne de salutation et des champs de fusion individuels.</li>
<li>☐ Je prévisualise plusieurs destinataires avant de terminer une fusion.</li>
<li>☐ Je termine une fusion en documents individuels, à l'impression, ou par e-mail.</li>
<li>☐ Je génère des étiquettes et des enveloppes à partir de la même source de données.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Publipostage** = document principal + source de données — MOS Expert 4.3.1 à 4.3.4.
- **Décocher un destinataire** = exclusion pour cette fusion seulement, jamais une modification du fichier source.
- **Bloc d'adresse / Ligne de salutation** = champs composites préconfigurés, avec formule de repli à vérifier.
- **Aperçu des résultats** = toujours vérifier plusieurs destinataires, pas seulement le premier.
- **Terminer et fusionner** = documents individuels (relecture possible), impression directe, ou e-mails.

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Publipostage, dans l'ordre logique de ses groupes successifs.
</div>

## FAQ

<dl class="faq">
<dt>La source de données doit-elle obligatoirement être un classeur Excel ?</dt>
<dd>Non, Word accepte aussi une liste de contacts Outlook, une base de données Access, ou une liste tapée directement dans Word via "Taper une nouvelle liste" — Excel reste cependant la source la plus courante en pratique professionnelle.</dd>

<dt>Peut-on personnaliser un document PDF via publipostage ?</dt>
<dd>Non directement : le publipostage produit un document Word ou un envoi d'e-mail ; pour un PDF personnalisé, il faut d'abord terminer la fusion en documents individuels Word, puis exporter chacun en PDF séparément (chapitre 45), une étape supplémentaire à anticiper.</dd>

<dt>L'envoi d'e-mails par publipostage nécessite-t-il un logiciel de messagerie spécifique ?</dt>
<dd>Il nécessite un client de messagerie compatible MAPI configuré sur le poste (couramment Outlook) pour transmettre effectivement les messages ; sans cette configuration, seule la génération de documents individuels ou l'impression restent disponibles.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur le publipostage : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Écosystème Microsoft 365 et intégration Excel-Outlook : chapitre 1 et chapitre 47.

*Chapitre suivant : champs et Quick Parts — pour approfondir la mécanique des champs dynamiques déjà rencontrée à de nombreuses reprises dans ce manuel (numéros de page, dates, renvois, champs de fusion), et créer ses propres blocs de contenu réutilisables.*
