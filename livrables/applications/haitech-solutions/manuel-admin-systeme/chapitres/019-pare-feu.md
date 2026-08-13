<div class="chapitre-titre-num">PARTIE III · CHAPITRE 16</div>

# Pare-feu : filtrage et défense périmétrique

## Rôle du pare-feu

Un pare-feu (firewall) filtre le trafic réseau selon un ensemble de règles, autorisant ou bloquant chaque flux en fonction de critères comme l'adresse source, l'adresse destination, le port, le protocole, et pour les pare-feu modernes, le contenu applicatif lui-même. C'est la pièce centrale de la défense périmétrique, mais aussi, de plus en plus, de la segmentation interne (micro-segmentation, voir Zero Trust en Partie XI).

## Fonctionnement : générations de pare-feu

| Génération | Principe | Limite |
|---|---|---|
| Filtrage de paquets (stateless) | Chaque paquet évalué isolément selon IP/port | Ne comprend pas le contexte d'une connexion, facilement contourné |
| Stateful (à état) | Suit l'état de chaque connexion (table de sessions), autorise le retour d'une connexion initiée en interne | Standard actuel de base, mais ignore le contenu applicatif |
| NGFW (Next-Generation Firewall) | Inspection applicative (couche 7), détection d'intrusion intégrée, contrôle par utilisateur/application | Plus coûteux, plus complexe à régler finement |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Un pare-feu stateful autorise automatiquement le trafic de retour d'une connexion initiée depuis l'intérieur (par exemple la réponse d'un serveur web à une requête d'un poste interne), sans qu'une règle explicite pour ce sens de retour soit nécessaire. C'est cette table d'état qui distingue un pare-feu stateful d'un simple filtre de paquets stateless, où chaque sens de trafic doit être autorisé explicitement.
</div>

## Prérequis

- Une cartographie des flux réseau nécessaires entre chaque zone (Partie I, Chapitre 3)
- Un plan d'adressage et de segmentation VLAN déjà en place (Partie II)
- Une politique de sécurité définissant le principe par défaut : tout bloquer sauf autorisation explicite (« deny all, permit by exception »), la seule approche recommandée en entreprise

## Mise en place d'une politique de pare-feu

1. **Définir les zones de sécurité** — Interne (LAN), externe (WAN/Internet), DMZ le cas échéant (voir ci-dessous), invités.
2. **Appliquer le principe du refus par défaut** — Bloquer tout le trafic entre zones, puis autoriser explicitement chaque flux nécessaire.
3. **Rédiger les règles du plus spécifique au plus général** — La plupart des pare-feu évaluent les règles dans l'ordre, la première correspondance l'emporte.
4. **Documenter chaque règle avec sa justification métier** — Aucune règle sans propriétaire ni raison d'être (Partie X, gestion des changements).
5. **Tester chaque règle après application** — Vérifier que le trafic attendu passe, et que le trafic non désiré reste bloqué.
6. **Auditer périodiquement l'ensemble des règles** — Retirer les règles devenues obsolètes (Partie XI).

## La DMZ (zone démilitarisée)

Une DMZ est un segment réseau intermédiaire, isolé à la fois du réseau interne et d'Internet, destiné à héberger les services devant être accessibles depuis l'extérieur (serveur web public, serveur de messagerie). Un attaquant compromettant un service en DMZ n'obtient pas automatiquement un accès au réseau interne : la DMZ est reliée séparément au pare-feu, avec ses propres règles de filtrage strictes vers le LAN interne.

```{.uml}
INTERNET
    │
[PARE-FEU / NGFW]
  /       |        \
WAN     DMZ       LAN INTERNE
      (Serveurs    [Réseau segmenté
       publics :    par VLAN, Partie II]
       Web, Mail)
```

## Configuration : exemples de règles

