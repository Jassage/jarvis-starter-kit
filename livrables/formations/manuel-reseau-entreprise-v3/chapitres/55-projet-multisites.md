<div class="chapitre-titre-num">CHAPITRE 55</div>

# Projet 5 — Entreprise multi-sites

## Objectifs pédagogiques

Le projet pour lequel le tunnel VPN du chapitre 29 avait été préparé sans jamais être pleinement exploité : un siège et trois agences, reliés en étoile VPN (hub-and-spoke), avec une politique de sécurité centralisée au siège et un routage inter-agences réellement configuré.

## Prérequis

Volumes 1-15, chapitres 51-54.

<div class="encadre astuce">
<span class="encadre-titre">💡 Convention d'adressage multi-sites</span>
Ce projet réserve la série `10.100.x.x` à `10.103.x.x`, un incrément par site — Siège `10.100.x.x`, Agence 1 `10.101.x.x`, Agence 2 `10.102.x.x`, Agence 3 `10.103.x.x` — distincte des identifiants à deux chiffres des Projets 1-4, pour bien marquer qu'il s'agit ici de **quatre réseaux physiquement séparés**, reliés uniquement par VPN.
</div>

## 01. Cahier des charges

Un **Siège** (150 employés, architecture du Projet 2) et **trois agences** (Agence 1 : 30 employés, Agence 2 : 25 employés, Agence 3 : 20 employés), chacune avec son propre accès Internet local mais devant accéder aux ressources centralisées du siège comme si elles se trouvaient sur place, et pouvoir échanger entre elles sans passer par un tunnel dédié à chaque paire.

## 02. Questions posées au client

Aucune agence ne dispose d'un technicien réseau sur place — toute la configuration doit rester administrable à distance depuis le siège une fois les firewalls d'agence installés. Les trois agences doivent pouvoir consulter le serveur de fichiers du siège, mais aucune donnée sensible du siège (comptabilité, RH) n'est nécessaire en agence.

## 03-09. Étude, architecture, plan IP, VLAN, matériel, câblage, configuration

Chaque site applique intégralement la méthode des chapitres 9 à 27 à l'échelle qui lui est propre : le siège suit l'architecture du Projet 2 (chapitre 52, adressage adapté à `10.100.x.x`), l'Agence 1 (30 employés) et l'Agence 2/3 (plus petites) suivent l'architecture allégée du Projet 1 (chapitre 51, adressage `10.101.x.x`, `10.102.x.x`, `10.103.x.x`).

## 10. VPN — topologie en étoile (hub-and-spoke)

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01, Siège) — tunnel vers l'Agence 1</div>

```
config vpn ipsec phase1-interface
    edit "VERS-AGENCE-01"
        set interface "wan1"
        set peertype any
        set proposal aes256-sha256
        set remote-gw 203.0.113.101
        set psksecret CleAgence1Solide2026!
    next
end
config vpn ipsec phase2-interface
    edit "VERS-AGENCE-01-P2"
        set phase1name "VERS-AGENCE-01"
        set proposal aes256-sha256
        set src-subnet 10.100.0.0 255.255.0.0
        set dst-subnet 10.101.0.0 255.255.0.0
    next
end
config firewall address
    edit "RESEAU-Agence1"
        set subnet 10.101.0.0 255.255.0.0
    next
end
config firewall policy
    edit 30
        set name "Siege-vers-Agence1"
        set srcintf "internal1"
        set dstintf "VERS-AGENCE-01"
        set srcaddr "all"
        set dstaddr "RESEAU-Agence1"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 31
        set name "Agence1-vers-Siege"
        set srcintf "VERS-AGENCE-01"
        set dstintf "internal1"
        set srcaddr "RESEAU-Agence1"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
```

**Tableau de reproduction pour les Agences 2 et 3** (même méthode exacte, seuls les paramètres changent) :

| Agence | Nom du tunnel | `remote-gw` | `dst-subnet` |
|---|---|---|---|
| 1 | VERS-AGENCE-01 | 203.0.113.101 | 10.101.0.0/16 |
| 2 | VERS-AGENCE-02 | 203.0.113.102 | 10.102.0.0/16 |
| 3 | VERS-AGENCE-03 | 203.0.113.103 | 10.103.0.0/16 |

**Configuration miroir côté agence** (identique pour les trois, méthode chapitre 28) :

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-AGENCE-01)</div>

