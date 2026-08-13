# Chapitre 19 — Étude de cas : React + Express + PostgreSQL

**Niveau : Intermédiaire**

---

## Introduction

Cette étude de cas est la première d'une série de dix, chacune partant d'un serveur Ubuntu strictement vierge jusqu'à une mise en production réellement sécurisée. Elle ne t'apprend aucune notion nouvelle — chaque commande utilisée ici a déjà été enseignée, expliquée et pratiquée dans les chapitres 1 à 18. Son seul objectif est de prouver, par l'exemple le plus représentatif du manuel (la stack la plus fréquente dans le développement web moderne), que tout s'articule correctement de bout en bout.

## 🎯 Objectifs pédagogiques

À la fin de ce chapitre, tu sauras dérouler, seul et de mémoire, le déploiement complet d'une application React (statique) consommant une API Express (process Node), avec PostgreSQL comme base de données, jusqu'à une mise en production HTTPS, surveillée et sauvegardée.

## 📋 Prérequis

L'intégralité des chapitres 1 à 18. Un domaine réel disponible (ou un sous-domaine de test), un compte hébergeur VPS, un compte GitHub.

## Pourquoi ce chapitre est important

Un manuel appris chapitre par chapitre laisse parfois une question ouverte : "est-ce que je sais vraiment tout enchaîner seul ?" Cette étude de cas répond directement à cette question, sans filet — un déroulé unique, continu, du premier `ssh root@` jusqu'au dernier test de charge.

---

## Concepts fondamentaux (rappel de l'architecture cible)

```mermaid
flowchart TD
    Internet(["Internet"]) --> FW["Pare-feu (ufw)"]
    FW --> Nginx["Nginx"]
    Nginx -->|"app.tondomaine.ht"| Front["Frontend React statique"]
    Nginx -->|"api.tondomaine.ht"| Back["API Express (PM2)"]
    Back --> PG[("PostgreSQL")]
    Back -.-> Redis[("Redis, optionnel — cache")]
```

---

## Contexte du projet

**Brief client fictif, représentatif d'une mission freelance réelle.** Une petite association souhaite une plateforme de gestion de membres et de cotisations : une interface React pour l'équipe administrative, une API Express exposant les données, PostgreSQL comme entrepôt. Budget modeste, un seul VPS, un seul domaine avec deux sous-domaines.

---

## Explications détaillées : le déroulé complet

### 19.1 Préparer le serveur (rappel condensé, chapitre 4)

```bash
ssh root@ADRESSE_IP
apt update && apt upgrade -y
adduser jaslin
usermod -aG sudo jaslin
# En local :
ssh-keygen -t ed25519 -C "jaslin@association"
ssh-copy-id jaslin@ADRESSE_IP
# Puis, connecté en jaslin :
sudo nano /etc/ssh/sshd_config   # PermitRootLogin no / PasswordAuthentication no
sudo systemctl restart ssh
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
sudo apt install fail2ban -y
sudo timedatectl set-timezone America/Port-au-Prince
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
> 📌 Chaque commande ci-dessus est expliquée en détail au chapitre 4 — ce chapitre ne fait que les enchaîner dans leur ordre réel de production.

### 19.2 Installer les logiciels nécessaires (chapitre 5)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts && nvm alias default lts/*
npm install -g pm2
sudo apt install postgresql postgresql-contrib nginx -y
sudo apt install certbot python3-certbot-nginx -y
```

### 19.3 Sécuriser PostgreSQL et créer la base (chapitre 12)

```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE association;
CREATE USER association_user WITH ENCRYPTED PASSWORD 'MOT_DE_PASSE_REEL';
GRANT ALL PRIVILEGES ON DATABASE association TO association_user;
\q
```
```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
# host association association_user 127.0.0.1/32 scram-sha-256
sudo systemctl restart postgresql
```

### 19.4 Déployer le backend Express (chapitre 3 pour le clone, chapitre 6)

```bash
ssh-keygen -t ed25519 -C "serveur-association"
cat ~/.ssh/id_ed25519.pub   # à coller en Deploy Key GitHub, lecture seule

git clone git@github.com:tonorg/association-backend.git ~/backend
cd ~/backend
npm ci
cp .env.example .env
nano .env
# DATABASE_URL=postgresql://association_user:MOT_DE_PASSE_REEL@localhost:5432/association
# JWT_SECRET=$(openssl rand -hex 32)
# CORS_ORIGINS=https://app.tondomaine.ht
# PORT=4000

npx prisma migrate deploy
npm run build
pm2 start dist/server.js --name association-api
pm2 startup   # exécuter la commande générée
pm2 save
```

