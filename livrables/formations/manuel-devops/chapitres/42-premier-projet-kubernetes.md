<div class="chapitre-titre-num">CHAPITRE 42 · 🔴 PROFESSIONNEL</div>

# Premier projet Kubernetes

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Déployer progressivement une architecture React + API + PostgreSQL sur un cluster Kubernetes local, chaque fichier YAML expliqué ligne par ligne. Ce chapitre transforme le vocabulaire du chapitre 41 en une architecture réellement fonctionnelle, exactement la traduction préparée à l'atelier 41.1.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Ce chapitre reproduit, sur Kubernetes, l'architecture React + Node.js + PostgreSQL déjà construite avec Docker Compose au chapitre 13 (section 13.3). Comparer les deux versions côte à côte est le meilleur moyen de comprendre concrètement ce que Kubernetes ajoute par rapport à Compose — même objectif final, mécanisme radicalement différent.
</div>

## 42.1 Créer un cluster local

```bash
# Sur ta machine locale, avec Kind (Kubernetes in Docker)
winget install --id Kubernetes.kind -e
kind create cluster --name labo-devops
kubectl cluster-info
```

**Explication :** Kind crée un cluster Kubernetes complet **à l'intérieur de conteneurs Docker** (chapitre 11) sur ta machine locale — aucun vrai serveur distant nécessaire pour apprendre ; `kubectl` (déjà mentionné au chapitre 41) est l'outil en ligne de commande officiel pour interagir avec n'importe quel cluster Kubernetes, local ou distant.

## 42.2 PostgreSQL : Deployment, Service et Volume persistant

```yaml
# postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels: { app: postgres }
  template:
    metadata:
      labels: { app: postgres }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef: { name: postgres-secret, key: password }
          volumeMounts:
            - name: donnees
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: donnees
          persistentVolumeClaim: { claimName: postgres-pvc }
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  selector: { app: postgres }
  ports:
    - port: 5432
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests: { storage: 1Gi }
```

