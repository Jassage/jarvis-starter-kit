<div class="chapitre-titre-num">CHAPITRE 19</div>

# Premier accès et configuration de base d'un switch

## Objectifs pédagogiques

Réaliser, étape par étape et sans rien deviner, le tout premier accès à un switch neuf ou à réinitialiser, sa sécurisation de base (mots de passe, SSH) et l'attribution de son adresse de management — le socle sur lequel s'appuient tous les chapitres suivants du Volume 7.

## Prérequis

Chapitre 18 (baie installée).

## Scénario du volume

Ce volume configure entièrement, chapitre après chapitre, un switch d'accès réel — **SW-ACCES-01** — desservant les VLAN Utilisateurs (20) et VoIP (40) d'un étage, relié par un lien agrégé (LACP, chapitre 21) au switch cœur **SW-COEUR** qui héberge le routage inter-VLAN (SVI, chapitre 12.5). Adressage de management repris du plan IP du chapitre 11 : VLAN 10, réseau `10.10.10.0/27`, passerelle `10.10.10.1` (portée par SW-COEUR). Chaque étape est donnée en **Cisco IOS**, puis intégralement rejouée en **MikroTik RouterOS** (19.7).

## OBJECTIF

Obtenir un accès de gestion sécurisé (SSH) à SW-ACCES-01, avec un hostname, des mots de passe robustes, et une adresse IP de management joignable depuis le reste du réseau.

## PRÉREQUIS

Switch monté en baie (chapitre 18), câble console disponible, ordinateur portable avec un logiciel d'émulation de terminal.

## MATÉRIEL NÉCESSAIRE

Câble console RJ45-vers-USB (fourni par le constructeur), ordinateur portable.

## LOGICIELS NÉCESSAIRES

PuTTY (Windows) ou l'application Terminal (macOS/Linux) pour la connexion série ; un client SSH pour la suite (PuTTY convient également, ou le module SSH intégré de PowerShell).

## TOPOLOGIE

```{.uml}
[ Ordinateur portable ] --(cable console)--> [ SW-ACCES-01 ]
                                                     │ (a venir, chapitre 21)
                                              [ SW-COEUR ] --- [ FIREWALL ]
```

## PLAN D'ADRESSAGE

| VLAN | Réseau | Passerelle | Adresse de SW-ACCES-01 |
|---|---|---|---|
| 10 (Management) | 10.10.10.0/27 | 10.10.10.1 (SW-COEUR) | 10.10.10.2 |

## ÉTAPE 1 — Connexion physique au port console

1. Relier l'ordinateur portable au **port console** du switch (jamais un port réseau classique pour ce premier accès).
2. Ouvrir le logiciel d'émulation de terminal, en connexion série, avec les paramètres **9600 bauds, 8 bits de données, pas de parité, 1 bit d'arrêt, pas de contrôle de flux** — quasi universels sur les équipements Cisco/MikroTik en accès console.
3. Mettre le switch sous tension et observer le déroulement du démarrage (bootloader, chargement de l'IOS) dans le terminal.

## ÉTAPE 2 — Réinitialiser si le switch n'est pas vierge

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
Switch> enable
Switch# erase startup-config
Switch# reload
```

<div class="depannage encadre">
<span class="encadre-titre">🚨 Si ça ne fonctionne pas</span>
Si `erase startup-config` échoue avec un message d'erreur de permission, vérifier qu'aucune session concurrente n'est déjà ouverte sur le switch (`show users`) et qu'aucun verrou de configuration n'est actif.
</div>

## ÉTAPE 3 — Configuration de base : hostname et mots de passe

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW-ACCES-01
SW-ACCES-01(config)# enable secret MotDePasseAdminSolide2026!
SW-ACCES-01(config)# service password-encryption
SW-ACCES-01(config)# line console 0
SW-ACCES-01(config-line)# password MotDePasseConsole2026!
SW-ACCES-01(config-line)# login
SW-ACCES-01(config-line)# exec-timeout 5 0
SW-ACCES-01(config-line)# exit
```

**Explication ligne par ligne :**

- `hostname SW-ACCES-01` → renomme l'équipement, apparaîtra dans l'invite de commande et dans tous les journaux ;
- `enable secret` → mot de passe du mode privilégié, stocké haché (jamais en clair, contrairement à un simple `enable password` obsolète) ;
- `service password-encryption` → chiffre (faiblement, mais mieux que rien) les autres mots de passe visibles en clair dans la configuration ;
- `line console 0` → entre dans la configuration de la ligne console elle-même ;
- `exec-timeout 5 0` → déconnecte automatiquement une session console inactive après 5 minutes, une bonne pratique de sécurité de base (chapitre 40).

## ÉTAPE 4 — Activer l'accès SSH

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01(config)# ip domain-name entreprise.local
SW-ACCES-01(config)# crypto key generate rsa modulus 2048
SW-ACCES-01(config)# username admin secret MotDePasseAdminSolide2026!
SW-ACCES-01(config)# line vty 0 15
SW-ACCES-01(config-line)# login local
SW-ACCES-01(config-line)# transport input ssh
SW-ACCES-01(config-line)# exec-timeout 5 0
SW-ACCES-01(config-line)# exit
SW-ACCES-01(config)# banner motd # Acces reserve au personnel autorise #
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi générer une clé RSA avant d'autoriser SSH</span>
`transport input ssh` exige une paire de clés RSA déjà générée sur l'équipement — sans cette étape (qui nécessite elle-même qu'un `ip domain-name` soit défini au préalable), la commande échoue silencieusement et l'accès distant reste indisponible. `transport input ssh` (et non `telnet`) désactive au passage tout accès Telnet non chiffré, conformément à la règle de sécurité du chapitre 2.5.
</div>

