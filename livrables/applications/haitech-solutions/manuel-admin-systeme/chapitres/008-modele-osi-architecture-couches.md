<div class="chapitre-titre-num">PARTIE II · CHAPITRE 6</div>

# Le modèle OSI et l'architecture en couches

## Rôle du modèle OSI

Le modèle OSI (Open Systems Interconnection, ISO 1984) découpe la communication réseau en sept couches indépendantes, chacune responsable d'une fonction précise et communiquant uniquement avec les couches immédiatement adjacentes. Son rôle n'est pas d'être implémenté tel quel (c'est TCP/IP, plus pragmatique, qui domine en pratique — Chapitre 7) mais de fournir un **langage commun de diagnostic** : quand un administrateur système dit « le problème est en couche 2 », tout technicien réseau comprend immédiatement qu'il s'agit d'un problème de commutation ou d'adressage MAC, pas de routage ou d'application.

## Fonctionnement : les sept couches

| # | Couche | Rôle | Unité de données | Exemples |
|---|---|---|---|---|
| 7 | Application | Interface avec les logiciels utilisateurs | Données | HTTP, DNS, SMTP, FTP |
| 6 | Présentation | Format, chiffrement, compression | Données | TLS/SSL, encodage (UTF-8, JPEG) |
| 5 | Session | Ouverture/maintien/fermeture de session | Données | Sessions TLS, NetBIOS |
| 4 | Transport | Livraison fiable ou rapide de bout en bout | Segment | TCP, UDP |
| 3 | Réseau | Adressage logique et routage entre réseaux | Paquet | IPv4, IPv6, ICMP |
| 2 | Liaison de données | Adressage physique local, détection d'erreurs | Trame | Ethernet, Wi-Fi, commutation (switch), VLAN |
| 1 | Physique | Transmission des bits sur le support | Bit | Câble cuivre, fibre optique, ondes radio |

<div class="encadre astuce">
<span class="encadre-titre">💡 Moyen mnémotechnique</span>
De la couche 1 à la couche 7 : « Please Do Not Throw Sausage Pizza Away » (Physique, Data link, Network, Transport, Session, Presentation, Application). En français, une variante courante : « Pour Livrer Rapidement, Transportez Sept Paquets Aujourd'hui ».
</div>

## Prérequis pour exploiter ce modèle en diagnostic

- Connaître l'encapsulation : chaque couche ajoute son propre en-tête aux données de la couche supérieure en descendant (encapsulation), et les retire symétriquement en remontant (décapsulation) côté récepteur
- Savoir associer un symptôme observé à une couche probable (voir tableau de diagnostic ci-dessous)
- Disposer des outils de capture ou d'analyse adaptés à chaque couche (voir 8.7)

## Mise en pratique : lire un problème par couche

1. **Couche 1 (Physique)** — Le câble est-il branché, le voyant du port est-il allumé, la fibre n'est-elle pas coudée au-delà du rayon de courbure minimal ?
2. **Couche 2 (Liaison)** — Le VLAN est-il correctement configuré sur le port, y a-t-il une boucle (tempête de broadcast), l'adresse MAC est-elle bien apprise par le switch ?
3. **Couche 3 (Réseau)** — L'adresse IP est-elle correcte, la passerelle par défaut répond-elle, une route existe-t-elle vers la destination ?
4. **Couche 4 (Transport)** — Le port TCP/UDP est-il ouvert côté serveur, un pare-feu ne bloque-t-il pas ce port en chemin ?
5. **Couches 5 à 7** — La session applicative s'établit-elle (certificat TLS valide, authentification acceptée, réponse applicative correcte) ?

<div class="encadre astuce">
<span class="encadre-titre">💡 Méthode</span>
Diagnostiquer du bas vers le haut (couche 1 avant couche 7) évite de perdre du temps à déboguer une application qui « ne répond pas » alors que le câble réseau est simplement débranché. C'est la première question à se poser face à tout incident réseau signalé.
</div>

## Configuration : où se situent les équipements courants

| Équipement | Couche principale d'opération | Décision qu'il prend |
|---|---|---|
| Hub (obsolète) | 1 | Aucune — répète le signal électrique sur tous les ports |
| Switch (commutateur) | 2 (certains modèles L3) | Vers quel port envoyer une trame, selon l'adresse MAC |
| Routeur | 3 | Vers quel réseau envoyer un paquet, selon l'adresse IP |
| Pare-feu applicatif (NGFW) | 3 à 7 | Filtrage jusqu'au contenu applicatif (Partie III) |
| Répartiteur de charge (load balancer) | 4 ou 7 selon le mode | Vers quel serveur backend envoyer la requête (Partie III) |

