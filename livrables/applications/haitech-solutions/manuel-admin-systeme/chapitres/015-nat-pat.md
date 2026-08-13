<div class="chapitre-titre-num">PARTIE II · CHAPITRE 13</div>

# NAT et PAT : translation d'adresses

## Rôle du NAT

Le NAT (Network Address Translation) traduit des adresses IP privées (RFC 1918, Chapitre 8) en une ou plusieurs adresses IP publiques, permettant à un réseau interne entier de partager un accès Internet via une poignée d'adresses publiques, voire une seule. Au-delà de l'économie d'adresses IPv4 publiques (sa motivation historique), le NAT constitue de fait une barrière de sécurité de base : un hôte interne en adressage privé n'est jamais directement joignable depuis Internet sans une règle de translation explicite.

## Fonctionnement : les types de NAT

| Type | Principe | Usage typique |
|---|---|---|
| NAT statique (1:1) | Une adresse privée toujours traduite vers la même adresse publique | Serveur devant garder une adresse publique fixe et prévisible |
| NAT dynamique | Un pool d'adresses publiques attribuées dynamiquement aux hôtes internes | De moins en moins utilisé, remplacé par le PAT |
| PAT (NAT Overload) | Plusieurs adresses privées partagent une seule adresse publique, distinguées par le port source | Standard en sortie Internet pour la quasi-totalité des réseaux d'entreprise |
| Port forwarding (DNAT) | Un port spécifique de l'adresse publique est redirigé vers une adresse et un port internes | Exposer un service interne précis (serveur web, VPN) sans NAT statique complet |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
Le PAT (Port Address Translation), souvent appelé simplement « NAT » dans le langage courant, réécrit à la fois l'adresse IP source et le port source de chaque connexion sortante, en conservant une table de correspondance temporaire. C'est ce mécanisme qui permet à des centaines de postes internes de partager une unique adresse IP publique simultanément.
</div>

## Prérequis

- Un plan d'adressage privé déjà défini (Chapitre 8)
- Une ou plusieurs adresses IP publiques allouées par le fournisseur d'accès
- Une décision claire sur les services devant être exposés depuis Internet (et donc nécessitant du port forwarding)

## Mise en place du NAT/PAT

1. **Configurer le PAT en sortie** — Toutes les adresses privées internes traduites vers l'adresse IP publique WAN à la sortie du routeur/pare-feu.
2. **Identifier les services à exposer** — Lister précisément quel service interne doit être joignable depuis Internet, et sur quel port.
3. **Configurer le port forwarding (DNAT) service par service** — Jamais une exposition large et non ciblée.
4. **Restreindre par IP source si possible** — Limiter le port forwarding à des IP sources connues quand le service ne nécessite pas un accès public universel.
5. **Documenter chaque règle** avec sa justification métier, dans le registre des changements (Partie X).

## Configuration : exemples de commandes

```
# MikroTik RouterOS — PAT (masquerade) pour la sortie Internet
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade

# MikroTik RouterOS — port forwarding (accès distant à un serveur interne)
/ip firewall nat add chain=dstnat protocol=tcp dst-port=8080 \
  action=dst-nat to-addresses=192.168.20.10 to-ports=80

# Linux iptables — PAT via masquerade
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Linux iptables — port forwarding
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 \
  -j DNAT --to-destination 192.168.20.10:80

# Cisco IOS — PAT (NAT overload)
ip nat inside source list 1 interface GigabitEthernet0/0 overload
access-list 1 permit 192.168.0.0 0.0.255.255
```

## Administration courante

- Auditer périodiquement la liste des règles de port forwarding actives contre la liste des services réellement nécessaires (Partie I, Chapitre 5 — inventaire)
- Surveiller la table de translation NAT sur les pare-feu à fort trafic, une saturation de cette table peut provoquer des coupures de connexion
- Retirer systématiquement toute règle de port forwarding devenue inutile lors du décommissionnement d'un service

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Restreindre chaque règle de port forwarding au strict service nécessaire, jamais une plage large « au cas où »
- Documenter la justification métier de chaque règle de NAT, en particulier le port forwarding, qui expose directement un service interne
- Préférer un VPN (Partie III) à un port forwarding direct pour l'administration à distance de serveurs sensibles
- Utiliser le NAT statique (1:1) uniquement pour les cas qui l'exigent réellement (adresse publique fixe requise), pas par défaut
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Exposer un service d'administration (RDP, SSH, interface de gestion) directement via port forwarding sans VPN ni restriction d'IP source
- Accumuler des règles de port forwarding non documentées au fil du temps, sans jamais les auditer ni les nettoyer
- Confondre NAT et sécurité : le NAT masque l'adressage interne mais ne remplace en aucun cas un pare-feu avec inspection de trafic (Partie III)
- Oublier qu'un serveur derrière NAT ne peut pas recevoir de connexion entrante non sollicitée sans règle de translation explicite, cause fréquente de « ça marche en sortie mais pas en entrée »
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Les postes internes accèdent à Internet mais un service externe ne peut pas joindre un serveur interne | Absence de règle de port forwarding (DNAT) | Vérifier les règles NAT dstnat/DNAT sur le pare-feu |
| Un service exposé publiquement reste inaccessible malgré une règle de port forwarding correcte | Pare-feu bloquant le trafic après translation, ou service en écoute sur une autre interface | Vérifier l'ordre des règles pare-feu et l'interface d'écoute du service |
| Des connexions se coupent de façon aléatoire sous forte charge | Table de translation NAT saturée | Vérifier les limites de connexions simultanées du pare-feu, envisager un équipement plus dimensionné |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le NAT n'est pas un mécanisme de sécurité en soi, même s'il en a l'effet secondaire (un hôte interne n'est pas directement adressable depuis Internet sans règle explicite). Toute règle de port forwarding doit être traitée avec la même rigueur qu'une règle de pare-feu ouvrant un accès : justification documentée, restriction d'IP source quand c'est possible, et revue périodique. Un service d'administration exposé par port forwarding sans authentification forte (Partie XI, MFA) reste une des causes les plus fréquentes de compromission initiale d'un réseau d'entreprise.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le manuel de formation réseau documente une règle de port forwarding vers un NVR de vidéosurveillance comme exemple type d'exposition ciblée (port 8080 public redirigé vers le port 80 du NVR interne). Ce même principe de restriction stricte — n'exposer que le strict service nécessaire, jamais un accès large — s'applique directement à toute future exposition de services internes de Haitech Solutions, qu'il s'agisse d'un accès distant à une caméra de site ou d'un accès administratif ponctuel, toujours à privilégier via VPN (Chapitre suivant, Partie III) plutôt que par port forwarding direct.
</div>

## Résumé du chapitre

- Le PAT (NAT overload) permet à un réseau interne entier de partager une seule adresse IP publique.
- Le port forwarding (DNAT) expose un service interne précis, et doit toujours être restreint au strict nécessaire.
- Le NAT masque l'adressage interne mais ne remplace jamais un pare-feu avec inspection de trafic.
- Un service d'administration ne devrait jamais être exposé par port forwarding direct sans VPN ni authentification forte.

*Ceci conclut la Partie II. Partie suivante : services réseau essentiels (DNS, DHCP, pare-feu, proxy, VPN, répartition de charge).*
