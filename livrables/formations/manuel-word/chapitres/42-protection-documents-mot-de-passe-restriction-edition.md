<div class="chapitre-titre-num">CHAPITRE 42</div>

# Protection des documents (mot de passe, restriction d'édition)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : chiffrer un document avec un mot de passe pour en restreindre l'ouverture ; restreindre la modification d'un document à certaines actions autorisées seulement (formulaires, commentaires, suivi des modifications forcé) ; accorder des exceptions de modification à des sections précises pour des personnes désignées ; inspecter un document pour repérer et supprimer des informations personnelles ou cachées avant sa diffusion ; et marquer un document comme final pour signaler qu'il ne doit plus être modifié.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Localiser et supprimer les propriétés cachées et informations personnelles | MO-100 Word Associate — Manage Documents | 1.4.1 |
| Restreindre la modification | MO-101 Word Expert — Manage Document Options and Settings | 1.2.1 |
| Protéger les documents par mot de passe | MO-101 Word Expert — Manage Document Options and Settings | 1.2.2 |

Ce chapitre ouvre la Partie 11, consacrée à la protection, l'impression et l'export des documents.

**Prérequis** : chapitre 38 (suivi des modifications) et chapitre 41 (partage de documents), dont ce chapitre encadre désormais l'usage avec des garde-fous.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport financier annuel de l'ONG, une fois finalisé, doit être transmis au conseil d'administration pour une dernière relecture, mais ta responsable veut s'assurer que personne ne puisse en modifier le contenu par erreur — seuls des commentaires doivent rester possibles. Elle veut aussi qu'un document budgétaire confidentiel ne puisse être ouvert que par les personnes connaissant un mot de passe précis. Enfin, elle se souvient qu'un ancien rapport envoyé à un bailleur contenait encore, dans ses propriétés, le nom d'un employé qui avait depuis quitté l'organisation — une fuite d'information embarrassante à éviter absolument cette fois-ci.
</div>

## 42.1 Chiffrer un document avec un mot de passe

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 129 — Protéger le document budgétaire confidentiel</span>

**Objectif** : répondre à la deuxième demande de la mise en situation.

**Préparation** : ouvre le document budgétaire de test.

**Étapes détaillées** :
1. Onglet **Fichier**, clique sur **Informations**, puis **"Protéger le document"**, choisis **"Chiffrer avec mot de passe"**.
2. Saisis un mot de passe robuste, confirme-le dans la boîte de dialogue suivante.
3. Enregistre le document (`Ctrl+S`) : désormais, toute tentative d'ouverture de ce fichier — par toi-même ou quiconque d'autre — exigera la saisie de ce mot de passe, sans quoi le contenu reste totalement inaccessible.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.2.2 Protect documents by using passwords (MO-101 Expert)</span>
L'atelier 129 correspond exactement à cet objectif.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — un mot de passe oublié est irrécupérable</span>
Microsoft ne conserve <strong>aucune</strong> copie du mot de passe de chiffrement d'un document Word — un mot de passe oublié rend le document définitivement inaccessible, sans aucune procédure de récupération officielle. Toujours conserver ce mot de passe dans un gestionnaire de mots de passe fiable, jamais uniquement dans sa mémoire.
</div>

## 42.2 Restreindre la modification

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la différence avec le chiffrement</span>
Chiffrer un document (section 42.1) en bloque l'<strong>ouverture</strong> entière sans mot de passe. Restreindre la modification, à l'inverse, permet une ouverture et une <strong>lecture</strong> libres, mais limite les actions possibles une fois le document ouvert — exactement le besoin de la première demande de la mise en situation (seuls des commentaires doivent rester possibles).
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 130 — Autoriser uniquement les commentaires sur le rapport financier</span>

**Objectif** : répondre à la première demande de la mise en situation d'ouverture.

**Préparation** : reprends le rapport financier annuel, finalisé.

**Étapes détaillées** :
1. Onglet **Révision**, groupe Protéger, clique sur **Restreindre la modification** (ou Fichier > Informations > Protéger le document > "Restreindre la modification").
2. Le volet qui s'ouvre propose, sous **"2. Restrictions de modification"**, de cocher **"Autoriser uniquement ce type de modifications dans le document"**, puis de choisir dans le menu déroulant : **"Commentaires"** (les seules actions possibles seront d'ajouter des commentaires, chapitre 39, sans jamais pouvoir modifier le texte lui-même).
3. Clique sur **"Oui, activer la protection"**, définis un mot de passe (facultatif mais recommandé pour empêcher quiconque de désactiver cette restriction sans autorisation).
4. Vérifie qu'un essai de modification directe du texte est désormais bloqué, tandis qu'ajouter un commentaire reste possible.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.2.1 Restrict editing (MO-101 Expert)</span>
L'atelier 130 correspond exactement à cet objectif. **Autres options du même menu déroulant** : "Suivi des modifications" (force le suivi actif en permanence, chapitre 38, sans possibilité de le désactiver — une alternative au verrouillage du suivi déjà vu au chapitre 38), "Remplissage de formulaires" (n'autorise que la saisie dans des contrôles de contenu, chapitre 35), et "Aucune modification (lecture seule)" (la restriction la plus stricte).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Accorder une exception à une section précise</span>

