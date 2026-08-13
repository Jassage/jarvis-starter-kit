<div class="chapitre-titre-num">CHAPITRE 44</div>

# Kubernetes en production

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Combler les lacunes révélées par une revue de préparation à la production avant le passage en charge réelle du portail sur Kubernetes : exposition externe sécurisée (Ingress + TLS), contrôle d'accès (RBAC), gestion réellement sécurisée des secrets, mise à l'échelle automatique et sondes de santé natives. À la fin de ce chapitre, tu sauras évaluer si un déploiement Kubernetes est réellement prêt pour la production, pas seulement fonctionnel en démonstration.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
La démonstration du chapitre 43 a convaincu le développeur et le DSI. Avant le passage réel en production, le RSSI (rappel du chapitre 1) demande une revue de préparation formelle. Son constat, après examen : l'application n'est accessible que via un accès interne au cluster, sans HTTPS externe réel ; n'importe quel compte ayant accès au cluster peut actuellement tout faire dessus, sans restriction ; les secrets sont toujours de simples Secrets natifs en base64 (rappel de l'avertissement du chapitre 43) ; et la mise à l'échelle reste entièrement manuelle, dépendante d'un administrateur qui doit se souvenir d'exécuter `kubectl scale` au bon moment. <em>"Fonctionnel en démonstration ne veut pas dire prêt pour la production,"</em> conclut-elle. Ce chapitre comble méthodiquement chacune de ces lacunes.
</div>

