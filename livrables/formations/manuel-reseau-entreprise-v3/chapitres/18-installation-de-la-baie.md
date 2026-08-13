<div class="chapitre-titre-num">CHAPITRE 18</div>

# Installation de la baie informatique

## Objectifs pédagogiques

Installer physiquement une baie complète, du rack vide jusqu'à tous les équipements montés, mis à la terre, alimentés et câblés proprement — dans un ordre qui évite d'avoir à tout redémonter pour corriger une étape oubliée.

## Prérequis

Chapitres 9, 17.

## OBJECTIF

Livrer un local technique opérationnel : rack correctement positionné et mis à la terre, alimentation électrique protégée (PDU + UPS), tous les équipements actifs montés dans un ordre logique, câblage brassé et organisé, ventilation vérifiée.

## PRÉREQUIS

Local technique validé lors de l'étude de site (chapitre 9 — alimentation électrique, climatisation, sécurité physique), câblage horizontal tiré et certifié (chapitre 17).

## MATÉRIEL NÉCESSAIRE

- Rack 19 pouces (hauteur en U dimensionnée selon le plan de baie, 18.2) ;
- kit de fixation (vis, écrous cage, rails) ;
- PDU (bandeau électrique de baie) ;
- onduleur (UPS) dimensionné selon la charge (18.5) ;
- panneaux passe-câbles horizontaux et verticaux ;
- kit de mise à la terre du rack ;
- cordons de brassage courts (chapitre 17.11) ;
- étiqueteuse.

## TOPOLOGIE

Organisation verticale en unités de rack (U), du haut vers le bas — voir le plan de baie complet en 18.10.

## 18.1 Étape 1 — Vérifier le local avant tout montage

Reprendre la validation faite lors de l'étude de site (chapitre 9) : alimentation électrique dédiée disponible, climatisation/ventilation fonctionnelle, porte verrouillable, absence de risque d'inondation. Ne jamais commencer le montage physique d'une baie dans un local dont ces points n'ont pas été confirmés.

## 18.2 Étape 2 — Positionner et fixer le rack

Laisser un espace libre à l'arrière du rack (au moins 60 cm recommandés) pour l'accès au câblage et pour la circulation de l'air (18.9) ; sur un rack de plus de quelques unités chargées, ancrer le rack au sol pour éviter tout risque de basculement.

