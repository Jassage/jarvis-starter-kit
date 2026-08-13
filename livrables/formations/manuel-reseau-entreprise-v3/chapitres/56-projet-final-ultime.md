<div class="chapitre-titre-num">CHAPITRE 56</div>

# Projet final ultime — 500 employés, 3 bâtiments

## Objectifs pédagogiques

Le projet récapitulatif de ce manuel : combiner, dans un seul déploiement cohérent, l'intégralité des techniques apprises depuis le Volume 1 — étude, conception, calculs, architecture, matériel, budget, câblage, configuration, vidéosurveillance, serveurs, firewall, Wi-Fi, sécurité, tests, dépannage, documentation, recette et maintenance — dans cet ordre exact.

## Prérequis

L'intégralité de ce manuel.

## Le cahier des charges

**Client** : une entreprise de **500 employés**, répartie sur **3 bâtiments** d'un même campus. Infrastructure demandée : réseau informatique unifié, téléphonie IP, **100 caméras** de vidéosurveillance (intérieur et espaces extérieurs entre bâtiments), **20 bornes Wi-Fi** (corporate et invité), serveurs (fichiers, annuaire, applicatif, supervision), accès Internet avec **DMZ** pour un service public, VPN nomade pour les télétravailleurs, supervision centralisée, sauvegarde complète, et une sécurité robuste à chaque couche.

## Étape 1 — Étude

Reprendre intégralement la méthode du chapitre 9, appliquée aux **trois bâtiments séparément** (une étude de site par bâtiment, jamais une estimation globale approximative) — mesures, questionnaire client, emplacements de caméras et de bornes Wi-Fi, état des chemins de câbles inter-bâtiments existants (chapitre 54.2).

## Étape 2 — Conception

Passage des besoins à l'architecture selon la méthode du chapitre 10 : l'arbre de décision utilisateurs (500 → branche "plus de 250") et l'arbre de décision caméras (100 → seuil du VMS/SAN, chapitre 53.12-13) déterminent conjointement une architecture Core/Distribution/Access complète par bâtiment (chapitre 54), reliée en anneau de fibre.

## Étape 3 — Calculs

| Calcul | Méthode | Résultat |
|---|---|---|
| Bande passante CCTV | Chapitre 34.2 | 100 × 3 = 300 Mbit/s |
| Stockage CCTV (30 jours) | Chapitre 34.3 | ≈ 109,3 To (RAID 10, chapitre 53.13) |
| Budget PoE CCTV | Chapitre 34.4 | ≈ 1 080 W (réparti sur plusieurs switches PoE dédiés) |
| Bornes Wi-Fi | Chapitre 15.1 (couverture + capacité) | 20 bornes, réparties selon la surface de chaque bâtiment |
| Sous-réseaux utilisateurs par bâtiment | Chapitre 5 (VLSM) | Un bloc dédié par bâtiment (convention du chapitre 54.5) |

## Étape 4 — Architecture

Reprendre le schéma complet du chapitre 54.4 (anneau de fibre entre les trois cores de bâtiment), avec un cluster de firewalls en haute disponibilité (chapitre 53.10) positionné en frontière du bâtiment principal.

## Étape 5 — Choix du matériel

Nomenclature complète selon la méthode du chapitre 47, dimensionnée selon les critères des chapitres 13-16 pour chaque catégorie d'équipement — switches cœur/distribution/accès par bâtiment, cluster de deux firewalls, 20 bornes Wi-Fi, serveurs (dont un serveur VMS dédié et une baie SAN, chapitre 53.13), NVR/VMS, 100 caméras, UPS par local technique.

## Étape 6 — Budget

Devis complet selon les 8 postes du chapitre 50.1, appliqué à la nomenclature de l'étape 5 — un projet de cette ampleur voit le poste "Configuration" (Volumes 7-13, répété pour trois bâtiments et un cluster de firewalls) devenir comparable en durée au poste "Main-d'œuvre" d'installation physique, une réalité à refléter honnêtement dans le devis remis au client plutôt que sous-estimée pour paraître plus compétitif.

## Étape 7 — Câblage

Méthode complète du chapitre 17, appliquée bâtiment par bâtiment, avec les liaisons inter-bâtiments en fibre certifiée (chapitre 17.12) formant l'anneau de l'étape 4. Les caméras extérieures entre bâtiments suivent la règle du chapitre 54.13 (fibre au-delà de 90 m, IP66 minimum).

## Étape 8 — Configuration

Reprendre à l'identique, bâtiment par bâtiment, l'ensemble des chapitres 19-27 (switches, routage OSPF inter-bâtiments selon la méthode du chapitre 54.5, VRRP au sein de chaque bâtiment si une redondance locale de cœur est également retenue).

