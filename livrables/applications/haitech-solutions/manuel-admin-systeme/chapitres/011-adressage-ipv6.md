<div class="chapitre-titre-num">PARTIE II · CHAPITRE 9</div>

# IPv6 : structure et coexistence avec IPv4

## Rôle d'IPv6

IPv6 répond à l'épuisement des adresses IPv4 (32 bits, ~4,3 milliards d'adresses, insuffisant face à la croissance des objets connectés) en offrant un espace d'adressage sur 128 bits, pratiquement inépuisable. Pour l'administrateur système, IPv6 n'est plus un sujet théorique : les systèmes d'exploitation modernes l'activent par défaut, de nombreux fournisseurs d'accès et fournisseurs cloud le déploient nativement, et l'ignorer complètement expose à des angles morts de configuration et de sécurité (un service accessible en IPv6 alors que seul le pare-feu IPv4 a été durci, par exemple).

## Fonctionnement : structure d'une adresse IPv6

Une adresse IPv6 s'écrit en huit groupes de quatre chiffres hexadécimaux séparés par `:`, par exemple `2001:0db8:0000:0042:0000:8a2e:0370:7334`. Deux règles de simplification s'appliquent :

- Les zéros non significatifs de chaque groupe peuvent être omis (`0db8` devient `db8`)
- Une unique séquence de groupes entièrement à zéro peut être remplacée par `::` (une seule fois par adresse)

L'exemple ci-dessus se simplifie ainsi en `2001:db8:0:42:0:8a2e:370:7334`.

| Type d'adresse | Préfixe | Portée | Équivalent IPv4 |
|---|---|---|---|
| Unicast global | 2000::/3 | Routable sur Internet | Adresse publique |
| Unique local (ULA) | fc00::/7 | Routable en interne uniquement | Plages privées RFC 1918 |
| Lien-local | fe80::/10 | Un seul segment réseau, non routée | 169.254.0.0/16 (APIPA) |
| Multicast | ff00::/8 | Diffusion à un groupe d'interfaces | 224.0.0.0/4 |
| Loopback | ::1/128 | La machine elle-même | 127.0.0.1 |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
IPv6 n'a pas d'adresse de broadcast : la fonction est remplacée par le multicast, plus efficace (seuls les hôtes réellement intéressés traitent le paquet). ARP disparaît également, remplacé par NDP (Neighbor Discovery Protocol), qui fonctionne au-dessus d'ICMPv6.
</div>

## Prérequis

- Comprendre que le préfixe IPv6 standard alloué à un site est généralement un `/48` ou `/56`, et que chaque sous-réseau utilise ensuite un `/64` — la subdivision fine façon IPv4 (VLSM sur mesure) n'a pas la même utilité, l'espace étant surabondant
- Connaître les mécanismes d'auto-configuration (SLAAC — Stateless Address Autoconfiguration) qui permettent à un hôte de se configurer sans serveur DHCP
- Identifier les services de l'infrastructure existante qui écoutent déjà en IPv6 par défaut (souvent activé nativement sur Windows Server et les distributions Linux modernes)

## Mise en œuvre d'une stratégie de coexistence

1. **Auditer l'existant** — Vérifier si IPv6 est déjà actif sur les serveurs et postes, même sans configuration explicite (`ip -6 addr` sur Linux, `ipconfig` sur Windows).
2. **Décider consciemment : activer, ou désactiver et documenter** — Ne jamais laisser IPv6 « actif par défaut, non géré » : soit on le déploie proprement, soit on le désactive explicitement avec une justification documentée.
3. **Choisir un mode de coexistence (dual-stack recommandé)** — Faire fonctionner IPv4 et IPv6 en parallèle sur les mêmes interfaces, le mode le plus simple et le plus robuste pour une infrastructure d'entreprise.
4. **Étendre le pare-feu à IPv6** — Un pare-feu configuré uniquement pour IPv4 laisse un service exposé sans filtrage s'il répond aussi en IPv6 (Partie III et XI).
5. **Étendre la supervision et les journaux** — S'assurer que les outils de supervision (Partie X) capturent aussi le trafic et les connexions IPv6.

