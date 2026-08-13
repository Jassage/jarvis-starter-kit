<div class="chapitre-titre-num">CHAPITRE 17</div>

# Styles de texte et styles rapides

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer précisément ce qu'est un style et pourquoi il dépasse la simple mise en forme visuelle ; créer un nouveau style de paragraphe et un nouveau style de caractère, adaptés à un besoin récurrent de tes documents ; modifier un style existant par les deux méthodes possibles, et comprendre pourquoi cette modification se répercute partout où le style est utilisé ; comprendre la hiérarchie entre un style, son style de base et le style du paragraphe suivant ; et copier des styles d'un document ou d'un modèle vers un autre grâce à l'Organisateur de styles.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Créer des styles de paragraphe et de caractère | MO-101 Word Expert — Use Advanced Editing and Formatting Features | 2.3.1 |
| Modifier des styles existants | MO-101 Word Expert — Use Advanced Editing and Formatting Features | 2.3.2 |
| Copier des styles vers d'autres documents ou modèles | MO-101 Word Expert — Use Advanced Editing and Formatting Features | 2.3.3 |

Ce chapitre est entièrement composé d'objectifs de niveau **Expert (MO-101)** — logique, puisque la maîtrise réelle des styles (au-delà de leur simple application, déjà couverte au chapitre 9, objectif Associate 2.2.4) est ce qui distingue un utilisateur avancé d'un utilisateur occasionnel de Word.

**Prérequis** : chapitre 9 (application de styles rapides existants) et chapitre 10 (mise à jour d'un style depuis une sélection, déjà entrevue).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Depuis plusieurs chapitres, ce manuel répète une même idée : un vrai style de titre porte une information structurelle que Word exploite (navigation par titres au chapitre 6, table des matières promise au chapitre 28). Mais jusqu'ici, tu n'as utilisé que les styles **déjà fournis** par Word. Ta responsable te demande maintenant de créer un style "Alerte financière" propre à l'ONG — un paragraphe encadré, en gras rouge sombre, utilisé chaque fois qu'un montant dépasse un seuil critique dans les rapports — et de le rendre disponible dans tous les futurs rapports de l'organisation, pas seulement celui en cours. Ce chapitre t'apprend enfin à créer, modifier et transférer tes propres styles, plutôt que de te limiter à ceux que Word propose par défaut.
</div>

## 17.1 Ce qu'est réellement un style

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — synthèse de tout ce que ce manuel a déjà dit sur les styles</span>
Un <strong>style</strong> est un ensemble nommé et réutilisable d'attributs de mise en forme (police, taille, couleur, interligne, retraits, bordures...), appliqué en un clic et modifiable <strong>globalement</strong> en un seul geste, partout où il est utilisé dans un document. C'est l'exact opposé de la mise en forme manuelle attribut par attribut (chapitres 9 et 10), qui exige de tout reconstruire à la main à chaque nouvel usage et de tout corriger un par un si un changement global est nécessaire.
</div>

Word distingue plusieurs types de styles, chacun avec sa propre portée :

| Type de style | S'applique à | Exemple |
|---|---|---|
| **Style de paragraphe** | Un paragraphe entier (alignement, interligne, retraits, ET attributs de caractère) | Titre 1, Normal, Citation |
| **Style de caractère** | Une sélection de texte à l'intérieur d'un paragraphe, sans toucher à ses réglages de paragraphe | Emphase, Référence subtile |
| **Style de liste** | Le format d'une liste à puces ou numérotée (chapitre 11) | Liste à puces |
| **Style de tableau** | L'apparence globale d'un tableau (chapitre 26) | Grille du tableau |
| **Style lié (paragraphe+caractère)** | Se comporte comme un style de paragraphe si appliqué à un paragraphe entier, comme un style de caractère si appliqué à une simple sélection | Titre 1 (en réalité un style lié) |

## 17.2 Créer un nouveau style de paragraphe

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 42 — Créer le style "Alerte financière" demandé</span>

**Objectif** : créer, de zéro, le style personnalisé exigé par la mise en situation d'ouverture.

**Préparation** : ouvre un document de test, tape un court paragraphe d'exemple ("Attention : ce poste budgétaire dépasse le seuil critique de 15% ce mois-ci.").

**Étapes détaillées** :
1. Mets en forme ce paragraphe exactement comme souhaité pour le style final : gras, couleur rouge sombre, bordure et trame de fond légère (chapitre 10, section 10.4).
2. Sélectionne le paragraphe ainsi mis en forme.
3. Dans la galerie de styles rapides (onglet Accueil, chapitre 9), clique sur la petite flèche en bas à droite de la galerie pour l'ouvrir en volet complet, puis clique sur **"Créer un style"** en bas de ce volet (ou, plus directement, sur l'icône "+" si disponible selon la version).
4. Nomme le style **"Alerte financière"**, puis clique sur **"Modifier..."** pour ouvrir la boîte de dialogue complète de création de style plutôt que de valider directement.
5. Vérifie le champ **"Type de style"** : laisse **"Paragraphe"** (puisque ce style doit inclure les réglages de bordure et de trame, propres au paragraphe entier, pas seulement au texte).
6. Clique sur **OK** : le nouveau style "Alerte financière" apparaît désormais dans la galerie de styles rapides, prêt à être réappliqué en un clic à tout autre paragraphe du document.

