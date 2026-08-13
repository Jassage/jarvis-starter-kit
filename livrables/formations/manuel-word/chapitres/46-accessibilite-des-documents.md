<div class="chapitre-titre-num">CHAPITRE 46</div>

# Accessibilité des documents

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer ce qu'est un document accessible et pourquoi cette exigence dépasse la simple bonne volonté ; utiliser le Vérificateur d'accessibilité pour détecter automatiquement les problèmes d'un document ; corriger les erreurs les plus fréquentes (texte de remplacement manquant, contraste insuffisant, structure de titres absente, tableaux mal structurés) ; vérifier et corriger les problèmes de compatibilité avec des versions antérieures de Word ; et intégrer l'accessibilité comme réflexe de rédaction plutôt que comme correction de dernière minute.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Localiser et corriger les problèmes d'accessibilité | MO-100 Word Associate — Manage Documents | 1.4.2 |
| Localiser et corriger les problèmes de compatibilité | MO-100 Word Associate — Manage Documents | 1.4.3 |

Ce chapitre complète, avec le chapitre 42 (objectif 1.4.1), l'intégralité du sous-domaine MOS **1.4 Inspect documents for issues**.

**Prérequis** : chapitre 9 (styles de titre), chapitre 21 (texte de remplacement des images) et chapitre 26 (tableaux), dont ce chapitre révèle enfin la dimension d'accessibilité commune.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport annuel de l'ONG doit être publié sur le site web de l'organisation, accessible à tous. Un membre du conseil d'administration, malvoyant, utilise un lecteur d'écran et signale qu'il n'a jamais pu consulter correctement les rapports des années précédentes : les images n'avaient aucune description, les titres n'étaient pas reconnus comme tels, et les tableaux étaient annoncés comme un flot incompréhensible de mots. Ta responsable veut que cette année soit différente, et découvre au passage que plusieurs bailleurs institutionnels commencent à exiger contractuellement des documents accessibles.
</div>

## 46.1 Ce qu'est réellement un document accessible

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la synthèse de plusieurs chapitres</span>
Un document <strong>accessible</strong> reste compréhensible et navigable pour une personne qui ne le perçoit pas visuellement de la même façon que son auteur — parce qu'elle utilise un <strong>lecteur d'écran</strong> (logiciel qui vocalise le contenu), parce qu'elle navigue au clavier sans souris, ou parce qu'elle distingue mal certaines couleurs. Ce manuel a déjà posé, sans toujours le nommer, plusieurs pierres de cette accessibilité : les vrais styles de titre (chapitre 9) que le lecteur d'écran annonce comme des titres navigables, le texte de remplacement des images (chapitre 21) qu'il vocalise à la place de l'image, et les balises de structure des PDF exportés (chapitre 45).
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un lecteur d'écran parcourt un document un peu comme une personne qui l'écouterait lu à voix haute par quelqu'un d'autre, sans jamais le voir. Un titre simplement agrandi et mis en gras (chapitre 9) est lu exactement comme n'importe quelle autre phrase — rien ne signale à l'auditeur qu'il s'agissait d'un titre. Un vrai style de titre, lui, est annoncé explicitement ("Titre niveau 2 : Situation financière"), permettant de comprendre la structure et même de sauter directement d'une section à l'autre.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — une exigence de plus en plus réglementaire</span>
Comme le découvre l'organisation de la mise en situation, l'accessibilité numérique n'est plus seulement une question de bonne volonté : de nombreux bailleurs institutionnels, administrations publiques et grandes entreprises l'exigent désormais contractuellement pour tout document qu'ils reçoivent ou publient. Un document inaccessible peut donc, concrètement, faire échouer une candidature ou un partenariat.
</div>

## 46.2 Le Vérificateur d'accessibilité

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 139 — Auditer l'accessibilité du rapport annuel</span>

**Objectif** : détecter automatiquement les problèmes signalés par le membre du conseil dans la mise en situation.

**Préparation** : ouvre le rapport annuel de test, contenant idéalement des images, des tableaux et plusieurs niveaux de titres.

