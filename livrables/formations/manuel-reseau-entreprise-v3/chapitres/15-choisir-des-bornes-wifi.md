<div class="chapitre-titre-num">CHAPITRE 15</div>

# Comment choisir des bornes Wi-Fi

## Objectifs pédagogiques

Calculer le nombre de bornes Wi-Fi nécessaires selon deux méthodes complémentaires (couverture et capacité), choisir la norme et la bande de fréquence adaptées, et savoir quand un contrôleur Wi-Fi dédié devient nécessaire. Ce chapitre donne la méthode de **dimensionnement matériel** ; l'étude de couverture RF complète et la configuration sont couvertes au Volume 10 (chapitre 30).

## Prérequis

Chapitres 2, 13.

## 15.1 Deux méthodes de calcul, jamais une seule

Un nombre de bornes Wi-Fi mal calculé résulte presque toujours d'un dimensionnement basé sur **un seul** des deux critères suivants, alors que les deux doivent être calculés séparément — le nombre de bornes retenu est toujours **le plus élevé des deux résultats**.

### Méthode 1 — par couverture (surface)

**Formule** : `Nombre de bornes = Surface totale à couvrir ÷ Surface couverte par une borne`

Une borne d'intérieur standard couvre, en environnement de bureau normal (cloisons légères), environ **150 à 250 m²** — cette portée diminue fortement selon les matériaux traversés (un mur en béton armé peut réduire la portée effective de moitié, un plancher en béton entre étages atténue encore davantage).

### Méthode 2 — par capacité (nombre d'utilisateurs)

**Formule** : `Nombre de bornes = Nombre d'appareils Wi-Fi simultanés ÷ Capacité recommandée par borne`

Une borne professionnelle moderne supporte techniquement plusieurs dizaines d'associations simultanées, mais la **capacité recommandée** pour un usage confortable (vidéoconférence, applications métier réactives) reste bien plus basse — généralement **25 à 35 appareils actifs simultanés** par borne en usage bureautique dense.

<div class="encadre astuce">
<span class="encadre-titre">💡 Exemple concret : les deux méthodes donnent rarement le même résultat</span>
Un plateau ouvert de 800 m² avec 90 employés (chacun avec en moyenne 1,5 appareil Wi-Fi actif, soit 135 appareils) donne : Méthode 1 → 800 ÷ 200 = **4 bornes** (couverture) ; Méthode 2 → 135 ÷ 30 = **4,5 bornes**, arrondi à **5 bornes** (capacité). Le nombre retenu est le plus élevé des deux : **5 bornes**, garantissant à la fois la couverture physique et un nombre d'appareils par borne raisonnable.
</div>

## 15.2 Norme Wi-Fi : lequel choisir

| Norme | Nom marketing | Bande(s) | Cas d'usage recommandé dans ce manuel |
|---|---|---|---|
| 802.11ac | Wi-Fi 5 | 5 GHz uniquement | Budget très contraint, faible densité d'appareils — de moins en moins recommandé pour un nouveau projet |
| 802.11ax | Wi-Fi 6 | 2,4 GHz + 5 GHz | Standard recommandé par défaut pour tout nouveau projet de ce manuel — meilleure gestion de la densité (OFDMA), meilleure efficacité énergétique des appareils clients |
| 802.11ax | Wi-Fi 6E | 2,4 GHz + 5 GHz + 6 GHz | Recommandé sur un projet à très forte densité d'appareils (Volume 16, Projets 3-6) où la bande 6 GHz, encore peu encombrée, offre un vrai gain de capacité |

## 15.3 Les bandes de fréquence : portée contre débit

- **2,4 GHz** : portée la plus longue, traverse mieux les obstacles, mais bande plus étroite, plus encombrée (partagée avec de nombreux appareils domestiques) et débit maximal plus faible.
- **5 GHz** : portée plus courte, débit nettement supérieur, moins d'interférences dans la plupart des environnements professionnels — la bande privilégiée pour l'essentiel du trafic dans ce manuel.
- **6 GHz** (Wi-Fi 6E uniquement) : portée la plus courte des trois, mais bande la plus large et la moins encombrée, idéale en environnement très dense.

## 15.4 PoE requis

Le budget PoE de chaque borne dépend du nombre de radios actives et du nombre de flux MIMO — se référer à la méthode de calcul du chapitre 13.3-13.4 pour intégrer les bornes prévues dans le budget PoE total du switch qui les alimentera.

## 15.5 Nombre de SSID et mappage vers les VLAN