**Résultat attendu** : appliquer "Alerte financière" à n'importe quel autre paragraphe reproduit instantanément gras, couleur, bordure et trame de fond — sans reconstruire manuellement chaque attribut comme il aurait fallu le faire chapitre par chapitre jusqu'ici.

**Dépannage** : si le style créé n'apparaît pas dans la galerie de styles rapides d'un autre document ouvert séparément, c'est normal à ce stade : un style créé ainsi reste local au document actif, sauf transfert explicite (section 17.6).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.3.1 Create paragraph and character styles (MO-101 Expert), première partie</span>
L'atelier 42 correspond exactement à cet objectif pour un style de paragraphe. **Piège fréquent** : oublier de vérifier le "Type de style" lors de la création — un style pensé pour un paragraphe entier (bordure, trame) créé par erreur en "Caractère" ne proposera pas ces réglages, limités aux styles de paragraphe.
</div>

## 17.3 Créer un style de caractère

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 43 — Créer un style de caractère "Montant critique"</span>

**Objectif** : créer un style plus ciblé, appliqué à un simple mot ou une valeur à l'intérieur d'une phrase, sans affecter tout le paragraphe.

**Préparation** : reprends le document de l'atelier 42. Dans un paragraphe de texte courant, sélectionne uniquement un montant chiffré (par exemple "45 000 HTG").

**Étapes détaillées** :
1. Mets en forme cette seule sélection : gras et couleur rouge, sans toucher au reste du paragraphe.
2. Ouvre le volet complet des styles (comme en section 17.2), clique sur **"Créer un style"**, nomme-le **"Montant critique"**.
3. Clique sur "Modifier...", et vérifie cette fois que le champ **"Type de style"** est bien réglé sur **"Caractère"** plutôt que "Paragraphe".
4. Valide avec **OK**.

**Résultat attendu** : ce style peut désormais s'appliquer à n'importe quel mot ou groupe de mots à l'intérieur d'un paragraphe, sans jamais affecter l'alignement, l'interligne ou les retraits de ce paragraphe — contrairement au style de paragraphe de la section précédente.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.3.1 Create paragraph and character styles (MO-101 Expert), deuxième partie</span>
L'atelier 43 complète cet objectif pour un style de caractère. **Distinction à retenir pour l'examen** : appliquer un style de **paragraphe** à une simple sélection de mots l'applique en réalité à tout le paragraphe englobant ; un style de **caractère** reste, lui, strictement limité à la sélection exacte.
</div>

## 17.4 Modifier un style existant

Deux méthodes distinctes permettent de modifier un style déjà créé — connaître les deux est nécessaire, l'examen pouvant tester l'une ou l'autre.

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 44 — Modifier "Alerte financière" par les deux méthodes</span>

**Objectif** : comparer la méthode rapide (déjà vue au chapitre 10) et la méthode complète.

**Préparation** : reprends le document avec le style "Alerte financière" créé à l'atelier 42, appliqué à au moins deux paragraphes différents du document.