## ÉTAPE 5 — Attribuer l'adresse IP de management

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01(config)# vlan 10
SW-ACCES-01(config-vlan)# name Management
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# interface vlan 10
SW-ACCES-01(config-if)# ip address 10.10.10.2 255.255.255.224
SW-ACCES-01(config-if)# no shutdown
SW-ACCES-01(config-if)# exit
SW-ACCES-01(config)# ip default-gateway 10.10.10.1
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais oublier "no shutdown" sur une interface VLAN Cisco</span>
Une interface VLAN nouvellement créée sur un switch Cisco reste administrativement désactivée par défaut — sans `no shutdown`, l'adresse IP de management configurée reste injoignable, l'une des erreurs de débutant les plus fréquentes sur ce type de configuration (scénario de dépannage détaillé au chapitre 43).
</div>

## ÉTAPE 6 — Sauvegarder

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# copy running-config startup-config
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ running-config vs startup-config</span>
Toute commande tapée jusqu'ici modifie uniquement la configuration **active** (`running-config`), perdue au prochain redémarrage si elle n'est pas sauvegardée dans la configuration **de démarrage** (`startup-config`) — une coupure électrique avant cette étape effacerait tout le travail réalisé (voir aussi le chapitre 24, entièrement dédié à la sauvegarde).
</div>

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# show ip interface brief
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
Interface              IP-Address      OK? Method Status                Protocol
Vlan10                  10.10.10.2      YES manual up                    up
```

**Interprétation** : `Status: up` et `Protocol: up` confirment que l'interface VLAN 10 est active et opérationnelle — un `Status: administratively down` indiquerait que `no shutdown` (étape 5) n'a pas été appliqué correctement.
</div>

## TEST

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell (depuis un poste déjà sur le VLAN Management, ou via une connexion temporaire)</div>

```powershell
Test-NetConnection 10.10.10.2 -Port 22
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`TcpTestSucceeded : True` — confirme que le port SSH (22) est bien ouvert et joignable à l'adresse de management configurée. Se connecter ensuite réellement en SSH (`ssh admin@10.10.10.2`) pour confirmer l'authentification.
</div>

## DÉPANNAGE

### Si `Test-NetConnection` renvoie `TcpTestSucceeded : False`

1. Vérifier que le câble reliant l'ordinateur de test au switch est bien sur un port du VLAN 10, ou que le routage vers ce VLAN existe déjà (souvent non, à ce stade du projet — un test depuis le port console avec `show ip interface brief` suffit tant que le VLAN 10 n'est pas encore relié au reste du réseau, chapitre 21).
2. Vérifier `no shutdown` sur l'interface VLAN 10 (étape 5).
3. Vérifier qu'aucune ACL ou règle de sécurité (chapitre 23, pas encore appliquée à ce stade) ne bloque le port 22.

### Si la connexion SSH est refusée avec un mauvais nom d'utilisateur/mot de passe

Vérifier que `username admin secret ...` (étape 4) a bien été saisi sans faute de frappe, et que `login local` (et non simplement `login`) est bien configuré sur les lignes VTY — `login` seul chercherait un mot de passe de ligne générique, jamais configuré ici, plutôt que la base d'utilisateurs locale.

## SAUVEGARDE

Confirmée à l'étape 6 (`copy running-config startup-config`) — méthode complète de sauvegarde externe au chapitre 24.

## DOCUMENTATION

Noter dans le dossier de projet : hostname, adresse de management, et confirmer que le mot de passe administrateur est stocké dans le gestionnaire d'identifiants du projet (jamais en clair dans un simple fichier texte partagé).

## CHECKLIST DE FIN

- [ ] Accès console établi et switch réinitialisé si nécessaire
- [ ] Hostname configuré
- [ ] Mot de passe enable secret configuré
- [ ] SSH activé, Telnet désactivé
- [ ] Adresse IP de management attribuée et interface VLAN active (`no shutdown`)
- [ ] Passerelle par défaut configurée
- [ ] Connexion SSH testée avec succès depuis un poste distant
- [ ] Configuration sauvegardée (`startup-config`)

## 19.7 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS</div>

```
/system identity set name=SW-ACCES-01

/user set admin password=MotDePasseAdminSolide2026!
/ip service disable telnet,www,ftp
/ip service set ssh port=22

/interface bridge add name=bridge-lan vlan-filtering=yes protocol-mode=rstp
/interface vlan add name=VLAN10-Management interface=bridge-lan vlan-id=10
/ip address add address=10.10.10.2/27 interface=VLAN10-Management
/ip route add gateway=10.10.10.1

/system backup save name=backup-SW-ACCES-01-initial
```

**Explication** : `/user set admin password=...` change le mot de passe du compte administrateur par défaut (jamais laissé vide, une faille fréquente sur du matériel neuf) ; `/ip service disable telnet,www,ftp` désactive les accès non chiffrés (équivalent de `transport input ssh` côté Cisco) ; le VLAN 10 est créé sur un bridge avec filtrage VLAN activé, préparant directement le travail du chapitre 20.

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@SW-ACCES-01] > /ip address print
Flags: X - disabled, I - invalid, D - dynamic
 #   ADDRESS            NETWORK        INTERFACE
 0   10.10.10.2/27      10.10.10.0     VLAN10-Management
```
</div>

## Résumé du chapitre

Le premier accès à un switch se fait toujours par le port console, jamais par le réseau. La configuration de base sécurise l'accès (mots de passe forts, SSH activé, Telnet désactivé) avant même de penser à configurer un seul VLAN de production, attribue une adresse de management sur le VLAN dédié (chapitre 11), et se termine toujours par une sauvegarde explicite de la configuration.

*Chapitre suivant : VLAN, ports d'accès et voix — créer les VLAN du projet et configurer les ports utilisateurs.*
