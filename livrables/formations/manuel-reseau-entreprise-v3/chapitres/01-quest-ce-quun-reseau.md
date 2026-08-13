<div class="chapitre-titre-num">CHAPITRE 1</div>

# Qu'est-ce qu'un réseau ?

## Objectifs pédagogiques

À la fin de ce chapitre, tu sauras expliquer avec tes propres mots ce qu'est un ordinateur, un serveur, un réseau, Internet, un LAN et un WAN — et surtout, tu sauras repérer ces éléments autour de toi (chez toi, dans un cybercafé, dans une petite entreprise) sans confondre les mots entre eux.

## Prérequis

Aucun. Ce chapitre s'adresse à quelqu'un qui n'a jamais touché à la configuration d'un réseau.

## 1.1 Pourquoi commencer par le vocabulaire et pas par les commandes

Un débutant pressé veut tout de suite taper des commandes sur un switch. C'est une erreur qui coûte cher plus tard : sans les mots justes, chaque explication technique devient une bouillie confuse, et chaque documentation professionnelle (schéma réseau, cahier des charges, ticket de support) reste illisible. Ce manuel prend le temps, dans cette première partie, de construire un vocabulaire solide — parce qu'un technicien qui sait nommer précisément ce qu'il voit diagnostique deux fois plus vite qu'un technicien qui "bidouille".

<div class="encadre astuce">
<span class="encadre-titre">💡 La règle du manuel : jamais un mot sans définition</span>
Chaque terme technique utilisé pour la première fois dans ce livre est expliqué au moment où il apparaît. Si un mot te semble familier mais que tu n'es pas sûr à 100 % de sa définition exacte, relis quand même ce chapitre — la précision du vocabulaire est ce qui distingue un professionnel d'un amateur.
</div>

## 1.2 L'ordinateur : la brique de base

Un **ordinateur** est une machine qui reçoit des informations (par le clavier, la souris, un capteur...), les traite selon des instructions (un programme), et produit un résultat (afficher une image, envoyer un message, imprimer un document).

**Analogie** : imagine un employé de bureau très rapide et très obéissant. Tu lui donnes une tâche précise ("additionne ces deux nombres", "affiche cette photo"), il l'exécute instantanément et te rend le résultat. Il ne réfléchit jamais par lui-même : il suit uniquement les instructions qu'on lui a données (le programme).

Un ordinateur, dans le contexte de ce manuel, peut prendre plusieurs formes physiques :

- un **poste de travail** (PC de bureau ou portable) utilisé par un employé ;
- un **smartphone** ou une **tablette** ;
- un **serveur** (voir section suivante) ;
- un équipement embarqué comme un switch, un routeur ou une caméra IP — ce sont, au fond, aussi de petits ordinateurs spécialisés, avec leur propre processeur et leur propre système d'exploitation, mais dédiés à une seule tâche.

## 1.3 Le serveur : un ordinateur qui rend service à d'autres

Un **serveur** est un ordinateur dont le rôle n'est pas d'être utilisé directement par une personne assise devant lui, mais de **fournir un service** à d'autres ordinateurs qui le sollicitent à distance.

**Analogie** : si un poste de travail est un employé de bureau, un serveur est un guichet de service ouvert en permanence. Le poste de travail (le "client") envoie une demande au guichet ("donne-moi ce fichier", "authentifie cet utilisateur", "enregistre cette vidéo de caméra"), et le serveur répond.

Exemples de serveurs qui reviendront tout au long de ce manuel :

| Type de serveur | Service rendu |
|---|---|
| Serveur de fichiers | Stocke et partage des documents entre plusieurs employés |
| Contrôleur de domaine (Active Directory) | Authentifie les utilisateurs et applique des règles de sécurité |
| Serveur DHCP | Distribue automatiquement une adresse IP à chaque appareil qui se connecte |
| Serveur DNS | Traduit un nom (`intranet.entreprise.local`) en adresse IP |
| Serveur web | Sert des pages web (intranet, site public) |
| NVR (Network Video Recorder) | Enregistre les flux vidéo des caméras IP |

<div class="encadre attention">
<span class="encadre-titre">⚠️ "Serveur" décrit un rôle, pas une taille de machine</span>
Un débutant imagine souvent un serveur comme une grosse armoire cliquetante dans une pièce climatisée. En réalité, "serveur" désigne un **rôle logiciel** : un simple ordinateur portable peut techniquement jouer le rôle de serveur de fichiers pour un petit bureau. Ce que ce manuel appelle "serveur" à partir du Volume 11 est du matériel dédié, plus robuste et prévu pour tourner 24 h/24, mais le principe reste le même.
</div>

