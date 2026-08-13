<div class="chapitre-titre-num">CHAPITRE 57</div>

# Référence rapide

## Objectifs pédagogiques

Un aide-mémoire terrain unique, consultable directement sans devoir rouvrir le manuel entier — commandes, calculs, ports, protocoles et checklists, chacun renvoyant au chapitre source pour le détail complet.

## Commandes Cisco IOS

| Commande | Rôle | Chapitre |
|---|---|---|
| `hostname <nom>` | Renommer l'équipement | 19 |
| `enable secret <mdp>` | Mot de passe du mode privilégié | 19 |
| `crypto key generate rsa modulus 2048` | Générer la clé SSH | 19 |
| `vlan <id>` / `name <nom>` | Créer un VLAN | 20 |
| `switchport mode access` / `trunk` | Mode d'un port | 20-21 |
| `switchport access vlan <id>` | Assigner un VLAN à un port access | 20 |
| `switchport voice vlan <id>` | VLAN voix auxiliaire | 20 |
| `channel-group <n> mode active` | Agrégation LACP | 21 |
| `switchport trunk allowed vlan <liste>` | VLAN autorisés sur un trunk | 21 |
| `switchport trunk native vlan <id>` | VLAN natif du trunk | 21 |
| `spanning-tree mode rapid-pvst` | Activer RSTP | 22 |
| `spanning-tree vlan <id> priority <n>` | Priorité root bridge | 22 |
| `spanning-tree portfast` / `bpduguard enable` | Ports utilisateurs | 20, 22 |
| `spanning-tree guard root` | Root Guard | 22 |
| `switchport port-security` | Activer Port Security | 23 |
| `ip dhcp snooping` | Activer DHCP Snooping | 23 |
| `ip routing` | Activer le routage sur un switch L3 | 26 |
| `interface vlan <id>` / `ip address` | Créer une SVI | 26 |
| `router ospf <id>` / `network ... area 0` | Configurer OSPF | 26 |
| `vrrp <grp> ip <adresse>` | Configurer VRRP | 27 |
| `ip route <réseau> <masque> <passerelle>` | Route statique | 25 |
| `copy running-config startup-config` | Sauvegarde locale | 19, 24 |
| `show vlan brief` / `show interfaces status` / `show ip route` / `show etherchannel summary` / `show spanning-tree` / `show vrrp brief` | Vérification | 19-27 |

## Commandes MikroTik RouterOS

| Commande | Rôle | Chapitre |
|---|---|---|
| `/system identity set name=...` | Renommer l'équipement | 19 |
| `/user set admin password=...` | Mot de passe admin | 19 |
| `/ip service disable telnet,www,ftp` | Désactiver les accès non chiffrés | 19 |
| `/interface bridge add vlan-filtering=yes` | Bridge avec VLAN | 19-20 |
| `/interface vlan add ... vlan-id=...` | Créer un VLAN | 20 |
| `/interface bonding add ... mode=802.3ad` | Agrégation LACP | 21 |
| `/interface bridge set priority=...` | Priorité RSTP | 22 |
| `/ip route add dst-address=... gateway=...` | Route statique | 25 |
| `/routing ospf` | Configurer OSPF | 26 |
| `/interface vrrp add ...` | Configurer VRRP | 27 |
| `/system backup save` | Sauvegarde locale | 24 |

## Commandes Linux

| Commande | Rôle | Chapitre |
|---|---|---|
| `ip addr` / `ip route` | Adressage et routage actuels | 32, 41 |
| `sudo netplan apply` / `try` | Appliquer la configuration réseau | 32 |
| `sudo systemctl status/enable/start/restart <service>` | Gestion des services | 32 |
| `sudo ufw default deny incoming` / `allow <port>` / `enable` | Firewall UFW | 32 |
| `sudo apt update && sudo apt upgrade -y` | Mises à jour | 32 |
| `ssh-keygen -t ed25519` | Générer une clé SSH | 32 |
| `sudo nginx -t` | Tester une config Nginx avant rechargement | 32 |
| `docker run hello-world` | Vérifier Docker | 32 |
| `ping` / `traceroute` / `dig` / `ss -tulnp` | Diagnostic | 41 |

## Commandes Windows / PowerShell

| Commande | Rôle | Chapitre |
|---|---|---|
| `ipconfig /all` / `/release` / `/renew` | Configuration IP | 2, 6 |
| `Get-NetIPConfiguration` | Configuration IP (PowerShell) | 41 |
| `Test-Connection` / `Test-NetConnection -Port` | Ping / test de port | 41 |
| `Resolve-DnsName` | Résolution DNS | 6, 41 |
| `New-ADUser` / `New-ADGroup` / `Add-ADGroupMember` | Gestion Active Directory | 31 |
| `Add-DhcpServerV4Scope` / `Add-DhcpServerV4Reservation` / `Add-DhcpServerInDC` | Gestion DHCP Windows | 31, 35 |
| `New-GPO` / `Set-GPRegistryValue` / `gpupdate /force` | GPO | 31 |
| `New-SmbShare` | Partage de fichiers | 31 |

