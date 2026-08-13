<div class="chapitre-titre-num">CHAPITRE 18</div>

# Utilisateurs, groupes et permissions avancées : ACL et sudo

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Aller au-delà du modèle traditionnel de permissions Unix (propriétaire/groupe/autres) pour maîtriser les listes de contrôle d'accès (ACL), qui permettent des permissions fines impossibles avec le modèle classique, et `sudo`, qui permet de déléguer des privilèges précis sans jamais partager le mot de passe root. À la fin de ce chapitre, tu sauras configurer une règle `sudo` restreinte à une tâche précise, appliquer une ACL pour un besoin de collaboration réel, et éviter le piège de sécurité le plus répandu et le plus dangereux de la configuration `sudo`.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un second développeur freelance rejoint le projet de portail client. Le développeur principal, pressé de lui donner accès au serveur, ajoute la ligne suivante dans le fichier de configuration `sudo` : <code>nouveau_dev ALL=(ALL) NOPASSWD: ALL</code>. <em>"Comme ça il peut tout faire sans qu'on ait à s'en soucier"</em>, t'explique-t-il. En parallèle, les deux développeurs doivent collaborer sur un même dossier de journaux applicatifs — l'un doit pouvoir lire et écrire, l'autre seulement lire, sans que ni l'un ni l'autre ne fasse partie du même groupe Unix que le propriétaire du dossier. Ces deux besoins, mal résolus, sont exactement ce que ce chapitre corrige : une délégation de privilèges précise plutôt que totale, et une gestion de permissions fine plutôt qu'une approche binaire tout-ou-rien.
</div>

## 18.1 Rappel du modèle traditionnel et ses limites

Le modèle traditionnel Unix attribue des permissions de lecture, écriture et exécution (`rwx`) selon trois catégories : le **propriétaire** du fichier, son **groupe**, et **les autres**. Ce modèle, simple et efficace pour la majorité des cas, atteint vite ses limites dès qu'un besoin de permission plus fin apparaît.

<div class="encadre attention">
<span class="encadre-titre">⚠️ La limite exacte rencontrée dans le scénario d'ouverture</span>
Le modèle traditionnel ne permet d'attribuer qu'**un seul** jeu de permissions de groupe à un fichier ou dossier. Si deux développeurs ont besoin de permissions différentes (lecture-écriture pour l'un, lecture seule pour l'autre) sur le même dossier, sans appartenir au même groupe, le modèle traditionnel ne peut tout simplement pas exprimer cette distinction — il faudrait soit leur donner les mêmes droits à tous les deux, soit créer une architecture de groupes plus complexe que nécessaire pour un besoin aussi ponctuel.
</div>

## 18.2 Les ACL : des permissions fines par utilisateur ou groupe précis

Les **ACL** (*Access Control Lists*) étendent le modèle traditionnel en permettant d'attribuer des permissions à des utilisateurs ou groupes **spécifiques**, au-delà du simple propriétaire/groupe/autres.

