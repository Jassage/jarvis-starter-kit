<div class="chapitre-titre-num">CHAPITRE 43</div>

# Kubernetes en pratique

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Déployer réellement l'application du portail sur un cluster Kubernetes, au-delà du vocabulaire théorique du chapitre 42 : écrire des manifestes complets, gérer la configuration et les secrets, exécuter et observer une mise à jour progressive réelle, et faire persister les données au-delà du cycle de vie d'un Pod. À la fin de ce chapitre, tu sauras déployer, mettre à jour, revenir en arrière et redimensionner une application sur Kubernetes avec confiance.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le cluster Kubernetes décidé au chapitre précédent est provisionné. Le développeur du portail, encore hésitant face au nouveau vocabulaire, demande une démonstration concrète avant de faire confiance à l'outil pour la production : <em>"Montre-moi que ça marche vraiment — que je peux déployer une mise à jour sans coupure, et que si je me trompe, je peux revenir en arrière facilement."</em> Ce chapitre construit cette démonstration pas à pas, du premier manifeste jusqu'au rollback réel.
</div>

## 43.1 Le manifeste complet : Deployment et Service

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portail-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: portail
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: portail
    spec:
      containers:
        - name: portail
          image: portail-client:1.0
          ports:
            - containerPort: 3000
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: portail-service
spec:
  selector:
    app: portail
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

<div class="encadre astuce">
<span class="encadre-titre">💡 `maxUnavailable` et `maxSurge` : le réglage fin de la mise à jour progressive</span>
Rappel direct du chapitre 42 : ces deux paramètres contrôlent précisément le rythme du <em>rolling update</em>. <code>maxUnavailable: 1</code> garantit qu'au maximum un seul Pod peut être indisponible pendant la transition (sur 3 réplicas, au moins 2 restent toujours actifs) ; <code>maxSurge: 1</code> autorise un Pod supplémentaire temporaire pendant la mise à jour, accélérant la transition sans jamais descendre sous la capacité minimale garantie.
</div>

## 43.2 Appliquer les manifestes : Infrastructure as Code appliquée à Kubernetes

```
# Appliquer un ou plusieurs manifestes -- cree ou met a jour les
# objets decrits pour correspondre exactement a ce fichier
kubectl apply -f deployment.yaml -f service.yaml

# Verifier l'etat apres application
kubectl get deployments
kubectl get services
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours modifier le manifeste, jamais l'objet en direct</span>
Une commande comme `kubectl edit deployment portail-app` permet de modifier un objet directement dans le cluster — mais cette modification n'existe alors que dans le cluster, absente du fichier YAML versionné dans Git. Exactement le même principe déjà établi pour Docker Compose (chapitre 41) et les scripts (chapitre 20) : toute modification doit passer par le fichier source, jamais directement sur le système en production, sous peine de dérive de configuration où plus personne ne sait exactement ce qui tourne réellement par rapport à ce qui est documenté.
</div>

## 43.3 ConfigMap et Secret : configuration et secrets Kubernetes

```yaml
# configmap.yaml -- rappel direct du chapitre 12 sur les variables
# d'environnement, transpose a Kubernetes
apiVersion: v1
kind: ConfigMap
metadata:
  name: portail-config
data:
  DATABASE_HOST: "portail-db-service"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un Secret Kubernetes n'est PAS chiffré par défaut — un piège de sécurité réel et bien documenté</span>
