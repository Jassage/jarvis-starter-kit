<div class="chapitre-titre-num">CHAPITRE 50</div>

# Devis et budgétisation

## Objectifs pédagogiques

Apprendre la méthode professionnelle de calcul d'un devis réseau complet, poste par poste, et disposer d'un modèle réutilisable directement applicable à un vrai projet.

## Prérequis

Volumes 1-14, chapitres 47-49.

## 50.1 Les huit postes d'un devis complet

```
Devis total = Materiel
            + Cablage
            + Main-d'oeuvre
            + Configuration
            + Transport
            + Tests
            + Documentation
            + Maintenance (premiere annee ou contrat recurrent)
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un devis qui ne détaille que "Matériel" est un devis incomplet</span>
Un devis limité au seul coût du matériel omet systématiquement la majorité du travail réel d'un projet professionnel — la conception (Volumes 3-4), l'installation physique (Volume 6), la configuration (Volumes 7-13), les tests (chapitre 48) et la documentation (chapitre 49) représentent souvent, ensemble, une part du coût total aussi importante que le matériel lui-même sur un projet de taille moyenne à grande. Ne jamais sous-évaluer ces postes pour paraître compétitif sur un premier chiffre : le déséquilibre se paie soit par une marge négative pour l'intégrateur, soit par une qualité de livraison dégradée pour rester dans le budget annoncé.
</div>

## 50.2 Détail de chaque poste

**Matériel** : reprendre directement la nomenclature du chapitre 47, quantité par quantité, au prix fournisseur réel du moment (jamais un prix mémorisé d'un projet antérieur, les tarifs matériel évoluant constamment).

**Câblage** : longueur totale estimée de câble (chapitre 17.3), nombre de prises, patch panels, keystones, goulottes — chiffré séparément du matériel actif, car souvent sous-traité ou acheté à un fournisseur différent.

**Main-d'œuvre** : temps d'installation physique estimé (Volume 6), en heures ou en jours-homme, multiplié par le taux horaire/journalier de l'intégrateur — inclut le tirage de câbles, le montage de la baie, l'installation des caméras et bornes Wi-Fi.

**Configuration** : temps estimé pour l'ensemble des Volumes 7 à 13 (switches, routage, firewall, Wi-Fi, serveurs, vidéosurveillance, supervision) — souvent sous-estimé par un devis de débutant, alors qu'il représente fréquemment plus de temps que l'installation physique elle-même sur un projet avec beaucoup de VLAN et de règles de sécurité.

**Transport** : déplacement de l'équipe et du matériel, à chiffrer réellement (distance, nombre de trajets nécessaires) plutôt qu'une estimation vague.

**Tests** : temps dédié à la matrice de tests complète et à la recette (chapitre 48) — une étape à part entière, jamais "incluse gratuitement" dans la configuration.

**Documentation** : temps de rédaction du dossier complet (chapitre 49) — également une étape à part entière, souvent la première sacrifiée sous la pression d'un délai, au détriment du client qui en aura besoin des mois ou des années plus tard.

**Maintenance** : soit un forfait de première année inclus dans le devis initial, soit un contrat récurrent séparé (50.4) — jamais implicite ou laissé dans le flou vis-à-vis du client.

## 50.3 Modèle de devis — matériel (extrait)

| Référence (chapitre 47) | Désignation | Quantité | Prix unitaire | Total |
|---|---|---|---|---|
| SW-01 | Switch d'accès 24 ports PoE+ | 1 | *à compléter* | |
| SW-COEUR-01/02 | Switch cœur L3 10G | 2 | *à compléter* | |
| FW-01 | Firewall UTM | 1 | *à compléter* | |
| AP-01 à AP-05 | Borne Wi-Fi 6 | 5 | *à compléter* | |
| SRV-01/02/03 | Serveur rack 1U | 3 | *à compléter* | |
| NVR-01 | NVR 32 canaux | 1 | *à compléter* | |
| CAM-01 à CAM-21 | Caméra IP 4 MP | 21 | *à compléter* | |
| UPS-01 | Onduleur rack | 1 | *à compléter* | |
| **Sous-total Matériel** | | | | **∑** |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce manuel ne fournit jamais de prix chiffrés</span>
Les prix du matériel réseau évoluent en permanence, varient énormément selon le pays, le fournisseur et le taux de change du moment — tout prix figé dans un manuel de formation serait obsolète, voire trompeur, dès sa publication. Le modèle ci-dessus donne la **structure exacte** à suivre ; les montants réels doivent toujours provenir d'une consultation fournisseur actualisée au moment de chaque devis.
</div>

## 50.4 Modèle de contrat de maintenance récurrente

Reprendre le calendrier de maintenance du chapitre 49.2 comme base de négociation commerciale :

```
CONTRAT DE MAINTENANCE — [Nom du projet]

Perimetre couvert : [liste des equipements de la nomenclature, chapitre 47]

Frequence des interventions preventives : selon calendrier du chapitre 49.2
Delai d'intervention garanti en cas de panne critique : ___ heures
Delai d'intervention garanti en cas de panne non critique : ___ heures
Inclus dans le contrat : [supervision continue, chapitre 38 / tests de restauration trimestriels, chapitre 39.6 / ...]
Exclus du contrat (a chiffrer separement) : [remplacement materiel, extension du reseau, ...]

Tarif : ___ / mois ou ___ / an
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un contrat de maintenance vend la tranquillité, pas seulement des heures d'intervention</span>
La valeur réelle d'un contrat de maintenance pour le client n'est pas le nombre d'heures qu'il achète, mais la certitude qu'une supervision active (chapitre 38) détectera un problème avant qu'il ne devienne critique, et qu'une équipe compétente interviendra dans un délai garanti — un argument commercial à mettre en avant explicitement, pas seulement une liste de tâches techniques.
</div>

## Résumé du chapitre

Un devis complet chiffre huit postes distincts (matériel, câblage, main-d'œuvre, configuration, transport, tests, documentation, maintenance) — jamais uniquement le matériel, qui sous-estimerait systématiquement le travail réel de conception, configuration, test et documentation. Le modèle de devis reprend la nomenclature du chapitre 47 poste par poste, avec des prix toujours actualisés au moment de la consultation fournisseur, jamais figés. Le contrat de maintenance récurrent reprend le calendrier du chapitre 49.2 comme base, avec des délais d'intervention garantis clairement définis.

*Fin du Volume 15. Chapitre suivant : le Projet 1 — petite entreprise, 30 employés, premier des six projets complets du Volume 16, appliquant l'intégralité de ce manuel de A à Z.*