**Méthode** : chaque réseau Wi-Fi diffusé (SSID) doit correspondre à **exactement un** VLAN du plan IP (chapitre 11) — jamais un SSID unique partagé entre plusieurs usages qui devraient être isolés. Un projet type de ce manuel diffuse au minimum deux SSID : "Wi-Fi Corporate" (VLAN 50) et "Wi-Fi Invité" (VLAN 60) — la configuration complète de ce mappage est couverte au chapitre 30.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Vérifier le nombre maximal de SSID simultanés supportés par la borne</span>
Chaque SSID supplémentaire diffusé par une borne consomme de la capacité radio (temps d'antenne partagé) même sans trafic actif dessus — les fiches techniques indiquent un maximum de SSID simultanés (souvent 8 à 16 selon la gamme) : ne jamais en approcher la limite inutilement, et documenter le nombre de SSID réellement nécessaires dès la phase de conception plutôt que d'en ajouter au fil de l'eau.
</div>

## 15.6 Contrôleur Wi-Fi : dédié, cloud, ou intégré ?

| Type de gestion | Fonctionnement | Cas d'usage recommandé |
|---|---|---|
| **Autonome** (chaque AP configuré individuellement) | Aucune vue centralisée, configuration répétée sur chaque borne | Jamais recommandé au-delà de 2-3 bornes dans ce manuel — perte de temps et incohérences de configuration garanties |
| **Contrôleur matériel dédié** | Boîtier physique sur site qui gère toutes les bornes | Projets sans connexion Internet fiable en permanence, ou politique de données strictement on-premise |
| **Contrôleur logiciel** (VM ou petit boîtier léger sur site) | Logiciel de gestion centralisée hébergé localement | Le choix par défaut de ce manuel pour la majorité des projets (Volume 16) |
| **Cloud-managed** | Gestion via une interface web hébergée par le fabricant | Multi-sites (Volume 16, Projet 5), pratique pour une supervision centralisée à distance sans matériel de contrôleur local, au prix d'une dépendance à la connectivité Internet et au fournisseur |

## 15.7 Débit annoncé et débit réel

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le débit "AX3000" ou "AC1900" d'une fiche technique n'est jamais le débit d'un seul appareil client</span>
Ces chiffres marketing additionnent le débit théorique maximal de **toutes** les bandes de fréquence combinées (2,4 GHz + 5 GHz, parfois + 6 GHz), dans des conditions de laboratoire idéales — jamais le débit réel qu'obtiendra un seul appareil connecté dans des conditions réelles de bureau. Dimensionner un projet sur ces chiffres bruts, plutôt que sur les méthodes de calcul des sections 15.1-15.2, est une erreur fréquente de débutant.
</div>

## 15.8 Intérieur ou extérieur : l'indice de protection (IP)

Toute borne installée à l'extérieur ou dans un environnement humide/poussiéreux (entrepôt, parking couvert) doit afficher un **indice de protection** adapté (IP65 ou supérieur, résistant à la poussière et aux jets d'eau) — une borne d'intérieur standard installée dehors se dégrade rapidement et perd sa garantie.

## 15.9 Laboratoire — dimensionner le Wi-Fi d'un projet

Un espace de coworking de 600 m² accueille jusqu'à 80 personnes simultanément, chacune avec en moyenne 2 appareils Wi-Fi actifs (ordinateur + smartphone). Calcule le nombre de bornes nécessaire par la méthode de couverture (200 m²/borne) puis par la méthode de capacité (30 appareils/borne), et détermine le nombre final à retenir.

**Corrigé :** Couverture : 600 ÷ 200 = 3 bornes. Capacité : (80 × 2) ÷ 30 = 160 ÷ 30 ≈ 5,3, arrondi à 6 bornes. Le nombre retenu est le plus élevé des deux : **6 bornes**.

## Résumé du chapitre

Le nombre de bornes Wi-Fi se calcule par deux méthodes indépendantes (couverture en m², capacité en appareils simultanés) et le résultat retenu est toujours le plus élevé des deux. Le Wi-Fi 6 est le standard recommandé par défaut, le Wi-Fi 6E pour les environnements très denses. Chaque SSID diffusé doit correspondre à exactement un VLAN. Un contrôleur (logiciel local par défaut, cloud pour le multi-sites) devient indispensable au-delà de quelques bornes. Les débits marketing additionnent toutes les bandes et ne reflètent jamais le débit réel d'un seul appareil.

*Chapitre suivant : comment choisir des caméras et des serveurs, avec les premiers arbres de décision matériels appliqués concrètement.*
