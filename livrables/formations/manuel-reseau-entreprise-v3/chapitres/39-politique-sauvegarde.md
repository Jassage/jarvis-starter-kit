<div class="chapitre-titre-num">CHAPITRE 39</div>

# Politique de sauvegarde

## Objectifs pédagogiques

Consolider, en une politique de sauvegarde complète et documentée, l'ensemble des mécanismes techniques déjà mis en place chapitre après chapitre — et surtout, mettre en œuvre une procédure réelle de **test de restauration**, la seule façon de savoir si une sauvegarde fonctionne réellement avant d'en avoir besoin dans l'urgence.

## Prérequis

Volumes 1-13.

## OBJECTIF

Aucune donnée du projet (configuration réseau, données serveur, séquences vidéo critiques) ne peut être perdue de façon irréversible, et chaque type de sauvegarde a été **testé en restauration réelle** au moins une fois avant la mise en production.

## 39.1 Quoi sauvegarder

| Catégorie | Contenu | Chapitre de configuration technique |
|---|---|---|
| Configuration réseau | Switches, routeur/firewall | 24 (locale + externe TFTP), 25, 28 |
| Serveurs Windows | Système, Active Directory, fichiers partagés | 31 (Windows Server Backup) |
| Serveurs Linux | Configuration, sites web, données applicatives | 32 (cron + tar) |
| Vidéosurveillance | Séquences critiques (entrées, zones à haute valeur de preuve) | 36 (export automatique) |
| Supervision | Historique Zabbix | 38 |
| Documents de projet | Plans, rapports, contrats, identifiants | Chapitre 49 |

## 39.2 Où sauvegarder : la règle 3-2-1

<div class="encadre astuce">
<span class="encadre-titre">💡 La règle 3-2-1, standard de l'industrie</span>
**3** copies au total de chaque donnée critique (l'original + 2 sauvegardes), sur **2** supports de nature différente (par exemple, un disque local du serveur + un NAS/serveur de sauvegarde dédié — jamais deux copies sur le même type de support qui partagerait le même mode de panne), dont **1** copie conservée hors site (physiquement ailleurs que le local technique principal — un incendie, un vol ou une inondation du local technique ne doit jamais pouvoir détruire à la fois l'original et toutes ses sauvegardes en même temps).
</div>

Sur les projets de ce manuel, l'application concrète de cette règle : (1) l'original sur chaque équipement/serveur, (2) une copie sur un serveur de sauvegarde dédié dans le même local technique, (3) une copie hors site (stockage cloud chiffré, ou support physique alterné transporté régulièrement hors site — solution à documenter précisément selon le budget et les contraintes réelles du client).

## 39.3 Quand sauvegarder

| Type de donnée | Fréquence |
|---|---|
| Configuration réseau | Après **chaque** changement de configuration (déjà pratiqué systématiquement à la fin de chaque chapitre de configuration de ce manuel) + une sauvegarde automatique hebdomadaire de sécurité |
| Serveurs (système et fichiers) | Quotidienne (nuit, heures creuses) |
| Vidéosurveillance critique | Quotidienne (export automatique, chapitre 36) |
| Base de supervision | Hebdomadaire |
| Documents de projet | À chaque modification significative |

## 39.4 Combien de temps conserver (rétention)

| Type de donnée | Rétention recommandée |
|---|---|
| Configuration réseau | Les 10 dernières versions conservées, jamais une seule écrasée à chaque sauvegarde |
| Serveurs — sauvegarde quotidienne | 30 jours glissants |
| Serveurs — sauvegarde mensuelle | 12 mois |
| Vidéosurveillance | Selon la réglementation locale applicable (chapitre 33, étape 1 — jamais supposée, toujours vérifiée) |
| Documents de projet | Durée du contrat client + une période de conservation légale applicable |

## 39.5 Comment restaurer : deux procédures de référence

### Restaurer un fichier depuis Windows Server Backup

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (SRV-01)</div>

```powershell
Get-WBBackupSet
Start-WBFileRecovery -BackupSet (Get-WBBackupSet)[0] -SourcePath "D:\Partages\Comptabilite" -TargetPath "D:\Restauration-Test" -Overwrite Never
```

**Explication** : `-Overwrite Never` restaure vers un dossier de test séparé plutôt que d'écraser directement les données en place — une précaution systématique pour toute restauration, qu'elle soit un test (39.6) ou une intervention réelle en urgence, jamais une restauration directe sans vérification préalable du contenu récupéré.

### Restaurer une configuration de switch

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS</div>

```
SW-ACCES-01# copy tftp://10.10.30.20/backup-SW-ACCES-01-2026.cfg startup-config
SW-ACCES-01# reload
```

## 39.6 Comment tester une restauration — la seule preuve qu'une sauvegarde fonctionne

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une sauvegarde jamais testée n'est qu'une hypothèse, jamais une garantie</span>
De nombreux incidents graves, dans l'industrie entière, ne viennent pas de l'absence de sauvegarde, mais d'une sauvegarde qui existait bel et bien... et s'est révélée corrompue, incomplète ou inutilisable **au moment précis où elle devenait nécessaire**. La seule façon de savoir qu'une sauvegarde fonctionne réellement est de la restaurer **réellement**, avant d'en avoir un besoin urgent — jamais après.
</div>

### Procédure de test trimestriel

1. Sélectionner aléatoirement un type de sauvegarde parmi ceux du tableau 39.1 (rotation sur les 4 trimestres de l'année, pour tester chaque type au moins une fois par an).
2. Restaurer réellement (procédures 39.5) vers un emplacement de test isolé, **jamais** en production directe.
3. Vérifier l'intégrité du contenu restauré : un fichier s'ouvre-t-il correctement, une configuration réseau restaurée produit-elle exactement le comportement attendu, une séquence vidéo exportée se relit-elle sans corruption ?
4. Documenter le résultat du test (réussi/échoué, durée de la restauration — une donnée précieuse pour estimer le temps de récupération réel en cas d'incident) dans le registre de maintenance (chapitre 43).
5. Si le test échoue, corriger immédiatement la procédure de sauvegarde en cause — jamais reporté "à la prochaine fois".

## VÉRIFICATION

Le registre de maintenance (chapitre 43) doit toujours pouvoir répondre, sans délai, à la question : "quand a été testée pour la dernière fois, avec succès, la restauration de chaque type de sauvegarde du tableau 39.1 ?"

## CHECKLIST DE FIN

- [ ] Chaque catégorie de donnée du tableau 39.1 a une sauvegarde technique configurée
- [ ] La règle 3-2-1 est appliquée (support différent + copie hors site)
- [ ] Fréquence et rétention documentées et appliquées par type de donnée
- [ ] Au moins un test de restauration réel effectué pour chaque type de sauvegarde avant la mise en production
- [ ] Un calendrier de test trimestriel est planifié pour la suite de l'exploitation

## Résumé du chapitre

La politique de sauvegarde consolide ce qui a déjà été configuré chapitre par chapitre (réseau, serveurs, vidéosurveillance, supervision) selon la règle 3-2-1 (3 copies, 2 supports, 1 hors site), avec une fréquence et une rétention adaptées à chaque type de donnée. Le point le plus souvent négligé — et le plus important — reste le test de restauration réel, périodique et documenté : une sauvegarde jamais restaurée réellement n'offre aucune garantie tant qu'elle n'a pas été prouvée fonctionnelle.

*Chapitre suivant : la cybersécurité d'entreprise — la configuration de base sécurisée consolidée, chapitre de référence vers lequel pointent toutes les décisions de sécurité prises depuis le début de ce manuel.*