**Explication ligne par ligne :** `replicas: 1` (une seule instance de base de données, contrairement à l'API qui en aura plusieurs) ; `secretKeyRef` lit le mot de passe depuis un Secret Kubernetes (chapitre 41, section 41.7) plutôt qu'en clair dans le fichier ; `PersistentVolumeClaim` demande un espace de stockage persistant (chapitre 41, section 41.8) qui survit même si le pod PostgreSQL est recréé sur un autre node ; le Service `postgres` (port 5432) permet à l'API de joindre la base par le nom `postgres`, exactement comme au chapitre 13.

```yaml
# postgres-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
stringData:
  password: motdepasse-a-ne-jamais-commiter-reellement
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ `stringData` illustré ici à but pédagogique uniquement</span>
Ce fichier, comme tout fichier contenant un vrai secret, ne devrait <strong>jamais</strong> être versionné avec une vraie valeur (chapitre 25) — en pratique, ce fichier est généré dynamiquement par le pipeline de déploiement (chapitre 27) à partir d'un vrai gestionnaire de secrets, jamais écrit en clair dans Git.
</div>

## 42.3 API : Deployment avec plusieurs replicas et healthcheck

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mon-api
spec:
  replicas: 3
  selector:
    matchLabels: { app: mon-api }
  template:
    metadata:
      labels: { app: mon-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/ton-compte/mon-api:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              value: "postgres://app:$(DB_PASSWORD)@postgres:5432/app"
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef: { name: postgres-secret, key: password }
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mon-api-service
spec:
  selector: { app: mon-api }
  ports:
    - port: 80
      targetPort: 3000
```

**Explication des probes :** `livenessProbe` (chapitre 12, section 12.6, appliqué nativement à Kubernetes) vérifie régulièrement que le pod est toujours vivant — s'il échoue de façon répétée, Kubernetes **redémarre automatiquement** ce pod ; `readinessProbe` vérifie que le pod est **prêt à recevoir du trafic** — un pod qui échoue ce test est retiré temporairement du Service (section 41.5) sans être redémarré, utile pendant une phase de démarrage lente.

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Rolling deployment natif, sans configuration supplémentaire</span>
Avec <code>replicas: 3</code>, une mise à jour de l'image (<code>kubectl set image</code> ou une nouvelle application du fichier YAML) déclenche <strong>automatiquement</strong> un Rolling deployment (chapitre 28, section 28.2) — Kubernetes met à jour les pods un par un, en utilisant les probes pour vérifier que chaque nouveau pod est réellement prêt avant de passer au suivant. C'est le comportement par défaut, sans script manuel comme dans l'atelier 28.1.
</div>

## 42.4 Frontend et Ingress

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels: { app: frontend }
  template:
    metadata:
      labels: { app: frontend }
    spec:
      containers:
        - name: frontend
          image: ghcr.io/ton-compte/mon-frontend:1.0.0
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector: { app: frontend }
  ports:
    - port: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mon-app-ingress
spec:
  rules:
    - host: monsite.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: mon-api-service, port: { number: 80 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: frontend-service, port: { number: 80 } }
```

**Explication :** cet Ingress reprend exactement la logique de routage par chemin déjà vue avec Nginx (chapitre 15) — `/api` vers le service API, `/` vers le service frontend — mais géré nativement par Kubernetes (chapitre 41, section 41.6).

## 42.5 Déployer et vérifier

```bash
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f api-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml

kubectl get pods
kubectl get services
kubectl get deployments
```

**Résultat attendu** : `kubectl get pods` affiche progressivement les pods passer de `Pending` à `Running`, avec le nombre de replicas correspondant à chaque Deployment ; `kubectl get deployments` confirme `3/3` pods prêts pour l'API, `1/1` pour PostgreSQL, `2/2` pour le frontend.

```bash
kubectl logs -f deployment/mon-api
kubectl describe pod <nom-du-pod>
```

**Cas pratique DevOps :** `kubectl logs` reprend exactement `docker logs` (chapitre 11) appliqué à un Deployment entier ; `kubectl describe` donne un diagnostic détaillé d'un pod précis — la première commande à utiliser quand un pod reste bloqué en `Pending` ou `CrashLoopBackOff` (approfondi au chapitre 46).

## Atelier — Provoquer et observer l'auto-réparation

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 42.1 — Voir Kubernetes réparer automatiquement un pod détruit</span>

**Objectif** : constater concrètement l'auto-réparation (chapitre 41, section 41.4) sur cette architecture réelle.

**Étapes détaillées** :

1. Déploie l'architecture complète de ce chapitre (section 42.5).
2. Liste les pods de l'API (`kubectl get pods -l app=mon-api`), note le nom de l'un d'entre eux.
3. Supprime ce pod directement (`kubectl delete pod <nom>`).
4. Observe immédiatement `kubectl get pods -l app=mon-api` : un nouveau pod apparaît automatiquement, sans aucune intervention supplémentaire, pour revenir à `replicas: 3`.
5. Vérifie que le service reste accessible pendant toute cette opération (l'Ingress continue de router vers les pods restants pendant que le nouveau démarre).

**Résultat attendu** : la démonstration concrète, en conditions réelles, de la différence centrale entre Docker Compose et Kubernetes annoncée au chapitre 41 — un pod détruit revient automatiquement, sans script ni intervention humaine.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier `readinessProbe`, mélangeant les rôles avec `livenessProbe`</span>
Sans `readinessProbe` distincte, Kubernetes peut envoyer du trafic à un pod pas encore réellement prêt (base de données pas encore connectée, par exemple) — les deux probes ont des rôles différents et complémentaires (section 42.3).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un secret en clair versionné, même "juste pour tester"</span>
Comme signalé en section 42.2, même un fichier `Secret` Kubernetes de test ne devrait jamais contenir une vraie valeur versionnée — la même discipline que le chapitre 25, sans exception "temporaire".
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Tenter de joindre un pod directement plutôt que par son Service</span>
Rappel du chapitre 41 (section 41.5, erreur fréquente n°3) : un pod recréé change d'adresse — toujours passer par le nom du Service, jamais une adresse de pod mémorisée.
</div>

## En entreprise

**Réalité répandue** : les fichiers YAML de ce chapitre, bien que fonctionnels, sont souvent gérés à plus grande échelle via Helm (chapitre 43) plutôt qu'appliqués manuellement fichier par fichier avec `kubectl apply` — ce chapitre construit délibérément les fondamentaux avant cette couche d'abstraction supplémentaire.

**Bonne pratique répandue** : les fichiers YAML Kubernetes sont versionnés dans Git (chapitre 7) et déployés via un pipeline CI/CD (chapitre 44 approfondira cette intégration), jamais appliqués manuellement en production sans trace.

**Erreur classique observée** : des `livenessProbe` mal configurées (délai trop court, `initialDelaySeconds` insuffisant pour une application qui démarre lentement) provoquant des redémarrages en boucle d'un pod pourtant fonctionnel, juste trop lent à démarrer — un réglage à ajuster selon le comportement réel de chaque application.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre `livenessProbe` et `readinessProbe` ?"**
Réponse attendue : `livenessProbe` détermine si un pod doit être redémarré (il est bloqué ou planté) ; `readinessProbe` détermine si un pod doit recevoir du trafic maintenant (il peut être temporairement pas prêt sans être en panne) — section 42.3.

**Q2. "Comment Kubernetes assure-t-il qu'une donnée persiste malgré la recréation d'un pod ?"**
Réponse attendue : via un `PersistentVolumeClaim`, qui demande un espace de stockage indépendant du cycle de vie du pod, exactement le même principe que les volumes Docker (chapitre 11) mais applicable même si le pod change de node (section 42.2).

**Q3. "Comment diagnostiquerais-tu un pod bloqué en état 'Pending' ?"**
Réponse attendue : `kubectl describe pod` pour voir les événements détaillés (souvent une ressource insuffisante sur les nodes, ou un problème de configuration), complété par `kubectl logs` une fois le pod effectivement démarré (section 42.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les Secrets Kubernetes (section 42.2) devraient être créés via un pipeline sécurisé (chapitre 27) alimenté par un vrai gestionnaire de secrets (chapitre 25), jamais écrits en clair dans un fichier YAML versionné, même à but d'apprentissage sur un cluster local.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Sépare les fichiers YAML par ressource logique (`postgres-deployment.yaml`, `api-deployment.yaml`, plutôt qu'un unique fichier géant) — la même discipline de lisibilité déjà appliquée aux fichiers de configuration Nginx (chapitre 15, section 15.2).
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`replicas: 3` pour l'API mais `replicas: 1` pour PostgreSQL dans cet exemple reflète un choix conscient — une base de données avec plusieurs replicas nécessite une réplication de données bien plus complexe (hors périmètre de ce chapitre introductif), alors qu'une API sans état peut être répliquée sans réflexion supplémentaire.
</div>

## Résumé du chapitre

- Un cluster local (Kind) permet d'apprendre Kubernetes sans serveur distant.
- PostgreSQL utilise un `PersistentVolumeClaim` pour la persistance, et un `Secret` pour le mot de passe.
- L'API utilise plusieurs replicas avec `livenessProbe` et `readinessProbe` distinctes, permettant un Rolling deployment natif.
- Un Ingress route le trafic par chemin, exactement comme Nginx (chapitre 15), mais nativement Kubernetes.
- L'auto-réparation (un pod supprimé revient automatiquement) est le bénéfice le plus immédiatement visible de Kubernetes par rapport à Docker Compose.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un `PersistentVolumeClaim` sert à :
   - a) Configurer le réseau
   - b) Demander un espace de stockage persistant, indépendant du cycle de vie du pod
   - c) Créer un nouveau namespace
   - d) Chiffrer les communications

2. `readinessProbe`, par rapport à `livenessProbe` :
   - a) Détermine si un pod doit recevoir du trafic maintenant, sans nécessairement redémarrer le pod
   - b) Fait exactement la même chose
   - c) Ne concerne que les Secrets
   - d) N'a aucun rapport avec le trafic

3. Supprimer directement un pod géré par un Deployment avec `replicas: 3` :
   - a) Réduit définitivement à 2 replicas
   - b) Provoque la création automatique d'un nouveau pod pour revenir à 3
   - c) Supprime tout le Deployment
   - d) N'a aucun effet visible

**Corrigé** : 1-b, 2-a, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un Ingress Kubernetes joue un rôle équivalent à Nginx en reverse proxy. — **Vrai** (section 42.4, rappel chapitre 41 section 41.6).
2. Il est acceptable de joindre directement l'adresse IP d'un pod plutôt que son Service, en production. — **Faux** (section "Erreurs fréquentes", erreur n°3).
3. Une mise à jour d'image sur un Deployment avec plusieurs replicas déclenche automatiquement un Rolling deployment. — **Vrai** (section 42.3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 42.1</span>

Après avoir déployé l'architecture de ce chapitre, `kubectl get pods` montre un pod de l'API bloqué en `CrashLoopBackOff`. Décris ta démarche de diagnostic, étape par étape.
</div>

**Corrigé :** d'abord `kubectl describe pod <nom-du-pod>` pour voir les événements récents et la raison précise du dernier redémarrage (section 42.5) ; ensuite `kubectl logs <nom-du-pod>` pour voir la sortie du conteneur avant son plantage (souvent une erreur de connexion à la base de données ou une variable d'environnement manquante) ; si le pod redémarre trop vite pour consulter ses logs, `kubectl logs <nom-du-pod> --previous` affiche les logs du conteneur juste avant son dernier redémarrage. Cette démarche reprend directement la méthode de diagnostic déjà appliquée à Docker (`docker logs`, chapitre 11) et systématisée au chapitre 46.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai créé un cluster Kubernetes local avec Kind.</li>
<li>☐ J'ai déployé PostgreSQL avec un Secret et un PersistentVolumeClaim.</li>
<li>☐ J'ai déployé une API avec plusieurs replicas, `livenessProbe` et `readinessProbe`.</li>
<li>☐ J'ai configuré un Ingress routant par chemin vers plusieurs services.</li>
<li>☐ J'ai constaté, en conditions réelles, l'auto-réparation d'un pod supprimé.</li>
<li>☐ Je sais utiliser `kubectl get`, `kubectl logs`, `kubectl describe` pour diagnostiquer un déploiement.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Kind, Minikube, ou k3d : lequel choisir pour apprendre ?</dt>
<dd>Les trois sont des choix valables pour un cluster local d'apprentissage — Kind (utilisé dans ce chapitre) s'intègre particulièrement bien avec Docker déjà installé depuis le chapitre 3, sans virtualisation supplémentaire.</dd>

<dt>Faut-il toujours un Ingress, même pour un projet simple ?</dt>
<dd>Un Ingress devient utile dès qu'il faut router plusieurs services derrière un point d'entrée unique (comme dans ce chapitre) — pour un unique service exposé, un simple Service de type `LoadBalancer` (non détaillé ici) peut parfois suffire.</dd>

<dt>Ce chapitre couvre-t-il tout ce qu'il faut savoir sur Kubernetes en production ?</dt>
<dd>Non, ce chapitre couvre les fondamentaux opérationnels. Helm (chapitre 43) et l'intégration CI/CD (chapitre 44) complètent cette base ; des sujets plus avancés (autoscaling fin, réseau avancé, opérateurs personnalisés) dépassent le périmètre de ce manuel introductif.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Kubernetes — tutoriel interactif "Kubernetes Basics" : [https://kubernetes.io/docs/tutorials/kubernetes-basics/](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- Kind — documentation officielle : [https://kind.sigs.k8s.io](https://kind.sigs.k8s.io)
- `kubectl` — aide-mémoire officiel des commandes : [https://kubernetes.io/docs/reference/kubectl/cheatsheet/](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

*Chapitre suivant : Helm — chart, values, templates, release. Empaqueter l'architecture de ce chapitre pour la réutiliser et la versionner comme un vrai produit logiciel.*
