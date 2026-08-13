# Chapitre 31 — CI/CD avec Docker

**Niveau : Avancé**

---

## Introduction

Depuis le chapitre 29, chaque mise à jour de l'application exige une séquence manuelle : se connecter en SSH, `git pull`, reconstruire, relancer. Ce chapitre automatise entièrement ce parcours avec GitHub Actions — à chaque `git push` sur la branche principale, l'image se construit, se publie sur un registry (chapitre 27), et se déploie sur le serveur, sans plus jamais taper une commande manuelle.

---

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras :
- écrire un workflow GitHub Actions qui construit et publie une image Docker automatiquement ;
- utiliser GitHub Container Registry (`ghcr.io`) comme registry, avec une authentification intégrée sans configuration supplémentaire ;
- déployer automatiquement sur un VPS via SSH depuis la CI, en toute sécurité avec des secrets GitHub Actions ;
- expliquer pourquoi le serveur de production ne devrait plus jamais construire d'image lui-même une fois la CI/CD en place, seulement la télécharger.

## 📋 Prérequis

Chapitres 27 (registries), 29 (déploiement VPS).

## Pourquoi ce chapitre est important

Une procédure de déploiement manuelle, même bien documentée, finit toujours par comporter une étape oubliée un jour de fatigue ou d'urgence. L'automatiser élimine cette catégorie entière d'erreurs humaines, et rend chaque déploiement strictement identique au précédent — la même philosophie de reproductibilité qui anime tout ce manuel depuis le chapitre 1.

---

## Concepts fondamentaux

1. **Anatomie d'un workflow GitHub Actions** — `on`, `jobs`, `steps`.
2. **Construire et publier automatiquement** — vers `ghcr.io`.
3. **Déployer via SSH depuis la CI** — secrets, jamais en clair.
4. **Le serveur ne construit plus** — il télécharge.

---

## 31.1 Anatomie d'un workflow GitHub Actions

```yaml
# [.github/workflows/deploy.yml]
name: Build et déploiement

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Récupérer le code
        uses: actions/checkout@v4
```

**Explication :**
```text
on: push: branches: [main]
→ ce workflow se déclenche automatiquement à chaque "git push" sur "main"

jobs: build-and-push: runs-on: ubuntu-latest
→ un "job" (tâche) nommé, exécuté sur une machine virtuelle Ubuntu
  éphémère fournie gratuitement par GitHub (dans les limites d'un usage raisonnable)

steps: - uses: actions/checkout@v4
→ la première étape, quasi systématique : récupérer le code du dépôt
  sur cette machine virtuelle temporaire, qui démarre sans rien
```

---

## 31.2 Construire et publier automatiquement

```yaml
# [.github/workflows/deploy.yml, suite]
      - name: Connexion au registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Construire et pousser l'image backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          target: production
          push: true
          tags: ghcr.io/mon-compte/mon-projet-backend:latest

      - name: Construire et pousser l'image nginx
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/mon-compte/mon-projet-nginx:latest
          build-args: |
            VITE_API_URL=/api
```

**Explication :**
```text
ghcr.io (GitHub Container Registry)
→ un registry intégré à GitHub, alternative à Docker Hub (chapitre 27)

secrets.GITHUB_TOKEN
→ un jeton d'authentification généré AUTOMATIQUEMENT par GitHub pour
  chaque exécution du workflow, sans configuration manuelle nécessaire —
  contrairement à un token Docker Hub, qui exigerait la création
  d'un secret séparé (section 31.3)

docker/build-push-action@v5
→ une action officielle Docker qui combine "docker build" et "docker push"
  (chapitres 7 et 27) en une seule étape déclarative

target: production
→ rappel direct du chapitre 28 : utilise la cible de production du Dockerfile
  multi-étapes, jamais la cible de développement, dans ce contexte
```

> 📌 **À retenir** — `secrets.GITHUB_TOKEN` est un cas particulier pratique : GitHub le fournit automatiquement pour authentifier le workflow auprès de `ghcr.io`, sans qu'aucun secret ne soit à créer manuellement — un avantage réel de `ghcr.io` par rapport à Docker Hub dans ce contexte précis, où un token dédié devrait être généré et enregistré séparément (section 31.3).

---

## 31.3 Secrets GitHub Actions : jamais en clair

