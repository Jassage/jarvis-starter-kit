const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TableOfContents, ExternalHyperlink
} = require('docx');
const fs = require('fs');

// ─── helpers ────────────────────────────────────────────────────────────────
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const W = 9026; // A4 content width DXA (1 inch margins)

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, color: "1F4E79" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, color: "2E75B6" })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 60 },
    children: [new TextRun({ text, bold: true, size: 24, color: "2F5496" })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, ...opts })]
  });
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function code(text) {
  return new Paragraph({
    spacing: { after: 60 },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "C00000" })]
  });
}
function note(text) {
  return new Paragraph({
    spacing: { after: 120 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: "FFC000" } },
    children: [new TextRun({ text: "NOTE : " + text, size: 20, italics: true, color: "7F6000" })]
  });
}

const numbering = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }, {
        level: 1, format: LevelFormat.BULLET, text: "◦",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
      }]
    },
    {
      reference: "numbered",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }
  ]
};

function li(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22 })]
  });
}
function ni(text) {
  return new Paragraph({
    numbering: { reference: "numbered", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function tableHeader(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: "1F4E79", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c, bold: true, color: "FFFFFF", size: 20 })] })]
    }))
  });
}
function tableRow(cells, widths, shade = false) {
  return new TableRow({
    children: cells.map((c, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: shade ? "EBF3FB" : "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: c, size: 20 })] })]
    }))
  });
}
function makeTable(headers, rows, widths) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      tableHeader(headers, widths),
      ...rows.map((r, i) => tableRow(r, widths, i % 2 === 0))
    ]
  });
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

const children = [];

