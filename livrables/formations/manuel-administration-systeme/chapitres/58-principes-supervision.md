<div class="chapitre-titre-num">CHAPITRE 58</div>

# Principes de la supervision (métriques, logs, traces)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Savoir, en temps réel, ce qui se passe réellement sur une infrastructure devenue largement automatisée, plutôt que de l'apprendre après coup lors d'un incident signalé par les utilisateurs. À la fin de ce chapitre, tu comprendras les trois piliers de l'observabilité (métriques, logs, traces), la différence entre supervision active et passive, et tu sauras définir un plan de supervision minimal avec des seuils d'alerte raisonnables — la base indispensable avant d'aborder les outils concrets des chapitres suivants (Zabbix, Prometheus, Grafana, ELK, Graylog).
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un vendredi après-midi, plusieurs employés du service comptabilité signalent qu'ils ne parviennent plus à enregistrer de documents sur le serveur de gestion documentaire (chapitre 19). L'administrateur de garde se connecte et découvre que le disque est plein depuis probablement plusieurs heures — les journaux d'application s'accumulaient silencieusement sans qu'aucune rotation ne soit configurée. Rien n'a alerté personne : aucun système ne surveillait l'espace disque disponible. <em>"On l'a appris par les utilisateurs, pas par nos propres outils,"</em> résume le DSI en réunion post-incident. <em>"Ça doit changer."</em> Ce chapitre pose les bases pour que ce type d'incident soit détecté avant que les utilisateurs ne le remarquent.
</div>

## 58.1 Le problème : apprendre un incident par les utilisateurs

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un incident non supervisé est un incident découvert trop tard</span>
Sans supervision active, une infrastructure ne signale jamais elle-même ses problèmes — elle continue simplement à fonctionner en dégradé, silencieusement, jusqu'à ce qu'un utilisateur rencontre une erreur suffisamment visible pour la signaler. Le délai entre l'apparition réelle d'un problème (le disque qui se remplit progressivement) et sa détection (l'appel de l'utilisateur bloqué) constitue une fenêtre de risque évitable — l'objectif de la supervision est de réduire cette fenêtre au minimum, idéalement jusqu'à zéro.
</div>