> ⚠️ **Attention — rappel absolu des chapitres 9 et 26** — Aucune information sensible (mot de passe SSH, clé privée, token Docker Hub) ne doit **jamais** apparaître directement dans un fichier `.yml` versionné. GitHub Actions fournit un mécanisme dédié : **Settings → Secrets and variables → Actions → New repository secret**, où chaque valeur est chiffrée et accessible uniquement via `${{ secrets.NOM }}` pendant l'exécution du workflow, jamais visible en clair dans les logs (GitHub masque automatiquement toute valeur correspondant à un secret configuré, même si le workflow tentait de l'afficher).

**Secrets à créer pour ce chapitre :**
```text
SSH_HOST           → l'adresse IP ou le domaine du VPS (chapitre 29)
SSH_USER           → l'utilisateur non-root créé au chapitre 29
SSH_PRIVATE_KEY    → une clé SSH privée DÉDIÉE à ce déploiement automatisé
                      (jamais ta clé personnelle habituelle — génère une paire
                      dédiée, et n'ajoute que sa clé publique aux autorisations
                      du serveur pour cet usage précis)
```

---

## 31.4 Déployer automatiquement via SSH

```yaml
# [.github/workflows/deploy.yml, suite]
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Déployer sur le VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/mon-projet
            docker compose -f compose.yaml -f compose.prod.yaml pull
            docker compose -f compose.yaml -f compose.prod.yaml up -d
```

**Explication :**
```text
needs: build-and-push
→ ce second job n'EST EXÉCUTÉ qu'après le succès complet du premier
  (build-and-push) — un déploiement n'a aucun sens si la construction
  de l'image a échoué

appleboy/ssh-action@v1
→ une action communautaire largement utilisée qui ouvre une connexion SSH
  vers le serveur et y exécute le script fourni, en utilisant les secrets
  définis en 31.3

docker compose ... pull
docker compose ... up -d
→ PAS de "--build" ici (contraste direct avec le chapitre 29) : le serveur
  ne construit plus rien, il TÉLÉCHARGE l'image déjà construite et publiée
  par le job précédent, puis relance les conteneurs avec cette nouvelle image
```

---

## 31.5 Le changement clé : `compose.prod.yaml` passe de `build:` à `image:`

> 📌 **À retenir — l'évolution la plus importante de ce chapitre** — Au chapitre 29, `compose.prod.yaml` utilisait `build:` — le serveur construisait lui-même l'image, directement depuis le code source cloné. **Avec la CI/CD en place, cette responsabilité change de main** : c'est désormais GitHub Actions qui construit (section 31.2), et le serveur se contente de **télécharger** (`pull`) l'image déjà prête.

```yaml
# [compose.prod.yaml — AVANT (chapitre 29), le serveur construisait]
services:
  backend:
    build:
      context: ./backend
      target: production

# [compose.prod.yaml — MAINTENANT (ce chapitre), le serveur télécharge]
services:
  backend:
    image: ghcr.io/mon-compte/mon-projet-backend:latest
```

