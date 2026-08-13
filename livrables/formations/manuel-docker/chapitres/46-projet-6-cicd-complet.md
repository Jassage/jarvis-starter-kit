# Chapitre 46 — Projet 6 : automatiser avec CI/CD

**Niveau : Avancé**

---

## Introduction

Dernier des six projets progressifs. Le déploiement manuel du projet 5 (chapitre 45) devient entièrement automatique : `git push` → construction → publication → déploiement → vérifiable en quelques minutes, avec un rollback prêt en cas de problème. Réutilise directement les chapitres 27, 31 et 32.

---

## 🎯 Objectif du projet

Le projet 5, déployé automatiquement à chaque `git push` sur `main`, avec un mécanisme de rollback fonctionnel.

## 📋 Prérequis

Chapitres 27, 31, 32, et le projet 5 (chapitre 45).

## Pourquoi ce projet est important

C'est l'aboutissement opérationnel de tout le manuel : plus aucune commande manuelle entre le code et la production, avec la sécurité d'un retour en arrière rapide si nécessaire.

---

## Cahier des charges

```text
1. Workflow GitHub Actions : build, push vers ghcr.io, déploiement SSH
2. compose.prod.yaml basculé de "build:" à "image:"
3. Double tag :latest et :sha pour chaque image
4. Un rollback testé en conditions réelles
```

---

## 46.1 Workflow complet (rappel du chapitre 31)

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
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          target: production
          push: true
          tags: |
            ghcr.io/mon-compte/projet4-backend:latest
            ghcr.io/mon-compte/projet4-backend:${{ github.sha }}
      - uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          build-args: |
            VITE_API_URL=/api
          tags: |
            ghcr.io/mon-compte/projet4-nginx:latest
            ghcr.io/mon-compte/projet4-nginx:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/projet-4
            docker compose -f compose.yaml -f compose.prod.yaml exec -T backend npx prisma migrate deploy
            docker compose -f compose.yaml -f compose.prod.yaml pull
            docker compose -f compose.yaml -f compose.prod.yaml up -d
```

**Rappel appliqué :** double tag (chapitre 32, section 32.1), migration comme étape séparée (chapitre 36), `pull`/`up -d` sans `--build` (chapitre 31, section 31.5).

---

## 46.2 `compose.prod.yaml` : de `build:` à `image:` (rappel du chapitre 31)

```yaml
# [compose.prod.yaml, extrait]
services:
  backend:
    image: ghcr.io/mon-compte/projet4-backend:${BACKEND_TAG:-latest}
  nginx:
    image: ghcr.io/mon-compte/projet4-nginx:${NGINX_TAG:-latest}
```

---

## 46.3 Test complet : déploiement puis rollback (rappel du chapitre 32)

```bash
# [Terminal, local] — déclencher le pipeline
git push origin main
```

```bash
# [Terminal, sur le serveur, si un rollback s'avère nécessaire — rappel chapitre 32, section 32.3]
BACKEND_TAG=<sha-precedent> docker compose -f compose.yaml -f compose.prod.yaml up -d backend
```

---

## Laboratoire pratique n°1 — Mettre en place le pipeline complet

**Objectifs :** exécuter les sections 46.1-46.2.
**Prérequis :** Chapitre 45.

**Résultat attendu :** un `git push` déclenchant un déploiement automatique vérifié.

---

## Laboratoire pratique n°2 — Provoquer et corriger une régression par rollback

**Objectifs :** exécuter la section 46.3 dans un scénario réel (rappel chapitre 32, laboratoire 3).
**Prérequis :** Laboratoire 1 complété.

**Résultat attendu :** une régression détectée et corrigée en quelques minutes, sans reconstruction.

---

## Laboratoire pratique n°3 — Auditer le pipeline complet

**Objectifs :** relire le workflow et confirmer qu'aucun secret n'y apparaît en clair (rappel chapitre 26, 31).
**Prérequis :** Laboratoires 1 et 2 complétés.

**Résultat attendu :** un pipeline conforme aux exigences de sécurité de tout le manuel.

---

## ✅ Checklist avant de passer au chapitre 47

- [ ] Un `git push` déclenche un déploiement complet et vérifié.
- [ ] Un rollback a été testé en conditions réelles.
- [ ] Aucun secret n'apparaît en clair dans le workflow.

---

## Conclusion

Six projets progressifs, du plus simple au plus automatisé. Le chapitre 47 les rassemble une dernière fois dans un projet fil rouge complet, du dossier vide jusqu'à la production automatisée.

---

⬅️ [Chapitre 45 — Projet 5](45-projet-5-deploiement-vps.md) · ➡️ **Suite : Chapitre 47 — Projet final : système de gestion scolaire**