## 58.2 Les trois piliers de l'observabilité

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le tableau de bord d'un véhicule</span>
Un tableau de bord de véhicule combine plusieurs types d'information complémentaires : des jauges numériques continues (vitesse, niveau de carburant), un journal d'événements (les voyants qui s'allument à un moment précis), et la capacité de retracer un trajet complet point par point. L'observabilité d'une infrastructure repose sur cette même combinaison, formalisée en trois piliers : les **métriques**, les **logs**, et les **traces**.
</div>

## 58.3 Les métriques : des mesures numériques dans le temps

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la jauge continue</span>
Une **métrique** est une valeur numérique mesurée régulièrement dans le temps — l'utilisation du CPU, la mémoire disponible, l'espace disque restant, le nombre de requêtes par seconde, le temps de réponse moyen. Une métrique répond à la question "combien" et "à quel rythme cette valeur évolue-t-elle" — dans le scénario d'ouverture, une métrique d'espace disque disponible, surveillée en continu, aurait révélé la tendance à la baisse bien avant que le disque ne soit réellement plein.
</div>

## 58.4 Les logs : un journal d'événements

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le voyant qui s'allume à un instant précis</span>
Un **log** (journal) est un enregistrement horodaté d'un événement précis — une connexion réussie, une erreur applicative, un service qui redémarre. Un log répond à la question "que s'est-il passé, et quand exactement" — contrairement à une métrique, il ne décrit pas une tendance continue mais un événement ponctuel. Les chapitres 62 et 63 approfondiront la centralisation et l'analyse des logs à grande échelle.
</div>

## 58.5 Les traces : suivre une requête à travers plusieurs services

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect des chapitres 39-44</span>
Une **trace** suit le parcours complet d'une requête unique à travers plusieurs composants d'un système distribué — particulièrement utile pour le portail client une fois déployé sur Kubernetes (chapitres 41-44), où une seule requête utilisateur peut traverser plusieurs microservices avant de recevoir une réponse. Une trace répond à la question "où exactement, dans cette chaîne de composants, le ralentissement ou l'erreur s'est-il produit" — une question à laquelle ni une métrique globale ni un log isolé ne peuvent répondre à eux seuls.
</div>

## 58.6 Supervision active et supervision passive

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — interroger ou attendre d'être informé</span>
La **supervision active** (ou *polling*) interroge régulièrement chaque système surveillé pour connaître son état ("le serveur répond-il ? quel est son espace disque ?"). La **supervision passive** attend que le système surveillé signale lui-même un événement ou envoie sa métrique (un agent installé localement qui pousse ses données vers un serveur central). Les deux approches se complètent en pratique — un système peut être interrogé périodiquement tout en envoyant également des alertes immédiates dès qu'un seuil critique est franchi.
</div>

## 58.7 Seuils d'alerte : rappel direct du chapitre 57

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le même piège que celui déjà rencontré au chapitre 57</span>
Exactement le même risque de fatigue d'alerte déjà rencontré pour les seuils de sévérité d'un pipeline DevSecOps (section 57.7) s'applique à la supervision : un seuil d'alerte trop sensible (par exemple, une alerte à chaque pic normal et temporaire d'utilisation CPU) noie rapidement les alertes réellement importantes sous un flot d'alertes sans conséquence, jusqu'à ce que l'équipe cesse d'y prêter attention. Un seuil raisonnable, combiné à une durée minimale avant déclenchement (par exemple, "CPU au-dessus de 90 % pendant plus de 5 minutes" plutôt qu'un pic instantané), reste généralement plus efficace qu'un seuil brut sur une valeur instantanée.
</div>

## 58.8 Le tableau de bord : rendre visible l'état de santé de l'infrastructure

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Une supervision qui n'est jamais consultée ne sert à rien</span>
Collecter des métriques et des logs ne suffit pas si personne ne les consulte jamais — un tableau de bord visuel, centralisant les indicateurs les plus critiques, rend l'état de santé de l'infrastructure immédiatement visible sans nécessiter d'interroger manuellement chaque système un par un. Le chapitre 61 (Grafana) détaillera la construction de ces tableaux de bord.
</div>

## Atelier — Définir un plan de supervision minimal

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 58 — Éviter la répétition du scénario d'ouverture</span>

**Objectif** : concevoir un plan de supervision minimal pour le serveur de gestion documentaire, empêchant la répétition de l'incident du scénario d'ouverture.

**Préparation** : le serveur de gestion documentaire (Rocky Linux, chapitre 19) comme système de référence.

**Étapes détaillées** :

1. Identifie au moins trois métriques essentielles à surveiller en continu sur ce serveur (section 58.3).
2. Propose un seuil d'alerte raisonnable pour l'espace disque disponible, en tenant compte du risque de fatigue d'alerte (section 58.7).
3. Identifie un log applicatif pertinent à centraliser pour ce serveur (section 58.4).
4. Explique la différence entre une alerte déclenchée par supervision active et une alerte déclenchée par supervision passive dans ce contexte précis.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : trois métriques essentielles pour ce serveur incluent typiquement l'espace disque disponible, l'utilisation CPU et l'utilisation mémoire. Un seuil raisonnable pour l'espace disque pourrait être fixé à "espace disponible inférieur à 15 % pendant plus de 10 minutes", évitant une alerte sur une fluctuation normale et temporaire tout en laissant suffisamment de marge d'action avant que le disque ne soit réellement plein — contrairement au scénario d'ouverture, où aucun seuil n'existait. Le log applicatif du logiciel de gestion documentaire lui-même constitue une source pertinente à centraliser, pour détecter d'éventuelles erreurs d'écriture précédant le remplissage complet du disque. Une supervision active interrogerait régulièrement l'espace disque disponible ; une supervision passive recevrait une alerte immédiate poussée par un agent local dès le franchissement du seuil, sans attendre le prochain cycle d'interrogation.

**Dépannage** : si un plan de supervision nouvellement mis en place génère immédiatement un grand nombre d'alertes, ce n'est généralement pas le signe d'une infrastructure soudainement dégradée, mais celui de seuils mal calibrés qui n'avaient simplement jamais été mesurés auparavant — ajuste les seuils après quelques jours d'observation réelle plutôt que de les fixer arbitrairement dès le départ.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — aucune supervision active, uniquement une découverte par les utilisateurs</span>
Rappel du scénario d'ouverture : sans supervision, le délai entre l'apparition d'un problème et sa détection dépend entièrement de la patience et de la rapidité de signalement des utilisateurs.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des seuils d'alerte mal calibrés, trop sensibles ou trop laxistes</span>
Rappel de la section 58.7 : un seuil trop sensible noie les alertes importantes ; un seuil trop laxiste retarde inutilement la détection d'un problème réel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des métriques collectées mais jamais consultées</span>
Rappel de la section 58.8 : une supervision techniquement fonctionnelle mais dont personne ne consulte jamais le tableau de bord équivaut en pratique à une absence de supervision.
</div>

## Diagnostiquer une supervision inefficace

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un incident est découvert par les utilisateurs malgré l'existence d'un système de supervision</span>

- **Diagnostic** : vérifier si la métrique concernée était réellement surveillée, si un seuil d'alerte était configuré pour cette métrique, et si l'alerte générée avait effectivement un destinataire clairement identifié et disponible au moment de l'incident.
- **Comment vérifier** : rechercher dans l'historique du système de supervision si une alerte a bien été générée au moment de l'incident, et si oui, retracer pourquoi elle n'a pas été traitée à temps.
- **Résolution** : combler l'angle mort identifié (métrique non surveillée, seuil absent, ou destinataire d'alerte mal défini) — un incident non détecté révèle presque toujours un trou précis et corrigible dans le plan de supervision, plutôt qu'une défaillance générale du concept de supervision lui-même.
</div>

