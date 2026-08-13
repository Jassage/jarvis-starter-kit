# Réseaux d'entreprise & Vidéosurveillance IP — Guide de terrain (VERSION 3) — Plan éditorial

> Réécriture complète en guide de terrain pas à pas, à partir du manuel `manuel-reseau-entreprise/` (V2, 36 chapitres, ~43 400 mots, conservé intact et utilisé comme matière première : théorie, schémas, décisions techniques déjà validées). La V2 explique et illustre ; la V3 **exécute** — chaque commande est localisée (où l'exécuter), chaque résultat attendu est montré et interprété, chaque procédure prévoit explicitement le cas où elle échoue, et rien n'est laissé à deviner ("configurez le reste de la même façon" est banni : un tableau de reproduction accompagne toujours l'unique procédure complète donnée en exemple).

## Gabarit obligatoire de toute procédure professionnelle

```
OBJECTIF · PRÉREQUIS · MATÉRIEL NÉCESSAIRE · LOGICIELS NÉCESSAIRES · TOPOLOGIE · PLAN D'ADRESSAGE
ÉTAPE 1 → ÉTAPE N (chacune expliquée, chacune indiquant où l'exécuter)
CONFIGURATION · COMMANDES (jamais tronquées) · RÉSULTAT ATTENDU (capture + interprétation)
VÉRIFICATION · TEST · DÉPANNAGE (si ça fonctionne / si ça ne fonctionne pas / diagnostic / correction / vérification)
SAUVEGARDE · DOCUMENTATION · CHECKLIST DE FIN
```

Marqueurs de localisation systématiques : `[PC Windows] [PowerShell] [CMD] [Linux] [macOS] [Switch Cisco] [Switch MikroTik] [Routeur MikroTik] [Firewall FortiGate] [Contrôleur UniFi] [Serveur Windows] [Serveur Ubuntu] [NVR/VMS]`, rendus en encadré (même mécanisme CSS `encadre` que la V2 : `astuce`/`attention`/`exercice`, plus une nouvelle classe `ou-executer`).

## Décisions structurelles prises avant rédaction

- **Granularité des chapitres** : proche de la V2 (chapitre = un domaine cohérent, pas une étape isolée), mais chaque chapitre applique désormais le gabarit complet ci-dessus — d'où un volume par chapitre 3 à 6 fois supérieur à la V2 sur les chapitres techniques, et bien plus sur les projets et le dépannage.
- **Multi-constructeur inchangé** : Cisco IOS / MikroTik RouterOS en alternance sur le cœur réseau (comme la V2), Ubiquiti UniFi pour le Wi-Fi (GUI, chemins de menu complets `Menu → Sous-menu → Paramètre → Valeur → Enregistrer → Vérifier`), FortiGate (FortiOS, GUI + CLI) pour le firewall périmétrique — reflète un usage réel d'intégrateur.
- **50 scénarios de dépannage** : répartis en 5 chapitres de 10 scénarios (réseau de base / switching-VLAN / routage-firewall-Wi-Fi / serveurs-supervision-sauvegarde / vidéosurveillance-matériel), chaque scénario suit la structure imposée (symptôme → causes possibles → test 1 → résultat → test 2 → résultat → diagnostic → correction → vérification → prévention) en format condensé (encadré), pour rester exploitable comme aide-mémoire terrain plutôt que noyé dans la prose.
- **6 projets, pas 5** : les 5 projets du cahier des charges (30 / 150 / 500 employés, campus, multi-sites) sont conservés tels quels, et le "Projet final ultime" (§58, 500 employés/3 bâtiments) est traité comme un **6ᵉ projet capstone** distinct du projet 500 employés mono-site — différenciation assumée : le projet 3 (grande entreprise) reste un site unique dense (datacenter, CCTV lourd), le projet capstone est multi-bâtiments avec VPN inter-sites, DMZ et supervision centralisée, et sert de fil rouge récapitulatif parcourant explicitement les 19 étapes du §58 dans l'ordre. Les 11 études de cas de la V2 (École, Hôpital, Aéroport...) ne sont pas reprises telles quelles — remplacées par ces 6 projets traités en A-à-Z complet (nomenclature, plan de câblage, plan de ports, plan IP, configurations intégrales, tests, devis, maintenance), sur lesquels la V2 n'allait pas aussi loin.
- **Laboratoires** : intégrés en fin de chaque chapitre technique (section "Laboratoire", même emplacement que les "Exercices" en V2) plutôt qu'en volume séparé — Packet Tracer pour le switching/routage de base, GNS3/EVE-NG pour OSPF/redondance/multi-site, VirtualBox/Proxmox pour les serveurs.
- **Aucune preuve de trafic/capture réelle inventée** : les "résultats attendus" après une commande sont des sorties types, documentées comme des exemples de référence (mêmes valeurs que la topologie du chapitre, cohérentes de bout en bout), jamais présentées comme une capture authentique d'un vrai équipement de laboratoire.
- **Pas de nouvelle section légale/juridique** : la vidéosurveillance touche à la conformité (droit à l'image, durée de conservation) — traitée comme un rappel factuel et un renvoi à la réglementation locale, jamais comme un avis juridique définitif (même prudence que sur les pages légales d'OTELA/Gros-Morne dans le reste du portefeuille).

## Ampleur estimée

La V2 fait ~43 400 mots sur 36 chapitres factuels. En appliquant le gabarit complet (localisation systématique, résultat attendu + interprétation, branche de dépannage sur chaque procédure importante, zéro "etc.") et en ajoutant les blocs entièrement nouveaux (étude de site, dépannage à 50 scénarios, méthodologie de devis, 6 projets en A-à-Z avec configurations intégrales) l'estimation réaliste est de **250 000 à 350 000 mots** — 2 à 3 fois le Guide Ultime du Déploiement (~120 600 mots, le plus long document déjà produit dans ce portefeuille). Rédaction prévue **volume par volume**, avec reconstruction (`build.ps1`) et relecture après chaque volume, au même rythme que les manuels précédents de la collection.

---

## VOLUME 1 — Fondamentaux absolus (Partie A/B du cahier des charges)

1. Qu'est-ce qu'un réseau ? (`01-quest-ce-quun-reseau.md`) — ordinateur, serveur, réseau, Internet, LAN, WAN, analogies de la vie réelle
2. Le vocabulaire de base du réseau (`02-vocabulaire-reseau.md`) — IP, MAC, switch, routeur, firewall, DNS, DHCP, VLAN, Wi-Fi, câble, fibre, PoE
3. Apprendre à lire un réseau (`03-lire-un-reseau.md`) — identifier les équipements (PC, serveur, switch, routeur, firewall, AP, caméra, NVR, imprimante, téléphone IP), lire un schéma physique/logique/topologie/plan de baie/plan IP/plan VLAN

## VOLUME 2 — Adressage IP de zéro à expert (Partie C)

4. IPv4, masques et notation CIDR (`04-ipv4-masques-cidr.md`)
5. Subnetting et VLSM — exercices progressifs (`05-subnetting-vlsm.md`)
6. DHCP et DNS en détail (`06-dhcp-dns-approfondi.md`)
7. IPv6 essentiel (`07-ipv6-essentiel.md`)
8. Appliquer le calcul IP à un vrai projet — méthode complète (`08-appliquer-calcul-ip-projet-reel.md`)

## VOLUME 3 — Étude de site et passage des besoins à l'architecture (Parties D/E)

9. L'étude de site professionnelle (`09-etude-de-site-professionnelle.md`) — avant/pendant/après, checklist complète, questionnaire client
10. Des besoins à l'architecture (`10-des-besoins-a-larchitecture.md`) — méthode, prise de décision technique, premiers arbres de décision

## VOLUME 4 — Conception du réseau : plan IP et VLAN (Parties F/G)

11. Conception du plan IP (`11-conception-plan-ip.md`) — méthode complète, tableau par VLAN (réseau/masque/passerelle/DHCP/plage/réservations/DNS/accès autorisés)
12. Conception des VLAN, approfondie (`12-conception-vlan-approfondie.md`) — pourquoi, création, ports access, trunks, native VLAN, inter-VLAN routing, ACL, lien avec le firewall

## VOLUME 5 — Choisir le matériel (Partie H)

13. Comment choisir un switch (`13-choisir-un-switch.md`) — ports, PoE/PoE+/PoE++, uplinks, SFP/SFP+, switching capacity, VLAN, STP, LACP
14. Comment choisir un routeur et un firewall (`14-choisir-un-routeur-firewall.md`)
15. Comment choisir des bornes Wi-Fi (`15-choisir-des-bornes-wifi.md`)
16. Comment choisir des caméras et des serveurs (`16-choisir-cameras-et-serveurs.md`) — arbres de décision "combien d'utilisateurs ?" / "combien de caméras ?"

## VOLUME 6 — Câblage structuré et infrastructure physique (Parties I/J)

17. Câblage structuré de A à Z (`17-cablage-structure-de-a-a-z.md`) — étude → plan → choix du câble → chemins → tirage → étiquetage → patch panel → keystone → brassage → test → certification
18. Installation de la baie informatique (`18-installation-de-la-baie.md`) — rack, PDU, UPS, patch panels, organisation, étiquetage, ventilation, alimentation, terre, exemple de plan de rack

## VOLUME 7 — Configuration des switches (Partie K)

19. Premier accès et configuration de base d'un switch (`19-premiere-connexion-switch.md`) — console, mots de passe, SSH, hostname, procédure stricte Cisco + MikroTik
20. VLAN, ports d'accès et voix (`20-vlan-ports-access-voix.md`)
21. Trunk et agrégation LACP (`21-trunk-agregation-lacp.md`)
22. Spanning Tree et haute disponibilité de couche 2 (`22-spanning-tree.md`)
23. Port Security, DHCP Snooping et durcissement (`23-port-security-dhcp-snooping.md`)
24. Sauvegarde, vérification et dépannage du switch (`24-sauvegarde-verification-switch.md`)

## VOLUME 8 — Routage (Partie L)

25. Configuration de base d'un routeur (`25-configuration-routeur-base.md`) — accès, hostname, interfaces, IP, route par défaut, routes statiques
26. Routage inter-VLAN et OSPF (`26-inter-vlan-ospf.md`)
27. Redondance (VRRP/HSRP) (`27-redondance-vrrp-hsrp.md`)

## VOLUME 9 — Firewall et sécurité périmétrique (Partie M)

28. Firewall : interfaces, zones, NAT, règles (`28-firewall-interfaces-nat-regles.md`)
29. Firewall : VPN, logs et politique de sécurité complète (`29-firewall-vpn-politique-securite.md`)

## VOLUME 10 — Wi-Fi professionnel (Partie N)

30. Wi-Fi professionnel de A à Z (`30-wifi-professionnel.md`) — étude, plan de couverture, choix AP, installation, adoption, SSID, VLAN, sécurité, roaming, tests

## VOLUME 11 — Serveurs (Partie O)

31. Windows Server de A à Z (`31-windows-server.md`) — installation, IP statique, hostname, Active Directory, DNS, DHCP, utilisateurs/groupes, GPO, fichiers, sauvegarde
32. Ubuntu Server de A à Z (`32-ubuntu-server.md`) — installation, IP, SSH, utilisateurs, sudo, firewall (ufw), mises à jour, services, Nginx, Docker, sauvegarde

## VOLUME 12 — Vidéosurveillance IP (Partie P + calculs + intégration)

33. Vidéosurveillance IP : la procédure complète en 18 étapes (`33-cctv-procedure-complete.md`)
34. Calculs CCTV : bande passante, stockage, PoE (`34-calculs-cctv.md`) — exemples chiffrés à 10/30/50/100/200 caméras
35. Configuration des caméras (`35-configuration-cameras.md`) — IP, résolution, FPS, bitrate, codec H.264/H.265, WDR, IR, détection, événements
36. NVR et VMS (`36-nvr-vms.md`)
37. Intégration réseau + vidéosurveillance (`37-integration-reseau-cctv.md`) — architecture complète, VLAN CCTV, chemin bout en bout

## VOLUME 13 — Supervision, sauvegardes, cybersécurité (Parties 29-31)

38. Supervision réseau (`38-supervision-reseau.md`) — SNMP, agents, installation d'un outil (Zabbix/LibreNMS), dashboard, alertes, rapports
39. Politique de sauvegarde (`39-politique-sauvegarde.md`) — quoi, où, quand, combien de temps, restauration, test de restauration
40. Cybersécurité d'entreprise, configuration de base sécurisée (`40-cybersecurite-configuration-securisee.md`)

## VOLUME 14 — Dépannage : méthode experte et 50 scénarios (Parties 32-33)

41. La méthode de diagnostic experte (`41-methode-diagnostic-experte.md`) — raisonnement en entonnoir, commandes Windows/PowerShell/Linux et interprétation
42. Scénarios 1-10 : réseau de base (IP, DHCP, DNS, Internet) (`42-scenarios-reseau-base.md`)
43. Scénarios 11-20 : switching et VLAN (`43-scenarios-switching-vlan.md`)
44. Scénarios 21-30 : routage, firewall et Wi-Fi (`44-scenarios-routage-firewall-wifi.md`)
45. Scénarios 31-40 : serveurs, supervision, sauvegarde (`45-scenarios-serveurs-supervision.md`)
46. Scénarios 41-50 : vidéosurveillance et pannes matérielles (`46-scenarios-cctv-materiel.md`)

## VOLUME 15 — Méthodologie de projet : nomenclature, tests, documentation, devis, maintenance (Parties 35-45, hors projets eux-mêmes)

47. Nomenclature, plan de câblage, plan de ports (`47-nomenclature-plans-cablage-ports.md`) — système d'identifiant de prise, tableau de ports
48. Mise en production, tests et recette (`48-mise-en-production-tests-recette.md`) — procédure de bascule sans interruption, matrice de tests
49. Documentation finale du client et maintenance (`49-documentation-client-maintenance.md`) — livrables, plans, procédures, calendrier de maintenance quotidien/hebdo/mensuel/trimestriel/annuel
50. Devis et budgétisation (`50-devis-budgetisation.md`) — méthode de calcul, modèles de devis

## VOLUME 16 — Projets complets de A à Z (Partie 34 + Projet final)

51. Projet 1 — Petite entreprise, 30 employés (`51-projet-petite-entreprise.md`)
52. Projet 2 — Entreprise moyenne, 150 employés (`52-projet-entreprise-moyenne.md`)
53. Projet 3 — Grande entreprise, 500 employés (`53-projet-grande-entreprise.md`)
54. Projet 4 — Campus multi-bâtiments (`54-projet-campus.md`)
55. Projet 5 — Entreprise multi-sites, VPN site-à-site (`55-projet-multisites.md`)
56. Projet final ultime — 500 employés, 3 bâtiments, tout combiné (`56-projet-final-ultime.md`)

Chaque chapitre 51-56 suit les 17 livrables du cahier des charges (cahier des charges → questions client → étude → architecture → plan IP → VLAN → matériel → câblage → configuration → firewall → Wi-Fi → serveur → CCTV → tests → documentation → devis → maintenance), avec nomenclature matérielle, plan de câblage, plan de ports, plan IP et configurations intégrales (firewall/routeur/switch cœur/switch accès/Wi-Fi/serveurs/NVR/caméras) — la liste des 14 livrables (§45) est produite pour chacun.

## VOLUME 17 — Référence rapide (Partie 53)

57. Référence rapide (`57-reference-rapide.md`) — commandes Cisco / MikroTik / Linux / Windows / PowerShell / diagnostic, calculs réseau, calculs CCTV, ports et protocoles usuels, aide-mémoire VLAN, checklist d'installation complète

---

## Rythme de rédaction proposé

Par volume, avec reconstruction (`build.ps1`) après chaque volume pour valider l'absence d'erreur Pandoc, à l'identique du pipeline des manuels précédents. Ordre naturel : V1→V17 (progression pédagogique du cahier des charges), sauf si Jaslin préfère un autre ordre (ex. traiter d'abord un domaine précis).
