<div class="chapitre-titre-num">ANNEXE C</div>

# Comparatif des certifications professionnelles

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de l'annexe</span>
Situer les compétences développées dans ce manuel par rapport aux parcours de certification professionnelle reconnus du secteur, pour orienter une éventuelle démarche de certification complémentaire à cette formation. Ce comparatif reste informatif — ce manuel ne prépare pas spécifiquement à un examen de certification donné, mais couvre en profondeur les concepts qui en constituent le socle commun.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un paysage de certifications en évolution constante</span>
Les certifications informatiques évoluent régulièrement — certaines sont retirées, remplacées ou restructurées par leur éditeur. Les informations ci-dessous reflètent l'état du paysage au moment de la rédaction de ce manuel ; vérifie systématiquement l'état actuel d'une certification directement auprès de l'éditeur avant tout engagement dans une démarche de préparation.
</div>

## C.1 Microsoft : de MCSA/MCSE aux certifications par rôle

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Les certifications **MCSA** (Microsoft Certified Solutions Associate) et **MCSE** (Microsoft Certified Solutions Expert), historiquement associées à l'administration Windows Server et Active Directory (chapitres 5-13), ont été retirées par Microsoft au profit de certifications organisées par rôle et par plateforme (souvent centrées sur Azure et Microsoft 365) plutôt que par produit on-premise isolé. Les compétences Active Directory, GPO et infrastructure Windows Server de ce manuel restent néanmoins directement pertinentes pour les certifications actuelles couvrant l'administration hybride (rappel du chapitre 8, Entra ID hybride).
</div>

| Certification actuelle | Niveau | Domaine couvert | Chapitres pertinents de ce manuel |
|---|---|---|---|
| Microsoft Certified: Azure Administrator Associate | Intermédiaire | Administration Azure, identité hybride | 8, 47 |
| Microsoft Certified: Identity and Access Administrator Associate | Intermédiaire | Entra ID, gestion des accès | 8, 22-26 |
| Microsoft Certified: Windows Server Hybrid Administrator Associate | Intermédiaire | Windows Server, hybride cloud | 5-13 |
| Microsoft Certified: Cybersecurity Architect Expert | Avancé | Architecture de sécurité globale | 71-79 |

## C.2 Red Hat : RHCSA et RHCA

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le parcours Red Hat reste structuré et stable : **RHCSA** (Red Hat Certified System Administrator) valide les compétences fondamentales d'administration Linux (chapitres 14-21), tandis que **RHCA** (Red Hat Certified Architect) certifie une expertise avancée sur plusieurs domaines spécialisés (virtualisation, automatisation Ansible, sécurité).
</div>

| Certification | Niveau | Domaine couvert | Chapitres pertinents de ce manuel |
|---|---|---|---|
| RHCSA | Fondamental | Administration Linux de base (Rocky Linux/RHEL) | 14-21 |
| RHCE (Red Hat Certified Engineer) | Intermédiaire | Automatisation Ansible sur Linux | 52-53 |
| RHCA | Avancé | Spécialisation multi-domaines (virtualisation, sécurité, cloud) | 33-38, 71-79 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Note de contexte</span>
Ce manuel utilise Rocky Linux comme distribution de référence (chapitre 19) précisément en raison de sa compatibilité binaire avec RHEL — les compétences développées restent directement transférables à un environnement RHEL et à la préparation RHCSA/RHCE.
</div>

## C.3 Cisco : CCNA et CCIE

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**CCNA** (Cisco Certified Network Associate) couvre les fondations du réseau d'entreprise, tandis que **CCIE** (Cisco Certified Internetwork Expert) représente l'un des niveaux de certification réseau les plus exigeants du secteur, avec un examen pratique en laboratoire. Le chapitre 65 de ce manuel, explicitement titré "niveau CCIE", introduit les concepts de résilience réseau avancée (STP, EtherChannel, HSRP, OSPF) qui constituent une base pertinente pour ce parcours, sans prétendre à elle seule préparer à l'examen pratique exigeant de ce niveau.
</div>

