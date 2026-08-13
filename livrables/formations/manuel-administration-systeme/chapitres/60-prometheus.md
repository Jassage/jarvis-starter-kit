<div class="chapitre-titre-num">CHAPITRE 60</div>

# Prometheus

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Superviser l'environnement Kubernetes du portail client (Partie 7) avec Prometheus, une approche différente et complémentaire de celle de Zabbix, particulièrement adaptée à un environnement où les composants surveillés (les pods) apparaissent, disparaissent et changent d'adresse en permanence. À la fin de ce chapitre, tu comprendras le modèle de collecte par interrogation (*pull*), la découverte automatique des cibles dans Kubernetes, le langage de requête PromQL, et la configuration d'alertes via Alertmanager.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'équipe tente d'ajouter le cluster Kubernetes du portail client (chapitres 41-44) à la supervision Zabbix mise en place au chapitre 59. Le problème apparaît rapidement : le montée en charge automatique (HPA, chapitre 44) crée et détruit des pods en continu, chacun avec une adresse IP différente à chaque redémarrage. Configurer manuellement chaque pod comme hôte Zabbix devient intenable — la configuration serait obsolète en quelques minutes. <em>"Zabbix a été pensé pour des serveurs qui existent pendant des mois,"</em> observe un administrateur, <em>"pas pour des pods qui vivent parfois quelques minutes."</em> Prometheus, conçu nativement pour ce type d'environnement dynamique, résout ce problème.
</div>

## 60.1 Pourquoi Prometheus pour l'environnement Kubernetes

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Deux outils complémentaires, pas concurrents — rappel direct de la section 59.1</span>
Prometheus n'est pas choisi ici pour remplacer Zabbix, mais pour couvrir un besoin que Zabbix gère mal nativement : un environnement où le nombre et l'identité des cibles à surveiller changent constamment. Zabbix continue de superviser les serveurs classiques (Windows Server, Rocky Linux) ; Prometheus prend en charge l'environnement Kubernetes du portail. Cette coexistence de deux outils, chacun adapté à son contexte, rejoint le même principe déjà établi au chapitre 49 : une infrastructure hybride nécessite souvent des outils différents selon la nature de chaque environnement, pourvu que ce choix reste conscient et documenté plutôt que subi.
</div>

## 60.2 Le modèle pull : Prometheus interroge, il ne reçoit pas passivement

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — l'inverse du modèle par défaut de Zabbix</span>
Contrairement à un agent Zabbix qui pousse ses métriques vers le serveur (section 59.3), Prometheus fonctionne principalement selon un modèle **pull** : il interroge lui-même, à intervalle régulier, un point de terminaison HTTP (`/metrics`) exposé par chaque cible surveillée. Ce modèle s'adapte naturellement à un environnement dynamique : Prometheus découvre la liste des cibles à interroger à chaque cycle, plutôt que d'attendre que chaque nouvelle cible se déclare elle-même.
</div>

## 60.3 Exporters : exposer des métriques dans un format compréhensible

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — une prise standardisée</span>
Un **exporter** est un petit programme qui traduit les métriques d'un système (CPU, mémoire, métriques applicatives) dans le format texte simple que Prometheus sait interroger — exactement comme un adaptateur électrique standardisé qui rend compatible une prise locale avec n'importe quel appareil. Le `node_exporter`, par exemple, expose les métriques système d'un serveur Linux ; une application peut également exposer directement ses propres métriques via une bibliothèque cliente Prometheus.
</div>

```yaml
# prometheus.yml — configuration de collecte basique
scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['10.10.1.20:9100']
```

## 60.4 Découverte automatique des cibles dans Kubernetes

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la réponse directe au problème du scénario d'ouverture</span>
Plutôt qu'une liste statique d'adresses, Prometheus peut interroger directement l'API Kubernetes (chapitre 41) pour découvrir automatiquement l'ensemble des pods actuellement en cours d'exécution, quelle que soit leur adresse IP du moment. Chaque création ou destruction de pod par le contrôleur de mise à l'échelle horizontale (HPA, chapitre 44) est ainsi automatiquement reflétée dans la liste des cibles surveillées, sans aucune intervention manuelle — résolvant exactement le problème rencontré dans le scénario d'ouverture.
</div>