## Administration courante : rattacher un ticket à une couche

Un bon réflexe d'exploitation consiste à classer chaque incident réseau signalé par sa couche probable dès l'ouverture du ticket, pour orienter directement le bon outil de diagnostic et éviter les allers-retours entre équipes.

## Outils par couche

| Couche | Outils de diagnostic |
|---|---|
| 1 — Physique | Testeur de câble, voyants de port, `ethtool` (Linux) |
| 2 — Liaison | `show mac address-table` (Cisco), `arp -a`, analyseur de trames (Wireshark) |
| 3 — Réseau | `ping`, `traceroute`/`tracert`, `ip route`, `show ip route` |
| 4 — Transport | `netstat`, `ss -tulpn` (Linux), `Test-NetConnection` (PowerShell), scanner de ports (`nmap`) |
| 5 à 7 — Session/Présentation/Application | `curl -v`, navigateur avec outils développeur, journaux applicatifs |

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Toujours diagnostiquer du bas vers le haut, sauf si un symptôme oriente déjà clairement vers une couche précise
- Documenter la couche identifiée dans le ticket d'incident, pour accélérer la résolution des cas similaires futurs
- Former les équipes support N1 à distinguer au minimum couche 1-2 (physique/liaison) de couche 3+ (réseau et au-delà), pour un premier tri efficace
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Redémarrer un service applicatif en réflexe avant d'avoir vérifié la connectivité réseau de base (couches 1-3)
- Confondre un problème de résolution DNS (couche 7 applicative) avec un problème de routage IP (couche 3) — deux diagnostics très différents pour un même symptôme apparent (« le site ne répond pas »)
- Ignorer les couches 5-6 (session, présentation) dans le diagnostic TLS, alors qu'une majorité des échecs de connexion HTTPS s'y situent (certificat expiré, versions TLS incompatibles)
</div>

## Dépannage : tableau de correspondance symptôme → couche

| Symptôme | Couche probable | Premier réflexe |
|---|---|---|
| Aucun voyant sur le port switch | 1 | Vérifier le câble, tester un autre port |
| Le poste ne reçoit pas d'adresse IP | 2-3 (DHCP, Partie III) | Vérifier le VLAN du port, le service DHCP |
| « Destination host unreachable » au ping | 3 | Vérifier la table de routage, la passerelle |
| Le ping passe mais l'application ne répond pas | 4-7 | Vérifier le port applicatif, le pare-feu, le service lui-même |
| Erreur de certificat dans le navigateur | 6 | Vérifier la validité et la chaîne du certificat TLS (Partie XI) |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
La segmentation de sécurité s'opère à plusieurs couches simultanément et de façon complémentaire : VLAN et listes de contrôle d'accès de port en couche 2, filtrage par sous-réseau et ACL routées en couche 3, pare-feu avec inspection de contenu en couche 7. Une sécurité reposant sur une seule couche (par exemple uniquement un pare-feu périmétrique en couche 3-4, sans segmentation interne en couche 2) laisse un attaquant ayant franchi le périmètre libre de se déplacer latéralement sans aucune friction.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Sur REYINYON (plateforme de visioconférence WebRTC), un bug réseau conteneur-à-conteneur découvert en session illustre parfaitement l'intérêt du raisonnement par couches : LiveKit et le service d'enregistrement Egress communiquaient via `node_ip: 127.0.0.1`, une adresse de bouclage propre à chaque conteneur Docker (couche 3, adressage IP), inutilisable par Egress pour joindre le flux WebRTC tant que les deux conteneurs ne partageaient pas le même espace réseau. Le symptôme observé (« l'enregistrement ne démarre jamais ») se situait en apparence au niveau applicatif (couche 7), mais la cause racine était strictement une mauvaise configuration d'adressage en couche 3 — exactement le type de piège que le réflexe « diagnostiquer du bas vers le haut » permet d'éviter.
</div>

## Résumé du chapitre

- Le modèle OSI structure la communication réseau en sept couches, du support physique à l'application.
- Diagnostiquer du bas vers le haut (couche 1 avant couche 7) est la méthode la plus efficace face à un incident réseau.
- Chaque équipement réseau opère principalement à une couche donnée : switch en couche 2, routeur en couche 3.
- La sécurité réseau doit se penser à plusieurs couches simultanément, jamais une seule.

*Chapitre suivant : TCP/IP, la suite de protocoles réellement utilisée en production.*
