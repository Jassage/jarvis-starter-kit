<div class="chapitre-titre-num">ANNEXE B</div>

# Glossaire technique complet

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de l'annexe</span>
Définir, en une phrase ou deux, chaque terme technique clé rencontré tout au long de ce manuel, classé par ordre alphabétique. Chaque entrée renvoie au chapitre où le concept est expliqué en profondeur — ce glossaire sert de rappel rapide, pas de substitut à la lecture du chapitre correspondant pour une compréhension réelle.
</div>

<dl class="faq">

<dt>Active Directory (AD)</dt>
<dd>Service d'annuaire Microsoft centralisant l'identité, l'authentification et les stratégies de groupe d'un réseau Windows. Chapitres 5-8.</dd>

<dt>Ansible</dt>
<dd>Outil d'automatisation sans agent, exécutant des playbooks déclaratifs pour configurer des systèmes de façon idempotente. Chapitres 52-53.</dd>

<dt>Alertmanager</dt>
<dd>Composant de l'écosystème Prometheus acheminant les alertes déclenchées vers les bons destinataires. Chapitre 60.</dd>

<dt>Annexe A (Contrôles, ISO 27001)</dt>
<dd>Catalogue de mesures de sécurité de référence de la norme ISO/IEC 27001, dont l'application est justifiée dans une déclaration d'applicabilité. Chapitre 72.</dd>

<dt>Ansible Vault</dt>
<dd>Mécanisme de chiffrement intégré à Ansible protégeant les données sensibles (mots de passe, clés) dans un playbook. Chapitre 53.</dd>

<dt>API (Application Programming Interface)</dt>
<dd>Interface de programmation permettant à un logiciel d'interagir avec un autre, notamment pour interroger ou piloter Kubernetes, un fournisseur cloud, ou un outil de supervision.</dd>

<dt>Bastion (hôte)</dt>
<dd>Serveur intermédiaire sécurisé, seul point d'entrée autorisé pour l'administration distante d'un réseau segmenté. Rappel des chapitres 22 et 70.</dd>

<dt>CI/CD (Intégration et déploiement continus)</dt>
<dd>Pratique consistant à automatiser la construction, le test et le déploiement d'un logiciel à chaque changement de code. Chapitres 56-57.</dd>

<dt>CIS Benchmarks</dt>
<dd>Guides de configuration sécurisée détaillés et gratuits, publiés par le Center for Internet Security, pour un large éventail de technologies. Chapitre 73.</dd>

<dt>Cluster (informatique)</dt>
<dd>Ensemble de plusieurs machines physiques ou virtuelles fonctionnant ensemble pour offrir un service unique, résilient et à charge répartie. Chapitres 13, 41-44.</dd>

<dt>CVSS (Common Vulnerability Scoring System)</dt>
<dd>Système standardisé attribuant un score de gravité objectif à une vulnérabilité connue, utilisé pour prioriser sa remédiation. Chapitre 78.</dd>

<dt>Deployment (Kubernetes)</dt>
<dd>Objet Kubernetes décrivant l'état désiré d'une application (nombre de réplicas, image, ressources), maintenu automatiquement par le contrôleur. Chapitre 43.</dd>

<dt>DevSecOps</dt>
<dd>Pratique intégrant les vérifications de sécurité directement dans le pipeline CI/CD, à chaque changement plutôt qu'en fin de projet. Chapitre 57.</dd>

<dt>DFS (Distributed File System)</dt>
<dd>Technologie Windows Server répliquant et unifiant l'accès à des partages de fichiers distribués sur plusieurs serveurs. Chapitre 11.</dd>

<dt>DHCP (Dynamic Host Configuration Protocol)</dt>
<dd>Protocole attribuant automatiquement une configuration réseau (adresse IP, passerelle, DNS) à un poste client. Chapitre 10.</dd>

<dt>DNS (Domain Name System)</dt>
<dd>Système traduisant un nom de domaine en adresse IP, fondation de la résolution de noms sur un réseau. Chapitre 9.</dd>

