<div class="chapitre-titre-num">CHAPITRE 83</div>

# Conteneurisation et CI/CD du projet

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Étendre l'automatisation du chapitre précédent aux applications conteneurisées de l'entreprise, en répondant à un nouveau besoin applicatif du site récemment ouvert. À la fin de ce chapitre, tu sauras déployer une nouvelle application sur le cluster Kubernetes existant plutôt que d'en construire un nouveau, isoler cette application via un namespace dédié, et construire un pipeline CI/CD complet reprenant les fondations déjà établies aux chapitres 56 et 57.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'équipe commerciale du nouveau site demande un petit outil interne de suivi des prospects, distinct du portail client déjà en production. Un développeur propose de construire un nouveau cluster Kubernetes dédié à cette application, "pour ne pas risquer d'interférer avec le portail existant". Le DSI s'interroge : <em>"On a déjà un cluster Kubernetes opérationnel depuis la Partie 7, avec toute l'automatisation et la supervision qui vont avec. Pourquoi en construire un second, avec le double de maintenance, plutôt que d'isoler proprement cette nouvelle application sur celui qu'on a déjà ?"</em> Ce chapitre répond directement à cette question, en réutilisant systématiquement l'infrastructure conteneurisée déjà construite.
</div>

## 83.1 Le problème : une nouvelle application, quelle approche choisir

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du chapitre 39</span>
Exactement le même raisonnement déjà établi au chapitre 39 pour justifier la conteneurisation du portail client s'applique à ce nouvel outil interne — une application autonome, avec ses propres dépendances, bénéficie directement de la reproductibilité et de la portabilité déjà démontrées. La question posée par le DSI dans le scénario d'ouverture ne porte donc pas sur le choix de conteneuriser (déjà justifié), mais sur l'opportunité de dupliquer l'infrastructure Kubernetes plutôt que de réutiliser celle déjà en place.
</div>

## 83.2 Réutiliser le cluster existant plutôt qu'en construire un nouveau

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Répondre directement au scénario d'ouverture</span>
Un cluster Kubernetes supplémentaire dédié à une seule application modeste représente une duplication de maintenance, de supervision et de coûts difficilement justifiable — exactement le même raisonnement d'évitement de duplication déjà établi pour la configuration Terraform au chapitre 55. Le cluster existant, déjà supervisé (Prometheus, chapitre 60) et sécurisé (RBAC, chapitre 44), peut accueillir cette nouvelle application dans un **namespace** dédié, isolant ses ressources sans nécessiter une infrastructure entièrement distincte.
</div>

```bash
kubectl create namespace suivi-prospects
```

## 83.3 Isoler la nouvelle application via RBAC et quotas de ressources

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct du chapitre 44</span>
Le namespace dédié, combiné à des règles RBAC restreignant l'accès des équipes à leur propre namespace (rappel direct du chapitre 44) et à des quotas de ressources limitant la consommation CPU et mémoire de cette nouvelle application, empêche toute interférence avec le portail client existant sur le même cluster — répondant directement à la préoccupation légitime soulevée par le développeur dans le scénario d'ouverture, sans nécessiter la duplication complète d'infrastructure qu'il proposait initialement.
</div>

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: quota-suivi-prospects
  namespace: suivi-prospects
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
```

## 83.4 Le manifeste Kubernetes de la nouvelle application

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 43</span>
Le déploiement de cet outil de suivi des prospects reprend exactement la même structure de manifeste déjà établie pour le portail client au chapitre 43 — Deployment, Service, Ingress — appliquée simplement dans le nouveau namespace isolé, sans nécessiter de nouvelle méthodologie.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: suivi-prospects
  namespace: suivi-prospects
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: suivi-prospects
          image: registre-interne/suivi-prospects:1.0
          resources:
            requests: { cpu: "200m", memory: "256Mi" }
```
</div>