```yaml
scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
```

## 60.5 PromQL : interroger les métriques collectées

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**PromQL** est le langage de requête de Prometheus, permettant d'interroger et d'agréger les métriques collectées. Il permet, par exemple, de calculer le taux moyen d'utilisation CPU sur les cinq dernières minutes à travers l'ensemble des pods du portail, une agrégation automatique qui serait difficile à reproduire manuellement pods par pods dans un environnement à l'échelle changeante.
</div>

```promql
rate(container_cpu_usage_seconds_total{namespace="portail-client"}[5m])
```

## 60.6 Alertmanager : gérer les alertes, encore le même principe

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel direct des sections 58.7 et 59.5</span>
**Alertmanager** reçoit les alertes déclenchées par Prometheus et les achemine vers les bons destinataires — exactement le même rôle que les actions Zabbix (section 59.6). Une règle d'alerte Prometheus doit, comme un trigger Zabbix bien conçu, exiger un maintien de la condition dans le temps via la clause `for`, sous peine de reproduire la même fatigue d'alerte déjà dénoncée à deux reprises dans ce manuel.
</div>

```yaml
groups:
  - name: portail-client
    rules:
      - alert: LatenceElevee
        expr: http_request_duration_seconds > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Latence du portail superieure a 2 secondes depuis 5 minutes"
```

## Atelier — Instrumenter et surveiller le portail client

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 60 — Résoudre concrètement le problème du scénario d'ouverture</span>

**Objectif** : configurer Prometheus pour surveiller automatiquement les pods du portail client, sans configuration manuelle par pod.

**Préparation** : un cluster Kubernetes fonctionnel avec le portail déployé (chapitres 41-44), et Prometheus installé sur ce cluster.

**Étapes détaillées** :

1. Configure la découverte automatique des cibles Kubernetes pour le namespace `portail-client` (section 60.4).
2. Écris une requête PromQL calculant le taux d'utilisation CPU moyen sur les cinq dernières minutes pour l'ensemble des pods de ce namespace.
3. Configure une règle d'alerte déclenchée si la latence moyenne des requêtes dépasse 2 secondes pendant plus de 5 minutes (section 60.6).
4. Explique ce qui se passerait si le HPA (chapitre 44) déclenchait une mise à l'échelle pendant que cette supervision est active — la configuration nécessiterait-elle une mise à jour manuelle ?
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la découverte automatique des cibles Kubernetes élimine tout besoin de mise à jour manuelle lors d'une mise à l'échelle du HPA — chaque nouveau pod créé est automatiquement détecté et interrogé au prochain cycle de collecte, et chaque pod détruit disparaît automatiquement de la liste des cibles actives, sans aucune intervention. Cette réponse contraste directement avec le problème du scénario d'ouverture, où une configuration manuelle par hôte Zabbix serait devenue obsolète à chaque cycle de mise à l'échelle.

**Dépannage** : si une cible attendue n'apparaît jamais dans Prometheus malgré la configuration de découverte, vérifie que le pod expose bien un port `/metrics` accessible et que les annotations Kubernetes attendues par la configuration de découverte sont bien présentes sur le pod.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — une configuration statique des cibles dans un environnement Kubernetes dynamique</span>
Rappel du scénario d'ouverture : une liste statique d'adresses devient obsolète dès le premier cycle de mise à l'échelle automatique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des règles d'alerte sans clause `for`</span>
Rappel de la section 60.6 : reproduit exactement la même fatigue d'alerte déjà dénoncée aux chapitres 58 et 59.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — une rétention de données Prometheus non dimensionnée</span>
Prometheus stocke localement l'historique des métriques collectées ; une rétention trop longue sur un espace disque non dimensionné en conséquence reproduit un risque similaire à celui du scénario d'ouverture du chapitre 58 — un disque qui se remplit silencieusement, cette fois à cause de l'outil de supervision lui-même.
</div>