<dt>Docker</dt>
<dd>Plateforme de conteneurisation permettant d'empaqueter une application avec ses dépendances dans une image portable et reproductible. Chapitres 39-41.</dd>

<dt>EDR (Endpoint Detection and Response)</dt>
<dd>Outil de sécurité observant le comportement des processus sur un poste ou un serveur, détectant une menace par son comportement plutôt que par signature. Chapitre 76.</dd>

<dt>ELK (Elasticsearch, Logstash, Kibana)</dt>
<dd>Pile logicielle centralisant, transformant et rendant recherchables les journaux d'événements d'une infrastructure. Chapitre 62.</dd>

<dt>Entra ID</dt>
<dd>Service d'identité cloud de Microsoft (anciennement Azure AD), pouvant fonctionner en synchronisation hybride avec un Active Directory local. Chapitre 8.</dd>

<dt>EtherChannel</dt>
<dd>Agrégation de plusieurs liens physiques entre deux équipements réseau en un seul lien logique, combinant bande passante et tolérance de panne. Chapitre 65.</dd>

<dt>FinOps</dt>
<dd>Discipline de gestion financière du cloud, combinant étiquetage, budgets et optimisation continue des coûts. Chapitre 50.</dd>

<dt>Forensic (numérique)</dt>
<dd>Discipline consistant à préserver et analyser méthodiquement les preuves d'un incident de sécurité, en maintenant une chaîne de custody rigoureuse. Chapitre 79.</dd>

<dt>GPO (Group Policy Object)</dt>
<dd>Objet de stratégie de groupe Active Directory appliquant une configuration centralisée aux postes et utilisateurs d'un domaine. Chapitre 7.</dd>

<dt>Grafana</dt>
<dd>Outil de visualisation combinant des données de plusieurs sources de supervision (Zabbix, Prometheus) en tableaux de bord unifiés. Chapitre 61.</dd>

<dt>Graylog</dt>
<dd>Plateforme de centralisation de logs, alternative plus légère à opérer que la pile ELK, avec un support natif mature de Syslog. Chapitre 63.</dd>

<dt>HPA (Horizontal Pod Autoscaler)</dt>
<dd>Contrôleur Kubernetes ajustant automatiquement le nombre de répliques d'une application selon sa charge réelle. Chapitre 44.</dd>

<dt>HSRP/VRRP</dt>
<dd>Protocoles permettant à deux routeurs de partager une adresse IP virtuelle de passerelle, avec bascule automatique en cas de panne. Chapitre 65.</dd>

<dt>Hyperviseur</dt>
<dd>Logiciel permettant d'exécuter plusieurs machines virtuelles isolées sur un même serveur physique. Chapitres 33-38.</dd>

<dt>IAM (Identity and Access Management)</dt>
<dd>Système de gestion des identités et des permissions d'accès, notamment dans un contexte cloud (AWS IAM, Azure AD). Chapitre 46.</dd>

<dt>IDS/IPS (Intrusion Detection/Prevention System)</dt>
<dd>Outils inspectant le trafic réseau pour détecter (IDS) ou détecter et bloquer activement (IPS) une activité malveillante. Chapitre 75.</dd>

<dt>Infrastructure as Code (IaC)</dt>
<dd>Pratique consistant à décrire et gérer une infrastructure via du code versionné plutôt que par une configuration manuelle. Chapitres 51-55.</dd>

<dt>Ingress (Kubernetes)</dt>
<dd>Objet Kubernetes exposant un service HTTP/HTTPS à l'extérieur du cluster, avec routage selon le nom d'hôte ou le chemin. Chapitre 43.</dd>

<dt>ISO/IEC 27001</dt>
<dd>Norme internationale certifiable de management de la sécurité de l'information, auditée par un organisme accrédité externe. Chapitre 72.</dd>

<dt>ITIL</dt>
<dd>Cadre de référence de bonnes pratiques pour la gestion des services informatiques, notamment la gestion des changements et des incidents. Chapitre 2.</dd>

