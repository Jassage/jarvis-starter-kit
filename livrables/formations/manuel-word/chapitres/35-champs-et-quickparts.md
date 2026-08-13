<div class="chapitre-titre-num">CHAPITRE 35</div>

# Champs et Quick Parts

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : reconnaître qu'une grande partie des fonctionnalités déjà vues dans ce manuel repose sur le même mécanisme de champ ; insérer un champ personnalisé et modifier ses propriétés ; créer un composant QuickPart réutilisable à partir d'une sélection mise en forme ; gérer une bibliothèque de composants QuickPart via l'Organisateur de blocs de construction ; insérer des contrôles de contenu standards (texte, case à cocher, liste déroulante, sélecteur de date) ; et configurer leurs propriétés pour construire des modèles interactifs.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Créer des QuickParts | MO-101 Word Expert — Create Custom Document Elements | 3.1.1 |
| Gérer les blocs de construction | MO-101 Word Expert — Create Custom Document Elements | 3.1.2 |
| Ajouter des champs personnalisés | MO-101 Word Expert — Use Advanced Word Features | 4.1.1 |
| Modifier les propriétés des champs | MO-101 Word Expert — Use Advanced Word Features | 4.1.2 |
| Insérer des contrôles de contenu standards | MO-101 Word Expert — Use Advanced Word Features | 4.1.3 |
| Configurer les contrôles de contenu standards | MO-101 Word Expert — Use Advanced Word Features | 4.1.4 |

Ce chapitre couvre six objectifs Expert répartis sur deux sous-domaines, tous liés par un même principe : automatiser et structurer du contenu réutilisable.

**Prérequis** : chapitres 14, 27, 28 et 34, qui ont chacun déjà utilisé des champs sans les nommer explicitement comme tels.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le modèle de rapport mensuel de l'ONG (chapitre 19) contient toujours le même encart de politesse en pied de lettre, que chaque rédacteur retape à chaque fois — ta responsable aimerait un bouton pour l'insérer en un clic. Elle voudrait aussi un formulaire de demande de remboursement de frais, avec une case à cocher pour le type de dépense et une liste déroulante pour choisir le projet concerné, plutôt qu'un simple champ de texte libre propice aux erreurs de saisie. Ce chapitre couvre les deux besoins.
</div>

## 35.1 Ce qu'est un champ, une synthèse de tout ce que ce manuel a déjà montré

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la révélation de ce chapitre</span>
Un <strong>champ</strong> est un code invisible inséré dans le texte, qui affiche une valeur calculée plutôt qu'un texte statique tapé au clavier. Ce manuel a déjà utilisé des champs à de nombreuses reprises sans toujours le nommer explicitement : le numéro de page automatique (chapitre 14) est un champ `PAGE`, la date mise à jour automatiquement (chapitre 14) est un champ `DATE`, une entrée de table des matières (chapitre 28) est un champ `TOC`, un renvoi (chapitre 32) est un champ `REF`, et chaque donnée personnalisée d'un publipostage (chapitre 34) est un champ `MERGEFIELD`. Ce chapitre les aborde enfin directement, en tant que mécanisme générique.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Voir le code brut d'un champ</span>
Sélectionner n'importe quel champ (un numéro de page, une date automatique) et appuyer sur **`Alt+F9`** bascule l'affichage de tout le document entre le résultat visible ("3") et le code de champ brut sous-jacent ("{ PAGE }") — un excellent moyen de comprendre, rétrospectivement, la mécanique commune à plusieurs chapitres précédents de ce manuel.
</div>

## 35.2 Insérer un champ personnalisé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 107 — Insérer un champ auteur dans le pied de page</span>

**Objectif** : découvrir des champs au-delà de ceux déjà rencontrés (page, date), en explorant la liste complète disponible.

**Préparation** : ouvre un document de test, active le mode d'édition du pied de page (chapitre 14).

**Étapes détaillées** :
1. Onglet **Insertion**, groupe Texte, clique sur **Quick Part**, puis **Champ...**.
2. La boîte de dialogue liste des dizaines de champs disponibles, classés par catégorie ("Info document", "Numérotation", "Date et heure"...) : choisis **"Author"** (dans "Info document") pour insérer automatiquement le nom de l'auteur enregistré dans les propriétés du document (chapitre 5).
3. Clique sur **OK** : le champ s'insère, affichant directement le nom d'auteur des propriétés — sans avoir tapé ce nom manuellement.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.1.1 Add custom fields (MO-101 Expert)</span>
L'atelier 107 correspond exactement à cet objectif. **Recommandation** : explorer aussi `FILENAME` (nom du fichier, déjà évoqué au chapitre 14), `NUMWORDS` (nombre de mots du document) et `LASTSAVEDBY` (dernière personne ayant enregistré le document) — des champs peu connus mais réellement utiles en contexte professionnel.
</div>