```
config vpn ipsec phase1-interface
    edit "VERS-SIEGE"
        set interface "wan1"
        set peertype any
        set proposal aes256-sha256
        set remote-gw 203.0.113.10
        set psksecret CleAgence1Solide2026!
    next
end
config vpn ipsec phase2-interface
    edit "VERS-SIEGE-P2"
        set phase1name "VERS-SIEGE"
        set proposal aes256-sha256
        set src-subnet 10.101.0.0 255.255.0.0
        set dst-subnet 10.100.0.0 255.255.0.0
    next
end
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ La clé pré-partagée doit être strictement identique des deux côtés (rappel du chapitre 29)</span>
`CleAgence1Solide2026!` doit apparaître à l'identique dans la configuration du siège et de l'Agence 1 — une clé différente, même d'un seul caractère, empêche la phase 1 de jamais aboutir, sans message d'erreur explicite (chapitre 44.24, dépannage VPN).
</div>

## Routage inter-agences via le hub

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01, Siège)</div>

```
config firewall policy
    edit 32
        set name "Agence1-vers-Agence2-via-Hub"
        set srcintf "VERS-AGENCE-01"
        set dstintf "VERS-AGENCE-02"
        set srcaddr "RESEAU-Agence1"
        set dstaddr "RESEAU-Agence2"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 33
        set name "Agence1-vers-Agence3-via-Hub"
        set srcintf "VERS-AGENCE-01"
        set dstintf "VERS-AGENCE-03"
        set srcaddr "RESEAU-Agence1"
        set dstaddr "RESEAU-Agence3"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 34
        set name "Agence2-vers-Agence3-via-Hub"
        set srcintf "VERS-AGENCE-02"
        set dstintf "VERS-AGENCE-03"
        set srcaddr "RESEAU-Agence2"
        set dstaddr "RESEAU-Agence3"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
```

**Explication** : sans ces trois règles explicites (une par paire d'agences), le siège n'achemine jamais le trafic entre deux tunnels VPN distincts — un firewall ne relaie jamais implicitement le trafic entre deux interfaces, même virtuelles, sans une politique dédiée (principe déjà appliqué à chaque interface physique depuis le chapitre 28). Ces trois règles permettent à un employé de n'importe quelle agence de joindre une ressource d'une autre agence en transitant par le siège, sans tunnel VPN direct entre agences elles-mêmes.

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
FW-01 # diagnose vpn ike gateway list
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Trois tunnels (`VERS-AGENCE-01/02/03`) affichant `status: up` — un tunnel `down` bloque non seulement l'accès de cette agence au siège, mais aussi son accès aux deux autres agences (le hub ne peut relayer que ce qu'il reçoit réellement).
</div>

## 11-13. Wi-Fi, calculs, CCTV

Chaque site dispose de son propre contrôleur Wi-Fi local (chapitre 15.6). Chaque site conserve son propre NVR local (chapitre 36) — les séquences vidéo ne transitent **jamais** en continu par le VPN (un flux vidéo dépasse largement la bande passante qu'une liaison VPN inter-site raisonnable peut absorber, chapitre 34.2) ; seule la **consultation** à distance de l'interface du NVR de chaque agence, via le tunnel déjà en place, est centralisée.

## 14. Tests

Matrice du chapitre 48.3, avec pour ce projet : établissement des trois tunnels (`diagnose vpn ike gateway list`), accès de chaque agence aux ressources du siège, accès inter-agences via le hub (les trois règles ci-dessus), et confirmation que l'accès Internet local de chaque agence reste indépendant (une panne du siège ne doit jamais couper l'accès Internet propre d'une agence, seul l'accès aux ressources centralisées serait affecté).

## 15-17. Documentation, devis, maintenance

Documentation (chapitre 49) avec un schéma consolidé des quatre sites en plus des schémas individuels. Devis (chapitre 50) chiffrant séparément chaque site (main-d'œuvre et matériel propres à chaque agence) et le poste VPN comme ligne dédiée du siège. Maintenance (chapitre 49.2) : le test de restauration trimestriel (chapitre 39.6) et l'audit de sécurité (chapitre 40) s'appliquent indépendamment à chacun des quatre sites, jamais mutualisés en un seul contrôle qui masquerait un problème propre à une seule agence.

## Résumé du chapitre

Un réseau multi-sites relie ses agences au siège en étoile VPN plutôt qu'en maillage complet, centralisant la politique de sécurité sur un seul firewall. Le trafic inter-agences, explicitement autorisé par une règle dédiée par paire sur le hub, transite par le siège plutôt que par un tunnel direct entre agences — un choix qui limite le nombre de tunnels à configurer (3 au lieu de 6) au prix d'une dépendance du trafic inter-agences à la disponibilité du siège, un compromis documenté et assumé.

*Chapitre suivant : le Projet final ultime — 500 employés, 3 bâtiments, combinant l'intégralité de ce manuel dans un seul projet récapitulatif.*
