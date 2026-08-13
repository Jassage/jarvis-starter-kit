<div class="chapitre-titre-num">PARTIE II · CHAPITRE 7</div>

# TCP/IP : la suite de protocoles

## Rôle de TCP/IP

TCP/IP est la suite de protocoles réellement déployée sur Internet et sur la quasi-totalité des réseaux d'entreprise — contrairement au modèle OSI (Chapitre 6), qui reste avant tout un outil pédagogique et de diagnostic. TCP/IP se condense en quatre couches pratiques plutôt que sept, et c'est ce modèle que configurent concrètement les administrateurs système : adresses IP, ports, protocoles de transport.

## Fonctionnement : le modèle TCP/IP en quatre couches

| Couche TCP/IP | Correspondance OSI | Rôle | Protocoles clés |
|---|---|---|---|
| Accès réseau | 1-2 | Transmission physique et adressage local | Ethernet, Wi-Fi (802.11), ARP |
| Internet | 3 | Adressage logique et routage | IPv4, IPv6, ICMP |
| Transport | 4 | Livraison de bout en bout | TCP, UDP |
| Application | 5-7 | Protocoles applicatifs | HTTP/HTTPS, DNS, SMTP, SSH, FTP |

### TCP contre UDP

| Critère | TCP | UDP |
|---|---|---|
| Connexion | Orientée connexion (poignée de main à 3 temps) | Sans connexion |
| Fiabilité | Garantie (accusés de réception, retransmission) | Aucune garantie |
| Ordre des paquets | Préservé | Non garanti |
| Vitesse | Plus lent (overhead de fiabilité) | Plus rapide |
| Cas d'usage typique | HTTP/HTTPS, SSH, transferts de fichiers, bases de données | DNS, streaming vidéo/voix, jeux en ligne, VoIP |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
La poignée de main TCP à 3 temps (« three-way handshake ») fonctionne ainsi : le client envoie un paquet SYN, le serveur répond SYN-ACK, le client confirme par ACK. Ce mécanisme garantit que les deux parties sont prêtes à communiquer avant tout échange de données — et c'est aussi la cible d'une attaque classique par déni de service (SYN flood, Partie XI).
</div>

## Prérequis

- Comprendre la notion de port : un numéro (0 à 65535) qui identifie un service précis sur une machine, permettant à plusieurs services de coexister sur la même adresse IP
- Connaître les ports standards des services les plus courants (tableau ci-dessous)
- Savoir lire une adresse de socket (IP:Port), l'identifiant unique d'une connexion réseau

## Ports standards à connaître

| Port | Protocole | Service |
|---|---|---|
| 20-21 | TCP | FTP (données/contrôle) |
| 22 | TCP | SSH |
| 25 | TCP | SMTP (envoi de mail) |
| 53 | TCP/UDP | DNS |
| 67-68 | UDP | DHCP |
| 80 | TCP | HTTP |
| 123 | UDP | NTP (synchronisation horaire) |
| 143 / 993 | TCP | IMAP / IMAPS |
| 389 / 636 | TCP | LDAP / LDAPS |
| 443 | TCP | HTTPS |
| 445 | TCP | SMB |
| 465 / 587 | TCP | SMTPS / soumission SMTP |
| 3306 | TCP | MySQL/MariaDB |
| 3389 | TCP | RDP (Bureau à distance Windows) |
| 5432 | TCP | PostgreSQL |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention</span>
Les ports 0 à 1023 sont dits « privilégiés » (well-known ports) : sur les systèmes Unix/Linux, seul un processus root (ou disposant de la capability `CAP_NET_BIND_SERVICE`) peut ouvrir un service en écoute sur l'un de ces ports. Une application qui tente d'écouter sur le port 80 sans privilège échoue avec une erreur de permission — cause fréquente de confusion pour un administrateur débutant.
</div>

## Mise en pratique : diagnostiquer une connexion TCP/IP

1. **Vérifier la couche Internet (IP)** — `ping <adresse-ip>` confirme la joignabilité au niveau IP.
2. **Vérifier le chemin emprunté** — `traceroute <destination>` (Linux/macOS) ou `tracert <destination>` (Windows) liste chaque routeur traversé.
3. **Vérifier qu'un port est ouvert côté serveur** — `ss -tulpn` (Linux) ou `netstat -ano` (Windows) liste les ports en écoute localement.
4. **Vérifier l'accessibilité d'un port distant** — `Test-NetConnection -ComputerName <hote> -Port <port>` (PowerShell) ou `nc -zv <hote> <port>` (Linux).
5. **Vérifier le contenu applicatif** — `curl -v https://...` affiche le détail de la négociation TLS et de la réponse HTTP.