## 35.3 Modifier les propriétés d'un champ

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Ajuster le format d'affichage d'un champ</span>

1. Clic droit sur un champ déjà inséré, **"Modifier le champ..."** (ou sélectionner le champ puis rouvrir Insertion > Quick Part > Champ).
2. Sous **"Propriétés du champ"**, un menu **"Format"** propose des variantes (majuscules, minuscules, première lettre en majuscule) selon le type de champ sélectionné.
3. Pour un champ de date, les mêmes options de format déjà vues au chapitre 14 (jour/mois/année dans différents ordres) sont accessibles depuis cette même boîte de dialogue générique.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.1.2 Modify field properties (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif. **Astuce complémentaire** : `Ctrl+Maj+F9` convertit un champ en texte statique définitif, perdant sa capacité de mise à jour — utile uniquement si une valeur doit être figée intentionnellement (par exemple, une date qui ne doit jamais changer une fois le document validé).
</div>

## 35.4 Créer un composant QuickPart réutilisable

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 108 — Enregistrer l'encart de politesse comme QuickPart</span>

**Objectif** : répondre à la première demande de la mise en situation d'ouverture.

**Préparation** : ouvre le document type contenant l'encart de politesse déjà mis en forme (police, couleur, retrait éventuel).

**Étapes détaillées** :
1. Sélectionne l'intégralité de l'encart (texte et mise en forme).
2. Onglet Insertion, groupe Texte, clique sur **Quick Part**, puis **"Enregistrer la sélection dans la galerie de composants QuickPart..."**.
3. Nomme ce composant ("Politesse ONG"), choisis une **Galerie** (par défaut "Composants QuickPart"), une **Catégorie** si souhaité pour organiser plusieurs composants entre eux, puis clique sur **OK**.
4. Pour réutiliser ce composant dans n'importe quel document futur, ouvre Insertion > Quick Part : "Politesse ONG" apparaît directement dans la galerie, prêt à être inséré en un clic à l'endroit du point d'insertion.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.1.1 Create QuickParts (MO-101 Expert)</span>
L'atelier 108 correspond exactement à cet objectif. **Recommandation** : un QuickPart conserve toute la mise en forme de la sélection d'origine (police, couleur, styles) — un avantage réel par rapport au simple Presse-papiers (chapitre 7), qui ne conserve les éléments copiés que pour la session en cours, contrairement à un QuickPart enregistré durablement.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec Normal.dotm</span>
Comme les styles transférés via l'Organisateur (chapitre 17) ou le thème enregistré (chapitre 18), un QuickPart créé avec la galerie et le modèle par défaut reste disponible dans <strong>tout futur document</strong> basé sur Normal.dotm (chapitre 4) — une nouvelle illustration du même principe de personnalisation durable du poste de travail.
</div>

## 35.5 Gérer les composants QuickPart

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Organiser une bibliothèque de composants</span>

1. Onglet Insertion, groupe Texte, Quick Part, clique sur **"Organisateur de blocs de construction..."**.
2. Une liste complète de tous les composants réutilisables du poste s'affiche (QuickParts créés, mais aussi en-têtes, pieds de page et pages de garde prédéfinis, qui utilisent la même mécanique sous-jacente).
3. Sélectionne "Politesse ONG", clique sur **"Modifier les propriétés..."** pour renommer le composant, changer sa catégorie, ou choisir une autre galerie de destination.
4. Le bouton **"Supprimer"** retire définitivement un composant devenu obsolète de la bibliothèque.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.1.2 Manage building blocks (MO-101 Expert)</span>
Cette procédure correspond exactement à cet objectif. **Recommandation** : organiser les composants par catégorie dès leur création (section 35.4) plutôt que de tout laisser dans "Général", pour une bibliothèque de QuickParts qui reste exploitable même après plusieurs dizaines de créations.
</div>

## 35.6 Insérer des contrôles de contenu standards

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un <strong>contrôle de contenu</strong> est une zone interactive intégrée à un document ou un modèle, guidant la saisie de l'utilisateur (une case à cocher plutôt qu'un texte libre ambigu, une liste déroulante plutôt qu'un champ où n'importe quoi pourrait être tapé) — l'outil précis pour le formulaire de remboursement de frais demandé dans la mise en situation d'ouverture.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 109 — Construire le formulaire de remboursement de frais</span>

