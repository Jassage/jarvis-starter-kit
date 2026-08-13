<div class="chapitre-titre-num">CHAPITRE 33</div>

# Vidéosurveillance IP : la procédure complète en 18 étapes

## Objectifs pédagogiques

Dérouler, dans l'ordre exact, les 18 étapes d'un déploiement complet de vidéosurveillance IP — du recensement des besoins jusqu'au test individuel de chaque caméra — chaque étape s'appuyant sur ce qui a déjà été appris, ou renvoyant précisément au chapitre qui la détaille.

## Prérequis

Volumes 1-11.

## Scénario du volume

Poursuite directe du projet fil rouge du chapitre 8 : 15 caméras (marge à 21), VLAN 80 (`10.10.80.0/26`), NVR à l'adresse `10.10.80.5` déjà réservée dans le plan IP du chapitre 11.2.

## OBJECTIF

Un système de vidéosurveillance IP entièrement fonctionnel, chaque caméra installée, configurée, enregistrant correctement, et individuellement testée avant la mise en production.

## ÉTAPE 1 — Déterminer les besoins

Reprendre le questionnaire de l'étude de site (chapitre 9) spécifiquement sur son volet vidéosurveillance : zones à couvrir, durée de conservation légale à respecter (variable selon la réglementation locale, à vérifier au cas par cas — jamais supposée), qui doit avoir accès à la consultation, et depuis où (sur site uniquement, à distance).

## ÉTAPE 2 — Déterminer le nombre de caméras

<div class="encadre astuce">
<span class="encadre-titre">💡 Un recensement méthodique, jamais une formule mathématique</span>
Contrairement au nombre de bornes Wi-Fi (chapitre 15, calculable par surface et densité), le nombre de caméras se détermine par un **recensement méthodique point par point** des zones à risque ou à valeur de preuve identifiées à l'étude de site : chaque entrée/sortie, chaque zone de caisse ou de manipulation d'argent, chaque zone de stockage sensible, chaque parking, chaque couloir de circulation stratégique. Une caméra par point identifié, jamais un chiffre rond choisi arbitrairement ("on va dire 10 caméras").
</div>

Le nombre obtenu détermine, via l'arbre de décision du chapitre 10.4, l'architecture générale retenue (NVR de bureau, switches PoE dédiés, ou VMS sur serveur dédié selon le seuil franchi).

## ÉTAPE 3 — Choisir le type de caméra, zone par zone

Reprendre la méthode du chapitre 16.1 (dôme discret en intérieur, bullet dissuasive en extérieur, PTZ pour une zone à surveiller activement, fisheye pour une grande salle ouverte) — appliquée individuellement à **chaque** emplacement recensé à l'étape 2, jamais un type unique choisi pour l'ensemble du projet par simplicité.

## ÉTAPE 4 — Déterminer les emplacements précis

En complément des mesures déjà prises à l'étude de site (chapitre 9), quatre règles pratiques s'appliquent à chaque emplacement final :

- **Hauteur** : entre 2,5 et 3 mètres en intérieur (hors de portée de vandalisme facile, tout en restant dans le champ utile de détail) ; plus haut en extérieur selon le risque d'accès.
- **Contre-jour** : jamais une caméra orientée directement face à une source de lumière forte (fenêtre, soleil levant/couchant) sans WDR (chapitre 16.4) — sinon l'image reste inexploitable une bonne partie de la journée.
- **Champ dégagé** : vérifier qu'aucun obstacle (pilier, végétation en croissance, enseigne) ne viendra masquer partiellement le champ de vision dans les mois suivant l'installation.
- **Accessibilité pour la maintenance** : un emplacement techniquement idéal mais inaccessible sans matériel spécialisé (nacelle, échafaudage) complique chaque intervention future — un compromis à documenter explicitement si retenu malgré tout.

## ÉTAPE 5 — Choisir les objectifs

Reprendre la méthode du chapitre 16.3 (fixe si la distance et l'angle sont connus avec certitude, varifocal en cas d'incertitude). **Méthode de calcul de l'angle de champ nécessaire** :

```
Angle horizontal necessaire ≈ 2 × arctan( (largeur de la zone / 2) / distance camera-zone )
```

**Exemple** : une caméra installée à 8 mètres d'une zone large de 10 mètres nécessite un angle horizontal d'environ `2 × arctan(5/8) ≈ 2 × 32° = 64°` — un objectif varifocal couvrant une plage incluant cette valeur (souvent 30-100° sur un modèle courant) convient ; un objectif fixe à 90° fixe serait surdimensionné, un fixe à 45° serait insuffisant.

## ÉTAPES 6-8 — Calculs (bande passante, stockage, PoE)

Ces trois calculs, centraux au dimensionnement du projet, font l'objet complet du chapitre 34 — non répétés ici pour éviter la duplication. Sur le projet fil rouge (21 caméras avec marge), le résultat de ces calculs conditionne directement le choix des switches PoE de l'étape 10.