1. Dans le même volet "Restreindre la modification", sous **"Exceptions"**, sélectionne d'abord la portion de texte qui doit rester librement modifiable malgré la restriction générale (par exemple, une section de notes internes destinée uniquement à l'équipe de rédaction).
2. Coche le nom d'un groupe ou d'un utilisateur spécifique dans la liste des exceptions (si des comptes Microsoft distincts sont utilisés), ou coche **"Tout le monde"** pour libérer cette portion précise de texte de toute restriction, tout en laissant le reste du document protégé.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel</span>
Un formulaire de collecte de dons d'une organisation protège l'intégralité du texte descriptif contre toute modification, tout en laissant les seuls contrôles de contenu (chapitre 35) — montant du don, coordonnées du donateur — librement remplissables, garantissant qu'aucune information officielle du formulaire ne puisse être accidentellement altérée par un donateur le remplissant en ligne.
</div>

## 42.3 Inspecter le document avant diffusion

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 131 — Vérifier l'absence d'informations personnelles avant l'envoi au bailleur</span>

**Objectif** : répondre à la troisième demande de la mise en situation d'ouverture, en évitant une fuite d'information comme celle déjà vécue par l'organisation.

**Préparation** : reprends le rapport financier, avec des commentaires (chapitre 39) et des propriétés de document (chapitre 5) renseignées.

