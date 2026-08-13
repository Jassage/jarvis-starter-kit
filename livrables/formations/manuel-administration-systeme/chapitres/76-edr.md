<div class="chapitre-titre-num">CHAPITRE 76</div>

# EDR et protection des postes/serveurs

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Étendre la détection et la protection au niveau des postes et des serveurs eux-mêmes, complétant la visibilité réseau déjà apportée par l'IDS/IPS du chapitre précédent. À la fin de ce chapitre, tu comprendras la différence entre un EDR et un antivirus traditionnel, le rôle de la télémétrie comportementale, la réponse automatisée à une menace détectée, et comment un EDR aurait pu changer le déroulement de l'incident fondateur de ce manuel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
En repensant à l'incident de rançongiciel du chapitre 4 — un accès RDP exposé exploité, suivi du chiffrement de plusieurs postes avant que quiconque ne s'en aperçoive — la RSSI pose une question directe : <em>"Notre IDS/IPS aurait pu voir le trafic réseau initial, notre SIEM aurait pu corréler des événements suspects. Mais une fois l'attaquant à l'intérieur d'un poste, en train de chiffrer des fichiers localement, qu'est-ce qui aurait pu le stopper avant que les dégâts ne soient faits ?"</em> L'antivirus traditionnel installé sur ce poste, basé sur des signatures déjà connues, n'avait rien détecté — le rançongiciel utilisé était trop récent pour figurer dans sa base. Un EDR répond directement à cette question.
</div>

## 76.1 Le problème : une menace invisible au niveau réseau, une fois à l'intérieur d'un poste

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la limite du chapitre 75</span>
Un IDS/IPS observe le trafic circulant sur le réseau — une fois qu'un attaquant a obtenu un accès initial et opère localement sur un poste (chiffrement de fichiers, exécution de commandes, modification du registre), une grande partie de cette activité ne génère aucun trafic réseau distinctif et reste donc invisible pour un IDS/IPS, aussi bien positionné soit-il. Une source de détection dédiée à l'intérieur même du poste devient nécessaire pour combler cet angle mort.
</div>

## 76.2 EDR : au-delà de l'antivirus traditionnel

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct de la section 75.3 — le même principe, appliqué au poste</span>
Un antivirus traditionnel fonctionne principalement par signature, comparant chaque fichier à une base de menaces déjà connues — exactement la même limite déjà rencontrée pour la détection par signature d'un IDS (section 75.3), incapable de détecter une menace inédite absente de sa base. Un **EDR** (Endpoint Detection and Response) observe en continu le **comportement** du poste — quels processus s'exécutent, quels fichiers sont modifiés en masse, quelles connexions réseau locales sont établies — permettant de détecter une activité malveillante par son comportement caractéristique, même sans signature préexistante correspondante.
</div>

## 76.3 Télémétrie poste par poste

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel indirect du chapitre 58</span>
Un agent EDR installé sur chaque poste collecte en continu une télémétrie détaillée — création et arborescence des processus, modifications de fichiers, appels système sensibles, connexions réseau locales — exactement le même principe d'observabilité déjà établi au chapitre 58, appliqué ici non plus à un serveur dans son ensemble mais au comportement fin de chaque processus individuel s'exécutant sur un poste.
</div>

## 76.4 Détection comportementale et réponse automatisée

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — répondre directement à la question de la RSSI</span>
Un comportement caractéristique d'un rançongiciel — un processus modifiant un très grand nombre de fichiers en un temps très court, avec un changement d'extension systématique — constitue une signature comportementale détectable par un EDR, indépendamment de la signature spécifique du rançongiciel utilisé. Un EDR peut alors déclencher une **réponse automatisée** : isoler immédiatement le poste concerné du réseau, stoppant la propagation avant qu'elle n'atteigne d'autres systèmes — exactement l'action déjà évoquée comme exemple de réponse automatique dans une règle de corrélation SIEM au chapitre 74.
</div>

## 76.5 Reconsidérer l'incident du chapitre 4 avec un EDR en place

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Le contrefactuel qui motive ce chapitre</span>
Dans l'incident du chapitre 4, l'antivirus traditionnel n'avait rien détecté faute de signature correspondante — mais le comportement du rançongiciel une fois actif (chiffrement massif et rapide de fichiers) aurait constitué un signal comportemental fortement caractéristique pour un EDR, indépendamment de la nouveauté de la menace spécifique utilisée. Un EDR correctement configuré aurait pu isoler automatiquement le poste compromis dès les premières secondes de chiffrement, limitant potentiellement l'incident à un seul poste plutôt qu'à sa propagation observée dans le récit original.
</div>

