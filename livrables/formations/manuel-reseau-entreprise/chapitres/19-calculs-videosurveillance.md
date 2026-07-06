<div class="chapitre-titre-num">CHAPITRE 19</div>

# Calculs de vidéosurveillance

## Objectifs pédagogiques

Calculer le champ de vision d'une caméra, déterminer la densité de pixels nécessaire selon l'objectif (détection, reconnaissance, identification), et estimer le nombre de caméras requis pour couvrir une zone donnée.

## Prérequis

Chapitres 1-18.

## 19.1 Champ de vision (Field of View, FOV)

<div class="encadre astuce">
<span class="encadre-titre">💡 Le champ de vision dépend de la focale de l'objectif et de la taille du capteur</span>
Formule du champ de vision horizontal :

```
FOV_horizontal = 2 x arctan( largeur_capteur / (2 x focale) )
```

Une caméra à capteur 1/2,8" (largeur ≈ 5,6 mm) équipée d'un objectif de 4 mm de focale offre un FOV horizontal large, adapté à la couverture d'une pièce ; la même caméra avec un objectif de 12 mm offre un FOV plus étroit mais une portée de détail plus grande à distance égale.
</div>

**Exemple de calcul** : capteur de largeur 5,6 mm, focale de 4 mm.

```
FOV = 2 x arctan(5,6 / (2 x 4)) = 2 x arctan(0,7) = 2 x 35 degres ≈ 70 degres
```

Avec un objectif de 8 mm sur le même capteur :

