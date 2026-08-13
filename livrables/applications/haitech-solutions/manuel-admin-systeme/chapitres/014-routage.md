<div class="chapitre-titre-num">PARTIE II · CHAPITRE 12</div>

# Le routage : statique et dynamique

## Rôle du routage

Le routage détermine par quel chemin un paquet IP doit transiter pour atteindre un réseau qui n'est pas directement connecté à l'équipement émetteur. Chaque routeur (ou switch L3) consulte sa table de routage pour chaque paquet et choisit la route la plus spécifique disponible vers la destination. Sans routage correctement configuré, deux VLAN ou deux sites ne peuvent tout simplement pas communiquer, quelle que soit la qualité du câblage ou de la segmentation.

## Fonctionnement : route statique contre routage dynamique

| Approche | Principe | Avantages | Inconvénients |
|---|---|---|---|
| Routage statique | Routes configurées manuellement, une par une | Simple, prévisible, pas de trafic de protocole | Ne s'adapte pas automatiquement à une panne de lien ; charge de maintenance manuelle qui croît avec le nombre de sites |
| Routage dynamique | Les routeurs échangent automatiquement leurs routes via un protocole | S'adapte automatiquement aux pannes, scalable | Plus complexe à concevoir et sécuriser |

### Protocoles de routage dynamique courants

| Protocole | Type | Portée typique | Métrique |
|---|---|---|---|
| RIP | Vecteur de distance | Obsolète, petits réseaux historiques | Nombre de sauts (max 15) |
| OSPF | État de liens | Réseau d'entreprise interne (IGP) | Coût basé sur la bande passante |
| EIGRP | Hybride (Cisco propriétaire) | Réseau d'entreprise interne | Bande passante, délai, fiabilité |
| BGP | Vecteur de chemin | Internet, interconnexion entre organisations (EGP) | Attributs de chemin (longueur AS, préférences) |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
OSPF (Open Shortest Path First) est le protocole de routage dynamique interne (IGP) le plus répandu en entreprise : ouvert (non propriétaire), converge rapidement après une panne, et s'organise en zones (areas) pour limiter la charge de calcul sur les grands réseaux. BGP, à l'inverse, gère le routage **entre** organisations (Internet lui-même) et n'a en pratique sa place dans une PME que pour un usage multi-hébergeur avancé (multihoming).
</div>

## Prérequis

- Une table d'adressage IP déjà définie par sous-réseau (Chapitre 8)
- Pour le routage dynamique : des équipements compatibles et une conception des zones/aires cohérente
- Une compréhension de la métrique et de la distance administrative, qui déterminent quelle route est préférée en cas de choix multiple

## Mise en place du routage inter-VLAN et inter-sites

1. **Router-on-a-stick ou switch L3** — Pour le routage inter-VLAN local, soit une interface unique en trunk vers un routeur (« router-on-a-stick »), soit un switch capable de router nativement (L3), plus performant pour un trafic important.
2. **Définir la route par défaut** — Chaque routeur non-cœur a besoin d'une route par défaut (`0.0.0.0/0`) pointant vers la passerelle suivante, généralement vers Internet.
3. **Configurer les routes statiques nécessaires** — Pour les liaisons simples (deux sites, un seul chemin possible), le statique suffit et reste plus simple à auditer.
4. **Déployer un protocole dynamique si la topologie le justifie** — Plusieurs chemins redondants entre sites, ou plus de trois à quatre routeurs internes à interconnecter.
5. **Documenter chaque route** dans la cartographie d'architecture (Partie I, Chapitre 3).

## Configuration : exemples de commandes

```
# Cisco IOS — route statique
ip route 192.168.40.0 255.255.255.0 10.0.0.2

# Cisco IOS — route par défaut
ip route 0.0.0.0 0.0.0.0 203.0.113.1

# Cisco IOS — activation d'OSPF, zone 0
router ospf 1
 network 192.168.10.0 0.0.0.255 area 0
 network 192.168.20.0 0.0.0.255 area 0

# Linux — route statique
ip route add 192.168.40.0/24 via 10.0.0.2

# Linux — route par défaut
ip route add default via 203.0.113.1

# Windows PowerShell — route statique persistante
New-NetRoute -DestinationPrefix "192.168.40.0/24" -NextHop 10.0.0.2 -InterfaceAlias "Ethernet"
```