## 1.4 Le réseau : relier les ordinateurs entre eux

Un **réseau informatique** est un ensemble d'ordinateurs (au sens large : postes, serveurs, imprimantes, caméras, téléphones IP...) reliés entre eux, par des câbles ou par ondes radio (Wi-Fi), de façon à pouvoir échanger des informations.

**Analogie** : un réseau routier relie des maisons, des commerces et des usines par des routes, permettant aux personnes et aux marchandises de circuler. Un réseau informatique relie des ordinateurs par des câbles (ou des ondes), permettant aux **données** de circuler entre eux.

Sans réseau, chaque ordinateur est une île isolée : impossible d'envoyer un email, d'imprimer sur une imprimante partagée, de consulter une caméra à distance ou d'accéder à un fichier stocké ailleurs. C'est précisément ce que ce manuel apprend à construire : le "système routier" qui permet à toutes les données de l'entreprise de circuler correctement, rapidement et en sécurité.

## 1.5 Internet : le réseau des réseaux

**Internet** n'est pas "un" réseau au sens d'un câblage unique quelque part dans le monde. C'est une interconnexion mondiale de millions de réseaux plus petits (ceux des entreprises, des fournisseurs d'accès, des universités, des gouvernements...), tous configurés pour se comprendre grâce à des règles communes (des **protocoles**, que nous détaillerons au Volume 2).

**Analogie** : si chaque réseau d'entreprise est un réseau routier local (les rues d'une ville), Internet est le réseau autoroutier et maritime qui relie toutes les villes du monde entre elles. Une voiture qui quitte sa ville emprunte d'abord les rues locales, puis l'autoroute, puis les rues locales de la ville d'arrivée — de la même façon, une donnée quitte le réseau de ton entreprise (le LAN, voir ci-dessous), traverse Internet, puis arrive sur le réseau local du destinataire.

## 1.6 LAN et WAN : deux échelles de réseau

Ces deux sigles reviendront à chaque page de ce manuel — il faut les maîtriser parfaitement.

### LAN — Local Area Network (réseau local)

Un **LAN** est un réseau confiné à un espace géographique restreint : un bâtiment, un étage, un campus. C'est le réseau que **toi**, en tant que technicien ou intégrateur, vas concevoir, câbler et configurer directement. Le réseau interne d'une entreprise (postes, serveurs, imprimantes, caméras, Wi-Fi) est un LAN.

### WAN — Wide Area Network (réseau étendu)