## 83.5 Un pipeline CI/CD réutilisant le Jenkinsfile déjà éprouvé

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 56</span>
Plutôt que de rédiger un nouveau Jenkinsfile depuis zéro, le pipeline de cette nouvelle application reprend la structure déjà éprouvée pour le portail client au chapitre 56 (checkout, build de l'image, scan de sécurité, déploiement) — seuls le nom de l'image et le namespace cible changent, exactement le même principe de réutilisation d'une configuration standard déjà rencontré à de nombreuses reprises dans ce manuel, du rôle Ansible au module Terraform.
</div>

## 83.6 Intégrer les scans DevSecOps dès le premier déploiement

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct du chapitre 57</span>
Contrairement à une application historique qui aurait pu être déployée avant l'adoption du pipeline DevSecOps, cette nouvelle application bénéficie dès son premier déploiement de l'ensemble des vérifications de sécurité déjà établies au chapitre 57 — analyse statique, scan de vulnérabilités de l'image, seuils de sévérité calibrés — un avantage direct de la maturité déjà atteinte par l'organisation, évitant de reproduire la dette de sécurité qu'une application plus ancienne aurait pu accumuler avant l'adoption de ces pratiques.
</div>

## 83.7 Valider face au cahier des charges du chapitre 80

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct des chapitres 80 et 81.7</span>
Avant de considérer ce déploiement comme terminé, vérifie qu'il répond bien aux exigences pertinentes du cahier des charges initial — notamment la contrainte de compétences et de budget limitées (section 80.6), largement respectée ici puisqu'aucune nouvelle infrastructure ni compétence supplémentaire n'a été nécessaire, l'ensemble reposant sur des outils déjà maîtrisés par l'équipe.
</div>

## Atelier — Déployer l'outil de suivi des prospects

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 83 — Répondre concrètement à la question du DSI</span>

**Objectif** : déployer le nouvel outil de suivi des prospects sur le cluster Kubernetes existant, isolé du portail client, via un pipeline CI/CD réutilisant les fondations déjà établies.

**Préparation** : le cluster Kubernetes et le pipeline Jenkins déjà opérationnels pour le portail client.

**Étapes détaillées** :

1. Crée le namespace dédié et le quota de ressources associé (sections 83.2-83.3).
2. Adapte le manifeste Kubernetes du portail client (chapitre 43) pour cette nouvelle application.
3. Adapte le Jenkinsfile du chapitre 56 pour ce nouveau pipeline, en conservant l'ensemble des étapes de sécurité du chapitre 57.
4. Vérifie que le namespace isolé empêche effectivement toute interférence de ressources avec le portail client existant.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la nouvelle application est déployée sur le cluster existant, isolée par un namespace dédié avec des quotas de ressources empêchant toute interférence avec le portail client, et protégée dès son premier déploiement par l'ensemble des vérifications de sécurité du pipeline DevSecOps. Aucune infrastructure supplémentaire n'a été nécessaire, répondant directement à la préoccupation du DSI dans le scénario d'ouverture — la réutilisation de l'existant, plutôt que la duplication, permet de répondre au nouveau besoin sans alourdir la charge de maintenance de l'équipe.

**Dépannage** : si l'application consomme davantage de ressources que prévu et approche la limite du quota configuré, ajuste le quota après analyse du besoin réel plutôt que de le supprimer entièrement — un quota généreux mais toujours présent reste préférable à une absence totale de limite, qui recréerait le risque d'interférence que ce chapitre cherche précisément à éviter.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — construire un cluster Kubernetes séparé pour chaque nouvelle application</span>
Rappel du scénario d'ouverture : une duplication de maintenance et de coûts rarement justifiée pour une application de taille modeste, alors qu'un namespace isolé répond généralement au même besoin d'isolation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un déploiement sans namespace dédié ni quota de ressources</span>
Rappel de la section 83.3 : une application partageant le même namespace que le portail client sans isolation appropriée risque de consommer des ressources au détriment du service critique existant.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — un pipeline CI/CD copié-collé sans reprendre les étapes de sécurité déjà établies</span>
Rappel de la section 83.6 : une nouvelle application déployée sans les vérifications DevSecOps déjà maîtrisées par l'organisation reproduirait volontairement une lacune de sécurité pourtant déjà résolue pour les autres applications.
</div>

## Diagnostiquer une nouvelle application qui interfère avec le portail client

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les performances du portail client se dégradent après le déploiement d'une nouvelle application sur le même cluster Kubernetes</span>

- **Diagnostic** : vérifier si la nouvelle application dispose bien d'un namespace dédié avec des quotas de ressources appropriés, ou si elle consomme des ressources sans limite définie, au détriment des autres charges de travail du cluster.
- **Comment vérifier** : consulter les métriques Prometheus déjà en place (chapitre 60) pour comparer la consommation réelle de ressources de chaque namespace du cluster.
- **Résolution** : définir ou ajuster un quota de ressources approprié pour la nouvelle application, contenant sa consommation dans des limites raisonnables sans affecter les autres charges de travail critiques du cluster.
</div>

## En entreprise

- **Bonne pratique répandue** : évaluer systématiquement, pour tout nouveau besoin applicatif, si l'infrastructure conteneurisée existante peut l'accueillir avant d'envisager une nouvelle infrastructure dédiée, réservant cette dernière option aux cas où un besoin d'isolation radicale (réglementaire ou technique) le justifie réellement.
- **Bonne pratique répandue** : maintenir un modèle de pipeline CI/CD réutilisable et documenté, réduisant le temps de mise en place pour toute nouvelle application plutôt que de repartir de zéro à chaque fois.
- **Erreur classique observée** : une prolifération de petits clusters Kubernetes dédiés, chacun pour une application unique, résultant d'une succession de décisions individuellement raisonnables mais collectivement coûteuses en maintenance — un piège que la réutilisation systématique de l'infrastructure existante permet d'éviter dès le départ.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi privilégier un namespace dédié sur un cluster Kubernetes existant plutôt que de construire un nouveau cluster pour chaque nouvelle application ?"**
Réponse attendue : un namespace, combiné à des règles RBAC et des quotas de ressources appropriés, offre une isolation suffisante pour la plupart des besoins sans dupliquer la maintenance, la supervision et les coûts d'une infrastructure Kubernetes entièrement distincte.

**Q2. "Quel est l'avantage de réutiliser un Jenkinsfile déjà éprouvé plutôt que d'en écrire un nouveau pour chaque application ?"**
Réponse attendue : garantir que la nouvelle application bénéficie directement des mêmes étapes de sécurité et de qualité déjà validées pour d'autres applications, tout en réduisant le temps de mise en place, exactement le même principe de réutilisation déjà établi pour les rôles Ansible et les modules Terraform.

**Q3. "Pourquoi un quota de ressources reste-t-il nécessaire même lorsqu'une application est isolée dans son propre namespace ?"**
Réponse attendue : le namespace isole les ressources logiquement, mais sans quota explicite, une application peut toujours consommer une part disproportionnée des ressources physiques partagées du cluster, affectant potentiellement d'autres charges de travail critiques comme le portail client.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Applique systématiquement le pipeline DevSecOps déjà établi à toute nouvelle application déployée, dès son premier déploiement — évitant l'accumulation d'une dette de sécurité qu'une application plus ancienne, déployée avant l'adoption de ces pratiques, pourrait avoir accumulée.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente et maintiens un modèle de manifeste Kubernetes et de Jenkinsfile réutilisable, réduisant le temps de mise en place et garantissant une cohérence de configuration entre toutes les applications de l'organisation.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Dimensionne les quotas de ressources selon le besoin réel de chaque application, évitant à la fois une contrainte trop stricte limitant inutilement les performances et une absence de limite risquant d'affecter les autres charges de travail du cluster partagé.
</div>

## Résumé du chapitre

- Une nouvelle application bénéficie généralement de la conteneurisation, exactement pour les mêmes raisons déjà établies pour le portail client au chapitre 39.
- Réutiliser le cluster Kubernetes existant, via un namespace dédié, évite la duplication de maintenance qu'impliquerait un nouveau cluster séparé.
- Le RBAC et les quotas de ressources isolent efficacement une nouvelle application, empêchant toute interférence avec les charges de travail existantes.
- Le manifeste Kubernetes et le pipeline CI/CD réutilisent directement les structures déjà établies aux chapitres 43 et 56.
- Le pipeline DevSecOps s'applique dès le premier déploiement de toute nouvelle application, évitant l'accumulation d'une dette de sécurité.
- Chaque nouveau déploiement doit être vérifié par rapport au cahier des charges initial du projet, notamment ses contraintes de ressources et de compétences.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour une nouvelle application de taille modeste, la recommandation générale est de :
   - a) Toujours construire un nouveau cluster Kubernetes dédié
   - b) Réutiliser le cluster existant via un namespace isolé, sauf besoin d'isolation radicale
   - c) Éviter systématiquement la conteneurisation
   - d) Déployer sans aucune vérification de sécurité pour accélérer la mise en production