## Administration courante

- Vérifier périodiquement la table de routage active (`show ip route`, `ip route show`) contre la documentation attendue
- Surveiller la convergence après un test de coupure planifiée d'un lien redondant (partie intégrante d'un exercice de continuité, Partie XII)
- Auditer les routes statiques résiduelles après tout changement de topologie, source fréquente de routes mortes non nettoyées

## Distance administrative : quelle route gagne en cas de conflit

| Source | Distance administrative (Cisco, par défaut) |
|---|---|
| Réseau directement connecté | 0 |
| Route statique | 1 |
| eBGP | 20 |
| OSPF | 110 |
| RIP | 120 |
| iBGP | 200 |

Plus la distance administrative est faible, plus la route est préférée. Une route statique (distance 1) l'emporte donc toujours sur une route apprise dynamiquement par OSPF (110) vers la même destination, sauf configuration explicite contraire — un point de vigilance lors du dépannage d'un comportement de routage inattendu.

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Documenter chaque route statique avec sa justification (pourquoi cette route existe, quel lien elle sert)
- Ne déployer un protocole dynamique que si la complexité de la topologie le justifie réellement
- Sécuriser l'authentification des échanges de routage dynamique (MD5 sur OSPF a minima) pour éviter l'injection de fausses routes
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Laisser des routes statiques obsolètes après un changement de topologie, provoquant un routage silencieusement incorrect
- Configurer un protocole dynamique sans authentification, exposant le réseau à une injection de routes malveillantes
- Oublier la route par défaut sur un routeur non-cœur, le rendant incapable de joindre Internet ou le reste du réseau
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Un réseau distant est injoignable | Route manquante ou mal configurée | `traceroute` vers la destination, comparer avec la table de routage attendue |
| Le trafic emprunte un chemin sous-optimal | Distance administrative ou métrique mal comprise | Vérifier `show ip route` et la métrique de chaque route candidate |
| Convergence lente après une panne de lien | Protocole de routage dynamique mal réglé (timers par défaut) ou absence de routage dynamique | Vérifier les timers OSPF, envisager un protocole dynamique si redondance critique |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Un protocole de routage dynamique non authentifié permet à un attaquant présent sur le réseau d'injecter de fausses routes et de détourner le trafic (attaque de type « route injection »). Activer systématiquement l'authentification MD5 (au minimum) sur les échanges OSPF, et filtrer strictement les interfaces sur lesquelles le protocole de routage est actif — jamais sur un port exposé à des équipements non maîtrisés (VLAN invités, par exemple).
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
OTELA (multi-établissements) et ANTENN illustrent, côté applicatif plutôt que réseau pur, le même principe de routage explicite que ce chapitre : `resolveEtablissement` route chaque requête vers les données du bon établissement selon le token d'authentification, jamais selon un paramètre client modifiable. Le parallèle est direct avec une route statique bien documentée plutôt qu'une route implicite non maîtrisée : dans les deux cas, la décision de « où envoyer ceci » doit reposer sur une source de vérité fiable et vérifiée, jamais sur une donnée que l'émetteur pourrait falsifier.
</div>

## Résumé du chapitre

- Le routage statique convainc par sa simplicité pour des topologies limitées ; le routage dynamique (OSPF en interne) s'impose dès que la redondance et l'échelle le justifient.
- La distance administrative détermine quelle route l'emporte en cas de conflit entre plusieurs sources.
- Toute route statique doit être documentée et nettoyée après un changement de topologie.
- L'authentification des échanges de routage dynamique est une mesure de sécurité de base, souvent omise.

*Chapitre suivant : NAT et PAT, la translation d'adresses.*
