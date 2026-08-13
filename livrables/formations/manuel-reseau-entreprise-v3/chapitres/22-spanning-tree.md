<div class="chapitre-titre-num">CHAPITRE 22</div>

# Spanning Tree et haute disponibilité de couche 2

## Objectifs pédagogiques

Comprendre pourquoi Spanning Tree (STP/RSTP) est activé sur pratiquement tout réseau professionnel — y compris sans topologie redondante intentionnelle — et configurer correctement la priorité de root bridge, PortFast, BPDU Guard et Root Guard.

## Prérequis

Chapitre 21.

## OBJECTIF

Garantir qu'aucune boucle physique, intentionnelle (redondance) ou accidentelle (câble mal branché), ne puisse jamais provoquer une tempête de broadcast paralysant le réseau, tout en désignant explicitement quel switch doit devenir l'autorité centrale (root bridge) du réseau de couche 2.

## 22.1 Pourquoi Spanning Tree, même sans redondance intentionnelle

<div class="encadre attention">
<span class="encadre-titre">⚠️ L'accident le plus classique de tout réseau d'entreprise</span>
Un technicien (ou un employé) relie par erreur deux prises murales du même bureau avec un câble réseau resté branché "pour tester" — si ces deux prises aboutissent au même switch, ou à deux switches déjà reliés entre eux, une **boucle** se forme : une même trame de broadcast circule indéfiniment en double, se multipliant à chaque passage, jusqu'à saturer complètement le réseau en quelques secondes (une "tempête de broadcast"). Sans Spanning Tree actif, ce scénario — qui ne demande aucune malveillance, juste une inattention — peut mettre à genoux un réseau entier. C'est la raison pour laquelle RSTP (Rapid Spanning Tree Protocol) est activé par défaut sur ce manuel, sur chaque switch de chaque projet, indépendamment de toute redondance volontaire.
</div>

## 22.2 Comment Spanning Tree empêche une boucle

STP fait élire un unique **root bridge** (pont racine) parmi tous les switches du réseau, puis calcule pour chaque switch le chemin le plus court vers ce root bridge. Tout lien physique qui créerait un second chemin redondant vers le root bridge est placé en état **blocking** (aucune trame de données ne le traverse, sauf les messages de contrôle STP eux-mêmes) — le lien reste physiquement connecté et prêt, mais logiquement inactif, jusqu'à ce qu'il devienne nécessaire (panne du chemin principal), où il repasse alors automatiquement en état actif.

## ÉTAPE 1 — Choisir explicitement le root bridge (sur SW-COEUR)

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# spanning-tree mode rapid-pvst
SW-COEUR(config)# spanning-tree vlan 10,20,25,30,40,50,60,80,90 priority 4096
```

**Explication** : `rapid-pvst` active RSTP avec une instance **par VLAN** (Per-VLAN Spanning Tree, une particularité Cisco — 22.6 explique pourquoi ce n'est pas universel). La priorité par défaut de tout switch est 32768 ; l'abaisser explicitement à 4096 sur le switch cœur garantit qu'il sera élu root bridge (la priorité la plus basse gagne l'élection), sans dépendre d'un hasard d'adresse MAC.

## ÉTAPE 2 — Laisser la priorité par défaut sur les switches d'accès

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-ACCES-01)</div>

Aucune commande de priorité STP n'est nécessaire sur SW-ACCES-01 : la valeur par défaut (32768) garantit qu'il ne pourra jamais concurrencer SW-COEUR pour le rôle de root bridge — un switch d'accès ne doit **jamais** devenir root, un principe déjà appliqué à l'identique dans le manuel V2 de ce projet.

## ÉTAPE 3 — Root Guard sur les ports du switch cœur face aux switches d'accès

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (SW-COEUR)</div>

```
SW-COEUR(config)# interface port-channel 1
SW-COEUR(config-if)# spanning-tree guard root
SW-COEUR(config-if)# exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi Root Guard, en plus de la priorité choisie à l'étape 1</span>
La priorité choisie à l'étape 1 empêche SW-ACCES-01 de **vouloir** devenir root dans des conditions normales — mais un switch non autorisé branché par erreur (ou intentionnellement) sur un port d'accès, configuré avec une priorité STP très basse, pourrait théoriquement tenter de s'annoncer comme root. Root Guard, posé du côté du switch cœur sur chaque port qui descend vers un switch d'accès, bloque activement ce port si un équipement en aval tente de s'annoncer root — une protection de sécurité, pas seulement une configuration de performance.
</div>

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-COEUR# show spanning-tree vlan 20
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>