## Diagnostiquer une cible affichée "down" dans Prometheus

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une cible attendue apparaît "down" dans l'interface Prometheus (page Targets)</span>

- **Diagnostic** : vérifier si le point de terminaison `/metrics` de la cible est accessible directement depuis le serveur Prometheus, si le port configuré correspond bien au port réellement exposé, et si un pare-feu ou une politique réseau Kubernetes (NetworkPolicy) ne bloque pas cette communication.
- **Comment vérifier** : effectuer une requête HTTP directe vers l'URL `/metrics` de la cible depuis le pod ou le serveur Prometheus lui-même.
- **Résolution** : corriger le port ou l'exposition réseau identifié comme problématique — une cible "down" indique presque toujours un problème d'accessibilité réseau plutôt qu'un problème de configuration Prometheus lui-même.
</div>

## En entreprise

- **Bonne pratique répandue** : réserver Prometheus aux environnements dynamiques (conteneurs, Kubernetes, cloud) où la découverte automatique apporte un bénéfice réel, et conserver Zabbix pour l'infrastructure classique, plutôt que de chercher à imposer un seul outil partout par principe.
- **Bonne pratique répandue** : externaliser le stockage de longue durée des métriques Prometheus vers une solution dédiée lorsque la rétention nécessaire dépasse ce que le stockage local peut raisonnablement absorber.
- **Erreur classique observée** : une équipe qui découvre, après plusieurs mois, que le disque du serveur Prometheus est presque plein à cause d'une rétention configurée trop généreusement dès le départ sans jamais être révisée — un écho direct de l'incident du chapitre 58, cette fois provoqué par l'outil de supervision lui-même.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence fondamentale entre le modèle de collecte de Prometheus et celui d'un agent Zabbix classique ?"**
Réponse attendue : Prometheus fonctionne selon un modèle pull — il interroge lui-même les cibles à intervalle régulier — tandis qu'un agent Zabbix pousse généralement ses métriques vers le serveur ; le modèle pull de Prometheus s'adapte mieux à un environnement où les cibles changent fréquemment, via la découverte automatique.

**Q2. "Pourquoi Prometheus est-il particulièrement adapté à un environnement Kubernetes ?"**
Réponse attendue : sa capacité de découverte automatique des cibles via l'API Kubernetes élimine le besoin de configuration manuelle à chaque création ou destruction de pod, un besoin critique dans un environnement où le nombre de pods varie automatiquement (HPA).

**Q3. "Qu'est-ce qu'un exporter Prometheus, et pourquoi est-il nécessaire ?"**
Réponse attendue : un exporter traduit les métriques d'un système dans le format texte que Prometheus sait interroger via HTTP ; il est nécessaire pour tout système qui n'expose pas nativement ses métriques dans ce format.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Le point de terminaison `/metrics` peut exposer des informations sensibles sur l'état interne d'une application — restreins son accès réseau aux seules adresses légitimes de Prometheus, plutôt que de l'exposer publiquement.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Privilégie systématiquement la découverte automatique des cibles dans tout environnement dynamique — une configuration statique dans ce contexte représente une dette technique qui se révèle rapidement, comme dans le scénario d'ouverture de ce chapitre.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Dimensionne consciemment la durée de rétention des métriques Prometheus en fonction du stockage disponible, et envisage une solution de stockage de longue durée dédiée si les besoins d'historique dépassent plusieurs semaines ou mois.
</div>

## Résumé du chapitre

- Prometheus complète Zabbix plutôt qu'il ne le remplace, en couvrant les environnements dynamiques comme Kubernetes.
- Le modèle pull de Prometheus interroge lui-même les cibles, à l'inverse d'un agent Zabbix qui pousse généralement ses métriques.
- Un exporter traduit les métriques d'un système dans le format que Prometheus sait interroger.
- La découverte automatique des cibles Kubernetes élimine le besoin de configuration manuelle à chaque changement de pod.
- PromQL permet d'interroger et d'agréger les métriques collectées.
- Alertmanager gère l'acheminement des alertes, avec la même exigence de maintien du seuil dans le temps déjà établie aux chapitres 58 et 59.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le modèle de collecte principal de Prometheus est :
   - a) Push, le serveur reçoit passivement les métriques
   - b) Pull, Prometheus interroge lui-même les cibles
   - c) Un envoi unique lors de l'installation
   - d) Une saisie manuelle par un administrateur