**Étapes détaillées** :
1. Onglet **Révision**, groupe Accessibilité, clique sur **Vérifier l'accessibilité** (ou Fichier > Informations > Vérifier l'absence de problèmes > "Vérifier l'accessibilité").
2. Un volet s'ouvre à droite, listant les problèmes détectés, classés en trois niveaux de gravité :
   - **Erreurs** : contenu totalement inaccessible pour une personne handicapée (une image sans texte de remplacement, par exemple).
   - **Avertissements** : contenu difficile mais pas impossible à comprendre (un contraste de couleur insuffisant).
   - **Conseils** : améliorations recommandées sans être bloquantes (un ordre de lecture perfectible).
3. Clique sur un problème listé : le volet affiche, en bas, **"Pourquoi corriger ?"** (l'explication de l'impact réel sur l'utilisateur) et **"Procédure à suivre"** (les étapes exactes de correction), tandis que le document défile automatiquement jusqu'à l'élément concerné.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.4.2 Locate and correct accessibility issues (MO-100 Associate)</span>
L'atelier 139 correspond exactement à cet objectif. **Recommandation** : le Vérificateur d'accessibilité peut aussi rester actif en permanence pendant la rédaction (case "Garder le vérificateur d'accessibilité en cours d'exécution" dans certaines versions), signalant les problèmes au fil de l'écriture plutôt qu'en une seule passe finale.
</div>

## 46.3 Corriger les quatre erreurs d'accessibilité les plus fréquentes

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 140 — Corriger les problèmes détectés</span>

**Objectif** : rendre le rapport réellement consultable par le membre du conseil utilisant un lecteur d'écran.

**Préparation** : reprends le document audité à l'atelier 139, avec son volet de vérification ouvert.

**Étapes détaillées — les quatre corrections les plus courantes** :

1. **Texte de remplacement manquant sur une image** (erreur) : sélectionne l'image signalée, clic droit > "Modifier le texte de remplacement" (chapitre 21, section 21.8), décris concrètement le contenu et la fonction de l'image. Pour une image purement décorative sans valeur informative, coche plutôt **"Marquer comme décorative"** — le lecteur d'écran l'ignorera alors entièrement, ce qui est préférable à une description inutile qui alourdirait l'écoute.

2. **Absence de structure de titres** (erreur ou avertissement) : applique de vrais styles de titre (chapitre 9) aux passages qui font office de titres, en respectant une hiérarchie logique sans sauter de niveau (jamais un Titre 3 directement après un Titre 1).

3. **Contraste de couleur insuffisant** (avertissement) : un texte gris clair sur fond blanc, ou une couleur de thème (chapitre 18) trop pâle, devient illisible pour une personne malvoyante — corriger en assombrissant le texte ou en éclaircissant le fond jusqu'à obtenir un contraste franc.

4. **Tableau sans ligne d'en-tête** (erreur) : sélectionne le tableau, onglet contextuel Création du tableau, coche **"Ligne d'en-tête"** dans les Options de style de tableau (chapitre 26, section 26.8) — cette information permet au lecteur d'écran d'annoncer, pour chaque cellule, à quelle colonne elle appartient, transformant le "flot incompréhensible de mots" signalé dans la mise en situation en une lecture réellement structurée.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — pourquoi la ligne d'en-tête change tout dans un tableau</span>
Sans ligne d'en-tête déclarée, un lecteur d'écran lit un tableau cellule après cellule, sans contexte : "450, 280, 120, 65...". Avec une ligne d'en-tête correctement déclarée, il annonce chaque valeur avec son contexte : "Fournitures scolaires, 450 ; Transport, 280..." — une différence considérable pour la compréhension, obtenue par une simple case à cocher.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Administration</span>
Une administration publique soumise à des obligations légales d'accessibilité numérique intègre systématiquement le Vérificateur d'accessibilité à son processus de validation documentaire : aucun document ne peut être publié sur le site institutionnel tant que le vérificateur signale encore la moindre erreur de niveau "Erreur", les avertissements faisant l'objet d'un examen au cas par cas.
</div>

## 46.4 Vérifier la compatibilité avec les versions antérieures

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec le chapitre 1</span>
Le chapitre 1 signalait déjà que toutes les éditions de Word n'offrent pas les mêmes fonctionnalités, et que le scénario d'ouverture de ce manuel mentionnait un bailleur travaillant sur une "vieille version". Le <strong>Vérificateur de compatibilité</strong> répond précisément à cette préoccupation, en identifiant les éléments d'un document qui se comporteraient différemment, ou pas du tout, dans une version antérieure de Word.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Vérifier la compatibilité avant envoi à un destinataire sur ancienne version</span>

1. Onglet Fichier, **Informations**, clique sur **"Vérifier l'absence de problèmes"**, puis **"Vérifier la compatibilité"**.
2. Le rapport liste les éléments problématiques et précise, pour chacun, la version de Word concernée et le comportement attendu (par exemple : "Les modèles 3D seront convertis en images" pour un document ouvert dans Word 2013, chapitre 25).
3. Le menu déroulant **"Sélectionner les versions à afficher"** permet de cibler précisément la ou les versions du destinataire réel, plutôt que de vérifier la compatibilité avec toutes les versions historiques indistinctement.
4. Décide, pour chaque avertissement, s'il faut modifier le document (remplacer un modèle 3D par une image classique, par exemple) ou accepter la dégradation annoncée comme acceptable.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 1.4.3 Locate and correct compatibility issues (MO-100 Associate)</span>
Cette procédure correspond exactement à cet objectif, complétant le sous-domaine 1.4 avec les chapitres 42 (1.4.1) et la section précédente (1.4.2).
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Le mode de compatibilité</span>
Ouvrir un ancien fichier `.doc` (chapitre 1) dans Word moderne active automatiquement un **mode de compatibilité** (visible dans la barre de titre), désactivant certaines fonctionnalités récentes pour préserver la fidélité du document d'origine. Fichier > Informations > **"Convertir"** permet de le faire basculer vers le format moderne complet, en acceptant que le rendu puisse légèrement changer.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Rendre accessible un document volontairement problématique</span>
Crée un document de test cumulant volontairement les quatre problèmes de la section 46.3 : une image sans texte de remplacement, des titres simulés en gras plutôt qu'avec de vrais styles, un texte en gris très clair sur fond blanc, et un tableau sans ligne d'en-tête déclarée. Lance le Vérificateur d'accessibilité, corrige chaque problème signalé, puis relance-le jusqu'à n'obtenir plus aucune erreur ni avertissement.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Traiter l'accessibilité comme une correction de dernière minute</span>
Corriger l'accessibilité d'un document de cinquante pages entièrement rédigé sans vrais styles de titre (chapitre 9) demande un travail considérable — alors qu'utiliser correctement les styles dès la rédaction, comme ce manuel le recommande depuis le chapitre 9, rend cette correction presque inutile.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Rédiger un texte de remplacement inutile plutôt que de marquer l'image comme décorative</span>
Comme signalé dans l'atelier 140, décrire longuement une image purement décorative (un simple séparateur graphique, par exemple) alourdit inutilement l'écoute d'un lecteur d'écran — l'option "Marquer comme décorative" est alors préférable à une description sans valeur informative.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Sauter des niveaux dans la hiérarchie des titres</span>
Passer directement d'un Titre 1 à un Titre 3 sans Titre 2 intermédiaire (parce que la taille de police du Titre 3 plaisait davantage visuellement) casse la logique structurelle annoncée par le lecteur d'écran — la hiérarchie doit rester logique, l'apparence visuelle se réglant par la modification du style (chapitre 17) plutôt que par le choix d'un niveau inadapté.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le Vérificateur d'accessibilité signale une erreur sur une image déjà décrite</span>

- **Diagnostic** : le texte de remplacement existe peut-être mais reste trop générique ("image", "photo", "graphique1.jpg"), ce que le vérificateur peut signaler comme insuffisant.
- **Résolution** : remplacer par une description concrète du contenu et de la fonction réelle de l'image, comme recommandé au chapitre 21.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le Vérificateur de compatibilité ne signale aucun problème alors que le destinataire rencontre un affichage dégradé</span>

- **Diagnostic** : le problème vient peut-être d'une police non installée sur le poste du destinataire (chapitre 18) plutôt que d'une incompatibilité de fonctionnalité — le vérificateur ne détecte pas ce type de problème.
- **Résolution** : privilégier des polices largement répandues, ou intégrer les polices au document via Fichier > Options > Enregistrement > "Incorporer les polices dans le fichier".
</div>

## En entreprise

- **Bonne pratique répandue** : intégrer le Vérificateur d'accessibilité au processus de validation de tout document destiné à publication ou diffusion externe, au même titre que la relecture orthographique.
- **Bonne pratique répandue** : former les rédacteurs aux réflexes d'accessibilité de base (vrais styles de titre, texte de remplacement, ligne d'en-tête de tableau) dès leur arrivée, plutôt que de corriger systématiquement après coup.
- **Erreur classique observée** : des organisations découvrant tardivement, au moment de répondre à un appel d'offres, que leurs documents types ne respectent aucune exigence d'accessibilité — un travail de mise à niveau alors bien plus coûteux qu'une bonne pratique installée dès le départ.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — vérifier l'ordre de lecture d'une page complexe</span>
Sur une page combinant plusieurs objets flottants (images, zones de texte, chapitres 21-22), l'ordre dans lequel un lecteur d'écran les annonce ne correspond pas toujours à l'ordre visuel perçu à l'œil. Le volet **Sélection** (onglet Accueil > Modification > Sélectionner > "Volet Sélection") liste tous les objets d'une page dans leur ordre technique réel, permettant de les réorganiser par glisser-déposer jusqu'à obtenir une séquence de lecture cohérente.
</div>

