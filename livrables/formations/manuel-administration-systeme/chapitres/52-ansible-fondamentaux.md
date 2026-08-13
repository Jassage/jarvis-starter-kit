<div class="chapitre-titre-num">CHAPITRE 52</div>

# Ansible : fondamentaux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Automatiser la configuration de plusieurs serveurs à partir de définitions versionnées dans Git (chapitre 51), plutôt que de répéter manuellement les mêmes commandes serveur par serveur comme dans toute la Partie 3. À la fin de ce chapitre, tu sauras écrire un inventaire Ansible, comprendre le principe d'idempotence, et rédiger un playbook appliquant une configuration cohérente à l'ensemble du parc de serveurs de l'entreprise.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un audit de sécurité révèle que les serveurs Linux de l'entreprise, configurés manuellement au fil des chapitres 15 à 21 sur plusieurs mois, ont progressivement divergé les uns des autres : certains ont la configuration `sudo` granulaire recommandée au chapitre 18, d'autres non ; certains ont été mis à jour récemment, d'autres pas depuis des semaines. Cette **dérive de configuration** (*configuration drift*) n'est le résultat d'aucune négligence particulière — chaque serveur a simplement été configuré à un moment différent, par une personne différente, sans référence commune. Corriger cette dérive manuellement, serveur par serveur, prendrait des jours et introduirait probablement de nouvelles incohérences. Ansible résout précisément ce problème.
</div>

## 52.1 La dérive de configuration : un problème qui s'aggrave avec le temps

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Chaque configuration manuelle appliquée depuis le chapitre 15 (installation de paquets), le chapitre 16 (services systemd) ou le chapitre 18 (permissions sudo) était correcte **au moment où elle a été faite** — le problème n'est pas la qualité de chaque intervention individuelle, mais l'absence de mécanisme garantissant que tous les serveurs restent alignés dans le temps, à mesure que de nouveaux serveurs sont ajoutés et que les pratiques évoluent. Exactement le même problème de dérive déjà identifié pour la documentation (chapitre 3) et pour la configuration Kubernetes (chapitre 43), mais à l'échelle du système d'exploitation lui-même.
</div>

## 52.2 Ansible : sans agent, basé sur SSH déjà maîtrisé

<div class="encadre astuce">
<span class="encadre-titre">💡 Rien de nouveau à installer sur les serveurs cibles</span>
Contrairement à d'autres outils d'automatisation nécessitant l'installation d'un agent dédié sur chaque serveur géré, **Ansible** est *agentless* : il se connecte simplement via **SSH**, exactement le protocole déjà maîtrisé depuis le chapitre 4, avec l'authentification par clé déjà recommandée à cette occasion. Aucune installation supplémentaire n'est nécessaire sur les serveurs cibles — Ansible s'exécute depuis un poste de contrôle unique (souvent appelé *control node*), qui doit disposer d'un accès SSH déjà configuré vers chaque serveur.
</div>

## 52.3 L'inventaire : déclarer les serveurs à gérer

```ini
# inventaire.ini
[serveurs_web]
portail-pap.assuranceht.local
portail-cap.assuranceht.local

[serveurs_documentaire]
docmgmt.assuranceht.local

[tous_les_serveurs:children]
serveurs_web
serveurs_documentaire
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un groupe pour chaque périmètre logique</span>
L'inventaire regroupe les serveurs par catégorie logique — exactement le même principe déjà établi pour les groupes Unix du chapitre 18 (`%dev_portail` plutôt que des règles individuelles) : appliquer une configuration à un groupe entier plutôt que de répéter la même commande serveur par serveur, avec le même bénéfice de maintenabilité à mesure que de nouveaux serveurs rejoignent un groupe existant.
</div>

## 52.4 Les playbooks : déclaratif, comme la Partie 7 déjà pratiquée

```yaml
# playbook-securite-base.yml
- name: Appliquer la configuration de securite de base
  hosts: tous_les_serveurs
  become: true
  tasks:
    - name: Mettre a jour la liste des paquets
      apt:
        update_cache: true

    - name: Installer fail2ban
      apt:
        name: fail2ban
        state: present

    - name: S'assurer que fail2ban est actif et demarre au boot
      systemd:
        name: fail2ban
        state: started
        enabled: true
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la même famille de syntaxe que Docker Compose et Kubernetes</span>
Un **playbook** Ansible, écrit en YAML, décrit un état désiré — exactement la même approche déclarative déjà pratiquée pour les fichiers Compose (chapitre 41) et les manifestes Kubernetes (chapitre 43). Ce n'est pas une coïncidence : l'ensemble de l'écosystème moderne d'infrastructure converge vers cette même philosophie déclarative, que ce chapitre applique maintenant à la configuration du système d'exploitation lui-même.
</div>

