<div class="chapitre-titre-num">CHAPITRE 41</div>

# Coauteur en temps réel (OneDrive, SharePoint, Teams)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer les conditions nécessaires à la coédition en temps réel ; partager un document avec des permissions adaptées à chaque destinataire ; coéditer simultanément avec d'autres personnes en voyant leurs modifications apparaître en direct ; consulter et restaurer une version antérieure d'un document via son historique de versions ; et choisir, parmi tous les outils de collaboration vus dans cette Partie 10, celui adapté à chaque situation réelle, pour mener à bien le mini-projet de fin de partie.
</div>

**Matrice de compétences MOS**

Ce chapitre ne correspond à aucun objectif isolé du référentiel MOS Word (MO-100/MO-101) : la coédition en temps réel dépend de l'infrastructure Microsoft 365 (OneDrive/SharePoint) plutôt que d'une fonctionnalité Word testable isolément. Il reste néanmoins essentiel pour comprendre la collaboration moderne, prolongeant directement les chapitres 38 à 40. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitres 38, 39 et 40, dont ce chapitre montre l'alternative moderne pour la plupart des scénarios de collaboration.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Après avoir découvert au chapitre 40 la complexité de combiner plusieurs copies séparées d'un même rapport, ta responsable demande s'il n'existerait pas un moyen plus simple pour que la trésorière, la secrétaire et elle-même travaillent ensemble sur le même rapport annuel, en même temps, sans jamais avoir à comparer ou combiner quoi que ce soit après coup. Ce chapitre répond directement à cette question, et clôt la Partie 10 en remettant en perspective l'ensemble des outils de collaboration déjà vus.
</div>

## 41.1 Les conditions de la coédition en temps réel

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec le chapitre 1</span>
La coédition en temps réel nécessite que le document soit enregistré sur un espace de stockage cloud Microsoft 365 — **OneDrive** (espace personnel) ou **SharePoint** (espace d'équipe ou d'organisation), déjà mentionnés au chapitre 1 comme composant de l'écosystème Microsoft 365. Un document enregistré uniquement en local sur un disque dur ne peut **jamais** être coédité en temps réel, quelle que soit la version de Word utilisée.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Déplacer un document local vers OneDrive pour activer la coédition</span>

1. Si le document est actuellement enregistré en local, Fichier > Enregistrer sous (chapitre 5), choisis **OneDrive** comme emplacement plutôt que "Ce PC".
2. Une fois le document effectivement stocké sur OneDrive, le bouton **Partager** (coin supérieur droit de la fenêtre Word) devient pleinement actif.
</div>

## 41.2 Partager un document avec des permissions adaptées

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 126 — Inviter la trésorière et la secrétaire sur le rapport</span>

**Objectif** : donner accès au rapport annuel aux deux collaboratrices de la mise en situation, avec des permissions appropriées.

**Préparation** : reprends le document du rapport annuel, déjà déplacé sur OneDrive.

**Étapes détaillées** :
1. Clique sur **Partager** en haut à droite de la fenêtre Word.
2. Tape l'adresse e-mail de la trésorière, choisis **"Peut modifier"** dans le menu déroulant de permission (plutôt que "Peut afficher", réservé à un simple lecteur sans droit d'édition).
3. Ajoute un court message d'accompagnement si souhaité, clique sur **Envoyer** : la trésorière reçoit un e-mail avec un lien direct vers le document partagé.
4. Alternativement, clique sur **"Copier le lien"** pour obtenir une adresse à transmettre par un autre canal (message Teams, par exemple) plutôt que par e-mail direct — utile pour partager rapidement via une conversation déjà en cours.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — bien choisir le niveau de permission</span>
Accorder "Peut modifier" à un destinataire qui n'aurait dû avoir qu'un accès en lecture ("Peut afficher") expose le document à des modifications non souhaitées — toujours réfléchir au rôle réel de chaque destinataire avant de valider le partage, plutôt que d'accorder par réflexe le niveau de permission le plus large.
</div>

## 41.3 Coéditer simultanément

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 127 — Observer la coédition en action</span>

