# Chapitre 45 — Projet 5 : déploiement en production du Projet 4 sur VPS

**Niveau : Avancé**

---

## Introduction

Le projet 4 (chapitre 44) tourne en local. Ce projet le déploie réellement : un VPS, un domaine, HTTPS, et des sauvegardes automatisées — l'assemblage complet des chapitres 28, 29, 30 et 33, sans notion nouvelle.

---

## 🎯 Objectif du projet

Le projet 4 accessible en production, sous un vrai domaine, en HTTPS, avec des sauvegardes PostgreSQL automatisées et testées.

## 📋 Prérequis

Chapitres 28, 29, 30, 33, et le projet 4 (chapitre 44).

## Pourquoi ce projet est important

C'est le moment où la théorie de production de la Partie VIII devient un déploiement réel, vérifiable depuis n'importe quel navigateur dans le monde.

---

## Cahier des charges

```text
1. VPS préparé et sécurisé (chapitre 29)
2. .env.production séparé, jamais versionné (chapitre 28)
3. Domaine pointé, HTTPS actif et renouvelé automatiquement (chapitre 30)
4. Sauvegardes PostgreSQL automatisées, testées par restauration (chapitre 33)
```

---

## 45.1 Préparer le serveur (rappel du chapitre 29)

```bash
# [Terminal, sur le VPS — reprendre intégralement la section 29.4]
docker --version
docker compose version
```

---

## 45.2 `.env.production` et `compose.prod.yaml` (rappel du chapitre 28)

```bash
# [Terminal, local] — transfert sécurisé, rappel chapitre 29, section 29.6
scp .env.production jaslin@IP_DU_SERVEUR:~/projet-4/.env.production
```

```yaml
# [compose.prod.yaml, extrait — rappel chapitre 28]
services:
  backend:
    build:
      target: production
    restart: unless-stopped
```

---

## 45.3 HTTPS (rappel du chapitre 30)

```yaml
# [compose.prod.yaml, extrait — ajout des services certbot, rappel chapitre 30, section 30.3]
services:
  certbot:
    image: certbot/certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
      - certbot-webroot:/var/www/certbot
    entrypoint: >
      sh -c "trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done"

volumes:
  certbot-etc:
  certbot-webroot:
```

```bash
# [Terminal, sur le serveur] — obtenir le premier certificat, rappel chapitre 30, section 30.5
docker compose -f compose.yaml -f compose.prod.yaml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d mondomaine.ht --email toi@exemple.ht --agree-tos --no-eff-email
```

---

## 45.4 Sauvegardes automatisées (rappel du chapitre 33)

```bash
# [backup.sh, sur le serveur — rappel chapitre 33, section 33.4]
#!/bin/bash
set -e
DATE=$(date +%Y%m%d-%H%M%S)
docker compose -f /home/jaslin/projet-4/compose.yaml exec -T db \
  pg_dump -U app_user app | gzip > "/home/jaslin/backups/app-$DATE.sql.gz"
find /home/jaslin/backups -name "*.sql.gz" -mtime +30 -delete
```

```cron
0 3 * * * /home/jaslin/backup.sh
0 4 * * * docker compose -f /home/jaslin/projet-4/compose.yaml -f /home/jaslin/projet-4/compose.prod.yaml exec nginx nginx -s reload
```

---

## 45.5 Vérification finale

```bash
# [Terminal, depuis n'importe quelle machine]
curl -I https://mondomaine.ht/
curl https://mondomaine.ht/api/tasks
```

**Résultat attendu :** une réponse `200`, avec un certificat HTTPS valide, sans avertissement.

---

## Laboratoire pratique n°1 — Déployer le projet 4 en production

**Objectifs :** exécuter les sections 45.1-45.2.
**Prérequis :** Chapitre 44.

**Résultat attendu :** le projet 4 accessible via l'IP du VPS, sans encore de domaine ni HTTPS.

---

## Laboratoire pratique n°2 — Activer HTTPS

**Objectifs :** exécuter la section 45.3.
**Prérequis :** Laboratoire 1 complété.

**Résultat attendu :** accès HTTPS fonctionnel, vérifié depuis un navigateur externe.

---

## Laboratoire pratique n°3 — Sauvegarder et restaurer réellement

**Objectifs :** exécuter la section 45.4, puis restaurer réellement (rappel chapitre 33, section 33.6).
**Prérequis :** Laboratoires 1 et 2 complétés.

**Résultat attendu :** une sauvegarde automatisée, testée par une vraie restauration en environnement isolé.

---

## ✅ Checklist avant de passer au chapitre 46

- [ ] Le projet 4 est accessible en HTTPS, sous un vrai domaine.
- [ ] Les sauvegardes sont automatisées et testées par restauration.
- [ ] `.env.production` n'a jamais transité par Git.

---

## Conclusion

Une vraie application en production, complète. Le chapitre 46 automatise ce déploiement lui-même, pour qu'il ne dépende plus jamais d'une commande manuelle.

---

⬅️ [Chapitre 44 — Projet 4](44-projet-4-application-professionnelle.md) · ➡️ **Suite : Chapitre 46 — Projet 6 : automatiser avec CI/CD**
