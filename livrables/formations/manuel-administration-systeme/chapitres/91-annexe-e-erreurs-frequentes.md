<div class="chapitre-titre-num">ANNEXE E</div>

# Erreurs fréquentes récapitulées

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de l'annexe</span>
Rassembler, par partie du manuel, les erreurs les plus significatives et les plus récurrentes déjà détaillées dans les encadrés "Erreurs fréquentes" de chaque chapitre. Cette annexe ne remplace pas la lecture des chapitres correspondants — elle sert de rappel condensé, utile pour une révision rapide ou pour repérer un pattern qui traverse plusieurs parties du manuel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un pattern qui traverse tout ce manuel</span>
Plusieurs erreurs listées ci-dessous se répètent, sous une forme adaptée, dans de nombreux chapitres : la fatigue d'alerte (seuils mal calibrés), la dérive de configuration (répétition manuelle sans automatisation), le point de défaillance unique, et l'angle mort (une source ou un composant oublié d'une couverture par ailleurs solide). Reconnaître ces patterns récurrents, plutôt que de traiter chaque chapitre comme un domaine isolé, constitue l'une des compétences transversales les plus utiles développées par ce manuel.
</div>

## E.1 Partie 1 — Métier, ITIL, documentation, environnements (chapitres 1-4)

| Erreur | Chapitre | Risque |
|---|---|---|
| Aucune documentation à jour de l'infrastructure | 2-3 | Dépendance totale à la mémoire d'une seule personne |
| Aucun inventaire des actifs maintenu | 3 | Impossible de savoir ce qu'il faut réellement protéger |
| Un service exposé directement à Internet sans protection (RDP) | 4 | Exploitation directe, incident fondateur du fil rouge de ce manuel |
| Aucun environnement de test distinct de la production | 4 | Un changement risqué testé directement en production |

## E.2 Partie 2-3 — Windows Server et Linux avancés (chapitres 5-21)

| Erreur | Chapitre | Risque |
|---|---|---|
| Un seul contrôleur de domaine, sans réplication | 5-6 | Point de défaillance unique pour toute l'authentification |
| Des GPO en conflit ou mal testées avant application large | 7 | Dysfonctionnement massif et difficile à diagnostiquer |
| Aucune tolérance de panne sur les services DNS/DHCP | 9-10 | Interruption réseau complète en cas de panne |
| Un script exécuté sans en comprendre le contenu | 20-21 | Exécution d'une action destructrice non anticipée |

## E.3 Partie 4 — Identité et sécurité des accès (chapitres 22-26)

| Erreur | Chapitre | Risque |
|---|---|---|
| Un compte à privilèges élevés sans MFA | 25 | Compromission par phishing d'un compte critique |
| Une horloge désynchronisée entre systèmes | 23 | Échecs Kerberos ("clock skew too great") |
| Un certificat TLS jamais renouvelé avant expiration | 24 | Interruption de service et alerte navigateur |
| Une confiance implicite accordée au seul réseau interne | 26 | Absence de vérification si un attaquant est déjà à l'intérieur |

## E.4 Partie 5 — Stockage et continuité (chapitres 27-32)

| Erreur | Chapitre | Risque |
|---|---|---|
| Une sauvegarde jamais testée en restauration | 27, 30 | Fausse impression de protection, découverte tardive d'un échec |
| Une seule copie de sauvegarde, sur le même site que la production | 30 | Perte simultanée des données et de leur sauvegarde |
| Un PRA documenté mais jamais testé en conditions réelles | 31 | Procédure théorique inapplicable lors d'un sinistre réel |
| Un PCA ignorant les scénarios affectant plusieurs sites simultanément | 32 | Continuité d'activité non couverte pour le pire scénario |

## E.5 Partie 6 — Virtualisation (chapitres 33-38)

| Erreur | Chapitre | Risque |
|---|---|---|
| Un hyperviseur unique sans cluster de haute disponibilité | 34-35 | Panne matérielle interrompant toutes les VM hébergées |
| Une migration entre hyperviseurs jamais testée avant bascule réelle | 38 | Incompatibilités découvertes en pleine migration critique |

## E.6 Partie 7 — Conteneurs et orchestration (chapitres 39-44)

| Erreur | Chapitre | Risque |
|---|---|---|
| Une image Docker construite sur une base obsolète (tag `latest`) | 39-40 | Vulnérabilités connues silencieusement présentes |
| Aucune limite de ressources définie sur un pod Kubernetes | 43-44 | Une application peut monopoliser les ressources du cluster |
| Un manifeste Kubernetes modifié directement en production (`kubectl edit`) | 43 | Changement non versionné, perdu au prochain déploiement |

## E.7 Partie 8 — Cloud (chapitres 45-50)

| Erreur | Chapitre | Risque |
|---|---|---|
| Un groupe de sécurité cloud ouvert sur Internet | 46 | Exposition directe à une exploitation externe |
| Une adoption multi-cloud sans gouvernance ni justification | 49 | Dispersion technologique et charge de maintenance excessive |
| Aucun étiquetage des ressources cloud ni budget d'alerte | 50 | Facturation inattendue découverte trop tard |

## E.8 Partie 9 — Automatisation et Infrastructure as Code (chapitres 51-57)

| Erreur | Chapitre | Risque |
|---|---|---|
| Une configuration serveur modifiée manuellement, hors Ansible | 52 | Dérive de configuration invisible et cumulative |
| Un mot de passe en clair dans un playbook ou un Jenkinsfile | 53, 56 | Exposition d'un secret dans un historique versionné |
| Un pipeline appliquant un changement sans étape d'approbation | 56-57 | Changement critique appliqué sans revue humaine |
| Des seuils de sécurité DevSecOps bloquant sur toute vulnérabilité mineure | 57 | Fatigue d'alerte, contournement du pipeline par l'équipe |

## E.9 Partie 10 — Supervision et observabilité (chapitres 58-64)

| Erreur | Chapitre | Risque |
|---|---|---|
| Aucune supervision active, découverte d'incident par les utilisateurs | 58 | Délai de détection dépendant de la patience des utilisateurs |
| Un trigger sans maintien du seuil dans le temps | 59-61 | Fatigue d'alerte sur des pics normaux et temporaires |
| Une configuration de cibles statique dans un environnement Kubernetes dynamique | 60 | Cibles obsolètes dès le premier cycle de mise à l'échelle |
| Un flux Syslog non chiffré sur un segment réseau non protégé | 63 | Interception possible de données sensibles en clair |

## E.10 Partie 11 — Réseau d'entreprise avancé (chapitres 65-70)

| Erreur | Chapitre | Risque |
|---|---|---|
| Un lien redondant ajouté sans Spanning Tree Protocol | 65 | Tempête de broadcast rendant le réseau inutilisable |
| Un pare-feu utilisé uniquement comme un équipement traditionnel | 66 | Capacités d'inspection applicative avancées inexploitées |
| L'interface d'administration Winbox exposée directement sur Internet | 67 | Cible réelle de campagnes de compromission automatisées |
| Une règle de pare-feu "tout vers tout" par simplicité | 66, 70 | Absence de segmentation, propagation facilitée d'un incident |

## E.11 Partie 12 — Cybersécurité et gouvernance (chapitres 71-79)

| Erreur | Chapitre | Risque |
|---|---|---|
| Une sécurité construite uniquement en réaction aux incidents passés | 71 | Aucune garantie de couverture face aux risques non encore rencontrés |
| Une déclaration d'applicabilité artificiellement complète | 72 | Écart découvert lors de l'audit externe, crédibilité compromise |
| Un test d'intrusion mené sans mandat écrit | 77 | Activité légalement indiscernable d'une cyberattaque |
| Un système compromis éteint immédiatement, sans capture forensic | 79 | Perte de preuves présentes uniquement en mémoire vive |

## E.12 Partie 13 — Projet final (chapitres 80-86)

| Erreur | Chapitre | Risque |
|---|---|---|
| Des exigences formulées comme des solutions techniques prédéterminées | 80 | Espace des choix d'architecture limité inutilement |
| Un déploiement manuel "exceptionnel" pour respecter un délai | 82 | Recréation du risque de dérive déjà résolu par l'automatisation |
| Une couverture de supervision/sécurité présumée sans vérification explicite | 85 | Angle mort découvert lors d'un incident plutôt qu'en amont |
| Un PRA/PCA remis sans test final grandeur nature | 86 | Fausse assurance de résilience non vérifiée |

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Comment utiliser cette annexe</span>
Utilise ce récapitulatif comme un outil de revue rapide avant un audit, une mise en production, ou simplement une relecture périodique de tes pratiques — mais reviens toujours au chapitre correspondant pour comprendre le raisonnement complet derrière chaque erreur, ses causes profondes et sa solution détaillée, plutôt que de mémoriser cette liste de façon isolée.
</div>

*Annexe suivante et dernière : les ressources officielles, consolidant l'ensemble des références citées tout au long de ce manuel.*
