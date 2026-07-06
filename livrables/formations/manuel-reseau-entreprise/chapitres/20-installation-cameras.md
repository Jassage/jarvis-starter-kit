<div class="chapitre-titre-num">CHAPITRE 20</div>

# Installation des caméras

## Objectifs pédagogiques

Positionner correctement une caméra (hauteur, angle), gérer les conditions d'éclairage, et choisir les indices de protection IP/IK adaptés à l'environnement d'installation.

## Prérequis

Chapitres 1-19.

## 20.1 Hauteur d'installation

<div class="encadre astuce">
<span class="encadre-titre">💡 Un compromis entre portée de vue et résistance au vandalisme/occultation</span>
Une caméra trop basse est facilement occultée (bombe de peinture, main devant l'objectif) ou vandalisée ; une caméra trop haute perd en niveau de détail sur les visages (angle de vue trop plongeant, rappel du chapitre 19 sur la densité de pixels utile). La hauteur recommandée se situe généralement entre 2,5 et 3,5 mètres pour une caméra orientée vers des visages à hauteur d'homme, et jusqu'à 4-6 mètres pour une caméra périmétrique bullet ou PTZ dont l'objectif est la surveillance générale plutôt que l'identification faciale.
</div>

| Contexte | Hauteur recommandée |
|---|---|
| Caméra d'identification (guichet, entrée contrôlée) | 2,3 - 2,7 m, quasi à hauteur d'yeux, angle quasi frontal |
| Caméra dôme intérieure (couloir, hall) | 2,7 - 3,5 m |
| Caméra bullet périmétrique extérieure | 3,5 - 6 m |
| Caméra PTZ sur mât | 6 - 12 m selon la portée souhaitée |

## 20.2 Angle d'installation

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un angle trop plongeant dégrade fortement la capacité d'identification</span>
Une caméra installée trop haute et orientée fortement vers le bas capture le sommet du crâne plutôt que le visage — pour un objectif d'identification (chapitre 19, niveau 250 px/m), l'angle d'inclinaison ne devrait idéalement pas dépasser 15-20° par rapport à l'horizontale au niveau du visage.
</div>

## 20.3 Éclairage

<div class="encadre astuce">
<span class="encadre-titre">💡 Le contre-jour est l'ennemi numéro un de l'identification vidéo</span>
Une caméra orientée face à une source de lumière forte (fenêtre, entrée extérieure en pleine journée, éclairage de sécurité mal positionné) sature son capteur et produit une silhouette sombre non identifiable — toujours orienter les caméras dans le sens de la lumière naturelle dominante plutôt que face à elle, ou utiliser des caméras avec compensation WDR (Wide Dynamic Range) pour les zones à fort contraste inévitable (entrée vitrée, par exemple).
</div>

Éclairage complémentaire :

- **Infrarouge (IR)** : invisible à l'œil nu, permet une vision nocturne en noir et blanc à courte/moyenne distance.
- **Éclairage blanc intégré (white light)** : dissuasif et permet une couleur exploitable de nuit, mais peut créer un éblouissement gênant pour les riverains ou le voisinage.
- **Éclairage architectural existant** : à toujours vérifier lors de la visite technique (chapitre 5), un éclairage de sécurité mal positionné peut créer des zones de contre-jour non anticipées.

## 20.4 Protection contre les intempéries : indices IP et IK

<div class="encadre astuce">
<span class="encadre-titre">💡 IP protège contre l'eau et la poussière, IK protège contre les chocs mécaniques</span>
Les deux indices sont indépendants et se cumulent selon le contexte d'installation — une caméra extérieure exposée au vandalisme nécessite à la fois un indice IP élevé (pluie, poussière) ET un indice IK élevé (résistance aux chocs), tandis qu'une caméra intérieure en zone sécurisée peut se contenter d'indices plus modestes.
</div>

**Indice IP (International Protection / Ingress Protection)** : deux chiffres, `IPxy`.

| Premier chiffre (x) | Protection contre les solides | Second chiffre (y) | Protection contre les liquides |
|---|---|---|---|
| 5 | Protégé contre la poussière (quantité limitée) | 5 | Jets d'eau |
| 6 | Totalement étanche à la poussière | 6 | Forts jets d'eau |
| — | — | 7 | Immersion temporaire |

<div class="encadre astuce">
<span class="encadre-titre">💡 IP66 et IP67 : les standards de référence pour une caméra extérieure</span>
IP66 (totalement étanche à la poussière, résistant aux forts jets d'eau) est le minimum recommandé pour toute caméra installée en extérieur, quelle que soit la région climatique.
</div>

**Indice IK (résistance aux chocs mécaniques)** : de IK00 (aucune protection) à IK10 (résistance à un impact de 20 joules, équivalent à un coup de masse).

| Indice IK | Résistance | Contexte recommandé |
|---|---|---|
| IK08 | 5 joules | Intérieur standard, faible risque de vandalisme |
| IK10 | 20 joules | Zones à risque de vandalisme élevé (parkings publics, transports, zones industrielles) |

## 20.5 Checklist d'installation d'une caméra

<div class="encadre astuce">
<span class="encadre-titre">💡 Checklist avant validation finale d'une installation de caméra</span>

- [ ] Hauteur et angle conformes à l'objectif de surveillance visé (détection/reconnaissance/identification, chapitre 19).
- [ ] Absence de contre-jour direct aux heures critiques (vérification à différents moments de la journée).
- [ ] Indice IP adapté à l'exposition réelle (extérieur exposé, semi-abrité, intérieur).
- [ ] Indice IK adapté au risque de vandalisme du site.
- [ ] Câble PoE certifié (chapitre 8), connecteur RJ45 protégé de l'humidité en extérieur (presse-étoupe, boîtier étanche).
- [ ] Champ de vision testé en conditions réelles avant fixation définitive.
- [ ] Fonctionnement infrarouge/nocturne vérifié après la tombée de la nuit.
</div>

## 20.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Valider l'installation uniquement en pleine journée</span>
Une caméra correctement positionnée en plein jour peut révéler des problèmes majeurs la nuit (portée infrarouge insuffisante, reflets sur une vitre proche, éclairage architectural créant des zones d'ombre) — toujours valider le fonctionnement nocturne avant la clôture définitive du chantier.
</div>

## 20.7 Bonnes pratiques

- Toujours tester le champ de vision réel avant fixation définitive, avec le matériel de fixation final (pas un support provisoire qui fausse l'angle).
- Vérifier systématiquement le rendu nocturne (infrarouge, éclairage) avant la réception définitive des travaux.
- Choisir l'indice IP/IK en fonction du contexte réel d'exposition (climat, risque de vandalisme du site), jamais par défaut minimal pour réduire les coûts.

## 20.8 Résumé du chapitre

- La hauteur et l'angle d'installation conditionnent directement la capacité d'identification, indépendamment de la qualité intrinsèque de la caméra.
- Le contre-jour dégrade fortement l'exploitabilité d'un enregistrement ; l'éclairage doit être anticipé dès la conception.
- Les indices IP (eau/poussière) et IK (chocs) doivent être choisis selon l'exposition réelle du site, avec IP66/IK10 comme standard pour les zones extérieures à risque.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Une caméra doit être installée à l'entrée extérieure d'un parking public, exposée aux intempéries et à un risque de vandalisme élevé. Quels indices IP et IK minimum recommanderiez-vous ?
</div>

**Corrigé :**
**IP66** minimum (étanchéité totale à la poussière, résistance aux forts jets d'eau) et **IK10** (résistance à un impact de 20 joules) compte tenu du risque de vandalisme élevé identifié en zone publique extérieure.

*Chapitre suivant : le réseau dédié à la vidéosurveillance (VLAN, PoE, QoS, multicast, sécurisation des flux).*