**Objectif** : répondre à la seconde demande de la mise en situation d'ouverture.

**Préparation** : si l'onglet **Développeur** n'apparaît pas dans le Ruban, l'activer via Fichier > Options > Personnaliser le ruban > cocher "Développeur" (rappel du chapitre 4, sur l'affichage des onglets masqués).

**Étapes détaillées** :
1. Onglet **Développeur**, groupe Contrôles, place le point d'insertion à côté de "Type de dépense :", clique sur l'icône **Case à cocher** : une case interactive s'insère, cochable directement dans le document (pas seulement à l'impression).
2. À côté de "Projet concerné :", clique sur l'icône **Contrôle de contenu Liste déroulante** : un contrôle vide s'insère, à configurer en section 35.7.
3. À côté de "Montant :", clique sur l'icône **Contrôle de contenu Texte enrichi** (ou "Texte") pour une zone de saisie libre mais clairement délimitée visuellement.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.1.3 Insert standard content controls (MO-101 Expert)</span>
L'atelier 109 correspond exactement à cet objectif. **Piège fréquent** : ces icônes ne se trouvent que dans l'onglet **Développeur**, masqué par défaut — un oubli fréquent d'activation qui bloque tout le reste du chapitre si non résolu en amont.
</div>

## 35.7 Configurer les propriétés des contrôles de contenu

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 110 — Remplir la liste déroulante des projets</span>

**Objectif** : finaliser le contrôle de liste déroulante créé à l'atelier 109, encore vide à ce stade.

**Préparation** : reprends le document avec le contrôle Liste déroulante inséré.

**Étapes détaillées** :
1. Clique sur le contrôle Liste déroulante pour le sélectionner, onglet Développeur, groupe Contrôles, clique sur **Propriétés**.
2. Sous "Propriétés de liste déroulante", clique sur **Ajouter...** pour chaque projet à proposer (par exemple "Distribution scolaire", "Formation bénévoles", "Frais administratifs"), en tapant un nom d'affichage pour chacun.
3. Sous "Verrouillage", coche éventuellement **"Le contenu ne peut pas être modifié"** pour empêcher un utilisateur de taper un texte libre à la place de choisir une option de la liste — une garantie de cohérence des données saisies.
4. Ajoute un **titre** au contrôle (visible au survol, comme une info-bulle) pour guider un utilisateur découvrant le formulaire pour la première fois.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 4.1.4 Configure standard content controls (MO-101 Expert)</span>
L'atelier 110 correspond exactement à cet objectif. **Recommandation** : toujours verrouiller le contenu d'une liste déroulante destinée à garantir des données cohérentes (par exemple pour une compilation ultérieure des formulaires reçus), sauf besoin explicite de laisser une saisie libre en complément.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Une PME qui reçoit régulièrement des demandes de congé de ses employés utilise un modèle (chapitre 19) intégrant des contrôles de contenu : sélecteur de date pour le début et la fin du congé, liste déroulante pour le type de congé (payé, sans solde, maladie) — un formulaire structuré qui facilite grandement le traitement et la compilation des demandes par le service RH, comparé à des formulaires en texte libre où chacun rédige différemment.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire un formulaire de rapport d'activité bénévole complet</span>
Construis un formulaire pour les bénévoles de l'ONG combinant : un contrôle de texte pour le nom du bénévole, un sélecteur de date pour la date de l'activité, une liste déroulante verrouillée pour le type d'activité (au moins trois options), et une case à cocher pour indiquer si un remboursement de frais est demandé. Enregistre ce formulaire comme modèle (chapitre 19) pour qu'il soit réutilisable par toute l'équipe.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre un champ et un texte statique tapé au clavier</span>
Taper manuellement "Jean Baptiste" comme nom d'auteur plutôt que d'insérer le champ `AUTHOR` casse le lien avec les propriétés du document (chapitre 5) — toute modification future des propriétés ne se répercutera jamais sur ce texte tapé en dur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier d'activer l'onglet Développeur avant de chercher les contrôles de contenu</span>
Comme signalé dans l'atelier 109, les icônes de contrôles de contenu n'existent que dans cet onglet masqué par défaut — un blocage fréquent chez qui découvre cette fonctionnalité pour la première fois sans connaître ce prérequis.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ne pas verrouiller une liste déroulante destinée à standardiser une saisie</span>
Comme signalé dans l'atelier 110, une liste déroulante non verrouillée permet malgré tout à un utilisateur de taper un texte libre à la place d'une option prévue, compromettant l'objectif même de standardisation qui justifiait l'usage d'un contrôle de contenu plutôt qu'un simple champ de texte.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un champ AUTHOR affiche un nom incorrect ou vide</span>

