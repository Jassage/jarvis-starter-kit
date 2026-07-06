<div class="chapitre-titre-num">CHAPITRE 16</div>

# Cybersécurité d'entreprise

## Objectifs pédagogiques

Appliquer les principes de segmentation et de Zero Trust, déployer MFA et EDR, organiser les sauvegardes, centraliser la journalisation via un SIEM, gérer les vulnérabilités, comprendre les principes des tests de pénétration, et structurer une réponse aux incidents.

## Prérequis

Chapitres 1-15.

## 16.1 Segmentation et VLAN de sécurité (rappel et approfondissement)

Rappel du chapitre 6 : la segmentation par VLAN limite la surface d'exposition en cas de compromission d'un segment. En cybersécurité, ce principe se formalise davantage :

<div class="encadre astuce">
<span class="encadre-titre">💡 Micro-segmentation : au-delà du simple VLAN par usage</span>
Au-delà de la segmentation par fonction (bureautique, vidéosurveillance, serveurs), la micro-segmentation isole individuellement des ressources critiques les unes des autres au sein même d'un VLAN (via des ACL ou un firewall interne) — un serveur de paie et un serveur de fichiers généraliste, bien que dans le même VLAN "serveurs", ne devraient pas pouvoir communiquer librement entre eux sans nécessité applicative précise.
</div>

## 16.2 Zero Trust

<div class="encadre astuce">
<span class="encadre-titre">💡 "Ne jamais faire confiance, toujours vérifier" — y compris en interne</span>
Le modèle Zero Trust abandonne l'hypothèse historique selon laquelle "tout ce qui est à l'intérieur du réseau est de confiance" — chaque accès (utilisateur, appareil, application) est authentifié et autorisé explicitement, quel que soit son emplacement réseau, avec le principe du moindre privilège appliqué systématiquement. Un attaquant ayant pénétré le réseau interne (VLAN bureautique compromis) ne doit jamais pouvoir accéder librement aux serveurs critiques sans authentification et autorisation supplémentaires.
</div>

Piliers pratiques du Zero Trust en entreprise :

- Authentification forte systématique (MFA, section 16.3), y compris pour les accès internes aux applications sensibles.
- Vérification de la conformité de l'appareil (à jour, antivirus actif) avant d'autoriser l'accès à une ressource sensible.
- Segmentation fine (micro-segmentation, section 16.1) limitant les déplacements latéraux (lateral movement) d'un attaquant.
- Journalisation et surveillance continue de chaque accès (section 16.7, SIEM).

## 16.3 MFA (authentification multifacteur)

