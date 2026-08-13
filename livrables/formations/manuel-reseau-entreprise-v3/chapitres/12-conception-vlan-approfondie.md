<div class="chapitre-titre-num">CHAPITRE 12</div>

# Conception des VLAN, approfondie

## Objectifs pédagogiques

Comprendre le mécanisme technique exact qui permet à un VLAN d'exister sur un câblage physique partagé (le tagging 802.1Q), la différence entre un port access et un port trunk, le rôle du VLAN natif, et les grands principes du routage inter-VLAN et du filtrage par ACL/firewall — la théorie complète qui précède la configuration réelle (Volume 7).

## Prérequis

Chapitre 11.

## 12.1 Pourquoi séparer en VLAN — récapitulatif et approfondissement

Le chapitre 2.9 a introduit l'analogie des appartements cloisonnés. Trois raisons concrètes justifient ce cloisonnement dans un vrai projet :

1. **Sécurité** : limiter la surface d'attaque — une caméra compromise (Volume 13) ne peut pas directement scanner le réseau des serveurs si elle se trouve sur un VLAN isolé sans route ouverte vers eux.
2. **Performance** : réduire la taille de chaque domaine de broadcast (chapitre 5.1) — un broadcast massif sur le VLAN Wi-Fi Invité (souvent le plus "bruyant", avec des appareils inconnus et mal configurés) n'impacte jamais le VLAN Serveurs.
3. **Qualité de service (QoS)** : isoler un trafic sensible à la latence — la voix sur IP (VLAN 40) peut recevoir une priorité de traitement distincte de la simple navigation web (chapitre 2.9, approfondi au chapitre 10 de la configuration switch), ce qui serait impossible à distinguer proprement sur un réseau non cloisonné.

## 12.2 Le mécanisme technique : le tagging 802.1Q

Un switch physique n'a qu'un seul câblage réel entre lui et un autre switch (ou un routeur) — pourtant, plusieurs VLAN doivent pouvoir emprunter ce même lien physique simultanément. La norme **IEEE 802.1Q** résout ce problème en insérant, dans chaque trame Ethernet qui doit traverser ce lien partagé, une petite étiquette (**tag**) de 4 octets contenant l'identifiant du VLAN d'origine.

```{.uml}
TRAME ETHERNET STANDARD (sans VLAN)
┌──────────┬──────────┬──────┬──────────┬─────┐
│ MAC dest │ MAC src  │ Type │ Donnees  │ FCS │
└──────────┴──────────┴──────┴──────────┴─────┘

TRAME ETHERNET AVEC TAG 802.1Q
┌──────────┬──────────┬─────────────┬──────┬──────────┬─────┐
│ MAC dest │ MAC src  │ Tag 802.1Q  │ Type │ Donnees  │ FCS │
│          │          │ (VLAN ID)   │      │          │     │
└──────────┴──────────┴─────────────┴──────┴──────────┴─────┘
                        4 octets ajoutes, contiennent
                        l'identifiant du VLAN (1-4094)
```

Un switch qui reçoit une trame taguée VLAN 20 sait immédiatement, sans ambiguïté, qu'elle appartient au VLAN Utilisateurs — même si elle emprunte le même câble physique qu'une trame taguée VLAN 80 (CCTV) l'instant d'après.

## 12.3 Port access et port trunk : deux comportements opposés

| | Port **access** | Port **trunk** |
|---|---|---|
| Nombre de VLAN transportés | Un seul | Plusieurs, simultanément |
| Tagging | Aucun — le port ajoute/retire le tag automatiquement, l'appareil branché ne voit jamais de tag | Les trames circulent taguées (sauf le VLAN natif, 12.4) |
| Utilisation typique | Un PC, une imprimante, une caméra, un téléphone IP | Une liaison switch-à-switch, ou switch-vers-routeur/firewall |

Un port access appartient à un seul VLAN configuré (`switchport access vlan 20`, exemple du chapitre 10 de la V2 déjà repris au Volume 7) : tout ce qui entre par ce port est automatiquement considéré comme appartenant à ce VLAN, et tout ce qui en sort perd son tag avant d'atteindre l'appareil branché — un PC ordinaire ne comprend d'ailleurs pas nativement les trames taguées 802.1Q.

Un port trunk transporte plusieurs VLAN simultanément sur le même câble physique, chacun identifié par son tag — c'est la seule façon de faire circuler tout le trafic de tous les VLAN entre deux switches, ou entre un switch et l'équipement qui fait le routage inter-VLAN (12.5), sans multiplier les câbles physiques.

## 12.4 Le VLAN natif : le seul VLAN qui voyage sans tag sur un trunk