**Objectif** : constater concrètement comment plusieurs personnes travaillent ensemble sur le même document, sans jamais avoir besoin de fichiers séparés à combiner (contrairement au chapitre 40).

**Préparation** : le document partagé de l'atelier 126, ouvert simultanément par au moins deux personnes (ou simulé en ouvrant le même fichier OneDrive depuis deux comptes ou deux appareils différents).

**Étapes détaillées** :
1. Chaque personne ayant le document ouvert voit, en haut à droite de la fenêtre Word, une petite icône ronde colorée représentant chaque autre personne actuellement connectée au même document.
2. Lorsqu'une personne tape du texte, un curseur coloré portant son nom apparaît en temps réel à l'endroit exact où elle écrit, visible par tous les autres coauteurs sans qu'aucune actualisation manuelle ne soit nécessaire.
3. Les modifications de chacun s'intègrent directement dans le même fichier unique, sans jamais créer de copies séparées à comparer ou combiner ensuite (contrairement au scénario du chapitre 40).
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — pourquoi ceci élimine le problème du chapitre 40</span>
Puisqu'il n'existe jamais qu'un seul fichier, jamais de copies séparées créées indépendamment par chaque personne, le problème central du chapitre 40 (combiner des contributions dispersées) ne se pose <strong>tout simplement plus</strong> — la coédition en temps réel prévient le problème à la racine plutôt que de le résoudre après coup.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Une équipe commerciale rédigeant conjointement une proposition client urgente utilise la coédition en temps réel via un dossier SharePoint partagé, chaque membre contribuant sa section pendant qu'un autre relit et ajuste simultanément la mise en forme générale — un gain de temps considérable comparé à un envoi séquentiel du même fichier par e-mail entre chaque contributeur.
</div>

## 41.4 Consulter et restaurer l'historique des versions

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le lien avec le chapitre 5</span>
Rappel du chapitre 5 (section sur la gestion des fichiers) : des noms de fichiers comme "rapport final V2 VRAIMENT final.docx" trahissaient l'absence d'un vrai contrôle de versions. Un document stocké sur OneDrive/SharePoint dispose nativement d'un <strong>historique de versions</strong>, éliminant ce problème sans jamais renommer manuellement un seul fichier.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 128 — Restaurer une version antérieure du rapport</span>

**Objectif** : récupérer une version du document précédant une modification jugée indésirable.

**Préparation** : reprends le document partagé, modifié à plusieurs reprises au fil des ateliers précédents.

**Étapes détaillées** :
1. Onglet **Fichier**, clique sur **Informations**, puis **"Historique des versions"** (ou clic droit sur le fichier directement dans l'interface web de OneDrive/SharePoint, hors de Word).
2. Une liste chronologique de toutes les versions enregistrées automatiquement s'affiche, chacune horodatée et associée au nom de la personne l'ayant enregistrée.
3. Clique sur une version antérieure pour la prévisualiser dans une fenêtre séparée, sans encore rien modifier du document actuel.
4. Si cette version antérieure doit être restaurée, clique sur **"Restaurer"** : elle devient la version actuelle, l'historique conservant malgré tout une trace de toutes les versions précédentes, y compris celle qui vient d'être remplacée.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
L'historique de versions élimine le besoin de créer manuellement des copies de sauvegarde nommées "v1", "v2", "backup" — une pratique désormais obsolète pour tout document stocké sur OneDrive/SharePoint, l'historique natif remplissant ce rôle de façon plus fiable et sans encombrer inutilement les dossiers de fichiers redondants.
</div>

## 41.5 Choisir le bon outil de collaboration selon la situation

<div class="encadre astuce">
<span class="encadre-titre">💡 Synthèse de toute la Partie 10</span>

| Situation | Outil adapté |
|---|---|
| Plusieurs personnes doivent travailler en même temps, en temps réel | Coédition (ce chapitre) |
| Une seule personne relit et propose des corrections concrètes à valider | Suivi des modifications (chapitre 38) |
| Une question ou remarque de fond sans proposition de changement précis | Commentaire (chapitre 39) |
| Deux versions déjà existantes doivent être comparées après coup | Comparer (chapitre 40) |
| Plusieurs copies indépendantes déjà créées doivent être réunies | Combiner (chapitre 40) |
| Une version antérieure doit être récupérée | Historique des versions (ce chapitre) |

Ces six outils ne s'excluent pas mutuellement : un même projet collaboratif combine souvent plusieurs d'entre eux à différentes étapes — par exemple, une coédition en temps réel pour la rédaction initiale, puis un suivi des modifications pour la relecture finale avant validation.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Simuler un cycle collaboratif complet</span>
En t'appuyant sur le tableau de synthèse ci-dessus, décris par écrit, pour un projet collaboratif de ton choix (un mémoire de groupe, un rapport d'équipe), quel outil de la Partie 10 utiliser à chaque étape : rédaction initiale à plusieurs, relecture par un tiers extérieur au projet, question ponctuelle sur un passage, récupération d'une version antérieure après une erreur.
</div>

