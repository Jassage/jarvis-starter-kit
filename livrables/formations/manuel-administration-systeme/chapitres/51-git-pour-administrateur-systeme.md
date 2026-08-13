<div class="chapitre-titre-num">CHAPITRE 51</div>

# Git pour l'administrateur système

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Honorer enfin toutes les recommandations "à versionner dans Git" semées depuis le chapitre 20 de ce manuel, en apprenant réellement à utiliser Git — pas comme un outil de développeur logiciel, mais comme la discipline qui transforme des scripts et des manifestes en une source de vérité fiable et collaborative. À la fin de ce chapitre, tu sauras cloner, commiter, créer des branches, résoudre un conflit de fusion, et protéger correctement les secrets d'un dépôt versionné.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Deux administrateurs modifient, le même après-midi et sans se concerter, le manifeste Kubernetes du portail client (chapitre 43) directement sur leurs postes respectifs — l'un ajuste les `resources.limits` (chapitre 44), l'autre modifie le nombre de réplicas. Aucun des deux fichiers n'était versionné dans Git malgré les recommandations répétées de ce manuel : le second à appliquer son `kubectl apply -f` écrase silencieusement le changement du premier, sans que personne ne s'en aperçoive avant plusieurs jours. Ce chapitre explique comment Git aurait rendu ce conflit **visible et gérable**, plutôt que silencieux et destructeur.
</div>

## 51.1 Pourquoi maintenant : le moment d'honorer une dette du manuel

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — une pratique déjà recommandée, jamais expliquée en détail</span>
Ce manuel a recommandé de "versionner dans Git" depuis le chapitre 20 (scripts Bash), puis pour les Dockerfile (chapitre 40), les fichiers Compose (chapitre 41) et les manifestes Kubernetes (chapitre 43) — sans jamais expliquer concrètement comment. Ce chapitre comble cette dette : Git n'est pas un outil réservé aux développeurs d'applications, c'est l'infrastructure de confiance qui rend chaque recommandation précédente réellement applicable.
</div>

## 51.2 Concepts fondamentaux : dépôt, commit, branche

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — l'historique complet d'un document, jamais perdu</span>
Un **dépôt** (*repository*) Git est un dossier dont chaque changement est enregistré, horodaté et attribué à son auteur — comme un traitement de texte qui garderait indéfiniment chaque version antérieure d'un document, consultable et restaurable à tout moment. Un **commit** est un instantané précis de l'état du dépôt à un moment donné, accompagné d'un message expliquant le changement. Une **branche** permet de travailler sur une version parallèle sans affecter la branche principale, avant de fusionner ce travail une fois validé.
</div>

## 51.3 Le flux de travail de base

```
# Cloner un depot existant (recuperer une copie locale complete
# avec tout son historique)
git clone https://exemple.com/portail-k8s-manifests.git

# Verifier l'etat actuel (fichiers modifies, non suivis)
git status

# Ajouter un fichier modifie a la prochaine sauvegarde (staging)
git add deployment.yaml

# Creer un commit avec un message clair (jamais vague, section 51.7)
git commit -m "Augmente les limites memoire du portail suite au pic de charge"

# Envoyer les commits locaux vers le depot partage
git push

# Recuperer les derniers changements des autres avant de commencer a travailler
git pull
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ La cause exacte du scénario d'ouverture : ne jamais oublier `git pull`</span>
Le conflit du scénario d'ouverture n'aurait jamais existé silencieusement avec Git : le second administrateur, en tentant son `git push` après avoir modifié un fichier déjà changé par le premier sans avoir fait `git pull` au préalable, aurait reçu un **refus explicite** de Git, l'obligeant à intégrer consciemment les deux changements avant de continuer — jamais une écrasement silencieux comme celui vécu avec `kubectl apply -f` directement sur des fichiers non versionnés.
</div>

## 51.4 Branches et fusion : travailler en parallèle sans se marcher dessus

```
# Creer une nouvelle branche pour un changement isole
git checkout -b ajustement-limites-memoire

# ... modifications, commits sur cette branche ...

# Revenir sur la branche principale et fusionner le travail termine
git checkout main
git merge ajustement-limites-memoire
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — une branche par changement logique</span>
Exactement le même principe déjà établi pour la revue avant tout changement de production (chapitre 2) : une branche dédiée à un changement précis, avant fusion vers la branche principale, permet une revue et une validation avant que ce changement n'affecte tout le monde — le même esprit qu'un changement normal soumis à validation, transposé au code et à la configuration.
</div>