## 76.6 Intégrer l'EDR au SIEM : une troisième source majeure

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 74 et 75</span>
L'EDR constitue, aux côtés d'Active Directory, du pare-feu et de l'IDS/IPS, une troisième catégorie majeure de source à intégrer au SIEM — une alerte EDR de comportement suspect, corrélée avec une authentification récente sur ce même poste ou une alerte IDS antérieure sur le trafic réseau ayant précédé l'incident, reconstitue une chaîne d'attaque complète à travers plusieurs couches de l'infrastructure, du réseau jusqu'au poste lui-même.
</div>

## 76.7 EDR et antivirus traditionnel : un tableau de décision

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>

| Critère | Antivirus traditionnel | EDR |
|---|---|---|
| Méthode de détection | Signature de fichiers connus | Comportement des processus en continu |
| Menaces inédites | Généralement non détectées | Détectables par comportement caractéristique |
| Réponse | Suppression ou mise en quarantaine du fichier | Isolement réseau du poste, investigation détaillée |
| Visibilité | Limitée au fichier analysé | Historique complet de l'activité du poste |

Ces deux approches restent généralement complémentaires plutôt qu'exclusives — de nombreuses solutions modernes combinent les deux dans un même agent, l'antivirus traditionnel filtrant efficacement les menaces déjà connues tandis que l'EDR couvre les menaces comportementales inédites.
</div>

## Atelier — Configurer une réponse automatisée à un comportement de rançongiciel

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 76 — Reproduire, avec un EDR, une protection absente lors de l'incident du chapitre 4</span>

**Objectif** : configurer une règle EDR détectant un comportement caractéristique de rançongiciel et déclenchant l'isolement automatique du poste concerné.

**Préparation** : un agent EDR déployé sur un poste de test.

**Étapes détaillées** :