## Mini-projet de fin de partie

<div class="encadre exercice">
<span class="encadre-titre">🏗️ Mini-projet — Cycle de relecture collaboratif complet</span>

**Contexte** : ce mini-projet combine l'intégralité de la Partie 10 (chapitres 38 à 41) en un scénario collaboratif complet, du premier brouillon à la validation finale.

**Objectif** : simuler, sur un document de test d'au moins trois pages, un cycle complet de collaboration pour une organisation fictive de ton choix.

**Livrables attendus** :
1. Une phase de **rédaction collaborative** simulée (ou réellement testée si un second poste/compte est disponible) via un document stocké sur OneDrive, partagé avec au moins une permission "Peut modifier" (section 41.2).
2. Une phase de **relecture sous suivi des modifications** (chapitre 38), avec au moins quatre corrections distinctes, acceptées ou rejetées individuellement.
3. Au moins deux **commentaires** (chapitre 39), dont un résolu et un supprimé.
4. Une démonstration de **Comparer** (chapitre 40) entre une version antérieure et la version finale, pour vérifier que toutes les modifications attendues sont bien présentes.
5. Une consultation de l'**historique des versions** (ce chapitre), avec restauration d'au moins une version antérieure à titre de test.

**Critères de réussite** : le document final ne contient plus aucune modification suivie en attente ni aucun commentaire non résolu ; la comparaison entre la première et la dernière version confirme la cohérence de l'ensemble des modifications apportées au fil du cycle.

**Format de restitution suggéré** : un court compte rendu par écrit décrivant chaque étape du cycle et l'outil utilisé, accompagné du document final.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Tenter la coédition sur un document enregistré uniquement en local</span>
Comme signalé en section 41.1, la coédition en temps réel est techniquement impossible sans un stockage cloud (OneDrive/SharePoint) — un document local, même partagé par e-mail en pièce jointe, ne permettra jamais cette fonctionnalité.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Accorder "Peut modifier" par réflexe à tout destinataire</span>
Comme signalé dans l'atelier 126, ce choix par défaut sans réflexion expose le document à des modifications potentiellement non désirées de la part de destinataires qui n'auraient dû avoir qu'un accès en lecture.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Continuer à créer des copies nommées "v1", "v2" malgré l'historique natif</span>
Comme signalé en section 41.4, cette habitude devenue inutile encombre les dossiers de fichiers redondants alors que l'historique de versions natif remplit ce rôle de façon plus fiable et automatique.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le bouton Partager reste grisé ou inactif</span>

- **Diagnostic** : le document n'est probablement pas encore enregistré sur OneDrive/SharePoint, ou la connexion au compte Microsoft n'est pas active.
- **Résolution** : vérifier Fichier > Enregistrer sous et déplacer le document vers OneDrive si nécessaire (section 41.1), puis vérifier la connexion au compte Microsoft (chapitre 2).
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les modifications d'un coauteur n'apparaissent pas en temps réel</span>