```
FOV = 2 x arctan(5,6 / (2 x 8)) = 2 x arctan(0,35) = 2 x 19,3 degres ≈ 38,6 degres
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Retenir la logique : focale courte = champ large mais moins de détail, focale longue = champ étroit mais plus de détail à distance</span>
Une focale de 2,8-4 mm convient à une pièce ou un couloir proche ; une focale de 8-12 mm convient à un périmètre extérieur ou une entrée à couvrir à plus longue distance avec un niveau de détail suffisant pour l'identification (section 19.2).
</div>

## 19.2 Densité de pixels selon l'objectif de surveillance

<div class="encadre astuce">
<span class="encadre-titre">💡 La norme EN 62676-4 définit quatre niveaux d'usage, chacun avec une densité de pixels minimale</span>
La densité de pixels se mesure en pixels par mètre (PPM) à la distance de la scène observée — plus l'objectif de surveillance est exigeant (identifier un visage plutôt que simplement détecter une présence), plus la densité de pixels requise est élevée.
</div>

| Niveau d'usage | Densité minimale recommandée | Cas d'usage |
|---|---|---|
| **Détection** (constater une présence) | 25 px/m | Surveillance périmétrique générale |
| **Observation** (suivre une action) | 63 px/m | Zones de circulation, halls |
| **Reconnaissance** (reconnaître une personne déjà connue) | 125 px/m | Entrées, zones sensibles |
| **Identification** (identifier une personne inconnue avec certitude, valeur juridique) | 250 px/m | Caisses, guichets, points d'accès contrôlé, LPR (chapitre 18) |

## 19.3 Calcul du nombre de pixels nécessaire sur la largeur de la scène

**Formule** :

```
Pixels_horizontaux_necessaires = Largeur_de_la_scene_en_metres x Densite_ppm_visee
```

**Exemple** : un guichet de banque (chapitre 30) large de 2 mètres nécessite un niveau **Identification** (250 px/m).

```
Pixels_necessaires = 2 m x 250 px/m = 500 pixels horizontaux minimum
```

Une caméra Full HD (1920x1080) offre 1920 pixels horizontaux — largement suffisant pour cette scène de 2 mètres de large en niveau Identification, avec une marge confortable.

**Contre-exemple** : un parking extérieur de 25 mètres de large observé en niveau **Détection** (25 px/m) avec la même caméra.

```
Pixels_necessaires = 25 m x 25 px/m = 625 pixels horizontaux minimum
```

Une caméra Full HD (1920 px) couvre cette largeur avec une marge confortable en détection ; en revanche, si l'objectif était l'**identification** sur cette même largeur de 25 mètres :

```
Pixels_necessaires = 25 m x 250 px/m = 6250 pixels horizontaux
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une seule caméra Full HD ne peut pas identifier des visages sur 25 mètres de large</span>
6250 pixels dépassent largement la résolution horizontale d'une caméra Full HD (1920 px), et même 4K (3840 px) — ce cas nécessite soit plusieurs caméras couvrant chacune une portion plus étroite de la scène, soit une caméra à très haute résolution dédiée, soit la révision de l'objectif réel (l'identification sur 25 m de large simultanément est rarement un besoin réaliste ; le découpage en zones plus ciblées, chapitre 20, est la solution pratique.
</div>

## 19.4 Distance maximale utile d'une caméra selon l'objectif

<div class="encadre astuce">
<span class="encadre-titre">💡 Relier focale, résolution du capteur et distance pour estimer la portée utile</span>
Pour une focale et une résolution de capteur données, la distance maximale à laquelle un niveau de densité de pixels donné reste respecté peut être approximée à partir du FOV (section 19.1) et du nombre de pixels horizontaux du capteur, en appliquant la formule inverse du calcul de la section 19.3 sur la largeur de scène couverte à cette distance.
</div>

## 19.5 Estimation du nombre de caméras nécessaires

**Méthode simplifiée pour un périmètre extérieur linéaire** :

```
Nombre_de_cameras = Longueur_du_perimetre / Portee_utile_par_camera
```

**Exemple** : un périmètre de 200 mètres, avec des caméras bullet (chapitre 18) dont la portée utile en niveau Reconnaissance est de 25 mètres par caméra, en tenant compte d'un léger chevauchement de 10 % entre zones couvertes :

```
Portee_effective_par_camera = 25 m x 0,9 = 22,5 m (avec chevauchement)
Nombre_de_cameras = 200 m / 22,5 m ≈ 9 cameras
```

**Méthode pour une surface intérieure ouverte (fisheye ou dômes fixes)** :

```
Nombre_de_cameras = Surface_totale_m2 / Surface_couverte_par_camera_m2
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours arrondir à l'entier supérieur et ajouter une marge de recouvrement</span>
Un calcul donnant 8,3 caméras impose 9 caméras réelles — arrondir systématiquement au supérieur, et prévoir un recouvrement de 10 à 15 % entre zones de couverture adjacentes pour éviter les angles morts aux limites de portée de chaque caméra.
</div>

## 19.6 Tableau récapitulatif de dimensionnement (exemple appliqué)

| Zone | Largeur/Périmètre | Niveau requis | Densité (px/m) | Caméras estimées |
|---|---|---|---|---|
| Guichet banque | 2 m | Identification | 250 | 1 |
| Hall d'entrée | 15 m | Reconnaissance | 125 | 2 |
| Parking extérieur | 60 m (périmètre) | Détection | 25 | 3 |
| Entrée véhicules (LPR) | 4 m (voie unique) | Identification dédiée | 250+ (caméra LPR spécialisée) | 1 par voie |

## 19.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre résolution du capteur et densité de pixels utile sur la scène</span>
Une caméra 4K (8 mégapixels) ne garantit pas automatiquement un niveau d'identification sur une scène large — si son objectif capture un champ de vision très étendu, la densité de pixels par mètre à la distance de la scène observée peut rester insuffisante (rappel de la section 19.3), malgré une résolution native élevée.
</div>

## 19.8 Bonnes pratiques

- Toujours définir le niveau d'usage requis (détection, observation, reconnaissance, identification) AVANT de choisir la caméra et l'objectif, jamais après coup.
- Prévoir un recouvrement de 10-15 % entre caméras adjacentes lors du calcul du nombre de caméras nécessaires.
- Documenter le calcul de dimensionnement dans le dossier d'architecture (chapitre 25), zone par zone, avec le niveau d'usage retenu et sa justification.

## 19.9 Résumé du chapitre

- Le champ de vision dépend de la focale de l'objectif et de la taille du capteur, calculable par une formule trigonométrique simple.
- La norme EN 62676-4 définit quatre niveaux de densité de pixels (détection, observation, reconnaissance, identification), chacun avec un seuil minimal en pixels par mètre.
- Le nombre de caméras nécessaires se calcule en divisant le périmètre ou la surface totale par la portée/couverture utile de chaque caméra, avec une marge de recouvrement.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Une entrée de bâtiment large de 3 mètres nécessite un niveau Identification (250 px/m). Combien de pixels horizontaux minimum sont nécessaires, et une caméra Full HD (1920x1080) suffit-elle ?
</div>

**Corrigé :**
```
Pixels_necessaires = 3 m x 250 px/m = 750 pixels horizontaux minimum
```
Une caméra Full HD (1920 pixels horizontaux) **suffit largement**, avec une marge confortable au-delà du minimum requis.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.2</span>

Un périmètre extérieur de 150 mètres doit être couvert en niveau Observation par des caméras bullet d'une portée utile de 20 mètres chacune, avec 10 % de recouvrement. Combien de caméras faut-il prévoir ?
</div>

**Corrigé :**
```
Portee_effective = 20 m x 0,9 = 18 m
Nombre_de_cameras = 150 / 18 = 8,3 -> 9 cameras (arrondi superieur)
```

*Chapitre suivant : l'installation des caméras (positionnement, hauteur, angle, éclairage, indices IP/IK).*