## Configuration : exemples de commandes

```
# Linux — afficher les adresses IPv6
ip -6 addr show

# Linux — table de routage IPv6
ip -6 route show

# Linux — désactiver IPv6 sur une interface (si stratégie de désactivation choisie)
sysctl -w net.ipv6.conf.eth0.disable_ipv6=1

# Windows PowerShell — afficher la configuration IPv6
Get-NetIPAddress -AddressFamily IPv6

# Windows — désactiver IPv6 sur un adaptateur (si stratégie de désactivation choisie)
Disable-NetAdapterBinding -Name "Ethernet" -ComponentID ms_tcpip6
```

## Administration courante

- Vérifier que la politique de pare-feu (Partie III) couvre IPv4 **et** IPv6 de façon symétrique, sur chaque serveur exposé
- Documenter le choix (dual-stack actif, ou IPv6 désactivé) dans la cartographie d'architecture (Partie I, Chapitre 3)
- Surveiller l'évolution du support IPv6 chez les fournisseurs cloud utilisés (Partie XII), de plus en plus souvent natif ou requis

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Prendre une décision explicite sur IPv6 (activer proprement en dual-stack, ou désactiver et documenter pourquoi), jamais le laisser dans un état non géré
- Si dual-stack est choisi, dupliquer systématiquement toute règle de pare-feu IPv4 vers son équivalent IPv6
- Utiliser des adresses ULA (fc00::/7) pour les communications strictement internes, à l'image des plages privées RFC 1918 en IPv4
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Durcir un pare-feu ou un service uniquement en IPv4 en pensant que « le réseau est en IPv4 », alors qu'IPv6 est actif par défaut sur les systèmes modernes
- Confondre lien-local (`fe80::`) et adresse routable : une adresse lien-local ne fonctionne que sur le segment local, jamais à travers un routeur
- Sous-estimer la surface d'attaque supplémentaire qu'introduit un dual-stack mal maîtrisé
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Connectivité IPv4 correcte mais IPv6 inaccessible depuis l'extérieur | Pare-feu bloquant en IPv6 alors qu'il autorise en IPv4 | Comparer explicitement les deux jeux de règles |
| Un serveur répond différemment selon le client (IPv4 vs IPv6) | Service en écoute uniquement sur une des deux piles | Vérifier la configuration d'écoute du service (`0.0.0.0` vs `::`) |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
IPv6 actif « par défaut mais non géré » est un des angles morts de sécurité les plus fréquents en entreprise : un attaquant scannant en IPv6 peut trouver des services non protégés par un pare-feu qui n'a été durci qu'en IPv4. Tout audit de durcissement (Partie XI) doit systématiquement couvrir les deux piles, ou documenter explicitement la désactivation complète d'IPv6 si c'est le choix retenu.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Aucun projet du portefeuille actuel de Haitech Solutions (OTELA, ANTENN) n'expose de service directement sur IPv6 — tous sont hébergés derrière des plateformes (Railway, Vercel) ou des infrastructures qui gèrent cette couche en amont. Cela ne dispense pas d'un audit explicite lors du choix d'un futur hébergement on-premise ou VPS (comme envisagé pour le VPS mail de POSTA, toujours non provisionné) : vérifier dès l'installation si IPv6 est actif par défaut sur l'image système choisie, et appliquer la même politique de pare-feu qu'en IPv4 dès le premier jour plutôt que de le découvrir a posteriori lors d'un audit de sécurité.
</div>

## Résumé du chapitre

- IPv6 offre un espace d'adressage sur 128 bits, avec des mécanismes propres (SLAAC, NDP, multicast à la place du broadcast).
- Le mode dual-stack (IPv4 + IPv6 en parallèle) est la stratégie de coexistence la plus robuste.
- Toute règle de pare-feu IPv4 doit avoir son équivalent IPv6 explicitement vérifié.
- IPv6 actif par défaut mais non géré est un angle mort de sécurité fréquent à auditer systématiquement.

*Chapitre suivant : topologies réseau et câblage structuré.*