## 51.5 Résoudre un conflit de fusion : le scénario d'ouverture, cette fois géré

```
<<<<<<< HEAD
      resources:
        limits:
          memory: "1Gi"
=======
      replicas: 6
>>>>>>> branche-autre-administrateur
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Lire un conflit ligne par ligne, sans paniquer</span>
Git signale explicitement les deux versions concurrentes d'un même fichier, délimitées par ces marqueurs — <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> jusqu'à <code>=======</code> représente la version locale, <code>=======</code> jusqu'à <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> représente la version entrante. Résoudre le conflit consiste à éditer manuellement le fichier pour conserver le résultat souhaité (ici, probablement les deux changements combinés — la nouvelle limite mémoire ET le nouveau nombre de réplicas), supprimer ces marqueurs, puis commiter la résolution.
</div>

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — un conflit Git est une bonne nouvelle, pas un échec</span>
Un conflit signifie que Git a **détecté** une divergence et demande une décision humaine consciente — exactement l'inverse du scénario d'ouverture, où le second `kubectl apply -f` a écrasé silencieusement le premier changement sans aucune détection ni décision consciente. Un conflit visible, bien que parfois frustrant à résoudre, protège contre une perte de travail silencieuse.
</div>

## 51.6 `.gitignore` : rappel direct des chapitres 20 et 41

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — ne jamais committer un secret</span>
Rappel direct des chapitres 20 (scripts) et 41 (fichiers `.env` de Docker Compose) : un fichier `.gitignore` exclut explicitement certains fichiers du suivi Git — les secrets, les fichiers `.env`, les certificats privés (chapitre 24) ne doivent **jamais** être committés, même par accident. Une fois un secret committé, il reste présent dans l'historique du dépôt même après suppression du fichier lui-même, nécessitant une réécriture complète de l'historique (une opération délicate et perturbatrice) pour l'éliminer réellement — la prévention via `.gitignore` reste bien préférable à la correction après coup.
</div>

```
# Exemple de .gitignore pour un projet de manifestes Kubernetes
.env
*.pem
*-secret.yaml
kubeconfig
```

## 51.7 Une discipline de commit : messages clairs, changements atomiques

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct de la discipline de documentation du chapitre 3</span>
Un message de commit vague ("modifications diverses", "fix") offre la même absence de valeur qu'une documentation non écrite au chapitre 3 — un bon message de commit explique **pourquoi** le changement a été fait, pas seulement ce qui a changé (visible directement dans le code lui-même). Un commit devrait aussi rester **atomique** : un seul changement logique cohérent, jamais un mélange de plusieurs modifications sans rapport entre elles, facilitant grandement la compréhension de l'historique et un éventuel retour en arrière ciblé.
</div>

## 51.8 GitOps en un mot : Git comme source de vérité de l'infrastructure

<div class="encadre astuce">
<span class="encadre-titre">💡 Une transition naturelle vers les prochains chapitres</span>
Le principe déjà appliqué informellement tout au long de ce manuel (modifier le manifeste, jamais l'objet en direct, chapitre 43) porte un nom : **GitOps**. L'état désiré de l'infrastructure est déclaré dans Git, et des outils automatisés (Ansible et Terraform, chapitres 52-55) appliquent cet état déclaré aux systèmes réels — Git devient la source de vérité unique et auditable, exactement l'aboutissement de la discipline "modifier le manifeste, jamais l'objet en direct" déjà pratiquée sans ce nom depuis le chapitre 41.
</div>

## Atelier — Résoudre le conflit du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 51 — De l'incident silencieux au conflit géré</span>

**Objectif** : reconstituer, avec Git, le scénario d'ouverture d'une façon qui aurait évité la perte silencieuse de changement.

**Préparation** : un dépôt Git local de test, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Décris la séquence de commandes Git que le premier administrateur aurait dû suivre pour committer son changement de `resources.limits`.
2. Décris ce qui se serait passé quand le second administrateur, ayant modifié `replicas` sans avoir fait `git pull` au préalable, aurait tenté son `git push`.
3. Rédige la résolution du conflit qui en résulterait, combinant les deux changements.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le premier administrateur committe et pousse normalement son changement (section 51.3). Le second, tentant de pousser sans avoir intégré ce changement au préalable, reçoit un refus de Git l'invitant à faire `git pull` d'abord — ce `pull` révèle immédiatement le conflit (section 51.5), obligeant une résolution consciente qui combine les deux changements (la nouvelle limite mémoire ET le nouveau nombre de réplicas) plutôt que la perte silencieuse de l'un des deux, exactement l'inverse de ce qui s'est réellement produit dans le scénario d'ouverture.

**Dépannage** : si tu ne sais pas quelle version garder lors d'un conflit réel, contacte directement l'auteur du changement concurrent avant de trancher seul — un conflit git révèle une divergence technique, mais sa résolution reste souvent une question de coordination humaine, pas seulement technique.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — modifier directement un système sans passer par un dépôt versionné</span>
Exactement la cause profonde du scénario d'ouverture — rappel direct de toutes les recommandations déjà semées depuis le chapitre 20 : toute configuration ou script destiné à durer doit vivre dans un dépôt Git, jamais uniquement sur le poste ou le serveur d'une seule personne.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — committer un secret par accident</span>
Rappel de la section 51.6 : une fois committé, un secret reste présent dans l'historique même après suppression apparente du fichier — la prévention via `.gitignore` reste toujours préférable à la correction après coup.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des messages de commit vagues ou des commits trop larges</span>
Rappel de la section 51.7 : un historique de commits illisible perd une grande partie de sa valeur — il devient presque aussi peu exploitable qu'une absence totale de documentation.
</div>

## Diagnostiquer un conflit de fusion

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "`git pull` échoue avec un message de conflit, je ne sais pas comment procéder"</span>

- **Diagnostic** : `git status` révèle précisément quels fichiers sont en conflit — jamais besoin de deviner, l'information est explicite.
- **Comment vérifier** : ouvrir chaque fichier signalé en conflit et repérer les marqueurs `<<<<<<<`, `=======`, `>>>>>>>` (section 51.5), qui délimitent précisément les deux versions concurrentes.
- **Résolution** : éditer manuellement le fichier pour ne conserver que le contenu final souhaité, supprimer les marqueurs, puis `git add` sur le fichier résolu et `git commit` pour finaliser la fusion — jamais paniquer ou tenter d'annuler l'opération sans comprendre la cause, une pratique qui masquerait le problème plutôt que de le résoudre.
</div>

## En entreprise

- **Bonne pratique répandue** : exiger une revue (souvent appelée *pull request* ou *merge request*) avant toute fusion vers la branche principale d'un dépôt d'infrastructure critique — le même esprit de validation avant changement déjà établi au chapitre 2, appliqué directement au code et à la configuration.
- **Bonne pratique répandue** : configurer des outils de détection automatique de secrets committés par erreur (des scanners dédiés existent), en complément du `.gitignore` préventif, pour détecter rapidement tout oubli.
- **Erreur classique observée** : une infrastructure entière gérée "à la main" sur les postes individuels des administrateurs, sans aucun dépôt Git central, jusqu'à ce qu'un incident comme celui du scénario d'ouverture révèle brutalement le coût de cette absence de discipline.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi un administrateur système, pas seulement un développeur, devrait-il maîtriser Git ?"**
Réponse attendue : les scripts, Dockerfile, fichiers Compose et manifestes Kubernetes constituent tous une forme de code d'infrastructure qui mérite le même historique, la même traçabilité et la même possibilité de retour en arrière qu'un code applicatif — Git n'est pas réservé au développement logiciel, c'est l'infrastructure de confiance pour toute configuration destinée à durer.

**Q2. "Que représentent les marqueurs `<<<<<<<`, `=======` et `>>>>>>>` dans un fichier en conflit ?"**
Réponse attendue : ils délimitent les deux versions concurrentes d'un même passage de fichier, modifiées indépendamment sur deux branches différentes — la première section (avant `=======`) représente la version locale, la seconde (après `=======`) la version entrante, à résoudre manuellement avant de pouvoir finaliser la fusion.

**Q3. "Que faire si un secret a été committé par erreur dans un dépôt Git ?"**
Réponse attendue : le secret reste présent dans l'historique même après suppression du fichier — il faut le considérer immédiatement comme compromis (le révoquer et le remplacer, exactement le réflexe déjà établi pour une clé privée compromise au chapitre 24), puis envisager une réécriture de l'historique Git si nécessaire, une opération délicate à ne jamais improviser sans procédure claire.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Configure systématiquement un `.gitignore` dès la création de tout nouveau dépôt, avant même le premier commit — prévenir un secret committé reste infiniment plus simple que de le corriger après coup.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Rédige des messages de commit qui expliquent le pourquoi, pas seulement le quoi — un historique Git bien tenu devient lui-même une forme de documentation vivante, complémentaire à la CMDB du chapitre 3.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Des commits atomiques et fréquents, plutôt que de rares commits massifs regroupant des semaines de changements, facilitent grandement l'identification de la cause d'une régression via `git log` ou un éventuel retour en arrière ciblé.
</div>

## Résumé du chapitre

- Git honore enfin les recommandations "à versionner" déjà semées depuis le chapitre 20 de ce manuel — scripts, Dockerfile, fichiers Compose, manifestes Kubernetes doivent tous vivre dans un dépôt versionné.
- Le flux de base (clone, add, commit, push, pull) suffit pour l'essentiel du travail quotidien ; les branches permettent de travailler en parallèle sans conflit destructeur.
- Un conflit de fusion Git est une divergence détectée et gérable, l'exact opposé de l'écrasement silencieux vécu dans le scénario d'ouverture sans versionnement.
- `.gitignore` doit exclure systématiquement tout secret, dès la création du dépôt — un secret committé reste dans l'historique même après suppression apparente.
- GitOps généralise le principe déjà pratiqué depuis le chapitre 41 : Git comme source de vérité unique, jamais une modification directe sur le système en production.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un commit Git représente :
   - a) Une sauvegarde complète et automatique de tout le serveur
   - b) Un instantané précis de l'état du dépôt à un moment donné, avec un message explicatif
   - c) Une branche du dépôt
   - d) Un fichier de configuration réseau

2. Un conflit de fusion Git se produit quand :
   - a) Deux personnes ont modifié le même passage d'un fichier de façon divergente
   - b) Un fichier est trop volumineux
   - c) Le dépôt est corrompu
   - d) Une branche est supprimée

3. Un secret committé par erreur dans Git puis supprimé du fichier :
   - a) Disparaît immédiatement et complètement du dépôt
   - b) Reste présent dans l'historique, nécessitant une réécriture pour l'éliminer réellement
   - c) Est automatiquement chiffré par Git
   - d) N'a jamais existé si le commit n'a pas été poussé

**Corrigé** : 1-b, 2-a, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Git est un outil réservé exclusivement aux développeurs d'applications, sans usage pour un administrateur système. — **Faux** (rappel direct de la section 51.1).
2. Un conflit de fusion Git est une bonne nouvelle plutôt qu'un échec, car il rend une divergence visible plutôt que silencieuse. — **Vrai**.
3. `git pull` avant de commencer à modifier un fichier réduit le risque de conflit ultérieur. — **Vrai**.
4. Un message de commit vague comme "modifications diverses" est acceptable tant que le code fonctionne. — **Faux** (rappel de la discipline de la section 51.7).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le scénario d'ouverture n'aurait jamais pu se produire silencieusement si les deux administrateurs avaient utilisé Git correctement.
2. Reprends le principe GitOps de la section 51.8. Explique comment il prolonge directement la bonne pratique déjà établie au chapitre 43 ("modifier le manifeste, jamais l'objet en direct").

**Corrigé 1** : sans Git, chaque administrateur modifiait sa propre copie locale du fichier et l'appliquait directement au cluster via `kubectl apply -f`, sans aucun mécanisme de détection d'une modification concurrente — le second `apply` écrase silencieusement le premier changement, sans avertissement ni trace. Avec Git, le second administrateur aurait été bloqué dès son `git push` (refus explicite faute d'avoir intégré le changement du premier via `git pull`), transformant une perte silencieuse en un conflit visible et consciemment résolu (section 51.5).

**Corrigé 2** : le chapitre 43 établissait déjà que tout changement devait passer par une modification du manifeste source suivie de `kubectl apply`, jamais une modification directe de l'objet en direct dans le cluster. GitOps généralise ce principe en désignant explicitement Git comme LA source de vérité unique de cet état désiré, avec des outils automatisés (chapitres 52-55) qui appliquent en continu cet état déclaré aux systèmes réels — la même philosophie déjà pratiquée informellement, désormais nommée et systématisée à l'échelle de toute l'infrastructure, pas seulement d'un seul cluster Kubernetes.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 51.1</span>

Un administrateur committe accidentellement un fichier `kubeconfig` contenant des identifiants d'accès complets à un cluster Kubernetes de production. Explique la démarche complète à suivre, en t'appuyant sur les sections 51.6 et le chapitre 24.
</div>

**Corrigé :** La première action, immédiate, est de considérer ces identifiants comme compromis dès le moment du commit — exactement le même réflexe déjà établi pour une clé privée TLS compromise au chapitre 24 — et de révoquer/régénérer ces accès sans délai, indépendamment de la suite. Ensuite, ajouter `kubeconfig` au `.gitignore` pour éviter toute récidive (section 51.6), puis évaluer si une réécriture de l'historique Git est nécessaire pour retirer ce fichier de tous les commits passés où il apparaît — une opération à mener avec précaution, en coordination avec toute l'équipe utilisant ce dépôt, puisqu'elle modifie l'historique partagé et nécessite que chacun resynchronise son propre clone local.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 51.2</span>

Rédige, en 3 à 5 phrases, une politique de commit à proposer à l'équipe pour que l'historique Git du dépôt de manifestes Kubernetes reste réellement exploitable dans le temps.
</div>

**Corrigé (exemple de réponse) :** Chaque commit doit représenter un seul changement logique cohérent (par exemple, un ajustement de ressources OU un changement de réplicas, jamais les deux mélangés sans rapport), avec un message expliquant la raison du changement, pas seulement sa nature technique déjà visible dans le diff. Toute modification destinée à la branche principale doit passer par une revue avant fusion (rejoignant le principe du CAB léger déjà établi au chapitre 2), et aucun commit ne doit jamais contenir de secret, vérifié systématiquement avant chaque push. Cette discipline, une fois adoptée collectivement, transforme l'historique Git en une documentation vivante et fiable de l'évolution de l'infrastructure, consultable des mois ou des années plus tard sans ambiguïté.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais utiliser le flux de base Git (clone, add, commit, push, pull).</li>
<li>☐ Je comprends l'utilité des branches pour travailler en parallèle sans conflit destructeur.</li>
<li>☐ Je sais lire et résoudre un conflit de fusion.</li>
<li>☐ Je sais configurer un `.gitignore` pour protéger les secrets dès la création d'un dépôt.</li>
<li>☐ Je sais rédiger des messages de commit clairs et des commits atomiques.</li>
<li>☐ Je comprends le principe GitOps et son lien avec la discipline déjà établie au chapitre 43.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il connaître Git en profondeur pour être un bon administrateur système ?</dt>
<dd>Le flux de base de ce chapitre (clone, add, commit, push, pull, branches, résolution de conflit simple) couvre l'immense majorité des besoins quotidiens — les fonctionnalités plus avancées (rebase interactif, cherry-pick) restent utiles mais secondaires pour un usage d'infrastructure plutôt que de développement logiciel intensif.</dd>

<dt>Où héberger un dépôt Git pour une petite équipe d'administration système ?</dt>
<dd>Des plateformes comme GitHub, GitLab ou une instance auto-hébergée conviennent toutes selon le contexte — le choix dépend de critères déjà familiers de ce manuel (chapitre 45) : coût, contrôle, intégration avec l'identité déjà en place (chapitre 8).</dd>

<dt>Peut-on annuler un commit déjà poussé vers le dépôt partagé ?</dt>
<dd>Oui, via `git revert` (qui crée un nouveau commit annulant les changements précédents, préservant l'historique complet) plutôt qu'une suppression brutale de l'historique — une pratique plus sûre en équipe, évitant de perturber le travail des autres membres déjà synchronisés sur les commits existants.</dd>

<dt>Git remplace-t-il le besoin d'une CMDB (chapitre 3) ?</dt>
<dd>Non, les deux se complètent — Git trace l'historique précis des changements de configuration et de code ; la CMDB documente une vue d'ensemble de l'infrastructure (quels systèmes, quelles relations, quelle criticité) qui dépasse le seul contenu versionné dans un dépôt de code.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Git (Pro Git Book, gratuit) : [https://git-scm.com/book/fr/v2](https://git-scm.com/book/fr/v2)
- GitHub — Guide de résolution des conflits de fusion : [https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- OWASP — Cheat Sheet sur la gestion des secrets (pertinent pour la section 51.6) : [https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

*Chapitre suivant : Ansible — fondamentaux, pour automatiser la configuration de multiples serveurs à partir de définitions versionnées dans Git, exactement la suite logique de la discipline GitOps de ce chapitre.*