## Calculs réseau

**Table CIDR** (chapitre 4.4) : `/24`=254 util. · `/25`=126 · `/26`=62 · `/27`=30 · `/28`=14 · `/29`=6 · `/30`=2 · `/31`=2 (RFC 3021).

**Adresse réseau** : ET logique bit à bit entre l'IP et le masque (chapitre 4.5).

**VLSM** (chapitre 5.4) : trier les besoins du plus grand au plus petit, allouer le plus petit CIDR suffisant, chaque bloc démarre à un multiple de sa propre taille.

## Calculs CCTV (chapitre 34)

```
Bande passante totale = Nombre de cameras x Debit par camera
Stockage par jour et par camera (Go) = (Debit Mbit/s / 8) x 86 400 / 1000
Stockage total = Stockage par jour x Jours de retention x Nombre de cameras (+ marge 15-20%)
Budget PoE = Somme des consommations maximales x marge de securite (1,2)
```

## Ports réseau usuels

| Port | Protocole | Usage |
|---|---|---|
| 22 | TCP | SSH |
| 23 | TCP | Telnet (jamais utilisé, chapitre 2.5) |
| 53 | UDP/TCP | DNS |
| 67-68 | UDP | DHCP |
| 80 | TCP | HTTP |
| 123 | UDP | NTP |
| 161-162 | UDP | SNMP |
| 443 | TCP | HTTPS |
| 500, 4500 | UDP | IPsec (VPN site-à-site) |
| 514 | UDP | Syslog |
| 3389 | TCP | RDP (Bureau à distance Windows) |

## Protocoles et normes

| Sigle | Nom complet | Rôle | Chapitre |
|---|---|---|---|
| TCP/IP | Transmission Control Protocol / Internet Protocol | Pile de protocoles fondamentale d'Internet | 2 |
| 802.1Q | — | Tagging VLAN | 12.2 |
| 802.1X | — | Authentification réseau par port | 40 (mention) |
| 802.3af/at/bt | — | Standards PoE / PoE+ / PoE++ | 2.12, 13.3 |
| 802.11 | Wi-Fi | Norme de réseau sans fil | 15.2 |
| OSPF | Open Shortest Path First | Routage dynamique | 26 |
| VRRP | Virtual Router Redundancy Protocol | Redondance de passerelle | 27 |
| ONVIF | Open Network Video Interface Forum | Interopérabilité caméras/NVR | 36.3 |
| SNMP(v3) | Simple Network Management Protocol | Supervision | 38 |

## Numérotation VLAN standard de ce manuel

| VLAN | Nom |
|---|---|
| 10 | Management |
| 20 | Utilisateurs |
| 25+ | Extensions spécifiques au projet (ex. Comptabilité) |
| 30 | Serveurs |
| 40 | VoIP |
| 50 | Wi-Fi Corporate |
| 60 | Wi-Fi Invité |
| 70 | IoT |
| 80 | CCTV |
| 90 | Sécurité |
| 99 | Liaisons point-à-point |
| 999 | Natif (non utilisé) |

## Checklist d'installation générale

- [ ] Étude de site complète (chapitre 9)
- [ ] Plan IP et VLAN documentés (chapitre 11)
- [ ] Matériel choisi par calcul, jamais par habitude (chapitres 13-16)
- [ ] Câblage certifié (chapitre 17)
- [ ] Baie installée et mise à la terre (chapitre 18)
- [ ] Switches configurés et sécurisés (chapitres 19-24)
- [ ] Routage et redondance vérifiés (chapitres 25-27)
- [ ] Firewall configuré, règles ordonnées, testées (chapitres 28-29)
- [ ] Wi-Fi déployé et testé, roaming vérifié (chapitre 30)
- [ ] Serveurs durcis (chapitres 31-32)
- [ ] Vidéosurveillance testée caméra par caméra (chapitres 33-37)
- [ ] Supervision, sauvegarde testée en restauration, sécurité auditée (chapitres 38-40)
- [ ] Matrice de tests complète, aucun échec non résolu (chapitre 48)
- [ ] Documentation complète remise, recette signée (chapitres 48-49)
- [ ] Maintenance planifiée (chapitre 49)

## Résumé du chapitre

Cette référence rapide ne remplace aucun chapitre du manuel — elle en est le résumé opérationnel, pensé pour rester ouvert à côté d'un technicien sur le terrain, sans devoir rechercher chaque commande dans le corps du texte.

---

*Fin du manuel. Les 57 chapitres et 17 volumes de ce guide couvrent l'intégralité du parcours : d'un lecteur qui ne sait pas ce qu'est un switch à un concepteur capable de prendre le cahier des charges d'une entreprise réelle et de livrer, de A à Z, un réseau d'entreprise complet avec sa vidéosurveillance intégrée — conçu, câblé, configuré, sécurisé, testé, documenté et maintenu.*
