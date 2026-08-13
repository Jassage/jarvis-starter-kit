<div class="chapitre-titre-num">PARTIE II · CHAPITRE 10</div>

# Topologies réseau et câblage structuré

## Rôle des topologies réseau

La topologie décrit la façon dont les équipements réseau sont physiquement et logiquement reliés entre eux. Ce choix conditionne directement la résilience (une panne d'un équipement isole-t-elle une partie du réseau ?), la performance (combien de sauts entre deux points ?) et le coût (combien de câblage et d'équipements actifs sont nécessaires). Un administrateur système doit savoir reconnaître la topologie en place, en identifier les points de défaillance unique (SPOF, Partie I Chapitre 3), et choisir la bonne topologie pour un nouveau déploiement.

## Fonctionnement : les topologies courantes

| Topologie | Description | Résilience | Usage typique |
|---|---|---|---|
| Bus | Tous les équipements partagent un unique câble | Très faible (une coupure isole tout le segment) | Obsolète, historique uniquement |
| Étoile | Chaque équipement relié individuellement à un switch central | Dépend du switch central (SPOF) | Standard en entreprise aujourd'hui |
| Étoile étendue (hiérarchique) | Plusieurs étoiles reliées à un switch cœur de réseau | Bonne si le cœur est redondé | Réseaux PME à grande entreprise |
| Maillée (mesh) | Chaque nœud relié à plusieurs autres | Excellente, coûteuse en câblage | Cœurs de réseau critiques, datacenters |
| Anneau | Chaque équipement relié à ses deux voisins en boucle | Moyenne (redondance native mais rupture=isolement partiel) | Réseaux opérateur, certains SAN |

<div class="encadre info">
<span class="encadre-titre">ℹ️ À savoir</span>
La quasi-totalité des réseaux d'entreprise modernes suivent une architecture hiérarchique à trois niveaux : **cœur** (core, commutation à très haute performance entre blocs), **distribution** (agrégation et routage inter-VLAN), **accès** (access, où se connectent postes et périphériques). Cette hiérarchie facilite la croissance et l'isolement des pannes.
</div>

## Prérequis à la conception ou à l'audit d'une topologie

- Un inventaire des bâtiments, étages et distances entre points de connexion
- Une estimation du nombre de prises réseau nécessaires par zone, avec marge de croissance
- La connaissance des normes de câblage applicables (voir 10.5)

## Mise en place : méthode de conception

1. **Réaliser un relevé physique (site survey)** — Mesurer chaque distance, identifier les obstacles (murs porteurs, gaines existantes).
2. **Positionner le local technique / la salle serveur** — Central par rapport aux zones desservies, sécurisé, ventilé.
3. **Calculer les longueurs de câble avec marge** — Ajouter 15 à 20 % à chaque mesure réelle pour les coudes et le passage.
4. **Respecter la limite de 100 m par lien cuivre** — Norme TIA-568 : 90 m de câble horizontal maximum + 10 m de cordons de brassage.
5. **Prévoir la fibre optique pour les liaisons inter-bâtiments** — Au-delà de 100 m, ou pour un débit garanti supérieur au cuivre.
6. **Organiser et étiqueter le câblage dès la pose** — Voir méthode détaillée ci-dessous.

## Configuration : normes de câblage structuré

| Catégorie de câble | Débit garanti | Distance max | Usage recommandé |
|---|---|---|---|
| Cat5e | 1 Gbit/s | 100 m | Minimum acceptable, à éviter en neuf |
| Cat6 | 1 Gbit/s (10 Gbit/s à courte distance) | 100 m (55 m pour 10G) | Standard actuel pour tout nouveau câblage |
| Cat6A | 10 Gbit/s | 100 m | Zones à fort besoin de débit (salle serveur) |
| Fibre OM3/OM4 (multimode) | 10 à 40 Gbit/s | 300-400 m | Liaisons inter-bâtiments, inter-racks |
| Fibre OS2 (monomode) | 10 Gbit/s et plus | Plusieurs km | Longue distance, inter-sites |

## Organisation du rack et étiquetage