2. Un quota de ressources sur un namespace Kubernetes sert principalement à :
   - a) Chiffrer les données de l'application
   - b) Empêcher une application de consommer une part disproportionnée des ressources partagées du cluster
   - c) Remplacer le besoin de RBAC
   - d) Accélérer automatiquement le démarrage des pods

3. Réutiliser un Jenkinsfile déjà éprouvé pour une nouvelle application permet principalement de :
   - a) Éliminer le besoin de toute vérification de sécurité
   - b) Garantir une cohérence de qualité et de sécurité, tout en réduisant le temps de mise en place
   - c) Remplacer le besoin d'un manifeste Kubernetes
   - d) Réduire automatiquement la consommation de ressources de l'application

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un nouveau cluster Kubernetes dédié est systématiquement la meilleure approche pour toute nouvelle application. — **Faux** (section 83.2).
2. Un namespace isolé suffit à lui seul, sans quota de ressources, à empêcher toute interférence entre applications sur un cluster partagé. — **Faux** (section "Diagnostiquer").
3. Une nouvelle application déployée pour la première fois peut bénéficier dès le départ de l'ensemble des vérifications de sécurité du pipeline DevSecOps déjà établies. — **Vrai** (section 83.6).
4. Le manifeste Kubernetes d'une nouvelle application nécessite une méthodologie entièrement différente de celle du portail client. — **Faux** (section 83.4).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la proposition initiale du développeur, dans le scénario d'ouverture, de construire un nouveau cluster Kubernetes séparé, part d'une préoccupation légitime mais aboutit à une solution disproportionnée.
2. Un collègue affirme qu'une fois le namespace et le quota de ressources correctement configurés, aucune autre mesure de sécurité n'est nécessaire pour cette nouvelle application. Discute cette affirmation.

