<div class="chapitre-titre-num">ANNEXE D</div>

# Glossaire complet

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de cette annexe</span>
Les 32 termes les plus centraux de ce manuel, définis simplement et accessibles à un débutant, chacun renvoyant au chapitre où il est expliqué en profondeur.
</div>

<dl class="faq">
<dt>DevOps</dt>
<dd>Culture et ensemble de pratiques rapprochant développement et exploitation pour livrer du logiciel plus rapidement, plus souvent et plus fiablement (chapitre 1).</dd>

<dt>CI (Continuous Integration, intégration continue)</dt>
<dd>Vérification automatique, à chaque changement de code, que le projet fonctionne toujours (chapitre 19).</dd>

<dt>CD (Continuous Delivery/Deployment, livraison/déploiement continu)</dt>
<dd>La suite de la CI : préparer (Delivery) ou déployer automatiquement (Deployment) chaque changement validé (chapitre 20).</dd>

<dt>Pipeline</dt>
<dd>La séquence automatisée d'étapes (tests, build, déploiement) exécutée à chaque changement de code (chapitres 19, 21).</dd>

<dt>Repository (dépôt)</dt>
<dd>L'endroit où vit un projet versionné avec Git, localement ou sur un service comme GitHub (chapitres 7-8).</dd>

<dt>Runner</dt>
<dd>La machine qui exécute réellement un job de pipeline CI/CD, fournie par GitHub ou auto-hébergée (chapitre 21).</dd>

<dt>Container (conteneur)</dt>
<dd>Une unité isolée d'exécution qui partage le noyau du système hôte, contrairement à une machine virtuelle (chapitre 11).</dd>

<dt>Image</dt>
<dd>Le modèle figé à partir duquel un ou plusieurs conteneurs sont créés — la "recette", le conteneur étant le "plat cuisiné" (chapitre 11).</dd>

<dt>Registry (registre)</dt>
<dd>Un service qui héberge des images Docker, permettant de les publier et de les récupérer sur n'importe quel serveur (chapitre 14).</dd>

<dt>Dockerfile</dt>
<dd>Le fichier texte qui décrit, instruction par instruction, comment construire une image Docker (chapitre 12).</dd>

<dt>Compose (Docker Compose)</dt>
<dd>L'outil qui orchestre plusieurs conteneurs ensemble, décrits dans un seul fichier `compose.yaml` (chapitre 13).</dd>

<dt>Reverse Proxy</dt>
<dd>Un serveur (comme Nginx) qui reçoit une requête et la transmet à une autre application, servant de point d'entrée unique (chapitre 15).</dd>

<dt>Load Balancer (répartiteur de charge)</dt>
<dd>Un composant qui répartit le trafic entre plusieurs instances d'une application (chapitres 15, 28, 48).</dd>

<dt>DNS (Domain Name System)</dt>
<dd>Le système distribué qui traduit un nom de domaine en adresse IP (chapitre 17).</dd>

<dt>TLS (Transport Layer Security)</dt>
<dd>Le protocole de chiffrement qui protège une communication réseau, la base de HTTPS (chapitre 16).</dd>

<dt>VPS (Virtual Private Server)</dt>
<dd>Un serveur virtuel loué chez un fournisseur, avec un contrôle complet sur son système d'exploitation (chapitres 3, 26).</dd>

<dt>Infrastructure as Code (IaC)</dt>
<dd>Décrire l'état souhaité d'une infrastructure dans des fichiers versionnés, plutôt que la configurer manuellement (chapitre 37).</dd>

<dt>Terraform</dt>
<dd>Un outil d'Infrastructure as Code, indépendant du fournisseur cloud, qui provisionne des ressources selon une description déclarative (chapitre 38).</dd>

<dt>Kubernetes</dt>
<dd>Un orchestrateur de conteneurs qui gère plusieurs serveurs (nodes) ensemble, avec auto-réparation et scaling natifs (chapitre 41).</dd>

<dt>Pod</dt>
<dd>L'unité de base gérée par Kubernetes, contenant un ou plusieurs conteneurs partageant réseau et stockage (chapitre 41).</dd>

<dt>Deployment</dt>
<dd>Une ressource Kubernetes qui gère plusieurs pods identiques, avec auto-réparation automatique en cas de panne (chapitre 41).</dd>

<dt>Service (Kubernetes)</dt>
<dd>Une adresse stable qui route le trafic vers des pods, même si ceux-ci sont recréés et changent d'adresse (chapitre 41).</dd>

<dt>Ingress</dt>
<dd>Le point d'entrée HTTP d'un cluster Kubernetes, équivalent d'un reverse proxy nativement intégré (chapitre 41).</dd>

<dt>Monitoring</dt>
<dd>L'observation continue d'un système via métriques, logs, traces et alertes, pour détecter un problème avant ou dès qu'il survient (chapitre 32).</dd>

<dt>Observability (observabilité)</dt>
<dd>La capacité à répondre à des questions imprévues sur un système à partir des données collectées, au-delà du monitoring anticipé (chapitre 34).</dd>

<dt>Logging (journalisation)</dt>
<dd>L'enregistrement d'événements textuels horodatés décrivant ce qui s'est passé dans un système (chapitre 33).</dd>

<dt>Tracing (traçage)</dt>
<dd>Le suivi du parcours complet d'une requête à travers plusieurs services, révélant où le temps est consommé (chapitre 34).</dd>

<dt>DevSecOps</dt>
<dd>L'intégration de la sécurité comme responsabilité partagée à chaque étape du cycle DevOps, plutôt qu'une vérification finale isolée (chapitre 35).</dd>

<dt>Rollback</dt>
<dd>Revenir à une version précédente d'une application après un déploiement défaillant (chapitre 29).</dd>

<dt>Blue/Green</dt>
<dd>Une stratégie de déploiement avec deux environnements complets, basculant instantanément le trafic de l'un à l'autre (chapitre 28).</dd>

<dt>Canary</dt>
<dd>Une stratégie de déploiement exposant une nouvelle version à une petite fraction du trafic avant une extension progressive (chapitre 28).</dd>

<dt>Scaling (mise à l'échelle)</dt>
<dd>Ajouter des ressources (verticalement) ou des instances (horizontalement) pour absorber une charge croissante (chapitre 48).</dd>

<dt>High Availability (haute disponibilité)</dt>
<dd>La conception d'un système pour éliminer les points de défaillance unique et rester disponible malgré des pannes individuelles (chapitre 49).</dd>
</dl>

*Annexe suivante : E — Examen final pratique.*