## 52.5 L'idempotence : le concept le plus important de ce chapitre

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — un playbook peut être exécuté indéfiniment sans effet indésirable</span>
Un module Ansible est **idempotent** : l'exécuter plusieurs fois produit toujours le même état final, sans effet secondaire cumulatif. Le module `apt` de l'exemple précédent n'installera fail2ban qu'une seule fois — une exécution répétée du même playbook sur un serveur déjà configuré ne produira aucun changement, se contentant de vérifier que l'état désiré est déjà atteint. C'est la même propriété déjà exploitée par Kubernetes (chapitre 42) : déclarer un état désiré, laisser l'outil déterminer les actions nécessaires pour l'atteindre, plutôt que de décrire une séquence impérative de commandes à exécuter aveuglément.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un playbook non idempotent est un piège classique</span>
Un playbook contenant une commande shell brute (comme <code>ansible.builtin.shell: rm -rf /tmp/cache/*</code>) plutôt qu'un module Ansible dédié n'est **pas** garanti idempotent — l'exécuter plusieurs fois peut produire des résultats différents ou des erreurs sur des exécutions ultérieures. La bonne pratique consiste à toujours privilégier un module Ansible spécialisé (`apt`, `systemd`, `file`, `user`...) plutôt qu'une commande shell brute, précisément parce que ces modules sont conçus et testés pour être idempotents.
</div>

## 52.6 Exécuter le playbook sur le parc de serveurs

```
# Executer le playbook sur l'ensemble de l'inventaire
ansible-playbook -i inventaire.ini playbook-securite-base.yml

# Executer uniquement sur un groupe precis, pour un test cible
ansible-playbook -i inventaire.ini playbook-securite-base.yml --limit serveurs_web

# Mode "dry run" : afficher ce qui SERAIT change, sans rien appliquer
# reellement -- un reflexe de prudence avant une application en masse
ansible-playbook -i inventaire.ini playbook-securite-base.yml --check
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours tester avec `--check` avant une application massive</span>
Rappel direct du principe déjà établi pour tout changement à risque (chapitre 2) : appliquer un nouveau playbook d'un seul coup à l'ensemble du parc de serveurs, sans test préalable, expose à un risque similaire à celui déjà dénoncé pour un déploiement GPO massif sans groupe pilote (chapitre 7). Le mode `--check`, combiné à `--limit` sur un sous-ensemble restreint de serveurs, permet de valider un playbook avant sa généralisation.
</div>

## 52.7 Commandes ad-hoc : pour une vérification ponctuelle, pas une configuration durable

```
# Verifier rapidement l'espace disque sur tous les serveurs, sans
# ecrire de playbook complet pour une simple verification ponctuelle
ansible tous_les_serveurs -i inventaire.ini -a "df -h /"
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ad-hoc pour l'instantané, playbook pour la durée</span>
Une commande **ad-hoc** convient à une vérification ou une action ponctuelle et rapide sur l'ensemble du parc — un playbook reste l'outil approprié pour toute configuration destinée à durer et à être réappliquée, versionnée dans Git (chapitre 51) comme source de vérité durable.
</div>

## Atelier — Corriger la dérive de configuration du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 52 — Standardiser la configuration sudo entre serveurs</span>

**Objectif** : écrire un playbook qui applique de façon cohérente et idempotente la configuration sudo granulaire déjà recommandée au chapitre 18, sur l'ensemble du parc de serveurs Linux.

**Préparation** : accès à un environnement Ansible de test avec plusieurs hôtes, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige un playbook qui s'assure qu'un groupe `dev_portail` existe sur chaque serveur du groupe `serveurs_web`, en t'appuyant sur le module `group` d'Ansible.
2. Ajoute une tâche qui dépose un fichier de règle sudo granulaire (rappel du chapitre 18) via le module `copy` ou `template`.
3. Teste ce playbook en mode `--check` avant toute application réelle.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** :
```yaml
- name: Standardiser la configuration sudo
  hosts: serveurs_web
  become: true
  tasks:
    - name: S'assurer que le groupe dev_portail existe
      group:
        name: dev_portail
        state: present

    - name: Deployer la regle sudo granulaire
      copy:
        src: files/dev_portail_sudoers
        dest: /etc/sudoers.d/dev_portail
        mode: "0440"
        validate: "visudo -cf %s"
```
Le paramètre `validate` reprend directement la prudence déjà établie au chapitre 18 : vérifier la syntaxe avant application, exactement le rôle que jouait `visudo` manuellement, désormais automatisé et appliqué de façon identique et vérifiée sur chaque serveur.

**Dépannage** : si le playbook échoue sur un seul serveur précis parmi plusieurs, Ansible signale clairement lequel — vérifie en priorité la connectivité SSH et les permissions sudo du compte utilisé par Ansible sur ce serveur spécifique, la cause la plus fréquente d'un échec isolé.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — écrire des playbooks non idempotents avec des commandes shell brutes</span>
Rappel de la section 52.5 : privilégier systématiquement les modules Ansible dédiés plutôt qu'une commande shell arbitraire, pour garantir un comportement prévisible à chaque exécution répétée.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — appliquer un nouveau playbook à tout le parc sans test préalable</span>
Rappel de la section 52.6 : le même risque déjà dénoncé pour un déploiement massif sans groupe pilote au chapitre 7 — `--check` et `--limit` existent précisément pour éviter cette précipitation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — coder un secret en clair dans un playbook</span>
Rappel direct des chapitres 20, 40 et 51 : un mot de passe ou une clé visible en clair dans un playbook committé dans Git expose ce secret à quiconque a accès au dépôt — une solution dédiée (Ansible Vault) existe précisément pour ce besoin, approfondie au chapitre 53.
</div>

## Diagnostiquer un playbook qui échoue sur un hôte précis

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un playbook réussit sur la plupart des serveurs, mais échoue sur un ou deux hôtes précis</span>

- **Diagnostic** : Ansible signale explicitement quel hôte a échoué et à quelle tâche précise — jamais besoin de deviner, contrairement à un script manuel exécuté séparément sur chaque serveur.
- **Comment vérifier** : exécuter le playbook avec l'option `-vvv` (verbosité maximale) limité à cet hôte précis (`--limit`), révélant le détail exact de l'erreur rencontrée.
- **Résolution** : les causes les plus fréquentes sont une divergence de configuration déjà existante sur ce serveur (exactement le type de dérive évoqué dans le scénario d'ouverture), un accès SSH ou sudo insuffisant, ou une version de paquet différente empêchant le module de fonctionner comme attendu ailleurs.
</div>

## En entreprise

- **Bonne pratique répandue** : versionner l'ensemble des playbooks et inventaires dans Git (chapitre 51), avec une revue avant toute modification touchant la configuration de production.
- **Bonne pratique répandue** : exécuter régulièrement les playbooks existants en mode `--check` sur l'ensemble du parc, même sans changement prévu, pour détecter proactivement toute dérive de configuration avant qu'elle ne s'aggrave — exactement la supervision proactive déjà établie au chapitre 1, appliquée ici à la cohérence de configuration.
- **Erreur classique observée** : une organisation qui découvre, après un incident de sécurité, que seule une partie de son parc de serveurs avait effectivement reçu un correctif critique, faute d'un mécanisme garantissant une application cohérente à l'ensemble de l'infrastructure.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce que l'idempotence, et pourquoi est-ce si important en automatisation d'infrastructure ?"**
Réponse attendue : une opération idempotente produit toujours le même état final, quel que soit le nombre de fois où elle est exécutée — cette propriété permet de réappliquer un playbook en toute confiance sans se soucier de son état antérieur, contrairement à une séquence de commandes impératives qui pourrait produire des résultats différents ou des erreurs selon l'état de départ.

**Q2. "Pourquoi Ansible est-il qualifié d'outil 'agentless' ?"**
Réponse attendue : contrairement à d'autres outils d'automatisation, Ansible ne nécessite aucune installation préalable sur les serveurs gérés — il se connecte simplement via SSH depuis un poste de contrôle central, réutilisant l'infrastructure d'accès distant déjà en place.

**Q3. "Comment testerais-tu un nouveau playbook avant de l'appliquer à l'ensemble d'un parc de serveurs en production ?"**
Réponse attendue : en utilisant le mode `--check` (simulation sans application réelle) combiné à `--limit` sur un sous-ensemble restreint de serveurs, exactement le même principe de groupe pilote déjà établi pour les GPO au chapitre 7, avant toute généralisation.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne code jamais un secret en clair dans un playbook versionné — une solution dédiée existe (Ansible Vault, chapitre 53), exactement le même réflexe déjà établi pour les scripts Bash (chapitre 20) et les fichiers Compose (chapitre 41).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Privilégie systématiquement les modules Ansible dédiés plutôt que des commandes shell brutes, garantissant l'idempotence et une meilleure lisibilité du playbook pour quiconque le reprend après toi.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Ansible exécute ses tâches en parallèle sur plusieurs hôtes par défaut, avec un nombre de connexions simultanées configurable (`forks`) — un réglage à ajuster selon la taille réelle du parc de serveurs et la capacité du poste de contrôle, pour éviter de saturer inutilement les ressources disponibles.
</div>

## Résumé du chapitre

- La dérive de configuration entre plusieurs serveurs configurés manuellement au fil du temps est un problème structurel, pas un signe de négligence individuelle.
- Ansible est agentless, s'appuyant sur SSH déjà maîtrisé depuis le chapitre 4, sans installation supplémentaire sur les serveurs cibles.
- Un inventaire regroupe les serveurs par catégorie logique ; un playbook décrit, en YAML déclaratif, l'état désiré à appliquer à ces serveurs.
- L'idempotence garantit qu'un playbook peut être réexécuté indéfiniment sans effet secondaire indésirable — un principe à préserver en privilégiant les modules dédiés plutôt que des commandes shell brutes.
- `--check` et `--limit` permettent de tester un playbook avant une application massive, le même principe de prudence déjà établi pour tout changement à risque.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Ansible est qualifié d'outil "agentless" car :
   - a) Il nécessite un agent installé sur chaque serveur géré
   - b) Il se connecte via SSH, sans installation préalable sur les serveurs cibles
   - c) Il ne peut gérer qu'un seul serveur à la fois
   - d) Il fonctionne uniquement sur Windows

2. L'idempotence d'un module Ansible signifie que :
   - a) Il ne peut être exécuté qu'une seule fois
   - b) L'exécuter plusieurs fois produit toujours le même état final
   - c) Il s'exécute plus rapidement à chaque répétition
   - d) Il nécessite une confirmation manuelle à chaque exécution

3. L'option `--check` d'`ansible-playbook` permet de :
   - a) Appliquer immédiatement tous les changements
   - b) Simuler l'exécution sans appliquer réellement les changements
   - c) Supprimer le playbook après exécution
   - d) Chiffrer automatiquement les secrets du playbook

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un playbook Ansible utilisant uniquement des commandes shell brutes est garanti idempotent. — **Faux** (seuls les modules dédiés garantissent cette propriété, section 52.5).
2. Une commande ad-hoc convient à une vérification ponctuelle, tandis qu'un playbook convient à une configuration durable et versionnée. — **Vrai**.
3. Ansible nécessite l'installation d'un agent logiciel sur chaque serveur avant de pouvoir le gérer. — **Faux** (agentless, basé sur SSH, section 52.2).
4. Appliquer un nouveau playbook directement à tout un parc de production, sans test préalable, est une pratique recommandée. — **Faux** (rappel du même risque déjà dénoncé au chapitre 7).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la dérive de configuration décrite dans le scénario d'ouverture n'est la faute d'aucun administrateur en particulier.
2. Reprends l'atelier de ce chapitre. Explique pourquoi le paramètre `validate: "visudo -cf %s"` du module `copy` reprend directement un principe déjà établi au chapitre 18.

**Corrigé 1** : chaque serveur a été configuré correctement au moment de son installation ou de sa dernière intervention, par des personnes différentes, à des moments différents, sans référence commune obligatoire à suivre — le problème n'est donc pas une erreur individuelle isolée, mais l'absence structurelle d'un mécanisme garantissant que tous les serveurs restent alignés dans le temps, à mesure que l'infrastructure grandit et que les pratiques évoluent. C'est exactement le même type de problème systémique déjà identifié pour la documentation non centralisée au chapitre 3.

**Corrigé 2** : le chapitre 18 établissait que `visudo` doit toujours être utilisé pour éditer les règles sudo, car il valide la syntaxe avant d'enregistrer — une erreur de syntaxe non détectée pouvant bloquer l'usage même de `sudo` pour la corriger. Le paramètre `validate` du module `copy` reproduit exactement cette même vérification, mais de façon automatisée et systématique : le fichier n'est déployé que si sa syntaxe est validée par `visudo -cf`, empêchant qu'une erreur ne soit propagée simultanément à tous les serveurs du parc via l'automatisation, un risque bien plus grave qu'une erreur commise manuellement sur un seul serveur à la fois.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 52.1</span>

Un playbook contient la tâche suivante : `ansible.builtin.shell: echo "nouvelle ligne" >> /etc/hosts`. Explique pourquoi cette tâche n'est pas idempotente, et propose une alternative qui le serait.
</div>

**Corrigé :** Cette commande ajoute la ligne à chaque exécution du playbook, quel que soit son état actuel — après trois exécutions, la ligne apparaîtrait trois fois dans `/etc/hosts`, un résultat différent à chaque répétition, la définition même d'un comportement non idempotent (section 52.5). Une alternative idempotente utiliserait le module dédié `ansible.builtin.lineinfile`, qui vérifie d'abord si la ligne existe déjà avant de l'ajouter, garantissant qu'elle n'apparaît jamais qu'une seule fois, quel que soit le nombre d'exécutions du playbook.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 52.2</span>

Rédige, en 3 à 5 phrases, pourquoi regrouper les serveurs par catégorie logique dans l'inventaire (comme `serveurs_web` et `serveurs_documentaire`) facilite la maintenance à long terme, en t'appuyant sur le même principe déjà établi pour les groupes Unix au chapitre 18.
</div>

**Corrigé (exemple de réponse) :** Regrouper les serveurs par catégorie logique permet d'appliquer un playbook à exactement le périmètre concerné, sans devoir lister individuellement chaque serveur à chaque exécution — exactement le même bénéfice déjà établi pour les groupes Unix au chapitre 18, où ajouter un nouvel utilisateur à un groupe existant suffisait sans modifier chaque règle sudo individuellement. Quand un nouveau serveur rejoint l'infrastructure (par exemple, un troisième site avec ses propres serveurs web), il suffit de l'ajouter au bon groupe dans l'inventaire pour qu'il bénéficie automatiquement de tous les playbooks déjà définis pour ce groupe, sans réécrire aucune configuration existante.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends le problème de la dérive de configuration et comment Ansible y répond.</li>
<li>☐ Je sais écrire un inventaire regroupant des serveurs par catégorie logique.</li>
<li>☐ Je sais écrire un playbook simple utilisant des modules Ansible dédiés.</li>
<li>☐ Je comprends le principe d'idempotence et pourquoi privilégier les modules aux commandes shell brutes.</li>
<li>☐ Je sais utiliser `--check` et `--limit` pour tester un playbook avant une application massive.</li>
<li>☐ Je sais diagnostiquer un playbook qui échoue sur un hôte précis.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Ansible peut-il gérer des serveurs Windows, ou uniquement Linux ?</dt>
<dd>Ansible peut gérer des serveurs Windows via WinRM plutôt que SSH, avec des modules dédiés — les exemples de ce chapitre se concentrent sur Linux, mais les mêmes principes d'idempotence et de playbooks déclaratifs s'appliquent, avec une syntaxe de connexion adaptée.</dd>

<dt>Faut-il réécrire tous les scripts Bash déjà appris (chapitre 20) en playbooks Ansible ?</dt>
<dd>Non, les deux outils restent complémentaires selon le besoin — un script Bash reste adapté à une logique procédurale complexe ou à un diagnostic ponctuel, tandis qu'Ansible excelle pour appliquer un état de configuration cohérent à travers plusieurs serveurs, un besoin structurellement différent.</dd>

<dt>Combien de temps faut-il pour automatiser l'ensemble de la configuration déjà apprise manuellement dans ce manuel ?</dt>
<dd>Cela dépend de l'ampleur du parc et de la complexité des configurations existantes — une approche progressive, commençant par les configurations les plus critiques ou les plus sujettes à la dérive (comme la sécurité de base du scénario d'ouverture), reste plus réaliste qu'une automatisation complète immédiate de toute l'infrastructure.</dd>

<dt>Ansible peut-il aussi provisionner de nouvelles ressources cloud (chapitres 46-48), pas seulement configurer des serveurs existants ?</dt>
<dd>Oui, Ansible dispose de modules pour de nombreux fournisseurs cloud, mais Terraform (chapitres 54-55) reste généralement l'outil de référence pour le provisionnement d'infrastructure, Ansible excellant davantage dans la configuration de systèmes déjà existants — une distinction approfondie dans les prochains chapitres.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Ansible : [https://docs.ansible.com/](https://docs.ansible.com/)
- Ansible — Guide sur l'idempotence et les meilleures pratiques de modules : [https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html](https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html)
- Ansible Galaxy — répertoire de rôles et collections communautaires : [https://galaxy.ansible.com/](https://galaxy.ansible.com/)

*Chapitre suivant : Ansible avancé — rôles, playbooks complexes et Ansible Vault, pour protéger les secrets et structurer une automatisation à l'échelle de toute l'infrastructure de l'entreprise.*