**Étapes détaillées — Méthode 1, rapide (déjà vue chapitre 10)** :
1. Modifie manuellement l'un des paragraphes utilisant "Alerte financière" (par exemple, agrandis légèrement la taille du texte).
2. Sélectionne ce paragraphe modifié, clic droit sur "Alerte financière" dans la galerie de styles rapides, puis **"Mettre à jour Alerte financière pour correspondre à la sélection"**.
3. Observe : **tous** les autres paragraphes utilisant ce style, dans tout le document, adoptent instantanément la même modification.

**Étapes détaillées — Méthode 2, complète** :
1. Clic droit sur "Alerte financière" dans la galerie, puis **"Modifier..."**.
2. La boîte de dialogue complète de modification de style s'ouvre, identique à celle de création (section 17.2), permettant de tout régler explicitement plutôt que de partir d'une sélection déjà modifiée.
3. Modifie par exemple la couleur, valide avec **OK** : le changement se propage de la même façon à tous les paragraphes utilisant ce style.

**Résultat attendu** : les deux méthodes aboutissent au même résultat final (une modification propagée partout), mais la première part d'un exemple concret déjà modifié dans le document, la seconde part directement des réglages abstraits sans exemple préalable.

**Dépannage** : si la modification ne se propage qu'à un seul paragraphe plutôt qu'à tous, vérifie que les autres paragraphes utilisent bien exactement le même style nommé "Alerte financière", et non une simple mise en forme manuelle qui l'imite visuellement (chapitre 9, rappel sur les vrais styles contre l'imitation manuelle).
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.3.2 Modify existing styles (MO-101 Expert)</span>
L'atelier 44 correspond exactement à cet objectif, avec ses deux méthodes. **Recommandation** : la méthode 2 (boîte de dialogue complète) est généralement plus fiable en situation d'examen car elle ne dépend pas d'un exemple correctement pré-modifié dans le document.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — pourquoi c'est la véritable puissance des styles</span>
C'est précisément cette propagation automatique qui distingue un style d'une simple mise en forme manuelle répétée : modifier "Alerte financière" une seule fois met à jour instantanément <strong>tous</strong> les paragraphes du document qui l'utilisent, même s'ils sont au nombre de cinquante répartis sur cent pages — un gain de temps qu'aucune mise en forme manuelle, même assistée par le Pinceau (chapitre 9), ne peut égaler pour une modification globale ultérieure.
</div>

## 17.5 La hiérarchie des styles : style de base et style du paragraphe suivant

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un style peut être construit "sur la base" d'un autre style (<strong>style de base</strong>) : il en hérite tous les attributs, sauf ceux explicitement redéfinis. Modifier le style de base modifie alors aussi, par ricochet, tous les styles qui en dérivent — sauf sur les attributs qu'ils redéfinissent eux-mêmes. Chaque style définit aussi un <strong>style du paragraphe suivant</strong> : le style que Word applique automatiquement au nouveau paragraphe créé en appuyant sur `Entrée` à la fin d'un paragraphe utilisant ce style.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Exemple concret</span>
Le style "Titre 1" a souvent pour style de paragraphe suivant "Normal" — logique, puisqu'après avoir tapé un titre et appuyé sur `Entrée`, on s'attend à écrire du texte courant, pas un second titre. Ce réglage, invisible à l'usage courant mais bien réel, explique pourquoi taper directement après un titre bascule automatiquement en texte normal sans action supplémentaire.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — configurer le style du paragraphe suivant pour "Alerte financière"</span>
Dans la boîte de dialogue de modification du style (section 17.4), le champ **"Style du paragraphe suivant"** peut être réglé sur "Normal" pour "Alerte financière" — garantissant qu'après avoir tapé une alerte financière et appuyé sur `Entrée`, le paragraphe suivant revient automatiquement à une mise en forme de texte courant, plutôt que de perpétuer par erreur le style d'alerte sur du texte qui n'en a pas besoin.
</div>

## 17.6 Copier des styles vers un autre document ou modèle

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 45 — Transférer "Alerte financière" vers tous les futurs rapports</span>

**Objectif** : répondre à la dernière partie de la mise en situation d'ouverture — rendre le style disponible au-delà du seul document actuel.

**Préparation** : reprends le document contenant "Alerte financière" et "Montant critique".

