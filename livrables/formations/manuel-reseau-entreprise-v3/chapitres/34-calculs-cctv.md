<div class="chapitre-titre-num">CHAPITRE 34</div>

# Calculs CCTV : bande passante, stockage et PoE

## Objectifs pédagogiques

Calculer précisément la bande passante totale, le stockage nécessaire et le budget PoE d'un projet de vidéosurveillance IP, avec des exemples chiffrés complets à 10, 30, 50, 100 et 200 caméras — les trois calculs qui déterminent directement le choix des switches, du NVR/VMS et du stockage (chapitres 13, 16, 36).

## Prérequis

Chapitres 33.

## 34.1 Le débit d'une caméra : la donnée de base de tout le chapitre

Le débit (bitrate) d'une caméra dépend de sa résolution, de son codec, du nombre d'images par seconde et de la complexité de la scène filmée (une scène très animée génère un débit plus élevé qu'une scène statique, à qualité égale) — les valeurs ci-dessous sont des **ordres de grandeur indicatifs**, à affiner avec le calculateur du fabricant retenu avant un dimensionnement final.

| Résolution | Codec | Débit indicatif (25-30 im/s) |
|---|---|---|
| 2 MP (1080p) | H.264 | ~4 Mbit/s |
| 2 MP (1080p) | H.265 | ~2 Mbit/s |
| 4 MP | H.264 | ~6 Mbit/s |
| 4 MP | H.265 | ~3 Mbit/s |
| 8 MP (4K) | H.264 | ~14 Mbit/s |
| 8 MP (4K) | H.265 | ~7 Mbit/s |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi H.265 plutôt que H.264 par défaut dans ce manuel</span>
Le codec **H.265** (HEVC) offre, à qualité d'image équivalente, un débit environ **deux fois inférieur** à H.264 — un gain direct et considérable sur les trois calculs de ce chapitre (bande passante, stockage, et indirectement le coût du matériel réseau nécessaire). Le compromis : H.265 exige davantage de puissance de calcul pour le décodage à l'affichage (côté NVR/VMS et poste de consultation) — un compromis largement favorable sur tout projet neuf de ce manuel, où le matériel de décodage moderne absorbe cette charge sans difficulté.
</div>

## 34.2 Calcul de la bande passante totale

```
Bande passante totale = Nombre de cameras × Debit par camera
```

**Exemple** : 21 caméras (projet fil rouge, marge incluse, chapitre 8) en 4 MP H.265 (~3 Mbit/s chacune) : `21 × 3 = 63 Mbit/s` de bande passante totale agrégée vers le NVR — cette valeur dimensionne directement le lien entre les switches PoE dédiés et le NVR (chapitre 13.6, uplink SFP recommandé au-delà de quelques dizaines de Mbit/s pour conserver de la marge).

## 34.3 Calcul du stockage

```
Stockage par jour et par camera (Go) = (Debit en Mbit/s ÷ 8) × 86 400 secondes ÷ 1000
Stockage total = Stockage par jour et par camera × Nombre de jours de retention × Nombre de cameras
```

**Exemple pas à pas**, pour une caméra à 3 Mbit/s (4 MP H.265) enregistrant en continu, avec une rétention de 30 jours :

1. Débit en mégaoctets par seconde : `3 ÷ 8 = 0,375 Mo/s`
2. Volume sur 24 heures : `0,375 × 86 400 = 32 400 Mo`, soit `32,4 Go/jour`
3. Volume sur 30 jours : `32,4 × 30 = 972 Go`, soit environ **0,95 To par caméra**

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce calcul suppose un enregistrement continu 24 h/24 — la réalité est souvent bien inférieure</span>
Un enregistrement déclenché uniquement par **détection de mouvement** (plutôt qu'un flux continu ininterrompu) réduit typiquement le volume réel de 30 à 70 % selon l'activité de la zone filmée (un couloir peu fréquenté génère beaucoup moins d'événements qu'une entrée principale) — mais ce chapitre calcule systématiquement l'hypothèse **continue**, la plus prudente et la seule fiable pour un dimensionnement de stockage qui ne doit jamais se retrouver à court d'espace en pratique. Une caméra configurée en détection de mouvement au chapitre 36 bénéficiera de cette marge en tampon, jamais d'un stockage jugé "en apparence" suffisant sur la seule base d'une hypothèse optimiste.
</div>

**Ajouter une marge de sécurité** de 15 à 20 % sur le résultat final, pour absorber une sous-estimation du débit réel (scènes plus animées que prévu) et laisser de la place pour la croissance du nombre de caméras (chapitre 8, même logique de marge que partout ailleurs dans ce manuel).

## 34.4 Calcul du budget PoE

Reprendre la méthode déjà posée au chapitre 13.4, appliquée ici à l'ensemble du parc de caméras du projet :

```
Budget PoE necessaire = Somme de la consommation maximale de chaque camera × marge de securite (1,2)
```

## 34.5 Exemples chiffrés complets à 10, 30, 50, 100 et 200 caméras

Hypothèses communes à ce tableau : caméras 4 MP H.265 (~3 Mbit/s chacune), enregistrement continu, rétention 30 jours, consommation PoE moyenne de 9 W par caméra (fixe, avec IR), marge de sécurité 1,2 déjà appliquée à la colonne PoE, marge de 15 % déjà appliquée à la colonne stockage.

| Nombre de caméras | Bande passante totale | Stockage (30 jours, marge incluse) | Budget PoE (marge incluse) |
|---|---|---|---|
| 10 | 30 Mbit/s | ~11,2 To | ~108 W |
| 30 | 90 Mbit/s | ~33,5 To | ~324 W |
| 50 | 150 Mbit/s | ~55,9 To | ~540 W |
| 100 | 300 Mbit/s | ~111,7 To | ~1 080 W |
| 200 | 600 Mbit/s | ~223,4 To | ~2 160 W |

<div class="encadre astuce">
<span class="encadre-titre">💡 Comment lire ce tableau à la lumière de l'arbre de décision du chapitre 10.4</span>
Les paliers de ce tableau confirment très concrètement les seuils posés au chapitre 10.4 : à 10-30 caméras, le stockage (quelques dizaines de To) reste gérable par un NVR d'entrée/moyenne gamme équipé de quelques disques ; à 100-200 caméras, un volume de 100 à plus de 200 To dépasse largement la capacité confortable d'un NVR classique et justifie pleinement une architecture VMS avec du stockage extensible (baie SAN dédiée) — le tableau chiffré rend visible, plutôt qu'affirmée sans preuve, la raison technique exacte de ce seuil.
</div>

## 34.6 Application au projet fil rouge (21 caméras, chapitre 8)

En reprenant exactement les hypothèses de la section 34.5 pour 21 caméras : bande passante `21 × 3 = 63 Mbit/s`, stockage `21 × 0,95 To × 1,15 (marge) ≈ 22,9 To` sur 30 jours, budget PoE `21 × 9 × 1,2 ≈ 227 W`. Ces trois valeurs sont directement réutilisées pour dimensionner le NVR (Volume 12, chapitre 36 — capacité de stockage physique à prévoir avec une marge de croissance supplémentaire au-delà de ces 22,9 To) et le switch PoE dédié (chapitre 13.4 — un budget PoE de 227 W minimum, un modèle à 370 W de budget total laissant une bonne marge pour une extension future).

## Résumé du chapitre

Trois calculs, toujours dans cet ordre : bande passante (débit unitaire × nombre de caméras), stockage (débit converti en volume par jour, multiplié par les jours de rétention et le nombre de caméras, avec une marge de 15-20 %), et budget PoE (consommation cumulée avec une marge de 1,2, méthode du chapitre 13.4). Le codec H.265 réduit ces trois calculs d'environ moitié par rapport à H.264, un choix par défaut recommandé sur tout projet neuf. Le calcul est toujours mené sur l'hypothèse prudente d'un enregistrement continu, même si le paramétrage réel final (chapitre 36) utilisera souvent la détection de mouvement pour réduire le volume effectivement occupé.

*Chapitre suivant : la configuration des caméras — adresses IP, résolution, codec, WDR, IR, détection et événements.*
