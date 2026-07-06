<div class="chapitre-titre-num">CHAPITRE 18</div>

# Les caméras

## Objectifs pédagogiques

Connaître les différents types de caméras IP (dôme, bullet, PTZ, fisheye, thermique, LPR, multi-capteurs) et choisir le bon type selon le contexte d'installation.

## Prérequis

Chapitres 1-17.

## 18.1 Caméra dôme

<div class="encadre astuce">
<span class="encadre-titre">💡 Le dôme : discrétion et résistance au vandalisme</span>
Le boîtier hémisphérique dissimule la direction de visée réelle de la caméra, et sa forme compacte résiste mieux aux tentatives de vandalisme (moins de prise pour l'arracher ou l'orienter manuellement) — le choix par défaut pour les intérieurs (couloirs, halls, salles) et les zones à risque de dégradation.
</div>

Usage typique : couloirs d'hôpital (chapitre 28), halls d'hôtel (chapitre 29), salles de classe (chapitre 26).

## 18.2 Caméra bullet

<div class="encadre astuce">
<span class="encadre-titre">💡 Le bullet : visibilité dissuasive et portée extérieure</span>
Le boîtier cylindrique allongé, visible et clairement orienté, joue un rôle dissuasif par sa présence même — généralement équipé d'un pare-soleil et conçu pour l'extérieur avec une portée infrarouge souvent supérieure aux dômes équivalents.
</div>

Usage typique : périmètres extérieurs, parkings (chapitre 31, centre commercial), entrées de site industriel (chapitre 33, usine).

## 18.3 Caméra PTZ (Pan-Tilt-Zoom)

