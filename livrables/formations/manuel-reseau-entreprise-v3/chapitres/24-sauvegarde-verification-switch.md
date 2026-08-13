<div class="chapitre-titre-num">CHAPITRE 24</div>

# Sauvegarde, vérification et dépannage du switch

## Objectifs pédagogiques

Clôturer la configuration de SW-ACCES-01 par la qualité de service pour la voix, une sauvegarde externe (pas seulement locale), une vérification complète de l'ensemble du Volume 7, et un premier réflexe de dépannage propre aux switches.

## Prérequis

Chapitres 19-23.

## ÉTAPE 1 — QoS de base pour la voix sur IP

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

```
SW-ACCES-01(config)# mls qos
SW-ACCES-01(config)# interface range gigabitEthernet 1/0/1-22
SW-ACCES-01(config-if-range)# mls qos trust cos
SW-ACCES-01(config-if-range)# auto qos voip cisco-phone
SW-ACCES-01(config-if-range)# exit
```

**Explication** : `mls qos` active la gestion de qualité de service au niveau du switch ; `mls qos trust cos` fait confiance au marquage de priorité (CoS, Class of Service) déjà posé par le téléphone IP lui-même sur ses propres trames ; `auto qos voip cisco-phone` applique automatiquement un ensemble de réglages recommandés pour prioriser le trafic voix (VLAN 40) sur le trafic de données classique (VLAN 20/25) en cas de congestion du port — garantissant qu'un gros transfert de fichier en cours sur le VLAN Utilisateurs ne dégrade jamais la qualité d'un appel téléphonique simultané sur le même port physique partagé.

## ÉTAPE 2 — Sauvegarde locale (rappel)

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# copy running-config startup-config
```

## ÉTAPE 3 — Sauvegarde externe

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# copy running-config tftp://10.10.30.20/backup-SW-ACCES-01-2026.cfg
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une sauvegarde locale seule ne protège pas contre une panne matérielle du switch</span>
La configuration sauvegardée en `startup-config` (étape 2) survit à un redémarrage, mais reste physiquement stockée **sur le switch lui-même** — inutile en cas de panne matérielle totale (carte mère grillée, incendie du local technique) qui obligerait à reconfigurer un switch de remplacement entièrement de zéro. Une copie **externe** régulière (serveur TFTP/SCP dédié, chapitre 39) est indispensable pour pouvoir restaurer rapidement une configuration complète sur un équipement de remplacement.
</div>

## VÉRIFICATION FINALE — l'ensemble du Volume 7

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# show running-config
```

Relire la configuration complète et confirmer, dans l'ordre, chaque point suivant :