2. La découverte automatique des cibles Kubernetes résout principalement :
   - a) Le problème du stockage disque
   - b) Le problème d'une configuration statique obsolète dès qu'un pod change
   - c) Le besoin de PromQL
   - d) Le besoin d'un exporter

3. La clause `for` dans une règle d'alerte Prometheus sert à :
   - a) Définir la fréquence de collecte
   - b) Exiger un maintien de la condition dans le temps avant de déclencher l'alerte
   - c) Supprimer automatiquement l'alerte après un délai
   - d) Chiffrer les métriques collectées

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Prometheus est destiné à remplacer complètement Zabbix dans toute infrastructure. — **Faux** (les deux sont complémentaires, section 60.1).
2. Un exporter traduit les métriques d'un système dans un format compréhensible par Prometheus. — **Vrai**.
3. Une configuration statique des cibles convient parfaitement à un environnement Kubernetes avec mise à l'échelle automatique. — **Faux** (scénario d'ouverture).
4. La rétention des métriques Prometheus ne consomme aucun espace disque significatif. — **Faux** (section "Erreur n°3").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une configuration statique des hôtes, qui fonctionne bien pour les serveurs classiques avec Zabbix (chapitre 59), échoue spécifiquement dans l'environnement Kubernetes du portail client.
2. Compare le rôle d'Alertmanager à celui des actions Zabbix (section 59.6) — en quoi remplissent-ils une fonction équivalente malgré des outils différents ?

**Corrigé 1** : un serveur classique, comme ceux supervisés par Zabbix au chapitre 59, conserve généralement la même adresse et la même identité pendant des mois voire des années — une configuration statique reste donc valide sur une longue durée. Un pod Kubernetes, en revanche, peut être créé et détruit en quelques minutes par le contrôleur de mise à l'échelle automatique (HPA, chapitre 44), avec une nouvelle adresse IP à chaque création. Une configuration statique deviendrait obsolète en quelques minutes dans ce contexte, nécessitant une mise à jour manuelle constante et intenable — exactement le problème observé dans le scénario d'ouverture, résolu par la découverte automatique des cibles (section 60.4), absente du modèle Zabbix classique.

**Corrigé 2** : les deux remplissent la même fonction fondamentale — transformer un seuil franchi (un trigger Zabbix ou une règle d'alerte Prometheus) en une notification effective acheminée vers un destinataire précis, empêchant qu'un problème détecté par le système de supervision ne reste invisible faute d'être communiqué à une personne capable d'agir. Cette équivalence fonctionnelle malgré des outils et des écosystèmes différents illustre un principe déjà rencontré à plusieurs reprises dans ce manuel : des outils distincts convergent souvent vers des concepts similaires pour résoudre le même problème fondamental, ici la nécessité qu'une alerte déclenchée trouve toujours un destinataire réel.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 60.1</span>

Explique pourquoi il serait inapproprié de migrer entièrement la supervision des serveurs Windows Server classiques (chapitres 5-13) de Zabbix vers Prometheus, uniquement par souci d'uniformité d'outillage.
</div>

**Corrigé :** Prometheus apporte un bénéfice réel principalement dans les environnements dynamiques où la découverte automatique des cibles change fréquemment la liste à surveiller — un avantage peu pertinent pour des serveurs Windows Server classiques dont l'identité et l'adresse restent stables sur de longues périodes. Migrer cette supervision vers Prometheus par simple souci d'uniformité apporterait une complexité supplémentaire (apprentissage de PromQL, gestion d'exporters Windows spécifiques) sans bénéfice correspondant, alors que Zabbix couvre déjà efficacement ce besoin avec un modèle plus simple pour ce contexte précis. Ce raisonnement rejoint le principe déjà établi au chapitre 49 : le bon outil dépend du contexte réel, pas d'une préférence pour l'uniformité en soi — la coexistence de deux outils bien positionnés reste préférable à un outil unique mal adapté à une partie de l'infrastructure.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 60.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant que la rétention des métriques Prometheus reste dimensionnée par rapport au stockage disponible, en t'appuyant sur le risque décrit à la section "Erreur n°3".
</div>