// ── Page de garde ────────────────────────────────────────────────────────────
children.push(
  new Paragraph({ spacing: { before: 1440, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MANUEL PROFESSIONNEL", size: 56, bold: true, color: "1F4E79" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Réseau Informatique & Vidéosurveillance IP", size: 36, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Guide complet — De l'analyse à la mise en production", size: 26, italics: true, color: "595959" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Version 1.0 — 2025", size: 22, color: "808080" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cisco · MikroTik · Ubiquiti · TP-Link Omada · Hikvision · Dahua", size: 20, color: "808080" })] }),
  pb(),
  new TableOfContents("Table des matières", { hyperlink: true, headingStyleRange: "1-3" }),
  pb()
);

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 1 — ANALYSE DES BESOINS
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 1 — ANALYSE DES BESOINS"));
children.push(p("Avant toute conception, il faut collecter l'ensemble des informations chez le client. Cette checklist couvre tous les aspects d'un projet réseau et vidéosurveillance.", { bold: false }));

children.push(h2("1.1 Informations générales sur l'entreprise"));
[
  "Nom de l'entreprise, secteur d'activité, taille",
  "Adresse complète du site (ou des sites)",
  "Nombre d'employés total et répartition par service",
  "Nombre de bâtiments et de sites distants",
  "Nombre d'étages par bâtiment",
  "Superficie approximative de chaque étage (m²)",
  "Type de construction : béton, cloisons légères, faux-plafonds ?",
  "Présence de locaux techniques ou de salle serveur existante ?",
  "Horaires d'ouverture et jours de fonctionnement",
  "Interlocuteur technique sur place (nom, fonction, téléphone)"
].forEach(t => children.push(li(t)));

children.push(h2("1.2 Inventaire des équipements existants"));
children.push(makeTable(
  ["Équipement", "Quantité actuelle", "À remplacer ?", "Notes"],
  [
    ["Ordinateurs fixes (postes de travail)", "?", "Oui / Non", ""],
    ["Ordinateurs portables", "?", "Oui / Non", ""],
    ["Imprimantes réseau", "?", "Oui / Non", ""],
    ["Téléphones IP (VoIP)", "?", "Oui / Non", ""],
    ["Serveurs physiques", "?", "Oui / Non", ""],
    ["NAS (stockage réseau)", "?", "Oui / Non", ""],
    ["Points d'accès Wi-Fi", "?", "Oui / Non", ""],
    ["Caméras IP", "?", "Oui / Non", ""],
    ["NVR / DVR", "?", "Oui / Non", ""],
    ["Lecteurs de contrôle d'accès", "?", "Oui / Non", ""],
    ["Switch(es) réseau", "?", "Oui / Non", ""],
    ["Routeur / Pare-feu", "?", "Oui / Non", ""],
    ["Onduleur (UPS)", "?", "Oui / Non", ""],
  ],
  [3000, 2000, 1500, 2526]
));

children.push(h2("1.3 Connectivité Internet"));
[
  "Opérateur Internet actuel et type de lien (fibre, ADSL, 4G/5G, satellite)",
  "Débit download / upload contractuel et réel (faire un speedtest)",
  "Adresse IP fixe ou dynamique ? Combien d'IP publiques ?",
  "Besoin d'une connexion de secours (failover) ?",
  "Opérateur secondaire envisagé pour le backup Internet",
  "Lien WAN entre bâtiments : fibre noire, VPN MPLS, VPN Internet ?",
  "Distance entre les bâtiments (si plusieurs sites)",
  "Possibilité de passage de fibre enterrée ou aérienne entre bâtiments ?",
].forEach(t => children.push(li(t)));

children.push(h2("1.4 Besoins réseau et sécurité"));
[
  "Séparation des réseaux souhaitée (VLAN par service) ?",
  "Accès Wi-Fi pour les employés ? Et pour les visiteurs/invités ?",
  "Authentification réseau : Active Directory, RADIUS, certificats ?",
  "VPN requis pour télétravail ou accès distant ?",
  "Filtrage web (contrôle parental, blacklist de sites) ?",
  "Proxy / inspection HTTPS ?",
  "Politique de mot de passe et renouvellement ?",
  "Besoin de QoS pour la VoIP ou le streaming vidéo ?",
  "Supervision / monitoring réseau souhaitée (SNMP, Zabbix, PRTG) ?",
  "Sauvegardes des configurations réseau ?",
  "Conformité à une norme (ISO 27001, PCI-DSS, RGPD) ?",
].forEach(t => children.push(li(t)));

children.push(h2("1.5 Besoins en vidéosurveillance"));
[
  "Nombre de caméras souhaité et emplacement prévu (entrées, couloirs, parking, bureaux)",
  "Type de caméra : dôme, bullet, PTZ, fisheye, intérieur/extérieur",
  "Résolution souhaitée : 2 MP (1080p), 4 MP, 8 MP (4K)",
  "Vision nocturne (IR) ou ColorVu (couleur la nuit) ?",
  "Durée de rétention des enregistrements (7 jours, 30 jours, 90 jours)",
  "Enregistrement continu ou sur détection de mouvement ?",
  "Accès à distance aux caméras (smartphone, PC) ?",
  "Intégration contrôle d'accès (ouverture de porte sur détection) ?",
  "Alarme et notification par email/SMS ?",
  "Moniteur(s) de visualisation en temps réel (combien, où) ?",
].forEach(t => children.push(li(t)));

children.push(h2("1.6 Besoins futurs et évolutivité"));
[
  "Prévision de croissance des effectifs à 2-3 ans",
  "Nouveaux sites ou bâtiments à intégrer ?",
  "Projet téléphonie IP (migration depuis analogique) ?",
  "Projet cloud (Azure, AWS, OVH) et besoins de bande passante futurs",
  "Automatisation / domotique / IoT prévu ?",
  "Budget disponible pour cette phase et budget pour les phases futures",
].forEach(t => children.push(li(t)));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 2 — VISITE TECHNIQUE (SITE SURVEY)
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 2 — VISITE TECHNIQUE (SITE SURVEY)"));

children.push(h2("2.1 Préparation de la visite"));
children.push(p("Matériel à apporter lors de la visite :"));
["Mètre laser ou à ruban (minimum 50 m)", "Appareil photo ou smartphone (photos de chaque local)", "Plan papier ou tablette avec application de plans (Floorplanner, RoomSketcher)", "Carnet de notes et stylo", "Lampe torche (combles, faux-plafonds, gaines)", "Tournevis (accès aux tableaux électriques)", "Testeur de câble RJ45 basique", "Outil de découverte Wi-Fi (application WiFi Analyzer sur Android)"].forEach(t => children.push(li(t)));

children.push(h2("2.2 Réalisation du plan du bâtiment"));
[ni, ni, ni, ni, ni].forEach(() => {});
[
  "Mesurer chaque pièce : longueur x largeur. Consigner dans le plan.",
  "Reporter les portes, fenêtres, murs porteurs (obstacles câblage).",
  "Localiser le tableau électrique principal (emplacement onduleur et rack).",
  "Identifier les faux-plafonds et goulottes existantes.",
  "Photographier chaque angle de pièce, les combles, les gaines techniques.",
  "Repérer les points d'entrée Internet (DTI/box opérateur).",
  "Mesurer les distances entre les bâtiments (si multi-site).",
].forEach(t => children.push(ni(t)));

children.push(h2("2.3 Calcul des longueurs de câble"));
children.push(p("Règle de base : ajouter 20 % de marge à chaque mesure. La norme TIA-568 limite une passe à 90 m de câble horizontal + 10 m de cordons = 100 m max."));
children.push(makeTable(
  ["Pièce / Emplacement", "Distance réelle (m)", "Marge 20%", "Longueur câble (m)", "Type câble"],
  [
    ["Bureau 1 — prise 1", "25", "+5", "30", "Cat6 UTP"],
    ["Bureau 2 — prise 1", "38", "+8", "46", "Cat6 UTP"],
    ["Salle de réunion — AP Wi-Fi", "45", "+9", "54", "Cat6 UTP"],
    ["Parking — Caméra ext. 1", "60", "+12", "72", "Cat6 UTP"],
    ["Bâtiment B — lien inter-site", "80", "—", "80", "Fibre OM3"],
  ],
  [2200, 1500, 1200, 2126, 2000]
));

children.push(h2("2.4 Emplacement des équipements actifs"));
children.push(h3("Emplacement du rack principal"));
["Choisir une pièce sécurisée, ventilée, sans humidité.", "Idéalement dans un local technique ou une salle serveur.", "Accessible uniquement au personnel autorisé.", "Alimentation électrique avec onduleur.", "Distance maximale de 90 m vers le point le plus éloigné.", "Éviter les interférences (moteurs, groupes électrogènes)."].forEach(t => children.push(li(t)));

children.push(h3("Emplacement des points d'accès Wi-Fi"));
["Un AP couvre environ 25-50 m en espace ouvert, 15-25 m avec cloisons.", "Installer en hauteur (plafond ou haut de mur) pour une couverture optimale.", "Éviter les zones proches de micro-ondes, téléphones DECT, métaux.", "Utiliser un outil de heat-map (Ekahau, NetSpot) pour valider la couverture.", "Prévoir 15-20 % de chevauchement entre deux AP pour le roaming."].forEach(t => children.push(li(t)));

children.push(h3("Emplacement des caméras"));
["Entrées et sorties principales : caméra grand angle (92-110°).", "Couloirs : caméra bullet ou dôme avec objectif 2.8 mm.", "Parking : caméra extérieure IP67, IR longue portée (30-50 m).", "Caissier / accueil : caméra haute résolution 4 MP minimum.", "Hauteur d'installation optimale : 2.5 m à 3.5 m.", "Éviter le contre-jour (ne pas pointer vers une fenêtre sans WDR)."].forEach(t => children.push(li(t)));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 3 — LISTE COMPLÈTE DU MATÉRIEL
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 3 — LISTE COMPLÈTE DU MATÉRIEL"));
children.push(note("Les prix sont des fourchettes indicatives USD. Adapter selon le marché local et les fournisseurs disponibles."));

children.push(h2("3.1 Équipements actifs réseau"));
children.push(makeTable(
  ["Équipement", "Référence suggérée", "Qté", "P.U. (USD)", "Total (USD)"],
  [
    ["Routeur/Firewall PME", "MikroTik RB4011 ou Cisco RV340", "1", "180-350", "180-350"],
    ["Pare-feu NGFW", "Fortinet FortiGate 60F", "1", "400-700", "400-700"],
    ["Switch manageable L2 24p", "TP-Link TL-SG3428 / Cisco CBS350", "1", "150-350", "150-350"],
    ["Switch PoE 24p 193W", "TP-Link TL-SG3428MP / Ubiquiti USW-24-PoE", "1", "250-500", "250-500"],
    ["Switch PoE 8p (secondaire)", "TP-Link TL-SG2210MP", "2", "80-150", "160-300"],
    ["Point d'accès Wi-Fi 6 (AP)", "Ubiquiti U6-LR / TP-Link EAP670", "4-8", "100-200", "400-1600"],
    ["Contrôleur Wi-Fi (si non cloud)", "TP-Link Omada OC200 ou softcontroller", "1", "0-30", "0-30"],
    ["Onduleur 1500 VA", "APC SMT1500I / Eaton 5E 1500", "1", "200-350", "200-350"],
    ["Onduleur 650 VA (commutation)", "APC BE650G2", "2", "60-90", "120-180"],
  ],
  [2500, 2200, 600, 1100, 1626]
));

children.push(h2("3.2 Câblage et infrastructure passive"));
children.push(makeTable(
  ["Équipement", "Spécification", "Qté", "P.U. (USD)", "Total (USD)"],
  [
    ["Câble réseau Cat6 UTP", "Bobine 305 m, blindage U/UTP", "3-5 bobines", "60-90/bobine", "180-450"],
    ["Câble Cat6A FTP (zones critiques)", "Blindé, 305 m", "1-2 bobines", "90-130/bobine", "90-260"],
    ["Fibre optique OM3 50/125", "Câble 4 brins (inter-bâtiments)", "selon distance", "1.5-3 $/m", "variable"],
    ["Connecteurs RJ45 Cat6", "Blindé, pince-stop", "boîte 100", "15-25", "15-25"],
    ["Prises murales RJ45 Cat6 (keystone)", "Simple ou double, encastré", "30-60", "3-8", "90-480"],
    ["Patch panel 24p Cat6", "1U, avec étiquettes", "2", "40-70", "80-140"],
    ["Cordon de brassage 0.5 m", "Cat6, couleurs variées", "50", "2-4", "100-200"],
    ["Cordon de brassage 1 m", "Cat6", "20", "3-5", "60-100"],
    ["Goulottes PVC 40x20 mm", "Longueur 2 m", "30-50 barres", "3-6", "90-300"],
    ["Goulottes PVC 60x40 mm (principale)", "Longueur 2 m", "10-20 barres", "6-10", "60-200"],
    ["Goulottes CELO plafond", "Galvanisé 3 m (câbles lourds)", "10-20", "8-15", "80-300"],
    ["Tubes IRO / PVC encastré", "Diamètre 20 mm, 3 m", "20-40", "2-4", "40-160"],
    ["SFP fibre LC multimodes", "1G OM3, paire Tx/Rx", "4", "20-40", "80-160"],
    ["Cassette fibre LC/LC OM3", "6 ou 12 brins", "2", "30-50", "60-100"],
    ["Jarretière fibre LC/LC duplex", "3 m OM3", "4", "8-15", "32-60"],
  ],
  [2200, 2200, 1000, 1200, 2426]
));

children.push(h2("3.3 Rack et baie de brassage"));
children.push(makeTable(
  ["Équipement", "Spécification", "Qté", "P.U. (USD)", "Total (USD)"],
  [
    ["Rack fermé 12U mural", "450 mm profondeur, avec ventilateur", "1", "80-150", "80-150"],
    ["Rack ouvert 19\" 22U sur pieds", "600x600 mm, avec PDU", "1", "120-200", "120-200"],
    ["PDU multiprise 19\" 8 prises", "Avec parafoudre, 16A", "2", "30-60", "60-120"],
    ["Ventilateur rack 1U", "2 x 80 mm, thermostat", "1", "20-40", "20-40"],
    ["Panneau passe-câble 1U", "Avec brosse, horizontal", "2", "10-20", "20-40"],
    ["Équerre en L 19\" 1U", "Pour équipements légers", "4", "8-15", "32-60"],
    ["Chevilles et vis rack M6", "Boîte 50 pièces", "1", "8-15", "8-15"],
    ["Colliers de câblage réutilisables", "Velcro, boîte 100", "1", "10-20", "10-20"],
    ["Étiquettes pour câbles (gaines)", "Auto-plastifiantes, rouleau", "1", "15-30", "15-30"],
  ],
  [2200, 2200, 1000, 1600, 2026]
));

children.push(h2("3.4 Système de vidéosurveillance"));
children.push(makeTable(
  ["Équipement", "Spécification", "Qté", "P.U. (USD)", "Total (USD)"],
  [
    ["Caméra dôme IP 4 MP intérieure", "Hikvision DS-2CD2143G2-I, IR 40m", "4-8", "60-100", "240-800"],
    ["Caméra bullet IP 4 MP extérieure", "Hikvision DS-2CD2T43G2-4I, IR 80m", "4-6", "80-130", "320-780"],
    ["Caméra PTZ 2 MP extérieure", "Hikvision DS-2DE4A425IWG-E, 25x zoom", "1-2", "250-450", "250-900"],
    ["NVR 16 voies 4K", "Hikvision DS-7616NI-I2/16P, PoE intégré", "1", "350-600", "350-600"],
    ["NVR 8 voies (petite installation)", "Hikvision DS-7608NI-I2/8P", "1", "180-300", "180-300"],
    ["Disque dur surveillance 4 To", "WD Purple WD40PURX", "2-4", "80-120", "160-480"],
    ["Disque dur surveillance 8 To", "Seagate SkyHawk ST8000VX004", "2-4", "130-180", "260-720"],
    ["Écran Full HD 21.5\" (monitoring)", "Samsung ou LG FHD, HDMI/VGA", "1-2", "100-180", "100-360"],
    ["Câble HDMI 2 m (NVR-écran)", "", "1-2", "5-15", "5-30"],
    ["Support mural caméra bullet", "Métal galvanisé, réglable", "6", "8-15", "48-90"],
    ["Boîtier étanche pour connexions", "IP67, 80x80 mm", "6", "5-10", "30-60"],
  ],
  [2200, 2400, 700, 1200, 2526]
));

children.push(h2("3.5 Outils d'installation"));
children.push(makeTable(
  ["Outil", "Usage", "Qté", "P.U. (USD)"],
  [
    ["Testeur de câble RJ45 professionnel", "Vérification continuité et paires", "1", "30-80"],
    ["Testeur de câble certifié (Fluke DSX)", "Certification Cat6/Cat6A TIA-568", "1 (location)", "500-1500/sem"],
    ["Pince à sertir RJ45", "Câble Cat6, cliquet professionnel", "1", "25-60"],
    ["Outil de coupe-dénudage", "Coupe propre sans endommager", "1", "15-30"],
    ["Outil de sertissage keystone (punch-down)", "110-type ou Krone", "1", "15-40"],
    ["Multimètre numérique", "Tension, résistance, continuité", "1", "20-60"],
    ["Perceuse à percussion", "Passage de câbles dans béton", "1", "80-200"],
    ["Forets béton 16 mm et 20 mm", "Passage gaines", "kit", "10-30"],
    ["Mètre laser", "Mesures précises", "1", "30-80"],
    ["Lampe torche rechargeable", "Faux-plafonds, combles", "1", "15-40"],
    ["Escabeau 3 m", "Pose AP et caméras en hauteur", "1", "60-120"],
    ["Marqueur permanent + étiquettes", "Étiquetage câbles", "kit", "5-15"],
  ],
  [2500, 2500, 800, 3226]
));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 4 — DEVIS PROFESSIONNEL
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 4 — DEVIS PROFESSIONNEL"));
children.push(p("Modèle de devis complet. Adapter les valeurs à chaque projet."));

children.push(h2("4.1 En-tête du devis"));
children.push(makeTable(
  ["Prestataire", "Client"],
  [
    ["Nom : ____________________", "Nom / Raison sociale : ____________________"],
    ["Adresse : ____________________", "Adresse : ____________________"],
    ["Téléphone : ____________________", "Téléphone : ____________________"],
    ["Email : ____________________", "Email : ____________________"],
    ["N° de devis : DEV-2025-001", "Référence client : ____________________"],
    ["Date : ____________________", "Valable jusqu'au : ____________________"],
  ],
  [4513, 4513]
));

children.push(h2("4.2 Corps du devis"));
children.push(makeTable(
  ["N°", "Description", "Qté", "P.U. (HTG/USD)", "Total HT"],
  [
    ["1", "Routeur/Firewall MikroTik RB4011 fourni et configuré", "1", "___", "___"],
    ["2", "Switch manageable TP-Link TL-SG3428 24 ports", "1", "___", "___"],
    ["3", "Switch PoE 24 ports 193 W", "1", "___", "___"],
    ["4", "Points d'accès Wi-Fi 6 (fournis et installés)", "4", "___", "___"],
    ["5", "Câblage Cat6 UTP — pose et passage (m linéaire)", "___", "___", "___"],
    ["6", "Prises murales RJ45 double (keystones)", "20", "___", "___"],
    ["7", "Patch panel 24 ports avec brassage", "1", "___", "___"],
    ["8", "Rack mural 12U fermé avec PDU", "1", "___", "___"],
    ["9", "Onduleur 1500 VA APC", "1", "___", "___"],
    ["10", "Caméras IP 4 MP (intérieur)", "4", "___", "___"],
    ["11", "Caméras IP 4 MP (extérieur)", "4", "___", "___"],
    ["12", "NVR 16 voies avec 2 HDD 4 To", "1", "___", "___"],
    ["13", "Main-d'oeuvre installation et câblage", "forfait", "___", "___"],
    ["14", "Configuration réseau (VLAN, firewall, Wi-Fi)", "forfait", "___", "___"],
    ["15", "Tests, mise en service et formation utilisateur", "forfait", "___", "___"],
    ["", "SOUS-TOTAL HT", "", "", "___"],
    ["", "TVA (___%) ", "", "", "___"],
    ["", "TOTAL TTC", "", "", "___"],
  ],
  [500, 3500, 700, 1800, 2526]
));

children.push(h2("4.3 Conditions et modalités"));
children.push(makeTable(
  ["Rubrique", "Détail"],
  [
    ["Durée des travaux", "Environ ___ jours ouvrables à partir de la date d'ordre de service"],
    ["Garantie matériel", "12 mois sur le matériel fourni (retour fabricant), 3 mois sur la main-d'oeuvre"],
    ["Modalités de paiement", "30% à la commande — 40% à mi-chantier — 30% à la réception"],
    ["Délai de validité", "Ce devis est valable 30 jours à compter de sa date d'émission"],
    ["Conditions de recette", "Recette contradictoire en présence du client — PV de réception signé"],
    ["Support post-installation", "Assistance téléphonique 5 jours pendant 30 jours après réception"],
    ["Travaux non inclus", "Alimentation électrique 220V vers rack (à prévoir par l'électricien)"],
    ["Clause de révision", "Toute modification du périmètre fera l'objet d'un avenant signé"],
  ],
  [2000, 7026]
));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 5 — ARCHITECTURE RÉSEAU (schémas ASCII)
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 5 — ARCHITECTURE RÉSEAU"));

children.push(h2("5.1 Réseau simple (TPE, moins de 10 postes)"));
children.push(code("INTERNET"));
children.push(code("    |"));
children.push(code("  [MODEM/BOX OPÉRATEUR]"));
children.push(code("    |"));
children.push(code("  [ROUTEUR/FIREWALL]  192.168.1.1/24"));
children.push(code("    |"));
children.push(code("  [SWITCH 8-16 PORTS]"));
children.push(code("  /    |    |    |   \\"));
children.push(code("PC1  PC2  PC3  AP   IMPRIMANTE"));

children.push(h2("5.2 Réseau PME avec VLAN (10-100 employés)"));
children.push(code("INTERNET  ----  [ROUTEUR/FIREWALL]  192.168.0.1"));
children.push(code("                       |"));
children.push(code("              [SWITCH MANAGEABLE CORE L2/L3]"));
children.push(code("         /       |        |        |        \\"));
children.push(code("   VLAN10    VLAN20    VLAN30    VLAN40    VLAN50"));
children.push(code(" (Admin)   (Compta)  (RH/Dir)  (Cams)   (Invités)"));
children.push(code("  /            |         |        |          \\"));
children.push(code("[SW-PoE]  [SW-PoE]  [SW-PoE]  [SW-PoE]    [AP-Guest]"));
children.push(code("  |            |         |        |"));
children.push(code("PCs          PCs       PCs    [NVR + Caméras]"));

children.push(h2("5.3 Réseau multi-bâtiments"));
children.push(code("             ┌─────────────────────────────────┐"));
children.push(code("             │         BÂTIMENT A (siège)       │"));
children.push(code("             │  [Routeur] ── [Switch Core]      │"));
children.push(code("             │               /    \\             │"));
children.push(code("             │          [SW-PoE] [SW-PoE]       │"));
children.push(code("             │            PCs      APs           │"));
children.push(code("             └──────────────┬──────────────────┘"));
children.push(code("                             │ Fibre OM3 / VPN"));
children.push(code("             ┌──────────────┴──────────────────┐"));
children.push(code("             │         BÂTIMENT B (annexe)      │"));
children.push(code("             │  [Switch L2 distant]             │"));
children.push(code("             │     /     |     \\                │"));
children.push(code("             │  PCs    APs   Caméras            │"));
children.push(code("             └─────────────────────────────────┘"));

children.push(h2("5.4 Réseau avec VLAN Sécurisé (DMZ)"));
children.push(code("INTERNET"));
children.push(code("    |"));
children.push(code("  [FIREWALL NGFW]"));
children.push(code("  /       |        \\"));
children.push(code("WAN    [DMZ]       LAN INTERNE"));
children.push(code("     (Serveurs     [Switch Core]"));
children.push(code("     publics:       /    |    \\"));
children.push(code("     Web, Mail)  VLAN  VLAN  VLAN"));
children.push(code("                Admin Prod  Cams"));

children.push(h2("5.5 Réseau vidéosurveillance isolé"));
children.push(code("  [NVR]  ──  [Switch PoE dédié VLAN40]"));
children.push(code("               /    |    |    \\"));
children.push(code("             CAM1 CAM2 CAM3  CAM4"));
children.push(code("             (Réseau 10.10.40.0/24 — sans accès Internet direct)"));
children.push(code("              Accès contrôlé via ACL sur le Switch Core"));

children.push(h2("5.6 Wi-Fi Invités — Réseau isolé"));
children.push(code("  [AP Wi-Fi]"));
children.push(code("  SSID: STAFF  (WPA3, VLAN10, 192.168.10.0/24)"));
children.push(code("  SSID: GUESTS (WPA2, VLAN99, 192.168.99.0/24, portail captif)"));
children.push(code("  ↕ Trunk 802.1Q vers Switch Core"));
children.push(code("  VLAN99 → Firewall → Internet UNIQUEMENT (bloqué du LAN interne)"));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 6 — PLAN D'ADRESSAGE IP
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 6 — PLAN D'ADRESSAGE IP"));

children.push(h2("6.1 Rappels fondamentaux IPv4"));
children.push(makeTable(
  ["Classe", "Plage réseau", "Masque défaut", "Hôtes max", "Usage"],
  [
    ["A", "10.0.0.0/8", "255.0.0.0", "16 777 214", "Grands réseaux"],
    ["B", "172.16.0.0/12", "255.240.0.0", "1 048 574", "Moyens réseaux"],
    ["C", "192.168.0.0/16", "255.255.0.0", "65 534", "Petits réseaux"],
    ["/24", "192.168.x.0/24", "255.255.255.0", "254", "VLAN standard PME"],
    ["/25", "192.168.x.0/25", "255.255.255.128", "126", "Petit VLAN"],
    ["/26", "192.168.x.0/26", "255.255.255.192", "62", "Très petit VLAN"],
  ],
  [800, 2000, 1800, 1400, 3026]
));

children.push(h2("6.2 Plan d'adressage complet — PME type"));
children.push(makeTable(
  ["VLAN ID", "Nom", "Réseau", "Masque", "Gateway", "DNS", "DHCP Range", "Hôtes max"],
  [
    ["10", "Administration", "192.168.10.0", "/24", "192.168.10.1", "192.168.10.1", "192.168.10.10 – .100", "91"],
    ["20", "Comptabilité", "192.168.20.0", "/24", "192.168.20.1", "192.168.10.1", "192.168.20.10 – .100", "91"],
    ["30", "Direction", "192.168.30.0", "/24", "192.168.30.1", "192.168.10.1", "192.168.30.10 – .50", "41"],
    ["40", "Caméras / NVR", "192.168.40.0", "/24", "192.168.40.1", "—", "STATIQUE uniquement", "254"],
    ["50", "Wi-Fi Employés", "192.168.50.0", "/24", "192.168.50.1", "192.168.10.1", "192.168.50.10 – .200", "191"],
    ["60", "Serveurs", "192.168.60.0", "/24", "192.168.60.1", "192.168.60.5", "STATIQUE uniquement", "254"],
    ["70", "Téléphonie IP", "192.168.70.0", "/24", "192.168.70.1", "192.168.10.1", "192.168.70.10 – .100", "91"],
    ["99", "Invités Wi-Fi", "192.168.99.0", "/24", "192.168.99.1", "8.8.8.8", "192.168.99.10 – .250", "241"],
  ],
  [600, 1200, 1300, 700, 1300, 1200, 2000, 726]
));

children.push(h2("6.3 Adresses IP statiques réservées"));
children.push(makeTable(
  ["Équipement", "VLAN", "Adresse IP", "Masque", "Rôle"],
  [
    ["Routeur/Firewall (WAN)", "—", "IP publique opérateur", "/30", "Passerelle Internet"],
    ["Routeur/Firewall (LAN)", "Trunk", "192.168.1.1", "/24", "Gateway par défaut"],
    ["Switch Core", "Mgmt", "192.168.1.2", "/24", "Administration switch"],
    ["Switch PoE 1", "Mgmt", "192.168.1.3", "/24", "Administration switch"],
    ["Switch PoE 2", "Mgmt", "192.168.1.4", "/24", "Administration switch"],
    ["AP Wi-Fi 1", "50", "192.168.50.2", "/24", "Point d'accès bureau 1"],
    ["AP Wi-Fi 2", "50", "192.168.50.3", "/24", "Point d'accès bureau 2"],
    ["Serveur principal", "60", "192.168.60.10", "/24", "AD/DNS/DHCP"],
    ["NAS", "60", "192.168.60.20", "/24", "Stockage fichiers"],
    ["NVR", "40", "192.168.40.10", "/24", "Enregistreur vidéo"],
    ["Caméra 1", "40", "192.168.40.21", "/24", "Entrée principale"],
    ["Caméra 2", "40", "192.168.40.22", "/24", "Couloir RDC"],
    ["Caméra 3", "40", "192.168.40.23", "/24", "Parking"],
    ["Imprimante réseau", "10", "192.168.10.200", "/24", "Imprimante partagée"],
  ],
  [2000, 800, 1500, 800, 3926]
));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 7 — INSTALLATION PHYSIQUE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 7 — INSTALLATION PHYSIQUE"));

children.push(h2("7.1 Pose des goulottes"));
[
  "Tracer le chemin au cordeau avant de percer. Respecter les angles droits.",
  "Fixer la goulotte tous les 50 cm sur béton, 30 cm sur placo.",
  "Utiliser des goulottes 60x40 mm pour le chemin principal (> 10 câbles).",
  "Goulottes 40x20 mm pour les dérivations vers les prises murales.",
  "Séparer systématiquement : courants forts (220V) et courants faibles (réseau/CCTV) dans des goulottes différentes, distance minimum 20 cm.",
  "Angles : utiliser des coudes à 90° et des dérivations T préfabriqués (pas de découpe à la hache).",
  "Laisser 30% d'espace libre pour les ajouts futurs.",
].forEach(t => children.push(li(t)));

children.push(h2("7.2 Passage et organisation des câbles"));
["Numéroter chaque câble dès sa pose (marqueur ou étiquette autocollante).", "Ne jamais dépasser 90 m de câble horizontal (norme TIA-568-C).", "Regrouper les câbles par destination avec des serre-câbles.", "Respecter le rayon de courbure minimum : 4x le diamètre du câble Cat6.", "Ne jamais écraser, tordre ou nouer les câbles.", "En faux-plafond : poser sur chemins de câbles (ne pas laisser flotter).", "Pour la fibre : rayon de courbure minimum 30 mm — ne jamais plier."].forEach(t => children.push(li(t)));

children.push(h2("7.3 Sertissage RJ45 — Cat6 T568B (standard)"));
children.push(p("Ordre des fils (standard T568B) — utilisé dans 95% des installations professionnelles :"));
children.push(makeTable(
  ["Pin", "Couleur T568B", "Fonction"],
  [
    ["1", "Blanc/Orange", "TX+"],
    ["2", "Orange", "TX-"],
    ["3", "Blanc/Vert", "RX+"],
    ["4", "Bleu", "—"],
    ["5", "Blanc/Bleu", "—"],
    ["6", "Vert", "RX-"],
    ["7", "Blanc/Brun", "—"],
    ["8", "Brun", "—"],
  ],
  [1000, 2500, 5526]
));
children.push(note("Pour un câble croisé (non nécessaire sur équipements modernes Auto-MDI-X) : T568A d'un côté, T568B de l'autre."));

children.push(h2("7.4 Organisation du rack"));
children.push(p("Distribution recommandée de haut en bas (1U = 44.45 mm) :"));
children.push(makeTable(
  ["Position", "Équipement", "Hauteur"],
  [
    ["U1-U2", "Patch panel 24p (brassage)", "2U"],
    ["U3", "Passe-câble 1U (horizontal)", "1U"],
    ["U4-U5", "Switch Core manageable 24p", "1U"],
    ["U6-U7", "Switch PoE 24p 193W", "1U"],
    ["U8", "Passe-câble 1U", "1U"],
    ["U9-U10", "Routeur / Firewall", "1U"],
    ["U11", "Libre (réserve)", "1U"],
    ["U12", "PDU multiprise 19\"", "1U"],
    ["Fond", "Onduleur (sur pieds, sous rack)", "externe"],
  ],
  [1200, 4500, 3326]
));

children.push(h2("7.5 Test des câbles après installation"));
[
  "Utiliser un testeur de câble basique : vérifier la continuité de chaque paire (8 voyants).",
  "Câble correct : tous les voyants allumés dans l'ordre 1-2-3-4-5-6-7-8.",
  "Court-circuit : deux voyants s'allument en même temps.",
  "Paire inversée : voyants 3 et 6 inversés (T568A/B mélangé).",
  "Paire ouverte : voyant absent = fil cassé ou mal serti.",
  "Pour certification Cat6 (débit garanti 1G/10G) : utiliser Fluke DSX-600.",
  "Documenter chaque test : numéro câble, longueur mesurée, résultat (OK/NOK).",
].forEach(t => children.push(li(t)));

children.push(h2("7.6 Étiquetage professionnel"));
[
  "Étiqueter les deux extrémités de chaque câble avec le même numéro.",
  "Format recommandé : [BÂTIMENT]-[ÉTAGE]-[PIÈCE]-[N°PRISE]. Ex : A-1-BUR01-P1",
  "Étiqueter chaque port du patch panel (numéro de prise correspondante).",
  "Étiqueter chaque port de switch (numéro ou nom du poste connecté).",
  "Utiliser des gaines thermorétractables imprimées pour les câbles exposés.",
  "Tenir à jour le tableau de câblage (spreadsheet ou logiciel comme NetBox).",
].forEach(t => children.push(li(t)));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 8 — CONFIGURATION COMPLÈTE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 8 — CONFIGURATION COMPLÈTE"));

children.push(h2("8.1 VLAN — Concept et configuration"));
children.push(p("Un VLAN (Virtual LAN) segmente logiquement le réseau en groupes isolés sur le même switch physique. La communication inter-VLAN nécessite un routeur ou un switch L3."));
children.push(p("Types de ports :"));
["Port Access : appartient à un seul VLAN. Connecté à un PC, une caméra, une imprimante.", "Port Trunk : transporte plusieurs VLAN (tagged 802.1Q). Entre switch et routeur, entre switchs."].forEach(t => children.push(li(t)));

children.push(h2("8.2 DHCP — Serveur d'adresses IP automatique"));
children.push(p("Le serveur DHCP distribue automatiquement les adresses IP. Peut être hébergé sur le routeur, un serveur Windows/Linux, ou un switch L3."));

children.push(h2("8.3 STP — Spanning Tree Protocol"));
children.push(p("STP empêche les boucles réseau. Sur tout switch manageable, vérifier l'état STP et configurer les ports non-trunk en PortFast pour accélérer la connexion des postes."));

children.push(h2("8.4 QoS — Qualité de service (VoIP)"));
children.push(p("La QoS priorise le trafic VoIP et vidéo sur le trafic données. Configurer le DSCP EF (Expedited Forwarding) pour la voix, AF41 pour la vidéo surveillance."));

children.push(h2("8.5 ACL — Listes de contrôle d'accès"));
children.push(p("Les ACL filtrent le trafic entre VLANs. Exemple de règle : le VLAN Invités (99) ne peut pas accéder au VLAN Administration (10) — seul Internet est autorisé."));

children.push(h2("8.6 NAT — Translation d'adresses"));
children.push(p("Le NAT (Network Address Translation) traduit les adresses IP privées en adresse publique pour accéder à Internet. Le PAT (Port Address Translation ou NAT Overload) permet à plusieurs postes de partager une seule IP publique."));

children.push(h2("8.7 VPN — Accès distant sécurisé"));
children.push(p("Trois types courants :"));
["OpenVPN : solution open-source, très fiable, port TCP/UDP 1194.", "WireGuard : plus récent, très rapide, port UDP 51820.", "IPSec/IKEv2 : standard entreprise, natif sur Windows/iOS/Android."].forEach(t => children.push(li(t)));

children.push(h2("8.8 Wi-Fi — Configuration SSID"));
children.push(makeTable(
  ["SSID", "VLAN", "Sécurité", "Fréquence", "Usage"],
  [
    ["ENTREPRISE-STAFF", "50", "WPA3-Enterprise ou WPA2-PSK fort", "2.4+5 GHz", "Employés"],
    ["ENTREPRISE-VOIX", "70", "WPA2-PSK", "5 GHz", "Téléphones IP Wi-Fi"],
    ["ENTREPRISE-GUEST", "99", "WPA2-PSK ou Captive Portal", "2.4 GHz", "Visiteurs"],
  ],
  [2000, 800, 2500, 1300, 2426]
));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 9 — COMMANDES
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 9 — COMMANDES PAR PLATEFORME"));

children.push(h2("9.1 Cisco IOS"));
children.push(h3("Configuration de base"));
children.push(code("! Accès au mode privilégié"));
children.push(code("enable"));
children.push(code("configure terminal"));
children.push(code(""));
children.push(code("! Nom du switch et mot de passe"));
children.push(code("hostname SW-CORE-01"));
children.push(code("enable secret MonMotDePasse2024!"));
children.push(code("service password-encryption"));
children.push(code(""));
children.push(code("! Bannière d'avertissement"));
children.push(code("banner motd # Acces autorise uniquement. #"));

children.push(h3("Création des VLANs"));
children.push(code("vlan 10"));
children.push(code(" name ADMINISTRATION"));
children.push(code("vlan 20"));
children.push(code(" name COMPTABILITE"));
children.push(code("vlan 40"));
children.push(code(" name CAMERAS"));
children.push(code("vlan 99"));
children.push(code(" name INVITES"));
children.push(code("exit"));

children.push(h3("Configuration port Access (poste de travail)"));
children.push(code("interface GigabitEthernet0/1"));
children.push(code(" description PC-Bureau01"));
children.push(code(" switchport mode access"));
children.push(code(" switchport access vlan 10"));
children.push(code(" spanning-tree portfast"));
children.push(code(" no shutdown"));

children.push(h3("Configuration port Trunk (vers routeur ou autre switch)"));
children.push(code("interface GigabitEthernet0/24"));
children.push(code(" description TRUNK-vers-ROUTEUR"));
children.push(code(" switchport trunk encapsulation dot1q"));
children.push(code(" switchport mode trunk"));
children.push(code(" switchport trunk allowed vlan 10,20,30,40,50,70,99"));
children.push(code(" no shutdown"));

children.push(h3("Interface de gestion (SVI)"));
children.push(code("interface vlan 10"));
children.push(code(" description MGMT-ADMINISTRATION"));
children.push(code(" ip address 192.168.10.2 255.255.255.0"));
children.push(code(" no shutdown"));
children.push(code("ip default-gateway 192.168.10.1"));

children.push(h3("ACL — Bloquer VLAN99 vers VLAN10"));
children.push(code("ip access-list extended BLOCK-GUESTS"));
children.push(code(" deny ip 192.168.99.0 0.0.0.255 192.168.10.0 0.0.0.255"));
children.push(code(" deny ip 192.168.99.0 0.0.0.255 192.168.20.0 0.0.0.255"));
children.push(code(" permit ip any any"));
children.push(code("!"));
children.push(code("interface vlan 99"));
children.push(code(" ip access-group BLOCK-GUESTS in"));

children.push(h3("Vérification et diagnostic Cisco"));
children.push(code("show vlan brief                    ! Liste des VLANs"));
children.push(code("show interfaces trunk              ! Ports trunk actifs"));
children.push(code("show interfaces status             ! État de tous les ports"));
children.push(code("show ip interface brief            ! Interfaces IP"));
children.push(code("show spanning-tree vlan 10         ! État STP VLAN 10"));
children.push(code("show mac address-table             ! Table MAC"));
children.push(code("show arp                           ! Table ARP"));
children.push(code("show running-config                ! Config active"));
children.push(code("copy running-config startup-config ! Sauvegarde config"));

children.push(h2("9.2 MikroTik RouterOS"));
children.push(h3("Configuration via CLI (SSH ou Winbox Terminal)"));
children.push(code("# Nom du routeur"));
children.push(code("/system identity set name=RTR-MAIN-01"));
children.push(code(""));
children.push(code("# Créer les bridges VLAN"));
children.push(code("/interface bridge add name=bridge-vlan10 vlan-filtering=yes"));
children.push(code(""));
children.push(code("# Créer les VLANs sur le bridge"));
children.push(code("/interface vlan add name=vlan10 vlan-id=10 interface=ether2"));
children.push(code("/interface vlan add name=vlan20 vlan-id=20 interface=ether2"));
children.push(code("/interface vlan add name=vlan40 vlan-id=40 interface=ether2"));
children.push(code("/interface vlan add name=vlan99 vlan-id=99 interface=ether2"));
children.push(code(""));
children.push(code("# Adresses IP sur chaque VLAN"));
children.push(code("/ip address add address=192.168.10.1/24 interface=vlan10"));
children.push(code("/ip address add address=192.168.20.1/24 interface=vlan20"));
children.push(code("/ip address add address=192.168.40.1/24 interface=vlan40"));
children.push(code("/ip address add address=192.168.99.1/24 interface=vlan99"));

children.push(h3("DHCP MikroTik"));
children.push(code("# Pool d'adresses VLAN10"));
children.push(code("/ip pool add name=pool-vlan10 ranges=192.168.10.10-192.168.10.100"));
children.push(code("# Serveur DHCP VLAN10"));
children.push(code("/ip dhcp-server add name=dhcp-vlan10 interface=vlan10 address-pool=pool-vlan10 lease-time=1d"));
children.push(code("/ip dhcp-server network add address=192.168.10.0/24 gateway=192.168.10.1 dns-server=192.168.10.1"));

children.push(h3("NAT Masquerade (partage Internet)"));
children.push(code("/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment=\"NAT Internet\""));

children.push(h3("Firewall — Blocage inter-VLAN"));
children.push(code("# Bloquer VLAN Invités (99) vers réseau interne"));
children.push(code("/ip firewall filter add chain=forward src-address=192.168.99.0/24 dst-address=192.168.10.0/24 action=drop"));
children.push(code("/ip firewall filter add chain=forward src-address=192.168.99.0/24 dst-address=192.168.20.0/24 action=drop"));
children.push(code("/ip firewall filter add chain=forward src-address=192.168.99.0/24 dst-address=192.168.40.0/24 action=drop"));

children.push(h3("Port Forwarding (accès distant NVR)"));
children.push(code("# Rediriger port 8080 public vers NVR 192.168.40.10:80"));
children.push(code("/ip firewall nat add chain=dstnat protocol=tcp dst-port=8080 action=dst-nat to-addresses=192.168.40.10 to-ports=80"));

children.push(h3("VPN WireGuard sur MikroTik"));
children.push(code("/interface wireguard add name=wg0 listen-port=51820"));
children.push(code("/ip address add address=10.0.0.1/24 interface=wg0"));
children.push(code("/interface wireguard peers add interface=wg0 public-key=\"CLE-PUBLIQUE-CLIENT\" allowed-address=10.0.0.2/32"));

children.push(h2("9.3 TP-Link Omada (via CLI SSH)"));
children.push(code("# Connexion SSH au switch TL-SG3428"));
children.push(code("ssh admin@192.168.1.3"));
children.push(code(""));
children.push(code("# Créer VLANs 802.1Q"));
children.push(code("vlan 10"));
children.push(code("vlan 20"));
children.push(code("vlan 40"));
children.push(code("vlan 99"));
children.push(code("exit"));
children.push(code(""));
children.push(code("# Configurer port 1 en access VLAN 10"));
children.push(code("interface gigabitEthernet 1/0/1"));
children.push(code(" switchport mode access"));
children.push(code(" switchport access vlan 10"));
children.push(code("exit"));
children.push(code(""));
children.push(code("# Configurer port 24 en trunk"));
children.push(code("interface gigabitEthernet 1/0/24"));
children.push(code(" switchport mode trunk"));
children.push(code(" switchport trunk allowed vlan 10 20 40 99"));
children.push(code("exit"));

children.push(h2("9.4 Linux Ubuntu Server"));
children.push(h3("Configuration réseau statique (Netplan)"));
children.push(code("# Fichier /etc/netplan/00-installer-config.yaml"));
children.push(code("network:"));
children.push(code("  version: 2"));
children.push(code("  ethernets:"));
children.push(code("    ens18:"));
children.push(code("      addresses: [192.168.60.10/24]"));
children.push(code("      gateway4: 192.168.60.1"));
children.push(code("      nameservers:"));
children.push(code("        addresses: [8.8.8.8, 1.1.1.1]"));
children.push(code("# Appliquer :"));
children.push(code("sudo netplan apply"));

children.push(h3("Installation serveur DHCP ISC"));
children.push(code("sudo apt install isc-dhcp-server -y"));
children.push(code("# Éditer /etc/dhcp/dhcpd.conf :"));
children.push(code("subnet 192.168.10.0 netmask 255.255.255.0 {"));
children.push(code("  range 192.168.10.10 192.168.10.100;"));
children.push(code("  option routers 192.168.10.1;"));
children.push(code("  option domain-name-servers 192.168.10.1, 8.8.8.8;"));
children.push(code("  default-lease-time 86400;"));
children.push(code("}"));
children.push(code("sudo systemctl restart isc-dhcp-server"));

children.push(h3("Installation serveur DNS Bind9"));
children.push(code("sudo apt install bind9 -y"));
children.push(code("# Fichier /etc/bind/named.conf.options"));
children.push(code("options {"));
children.push(code("  directory \"/var/cache/bind\";"));
children.push(code("  forwarders { 8.8.8.8; 1.1.1.1; };"));
children.push(code("  allow-query { 192.168.0.0/16; };"));
children.push(code("};"));

children.push(h2("9.5 Windows Server (PowerShell)"));
children.push(code("# Installer le rôle DHCP"));
children.push(code("Install-WindowsFeature DHCP -IncludeManagementTools"));
children.push(code(""));
children.push(code("# Créer une plage DHCP"));
children.push(code("Add-DhcpServerv4Scope -Name \"VLAN10-Admin\" -StartRange 192.168.10.10 -EndRange 192.168.10.100 -SubnetMask 255.255.255.0"));
children.push(code("Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -Router 192.168.10.1 -DnsServer 192.168.10.1"));
children.push(code(""));
children.push(code("# Installer le rôle DNS"));
children.push(code("Install-WindowsFeature DNS -IncludeManagementTools"));
children.push(code(""));
children.push(code("# Adresse IP statique"));
children.push(code("New-NetIPAddress -InterfaceAlias \"Ethernet\" -IPAddress 192.168.60.10 -PrefixLength 24 -DefaultGateway 192.168.60.1"));
children.push(code("Set-DnsClientServerAddress -InterfaceAlias \"Ethernet\" -ServerAddresses 8.8.8.8,1.1.1.1"));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 10 — INSTALLATION VIDÉOSURVEILLANCE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 10 — INSTALLATION VIDÉOSURVEILLANCE"));

children.push(h2("10.1 Choix des caméras"));
children.push(makeTable(
  ["Type", "Usage", "Résolution recommandée", "Particularité"],
  [
    ["Dôme intérieure", "Bureaux, couloirs, accueil", "4 MP (2K)", "Discrète, anti-vandale"],
    ["Bullet extérieure", "Parking, façades", "4-8 MP", "Longue portée IR (30-80 m)"],
    ["PTZ extérieure", "Grands espaces, parking large", "2-4 MP + zoom x25", "Rotation 360°, suivi auto"],
    ["Fisheye 360°", "Salle unique, carrefour", "12 MP", "Couverture totale, 1 seule cam"],
    ["Minature encastrée", "Discrétion maximale", "2-4 MP", "Plafond suspendu"],
    ["Thermique", "Périmètre, détection feux", "Résol. thermique", "Vision sans lumière"],
  ],
  [1500, 2000, 1800, 3726]
));

children.push(h2("10.2 Calcul de l'angle de vue et couverture"));
children.push(p("Formule : Largeur couverte = 2 x Distance x tan(Angle/2)"));
children.push(makeTable(
  ["Objectif (mm)", "Angle horizontal", "Distance 5 m", "Distance 10 m", "Distance 20 m"],
  [
    ["2.8 mm", "~100°", "11.9 m", "23.8 m", "47.6 m"],
    ["4 mm", "~82°", "9.0 m", "18.0 m", "36.0 m"],
    ["6 mm", "~54°", "5.5 m", "11.0 m", "22.0 m"],
    ["8 mm", "~40°", "3.9 m", "7.8 m", "15.6 m"],
    ["12 mm", "~28°", "2.5 m", "5.0 m", "10.0 m"],
  ],
  [1200, 1400, 1600, 1600, 3226]
));
children.push(note("Objectif 2.8 mm = grand angle (couloirs, salles). Objectif 12 mm = téléobjectif (distances, entrées éloignées)."));

children.push(h2("10.3 Calcul de stockage NVR"));
children.push(p("Formule : GB/jour = Bitrate (Mbps) x 3600 sec x 24h / 8 / 1000"));
children.push(makeTable(
  ["Résolution", "Bitrate moyen", "1 caméra/jour", "8 cams/30 jours", "16 cams/30 jours"],
  [
    ["2 MP (1080p)", "2-4 Mbps", "22-43 GB", "5-10 TB", "10-21 TB"],
    ["4 MP (2K)", "4-8 Mbps", "43-86 GB", "10-21 TB", "21-41 TB"],
    ["8 MP (4K)", "8-16 Mbps", "86-173 GB", "21-41 TB", "41-83 TB"],
  ],
  [1600, 1600, 1800, 2000, 2026]
));
children.push(note("Avec détection de mouvement (enreg. uniquement si mouvement), diviser par 3 à 5 la capacité nécessaire."));

children.push(h2("10.4 Configuration NVR Hikvision"));
[
  "Connecter le NVR au switch PoE dédié VLAN40.",
  "Accéder à l'interface web : http://192.168.40.10 (admin / mot de passe initial).",
  "Aller dans Configuration > Network > Basic > IPv4 : définir IP statique.",
  "Aller dans Configuration > Camera Management : lancer la recherche automatique des caméras PoE.",
  "Pour chaque caméra : définir un mot de passe fort, activer HTTPS.",
  "Configuration enregistrement : Schedule > Continuous + Motion Detection.",
  "Activer les notifications : Configuration > Event > Motion Detection > Linkage Action.",
  "Accès à distance : activer Hik-Connect (port 8000, HTTPS 443).",
  "Sauvegarde : exporter la config (Maintenance > Backup).",
].forEach(t => children.push(ni(t)));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 11 — TESTS
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 11 — PROCÉDURES DE TESTS"));

children.push(h2("11.1 Tests réseau de base"));
children.push(makeTable(
  ["Commande", "OS", "Rôle", "Exemple"],
  [
    ["ping", "Win/Linux/Mac", "Tester la joignabilité d'un hôte", "ping 192.168.10.1 -n 10"],
    ["ping -t", "Windows", "Ping continu (Ctrl+C pour arrêter)", "ping 8.8.8.8 -t"],
    ["ping -c 10", "Linux", "10 pings puis arrêt", "ping -c 10 192.168.10.1"],
    ["tracert", "Windows", "Tracer le chemin jusqu'à l'hôte", "tracert 8.8.8.8"],
    ["traceroute", "Linux", "Idem sous Linux", "traceroute 8.8.8.8"],
    ["ipconfig", "Windows", "Voir l'adresse IP et le gateway", "ipconfig /all"],
    ["ipconfig /renew", "Windows", "Renouveler l'adresse DHCP", "ipconfig /release && ipconfig /renew"],
    ["ip addr", "Linux", "Voir les interfaces réseau", "ip addr show"],
    ["ip route", "Linux", "Voir la table de routage", "ip route show"],
    ["arp -a", "Win/Linux", "Table ARP (IP → MAC)", "arp -a"],
    ["nslookup", "Win/Linux", "Résolution DNS", "nslookup google.com 8.8.8.8"],
    ["netstat -an", "Win/Linux", "Ports ouverts et connexions", "netstat -an | findstr LISTEN"],
  ],
  [1800, 1000, 3000, 3226]
));

children.push(h2("11.2 Tests VLAN"));
[
  "Depuis PC dans VLAN10 (192.168.10.x) : ping 192.168.10.1 (gateway) → doit répondre.",
  "Ping 192.168.20.1 (VLAN20) → doit répondre si inter-VLAN routing activé.",
  "Ping 192.168.99.1 (VLAN Invités) → doit être BLOQUÉ par ACL.",
  "Connecter un PC dans VLAN Invités, vérifier qu'il ne peut pas atteindre les serveurs.",
  "Depuis l'AP, vérifier que les 2 SSID sont dans leurs VLAN respectifs.",
].forEach(t => children.push(ni(t)));

children.push(h2("11.3 Tests PoE"));
[
  "Connecter une caméra PoE sur le port 1 du switch PoE.",
  "Vérifier la LED du port : doit s'allumer (vert = 100M, orange = 1G).",
  "Commande Cisco : show power inline pour voir la consommation PoE par port.",
  "Vérifier que la caméra obtient bien une adresse IP dans le VLAN40.",
  "Sur MikroTik : /interface ethernet power-inline print",
].forEach(t => children.push(ni(t)));

children.push(h2("11.4 Test de débit"));
children.push(code("# Linux — iPerf3 (serveur)"));
children.push(code("iperf3 -s"));
children.push(code("# Linux — iPerf3 (client, test débit vers serveur)"));
children.push(code("iperf3 -c 192.168.10.10 -t 30 -P 4"));
children.push(code("# Windows — iPerf3 disponible sur iperf.fr"));
children.push(code("iperf3 -c 192.168.10.10 -t 30"));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 12 — SÉCURITÉ
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 12 — SÉCURITÉ RÉSEAU"));

children.push(h2("12.1 Politique de mots de passe"));
children.push(makeTable(
  ["Équipement", "Mot de passe minimum", "Rotation", "Stockage"],
  [
    ["Routeur / Firewall", "16 chars, majusc+chiffre+symbole", "Tous les 3 mois", "Gestionnaire (KeePass, Bitwarden)"],
    ["Switch manageable", "16 chars", "Tous les 3 mois", "Gestionnaire"],
    ["NVR / Caméras", "12 chars minimum", "Tous les 6 mois", "Gestionnaire"],
    ["Serveur Windows", "Politique AD : 12 chars min", "Tous les 90 jours", "Active Directory"],
    ["Wi-Fi WPA3 PSK", "20 chars minimum", "Tous les 6 mois", "Gestionnaire"],
    ["VPN", "Certificat + MFA recommandé", "Rotation certificat annuelle", "PKI interne"],
  ],
  [1800, 2400, 1600, 3226]
));

children.push(h2("12.2 Segmentation réseau — règles de filtrage inter-VLAN"));
children.push(makeTable(
  ["Source", "Destination", "Action", "Justification"],
  [
    ["VLAN Invités (99)", "VLAN Admin (10)", "DENY", "Isolation totale invités"],
    ["VLAN Invités (99)", "VLAN Serveurs (60)", "DENY", "Protéger les serveurs"],
    ["VLAN Caméras (40)", "VLAN LAN interne", "DENY", "Caméras non routées"],
    ["VLAN LAN interne", "VLAN Caméras (40)", "PERMIT", "Accès NVR depuis bureau"],
    ["VLAN Admin (10)", "Tout", "PERMIT", "Admin accède partout"],
    ["VLAN Voix (70)", "VLAN données (10-20)", "DENY", "Isolation VoIP"],
    ["Tout", "Internet", "PERMIT conditionnel", "Filtrage URL recommandé"],
  ],
  [1800, 1800, 1200, 4226]
));

children.push(h2("12.3 Sécurité des switchs"));
["Désactiver les ports inutilisés : shutdown sur chaque interface non connectée.", "Activer Port Security : limiter à 1 adresse MAC par port access.", "Activer DHCP Snooping : bloquer les faux serveurs DHCP sur les ports untrusted.", "Activer Dynamic ARP Inspection (DAI) : prévenir l'ARP spoofing.", "Désactiver Telnet, activer SSH version 2 uniquement.", "Désactiver l'accès HTTP non sécurisé sur les interfaces de gestion.", "Configurer un VLAN de gestion dédié (VLAN1 ne doit PAS être utilisé).", "Activer les logs de sécurité (syslog vers serveur centralisé)."].forEach(t => children.push(li(t)));

children.push(h2("12.4 Sauvegarde des configurations"));
children.push(code("! Cisco — Sauvegarder sur TFTP"));
children.push(code("copy running-config tftp://192.168.60.10/SW-CORE-backup-2025.cfg"));
children.push(code(""));
children.push(code("# MikroTik — Export configuration"));
children.push(code("/export file=backup-rtr-2025"));
children.push(code("# Puis télécharger via FTP ou Winbox Files"));
children.push(code(""));
children.push(code("# Linux — Sauvegarder config réseau"));
children.push(code("tar czf backup-reseau-$(date +%Y%m%d).tar.gz /etc/netplan /etc/dhcp /etc/bind"));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 13 — DOCUMENTATION FINALE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 13 — DOCUMENTATION FINALE"));

children.push(h2("13.1 Inventaire du matériel installé"));
children.push(makeTable(
  ["N°", "Équipement", "Marque/Modèle", "N° de série", "Adresse IP", "VLAN", "Emplacement", "Date install."],
  [
    ["01", "Routeur principal", "", "", "192.168.1.1", "Trunk", "Rack — U9", ""],
    ["02", "Switch Core 24p", "", "", "192.168.1.2", "Mgmt", "Rack — U4", ""],
    ["03", "Switch PoE 24p", "", "", "192.168.1.3", "Mgmt", "Rack — U6", ""],
    ["04", "AP Wi-Fi", "", "", "192.168.50.2", "50", "Salle réunion", ""],
    ["05", "NVR 16 voies", "", "", "192.168.40.10", "40", "Rack — local tech", ""],
    ["06", "Caméra 01", "", "", "192.168.40.21", "40", "Entrée principale", ""],
  ],
  [500, 1400, 1500, 1500, 1400, 700, 1500, 1526]
));

children.push(h2("13.2 Modèle de registre des mots de passe"));
children.push(note("Ce tableau doit être imprimé, signé, et conservé PHYSIQUEMENT dans un coffre-fort ou remis uniquement au responsable IT. Ne jamais stocker en clair sur un partage réseau."));
children.push(makeTable(
  ["Équipement", "Adresse IP", "Utilisateur", "Mot de passe", "Niveau d'accès", "Date modification"],
  [
    ["Routeur/Firewall", "192.168.1.1", "admin", "****************", "Full", ""],
    ["Switch Core", "192.168.1.2", "admin", "****************", "Full", ""],
    ["NVR", "192.168.40.10", "admin", "****************", "Full", ""],
    ["Wi-Fi Staff", "—", "SSID", "****************", "PSK", ""],
    ["Serveur Windows", "192.168.60.10", "Administrateur", "****************", "Admin", ""],
  ],
  [1700, 1300, 1200, 1700, 1500, 1626]
));

children.push(h2("13.3 Procédure de maintenance mensuelle"));
[
  "Vérifier l'état des switchs : voyants, erreurs (show interface errors).",
  "Vérifier l'espace disque du NVR et l'état des disques durs (SMART).",
  "Contrôler les logs du firewall : tentatives d'intrusion, blocages.",
  "Vérifier la connectivité Internet et mesurer le débit.",
  "Contrôler les sauvegardes des configurations réseau.",
  "Vérifier les mises à jour firmware des équipements.",
  "Contrôler les certificats SSL (expiration).",
  "Inspecter physiquement le rack : température, câblage.",
].forEach(t => children.push(ni(t)));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 14 — MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 14 — CALENDRIER DE MAINTENANCE"));

children.push(makeTable(
  ["Fréquence", "Tâche", "Durée", "Responsable"],
  [
    ["Quotidien", "Vérifier accès Internet (ping 8.8.8.8)", "5 min", "IT"],
    ["Quotidien", "Vérifier les enregistrements NVR", "5 min", "IT"],
    ["Quotidien", "Consulter les alertes de monitoring (si configuré)", "10 min", "IT"],
    ["Hebdomadaire", "Revue des logs firewall", "30 min", "IT"],
    ["Hebdomadaire", "Vérifier l'espace disque NVR et serveurs", "15 min", "IT"],
    ["Hebdomadaire", "Test de connexion VPN (si existant)", "10 min", "IT"],
    ["Mensuel", "Sauvegarde des configurations réseau", "30 min", "IT"],
    ["Mensuel", "Vérification des mises à jour firmware", "1h", "IT"],
    ["Mensuel", "Inspection physique du rack et des câbles", "30 min", "IT"],
    ["Mensuel", "Rapport d'activité réseau (trafic, incidents)", "1h", "IT"],
    ["Trimestriel", "Test de restauration des sauvegardes", "2h", "IT"],
    ["Trimestriel", "Audit des comptes utilisateurs et droits d'accès", "2h", "IT"],
    ["Trimestriel", "Test des onduleurs (simulation coupure)", "1h", "IT"],
    ["Annuel", "Renouvellement des mots de passe critiques", "2h", "IT Manager"],
    ["Annuel", "Audit de sécurité complet (scan vulnérabilités)", "1 jour", "IT + Externe"],
    ["Annuel", "Révision du plan d'adressage et documentation", "2h", "IT"],
    ["Annuel", "Test de récupération après sinistre (PRA)", "1 jour", "IT + Direction"],
  ],
  [1500, 4000, 1200, 2326]
));

children.push(pb());

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIE 15 — DÉPANNAGE
// ═══════════════════════════════════════════════════════════════════════════════
children.push(h1("PARTIE 15 — GUIDE DE DÉPANNAGE"));

children.push(h2("15.1 Plus d'accès Internet"));
children.push(makeTable(
  ["Étape", "Action", "Commande / Vérification"],
  [
    ["1", "Vérifier si le problème est global ou pour un seul poste", "ping 8.8.8.8 depuis plusieurs postes"],
    ["2", "Tester la connexion au routeur (gateway)", "ping 192.168.1.1 — si échec : problème LAN"],
    ["3", "Vérifier la connexion WAN du routeur", "Interface admin routeur > état WAN"],
    ["4", "Redémarrer le modem/box opérateur", "Couper 30 sec, rebrancher"],
    ["5", "Vérifier les câbles WAN (RJ45 ou SFP)", "Inspecter visuellement, tester avec un autre câble"],
    ["6", "Appeler l'opérateur si la ligne est en panne", "Signaler incident — n° support opérateur"],
    ["7", "Activer le failover 4G si disponible", "Configurer la route par défaut sur l'interface 4G"],
  ],
  [500, 2500, 6026]
));

children.push(h2("15.2 Switch en panne / port mort"));
children.push(makeTable(
  ["Symptôme", "Cause probable", "Diagnostic", "Solution"],
  [
    ["LED port éteinte", "Câble débranché ou cassé", "ping + testeur câble", "Remplacer le câble"],
    ["LED clignote orange", "Erreurs de trame (CRC)", "show interface errors", "Vérifier le câble ou le NIC"],
    ["Aucune LED sur switch", "Alimentation coupée", "Vérifier PDU et onduleur", "Rétablir l'alimentation"],
    ["Port bloqué par STP", "Boucle réseau détectée", "show spanning-tree", "Identifier et retirer le câble de boucle"],
    ["VLAN inaccessible", "Mauvaise config access/trunk", "show vlan brief", "Reconfigurer le port"],
  ],
  [1800, 2000, 1800, 3426]
));

children.push(h2("15.3 Caméra hors ligne"));
children.push(makeTable(
  ["Symptôme", "Cause probable", "Vérification", "Solution"],
  [
    ["Caméra absente du NVR", "Pas d'alimentation PoE", "show power inline port X", "Activer PoE sur le port"],
    ["Caméra ne répond pas au ping", "IP incorrecte ou conflit", "Scanner le VLAN40 avec nmap", "Réassigner l'adresse IP"],
    ["Image floue ou noire", "Objectif sale, IR défaillant", "Inspection physique", "Nettoyer ou remplacer"],
    ["Image figée", "Bande passante insuffisante", "Test débit vers NVR", "Réduire bitrate caméra"],
    ["Caméra répond mais pas NVR", "Configuration NVR", "Vérifier port dans NVR", "Ré-ajouter la caméra dans NVR"],
  ],
  [1800, 2000, 1800, 3426]
));

children.push(h2("15.4 DHCP ne fonctionne pas"));
children.push(makeTable(
  ["Symptôme", "Vérification", "Solution"],
  [
    ["APIPA (169.254.x.x)", "ping serveur DHCP — service actif ?", "Redémarrer service DHCP ou relayer"],
    ["Conflits d'adresses IP", "show ip dhcp conflict (Cisco)", "Effacer conflits : clear ip dhcp conflict *"],
    ["Pool épuisé", "show ip dhcp pool (Cisco)", "Augmenter la plage ou réduire le bail"],
    ["DHCP dans mauvais VLAN", "Vérifier DHCP helper-address", "Ajouter ip helper-address sur l'interface SVI"],
  ],
  [2000, 2800, 4226]
));

children.push(h2("15.5 Wi-Fi lent ou instable"));
children.push(makeTable(
  ["Symptôme", "Cause", "Solution"],
  [
    ["Débit < 50 Mbps à 5 m de l'AP", "Interférences canal Wi-Fi", "Scanner les canaux (WiFi Analyzer), changer canal"],
    ["Déconnexions fréquentes", "Roaming agressif client", "Configurer 802.11r Fast Transition ou baisser TX power AP voisin"],
    ["Pas de signal dans certaines zones", "Couverture insuffisante", "Ajouter un AP ou repositionner"],
    ["Lenteur pour tous les clients", "AP saturé (>30 clients)", "Ajouter des AP ou activer band steering 5 GHz"],
    ["SSID visible mais pas de connexion", "Mauvaise clé WPA ou VLAN", "Vérifier PSK et config VLAN sur trunk"],
  ],
  [2000, 2500, 4526]
));

children.push(h2("15.6 Boucle réseau (storm broadcast)"));
children.push(p("Symptômes : réseau entier lent ou inaccessible, LEDs switchs clignotent frénétiquement, CPU switchs à 100%."));
["Localiser le câble créant la boucle : débrancher les câbles un par un depuis le switch le plus proche de la source.", "Vérifier STP : show spanning-tree detail (chercher TC — Topology Change).", "Activer Storm Control sur les ports access.", "Activer BPDU Guard sur les ports PortFast pour prévenir les boucles futures.", "Après résolution : vérifier que STP converge (état FORWARDING sur tous les ports actifs)."].forEach(t => children.push(ni(t)));

children.push(h2("15.7 NVR inaccessible"));
children.push(makeTable(
  ["Problème", "Vérification", "Solution"],
  [
    ["Interface web inaccessible", "ping 192.168.40.10 — switch PoE", "Vérifier câble, redémarrer NVR"],
    ["Disque dur plein", "Vérifier espace HDD dans interface NVR", "Activer l'écrasement cyclique ou ajouter HDD"],
    ["Disque dur en erreur", "Icône HDD rouge dans NVR", "Remplacer le HDD (garantie fabricant)"],
    ["Accès distant KO", "Port 8000 ou 443 ouvert sur firewall ?", "Vérifier NAT et règles firewall"],
    ["RAID dégradé", "Alerte RAID dans le menu NVR", "Remplacer le disque défaillant + rebuild RAID"],
  ],
  [2000, 2500, 4526]
));

children.push(pb());

// ─── Page finale ─────────────────────────────────────────────────────────────
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 400 }, children: [new TextRun({ text: "FIN DU MANUEL", size: 40, bold: true, color: "1F4E79" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ce document est confidentiel et destiné à l'usage exclusif du prestataire et de son client.", size: 20, italics: true, color: "808080" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Version 1.0 — 2025", size: 20, color: "808080" })] }));

// ─── Build document ──────────────────────────────────────────────────────────
const doc = new Document({
  numbering,
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2F5496" },
        paragraph: { spacing: { before: 180, after: 60 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" } },
          children: [new TextRun({ text: "Manuel Professionnel — Réseau & Vidéosurveillance", size: 18, color: "808080", italics: true })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6" } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 18, color: "808080" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" }),
            new TextRun({ text: " / ", size: 18, color: "808080" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "808080" }),
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Manuel-Reseau-Videosurveillance.docx", buf);
  console.log("OK: Manuel-Reseau-Videosurveillance.docx généré");
}).catch(err => { console.error("ERREUR:", err.message); process.exit(1); });
