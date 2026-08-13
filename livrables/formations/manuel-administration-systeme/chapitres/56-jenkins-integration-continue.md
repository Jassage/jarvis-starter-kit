<div class="chapitre-titre-num">CHAPITRE 56</div>

# Jenkins et intégration continue pour l'infrastructure

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Automatiser l'exécution des playbooks Ansible et des plans Terraform à chaque changement versionné dans Git (chapitre 51), plutôt que de les exécuter manuellement depuis le poste individuel d'un administrateur. À la fin de ce chapitre, tu sauras écrire un pipeline Jenkins déclaratif, déclencher son exécution sur un commit Git, insérer une étape d'approbation avant tout changement de production, et protéger les identifiants utilisés par le pipeline.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Malgré l'adoption de Terraform (chapitres 54-55) et d'Ansible (chapitres 52-53), chaque exécution reste lancée manuellement depuis le poste d'un administrateur — avec sa propre version de Terraform installée, son propre fichier de configuration local, et aucune trace centralisée de qui a exécuté quoi, quand, et avec quel résultat. Un jour, deux administrateurs découvrent qu'ils utilisent des versions différentes de Terraform, produisant des plans légèrement différents pour la même configuration. <em>"On a résolu le ClickOps du chapitre 54,"</em> observe le DSI, <em>"mais on a maintenant un problème similaire avec l'exécution elle-même de nos outils d'automatisation."</em> Ce chapitre centralise cette exécution via Jenkins.
</div>

## 56.1 Le problème de l'exécution manuelle, même avec de bons outils

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un problème de cohérence d'exécution, pas de qualité des outils</span>
Terraform et Ansible eux-mêmes ne sont pas en cause dans le scénario d'ouverture — le problème est l'**absence d'un environnement d'exécution centralisé et cohérent**. Chaque poste individuel peut avoir une version différente d'un outil, un accès réseau différent, ou une configuration locale légèrement divergente — exactement le même problème "ça marche sur ma machine" déjà résolu pour les applications par Docker au chapitre 39, ici appliqué à l'exécution des outils d'infrastructure eux-mêmes.
</div>

## 56.2 Jenkins : un serveur d'intégration continue

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — un poste de travail centralisé et toujours identique</span>
**Jenkins** est un serveur qui exécute des tâches automatisées (des "pipelines") de façon centralisée et reproductible — chaque exécution se déroule dans un environnement contrôlé et cohérent, plutôt que sur le poste variable de chaque administrateur. C'est l'équivalent, pour l'exécution des outils d'infrastructure, de ce que Docker apporte à l'exécution d'une application : un environnement toujours identique, indépendant de la machine qui déclenche l'opération.
</div>

## 56.3 Le Jenkinsfile : un pipeline déclaratif, encore une fois