## Résumé du chapitre

- Un document accessible reste compréhensible pour une personne utilisant un lecteur d'écran, naviguant au clavier ou percevant mal certaines couleurs — une exigence désormais souvent contractuelle ou réglementaire.
- Le Vérificateur d'accessibilité (Révision > Vérifier l'accessibilité) détecte automatiquement les problèmes, classés en Erreurs, Avertissements et Conseils — objectif MOS 1.4.2.
- Les quatre corrections les plus fréquentes concernent le texte de remplacement, la structure de titres, le contraste de couleur et la ligne d'en-tête des tableaux.
- Le Vérificateur de compatibilité identifie les éléments qui se comporteraient différemment dans une version antérieure de Word — objectif MOS 1.4.3.
- L'accessibilité s'installe bien plus facilement comme réflexe de rédaction (vrais styles, textes de remplacement) que comme correction de dernière minute.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour une image purement décorative sans valeur informative, la bonne pratique est de :
   - a) Rédiger une longue description détaillée
   - b) La marquer comme décorative
   - c) La supprimer du document
   - d) Ne rien faire du tout

2. Déclarer une ligne d'en-tête sur un tableau permet à un lecteur d'écran :
   - a) De lire le tableau plus rapidement
   - b) D'annoncer chaque valeur avec le nom de sa colonne
   - c) D'ignorer entièrement le tableau
   - d) De changer la couleur du tableau