| | Chapitre 29 (`build:`) | Chapitre 31 (`image:` + CI/CD) |
|---|---|---|
| Où l'image est construite | Directement sur le serveur de production | Sur une machine CI dédiée, jamais sur le serveur |
| Vitesse de déploiement | Lente (reconstruction complète à chaque fois, rappel chapitre 29) | Rapide (simple téléchargement d'une image déjà prête) |
| Outillage de build nécessaire sur le serveur | Oui | **Non** — le serveur n'a même plus besoin du code source complet, seulement de `compose.prod.yaml` et `.env.production` |
| Reproductibilité | Dépend de l'état exact du serveur au moment du build | Garantie identique, testée dans un environnement CI propre à chaque fois |

> ✅ **Bonne pratique** — Une fois la CI/CD en place, le serveur de production peut même ne plus avoir besoin de `git clone` le code applicatif dans son intégralité — seuls `compose.yaml`, `compose.prod.yaml` et `.env.production` (chapitre 28) suffisent à faire tourner l'application, l'intégralité du code source restant sur GitHub et dans les images publiées.

---

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Cause | Solution |
|---|---|---|
| Workflow échoue à l'étape de connexion au registry | Secret mal nommé ou absent dans les paramètres du dépôt | Vérifier l'orthographe exacte du nom du secret utilisé dans `${{ secrets.NOM }}` |
| Le job `deploy` s'exécute même si `build-and-push` a échoué | `needs: build-and-push` omis | Toujours lier les jobs dépendants avec `needs` |
| "Permission denied (publickey)" lors du déploiement SSH | Clé publique correspondante non ajoutée au `~/.ssh/authorized_keys` du serveur | Ajouter la clé publique de la paire dédiée au serveur avant le premier déploiement |
| Le serveur continue de reconstruire l'image malgré la CI/CD en place | `compose.prod.yaml` toujours en `build:` au lieu d'`image:` | Basculer explicitement vers `image:` (section 31.5) |
| Un secret apparaît accidentellement dans les logs du workflow | Rare, généralement une manipulation indirecte non masquée par GitHub | Ne jamais afficher un secret via une transformation (encodage, concaténation) qui échapperait au masquage automatique |

---

## Laboratoire pratique n°1 — Construire et publier automatiquement

**Objectifs :** exécuter la section 31.2 sur un vrai dépôt GitHub.
**Prérequis :** Chapitre 30, un dépôt GitHub du projet.

**Étapes :** crée `.github/workflows/deploy.yml` avec uniquement le job `build-and-push`, pousse sur `main`, observe l'exécution dans l'onglet "Actions" de GitHub.

**Résultat attendu :** une image visible dans les "Packages" du dépôt GitHub (ou du compte), correspondant à `ghcr.io/.../mon-projet-backend:latest`.

---

## Laboratoire pratique n°2 — Déploiement automatique complet

**Objectifs :** exécuter les sections 31.3 et 31.4.
**Prérequis :** Laboratoire 1 complété, VPS du chapitre 29 accessible.

**Étapes :** génère une paire de clés SSH dédiée, ajoute la clé publique au serveur, configure les trois secrets GitHub, ajoute le job `deploy`, pousse une modification mineure sur `main`, et observe le déploiement automatique complet.

**Résultat attendu :** l'application sur le VPS reflète la modification poussée, sans qu'aucune commande manuelle n'ait été tapée sur le serveur.

---

## Laboratoire pratique n°3 — Basculer `compose.prod.yaml` de `build:` vers `image:`

**Objectifs :** appliquer et vérifier la section 31.5.
**Prérequis :** Laboratoires 1 et 2 complétés.

**Étapes :** modifie `compose.prod.yaml` pour utiliser `image:` plutôt que `build:`, pousse un nouveau changement, et confirme dans les logs du déploiement (via `docker compose logs` ou l'observation du temps d'exécution) que le serveur ne construit plus rien, uniquement `pull`.

**Résultat attendu :** un déploiement visiblement plus rapide qu'avec `build:`, confirmant le changement de responsabilité.

---

## Exercices

1. Pourquoi `needs: build-and-push` est-il indispensable entre les deux jobs de ce workflow ?
2. Pourquoi `ghcr.io` avec `secrets.GITHUB_TOKEN` est-il plus simple à configurer que Docker Hub dans ce contexte précis ?
3. Explique pourquoi une clé SSH dédiée au déploiement automatisé est préférable à ta clé personnelle.
4. Quelle est la différence de responsabilité entre le chapitre 29 et ce chapitre concernant la construction de l'image ?
5. Que se passerait-il si `compose.prod.yaml` restait en `build:` malgré la CI/CD en place ?

---

## Quiz

**Question 1.** `needs: build-and-push` sur le job `deploy` signifie :
a) Les deux jobs s'exécutent simultanément, sans lien
b) Le job `deploy` n'est exécuté qu'après le succès complet du job `build-and-push`
c) Le job `build-and-push` est ignoré
d) Aucun effet réel

**Question 2.** `secrets.GITHUB_TOKEN` pour `ghcr.io` :
a) Doit être créé manuellement comme tout autre secret
b) Est fourni automatiquement par GitHub pour chaque exécution du workflow
c) N'existe pas
d) Nécessite un abonnement payant

**Question 3.** Avec la CI/CD de ce chapitre, le serveur de production :
a) Construit toujours lui-même l'image, comme au chapitre 29
b) Se contente de télécharger (`pull`) une image déjà construite ailleurs
c) N'exécute plus jamais Docker
d) Ne reçoit plus aucune mise à jour

**Question 4.** Une clé SSH dédiée au déploiement automatisé, plutôt que la clé personnelle du développeur, est recommandée parce que :
a) Elle est plus rapide à utiliser
b) Elle limite le risque en cas de compromission, sans exposer un accès personnel plus large
c) GitHub Actions ne peut pas utiliser de clé personnelle
d) Aucune raison particulière