| Chapitre | Élément à confirmer présent |
|---|---|
| 19 | Hostname, enable secret, SSH activé, Telnet désactivé, adresse de management |
| 20 | Tous les VLAN du projet créés, ports utilisateurs en access + voix |
| 21 | Port-channel LACP actif, trunk avec liste explicite de VLAN, natif 999 |
| 22 | Mode RSTP, priorité cohérente (switch d'accès par défaut), PortFast/BPDU Guard, Root Guard côté cœur |
| 23 | Port Security actif (max 2, restrict), DHCP Snooping actif avec le bon port trust, ports inutilisés fermés |
| 24 | QoS voix active, sauvegarde locale et externe réalisées |

## TEST

Depuis un poste de travail réel branché sur un port de VLAN 20 : vérifier la connexion physique (`show interfaces status` → `connected`), tenter une obtention d'adresse IP par DHCP (fonctionnel une fois le Volume 8 — routage — et le DHCP du Volume 8 configurés), et confirmer qu'un téléphone IP branché sur le même port démarre correctement sur le VLAN 40.

## DÉPANNAGE — réflexe général propre aux switches

Face à un symptôme sur ce switch, la méthode complète de diagnostic est développée au chapitre 41 ; ce tableau résume où chercher en priorité selon le symptôme, avec un renvoi vers le scénario détaillé correspondant (chapitre 43, "Scénarios switching et VLAN") :

| Symptôme | Vérifier en premier | Scénario détaillé |
|---|---|---|
| Port reste `notconnect` | Câble, prise murale, certification (chapitre 17) | Chapitre 42 |
| Port dans le mauvais VLAN | `show vlan brief` (chapitre 20) | Chapitre 43 |
| Port en `err-disabled` | BPDU Guard ou Port Security déclenché (chapitres 22-23) | Chapitre 43 |
| Trunk ne transporte pas un VLAN | Liste `allowed vlan` incohérente entre les deux extrémités (chapitre 21) | Chapitre 43 |
| Agrégation LACP non formée | Mode `active`/`passive`, vitesse/duplex (chapitre 21) | Chapitre 43 |
| Aucune adresse DHCP obtenue | Port trust DHCP Snooping (chapitre 23) | Chapitre 43 |

## SAUVEGARDE

Confirmée aux étapes 2 et 3 (locale et externe).

## DOCUMENTATION

L'ensemble de la configuration de SW-ACCES-01, une fois vérifiée, est versée dans la documentation finale du projet (chapitre 49) avec la date de la dernière sauvegarde externe.

## CHECKLIST DE FIN — Volume 7 complet

- [ ] QoS voix active sur les ports partagés poste/téléphone
- [ ] Sauvegarde locale (`startup-config`) réalisée
- [ ] Sauvegarde externe (TFTP/SCP) réalisée et datée
- [ ] Chaque point du tableau de vérification finale confirmé présent dans `show running-config`
- [ ] Test réel depuis un poste de travail effectué

## 24.1 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS</div>

```
/system backup save name=backup-SW-ACCES-01-final
/export file=backup-SW-ACCES-01-final-config
/tool fetch upload=yes address=10.10.30.20 src-path=backup-SW-ACCES-01-final.backup mode=ftp user=backupuser password=MotDePasseBackup2026!
```

**Explication** : `/system backup save` crée une sauvegarde binaire complète (équivalent de `startup-config`) ; `/export file=...` génère en complément un fichier texte lisible de la configuration (utile pour une relecture ou une comparaison, sans dépendre du format binaire propriétaire) ; `/tool fetch` avec `upload=yes` envoie ce fichier vers un serveur externe — l'équivalent RouterOS de la sauvegarde externe TFTP côté Cisco.

## 24.2 Laboratoire complet — Cisco Packet Tracer, rejouer tout le Volume 7

**Quoi installer** : Cisco Packet Tracer (même installation que le laboratoire du chapitre 8.10).
**Où télécharger** : `netacad.com`, section Packet Tracer.
**Machine/VM** : aucune, installation directe sur le poste de travail.
**RAM/CPU** : 4 Go de RAM, double cœur.

**Topologie à construire** (reproduction du scénario SW-ACCES-01 ↔ SW-COEUR des chapitres 19-27) :

```{.uml}
[ PC-Test ]---[ SW-ACCES-01 (Switch 2960) ]===(2 liens)===[ SW-COEUR (Switch 3560, L3) ]
[ Telephone-IP ]---/
```

**Interfaces réseau** : deux liens `FastEthernet` entre SW-ACCES-01 et SW-COEUR pour simuler l'agrégation LACP (chapitre 21) ; un `Switch 3560` (et non un 2960) est indispensable pour SW-COEUR, seul ce modèle supportant le routage inter-VLAN (`ip routing`, chapitre 26) dans Packet Tracer.

**Adresses IP** : reprendre exactement le plan d'adressage du chapitre 19 (`10.10.10.2` pour SW-ACCES-01, `10.10.10.1` pour la passerelle de management portée par SW-COEUR).

**Commandes à exécuter** : rejouer, dans l'ordre, les commandes des chapitres 19 (accès SSH), 20 (VLAN 20/40, ports access), 21 (`channel-group`, trunk), 22 (`spanning-tree mode rapid-pvst`, priorité), 23 (Port Security, DHCP Snooping) — chaque commande est directement copiable depuis ces chapitres, sans adaptation.

**Tests à réaliser** :
1. `show etherchannel summary` sur SW-ACCES-01 — confirmer `(P)` sur les deux ports agrégés (chapitre 21).
2. Débrancher un câble de l'agrégation dans Packet Tracer (clic droit sur le lien → "Delete") — confirmer que `PC-Test` reste joignable via le câble restant.
3. `show spanning-tree vlan 20` sur SW-COEUR — confirmer `This bridge is the root`.
4. Simuler une boucle volontaire (relier deux ports libres de SW-ACCES-01 entre eux avec un câble) et observer, en mode "Simulation" de Packet Tracer, que RSTP bloque immédiatement l'un des deux ports plutôt que de laisser une tempête de broadcast se former — la preuve visuelle directe du mécanisme du chapitre 22.

## Résumé du chapitre

La QoS de base priorise le trafic voix sur le trafic de données lorsqu'un port est partagé entre un poste et son téléphone IP. La sauvegarde ne se limite jamais à la configuration locale (`startup-config`) : une copie externe régulière, sur un serveur dédié, est indispensable pour survivre à une panne matérielle complète du switch. La vérification finale reprend systématiquement chaque point des chapitres précédents avant de considérer un switch prêt pour la production.

*Fin du Volume 7. Chapitre suivant : la configuration de base d'un routeur — accès, hostname, interfaces, route par défaut et routes statiques, premier chapitre du Volume 8 consacré au routage.*