- Numéroter chaque câble aux deux extrémités dès sa pose, avec un format cohérent (ex. `A-1-BUR01-P1` pour Bâtiment A, étage 1, bureau 01, prise 1)
- Tenir un tableau de brassage à jour (panneau de brassage ↔ port switch ↔ prise murale)
- Regrouper les câbles par destination avec des serre-câbles réutilisables (velcro, jamais de collier plastique définitif qui empêche toute évolution)
- Séparer physiquement courants forts (alimentation 220V) et courants faibles (réseau), distance minimale de 20 cm

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>
Tester chaque câble après pose avec un testeur de continuité basique au minimum (huit voyants dans l'ordre), et documenter le résultat. Pour un lien critique (backbone, salle serveur), une certification complète (Fluke DSX) confirme le débit réellement supportable, pas seulement la continuité électrique.
</div>

## Administration courante

- Mettre à jour le tableau de brassage à chaque ajout, déplacement ou retrait de câble
- Auditer périodiquement la cohérence entre le tableau déclaré et la réalité physique du rack
- Prévoir 20 à 30 % de ports libres sur chaque switch et chaque panneau de brassage pour l'évolution

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Privilégier systématiquement une topologie en étoile hiérarchique pour tout nouveau déploiement d'entreprise
- Redonder le switch cœur de réseau dès que la criticité métier le justifie (Partie IX, haute disponibilité)
- Documenter le rayon de courbure minimal de la fibre optique (généralement 30 mm) : la plier au-delà l'endommage silencieusement, sans casse visible immédiate
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Dépasser les 100 m de câble cuivre horizontal, provoquant des erreurs intermittentes difficiles à diagnostiquer plutôt qu'une panne franche
- Mélanger courants forts et courants faibles dans la même goulotte, source d'interférences électromagnétiques
- Négliger l'étiquetage « au moment de la pose », pariant sur une documentation a posteriori qui n'arrive jamais (voir Partie I, Chapitre 4)
- Sous-dimensionner le nombre de prises par poste de travail (une seule prise pour PC + téléphone IP + éventuel second écran réseau)
</div>

## Dépannage

| Symptôme | Cause probable | Vérification |
|---|---|---|
| Erreurs intermittentes sur un lien, débit anormalement bas | Câble trop long (> 100 m) ou de catégorie insuffisante | Mesurer la longueur réelle, vérifier la catégorie |
| Un segment entier de bâtiment tombe en même temps | Panne du switch de distribution desservant ce segment (SPOF) | Vérifier la redondance prévue (Partie IX) |
| Perte de signal sur une liaison fibre inter-bâtiments | Connecteur sale ou câble plié au-delà du rayon minimal | Nettoyer les connecteurs, inspecter le tracé physique |

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le local technique et les racks doivent être physiquement sécurisés (accès restreint, si possible tracé) : un accès physique non contrôlé à un switch ou à un panneau de brassage permet de contourner n'importe quelle protection logique (VLAN, pare-feu). La sécurité physique (Partie XI) est une couche de défense à part entière, souvent négligée au profit de la seule sécurité logique.
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Le manuel de formation `livrables/formations/manuel-reseau-entreprise/` et le projet `livrables/reseau/` (générateur de devis et de plans réseau, utilisé pour des missions clients réelles) documentent déjà la méthode complète de site survey, de calcul de longueurs de câble avec marge de 20 %, et d'organisation de rack décrite dans ce chapitre. Cette même méthode, éprouvée sur des missions de conseil réseau antérieures, est directement applicable à toute extension physique de l'infrastructure de Haitech Solutions.
</div>

## Résumé du chapitre

- La topologie en étoile hiérarchique (accès, distribution, cœur) est le standard des réseaux d'entreprise modernes.
- La limite de 100 m s'applique à tout lien cuivre horizontal ; au-delà, la fibre optique est nécessaire.
- L'étiquetage et le tableau de brassage doivent être tenus à jour au moment de la pose, pas a posteriori.
- La sécurité physique du câblage et des racks est une couche de défense à part entière.

*Chapitre suivant : VLAN et segmentation logique du réseau.*