1. Définis un seuil comportemental caractéristique (par exemple, plus de cinquante fichiers modifiés avec changement d'extension en moins de trente secondes).
2. Configure la réponse automatique associée : isolement réseau immédiat du poste concerné.
3. Configure la transmission de cette alerte vers le SIEM (section 76.6).
4. Explique pourquoi cette règle, appliquée à l'incident du chapitre 4, aurait pu limiter l'ampleur de la propagation observée.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la règle détecte le comportement caractéristique de chiffrement massif indépendamment de la signature spécifique du rançongiciel utilisé, isolant automatiquement le poste concerné avant que l'attaquant ne puisse se propager latéralement vers d'autres systèmes (rappel du mouvement latéral déjà évoqué à la section 74.5 et à l'exercice 74.1). Appliquée rétroactivement au scénario du chapitre 4, cette règle aurait détecté le comportement de chiffrement dès ses premières secondes, potentiellement avant qu'un nombre significatif de fichiers ne soit affecté — contenant l'incident à un seul poste plutôt que de permettre sa propagation, exactement l'issue que la RSSI recherchait dans le scénario d'ouverture de ce chapitre.

**Dépannage** : si la règle isole un poste lors d'une opération légitime (comme une réorganisation massive de fichiers par un utilisateur ou un script de maintenance planifié), ajuste le seuil comportemental ou ajoute une exception documentée pour ce type d'activité légitime connue, plutôt que de désactiver l'ensemble de la règle — exactement le même principe déjà établi pour le calibrage des règles SIEM au chapitre 74.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un EDR déployé uniquement sur certains postes, créant un angle mort</span>
Rappel indirect des chapitres 74-75 : un poste sans agent EDR reste totalement invisible pour cette couche de détection, quel que soit le comportement malveillant qui s'y produit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — une réponse automatisée trop agressive, isolant des postes légitimes</span>
Rappel direct du même risque déjà dénoncé pour un IPS mal calibré à la section 75.5 : un seuil comportemental trop sensible peut interrompre une activité légitime, avec un impact direct sur l'activité de l'entreprise.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des alertes EDR générées mais jamais consultées ni intégrées au SIEM</span>
Rappel indirect du chapitre 58 : une détection technique fonctionnelle mais dont personne n'est activement informé reproduit le même risque qu'une supervision ignorée.
</div>

## Diagnostiquer un EDR qui isole un poste légitime par erreur

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un poste utilisé pour une activité légitime est isolé automatiquement par l'EDR</span>

- **Diagnostic** : identifier précisément quelle règle comportementale a déclenché l'isolement, et si l'activité à l'origine du déclenchement correspond réellement à une opération légitime connue (script de maintenance, réorganisation massive de fichiers) ou à un incident réel nécessitant une investigation plus poussée.
- **Comment vérifier** : consulter l'historique détaillé de télémétrie du poste concerné dans la console EDR, retraçant précisément les processus et fichiers impliqués dans le déclenchement de la règle.
- **Résolution** : si l'activité est confirmée légitime, ajuster le seuil de la règle ou documenter une exception pour ce type d'activité spécifique ; si un doute subsiste, maintenir l'isolement le temps d'une investigation complémentaire plutôt que de lever la protection par précipitation.
</div>

## En entreprise

- **Bonne pratique répandue** : déployer l'EDR de façon exhaustive sur l'ensemble des postes et serveurs de l'organisation, sans exception, un seul système non couvert représentant un angle mort potentiellement exploitable.
- **Bonne pratique répandue** : documenter les activités légitimes connues susceptibles de ressembler à un comportement malveillant (scripts de maintenance planifiés, outils de sauvegarde), pour calibrer les règles de détection en conséquence et réduire les faux positifs.
- **Erreur classique observée** : un EDR déployé rapidement sur les serveurs critiques uniquement, en laissant de côté les postes de travail des utilisateurs — alors que ces postes constituent souvent le point d'entrée initial d'une attaque, comme celui exploité dans l'incident du chapitre 4.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence fondamentale entre un antivirus traditionnel et un EDR ?"**
Réponse attendue : un antivirus traditionnel détecte par signature de fichiers déjà connus, incapable de détecter une menace inédite ; un EDR observe en continu le comportement des processus sur le poste, permettant de détecter une activité malveillante par son comportement caractéristique, même sans signature préexistante.

**Q2. "Pourquoi un IDS/IPS, aussi bien positionné soit-il, ne peut-il pas détecter une activité malveillante purement locale sur un poste, comme le chiffrement de fichiers par un rançongiciel ?"**
Réponse attendue : un IDS/IPS observe le trafic réseau ; une activité purement locale sur un poste (modification de fichiers, exécution de processus) ne génère généralement aucun trafic réseau distinctif, la rendant invisible pour un outil observant uniquement le réseau.

**Q3. "Comment un EDR peut-il détecter un rançongiciel totalement nouveau, sans signature préexistante ?"**
Réponse attendue : en observant le comportement caractéristique de l'activité malveillante elle-même (modification massive et rapide de fichiers, changement systématique d'extension) plutôt que la signature spécifique du fichier exécutable — un comportement suffisamment distinctif reste détectable indépendamment de la nouveauté de la menace précise utilisée.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Déploie l'EDR sur l'ensemble des postes et serveurs sans exception — un seul système non couvert peut servir de point d'entrée ou de propagation non détecté pour un incident.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente systématiquement les activités légitimes connues pouvant ressembler à un comportement malveillant, réduisant le risque de faux positif tout en conservant la sensibilité de détection sur les comportements réellement anormaux.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
La télémétrie continue collectée par un agent EDR consomme des ressources locales sur chaque poste — un dimensionnement adapté et une configuration raisonnable de la profondeur de collecte évitent un impact perceptible sur les performances quotidiennes des utilisateurs.
</div>

## Résumé du chapitre

- Un IDS/IPS observe le réseau, mais reste aveugle à une activité malveillante purement locale sur un poste — un EDR comble cet angle mort.
- Un EDR détecte par comportement plutôt que par signature, permettant de repérer une menace inédite qu'un antivirus traditionnel manquerait.
- La télémétrie EDR collecte en continu l'activité détaillée de chaque poste, dans le même esprit d'observabilité déjà établi au chapitre 58.
- Un EDR peut déclencher une réponse automatisée, comme l'isolement réseau immédiat d'un poste compromis, limitant la propagation d'un incident.
- Appliqué rétroactivement à l'incident du chapitre 4, un EDR aurait pu détecter et contenir le rançongiciel dès ses premières secondes d'activité.
- L'EDR, l'IDS/IPS et le SIEM se complètent pour couvrir respectivement le poste, le réseau et la corrélation d'ensemble de l'infrastructure.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un EDR se distingue d'un antivirus traditionnel principalement par :
   - a) Sa détection basée sur le comportement plutôt que sur la signature de fichiers connus
   - b) Son incapacité à détecter toute menace
   - c) Son fonctionnement exclusivement réseau, sans agent local
   - d) Son remplacement complet du besoin d'un IDS/IPS