3. Le Vérificateur de compatibilité identifie :
   - a) Les fautes d'orthographe
   - b) Les éléments qui se comporteraient différemment dans une version antérieure de Word
   - c) Les images sans texte de remplacement
   - d) Les commentaires non résolus

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un titre simplement agrandi et mis en gras est annoncé comme un titre par un lecteur d'écran. — **Faux**, seuls de vrais styles de titre le sont.
2. Le Vérificateur d'accessibilité classe les problèmes en trois niveaux de gravité. — **Vrai**.
3. Sauter du Titre 1 au Titre 3 sans Titre 2 est sans conséquence pour l'accessibilité. — **Faux**, cela casse la logique structurelle.
4. Le Vérificateur de compatibilité détecte les problèmes de polices non installées chez le destinataire. — **Faux**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique concrètement la différence d'expérience, pour une personne utilisant un lecteur d'écran, entre un tableau avec et sans ligne d'en-tête déclarée.
2. Pourquoi l'accessibilité est-elle beaucoup plus simple à assurer pendant la rédaction qu'en correction finale ?

**Corrigé 1** : sans ligne d'en-tête déclarée, le lecteur d'écran énonce les cellules les unes après les autres sans contexte ("450, 280, 120..."), obligeant l'auditeur à mémoriser mentalement la structure du tableau pour interpréter chaque valeur. Avec une ligne d'en-tête correctement déclarée, chaque valeur est annoncée avec le nom de sa colonne ("Fournitures scolaires : 450 ; Transport : 280..."), rendant le tableau immédiatement compréhensible à l'écoute.