## En entreprise

- **Bonne pratique répandue** : définir un plan de supervision minimal pour chaque nouveau système dès sa mise en production, plutôt que d'ajouter la supervision après un premier incident non détecté.
- **Bonne pratique répandue** : revoir périodiquement les seuils d'alerte à la lumière des données réellement observées, plutôt que de les fixer une seule fois arbitrairement.
- **Erreur classique observée** : une organisation qui investit dans des outils de supervision sophistiqués sans jamais définir clairement qui reçoit et traite chaque type d'alerte — l'outil existe, mais personne n'agit dessus, reproduisant en pratique le même résultat que l'absence totale de supervision.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quels sont les trois piliers de l'observabilité, et à quelle question chacun répond-il ?"**
Réponse attendue : les métriques répondent à "combien, et à quel rythme cette valeur évolue" ; les logs répondent à "que s'est-il passé, et quand" ; les traces répondent à "où, dans une chaîne de composants distribués, un problème s'est-il produit".

**Q2. "Quelle est la différence entre supervision active et supervision passive ?"**
Réponse attendue : la supervision active interroge régulièrement chaque système surveillé pour connaître son état ; la supervision passive attend que le système surveillé signale lui-même un événement ou pousse sa métrique vers un serveur central — les deux approches se complètent généralement en pratique.

**Q3. "Pourquoi un seuil d'alerte trop sensible peut-il réduire l'efficacité globale d'un système de supervision ?"**
Réponse attendue : un seuil trop sensible génère un grand nombre d'alertes sans réelle conséquence, ce qui pousse progressivement l'équipe à ignorer les alertes en général, y compris celles qui signalent un problème réellement critique — le même mécanisme de fatigue d'alerte déjà rencontré pour les seuils de sévérité d'un pipeline DevSecOps au chapitre 57.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
La supervision n'est pas réservée aux problèmes de performance — une métrique d'authentifications échouées en forte hausse, ou un log signalant un accès inhabituel, constitue une donnée de supervision au même titre qu'une métrique d'espace disque, et sera approfondie dans la Partie 12 consacrée à la cybersécurité.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Définis systématiquement, pour chaque nouveau système mis en production, une liste minimale de métriques à surveiller et un destinataire clair pour chaque type d'alerte — une supervision improvisée après coup couvre presque toujours moins bien les angles morts qu'une supervision pensée dès la conception.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
La collecte de métriques elle-même consomme des ressources (CPU, réseau, stockage) — un intervalle de collecte trop fréquent sur un grand nombre de systèmes peut, paradoxalement, dégrader légèrement la performance de l'infrastructure qu'elle est censée surveiller ; un intervalle raisonnable, adapté à la criticité de chaque métrique, reste préférable à une collecte maximale systématique.
</div>

## Résumé du chapitre

