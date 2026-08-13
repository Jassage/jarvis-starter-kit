<div class="chapitre-titre-num">CHAPITRE 53</div>

# Ansible avancé : rôles, playbooks complexes et Ansible Vault

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Structurer l'automatisation Ansible à mesure qu'elle grandit, et résoudre le piège des secrets en clair déjà identifié au chapitre 52. À la fin de ce chapitre, tu sauras organiser des playbooks en rôles réutilisables, chiffrer des secrets avec Ansible Vault, personnaliser une configuration par environnement avec des templates, et déclencher des actions conditionnelles avec des handlers.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le playbook de sécurité de base du chapitre 52 a fait ses preuves — l'équipe l'étend progressivement pour couvrir la configuration complète des nouveaux serveurs (paquets, utilisateurs, pare-feu, journalisation). Après quelques semaines, le fichier unique dépasse 400 lignes, devenu difficile à lire et à maintenir. Pire, un développeur a récemment ajouté une tâche qui configure l'accès à la base de données du portail, avec le mot de passe écrit en clair directement dans le playbook — visible par quiconque a accès au dépôt Git (chapitre 51). <em>"On a le même problème qu'avec la GPO géante du chapitre 7,"</em> remarque le DSI, <em>"sauf que cette fois, il y a aussi une fuite de mot de passe en plus."</em> Ce chapitre corrige les deux problèmes.
</div>

## 53.1 Le problème d'un playbook qui grossit : rappel direct du chapitre 7

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le même principe qu'"une GPO, un objectif"</span>
Rappel direct du chapitre 7 (section 7.3) : regrouper des dizaines de tâches sans lien logique dans un seul playbook géant rend le diagnostic et la maintenance beaucoup plus difficiles qu'une structure organisée par objectif clair — exactement le même problème déjà résolu pour les stratégies de groupe, maintenant transposé à l'automatisation Ansible.
</div>

## 53.2 Les rôles : structurer l'automatisation en unités réutilisables

```
roles/
  securite_base/
    tasks/
      main.yml
    handlers/
      main.yml
    templates/
      sudoers.j2
    defaults/
      main.yml
  base_donnees/
    tasks/
      main.yml
    vars/
      main.yml
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un rôle par objectif clair, comme une GPO du chapitre 7</span>
Un **rôle** Ansible regroupe tout ce qui concerne un objectif précis (tâches, gestionnaires d'événements, modèles, variables) dans une structure de dossiers standardisée et réutilisable — exactement le même principe déjà établi pour les GPO nommées et documentées du chapitre 7, transposé à l'automatisation.
</div>

```yaml
# playbook-principal.yml, desormais court et lisible
- name: Configurer les serveurs de l'entreprise
  hosts: tous_les_serveurs
  become: true
  roles:
    - securite_base
    - base_donnees
```

## 53.3 Ansible Vault : résoudre le problème du mot de passe en clair

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — la réponse directe au piège identifié au chapitre 52</span>
**Ansible Vault** chiffre un fichier entier (souvent un fichier de variables contenant des secrets), le rendant illisible sans le mot de passe de déchiffrement — résolvant exactement le problème du scénario d'ouverture : le mot de passe de base de données peut désormais être commité dans Git sous forme chiffrée, sans jamais apparaître en clair dans l'historique du dépôt.
</div>

```
# Creer un fichier chiffre pour les variables sensibles
ansible-vault create roles/base_donnees/vars/secrets.yml

# Editer un fichier deja chiffre (demande le mot de passe du vault)
ansible-vault edit roles/base_donnees/vars/secrets.yml