| Certification | Niveau | Domaine couvert | Chapitres pertinents de ce manuel |
|---|---|---|---|
| CCNA | Fondamental | Réseau d'entreprise de base | Rappel de `manuel-reseau-entreprise` + 65 |
| CCNP (Cisco Certified Network Professional) | Intermédiaire | Spécialisation routage/switching, sécurité | 65-70 |
| CCIE | Expert | Expertise réseau approfondie, examen pratique | 65-70 |

## C.4 VMware : VCP et VCDX

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**VCP** (VMware Certified Professional) valide les compétences opérationnelles sur vSphere (chapitre 34), tandis que **VCDX** (VMware Certified Design Expert) certifie la capacité à concevoir une architecture de virtualisation complexe et à la défendre devant un panel d'experts — l'un des parcours de certification les plus exigeants du secteur de la virtualisation.
</div>

| Certification | Niveau | Domaine couvert | Chapitres pertinents de ce manuel |
|---|---|---|---|
| VCP-DCV (Data Center Virtualization) | Intermédiaire | Administration vSphere | 33-34 |
| VCAP (Advanced Professional) | Avancé | Conception et déploiement avancés | 33-38, 81 |
| VCDX | Expert | Conception d'architecture, défense devant panel | 81 |

## C.5 Kubernetes : CKA et certifications associées

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**CKA** (Certified Kubernetes Administrator), délivrée par la Cloud Native Computing Foundation, valide les compétences opérationnelles de gestion d'un cluster Kubernetes (chapitres 42-44) via un examen pratique en environnement réel plutôt qu'un questionnaire à choix multiples — reflétant directement l'approche pratique déjà privilégiée dans ce manuel.
</div>

| Certification | Niveau | Domaine couvert | Chapitres pertinents de ce manuel |
|---|---|---|---|
| CKA (Certified Kubernetes Administrator) | Intermédiaire | Administration opérationnelle d'un cluster | 42-44 |
| CKAD (Certified Kubernetes Application Developer) | Intermédiaire | Déploiement d'applications sur Kubernetes | 43, 83 |
| CKS (Certified Kubernetes Security Specialist) | Avancé | Sécurité spécifique à Kubernetes | 44, 57 |

## C.6 Cloud public : AWS, Azure, GCP

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Chacun des trois grands fournisseurs cloud propose un parcours de certification structuré en trois niveaux généraux — fondamental (sensibilisation), associé (compétences opérationnelles), professionnel/expert (architecture avancée) — reflétant directement la progression déjà suivie dans ce manuel de la Partie 8 (fondamentaux du cloud) au chapitre 84 (composant cloud hybride du projet final).
</div>

| Fournisseur | Certification fondamentale | Certification intermédiaire | Certification avancée | Chapitres pertinents |
|---|---|---|---|---|
| AWS | AWS Certified Cloud Practitioner | AWS Certified Solutions Architect – Associate | AWS Certified Solutions Architect – Professional | 45-46, 49-50 |
| Azure | Microsoft Certified: Azure Fundamentals | Microsoft Certified: Azure Administrator Associate | Microsoft Certified: Azure Solutions Architect Expert | 45, 47, 49-50 |
| GCP | Google Cloud Digital Leader | Google Associate Cloud Engineer | Google Professional Cloud Architect | 45, 48 |

## C.7 Choisir un parcours de certification adapté à son contexte

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel du même raisonnement pragmatique déjà établi tout au long de ce manuel</span>
Le meilleur parcours de certification dépend du contexte professionnel réel — les opportunités du marché local, le type d'infrastructure déjà rencontrée dans un poste actuel ou visé, et les technologies effectivement déployées dans l'organisation. Exactement le même raisonnement pragmatique déjà appliqué à de nombreux choix techniques tout au long de ce manuel (Ubuntu Server au chapitre 14, Zabbix au chapitre 59) s'applique au choix d'un parcours de certification : la certification la plus reconnue dans l'absolu n'est pas nécessairement la plus utile dans un contexte professionnel donné.
</div>

*Annexe suivante : les modèles de documents (runbook, plan de reprise d'activité, politique de sécurité), des gabarits directement réutilisables pour la pratique quotidienne de l'administration système.*