**Question 5.** Basculer `compose.prod.yaml` de `build:` à `image:` a pour effet :
a) De ralentir chaque déploiement
b) D'accélérer chaque déploiement, en évitant une reconstruction complète sur le serveur
c) De supprimer la nécessité d'un registry
d) De rendre `docker compose pull` inutile

> 🔑 **Corrigé** — 1: b · 2: b · 3: b · 4: b · 5: b

---

## 📝 Résumé du chapitre

- Un workflow GitHub Actions se déclenche sur un événement (`on: push`), exécute des `jobs` composés de `steps` sur des machines virtuelles éphémères fournies par GitHub.
- `docker/build-push-action` construit et publie une image en une étape déclarative ; `ghcr.io` avec `secrets.GITHUB_TOKEN` simplifie l'authentification sans configuration manuelle.
- Aucun secret n'apparaît jamais en clair — toujours via **Settings → Secrets**, avec masquage automatique dans les logs.
- Le déploiement automatique via SSH utilise une clé dédiée, jamais la clé personnelle du développeur.
- Une fois la CI/CD en place, `compose.prod.yaml` bascule de `build:` (le serveur construit) à `image:` (le serveur télécharge) — un changement de responsabilité qui accélère et fiabilise chaque déploiement.

## ✅ Checklist avant de passer au chapitre 32

- [ ] J'ai un workflow GitHub Actions qui construit et publie automatiquement.
- [ ] Mes secrets sont configurés via Settings → Secrets, jamais en clair.
- [ ] Le déploiement automatique fonctionne de bout en bout via SSH.
- [ ] `compose.prod.yaml` utilise `image:`, pas `build:`.
- [ ] J'ai réalisé les trois laboratoires de ce chapitre.
- [ ] J'ai obtenu au moins 4/5 au quiz.

---

## Glossaire du chapitre

**Workflow (GitHub Actions)**
Définition simple : un fichier YAML décrivant une automatisation déclenchée par un événement du dépôt.
Voir : Chapitre 31, section 31.1.

**Job / Step**
Définition simple : un job est une unité d'exécution (sur une machine dédiée) ; un step est une action individuelle à l'intérieur d'un job.
Voir : Chapitre 31, section 31.1.

**GitHub Container Registry (ghcr.io)**
Définition simple : le registry intégré à GitHub, alternative à Docker Hub.
Voir : Chapitre 31, section 31.2.

---

## ❓ FAQ

**Peut-on utiliser GitLab CI ou un autre outil plutôt que GitHub Actions ?**
Oui — le principe (déclencher sur push, construire, publier, déployer) est identique, seule la syntaxe YAML change entre GitHub Actions, GitLab CI, ou d'autres plateformes. Ce chapitre choisit GitHub Actions par cohérence avec l'hébergement du code sur GitHub, déjà supposé dans ce manuel.

**Faut-il tester l'application avant de construire l'image, dans la CI ?**
Idéalement oui — une étape `npm test` avant la construction, qui ferait échouer tout le workflow (et donc bloquerait le déploiement) en cas de test cassé. Ce manuel ne développe pas de suite de tests automatisés dédiée, mais l'ajout d'une telle étape suit exactement le même principe que les steps déjà vus dans ce chapitre.

**Le déploiement automatique remplace-t-il totalement le besoin de comprendre le chapitre 29 ?**
Non — comprendre le déploiement manuel reste essentiel pour diagnostiquer un problème quand l'automatisation elle-même échoue, ou pour un premier déploiement initial sur un serveur tout juste préparé.

---

## Références officielles

- Documentation GitHub Actions — [docs.github.com/actions](https://docs.github.com/actions)
- `docker/build-push-action` — [github.com/docker/build-push-action](https://github.com/docker/build-push-action)
- GitHub Container Registry — [docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- `appleboy/ssh-action` — [github.com/appleboy/ssh-action](https://github.com/appleboy/ssh-action)

---

## Conclusion

Chaque `git push` déclenche désormais, seul, tout un pipeline jusqu'à la production. Le chapitre 32 s'attaque à ce que cette automatisation rend encore plus nécessaire : une vraie stratégie de versioning, de mise à jour, et — le jour où un déploiement casse quelque chose — de retour en arrière rapide et fiable.

---

⬅️ [Chapitre 30 — Domaine et HTTPS](30-domaine-et-https.md) · ➡️ **Suite : Chapitre 32 — Mettre à jour, versionner et revenir en arrière**