- **Diagnostic** : une connexion Internet instable ou l'enregistrement automatique désactivé (chapitre 4) peut retarder la synchronisation entre coauteurs.
- **Résolution** : vérifier que l'enregistrement automatique est bien activé (interrupteur en haut à gauche de la fenêtre Word) et que la connexion Internet reste stable.
</div>

## En entreprise

- **Bonne pratique répandue** : privilégier systématiquement le stockage sur OneDrive/SharePoint pour tout document appelé à être modifié par plus d'une personne, plutôt qu'un fichier local envoyé par e-mail à chaque nouvelle version.
- **Bonne pratique répandue** : réfléchir explicitement au niveau de permission ("Peut modifier" contre "Peut afficher") accordé à chaque destinataire avant de partager, plutôt que d'accorder systématiquement le niveau le plus large.
- **Erreur classique observée** : des équipes continuant à s'envoyer des pièces jointes par e-mail avec des noms de fichiers de plus en plus confus, alors qu'un simple déplacement vers un espace partagé aurait éliminé ce problème dès le départ.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — coéditer directement depuis une conversation Teams</span>
Un document Word partagé dans un canal ou une conversation Microsoft Teams peut être ouvert et coédité directement dans l'interface web de Teams, sans même ouvrir l'application Word Desktop séparément — une intégration qui prolonge directement l'écosystème Microsoft 365 déjà évoqué au chapitre 1, particulièrement adaptée à une équipe qui communique déjà principalement via Teams.
</div>

## Résumé du chapitre

- La coédition en temps réel nécessite un document stocké sur OneDrive ou SharePoint, jamais un simple fichier local.
- Partager un document implique de choisir consciemment le niveau de permission ("Peut modifier" contre "Peut afficher") adapté à chaque destinataire.
- La coédition affiche les curseurs colorés de chaque coauteur en temps réel, éliminant à la racine le besoin de comparer ou combiner des copies séparées (chapitre 40).
- L'historique des versions natif de OneDrive/SharePoint remplace avantageusement les anciennes conventions de nommage manuel ("v1", "v2") du chapitre 5.
- Les six outils de collaboration de la Partie 10 (coédition, suivi des modifications, commentaires, comparer, combiner, historique de versions) se combinent selon les besoins réels d'un même projet, plutôt que de s'exclure mutuellement.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La coédition en temps réel nécessite que le document soit enregistré :
   - a) Sur un disque dur local uniquement
   - b) Sur OneDrive ou SharePoint
   - c) Au format PDF
   - d) Sur une clé USB

2. Pour permettre à un destinataire de modifier un document partagé, il faut choisir la permission :
   - a) Peut afficher
   - b) Peut modifier
   - c) Lecture seule
   - d) Aucune permission n'est nécessaire

3. L'historique des versions remplace avantageusement :
   - a) Le suivi des modifications
   - b) Les noms de fichiers manuels comme "v1", "v2", "final"
   - c) Les commentaires
   - d) La correction orthographique

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un document enregistré uniquement en local peut être coédité en temps réel. — **Faux**.
2. La coédition en temps réel élimine le besoin de comparer ou combiner des copies séparées du même document. — **Vrai**.
3. Restaurer une version antérieure supprime définitivement toutes les versions plus récentes de l'historique. — **Faux**, l'historique conserve une trace de toutes les versions.
4. Les six outils de collaboration de la Partie 10 s'excluent mutuellement, un seul pouvant être utilisé par projet. — **Faux**, ils se combinent selon les besoins.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la coédition en temps réel élimine le problème rencontré au chapitre 40 (combiner plusieurs copies indépendantes).
2. Une équipe continue à s'envoyer un rapport par e-mail entre chaque contributeur, avec des noms de fichiers de plus en plus confus. Quelle solution lui recommandes-tu, et pourquoi ?

**Corrigé 1** : le chapitre 40 traitait le cas où plusieurs personnes travaillent chacune sur sa **propre copie séparée** du même document original, nécessitant ensuite de réunir ces copies distinctes. La coédition en temps réel élimine ce problème à la racine puisqu'il n'existe jamais qu'un **seul fichier unique**, modifié simultanément par toutes les personnes concernées — il n'y a donc jamais de copies séparées à comparer ou combiner après coup.

