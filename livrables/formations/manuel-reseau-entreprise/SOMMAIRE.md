# Sommaire — Manuel complet Réseaux d'entreprise & Vidéosurveillance IP

36 chapitres, aucune annexe (la table des matières fournie par l'auteur s'arrête à la Partie 11, sans section d'annexes — contrairement aux manuels précédents de la collection).

## Décisions techniques documentées

- **Comparatif constructeurs (Cisco, MikroTik, Ubiquiti, Aruba, Juniper, Fortinet, Sophos, Dell, HPE, Huawei)** : traité comme un tableau comparatif structuré au chapitre 4, pas comme dix sous-chapitres dédiés — évite la redondance, les commandes concrètes de chaque constructeur apparaissent ensuite en contexte dans les chapitres de configuration (10-13) et les projets (26-36).
- **Onze projets complets (Partie 11)** : contrairement au pattern "10 mini-projets en un seul chapitre" utilisé dans le manuel PowerShell (scripts courts), chaque projet ici (École, Université, Hôpital, Hôtel, Banque, Centre commercial, Aéroport, Usine, Siège multi-sites, Campus, Datacenter) reçoit son **propre chapitre complet** (26 à 36) : le volume de contenu par projet (budget, câblage, plan IP, configs multi-constructeurs, vidéosurveillance, sécurité, tests, documentation) justifie ce traitement, à l'inverse d'un script PowerShell de quelques dizaines de lignes.
- **Schémas réseau** : rendus en blocs de code Mermaid (` ```mermaid `) quand la structure logique s'y prête (topologies, flux), et en diagrammes ASCII (` ```{.uml} `) pour les schémas physiques (baies, racks, plans de câblage) — même mécanisme que les manuels précédents pour préserver la mise en forme verbatim.
- **Normes citées explicitement** : ISO/IEC 11801, TIA/EIA-568, IEEE 802.x (802.1Q, 802.1X, 802.3af/at/bt, 802.11), bonnes pratiques ITIL pour la documentation/exploitation (chapitre 25).
- **Configurations multi-constructeurs** : Cisco IOS, MikroTik RouterOS, Ubiquiti UniFi, et Fortinet (FortiOS) sont utilisés en alternance selon le contexte (un switch d'accès en Cisco, une box Internet en MikroTik, un contrôleur Wi-Fi en UniFi, un firewall périmétrique en Fortinet) plutôt que de dupliquer chaque exemple x4 — reflète une pratique réelle d'intégrateur qui mixe les constructeurs selon le budget client.

## Partie 1 — Fondamentaux des réseaux

1. Introduction aux réseaux (`01-introduction-reseaux.md`)
2. Modèles réseau — OSI, TCP/IP, encapsulation (`02-modeles-reseau.md`)
3. Adressage IP — IPv4, IPv6, subnetting, VLSM, DHCP, DNS, NAT (`03-adressage-ip.md`)

## Partie 2 — Équipements réseau

4. Les équipements — routeurs, switches, firewalls, comparatif constructeurs (`04-equipements-reseau.md`)

## Partie 3 — Étude et conception

5. Analyse des besoins (`05-analyse-besoins.md`)
6. Conception logique (`06-conception-logique.md`)
7. Conception physique (`07-conception-physique.md`)

## Partie 4 — Installation

8. Câblage (`08-cablage.md`)
9. Installation des équipements (`09-installation-equipements.md`)

## Partie 5 — Configuration

10. Switches (`10-configuration-switches.md`)
11. Routeurs (`11-configuration-routeurs.md`)
12. Wi-Fi (`12-configuration-wifi.md`)
13. Firewall (`13-configuration-firewall.md`)

## Partie 6 — Serveurs

14. Windows Server (`14-windows-server.md`)
15. Linux Server (`15-linux-server.md`)

## Partie 7 — Cybersécurité

16. Cybersécurité d'entreprise (`16-cybersecurite.md`)

## Partie 8 — Vidéosurveillance IP

17. Introduction à la vidéosurveillance IP (`17-videosurveillance-introduction.md`)
18. Les caméras (`18-cameras.md`)
19. Calculs (champ de vision, résolution, densité de pixels, nombre de caméras) (`19-calculs-videosurveillance.md`)
20. Installation des caméras (`20-installation-cameras.md`)
21. Réseau dédié à la vidéosurveillance (`21-reseau-videosurveillance.md`)
22. NVR et VMS (`22-nvr-vms.md`)
23. Intégration (contrôle d'accès, alarmes, LPR/ANPR, interphonie) (`23-integration-videosurveillance.md`)

## Partie 9 — Supervision

24. Supervision réseau (SNMP, Syslog, Zabbix, PRTG, Grafana, Centreon, Nagios) (`24-supervision.md`)

## Partie 10 — Documentation

25. Documentation de projet (cahier des charges, PRA/PCA, exploitation) (`25-documentation-projet.md`)

## Partie 11 — Projets complets

26. Projet complet : École (`26-projet-ecole.md`)
27. Projet complet : Université (`27-projet-universite.md`)
28. Projet complet : Hôpital (`28-projet-hopital.md`)
29. Projet complet : Hôtel (`29-projet-hotel.md`)
30. Projet complet : Banque (`30-projet-banque.md`)
31. Projet complet : Centre commercial (`31-projet-centre-commercial.md`)
32. Projet complet : Aéroport (`32-projet-aeroport.md`)
33. Projet complet : Usine (`33-projet-usine.md`)
34. Projet complet : Siège social multi-sites (`34-projet-siege-multisites.md`)
35. Projet complet : Campus d'entreprise (`35-projet-campus.md`)
36. Projet complet : Centre de données (Datacenter) (`36-projet-datacenter.md`)

## Rythme de rédaction

Rédaction par lots (Partie par Partie), avec reconstruction (`build.ps1`) après chaque lot pour valider l'absence d'erreur Pandoc, à l'identique du pipeline des manuels React / Java POO / Node.js / Windows Terminal.