<div class="encadre astuce">
<span class="encadre-titre">💡 PTZ : couverture active pilotée, en complément des caméras fixes</span>
Une caméra PTZ pivote horizontalement (pan), verticalement (tilt) et zoome optiquement, pilotée manuellement par un opérateur ou automatiquement via des préréglages (tours de garde programmés, poursuite automatique d'un mouvement détecté) — elle complète les caméras fixes plutôt que de les remplacer, pour couvrir de grandes zones ouvertes nécessitant un suivi actif.
</div>

Usage typique : pistes et zones extérieures d'aéroport (chapitre 32), grands parkings, périmètres industriels étendus (chapitre 33).

## 18.4 Caméra fisheye

<div class="encadre astuce">
<span class="encadre-titre">💡 Fisheye : couverture panoramique 360° depuis un point unique</span>
Un objectif fisheye capture une vue à 360° (ou 180° en montage mural) depuis une seule caméra, dé-warpée logiciellement en plusieurs vues rectilignes exploitables — permet de remplacer plusieurs caméras fixes classiques dans un grand espace ouvert (hall, salle de marché) par un unique point de capture, réduisant le nombre de points d'installation et de câblage.
</div>

Usage typique : grands halls ouverts, salles de marché de centre commercial (chapitre 31), atriums universitaires (chapitre 27).

## 18.5 Caméra thermique

<div class="encadre astuce">
<span class="encadre-titre">💡 Thermique : détection indépendante de la luminosité et du camouflage visuel</span>
Une caméra thermique détecte le rayonnement infrarouge de chaleur plutôt que la lumière visible — fonctionne dans l'obscurité totale, à travers la fumée ou le brouillard léger, et détecte une présence humaine même dissimulée derrière un feuillage léger, un cas d'usage impossible pour une caméra optique classique même équipée d'infrarouge d'appoint.
</div>

Usage typique : périmètres extérieurs sensibles (banque, chapitre 30 ; datacenter, chapitre 36), détection d'intrusion nocturne sur grand périmètre industriel (chapitre 33).

## 18.6 LPR/ANPR (Lecture de plaques d'immatriculation)

<div class="encadre astuce">
<span class="encadre-titre">💡 Une caméra LPR est optimisée spécifiquement pour la lecture de plaques, pas pour la vidéosurveillance générale</span>
Une caméra LPR/ANPR (Automatic Number Plate Recognition) combine un objectif à mise au point fixe sur la zone de passage des véhicules, un éclairage infrarouge puissant synchronisé à l'obturation, et un traitement embarqué optimisé pour la lecture de caractères à vitesse de circulation — approfondie au chapitre 23 (intégration).
</div>

Usage typique : contrôle d'accès de parking (centre commercial, chapitre 31), entrées/sorties de site logistique ou industriel (chapitre 33), contrôle aux abords d'aéroport (chapitre 32).

## 18.7 Caméra multi-capteurs (multi-imager)

<div class="encadre astuce">
<span class="encadre-titre">💡 Plusieurs capteurs orientables sur un seul boîtier et un seul point de câblage</span>
Une caméra multi-capteurs regroupe 2 à 4 capteurs indépendants orientables individuellement sur un unique boîtier — permet de couvrir plusieurs angles depuis un seul point d'installation (un seul câble PoE, une seule adresse IP logique par flux), réduisant le nombre de points de fixation nécessaires sur un mât ou un angle de bâtiment.
</div>

Usage typique : intersections de grands campus (chapitre 35), angles de bâtiments industriels nécessitant plusieurs vues (chapitre 33).

## 18.8 Tableau de synthèse : quel type de caméra pour quel usage

| Type | Résolution typique | Usage privilégié | Résistance intempéries requise |
|---|---|---|---|
| Dôme | Standard à élevée | Intérieur, discrétion | Faible à moyenne (IK élevé pour vandalisme) |
| Bullet | Standard à élevée | Extérieur, dissuasion visible | Élevée (IP66+) |
| PTZ | Élevée, zoom optique | Suivi actif, grandes zones ouvertes | Élevée |
| Fisheye | Très élevée (couverture large) | Grands espaces ouverts, un seul point de vue | Faible à moyenne (souvent intérieur) |
| Thermique | Faible en pixels, détection uniquement | Détection nocturne, périmètre sensible | Élevée |
| LPR/ANPR | Élevée, ciblée | Lecture de plaques, points de passage véhicules | Élevée |
| Multi-capteurs | Élevée par capteur | Couverture multi-angle depuis un point unique | Élevée |

## 18.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Choisir une caméra PTZ pour une surveillance continue de zone fixe</span>
Une caméra PTZ pilotée manuellement ne peut couvrir qu'une seule direction à la fois — une zone nécessitant une surveillance continue et simultanée (et non un suivi actif ponctuel) doit être couverte par des caméras fixes (dôme/bullet), la PTZ venant en complément pour l'investigation ou le suivi actif, jamais en remplacement de la couverture de base.
</div>

## 18.10 Bonnes pratiques

- Choisir le type de caméra selon l'usage réel (dissuasion, identification, détection nocturne, lecture de plaque), jamais par défaut.
- Vérifier systématiquement la compatibilité ONVIF avant tout achat, pour préserver l'interopérabilité avec le NVR/VMS (chapitre 22).
- Combiner les types de caméras selon les zones : dôme en intérieur, bullet en périmètre extérieur, thermique sur les points sensibles nocturnes.

## 18.11 Résumé du chapitre

- Chaque type de caméra (dôme, bullet, PTZ, fisheye, thermique, LPR, multi-capteurs) répond à un besoin précis, non interchangeable.
- La caméra thermique détecte indépendamment de la luminosité ; la caméra LPR est spécifiquement optimisée pour la lecture de plaques.
- Le choix du type de caméra découle directement de l'usage identifié lors de l'analyse des besoins (chapitre 5), pas d'une préférence générique.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Un site industriel a un périmètre extérieur étendu à surveiller la nuit, avec un risque d'intrusion dissimulée dans la végétation environnante. Quel type de caméra recommanderiez-vous en priorité ?
</div>

**Corrigé :**
Une caméra **thermique** : elle détecte la chaleur corporelle indépendamment de la luminosité nocturne et à travers un léger camouflage végétal, un cas d'usage où les caméras optiques classiques (même avec infrarouge d'appoint) sont nettement moins fiables.

*Chapitre suivant : les calculs de champ de vision, résolution, densité de pixels et nombre de caméras nécessaires.*
