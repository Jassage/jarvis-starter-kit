<div class="chapitre-titre-num">CHAPITRE 14</div>

# Comment choisir un routeur et un firewall

## Objectifs pédagogiques

Calculer le débit réellement nécessaire pour un routeur/firewall (en distinguant le débit brut du débit avec inspection de sécurité active), et savoir quand séparer physiquement le rôle de routeur et de firewall plutôt que de les combiner dans un seul boîtier.

## Prérequis

Chapitres 2, 10, 13.

## 14.1 Routeur seul ou firewall combiné (UTM) ?

La majorité des projets de ce manuel (Volume 16, Projets 1-3) utilisent un **boîtier unique combinant routage et firewall** (souvent appelé UTM — Unified Threat Management), plus économique et plus simple à administrer. Un projet de grande taille ou multi-sites (Volume 16, Projets 4-6) peut justifier de **séparer** les deux rôles sur deux équipements physiques distincts : un routeur dédié pour le routage pur et la redondance de liens WAN, un firewall dédié en aval pour l'inspection de sécurité — évitant qu'une charge de sécurité intense ne ralentisse aussi le routage de base.

<div class="encadre astuce">
<span class="encadre-titre">💡 Le critère de décision : la criticité de la continuité réseau</span>
Séparer routeur et firewall a un coût (deux équipements à acheter, configurer et maintenir), justifié uniquement quand une panne ou une surcharge du firewall (fonctionnalité la plus lourde en calcul, 14.4) ne doit **jamais** empêcher le routage de base de continuer à fonctionner — un centre de données ou un hôpital, par exemple (Volume 16, Projets 4-6), pas une petite entreprise de 30 employés (Projet 1).
</div>

## 14.2 Le débit brut n'est pas le débit réel avec sécurité active

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'erreur de dimensionnement la plus coûteuse de tout ce volume</span>
La fiche technique d'un firewall annonce presque toujours un débit "brut" impressionnant (le débit de routage pur, sans aucune inspection), très supérieur au débit réel disponible une fois l'inspection de sécurité activée (antivirus de flux, IPS, filtrage web — 14.5). Un firewall vendu "1 Gbit/s" peut chuter à 150-300 Mbit/s réels avec toutes les fonctionnalités de sécurité actives simultanément. **Toujours dimensionner sur le débit "NGFW" ou "avec inspection" annoncé par le fabricant**, jamais sur le débit brut — c'est la cause la plus fréquente d'un firewall sous-dimensionné découvert seulement après la mise en production.
</div>

**Méthode de calcul** : le débit WAN nécessaire correspond au débit souscrit auprès du fournisseur d'accès (jamais moins, sous peine de brider artificiellement une liaison déjà payée), avec une marge pour l'inspection de sécurité active.

## 14.3 Nombre d'interfaces WAN