Un **WAN** relie des sites géographiquement éloignés (deux villes, deux pays) au travers d'infrastructures que l'entreprise ne possède généralement pas elle-même (les lignes d'un opérateur télécom). Internet est le plus grand WAN qui existe, mais le mot "WAN" désigne aussi, dans le vocabulaire professionnel, une liaison privée entre deux sites d'une même entreprise (par exemple une liaison VPN site-à-site entre un siège et une agence — sujet du Volume 16, Projet 5).

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment ne jamais confondre LAN et WAN</span>
Pose-toi la question : "est-ce que je peux, en théorie, poser la main sur tout le câblage de ce réseau sans quitter mon site ?" Si oui → LAN. Si le réseau traverse une infrastructure appartenant à un opérateur, entre deux endroits différents → WAN. Sur le routeur ou le firewall d'une entreprise, tu verras d'ailleurs souvent littéralement deux interfaces nommées "LAN" et "WAN" — le port WAN est celui qui part vers l'extérieur (Internet ou vers le siège), le port LAN est celui qui dessert le réseau interne.
</div>

## 1.7 Vue d'ensemble : où se situe ce manuel

```{.uml}
                          INTERNET (le plus grand WAN)
                                  │
                                  │  liaison de l'opérateur (fibre, ADSL, 4G/5G)
                                  │
                          ┌───────┴────────┐
                          │  Routeur/Box    │  ← frontière entre WAN et LAN
                          │  (port WAN)     │
                          └───────┬────────┘
                                  │ port LAN
        ┌─────────────────────────┴─────────────────────────┐
        │                    RÉSEAU LOCAL (LAN)                │
        │   Postes · Serveurs · Imprimantes · Wi-Fi · Caméras  │
        │         ← C'est CE réseau que tu vas apprendre        │
        │            à concevoir, câbler et sécuriser            │
        └───────────────────────────────────────────────────┘
```

Ce manuel t'apprend à construire, de A à Z, tout ce qui se trouve dans le grand rectangle : le LAN d'une entreprise, sa connexion contrôlée vers le WAN/Internet, et son intégration avec la vidéosurveillance IP.

## 1.8 Erreurs fréquentes de débutant

<div class="encadre attention">
<span class="encadre-titre">⚠️ "Internet" et "Wi-Fi" ne sont pas synonymes</span>
Un débutant dit souvent "il n'y a pas d'Internet" quand en réalité le Wi-Fi fonctionne très bien mais que c'est la connexion **entre le routeur de l'entreprise et le fournisseur d'accès** qui est coupée. Le Wi-Fi est une **technologie de câblage sans fil** utilisée pour rejoindre le LAN ; Internet est le réseau externe auquel le LAN est ensuite éventuellement connecté. On peut avoir un Wi-Fi qui fonctionne parfaitement (accès aux imprimantes, aux serveurs locaux, aux caméras) sans aucun accès Internet.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un "réseau" n'est pas forcément relié à Internet</span>
On peut construire un LAN complet, avec plusieurs postes, un serveur de fichiers et des caméras, qui ne sort jamais vers Internet (cas fréquent d'un réseau de vidéosurveillance isolé pour des raisons de sécurité — nous y reviendrons au Volume 12). "Réseau" et "Internet" sont deux concepts distincts.
</div>

## 1.9 Laboratoire — observer ton propre réseau

Ce premier laboratoire ne demande aucun logiciel : juste ton bon sens et l'endroit où tu te trouves actuellement (chez toi, dans un cybercafé, dans une salle de classe).

1. Identifie chaque appareil connecté à ton réseau actuel : combien de postes/téléphones/tablettes, y a-t-il une imprimante réseau, une box/un routeur visible ?
2. Trouve la box ou le routeur : en général une petite boîte avec des câbles qui en sortent et des voyants lumineux. Repère le câble qui part **vers l'extérieur** (vers la prise murale téléphonique/fibre de l'opérateur) — c'est le côté WAN. Repère les câbles qui partent **vers l'intérieur** (vers un PC, un switch) — c'est le côté LAN.
3. Réponds par écrit, en une phrase chacune : "Mon LAN est composé de... [liste]", "Mon WAN, dans mon cas, est la liaison qui part vers... [ton fournisseur d'accès]".

## Résumé du chapitre

Un ordinateur exécute des instructions ; un serveur est un ordinateur dont le rôle est de rendre service à d'autres ordinateurs à distance ; un réseau relie plusieurs ordinateurs pour leur permettre d'échanger des données ; Internet est l'interconnexion mondiale de millions de réseaux ; un LAN est le réseau local que tu vas construire, un WAN relie des sites distants au travers d'une infrastructure d'opérateur.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>
Une petite entreprise a 10 postes de travail, un serveur de fichiers, une imprimante réseau, et une box Internet fournie par l'opérateur. Le tout est câblé et fonctionne, y compris sans Internet. Un incident survient : "on ne reçoit plus les emails". Est-ce forcément une panne du LAN ? Justifie.
</div>

**Corrigé :** Non, pas forcément. Les emails transitent généralement par Internet (un serveur de messagerie externe ou dans le cloud) : la panne est probablement sur la liaison WAN (chez l'opérateur ou sur la box), pas sur le LAN interne, qui peut continuer à fonctionner normalement pour les fichiers et l'imprimante partagée pendant ce temps.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>
Une entreprise a un siège à Port-au-Prince et une agence à Cap-Haïtien, reliés en permanence par une liaison Internet sécurisée pour partager le même serveur de fichiers. Cette liaison entre les deux villes est-elle un LAN ou un WAN ?
</div>

**Corrigé :** Un WAN — elle relie deux sites géographiquement distants au travers d'une infrastructure d'opérateur, même si, une fois arrivé sur chacun des deux sites, le réseau local de chaque site reste un LAN.

*Chapitre suivant : le vocabulaire de base du réseau — IP, MAC, switch, routeur, firewall, DNS, DHCP, VLAN, Wi-Fi, câble, fibre et PoE.*