**Étapes détaillées** :
1. Onglet Accueil, ouvre le volet complet des styles (flèche en bas à droite de la galerie), puis clique sur le bouton **"Gérer les styles"** en bas du volet.
2. Dans la boîte de dialogue qui s'ouvre, clique sur **"Importer/Exporter..."** : l'**Organisateur** s'ouvre, affichant deux colonnes — les styles du document actif à gauche, les styles de Normal.dotm (ou d'un autre modèle/document ouvert au choix) à droite.
3. Sélectionne "Alerte financière" et "Montant critique" dans la colonne de gauche, clique sur **"Copier"** : ils apparaissent désormais aussi dans la colonne de droite.
4. Si la destination est Normal.dotm (chapitre 4, section 4.5), ces styles deviendront disponibles dans **tout futur document vierge**, exactement comme demandé.
5. Ferme l'Organisateur, puis confirme l'enregistrement des modifications au modèle si demandé.

**Résultat attendu** : ouvrir un tout nouveau document vierge sur ce même poste affiche désormais "Alerte financière" et "Montant critique" directement dans la galerie de styles rapides, sans avoir eu à les recréer.

**Dépannage** : si les styles n'apparaissent toujours pas dans un nouveau document après cette procédure, vérifie que la destination choisie dans l'Organisateur était bien Normal.dotm et non un autre document ou modèle ouvert par erreur au même moment.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 2.3.3 Copy styles to other documents or templates (MO-101 Expert)</span>
L'atelier 45 correspond exactement à cet objectif. **Piège fréquent en examen** : confondre "copier vers Normal.dotm" (rend le style disponible pour tout futur document vierge, comme au chapitre 4) et "copier vers un modèle spécifique" (ne rend le style disponible que pour les documents basés sur ce modèle précis, chapitre 19) — bien vérifier la destination sélectionnée dans l'Organisateur avant de valider.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un cabinet juridique ayant développé des styles spécifiques pour ses contrats (clauses numérotées, mentions légales encadrées) les transfère systématiquement, via l'Organisateur, vers le modèle officiel de contrat de l'organisation (chapitre 19) plutôt que vers Normal.dotm — garantissant que ces styles n'apparaissent que dans le contexte pertinent (rédaction de contrats), sans encombrer la galerie de styles de documents sans rapport.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Construire une famille de styles cohérente</span>
Crée trois styles de paragraphe liés par une hiérarchie de base logique : un style "Titre ONG" (base pour les deux suivants), un style "Sous-titre ONG" (basé sur "Titre ONG" mais avec une taille réduite et une couleur différente), et un style "Corps ONG" pour le texte courant. Modifie ensuite uniquement "Titre ONG" (par exemple, change sa couleur de base) et observe si "Sous-titre ONG" hérite de ce changement ou non, selon les attributs qu'il a lui-même redéfinis.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Créer un style de caractère quand un style de paragraphe était nécessaire</span>
Comme signalé en section 17.2, un style destiné à inclure des réglages de paragraphe (bordure, retrait, interligne) doit être créé en "Type de style : Paragraphe" ; créé par erreur en "Caractère", ces réglages resteront simplement indisponibles, sans message d'erreur explicite pour le signaler.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier un style intégré de Word sans en mesurer la portée</span>
Modifier directement "Titre 1" ou "Normal" (des styles intégrés, pas personnalisés) affecte instantanément tout document basé sur le même modèle qui utilise ces styles — un changement large et parfois inattendu si l'intention initiale n'était que de corriger un seul paragraphe. Créer un **nouveau** style personnalisé, basé sur "Titre 1" si besoin (section 17.5), est souvent plus sûr que de modifier directement le style intégré.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier la destination lors du transfert de styles</span>
Comme signalé dans l'atelier 45, copier un style vers le mauvais document ou modèle dans l'Organisateur (colonne de droite mal choisie) rend le transfert inutile pour l'usage réellement visé, sans qu'aucune erreur ne soit signalée à l'écran.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un style créé dans un document n'apparaît pas dans un autre document déjà ouvert</span>