**Méthode** : compter le nombre de liaisons Internet distinctes prévues (chapitre 10) — une seule liaison pour un petit projet, deux liaisons de fournisseurs différents pour une redondance WAN (basculement automatique en cas de panne d'un opérateur, pratique standard dès le Volume 16 Projet 3). Chaque liaison WAN distincte nécessite sa propre interface physique dédiée sur l'équipement.

## 14.4 Capacité VPN

Deux besoins VPN distincts à recenser séparément (détaillés en configuration au chapitre 29) :

- **VPN site-à-site** : nombre de tunnels permanents nécessaires vers d'autres sites de l'entreprise (Volume 16, Projet 5 — une agence = un tunnel) ;
- **VPN nomade** (utilisateurs distants, télétravail) : nombre maximal d'utilisateurs connectés **simultanément**, pas le nombre total de comptes autorisés — c'est ce chiffre de pointe simultanée qui dimensionne réellement la charge du firewall.

## 14.5 Fonctionnalités de sécurité à vérifier

| Fonctionnalité | Rôle |
|---|---|
| IPS/IDS (prévention/détection d'intrusion) | Détecte et bloque les tentatives d'exploitation de vulnérabilités connues dans le trafic |
| Filtrage web (URL filtering) | Bloque l'accès à des catégories de sites (contenu illégal, phishing connu...) |
| Antivirus de flux | Inspecte les fichiers transitant par le firewall à la recherche de logiciels malveillants connus |
| Sandboxing | Exécute un fichier suspect dans un environnement isolé avant de le laisser passer, pour détecter un comportement malveillant inconnu des signatures classiques |

Chacune de ces fonctionnalités **consomme du débit disponible** (14.2) — le choix de les activer toutes ou seulement certaines est un arbitrage direct entre le niveau de sécurité recherché et le débit réel disponible pour un budget matériel donné.

## 14.6 Nombre de zones et de VLAN supportés

**Méthode** : reprendre directement le nombre de VLAN du plan IP (chapitre 11) — le firewall doit supporter, sans limitation artificielle de licence, au moins ce nombre de VLAN/zones distincts, avec une marge pour une croissance future (chapitre 8).

## 14.7 Haute disponibilité : le cluster actif/passif

Sur un projet où la continuité d'accès Internet et de sécurité est critique (Volume 16, Projets 3, 4, 6), deux firewalls identiques peuvent être déployés en **cluster actif/passif** : le second bascule automatiquement si le premier tombe en panne, sans interruption de service perceptible pour les utilisateurs. **Méthode de décision** : évaluer le coût d'une interruption réseau totale d'une heure pour l'activité du client (perte de chiffre d'affaires, impact opérationnel) face au coût d'un second équipement — un calcul similaire à celui du chapitre 27 (redondance de routage).

## 14.8 Tableau de synthèse : caractéristiques minimales à spécifier

| Critère | Comment le déterminer |
|---|---|
| Débit WAN avec inspection active | Débit souscrit chez le FAI, jamais le débit brut de la fiche technique |
| Interfaces WAN | Nombre de liaisons Internet distinctes prévues |
| Tunnels VPN site-à-site | Nombre d'autres sites de l'entreprise à relier |
| Utilisateurs VPN nomades simultanés | Pic estimé, pas le total de comptes |
| VLAN/zones supportés | Nombre de VLAN du plan IP + marge |
| Haute disponibilité | Oui/Non selon la criticité de continuité du client |

## 14.9 Laboratoire — dimensionner le firewall d'un projet moyen

Un projet compte 9 VLAN (chapitre 11), une liaison Internet unique de 200 Mbit/s souscrite, aucune agence distante actuellement mais 15 télétravailleurs qui se connectent simultanément aux heures de pointe. Détermine : (1) le débit d'inspection minimal à rechercher sur la fiche technique du firewall ; (2) le nombre de tunnels VPN site-à-site nécessaires aujourd'hui ; (3) la capacité VPN nomade minimale à vérifier.

**Corrigé :** (1) Au moins 200 Mbit/s **avec inspection active** (IPS + filtrage web au minimum), pas seulement en débit brut. (2) Zéro tunnel site-à-site aujourd'hui (aucune agence), mais documenter cette absence explicitement plutôt que de l'ignorer, pour une éventuelle évolution future. (3) Au moins 15 utilisateurs VPN nomades simultanés, avec une marge de croissance (chapitre 8) portant idéalement ce chiffre à 18-20.

## Résumé du chapitre

Le choix d'un routeur/firewall se calcule sur le débit **avec inspection de sécurité active**, jamais le débit brut de la fiche technique. Séparer routeur et firewall en deux équipements distincts se justifie uniquement sur un projet où la continuité du routage de base ne doit jamais dépendre de la charge de sécurité. Le nombre d'interfaces WAN, la capacité VPN (site-à-site et nomade simultanée), le nombre de VLAN supportés et le besoin éventuel de haute disponibilité en cluster se déterminent chacun par une méthode de calcul explicite, jamais par choix arbitraire.

*Chapitre suivant : comment choisir des bornes Wi-Fi.*