<dt>Jenkins</dt>
<dd>Serveur d'intégration continue open source exécutant des pipelines automatisés déclenchés notamment par un changement Git. Chapitre 56.</dd>

<dt>Kerberos</dt>
<dd>Protocole d'authentification réseau utilisé par Active Directory, reposant sur des tickets à durée de vie limitée. Chapitre 23.</dd>

<dt>Kubernetes (K8s)</dt>
<dd>Plateforme d'orchestration de conteneurs automatisant leur déploiement, leur mise à l'échelle et leur gestion. Chapitres 42-44.</dd>

<dt>LDAP (Lightweight Directory Access Protocol)</dt>
<dd>Protocole standard d'interrogation et de modification d'un annuaire, sous-jacent à Active Directory. Chapitre 22.</dd>

<dt>LVM (Logical Volume Manager)</dt>
<dd>Système de gestion de volumes Linux permettant de redimensionner et de gérer le stockage de façon flexible. Chapitre 17.</dd>

<dt>Mikrotik / RouterOS</dt>
<dd>Fabricant d'équipements réseau et système d'exploitation associé, choix pragmatique pour des sites de taille modeste. Chapitre 67.</dd>

<dt>NAS (Network Attached Storage)</dt>
<dd>Serveur de stockage dédié accessible via le réseau, généralement via des protocoles de partage de fichiers. Chapitre 28.</dd>

<dt>NAT (Network Address Translation)</dt>
<dd>Technique traduisant une adresse IP privée en adresse publique, permettant à un réseau interne d'accéder à Internet via une adresse partagée.</dd>

<dt>NGFW (Next-Generation Firewall)</dt>
<dd>Pare-feu nouvelle génération inspectant le trafic au niveau applicatif, au-delà du simple filtrage par port et adresse IP. Chapitre 66.</dd>

<dt>NIST Cybersecurity Framework (CSF)</dt>
<dd>Cadre de référence volontaire structurant la cybersécurité en cinq fonctions continues : Identifier, Protéger, Détecter, Répondre, Récupérer. Chapitre 71.</dd>

<dt>OSPF (Open Shortest Path First)</dt>
<dd>Protocole de routage dynamique où les routeurs échangent l'état de leurs liens et recalculent automatiquement le meilleur chemin. Chapitre 65.</dd>