**Corrigé 2** : recommander de déplacer le document vers un espace partagé OneDrive ou SharePoint (section 41.1) et d'activer la coédition en temps réel plutôt que de continuer à s'envoyer des pièces jointes — cela élimine à la fois le problème de versions confuses (grâce à l'historique de versions natif, section 41.4) et le besoin de combiner des copies séparées après coup (section 41.3), tout en permettant un travail réellement simultané plutôt que séquentiel par e-mail.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 41.1</span>

Déplace un document de test vers OneDrive, partage-le avec une permission "Peut afficher" pour un destinataire fictif et "Peut modifier" pour un autre, puis vérifie la différence de comportement attendue pour chacun.
</div>

**Corrigé :** réussi si le destinataire "Peut afficher" ne peut effectivement pas modifier le contenu du document, tandis que celui en "Peut modifier" en a la capacité complète.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 41.2</span>

Sur ce même document, effectue trois modifications successives (avec enregistrement automatique actif), puis consulte l'historique des versions pour identifier et restaurer la version précédant la dernière modification.
</div>

**Corrigé :** réponse personnelle ; réussi si la version restaurée correspond bien à l'état du document juste avant la troisième et dernière modification, confirmant le bon fonctionnement de l'historique.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais que la coédition en temps réel nécessite OneDrive ou SharePoint.</li>
<li>☐ Je partage un document en choisissant consciemment le niveau de permission adapté.</li>
<li>☐ Je comprends comment la coédition affiche les modifications de chaque coauteur en temps réel.</li>
<li>☐ Je consulte et restaure une version antérieure via l'historique des versions.</li>
<li>☐ Je choisis l'outil de collaboration adapté à chaque situation parmi ceux de la Partie 10.</li>
<li>☐ J'ai mené à bien le mini-projet combinant l'ensemble de la Partie 10.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Coédition en temps réel** = nécessite OneDrive/SharePoint, jamais un fichier local.
- **Permissions** = toujours choisir consciemment entre "Peut modifier" et "Peut afficher".
- **Historique des versions** = remplace les conventions de nommage manuel "v1", "v2".
- **Six outils complémentaires** = coédition, suivi des modifications, commentaires, comparer, combiner, historique — à combiner selon le besoin réel.

Aucun raccourci clavier dédié : toutes les commandes passent par le bouton Partager et l'onglet Fichier.
</div>

## FAQ

<dl class="faq">
<dt>Peut-on coéditer un document avec quelqu'un qui n'a pas de compte Microsoft ?</dt>
<dd>Oui, selon les paramètres de partage de l'organisation, un lien "Toute personne disposant du lien" peut permettre l'accès sans compte Microsoft, bien qu'un compte reste nécessaire pour bénéficier de l'attribution nominative des modifications.</dd>

<dt>L'historique des versions a-t-il une limite de temps ou de nombre de versions conservées ?</dt>
<dd>Cela dépend de la configuration de l'espace OneDrive/SharePoint et de la formule Microsoft 365 souscrite ; en usage courant, un nombre substantiel de versions reste conservé sur une durée largement suffisante pour un usage professionnel normal.</dd>

<dt>Peut-on désactiver la coédition en temps réel si elle n'est pas souhaitée sur un document précis ?</dt>
<dd>Oui, en restreignant les permissions de partage (retirer l'accès "Peut modifier" aux autres personnes) ou en travaillant temporairement hors ligne, le document redevenant alors modifiable uniquement par la personne connectée à ce moment.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur la coédition et le partage de documents : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101), confirmant l'absence d'objectif pour ce chapitre : voir `assets/mos-objectifs.md` dans ce manuel.
- Écosystème Microsoft 365 (OneDrive, SharePoint, Teams) : chapitre 1 et chapitre 47.

*Chapitre suivant : la Partie 11 s'ouvre sur la protection des documents, en commençant par la protection par mot de passe et la restriction d'édition — pour sécuriser un document une fois sa phase collaborative terminée.*