### 19.5 Déployer le frontend React (chapitre 6, section 6.2)

En local :
```bash
# .env.production
# VITE_API_URL=https://api.tondomaine.ht

npm run build
rsync -avz --delete dist/ jaslin@ADRESSE_IP:~/sites/association-frontend/
```

### 19.6 Configurer Nginx (chapitre 9)

```nginx
# /etc/nginx/sites-available/association
server {
    listen 80;
    server_name app.tondomaine.ht;
    root /home/jaslin/sites/association-frontend;
    index index.html;

    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(css|js|jpg|jpeg|png|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

server {
    listen 80;
    server_name api.tondomaine.ht;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/association /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 19.7 Activer HTTPS (chapitre 10)

```bash
sudo certbot --nginx -d app.tondomaine.ht -d api.tondomaine.ht
sudo certbot renew --dry-run
```

### 19.8 Sauvegardes automatisées (chapitre 12, ou 16 pour Restic)

```bash
mkdir -p ~/scripts
nano ~/scripts/backup-db.sh
```
```bash
#!/bin/bash
set -e
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_DIR="/var/backups/association"
mkdir -p "$BACKUP_DIR"
pg_dump -U association_user -d association -F c -f "$BACKUP_DIR/association_$DATE.dump"
find "$BACKUP_DIR" -name "*.dump" -mtime +14 -delete
rclone copy "$BACKUP_DIR/association_$DATE.dump" remote:Association-Backups/
```
```bash
chmod +x ~/scripts/backup-db.sh
crontab -e
# 0 2 * * * /home/jaslin/scripts/backup-db.sh >> /var/log/backup-association.log 2>&1
```

### 19.9 Monitoring minimal (chapitre 13)

```bash
curl -Ss https://get.netdata.cloud/kickstart.sh -o /tmp/netdata-kickstart.sh
sudo sh /tmp/netdata-kickstart.sh
```
Uptime Kuma installé sur une **seconde** petite machine (rappel du chapitre 13, section 13.6), surveillant `https://app.tondomaine.ht` et `https://api.tondomaine.ht/health`.

### 19.10 CI/CD (chapitre 11, optionnel mais recommandé)

```yaml
# .github/workflows/deploy.yml (backend)
name: Deploy backend
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd backend && npm ci && npm test && npm run build
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd ~/backend && git pull origin main && npm ci
            npx prisma migrate deploy && npm run build
            pm2 restart association-api
```

### 19.11 Checklist finale de mise en production

- [ ] `https://app.tondomaine.ht` et `https://api.tondomaine.ht` répondent en `200`, cadenas fermé.
- [ ] `pm2 list` montre l'API "online", sans redémarrage en boucle.
- [ ] `npx prisma migrate status` confirme la base à jour.
- [ ] Une sauvegarde a été prise **et restaurée** avec succès sur une base de test.
- [ ] `sudo certbot renew --dry-run` réussit.
- [ ] Un moniteur externe est actif, hébergé ailleurs que ce serveur.
- [ ] `sudo ufw status` ne montre que 22/80/443.
- [ ] Un audit Lynis rapide (chapitre 15) ne révèle aucune régression majeure.

---

## Bonnes pratiques (récapitulatif du chapitre)

- Toujours dans cet ordre : serveur sécurisé → logiciels → base de données sécurisée → backend → frontend → nginx → HTTPS → sauvegardes → monitoring.
- Une Deploy Key dédiée à ce projet précis, jamais réutilisée d'un autre.
- Chaque secret (`JWT_SECRET`, mot de passe DB) généré spécifiquement pour ce projet, jamais copié d'un autre.

## Erreurs fréquentes (récapitulatif du chapitre)

| Erreur | Pourquoi elle arrive | Conséquence |
|---|---|---|
| Oublier `pm2 save` après `pm2 startup` | Étape jugée redondante | Application hors ligne après un reboot |
| `VITE_API_URL` encore sur localhost au premier build de prod | Oubli après le développement local | Frontend inutilisable en production |
| Certificat demandé avant propagation DNS complète | Impatience | Échec Certbot, risque de rate limit |

---

## Captures d'écran à réaliser

> 📸 **Capture 22**
> **Logiciel :** navigateur
> **Pourquoi cette capture est utile :** documenter l'application complète, fonctionnelle en production, comme preuve finale de ce chapitre.
> **Page/écran concerné :** l'interface React déployée, connectée à l'API réelle
> **Niveau de zoom conseillé :** 100 %
> **Montrer :** une donnée réelle chargée depuis l'API (liste de membres, par exemple)
> **Entourer :** le cadenas HTTPS dans la barre d'adresse
> **Flouter/masquer :** toute donnée personnelle si des données réelles (pas de test) sont utilisées

