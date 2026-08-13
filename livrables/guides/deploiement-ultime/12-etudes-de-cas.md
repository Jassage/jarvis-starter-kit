# Partie 12 — Études de cas complètes

> 🎯 **Objectifs d'apprentissage**
> Cette dernière partie ne présente aucune notion nouvelle : elle assemble tout ce qui a été appris dans les Parties 1 à 11 en trois parcours complets, du serveur totalement vierge jusqu'à une application réellement accessible en HTTPS, sauvegardée et surveillée. L'objectif est de vérifier que chaque brique isolée (Linux, nginx, SSL, base de données, PM2/Docker, sécurité, maintenance) s'articule correctement avec les autres dans un vrai projet de bout en bout — pas seulement en théorie, partie par partie.

Trois études de cas, choisies pour couvrir des chemins différents parmi ceux enseignés dans ce manuel :

1. **API Express + PostgreSQL + frontend React** — le cas le plus représentatif d'une application SaaS de gestion moderne, déployée directement sur le système (sans Docker).
2. **Application Next.js** — déployée via Docker Compose, pour illustrer le chemin conteneurisé de bout en bout.
3. **API Laravel + MySQL avec file d'attente** — pour illustrer le chemin PHP, sensiblement différent des deux précédents.

Chaque étude de cas référence les parties correspondantes plutôt que de tout ré-expliquer — l'objectif ici est l'enchaînement, pas la répétition.

---

## Étude de cas 1 — API Express + PostgreSQL + frontend React

### Contexte

Une application de gestion (clients, factures, tableau de bord) : un backend Express/Prisma/PostgreSQL exposant une API, et un frontend React (Vite) consommant cette API. Deux sous-domaines : `monapp.ht` (frontend) et `api.monapp.ht` (backend). Domaine déjà acheté et son enregistrement DNS de type A pointé vers l'IP du futur serveur.

### Étape 1 — Le serveur (Partie 3)

```bash
# Création du VPS Ubuntu 24.04 LTS chez l'hébergeur choisi (section 3.1-3.2)
ssh root@ADRESSE_IP                                    # 3.3
apt update && apt upgrade -y && reboot                 # 3.4

# Après reconnexion :
adduser jaslin
usermod -aG sudo jaslin                                 # 3.5
exit
ssh-keygen -t ed25519 -C "jaslin@monapp"                 # 3.6, en local
ssh-copy-id jaslin@ADRESSE_IP
ssh jaslin@ADRESSE_IP                                    # confirmer connexion sans mot de passe

sudo nano /etc/ssh/sshd_config                           # PermitRootLogin no / PasswordAuthentication no (3.7)
sudo systemctl restart ssh                                # avec un second terminal ouvert en test

sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable   # 3.8
sudo apt install fail2ban -y                              # 3.9
sudo timedatectl set-timezone America/Port-au-Prince      # 3.10
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile   # 3.12
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Vérification de l'étape** : `ssh jaslin@ADRESSE_IP` fonctionne sans mot de passe, `ssh root@ADRESSE_IP` échoue, `sudo ufw status` montre uniquement 22/80/443, `free -h` montre le swap actif.

### Étape 2 — Logiciels (Partie 4)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts && nvm alias default lts/*             # 4.1

sudo apt install postgresql postgresql-contrib -y        # 4.8
sudo -u postgres psql -c "CREATE DATABASE monapp;"
sudo -u postgres psql -c "CREATE USER monapp_user WITH ENCRYPTED PASSWORD 'MOT_DE_PASSE_REEL';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE monapp TO monapp_user;"

sudo apt install nginx -y                                 # 4.13
npm install -g pm2                                        # 4.15
pm2 startup                                                # exécuter la commande générée

ssh-keygen -t ed25519 -C "serveur-monapp"                  # 4.12, Deploy Key GitHub
cat ~/.ssh/id_ed25519.pub                                  # à coller dans GitHub > Deploy Keys du dépôt
ssh -T git@github.com                                       # confirmer
```

**Vérification** : `node -v`, `psql -U monapp_user -d monapp -h localhost -W` réussit, page nginx par défaut visible sur `http://ADRESSE_IP`.

### Étape 3 — Sécurisation de PostgreSQL (Partie 9)

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
# vérifier : host monapp monapp_user 127.0.0.1/32 scram-sha-256   (jamais trust)
sudo systemctl restart postgresql
```

### Étape 4 — Déploiement du backend (Partie 5, section 5.7)

```bash
git clone git@github.com:tonorg/monapp-backend.git ~/backend
cd ~/backend
npm ci
cp .env.example .env
nano .env
# DATABASE_URL=postgresql://monapp_user:MOT_DE_PASSE_REEL@localhost:5432/monapp
# JWT_SECRET=$(openssl rand -hex 32)
# CORS_ORIGINS=https://monapp.ht
# PORT=4000