**Corrigé 2** : parce que les principaux fondements de l'accessibilité — vrais styles de titre, textes de remplacement des images, lignes d'en-tête de tableaux — sont exactement les mêmes bonnes pratiques que ce manuel recommande depuis les chapitres 9, 21 et 26 pour d'autres raisons (navigation, table des matières, cohérence). Un document rédigé correctement dès le départ est donc déjà accessible en grande partie, alors qu'un document de cinquante pages rédigé sans styles nécessiterait une reprise structurelle complète pour atteindre le même résultat.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 46.1</span>

Sur un document de test contenant au moins une image et un tableau, lance le Vérificateur d'accessibilité et note par écrit chaque problème détecté avec son niveau de gravité (Erreur, Avertissement, Conseil).
</div>

**Corrigé :** réussi si les problèmes sont correctement identifiés et classés selon les trois niveaux de gravité affichés par le volet de vérification.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 46.2</span>

Corrige tous les problèmes détectés à l'exercice 46.1, puis relance le Vérificateur pour confirmer qu'aucune erreur ne subsiste. Lance ensuite le Vérificateur de compatibilité en ciblant une version antérieure de Word et note les éventuels avertissements obtenus.
</div>

**Corrigé :** réponse personnelle ; réussi si le second passage du Vérificateur d'accessibilité ne signale plus aucune erreur, et si les éventuels avertissements de compatibilité sont correctement identifiés et compris.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer ce qu'est un document accessible et pourquoi c'est une exigence croissante.</li>
<li>☐ J'utilise le Vérificateur d'accessibilité et je comprends ses trois niveaux de gravité.</li>
<li>☐ Je corrige les quatre problèmes d'accessibilité les plus fréquents.</li>
<li>☐ Je marque comme décorative une image sans valeur informative.</li>
<li>☐ Je vérifie la compatibilité d'un document avant envoi à un destinataire sur ancienne version.</li>
<li>☐ J'intègre l'accessibilité comme réflexe de rédaction, pas comme correction finale.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Vérificateur d'accessibilité** = Révision > Vérifier l'accessibilité, trois niveaux (Erreurs, Avertissements, Conseils) — MOS 1.4.2.
- **Quatre corrections fréquentes** : texte de remplacement, structure de titres, contraste, ligne d'en-tête de tableau.
- **Image décorative** = "Marquer comme décorative" plutôt qu'une description inutile.
- **Vérificateur de compatibilité** = Fichier > Informations > Vérifier l'absence de problèmes — MOS 1.4.3.
- **Accessibilité** = réflexe de rédaction (styles dès le départ), pas correction de dernière minute.

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Révision ou Fichier > Informations.
</div>

## FAQ

<dl class="faq">
<dt>Un document accessible dans Word reste-t-il accessible une fois exporté en PDF ?</dt>
<dd>Oui, à condition de cocher l'option "Balises de structure du document pour l'accessibilité" lors de l'export (chapitre 45, section 45.2) — sans cette option, la structure d'accessibilité soigneusement construite dans Word ne se transmet pas au PDF final.</dd>

<dt>Le Vérificateur d'accessibilité détecte-t-il tous les problèmes possibles ?</dt>
<dd>Non, il détecte les problèmes techniques les plus courants, mais ne peut pas juger de la qualité réelle d'un texte de remplacement (une description vague mais présente passera le test) ni de la clarté générale d'un document — un contrôle humain reste nécessaire en complément.</dd>

<dt>L'accessibilité concerne-t-elle uniquement les personnes malvoyantes ?</dt>
<dd>Non : une structure de titres claire bénéficie aussi à la navigation au clavier, un bon contraste aide toute personne lisant sur un écran en plein soleil, et un texte de remplacement s'affiche également quand une image ne se charge pas — l'accessibilité améliore concrètement l'expérience de tous les lecteurs, pas seulement celle des personnes handicapées.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur l'accessibilité des documents Office : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Balises de structure lors de l'export PDF : chapitre 45.

*Chapitre suivant : Word et l'écosystème Microsoft 365 — pour situer enfin l'ensemble des fonctionnalités de ce manuel dans le contexte plus large des applications qui l'entourent.*