**Corrigé 1** : la préoccupation du développeur — éviter toute interférence avec le portail client, un service critique de l'entreprise — est parfaitement légitime et rejoint directement les principes de sécurité et de stabilité déjà établis dans ce manuel. Cependant, sa solution proposée (un cluster entièrement séparé) répond à ce besoin d'isolation de façon disproportionnée, ignorant que Kubernetes offre déjà des mécanismes natifs d'isolation (namespace, RBAC, quotas de ressources) suffisants pour la grande majorité des cas, sans nécessiter la duplication complète de l'infrastructure. Le DSI ne rejette pas la préoccupation de fond, mais oriente vers une solution proportionnée au besoin réel — exactement le même type d'arbitrage pragmatique déjà rencontré à de nombreuses reprises dans ce manuel entre sophistication technique et besoin réel du contexte.

**Corrigé 2** : cette affirmation est incorrecte — le namespace et le quota de ressources isolent la consommation de ressources et les accès administratifs, mais ne couvrent en rien la sécurité du contenu de l'application elle-même (vulnérabilités du code, de ses dépendances, de l'image Docker utilisée). Ces aspects restent couverts par le pipeline DevSecOps du chapitre 57 (section 83.6) — analyse statique du code, scan de vulnérabilités de l'image — une couche de protection distincte et complémentaire à l'isolation Kubernetes, pas remplacée par elle. Une application isolée dans son namespace mais construite à partir d'une image contenant une vulnérabilité critique connue resterait tout aussi exposée à une exploitation que si elle n'était pas isolée du tout, l'isolation Kubernetes ne protégeant pas contre une faille exploitée directement au sein de l'application elle-même.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 83.1</span>

Propose une checklist de trois vérifications à effectuer avant de considérer qu'une nouvelle application est prête à être déployée sur le cluster Kubernetes existant, en synthétisant les principes de ce chapitre.
</div>