## ÉTAPE 9 — Créer le VLAN CCTV

Déjà réalisé dans ce projet fil rouge aux chapitres 20 (création du VLAN 80 sur SW-ACCES-01) et 26 (SVI et ACL de restriction sur SW-COEUR) — un lecteur démarrant directement à ce chapitre doit revenir appliquer ces deux chapitres avant de poursuivre.

## ÉTAPE 10 — Installer les switches PoE dédiés

Reprendre la méthode de choix du chapitre 13 (budget PoE total calculé à l'étape 8/chapitre 34) et les conventions d'installation en baie du chapitre 18 — un switch PoE dédié à la vidéosurveillance, distinct des switches utilisateurs, conformément à la décision prise au chapitre 10.5 pour ce projet.

## ÉTAPE 11 — Installer physiquement les caméras

1. Fixer le support (perçage, chevilles adaptées au matériau du mur/plafond identifié à l'étude de site).
2. Raccorder le câble réseau certifié (chapitre 17) avant fixation finale.
3. **Vérifier l'image obtenue** (via l'application mobile du fabricant ou une connexion temporaire) **avant** de serrer définitivement les vis d'orientation — corriger l'angle après un serrage complet endommage souvent le mécanisme d'orientation.
4. Pour une caméra extérieure : sceller la connexion RJ45 dans un boîtier de jonction étanche dédié (jamais un simple connecteur RJ45 nu exposé aux intempéries, même sous un léger auvent).

## ÉTAPES 12-18 — Configuration, enregistrement, utilisateurs, alertes, sécurité et tests

Ces sept étapes se déroulent sur les chapitres suivants de ce volume :

| Étape | Contenu | Chapitre |
|---|---|---|
| 12. Configurer les adresses IP | Réservation DHCP par caméra, paramètres réseau de base | 35 |
| 13. Configurer NVR/VMS | Ajout des caméras, organisation | 36 |
| 14. Configurer l'enregistrement | Calendrier, détection de mouvement, qualité | 36 |
| 15. Configurer les utilisateurs | Comptes et permissions du NVR/VMS | 36 |
| 16. Configurer les alertes | Notifications sur événement | 36 |
| 17. Configurer la sécurité | Mots de passe caméra, accès distant sécurisé | 35, 37 |
| 18. Tester chaque caméra | Checklist individuelle | ci-dessous |

## ÉTAPE 18 — Checklist de test individuel par caméra

Une fois les chapitres 35-36 appliqués, chaque caméra doit être testée **individuellement**, jamais collectivement en supposant qu'un test global suffit :

- [ ] Image nette, mise au point correcte
- [ ] Cadrage conforme à l'emplacement prévu (étape 4), aucun obstacle imprévu
- [ ] Vision nocturne (IR) fonctionnelle, testée après la tombée de la nuit, pas seulement en journée
- [ ] WDR fonctionnel si applicable (contre-jour de l'étape 4 correctement compensé)
- [ ] Enregistrement confirmé sur le NVR (relecture réelle d'une séquence, pas seulement un statut "en ligne")
- [ ] Détection de mouvement déclenchée par un test réel (passage devant la caméra) et alerte reçue
- [ ] Accès distant testé si prévu pour ce projet

## RÉSULTAT ATTENDU

Un système complet, chaque caméra couvrant sa zone prévue avec une image exploitable de jour comme de nuit, enregistrant sur le NVR selon le calendrier configuré, et générant des alertes fonctionnelles.

## CHECKLIST DE FIN — les 18 étapes

- [ ] 1. Besoins déterminés (zones, conservation, accès)
- [ ] 2. Nombre de caméras recensé point par point
- [ ] 3. Type de caméra choisi zone par zone
- [ ] 4. Emplacements précis validés (hauteur, contre-jour, champ dégagé, accessibilité)
- [ ] 5. Objectifs choisis (fixe/varifocal, angle calculé)
- [ ] 6-8. Bande passante, stockage, PoE calculés (chapitre 34)
- [ ] 9. VLAN CCTV créé et vérifié
- [ ] 10. Switches PoE dédiés installés
- [ ] 11. Caméras installées, image vérifiée avant serrage final
- [ ] 12-17. Configuration complète (chapitres 35-37)
- [ ] 18. Chaque caméra testée individuellement selon la checklist ci-dessus

## Résumé du chapitre

Le déploiement d'un système de vidéosurveillance IP suit 18 étapes strictement ordonnées : des besoins et du recensement méthodique (jamais un chiffre rond) jusqu'au test individuel de chaque caméra, en passant par le choix zone par zone du type de caméra et de l'objectif, les calculs de dimensionnement (chapitre 34), la création du VLAN dédié, l'installation physique (image vérifiée avant fixation définitive) et la configuration complète (chapitres 35-37).

*Chapitre suivant : les calculs CCTV — bande passante, stockage et PoE, avec des exemples chiffrés à 10, 30, 50, 100 et 200 caméras.*