**Étapes détaillées** :
1. Onglet Fichier, Informations, clique sur **"Vérifier l'absence de problèmes"**, puis **"Inspecter le document"**.
2. Une boîte de dialogue liste plusieurs catégories à vérifier : **"Commentaires et annotations"**, **"Propriétés du document et informations personnelles"** (nom d'auteur, chapitre 5), **"En-têtes, pieds de page et filigranes"**, **"Texte masqué"**...
3. Clique sur **Inspecter** : un rapport détaille, catégorie par catégorie, ce qui a été trouvé (par exemple "3 commentaires trouvés", "Nom d'auteur trouvé : Jean Baptiste").
4. Clique sur **"Supprimer tout"** en face de chaque catégorie à nettoyer avant diffusion externe — par exemple, retirer tous les commentaires internes et le nom d'auteur des propriétés.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.4.1 Locate and remove hidden properties and personal information (MO-100 Associate)</span>
L'atelier 131 correspond exactement à cet objectif. **Recommandation** : toujours effectuer cette inspection sur une **copie** du document plutôt que l'original de travail — la suppression de contenu via l'Inspecteur de document est immédiate et peut être difficile à annuler complètement une fois le document refermé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — inspecter avant, jamais après, tout envoi sensible</span>
Une fois un document envoyé à un destinataire externe, il est trop tard pour retirer des informations personnelles ou des commentaires internes qu'il contenait — l'inspection doit systématiquement précéder l'envoi, jamais le suivre, exactement le problème vécu par l'organisation avec le nom d'employé resté dans un ancien rapport.
</div>

## 42.4 Marquer comme final

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Signaler qu'un document est définitivement terminé</span>

1. Onglet Fichier, Informations, Protéger le document, clique sur **"Marquer comme final"**.
2. Le document affiche désormais un bandeau discret indiquant qu'il est final, et la plupart des commandes d'édition deviennent grisées par défaut à l'ouverture.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — une protection symbolique, pas une vraie sécurité</span>
"Marquer comme final" n'est **pas** une protection réelle contre la modification : n'importe qui peut cliquer sur un bouton "Modifier quand même" pour lever cette restriction instantanément, sans mot de passe ni autorisation. Cette fonctionnalité communique une <strong>intention</strong> ("ce document ne devrait plus changer") plutôt qu'elle n'impose une <strong>contrainte</strong> réelle — contrairement à la restriction de modification (section 42.2), qui peut être verrouillée par mot de passe.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Préparer un document pour une diffusion externe complète et sécurisée</span>
Sur un document de test contenant des commentaires, un nom d'auteur dans les propriétés, et un texte masqué (chapitre 9, texte avec la mise en forme "Masqué" appliquée) : inspecte-le pour supprimer tout élément sensible, restreins la modification aux seuls commentaires avec un mot de passe, puis chiffre une copie de ce même document avec un second mot de passe distinct pour simuler une version strictement confidentielle réservée à un cercle restreint.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre chiffrement et restriction de modification</span>
Comme signalé en section 42.2, le chiffrement bloque l'ouverture entière du document, tandis que la restriction de modification permet une lecture libre mais limite les actions possibles une fois ouvert — deux protections aux usages très différents, à ne jamais confondre selon le besoin réel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier d'inspecter un document avant un envoi externe sensible</span>
Comme signalé dans l'atelier 131, cette étape doit systématiquement précéder toute diffusion, jamais la suivre — un oubli qui peut exposer des informations personnelles ou des commentaires internes à un destinataire externe qui ne devait jamais les voir.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Croire que "Marquer comme final" empêche réellement toute modification</span>
Comme signalé en section 42.4, cette fonctionnalité reste purement symbolique et facilement contournable — pour une vraie protection contre la modification, la restriction de modification avec mot de passe (section 42.2) est indispensable.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : mot de passe de chiffrement oublié, document inaccessible</span>

- **Diagnostic** : comme signalé en section 42.1, Microsoft ne conserve aucune copie de ce mot de passe.
- **Résolution** : aucune procédure officielle de récupération n'existe ; vérifier systématiquement un gestionnaire de mots de passe ou toute sauvegarde antérieure non chiffrée du même document avant de considérer le contenu comme définitivement perdu.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une exception de modification (section 42.2) ne semble pas fonctionner pour un utilisateur précis</span>

- **Diagnostic** : l'exception a peut-être été accordée à "Tout le monde" par erreur plutôt qu'à un utilisateur ou groupe nommé précis, ou inversement.
- **Résolution** : revérifier, dans le volet Restreindre la modification, quelle portion de texte et quel utilisateur/groupe ont réellement été sélectionnés au moment de créer l'exception.
</div>

## En entreprise

- **Bonne pratique répandue** : inspecter systématiquement tout document avant sa première diffusion externe, en particulier les propriétés d'auteur et les commentaires internes, quel que soit le niveau de confidentialité apparent du contenu.
- **Bonne pratique répandue** : restreindre la modification (avec mot de passe) de tout document destiné à une validation finale, plutôt que de compter sur la seule bonne volonté des destinataires pour ne pas le modifier.
- **Erreur classique observée** : des documents envoyés à des partenaires externes révélant, dans leurs propriétés ou commentaires jamais inspectés, des informations internes qui n'auraient jamais dû quitter l'organisation.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — combiner chiffrement et restriction pour une protection à deux niveaux</span>
Un document particulièrement sensible peut cumuler les deux protections : chiffrement par mot de passe pour l'ouverture (section 42.1) et restriction de modification distincte pour l'édition une fois ouvert (section 42.2) — deux mots de passe différents pouvant être communiqués séparément selon le rôle de chaque destinataire (l'un pour simplement lire, l'autre en plus pour modifier).
</div>

## Résumé du chapitre

- Chiffrer un document (Fichier > Informations > Protéger le document > Chiffrer avec mot de passe) bloque son ouverture entière — objectif MOS Expert 1.2.2, un mot de passe oublié étant irrécupérable.
- Restreindre la modification limite les actions possibles après ouverture (commentaires, formulaires, suivi forcé, lecture seule), avec des exceptions possibles par section ou par utilisateur — objectif MOS Expert 1.2.1.
- L'Inspecteur de document repère et supprime propriétés cachées, commentaires et informations personnelles avant toute diffusion externe — objectif MOS Associate 1.4.1, à effectuer systématiquement avant, jamais après, un envoi sensible.
- "Marquer comme final" reste une protection purement symbolique et facilement contournable, contrairement aux deux protections précédentes.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Chiffrer un document avec un mot de passe :
   - a) Limite uniquement certaines actions après ouverture
   - b) Bloque totalement l'ouverture sans le mot de passe
   - c) N'a aucun effet réel
   - d) Supprime automatiquement les commentaires

2. Pour n'autoriser que des commentaires sur un document déjà ouvert, on utilise :
   - a) Chiffrer avec mot de passe
   - b) Restreindre la modification
   - c) Marquer comme final
   - d) Inspecter le document