---

## Laboratoire pratique n°1 — Déployer cette stack de bout en bout

**Objectifs :** reproduire l'intégralité de ce chapitre sur un VPS réel.
**Prérequis :** un VPS neuf, un domaine de test.
**Étapes :** suivre les sections 19.1 à 19.9 dans l'ordre, sans sauter d'étape.
**Résultat attendu :** une application fonctionnelle, accessible en HTTPS.
**Vérifications :** la checklist de la section 19.11 entièrement cochée.
**Erreurs fréquentes et solutions :** voir le tableau ci-dessus et le chapitre 18 en cas de blocage.

## Laboratoire pratique n°2 — Ajouter une fonctionnalité et la déployer via CI/CD

**Objectifs :** exercer le cycle complet de développement jusqu'au déploiement automatisé.
**Prérequis :** Laboratoire 1 complété, CI/CD configurée (section 19.10).
**Étapes :** ajoute un champ simple à l'API (une nouvelle route), committe sur une branche, fusionne sur `main`, observe le déploiement automatique.
**Résultat attendu :** la nouvelle route accessible en production sans intervention manuelle.
**Vérifications :** `curl` sur la nouvelle route confirme son fonctionnement.

## Laboratoire pratique n°3 — Simuler une panne et la diagnostiquer avec le chapitre 18

**Objectifs :** appliquer la méthodologie de diagnostic sur cette stack précise.
**Prérequis :** Laboratoires 1 et 2 complétés.
**Étapes :** provoque une panne (au choix parmi les scénarios du chapitre 18), diagnostique-la avec l'arbre de décision approprié, résous-la.
**Résultat attendu :** un diagnostic et une résolution réussis en autonomie.

---

## Exercices

1. Explique pourquoi l'ordre des sections 19.1 à 19.9 est important, et ce qui casserait si on inversait deux étapes.
2. Cette étude de cas utilise deux sous-domaines. Explique pourquoi, plutôt qu'un seul domaine avec `/api`.
3. Quelle section de ce chapitre pourrais-tu sauter si le projet n'avait aucune exigence de haute disponibilité, et pourquoi ne serait-ce pas recommandé malgré tout ?

## Quiz

**Question 1.** Dans cette architecture, à quoi sert PM2 ?
a) Servir les fichiers statiques du frontend
b) Superviser le process Express en continu
c) Gérer PostgreSQL
d) Émettre les certificats SSL

**Question 2.** Pourquoi `npx prisma migrate deploy` doit-il s'exécuter avant `pm2 restart` ?
a) L'ordre n'a aucune importance
b) Le nouveau code peut dépendre d'un schéma de base déjà à jour
c) `pm2 restart` applique automatiquement les migrations
d) Prisma l'exige techniquement dans tous les cas

> 🔑 **Corrigé** — 1: b · 2: b

---

## 📝 Résumé du chapitre

Cette étude de cas a déroulé, sans rien omettre, le chemin complet d'une stack React + Express + PostgreSQL, du serveur vierge à la production surveillée et sauvegardée — chaque étape renvoyant à son chapitre d'origine pour approfondissement.

## ✅ Checklist avant de passer au chapitre 20

- [ ] J'ai déployé cette stack (ou une stack équivalente) de bout en bout au moins une fois.
- [ ] La checklist de mise en production (19.11) est entièrement validée.
- [ ] J'ai réalisé les trois laboratoires.

---

## Glossaire du chapitre

**Stack**
Définition simple : l'ensemble des technologies utilisées ensemble pour une application.
Définition technique : la combinaison précise de langages, frameworks, bases de données et outils d'infrastructure choisis pour un projet.
Exemple concret : React + Express + PostgreSQL.
Voir : Chapitre 19, introduction.

---

## ❓ FAQ

**Cette étude de cas est-elle transposable à un projet réel ?**
Directement — c'est son but. Remplace les noms de domaine, secrets et détails métier par les tiens, et la séquence reste identique.

## Références officielles

Voir les références de chaque chapitre mobilisé (3 à 16).

## Conclusion

Cette première étude de cas établit le patron que les neuf suivantes vont décliner sur d'autres stacks — le chapitre 20 introduit une variante backend avec NestJS.

---

⬅️ [Chapitre 18 — Méthodologie professionnelle de diagnostic](18-methodologie-diagnostic.md) · ➡️ **Suite : Chapitre 20 — Étude de cas : React + NestJS**