## Étape 9 — CCTV

Architecture VMS + SAN selon la méthode complète du chapitre 53.13, avec la configuration individuelle de chaque caméra selon le chapitre 35 et la procédure complète en 18 étapes du chapitre 33 appliquée à chacune des 100 caméras, sans exception ni raccourci.

## Étape 10 — Serveurs

Windows Server (chapitre 31) et Ubuntu Server (chapitre 32) selon les rôles nécessaires, plus le serveur VMS dédié (chapitre 53.13) — une architecture éventuellement virtualisée sur un hyperviseur (méthode de dimensionnement du chapitre 16.6) pour mutualiser le matériel physique entre plusieurs rôles serveur.

## Étape 11 — Firewall

Cluster haute disponibilité selon la méthode complète du chapitre 53.10, avec DMZ (chapitre 52.10) pour le service public demandé, VPN nomade (chapitre 29.2) pour les télétravailleurs, et l'ensemble des règles de sécurité par VLAN selon la méthode du chapitre 28.

## Étape 12 — Wi-Fi

20 bornes selon la méthode du chapitre 30, contrôleur unique pour l'ensemble du campus garantissant un roaming cohérent entre bâtiments (chapitre 54.11).

## Étape 13 — Sécurité

Audit de sécurité consolidé complet selon le tableau du chapitre 40 — appliqué et vérifié sur l'intégralité des équipements des trois bâtiments, sans exception : mots de passe, SSH, VLAN natif, ACL, Port Security, DHCP Snooping, MFA sur les comptes à privilège élevé, mises à jour planifiées, journalisation centralisée, NTP cohérent, comptes individuels, moindre privilège.

## Étape 14 — Tests

Matrice de tests complète selon le modèle du chapitre 48.3, enrichie des tests spécifiques à ce projet : bascule de l'anneau de fibre (chapitre 54.17), bascule du cluster de firewalls (chapitre 53.14), isolation DMZ (chapitre 52.10), et l'ensemble des 15 tests de base déjà illustrés au chapitre 48.

## Étape 15 — Dépannage

L'équipe technique amenée à exploiter ce réseau dispose de l'intégralité du Volume 14 (50 scénarios) comme référence directe — aucune procédure de dépannage supplémentaire à inventer, chaque panne possible sur ce projet trouvant sa méthode dans les chapitres 41 à 46.

## Étape 16 — Documentation

Dossier complet selon le chapitre 49.1, avec un schéma consolidé du campus (trois bâtiments et leur anneau de fibre) en complément des schémas par bâtiment — la même exigence que le Projet 5 (chapitre 55.17) appliquée ici à des bâtiments plutôt qu'à des sites distants.

## Étape 17 — Recette

Rapport de recette signé selon le modèle du chapitre 48.4, sur la base de la matrice de tests complète de l'étape 14 — aucune réserve non corrigée ne doit rester ouverte à la signature (chapitre 48.3, encadré d'attention).

## Étape 18 — Maintenance

Calendrier complet du chapitre 49.2, avec un registre de maintenance distinct par bâtiment pour les contrôles physiques (câbles, température, UPS) et un registre unique pour les contrôles logiques centralisés (supervision, sauvegardes, sécurité) qui couvrent naturellement l'ensemble du campus depuis un seul outil (chapitre 38).

## Les 14 livrables finaux du projet

Conformément à la structure de livraison standard de ce manuel, le dossier remis au client à l'issue de ce projet (et de chacun des six projets du Volume 16) contient :

```
01_Cahier_des_charges
02_Etude_de_site
03_Architecture
04_Plan_IP
05_Plan_VLAN
06_Plan_Cablage
07_Plan_Ports
08_Nomenclature
09_Configurations
10_Procedures
11_Tests
12_Recette
13_Documentation
14_Maintenance
```

## Résumé du chapitre

Ce projet final ne construit rien de fondamentalement nouveau — il démontre que les dix-huit étapes d'un projet réseau professionnel, dans leur ordre exact, s'enchaînent naturellement dès lors que chaque décision (architecture, matériel, sécurité) s'appuie sur les méthodes et les arbres de décision déjà maîtrisés depuis le premier chapitre de ce manuel. Un technicien qui a suivi l'intégralité de ce manuel, volume après volume, est désormais en mesure de prendre le cahier des charges d'une entreprise réelle et de livrer, de A à Z, exactement ce projet.

*Fin du Volume 16. Chapitre suivant : la référence rapide — commandes, calculs et checklists, en un seul chapitre final.*
