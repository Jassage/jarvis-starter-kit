<div class="chapitre-titre-num">PARTIE III · CHAPITRE 15</div>

# DHCP : attribution automatique d'adresses

## Rôle du DHCP

Le DHCP (Dynamic Host Configuration Protocol) attribue automatiquement une adresse IP et les paramètres réseau associés (passerelle, DNS, masque) à chaque équipement qui rejoint le réseau, sans intervention manuelle. Sans DHCP, chaque poste, imprimante ou téléphone IP devrait être configuré manuellement en adresse statique — viable pour quelques serveurs, ingérable au-delà de quelques dizaines de postes.

## Fonctionnement : le processus DORA

L'attribution DHCP suit un échange en quatre étapes, connu sous l'acronyme DORA :

1. **Discover** — Le client diffuse une requête de découverte (broadcast) sur le réseau local
2. **Offer** — Un ou plusieurs serveurs DHCP répondent avec une proposition d'adresse
3. **Request** — Le client demande formellement l'adresse proposée (accepte une offre parmi plusieurs)
4. **Acknowledge** — Le serveur confirme l'attribution et transmet les paramètres complets

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Le DHCP fonctionne nativement par diffusion (broadcast), limitée à un seul segment réseau (VLAN). Pour qu'un serveur DHCP centralisé serve plusieurs VLAN, chaque routeur/switch L3 doit relayer les requêtes via un agent relais DHCP (« IP helper » chez Cisco), qui transforme la diffusion locale en requête unicast vers le serveur DHCP distant.
</div>

## Prérequis

- Un plan d'adressage déjà défini avec une plage DHCP clairement délimitée par VLAN (Chapitre 8)
- Une décision sur l'emplacement du service : intégré à un routeur/pare-feu, serveur Windows (rôle DHCP), ou serveur Linux dédié (`isc-dhcp-server`, `kea`)
- Une politique claire sur les réservations d'adresses (équipements devant toujours recevoir la même IP via DHCP)

## Mise en place d'un service DHCP

1. **Définir l'étendue (scope) par VLAN** — Plage d'adresses à distribuer, en dehors des adresses statiques réservées (Chapitre 8).
2. **Configurer les options DHCP** — Passerelle par défaut, serveurs DNS, durée du bail (lease time).
3. **Configurer les réservations** — Association adresse MAC ↔ IP fixe, pour les équipements nécessitant une IP stable sans passer par une configuration statique manuelle.
4. **Configurer le relais DHCP** — Sur chaque routeur/switch L3 desservant un VLAN dont le serveur DHCP n'est pas local.
5. **Prévoir la redondance** — Deux serveurs DHCP avec un découpage de la plage (règle des 80/20, voir ci-dessous) ou un mécanisme de failover natif.

## Configuration : exemples de commandes

```
# Linux isc-dhcp-server — extrait de configuration
subnet 192.168.10.0 netmask 255.255.255.0 {
  range 192.168.10.50 192.168.10.200;
  option routers 192.168.10.1;
  option domain-name-servers 192.168.10.1;
  default-lease-time 86400;
  max-lease-time 172800;
}

# Linux isc-dhcp-server — réservation par adresse MAC
host serveur-impression {
  hardware ethernet AA:BB:CC:DD:EE:FF;
  fixed-address 192.168.10.5;
}

# Cisco IOS — relais DHCP (ip helper-address) sur l'interface VLAN
interface vlan 30
 ip helper-address 192.168.20.10

# Windows Server PowerShell — créer une étendue DHCP
Add-DhcpServerv4Scope -Name "VLAN30-WiFi" -StartRange 192.168.30.50 `
  -EndRange 192.168.30.240 -SubnetMask 255.255.255.0

# Windows Server PowerShell — réservation
Add-DhcpServerv4Reservation -ScopeId 192.168.30.0 `
  -IPAddress 192.168.30.10 -ClientId "AA-BB-CC-DD-EE-FF"
```

## Administration courante