```
# Consulter les ACL actuelles d'un dossier
getfacl /var/portail/journaux

# Accorder la lecture et l'ecriture a un utilisateur precis (dev_principal),
# sans toucher aux permissions traditionnelles existantes ni au groupe
setfacl -m u:dev_principal:rw /var/portail/journaux

# Accorder uniquement la lecture a un second utilisateur precis (nouveau_dev)
setfacl -m u:nouveau_dev:r /var/portail/journaux

# Appliquer recursivement une ACL a un dossier et tout son contenu existant
setfacl -R -m u:dev_principal:rw /var/portail/journaux

# Definir une ACL "par defaut" : tout nouveau fichier cree dans ce dossier
# heritera automatiquement de ces memes permissions (essentiel pour un
# dossier partage ou de nouveaux fichiers sont crees en continu)
setfacl -d -m u:dev_principal:rw /var/portail/journaux
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication de la solution au scénario d'ouverture</span>
Avec ces commandes, `dev_principal` obtient lecture et écriture sur le dossier de journaux, tandis que `nouveau_dev` obtient uniquement la lecture — exactement le besoin exprimé dans le scénario d'ouverture, sans avoir à restructurer les groupes Unix existants ni à donner les mêmes droits aux deux développeurs. L'ACL par défaut (<code>-d</code>) garantit que ce comportement s'applique aussi aux futurs fichiers de journaux créés dans ce dossier, pas seulement à ceux qui existent au moment de la commande.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un fichier avec une ACL affiche un "+" dans `ls -l`</span>
Un signe discret mais important à connaître : un fichier ou dossier disposant d'une ACL affiche un <code>+</code> à la fin de la chaîne de permissions dans la sortie de <code>ls -l</code> (par exemple <code>drwxr-x---+</code>). Ce signal indique qu'il existe des permissions supplémentaires au-delà de ce que la chaîne de permissions traditionnelle affiche seule — un réflexe utile pour repérer qu'une vérification via <code>getfacl</code> est nécessaire pour comprendre l'ensemble réel des droits sur ce fichier.
</div>

## 18.3 `sudo` : déléguer des privilèges sans partager le mot de passe root

`sudo` (*superuser do*) permet à un utilisateur autorisé d'exécuter des commandes avec les privilèges d'un autre utilisateur (généralement root), sans jamais connaître ni utiliser directement le mot de passe root lui-même. La configuration se fait dans le fichier `/etc/sudoers`, à éditer exclusivement via la commande `visudo`.

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — pourquoi `visudo` et jamais un éditeur de texte classique</span>
`visudo` verrouille le fichier pendant l'édition (évitant que deux administrateurs ne le modifient simultanément, ce qui pourrait corrompre le fichier) et surtout **valide la syntaxe avant d'enregistrer** — une erreur de syntaxe dans `/etc/sudoers` édité directement avec un éditeur classique peut bloquer purement et simplement toute utilisation de `sudo` sur le système, y compris pour la corriger, dans un cas extrême nécessitant un accès de secours pour réparer la situation.
</div>

```
# Toujours editer /etc/sudoers via visudo, jamais directement
sudo visudo

# Exemple de regle GRANULAIRE, restreinte a une tache precise :
# nouveau_dev peut redemarrer UNIQUEMENT le service nginx, rien d'autre,
# et devra saisir son propre mot de passe pour le faire
nouveau_dev ALL=(root) /usr/bin/systemctl restart nginx

# Exemple de regle utilisant un groupe plutot qu'un utilisateur individuel,
# plus maintenable a mesure que l'equipe grandit (section 18.5)
%dev_portail ALL=(root) /usr/bin/systemctl restart nginx, /usr/bin/systemctl restart portail-worker
```

## 18.4 Le piège de `ALL=(ALL) NOPASSWD: ALL`

Reprenons directement la configuration du scénario d'ouverture :

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique — `ALL=(ALL) NOPASSWD: ALL`</span>
Cette ligne accorde à l'utilisateur concerné un accès root **total et sans même redemander de mot de passe** — l'équivalent de lui confier directement le mot de passe root, mais en plus dangereux, car cet accès total devient permanent et invisible dans l'usage quotidien (aucune invite de mot de passe ne rappelle jamais que l'action en cours engage des privilèges root complets). Si le compte de ce développeur est compromis (phishing, mot de passe faible réutilisé ailleurs), l'attaquant obtient instantanément un accès root complet et silencieux au serveur entier.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — le principe du moindre privilège appliqué à `sudo`</span>
Rappel direct du chapitre 1 : chaque règle `sudo` devrait accorder exactement les commandes nécessaires à la tâche réelle de la personne concernée, ni plus ni moins. Un développeur qui a besoin de redémarrer un service applicatif précis n'a pas besoin d'un accès root total pour autant — la règle granulaire de la section 18.3 couvre son besoin réel sans lui ouvrir l'ensemble du système.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ `NOPASSWD` n'est pas systématiquement une mauvaise pratique en soi</span>
Le vrai problème du scénario d'ouverture est la combinaison de <code>ALL=(ALL)</code> (accès total, sans restriction de commande) et <code>NOPASSWD</code> (sans re-authentification), pas <code>NOPASSWD</code> à lui seul. Une règle granulaire comme <code>nouveau_dev ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx</code> reste raisonnable pour une action fréquente, peu risquée et bien définie, notamment dans un contexte d'automatisation (Partie 9) où une invite de mot de passe interactive n'a de toute façon aucun sens.
</div>

## 18.5 Organiser les permissions via des groupes plutôt qu'individuellement

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — pourquoi les groupes simplifient la maintenance à long terme</span>
Attribuer des règles `sudo` ou des ACL à des groupes plutôt qu'à des utilisateurs individuels (comme <code>%dev_portail</code> dans l'exemple de la section 18.3) simplifie considérablement la gestion à mesure que l'équipe grandit : ajouter un troisième développeur au projet ne nécessite alors qu'une seule commande (l'ajouter au groupe existant), plutôt que de dupliquer et adapter individuellement chaque règle de permission pour chaque nouvelle personne.
</div>

```
# Creer un groupe dedie au projet
sudo groupadd dev_portail