- **Diagnostic** : un style créé via "Créer un style" (sans passage par l'Organisateur) reste local au document où il a été créé, sauf transfert explicite.
- **Résolution** : utiliser l'Organisateur (section 17.6) pour copier explicitement le style vers Normal.dotm ou vers le document/modèle cible.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : modifier un style ne semble affecter qu'un seul paragraphe</span>

- **Diagnostic** : le paragraphe qui ne change pas n'utilise probablement pas réellement ce style (mise en forme manuelle imitant visuellement le style, chapitre 9), ou porte un style au nom similaire mais distinct.
- **Résolution** : cliquer dans chaque paragraphe concerné et vérifier, dans le volet Styles, quel style est réellement actif et surligné pour ce paragraphe précis.
</div>

## En entreprise

- **Bonne pratique répandue** : créer une famille de styles personnalisés cohérente pour l'identité visuelle d'une organisation (titres, alertes, citations), transférée une fois pour toutes vers Normal.dotm ou vers un modèle officiel (chapitre 19), plutôt que reconstruite manuellement dans chaque document.
- **Bonne pratique répandue** : éviter de modifier directement les styles intégrés de Word (Titre 1, Normal) sur un poste partagé, en préférant des styles personnalisés dérivés, pour ne pas surprendre d'autres utilisateurs habitués aux styles standards.
- **Erreur classique observée** : des styles personnalisés créés isolément par chaque employé d'une même équipe, produisant une incohérence visuelle entre documents censés partager la même identité, faute d'un transfert centralisé via l'Organisateur.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — le volet "Inspecteur de style"</span>
Le lanceur de boîte de dialogue du groupe Styles (chapitre 9) propose, en bas du volet, une icône **"Inspecteur de style"**, qui détaille précisément, pour la sélection active, le style de paragraphe appliqué, le style de caractère éventuellement superposé, et toute mise en forme manuelle ajoutée par-dessus le style — un outil de diagnostic précieux pour comprendre pourquoi un paragraphe ne se comporte pas exactement comme le style qu'il est censé utiliser.
</div>

## Résumé du chapitre

- Un style est un ensemble nommé d'attributs, modifiable globalement en un seul geste, contrairement à la mise en forme manuelle qui doit être reconstruite et corrigée attribut par attribut.
- Cinq types de styles existent : paragraphe, caractère, liste, tableau, et lié (comme "Titre 1"), chacun avec sa propre portée.
- Un nouveau style se crée depuis une sélection déjà mise en forme, via "Créer un style", en vérifiant bien le type de style souhaité — objectif MOS Expert 2.3.1.
- Un style existant se modifie soit rapidement (depuis un exemple modifié, "Mettre à jour pour correspondre à la sélection"), soit complètement (boîte de dialogue "Modifier...") — objectif MOS Expert 2.3.2.
- Un style de base et un style du paragraphe suivant définissent une hiérarchie et un enchaînement automatique entre styles.
- L'Organisateur (Gérer les styles > Importer/Exporter) transfère des styles vers un autre document ou modèle, notamment Normal.dotm pour une disponibilité universelle — objectif MOS Expert 2.3.3.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un style de caractère, contrairement à un style de paragraphe, ne peut pas inclure :
   - a) Une couleur de police
   - b) Un attribut gras
   - c) Une bordure de paragraphe
   - d) Une taille de police

2. Modifier un style via "Mettre à jour pour correspondre à la sélection" :
   - a) N'affecte que le paragraphe sélectionné
   - b) Affecte tous les paragraphes utilisant ce même style dans le document
   - c) Supprime le style
   - d) Fonctionne uniquement sur les styles de caractère

3. Pour rendre un style disponible dans tout futur document vierge, il faut le copier vers :
   - a) Le Presse-papiers Office
   - b) Normal.dotm via l'Organisateur
   - c) La barre d'outils Accès rapide
   - d) Le dictionnaire personnalisé

**Corrigé** : 1-c, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un style créé dans un document est automatiquement disponible dans tous les autres documents ouverts. — **Faux**, sauf transfert explicite via l'Organisateur.
2. Le style du paragraphe suivant détermine le style appliqué après un appui sur `Entrée`. — **Vrai**.
3. Modifier directement un style intégré comme "Titre 1" n'affecte que le document en cours d'édition. — **Vrai** (sauf transfert ultérieur vers un modèle partagé).
4. Un style de paragraphe et un style de caractère peuvent tous deux être créés depuis le même volet de styles. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi créer un nouveau style personnalisé est souvent préférable à modifier directement un style intégré comme "Normal" ou "Titre 1".
2. Un collègue a créé un superbe style d'alerte dans un document, mais se plaint qu'il doive le recréer à chaque nouveau rapport. Que lui recommandes-tu ?