<dt>PCA (Plan de Continuité d'Activité)</dt>
<dd>Ensemble de mesures garantissant la poursuite des activités critiques d'une organisation pendant et après un sinistre majeur. Chapitre 32.</dd>

<dt>PKI (Public Key Infrastructure)</dt>
<dd>Infrastructure à clés publiques gérant l'émission, la validation et la révocation de certificats numériques. Chapitre 24.</dd>

<dt>PRA (Plan de Reprise d'Activité)</dt>
<dd>Ensemble de procédures permettant de restaurer les systèmes informatiques après un sinistre, avec des objectifs de temps et de perte de données définis. Chapitre 31.</dd>

<dt>Prometheus</dt>
<dd>Système de supervision par interrogation (pull), particulièrement adapté aux environnements dynamiques comme Kubernetes via la découverte automatique de cibles. Chapitre 60.</dd>

<dt>Proxmox VE</dt>
<dd>Plateforme de virtualisation open source, compromis pragmatique entre fonctionnalité et coût de licence. Chapitre 36.</dd>

<dt>RAID (Redundant Array of Independent Disks)</dt>
<dd>Technique combinant plusieurs disques physiques pour améliorer la performance et/ou la tolérance de panne du stockage. Chapitre 27.</dd>

<dt>RBAC (Role-Based Access Control)</dt>
<dd>Modèle de contrôle d'accès attribuant des permissions selon un rôle plutôt qu'individuellement, utilisé notamment dans Kubernetes. Chapitre 44.</dd>

<dt>Reverse proxy</dt>
<dd>Serveur intermédiaire recevant les requêtes destinées à un ou plusieurs serveurs backend, qu'il masque et protège. Chapitre 68.</dd>

<dt>RTO / RPO (Recovery Time/Point Objective)</dt>
<dd>Métriques du plan de reprise d'activité : le délai maximal acceptable de restauration (RTO) et la perte de données maximale acceptable (RPO). Chapitre 31.</dd>

<dt>Runbook</dt>
<dd>Document consolidant les procédures opérationnelles essentielles d'un service (redémarrage, journaux, contacts) pour une reprise par une équipe externe. Chapitre 86.</dd>

<dt>SAN (Storage Area Network)</dt>
<dd>Réseau dédié au stockage en bloc, offrant des performances et une flexibilité supérieures à un NAS pour des besoins intensifs. Chapitre 29.</dd>

<dt>SELinux / AppArmor</dt>
<dd>Modules de sécurité Linux imposant un contrôle d'accès obligatoire, restreignant les actions possibles d'un processus même compromis. Chapitre 19.</dd>

<dt>Service (Kubernetes)</dt>
<dd>Objet Kubernetes exposant un ensemble de pods sous une adresse réseau stable, indépendamment de leur cycle de vie individuel. Chapitre 43.</dd>

<dt>SIEM (Security Information and Event Management)</dt>
<dd>Système corrélant des événements de sécurité provenant de plusieurs sources pour révéler un scénario d'attaque qu'aucun événement isolé ne suffirait à démontrer. Chapitre 74.</dd>

<dt>Spanning Tree Protocol (STP)</dt>
<dd>Protocole évitant les boucles réseau lorsque des liens redondants existent entre commutateurs. Chapitre 65.</dd>

<dt>Syslog</dt>
<dd>Protocole standard de journalisation réseau, largement supporté par les équipements réseau incapables d'exécuter un agent moderne. Chapitre 63.</dd>

<dt>Terraform</dt>
<dd>Outil d'Infrastructure as Code déclaratif, gérant le cycle de vie complet de ressources cloud ou on-premise via un fichier d'état. Chapitres 54-55.</dd>

<dt>Test d'intrusion (pentest)</dt>
<dd>Simulation active d'une attaque réelle, mandatée par écrit, évaluant l'exploitabilité concrète des vulnérabilités et l'efficacité des défenses en place. Chapitre 77.</dd>

<dt>TLS (Transport Layer Security)</dt>
<dd>Protocole cryptographique chiffrant les communications réseau, fondation du HTTPS. Chapitre 24.</dd>

<dt>VLAN (Virtual Local Area Network)</dt>
<dd>Segmentation logique d'un réseau physique en plusieurs réseaux isolés, appliquant le principe de moindre exposition. Chapitres 11, 70.</dd>

<dt>VPN (Virtual Private Network)</dt>
<dd>Tunnel chiffré reliant deux réseaux ou un poste distant à un réseau, à travers un réseau non fiable comme Internet. Chapitre 69.</dd>

<dt>WSUS (Windows Server Update Services)</dt>
<dd>Service centralisant la distribution et l'approbation des mises à jour Windows au sein d'une organisation. Chapitre 12.</dd>

<dt>Zabbix</dt>
<dd>Solution de supervision open source complète (métriques, alertes, tableaux de bord), particulièrement adaptée à un parc hétérogène de serveurs classiques. Chapitre 59.</dd>

<dt>Zero Trust</dt>
<dd>Modèle de sécurité n'accordant jamais de confiance implicite, vérifiant systématiquement chaque accès indépendamment de son origine réseau. Chapitre 26.</dd>

</dl>

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment utiliser ce glossaire</span>
Chaque entrée reste volontairement concise — pour une compréhension réelle du concept, de son contexte d'usage et de ses pièges courants, reporte-toi systématiquement au chapitre indiqué plutôt que de t'arrêter à cette définition condensée.
</div>

*Annexe suivante : le comparatif des certifications professionnelles, pour situer les compétences développées dans ce manuel par rapport aux parcours de certification reconnus du secteur.*