3. "Marquer comme final" :
   - a) Empêche définitivement et techniquement toute modification
   - b) Reste une protection symbolique, facilement contournable
   - c) Chiffre le document
   - d) Supprime les propriétés personnelles

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Microsoft peut récupérer un mot de passe de chiffrement oublié. — **Faux**.
2. L'Inspecteur de document peut détecter et supprimer le nom d'auteur des propriétés du document. — **Vrai**.
3. Une exception de modification peut être accordée à une portion précise de texte plutôt qu'à tout le document. — **Vrai**.
4. Inspecter un document après son envoi permet de corriger une fuite d'information déjà survenue. — **Faux**, l'inspection doit précéder l'envoi.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique la différence entre chiffrer un document et restreindre sa modification, avec un exemple d'usage pour chacun.
2. Une organisation a déjà connu un incident où un ancien nom d'employé est resté visible dans les propriétés d'un rapport envoyé à un bailleur. Quelle procédure aurait permis d'éviter cet incident, et à quel moment aurait-elle dû être appliquée ?

**Corrigé 1** : chiffrer un document (section 42.1) bloque son ouverture entière sans le mot de passe — utile pour un document strictement confidentiel dont même la lecture doit rester limitée (un dossier budgétaire sensible). Restreindre la modification (section 42.2) permet une lecture libre mais limite les actions après ouverture — utile pour un document destiné à être largement consulté mais dont le contenu validé ne doit plus changer, sauf commentaires ou remplissage de formulaire.

**Corrigé 2** : l'Inspecteur de document (section 42.3), appliqué systématiquement **avant** tout envoi externe, aurait détecté et permis de supprimer le nom d'auteur des propriétés du document avant qu'il ne quitte l'organisation — l'inspection doit toujours précéder la diffusion, jamais la suivre, puisqu'une fois le document envoyé, il est déjà trop tard pour retirer l'information qu'il contenait.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 42.1</span>

Sur un document de test contenant un nom d'auteur dans ses propriétés et deux commentaires, utilise l'Inspecteur de document pour détecter puis supprimer ces deux catégories d'éléments.
</div>

**Corrigé :** réussi si le rapport d'inspection confirme d'abord la présence du nom d'auteur et des deux commentaires, puis leur suppression effective après avoir cliqué sur "Supprimer tout" pour chaque catégorie concernée.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 42.2</span>

Restreins la modification d'un document de test pour n'autoriser que les commentaires, avec un mot de passe, puis vérifie qu'une tentative de modification directe du texte est bien bloquée tandis qu'ajouter un commentaire reste possible.
</div>

**Corrigé :** réponse personnelle ; réussi si toute tentative de modification du texte lui-même échoue effectivement, tandis que l'ajout d'un commentaire (chapitre 39) reste pleinement fonctionnel.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je chiffre un document avec un mot de passe pour en restreindre l'ouverture.</li>
<li>☐ Je restreins la modification d'un document aux seules actions autorisées.</li>
<li>☐ J'accorde des exceptions de modification à des sections ou utilisateurs précis.</li>
<li>☐ J'inspecte systématiquement un document avant toute diffusion externe sensible.</li>
<li>☐ Je sais que "Marquer comme final" reste une protection symbolique, pas une vraie sécurité.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Chiffrer avec mot de passe** = bloque l'ouverture entière, mot de passe irrécupérable si oublié — MOS Expert 1.2.2.
- **Restreindre la modification** = limite les actions après ouverture (commentaires, formulaires, lecture seule) — MOS Expert 1.2.1.
- **Inspecteur de document** = toujours avant, jamais après, un envoi externe sensible — MOS Associate 1.4.1.
- **Marquer comme final** = symbolique uniquement, facilement contournable.

Aucun raccourci clavier dédié : toutes les commandes passent par Fichier > Informations ou l'onglet Révision.
</div>

## FAQ

<dl class="faq">
<dt>Peut-on retirer une protection par mot de passe une fois appliquée ?</dt>
<dd>Oui, en rouvrant le document avec le mot de passe correct puis en effaçant le mot de passe dans la même boîte de dialogue de chiffrement, laissant le champ vide avant de valider.</dd>

<dt>L'Inspecteur de document modifie-t-il le contenu visible du texte principal ?</dt>
<dd>Non, il ne cible que les métadonnées et éléments annexes (propriétés, commentaires, en-têtes/pieds de page, texte masqué) — le texte principal visible du document reste inchangé par cette opération.</dd>

<dt>Une restriction de modification empêche-t-elle aussi la coédition en temps réel (chapitre 41) ?</dt>
<dd>Une restriction stricte ("Aucune modification") empêche effectivement toute modification, y compris en coédition ; une restriction plus souple (commentaires, formulaires) reste compatible avec plusieurs personnes travaillant simultanément dans les limites autorisées.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la protection des documents : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Contrôles de contenu concernés par la restriction "Remplissage de formulaires" : chapitre 35.

*Chapitre suivant : signatures numériques et authenticité — pour garantir non seulement la protection d'un document, mais aussi la vérification de son origine et de son intégrité.*