# Ajouter un utilisateur existant a ce groupe
sudo usermod -aG dev_portail nouveau_dev

# Verifier les groupes d'appartenance d'un utilisateur
groups nouveau_dev
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un changement de groupe nécessite une nouvelle session pour prendre effet</span>
Ajouter un utilisateur à un groupe avec `usermod -aG` ne modifie pas immédiatement les permissions de ses sessions déjà ouvertes — l'utilisateur doit se déconnecter et se reconnecter (ou, à défaut, exécuter `newgrp nom_du_groupe` dans sa session actuelle) pour que l'appartenance au nouveau groupe soit effectivement prise en compte. Un oubli fréquent qui fait croire, à tort, qu'une commande a échoué.
</div>

## 18.6 Auditer qui a quels droits

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — revoir périodiquement les règles sudo et les ACL existantes</span>
Exactement comme la revue périodique des accès distants recommandée au chapitre 4, les règles `sudo` et les ACL méritent un audit régulier : une règle créée pour un besoin ponctuel (comme dans le scénario d'ouverture) mais jamais retirée après que ce besoin a disparu devient un privilège fantôme, oublié mais toujours actif — exactement le type de risque de sécurité silencieux évoqué au chapitre 3 sur les comptes non désactivés.
</div>

```
# Voir l'ensemble des privileges sudo accordes a l'utilisateur courant
sudo -l

# Voir l'ensemble des privileges sudo accordes a un utilisateur precis
sudo -l -U nouveau_dev
```

## Atelier — Corriger la configuration du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 18 — Remplacer un accès total par des permissions ciblées</span>

**Objectif** : appliquer les principes de ce chapitre pour corriger les deux problèmes exacts du scénario d'ouverture.

**Préparation** : aucune installation nécessaire pour cet atelier conceptuel, ou un accès à un serveur Linux de test pour le pratiquer réellement.

**Étapes détaillées** :

1. Rédige une règle `sudo` de remplacement pour `nouveau_dev`, qui lui permette uniquement de redémarrer le service applicatif du portail (`portail-worker`) et de consulter les journaux systemd, sans accès root total.
2. Rédige les commandes ACL nécessaires pour que `dev_principal` ait lecture-écriture et `nouveau_dev` ait lecture seule sur `/var/portail/journaux`, y compris pour les futurs fichiers créés dans ce dossier.
3. Propose une explication de 3-4 phrases à donner au développeur principal, qui reconnaît son intention légitime (simplifier l'accès) tout en expliquant le risque réel de sa solution initiale.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la règle `sudo` granulaire ressemble à `nouveau_dev ALL=(root) /usr/bin/systemctl restart portail-worker, /usr/bin/journalctl -u portail-worker`. Les commandes ACL reprennent exactement celles de la section 18.2 (`setfacl -m u:dev_principal:rw ...`, `setfacl -m u:nouveau_dev:r ...`, avec l'ACL par défaut `-d` pour les futurs fichiers). L'explication au développeur principal reconnaît que son intention (faciliter le travail du nouveau collègue) est légitime, mais qu'un accès root total et sans mot de passe transforme un compte individuel compromis en risque pour le serveur entier — un risque disproportionné par rapport au gain de commodité, alors qu'une règle granulaire couvre exactement le même besoin réel sans cette exposition.

**Dépannage** : si tu hésites sur les commandes exactes autorisées dans une règle `sudo`, identifie d'abord précisément quelles commandes la personne exécute réellement au quotidien (en lui demandant directement, ou en observant son usage réel) — une règle trop restrictive découverte par un blocage frustrant se corrige facilement en l'élargissant légèrement ; une règle trop permissive découverte lors d'un incident de sécurité coûte, elle, beaucoup plus cher.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — `ALL=(ALL) NOPASSWD: ALL` par facilité</span>
Exactement le piège du scénario d'ouverture, détaillé en section 18.4 — la solution la plus rapide à écrire, mais la plus risquée, quand une règle granulaire répond presque toujours au besoin réel avec un effort à peine supérieur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — éditer `/etc/sudoers` directement sans `visudo`</span>
Rappel de la section 18.3 : une erreur de syntaxe non détectée peut bloquer l'usage même de `sudo` pour la corriger, un incident particulièrement délicat à résoudre sans accès de secours prévu à l'avance.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — oublier de retirer les règles sudo ou ACL devenues obsolètes</span>
Rappel de la section 18.6 : un privilège accordé pour un besoin ponctuel, jamais retiré après coup, devient un risque silencieux et oublié — à traiter avec la même rigueur qu'un compte utilisateur jamais désactivé après un départ (chapitre 3).
</div>

## Diagnostiquer une erreur de permission

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Permission denied" alors que l'utilisateur devrait normalement avoir accès</span>

- **Diagnostic** : vérifier d'abord les permissions traditionnelles (`ls -l`) et la présence éventuelle d'un `+` signalant une ACL (section 18.2) — un signe fréquemment ignoré par les débutants qui ne consultent que les permissions classiques.
- **Comment vérifier** : `getfacl` sur le fichier ou dossier concerné révèle l'ensemble complet des permissions réellement appliquées, au-delà de ce que `ls -l` affiche seul.
- **Résolution** : si une ACL existe et semble incorrecte, l'ajuster avec `setfacl -m` ; si aucune ACL n'existe et que le problème vient des permissions traditionnelles ou de l'appartenance à un groupe, vérifier aussi si l'utilisateur a effectivement ouvert une nouvelle session depuis son ajout au groupe concerné (section 18.5), une cause très fréquente et facile à négliger.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter (chapitre 3) chaque règle `sudo` non standard et chaque ACL appliquée sur des ressources critiques, avec leur justification — un audit de sécurité futur doit pouvoir retrouver rapidement pourquoi chaque exception existe.
- **Bonne pratique répandue** : préférer systématiquement les groupes aux règles individuelles pour toute permission destinée à plus d'une personne, exactement comme recommandé en section 18.5.
- **Erreur classique observée** : une accumulation de règles `sudo` trop larges créées dans l'urgence pour "débloquer rapidement" une situation ponctuelle, jamais resserrées après coup — un schéma qui rejoint directement le piège de l'héroïsme permanent évoqué au chapitre 1.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi les ACL sont-elles nécessaires si le modèle traditionnel Unix (propriétaire/groupe/autres) existe déjà ?"**
Réponse attendue : le modèle traditionnel ne permet qu'un seul jeu de permissions de groupe par fichier — les ACL permettent d'attribuer des permissions distinctes à plusieurs utilisateurs ou groupes spécifiques sur la même ressource, un besoin que le modèle traditionnel ne peut tout simplement pas exprimer.

**Q2. "Pourquoi `ALL=(ALL) NOPASSWD: ALL` est-il considéré comme une mauvaise pratique de sécurité ?"**
Réponse attendue : cette règle accorde un accès root total, permanent et sans re-authentification — si le compte concerné est compromis, l'attaquant obtient immédiatement un accès root complet et silencieux, sans qu'aucune barrière supplémentaire ne ralentisse ou ne détecte l'action. Une règle granulaire, limitée aux commandes réellement nécessaires, réduit fortement ce risque tout en couvrant le même besoin légitime.

**Q3. "Pourquoi faut-il toujours utiliser `visudo` plutôt qu'un éditeur de texte classique pour modifier `/etc/sudoers` ?"**
Réponse attendue : `visudo` valide la syntaxe du fichier avant de l'enregistrer, évitant qu'une erreur ne rende `sudo` inutilisable sur tout le système — un risque bien réel avec un éditeur classique, qui n'effectue aucune vérification avant l'enregistrement.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Applique systématiquement le principe du moindre privilège à chaque règle `sudo` créée : identifie la commande précise réellement nécessaire, jamais un accès total "par facilité" — le réflexe central de tout ce chapitre.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Privilégie les groupes aux règles individuelles dès que plus d'une personne est concernée par une même permission (section 18.5), et documente (chapitre 3) chaque exception non standard, avec sa justification et sa date de création — utile lors d'un futur audit périodique (section 18.6).
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un système de permissions bien conçu dès le départ (groupes cohérents, ACL utilisées uniquement quand réellement nécessaire) évite l'accumulation d'exceptions ad hoc difficiles à auditer des mois plus tard — un gain de temps direct lors de tout futur audit de sécurité ou onboarding de nouveau membre d'équipe.
</div>

## Résumé du chapitre

- Le modèle traditionnel Unix (propriétaire/groupe/autres) atteint ses limites dès qu'un besoin de permission plus fin, impliquant plusieurs utilisateurs ou groupes distincts sur une même ressource, apparaît.
- Les ACL (`getfacl`/`setfacl`) permettent d'attribuer des permissions précises à des utilisateurs ou groupes spécifiques, au-delà du modèle traditionnel.
- `sudo` doit toujours être configuré via `visudo`, avec des règles aussi granulaires que possible plutôt qu'un accès root total par facilité.
- `ALL=(ALL) NOPASSWD: ALL` est l'une des pires pratiques de sécurité `sudo`, transformant un compte individuel compromis en accès root total et silencieux.
- Les groupes simplifient la gestion des permissions à mesure qu'une équipe grandit, par rapport à des règles individuelles dupliquées pour chaque personne.
- Un audit périodique des règles `sudo` et des ACL existantes évite l'accumulation de privilèges fantômes oubliés.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le modèle traditionnel Unix de permissions se limite à :
   - a) Propriétaire, groupe, et autres
   - b) Un nombre illimité d'utilisateurs individuels
   - c) Uniquement le propriétaire
   - d) Uniquement des groupes