<div class="encadre astuce">
<span class="encadre-titre">💡 Un mot de passe seul, même complexe, reste un facteur unique compromettable</span>
Le MFA combine au moins deux facteurs parmi : ce que l'utilisateur **sait** (mot de passe), ce qu'il **possède** (application d'authentification, clé de sécurité physique), et ce qu'il **est** (biométrie) — le vol ou la fuite d'un seul facteur (mot de passe divulgué dans une fuite de données tierce) ne suffit plus à compromettre le compte.
</div>

Déploiement recommandé : MFA obligatoire pour tous les accès VPN (chapitre 11), tous les comptes à privilèges administratifs, et l'ensemble des applications exposées à Internet (portail RH, messagerie, chapitre 13).

## 16.4 EDR et antivirus

<div class="encadre astuce">
<span class="encadre-titre">💡 EDR (Endpoint Detection and Response) : au-delà de la simple détection de signatures virales</span>
Un antivirus traditionnel compare les fichiers à une base de signatures connues, insuffisant face aux menaces nouvelles (zero-day) ou aux attaques sans fichier (fileless). Un EDR surveille en continu le comportement des postes (processus, connexions réseau, modifications système suspectes), détecte les comportements anormaux, et permet une réponse centralisée (isolement réseau du poste compromis à distance) depuis une console unique.
</div>

## 16.5 Sauvegardes

<div class="encadre astuce">
<span class="encadre-titre">💡 La règle 3-2-1 des sauvegardes</span>
**3** copies des données au minimum, sur **2** supports différents, dont **1** copie hors site (ou déconnectée/air-gapped) — cette dernière copie protège spécifiquement contre les rançongiciels (ransomware), qui chiffrent ou suppriment activement les sauvegardes accessibles en ligne lorsqu'ils compromettent un réseau.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une sauvegarde jamais testée n'est pas une sauvegarde fiable</span>
De nombreuses organisations découvrent, au moment critique d'une restauration réelle après incident, que leurs sauvegardes étaient corrompues, incomplètes, ou trop anciennes — des tests de restauration réguliers (au minimum trimestriels) doivent être planifiés et documentés (chapitre 25, PRA/PCA).
</div>

## 16.6 Gestion des vulnérabilités

Cycle de gestion des vulnérabilités :

1. **Scanner** régulièrement l'ensemble du parc (postes, serveurs, équipements réseau) avec un outil dédié.
2. **Prioriser** les vulnérabilités selon leur criticité réelle (score CVSS) et leur exposition (accessible depuis Internet ou uniquement en interne).
3. **Corriger** (patch management) selon un calendrier défini, avec une fenêtre de maintenance planifiée.
4. **Vérifier** que le correctif a bien résolu la vulnérabilité sans régression.

<div class="encadre astuce">
<span class="encadre-titre">💡 Un patch management structuré évite le dilemme "corriger vite" vs "corriger sans casser"</span>
Un correctif appliqué immédiatement sans test préalable peut casser une application métier critique ; un correctif retardé indéfiniment "pour éviter le risque" laisse une vulnérabilité connue exploitable — un environnement de test/pré-production (chapitre 36) permet de valider les correctifs critiques avant déploiement en production.
</div>

## 16.7 Journalisation centralisée et SIEM

<div class="encadre astuce">
<span class="encadre-titre">💡 SIEM (Security Information and Event Management) : corréler des événements dispersés en une vision unique</span>
Un SIEM centralise les journaux de multiples sources (firewall, switches, serveurs, EDR, Active Directory) et applique des règles de corrélation détectant des schémas d'attaque invisibles source par source — par exemple, une tentative de connexion échouée sur 50 comptes différents en quelques minutes depuis une même adresse IP, révélatrice d'une attaque par pulvérisation de mots de passe (password spraying), pourrait passer inaperçue en examinant chaque log isolément.
</div>

## 16.8 Tests de pénétration (principes)

<div class="encadre astuce">
<span class="encadre-titre">💡 Un test de pénétration simule une attaque réelle, avec autorisation explicite et périmètre défini</span>
Contrairement à un scan de vulnérabilités automatisé (section 16.6), un test de pénétration (pentest) implique un testeur humain qui exploite activement les failles identifiées pour évaluer l'impact réel d'une compromission, dans un cadre contractuel strict définissant le périmètre autorisé, les dates, et les limites (pas de déni de service, par exemple).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais réaliser de test de pénétration sans autorisation écrite explicite</span>
Tester la sécurité d'un système sans autorisation formelle, même dans un but "constructif", constitue une infraction dans la quasi-totalité des juridictions — toute mission de pentest doit être encadrée par un contrat précisant le périmètre, les dates et les responsabilités.
</div>

## 16.9 Réponse aux incidents

Structure type d'un plan de réponse aux incidents :

1. **Préparation** : équipe désignée, outils prêts, procédures documentées à l'avance (jamais improvisées pendant l'incident).
2. **Détection et analyse** : confirmation de l'incident via le SIEM/EDR, évaluation de sa portée réelle.
3. **Confinement** : isolement immédiat des systèmes compromis (rappel de la micro-segmentation, section 16.1) pour stopper la propagation.
4. **Éradication** : suppression de la cause racine (compte compromis désactivé, vulnérabilité corrigée, malware retiré).
5. **Récupération** : restauration des systèmes à partir des sauvegardes saines (section 16.5), avec surveillance renforcée post-incident.
6. **Retour d'expérience** : documentation complète de l'incident et des mesures correctives pour prévenir sa récidive.

```mermaid
graph LR
    A[Preparation] --> B[Detection/Analyse]
    B --> C[Confinement]
    C --> D[Eradication]
    D --> E[Recuperation]
    E --> F["Retour d'experience"]
    F -.ameliore.-> A
```

## 16.10 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Considérer la cybersécurité comme un projet ponctuel plutôt qu'un processus continu</span>
Déployer un firewall, un antivirus et des sauvegardes une seule fois "pour cocher la case sécurité" sans processus de suivi (patch management, tests de sauvegarde réguliers, revue des accès) laisse le niveau de sécurité se dégrader progressivement face à des menaces en constante évolution.
</div>

## 16.11 Bonnes pratiques

- Appliquer le principe Zero Trust même en interne, sans confiance implicite basée sur la seule localisation réseau.
- Rendre le MFA obligatoire pour tout accès VPN, administratif, ou exposé à Internet.
- Respecter la règle 3-2-1 des sauvegardes, avec des tests de restauration réguliers documentés.
- Documenter et répéter (exercice de simulation) le plan de réponse aux incidents avant qu'un incident réel ne survienne.

## 16.12 Résumé du chapitre

- Le Zero Trust et la micro-segmentation limitent les déplacements latéraux d'un attaquant ayant pénétré le réseau interne.
- MFA et EDR renforcent respectivement l'authentification et la détection de comportements malveillants sur les postes.
- La règle 3-2-1 des sauvegardes protège contre les rançongiciels ; le SIEM corrèle les journaux dispersés pour détecter des attaques invisibles isolément.
- La réponse aux incidents suit un cycle structuré : préparation, détection, confinement, éradication, récupération, retour d'expérience.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 16.1</span>

Une entreprise détecte une activité suspecte sur un poste (connexions réseau anormales vers une IP inconnue). Décrivez les trois premières actions à mener selon le cycle de réponse aux incidents.
</div>

**Corrigé :**
1. **Détection et analyse** : confirmer l'incident via l'EDR/SIEM, identifier l'étendue réelle (un seul poste ou propagation).
2. **Confinement** : isoler immédiatement le poste du réseau (déconnexion réseau ou VLAN de quarantaine dédié) pour stopper toute propagation ou exfiltration.
3. **Éradication** : identifier et supprimer la cause (malware, compte compromis) avant d'envisager toute reconnexion au réseau.

*Chapitre suivant : introduction à la vidéosurveillance IP.*