- Surveiller le taux d'occupation de chaque étendue, signal d'alerte avant épuisement des adresses disponibles
- Vérifier périodiquement la cohérence entre les réservations DHCP et l'inventaire des équipements (Partie I, Chapitre 5)
- Nettoyer les baux expirés et les réservations orphelines (équipements retirés du réseau)

## La règle des 80/20 pour la redondance DHCP

Pour assurer une redondance sans configuration de failover complexe, une pratique éprouvée consiste à répartir chaque étendue entre deux serveurs DHCP selon une règle 80/20 : le serveur principal sert 80 % de la plage, le serveur secondaire sert les 20 % restants. En cas de panne du serveur principal, le secondaire continue de répondre, certes avec une plage réduite, évitant une interruption totale du service.

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours exclure de la plage DHCP les adresses déjà réservées en statique (Chapitre 8), pour éviter tout conflit
- Ajuster la durée du bail selon le contexte : bail court pour un réseau invité à forte rotation, bail long pour un réseau de postes fixes
- Documenter chaque réservation avec sa justification (Partie I, Chapitre 4)
- Prévoir systématiquement une redondance DHCP dès que le service devient critique pour l'activité (Partie IX)
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Oublier le relais DHCP (ip helper-address) sur un nouveau VLAN, laissant ses équipements sans adresse IP
- Faire chevaucher la plage DHCP avec des adresses statiques déjà attribuées, provoquant des conflits d'adresses
- Déployer un serveur DHCP non autorisé (rogue DHCP), par erreur ou malveillance, qui répond plus vite que le serveur légitime et détourne le trafic (voir sécurité ci-dessous)
- Laisser un bail extrêmement long sur un réseau à forte rotation d'équipements (invités), épuisant inutilement la plage disponible
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Le poste reçoit une adresse 169.254.x.x (APIPA) | Aucun serveur DHCP accessible, relais manquant | Vérifier le relais DHCP sur le VLAN, la connectivité au serveur |
| Certains postes reçoivent une IP incohérente avec leur VLAN | Un serveur DHCP non autorisé répond sur le réseau | Rechercher un équipement DHCP rogue (voir sécurité) |
| L'étendue est épuisée, plus aucune adresse disponible | Trop d'équipements pour la plage définie, ou baux non libérés | Élargir la plage si possible, réduire la durée du bail, nettoyer les baux expirés |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un serveur DHCP non autorisé (rogue DHCP), qu'il soit malveillant ou simplement un routeur personnel mal branché par un employé, peut détourner tout le trafic d'un segment en distribuant sa propre passerelle et son propre DNS. Le DHCP snooping, une fonctionnalité disponible sur la plupart des switches manageables, autorise uniquement les ports désignés (côté serveur DHCP légitime) à répondre aux requêtes DHCP, bloquant toute réponse provenant d'un port utilisateur normal.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le plan d'adressage à huit VLAN documenté dans `livrables/reseau/` illustre le même principe de séparation entre plage DHCP et adresses statiques que ce chapitre : chaque VLAN à usage dynamique (Administration, Wi-Fi employés, Invités) réserve explicitement ses 50 premières adresses aux équipements statiques (passerelle, switches, serveurs), la plage DHCP démarrant seulement après. Ce même découpage, directement réutilisable, garantit qu'une réservation DHCP ne peut jamais entrer en conflit avec une adresse statique déjà attribuée.
</div>

## Résumé du chapitre

- Le processus DORA (Discover, Offer, Request, Acknowledge) attribue automatiquement adresse IP et paramètres réseau.
- Le relais DHCP (ip helper-address) est indispensable dès que le serveur DHCP n'est pas sur le même VLAN que ses clients.
- La règle des 80/20 offre une redondance simple sans configuration de failover complexe.
- Le DHCP snooping protège contre les serveurs DHCP non autorisés (rogue DHCP), une menace fréquente et sous-estimée.

*Chapitre suivant : le pare-feu, filtrage de trafic et défense périmétrique.*
