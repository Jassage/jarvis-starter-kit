const { h1, h2, h3, h4, p, pb, sp, tip, warning, danger, info, check, tipLines, warnLines, infoLines, checkLines, step, code, codeTitle, li, ni, makeTable, divider, ascii, def } = require('./helpers');

function getSections11to15() {
  const c = [];

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 11 — TESTS
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 11 — PROCÉDURES DE TESTS COMPLETS"));
  c.push(p("Ne déclarez JAMAIS une installation terminée sans avoir exécuté et documenté tous ces tests. Un client qui découvre une panne après votre départ est un client perdu."));
  c.push(sp());
  c.push(info("Créez une fiche de recette à signer par le client à la fin des tests. Elle prouve que l'installation fonctionne au moment de la livraison."));

  c.push(h2("11.1 — Tests des câbles (avant tout branchement réseau)"));
  c.push(p("C'est le premier test, le plus fondamental. Un câble défectueux cause des problèmes intermittents difficiles à diagnostiquer plus tard."));
  c.push(sp());
  c.push(makeTable(
    ["Résultat sur le testeur", "Signification", "Cause probable", "Solution"],
    [
      ["Voyants 1-2-3-4-5-6-7-8 s'allument dans l'ordre", "✅ CÂBLE OK", "—", "Rien à faire"],
      ["Un voyant manque (ex: voyant 3 absent)", "Fil 3 ouvert (cassé)", "Sertissage incomplet ou fil cassé", "Resertir l'extrémité défectueuse"],
      ["Deux voyants s'allument en même temps", "Court-circuit entre 2 fils", "Deux fils en contact dans le connecteur", "Resertir — vérifier qu'aucun fil ne se croise"],
      ["Voyants 3 et 6 inversés", "Paire 2 inversée", "T568A sur un bout, T568B sur l'autre", "Resertir en T568B des deux côtés"],
      ["Voyants lents ou clignotants", "Résistance trop élevée", "Câble trop long (>90m) ou mauvais contact", "Vérifier longueur, resertir avec pression"],
      ["Aucun voyant", "Câble complètement ouvert", "Câble coupé ou non connecté", "Vérifier que les deux extrémités sont branchées"],
    ],
    [2800, 1500, 2000, 2726]
  ));

  c.push(h2("11.2 — Tests réseau de base — commandes complètes"));
  c.push(h3("Test PING — Vérifier la connectivité"));
  c.push(p("Le ping envoie des paquets ICMP et mesure le temps de réponse. C'est votre outil de diagnostic numéro 1."));
  c.push(sp());
  c.push(ascii([
    "  INTERPRÉTATION D'UN PING :",
    "",
    "  C:\\> ping 192.168.10.1",
    "",
    "  Envoi d'une requête 'ping' sur 192.168.10.1 avec 32 octets de données :",
    "  Réponse de 192.168.10.1 : octets=32 temps=1 ms TTL=255    ← NORMAL",
    "  Réponse de 192.168.10.1 : octets=32 temps=1 ms TTL=255    ← NORMAL",
    "",
    "  Délai de 1-5ms    = Excellent (réseau local)",
    "  Délai de 5-20ms   = Correct (réseau local ou VPN)",
    "  Délai de 50-200ms = Acceptable (Internet normal)",
    "  Délai > 500ms     = Problème (congestion ou lien défaillant)",
    "  'Délai d'attente dépassé'  = Équipement éteint ou pare-feu bloque",
    "  'Hôte de destination inatteignable' = Pas de route vers cet hôte",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Test à effectuer", "Commande Windows", "Commande Linux", "Résultat attendu"],
    [
      ["Ping vers le routeur (gateway)", "ping 192.168.10.1", "ping -c 4 192.168.10.1", "< 5ms, 0% perte"],
      ["Ping entre deux VLANs", "ping 192.168.20.1", "ping -c 4 192.168.20.1", "< 5ms si inter-VLAN activé"],
      ["Ping vers Internet", "ping 8.8.8.8", "ping -c 4 8.8.8.8", "< 50ms, 0% perte"],
      ["Ping vers un nom de domaine", "ping google.com", "ping -c 4 google.com", "DNS fonctionne si résolu"],
      ["Ping continu (surveillance)", "ping -t 192.168.10.1", "ping 192.168.10.1", "Ctrl+C pour arrêter"],
      ["Ping depuis VLAN Invités vers LAN", "ping 192.168.10.1", "ping -c 4 192.168.10.1", "DOIT ÉCHOUER (ACL active)"],
    ],
    [2400, 2200, 2200, 2226]
  ));

  c.push(h3("Test TRACEROUTE — Diagnostiquer le chemin réseau"));
  c.push(p("Le traceroute révèle chaque équipement (routeur, switch L3) que traversent vos paquets entre l'origine et la destination."));
  c.push(sp());
  c.push(ascii([
    "  C:\\> tracert 8.8.8.8",
    "",
    "  Détermination de l'itinéraire vers dns.google [8.8.8.8]",
    "  avec un maximum de 30 sauts :",
    "",
    "    1    1 ms    1 ms    1 ms   192.168.10.1   ← Votre routeur",
    "    2   12 ms   11 ms   12 ms   203.0.113.1    ← Routeur opérateur",
    "    3   18 ms   17 ms   18 ms   10.1.2.3       ← Backbone opérateur",
    "    4   25 ms   24 ms   25 ms   8.8.8.8        ← Google DNS",
    "",
    "  Si vous voyez '*  *  *' sur un saut = ce routeur bloque ICMP",
    "  Si ça s'arrête soudainement = rupture à ce point du chemin",
  ]));
  c.push(sp());
  c.push(codeTitle("Windows"));
  c.push(code("tracert 8.8.8.8                 # Vers Internet"));
  c.push(code("tracert 192.168.20.1            # Vers un autre VLAN"));
  c.push(sp());
  c.push(codeTitle("Linux / Mac"));
  c.push(code("traceroute 8.8.8.8"));
  c.push(code("traceroute -n 192.168.20.1      # -n : sans résolution DNS (plus rapide)"));

  c.push(h3("Tests ipconfig / ip — Diagnostic de configuration IP"));
  c.push(codeTitle("Windows — Commandes essentielles"));
  c.push(code("ipconfig /all                   # Configuration complète : IP, MAC, DNS, DHCP"));
  c.push(code("ipconfig /release               # Libérer l'adresse DHCP actuelle"));
  c.push(code("ipconfig /renew                 # Demander une nouvelle adresse DHCP"));
  c.push(code("ipconfig /flushdns              # Vider le cache DNS (résout les problèmes de noms)"));
  c.push(code("arp -a                          # Voir la table ARP (IP ↔ MAC)"));
  c.push(code("nslookup google.com             # Tester la résolution DNS"));
  c.push(code("nslookup google.com 8.8.8.8     # Tester avec un DNS spécifique"));
  c.push(code("netstat -an                     # Ports ouverts et connexions actives"));
  c.push(sp());
  c.push(codeTitle("Linux — Commandes essentielles"));
  c.push(code("ip addr show                    # Interfaces et adresses IP"));
  c.push(code("ip route show                   # Table de routage"));
  c.push(code("cat /etc/resolv.conf            # DNS configuré"));
  c.push(code("resolvectl status               # DNS détaillé (Ubuntu 18.04+)"));
  c.push(code("arp -n                          # Table ARP"));
  c.push(code("ss -tulnp                       # Ports ouverts"));
  c.push(code("nslookup google.com             # Test DNS"));
  c.push(code("dig google.com @8.8.8.8         # Test DNS avancé vers Google"));

  c.push(h2("11.3 — Tests VLAN — procédure complète"));
  c.push(p("Les tests VLAN vérifient que la segmentation réseau fonctionne correctement : que les VLANs communiquent quand ils le doivent, et sont isolés quand ils doivent l'être."));
  c.push(sp());
  c.push(makeTable(
    ["Test N°", "Test à effectuer", "Depuis où", "Vers quoi", "Résultat attendu", "Si ça échoue"],
    [
      ["VLAN-01", "Ping gateway VLAN10", "PC dans VLAN10", "192.168.10.1", "✅ Répond < 5ms", "Vérifier port access sur switch"],
      ["VLAN-02", "DHCP fonctionne", "PC dans VLAN10", "ipconfig /renew", "✅ Reçoit 192.168.10.x", "Vérifier serveur DHCP VLAN10"],
      ["VLAN-03", "Inter-VLAN VLAN10→VLAN20", "PC dans VLAN10", "192.168.20.1", "✅ Répond (routage actif)", "Vérifier routage inter-VLAN sur routeur"],
      ["VLAN-04", "Isolation Invités→Admin", "PC dans VLAN99", "192.168.10.1", "❌ Ne répond PAS (ACL)", "Vérifier règle firewall BLOCK-GUESTS"],
      ["VLAN-05", "Isolation Caméras", "PC dans VLAN40", "192.168.10.1", "❌ Ne répond PAS", "Vérifier règle firewall BLOCK-CAMERAS"],
      ["VLAN-06", "Admin peut voir les caméras", "PC dans VLAN10", "192.168.40.10", "✅ Répond (NVR)", "Vérifier règle allow VLAN10→VLAN40"],
      ["VLAN-07", "Invités ont Internet", "PC dans VLAN99", "ping 8.8.8.8", "✅ Répond (Internet OK)", "Vérifier NAT et route pour VLAN99"],
      ["VLAN-08", "Wi-Fi Staff dans bon VLAN", "Téléphone sur SSID Staff", "ipconfig/ifconfig", "✅ IP 192.168.50.x", "Vérifier VLAN50 sur AP et trunk"],
    ],
    [800, 2000, 1600, 1600, 1800, 2226]
  ));

  c.push(h2("11.4 — Tests PoE"));
  c.push(step("1", "Vérifier l'alimentation PoE sur le switch", "Sur switch Cisco : show power inline. Sur switch TP-Link : interface web → Switching → PoE → PoE Config. Chaque port alimenté doit afficher la puissance consommée."));
  c.push(sp());
  c.push(step("2", "Vérifier le budget PoE total", "Total consommé NE DOIT PAS dépasser le budget du switch. Ex : switch 193W avec 10 caméras à 12W = 120W consommés (< 193W ✅)."));
  c.push(sp());
  c.push(step("3", "Test d'une caméra PoE", "Brancher la caméra. La LED du port s'allume. La caméra apparaît en réseau après 30 secondes. Ping vers son IP doit répondre."));
  c.push(sp());
  c.push(ascii([
    "  VÉRIFICATION BUDGET PoE :",
    "",
    "  Switch PoE 193W :",
    "  Port 1  : Caméra Hikvision 4MP    → 12.5W",
    "  Port 2  : Caméra Hikvision 4MP    → 12.5W",
    "  Port 3  : AP Wi-Fi EAP670         → 22.5W",
    "  Port 4  : AP Wi-Fi EAP670         → 22.5W",
    "  Port 5  : Téléphone IP Fanvil     → 3.5W",
    "  ──────────────────────────────────────────",
    "  TOTAL CONSOMMÉ                    → 73.5W",
    "  BUDGET DISPONIBLE                 → 193W",
    "  MARGE LIBRE                       → 119.5W ✅ Sécurisé",
  ]));
  c.push(sp());
  c.push(danger("Si le budget PoE est dépassé, le switch coupe l'alimentation des ports les moins prioritaires. Des caméras ou des APs s'éteignent aléatoirement. Toujours vérifier le budget avant la mise en service."));

  c.push(h2("11.5 — Test de débit réseau (iPerf3)"));
  c.push(p("iPerf3 mesure le débit réel entre deux points du réseau. Indispensable pour vérifier qu'un câble ou une liaison fibre fonctionne à la bonne vitesse."));
  c.push(sp());
  c.push(codeTitle("Installer iPerf3 (Linux)"));
  c.push(code("sudo apt install iperf3 -y"));
  c.push(sp());
  c.push(codeTitle("Sur le serveur (PC de destination) — lancer en mode écoute"));
  c.push(code("iperf3 -s"));
  c.push(sp());
  c.push(codeTitle("Sur le client (PC de test) — lancer le test"));
  c.push(code("iperf3 -c 192.168.60.10 -t 30 -P 4     # Test 30s, 4 flux parallèles"));
  c.push(sp());
  c.push(makeTable(
    ["Résultat attendu", "Signification", "Si inférieur"],
    [
      ["> 900 Mbps entre deux PCs", "Câble Cat6 fonctionnel à 1 Gbps", "Câble défectueux ou switch à 100 Mbps"],
      ["> 9 Gbps sur lien fibre", "Fibre 10G fonctionnelle", "Transceiver SFP ou fibre défectueuse"],
      ["> 100 Mbps sur Wi-Fi 5 GHz", "AP Wi-Fi fonctionnel", "Distance trop grande ou interférences"],
      ["> 300 Mbps sur Wi-Fi 6 (5 GHz)", "Wi-Fi 6 fonctionnel", "Client ne supporte pas Wi-Fi 6"],
    ],
    [2400, 2800, 3826]
  ));

  c.push(h2("11.6 — Fiche de recette officielle (à signer)"));
  c.push(makeTable(
    ["N°", "Test", "Résultat attendu", "Résultat obtenu", "OK/NOK", "Signé"],
    [
      ["1", "Câblage : tous les câbles testés", "100% de voyants corrects", "", "", ""],
      ["2", "Réseau : ping gateway de chaque VLAN", "< 5ms, 0% perte", "", "", ""],
      ["3", "DHCP : distribution IP automatique", "IP reçue en < 5 secondes", "", "", ""],
      ["4", "Internet : accès depuis chaque VLAN autorisé", "Navigation web fonctionnelle", "", "", ""],
      ["5", "Isolation : VLAN Invités bloqué du LAN", "Ping vers 192.168.10.1 échoue", "", "", ""],
      ["6", "Wi-Fi : tous les SSID accessibles", "Connexion et IP reçue", "", "", ""],
      ["7", "Caméras : toutes visibles dans NVR", "Image live sur tous les canaux", "", "", ""],
      ["8", "Enregistrement NVR : actif", "Icône REC visible sur chaque caméra", "", "", ""],
      ["9", "Accès distant NVR : smartphone", "App Hik-Connect affiche les caméras", "", "", ""],
      ["10", "Onduleur : test coupure secteur", "Réseau reste en ligne 10 min minimum", "", "", ""],
      ["11", "Documentation : livrée au client", "Plan réseau + tableau IPs + mots de passe", "", "", ""],
      ["", "SIGNATURE PRESTATAIRE", "Date : ___________", "SIGNATURE CLIENT", "Date : ___________", ""],
    ],
    [500, 2500, 2000, 1500, 900, 1626]
  ));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 12 — SÉCURITÉ
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 12 — SÉCURITÉ DU RÉSEAU"));
  c.push(p("La sécurité réseau n'est pas une option. En Haïti comme ailleurs, les réseaux mal sécurisés sont régulièrement compromis : vol de données, ransomware, espionnage industriel, détournement de bande passante."));
  c.push(sp());
  c.push(ascii([
    "  LES 5 NIVEAUX DE SÉCURITÉ RÉSEAU :",
    "",
    "  NIVEAU 1 : Sécurité physique (rack verrouillé, câbles protégés)",
    "  NIVEAU 2 : Segmentation réseau (VLANs, ACL)",
    "  NIVEAU 3 : Authentification (mots de passe forts, SSH)",
    "  NIVEAU 4 : Surveillance (logs, alertes)",
    "  NIVEAU 5 : Sauvegardes (configs, données)",
    "",
    "  Un attaquant contourne toujours par le maillon le plus faible.",
  ]));

  c.push(h2("12.1 — Sécurité des équipements réseau"));
  c.push(makeTable(
    ["Mesure de sécurité", "Comment faire", "Pourquoi c'est crucial"],
    [
      ["Changer les mots de passe par défaut", "Dès la première connexion, sur TOUS les équipements", "Les mots de passe par défaut sont publiquement connus (ex: admin/admin)"],
      ["Désactiver Telnet, activer SSH v2", "Cisco: ip ssh version 2 + no telnet. MikroTik: IP→Services→disable telnet", "Telnet transmet les mots de passe en clair — visible avec Wireshark"],
      ["Désactiver les ports inutilisés", "Cisco: interface range + shutdown. TP-Link: Admin→disable port", "Un câble branché dans un port libre = accès réseau non contrôlé"],
      ["Activer les journaux système (Syslog)", "Configurer envoi vers un serveur Syslog (Kiwi Syslog, Graylog)", "Sans logs, impossible de savoir ce qui s'est passé lors d'un incident"],
      ["Sauvegarder les configurations", "Automatiser une sauvegarde hebdomadaire sur un serveur FTP/TFTP", "En cas de panne matérielle, vous pouvez reconfigurer en 30 min"],
      ["Mettre à jour les firmwares", "Vérifier les mises à jour fabricant tous les 3 mois", "Les failles de sécurité sont corrigées dans les mises à jour"],
      ["Activer Port Security", "Cisco: switchport port-security max 1", "Empêche de connecter un switch pirate ou un PC non autorisé"],
      ["DHCP Snooping", "Cisco: ip dhcp snooping. Bloque les faux serveurs DHCP", "Protège contre les attaques 'rogue DHCP server'"],
    ],
    [2200, 3200, 3626]
  ));

  c.push(h2("12.2 — Politique de mots de passe"));
  c.push(infoLines("RÈGLES DES MOTS DE PASSE — À RESPECTER ABSOLUMENT", [
    "Longueur minimale : 16 caractères pour les équipements réseau, 12 pour les PCs",
    "Composition : majuscules + minuscules + chiffres + symboles (!@#$%)",
    "Jamais le nom de l'entreprise, une date d'anniversaire ou un mot du dictionnaire",
    "Jamais le même mot de passe sur deux équipements différents",
    "Stocker dans un gestionnaire de mots de passe : KeePass (local) ou Bitwarden",
    "Renouveler tous les 3 mois pour les équipements réseau, 6 mois pour le Wi-Fi",
    "Documenter dans le registre des mots de passe PHYSIQUE sous clé",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Équipement", "Utilisateur", "Exemple de mot de passe fort", "Rotation"],
    [
      ["Routeur/Firewall", "admin", "Rtx9@Bk#2025!Pm&", "3 mois"],
      ["Switch Core", "admin", "Swx7@Cn#2025!Qr&", "3 mois"],
      ["NVR Hikvision", "admin", "Nvr4@Xz#2025!Ws&", "6 mois"],
      ["Wi-Fi Employés", "PSK", "EmpWifi@Secure2025#!", "6 mois"],
      ["Wi-Fi Invités", "PSK", "VisiCode#2025!", "Mensuel recommandé"],
      ["VPN", "Certificat + MDP", "Vpn3@Ky#2025!Mn&", "Annuel (certificat)"],
      ["Serveur Windows", "Administrateur", "WinSrv@8#2025!Pk&", "3 mois (GPO AD)"],
    ],
    [1800, 1400, 3400, 2426]
  ));

  c.push(h2("12.3 — Sécurité avancée des switchs (Cisco)"));
  c.push(codeTitle("Port Security — Limiter à 1 MAC par port access"));
  c.push(code("interface GigabitEthernet0/1"));
  c.push(code(" switchport port-security maximum 1           ! Max 1 adresse MAC"));
  c.push(code(" switchport port-security violation shutdown  ! Désactiver port si violation"));
  c.push(code(" switchport port-security                     ! Activer port-security"));
  c.push(sp());
  c.push(codeTitle("DHCP Snooping — Bloquer les faux serveurs DHCP"));
  c.push(code("ip dhcp snooping                             ! Activer globalement"));
  c.push(code("ip dhcp snooping vlan 10,20,50,99            ! Sur ces VLANs"));
  c.push(code("interface GigabitEthernet0/24"));
  c.push(code(" ip dhcp snooping trust                      ! Port trunk = trusted"));
  c.push(sp());
  c.push(codeTitle("Dynamic ARP Inspection — Prévenir l'ARP Spoofing"));
  c.push(code("ip arp inspection vlan 10,20,50,99           ! Activer DAI sur les VLANs"));
  c.push(code("interface GigabitEthernet0/24"));
  c.push(code(" ip arp inspection trust                     ! Port trunk = trusted"));
  c.push(sp());
  c.push(codeTitle("Storm Control — Prévenir les boucles et broadcast storms"));
  c.push(code("interface GigabitEthernet0/1"));
  c.push(code(" storm-control broadcast level 20            ! Limiter broadcast à 20%"));
  c.push(code(" storm-control action shutdown               ! Désactiver port si dépassé"));

  c.push(h2("12.4 — Règles ACL inter-VLAN sur MikroTik"));
  c.push(makeTable(
    ["Règle", "Source", "Destination", "Action", "Commentaire"],
    [
      ["1", "192.168.99.0/24 (Invités)", "192.168.0.0/16 (tout LAN)", "DROP", "BLOCK-GUESTS-TO-LAN"],
      ["2", "192.168.40.0/24 (Caméras)", "!192.168.40.0/24", "DROP", "CAMERAS-ISOLATED"],
      ["3", "192.168.60.0/24 (Serveurs)", "→ Internet", "DROP", "SERVERS-NO-INTERNET (si souhaité)"],
      ["4", "Tout", "→ port 23 (Telnet)", "DROP", "BLOCK-TELNET"],
      ["5", "192.168.10.0/24 (Admin)", "Tout", "ACCEPT", "ADMIN-FULL-ACCESS"],
      ["6", "Tout", "état ESTABLISHED,RELATED", "ACCEPT", "AUTORISER-RÉPONSES"],
    ],
    [600, 2000, 2000, 800, 3626]
  ));
  c.push(sp());
  c.push(codeTitle("Commandes MikroTik pour ces ACL"));
  c.push(code("/ip firewall filter"));
  c.push(code("add chain=forward src-address=192.168.99.0/24 dst-address=192.168.0.0/16 action=drop comment=\"BLOCK-GUESTS-TO-LAN\""));
  c.push(code("add chain=forward src-address=192.168.40.0/24 dst-address=!192.168.40.0/24 action=drop comment=\"CAMERAS-ISOLATED\""));
  c.push(code("add chain=forward dst-port=23 protocol=tcp action=drop comment=\"BLOCK-TELNET\""));
  c.push(code("add chain=input connection-state=established,related action=accept comment=\"ACCEPT-ESTABLISHED\""));
  c.push(code("add chain=input connection-state=invalid action=drop comment=\"DROP-INVALID\""));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 13 — DOCUMENTATION
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 13 — DOCUMENTATION FINALE"));
  c.push(p("Une installation sans documentation est une installation à moitié faite. La documentation protège le client ET vous-même en cas de litige ou de maintenace future."));
  c.push(sp());
  c.push(infoLines("DOCUMENTS À LIVRER AU CLIENT", [
    "1. Plan réseau logique (schéma des connexions)",
    "2. Plan de câblage physique (positions des prises, câbles, rack)",
    "3. Tableau d'adressage IP complet",
    "4. Inventaire du matériel installé avec numéros de série",
    "5. Registre des mots de passe (sous enveloppe cachetée)",
    "6. Procédures de maintenance",
    "7. Procédures de sauvegarde",
    "8. Guide de dépannage de premier niveau",
  ]));

  c.push(h2("13.1 — Inventaire complet du matériel installé"));
  c.push(makeTable(
    ["N°", "Équipement", "Marque/Modèle", "N° de série", "Adresse IP", "VLAN", "Emplacement", "Date installation", "Garantie jusqu'au"],
    [
      ["01", "Routeur principal", "MikroTik RB4011", "", "192.168.1.1", "Trunk", "Rack U6", "", ""],
      ["02", "Switch Core 24p", "TP-Link SG3428", "", "192.168.10.2", "Mgmt", "Rack U3", "", ""],
      ["03", "Switch PoE 24p", "TP-Link SG3428MP", "", "192.168.10.3", "Mgmt", "Rack U4", "", ""],
      ["04", "AP Wi-Fi Bureau 01", "TP-Link EAP670", "", "192.168.50.2", "50", "Plafond Bureau 01", "", ""],
      ["05", "AP Wi-Fi Couloir", "TP-Link EAP670", "", "192.168.50.3", "50", "Plafond Couloir", "", ""],
      ["06", "NVR 16 voies", "Hikvision DS-7616", "", "192.168.40.10", "40", "Rack U7", "", ""],
      ["07", "Caméra Entrée", "Hikvision 2143G2", "", "192.168.40.21", "40", "Entrée — 2.5m", "", ""],
      ["08", "Caméra Couloir", "Hikvision 2143G2", "", "192.168.40.22", "40", "Couloir — 3m", "", ""],
      ["09", "Caméra Parking", "Hikvision 2CD2T43", "", "192.168.40.23", "40", "Façade ext — 4m", "", ""],
      ["10", "Onduleur 1500VA", "APC SMT1500I", "", "—", "—", "Sous rack", "", ""],
    ],
    [400, 1500, 1600, 1400, 1400, 600, 1400, 1100, 1126]
  ));

  c.push(h2("13.2 — Registre des mots de passe (CONFIDENTIEL)"));
  c.push(danger("Ce tableau contient des informations hautement sensibles. Imprimez-le, mettez-le dans une enveloppe cachetée signée, et remettez-le uniquement au responsable désigné. Ne stockez JAMAIS ce document sur un partage réseau."));
  c.push(sp());
  c.push(makeTable(
    ["Équipement", "Adresse IP", "Protocole accès", "Utilisateur", "Mot de passe", "Modif. le"],
    [
      ["Routeur MikroTik", "192.168.1.1", "Winbox / SSH", "admin", "____________", ""],
      ["Switch Core", "192.168.10.2", "SSH / HTTPS", "admin", "____________", ""],
      ["Switch PoE", "192.168.10.3", "SSH / HTTPS", "admin", "____________", ""],
      ["AP Wi-Fi (Omada)", "192.168.50.2", "HTTPS", "admin", "____________", ""],
      ["NVR Hikvision", "192.168.40.10", "HTTPS", "admin", "____________", ""],
      ["Wi-Fi SSID Staff", "—", "WPA3 PSK", "—", "____________", ""],
      ["Wi-Fi SSID Invités", "—", "WPA2 PSK", "—", "____________", ""],
      ["VPN WireGuard", "10.0.0.1", "WireGuard", "—", "Clé publique annexée", ""],
      ["Serveur Windows", "192.168.60.10", "RDP / Console", "Administrateur", "____________", ""],
      ["NAS", "192.168.60.20", "HTTPS", "admin", "____________", ""],
    ],
    [1700, 1400, 1500, 1200, 1500, 1726]
  ));

  c.push(h2("13.3 — Procédure de sauvegarde des configurations"));
  c.push(codeTitle("Sauvegarde manuelle MikroTik (à faire après chaque modification)"));
  c.push(code("/export file=backup-RTR-MAIN-$(date)          # Crée un fichier .rsc sur le routeur"));
  c.push(code("# Télécharger via Winbox : Files → glisser le fichier sur le bureau Windows"));
  c.push(sp());
  c.push(codeTitle("Sauvegarde automatique MikroTik (planifiée chaque semaine)"));
  c.push(code("/system scheduler add name=\"weekly-backup\" interval=7d \\"));
  c.push(code("  on-event=\"/export file=backup-auto-weekly\" comment=\"Backup auto hebdo\""));
  c.push(sp());
  c.push(codeTitle("Sauvegarde switch Cisco sur serveur TFTP"));
  c.push(code("copy running-config tftp://192.168.60.10/configs/SW-CORE-01-backup.cfg"));
  c.push(sp());
  c.push(tip("Installez un serveur TFTP gratuit (SolarWinds TFTP Server sur Windows, tftpd-hpa sur Linux) sur le serveur principal pour centraliser toutes les sauvegardes de configuration."));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 14 — MAINTENANCE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 14 — CALENDRIER DE MAINTENANCE"));
  c.push(p("La maintenance préventive évite 80% des pannes. Un réseau qui n'est jamais maintenu accumule des problèmes silencieux jusqu'au jour où tout tombe."));

  c.push(h2("14.1 — Tâches quotidiennes (5-10 minutes)"));
  c.push(makeTable(
    ["Tâche", "Comment vérifier", "Résultat normal"],
    [
      ["Vérifier l'accès Internet", "ping 8.8.8.8 depuis un PC", "< 50ms, 0% perte"],
      ["Vérifier les enregistrements NVR", "Interface NVR → voir les icônes REC", "Toutes les caméras enregistrent"],
      ["Vérifier les alertes de monitoring", "Email ou tableau de bord Zabbix/PRTG", "Aucune alerte critique"],
      ["Vérifier l'onduleur (voyant LED)", "LED verte = charge secteur OK", "Pas de LED rouge ou orange"],
    ],
    [2500, 2500, 4026]
  ));

  c.push(h2("14.2 — Tâches hebdomadaires (30-60 minutes)"));
  c.push(makeTable(
    ["Tâche", "Procédure", "Durée"],
    [
      ["Revue des logs firewall", "MikroTik: /log print where topics~\"firewall\" — chercher les blocages anormaux", "15 min"],
      ["Vérifier l'espace disque NVR", "Interface NVR → HDD Management → % utilisé. < 80% = OK", "5 min"],
      ["Vérifier les mises à jour disponibles", "Vérifier site fabricant MikroTik, TP-Link, Hikvision", "10 min"],
      ["Tester la connexion VPN", "Connecter depuis un PC externe et accéder à un fichier serveur", "10 min"],
      ["Vérifier le rapport de débit Internet", "speedtest.net ou router stats — comparer au débit contractuel", "5 min"],
    ],
    [2400, 4000, 1626]
  ));

  c.push(h2("14.3 — Tâches mensuelles (2-4 heures)"));
  c.push(makeTable(
    ["Tâche", "Procédure détaillée", "Durée"],
    [
      ["Sauvegarde des configurations réseau", "Exporter configs routeur, switchs, NVR. Stocker sur serveur + copie externe.", "30 min"],
      ["Appliquer les mises à jour firmware", "Télécharger, planifier une maintenance (hors heures ouvrées), appliquer.", "1h"],
      ["Inspection physique du rack", "Vérifier température, câblage, cordons desserrés, poussière sur les ventilateurs.", "20 min"],
      ["Audit des comptes utilisateurs", "Supprimer les comptes des ex-employés, vérifier les droits d'accès.", "30 min"],
      ["Tester la restauration d'une sauvegarde", "Restaurer une config de test sur un équipement de lab ou en environnement isolé.", "1h"],
      ["Rapport d'activité réseau", "Analyser le trafic : top consommateurs, protocoles, alertes firewall.", "30 min"],
    ],
    [2200, 4200, 1626]
  ));

  c.push(h2("14.4 — Tâches trimestrielles et annuelles"));
  c.push(makeTable(
    ["Fréquence", "Tâche", "Durée", "Qui ?"],
    [
      ["Trimestrielle", "Test de basculement onduleur (simulation coupure 10 min)", "1h", "IT Admin"],
      ["Trimestrielle", "Renouvellement des mots de passe équipements réseau", "2h", "IT Admin"],
      ["Trimestrielle", "Vérification des ACL et règles firewall (cohérence)", "1h", "IT Admin"],
      ["Trimestrielle", "Nettoyage physique des équipements (soufflette, poussière)", "30 min", "IT Admin"],
      ["Annuelle", "Audit de sécurité complet (scan Nessus ou similaire)", "1 jour", "IT + Sécurité"],
      ["Annuelle", "Test de reprise après sinistre complet (PRA)", "1 jour", "IT + Direction"],
      ["Annuelle", "Révision du plan d'adressage et de la documentation", "2h", "IT Admin"],
      ["Annuelle", "Renouvellement des certificats SSL/TLS si utilisés", "2h", "IT Admin"],
      ["Annuelle", "Inventaire physique de tous les équipements", "2h", "IT Admin"],
    ],
    [1500, 4000, 1200, 2326]
  ));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 15 — DÉPANNAGE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 15 — GUIDE DE DÉPANNAGE COMPLET"));
  c.push(p("Ce guide vous aide à diagnostiquer et résoudre les pannes les plus fréquentes. Pour chaque problème : commencez toujours par les causes les plus simples avant de chercher des problèmes complexes."));
  c.push(sp());
  c.push(tip("Règle d'or du dépannage : 'Qu'est-ce qui a changé récemment ?' La plupart des pannes surviennent après une modification. Demandez toujours si quelque chose a été touché, branché ou déplacé."));

  c.push(h2("15.1 — Plus d'accès Internet"));
  c.push(ascii([
    "  ARBRE DE DÉCISION — PLUS D'INTERNET :",
    "",
    "  Le problème concerne :",
    "  ├── UN seul PC ? → Vérifier carte réseau, câble, adresse IP du PC",
    "  └── TOUS les PCs ?",
    "       ├── Ping 192.168.10.1 répond ?",
    "       │    ├── OUI → Problème sur le routeur ou lien WAN",
    "       │    └── NON → Problème sur le switch ou le câble vers routeur",
    "       └── LED du routeur côté WAN ?",
    "            ├── Allumée → Tester speedtest depuis routeur",
    "            └── Éteinte → Vérifier câble modem, appeler l'opérateur",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Étape", "Action de diagnostic", "Commande", "Si ça répond", "Si ça ne répond pas"],
    [
      ["1", "Ping vers la gateway", "ping 192.168.10.1", "Réseau local OK → prob. WAN", "Prob. LAN → câble ou switch"],
      ["2", "Ping vers IP publique", "ping 8.8.8.8", "NAT OK, prob. DNS", "Prob. WAN ou NAT"],
      ["3", "Ping vers un nom", "ping google.com", "Internet fonctionne!", "Prob. DNS → changer DNS"],
      ["4", "Vérifier routeur WAN", "Interface admin routeur", "IP publique visible ?", "Relancer DHCP WAN"],
      ["5", "Redémarrer le modem", "Déconnecter 30 sec", "Souvent suffit", "Contacter l'opérateur"],
    ],
    [500, 2000, 1800, 2300, 2426]
  ));
  c.push(sp());
  c.push(codeTitle("MikroTik — Diagnostics Internet"));
  c.push(code("/ping 8.8.8.8 count=5               # Ping depuis le routeur lui-même"));
  c.push(code("/ip dhcp-client print                # Voir si le WAN a une IP"));
  c.push(code("/ip route print                      # Vérifier la route par défaut"));
  c.push(code("/tool traceroute 8.8.8.8             # Tracer le chemin depuis le routeur"));

  c.push(h2("15.2 — Switch en panne ou port mort"));
  c.push(makeTable(
    ["Symptôme observé", "Cause probable", "Diagnostic", "Solution"],
    [
      ["LED port ÉTEINTE après branchement", "Câble défectueux ou pas de signal", "Testeur de câble sur ce câble", "Remplacer le câble RJ45"],
      ["LED port ORANGE clignotante (Cisco)", "Erreurs de trame (CRC errors)", "show interface Gi0/1 → voir CRC count", "Changer câble, vérifier le NIC du PC"],
      ["Aucune LED sur tout le switch", "Plus d'alimentation électrique", "Vérifier PDU et onduleur", "Vérifier disjoncteur, brancher PDU"],
      ["Port STP en état BLOCKING", "Boucle réseau détectée", "show spanning-tree → chercher BLOCKING", "Retirer le câble qui crée la boucle"],
      ["PC ne reçoit pas d'IP via DHCP", "Port dans mauvais VLAN ou DHCP KO", "show vlan brief → vérifier PVID port", "Corriger PVID du port + redémarrer DHCP"],
      ["Switch inaccessible en SSH", "IP de gestion perdue ou service SSH KO", "Console physique sur switch", "Reconfigurer IP gestion via console"],
    ],
    [2200, 2000, 2200, 2626]
  ));

  c.push(h2("15.3 — Caméra hors ligne ou image absente"));
  c.push(makeTable(
    ["Symptôme", "Cause probable", "Vérification", "Solution"],
    [
      ["Caméra n'apparaît pas dans NVR", "Pas d'alimentation PoE", "Ping 192.168.40.2x → pas de réponse", "Vérifier budget PoE switch, activer port"],
      ["Caméra apparaît mais image noire", "Objectif obstrué ou IR défaillant", "Inspection physique", "Nettoyer objectif, vérifier les LEDs IR"],
      ["Image figée (image fixe)", "Câble réseau dégradé (perte de paquets)", "ping -t cam → voir perte %", "Remplacer câble Cat6"],
      ["Caméra offline intermittente", "Câble instable, mauvais contact RJ45", "Vérifier avec testeur câble", "Resertir les deux extrémités"],
      ["Image présente mais pas d'enregistrement", "Planning d'enregistrement désactivé", "NVR → Record Schedule", "Réactiver l'enregistrement"],
      ["NVR affiche 'Disk Full'", "Disque dur plein, écrasement désactivé", "NVR → HDD Management", "Activer Overwrite ou ajouter disque"],
      ["Caméra répond au ping mais absente NVR", "IP changée (DHCP attribué)", "Scanner 192.168.40.0/24 avec nmap", "Mettre IP statique sur la caméra"],
    ],
    [2000, 2000, 2000, 3026]
  ));

  c.push(h2("15.4 — DHCP ne fonctionne pas"));
  c.push(makeTable(
    ["Symptôme", "Cause", "Vérification", "Solution"],
    [
      ["PC reçoit 169.254.x.x", "Pas de réponse DHCP reçue", "ping du serveur DHCP", "Vérifier que le service DHCP est démarré"],
      ["PC reçoit une IP mais pas la bonne", "Deux serveurs DHCP en conflit", "MikroTik: ip dhcp-server print", "Désactiver le DHCP de la box opérateur"],
      ["Conflit d'adresses IP (2 PCs même IP)", "Adresse IP statique dupliquée", "arp -a pour voir les doublons MAC", "Corriger les IPs statiques en doublon"],
      ["DHCP pool épuisé", "Toutes les adresses sont attribuées", "MikroTik: ip dhcp-server lease print", "Élargir la plage ou réduire le bail"],
      ["DHCP fonctionne sur VLAN10 mais pas VLAN20", "DHCP relay (helper-address) manquant", "Vérifier interface VLAN20 sur routeur", "Ajouter /ip dhcp-relay sur MikroTik"],
    ],
    [2200, 2000, 2200, 2626]
  ));

  c.push(h2("15.5 — Wi-Fi lent ou instable"));
  c.push(makeTable(
    ["Symptôme", "Cause probable", "Outil de diagnostic", "Solution"],
    [
      ["Débit < 50 Mbps à 2m de l'AP", "Canal Wi-Fi saturé (interférences)", "WiFi Analyzer App → voir canaux utilisés", "Changer le canal sur l'AP (1, 6 ou 11 pour 2.4GHz)"],
      ["Déconnexions fréquentes (toutes les heures)", "Roaming agressif entre APs", "Logs AP → voir auth/deauth rapides", "Augmenter le seuil de roaming ou activer 802.11r"],
      ["Un seul endroit sans signal", "Obstacle béton ou mur épais", "Inspection physique et mesure signal", "Ajouter un AP dans cette zone"],
      ["Tout le monde lent quand > 20 clients", "AP saturé (trop de clients)", "Voir nb clients sur AP dans Omada", "Ajouter des APs, activer Band Steering 5GHz"],
      ["SSID visible mais refus de connexion", "Mauvaise clé WPA ou MAC filtering", "Vérifier PSK dans Omada Controller", "Corriger PSK ou désactiver MAC filtering"],
      ["AP en ligne mais pas d'IP distribuée", "VLAN trunk mal configuré vers l'AP", "Vérifier config trunk sur switch", "Autoriser le VLAN de l'AP sur le port trunk"],
    ],
    [2000, 2200, 2200, 2626]
  ));

  c.push(h2("15.6 — Boucle réseau (broadcast storm)"));
  c.push(p("Une boucle réseau est une urgence. Le réseau devient complètement inutilisable en quelques secondes. Vous entendez les switchs cliquer et voyez toutes les LEDs clignoter rapidement."));
  c.push(sp());
  c.push(ascii([
    "  CE QUI SE PASSE LORS D'UNE BOUCLE :",
    "",
    "  [Switch A] ──── Câble 1 ────> [Switch B]",
    "      │                              │",
    "      └──── Câble 2 (BOUCLE!) ───────┘",
    "",
    "  Un broadcast envoyé par A va vers B via câble 1,",
    "  puis retourne vers A via câble 2, et ainsi de suite",
    "  à la vitesse de la lumière... jusqu'à 100% du trafic.",
    "",
    "  SYMPTÔMES : réseau entier figé, LEDs clignotent vite,",
    "  CPU switch à 100%, plus aucune connexion possible.",
  ]));
  c.push(sp());
  c.push(step("1", "URGENCE : Trouver et retirer le câble de boucle", "Débranchez les câbles un par un depuis le switch le plus chargé. Dès que le réseau revient, vous avez trouvé le câble fautif."));
  c.push(sp());
  c.push(step("2", "Vérifier que STP est activé", "STP (Spanning Tree Protocol) aurait dû bloquer la boucle automatiquement. S'il ne l'a pas fait : vérifier sa configuration."));
  c.push(sp());
  c.push(step("3", "Activer BPDU Guard sur les ports access", "Cisco: spanning-tree bpduguard enable sur les ports. Si un switch est connecté sur un port access → port désactivé automatiquement."));
  c.push(sp());
  c.push(step("4", "Activer Storm Control", "Cisco: storm-control broadcast level 20 — limite les broadcasts à 20% du trafic maximum."));

  c.push(h2("15.7 — VLAN inaccessible"));
  c.push(makeTable(
    ["Symptôme", "Cause probable", "Vérification", "Solution"],
    [
      ["Un PC dans VLAN20 n'accède pas à Internet", "ACL bloque ou NAT absent", "Ping 192.168.20.1 (gateway)", "Vérifier règle NAT pour VLAN20"],
      ["VLAN20 ne peut pas joindre VLAN10", "Inter-VLAN routing désactivé", "Routage activé sur routeur ?", "Activer ip routing (Cisco L3) ou routes sur MikroTik"],
      ["Nouveau port configuré en VLAN20 mais pas d'IP", "PVID mal configuré sur le port", "show vlan brief — port dans bon VLAN?", "switchport access vlan 20 sur ce port"],
      ["VLAN40 inaccessible depuis VLAN10", "ACL CAMERAS-ISOLATED trop stricte", "Vérifier règles firewall", "Ajouter une exception pour VLAN10 → VLAN40"],
    ],
    [2200, 2000, 2200, 2626]
  ));

  c.push(h2("15.8 — NVR inaccessible"));
  c.push(makeTable(
    ["Problème", "Vérification", "Solution"],
    [
      ["Interface web NVR inaccessible en local", "ping 192.168.40.10 → répond ?", "Si non : vérifier câble et PoE. Si oui : essayer http ET https"],
      ["Accès distant (smartphone) KO", "Port 8000 ouvert sur firewall ?", "Vérifier NAT : port 8000 → 192.168.40.10:8000"],
      ["NVR en boucle de redémarrage", "Disque dur défaillant", "Retirer le disque, redémarrer NVR, remplacer le disque"],
      ["Enregistrement s'arrête après X jours", "Disque plein sans overwrite", "NVR → Maintenance → Enable Overwrite"],
      ["Mot de passe NVR oublié", "Reset usine nécessaire", "Bouton reset physique sur le NVR (attention : efface tout)"],
    ],
    [2500, 2500, 4026]
  ));

  c.push(pb());

  // Page finale
  c.push(ascii([
    "  ╔══════════════════════════════════════════════════════════════╗",
    "  ║         MANUEL RÉSEAU & VIDÉOSURVEILLANCE — v1.0             ║",
    "  ║                                                              ║",
    "  ║   Ce document est votre guide de référence sur le terrain.  ║",
    "  ║                                                              ║",
    "  ║   Cisco · MikroTik · Ubiquiti · TP-Link · Hikvision         ║",
    "  ║                                                              ║",
    "  ║   Pour toute question ou mise à jour :                       ║",
    "  ║   Consultez la documentation officielle des fabricants.      ║",
    "  ╚══════════════════════════════════════════════════════════════╝",
  ]));

  return c;
}

module.exports = { getSections11to15 };
