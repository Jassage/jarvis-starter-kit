const { h1, h2, h3, h4, p, pb, sp, tip, warning, danger, info, check, tipLines, warnLines, infoLines, checkLines, step, code, codeTitle, li, ni, makeTable, divider, ascii, def } = require('./helpers');

function getSections1to5() {
  const c = [];

  // ══════════════════════════════════════════════════════════════════════
  // INTRODUCTION GÉNÉRALE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("INTRODUCTION — Comment utiliser ce guide"));
  c.push(p("Ce manuel a été conçu pour vous guider de A à Z dans l'installation d'un réseau informatique professionnel et d'un système de vidéosurveillance IP. Que vous soyez technicien débutant ou ingénieur confirmé, chaque partie est structurée pour être comprise et appliquée directement sur le terrain."));
  c.push(sp());
  c.push(infoLines("COMMENT LIRE CE DOCUMENT", [
    "Lisez chaque section AVANT de commencer le travail correspondant",
    "Les boîtes ATTENTION signalent les erreurs les plus fréquentes",
    "Les boîtes ASTUCE donnent des raccourcis et bonnes pratiques",
    "Les ÉTAPES numérotées doivent être suivies dans l'ordre indiqué",
    "Les blocs de CODE (fond sombre) contiennent des commandes prêtes à l'emploi",
  ]));
  c.push(sp());
  c.push(warnLines("AVANT TOUTE INTERVENTION", [
    "Ne branchez jamais un câble sur un switch en cours de fonctionnement sans vérifier sa configuration",
    "Notez chaque adresse IP et chaque mot de passe dans un registre sécurisé dès le début",
    "Prenez des photos AVANT de modifier quoi que ce soit (câblage existant, étiquettes)",
    "Informez le client des interruptions de service prévues à l'avance",
  ]));
  c.push(sp());

  // ══════════════════════════════════════════════════════════════════════
  // LEXIQUE INDISPENSABLE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h2("LEXIQUE — Les 30 termes que vous devez connaître"));
  const terms = [
    ["IP (Internet Protocol)", "L'adresse numérique unique de chaque équipement sur un réseau, comme une adresse postale. Ex : 192.168.10.5"],
    ["Adresse MAC", "L'identifiant physique gravé dans chaque carte réseau. Unique au monde. Format : AA:BB:CC:DD:EE:FF"],
    ["Switch", "Boîtier qui connecte plusieurs équipements réseau entre eux. Il dirige les données uniquement vers le bon port."],
    ["Router / Routeur", "Équipement qui connecte deux réseaux différents (ex : votre réseau local et Internet)."],
    ["Firewall / Pare-feu", "Système de sécurité qui filtre le trafic réseau selon des règles (autoriser/bloquer)."],
    ["VLAN", "Réseau virtuel : permet de séparer logiquement des équipements sur le même switch physique."],
    ["DHCP", "Protocole qui distribue automatiquement les adresses IP aux équipements qui se connectent."],
    ["DNS", "Système qui traduit les noms (google.com) en adresses IP (142.250.74.46)."],
    ["NAT", "Technique qui permet à plusieurs équipements de partager une seule adresse IP publique."],
    ["PoE", "Power over Ethernet : alimentation électrique transmise via le câble réseau (pour caméras, APs)."],
    ["Cat6 / Cat6A", "Standard de câble réseau. Cat6 = 1 Gb/s jusqu'à 100m. Cat6A = 10 Gb/s jusqu'à 100m."],
    ["RJ45", "Connecteur réseau (la fiche au bout des câbles réseau)."],
    ["Patch panel", "Panneau de brassage en rack regroupant toutes les arrivées de câbles."],
    ["Trunk", "Port de switch qui transporte plusieurs VLANs simultanément (entre switchs et routeur)."],
    ["Access port", "Port de switch qui appartient à un seul VLAN (connecté à un PC, une caméra)."],
    ["STP", "Spanning Tree Protocol : protocole qui empêche les boucles réseau."],
    ["QoS", "Quality of Service : priorisation du trafic (VoIP prioritaire sur les downloads)."],
    ["ACL", "Access Control List : règles qui autorisent ou bloquent le trafic entre réseaux."],
    ["VPN", "Virtual Private Network : tunnel chiffré pour accéder au réseau à distance de façon sécurisée."],
    ["NVR", "Network Video Recorder : enregistreur vidéo IP (stocke les images des caméras)."],
    ["PoE Budget", "Puissance totale disponible sur un switch PoE. Ex : 193W partagés entre tous les ports PoE."],
    ["SSID", "Nom du réseau Wi-Fi que vous voyez dans la liste des réseaux disponibles."],
    ["WPA3", "Dernier standard de sécurité Wi-Fi (remplace WPA2). Obligatoire sur les nouvelles installations."],
    ["Subnet / Sous-réseau", "Division d'un réseau IP en segments plus petits. Défini par le masque (ex : /24 = 254 hôtes)."],
    ["Gateway", "Passerelle par défaut : adresse IP du routeur par laquelle les équipements sortent vers Internet."],
    ["SFP", "Petit module optique ou cuivre insérable dans un switch pour connexion fibre ou longue distance."],
    ["Rack 19\"", "Armoire normalisée (19 pouces de large) pour monter les équipements réseau. 1U = 44.45mm."],
    ["UPS / Onduleur", "Batterie de secours qui maintient les équipements allumés pendant une coupure électrique."],
    ["RTSP", "Protocole de streaming vidéo utilisé par les caméras IP pour diffuser en temps réel."],
    ["Bitrate", "Débit vidéo d'une caméra en Mbit/s. Plus il est élevé, plus l'image est nette mais gourmande en stockage."],
  ];
  terms.forEach(([t, d]) => { c.push(def(t, d)); c.push(sp()); });

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 1
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 1 — ANALYSE DES BESOINS CLIENT"));
  c.push(p("C'est l'étape la plus importante. Une mauvaise analyse des besoins entraîne du matériel inadapté, des surcoûts et des insatisfactions. Ne commencez jamais un projet sans avoir rempli cette checklist."));
  c.push(sp());
  c.push(info("Durée typique de cette étape : 1 à 3 heures de réunion avec le client + 1 jour d'analyse pour rédiger la proposition technique."));
  c.push(sp());

  c.push(h2("1.1 — Informations générales sur l'entreprise"));
  c.push(tip("Commencez toujours par comprendre le MÉTIER du client. Un cabinet médical n'a pas les mêmes contraintes qu'un entrepôt logistique."));
  c.push(sp());
  c.push(makeTable(
    ["Question à poser", "Pourquoi c'est important", "Réponse client"],
    [
      ["Quel est le secteur d'activité ?", "Un hôpital nécessite 99.9% de disponibilité. Un bureau peut tolérer 1h d'arrêt.", ""],
      ["Combien d'employés au total ?", "Détermine le nombre de prises réseau, licences logicielles, bande passante.", ""],
      ["Combien de bureaux/pièces ?", "Définit le nombre de prises murales et de points d'accès Wi-Fi nécessaires.", ""],
      ["Combien de bâtiments séparés ?", "Si plusieurs bâtiments : prévoir fibre ou lien VPN entre sites.", ""],
      ["Combien d'étages par bâtiment ?", "Chaque étage peut nécessiter un switch intermédiaire (limites 90m câble).", ""],
      ["Quelle est la superficie totale (m²) ?", "Calcul des longueurs de câble et du nombre d'AP Wi-Fi nécessaires.", ""],
      ["Type de construction (béton/cloisons) ?", "Béton = perçage difficile, signal Wi-Fi atténué. Placo = passage plus facile.", ""],
      ["Y a-t-il un local technique ou une salle serveur ?", "Si non, prévoir où installer le rack (pièce sécurisée, ventilée).", ""],
    ],
    [3400, 3400, 2226]
  ));

  c.push(h2("1.2 — Inventaire des équipements existants et à prévoir"));
  c.push(warning("Ne supposez jamais. Demandez à voir physiquement les équipements existants. Un 'switch 24 ports' peut être un switch non-manageable qui ne supporte pas les VLANs."));
  c.push(sp());
  c.push(makeTable(
    ["Type d'équipement", "Quantité actuelle", "Quantité souhaitée", "Remarques à noter"],
    [
      ["Ordinateurs fixes (PC de bureau)", "", "", "OS : Windows / Linux / Mac ?"],
      ["Ordinateurs portables", "", "", "Wi-Fi uniquement ou aussi RJ45 ?"],
      ["Imprimantes réseau", "", "", "IP fixe ou DHCP ? Partagées ?"],
      ["Téléphones IP (VoIP)", "", "", "Marque actuelle ? Serveur IPBX ?"],
      ["Serveurs physiques", "", "", "OS, rôles : AD, fichiers, mail ?"],
      ["NAS (stockage réseau)", "", "", "Marque, capacité actuelle ?"],
      ["Points d'accès Wi-Fi", "", "", "Couvrent-ils toutes les zones ?"],
      ["Caméras de surveillance", "", "", "IP ou analogiques ? Résolution ?"],
      ["NVR / DVR", "", "", "Nombre de voies, stockage actuel ?"],
      ["Lecteurs contrôle d'accès", "", "", "Intégration réseau prévue ?"],
      ["Switch(es) existant(s)", "", "", "Manageable ? PoE ? Nombre de ports ?"],
      ["Routeur / Box Internet", "", "", "Opérateur, débit, IP fixe ?"],
      ["Onduleur (UPS)", "", "", "Puissance, autonomie actuelle ?"],
    ],
    [2400, 1600, 1800, 3226]
  ));

  c.push(h2("1.3 — Connectivité Internet"));
  c.push(p("La connexion Internet est l'artère vitale du réseau. Voici toutes les questions à poser :"));
  c.push(sp());
  c.push(makeTable(
    ["Question", "Réponse attendue", "Impact sur le projet"],
    [
      ["Opérateur actuel et type de lien ?", "Fibre / ADSL / 4G / VSAT", "Fibre = stable. 4G = variable."],
      ["Débit contractuel (download/upload) ?", "Ex : 100/20 Mbps", "Dimensionner la bande passante par VLAN"],
      ["Faire un speedtest : débit réel ?", "speedtest.net sur site", "Écart contractuel/réel = problème à signaler"],
      ["Adresse IP publique fixe ou dynamique ?", "Fixe / Dynamique", "IP fixe nécessaire pour VPN et NVR distant"],
      ["Combien d'IP publiques disponibles ?", "1 ou un bloc /29, /28...", "Détermine la configuration NAT"],
      ["Besoin d'une connexion de secours ?", "Oui / Non", "Si oui : prévoir failover 4G ou 2ème opérateur"],
      ["Budget mensuel pour l'Internet ?", "Montant HTG/USD", "Choisir l'offre adaptée"],
      ["Lien entre bâtiments si plusieurs sites ?", "Fibre noire / VPN / MPLS", "Coût et débit à planifier"],
    ],
    [2800, 2000, 4226]
  ));
  c.push(sp());
  c.push(tip("Effectuez toujours un speedtest sur place (speedtest.net) et notez les résultats. Les clients surestiment souvent leur débit réel."));

  c.push(h2("1.4 — Besoins en sécurité et conformité"));
  c.push(makeTable(
    ["Question", "Réponse", "Action si Oui"],
    [
      ["Données sensibles sur le réseau ? (médical, financier, juridique)", "", "VLAN dédié + chiffrement + ACL strictes"],
      ["Accès distant pour les employés (télétravail) ?", "", "Configurer VPN (WireGuard ou OpenVPN)"],
      ["Besoin de filtrer les sites web pour les employés ?", "", "Configurer proxy ou DNS filtering (Pi-hole, Squid)"],
      ["Réseau Wi-Fi pour les visiteurs/clients ?", "", "SSID Invités isolé + portail captif"],
      ["Conformité à une norme (ISO 27001, RGPD, PCI-DSS) ?", "", "Journalisation, chiffrement, audits réguliers"],
      ["Historique d'incidents de sécurité (virus, intrusions) ?", "", "Audit sécurité avant installation"],
      ["Sauvegardes actuelles des données ?", "", "Inclure NAS ou cloud backup dans la solution"],
      ["Qui est le responsable IT en interne ?", "", "Former cette personne sur l'administration du réseau"],
    ],
    [3200, 1500, 4326]
  ));

  c.push(h2("1.5 — Besoins en vidéosurveillance"));
  c.push(makeTable(
    ["Question", "Réponse", "Impact technique"],
    [
      ["Quelles zones surveiller ? (entrées, parking, bureaux...)", "", "Nombre et type de caméras"],
      ["Caméras intérieures ou extérieures ou les deux ?", "", "IP67 requis pour extérieur"],
      ["Vision nocturne nécessaire ?", "", "IR ou ColorVu (couleur la nuit)"],
      ["Résolution souhaitée ?", "2/4/8 MP", "Stockage et bande passante"],
      ["Durée de conservation des enregistrements ?", "7/30/90 jours", "Taille des disques durs"],
      ["Enregistrement continu ou sur détection ?", "", "Stockage réduit de 60-80% avec détection"],
      ["Accès distant aux caméras (smartphone) ?", "", "Port forwarding + app Hik-Connect"],
      ["Notification d'alarme par email/SMS ?", "", "Configurer les événements NVR"],
      ["Moniteur de visualisation en salle de contrôle ?", "", "Ajouter écran + HDMI vers NVR"],
      ["Contrôle d'accès lié aux caméras ?", "", "Intégration porte + caméra = projet plus complexe"],
    ],
    [3200, 1500, 4326]
  ));

  c.push(h2("1.6 — Besoins futurs (dans 2 à 5 ans)"));
  c.push(info("Les équipements réseau doivent durer 5 à 10 ans. Prévoir 30 à 40% de capacité supplémentaire sur les switchs et le câblage dès le départ coûte peu mais évite une refonte coûteuse."));
  c.push(sp());
  ["Prévision de croissance des effectifs (combien d'employés dans 3 ans ?)", "Nouveaux bâtiments ou sites à intégrer ?", "Migration vers la téléphonie IP (VoIP) prévue ?", "Projet cloud (Azure, AWS, OVH) avec besoins de bande passante accrus ?", "Nouveaux besoins en vidéosurveillance (plus de caméras, résolution plus élevée) ?", "Systèmes IoT (capteurs, badges, bornes de recharge) à intégrer ?", "Budget disponible pour les extensions futures ?"].forEach(q => c.push(li(q)));
  c.push(sp());
  c.push(checkLines("RÉSULTAT DE LA RÉUNION — Ce qu'il faut produire", [
    "Un compte-rendu signé par le client résumant tous ses besoins",
    "Une liste précise du matériel existant et de son état",
    "Un plan approximatif du bâtiment (même à main levée)",
    "La confirmation du budget alloué",
    "La date souhaitée de mise en service",
  ]));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 2 — VISITE TECHNIQUE
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 2 — VISITE TECHNIQUE (SITE SURVEY)"));
  c.push(p("La visite technique est votre passage obligatoire AVANT d'acheter le moindre équipement. Elle permet de valider les besoins sur le terrain et de produire un plan de câblage précis."));
  c.push(sp());
  c.push(info("Durée typique : 2 heures pour un petit site (1 bâtiment, 1 étage). Une journée complète pour un site multi-bâtiments."));

  c.push(h2("2.1 — Matériel à apporter obligatoirement"));
  c.push(makeTable(
    ["Outil", "Usage", "Où le trouver"],
    [
      ["Mètre laser (50m min.)", "Mesurer les distances précisément, même en hauteur", "Leroy Merlin, Amazon"],
      ["Appareil photo / smartphone", "Photographier chaque local, goulotte, faux-plafond, tableau élec.", "Votre téléphone"],
      ["Tablette avec Floorplanner.com", "Dessiner le plan du bâtiment en temps réel", "Application gratuite"],
      ["Lampe torche puissante", "Voir dans les faux-plafonds, gaines techniques, combles", "Amazon"],
      ["Testeur de câble RJ45 basique", "Vérifier si des câbles existants sont fonctionnels", "20-50 USD"],
      ["Application WiFi Analyzer (Android)", "Identifier les réseaux Wi-Fi existants et les interférences", "Play Store, gratuit"],
      ["Carnet + stylo", "Annoter le plan, noter les distances, les obstacles", "Bureau"],
      ["Tournevis plat + cruciforme", "Ouvrir les goulottes, les tableaux électriques", "Votre caisse à outils"],
      ["Craie ou adhésif de peintre", "Marquer temporairement les emplacements des prises et caméras", "Bricolage"],
    ],
    [2200, 3400, 3426]
  ));
  c.push(sp());
  c.push(warning("Ne jamais ouvrir un tableau électrique sans autorisation et sans être habilité. Demandez à l'électricien ou au responsable technique du client."));

  c.push(h2("2.2 — Comment réaliser le plan du bâtiment étape par étape"));
  c.push(sp());
  c.push(step("1", "Dessiner le contour général du bâtiment", "Commencez par mesurer et dessiner les murs extérieurs. Utilisez le mètre laser : pointez d'un mur à l'autre. Notez chaque mesure."));
  c.push(sp());
  c.push(step("2", "Ajouter les pièces intérieures", "Pour chaque pièce : mesurez la longueur et la largeur. Reportez les portes (sens d'ouverture) et les fenêtres. Nommez chaque pièce (Bureau 01, Couloir, Salle de réunion...)."));
  c.push(sp());
  c.push(step("3", "Identifier les obstacles au câblage", "Repérez : murs en béton armé (difficiles à percer), colonnes, escaliers, ascenseurs, zones humides. Annotez ces obstacles sur le plan avec la mention 'BÉTON' ou 'OBSTACLE'."));
  c.push(sp());
  c.push(step("4", "Localiser le tableau électrique principal", "C'est là que vous installerez l'onduleur. Notez la puissance disponible (16A, 32A...) et si une prise de terre est présente."));
  c.push(sp());
  c.push(step("5", "Repérer les gaines et faux-plafonds existants", "Levez les dalles de faux-plafond (avec autorisation). Regardez si des chemins de câbles existent déjà. Photographiez tout."));
  c.push(sp());
  c.push(step("6", "Marquer les emplacements prévus", "Placez des adhésifs de peintre pour marquer : emplacements des prises réseau (numérotées P1, P2...), emplacements des APs Wi-Fi, emplacements des caméras, emplacement du rack."));
  c.push(sp());
  c.push(tip("Prenez une photo du plan une fois toutes les annotations faites. C'est votre référence terrain."));

  c.push(h2("2.3 — Calcul des longueurs de câble"));
  c.push(p("Règle fondamentale : la norme TIA-568-C limite la longueur maximale d'un câble horizontal à 90 mètres (+ 10m de cordons = 100m total). Au-delà, le signal se dégrade et le réseau tombe à 10 Mbps ou se coupe."));
  c.push(sp());
  c.push(ascii([
    "  [RACK / PATCH PANEL]",
    "        |",
    "        |  Câble horizontal (max 90 m)",
    "        |",
    "   [PRISE MURALE]",
    "        |",
    "        |  Cordon de brassage (max 5 m côté rack)",
    "        |  Cordon de liaison  (max 5 m côté PC)",
    "        |",
    "       [PC]",
    "",
    "  TOTAL MAXIMUM : 90 + 5 + 5 = 100 m",
  ]));
  c.push(sp());
  c.push(p("Comment calculer la longueur d'un câble :"));
  c.push(ni("Mesurez la distance au sol entre le rack et la prise murale."));
  c.push(ni("Ajoutez la hauteur pour monter dans le faux-plafond (généralement 3 à 4 m)."));
  c.push(ni("Ajoutez la hauteur pour redescendre vers la prise murale (généralement 0.5 à 1 m)."));
  c.push(ni("Multipliez le résultat par 1.20 (marge de 20% pour les courbures et imprévus)."));
  c.push(ni("Arrondir au multiple de 5 supérieur."));
  c.push(sp());
  c.push(makeTable(
    ["Prise / Équipement", "Distance sol (m)", "+Montée faux-plafond (m)", "+Descente (m)", "Sous-total (m)", "x1.20 = Longueur câble"],
    [
      ["Bureau 01 — P1", "18", "3.5", "1", "22.5", "27 m"],
      ["Bureau 02 — P1", "35", "3.5", "1", "39.5", "48 m"],
      ["Salle réunion — AP", "42", "4", "0.5", "46.5", "56 m"],
      ["Parking — Caméra ext.", "55", "4", "2", "61", "74 m"],
      ["TOTAL BOBINE (305 m)", "", "", "", "", "205 m → 1 bobine suffit"],
    ],
    [2200, 1300, 2000, 1200, 1300, 2026]
  ));
  c.push(sp());
  c.push(danger("Si une distance dépasse 90 m de câble horizontal, vous DEVEZ soit repositionner le rack, soit installer un switch intermédiaire, soit poser de la fibre optique."));

  c.push(h2("2.4 — Emplacement du rack — règles de choix"));
  c.push(p("Le rack est le cœur du réseau. Son emplacement conditionne toute l'installation."));
  c.push(sp());
  c.push(makeTable(
    ["Critère", "Exigence", "Conséquence si non respecté"],
    [
      ["Sécurité physique", "Pièce verrouillée, accès restreint au personnel IT", "N'importe qui peut débrancher ou voler l'équipement"],
      ["Température", "18°C à 27°C maximum — ventilation obligatoire", "Surchauffe = panne ou réduction de durée de vie"],
      ["Humidité", "Moins de 70% d'humidité relative", "Condensation = court-circuit"],
      ["Distance max aux équipements", "Aucun câble > 90m depuis le rack", "Perte de débit ou coupure réseau"],
      ["Alimentation électrique", "Prise 220V avec terre + onduleur obligatoire", "Coupure secteur = réseau entier down"],
      ["Accessibilité", "Accès avant ET arrière pour maintenance", "Impossible de brancher ou dépanner"],
      ["Taille minimale", "Prévoir 20% d'espace libre en plus de ce qui est installé", "Pas de place pour extensions futures"],
    ],
    [2000, 3000, 4026]
  ));
  c.push(sp());
  c.push(tip("Dans les petits bureaux sans local technique : un rack mural fermé 12U dans un placard verrouillé est acceptable. Percer des trous de ventilation si nécessaire."));

  c.push(h2("2.5 — Emplacement des points d'accès Wi-Fi"));
  c.push(p("Un point d'accès (AP) Wi-Fi mal placé = réseau lent et instable même avec du matériel haut de gamme."));
  c.push(sp());
  c.push(ascii([
    "  ESPACE OUVERT (bureau open space) :",
    "",
    "  [AP 1]──────────────────────[AP 2]",
    "    |   <─────── 20 m ──────────>  |",
    "    |   Zone couverte AP1   Zone couverte AP2",
    "    |                              |",
    "    └──────── chevauchement 15-20% ┘",
    "              (pour le roaming)",
    "",
    "  AVEC CLOISONS (bureaux séparés) :",
    "",
    "  [AP 1]──────────[AP 2]──────────[AP 3]",
    "    |<─── 10-15m ───>|<─── 10-15m ───>|",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Type d'environnement", "Portée estimée", "1 AP couvre", "Nombre d'AP pour 500 m²"],
    [
      ["Espace ouvert (open space, entrepôt)", "~50 m", "~150 m²", "3-4 AP"],
      ["Bureaux avec cloisons légères (placo)", "~25 m", "~60 m²", "8-9 AP"],
      ["Bâtiment béton avec murs épais", "~15 m", "~30 m²", "16+ AP"],
      ["Couloirs longs", "~30 m dans l'axe", "Axial", "1 AP tous les 25m"],
    ],
    [2800, 1600, 1600, 3026]
  ));
  c.push(sp());
  c.push(warnLines("ERREURS FRÉQUENTES D'INSTALLATION D'AP", [
    "Placer l'AP dans un angle de pièce (perd 75% de la portée)",
    "Installer l'AP derrière des armoires métalliques (blocage du signal)",
    "Mettre tous les APs sur le même canal (interférences entre eux)",
    "Installer à moins de 2 mètres d'un four à micro-ondes ou téléphone DECT",
    "Oublier de calculer le budget PoE (chaque AP consomme 10-15W)",
  ]));

  c.push(h2("2.6 — Emplacement des caméras — règles de base"));
  c.push(ascii([
    "  ENTRÉE PRINCIPALE :",
    "  ┌─────────────────────────────────────────┐",
    "  │   [Caméra grand angle 2.8mm]             │",
    "  │   ↓ installée en hauteur (2.5-3m)        │",
    "  │   ↓ légèrement inclinée vers le bas       │",
    "  │   ↓ capte les visages (pas le plafond)   │",
    "  │   Angle : 100°  Distance : 4-6m          │",
    "  └─────────────────────────────────────────┘",
    "",
    "  COULOIR :",
    "  ┌─ [CAM] ──────────────────────────────────┐",
    "  │   →  Axe du couloir                       │",
    "  │   →  Objectif 6mm (champ étroit)           │",
    "  │   →  Couvre jusqu'à 20m                    │",
    "  └─────────────────────────────────────────┘",
    "",
    "  PARKING EXTÉRIEUR :",
    "  [Caméra bullet IP67, IR 50m]",
    "  Hauteur : 3-4m sur mur ou poteau",
    "  Angle : couvrir les allées, pas les cieux",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Zone", "Type de caméra recommandé", "Objectif", "Hauteur d'installation"],
    [
      ["Entrée principale", "Dôme ou varifocale intérieure", "2.8 mm (grand angle)", "2.5 m, inclinée 30°"],
      ["Couloir", "Dôme intérieure", "6 mm (champ étroit)", "2.5-3 m, axe du couloir"],
      ["Open space / bureau", "Dôme fisheye 360°", "1.4 mm", "Plafond, centre de la pièce"],
      ["Parking extérieur", "Bullet IP67, IR 50m", "4-6 mm", "3.5-4 m, inclinée 20°"],
      ["Caisse / accueil", "Dôme haute résolution 4MP", "2.8 mm", "2 m, visant les visages"],
      ["Périmètre / clôture", "Bullet IP67, IR 80m", "8-12 mm", "4 m sur poteau"],
      ["Zone large (entrepôt)", "PTZ motorisée", "Zoom x25", "5-6 m, angle dégagé"],
    ],
    [1800, 2400, 1600, 3226]
  ));
  c.push(sp());
  c.push(danger("Ne jamais pointer une caméra vers une fenêtre sans s'assurer qu'elle dispose du WDR (Wide Dynamic Range). Sinon : image surexposée ou silhouette noire."));

  c.push(h2("2.7 — Prises réseau : combien et où ?"));
  c.push(p("Règle professionnelle : toujours installer le DOUBLE de ce qui est nécessaire aujourd'hui."));
  c.push(sp());
  c.push(makeTable(
    ["Type de pièce", "Prises minimum recommandées", "Justification"],
    [
      ["Bureau individuel (1 personne)", "2 prises doubles (= 4 ports)", "PC + IP Phone + imprimante + réserve"],
      ["Bureau partagé (2-4 personnes)", "1 prise double par poste + 1 réserve", "Flexibilité de placement"],
      ["Salle de réunion", "3 prises doubles + 1 prise dédiée AP", "PC portables invités + présentation + Wi-Fi"],
      ["Accueil / réception", "2 prises doubles + 1 prise caméra", "PC + IP Phone + caméra de surveillance"],
      ["Couloir / salle commune", "1 prise pour AP Wi-Fi au plafond", "Seule l'AP a besoin d'une prise ici"],
      ["Local serveur / rack", "Patch panel centralisé (pas de prises individuelles)", "Tout arrive au patch panel via câbles"],
      ["Salle de pause / cuisine", "1 prise double (imprimante ou TV)", "Usage limité"],
    ],
    [2400, 2600, 4026]
  ));
  c.push(sp());
  c.push(checkLines("FIN DE LA VISITE — Livrables attendus", [
    "Plan du bâtiment annoté avec : numéros des prises, emplacements AP, emplacements caméras, emplacement rack",
    "Tableau des longueurs de câble par prise",
    "Liste des obstacles identifiés (béton, hauteurs, zones humides)",
    "Photos de tous les locaux techniques et passages de câbles",
    "Total de câbles Cat6 à commander (en mètres + 20% de marge)",
  ]));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 3 — MATÉRIEL
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 3 — LISTE COMPLÈTE DU MATÉRIEL"));
  c.push(p("Cette section présente chaque équipement avec son rôle, comment le choisir, et les quantités typiques. Les prix sont indicatifs en USD — adaptez selon votre marché local."));

  c.push(h2("3.1 — Équipements actifs réseau"));

  c.push(h3("Le Routeur / Pare-feu"));
  c.push(p("C'est le gardien du réseau. Il connecte votre réseau local à Internet et filtre les connexions dangereuses."));
  c.push(sp());
  c.push(ascii([
    "                  INTERNET",
    "                     |",
    "              ┌──────┴──────┐",
    "              │  ROUTEUR /  │  ← Il décide ce qui entre",
    "              │  PARE-FEU   │    et ce qui sort",
    "              └──────┬──────┘",
    "                     |",
    "              Réseau local (LAN)",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Modèle", "Pour quel usage ?", "Prix USD", "Avantages"],
    [
      ["MikroTik RB4011", "PME 10-100 utilisateurs", "180-220$", "Très configurable, rapport qualité/prix excellent"],
      ["MikroTik hEX RB750Gr3", "TPE moins de 20 utilisateurs", "60-80$", "Compact, économique, RouterOS complet"],
      ["Cisco RV340", "PME avec support Cisco", "250-350$", "Interface simple, support professionnel"],
      ["Fortinet FortiGate 60F", "PME avec sécurité avancée", "400-700$", "NGFW : inspection profonde, antivirus intégré"],
      ["Ubiquiti Dream Machine Pro", "PME UniFi tout-en-un", "350-450$", "Interface graphique intuitive, écosystème UniFi"],
      ["pfSense (PC reconverti)", "Budget ou lab", "0$ + matériel", "100% gratuit, très puissant, nécessite du temps"],
    ],
    [2200, 2200, 1200, 3426]
  ));
  c.push(sp());
  c.push(tip("Pour un premier projet PME en Haïti : MikroTik RB4011 = le meilleur rapport qualité/prix. Interface Winbox intuitive, documentation abondante en français."));

  c.push(h3("Les Switchs"));
  c.push(p("Un switch connecte tous vos équipements entre eux. Il y a deux grandes catégories :"));
  c.push(sp());
  c.push(ascii([
    "  SWITCH NON-MANAGEABLE               SWITCH MANAGEABLE",
    "  ┌─────────────────┐                ┌─────────────────┐",
    "  │  Plug & Play    │                │  VLAN possible  │",
    "  │  Pas de config  │                │  QoS possible   │",
    "  │  Tout le monde  │                │  ACL possible   │",
    "  │  voit tout      │                │  Monitoring     │",
    "  │  ← À ÉVITER    │                │  ← À UTILISER  │",
    "  │  en entreprise  │                │  en entreprise  │",
    "  └─────────────────┘                └─────────────────┘",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Modèle", "Ports", "PoE ?", "Prix USD", "Usage recommandé"],
    [
      ["TP-Link TL-SG3428", "24x GbE + 4x SFP", "Non", "150-200$", "Switch core principal — gestion de tous les VLANs"],
      ["TP-Link TL-SG3428MP", "24x GbE PoE + 4x SFP", "Oui 384W", "280-380$", "Distribution étage avec APs et caméras PoE"],
      ["TP-Link TL-SG2210MP", "8x GbE PoE + 2x SFP", "Oui 150W", "100-150$", "Petit bureau annexe ou étage limité"],
      ["Cisco CBS350-24T", "24x GbE + 4x SFP", "Non", "300-450$", "Environnement Cisco, support officiel"],
      ["Cisco CBS350-24P", "24x GbE PoE + 4x SFP", "Oui 195W", "400-600$", "Distribution Cisco avec PoE"],
      ["Ubiquiti USW-24-PoE", "24x GbE PoE + 4x SFP", "Oui 95W", "300-400$", "Environnement UniFi, gestion centralisée"],
    ],
    [2200, 1700, 800, 1200, 3126]
  ));
  c.push(sp());
  c.push(tip("Le switch PoE doit avoir un budget PoE suffisant. Comptez 15W par AP Wi-Fi et 10-25W par caméra. Un switch 193W peut alimenter environ 10-12 caméras."));

  c.push(h3("Points d'accès Wi-Fi"));
  c.push(makeTable(
    ["Modèle", "Wi-Fi", "PoE requis", "Prix USD", "Usage"],
    [
      ["TP-Link EAP670 (Omada)", "Wi-Fi 6 AX5400", "802.3at (30W)", "100-130$", "Bureau standard, excellent rapport Q/P"],
      ["TP-Link EAP225 (Omada)", "Wi-Fi 5 AC1350", "802.3af (15W)", "50-70$", "Budget, usage modéré"],
      ["Ubiquiti U6-Lite", "Wi-Fi 6 AX1500", "802.3af (12W)", "100-130$", "Intérieur, écosystème UniFi"],
      ["Ubiquiti U6-LR", "Wi-Fi 6 AX5300", "802.3at (21W)", "170-200$", "Longue portée, espaces ouverts"],
      ["Cisco Aironet 2800", "Wi-Fi 5 4x4 MIMO", "802.3at", "300-500$", "Haute densité, environnement Cisco"],
    ],
    [2200, 1600, 1600, 1200, 2426]
  ));

  c.push(h2("3.2 — Câblage et infrastructure passive"));
  c.push(info("Le câblage est permanent. Investir dans du Cat6A coûte 30% de plus que le Cat6 mais garantit 10 Gbps et une durabilité de 20+ ans. Le câblage est souvent plus coûteux que les équipements actifs et plus difficile à remplacer."));
  c.push(sp());
  c.push(makeTable(
    ["Matériau", "Spécification", "Débit max", "Distance max", "Prix/m", "Quand l'utiliser"],
    [
      ["Câble Cat6 UTP", "4 paires, non blindé", "1 Gbps", "100 m", "0.30-0.60$/m", "Usage standard bureaux"],
      ["Câble Cat6 FTP", "4 paires, blindage général", "1 Gbps", "100 m", "0.50-0.80$/m", "Zones avec interférences (usines)"],
      ["Câble Cat6A UTP", "4 paires, augmenté", "10 Gbps", "100 m", "0.60-1$/m", "Salles serveurs, liaisons inter-switchs"],
      ["Fibre OM3 multimodes", "50/125 µm, orange", "10 Gbps", "300 m", "0.80-1.5$/m", "Liaisons inter-bâtiments < 300m"],
      ["Fibre OS2 monomode", "9/125 µm, jaune", "100 Gbps", "80 km", "0.50-1$/m", "Longues distances, campus, multi-sites"],
    ],
    [1800, 2000, 1200, 1200, 1000, 1826]
  ));
  c.push(sp());
  c.push(makeTable(
    ["Équipement passif", "Quantité typique (20 prises)", "Prix unitaire USD", "Total USD"],
    [
      ["Câble Cat6 UTP 305m (bobine)", "2-3 bobines", "60-90$/bobine", "120-270$"],
      ["Connecteurs RJ45 blindés Cat6", "Boîte de 100 pcs", "20-30$", "20-30$"],
      ["Keystones RJ45 Cat6 (prises encastrées)", "40-50 pcs (2 par prise murale)", "3-6$/pcs", "120-300$"],
      ["Plaques murales doubles (2 ports)", "20 pcs", "3-5$/pcs", "60-100$"],
      ["Patch panel 24 ports Cat6 (1U)", "1-2 pcs", "40-70$", "40-140$"],
      ["Cordons de brassage Cat6 0.5m", "24 pcs (1 par port patch panel)", "2-4$", "48-96$"],
      ["Goulottes PVC 40x20mm (2m)", "30-50 barres", "3-5$/barre", "90-250$"],
      ["Goulottes PVC 60x40mm (2m) — chemin principal", "10-20 barres", "6-10$/barre", "60-200$"],
      ["Attaches câbles velcro (boîte 100)", "1 boîte", "10-15$", "10-15$"],
      ["Étiquettes autocollantes câbles", "1 rouleau 200 étiquettes", "10-20$", "10-20$"],
    ],
    [3000, 2000, 1800, 2226]
  ));

  c.push(h2("3.3 — Rack et baie de brassage"));
  c.push(ascii([
    "  RACK 12U MURAL (vue de face) :",
    "  ┌──────────────────────────────┐",
    "  │ U1  ████ Patch Panel 24p     │ ← Arrivée de tous les câbles",
    "  │ U2  ░░░░ Passe-câble 1U      │ ← Organisation des cordons",
    "  │ U3  ████ Switch Core 24p     │ ← Cœur du réseau",
    "  │ U4  ████ Switch PoE 24p      │ ← APs et caméras",
    "  │ U5  ░░░░ Passe-câble 1U      │",
    "  │ U6  ████ Routeur / Firewall  │ ← Connexion Internet",
    "  │ U7  ████ Patch panel fibre   │ ← Si fibre inter-bâtiment",
    "  │ U8  ▒▒▒▒ LIBRE (réserve)     │ ← Extensions futures",
    "  │ U9  ████ PDU multiprise      │ ← Distribution électrique",
    "  │ U10 ████ PDU multiprise      │",
    "  │ U11 ░░░░ Ventilateur 1U      │ ← Refroidissement",
    "  │ U12 ░░░░ Ventilateur 1U      │",
    "  └──────────────────────────────┘",
    "  [ONDULEUR 1500VA — sur le sol, sous le rack]",
  ]));
  c.push(sp());
  c.push(makeTable(
    ["Équipement rack", "Qté", "Prix USD", "Notes"],
    [
      ["Rack mural fermé 12U (450mm prof.)", "1", "80-150$", "Avec ventilateur et serrure"],
      ["Rack sur pieds 19\" 22U (600x600mm)", "1", "120-220$", "Pour salle serveur dédiée"],
      ["PDU multiprise 8 prises 19\"", "2", "30-60$ chacun", "Avec parafoudre, 16A"],
      ["Ventilateur 1U thermostatique", "1-2", "20-40$ chacun", "Se déclenche si T° > 30°C"],
      ["Panneau passe-câble 1U (avec brosse)", "2-3", "10-20$ chacun", "Sépare les sections du rack"],
      ["Onduleur APC 1500VA (UPS)", "1", "200-350$", "Autonomie 10-20min selon charge"],
    ],
    [3000, 700, 1400, 3926]
  ));

  c.push(h2("3.4 — Système de vidéosurveillance"));
  c.push(makeTable(
    ["Équipement", "Modèle suggéré", "Qté", "Prix USD", "Notes"],
    [
      ["Caméra dôme 4MP intérieure", "Hikvision DS-2CD2143G2-I", "4-8", "60-100$", "IR 40m, WDR 120dB"],
      ["Caméra bullet 4MP extérieure", "Hikvision DS-2CD2T43G2-4I", "2-6", "80-130$", "IR 80m, IP67"],
      ["Caméra ColorVu 4MP (couleur nuit)", "Hikvision DS-2CD2T47G2-L", "2-4", "100-150$", "Couleur sans IR, zones éclairées"],
      ["Caméra PTZ extérieure", "Hikvision DS-2DE4A425IWG-E", "0-2", "300-500$", "Zoom x25, suivi automatique"],
      ["NVR 8 voies (petite install.)", "Hikvision DS-7608NI-I2/8P", "1", "200-300$", "PoE 8 ports intégré"],
      ["NVR 16 voies (install. moyenne)", "Hikvision DS-7616NI-I2/16P", "1", "350-550$", "PoE 16 ports, 4K"],
      ["NVR 32 voies (grande install.)", "Hikvision DS-7632NI-I4/16P", "1", "600-900$", "16 ports PoE + 16 réseau"],
      ["Disque dur surveillance 4 To", "WD Purple WD40PURX", "2", "80-120$", "Optimisé enregistrement 24/7"],
      ["Disque dur surveillance 8 To", "Seagate SkyHawk ST8000VX004", "2", "130-180$", "Grande capacité"],
      ["Écran Full HD 22\" (monitoring)", "Samsung / LG FHD", "1", "100-180$", "HDMI + VGA"],
    ],
    [2400, 2400, 600, 1000, 2626]
  ));

  c.push(h2("3.5 — Outils d'installation"));
  c.push(makeTable(
    ["Outil", "Utilité", "Prix USD", "Indispensable ?"],
    [
      ["Pince à sertir RJ45 (cliquet)", "Sertissage des connecteurs RJ45 sur câble Cat6", "25-60$", "OUI"],
      ["Outil de dénudage coaxial/réseau", "Dénuder le câble sans couper les paires", "15-30$", "OUI"],
      ["Outil punch-down 110 (keystone)", "Raccorder les paires sur les keystones et patch panel", "15-40$", "OUI"],
      ["Testeur de câble RJ45 (basique)", "Vérifier la continuité des 8 fils d'un câble", "20-50$", "OUI"],
      ["Testeur certifié Fluke DSX-600", "Certifier Cat6/Cat6A selon normes TIA — location possible", "500-1500$/sem", "Pour projets certifiés"],
      ["Perceuse à percussion avec forets béton", "Passer les câbles dans les murs en béton", "80-200$", "OUI"],
      ["Mètre laser Bosch", "Mesurer les distances avec précision", "30-80$", "OUI"],
      ["Multimètre numérique", "Tester l'alimentation électrique, les onduleurs", "20-60$", "OUI"],
      ["Lampe torche puissante", "Travailler dans les faux-plafonds et gaines", "15-40$", "OUI"],
      ["Escabeau 3m", "Installer les APs Wi-Fi et caméras en hauteur", "60-120$", "OUI"],
      ["Marqueur permanent indélébile", "Étiqueter les câbles", "3-5$", "OUI"],
      ["Tirefond / aiguille à passer câbles", "Passer les câbles dans les gaines et cloisons", "20-50$", "OUI"],
    ],
    [2400, 3000, 1400, 2226]
  ));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 4 — DEVIS
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 4 — DEVIS PROFESSIONNEL"));
  c.push(p("Un bon devis protège le prestataire ET le client. Il doit être précis, complet et signé avant tout début de travaux."));
  c.push(sp());
  c.push(infoLines("UN BON DEVIS DOIT RÉPONDRE À CES 5 QUESTIONS", [
    "Quoi ? — Description précise de chaque équipement et prestation",
    "Combien ? — Quantités exactes et prix unitaires transparents",
    "Pour quand ? — Délai de réalisation réaliste et engagé",
    "Garantie ? — Ce qui est couvert, pour combien de temps",
    "Comment je paie ? — Modalités claires et acompte défini",
  ]));
  c.push(sp());

  c.push(h2("4.1 — En-tête du devis"));
  c.push(makeTable(
    ["Prestataire (VOUS)", "Client"],
    [
      ["Nom / Raison sociale : _______________", "Nom / Raison sociale : _______________"],
      ["Adresse : _______________", "Adresse : _______________"],
      ["Téléphone : _______________", "Téléphone : _______________"],
      ["Email : _______________", "Email / Contact : _______________"],
      ["Numéro de devis : DEV-2025-___", "Référence PO client : _______________"],
      ["Date d'émission : _______________", "Validité : 30 jours à compter de ce jour"],
    ],
    [4513, 4513]
  ));

  c.push(h2("4.2 — Corps du devis détaillé"));
  c.push(makeTable(
    ["N°", "Désignation complète", "Qté", "P.U. HT", "Total HT"],
    [
      ["1.0", "FOURNITURE MATÉRIEL RÉSEAU", "", "", ""],
      ["1.1", "Routeur/Firewall MikroTik RB4011iGS+5HacQ2HnD — livré configuré", "1", "___", "___"],
      ["1.2", "Switch manageable TP-Link TL-SG3428 24 ports GbE + 4 SFP", "1", "___", "___"],
      ["1.3", "Switch PoE TP-Link TL-SG3428MP 24 ports PoE+ 384W", "1", "___", "___"],
      ["1.4", "Point d'accès Wi-Fi 6 TP-Link EAP670 — fourni et installé", "4", "___", "___"],
      ["1.5", "Onduleur APC SMT1500I 1500VA avec carte de monitoring", "1", "___", "___"],
      ["2.0", "FOURNITURE INFRASTRUCTURE CÂBLAGE", "", "", ""],
      ["2.1", "Câble réseau Cat6 UTP 305m — bobine (U/UTP, 4 paires)", "3", "___", "___"],
      ["2.2", "Patch panel 24 ports Cat6 — 1U avec étiquettes", "1", "___", "___"],
      ["2.3", "Prises murales doubles RJ45 Cat6 keystones — pose incluse", "20", "___", "___"],
      ["2.4", "Connecteurs RJ45 Cat6 blindés — boîte 100 pcs", "1", "___", "___"],
      ["2.5", "Goulottes PVC 40x20mm longueur 2m — pose incluse", "40", "___", "___"],
      ["2.6", "Rack mural fermé 12U 450mm avec PDU et ventilateur", "1", "___", "___"],
      ["3.0", "FOURNITURE VIDÉOSURVEILLANCE", "", "", ""],
      ["3.1", "Caméra IP dôme 4MP intérieure Hikvision DS-2CD2143G2-I IR40m", "4", "___", "___"],
      ["3.2", "Caméra IP bullet 4MP extérieure Hikvision DS-2CD2T43G2 IR80m IP67", "4", "___", "___"],
      ["3.3", "NVR 16 voies 4K Hikvision DS-7616NI-I2/16P avec 16 ports PoE", "1", "___", "___"],
      ["3.4", "Disque dur surveillance WD Purple 4 To (7/24) — installé", "2", "___", "___"],
      ["3.5", "Écran Full HD 22\" pour monitoring NVR", "1", "___", "___"],
      ["4.0", "PRESTATIONS DE SERVICES", "", "", ""],
      ["4.1", "Main-d'oeuvre câblage : pose goulottes, passage câbles, sertissage", "forfait", "___", "___"],
      ["4.2", "Installation et montage équipements réseau en rack", "forfait", "___", "___"],
      ["4.3", "Configuration réseau : VLANs, DHCP, Firewall, Wi-Fi, ACL, VPN", "forfait", "___", "___"],
      ["4.4", "Installation et configuration système vidéosurveillance", "forfait", "___", "___"],
      ["4.5", "Tests complets, mise en service et documentation livrée", "forfait", "___", "___"],
      ["4.6", "Formation du responsable IT client (demi-journée)", "1 session", "___", "___"],
      ["", "SOUS-TOTAL HT", "", "", "___"],
      ["", "TVA ( ___ %)", "", "", "___"],
      ["", "TOTAL TTC", "", "", "___"],
    ],
    [400, 4000, 600, 1200, 2826]
  ));

  c.push(h2("4.3 — Conditions générales du devis"));
  c.push(makeTable(
    ["Rubrique", "Détail"],
    [
      ["Durée des travaux", "Environ ___ jours ouvrables consécutifs à compter de la date de l'ordre de service signé"],
      ["Acompte à la commande", "30% du montant TTC à la signature du devis, non remboursable en cas d'annulation"],
      ["Paiement intermédiaire", "40% à la livraison du matériel sur site"],
      ["Solde à la réception", "30% restants à la signature du procès-verbal de réception"],
      ["Garantie matériel", "24 mois sur le matériel fourni (retour fabricant) — les pannes dues à des surtensions ne sont pas couvertes"],
      ["Garantie main-d'oeuvre", "3 mois sur les travaux d'installation (câblage, montage)"],
      ["Support post-installation", "Assistance téléphonique gratuite 5 jours ouvrables/semaine pendant 30 jours après réception"],
      ["Validité du devis", "Ce devis est valable 30 jours à compter de sa date d'émission"],
      ["Travaux non inclus", "Alimentation électrique 220V vers rack (à la charge de l'électricien du client) — perçage béton armé renforcé"],
      ["Avenant", "Toute modification du périmètre initial donnera lieu à un avenant chiffré signé avant exécution"],
      ["Résolution de litige", "En cas de désaccord, les parties s'engagent à une médiation avant tout recours judiciaire"],
    ],
    [2000, 7026]
  ));
  c.push(sp());
  c.push(warnLines("ERREURS À NE PAS FAIRE SUR UN DEVIS", [
    "Ne JAMAIS commencer les travaux sans acompte signé — vous travailleriez à crédit",
    "Ne pas indiquer 'forfait' sans détailler ce qui est inclus — source de litiges",
    "Oublier de préciser ce qui N'est PAS inclus (ex : alimentation électrique) — surcoûts imprévus",
    "Accepter de réduire ses prix sans réduire la prestation — perte de qualité et de marge",
  ]));

  c.push(pb());

  // ══════════════════════════════════════════════════════════════════════
  // PARTIE 5 — ARCHITECTURE RÉSEAU
  // ══════════════════════════════════════════════════════════════════════
  c.push(h1("PARTIE 5 — ARCHITECTURE RÉSEAU (SCHÉMAS)"));
  c.push(p("Avant de brancher quoi que ce soit, dessinez votre architecture réseau. C'est votre carte routière. Ces schémas vous permettent de visualiser comment les équipements sont interconnectés."));

  c.push(h2("5.1 — Réseau très simple (TPE, moins de 10 postes)"));
  c.push(p("Idéal pour un petit cabinet, une boutique ou un bureau de 1 à 2 pièces."));
  c.push(sp());
  c.push(ascii([
    "                        INTERNET",
    "                           |",
    "                  ┌────────┴────────┐",
    "                  │  MODEM/BOX      │",
    "                  │  OPÉRATEUR      │  IP publique fournie par FAI",
    "                  └────────┬────────┘",
    "                           │ câble Cat6",
    "                  ┌────────┴────────┐",
    "                  │   ROUTEUR       │  192.168.1.1/24",
    "                  │  (MikroTik      │  ← Gateway de tout le réseau",
    "                  │   hEX)          │  ← DHCP activé",
    "                  └──────┬──────────┘",
    "                         │",
    "               ┌─────────┴──────────┐",
    "               │  SWITCH 8 PORTS    │",
    "               │  (non-manageable   │",
    "               │   acceptable ici)  │",
    "               └──┬──┬──┬──┬──┬────┘",
    "                  │  │  │  │  │",
    "                 PC1 PC2 PC3 AP  IMPRIMANTE",
    "                                (192.168.1.x)",
  ]));
  c.push(sp());
  c.push(info("Dans ce schéma, tous les équipements sont sur le même réseau 192.168.1.0/24. Il n'y a pas de segmentation. C'est acceptable pour moins de 10 postes sans données sensibles."));

  c.push(h2("5.2 — Réseau PME avec VLAN (10 à 100 employés)"));
  c.push(p("C'est l'architecture standard pour une entreprise. Chaque service est isolé dans son propre VLAN."));
  c.push(sp());
  c.push(ascii([
    "                        INTERNET",
    "                           |",
    "                  ┌────────┴────────┐",
    "                  │  ROUTEUR /      │",
    "                  │  FIREWALL       │  192.168.1.1 (WAN: IP publique)",
    "                  │  MikroTik       │  Interface Trunk vers Switch Core",
    "                  └────────┬────────┘",
    "                           │ Trunk 802.1Q (tous les VLANs)",
    "               ┌───────────┴───────────┐",
    "               │   SWITCH CORE         │  192.168.1.2 (gestion)",
    "               │   24 ports manageable │  TP-Link SG3428",
    "               └─┬────┬────┬────┬──────┘",
    "                 │    │    │    │",
    "            VLAN10  VLAN20  VLAN40  VLAN99",
    "          (Admin)  (Compta) (Caméras)(Invités)",
    "          192.168.10.x 20.x  40.x    99.x",
    "               │    │    │    │",
    "            ┌──┴─┐  └──┐ └──┐  └──┐",
    "            │SW  │  │SW│ │SW│  │AP │",
    "            │PoE │  │  │ │PoE│  │Wi │",
    "            └┬─┬─┘  └┬─┘ └┬─┘  └───┘",
    "             │ │      │    │",
    "            PCs APs  PCs  NVR+CAM",
  ]));
  c.push(sp());
  c.push(infoLines("POURQUOI LES VLAN ?", [
    "SÉCURITÉ : un virus dans le VLAN Comptabilité ne peut pas se propager au VLAN Direction",
    "PERFORMANCE : la diffusion broadcast est limitée à chaque VLAN (moins de bruit réseau)",
    "CONTRÔLE : les ACL permettent de définir exactement qui peut parler à qui",
    "VIDÉOSURVEILLANCE : les caméras sont isolées — personne ne peut y accéder sans autorisation",
  ]));

  c.push(h2("5.3 — Réseau multi-bâtiments (avec fibre optique)"));
  c.push(p("Quand deux bâtiments sont séparés par plus de 100 mètres, le câble Cat6 ne suffit plus. Il faut de la fibre optique."));
  c.push(sp());
  c.push(ascii([
    "  ╔══════════════════════════════════╗",
    "  ║      BÂTIMENT A (siège)          ║",
    "  ║                                  ║",
    "  ║  [INTERNET]──[ROUTEUR]           ║",
    "  ║                  │               ║",
    "  ║           [SWITCH CORE]          ║",
    "  ║            │    │    │            ║",
    "  ║         [SW1] [SW2] [SFP]────────╬── Fibre OM3",
    "  ║          PCs   APs   │            ║   Duplex LC/LC",
    "  ╚══════════════════════╪═══════════╝",
    "                         │",
    "         Fibre enterrée ou aérienne",
    "         Distance jusqu'à 300m (OM3)",
    "         ou 80km (OS2 monomode)",
    "                         │",
    "  ╔══════════════════════╪═══════════╗",
    "  ║      BÂTIMENT B (annexe)         ║",
    "  ║                      │           ║",
    "  ║                [SFP]─┘           ║",
    "  ║                  │               ║",
    "  ║           [SWITCH DIST.]         ║",
    "  ║            │    │    │            ║",
    "  ║          PCs   APs  Caméras       ║",
    "  ╚══════════════════════════════════╝",
  ]));
  c.push(sp());
  c.push(tip("Le module SFP (Small Form-factor Pluggable) se branche dans un port SFP du switch. Il existe des SFP cuivre (RJ45) pour les courtes distances et des SFP fibre pour les longues distances."));

  c.push(h2("5.4 — Réseau avec DMZ (zone démilitarisée)"));
  c.push(p("La DMZ est une zone réseau intermédiaire où l'on place les serveurs accessibles depuis Internet (serveur web, mail) tout en les isolant du réseau interne."));
  c.push(sp());
  c.push(ascii([
    "                     INTERNET",
    "                        │",
    "              ┌─────────┴─────────┐",
    "              │    FIREWALL NGFW  │",
    "              │  (FortiGate 60F)  │",
    "              └──┬────────┬───────┘",
    "                 │        │",
    "              ┌──┴──┐  ┌──┴───────────┐",
    "              │ DMZ │  │  LAN INTERNE  │",
    "              │     │  │  (VLANs)      │",
    "              │ [Srv│  │ [Switch Core] │",
    "              │  Web│  │  VLAN10 Admin │",
    "              │  Mail   │  VLAN20 Compta│",
    "              │  FTP]│  │  VLAN40 Cams  │",
    "              └─────┘  └───────────────┘",
    "",
    "  RÈGLES FIREWALL :",
    "  Internet  ──→  DMZ       : AUTORISÉ (ports 80, 443)",
    "  Internet  ──→  LAN       : BLOQUÉ",
    "  LAN       ──→  DMZ       : AUTORISÉ",
    "  DMZ       ──→  LAN       : BLOQUÉ",
  ]));

  c.push(h2("5.5 — Réseau vidéosurveillance isolé"));
  c.push(p("Les caméras NE doivent JAMAIS être sur le même réseau que les PC des employés. Voici pourquoi et comment les isoler."));
  c.push(sp());
  c.push(ascii([
    "  SWITCH CORE (manageable)",
    "       │",
    "       ├── Port 1-4   : VLAN10 (Administration) ──→ PCs",
    "       ├── Port 5-8   : VLAN20 (Comptabilité)   ──→ PCs",
    "       ├── Port 9-16  : VLAN40 (Caméras)        ──→ Câblage PoE",
    "       │                                               │",
    "       │                                    ┌──────────┴──────────┐",
    "       │                                    │  SWITCH PoE DÉDIÉ   │",
    "       │                                    │  VLAN40 uniquement  │",
    "       │                                    └─┬──┬──┬──┬──┬──┬───┘",
    "       │                                      │  │  │  │  │  │",
    "       │                                     CAM CAM CAM CAM NVR",
    "       │                                    (192.168.40.x)",
    "       │",
    "  RÈGLES ACL :",
    "  VLAN40 ──→ Internet : BLOQUÉ (caméras sans accès web)",
    "  VLAN40 ──→ VLAN10   : BLOQUÉ (caméras ne voient pas les PCs)",
    "  VLAN10 ──→ VLAN40   : AUTORISÉ (l'admin peut voir les caméras)",
  ]));
  c.push(sp());
  c.push(danger("Si vos caméras sont sur le même réseau que vos PC, un virus peut accéder au flux vidéo, désactiver les caméras ou utiliser la bande passante pour des attaques. Toujours isoler les caméras dans un VLAN dédié."));

  c.push(h2("5.6 — Réseau Wi-Fi avec réseau Invités isolé"));
  c.push(ascii([
    "  UN SEUL AP PHYSIQUE — DEUX RÉSEAUX SÉPARÉS",
    "",
    "  ┌─────────────────────────────────────────────┐",
    "  │           POINT D'ACCÈS Wi-Fi                │",
    "  │                                              │",
    "  │  SSID: ENTREPRISE   SSID: VISITEURS-FREE    │",
    "  │  (WPA3, VLAN10)     (WPA2 ou Portail Captif) │",
    "  │  192.168.10.0/24    192.168.99.0/24          │",
    "  └──────────────┬──────────────────────────────┘",
    "                  │ Port Trunk 802.1Q",
    "                  │ (transporte VLAN10 + VLAN99)",
    "           [SWITCH CORE]",
    "                  │",
    "           [ROUTEUR/FIREWALL]",
    "            │              │",
    "         VLAN10          VLAN99",
    "         (accès           (Internet",
    "          complet)         UNIQUEMENT)",
    "                           ↑",
    "                     ACL bloque l'accès",
    "                     au réseau interne",
  ]));
  c.push(sp());
  c.push(infoLines("FONCTIONNEMENT DU PORTAIL CAPTIF (Captive Portal)", [
    "Le visiteur se connecte au Wi-Fi 'VISITEURS-FREE' sans mot de passe",
    "Son navigateur s'ouvre automatiquement sur une page de connexion personnalisée",
    "Il accepte les CGU ou entre un code reçu par SMS, puis accède à Internet",
    "Son accès est limité dans le temps (ex : 2h) et en débit (ex : 5 Mbps)",
    "Son activité est loggée pour traçabilité légale",
  ]));

  c.push(pb());

  return c;
}

module.exports = { getSections1to5 };