```
VLAN0020
  Spanning tree enabled protocol rstp
  Root ID    Priority    4096
             Address     [adresse MAC de SW-COEUR]
             This bridge is the root
```

**Interprétation** : `This bridge is the root` confirme que SW-COEUR a bien été élu root bridge pour le VLAN 20, comme voulu à l'étape 1. La même commande lancée sur SW-ACCES-01 afficherait un `Root ID` avec la même adresse MAC (celle de SW-COEUR) mais **sans** la mention "This bridge is the root" — confirmant que SW-ACCES-01 a correctement identifié SW-COEUR comme root sans jamais tenter de le devenir.
</div>

```
SW-ACCES-01# show spanning-tree summary
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Chaque port d'accès configuré avec PortFast (chapitre 20) doit apparaître directement en état `FWD` (forwarding) sans transition visible par les états intermédiaires `listening`/`learning` — c'est exactement le bénéfice de PortFast : un poste utilisateur qui démarre obtient un accès réseau quasi instantané, plutôt que d'attendre jusqu'à 30-50 secondes (le délai de convergence STP standard sans PortFast) avant que son port ne devienne actif.
</div>

## DÉPANNAGE

### Si un port bascule en état `err-disabled` peu après sa mise en service

Cause la plus probable : **BPDU Guard** (chapitre 20) a détecté un message STP reçu sur un port configuré PortFast — signe qu'un switch (autorisé ou non) a été branché sur ce port normalement réservé à un poste utilisateur final. Identifier ce qui a été branché avant de réactiver le port (`shutdown` puis `no shutdown` sur l'interface) — jamais réactiver aveuglément sans comprendre la cause, un scénario développé au chapitre 43 ("STP bloque un port").

### Si un lien redondant reste bloqué alors que le lien principal est en panne

Un temps de convergence de quelques secondes est normal avec RSTP (bien plus rapide que le STP classique originel, qui pouvait prendre 30-50 secondes) — si le blocage persiste bien au-delà, vérifier la cohérence de la configuration STP entre les deux switches concernés (mode RSTP activé des deux côtés, chapitre 22.1) et l'absence d'une priorité mal configurée créant une élection de root ambiguë.

## SAUVEGARDE

```
SW-COEUR# copy running-config startup-config
SW-ACCES-01# copy running-config startup-config
```

## 22.3 Le même résultat, entièrement en MikroTik RouterOS

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — MikroTik RouterOS (SW-COEUR)</div>

```
/interface bridge set bridge-lan priority=0x1000
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ RouterOS applique une seule instance STP par bridge, pas une par VLAN comme Cisco Rapid-PVST</span>
C'est une différence structurelle réelle entre constructeurs (rappel du principe posé au chapitre 55 : jamais supposer qu'une syntaxe ou un comportement Cisco s'applique tel quel ailleurs) — RouterOS calcule un arbre Spanning Tree unique pour l'ensemble du bridge, quel que soit le nombre de VLAN qu'il transporte, sauf à configurer explicitement du **MSTP** (Multiple Spanning Tree Protocol, qui permet de regrouper les VLAN en plusieurs instances) — un raffinement rarement nécessaire sur les projets de taille traitée dans ce manuel, où une seule instance RSTP par bridge suffit très largement.
</div>

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu (vérification)</span>

```
[admin@SW-COEUR] > /interface bridge print detail
  name=bridge-lan ... priority=0x1000 ... root-bridge=yes
```
</div>

## Résumé du chapitre

Spanning Tree protège contre les boucles, y compris accidentelles, sur pratiquement tout réseau professionnel. Le root bridge est explicitement désigné par une priorité basse sur le switch cœur (jamais laissé au hasard), les switches d'accès conservent leur priorité par défaut, Root Guard empêche un équipement non autorisé de contester ce rôle, et PortFast/BPDU Guard (chapitre 20) accélèrent la mise en service des ports utilisateurs tout en détectant un branchement anormal.

*Chapitre suivant : Port Security, DHCP Snooping et durcissement — sécuriser les ports d'accès contre les usages non autorisés.*