- Sans supervision active, un incident est généralement découvert par les utilisateurs, avec un délai de détection dépendant entièrement de leur patience.
- Les trois piliers de l'observabilité sont les métriques (mesures numériques continues), les logs (événements ponctuels horodatés) et les traces (parcours d'une requête à travers plusieurs composants).
- La supervision active interroge régulièrement les systèmes surveillés ; la supervision passive attend qu'ils signalent eux-mêmes un événement.
- Les seuils d'alerte doivent rester raisonnables, sous peine de provoquer la même fatigue d'alerte déjà rencontrée pour les pipelines DevSecOps.
- Un tableau de bord visuel rend l'état de santé de l'infrastructure immédiatement consultable, sans nécessiter d'interroger chaque système individuellement.
- Un plan de supervision minimal devrait être défini dès la mise en production d'un système, pas après un premier incident non détecté.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Une métrique répond principalement à la question :
   - a) Que s'est-il passé, et quand exactement ?
   - b) Combien, et comment cette valeur évolue-t-elle dans le temps ?
   - c) Où, dans une chaîne de composants, un problème s'est-il produit ?
   - d) Qui a approuvé ce changement ?

2. La supervision passive se caractérise par :
   - a) L'interrogation régulière de chaque système surveillé
   - b) L'absence totale de tout mécanisme d'alerte
   - c) Le système surveillé qui signale lui-même un événement ou pousse sa métrique
   - d) Une supervision réalisée uniquement une fois par an

3. Un seuil d'alerte trop sensible risque principalement de :
   - a) Détecter tous les incidents plus rapidement, sans inconvénient
   - b) Provoquer une fatigue d'alerte qui réduit l'attention portée aux alertes réellement critiques
   - c) Réduire la consommation de ressources de la supervision
   - d) Remplacer le besoin d'un tableau de bord

**Corrigé** : 1-b, 2-c, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Sans supervision active, le délai de détection d'un incident dépend généralement de la rapidité de signalement des utilisateurs. — **Vrai**.
2. Une trace permet de suivre le parcours complet d'une requête à travers plusieurs composants d'un système distribué. — **Vrai**.
3. Collecter des métriques et des logs suffit à garantir une supervision efficace, même sans tableau de bord consulté régulièrement. — **Faux** (section 58.8).
4. La collecte de métriques ne consomme aucune ressource et peut être configurée à la fréquence maximale sans inconvénient. — **Faux** (section "Performance").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique, en te basant sur les trois piliers de l'observabilité (section 58.2), quelle combinaison aurait permis de détecter l'incident du scénario d'ouverture avant qu'il n'affecte les utilisateurs.
2. Un administrateur propose de configurer une alerte immédiate dès que l'utilisation CPU dépasse 80 %, même pour quelques secondes. Explique pourquoi cette configuration, bien qu'intentionnée positivement, illustre l'erreur décrite à la section 58.7.

**Corrigé 1** : une métrique d'espace disque disponible, surveillée en continu (section 58.3) avec un seuil d'alerte raisonnable (section 58.7), aurait révélé la tendance à la baisse progressive du disque bien avant qu'il ne soit réellement plein, laissant le temps à l'équipe d'intervenir avant tout impact utilisateur. Un log applicatif signalant d'éventuelles erreurs d'écriture (section 58.4) aurait pu compléter cette détection en révélant les premiers symptômes concrets du problème. La combinaison des deux — une métrique pour anticiper la tendance, un log pour confirmer la cause — offre une détection plus fiable qu'un seul pilier isolé.

**Corrigé 2** : un pic d'utilisation CPU de quelques secondes est souvent normal et sans conséquence — un serveur peut légitimement atteindre une charge élevée brièvement lors d'une tâche ponctuelle sans que cela ne représente un problème réel. Une alerte déclenchée sur chaque pic instantané, sans durée minimale de maintien du seuil, produira un très grand nombre d'alertes sans réelle conséquence, exactement le mécanisme de fatigue d'alerte décrit à la section 58.7 — une configuration plus raisonnable exigerait un maintien du seuil pendant plusieurs minutes avant de déclencher une alerte, filtrant les pics normaux tout en conservant la capacité de détecter une charge réellement anormale et prolongée.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 58.1</span>

Pour chacun des trois scénarios suivants, indique quel pilier de l'observabilité (métrique, log, ou trace) est le plus pertinent pour le diagnostiquer, et justifie brièvement : (a) le temps de réponse du portail client augmente progressivement sur plusieurs jours ; (b) une requête utilisateur spécifique échoue, et il faut identifier lequel des microservices du portail (chapitre 41) en est responsable ; (c) un utilisateur signale une erreur précise survenue à 14h32.
</div>