**Corrigé 1** : modifier directement un style intégré affecte tout document existant ou futur basé sur le même modèle et utilisant ce style, un changement large aux conséquences parfois imprévues. Créer un nouveau style personnalisé, éventuellement basé sur le style intégré (section 17.5), permet d'obtenir l'effet désiré sans modifier le comportement des styles standards que d'autres documents ou utilisateurs continuent d'utiliser sans changement.

**Corrigé 2** : utiliser l'Organisateur (Gérer les styles > Importer/Exporter, section 17.6) pour copier ce style vers Normal.dotm — il deviendra alors automatiquement disponible dans tout nouveau document vierge créé sur ce poste, sans avoir à le reconstruire manuellement à chaque rapport.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.1</span>

Crée un style de paragraphe personnalisé nommé "Citation ONG" (retrait gauche et droit, italique, taille légèrement réduite), applique-le à deux paragraphes différents d'un même document, puis modifie-le une seule fois pour vérifier que les deux paragraphes se mettent à jour simultanément.
</div>

**Corrigé :** réussi si la modification appliquée au style se répercute instantanément sur les deux paragraphes utilisant "Citation ONG", sans qu'aucune modification manuelle supplémentaire n'ait été nécessaire sur le second paragraphe.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 17.2</span>

Utilise l'Organisateur pour copier ce style "Citation ONG" vers Normal.dotm, puis ouvre un tout nouveau document vierge pour vérifier qu'il apparaît bien dans la galerie de styles rapides sans avoir été recréé.
</div>

**Corrigé :** réponse personnelle ; réussi si "Citation ONG" apparaît directement dans la galerie de styles d'un nouveau document vierge, confirmant le succès du transfert vers Normal.dotm.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer pourquoi un style dépasse la simple mise en forme visuelle.</li>
<li>☐ Je crée un style de paragraphe et un style de caractère, en choisissant le bon type.</li>
<li>☐ Je modifie un style existant par les deux méthodes possibles.</li>
<li>☐ Je comprends le rôle du style de base et du style du paragraphe suivant.</li>
<li>☐ Je transfère un style vers un autre document ou modèle via l'Organisateur.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Style de paragraphe** = tout le paragraphe (dont mise en forme de caractère) ; **style de caractère** = une sélection seulement — MOS 2.3.1.
- **Modifier un style** = "Mettre à jour pour correspondre à la sélection" (rapide) ou "Modifier..." (complet) — MOS 2.3.2.
- **Style de base** = héritage d'attributs ; **style du paragraphe suivant** = enchaînement automatique après `Entrée`.
- **Organisateur** (Gérer les styles > Importer/Exporter) = transfert vers un autre document ou modèle, notamment Normal.dotm — MOS 2.3.3.

Aucun raccourci clavier dédié dans ce chapitre : toutes les actions passent par le volet Styles ou ses boîtes de dialogue associées.
</div>

## FAQ

<dl class="faq">
<dt>Puis-je supprimer un style personnalisé que je ne veux plus voir dans une galerie encombrée ?</dt>
<dd>Oui, un clic droit sur le style dans le volet complet des styles propose "Supprimer [Nom du style]" — les paragraphes qui l'utilisaient reviennent alors généralement au style "Normal".</dd>

<dt>Un style de tableau (chapitre 26) fonctionne-t-il selon les mêmes principes que les styles de paragraphe et de caractère ?</dt>
<dd>Oui, dans sa logique générale (nommé, réutilisable, modifiable globalement), mais avec des réglages spécifiques aux tableaux (bordures par zone, bandes alternées) plutôt qu'aux paragraphes ou aux caractères.</dd>

<dt>Les styles personnalisés survivent-ils à un envoi du document à un collègue par e-mail ?</dt>
<dd>Oui, un style créé dans un document (et non seulement transféré vers Normal.dotm) fait partie intégrante du fichier `.docx` lui-même et voyage avec lui, contrairement à un style transféré uniquement vers le modèle local d'un poste.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la création et la gestion des styles : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Application des styles aux modèles de document : chapitre 19.

*Chapitre suivant : thèmes du document — pour comprendre comment un thème visuel s'articule avec les styles vus dans ce chapitre, au niveau de tout un document plutôt que d'un style isolé.*
