const { h1, h2, h3, h4, p, pb, sp, tip, warning, danger, info, check, tipLines, warnLines, infoLines, checkLines, step, code, codeTitle, li, ni, makeTable, divider, ascii, def } = require('./helpers');

function getSections6to10() {
  const c = [];

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 6 — PLAN D'ADRESSAGE IP
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 6 — PLAN D'ADRESSAGE IP"));
  c.push(p("L'adressage IP est la fondation de votre réseau. Une erreur ici crée des conflits qui font tomber des équipements entiers. Prenez le temps de bien comprendre avant de configurer quoi que ce soit."));

  c.push(h2("6.1 — Comprendre l'adresse IPv4 (pour les débutants)"));
  c.push(p("Une adresse IPv4 ressemble à : 192.168.10.5"));
  c.push(sp());
  c.push(ascii([
    "  192  .  168  .  10   .   5",
    "   │       │       │       │",
    "   └───────┴───────┘       └── Hôte (numéro de l'équipement)",
    "           │",
    "           └── Réseau (partie commune à tous les équipements du groupe)",
    "",
    "  Avec un masque /24 (255.255.255.0) :",
    "  ├── Partie réseau  : 192.168.10    (fixe)",
    "  └── Partie hôte    : .1 à .254    (variable — 254 équipements possibles)",
    "",
    "  Adresses réservées dans chaque réseau /24 :",
    "  192.168.10.0   = Adresse réseau  (jamais assignée à un équipement)",
    "  192.168.10.1   = Généralement le routeur (gateway)",
    "  192.168.10.255 = Adresse de broadcast (jamais assignée)",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Masque CIDR", "Notation décimale", "Nb d'hôtes utilisables", "Plage d'hôtes (ex réseau 192.168.10.x)"],
    [
      ["/24", "255.255.255.0", "254", "192.168.10.1 → 192.168.10.254"],
      ["/25", "255.255.255.128", "126", "192.168.10.1 → 192.168.10.126"],
      ["/26", "255.255.255.192", "62", "192.168.10.1 → 192.168.10.62"],
      ["/27", "255.255.255.224", "30", "192.168.10.1 → 192.168.10.30"],
      ["/28", "255.255.255.240", "14", "192.168.10.1 → 192.168.10.14"],
      ["/30", "255.255.255.252", "2", "Liens point-à-point entre routeurs"],
    ],
    [1200, 2000, 2000, 3826]
  ));
  c.push(sp());
  c.push(tip("Pour un VLAN avec maximum 50 équipements : utilisez un /26. Pour 100-254 équipements : un /24. Ne sur-dimensionnez pas inutilement — cela complique la gestion."));

  c.push(h2("6.2 — Plan d'adressage complet pour une PME"));
  c.push(p("Voici un plan standard pour une entreprise avec 8 VLANs. Adaptez les noms et quantités selon votre client."));
  c.push(sp());
  c.push(makeTable(
    ["ID VLAN", "Nom du VLAN", "Réseau", "Masque", "Gateway (Routeur)", "DHCP Range", "IP Statiques réservées"],
    [
      ["10", "Administration", "192.168.10.0", "/24", "192.168.10.1", ".10 → .150", ".2 à .9 (switchs, APs)"],
      ["20", "Comptabilité", "192.168.20.0", "/24", "192.168.20.1", ".10 → .100", ".2 à .9"],
      ["30", "Direction", "192.168.30.0", "/24", "192.168.30.1", ".10 → .50", ".2 à .9"],
      ["40", "Caméras / NVR", "192.168.40.0", "/24", "192.168.40.1", "Aucun DHCP", "Tout en statique"],
      ["50", "Wi-Fi Employés", "192.168.50.0", "/24", "192.168.50.1", ".10 → .200", ".2 à .9 (APs)"],
      ["60", "Serveurs", "192.168.60.0", "/24", "192.168.60.1", "Aucun DHCP", "Tout en statique"],
      ["70", "Téléphonie IP", "192.168.70.0", "/24", "192.168.70.1", ".10 → .100", ".2 à .9"],
      ["99", "Wi-Fi Invités", "192.168.99.0", "/24", "192.168.99.1", ".10 → .250", "Aucune"],
    ],
    [800, 1500, 1500, 800, 1800, 1500, 2126]
  ));
  c.push(sp());
  c.push(info("Le VLAN 40 (Caméras) n'a pas de DHCP. Chaque caméra reçoit une adresse IP statique configurée manuellement. Cela évite qu'une caméra change d'adresse IP et disparaisse du NVR."));

  c.push(h2("6.3 — Registre complet des adresses IP statiques"));
  c.push(p("Remplissez ce tableau pour CHAQUE équipement qui a une adresse IP fixe. Conservez-le précieusement."));
  c.push(sp());
  c.push(makeTable(
    ["Équipement", "Hostname", "VLAN", "Adresse IP", "Masque", "Gateway", "DNS", "Emplacement"],
    [
      ["Routeur/FW — Interface LAN", "RTR-MAIN-01", "Trunk", "192.168.1.1", "/24", "—", "8.8.8.8", "Rack U6"],
      ["Switch Core principal", "SW-CORE-01", "Mgmt=10", "192.168.10.2", "/24", "192.168.10.1", "192.168.10.1", "Rack U3"],
      ["Switch PoE étage 1", "SW-POE-01", "Mgmt=10", "192.168.10.3", "/24", "192.168.10.1", "192.168.10.1", "Rack U4"],
      ["Switch PoE étage 2", "SW-POE-02", "Mgmt=10", "192.168.10.4", "/24", "192.168.10.1", "192.168.10.1", "Armoire Ét.2"],
      ["AP Wi-Fi Bureau 1", "AP-BUREAU-01", "50", "192.168.50.2", "/24", "192.168.50.1", "192.168.10.1", "Plafond Bureau 01"],
      ["AP Wi-Fi Couloir", "AP-COULOIR-01", "50", "192.168.50.3", "/24", "192.168.50.1", "192.168.10.1", "Plafond Couloir"],
      ["Serveur Windows AD/DNS", "SRV-AD-01", "60", "192.168.60.10", "/24", "192.168.60.1", "127.0.0.1", "Rack U8"],
      ["NAS Synology", "NAS-01", "60", "192.168.60.20", "/24", "192.168.60.1", "192.168.60.10", "Rack U9"],
      ["NVR Hikvision 16 voies", "NVR-01", "40", "192.168.40.10", "/24", "192.168.40.1", "—", "Rack U7"],
      ["Caméra — Entrée principale", "CAM-ENTREE-01", "40", "192.168.40.21", "/24", "192.168.40.1", "—", "Entrée — 2.5m"],
      ["Caméra — Couloir RDC", "CAM-COULOIR-01", "40", "192.168.40.22", "/24", "192.168.40.1", "—", "Couloir — 3m"],
      ["Caméra — Parking", "CAM-PARKING-01", "40", "192.168.40.23", "/24", "192.168.40.1", "—", "Façade ext. — 4m"],
      ["Imprimante réseau", "PRINT-RH-01", "10", "192.168.10.200", "/24", "192.168.10.1", "192.168.10.1", "Bureau RH"],
    ],
    [1800, 1600, 600, 1400, 700, 1400, 1400, 1126]
  ));

  c.push(h2("6.4 — Comment configurer une adresse IP statique sur les équipements"));
  c.push(h3("Sur Windows 10/11"));
  c.push(step("1", "Ouvrir les paramètres réseau", "Clic droit sur l'icône réseau dans la barre des tâches → 'Ouvrir les paramètres réseau et Internet'"));
  c.push(sp());
  c.push(step("2", "Accéder aux propriétés de la carte", "Cliquez sur 'Modifier les options de carte' → clic droit sur 'Ethernet' → Propriétés"));
  c.push(sp());
  c.push(step("3", "Configurer IPv4", "Double-cliquez sur 'Protocole Internet version 4 (TCP/IPv4)' → Cochez 'Utiliser l'adresse IP suivante' et renseignez :"));
  c.push(sp());
  c.push(ascii([
    "  Adresse IP     : 192.168.10.15  ← Adresse unique pour ce PC",
    "  Masque         : 255.255.255.0  ← /24",
    "  Passerelle     : 192.168.10.1   ← Adresse du routeur",
    "  DNS préféré    : 192.168.60.10  ← Serveur DNS interne",
    "  DNS auxiliaire : 8.8.8.8        ← DNS Google en secours",
  ]));
  c.push(sp());
  c.push(h3("Sur Linux (Ubuntu/Debian) — via Netplan"));
  c.push(codeTitle("Éditer /etc/netplan/00-installer-config.yaml"));
  c.push(code("network:"));
  c.push(code("  version: 2"));
  c.push(code("  ethernets:"));
  c.push(code("    ens18:                            # Nom de l'interface (vérifier avec: ip link show)"));
  c.push(code("      dhcp4: no                       # Désactiver DHCP"));
  c.push(code("      addresses:"));
  c.push(code("        - 192.168.60.10/24            # IP statique + masque"));
  c.push(code("      routes:"));
  c.push(code("        - to: default"));
  c.push(code("          via: 192.168.60.1           # Gateway"));
  c.push(code("      nameservers:"));
  c.push(code("        addresses: [192.168.60.10, 8.8.8.8]  # DNS"));
  c.push(code("sudo netplan apply                    # Appliquer la configuration"));
  c.push(sp());
  c.push(warning("Vérifiez toujours le nom de votre interface réseau avec 'ip link show' avant d'éditer le fichier Netplan. Le nom peut être ens18, eth0, enp0s3, etc."));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 7 — INSTALLATION PHYSIQUE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 7 — INSTALLATION PHYSIQUE ÉTAPE PAR ÉTAPE"));
  c.push(p("L'installation physique est le travail le plus visible pour le client. Un câblage propre, bien étiqueté et bien rangé est la signature d'un professionnel. Un câblage en désordre crée des pannes impossibles à diagnostiquer."));
  c.push(sp());
  c.push(tip("Règle d'or : posez les goulottes avant de passer les câbles. Posez tous les câbles avant de sertir les extrémités. Sertissez et testez avant de raccorder au patch panel."));

  c.push(h2("7.1 — Ordre d'installation recommandé"));
  c.push(sp());
  c.push(step("1", "Installer le rack et l'onduleur", "Fixez le rack au mur ou posez-le sur ses pieds. Installez l'onduleur. Câblez l'alimentation électrique. NE branchez PAS encore les équipements actifs."));
  c.push(sp());
  c.push(step("2", "Poser les goulottes (chemins de câbles)", "Tracer, percer, fixer. Du rack vers chaque pièce. Cette étape peut prendre 1 à 2 jours sur un grand site."));
  c.push(sp());
  c.push(step("3", "Passer tous les câbles", "Faites passer tous les câbles dans les goulottes avant de sertir. Laissez 2 mètres de mou de chaque côté (rack et prise murale)."));
  c.push(sp());
  c.push(step("4", "Installer les prises murales (côté utilisateur)", "Dénuder, raccorder sur le keystone (T568B), clipser dans la plaque murale."));
  c.push(sp());
  c.push(step("5", "Sertir et raccorder au patch panel (côté rack)", "Raccorder les câbles sur le patch panel en respectant l'ordre de numérotation."));
  c.push(sp());
  c.push(step("6", "Tester tous les câbles", "Avec le testeur RJ45 : chaque câble doit passer avant de monter les équipements."));
  c.push(sp());
  c.push(step("7", "Monter les équipements actifs dans le rack", "Installer switch, routeur, patch panel dans l'ordre du rack."));
  c.push(sp());
  c.push(step("8", "Brasser (relier patch panel ↔ switch)", "Cordons de brassage courts et colorés par VLAN."));
  c.push(sp());
  c.push(step("9", "Installer les APs et caméras", "Une fois le réseau actif et testé, monter les équipements en hauteur."));
  c.push(sp());
  c.push(step("10", "Étiqueter TOUT", "Chaque câble, chaque port de switch, chaque prise murale. C'est la dernière étape mais pas la moins importante."));

  c.push(h2("7.2 — Pose des goulottes — guide détaillé"));
  c.push(ascii([
    "  VUE EN COUPE D'UN MUR AVEC GOULOTTE :",
    "",
    "  ┌──────────────────────────────────────┐  Plafond",
    "  │                                      │",
    "  │     [GOULOTTE 60x40 principale]      │  ← Chemin horizontal",
    "  │         │                            │",
    "  │         │ dérivation 40x20           │",
    "  │         │                            │",
    "  │         ▼                            │",
    "  │   [PRISE MURALE]  ← h = 30 cm        │  ← Standard France/Haïti",
    "  │   (ou h = 100 cm pour bureau)        │",
    "  │                                      │",
    "  └──────────────────────────────────────┘  Sol",
    "",
    "  HAUTEUR STANDARD DES PRISES :",
    "  30 cm du sol  = standard résidentiel",
    "  100 cm du sol = standard bureau / plan de travail",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Étape", "Action", "Outil nécessaire", "Conseil pro"],
    [
      ["Tracé", "Tracer le chemin à la règle et au cordeau avant de percer", "Cordeau à tracer", "Toujours horizontal/vertical, jamais en diagonale"],
      ["Perçage", "Percer les trous de fixation (tous les 40-50 cm)", "Perceuse + chevilles", "Béton : foret béton 6mm. Placo : cheville à expansion"],
      ["Fixation fond", "Visser le fond de goulotte aux chevilles", "Tournevis ou visseuse", "Serrez fermement — la goulotte doit être rigide"],
      ["Passage câbles", "Faire passer les câbles dans la goulotte ouverte", "Aiguille à passer", "Ne jamais forcer — utilisez du talc si résistance"],
      ["Fermeture couvercle", "Clipser le couvercle par pression", "À la main ou maillet plastique", "Vérifier que le couvercle est bien encliqueté partout"],
      ["Jonctions", "Utiliser les angles et dérivations préfabriqués", "Ciseau ou scie", "Pas de découpe sauvage — ça fait amateur"],
    ],
    [1000, 2400, 1800, 3826]
  ));
  c.push(sp());
  c.push(warnLines("RÈGLES DE SÉCURITÉ POUR LE CÂBLAGE", [
    "Séparez PHYSIQUEMENT les câbles réseau (courants faibles) des câbles électriques 220V (courants forts) — distance minimale 20 cm",
    "Si croisement obligatoire : croiser à 90° et jamais en parallèle",
    "Ne jamais dépasser la capacité de remplissage d'une goulotte (max 60% pour dissipation thermique)",
    "Toujours laisser un espace libre dans la goulotte pour les extensions futures",
  ]));

  c.push(h2("7.3 — Sertissage RJ45 — guide pas à pas pour débutant"));
  c.push(p("Le sertissage est la technique qui consiste à poser un connecteur RJ45 sur un câble réseau. C'est une compétence qui s'acquiert avec la pratique."));
  c.push(sp());
  c.push(ascii([
    "  STANDARD T568B (le plus utilisé en entreprise) :",
    "",
    "  Pin  Couleur         Rôle",
    "  ─────────────────────────────────",
    "   1   Blanc/Orange    TX+ (émission +)",
    "   2   Orange          TX- (émission -)",
    "   3   Blanc/Vert      RX+ (réception +)",
    "   4   Bleu            Inutilisé (PoE)",
    "   5   Blanc/Bleu      Inutilisé (PoE)",
    "   6   Vert            RX- (réception -)",
    "   7   Blanc/Brun      Inutilisé (PoE)",
    "   8   Brun            Inutilisé (PoE)",
    "",
    "  MOYEN MNÉMOTECHNIQUE :",
    "  'B-O-BV-Bl-BlB-V-VB-Br'",
    "  (Blanc-Orange | Orange | Blanc-Vert | Bleu | Blanc-Bleu | Vert | Blanc-Brun | Brun)",
  ]));
  c.push(sp());
  c.push(step("1", "Dénuder le câble sur 3 cm", "Utilisez l'outil de dénudage (jamais un couteau). Faites tourner l'outil autour du câble sans appuyer fort pour ne pas entailler les fils. Retirez la gaine extérieure."));
  c.push(sp());
  c.push(step("2", "Dépairer et défriser les fils", "Séparez les 4 paires torsadées. Dépliez chaque fil et essayez de le rendre droit entre vos doigts. Gardez les fils en ordre T568B."));
  c.push(sp());
  c.push(step("3", "Couper les fils à 1.5 cm de la gaine", "Tous les fils doivent avoir exactement la même longueur. Utilisez la lame de votre pince à sertir pour couper proprement."));
  c.push(sp());
  c.push(step("4", "Insérer dans le connecteur RJ45", "Tenez les fils en T568B dans l'ordre. Introduisez-les dans le connecteur en vérifiant que chaque fil va jusqu'au bout (visible dans les fenêtres en cuivre)."));
  c.push(sp());
  c.push(step("5", "Sertir avec la pince", "Posez le connecteur dans la pince. Serrez à fond jusqu'au clic. Les 8 broches en cuivre s'enfoncent dans les fils. La gaine doit être serrée dans le connecteur."));
  c.push(sp());
  c.push(step("6", "Tester le câble", "Branchez les deux extrémités dans votre testeur. Les 8 voyants doivent s'allumer dans l'ordre : 1-2-3-4-5-6-7-8. Si un voyant manque ou est inversé, recommencez l'extrémité défectueuse."));
  c.push(sp());
  c.push(danger("Si les voyants 3 et 6 sont inversés, vous avez mélangé T568A et T568B. Si un voyant manque, un fil est mal enfoncé ou cassé. Coupez le connecteur et recommencez."));

  c.push(h2("7.4 — Raccordement keystone (prise murale)"));
  c.push(ascii([
    "  KEYSTONE RJ45 (vue de dessus, type 110) :",
    "",
    "  ┌─────────────────────────────────────┐",
    "  │  Bleu    Blanc/Bleu                 │",
    "  │  ────    ──────────                 │",
    "  │                                     │",
    "  │  Orange  Blanc/Orange               │",
    "  │  ──────  ────────────               │",
    "  │                     [ RJ45 femelle ]│",
    "  │  Vert    Blanc/Vert                 │",
    "  │  ─────   ──────────                 │",
    "  │                                     │",
    "  │  Brun    Blanc/Brun                 │",
    "  └─────────────────────────────────────┘",
    "",
    "  Suivez le marquage de couleur IMPRIMÉ sur le keystone.",
    "  Posez le fil dans la fente et enfoncez avec l'outil punch-down.",
    "  Le fil se coupe automatiquement à la longueur correcte.",
  ]));
  c.push(sp());
  c.push(tip("Les keystones ont deux faces : une marquée T568A et une T568B. Respectez TOUJOURS le même standard sur l'ensemble de l'installation. T568B est le standard entreprise."));

  c.push(h2("7.5 — Organisation du rack — brassage professionnel"));
  c.push(ascii([
    "  BRASSAGE PROPRE :",
    "",
    "  PATCH PANEL        SWITCH CORE",
    "  ┌──────────────┐   ┌──────────────┐",
    "  │ P1 P2 P3 P4  │   │ G1 G2 G3 G4  │",
    "  └──┬──┬──┬──┬──┘   └──┬──┬──┬──┬──┘",
    "     │  │  │  │          │  │  │  │",
    "     └──┘  └──┘          └──┘  └──┘",
    "    Cordons courts (0.5m) organisés par couleur",
    "",
    "  RÈGLE DE COULEUR RECOMMANDÉE :",
    "  Bleu   = VLAN 10 (Administration)",
    "  Vert   = VLAN 20 (Comptabilité)",
    "  Jaune  = VLAN 40 (Caméras)",
    "  Rouge  = VLAN 99 (Invités)",
    "  Gris   = Liens uplink (trunk)",
    "  Orange = Ports serveurs",
  ]));

  c.push(h2("7.6 — Étiquetage — la signature d'un professionnel"));
  c.push(p("Un réseau sans étiquettes est un réseau qu'on ne peut pas maintenir. Un réseau bien étiqueté permet de diagnostiquer une panne en 5 minutes au lieu de 2 heures."));
  c.push(sp());
  c.push(makeTable(
    ["Quoi étiqueter", "Format d'étiquette", "Exemple"],
    [
      ["Chaque câble (les DEUX bouts)", "[BÂTIMENT]-[ÉTAGE]-[PIÈCE]-[N°PRISE]", "A-1-BUR01-P1"],
      ["Chaque port du patch panel", "Numéro correspondant à la prise murale", "Port 1 → A-1-BUR01-P1"],
      ["Chaque port du switch", "Nom de l'équipement connecté", "PC-MARIE ou AP-BUREAU-01"],
      ["Chaque équipement dans le rack", "Hostname + adresse IP de gestion", "SW-CORE-01 — 192.168.10.2"],
      ["Chaque prise murale", "Son numéro de port dans le patch panel", "PORT 05"],
      ["Les cordons de brassage", "Étiquette de couleur VLAN", "Bleu = VLAN10"],
    ],
    [2200, 3000, 3826]
  ));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 8 — CONFIGURATION COMPLÈTE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 8 — CONFIGURATION RÉSEAU COMPLÈTE"));
  c.push(p("Cette partie couvre la configuration logicielle de tous les équipements. Chaque technologie est expliquée avec son rôle, puis la procédure de configuration."));

  c.push(h2("8.1 — Configuration du Switch Manageable (TP-Link Omada)"));
  c.push(h3("Accès initial au switch"));
  c.push(p("Un switch TP-Link neuf est accessible à l'adresse IP par défaut : 192.168.0.1"));
  c.push(sp());
  c.push(step("1", "Brancher un PC directement sur le port 1 du switch", "Avec un câble Cat6. Pas encore branché au réseau."));
  c.push(sp());
  c.push(step("2", "Configurer le PC en IP statique temporaire", "Adresse : 192.168.0.10 / Masque : 255.255.255.0 / Gateway : 192.168.0.1"));
  c.push(sp());
  c.push(step("3", "Ouvrir le navigateur web", "Taper http://192.168.0.1 — Interface web du switch. Login : admin / Mot de passe : admin (changer immédiatement!)"));
  c.push(sp());
  c.push(step("4", "Changer le mot de passe par défaut", "Aller dans System > User Management > changer le mot de passe admin. C'est OBLIGATOIRE."));
  c.push(sp());
  c.push(danger("Ne jamais laisser le mot de passe par défaut sur un équipement réseau. C'est la première chose qu'un attaquant essaie."));
  c.push(sp());
  c.push(h3("Création des VLANs sur le switch TP-Link"));
  c.push(p("Aller dans : L2 Features → 802.1Q VLAN → VLAN Config"));
  c.push(sp());
  c.push(makeTable(
    ["VLAN ID", "VLAN Name", "Action dans l'interface"],
    [
      ["10", "ADMINISTRATION", "Cliquer 'Add' → VLAN ID: 10 → Name: ADMINISTRATION → Save"],
      ["20", "COMPTABILITE", "Cliquer 'Add' → VLAN ID: 20 → Name: COMPTABILITE → Save"],
      ["40", "CAMERAS", "Cliquer 'Add' → VLAN ID: 40 → Name: CAMERAS → Save"],
      ["50", "WIFI-STAFF", "Cliquer 'Add' → VLAN ID: 50 → Name: WIFI-STAFF → Save"],
      ["99", "INVITES", "Cliquer 'Add' → VLAN ID: 99 → Name: INVITES → Save"],
    ],
    [1200, 1800, 6026]
  ));
  c.push(sp());
  c.push(h3("Configuration des ports Access et Trunk"));
  c.push(p("Aller dans : L2 Features → 802.1Q VLAN → Port Config"));
  c.push(sp());
  c.push(makeTable(
    ["Port", "Type", "VLAN", "Action"],
    [
      ["Port 1-6", "Access", "VLAN 10", "Link Type: Access, PVID: 10"],
      ["Port 7-12", "Access", "VLAN 20", "Link Type: Access, PVID: 20"],
      ["Port 13-20", "Access", "VLAN 40", "Link Type: Access, PVID: 40"],
      ["Port 21-22", "Access", "VLAN 50", "Link Type: Access, PVID: 50"],
      ["Port 23", "Trunk", "Tous VLANs", "Link Type: Trunk, Allowed VLANs: 10,20,40,50,99"],
      ["Port 24", "Trunk", "Tous VLANs", "Link Type: Trunk (lien vers routeur), Allowed: All"],
    ],
    [1200, 1000, 1200, 5626]
  ));

  c.push(h2("8.2 — Configuration du Routeur MikroTik (via Winbox)"));
  c.push(p("Winbox est l'outil de configuration graphique de MikroTik. Téléchargeable gratuitement sur mikrotik.com."));
  c.push(sp());
  c.push(h3("Connexion initiale à MikroTik"));
  c.push(step("1", "Télécharger Winbox", "mikrotik.com/download → Winbox (Windows). MAC-address discovery permet de se connecter même sans IP configurée."));
  c.push(sp());
  c.push(step("2", "Se connecter par adresse MAC", "Dans Winbox : onglet 'Neighbors' → votre routeur apparaît avec son adresse MAC → cliquer → Login: admin / Password: vide (laisser vide) → Connect"));
  c.push(sp());
  c.push(step("3", "Changer le mot de passe", "System → Users → admin → double-clic → Password → entrer un nouveau mot de passe fort → OK"));
  c.push(sp());
  c.push(h3("Configuration des interfaces VLAN"));
  c.push(codeTitle("Dans Winbox : Interfaces → Add (+) → VLAN"));
  c.push(code("VLAN 10 :  Name: vlan10  VLAN ID: 10   Interface: ether2 (lien vers switch)"));
  c.push(code("VLAN 20 :  Name: vlan20  VLAN ID: 20   Interface: ether2"));
  c.push(code("VLAN 40 :  Name: vlan40  VLAN ID: 40   Interface: ether2"));
  c.push(code("VLAN 50 :  Name: vlan50  VLAN ID: 50   Interface: ether2"));
  c.push(code("VLAN 99 :  Name: vlan99  VLAN ID: 99   Interface: ether2"));
  c.push(sp());
  c.push(h3("Attribution des adresses IP sur chaque VLAN"));
  c.push(codeTitle("IP → Addresses → Add (+)"));
  c.push(code("192.168.10.1/24  →  Interface: vlan10"));
  c.push(code("192.168.20.1/24  →  Interface: vlan20"));
  c.push(code("192.168.40.1/24  →  Interface: vlan40"));
  c.push(code("192.168.50.1/24  →  Interface: vlan50"));
  c.push(code("192.168.99.1/24  →  Interface: vlan99"));
  c.push(sp());
  c.push(h3("Configuration DHCP par VLAN"));
  c.push(codeTitle("IP → Pool → Add (+) : créer les plages d'adresses"));
  c.push(code("pool-vlan10 :  192.168.10.10 - 192.168.10.150"));
  c.push(code("pool-vlan20 :  192.168.20.10 - 192.168.20.100"));
  c.push(code("pool-vlan50 :  192.168.50.10 - 192.168.50.200"));
  c.push(code("pool-vlan99 :  192.168.99.10 - 192.168.99.250"));
  c.push(sp());
  c.push(codeTitle("IP → DHCP Server → Add (+) : créer les serveurs DHCP"));
  c.push(code("Name: dhcp-vlan10   Interface: vlan10   Pool: pool-vlan10   Lease: 1d"));
  c.push(code("Name: dhcp-vlan20   Interface: vlan20   Pool: pool-vlan20   Lease: 1d"));
  c.push(code("Name: dhcp-vlan50   Interface: vlan50   Pool: pool-vlan50   Lease: 8h"));
  c.push(code("Name: dhcp-vlan99   Interface: vlan99   Pool: pool-vlan99   Lease: 2h"));
  c.push(sp());
  c.push(codeTitle("IP → DHCP Server → Networks : configurer les options par réseau"));
  c.push(code("192.168.10.0/24  Gateway: 192.168.10.1  DNS: 192.168.60.10,8.8.8.8"));
  c.push(code("192.168.20.0/24  Gateway: 192.168.20.1  DNS: 192.168.60.10,8.8.8.8"));
  c.push(code("192.168.50.0/24  Gateway: 192.168.50.1  DNS: 8.8.8.8,1.1.1.1"));
  c.push(code("192.168.99.0/24  Gateway: 192.168.99.1  DNS: 8.8.8.8,1.1.1.1"));

  c.push(h3("NAT — Partage de l'accès Internet"));
  c.push(p("Le NAT permet à tous les équipements du réseau interne de sortir sur Internet avec une seule adresse IP publique."));
  c.push(codeTitle("IP → Firewall → NAT → Add (+)"));
  c.push(code("Chain: srcnat         ← Trafic sortant"));
  c.push(code("Out Interface: ether1 ← Interface WAN (Internet)"));
  c.push(code("Action: masquerade    ← Remplace l'IP privée par l'IP publique"));
  c.push(sp());

  c.push(h3("Firewall — Bloquer le VLAN Invités du réseau interne"));
  c.push(p("Les invités doivent accéder à Internet uniquement. Ils ne doivent PAS accéder aux serveurs, aux caméras ou aux PCs des employés."));
  c.push(codeTitle("IP → Firewall → Filter Rules → Add (+)"));
  c.push(code("Chain: forward"));
  c.push(code("Src Address: 192.168.99.0/24    ← VLAN Invités"));
  c.push(code("Dst Address: 192.168.0.0/16     ← Tout le réseau interne"));
  c.push(code("Action: drop                    ← Bloquer"));
  c.push(code("Comment: BLOCK-GUESTS-TO-LAN"));

  c.push(h2("8.3 — Configuration Wi-Fi (TP-Link Omada Controller)"));
  c.push(p("Omada Controller est le logiciel de gestion centralisée des APs TP-Link. Il se télécharge gratuitement sur tp-link.com."));
  c.push(sp());
  c.push(step("1", "Installer Omada Controller", "Sur un PC ou serveur Windows/Linux. Accéder via http://localhost:8043 après installation."));
  c.push(sp());
  c.push(step("2", "Adopter les APs", "Les APs TP-Link sur le même réseau apparaissent automatiquement dans l'onglet 'Devices'. Cliquer 'Adopt' pour chaque AP."));
  c.push(sp());
  c.push(step("3", "Créer le profil Wi-Fi Employés", "Settings → Wireless Networks → Add → Remplir :"));
  c.push(sp());
  c.push(makeTable(
    ["Paramètre", "Valeur", "Explication"],
    [
      ["SSID Name", "ENTREPRISE-STAFF", "Nom du réseau visible par les appareils"],
      ["Security", "WPA3-SAE / WPA2-PSK", "WPA3 si tous les appareils le supportent, sinon WPA2"],
      ["Password", "Mot de passe fort 20 chars", "Jamais le nom de l'entreprise ou une date"],
      ["VLAN", "10", "Les appareils connectés à ce SSID seront dans VLAN10"],
      ["Band Steering", "Activé", "Force les appareils récents sur le 5 GHz (plus rapide)"],
      ["Fast Roaming", "Activé (802.11r)", "Passage transparent entre APs sans coupure"],
      ["Schedule", "Pas de schedule", "Réseau disponible 24h/24"],
    ],
    [2000, 2500, 4526]
  ));
  c.push(sp());
  c.push(step("4", "Créer le profil Wi-Fi Invités", "Settings → Wireless Networks → Add → SSID: VISITEURS / Security: WPA2 / VLAN: 99 / Portal: Enabled (portail captif)"));
  c.push(sp());
  c.push(step("5", "Configurer le portail captif", "Settings → Hotspot → Create Portal → Simple Password ou No Authentication → Termes d'utilisation → Durée de session: 4h → Débit max: 5 Mbps"));

  c.push(h2("8.4 — Configuration VPN WireGuard (télétravail)"));
  c.push(p("WireGuard est le VPN le plus moderne et le plus simple à configurer. Il permet aux employés en télétravail d'accéder au réseau de l'entreprise de façon sécurisée."));
  c.push(sp());
  c.push(ascii([
    "  TÉLÉTRAVAIL — COMMENT ÇA FONCTIONNE :",
    "",
    "  [PC Domicile]──── Internet ────[ROUTEUR ENTREPRISE]",
    "       │                                │",
    "       │    Tunnel WireGuard chiffré    │",
    "       │    (personne ne peut lire      │",
    "       │     ce qui y passe)            │",
    "       │◄──────────────────────────────►│",
    "       │                                │",
    "  L'employé voit le réseau              │",
    "  interne comme s'il était              │",
    "  physiquement au bureau    [Serveurs, NAS, Imprimantes]",
  ]));
  c.push(sp());
  c.push(codeTitle("Sur MikroTik — Activer WireGuard (via terminal ou SSH)"));
  c.push(code("/interface wireguard add name=wg0 listen-port=51820 comment=\"VPN-TELETRAVAIL\""));
  c.push(code("# Voir la clé publique du serveur (à donner aux clients)"));
  c.push(code("/interface wireguard print"));
  c.push(sp());
  c.push(codeTitle("Ajouter un utilisateur (peer)"));
  c.push(code("/interface wireguard peers add \\"));
  c.push(code("  interface=wg0 \\"));
  c.push(code("  public-key=\"CLE-PUBLIQUE-DU-CLIENT\" \\"));
  c.push(code("  allowed-address=10.0.0.2/32 \\"));
  c.push(code("  comment=\"VPN-Marie-RH\""));
  c.push(sp());
  c.push(tip("Pour configurer le client WireGuard sur le PC de l'employé : télécharger l'application WireGuard (wireguard.com), générer les clés sur le client, et donner la clé publique à l'administrateur."));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 9 — COMMANDES
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 9 — COMMANDES PAR PLATEFORME"));
  c.push(p("Cette partie est votre référence de terrain. Chaque commande est expliquée : son rôle, quand l'utiliser, la syntaxe exacte, un exemple réel et les erreurs possibles."));

  c.push(h2("9.1 — Cisco IOS — Commandes essentielles"));
  c.push(info("Cisco utilise un système de modes : Mode USER (>), Mode PRIVILEGED (#), Mode CONFIGURATION (config)#. Pour passer d'un mode à l'autre : 'enable' puis 'configure terminal'."));
  c.push(sp());
  c.push(ascii([
    "  HIÉRARCHIE DES MODES CISCO :",
    "",
    "  Switch>              ← Mode User (lecture seule)",
    "      │ enable",
    "  Switch#              ← Mode Privilegié (show, debug, copy)",
    "      │ configure terminal",
    "  Switch(config)#      ← Mode Configuration globale",
    "      │ interface Gi0/1",
    "  Switch(config-if)#   ← Mode Configuration interface",
    "      │ exit",
    "  Switch(config)#      ← Retour config globale",
    "      │ end (ou Ctrl+Z)",
    "  Switch#              ← Retour mode privilegié",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Commande", "Mode", "Rôle", "Exemple"],
    [
      ["enable", "User >", "Passer en mode privilégié", "Switch> enable"],
      ["configure terminal", "Privilegié #", "Entrer en configuration", "Switch# configure terminal"],
      ["show running-config", "Privilegié #", "Afficher la config active complète", "Switch# show running-config"],
      ["show interfaces status", "Privilegié #", "État de tous les ports (up/down/speed)", "Switch# show interfaces status"],
      ["show vlan brief", "Privilegié #", "Liste des VLANs et ports associés", "Switch# show vlan brief"],
      ["show interfaces trunk", "Privilegié #", "Ports trunk actifs et VLANs transportés", "Switch# show interfaces trunk"],
      ["show ip interface brief", "Privilegié #", "Interfaces IP et leur état", "Switch# show ip interface brief"],
      ["show spanning-tree", "Privilegié #", "État STP sur tous les VLANs", "Switch# show spanning-tree"],
      ["show mac address-table", "Privilegié #", "Table MAC : quel PC est sur quel port", "Switch# show mac address-table"],
      ["show arp", "Privilegié #", "Table ARP : correspondances IP ↔ MAC", "Switch# show arp"],
      ["copy running-config startup-config", "Privilegié #", "SAUVEGARDER la configuration", "Switch# copy run start"],
      ["reload", "Privilegié #", "Redémarrer le switch", "Switch# reload"],
      ["hostname SW-CORE-01", "Config (config)#", "Changer le nom du switch", "Switch(config)# hostname SW-CORE-01"],
      ["no shutdown", "Config-if", "Activer un port désactivé", "SW-CORE-01(config-if)# no shutdown"],
      ["shutdown", "Config-if", "Désactiver un port", "SW-CORE-01(config-if)# shutdown"],
    ],
    [2800, 1400, 2600, 2226]
  ));
  c.push(sp());
  c.push(codeTitle("Configuration complète d'un switch Cisco — exemple type PME"));
  c.push(code("! ─── Sécurité de base ───"));
  c.push(code("hostname SW-CORE-01"));
  c.push(code("enable secret MonMotDePasseAdmin!2025  ! Mot de passe mode privilégié chiffré"));
  c.push(code("service password-encryption            ! Chiffrer tous les mots de passe en clair"));
  c.push(code("banner motd ^ ACCES AUTORISE UNIQUEMENT — Toute intrusion sera poursuivie ^"));
  c.push(code("no ip http server                      ! Désactiver l'interface web non sécurisée"));
  c.push(code("ip http secure-server                  ! Activer uniquement HTTPS"));
  c.push(code("!"));
  c.push(code("! ─── SSH v2 (remplacer Telnet) ───"));
  c.push(code("ip domain-name entreprise.local"));
  c.push(code("crypto key generate rsa modulus 2048   ! Générer les clés SSH"));
  c.push(code("ip ssh version 2"));
  c.push(code("line vty 0 15"));
  c.push(code(" transport input ssh                   ! SSH uniquement, pas Telnet"));
  c.push(code(" login local"));
  c.push(code("username admin privilege 15 secret MonMotDePasseSSH!2025"));
  c.push(code("!"));
  c.push(code("! ─── VLANs ───"));
  c.push(code("vlan 10"));
  c.push(code(" name ADMINISTRATION"));
  c.push(code("vlan 20"));
  c.push(code(" name COMPTABILITE"));
  c.push(code("vlan 40"));
  c.push(code(" name CAMERAS"));
  c.push(code("vlan 50"));
  c.push(code(" name WIFI-STAFF"));
  c.push(code("vlan 99"));
  c.push(code(" name INVITES"));
  c.push(code("!"));
  c.push(code("! ─── Ports Access (exemple : port 1 → VLAN Administration) ───"));
  c.push(code("interface range GigabitEthernet0/1 - 6"));
  c.push(code(" description VLAN10-ADMINISTRATION"));
  c.push(code(" switchport mode access"));
  c.push(code(" switchport access vlan 10"));
  c.push(code(" spanning-tree portfast       ! Connexion immédiate (pas d'attente STP)"));
  c.push(code(" spanning-tree bpduguard enable ! Sécurité : bloque si un switch est connecté ici"));
  c.push(code(" no shutdown"));
  c.push(code("!"));
  c.push(code("! ─── Port Trunk (port 24 → routeur) ───"));
  c.push(code("interface GigabitEthernet0/24"));
  c.push(code(" description TRUNK-VERS-ROUTEUR"));
  c.push(code(" switchport trunk encapsulation dot1q  ! Encapsulation 802.1Q"));
  c.push(code(" switchport mode trunk"));
  c.push(code(" switchport trunk allowed vlan 10,20,40,50,99"));
  c.push(code(" no shutdown"));
  c.push(code("!"));
  c.push(code("! ─── Interface de gestion (SVI) ───"));
  c.push(code("interface vlan 10"));
  c.push(code(" description INTERFACE-MGMT"));
  c.push(code(" ip address 192.168.10.2 255.255.255.0"));
  c.push(code(" no shutdown"));
  c.push(code("ip default-gateway 192.168.10.1"));
  c.push(code("!"));
  c.push(code("! ─── Sauvegarder ───"));
  c.push(code("copy running-config startup-config"));

  c.push(h2("9.2 — MikroTik RouterOS — Commandes CLI complètes"));
  c.push(info("MikroTik peut se configurer via Winbox (interface graphique) ou via SSH/console (ligne de commande). Ces commandes sont pour le CLI — plus rapide pour les configurations répétitives."));
  c.push(sp());
  c.push(makeTable(
    ["Commande", "Rôle", "Exemple"],
    [
      ["/system identity print", "Voir le nom du routeur", "Affiche: name: RTR-MAIN-01"],
      ["/interface print", "Lister toutes les interfaces", "Affiche: ether1, ether2, vlan10..."],
      ["/ip address print", "Voir toutes les adresses IP configurées", "Affiche: 192.168.10.1/24 vlan10"],
      ["/ip route print", "Table de routage complète", "Affiche les routes statiques et dynamiques"],
      ["/ip dhcp-server lease print", "Voir les baux DHCP actifs", "Affiche: IP, MAC, hostname, expiration"],
      ["/ip firewall filter print", "Lister les règles firewall", "Affiche toutes les règles avec compteurs"],
      ["/ip firewall nat print", "Lister les règles NAT", "Affiche les règles de masquerade et DNAT"],
      ["/interface wireless print", "État des interfaces Wi-Fi", "Si RouterBoard avec Wi-Fi intégré"],
      ["/system resource print", "CPU, RAM, uptime, version OS", "Diagnostic de performance"],
      ["/log print", "Journaux système en temps réel", "Dernières lignes du log"],
      ["/ping 8.8.8.8 count=5", "Test de connectivité Internet", "Ping Google 5 fois"],
      ["/tool traceroute 8.8.8.8", "Tracer le chemin vers Internet", "Affiche chaque saut"],
      ["/export file=backup-2025", "Exporter la configuration complète", "Crée backup-2025.rsc sur le routeur"],
      ["/system reboot", "Redémarrer le routeur", "ATTENTION : interruption de service"],
    ],
    [3000, 2500, 3526]
  ));
  c.push(sp());
  c.push(codeTitle("Configuration complète MikroTik RouterOS — PME type"));
  c.push(code("# 1. Identité du routeur"));
  c.push(code("/system identity set name=RTR-MAIN-01"));
  c.push(code(""));
  c.push(code("# 2. Changer le mot de passe admin"));
  c.push(code("/user set admin password=\"MonMotDePasseFort!2025\""));
  c.push(code(""));
  c.push(code("# 3. Configuration de l'interface WAN (ether1 = Internet)"));
  c.push(code("/ip dhcp-client add interface=ether1 disabled=no comment=\"WAN-INTERNET\""));
  c.push(code("# OU si IP fixe fournie par l'opérateur :"));
  c.push(code("/ip address add address=203.0.113.10/30 interface=ether1 comment=\"WAN-IP-FIXE\""));
  c.push(code("/ip route add gateway=203.0.113.9 comment=\"ROUTE-DEFAUT-INTERNET\""));
  c.push(code(""));
  c.push(code("# 4. Créer les interfaces VLAN sur ether2 (lien trunk vers switch)"));
  c.push(code("/interface vlan add name=vlan10 vlan-id=10 interface=ether2 comment=\"ADMIN\""));
  c.push(code("/interface vlan add name=vlan20 vlan-id=20 interface=ether2 comment=\"COMPTA\""));
  c.push(code("/interface vlan add name=vlan40 vlan-id=40 interface=ether2 comment=\"CAMERAS\""));
  c.push(code("/interface vlan add name=vlan50 vlan-id=50 interface=ether2 comment=\"WIFI-STAFF\""));
  c.push(code("/interface vlan add name=vlan99 vlan-id=99 interface=ether2 comment=\"INVITES\""));
  c.push(code(""));
  c.push(code("# 5. Adresses IP sur chaque interface VLAN"));
  c.push(code("/ip address add address=192.168.10.1/24 interface=vlan10"));
  c.push(code("/ip address add address=192.168.20.1/24 interface=vlan20"));
  c.push(code("/ip address add address=192.168.40.1/24 interface=vlan40"));
  c.push(code("/ip address add address=192.168.50.1/24 interface=vlan50"));
  c.push(code("/ip address add address=192.168.99.1/24 interface=vlan99"));
  c.push(code(""));
  c.push(code("# 6. Pools d'adresses DHCP"));
  c.push(code("/ip pool add name=pool-admin ranges=192.168.10.10-192.168.10.150"));
  c.push(code("/ip pool add name=pool-compta ranges=192.168.20.10-192.168.20.100"));
  c.push(code("/ip pool add name=pool-wifi ranges=192.168.50.10-192.168.50.200"));
  c.push(code("/ip pool add name=pool-guest ranges=192.168.99.10-192.168.99.250"));
  c.push(code(""));
  c.push(code("# 7. Serveurs DHCP"));
  c.push(code("/ip dhcp-server add name=dhcp-admin interface=vlan10 address-pool=pool-admin lease-time=1d disabled=no"));
  c.push(code("/ip dhcp-server add name=dhcp-compta interface=vlan20 address-pool=pool-compta lease-time=1d disabled=no"));
  c.push(code("/ip dhcp-server add name=dhcp-wifi interface=vlan50 address-pool=pool-wifi lease-time=8h disabled=no"));
  c.push(code("/ip dhcp-server add name=dhcp-guest interface=vlan99 address-pool=pool-guest lease-time=2h disabled=no"));
  c.push(code(""));
  c.push(code("# 8. Réseaux DHCP (options distribuées aux clients)"));
  c.push(code("/ip dhcp-server network add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=192.168.60.10,8.8.8.8"));
  c.push(code("/ip dhcp-server network add address=192.168.20.0/24 gateway=192.168.20.1 dns-server=192.168.60.10,8.8.8.8"));
  c.push(code("/ip dhcp-server network add address=192.168.50.0/24 gateway=192.168.50.1 dns-server=8.8.8.8,1.1.1.1"));
  c.push(code("/ip dhcp-server network add address=192.168.99.0/24 gateway=192.168.99.1 dns-server=8.8.8.8,1.1.1.1"));
  c.push(code(""));
  c.push(code("# 9. NAT Masquerade (partage Internet)"));
  c.push(code("/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment=\"NAT-INTERNET\""));
  c.push(code(""));
  c.push(code("# 10. Règles Firewall de base"));
  c.push(code("/ip firewall filter add chain=input connection-state=established,related action=accept comment=\"ACCEPT-ETABLI\""));
  c.push(code("/ip firewall filter add chain=input connection-state=invalid action=drop comment=\"DROP-INVALIDE\""));
  c.push(code("/ip firewall filter add chain=forward src-address=192.168.99.0/24 dst-address=192.168.0.0/16 action=drop comment=\"BLOCK-GUESTS-LAN\""));
  c.push(code("/ip firewall filter add chain=forward src-address=192.168.40.0/24 dst-address=!192.168.40.0/24 action=drop comment=\"BLOCK-CAMERAS-OUT\""));
  c.push(code(""));
  c.push(code("# 11. DNS"));
  c.push(code("/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes"));
  c.push(code(""));
  c.push(code("# 12. NTP (synchronisation de l'heure)"));
  c.push(code("/system ntp client set enabled=yes primary-ntp=216.239.35.0"));

  c.push(h2("9.3 — Linux Ubuntu Server — Commandes réseau"));
  c.push(makeTable(
    ["Commande", "Rôle", "Exemple réel"],
    [
      ["ip addr show", "Afficher toutes les interfaces et adresses IP", "ip addr show ens18"],
      ["ip link show", "État des interfaces (up/down)", "ip link show"],
      ["ip route show", "Table de routage", "ip route show"],
      ["ip route add", "Ajouter une route statique", "ip route add 10.0.0.0/8 via 192.168.60.1"],
      ["ping -c 4 8.8.8.8", "Test ping vers Internet", "Résultat : 4 paquets envoyés/reçus"],
      ["traceroute 8.8.8.8", "Tracer le chemin vers Internet", "Affiche chaque routeur traversé"],
      ["ss -tulnp", "Ports ouverts et processus associés", "Remplace netstat sur Ubuntu moderne"],
      ["nmap -sn 192.168.10.0/24", "Scanner le réseau (équipements actifs)", "Nécessite : apt install nmap"],
      ["arp -a", "Table ARP (IP ↔ MAC)", "Voir tous les équipements récemment contactés"],
      ["curl -I https://google.com", "Tester l'accès HTTPS vers Internet", "Doit retourner HTTP/2 200"],
      ["systemctl restart networking", "Redémarrer le service réseau", "Après modification de configuration"],
      ["netplan apply", "Appliquer la config Netplan sans redémarrer", "Après modification de /etc/netplan/"],
      ["cat /etc/resolv.conf", "Voir le DNS configuré", "Doit afficher nameserver 192.168.60.10"],
      ["hostnamectl set-hostname NOM", "Changer le nom de la machine", "hostnamectl set-hostname SRV-AD-01"],
    ],
    [2800, 2800, 3426]
  ));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 10 — VIDÉOSURVEILLANCE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 10 — INSTALLATION VIDÉOSURVEILLANCE COMPLÈTE"));
  c.push(p("Cette partie couvre tout le processus : du choix des caméras à la configuration du NVR, en passant par le câblage PoE et l'accès à distance."));

  c.push(h2("10.1 — Comprendre les composants d'un système CCTV IP"));
  c.push(ascii([
    "  ┌──────────────────────────────────────────────────────┐",
    "  │              SYSTÈME CCTV IP COMPLET                 │",
    "  │                                                      │",
    "  │  [Caméra IP]──PoE──[Switch PoE]──[NVR]──[Écran]     │",
    "  │       │                            │                 │",
    "  │  Capture l'image           Stocke et gère            │",
    "  │  Encode en H.265           les enregistrements       │",
    "  │  Envoie en RTSP            Disques durs internes     │",
    "  │                                    │                 │",
    "  │                            [Internet]                │",
    "  │                                    │                 │",
    "  │                            [Smartphone]              │",
    "  │                            App Hik-Connect           │",
    "  │                            (accès à distance)        │",
    "  └──────────────────────────────────────────────────────┘",
  ]));

  c.push(h2("10.2 — Choisir la bonne caméra"));
  c.push(makeTable(
    ["Paramètre", "Options", "Comment choisir ?"],
    [
      ["Résolution", "2MP (1080p) / 4MP (2K) / 8MP (4K)", "4MP est le standard minimum en 2025. 8MP pour lire des plaques ou des visages à distance."],
      ["Objectif", "2.8mm / 4mm / 6mm / 8mm / 12mm / Varifocal", "2.8mm = grand angle (entrées). 6-8mm = distance (parking). Varifocal = réglable sur place."],
      ["Vision nocturne", "IR classique (NB) / ColorVu (couleur) / Thermique", "ColorVu si la zone est éclairée. IR si zones sombres sans éclairage."],
      ["Format", "Dôme / Bullet / PTZ / Fisheye", "Dôme = intérieur discret. Bullet = extérieur longue portée. PTZ = grands espaces avec suivi."],
      ["Indice de protection", "IP67 (extérieur) / IP66 / IP54 / IK10", "Toujours IP67 minimum pour extérieur. IK10 = anti-vandale."],
      ["Alimentation", "PoE 802.3af (15W) / PoE+ 802.3at (30W) / 12V DC", "PoE préféré : un seul câble pour données ET alimentation."],
      ["Codec", "H.264 / H.265 / H.265+", "H.265+ : réduit le stockage de 70% vs H.264. Choisissez toujours H.265+ si disponible."],
    ],
    [1600, 2800, 4626]
  ));

  c.push(h2("10.3 — Calcul du stockage NVR — formule détaillée"));
  c.push(p("Avant d'acheter les disques durs, calculez exactement l'espace nécessaire."));
  c.push(sp());
  c.push(ascii([
    "  FORMULE DE CALCUL :",
    "",
    "  GB par jour (1 caméra) = Bitrate(Mbps) × 3600s × 24h ÷ 8 ÷ 1000",
    "",
    "  EXEMPLE : 8 caméras 4MP à 4 Mbps, 30 jours de rétention :",
    "  → 4 Mbps × 3600 × 24 / 8 / 1000 = 43.2 GB/jour/caméra",
    "  → × 8 caméras = 345.6 GB/jour",
    "  → × 30 jours  = 10.368 TB",
    "  → Avec H.265+ (÷3) ≈ 3.5 TB",
    "  → Prévoir 4 TB × 2 disques (RAID 1) = 8 TB installés",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Configuration", "Bitrate estimé", "1 cam/jour", "8 cams/30j (H.265)", "8 cams/30j (H.265+)", "Disques recommandés"],
    [
      ["2MP — 1080p", "2-3 Mbps", "21-32 GB", "5-8 TB", "1.7-2.6 TB", "2× WD Purple 2TB"],
      ["4MP — 2K", "3-5 Mbps", "32-54 GB", "7.7-13 TB", "2.5-4.3 TB", "2× WD Purple 4TB"],
      ["8MP — 4K", "6-10 Mbps", "65-108 GB", "15.6-26 TB", "5.2-8.7 TB", "2× Seagate SkyHawk 8TB"],
    ],
    [1400, 1400, 1400, 1800, 1800, 2226]
  ));
  c.push(sp());
  c.push(tip("Avec la détection de mouvement activée (enregistrement uniquement si mouvement détecté), divisez l'espace nécessaire par 3 à 5 selon l'activité de la zone surveillée."));

  c.push(h2("10.4 — Installation d'une caméra PoE — étape par étape"));
  c.push(sp());
  c.push(step("1", "Préparer le câble Cat6", "Passez le câble Cat6 depuis le switch PoE jusqu'à l'emplacement de la caméra. Laissez 30 cm de mou à l'arrivée de la caméra."));
  c.push(sp());
  c.push(step("2", "Fixer le support", "Marquer les trous, percer, cheville, visser le support de la caméra. Pour l'extérieur : utiliser des vis inox pour éviter la rouille."));
  c.push(sp());
  c.push(step("3", "Passer et protéger le câble", "Pour les caméras extérieures : le câble doit passer dans un boîtier étanche IP67. Appliquer du silicone autour du câble à l'entrée du boîtier."));
  c.push(sp());
  c.push(step("4", "Raccorder le câble à la caméra", "La plupart des caméras Hikvision ont un connecteur RJ45 interne. Sertir le connecteur T568B et le brancher."));
  c.push(sp());
  c.push(step("5", "Brancher au switch PoE", "Brancher l'autre extrémité sur un port PoE du switch. La caméra s'allume automatiquement (alimentée par PoE). Vérifier la LED du port."));
  c.push(sp());
  c.push(step("6", "Configurer l'adresse IP", "Depuis un PC dans le VLAN40, aller sur http://192.168.40.64 (IP par défaut Hikvision) et configurer l'adresse IP statique selon votre plan d'adressage."));
  c.push(sp());
  c.push(step("7", "Orienter la caméra", "Connectez-vous à l'interface web de la caméra. Réglez l'image en temps réel en tournant le corps de la caméra. Visser définitivement quand l'angle est parfait."));
  c.push(sp());
  c.push(warning("Par défaut, toutes les caméras Hikvision neuves ont le même mot de passe. Changez-le IMMÉDIATEMENT. Un attaquant sur votre réseau pourrait accéder à toutes vos caméras."));

  c.push(h2("10.5 — Configuration du NVR Hikvision — guide complet"));
  c.push(step("1", "Connexion initiale", "Brancher le NVR à l'écran (HDMI), brancher clavier et souris USB. Mettre sous tension. Suivre l'assistant de démarrage."));
  c.push(sp());
  c.push(step("2", "Configurer l'IP du NVR", "Aller dans : Configuration → Network → Basic → IPv4. Désactiver DHCP. Entrer l'IP statique : 192.168.40.10 / Masque : 255.255.255.0 / Gateway : 192.168.40.1"));
  c.push(sp());
  c.push(step("3", "Formater les disques durs", "Aller dans : Configuration → Storage → HDD Management. Sélectionner les disques → Format. ATTENTION : cette opération efface tout."));
  c.push(sp());
  c.push(step("4", "Ajouter les caméras", "Aller dans : Configuration → Camera Management → Add. Cliquer sur 'Search' pour découverte automatique. Sélectionner les caméras trouvées → Ajouter."));
  c.push(sp());
  c.push(step("5", "Configurer l'enregistrement", "Aller dans : Configuration → Record Schedule. Pour chaque caméra : activer 'All-day' en mode 'Continuous' + 'Motion'. Appliquer à toutes les caméras."));
  c.push(sp());
  c.push(step("6", "Activer l'accès à distance", "Aller dans : Configuration → Network → Advanced → Platform Access. Activer Hik-Connect. Scanner le QR code avec l'app Hik-Connect sur votre smartphone."));
  c.push(sp());
  c.push(step("7", "Configurer les alertes", "Aller dans : Configuration → Event → Motion Detection. Dessiner la zone de détection. Activer : Send Email + Trigger Alarm Output."));
  c.push(sp());
  c.push(checkLines("VÉRIFICATIONS FINALES NVR", [
    "Toutes les caméras apparaissent dans l'interface en temps réel",
    "L'enregistrement est actif : icône rouge sur chaque caméra dans la vue live",
    "Le disque dur est reconnu et formaté (HDD Management)",
    "L'accès depuis le smartphone fonctionne via Hik-Connect",
    "Les alertes de détection de mouvement arrivent sur votre email",
  ]));

  c.push(pb());

  return c;
}

module.exports = { getSections6to10 };