Sur un port trunk, un seul VLAN peut circuler **sans** tag — c'est le **VLAN natif**. Historiquement prévu pour assurer une compatibilité avec de très anciens équipements ne comprenant pas le 802.1Q, il représente aujourd'hui, mal configuré, un risque de sécurité réel : une attaque dite de **VLAN hopping** peut exploiter un VLAN natif mal choisi pour faire passer du trafic d'un VLAN à un autre sans passer par le routage prévu.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Règle de sécurité systématique appliquée dans tout ce manuel</span>
Le VLAN natif de chaque trunk est toujours un VLAN dédié, **inutilisé par aucun appareil réel** (typiquement un VLAN 999 "Native-Non-Utilise", comme déjà vu au chapitre 10 de la V2, repris à l'identique au Volume 7) — jamais le VLAN 1 par défaut de l'équipement (une cible triviale à deviner), et jamais un VLAN de production. Cette règle est appliquée sans exception sur les six projets du Volume 16.
</div>

## 12.5 Le routage inter-VLAN : deux approches possibles

Par défaut, deux VLAN ne peuvent **pas** communiquer entre eux, même sur le même switch physique (c'est précisément le but du cloisonnement, 12.1) — un équipement capable de **router** doit explicitement relier les VLAN entre eux pour autoriser un passage voulu. Deux approches professionnelles existent, détaillées en configuration au Volume 8 :

- **Router-on-a-stick** : un routeur classique, relié au switch par un **seul** câble trunk, avec une sous-interface virtuelle par VLAN (`GigabitEthernet0/0.20`, `GigabitEthernet0/0.30`...) — économe en ports physiques, mais tout le trafic inter-VLAN doit transiter par ce lien unique, qui peut devenir un goulot d'étranglement sur un réseau chargé.
- **Switch de niveau 3 (Layer 3 switch) avec interfaces VLAN (SVI)** : le switch cœur lui-même route directement entre les VLAN, sans passer par un lien externe — bien plus performant (le routage se fait à la vitesse du matériel du switch, pas limité par un lien Ethernet unique), c'est l'approche retenue par défaut dans ce manuel pour tout projet au-delà de la plus petite taille (Volume 16, Projets 2 à 6).

## 12.6 ACL : filtrer précisément ce qui a le droit de passer entre VLAN

Le routage inter-VLAN (12.5) permet la communication entre deux VLAN, mais ne dit rien sur les **règles** de ce qui est autorisé. Une **ACL** (Access Control List) est une liste ordonnée de règles, appliquées sur une interface ou une VLAN, qui autorise ou refuse un trafic selon des critères précis (adresse source, adresse destination, port/protocole) — c'est le mécanisme technique qui matérialise concrètement le plan VLAN d'accès du chapitre 3.7.

**Exemple conceptuel**, correspondant à la ligne "CCTV" du plan VLAN d'accès du chapitre 3.7 (« NVR uniquement ») :

```
Regle 1 : Autoriser le trafic du VLAN 80 (CCTV) vers l'adresse du NVR uniquement
Regle 2 : Refuser tout le reste du trafic du VLAN 80 vers n'importe quelle autre destination
```

La configuration exacte de ces règles (syntaxe Cisco IOS et MikroTik) fait l'objet du Volume 8.

## 12.7 Où router : sur le switch cœur, ou à travers le firewall ?

Une décision de conception importante, souvent mal comprise par un débutant : **tout** le routage inter-VLAN ne doit pas nécessairement passer par le firewall (chapitre 2.5).

<div class="encadre astuce">
<span class="encadre-titre">💡 La règle de décision utilisée dans ce manuel</span>
Le routage inter-VLAN **de confiance modérée** (par exemple, Utilisateurs → Serveurs, un flux métier normal et fréquent) est routé directement par le switch cœur en SVI (12.5), avec une simple ACL de contrôle — plus rapide, sans faire transiter un trafic interne légitime par un équipement dont le rôle principal est de filtrer les menaces externes. En revanche, tout flux impliquant une **zone à sécurité renforcée** (CCTV, Sécurité/contrôle d'accès du plan du chapitre 11.2, ou tout trafic destiné à sortir vers Internet) est explicitement routé **à travers le firewall**, où une politique de sécurité complète (zones, règles, journalisation — Volume 9) peut s'appliquer avec la granularité et la traçabilité qu'une simple ACL de switch n'offre pas.
</div>

## Résumé du chapitre

Le 802.1Q permet à plusieurs VLAN de partager un même câble physique en taguant chaque trame de l'identifiant de son VLAN d'origine. Un port access appartient à un seul VLAN et ne montre jamais de tag à l'appareil branché ; un port trunk transporte plusieurs VLAN tagués simultanément, à l'exception du VLAN natif — qui doit toujours être un VLAN dédié inutilisé, jamais le VLAN 1 par défaut. Le routage inter-VLAN se fait par router-on-a-stick ou, préférentiellement dans ce manuel, par un switch de niveau 3 (SVI). Les ACL filtrent précisément ce qui a le droit de circuler entre VLAN ; le trafic vers les zones à sécurité renforcée ou vers Internet est systématiquement routé à travers le firewall plutôt que par une simple ACL de switch.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 12.1</span>
Un technicien configure un trunk entre deux switches et laisse le VLAN natif à sa valeur par défaut (VLAN 1), sans y prêter attention. Quel risque concret cela introduit-il, et comment le corriger ?
</div>

**Corrigé :** Un VLAN natif par défaut (VLAN 1, universellement connu) facilite une attaque de VLAN hopping, permettant potentiellement à un trafic non autorisé de franchir la frontière entre VLAN sans passer par le routage et les ACL prévus. Correction : créer un VLAN dédié inutilisé (ex. VLAN 999) et le désigner explicitement comme VLAN natif du trunk (chapitre 12.4).

*Fin du Volume 4. Chapitre suivant : comment choisir un switch — la première étape du Volume 5, consacré au choix méthodique du matériel.*