2. La commande pour éditer en toute sécurité le fichier `/etc/sudoers` est :
   - a) `nano /etc/sudoers`
   - b) `visudo`
   - c) `vim /etc/sudoers`
   - d) `sudo edit sudoers`

3. La règle `ALL=(ALL) NOPASSWD: ALL` accorde :
   - a) Un accès root total, permanent et sans re-authentification
   - b) Un accès limité à une seule commande
   - c) Un accès en lecture seule
   - d) Aucun accès particulier

**Corrigé** : 1-a, 2-b, 3-a.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Les ACL permettent d'attribuer des permissions distinctes à plusieurs utilisateurs spécifiques sur le même fichier. — **Vrai**.
2. Un changement de groupe via `usermod -aG` prend effet immédiatement sur toutes les sessions déjà ouvertes de l'utilisateur. — **Faux** (une nouvelle session, ou `newgrp`, est nécessaire).
3. `NOPASSWD` est toujours une mauvaise pratique de sécurité, quel que soit le contexte. — **Faux** (le vrai problème est sa combinaison avec un accès total `ALL=(ALL)`, pas `NOPASSWD` seul).
4. Un fichier avec une ACL affiche un signe distinctif (`+`) dans la sortie de `ls -l`. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une règle `sudo` granulaire est presque toujours préférable à un accès root total, même quand la personne concernée est totalement digne de confiance.
2. Reprends le scénario d'ouverture. Explique pourquoi la solution ACL est plus adaptée qu'une restructuration complète des groupes Unix existants pour ce besoin précis.