2. Pourquoi un IDS/IPS ne peut-il pas détecter le chiffrement local de fichiers par un rançongiciel ?
   - a) Cette activité génère toujours un trafic réseau facilement détectable
   - b) Cette activité est purement locale et ne génère généralement aucun trafic réseau distinctif
   - c) Les IDS/IPS sont configurés pour ignorer ce type d'activité
   - d) Le chiffrement de fichiers n'est jamais malveillant

3. Une réponse automatisée typique d'un EDR face à un comportement de rançongiciel détecté est :
   - a) L'envoi d'un simple message informatif à l'utilisateur du poste
   - b) L'isolement réseau immédiat du poste concerné
   - c) Le redémarrage automatique du serveur central
   - d) La désactivation complète du pare-feu

**Corrigé** : 1-a, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un antivirus traditionnel basé sur signature peut détecter fiablement une menace totalement nouvelle, sans signature préexistante. — **Faux** (section 76.2).
2. Un EDR déployé sur seulement une partie des postes de l'organisation offre une protection équivalente à un déploiement exhaustif. — **Faux** (section "Erreur n°1").
3. L'EDR et l'antivirus traditionnel sont généralement complémentaires plutôt qu'exclusifs. — **Vrai** (section 76.7).
4. Une réponse automatisée EDR trop agressive peut isoler un poste légitime, un risque comparable à celui déjà rencontré pour un IPS mal calibré. — **Vrai** (section "Erreur n°2").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi l'antivirus traditionnel installé sur le poste compromis lors de l'incident du chapitre 4 n'a rien détecté, et comment un EDR aurait pu changer ce résultat.
2. Un collègue propose de désactiver la réponse automatisée d'isolement de l'EDR, en la remplaçant par une simple alerte nécessitant une validation humaine avant toute action, "pour éviter tout risque de faux positif bloquant une activité légitime". Discute les avantages et les limites de cette proposition.

**Corrigé 1** : l'antivirus traditionnel de l'incident du chapitre 4 fonctionnait par comparaison à une base de signatures de menaces déjà connues — le rançongiciel utilisé étant trop récent, aucune signature correspondante n'existait encore dans cette base au moment de l'attaque, le rendant totalement invisible pour cet outil. Un EDR, observant le comportement plutôt que la signature (section 76.2), aurait pu détecter le motif caractéristique du chiffrement massif et rapide de fichiers, indépendamment de la nouveauté du rançongiciel spécifique utilisé — un comportement suffisamment distinctif pour déclencher une alerte, voire une réponse automatisée d'isolement (section 76.4), potentiellement avant qu'un nombre significatif de fichiers ne soit affecté.

**Corrigé 2** : cette proposition élimine effectivement le risque d'un faux positif bloquant automatiquement une activité légitime, un avantage réel compte tenu du risque déjà dénoncé à la section "Erreur n°2". Cependant, elle introduit un délai humain avant toute action de confinement — pendant l'attente d'une validation humaine, un rançongiciel réel continuerait de chiffrer des fichiers sans interruption, potentiellement pendant plusieurs minutes selon la disponibilité de la personne devant valider l'action, un délai qui aurait pu réduire significativement l'efficacité de la réponse dans le scénario contrefactuel de la section 76.5. Un compromis plus mesuré consisterait à conserver la réponse automatisée pour les comportements présentant le plus haut niveau de confiance (comme un chiffrement massif et rapide, peu susceptible d'être une activité légitime), tout en réservant la validation humaine préalable aux comportements plus ambigus et moins caractéristiques.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 76.1</span>

Propose une règle de corrélation SIEM combinant une alerte EDR de comportement suspect sur un poste avec un événement Active Directory, pour distinguer un incident probable d'une simple activité inhabituelle sans gravité.
</div>

**Corrigé :** La règle pourrait se formuler ainsi : "une alerte EDR de comportement suspect (exécution de processus inhabituel) sur un poste, précédée dans l'heure d'une authentification réussie sur ce poste depuis une adresse IP jamais observée auparavant pour cet utilisateur (événement Active Directory, chapitre 23), alors sévérité élevée, alerter l'équipe sécurité pour investigation prioritaire". Un comportement EDR suspect isolé peut parfois correspondre à une activité légitime mais inhabituelle (nouvel outil installé par un utilisateur, par exemple) ; combiné à un signal d'authentification également atypique, la probabilité d'un scénario de compromission réelle augmente significativement, reproduisant le même principe de corrélation multi-source déjà établi aux chapitres 74 et 75 — chaque source individuelle reste ambiguë, leur combinaison devient un indicateur bien plus fiable.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 76.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun nouveau poste n'est mis en service dans l'entreprise sans agent EDR installé et fonctionnel, en t'appuyant sur le risque décrit à la section "Erreur n°1".
</div>