```groovy
// Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Recuperer le code') {
            steps {
                checkout scm
            }
        }
        stage('Terraform Plan') {
            steps {
                sh 'terraform init'
                sh 'terraform plan -out=tfplan'
            }
        }
        stage('Approbation') {
            steps {
                input message: 'Appliquer ce plan en production ?'
            }
        }
        stage('Terraform Apply') {
            steps {
                sh 'terraform apply tfplan'
            }
        }
    }
}
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la même famille de syntaxe déclarative, une nouvelle fois</span>
Le Jenkinsfile décrit un ensemble d'étapes (*stages*) de façon déclarative — exactement la même philosophie déjà rencontrée en YAML (Docker Compose, Kubernetes, Ansible) et en HCL (Terraform), désormais appliquée à l'orchestration de l'exécution elle-même. Cette convergence de style à travers tout l'écosystème d'infrastructure n'est pas un hasard : elle facilite la transposition de compétences déjà acquises d'un outil à l'autre.
</div>

## 56.4 Déclencher le pipeline sur un commit Git

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Le push devient le déclencheur, rappel direct du chapitre 51</span>
Jenkins peut se connecter au dépôt Git (chapitre 51) et déclencher automatiquement un pipeline à chaque push — transformant `git push` en point de départ d'une chaîne automatisée et cohérente, plutôt qu'une simple sauvegarde suivie d'une exécution manuelle séparée sur le poste d'un administrateur. Cette automatisation garantit qu'un changement de configuration ne peut jamais être appliqué sans avoir d'abord transité par Git — rendant structurellement impossible le scénario d'ouverture du chapitre 43 (modifier un objet en direct sans passer par le fichier source).
</div>

## 56.5 L'étape d'approbation : rappel direct du principe de revue

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — jamais d'application automatique en production sans validation humaine</span>
L'étape `input` du Jenkinsfile de la section 56.3 met le pipeline en pause, affichant le plan Terraform généré et attendant une validation humaine explicite avant de poursuivre vers `terraform apply` — exactement le même principe déjà établi pour la revue avant fusion Git (chapitre 51) et le CAB léger du chapitre 2 : un changement de production ne devrait jamais s'appliquer automatiquement sans qu'une personne n'ait explicitement confirmé avoir revu ce qui va réellement changer.
</div>

## 56.6 Agents Jenkins : garantir un environnement d'exécution reproductible

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect du chapitre 39</span>
Un **agent** Jenkins exécute réellement les étapes du pipeline — souvent, en pratique moderne, un conteneur Docker avec une version précise et figée de Terraform et Ansible, exactement le même principe déjà établi au chapitre 39 pour garantir une reproductibilité totale : le pipeline s'exécute toujours dans le même environnement, peu importe l'agent physique qui l'héberge, résolvant directement le problème de versions divergentes du scénario d'ouverture.
</div>

```groovy
pipeline {
    agent {
        docker { image 'hashicorp/terraform:1.9' }
    }
    // ... stages identiques
}
```

## 56.7 Protéger les identifiants utilisés par le pipeline

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le même principe déjà établi pour Ansible Vault et le state Terraform</span>
Un pipeline Jenkins a souvent besoin d'identifiants sensibles (accès AWS/Azure, mot de passe du vault Ansible du chapitre 53) — Jenkins propose un système de gestion des identifiants (*Credentials*) qui les stocke chiffrés et les injecte dans le pipeline sans jamais les afficher en clair dans les journaux d'exécution, exactement le même principe de protection déjà établi pour les secrets Ansible et le fichier d'état Terraform.
</div>

```groovy
stage('Terraform Apply') {
    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
    }
    steps {
        sh 'terraform apply tfplan'
    }
}
```

## Atelier — Construire le pipeline complet du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 56 — Centraliser l'exécution Terraform</span>

**Objectif** : assembler un pipeline Jenkins complet répondant au problème du scénario d'ouverture.

**Préparation** : accès à une instance Jenkins de test, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige un Jenkinsfile combinant un agent Docker figé (section 56.6), les étapes de checkout, plan, approbation et apply (section 56.3), et l'injection sécurisée des identifiants AWS (section 56.7).
2. Explique comment ce pipeline élimine spécifiquement le problème de versions divergentes observé dans le scénario d'ouverture.
3. Propose une règle d'équipe interdisant désormais l'exécution manuelle de `terraform apply` en dehors de ce pipeline.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le pipeline complet combine tous les éléments des sections précédentes de ce chapitre. L'agent Docker figé (section 56.6) garantit que chaque exécution utilise exactement la même version de Terraform, quel que soit l'administrateur qui déclenche le pipeline via un push Git — éliminant structurellement la divergence de versions du scénario d'ouverture. La règle d'équipe pourrait être formulée : "Toute application de changement d'infrastructure passe désormais exclusivement par le pipeline Jenkins ; un `terraform apply` exécuté manuellement en dehors de ce pipeline est considéré comme un incident à signaler", exactement le même esprit de discipline déjà établi pour "modifier le manifeste, jamais l'objet en direct" au chapitre 43.

**Dépannage** : si le pipeline échoue à l'étape d'authentification AWS malgré des identifiants correctement configurés dans Jenkins, vérifie que le nom exact référencé dans `credentials('aws-access-key')` correspond précisément à l'identifiant configuré dans Jenkins — une simple faute de frappe dans ce nom est la cause la plus fréquente de ce type d'échec.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — aucune étape d'approbation avant l'application en production</span>
Rappel de la section 56.5 : un pipeline entièrement automatique, sans validation humaine avant `apply`, reproduit le même risque déjà dénoncé pour tout changement appliqué sans revue au chapitre 2.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des secrets en clair directement dans le Jenkinsfile</span>
Rappel de la section 56.7 : exactement le même piège déjà dénoncé pour les playbooks Ansible au chapitre 52 — utiliser systématiquement le système de Credentials plutôt que d'écrire un identifiant en clair dans le code du pipeline.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des agents non reproductibles entre eux</span>
Rappel de la section 56.6 : un pipeline qui réussit sur un agent mais échoue différemment sur un autre reproduit exactement le problème "ça marche sur ma machine" que ce chapitre cherche précisément à éliminer.
</div>

## Diagnostiquer un pipeline qui échoue différemment selon l'agent

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : le même pipeline réussit sur certaines exécutions et échoue sur d'autres, sans changement de code apparent</span>

- **Diagnostic** : vérifier si le pipeline utilise un agent Docker figé (section 56.6) ou un agent générique dépendant de l'outillage préinstallé sur chaque machine hôte — une cause fréquente de comportement incohérent entre exécutions.
- **Comment vérifier** : comparer les versions exactes des outils (Terraform, Ansible) rapportées dans les journaux de deux exécutions, l'une réussie et l'une échouée.
- **Résolution** : figer explicitement l'image Docker de l'agent avec une version précise, exactement le même réflexe déjà établi pour éviter le tag `latest` d'une image Docker au chapitre 39, garantissant une exécution strictement identique à chaque déclenchement du pipeline.
</div>

## En entreprise

- **Bonne pratique répandue** : interdire l'exécution manuelle de `terraform apply` ou de playbooks Ansible en dehors du pipeline centralisé, avec une trace d'audit complète de chaque exécution (qui a déclenché, qui a approuvé, quel résultat) conservée par Jenkins.
- **Bonne pratique répandue** : figer précisément la version de chaque outil dans l'image Docker de l'agent, mise à jour consciemment et testée avant tout changement de version en production.
- **Erreur classique observée** : une organisation qui découvre, après un incident, qu'un changement de production avait été appliqué directement depuis le poste d'un administrateur sans passer par le pipeline, sans aucune trace d'approbation ni de revue — exactement le type de contournement que ce chapitre cherche à rendre structurellement impossible.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi centraliser l'exécution de Terraform et Ansible via un outil comme Jenkins, plutôt que de les exécuter depuis le poste de chaque administrateur ?"**
Réponse attendue : cela garantit un environnement d'exécution cohérent et reproductible (même version d'outils, mêmes accès), une trace d'audit complète de qui a exécuté quoi et quand, et permet d'insérer une étape d'approbation obligatoire avant tout changement critique — éliminant le risque de divergence entre postes individuels.

**Q2. "Pourquoi une étape d'approbation manuelle est-elle importante dans un pipeline d'infrastructure, même automatisé ?"**
Réponse attendue : elle garantit qu'un humain a explicitement revu le plan de changement avant son application réelle, exactement le même principe déjà établi pour la revue Git avant fusion (chapitre 51) et le processus de changement du chapitre 2 — l'automatisation ne doit jamais supprimer ce point de contrôle humain pour les changements les plus critiques.

**Q3. "Comment un pipeline Jenkins protège-t-il les identifiants sensibles qu'il utilise ?"**
Réponse attendue : via un système de Credentials dédié, qui stocke les identifiants chiffrés et les injecte dans l'exécution sans jamais les exposer en clair dans le code du pipeline ni dans les journaux d'exécution, le même principe de protection déjà établi pour Ansible Vault et le fichier d'état Terraform.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'inclus jamais un identifiant en clair dans un Jenkinsfile — utilise systématiquement le système de Credentials, et insère toujours une étape d'approbation avant toute application de changement en production.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Verse le Jenkinsfile lui-même dans le même dépôt Git que la configuration qu'il orchestre (Terraform, Ansible) — une pratique appelée "Pipeline as Code", qui applique le même principe de versionnement déjà établi depuis le chapitre 51 à l'orchestration elle-même, pas seulement à la configuration qu'elle exécute.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Fige précisément la version de chaque outil dans l'image Docker de l'agent, mise à jour consciemment plutôt qu'automatiquement — un changement de version non maîtrisé peut introduire un comportement différent d'un plan Terraform ou d'un playbook Ansible sans qu'aucun changement de configuration n'ait été fait, un piège difficile à diagnostiquer.
</div>

## Résumé du chapitre

- L'exécution manuelle de Terraform et Ansible depuis des postes individuels reproduit un problème de cohérence similaire au "ça marche sur ma machine" déjà résolu pour les applications par Docker.
- Jenkins centralise l'exécution des pipelines dans un environnement contrôlé et reproductible, avec une trace d'audit complète de chaque exécution.
- Le Jenkinsfile décrit un pipeline de façon déclarative, dans la même famille de syntaxe que YAML et HCL déjà maîtrisée.
- Une étape d'approbation manuelle avant l'application d'un changement critique reste indispensable, même dans un pipeline largement automatisé.
- Un agent Docker figé garantit un environnement d'exécution strictement identique à chaque déclenchement, éliminant la divergence de versions entre postes.
- Le système de Credentials de Jenkins protège les identifiants sensibles, exactement le même principe déjà établi pour Ansible Vault et le state Terraform.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Jenkins sert principalement à :
   - a) Remplacer Terraform et Ansible
   - b) Centraliser et automatiser l'exécution de pipelines dans un environnement cohérent
   - c) Chiffrer automatiquement tous les secrets d'une organisation
   - d) Gérer uniquement des applications web, jamais l'infrastructure

2. L'étape `input` d'un Jenkinsfile sert à :
   - a) Récupérer automatiquement le code source
   - b) Mettre le pipeline en pause pour une validation humaine explicite
   - c) Supprimer les identifiants utilisés
   - d) Accélérer l'exécution du pipeline

3. Un agent Jenkins basé sur une image Docker figée sert à :
   - a) Réduire le coût du pipeline
   - b) Garantir un environnement d'exécution strictement identique à chaque exécution
   - c) Remplacer le besoin de Credentials
   - d) Chiffrer automatiquement le fichier d'état Terraform

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un pipeline Jenkins devrait toujours appliquer automatiquement un changement de production sans validation humaine, pour gagner du temps. — **Faux** (une étape d'approbation reste indispensable, section 56.5).
2. Le système de Credentials de Jenkins protège les identifiants sensibles utilisés par un pipeline. — **Vrai**.
3. Un agent Jenkins générique, sans version d'outil figée, garantit toujours un comportement identique entre exécutions. — **Faux** (source fréquente d'incohérence, section 56.6).
4. Le Jenkinsfile peut être versionné dans le même dépôt Git que la configuration qu'il orchestre. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le problème du scénario d'ouverture (versions Terraform divergentes entre administrateurs) n'aurait jamais pu se produire avec un agent Docker figé.
2. Reprends la section 56.4. Explique pourquoi déclencher automatiquement un pipeline sur un push Git rejoint directement le principe "modifier le manifeste, jamais l'objet en direct" déjà établi au chapitre 43.

**Corrigé 1** : sans agent figé, chaque administrateur exécutait Terraform depuis son propre poste, avec sa propre version installée localement, potentiellement différente de celle d'un collègue — une divergence invisible tant que personne ne compare explicitement les versions utilisées. Avec un agent Docker figé sur une version précise (section 56.6), toute exécution du pipeline, peu importe qui la déclenche, utilise strictement la même version de Terraform, éliminant structurellement cette source de divergence, exactement comme le tag de version précis d'une image Docker élimine la dérive déjà dénoncée au chapitre 39.

**Corrigé 2** : le chapitre 43 établissait que tout changement devait passer par le manifeste source, jamais une modification directe de l'objet en production. En liant le déclenchement du pipeline au push Git, ce principe devient techniquement inévitable plutôt que simplement recommandé — il n'existe littéralement plus de chemin pour appliquer un changement d'infrastructure sans qu'il soit d'abord passé par Git, committé, potentiellement revu, puis exécuté dans l'environnement cohérent du pipeline, éliminant structurellement la possibilité même d'un contournement, plutôt que de compter sur la seule discipline volontaire de chaque administrateur.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 56.1</span>

Un pipeline Jenkins applique directement `terraform apply` dès la fin de l'étape `plan`, sans aucune étape `input` intermédiaire. Explique le risque de cette configuration pour un changement touchant l'infrastructure de production.
</div>

**Corrigé :** Sans étape d'approbation, tout push Git modifiant la configuration Terraform déclencherait automatiquement l'application réelle du changement en production, sans qu'aucun humain n'ait eu l'occasion de revoir le plan généré — un risque direct si le changement contient une erreur, une suppression accidentelle de ressource, ou un effet secondaire non anticipé par la personne qui l'a committé. Ce risque rejoint directement celui déjà dénoncé pour tout changement de production appliqué sans revue au chapitre 2 ; l'ajout d'une étape `input` (section 56.5) réintroduit ce point de contrôle humain indispensable avant toute application réelle en production, tout en conservant l'automatisation pour la génération et l'affichage du plan lui-même.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 56.2</span>

Rédige, en 3 à 5 phrases, pourquoi la trace d'audit automatique fournie par Jenkins (qui a déclenché, qui a approuvé, quel résultat) constitue une amélioration par rapport à l'exécution manuelle du scénario d'ouverture, au-delà de la simple cohérence de version déjà expliquée.
</div>

**Corrigé (exemple de réponse) :** Dans le scénario d'ouverture, aucune trace centralisée n'existait de qui avait exécuté quelle commande, à quel moment, avec quel résultat — une information reconstituée seulement en interrogeant directement chaque administrateur après coup, un exercice lent et potentiellement incomplet. Jenkins conserve automatiquement cet historique complet pour chaque exécution de pipeline, rejoignant directement le principe déjà établi pour le journal des changements au chapitre 2 : en cas d'incident ultérieur, il devient immédiat de savoir précisément quel changement a été appliqué, par qui, et quand, sans dépendre de la mémoire humaine ni d'une reconstitution a posteriori potentiellement imprécise.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi centraliser l'exécution de Terraform et Ansible résout un problème de cohérence, pas seulement de confort.</li>
<li>☐ Je sais écrire un Jenkinsfile déclaratif avec plusieurs étapes.</li>
<li>☐ Je sais déclencher un pipeline automatiquement sur un push Git.</li>
<li>☐ Je sais insérer une étape d'approbation avant l'application d'un changement critique.</li>
<li>☐ Je comprends pourquoi un agent Docker figé garantit un environnement d'exécution reproductible.</li>
<li>☐ Je sais protéger les identifiants sensibles utilisés par un pipeline via le système de Credentials.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Jenkins est-il le seul outil d'intégration continue disponible ?</dt>
<dd>Non, GitLab CI, GitHub Actions et d'autres alternatives existent avec des philosophies similaires — Jenkins reste l'un des plus anciens et des plus répandus, particulièrement adapté à un environnement auto-hébergé, mais les principes de ce chapitre (pipeline déclaratif, approbation, agent reproductible) restent transférables à d'autres outils équivalents.</dd>

<dt>Faut-il un pipeline distinct pour chaque environnement (dev/test/production) ?</dt>
<dd>Souvent oui, ou au minimum une distinction claire au sein d'un même pipeline (rappel de la séparation des states par environnement au chapitre 55) — un changement destiné au développement ne devrait jamais pouvoir affecter accidentellement la production via une confusion de pipeline, le même principe de séparation déjà établi pour Terraform.</dd>

<dt>Combien de temps faut-il pour automatiser complètement l'exécution de Terraform et Ansible via Jenkins ?</dt>
<dd>Une mise en place initiale reste relativement rapide pour un pipeline simple, mais l'adoption complète (interdiction effective de l'exécution manuelle, formation de toute l'équipe) prend plus de temps — une transition progressive, en commençant par les changements les plus fréquents ou les plus à risque, reste plus réaliste qu'une bascule totale immédiate.</dd>

<dt>Un pipeline Jenkins remplace-t-il le besoin de revue Git avant fusion (chapitre 51) ?</dt>
<dd>Non, les deux se complètent — la revue Git valide la qualité et la pertinence du changement de code lui-même avant fusion ; l'étape d'approbation du pipeline (section 56.5) valide spécifiquement le plan d'application réel généré à partir de ce code, une vérification complémentaire portant sur l'effet concret du changement.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Jenkins : [https://www.jenkins.io/doc/](https://www.jenkins.io/doc/)
- Jenkins — Référence de la syntaxe des Pipelines déclaratifs : [https://www.jenkins.io/doc/book/pipeline/syntax/](https://www.jenkins.io/doc/book/pipeline/syntax/)
- Jenkins — Documentation sur la gestion des Credentials : [https://www.jenkins.io/doc/book/using/using-credentials/](https://www.jenkins.io/doc/book/using/using-credentials/)

*Chapitre suivant : pipelines DevSecOps — intégrer des vérifications de sécurité automatisées directement dans le pipeline déjà construit dans ce chapitre, pour clore la Partie 9 de ce manuel.*
