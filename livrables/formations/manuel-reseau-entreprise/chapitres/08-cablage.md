<div class="chapitre-titre-num">CHAPITRE 8</div>

# Câblage

## Objectifs pédagogiques

Choisir la catégorie de câble cuivre et le type de fibre optique adaptés à chaque usage, maîtriser les connecteurs courants, réaliser des tests de certification, et appliquer une méthodologie d'étiquetage rigoureuse conforme aux normes ISO/IEC 11801 et TIA/EIA-568.

## Prérequis

Chapitres 1-7.

## 8.1 Câblage cuivre : catégories

| Catégorie | Bande passante | Débit max | Distance max | Usage typique |
|---|---|---|---|---|
| Cat5e | 100 MHz | 1 Gbit/s | 100 m | Postes de travail standards |
| Cat6 | 250 MHz | 1 Gbit/s (10 Gbit/s jusqu'à 55 m) | 100 m | Standard actuel recommandé |
| Cat6A | 500 MHz | 10 Gbit/s | 100 m | Backbone, liaisons switch-switch, PoE++ |
| Cat7 | 600 MHz | 10 Gbit/s | 100 m | Environnements à forte perturbation électromagnétique |
| Cat8 | 2000 MHz | 25/40 Gbit/s | 30 m | Liaisons courtes datacenter (chapitre 36) |

<div class="encadre astuce">
<span class="encadre-titre">💡 Cat6A : le choix par défaut recommandé pour tout nouveau projet en 2026</span>
Le surcoût entre Cat6 et Cat6A reste modeste comparé au coût de la main d'œuvre d'installation — câbler directement en Cat6A garantit une compatibilité 10 Gbit/s sur toute la longueur (100 m) sans reprise future, un choix par défaut judicieux pour tout nouveau projet (Partie 11), sauf contrainte budgétaire très stricte (école, chapitre 26).
</div>

## 8.2 Fibre optique : monomode et multimode

<div class="encadre astuce">
<span class="encadre-titre">💡 Monomode pour la distance, multimode pour le coût sur courte distance</span>
La fibre **monomode** (SMF, cœur ~9 microns) transporte un seul mode de lumière (laser), permettant des distances de plusieurs dizaines de kilomètres sans affaiblissement significatif — utilisée pour les liaisons inter-bâtiments (campus, chapitre 35) ou vers le fournisseur d'accès. La fibre **multimode** (MMF, cœur 50 ou 62,5 microns) transporte plusieurs modes de lumière (LED ou laser courte portée), moins chère à l'équipement (émetteurs-récepteurs), mais limitée à quelques centaines de mètres à quelques kilomètres selon la génération (OM3, OM4, OM5).
</div>

| Type de fibre | Distance typique | Usage |
|---|---|---|
| Monomode (OS2) | Jusqu'à 40+ km | Inter-bâtiments, liaison opérateur, backbone longue distance |
| Multimode OM3 | Jusqu'à 300 m (10G) | Backbone intra-bâtiment |
| Multimode OM4 | Jusqu'à 400 m (10G), 150 m (40G) | Datacenter, liaisons haute densité |
| Multimode OM5 | Similaire OM4, optimisée multiplexage | Datacenter nouvelle génération |

## 8.3 Connecteurs

### 8.3.1 Cuivre : RJ45

Connecteur standard des câbles cuivre Ethernet, terminé selon le brochage **T568A** ou **T568B** (TIA/EIA-568) — le choix du brochage doit rester cohérent sur l'ensemble d'un même projet, T568B étant le plus couramment utilisé en Amérique du Nord et de facto dans de nombreux projets internationaux.

### 8.3.2 Fibre : LC, SC, ST

| Connecteur | Caractéristique | Usage typique |
|---|---|---|
| **LC** | Petit format (small form factor), le plus répandu aujourd'hui | Switches, SFP/SFP+ modernes (chapitre 4) |
| **SC** | Format carré, mécanisme push-pull, plus ancien | Installations existantes, certains équipements opérateur |
| **ST** | Connecteur à baïonnette (tourner pour verrouiller), le plus ancien | Installations historiques, de moins en moins utilisé sur les nouveaux projets |

## 8.4 Tests de certification

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un câble qui "fonctionne" au test de continuité n'est pas nécessairement certifié</span>
Un simple testeur de continuité vérifie uniquement que les 8 fils sont connectés dans le bon ordre — il ne garantit ni la bande passante réelle, ni l'absence de diaphonie (crosstalk), ni la conformité à la catégorie annoncée. Seul un certificateur de câblage (type Fluke Networks) mesurant NEXT, atténuation, longueur, et retour de perte (return loss) permet de délivrer un certificat de conformité Cat6/Cat6A opposable contractuellement au client.
</div>

Paramètres mesurés lors d'une certification cuivre (norme TIA/EIA-568) :

- **Longueur** du lien.
- **Atténuation (Insertion Loss)** : perte de signal sur la longueur du câble.
- **NEXT (Near-End Crosstalk)** : diaphonie entre paires au même point.
- **Return Loss** : réflexion du signal due à des défauts d'impédance.
- **Delay Skew** : différence de temps de propagation entre paires.

Pour la fibre optique, la certification mesure principalement l'**atténuation totale du lien (dB)** via un réflectomètre optique (OTDR) ou un power meter, comparée au budget optique maximal toléré par l'équipement actif.

## 8.5 Étiquetage

<div class="encadre astuce">
<span class="encadre-titre">💡 Un câblage non étiqueté est un câblage non maintenable</span>
Convention recommandée (ISO/IEC 11801) : `[Bâtiment]-[Étage]-[Baie]-[N° panneau]-[N° port]`, identique aux deux extrémités du câble (prise murale et panneau de brassage) — sans cette convention, chaque intervention de maintenance nécessite de retracer physiquement chaque câble, une perte de temps évitable et coûteuse sur un site de grande taille (hôpital, chapitre 28 ; aéroport, chapitre 32).
</div>

```
Exemple d'etiquette : A-2-B1-P03-24
= Batiment A, Etage 2, Baie 1, Panneau 03, Port 24
```

## 8.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Dépasser le rayon de courbure minimal d'un câble fibre optique</span>
Un câble fibre optique plié au-delà de son rayon de courbure minimal (généralement 10 fois le diamètre du câble) subit des pertes de signal parfois invisibles immédiatement mais qui se dégradent avec le temps et les vibrations — toujours respecter les rayons de courbure indiqués par le fabricant lors du cheminement en baie et en chemin de câbles.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger T568A et T568B sur un même projet sans documentation</span>
Bien que les deux brochages soient électriquement équivalents pour une liaison droite, mélanger les standards sans traçabilité complique le diagnostic en cas de câble croisé accidentel — imposer un standard unique documenté au démarrage du projet.
</div>

## 8.7 Bonnes pratiques

- Certifier systématiquement 100 % des liens cuivre et fibre installés, pas un échantillon, et archiver les rapports de certification avec le dossier d'architecture (chapitre 25).
- Respecter un taux de remplissage maximal des chemins de câbles (rappel du chapitre 7) pour préserver le rayon de courbure de chaque câble.
- Étiqueter au moment de la pose, jamais a posteriori — un étiquetage différé multiplie les erreurs et les oublis.

## 8.8 Résumé du chapitre

- Cat6A constitue le choix par défaut recommandé pour tout nouveau câblage cuivre d'entreprise.
- La fibre monomode couvre les longues distances (inter-bâtiments), la fibre multimode les liaisons courtes à moindre coût d'équipement.
- La certification (et non le simple test de continuité) est la seule preuve opposable de conformité à une catégorie de câblage.
- Un étiquetage normalisé et posé au moment de l'installation conditionne la maintenabilité de tout le projet.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 8.1</span>

Un projet nécessite de relier deux bâtiments distants de 800 mètres. Quel type de câblage faut-il utiliser, et pourquoi le cuivre est-il exclu ?
</div>

**Corrigé :**
**Fibre optique monomode** obligatoire : le cuivre (toutes catégories confondues) est limité à 100 mètres par segment, très largement insuffisant pour 800 mètres ; seule la fibre monomode permet cette distance sans répéteur intermédiaire.

*Chapitre suivant : l'installation physique des équipements (montage en rack, ventilation, alimentation redondante).*
