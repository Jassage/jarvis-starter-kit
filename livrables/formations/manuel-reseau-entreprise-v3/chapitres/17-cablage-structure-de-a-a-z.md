<div class="chapitre-titre-num">CHAPITRE 17</div>

# Câblage structuré de A à Z

## Objectifs pédagogiques

Réaliser un câblage structuré complet, de la planification à la certification, conforme aux normes ISO/IEC 11801 et TIA/EIA-568, sans sauter aucune étape — la compétence manuelle la plus fondamentale de tout technicien réseau terrain.

## Prérequis

Chapitre 9 (étude de site).

## OBJECTIF

Tirer, terminer, étiqueter et certifier l'ensemble du câblage cuivre horizontal d'un projet, du local technique jusqu'à chaque prise murale, avec une qualité garantissant la catégorie de performance annoncée (Cat5e/6/6A).

## PRÉREQUIS

Étude de site complète (chapitre 9), plan des emplacements de prises validé avec le client, local technique confirmé.

## MATÉRIEL NÉCESSAIRE

- Câble réseau en touret (catégorie choisie, 17.2) ;
- prises murales (roses) et connecteurs **keystone** correspondant à la catégorie du câble ;
- patch panels (autant de ports que de prises prévues, avec marge) ;
- goulottes, gaines, colliers/attaches velcro (jamais de collier plastique rigide qui écrase le câble, 17.5) ;
- outil de sertissage RJ45 (si connecteurs directs) et outil de perforation (**punch down tool**) pour keystones et patch panels ;
- pince à dénuder ;
- étiqueteuse ;
- testeur de câble simple (continuité) ;
- certificateur de câblage professionnel (17.12).

## LOGICIELS NÉCESSAIRES

Aucun logiciel n'est strictement nécessaire pour le tirage lui-même ; un tableur ou un outil de plan simple suffit pour documenter le plan de câblage (chapitre 3.6, généralisé au chapitre 47).

## TOPOLOGIE

Toujours en étoile (chapitre 3.4) : chaque prise murale relie individuellement, par son propre câble, le local technique — jamais de câblage en chaîne (daisy-chain) entre plusieurs prises.

## 17.1 Étape 1 — Réutiliser l'étude de site

Le plan des emplacements de prises et les distances mesurées lors de l'étude de site (chapitre 9) sont le point de départ obligatoire de ce chapitre — jamais improvisés sur place le jour du tirage.

## 17.2 Étape 2 — Choisir la catégorie de câble

