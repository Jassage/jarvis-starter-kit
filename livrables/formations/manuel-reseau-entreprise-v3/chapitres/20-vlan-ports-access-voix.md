<div class="chapitre-titre-num">CHAPITRE 20</div>

# VLAN, ports d'accès et voix

## Objectifs pédagogiques

Créer l'ensemble des VLAN du projet sur SW-ACCES-01 et configurer les ports d'accès utilisateurs, y compris le partage d'un même port physique entre un poste et son téléphone IP grâce au VLAN voix auxiliaire.

## Prérequis

Chapitre 19.

## OBJECTIF

Tous les VLAN du plan IP (chapitre 11) existent sur le switch, et chaque port utilisateur est correctement assigné à son VLAN (Utilisateurs ou Comptabilité selon le bureau), avec le VLAN voix auxiliaire pour les téléphones IP partageant le même port.

## PRÉREQUIS

Chapitre 19 (management opérationnel).

## PLAN D'ADRESSAGE

Repris du chapitre 11 : VLAN 20 (Utilisateurs), VLAN 25 (Comptabilité), VLAN 40 (VoIP) sont ceux directement concernés par les ports d'accès de SW-ACCES-01 dans ce scénario (les VLAN Serveurs, Wi-Fi, CCTV et Sécurité sont créés ici par cohérence de base de données VLAN, mais ne seront attribués à aucun port access de ce switch précis).

## ÉTAPE 1 — Créer tous les VLAN du projet

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# configure terminal
SW-ACCES-01(config)# vlan 20
SW-ACCES-01(config-vlan)# name Utilisateurs
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 25
SW-ACCES-01(config-vlan)# name Comptabilite
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 30
SW-ACCES-01(config-vlan)# name Serveurs
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 40
SW-ACCES-01(config-vlan)# name VoIP
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 50
SW-ACCES-01(config-vlan)# name WiFi-Corporate
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 60
SW-ACCES-01(config-vlan)# name WiFi-Invite
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 80
SW-ACCES-01(config-vlan)# name CCTV
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 90
SW-ACCES-01(config-vlan)# name Securite
SW-ACCES-01(config-vlan)# exit
SW-ACCES-01(config)# vlan 999
SW-ACCES-01(config-vlan)# name Native-Non-Utilise
SW-ACCES-01(config-vlan)# exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi créer aussi les VLAN qui n'auront aucun port access sur ce switch</span>
Le VLAN 999 (natif, chapitre 12.4) n'a besoin d'exister que sur les switches disposant d'un trunk — mais créer systématiquement **l'ensemble** des VLAN standards du projet sur chaque switch, même ceux sans port access correspondant, évite un oubli au moment de configurer le trunk (chapitre 21), qui doit explicitement lister tous les VLAN autorisés à le traverser.
</div>

## ÉTAPE 2 — Configurer les ports d'accès utilisateurs standards

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-18
SW-ACCES-01(config-if-range)# switchport mode access
SW-ACCES-01(config-if-range)# switchport access vlan 20
SW-ACCES-01(config-if-range)# switchport voice vlan 40
SW-ACCES-01(config-if-range)# spanning-tree portfast
SW-ACCES-01(config-if-range)# spanning-tree bpduguard enable
SW-ACCES-01(config-if-range)# exit
```

**Explication ligne par ligne :**

- `switchport mode access` → force le port en mode access (jamais trunk), quel que soit ce qui est branché ;
- `switchport access vlan 20` → assigne le VLAN Utilisateurs comme VLAN de données du port ;
- `switchport voice vlan 40` → ajoute un second VLAN auxiliaire pour la voix, permettant à un poste **et** son téléphone IP de partager le même câble et le même port physique (chapitre 2, un téléphone IP intègre généralement un petit switch à 2 ports) ;
- `spanning-tree portfast` et `bpduguard` → couverts en détail au chapitre 22, appliqués dès maintenant car ce port se termine sur un appareil final, jamais sur un autre switch.

## ÉTAPE 3 — Configurer les ports du service Comptabilité (isolé)

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/19-22
SW-ACCES-01(config-if-range)# switchport mode access
SW-ACCES-01(config-if-range)# switchport access vlan 25
SW-ACCES-01(config-if-range)# switchport voice vlan 40
SW-ACCES-01(config-if-range)# spanning-tree portfast
SW-ACCES-01(config-if-range)# spanning-tree bpduguard enable
SW-ACCES-01(config-if-range)# exit
```

Même logique que l'étape 2, en VLAN 25 (Comptabilité) plutôt que 20 — les postes de comptabilité restent isolés des autres utilisateurs conformément au plan VLAN d'accès (chapitre 11.2), tout en partageant le même VLAN voix (la téléphonie n'a pas de raison d'être cloisonnée de la même façon).

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# show vlan brief
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
10   Management                       active
20   Utilisateurs                     active    Gi1/0/1, Gi1/0/2, ... Gi1/0/18
25   Comptabilite                     active    Gi1/0/19, Gi1/0/20, Gi1/0/21, Gi1/0/22
30   Serveurs                         active
40   VoIP                             active
50   WiFi-Corporate                   active
60   WiFi-Invite                      active
80   CCTV                             active
90   Securite                         active
999  Native-Non-Utilise               active
```

**Interprétation** : chaque VLAN de données apparaît avec la liste exacte de ses ports access — le VLAN voix (40) n'apparaît **jamais** dans cette liste de ports (comportement normal : `switchport voice vlan` ne l'associe pas de la même façon qu'un VLAN d'accès standard, il reste néanmoins actif et fonctionnel).
</div>

## TEST

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell (depuis un PC branché sur un port de l'étape 2)</div>

```powershell
ipconfig /all
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Une adresse IP obtenue dans la plage du VLAN 20 (`10.10.20.x`, une fois le DHCP configuré au Volume 8) — à ce stade du manuel, avant la configuration du routage inter-VLAN et du DHCP, le test se limite à confirmer que le port est bien "connecté" (`show interfaces status`) plutôt qu'une adresse IP complète, qui n'apparaîtra qu'après les chapitres suivants.
</div>