## 44.1 Ingress : exposer l'application avec HTTPS réel

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un **Ingress** gère l'accès HTTP/HTTPS externe vers les Services internes d'un cluster (chapitre 42), avec routage par nom de domaine et terminaison TLS — répondant directement à la première lacune identifiée par le RSSI. Combiné à **cert-manager** (l'équivalent Kubernetes natif de certbot, déjà rencontré au chapitre 24), l'Ingress peut obtenir et renouveler automatiquement un certificat Let's Encrypt, éliminant exactement le même risque de certificat expiré non détecté déjà vécu au chapitre 24.
</div>

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: portail-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - portail.assuranceht.ht
      secretName: portail-tls
  rules:
    - host: portail.assuranceht.ht
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: portail-service
                port:
                  number: 80
```

## 44.2 RBAC Kubernetes : rappel direct du chapitre 18 et du chapitre 26

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le principe du moindre privilège, appliqué au cluster lui-même</span>
Exactement le même principe déjà appliqué à sudo et aux ACL (chapitre 18), puis généralisé par la philosophie Zero Trust (chapitre 26) : **RBAC** (*Role-Based Access Control*) Kubernetes définit précisément qui peut effectuer quelles actions sur quels objets, dans quel namespace (chapitre 43) — jamais un accès `cluster-admin` par défaut pour tout le monde, exactement la seconde lacune identifiée par le RSSI dans le scénario d'ouverture.
</div>

```yaml
# role.yaml -- un role limite au namespace production, lecture seule
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: lecteur-portail
rules:
  - apiGroups: [""]
    resources: ["pods", "services"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-lecteur-portail
  namespace: production
subjects:
  - kind: User
    name: nouveau-dev
roleRef:
  kind: Role
  name: lecteur-portail
  apiGroup: rbac.authorization.k8s.io
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un écho direct du scénario du chapitre 18</span>
Ce `Role` limité à la lecture seule sur le namespace production rappelle directement la règle sudo granulaire du chapitre 18 (`nouveau_dev ALL=(root) /usr/bin/systemctl restart nginx`) — le même réflexe de moindre privilège, transposé du système d'exploitation au cluster Kubernetes : accorder exactement ce qui est nécessaire, jamais un accès total par facilité.
</div>

## 44.3 Sécuriser réellement les secrets en production

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Corriger la troisième lacune : au-delà du Secret natif encodé en base64</span>
Rappel direct de l'avertissement du chapitre 43 : un Secret Kubernetes natif n'offre pas de chiffrement réel par défaut. Deux solutions concrètes existent pour combler cette lacune identifiée par le RSSI : activer le **chiffrement au repos d'etcd** (chapitre 42), garantissant que les données stockées sont réellement chiffrées sur le disque du plan de contrôle ; ou intégrer un **gestionnaire de secrets externe** (comme HashiCorp Vault ou un service cloud équivalent), qui injecte les secrets dans les Pods sans jamais les stocker en clair dans `etcd` — une solution plus robuste, approfondie en Partie 9 avec l'Infrastructure as Code.
</div>

## 44.4 HPA : automatiser la mise à l'échelle manuelle du chapitre 43

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — corriger la quatrième lacune</span>
Le **Horizontal Pod Autoscaler** (HPA) automatise exactement ce que `kubectl scale` faisait manuellement au chapitre 43 — ajustant le nombre de réplicas en fonction de métriques observées en temps réel (typiquement l'utilisation CPU), sans dépendre d'un administrateur qui se souvient d'intervenir au bon moment.
</div>

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: portail-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: portail-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seuil de 70%, pas 100%</span>
Le seuil `averageUtilization: 70` déclenche une mise à l'échelle avant que les Pods existants n'atteignent leur limite réelle — exactement le même principe de supervision proactive déjà établi au chapitre 1 (agir avant la saturation, pas après), appliqué ici à l'échelle automatique plutôt qu'à une alerte humaine.
</div>

## 44.5 Requests et limits : rappel direct de la surallocation du chapitre 33

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans limits, un seul Pod peut monopoliser tout un nœud</span>
Rappel direct de la surveillance de la surallocation déjà établie au chapitre 33 pour les VM, appliquée ici aux Pods : sans **limits** de ressources définies, un Pod défaillant (fuite mémoire, boucle infinie) peut consommer toutes les ressources disponibles d'un nœud, affectant tous les autres Pods qui y sont hébergés — exactement le même risque de contention déjà décrit pour un hôte de virtualisation.
</div>

```yaml
# Ajout au conteneur du Deployment de la section 43.1
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

## 44.6 Sondes de santé : rappel direct du healthcheck du chapitre 41

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Éviter d'envoyer du trafic à un Pod pas encore prêt</span>
Exactement le même piège que `depends_on` sans healthcheck au chapitre 41 : sans **readiness probe**, Kubernetes peut envoyer du trafic vers un Pod tout juste démarré, mais pas encore réellement prêt à traiter des requêtes (application encore en cours d'initialisation). Une **liveness probe** distincte détecte un Pod bloqué ou défaillant après un fonctionnement normal, déclenchant son redémarrage automatique — le même principe d'auto-guérison déjà présenté au chapitre 42, rendu concret ici.
</div>

```yaml
# Ajout au conteneur du Deployment
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 10
```

## 44.7 Checklist finale de préparation à la production

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — les cinq lacunes du RSSI, toutes comblées</span>
1. Exposition externe sécurisée avec TLS automatisé (Ingress + cert-manager, section 44.1).
2. Contrôle d'accès granulaire (RBAC, section 44.2).
3. Secrets réellement protégés (chiffrement etcd ou gestionnaire externe, section 44.3).
4. Mise à l'échelle automatique (HPA, section 44.4).
5. Limites de ressources et sondes de santé (sections 44.5-44.6), pour qu'aucun Pod ne compromette la stabilité du cluster ni ne reçoive de trafic prématurément.
</div>

## Atelier — Réaliser la revue de préparation à la production

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 44 — Auditer le déploiement du chapitre 43</span>

**Objectif** : reproduire la démarche du RSSI en auditant le manifeste du chapitre 43, puis proposer les corrections nécessaires.

**Préparation** : le manifeste du chapitre 43 (Deployment, Service, PVC), ou une lecture attentive pour cet atelier conceptuel.

**Étapes détaillées** :

1. Relis le Deployment de la section 43.1. Identifie les éléments manquants selon la checklist de la section 44.7.
2. Rédige les ajouts nécessaires (resources, probes) à intégrer directement au manifeste existant.
3. Propose un Ingress et un RBAC minimal pour ce déploiement.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le Deployment du chapitre 43 ne comportait ni `resources` (section 44.5), ni `readinessProbe`/`livenessProbe` (section 44.6) — deux ajouts à intégrer directement dans la spécification du conteneur. L'Ingress de la section 44.1 expose l'application avec TLS automatisé. Un RBAC minimal, comme celui de la section 44.2, restreint l'accès du namespace de production aux seules personnes ayant réellement besoin d'y intervenir, en lecture seule pour la plupart, en écriture seulement pour les administrateurs désignés.

**Dépannage** : si tu hésites sur les valeurs précises de `requests`/`limits` à définir, commence par observer la consommation réelle de l'application en conditions de charge normale (via `kubectl top pods`, un outil de mesure directe), puis ajuste avec une marge raisonnable — jamais une valeur arbitraire choisie sans donnée réelle à l'appui.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — accorder `cluster-admin` par défaut à tous les comptes</span>
Rappel de la section 44.2 : exactement l'équivalent Kubernetes de `ALL=(ALL) NOPASSWD: ALL` déjà dénoncé au chapitre 18 — un accès total qui transforme un compte compromis en risque pour le cluster entier.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — déployer sans `resources.limits`</span>
Rappel de la section 44.5 : un Pod sans limite peut monopoliser un nœud entier, affectant tous les autres services qui y sont hébergés, exactement le même risque de contention déjà décrit pour la virtualisation au chapitre 33.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — omettre les sondes de santé</span>
Rappel de la section 44.6 : sans readiness probe, du trafic peut être envoyé à un Pod pas encore prêt, provoquant des erreurs intermittentes pendant chaque déploiement, un symptôme souvent difficile à diagnostiquer sans connaître cette cause précise.
</div>

## Diagnostiquer un trafic envoyé trop tôt à un Pod

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : des erreurs intermittentes surviennent juste après chaque déploiement, puis disparaissent d'elles-mêmes</span>

- **Diagnostic** : l'absence de readiness probe (section 44.6) est la cause la plus fréquente — le Service commence à envoyer du trafic vers un nouveau Pod dès qu'il démarre, avant que l'application elle-même ne soit réellement prête à traiter des requêtes.
- **Comment vérifier** : `kubectl get pods` juste après un déploiement, en observant si des Pods marqués "Running" reçoivent déjà du trafic alors que l'application affiche encore des erreurs dans ses journaux (`kubectl logs`).
- **Résolution** : ajouter une readiness probe pointant vers un endpoint de santé réel de l'application (section 44.6) — le Service ne dirigera alors du trafic vers un Pod qu'une fois cette sonde confirmée positive, éliminant cette classe entière de problèmes intermittents.
</div>

## En entreprise

- **Bonne pratique répandue** : établir une checklist formelle de préparation à la production (section 44.7) que tout nouveau déploiement doit satisfaire avant sa mise en service réelle — jamais une simple vérification informelle "ça a l'air de marcher".
- **Bonne pratique répandue** : réviser périodiquement les permissions RBAC accordées, retirant les accès devenus inutiles — le même principe d'audit périodique déjà établi pour sudo et les ACL au chapitre 18.
- **Erreur classique observée** : une application qui fonctionne parfaitement en démonstration mais s'effondre au premier pic de charge réel en production, faute de HPA et de limites de ressources correctement configurées dès le départ.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce qu'un Ingress, et pourquoi cert-manager est-il souvent utilisé avec lui ?"**
Réponse attendue : un Ingress gère l'accès HTTP/HTTPS externe vers les Services internes d'un cluster, avec routage par domaine et terminaison TLS ; cert-manager automatise l'obtention et le renouvellement de certificats (souvent Let's Encrypt), évitant le risque de certificat expiré non détecté déjà rencontré au chapitre 24.

**Q2. "Pourquoi les `resources.limits` sont-elles importantes en production Kubernetes ?"**
Réponse attendue : sans limites, un Pod défaillant peut consommer toutes les ressources disponibles d'un nœud, dégradant les performances de tous les autres Pods qui y sont hébergés — exactement le même risque de contention déjà décrit pour la surallocation en virtualisation au chapitre 33.

**Q3. "Quelle est la différence entre une readiness probe et une liveness probe ?"**
Réponse attendue : la readiness probe détermine si un Pod est prêt à recevoir du trafic (évitant d'envoyer des requêtes à un Pod encore en initialisation) ; la liveness probe détecte si un Pod déjà en fonctionnement est devenu défaillant, déclenchant son redémarrage automatique.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'accorde jamais `cluster-admin` par défaut — applique systématiquement RBAC avec le principe du moindre privilège, exactement le même réflexe déjà établi pour sudo et les ACL depuis le chapitre 18, transposé sans exception à Kubernetes.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) la checklist de préparation à la production de ton organisation, et applique-la systématiquement à tout nouveau déploiement Kubernetes — une référence commune qui évite d'oublier un élément critique sous la pression d'une mise en production urgente.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Ajuste le seuil de déclenchement de l'HPA (section 44.4) en fonction du temps réel de démarrage de nouveaux Pods — un seuil trop élevé pourrait laisser le service se dégrader avant que de nouveaux Pods n'aient le temps de devenir opérationnels.
</div>

## Résumé du chapitre

- Un Ingress, combiné à cert-manager, expose une application avec HTTPS automatisé, corrigeant la première lacune identifiée par le RSSI.
- RBAC applique le principe du moindre privilège au cluster lui-même, exactement le même principe déjà établi pour sudo et les ACL (chapitre 18).
- Les Secrets Kubernetes natifs nécessitent un chiffrement d'etcd ou un gestionnaire externe pour une protection réelle en production.
- L'HPA automatise la mise à l'échelle manuelle du chapitre 43, réagissant en temps réel à la charge observée.
- Les `resources.limits` évitent qu'un seul Pod ne monopolise un nœud entier ; les sondes de santé évitent d'envoyer du trafic à un Pod pas encore prêt.
- Une checklist formelle de préparation à la production distingue un déploiement "fonctionnel en démonstration" d'un déploiement réellement prêt pour un usage critique.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un Ingress sert principalement à :
   - a) Gérer l'accès HTTP/HTTPS externe vers les Services d'un cluster
   - b) Stocker des secrets
   - c) Redimensionner automatiquement les Pods
   - d) Sauvegarder les données du cluster

2. RBAC Kubernetes permet de :
   - a) Chiffrer automatiquement tous les Secrets
   - b) Contrôler précisément qui peut effectuer quelles actions sur quels objets
   - c) Remplacer le besoin d'Ingress
   - d) Augmenter automatiquement les ressources d'un Pod

3. Sans readiness probe, un Pod nouvellement démarré peut :
   - a) Ne jamais recevoir de trafic
   - b) Recevoir du trafic avant d'être réellement prêt à le traiter
   - c) Être automatiquement supprimé
   - d) Bloquer tout le cluster

**Corrigé** : 1-a, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un Secret Kubernetes natif offre une protection suffisante pour toute donnée critique en production, sans configuration supplémentaire. — **Faux** (chiffrement d'etcd ou gestionnaire externe nécessaire, section 44.3).
2. L'HPA ajuste automatiquement le nombre de réplicas selon des métriques observées, sans intervention manuelle. — **Vrai**.
3. Les `resources.limits` sont optionnelles et sans impact réel en production. — **Faux** (essentielles pour éviter la contention, section 44.5).
4. RBAC applique le même principe de moindre privilège déjà établi pour sudo et les ACL au chapitre 18. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une application "fonctionnelle en démonstration" (chapitre 43) peut échouer en production sans les ajouts de ce chapitre.
2. Reprends le scénario d'ouverture. Explique pourquoi la remarque du RSSI ("fonctionnel ne veut pas dire prêt pour la production") est justifiée, en synthétisant les cinq lacunes de ce chapitre.

**Corrigé 1** : une démonstration réussie confirme que l'application fonctionne dans des conditions contrôlées et limitées — mais sans limites de ressources, sans sondes de santé, sans mise à l'échelle automatique et sans exposition sécurisée, elle reste vulnérable à des charges réelles, des Pods défaillants non détectés, ou un accès non sécurisé depuis l'extérieur, des risques qui ne se manifestent généralement pas pendant une démonstration courte et contrôlée mais deviennent réels sous une charge de production continue et imprévisible.

**Corrigé 2** : chacune des cinq lacunes (exposition non sécurisée, absence de RBAC, secrets non protégés, mise à l'échelle manuelle, absence de limites et de sondes) représente un risque réel qui ne se manifeste pas nécessairement lors d'une démonstration contrôlée, mais qui deviendrait un incident concret en conditions de production réelles — un trafic externe non chiffré intercepté, un compte compromis avec un accès total au cluster, une fuite de secret, une saturation non absorbée automatiquement, ou un Pod défaillant continuant à recevoir du trafic. La remarque du RSSI souligne exactement cette distinction entre "ça marche" et "c'est sécurisé et résilient", la seconde exigeant une rigueur que la démonstration seule ne peut jamais garantir.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 44.1</span>

Un Pod sans `resources.limits` définies commence à consommer progressivement toute la mémoire disponible d'un nœud, à cause d'une fuite mémoire dans l'application. Explique les conséquences pour les autres Pods du même nœud, et comment `resources.limits` aurait prévenu ce scénario.
</div>

**Corrigé :** Sans limite définie, ce Pod peut continuer à consommer de la mémoire jusqu'à épuiser les ressources disponibles du nœud entier, provoquant potentiellement l'échec ou le ralentissement sévère de tous les autres Pods hébergés sur ce même nœud, y compris des services totalement indépendants de l'application défaillante — exactement le même risque de contention déjà décrit pour la surallocation de VM au chapitre 33. Avec une `limits.memory` correctement définie (section 44.5), Kubernetes aurait détecté le dépassement de cette limite et redémarré le Pod concerné (un événement "OOMKilled"), contenant l'impact du problème à ce seul Pod plutôt que de laisser la fuite mémoire affecter l'ensemble du nœud et des autres charges de travail qu'il héberge.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 44.2</span>

Rédige, en 3 à 5 phrases, une checklist de préparation à la production à cinq points, destinée à être appliquée systématiquement avant tout nouveau déploiement Kubernetes dans l'entreprise du scénario d'ouverture.
</div>

**Corrigé (exemple de réponse) :** (1) L'application est-elle exposée via un Ingress avec TLS automatisé, jamais en accès non chiffré depuis l'extérieur ? (2) Les permissions RBAC accordées sont-elles limitées au strict nécessaire pour chaque personne ou service concerné, jamais un accès `cluster-admin` par défaut ? (3) Les secrets sensibles sont-ils protégés par un chiffrement d'etcd ou un gestionnaire externe, pas seulement par un Secret natif encodé en base64 ? (4) Un HPA est-il configuré pour absorber automatiquement les pics de charge, sans dépendre d'une intervention manuelle ? (5) Chaque conteneur définit-il des `resources.limits` ainsi que des sondes de readiness et de liveness appropriées ? Cette checklist, documentée et appliquée systématiquement (chapitre 3), transforme la question "est-ce prêt pour la production ?" d'un jugement subjectif en une vérification objective et reproductible.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais configurer un Ingress avec TLS automatisé via cert-manager.</li>
<li>☐ Je sais appliquer RBAC selon le principe du moindre privilège.</li>
<li>☐ Je comprends les options pour sécuriser réellement les secrets en production (chiffrement etcd, gestionnaire externe).</li>
<li>☐ Je sais configurer un HPA pour automatiser la mise à l'échelle.</li>
<li>☐ Je sais définir des `resources.requests`/`limits` appropriées.</li>
<li>☐ Je sais configurer des readiness et liveness probes, et j'en comprends la différence.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours utiliser un Ingress, ou existe-t-il des alternatives ?</dt>
<dd>Un `Service` de type `LoadBalancer` (souvent fourni par un hébergeur cloud) constitue une alternative pour une exposition simple d'un seul service — un Ingress reste préférable dès que plusieurs services doivent être exposés sous des chemins ou domaines différents, avec une gestion centralisée du TLS.</dd>

<dt>L'HPA peut-il aussi réduire automatiquement le nombre de réplicas en période de faible charge ?</dt>
<dd>Oui, l'HPA ajuste dans les deux sens selon les métriques observées — augmentant le nombre de réplicas en cas de charge élevée, mais le réduisant aussi automatiquement (jusqu'au `minReplicas` configuré) une fois la charge retombée, optimisant l'utilisation des ressources du cluster.</dd>

<dt>RBAC remplace-t-il le besoin de namespaces pour l'isolation ?</dt>
<dd>Non, les deux mécanismes se complètent — les namespaces (chapitre 43) isolent logiquement les objets par environnement ou projet, tandis que RBAC contrôle qui peut agir sur ces objets, y compris de façon différenciée d'un namespace à l'autre, comme dans l'exemple de la section 44.2.</dd>

<dt>Combien de temps faut-il pour qu'une équipe soit réellement prête à opérer Kubernetes en production de façon autonome ?</dt>
<dd>Il n'existe pas de délai universel, mais la progression naturelle suivie tout au long de cette partie (concepts, chapitre 42 ; pratique, chapitre 43 ; préparation production, ce chapitre) représente un minimum de compréhension avant une autonomie réelle — rappel du principe déjà établi au chapitre 42 : ne jamais sous-estimer la courbe d'apprentissage réelle de l'équipe.</dd>
</dl>

## Références et pour aller plus loin

- Kubernetes — Documentation sur Ingress : [https://kubernetes.io/fr/docs/concepts/services-networking/ingress/](https://kubernetes.io/fr/docs/concepts/services-networking/ingress/)
- Kubernetes — Documentation RBAC : [https://kubernetes.io/fr/docs/reference/access-authn-authz/rbac/](https://kubernetes.io/fr/docs/reference/access-authn-authz/rbac/)
- Kubernetes — Documentation sur l'autoscaling horizontal : [https://kubernetes.io/fr/docs/tasks/run-application/horizontal-pod-autoscale/](https://kubernetes.io/fr/docs/tasks/run-application/horizontal-pod-autoscale/)
- cert-manager — documentation officielle : [https://cert-manager.io/docs/](https://cert-manager.io/docs/)

*Fin de la Partie 7. La Partie 8 aborde maintenant le cloud computing — AWS, Azure et Google Cloud Platform — pour situer tout ce qui a été construit jusqu'ici (virtualisation, conteneurs, orchestration) dans le contexte des offres des grands fournisseurs cloud.*
