# Manuel professionnel d'Administration Système et Infrastructure — Sommaire

> Manuel de référence internationale : virtualisation, conteneurisation, cloud, DevOps, identité, stockage/continuité, supervision et cybersécurité gouvernance.
> Complémentaire à `manuel-reseau-entreprise` (câblage, switches/routeurs, Wi-Fi, pare-feu basique, Windows/Linux Server intro, vidéosurveillance) et `manuel-windows-terminal` (CMD, PowerShell, WMI/CIM, AD via PowerShell) : **pas de redite** de ce que ces deux manuels couvrent déjà — ce manuel va plus loin (architecture, GUI/consoles, produits d'entreprise, cloud, orchestration).

---

## Partie 1 — Le métier et la posture professionnelle
1. Le métier d'administrateur système (rôles, responsabilités, écosystème IT)
2. ITIL v4 appliqué au quotidien (incident, problème, changement, service)
3. Documentation, inventaire et gestion des actifs
4. Environnements d'administration (Windows Admin Center, Cockpit, accès distant RDP/SSH)

## Partie 2 — Administration Windows Server avancée
5. Architecture Active Directory (forêts, domaines, arbres, sites, FSMO)
6. Réplication AD et tolérance de panne
7. Group Policy Objects (GPO) avancées
8. Microsoft Entra ID et scénarios hybrides (Azure AD Connect)
9. DNS avancé sur Windows Server (zones, délégation, DNSSEC)
10. DHCP avancé (failover, réservations, scopes multiples)
11. Services de fichiers et d'impression (DFS, quotas, FSRM)
12. WSUS et gestion des mises à jour
13. Clustering et haute disponibilité (Failover Clustering)

## Partie 3 — Administration Linux avancée
14. Choisir sa distribution serveur (Ubuntu Server, Debian, Rocky Linux, RHEL)
15. Gestion des paquets et dépôts (APT, DNF/YUM, RPM)
16. systemd : services, unités, cibles
17. Stockage Linux (partitionnement, LVM, RAID logiciel, systèmes de fichiers)
18. Utilisateurs, groupes et permissions avancées (ACL, sudo)
19. Sécurité Linux : SELinux et AppArmor
20. Scripting Bash pour l'administration système
21. Python pour l'administration système

## Partie 4 — Identité, authentification et annuaires
22. LDAP en profondeur (schéma, OpenLDAP)
23. Kerberos : fonctionnement et dépannage
24. PKI, certificats et TLS
25. MFA et authentification forte
26. Zero Trust : principes et mise en œuvre

## Partie 5 — Stockage et continuité d'activité
27. RAID matériel et logiciel
28. NAS : conception et déploiement
29. SAN : concepts et protocoles (iSCSI, Fibre Channel)
30. Stratégies de sauvegarde (règle 3-2-1, outils)
31. Plan de Reprise d'Activité (PRA)
32. Plan de Continuité d'Activité (PCA)

## Partie 6 — Virtualisation
33. Concepts de virtualisation (hyperviseurs type 1 / type 2)
34. VMware vSphere (ESXi, vCenter)
35. Microsoft Hyper-V
36. Proxmox VE
37. VirtualBox pour le lab et les tests
38. Migration et interopérabilité entre hyperviseurs

## Partie 7 — Conteneurisation et orchestration
39. Concepts Docker
40. Docker en pratique (Dockerfile, volumes, réseaux)
41. Docker Compose
42. Introduction à Kubernetes
43. Kubernetes en pratique (pods, services, deployments)
44. Kubernetes en production (ingress, secrets, autoscaling, RBAC)

## Partie 8 — Cloud computing
45. Fondamentaux du Cloud (IaaS/PaaS/SaaS, responsabilité partagée)
46. AWS : architecture et services essentiels (EC2, S3, VPC, IAM)
47. Microsoft Azure : architecture et services essentiels
48. Google Cloud Platform : architecture et services essentiels
49. Stratégies hybrides et multi-cloud
50. FinOps : maîtrise des coûts cloud

## Partie 9 — Automatisation et Infrastructure as Code
51. Git pour l'administrateur système
52. Ansible : fondamentaux
53. Ansible avancé (rôles, playbooks complexes, Vault)
54. Terraform : fondamentaux
55. Terraform avancé (modules, state distant, multi-provider)
56. Jenkins et intégration continue pour l'infrastructure
57. Pipelines DevSecOps

## Partie 10 — Supervision, journalisation et observabilité
58. Principes de la supervision (métriques, logs, traces)
59. Zabbix
60. Prometheus
61. Grafana
62. Pile ELK (Elasticsearch, Logstash, Kibana)
63. Graylog et Syslog centralisé
64. Wireshark et analyse de trafic réseau

## Partie 11 — Réseau d'entreprise avancé et équipements
65. Cisco en environnement d'entreprise (niveau CCIE)
66. Fortinet : pare-feu nouvelle génération
67. Mikrotik : routage avancé
68. Proxy et reverse proxy (Nginx, Apache, IIS)
69. VPN d'entreprise (site à site, accès distant)
70. Segmentation réseau avancée (VLAN, micro-segmentation)

## Partie 12 — Cybersécurité et gouvernance
71. Cadre NIST Cybersecurity Framework
72. Norme ISO/IEC 27001
73. CIS Benchmarks
74. SIEM : centralisation et corrélation d'événements
75. IDS/IPS
76. EDR et protection des postes/serveurs
77. Audit de sécurité et tests d'intrusion (notions)
78. Gestion des vulnérabilités et durcissement (hardening)
79. Réponse à incident et forensic de base

## Partie 13 — Projet final : infrastructure hybride complète
80. Cahier des charges : entreprise de 300 employés, multi-sites
81. Conception de l'architecture (AD, réseau, virtualisation)
82. Déploiement des services Windows/Linux
83. Conteneurisation et CI/CD du projet
84. Composant cloud hybride
85. Supervision et sécurisation de bout en bout
86. Documentation, PRA/PCA et remise du projet

## Annexes
A. Aide-mémoire des commandes Windows/Linux (hors PowerShell/CMD, déjà couverts par `manuel-windows-terminal`)
B. Glossaire technique complet
C. Comparatif des certifications (MCSA/MCSE, RHCSA/RHCA, CCNA/CCIE, VCP/VCDX, CKA, AWS/Azure/GCP)
D. Modèles de documents (runbook, PRA, politique de sécurité)
E. Erreurs fréquentes récapitulées
F. Ressources officielles

---

**86 chapitres + 6 annexes.** Ampleur volontairement réduite par rapport à la liste brute de technologies du brief : le routage/switching physique, le câblage, la configuration Wi-Fi/pare-feu de base et l'introduction Windows/Linux Server restent dans `manuel-reseau-entreprise` ; PowerShell/CMD/WMI/AD-via-script restent dans `manuel-windows-terminal`. Ce manuel prend le relais là où les deux autres s'arrêtent : architecture profonde, consoles/produits d'entreprise, virtualisation, cloud, conteneurs, DevOps, observabilité, gouvernance sécurité.

**Décisions techniques (à valider) :**
- Même pipeline de production que les 4 autres manuels (`build.ps1`, pandoc, `print-pdf.js`, `render-mermaid.js`, `assets/style.css`) — dossier `manuel-administration-systeme/` à scaffolder une fois ce sommaire validé.
- Gabarit de chapitre enrichi identique à celui validé sur `manuel-nodejs` (2026-07-23) : objectif 🎯, scénario 🎬, sections numérotées avec encadrés (astuce/attention/sécurité/performance/bonne-pratique/mauvaise-pratique/retenir/mémoriser/en-entreprise), diagrammes Mermaid pré-rendus en SVG, ateliers, débogage, entretien technique, quiz, exercices, checklist, FAQ, références.
- Diagrammes couvrant les familles demandées (réseau, architecture, AD, DNS, DHCP, VLAN, VPN, pare-feu, Docker, Kubernetes, Hyper-V, VMware, Proxmox, cloud, sauvegarde, PRA/PCA, flux, authentification, Kerberos, LDAP, Entra ID) répartis chapitre par chapitre selon leur pertinence, pas systématiquement partout.
- 300 000+ mots au total si les 86 chapitres sont tous portés au niveau de détail demandé : construction chapitre par chapitre sur plusieurs sessions, jamais en un seul bloc.
