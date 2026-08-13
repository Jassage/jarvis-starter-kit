# Annexe C — Checklists professionnelles

> Douze checklists prêtes à imprimer ou à copier dans un projet réel. Chaque point renvoie au chapitre qui l'explique.

---

## 1. Checklist installation Docker

- [ ] `docker --version` répond (chapitre 3).
- [ ] `docker info` répond sans erreur (le daemon est démarré).
- [ ] `docker run hello-world` réussit.
- [ ] (Linux) `docker ps` fonctionne sans `sudo`.
- [ ] (Windows) WSL 2 confirmé actif (`wsl --list --verbose`).
- [ ] `docker compose version` répond.

## 2. Checklist création d'image

- [ ] Image de base épinglée à une version précise, jamais `latest` (chapitre 5).
- [ ] `.dockerignore` présent et à jour (chapitre 7).
- [ ] Dépendances copiées avant le reste du code (cache, chapitre 7).
- [ ] `USER` non-root défini (chapitre 6, 26).
- [ ] Aucun secret en dur dans le Dockerfile (chapitre 9, 26).
- [ ] `docker history` vérifié pour repérer une couche anormalement volumineuse (chapitre 5).

## 3. Checklist Dockerfile

- [ ] `FROM` avec tag précis.
- [ ] `WORKDIR` défini avant les instructions qui en dépendent.
- [ ] `COPY` plutôt qu'`ADD`, sauf besoin explicite.
- [ ] Commandes de nettoyage combinées avec l'installation qu'elles nettoient (chapitre 25).
- [ ] Multi-stage build si une étape de compilation/construction existe (chapitre 15, 25).
- [ ] `EXPOSE` documenté (sans oublier qu'il ne publie rien, chapitre 6).
- [ ] `HEALTHCHECK` défini, cohérent avec une vraie route de santé (chapitre 21).
- [ ] Forme exec préférée à la forme shell pour `CMD`/`ENTRYPOINT` (chapitre 6).

## 4. Checklist Docker Compose

- [ ] Réseau personnalisé implicite (via Compose) vérifié fonctionnel (résolution DNS par nom, chapitre 11-12).
- [ ] Volumes nommés pour toute donnée persistante (chapitre 10).
- [ ] Seul le service public publie un port (chapitre 8, 11, 20).
- [ ] `depends_on` avec `condition: service_healthy` partout où une vraie dépendance existe (chapitre 21).
- [ ] `.env`/`.env.example` correctement séparés (chapitre 9, 28).
- [ ] `docker compose config` vérifié avant tout déploiement sensible (chapitre 48).

## 5. Checklist développement

- [ ] Bind mount en place pour un rechargement rapide du code (chapitre 10, 14).
- [ ] Cible de build `dev` distincte de la cible `production` (chapitre 28).
- [ ] `compose.override.yaml` non versionné s'il contient des réglages personnels (chapitre 28).
- [ ] Données de développement isolées de toute donnée de production (chapitre 28).

## 6. Checklist production

- [ ] `compose.prod.yaml` utilise `image:`, pas `build:`, une fois la CI/CD en place (chapitre 31).
- [ ] `restart: unless-stopped` sur les services critiques (chapitre 35).
- [ ] Limites de ressources (`limits`/`reservations`) dimensionnées, pas laissées par défaut (chapitre 35).
- [ ] HTTPS actif, certificat renouvelé automatiquement et vérifié (chapitre 30).
- [ ] `.env.production` jamais versionné, transféré séparément (chapitre 9, 28, 29).
- [ ] Pare-feu limité à 22/80/443, aucun port interne exposé (chapitre 29, 48).

## 7. Checklist sécurité

- [ ] `USER` non-root sur tous les services construits (chapitre 6, 26).
- [ ] `cap_drop: ["ALL"]` avec ajout ciblé des seules capabilities nécessaires (chapitre 26).
- [ ] `read_only` + `tmpfs` ciblé là où c'est compatible (chapitre 26).
- [ ] Secrets de build via `--mount=type=secret`, jamais `ARG`/`ENV` (chapitre 26).
- [ ] Images scannées avant déploiement (`docker scout` ou équivalent) et régulièrement après (chapitre 26).
- [ ] Socket Docker jamais monté dans un conteneur sans nécessité strictement justifiée (chapitre 26).
- [ ] Base de données jamais accessible directement depuis l'extérieur (chapitre 8, 11).

## 8. Checklist sauvegarde

- [ ] Sauvegarde automatisée (script + tâche planifiée), pas manuelle (chapitre 33).
- [ ] Dump logique privilégié pour les bases de données actives (chapitre 33).
- [ ] Politique de rétention en place (chapitre 33).
- [ ] Copie stockée hors du serveur d'origine (règle 3-2-1, chapitre 33).
- [ ] `.env.production` chiffré avant tout transfert de sauvegarde (chapitre 33).
- [ ] **Restauration réellement testée**, pas seulement supposée fonctionner (chapitre 33).

## 9. Checklist déploiement VPS

- [ ] VPS avec accès SSH sécurisé de base (utilisateur non-root, clé SSH) (chapitre 29).
- [ ] Docker installé et démarrage automatique confirmé (`systemctl is-enabled docker`) (chapitre 3, 29).
- [ ] `.env.production` transféré séparément, jamais via Git (chapitre 29).
- [ ] Application vérifiée fonctionnelle en local sur le serveur avant tout domaine/HTTPS (chapitre 29).
- [ ] Domaine pointé et propagé avant toute tentative de certificat (chapitre 30).
- [ ] Pare-feu final vérifié (22/80/443 uniquement) (chapitre 29).

## 10. Checklist CI/CD

- [ ] Aucun secret en clair dans le fichier de workflow (chapitre 26, 31).
- [ ] Secrets configurés via l'interface dédiée (Settings → Secrets), jamais autrement (chapitre 31).
- [ ] Clé SSH dédiée au déploiement automatisé, jamais la clé personnelle (chapitre 31).
- [ ] Job de déploiement dépendant explicitement du succès du job de build (`needs:`) (chapitre 31).
- [ ] Migrations exécutées comme étape séparée, jamais au démarrage du conteneur (chapitre 36).
- [ ] Image publiée avec un tag immuable en plus de `:latest` (chapitre 32).

## 11. Checklist mise à jour

- [ ] Sauvegarde effectuée avant toute mise à jour à risque (chapitre 32, 33).
- [ ] Migrations testées avant application en production (chapitre 36).
- [ ] Déploiement suivi d'une étape "Verify" active (curl, `docker compose ps`), jamais supposé réussi par défaut (chapitre 32).
- [ ] Version précédente identifiée et notée avant le déploiement, au cas où un rollback serait nécessaire (chapitre 32).

## 12. Checklist rollback

- [ ] Tag immuable de la version précédente connu et disponible dans le registry (chapitre 32).
- [ ] Rollback exécuté en pointant vers ce tag, sans reconstruction (chapitre 32).
- [ ] Vérification post-rollback effectuée (chapitre 32).
- [ ] Cas d'une migration de base de données déjà appliquée traité séparément — un rollback d'image ne l'annule jamais seul (chapitre 32, 36).

---

⬅️ [Annexe B — Glossaire](ANNEXE-B-glossaire.md) · ➡️ **Retour au [Plan éditorial](../PLAN-EDITORIAL.md)**
