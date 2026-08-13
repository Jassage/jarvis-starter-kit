<div class="chapitre-titre-num">CHAPITRE 36</div>

# NVR et VMS

## Objectifs pédagogiques

Configurer entièrement le NVR du projet : stockage, ajout des caméras, calendrier d'enregistrement, utilisateurs et permissions, accès client distant sécurisé, sauvegarde et export vidéo pour investigation.

## Prérequis

Chapitre 35.

## OBJECTIF

Le NVR enregistre correctement les 21 caméras du projet selon un calendrier différencié, avec des comptes utilisateurs à permissions distinctes, un accès distant exclusivement via VPN, et une procédure d'export vidéo fiable.

## ÉTAPE 1 — Réseau et accès initial

Le NVR du projet fil rouge est déjà adressé statiquement à `10.10.80.5` (chapitre 11.2) — reprendre la méthode générale du chapitre 19 pour son premier accès (changement du mot de passe administrateur par défaut, règle absolue déjà posée au chapitre 35.1, applicable à l'identique sur le NVR lui-même).

## ÉTAPE 2 — Configurer le stockage (RAID)

<div class="ou-executer">INTERFACE DU NVR (locale ou web)</div>

```
Stockage → Configuration disques
  → Mode RAID : RAID 5 (ou RAID 10 selon le nombre de disques disponibles, chapitre 16.7)
  → Initialiser le volume
  → Capacite disponible confirmee ≥ 22,9 To (calcul du chapitre 34.6, marge de croissance incluse)
```

Reprendre la méthode de choix du niveau RAID du chapitre 16.7 — un NVR dédié à la vidéosurveillance privilégie généralement le RAID 5 (bon compromis capacité/tolérance de panne pour un flux d'écriture soutenu mais prévisible), le RAID 10 restant préférable si le nombre de caméras et donc le débit d'écriture simultané devient très élevé (chapitre 10.4, branche "plus de 100 caméras").

## ÉTAPE 3 — Ajouter les caméras

<div class="ou-executer">INTERFACE DU NVR</div>

```
Cameras → Recherche automatique (protocole ONVIF)
  → Le NVR liste les cameras detectees sur le VLAN 80
  → Selectionner chaque camera, saisir son identifiant/mot de passe (defini au chapitre 35.1)
  → Ajouter
```

<div class="encadre astuce">
<span class="encadre-titre">💡 ONVIF : le standard qui évite le verrouillage à un seul fabricant</span>
**ONVIF** (Open Network Video Interface Forum) est un standard ouvert d'interopérabilité entre caméras IP et systèmes NVR/VMS, supporté par la quasi-totalité des fabricants professionnels — il permet de mélanger des caméras de marques différentes sur un même NVR sans complication, et évite qu'un projet ne reste "prisonnier" d'un unique fabricant pour toute extension future. Une caméra non conforme ONVIF nécessite un ajout manuel par adresse IP et un pilote spécifique au fabricant, généralement plus limité en fonctionnalités.
</div>

## ÉTAPE 4 — Configurer le calendrier d'enregistrement

<div class="ou-executer">INTERFACE DU NVR</div>

```
Enregistrement → Calendrier → (par camera)
  → Cameras entrees/exterieur : Continu 24h/24, 7j/7
  → Cameras couloirs interieurs peu frequentes : Detection de mouvement uniquement
  → Enregistrer
```

**Explication** : un calendrier différencié par caméra optimise le stockage réellement consommé sans sacrifier la couverture des zones critiques — les entrées (valeur de preuve maximale) restent en enregistrement continu conformément à l'hypothèse prudente du calcul du chapitre 34, tandis qu'un couloir secondaire peu fréquenté peut légitimement passer en détection de mouvement uniquement, réduisant d'autant le volume réellement occupé par rapport au calcul théorique.

## ÉTAPE 5 — Tableau de bord de détection centralisé

<div class="ou-executer">INTERFACE DU NVR</div>

```
Evenements → Journal des detections
  → Verifier que chaque camera remonte bien ses evenements de detection (configures individuellement au chapitre 35, etape 6)
```

Le NVR agrège ici, en un point unique, les événements de détection de mouvement configurés caméra par caméra au chapitre précédent — jamais reconfiguré en double, seulement vérifié.

## ÉTAPE 6 — Créer les utilisateurs et leurs permissions

<div class="ou-executer">INTERFACE DU NVR</div>

```
Utilisateurs → Ajouter
  → Nom : responsable-securite
  → Role : Administrateur (configuration complete)
  → Enregistrer

Utilisateurs → Ajouter
  → Nom : agent-reception
  → Role : Operateur (consultation en direct uniquement, pas d'export ni de configuration)
  → Cameras visibles : entrees et accueil uniquement (pas l'ensemble du parc)
  → Enregistrer
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le principe du moindre privilège s'applique aussi au NVR</span>
Un agent d'accueil n'a besoin de voir en direct que les caméras de son propre poste (entrées, accueil), jamais l'intégralité du parc de caméras de l'entreprise (bureaux de direction, zones de stockage sensible) — restreindre explicitement les caméras visibles par rôle, exactement le même principe que le RBAC déjà appliqué partout ailleurs dans ce manuel (chapitre 40), évite qu'un accès de consultation basique ne devienne, de fait, un accès de surveillance généralisée non justifiée.
</div>

## ÉTAPE 7 — Accès client distant (jamais exposé directement sur Internet)

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais exposer directement le port du NVR sur Internet</span>
Une pratique malheureusement répandue (redirection de port NAT directe vers le NVR pour un accès "pratique" depuis un smartphone) expose l'interface d'authentification du NVR directement aux scans automatisés d'Internet — exactement le même risque déjà documenté pour les caméras elles-mêmes au chapitre 35.1, à une échelle encore plus grave puisqu'un NVR compromis donne accès à **l'ensemble** du parc de caméras d'un coup. Ce manuel n'expose **jamais** un NVR directement sur Internet : tout accès distant transite exclusivement par le VPN nomade (SSL-VPN, chapitre 29.2) déjà configuré sur FW-01, qui authentifie l'utilisateur **avant** même qu'il puisse atteindre l'interface du NVR.
</div>

## ÉTAPE 8 — Sauvegarde

Configurer un export automatique périodique des séquences les plus critiques (entrées, zones à haute valeur de preuve) vers un stockage externe distinct du NVR lui-même — méthode complète de politique de sauvegarde au chapitre 39, appliquée ici spécifiquement à la vidéosurveillance : contrairement à un simple fichier bureautique, une séquence vidéo perdue ne peut jamais être recréée après coup.

## ÉTAPE 9 — Procédure d'export vidéo pour investigation

<div class="ou-executer">INTERFACE DU NVR</div>

```
Lecture → Selectionner la camera et la plage horaire
  → Exporter → Format natif + lecteur autonome, ou format standard (MP4)
  → Verifier l'integrite du fichier exporte (relecture immediate)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours vérifier un export immédiatement après l'avoir réalisé</span>
Un export vidéo corrompu ou tronqué découvert seulement au moment où il devient réellement nécessaire (remise à une autorité, examen d'un incident) n'a plus aucune valeur — toujours relire intégralement un export juste après sa création, avant de considérer l'opération terminée, jamais après coup sur la seule confiance que l'export "a dû" fonctionner.
</div>

## VÉRIFICATION

<div class="ou-executer">INTERFACE DU NVR</div>

```
Cameras → Etat general
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Les 21 caméras du projet affichent un statut "En ligne" et "Enregistrement actif" — toute caméra affichant "Hors ligne" ou "Erreur d'enregistrement" doit être investiguée avant de considérer le déploiement terminé (chapitre 33, étape 18).
</div>

## DÉPANNAGE

Un tableau dédié de scénarios de dépannage vidéosurveillance (caméra visible mais aucun enregistrement, stockage NVR plein, image saccadée, bande passante insuffisante) est développé au chapitre 46.

## SAUVEGARDE

Confirmée à l'étape 8.

## CHECKLIST DE FIN

- [ ] Mot de passe par défaut du NVR changé
- [ ] RAID configuré, capacité confirmée conforme au calcul du chapitre 34
- [ ] Toutes les caméras du projet ajoutées via ONVIF (ou manuellement si nécessaire)
- [ ] Calendrier d'enregistrement différencié par criticité de zone
- [ ] Journal de détection centralisé vérifié fonctionnel
- [ ] Utilisateurs créés avec permissions et caméras visibles restreintes par rôle
- [ ] Aucun accès direct depuis Internet, uniquement via VPN
- [ ] Export automatique vers un stockage externe configuré
- [ ] Procédure d'export manuel testée et vérifiée par relecture immédiate

## Résumé du chapitre

Le NVR se configure dans un ordre précis : stockage RAID dimensionné selon le calcul du chapitre 34, ajout des caméras via ONVIF (standard ouvert, évite le verrouillage à un fabricant unique), calendrier d'enregistrement différencié par criticité de zone, utilisateurs à permissions restreintes (principe du moindre privilège, y compris sur les caméras visibles), accès distant exclusivement via VPN (jamais un port exposé directement sur Internet), sauvegarde externe et procédure d'export systématiquement vérifiée par relecture immédiate.

*Chapitre suivant : l'intégration réseau + vidéosurveillance — l'architecture complète, du VLAN CCTV jusqu'au NVR, revue de bout en bout.*
