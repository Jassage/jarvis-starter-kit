<div class="chapitre-titre-num">CHAPITRE 43 · 🔴 PROFESSIONNEL</div>

# Helm

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre Helm — chart, values, templates, release — et empaqueter l'architecture du chapitre 42 comme un chart réutilisable et versionné. Ce chapitre applique à Kubernetes le même principe déjà vu au chapitre 37 (section 37.6) : un module réutilisable plutôt qu'une description répétée à chaque projet.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le chapitre 42 a produit cinq fichiers YAML distincts pour une seule architecture. Multiplier ces fichiers pour chaque environnement (chapitre 18 : development, staging, production), en changeant seulement quelques valeurs (le nombre de replicas, le tag d'image), devient vite répétitif et source d'erreurs de copier-coller. Helm résout précisément ce problème.
</div>

## 43.1 Chart : le paquet Helm

<div class="encadre retenir">
<span class="encadre-titre">📌 Vocabulaire Helm</span>
Un <strong>chart</strong> est un paquet Helm — l'équivalent, pour Kubernetes, d'une image Docker (chapitre 12) pour une application : une unité empaquetée, versionnée, réutilisable. Les <strong>values</strong> sont les paramètres personnalisables d'un chart (nombre de replicas, tag d'image, domaine). Les <strong>templates</strong> sont les fichiers YAML du chapitre 42, mais avec des emplacements variables remplis par les values. Une <strong>release</strong> est une instance déployée d'un chart, avec un jeu de values précis.
</div>

```bash
winget install --id Helm.Helm -e
helm create mon-app
```