**Corrigé :** (a) une métrique de temps de réponse, surveillée en continu, révèle directement une tendance progressive sur plusieurs jours — exactement le type d'évolution graduelle qu'une métrique est conçue pour révéler (section 58.3). (b) une trace, en suivant le parcours complet de cette requête spécifique à travers les différents microservices du portail, permet d'identifier précisément lequel d'entre eux a introduit l'erreur ou le ralentissement (section 58.5) — une métrique globale ou un log isolé ne suffiraient pas à localiser le composant responsable dans une chaîne distribuée. (c) un log, horodaté précisément, permet de retrouver l'événement exact survenu à 14h32 signalé par l'utilisateur (section 58.4) — une métrique continue ne capture pas nécessairement un événement ponctuel isolé de cette façon.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 58.2</span>

Rédige, en 3 à 5 phrases, une politique d'équipe garantissant qu'un plan de supervision minimal est systématiquement défini pour tout nouveau système avant sa mise en production, en t'appuyant sur les principes de ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Avant toute mise en production d'un nouveau système, l'équipe responsable définira un plan de supervision minimal incluant au moins les métriques d'espace disque, de CPU et de mémoire, avec des seuils d'alerte calibrés après une période d'observation initiale plutôt que fixés arbitrairement. Chaque alerte configurée aura un destinataire clairement identifié et disponible, évitant qu'une alerte générée ne reste sans réponse faute de destinataire défini. La mise en production d'un système sans ce plan minimal sera considérée comme incomplète, au même titre qu'une mise en production sans sauvegarde configurée (chapitre 27) — la supervision fait partie intégrante du système, pas un ajout optionnel réalisé après coup.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi un incident non supervisé est généralement découvert trop tard, par les utilisateurs.</li>
<li>☐ Je sais distinguer les trois piliers de l'observabilité : métriques, logs, traces.</li>
<li>☐ Je sais expliquer la différence entre supervision active et supervision passive.</li>
<li>☐ Je sais calibrer un seuil d'alerte pour éviter la fatigue d'alerte.</li>
<li>☐ Je comprends pourquoi un tableau de bord consulté régulièrement est indispensable, au-delà de la simple collecte de données.</li>
<li>☐ Je sais définir un plan de supervision minimal pour un nouveau système.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il superviser absolument tous les systèmes de l'infrastructure au même niveau de détail ?</dt>
<dd>Non, la profondeur de supervision devrait être proportionnelle à la criticité du système concerné — un serveur hébergeant une application critique pour les utilisateurs mérite une supervision plus fine qu'un serveur de test rarement utilisé, un principe de priorisation qui reviendra dans les chapitres consacrés aux outils concrets.</dd>

<dt>Les métriques, logs et traces nécessitent-ils toujours trois outils distincts ?</dt>
<dd>Pas nécessairement — certaines plateformes modernes combinent les trois piliers dans un outil unique, tandis que d'autres organisations préfèrent des outils spécialisés pour chacun (approche détaillée dans les chapitres suivants sur Zabbix, Prometheus, Grafana et ELK) ; le choix dépend du contexte et de la taille de l'infrastructure.</dd>

<dt>Une supervision bien conçue élimine-t-elle complètement le risque d'incident ?</dt>
<dd>Non, elle réduit le délai de détection et permet une intervention avant impact majeur pour les utilisateurs, mais elle ne prévient pas la survenue du problème lui-même — la prévention relève d'autres pratiques déjà couvertes dans ce manuel (sauvegardes, haute disponibilité, revue de changement), la supervision intervenant en complément, pas en remplacement.</dd>

<dt>Combien de temps faut-il pour calibrer correctement les seuils d'alerte d'un nouveau système ?</dt>
<dd>Une période d'observation d'au moins une à deux semaines d'activité normale est généralement recommandée avant de figer des seuils définitifs, permettant de distinguer les variations normales des variations réellement anormales — des seuils fixés sans cette période d'observation risquent d'être soit trop sensibles, soit trop laxistes.</dd>
</dl>

## Références et pour aller plus loin

- Google — Site Reliability Engineering, chapitre sur la surveillance : [https://sre.google/sre-book/monitoring-distributed-systems/](https://sre.google/sre-book/monitoring-distributed-systems/)
- CNCF — Cloud Native Observability Whitepaper : [https://www.cncf.io/](https://www.cncf.io/)
- OpenTelemetry — standard ouvert pour métriques, logs et traces : [https://opentelemetry.io/](https://opentelemetry.io/)

*Chapitre suivant : Zabbix — mettre en pratique les principes de ce chapitre avec un outil de supervision open source complet, largement utilisé en entreprise pour la collecte de métriques et la gestion d'alertes.*