## DÉPANNAGE

### Si un PC branché reste sans adresse IP (même en configuration statique de test)

1. Vérifier `show interfaces status` sur le switch — le port doit afficher `connected`, pas `notconnect` (câble ou prise en cause, chapitre 42) ni `disabled`.
2. Vérifier que le port appartient bien au bon VLAN (`show vlan brief`, ci-dessus) — un port resté par erreur sur le VLAN 1 par défaut est une cause fréquente.

### Si le téléphone IP ne démarre pas correctement sur un port partagé

Vérifier que `switchport voice vlan 40` est bien appliqué (et pas seulement `switchport access vlan 20`) — sans cette ligne, le téléphone IP ne reçoit aucune indication de VLAN voix et tente de démarrer sur le VLAN de données, où sa configuration attendue (souvent poussée par un serveur de téléphonie dédié au VLAN 40) ne peut pas le joindre.

## SAUVEGARDE

```
SW-ACCES-01# copy running-config startup-config
```

## DOCUMENTATION

Mettre à jour le plan de ports du projet (chapitre 47) avec l'attribution VLAN réelle de chaque port de SW-ACCES-01.

## CHECKLIST DE FIN

- [ ] Tous les VLAN standards du projet créés, y compris ceux sans port access sur ce switch
- [ ] VLAN 999 (natif, non utilisé) créé
- [ ] Ports utilisateurs standards en VLAN 20 + voix VLAN 40, portfast + bpduguard actifs
- [ ] Ports Comptabilité en VLAN 25 + voix VLAN 40, portfast + bpduguard actifs
- [ ] `show vlan brief` confirme l'attribution correcte de chaque port
- [ ] Configuration sauvegardée

## 20.1 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS</div>

```
/interface vlan
add name=VLAN20-Utilisateurs interface=bridge-lan vlan-id=20
add name=VLAN25-Comptabilite interface=bridge-lan vlan-id=25
add name=VLAN30-Serveurs interface=bridge-lan vlan-id=30
add name=VLAN40-VoIP interface=bridge-lan vlan-id=40
add name=VLAN50-WiFiCorporate interface=bridge-lan vlan-id=50
add name=VLAN60-WiFiInvite interface=bridge-lan vlan-id=60
add name=VLAN80-CCTV interface=bridge-lan vlan-id=80
add name=VLAN90-Securite interface=bridge-lan vlan-id=90

# Ports d'acces utilisateurs standards (VLAN 20 natif du port, VLAN 40 voix tague)
/interface bridge port
add bridge=bridge-lan interface=ether1 pvid=20
add bridge=bridge-lan interface=ether2 pvid=20
add bridge=bridge-lan interface=ether18 pvid=20

/interface bridge vlan
add bridge=bridge-lan vlan-ids=20 untagged=ether1,ether2,ether18
add bridge=bridge-lan vlan-ids=40 tagged=ether1,ether2,ether18

# Ports Comptabilite (VLAN 25 natif, VLAN 40 voix tague)
/interface bridge port
add bridge=bridge-lan interface=ether19 pvid=25
add bridge=bridge-lan interface=ether22 pvid=25

/interface bridge vlan
add bridge=bridge-lan vlan-ids=25 untagged=ether19,ether22
add bridge=bridge-lan vlan-ids=40 tagged=ether19,ether22
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La logique MikroTik : pvid pour le VLAN natif du port, vlan-ids/tagged pour le reste</span>
RouterOS n'a pas de commande directe équivalente à `switchport voice vlan` : le même résultat (un port avec un VLAN de données non tagué et un VLAN voix tagué) s'obtient en combinant `pvid` (le VLAN "access" natif du port, reçu sans tag) avec une entrée `bridge vlan` supplémentaire qui tague explicitement le VLAN 40 sur ce même port — le téléphone IP, configuré pour tagger lui-même son trafic en VLAN 40, et le PC derrière lui, qui envoie du trafic non tagué automatiquement associé au `pvid`, coexistent ainsi sur le même câble.
</div>

## Résumé du chapitre

Tous les VLAN standards du projet sont créés sur chaque switch, même ceux sans port access local, pour préparer le trunk du chapitre suivant. Un port utilisateur standard combine un VLAN de données (access) et un VLAN voix auxiliaire, permettant à un poste et son téléphone IP de partager le même câble. Portfast et BPDU Guard sont appliqués dès la création de ces ports, jamais reportés à plus tard.

*Chapitre suivant : le trunk et l'agrégation LACP — relier SW-ACCES-01 au switch cœur avec un lien agrégé et redondant.*