Un objet **Secret** Kubernetes encode ses valeurs en **base64**, pas en chiffrement — base64 est un simple encodage réversible en une commande (`echo "..." | base64 -d`), pas une protection cryptographique. Un Secret Kubernetes, dans sa configuration par défaut, offre une séparation logique commode de la configuration sensible, mais **pas** une confidentialité réelle face à quiconque a accès à `etcd` (chapitre 42) ou aux permissions de lecture sur cet objet. Un chiffrement réel au repos nécessite une configuration supplémentaire explicite (chiffrement d'etcd, ou un gestionnaire de secrets externe intégré, approfondi en Partie 9) — un piège largement documenté dans l'industrie, responsable de fuites de secrets bien réelles quand cette limitation est ignorée.
</div>

```
# Creer un Secret (le contenu sera encode en base64, PAS chiffre)
kubectl create secret generic portail-db-secret \
  --from-literal=DB_PASSWORD='mot-de-passe-a-proteger'
```

## 43.4 Observer une mise à jour progressive réelle

```
# Declencher une mise a jour en changeant la version de l'image
kubectl set image deployment/portail-app portail=portail-client:1.1

# Observer le deroulement en temps reel
kubectl rollout status deployment/portail-app

# Consulter l'historique des deploiements
kubectl rollout history deployment/portail-app

# Revenir a la version precedente si un probleme est detecte
kubectl rollout undo deployment/portail-app
```

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — la réponse concrète à la demande du développeur</span>
Cette séquence répond exactement à la demande du scénario d'ouverture : `kubectl rollout status` permet d'observer, Pod par Pod, la transition progressive sans jamais tomber sous la capacité minimale garantie par `maxUnavailable`. Si la nouvelle version (`1.1`) présente un problème détecté après coup, `kubectl rollout undo` revient à la version précédente en quelques secondes, exactement le filet de sécurité recherché — un plan de retour arrière quasi instantané, très différent d'une restauration de sauvegarde classique (chapitre 30) qui prendrait bien plus de temps.
</div>

## 43.5 Redimensionner : démonstration concrète de l'élasticité

```
# Augmenter manuellement le nombre de replicas, par exemple
# en prevision d'un pic de trafic annonce
kubectl scale deployment/portail-app --replicas=6
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Une réponse directe et immédiate au trafic accru du chapitre 42</span>
Cette seule commande répond directement au problème de saturation qui a motivé l'adoption de Kubernetes au chapitre 42 — répartir la charge sur davantage de réplicas, à condition que le cluster dispose de nœuds avec suffisamment de capacité disponible (rappel de la surveillance de la surallocation déjà établie au chapitre 33, applicable ici au niveau du cluster entier).
</div>

## 43.6 Faire persister les données : PersistentVolume et PersistentVolumeClaim

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le même besoin que le volume Docker du chapitre 40, à une échelle supérieure</span>
Un **PersistentVolume** (PV) représente un espace de stockage réel, souvent fourni par le SAN déjà déployé au chapitre 29. Un **PersistentVolumeClaim** (PVC) est la demande qu'un Pod formule pour obtenir ce stockage — exactement le même besoin de faire persister des données au-delà du cycle de vie éphémère d'un conteneur, déjà résolu par les volumes Docker au chapitre 40, transposé ici à l'échelle d'un cluster multi-nœuds.
</div>

```yaml
# pvc.yaml -- pour la base de donnees PostgreSQL du portail
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: portail-db-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — sans PVC, les données disparaissent avec le Pod</span>
Rappel direct du chapitre 40 : un Pod sans PersistentVolumeClaim stocke ses données dans une couche éphémère, perdue à sa suppression ou à son remplacement lors d'une mise à jour — exactement le même piège déjà dénoncé pour les conteneurs Docker isolés, transposé ici à Kubernetes sans aucune exception à cette règle.
</div>

## 43.7 Namespaces : organiser plusieurs environnements dans un même cluster

```
# Creer des namespaces distincts pour separer les environnements
kubectl create namespace developpement
kubectl create namespace production

# Deployer dans un namespace precis
kubectl apply -f deployment.yaml -n production
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — isoler les environnements, même au sein du même cluster</span>
Les **namespaces** permettent de séparer logiquement plusieurs environnements ou projets (développement, test, production) au sein d'un même cluster physique, chacun avec ses propres objets, ses propres quotas de ressources, et des permissions d'accès potentiellement distinctes — un principe de segmentation qui rejoint directement l'esprit de la philosophie Zero Trust déjà établie au chapitre 26.
</div>

## Atelier — Déployer et tester un rollback réel pour le portail

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 43 — Répondre concrètement à la demande du développeur</span>

**Objectif** : construire et exécuter la démonstration demandée dans le scénario d'ouverture : un déploiement, une mise à jour progressive, et un retour en arrière.

**Préparation** : accès à un cluster Kubernetes de test (par exemple minikube ou k3s sur un lab, rappel du chapitre 37), ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige les manifestes Deployment, Service et PersistentVolumeClaim nécessaires pour le portail complet (application et base de données).
2. Rédige la séquence de commandes pour appliquer ces manifestes, déclencher une mise à jour vers une nouvelle version, et l'observer.
3. Rédige la commande pour simuler un problème détecté après la mise à jour et revenir à la version précédente.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : `kubectl apply -f deployment.yaml -f service.yaml -f pvc.yaml` déploie l'ensemble. `kubectl set image deployment/portail-app portail=portail-client:1.1` puis `kubectl rollout status deployment/portail-app` déclenchent et observent la mise à jour progressive, sans jamais interrompre totalement le service (contrairement à la coupure du scénario d'ouverture du chapitre 42). `kubectl rollout undo deployment/portail-app` revient à la version précédente en quelques secondes si un problème est détecté — la démonstration complète répondant exactement à la demande initiale du développeur.

**Dépannage** : si `kubectl rollout status` semble bloqué indéfiniment, vérifie l'état des Pods avec `kubectl get pods` et leurs journaux avec `kubectl logs` (chapitre 42) — un blocage indique généralement que les nouveaux Pods n'arrivent pas à démarrer correctement, empêchant la suite normale de la transition progressive.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — modifier un objet Kubernetes en direct plutôt que le manifeste</span>
Rappel de la section 43.2 : une dérive de configuration invisible se crée immédiatement entre ce qui tourne réellement dans le cluster et ce que le fichier versionné décrit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — considérer un Secret Kubernetes comme réellement chiffré par défaut</span>
Rappel de la section 43.3 : base64 n'est pas un chiffrement — un piège de sécurité bien documenté et régulièrement responsable de fuites réelles dans l'industrie.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — oublier un PersistentVolumeClaim pour une base de données</span>
Rappel de la section 43.6 : sans PVC, les données disparaissent exactement comme un conteneur Docker sans volume (chapitre 40) — une erreur aux conséquences potentiellement irréversibles.
</div>

## Diagnostiquer un déploiement qui échoue

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : `kubectl rollout status` reste bloqué, la mise à jour ne progresse pas</span>

- **Diagnostic** : les nouveaux Pods de la version cible n'atteignent probablement jamais un état sain, empêchant Kubernetes de poursuivre le remplacement progressif des anciens Pods.
- **Comment vérifier** : `kubectl get pods` révèle l'état de chaque Pod (`CrashLoopBackOff`, `ImagePullBackOff`...) ; `kubectl describe pod nom-du-pod` et `kubectl logs nom-du-pod` (chapitre 42) précisent la cause exacte.
- **Résolution** : corriger la cause identifiée (image introuvable, erreur de configuration, healthcheck échoué) puis relancer la mise à jour, ou exécuter `kubectl rollout undo` immédiatement pour revenir à un état stable connu pendant l'investigation, sans laisser le service dans un état incertain plus longtemps que nécessaire.
</div>

## En entreprise

- **Bonne pratique répandue** : versionner l'ensemble des manifestes Kubernetes dans Git, avec une revue avant tout changement significatif — exactement la même rigueur déjà appliquée aux Dockerfile (chapitre 40) et aux fichiers Compose (chapitre 41).
- **Bonne pratique répandue** : utiliser un gestionnaire de secrets externe intégré à Kubernetes (approfondi en Partie 9) plutôt que de se fier uniquement aux Secrets natifs encodés en base64, pour toute donnée réellement sensible en production.
- **Erreur classique observée** : une équipe qui découvre, lors d'un audit de sécurité, que des secrets de production stockés en Secrets Kubernetes natifs étaient lisibles en clair par quiconque avait accès en lecture à `etcd` ou aux objets du namespace concerné — une découverte tardive et évitable avec la connaissance de la section 43.3.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment déclenches-tu et surveilles-tu une mise à jour progressive sur Kubernetes ?"**
Réponse attendue : `kubectl set image` (ou une mise à jour du manifeste suivie de `kubectl apply`) déclenche la mise à jour ; `kubectl rollout status` permet de suivre sa progression en temps réel ; `kubectl rollout undo` permet un retour rapide à la version précédente en cas de problème détecté.

**Q2. "Un Secret Kubernetes protège-t-il réellement un mot de passe contre toute lecture ?"**
Réponse attendue : non, par défaut un Secret encode simplement sa valeur en base64, un encodage réversible en une seule commande, pas un chiffrement — une configuration supplémentaire (chiffrement d'etcd ou gestionnaire de secrets externe) est nécessaire pour une protection réelle, un piège de sécurité fréquemment mal compris.

**Q3. "Que se passe-t-il si un Pod avec des données importantes est supprimé sans PersistentVolumeClaim ?"**
Réponse attendue : les données stockées dans la couche éphémère du Pod sont définitivement perdues, exactement comme un conteneur Docker sans volume monté (chapitre 40) — un PersistentVolumeClaim doit être explicitement configuré pour que les données survivent au remplacement ou à la suppression du Pod.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne considère jamais un Secret Kubernetes natif comme suffisant pour une donnée réellement critique sans configuration de chiffrement supplémentaire — le réflexe de vigilance le plus important de ce chapitre, à ne jamais négliger en production.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Modifie toujours le manifeste source avant d'appliquer un changement (`kubectl apply`), jamais l'objet en direct via `kubectl edit` — le même principe d'Infrastructure as Code déjà établi pour Docker Compose, prolongé ici sans exception.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Ajuste `maxUnavailable` et `maxSurge` selon la criticité réelle du service et la capacité disponible du cluster — un réglage trop agressif de `maxSurge` peut temporairement solliciter davantage de ressources que le cluster n'en dispose, ralentissant ou bloquant la mise à jour elle-même.
</div>

## Résumé du chapitre

- Un manifeste complet combine généralement Deployment (réplicas, stratégie de mise à jour) et Service (accès stable) pour une application donnée.
- Tout changement doit passer par une modification du manifeste suivie de `kubectl apply`, jamais une modification directe en production, sous peine de dérive de configuration.
- Un Secret Kubernetes encode ses valeurs en base64, pas en chiffrement réel — un piège de sécurité fréquemment mal compris qui nécessite une configuration supplémentaire pour une vraie protection.
- `kubectl rollout status`, `history` et `undo` permettent d'observer une mise à jour progressive et de revenir rapidement en arrière en cas de problème.
- Un PersistentVolumeClaim est indispensable pour faire persister des données au-delà du cycle de vie d'un Pod, exactement comme un volume Docker au chapitre 40.
- Les namespaces isolent plusieurs environnements ou projets au sein d'un même cluster.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `kubectl rollout undo` sert à :
   - a) Supprimer définitivement un Deployment
   - b) Revenir à la version précédente d'un Deployment
   - c) Créer un nouveau namespace
   - d) Chiffrer un Secret

2. Un Secret Kubernetes, par défaut :
   - a) Chiffre réellement ses valeurs
   - b) Encode ses valeurs en base64, sans chiffrement réel
   - c) Ne peut jamais être lu par personne
   - d) Est automatiquement supprimé après 24 heures

3. Sans PersistentVolumeClaim, les données d'un Pod :
   - a) Sont automatiquement sauvegardées ailleurs
   - b) Disparaissent à la suppression ou au remplacement du Pod
   - c) Sont répliquées sur tous les nœuds du cluster
   - d) Deviennent en lecture seule

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Modifier un objet Kubernetes directement avec `kubectl edit` est équivalent à modifier le manifeste source. — **Faux** (crée une dérive de configuration, section 43.2).
2. `maxUnavailable` et `maxSurge` contrôlent le rythme d'une mise à jour progressive. — **Vrai**.
3. Un namespace Kubernetes permet d'isoler logiquement plusieurs environnements au sein d'un même cluster. — **Vrai**.
4. `kubectl scale` nécessite de réécrire entièrement le manifeste du Deployment. — **Faux** (une commande directe suffit, section 43.5, bien qu'il reste recommandé de refléter ce changement dans le manifeste source ensuite).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi `kubectl rollout undo` constitue un filet de sécurité plus rapide qu'une restauration de sauvegarde classique (chapitre 30) pour corriger un déploiement problématique.
2. Reprends le scénario d'ouverture. Explique comment la démonstration de ce chapitre répond concrètement aux deux exigences du développeur (mise à jour sans coupure, retour en arrière facile).

**Corrigé 1** : `kubectl rollout undo` ne restaure pas des données depuis une sauvegarde externe — il redéploie simplement la version précédente de l'application, déjà connue et déjà construite, via le même mécanisme de mise à jour progressive que le déploiement initial. Cette opération se mesure en quelques secondes à quelques minutes, bien plus rapide qu'une restauration de sauvegarde complète (chapitre 30), qui implique généralement de récupérer et de réappliquer des données depuis un stockage externe — les deux mécanismes restent complémentaires, le rollback couvrant les problèmes de version applicative, la sauvegarde couvrant la perte de données réelle.

**Corrigé 2** : la stratégie `RollingUpdate` avec `maxUnavailable: 1` (section 43.1) garantit qu'au moins deux des trois réplicas restent toujours disponibles pendant toute mise à jour, éliminant la coupure totale vécue avec Docker Compose au chapitre 42 — la première exigence est directement satisfaite. `kubectl rollout undo` (section 43.4) permet un retour à la version précédente en une seule commande, sans reconstruction ni redéploiement manuel complexe — la seconde exigence, un retour en arrière facile, est également directement satisfaite par cette même fonctionnalité native de Kubernetes.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.1</span>

Un Deployment est configuré avec `replicas: 4`, `maxUnavailable: 2` et `maxSurge: 0`. Explique combien de Pods au minimum restent disponibles pendant une mise à jour, et pourquoi ce réglage pourrait être risqué pour un service critique.
</div>

**Corrigé :** Avec `maxUnavailable: 2` sur 4 réplicas, seulement 2 Pods minimum restent garantis disponibles pendant la transition (la moitié de la capacité normale) — un réglage qui pourrait s'avérer risqué pour un service critique à fort trafic, où cette réduction de moitié de la capacité pourrait provoquer une dégradation de performance notable ou une incapacité à absorber la charge normale pendant toute la durée de la mise à jour. Un réglage plus prudent pour un service critique privilégierait un `maxUnavailable` plus faible (comme `1`, l'exemple de la section 43.1), quitte à ce que la mise à jour progresse plus lentement, pour garantir une capacité de service plus proche de la normale à tout moment de la transition.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.2</span>

Rédige, en 3 à 5 phrases, pourquoi la découverte que les Secrets Kubernetes ne sont pas chiffrés par défaut (section 43.3) devrait modifier la façon dont une équipe évalue la sécurité globale de son cluster.
</div>

**Corrigé (exemple de réponse) :** Cette découverte signifie que la sécurité réelle des secrets d'une application dépend directement du contrôle d'accès au cluster lui-même (qui peut lire les objets Secret, qui a accès à etcd) — pas seulement de l'existence formelle d'un objet nommé "Secret", dont le nom pourrait laisser croire à tort à une protection automatique. Une équipe devrait donc évaluer explicitement qui dispose des permissions de lecture sur les Secrets de production (rejoignant le principe du moindre privilège du chapitre 1), et envisager sérieusement un chiffrement d'etcd ou un gestionnaire de secrets externe pour toute donnée réellement critique, plutôt que de se reposer sur une fausse impression de sécurité procurée par le simple nom de l'objet Kubernetes utilisé.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un manifeste Deployment et Service complet.</li>
<li>☐ Je sais appliquer des manifestes avec `kubectl apply -f`, sans jamais modifier un objet en direct.</li>
<li>☐ Je comprends qu'un Secret Kubernetes natif n'est pas chiffré par défaut, seulement encodé en base64.</li>
<li>☐ Je sais déclencher, observer et annuler une mise à jour progressive (`rollout status`, `undo`).</li>
<li>☐ Je sais redimensionner un Deployment avec `kubectl scale`.</li>
<li>☐ Je sais pourquoi un PersistentVolumeClaim est nécessaire pour faire persister des données.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on tester tout ce chapitre sans un vrai cluster de production ?</dt>
<dd>Oui, des outils comme minikube ou k3s permettent de créer un cluster Kubernetes local à des fins d'apprentissage (rejoignant l'esprit du lab VirtualBox du chapitre 37), sur lequel l'ensemble des commandes de ce chapitre peuvent être pratiquées sans risque avant toute application en production.</dd>

<dt>Faut-il toujours créer un PersistentVolume manuellement, ou existe-t-il une automatisation ?</dt>
<dd>De nombreux environnements Kubernetes (notamment chez les fournisseurs cloud) proposent le provisionnement dynamique : un PersistentVolume est automatiquement créé en réponse à un PersistentVolumeClaim, sans intervention manuelle préalable — une facilité pratique, tout en gardant à l'esprit le principe fondamental de persistance de la section 43.6.</dd>

<dt>`kubectl scale` est-il la seule façon d'ajuster automatiquement le nombre de réplicas selon la charge ?</dt>
<dd>Non, Kubernetes propose aussi l'HPA (*Horizontal Pod Autoscaler*), qui ajuste automatiquement le nombre de réplicas selon des métriques observées (comme l'utilisation CPU) — `kubectl scale` reste utile pour un ajustement manuel ponctuel, tandis que l'HPA automatise cette décision en continu, un sujet approfondi au chapitre 44.</dd>

<dt>Comment savoir si mon cluster a suffisamment de capacité pour un `kubectl scale` donné ?</dt>
<dd>`kubectl describe nodes` révèle la capacité et l'utilisation actuelle de chaque nœud — un rappel direct de la surveillance de la surallocation déjà établie au chapitre 33, transposée ici à l'échelle du cluster Kubernetes plutôt qu'à un seul hôte de virtualisation.</dd>
</dl>

## Références et pour aller plus loin

- Kubernetes — Documentation sur les Deployments : [https://kubernetes.io/fr/docs/concepts/workloads/controllers/deployment/](https://kubernetes.io/fr/docs/concepts/workloads/controllers/deployment/)
- Kubernetes — Documentation sur les Secrets et leurs limites : [https://kubernetes.io/fr/docs/concepts/configuration/secret/](https://kubernetes.io/fr/docs/concepts/configuration/secret/)
- Kubernetes — Documentation sur les PersistentVolumes : [https://kubernetes.io/fr/docs/concepts/storage/persistent-volumes/](https://kubernetes.io/fr/docs/concepts/storage/persistent-volumes/)

*Chapitre suivant : Kubernetes en production — Ingress, gestion sécurisée des secrets, autoscaling et RBAC, pour finaliser une infrastructure Kubernetes réellement prête pour un usage critique.*