## 18.3 Étape 3 — Installer la mise à la terre du rack

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un rack non mis à la terre est un risque de sécurité électrique, pas un détail optionnel</span>
Chaque élément métallique du rack doit être relié électriquement à la terre du bâtiment (bonding), au moyen du kit de mise à la terre dédié — cette étape protège à la fois les personnes (évacuation d'un défaut électrique) et les équipements (évacuation des charges électrostatiques et réduction des interférences). Elle doit être réalisée **avant** l'installation de tout équipement actif dans le rack, jamais ajoutée après coup "si le temps le permet".
</div>

## 18.4 Étape 4 — Installer le PDU

Le PDU (bandeau électrique de baie) se monte généralement à la verticale sur l'un des montants arrière du rack (économe en espace en U) ou horizontalement en bas de baie sur un petit projet. Prévoir un nombre de prises suffisant pour tous les équipements prévus, **avec marge** (même logique de marge de croissance que le chapitre 8).

## 18.5 Étape 5 — Installer l'onduleur (UPS)

**Méthode de dimensionnement** : additionner la puissance consommée (en watts) de tous les équipements prévus dans la baie, avec une marge de sécurité (généralement 25 à 30 %), puis choisir un UPS dont la puissance nominale couvre ce total, avec une autonomie adaptée au besoin du client (le temps nécessaire pour un arrêt propre des serveurs, ou pour basculer sur un groupe électrogène si le site en dispose). L'UPS, souvent lourd, se monte généralement en bas de baie pour abaisser le centre de gravité du rack (déjà anticipé dans le plan du chapitre 3.5).

## 18.6 Étape 6 — Installer les patch panels

Monter les patch panels dans la partie supérieure de la baie, à proximité du point d'arrivée du câblage horizontal (chapitre 17), avec un panneau passe-câbles immédiatement en dessous pour guider proprement les cordons de brassage vers les équipements actifs installés ensuite.

## 18.7 Étape 7 — Installer les équipements actifs, dans l'ordre logique

1. **Switch(es)** — juste en dessous des patch panels, pour des cordons de brassage courts (chapitre 17.11) ;
2. **Firewall** ;
3. **Routeur** (si distinct du firewall, chapitre 14.1) ;
4. **Serveur(s)** — plus bas, plus lourds ;
5. **NVR** — avec les serveurs, généralement proche d'une sortie vidéo de contrôle si un écran de supervision est prévu sur site.

## 18.8 Étape 8 — Brasser et organiser les câbles

Reprendre le brassage du chapitre 17.11 (cordons courts, patch panel vers switch), puis organiser soigneusement chaque câble avec les panneaux passe-câbles et des attaches velcro (jamais de collier rigide, même règle qu'au chapitre 17.5) — un câblage de baie propre et organisé n'est pas une question d'esthétique : il facilite considérablement toute intervention future et réduit le risque de débrancher accidentellement le mauvais câble.

## 18.9 Étape 9 — Vérifier le sens de la ventilation

<div class="encadre astuce">
<span class="encadre-titre">💡 Vérifier que tous les équipements soufflent dans le même sens</span>
La quasi-totalité des équipements rack modernes aspirent l'air par une face et le rejettent par l'autre, presque toujours de l'avant vers l'arrière — mélanger dans une même baie un équipement qui aspire à l'arrière avec des équipements qui aspirent à l'avant crée des zones de recirculation d'air chaud, dégradant le refroidissement de l'ensemble malgré une climatisation de local par ailleurs correcte. Vérifier ce sens sur la fiche technique de chaque équipement **avant** l'achat, pas seulement à l'installation.
</div>

## 18.10 Étape 10 — Documenter le plan de baie final

Produire (ou compléter) le plan de baie du projet, sur le modèle du chapitre 3.5, avec l'affectation réelle de chaque U :

```{.uml}
PLAN DE BAIE FINAL (exemple, projet du chapitre 8)

 U20 ┌────────────────────────────────┐
     │ Panneau passe-cables            │
 U19 ├────────────────────────────────┤
     │ Patch panel 24 ports            │
 U18 ├────────────────────────────────┤
     │ Panneau passe-cables            │
 U17 ├────────────────────────────────┤
     │ Switch coeur                    │
 U16 ├────────────────────────────────┤
     │ Switch acces PoE etage 1        │
 U15 ├────────────────────────────────┤
     │ Switch acces PoE etage 2        │
 U14 ├────────────────────────────────┤
     │ Firewall                        │
 U13 ├────────────────────────────────┤
     │ Routeur / modem operateur       │
     ⋮              ⋮                  ⋮
  U6 ├────────────────────────────────┤
     │ Serveur rack (fichiers/appli)   │
  U4 ├────────────────────────────────┤
     │ NVR videosurveillance           │
  U2 ├────────────────────────────────┤
     │ Onduleur (UPS) rack             │
  U1 └────────────────────────────────┘
     │ PDU (bandeau electrique) - fond │
     └────────────────────────────────┘
```

## RÉSULTAT ATTENDU

Une baie entièrement montée, mise à la terre, alimentée via un PDU protégé par un UPS correctement dimensionné, avec tous les équipements sous tension, ventilés dans le même sens, câblés proprement et étiquetés, et un plan de baie à jour archivé dans le dossier de projet.

## VÉRIFICATION

Vérifier visuellement que chaque équipement affiche ses voyants d'état normaux (liens actifs, absence d'alerte), que le PDU indique une charge cohérente avec le total calculé (18.4), et que l'UPS indique un état "en ligne" sans alerte batterie.

## TEST

Après quelques heures de fonctionnement normal, mesurer la température à l'intérieur du local technique (un simple thermomètre suffit à ce stade) et la comparer à la plage de fonctionnement recommandée par les fabricants des équipements installés (généralement 18-27 °C).

## DÉPANNAGE

### Si la température du local dépasse la plage recommandée

Vérifier en priorité le sens de ventilation de chaque équipement (18.9) et l'absence d'obstruction à l'arrière du rack (espace de 60 cm, 18.2) avant de suspecter la climatisation elle-même — un scénario de dépannage détaillé au chapitre 45.

### Si l'UPS signale une alerte de surcharge

Revérifier le calcul de dimensionnement (18.5) : un équipement ajouté après le calcul initial (une caméra supplémentaire alimentant indirectement un besoin PoE plus élevé sur le switch, par exemple) peut faire dépasser la capacité prévue — ne jamais ignorer cette alerte en pensant qu'elle se résoudra d'elle-même.

## SAUVEGARDE

Le plan de baie final et les caractéristiques exactes du PDU/UPS installés (marque, modèle, puissance) sont conservés dans le dossier de projet et repris dans la documentation finale du client (chapitre 49).

## DOCUMENTATION

Photographier la baie terminée (vue d'ensemble et détail du câblage) pour la documentation finale — une référence visuelle précieuse pour toute intervention future, en complément du plan de baie écrit.

## CHECKLIST DE FIN

- [ ] Local technique revalidé (électricité, climatisation, sécurité) avant montage
- [ ] Rack positionné avec espace arrière suffisant, ancré si nécessaire
- [ ] Mise à la terre du rack réalisée avant tout équipement actif
- [ ] PDU installé avec marge de prises suffisante
- [ ] UPS dimensionné avec marge de 25-30 % sur la charge calculée
- [ ] Patch panels montés en haut de baie, proches de l'arrivée du câblage
- [ ] Équipements actifs montés dans l'ordre logique (switches → firewall/routeur → serveurs → NVR)
- [ ] Brassage réalisé avec des cordons courts, câblage organisé et étiqueté
- [ ] Sens de ventilation identique vérifié sur tous les équipements
- [ ] Plan de baie final documenté et archivé
- [ ] Photos de la baie terminée prises pour la documentation finale

## Résumé du chapitre

L'installation d'une baie suit un ordre strict : revalider le local, positionner et mettre à la terre le rack, installer le PDU puis l'UPS (dimensionné avec marge sur la charge totale calculée), monter les patch panels en haut de baie, installer les équipements actifs dans l'ordre logique (switches, firewall/routeur, serveurs, NVR), brasser et organiser proprement le câblage, vérifier la cohérence du sens de ventilation, puis documenter le plan de baie final.

*Fin du Volume 6. Chapitre suivant : le premier accès et la configuration de base d'un switch — le début du Volume 7.*