**Corrigé :** 1) Un namespace dédié a été créé avec un quota de ressources approprié, évitant toute interférence avec les autres charges de travail du cluster (sections 83.2-83.3). 2) Le pipeline CI/CD réutilise la structure déjà éprouvée du Jenkinsfile existant, incluant l'ensemble des étapes de sécurité du pipeline DevSecOps du chapitre 57 (sections 83.5-83.6). 3) Le déploiement a été explicitement vérifié par rapport aux exigences pertinentes du cahier des charges initial du chapitre 80, notamment ses contraintes de ressources et de compétences (section 83.7). Cette checklist synthétise les trois dimensions couvertes dans ce chapitre — isolation technique, sécurité du pipeline, et conformité au cadre de référence du projet — avant tout déploiement définitif.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 83.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucune nouvelle application n'entraîne la création d'un cluster Kubernetes séparé sans justification explicite, en t'appuyant sur le risque décrit à la section "En entreprise".
</div>

**Corrigé (exemple de réponse) :** Toute proposition de création d'un nouveau cluster Kubernetes dédié à une application spécifique devra être justifiée explicitement par un besoin d'isolation ne pouvant pas être satisfait par un namespace dédié avec RBAC et quotas de ressources appropriés sur le cluster existant. Cette justification sera soumise à validation du DSI ou d'un responsable technique équivalent avant tout engagement de ressources pour une nouvelle infrastructure. Par défaut, toute nouvelle application de taille modeste sera déployée sur le cluster existant via un namespace isolé, évitant la prolifération de petits clusters dédiés qui, cumulés au fil du temps, représenteraient une charge de maintenance disproportionnée par rapport aux besoins réels de l'organisation.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi réutiliser un cluster Kubernetes existant est généralement préférable à en construire un nouveau.</li>
<li>☐ Je sais isoler une nouvelle application via un namespace dédié, RBAC et des quotas de ressources.</li>
<li>☐ Je sais adapter un manifeste Kubernetes déjà éprouvé pour une nouvelle application.</li>
<li>☐ Je sais réutiliser un Jenkinsfile existant pour un nouveau pipeline CI/CD.</li>
<li>☐ Je comprends pourquoi le pipeline DevSecOps doit s'appliquer dès le premier déploiement d'une nouvelle application.</li>
<li>☐ Je sais vérifier un nouveau déploiement par rapport au cahier des charges initial du projet.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Dans quels cas un cluster Kubernetes séparé reste-t-il réellement justifié ?</dt>
<dd>Un besoin d'isolation réglementaire stricte, une exigence de résilience totalement indépendante du cluster principal, ou une différence radicale de cycle de vie ou de criticité entre applications peuvent justifier un cluster séparé — des cas réels mais nettement moins fréquents que ce que suggère une réaction instinctive à un nouveau besoin applicatif.</dd>

<dt>Faut-il un pipeline CI/CD distinct pour chaque environnement (développement, test, production) de cette nouvelle application ?</dt>
<dd>Oui, généralement, rejoignant le même principe de séparation par environnement déjà établi pour Terraform au chapitre 55 — un déploiement en production ne devrait jamais partager exactement le même pipeline sans étape de validation qu'un déploiement en développement.</dd>

<dt>Comment estimer les quotas de ressources appropriés pour une nouvelle application avant son déploiement réel ?</dt>
<dd>Une estimation initiale prudente, ajustée ensuite sur la base des métriques réelles observées après déploiement (rappel du chapitre 60), reste plus réaliste qu'une tentative de dimensionnement parfait dès le départ sans données réelles d'usage.</dd>

<dt>Cette nouvelle application nécessite-t-elle sa propre entrée dans le SIEM déjà établi au chapitre 74 ?</dt>
<dd>Oui, ses journaux et événements de sécurité devraient être intégrés au SIEM existant au même titre que les autres applications de l'organisation, un point qui sera approfondi au chapitre 85 consacré à la supervision et la sécurisation de bout en bout de l'ensemble du projet.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Kubernetes — Resource Quotas : rappel des chapitres 43-44 de ce manuel.
- Documentation officielle Jenkins — Pipeline as Code : rappel du chapitre 56 de ce manuel.

*Chapitre suivant : le composant cloud hybride — étendre l'infrastructure du projet vers le cloud public, en s'appuyant sur les principes multi-cloud déjà établis à la Partie 8 de ce manuel.*