# Executer un playbook utilisant des variables chiffrees
ansible-playbook -i inventaire.ini playbook-principal.yml --ask-vault-pass
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le mot de passe du vault lui-même ne doit jamais être committé</span>
Ansible Vault protège le **contenu** du fichier, mais le mot de passe utilisé pour le chiffrer/déchiffrer reste une information tout aussi sensible que le secret lui-même — le stocker dans un fichier committé dans le même dépôt Git annulerait entièrement la protection apportée par le chiffrement, exactement le même piège déjà dénoncé pour une clé privée TLS mal protégée au chapitre 24. Ce mot de passe doit être géré séparément (gestionnaire de mots de passe, variable d'environnement sur le poste de contrôle, ou un coffre-fort de secrets plus large approfondi ultérieurement).
</div>

## 53.4 Variables et templates : personnaliser par environnement

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 41</span>
Exactement le même besoin déjà résolu par les fichiers `.env` de Docker Compose (chapitre 41) : un rôle Ansible peut définir des valeurs par défaut (`defaults/main.yml`), personnalisables par groupe d'hôtes ou par environnement, sans dupliquer le rôle lui-même pour chaque contexte.
</div>

```jinja2
{# templates/sudoers.j2 -- un template Jinja2, avec une variable
   substituee dynamiquement selon le serveur cible #}
{{ groupe_dev }} ALL=(root) /usr/bin/systemctl restart {{ service_applicatif }}
```

```yaml
# defaults/main.yml du role
groupe_dev: dev_portail
service_applicatif: portail-worker
```

## 53.5 Handlers : agir seulement quand c'est réellement nécessaire

```yaml
# tasks/main.yml du role securite_base
- name: Deployer la configuration sudo
  template:
    src: sudoers.j2
    dest: /etc/sudoers.d/dev_portail
    mode: "0440"
    validate: "visudo -cf %s"
  notify: Recharger la configuration sudo

# handlers/main.yml
- name: Recharger la configuration sudo
  systemd:
    name: sudo
    state: reloaded
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Un handler ne s'exécute que si un changement réel a eu lieu</span>
Un **handler** ne se déclenche que si la tâche qui le notifie a réellement produit un changement — si le fichier de configuration sudo était déjà identique (rappel de l'idempotence, chapitre 52), aucun rechargement inutile n'est déclenché. Ce mécanisme répond directement au risque du scénario d'ouverture évoqué dans les erreurs fréquentes : sans handler, un changement de configuration pourrait être déployé sur le disque sans jamais être réellement pris en compte par le service concerné, tant qu'aucun redémarrage ou rechargement n'a été explicitement provoqué.
</div>

## 53.6 Assembler un rôle complet

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — la structure complète répond au scénario d'ouverture</span>
Un rôle `base_donnees` bien structuré combine une tâche déployant la configuration de connexion (section 53.2), un fichier de variables **chiffré** avec Ansible Vault pour le mot de passe (section 53.3), un template pour personnaliser la configuration selon l'environnement (section 53.4), et un handler qui redémarre le service applicatif uniquement si la configuration a réellement changé (section 53.5) — la réponse complète et structurée aux deux problèmes soulevés par le DSI dans le scénario d'ouverture.
</div>

## Atelier — Refactoriser le playbook du chapitre 52 en rôle sécurisé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 53 — Corriger les deux problèmes du scénario d'ouverture</span>

**Objectif** : transformer le playbook plat du chapitre 52 en un rôle structuré, avec le mot de passe de base de données protégé par Vault.

**Préparation** : accès à un environnement Ansible de test, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Réorganise le playbook `playbook-securite-base.yml` du chapitre 52 en un rôle `securite_base` avec la structure de dossiers de la section 53.2.
2. Crée un fichier de variables chiffré pour le mot de passe de la base de données, en utilisant `ansible-vault create`.
3. Ajoute un handler qui redémarre le service applicatif uniquement si sa configuration change.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les tâches de fail2ban et de mise à jour des paquets migrent vers `roles/securite_base/tasks/main.yml`. Le mot de passe de la base de données est déplacé dans `roles/base_donnees/vars/secrets.yml`, chiffré via `ansible-vault create`, jamais visible en clair dans le dépôt Git. Un handler `Redemarrer le service applicatif` est notifié uniquement par la tâche qui déploie effectivement un changement de configuration, garantissant que le service prend en compte tout changement réel sans redémarrage inutile en l'absence de changement.

**Dépannage** : si `ansible-vault edit` échoue en réclamant un mot de passe incorrect, vérifie que tu utilises bien le même mot de passe de vault que celui utilisé lors de la création initiale du fichier — ce mot de passe n'est jamais récupérable depuis le fichier chiffré lui-même, une raison supplémentaire de le gérer avec autant de rigueur qu'un secret applicatif.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un playbook géant sans structure en rôles</span>
Exactement le problème initial du scénario d'ouverture, rappel direct du principe déjà établi au chapitre 7 pour les GPO.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — stocker le mot de passe du vault à côté du fichier chiffré</span>
Rappel de la section 53.3 : cette pratique annule entièrement la protection apportée par le chiffrement, exactement comme une clé privée TLS stockée avec des permissions trop larges au chapitre 24.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — oublier un handler après une tâche de configuration</span>
Une configuration déployée sur le disque, mais jamais réellement prise en compte par le service concerné faute de redémarrage ou de rechargement — un piège qui donne une fausse impression de succès (la tâche Ansible réussit) alors que le changement réel n'est jamais devenu effectif.
</div>

## Diagnostiquer une configuration déployée mais jamais appliquée

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un playbook s'exécute avec succès, mais le comportement du service ne change pas</span>

- **Diagnostic** : vérifier si la tâche de déploiement de configuration comportait bien un `notify` vers un handler approprié (section 53.5) — une tâche qui modifie un fichier de configuration sans notifier de handler laisse le service tourner avec son ancienne configuration en mémoire, malgré un fichier sur disque déjà à jour.
- **Comment vérifier** : comparer la configuration effectivement chargée par le service (souvent consultable via une commande de diagnostic spécifique au service, ou en comparant l'horodatage du dernier redémarrage du service à celui du fichier de configuration) avec le fichier réellement présent sur le disque.
- **Résolution** : ajouter le `notify` manquant vers le handler approprié, puis redémarrer manuellement le service une première fois pour rattraper le décalage déjà accumulé avant que le playbook corrigé ne prenne le relais pour les futurs changements.
</div>

## En entreprise

- **Bonne pratique répandue** : structurer systématiquement l'automatisation en rôles dès qu'un playbook dépasse une poignée de tâches liées à un seul objectif clair, plutôt que d'attendre que la maintenance devienne pénible.
- **Bonne pratique répandue** : gérer le mot de passe du vault via un gestionnaire de secrets dédié plutôt qu'un simple fichier local, en particulier pour une équipe de plusieurs personnes ayant besoin d'un accès partagé et audité.
- **Erreur classique observée** : une organisation qui découvre, lors d'un audit de sécurité du dépôt Git, plusieurs mots de passe en clair accumulés dans l'historique de playbooks jamais passés par Ansible Vault — un rappel direct du même risque déjà évoqué au chapitre 51 pour tout secret committé par erreur.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi organiser l'automatisation Ansible en rôles plutôt qu'un seul grand playbook ?"**
Réponse attendue : un rôle regroupe tout ce qui concerne un objectif précis dans une structure réutilisable et clairement délimitée, facilitant le diagnostic et la maintenance — exactement le même principe déjà établi pour les GPO au chapitre 7 ("une GPO, un objectif"), transposé à l'automatisation.

**Q2. "Comment Ansible Vault protège-t-il un secret comme un mot de passe de base de données ?"**
Réponse attendue : il chiffre le fichier contenant ce secret, le rendant illisible sans le mot de passe du vault — permettant de committer ce fichier dans Git en toute sécurité, sans jamais exposer le secret en clair dans l'historique du dépôt.

**Q3. "Qu'est-ce qu'un handler, et pourquoi est-il important dans un playbook de configuration ?"**
Réponse attendue : un handler est une action déclenchée uniquement si la tâche qui le notifie a réellement produit un changement — il garantit qu'un service redémarre ou recharge sa configuration seulement quand c'est réellement nécessaire, évitant à la fois des redémarrages inutiles et le piège inverse d'une configuration déployée mais jamais réellement prise en compte.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne stocke jamais le mot de passe d'un vault Ansible dans le même dépôt que le fichier chiffré qu'il protège — le réflexe de sécurité le plus important de ce chapitre, directement transposé du principe déjà établi pour les clés privées au chapitre 24.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Structure chaque nouvel objectif d'automatisation en rôle dédié dès sa création, plutôt que d'ajouter des tâches à un playbook existant sans lien logique clair — une discipline qui coûte peu au moment de la création, mais qui évite la dérive vers un fichier géant illisible.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Utilise systématiquement des handlers pour les actions de redémarrage ou de rechargement plutôt que de les inclure comme tâches ordinaires — un service ne redémarre alors que lorsque c'est réellement nécessaire, évitant des interruptions de service inutiles à chaque exécution du playbook.
</div>

## Résumé du chapitre

- Un playbook qui grossit sans structure devient difficile à maintenir, exactement le même problème déjà résolu pour les GPO au chapitre 7 — les rôles apportent la même solution structurelle à l'automatisation.
- Ansible Vault chiffre les fichiers de secrets, permettant de les committer dans Git en toute sécurité, à condition que le mot de passe du vault lui-même reste géré séparément.
- Les templates Jinja2 et les variables permettent de personnaliser un rôle par environnement, sans dupliquer sa logique.
- Les handlers déclenchent une action (redémarrage, rechargement) uniquement si un changement réel a eu lieu, évitant à la fois les actions inutiles et le piège d'une configuration jamais réellement appliquée.
- Un rôle complet combine tâches, variables chiffrées, templates et handlers pour répondre de façon structurée et sécurisée à un objectif précis d'automatisation.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un rôle Ansible sert principalement à :
   - a) Chiffrer automatiquement tous les secrets
   - b) Regrouper tâches, variables et templates liés à un objectif précis, dans une structure réutilisable
   - c) Remplacer le besoin d'inventaire
   - d) Exécuter un playbook plus rapidement

2. Ansible Vault protège :
   - a) Uniquement les mots de passe SSH
   - b) Le contenu d'un fichier, en le chiffrant, permettant de le committer en toute sécurité
   - c) L'intégralité du dépôt Git automatiquement
   - d) Les connexions réseau entre le poste de contrôle et les serveurs

3. Un handler se déclenche :
   - a) À chaque exécution du playbook, sans condition
   - b) Uniquement si la tâche qui le notifie a réellement produit un changement
   - c) Uniquement le premier jour du mois
   - d) Jamais automatiquement, il nécessite toujours une confirmation manuelle

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Le mot de passe du vault Ansible peut être stocké sans risque dans le même dépôt Git que le fichier chiffré. — **Faux** (cela annule la protection, section 53.3).
2. Un handler s'exécute uniquement si un changement réel a été détecté par la tâche qui le notifie. — **Vrai**.
3. Structurer l'automatisation en rôles est utile uniquement pour de très grandes organisations. — **Faux** (utile dès qu'un playbook dépasse une poignée de tâches liées, section 53.1).
4. Un template Jinja2 permet de personnaliser une configuration selon des variables, sans dupliquer le rôle entier. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la structure en rôles d'Ansible rappelle directement le principe "une GPO, un objectif" du chapitre 7, malgré des technologies complètement différentes.
2. Reprends le scénario d'ouverture. Explique comment Ansible Vault et les rôles résolvent, chacun de leur côté, un des deux problèmes distincts soulevés par le DSI.

**Corrigé 1** : dans les deux cas, le problème sous-jacent est le même — une accumulation non structurée d'éléments individuellement corrects (des paramètres GPO, des tâches Ansible) devient, une fois regroupée sans organisation logique claire, difficile à diagnostiquer et à maintenir. La solution est également structurellement identique : regrouper par objectif cohérent (une GPO par intention claire, un rôle par objectif d'automatisation précis), permettant d'isoler rapidement la source d'un problème sans devoir parcourir un ensemble monolithique et confus.

**Corrigé 2** : les rôles (section 53.2) résolvent le premier problème — un playbook devenu trop long et difficile à maintenir — en le réorganisant en unités cohérentes et réutilisables par objectif. Ansible Vault (section 53.3) résout le second problème — un mot de passe de base de données visible en clair dans le dépôt Git — en chiffrant le fichier qui le contient, permettant de le committer en toute sécurité. Les deux solutions sont indépendantes l'une de l'autre, mais se combinent naturellement dans un rôle bien structuré, comme illustré par l'atelier de ce chapitre.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 53.1</span>

Un rôle Ansible modifie un fichier de configuration Nginx, mais n'inclut aucun `notify` vers un handler de redémarrage. Explique le symptôme que rencontrerait l'équipe après avoir exécuté ce playbook, et la correction à apporter.
</div>

**Corrigé :** Le fichier de configuration Nginx serait correctement mis à jour sur le disque, mais le processus Nginx déjà en cours d'exécution continuerait à utiliser son ancienne configuration chargée en mémoire, jusqu'à un redémarrage manuel ou un événement externe qui le relancerait — exactement le symptôme déjà décrit dans la section "Diagnostiquer une configuration déployée mais jamais appliquée" de ce chapitre. La correction consiste à ajouter `notify: Redemarrer nginx` à la tâche de déploiement de configuration, avec un handler correspondant qui exécute effectivement ce redémarrage (ou un rechargement, si Nginx le supporte sans interruption complète du service) uniquement quand la tâche produit un changement réel.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 53.2</span>

Rédige, en 3 à 5 phrases, pourquoi gérer le mot de passe du vault Ansible via un gestionnaire de secrets dédié est préférable à un simple fichier texte local sur le poste de chaque administrateur, pour une équipe de plusieurs personnes.
</div>

**Corrigé (exemple de réponse) :** Un fichier texte local sur chaque poste multiplie les copies du même secret critique, chacune potentiellement exposée différemment (poste volé, sauvegarde non chiffrée, partage accidentel) et sans aucune traçabilité de qui y accède réellement. Un gestionnaire de secrets dédié centralise ce mot de passe unique, permet de révoquer ou de faire tourner l'accès d'une personne quittant l'équipe sans devoir redistribuer un nouveau fichier à tout le monde, et offre généralement un audit de qui a consulté le secret et quand — exactement le même bénéfice de traçabilité et de contrôle centralisé déjà recherché pour l'identité depuis le chapitre 22, appliqué ici à la protection d'un secret d'automatisation.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais structurer une automatisation Ansible en rôles, par objectif clair.</li>
<li>☐ Je sais créer et éditer un fichier chiffré avec Ansible Vault.</li>
<li>☐ Je comprends pourquoi le mot de passe du vault doit être géré séparément du fichier qu'il protège.</li>
<li>☐ Je sais utiliser des variables et des templates Jinja2 pour personnaliser un rôle par environnement.</li>
<li>☐ Je sais utiliser un handler pour déclencher une action uniquement en cas de changement réel.</li>
<li>☐ Je sais diagnostiquer une configuration déployée mais jamais réellement appliquée faute de handler.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on chiffrer uniquement certaines variables d'un fichier, plutôt que le fichier entier ?</dt>
<dd>Oui, Ansible propose `ansible-vault encrypt_string` pour chiffrer une valeur individuelle, insérable directement dans un fichier de variables par ailleurs non chiffré — utile quand seule une partie des variables d'un fichier est réellement sensible, évitant de chiffrer inutilement des informations déjà publiques.</dd>

<dt>Existe-t-il des rôles Ansible déjà écrits et partagés, ou faut-il toujours tout écrire soi-même ?</dt>
<dd>Ansible Galaxy héberge une large communauté de rôles réutilisables pour des besoins courants (installation de logiciels populaires, configurations de sécurité standard) — une ressource à évaluer avant d'écrire un rôle depuis zéro, tout en gardant la même vigilance de vérification de provenance déjà établie pour les images Docker au chapitre 39.</dd>

<dt>Faut-il un mot de passe de vault différent par environnement (développement, production) ?</dt>
<dd>C'est une bonne pratique répandue, réduisant l'impact d'une compromission du mot de passe de vault de développement sur les secrets de production — chaque environnement conservant ainsi une protection indépendante des autres.</dd>

<dt>Les handlers s'exécutent-ils immédiatement, ou à un moment précis du playbook ?</dt>
<dd>Par défaut, les handlers s'exécutent à la toute fin du playbook, après l'ensemble des tâches, même si plusieurs tâches différentes ont notifié le même handler au cours de l'exécution — celui-ci ne s'exécute alors qu'une seule fois, évitant les redémarrages redondants pour plusieurs changements liés au même service.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Ansible — Rôles : [https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html)
- Documentation officielle Ansible Vault : [https://docs.ansible.com/ansible/latest/vault_guide/index.html](https://docs.ansible.com/ansible/latest/vault_guide/index.html)
- Documentation Jinja2 (moteur de templates utilisé par Ansible) : [https://jinja.palletsprojects.com/](https://jinja.palletsprojects.com/)

*Chapitre suivant : Terraform — fondamentaux, pour provisionner l'infrastructure elle-même (serveurs, réseaux, ressources cloud des chapitres 46-48) de façon déclarative, avant qu'Ansible ne prenne le relais pour la configurer.*