npx prisma migrate deploy                                 # avant tout démarrage (5.7, 9)
npm run build
pm2 start dist/server.js --name monapp-backend
pm2 save
pm2 logs monapp-backend --lines 30                         # vérifier le démarrage sans erreur
```

### Étape 5 — Déploiement du frontend (Partie 5, section 5.2)

En local, avant transfert :
```bash
# .env.production
# VITE_API_URL=https://api.monapp.ht

npm run build
rsync -avz --delete dist/ jaslin@ADRESSE_IP:~/frontend/dist/
```

### Étape 6 — Nginx, les deux sous-domaines (Partie 7)

```bash
sudo nano /etc/nginx/sites-available/monapp.ht
```
```nginx
server {
    listen 80;
    server_name monapp.ht;
    root /home/jaslin/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(css|js|jpg|jpeg|png|svg|woff2?)$ { expires 30d; add_header Cache-Control "public, immutable"; }
}

server {
    listen 80;
    server_name api.monapp.ht;
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
sudo ln -s /etc/nginx/sites-available/monapp.ht /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
**Vérification** : `curl -I http://monapp.ht` et `curl -I http://api.monapp.ht` répondent `200`.

### Étape 7 — HTTPS (Partie 8)

```bash
sudo certbot --nginx -d monapp.ht -d api.monapp.ht
sudo certbot renew --dry-run
```
**Vérification** : cadenas fermé sur `https://monapp.ht`, redirection automatique depuis `http://`, note SSL Labs vérifiée.

### Étape 8 — Sauvegardes automatiques (Partie 9)

```bash
mkdir -p ~/scripts
nano ~/scripts/backup-db.sh
```
```bash
#!/bin/bash
set -e
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_DIR="/var/backups/monapp"
mkdir -p "$BACKUP_DIR"
pg_dump -U monapp_user -d monapp -F c -f "$BACKUP_DIR/monapp_$DATE.dump"
find "$BACKUP_DIR" -name "*.dump" -mtime +14 -delete
rclone copy "$BACKUP_DIR/monapp_$DATE.dump" remote:MonApp-Backups/
```
```bash
chmod +x ~/scripts/backup-db.sh
crontab -e
# 0 2 * * * /home/jaslin/scripts/backup-db.sh >> /var/log/backup-monapp.log 2>&1
./scripts/backup-db.sh    # exécution manuelle immédiate pour valider avant d'attendre le cron
```
**Vérification** : le fichier apparaît dans `/var/backups/monapp/` et sur la destination distante ; restauration testée une fois vers une base `monapp_test` (9.5).

### Étape 9 — Monitoring et maintenance (Partie 10)

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
```
Configuration d'un moniteur externe gratuit (UptimeRobot) sur `https://monapp.ht` et `https://api.monapp.ht/health` (une route de santé minimale, à prévoir côté backend si elle n'existe pas déjà).

### Checklist finale de mise en production

- [ ] `https://monapp.ht` et `https://api.monapp.ht` répondent en `200`, cadenas fermé.
- [ ] `pm2 list` montre le backend `online`, sans redémarrage en boucle.
- [ ] `npx prisma migrate status` confirme la base à jour.
- [ ] Une sauvegarde a été prise **et restaurée avec succès** sur une base de test.
- [ ] `sudo certbot renew --dry-run` réussit.
- [ ] Un moniteur externe est actif sur les deux domaines.
- [ ] `sudo ufw status` ne montre que 22/80/443.

---

## Étude de cas 2 — Application Next.js, déployée via Docker Compose

### Contexte

Une application Next.js (dashboard interne, rendu serveur) avec sa base PostgreSQL, déployée entièrement via Docker pour illustrer le chemin conteneurisé complet (Partie 6), plutôt que l'installation directe de l'étude de cas 1.

### Étape 1 — Serveur et Docker

Reprise à l'identique de l'Étude de cas 1, section "Étape 1", jusqu'à et y compris `ufw`/`fail2ban`/swap. Puis, au lieu de Node/PostgreSQL installés directement :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
exit
ssh jaslin@ADRESSE_IP
docker run hello-world                                     # 6.3, vérification
sudo apt install nginx -y                                   # nginx reste hors Docker, en reverse proxy devant
```

### Étape 2 — Dockerfile et Compose (Partie 6)

```bash
git clone git@github.com:tonorg/monapp-next.git ~/app
cd ~/app
nano Dockerfile
```
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
USER node
CMD ["npm", "start"]
```
```bash
nano docker-compose.yml
```
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://monapp_user:${DB_PASSWORD}@db:5432/monapp
      NEXT_PUBLIC_API_URL: https://dashboard.monapp.ht
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: monapp
      POSTGRES_USER: monapp_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pg-data:
```
```bash
echo "DB_PASSWORD=MOT_DE_PASSE_REEL" > .env      # jamais committé, .gitignore déjà en place
docker compose up -d --build
docker compose logs -f app                        # vérifier le démarrage
```

### Étape 3 — Nginx en reverse proxy vers le container

```nginx
server {
    listen 80;
    server_name dashboard.monapp.ht;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d dashboard.monapp.ht                # Partie 8
```

### Étape 4 — Sauvegarde de la base conteneurisée

```bash
nano ~/scripts/backup-db-docker.sh
```
```bash
#!/bin/bash
set -e
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_DIR="/var/backups/monapp-next"
mkdir -p "$BACKUP_DIR"
docker compose -f /home/jaslin/app/docker-compose.yml exec -T db \
  pg_dump -U monapp_user monapp | gzip > "$BACKUP_DIR/monapp_$DATE.sql.gz"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -delete
rclone copy "$BACKUP_DIR/monapp_$DATE.sql.gz" remote:MonApp-Next-Backups/
```
> 📌 **À retenir** — `docker compose exec -T db pg_dump ...` exécute la commande de sauvegarde **à l'intérieur** du container `db`, exactement comme les commandes directes de l'Étude de cas 1, simplement encapsulées via Docker — le reste de la logique de sauvegarde (rotation, copie distante) est strictement identique.

### Étape 5 — Redéploiement d'une nouvelle version (routine)

```bash
cd ~/app
git pull origin main
docker compose up -d --build          # rebuild uniquement ce qui a changé grâce au cache de layers (6.4)
docker compose logs -f app
```

### Checklist finale

- [ ] `docker compose ps` montre les deux services `Up`.
- [ ] Les données survivent à `docker compose down` (sans `-v`) suivi d'un `docker compose up -d`.
- [ ] Sauvegarde testée avec restauration réelle sur une base de test.
- [ ] `https://dashboard.monapp.ht` répond en HTTPS.

---

## Étude de cas 3 — API Laravel + MySQL avec file d'attente

### Contexte

Une API Laravel (traitement de commandes avec envoi d'email en tâche de fond via une file d'attente), MySQL comme base de données — pour illustrer le chemin PHP complet (Partie 5, section 5.9), sensiblement différent des deux études de cas précédentes basées sur Node.

### Étape 1 — Serveur, identique à l'Étude de cas 1 (Partie 3)

### Étape 2 — Logiciels spécifiques

```bash
sudo apt install php php-fpm php-mysql php-cli php-curl php-mbstring php-xml php-zip -y   # 4.5
sudo apt install composer -y                                                                # 5.9
sudo apt install mysql-server -y                                                            # 4.7
sudo mysql_secure_installation
sudo apt install nginx -y
```

```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE monapp;
CREATE USER 'monapp_user'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_REEL';
GRANT SELECT, INSERT, UPDATE, DELETE ON monapp.* TO 'monapp_user'@'localhost';    -- moindre privilège, 9.1
FLUSH PRIVILEGES;
```

### Étape 3 — Déploiement de l'application (Partie 5, section 5.9)

```bash
git clone git@github.com:tonorg/monapp-laravel.git ~/app
cd ~/app
composer install --no-dev --optimize-autoloader
cp .env.example .env
nano .env
# APP_ENV=production
# APP_DEBUG=false
# DB_DATABASE=monapp
# DB_USERNAME=monapp_user
# DB_PASSWORD=MOT_DE_PASSE_REEL

php artisan key:generate
php artisan migrate --force
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache
```

### Étape 4 — Nginx + php-fpm

```nginx
server {
    listen 80;
    server_name api.monapp.ht;
    root /home/jaslin/app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    }
}
```
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.monapp.ht
```

### Étape 5 — Worker de file d'attente (Partie 5, section 5.9)

```bash
sudo nano /etc/systemd/system/monapp-worker.service
```
```ini
[Unit]
Description=Laravel Queue Worker - monapp

[Service]
User=www-data
WorkingDirectory=/home/jaslin/app
ExecStart=/usr/bin/php /home/jaslin/app/artisan queue:work --sleep=3 --tries=3
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now monapp-worker
sudo systemctl status monapp-worker
```

### Étape 6 — Sauvegardes MySQL (Partie 9)

```bash
nano ~/scripts/backup-db.sh
```
```bash
#!/bin/bash
set -e
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_DIR="/var/backups/monapp-laravel"
mkdir -p "$BACKUP_DIR"
mysqldump -u monapp_user -p'MOT_DE_PASSE_REEL' --single-transaction monapp | gzip > "$BACKUP_DIR/monapp_$DATE.sql.gz"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -delete
rclone copy "$BACKUP_DIR/monapp_$DATE.sql.gz" remote:MonApp-Laravel-Backups/
```
```bash
chmod +x ~/scripts/backup-db.sh
crontab -e
# 0 2 * * * /home/jaslin/scripts/backup-db.sh >> /var/log/backup-monapp.log 2>&1
```

### Étape 7 — Déploiement d'une mise à jour (routine)

```bash
cd ~/app
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
sudo systemctl restart monapp-worker      # le worker doit être redémarré pour charger le nouveau code, contrairement à php-fpm qui relit les fichiers PHP à chaque requête
```
> ⚠️ **Attention, piège spécifique à Laravel absent des stacks Node de ce manuel** — Contrairement à un process Node (qui doit toujours être explicitement redémarré après un déploiement), php-fpm exécute le code PHP à la demande et **charge naturellement la nouvelle version à la prochaine requête**, sans redémarrage nécessaire pour l'application web elle-même. En revanche, le **worker de file d'attente** (`monapp-worker`) est un process PHP de longue durée, comme un process Node : il continue d'exécuter l'ancien code en mémoire tant qu'il n'est pas explicitement redémarré. Un oubli fréquent chez qui découvre Laravel après avoir pris l'habitude Node de ce manuel.

### Checklist finale

- [ ] `APP_DEBUG=false` confirmé en production.
- [ ] `sudo systemctl status monapp-worker` actif, sans boucle de redémarrage.
- [ ] Sauvegarde MySQL testée avec restauration réelle.
- [ ] Un redéploiement de test confirme que le worker redémarre bien après chaque `git pull`.

---

## 📝 Résumé de la partie — et du manuel dans son ensemble

Les trois études de cas partagent la même ossature, indépendamment de la technologie : **serveur préparé et sécurisé (Partie 3) → logiciels installés (Partie 4) → application déployée selon sa famille, statique ou process (Partie 5, éventuellement via Docker, Partie 6) → nginx en reverse proxy (Partie 7) → HTTPS (Partie 8) → base de données sécurisée et sauvegardée (Partie 9) → surveillance et maintenance mises en place dès le premier jour (Partie 10)**, avec la Partie 11 comme filet de sécurité permanent en cas d'imprévu.

C'est cette ossature — pas telle ou telle commande précise — qui constitue la vraie compétence acquise par ce manuel. Une technologie non couverte explicitement ici (un nouveau framework qui n'existait pas encore à l'écriture de ce manuel, par exemple) s'aborde avec exactement la même démarche : identifier sa famille de déploiement (Partie 5, section 5.0), l'installer, la superviser, la mettre derrière nginx, la sécuriser, la sauvegarder, la surveiller.

## ✅ Checklist finale de fin de manuel

- [ ] Je peux dérouler de mémoire l'ossature en sept étapes ci-dessus, sans notes.
- [ ] J'ai réalisé au moins une étude de cas de bout en bout sur un vrai VPS, pas seulement en lecture.
- [ ] Pour chaque étape, je sais dire quelle Partie du manuel la couvre en détail si besoin d'un rappel.
- [ ] Je me sens capable de déployer une technologie non explicitement traitée dans ce manuel en appliquant la même méthode.

## 🧪 Mini-labo final

Choisis un projet réel (le tien, ou l'un de ceux de ton portefeuille) et déroule son propre parcours de déploiement complet sur un VPS de test, en écrivant — au fur et à mesure, pas après coup — ton propre document récapitulatif à la manière des trois études de cas ci-dessus. Ce document devient ton propre runbook pour ce projet précis, réutilisable pour chaque déploiement futur.

## ❓ FAQ

**Pourquoi ces trois études de cas précisément, et pas une par techno couverte en Partie 5 ?**
Parce que la Partie 5 a déjà montré, techno par techno, les différences de surface (build, variables d'environnement, commande de lancement). L'objectif de cette dernière partie est différent : montrer que l'**enchaînement complet** entre toutes les parties du manuel fonctionne de bout en bout, sur des chemins suffisamment distincts (direct sur le système, conteneurisé, PHP) pour couvrir la quasi-totalité des situations réelles.

**Une fois ce manuel terminé, que faire ensuite ?**
Reprendre l'aide-mémoire opérationnel du même dossier (`../deploiement-serveur.md`) comme référence rapide au quotidien — il condense l'essentiel sans repasser par toute la pédagogie de ce manuel, désormais acquise. Au-delà, approfondir un sujet précis selon les besoins réels rencontrés (monitoring avancé, haute disponibilité, orchestration multi-serveurs) devient nettement plus accessible une fois ces fondations solidement en place.

---

⬅️ [Partie 11 — Dépannage](11-depannage.md) · [Retour au sommaire](README.md)

---

*Fin du Guide Ultime du Déploiement. Bâti partie par partie avec Jaslin, sur son portefeuille réel de projets, à partir du 2026-07-27.*