**Corrigé 1** : la confiance envers la personne n'élimine pas le risque que **son compte** soit compromis indépendamment de sa volonté (phishing, mot de passe réutilisé ailleurs, poste de travail infecté) — dans ce cas, c'est l'étendue du privilège accordé au compte, pas la confiance envers la personne, qui détermine l'ampleur des dégâts possibles. Une règle granulaire limite mécaniquement ce qu'un attaquant pourrait faire même en cas de compromission du compte, indépendamment de la fiabilité réelle de la personne elle-même.

**Corrigé 2** : restructurer les groupes Unix existants pour un besoin aussi ponctuel (deux permissions différentes sur un seul dossier) serait disproportionné et pourrait affecter d'autres ressources ou personnes utilisant déjà ces mêmes groupes pour d'autres besoins. Les ACL permettent de répondre précisément au besoin exprimé (des permissions différentes pour deux utilisateurs précis, sur une ressource précise) sans toucher à l'architecture de groupes existante ni créer d'effets de bord sur d'autres ressources ou d'autres utilisateurs du système.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Un troisième développeur rejoint le projet quelques semaines plus tard. Explique pourquoi la solution de groupe (section 18.5) mise en place dès le départ rend son intégration plus simple que si des règles `sudo` individuelles avaient été créées pour chaque développeur.
</div>