**Corrigé (exemple de réponse) :** La durée de rétention des métriques Prometheus sera fixée explicitement dès l'installation, en fonction du stockage disponible et du besoin réel d'historique, plutôt que laissée à sa valeur par défaut sans réflexion. L'espace disque du serveur Prometheus sera lui-même intégré au plan de supervision de l'infrastructure (chapitre 58), garantissant qu'une alerte serait déclenchée avant qu'il ne devienne critique, plutôt que de reproduire silencieusement l'incident du chapitre 58 avec l'outil de supervision lui-même. Toute augmentation significative du volume de métriques collectées (ajout d'un nouveau namespace, nouvel exporter) fera l'objet d'une revue de la capacité de stockage disponible avant sa mise en production.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi Prometheus complète Zabbix plutôt qu'il ne le remplace.</li>
<li>☐ Je sais expliquer la différence entre un modèle de collecte pull et un modèle push.</li>
<li>☐ Je sais expliquer le rôle d'un exporter Prometheus.</li>
<li>☐ Je comprends pourquoi la découverte automatique des cibles Kubernetes résout le problème du scénario d'ouverture.</li>
<li>☐ Je sais écrire une requête PromQL simple et une règle d'alerte avec clause `for`.</li>
<li>☐ Je sais diagnostiquer une cible affichée "down" dans Prometheus.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il connaître PromQL en profondeur pour commencer à utiliser Prometheus ?</dt>
<dd>Non, des requêtes simples comme celles présentées dans ce chapitre couvrent déjà une grande partie des besoins courants — une maîtrise plus fine du langage devient utile progressivement, à mesure que les besoins d'analyse se complexifient.</dd>

<dt>Prometheus peut-il superviser autre chose que Kubernetes ?</dt>
<dd>Oui, Prometheus peut superviser tout système exposant ses métriques via un exporter compatible, y compris des serveurs classiques — son usage n'est pas limité à Kubernetes, même si c'est dans ce contexte que sa découverte automatique apporte le bénéfice le plus net.</dd>

<dt>Que se passe-t-il si Prometheus lui-même tombe en panne ?</dt>
<dd>La collecte de métriques s'interrompt pendant la panne, créant un angle mort temporaire dans l'historique — une haute disponibilité de Prometheus lui-même, ou une solution de secours, devient pertinente pour les environnements où cette continuité est critique, un sujet qui rejoint les principes de haute disponibilité déjà couverts à la Partie 5.</dd>

<dt>Alertmanager peut-il regrouper plusieurs alertes similaires en une seule notification ?</dt>
<dd>Oui, cette capacité de regroupement (*grouping*) évite qu'un incident affectant simultanément plusieurs pods ne génère une notification distincte pour chacun, réduisant le bruit reçu par l'équipe tout en conservant l'information complète de l'incident.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Prometheus : [https://prometheus.io/docs/introduction/overview/](https://prometheus.io/docs/introduction/overview/)
- Prometheus — Documentation PromQL : [https://prometheus.io/docs/prometheus/latest/querying/basics/](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- Documentation officielle Alertmanager : [https://prometheus.io/docs/alerting/latest/alertmanager/](https://prometheus.io/docs/alerting/latest/alertmanager/)

*Chapitre suivant : Grafana — construire des tableaux de bord visuels combinant les données de Zabbix et de Prometheus dans une même interface, pour rendre l'état de santé de l'ensemble de l'infrastructure immédiatement lisible.*