- **Diagnostic** : le champ reflète le nom d'auteur enregistré dans les propriétés du document (Fichier > Infos, chapitre 5), pas nécessairement le nom de la personne éditant actuellement le document.
- **Résolution** : vérifier et corriger le nom d'auteur dans les propriétés du document directement, plutôt que de modifier le champ lui-même qui ne fait qu'afficher cette valeur source.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un QuickPart enregistré n'apparaît pas dans un nouveau document</span>

- **Diagnostic** : le composant a probablement été enregistré dans une galerie ou un modèle différent de Normal.dotm, limitant sa disponibilité au contexte d'origine.
- **Résolution** : vérifier, dans l'Organisateur de blocs de construction (section 35.5), le modèle associé au composant et le modifier si une disponibilité universelle est souhaitée.
</div>

## En entreprise

- **Bonne pratique répandue** : constituer une bibliothèque de QuickParts pour tout texte répétitif d'une organisation (mentions légales, formules de politesse standardisées, clauses contractuelles récurrentes), plutôt que de les retaper ou les copier-coller depuis un ancien document à chaque fois.
- **Bonne pratique répandue** : utiliser des contrôles de contenu verrouillés pour tout formulaire interne destiné à être compilé ou analysé ensuite, garantissant des données cohérentes d'un formulaire à l'autre.
- **Erreur classique observée** : des formulaires internes en texte libre où chaque employé rédige différemment une même information (dates dans des formats variés, noms de projets orthographiés différemment), compliquant toute compilation ultérieure.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — associer un contrôle de contenu à une source de données XML</span>
Les contrôles de contenu avancés permettent, au-delà du formulaire simple de ce chapitre, de lier leur contenu à des données structurées XML personnalisées — une fonctionnalité avancée utilisée dans des scénarios d'entreprise complexes (génération de documents à partir d'un système d'information externe), dépassant le cadre de ce manuel mais bon à savoir comme prolongement possible.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — synthèse de ce chapitre pour l'examen</span>
Ce chapitre couvre six objectifs Expert répartis sur les sous-domaines 3.1 (blocs de construction) et 4.1 (champs et contrôles de contenu). **Recommandation** : bien mémoriser que les contrôles de contenu nécessitent l'onglet Développeur (souvent masqué par défaut, chapitre 4) — un prérequis d'activation qui peut, à lui seul, faire perdre un temps précieux en situation d'examen si l'onglet n'a pas déjà été activé au préalable.
</div>

## Résumé du chapitre

- Un champ est un code invisible affichant une valeur calculée plutôt qu'un texte statique — un mécanisme déjà utilisé, sans le nommer, dans plusieurs chapitres précédents (pages, dates, table des matières, renvois, publipostage).
- `Alt+F9` bascule l'affichage entre le résultat d'un champ et son code brut sous-jacent.
- Un champ personnalisé s'insère via Insertion > Quick Part > Champ, avec des propriétés de format modifiables — objectifs MOS Expert 4.1.1 et 4.1.2.
- Un QuickPart enregistre une sélection mise en forme comme composant réutilisable, disponible dans tout futur document — objectif MOS Expert 3.1.1, géré via l'Organisateur de blocs de construction — objectif MOS Expert 3.1.2.
- Les contrôles de contenu (texte, case à cocher, liste déroulante, date) nécessitent l'onglet Développeur et structurent la saisie d'un formulaire — objectif MOS Expert 4.1.3, configurables (options de liste, verrouillage, titre) — objectif MOS Expert 4.1.4.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `Alt+F9` permet de :
   - a) Supprimer tous les champs du document
   - b) Basculer entre l'affichage du résultat d'un champ et son code brut
   - c) Insérer un nouveau champ
   - d) Ouvrir l'onglet Développeur

2. Un QuickPart enregistré avec Normal.dotm comme destination est disponible :
   - a) Uniquement dans le document où il a été créé
   - b) Dans tout futur document basé sur ce modèle
   - c) Uniquement pendant la session en cours
   - d) Uniquement pour l'impression

