<div class="chapitre-titre-num">PARTIE I · CHAPITRE 5</div>

# Gestion des actifs informatiques et inventaire

## Rôle de la gestion des actifs

La gestion des actifs informatiques (IT Asset Management, ITAM) consiste à connaître à tout instant ce que l'organisation possède, où cela se trouve, qui en est responsable, et dans quel état de cycle de vie cela se situe. C'est un prérequis silencieux à presque toutes les autres disciplines de ce manuel : on ne peut pas sécuriser un serveur dont on ignore l'existence, planifier un renouvellement de licence qu'on ne sait pas expirer, ni évaluer l'impact d'un incident sans savoir quels systèmes en dépendent.

## Fonctionnement : le cycle de vie d'un actif

| Phase | Activités | Point de vigilance |
|---|---|---|
| Acquisition | Achat, réception, enregistrement initial dans l'inventaire | Enregistrer avant mise en service, pas après |
| Déploiement | Installation, configuration, affectation à un usage ou un utilisateur | Mettre à jour l'inventaire à chaque affectation |
| Exploitation | Utilisation courante, maintenance, mises à jour | Revue périodique de l'état réel vs. l'inventaire déclaré |
| Fin de vie | Retrait, décommissionnement, destruction sécurisée des données | Effacement sécurisé avant toute mise au rebut ou revente |

## Prérequis

- Un référentiel unique d'inventaire (feuille de calcul au minimum, outil ITAM/CMDB ensuite)
- Une convention de nommage cohérente pour tous les équipements (voir exemple Partie II, étiquetage réseau)
- Un processus d'entrée/sortie de matériel formalisé, même simple

## Mise en place d'un inventaire

1. **Réaliser un état des lieux physique** — Recenser tout le matériel existant : serveurs, postes, réseau, périphériques, licences.
2. **Choisir un référentiel de données** — Colonnes minimales : identifiant, type, modèle, numéro de série, localisation, responsable, date d'acquisition, statut.
3. **Étiqueter physiquement le matériel** — Étiquette avec identifiant unique correspondant à l'inventaire, sur chaque équipement significatif.
4. **Recenser les licences logicielles** — Éditeur, nombre de licences achetées, nombre utilisées, date d'expiration ou de renouvellement.
5. **Mettre en place une revue périodique** — Rapprochement trimestriel entre inventaire déclaré et réalité constatée sur le terrain.

## Modèle de fiche d'inventaire

| Champ | Exemple |
|---|---|
| Identifiant | SRV-OTELA-01 |
| Type | Serveur physique |
| Modèle / Référence | Dell PowerEdge R450 |
| Numéro de série | ABCD1234 |
| Localisation | Salle serveur, Rack A, U10-U12 |
| Responsable | Administrateur système |
| Date d'acquisition | 2026-01-15 |
| Statut | En production |
| Garantie jusqu'au | 2029-01-15 |
| Systèmes hébergés | Base de données OTELA, backend applicatif |

## Administration courante

- Mettre à jour l'inventaire à chaque mouvement de matériel (entrée, sortie, déplacement, remplacement)
- Suivre les échéances de garantie et de fin de support (Partie X, gestion des mises à jour)
- Réconcilier périodiquement l'inventaire déclaratif avec un scan réseau automatisé (voir outils ci-dessous)

## Outils d'inventaire et de découverte

| Outil | Type | Usage |
|---|---|---|
| GLPI | ITAM/CMDB open source complet | Inventaire, gestion de parc, tickets intégrés : bon point de départ PME |
| Snipe-IT | ITAM open source léger | Suivi de matériel et de licences, interface simple |
| Lansweeper / Nmap | Découverte réseau automatisée | Scan périodique pour détecter les équipements non déclarés (shadow IT) |
| NetBox | CMDB orientée infrastructure réseau | Documentation d'adressage IP, câblage, racks (complète Partie II) |

## Bonnes pratiques

<div class="encadre astuce">
<span class="encadre-titre">💡 À appliquer systématiquement</span>

- Enregistrer un actif dans l'inventaire avant sa mise en production, jamais après
- Associer systématiquement une criticité métier à chaque actif serveur (Chapitre 3)
- Effacer les données de façon sécurisée avant toute cession ou mise au rebut de matériel
- Croiser régulièrement inventaire déclaratif et scan réseau pour détecter le matériel non déclaré
</div>

## Erreurs courantes

<div class="encadre attention">
<span class="encadre-titre">⚠️ À éviter</span>

- Un inventaire tenu une seule fois puis jamais mis à jour, devenant rapidement obsolète
- Ignorer les licences logicielles dans l'inventaire, source fréquente de non-conformité (Partie X)
- Ne pas tracer le matériel personnel connecté au réseau de l'entreprise (BYOD non recensé)
- Mettre au rebut du matériel sans effacement sécurisé préalable des données
</div>

## Dépannage : réconcilier un inventaire dérivé

Lorsqu'un inventaire s'est visiblement éloigné de la réalité (matériel introuvable, équipements non recensés découverts par hasard), la correction se fait par un scan de découverte réseau complet, comparé ligne à ligne à l'inventaire déclaratif, plutôt que par une reconstruction manuelle à partir de la mémoire de l'équipe, systématiquement plus lente et moins fiable.

## Recommandations de sécurité

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le matériel non inventorié (shadow IT) est un angle mort de sécurité majeur : impossible d'appliquer une politique de correctifs, de durcissement ou de supervision à un système dont on ignore l'existence. Un scan de découverte réseau régulier fait partie intégrante d'une posture de sécurité de base, au même titre que la gestion des vulnérabilités (Partie XI).
</div>

## Cas pratique — Haitech Solutions

<div class="encadre cas-pratique">
<span class="encadre-titre">📌 Cas pratique</span>
Sur SHOPAY, une découverte fortuite en session a révélé qu'un serveur backend et un serveur frontend tournaient déjà en arrière-plan, zombies d'une session de travail antérieure jamais arrêtée : un exemple concret, quoique à petite échelle, de dérive entre ce qui est réellement déployé et ce qui est su ou documenté. À l'échelle d'une infrastructure de production comme celle visée par ce manuel, ce même phénomène (un service oublié, jamais inventorié, jamais surveillé) est précisément ce qu'un inventaire tenu à jour et un scan de découverte périodique permettent de prévenir avant qu'il ne devienne un incident de sécurité.
</div>

## Résumé du chapitre

- La gestion des actifs suit un cycle de vie en quatre phases : acquisition, déploiement, exploitation, fin de vie.
- Un actif doit être enregistré avant sa mise en production, jamais après coup.
- Un scan de découverte réseau périodique révèle les écarts entre inventaire déclaré et réalité (shadow IT).
- Le matériel non inventorié est un angle mort de sécurité, pas seulement un problème de gestion.

*Ceci conclut la Partie I. Partie suivante : fondamentaux réseau (modèle OSI, TCP/IP, IPv4, IPv6, VLAN, routage).*