```
# Linux nftables — politique par défaut deny, puis autorisations explicites
nft add table inet filtre
nft add chain inet filtre entree { type filter hook input priority 0 \; policy drop \; }
nft add rule inet filtre entree ct state established,related accept
nft add rule inet filtre entree iifname "lo" accept
nft add rule inet filtre entree tcp dport 22 ip saddr 192.168.10.0/24 accept
nft add rule inet filtre entree tcp dport 443 accept

# Cisco ASA — ACL bloquant le VLAN invités vers l'interne
access-list BLOCK-GUESTS extended deny ip 192.168.40.0 255.255.255.0 192.168.0.0 255.255.0.0
access-list BLOCK-GUESTS extended permit ip any any
access-group BLOCK-GUESTS in interface guest-vlan

# MikroTik RouterOS — règle de filtrage forward
/ip firewall filter add chain=forward src-address=192.168.40.0/24 \
  dst-address=192.168.0.0/16 action=drop comment="Invites vers interne : bloque"

# Windows Server — pare-feu local via PowerShell
New-NetFirewallRule -DisplayName "Autoriser RDP depuis Admin" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 `
  -RemoteAddress 192.168.10.0/24 -Action Allow
```

## Administration courante

- Revoir la liste complète des règles au moins une fois par trimestre, en confirmant que chacune reste justifiée (Partie X)
- Surveiller les journaux de blocage pour détecter des tentatives d'accès anormales (Partie XI, SIEM)
- Tester le comportement du pare-feu après chaque mise à jour de firmware ou de version, un changement de comportement par défaut est possible

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours partir du principe « tout bloquer, autoriser par exception », jamais l'inverse
- Restreindre chaque règle à la plage IP la plus étroite possible, jamais `any` en source si évitable
- Documenter systématiquement l'auteur, la date et la justification de chaque règle ajoutée
- Séparer les services exposés publiquement dans une DMZ dédiée, jamais directement sur le réseau interne
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Accumuler des règles temporaires « juste pour ce test » qui ne sont jamais retirées ensuite
- Utiliser `any` en source ou en destination par facilité, élargissant inutilement la surface d'exposition
- Placer une règle générale d'autorisation avant une règle de blocage plus spécifique, la rendant inopérante (ordre d'évaluation)
- Oublier de dupliquer chaque règle IPv4 vers son équivalent IPv6 (Chapitre 9)
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Un flux légitime est bloqué de façon inattendue | Règle générale de blocage évaluée avant la règle d'autorisation spécifique | Vérifier l'ordre des règles, tester en isolant la règle suspecte |
| Un flux qui devrait être bloqué passe quand même | Règle trop permissive (`any`) évaluée avant la règle de blocage prévue | Auditer l'ordre et la spécificité de chaque règle |
| Le pare-feu bloque le trafic de retour d'une connexion légitime | Pare-feu en mode stateless, ou règle de retour manquante | Vérifier le mode stateful et la table d'état des connexions |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un pare-feu périmétrique seul ne protège pas contre un déplacement latéral une fois un poste interne compromis. La segmentation interne par VLAN combinée à des règles de pare-feu entre segments (micro-segmentation, voir Zero Trust en Partie XI) limite considérablement la portée d'une compromission initiale. Ne jamais exposer une interface de gestion du pare-feu lui-même sur Internet sans restriction stricte d'IP source et authentification forte.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
BANKA applique le principe « refus par défaut, autorisation par exception » au niveau applicatif plutôt que réseau : RBAC sur toutes les routes, blocage des transactions sans caisse ouverte, whitelist explicite des droits de mandats. C'est le même raisonnement de sécurité que la règle « deny all, permit by exception » de ce chapitre, appliqué à une autre couche (Partie II, Chapitre 6) : dans les deux cas, la sécurité repose sur une liste positive de ce qui est explicitement autorisé, jamais sur une liste négative de ce qui est explicitement interdit.
</div>

## Résumé du chapitre

- Un pare-feu stateful suit l'état des connexions ; un NGFW ajoute l'inspection applicative en couche 7.
- Le principe « tout bloquer, autoriser par exception » est la seule approche recommandée en entreprise.
- Une DMZ isole les services exposés publiquement, limitant l'impact d'une compromission de ces services.
- Un audit trimestriel des règles évite l'accumulation de règles obsolètes ou trop permissives.

*Chapitre suivant : proxy et reverse proxy.*