| Catégorie | Débit supporté | Distance max (câblage standard) | Cas d'usage recommandé |
|---|---|---|---|
| Cat5e | 1 Gbit/s | 100 m | Minimum acceptable pour un nouveau projet, de moins en moins recommandé |
| Cat6 | 1 Gbit/s (10 Gbit/s jusqu'à 55 m) | 100 m | Standard recommandé par défaut dans ce manuel |
| Cat6A | 10 Gbit/s | 100 m | Recommandé pour tout lien destiné à des débits élevés (uplinks, liaisons serveurs) |

**Blindage** : un câble **UTP** (non blindé) suffit dans un environnement de bureau standard. Un câble **FTP/STP** (blindé) devient nécessaire à proximité de sources d'interférences électromagnétiques fortes (moteurs industriels, gros transformateurs, éclairage fluorescent dense) — vérifié lors de l'étude de site.

**Extérieur** : un câble tiré à l'extérieur (entre deux bâtiments proches, courte distance) nécessite une gaine spécifique résistante aux UV et à l'humidité — jamais un câble d'intérieur standard exposé aux intempéries.

## 17.3 Étape 3 — Planifier les chemins de câbles

<div class="encadre attention">
<span class="encadre-titre">⚠️ La règle des 100 mètres inclut les cordons, pas seulement le câble tiré dans le mur</span>
La norme TIA/EIA-568 limite le **lien permanent** (le câble tiré dans les murs, du patch panel à la prise murale) à 90 mètres, en réservant 10 mètres supplémentaires pour les cordons de brassage aux deux extrémités (cordon patch panel-switch + cordon prise-appareil), pour un **canal total** de 100 mètres. Un tirage de 95 mètres de câble dans le mur, même conforme à "moins de 100 m" en apparence, ne laisse quasiment plus de marge pour les cordons — à corriger dès la planification, jamais découvert après le tirage.
</div>

Privilégier les chemins existants (faux plafond, gaines techniques déjà repérés à l'étude de site) et respecter une **distance de séparation** avec les câbles électriques de puissance (au moins 30 cm en parcours parallèle, croisement à angle droit si un croisement est inévitable) pour limiter les interférences électromagnétiques.

## 17.4 Étape 4 — Tirer les câbles

1. Dérouler le câble depuis le touret sans jamais le tirer directement du centre (le touret doit tourner librement sur un axe, sous peine de vrilles et de nœuds internes invisibles qui dégradent la performance).
2. Respecter un **rayon de courbure minimal** de 4 fois le diamètre du câble à chaque coude — un câble plié trop serré endommage les paires torsadées internes de façon irréversible et invisible à l'œil nu.
3. Ne jamais dépasser la **tension de traction maximale** du câble (indiquée par le fabricant, généralement autour de 11 kg pour un Cat6 standard) — un tirage trop violent étire les conducteurs internes et dégrade la performance électrique.
4. Laisser une **boucle de service** (1 à 2 mètres) à chaque extrémité, dans le local technique et près de la prise murale — indispensable pour une future reprise sans devoir retirer un nouveau câble.

## 17.5 Étape 5 — Fixer les câbles sur leur chemin

Utiliser des **attaches velcro réutilisables**, jamais des colliers plastiques rigides serrés au maximum — un collier trop serré écrase la gaine et déforme les paires torsadées internes, dégradant la performance de façon durable et souvent indétectable sans certification (17.12).

## 17.6 Étape 6 — Étiqueter chaque câble et chaque prise

Adopter un système d'identifiant unique et cohérent, du type `B01-2F-P015` (Bâtiment 01, 2ᵉ étage, Prise 015) — la méthode complète de nomenclature, réutilisée sur l'ensemble d'un projet (plan de câblage, plan de ports), est développée au chapitre 47. Étiqueter systématiquement **les trois extrémités** de chaque lien : la prise murale, le câble lui-même à quelques centimètres de chaque bout, et le port correspondant sur le patch panel.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un câblage non étiqueté au moment du tirage ne sera (presque) jamais étiqueté correctement après coup</span>
Retrouver, des mois plus tard, à quelle prise correspond quel port de patch panel sans étiquetage d'origine impose de suivre physiquement chaque câble un par un dans le faux plafond — une perte de temps considérable évitable à 100 % par un étiquetage systématique fait **au moment du tirage**, jamais reporté à "plus tard".
</div>

## 17.7 Étape 7 — Terminer les câbles : le standard de câblage T568B

Un connecteur RJ45 (ou une terminaison keystone) respecte un ordre de couleurs précis pour ses 8 fils. Le standard **T568B**, le plus répandu dans ce manuel (l'important étant surtout la **cohérence sur l'ensemble d'un même projet**, jamais un mélange des deux standards), attribue les couleurs suivantes :

| Broche | Couleur (T568B) |
|---|---|
| 1 | Blanc/Orange |
| 2 | Orange |
| 3 | Blanc/Vert |
| 4 | Bleu |
| 5 | Blanc/Bleu |
| 6 | Vert |
| 7 | Blanc/Marron |
| 8 | Marron |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais mélanger T568A et T568B sur un même projet</span>
Les deux standards (T568A et T568B) sont tous deux valides individuellement — un câble terminé T568B aux deux bouts fonctionne parfaitement — mais **mélanger les deux standards sur un même projet** (certaines prises en A, d'autres en B) est une source fréquente d'erreurs de dépannage futures, en plus d'introduire un risque réel si un câble croisé (T568A à une extrémité, T568B à l'autre) est réalisé par erreur là où un câble droit était attendu. Ce manuel utilise T568B de façon cohérente sur l'ensemble de ses six projets (Volume 16).
</div>

## 17.8 Étape 8 — Terminer les prises keystone

<div class="ou-executer">MATÉRIEL — OUTIL DE PERFORATION (PUNCH DOWN TOOL)</div>

1. Dénuder la gaine externe du câble sur environ 3 cm, sans entailler l'isolant des paires internes.
2. Détordre chaque paire **le moins possible** (quelques millimètres seulement) — détordre davantage dégrade l'annulation des interférences que la torsion des paires est justement censée garantir.
3. Insérer chaque fil dans son emplacement de couleur correspondante sur le connecteur keystone, en suivant le code couleur imprimé dessus (T568B, 17.7).
4. Enfoncer l'outil de perforation sur chaque fil pour sertir la connexion et couper l'excédent en un seul geste.
5. Clipser le connecteur keystone terminé dans la prise murale.

## 17.9 Étape 9 — Terminer les patch panels

Même principe que pour les keystones (17.8), répété pour chaque port du patch panel, en respectant l'organisation prévue dans le plan de câblage (chapitre 47) — un port de patch panel donné doit toujours correspondre à l'identifiant de prise documenté, jamais attribué au hasard au fil du tirage.

## 17.10 Étape 10 — Monter le patch panel en baie

Le montage physique du patch panel dans la baie, son emplacement exact et son organisation avec les autres équipements font l'objet complet du chapitre 18.

## 17.11 Étape 11 — Le brassage : relier le patch panel au switch

Le **brassage** utilise des cordons courts (0,5 à 2 mètres selon la disposition de la baie), jamais un câble de plusieurs dizaines de mètres réutilisé par simplicité — chaque cordon de brassage relie un port de patch panel à un port de switch, matérialisant physiquement l'attribution VLAN (port access, chapitre 12.3) configurée à l'étape suivante (Volume 7).

## 17.12 Étape 12 — Tester puis certifier

### Test simple (continuité)

<div class="ou-executer">TESTEUR DE CÂBLE SIMPLE</div>

Brancher les deux extrémités du lien terminé sur le testeur — l'appareil vérifie que chacune des 8 broches est correctement reliée de bout en bout, sans inversion ni coupure.

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Les 8 voyants du testeur s'allument dans l'ordre 1-2-3-4-5-6-7-8 sur les deux moitiés de l'appareil, de façon synchronisée. Un voyant qui ne s'allume pas indique un fil coupé ; un ordre différent entre les deux moitiés indique une inversion de paires (croisement non voulu) ; deux voyants allumés simultanément sur une broche indiquent un court-circuit.
</div>

### Certification professionnelle

<div class="ou-executer">CERTIFICATEUR DE CÂBLAGE (ex. Fluke Networks ou équivalent)</div>

Contrairement au simple test de continuité, un certificateur professionnel mesure la **performance électrique réelle** du lien : longueur exacte, atténuation du signal, diaphonie entre paires (NEXT — Near-End Crosstalk), et délivre un verdict PASS/FAIL par rapport à la catégorie annoncée (Cat6, Cat6A...).

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Un rapport "PASS" pour chaque paramètre mesuré, sur chacune des 4 paires du câble, avec la longueur mesurée cohérente avec la distance réelle du tirage (chapitre 17.3 — la règle des 100 m vérifiée concrètement, pas seulement estimée).
</div>

## DÉPANNAGE

### Si le test simple échoue (paire inversée)

Rouvrir le connecteur en cause (prise ou patch panel), vérifier que l'ordre des couleurs suit bien le standard T568B (17.7) sur toute sa longueur, resertir.

### Si le test simple échoue (court-circuit)

Vérifier qu'aucun fil dénudé ne touche accidentellement un fil voisin au niveau de la terminaison — un dénudage trop long (17.8, étape 1) en est la cause la plus fréquente.

### Si la certification échoue en diaphonie (NEXT) alors que le test simple avait réussi

C'est le scénario le plus révélateur de l'intérêt de la certification par rapport au simple test : une **paire trop détordue** à la terminaison (17.8, étape 2) laisse passer la continuité électrique de base (test simple : PASS) tout en dégradant sérieusement l'annulation des interférences entre paires (certification : FAIL) — reprendre la terminaison en détordant la paire le moins possible.

### Si la certification échoue en longueur, dépassant 90 m de lien permanent

Revoir le chemin de câblage (17.3) pour un tracé plus direct, ou envisager un point de distribution intermédiaire (un second local technique) si la distance réelle du bâtiment l'impose structurellement.

## SAUVEGARDE

Conserver chaque rapport de certification (fichier ou impression) dans le dossier de projet — il constitue la preuve documentée de la qualité du câblage livré, réutilisée dans la documentation finale du client (chapitre 49).

## DOCUMENTATION

Le plan de câblage complet (chapitre 47) et les rapports de certification de chaque lien font partie intégrante des livrables finaux du projet (chapitre 45).

## CHECKLIST DE FIN

- [ ] Catégorie de câble choisie et cohérente sur tout le projet
- [ ] Distances de séparation avec le câblage électrique respectées
- [ ] Rayon de courbure et tension de traction respectés sur tout le tirage
- [ ] Boucle de service laissée à chaque extrémité
- [ ] Câbles fixés avec des attaches velcro, jamais de collier rigide écrasant la gaine
- [ ] Chaque câble et chaque prise étiquetés selon la nomenclature du projet
- [ ] Standard T568B appliqué de façon cohérente sur l'ensemble du projet
- [ ] Chaque lien testé en continuité (test simple)
- [ ] Chaque lien certifié (longueur, atténuation, NEXT) avec un rapport PASS conservé
- [ ] Plan de câblage final mis à jour et archivé dans le dossier de projet

## Résumé du chapitre

Le câblage structuré suit un ordre strict : réutiliser l'étude de site, choisir la catégorie de câble adaptée, planifier les chemins en respectant la règle des 100 m (90 m de lien permanent + 10 m de cordons), tirer en respectant rayon de courbure et tension maximale, fixer sans écraser, étiqueter systématiquement au moment du tirage, terminer en T568B de façon cohérente, brasser avec des cordons courts, puis tester (continuité) et certifier (performance électrique réelle) chaque lien avant de le considérer livré.

*Chapitre suivant : l'installation de la baie informatique — rack, PDU, UPS, patch panels et organisation complète.*