**Corrigé :** Avec une règle `sudo` basée sur le groupe `%dev_portail`, intégrer le troisième développeur se limite à l'ajouter à ce groupe existant (`usermod -aG dev_portail troisieme_dev`) — la règle `sudo` elle-même n'a besoin d'aucune modification, puisqu'elle s'applique déjà à tous les membres du groupe. Avec des règles individuelles, il aurait fallu dupliquer et adapter une nouvelle ligne de configuration `sudoers` pour ce troisième développeur, une opération plus lente et plus sujette à l'erreur (oubli d'une commande autorisée dans la nouvelle règle, incohérence progressive entre les règles de chaque développeur au fil du temps).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.2</span>

Rédige, en 3 à 5 phrases, une politique courte d'équipe sur la création de nouvelles règles `sudo`, destinée à éviter que la situation du scénario d'ouverture ne se reproduise à l'avenir.
</div>

**Corrigé (exemple de réponse) :** Toute nouvelle règle `sudo` doit être créée avec les commandes précises réellement nécessaires à la tâche concernée, jamais avec `ALL=(ALL)` sauf justification exceptionnelle documentée et validée par un second membre de l'équipe. Les règles doivent être attribuées à des groupes plutôt qu'à des utilisateurs individuels dès que plus d'une personne est concernée. Chaque règle non standard doit être documentée dans la CMDB du chapitre 3 avec sa justification, et l'ensemble des règles `sudo` actives doit faire l'objet d'une revue trimestrielle pour identifier et retirer les privilèges devenus obsolètes.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends les limites du modèle traditionnel Unix de permissions.</li>
<li>☐ Je sais utiliser `getfacl` et `setfacl` pour attribuer des permissions fines à des utilisateurs ou groupes spécifiques.</li>
<li>☐ Je sais configurer une règle `sudo` granulaire via `visudo`, plutôt qu'un accès root total.</li>
<li>☐ Je comprends pourquoi `ALL=(ALL) NOPASSWD: ALL` est une pratique de sécurité risquée.</li>
<li>☐ Je sais pourquoi privilégier les groupes aux règles individuelles pour la gestion des permissions.</li>
<li>☐ Je sais diagnostiquer une erreur "Permission denied" en tenant compte des ACL, pas seulement des permissions traditionnelles.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Les ACL sont-elles supportées par tous les systèmes de fichiers Linux ?</dt>
<dd>La plupart des systèmes de fichiers modernes (ext4, XFS) les supportent nativement, mais leur activation peut nécessiter une option de montage spécifique selon la configuration — une vérification à faire avant de compter dessus sur un système existant, notamment sur un système ancien ou configuré de façon minimaliste.</dd>

<dt>Une ACL a-t-elle priorité sur les permissions traditionnelles, ou l'inverse ?</dt>
<dd>Les ACL viennent s'ajouter aux permissions traditionnelles plutôt que de les remplacer entièrement — la règle générale est que la permission la plus spécifique (une ACL nommant précisément un utilisateur) prime sur une permission plus générale (les permissions de groupe ou "autres" traditionnelles), mais la logique exacte de priorité entre les différentes entrées mérite toujours une vérification avec `getfacl` en cas de doute, plutôt qu'une supposition.</dd>

<dt>Faut-il éviter complètement `sudo` et préférer se connecter directement en tant que root ?</dt>
<dd>Non, c'est l'inverse qui est recommandé : `sudo` garde une trace de qui a exécuté quelle commande (contrairement à une session root partagée où cette traçabilité individuelle disparaît), rejoignant directement le principe des comptes nominatifs du chapitre 4. Une connexion directe en tant que root doit rester l'exception, jamais l'usage courant.</dd>

<dt>Les outils de sauvegarde préservent-ils toujours les ACL lors d'une restauration ?</dt>
<dd>Pas systématiquement selon l'outil utilisé — une vérification explicite de ce point fait partie des bonnes pratiques de test de restauration évoquées au chapitre 1 (section 1.4), pour éviter de découvrir, après un incident réel, qu'une restauration a silencieusement perdu des permissions fines critiques.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Red Hat — Gestion des ACL : [https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/assembly_managing-file-permissions_configuring-basic-system-settings](https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/assembly_managing-file-permissions_configuring-basic-system-settings)
- Documentation officielle sudo : [https://www.sudo.ws/docs/](https://www.sudo.ws/docs/)
- CIS Benchmarks — recommandations de configuration sudo et permissions : [https://www.cisecurity.org/cis-benchmarks](https://www.cisecurity.org/cis-benchmarks)

*Chapitre suivant : sécurité Linux avec SELinux et AppArmor — une couche de protection supplémentaire, au-delà des permissions traditionnelles et des ACL, qui limite ce qu'un processus peut faire même s'il s'exécute avec les bonnes permissions Unix.*