3. Les icônes d'insertion de contrôles de contenu se trouvent dans l'onglet :
   - a) Accueil
   - b) Développeur
   - c) Révision
   - d) Références

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un champ AUTHOR reflète le nom d'auteur enregistré dans les propriétés du document. — **Vrai**.
2. L'onglet Développeur est visible par défaut dans toutes les installations de Word. — **Faux**, il doit être activé manuellement.
3. Une liste déroulante non verrouillée empêche toute saisie de texte libre à la place d'une option. — **Faux**.
4. `Ctrl+Maj+F9` convertit un champ en texte statique définitif. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la table des matières, les renvois et les champs de fusion de publipostage, bien que très différents en apparence, reposent sur le même mécanisme sous-jacent.
2. Un collègue a créé un contrôle de liste déroulante pour un formulaire, mais un utilisateur a quand même réussi à taper un texte libre différent des options proposées. Quel réglage a probablement été oublié ?

**Corrigé 1** : ce sont tous des **champs** — des codes invisibles qui affichent une valeur calculée ou insérée dynamiquement (un numéro de page, un numéro de figure référencé, une donnée d'une ligne Excel) plutôt qu'un texte statique tapé au clavier. Cette parenté explique pourquoi tous partagent des comportements communs : mise à jour via `F9`, visibilité du code brut via `Alt+F9`, et possibilité de conversion en texte figé via `Ctrl+Maj+F9`.

**Corrigé 2** : l'option "Le contenu ne peut pas être modifié" (verrouillage), dans les propriétés du contrôle de liste déroulante, n'a probablement pas été cochée — sans ce réglage, un utilisateur peut effectivement cliquer dans le contrôle et taper un texte libre malgré la présence de la liste déroulante, compromettant l'objectif de standardisation des données recherché.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 35.1</span>

Insère un champ `FILENAME` dans le pied de page d'un document de test, puis vérifie qu'il affiche bien le nom exact du fichier tel qu'enregistré.
</div>

**Corrigé :** réussi si le champ affiche le nom de fichier exact, se mettant à jour automatiquement si le document est renommé et réenregistré (après actualisation avec `F9`).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 35.2</span>

Crée un contrôle de contenu Liste déroulante avec au moins trois options, verrouille son contenu, puis tente de taper un texte libre dedans pour vérifier que le verrouillage empêche bien cette action.
</div>

**Corrigé :** réponse personnelle ; réussi si toute tentative de saisie libre dans le contrôle verrouillé est effectivement bloquée, seule la sélection parmi les options proposées restant possible.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je reconnais qu'un champ est le mécanisme commun à plusieurs fonctionnalités déjà vues dans ce manuel.</li>
<li>☐ J'insère un champ personnalisé et je modifie ses propriétés de format.</li>
<li>☐ Je crée un composant QuickPart réutilisable à partir d'une sélection mise en forme.</li>
<li>☐ Je gère une bibliothèque de composants via l'Organisateur de blocs de construction.</li>
<li>☐ J'insère des contrôles de contenu standards depuis l'onglet Développeur.</li>
<li>☐ Je configure les propriétés d'un contrôle de contenu, y compris son verrouillage.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Champ** = code invisible affichant une valeur calculée — mécanisme commun à de nombreuses fonctionnalités déjà vues.
- **QuickPart** = sélection mise en forme enregistrée comme composant réutilisable — MOS Expert 3.1.1, 3.1.2.
- **Contrôles de contenu** = onglet Développeur obligatoire, à activer si masqué — MOS Expert 4.1.3, 4.1.4.
- **Verrouillage** = toujours activer pour une liste déroulante destinée à standardiser une saisie.

**Raccourcis clavier de ce chapitre** :
- `Alt+F9` : basculer entre résultat et code brut d'un champ.
- `Ctrl+Maj+F9` : convertir un champ en texte statique définitif.
</div>

## FAQ

<dl class="faq">
<dt>Un QuickPart peut-il contenir une image en plus du texte ?</dt>
<dd>Oui, tout ce qui peut être sélectionné dans un document (texte, image, tableau, combinaison des trois) peut être enregistré comme composant QuickPart réutilisable.</dd>

<dt>Les contrôles de contenu fonctionnent-ils dans Word Online ?</dt>
<dd>Oui pour la plupart, avec un accès et une configuration parfois plus limités que dans Word Desktop, cohérent avec les différences déjà signalées au chapitre 1 et approfondies au chapitre 48.</dd>

<dt>Peut-on protéger un document pour que seuls les contrôles de contenu soient modifiables, le reste du texte restant figé ?</dt>
<dd>Oui, via la restriction de modification (chapitre 42), qui peut être configurée pour n'autoriser que le remplissage de formulaires, empêchant toute autre modification du document.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les champs et les QuickParts : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Protection des documents et restriction d'édition aux formulaires : chapitre 42.

*Chapitre suivant : initiation aux macros — pour automatiser des séquences d'actions répétitives, au-delà des champs et composants réutilisables de ce chapitre.*