## Configuration : exemples de commandes courantes

```
# Linux — état des connexions et ports en écoute
ss -tulpn

# Linux — table de routage
ip route show

# Linux — configuration d'une interface
ip addr add 192.168.10.10/24 dev eth0
ip link set eth0 up

# Windows PowerShell — équivalents
Get-NetTCPConnection -State Listen
Get-NetRoute
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.10 -PrefixLength 24
```

## Administration courante

- Maintenir à jour un tableau des ports ouverts par serveur, aligné avec l'inventaire des applications (Partie I, Chapitre 5)
- Surveiller les connexions établies inhabituelles (port ou destination inconnue) comme indicateur précoce de compromission (Partie XI)
- Vérifier périodiquement que seuls les ports réellement nécessaires sont exposés (durcissement, Partie XI)

## Outils et commandes de référence

| Outil | Plateforme | Usage |
|---|---|---|
| `ping` / `ping -t` | Toutes | Test de joignabilité IP de base |
| `traceroute` / `tracert` | Linux/macOS / Windows | Chemin emprunté par les paquets |
| `ss` / `netstat` | Linux / Windows | Connexions et ports en écoute |
| `nmap` | Toutes (outil tiers) | Scan de ports, découverte réseau (Partie I, Chapitre 5) |
| `Wireshark` / `tcpdump` | Toutes / Linux | Capture et analyse de trames en détail |
| `curl` / `Invoke-WebRequest` | Toutes / Windows | Test applicatif HTTP(S) en ligne de commande |

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours tester la connectivité de bas en haut : IP, puis port, puis contenu applicatif
- Préférer UDP pour les flux temps réel tolérants à la perte (voix, vidéo), TCP pour tout ce qui exige l'intégrité des données
- Documenter les ports utilisés par chaque application interne dans la cartographie d'architecture (Partie I, Chapitre 3)
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Confondre un port fermé (refus explicite, réponse rapide) et un port filtré (aucune réponse, timeout) — deux diagnostics réseau différents
- Oublier qu'un pare-feu peut bloquer un port en sortie (egress) et pas seulement en entrée (ingress)
- Négliger la MTU (taille maximale de paquet) sur les liens VPN ou tunnel, cause fréquente de connexions qui s'établissent mais se bloquent sur de gros transferts
</div>

## Dépannage : symptôme → cause probable

| Symptôme | Cause probable | Vérification |
|---|---|---|
| `ping` réussit, application ne répond pas | Port fermé ou service arrêté côté serveur | `ss -tulpn` sur le serveur, `Test-NetConnection` côté client |
| Connexion lente puis coupée sur gros transfert | Problème de MTU sur un tunnel VPN | Tester avec `ping -f -l <taille>` (Windows) pour trouver la MTU effective |
| `traceroute` s'arrête à un saut intermédiaire | Pare-feu bloquant ICMP sur ce routeur (souvent normal) | Vérifier avec un test de port direct plutôt que `traceroute` seul |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Appliquer le principe du moindre privilège aux ports exposés : chaque port ouvert est une surface d'attaque potentielle. Un audit périodique des ports en écoute sur chaque serveur (via `nmap` en scan interne ou `ss`/`netstat` en local) doit systématiquement pouvoir justifier chaque port ouvert par un service métier réel — tout port ouvert sans justification claire doit être fermé (Partie XI, durcissement).
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
La quasi-totalité des projets du portefeuille (BANKA, GESCOM, LAKAY, OTELA...) suivent la même convention de ports backend/frontend dédiés par projet (par exemple 4007/3008 pour OTELA), documentée systématiquement. Cette discipline — attribuer et documenter un port fixe par service plutôt que de laisser le système en choisir un au hasard — évite les collisions lorsque plusieurs projets tournent simultanément sur la même machine de développement, un problème concrètement rencontré sur SHOPAY où des serveurs backend et frontend oubliés en arrière-plan occupaient des ports sans que personne ne le sache (Partie I, Chapitre 5).
</div>

## Résumé du chapitre

- TCP/IP condense le modèle OSI en quatre couches pratiques : accès réseau, Internet, transport, application.
- TCP garantit la fiabilité et l'ordre ; UDP privilégie la vitesse sans garantie, adapté au temps réel.
- Chaque service réseau s'identifie par un couple adresse IP + port ; connaître les ports standards accélère le diagnostic.
- Un audit régulier des ports ouverts est une pratique de sécurité de base, pas seulement d'exploitation.

*Chapitre suivant : l'adressage IPv4, des classes historiques au calcul de sous-réseaux moderne (CIDR).*