```text
mon-app/
├── Chart.yaml           # métadonnées du chart (nom, version)
├── values.yaml           # valeurs par défaut
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

## 43.2 Transformer les fichiers du chapitre 42 en templates

```yaml
# templates/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-api
spec:
  replicas: {{ .Values.api.replicas }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-api
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-api
    spec:
      containers:
        - name: api
          image: "{{ .Values.api.image.repository }}:{{ .Values.api.image.tag }}"
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: {{ .Values.api.healthcheck.delai }}
```

**Explication :** `{{ .Values.api.replicas }}` est un emplacement variable — Helm le remplace par la valeur correspondante définie dans `values.yaml` (ou surchargée à l'installation) ; `{{ .Release.Name }}` insère automatiquement le nom donné à cette release, permettant d'installer plusieurs instances du même chart (par exemple, une par environnement) sans collision de noms.

```yaml
# values.yaml
api:
  replicas: 3
  image:
    repository: ghcr.io/ton-compte/mon-api
    tag: "1.0.0"
  healthcheck:
    delai: 5

frontend:
  replicas: 2
  image:
    repository: ghcr.io/ton-compte/mon-frontend
    tag: "1.0.0"

postgres:
  stockage: 1Gi
```

## 43.3 Installer, mettre à jour, désinstaller une release

```bash
helm install mon-app-staging ./mon-app --set api.replicas=1
```

**Explication :** `helm install <nom-release> <chemin-chart>` installe une nouvelle release ; `--set api.replicas=1` surcharge ponctuellement une valeur de `values.yaml`, sans modifier le fichier lui-même — utile pour un ajustement rapide en staging (chapitre 18), avec moins de ressources qu'en production.

```bash
helm upgrade mon-app-staging ./mon-app --set api.image.tag=1.1.0
```

**Cas pratique DevOps :** cette commande reprend exactement le principe du chapitre 27 (redéployer une nouvelle version) — mais en une seule commande Helm plutôt qu'en manipulant plusieurs fichiers YAML individuellement comme au chapitre 42.

```bash
helm rollback mon-app-staging 1
```

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Rollback natif, rappel direct du chapitre 29</span>
Helm garde un historique de chaque révision d'une release — <code>helm rollback</code> revient à une révision précédente en une seule commande, l'implémentation native du principe déjà construit manuellement au chapitre 29 avec un SHA de commit Docker.
</div>

```bash
helm uninstall mon-app-staging
```

## 43.4 Un chart par environnement, values séparées

```yaml
# values-production.yaml
api:
  replicas: 5
  image:
    tag: "1.0.0"

frontend:
  replicas: 3
```

```bash
helm install mon-app-prod ./mon-app -f values-production.yaml
```

**Explication :** plutôt que de dupliquer l'intégralité des fichiers YAML pour chaque environnement (chapitre 18), un seul chart accepte des fichiers `values` différents par environnement — la même architecture, des paramètres différents, exactement le principe recommandé au chapitre 18 (section 18.4) : seule la configuration change, jamais la structure elle-même.

## Atelier — Empaqueter l'architecture du chapitre 42 en chart Helm

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 43.1 — De cinq fichiers YAML à un chart réutilisable</span>

**Objectif** : transformer l'architecture du chapitre 42 en un vrai chart Helm, installable pour plusieurs environnements.

**Étapes détaillées** :

1. Crée la structure de chart (section 43.1), transforme chaque fichier YAML du chapitre 42 en template avec des variables (section 43.2).
2. Crée `values.yaml` avec des valeurs par défaut raisonnables, et `values-staging.yaml`/`values-production.yaml` avec des replicas différents.
3. Installe une release `staging` et une release `production` en parallèle (dans des namespaces différents, chapitre 41, section 41.8, pour éviter toute collision).
4. Effectue une mise à jour (`helm upgrade`) sur `staging` uniquement, vérifie que `production` reste inchangée.
5. Effectue un `helm rollback` sur `staging`, vérifie le retour à la version précédente.

**Résultat attendu** : deux environnements gérés par le même chart, avec des paramètres différents, déployés et mis à jour indépendamment — la démonstration concrète du bénéfice de Helm par rapport aux fichiers YAML bruts du chapitre 42.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Un chart trop rigide, sans valeurs par défaut raisonnables</span>
Un chart qui exige de spécifier manuellement chaque valeur à chaque installation (aucune valeur par défaut dans `values.yaml`) perd une grande partie de son intérêt de réutilisabilité — toujours fournir des valeurs par défaut sensées, surchargeables seulement quand nécessaire.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Secrets réels dans `values.yaml` versionné</span>
Comme pour tout autre mécanisme de ce manuel (chapitre 25), les vraies valeurs sensibles ne devraient jamais se trouver dans un fichier `values` versionné — utiliser `--set` au moment du déploiement (alimenté par un secret du pipeline, chapitre 27) ou un mécanisme Helm dédié aux secrets.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier de tester un chart avant de l'installer réellement</span>
`helm install --dry-run` (le même principe que `terraform plan`, chapitre 38, ou `certbot renew --dry-run`, chapitre 16) simule l'installation sans rien exécuter réellement — un réflexe à prendre avant toute installation en production, jamais sauté par excès de confiance.
</div>

## En entreprise

**Réalité répandue** : Helm est devenu le gestionnaire de paquets de facto pour Kubernetes, avec un vaste écosystème de charts publics déjà prêts pour des logiciels courants (bases de données, outils de monitoring comme Prometheus, chapitre 32) — souvent plus rapide d'utiliser un chart communautaire existant que d'en écrire un depuis zéro pour un logiciel tiers standard.

**Bonne pratique répandue** : les charts internes d'une organisation (comme celui construit dans ce chapitre) sont eux-mêmes versionnés et publiés dans un registre de charts dédié, avec une numérotation de version sémantique (chapitre 14, section 14.3) cohérente avec le reste du portefeuille applicatif.

**Erreur classique observée** : des `values.yaml` qui grossissent au fil du temps sans structure claire, devenant aussi difficiles à maintenir que les fichiers YAML bruts qu'ils étaient censés simplifier — une organisation cohérente des values (par service, par préoccupation) reste nécessaire même avec Helm.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce qu'un chart Helm, et en quoi diffère-t-il des fichiers YAML Kubernetes bruts ?"**
Réponse attendue : un chart empaquette des templates paramétrables par des values, réutilisables pour plusieurs environnements ou installations, plutôt que de dupliquer des fichiers YAML statiques pour chaque cas (section 43.1-43.2).

**Q2. "Comment gérerais-tu plusieurs environnements avec Helm ?"**
Réponse attendue : un seul chart, avec des fichiers `values` séparés par environnement (`values-staging.yaml`, `values-production.yaml`), installés comme des releases distinctes (section 43.4).

**Q3. "Comment Helm facilite-t-il un rollback par rapport à une gestion manuelle de fichiers YAML ?"**
Réponse attendue : Helm garde un historique de chaque révision d'une release, permettant un rollback en une seule commande (`helm rollback`), sans avoir à reconstituer manuellement les fichiers YAML d'une version précédente (section 43.3).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'installe jamais un chart tiers non vérifié sans en avoir lu le contenu au préalable — exactement le même principe de vigilance que pour une image Docker non officielle (chapitre 36, section 36.2) ou une action GitHub non épinglée (chapitre 21).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente chaque valeur de `values.yaml` avec un commentaire clair de son rôle et de son impact — un chart bien documenté permet à quelqu'un d'autre de l'utiliser sans devoir lire tous les templates sous-jacents.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`helm upgrade` ne redéploie que ce qui a réellement changé entre deux révisions — un gain de temps par rapport à une réapplication complète et aveugle de tous les fichiers YAML à chaque changement, même mineur.
</div>

## Résumé du chapitre

- Un chart Helm empaquette des templates Kubernetes paramétrables par des values, réutilisables pour plusieurs installations.
- `helm install`/`upgrade`/`rollback`/`uninstall` gèrent le cycle de vie complet d'une release.
- Un seul chart, avec des fichiers `values` différents par environnement, remplace la duplication de fichiers YAML bruts.
- Helm garde un historique de révisions, permettant un rollback natif en une seule commande.
- Les secrets ne devraient jamais se trouver dans un fichier `values` versionné, la même discipline que le chapitre 25.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un chart Helm est l'équivalent, pour Kubernetes, de :
   - a) Un simple fichier texte sans structure
   - b) Une image Docker : un paquet empaqueté, versionné, réutilisable
   - c) Un registre Docker
   - d) Une base de données

2. `helm rollback` sert à :
   - a) Supprimer définitivement une release
   - b) Revenir à une révision précédente d'une release
   - c) Installer un nouveau chart
   - d) Modifier le code source de l'application

3. Pour gérer plusieurs environnements avec Helm, on utilise généralement :
   - a) Un chart différent pour chaque environnement
   - b) Le même chart avec des fichiers `values` différents par environnement
   - c) Impossible, Helm ne gère qu'un seul environnement
   - d) Une réinstallation complète à chaque changement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `helm install --dry-run` exécute réellement l'installation. — **Faux** (section "Erreurs fréquentes", erreur n°3).
2. Les vraies valeurs de secrets devraient être écrites directement dans `values.yaml` versionné. — **Faux** (section "Erreurs fréquentes", erreur n°2).
3. Helm garde un historique des révisions d'une release, permettant un rollback. — **Vrai** (section 43.3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.1</span>

Explique pourquoi gérer trois environnements (dev, staging, production) avec trois copies séparées de fichiers YAML Kubernetes bruts (comme au chapitre 42) devient risqué à mesure que le nombre de fichiers grandit, et comment Helm résout ce problème.
</div>

**Corrigé :** avec des fichiers YAML dupliqués pour chaque environnement, une correction ou un ajout de fonctionnalité doit être répété manuellement dans chaque copie — un oubli sur l'une des copies crée une divergence silencieuse entre environnements, exactement le risque déjà signalé au chapitre 18 (section 18.4) concernant des environnements qui divergent trop. Helm résout ce problème en centralisant la structure dans un seul jeu de templates (section 43.2), les différences entre environnements se limitant strictement aux valeurs (`values-staging.yaml` vs `values-production.yaml`) — toute correction structurelle s'applique alors automatiquement à tous les environnements dès la prochaine mise à jour, sans risque d'oubli sur l'un d'entre eux.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais créer la structure de base d'un chart Helm.</li>
<li>☐ Je sais transformer un fichier YAML statique en template paramétrable.</li>
<li>☐ Je sais installer, mettre à jour et faire un rollback d'une release Helm.</li>
<li>☐ Je sais gérer plusieurs environnements avec un seul chart et des fichiers `values` séparés.</li>
<li>☐ Je sais utiliser `--dry-run` avant une installation réelle.</li>
<li>☐ Je ne mets jamais de secret réel dans un fichier `values` versionné.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours écrire son propre chart, ou peut-on réutiliser des charts existants ?</dt>
<dd>Pour des logiciels tiers courants (PostgreSQL, Prometheus, Grafana — déjà utilisés dans ce manuel), des charts officiels ou communautaires existent déjà (Artifact Hub est le catalogue de référence) — écrire son propre chart, comme dans ce chapitre, reste pertinent pour ses propres applications.</dd>

<dt>Helm est-il obligatoire pour utiliser Kubernetes ?</dt>
<dd>Non, le chapitre 42 a montré qu'on peut déployer directement avec `kubectl apply` — Helm devient particulièrement utile dès plusieurs environnements ou une réutilisation fréquente de la même architecture, pas un prérequis absolu.</dd>

<dt>Peut-on combiner Helm avec le pipeline CI/CD du chapitre 27 ?</dt>
<dd>Oui, et c'est même la pratique la plus courante — le chapitre 44 approfondit précisément cette intégration, remplaçant les commandes SSH manuelles du chapitre 27 par des commandes `helm upgrade` automatisées.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Helm : [https://helm.sh/docs/](https://helm.sh/docs/)
- Artifact Hub — catalogue de charts Helm publics : [https://artifacthub.io](https://artifacthub.io)

*Chapitre suivant : CI/CD vers Kubernetes — GitHub Actions, Docker Build, Registry, Kubernetes, Deployment, assemblés en un seul pipeline automatisé complet, qui clôt la Partie XIII.*
