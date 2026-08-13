<div class="chapitre-titre-num">CHAPITRE 49</div>

# Documentation finale du client et maintenance

## Objectifs pédagogiques

Produire le dossier de documentation finale complet remis au client, et établir un calendrier de maintenance préventive quotidien à annuel — la différence entre un projet qui vieillit bien et un projet qui accumule silencieusement des risques jusqu'à la prochaine panne évitable.

## Prérequis

Volumes 1-14, chapitres 47-48.

## 49.1 Le dossier de documentation finale

Chaque document listé ci-dessous a déjà été produit au fil de ce manuel — ce chapitre consolide, ne recrée rien :

| Document | Chapitre source |
|---|---|
| Schéma réseau (physique et logique) | 3.2-3.3, mis à jour au fil du projet |
| Plan IP complet | 11 |
| Plan VLAN d'accès | 3.7, 11 |
| Plan de câblage et plan de ports | 47 |
| Nomenclature matérielle | 47 |
| Inventaire des identifiants (comptes, mots de passe — dans un gestionnaire dédié, jamais en clair) | 19, 31, 35 |
| Configurations de chaque équipement (exportées) | 24, 25, 28, 30, 35 |
| Politique de sauvegarde et derniers résultats de test de restauration | 39 |
| Plan des caméras (emplacements, types, angles) | 33 |
| Plan Wi-Fi (couverture, SSID, VLAN associés) | 30 |
| Procédure de maintenance | 49.2 (ce chapitre) |
| Procédure de dépannage | 41-46 |
| Rapport de recette signé | 48.4 |
| Politique de sécurité complète | 29.1, 40 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Remettre le dossier sous une forme que le client peut réellement consulter</span>
Un dossier de documentation technique remis dans un format ou un jargon incompréhensible pour l'équipe du client (souvent non technicienne) n'est, dans les faits, jamais consulté — et perd alors une grande partie de son utilité en cas d'urgence future. Accompagner le dossier technique complet d'une **synthèse d'une page**, en langage simple, expliquant l'architecture générale et qui contacter en cas de problème, augmente considérablement les chances qu'il serve réellement le jour où il devient nécessaire.
</div>

## 49.2 Le calendrier de maintenance préventive

### Maintenance quotidienne

- Vérifier le tableau de bord de supervision (chapitre 38) — aucune alerte active non traitée.
- Confirmer que les sauvegardes planifiées de la nuit précédente se sont bien exécutées (chapitre 39).

### Maintenance hebdomadaire

- Relire les journaux de sécurité centralisés (chapitre 40.7) à la recherche d'anomalies non détectées par les alertes automatiques.
- Vérifier l'état des caméras (chapitre 36.9 — statut "En ligne" et "Enregistrement actif" pour l'ensemble du parc).

### Maintenance mensuelle

- Vérifier l'espace de stockage disponible sur chaque serveur et le NVR (anticiper le scénario 34/46 avant qu'il ne devienne critique).
- Vérifier la température du local technique et l'état de l'UPS (scénarios 36-37).
- Vérifier l'état physique des câbles accessibles (aucune dégradation visible, aucune modification non documentée du câblage).
- Générer et archiver le rapport de disponibilité mensuel de la supervision (chapitre 38.7).

### Maintenance trimestrielle

- Effectuer un test de restauration réel (chapitre 39.6, rotation sur les 4 trimestres).
- Auditer la configuration réelle de chaque caméra par rapport aux hypothèses du calcul de dimensionnement (chapitre 34, prévention du scénario 46).
- Revoir les règles firewall et la politique de sécurité (chapitre 29.1) pour confirmer qu'elles reflètent toujours les besoins réels du client.
- Vérifier les dates d'expiration des certificats (scénario 30).

### Maintenance annuelle

- Vérifier la disponibilité de mises à jour de firmware critiques (sécurité) pour chaque équipement réseau (switches, firewall, contrôleur Wi-Fi), planifiées et testées avant application (chapitre 40.5, jamais en production sans test).
- Revoir l'ensemble du plan IP (chapitre 11) et la marge de croissance restante par VLAN (chapitre 8) — un projet qui a grandi plus vite que prévu doit être détecté ici, pas au moment où une plage DHCP s'épuise (scénario 2).
- Revoir le dimensionnement PoE, UPS et climatisation de la baie (chapitres 13, 18) face à l'évolution réelle du parc d'équipements.
- Réviser l'ensemble de la documentation finale (49.1) pour refléter tout changement survenu durant l'année.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une maintenance non documentée équivaut, en pratique, à une maintenance non faite</span>
Un contrôle mensuel réalisé mais jamais consigné ne laisse aucune trace exploitable pour identifier une dégradation progressive (une température qui grimpe légèrement chaque mois, un espace disque qui se réduit d'année en année) — chaque contrôle de ce calendrier doit être noté dans un registre de maintenance daté, même quand son résultat est "rien à signaler".
</div>

## Résumé du chapitre

La documentation finale du client consolide, sans rien recréer, l'ensemble des documents déjà produits au fil de ce manuel — accompagnée d'une synthèse simple pour rester réellement consultable par une équipe non technique. Le calendrier de maintenance (quotidien à annuel) transforme la gestion du réseau d'une succession de pannes subies en une pratique préventive documentée, chaque contrôle étant consigné même lorsqu'il ne révèle rien d'anormal.

*Chapitre suivant : le devis et la budgétisation — la méthode de calcul complète et des modèles de devis réutilisables.*