**Corrigé (exemple de réponse) :** Aucun poste de travail ou serveur ne sera considéré comme prêt pour la mise en service sans que l'agent EDR n'y soit installé, correctement enregistré auprès de la console centrale, et vérifié comme transmettant effectivement sa télémétrie. Cette vérification sera intégrée à la checklist de mise en service déjà existante pour tout nouveau système, au même titre que les autres contrôles de sécurité déjà établis dans ce manuel. Un audit périodique de l'inventaire des postes (rappel du chapitre 3) sera croisé avec la liste des agents EDR actifs, permettant de détecter rapidement tout système ayant échappé à cette procédure ou dont l'agent aurait cessé de fonctionner silencieusement, évitant que ce système ne devienne un angle mort non détecté dans la couverture de sécurité globale de l'organisation.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi un IDS/IPS reste aveugle à une activité malveillante purement locale sur un poste.</li>
<li>☐ Je sais distinguer un EDR (détection comportementale) d'un antivirus traditionnel (détection par signature).</li>
<li>☐ Je comprends le rôle de la télémétrie continue collectée par un agent EDR.</li>
<li>☐ Je sais configurer une réponse automatisée EDR, comme l'isolement d'un poste compromis.</li>
<li>☐ Je comprends comment un EDR aurait pu changer le déroulement de l'incident du chapitre 4.</li>
<li>☐ Je sais intégrer les alertes EDR au SIEM pour enrichir la corrélation d'ensemble.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Un EDR remplace-t-il complètement le besoin d'un antivirus traditionnel ?</dt>
<dd>Pas nécessairement — de nombreuses solutions modernes combinent les deux approches dans un même agent (section 76.7), l'antivirus traditionnel filtrant efficacement les menaces déjà connues tandis que l'EDR couvre les comportements inédits, les deux approches restant généralement complémentaires plutôt qu'exclusives.</dd>

<dt>Un EDR peut-il générer des faux positifs, comme les autres outils de détection déjà rencontrés dans ce manuel ?</dt>
<dd>Oui, exactement le même risque déjà rencontré pour les triggers Zabbix, les règles Prometheus, les règles SIEM et les règles IPS s'applique aux règles comportementales EDR — un calibrage soigneux et une documentation des activités légitimes connues restent nécessaires pour limiter ce risque.</dd>

<dt>L'EDR nécessite-t-il une équipe dédiée pour être efficace, comme le SIEM du chapitre 74 ?</dt>
<dd>Une surveillance et un ajustement réguliers des règles comportementales restent nécessaires pour maintenir l'efficacité de l'EDR dans la durée, un investissement humain comparable à celui déjà recommandé pour le SIEM au chapitre 74 — un EDR installé puis totalement délaissé perd progressivement sa pertinence face à l'évolution du contexte de l'organisation.</dd>

<dt>Un EDR peut-il détecter une menace qui n'implique aucun fichier malveillant, comme une attaque utilisant uniquement des outils légitimes déjà présents sur le système ?</dt>
<dd>Oui, c'est précisément l'un des principaux avantages de l'approche comportementale — une attaque utilisant exclusivement des outils système légitimes (une technique parfois appelée "living off the land") échapperait totalement à un antivirus traditionnel basé sur signature, mais peut être détectée par un EDR si la séquence d'utilisation de ces outils légitimes constitue elle-même un comportement anormal et caractéristique.</dd>
</dl>

## Références et pour aller plus loin

- NIST — Guide to Malware Incident Prevention and Handling (SP 800-83) : [https://csrc.nist.gov/publications/detail/sp/800-83/rev-1/final](https://csrc.nist.gov/publications/detail/sp/800-83/rev-1/final)
- MITRE ATT&CK — Techniques associées aux rançongiciels : [https://attack.mitre.org/](https://attack.mitre.org/)

*Chapitre suivant : l'audit de sécurité et les tests d'intrusion — vérifier activement et de façon proactive l'efficacité réelle de l'ensemble des mesures de détection et de protection déjà construites dans cette partie du manuel, plutôt que d'attendre qu'un incident réel ne les mette à l'épreuve.*
